# Editing content

All business content lives in **`src/data/`**. Components only read from these files, so you
should never need to touch layout code to change a fact, hide a section or add an offer.
After any edit: `npm run build`, check with `npm run preview`, then deploy (see `DEPLOYMENT.md`).

## The three statuses

Every item carries a `status`:

| Status | Review build (`npm run build`) | Launch build (`npm run build:launch`) |
| --- | --- | --- |
| `'approved'` | shown | shown |
| `'review'` | shown with a **“To confirm”** marker | **left out** |
| `'hidden'` | left out | left out |

When the manager confirms something, change its status to `'approved'`. Navigation links and the
“Explore the store” button automatically skip sections that are left out.

## Files

| File | Contents |
| --- | --- |
| `site.ts` | Build mode, indexing switch, page title/description, motion tuning (pixel depths of the hero layers, magnetic strength, card tilt) |
| `business.ts` | Name, address, Eircode, phone, directions link, social links. `status` here gates the launch build and structured data. |
| `hours.ts` | Opening hours. Shown **only** when `approved: true`; otherwise “Please call for today's opening hours.” |
| `services.ts` | Forecourt & store services, one entry each, with `icon` and `status` |
| `counter.ts` | Deli / Coffee / Bakery blocks. `image: null` gives a typography panel instead of a photo. |
| `offers.ts` | Offers (empty by default). Full example in the file's comments. |
| `catering.ts` | Catering enquiry block (`status: 'hidden'` until confirmed) |
| `local.ts` | “Our local shop” heading, text, fact tiles, the dated 2024 award |
| `images.ts` | Image registry: file, alt text, focal points, `placeholder` and `approved` flags |

## Common tasks

### Publish confirmed opening hours

In `src/data/hours.ts`:

```ts
export const hours = {
  approved: true,
  fallbackMessage: "Please call for today's opening hours.",
  store: [
    { days: ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'], opens: '07:00', closes: '22:00' },
    { days: ['Su'], opens: '08:00', closes: '22:00' },
  ],
  deli: [],
  exceptions: [],
};
```

Every day must be covered. Approved hours are also added to the structured data (only when the
business facts are approved too).

### Add an offer

Copy the example from the comment in `src/data/offers.ts` into the `offers` array. Dates are
Irish calendar dates (`YYYY-MM-DD`): the offer appears at **00:00 on `start`** and disappears after
**23:59:59 on `end`**, Europe/Dublin time. The browser re-checks dates on every visit and whenever
a background tab is reopened, so an expired offer disappears even if nobody redeploys — but
redeploy anyway to keep the page tidy. Only `approved: true` offers are ever shown.

### Replace a placeholder photo

1. Put the original file in `src/assets/images/` (JPG/PNG, ideally ≥ 2000 px long edge; a PNG with a
   transparent background works for the hero cut-out).
2. In `src/data/images.ts`, import it and point the entry at it; write a factual `alt` text; set
   `placeholder: false` and `approved: true` once the shop has approved the photo.
3. Adjust `focal` (CSS `object-position`, e.g. `'50% 35%'`) if the crop cuts off the subject.
4. Update `docs/asset-manifest.json` with the source, owner, date and permission.

Astro generates AVIF/WebP in several sizes automatically during the build.

### Add the approved logo

Replace the contents of `src/components/Wordmark.astro` with the logo file (an `<img>` of the SVG
with `alt="SPAR Express"` is enough). Keep its proportions — set only a height.

### Show the catering block

`src/data/catering.ts` → `status: 'review'` to preview it with a marker, `'approved'` to publish.

### Tune the hero motion

`src/data/site.ts` → `motion.heroDepth` (pixels at full pointer travel; negative = opposite
direction), `foregroundRotation` (degrees). Spring stiffness/damping per layer type is in
`src/scripts/hero-stage.ts` (`TUNING`).

## Rules of thumb

- No invented facts, prices, quotes, staff names, ratings or “open now” claims.
- Keep historical news dated (“2024 …, reported July 2024”).
- Research discrepancies belong in `docs/RESEARCH-NOTES.md`, not on the page.
