#!/usr/bin/env node
/**
 * Automated QA for the built site. Run against the PRODUCTION preview:
 *
 *   npm run build && npm run preview          # terminal 1 (serves http://localhost:4321)
 *   npm run test:e2e                          # terminal 2
 *   npm run test:e2e -- http://localhost:4321/  (optional URL)
 *
 * Needs the `playwright` dev dependency and a Chromium build. If Playwright's own browser is
 * not installed, set CHROMIUM_PATH to a local Chrome/Chromium executable.
 * Writes screenshots and a JSON report to qa-output/ (git-ignored).
 */
import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';

const URL_BASE = process.argv[2] || 'http://localhost:4321/';
const OUT = new URL('../qa-output/', import.meta.url);
await mkdir(OUT, { recursive: true });

const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
const results = [];
const record = (name, pass, detail = '') => {
  results.push({ name, pass, detail });
  console.log(`${pass ? 'PASS' : 'FAIL'}  ${name}${detail ? ` — ${detail}` : ''}`);
};

async function open(opts = {}, init) {
  const ctx = await browser.newContext({
    viewport: opts.viewport ?? { width: 1440, height: 900 },
    deviceScaleFactor: opts.dpr ?? 1,
    hasTouch: !!opts.touch,
    isMobile: !!opts.touch,
    reducedMotion: opts.reduced ? 'reduce' : 'no-preference',
    javaScriptEnabled: opts.js !== false,
  });
  const page = await ctx.newPage();
  const errors = [];
  const failed = [];
  const requests = [];
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('response', (r) => r.status() >= 400 && failed.push(`${r.status()} ${r.url()}`));
  page.on('request', (r) => requests.push(r.url()));
  if (init) await init(page);
  await page.goto(opts.url ?? URL_BASE, { waitUntil: 'networkidle' });
  return { ctx, page, errors, failed, requests };
}

/** Parse "translate3d(xpx, ypx, 0px) rotate(rdeg)" (any serialisation) into numbers. */
const parseT = (t) => {
  const n = (t.match(/-?\d+(?:\.\d+)?/g) || []).map(Number);
  return { x: n[1] ?? 0, y: n[2] ?? 0, r: n[n.length - 1] ?? 0, raw: t };
};
const atRest = (t) => t === '' || t === 'none' || (() => { const p = parseT(t); return Math.abs(p.x) < 0.05 && Math.abs(p.y) < 0.05 && Math.abs(p.r) < 0.01; })();

async function scrollThrough(page) {
  const h = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y <= h; y += 350) {
    await page.evaluate((v) => window.scrollTo(0, v), y);
    await page.waitForTimeout(90);
  }
  await page.waitForTimeout(700);
}

// ---------------------------------------------------------------- 1. Widths
for (const [w, h, touch] of [
  [320, 640, true],
  [390, 844, true],
  [720, 450, false], // ≈ 1440×900 at 200% zoom
  [768, 1024, true],
  [1024, 768, false],
  [1440, 900, false],
  [1920, 1080, false],
]) {
  const { ctx, page, errors, failed } = await open({ viewport: { width: w, height: h }, touch, dpr: touch ? 2 : 1 });
  await page.screenshot({ path: new URL(`first-screen-${w}.png`, OUT).pathname });
  await scrollThrough(page);
  const info = await page.evaluate(() => {
    const imgs = [...document.querySelectorAll('img')];
    const visibleImgs = imgs.filter((i) => i.getClientRects().length && getComputedStyle(i).visibility !== 'hidden');
    return {
      overflow: document.documentElement.scrollWidth - window.innerWidth,
      h1: document.querySelectorAll('h1').length,
      brokenImages: visibleImgs.filter((i) => !i.complete || i.naturalWidth === 0).map((i) => i.currentSrc || i.src),
      missingAlt: imgs.filter((i) => !i.hasAttribute('alt')).length,
    };
  });
  record(`[${w}px] no console/page errors`, errors.length === 0, errors.join(' | '));
  record(`[${w}px] no failed requests`, failed.length === 0, failed.join(' | '));
  record(`[${w}px] no horizontal overflow`, info.overflow <= 0, `scrollWidth - innerWidth = ${info.overflow}`);
  record(`[${w}px] exactly one h1`, info.h1 === 1, String(info.h1));
  record(`[${w}px] all displayed images loaded`, info.brokenImages.length === 0, info.brokenImages.join(', '));
  record(`[${w}px] every img has an alt attribute`, info.missingAlt === 0, String(info.missingAlt));
  await ctx.close();
}

