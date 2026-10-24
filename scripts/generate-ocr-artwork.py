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


def font(size):
    return ImageFont.load_default(size=size)


def label(draw, xy, text, fill=INK, size=28):
    draw.text(xy, text, font=font(size), fill=fill)


def save(image, name):
    OUT.mkdir(parents=True, exist_ok=True)
    image.save(OUT / name, format="PNG", optimize=True)


def source_document():
    image = Image.new("RGB", (W, H), PAPER)
    draw = ImageDraw.Draw(image)
    draw.rounded_rectangle((96, 64, 1344, 836), radius=24, fill=WHITE, outline="#d8d5cc", width=2)
    draw.rounded_rectangle((144, 112, 356, 164), radius=12, fill=LIME)
    label(draw, (168, 125), "SAMPLE INVOICE", size=24)
    label(draw, (144, 214), "Northstar Office Supply", size=46)
    label(draw, (144, 282), "Invoice  INV-1042", MUTED, 28)
    label(draw, (930, 214), "Issued  14 Oct 2026", INK, 28)
    label(draw, (930, 264), "Due     28 Oct 2026", INK, 28)
    draw.line((144, 354, 1296, 354), fill="#c9c7bf", width=2)
    label(draw, (144, 394), "DESCRIPTION", MUTED, 22)
    label(draw, (1080, 394), "AMOUNT", MUTED, 22)
    rows = [("Recycled copy paper · 12 cases", "$468.00"), ("Filing folders · 8 boxes", "$196.00"), ("Delivery", "$35.00")]
    y = 458
    for description, amount in rows:
        label(draw, (144, y), description, INK, 28)
        label(draw, (1080, y), amount, INK, 28)
        y += 76
    draw.line((144, 704, 1296, 704), fill="#c9c7bf", width=2)
    label(draw, (920, 746), "TOTAL", MUTED, 24)
    label(draw, (1080, 738), "$699.00", INK, 38)
    save(image, "source-document.png")


def structured_output():
    image = Image.new("RGB", (W, H), CARBON)
    draw = ImageDraw.Draw(image)
    draw.rounded_rectangle((96, 64, 1344, 836), radius=24, fill=INK, outline="#41463d", width=2)
    draw.rounded_rectangle((144, 112, 438, 164), radius=12, fill=LIME)
    label(draw, (168, 125), "ILLUSTRATIVE EXAMPLE", CARBON, 22)
    label(draw, (144, 214), "Structured invoice fields", LIME, 46)
    label(draw, (144, 282), "Requested fields organized for review", "#b9beb4", 28)
    fields = [("vendor", "Northstar Office Supply"), ("invoice_number", "INV-1042"), ("issue_date", "2026-10-14"), ("due_date", "2026-10-28"), ("total", "699.00 USD"), ("review_status", "Needs confirmation")]
    y = 372
    for key, value in fields:
        draw.rounded_rectangle((144, y - 12, 1296, y + 50), radius=10, fill="#2d312a")
        label(draw, (172, y), key, "#aeb4a8", 24)
        label(draw, (620, y), value, WHITE if key != "review_status" else LIME, 26)
        y += 72
    save(image, "structured-output.png")


if __name__ == "__main__":
    source_document()
    structured_output()
    print("Wrote two 1440x900 OCR artwork files")
