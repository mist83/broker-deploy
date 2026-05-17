#!/usr/bin/env node

import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import http from 'node:http';
import net from 'node:net';
import path from 'node:path';
import { promisify } from 'node:util';
import { execFile } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const execFileAsync = promisify(execFile);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const docsRoot = path.join(repoRoot, 'docs');
const docsIndexPath = path.join(docsRoot, 'index.html');
const frontdoorPath = path.join(docsRoot, 'frontdoor.json');
const defaultPlanPath = path.join(docsRoot, 'demo', 'proof-plan.json');
const defaultManifestPath = path.join(docsRoot, 'demo', 'manifest.json');
const defaultPosterPath = path.join(docsRoot, 'demo', 'poster.png');
const defaultVideoPath = path.join(docsRoot, 'demo', 'demo.mp4');
const defaultChaptersDir = path.join(docsRoot, 'demo', 'chapters');
const defaultClipsDir = path.join(docsRoot, 'demo', 'clips');
const defaultSegmentsDir = path.join(repoRoot, 'output', 'proof-video-segments');
const defaultWatchContractPath = path.join(repoRoot, 'contracts', 'fixtures', 'watch.json');
const browserCandidates = [
    process.env.CHROME_EXECUTABLE,
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Chromium.app/Contents/MacOS/Chromium',
    '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
].filter(Boolean);

async function main() {
    const options = parseArgs(process.argv.slice(2));
    const browserPath = resolveBrowserPath(options.browserPath);
    const ffmpegPath = resolveFfmpegPath(options.ffmpegPath);
    const planPath = path.resolve(options.planPath || defaultPlanPath);
    const manifestPath = path.resolve(options.manifestPath || defaultManifestPath);
    const posterPath = path.resolve(options.posterPath || defaultPosterPath);
    const videoPath = path.resolve(options.videoPath || defaultVideoPath);
    const chaptersDir = path.resolve(options.chaptersDir || defaultChaptersDir);
    const clipsDir = path.resolve(options.clipsDir || defaultClipsDir);
    const segmentsDir = path.resolve(options.segmentsDir || defaultSegmentsDir);
    const watchContractPath = path.resolve(options.watchContractPath || defaultWatchContractPath);

    const plan = JSON.parse(await readFile(planPath, 'utf8'));
    const frontdoor = JSON.parse(await readFile(frontdoorPath, 'utf8'));

    await rm(chaptersDir, { recursive: true, force: true });
    await mkdir(chaptersDir, { recursive: true });
    await rm(clipsDir, { recursive: true, force: true });
    await mkdir(clipsDir, { recursive: true });
    await mkdir(path.dirname(manifestPath), { recursive: true });
    await mkdir(path.dirname(posterPath), { recursive: true });
    await mkdir(path.dirname(videoPath), { recursive: true });
    await mkdir(path.dirname(watchContractPath), { recursive: true });
    await rm(segmentsDir, { recursive: true, force: true });
    await mkdir(segmentsDir, { recursive: true });

    const server = options.baseUrl
        ? null
        : await startStaticServer(repoRoot, options.port);
    const baseUrl = options.baseUrl || server.baseUrl;
    const docsUrl = new URL('/docs/index.html', baseUrl);
    const captureDelayMs = Number(plan.captureDelayMs || 5000);
    const viewport = {
        width: Number(plan.viewport?.width || 1440),
        height: Number(plan.viewport?.height || 900),
    };

    try {
        const chapterOutputs = [];

        for (const chapter of plan.chapters || []) {
            const imageName = `${chapter.id}.png`;
            const imagePath = path.join(chaptersDir, imageName);
            const captureUrl = new URL(chapter.href, docsUrl).toString();

            await captureScreenshot({
                browserPath,
                url: captureUrl,
                outputPath: imagePath,
                width: viewport.width,
                height: viewport.height,
                delayMs: Number(chapter.captureDelayMs || captureDelayMs),
            });

            chapterOutputs.push({
                ...chapter,
                durationSeconds: Number(chapter.durationSeconds || plan.chapterDurationSeconds || 3),
                imageName,
                imagePath,
                captureUrl,
            });
        }

        const posterInputs = chapterOutputs.filter((chapter) => chapter.poster).slice(0, 6);
        if (posterInputs.length === 0) {
            throw new Error('Proof plan must mark at least one chapter with "poster": true.');
        }

        await renderPoster({
            ffmpegPath,
            inputs: posterInputs.map((chapter) => chapter.imagePath),
            outputPath: posterPath,
        });

        await renderVideo({
            ffmpegPath,
            inputs: chapterOutputs,
            outputPath: videoPath,
            clipsDir,
            segmentsDir,
            width: 1280,
            height: 800,
        });

        const manifest = buildManifest({
            plan,
            frontdoor,
            planPath,
            manifestPath,
            posterPath,
            videoPath,
            chaptersDir,
            clipsDir,
            chapters: chapterOutputs,
        });

        await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
        await writeFile(
            watchContractPath,
            `${JSON.stringify(buildWatchContract({ manifest }), null, 2)}\n`,
            'utf8'
        );

        console.log(`Proof artifacts written for ${frontdoor.repo}`);
        console.log(`Poster: ${posterPath}`);
        console.log(`Video: ${videoPath}`);
        console.log(`Manifest: ${manifestPath}`);
        console.log(`Watch: ${watchContractPath}`);
    } finally {
        if (server) {
            await stopServer(server.process);
        }
    }
}

