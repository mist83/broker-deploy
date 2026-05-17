import assert from 'node:assert/strict';
import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import http from 'node:http';
import path from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';
import { fileURLToPath } from 'node:url';

import {
    compilePattern,
    serializePattern
} from '../../../src/index.js';

const BROWSER_LAUNCH_HINT = [
    'Scene viewer smoke needs a local Chrome/Chromium binary.',
    'Run `npm ci` first, then if Puppeteer still cannot launch Chrome, run `npx puppeteer browsers install chrome-headless-shell`.',
    'You can also set `PUPPETEER_EXECUTABLE_PATH` to an installed browser.'
].join(' ');

const argUrlIndex = process.argv.indexOf('--url');
const EXTERNAL_BASE_URL = argUrlIndex >= 0 ? process.argv[argUrlIndex + 1] : '';
const VIEWER_PATH = '/app/examples/scene-viewer/';
const REPO_ROOT = fileURLToPath(new URL('../../..', import.meta.url));
const MIME_TYPES = new Map([
    ['.css', 'text/css; charset=utf-8'],
    ['.html', 'text/html; charset=utf-8'],
    ['.ico', 'image/x-icon'],
    ['.js', 'text/javascript; charset=utf-8'],
    ['.json', 'application/json; charset=utf-8'],
    ['.png', 'image/png'],
    ['.svg', 'image/svg+xml; charset=utf-8'],
    ['.txt', 'text/plain; charset=utf-8']
]);

function buildSerializedPattern() {
    return serializePattern(compilePattern([
        { id: 'alpha', tMs: 0, xNorm: 0.18, yNorm: 0.74, durationMs: 0, isDrag: false, source: 'test' },
        { id: 'beta', tMs: 720, xNorm: 0.41, yNorm: 0.56, durationMs: 0, isDrag: false, source: 'test' },
        { id: 'gamma', tMs: 1320, xNorm: 0.68, yNorm: 0.28, durationMs: 420, isDrag: false, source: 'test' },
        { id: 'delta', tMs: 1820, xNorm: 0.84, yNorm: 0.18, durationMs: 0, isDrag: true, source: 'test' }
    ], { loopable: true }));
}

async function collectLayoutSnapshot(page) {
    return page.evaluate(() => {
        const read = (selector) => {
            const element = document.querySelector(selector);
            if (!element) return null;
            const style = getComputedStyle(element);
            return {
                display: style.display,
                gap: style.gap,
                gridTemplateColumns: style.gridTemplateColumns,
                fontFamily: style.fontFamily,
                borderRadius: style.borderRadius,
                backgroundImage: style.backgroundImage
            };
        };

        const canvas = document.querySelector('#scene-canvas');
        const rect = canvas ? canvas.getBoundingClientRect() : null;

        return {
            hasCanonicalStyle: !!document.querySelector('link[href="https://ui.mikesendpoint.com/active/style.css"]'),
            hasGoogleFonts: !!document.querySelector('link[href*="fonts.googleapis"]'),
            shell: read('.shell'),
            panel: read('.panel'),
            controls: read('.controls'),
            stageTopline: read('.stage-topline'),
            timelineStamps: read('.timeline-stamps'),
            canvasRect: rect ? { width: rect.width, height: rect.height } : null
        };
    });
}

function getContentType(targetPath) {
    return MIME_TYPES.get(path.extname(targetPath).toLowerCase()) || 'application/octet-stream';
}

async function resolveRequestPath(rootDir, requestPathname) {
    const normalizedRoot = path.resolve(rootDir);
    const decodedPath = decodeURIComponent(requestPathname);
    const targetPath = path.resolve(normalizedRoot, `.${decodedPath}`);
    const relativePath = path.relative(normalizedRoot, targetPath);
    if (relativePath.startsWith('..') || path.isAbsolute(relativePath)) {
        throw Object.assign(new Error('Forbidden path traversal.'), { statusCode: 403 });
    }

    let targetStat;
    try {
        targetStat = await stat(targetPath);
    } catch {
        throw Object.assign(new Error('Not found.'), { statusCode: 404 });
    }

    if (targetStat.isDirectory()) {
        const indexPath = path.join(targetPath, 'index.html');
        try {
            await stat(indexPath);
            return indexPath;
        } catch {
            throw Object.assign(new Error('Not found.'), { statusCode: 404 });
        }
    }

    return targetPath;
}

async function createStaticServer(rootDir) {
    const requestLog = [];
    const server = http.createServer(async (request, response) => {
        try {
            const requestUrl = new URL(request.url || '/', 'http://127.0.0.1');
            const targetPath = await resolveRequestPath(rootDir, requestUrl.pathname);
            requestLog.push(`${request.method || 'GET'} ${requestUrl.pathname} -> 200 ${path.relative(rootDir, targetPath)}`);
            if (requestLog.length > 20) {
                requestLog.shift();
            }
            response.writeHead(200, { 'Content-Type': getContentType(targetPath) });
            createReadStream(targetPath)
                .on('error', () => {
                    if (!response.headersSent) {
                        response.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
                    }
                    response.end('Failed to read file.');
                })
                .pipe(response);
        } catch (error) {
            requestLog.push(`${request.method || 'GET'} ${request.url || '/'} -> ${error.statusCode || 500} ${error.message || 'Internal server error.'}`);
            if (requestLog.length > 20) {
                requestLog.shift();
            }
            response.writeHead(error.statusCode || 500, { 'Content-Type': 'text/plain; charset=utf-8' });
            response.end(error.message || 'Internal server error.');
        }
    });

    await new Promise((resolve, reject) => {
        server.once('error', reject);
        server.listen(0, '127.0.0.1', resolve);
    });

    const address = server.address();
    if (!address || typeof address === 'string') {
        throw new Error('Unable to determine scene viewer test server address.');
    }

    return {
        baseUrl: `http://127.0.0.1:${address.port}`,
        getRequestLog: () => requestLog.slice(),
        close: () => new Promise((resolve, reject) => {
            server.close((error) => (error ? reject(error) : resolve()));
        })
    };
}

