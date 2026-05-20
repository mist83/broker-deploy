/**
 * Get current user permissions from session
 * Returns ["*"] if no session or permissions not configured
 */
function getUserPermissions() {
    try {
        const sessionToken = localStorage.getItem('sessionToken');
        if (!sessionToken) return ['*'];
        
        // Permissions stored in localStorage after login
        const permsJson = localStorage.getItem('userPermissions');
        if (!permsJson) return ['*'];
        
        return JSON.parse(permsJson);
    } catch (e) {
        console.warn('[UI Shell] Error getting permissions:', e);
        return ['*'];
    }
}

/**
 * Check if user has required permission
 * Wildcard "*" grants all access
 */
function hasPermission(required, userPermissions) {
    if (!required) return true; // No permission required
    if (userPermissions.includes('*')) return true; // Wildcard
    return userPermissions.includes(required);
}

function clampLinearIndex(index, length) {
    if (length <= 0) return 0;
    return Math.max(0, Math.min(index, length - 1));
}

function setLinearTabStops(elements, activeIndex) {
    elements.forEach((element, index) => {
        element.tabIndex = index === activeIndex ? 0 : -1;
    });
}

function wireLinearKeyboardNavigation(elements, options = {}) {
    const items = Array.from(elements).filter((element) => element instanceof HTMLElement);
    if (items.length === 0) return;

    const orientation = options.orientation === 'horizontal' ? 'horizontal' : 'vertical';
    const activate = typeof options.activate === 'function' ? options.activate : null;
    const initialIndex = Math.max(0, items.findIndex((element) =>
        element.classList.contains('active')
        || element.getAttribute('aria-current') === 'page'
        || element.getAttribute('aria-selected') === 'true'));

    const focusItem = (nextIndex) => {
        const index = clampLinearIndex(nextIndex, items.length);
        setLinearTabStops(items, index);
        items[index].focus();
    };

    setLinearTabStops(items, initialIndex);

    items.forEach((item, index) => {
        item.addEventListener('focus', () => {
            setLinearTabStops(items, index);
        });

        item.addEventListener('keydown', (event) => {
            if (event.defaultPrevented) return;

            switch (event.key) {
                case 'ArrowLeft':
                    if (orientation !== 'horizontal') return;
                    event.preventDefault();
                    focusItem(index - 1);
                    break;
                case 'ArrowRight':
                    if (orientation !== 'horizontal') return;
                    event.preventDefault();
                    focusItem(index + 1);
                    break;
                case 'ArrowUp':
                    if (orientation !== 'vertical') return;
                    event.preventDefault();
                    focusItem(index - 1);
                    break;
                case 'ArrowDown':
                    if (orientation !== 'vertical') return;
                    event.preventDefault();
                    focusItem(index + 1);
                    break;
                case 'Home':
                    event.preventDefault();
                    focusItem(0);
                    break;
                case 'End':
                    event.preventDefault();
                    focusItem(items.length - 1);
                    break;
                case 'Enter':
                case ' ':
                    if (!activate) return;
                    event.preventDefault();
                    activate(item, event);
                    break;
                default:
                    break;
            }
        });
    });
}

const INTERNAL_WORKSPACE_LAYOUT = 'workspace';
const INTERNAL_DOCUMENT_LAYOUT = 'single';
const FRAMEWORK_TOOLS_TAB_ID = 'ui-framework';
const RELATED_PROJECTS_TAB_ID = 'related-projects';
const SITES_CATALOG_URL = 'https://sites.mullmania.com/api/catalog';
const FRAMEWORK_THEME_IDS = Object.freeze([
    'active',
    'walmart',
    'ocean',
    'editorial',
    'mockup',
    'pumpkin',
    'sunset',
    'cyberpink',
]);
const SUPPORTED_SHELL_LAYOUTS = Object.freeze({
    workspace: INTERNAL_WORKSPACE_LAYOUT,
    document: INTERNAL_DOCUMENT_LAYOUT,
    single: INTERNAL_DOCUMENT_LAYOUT,
    tabs: 'tabs',
});
const SUPPORTED_SIDEBAR_POSITIONS = Object.freeze({
    left: 'left',
    right: 'right',
});
const SUPPORTED_TAB_NAVIGATIONS = Object.freeze({
    top: 'top',
    'top-strip': 'top',
    strip: 'top',
    bottom: 'bottom',
    'bottom-strip': 'bottom',
    pager: 'pager',
    'bottom-pager': 'pager',
});

function normalizeShellLayout(layoutValue, fallback = INTERNAL_WORKSPACE_LAYOUT) {
    const rawValue = String(layoutValue || '').trim();

    if (!rawValue) {
        return fallback;
    }

    const normalizedValue = rawValue.toLowerCase();

    if (SUPPORTED_SHELL_LAYOUTS[normalizedValue]) {
        return SUPPORTED_SHELL_LAYOUTS[normalizedValue];
    }

    throw new Error(
        `Unsupported layout "${rawValue}". Use one of: ${Object.keys(SUPPORTED_SHELL_LAYOUTS).join(', ')}.`
    );
}

function validateSitemapLayouts(sitemap) {
    if (!Array.isArray(sitemap?.tabs)) {
        throw new Error('Sitemap is missing a valid tabs array.');
    }

    normalizeSidebarPosition(sitemap.sidebarPosition);
    normalizeTabNavigation(sitemap.tabNavigation);

    sitemap.tabs.forEach((tab) => {
        try {
            if (tab.tabNavigation !== undefined) {
                throw new Error('tabNavigation is app-level only. Put it at the sitemap root.');
            }
            normalizeShellLayout(tab.layout);
            normalizeSidebarPosition(tab.sidebarPosition);
        } catch (error) {
            throw new Error(`Tab "${tab.id || 'unknown'}": ${error.message}`);
        }
    });
}

function normalizeSidebarPosition(positionValue, fallback = 'left') {
    const rawValue = String(positionValue || '').trim();

    if (!rawValue) {
        return fallback;
    }

    const normalizedValue = rawValue.toLowerCase();

    if (SUPPORTED_SIDEBAR_POSITIONS[normalizedValue]) {
        return SUPPORTED_SIDEBAR_POSITIONS[normalizedValue];
    }

    throw new Error(
        `Unsupported sidebarPosition "${rawValue}". Use one of: ${Object.keys(SUPPORTED_SIDEBAR_POSITIONS).join(', ')}.`
    );
}

function normalizeTabNavigation(navigationValue, fallback = 'top') {
    const rawValue = String(navigationValue || '').trim();

    if (!rawValue) {
        return fallback;
    }

    const normalizedValue = rawValue.toLowerCase();

    if (SUPPORTED_TAB_NAVIGATIONS[normalizedValue]) {
        return SUPPORTED_TAB_NAVIGATIONS[normalizedValue];
    }

    throw new Error(
        `Unsupported tabNavigation "${rawValue}". Use one of: top, bottom, pager.`
    );
}

function dispatchShellViewChanged(detail) {
    if (detail?.tabId === FRAMEWORK_TOOLS_TAB_ID) {
        return;
    }

    if (detail?.tabId === RELATED_PROJECTS_TAB_ID) {
        return;
    }

    document.dispatchEvent(new CustomEvent('ui:view-changed', { detail }));
}

const THEME_SURFACE_FONT_URLS = Object.freeze({
    cyberpink: 'https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600;700&display=swap',
    editorial: 'https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=Instrument+Serif:ital@0;1&family=Manrope:wght@400;500;600;700;800&display=swap',
    mockup: 'https://fonts.googleapis.com/css2?family=Patrick+Hand&display=swap',
});

const themeSurfaceVariableCache = new Map();

function parseThemeSurfaceVariables(cssText) {
    const rootMatch = cssText.match(/:root\s*\{([\s\S]*?)\n\}/);
    if (!rootMatch) {
        return {};
    }

    const variables = {};
    const block = rootMatch[1];
    const variablePattern = /(--[a-z0-9-]+)\s*:\s*([^;]+);/gi;
    let match;

    while ((match = variablePattern.exec(block)) !== null) {
        variables[match[1]] = match[2].trim();
    }

    return variables;
}

async function getThemeSurfaceVariables(themeId) {
    const normalizedThemeId = String(themeId || '').trim().toLowerCase();
    if (!normalizedThemeId) {
        return {};
    }

    if (themeSurfaceVariableCache.has(normalizedThemeId)) {
        return themeSurfaceVariableCache.get(normalizedThemeId);
    }

    const fetchPromise = fetch(`/${normalizedThemeId}/colors.css`)
        .then((response) => {
            if (!response.ok) {
                throw new Error(`Failed to load theme surface tokens for ${normalizedThemeId}.`);
            }

            return response.text();
        })
        .then(parseThemeSurfaceVariables)
        .catch((error) => {
            console.warn('[UI Shell] Failed to load scoped theme surface variables:', normalizedThemeId, error);
            return {};
        });

    themeSurfaceVariableCache.set(normalizedThemeId, fetchPromise);
    return fetchPromise;
}

function ensureThemeSurfaceFont(themeId) {
    const normalizedThemeId = String(themeId || '').trim().toLowerCase();
    const href = THEME_SURFACE_FONT_URLS[normalizedThemeId];
    if (!href) {
        return;
    }

    if (document.querySelector(`link[data-ui-theme-font="${normalizedThemeId}"]`)) {
        return;
    }

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    link.setAttribute('data-ui-theme-font', normalizedThemeId);
    (document.head || document.documentElement).appendChild(link);
}

class UIShell {
    constructor(config) {
        this.config = config || {};
        this.sitemap = null;
        this.controllers = {};
        this.warnedHtmlSources = new Set();
        this.pendingHashNavigation = null;
        this.currentlyLoadingTab = null;
        this.latestLoadToken = 0;

        window.UI = window.UI || {};
        window.UI.shell = this;
        window.UI.currentShell = this;
        window.UI.tabs = window.UI.tabs || {};
        window.UI.tabs.shell = this;
        window.UI.tabs.controllers = this.controllers;
        window.UI.tabs.managers = this.controllers;
    }

    beginTabLoad(tabId) {
        this.latestLoadToken += 1;
        this.currentlyLoadingTab = tabId;
        return this.latestLoadToken;
    }

    isLatestTabLoad(loadToken) {
        return loadToken === this.latestLoadToken;
    }

    getHeaderConfig() {
        const sitemapHeader = this.sitemap?.header;
        const configHeader = this.config.header;

        if (configHeader && sitemapHeader) {
            return {
                ...sitemapHeader,
                ...configHeader,
                controls: configHeader.controls || sitemapHeader.controls || []
            };
        }

        return configHeader || sitemapHeader || null;
    }

    getDefaultSidebarPosition() {
        return normalizeSidebarPosition(
            this.config.sidebarPosition || this.sitemap?.sidebarPosition,
            'left'
        );
    }

    getTabNavigationMode() {
        return normalizeTabNavigation(
            this.config.tabNavigation || this.sitemap?.tabNavigation,
            'top'
        );
    }

    getTabSidebarPosition(tab) {
        return normalizeSidebarPosition(tab?.sidebarPosition, this.getDefaultSidebarPosition());
    }

    applySidebarPositionOverride(position) {
        const normalizedPosition = normalizeSidebarPosition(position, this.getDefaultSidebarPosition());

        this.config.sidebarPosition = normalizedPosition;

        document.querySelectorAll('.layout.workspace').forEach((layout) => {
            layout.classList.toggle('sidebar-left', normalizedPosition === 'left');
            layout.classList.toggle('sidebar-right', normalizedPosition === 'right');
            layout.dataset.sidebarPosition = normalizedPosition;
        });

        return normalizedPosition;
    }

    applyTabNavigationMode() {
        const mode = this.getTabNavigationMode();
        const tabsContainer = document.getElementById(this.config.tabsContainerId || 'tabs-container');
        const contentContainer = document.getElementById(this.config.contentContainerId || 'content-container');
        const shellRoot = tabsContainer?.parentElement && tabsContainer.parentElement.contains(contentContainer)
            ? tabsContainer.parentElement
            : null;

        document.body.dataset.tabNavigation = mode;
        document.body.classList.toggle('tab-navigation-top', mode === 'top');
        document.body.classList.toggle('tab-navigation-bottom', mode === 'bottom');
        document.body.classList.toggle('tab-navigation-pager', mode === 'pager');

        if (shellRoot && shellRoot !== document.body) {
            shellRoot.dataset.tabNavigation = mode;
            shellRoot.classList.add('ui-shell-root');
            shellRoot.classList.toggle('tab-navigation-top', mode === 'top');
            shellRoot.classList.toggle('tab-navigation-bottom', mode === 'bottom');
            shellRoot.classList.toggle('tab-navigation-pager', mode === 'pager');
        }

        if (tabsContainer) {
            tabsContainer.dataset.tabNavigation = mode;
            tabsContainer.classList.add('tabs');
            tabsContainer.classList.toggle('tabs-bottom', mode === 'bottom');
            tabsContainer.classList.toggle('tabs-pager', mode === 'pager');
        }

        return mode;
    }