// ---------------------------------------------------------------- 2. Links & metadata
{
  const { ctx, page } = await open();
  const links = await page.evaluate(() =>
    [...document.querySelectorAll('a[href]')].map((a) => ({
      href: a.getAttribute('href'),
      target: a.target,
      rel: a.rel,
      text: (a.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 60),
    })),
  );
  const anchors = links.filter((l) => l.href.startsWith('#'));
  const missing = [];
  for (const l of anchors) {
    if (l.href === '#') continue;
    const ok = await page.evaluate((id) => !!document.getElementById(id), l.href.slice(1));
    if (!ok) missing.push(l.href);
  }
  record('internal anchors resolve', missing.length === 0, missing.join(', ') || `${anchors.length} checked`);
  const tel = links.filter((l) => l.href.startsWith('tel:'));
  record('phone links use +353906457455', tel.length > 0 && tel.every((l) => l.href === 'tel:+353906457455'), `${tel.length} tel links`);
  const external = links.filter((l) => /^https?:/.test(l.href));
  record(
    'external links open safely (target=_blank + noopener)',
    external.every((l) => l.target === '_blank' && /noopener/.test(l.rel)),
    [...new Set(external.map((l) => l.href))].join(' , '),
  );
  const meta = await page.evaluate(() => ({
    robots: document.querySelector('meta[name="robots"]')?.getAttribute('content'),
    canonical: document.querySelector('link[rel="canonical"]')?.getAttribute('href') ?? null,
    jsonld: document.querySelectorAll('script[type="application/ld+json"]').length,
    lcp: document.querySelector('.so__bg img')?.getAttribute('fetchpriority'),
    firstSection: document.querySelector('main > section')?.id,
    soCards: document.querySelectorAll('.so-card').length,
    lang: document.documentElement.lang,
  }));
  record('preview is noindex', meta.robots === 'noindex, nofollow', String(meta.robots));
  record('no canonical before a deployment URL is set', meta.canonical === null, String(meta.canonical));
  record('structured data present (business facts approved)', meta.jsonld === 1, String(meta.jsonld));
  record('offers banner image is high fetch priority', meta.lcp === 'high', String(meta.lcp));
  record('Special Offers is the first section, with four cards', meta.firstSection === 'special-offers' && meta.soCards === 4, `${meta.firstSection} / ${meta.soCards}`);
  record('document language set', meta.lang === 'en-IE', meta.lang);
  const res = await page.request.get(new URL('/does-not-exist', URL_BASE).href);
  record('unknown path returns the 404 page', res.status() === 404, String(res.status()));
  await ctx.close();
}

