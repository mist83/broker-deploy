/**
 * UI Runtime Loader
 * @version 3.1.1
 * @description Loads shared styles, icons, libraries, and JS-first component helpers from ui.mullmania.com
 * @license MIT
 *
 * Default one-line include:
 * <script src="https://ui.mullmania.com/ui.js"></script>
 *
 * If you want to pin a specific theme in the same line:
 * <script src="https://ui.mullmania.com/ui.js" data-ui-theme="ocean"></script>
 *
 * If the page hosts Swagger UI and should also load the shared Swagger skin:
 * <script src="https://ui.mullmania.com/ui.js" data-ui-theme="active" data-ui-swagger="obliterated"></script>
 *
 * Explicit stylesheet pinning still works:
 * <link rel="stylesheet" href="https://ui.mullmania.com/ocean/style.css">
 * <script src="https://ui.mullmania.com/ui.js"></script>
 */

(function(window, document) {
    'use strict';

    const DEFAULT_THEME = 'active';
    const DEFAULT_MODE = 'light';
    const VALID_MODES = new Set(['light', 'dark']);
    const currentScriptElement = resolveCurrentScriptElement();
    const currentScriptUrl = resolveCurrentScriptUrl(currentScriptElement);
    const requestedTheme = resolveRequestedTheme(currentScriptElement, currentScriptUrl);
    const requestedMode = resolveRequestedMode(currentScriptElement, currentScriptUrl);
    const requestedSwaggerSkin = resolveRequestedSwaggerSkin(currentScriptElement, currentScriptUrl);
    const assetOrigin = currentScriptUrl.origin;
    const baseUrl = new URL('/js/', assetOrigin).href;
    const styleUrl = buildThemeStyleUrl(requestedTheme);
    const detailShellStyleUrl = buildDetailShellStyleUrl();
    const swaggerStyleUrl = buildSwaggerStyleUrl();
    const iconsUrl = 'https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/tabler-icons.min.css';
    const libraryDefinitions = [
        { file: 'modals.js', id: 'ui-modals-js' },
        { file: 'tabs.js', id: 'ui-tabs-js' },
        { file: 'toasts.js', id: 'ui-toasts-js' },
        { file: 'tables.js', id: 'ui-tables-js' },
        { file: 'cards.js', id: 'ui-cards-js' },
        { file: 'collapsible.js', id: 'ui-collapsible-js' },
        { file: 'components.js', id: 'ui-components-js' },
        { file: 'screensaver.js', id: 'ui-screensaver-js' },
        { file: 'theme-builder.js', id: 'ui-theme-builder-js' },
        { file: 'presets.js', id: 'ui-presets-js' },
        { file: 'canonical-presets.js', id: 'ui-canonical-presets-js' },
        { file: 'contract.js', id: 'ui-contract-js' },
    ];
    const TIMING = {
        MODAL_FADE: 200,
        TOAST_SLIDE: 300,
        TOAST_AUTO_DISMISS: 3000,
        TAB_TRANSITION: 150,
        SIDEBAR_COLLAPSE: 200,
        COMPONENT_INIT: 50,
        SCRIPT_EXECUTION: 100,
    };

    let readyResolve;
    let loadPromise = null;
    const readyPromise = new Promise((resolve) => {
        readyResolve = resolve;
    });

    const UI = window.UI || {};
    UI.version = '3.1.1';
    UI.assetVersion = null;
    UI.origin = assetOrigin;
    UI.theme = requestedTheme;
    UI.mode = requestedMode;
    UI.assetBase = baseUrl;
    UI.styleUrl = styleUrl;
    UI.detailShellStyleUrl = detailShellStyleUrl;
    UI.iconsUrl = iconsUrl;
    UI.swagger = {
        skin: requestedSwaggerSkin,
        styleUrl: swaggerStyleUrl,
    };
    UI.TIMING = TIMING;
    UI.__internal = UI.__internal || {};
    UI.shell = UI.shell || null;
    UI.ready = () => readyPromise;
    UI.onReady = (callback) => readyPromise.then(callback);
    UI.load = loadAll;
    UI.setTheme = setTheme;
    UI.setMode = setMode;
    UI.setSwaggerSkin = setSwaggerSkin;
    UI.createShell = createShell;
    UI.getShell = () => UI.currentShell || null;
    UI.libraries = libraryDefinitions.map((library) => library.id);
    UI.events = {
        ready: 'ui:ready',
        readyLegacy: 'ui-ready',
        viewChanged: 'ui:view-changed',
        themeChanged: 'ui:theme-changed',
        modeChanged: 'ui:mode-changed',
    };
    UI.state = {
        tabs: {
            isActive: (tabId) => {
                const tab = document.querySelector(`.tab[data-tab-id="${tabId}"]`);
                return tab ? tab.classList.contains('active') : false;
            },
            getActive: () => {
                const activeTab = document.querySelector('.tab.active');
                return activeTab ? activeTab.dataset.tabId : null;
            },
            getAll: () => Array.from(document.querySelectorAll('.tab')).map((tab) => ({
                id: tab.dataset.tabId,
                active: tab.classList.contains('active'),
                label: tab.querySelector('.tab-label')?.textContent || '',
            })),
        },
        modals: {
            isOpen: () => document.querySelector('.modals-everywhere-overlay.active') !== null,
            getTitle: () => {
                const modal = document.querySelector('.modals-everywhere-overlay.active');
                return modal ? modal.querySelector('.modals-everywhere-title')?.textContent : null;
            },
        },
        toasts: {
            getVisible: () => document.querySelectorAll('.toast-item').length,
            getMessages: () => Array.from(document.querySelectorAll('.toast-item')).map((toast) => (
                toast.textContent.replace('×', '').trim()
            )),
        },
        sidebar: {
            isActive: (itemId) => {
                const item = document.querySelector(`.sidebar-item[data-item-id="${itemId}"]`);
                return item ? item.classList.contains('active') : false;
            },
            getActive: () => {
                const activeItem = document.querySelector('.sidebar-item.active');
                return activeItem ? activeItem.dataset.itemId : null;
            },
            isCollapsed: () => {
                const sidebar = document.querySelector('.sidebar');
                return sidebar ? sidebar.classList.contains('collapsed') : false;
            },
        },
    };
    window.UI = UI;
    applyThemeState(requestedTheme);
    applyModeState(requestedMode);
    applyInitialSwaggerSkin();

    function resolveCurrentScriptElement() {
        if (document.currentScript?.src) {
            return document.currentScript;
        }

        const scripts = Array.from(document.querySelectorAll('script[src]')).reverse();
        return scripts.find((script) => /(?:^|\/)ui\.js(?:\?|$)/.test(script.src)) || null;
    }

    function resolveCurrentScriptUrl(scriptElement) {
        if (scriptElement?.src) {
            return new URL(scriptElement.src, window.location.href);
        }

        return new URL('https://ui.mullmania.com/ui.js');
    }

    function resolveRequestedTheme(scriptElement, scriptUrl) {
        const rawTheme = scriptElement?.dataset?.uiTheme
            || scriptElement?.dataset?.theme
            || scriptUrl.searchParams.get('theme')
            || new URLSearchParams(window.location.search).get('theme')
            || DEFAULT_THEME;
        const sanitizedTheme = String(rawTheme).trim().toLowerCase();

        return /^[a-z0-9-]+$/.test(sanitizedTheme) ? sanitizedTheme : DEFAULT_THEME;
    }

    function resolveRequestedMode(scriptElement, scriptUrl) {
        const rawMode = scriptElement?.dataset?.uiMode
            || scriptElement?.dataset?.mode
            || scriptUrl.searchParams.get('mode')
            || new URLSearchParams(window.location.search).get('mode')
            || DEFAULT_MODE;
        return sanitizeMode(rawMode);
    }

    function resolveRequestedSwaggerSkin(scriptElement, scriptUrl) {
        const rawSkin = scriptElement?.dataset?.uiSwagger
            || scriptElement?.dataset?.swagger
            || scriptUrl.searchParams.get('swagger')
            || '';
        return sanitizeSwaggerSkin(rawSkin);
    }

    function sanitizeTheme(value) {
        const sanitizedTheme = String(value || DEFAULT_THEME).trim().toLowerCase();
        return /^[a-z0-9-]+$/.test(sanitizedTheme) ? sanitizedTheme : DEFAULT_THEME;
    }

    function sanitizeMode(value) {
        const sanitizedMode = String(value || DEFAULT_MODE).trim().toLowerCase();
        return VALID_MODES.has(sanitizedMode) ? sanitizedMode : DEFAULT_MODE;
    }

    function sanitizeSwaggerSkin(value) {
        const sanitizedSkin = String(value || '').trim().toLowerCase();
        return /^[a-z0-9-]+$/.test(sanitizedSkin) ? sanitizedSkin : '';
    }

    function buildThemeStyleUrl(theme) {
        return new URL(`/${sanitizeTheme(theme)}/style.css`, assetOrigin).href;
    }

    function buildSwaggerStyleUrl() {
        return new URL(`/core/swagger.css`, assetOrigin).href;
    }

    function buildDetailShellStyleUrl() {
        return new URL(`/core/detail-shell.css`, assetOrigin).href;
    }

    function hasThemeStylesheet() {
        return Array.from(document.querySelectorAll('link[rel="stylesheet"]')).some((link) => {
            try {
                const url = new URL(link.href, window.location.href);
                return url.origin === assetOrigin && url.pathname.endsWith('/style.css');
            } catch {
                return false;
            }
        });
    }

    function hasSwaggerStylesheet() {
        return Array.from(document.querySelectorAll('link[rel="stylesheet"]')).some((link) => {
            try {
                const url = new URL(link.href, window.location.href);
                return url.origin === assetOrigin && url.pathname.endsWith('/core/swagger.css');
            } catch {
                return false;
            }
        });
    }

    function hasDetailShellStylesheet() {
        return Array.from(document.querySelectorAll('link[rel="stylesheet"]')).some((link) => {
            try {
                const url = new URL(link.href, window.location.href);
                return url.origin === assetOrigin && url.pathname.endsWith('/core/detail-shell.css');
            } catch {
                return false;
            }
        });
    }

    function ensureStylesheets() {
        if (!hasThemeStylesheet()) {
            appendStylesheet(UI.styleUrl, 'ui-shared-style');
        }

        if (!hasDetailShellStylesheet()) {
            appendStylesheet(UI.detailShellStyleUrl, 'ui-detail-shell-style');
        }

        if (UI.swagger.skin && !hasSwaggerStylesheet()) {
            appendStylesheet(UI.swagger.styleUrl, 'ui-shared-swagger-style', { 'data-ui-swagger-style': 'true' });
        }

        if (!document.querySelector('link[data-ui-tabler-icons], link[href*="tabler-icons.min.css"]')) {
            appendStylesheet(iconsUrl, 'ui-tabler-icons', { 'data-ui-tabler-icons': 'true' });
        }
    }

    function applyInitialSwaggerSkin() {
        if (!UI.swagger.skin) {
            return;
        }

        document.documentElement.dataset.uiSwagger = UI.swagger.skin;
    }

    function applyThemeState(theme) {
        const sanitizedTheme = sanitizeTheme(theme);
        document.documentElement.dataset.uiTheme = sanitizedTheme;

        if (document.body) {
            document.body.dataset.uiTheme = sanitizedTheme;
        }
    }

    function applyModeState(mode) {
        const sanitizedMode = sanitizeMode(mode);
        document.documentElement.dataset.uiMode = sanitizedMode;

        if (document.body) {
            document.body.dataset.uiMode = sanitizedMode;
        }
    }

    function appendStylesheet(href, id, extraAttributes = {}) {
        if (id && document.getElementById(id)) {
            return;
        }

        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = href;

        if (id) {
            link.id = id;
        }

        Object.entries(extraAttributes).forEach(([key, value]) => {
            link.setAttribute(key, value);
        });

        (document.head || document.documentElement).appendChild(link);
    }

    function setTheme(nextTheme, options = {}) {
        const sanitizedTheme = sanitizeTheme(nextTheme);
        const nextStyleUrl = buildThemeStyleUrl(sanitizedTheme);
        const managedStylesheet = document.getElementById('ui-shared-style');
        const nextMode = options.mode === undefined ? UI.mode : setMode(options.mode);

        if (managedStylesheet) {
            managedStylesheet.href = nextStyleUrl;
        } else if (options.force !== false) {
            appendStylesheet(nextStyleUrl, 'ui-shared-style');
        }

        UI.theme = sanitizedTheme;
        UI.styleUrl = nextStyleUrl;
        applyThemeState(sanitizedTheme);
        document.dispatchEvent(new CustomEvent(UI.events.themeChanged, {
            detail: {
                theme: sanitizedTheme,
                mode: nextMode,
                styleUrl: nextStyleUrl,
            },
        }));
        return sanitizedTheme;
    }

    function setMode(nextMode) {
        const sanitizedMode = sanitizeMode(nextMode);
        UI.mode = sanitizedMode;
        applyModeState(sanitizedMode);
        document.dispatchEvent(new CustomEvent(UI.events.modeChanged, {
            detail: {
                mode: sanitizedMode,
                theme: UI.theme,
            },
        }));
        return sanitizedMode;
    }

    function setSwaggerSkin(nextSkin, options = {}) {
        const sanitizedSkin = sanitizeSwaggerSkin(nextSkin);
        const managedStylesheet = document.getElementById('ui-shared-swagger-style');

        if (sanitizedSkin) {
            document.documentElement.dataset.uiSwagger = sanitizedSkin;

            if (managedStylesheet) {
                managedStylesheet.href = UI.swagger.styleUrl;
            } else if (options.force !== false) {
                appendStylesheet(UI.swagger.styleUrl, 'ui-shared-swagger-style', { 'data-ui-swagger-style': 'true' });
            }
        } else {
            delete document.documentElement.dataset.uiSwagger;
        }

        UI.swagger.skin = sanitizedSkin;
        return sanitizedSkin;
    }

    function buildLibraryUrl(file) {
        return new URL(file, baseUrl).href;
    }

    function createShell(config = {}) {
        const shellCtor = UI.__internal?.shellCtor;
        if (typeof shellCtor !== 'function') {
            throw new Error('UI.createShell() is only available after the shared shell runtime has loaded. Await UI.ready() first.');
        }

        const shell = new shellCtor(config);
        UI.currentShell = shell;
        UI.shell = shell;
        return shell;
    }

    function loadLibrary(library) {
        return new Promise((resolve, reject) => {
            if (document.getElementById(library.id)) {
                resolve();
                return;
            }

            const script = document.createElement('script');
            script.src = buildLibraryUrl(library.file);
            script.id = library.id;
            script.async = false;
            script.onload = () => resolve();
            script.onerror = (error) => reject(error);

            (document.head || document.body || document.documentElement).appendChild(script);
        });
    }

    async function loadAll() {
        if (loadPromise) {
            return loadPromise;
        }

        loadPromise = (async () => {
            ensureStylesheets();

            for (const library of libraryDefinitions) {
                await loadLibrary(library);
            }

            window.dispatchEvent(new CustomEvent(UI.events.ready, {
                detail: {
                    libraries: UI.libraries,
                    timestamp: new Date().toISOString(),
                    timing: TIMING,
                    origin: assetOrigin,
                },
            }));

            // Keep older site shells booting while the runtime uses colon-delimited events.
            window.dispatchEvent(new CustomEvent(UI.events.readyLegacy, {
                detail: {
                    libraries: UI.libraries,
                    timestamp: new Date().toISOString(),
                    timing: TIMING,
                    origin: assetOrigin,
                },
            }));

            readyResolve(UI);
            return UI;
        })();

        return loadPromise;
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            applyThemeState(UI.theme);
            applyModeState(UI.mode);
            void loadAll();
        }, { once: true });
    } else {
        applyThemeState(UI.theme);
        applyModeState(UI.mode);
        void loadAll();
    }
})(window, document);
