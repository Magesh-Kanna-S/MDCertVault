# My Desktop CertVault — Certificate Generation Studio

My Desktop CertVault is an open-source certificate generation studio that turns a
Google Sheet into a live, verifiable certificate registry. Course
administrators maintain a single spreadsheet of recipients; CertVault
reads that sheet and produces shareable HTML certificate pages,
downloadable PDFs, and PNG images for each row. A public verification
page lets anyone confirm a certificate by ID or email.

**100% free hosting on GitHub Pages. No backend required.**

The project theme uses the four-color Google palette
(`#4285F4` blue, `#DB4437` red, `#F4B400` yellow, `#0F9D58` green) —
coherent across the website header, buttons, alerts, the certificate
border, the recipient-name underline, and the two signature accents.

---

## Quick Start

1. **Download** or clone this repository.
2. **Edit `js/config.js`** — replace the `YOUR_..._HERE` placeholders
   with your Google Sheets API key and Sheet ID.
   See [`docs/setup-google-sheets.md`](./docs/setup-google-sheets.md).
3. **Push to GitHub** and enable Pages.
   See [`docs/deploy-github-pages.md`](./docs/deploy-github-pages.md).
4. **Visit** `https://<your-username>.github.io/<repo>/verify/` — done.

Time-to-live: ~20 minutes.

---

## Features

- ✅ **Verify by ID or email** — public page returns a single cert or a list
- ✅ **Three output formats** — live HTML view, PDF download, PNG download
- ✅ **Single-page PDF** — certificate is locked to A4-landscape proportions
- ✅ **QR code on every certificate** — scans to the verify URL
- ✅ **Two signature blocks** — left and right, each loaded from a per-row
  file name in `/branding/signatures/`
- ✅ **Verify-link copy box** — sits directly below the download buttons
- ✅ **Google 4-color theme** — coherent palette across the entire site
- ✅ **Branding-ready** — drop in your own logo and signature images
- ✅ **Two backend options** — direct Sheets API (Approach A) or Apps Script (Approach B)
- ✅ **No build step** — pure HTML/CSS/vanilla JS
- ✅ **Mobile responsive** — works on phones, tablets, desktops

---

## Project Structure

```
certvault/
├── index.html              # Landing (redirects to /verify/)
├── verify/                 # Public verification page
│   └── index.html
├── css/
│   ├── base.css            # Design tokens + reset
│   ├── components.css      # Buttons, cards, tables, pills
│   └── certificate.css     # Certificate + print/PDF/PNG styles
├── js/
│   ├── config.js           # ★ EDIT THIS — API keys, Sheet ID, branding, signatures
│   ├── api.js              # fetchCertificate, fetchByEmail
│   ├── render.js           # renderTemplate, loadCertificate, signature resolution
│   ├── verify.js           # Verify-page controller + verify-link box
│   └── download.js         # PDF + PNG exporters (single-page A4 landscape)
├── templates/
│   └── certificate.html    # The certificate template (2 signatures + QR)
├── branding/
│   ├── logo.png            # Issuer logo (square, transparent PNG)
│   ├── brand.css           # Google 4-color palette overrides
│   └── signatures/         # Per-row signature image files
│       ├── signature-1.svg
│       └── signature-2.svg
├── apps-script/            # Approach B backend (optional)
│   └── Code.gs
├── docs/
│   ├── setup-google-sheets.md
│   ├── deploy-github-pages.md
│   ├── customize-branding.md
│   ├── user-guide.md
│   ├── sample-sheet.csv    # Sample data with all 14 columns
│   └── template-sheet.csv  # Header-only template for new sheets
└── .github/                # Issue templates, CI, Code of Conduct
```

---

## Sheet / CSV Column Reference

Each row in your Google Sheet (or imported CSV) must contain these columns:

| Column                 | Purpose                                                       |
|------------------------|---------------------------------------------------------------|
| `cert_id`              | 8-char hex ID (auto-generated, see apps-script/Code.gs)       |
| `recipient_name`       | Full name of the recipient                                    |
| `email`                | Recipient email (used for email-based verification)           |
| `course_name`          | Course / program name                                         |
| `issue_date`           | ISO date `YYYY-MM-DD` (rendered as "Month Year")              |
| `issuer_name`          | Issuing organization name                                     |
| `issuer_title`         | Issuer tagline / role line (shown under the org name)         |
| `sign1_file_name`      | File name of signature 1 image (in `/branding/signatures/`)   |
| `sign1_person_name`    | Display name under signature 1                                |
| `sign1_designation`    | Designation / title under signature 1                         |
| `sign2_file_name`      | File name of signature 2 image                                |
| `sign2_person_name`    | Display name under signature 2                                |
| `sign2_designation`    | Designation / title under signature 2                         |
| `issued`               | `TRUE` to publish, `FALSE` to hide                            |

A ready-to-import template is at [`docs/template-sheet.csv`](./docs/template-sheet.csv),
and a populated example is at [`docs/sample-sheet.csv`](./docs/sample-sheet.csv).

---

## Configuration

All configuration lives in **`js/config.js`**. Key sections:

| Section      | What it controls                                           |
|--------------|------------------------------------------------------------|
| `sheets`     | Google Sheets API v4 key, Sheet ID, tab name               |
| `drive`      | Optional Google Drive hosting for the logo                 |
| `appsScriptUrl` | Optional Apps Script backend URL (Approach B)           |
| `site`       | Brand name, tagline, issuer name, issuer title             |
| `signatures` | Default signature file names, person names, designations   |
| `output`     | PDF/PNG filename prefix, QR on/off                         |

Full step-by-step instructions: [`docs/setup-google-sheets.md`](./docs/setup-google-sheets.md).

---

## Verify URL Contract

Certificate holders verify their certificates at:

```
https://<your-site>/verify/?id=THEIR_CERT_ID
```

When a certificate is open on the verify page, the **Verify Link** box
below the download buttons shows the URL and provides a one-click
**Copy Verify Link** button.

| URL                                            | Behavior                              |
|------------------------------------------------|---------------------------------------|
| `/verify/`                                     | Show the verification form            |
| `/verify/?id=501059c1`                         | Show one certificate                  |
| `/verify/?email=student@school.edu`            | Show all certs for that email         |
| `/verify/?q=...`                               | Auto-detect ID vs email               |

---

## Tech Stack

- **Frontend:** HTML5, modern CSS (custom properties, grid, flex), vanilla JS (ES2020+)
- **Data source:** Google Sheets API v4 (Approach A) or Google Apps Script (Approach B)
- **PDF export:** [html2pdf.js](https://github.com/eKoopmans/html2pdf.js) (CDN)
- **PNG export:** [html2canvas](https://html2canvas.hertzen.com/) (CDN)
- **QR codes:** [api.qrserver.com](https://api.qrserver.com/) (swap for a local lib if needed)
- **Hosting:** GitHub Pages (free)

No build step, no bundler, no framework. The codebase is intentionally
small so it can be audited in a single sitting.

---

## Documentation

| Doc | Audience |
|-----|----------|
| [`docs/setup-google-sheets.md`](./docs/setup-google-sheets.md) | The person setting up the Sheet + API |
| [`docs/deploy-github-pages.md`](./docs/deploy-github-pages.md) | The person publishing the site |
| [`docs/customize-branding.md`](./docs/customize-branding.md)   | Anyone rebranding the certificate |
| [`docs/user-guide.md`](./docs/user-guide.md)                  | The day-to-day administrator |

---

## License

MIT — see [`LICENSE`](./LICENSE).