    hasRenderableContent(config) {
        if (!config || typeof config !== 'object') {
            return false;
        }

        return Boolean(
            config.htmlSource
            || config.preset
            || config.componentSource
            || (config.component !== undefined && config.component !== null)
        );
    }

    describeRenderableContent(config) {
        if (!config || typeof config !== 'object') {
            return 'content';
        }

        return config.htmlSource
            || config.preset
            || config.componentSource
            || `${config.id || config.label || 'inline'} component`;
    }

    async resolveRenderableContent(config) {
        if (!config || typeof config !== 'object') {
            return null;
        }

        const cacheBust = '?v=' + Date.now();

        if (config.preset) {
            if (!window.UI?.presets?.resolve) {
                throw new Error(`UI preset registry unavailable for preset "${config.preset}".`);
            }

            return {
                type: 'component',
                source: config.preset,
                content: window.UI.presets.resolve(config.preset, config.presetOptions || {}),
            };
        }

        if (config.component !== undefined && config.component !== null) {
            return {
                type: 'component',
                source: `${config.id || config.label || 'inline'} component`,
                content: config.component,
            };
        }

        if (config.componentSource) {
            const response = await fetch(config.componentSource + cacheBust);
            const component = await response.json();
            return {
                type: 'component',
                source: config.componentSource,
                content: component,
            };
        }

        if (config.htmlSource) {
            if (!config.allowHtmlSource && !this.warnedHtmlSources.has(config.htmlSource)) {
                console.warn(
                    '[UI Shell] htmlSource is an escape hatch for',
                    config.htmlSource,
                    '. Prefer sitemap entries backed by preset, component, or componentSource unless raw HTML is genuinely required.'
                );
                this.warnedHtmlSources.add(config.htmlSource);
            }

            const response = await fetch(config.htmlSource + cacheBust);
            const html = await response.text();
            return {
                type: 'html',
                source: config.htmlSource,
                content: html,
            };
        }

        return null;
    }

    executeEmbeddedScripts(container) {
        const scripts = container.querySelectorAll('script');
        console.log('[UI Shell] 📜 Found', scripts.length, 'scripts');
        scripts.forEach(oldScript => {
            const newScript = document.createElement('script');
            Array.from(oldScript.attributes).forEach(attr => {
                if (attr.name === 'src' && oldScript.type === 'module') {
                    const cacheBust = '?v=' + Date.now();
                    newScript.setAttribute(attr.name, attr.value + cacheBust);
                    console.log('[UI Shell] 🔄 Cache-busting module:', attr.value + cacheBust);
                } else {
                    newScript.setAttribute(attr.name, attr.value);
                }
            });
            newScript.textContent = oldScript.textContent;
            oldScript.parentNode.replaceChild(newScript, oldScript);
        });
    }

    cloneRenderableSpec(spec) {
        if (Array.isArray(spec)) {
            return spec.map((entry) => this.cloneRenderableSpec(entry));
        }

        if (!spec || typeof spec !== 'object') {
            return spec;
        }

        if (typeof Node !== 'undefined' && spec instanceof Node) {
            const clonedNode = spec.cloneNode(true);
            if (spec.__uiShellPage) {
                clonedNode.__uiShellPage = { ...spec.__uiShellPage };
            }
            return clonedNode;
        }

        const clone = { ...spec };
        Object.keys(clone).forEach((key) => {
            clone[key] = this.cloneRenderableSpec(clone[key]);
        });
        return clone;
    }

    hasClassName(value, className) {
        return String(value || '')
            .split(/\s+/)
            .filter(Boolean)
            .includes(className);
    }

    isPageRootSpec(spec) {
        if (!spec || typeof spec !== 'object') {
            return false;
        }

        if (typeof Node !== 'undefined' && spec instanceof Node) {
            return spec.classList?.contains('ui-page-root') || spec.classList?.contains('page-container');
        }

        return this.hasClassName(spec.className, 'ui-page-root')
            || this.hasClassName(spec.className, 'page-container');
    }

    isPageHeadingSpec(spec) {
        if (!spec || typeof spec !== 'object') {
            return false;
        }

        if (typeof Node !== 'undefined' && spec instanceof Node) {
            return spec.classList?.contains('ui-page-heading');
        }

        return this.hasClassName(spec.className, 'ui-page-heading');
    }

    stripEmbeddedPageHeadingFromSpec(spec) {
        if (!spec || typeof spec !== 'object') {
            return false;
        }

        if (this.isPageRootSpec(spec)) {
            const children = Array.isArray(spec.children)
                ? spec.children
                : (spec.children ? [spec.children] : []);

            if (children.length > 0 && this.isPageHeadingSpec(children[0])) {
                spec.children = children.slice(1);
                return true;
            }

            return false;
        }

        const children = Array.isArray(spec.children)
            ? spec.children
            : (spec.children ? [spec.children] : []);

        for (const child of children) {
            if (this.stripEmbeddedPageHeadingFromSpec(child)) {
                return true;
            }
        }

        return false;
    }

    stripEmbeddedPageHeading(spec) {
        const cloned = this.cloneRenderableSpec(spec);

        if (typeof Node !== 'undefined' && cloned instanceof Node) {
            const pageRoot = cloned.classList?.contains('ui-page-root')
                ? cloned
                : cloned.querySelector?.('.ui-page-root');
            pageRoot?.querySelector(':scope > .ui-page-heading')?.remove();
            return cloned;
        }

        this.stripEmbeddedPageHeadingFromSpec(cloned);
        return cloned;
    }

    prepareResolvedContent(resolvedContent, renderOptions = {}) {
        if (!renderOptions.stripEmbeddedPageHeading || resolvedContent?.type !== 'component') {
            return resolvedContent;
        }

        return {
            ...resolvedContent,
            content: this.stripEmbeddedPageHeading(resolvedContent.content),
        };
    }

    renderResolvedContent(container, resolvedContent, renderOptions = {}) {
        if (!container) {
            return;
        }

        if (!resolvedContent) {
            container.innerHTML = '<p class="tabs-error-message">No content configured.</p>';
            return;
        }

        const preparedContent = this.prepareResolvedContent(resolvedContent, renderOptions);

        if (preparedContent.type === 'component') {
            if (!window.UI?.mount) {
                throw new Error('UI.mount is unavailable for declarative component rendering.');
            }

            window.UI.mount(container, preparedContent.content);
            return;
        }

        container.innerHTML = preparedContent.content || '';
        this.executeEmbeddedScripts(container);
    }

    async init() {
        await this.loadSitemap();

        // Render header if configured in the sitemap or runtime config.
        const headerConfig = this.getHeaderConfig();
        if (headerConfig) {
            this.renderHeader(headerConfig);
        }

        this.applyTabNavigationMode();
        this.renderTopLevelTabs();

        const hash = window.location.hash.slice(1);
        const pathSegments = hash.split('/').filter(s => s);
        const tabParam = pathSegments[0];
        const itemParam = pathSegments[1];

        const tabToLoad = tabParam || this.sitemap.tabs[0].id;
        await this.loadTab(tabToLoad, itemParam, true);

        window.addEventListener('hashchange', () => {
            const hash = window.location.hash.slice(1);
            if (this.pendingHashNavigation !== null && hash === this.pendingHashNavigation) {
                this.pendingHashNavigation = null;
                return;
            }

            this.pendingHashNavigation = null;
            const segments = hash.split('/').filter(s => s);
            this.loadTab(segments[0] || this.sitemap.tabs[0].id, segments[1], false);
        });
    }

