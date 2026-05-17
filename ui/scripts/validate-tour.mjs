#!/usr/bin/env node
import { execFile } from 'node:child_process';
import { writeFile } from 'node:fs/promises';
import path from 'node:path';
import { promisify } from 'node:util';
import { normalizeTourManifest, readJson, validateTourInputs } from './lib/tour-canon.mjs';

const execFileAsync = promisify(execFile);

const options = parseArgs(process.argv.slice(2));
const sitemapPath = path.resolve(options.sitemap || 'sitemap.json');
const manifestPath = options.manifest ? path.resolve(options.manifest) : null;
const outputPath = options.output ? path.resolve(options.output) : null;
const sitemap = await readJson(sitemapPath);
const manifest = manifestPath
    ? await readJson(manifestPath)
    : normalizeTourManifest(sitemap, {
        baseHref: options.baseHref,
        generatedFrom: path.relative(process.cwd(), sitemapPath) || 'sitemap.json',
    });

const result = validateTourInputs({
    sitemap,
    manifest,
    requireExplicitNarration: options.requireExplicitNarration === true,
});

if (options.baseUrl) {
    const browserResult = await validateBrowserReachability({
        manifest,
        baseUrl: options.baseUrl,
    });
    result.issues.push(...browserResult.issues);
    result.ok = result.ok && browserResult.ok;
}

const report = {
    ok: result.ok,
    checkedAt: new Date().toISOString(),
    sitemap: path.relative(process.cwd(), sitemapPath),
    manifest: manifestPath ? path.relative(process.cwd(), manifestPath) : '(generated in memory)',
    nodeCount: manifest.nodes?.length || 0,
    issues: result.issues,
};

if (outputPath) {
    await writeFile(outputPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
}

for (const issue of report.issues) {
    const prefix = issue.level === 'error' ? 'ERROR' : 'WARN';
    console.error(`${prefix} ${issue.path}: ${issue.message}`);
}

console.log(report.ok
    ? `Tour validation passed for ${report.nodeCount} nodes.`
    : `Tour validation failed with ${report.issues.length} issue(s).`);

process.exit(report.ok ? 0 : 1);

async function validateBrowserReachability({ manifest, baseUrl }) {
    const browserPath = process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
    const issues = [];

    for (const node of manifest.nodes || []) {
        const url = new URL(node.route, baseUrl).toString();
        const viewport = node.viewport || manifest.viewport || { width: 1440, height: 900 };
        let stdout = '';
        try {
            const result = await execFileAsync(browserPath, [
                '--headless=new',
                '--disable-gpu',
                '--no-sandbox',
                `--window-size=${Number(viewport.width)},${Number(viewport.height)}`,
                '--virtual-time-budget=3500',
                '--dump-dom',
                url,
            ], { timeout: 45000, maxBuffer: 25 * 1024 * 1024 });
            stdout = result.stdout || '';
        } catch (err) {
            issues.push(error(node.id, `Browser failed to load ${url}: ${err.message}`));
            continue;
        }

        if (!stdout.includes('data-tab-id=') && !stdout.includes('UI Framework')) {
            issues.push(error(node.id, `Route did not render the UI shell: ${url}`));
        }

        if (node.kind === 'item') {
            const [, itemId] = node.id.split('/');
            if (!stdout.includes(`data-item-id="${itemId}"`) && !stdout.includes(`id="sidebar-${itemId}"`)) {
                issues.push(error(node.id, `Route did not expose sidebar item "${itemId}".`));
            }
        }

        for (const anchor of node.anchors || []) {
            if (!selectorLooksPresent(stdout, anchor.selector)) {
                issues.push(error(`${node.id}.anchors.${anchor.id}`, `Missing anchor selector "${anchor.selector}".`));
            }
        }
    }

    return {
        ok: issues.length === 0,
        issues,
    };
}

function selectorLooksPresent(html, selector) {
    if (!selector) return true;
    if (selector.startsWith('#')) {
        return html.includes(`id="${selector.slice(1)}"`);
    }
    if (selector.startsWith('.')) {
        return html.includes(selector.slice(1));
    }
    return html.includes(selector);
}

function parseArgs(args) {
    const parsed = {};
    for (let index = 0; index < args.length; index += 1) {
        const arg = args[index];
        if (!arg.startsWith('--')) continue;
        const key = arg.slice(2).replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
        const next = args[index + 1];
        if (!next || next.startsWith('--')) {
            parsed[key] = true;
        } else {
            parsed[key] = next;
            index += 1;
        }
    }
    return parsed;
}

function error(path, message) {
    return { level: 'error', path, message };
}
