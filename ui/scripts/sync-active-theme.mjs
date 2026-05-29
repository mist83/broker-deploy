#!/usr/bin/env node

import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');

const ACTIVE_THEME_PATH = path.join(repoRoot, 'active-theme.json');
const SCHEMA_PATH = path.join(repoRoot, 'page-contract.schema.json');
const ACTIVE_ALIAS_DIR = path.join(repoRoot, 'active');
const DEFAULT_LIVE_MANIFEST_URL = process.env.UI_ACTIVE_THEME_URL || 'https://ui.mullmania.com/active-theme.json';
const DEFAULT_THEME_ID = 'walmart';
// Canon primitive stylesheets that live next to their (sometimes-absent) JS in
// js/. They are token-driven and theme-agnostic, but no JS module injects them,
// so the documented contract — "Styles ship with the active theme stylesheet,
// no separate <link> required" (llm-docs.md) — only holds if the complete
// active stylesheet carries them. We inline (concatenate) the source bytes
// rather than @import them so the selectors are literally present in
// active/style.css (curl + grep finds them) and consumers pay no extra
// render-blocking round-trips. js/<name>.css stays the single source of truth;
// active/style.css is a generated artifact rebuilt on every sync/deploy. Keep
// this list in sync with the primitives documented in llm-docs.md.
const PRIMITIVE_CSS_FILES = [
  'form-field.css',
  'choice-card.css',
  'collapsible.css',
  'library-list.css',
  'cards.css',
  'tables.css',
];

const PRIMITIVES_DIR = path.join(repoRoot, 'js');

const ALIAS_FILES = [
  {
    fileName: 'style.css',
    targetFileName: 'style.css',
    label: 'Complete Stylesheet',
    documentationUrl: 'https://ui.mullmania.com/active/typography.html',
    summary: 'Entrypoint for the current published default theme.',
    bundlePrimitives: true,
  },
  {
    fileName: 'layout.css',
    targetFileName: 'layout.css',
    label: 'Layout',
    documentationUrl: 'https://ui.mullmania.com/active/typography.html',
    summary: 'Entrypoint for the current published default layout layer.',
  },
  {
    fileName: 'colors.css',
    targetFileName: 'colors.css',
    label: 'Colors',
    documentationUrl: 'https://ui.mullmania.com/active/typography.html',
    summary: 'Entrypoint for the current published default color token set.',
  },
];

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const localManifest = normalizeManifest(JSON.parse(await readFile(ACTIVE_THEME_PATH, 'utf8')));
  const supportedThemeIds = await loadSupportedConcreteThemeIds();
  let effectiveManifest = localManifest;

  if (options.preferLive) {
    const liveManifest = await tryReadLiveManifest(options.liveManifestUrl, supportedThemeIds);
    if (liveManifest) {
      effectiveManifest = liveManifest;
    }
  }

  validateConcreteThemeId(effectiveManifest.themeId, supportedThemeIds);

  const normalizedManifest = {
    themeId: effectiveManifest.themeId,
    publishedAt: effectiveManifest.publishedAt || localManifest.publishedAt || new Date().toISOString(),
    publishedBy: effectiveManifest.publishedBy || localManifest.publishedBy || 'repo-bootstrap',
  };

  await writeFile(ACTIVE_THEME_PATH, `${JSON.stringify(normalizedManifest, null, 2)}\n`);

  const primitiveBundle = ALIAS_FILES.some((aliasFile) => aliasFile.bundlePrimitives)
    ? await loadPrimitiveBundle()
    : [];

  for (const aliasFile of ALIAS_FILES) {
    const outputPath = path.join(ACTIVE_ALIAS_DIR, aliasFile.fileName);
    const body = buildAliasFile(aliasFile, normalizedManifest, primitiveBundle);
    await writeFile(outputPath, body);
  }

  if (!options.quiet) {
    const source = options.preferLive && effectiveManifest !== localManifest
      ? `live manifest ${options.liveManifestUrl}`
      : 'local manifest';
    console.log(`[active-theme] synced ${normalizedManifest.themeId} from ${source}`);
  }
}

