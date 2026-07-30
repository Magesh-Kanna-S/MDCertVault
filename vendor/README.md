# /vendor/ — Local fallbacks for CDN libraries

My Desktop CertVault loads `html2pdf.js` and `html2canvas` from the cdnjs CDN by default
(see `verify/index.html`). If you want zero external dependencies, download
the minified bundles into this folder and update the `<script>` tags in
`verify/index.html` to point at `../vendor/...`.

Recommended files:

- `html2pdf.bundle.min.js` — https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js
- `html2canvas.min.js`     — https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js

After dropping them here, replace the CDN URLs in `verify/index.html`:

```html
<script src="../vendor/html2pdf.bundle.min.js"></script>
<script src="../vendor/html2canvas.min.js"></script>
```

You can drop the `integrity=` and `crossorigin=` attributes when serving
locally — those are only meaningful for CDN scripts.
