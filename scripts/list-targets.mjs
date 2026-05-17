#!/usr/bin/env node

const DEFAULT_API_BASE = 'https://sites.mullmania.com';

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    printHelp();
    return;
  }

  const apiBase = (args.api || process.env.SITES_API_BASE || DEFAULT_API_BASE).replace(/\/+$/, '');
  const operatorKey = args.operatorKey || process.env.SITES_OPERATOR_KEY || process.env.OPERATOR_KEY || '';
  if (!operatorKey) {
    throw new Error('Set SITES_OPERATOR_KEY or pass --operator-key.');
  }

  const response = await fetch(`${apiBase}/api/redeploy/sites`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-operator-key': operatorKey,
    },
    body: '{}',
  });

  const text = await response.text();
  const payload = text ? JSON.parse(text) : {};
  if (!response.ok || payload.ok === false) {
    throw new Error(`Target list failed (${response.status}): ${JSON.stringify(payload)}`);
  }

  const targets = Array.isArray(payload.targets) ? payload.targets : [];
  if (args.json) {
    console.log(JSON.stringify(targets, null, 2));
    return;
  }

  const rows = targets.map((target) => ({
    site: target.siteId,
    source: target.repo,
    dispatcher: target.dispatcherRepo,
    workflow: target.workflow,
    type: target.deployType || 'static-site',
    auto: target.autoRedeploy ? 'yes' : 'no',
    url: target.url,
  }));

  const widths = {
    site: Math.max(4, ...rows.map((row) => row.site.length)),
    source: Math.max(6, ...rows.map((row) => row.source.length)),
    type: Math.max(4, ...rows.map((row) => row.type.length)),
    auto: 4,
  };

  console.log(`${pad('site', widths.site)}  ${pad('source', widths.source)}  ${pad('type', widths.type)}  auto  url`);
  console.log(`${'-'.repeat(widths.site)}  ${'-'.repeat(widths.source)}  ${'-'.repeat(widths.type)}  ----  ${'-'.repeat(40)}`);
  for (const row of rows) {
    console.log(`${pad(row.site, widths.site)}  ${pad(row.source, widths.source)}  ${pad(row.type, widths.type)}  ${pad(row.auto, widths.auto)}  ${row.url}`);
  }
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
    args[toCamelCase(key)] = value;
  }
  return args;
}

function toCamelCase(value) {
  return String(value).replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
}

function pad(value, width) {
  return String(value ?? '').padEnd(width, ' ');
}

function printHelp() {
  console.log(`List broker-managed Mullmania deploy targets.

Environment:
  SITES_OPERATOR_KEY        Required protected Sites API key
  SITES_API_BASE            Optional API base. Default: https://sites.mullmania.com

Options:
  --json                    Print raw JSON target list

Example:
  SITES_OPERATOR_KEY=... node scripts/list-targets.mjs
`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