function parseArgs(args) {
    const options = {};

    for (let index = 0; index < args.length; index += 1) {
        const arg = args[index];
        const [flag, inlineValue] = arg.split('=', 2);
        const nextValue = inlineValue === undefined ? args[index + 1] : inlineValue;

        switch (flag) {
            case '--base-url':
                options.baseUrl = requireValue(flag, nextValue);
                if (inlineValue === undefined) index += 1;
                break;
            case '--browser':
                options.browserPath = requireValue(flag, nextValue);
                if (inlineValue === undefined) index += 1;
                break;
            case '--ffmpeg':
                options.ffmpegPath = requireValue(flag, nextValue);
                if (inlineValue === undefined) index += 1;
                break;
            case '--plan':
                options.planPath = requireValue(flag, nextValue);
                if (inlineValue === undefined) index += 1;
                break;
            case '--manifest':
                options.manifestPath = requireValue(flag, nextValue);
                if (inlineValue === undefined) index += 1;
                break;
            case '--poster':
                options.posterPath = requireValue(flag, nextValue);
                if (inlineValue === undefined) index += 1;
                break;
            case '--video':
                options.videoPath = requireValue(flag, nextValue);
                if (inlineValue === undefined) index += 1;
                break;
            case '--chapters-dir':
                options.chaptersDir = requireValue(flag, nextValue);
                if (inlineValue === undefined) index += 1;
                break;
            case '--clips-dir':
                options.clipsDir = requireValue(flag, nextValue);
                if (inlineValue === undefined) index += 1;
                break;
            case '--segments-dir':
                options.segmentsDir = requireValue(flag, nextValue);
                if (inlineValue === undefined) index += 1;
                break;
            case '--watch-contract':
                options.watchContractPath = requireValue(flag, nextValue);
                if (inlineValue === undefined) index += 1;
                break;
            case '--port':
                options.port = Number.parseInt(requireValue(flag, nextValue), 10);
                if (inlineValue === undefined) index += 1;
                break;
            default:
                throw new Error(`Unknown argument: ${arg}`);
        }
    }

    return options;
}

function requireValue(flag, value) {
    if (!value) {
        throw new Error(`${flag} requires a value.`);
    }
    return value;
}

function resolveBrowserPath(explicitPath) {
    const candidates = [explicitPath, ...browserCandidates].filter(Boolean);

    for (const candidate of candidates) {
        const resolved = path.resolve(candidate);
        if (existsSync(resolved)) {
            return resolved;
        }
    }

    throw new Error('No Chrome-compatible browser found. Set CHROME_EXECUTABLE or pass --browser.');
}

function resolveFfmpegPath(explicitPath) {
    if (explicitPath) {
        const resolved = path.resolve(explicitPath);
        if (existsSync(resolved)) {
            return resolved;
        }
    }

    return 'ffmpeg';
}

async function captureScreenshot({ browserPath, url, outputPath, width, height, delayMs }) {
    await execFileAsync(browserPath, [
        '--headless=new',
        '--disable-gpu',
        '--hide-scrollbars',
        '--allow-file-access-from-files',
        '--force-device-scale-factor=1',
        '--run-all-compositor-stages-before-draw',
        `--window-size=${width},${height}`,
        `--virtual-time-budget=${delayMs}`,
        `--screenshot=${outputPath}`,
        url,
    ]);
}

