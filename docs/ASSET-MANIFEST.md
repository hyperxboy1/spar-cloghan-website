# Asset & source manifest

Machine-readable version: [`asset-manifest.json`](asset-manifest.json). Updated 9 October 2026.

## Why the site uses placeholders

The build environment could not reach the SPAR directory, Maxol, Facebook, Instagram, the
Offaly Independent, Google Maps or any stock-photo library (outbound network policy). No logins or
restrictions were bypassed and nothing was hot-linked. The only imagery available was the
**design reference you supplied** (`docs/design-reference/reference-mockup.webp`, an AI-generated
mockup), which you asked to be used. Three clean food crops were taken from it, enlarged and
cleaned. Everything that would misrepresent the shop was left out.

**These are concept art, not photographs of the shop or its products.** The draft banner and the
footer say so. A launch build will not run until they are replaced or explicitly approved.

## Images in use

| ID | File | Subject | From | Placement | Placeholder | Approved |
| --- | --- | --- | --- | --- | --- | --- |
| IMG-01 | `src/assets/images/baguette-cutout.png` (1802×1129, transparent) | Seeded baguette, ham/cheese/tomato/lettuce | REF-01 crop, 4× EDSR upscale, rembg cut-out | Hero foreground | yes | no |
| IMG-02 | `src/assets/images/latte-croissant.jpg` (662×720) | Latte with foam art, croissant behind | REF-01 crop, 4× upscale, **fake cup logo removed** | Hero mid-ground (sheen), coffee card, counter | yes | no |
| IMG-03 | `src/assets/images/deli-sandwich.jpg` (684×722) | Tall sandwich on seeded bread | REF-01 crop, 4× upscale | Hero mid-ground (desktop), deli card, counter | yes | no |

Responsive AVIF/WebP files are generated at build time; originals stay in `src/assets/images/`.
IMG-03 is visibly soft at large sizes (177 px source) — first in line for replacement.

## Deliberately not used from the reference

- SPAR-branded takeaway cup — fabricated product branding.
- Storefront with “Healy's SPAR Cloghan” sign and chalkboard — fabricated signage, not the real shop.
- Coca-Cola / Walkers offer image — third-party trademarks and implied offers.
- National Lottery / payzone / ATM logos — trademarks, services unconfirmed.
- Church/village panorama labelled Cloghan — a generated place presented as real; replaced by an
  abstract illustrated landscape.
- Berry pastry — obstructed by a blurred leaf; clean extraction failed.
- “Good Food Brighter Days” — unverified slogan.

## Project-made graphics

Line icons, the illustrated countryside band, the circular Hill Street badge, the favicon and the
temporary text wordmark were drawn for this project (no SPAR tree mark was drawn).

## Fonts (all SIL Open Font License 1.1, self-hosted, licences in `src/assets/fonts/`)

Anton (display) · Inter variable (text) · Fraunces 600 (serif accents) · Caveat 600 (handwritten
notes) — from the `@fontsource` npm packages, version 5.3.0.

## Candidate sources (leads, nothing downloaded)

See `asset-manifest.json` → `candidateSourcesInspected` for the full list and status of every
SPAR, Maxol, Facebook, Instagram, newspaper and Maps link in the brief.

## Missing assets

The exact list of photographs still needed is in `APPROVALS-CHECKLIST.md`, section 2.