function parseArgs(argv) {
  const options = {
    preferLive: false,
    liveManifestUrl: DEFAULT_LIVE_MANIFEST_URL,
    quiet: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--prefer-live') {
      options.preferLive = true;
      continue;
    }
    if (arg === '--quiet') {
      options.quiet = true;
      continue;
    }
    if (arg === '--live-url') {
      options.liveManifestUrl = requireValue(arg, argv[index + 1]);
      index += 1;
      continue;
    }
    throw new Error(`Unknown argument: ${arg}`);
  }

  return options;
}

function requireValue(flag, value) {
  if (!value) {
    throw new Error(`${flag} requires a value.`);
  }
  return value;
}

async function loadSupportedConcreteThemeIds() {
  const schema = JSON.parse(await readFile(SCHEMA_PATH, 'utf8'));
  const themeIds = Array.isArray(schema?.properties?.theme?.enum) ? schema.properties.theme.enum : [];
  return themeIds
    .map((value) => String(value || '').trim().toLowerCase())
    .filter((value) => value && value !== 'active');
}

async function tryReadLiveManifest(url, supportedThemeIds) {
  try {
    const response = await fetch(url, { cache: 'no-store' });
    if (!response.ok) {
      return null;
    }

    const payload = normalizeManifest(await response.json());
    validateConcreteThemeId(payload.themeId, supportedThemeIds);
    return payload;
  } catch {
    return null;
  }
}

function normalizeManifest(value) {
  const rawThemeId = String(value?.themeId || DEFAULT_THEME_ID).trim().toLowerCase();
  return {
    themeId: rawThemeId || DEFAULT_THEME_ID,
    publishedAt: String(value?.publishedAt || '').trim(),
    publishedBy: String(value?.publishedBy || '').trim(),
  };
}

function validateConcreteThemeId(themeId, supportedThemeIds) {
  if (!supportedThemeIds.includes(themeId)) {
    throw new Error(`Unsupported published theme "${themeId}". Expected one of: ${supportedThemeIds.join(', ')}`);
  }
}

async function loadPrimitiveBundle() {
  const parts = [];
  for (const fileName of PRIMITIVE_CSS_FILES) {
    const raw = await readFile(path.join(PRIMITIVES_DIR, fileName), 'utf8');
    parts.push({ fileName, body: raw.replace(/\s+$/, '') });
  }
  return parts;
}

function buildAliasFile(aliasFile, manifest, primitiveBundle = []) {
  const publishedAtLine = manifest.publishedAt ? ` * Published at: ${manifest.publishedAt}\n` : '';
  const publishedByLine = manifest.publishedBy ? ` * Published by: ${manifest.publishedBy}\n` : '';

  const header = [
    '/**',
    ` * Published Default Theme - ${aliasFile.label}`,
    ' * @generated by scripts/sync-active-theme.mjs',
    ` * @url https://ui.mullmania.com/active/${aliasFile.fileName}`,
    ` * @documentation ${aliasFile.documentationUrl}`,
    ' *',
    ` * ${aliasFile.summary}`,
    ` * Published theme: ${manifest.themeId}`,
    `${publishedAtLine}${publishedByLine}`.trimEnd(),
    ' */',
    '',
    `@import url('../${manifest.themeId}/${aliasFile.targetFileName}');`,
  ].filter((line, index, all) => !(line === '' && all[index - 1] === '')).join('\n');

  if (!aliasFile.bundlePrimitives || primitiveBundle.length === 0) {
    return `${header}\n`;
  }

  // Inline the canon primitive stylesheets after the theme @import so consumers
  // who load only ui.js + the active theme get the documented primitives with no
  // separate <link>. The @import above is the file's only at-rule, so the
  // inlined rules (which come after it) keep the stylesheet spec-valid, and they
  // layer on top of the theme's generic rules. Source of truth is js/<name>.css;
  // editing those and re-running this script refreshes the block below.
  const banner = [
    '',
    '/* ============================================================',
    ' * Canon primitives — inlined from js/*.css (the source of truth).',
    ' * @generated — do not edit below by hand; edit js/<name>.css and',
    ' * re-run scripts/sync-active-theme.mjs. See llm-docs.md.',
    ' * ============================================================ */',
  ].join('\n');

  const inlined = primitiveBundle
    .map(({ fileName, body }) => `\n/* ---------- js/${fileName} ---------- */\n${body}\n`)
    .join('');

  return `${header}\n${banner}\n${inlined}`;
}

main().catch((error) => {
  console.error(error.message || String(error));
  process.exitCode = 1;
});
