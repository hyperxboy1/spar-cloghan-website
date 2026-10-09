# Outstanding approvals & missing assets

Nothing below has been approved by the shop. The current build is a **review draft**: it is
`noindex`, shows a draft banner, and marks unconfirmed items “To confirm”.
`npm run build:launch` refuses to build until the items marked **(blocks launch)** are done.

Tick each item only after the manager has confirmed it in writing (email/message is fine), then
change the matching `status` / `approved` value in `src/data/` (see `CONTENT-EDITING.md`).

## 1. Brand & identity

- [ ] **Approved SPAR / SPAR Express logo artwork** (SVG preferred) and permission to use it on this
      site. The header/footer currently use a **temporary text treatment** (`src/components/Wordmark.astro`);
      no tree mark has been drawn. **(blocks a credible launch)**
- [ ] Brand colours taken from the approved artwork. Current reds/greens are provisional values
      sampled from the design reference (`src/styles/global.css`, `--red`, `--green` …).
- [ ] Which name to lead with: “Healy's SPAR Express” (social accounts) and/or “SPAR Express Cloghan”
      (SPAR directory). Both appear today.
- [ ] Headline and voice: “Local heart. Big appetite.” and the handwritten lines
      (“Pop in on Hill Street”, “Proud to be part of Cloghan”).
- [ ] Favicon (currently a neutral red square with a heart — not a SPAR mark).

## 2. Photographs — missing assets (exact list)

All current food images are **temporary placeholders** (see `ASSET-MANIFEST.md`). **(blocks launch)**

| # | Needed photograph | Used for | Notes |
| --- | --- | --- | --- |
| P1 | Storefront, daytime, signage straight and legible | Visit / local section, social share image | Landscape + portrait crops. Not Street View. |
| P2 | Deli counter or a deli product close-up (sandwich / roll / hot food) | Hero foreground, deli card, counter showcase | A clean, well-lit shot on a plain surface allows a cut-out. |
| P3 | Coffee (cup from the shop's own machine) | Hero mid-ground, coffee card | Real cup/branding only. |
| P4 | Bakery items or desserts | Counter showcase “Bakery” (typography panel today) | |
| P5 | Welcoming interior or team photo | Our local shop | **Written consent** from anyone identifiable. |
| P6 | Forecourt (optional) | Services | |

Minimum 2000 px on the long edge, original files (not screenshots, not Facebook downloads with
compression) and confirmation of who took them and that the shop may use them.

## 3. Business facts

- [ ] Name, address, Eircode, phone (SPAR directory: Hill **Street**; Maxol: Hill **Road**). **(blocks launch)**
- [ ] Facebook `@sparcloghan` and Instagram `@sparcloghan` are the shop's own accounts.
- [ ] Directions link lands on the shop (open the “Get directions” button and check the pin), then set
      `directionsVerified: true` in `src/data/business.ts`.
- [ ] **Opening hours for every day**, deli hours, and bank-holiday/Christmas exceptions. Until then
      the site says “Please call for today's opening hours.” (Maxol lists 07:00–22:00 store and
      07:00–17:00 deli; an earlier brief said 06:00 opening — neither is confirmed.)

## 4. Services (each one individually)

Publicly listed by Maxol; all currently “To confirm”: fuel · pay at pump · ATM · bill & toll payments ·
off-licence · seating · customer toilets.
Hidden until verified: air & water · vacuum.

## 5. Food & counter copy

- [ ] Deli / coffee / bakery descriptions in `src/data/counter.ts` (no menu, prices, times or
      freshness claims are made).
- [ ] Whether a menu exists that could be published (only then add one — never a fake menu).

## 6. Catering (hidden)

- [ ] Is catering currently offered? Preferred contact route (phone and/or Facebook message)?
      Only then set `catering.status` to `'approved'`.

## 7. Offers

- [ ] Who approves offers and how they are sent for publishing. Each offer needs title, exact price
      wording, start/end dates and terms. No sample prices are ever published.

## 8. Local shop section

- [ ] “Proud to be part of Cloghan” copy and the four fact tiles.
- [ ] **2024 SPAR 365 Retailing Standards Award** — confirm the exact award name and year and that the
      shop wants it mentioned. Do not reuse the newspaper's group photograph.

## 9. Publishing & accounts

- [ ] Cloudflare account created **under the shop's own email** (not a developer's personal account).
- [ ] Project name → address `https://<name>.pages.dev`; then set `SITE_URL` and rebuild.
- [ ] Decision to allow indexing (`ALLOW_INDEXING=true`) only after everything above is approved.
- [ ] Whether the review draft should be password-protected (Cloudflare Access) — `noindex` and
      `robots.txt` are requests to search engines, **not access control**.
