/**
 * Console Shell - Sci-fi HUD Framing for Full-Stage Visualizations
 * @version 1.0.0
 * @license MIT
 *
 * A bespoke fullscreen shell component with a compact header, a full-bleed
 * stage, angular cut-corner framing, and an optional persistent bottom-right
 * FAB navigation widget. Designed for TV-first visualization apps where the
 * scene is the point and the chrome should read as Descent/TIE-Fighter/Star-
 * Fox console UI instead of as a generic ChatGPT-default rounded-pill app.
 *
 * Extracted from the Mullmania Viz Gallery after 25+ scenes re-implemented
 * the same chrome pattern locally. Now every site consuming ui.[base]/js/ui.js
 * gets `window.UI.ConsoleShell` for free.
 *
 * USAGE:
 *
 *   <script src="https://ui.mullmania.com/ui.js"></script>
 *   <script type="module">
 *     await window.UI.ready();
 *     const shell = UI.ConsoleShell.mount({
 *       title: 'My Scene',
 *       subtitle: 'After some specific artist, year. Short aesthetic anchor.',
 *       backHref: '../index.html',
 *       theme: 'dark-mode',                  // 'dark-mode' | 'light-mode'
 *       corners: 'cut',                       // 'cut' (angular) | 'none'
 *       fab: {                                // optional
 *         scenes: [
 *           { slug: 'a', name: 'Scene A', href: './a.html' },
 *           { slug: 'b', name: 'Scene B', href: './b.html' },
 *         ],
 *         currentSlug: 'a',
 *         galleryHref: '../index.html',
 *       },
 *     });
 *     shell.stage.appendChild(myCanvas);
 *     shell.setStatus('Loading data...');
 *     shell.clearStatus();
 *     shell.addHud('42 files · 10,000 LOC');
 *   </script>
 *
 * Returns an object with:
 *   shell.header        — the DOM header element
 *   shell.stage         — the DOM <main> stage element (append your scene here)
 *   shell.fab           — the FAB nav root (if configured) or null
 *   shell.setStatus(t)  — show a centered status overlay on the stage
 *   shell.clearStatus() — remove the status overlay
 *   shell.addHud(text)  — bottom-left compact HUD strip, returns the element
 *   shell.setTitle(t)   — change the header title after mount
 *   shell.toggleFabMenu(open?) — open/close the FAB's full scene menu
 *
 * STYLING:
 *   All chrome uses the host UI framework's CSS variables where possible
 *   (var(--bg-primary), var(--text-primary), var(--space-*)). The angular
 *   sci-fi overrides are scoped to .console-shell-* classes so they don't
 *   affect the rest of the page. Mobile overrides at max-width: 768px
 *   collapse the header to 48px, hide the subtitle, shrink the FAB to
 *   icons-only, and make the stage scroll on touch.
 */

