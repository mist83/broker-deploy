import { mountGroundsView } from './grounds-view.js';

const UI_READY_TIMEOUT_MS = 15000;
const ARCHIVE_REPO_URL = 'https://github.com/mist83/graveyard';

let currentUnmount = null;

function waitForUi() {
  const startedAt = Date.now();

  return new Promise((resolve, reject) => {
    function check() {
      if (window.UI && typeof window.UI.ready === 'function') {
        window.UI.ready().then(resolve).catch(reject);
        return;
      }

      if (Date.now() - startedAt > UI_READY_TIMEOUT_MS) {
        reject(new Error('UI runtime did not load.'));
        return;
      }

      window.setTimeout(check, 50);
    }

    check();
  });
}

async function loadJson(source) {
  const response = await fetch(source, { cache: 'no-store' });
  if (!response.ok) {
    throw new Error(`Failed to load ${source}: ${response.status}`);
  }

  return response.json();
}

function formatDate(value) {
  if (!value) {
    return 'unknown';
  }

  return new Date(value).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function formatBytes(bytes) {
  if (!bytes) {
    return '0 B';
  }

  const units = ['B', 'KB', 'MB', 'GB'];
  let value = bytes;
  let index = 0;

  while (value >= 1024 && index < units.length - 1) {
    value /= 1024;
    index += 1;
  }

  return `${value.toFixed(value >= 10 || index === 0 ? 0 : 1)} ${units[index]}`;
}

function compareDateDesc(left, right, key = 'died') {
  return String(right[key] || '').localeCompare(String(left[key] || ''));
}

function githubTree(path) {
  return `${ARCHIVE_REPO_URL}/tree/main/${path}`;
}

function githubBlob(path) {
  return `${ARCHIVE_REPO_URL}/blob/main/${path}`;
}

function tagsForGrave(grave) {
  if (grave.tags.length > 0) {
    return grave.tags;
  }

  if (grave.supersededBy && grave.supersededBy !== 'NONE') {
    return ['superseded'];
  }

  return ['archived'];
}

function graveMetaRows(grave) {
  return [
    ['Died', formatDate(grave.died)],
    ['Superseded by', grave.supersededBy || 'NONE'],
    ['Snapshot', grave.snapshotSizeLabel],
    ['Bundle', grave.hasBundle ? grave.bundleSizeLabel : grave.hasBundlePointer ? 'S3 pointer' : 'missing'],
  ];
}

function detailRows(rows) {
  return {
    tag: 'dl',
    className: 'graveyard-meta-list',
    children: rows.flatMap(([label, value]) => [
      { tag: 'dt', text: label },
      { tag: 'dd', text: value },
    ]),
  };
}

function gravePills(values) {
  return {
    tag: 'div',
    className: 'graveyard-pill-row',
    children: values.map((value) => ({
      tag: 'span',
      className: 'graveyard-pill',
      text: value,
    })),
  };
}

function actionButtons(grave) {
  const actions = [];

  if (grave.hasSnapshot) {
    actions.push(window.UI.button({
      label: 'Snapshot',
      icon: 'ti ti-folder-code',
      variant: 'secondary',
      action: {
        type: 'open',
        href: githubTree(grave.snapshotPath),
      },
    }));
  }

  if (grave.hasBundle && grave.bundlePath) {
    actions.push(window.UI.button({
      label: 'Bundle',
      icon: 'ti ti-package',
      variant: 'secondary',
      action: {
        type: 'open',
        href: githubBlob(grave.bundlePath),
      },
    }));
  }

  actions.push(window.UI.button({
    label: 'Funeral Commit',
    icon: 'ti ti-git-commit',
    variant: 'secondary',
    action: {
      type: 'open',
      href: `${ARCHIVE_REPO_URL}/commit/${grave.commit}`,
    },
  }));

  return {
    tag: 'div',
    className: 'grid-row gap-sm',
    children: actions,
  };
}

function graveCard(grave) {
  return window.UI.card({
    className: 'graveyard-slab-card',
    title: {
      tag: 'div',
      className: 'graveyard-card-title-row',
      children: [
        { tag: 'span', className: 'graveyard-card-title', text: grave.repo },
        window.UI.status({
          label: grave.supersededBy && grave.supersededBy !== 'NONE' ? 'Superseded' : 'No heir',
          tone: grave.supersededBy && grave.supersededBy !== 'NONE' ? 'warning' : 'info',
        }),
      ],
    },
    subtitle: grave.summary || grave.epitaph || 'No summary saved.',
    children: [
      detailRows(graveMetaRows(grave)),
      gravePills(tagsForGrave(grave)),
      grave.salvagePaths.length ? {
        tag: 'ul',
        className: 'graveyard-note-list',
        children: grave.salvagePaths.slice(0, 4).map((path) => ({ tag: 'li', text: path })),
      } : null,
      actionButtons(grave),
    ],
  });
}

function successorCard(successor) {
  return window.UI.card({
    className: 'graveyard-slab-card',
    title: successor.repo,
    subtitle: `${successor.count} repos point here.`,
    children: [
      gravePills(successor.tags.length ? successor.tags : ['no tags']),
      {
        tag: 'ul',
        className: 'graveyard-note-list',
        children: successor.graves.slice(0, 5).map((grave) => ({
          tag: 'li',
          text: `${grave.repo} · ${formatDate(grave.died)}`,
        })),
      },
    ],
    actions: successor.repo === 'NONE' ? [] : [
      {
        label: 'Open successor',
        icon: 'ti ti-external-link',
        variant: 'secondary',
        action: {
          type: 'open',
          href: `https://github.com/${successor.repo}`,
        },
      },
    ],
  });
}

function table(headers, rows) {
  return {
    tag: 'div',
    className: 'table-container',
    children: [
      {
        tag: 'table',
        className: 'data-table',
        children: [
          {
            tag: 'thead',
            children: [
              {
                tag: 'tr',
                children: headers.map((header) => ({ tag: 'th', text: header })),
              },
            ],
          },
          {
            tag: 'tbody',
            children: rows.map((row) => ({
              tag: 'tr',
              children: row.map((cell) => {
                if (cell && typeof cell === 'object' && cell.tag) {
                  return { tag: 'td', children: [cell] };
                }

                return { tag: 'td', text: String(cell ?? '') };
              }),
            })),
          },
        ],
      },
    ],
  };
}

function buildModel(graves, summary) {
  const sorted = [...graves].sort((left, right) => compareDateDesc(left, right));
  const recent = sorted.slice(0, 12);
  const unclaimed = sorted.filter((grave) => !grave.supersededBy || grave.supersededBy === 'NONE');
  const salvage = sorted.filter((grave) => grave.salvagePaths.length > 0);
  const heavySnapshots = [...graves].sort((left, right) => right.snapshotBytes - left.snapshotBytes).slice(0, 12);
  const heavyBundles = [...graves].sort((left, right) => right.bundleBytes - left.bundleBytes).slice(0, 12);

  const sectionMap = new Map();
  const successorMap = new Map();
  const tagMap = new Map();

  graves.forEach((grave) => {
    const section = sectionMap.get(grave.plot.sectionCode) || {
      sectionCode: grave.plot.sectionCode,
      plotCount: 0,
      sample: [],
    };
    section.plotCount += 1;
    if (section.sample.length < 4) {
      section.sample.push(grave.repo);
    }
    sectionMap.set(section.sectionCode, section);

    const successorKey = grave.supersededBy || 'NONE';
    const successor = successorMap.get(successorKey) || {
      repo: successorKey,
      count: 0,
      graves: [],
      tags: new Set(),
    };
    successor.count += 1;
    successor.graves.push(grave);
    tagsForGrave(grave).forEach((tag) => successor.tags.add(tag));
    successorMap.set(successorKey, successor);

    grave.tags.forEach((tag) => {
      tagMap.set(tag, (tagMap.get(tag) || 0) + 1);
    });
  });

  const sections = [...sectionMap.values()].sort((left, right) => (
    right.plotCount - left.plotCount || left.sectionCode.localeCompare(right.sectionCode)
  ));
  const successors = [...successorMap.values()]
    .map((entry) => ({
      ...entry,
      tags: [...entry.tags],
      graves: entry.graves.sort((left, right) => compareDateDesc(left, right)),
    }))
    .sort((left, right) => right.count - left.count || left.repo.localeCompare(right.repo));
  const topTags = [...tagMap.entries()]
    .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))
    .slice(0, 10)
    .map(([tag, count]) => ({ tag, count }));

  return {
    graves,
    summary,
    sorted,
    recent,
    unclaimed,
    salvage,
    heavySnapshots,
    heavyBundles,
    sections,
    successors,
    topTags,
  };
}