    escapeHtml(value) {
        return String(value ?? '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    sanitizeHref(href) {
        if (typeof href !== 'string') {
            return '#';
        }

        const trimmedHref = href.trim();
        if (!trimmedHref) {
            return '#';
        }

        if (trimmedHref.startsWith('#')) {
            return trimmedHref;
        }

        try {
            const url = new URL(trimmedHref, window.location.href);
            if (['http:', 'https:', 'mailto:', 'tel:'].includes(url.protocol)) {
                return url.href;
            }
        } catch (error) {
            if (trimmedHref.startsWith('/')) {
                return trimmedHref;
            }
        }

        return '#';
    }

    renderHeader(headerConfig = this.getHeaderConfig()) {
        const headerContainer = document.getElementById(headerConfig.containerId || 'header-container');

        if (!headerContainer) {
            console.warn('[UI Shell] Header container not found:', headerConfig.containerId);
            return;
        }
        
        const controls = Array.isArray(headerConfig.controls) ? headerConfig.controls : [];
        const iconOnlyControls = controls.length > 0 && controls.every((control) => {
            if (control.type === 'icon') {
                return Boolean(control.icon);
            }

            if (control.type === 'link' || control.href) {
                const label = String(control.text || control.label || '').trim();
                return Boolean(control.icon) && !label;
            }

            return false;
        });

        const headerClassNames = ['header'];
        if (headerConfig.variant) {
            headerClassNames.push(`header-${this.escapeHtml(headerConfig.variant)}`);
        }
        if (headerConfig.className) {
            headerClassNames.push(this.escapeHtml(headerConfig.className));
        }
        if (iconOnlyControls) {
            headerClassNames.push('header-controls-icons-only');
        }
        if (headerConfig.icon) {
            headerClassNames.push('header-has-brand-icon');
        }
        headerContainer.className = headerClassNames.join(' ');

        // Build left side (title + icon)
        let leftHtml = '<h1>';

        if (headerConfig.icon) {
            const iconHtml = headerConfig.iconLink 
                ? `<a href="${headerConfig.iconLink}" class="brand-icon-link" title="${headerConfig.iconTitle || ''}">
                     <span class="brand-icon">
                       <i class="${headerConfig.icon} brand-icon-default"></i>
                       ${headerConfig.iconHover ? `<i class="${headerConfig.iconHover} brand-icon-hover"></i>` : ''}
                     </span>
                   </a>`
                : `<i class="${headerConfig.icon} brand-icon"></i>`;
            leftHtml += iconHtml;
        }

        if (headerConfig.title) {
            leftHtml += `<span class="header-title-text">${headerConfig.title}</span>`;
        }

        leftHtml += '</h1>';
        
        // Build right side (controls)
        let rightHtml = '<div class="header-links header-controls">';

        if (controls.length > 0) {
            controls.forEach(control => {
                if (control.type === 'text') {
                    const className = this.escapeHtml(control.className || 'header-text');
                    rightHtml += `<span id="${this.escapeHtml(control.id || '')}" class="${className}">${this.escapeHtml(control.text || control.label || '')}</span>`;
                } else if (control.type === 'link' || control.href) {
                    const className = this.escapeHtml(control.className || 'header-link');
                    const href = this.escapeHtml(this.sanitizeHref(control.href || control.url || control.to));
                    const target = control.target ? ` target="${this.escapeHtml(control.target)}"` : '';
                    const rel = control.rel ? ` rel="${this.escapeHtml(control.rel)}"` : '';
                    const iconHtml = control.icon ? `<i class="${this.escapeHtml(control.icon)}"></i>` : '';
                    const label = this.escapeHtml(control.text || control.label || '');
                    const labelHtml = label ? (iconHtml ? ` <span>${label}</span>` : label) : '';
                    const title = control.title ? ` title="${this.escapeHtml(control.title)}"` : '';
                    rightHtml += `<a class="${className}" href="${href}"${target}${rel}${title}>${iconHtml}${labelHtml}</a>`;
                } else if (control.type === 'icon') {
                    rightHtml += `<i id="${this.escapeHtml(control.id || '')}" class="${this.escapeHtml(control.icon)} header-icon" title="${this.escapeHtml(control.title || '')}"></i>`;
                }
            });
        }

        rightHtml += '</div>';

        // Render header
        headerContainer.innerHTML = leftHtml + rightHtml;

        // Wire up click handlers
        if (controls.length > 0) {
            controls.forEach(control => {
                if (control.onClick && control.id) {
                    const element = document.getElementById(control.id);
                    if (element) {
                        element.addEventListener('click', control.onClick);
                    }
                }
            });
        }

        // Wire up icon link click if provided
        if (headerConfig.iconLink && headerConfig.iconOnClick) {
            const iconLink = headerContainer.querySelector('.brand-icon-link');
            if (iconLink) {
                iconLink.addEventListener('click', (e) => {
                    e.preventDefault();
                    headerConfig.iconOnClick();
                });
            }
        }
        
        console.log('[UI Shell] Header rendered');
    }

    async loadSitemap() {
        // Support direct sitemap object via config (for demos/testing)
        if (this.config.sitemap) {
            this.sitemap = this.config.sitemap;
            console.log('[UI Shell] Using provided sitemap object');
        } else {
            const response = await fetch(this.config.sitemapPath || '/sitemap.json');
            this.sitemap = await response.json();
        }
        
        const tabPromises = this.sitemap.tabs.map(async (tab, index) => {
            if (tab.configSource) {
                try {
                    const configResponse = await fetch(tab.configSource);
                    const externalConfig = await configResponse.json();
                    this.sitemap.tabs[index] = externalConfig;
                } catch (error) {
                    console.error(`Failed to load external config: ${tab.configSource}`, error);
                }
            }
        });
        
        await Promise.all(tabPromises);
        this.appendFrameworkToolsTab();
        await this.appendRelatedProjectsTab();
        validateSitemapLayouts(this.sitemap);
    }

    appendFrameworkToolsTab() {
        if (this.config.frameworkTools === false || this.sitemap.frameworkTools === false) {
            return;
        }

        if (this.sitemap.frameworkTools?.enabled === false) {
            return;
        }

        if (!Array.isArray(this.sitemap.tabs)) {
            return;
        }

        if (this.sitemap.tabs.some((tab) => tab.id === FRAMEWORK_TOOLS_TAB_ID)) {
            return;
        }

        this.sitemap.tabs.push(this.buildFrameworkToolsTab());
    }

    buildFrameworkToolsTab() {
        return {
            id: FRAMEWORK_TOOLS_TAB_ID,
            label: 'UI Framework',
            icon: 'ti ti-info-circle',
            layout: 'workspace',
            tour: {
                description: 'Built-in framework controls, renderer examples, and links back to the shared UI source.',
                order: 9999,
                importance: 2,
            },
            sections: [
                {
                    type: 'list',
                    inlineData: [
                        {
                            id: 'overview',
                            name: 'About',
                            icon: 'ti ti-info-circle',
                            description: 'What this shared UI framework is doing on the current site.',
                            htmlContent: this.renderFrameworkToolsOverviewHtml(),
                        },
                        {
                            id: 'tools',
                            name: 'Site Tools',
                            icon: 'ti ti-adjustments',
                            description: 'Live controls for checking this site against shared theme and rendering behavior.',
                            htmlContent: this.renderFrameworkToolsControlsHtml(),
                        },
                        {
                            id: 'renderer',
                            name: 'Renderer',
                            icon: 'ti ti-browser',
                            description: 'Embedded renderer proof showing JSON becoming a page through the shared framework.',
                            htmlContent: this.renderFrameworkToolsRendererHtml(),
                        },
                    ],
                },
            ],
        };
    }

    async appendRelatedProjectsTab() {
        if (this.config.relatedProjects === false || this.sitemap.related === false) {
            return;
        }

        if (this.sitemap.relatedProjects?.enabled === false) {
            return;
        }

        if (!Array.isArray(this.sitemap.tabs)) {
            return;
        }

        const relatedIds = Array.isArray(this.sitemap.related) ? this.sitemap.related : null;
        if (!relatedIds || relatedIds.length === 0) {
            return;
        }

        if (this.sitemap.tabs.some((tab) => tab.id === RELATED_PROJECTS_TAB_ID)) {
            return;
        }

        const catalog = await this.fetchSitesCatalog();
        const entries = relatedIds
            .map((siteId) => String(siteId || '').trim())
            .filter(Boolean)
            .map((siteId) => {
                const catalogEntry = catalog?.get(siteId);
                return {
                    siteId,
                    displayName: catalogEntry?.displayName || catalogEntry?.siteId || siteId,
                    description: catalogEntry?.description || '',
                    tags: Array.isArray(catalogEntry?.tags) ? catalogEntry.tags : [],
                };
            });

        if (entries.length === 0) {
            return;
        }

        this.sitemap.tabs.push(this.buildRelatedProjectsTab(entries));
    }

    async fetchSitesCatalog() {
        if (this._sitesCatalogPromise) {
            return this._sitesCatalogPromise;
        }

        this._sitesCatalogPromise = (async () => {
            try {
                const response = await fetch(SITES_CATALOG_URL);
                if (!response.ok) {
                    throw new Error(`catalog responded ${response.status}`);
                }
                const payload = await response.json();
                const sites = Array.isArray(payload?.sites) ? payload.sites : [];
                const map = new Map();
                sites.forEach((entry) => {
                    if (entry && typeof entry.siteId === 'string') {
                        map.set(entry.siteId, entry);
                    }
                });
                return map;
            } catch (error) {
                console.warn('[UI Shell] Sites catalog fetch failed; rendering related projects with siteId fallback.', error);
                return null;
            }
        })();

        return this._sitesCatalogPromise;
    }

    buildRelatedProjectsTab(entries) {
        const inlineData = entries.map((entry) => ({
            id: entry.siteId,
            name: entry.displayName,
            icon: 'ti ti-external-link',
            description: entry.description,
            htmlContent: this.renderRelatedProjectHtml(entry),
        }));

        return {
            id: RELATED_PROJECTS_TAB_ID,
            label: 'Related',
            icon: 'ti ti-arrows-shuffle',
            layout: 'workspace',
            tour: {
                description: 'Sibling sites this project points to. Each opens the linked mullmania.com subdomain in a new tab.',
                order: 10000,
                importance: 2,
            },
            sections: [
                {
                    type: 'list',
                    inlineData,
                },
            ],
        };
    }

    renderRelatedProjectHtml(entry) {
        const siteId = this.escapeHtml(entry.siteId);
        const name = this.escapeHtml(entry.displayName || entry.siteId);
        const href = this.sanitizeHref(`https://${entry.siteId}.mullmania.com/`);
        const safeHref = this.escapeHtml(href);
        const description = entry.description ? this.escapeHtml(entry.description) : '';
        const tagMarkup = entry.tags && entry.tags.length
            ? `<div class="ui-framework-action-row">${entry.tags
                .slice(0, 6)
                .map((tag) => `<span class="status-badge">${this.escapeHtml(tag)}</span>`)
                .join('')}</div>`
            : '';
        const descriptionMarkup = description ? `<p>${description}</p>` : '';

        return `
            <div class="ui-framework-tools">
                <div class="ui-framework-tools-hero">
                    <div>
                        <div class="ui-framework-tools-kicker">Related site</div>
                        <h3>${name}</h3>
                        <p>${siteId}.mullmania.com</p>
                    </div>
                    <a class="btn-primary" href="${safeHref}" target="_blank" rel="noopener">
                        <i class="ti ti-external-link"></i>
                        Open ${name}
                    </a>
                </div>
                <div class="ui-framework-tools-panel">
                    ${descriptionMarkup}
                    ${tagMarkup}
                </div>
            </div>
        `;
    }

    getFrameworkOrigin() {
        return window.UI?.origin || new URL('/ui.js', window.location.href).origin;
    }

    renderFrameworkToolsOverviewHtml() {
        const origin = this.escapeHtml(this.getFrameworkOrigin());
        const host = this.escapeHtml(window.location.host || 'this site');
        const sidebarPosition = this.escapeHtml(this.getDefaultSidebarPosition());
        return `
            <div class="ui-framework-tools">
                <div class="ui-framework-tools-hero">
                    <div>
                        <div class="ui-framework-tools-kicker">Shared UI active</div>
                        <h3>About the UI framework on ${host}</h3>
                        <p>This tab is injected by ui.mullmania.com so every framework-backed site has a small, consistent place to explain the shared shell, link back to the source docs, and grow site-alignment checks over time.</p>
                    </div>
                    <a class="btn-primary" href="${origin}/about.html" target="_blank" rel="noopener">
                        <i class="ti ti-external-link"></i>
                        Open about page
                    </a>
                </div>
                <div class="ui-framework-tools-grid">
                    <div class="ui-framework-tools-card">
                        <strong>Current theme</strong>
                        <span data-ui-framework-current-theme>${this.escapeHtml(window.UI?.theme || 'active')}</span>
                    </div>
                    <div class="ui-framework-tools-card">
                        <strong>Current mode</strong>
                        <span data-ui-framework-current-mode>${this.escapeHtml(window.UI?.mode || 'light')}</span>
                    </div>
                    <div class="ui-framework-tools-card">
                        <strong>Renderer</strong>
                        <span>JSON contracts become pages</span>
                    </div>
                    <div class="ui-framework-tools-card">
                        <strong>Sidebar</strong>
                        <span data-ui-framework-current-sidebar>${sidebarPosition}</span>
                    </div>
                </div>
                <div class="ui-framework-tools-panel">
                    <h3>What belongs here</h3>
                    <p>This panel is intentionally framework-owned, not site-owned. It should keep pointing back to the shared UI docs and eventually host checks for theme drift, sitemap shape, contract rendering, and canon alignment.</p>
                    <div class="ui-framework-action-row">
                        <a class="btn-secondary" href="${origin}/" target="_blank" rel="noopener">
                            <i class="ti ti-palette"></i>
                            Framework home
                        </a>
                        <a class="btn-secondary" href="${origin}/llm-docs.md" target="_blank" rel="noopener">
                            <i class="ti ti-robot"></i>
                            LLM docs
                        </a>
                        <a class="btn-secondary" href="${origin}/ui-tour-manifest.json" target="_blank" rel="noopener">
                            <i class="ti ti-route"></i>
                            Tour manifest
                        </a>
                    </div>
                </div>
            </div>
        `;
    }

    renderFrameworkToolsControlsHtml() {
        const origin = this.escapeHtml(this.getFrameworkOrigin());
        const currentTheme = String(window.UI?.theme || 'active').trim().toLowerCase();
        const currentMode = String(window.UI?.mode || 'light').trim().toLowerCase();
        const currentSidebarPosition = this.getDefaultSidebarPosition();
        const themeOptions = FRAMEWORK_THEME_IDS.map((themeId) => (
            `<option value="${this.escapeHtml(themeId)}"${themeId === currentTheme ? ' selected' : ''}>${this.escapeHtml(this.titleCase(themeId))}</option>`
        )).join('');
        const modeOptions = ['light', 'dark'].map((mode) => (
            `<option value="${mode}"${mode === currentMode ? ' selected' : ''}>${this.titleCase(mode)}</option>`
        )).join('');
        const sidebarPositionOptions = Object.keys(SUPPORTED_SIDEBAR_POSITIONS).map((position) => (
            `<option value="${position}"${position === currentSidebarPosition ? ' selected' : ''}>${this.titleCase(position)}</option>`
        )).join('');

        return `
            <div class="ui-framework-tools">
                <div class="ui-framework-tools-panel">
                    <h3>Framework controls</h3>
                    <p>Use these controls to check whether this page survives shared theme and mode changes without local CSS drift.</p>
                    <div class="ui-framework-control-row">
                        <label>
                            <span>Theme</span>
                            <select data-ui-framework-theme>
                                ${themeOptions}
                            </select>
                        </label>
                        <label>
                            <span>Mode</span>
                            <select data-ui-framework-mode>
                                ${modeOptions}
                            </select>
                        </label>
                        <label>
                            <span>Sidebar</span>
                            <select data-ui-framework-sidebar-position>
                                ${sidebarPositionOptions}
                            </select>
                        </label>
                    </div>
                    <div class="ui-framework-action-row">
                        <button type="button" class="btn-secondary" data-ui-framework-apply>
                            <i class="ti ti-refresh"></i>
                            Apply
                        </button>
                        <a class="btn-secondary" href="${origin}/llm-docs.md" target="_blank" rel="noopener">
                            <i class="ti ti-robot"></i>
                            LLM docs
                        </a>
                        <a class="btn-secondary" href="${origin}/ui-tour-manifest.json" target="_blank" rel="noopener">
                            <i class="ti ti-route"></i>
                            Tour manifest
                        </a>
                    </div>
                    <div class="alert alert-info ui-framework-tools-note" data-ui-framework-status>
                        Theme changes are local to this browser tab.
                    </div>
                </div>
            </div>
        `;
    }

    renderFrameworkToolsRendererHtml() {
        const origin = this.escapeHtml(this.getFrameworkOrigin());
        const demoSource = `${origin}/docs/demo/json-to-site/contract.json`;
        const rendererUrl = `${origin}/render.html?source=${encodeURIComponent(demoSource)}`;

        return `
            <div class="ui-framework-tools ui-framework-renderer-demo">
                <div class="ui-framework-tools-panel">
                    <h3>JSON to page</h3>
                    <p>This embedded renderer proves the contract flow: a JSON document is fetched, validated, themed, and mounted by the shared framework.</p>
                    <div class="ui-framework-renderer-frame">
                        <iframe title="UI framework JSON renderer demo" src="${rendererUrl}"></iframe>
                    </div>
                    <div class="ui-framework-action-row">
                        <a class="btn-secondary" href="${rendererUrl}" target="_blank" rel="noopener">
                            <i class="ti ti-external-link"></i>
                            Open renderer
                        </a>
                        <a class="btn-secondary" href="${demoSource}" target="_blank" rel="noopener">
                            <i class="ti ti-braces"></i>
                            Open JSON
                        </a>
                    </div>
                </div>
            </div>
        `;
    }

    titleCase(value) {
        return String(value || '')
            .split(/[-_\s]+/)
            .filter(Boolean)
            .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
            .join(' ');
    }

    hydrateFrameworkTools(container) {
        if (!container) {
            return;
        }

        const themeSelect = container.querySelector('[data-ui-framework-theme]');
        const modeSelect = container.querySelector('[data-ui-framework-mode]');
        const applyButton = container.querySelector('[data-ui-framework-apply]');
        const status = container.querySelector('[data-ui-framework-status]');
        const themeLabels = container.querySelectorAll('[data-ui-framework-current-theme]');
        const modeLabels = container.querySelectorAll('[data-ui-framework-current-mode]');
        const sidebarPositionSelect = container.querySelector('[data-ui-framework-sidebar-position]');
        const sidebarPositionLabels = container.querySelectorAll('[data-ui-framework-current-sidebar]');

        const refreshLabels = () => {
            themeLabels.forEach((element) => {
                element.textContent = window.UI?.theme || 'active';
            });
            modeLabels.forEach((element) => {
                element.textContent = window.UI?.mode || 'light';
            });
            sidebarPositionLabels.forEach((element) => {
                element.textContent = this.getDefaultSidebarPosition();
            });
            if (themeSelect && window.UI?.theme) {
                themeSelect.value = window.UI.theme;
            }
            if (modeSelect && window.UI?.mode) {
                modeSelect.value = window.UI.mode;
            }
            if (sidebarPositionSelect) {
                sidebarPositionSelect.value = this.getDefaultSidebarPosition();
            }
        };

        const applyControls = () => {
            const theme = themeSelect?.value || window.UI?.theme || 'active';
            const mode = modeSelect?.value || window.UI?.mode || 'light';
            const sidebarPosition = sidebarPositionSelect?.value || this.getDefaultSidebarPosition();

            if (window.UI?.setTheme) {
                window.UI.setTheme(theme, { mode });
            } else {
                document.documentElement.dataset.uiTheme = theme;
                document.documentElement.dataset.uiMode = mode;
            }

            const appliedSidebarPosition = this.applySidebarPositionOverride(sidebarPosition);
            refreshLabels();
            if (status) {
                status.textContent = `Applied ${this.titleCase(theme)}, ${this.titleCase(mode)} mode, and ${this.titleCase(appliedSidebarPosition)} sidebar for this browser tab.`;
            }
        };

        applyButton?.addEventListener('click', applyControls);
        themeSelect?.addEventListener('change', applyControls);
        modeSelect?.addEventListener('change', applyControls);
        sidebarPositionSelect?.addEventListener('change', applyControls);
        document.addEventListener(window.UI?.events?.themeChanged || 'ui:theme-changed', refreshLabels);
        document.addEventListener(window.UI?.events?.modeChanged || 'ui:mode-changed', refreshLabels);
        refreshLabels();
    }

    renderTopLevelTabs() {
        const container = document.getElementById(this.config.tabsContainerId || 'tabs-container');
        if (!container) return;
        const navigationMode = this.applyTabNavigationMode();

        // Get user permissions
        const userPermissions = getUserPermissions();
        
        // Detect current environment
        const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        const currentEnvironment = isLocalhost ? 'localhost' : 'production';
        
        const tabMarkup = [];
        this.sitemap.tabs.forEach(tab => {
            // Check permission (backward compatible - if no requiredPermission, always show)
            if (tab.requiredPermission && !hasPermission(tab.requiredPermission, userPermissions)) {
                console.log('[UI Shell] Tab hidden due to permissions:', tab.id);
                return; // Skip this tab
            }
            
            // Check environment (if showInEnvironments specified, only show in those environments)
            if (tab.showInEnvironments && !tab.showInEnvironments.includes(currentEnvironment)) {
                console.log('[UI Shell] Tab hidden due to environment:', tab.id, 'requires', tab.showInEnvironments, 'but running in', currentEnvironment);
                return; // Skip this tab
            }
            
            tabMarkup.push(`
                <div class="tab" data-tab-id="${tab.id}" id="tab-${tab.id}" role="tab" aria-selected="false" tabindex="-1">
                    <i class="${tab.icon}"></i>
                    <span class="tab-label">${tab.label}</span>
                </div>
            `);
        });

        if (navigationMode === 'pager') {
            container.innerHTML = `
                <button type="button" class="tab-pager-button tab-pager-prev" data-tab-direction="previous" aria-label="Previous tab">
                    <i class="ti ti-chevron-left"></i>
                </button>
                <div class="tab-pager-list" role="tablist">
                    ${tabMarkup.join('')}
                </div>
                <div class="tab-pager-status" aria-live="polite"></div>
                <button type="button" class="tab-pager-button tab-pager-next" data-tab-direction="next" aria-label="Next tab">
                    <i class="ti ti-chevron-right"></i>
                </button>
            `;
        } else {
            container.innerHTML = tabMarkup.join('');
            container.setAttribute('role', 'tablist');
        }
        if (navigationMode === 'pager') {
            container.removeAttribute('role');
        }

        const tabElements = Array.from(container.querySelectorAll('.tab'));
        tabElements.forEach((tabEl) => {
            const activateTab = () => {
                this.loadTab(tabEl.dataset.tabId);
                window.keyboardNav?.setFocusOnContainer(tabEl);
            };
            tabEl.addEventListener('click', activateTab);
        });
        wireLinearKeyboardNavigation(tabElements, {
            orientation: 'horizontal',
            activate: (tabEl) => {
                this.loadTab(tabEl.dataset.tabId);
                window.keyboardNav?.setFocusOnContainer(tabEl);
            },
        });

        if (!container.dataset.horizontalWheelBound) {
            container.addEventListener('wheel', (event) => {
                if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) {
                    return;
                }

                if (container.scrollWidth <= container.clientWidth) {
                    return;
                }

                event.preventDefault();
                container.scrollBy({ left: event.deltaY, behavior: 'auto' });
            }, { passive: false });
            container.dataset.horizontalWheelBound = 'true';
        }

        if (navigationMode === 'pager' && !container.dataset.pagerBound) {
            container.querySelectorAll('[data-tab-direction]').forEach((button) => {
                button.addEventListener('click', () => {
                    this.loadAdjacentTab(button.dataset.tabDirection === 'previous' ? -1 : 1);
                });
            });
            container.dataset.pagerBound = 'true';
        }

        this.syncTabNavigationState();
    }

