/**
 * Tag Search — Canon Primitive
 * @version 1.0.0
 * @url https://ui.mullmania.com/js/tag-search.js
 *
 * One tokenized search box: free text + selectable facet "tags" in a single
 * field, replacing the old "search input + chip wall + select dropdown" trio.
 * Facet options become pills you can click-to-add (chips below) or type-to-add
 * (by id / label / alias, Enter or comma to commit). Backspace on an empty
 * input pops the last pill. Free text matches separately from the tags.
 *
 * Built on the surface-chip / surface-toolbar primitives (core/surface-shell.css)
 * + the sidebar-filter rail, and modelled on the bespoke tag-in-search that
 * powers sites.mullmania.com (CATEGORY_TAG_DEFINITIONS + searchFields + aliases).
 *
 *   const handle = UI.TagSearch.mount(el, {
 *     facets: [
 *       { id: 'source', label: 'Source', field: 'source', options: [
 *         { id: 'cozybox', label: 'CozyBox', aliases: ['cozy'], count: 12 }, ... ] },
 *       { id: 'format', label: 'Format', field: 'formats', options: [ ... ] },
 *     ],
 *     freeText: { placeholder: 'Filter models, formats, tags', fields: ['title','summary','tags'] },
 *     value: { text: '', tags: ['source:cozybox'] },   // optional initial state
 *     onChange: ({ text, tags }) => { ... },           // tags: Set<"facetId:optionId">
 *   });
 *   handle.getState();            // { text, tags: Set }
 *   handle.setState({ text, tags });
 *   handle.focus(); handle.destroy();
 *
 * Loaded as a classic script via the ui.js bundle; exposes window.UI.TagSearch.
 * No dependency beyond the DOM.
 */