function buildParkPreset(model) {
  return {
    tag: 'div',
    className: 'graveyard-route',
    children: [
      {
        tag: 'div',
        className: 'graveyard-park-view',
        dataset: {
          graveyardParkRoot: 'true',
        },
        children: [
          {
            tag: 'section',
            className: 'graveyard-stage-card card',
            children: [
              {
                tag: 'div',
                className: 'graveyard-stage-topline',
                children: [
                  {
                    tag: 'div',
                    className: 'graveyard-stage-copy',
                    children: [
                      { tag: 'p', className: 'type-label text-muted', text: 'Archive view' },
                      {
                        tag: 'p',
                        className: 'graveyard-stage-description',
                        text: 'Repo hash sets the plot location. Search, orbit, or click a repo.',
                      },
                    ],
                  },
                  {
                    tag: 'label',
                    className: 'field-group graveyard-search-group',
                    children: [
                      { tag: 'span', className: 'field-label', text: 'Search' },
                      {
                        tag: 'input',
                        className: 'field-input',
                        attrs: {
                          type: 'search',
                          placeholder: 'repo, replacement, salvage path',
                        },
                        dataset: {
                          graveyardSearch: 'true',
                        },
                      },
                    ],
                  },
                ],
              },
              {
                tag: 'div',
                className: 'graveyard-summary-strip',
                dataset: {
                  graveyardSummary: 'true',
                },
              },
              {
                tag: 'div',
                className: 'graveyard-stage-shell',
                children: [
                  {
                    tag: 'canvas',
                    className: 'graveyard-scene',
                    dataset: {
                      graveyardScene: 'true',
                    },
                  },
                  {
                    tag: 'div',
                    className: 'graveyard-stage-overlay',
                    children: [
                      {
                        tag: 'div',
                        className: 'graveyard-stage-pill',
                        dataset: {
                          graveyardSectionReadout: 'true',
                        },
                      },
                      {
                        tag: 'div',
                        className: 'graveyard-stage-pill graveyard-stage-pill-right',
                        dataset: {
                          graveyardHoverReadout: 'true',
                        },
                      },
                    ],
                  },
                ],
              },
            ],
          },
          {
            tag: 'aside',
            className: 'graveyard-inspector',
            children: [
              window.UI.card({
                className: 'graveyard-inspector-card graveyard-inspector-primary',
                title: {
                  tag: 'div',
                  className: 'graveyard-inspector-heading',
                  children: [
                    { tag: 'span', className: 'type-label text-muted', text: 'Selected repo' },
                    { tag: 'span', className: 'graveyard-inline-kicker', dataset: { graveyardSelectedSection: 'true' } },
                  ],
                },
                children: [
                  { tag: 'h3', className: 'graveyard-selected-title', dataset: { graveyardSelectedTitle: 'true' } },
                  { tag: 'p', className: 'graveyard-selected-summary', dataset: { graveyardSelectedSummary: 'true' } },
                  { tag: 'dl', className: 'graveyard-meta-list', dataset: { graveyardSelectedFacts: 'true' } },
                ],
              }),
              window.UI.card({
                className: 'graveyard-inspector-card',
                title: {
                  tag: 'div',
                  className: 'graveyard-inspector-heading',
                  children: [
                    { tag: 'span', className: 'type-label text-muted', text: 'Notes' },
                    { tag: 'span', className: 'graveyard-inline-kicker', text: 'Saved note' },
                  ],
                },
                children: [
                  { tag: 'p', className: 'graveyard-epitaph', dataset: { graveyardSelectedEpitaph: 'true' } },
                  { tag: 'div', className: 'graveyard-pill-row', dataset: { graveyardSelectedTags: 'true' } },
                  { tag: 'ul', className: 'graveyard-note-list', dataset: { graveyardSelectedSalvage: 'true' } },
                ],
              }),
              window.UI.card({
                className: 'graveyard-inspector-card',
                title: {
                  tag: 'div',
                  className: 'graveyard-inspector-heading',
                  children: [
                    { tag: 'span', className: 'type-label text-muted', text: 'Matching repos' },
                    { tag: 'span', className: 'graveyard-inline-kicker', dataset: { graveyardVisibleCount: 'true' } },
                  ],
                },
                children: [
                  { tag: 'div', className: 'graveyard-plot-list', dataset: { graveyardPlotList: 'true' } },
                ],
              }),
            ],
          },
        ],
      },
    ],
  };
}