    loadAdjacentTab(delta) {
        const tabsContainer = document.getElementById(this.config.tabsContainerId || 'tabs-container');
        const tabElements = Array.from(tabsContainer?.querySelectorAll('.tab') || []);
        if (tabElements.length === 0) return;

        const activeIndex = Math.max(0, tabElements.findIndex((tab) => tab.classList.contains('active')));
        const nextIndex = clampLinearIndex(activeIndex + delta, tabElements.length);
        const nextTab = tabElements[nextIndex];

        if (nextTab && nextTab.dataset.tabId) {
            this.loadTab(nextTab.dataset.tabId);
            window.keyboardNav?.setFocusOnContainer(nextTab);
        }
    }

    syncTabNavigationState() {
        const tabsContainer = document.getElementById(this.config.tabsContainerId || 'tabs-container');
        if (!tabsContainer || this.getTabNavigationMode() !== 'pager') return;

        const tabElements = Array.from(tabsContainer.querySelectorAll('.tab'));
        const activeIndex = Math.max(0, tabElements.findIndex((tab) => tab.classList.contains('active')));
        const status = tabsContainer.querySelector('.tab-pager-status');
        const previousButton = tabsContainer.querySelector('[data-tab-direction="previous"]');
        const nextButton = tabsContainer.querySelector('[data-tab-direction="next"]');

        if (status && tabElements.length > 0) {
            const activeTab = tabElements[activeIndex];
            const label = activeTab?.querySelector('.tab-label')?.textContent?.trim() || 'Tab';
            status.textContent = `${label} ${activeIndex + 1} of ${tabElements.length}`;
        }

        if (previousButton) {
            previousButton.disabled = activeIndex <= 0;
        }

        if (nextButton) {
            nextButton.disabled = activeIndex >= tabElements.length - 1;
        }
    }

    async loadTab(tabId, itemId = null, isInit = false) {
        console.log('[UI Shell] ========================================');
        console.log('[UI Shell] loadTab START:', { tabId, itemId, isInit });
        console.log('[UI Shell] currentlyLoadingTab:', this.currentlyLoadingTab);
        
        // Prevent double-loading same tab
        if (this.currentlyLoadingTab === tabId && !isInit) {
            console.log('[UI Shell] ❌ Already loading this tab, skipping');
            return;
        }
        const loadToken = this.beginTabLoad(tabId);
        console.log('[UI Shell] ✅ Set currentlyLoadingTab to:', tabId, 'token:', loadToken);
        
        const tab = this.sitemap.tabs.find(t => t.id === tabId);
        console.log('[UI Shell] Found tab config:', tab ? tab.label : 'NOT FOUND');
        if (!tab) {
            console.error('[UI Shell] ❌ Tab not found:', tabId, '- redirecting to first tab');
            // Redirect to first visible tab
            const firstTab = this.sitemap.tabs[0];
            if (firstTab) {
                window.location.hash = firstTab.id;
                return;
            }
            return;
        }

        try {
            const tabsContainer = document.getElementById(this.config.tabsContainerId || 'tabs-container');
            const topLevelTabs = Array.from(tabsContainer?.querySelectorAll('.tab') || []);
            topLevelTabs.forEach(t => {
                t.classList.remove('active');
                t.removeAttribute('aria-current');
                t.setAttribute('aria-selected', 'false');
                t.tabIndex = -1;
            });
            const activeTab = topLevelTabs.find(t => t.dataset.tabId === tab.id);
            if (activeTab) {
                activeTab.classList.add('active');
                activeTab.setAttribute('aria-current', 'page');
                activeTab.setAttribute('aria-selected', 'true');
                activeTab.tabIndex = 0;
                activeTab.scrollIntoView({ block: 'nearest', inline: 'nearest' });
            }
            this.syncTabNavigationState();

            const contentContainer = document.getElementById(this.config.contentContainerId || 'content-container');

            // Check if tab has static section with htmlSource (treat like direct htmlSource)
            const staticSection = tab.sections?.find(s => s.type === 'static' && this.hasRenderableContent(s));

            // Tab content is persistent across tab switches. Each tab gets its own
            // wrapper div inside contentContainer; switching tabs hides others and
            // shows this one without re-rendering. This preserves workspace state
            // (filter rail, selected item, app-owned heavy DOM like canvases) so
            // consumers do not have to re-mount on every visit.
            const existingTabDiv = contentContainer.querySelector(`:scope > [data-tab-id="${tabId}"]`);
            const showOnly = (target) => {
                contentContainer.querySelectorAll(':scope > [data-tab-id]').forEach((el) => {
                    if (el === target) {
                        el.style.display = '';
                        el.classList.remove('display-none');
                        el.classList.add('display-block');
                    } else {
                        el.style.display = 'none';
                        el.classList.remove('display-block');
                        el.classList.add('display-none');
                    }
                });
            };

            if (existingTabDiv) {
                console.log('[UI Shell] ♻️ Re-activating mounted tab:', tabId);
                showOnly(existingTabDiv);

                // Update selection if a specific item was requested
                if (itemId && this.controllers[tabId]?.setActiveItem) {
                    this.controllers[tabId].setActiveItem(itemId);
                }

                dispatchShellViewChanged({ tabId: tabId, tab: tab, itemId: itemId });

                if (!isInit && this.isLatestTabLoad(loadToken)) {
                    this.updateHistory(tabId, itemId);
                }
                return;
            }

            // First-time mount of this tab — create persistent wrapper div
            const tabContentDiv = document.createElement('div');
            tabContentDiv.dataset.tabId = tabId;
            contentContainer.appendChild(tabContentDiv);
            showOnly(tabContentDiv);

            // If tab has direct renderable content OR static section, load it (supports "single" layout tabs)
            if (this.hasRenderableContent(tab) || staticSection) {
                console.log('[UI Shell] 📄 Loading HTML content tab');

                try {
                    const contentConfig = staticSection || tab;
                    const resolvedContent = await this.resolveRenderableContent(contentConfig);
                    if (!this.isLatestTabLoad(loadToken)) {
                        console.log('[UI Shell] 🛑 Stale static tab load ignored:', tabId, 'token:', loadToken);
                        return;
                    }
                    console.log('[UI Shell] ✅ Content resolved from:', this.describeRenderableContent(contentConfig));

                    if (tab.headerHtml) {
                        const headerDiv = document.createElement('div');
                        headerDiv.className = 'tab-custom-header';
                        headerDiv.innerHTML = tab.headerHtml;
                        tabContentDiv.appendChild(headerDiv);
                    }

                    const contentDiv = document.createElement('div');
                    contentDiv.className = 'tab-scrollable-content';

                    // If this is a static section, wrap with page header FIRST
                    if (staticSection) {
                        const headerControls = staticSection.headerControls || '';
                        contentDiv.innerHTML = `
                            <div class="page-header">
                                <div class="page-header-text">
                                    <h3>${staticSection.title || tab.label}</h3>
                                    ${staticSection.description ? `<p>${staticSection.description}</p>` : ''}
                                </div>
                                ${headerControls ? `<div class="page-header-controls">${headerControls}</div>` : ''}
                            </div>
                            <div class="detail-body">
                            </div>
                        `;
                        this.renderResolvedContent(contentDiv.querySelector('.detail-body'), resolvedContent, {
                            stripEmbeddedPageHeading: true,
                        });
                    } else {
                        this.renderResolvedContent(contentDiv, resolvedContent);
                    }

                    tabContentDiv.appendChild(contentDiv);
                    console.log('[UI Shell] ✅ Content appended to DOM');

                    setTimeout(() => {
                        if (this.isLatestTabLoad(loadToken)) {
                            this.populateSidebarsFromSections(tab);
                        }
                    }, 50);

                    setTimeout(() => {
                        if (!this.isLatestTabLoad(loadToken)) {
                            return;
                        }
                        dispatchShellViewChanged({ tabId: tabId, tab: tab, itemId: itemId });
                        console.log('[UI Shell] 📡 Dispatched tab-changed event');
                    }, 100);
                } catch (error) {
                    if (!this.isLatestTabLoad(loadToken)) {
                        console.log('[UI Shell] 🛑 Ignoring stale static tab error for:', tabId);
                        return;
                    }
                    console.error('[UI Shell] Error loading tab HTML:', error);
                    tabContentDiv.innerHTML = `<div class="layout single"><div class="content"><p>Error loading content from ${this.describeRenderableContent(staticSection || tab)}</p></div></div>`;
                }
            } else {
                console.log('[UI Shell] 📋 Loading workspace tab:', tabId);

                console.log('[UI Shell] 🔨 Rendering layout HTML');
                tabContentDiv.innerHTML = this.renderLayout(tab);
                console.log('[UI Shell] ✅ HTML rendered, creating WorkspaceController');
                this.controllers[tabId] = new WorkspaceController(tab, this.config, this);
                console.log('[UI Shell] ✅ WorkspaceController created');

                console.log('[UI Shell] 🚀 Calling controller.init...');
                try {
                    await this.controllers[tabId].init(itemId, !isInit);
                    if (!this.isLatestTabLoad(loadToken)) {
                        console.log('[UI Shell] 🛑 Stale workspace tab load ignored after init:', tabId, 'token:', loadToken);
                        return;
                    }
                    console.log('[UI Shell] ✅ controller.init complete');
                } catch (error) {
                    console.error('[UI Shell] ❌ controller.init failed:', error);
                    throw error;
                }

                // Check for static section
                const innerStaticSection = tab.sections?.find(s => s.type === 'static');
                if (innerStaticSection) {
                    await this.loadStaticSection(tab, innerStaticSection);
                    if (!this.isLatestTabLoad(loadToken)) {
                        console.log('[UI Shell] 🛑 Stale workspace tab load ignored after static section:', tabId, 'token:', loadToken);
                        return;
                    }
                }

                // Dispatch tab change event after content is ready
                dispatchShellViewChanged({ tabId: tabId, tab: tab, itemId: itemId });
            }
            
            if (!isInit && this.isLatestTabLoad(loadToken)) {
                console.log('[UI Shell] 📝 Updating history');
                this.updateHistory(tabId, itemId);
            }
        } finally {
            if (this.isLatestTabLoad(loadToken)) {
                this.currentlyLoadingTab = null;
                console.log('[UI Shell] ✅ Cleared currentlyLoadingTab');
            } else {
                console.log('[UI Shell] ⏭️ Leaving currentlyLoadingTab alone for newer request');
            }
            console.log('[UI Shell] loadTab COMPLETE');
            console.log('[UI Shell] ========================================');
        }
    }
    
