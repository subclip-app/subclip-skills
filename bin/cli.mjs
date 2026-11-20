#!/usr/bin/env node
// subclip-skills: installs the Subclip agent skills for the current user (global scope only).
// The app removes project-level skill folders on purpose, so nothing is ever written into a project.
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const pkgRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const pkg = JSON.parse(readFileSync(join(pkgRoot, 'package.json'), 'utf8'));
const MANIFEST = '.subclip-skills.json';

const TARGETS = {
  claude: join(homedir(), '.claude', 'skills'),
  codex: join(homedir(), '.codex', 'skills'),
  agents: join(homedir(), '.agents', 'skills'),
};

const HELP = `subclip-skills ${pkg.version}

Usage: subclip-skills <command> [options]

Commands
  install     Copy the Subclip skills into your agent skill folders (default)
  update      Same as install: replaces the skills this tool installed
  uninstall   Remove only the skills this tool installed
  list        Show the skills in this package and where they are installed

Options
  --target <claude|codex|agents|all>   Where to install (default: claude)
  --only <name,name>                   Install only these skills
  --dry-run                            Show what would change, write nothing
  -h, --help                           Show this help

Skills are installed for your user only. The skills drive the Subclip app over its local MCP
server: open Subclip, then Desktop settings > Connect AI client to add the server to your agent.`;

function parse(argv) {
  const opts = { command: 'install', target: 'claude', only: null, dryRun: false };
  const rest = [];
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    if (a === '-h' || a === '--help') opts.help = true;
    else if (a === '--dry-run') opts.dryRun = true;
    else if (a === '--target') opts.target = argv[++i];
    else if (a === '--only') opts.only = (argv[++i] ?? '').split(',').map((s) => s.trim()).filter(Boolean);
    else if (a.startsWith('--')) fail(`Unknown option ${a}`);
    else rest.push(a);
  }
  if (rest[0]) opts.command = rest[0];
  return opts;
}

function fail(message) {
  console.error(message);
  process.exit(1);
}

function packageSkills() {
  const dir = join(pkgRoot, 'skills');
  if (!existsSync(dir)) fail('This package has no skills folder.');
  return readdirSync(dir).filter((n) => existsSync(join(dir, n, 'SKILL.md'))).sort();
}

function targetDirs(target) {
  if (target === 'all') return Object.entries(TARGETS);
  if (!TARGETS[target]) fail(`Unknown target "${target}". Use claude, codex, agents or all.`);
  return [[target, TARGETS[target]]];
}

function readManifest(dir) {
  try { return JSON.parse(readFileSync(join(dir, MANIFEST), 'utf8')); } catch { return { skills: [] }; }
}

function install(opts) {
  const available = packageSkills();
  const names = opts.only ?? available;
  const unknown = names.filter((n) => !available.includes(n));
  if (unknown.length) fail(`Not in this package: ${unknown.join(', ')}`);
  for (const [label, dir] of targetDirs(opts.target)) {
    const before = readManifest(dir).skills;
    // A folder that exists but was not installed by this tool belongs to the user: skip it.
    const foreign = names.filter((n) => existsSync(join(dir, n)) && !before.includes(n));
    const toWrite = names.filter((n) => !foreign.includes(n));
    console.log(`${opts.dryRun ? '[dry run] ' : ''}${label}: ${toWrite.length} skills -> ${dir}`);
    if (foreign.length) console.log(`  skipped (already there, not installed by this tool): ${foreign.join(', ')}`);
    if (opts.dryRun) continue;
    mkdirSync(dir, { recursive: true });
    for (const name of toWrite) {
      rmSync(join(dir, name), { recursive: true, force: true });
      cpSync(join(pkgRoot, 'skills', name), join(dir, name), { recursive: true });
    }
    const kept = before.filter((n) => !toWrite.includes(n));
    writeFileSync(join(dir, MANIFEST), JSON.stringify({ version: pkg.version, skills: [...new Set([...kept, ...toWrite])].sort() }, null, 2) + '\n');
  }
  if (!opts.dryRun) console.log('\nNext: open the Subclip app, go to Desktop settings > Connect AI client, and add the MCP server to your agent.');
}

function uninstall(opts) {
  for (const [label, dir] of targetDirs(opts.target)) {
    const { skills } = readManifest(dir);
    const names = opts.only ? skills.filter((n) => opts.only.includes(n)) : skills;
    console.log(`${opts.dryRun ? '[dry run] ' : ''}${label}: removing ${names.length} skills from ${dir}`);
    if (opts.dryRun) continue;
    for (const name of names) rmSync(join(dir, name), { recursive: true, force: true });
    const left = skills.filter((n) => !names.includes(n));
    if (left.length) writeFileSync(join(dir, MANIFEST), JSON.stringify({ version: pkg.version, skills: left }, null, 2) + '\n');
    else rmSync(join(dir, MANIFEST), { force: true });
  }
}

function list() {
  const available = packageSkills();
  console.log(`${available.length} skills in @subclip/skills ${pkg.version}:`);
  for (const n of available) console.log(`  ${n}`);
  for (const [label, dir] of Object.entries(TARGETS)) {
    const { skills } = readManifest(dir);
    if (skills.length) console.log(`\nInstalled for ${label} (${dir}): ${skills.length}`);
  }
}

const opts = parse(process.argv.slice(2));
if (opts.help) console.log(HELP);
else if (opts.command === 'install' || opts.command === 'update') install(opts);
else if (opts.command === 'uninstall') uninstall(opts);
else if (opts.command === 'list') list();
else fail(`Unknown command "${opts.command}".\n\n${HELP}`);
