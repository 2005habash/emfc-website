import AppKit
import CoreImage
import Foundation
import Vision

// Turns member photos into site portraits: background removed onto white, a 1024 x 1024 square,
// head about 55% of the height with the top of the hair about 7% from the top, face centred.
// Usage (macOS 14+):
//   swift tools/portraits.swift <manifest.json>
// The manifest is a JSON list of { "in": "<photo>", "out": "<portrait.jpg>", "crop": [x, y, w, h] },
// where "crop" is optional and cuts the photo first (pixels, from the top left), for screenshots.

struct Job: Decodable {
    let `in`: String
    let out: String
    let crop: [Double]?
}

let side = 1024.0
let headShare = 0.55  // head height (top of hair to chin) / square side
let topMargin = 0.07  // space above the hair / square side
let context = CIContext(options: [.workingColorSpace: CGColorSpace(name: CGColorSpace.sRGB)!])

func load(_ path: String, crop: [Double]?) -> CIImage? {
    guard var image = CIImage(contentsOf: URL(fileURLWithPath: path), options: [.applyOrientationProperty: true]) else {
        return nil
    }
    image = image.transformed(by: CGAffineTransform(translationX: -image.extent.minX, y: -image.extent.minY))
    if let c = crop, c.count == 4 {
        let rect = CGRect(x: c[0], y: image.extent.height - c[1] - c[3], width: c[2], height: c[3])
        image = image.cropped(to: rect).transformed(by: CGAffineTransform(translationX: -rect.minX, y: -rect.minY))
    }
    return image
}

/// Value of a one-channel pixel buffer at a pixel position (rows from the top).
func sample<T>(_ buffer: CVPixelBuffer, _ type: T.Type, x: Int, y: Int) -> T {
    CVPixelBufferLockBaseAddress(buffer, .readOnly)
    defer { CVPixelBufferUnlockBaseAddress(buffer, .readOnly) }
    let row = CVPixelBufferGetBaseAddress(buffer)! + y * CVPixelBufferGetBytesPerRow(buffer)
    return row.assumingMemoryBound(to: T.self)[x]
}

/// Topmost row (from the top) where the person's mask covers any column in `columns`.
func topOfMask(_ mask: CVPixelBuffer, columns: ClosedRange<Int>, below start: Int) -> Int? {
    CVPixelBufferLockBaseAddress(mask, .readOnly)
    defer { CVPixelBufferUnlockBaseAddress(mask, .readOnly) }
    let base = CVPixelBufferGetBaseAddress(mask)!
    let stride = CVPixelBufferGetBytesPerRow(mask)
    let width = CVPixelBufferGetWidth(mask)
    let height = CVPixelBufferGetHeight(mask)
    let lo = max(0, columns.lowerBound), hi = min(width - 1, columns.upperBound)
    guard lo <= hi else { return nil }
    for y in max(0, start)..<height {
        let row = (base + y * stride).assumingMemoryBound(to: Float32.self)
        var x = lo
        while x <= hi {
            if row[x] > 0.5 { return y }
            x += 2
        }
    }
    return nil
}

