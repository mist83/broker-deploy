import { readFile } from 'node:fs/promises';

export const TOUR_VERSION = 1;

export const ACTION_TYPES = Object.freeze([
    'visit',
    'focus',
    'activate',
    'scroll',
    'zoom',
    'pause',
    'snapshot',
    'callout',
]);

const DEFAULT_VIEWPORT = Object.freeze({ width: 1440, height: 900 });
const DEFAULT_DURATION_MS = 3000;
const DEFAULT_CAPTURE_DELAY_MS = 900;

export async function readJson(filePath) {
    return JSON.parse(await readFile(filePath, 'utf8'));
}

export function normalizeTourManifest(sitemap, options = {}) {
    const automation = normalizeAutomation(sitemap?.automation);
    const baseHref = options.baseHref || automation.baseHref || './index.html';
    const tourSitemap = withFrameworkToolsTourTab(sitemap);
    const nodes = collectTourNodes(tourSitemap, { automation, baseHref });
    const orderedNodes = orderNodes(nodes, automation.traversal);

    return {
        schema: 'https://ui.mullmania.com/tour-manifest.schema.json',
        version: TOUR_VERSION,
        generatedFrom: options.generatedFrom || 'sitemap.json',
        title: sitemap?.header?.title || options.title || 'UI Tour',
        description: automation.description || sitemap?.header?.description || '',
        traversal: automation.traversal,
        narrationFallback: automation.narrationFallback,
        viewport: automation.viewport,
        captureDelayMs: automation.captureDelayMs,
        actionTypes: ACTION_TYPES,
        nodes: orderedNodes.map((node, index) => {
            const { sourceIndex, ...publicNode } = node;
            return {
                ...publicNode,
                index,
                actions: normalizeActions(node.actions, node),
            };
        }),
    };
}

function withFrameworkToolsTourTab(sitemap) {
    const tabs = Array.isArray(sitemap?.tabs) ? [...sitemap.tabs] : [];
    if (!tabs.some((tab) => tab.id === 'ui-framework')) {
        tabs.push({
            id: 'ui-framework',
            label: 'UI Framework',
            description: 'Built-in framework controls, renderer examples, and links back to the shared UI source.',
            tour: {
                description: 'Built-in framework controls, renderer examples, and links back to the shared UI source.',
                order: 9999,
                importance: 2,
            },
            sections: [{
                type: 'list',
                inlineData: [
                    {
                        id: 'overview',
                        name: 'About',
                        description: 'What this shared UI framework is doing on the current site.',
                    },
                    {
                        id: 'tools',
                        name: 'Site Tools',
                        description: 'Live controls for checking this site against shared theme and rendering behavior.',
                    },
                    {
                        id: 'renderer',
                        name: 'Renderer',
                        description: 'Embedded renderer proof showing JSON becoming a page through the shared framework.',
                    },
                ],
            }],
        });
    }

    return {
        ...sitemap,
        tabs,
    };
}

