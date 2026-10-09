// @ts-check
import { defineConfig } from 'astro/config';
import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

/**
 * Build modes (see docs/CONTENT-EDITING.md):
 *   review (default) – draft preview for the shop manager. Unapproved-but-sourced
 *                      content is shown with "To confirm" markers. Always noindex.
 *   launch           – only manager-approved content is rendered. The build fails
 *                      if a placeholder/unapproved image or core fact is still in use.
 */
const SITE_MODE = process.env.SITE_MODE === 'launch' ? 'launch' : 'review';
// Search engines may only index a launch build when explicitly allowed.
const ALLOW_INDEXING = SITE_MODE === 'launch' && process.env.ALLOW_INDEXING === 'true';
// Leave unset until the real deployment address is chosen (no canonical URLs before then).
const SITE_URL = process.env.SITE_URL || undefined;

/** Writes Cloudflare Pages `_headers` and `robots.txt` into the build output. */
function cloudflarePagesFiles() {
  return {
    name: 'cloudflare-pages-files',
    hooks: {
      /** @param {{ dir: URL }} options */
      'astro:build:done': async ({ dir }) => {
        /** @param {string} name */
        const out = (name) => fileURLToPath(new URL(name, dir));
        const robotsHeader = ALLOW_INDEXING ? '' : '  X-Robots-Tag: noindex, nofollow\n';
        const headers = `/*
${robotsHeader}  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  X-Frame-Options: DENY
  Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=(), usb=()
  Content-Security-Policy: default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline'; font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'self'; form-action 'none'; frame-ancestors 'none'

/_astro/*
  Cache-Control: public, max-age=31536000, immutable
`;
        const robots = ALLOW_INDEXING
          ? `User-agent: *\nAllow: /\n`
          : `# Preview build: please do not index. (robots.txt is advisory, not access control.)\nUser-agent: *\nDisallow: /\n`;
        await writeFile(out('_headers'), headers);
        await writeFile(out('robots.txt'), robots);
      },
    },
  };
}

export default defineConfig({
  site: SITE_URL,
  output: 'static',
  compressHTML: true,
  build: {
    inlineStylesheets: 'auto',
  },
  devToolbar: { enabled: false },
  integrations: [cloudflarePagesFiles()],
});