(function (window, document) {
    'use strict';

    const UI = window.UI = window.UI || {};
    if (UI.TagSearch && UI.TagSearch.__canon) return;

    function norm(value) {
        return String(value == null ? '' : value).trim().toLowerCase();
    }

    function buildIndex(facets) {
        // key "facetId:optionId" -> { key, facetId, facetLabel, field, optId, label, aliases[], count }
        const byKey = new Map();
        const order = [];
        (facets || []).forEach((facet) => {
            const facetId = facet.id;
            const facetLabel = facet.label || facet.id;
            const field = facet.field || facet.id;
            (facet.options || []).forEach((opt) => {
                const key = facetId + ':' + opt.id;
                const aliases = [norm(opt.id), norm(opt.label)]
                    .concat((opt.aliases || []).map(norm))
                    .filter(Boolean);
                byKey.set(key, {
                    key, facetId, facetLabel, field,
                    optId: opt.id, label: opt.label || opt.id,
                    aliases, count: opt.count,
                });
                order.push(key);
            });
        });
        return { byKey, order };
    }

    function mount(el, options) {
        options = options || {};
        if (!el) throw new Error('UI.TagSearch.mount: a mount element is required.');
        const facets = options.facets || [];
        const freeText = options.freeText || {};
        const onChange = typeof options.onChange === 'function' ? options.onChange : function () {};
        const index = buildIndex(facets);

        const state = {
            text: (options.value && options.value.text) || '',
            tags: new Set((options.value && options.value.tags) || []),
        };

        // ---- DOM ----
        const root = document.createElement('div');
        root.className = 'tag-search';
        root.setAttribute('role', 'search');

        const field = document.createElement('div');
        field.className = 'tag-search__field';

        const icon = document.createElement('i');
        icon.className = 'ti ti-search tag-search__icon';
        icon.setAttribute('aria-hidden', 'true');

        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'tag-search__input';
        input.autocomplete = 'off';
        input.placeholder = freeText.placeholder || 'Filter';
        input.setAttribute('aria-label', freeText.placeholder || 'Filter');
        input.value = state.text;

        const clearBtn = document.createElement('button');
        clearBtn.type = 'button';
        clearBtn.className = 'tag-search__clear';
        clearBtn.setAttribute('aria-label', 'Clear search text');
        clearBtn.textContent = '×';
        clearBtn.hidden = !state.text;

        field.append(icon, input, clearBtn);

        const facetsWrap = document.createElement('div');
        facetsWrap.className = 'tag-search__facets';

        root.append(field, facetsWrap);
        el.append(root);

        // ---- helpers ----
        function emit() {
            onChange({ text: state.text, tags: new Set(state.tags) });
        }

        function renderPills() {
            field.querySelectorAll('.tag-search__pill').forEach((pill) => pill.remove());
            const frag = document.createDocumentFragment();
            state.tags.forEach((key) => {
                const def = index.byKey.get(key);
                if (!def) return;
                const pill = document.createElement('span');
                pill.className = 'surface-chip is-active tag-search__pill';
                pill.title = def.facetLabel + ': ' + def.label;
                const label = document.createElement('span');
                label.textContent = def.label;
                const remove = document.createElement('button');
                remove.type = 'button';
                remove.className = 'tag-search__pill-remove';
                remove.setAttribute('aria-label', 'Remove ' + def.label);
                remove.textContent = '×';
                remove.addEventListener('click', () => { toggleTag(key, false); input.focus(); });
                pill.append(label, remove);
                frag.append(pill);
            });
            field.insertBefore(frag, input);
        }

        function renderFacets() {
            facetsWrap.replaceChildren();
            (facets || []).forEach((facet) => {
                const group = document.createElement('div');
                group.className = 'tag-search__facet-group';
                if (facet.label) {
                    const lbl = document.createElement('span');
                    lbl.className = 'tag-search__facet-label';
                    lbl.textContent = facet.label;
                    group.append(lbl);
                }
                (facet.options || []).forEach((opt) => {
                    const key = facet.id + ':' + opt.id;
                    const chip = document.createElement('button');
                    chip.type = 'button';
                    chip.className = 'surface-chip surface-chip--quiet tag-search__facet-chip';
                    chip.dataset.key = key;
                    if (state.tags.has(key)) chip.classList.add('is-active');
                    const text = document.createElement('span');
                    text.textContent = opt.label || opt.id;
                    chip.append(text);
                    const count = opt.count;
                    if (count != null && count !== '') {
                        const badge = document.createElement('span');
                        badge.className = 'surface-chip__count';
                        badge.textContent = String(count);
                        chip.append(badge);
                    }
                    chip.addEventListener('click', () => { toggleTag(key); input.focus(); });
                    group.append(chip);
                });
                facetsWrap.append(group);
            });
        }

        function syncActiveChips() {
            facetsWrap.querySelectorAll('.tag-search__facet-chip').forEach((chip) => {
                chip.classList.toggle('is-active', state.tags.has(chip.dataset.key));
            });
        }

        function toggleTag(key, force) {
            if (!index.byKey.has(key)) return;
            const want = force === undefined ? !state.tags.has(key) : force;
            if (want) state.tags.add(key); else state.tags.delete(key);
            renderPills();
            syncActiveChips();
            emit();
        }

        function resolveToken(token) {
            const needle = norm(token);
            if (!needle) return null;
            for (const key of index.order) {
                if (state.tags.has(key)) continue;
                if (index.byKey.get(key).aliases.includes(needle)) return key;
            }
            return null;
        }

        // ---- events ----
        input.addEventListener('input', () => {
            state.text = input.value;
            clearBtn.hidden = !input.value;
            emit();
        });

        input.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' || event.key === ',') {
                const key = resolveToken(input.value);
                if (key) {
                    event.preventDefault();
                    input.value = '';
                    state.text = '';
                    clearBtn.hidden = true;
                    toggleTag(key, true); // also emits
                }
            } else if (event.key === 'Backspace' && input.value === '' && state.tags.size) {
                const last = Array.from(state.tags).pop();
                toggleTag(last, false);
            }
        });

        clearBtn.addEventListener('click', () => {
            input.value = '';
            state.text = '';
            clearBtn.hidden = true;
            input.focus();
            emit();
        });

        // ---- initial paint ----
        renderPills();
        renderFacets();

        return {
            el: root,
            getState() { return { text: state.text, tags: new Set(state.tags) }; },
            setState(next) {
                next = next || {};
                if ('text' in next) {
                    state.text = next.text || '';
                    input.value = state.text;
                    clearBtn.hidden = !state.text;
                }
                if ('tags' in next) {
                    state.tags = new Set(next.tags || []);
                }
                renderPills();
                renderFacets();
            },
            focus() { input.focus(); },
            destroy() { root.remove(); },
        };
    }

    UI.TagSearch = { mount, __canon: true, version: '1.0.0' };
})(window, document);