(function(window, document) {
    'use strict';

    const UI = window.UI || (window.UI = {});

    const STYLES_ID = 'ui-console-shell-styles';
    const CHROME_VERSION = '1.0.0';

    function ensureStyles() {
        if (document.getElementById(STYLES_ID)) return;
        const style = document.createElement('style');
        style.id = STYLES_ID;
        style.textContent = `
            html, body { height: 100%; width: 100%; margin: 0; }
            body.console-shell-body {
                display: grid;
                grid-template-rows: auto 1fr;
                height: 100vh;
                height: 100dvh;
                max-height: 100dvh;
                overflow: hidden;
                background: var(--bg-primary, #020510);
                color: var(--text-primary, #f0f8ff);
            }
            .console-shell-header {
                display: grid;
                grid-template-columns: 1fr auto;
                align-items: center;
                gap: var(--space-md, 16px);
                padding: var(--space-sm, 8px) var(--space-lg, 24px);
                border-bottom: 1px solid rgba(120, 201, 255, 0.3);
                background: var(--bg-secondary, #050d1a);
                z-index: 10;
                max-height: min(96px, 14vh);
                font-family: "Courier New", "SF Mono", monospace;
            }
            .console-shell-header-left {
                display: grid;
                grid-template-columns: auto 1fr;
                align-items: center;
                gap: var(--space-md, 16px);
                min-width: 0;
            }
            .console-shell-header-right {
                display: grid;
                grid-auto-flow: column;
                align-items: center;
                gap: var(--space-md, 16px);
            }
            .console-shell-back {
                display: grid;
                grid-auto-flow: column;
                align-items: center;
                gap: var(--space-xs, 4px);
                color: var(--text-primary, #78c9ff);
                text-decoration: none;
                padding: 4px 10px;
                border: 1px solid rgba(120, 201, 255, 0.4);
                clip-path: polygon(6px 0, 100% 0, calc(100% - 6px) 100%, 0 100%);
                font-size: 12px;
                letter-spacing: 0.08em;
                text-transform: uppercase;
            }
            .console-shell-back:hover {
                border-color: rgba(255, 211, 106, 0.7);
                color: #ffd36a;
            }
            .console-shell-title-block { display: grid; min-width: 0; }
            .console-shell-title {
                font-size: var(--text-xl, 20px);
                font-weight: 700;
                color: var(--text-primary, #f0f8ff);
                line-height: 1.1;
                letter-spacing: 0.08em;
                text-transform: uppercase;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }
            .console-shell-subtitle {
                font-size: var(--text-sm, 13px);
                color: var(--text-secondary, #78c9ff);
                margin-top: 2px;
            }
            .console-shell-stage {
                position: relative;
                overflow: hidden;
                background: var(--bg-primary, #020510);
            }
            .console-shell-stage canvas { display: block; }
            .console-shell-status {
                position: absolute;
                inset: 0;
                display: grid;
                place-items: center;
                color: var(--text-muted, #78c9ff);
                font-family: "Courier New", monospace;
                letter-spacing: 0.1em;
                text-transform: uppercase;
                pointer-events: none;
                font-size: 13px;
            }
            .console-shell-hud {
                position: absolute;
                left: var(--space-md, 16px);
                bottom: var(--space-md, 16px);
                padding: var(--space-sm, 8px) var(--space-md, 16px);
                background: rgba(5, 13, 26, 0.88);
                border: 1px solid rgba(120, 201, 255, 0.4);
                font-family: "Courier New", "SF Mono", monospace;
                font-size: 11px;
                color: var(--text-secondary, #78c9ff);
                letter-spacing: 0.06em;
                pointer-events: none;
                max-width: calc(100vw - 2 * var(--space-md, 16px));
                box-sizing: border-box;
                clip-path: polygon(6px 0, 100% 0, calc(100% - 6px) 100%, 0 100%);
            }

            /* ==================== FAB NAV ==================== */
            .console-shell-fab {
                position: fixed;
                right: var(--space-lg, 24px);
                bottom: var(--space-lg, 24px);
                z-index: 1000;
                display: grid;
                grid-auto-flow: column;
                gap: 4px;
                padding: 6px;
                background: rgba(5, 13, 26, 0.92);
                border: 1px solid rgba(120, 201, 255, 0.5);
                border-radius: 0;
                clip-path: polygon(14px 0, calc(100% - 14px) 0, 100% 50%, calc(100% - 14px) 100%, 14px 100%, 0 50%);
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.55);
                font-family: "Courier New", "SF Mono", monospace;
                backdrop-filter: blur(8px);
                -webkit-backdrop-filter: blur(8px);
            }
            .console-shell-fab button {
                background: transparent;
                color: #f0f8ff;
                border: none;
                padding: 10px 14px;
                border-radius: 0;
                cursor: pointer;
                font-family: "Courier New", monospace;
                font-size: 13px;
                letter-spacing: 0.08em;
                transition: background 0.15s ease, color 0.15s ease;
                display: grid;
                grid-auto-flow: column;
                align-items: center;
                gap: 6px;
            }
            .console-shell-fab button:hover {
                background: rgba(120, 201, 255, 0.18);
                color: #ffd36a;
            }
            .console-shell-fab-label {
                padding: 0 8px;
                font-size: 11px;
                color: #78c9ff;
                text-transform: uppercase;
                letter-spacing: 0.15em;
                align-self: center;
                display: grid;
                grid-template-rows: auto auto;
                text-align: center;
                line-height: 1.05;
                min-width: 120px;
                pointer-events: none;
            }
            .console-shell-fab-label-name {
                color: #f0f8ff;
                font-size: 12px;
                font-weight: 700;
                letter-spacing: 0.1em;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }
            .console-shell-fab-label-idx {
                color: #4a8abd;
                font-size: 9px;
                letter-spacing: 0.2em;
                margin-top: 2px;
            }
            .console-shell-fab-menu-overlay {
                position: fixed;
                inset: 0;
                z-index: 999;
                background: rgba(2, 5, 16, 0.82);
                backdrop-filter: blur(12px);
                -webkit-backdrop-filter: blur(12px);
                display: none;
                place-items: center;
                padding: 40px;
            }
            .console-shell-fab-menu-overlay.open { display: grid; }
            .console-shell-fab-menu {
                width: 100%;
                max-width: 1100px;
                max-height: 80vh;
                overflow-y: auto;
                background: #050d1a;
                border: 1px solid rgba(120, 201, 255, 0.5);
                clip-path: polygon(18px 0, calc(100% - 18px) 0, 100% 18px, 100% calc(100% - 18px), calc(100% - 18px) 100%, 18px 100%, 0 calc(100% - 18px), 0 18px);
                padding: 32px;
                box-shadow: 0 24px 80px rgba(0, 0, 0, 0.75);
            }
            .console-shell-fab-menu-title {
                font-family: "Courier New", monospace;
                color: #f0f8ff;
                font-size: 18px;
                letter-spacing: 0.2em;
                text-transform: uppercase;
                margin-bottom: 20px;
                padding-bottom: 14px;
                border-bottom: 1px solid rgba(120, 201, 255, 0.3);
            }
            .console-shell-fab-menu-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
                gap: 12px;
            }
            .console-shell-fab-menu-tile {
                display: grid;
                gap: 4px;
                padding: 14px 16px;
                background: rgba(10, 26, 42, 0.75);
                border: 1px solid rgba(26, 58, 90, 0.7);
                clip-path: polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px));
                cursor: pointer;
                text-decoration: none;
                color: inherit;
                font-family: "Courier New", monospace;
                transition: border-color 0.15s ease, transform 0.1s ease, background 0.15s ease;
            }
            .console-shell-fab-menu-tile:hover {
                border-color: rgba(255, 211, 106, 0.7);
                background: rgba(26, 58, 90, 0.55);
                transform: translateY(-1px);
            }
            .console-shell-fab-menu-tile.current {
                border-color: #ffd36a;
                background: rgba(255, 211, 106, 0.08);
            }
            .console-shell-fab-menu-tile-head {
                display: grid;
                grid-template-columns: auto 1fr;
                gap: 10px;
                align-items: baseline;
            }
            .console-shell-fab-menu-tile-n {
                color: #4a8abd;
                font-size: 10px;
                letter-spacing: 0.15em;
            }
            .console-shell-fab-menu-tile-name {
                color: #f0f8ff;
                font-size: 14px;
                font-weight: 700;
                letter-spacing: 0.05em;
            }
            .console-shell-fab-menu-tile-pitch {
                color: #a8c4d8;
                font-size: 11px;
                line-height: 1.4;
                margin-top: 4px;
                display: -webkit-box;
                -webkit-line-clamp: 3;
                -webkit-box-orient: vertical;
                overflow: hidden;
            }

            /* ==================== MOBILE ==================== */
            @media (max-width: 768px) {
                body.console-shell-body {
                    grid-template-rows: 48px 1fr;
                }
                .console-shell-header {
                    padding: 4px 10px;
                    gap: 8px;
                    max-height: 48px;
                    min-height: 48px;
                }
                .console-shell-title { font-size: 14px; }
                .console-shell-subtitle { display: none; }
                .console-shell-back {
                    padding: 4px 8px;
                    font-size: 10px;
                }
                .console-shell-stage {
                    overflow-y: auto;
                    overflow-x: hidden;
                    -webkit-overflow-scrolling: touch;
                    overscroll-behavior: contain;
                }
                .console-shell-hud {
                    left: 8px;
                    bottom: 8px;
                    padding: 4px 8px;
                    font-size: 10px;
                    max-width: calc(100vw - 16px);
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }
                .console-shell-status { font-size: 12px; padding: 8px; }
                .console-shell-fab {
                    right: 8px;
                    bottom: 8px;
                    padding: 3px;
                    gap: 0;
                }
                .console-shell-fab button {
                    padding: 8px 10px;
                    font-size: 12px;
                }
                .console-shell-fab-label { display: none; }
                .console-shell-fab-menu {
                    padding: 20px 16px;
                    max-height: 85vh;
                }
                .console-shell-fab-menu-grid { grid-template-columns: 1fr; gap: 8px; }
                .console-shell-fab-menu-tile-name { font-size: 13px; }
                .console-shell-fab-menu-tile-pitch { font-size: 10px; -webkit-line-clamp: 2; }
            }
        `;
        document.head.appendChild(style);
    }

    function el(tag, props = {}, children = []) {
        const node = document.createElement(tag);
        if (props.className) node.className = props.className;
        if (props.id) node.id = props.id;
        if (props.href) node.href = props.href;
        if (props.text) node.textContent = props.text;
        if (props.title) node.title = props.title;
        if (props.html) node.innerHTML = props.html;
        if (props.aria) {
            for (const [k, v] of Object.entries(props.aria)) {
                node.setAttribute(`aria-${k}`, v);
            }
        }
        for (const child of children) {
            if (child) node.appendChild(child);
        }
        return node;
    }

    function buildFab(fabConfig) {
        const scenes = Array.isArray(fabConfig.scenes) ? fabConfig.scenes : [];
        if (scenes.length === 0) return { root: null, overlay: null, open: () => {}, close: () => {} };

        const currentSlug = fabConfig.currentSlug || null;
        const currentIndex = scenes.findIndex((s) => s.slug === currentSlug);
        const currentScene = currentIndex >= 0 ? scenes[currentIndex] : null;

        const prevScene = scenes[((currentIndex - 1) + scenes.length) % scenes.length] || scenes[scenes.length - 1];
        const nextScene = scenes[(currentIndex + 1) % scenes.length] || scenes[0];

        const root = el('nav', {
            className: 'console-shell-fab',
            aria: { label: 'Scene navigation' },
        });

        const prevBtn = el('button', {
            className: 'console-shell-fab-prev',
            title: `Previous: ${prevScene.name} ([)`,
            html: '<i class="ti ti-chevron-left"></i>',
        });
        prevBtn.addEventListener('click', () => { location.href = prevScene.href; });
        root.appendChild(prevBtn);

        const label = el('div', { className: 'console-shell-fab-label' });
        if (currentScene) {
            label.appendChild(el('div', { className: 'console-shell-fab-label-name', text: currentScene.name }));
            label.appendChild(el('div', { className: 'console-shell-fab-label-idx', text: `${currentIndex + 1} / ${scenes.length}` }));
        } else {
            label.appendChild(el('div', { className: 'console-shell-fab-label-name', text: fabConfig.hubLabel || 'Gallery' }));
            label.appendChild(el('div', { className: 'console-shell-fab-label-idx', text: `${scenes.length} scenes` }));
        }
        root.appendChild(label);

        const galleryBtn = el('button', {
            className: 'console-shell-fab-gallery',
            title: 'Gallery (Esc)',
            html: '<i class="ti ti-grid-dots"></i>',
        });
        galleryBtn.addEventListener('click', () => {
            location.href = fabConfig.galleryHref || '../index.html';
        });
        root.appendChild(galleryBtn);

        const menuBtn = el('button', {
            className: 'console-shell-fab-menu-open',
            title: 'Full list (/)',
            html: '<i class="ti ti-menu-2"></i>',
        });
        root.appendChild(menuBtn);

        const nextBtn = el('button', {
            className: 'console-shell-fab-next',
            title: `Next: ${nextScene.name} (])`,
            html: '<i class="ti ti-chevron-right"></i>',
        });
        nextBtn.addEventListener('click', () => { location.href = nextScene.href; });
        root.appendChild(nextBtn);

        const overlay = el('div', { className: 'console-shell-fab-menu-overlay' });
        const menu = el('div', { className: 'console-shell-fab-menu' });
        menu.appendChild(el('div', { className: 'console-shell-fab-menu-title', text: fabConfig.menuTitle || 'Jump to scene' }));
        const menuGrid = el('div', { className: 'console-shell-fab-menu-grid' });
        scenes.forEach((scene, i) => {
            const tile = document.createElement('a');
            tile.className = 'console-shell-fab-menu-tile';
            if (scene.slug === currentSlug) tile.classList.add('current');
            tile.href = scene.href;
            tile.innerHTML = `
                <div class="console-shell-fab-menu-tile-head">
                    <span class="console-shell-fab-menu-tile-n">#${String(i + 1).padStart(2, '0')}</span>
                    <span class="console-shell-fab-menu-tile-name"></span>
                </div>
                <div class="console-shell-fab-menu-tile-pitch"></div>
            `;
            tile.querySelector('.console-shell-fab-menu-tile-name').textContent = scene.name || scene.slug;
            tile.querySelector('.console-shell-fab-menu-tile-pitch').textContent = scene.pitch || '';
            menuGrid.appendChild(tile);
        });
        menu.appendChild(menuGrid);
        overlay.appendChild(menu);

        const openMenu = () => overlay.classList.add('open');
        const closeMenu = () => overlay.classList.remove('open');
        menuBtn.addEventListener('click', openMenu);
        overlay.addEventListener('click', (event) => {
            if (event.target === overlay) closeMenu();
        });

        document.addEventListener('keydown', (event) => {
            const tag = event.target && event.target.tagName;
            if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
            if (event.key === '[') {
                event.preventDefault();
                location.href = prevScene.href;
            } else if (event.key === ']') {
                event.preventDefault();
                location.href = nextScene.href;
            } else if (event.key === '/') {
                event.preventDefault();
                if (overlay.classList.contains('open')) closeMenu();
                else openMenu();
            } else if (event.key === 'Escape') {
                if (overlay.classList.contains('open')) {
                    closeMenu();
                } else if (currentSlug) {
                    location.href = fabConfig.galleryHref || '../index.html';
                }
            }
        });

        return {
            root,
            overlay,
            open: openMenu,
            close: closeMenu,
        };
    }

    function mount(opts = {}) {
        ensureStyles();

        document.body.classList.add('console-shell-body');
        if (opts.theme) {
            const themes = String(opts.theme).split(/\s+/).filter(Boolean);
            for (const t of themes) document.body.classList.add(t);
        }

        const header = el('header', { className: 'console-shell-header' });

        const left = el('div', { className: 'console-shell-header-left' });
        if (opts.backHref !== false) {
            const back = el('a', {
                className: 'console-shell-back',
                href: opts.backHref || '../index.html',
                html: '<i class="ti ti-arrow-left"></i> BACK',
                aria: { label: 'Back to gallery' },
            });
            left.appendChild(back);
        }
        const titleBlock = el('div', { className: 'console-shell-title-block' });
        titleBlock.appendChild(el('h1', { className: 'console-shell-title', text: opts.title || '' }));
        if (opts.subtitle) {
            titleBlock.appendChild(el('p', { className: 'console-shell-subtitle', text: opts.subtitle }));
        }
        left.appendChild(titleBlock);
        header.appendChild(left);

        const right = el('nav', { className: 'console-shell-header-right', aria: { label: 'Header nav' } });
        if (opts.headerRight && opts.headerRight instanceof Node) {
            right.appendChild(opts.headerRight);
        }
        header.appendChild(right);

        const stage = el('main', {
            className: 'console-shell-stage',
            id: opts.stageId || 'consoleShellStage',
            aria: { label: opts.title || 'stage' },
        });

        document.body.insertBefore(header, document.body.firstChild);
        document.body.appendChild(stage);

        let fabResult = { root: null, overlay: null, open: () => {}, close: () => {} };
        if (opts.fab && typeof opts.fab === 'object') {
            fabResult = buildFab(opts.fab);
            if (fabResult.root) document.body.appendChild(fabResult.root);
            if (fabResult.overlay) document.body.appendChild(fabResult.overlay);
        }

        function setStatus(message) {
            const existing = stage.querySelector('.console-shell-status');
            if (existing) existing.remove();
            const status = el('div', { className: 'console-shell-status', text: message });
            stage.appendChild(status);
            return status;
        }
        function clearStatus() {
            const existing = stage.querySelector('.console-shell-status');
            if (existing) existing.remove();
        }
        function addHud(text) {
            const hud = el('div', { className: 'console-shell-hud', text });
            stage.appendChild(hud);
            return hud;
        }
        function setTitle(title) {
            const el = header.querySelector('.console-shell-title');
            if (el) el.textContent = title;
        }

        return {
            header,
            stage,
            fab: fabResult.root,
            fabOverlay: fabResult.overlay,
            setStatus,
            clearStatus,
            addHud,
            setTitle,
            toggleFabMenu: (open) => {
                if (open === true) fabResult.open();
                else if (open === false) fabResult.close();
                else if (fabResult.overlay && fabResult.overlay.classList.contains('open')) fabResult.close();
                else fabResult.open();
            },
        };
    }

    UI.ConsoleShell = {
        mount,
        version: CHROME_VERSION,
    };
})(window, document);
