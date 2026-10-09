# Deploying to Cloudflare Pages (Free) — Direct Upload

The site is plain static files. Cloudflare Pages Free hosts it at `https://<project>.pages.dev`
with HTTPS at no cost. No domain purchase, card, build server or Git connection is needed.

> **Not done for you:** nothing has been published. Deploy only when the shop is ready, from an
> account the **shop owns**.

## What you upload

`release/spar-cloghan-site.zip` — the **built output** (`dist/`), with `index.html` at the ZIP root.
Do **not** upload the source project. Rebuild it yourself with:

```bash
npm ci
npm run build          # review draft — or: npm run build:launch once everything is approved
npm run package        # writes release/spar-cloghan-site.zip
```

The build also writes `_headers` (security headers, long-term caching for `/_astro/*`, and
`X-Robots-Tag: noindex` unless indexing was allowed) and `robots.txt`. Cloudflare Pages applies
`_headers` automatically.

## First deployment (dashboard)

Cloudflare occasionally renames buttons; the flow below matches the current documentation.

1. Sign in (or sign up free) at **dash.cloudflare.com** using the shop's email address.
2. Go to **Workers & Pages** → **Create** → **Pages** tab → **Upload assets** (Direct Upload).
3. Enter a **project name** (e.g. `spar-cloghan`). This becomes `https://spar-cloghan.pages.dev`
   (Cloudflare adds a suffix if the name is taken).
4. **Create project**, then drag in `spar-cloghan-site.zip` (a ZIP or a single folder is accepted).
5. When the upload finishes, select **Deploy site** / **Save and Deploy**.
6. Open the `*.pages.dev` address and check: phone link, directions link, menu on a phone.
7. Set `SITE_URL=https://<your-project>.pages.dev` for future builds (enables canonical URLs).

Limits that matter here (Free plan): drag-and-drop accepts up to **1,000 files** and **25 MiB per
file**. This site is ~70 files and ~2–3 MB.

## Updating the site

1. Edit `src/data/…`, `npm run build`, `npm run package`.
2. Dashboard → your Pages project → **Create deployment** (“Create a new deployment”).
3. Choose **Production** (or **Preview** to get a separate test URL first) and upload the new ZIP.

Command-line alternative (needs a Cloudflare login; accepts a folder, not a ZIP):

```bash
npx wrangler pages deploy dist --project-name=spar-cloghan
```

## Rolling back

Dashboard → project → **Deployments** → find the last good deployment → **⋯** menu →
**Rollback to this deployment**. It is instant; nothing needs rebuilding.

## Important: Direct Upload cannot become Git-connected later

A Direct Upload project **cannot be converted** to Git integration. If the shop later wants
automatic deploys from a GitHub repository, create a **new** Pages project connected to Git
(build command `npm run build`, output directory `dist`, Node 22) and move the custom domain or
share the new `*.pages.dev` address.

## Keeping the preview private

`noindex` and `robots.txt` only ask search engines not to list the page — anyone with the link can
still open it. To restrict a review deployment, use **Cloudflare Access** on the Pages project
(Zero Trust free tier) or share the link only with the people who need it.

## Ownership checklist

- The Cloudflare account and Pages project belong to the shop's email; add the developer as a
  member if needed, never the other way round.
- Keep this repository (or `release/spar-cloghan-source.zip`) with the shop.
- No API keys, analytics or third-party services are configured, so there is nothing else to hand over.
