(function(window, document) {
    'use strict';

    const registry = window.UIThemeRegistry;
    const root = document.querySelector('[data-ui-theme-page]');

    if (!registry || !root) {
        return;
    }

    const themeId = registry.normalize(root.dataset.uiThemePage);
    const theme = registry.get(themeId);
    const previewFrame = document.getElementById('theme-preview-frame');
    const previewOpen = document.getElementById('theme-preview-open');
    const previewLabel = document.getElementById('theme-preview-label');
    const runtimeSnippet = document.getElementById('theme-runtime-snippet');
    const cssSnippet = document.getElementById('theme-css-snippet');

    function setText(selector, value) {
        const target = root.querySelector(selector);
        if (target) {
            target.textContent = value;
        }
    }

    function setClass(selector, value) {
        const target = root.querySelector(selector);
        if (target) {
            target.className = value;
        }
    }

    function previewUrl(mode) {
        return `/preview.html?theme=${theme.id}&mode=${mode}`;
    }

    function runtimeCode(mode) {
        return `<script src="https://ui.mullmania.com/ui.js" data-ui-theme="${theme.id}" data-ui-mode="${mode}"><\/script>`;
    }

    function cssCode() {
        return `<link rel="stylesheet" href="https://ui.mullmania.com/${theme.id}/style.css">`;
    }

    function setMode(mode) {
        const normalizedMode = registry.normalizeMode(mode);

        if (previewFrame) {
            previewFrame.src = previewUrl(normalizedMode);
            previewFrame.title = `${theme.name} theme preview`;
        }

        if (previewOpen) {
            previewOpen.href = previewUrl(normalizedMode);
        }

        if (previewLabel) {
            previewLabel.textContent = `${theme.id} / ${normalizedMode}`;
        }

        if (runtimeSnippet) {
            runtimeSnippet.textContent = runtimeCode(normalizedMode);
        }

        root.querySelectorAll('[data-mode]').forEach((button) => {
            button.classList.toggle('active', button.dataset.mode === normalizedMode);
            button.setAttribute('aria-pressed', button.dataset.mode === normalizedMode ? 'true' : 'false');
        });
    }

    setClass('[data-theme-page-role="icon"]', theme.icon);
    setText('[data-theme-page-role="title"]', `${theme.name} Theme`);
    setText('[data-theme-page-role="description"]', theme.description);

    if (cssSnippet) {
        cssSnippet.textContent = cssCode();
    }

    root.querySelectorAll('[data-mode]').forEach((button) => {
        button.addEventListener('click', () => setMode(button.dataset.mode));
    });

    const copyCssButton = document.getElementById('copy-css-snippet');
    if (copyCssButton) {
        copyCssButton.addEventListener('click', async () => {
            await navigator.clipboard.writeText(cssSnippet?.textContent || cssCode());
        });
    }

    const copyRuntimeButton = document.getElementById('copy-runtime-snippet');
    if (copyRuntimeButton) {
        copyRuntimeButton.addEventListener('click', async () => {
            await navigator.clipboard.writeText(runtimeSnippet?.textContent || runtimeCode(registry.defaultMode));
        });
    }

    setMode(registry.defaultMode);
})(window, document);