// ---------------------------------------------------------------- 3. Hero pointer choreography
{
  const { ctx, page, errors } = await open({}, (p) =>
    p.addInitScript(() => {
      // Count animation frames so we can prove the controller sleeps when idle.
      const raf = window.requestAnimationFrame.bind(window);
      window.__rafCount = 0;
      window.requestAnimationFrame = (cb) => {
        window.__rafCount++;
        return raf(cb);
      };
    }),
  );
  await page.waitForTimeout(1600); // entrance + idle-loaded scroll scenes
  await page.evaluate(() => { document.documentElement.style.scrollBehavior = 'auto'; document.querySelector('[data-hero]').scrollIntoView({ block: 'start', behavior: 'instant' }); window.scrollBy({ top: -80, behavior: 'instant' }); });
  await page.waitForTimeout(400);
  const layerState = () =>
    page.evaluate(() => ({
      layers: [...document.querySelectorAll('[data-hero] [data-layer]')].map((el) => el.style.transform || 'none'),
      lit: document.querySelector('[data-hero]').classList.contains('is-lit'),
      ctas: [...document.querySelectorAll('.hero__actions a')].map((a) => {
        const r = a.getBoundingClientRect();
        return [r.x, r.y, r.width, r.height].map((n) => Math.round(n * 10) / 10).join(',');
      }),
      h1: (() => {
        const r = document.querySelector('#hero-title').getBoundingClientRect();
        return [r.x, r.y].map((n) => Math.round(n)).join(',');
      })(),
    }));
  const rest = await layerState();
  const hero = await page.evaluate(() => {
    const r = document.querySelector('[data-hero]').getBoundingClientRect();
    return { x: r.x, y: r.y, w: r.width, h: r.height };
  });
  hero.h = Math.min(hero.h, 900 - hero.y);
  const corners = {
    'top-left': [hero.x + 4, hero.y + 4],
    'top-right': [hero.x + hero.w - 4, hero.y + 4],
    'bottom-left': [hero.x + 4, hero.y + hero.h - 4],
    'bottom-right': [hero.x + hero.w - 4, hero.y + hero.h - 4],
  };
  await page.mouse.move(hero.x + hero.w / 2, hero.y + hero.h / 2);
  const seen = {};
  for (const [name, [x, y]] of Object.entries(corners)) {
    await page.mouse.move(x, y, { steps: 10 });
    await page.waitForTimeout(700);
    const s = await layerState();
    seen[name] = s;
    await page.screenshot({ path: new URL(`hero-pointer-${name}.png`, OUT).pathname });
  }
  const moved = Object.values(seen).every((s) => s.layers.some((t) => !atRest(t)));
  record('hero layers react to the pointer at every corner', moved);
  record('cursor light switches on inside the hero', Object.values(seen).every((s) => s.lit));
  record(
    'CTA hit targets and headline stay put while layers move',
    Object.values(seen).every((s) => s.ctas.join('|') === rest.ctas.join('|') && s.h1 === rest.h1),
    rest.ctas.join(' | '),
  );
  const fg = parseT(await page.evaluate(() => document.querySelector('.hero__fg').style.transform));
  const bg = parseT(await page.evaluate(() => document.querySelector('.hero__bg').style.transform));
  record('foreground travel within 20–32 px and 2–4° at a corner', Math.abs(fg.x) >= 20 && Math.abs(fg.x) <= 32.5 && Math.abs(fg.r) >= 1.8 && Math.abs(fg.r) <= 4.1, fg.raw);
  record('background moves 6–10 px opposite the pointer', Math.abs(bg.x) >= 5.5 && Math.abs(bg.x) <= 10.5 && Math.sign(bg.x) === -Math.sign(fg.x), bg.raw);

  // Fast exit: leave the hero, everything must settle back and the loop must sleep.
  await page.mouse.move(700, 5, { steps: 2 });
  await page.waitForTimeout(2200);
  const after = await layerState();
  record(
    'layers return to rest after the pointer leaves',
    after.layers.every(atRest),
    after.layers.slice(0, 2).join(' ; '),
  );
  record('light switches off after leaving', !after.lit);
  const before = await page.evaluate(() => window.__rafCount);
  await page.waitForTimeout(1500);
  const idleFrames = (await page.evaluate(() => window.__rafCount)) - before;
  record('no animation frames requested while idle (1.5 s window)', idleFrames === 0, `${idleFrames} rAF calls`);

  // Hidden tab: simulate visibility change, controller must rest immediately.
  await page.mouse.move(hero.x + hero.w - 40, hero.y + 60, { steps: 6 });
  await page.waitForTimeout(150);
  await page.evaluate(() => {
    Object.defineProperty(document, 'hidden', { configurable: true, get: () => true });
    document.dispatchEvent(new Event('visibilitychange'));
  });
  const hidden = await layerState();
  record('hidden tab returns layers to rest immediately', !hidden.lit && hidden.layers.every(atRest));
  record('no errors during pointer tests', errors.length === 0, errors.join(' | '));

  // Magnetic button: the anchor does not move, only its inner layer.
  await page.evaluate(() => {
    Object.defineProperty(document, 'hidden', { configurable: true, get: () => false });
    document.querySelector('.hero__actions').scrollIntoView({ block: 'center', behavior: 'instant' });
  });
  const cta = page.locator('.hero__actions a').first();
  const box = await cta.boundingBox();
  await page.mouse.move(box.x + box.width * 0.8, box.y + box.height * 0.3, { steps: 6 });
  await page.waitForTimeout(450);
  const mag = await page.evaluate(() => {
    const a = document.querySelector('.hero__actions a');
    const r = a.getBoundingClientRect();
    return { inner: a.querySelector('.btn__inner').style.transform, x: r.x, y: r.y };
  });
  record('magnetic CTA moves only its inner layer', /translate3d/.test(mag.inner) && Math.abs(mag.x - box.x) < 0.5 && Math.abs(mag.y - box.y) < 0.5, `${mag.inner} anchor Δ ${(mag.x - box.x).toFixed(2)},${(mag.y - box.y).toFixed(2)}`);

  // Card pop-up on hover.
  await page.evaluate(() => document.querySelector('.features').scrollIntoView({ block: 'center', behavior: 'instant' }));
  await page.waitForTimeout(300);
  const card = page.locator('.feature').first();
  const cb = await card.boundingBox();
  await page.mouse.move(cb.x + cb.width * 0.7, cb.y + cb.height * 0.3, { steps: 5 });
  await page.waitForTimeout(700);
  const pop = await page.evaluate(() => {
    const body = document.querySelector('.feature .pop__body');
    const t = new DOMMatrix(getComputedStyle(body).transform);
    return { ty: t.m42, scale: t.a, tilt: document.querySelector('.feature [data-tilt-target]').style.transform };
  });
  record('feature card pops up on hover (lift + scale + tilt)', pop.ty < -8 && pop.scale > 1.02 && /rotateX/.test(pop.tilt), JSON.stringify(pop));
  await page.screenshot({ path: new URL('card-hover.png', OUT).pathname });
  await ctx.close();
}

