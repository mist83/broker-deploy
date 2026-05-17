/**
 * Theme Builder
 * Copy an existing ui.mullmania.com theme, replace colors, and save it as a locked named theme.
 */

(function(window, document) {
    'use strict';

    const UI = window.UI || (window.UI = {});
    const THEME_BUILDER_OPERATOR_KEY_STORAGE_KEY = 'ui.theme-builder.operator-key';
    const THEME_FILES = ['colors.css', 'layout.css', 'style.css'];
    const HEX_PATTERN = /#[0-9a-fA-F]{6}\b/g;
    const DEFAULT_SOURCE_THEME = 'cyberpink';

    function createThemeBuilderSurface() {
        const instanceId = `theme-builder-${Date.now()}-${Math.random().toString(16).slice(2)}`;
        const state = {
            origin: UI.origin || window.location.origin,
            themes: [],
            sourceThemeId: DEFAULT_SOURCE_THEME,
            files: {},
            colors: [],
            replacements: {},
        };

        const root = element('div', 'theme-builder-surface');
        root.dataset.themeBuilderInstance = instanceId;
        root.innerHTML = `
            <div class="theme-builder-toolbar">
                <label>
                    <span>Copy from</span>
                    <select data-theme-builder-source></select>
                </label>
                <label>
                    <span>New name</span>
                    <input data-theme-builder-name type="text" value="Cyberblue" autocomplete="off">
                </label>
                <label>
                    <span>Theme id</span>
                    <input data-theme-builder-id type="text" value="cyberblue" autocomplete="off">
                </label>
                <label>
                    <span>Operator key</span>
                    <input data-theme-builder-key type="password" autocomplete="off" placeholder="X-Operator-Key">
                </label>
            </div>
            <div class="theme-builder-actions">
                <button type="button" class="btn-secondary" data-theme-builder-cyberblue>
                    <i class="ti ti-droplet"></i>
                    Cyberblue
                </button>
                <button type="button" class="btn-secondary" data-theme-builder-randomize>
                    <i class="ti ti-dice-5"></i>
                    Randomize
                </button>
                <button type="button" class="btn-secondary" data-theme-builder-reset>
                    <i class="ti ti-copy"></i>
                    Copy exact
                </button>
                <button type="button" class="btn-primary" data-theme-builder-save>
                    <i class="ti ti-lock"></i>
                    Save locked theme
                </button>
            </div>
            <div class="theme-builder-status alert alert-info" data-theme-builder-status>
                Loading theme catalog.
            </div>
            <div class="theme-builder-grid">
                <section class="theme-builder-panel">
                    <div class="theme-builder-panel-header">
                        <h3>Color replacements</h3>
                        <span data-theme-builder-count></span>
                    </div>
                    <div class="theme-builder-color-list" data-theme-builder-colors></div>
                </section>
                <section class="theme-builder-panel">
                    <div class="theme-builder-panel-header">
                        <h3>Live preview</h3>
                        <a data-theme-builder-open-preview class="btn-secondary" href="#" target="_blank" rel="noopener">
                            <i class="ti ti-external-link"></i>
                            Open
                        </a>
                    </div>
                    <iframe class="theme-builder-preview" data-theme-builder-preview title="Theme Builder preview"></iframe>
                </section>
            </div>
        `;

        window.setTimeout(() => {
            const mountedRoot = document.querySelector(`[data-theme-builder-instance="${instanceId}"]`);
            if (mountedRoot) {
                bindThemeBuilder(mountedRoot, state);
            }
        }, 0);

        return root;
    }

    function bindThemeBuilder(root, state) {
        if (root.dataset.themeBuilderBound === 'true') {
            return;
        }
        root.dataset.themeBuilderBound = 'true';

        const refs = collectRefs(root);
        refs.key.value = readStoredOperatorKey();
        refs.key.addEventListener('input', () => storeOperatorKey(refs.key.value.trim()));
        refs.name.addEventListener('input', () => {
            if (!refs.id.dataset.userEdited) {
                refs.id.value = slugify(refs.name.value);
            }
        });
        refs.id.addEventListener('input', () => {
            refs.id.dataset.userEdited = 'true';
        });
        refs.source.addEventListener('change', async () => {
            state.sourceThemeId = refs.source.value;
            await loadSourceTheme(state, refs);
            renderColorRows(state, refs);
            renderPreview(state, refs);
        });
        refs.randomize.addEventListener('click', () => {
            state.replacements = Object.fromEntries(state.colors.map((color) => [color, randomReadableColor()]));
            renderColorRows(state, refs);
            renderPreview(state, refs);
        });
        refs.reset.addEventListener('click', () => {
            state.replacements = {};
            renderColorRows(state, refs);
            renderPreview(state, refs);
        });
        refs.cyberblue.addEventListener('click', () => {
            refs.name.value = 'Cyberblue';
            refs.id.value = 'cyberblue';
            refs.id.dataset.userEdited = 'true';
            state.replacements = buildCyberblueMap(state.colors);
            renderColorRows(state, refs);
            renderPreview(state, refs);
        });
        refs.save.addEventListener('click', () => saveTheme(state, refs));

        root.querySelectorAll('.theme-builder-toolbar label').forEach((label) => {
            label.classList.add('form-field');
        });

        void hydrate(state, refs);
    }

    function collectRefs(root) {
        return {
            source: root.querySelector('[data-theme-builder-source]'),
            name: root.querySelector('[data-theme-builder-name]'),
            id: root.querySelector('[data-theme-builder-id]'),
            key: root.querySelector('[data-theme-builder-key]'),
            status: root.querySelector('[data-theme-builder-status]'),
            colors: root.querySelector('[data-theme-builder-colors]'),
            count: root.querySelector('[data-theme-builder-count]'),
            preview: root.querySelector('[data-theme-builder-preview]'),
            openPreview: root.querySelector('[data-theme-builder-open-preview]'),
            randomize: root.querySelector('[data-theme-builder-randomize]'),
            reset: root.querySelector('[data-theme-builder-reset]'),
            cyberblue: root.querySelector('[data-theme-builder-cyberblue]'),
            save: root.querySelector('[data-theme-builder-save]'),
        };
    }

    async function hydrate(state, refs) {
        try {
            state.themes = await fetchThemeCatalog(state.origin);
            refs.source.replaceChildren(...state.themes.map((theme) => {
                const option = document.createElement('option');
                option.value = theme.id;
                option.textContent = theme.name || titleCase(theme.id);
                option.selected = theme.id === state.sourceThemeId;
                return option;
            }));

            if (!state.themes.some((theme) => theme.id === state.sourceThemeId)) {
                state.sourceThemeId = state.themes[0]?.id || DEFAULT_SOURCE_THEME;
                refs.source.value = state.sourceThemeId;
            }

            await loadSourceTheme(state, refs);
            renderColorRows(state, refs);
            renderPreview(state, refs);
        } catch (error) {
            setStatus(refs, error.message || String(error), 'danger');
        }
    }

    async function fetchThemeCatalog(origin) {
        const response = await fetch(`${origin}/styles.json?themeBuilder=${Date.now()}`);
        if (!response.ok) {
            throw new Error(`Theme catalog failed to load: ${response.status}`);
        }
        const catalog = await response.json();
        return (Array.isArray(catalog) ? catalog : [])
            .filter((theme) => theme?.id && theme.id !== 'active')
            .map((theme) => ({ ...theme, id: String(theme.id).trim().toLowerCase() }));
    }

    async function loadSourceTheme(state, refs) {
        setStatus(refs, `Loading ${state.sourceThemeId}.`, 'info');
        const entries = await Promise.all(THEME_FILES.map(async (fileName) => {
            const response = await fetch(`${state.origin}/${state.sourceThemeId}/${fileName}?themeBuilder=${Date.now()}`);
            if (!response.ok) {
                throw new Error(`${state.sourceThemeId}/${fileName} failed to load: ${response.status}`);
            }
            return [fileName, await response.text()];
        }));

        state.files = Object.fromEntries(entries);
        state.colors = extractColors(Object.values(state.files).join('\n'));
        state.replacements = {};
        setStatus(refs, `Loaded ${titleCase(state.sourceThemeId)}. Choose replacements, randomize, or save an exact copy.`, 'info');
    }

    function extractColors(cssText) {
        return Array.from(new Set((cssText.match(HEX_PATTERN) || []).map((color) => color.toUpperCase())))
            .sort((a, b) => usageCount(cssText, b) - usageCount(cssText, a));
    }

    function usageCount(text, color) {
        const match = text.match(new RegExp(color, 'gi'));
        return match ? match.length : 0;
    }

    function renderColorRows(state, refs) {
        refs.colors.replaceChildren();
        refs.count.textContent = `${state.colors.length} colors`;

        state.colors.forEach((color) => {
            const row = element('label', 'theme-builder-color-row');
            row.innerHTML = `
                <span class="theme-builder-swatch" style="background:${color}"></span>
                <code>${color}</code>
                <input type="color" value="${state.replacements[color] || color}" aria-label="Replacement for ${color}">
                <span class="theme-builder-swatch" data-next-swatch style="background:${state.replacements[color] || color}"></span>
            `;
            const input = row.querySelector('input');
            const nextSwatch = row.querySelector('[data-next-swatch]');
            input.addEventListener('input', () => {
                const next = input.value.toUpperCase();
                nextSwatch.style.background = next;
                if (next === color) {
                    delete state.replacements[color];
                } else {
                    state.replacements[color] = next;
                }
                renderPreview(state, refs);
            });
            refs.colors.appendChild(row);
        });
    }

    function renderPreview(state, refs) {
        const css = buildPreviewCss(state);
        const themeId = sanitizeThemeId(refs.id.value || 'new-theme') || 'new-theme';
        const previewUrl = `${state.origin}/preview.html?theme=${encodeURIComponent(themeId)}`;
        refs.openPreview.href = previewUrl;
        refs.preview.srcdoc = `
            <!doctype html>
            <html>
            <head>
                <base href="${state.origin}/${state.sourceThemeId}/">
                <style>${escapeStyle(css)}</style>
            </head>
            <body>
                <header class="header">
                    <h1><i class="ti ti-palette"></i><span>${escapeHtml(refs.name.value || 'New Theme')}</span></h1>
                    <div class="header-links"><a class="header-link" href="#">Preview</a></div>
                </header>
                <div class="tabs">
                    <div class="tab active"><i class="ti ti-brush"></i><span class="tab-label">Tokens</span></div>
                    <div class="tab"><i class="ti ti-layout-grid"></i><span class="tab-label">Components</span></div>
                </div>
                <main class="page-container">
                    <div class="page-header">
                        <div class="page-header-text">
                            <h2>${escapeHtml(refs.name.value || 'New Theme')}</h2>
                            <p>Copied from ${escapeHtml(titleCase(state.sourceThemeId))} with ${Object.keys(state.replacements).length} color replacement${Object.keys(state.replacements).length === 1 ? '' : 's'}.</p>
                        </div>
                    </div>
                    <div class="grid-3">
                        <div class="card"><h3>Primary</h3><p>Buttons, active tabs, and selection state.</p><button>Action</button></div>
                        <div class="card"><h3>Secondary</h3><p>Badges, accents, and shell details.</p><span class="status-badge status-info">Live</span></div>
                        <div class="card"><h3>Surface</h3><p>Cards, borders, shadows, and typography.</p><input value="Theme input"></div>
                    </div>
                </main>
            </body>
            </html>
        `;
    }

    function buildPreviewCss(state) {
        return THEME_FILES
            .filter((fileName) => fileName !== 'style.css')
            .map((fileName) => applyReplacements(state.files[fileName] || '', state.replacements))
            .join('\n\n');
    }

    async function saveTheme(state, refs) {
        const themeId = sanitizeThemeId(refs.id.value);
        const name = refs.name.value.trim();
        const operatorKey = refs.key.value.trim();

        if (!themeId) {
            setStatus(refs, 'Theme id must be lowercase letters, numbers, and hyphens.', 'danger');
            return;
        }
        if (!name) {
            setStatus(refs, 'Name the theme before saving.', 'danger');
            return;
        }
        if (!operatorKey) {
            setStatus(refs, 'Paste the operator key before saving.', 'danger');
            refs.key.focus();
            return;
        }

        storeOperatorKey(operatorKey);
        setStatus(refs, `Saving ${name}.`, 'info');

        try {
            const response = await fetch('/api/theme/create', {
                method: 'POST',
                headers: {
                    'content-type': 'application/json',
                    'x-operator-key': operatorKey,
                },
                body: JSON.stringify({
                    themeId,
                    name,
                    sourceThemeId: state.sourceThemeId,
                    colorReplacements: state.replacements,
                    description: `Theme Builder copy of ${state.sourceThemeId}.`,
                    icon: 'ti ti-palette',
                    createdBy: window.location.host || 'ui.mullmania.com',
                }),
            });
            const payload = await response.json().catch(() => null);
            if (!response.ok) {
                throw new Error(payload?.error || `Save failed with ${response.status}.`);
            }

            const styleUrl = payload?.urls?.style || `${state.origin}/${themeId}/style.css`;
            const layoutNote = payload?.reusedSourceLayout ? ' Reused the source layout recipe.' : '';
            setStatus(refs, `Saved ${name}. It is locked at ${styleUrl}.${layoutNote}`, 'success');
            if (window.UI?.setTheme) {
                window.UI.setTheme(themeId);
            }
        } catch (error) {
            setStatus(refs, error.message || String(error), 'danger');
        }
    }

    function buildCyberblueMap(colors) {
        const map = {};
        colors.forEach((color) => {
            const hsl = hexToHsl(color);
            if (hsl.s > 35 && (hsl.h > 280 || hsl.h < 30)) {
                map[color] = hslToHex(205, Math.max(hsl.s, 78), Math.max(42, Math.min(68, hsl.l)));
            }
        });
        return map;
    }

    function randomReadableColor() {
        return hslToHex(Math.floor(Math.random() * 360), 58 + Math.floor(Math.random() * 34), 38 + Math.floor(Math.random() * 32));
    }

    function applyReplacements(text, replacements) {
        return Object.entries(replacements).reduce((next, [oldColor, newColor]) => (
            next.replace(new RegExp(escapeRegExp(oldColor), 'gi'), newColor)
        ), text);
    }

    function sanitizeThemeId(value) {
        return String(value || '')
            .trim()
            .toLowerCase()
            .replace(/[^a-z0-9-]+/g, '-')
            .replace(/^-+|-+$/g, '')
            .replace(/-{2,}/g, '-')
            .slice(0, 63);
    }

    function slugify(value) {
        return sanitizeThemeId(value) || 'new-theme';
    }

    function setStatus(refs, message, tone) {
        refs.status.textContent = message;
        refs.status.className = `theme-builder-status alert alert-${tone || 'info'}`;
    }

    function readStoredOperatorKey() {
        try {
            return localStorage.getItem(THEME_BUILDER_OPERATOR_KEY_STORAGE_KEY) || localStorage.getItem('ui.active-theme.operator-key') || '';
        } catch {
            return '';
        }
    }

    function storeOperatorKey(value) {
        try {
            if (value) {
                localStorage.setItem(THEME_BUILDER_OPERATOR_KEY_STORAGE_KEY, value);
            } else {
                localStorage.removeItem(THEME_BUILDER_OPERATOR_KEY_STORAGE_KEY);
            }
        } catch {
            // Ignore storage errors.
        }
    }

    function element(tag, className) {
        const node = document.createElement(tag);
        if (className) {
            node.className = className;
        }
        return node;
    }

    function titleCase(value) {
        return String(value || '').split(/[-_\s]+/).filter(Boolean).map((part) => (
            `${part.charAt(0).toUpperCase()}${part.slice(1)}`
        )).join(' ');
    }

    function escapeHtml(value) {
        return String(value ?? '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function escapeStyle(value) {
        return String(value || '').replace(/<\/style/gi, '<\\/style');
    }

    function escapeRegExp(value) {
        return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    function hexToHsl(hex) {
        const value = hex.replace('#', '');
        const r = parseInt(value.slice(0, 2), 16) / 255;
        const g = parseInt(value.slice(2, 4), 16) / 255;
        const b = parseInt(value.slice(4, 6), 16) / 255;
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let h = 0;
        let s = 0;
        const l = (max + min) / 2;
        if (max !== min) {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
                case r: h = ((g - b) / d + (g < b ? 6 : 0)); break;
                case g: h = ((b - r) / d + 2); break;
                default: h = ((r - g) / d + 4); break;
            }
            h /= 6;
        }
        return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
    }

    function hslToHex(h, s, l) {
        const hue = ((h % 360) + 360) % 360;
        const sat = Math.max(0, Math.min(100, s)) / 100;
        const light = Math.max(0, Math.min(100, l)) / 100;
        const c = (1 - Math.abs(2 * light - 1)) * sat;
        const x = c * (1 - Math.abs((hue / 60) % 2 - 1));
        const m = light - c / 2;
        const [r1, g1, b1] = hue < 60 ? [c, x, 0]
            : hue < 120 ? [x, c, 0]
                : hue < 180 ? [0, c, x]
                    : hue < 240 ? [0, x, c]
                        : hue < 300 ? [x, 0, c]
                            : [c, 0, x];
        return `#${[r1, g1, b1].map((channel) => (
            Math.round((channel + m) * 255).toString(16).padStart(2, '0')
        )).join('').toUpperCase()}`;
    }

    UI.themeBuilder = {
        create: createThemeBuilderSurface,
    };
})(window, document);
