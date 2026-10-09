#!/usr/bin/env node
/**
 * Creates handover archives (no dependencies — Node 22.12+ only):
 *
 *   release/spar-cloghan-site.zip    the built site, index.html at the ZIP root —
 *                                    ready for Cloudflare Pages Direct Upload
 *   release/spar-cloghan-source.zip  the source project WITHOUT node_modules, build output,
 *                                    secrets (.env*), git data or machine-specific files
 *
 * Usage: npm run build && npm run package
 */
import { readdir, readFile, stat, mkdir, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { deflateRawSync, crc32 } from 'node:zlib';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const dist = join(root, 'dist');
const releaseDir = join(root, 'release');

const SOURCE_EXCLUDE = new Set(['node_modules', 'dist', 'release', 'qa-output', '.git', '.astro', '.DS_Store', 'Thumbs.db', '.vscode', '.idea']);
const isSecret = (name) => name === '.env' || (name.startsWith('.env.') && name !== '.env.example');

async function walk(dir, base, exclude) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    if (exclude && (exclude.has(entry.name) || isSecret(entry.name) || entry.name.endsWith('.log'))) continue;
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await walk(full, base, exclude)));
    else if (entry.isFile()) out.push({ full, name: relative(base, full).split(sep).join('/') });
  }
  return out.sort((a, b) => a.name.localeCompare(b.name));
}

function dosTime(d) {
  return {
    time: (d.getHours() << 11) | (d.getMinutes() << 5) | Math.floor(d.getSeconds() / 2),
    date: ((d.getFullYear() - 1980) << 9) | ((d.getMonth() + 1) << 5) | d.getDate(),
  };
}

/** Minimal ZIP writer (deflate, no zip64 — archives here are a few MB). */
async function writeZip(files, target, prefix = '') {
  const chunks = [];
  const central = [];
  let offset = 0;
  for (const f of files) {
    const data = await readFile(f.full);
    const { mtime } = await stat(f.full);
    const { time, date } = dosTime(mtime);
    const name = Buffer.from(prefix + f.name, 'utf8');
    const compressed = deflateRawSync(data, { level: 9 });
    const useDeflate = compressed.length < data.length;
    const body = useDeflate ? compressed : data;
    const crc = crc32(data) >>> 0;

    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0);
    local.writeUInt16LE(20, 4);
    local.writeUInt16LE(0x0800, 6); // UTF-8 names
    local.writeUInt16LE(useDeflate ? 8 : 0, 8);
    local.writeUInt16LE(time, 10);
    local.writeUInt16LE(date, 12);
    local.writeUInt32LE(crc, 14);
    local.writeUInt32LE(body.length, 18);
    local.writeUInt32LE(data.length, 22);
    local.writeUInt16LE(name.length, 26);
    local.writeUInt16LE(0, 28);
    chunks.push(local, name, body);

    const cen = Buffer.alloc(46);
    cen.writeUInt32LE(0x02014b50, 0);
    cen.writeUInt16LE(20, 4);
    cen.writeUInt16LE(20, 6);
    cen.writeUInt16LE(0x0800, 8);
    cen.writeUInt16LE(useDeflate ? 8 : 0, 10);
    cen.writeUInt16LE(time, 12);
    cen.writeUInt16LE(date, 14);
    cen.writeUInt32LE(crc, 16);
    cen.writeUInt32LE(body.length, 20);
    cen.writeUInt32LE(data.length, 24);
    cen.writeUInt16LE(name.length, 28);
    cen.writeUInt32LE(offset, 42);
    central.push(cen, name);
    offset += local.length + name.length + body.length;
  }
  const centralBuf = Buffer.concat(central);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(files.length, 8);
  end.writeUInt16LE(files.length, 10);
  end.writeUInt32LE(centralBuf.length, 12);
  end.writeUInt32LE(offset, 16);
  await writeFile(target, Buffer.concat([...chunks, centralBuf, end]));
  const size = (await stat(target)).size;
  console.log(`✓ ${relative(root, target)} — ${files.length} files, ${(size / 1024 / 1024).toFixed(2)} MB`);
}

if (!existsSync(join(dist, 'index.html'))) {
  console.error('No build found. Run `npm run build` first.');
  process.exit(1);
}
await mkdir(releaseDir, { recursive: true });

const siteFiles = await walk(dist, dist, null);
await writeZip(siteFiles, join(releaseDir, 'spar-cloghan-site.zip'));

const sourceFiles = await walk(root, root, SOURCE_EXCLUDE);
await writeZip(sourceFiles, join(releaseDir, 'spar-cloghan-source.zip'), 'spar-cloghan-website/');