    updateHistory(tabId, itemId = null, isFirstItem = false) {
        const isFirstTab = tabId === this.sitemap.tabs[0].id;
        let hash = '';

        if (itemId) {
            hash = tabId;
            if (!isFirstItem) {
                hash += '/' + itemId;
            }
        } else if (!isFirstTab) {
            hash = tabId;
        }

        // Prevent hashchange loop - only update if different
        const currentHash = window.location.hash.slice(1);
        if (currentHash !== hash) {
            this.pendingHashNavigation = hash;
            window.location.hash = hash;
            return;
        }

        this.pendingHashNavigation = null;
    }

    renderLayout(tab) {
        const layoutId = normalizeShellLayout(tab.layout);
        const sidebarPosition = this.getTabSidebarPosition(tab);
        const workspaceLayout = `
                <div class="layout workspace sidebar-${sidebarPosition}" data-tab-id="${tab.id}" data-sidebar-position="${sidebarPosition}">
                    <div id="${tab.id}-sidebar" class="sidebar">
                        <div id="${tab.id}-sidebar-scroll" class="sidebar-scroll"></div>
                    </div>
                    <div id="${tab.id}-content" class="content">
                        <div id="${tab.id}-detail" class="section"></div>
                        <div id="${tab.id}-new" class="section">New Item Form</div>
                    </div>
                </div>
            `;
        const layouts = {
            'workspace': tab.headerHtml ? `
                <div class="tab-workspace-shell" data-tab-id="${tab.id}">
                    <div class="tab-custom-header">
                        ${tab.headerHtml}
                    </div>
                    ${workspaceLayout}
                </div>
            ` : workspaceLayout,
            'single': `
                <div class="layout single" data-tab-id="${tab.id}">
                    <div id="${tab.id}-content" class="content"></div>
                </div>
            `
        };
        
        return layouts[layoutId] || layouts[INTERNAL_WORKSPACE_LAYOUT];
    }
    
    populateSidebarsFromSections(tab) {
        if (!tab.sections) return;
        
        tab.sections.forEach(section => {
            if (section.type === 'menu' && section.items) {
                const sidebar = document.getElementById(section.id);
                if (sidebar && sidebar.children.length === 0) {
                    section.items.forEach((item, index) => {
                        // Handle both string format and object format
                        const itemId = typeof item === 'string' ? item : item.id;
                        const label = typeof item === 'string' ? item : item.label;
                        const icon = typeof item === 'string' ? 'ti ti-circle' : item.icon;
                        
                        const menuItem = document.createElement('div');
                        menuItem.className = 'sidebar-item' + (index === 0 ? ' active' : '');
                        menuItem.innerHTML = `<i class="${icon}"></i><span class="sidebar-item-label">${label}</span>`;
                        menuItem.onclick = () => {
                            sidebar.querySelectorAll('.sidebar-item').forEach(el => el.classList.remove('active'));
                            menuItem.classList.add('active');
                            
                            // Load content - prefer renderable source, fallback to showArchTab
                            if (typeof item === 'object' && this.hasRenderableContent(item)) {
                                this.loadMenuItemContent(tab.id, item);
                            } else if (window.showArchTab) {
                                window.showArchTab(itemId);
                            }
                        };
                        sidebar.appendChild(menuItem);
                    });
                    console.log('[UI Shell] Populated', section.id, 'with', section.items.length, 'items');
                }
            }
        });
    }
    
    async loadMenuItemContent(tabId, itemConfig) {
        // Find content container - try multiple patterns
        const contentContainer = document.getElementById(`${tabId}-content`) ||
                                document.getElementById(`${tabId}-detail`) ||
                                document.querySelector(`#${tabId}-sidebar ~ .content`) ||
                                document.querySelector('.content');
        
        if (!contentContainer) {
            console.error('[UI Shell] No content container found for', tabId);
            return;
        }
        
        try {
            const resolvedContent = await this.resolveRenderableContent(itemConfig);
            this.renderResolvedContent(contentContainer, resolvedContent);
            console.log('[UI Shell] Loaded', this.describeRenderableContent(itemConfig), 'into', contentContainer.id || 'content');
        } catch (error) {
            const sourceLabel = this.describeRenderableContent(itemConfig);
            contentContainer.innerHTML = `<p class="tabs-error-message">Error loading ${sourceLabel}</p>`;
            console.error('[UI Shell] Error loading', sourceLabel, error);
        }
    }

    async loadStaticSection(tab, section) {
        const content = document.getElementById(`${tab.id}-content`);
        if (!content) {
            console.error('[UI Shell] Content div not found:', `${tab.id}-content`);
            return;
        }

        if (this.hasRenderableContent(section)) {
            const resolvedContent = await this.resolveRenderableContent(section);

            // Wrap content with page header (with optional controls)
            const headerControls = section.headerControls || '';
            content.innerHTML = `
                <div class="page-header">
                    <div class="page-header-text">
                        <h3>${section.title || tab.label}</h3>
                        ${section.description ? `<p>${section.description}</p>` : ''}
                    </div>
                    ${headerControls ? `<div class="page-header-controls">${headerControls}</div>` : ''}
                </div>
                <div class="detail-body">
                </div>
            `;

            this.renderResolvedContent(content.querySelector('.detail-body'), resolvedContent, {
                stripEmbeddedPageHeading: true,
            });
        }
    }
}

class WorkspaceController {
    constructor(tabConfig, globalConfig, parent, context = {}) {
        this.tabConfig = tabConfig;
        this.globalConfig = globalConfig;
        this.parent = parent;
        this.context = {
            layoutPattern: context.layoutPattern || 'workspace',
            depth: context.depth || 0
        };
        this.data = [];
        this.selectedId = null;
        this.actions = null;
        this.loadId = 0;
    }

    getElement(suffix) {
        return document.getElementById(`${this.tabConfig.id}-${suffix}`);
    }

    async init(itemId = null, shouldUpdateHistory = false) {
        console.log('[WorkspaceController] init called for:', this.tabConfig.id, 'itemId:', itemId);
        const listSection = this.tabConfig.sections?.find(s => s.type === 'list');
        const accordionSection = this.tabConfig.sections?.find(s => s.type === 'accordion');
        console.log('[WorkspaceController] listSection:', !!listSection, 'accordionSection:', !!accordionSection);
        
        // Handle accordion - render panels in sidebar, content area ready for app
        if (accordionSection) {
            this.renderAccordion(accordionSection);
            
            // Make detail section active (app will populate it)
            const detailSection = this.getElement('detail');
            if (detailSection) {
                detailSection.classList.add('active');
            }
            
            // Dispatch event so app knows tab is ready
            setTimeout(() => {
                dispatchShellViewChanged({ tabId: this.tabConfig.id, tab: this.tabConfig });
            }, 100);
            
            return;
        }
        
        if (listSection) {
            console.log('[WorkspaceController] Processing list section for:', this.tabConfig.id);
            this.actions = listSection.actions || [];
            this.renderActions();

            if (listSection.inlineData) {
                console.log('[WorkspaceController] Using inline data:', listSection.inlineData.length, 'items');
                this.data = listSection.inlineData;
            } else if (listSection.dataSource) {
                console.log('[WorkspaceController] Loading data from:', listSection.dataSource);
                await this.loadData(listSection.dataSource);
                console.log('[WorkspaceController] Data loaded:', this.data.length, 'items');
            }

            if (listSection.itemMap && Array.isArray(this.data)) {
                this.data = this.data.map((item) => this.applyItemMap(item, listSection.itemMap));
            }

            this.isDelegatedDetail = Boolean(this.tabConfig.detailHtmlSource || listSection.delegateDetail);

            if (this.isDelegatedDetail) {
                const detailSection = this.getElement('detail');
                if (detailSection) {
                    detailSection.classList.add('active');
                    if (this.tabConfig.detailHtmlSource && !detailSection.dataset.detailMounted) {
                        try {
                            const response = await fetch(this.tabConfig.detailHtmlSource + '?v=' + Date.now());
                            detailSection.innerHTML = await response.text();
                            detailSection.dataset.detailMounted = '1';
                        } catch (error) {
                            console.error('[WorkspaceController] detailHtmlSource fetch failed:', error);
                            detailSection.innerHTML = `<p class="tabs-error-message">Error loading ${this.tabConfig.detailHtmlSource}</p>`;
                        }
                    }
                }
            }

            // Always render sidebar (no caching)
            const sidebarScroll = this.getElement('sidebar-scroll');
            console.log('[WorkspaceController] Sidebar scroll element:', !!sidebarScroll, 'children:', sidebarScroll?.children.length);
            console.log('[WorkspaceController] ALWAYS rendering sidebar for:', this.tabConfig.id);
            this.renderSidebar();

            // Update selection
            if (itemId) {
                console.log('[WorkspaceController] Setting active item:', itemId);
                this.setActiveItem(itemId);
            } else if (this.data.length > 0) {
                const defaultItemId = this.getDefaultItemId();
                console.log('[WorkspaceController] Setting default item as active:', defaultItemId);
                this.setActiveItem(defaultItemId);
            }
        }

        const rawSection = this.tabConfig.sections?.find(s => s.type === 'raw');
        if (rawSection && rawSection.dataSource) {
            await this.loadData(rawSection.dataSource);
            this.renderRawData();
        }

        const menuSection = this.tabConfig.sections?.find(s => s.type === 'menu');
        if (menuSection) {
            this.renderMenu(menuSection);
        }
    }

    async loadData(dataSource) {
        try {
            const response = await fetch(dataSource);
            const json = await response.json();
            
            // Ensure data is always an array
            if (Array.isArray(json)) {
                this.data = json;
            } else if (json && typeof json === 'object') {
                // If it's an object, try to extract array from common wrapper patterns
                const extracted = json.data || json.items || json.records || json.results || [];
                
                // Ensure extracted value is an array
                if (Array.isArray(extracted)) {
                    this.data = extracted;
                    console.log('[UI Shell] API returned object wrapper. Extracted:', this.data.length, 'items');
                } else {
                    this.data = [];
                    console.warn('[UI Shell] Extracted value is not an array:', typeof extracted);
                }
            } else {
                this.data = [];
                console.warn('[UI Shell] API returned unexpected format:', typeof json);
            }
        } catch (error) {
            this.data = [];
            console.error('[UI Shell] Error loading data:', error);
        }
    }

