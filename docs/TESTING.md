# Testing — what was verified and what was not

Tested 9 October 2026 in the build environment against the **production build** served by
`astro preview` (not the dev server).

## Setup

- Node 22.22.0, npm 10.9.4, Astro 7.3.8, GSAP 3.15.0
- Headless Chromium (Playwright 1.56.1 build 1194) on Linux. **No other browser engines.**
- `npm run check` → 0 errors, 0 warnings.
- Automated suite: `npm run test:e2e` (`scripts/qa.mjs`) → **87 / 87 checks passed**.

## Automated checks (scripts/qa.mjs)

| Area | Checks |
| --- | --- |
| Widths 320, 390, 720 (≈200% zoom at 1440), 768, 1024, 1440, 1920 | no console/page errors · no failed requests · no horizontal overflow · one `h1` · all displayed images load · every `img` has `alt` |
| Links & metadata | all in-page anchors resolve · all phone links are `tel:+353906457455` · external links open in a new tab with `noopener` · `noindex` present · no canonical/structured data before approval · hero image `fetchpriority=high` · `lang="en-IE"` · unknown path → 404 page |
| Hero pointer (1440×900) | layers move at all four corners · foreground travel 20–32 px with 2–4° rotation · background moves 6–10 px **opposite** · light on inside / off outside · CTA boxes and headline do not move (to 0.1 px) · layers return to rest after a fast exit · **zero** animation frames while idle (1.5 s window) · hidden tab returns to rest immediately |
| Interactions | magnetic CTA moves only its inner layer · feature card pops up on hover (lift, scale, tilt) · deli/coffee/bakery picture selector works by keyboard |
| Reduced motion | no pointer parallax · scroll-scene script not even downloaded · counter heading fully visible · switching preference mid-session clears motion |
| Touch (390, emulated) | no pointer-follow · menu opens and moves focus in · Escape closes and returns focus · menu link navigates and closes · dock fixed to the bottom with body space reserved |
| JavaScript disabled (390 and 1440) | headline, every section heading and hero image visible · mobile nav links shown without the menu script · offers message visible |
| Keyboard | first Tab = skip link · skip link focuses `main` · visible focus outline on the next 8 controls |
| Offer dates | fixture offers injected into the real page with a controlled clock: live offer shown, future/expired hidden · at Dublin midnight the old one hides and the next appears · when all expire, the honest empty message returns |
| Budget (mobile, first screen) | ~329 KB total transfer (JS 4 KB, images ~168 KB, fonts ~134 KB) — target < 1.5 MB · initial JS 4 KB gzip — target < 150 KB |

Launch mode was also tested on a copy with fixture approvals: no draft banner or markers, only
approved services, hours table + `openingHoursSpecification` and `ConvenienceStore` JSON-LD
emitted, still `noindex` without `ALLOW_INDEXING`, and no links to omitted sections.
With the real (unapproved) data, `npm run build:launch` stops with a clear message, as intended.

## Lighthouse 13.4.1 (localhost preview, headless Chromium)

| Run | Performance | Accessibility | Best practices | SEO | LCP | CLS | TBT |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Mobile (simulated Slow 4G, Moto G Power), 3 runs | 96–97 | 100 | 100 | 66* | 2.3–2.4 s | 0.001 | 0 ms |
| Desktop preset | 100 | 100 | 100 | 66* | 0.5–0.6 s | 0 | 0 ms |

\* SEO is 66 **only because the draft is deliberately `noindex`** (“page is blocked from indexing”).

Caveats: localhost has no real network latency or CDN; the mobile figures come from Lighthouse's
simulated throttling. Real-world numbers on `pages.dev` will differ and should be re-measured
after deployment (PageSpeed Insights works for free once the site is public).

## JavaScript

| File | Raw | gzip | When |
| --- | --- | --- | --- |
| main bundle (hero controller, menu, tilt, magnetic, counter, offers guard) | 10.4 KB | 4.0 KB | every visit |
| scroll scenes (GSAP core) | 71.5 KB | 27.7 KB | desktop only, motion allowed, after idle |

ScrollTrigger was tried first and removed: it keeps a `requestAnimationFrame` loop running on an
idle page (measured ~60 calls/s). The replacement scroll observer runs only while scrolling and
GSAP's ticker is put to sleep when nothing animates (measured 0 idle frames).

## Visual review done

Screenshots inspected at 320, 390, 768, 1024, 1440 and 1920 px, the hero with the pointer at each
corner, card hover, the three scroll moments, reduced motion and no-JS full pages.

## Not verified (needs real devices or people)

- Safari/iOS and Firefox rendering; real Android/iOS touch devices (touch was emulated in Chromium).
- Screen readers (VoiceOver, NVDA, TalkBack) — only automated accessibility checks were run.
- Real browser zoom to 200% (approximated with a 720 px viewport) and Windows high-contrast mode.
- The Google Maps destination, phone number and social accounts (cannot be opened from here).
- An actual Cloudflare Pages deployment and its headers (`_headers` is generated and inspected only).
- Any shop facts — see `RESEARCH-NOTES.md`.
