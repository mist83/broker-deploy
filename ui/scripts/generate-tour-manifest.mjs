#!/usr/bin/env node
import { writeFile } from 'node:fs/promises';
import path from 'node:path';
import { normalizeTourManifest, readJson } from './lib/tour-canon.mjs';

const options = parseArgs(process.argv.slice(2));
const sitemapPath = path.resolve(options.sitemap || 'sitemap.json');
const outputPath = path.resolve(options.output || 'ui-tour-manifest.json');
const sitemap = await readJson(sitemapPath);

const manifest = normalizeTourManifest(sitemap, {
    baseHref: options.baseHref,
    generatedFrom: path.relative(process.cwd(), sitemapPath) || 'sitemap.json',
});

await writeFile(outputPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
console.log(`Wrote ${path.relative(process.cwd(), outputPath)} with ${manifest.nodes.length} tour nodes.`);

function parseArgs(args) {
    const parsed = {};
    for (let index = 0; index < args.length; index += 1) {
        const arg = args[index];
        if (!arg.startsWith('--')) continue;
        const key = arg.slice(2).replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
        parsed[key] = args[index + 1];
        index += 1;
    }
    return parsed;
}
