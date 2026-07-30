# User Guide — For Administrators

This guide is for the person who will be adding certificate rows to the
Google Sheet. No programming knowledge required.

---

## Adding a New Certificate

1. Open your Google Sheet (bookmark it — you'll be back often).
2. Scroll to the first empty row.
3. Fill in the columns:

| Column               | What to enter                                    | Example                         |
|----------------------|--------------------------------------------------|---------------------------------|
| `cert_id`            | 8-character hex ID (see below)                   | `501059c1`                      |
| `recipient_name`     | Full name as it should appear on the certificate | `MAGESH KANNA S`                |
| `email`              | Recipient's email — used for email-based lookup  | `student@school.edu`            |
| `course_name`        | Course or workshop name                          | `Presentation and Confidence`   |
| `issue_date`         | Issue date in YYYY-MM-DD format                  | `2026-04-15`                    |
| `issuer_name`        | Issuing organization (overrides config)          | `KV Institute of Management`    |
| `issuer_title`       | Issuer tagline / role line                       | `Certification Authority`       |
| `sign1_file_name`    | File name of signature 1 image (in /branding/signatures/) | `signature-1.svg`       |
| `sign1_person_name`  | Display name under signature 1                   | `Dr. Anitha Krishnan`           |
| `sign1_designation`  | Designation under signature 1                    | `Program Director`              |
| `sign2_file_name`    | File name of signature 2 image                   | `signature-2.svg`               |
| `sign2_person_name`  | Display name under signature 2                   | `Prof. Rajesh Menon`            |
| `sign2_designation`  | Designation under signature 2                    | `Academic Head`                 |
| `issued`             | `TRUE` to make it live, `FALSE` to hide          | `TRUE`                          |

4. The certificate is now live. Visit:
   ```
   https://<your-site>/verify/?id=501059c1
   ```

---

## Generating a cert_id

The `cert_id` is an 8-character hex string. Easiest ways to generate one:

**Option A — Formula in the Sheet:**
Paste this into cell A2 and drag down:
```
=DEC2HEX(RANDBETWEEN(0, 4294967295), 8)
```

**Option B — Online generator:**
Visit [random.org](https://www.random.org/strings/) or just type 8 random
hex characters (0-9, a-f).

**Option C — Apps Script auto-fill:**
If you deployed the Apps Script backend and set up the form-submit trigger
(see `apps-script/Code.gs` → `addRow`), the ID is generated automatically
when a new row is added via a Google Form.

---

## Sharing the Verify Link

Each certificate has a permanent verify URL:

```
https://<your-site>/verify/?id=501059c1
```

Recipients can:
- Visit this URL to view their certificate online
- Click "Download PDF" for a print-ready PDF
- Click "Download PNG" for an image to share on LinkedIn
- Click "Copy Verify Link" to copy the URL to clipboard

The certificate also includes a QR code that scans to the same URL.

---

## Finding All Certificates for One Person

Visit the verify page and enter the recipient's email address. The site
will show a table of every certificate issued to that email.

This is useful when a recipient asks "what certificates do I have?" —
you can forward them the link:
```
https://<your-site>/verify/?email=student@school.edu
```

---

## Hiding a Certificate

Set the `issued` column to `FALSE`. The certificate will disappear from
all public views immediately (after the next page load). The row stays
in the Sheet for your records.

To permanently delete a certificate, delete the entire row.

---

## Common Mistakes to Avoid

1. **Typo in cert_id** — must be exactly 8 hex characters (0-9, a-f).
   Anything else will return "not found".
2. **Wrong date format** — must be `YYYY-MM-DD`. The Sheet may auto-format
   it to your locale's display; the underlying value is what matters.
3. **Forgot to set `issued` to TRUE** — new rows default to empty, which
   is treated as not-yet-issued. The certificate will be invisible until
   you set it to TRUE.
4. **Email typos** — email lookup is case-insensitive but exact. A typo
   means the recipient won't find their certificates by email.
