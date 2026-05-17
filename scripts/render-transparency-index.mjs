#!/usr/bin/env node

import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'fs';
import path from 'path';

const DEFAULT_PAGE_BASE_URL = 'https://mist83.github.io/broker-deploy';
const MAX_HISTORY = 20;

function main() {
  const args = parseArgs(process.argv.slice(2));
  const pagesDir = path.resolve(args.pagesDir || 'pages-source');
  const pageBaseUrl = trimTrailingSlash(args.pageBaseUrl || process.env.BROKER_PAGE_BASE_URL || DEFAULT_PAGE_BASE_URL);
  const deploymentsDir = path.join(pagesDir, '_deployments');

  if (!existsSync(pagesDir)) {
    throw new Error(`Pages directory does not exist: ${pagesDir}`);
  }

  mkdirSync(deploymentsDir, { recursive: true });

  if (args.siteId) {
    recordDeployment(deploymentsDir, {
      siteId: normalizeSiteId(args.siteId),
      status: 'success',
      deployedAt: args.deployedAt || new Date().toISOString(),
      trigger: normalizeTrigger(args.triggerSource || process.env.REDEPLOY_SOURCE || ''),
      brokerRunId: String(args.runId || process.env.GITHUB_RUN_ID || '').trim(),
      brokerRunNumber: String(args.runNumber || process.env.GITHUB_RUN_NUMBER || '').trim(),
      brokerRunUrl: String(args.runUrl || '').trim(),
      brokerSha: shortSha(args.brokerSha || process.env.GITHUB_SHA || ''),
    });
  }

  const sites = collectSites(pagesDir, deploymentsDir, pageBaseUrl);
  const generatedAt = new Date().toISOString();
  writeFileSync(
    path.join(deploymentsDir, 'index.json'),
    `${JSON.stringify({ generatedAt, sites }, null, 2)}\n`,
  );
  writeFileSync(path.join(pagesDir, 'index.html'), renderHtml({ generatedAt, sites }));
}

function parseArgs(argv) {
  const args = {};
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (!arg.startsWith('--')) {
      throw new Error(`Unexpected argument: ${arg}`);
    }
    const [key, inlineValue] = arg.slice(2).split('=', 2);
    const value = inlineValue ?? argv[index + 1];
    if (inlineValue === undefined) {
      index += 1;
    }
    args[toCamelCase(key)] = value;
  }
  return args;
}

function toCamelCase(value) {
  return String(value).replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
}

function recordDeployment(deploymentsDir, deployment) {
  if (!deployment.siteId) {
    throw new Error('A site id is required to record a deployment.');
  }

  const filePath = path.join(deploymentsDir, `${deployment.siteId}.json`);
  const existing = readJson(filePath, null);
  const previousHistory = Array.isArray(existing?.history)
    ? existing.history
    : existing?.latest
      ? [existing.latest]
      : [];
  const history = [deployment, ...previousHistory]
    .filter((entry) => entry && entry.siteId === deployment.siteId)
    .filter(dedupeBy((entry) => entry.brokerRunId || `${entry.siteId}-${entry.deployedAt}`))
    .slice(0, MAX_HISTORY);

  writeFileSync(filePath, `${JSON.stringify({ siteId: deployment.siteId, latest: deployment, history }, null, 2)}\n`);
}

