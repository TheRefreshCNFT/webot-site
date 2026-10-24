from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "assets" / "ocr"
W, H = 1440, 900
CARBON = "#171915"
INK = "#232620"
PAPER = "#f4f1e8"
MUTED = "#6b7067"
LIME = "#c8f55a"
WHITE = "#fffdf7"
KEY_SIZE = 64
DETAIL_SIZE = 60
SAMPLE_SIZE = 40


def font(size):
    return ImageFont.load_default(size=size)


def label(draw, xy, text, fill=INK, size=DETAIL_SIZE):
    draw.text(xy, text, font=font(size), fill=fill)


def save(image, name):
    OUT.mkdir(parents=True, exist_ok=True)
    image.save(OUT / name, format="PNG", optimize=True)


def source_document():
    image = Image.new("RGB", (W, H), PAPER)
    draw = ImageDraw.Draw(image)
    draw.rounded_rectangle((72, 48, 1368, 852), radius=24, fill=WHITE, outline="#d8d5cc", width=2)
    draw.rounded_rectangle((120, 88, 500, 156), radius=12, fill=LIME)
    label(draw, (144, 102), "SAMPLE INVOICE", size=SAMPLE_SIZE)
    label(draw, (120, 220), "Northstar Office Supply", size=KEY_SIZE)
    draw.line((120, 340, 1320, 340), fill="#c9c7bf", width=2)
    label(draw, (120, 430), "INVOICE NUMBER", MUTED, DETAIL_SIZE)
    label(draw, (120, 535), "INV-1042", size=KEY_SIZE)
    label(draw, (780, 430), "TOTAL", MUTED, DETAIL_SIZE)
    label(draw, (780, 535), "$699.00 USD", size=KEY_SIZE)
    save(image, "source-document.png")


def structured_output():
    image = Image.new("RGB", (W, H), CARBON)
    draw = ImageDraw.Draw(image)
    draw.rounded_rectangle((72, 48, 1368, 852), radius=24, fill=INK, outline="#41463d", width=2)
    draw.rounded_rectangle((120, 88, 640, 156), radius=12, fill=LIME)
    label(draw, (144, 102), "ILLUSTRATIVE EXAMPLE", CARBON, SAMPLE_SIZE)
    label(draw, (120, 205), "Structured invoice", LIME, size=KEY_SIZE)
    fields = [("vendor", "Northstar Office Supply"), ("invoice_number", "INV-1042"), ("total", "699.00 USD"), ("review_status", "Needs confirmation")]
    y = 320
    for key, value in fields:
        draw.rounded_rectangle((120, y, 1320, y + 100), radius=10, fill="#2d312a")
        label(draw, (150, y + 22), key, "#aeb4a8", size=KEY_SIZE)
        label(draw, (680, y + 22), value, WHITE if key != "review_status" else LIME, DETAIL_SIZE)
        y += 128
    save(image, "structured-output.png")


if __name__ == "__main__":
    source_document()
    structured_output()
    print("Wrote two 1440x900 OCR artwork files")
