#!/usr/bin/env node

import { execFileSync } from 'child_process';
import { Buffer } from 'buffer';
import { writeFileSync } from 'fs';

const DEFAULT_OWNER = 'mist83';
const DEFAULT_LIMIT = 1000;

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    printHelp();
    return;
  }

  const repos = args.repo
    ? normalizeList(args.repo).map((nameWithOwner) => ({ nameWithOwner }))
    : listRepos(args.owner || DEFAULT_OWNER, Number(args.limit || DEFAULT_LIMIT));
  const inventory = [];
  for (const repo of repos) {
    inventory.push(inspectRepo(repo.nameWithOwner || repo.fullName || repo));
  }

  const payload = {
    generatedAt: new Date().toISOString(),
    owner: args.owner || DEFAULT_OWNER,
    count: inventory.length,
    inventory,
  };

  if (args.output) {
    writeFileSync(args.output, `${JSON.stringify(payload, null, 2)}\n`);
  }

  if (args.json || args.output) {
    console.log(JSON.stringify(payload, null, 2));
    return;
  }

  printTable(inventory);
}

function listRepos(owner, limit) {
  const json = gh([
    'repo',
    'list',
    owner,
    '--limit',
    String(limit),
    '--json',
    'nameWithOwner,isArchived,isFork,defaultBranchRef,url,visibility,pushedAt',
  ]);
  return JSON.parse(json);
}

function inspectRepo(nameWithOwner) {
  const repo = normalizeRepoName(nameWithOwner);
  const meta = repoMeta(repo);
  const branch = meta.defaultBranchRef?.name || 'main';
  const siteConfig = readRepoJson(repo, branch, 'mullmania.site.json');
  const packageJson = readRepoJson(repo, branch, 'package.json');
  const workflows = readWorkflowInventory(repo, branch);
  const hasApiDir = pathExists(repo, branch, 'api');
  const backendIndicators = detectBackendIndicators({ siteConfig, packageJson, workflows, hasApiDir });
  const classification = classifyRepo({ meta, siteConfig, backendIndicators });

  return {
    repo,
    visibility: meta.visibility || '',
    defaultBranch: branch,
    url: meta.url || `https://github.com/${repo}`,
    siteId: siteConfig?.siteId || '',
    publishDir: siteConfig?.publishDir || siteConfig?.sourceDir || '',
    installCommand: siteConfig?.installCommand || '',
    buildCommand: siteConfig?.buildCommand || '',
    deployType: siteConfig?.deployType || 'static-site',
    workflows: workflows.map((workflow) => workflow.path),
    deployWorkflows: workflows.filter((workflow) => workflow.isDeploy).map((workflow) => workflow.path),
    pagesWorkflows: workflows.filter((workflow) => workflow.isPages).map((workflow) => workflow.path),
    backendIndicators,
    classification,
    recommendation: recommendationFor(classification),
  };
}

function repoMeta(repo) {
  try {
    return JSON.parse(gh(['repo', 'view', repo, '--json', 'nameWithOwner,isArchived,isFork,defaultBranchRef,url,visibility']));
  } catch {
    return { nameWithOwner: repo, defaultBranchRef: { name: 'main' } };
  }
}

function readWorkflowInventory(repo, branch) {
  const entries = readRepoDirectory(repo, branch, '.github/workflows');
  return entries
    .filter((entry) => entry.type === 'file')
    .map((entry) => {
      const path = entry.path || `.github/workflows/${entry.name}`;
      const text = readRepoText(repo, branch, path) || '';
      return {
        path,
        isDeploy: /\bdeploy\b|publish|aws|s3|pages/i.test(`${path}\n${text}`),
        isPages: /pages/i.test(`${path}\n${text}`),
        mentionsBackend: /deploy-api|lambda|serverless|cloudflare|worker|vercel|netlify|amplify/i.test(text),
      };
    });
}

function detectBackendIndicators({ siteConfig, packageJson, workflows, hasApiDir }) {
  const indicators = [];
  const scripts = packageJson?.scripts && typeof packageJson.scripts === 'object' ? packageJson.scripts : {};
  const scriptText = Object.entries(scripts).map(([name, value]) => `${name}: ${value}`).join('\n');

  if (hasApiDir) indicators.push('api-directory');
  if (/\bdeploy-api\b|lambda|serverless|cloudflare|worker/i.test(scriptText)) indicators.push('backend-script');
  if (workflows.some((workflow) => workflow.mentionsBackend)) indicators.push('backend-workflow');
  if (siteConfig?.apiProxy) indicators.push('api-proxy');
  if (siteConfig?.deployType && siteConfig.deployType !== 'static-site') indicators.push(`deployType:${siteConfig.deployType}`);

  return Array.from(new Set(indicators));
}

function classifyRepo({ meta, siteConfig, backendIndicators }) {
  if (meta.isArchived || meta.isFork) {
    return 'do-not-touch';
  }
  if (!siteConfig) {
    return 'unknown';
  }
  if (!siteConfig.siteId || !(siteConfig.publishDir || siteConfig.sourceDir)) {
    return 'static-needs-fix';
  }
  if (backendIndicators.includes('backend-script') || backendIndicators.includes('backend-workflow') || backendIndicators.some((item) => item.startsWith('deployType:'))) {
    return 'backend';
  }
  return 'static-safe';
}