function buildRecentPreset(model) {
  return {
    tag: 'div',
    className: 'graveyard-route',
    children: [
      {
        tag: 'div',
        className: 'grid-2 gap-lg',
        children: [
          window.UI.card({
            title: 'Recent repos',
            subtitle: 'Newest repos by archive date.',
            children: [
              {
                tag: 'ul',
                className: 'graveyard-note-list',
                children: model.recent.slice(0, 6).map((grave) => ({
                  tag: 'li',
                  text: `${grave.repo} · ${formatDate(grave.died)} · ${grave.supersededBy}`,
                })),
              },
            ],
          }),
          window.UI.card({
            title: 'Common tags',
            subtitle: 'Tags used most often in the archive.',
            children: [
              gravePills(model.topTags.length ? model.topTags.map((entry) => `${entry.tag} (${entry.count})`) : ['untagged']),
            ],
          }),
        ],
      },
      {
        tag: 'div',
        className: 'grid gap-lg',
        children: model.recent.slice(0, 8).map(graveCard),
      },
    ],
  };
}

function buildSectionsPreset(model) {
  return {
    tag: 'div',
    className: 'graveyard-route',
    children: [
      window.UI.card({
        title: 'Sections',
        subtitle: 'The first hash byte picks the section. The second picks the plot.',
        children: [
          table(
            ['Section', 'Plots', 'Sample graves'],
            model.sections.slice(0, 18).map((section) => [
              section.sectionCode.toUpperCase(),
              String(section.plotCount),
              section.sample.join(', '),
            ]),
          ),
        ],
      }),
    ],
  };
}

