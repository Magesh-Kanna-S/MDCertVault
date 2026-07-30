# Customizing Branding

My Desktop CertVault is designed so a fork can rebrand in under 5 minutes
by editing the files in `/branding/` and a few CSS variables.

The default theme uses the four-color Google palette
(`#4285F4` blue, `#DB4437` red, `#F4B400` yellow, `#0F9D58` green)
coherently across the website header, buttons, alerts, certificate
border, and signature accents.

---

## 1. Logo

Replace `branding/logo.png` with your organization's logo. Requirements:

- **Format:** PNG (preferred) or SVG
- **Dimensions:** square works best (the default is a 2000×2000 transparent PNG)
- **Background:** transparent
- **Color:** should be visible on the cool neutral page background (`#f6f8fc`)

The logo is shown in:
- The header brand mark (next to "My Desktop CertVault")
- The browser tab icon (`<link rel="icon">`)
- The top-left corner of every certificate

To switch to an SVG logo, drop your file at `branding/logo.svg` and
update the `src` attribute in `templates/certificate.html` and
`verify/index.html`.

---

## 2. Signatures (TWO per certificate)

Each certificate displays **two** signature blocks — one on the left
and one on the right of the footer. Each signature is loaded from a
per-row file name stored in your Sheet/CSV.

Default signature images live in:

```
branding/signatures/
├── signature-1.svg     ← referenced by the sign1_file_name column
└── signature-2.svg     ← referenced by the sign2_file_name column
```

To add a new signature:

1. Drop your signature image (SVG or PNG, ~220×64 px, dark ink,
   transparent background) into `branding/signatures/`.
2. Reference its file name in the `sign1_file_name` or
   `sign2_file_name` column of the row.

If a row leaves `sign1_file_name` (or `sign2_file_name`) blank, the
default file name configured in `js/config.js` (`signatures.sign1.fileName`
/ `signatures.sign2.fileName`) is used instead.

The displayed person name and designation come from the
`sign1_person_name` / `sign1_designation` (and `sign2_*`) columns.

---

## 3. Brand Colors

Edit `branding/brand.css` to override the default palette. The four
anchor tokens are the Google colors:

```css
:root {
  --g-blue:    #4285F4;
  --g-red:     #DB4437;
  --g-yellow:  #F4B400;
  --g-green:   #0F9D58;

  --primary:        var(--g-blue);   /* headings, primary buttons */
  --primary-strong: #1a73e8;         /* slightly deeper blue for cert title */
  --accent:         var(--g-green);  /* borders, links, secondary buttons */
  --danger:         var(--g-red);
  --warning:        var(--g-yellow);
  --success:        var(--g-green);
}
```

The brand-mark gradient (top-left of every page) uses all four colors
in a diagonal stripe, mirroring the Google logo. The certificate
border uses the same four-color stripe as a 2px frame, with a thin
4-color corner ornament in each corner (top-left blue, top-right red,
bottom-right yellow, bottom-left green).

To match a different brand, just change the four `--g-*` values —
the header gradient, button gradients, certificate border, and corner
ornaments will all update automatically.

---

## 4. Issuer Name & Title

Two places to update:

**`js/config.js`:**
```js
site: {
  issuerName:  "Your Organization Name",
  issuerTitle: "Certification Authority",
}
```

**Per-row override:** If your Sheet has `issuer_name` and `issuer_title`
columns, those values win for each certificate.

---

## 5. Default Signature Person + Designation

If most of your rows share the same signatories, set the defaults in
`js/config.js` so you don't have to repeat them in every CSV row:

```js
signatures: {
  sign1: {
    fileName:    "signature-1.svg",
    personName:  "Dr. Anitha Krishnan",
    designation: "Program Director",
  },
  sign2: {
    fileName:    "signature-2.svg",
    personName:  "Prof. Rajesh Menon",
    designation: "Academic Head",
  },
},
```

Per-row values in the Sheet (`sign1_person_name`, `sign1_designation`,
`sign2_person_name`, `sign2_designation`) override these defaults.

---

## 6. Layout & Typography (advanced)

The certificate layout lives in `templates/certificate.html` and the
styles in `css/certificate.css`. Common tweaks:

- **Larger recipient name:** edit `.cert-recipient { font-size: 34px; }`
  in `certificate.css`.
- **One-page PDF:** the certificate is locked to A4-landscape
  proportions via `aspect-ratio: 1123/794`. If you add content that
  increases the height, the certificate may spill onto a second PDF
  page — keep the content compact or reduce paddings in
  `.certificate-inner`.
- **Print margin:** `@page { size: A4 landscape; margin: 0; }` in
  `certificate.css` controls the print/PDF page format.
