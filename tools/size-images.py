# Makes smaller WebP copies of the site's pictures, at the widths the pages actually show them, and
# writes src/data/sized-images.ts, the list of copies the pages may ask for. A phone then downloads a
# 15 KB portrait instead of the 140 KB original. Run it after adding or replacing a portrait, a hero
# photo, an event photo or the logo:
#   python3 tools/size-images.py
# Needs Pillow (pip install pillow). The originals are never changed. Copies go to
# public/images/sized/, mirroring public/images/: a copy is only made again when its original is newer,
# and the copies of a deleted original are removed. A picture this script hasn't seen still works: the
# page just shows the original.
import glob
import os
import sys

from PIL import Image

ROOT = "public/images"
OUT = os.path.join(ROOT, "sized")
MANIFEST = "src/data/sized-images.ts"

# Which pictures, the widths of their copies (a width beyond the original's becomes the original's),
# and the WebP quality. The wide photos sit behind text or a navy veil, so they take a little less.
SETS = [
    ("team/*.jpg", [320, 640, 1024], 80),  # portraits: the moving strip, the cards, the profile
    ("barcelona/*.jpg", [640, 960, 1280, 1600], 72),  # hero photos, shown across the page
    ("team-group.jpg", [640, 960, 1280, 1920], 72),
    ("events/*/photo-*.jpg", [480, 800, 1200], 80),
    ("events/*/recap-*.jpg", [480, 640, 900], 80),
    ("logo/bull-mark.png", [176, 560], 80),  # the menu's bull is about 50 px tall; kept lossless
]

# The homepage's hero on a phone: the tall screen shows only a narrow slice of the wide photo, so phones
# get that slice alone, less than half the bytes for the same picture. (file, where the page centres
# the photo across its width, which must match its object-position in src/routes/index.tsx, and the
# slice's width in the original's pixels.)
PHONE_SLICES = [("barcelona/placa-espanya.jpg", 0.62, 720)]

# The browser tab's icon and the phone home-screen icon, from the bull on its navy tile. These stay
# PNG, which every browser and phone reads as an icon.
ICONS = ("logo/bull-tile.png", [(48, "icon-48.png"), (192, "icon-192.png"), (180, "apple-touch-icon.png")])


def copies_of(path, widths, quality):
    """Makes the copies of one picture that are missing or out of date; returns their widths."""
    rel = os.path.relpath(path, ROOT)
    stem = os.path.join(OUT, os.path.splitext(rel)[0])
    os.makedirs(os.path.dirname(stem), exist_ok=True)
    with Image.open(path) as image:
        made = []
        for width in sorted({min(w, image.width) for w in widths}):
            out = f"{stem}-{width}.webp"
            made.append(width)
            if os.path.exists(out) and os.path.getmtime(out) >= os.path.getmtime(path):
                continue
            copy = image if width == image.width else image.resize(
                (width, round(image.height * width / image.width)), Image.LANCZOS
            )
            if copy.mode in ("RGBA", "LA", "P"):
                # The logo: transparent, and never recoloured, so it is kept exactly.
                copy.convert("RGBA").save(out, "WEBP", lossless=True, method=6)
            else:
                copy.convert("RGB").save(out, "WEBP", quality=quality, method=6)
        return made


def main():
    if not os.path.isdir(ROOT):
        sys.exit("Run this from the project folder: python3 tools/size-images.py")
    sized, keep = {}, set()
    for pattern, widths, quality in SETS:
        for path in sorted(glob.glob(os.path.join(ROOT, pattern))):
            made = copies_of(path, widths, quality)
            rel = os.path.relpath(path, ROOT)
            sized["/images/" + rel.replace(os.sep, "/")] = made
            keep |= {os.path.join(OUT, f"{os.path.splitext(rel)[0]}-{w}.webp") for w in made}

    slices = {}
    for rel, focus, width in PHONE_SLICES:
        path = os.path.join(ROOT, rel)
        if not os.path.exists(path):
            continue
        out = os.path.join(OUT, os.path.splitext(rel)[0] + "-phone.webp")
        keep.add(out)
        slices["/images/" + rel] = "/images/sized/" + os.path.splitext(rel)[0] + "-phone.webp"
        if not os.path.exists(out) or os.path.getmtime(out) < os.path.getmtime(path):
            with Image.open(path) as image:
                left = round((image.width - width) * focus)
                image.crop((left, 0, left + width, image.height)).convert("RGB").save(out, "WEBP", quality=72, method=6)

    tile, icons = ICONS
    if os.path.exists(os.path.join(ROOT, tile)):
        os.makedirs(os.path.join(OUT, "logo"), exist_ok=True)
        with Image.open(os.path.join(ROOT, tile)) as image:
            for size, name in icons:
                out = os.path.join(OUT, "logo", name)
                if not os.path.exists(out) or os.path.getmtime(out) < os.path.getmtime(os.path.join(ROOT, tile)):
                    image.convert("RGB").resize((size, size), Image.LANCZOS).save(out, "PNG", optimize=True)
            # /favicon.ico, for the browsers and crawlers that ask for it by that name.
            ico = os.path.join("public", "favicon.ico")
            if not os.path.exists(ico) or os.path.getmtime(ico) < os.path.getmtime(os.path.join(ROOT, tile)):
                image.convert("RGB").save(ico, "ICO", sizes=[(16, 16), (32, 32), (48, 48)])

    # Copies whose original is gone (a member who left, a replaced photo with a new name).
    removed = 0
    for old in glob.glob(os.path.join(OUT, "**", "*.webp"), recursive=True):
        if old not in keep:
            os.remove(old)
            removed += 1

    lines = [
        "// Generated by tools/size-images.py. Do not edit by hand: run `python3 tools/size-images.py`.",
        "// Each picture that has smaller WebP copies in public/images/sized/, and the copies' widths.",
        "// src/lib/images.ts turns this into the srcset of an <img>.",
        "",
        "export const SIZED: Record<string, number[]> = {",
    ]
    lines += [f'  "{src}": [{", ".join(map(str, widths))}],' for src, widths in sorted(sized.items())]
    lines += [
        "};",
        "",
        "/** The slice of a wide photo that a phone's tall screen shows, for the pictures that have one. */",
        "export const PHONE_SLICES: Record<string, string> = {",
    ]
    lines += [f'  "{src}": "{out}",' for src, out in sorted(slices.items())]
    lines += ["};", ""]
    with open(MANIFEST, "w", encoding="utf-8") as f:
        f.write("\n".join(lines))

    originals = sum(os.path.getsize(os.path.join(ROOT, src[len("/images/"):])) for src in sized)
    copies = sum(os.path.getsize(p) for p in keep)
    print(
        f"{len(sized)} pictures ({originals // 1024} KB), {len(keep)} copies ({copies // 1024} KB)"
        + (f", {removed} old copies removed" if removed else "")
    )


if __name__ == "__main__":
    main()