function buildSuccessorsPreset(model) {
  return {
    tag: 'div',
    className: 'graveyard-route',
    children: [
      {
        tag: 'div',
        className: 'grid gap-lg',
        children: model.successors
          .filter((successor) => successor.repo !== 'NONE')
          .slice(0, 8)
          .map(successorCard),
      },
    ],
  };
}

function buildUnclaimedPreset(model) {
  return {
    tag: 'div',
    className: 'graveyard-route',
    children: [
      window.UI.card({
        title: 'No replacement',
        subtitle: 'Repos with no replacement repo.',
        children: [
          table(
            ['Repo', 'Died', 'Snapshot', 'Bundle'],
            model.unclaimed.slice(0, 20).map((grave) => [
              grave.repo,
              formatDate(grave.died),
              grave.snapshotSizeLabel,
              grave.hasBundle ? grave.bundleSizeLabel : grave.hasBundlePointer ? 'S3 pointer' : 'missing',
            ]),
          ),
        ],
      }),
    ],
  };
}

function buildSalvagePreset(model) {
  return {
    tag: 'div',
    className: 'graveyard-route',
    children: model.salvage.slice(0, 10).map((grave) => (
      window.UI.card({
        className: 'graveyard-slab-card',
        title: grave.repo,
        subtitle: grave.epitaph || grave.summary || 'Saved notes.',
        children: [
          {
            tag: 'ul',
            className: 'graveyard-note-list',
            children: grave.salvagePaths.map((path) => ({ tag: 'li', text: path })),
          },
          actionButtons(grave),
        ],
      })
    )),
  };
}

function buildLedgerPreset(model) {
  return {
    tag: 'div',
    className: 'graveyard-route',
    children: [
      window.UI.card({
        title: 'Commits',
        subtitle: 'Recent commits recorded in the graveyard repo.',
        children: [
          table(
            ['Repo', 'Died', 'Successor', 'Source'],
            model.sorted.slice(0, 20).map((grave) => [
              grave.repo,
              formatDate(grave.died),
              grave.supersededBy,
              grave.sourceWas || 'unknown',
            ]),
          ),
        ],
      }),
    ],
  };
}