func process(_ job: Job) throws -> String {
    guard let image = load(job.in, crop: job.crop) else { return "cannot read" }
    let W = image.extent.width, H = image.extent.height

    let handler = VNImageRequestHandler(ciImage: image)
    let faces = VNDetectFaceRectanglesRequest()
    let people = VNGenerateForegroundInstanceMaskRequest()
    try handler.perform([faces, people])

    guard let face = faces.results?.max(by: { $0.boundingBox.width * $0.boundingBox.height < $1.boundingBox.width * $1.boundingBox.height }) else {
        return "no face found"
    }
    guard let found = people.results?.first else { return "no person found" }

    // Keep only the person whose mask contains the face, so people behind them drop out.
    let labels = found.instanceMask
    let lx = Int(face.boundingBox.midX * Double(CVPixelBufferGetWidth(labels)))
    let ly = Int((1 - face.boundingBox.midY) * Double(CVPixelBufferGetHeight(labels)))
    let label = Int(sample(labels, UInt8.self, x: min(lx, CVPixelBufferGetWidth(labels) - 1), y: min(ly, CVPixelBufferGetHeight(labels) - 1)))
    let instances = label > 0 ? IndexSet(integer: label) : found.allInstances

    let cutout = CIImage(cvPixelBuffer: try found.generateMaskedImage(ofInstances: instances, from: handler, croppedToInstancesExtent: false))
    let mask = try found.generateScaledMaskForImage(forInstances: instances, from: handler)

    // Face box in pixels, rows from the top.
    let fx = face.boundingBox.minX * W, fw = face.boundingBox.width * W
    let fTop = (1 - face.boundingBox.maxY) * H, fBottom = (1 - face.boundingBox.minY) * H
    let fh = fBottom - fTop
    let cx = fx + fw / 2

    // Top of the hair: the highest point of the person above the face, within the face's width.
    let maskScale = Double(CVPixelBufferGetHeight(mask)) / H
    let columns = Int((cx - fw * 0.45) * maskScale)...Int((cx + fw * 0.45) * maskScale)
    let searchFrom = Int(max(0, fTop - fh * 1.2) * maskScale)
    var hairTop = Double(topOfMask(mask, columns: columns, below: searchFrom) ?? Int((fTop - fh * 0.35) * maskScale)) / maskScale
    hairTop = min(max(hairTop, fTop - fh * 0.9), fTop - fh * 0.1)

    let chin = fBottom
    let head = chin - hairTop
    var square = head / headShare

    // Where the photo cuts the person off: a flat bottom edge, or a straight edge at either side,
    // as in tight head-and-shoulders crops. The square stops there, so the portrait never shows a
    // body ending in a hard line with white beyond it. The head then fills a little more of the frame.
    CVPixelBufferLockBaseAddress(mask, .readOnly)
    let mBase = CVPixelBufferGetBaseAddress(mask)!, mStride = CVPixelBufferGetBytesPerRow(mask)
    let mW = CVPixelBufferGetWidth(mask), mH = CVPixelBufferGetHeight(mask)
    func on(_ x: Int, _ y: Int) -> Bool { (mBase + y * mStride).assumingMemoryBound(to: Float32.self)[x] > 0.5 }
    func edges(_ y: Int) -> (Int, Int, Int)? {  // leftmost, rightmost, count of person pixels in a row
        var l = -1, r = -1, n = 0
        for x in 0..<mW where on(x, y) { if l < 0 { l = x }; r = x; n += 1 }
        return l < 0 ? nil : (l, r, n)
    }
    // The lowest row that is clearly body (not a stray pixel of the mask).
    var bottom = mH - 1
    while bottom > 0 && (edges(bottom)?.2 ?? 0) < Int(0.3 * fw * maskScale) { bottom -= 1 }
    let band = stride(from: bottom, to: max(0, bottom - Int(0.45 * fh * maskScale)), by: -2).compactMap { edges($0) }
    if !band.isEmpty {
        let lefts = band.map { $0.0 }, rights = band.map { $0.1 }
        let straight = 0.012 * fw * maskScale  // an edge that moves less than this is a cut, not a shoulder
        if Double(lefts.max()! - lefts.min()!) < straight {
            square = min(square, 2 * (cx - Double(lefts.min()!) / maskScale))
        }
        if Double(rights.max()! - rights.min()!) < straight {
            square = min(square, 2 * (Double(rights.max()!) / maskScale - cx))
        }
    }
    CVPixelBufferUnlockBaseAddress(mask, .readOnly)
    square = max(square, head / 0.85)
    // Last, and always: the square ends where the body does, so every torso reaches the bottom edge.
    square = min(square, (Double(bottom) / maskScale - hairTop) / (1 - topMargin))

    let top = hairTop - topMargin * square
    let left = cx - square / 2
    let cropRect = CGRect(x: left, y: H - (top + square), width: square, height: square)

    let white = CIImage(color: .white).cropped(to: cropRect.union(image.extent))
    let framed = cutout.composited(over: white).cropped(to: cropRect)
        .transformed(by: CGAffineTransform(translationX: -cropRect.minX, y: -cropRect.minY))
    let scale = side / square
    let scaled = framed.applyingFilter("CILanczosScaleTransform", parameters: [kCIInputScaleKey: scale, kCIInputAspectRatioKey: 1.0])
        .cropped(to: CGRect(x: 0, y: 0, width: side, height: side))

    let outURL = URL(fileURLWithPath: job.out)
    try FileManager.default.createDirectory(at: outURL.deletingLastPathComponent(), withIntermediateDirectories: true)
    try context.writeJPEGRepresentation(
        of: scaled, to: outURL, colorSpace: CGColorSpace(name: CGColorSpace.sRGB)!,
        options: [CIImageRepresentationOption(rawValue: kCGImageDestinationLossyCompressionQuality as String): 0.86])

    let faceCount = faces.results?.count ?? 0
    let note = square < 700 ? "  soft: crop is \(Int(square)) px, upscaled" : ""
    return "ok  crop \(Int(square)) px, \(faceCount) face(s)\(note)"
}

let args = CommandLine.arguments
guard args.count == 2, let data = FileManager.default.contents(atPath: args[1]),
    let jobs = try? JSONDecoder().decode([Job].self, from: data)
else {
    print("usage: swift tools/portraits.swift <manifest.json>")
    exit(1)
}
var failed = 0
for job in jobs {
    let name = URL(fileURLWithPath: job.out).lastPathComponent
    do {
        let result = try process(job)
        if !result.hasPrefix("ok") { failed += 1 }
        print("\(name): \(result)")
    } catch {
        failed += 1
        print("\(name): error \(error)")
    }
}
print("\(jobs.count - failed) of \(jobs.count) done")
exit(failed == 0 ? 0 : 2)
