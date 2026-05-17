/**
 * UI Components - JS-first component helpers for ui.mullmania.com
 * @version 1.1.0
 * @license MIT
 *
 * Example:
 * UI.mount('#app', {
 *   title: 'Dashboard',
 *   subtitle: 'Built from JS data instead of hand-written HTML',
 *   sections: [
 *     UI.section({
 *       title: 'Overview',
 *       children: [
 *         UI.grid({
 *           columns: 2,
 *           children: [
 *             UI.card({ title: 'Status', body: UI.status({ label: 'Live', tone: 'success' }) }),
 *             UI.alert({ tone: 'info', message: 'Ready to render shared primitives.' })
 *           ]
 *         })
 *       ]
 *     })
 *   ]
 * });
 */

(function(window, document) {
    'use strict';

    const UI = window.UI || (window.UI = {});
    const PREVIEW_PLACEHOLDER_URL = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 240 160'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0' x2='1' y1='0' y2='1'%3E%3Cstop stop-color='%23eef2f7'/%3E%3Cstop offset='1' stop-color='%23dce5f0'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='240' height='160' rx='18' fill='url(%23g)'/%3E%3Cpath d='M34 114 84 72l28 24 33-40 61 58v12H34Z' fill='%23b7c5d8'/%3E%3Ccircle cx='86' cy='54' r='14' fill='%2398abc2'/%3E%3C/svg%3E";

    function isNode(value) {
        return typeof Node !== 'undefined' && value instanceof Node;
    }

    function toArray(value) {
        if (value === undefined || value === null || value === false) {
            return [];
        }

        return Array.isArray(value) ? value : [value];
    }

    function joinClasses(...values) {
        return values
            .flatMap((value) => toArray(value))
            .filter(Boolean)
            .join(' ')
            .trim();
    }

    function toCssSize(value, fallback) {
        if (value === undefined || value === null || value === '') {
            return fallback;
        }

        if (typeof value === 'number' && Number.isFinite(value)) {
            return `${value}px`;
        }

        return String(value);
    }

    function resolveTarget(target) {
        if (typeof target === 'string') {
            const element = document.querySelector(target);
            if (!element) {
                throw new Error(`UI target not found: ${target}`);
            }
            return element;
        }

        if (isNode(target)) {
            return target;
        }

        throw new Error('UI target must be a selector or DOM node.');
    }

    function appendChild(parent, child) {
        const node = createNode(child);
        if (node) {
            parent.appendChild(node);
        }
    }

    function createNode(spec) {
        if (spec === undefined || spec === null || spec === false) {
            return null;
        }

        if (isNode(spec)) {
            return spec;
        }

        if (Array.isArray(spec)) {
            const fragment = document.createDocumentFragment();
            spec.forEach((child) => appendChild(fragment, child));
            return fragment;
        }

        if (typeof spec === 'string' || typeof spec === 'number') {
            return document.createTextNode(String(spec));
        }

        if (typeof spec !== 'object') {
            return document.createTextNode(String(spec));
        }

        const {
            tag = 'div',
            className = '',
            classes = [],
            attrs = {},
            dataset = {},
            style = {},
            text,
            html,
            children = [],
            on = {},
        } = spec;

        const element = document.createElement(tag);
        const resolvedClasses = joinClasses(className, classes);

        if (resolvedClasses) {
            element.className = resolvedClasses;
        }

        Object.entries(attrs).forEach(([key, value]) => {
            if (value === undefined || value === null || value === false) {
                return;
            }

            if (value === true) {
                element.setAttribute(key, key);
                return;
            }

            element.setAttribute(key, String(value));
        });

        Object.entries(dataset).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                element.dataset[key] = String(value);
            }
        });

        Object.entries(style).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                element.style[key] = value;
            }
        });

        Object.entries(on).forEach(([eventName, handler]) => {
            if (typeof handler === 'function') {
                element.addEventListener(eventName, handler);
            }
        });

        if (text !== undefined && text !== null) {
            element.textContent = String(text);
            return element;
        }

        if (html !== undefined && html !== null) {
            element.innerHTML = html;
            return element;
        }

        toArray(children).forEach((child) => appendChild(element, child));
        return element;
    }

    function render(target, spec) {
        const element = resolveTarget(target);
        element.replaceChildren();
        appendChild(element, resolveSpec(spec));
        return element;
    }

    function append(target, spec) {
        const element = resolveTarget(target);
        appendChild(element, resolveSpec(spec));
        return element;
    }

    function isPageLikeDefinition(definition) {
        if (!definition || typeof definition !== 'object') {
            return false;
        }

        if (Array.isArray(definition)) {
            return definition.some((entry) => isPageLikeDefinition(entry));
        }

        const componentName = String(definition.component || '').trim().toLowerCase();
        if (componentName === 'page' || componentName === 'app') {
            return true;
        }

        if (typeof definition.className === 'string' && definition.className.includes('page-container')) {
            return true;
        }

        if (Array.isArray(definition.classes) && definition.classes.some((entry) => String(entry).includes('page-container'))) {
            return true;
        }

        if ('title' in definition || 'subtitle' in definition || 'sections' in definition || 'actions' in definition) {
            return true;
        }

        return false;
    }

    function warnIfMountUsesWrongShell(target, definition) {
        if (!isPageLikeDefinition(definition)) {
            return;
        }

        const element = resolveTarget(target);
        const containerAncestor = element.closest('.container');
        const contentContainer = document.querySelector('#content-container');
        const tabsContainer = document.querySelector('#tabs-container');

        if (!containerAncestor || contentContainer || tabsContainer) {
            return;
        }

        console.warn(
            '[UI] UI.mount rendered a document-style page inside `.container` without `#content-container` or `#tabs-container`. ' +
            '`.container` is the fixed app shell with viewport-locked overflow. Use the document shell instead: ' +
            '`.header` + `#content-container` + `.page-container`, or mount into a plain node outside `.container`.'
        );
    }

    function isRenderableSpec(value) {
        if (value === undefined || value === null) {
            return false;
        }

        if (isNode(value) || Array.isArray(value) || typeof value === 'string' || typeof value === 'number') {
            return true;
        }

        if (typeof value !== 'object') {
            return false;
        }

        return 'tag' in value
            || 'text' in value
            || 'html' in value
            || 'children' in value
            || 'className' in value
            || 'classes' in value;
    }

    function normalizeRenderableSpec(spec) {
        if (!spec || typeof spec !== 'object' || isNode(spec)) {
            return spec;
        }

        if (Array.isArray(spec)) {
            return spec.map((entry) => resolveSpec(entry));
        }

        const normalized = { ...spec };

        if ('children' in normalized) {
            normalized.children = toArray(normalized.children).map((entry) => resolveSpec(entry));
        }

        return normalized;
    }

    function shouldResolveInlineSpec(value) {
        if (value === undefined || value === null || value === false) {
            return false;
        }

        if (Array.isArray(value) || isNode(value) || typeof value === 'string' || typeof value === 'number') {
            return true;
        }

        if (typeof value !== 'object') {
            return false;
        }

        return isRenderableSpec(value) || 'component' in value;
    }

    function shouldResolveRichSpec(value) {
        if (value === undefined || value === null || value === false) {
            return false;
        }

        if (Array.isArray(value) || isNode(value)) {
            return true;
        }

        if (typeof value !== 'object') {
            return false;
        }

        return isRenderableSpec(value) || 'component' in value;
    }

    async function copyToClipboard(value) {
        const text = String(value ?? '');
        if (!navigator?.clipboard?.writeText) {
            throw new Error('Clipboard API unavailable.');
        }

        await navigator.clipboard.writeText(text);
        return text;
    }

    async function performAction(action, fallbackOptions = {}) {
        if (!action || typeof action !== 'object') {
            return;
        }

        const actionType = String(action.type || '').trim().toLowerCase();

        if (actionType === 'copy') {
            const text = action.text ?? action.value ?? fallbackOptions.copyText ?? fallbackOptions.text ?? fallbackOptions.label ?? '';
            await copyToClipboard(text);
            const successMessage = action.successMessage || 'Copied to clipboard.';
            if (window.Toasts?.success) {
                window.Toasts.success(successMessage);
            }
            return;
        }

        if (actionType === 'open') {
            const href = action.href || action.url;
            if (!href) {
                return;
            }

            const target = action.target || '_blank';
            window.open(href, target, action.features || 'noopener,noreferrer');
            return;
        }

        if (actionType === 'modal' && window.ModalsEverywhere) {
            const modalHost = UI.__schemaModals || (UI.__schemaModals = new window.ModalsEverywhere());
            modalHost.show({
                title: action.title || fallbackOptions.label || 'Details',
                content: action.content || '',
                buttons: action.buttons || [{ text: 'Close', action: 'close' }],
            });
            return;
        }

        if (actionType === 'toast' && window.Toasts?.show) {
            window.Toasts.show({
                message: action.message || fallbackOptions.label || 'Toast',
                type: action.toastType || action.variant || action.tone || 'info',
                duration: action.duration,
                position: action.position,
                icon: action.icon,
            });
            return;
        }

        console.warn('[UI] Unsupported declarative action:', action);
    }

    function createActionHandler(action, fallbackOptions = {}) {
        return async (event) => {
            try {
                await performAction(action, fallbackOptions);
            } catch (error) {
                console.error('[UI] Declarative action failed:', error);
                if (window.Toasts?.error) {
                    window.Toasts.error(error.message || 'Action failed.');
                }
                if (event?.preventDefault) {
                    event.preventDefault();
                }
            }
        };
    }

    function normalizeComponentOptions(options = {}) {
        const normalized = { ...options };

        if ('children' in normalized) {
            normalized.children = toArray(normalized.children).map((entry) => (
                shouldResolveInlineSpec(entry) ? resolveSpec(entry) : entry
            ));
        }

        if ('body' in normalized && shouldResolveInlineSpec(normalized.body)) {
            normalized.body = resolveSpec(normalized.body);
        }

        if ('sections' in normalized) {
            normalized.sections = toArray(normalized.sections).map((entry) => (
                shouldResolveInlineSpec(entry) ? resolveSpec(entry) : entry
            ));
        }

        if ('actions' in normalized) {
            normalized.actions = toArray(normalized.actions).map((entry) => (
                shouldResolveInlineSpec(entry) ? resolveSpec(entry) : entry
            ));
        }

        if ('badge' in normalized && shouldResolveInlineSpec(normalized.badge)) {
            normalized.badge = resolveSpec(normalized.badge);
        }

        return normalized;
    }

    function componentFactory(name) {
        const registry = {
            icon,
            text,
            button,
            status,
            alert,
            emptystate: emptyState,
            emptyState,
            stack,
            grid,
            card,
            section,
            stat,
            preview,
            previewscreen: previewScreen,
            'preview-screen': previewScreen,
            scrollviewport: scrollViewport,
            surfacerail: surfaceRail,
            surfacemasthead: surfaceMasthead,
            surfacetoolbar: surfaceToolbar,
            surfacetoolbarrow: surfaceToolbarRow,
            surfacechip: surfaceChip,
            scrollViewport,
            surfaceRail,
            surfaceMasthead,
            surfaceToolbar,
            surfaceToolbarRow,
            surfaceChip,
            pager,
            table,
            chart,
            page,
            app,
        };

        return registry[name] || null;
    }

    function resolveComponentDefinition(definition) {
        const {
            component,
            props = {},
            ...rest
        } = definition || {};
        const componentName = String(component || '').trim().toLowerCase();
        const normalizedOptions = normalizeComponentOptions({
            ...props,
            ...rest,
        });

        if (componentName === 'node' || componentName === 'element') {
            return normalizeRenderableSpec(normalizedOptions);
        }

        if (componentName === 'fragment') {
            return toArray(normalizedOptions.children).map((entry) => resolveSpec(entry));
        }

        if (componentName === 'html') {
            return normalizeRenderableSpec({
                tag: normalizedOptions.tag || 'div',
                className: normalizedOptions.className,
                classes: normalizedOptions.classes,
                attrs: normalizedOptions.attrs,
                dataset: normalizedOptions.dataset,
                style: normalizedOptions.style,
                html: normalizedOptions.html || '',
            });
        }

        if (componentName === 'icon') {
            return icon(
                normalizedOptions.name
                || normalizedOptions.icon
                || normalizedOptions.value
                || '',
                normalizedOptions
            );
        }

        const factory = componentFactory(componentName);
        if (!factory) {
            throw new Error(`Unknown UI component: ${componentName}`);
        }

        return factory(normalizedOptions);
    }

    function resolveSpec(definition) {
        if (definition === undefined || definition === null || definition === false) {
            return definition;
        }

        if (Array.isArray(definition)) {
            return definition.map((entry) => resolveSpec(entry));
        }

        if (typeof definition === 'object' && definition && 'component' in definition) {
            return resolveComponentDefinition(definition);
        }

        if (isRenderableSpec(definition)) {
            return normalizeRenderableSpec(definition);
        }

        if (typeof definition !== 'object') {
            return definition;
        }

        return app(normalizeComponentOptions(definition));
    }

    function icon(name, options = {}) {
        return {
            tag: 'i',
            className: joinClasses(name, options.className),
            attrs: options.attrs,
        };
    }

    function text(options = {}) {
        const role = String(options.role || options.variant || 'body').trim().toLowerCase();
        const roleClassMap = {
            body: 'type-body',
            ui: 'type-ui-title',
            title: 'type-ui-title',
            'ui-title': 'type-ui-title',
            display: 'type-display',
            brand: 'type-brand',
            label: 'type-label',
            eyebrow: 'type-label',
            meta: 'type-label',
        };
        const defaultTagMap = {
            body: 'p',
            ui: 'div',
            title: 'div',
            'ui-title': 'div',
            display: 'div',
            brand: 'div',
            label: 'div',
            eyebrow: 'div',
            meta: 'div',
        };

        return {
            tag: options.tag || defaultTagMap[role] || 'p',
            className: joinClasses(roleClassMap[role] || roleClassMap.body, options.className),
            attrs: options.attrs,
            dataset: options.dataset,
            style: options.style,
            text: options.text,
            html: options.html,
            children: options.children,
        };
    }

    function button(options = {}) {
        const variantMap = {
            primary: 'btn-primary',
            secondary: 'btn-secondary',
            danger: 'btn-danger',
            cancel: 'btn-cancel',
            link: 'btn-link',
        };
        const variantClass = variantMap[options.variant || 'primary'] || variantMap.primary;
        const iconSpec = options.icon ? icon(options.icon) : null;
        const clickHandler = options.onClick || (options.action ? createActionHandler(options.action, options) : null);

        return {
            tag: 'button',
            className: joinClasses(variantClass, iconSpec ? 'btn-with-icon' : '', options.className),
            attrs: { type: 'button', ...(options.attrs || {}) },
            dataset: options.dataset,
            style: options.style,
            on: clickHandler ? { ...(options.on || {}), click: clickHandler } : options.on,
            children: [iconSpec, options.label || options.text || 'Button'],
        };
    }

    function status(options = {}) {
        const tone = options.tone || 'info';
        return {
            tag: 'span',
            className: joinClasses('status-badge', `status-${tone}`, options.className),
            text: options.label || options.text || tone,
        };
    }

    function alert(options = {}) {
        const tone = options.tone || 'info';
        return {
            tag: 'div',
            className: joinClasses('alert', `alert-${tone}`, options.className),
            children: [
                icon(options.icon || defaultAlertIcon(tone)),
                {
                    tag: 'div',
                    children: [
                        options.title ? { tag: 'strong', text: options.title } : null,
                        options.message ? { tag: 'span', text: options.message } : null,
                    ],
                },
            ],
        };
    }

    function emptyState(options = {}) {
        const messageSpec = shouldResolveRichSpec(options.message)
            ? resolveSpec(options.message)
            : {
                tag: options.messageTag || 'p',
                className: joinClasses('surface-empty-state__message', options.messageClassName),
                text: options.message || options.text || 'Nothing to show.',
            };

        return {
            tag: options.tag || 'div',
            className: joinClasses(
                'surface-empty-state',
                options.scroll ? 'surface-empty-state--scroll' : '',
                options.fill ? 'surface-empty-state--fill' : '',
                options.className
            ),
            attrs: options.attrs,
            dataset: options.dataset,
            style: options.style,
            children: [
                options.icon ? icon(options.icon, { className: 'surface-empty-state__icon' }) : null,
                options.title ? {
                    tag: options.titleTag || 'strong',
                    className: joinClasses('surface-empty-state__title', options.titleClassName),
                    text: options.title,
                } : null,
                messageSpec,
                ...(options.children ? toArray(options.children).map((entry) => (
                    shouldResolveInlineSpec(entry) ? resolveSpec(entry) : entry
                )) : []),
            ],
        };
    }

    function stack(options = {}) {
        return {
            tag: options.tag || 'div',
            className: joinClasses('grid', `gap-${options.gap || 'md'}`, options.className),
            attrs: options.attrs,
            dataset: options.dataset,
            style: options.style,
            children: options.children || [],
        };
    }

    function grid(options = {}) {
        const columns = options.columns || 2;
        const gridClass = columns === 'auto' ? 'grid-auto' : `grid-${columns}`;
        return {
            tag: options.tag || 'div',
            className: joinClasses(gridClass, `gap-${options.gap || 'md'}`, options.className),
            attrs: options.attrs,
            dataset: options.dataset,
            style: options.style,
            children: options.children || [],
        };
    }

    function card(options = {}) {
        const actions = toArray(options.actions).map((action) => (
            action?.tag ? action : button(action)
        ));
        const bodyChildren = [];
        const titleSpec = shouldResolveRichSpec(options.title)
            ? resolveSpec(options.title)
            : (options.title ? {
                tag: 'div',
                className: 'card-title',
                children: [options.icon ? icon(options.icon) : null, options.title],
            } : null);
        const subtitleSpec = shouldResolveRichSpec(options.subtitle)
            ? resolveSpec(options.subtitle)
            : (options.subtitle ? { tag: 'div', className: 'card-subtitle', text: options.subtitle } : null);

        if (options.body !== undefined) {
            bodyChildren.push(options.body);
        }

        if (options.children) {
            bodyChildren.push(...toArray(options.children));
        }

        return {
            tag: 'div',
            className: joinClasses('card', options.className),
            attrs: options.attrs,
            dataset: options.dataset,
            style: options.style,
            children: [
                titleSpec || subtitleSpec ? {
                    tag: 'div',
                    className: 'mb-md',
                    children: [
                        titleSpec,
                        subtitleSpec,
                    ],
                } : null,
                bodyChildren,
                actions.length > 0 ? {
                    tag: 'div',
                    className: 'row-wrap gap-sm mt-md',
                    children: actions,
                } : null,
            ],
        };
    }

    function section(options = {}) {
        const actions = toArray(options.actions).map((action) => (
            action?.tag ? action : button(action)
        ));
        const bodyChildren = [];
        const eyebrowSpec = shouldResolveRichSpec(options.eyebrow)
            ? resolveSpec(options.eyebrow)
            : (options.eyebrow ? { tag: 'div', className: 'type-label text-muted mb-sm', text: options.eyebrow } : null);
        const titleSpec = shouldResolveRichSpec(options.title)
            ? resolveSpec(options.title)
            : (options.title ? { tag: 'h2', text: options.title } : null);
        const descriptionSpec = shouldResolveRichSpec(options.description)
            ? resolveSpec(options.description)
            : (options.description ? { tag: 'p', className: 'type-body text-secondary', text: options.description } : null);

        if (options.body !== undefined) {
            bodyChildren.push(options.body);
        }

        if (options.children) {
            bodyChildren.push(...toArray(options.children));
        }

        return {
            tag: options.tag || 'section',
            className: joinClasses('card', options.className),
            attrs: options.attrs,
            dataset: options.dataset,
            style: options.style,
            children: [
                eyebrowSpec || titleSpec || descriptionSpec ? {
                    tag: 'div',
                    className: 'mb-md',
                    children: [
                        eyebrowSpec,
                        titleSpec,
                        descriptionSpec,
                    ],
                } : null,
                ...bodyChildren,
                actions.length > 0 ? {
                    tag: 'div',
                    className: 'row-wrap gap-sm mt-md',
                    children: actions,
                } : null,
            ],
        };
    }

    function stat(options = {}) {
        const value = options.value ?? options.text ?? '0';
        const badgeSpec = options.badge
            ? (options.badge.tag ? options.badge : status(options.badge))
            : null;

        return {
            tag: 'div',
            className: joinClasses('card', options.className),
            attrs: options.attrs,
            dataset: options.dataset,
            style: options.style,
            children: [
                options.label ? { tag: 'div', className: 'type-label text-secondary mb-sm', text: options.label } : null,
                {
                    tag: 'div',
                    className: 'grid-row gap-sm',
                    style: {
                        alignItems: 'center',
                        fontSize: 'var(--text-3xl)',
                        fontWeight: 'var(--weight-bold)',
                    },
                    children: [options.icon ? icon(options.icon) : null, value],
                },
                options.caption ? { tag: 'div', className: 'text-muted mt-sm', text: options.caption } : null,
                badgeSpec ? { tag: 'div', className: 'mt-sm', children: [badgeSpec] } : null,
            ],
        };
    }

    function preview(options = {}) {
        const interactive = options.interactive !== false;
        const width = toCssSize(options.width, '120px');
        const height = toCssSize(options.height, '80px');
        const state = String(options.state || 'idle').trim().toLowerCase();
        const tag = interactive ? 'button' : 'div';
        const imageStateClass = state === 'loaded' ? 'is-loaded' : 'is-placeholder';
        const statusLabel = options.statusLabel
            || (state === 'unavailable' ? (options.unavailableLabel || 'Unavailable') : '');
        const imageAttrs = {
            alt: options.alt || '',
            src: options.src || PREVIEW_PLACEHOLDER_URL,
            loading: options.loading || 'lazy',
            decoding: options.decoding || 'async',
            ...options.imageAttrs,
        };
        const imageDataset = {
            ...(options.imageDataset || {}),
            previewSrc: options.previewSrc || options.imageDataset?.previewSrc || '',
        };

        return {
            tag,
            className: joinClasses(
                'ui-preview',
                interactive ? 'ui-preview--button' : '',
                state === 'loading' ? 'is-loading' : '',
                state === 'unavailable' ? 'is-unavailable' : '',
                options.className
            ),
            attrs: {
                ...(interactive ? { type: 'button' } : {}),
                ...options.attrs,
            },
            dataset: {
                previewState: state,
                ...(options.dataset || {}),
            },
            style: {
                '--ui-preview-width': width,
                '--ui-preview-height': height,
                ...options.style,
            },
            on: {
                ...(options.on || {}),
                ...(typeof options.onClick === 'function' ? { click: options.onClick } : {}),
            },
            children: [
                {
                    tag: 'span',
                    className: 'ui-preview__frame',
                    children: [{
                        tag: 'img',
                        className: joinClasses('ui-preview__img', imageStateClass, options.imageClassName),
                        attrs: imageAttrs,
                        dataset: imageDataset,
                    }],
                },
                {
                    tag: 'span',
                    className: 'ui-preview__status',
                    attrs: { 'aria-hidden': 'true' },
                    text: statusLabel,
                },
            ],
        };
    }

    function previewScreen(options = {}) {
        const actions = toArray(options.actions).map((action) => (
            action?.tag ? action : button(action)
        ));
        const openActionSpec = options.openHref ? button({
            label: options.openLabel || 'Open',
            variant: 'secondary',
            icon: options.openIcon || 'ti ti-arrow-up-right',
            action: {
                type: 'open',
                href: options.openHref,
                target: options.openTarget || '_blank',
            },
        }) : null;

        if (openActionSpec) {
            actions.unshift(openActionSpec);
        }

        const mediaWrapperStyle = {
            width: '100%',
            minHeight: toCssSize(options.minHeight, '240px'),
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-md)',
            background: 'var(--bg-secondary)',
            overflow: 'hidden',
        };

        let mediaSpec;
        if (options.videoSrc) {
            mediaSpec = {
                tag: 'video',
                attrs: {
                    src: options.videoSrc,
                    poster: options.poster || '',
                    preload: options.preload || 'metadata',
                    controls: true,
                    playsinline: true,
                },
                style: {
                    display: 'block',
                    width: '100%',
                    minHeight: toCssSize(options.minHeight, '240px'),
                    background: 'var(--bg-secondary)',
                },
            };
        } else if (options.iframeSrc || options.src) {
            mediaSpec = {
                tag: 'iframe',
                attrs: {
                    src: options.iframeSrc || options.src,
                    title: options.mediaTitle || options.title || 'Preview',
                    loading: options.loading || 'lazy',
                    referrerpolicy: options.referrerPolicy || 'no-referrer',
                },
                style: {
                    display: 'block',
                    width: '100%',
                    minHeight: toCssSize(options.minHeight, '240px'),
                    border: '0',
                    background: 'var(--bg-secondary)',
                },
            };
        } else {
            mediaSpec = {
                tag: 'img',
                attrs: {
                    src: options.poster || options.imageSrc || PREVIEW_PLACEHOLDER_URL,
                    alt: options.mediaAlt || options.title || options.label || 'Preview still',
                    loading: options.loading || 'lazy',
                    decoding: 'async',
                },
                style: {
                    display: 'block',
                    width: '100%',
                    minHeight: toCssSize(options.minHeight, '240px'),
                    objectFit: 'cover',
                    background: 'var(--bg-secondary)',
                },
            };
        }

        return {
            tag: options.tag || 'article',
            className: joinClasses('card', options.className),
            attrs: options.attrs,
            dataset: options.dataset,
            style: options.style,
            children: [
                options.title || options.subtitle || options.caption ? {
                    tag: 'div',
                    className: 'grid-between gap-sm mb-md',
                    style: {
                        alignItems: 'start',
                    },
                    children: [
                        {
                            tag: 'div',
                            children: [
                                options.title ? {
                                    tag: 'div',
                                    className: 'card-title',
                                    text: options.title,
                                } : null,
                                options.subtitle ? {
                                    tag: 'div',
                                    className: 'card-subtitle',
                                    text: options.subtitle,
                                } : null,
                            ],
                        },
                        options.caption ? {
                            tag: 'div',
                            className: 'type-label text-muted',
                            text: options.caption,
                        } : null,
                    ],
                } : null,
                {
                    tag: 'div',
                    className: 'mb-md',
                    style: mediaWrapperStyle,
                    children: [mediaSpec],
                },
                options.label || options.readOnly !== undefined ? {
                    tag: 'div',
                    className: 'grid-between gap-sm mb-md',
                    style: {
                        alignItems: 'center',
                    },
                    children: [
                        options.label ? {
                            tag: 'div',
                            className: 'type-label text-muted',
                            text: options.label,
                        } : null,
                        options.readOnly !== undefined ? status({
                            label: options.readOnly ? 'Read only' : 'Interactive',
                            tone: 'info',
                        }) : null,
                    ],
                } : null,
                actions.length > 0 ? {
                    tag: 'div',
                    className: 'grid-row gap-sm',
                    children: actions,
                } : null,
            ],
        };
    }

    function getPreviewShell(target) {
        if (!target) {
            return null;
        }

        return target.classList?.contains('ui-preview')
            ? target
            : target.closest?.('.ui-preview') || null;
    }

    function getPreviewImage(target) {
        const shell = getPreviewShell(target);
        return shell?.querySelector('.ui-preview__img') || null;
    }

    function getPreviewStatus(target) {
        const shell = getPreviewShell(target);
        return shell?.querySelector('.ui-preview__status') || null;
    }

    function setPreviewState(target, nextState, options = {}) {
        const shell = getPreviewShell(target);
        if (!shell) {
            return null;
        }

        const state = String(nextState || 'idle').trim().toLowerCase();
        const statusNode = getPreviewStatus(shell);
        const label = options.label
            ?? (state === 'unavailable' ? (options.unavailableLabel || 'Unavailable') : '');

        shell.dataset.previewState = state;
        shell.classList.toggle('is-loading', state === 'loading');
        shell.classList.toggle('is-unavailable', state === 'unavailable');

        if (typeof options.title === 'string') {
            shell.title = options.title;
        }

        if (typeof options.ariaLabel === 'string') {
            shell.setAttribute('aria-label', options.ariaLabel);
        }

        if (statusNode) {
            statusNode.textContent = label;
        }

        return shell;
    }

    function applyPreviewPlaceholder(target, options = {}) {
        const shell = getPreviewShell(target);
        const image = getPreviewImage(target);
        if (!shell || !image) {
            return null;
        }

        image.src = options.src || PREVIEW_PLACEHOLDER_URL;
        if (typeof options.alt === 'string') {
            image.alt = options.alt;
        }
        image.dataset.previewState = 'placeholder';
        image.classList.add('is-placeholder');
        image.classList.remove('is-loaded', 'is-failed');
        setPreviewState(shell, options.state || 'idle', options);
        return shell;
    }

    function applyPreviewLoaded(target, url, options = {}) {
        const shell = getPreviewShell(target);
        const image = getPreviewImage(target);
        if (!shell || !image) {
            return null;
        }

        image.src = url;
        image.dataset.previewSrc = url;
        image.dataset.previewState = 'loaded';
        if (typeof options.alt === 'string') {
            image.alt = options.alt;
        }
        image.classList.add('is-loaded');
        image.classList.remove('is-placeholder', 'is-failed');
        setPreviewState(shell, 'loaded', { ...options, label: '' });
        return shell;
    }

    function applyPreviewUnavailable(target, options = {}) {
        const shell = getPreviewShell(target);
        const image = getPreviewImage(target);
        if (!shell) {
            return null;
        }

        if (image) {
            image.src = options.src || PREVIEW_PLACEHOLDER_URL;
            image.dataset.previewSrc = '';
            image.dataset.previewState = 'error';
            image.classList.add('is-placeholder', 'is-failed');
            image.classList.remove('is-loaded');
            if (typeof options.alt === 'string') {
                image.alt = options.alt;
            }
        }

        setPreviewState(shell, 'unavailable', options);
        return shell;
    }

    function loadPreview(target, url, options = {}) {
        const shell = getPreviewShell(target);
        const image = getPreviewImage(target);
        if (!shell || !image) {
            return Promise.resolve({ ok: false, reason: 'missing-preview-node' });
        }

        if (!url) {
            applyPreviewUnavailable(shell, options);
            return Promise.resolve({ ok: false, reason: 'missing-url' });
        }

        if (image.dataset.previewLoadedUrl === url) {
            return Promise.resolve({ ok: true, cached: true, url });
        }

        setPreviewState(shell, 'loading', options);

        return new Promise((resolve) => {
            image.onload = () => {
                image.dataset.previewLoadedUrl = url;
                applyPreviewLoaded(shell, url, options);
                resolve({ ok: true, url });
            };
            image.onerror = () => {
                delete image.dataset.previewLoadedUrl;
                applyPreviewUnavailable(shell, options);
                resolve({ ok: false, reason: 'load-error', url });
            };
            image.src = url;
        });
    }

    function observePreviewTargets(targets, options = {}) {
        const items = Array.from(targets || []).filter(Boolean);
        if (items.length === 0) {
            return { disconnect() {} };
        }

        const reveal = typeof options.onReveal === 'function'
            ? options.onReveal
            : () => {};

        if (typeof IntersectionObserver !== 'function') {
            items.forEach((item) => reveal(item));
            return { disconnect() {} };
        }

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) {
                    return;
                }

                observer.unobserve(entry.target);
                reveal(entry.target);
            });
        }, {
            root: options.root || null,
            rootMargin: options.rootMargin || '200px 0px',
            threshold: options.threshold ?? 0.01,
        });

        items.forEach((item) => observer.observe(item));
        return observer;
    }

    function scrollViewport(options = {}) {
        const reserve = toCssSize(options.reserve, '72px');

        return {
            tag: options.tag || 'div',
            className: joinClasses('surface-scroll-viewport', options.className),
            attrs: options.attrs,
            dataset: options.dataset,
            style: {
                '--surface-scroll-viewport-reserve': reserve,
                ...options.style,
            },
            children: options.children,
        };
    }

    function surfaceRail(options = {}) {
        const placement = String(options.placement || options.position || 'inline').trim().toLowerCase();

        return {
            tag: options.tag || 'div',
            className: joinClasses(
                'surface-rail',
                placement === 'footer' ? 'surface-rail--footer' : '',
                options.className
            ),
            attrs: options.attrs,
            dataset: options.dataset,
            style: options.style,
            children: options.children,
        };
    }

    function surfaceMasthead(options = {}) {
        const brand = shouldResolveInlineSpec(options.brand) ? resolveSpec(options.brand) : options.brand;
        const search = shouldResolveInlineSpec(options.search) ? resolveSpec(options.search) : options.search;
        const actions = toArray(options.actions).map((entry) => (
            shouldResolveInlineSpec(entry) ? resolveSpec(entry) : entry
        ));

        return {
            tag: options.tag || 'header',
            className: joinClasses('surface-masthead', options.className),
            attrs: options.attrs,
            dataset: options.dataset,
            style: options.style,
            children: [
                {
                    tag: 'div',
                    className: 'surface-masthead__brand',
                    children: brand ? [brand] : [],
                },
                {
                    tag: 'div',
                    className: 'surface-masthead__search-slot',
                    children: search ? [search] : [],
                },
                {
                    tag: 'div',
                    className: 'surface-masthead__actions',
                    children: actions,
                },
            ],
        };
    }

    function surfaceToolbar(options = {}) {
        return {
            tag: options.tag || 'section',
            className: joinClasses('surface-toolbar', options.className),
            attrs: options.attrs,
            dataset: options.dataset,
            style: options.style,
            children: options.children,
        };
    }

    function surfaceToolbarRow(options = {}) {
        const layout = String(options.layout || options.variant || '').trim().toLowerCase();
        const isSplit = options.split === true || layout === 'split';

        return {
            tag: options.tag || 'div',
            className: joinClasses(
                'surface-toolbar__row',
                isSplit ? 'surface-toolbar__row--split' : '',
                options.className
            ),
            attrs: options.attrs,
            dataset: options.dataset,
            style: options.style,
            children: options.children,
        };
    }

    function surfaceChip(options = {}) {
        const interactive = options.interactive !== false;
        const tag = options.tag || (interactive ? 'button' : 'span');
        const tone = String(options.tone || '').trim().toLowerCase();
        const isActive = options.active === true || options.selected === true;
        const children = [];

        if (options.icon) {
            children.push(icon(options.icon));
        }

        if (options.glyph) {
            children.push({
                tag: 'span',
                className: 'surface-chip__glyph',
                attrs: { 'aria-hidden': 'true' },
                text: options.glyph,
            });
        }

        if (options.label !== undefined && options.label !== null) {
            children.push({
                tag: 'span',
                text: String(options.label),
            });
        }

        if (options.count !== undefined && options.count !== null && options.count !== '') {
            children.push({
                tag: 'span',
                className: 'surface-chip__count',
                text: String(options.count),
            });
        }

        if (options.children) {
            children.push(...toArray(options.children).map((entry) => (
                shouldResolveInlineSpec(entry) ? resolveSpec(entry) : entry
            )));
        }

        return {
            tag,
            className: joinClasses(
                'surface-chip',
                tone === 'quiet' ? 'surface-chip--quiet' : '',
                tone === 'manager' ? 'surface-chip--manager' : '',
                tone === 'selection' ? 'surface-chip--selection' : '',
                isActive ? 'is-active' : '',
                options.className
            ),
            attrs: {
                ...(interactive && tag === 'button' ? { type: 'button' } : {}),
                ...options.attrs,
            },
            dataset: options.dataset,
            style: options.style,
            on: {
                ...(options.on || {}),
                ...(typeof options.onClick === 'function' ? { click: options.onClick } : {}),
            },
            children,
        };
    }

    function pager(options = {}) {
        const page = Math.max(1, Number(options.page || 1));
        const pageCount = Math.max(1, Number(options.pageCount || 1));
        const summarySpec = shouldResolveRichSpec(options.summary)
            ? resolveSpec(options.summary)
            : { tag: 'div', className: 'pager__summary', text: options.summary || '' };
        const statusSpec = shouldResolveRichSpec(options.status)
            ? resolveSpec(options.status)
            : { tag: 'span', className: 'pager__status', text: options.status || `Page ${page} of ${pageCount}` };

        return {
            tag: 'div',
            className: joinClasses('pager', options.className),
            attrs: options.attrs,
            dataset: options.dataset,
            style: options.style,
            children: [
                summarySpec,
                {
                    tag: 'div',
                    className: 'pager__controls',
                    children: [
                        options.before ? resolveSpec(options.before) : null,
                        options.showPrev === false ? null : button({
                            label: options.prevLabel || 'Prev',
                            variant: 'secondary',
                            icon: options.prevIcon || 'ti ti-chevron-left',
                            className: 'pager__button',
                            attrs: {
                                'aria-label': options.prevAriaLabel || 'Previous page',
                                ...(page <= 1 ? { disabled: true } : {}),
                            },
                            onClick: options.onPrev,
                        }),
                        statusSpec,
                        options.showNext === false ? null : button({
                            label: options.nextLabel || 'Next',
                            variant: 'secondary',
                            icon: options.nextIcon || 'ti ti-chevron-right',
                            className: 'pager__button',
                            attrs: {
                                'aria-label': options.nextAriaLabel || 'Next page',
                                ...(page >= pageCount ? { disabled: true } : {}),
                            },
                            onClick: options.onNext,
                        }),
                        options.after ? resolveSpec(options.after) : null,
                    ],
                },
            ],
        };
    }

    function table(options = {}) {
        const columns = toArray(options.columns);
        const rows = toArray(options.rows);
        const headerCells = columns.map((column) => ({
            tag: 'th',
            text: typeof column === 'string' ? column : column.label || column.key || '',
        }));
        let bodyRows;

        if (rows.length === 0) {
            bodyRows = [{
                tag: 'tr',
                children: [{
                    tag: 'td',
                    attrs: { colspan: String(columns.length || 1) },
                    style: { textAlign: 'center', color: 'var(--text-muted)' },
                    text: options.emptyMessage || 'No rows',
                }],
            }];
        } else {
            bodyRows = rows.map((row) => ({
                tag: 'tr',
                children: columns.map((column) => {
                    if (typeof column === 'string') {
                        return { tag: 'td', text: row[column] ?? '' };
                    }

                    if (typeof column.render === 'function') {
                        return { tag: 'td', children: [column.render(row, UI)] };
                    }

                    return { tag: 'td', text: row[column.key] ?? '' };
                }),
            }));
        }

        return {
            tag: 'div',
            className: joinClasses('table-container', options.className),
            attrs: options.attrs,
            dataset: options.dataset,
            style: options.style,
            children: [{
                tag: 'table',
                className: 'data-table',
                children: [
                    { tag: 'thead', children: [{ tag: 'tr', children: headerCells }] },
                    { tag: 'tbody', children: bodyRows },
                ],
            }],
        };
    }

    function chart(options = {}) {
        const variant = String(options.variant || 'bar').trim().toLowerCase();
        const labels = toArray(options.labels).map((label, index) => String(label ?? `Item ${index + 1}`));
        const series = toArray(options.series)
            .map((value) => Number(value))
            .filter((value) => Number.isFinite(value));

        if (series.length === 0) {
            return card({
                ...options,
                title: options.title || 'Chart',
                body: alert({
                    tone: 'warning',
                    title: 'No Data',
                    message: options.emptyMessage || 'Add numeric series values to render a chart.',
                }),
            });
        }

        const chartMarkup = variant === 'line'
            ? buildLineChartMarkup(labels, series, options)
            : buildBarChartMarkup(labels, series, options);

        return {
            tag: 'div',
            className: joinClasses('card', options.className),
            attrs: options.attrs,
            dataset: options.dataset,
            style: options.style,
            children: [
                options.title || options.subtitle ? {
                    tag: 'div',
                    className: 'mb-md',
                    children: [
                        options.title ? {
                            tag: 'div',
                            className: 'card-title',
                            children: [options.icon ? icon(options.icon) : null, options.title],
                        } : null,
                        options.subtitle ? { tag: 'div', className: 'card-subtitle', text: options.subtitle } : null,
                    ],
                } : null,
                {
                    tag: 'div',
                    html: chartMarkup,
                },
                options.caption ? { tag: 'div', className: 'text-muted mt-sm', text: options.caption } : null,
            ],
        };
    }

    function page(options = {}) {
        const actions = toArray(options.actions).map((action) => (
            action?.tag ? action : button(action)
        ));
        const shellTitle = typeof options.title === 'string' ? options.title : '';
        const shellDescription = typeof options.subtitle === 'string' ? options.subtitle : '';
        const titleSpec = shouldResolveRichSpec(options.title)
            ? resolveSpec(options.title)
            : {
                tag: 'h1',
                children: [options.icon ? icon(options.icon) : null, options.title || 'Page'],
            };
        const subtitleSpec = shouldResolveRichSpec(options.subtitle)
            ? resolveSpec(options.subtitle)
            : (options.subtitle ? { tag: 'p', className: 'type-body text-secondary', text: options.subtitle } : null);

        const pageSpec = {
            tag: 'div',
            className: joinClasses('page-container', 'ui-page-root', options.className),
            attrs: options.attrs,
            dataset: options.dataset,
            style: options.style,
            children: [
                {
                    tag: 'div',
                    className: 'ui-page-heading grid-between mb-lg',
                    children: [
                        {
                            tag: 'div',
                            children: [
                                titleSpec,
                                subtitleSpec,
                            ],
                        },
                        actions.length > 0 ? {
                            tag: 'div',
                            className: 'grid-row gap-sm',
                            children: actions,
                        } : null,
                    ],
                },
                ...(options.children ? toArray(options.children) : []),
            ],
        };

        pageSpec.__uiShellPage = {
            title: shellTitle,
            description: shellDescription,
            actions,
        };

        return pageSpec;
    }

    function app(options = {}) {
        const childItems = [];

        if (options.children) {
            childItems.push(...toArray(options.children));
        }

        if (options.sections) {
            childItems.push(...toArray(options.sections).map((entry) => (
                isRenderableSpec(entry) ? entry : section(entry)
            )));
        }

        return page({
            ...options,
            children: childItems,
        });
    }

    function mount(target, definition) {
        warnIfMountUsesWrongShell(target, definition);
        const spec = resolveSpec(definition);
        return render(target, spec);
    }

    function defaultAlertIcon(tone) {
        const iconMap = {
            success: 'ti ti-check',
            error: 'ti ti-alert-circle',
            warning: 'ti ti-alert-triangle',
            info: 'ti ti-info-circle',
        };

        return iconMap[tone] || iconMap.info;
    }

    function buildBarChartMarkup(labels, series, options = {}) {
        const width = Number(options.width || 560);
        const height = Number(options.height || 220);
        const paddingX = 28;
        const paddingTop = 18;
        const paddingBottom = 42;
        const chartHeight = height - paddingTop - paddingBottom;
        const chartWidth = width - (paddingX * 2);
        const maxValue = Math.max(...series, 1);
        const barGap = Number(options.barGap || 16);
        const barWidth = Math.max(18, (chartWidth - (barGap * Math.max(series.length - 1, 0))) / series.length);

        const bars = series.map((value, index) => {
            const scaledHeight = maxValue === 0 ? 0 : (value / maxValue) * chartHeight;
            const x = paddingX + (index * (barWidth + barGap));
            const y = paddingTop + (chartHeight - scaledHeight);
            const label = escapeHtml(labels[index] || `Item ${index + 1}`);
            const tone = index % 2 === 0 ? 'var(--color-primary)' : 'var(--color-secondary)';

            return `
                <rect x="${x}" y="${y}" width="${barWidth}" height="${scaledHeight}" rx="8" fill="${tone}" opacity="0.9"></rect>
                <text x="${x + (barWidth / 2)}" y="${y - 8}" text-anchor="middle" font-size="12" fill="var(--text-secondary)">${escapeHtml(String(value))}</text>
                <text x="${x + (barWidth / 2)}" y="${height - 16}" text-anchor="middle" font-size="12" fill="var(--text-muted)">${label}</text>
            `;
        }).join('');

        return `
            <svg viewBox="0 0 ${width} ${height}" role="img" aria-label="${escapeHtml(options.ariaLabel || 'Bar chart')}" xmlns="http://www.w3.org/2000/svg" style="width: 100%; height: auto; display: block;">
                <rect x="0" y="0" width="${width}" height="${height}" rx="16" fill="var(--bg-secondary)"></rect>
                <line x1="${paddingX}" y1="${paddingTop + chartHeight}" x2="${width - paddingX}" y2="${paddingTop + chartHeight}" stroke="var(--border-color)" stroke-width="1"></line>
                ${bars}
            </svg>
        `;
    }

    function buildLineChartMarkup(labels, series, options = {}) {
        const width = Number(options.width || 560);
        const height = Number(options.height || 220);
        const paddingX = 28;
        const paddingTop = 18;
        const paddingBottom = 38;
        const chartHeight = height - paddingTop - paddingBottom;
        const chartWidth = width - (paddingX * 2);
        const maxValue = Math.max(...series, 1);
        const step = series.length === 1 ? 0 : chartWidth / (series.length - 1);

        const points = series.map((value, index) => {
            const x = paddingX + (step * index);
            const y = paddingTop + (chartHeight - ((value / maxValue) * chartHeight));
            return { x, y, value, label: labels[index] || `Item ${index + 1}` };
        });

        const polyline = points.map((point) => `${point.x},${point.y}`).join(' ');
        const circles = points.map((point) => `
            <circle cx="${point.x}" cy="${point.y}" r="5" fill="var(--color-primary)"></circle>
            <text x="${point.x}" y="${point.y - 10}" text-anchor="middle" font-size="12" fill="var(--text-secondary)">${escapeHtml(String(point.value))}</text>
            <text x="${point.x}" y="${height - 12}" text-anchor="middle" font-size="12" fill="var(--text-muted)">${escapeHtml(point.label)}</text>
        `).join('');

        return `
            <svg viewBox="0 0 ${width} ${height}" role="img" aria-label="${escapeHtml(options.ariaLabel || 'Line chart')}" xmlns="http://www.w3.org/2000/svg" style="width: 100%; height: auto; display: block;">
                <rect x="0" y="0" width="${width}" height="${height}" rx="16" fill="var(--bg-secondary)"></rect>
                <line x1="${paddingX}" y1="${paddingTop + chartHeight}" x2="${width - paddingX}" y2="${paddingTop + chartHeight}" stroke="var(--border-color)" stroke-width="1"></line>
                <polyline fill="none" stroke="var(--color-primary)" stroke-width="3" points="${polyline}"></polyline>
                ${circles}
            </svg>
        `;
    }

    function escapeHtml(value) {
        return String(value ?? '')
            .replaceAll('&', '&amp;')
            .replaceAll('<', '&lt;')
            .replaceAll('>', '&gt;')
            .replaceAll('"', '&quot;')
            .replaceAll("'", '&#39;');
    }

    UI.createNode = createNode;
    UI.resolveSpec = resolveSpec;
    UI.render = render;
    UI.append = append;
    UI.icon = icon;
    UI.text = text;
    UI.button = button;
    UI.status = status;
    UI.alert = alert;
    UI.emptyState = emptyState;
    UI.stack = stack;
    UI.grid = grid;
    UI.card = card;
    UI.section = section;
    UI.stat = stat;
    UI.preview = preview;
    UI.previewScreen = previewScreen;
    UI.scrollViewport = scrollViewport;
    UI.surfaceRail = surfaceRail;
    UI.surfaceMasthead = surfaceMasthead;
    UI.surfaceToolbar = surfaceToolbar;
    UI.surfaceToolbarRow = surfaceToolbarRow;
    UI.surfaceChip = surfaceChip;
    UI.pager = pager;
    UI.table = table;
    UI.chart = chart;
    UI.page = page;
    UI.app = app;
    UI.mount = mount;
    UI.previews = {
        placeholderUrl: PREVIEW_PLACEHOLDER_URL,
        preview,
        getShell: getPreviewShell,
        getImage: getPreviewImage,
        setState: setPreviewState,
        applyPlaceholder: applyPreviewPlaceholder,
        applyLoaded: applyPreviewLoaded,
        applyUnavailable: applyPreviewUnavailable,
        load: loadPreview,
        observe: observePreviewTargets,
    };
    UI.copyToClipboard = copyToClipboard;
    UI.performAction = performAction;
    UI.components = {
        icon,
        text,
        button,
        status,
        alert,
        emptyState,
        stack,
        grid,
        card,
        section,
        stat,
        preview,
        scrollViewport,
        surfaceRail,
        surfaceMasthead,
        surfaceToolbar,
        surfaceToolbarRow,
        surfaceChip,
        pager,
        table,
        chart,
        page,
        app,
        mount,
    };
})(window, document);