async function loadPuppeteer() {
    try {
        const module = await import('puppeteer');
        return module.default ?? module;
    } catch (error) {
        throw new Error(`${BROWSER_LAUNCH_HINT} ${error instanceof Error ? error.message : String(error)}`, { cause: error });
    }
}

async function main() {
    const localServer = EXTERNAL_BASE_URL ? null : await createStaticServer(REPO_ROOT);
    const baseUrl = EXTERNAL_BASE_URL || localServer.baseUrl;
    const viewerUrl = new URL(VIEWER_PATH, baseUrl).toString();
    const puppeteer = await loadPuppeteer();
    let browser;

    try {
        try {
            browser = await puppeteer.launch({
                headless: 'new',
                executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            });
        } catch (error) {
            throw new Error(`Failed to launch a browser for the scene viewer smoke. ${error instanceof Error ? error.message : String(error)}`, { cause: error });
        }

        try {
            const serialized = buildSerializedPattern();
            const page = await browser.newPage();
            const bootDiagnostics = [];
            page.on('console', (message) => {
                if (message.type() === 'error' || message.type() === 'warning') {
                    bootDiagnostics.push(`console:${message.type()}:${message.text()}`);
                }
            });
            page.on('pageerror', (error) => {
                bootDiagnostics.push(`pageerror:${error.message}`);
            });
            page.on('requestfailed', (request) => {
                bootDiagnostics.push(`requestfailed:${request.url()}:${request.failure()?.errorText || 'unknown'}`);
            });
            page.on('response', (response) => {
                if (response.status() >= 400) {
                    bootDiagnostics.push(`response:${response.status()}:${response.url()}`);
                }
            });
            await page.goto(`${viewerUrl}?rhythm=${encodeURIComponent(serialized)}`, {
                waitUntil: 'domcontentloaded',
                timeout: 30000
            });
            try {
                await page.waitForFunction(() => !!window.rhythmSceneApp, {
                    timeout: 10000,
                    polling: 100
                });
            } catch (error) {
                const readyState = await page.evaluate(() => document.readyState).catch(() => 'unknown');
                const diagnostics = bootDiagnostics.slice(-5).join(' | ') || 'no boot diagnostics captured';
                const requestLog = localServer?.getRequestLog?.().slice(-5).join(' | ') || 'no local request log';
                throw new Error(
                    `Scene viewer app failed to initialize at ${page.url()} (readyState=${readyState}). ${diagnostics}. requests=${requestLog}`,
                    { cause: error }
                );
            }
            await delay(250);

            let snapshot = await page.evaluate(() => window.rhythmSceneApp.getSnapshot());
            assert.equal(snapshot.source, 'url');
            assert.ok(snapshot.entityCount >= 4);
            assert.equal(snapshot.serialized.length > 10, true);
            if (snapshot.currentMs === 0) {
                await page.evaluate(() => window.rhythmSceneApp.play());
                await delay(180);
                snapshot = await page.evaluate(() => window.rhythmSceneApp.getSnapshot());
            }
            assert.equal(snapshot.status === 'playing' || snapshot.status === 'completed', true);

            await page.evaluate(() => window.rhythmSceneApp.pause());
            const paused = await page.evaluate(() => window.rhythmSceneApp.getSnapshot());
            assert.equal(paused.status, 'paused');
            assert.ok(paused.currentMs > 0);

            await page.evaluate(() => window.rhythmSceneApp.reset());
            const reset = await page.evaluate(() => window.rhythmSceneApp.getSnapshot());
            assert.equal(reset.status, 'ready');
            assert.equal(reset.currentMs, 0);

            const desktopLayout = await collectLayoutSnapshot(page);
            assert.equal(desktopLayout.hasCanonicalStyle, true);
            assert.equal(desktopLayout.hasGoogleFonts, false);
            assert.match(desktopLayout.shell.display, /^grid$/);
            assert.match(desktopLayout.controls.display, /^grid$/);
            assert.match(desktopLayout.stageTopline.display, /^grid$/);
            assert.ok(desktopLayout.canvasRect?.width > 0);

            await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
            await page.reload({ waitUntil: 'domcontentloaded', timeout: 30000 });
            await page.waitForFunction(() => !!window.rhythmSceneApp, {
                timeout: 10000,
                polling: 100
            });
            await delay(250);
            const mobileLayout = await collectLayoutSnapshot(page);
            assert.equal(mobileLayout.hasCanonicalStyle, true);
            assert.equal(mobileLayout.shell.gridTemplateColumns.trim().split(' ').length, 1);
            assert.equal(mobileLayout.controls.gridTemplateColumns.trim().split(' ').length, 1);
            assert.equal(mobileLayout.stageTopline.gridTemplateColumns.trim().split(' ').length, 1);

            const shareUrl = page.url();
            assert.match(shareUrl, /\?rhythm=/);

            const urls = await page.evaluate(() => ({
                dag: window.rhythmSceneApp.buildDagURL(),
                taps: window.rhythmSceneApp.buildTapURL()
            }));
            assert.match(urls.dag, /^https:\/\/dag\.mullmania\.com\/\?rhythm=/);
            assert.match(urls.taps, /^https:\/\/tap-repeater\.mullmania\.com\/\?rhythm=/);

            console.log('scene viewer ok');
        } finally {
            if (browser) {
                await browser.close();
            }
        }
    } finally {
        if (localServer) {
            await localServer.close();
        }
    }
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