function collectSites(pagesDir, deploymentsDir, pageBaseUrl) {
  const siteDirs = readdirSync(pagesDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .filter((name) => !name.startsWith('.') && !name.startsWith('_'))
    .filter((name) => existsSync(path.join(pagesDir, name, 'index.html')))
    .sort((left, right) => left.localeCompare(right));

  return siteDirs.map((siteId) => {
    const publish = readJson(path.join(pagesDir, siteId, '.publish.json'), {});
    const deploymentRecord = readJson(path.join(deploymentsDir, `${siteId}.json`), {});
    const latest = deploymentRecord.latest || null;
    const history = Array.isArray(deploymentRecord.history) ? deploymentRecord.history : [];
    const counts = publish.counts && typeof publish.counts === 'object' ? publish.counts : {};

    return {
      siteId,
      status: latest?.status || 'mirrored',
      liveUrl: `https://${siteId}.mullmania.com/`,
      mirrorUrl: `${pageBaseUrl}/${siteId}/`,
      lastPublishedAt: latest?.deployedAt || publish.publishedAt || '',
      latestBrokerRunUrl: latest?.brokerRunUrl || '',
      latestBrokerRunNumber: latest?.brokerRunNumber || '',
      trigger: latest?.trigger || '',
      hostingFiles: Number.isFinite(Number(counts.hostingFiles)) ? Number(counts.hostingFiles) : null,
      hostingBytes: Number.isFinite(Number(counts.hostingBytes)) ? Number(counts.hostingBytes) : null,
      recordedDeployments: history.length,
    };
  });
}

function renderHtml({ generatedAt, sites }) {
  const rows = sites.map((site) => renderSiteRow(site)).join('\n');
  const latest = sites
    .filter((site) => site.lastPublishedAt)
    .slice()
    .sort((left, right) => right.lastPublishedAt.localeCompare(left.lastPublishedAt))
    .slice(0, 8);
  const latestItems = latest.map((site) => (
    `<li><a href="${escapeAttribute(site.mirrorUrl)}">${escapeHtml(site.siteId)}</a><span>${escapeHtml(formatDate(site.lastPublishedAt))}</span></li>`
  )).join('\n');

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Mullmania Broker Transparency</title>
  <style>
    :root {
      color-scheme: light;
      --ink: #182028;
      --muted: #5d6875;
      --line: #d7dee7;
      --surface: #f6f8fb;
      --accent: #12685f;
      --accent-strong: #0b4c46;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      color: var(--ink);
      background: #ffffff;
      font: 15px/1.5 ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    }
    main {
      width: min(1180px, calc(100% - 32px));
      margin: 0 auto;
      padding: 38px 0 54px;
    }
    header {
      display: grid;
      gap: 12px;
      padding-bottom: 24px;
      border-bottom: 1px solid var(--line);
    }
    h1 {
      margin: 0;
      font-size: clamp(2rem, 5vw, 4rem);
      line-height: 0.95;
      letter-spacing: 0;
    }
    p {
      margin: 0;
      max-width: 760px;
      color: var(--muted);
      font-size: 1rem;
    }
    .stats {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 1px;
      margin: 22px 0;
      background: var(--line);
      border: 1px solid var(--line);
    }
    .stat {
      min-height: 96px;
      padding: 18px;
      background: var(--surface);
    }
    .stat strong {
      display: block;
      font-size: 1.8rem;
      line-height: 1;
    }
    .stat span {
      display: block;
      margin-top: 9px;
      color: var(--muted);
    }
    section {
      margin-top: 32px;
    }
    h2 {
      margin: 0 0 14px;
      font-size: 1.08rem;
    }
    .latest {
      display: grid;
      gap: 8px;
      margin: 0;
      padding: 0;
      list-style: none;
    }
    .latest li {
      display: flex;
      justify-content: space-between;
      gap: 20px;
      padding: 10px 0;
      border-bottom: 1px solid var(--line);
    }
    a {
      color: var(--accent-strong);
      text-decoration-thickness: 1px;
      text-underline-offset: 3px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      border-top: 1px solid var(--line);
      border-bottom: 1px solid var(--line);
    }
    th, td {
      padding: 12px 10px;
      text-align: left;
      vertical-align: top;
      border-bottom: 1px solid var(--line);
    }
    th {
      color: var(--muted);
      font-size: 0.78rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0;
      background: var(--surface);
    }
    td {
      overflow-wrap: anywhere;
    }
    .status {
      display: inline-block;
      min-width: 74px;
      padding: 3px 8px;
      color: #ffffff;
      background: var(--accent);
      font-size: 0.78rem;
      font-weight: 700;
      text-align: center;
    }
    .muted {
      color: var(--muted);
    }
    footer {
      margin-top: 28px;
      color: var(--muted);
      font-size: 0.9rem;
    }
    @media (max-width: 820px) {
      .stats { grid-template-columns: 1fr; }
      table, thead, tbody, tr, th, td { display: block; }
      thead { display: none; }
      tr { padding: 12px 0; border-bottom: 1px solid var(--line); }
      td { padding: 5px 0; border: 0; }
      td::before {
        content: attr(data-label);
        display: block;
        color: var(--muted);
        font-size: 0.75rem;
        font-weight: 700;
        text-transform: uppercase;
      }
    }
  </style>
</head>
<body>
  <main>
    <header>
      <h1>Mullmania Broker Transparency</h1>
      <p>Read-only public mirror of the broker-published site artifacts. This page lists public deploy outcomes and links to public broker runs without exposing private source repositories, API keys, target stores, or raw webhook payloads.</p>
    </header>

    <div class="stats" aria-label="Deployment summary">
      <div class="stat"><strong>${sites.length}</strong><span>Mirrored sites</span></div>
      <div class="stat"><strong>${sites.filter((site) => site.latestBrokerRunUrl).length}</strong><span>Sites with broker run records</span></div>
      <div class="stat"><strong>${escapeHtml(formatDate(generatedAt))}</strong><span>Generated</span></div>
    </div>

    <section>
      <h2>Latest Deployments</h2>
      <ul class="latest">
        ${latestItems || '<li><span>No broker deployment records yet.</span><span></span></li>'}
      </ul>
    </section>

    <section>
      <h2>Public Mirror Inventory</h2>
      <table>
        <thead>
          <tr>
            <th>Site</th>
            <th>Status</th>
            <th>Last Published</th>
            <th>Live</th>
            <th>Mirror</th>
            <th>Broker Run</th>
            <th>Files</th>
          </tr>
        </thead>
        <tbody>
          ${rows || '<tr><td colspan="7">No mirrored sites yet.</td></tr>'}
        </tbody>
      </table>
    </section>

    <footer>
      Public JSON: <a href="_deployments/index.json">_deployments/index.json</a>
    </footer>
  </main>
</body>
</html>
`;
}

function renderSiteRow(site) {
  const brokerRun = site.latestBrokerRunUrl
    ? `<a href="${escapeAttribute(site.latestBrokerRunUrl)}">#${escapeHtml(site.latestBrokerRunNumber || 'run')}</a>`
    : '<span class="muted">not recorded</span>';
  const fileCount = site.hostingFiles === null
    ? '<span class="muted">unknown</span>'
    : `${site.hostingFiles.toLocaleString()} <span class="muted">(${escapeHtml(formatBytes(site.hostingBytes || 0))})</span>`;

  return `<tr>
  <td data-label="Site">${escapeHtml(site.siteId)}</td>
  <td data-label="Status"><span class="status">${escapeHtml(site.status)}</span></td>
  <td data-label="Last Published">${escapeHtml(formatDate(site.lastPublishedAt))}</td>
  <td data-label="Live"><a href="${escapeAttribute(site.liveUrl)}">open</a></td>
  <td data-label="Mirror"><a href="${escapeAttribute(site.mirrorUrl)}">open</a></td>
  <td data-label="Broker Run">${brokerRun}</td>
  <td data-label="Files">${fileCount}</td>
</tr>`;
}

function readJson(filePath, fallback) {
  try {
    return JSON.parse(readFileSync(filePath, 'utf8'));
  } catch {
    return fallback;
  }
}

function normalizeSiteId(value) {
  return String(value || '').trim().toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/^-+|-+$/g, '');
}