    renderActions() {
        // Actions now rendered as regular sidebar items at index 0
    }

    getCurrentThemeItemId() {
        if (this.tabConfig.id !== 'themes') {
            return null;
        }

        const currentTheme = String(window.UIActiveThemeManifest?.themeId || '').trim().toLowerCase();
        if (!currentTheme) {
            return null;
        }

        return currentTheme;
    }

    getDefaultItemId() {
        const currentThemeItemId = this.getCurrentThemeItemId();

        if (currentThemeItemId && this.data.some((item) => item.id === currentThemeItemId)) {
            return currentThemeItemId;
        }

        return this.data[0]?.id || null;
    }

    renderSidebar() {
        const sidebar = this.getElement('sidebar');
        if (!sidebar) return;

        // Add collapse toggle button at bottom if not already added
        if (!sidebar.querySelector('.sidebar-collapse-toggle')) {
            const toggleBtn = document.createElement('div');
            toggleBtn.className = 'sidebar-collapse-toggle';
            toggleBtn.innerHTML = '<i class="ti ti-chevron-left"></i>';
            toggleBtn.onclick = () => this.toggleSidebarCollapse();
            toggleBtn.setAttribute('role', 'button');
            toggleBtn.tabIndex = 0;
            toggleBtn.addEventListener('keydown', (event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    this.toggleSidebarCollapse();
                }
            });
            sidebar.appendChild(toggleBtn);
        }

        // Render filter rail (once)
        this.renderSidebarFilters();