function recommendationFor(classification) {
  switch (classification) {
    case 'static-safe':
      return 'eligible for automatic broker migration after proof deploy';
    case 'static-needs-fix':
      return 'fix mullmania.site.json before migration';
    case 'backend':
      return 'requires an approved backend deploy recipe';
    case 'do-not-touch':
      return 'skip unless explicitly revived';
    default:
      return 'inspect manually';
  }
}

function readRepoJson(repo, branch, filePath) {
  const text = readRepoText(repo, branch, filePath);
  if (!text) {
    return null;
  }
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function readRepoText(repo, branch, filePath) {
  try {
    const payload = JSON.parse(gh(['api', '-X', 'GET', `repos/${repo}/contents/${encodePath(filePath)}`, '-f', `ref=${branch}`]));
    if (!payload || payload.type !== 'file' || !payload.content) {
      return '';
    }
    return Buffer.from(String(payload.content).replace(/\s/g, ''), 'base64').toString('utf8');
  } catch {
    return '';
  }
}

function readRepoDirectory(repo, branch, dirPath) {
  try {
    const payload = JSON.parse(gh(['api', '-X', 'GET', `repos/${repo}/contents/${encodePath(dirPath)}`, '-f', `ref=${branch}`]));
    return Array.isArray(payload) ? payload : [];
  } catch {
    return [];
  }
}

function pathExists(repo, branch, repoPath) {
  try {
    gh(['api', '-X', 'GET', `repos/${repo}/contents/${encodePath(repoPath)}`, '-f', `ref=${branch}`]);
    return true;
  } catch {
    return false;
  }
}

function gh(args) {
  return execFileSync('gh', args, {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
    maxBuffer: 64 * 1024 * 1024,
  });
}

function encodePath(value) {
  return String(value).split('/').map(encodeURIComponent).join('/');
}

function parseArgs(argv) {
  const args = {};
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--help' || arg === '-h') {
      args.help = true;
      continue;
    }
    if (arg === '--json') {
      args.json = true;
      continue;
    }
    if (!arg.startsWith('--')) {
      throw new Error(`Unexpected argument: ${arg}`);
    }
    const [key, inlineValue] = arg.slice(2).split('=', 2);
    const value = inlineValue ?? argv[index + 1];
    if (inlineValue === undefined) {
      index += 1;
    }
    const camelKey = toCamelCase(key);
    if (camelKey === 'repo' && args.repo) {
      args.repo = `${args.repo},${value}`;
    } else {
      args[camelKey] = value;
    }
  }
  return args;
}

function toCamelCase(value) {
  return String(value).replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
}

function normalizeList(value) {
  return String(value || '').split(',').map((item) => item.trim()).filter(Boolean);
}

function normalizeRepoName(value) {
  const text = String(value || '').trim();
  return text.includes('/') ? text : `${DEFAULT_OWNER}/${text}`;
}

function printTable(inventory) {
  const rows = inventory.map((item) => ({
    repo: item.repo,
    className: item.classification,
    site: item.siteId || '-',
    deployType: item.deployType,
    recommendation: item.recommendation,
  }));
  const widths = {
    repo: Math.max(4, ...rows.map((row) => row.repo.length)),
    className: Math.max(14, ...rows.map((row) => row.className.length)),
    site: Math.max(4, ...rows.map((row) => row.site.length)),
    deployType: Math.max(10, ...rows.map((row) => row.deployType.length)),
  };

  console.log(`${pad('repo', widths.repo)}  ${pad('classification', widths.className)}  ${pad('site', widths.site)}  ${pad('deployType', widths.deployType)}  recommendation`);
  console.log(`${'-'.repeat(widths.repo)}  ${'-'.repeat(widths.className)}  ${'-'.repeat(widths.site)}  ${'-'.repeat(widths.deployType)}  ${'-'.repeat(40)}`);
  for (const row of rows) {
    console.log(`${pad(row.repo, widths.repo)}  ${pad(row.className, widths.className)}  ${pad(row.site, widths.site)}  ${pad(row.deployType, widths.deployType)}  ${row.recommendation}`);
  }
}

function pad(value, width) {
  return String(value ?? '').padEnd(width);
}

function printHelp() {
  console.log(`Inventory GitHub repos for broker migration readiness.

This is read-only. It does not register targets, add hooks, deploy, or disable workflows.

Options:
  --owner <owner>           GitHub owner. Default: mist83
  --limit <n>               Repo limit when listing owner repos. Default: 1000
  --repo <owner/repo>       Inspect one repo. Repeat with commas for several.
  --json                   Print JSON.
  --output <path>           Also write JSON to a file.

Examples:
  node scripts/inventory-repos.mjs --limit 25
  node scripts/inventory-repos.mjs --repo mist83/tic-hack-toe,mist83/sites --json
`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
