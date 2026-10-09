# SPAR Express Cloghan — promotional website

A static, single-page promotional site for **SPAR Express Cloghan / Healy's SPAR Express**,
Hill Street, Cloghan, Co. Offaly (R42 R856). Its signature feature is an interactive first
screen: a layered food composition that responds to the mouse, with weighted depth, a warm
cursor light and a directional sheen. Mobile and reduced-motion visitors get their own
complete static compositions.

> **Status: draft for shop approval.** Food images are temporary placeholders cut from the
> client-supplied design reference (AI-generated concept art), **not photographs of this shop**.
> Several facts are publicly listed but not yet confirmed by the manager. See
> [`docs/APPROVALS-CHECKLIST.md`](docs/APPROVALS-CHECKLIST.md) before anything goes public.

- **€0 running costs.** Static files on Cloudflare Pages Free (`*.pages.dev`), no backend, no
  paid APIs, no trackers, no embeds, no cookies, no forms. Fonts and images are self-hosted.
- **Stack:** Astro 7 (static output) · TypeScript · plain CSS · GSAP core for scroll easing.
  No React, no WebGL, no ScrollTrigger (see [`docs/TESTING.md`](docs/TESTING.md) for why).

## Requirements

- **Node.js 22.12 or newer** (Astro 7.3 requires `>=22.12.0`). Built and tested on Node 22.22.0
  (`.nvmrc`). npm 10+.
- No accounts or API keys are needed to build.

## Commands

| Command | What it does |
| --- | --- |
| `npm ci` | Install exact dependency versions from `package-lock.json` |
| `npm run dev` | Development server at http://localhost:4321 |
| `npm run build` | **Review build** → `dist/` (draft banner, “To confirm” markers, always `noindex`) |
| `npm run build:launch` | **Launch build** → only manager-approved content; **fails** while images or core facts are unapproved |
| `npm run preview` | Serve the built `dist/` locally at http://localhost:4321 (test the real output, not the dev server) |
| `npm run check` | Astro / TypeScript diagnostics |
| `npm run test:e2e` | Automated browser QA against a running preview (`scripts/qa.mjs`) |
| `npm run package` | Create `release/spar-cloghan-site.zip` (upload-ready, `index.html` at root) and `release/spar-cloghan-source.zip` |

Optional environment variables (build time only — nothing secret exists in this project):

| Variable | Default | Purpose |
| --- | --- | --- |
| `SITE_URL` | unset | Final address, e.g. `https://spar-cloghan.pages.dev`. Enables canonical/`og:url`. Leave unset until decided. |
| `ALLOW_INDEXING` | unset | `true` lets search engines index a **launch** build. Review builds are always `noindex`. |

## Local preview without Node

Unzip `release/spar-cloghan-site.zip` and serve the folder with any static server — opening
`index.html` straight from the file system mostly works, but a server matches production
(e.g. `npx serve` or `python3 -m http.server` inside the unzipped folder).

## Project map

```
src/
  data/            ← all editable content: business facts, hours, services, offers, counter
                     (deli/coffee/bakery), catering, local shop, images, site/motion settings
  components/      ← page sections (Hero, FeatureCards, Counter, Offers, Services, Local, Visit …)
  scripts/         ← isolated interaction modules (hero controller, magnetic, tilt, menu,
                     counter, offers guard, scroll scenes) — each returns a cleanup function
  styles/global.css← design tokens, type, buttons, “pop-up” cards, review markers
  assets/images/   ← source images (Astro generates AVIF/WebP sizes at build)
  assets/fonts/    ← self-hosted OFL fonts + licences
scripts/           ← qa.mjs, package-zip.mjs, build-launch.mjs
docs/              ← approvals, content editing, deployment, research, testing, asset manifest
```

## Documentation

- [Outstanding approvals & missing assets](docs/APPROVALS-CHECKLIST.md)
- [Editing content](docs/CONTENT-EDITING.md)
- [Deploying to Cloudflare Pages (Direct Upload), updates & rollback](docs/DEPLOYMENT.md)
- [Asset & source manifest](docs/ASSET-MANIFEST.md) (machine-readable: [`docs/asset-manifest.json`](docs/asset-manifest.json))
- [Research notes & discrepancies](docs/RESEARCH-NOTES.md)
- [Testing: what was verified and what was not](docs/TESTING.md)
