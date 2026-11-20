#!/usr/bin/env node
// Copies the public skills from the app (resources/agent-skills) into ./skills.
// Usage: node scripts/sync-skills.mjs [path-to-agent-skills]
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const source = resolve(process.argv[2] ?? join(root, '..', 'Ai-video-editor', 'resources', 'agent-skills'));
const devOnly = new Set(JSON.parse(readFileSync(join(root, 'dev-only.json'), 'utf8')).skills);

if (!existsSync(source)) {
  console.error(`Skills source not found: ${source}`);
  process.exit(1);
}
const out = join(root, 'skills');
rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });

let copied = 0;
const skipped = [];
for (const name of readdirSync(source).sort()) {
  const dir = join(source, name);
  if (!statSync(dir).isDirectory() || !existsSync(join(dir, 'SKILL.md'))) continue;
  if (devOnly.has(name)) { skipped.push(name); continue; }
  cpSync(dir, join(out, name), { recursive: true, filter: (p) => !p.endsWith('.DS_Store') });
  copied += 1;
}
console.log(`Synced ${copied} skills from ${source}. Skipped (dev only): ${skipped.join(', ') || 'none'}.`);