export function validateTourInputs({ sitemap, manifest, requireExplicitNarration = false }) {
    const issues = [];

    if (!sitemap || typeof sitemap !== 'object') {
        issues.push(error('sitemap', 'Sitemap must be an object.'));
        return { ok: false, issues };
    }

    if (!Array.isArray(sitemap.tabs) || sitemap.tabs.length === 0) {
        issues.push(error('sitemap.tabs', 'Sitemap must include a non-empty tabs array.'));
    }

    const seenTabIds = new Set();
    const seenRoutes = new Set();
    for (const tab of sitemap.tabs || []) {
        validateSourceNode(tab, `tab:${tab?.id || 'unknown'}`, seenTabIds, issues);
        const seenItemIds = new Set();
        for (const item of collectTabItems(tab)) {
            validateSourceNode(item, `tab:${tab?.id || 'unknown'}/item:${item?.id || 'unknown'}`, seenItemIds, issues);
        }
    }

    if (!manifest || typeof manifest !== 'object') {
        issues.push(error('manifest', 'Tour manifest must be an object.'));
        return { ok: false, issues };
    }

    if (manifest.version !== TOUR_VERSION) {
        issues.push(error('manifest.version', 'Tour manifest version must be 1.'));
    }

    if (!Array.isArray(manifest.nodes) || manifest.nodes.length === 0) {
        issues.push(error('manifest.nodes', 'Tour manifest must include at least one node.'));
    }

    const seenManifestIds = new Set();
    for (const node of manifest.nodes || []) {
        const path = `manifest.nodes.${node?.id || 'unknown'}`;
        requiredString(node.id, `${path}.id`, issues);
        requiredString(node.label, `${path}.label`, issues);
        requiredString(node.description, `${path}.description`, issues);
        requiredString(node.route, `${path}.route`, issues);

        if (requireExplicitNarration) {
            requiredString(node.narration, `${path}.narration`, issues);
        }

        if (node.id && seenManifestIds.has(node.id)) {
            issues.push(error(`${path}.id`, `Duplicate manifest node id "${node.id}".`));
        }
        seenManifestIds.add(node.id);

        if (node.route && seenRoutes.has(node.route)) {
            issues.push(error(`${path}.route`, `Duplicate manifest route "${node.route}".`));
        }
        if (node.route) seenRoutes.add(node.route);

        if (!Array.isArray(node.actions) || node.actions.length === 0) {
            issues.push(error(`${path}.actions`, 'Tour node must include deterministic actions.'));
        }

        for (const action of node.actions || []) {
            if (!ACTION_TYPES.includes(action.type)) {
                issues.push(error(`${path}.actions`, `Unsupported action type "${action.type}".`));
            }
        }
    }

    return {
        ok: issues.every((issue) => issue.level !== 'error'),
        issues,
    };
}

export function collectTabItems(tab) {
    const items = [];

    for (const section of tab?.sections || []) {
        if (Array.isArray(section.inlineData)) {
            items.push(...section.inlineData);
        }
        if (Array.isArray(section.items)) {
            items.push(...section.items.filter((item) => item && typeof item === 'object'));
        }
        if (Array.isArray(section.data)) {
            items.push(...section.data);
        }
    }

    if (Array.isArray(tab?.items)) {
        items.push(...tab.items);
    }

    return items;
}

export function buildStoryboardScript(manifest) {
    let cursor = 0;
    return (manifest.nodes || []).map((node) => {
        const marker = {
            t_ms: cursor,
            text: node.narration || node.description,
            node_id: node.id,
            route: node.route,
        };
        cursor += Number(node.durationMs || DEFAULT_DURATION_MS);
        return marker;
    });
}

function normalizeAutomation(raw = {}) {
    const tour = raw.tour || {};
    return {
        version: Number(raw.version || TOUR_VERSION),
        baseHref: stringOr(tour.baseHref, './index.html'),
        description: stringOr(tour.description, ''),
        traversal: normalizeTraversal(tour.traversal),
        narrationFallback: stringOr(tour.narrationFallback, 'description'),
        viewport: normalizeViewport(tour.viewport),
        captureDelayMs: numberOr(tour.captureDelayMs, DEFAULT_CAPTURE_DELAY_MS),
        defaultDurationMs: numberOr(tour.durationMs, DEFAULT_DURATION_MS),
        theme: stringOr(tour.theme, ''),
        mode: stringOr(tour.mode, ''),
    };
}

function collectTourNodes(sitemap, { automation, baseHref }) {
    const nodes = [];

    for (const [tabIndex, tab] of (sitemap?.tabs || []).entries()) {
        if (tab?.tour?.include === false) continue;

        const tabNode = buildNode({
            source: tab,
            kind: 'tab',
            id: tab.id,
            label: tab.label || tab.name || tab.title,
            description: tab.tour?.description || tab.description,
            route: routeFor({ baseHref, tabId: tab.id }),
            defaultOrder: tabIndex * 100,
            automation,
        });
        nodes.push(tabNode);

        for (const [itemIndex, item] of collectTabItems(tab).entries()) {
            if (item?.tour?.include === false) continue;

            nodes.push(buildNode({
                source: item,
                kind: 'item',
                id: `${tab.id}/${item.id}`,
                label: item.label || item.name || item.title,
                description: item.tour?.description || item.description,
                route: routeFor({ baseHref, tabId: tab.id, itemId: item.id }),
                parentId: tab.id,
                defaultOrder: tabNode.order + itemIndex + 1,
                automation,
            }));
        }
    }

    return nodes;
}

