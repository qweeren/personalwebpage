"""Make web copies of the camera originals for /photography.

Originals go in static/photos/ (git-ignored, they're 8-12 MB each). This writes
static/photography/{thumb,full}/<name>.jpg and src/lib/photos.json, which the
gallery reads. Run it again after adding or removing photos:

    python scripts/photos.py
"""

import json
from pathlib import Path

from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "static" / "photos"
OUT = ROOT / "static" / "photography"
MANIFEST = ROOT / "src" / "lib" / "photos.json"
SIZES = {"thumb": 1100, "full": 2600}  # long edge, px


def settings(path):
    """When it was taken and how, from the camera's EXIF."""
    exif = Image.open(path).getexif().get_ifd(0x8769)
    out = {}
    if taken := exif.get(36867):
        out["taken"] = str(taken)[:10].replace(":", "-")
    parts = []
    if t := exif.get(33434):
        t = float(t)
        parts.append(f"1/{round(1 / t)}" if t < 1 else f"{t:g}s")
    if f := exif.get(33437):
        parts.append(f"f/{float(f):g}")
    if iso := exif.get(34855):
        parts.append(f"iso {iso}")
    if mm := exif.get(37386):
        parts.append(f"{float(mm):g}mm")
    if parts:
        out["exif"] = " · ".join(parts)
    return out


# alt texts are written by hand in the manifest; keep them across runs
alts = {}
if MANIFEST.exists():
    alts = {p["name"]: p.get("alt", "") for p in json.loads(MANIFEST.read_text(encoding="utf-8"))}

photos = []
for src in sorted(p for p in SRC.iterdir() if p.suffix.lower() in {".jpg", ".jpeg", ".png", ".webp"}):
    im = ImageOps.exif_transpose(Image.open(src)).convert("RGB")
    name = src.stem.lower().lstrip("_") + ".jpg"
    for size, edge in SIZES.items():
        out = OUT / size / name
        out.parent.mkdir(parents=True, exist_ok=True)
        copy = im.copy()
        copy.thumbnail((edge, edge), Image.LANCZOS)
        copy.save(out, "JPEG", quality=84 if size == "full" else 80, optimize=True, progressive=True)
    photos.append({"name": name, "w": im.width, "h": im.height, "alt": alts.get(name, ""), **settings(src)})
    print(f"{src.name} -> {name} ({im.width}x{im.height})")

MANIFEST.write_text(json.dumps(photos, indent="\t", ensure_ascii=False) + "\n", encoding="utf-8")
print(f"{len(photos)} photos -> {MANIFEST.relative_to(ROOT)}")
