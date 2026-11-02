import Foundation
import Vision
import CoreImage
import AppKit

// Cuts the person out of a photo and places them on a white background.
// Usage: swift tools/cutout.swift <input photo> <output.png>   (macOS 14+)
let args = CommandLine.arguments
guard args.count == 3, let input = CIImage(contentsOf: URL(fileURLWithPath: args[1])) else { print("usage: swift tools/cutout.swift in.jpg out.png"); exit(1) }
let handler = VNImageRequestHandler(ciImage: input)
let request = VNGenerateForegroundInstanceMaskRequest()
try handler.perform([request])
guard let result = request.results?.first else { print("no subject"); exit(2) }
let buffer = try result.generateMaskedImage(ofInstances: result.allInstances, from: handler, croppedToInstancesExtent: false)
let out = CIImage(cvPixelBuffer: buffer).composited(over: CIImage(color: .white).cropped(to: input.extent))
guard let cg = CIContext().createCGImage(out, from: input.extent) else { exit(3) }
try NSBitmapImageRep(cgImage: cg).representation(using: .png, properties: [:])!.write(to: URL(fileURLWithPath: args[2]))
print("ok \(result.allInstances.count) subject(s)")
