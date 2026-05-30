/**
 * Tag Search — Canon Primitive
 * @version 3.0.0
 * @url https://ui.mullmania.com/js/tag-search.js
 *
 * One faceted filter that serves BOTH audiences from a single state:
 *
 *   • EASY MODE (default, for everyone): always-visible labeled facet chips
 *     grouped by facet (Source / Format / …), each with a live count. Click to
 *     add the filter. Once selected, an option grays out (or hides) from the
 *     available pool so you only see what's still pickable.
 *
 *   • ADVANCED MODE (enhancement, for power users): a tokenized search box where
 *     selected facets show as `field:value` token-pills (e.g. `source:cozybox`,
 *     `format:mvox`). Type `source:cozybox` (or a bare alias like `cozybox`) and
 *     press Enter to add a token; Backspace on an empty input pops the last one.
 *     Free text matches separately from the tokens.
 *
 *   • DROPDOWN (optional, for compact surfaces): the same options behind a
 *     "Filters" menu on the search box. Off by default; enable via ui.facets.
 *
 * All three drive the same Set<"facetId:optionId">; selecting anywhere updates
 * everywhere. Built on the shared .surface-chip primitive (core/surface-shell.css);
 * modelled on the tag-in-search that powers sites.mullmania.com.
 *
 *   const handle = UI.TagSearch.mount(el, {
 *     facets: [
 *       { id: 'source', label: 'Source', field: 'source', options: [
 *         { id: 'cozybox', label: 'CozyBox', aliases: ['cozy'], count: 68 }, ... ] },
 *       { id: 'format', label: 'Format', field: 'formats', options: [ ... ] },
 *     ],
 *     freeText: { placeholder: 'Filter models, formats, tags', fields: ['title','summary','tags'] },
 *     value: { text: '', tags: ['source:cozybox'] },     // optional initial state
 *     onChange: ({ text, tags }) => { ... },             // tags: Set<"facetId:optionId">
 *     ui: {
 *       box: true,                 // advanced token search box (default true)
 *       facets: 'chips',           // easy mode: 'chips' (default) | 'dropdown' | 'both' | 'none'
 *       selected: 'gray',          // used options: 'gray' (default) | 'hide'
 *     },
 *   });
 *   handle.getState();             // { text, tags: Set }
 *   handle.setState({ text, tags });
 *   handle.focus(); handle.destroy();
 *
 * Loaded as a classic script via the ui.js bundle; exposes window.UI.TagSearch.
 */
