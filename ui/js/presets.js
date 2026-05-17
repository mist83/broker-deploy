(function(window) {
    'use strict';

    const DEFAULT_THEME_ID = 'walmart';
    const UI = window.UI || (window.UI = {});

    const THEMES = {
        cyberblue: {
            id: 'cyberblue',
            name: 'Cyberblue',
            description: 'Theme Builder copy of cyberpink with the hot pink pushed to electric blue.',
            usage: 'Use when the synthwave chrome should stay neon and dramatic but lean blue instead of pink.',
        },
        cyberpink: {
            id: 'cyberpink',
            name: 'Cyberpink',
            description: 'Neon-heavy synthwave treatment for loud demos and high-energy branded work.',
            usage: 'Use when the interface should feel theatrical, dark, and sharply branded.',
        },
        editorial: {
            id: 'editorial',
            name: 'Editorial',
            description: 'Typography-led paper-and-ink theme for authored, high-intent surfaces.',
            usage: 'Use when the surface should feel authored, typographic, and deliberate without abandoning framework semantics.',
        },
        ghoul: {
            id: 'ghoul',
            name: 'Ghoul',
            description: 'Acid green and blood red on near-black. Monospace-first dev-console palette built for log streams, party-game HUDs, and TV-room visibility.',
            usage: 'Use when the surface is a dense information stream, a developer dashboard, or anything that should read clearly from across a room.',
        },
        mockup: {
            id: 'mockup',
            name: 'Mockup',
            description: 'Sketch-like wireframe treatment for concept reviews and low-fidelity product planning.',
            usage: 'Use for prototype walkthroughs, concept validation, and low-fidelity planning surfaces.',
        },
        monochrome: {
            id: 'monochrome',
            name: 'Monochrome',
            description: 'Neutral grayscale system with matching grayscale dark mode.',
            usage: 'Use when the interface should stay quiet, neutral, and free of color branding.',
        },
        blackwhite: {
            id: 'blackwhite',
            name: 'Black and White',
            description: 'Strict two-color theme: black on white, white on black in dark mode.',
            usage: 'Use when the surface should be as stark and literal as possible.',
        },
        ocean: {
            id: 'ocean',
            name: 'Ocean',
            description: 'Cool blue system for calmer dashboards and ambient product surfaces.',
            usage: 'Use when you want a restrained, calmer environment without losing clarity.',
        },
        pastelzom: {
            id: 'pastelzom',
            name: 'Pastel Zombie',
            description: 'Light pastel zombie theme built for readable asset browsers and playful horror tools.',
            usage: 'Use when a spooky or zombie-flavored surface needs to stay light, calm, and easy to scan.',
        },
        precog: {
            id: 'precog',
            name: 'Precog',
            description: 'Signal-room palette for timeline, automation, and monitoring surfaces.',
            usage: 'Use when status, history, or live operational state should feel precise without becoming loud.',
        },
        pumpkin: {
            id: 'pumpkin',
            name: 'Pumpkin',
            description: 'Warm rounded theme for approachable and slightly playful product work.',
            usage: 'Use for welcoming surfaces, playful tools, and flows that should feel human and soft.',
        },
        sunset: {
            id: 'sunset',
            name: 'Sunset',
            description: 'Warmer editorial palette for expressive showcase and storytelling surfaces.',
            usage: 'Use when the interface should feel warm, expressive, and slightly cinematic.',
        },
        terminal: {
            id: 'terminal',
            name: 'Terminal',
            description: 'Sharp monochrome terminal style for command-heavy tools and operator consoles.',
            usage: 'Use when the surface should read like an operator console without losing shared UI semantics.',
        },
        walmart: {
            id: 'walmart',
            name: 'Walmart',
            description: 'Brand-specific blue and yellow treatment for explicit Walmart-flavored work only.',
            usage: 'Use only when you intentionally need that branded color language.',
        },
        windows31: {
            id: 'windows31',
            name: 'Windows 3.1',
            description: 'Sharp gray bevels, blue chrome, and Times-flavored retro desktop styling.',
            usage: 'Use for intentionally crusty desktop nostalgia or legacy-control-panel demos.',
        },
        red: {
            id: 'red',
            name: 'Red',
            description: 'Clean simple-theme surfaces with a red accent.',
            usage: 'Use when the surface should stay neutral and let a red accent carry attention.',
        },
        orange: {
            id: 'orange',
            name: 'Orange',
            description: 'Clean simple-theme surfaces with an orange accent.',
            usage: 'Use when a warm, attention-getting accent works without leaning into pumpkin or sunset palettes.',
        },
        yellow: {
            id: 'yellow',
            name: 'Yellow',
            description: 'Clean simple-theme surfaces with a deep-amber accent.',
            usage: 'Use when yellow is the brand cue but contrast on white still has to read clearly.',
        },
        green: {
            id: 'green',
            name: 'Green',
            description: 'Clean simple-theme surfaces with a green accent.',
            usage: 'Use when the surface should stay neutral with a confident green accent.',
        },
        blue: {
            id: 'blue',
            name: 'Blue',
            description: 'Clean simple-theme surfaces with a blue accent.',
            usage: 'Use when the surface should feel default-blue without picking up Bootstrap or Walmart branding.',
        },
        indigo: {
            id: 'indigo',
            name: 'Indigo',
            description: 'Clean simple-theme surfaces with an indigo accent.',
            usage: 'Use when the surface should feel slightly more serious than blue without going violet.',
        },
        violet: {
            id: 'violet',
            name: 'Violet',
            description: 'Clean simple-theme surfaces with a violet accent.',
            usage: 'Use when the surface should carry a violet accent without leaning into the pastel or pink themes.',
        },
        mac: {
            id: 'mac',
            name: 'Mac',
            description: 'Apple/macOS control language — SF system font, system blue, pill segmented tabs, traffic-light modal close.',
            usage: 'Use when the surface should feel like a native macOS control set.',
        },
    };
    const ACTIVE_THEME_OPERATOR_KEY_STORAGE_KEY = 'ui.active-theme.operator-key';

    function codeBlock(text) {
        return {
            tag: 'pre',
            children: [
                {
                    tag: 'code',
                    text,
                },
            ],
        };
    }

    function bulletList(items) {
        return {
            tag: 'ul',
            attrs: {
                style: 'list-style: none; padding: 0;',
            },
            children: items.map((item, index) => ({
                tag: 'li',
                className: index === items.length - 1 ? '' : 'mb-sm',
                children: [
                    {
                        tag: 'i',
                        className: 'ti ti-check',
                        style: {
                            color: 'var(--color-success)',
                            marginRight: 'var(--space-xs)',
                        },
                    },
                    item,
                ],
            })),
        };
    }

    function linkList(items) {
        return {
            tag: 'ul',
            attrs: {
                style: 'list-style: none; padding: 0;',
            },
            children: items.map((item, index) => ({
                tag: 'li',
                className: index === items.length - 1 ? '' : 'mb-sm',
                children: [
                    {
                        tag: 'a',
                        attrs: {
                            href: item.href,
                            target: item.target || '_blank',
                        },
                        text: item.label,
                    },
                ],
            })),
        };
    }

    function tokenSwatch(title, variableName, description) {
        return UI.card({
            title,
            children: [
                {
                    tag: 'div',
                    style: {
                        height: '64px',
                        borderRadius: 'var(--radius-sm)',
                        background: `var(${variableName})`,
                        border: '1px solid var(--border-color)',
                        marginBottom: 'var(--space-sm)',
                    },
                },
                {
                    tag: 'code',
                    text: variableName,
                },
                {
                    tag: 'p',
                    className: 'text-muted mt-sm',
                    text: description,
                },
            ],
        });
    }

    function themeRuntimeSnippet(themeId) {
        if (themeId === 'active') {
            return '<script src="https://ui.mullmania.com/ui.js"></script>';
        }

        return `<script src="https://ui.mullmania.com/ui.js" data-ui-theme="${themeId}"></script>`;
    }

    function themeCssSnippet(themeId) {
        const path = themeId === 'active' ? 'active' : themeId;
        return `<link rel="stylesheet" href="https://ui.mullmania.com/${path}/style.css">`;
    }

    function themeCodeBlock(text, role) {
        return {
            tag: 'pre',
            dataset: role ? { themeSpecimenRole: role } : {},
            children: [
                {
                    tag: 'code',
                    text,
                },
            ],
        };
    }

    function getPublishedThemeManifest() {
        const rawThemeId = String(window.UIActiveThemeManifest?.themeId || DEFAULT_THEME_ID).trim().toLowerCase();
        const themeId = THEMES[rawThemeId] ? rawThemeId : DEFAULT_THEME_ID;
        return {
            themeId,
            publishedAt: String(window.UIActiveThemeManifest?.publishedAt || '').trim(),
            publishedBy: String(window.UIActiveThemeManifest?.publishedBy || '').trim(),
        };
    }

    function getPublishedThemeId() {
        return getPublishedThemeManifest().themeId;
    }

    function resolveShellThemeId(themeId) {
        const normalizedThemeId = String(themeId || 'active').trim().toLowerCase();
        return normalizedThemeId === 'active' ? getPublishedThemeId() : normalizedThemeId;
    }

    function currentShellThemeId() {
        return resolveShellThemeId(window.UI?.theme || 'active');
    }

    function isShellThemeActive(themeId) {
        return resolveShellThemeId(themeId) === currentShellThemeId();
    }

    function isPublishedTheme(themeId) {
        return resolveShellThemeId(themeId) === getPublishedThemeId();
    }

    function previewTheme(theme) {
        const nextThemeId = resolveShellThemeId(theme.id);

        if (typeof window.UI?.setTheme === 'function') {
            window.UI.setTheme(nextThemeId);
        }

        if (window.Toasts?.success) {
            window.Toasts.success(`${theme.name} is previewing in this shell only.`);
        }

        const shell = window.UI?.getShell?.();
        if (shell && typeof shell.loadTab === 'function') {
            void shell.loadTab('themes', theme.id);
        }
    }

    function readStoredOperatorKey() {
        try {
            return localStorage.getItem(ACTIVE_THEME_OPERATOR_KEY_STORAGE_KEY) || '';
        } catch {
            return '';
        }
    }

    function storeOperatorKey(value) {
        try {
            if (value) {
                localStorage.setItem(ACTIVE_THEME_OPERATOR_KEY_STORAGE_KEY, value);
            } else {
                localStorage.removeItem(ACTIVE_THEME_OPERATOR_KEY_STORAGE_KEY);
            }
        } catch {
            // Ignore storage errors.
        }
    }

    function getModalHost() {
        if (window.UI?.__themePublishModalHost) {
            return window.UI.__themePublishModalHost;
        }

        if (typeof window.ModalsEverywhere !== 'function') {
            return null;
        }

        window.UI.__themePublishModalHost = new window.ModalsEverywhere();
        return window.UI.__themePublishModalHost;
    }

    async function publishThemeAsGlobalDefault(theme, operatorKey) {
        const response = await fetch('/api/theme/active', {
            method: 'POST',
            headers: {
                'content-type': 'application/json',
                'x-operator-key': operatorKey,
            },
            body: JSON.stringify({
                themeId: theme.id,
                publishedBy: window.location.host || 'ui.mullmania.com',
            }),
        });

        let payload = null;
        try {
            payload = await response.json();
        } catch {
            payload = null;
        }

        if (!response.ok) {
            throw new Error(payload?.error || `Publish failed with ${response.status}.`);
        }

        window.UIActiveThemeManifest = payload.manifest || {
            themeId: payload.activeTheme,
            publishedAt: payload.publishedAt,
            publishedBy: window.location.host || 'ui.mullmania.com',
        };
        return payload;
    }

    function showPublishThemeModal(theme) {
        const modalHost = getModalHost();
        const operatorKeyInput = document.createElement('input');
        operatorKeyInput.type = 'password';
        operatorKeyInput.className = 'input';
        operatorKeyInput.placeholder = 'Paste X-Operator-Key';
        operatorKeyInput.value = readStoredOperatorKey();
        operatorKeyInput.style.width = '100%';
        operatorKeyInput.style.marginTop = 'var(--space-sm)';
        operatorKeyInput.autocomplete = 'off';

        operatorKeyInput.addEventListener('input', () => {
            storeOperatorKey(operatorKeyInput.value.trim());
        });

        const helper = document.createElement('p');
        helper.className = 'text-muted mt-sm';
        helper.textContent = 'This is the shared X-Operator-Key for protected publish actions. It is saved in this browser.';

        const impact = document.createElement('p');
        impact.className = 'text-muted mt-sm';
        impact.textContent = 'This publishes the global default for every unpinned consumer.';

        const wrapper = document.createElement('div');
        wrapper.appendChild(document.createTextNode(`Publish ${theme.name} as the global default?`));
        wrapper.appendChild(operatorKeyInput);
        wrapper.appendChild(helper);
        wrapper.appendChild(impact);

        const submit = async () => {
            const operatorKey = operatorKeyInput.value.trim();
            if (!operatorKey) {
                window.Toasts?.warning?.('Paste the operator key first.');
                return false;
            }

            storeOperatorKey(operatorKey);

            try {
                const payload = await publishThemeAsGlobalDefault(theme, operatorKey);
                window.Toasts?.success?.(`${theme.name} is now the published default.`);
                window.setTimeout(() => {
                    window.location.reload();
                }, 150);
                return true;
            } catch (error) {
                window.Toasts?.error?.(error.message || String(error));
                return false;
            }
        };

        if (!modalHost) {
            const operatorKey = window.prompt(`Publish ${theme.name} as the global default. Paste X-Operator-Key:`) || '';
            if (!operatorKey.trim()) {
                return;
            }
            operatorKeyInput.value = operatorKey.trim();
            storeOperatorKey(operatorKey.trim());
            void submit();
            return;
        }

        modalHost.show({
            title: 'Publish Global Default',
            icon: 'ti ti-world-upload',
            content: wrapper,
            actions: [
                {
                    text: 'Cancel',
                    type: 'secondary',
                },
                {
                    text: 'Publish',
                    type: 'primary',
                    onClick: submit,
                },
            ],
        });

        window.setTimeout(() => {
            operatorKeyInput.focus();
            operatorKeyInput.select();
        }, 0);
    }

    function compactComponentPreview(themeId) {
        const resolvedThemeId = resolveShellThemeId(themeId);
        const theme = THEMES[resolvedThemeId] || THEMES[DEFAULT_THEME_ID];

        return UI.stack({
            gap: 'md',
            children: [
                UI.stack({
                    gap: 'sm',
                    children: [
                        UI.text({
                            role: 'label',
                            text: `${theme.name} / semantic preview`,
                            className: 'text-muted',
                        }),
                        UI.text({
                            role: 'brand',
                            text: 'MULLMANIA',
                            style: {
                                fontSize: 'clamp(32px, 5vw, 56px)',
                            },
                        }),
                        UI.text({
                            role: 'display',
                            text: 'edited',
                            style: {
                                fontSize: 'clamp(26px, 4vw, 40px)',
                            },
                        }),
                        UI.text({
                            role: 'body',
                            text: 'Preview of brand, display, body, and status styles.',
                            className: 'text-secondary',
                        }),
                    ],
                }),
                {
                    tag: 'div',
                    className: 'grid-between',
                    children: [
                        {
                            tag: 'div',
                            className: 'card-title',
                            children: [
                                {
                                    tag: 'i',
                                    className: 'ti ti-palette',
                                },
                                `${theme.name} Preview`,
                            ],
                        },
                        UI.status({
                            label: 'Preview',
                            tone: 'info',
                        }),
                    ],
                },
                {
                    tag: 'div',
                    className: 'grid-row gap-sm',
                    children: [
                        UI.text({ role: 'label', text: 'display' }),
                        UI.text({ role: 'label', text: 'ui' }),
                        UI.text({ role: 'label', text: 'metadata' }),
                    ],
                },
                {
                    tag: 'div',
                    className: 'grid-row gap-sm',
                    children: [
                        UI.button({
                            label: 'Primary',
                            variant: 'primary',
                        }),
                        UI.button({
                            label: 'Secondary',
                            variant: 'secondary',
                        }),
                    ],
                },
                UI.card({
                    title: 'Status And Data',
                    children: [
                        {
                            tag: 'div',
                            className: 'grid-row gap-sm mb-md',
                            children: [
                                UI.status({ label: 'Healthy', tone: 'success' }),
                                UI.status({ label: 'Review', tone: 'warning' }),
                                UI.status({ label: 'Blocked', tone: 'error' }),
                            ],
                        },
                        UI.chart({
                            variant: 'bar',
                            series: [12, 18, 14, 20],
                            labels: ['Mon', 'Tue', 'Wed', 'Thu'],
                            ariaLabel: `${theme.name} preview chart`,
                        }),
                    ],
                }),
            ],
        });
    }

    function detailCardGrid(children) {
        return {
            tag: 'div',
            className: 'docs-grid',
            children,
        };
    }

    function docsPage({ title, description, cards, actions = [] }) {
        const content = detailCardGrid(cards);
        content.__uiShellPage = {
            title,
            description,
            actions,
        };
        return content;
    }

    const CANONICAL_UI_ORIGIN = 'https://ui.mullmania.com';
    const PRESET_ADOPTION_DEFAULTS = Object.freeze({
        control: {
            description: 'Use the structured runtime inputs below before reaching for page-local HTML.',
            adoptBullets: [
                'Mount the shared preset while the framework shape still matches your need.',
                'If you only need a subset, extract shared UI primitives instead of cloning the whole page.',
                'If a variation repeats, upstream it into the framework instead of carrying private markup debt.',
            ],
            compatibilityBullets: [
                'htmlSource is allowed for vendor embeds or genuinely novel markup only.',
                'Do not fork the shared shell or restyle generic controls by hand unless the runtime cannot express the surface.',
                'If you are about to paste a second copy of custom HTML, stop and upstream a component or preset.',
            ],
        },
        specimen: {
            description: 'Treat these pages as semantic contracts for tokens and shared behavior, not one-off screenshots.',
            adoptBullets: [
                'Consume tokens through shared components before dropping directly to page-local CSS.',
                'Let the active theme drive the default look unless a consumer explicitly needs a pinned theme.',
                'Use the specimen routes to validate semantics, then express real surfaces through presets or components.',
            ],
            compatibilityBullets: [
                'Direct CSS is still allowed for narrow exceptions, but semantic tokens remain the contract.',
                'Do not hardcode repeated colors, spacing, or type roles when the framework already names them.',
                'If a visual rule becomes app-wide, move it into UI instead of scattering local overrides.',
            ],
        },
        pattern: {
            description: 'Use the page assembly here as a structured reference or mount it directly while the layout intent matches.',
            adoptBullets: [
                'Keep shell structure in sitemap.json and let the runtime own the tab, sidebar, and scroll split.',
                'Extract shared pieces into framework components instead of copying the entire page when only one region is needed.',
                'Prefer preset, component, or componentSource before inventing a bespoke document shell.',
            ],
            compatibilityBullets: [
                'htmlSource stays available as a migration hatch, not as the normal authoring path.',
                'Do not recreate the framework shell with static HTML if sitemap.json can express the surface.',
                'If the page needs remote rendering or sharing, move it to a JSON contract instead of a custom fragment.',
            ],
        },
        lab: {
            description: 'Use this surface to prototype structured inputs, then graduate stable output into a consumer-facing contract.',
            adoptBullets: [
                'Use the lab to test JSON structure and handoff shape before wiring it into a product shell.',
                'Promote stable output into componentSource or contractSource instead of shipping the editor surface itself.',
                'Share renderable output through render.html or sitemap.json once the structure is stable.',
            ],
            compatibilityBullets: [
                'The lab UI is a framework tool surface, not a production shell to copy into apps.',
                'Raw HTML is still an escape hatch, but stable structured data should win once the shape is known.',
                'If a consumer cannot adopt the full lab, keep only the generated contract and let UI render it.',
            ],
        },
    });

    function frameworkOrigin() {
        const hostname = String(window.location.hostname || '').trim().toLowerCase();
        if (!hostname || hostname === 'localhost' || hostname === '127.0.0.1') {
            return CANONICAL_UI_ORIGIN;
        }
        return window.location.origin || CANONICAL_UI_ORIGIN;
    }

    function cloneSerializable(value, fallback = null) {
        try {
            return JSON.parse(JSON.stringify(value));
        } catch {
            return fallback;
        }
    }

    function prettyJson(value) {
        return JSON.stringify(value, null, 2);
    }

    function isDomNode(value) {
        return typeof Node !== 'undefined' && value instanceof Node;
    }

    function sanitizeSitemapItem(item) {
        const clone = cloneSerializable(item, {});
        if (!clone || typeof clone !== 'object') {
            return {};
        }

        delete clone.sections;
        delete clone.inlineData;
        delete clone.nestedTabs;
        delete clone.nestedTabsSource;
        delete clone.delay;
        return clone;
    }

    function collectPresetRoutes(presetName) {
        const sitemap = window.UI?.getShell?.()?.sitemap;
        if (!Array.isArray(sitemap?.tabs)) {
            return [];
        }

        const routes = [];

        sitemap.tabs.forEach((tab) => {
            if (!tab || typeof tab !== 'object') {
                return;
            }

            if (tab.preset === presetName) {
                routes.push({
                    kind: 'tab',
                    tabId: tab.id,
                    tabLabel: tab.label || tab.id,
                    tabLayout: tab.layout || 'workspace',
                    itemId: null,
                    itemLabel: tab.label || tab.id,
                    hash: `#${tab.id}`,
                    tab: {
                        id: tab.id,
                        label: tab.label,
                        icon: tab.icon,
                        layout: tab.layout,
                    },
                    item: {
                        id: tab.id,
                        label: tab.label,
                        icon: tab.icon,
                        preset: tab.preset,
                    },
                });
            }

            const sections = Array.isArray(tab.sections) ? tab.sections : [];
            sections.forEach((section) => {
                const items = Array.isArray(section?.inlineData) ? section.inlineData : [];
                items.forEach((item) => {
                    if (!item || item.preset !== presetName) {
                        return;
                    }

                    routes.push({
                        kind: 'item',
                        tabId: tab.id,
                        tabLabel: tab.label || tab.id,
                        tabLayout: tab.layout || 'workspace',
                        itemId: item.id || null,
                        itemLabel: item.name || item.label || item.id || tab.label || tab.id,
                        hash: `#${tab.id}${item.id ? `/${item.id}` : ''}`,
                        tab: {
                            id: tab.id,
                            label: tab.label,
                            icon: tab.icon,
                            layout: tab.layout,
                        },
                        item: sanitizeSitemapItem(item),
                    });
                });
            });
        });

        return routes;
    }

    function sortPresetRoutes(routes, preferredTabs = []) {
        const currentHash = String(window.location.hash || '').trim();
        const preferredOrder = Array.isArray(preferredTabs) ? preferredTabs : [];

        return routes.slice().sort((left, right) => {
            const leftCurrent = left.hash === currentHash ? 1 : 0;
            const rightCurrent = right.hash === currentHash ? 1 : 0;
            if (leftCurrent !== rightCurrent) {
                return rightCurrent - leftCurrent;
            }

            const leftIndex = preferredOrder.indexOf(left.tabId);
            const rightIndex = preferredOrder.indexOf(right.tabId);
            if (leftIndex !== rightIndex) {
                return (leftIndex === -1 ? Number.MAX_SAFE_INTEGER : leftIndex)
                    - (rightIndex === -1 ? Number.MAX_SAFE_INTEGER : rightIndex);
            }

            return left.hash.localeCompare(right.hash);
        });
    }

    function buildMinimalSitemapSnippet(route, presetName) {
        if (!route) {
            return {
                tabs: [
                    {
                        id: 'demo',
                        label: 'Demo',
                        layout: 'document',
                        preset: presetName,
                    },
                ],
            };
        }

        if (route.kind === 'tab') {
            return {
                tabs: [
                    {
                        ...cloneSerializable(route.tab, {}),
                        preset: presetName,
                    },
                ],
            };
        }

        return {
            tabs: [
                {
                    ...cloneSerializable(route.tab, {}),
                    sections: [
                        {
                            type: 'list',
                            inlineData: [cloneSerializable(route.item, {})],
                        },
                    ],
                },
            ],
        };
    }

    function buildJsMountSnippet(presetName) {
        return [
            `<script src="${frameworkOrigin()}/ui.js"></script>`,
            '<div id="app"></div>',
            '<script>',
            '  UI.ready().then(() => {',
            `    UI.mount('#app', UI.presets.resolve('${presetName}'));`,
            '  });',
            '</script>',
        ].join('\n');
    }

    function buildStandaloneRenderUrl(presetName) {
        return `${frameworkOrigin()}/render.html?preset=${encodeURIComponent(presetName)}`;
    }

    function truncateCodeSnippet(text, maxLines = 28) {
        const normalized = String(text || '').trim();
        if (!normalized) {
            return '';
        }

        const lines = normalized.split('\n');
        if (lines.length <= maxLines) {
            return normalized;
        }

        return `${lines.slice(0, maxLines).join('\n')}\n…`;
    }

    function snapshotRenderableHtml(definition) {
        if (!definition) {
            return '';
        }

        try {
            if (isDomNode(definition)) {
                const pageContainer = definition.matches?.('.page-container')
                    ? definition
                    : definition.querySelector?.('.page-container');
                const target = pageContainer || definition;
                return (target.outerHTML || target.innerHTML || '').trim();
            }

            if (!window.UI?.mount) {
                return '';
            }

            const host = document.createElement('div');
            window.UI.mount(host, definition);
            const pageContainer = host.querySelector('.page-container');
            return ((pageContainer && pageContainer.outerHTML) || host.innerHTML || '').trim();
        } catch (error) {
            console.warn('[UI Presets] Could not snapshot rendered HTML for adoption kit.', error);
            return '';
        }
    }

    function buildAdoptionCardGrid(cards) {
        return {
            tag: 'div',
            className: 'docs-grid',
            children: cards,
        };
    }

    function buildPresetAdoptionSection(definition, options = {}) {
        const presetName = String(options.presetName || '').trim();
        if (!presetName) {
            return null;
        }

        const categoryName = String(options.category || 'pattern').trim().toLowerCase();
        const category = PRESET_ADOPTION_DEFAULTS[categoryName] || PRESET_ADOPTION_DEFAULTS.pattern;
        const routes = sortPresetRoutes(collectPresetRoutes(presetName), options.preferredTabs || []);
        const primaryRoute = routes[0] || null;
        const minimalSitemap = buildMinimalSitemapSnippet(primaryRoute, presetName);
        const renderedHtml = snapshotRenderableHtml(definition);
        const standaloneRenderUrl = buildStandaloneRenderUrl(presetName);
        const jsMountSnippet = buildJsMountSnippet(presetName);
        const routeLinks = routes.length > 0
            ? linkList(routes.map((route) => ({
                label: `${route.tabLabel}${route.itemLabel && route.itemLabel !== route.tabLabel ? `: ${route.itemLabel}` : ''}`,
                href: `/${route.hash}`,
                target: '_self',
            })))
            : {
                tag: 'p',
                className: 'text-muted',
                text: 'No active shell route detected in this surface. Use the preset directly or mount it through sitemap.json.',
            };

        return UI.section({
            title: 'Adoption Kit',
            description: options.description || category.description,
            children: [
                buildAdoptionCardGrid([
                    UI.card({
                        title: 'Minimal sitemap.json',
                        icon: 'ti ti-sitemap',
                        children: [
                            routeLinks,
                            codeBlock(prettyJson(minimalSitemap)),
                        ],
                        actions: [
                            {
                                label: 'Copy JSON',
                                variant: 'secondary',
                                icon: 'ti ti-copy',
                                action: {
                                    type: 'copy',
                                    text: prettyJson(minimalSitemap),
                                    successMessage: 'Minimal sitemap snippet copied.',
                                },
                            },
                            ...(primaryRoute ? [{
                                label: 'Open Route',
                                variant: 'link',
                                icon: 'ti ti-arrow-up-right',
                                action: {
                                    type: 'open',
                                    href: `/${primaryRoute.hash}`,
                                    target: '_self',
                                },
                            }] : []),
                        ],
                    }),
                    UI.card({
                        title: 'JS Mount',
                        icon: 'ti ti-code',
                        children: [
                            codeBlock(jsMountSnippet),
                        ],
                        actions: [
                            {
                                label: 'Copy Mount',
                                variant: 'secondary',
                                icon: 'ti ti-copy',
                                action: {
                                    type: 'copy',
                                    text: jsMountSnippet,
                                    successMessage: 'JS mount snippet copied.',
                                },
                            },
                        ],
                    }),
                    UI.card({
                        title: 'Standalone Render',
                        icon: 'ti ti-browser',
                        children: [
                            codeBlock(standaloneRenderUrl),
                            {
                                tag: 'p',
                                className: 'text-secondary mt-sm',
                                text: 'Use the hosted renderer when the surface should be addressable as a shared preset route.',
                            },
                        ],
                        actions: [
                            {
                                label: 'Copy URL',
                                variant: 'secondary',
                                icon: 'ti ti-link',
                                action: {
                                    type: 'copy',
                                    text: standaloneRenderUrl,
                                    successMessage: 'Standalone render URL copied.',
                                },
                            },
                            {
                                label: 'Open Render',
                                variant: 'link',
                                icon: 'ti ti-arrow-up-right',
                                action: {
                                    type: 'open',
                                    href: standaloneRenderUrl,
                                    target: '_blank',
                                },
                            },
                        ],
                    }),
                    UI.card({
                        title: 'Compatibility Rules',
                        icon: 'ti ti-shield-check',
                        children: [
                            bulletList(category.adoptBullets),
                            {
                                tag: 'div',
                                className: 'mt-md',
                                children: [
                                    {
                                        tag: 'strong',
                                        text: 'HTML fallback',
                                    },
                                    bulletList(category.compatibilityBullets),
                                ],
                            },
                        ],
                    }),
                    UI.card({
                        title: 'Generated DOM Snapshot',
                        icon: 'ti ti-file-code',
                        children: renderedHtml
                            ? [codeBlock(truncateCodeSnippet(renderedHtml, 26))]
                            : [{
                                tag: 'p',
                                className: 'text-muted',
                                text: 'Generated DOM snapshot unavailable for this surface.',
                            }],
                        actions: renderedHtml ? [
                            {
                                label: 'Copy HTML',
                                variant: 'secondary',
                                icon: 'ti ti-copy',
                                action: {
                                    type: 'copy',
                                    text: renderedHtml,
                                    successMessage: 'Rendered HTML snapshot copied.',
                                },
                            },
                        ] : [],
                    }),
                ]),
            ],
        });
    }

    function attachPresetAdoption(definition, options = {}) {
        const section = buildPresetAdoptionSection(definition, options);
        if (!section) {
            return definition;
        }

        const presetName = String(options.presetName || '').trim();
        const routes = sortPresetRoutes(collectPresetRoutes(presetName), options.preferredTabs || []);
        const primaryRoute = routes[0] || null;
        const minimalSitemap = buildMinimalSitemapSnippet(primaryRoute, presetName);
        const jsMountSnippet = buildJsMountSnippet(presetName);
        const standaloneRenderUrl = buildStandaloneRenderUrl(presetName);
        const headerActions = [
            {
                label: 'Copy JSON',
                variant: 'secondary',
                icon: 'ti ti-copy',
                action: {
                    type: 'copy',
                    text: prettyJson(minimalSitemap),
                    successMessage: 'Minimal sitemap snippet copied.',
                },
            },
            {
                label: 'Copy Mount',
                variant: 'secondary',
                icon: 'ti ti-code',
                action: {
                    type: 'copy',
                    text: jsMountSnippet,
                    successMessage: 'JS mount snippet copied.',
                },
            },
            {
                label: 'Open Render',
                variant: 'link',
                icon: 'ti ti-arrow-up-right',
                action: {
                    type: 'open',
                    href: standaloneRenderUrl,
                    target: '_blank',
                },
            },
        ];

        const shellPage = definition && typeof definition === 'object' ? (definition.__uiShellPage || {}) : {};
        const resolvedTitle = shellPage.title
            || (typeof definition?.title === 'string' ? definition.title : '')
            || options.title
            || primaryRoute?.itemLabel
            || presetName;
        const resolvedDescription = shellPage.description
            || (typeof definition?.subtitle === 'string' ? definition.subtitle : '')
            || options.description
            || primaryRoute?.item?.description
            || primaryRoute?.tabLabel
            || 'Shared framework preset.';

        if (definition && typeof definition === 'object') {
            definition.__uiShellPage = {
                ...shellPage,
                title: resolvedTitle,
                description: resolvedDescription,
                actions: [...(Array.isArray(shellPage.actions) ? shellPage.actions : []), ...headerActions],
            };
        }

        if (isDomNode(definition)) {
            const pageContainer = definition.matches?.('.page-container')
                ? definition
                : definition.querySelector?.('.page-container')
                || definition;
            const host = document.createElement('div');
            window.UI.mount(host, section);
            Array.from(host.childNodes).forEach((child) => pageContainer.appendChild(child));
            return definition;
        }

        if (definition && typeof definition === 'object') {
            const existingChildren = Array.isArray(definition.children)
                ? definition.children
                : (definition.children ? [definition.children] : []);
            definition.children = [...existingChildren, section];
            return definition;
        }

        return UI.app({
            title: resolvedTitle,
            subtitle: resolvedDescription,
            children: [definition, section],
        });
    }

    function buildDocsOverview() {
        return docsPage({
            title: 'Shared UI Library',
            description: 'What the framework owns, how consumers should adopt it, and the shortest path to a canonical surface.',
            cards: [
                UI.card({
                    title: 'What UI Owns',
                    icon: 'ti ti-rocket',
                    children: [
                        bulletList([
                            'The runtime owns shell structure, theme loading, shared components, and contract rendering.',
                            'Consumers should start with ui.js plus sitemap.json instead of cloning shell HTML or CSS.',
                            'When the framework can express the surface, the consumer should stay mostly custom-code free.',
                        ]),
                    ],
                }),
                UI.card({
                    title: 'Adoption Ladder',
                    icon: 'ti ti-stairs-up',
                    style: {
                        borderLeft: '4px solid var(--color-danger)',
                    },
                    children: [
                        bulletList([
                            '1-line include for theme + runtime.',
                            'sitemap.json for tabs, navigation, and shell ownership.',
                            'preset, component, or componentSource before raw HTML.',
                            'render.html plus JSON contracts when the page should be remote-renderable.',
                            'htmlSource only as a narrow escape hatch.',
                        ]),
                    ],
                }),
                UI.card({
                    title: 'This Site Dogfoods UI',
                    icon: 'ti ti-vector',
                    children: [
                        bulletList([
                            'The shell you are looking at is driven by sitemap.json.',
                            'Docs and token specimens are mounted from shared presets in js/presets.js.',
                            'Library and pattern pages are mounted from shared presets in js/canonical-presets.js.',
                            'Visual Builder is the legacy HTML maintenance hatch, not the canonical starting point.',
                        ]),
                        codeBlock(`sitemap.json               -> top-level IA and tab structure
js/presets.js             -> docs, themes, token specimens
js/canonical-presets.js   -> component and pattern demos
js/components.js          -> UI.button / UI.card / UI.table / ...
js/contract.js            -> validated JSON page contracts`),
                    ],
                }),
                UI.card({
                    title: 'Go Here Next',
                    icon: 'ti ti-package',
                    children: [
                        linkList([
                            { label: 'Library: Buttons', href: '/#builder/buttons', target: '_self' },
                            { label: 'Patterns: Full Pages', href: '/#canonical/full-page', target: '_self' },
                            { label: 'Patterns: Contract Lab', href: '/#canonical/contract-lab', target: '_self' },
                            { label: 'Typography & Full Reference', href: '/active/typography.html' },
                            { label: 'Consumer Guidance', href: '/llm-docs.md' },
                        ]),
                    ],
                }),
            ],
        });
    }

    function buildDocsDogfood() {
        return docsPage({
            title: 'Dogfooding',
            description: 'How ui.mullmania.com uses its own runtime, presets, contracts, and legacy escape hatches.',
            cards: [
                UI.card({
                    title: 'Runtime Chain',
                    icon: 'ti ti-route',
                    children: [
                        bulletList([
                            'index.html loads ui.js and hands routing to the shared shell.',
                            'sitemap.json decides the tabs, labels, sidebar items, and mounted preset targets.',
                            'Preset pages are rendered through UI.app, UI.section, UI.card, UI.table, and other shared helpers.',
                            'Contract pages flow through UI.contract and the hosted render.html surface.',
                        ]),
                    ],
                }),
                UI.card({
                    title: 'What Generates What',
                    icon: 'ti ti-file-code',
                    children: [
                        codeBlock(`sitemap.json             -> shell IA, tab order, sidebar items
js/presets.js           -> docs pages, theme pages, token specimens
js/canonical-presets.js -> library demos and higher-level page patterns
js/components.js        -> shared component factories and UI.mount helpers
js/contract.js          -> schema validation + JSON contract rendering`),
                    ],
                }),
                UI.card({
                    title: 'Consumer Path',
                    icon: 'ti ti-layers-linked',
                    children: [
                        bulletList([
                            'Use the same runtime include the site uses.',
                            'Move structure into sitemap.json as early as possible.',
                            'Promote repeated bespoke HTML into presets or shared components instead of letting it fork locally.',
                            'Reserve raw HTML for embeds, one-off legacy fragments, or truly missing framework coverage.',
                        ]),
                    ],
                }),
                UI.card({
                    title: 'Where HTML Still Exists',
                    icon: 'ti ti-alert-triangle',
                    children: [
                        bulletList([
                            'Visual Builder still mounts from htmlSource and should be treated as the exception path.',
                            'The goal is not to ban HTML entirely. The goal is to make HTML the last resort instead of the default authoring model.',
                            'If a consumer needs custom markup repeatedly, that is a signal to upstream a new library primitive or pattern.',
                        ]),
                    ],
                }),
            ],
        });
    }

    function buildDocsInclude() {
        return docsPage({
            title: 'Runtime Include',
            description: 'Default include, pinned theme usage, CSS-only aliases, and Swagger skin loading.',
            cards: [
                UI.card({
                    title: 'Default Include',
                    icon: 'ti ti-rocket',
                    children: [
                        codeBlock('<script src="https://ui.mullmania.com/ui.js"></script>'),
                        {
                            tag: 'p',
                            className: 'text-secondary mt-sm',
                            text: 'This follows the published global default and loads the shared runtime in one line.',
                        },
                    ],
                }),
                UI.card({
                    title: 'Pinned Theme Include',
                    icon: 'ti ti-palette',
                    children: [
                        codeBlock('<script src="https://ui.mullmania.com/ui.js" data-ui-theme="ocean"></script>'),
                        {
                            tag: 'p',
                            className: 'text-secondary mt-sm',
                            text: 'Use a concrete theme id when the consumer must stay fixed even if the published default changes later.',
                        },
                    ],
                }),
                UI.card({
                    title: 'Stylesheet Paths',
                    icon: 'ti ti-file-type-css',
                    children: [
                        codeBlock('<link rel="stylesheet" href="https://ui.mullmania.com/active/style.css">'),
                        codeBlock('<link rel="stylesheet" href="https://ui.mullmania.com/ocean/style.css">'),
                    ],
                }),
                UI.card({
                    title: 'Swagger Skin',
                    icon: 'ti ti-api',
                    children: [
                        codeBlock('<script src="https://ui.mullmania.com/ui.js" data-ui-theme="active" data-ui-swagger="obliterated"></script>'),
                        bulletList([
                            'Supported Swagger skins: classic, mono, obliterated.',
                            'Keep the theme and Swagger skin in the same one-line include when the page already hosts Swagger UI.',
                        ]),
                    ],
                }),
            ],
        });
    }

    function buildDocsThemes() {
        return docsPage({
            title: 'Theme Routing',
            description: 'How the published default alias works, how pinning works, and what preview does not do.',
            cards: [
                UI.card({
                    title: 'Published Default',
                    icon: 'ti ti-world',
                    children: [
                        bulletList([
                            'Bare ui.js, data-ui-theme="active", and /active/* all follow the published default alias.',
                            'The alias is public state, not a browser-local preference.',
                            'Unpinned consumers move with the published default. Explicit theme ids do not.',
                        ]),
                    ],
                }),
                UI.card({
                    title: 'Public Manifest',
                    icon: 'ti ti-file-info',
                    children: [
                        codeBlock('GET https://ui.mullmania.com/active-theme.json'),
                        {
                            tag: 'p',
                            className: 'text-secondary mt-sm',
                            text: 'Use the manifest when you need to know which concrete theme the active alias currently resolves to.',
                        },
                    ],
                }),
                UI.card({
                    title: 'Preview vs Publish',
                    icon: 'ti ti-switch-horizontal',
                    children: [
                        bulletList([
                            'UI.setTheme() previews locally in the current document only.',
                            'Publishing a global default changes what /active/* serves after reload.',
                            'Do not treat preview state as a deploy or a persistent global setting.',
                        ]),
                    ],
                }),
                UI.card({
                    title: 'Pinned Examples',
                    icon: 'ti ti-link',
                    children: [
                        codeBlock('<script src="https://ui.mullmania.com/ui.js" data-ui-theme="walmart"></script>'),
                        codeBlock('<link rel="stylesheet" href="https://ui.mullmania.com/walmart/style.css">'),
                    ],
                }),
            ],
        });
    }

    function buildDocsThemeBuilder() {
        return docsPage({
            title: 'Theme Recipe',
            description: 'Dogfood walkthrough of the real theme knobs, where the current catalog reduces cleanly, and where it still needs stronger composition boundaries before a true builder can own it.',
            actions: [
                {
                    label: 'Open Tutorial Reel',
                    variant: 'primary',
                    icon: 'ti ti-movie',
                    action: {
                        type: 'open',
                        href: '/docs/theme-demo/demo.mp4',
                    },
                },
                {
                    label: 'Open Tutorial Watch',
                    variant: 'secondary',
                    icon: 'ti ti-player-play',
                    action: {
                        type: 'open',
                        href: '/render.html?source=/contracts/fixtures/theme-recipe-watch.json',
                    },
                },
                {
                    label: 'Open Full Reference',
                    variant: 'secondary',
                    icon: 'ti ti-external-link',
                    action: {
                        type: 'open',
                        href: '/active/typography.html',
                    },
                },
            ],
            cards: [
                UI.card({
                    title: 'What Actually Changes',
                    icon: 'ti ti-adjustments-horizontal',
                    children: [
                        bulletList([
                            'Palette: primary, secondary, background, and text token families.',
                            'Typography roles: body, UI, display, mono, and brand lockup.',
                            'Shape: radius, border weight, and edge softness.',
                            'Density: spacing rhythm, padding, and size scale.',
                            'Surface chrome: flat, carded, border-first, or chromeless.',
                            'Effects: shadow, glow, inset treatment, and hover intensity.',
                            'Motion: default, restrained, or fully disabled.',
                            'Shell bias: standard core shell versus a deeper local override.',
                        ]),
                    ],
                }),
                UI.card({
                    title: 'Builder Fit',
                    icon: 'ti ti-wand',
                    children: [
                        UI.table({
                            columns: ['lane', 'themes', 'notes'],
                            rows: [
                                {
                                    lane: 'Direct recipe',
                                    themes: 'pumpkin, ocean, sunset',
                                    notes: 'Mostly palette, radius, and shell-tint choices.',
                                },
                                {
                                    lane: 'Advanced recipe',
                                    themes: 'cyberpink, editorial, mockup',
                                    notes: 'Need stronger type, motion, or chrome presets beyond color-only swapping.',
                                },
                                {
                                    lane: 'Fork cleanup first',
                                    themes: 'walmart',
                                    notes: 'Still carries its own shell behavior and should be normalized before a builder owns it.',
                                },
                            ],
                        }),
                        {
                            tag: 'p',
                            className: 'text-secondary mt-sm',
                            text: 'Five knobs can recreate the clean token-first themes. The full shipped set needs closer to eight recipe axes if you want honest parity.',
                        },
                    ],
                }),
                UI.card({
                    title: 'Remake Matrix',
                    icon: 'ti ti-layout-grid',
                    children: [
                        UI.table({
                            columns: ['theme', 'recipe', 'builder fit', 'notes'],
                            rows: [
                                {
                                    theme: 'Ocean',
                                    recipe: 'palette + cool surfaces',
                                    'builder fit': 'direct',
                                    notes: 'Token swap with mild shell tint.',
                                },
                                {
                                    theme: 'Pumpkin',
                                    recipe: 'palette + radius',
                                    'builder fit': 'direct',
                                    notes: 'Friendly radius change layered onto the core system.',
                                },
                                {
                                    theme: 'Sunset',
                                    recipe: 'warm palette + tone',
                                    'builder fit': 'direct',
                                    notes: 'Still mostly semantic-token work.',
                                },
                                {
                                    theme: 'Cyberpink',
                                    recipe: 'dark palette + neon effects + display font',
                                    'builder fit': 'advanced',
                                    notes: 'Needs stronger effects and type presets than the calmer themes.',
                                },
                                {
                                    theme: 'Editorial',
                                    recipe: 'type-role split + calmer chrome',
                                    'builder fit': 'advanced',
                                    notes: 'Driven by display/body/mono role separation as much as color.',
                                },
                                {
                                    theme: 'Mockup',
                                    recipe: 'sketch font + border-first + no motion',
                                    'builder fit': 'advanced',
                                    notes: 'Really a mode family, not just a palette.',
                                },
                                {
                                    theme: 'Walmart',
                                    recipe: 'brand fork',
                                    'builder fit': 'cleanup first',
                                    notes: 'Normalize shell imports before promising builder parity.',
                                },
                            ],
                        }),
                    ],
                }),
                UI.card({
                    title: 'Start From These Files',
                    icon: 'ti ti-file-code',
                    children: [
                        codeBlock([
                            'core/colors.css',
                            'core/layout.css',
                            'pumpkin/colors.css',
                            'pumpkin/layout.css',
                            'js/presets.js',
                            'docs/theme-demo/proof-plan.json',
                        ].join('\n')),
                        {
                            tag: 'p',
                            className: 'text-secondary mt-sm',
                            text: 'If the goal is a new clean theme, start from pumpkin or ocean. If the goal is builder parity, use this page, the specimen routes, and the tutorial reel as the composition contract.',
                        },
                    ],
                }),
                UI.card({
                    title: 'Theme Recipe Reel',
                    icon: 'ti ti-movie',
                    children: [
                        bulletList([
                            'Opens with the recipe page instead of a marketing card.',
                            'Walks the shared color, type, spacing, and effects specimen routes.',
                            'Ends by mapping the shipped looks back onto the recipe and proving the result in preview surfaces.',
                        ]),
                    ],
                    actions: [
                        {
                            label: 'Open Reel',
                            icon: 'ti ti-player-play',
                            action: {
                                type: 'open',
                                href: '/docs/theme-demo/demo.mp4',
                            },
                        },
                        {
                            label: 'Open Watch Page',
                            icon: 'ti ti-layout-list',
                            action: {
                                type: 'open',
                                href: '/render.html?source=/contracts/fixtures/theme-recipe-watch.json',
                            },
                        },
                    ],
                }),
                UI.card({
                    title: 'Routes To Use',
                    icon: 'ti ti-route',
                    children: [
                        linkList([
                            { label: 'Recipe page', href: '/index.html#docs/theme-builder', target: '_self' },
                            { label: 'Theme routing docs', href: '/index.html#docs/themes', target: '_self' },
                            { label: 'Color specimens', href: '/index.html#builder/colors', target: '_self' },
                            { label: 'Type specimens', href: '/index.html#builder/typography', target: '_self' },
                            { label: 'Effects specimens', href: '/index.html#builder/effects', target: '_self' },
                            { label: 'Editorial specimen', href: '/index.html#themes/editorial', target: '_self' },
                            { label: 'Mockup specimen', href: '/index.html#themes/mockup', target: '_self' },
                            { label: 'Preview surface', href: '/preview.html?theme=mockup&mode=dark', target: '_self' },
                            { label: 'Render surface', href: '/render.html?preset=preview.theme&theme=ocean&mode=dark', target: '_self' },
                        ]),
                    ],
                }),
            ],
        });
    }

    function buildThemeBuilderPreset() {
        if (window.UI?.themeBuilder?.create) {
            return window.UI.themeBuilder.create();
        }

        return docsPage({
            title: 'Theme Builder',
            description: 'The theme builder runtime did not load.',
            cards: [
                UI.alert({
                    tone: 'warning',
                    title: 'Builder unavailable',
                    message: 'Reload the page and check that js/theme-builder.js is available.',
                }),
            ],
        });
    }

    function buildDocsShell() {
        return docsPage({
            title: 'Shell Contract',
            description: 'Document vs workspace, scroll ownership, and the detail-shell rules the runtime expects consumers to follow.',
            cards: [
                UI.card({
                    title: 'Document Shell',
                    icon: 'ti ti-file-text',
                    children: [
                        bulletList([
                            'Use header + content-container + page-container for one-lane docs and simple pages.',
                            'Do not wrap a document page in the app-style .container shell.',
                            'The page content should read top-to-bottom without a sidebar controlling it.',
                        ]),
                    ],
                }),
                UI.card({
                    title: 'Workspace Shell',
                    icon: 'ti ti-layout-sidebar-right',
                    children: [
                        bulletList([
                            'Use workspace for search tools, browser-style apps, endpoint explorers, and list/detail surfaces.',
                            'Top-level tabs own distinct modes. The sidebar owns item navigation inside a mode.',
                            'Keep the right-hand detail surface disciplined instead of stacking every concern into one page.',
                        ]),
                    ],
                }),
                UI.card({
                    title: 'Scroll Ownership',
                    icon: 'ti ti-arrows-vertical',
                    children: [
                        bulletList([
                            'One region should own vertical scroll for each active lane.',
                            'For document shells, #content-container is the scroll owner.',
                            'For detail shells, the sticky header stays put and the body row takes scroll.',
                        ]),
                    ],
                }),
                UI.card({
                    title: 'Detail Shell',
                    icon: 'ti ti-layout-navbar',
                    children: [
                        bulletList([
                            'Use the framework detail-header + detail-body pattern instead of inventing a second fake masthead.',
                            'The right pane can carry a sticky item header when the detail body is long.',
                            'If the detail page grows beyond one or two concerns, split it into sidebar items or nested tabs.',
                        ]),
                    ],
                }),
            ],
        });
    }

    function buildDocsAuthoring() {
        return docsPage({
            title: 'Structured Authoring',
            description: 'Preferred build order, supported sitemap shape, and where raw HTML is still allowed.',
            cards: [
                UI.card({
                    title: 'Build Order',
                    icon: 'ti ti-lock',
                    style: {
                        borderLeft: '4px solid var(--color-danger)',
                    },
                    children: [
                        bulletList([
                            'Start with sitemap.json structure.',
                            'Then use preset, component, or componentSource.',
                            'Use htmlSource only when the structured runtime cannot express the surface cleanly.',
                        ]),
                    ],
                }),
                UI.card({
                    title: 'Workspace Tab Example',
                    icon: 'ti ti-code',
                    children: [
                        codeBlock(`{
  "id": "docs",
  "label": "Documentation",
  "layout": "workspace",
  "sections": [
    {
      "type": "list",
      "inlineData": [
        { "id": "overview", "name": "Overview", "preset": "docs.overview" }
      ]
    }
  ]
}`),
                    ],
                }),
                UI.card({
                    title: 'Preferred Inputs',
                    icon: 'ti ti-list-check',
                    children: [
                        bulletList([
                            'preset for shipped framework examples and canonical surfaces.',
                            'component for inline declarative structures.',
                            'componentSource for JSON-driven components that should stay editable outside the shell file.',
                            'Library and pattern pages now expose an Adoption Kit with copyable sitemap, JS mount, and render snippets.',
                        ]),
                    ],
                }),
                UI.card({
                    title: 'HTML Escape Hatch',
                    icon: 'ti ti-alert-triangle',
                    children: [
                        bulletList([
                            'htmlSource is still supported for legacy fragments and unusual embeds.',
                            'Do not use htmlSource to fork the shared shell or recreate generic framework primitives by hand.',
                            'If raw HTML is genuinely required, keep the exception narrow and document why.',
                        ]),
                    ],
                }),
            ],
        });
    }

    function buildDocsReference() {
        return docsPage({
            title: 'Reference Links',
            description: 'Canonical endpoints, render host, manifest paths, and the main consumer-facing docs.',
            cards: [
                UI.card({
                    title: 'Canonical Endpoints',
                    icon: 'ti ti-link',
                    children: [
                        linkList([
                            { label: 'ui.js', href: 'https://ui.mullmania.com/ui.js' },
                            { label: 'active-theme.json', href: 'https://ui.mullmania.com/active-theme.json' },
                            { label: 'active/style.css', href: 'https://ui.mullmania.com/active/style.css' },
                            { label: 'render.html', href: 'https://ui.mullmania.com/render.html' },
                            { label: 'Typography Reference', href: 'https://ui.mullmania.com/active/typography.html' },
                        ]),
                    ],
                }),
                UI.card({
                    title: 'Consumer Docs',
                    icon: 'ti ti-bookmarks',
                    children: [
                        linkList([
                            { label: 'Consumer Guidance', href: '/llm-docs.md' },
                            { label: 'llms.txt', href: '/llms.txt' },
                        ]),
                    ],
                }),
                UI.card({
                    title: 'Available Pieces',
                    icon: 'ti ti-building',
                    children: [
                        bulletList([
                            'Buttons, badges, alerts, tables, charts, previews, toasts, and modals.',
                            'Theme specimen pages and pinned-vs-published theme routing.',
                            'Structured shells for documents, workspaces, nested tabs, and detail panes.',
                        ]),
                    ],
                }),
                UI.card({
                    title: 'Renderer',
                    icon: 'ti ti-browser',
                    children: [
                        codeBlock('https://ui.mullmania.com/render.html'),
                        {
                            tag: 'p',
                            className: 'text-secondary mt-sm',
                            text: 'Use the hosted renderer for validated remote contracts instead of baking a one-off local shell.',
                        },
                    ],
                }),
            ],
        });
    }

    function buildThemeSpecimen(themeId) {
        const theme = THEMES[themeId] || THEMES[DEFAULT_THEME_ID];
        const publishedManifest = getPublishedThemeManifest();
        const publishedTheme = THEMES[publishedManifest.themeId] || THEMES[DEFAULT_THEME_ID];
        const previewThemeId = resolveShellThemeId(theme.id);
        const activeTheme = isShellThemeActive(theme.id);
        const publishedThemeSelected = isPublishedTheme(theme.id);
        const openReferenceHref = `/active/typography.html?theme=${previewThemeId}`;
        const actions = [
            {
                label: activeTheme ? 'Previewing In Shell' : 'Preview In Shell',
                variant: activeTheme ? 'secondary' : 'primary',
                icon: activeTheme ? 'ti ti-check' : 'ti ti-palette',
                dataset: {
                    themeSpecimenRole: 'preview-theme',
                },
                attrs: activeTheme ? { disabled: true, 'aria-disabled': 'true' } : {},
                onClick: activeTheme ? undefined : () => previewTheme(theme),
            },
            {
                label: publishedThemeSelected ? 'Published Default' : 'Publish As Global Default',
                variant: publishedThemeSelected ? 'secondary' : 'primary',
                icon: publishedThemeSelected ? 'ti ti-world-check' : 'ti ti-world-upload',
                dataset: {
                    themeSpecimenRole: 'publish-theme',
                },
                attrs: publishedThemeSelected ? { disabled: true, 'aria-disabled': 'true' } : {},
                onClick: publishedThemeSelected ? undefined : () => showPublishThemeModal(theme),
            },
        ];

        actions.push({
            label: 'Open Full Reference',
            variant: 'secondary',
            icon: 'ti ti-external-link',
            action: {
                type: 'open',
                href: openReferenceHref,
            },
        });

        const content = {
            tag: 'div',
            className: 'theme-specimen-grid',
            children: [
                UI.card({
                    title: 'Live Preview',
                    icon: 'ti ti-eye',
                    dataset: {
                        themeSpecimenCard: 'preview',
                    },
                    style: {
                        gridColumn: '1 / -1',
                    },
                    children: [
                        {
                            tag: 'iframe',
                            className: 'theme-specimen-preview-frame',
                            attrs: {
                                src: `/preview.html?theme=${previewThemeId}`,
                                title: `${theme.name} component preview`,
                            },
                            dataset: {
                                themeSpecimenRole: 'preview-frame',
                            },
                        },
                    ],
                }),
                UI.card({
                    title: 'Published Default',
                    icon: 'ti ti-world',
                    children: [
                        {
                            tag: 'div',
                            className: 'row-wrap gap-sm mb-md',
                            children: [
                                UI.status({
                                    label: publishedThemeSelected ? 'Published Here' : `Published: ${publishedTheme.name}`,
                                    tone: publishedThemeSelected ? 'success' : 'info',
                                }),
                                UI.status({
                                    label: activeTheme ? 'Previewing Here' : 'Preview Is Local Only',
                                    tone: activeTheme ? 'warning' : 'info',
                                }),
                            ],
                        },
                        {
                            tag: 'p',
                            className: 'text-secondary mb-md',
                            text: publishedManifest.publishedAt
                                ? `Bare ui.js and /active/* currently resolve to ${publishedTheme.name}. Published ${publishedManifest.publishedAt}${publishedManifest.publishedBy ? ` by ${publishedManifest.publishedBy}` : ''}.`
                                : `Bare ui.js and /active/* currently resolve to ${publishedTheme.name}.`,
                        },
                        themeCodeBlock(themeRuntimeSnippet('active'), 'active-runtime-code'),
                        themeCodeBlock(themeCssSnippet('active'), 'active-css-code'),
                    ],
                }),
                UI.card({
                    title: 'Pinned Runtime Include',
                    icon: 'ti ti-code',
                    children: [
                        themeCodeBlock(themeRuntimeSnippet(previewThemeId), 'runtime-code'),
                        {
                            tag: 'p',
                            className: 'text-muted mt-sm',
                            text: 'This pins the theme explicitly, even if the global default changes later.',
                        },
                    ],
                    actions: [
                        {
                            label: 'Copy Include',
                            icon: 'ti ti-copy',
                            action: {
                                type: 'copy',
                                text: themeRuntimeSnippet(previewThemeId),
                                successMessage: `${theme.name} include copied.`,
                            },
                        },
                    ],
                }),
                UI.card({
                    title: 'Pinned Stylesheet',
                    icon: 'ti ti-link',
                    children: [
                        themeCodeBlock(themeCssSnippet(previewThemeId), 'css-code'),
                        {
                            tag: 'p',
                            className: 'text-muted mt-sm',
                            text: 'This stylesheet stays pinned to the selected theme and does not follow the global default alias.',
                        },
                    ],
                    actions: [
                        {
                            label: 'Copy CSS URL',
                            icon: 'ti ti-copy',
                            action: {
                                type: 'copy',
                                text: themeCssSnippet(previewThemeId),
                                successMessage: `${theme.name} stylesheet snippet copied.`,
                            },
                        },
                    ],
                }),
            ],
        };

        content.__uiShellPage = {
            title: theme.name,
            description: theme.description,
            actions,
            themeId: previewThemeId,
        };

        return content;
    }

    function buildColorsSpecimen() {
        return UI.app({
            title: 'Color System',
            subtitle: 'Semantic color roles and component examples.',
            children: [
                UI.section({
                    title: 'Semantic Tokens',
                    children: [
                        UI.grid({
                            columns: 3,
                            children: [
                                tokenSwatch('Primary', '--color-primary', 'Main action and emphasis'),
                                tokenSwatch('Secondary', '--color-secondary', 'Supporting emphasis'),
                                tokenSwatch('Success', '--color-success', 'Positive state and completion'),
                                tokenSwatch('Danger', '--color-danger', 'Blocking or destructive state'),
                                tokenSwatch('Background Primary', '--bg-primary', 'Default surface'),
                                tokenSwatch('Background Secondary', '--bg-secondary', 'Inset or supporting surface'),
                            ],
                        }),
                    ],
                }),
                UI.section({
                    title: 'Applied Through Components',
                    children: [
                        UI.grid({
                            columns: 2,
                            children: [
                                UI.card({
                                    title: 'Buttons And Badges',
                                    children: [
                                        {
                                            tag: 'div',
                                            className: 'grid-row gap-sm mb-md',
                                            children: [
                                                UI.button({ label: 'Primary', variant: 'primary' }),
                                                UI.button({ label: 'Secondary', variant: 'secondary' }),
                                                UI.button({ label: 'Danger', variant: 'danger' }),
                                            ],
                                        },
                                        {
                                            tag: 'div',
                                            className: 'grid-row gap-sm',
                                            children: [
                                                UI.status({ label: 'Healthy', tone: 'success' }),
                                                UI.status({ label: 'Review', tone: 'warning' }),
                                                UI.status({ label: 'Blocked', tone: 'error' }),
                                            ],
                                        },
                                    ],
                                }),
                                UI.card({
                                    title: 'Alerts',
                                    children: [
                                        UI.stack({
                                            gap: 'sm',
                                            children: [
                                                UI.alert({ tone: 'info', title: 'Info', message: 'Information message.' }),
                                                UI.alert({ tone: 'success', title: 'Success', message: 'Saved successfully.' }),
                                                UI.alert({ tone: 'warning', title: 'Warning', message: 'Needs review.' }),
                                            ],
                                        }),
                                    ],
                                }),
                            ],
                        }),
                    ],
                }),
            ],
        });
    }

    function buildTypographySpecimen() {
        return UI.app({
            title: 'Typography Specimen',
            subtitle: 'Type roles and hierarchy examples.',
            children: [
                UI.section({
                    title: 'Semantic Roles',
                    children: [
                        {
                            tag: 'div',
                            className: 'grid gap-md',
                            children: [
                                UI.text({ role: 'brand', text: 'MULLMANIA' }),
                                UI.text({ role: 'display', text: 'edited' }),
                                UI.text({ role: 'ui-title', text: 'Interface title' }),
                                UI.text({ role: 'body', text: 'Body copy for longer explanation.', className: 'text-secondary' }),
                                UI.text({ role: 'label', text: 'tabs / labels / diagnostics / tokens', className: 'text-muted' }),
                                { tag: 'code', text: 'type-brand / type-display / type-body / type-label' },
                            ],
                        },
                    ],
                }),
                UI.grid({
                    columns: 2,
                    children: [
                        UI.card({
                            title: 'Role Map',
                            children: [
                                bulletList([
                                    'Brand for lockups and identity.',
                                    'Display for page titles and emphasis.',
                                    'Body for longer explanation.',
                                    'Label for tabs, metadata, and diagnostics.',
                                ]),
                            ],
                        }),
                        UI.card({
                            title: 'Data Surface',
                            children: [
                                UI.table({
                                    columns: ['name', 'role', 'note'],
                                    rows: [
                                        { name: 'Brand', role: 'Identity', note: 'Reserved for branded moments and lockups.' },
                                        { name: 'Display', role: 'Emphasis', note: 'Used sparingly for page titles and hero accents.' },
                                        { name: 'Body', role: 'Explanation', note: 'Carries the actual message.' },
                                        { name: 'Label', role: 'Scanning', note: 'Reserved for tabs, tokens, and diagnostics.' },
                                    ],
                                }),
                            ],
                        }),
                    ],
                }),
            ],
        });
    }

    function buildSpacingSpecimen() {
        return UI.app({
            title: 'Spacing Specimen',
            subtitle: 'Spacing scale and sample blocks.',
            children: [
                UI.section({
                    title: 'Vertical Rhythm',
                    children: [
                        UI.stack({
                            gap: 'md',
                            children: [
                                spacingBlock('space-xs', 'Tight inline support spacing.', 'var(--space-xs)'),
                                spacingBlock('space-sm', 'Compact UI grouping.', 'var(--space-sm)'),
                                spacingBlock('space-md', 'Default card and form rhythm.', 'var(--space-md)'),
                                spacingBlock('space-lg', 'Section-level breathing room.', 'var(--space-lg)'),
                                spacingBlock('space-xl', 'Major separation between content bands.', 'var(--space-xl)'),
                            ],
                        }),
                    ],
                }),
                UI.card({
                    title: 'Notes',
                    children: [
                        bulletList([
                            'Stay on the shared spacing scale.',
                            'Tighter for compact UI, looser for section breaks.',
                        ]),
                    ],
                }),
            ],
        });
    }

    function spacingBlock(label, description, paddingValue) {
        return {
            tag: 'div',
            style: {
                padding: paddingValue,
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-color)',
                background: 'var(--bg-secondary)',
            },
            children: [
                {
                    tag: 'strong',
                    text: label,
                },
                {
                    tag: 'div',
                    className: 'text-muted mt-sm',
                    text: description,
                },
            ],
        };
    }

    function buildEffectsSpecimen() {
        return UI.app({
            title: 'Effects And Interaction Specimen',
            subtitle: 'Shadows, radius, toasts, modals, and chart examples.',
            children: [
                UI.grid({
                    columns: 2,
                    children: [
                        UI.card({
                            title: 'Surface Depth',
                            children: [
                                {
                                    tag: 'div',
                                    className: 'grid gap-md',
                                    children: [
                                        effectSurface('Subtle shadow', 'var(--shadow-sm)', 'var(--radius-sm)'),
                                        effectSurface('Default shadow', 'var(--shadow-md)', 'var(--radius-md)'),
                                        effectSurface('Large shadow', 'var(--shadow-lg)', 'var(--radius-lg)'),
                                    ],
                                },
                            ],
                        }),
                        UI.card({
                            title: 'Actions',
                            children: [
                                {
                                    tag: 'div',
                                    className: 'grid-row gap-sm',
                                    children: [
                                        UI.button({
                                            label: 'Show Toast',
                                            variant: 'secondary',
                                            icon: 'ti ti-bell',
                                            action: {
                                                type: 'toast',
                                                toastType: 'success',
                                                message: 'Saved.',
                                            },
                                        }),
                                        UI.button({
                                            label: 'Open Modal',
                                            variant: 'primary',
                                            icon: 'ti ti-layout',
                                            action: {
                                                type: 'modal',
                                                title: 'Modal Example',
                                                content: '<p style="margin:0;">Shared modal example.</p>',
                                            },
                                        }),
                                    ],
                                },
                            ],
                        }),
                        UI.card({
                            title: 'Chart',
                            children: [
                                UI.chart({
                                    variant: 'bar',
                                    series: [7, 11, 9, 14],
                                    labels: ['Q1', 'Q2', 'Q3', 'Q4'],
                                    caption: 'Example chart.',
                                }),
                            ],
                        }),
                    ],
                }),
            ],
        });
    }

    function effectSurface(label, shadowValue, radiusValue) {
        return {
            tag: 'div',
            style: {
                padding: 'var(--space-md)',
                borderRadius: radiusValue,
                background: 'var(--bg-primary)',
                border: '1px solid var(--border-color)',
                boxShadow: shadowValue,
            },
            children: [
                {
                    tag: 'strong',
                    text: label,
                },
                {
                    tag: 'div',
                    className: 'text-muted mt-sm',
                    text: `radius: ${radiusValue} | shadow: ${shadowValue}`,
                },
            ],
        };
    }

    function buildTypographyReference(options = {}) {
        const themeId = resolveShellThemeId(options.themeId || getPublishedThemeId());
        const theme = THEMES[themeId] || THEMES[DEFAULT_THEME_ID];

        return UI.app({
            title: `${theme.name} Typography And Shell Reference`,
            subtitle: 'Header, tabs, type roles, and sample components.',
            actions: [
                {
                    label: 'Back To Themes',
                    variant: 'secondary',
                    icon: 'ti ti-arrow-left',
                    action: {
                        type: 'open',
                        href: '/#themes',
                        target: '_self',
                    },
                },
            ],
            children: [
                UI.grid({
                    columns: 2,
                    children: [
                        UI.card({
                            title: 'Install',
                            icon: 'ti ti-rocket',
                            children: [
                                codeBlock(themeRuntimeSnippet(theme.id)),
                            ],
                        }),
                        UI.card({
                            title: 'Theme',
                            icon: 'ti ti-palette',
                            children: [
                                {
                                    tag: 'div',
                                    className: 'grid-row gap-sm mb-sm',
                                    children: [
                                        UI.status({ label: theme.name, tone: 'info' }),
                                        UI.status({ label: 'Reference', tone: 'success' }),
                                    ],
                                },
                                {
                                    tag: 'p',
                                    className: 'text-secondary',
                                    text: theme.usage,
                                },
                            ],
                        }),
                    ],
                }),
                UI.section({
                    title: 'Shell Default',
                    children: [
                        UI.grid({
                            columns: 2,
                            children: [
                                UI.card({
                                    title: 'Good For',
                                    children: [
                                        bulletList([
                                            'Search tools and endpoint browsers',
                                            'Admin and operator workspaces',
                                            'List / detail explorers',
                                            'Any surface with 2 or more distinct views',
                                        ]),
                                    ],
                                }),
                                UI.card({
                                    title: 'Shell Patterns',
                                    children: [
                                        UI.table({
                                            columns: ['surface', 'shell'],
                                            rows: [
                                                { surface: 'Tool with multiple modes', shell: 'Header + tabs + content' },
                                                { surface: 'Browser / admin / explorer', shell: 'Header + tabs + workspace' },
                                                { surface: 'Short memo or one-shot page', shell: 'Document shell' },
                                            ],
                                        }),
                                    ],
                                }),
                            ],
                        }),
                    ],
                }),
                UI.section({
                    title: 'Type And Hierarchy',
                    children: [
                        {
                            tag: 'div',
                            className: 'grid gap-md',
                            children: [
                                UI.text({ role: 'brand', text: 'MULLMANIA' }),
                                UI.text({ role: 'display', text: 'edited' }),
                                UI.text({ role: 'ui-title', text: 'Interface title' }),
                                UI.text({ role: 'body', text: 'Body copy for longer explanation.', className: 'text-secondary' }),
                                UI.text({ role: 'label', text: 'brand / display / ui / metadata', className: 'text-muted' }),
                                { tag: 'code', text: 'type-brand / type-display / type-body / type-label' },
                            ],
                        },
                    ],
                }),
                UI.grid({
                    columns: 2,
                    children: [
                        UI.card({
                            title: 'Type Role Split',
                            children: [
                                UI.table({
                                    columns: ['surface', 'role'],
                                    rows: [
                                        { surface: 'Header brand', role: 'type-brand' },
                                        { surface: 'Page or view title', role: 'type-display / type-ui-title' },
                                        { surface: 'Body explanation', role: 'type-body' },
                                        { surface: 'Tabs, sidebar labels, diagnostics', role: 'type-label / mono' },
                                    ],
                                }),
                            ],
                        }),
                        UI.card({
                            title: 'Reading Order',
                            children: [
                                bulletList([
                                    'Header bars should be visible on most tools.',
                                    'Tabs should separate major modes.',
                                    'Sidebar items should behave like navigation.',
                                    'Use one clear title and one clear body style per section.',
                                ]),
                            ],
                        }),
                    ],
                }),
                UI.grid({
                    columns: 2,
                    children: [
                        UI.card({
                            title: 'Semantic Components',
                            children: [
                                {
                                    tag: 'div',
                                    className: 'grid-row gap-sm mb-md',
                                    children: [
                                        UI.button({ label: 'Primary', variant: 'primary' }),
                                        UI.button({ label: 'Secondary', variant: 'secondary' }),
                                    ],
                                },
                                {
                                    tag: 'div',
                                    className: 'grid-row gap-sm mb-md',
                                    children: [
                                        UI.status({ label: 'Healthy', tone: 'success' }),
                                        UI.status({ label: 'Review', tone: 'warning' }),
                                        UI.status({ label: 'Blocked', tone: 'error' }),
                                    ],
                                },
                                UI.alert({
                                    tone: 'info',
                                    title: 'Info',
                                    message: 'Primitive examples.',
                                }),
                            ],
                        }),
                        UI.card({
                            title: 'Data Surfaces',
                            children: [
                                UI.table({
                                    columns: ['surface', 'role'],
                                    rows: [
                                        { surface: 'Table', role: 'Structured comparison' },
                                        { surface: 'Chart', role: 'Pattern over time' },
                                        { surface: 'Badge', role: 'Compact semantic state' },
                                    ],
                                }),
                            ],
                        }),
                        UI.chart({
                            title: 'Chart Primitive',
                            icon: 'ti ti-chart-bar',
                            variant: 'line',
                            series: [6, 10, 9, 14, 18],
                            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
                            caption: 'Example chart.',
                        }),
                        UI.card({
                            title: 'Color Roles',
                            children: [
                                {
                                    tag: 'div',
                                    className: 'grid-2 gap-md',
                                    children: [
                                        tokenSwatch('Primary', '--color-primary', 'Main action and emphasis'),
                                        tokenSwatch('Secondary', '--color-secondary', 'Supporting emphasis'),
                                        tokenSwatch('Success', '--color-success', 'Positive state'),
                                        tokenSwatch('Danger', '--color-danger', 'Blocking state'),
                                    ],
                                },
                            ],
                        }),
                    ],
                }),
            ],
        });
    }

    function buildThemePreviewPreset(options = {}) {
        return compactComponentPreview(options.themeId || getPublishedThemeId());
    }

    const presetBuilders = {
        'docs.overview': () => buildDocsOverview(),
        'docs.dogfood': () => buildDocsDogfood(),
        'docs.include': () => buildDocsInclude(),
        'docs.themes': () => buildDocsThemes(),
        'docs.theme-builder': () => buildDocsThemeBuilder(),
        'themes.builder': () => buildThemeBuilderPreset(),
        'docs.shell': () => buildDocsShell(),
        'docs.authoring': () => buildDocsAuthoring(),
        'docs.reference': () => buildDocsReference(),
        'specimens.colors': () => attachPresetAdoption(buildColorsSpecimen(), {
            presetName: 'specimens.colors',
            category: 'specimen',
            preferredTabs: ['builder'],
            title: 'Colors',
        }),
        'specimens.typography': () => attachPresetAdoption(buildTypographySpecimen(), {
            presetName: 'specimens.typography',
            category: 'specimen',
            preferredTabs: ['builder'],
            title: 'Typography',
        }),
        'specimens.spacing': () => attachPresetAdoption(buildSpacingSpecimen(), {
            presetName: 'specimens.spacing',
            category: 'specimen',
            preferredTabs: ['builder'],
            title: 'Spacing',
        }),
        'specimens.effects': () => attachPresetAdoption(buildEffectsSpecimen(), {
            presetName: 'specimens.effects',
            category: 'specimen',
            preferredTabs: ['builder'],
            title: 'Effects',
        }),
        'reference.typography': (options) => buildTypographyReference(options),
        'preview.theme': (options) => buildThemePreviewPreset(options),
    };

    Object.keys(THEMES).forEach((themeId) => {
        presetBuilders[`themes.${themeId}`] = () => buildThemeSpecimen(themeId);
    });

    function resolvePreset(name, options = {}) {
        const builder = presetBuilders[name];
        if (!builder) {
            throw new Error(`Unknown UI preset: ${name}`);
        }

        return builder(options);
    }

    function mountPreset(target, name, options = {}) {
        return UI.mount(target, resolvePreset(name, options));
    }

    function registerPreset(name, builder) {
        if (typeof name !== 'string' || !name.trim()) {
            throw new Error('Preset name must be a non-empty string.');
        }

        if (typeof builder !== 'function') {
            throw new Error(`Preset builder for ${name} must be a function.`);
        }

        presetBuilders[name] = builder;
        return UI.presets;
    }

    UI.presets = {
        themes: Object.values(THEMES),
        list: () => Object.keys(presetBuilders),
        resolve: resolvePreset,
        mount: mountPreset,
        register: registerPreset,
    };
    UI.demoDocs = {
        attachPresetAdoption,
    };
})(window);