async function renderPoster({ ffmpegPath, inputs, outputPath }) {
    const safeInputs = inputs.slice(0, 6);
    const filterSteps = [];

    safeInputs.forEach((_, index) => {
        filterSteps.push(
            `[${index}:v]scale=400:350:force_original_aspect_ratio=decrease,pad=400:350:(ow-iw)/2:(oh-ih)/2:color=white[s${index}]`
        );
    });

    const stackedInputs = safeInputs.map((_, index) => `[s${index}]`).join('');
    const layout = ['0_0', '400_0', '800_0', '0_350', '400_350', '800_350'].slice(0, safeInputs.length).join('|');
    filterSteps.push(`${stackedInputs}xstack=inputs=${safeInputs.length}:layout=${layout}[out]`);

    const args = [
        '-y',
        ...safeInputs.flatMap((input) => ['-i', input]),
        '-filter_complex',
        filterSteps.join(';'),
        '-map',
        '[out]',
        '-frames:v',
        '1',
        outputPath,
    ];

    await execFileAsync(ffmpegPath, args);
}

async function renderVideo({ ffmpegPath, inputs, outputPath, clipsDir, segmentsDir, width, height }) {
    const concatListPath = path.join(segmentsDir, 'concat.txt');
    const concatLines = [];

    for (const chapter of inputs) {
        const segmentPath = path.join(clipsDir, `${chapter.id}.mp4`);
        await execFileAsync(ffmpegPath, [
            '-y',
            '-loop',
            '1',
            '-i',
            chapter.imagePath,
            '-vf',
            `scale=${width}:${height}:force_original_aspect_ratio=decrease,pad=${width}:${height}:(ow-iw)/2:(oh-ih)/2:color=white,format=yuv420p`,
            '-t',
            String(chapter.durationSeconds),
            '-r',
            '30',
            '-an',
            '-c:v',
            'libx264',
            '-pix_fmt',
            'yuv420p',
            segmentPath,
        ]);
        concatLines.push(`file '${segmentPath.replace(/'/g, "'\\''")}'`);
    }

    await writeFile(concatListPath, `${concatLines.join('\n')}\n`, 'utf8');

    await execFileAsync(ffmpegPath, [
        '-y',
        '-f',
        'concat',
        '-safe',
        '0',
        '-i',
        concatListPath,
        '-c',
        'copy',
        '-movflags',
        '+faststart',
        outputPath,
    ]);
}

