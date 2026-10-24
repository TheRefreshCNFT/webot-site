# OCR Visual Showcase Design Addendum

**Date:** 2026-10-24
**Parent spec:** `docs/superpowers/specs/2026-10-24-agency-repositioning-design.md`
**Status:** Owner direction confirmed; written addendum pending review

## Purpose

Add a polished OCR workflow showcase to the Agency homepage during the approved website overhaul. The OCR system does not yet exist and is not part of this implementation scope. The initial artwork will illustrate the intended workflow using synthetic documents; real product captures will replace that artwork before the site is promoted or released as a finished showcase.

The owner does not want an “in development” announcement or a caveat-heavy marketing section. The section should look complete and professional while avoiding fabricated accuracy, customer, or outcome claims.

## Page placement and copy

Add the showcase immediately after **What We Automate** and before **Our Work**. Use the approved Split Studio structure and custom Signal tokens.

Heading: **From document pile to structured data.**

Supporting copy explains the intended workflow in plain language: read documents, extract requested fields, route uncertain results for review, and produce structured output. Do not claim accuracy percentages, processing volume, time savings, customer adoption, or a currently available standalone OCR product.

The section CTA remains the existing consultation route. It does not add a price, checkout, upload, account, or demo request flow.

## Visual components

Use three connected visual stages:

1. A synthetic source invoice.
2. A restrained agent-review transition represented with typography and simple CSS/SVG structure, not fake application chrome.
3. A structured-field output panel derived only from the synthetic invoice.

The two principal images use these permanent paths:

- `assets/ocr/source-document.png`
- `assets/ocr/structured-output.png`

Both images use the same 8:5 aspect ratio and intrinsic dimensions of 1440 × 900 pixels. The layout reserves that ratio and remains responsive without cumulative layout shift.

The initial artwork contains any necessary **Sample** or **Illustrative example** labeling inside the image itself. HTML copy and alt text remain accurate for both the synthetic and eventual real versions:

- Source alt: **Invoice document prepared for OCR processing.**
- Output alt: **Structured fields extracted from an invoice.**

Replacing the two PNG files therefore removes sample labeling without requiring HTML, CSS, or copy changes.

## Replacement contract

When the OCR system is ready, overwrite only the two files above with owner-approved real captures at 1440 × 900 pixels. Do not rename the files or change their markup. If a real capture contains sensitive information, redact it before admission; do not expose customer data.

The replacement check confirms:

- both images decode and retain the required aspect ratio;
- their visible content matches the real OCR workflow;
- captions and alt text remain accurate;
- no confidential information or unsupported result claims are introduced;
- desktop and mobile layouts remain unchanged and readable.

## Architecture and boundaries

This remains static HTML, CSS, and JavaScript with no build step. The addendum creates original local artwork and two image slots only. It does not implement OCR, accept uploads, send documents to a provider, or create a functional product demo.

No new navigation item is required. Existing approved navigation, Stripe URLs, consultation behavior, real-proof requirements, and guarded publication boundaries remain unchanged.

## Acceptance evidence

- Static tests verify both asset paths, intrinsic dimensions, generic alt text, section placement, and consultation CTA.
- Browser checks verify the showcase at 320, 375, 414, and 768 pixels plus desktop, with no horizontal overflow or two-line interactive labels.
- Screenshots show a polished visual section consistent with Signal and free of fake browser/IDE chrome.
- Source inspection confirms no invented metrics, testimonials, customer outcomes, upload behavior, or OCR runtime claim beyond the approved workflow description.
- Real-image replacement is a separate pre-release evidence check; this local artwork pass does not claim that the OCR system itself works.
