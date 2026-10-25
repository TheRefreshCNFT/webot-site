from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "assets" / "proof"
W, H = 1740, 950

BG = "#e9e7e1"
PANEL = "#ffffff"
BORDER = "#d6d3cb"
INK = "#1d1f1c"
MUTED = "#6b7067"
DARK = "#1f2a24"
RED = "#b3372f"
SOFT_GREEN = "#e3efd9"
GREEN = "#2e5b34"
SOFT_BLUE = "#e0e9f2"
BLUE = "#274f73"
SOFT_AMBER = "#f4ead6"
AMBER = "#7a5b1e"


def font(size):
    return ImageFont.load_default(size=size)


def rr(d, box, r, fill=None, outline=None, width=1):
    d.rounded_rectangle(box, radius=r, fill=fill, outline=outline, width=width)


def main():
    im = Image.new("RGB", (W, H), BG)
    d = ImageDraw.Draw(im)
    f_title = font(34)
    f_h = font(24)
    f_b = font(22)
    f_s = font(20)
    f_xs = font(18)

    # Top bar
    d.rectangle([0, 0, W, 84], fill=PANEL, outline=BORDER)
    d.text((28, 26), "Conversations", font=f_title, fill=INK)
    rr(d, (620, 22, 980, 62), 6, fill="#f2f1ec", outline=BORDER)
    d.text((640, 33), "Search leads, messages, or listings", font=f_s, fill=MUTED)
    rr(d, (1000, 22, 1160, 62), 6, fill=DARK)
    d.text((1032, 33), "Save view", font=f_s, fill="#ffffff")
    d.text((1188, 33), "Clear", font=f_s, fill=MUTED)

    # Saved views row
    d.text((28, 108), "Saved views", font=f_h, fill=INK)
    views = ["All conversations", "Needs follow-up", "Scheduled", "Archived"]
    x = 205
    for i, v in enumerate(views):
        wpx = f_s.getlength(v) + 36
        rr(d, (x, 100, x + wpx, 142), 6, fill=PANEL, outline=BORDER)
        d.text((x + 18, 111), v, font=f_s, fill=INK if i == 0 else MUTED)
        x += wpx + 16
    d.text((28, 160), "Channel: SMS  Email   |   Direction: All   |   Status: Open  Follow-up scheduled", font=f_s, fill=MUTED)

    # Left column: pipeline
    lx, ly, lw = 28, 205, 430
    d.rectangle([lx, ly, lx + lw, H - 28], fill=PANEL, outline=BORDER)
    d.text((lx + 20, ly + 16), "Pipeline", font=f_h, fill=INK)
    leads = [
        ("Jordan Example", "Example Harbor Way #100", "Follow-up scheduled", SOFT_GREEN, GREEN),
        ("Casey Sample", "Example Harbor Way #107", "Contacted", SOFT_BLUE, BLUE),
        ("Riley Demo", "Example Harbor Way #114", "Matched", SOFT_BLUE, BLUE),
        ("Morgan Placeholder", "Example Harbor Way #121", "New inquiry", SOFT_AMBER, AMBER),
        ("Taylor Illustrative", "Example Harbor Way #128", "New inquiry", SOFT_AMBER, AMBER),
        ("Alex Fictional", "Example Harbor Way #135", "Archived", "#eeeeec", MUTED),
    ]
    y = ly + 58
    for name, prop, stage, bgc, fgc in leads:
        rr(d, (lx + 16, y, lx + lw - 16, y + 86), 8, fill="#f7f6f2", outline=BORDER)
        d.text((lx + 32, y + 12), name, font=f_b, fill=INK)
        d.text((lx + 32, y + 46), prop, font=f_xs, fill=MUTED)
        bw = f_xs.getlength(stage) + 24
        rr(d, (lx + lw - 32 - bw, y + 14, lx + lw - 32, y + 44), 12, fill=bgc)
        d.text((lx + lw - 32 - bw + 12, y + 19), stage, font=f_xs, fill=fgc)
        y += 102

    # Center: conversation thread
    cx, cy, cw = 478, 205, 800
    d.rectangle([cx, cy, cx + cw, H - 28], fill=PANEL, outline=BORDER)
    d.text((cx + 20, cy + 16), "Jordan Example - 100 Example Harbor Way", font=f_h, fill=INK)
    d.text((cx + 20, cy + 48), "Synthetic lead · SMS + Email · Buyer inquiry", font=f_xs, fill=MUTED)
    d.line([cx, cy + 84, cx + cw, cy + 84], fill=BORDER, width=2)

    msgs = [
        ("lead", "Saw the new listing on Example Harbor Way. Is a showing possible this week?", "SMS · 10:02 AM"),
        ("agent", "Hi Jordan - yes, the listing is active and showings are available. I can line up times that fit your schedule.", "Agent · SMS · 10:02 AM"),
        ("lead", "Great. Also, can you send anything comparable that sold nearby?", "Email · 10:05 AM"),
        ("agent", "On it - I pulled recent comparable sales near Example Harbor Way and attached the summary here.", "Agent · Email · 10:06 AM"),
        ("system", "Follow-up scheduled: Thursday 9:00 AM if no reply by then.", "System · 10:06 AM"),
        ("lead", "This is very helpful, thank you.", "SMS · 10:09 AM"),
    ]
    y = cy + 96
    for who, text, meta in msgs:
        if who == "system":
            wpx = f_xs.getlength(text) + 32
            rr(d, (cx + (cw - wpx) // 2, y, cx + (cw + wpx) // 2, y + 36), 16, fill="#eeeeec")
            d.text((cx + (cw - wpx) // 2 + 16, y + 8), text, font=f_xs, fill=MUTED)
            y += 44
            continue
        bubble_w = cw - 160
        lines = wrap(d, text, f_b, bubble_w - 40)
        bh = 30 + 24 * len(lines) + 26
        if who == "lead":
            bx = cx + 24
            rr(d, (bx, y, bx + bubble_w, y + bh), 10, fill="#f2f1ec", outline=BORDER)
        else:
            bx = cx + cw - 24 - bubble_w
            rr(d, (bx, y, bx + bubble_w, y + bh), 10, fill=SOFT_GREEN, outline=BORDER)
        ty = y + 18
        for line in lines:
            d.text((bx + 20, ty), line, font=f_b, fill=INK)
            ty += 24
        d.text((bx + 20, y + bh - 24), meta, font=f_xs, fill=MUTED)
        y += bh + 12

    # Right column: lead card + stage timeline
    rx, ry, rw = 1298, 205, W - 1298 - 28
    d.rectangle([rx, ry, rx + rw, H - 28], fill=PANEL, outline=BORDER)
    d.text((rx + 20, ry + 16), "Lead record", font=f_h, fill=INK)
    d.text((rx + 20, ry + 54), "Jordan Example (synthetic)", font=f_b, fill=INK)
    d.text((rx + 20, ry + 88), "(555) 010-0100", font=f_s, fill=MUTED)
    d.text((rx + 20, ry + 116), "jordan@example.com", font=f_s, fill=MUTED)
    d.text((rx + 20, ry + 144), "Interested: Example Harbor Way #100", font=f_s, fill=MUTED)
    rr(d, (rx + 20, ry + 182, rx + 190, ry + 214), 12, fill=SOFT_GREEN)
    d.text((rx + 36, ry + 188), "Follow-up scheduled", font=f_xs, fill=GREEN)
    d.line([rx + 20, ry + 240, rx + rw - 20, ry + 240], fill=BORDER, width=2)
    d.text((rx + 20, ry + 254), "Stage history", font=f_b, fill=INK)
    stages = [
        ("Inquiry received", "SMS · 10:02 AM"),
        ("Matched to listing", "Rule · Example Harbor Way"),
        ("First response sent", "Agent · 10:02 AM"),
        ("Comparables delivered", "Agent · 10:06 AM"),
        ("Follow-up scheduled", "System · Thursday 9:00 AM"),
    ]
    y = ry + 292
    for i, (s, m) in enumerate(stages):
        d.ellipse([rx + 24, y + 4, rx + 40, y + 20], fill=GREEN if i < 5 else BORDER)
        if i < len(stages) - 1:
            d.line([rx + 32, y + 20, rx + 32, y + 52], fill=BORDER, width=2)
        d.text((rx + 54, y), s, font=f_s, fill=INK)
        d.text((rx + 54, y + 24), m, font=f_xs, fill=MUTED)
        y += 56
    d.text((rx + 20, H - 66), "All names, contacts, and addresses are fictional.", font=f_xs, fill=MUTED)

    OUT.mkdir(parents=True, exist_ok=True)
    im.save(OUT / "crm-conversation-tracking.png", optimize=True)
    print("wrote", OUT / "crm-conversation-tracking.png")


def wrap(d, text, f, maxw):
    words = text.split()
    lines, cur = [], ""
    for w in words:
        trial = (cur + " " + w).strip()
        if d.textlength(trial, font=f) <= maxw:
            cur = trial
        else:
            lines.append(cur)
            cur = w
    if cur:
        lines.append(cur)
    return lines


if __name__ == "__main__":
    main()
