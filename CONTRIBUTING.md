# Contributing to My Desktop CertVault

Thanks for your interest in contributing! This document covers the basics.
For the full project context, see the `README.md`.

---

## Quick Start for Contributors

1. Fork the repository and clone your fork locally.
2. Open the repository folder in your editor.
3. To preview the site locally, just open `index.html` in a browser.
   - Note: `fetch()` calls to load the certificate template will fail
     under `file://`. Run a tiny static server instead:
     ```bash
     python3 -m http.server 8000
     ```
     Then visit `http://localhost:8000/verify/`.
4. Make your changes. Test against your own Google Sheet (or use the
   `docs/sample-sheet.csv` data with a Sheet you create).
5. Commit with [Conventional Commits](https://www.conventionalcommits.org/):
   - `feat:` new feature
   - `fix:` bug fix
   - `docs:` documentation only
   - `chore:` maintenance
6. Open a pull request. CI will run automatically.

---

## Code Style

- **HTML:** 2-space indent. Lowercase tags and attributes. Always close tags.
- **CSS:** 2-space indent. One selector per line in multi-selector rules.
  Use CSS custom properties (`--var`) for any value used more than once.
- **JS:** 2-space indent. No semicolons (the existing files don't use them).
  Use `const` and `let`, never `var`. Use template literals for interpolation.

---

## Project Conventions

- **No build step.** Vanilla HTML/CSS/JS only. If you need a dependency,
  load it from a CDN with SRI hashes, or drop a minified copy in `/vendor/`.
- **No framework.** If you find yourself wanting React/Vue/etc., open a
  Discussion first — the no-framework decision is intentional.
- **Keep the file count flat.** New files should slot into the existing
  folder structure (see README's Project Structure section).
- **Document all public functions** with a JSDoc comment block.
- **Test your changes** in at least two browsers (Chrome + Firefox is fine).

---

## Pull Request Checklist

- [ ] CI passes (the workflow in `.github/workflows/ci.yml`)
- [ ] No `YOUR_..._HERE` placeholder values left in your fork's config
- [ ] Documentation updated if behavior changed
- [ ] `README.md` updated if the user-facing API changed
- [ ] Commit messages follow Conventional Commits

---

## Reporting Bugs

Use the [bug report template](.github/ISSUE_TEMPLATE/bug-report.md).
Include:
- Browser and version
- Whether you're using Approach A or B
- Approximate size of your Sheet (rows count)
- Console error messages (screenshot or text)
- Steps to reproduce

---

## Suggesting Features

Use the [feature request template](.github/ISSUE_TEMPLATE/feature-request.md).
For larger ideas, open a GitHub Discussion first so we can talk through
the design before you invest time in code.

---

## Code of Conduct

All interactions are governed by the
[Contributor Covenant Code of Conduct](.github/CODE_OF_CONDUCT.md).