// ---------------------------------------------------------------- 4. Reduced motion
{
  const { ctx, page, requests } = await open({ reduced: true });
  await page.waitForTimeout(1500);
  await page.mouse.move(900, 300, { steps: 8 });
  await page.mouse.move(1300, 200, { steps: 8 });
  await page.waitForTimeout(500);
  const s = await page.evaluate(() => ({
    layers: [...document.querySelectorAll('[data-layer]')].map((el) => el.style.transform),
    lit: document.querySelector('[data-hero]').classList.contains('is-lit'),
    words: [...document.querySelectorAll('.counter__word > span')].map((el) => el.style.transform),
  }));
  record('reduced motion: no pointer parallax', s.layers.every((t) => t === '') && !s.lit);
  record('reduced motion: GSAP scroll scenes not loaded', !requests.some((u) => /scroll-scenes|ScrollTrigger/i.test(u)));
  record('reduced motion: counter heading fully visible', s.words.every((t) => t === ''));
  await scrollThrough(page);
  await page.screenshot({ path: new URL('reduced-motion-full.png', OUT).pathname, fullPage: true });

  // Preference change during the session (motion → reduce) must stop everything.
  await ctx.close();
  const live = await open();
  await live.page.waitForTimeout(1500);
  await live.page.mouse.move(1200, 300, { steps: 8 });
  await live.page.waitForTimeout(300);
  await live.page.emulateMedia({ reducedMotion: 'reduce' });
  await live.page.waitForTimeout(300);
  const l = await live.page.evaluate(() => [...document.querySelectorAll('[data-layer]')].map((el) => el.style.transform));
  record('switching to reduced motion mid-session clears pointer transforms', l.every((t) => t === ''));
  await live.ctx.close();
}

// ---------------------------------------------------------------- 5. Touch + mobile menu
{
  const { ctx, page, errors } = await open({ viewport: { width: 390, height: 844 }, touch: true, dpr: 2 });
  await page.waitForTimeout(1200);
  await page.tap('.hero__stage');
  await page.waitForTimeout(400);
  const t = await page.evaluate(() => [...document.querySelectorAll('[data-layer]')].map((el) => el.style.transform));
  record('touch: no pointer-follow transforms', t.every((x) => x === ''));
  const toggle = page.locator('[data-menu-toggle]');
  await toggle.tap();
  const open1 = await page.evaluate(() => ({
    expanded: document.querySelector('[data-menu-toggle]').getAttribute('aria-expanded'),
    visible: getComputedStyle(document.querySelector('[data-menu]')).display !== 'none',
    focus: document.activeElement?.closest('[data-menu]') !== null,
  }));
  record('mobile menu opens and moves focus into it', open1.expanded === 'true' && open1.visible && open1.focus, JSON.stringify(open1));
  await page.keyboard.press('Escape');
  const closed = await page.evaluate(() => ({
    expanded: document.querySelector('[data-menu-toggle]').getAttribute('aria-expanded'),
    focusOnToggle: document.activeElement === document.querySelector('[data-menu-toggle]'),
  }));
  record('Escape closes the menu and returns focus to the toggle', closed.expanded === 'false' && closed.focusOnToggle);
  await toggle.tap();
  await page.locator('[data-menu] a[href="#visit"]').tap();
  await page.waitForTimeout(900);
  const nav = await page.evaluate(() => ({
    expanded: document.querySelector('[data-menu-toggle]').getAttribute('aria-expanded'),
    top: Math.round(document.getElementById('visit').getBoundingClientRect().top),
  }));
  record('menu link navigates and closes the menu', nav.expanded === 'false' && nav.top < 200, JSON.stringify(nav));
  const dock = await page.evaluate(() => {
    const d = document.querySelector('.dock').getBoundingClientRect();
    return { top: d.top, bottom: d.bottom, pad: parseFloat(getComputedStyle(document.body).paddingBottom) };
  });
  record('mobile dock sits at the bottom and body reserves its space', dock.bottom <= 844 && dock.pad >= 60, JSON.stringify(dock));
  record('touch: no errors', errors.length === 0, errors.join(' | '));
  await ctx.close();
}

