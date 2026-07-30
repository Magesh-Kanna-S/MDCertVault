# Deploying to GitHub Pages

Total time: ~5 minutes after you've completed
[`setup-google-sheets.md`](./setup-google-sheets.md).

---

## Step 1 — Push to GitHub

1. Create a new repository on GitHub. Name it `certnow` (or whatever you like).
2. In your local clone of this zip:

   ```bash
   git init
   git add .
   git commit -m "Initial commit: My Desktop CertVault v1.0"
   git branch -M main
   git remote add origin https://github.com/<your-username>/certnow.git
   git push -u origin main
   ```

## Step 2 — Enable GitHub Pages

1. In your repo on GitHub, go to **Settings → Pages**.
2. Under **Source**, choose **Deploy from a branch**.
3. Branch: **`main`**, folder: **`/ (root)`**.
4. Click **Save**.
5. Wait ~60 seconds. Refresh the page — you'll see:
   ```
   Your site is live at https://<your-username>.github.io/certnow/
   ```

## Step 3 — Verify

1. Visit `https://<your-username>.github.io/certnow/verify/`.
2. You should see the verification form.
3. Enter one of the certificate IDs from your Sheet — you should see the
   certificate render.
4. Try an email address from your Sheet — you should see the results table.

## Step 4 — Update API Key Restrictions

If you used Approach A (direct Sheets API), go back to Google Cloud Console
and tighten the API key restriction:

- HTTP referrers: `https://<your-username>.github.io/*`
- Remove `localhost` if you no longer need local testing.

## Step 5 — Share the Verify Link

Certificate holders verify their certificates at:

```
https://<your-username>.github.io/certnow/verify/?id=THEIR_CERT_ID
```

You can distribute this link directly, or recipients can scan the QR code
printed on the certificate PDF.

---

## Custom Domain (optional)

GitHub Pages supports custom domains. **Settings → Pages → Custom domain →**
enter `certs.yourorg.com`. Add a CNAME record at your DNS provider pointing
to `<your-username>.github.io`. After verification, enforce HTTPS.

Remember to update your API key HTTP referrer restriction to include the
new domain.
