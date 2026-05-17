(function(window, document) {
    'use strict';

    const UI = window.UI || (window.UI = {});

    const VALID_THEMES = new Set(['active', 'blackwhite', 'blue', 'cyberblue', 'cyberpink', 'editorial', 'ghoul', 'green', 'indigo', 'mac', 'mockup', 'monochrome', 'ocean', 'orange', 'pastelzom', 'precog', 'pumpkin', 'red', 'sunset', 'terminal', 'violet', 'walmart', 'windows31', 'yellow']);
    const VALID_COMPONENTS = new Set([
        'icon',
        'text',
        'button',
        'status',
        'alert',
        'emptyState',
        'stack',
        'grid',
        'card',
        'section',
        'stat',
        'preview',
        'previewscreen',
        'preview-screen',
        'pager',
        'scrollViewport',
        'surfaceRail',
        'surfaceMasthead',
        'surfaceToolbar',
        'surfaceToolbarRow',
        'surfaceChip',
        'table',
        'chart',
        'page',
        'app',
        'node',
        'element',
        'fragment',
    ]);
    const VALID_ACTION_TYPES = new Set(['copy', 'open', 'modal', 'toast']);
    const SAFE_TAGS = new Set([
        'a',
        'article',
        'blockquote',
        'br',
        'code',
        'div',
        'em',
        'footer',
        'h1',
        'h2',
        'h3',
        'h4',
        'h5',
        'h6',
        'header',
        'hr',
        'iframe',
        'img',
        'li',
        'main',
        'ol',
        'p',
        'pre',
        'section',
        'small',
        'span',
        'strong',
        'ul',
    ]);
    const DOCUMENT_KEYS = new Set(['$schema', 'version', 'title', 'description', 'theme', 'preset', 'presetOptions', 'page', 'meta']);
    const RENDER_QUERY_KEYS = ['source', 'page', 'spec', 'spec64', 'preset'];

    function hasRenderRequest(search = window.location.search) {
        const params = new URLSearchParams(search);
        return RENDER_QUERY_KEYS.some((key) => params.has(key));
    }

    async function loadDocumentFromLocation(locationLike = window.location) {
        const params = new URLSearchParams(locationLike.search);
        const source = params.get('source') || params.get('page');

        if (source) {
            return fetchContract(source, locationLike.href);
        }

        if (params.has('spec64')) {
            return parseInlineContract(params.get('spec64'), { base64Only: true });
        }

        if (params.has('spec')) {
            return parseInlineContract(params.get('spec'));
        }

        if (params.has('preset')) {
            return {
                version: 1,
                preset: params.get('preset'),
            };
        }

        return null;
    }

    async function fetchContract(source, baseHref = window.location.href) {
        let resolvedUrl;

        try {
            resolvedUrl = new URL(source, baseHref);
        } catch {
            throw new Error(`Invalid contract source URL: ${source}`);
        }

        const response = await fetch(resolvedUrl.href, {
            credentials: 'omit',
            headers: {
                Accept: 'application/json, text/plain;q=0.8, */*;q=0.5',
            },
        });

        if (!response.ok) {
            throw new Error(`Failed to load contract from ${resolvedUrl.href} (${response.status}).`);
        }

        try {
            return await response.json();
        } catch {
            throw new Error(`Contract source did not return valid JSON: ${resolvedUrl.href}`);
        }
    }

    function parseInlineContract(rawValue, options = {}) {
        if (!rawValue) {
            throw new Error('Inline contract payload is empty.');
        }

        if (!options.base64Only) {
            try {
                return JSON.parse(rawValue);
            } catch {
                // Fall through to base64url decode.
            }
        }

        const normalized = rawValue.replace(/-/g, '+').replace(/_/g, '/');
        const padded = normalized + '='.repeat((4 - (normalized.length % 4 || 4)) % 4);

        try {
            const decoded = atob(padded);
            return JSON.parse(decoded);
        } catch {
            throw new Error('Inline contract could not be parsed. Use valid JSON in `spec` or base64url JSON in `spec64`.');
        }
    }

    function normalizeDocument(rawDocument) {
        if (!rawDocument || typeof rawDocument !== 'object' || Array.isArray(rawDocument)) {
            return {
                version: 1,
                page: rawDocument,
            };
        }

        if (isDocumentEnvelope(rawDocument)) {
            return {
                version: rawDocument.version ?? 1,
                ...rawDocument,
            };
        }

        return {
            version: 1,
            page: rawDocument,
        };
    }

    function isDocumentEnvelope(value) {
        if (!value || typeof value !== 'object' || Array.isArray(value)) {
            return false;
        }

        return Object.keys(value).some((key) => DOCUMENT_KEYS.has(key));
    }

    function validateDocument(rawDocument) {
        const normalized = normalizeDocument(rawDocument);
        const errors = [];

        if (normalized.version !== undefined && normalized.version !== 1 && normalized.version !== '1') {
            errors.push('Document `version` must be 1.');
        }

        if (normalized.theme !== undefined && !VALID_THEMES.has(String(normalized.theme))) {
            errors.push(`Document theme must be one of: ${Array.from(VALID_THEMES).join(', ')}.`);
        }

        if (normalized.title !== undefined && typeof normalized.title !== 'string') {
            errors.push('Document `title` must be a string.');
        }

        if (normalized.description !== undefined && typeof normalized.description !== 'string') {
            errors.push('Document `description` must be a string.');
        }

        if (normalized.preset && normalized.page !== undefined) {
            errors.push('Document must provide either `preset` or `page`, not both.');
        }

        if (!normalized.preset && normalized.page === undefined) {
            errors.push('Document must provide `preset` or `page`.');
        }

        if (normalized.preset !== undefined && typeof normalized.preset !== 'string') {
            errors.push('Document `preset` must be a string when present.');
        }

        if (normalized.presetOptions !== undefined && !isPlainObject(normalized.presetOptions)) {
            errors.push('Document `presetOptions` must be an object when present.');
        }

        if (normalized.page !== undefined) {
            validateRenderableValue(normalized.page, 'page', errors);
        }

        return {
            valid: errors.length === 0,
            errors,
            document: normalized,
        };
    }

    function validateRenderableValue(value, path, errors) {
        if (value === null || value === false) {
            return;
        }

        if (typeof value === 'string' || typeof value === 'number') {
            return;
        }

        if (typeof value === 'boolean') {
            errors.push(`${path} must not use bare boolean values.`);
            return;
        }

        if (typeof value === 'function') {
            errors.push(`${path} must not include functions.`);
            return;
        }

        if (Array.isArray(value)) {
            value.forEach((entry, index) => validateRenderableValue(entry, `${path}[${index}]`, errors));
            return;
        }

        if (!isPlainObject(value)) {
            errors.push(`${path} must be an object, array, string, number, null, or false.`);
            return;
        }

        if ('html' in value) {
            errors.push(`${path}.html is not allowed in remote contracts. Use framework components or safe tags instead.`);
        }

        if ('on' in value) {
            errors.push(`${path}.on is not allowed in remote contracts. Use declarative actions instead.`);
        }

        if ('component' in value) {
            validateComponentDefinition(value, path, errors);
            return;
        }

        if ('tag' in value || 'attrs' in value || 'children' in value || 'text' in value) {
            validateNodeDefinition(value, path, errors);
            return;
        }

        validateAppDefinition(value, path, errors);
    }

    function validateComponentDefinition(value, path, errors) {
        if (typeof value.component !== 'string' || !VALID_COMPONENTS.has(value.component)) {
            errors.push(`${path}.component must be one of: ${Array.from(VALID_COMPONENTS).join(', ')}.`);
        }

        if (value.component === 'html') {
            errors.push(`${path}.component=html is not allowed in remote contracts.`);
        }

        if ('props' in value && !isPlainObject(value.props)) {
            errors.push(`${path}.props must be an object when present.`);
        }

        validateSharedFields(value, path, errors);

        if ('props' in value) {
            validateSharedFields(value.props, `${path}.props`, errors);
        }
    }

    function validateNodeDefinition(value, path, errors) {
        const tag = String(value.tag || 'div').toLowerCase();

        if (!SAFE_TAGS.has(tag)) {
            errors.push(`${path}.tag=${tag} is not allowed in remote contracts.`);
        }

        if ('attrs' in value && !isPlainObject(value.attrs)) {
            errors.push(`${path}.attrs must be an object when present.`);
        }

        if ('dataset' in value && !isPlainObject(value.dataset)) {
            errors.push(`${path}.dataset must be an object when present.`);
        }

        if ('style' in value && !isPlainObject(value.style)) {
            errors.push(`${path}.style must be an object when present.`);
        }

        validateSharedFields(value, path, errors);
    }

    function validateAppDefinition(value, path, errors) {
        validateSharedFields(value, path, errors);
    }

    function validateSharedFields(value, path, errors) {
        if ('children' in value) {
            validateRenderableValue(value.children, `${path}.children`, errors);
        }

        if ('body' in value) {
            validateRenderableValue(value.body, `${path}.body`, errors);
        }

        if ('sections' in value) {
            validateRenderableValue(value.sections, `${path}.sections`, errors);
        }

        if ('badge' in value) {
            validateRenderableValue(value.badge, `${path}.badge`, errors);
        }

        if ('actions' in value) {
            if (!Array.isArray(value.actions)) {
                errors.push(`${path}.actions must be an array.`);
            } else {
                value.actions.forEach((action, index) => validateActionButton(action, `${path}.actions[${index}]`, errors));
            }
        }

        if ('attrs' in value && isPlainObject(value.attrs)) {
            Object.entries(value.attrs).forEach(([key, entryValue]) => {
                if (/^on/i.test(key)) {
                    errors.push(`${path}.attrs.${key} is not allowed.`);
                }

                if (!isScalarValue(entryValue)) {
                    errors.push(`${path}.attrs.${key} must be a string, number, or boolean.`);
                }
            });
        }

        if ('dataset' in value && isPlainObject(value.dataset)) {
            Object.entries(value.dataset).forEach(([key, entryValue]) => {
                if (!isScalarValue(entryValue)) {
                    errors.push(`${path}.dataset.${key} must be a string, number, or boolean.`);
                }
            });
        }

        if ('style' in value && isPlainObject(value.style)) {
            Object.entries(value.style).forEach(([key, entryValue]) => {
                if (!(typeof entryValue === 'string' || typeof entryValue === 'number')) {
                    errors.push(`${path}.style.${key} must be a string or number.`);
                }
            });
        }
    }

    function validateActionButton(action, path, errors) {
        if (!isPlainObject(action)) {
            errors.push(`${path} must be an object.`);
            return;
        }

        if ('action' in action) {
            validateActionDefinition(action.action, `${path}.action`, errors);
        }

        if ('children' in action) {
            validateRenderableValue(action.children, `${path}.children`, errors);
        }
    }

    function validateActionDefinition(action, path, errors) {
        if (!isPlainObject(action)) {
            errors.push(`${path} must be an object.`);
            return;
        }

        if (!VALID_ACTION_TYPES.has(String(action.type || ''))) {
            errors.push(`${path}.type must be one of: ${Array.from(VALID_ACTION_TYPES).join(', ')}.`);
        }

        if (action.type === 'open' && !(action.href || action.url)) {
            errors.push(`${path} requires href or url for open actions.`);
        }

        if (action.type === 'copy' && action.text === undefined && action.value === undefined) {
            errors.push(`${path} requires text or value for copy actions.`);
        }

        if (action.type === 'modal' && action.content !== undefined && typeof action.content !== 'string') {
            errors.push(`${path}.content must be a string for modal actions.`);
        }
    }

    async function renderFromLocation(target, options = {}) {
        const sourceLocation = options.location || window.location;
        const params = new URLSearchParams(sourceLocation.search);
        const themeOverride = params.get('theme') || options.theme;
        const modeOverride = params.get('mode') || options.mode;

        try {
            const rawDocument = options.document || await loadDocumentFromLocation(sourceLocation);
            if (!rawDocument) {
                throw new Error('No page contract was provided. Use `source`, `page`, `spec`, `spec64`, or `preset` in the URL.');
            }

            const validation = validateDocument(rawDocument);
            if (!validation.valid) {
                renderError(target, 'Invalid Page Contract', validation.errors, {
                    sourceHint: params.get('source') || params.get('page') || null,
                });
                return {
                    ok: false,
                    validation,
                };
            }

            const documentContract = validation.document;
            const effectiveTheme = themeOverride || documentContract.theme || 'active';
            const effectiveMode = modeOverride || documentContract.mode || UI.mode || 'light';
            UI.setTheme?.(effectiveTheme, { force: true, mode: effectiveMode });

            let renderable;
            if (documentContract.preset) {
                const presetOptions = {
                    ...(documentContract.presetOptions || {}),
                };

                if (presetOptions.themeId === undefined && effectiveTheme) {
                    presetOptions.themeId = effectiveTheme;
                }

                if (presetOptions.theme === undefined && effectiveTheme) {
                    presetOptions.theme = effectiveTheme;
                }

                if (presetOptions.mode === undefined && effectiveMode) {
                    presetOptions.mode = effectiveMode;
                }

                renderable = UI.presets.resolve(documentContract.preset, presetOptions);
            } else {
                renderable = documentContract.page;
            }

            if (documentContract.title) {
                document.title = `${documentContract.title} · ui.mullmania.com`;
            } else if (documentContract.preset) {
                document.title = `${documentContract.preset} · ui.mullmania.com`;
            }

            UI.mount(target, renderable);
                return {
                    ok: true,
                    document: documentContract,
                    mode: effectiveMode,
                    theme: effectiveTheme,
                };
        } catch (error) {
            renderError(target, 'Page Load Failed', [
                error.message || 'Unknown render error.',
                'If you are loading a remote JSON document, make sure the source URL returns valid JSON and allows cross-origin requests from https://ui.mullmania.com/.',
            ], {
                sourceHint: params.get('source') || params.get('page') || null,
            });
            return {
                ok: false,
                error,
            };
        }
    }

    function renderError(target, title, messages, options = {}) {
        const lines = Array.isArray(messages) ? messages : [messages];
        const sourceHint = options.sourceHint;

        UI.mount(target, {
            title,
            subtitle: sourceHint ? `Source: ${sourceHint}` : 'ui.mullmania.com renderer',
            sections: [
                UI.section({
                    title: 'Problem',
                    children: [
                        {
                            tag: 'ul',
                            children: lines.map((line) => ({
                                tag: 'li',
                                text: line,
                            })),
                        },
                    ],
                }),
                UI.section({
                    title: 'Expected Contract',
                    children: [
                        {
                            tag: 'pre',
                            children: [
                                {
                                    tag: 'code',
                                    text: JSON.stringify(exampleContract(), null, 2),
                                },
                            ],
                        },
                    ],
                }),
            ],
        });
    }

    function exampleContract() {
        return {
            $schema: 'https://ui.mullmania.com/page-contract.schema.json',
            version: 1,
            title: 'Example Page',
            mode: 'light',
            theme: 'active',
            page: {
                component: 'app',
                title: 'Example Page',
                subtitle: 'Rendered from a validated page contract.',
                children: [
                    {
                        component: 'section',
                        title: 'Overview',
                        children: [
                            {
                                component: 'grid',
                                columns: 2,
                                children: [
                                    { component: 'stat', label: 'Status', value: 'Live' },
                                    { component: 'alert', tone: 'info', title: 'Ready', message: 'The renderer validated and mounted this page.' },
                                ],
                            },
                        ],
                    },
                ],
            },
        };
    }

    function isPlainObject(value) {
        return value !== null && typeof value === 'object' && !Array.isArray(value);
    }

    function isScalarValue(value) {
        return typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean';
    }

    UI.contract = {
        hasRenderRequest,
        loadFromLocation: loadDocumentFromLocation,
        fetch: fetchContract,
        parseInline: parseInlineContract,
        normalize: normalizeDocument,
        validate: validateDocument,
        renderFromLocation,
        renderError,
        example: exampleContract,
    };
})(window, document);