// ---------------------------------------------------------------- 6. JavaScript disabled
for (const [w, h] of [
  [390, 844],
  [1440, 900],
]) {
  const { ctx, page } = await open({ viewport: { width: w, height: h }, js: false });
  const s = await page.evaluate(() => {
    const visible = (sel) => {
      const el = document.querySelector(sel);
      if (!el) return false;
      const r = el.getBoundingClientRect();
      const cs = getComputedStyle(el);
      return r.width > 0 && r.height > 0 && cs.visibility !== 'hidden' && cs.opacity !== '0';
    };
    return {
      h1: visible('#hero-title'),
      sections: ['#so-title', '#fm-title', '#services-title', '#local-title', '#visit-title'].map(visible),
      mobileLinks: [...document.querySelectorAll('[data-menu] a')].filter((a) => a.getBoundingClientRect().width > 0).length,
      offersEmpty: visible('.so-card'),
      heroImg: visible('.hero__fg img'),
    };
  });
  record(`[no JS ${w}px] headline, sections and hero image visible`, s.h1 && s.sections.every(Boolean) && s.heroImg, JSON.stringify(s.sections));
  if (w < 861) record('[no JS] mobile navigation links are shown without the menu script', s.mobileLinks >= 4, String(s.mobileLinks));
  record(`[no JS ${w}px] special-offer cards visible`, s.offersEmpty);
  await page.screenshot({ path: new URL(`nojs-${w}.png`, OUT).pathname, fullPage: true });
  await ctx.close();
}

// ---------------------------------------------------------------- 7. Keyboard
{
  const { ctx, page } = await open();
  await page.keyboard.press('Tab');
  const first = await page.evaluate(() => document.activeElement?.className);
  record('first Tab reaches the skip link', /skip-link/.test(first || ''), first);
  await page.keyboard.press('Enter');
  await page.waitForTimeout(300);
  const mainFocused = await page.evaluate(() => document.activeElement?.id);
  record('skip link moves focus to main content', mainFocused === 'main', mainFocused);
  let outlines = 0;
  for (let i = 0; i < 8; i++) {
    await page.keyboard.press('Tab');
    outlines += await page.evaluate(() => {
      const el = document.activeElement;
      const target = el.closest('.pop') ? el.querySelector('.pop__body') ?? el : el;
      const cs = getComputedStyle(target);
      return cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) >= 2 ? 1 : 0;
    });
  }
  record('focused controls show a visible focus outline', outlines === 8, `${outlines}/8`);
  // Counter picture selector works from the keyboard (desktop).
  await page.evaluate(() => document.getElementById('menu').scrollIntoView({ behavior: 'instant' }));
  await page.waitForTimeout(500);
  await page.focus('.fm-tile[href="#menu-dinner"]');
  await page.keyboard.press('Enter');
  await page.waitForTimeout(2500);
  const sel = await page.evaluate(() => ({ hash: location.hash, top: Math.round(document.getElementById('menu-dinner').getBoundingClientRect().top) }));
  record('food menu tile opens its category with the keyboard', sel.hash === '#menu-dinner' && sel.top < 200, JSON.stringify(sel));
  await ctx.close();
}

