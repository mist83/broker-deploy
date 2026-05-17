#!/usr/bin/env node

const DEFAULT_API_BASE = 'https://sites.mullmania.com';
const DEFAULT_OWNER = 'mist83';
const DEFAULT_BROKER_REPO = 'broker-deploy';
const DEFAULT_WORKFLOW = 'deploy-mullmania-site.yml';
const DEFAULT_CONFIG = 'mullmania.site.json';

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    printHelp();
    return;
  }

  const siteId = requireArg(args, 'site');
  const sourceRepo = requireArg(args, 'source');
  const sourceRef = args.ref || 'main';
  const config = args.config || DEFAULT_CONFIG;
  const deployType = args.deployType || 'static-site';
  const apiBase = (args.api || process.env.SITES_API_BASE || DEFAULT_API_BASE).replace(/\/+$/, '');
  const operatorKey = args.operatorKey || process.env.SITES_OPERATOR_KEY || process.env.OPERATOR_KEY || '';

  if (!operatorKey) {
    throw new Error('Set SITES_OPERATOR_KEY or pass --operator-key.');
  }

  const payload = {
    siteId,
    label: args.label || siteId,
    owner: args.owner || DEFAULT_OWNER,
    repo: args.brokerRepo || DEFAULT_BROKER_REPO,
    workflow: args.workflow || DEFAULT_WORKFLOW,
    ref: args.brokerRef || 'main',
    dispatchSiteId: args.dispatchSite || siteId,
    targetRepo: sourceRepo,
    sourceRepo,
    sourceRef,
    config,
    deployType,
    autoRedeploy: args.autoRedeploy !== 'false',
    enabled: true,
    url: args.url || `https://${siteId}.mullmania.com/`,
  };

  const response = await fetch(`${apiBase}/api/redeploy/targets`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-operator-key': operatorKey,
    },
    body: JSON.stringify(payload),
  });

  const text = await response.text();
  let result = {};
  try {
    result = text ? JSON.parse(text) : {};
  } catch {
    result = { body: text };
  }

  if (!response.ok || result.ok === false) {
    throw new Error(`Registration failed (${response.status}): ${JSON.stringify(result)}`);
  }

  console.log(JSON.stringify(result, null, 2));
  console.log('');
  console.log('Manual redeploy:');
  console.log(`curl -fsS -X POST ${apiBase}/api/redeploy/target/${encodeURIComponent(siteId)} \\`);
  console.log(`  -H "x-operator-key: $SITES_OPERATOR_KEY" \\`);
  console.log(`  -H "content-type: application/json" \\`);
  console.log(`  -d '{"reason":"manual redeploy","source":"operator"}'`);
  console.log('');
  console.log('Direct broker dispatch:');
  console.log(`gh workflow run deploy-mullmania-site.yml --repo mist83/broker-deploy -f site_id=${siteId} -f reason=manual -f source=operator`);
}

function parseArgs(argv) {
  const args = {};
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--help' || arg === '-h') {
      args.help = true;
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

function requireArg(args, name) {
  const value = String(args[name] || '').trim();
  if (!value) {
    throw new Error(`Missing required --${name}.`);
  }
  return value;
}

function printHelp() {
  console.log(`Register a Mullmania repo-backed deploy target.

Required:
  --site <site-id>          Mullmania site id, e.g. tic-hack-toe
  --source <owner/repo>     Source GitHub repo, e.g. mist83/tic-hack-toe

Common:
  --ref <branch>            Source branch/ref. Default: main
  --config <path>           Repo config file. Default: mullmania.site.json
  --deploy-type <type>      Deploy recipe. Default: static-site
  --label <text>            Display label. Default: site id
  --url <url>               Public site URL. Default: https://<site>.mullmania.com/

Environment:
  SITES_OPERATOR_KEY        Required protected Sites API key
  SITES_API_BASE            Optional API base. Default: https://sites.mullmania.com

Example:
  SITES_OPERATOR_KEY=... node scripts/register-target.mjs \\
    --site tic-hack-toe \\
    --source mist83/tic-hack-toe \\
    --ref master
`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
