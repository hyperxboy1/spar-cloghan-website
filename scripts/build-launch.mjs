#!/usr/bin/env node
/**
 * Cross-platform launch build (works in Windows cmd/PowerShell as well as macOS/Linux).
 * Renders only manager-approved content and FAILS if a placeholder/unapproved image or the
 * core business facts are not yet approved. Indexing stays off unless ALLOW_INDEXING=true.
 *
 *   npm run build:launch
 */
process.env.SITE_MODE = 'launch';
process.env.ASTRO_TELEMETRY_DISABLED ??= '1';

const { build } = await import('astro');
try {
  await build({ root: new URL('..', import.meta.url).pathname });
} catch (err) {
  console.error('\nLaunch build stopped:', err instanceof Error ? err.message : err);
  console.error('See docs/APPROVALS-CHECKLIST.md for what still needs approval.');
  process.exit(1);
}