        // Re-render items with current filter state
        this.renderSidebarItems();
    }

    getListSection() {
        return this.tabConfig.sections?.find(s => s.type === 'list');
    }

    applyItemMap(item, itemMap) {
        if (!item || typeof item !== 'object' || !itemMap) return item;
        const out = { ...item };
        for (const [target, sourceField] of Object.entries(itemMap)) {
            if (out[target] !== undefined) continue;
            const value = item[sourceField];
            if (value === undefined || value === null) continue;
            if (target === 'badges' && Array.isArray(value)) {
                out.badges = value.map((label) => ({ label: String(label) }));
            } else {
                out[target] = value;
            }
        }
        return out;
    }

    renderSidebarFilters() {
        const sidebar = this.getElement('sidebar');
        const filters = this.getListSection()?.filters;
        if (!sidebar || !filters) return;
        if (sidebar.querySelector('.sidebar-filter-rail')) return;

        if (!this.filterState) {
            this.filterState = { query: '', chip: 'all', selects: {} };
            if (filters.chips?.options?.length) {
                const first = filters.chips.options[0];
                this.filterState.chip = first.id;
            }
            for (const select of filters.selects || []) {
                this.filterState.selects[select.id] = select.options?.[0]?.id || 'all';
            }
        }

        const escapeHtml = (v) => this.parent?.escapeHtml(v) ?? String(v ?? '');
        const rail = document.createElement('div');
        rail.className = 'sidebar-filter-rail';

        let railHtml = '';
        if (filters.search) {
            const placeholder = filters.search.placeholder || 'Filter';
            railHtml += `
                <label class="sidebar-filter-search">
                    <i class="ti ti-search" aria-hidden="true"></i>
                    <input type="search" autocomplete="off" placeholder="${escapeHtml(placeholder)}" aria-label="${escapeHtml(placeholder)}">
                </label>
            `;
        }
        if (filters.chips?.options?.length) {
            const chipsHtml = filters.chips.options.map((opt) => {
                const active = opt.id === this.filterState.chip ? ' active' : '';
                return `<button type="button" class="sidebar-filter-chip${active}" data-chip-id="${escapeHtml(opt.id)}">${escapeHtml(opt.label || opt.id)}</button>`;
            }).join('');
            railHtml += `<div class="sidebar-filter-chips" role="tablist">${chipsHtml}</div>`;
        }
        for (const select of filters.selects || []) {
            const optionsHtml = (select.options || []).map((opt) => {
                const selected = opt.id === this.filterState.selects[select.id] ? ' selected' : '';
                return `<option value="${escapeHtml(opt.id)}"${selected}>${escapeHtml(opt.label || opt.id)}</option>`;
            }).join('');
            railHtml += `<select class="sidebar-filter-select" data-select-id="${escapeHtml(select.id)}" aria-label="${escapeHtml(select.label || select.id)}">${optionsHtml}</select>`;
        }
        rail.innerHTML = railHtml;
        sidebar.insertBefore(rail, sidebar.firstChild);

        const searchInput = rail.querySelector('input[type="search"]');
        if (searchInput) {
            searchInput.addEventListener('input', () => {
                this.filterState.query = searchInput.value.trim().toLowerCase();
                this.renderSidebarItems();
            });
        }
        rail.querySelectorAll('.sidebar-filter-chip').forEach((chipEl) => {
            chipEl.addEventListener('click', () => {
                this.filterState.chip = chipEl.dataset.chipId;
                rail.querySelectorAll('.sidebar-filter-chip').forEach((el) => el.classList.toggle('active', el === chipEl));
                this.renderSidebarItems();
            });
        });
        rail.querySelectorAll('.sidebar-filter-select').forEach((selectEl) => {
            selectEl.addEventListener('change', () => {
                this.filterState.selects[selectEl.dataset.selectId] = selectEl.value;
                this.renderSidebarItems();
            });
        });
    }

    getFilteredData() {
        const filters = this.getListSection()?.filters;
        if (!filters || !this.filterState) return this.data;
        const state = this.filterState;
        const searchFields = filters.search?.fields || ['name', 'title', 'description'];
        return this.data.filter((item) => {
            if (state.query) {
                const haystack = searchFields.map((field) => {
                    const value = item[field];
                    return Array.isArray(value) ? value.join(' ') : (value ?? '');
                }).join(' ').toLowerCase();
                if (!haystack.includes(state.query)) return false;
            }
            if (filters.chips && state.chip && state.chip !== 'all') {
                const field = filters.chips.field || 'category';
                const value = item[field];
                const matches = Array.isArray(value) ? value.includes(state.chip) : value === state.chip;
                if (!matches) return false;
            }
            for (const select of filters.selects || []) {
                const selected = state.selects[select.id];
                if (!selected || selected === 'all') continue;
                const field = select.field || select.id;
                const value = item[field];
                const matches = Array.isArray(value) ? value.includes(selected) : value === selected;
                if (!matches) return false;
            }
            return true;
        });
    }

    renderSidebarItems() {
        const sidebarScroll = this.getElement('sidebar-scroll');
        if (!sidebarScroll) return;
        sidebarScroll.innerHTML = '';

        // Render actions as regular items at the top
        if (this.actions && this.actions.length > 0) {
            this.actions.forEach((action) => {
                const actionDiv = document.createElement('div');
                actionDiv.className = 'sidebar-item';
                actionDiv.id = `sidebar-${action.id}`;
                actionDiv.innerHTML = `<i class="${action.icon}"></i><span class="sidebar-item-label">${action.label}</span>`;
                actionDiv.dataset.itemId = action.id;
                actionDiv.setAttribute('role', 'button');
                actionDiv.onclick = () => {
                    this.selectItem(action.id);
                    window.keyboardNav?.setFocusOnContainer(actionDiv);
                };
                sidebarScroll.appendChild(actionDiv);
            });
        }

        const data = this.getFilteredData();
        const escapeHtml = (v) => this.parent?.escapeHtml(v) ?? String(v ?? '');

        if (data.length === 0 && (!this.actions || this.actions.length === 0)) {
            const empty = document.createElement('p');
            empty.textContent = this.filterState?.query ? 'No matches' : 'No items yet';
            empty.className = 'empty-sidebar-message';
            sidebarScroll.appendChild(empty);
            return;
        }

        const currentThemeItemId = this.getCurrentThemeItemId();
        data.forEach((item, index) => {
            const itemDiv = document.createElement('div');
            const isCurrentTheme = currentThemeItemId !== null && item.id === currentThemeItemId;
            const isActive = this.selectedId === item.id;
            const isRich = Boolean(item.thumbnail || item.subtitle || item.badges?.length);
            itemDiv.className = `sidebar-item${isCurrentTheme ? ' is-theme-current' : ''}${isActive ? ' active' : ''}${isRich ? ' sidebar-item--rich' : ''}`;
            if (isActive) itemDiv.setAttribute('aria-selected', 'true');
            itemDiv.id = `sidebar-${item.id}`;

            const icon = this.resolveIcon(item.icon, index);
            const label = item.name || item.title || 'Unnamed';
            const statusMarkup = isCurrentTheme ? '<span class="sidebar-item-status">Live</span>' : '';

            if (isRich) {
                const thumbInner = item.thumbnail
                    ? `<img src="${escapeHtml(item.thumbnail)}" alt="" loading="lazy">`
                    : `<i class="${icon}"></i>`;
                const thumbHtml = `<span class="sidebar-item-thumb${item.thumbnail ? '' : ' sidebar-item-thumb--icon'}">${thumbInner}</span>`;
                const subtitle = item.subtitle || (item.description ? String(item.description).split('\n')[0].trim() : '');
                const subtitleHtml = subtitle ? `<span class="sidebar-item-subtitle">${escapeHtml(subtitle)}</span>` : '';
                const badgesHtml = (item.badges?.length)
                    ? `<span class="sidebar-item-badges">${item.badges.map((b) => `<span class="sidebar-item-badge${b.tone ? ' sidebar-item-badge--' + escapeHtml(b.tone) : ''}">${escapeHtml(b.label)}</span>`).join('')}</span>`
                    : '';
                itemDiv.innerHTML = `
                    ${thumbHtml}
                    <span class="sidebar-item-stack">
                        <span class="sidebar-item-label">${escapeHtml(label)}</span>
                        ${subtitleHtml}
                        ${badgesHtml}
                    </span>
                    ${statusMarkup}
                `;
            } else {
                itemDiv.innerHTML = `<i class="${icon}"></i><span class="sidebar-item-label">${escapeHtml(label)}</span>${statusMarkup}`;
            }

            itemDiv.dataset.itemId = item.id;
            itemDiv.setAttribute('role', 'button');
            itemDiv.onclick = () => {
                this.selectItem(item.id);
                window.keyboardNav?.setFocusOnContainer(itemDiv);
            };
            sidebarScroll.appendChild(itemDiv);
        });

        wireLinearKeyboardNavigation(sidebarScroll.querySelectorAll('.sidebar-item'), {
            orientation: 'vertical',
            activate: (itemEl) => {
                this.selectItem(itemEl.dataset.itemId);
                window.keyboardNav?.setFocusOnContainer(itemEl);
            },
        });
    }

    setActiveItem(itemId) {
        const sidebarScroll = this.getElement('sidebar-scroll');
        if (!sidebarScroll) return;
        
        // Update active class and aria-selected
        const allItems = Array.from(sidebarScroll.children).filter(el => el.classList.contains('sidebar-item'));
        allItems.forEach(el => {
            el.classList.remove('active');
            el.removeAttribute('aria-selected');
            el.tabIndex = -1;
        });
        
        const targetItem = allItems.find(el => el.dataset.itemId === itemId);
        if (targetItem) {
            targetItem.classList.add('active');
            targetItem.setAttribute('aria-selected', 'true');
            targetItem.tabIndex = 0;
        }
        
        // Load content for this item
        this.selectItem(itemId, targetItem, true); // skipHistory = true to avoid loop
    }

    renderAccordion(accordionSection) {
        const sidebarScroll = this.getElement('sidebar-scroll');
        if (!sidebarScroll) return;
        
        sidebarScroll.innerHTML = '';
        
        // Load panel states from localStorage
        const panelStates = this.loadPanelStates();
        
        accordionSection.panels.forEach((panel, index) => {
            const isExpanded = panelStates[panel.id] ?? (panel.defaultExpanded || false);
            
            // Create panel container
            const panelDiv = document.createElement('div');
            panelDiv.className = 'accordion-panel';
            panelDiv.dataset.panelId = panel.id;
            
            // Create panel header
            const header = document.createElement('div');
            header.className = 'accordion-header';
            header.innerHTML = `
                <i class="accordion-chevron ti ti-chevron-right ${isExpanded ? 'accordion-chevron-rotate-90' : 'accordion-chevron-rotate-0'}"></i>
                <i class="${panel.icon}"></i>
                <span>${panel.label}</span>
            `;
            
            // Create panel content
            const content = document.createElement('div');
            content.className = 'accordion-content';
            if (!isExpanded) { content.classList.add('hidden'); }
            content.dataset.htmlSource = panel.htmlSource || panel.componentSource || '';
            
            // Header click handler
            header.onclick = async () => {
                const isCurrentlyExpanded = content.style.display === 'block';
                content.style.display = isCurrentlyExpanded ? 'none' : 'block';
                const chevron = header.querySelector('.accordion-chevron');
                if (isCurrentlyExpanded) { chevron.classList.remove('accordion-chevron-expanded'); } else { chevron.classList.add('accordion-chevron-expanded'); }
                
                // Save state
                panelStates[panel.id] = !isCurrentlyExpanded;
                this.savePanelStates(panelStates);
                
                // Load content on first expand
                if (!isCurrentlyExpanded && content.children.length === 0) {
                    await this.loadPanelContent(panel, content);
                }
            };
            
            panelDiv.appendChild(header);
            panelDiv.appendChild(content);
            sidebarScroll.appendChild(panelDiv);
            
            // Load content if expanded by default
            if (isExpanded) {
                setTimeout(() => this.loadPanelContent(panel, content), 50);
            }
        });
        
        console.log('[UI Shell] Rendered accordion with', accordionSection.panels.length, 'panels');
    }
    
    async loadPanelContent(panel, contentDiv) {
        if (!this.parent?.hasRenderableContent(panel)) return;
        
        try {
            const resolvedContent = await this.parent.resolveRenderableContent(panel);
            this.parent.renderResolvedContent(contentDiv, resolvedContent);
            
            // Trigger panel-specific initialization
            if (panel.onLoad && typeof window[panel.onLoad] === 'function') {
                window[panel.onLoad]();
            }
            
            console.log('[UI Shell] Loaded panel content:', panel.id);
        } catch (error) {
            contentDiv.innerHTML = `<p class="tabs-error-message">Error loading ${this.parent?.describeRenderableContent(panel) || panel.id}</p>`;
            console.error('[UI Shell] Error loading panel:', error);
        }
    }
    
    loadPanelStates() {
        try {
            const saved = localStorage.getItem(`accordion-panels-${this.tabConfig.id}`);
            return saved ? JSON.parse(saved) : {};
        } catch (e) {
            return {};
        }
    }
    
    savePanelStates(states) {
        try {
            localStorage.setItem(`accordion-panels-${this.tabConfig.id}`, JSON.stringify(states));
        } catch (e) {
            console.warn('[UI Shell] Could not save panel states:', e);
        }
    }

    renderMenu(menuSection) {
        const sidebar = this.getElement('sidebar');
        if (!sidebar) return;

        menuSection.items.forEach(item => {
            const menuItem = document.createElement('div');
            menuItem.className = 'menu-item';
            menuItem.textContent = item;
            menuItem.onclick = () => this.showMenuOption(item);
            sidebar.appendChild(menuItem);
        });
    }

    handleAction(actionId) {
        if (actionId === 'new') {
            // Select "New" like a regular item
            const sidebarScroll = this.getElement('sidebar-scroll');
            if (sidebarScroll) {
                sidebarScroll.querySelectorAll('.sidebar-item').forEach(i => i.classList.remove('active'));
                const newButton = Array.from(sidebarScroll.children).find(el => el.textContent.includes('New'));
                if (newButton) newButton.classList.add('active');
            }
            
            // Show new section
            const contentArea = this.getElement('content');
            if (contentArea) {
                contentArea.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
            }
            
            const newSection = this.getElement('new');
            if (newSection) {
                newSection.classList.add('active');
                this.setDetailShellMode(newSection, true);
                newSection.innerHTML = `
                    <div class="detail-header">
                        <h2>New Item</h2>
                        <div class="detail-subtitle">Create a new item</div>
                    </div>
                    <div class="detail-body">
                        <p class="new-item-intro">This is where you would add a new item to this list.</p>
                        <p class="new-item-description">The form content is customizable per item type - you can define fields, validation, and behavior in your sitemap configuration.</p>
                        <div class="new-item-example-box">
                            <strong class="new-item-example-title">Example fields:</strong>
                            <ul class="new-item-example-list">
                                <li>Name</li>
                                <li>Description</li>
                                <li>Icon</li>
                                <li>Type</li>
                                <li>Data source</li>
                            </ul>
                        </div>
                    </div>
                `;
            }
            
            // Update URL
            if (this.parent) {
                this.parent.updateHistory(this.tabConfig.id, 'new', false);
            }
        }
    }

    renderBodyContent(container, bodyContent, renderOptions = {}) {
        if (!container) {
            return;
        }

        if (bodyContent && typeof bodyContent === 'object' && (bodyContent.type === 'html' || bodyContent.type === 'component')) {
            this.parent?.renderResolvedContent(container, bodyContent, renderOptions);
            return;
        }

        container.innerHTML = bodyContent || '';
    }

    getDetailHeaderConfig(item, bodyContent) {
        const shellPage = bodyContent?.type === 'component' ? bodyContent.content?.__uiShellPage : null;
        const fallbackDescription = String(item?.description || 'No description available')
            .split('\n')[0]
            .trim();

        return {
            title: shellPage?.title || item?.name || `Item ${item?.id || ''}`.trim(),
            description: shellPage?.description || fallbackDescription,
            actions: Array.isArray(shellPage?.actions) ? shellPage.actions : [],
            themeId: shellPage?.themeId || null,
        };
    }

    setDetailShellMode(detailSection, enabled) {
        if (!detailSection) {
            return;
        }

        detailSection.classList.toggle('section-detail-shell', Boolean(enabled));
    }

    clearThemeSurface(detailSection) {
        if (!detailSection) {
            return;
        }

        const appliedVariables = Array.isArray(detailSection.__uiThemeSurfaceVars)
            ? detailSection.__uiThemeSurfaceVars
            : [];

        appliedVariables.forEach((variableName) => {
            detailSection.style.removeProperty(variableName);
        });

        detailSection.__uiThemeSurfaceVars = [];
        detailSection.classList.remove('is-themed-detail-surface');
        [...detailSection.classList]
            .filter((className) => className.startsWith('theme-surface-'))
            .forEach((className) => detailSection.classList.remove(className));
        delete detailSection.dataset.uiThemeSurface;
    }

    async applyThemeSurface(detailSection, themeId) {
        this.clearThemeSurface(detailSection);

        const normalizedThemeId = String(themeId || '').trim().toLowerCase();
        if (!normalizedThemeId) {
            return;
        }

        ensureThemeSurfaceFont(normalizedThemeId);
        const variables = await getThemeSurfaceVariables(normalizedThemeId);
        const appliedVariables = [];

        Object.entries(variables).forEach(([variableName, variableValue]) => {
            detailSection.style.setProperty(variableName, variableValue);
            appliedVariables.push(variableName);
        });

        const derivedVariables = {
            '--font-family-body': variables['--font-family-body'] || 'var(--font-family)',
            '--font-family-ui': variables['--font-family-ui'] || 'var(--font-family)',
            '--font-family-heading': variables['--font-family-heading'] || 'var(--font-family-ui, var(--font-family))',
            '--font-family-display': variables['--font-family-display'] || 'var(--font-family-heading, var(--font-family))',
            '--font-family-label': variables['--font-family-label'] || 'var(--font-mono)',
            '--font-family-brand': variables['--font-family-brand'] || 'var(--font-family-ui, var(--font-family))',
            '--color-text': variables['--color-text'] || 'var(--text-primary)',
            '--color-text-secondary': variables['--color-text-secondary'] || 'var(--text-secondary)',
            '--color-bg': variables['--color-bg'] || 'var(--bg-primary)',
            '--color-bg-card': variables['--color-bg-card'] || variables['--bg-card'] || 'var(--bg-secondary)',
            '--color-bg-hover': variables['--color-bg-hover'] || 'var(--bg-hover)',
            '--color-accent': variables['--color-accent'] || 'var(--color-primary)',
            '--color-border-light': variables['--color-border-light'] || variables['--border-light'] || 'var(--border-color)',
            '--color-border-dark': variables['--color-border-dark'] || variables['--border-medium'] || 'var(--border-color)',
        };

        Object.entries(derivedVariables).forEach(([variableName, variableValue]) => {
            if (!detailSection.style.getPropertyValue(variableName)) {
                detailSection.style.setProperty(variableName, variableValue);
                appliedVariables.push(variableName);
            }
        });

        detailSection.__uiThemeSurfaceVars = appliedVariables;
        detailSection.dataset.uiThemeSurface = normalizedThemeId;
        detailSection.classList.add('is-themed-detail-surface', `theme-surface-${normalizedThemeId}`);
    }

    renderDetailShell(detailSection, headerConfig) {
        const title = this.parent?.escapeHtml(headerConfig?.title || 'Item');
        const description = this.parent?.escapeHtml(headerConfig?.description || '');
        const actions = Array.isArray(headerConfig?.actions) ? headerConfig.actions : [];
        const themedSurface = Boolean(headerConfig?.themeId);
        const headerStyle = themedSurface ? ' style="background: var(--bg-secondary); color: var(--text-primary);"' : '';
        const bodyStyle = themedSurface ? ' style="background: var(--bg-primary);"' : '';

        this.setDetailShellMode(detailSection, true);

        detailSection.innerHTML = `
            <div class="detail-header"${headerStyle}>
                <div class="detail-header-main">
                    <h2>${title}</h2>
                    ${description ? `<div class="detail-subtitle">${description}</div>` : ''}
                </div>
                ${actions.length > 0 ? '<div class="detail-header-controls"></div>' : ''}
            </div>
            <div class="detail-body"${bodyStyle}></div>
        `;

        const controlsContainer = detailSection.querySelector('.detail-header-controls');
        if (controlsContainer && window.UI?.mount) {
            window.UI.mount(controlsContainer, {
                tag: 'div',
                className: 'detail-header-actions',
                children: actions.map((action) => (action?.tag ? action : window.UI.button(action))),
            });
        }
    }

    async selectItem(itemId, targetElement, skipHistory = false, isAutoSelect = false) {
        this.loadId++;
        const thisLoadId = this.loadId;
        this.selectedId = itemId;

        const item = this.data.find(i => i.id === itemId);

        // If item not found, check if it's an action
        if (!item && this.actions) {
            const action = this.actions.find(a => a.id === itemId);
            if (action) {
                this.handleAction(itemId);
                return;
            }
        }

        // If still no item found, exit gracefully
        if (!item) {
            console.warn(`Item not found: ${itemId}`);
            return;
        }

        // Update active class and aria-selected if not already set
        if (!skipHistory) {
            const sidebar = this.getElement('sidebar-scroll');
            if (sidebar) {
                sidebar.querySelectorAll('.sidebar-item').forEach(i => {
                    i.classList.remove('active');
                    i.removeAttribute('aria-selected');
                });
            }
            const element = targetElement || event?.target;
            if (element) {
                element.classList.add('active');
                element.setAttribute('aria-selected', 'true');
            }

            // Update URL
            if (this.parent) {
                const isFirstItem = this.data.length > 0 && this.data[0].id === itemId;
                this.parent.updateHistory(this.tabConfig.id, itemId, isFirstItem);
            }
        }

        // Delegated-detail mode: framework keeps detail pane mounted; app listens for the event.
        if (this.isDelegatedDetail) {
            document.dispatchEvent(new CustomEvent('ui:item-selected', {
                detail: { tabId: this.tabConfig.id, itemId, item }
            }));
            return;
        }

        const contentArea = this.getElement('content');
        if (contentArea) {
            contentArea.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
        }

        const detailSection = this.getElement('detail');
        if (!detailSection) return;

        this.clearThemeSurface(detailSection);
        this.setDetailShellMode(detailSection, false);
        detailSection.classList.add('active');
        
        // Only show header at depth 0
        const showHeader = this.context.depth === 0;
        
        if (showHeader) {
            this.setDetailShellMode(detailSection, true);
            detailSection.innerHTML = `
                <div class="detail-header">
                    <h2>${item.name || 'Item ' + itemId}</h2>
                    <div class="detail-subtitle">${this.parent?.escapeHtml(String(item.description || 'No description available').split('\n')[0].trim())}</div>
                </div>
                <div class="detail-body loading-container">
                    <div class="loading-content">
                        <div class="loading-spinner-box"></div>
                        <p class="loading-text">Loading...</p>
                    </div>
                </div>
            `;
        } else {
            detailSection.innerHTML = `
                <div class="detail-body loading-container">
                    <div class="loading-content">
                        <div class="loading-spinner-box"></div>
                        <p class="loading-text">Loading...</p>
                    </div>
                </div>
            `;
        }
        
        if (item.delay) await new Promise(resolve => setTimeout(resolve, item.delay));
        if (this.loadId !== thisLoadId) return;
        
        let bodyContent;
        const itemLayoutPattern = item.nestedLayout || '_parent';
        const childLayoutPattern = itemLayoutPattern === '_parent' 
            ? this.rotatePattern(this.context.layoutPattern)
            : itemLayoutPattern;
        const childLayout = this.resolveLayout(childLayoutPattern);
        
        if (item.nestedTabs) {
            bodyContent = this.renderNested(item.nestedTabs, childLayout, childLayoutPattern);
        } else if (item.nestedTabsSource) {
            try {
                const response = await fetch(item.nestedTabsSource);
                const jsonData = await response.json();
                if (this.loadId !== thisLoadId) return;
                
                const nestedTabs = item.nestedTabsPath ? jsonData[item.nestedTabsPath] : jsonData;
                bodyContent = this.renderNested(nestedTabs, childLayout, childLayoutPattern);
            } catch (error) {
                bodyContent = `<p>Error loading nested tabs</p>`;
            }
        } else if (this.parent?.hasRenderableContent(item)) {
            try {
                bodyContent = await this.parent.resolveRenderableContent(item);
                if (this.loadId !== thisLoadId) return;
                
                // Trigger init for special fragments
                setTimeout(() => {
                    if (item.htmlSource?.includes('visualizer.html') && window.SitemapVisualizer) {
                        window.SitemapVisualizer.init();
                    } else if (item.htmlSource?.includes('raw-sitemap.html') && window.RawJsonViewer) {
                        window.RawJsonViewer.init();
                    }
                }, 50);
            } catch (error) {
                bodyContent = {
                    type: 'html',
                    content: `<p>Error loading content from ${this.parent?.describeRenderableContent(item) || item.id}</p>`,
                };
            }
        } else if (item.htmlContent) {
            bodyContent = {
                type: 'html',
                content: `<div class="html-content-display">${item.htmlContent}</div>`,
            };
        } else {
            const hasMetadata = item.type || item.status;
            const metadataCard = hasMetadata ? `
                <div class="metadata-card">
                    <strong>ID:</strong> ${itemId}<br>
                    ${item.type ? `<strong>Type:</strong> ${item.type}<br>` : ''}
                    ${item.status ? `<strong>Status:</strong> ${item.status}` : ''}
                </div>
            ` : '';
            
            bodyContent = {
                type: 'html',
                content: metadataCard || '<p class="no-details-message">No additional details</p>',
            };
        }
        
        if (this.loadId !== thisLoadId) return;
        
        if (showHeader) {
            const headerConfig = this.getDetailHeaderConfig(item, bodyContent);
            if (headerConfig.themeId) {
                await this.applyThemeSurface(detailSection, headerConfig.themeId);
                if (this.loadId !== thisLoadId) return;
            }
            this.renderDetailShell(detailSection, headerConfig);
            this.renderBodyContent(detailSection.querySelector('.detail-body'), bodyContent, {
                stripEmbeddedPageHeading: true,
            });
            if (this.tabConfig.id === FRAMEWORK_TOOLS_TAB_ID) {
                this.parent?.hydrateFrameworkTools(detailSection);
            }
        } else {
            this.setDetailShellMode(detailSection, false);
            this.renderBodyContent(detailSection, bodyContent);
            if (this.tabConfig.id === FRAMEWORK_TOOLS_TAB_ID) {
                this.parent?.hydrateFrameworkTools(detailSection);
            }
        }
    }

    renderNested(nestedTabs, layout, layoutPattern) {
        if (!nestedTabs || nestedTabs.length === 0) {
            return '<p class="nested-tabs-message">No nested tabs configured</p>';
        }
        
        const containerId = `nested-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        if (layout === 'workspace') {
            const sidebarId = `${containerId}-sidebar`;
            const contentId = `${containerId}-content`;
            
            let sidebarHtml = '';
            nestedTabs.forEach((tab, index) => {
                const isFirst = index === 0;
                const icon = this.resolveIcon(tab.icon, index);
                sidebarHtml += `
                    <div class="sidebar-item ${isFirst ? 'active' : ''}" data-tab-index="${index}" role="button" tabindex="${isFirst ? '0' : '-1'}" aria-selected="${isFirst ? 'true' : 'false'}">
                        <i class="${icon}"></i> ${tab.label}
                    </div>
                `;
            });
            
            const html = `
                <div class="layout workspace nested-layout">
                    <div id="${sidebarId}" class="sidebar">
                        <div id="${sidebarId}-scroll" class="sidebar-scroll">
                            ${sidebarHtml}
                        </div>
                    </div>
                    <div id="${contentId}" class="content">
                        <div id="${contentId}-detail" class="section active"></div>
                    </div>
                </div>
            `;
            
            const self = this;
            setTimeout(() => {
                const sidebarItems = document.querySelectorAll(`#${sidebarId}-scroll .sidebar-item`);
                sidebarItems.forEach((itemEl, index) => {
                    itemEl.onclick = () => {
                        sidebarItems.forEach(el => {
                            el.classList.remove('active');
                            el.setAttribute('aria-selected', 'false');
                            el.tabIndex = -1;
                        });
                        itemEl.classList.add('active');
                        itemEl.setAttribute('aria-selected', 'true');
                        itemEl.tabIndex = 0;
                        self.loadNestedItem(nestedTabs[index], `${contentId}-detail`, layoutPattern);
                        window.keyboardNav?.setFocusOnContainer(itemEl);
                    };
                });
                wireLinearKeyboardNavigation(sidebarItems, {
                    orientation: 'vertical',
                    activate: (itemEl) => itemEl.click(),
                });
                
                if (nestedTabs.length > 0) {
                    self.loadNestedItem(nestedTabs[0], `${contentId}-detail`, layoutPattern);
                }
            }, 10);
            
            return html;
        } else {
            const tabsId = `${containerId}-tabs`;
            const contentId = `${containerId}-content`;
            
            let tabsHtml = '';
            nestedTabs.forEach((tab, index) => {
                const isFirst = index === 0;
                tabsHtml += `
                    <div class="tab nested-tab ${isFirst ? 'active' : ''}" data-tab-id="${tab.id}" role="tab" tabindex="${isFirst ? '0' : '-1'}" aria-selected="${isFirst ? 'true' : 'false'}">
                        <i class="${tab.icon}"></i>
                        <span class="tab-label">${tab.label}</span>
                    </div>
                `;
            });
            
            const html = `
                <div class="nested-tabs-container">
                    <div class="tabs nested-tabs" id="${tabsId}" role="tablist">
                        ${tabsHtml}
                    </div>
                    <div class="nested-content-area" id="${contentId}"></div>
                </div>
            `;
            
            const self = this;
            setTimeout(() => {
                const tabsContainer = document.getElementById(tabsId);
                if (!tabsContainer) return;
                
                const tabElements = tabsContainer.querySelectorAll('.nested-tab');
                tabElements.forEach((tabEl, index) => {
                    tabEl.onclick = () => {
                        tabElements.forEach(el => {
                            el.classList.remove('active');
                            el.setAttribute('aria-selected', 'false');
                            el.tabIndex = -1;
                        });
                        tabEl.classList.add('active');
                        tabEl.setAttribute('aria-selected', 'true');
                        tabEl.tabIndex = 0;
                        self.loadNestedItem(nestedTabs[index], contentId, layoutPattern);
                        window.keyboardNav?.setFocusOnContainer(tabEl);
                    };
                });
                wireLinearKeyboardNavigation(tabElements, {
                    orientation: 'horizontal',
                    activate: (tabEl) => tabEl.click(),
                });
                
                if (nestedTabs.length > 0) {
                    self.loadNestedItem(nestedTabs[0], contentId, layoutPattern);
                }
            }, 10);
            
            return html;
        }
    }

    async loadNestedItem(tab, contentId, layoutPattern) {
        const contentContainer = document.getElementById(contentId);
        if (!contentContainer) return;
        
        const listSection = tab.sections?.find(s => s.type === 'list');
        if (!listSection) return;
        
        let data = listSection.inlineData || [];
        if (!listSection.inlineData && listSection.dataSource) {
            try {
                const response = await fetch(listSection.dataSource);
                data = await response.json();
            } catch (error) {
                return;
            }
        }
        
        if (data.length === 0) return;
        
        const item = data[0];
        const itemLayoutPattern = item.nestedLayout || '_parent';
        const childLayoutPattern = itemLayoutPattern === '_parent' 
            ? this.rotatePattern(layoutPattern)
            : itemLayoutPattern;
        const childLayout = this.resolveLayout(childLayoutPattern);
        
        let nestedContent = '';
        if (item.nestedTabsSource) {
            try {
                const response = await fetch(item.nestedTabsSource);
                const nestedTabs = await response.json();
                nestedContent = this.renderNested(nestedTabs, childLayout, childLayoutPattern);
            } catch (error) {
                nestedContent = '<p>Error loading nested content</p>';
            }
        } else if (item.nestedTabs) {
            nestedContent = this.renderNested(item.nestedTabs, childLayout, childLayoutPattern);
        } else {
            nestedContent = `<p class="nested-tabs-message">${item.description || item.name}</p>`;
        }
        
        contentContainer.innerHTML = nestedContent;
    }

    resolveIcon(iconValue, index = 0) {
        if (!iconValue) return 'ti ti-circle';
        
        if (iconValue.includes('|')) {
            const options = iconValue.split('|');
            return options[index % options.length];
        }
        
        return iconValue;
    }

    rotatePattern(pattern) {
        if (pattern && pattern.includes('|')) {
            const parts = pattern.split('|');
            return parts.slice(1).concat(parts[0]).join('|');
        }
        return pattern;
    }

    resolveLayout(layoutValue) {
        if (!layoutValue) return INTERNAL_WORKSPACE_LAYOUT;
        if (layoutValue === '_random') return Math.random() < 0.5 ? 'tabs' : INTERNAL_WORKSPACE_LAYOUT;
        
        if (layoutValue.includes('|')) {
            const options = layoutValue.split('|');
            const firstOption = options[0];
            return normalizeShellLayout(firstOption);
        }

        return normalizeShellLayout(layoutValue);
    }

    renderRawData() {
        const content = this.getElement('content');
        if (!content) return;
        const json = JSON.stringify(this.data, null, 2);
        const highlighted = this.highlightJSON(json);
        content.innerHTML = `<pre class="raw-json-display">${highlighted}</pre>`;
    }

    highlightJSON(json) {
        return json
            .replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?)/g, (match) => {
                if (/:$/.test(match)) {
                    return `<span class="key">${match}</span>`;
                }
                return `<span class="string">${match}</span>`;
            })
            .replace(/\b(true|false)\b/g, '<span class="boolean">$1</span>')
            .replace(/\b(null)\b/g, '<span class="null">$1</span>')
            .replace(/\b(-?\d+\.?\d*)\b/g, '<span class="number">$1</span>');
    }

    showMenuOption(optionId) {
        const content = this.getElement('content');
        if (content) {
            content.innerHTML = `<h2>Menu: ${optionId}</h2><p>Content for ${optionId}</p>`;
        }
    }

    toggleSidebarCollapse() {
        const sidebar = this.getElement('sidebar');
        if (!sidebar) return;
        
        const isCollapsed = sidebar.classList.toggle('collapsed');
        const toggleBtn = sidebar.querySelector('.sidebar-collapse-toggle i');
        
        if (toggleBtn) {
            toggleBtn.className = isCollapsed ? 'ti ti-chevron-right' : 'ti ti-chevron-left';
        }
        
        // Save state to localStorage
        try {
            localStorage.setItem(`sidebar-collapsed-${this.tabConfig.id}`, isCollapsed);
        } catch (e) {
            console.warn('Could not save sidebar state:', e);
        }
        
        // Wrap text in spans if not already done
        if (!sidebar.dataset.textWrapped) {
            const items = sidebar.querySelectorAll('.sidebar-item');
            items.forEach(item => {
                const icon = item.querySelector('i');
                if (icon) {
                    const text = item.textContent.trim();
                    item.innerHTML = '';
                    item.appendChild(icon.cloneNode(true));
                    const span = document.createElement('span');
                    span.textContent = text.replace(icon.textContent, '').trim();
                    item.appendChild(span);
                }
            });
            sidebar.dataset.textWrapped = 'true';
        }
    }
}