function buildManifest({ plan, frontdoor, planPath, manifestPath, posterPath, videoPath, chaptersDir, clipsDir, chapters }) {
    const artifactBaseUrl = String(plan.artifactBaseUrl || frontdoor.artifactBaseUrl || '').trim();
    const videoFileName = path.basename(videoPath);
    const posterFileName = path.basename(posterPath);
    const manifestFileName = path.basename(manifestPath);
    const docsManifestPath = toDocsRelativePath(manifestPath);
    const docsPosterPath = toDocsRelativePath(posterPath);
    const docsVideoPath = toDocsRelativePath(videoPath);
    const docsPlanPath = toDocsRelativePath(planPath);
    const docsChaptersDir = toDocsRelativePath(chaptersDir).replace(/^\.\//, '');
    const docsClipsDir = toDocsRelativePath(clipsDir).replace(/^\.\//, '');
    const themes = uniqueInOrder(chapters.map((chapter) => chapter.theme));
    const modes = uniqueInOrder(chapters.map((chapter) => chapter.mode));
    const groups = uniqueInOrder(chapters.map((chapter) => chapter.group));
    const routes = chapters.map((chapter) => chapter.href);
    const chapterCount = chapters.length;
    const totalDurationSeconds = chapters.reduce((sum, chapter) => sum + chapter.durationSeconds, 0);

    return {
        repo: frontdoor.repo,
        name: frontdoor.name,
        title: plan.title,
        description: plan.description,
        posterUrl: artifactBaseUrl ? new URL(posterFileName, artifactBaseUrl).toString() : '',
        posterPath: docsPosterPath,
        videoUrl: artifactBaseUrl ? new URL(videoFileName, artifactBaseUrl).toString() : '',
        videoPath: docsVideoPath,
        manifestUrl: artifactBaseUrl ? new URL(manifestFileName, artifactBaseUrl).toString() : '',
        manifestPath: docsManifestPath,
        artifactBaseUrl,
        hasVideo: true,
        posterKind: 'showcase-reel',
        posterNote: 'Generated from the current proof-plan chapter screenshots.',
        generatedAtUtc: new Date().toISOString(),
        generator: {
            script: './scripts/render-proof-demo.mjs',
            mode: 'clip-reel',
        },
        source: {
            planPath: docsPlanPath,
            docsPath: './frontdoor.json',
        },
        summary: {
            chapterCount,
            themeCount: themes.length,
            modeCount: modes.length,
            groupCount: groups.length,
            totalDurationSeconds,
        },
        coverage: {
            themes,
            modes,
            groups,
            routes,
        },
        chapters: chapters.map((chapter) => ({
            id: chapter.id,
            title: chapter.title,
            description: chapter.description,
            group: chapter.group,
            theme: chapter.theme,
            mode: chapter.mode,
            href: chapter.href,
            imagePath: `./${docsChaptersDir}/${chapter.imageName}`,
            imageUrl: artifactBaseUrl ? new URL(`chapters/${chapter.imageName}`, artifactBaseUrl).toString() : '',
            clipPath: `./${docsClipsDir}/${chapter.id}.mp4`,
            clipUrl: artifactBaseUrl ? new URL(`clips/${chapter.id}.mp4`, artifactBaseUrl).toString() : '',
            durationSeconds: chapter.durationSeconds,
            poster: Boolean(chapter.poster),
        })),
    };
}

function buildWatchContract({ manifest }) {
    const chapterGroups = groupBy(manifest.chapters || [], (chapter) => chapter.group || 'other');
    const groupOrder = (manifest.coverage?.groups || []).filter((group) => chapterGroups.has(group));
    const stats = manifest.summary || {};
    const representativeActions = groupOrder
        .map((group) => {
            const firstChapter = (chapterGroups.get(group) || [])[0];
            if (!firstChapter) {
                return null;
            }

            return openAction(`Open ${groupLabel(group)}`, toShellHref(firstChapter.href));
        })
        .filter(Boolean)
        .slice(0, 4);
    const titleRoot = String(manifest.title || 'Demo').trim();
    const reelTitle = /reel$/i.test(titleRoot) ? titleRoot : `${titleRoot} reel`;
    const reelSubtitle = manifest.description || 'Built from the current shell routes.';

    return {
        $schema: '/page-contract.schema.json',
        version: 1,
        title: 'Watch',
        description: reelSubtitle,
        page: {
            component: 'app',
            title: 'Watch',
            subtitle: reelSubtitle,
            actions: representativeActions,
            sections: [
                {
                    component: 'section',
                    title: 'Main reel',
                    description: reelSubtitle,
                    children: [
                        {
                            component: 'preview-screen',
                            title: reelTitle,
                            subtitle: reelSubtitle,
                            caption: `${stats.totalDurationSeconds || 0}s`,
                            label: reelTitle,
                            videoSrc: toRootAsset(manifest.videoPath),
                            poster: toRootAsset(manifest.posterPath),
                            openHref: toRootAsset(manifest.videoPath),
                            openLabel: 'Open reel',
                            readOnly: false,
                            preload: 'metadata',
                            actions: [
                                openAction('Open files', '/docs/index.html?variant=evidence', 'secondary', 'ti ti-files'),
                            ],
                        },
                    ],
                },
                {
                    component: 'section',
                    title: 'What is covered',
                    children: [
                        {
                            component: 'grid',
                            columns: 4,
                            children: [
                                stat('Clips', String(stats.chapterCount || 0), 'One per route'),
                                stat('Themes', String(stats.themeCount || 0), (manifest.coverage?.themes || []).join(', ')),
                                stat('Modes', String(stats.modeCount || 0), (manifest.coverage?.modes || []).join(', ')),
                                stat('Buckets', String(stats.groupCount || 0), (manifest.coverage?.groups || []).join(', ')),
                            ],
                        },
                    ],
                },
                ...groupOrder.map((group) => ({
                    component: 'section',
                    title: groupLabel(group),
                    description: groupDescription(group),
                    children: [
                        {
                            component: 'grid',
                            columns: 2,
                            children: (chapterGroups.get(group) || []).map((chapter) => ({
                                component: 'preview-screen',
                                title: chapter.title,
                                subtitle: chapter.description,
                                caption: [
                                    titleCase(chapter.theme || 'active'),
                                    titleCase(chapter.mode || 'light'),
                                    `${chapter.durationSeconds || 0}s`,
                                ].join(' · '),
                                label: chapter.title,
                                videoSrc: toRootAsset(chapter.clipPath),
                                poster: toRootAsset(chapter.imagePath),
                                openHref: toRootAsset(chapter.clipPath),
                                openLabel: 'Open clip',
                                readOnly: false,
                                preload: 'none',
                                actions: [
                                    openAction('Open route', toShellHref(chapter.href), 'secondary', 'ti ti-arrow-up-right'),
                                    openAction('Open still', toRootAsset(chapter.imagePath), 'secondary', 'ti ti-photo'),
                                ],
                            })),
                        },
                    ],
                })),
            ],
        },
    };
}

function stat(label, value, caption) {
    return {
        component: 'stat',
        label,
        value,
        caption,
    };
}

function openAction(label, href, variant = 'primary', icon = 'ti ti-arrow-up-right') {
    return {
        label,
        variant,
        icon,
        action: {
            type: 'open',
            href,
        },
    };
}

function groupBy(items, keyFn) {
    const groups = new Map();

    items.forEach((item) => {
        const key = keyFn(item);
        if (!groups.has(key)) {
            groups.set(key, []);
        }
        groups.get(key).push(item);
    });

    return groups;
}

function uniqueInOrder(values) {
    return values.filter((value, index) => value && values.indexOf(value) === index);
}

function toDocsRelativePath(targetPath) {
    const relativePath = path.relative(docsRoot, path.resolve(targetPath)).replace(/\\/g, '/');
    return relativePath.startsWith('.') ? relativePath : `./${relativePath}`;
}

function toRootAsset(relativePath) {
    const normalized = String(relativePath || '').replace(/^\.\//, '/docs/');
    if (!normalized) {
        return '';
    }

    return normalized;
}

function toShellHref(href) {
    try {
        const url = new URL(href, 'https://ui.mullmania.local/docs/index.html');
        return `${url.pathname}${url.search}${url.hash}`;
    } catch {
        return href;
    }
}

function groupLabel(group) {
    const labels = {
        start: 'Start',
        examples: 'Examples',
        pages: 'Pages',
        looks: 'Looks',
        style: 'Style',
        map: 'Map',
        'how-to': 'How To',
        recipe: 'Recipe',
        knobs: 'Knobs',
        remakes: 'Remakes',
        proof: 'Proof',
    };

    return labels[group] || titleCase(group);
}

function groupDescription(group) {
    const descriptions = {
        start: 'The simple first stop and the main clicks.',
        examples: 'Shared parts and patterns.',
        pages: 'Full JSON-mounted page routes.',
        looks: 'The same library in each look and mode.',
        style: 'Token and specimen surfaces.',
        map: 'The maintenance hatch for laying out sitemap structure.',
        'how-to': 'Built-in notes for using the library.',
        recipe: 'The tutorial surface that defines the real theme composition model.',
        knobs: 'The shared primitives you actually tune while building a theme.',
        remakes: 'How the shipped themes map back onto the recipe.',
        proof: 'Contract-safe preview surfaces for verifying the result.',
    };

    return descriptions[group] || 'Shipped route clips.';
}

function titleCase(value) {
    return String(value || '')
        .trim()
        .split(/[\s-]+/)
        .filter(Boolean)
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ');
}

async function startStaticServer(rootDir, requestedPort) {
    const port = requestedPort || await findFreePort();
    const serverProcess = spawn('python3', ['-m', 'http.server', String(port), '--directory', rootDir], {
        stdio: ['ignore', 'ignore', 'inherit'],
    });

    const baseUrl = `http://127.0.0.1:${port}`;
    const ready = await waitForHttp(`${baseUrl}/index.html`, 15000);
    if (!ready) {
        await stopServer(serverProcess);
        throw new Error(`Static server did not start at ${baseUrl}`);
    }

    return {
        process: serverProcess,
        baseUrl,
    };
}

async function stopServer(serverProcess) {
    if (!serverProcess || serverProcess.killed) {
        return;
    }

    serverProcess.kill('SIGTERM');
    await new Promise((resolve) => {
        serverProcess.once('exit', resolve);
        setTimeout(() => {
            if (!serverProcess.killed) {
                serverProcess.kill('SIGKILL');
            }
            resolve();
        }, 3000);
    });
}

async function waitForHttp(url, timeoutMs) {
    const deadline = Date.now() + timeoutMs;

    while (Date.now() < deadline) {
        // eslint-disable-next-line no-await-in-loop
        if (await probe(url)) {
            return true;
        }
        // eslint-disable-next-line no-await-in-loop
        await new Promise((resolve) => setTimeout(resolve, 150));
    }

    return false;
}

function probe(url) {
    return new Promise((resolve) => {
        const request = http.get(url, (response) => {
            response.resume();
            resolve(response.statusCode === 200);
        });

        request.on('error', () => resolve(false));
        request.setTimeout(500, () => {
            request.destroy();
            resolve(false);
        });
    });
}

function findFreePort() {
    return new Promise((resolve, reject) => {
        const server = net.createServer();
        server.listen(0, '127.0.0.1', () => {
            const address = server.address();
            if (!address || typeof address === 'string') {
                reject(new Error('Could not resolve a free port.'));
                return;
            }

            const { port } = address;
            server.close(() => resolve(port));
        });
        server.on('error', reject);
    });
}

main().catch((error) => {
    console.error(error.message || error);
    process.exitCode = 1;
});