(function (window, document) {
    'use strict';

    const UI = window.UI = window.UI || {};
    if (UI.TagSearch && UI.TagSearch.version === '3.0.0') return;

    function norm(value) {
        return String(value == null ? '' : value).trim().toLowerCase();
    }

    function buildIndex(facets) {
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

        const ui = options.ui || {};
        const showBox = ui.box !== false;
        const facetMode = ['chips', 'dropdown', 'both', 'none'].indexOf(ui.facets) !== -1 ? ui.facets : 'chips';
        const showChips = facetMode === 'chips' || facetMode === 'both';
        const showDropdown = facetMode === 'dropdown' || facetMode === 'both';
        const hideSelected = ui.selected === 'hide';

        const state = {
            text: (options.value && options.value.text) || '',
            tags: new Set((options.value && options.value.tags) || []),
            menuOpen: false,
        };

        // ---- root ----
        const root = document.createElement('div');
        root.className = 'tag-search' + (hideSelected ? ' tag-search--hide-selected' : '');
        root.setAttribute('role', 'search');

        // ---- advanced box ----
        let input = null;
        let clearBtn = null;
        let entry = null;
        let menu = null;
        let menuBtn = null;

        if (showBox) {
            const field = document.createElement('div');
            field.className = 'tag-search__field';

            const icon = document.createElement('i');
            icon.className = 'ti ti-search tag-search__icon';
            icon.setAttribute('aria-hidden', 'true');

            entry = document.createElement('div');
            entry.className = 'tag-search__entry';

            input = document.createElement('input');
            input.type = 'text';
            input.className = 'tag-search__input';
            input.autocomplete = 'off';
            input.placeholder = freeText.placeholder || 'Filter';
            input.setAttribute('aria-label', freeText.placeholder || 'Filter');
            input.value = state.text;
            entry.append(input);

            clearBtn = document.createElement('button');
            clearBtn.type = 'button';
            clearBtn.className = 'tag-search__clear';
            clearBtn.setAttribute('aria-label', 'Clear all filters');
            clearBtn.innerHTML = '<i class="ti ti-x" aria-hidden="true"></i>';

            field.append(icon, entry, clearBtn);

            if (showDropdown) {
                const menuWrap = document.createElement('div');
                menuWrap.className = 'tag-search__menu-wrap';
                menuBtn = document.createElement('button');
                menuBtn.type = 'button';
                menuBtn.className = 'tag-search__menu-btn';
                menuBtn.setAttribute('aria-haspopup', 'listbox');
                menuBtn.setAttribute('aria-expanded', 'false');
                menuBtn.innerHTML = '<i class="ti ti-adjustments-horizontal" aria-hidden="true"></i><span>Filters</span><i class="ti ti-chevron-down tag-search__menu-caret" aria-hidden="true"></i>';
                menu = document.createElement('div');
                menu.className = 'tag-search__menu';
                menu.setAttribute('role', 'listbox');
                menu.hidden = true;
                menuWrap.append(menuBtn, menu);
                field.append(menuWrap);
            }

            root.append(field);

            input.addEventListener('input', () => { state.text = input.value; sync(); emit(); });
            input.addEventListener('keydown', (event) => {
                if (event.key === 'Enter' || event.key === ',') {
                    const key = resolveToken(input.value);
                    if (key) { event.preventDefault(); input.value = ''; state.text = ''; toggleTag(key, true); }
                } else if (event.key === 'Backspace' && input.value === '' && state.tags.size) {
                    toggleTag(Array.from(state.tags).pop(), false);
                }
            });
            clearBtn.addEventListener('click', () => {
                input.value = ''; state.text = ''; state.tags.clear();
                render(); input.focus(); emit();
            });
            entry.addEventListener('click', (event) => { if (event.target === entry) input.focus(); });

            if (menuBtn) {
                menuBtn.addEventListener('click', (event) => {
                    event.stopPropagation();
                    if (state.menuOpen) closeMenu(); else openMenu();
                });
            }
        }

        // ---- easy-mode chips ----
        let facetsWrap = null;
        if (showChips) {
            facetsWrap = document.createElement('div');
            facetsWrap.className = 'tag-search__facets';
            root.append(facetsWrap);
        }

        el.append(root);

        // ---- helpers ----
        function emit() { onChange({ text: state.text, tags: new Set(state.tags) }); }

        function pillEl(key) {
            const def = index.byKey.get(key);
            const pill = document.createElement('span');
            pill.className = 'surface-chip is-active tag-search__pill';
            pill.title = def ? def.facetLabel + ': ' + def.label : key;
            const label = document.createElement('span');
            label.className = 'tag-search__pill-token';
            label.textContent = key;
            const remove = document.createElement('button');
            remove.type = 'button';
            remove.className = 'tag-search__pill-remove';
            remove.setAttribute('aria-label', 'Remove ' + key);
            remove.textContent = '×';
            remove.addEventListener('click', (e) => { e.stopPropagation(); toggleTag(key, false); if (input) input.focus(); });
            pill.append(label, remove);
            return pill;
        }

        function renderPills() {
            if (!entry) return;
            entry.querySelectorAll('.tag-search__pill').forEach((p) => p.remove());
            const frag = document.createDocumentFragment();
            state.tags.forEach((key) => { if (index.byKey.has(key)) frag.append(pillEl(key)); });
            entry.insertBefore(frag, input);
        }

        function renderChips() {
            if (!facetsWrap) return;
            facetsWrap.replaceChildren();
            (facets || []).forEach((facet) => {
                const group = document.createElement('div');
                group.className = 'tag-search__facet-group';
                const lbl = document.createElement('span');
                lbl.className = 'tag-search__facet-label';
                lbl.textContent = facet.label || facet.id;
                group.append(lbl);
                (facet.options || []).forEach((opt) => {
                    const key = facet.id + ':' + opt.id;
                    const chip = document.createElement('button');
                    chip.type = 'button';
                    chip.className = 'surface-chip surface-chip--quiet tag-search__facet-chip';
                    chip.dataset.key = key;
                    const t = document.createElement('span');
                    t.textContent = opt.label || opt.id;
                    chip.append(t);
                    if (opt.count != null && opt.count !== '') {
                        const c = document.createElement('span');
                        c.className = 'surface-chip__count';
                        c.textContent = String(opt.count);
                        chip.append(c);
                    }
                    chip.addEventListener('click', () => { toggleTag(key); if (input) input.focus(); });
                    group.append(chip);
                });
                facetsWrap.append(group);
            });
        }

        function renderMenu() {
            if (!menu) return;
            menu.replaceChildren();
            (facets || []).forEach((facet) => {
                const group = document.createElement('div');
                group.className = 'tag-search__menu-group';
                const lbl = document.createElement('div');
                lbl.className = 'tag-search__menu-label';
                lbl.textContent = facet.label || facet.id;
                group.append(lbl);
                (facet.options || []).forEach((opt) => {
                    const key = facet.id + ':' + opt.id;
                    const item = document.createElement('button');
                    item.type = 'button';
                    item.className = 'tag-search__opt';
                    item.setAttribute('role', 'option');
                    item.dataset.key = key;
                    const check = document.createElement('i');
                    check.className = 'ti ti-check tag-search__opt-check';
                    check.setAttribute('aria-hidden', 'true');
                    const text = document.createElement('span');
                    text.className = 'tag-search__opt-label';
                    text.textContent = opt.label || opt.id;
                    const token = document.createElement('span');
                    token.className = 'tag-search__opt-token';
                    token.textContent = key;
                    item.append(check, text, token);
                    if (opt.count != null && opt.count !== '') {
                        const badge = document.createElement('span');
                        badge.className = 'tag-search__opt-count';
                        badge.textContent = String(opt.count);
                        item.append(badge);
                    }
                    item.addEventListener('click', (e) => { e.stopPropagation(); toggleTag(key); if (input) input.focus(); });
                    group.append(item);
                });
                menu.append(group);
            });
        }

        // Reflect selection state across box pills, chips, and menu.
        function sync() {
            if (facetsWrap) {
                facetsWrap.querySelectorAll('.tag-search__facet-chip').forEach((chip) => {
                    chip.classList.toggle('is-selected', state.tags.has(chip.dataset.key));
                });
            }
            if (menu) {
                menu.querySelectorAll('.tag-search__opt').forEach((item) => {
                    item.classList.toggle('is-selected', state.tags.has(item.dataset.key));
                    item.setAttribute('aria-selected', state.tags.has(item.dataset.key) ? 'true' : 'false');
                });
            }
            if (clearBtn) clearBtn.hidden = !state.text && state.tags.size === 0;
        }

        function render() { renderPills(); renderChips(); renderMenu(); sync(); }

        function toggleTag(key, force) {
            if (!index.byKey.has(key)) return;
            const want = force === undefined ? !state.tags.has(key) : force;
            if (want) state.tags.add(key); else state.tags.delete(key);
            renderPills();
            sync();
            emit();
        }

        function resolveToken(token) {
            const t = norm(token);
            if (!t) return null;
            if (t.indexOf(':') !== -1) {
                const cut = t.indexOf(':');
                const facetId = t.slice(0, cut).trim();
                const value = t.slice(cut + 1).trim();
                const direct = facetId + ':' + value;
                if (index.byKey.has(direct)) return direct;
                for (const key of index.order) {
                    const def = index.byKey.get(key);
                    if (def.facetId === facetId && def.aliases.includes(value)) return key;
                }
                return null;
            }
            for (const key of index.order) {
                if (state.tags.has(key)) continue;
                if (index.byKey.get(key).aliases.includes(t)) return key;
            }
            return null;
        }

        // ---- dropdown open/close ----
        function openMenu() {
            if (!menu || state.menuOpen) return;
            state.menuOpen = true; menu.hidden = false;
            menuBtn.setAttribute('aria-expanded', 'true');
            root.classList.add('tag-search--open');
            document.addEventListener('mousedown', onOutside, true);
            document.addEventListener('keydown', onEscape, true);
        }
        function closeMenu() {
            if (!menu || !state.menuOpen) return;
            state.menuOpen = false; menu.hidden = true;
            menuBtn.setAttribute('aria-expanded', 'false');
            root.classList.remove('tag-search--open');
            document.removeEventListener('mousedown', onOutside, true);
            document.removeEventListener('keydown', onEscape, true);
        }
        function onOutside(event) { if (!root.contains(event.target)) closeMenu(); }
        function onEscape(event) { if (event.key === 'Escape') { closeMenu(); if (menuBtn) menuBtn.focus(); } }

        // ---- initial paint ----
        render();

        return {
            el: root,
            getState() { return { text: state.text, tags: new Set(state.tags) }; },
            setState(next) {
                next = next || {};
                if ('text' in next) { state.text = next.text || ''; if (input) input.value = state.text; }
                if ('tags' in next) { state.tags = new Set(next.tags || []); }
                render();
            },
            focus() { if (input) input.focus(); },
            destroy() { closeMenu(); root.remove(); },
        };
    }

    UI.TagSearch = { mount, version: '3.0.0', __canon: true };
})(window, document);