// ---------------------------------------------------------------- 8. Offer validity guard (fixture DOM)
{
  // Inject three fixture offers into the real page and drive the real bundled script with a
  // controlled clock. Times are UTC instants of Europe/Dublin midnights (IST = UTC+1 in October).
  const dublin = (d) => Date.parse(`${d}T00:00:00+01:00`);
  const fixture = [
    { id: 'live', start: dublin('2026-10-08'), end: dublin('2026-10-11') }, // ends after 10 Oct
    { id: 'future', start: dublin('2026-10-11'), end: dublin('2026-10-12') },
    { id: 'expired', start: dublin('2026-10-01'), end: dublin('2026-10-05') },
  ];
  const probe = await open();
  const hasDated = await probe.page.evaluate(() => !!document.querySelector('[data-offers]'));
  await probe.ctx.close();
  if (!hasDated) record('offers date guard: dated-offers section not rendered (featured offers have no dates) — skipped', true);
  else {
  const { ctx, page } = await open({}, async (p) => {
    await p.clock.install({ time: new Date('2026-10-10T20:00:00+01:00') });
    await p.route(URL_BASE, async (route) => {
      const resp = await route.fetch();
      let html = await resp.text();
      const items = fixture
        .map((o) => `<li data-offer data-start="${o.start}" data-end="${o.end}" id="fx-${o.id}"><p>${o.id}</p></li>`)
        .join('');
      html = html.replace(/(<section[^>]*data-offers[^>]*>)/, `$1<ul data-offers-list>${items}</ul>`);
      await route.fulfill({ response: resp, body: html, headers: { ...resp.headers(), 'content-type': 'text/html' } });
    });
  });
  const state = () =>
    page.evaluate(() => ({
      live: !document.getElementById('fx-live').hidden,
      future: !document.getElementById('fx-future').hidden,
      expired: !document.getElementById('fx-expired').hidden,
      empty: !document.querySelector('[data-offers-empty]').hidden,
    }));
  const s1 = await state();
  record('offers: live shown, future and expired hidden on load', s1.live && !s1.future && !s1.expired && !s1.empty, JSON.stringify(s1));
  await page.clock.fastForward(4.5 * 3600 * 1000); // past midnight Dublin, 11 Oct
  await page.evaluate(() => document.dispatchEvent(new Event('visibilitychange')));
  const s2 = await state();
  record('offers: at the Dublin midnight boundary the old offer hides and the next appears', !s2.live && s2.future && !s2.empty, JSON.stringify(s2));
  await page.clock.fastForward(24 * 3600 * 1000);
  await page.evaluate(() => document.dispatchEvent(new Event('visibilitychange')));
  const s3 = await state();
  record('offers: when everything has expired the honest empty message returns', !s3.live && !s3.future && s3.empty, JSON.stringify(s3));
  await ctx.close();
  }
}

// ---------------------------------------------------------------- 9. Transfer budget (mobile, first screen, no scrolling)
{
  const { ctx, page } = await open({ viewport: { width: 390, height: 844 }, touch: true, dpr: 2 });
  await page.waitForTimeout(2500);
  const t = await page.evaluate(() => {
    const nav = performance.getEntriesByType('navigation')[0];
    const res = performance.getEntriesByType('resource');
    const sum = (arr) => arr.reduce((a, r) => a + (r.transferSize || r.encodedBodySize || 0), 0);
    return {
      total: sum(res) + (nav.transferSize || nav.encodedBodySize || 0),
      js: sum(res.filter((r) => r.initiatorType === 'script' || /\.js(\?|$)/.test(r.name))),
      images: sum(res.filter((r) => r.initiatorType === 'img' || /\.(avif|webp|jpe?g|png)/.test(r.name))),
      fonts: sum(res.filter((r) => /\.woff2/.test(r.name))),
    };
  });
  const kb = (n) => `${(n / 1024).toFixed(1)} KB`;
  record('mobile first-screen transfer under 1.5 MB', t.total < 1.5 * 1024 * 1024, `total ${kb(t.total)} · JS ${kb(t.js)} · images ${kb(t.images)} · fonts ${kb(t.fonts)}`);
  record('initial JavaScript under 150 KB', t.js < 150 * 1024, kb(t.js));
  await ctx.close();
}

await browser.close();
const failedCount = results.filter((r) => !r.pass).length;
await writeFile(new URL('report.json', OUT), JSON.stringify({ url: URL_BASE, date: new Date().toISOString(), results }, null, 2));
console.log(`\n${results.length - failedCount}/${results.length} checks passed. Report: qa-output/report.json`);
process.exit(failedCount ? 1 : 0);
