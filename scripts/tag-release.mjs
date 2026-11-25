#!/usr/bin/env node
// After `npm publish`: tags the current commit v<package.json version> and pushes the tag.
// The "GitHub release" workflow then creates the release with generated notes. Refuses when the version is not on npm yet
// (use --force to tag anyway), when the tag exists, or when the tree has uncommitted skill changes.
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const run = (command, args) => execFileSync(command, args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
const { name, version } = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
const tag = `v${version}`;
const force = process.argv.includes('--force');

if (run('git', ['status', '--porcelain', '--', 'skills', 'package.json', 'bin'])) throw new Error('Uncommitted changes in skills, package.json or bin: commit first.');
if (run('git', ['tag', '--list', tag])) throw new Error(`Tag ${tag} already exists.`);
let published = '';
try { published = run('npm', ['view', `${name}@${version}`, 'version']); } catch { /* not published */ }
if (published !== version && !force) throw new Error(`${name}@${version} is not on npm yet. Publish first, or pass --force.`);

run('git', ['tag', '-a', tag, '-m', `${name} ${tag}`]);
run('git', ['push', 'origin', tag]);
console.log(`Tagged and pushed ${tag}. The GitHub release is created by the workflow (Actions tab).`);