function buildNode({ source, kind, id, label, description, route, parentId = null, defaultOrder = 0, automation }) {
    const tour = source?.tour || {};
    const durationMs = numberOr(tour.durationMs, automation.defaultDurationMs);
    const theme = stringOr(tour.theme, source?.theme || automation.theme);
    const mode = stringOr(tour.mode, source?.mode || automation.mode);

    return {
        id: String(id || '').trim(),
        kind,
        parentId,
        label: String(label || '').trim(),
        description: String(description || '').trim(),
        route,
        order: numberOr(tour.order, source?.order ?? defaultOrder),
        importance: numberOr(tour.importance, 1),
        durationMs,
        viewport: normalizeViewport(tour.viewport || automation.viewport),
        theme,
        mode,
        narration: stringOr(tour.narration, ''),
        anchors: normalizeAnchors(tour.anchors),
        actions: tour.actions,
    };
}

function normalizeActions(actions, node) {
    if (Array.isArray(actions) && actions.length > 0) {
        return actions.map((action) => ({
            type: action.type,
            target: action.target || node.route,
            value: action.value,
            durationMs: action.durationMs,
        }));
    }

    const generated = [{ type: 'visit', target: node.route }];
    if (node.anchors.length > 0) {
        generated.push({ type: 'focus', target: node.anchors[0].selector });
    }
    generated.push({ type: 'pause', durationMs: node.durationMs });
    generated.push({ type: 'snapshot' });
    return generated;
}

function orderNodes(nodes, traversal) {
    const sorted = nodes.map((node, sourceIndex) => ({ ...node, sourceIndex }));

    if (traversal === 'importance') {
        return sorted.sort((a, b) => (
            Number(b.importance || 0) - Number(a.importance || 0)
            || Number(a.order || 0) - Number(b.order || 0)
            || a.id.localeCompare(b.id)
        ));
    }

    if (traversal === 'depth-first') {
        return sorted;
    }

    return sorted.sort((a, b) => (
        Number(a.order || 0) - Number(b.order || 0)
        || a.sourceIndex - b.sourceIndex
        || a.id.localeCompare(b.id)
    ));
}

function normalizeAnchors(anchors) {
    if (!Array.isArray(anchors)) return [];
    return anchors
        .filter((anchor) => anchor && typeof anchor === 'object')
        .map((anchor) => ({
            id: String(anchor.id || anchor.selector || '').trim(),
            selector: String(anchor.selector || '').trim(),
            label: String(anchor.label || '').trim(),
        }))
        .filter((anchor) => anchor.selector);
}

function validateSourceNode(node, path, seenIds, issues) {
    requiredString(node?.id, `${path}.id`, issues);
    const sourceKey = `source:${node?.id}`;
    if (node?.id && seenIds.has(sourceKey)) {
        issues.push(error(`${path}.id`, `Duplicate sitemap id "${node.id}".`));
    }
    seenIds.add(sourceKey);
}

function routeFor({ baseHref, tabId, itemId }) {
    const hash = itemId ? `${tabId}/${itemId}` : tabId;
    return `${baseHref}#${hash}`;
}

function normalizeTraversal(value) {
    const traversal = String(value || 'ordered').trim().toLowerCase();
    return ['ordered', 'breadth-first', 'depth-first', 'importance'].includes(traversal)
        ? traversal
        : 'ordered';
}

function normalizeViewport(value) {
    const viewport = value || DEFAULT_VIEWPORT;
    return {
        width: numberOr(viewport.width, DEFAULT_VIEWPORT.width),
        height: numberOr(viewport.height, DEFAULT_VIEWPORT.height),
    };
}

function requiredString(value, path, issues) {
    if (typeof value !== 'string' || value.trim() === '') {
        issues.push(error(path, `${path} is required.`));
    }
}

function stringOr(value, fallback) {
    return typeof value === 'string' && value.trim() ? value.trim() : fallback;
}

function numberOr(value, fallback) {
    const number = Number(value);
    return Number.isFinite(number) ? number : fallback;
}

function error(path, message) {
    return { level: 'error', path, message };
}
