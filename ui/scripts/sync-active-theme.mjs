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
const ALIAS_FILES = [
  {
    fileName: 'style.css',
    targetFileName: 'style.css',
    label: 'Complete Stylesheet',
    documentationUrl: 'https://ui.mullmania.com/active/typography.html',
    summary: 'Entrypoint for the current published default theme.',
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

  for (const aliasFile of ALIAS_FILES) {
    const outputPath = path.join(ACTIVE_ALIAS_DIR, aliasFile.fileName);
    const body = buildAliasFile(aliasFile, normalizedManifest);
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

function buildAliasFile(aliasFile, manifest) {
  const importPath = `../${manifest.themeId}/${aliasFile.targetFileName}`;
  const publishedAtLine = manifest.publishedAt ? ` * Published at: ${manifest.publishedAt}\n` : '';
  const publishedByLine = manifest.publishedBy ? ` * Published by: ${manifest.publishedBy}\n` : '';

  return [
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
    '',
  ].filter((line, index, all) => !(line === '' && all[index - 1] === '')).join('\n');
}

main().catch((error) => {
  console.error(error.message || String(error));
  process.exitCode = 1;
});
