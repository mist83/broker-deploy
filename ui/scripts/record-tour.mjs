#!/usr/bin/env node
import { execFile } from 'node:child_process';
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { promisify } from 'node:util';
import { buildStoryboardScript, readJson } from './lib/tour-canon.mjs';

const execFileAsync = promisify(execFile);
const options = parseArgs(process.argv.slice(2));
const manifestPath = path.resolve(options.manifest || 'ui-tour-manifest.json');
const outputDir = path.resolve(options.outputDir || 'docs/tour');
const chaptersDir = path.join(outputDir, 'chapters');
const clipsDir = path.join(outputDir, 'clips');
const videoPath = path.join(outputDir, 'demo.mp4');
const posterPath = path.join(outputDir, 'poster.png');
const scriptPath = path.join(outputDir, 'storyboard-script.json');
const actPath = path.join(outputDir, 'acts.json');
const manifest = await readJson(manifestPath);
const browserPath = options.browser || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const ffmpegPath = options.ffmpeg || 'ffmpeg';
const baseUrl = options.baseUrl || 'http://127.0.0.1:8080/index.html';

await rm(outputDir, { recursive: true, force: true });
await mkdir(chaptersDir, { recursive: true });
await mkdir(clipsDir, { recursive: true });

const acts = [];
for (const node of manifest.nodes || []) {
    const imagePath = path.join(chaptersDir, `${safeFileName(node.id)}.png`);
    const url = new URL(node.route, baseUrl).toString();
    await captureScreenshot({
        browserPath,
        url,
        outputPath: imagePath,
        viewport: node.viewport || manifest.viewport,
        delayMs: Number(manifest.captureDelayMs || 900),
    });
    acts.push({
        id: node.id,
        label: node.label,
        route: node.route,
        url,
        imagePath: path.relative(outputDir, imagePath),
        durationMs: Number(node.durationMs || 3000),
        actions: node.actions || [],
    });
}

await writeFile(actPath, `${JSON.stringify(acts, null, 2)}\n`, 'utf8');
await writeFile(scriptPath, `${JSON.stringify(buildStoryboardScript(manifest), null, 2)}\n`, 'utf8');
await renderVideo({ ffmpegPath, acts, outputDir, clipsDir, videoPath });
await writeFile(posterPath, await readFile(path.join(outputDir, acts[0].imagePath)));

console.log(`Wrote tour video: ${videoPath}`);
console.log(`Wrote Storyboard script: ${scriptPath}`);

async function captureScreenshot({ browserPath, url, outputPath, viewport, delayMs }) {
    const width = Number(viewport?.width || 1440);
    const height = Number(viewport?.height || 900);
    await execFileAsync(browserPath, [
        '--headless=new',
        '--disable-gpu',
        '--no-sandbox',
        `--window-size=${width},${height}`,
        `--screenshot=${outputPath}`,
        url,
    ], { timeout: 45000 });
    if (delayMs > 0) {
        await new Promise((resolve) => setTimeout(resolve, Math.min(delayMs, 1000)));
    }
}

async function renderVideo({ ffmpegPath, acts, outputDir, clipsDir, videoPath }) {
    const concatPath = path.join(outputDir, 'concat.txt');
    const concatLines = [];

    for (const act of acts) {
        const segmentPath = path.join(clipsDir, `${safeFileName(act.id)}.mp4`);
        await execFileAsync(ffmpegPath, [
            '-y',
            '-hide_banner',
            '-loglevel', 'warning',
            '-loop', '1',
            '-i', path.join(outputDir, act.imagePath),
            '-t', String(Math.max(1, act.durationMs / 1000)),
            '-vf', 'format=yuv420p,scale=trunc(iw/2)*2:trunc(ih/2)*2',
            '-c:v', 'libx264',
            '-preset', 'veryfast',
            '-crf', '22',
            segmentPath,
        ]);
        concatLines.push(`file '${segmentPath.replace(/'/g, "'\\''")}'`);
    }

    await writeFile(concatPath, `${concatLines.join('\n')}\n`, 'utf8');
    await execFileAsync(ffmpegPath, [
        '-y',
        '-hide_banner',
        '-loglevel', 'warning',
        '-f', 'concat',
        '-safe', '0',
        '-i', concatPath,
        '-c', 'copy',
        videoPath,
    ]);
}

function safeFileName(value) {
    return String(value).replace(/[^a-z0-9._-]+/gi, '-').replace(/^-+|-+$/g, '');
}

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