window.UI = window.UI || {};
window.UI.__internal = window.UI.__internal || {};
window.UI.__internal.shellCtor = UIShell;
window.UI.__internal.workspaceControllerCtor = WorkspaceController;
window.TabsEverywhere = window.TabsEverywhere || UIShell;

// Compatibility function for DallAIre's HTML files
window.showArchTab = function(viewId) {
    const contentContainer = document.getElementById('system-content-container') || 
                            document.getElementById('playbooks-content') ||
                            document.getElementById('showcase-content');
    
    if (!contentContainer) {
        console.warn('[showArchTab] Content container not found');
        return;
    }
    
    // Determine which tab we're in based on which container exists
    let tabPath = '';
    if (document.getElementById('system-content-container')) {
        tabPath = '/tabs/system/';
    } else if (document.getElementById('playbooks-content')) {
        tabPath = '/tabs/playbooks/';
    } else if (document.getElementById('showcase-content')) {
        tabPath = '/tabs/showcase/';
    }
    
    // Load the HTML file for this view
    fetch(tabPath + viewId + '.html?v=' + Date.now())
        .then(response => response.text())
        .then(html => {
            contentContainer.innerHTML = html;
            console.log('[showArchTab] Loaded', viewId);
        })
        .catch(error => {
            contentContainer.innerHTML = `<p class="tabs-error-message">Error loading ${viewId}</p>`;
            console.error('[showArchTab] Error:', error);
        });
};