function buildBundlesPreset(model) {
  return {
    tag: 'div',
    className: 'graveyard-route',
    children: [
      {
        tag: 'div',
        className: 'graveyard-kpi-grid',
        children: [
          window.UI.stat({
            label: 'Snapshot trees',
            value: String(model.summary.snapshotCount),
            icon: 'ti ti-folder',
            caption: 'Repo root snapshots preserved',
          }),
          window.UI.stat({
            label: 'Bundles',
            value: String(model.summary.bundleCount),
            icon: 'ti ti-package',
            caption: 'Full-history git bundles or pointers',
          }),
          window.UI.stat({
            label: 'Largest bundle',
            value: model.heavyBundles[0] ? model.heavyBundles[0].bundleSizeLabel : '0 B',
            icon: 'ti ti-weight',
            caption: model.heavyBundles[0]?.repo || 'none',
          }),
        ],
      },
      window.UI.card({
        title: 'Restore',
        subtitle: 'The bundle has git history. The snapshot has the checked-in files.',
        children: [
          {
            tag: 'pre',
            children: [
              {
                tag: 'code',
                text: 'git clone <repo>.bundle /tmp/<repo>\n# or fetch the .bundle from S3 first when a .bundle.s3 pointer exists',
              },
            ],
          },
          table(
            ['Repo', 'Snapshot', 'Bundle'],
            model.heavyBundles.slice(0, 12).map((grave) => [
              grave.repo,
              grave.snapshotSizeLabel,
              grave.hasBundle ? grave.bundleSizeLabel : grave.hasBundlePointer ? 'S3 pointer' : 'missing',
            ]),
          ),
        ],
      }),
    ],
  };
}

function buildHeavyPreset(model) {
  return {
    tag: 'div',
    className: 'graveyard-route',
    children: [
      {
        tag: 'div',
        className: 'grid-2 gap-lg',
        children: [
          window.UI.card({
            title: 'Largest snapshots',
            children: [
              table(
                ['Repo', 'Tree size', 'Files'],
                model.heavySnapshots.slice(0, 10).map((grave) => [
                  grave.repo,
                  grave.snapshotSizeLabel,
                  String(grave.files),
                ]),
              ),
            ],
          }),
          window.UI.card({
            title: 'Largest bundles',
            children: [
              table(
                ['Repo', 'Bundle size', 'Successor'],
                model.heavyBundles.slice(0, 10).map((grave) => [
                  grave.repo,
                  grave.bundleSizeLabel,
                  grave.supersededBy,
                ]),
              ),
            ],
          }),
        ],
      },
    ],
  };
}

function buildRulesPreset() {
  return {
    tag: 'div',
    className: 'graveyard-route',
    children: [
      window.UI.card({
        title: 'Archive rules',
        subtitle: 'Keep each repo recoverable.',
        children: [
          {
            tag: 'ul',
            className: 'graveyard-note-list',
            children: [
              { tag: 'li', text: 'One commit per repo. Atomic. No multi-repo funerals.' },
              { tag: 'li', text: 'Push the graveyard commit before deleting the source repo.' },
              { tag: 'li', text: 'Snapshot the committed tree, strip only .env* and .git on ingress.' },
              { tag: 'li', text: 'Keep a full-history git bundle beside the snapshot tree.' },
            ],
          },
          {
            tag: 'div',
            className: 'grid-row gap-sm',
            children: [
              window.UI.button({
                label: 'README',
                icon: 'ti ti-book',
                variant: 'secondary',
                action: { type: 'open', href: `${ARCHIVE_REPO_URL}/blob/main/README.md` },
              }),
              window.UI.button({
                label: 'Ingress script',
                icon: 'ti ti-script',
                variant: 'secondary',
                action: { type: 'open', href: `${ARCHIVE_REPO_URL}/blob/main/scripts/entomb-repo.py` },
              }),
            ],
          },
        ],
      }),
    ],
  };
}

function buildPlotsPreset(model) {
  return {
    tag: 'div',
    className: 'graveyard-route',
    children: [
      window.UI.card({
        title: 'Plot map',
        subtitle: 'Each repo name hashes to a fixed section and plot.',
        children: [
          detailRows([
            ['Seed', 'sha256("mist83/<repo>")'],
            ['Section', 'First byte of hash'],
            ['Plot', 'Second byte of hash'],
            ['Grid', '16 × 16 sections, each with 16 × 16 plots'],
          ]),
          table(
            ['Section', 'Plots', 'Examples'],
            model.sections.slice(0, 12).map((section) => [
              section.sectionCode.toUpperCase(),
              String(section.plotCount),
              section.sample.join(', '),
            ]),
          ),
        ],
      }),
    ],
  };
}

