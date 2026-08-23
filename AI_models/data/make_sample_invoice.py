"""
Generate a sample scanned-style invoice image for demoing Model 4 (OCR).

WHY THIS EXISTS
---------------
Model 4's whole point is the "upload an invoice, correct a mis-read field,
watch the forecast recompute" moment - but the repo shipped no invoice to
upload. Testing it meant hunting for an arbitrary image, which is not a
demo you can rehearse.

The generated invoice deliberately carries the exact labels
ocr_extraction.py's FIELD_LABELS looks for (Invoice No / Invoice Date /
Due Date / Total Amount / Bill To), so a successful extraction is a real
test of the pipeline rather than of the sample being unusually tidy.

It is rendered as an IMAGE, not a text-layer PDF, on purpose: a digital PDF
would skip OCR entirely via PyMuPDF's text layer and prove nothing about
Tesseract being wired up.

USAGE
-----
    cd AI_models && .venv/Scripts/python data/make_sample_invoice.py
"""
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

OUT_PATH = Path(__file__).resolve().parent / "sample_invoice.png"

WIDTH, HEIGHT = 1000, 1300
MARGIN = 70

# Matches a real row in invoices.csv so the extracted values line up with a
# customer Model 1 already has history for.
INVOICE = {
    "seller": "Shree Balaji Furniture Works",
    "seller_sub": "GSTIN 27AABCS1429B1ZX  ·  Pune, Maharashtra",
    "invoice_no": "INV-700501",
    "invoice_date": "12/08/2026",
    "due_date": "11/09/2026",
    "bill_to": "FoodBev Client 001",
    "bill_to_sub": "Food & Beverage  ·  Payment terms: Net 30",
    "line_items": [
        ("Modular workstation units", "12", "18,500.00", "222,000.00"),
        ("Ergonomic task chairs", "24", "4,200.00", "100,800.00"),
        ("Installation & assembly", "1", "22,400.00", "22,400.00"),
    ],
    "subtotal": "345,200.00",
    "tax": "13,499.65",
    "total": "358,699.65",
}


def load_font(size, bold=False):
    """
    Prefer a real TrueType face - PIL's bitmap default renders far too small
    to OCR reliably at this canvas size.
    """
    candidates = (
        ["arialbd.ttf", "DejaVuSans-Bold.ttf"] if bold
        else ["arial.ttf", "DejaVuSans.ttf"]
    )
    for name in candidates:
        try:
            return ImageFont.truetype(name, size)
        except OSError:
            continue
    return ImageFont.load_default()


def main() -> None:
    image = Image.new("RGB", (WIDTH, HEIGHT), "white")
    draw = ImageDraw.Draw(image)

    title = load_font(34, bold=True)
    heading = load_font(22, bold=True)
    body = load_font(19)
    small = load_font(16)

    y = MARGIN
    draw.text((MARGIN, y), INVOICE["seller"], font=title, fill="black")
    y += 44
    draw.text((MARGIN, y), INVOICE["seller_sub"], font=small, fill="#444444")
    y += 46
    draw.line([(MARGIN, y), (WIDTH - MARGIN, y)], fill="black", width=2)

    y += 34
    draw.text((MARGIN, y), "TAX INVOICE", font=heading, fill="black")

    # Labelled fields - these are what Model 4 actually scans for.
    y += 46
    for label, value in (
        ("Invoice No:", INVOICE["invoice_no"]),
        ("Invoice Date:", INVOICE["invoice_date"]),
        ("Due Date:", INVOICE["due_date"]),
    ):
        draw.text((MARGIN, y), label, font=body, fill="black")
        draw.text((MARGIN + 210, y), value, font=body, fill="black")
        y += 34

    y += 18
    draw.text((MARGIN, y), "Bill To:", font=body, fill="black")
    draw.text((MARGIN + 210, y), INVOICE["bill_to"], font=body, fill="black")
    y += 30
    draw.text((MARGIN + 210, y), INVOICE["bill_to_sub"], font=small, fill="#444444")

    # Line items table.
    y += 62
    draw.line([(MARGIN, y), (WIDTH - MARGIN, y)], fill="black", width=1)
    y += 14
    columns = [MARGIN, MARGIN + 430, MARGIN + 560, MARGIN + 720]
    for x, header in zip(columns, ("Description", "Qty", "Rate", "Amount")):
        draw.text((x, y), header, font=small, fill="#444444")
    y += 28
    draw.line([(MARGIN, y), (WIDTH - MARGIN, y)], fill="black", width=1)

    y += 18
    for description, qty, rate, amount in INVOICE["line_items"]:
        for x, text in zip(columns, (description, qty, rate, amount)):
            draw.text((x, y), text, font=body, fill="black")
        y += 36

    y += 10
    draw.line([(MARGIN, y), (WIDTH - MARGIN, y)], fill="black", width=1)

    y += 24
    for label, value, font in (
        ("Subtotal", INVOICE["subtotal"], body),
        ("GST", INVOICE["tax"], body),
    ):
        draw.text((columns[2], y), label, font=font, fill="black")
        draw.text((columns[3], y), value, font=font, fill="black")
        y += 34

    y += 8
    draw.text((columns[2], y), "Total Amount:", font=heading, fill="black")
    draw.text((columns[3], y), INVOICE["total"], font=heading, fill="black")

    y += 76
    draw.text(
        (MARGIN, y),
        "Payment due within 30 days of invoice date.",
        font=small,
        fill="#444444",
    )
    y += 26
    draw.text(
        (MARGIN, y),
        "This is a synthetic invoice generated for demonstration purposes.",
        font=small,
        fill="#888888",
    )

    image.save(OUT_PATH, dpi=(300, 300))
    print(f"wrote {OUT_PATH}")


if __name__ == "__main__":
    main()