function normalizeTrigger(value) {
  const text = String(value || '').trim().toLowerCase();
  if (text.includes('webhook')) {
    return 'github-webhook';
  }
  if (text.includes('operator') || text.includes('manual')) {
    return 'operator';
  }
  if (text.includes('sites')) {
    return 'sites-api';
  }
  if (text.includes('broker')) {
    return 'broker';
  }
  return text ? 'external' : 'unspecified';
}

function shortSha(value) {
  return String(value || '').trim().slice(0, 12);
}

function dedupeBy(getKey) {
  const seen = new Set();
  return (entry) => {
    const key = getKey(entry);
    if (!key || seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  };
}

function trimTrailingSlash(value) {
  return String(value || '').replace(/\/+$/, '');
}

function formatDate(value) {
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) {
    return 'unknown';
  }
  return date.toISOString().replace('T', ' ').replace(/\.\d{3}Z$/, ' UTC');
}

function formatBytes(bytes) {
  const value = Number(bytes);
  if (!Number.isFinite(value) || value <= 0) {
    return '0 B';
  }
  const units = ['B', 'KB', 'MB', 'GB'];
  const exponent = Math.min(Math.floor(Math.log(value) / Math.log(1024)), units.length - 1);
  const amount = value / (1024 ** exponent);
  return `${amount.toFixed(amount >= 10 || exponent === 0 ? 0 : 1)} ${units[exponent]}`;
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function escapeAttribute(value) {
  return escapeHtml(value);
}

main();
