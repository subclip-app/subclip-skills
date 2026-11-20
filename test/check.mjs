#!/usr/bin/env node
// Blocks a publish when skills/ is empty, malformed or contains a dev-only skill.
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const skills = join(root, 'skills');
const devOnly = JSON.parse(readFileSync(join(root, 'dev-only.json'), 'utf8')).skills;
const problems = [];
const names = existsSync(skills) ? readdirSync(skills).filter((n) => existsSync(join(skills, n, 'SKILL.md'))) : [];
if (!names.length) problems.push('skills/ is empty: run `npm run sync` first.');
for (const name of names) {
  if (devOnly.includes(name)) problems.push(`${name} is dev only and must not be published.`);
  const text = readFileSync(join(skills, name, 'SKILL.md'), 'utf8');
  const front = /^---\n([\s\S]*?)\n---/.exec(text)?.[1] ?? '';
  const fm = (key) => new RegExp(`^${key}:\\s*(.+)$`, 'm').exec(front)?.[1]?.trim();
  if (fm('name') !== name) problems.push(`${name}: frontmatter name is "${fm('name') ?? 'missing'}".`);
  if (!fm('description')) problems.push(`${name}: description is missing.`);
  if (/[·—]/.test(text.slice(0, front.length + 8))) problems.push(`${name}: middle dot or em dash in the frontmatter.`);
}
for (const bad of devOnly) if (existsSync(join(skills, bad))) problems.push(`${bad} is present in skills/.`);
if (problems.length) { console.error(problems.join('\n')); process.exit(1); }
console.log(`Check passed: ${names.length} public skills, none dev only.`);