function buildArtifactPreset() {
  return {
    tag: 'div',
    className: 'graveyard-route',
    children: [
      window.UI.card({
        title: 'Site data',
        subtitle: 'This site reads commits, snapshots, bundles, and notes.',
        children: [
          {
            tag: 'ul',
            className: 'graveyard-note-list',
            children: [
              { tag: 'li', text: 'Update commits or notes, then regenerate docs/data/*.json.' },
              { tag: 'li', text: 'The site can change without changing the stored repo data.' },
              { tag: 'li', text: 'Search, plots, and stats all come from generated data.' },
            ],
          },
          {
            tag: 'div',
            className: 'grid-row gap-sm',
            children: [
              window.UI.button({
                label: 'Generator',
                icon: 'ti ti-brain',
                variant: 'secondary',
                action: { type: 'open', href: `${ARCHIVE_REPO_URL}/blob/main/scripts/generate-graveyard-data.mjs` },
              }),
              window.UI.button({
                label: 'Annotations',
                icon: 'ti ti-notes',
                variant: 'secondary',
                action: { type: 'open', href: `${ARCHIVE_REPO_URL}/blob/main/catalog/annotations.json` },
              }),
            ],
          },
        ],
      }),
    ],
  };
}

function ensurePresetRegistry() {
  const api = window.UI?.presets;
  if (!api || typeof api.register === 'function') {
    return;
  }

  const customBuilders = new Map();
  const originalResolve = api.resolve;

  api.register = (name, builder) => {
    customBuilders.set(name, builder);
  };

  api.resolve = (name, options = {}) => {
    if (customBuilders.has(name)) {
      return customBuilders.get(name)(options);
    }
    return originalResolve.call(api, name, options);
  };
}

function registerPresets(model) {
  ensurePresetRegistry();

  const presets = {
    'graveyard.grounds.park': () => buildParkPreset(model),
    'graveyard.grounds.fresh': () => buildRecentPreset(model),
    'graveyard.grounds.sections': () => buildSectionsPreset(model),
    'graveyard.lineage.successors': () => buildSuccessorsPreset(model),
    'graveyard.lineage.unclaimed': () => buildUnclaimedPreset(model),
    'graveyard.lineage.salvage': () => buildSalvagePreset(model),
    'graveyard.funerals.ledger': () => buildLedgerPreset(model),
    'graveyard.funerals.bundles': () => buildBundlesPreset(model),
    'graveyard.funerals.heavy': () => buildHeavyPreset(model),
    'graveyard.canon.rules': () => buildRulesPreset(model),
    'graveyard.canon.plots': () => buildPlotsPreset(model),
    'graveyard.canon.artifact': () => buildArtifactPreset(model),
  };

  Object.entries(presets).forEach(([name, builder]) => {
    window.UI.presets.register(name, builder);
  });
}

function handleViewChange(event, model) {
  if (typeof currentUnmount === 'function') {
    currentUnmount();
    currentUnmount = null;
  }

  const detail = event?.detail || {};
  if (detail.tabId !== 'grounds' || detail.itemId !== 'park') {
    return;
  }

  const root = document.querySelector('[data-graveyard-park-root]');
  if (!root) {
    return;
  }

  currentUnmount = mountGroundsView(root, model);
}

function currentRouteFromHash(sitemap) {
  const [tabIdFromHash, itemIdFromHash] = window.location.hash.slice(1).split('/').filter(Boolean);
  const tab = sitemap.tabs.find((entry) => entry.id === tabIdFromHash) || sitemap.tabs[0];
  const firstItemId = tab?.sections?.find((section) => section.type === 'list')?.inlineData?.[0]?.id || null;

  return {
    detail: {
      tabId: tab?.id || null,
      itemId: itemIdFromHash || firstItemId,
    },
  };
}

async function main() {
  await waitForUi();

  const [graves, summary, sitemap] = await Promise.all([
    loadJson('./data/graves.json'),
    loadJson('./data/summary.json'),
    loadJson('./sitemap.json'),
  ]);

  const model = buildModel(graves, summary);
  registerPresets(model);

  document.addEventListener('ui:view-changed', (event) => handleViewChange(event, model));

  const shell = window.UI.createShell({
    headerContainerId: 'header-container',
    tabsContainerId: 'tabs-container',
    contentContainerId: 'content-container',
    sitemap,
  });

  await shell.init();
  handleViewChange(currentRouteFromHash(sitemap), model);
}

main().catch((error) => {
  console.error('[graveyard] shell boot failed', error);
});
