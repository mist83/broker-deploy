/**
 * Canonical UI runtime alias. Forwards any caller-supplied query (e.g. ?theme=)
 * to /js/ui.js. Cache freshness is handled by Cache-Control + ETag on the
 * framework assets; no asset-version query param is injected here.
 */

(function(window, document) {
    'use strict';

    const currentScript = document.currentScript;
    const currentUrl = currentScript?.src
        ? new URL(currentScript.src, window.location.href)
        : new URL('https://ui.mullmania.com/ui.js');
    const origin = currentUrl.origin || 'https://ui.mullmania.com';
    const runtimeUrl = new URL(`/js/ui.js${currentUrl.search || ''}`, origin).href;
    const bridge = ensureUiBridge();
    const script = document.createElement('script');

    script.src = runtimeUrl;
    script.async = false;
    forwardCompatibleAttributes(currentScript, script);
    script.addEventListener('load', () => bridge.resolve());
    script.addEventListener('error', () => bridge.reject(new Error(`[ui] Failed to load shared runtime: ${runtimeUrl}`)));

    (document.head || document.documentElement).appendChild(script);

    function ensureUiBridge() {
        if (window.__uiRuntimeAliasBridge) {
            return window.__uiRuntimeAliasBridge;
        }

        let resolveBridge;
        let rejectBridge;
        const bridgePromise = new Promise((resolve, reject) => {
            resolveBridge = resolve;
            rejectBridge = reject;
        });
        const UI = window.UI || {};

        function bridgeReady() {
            return bridgePromise.then(() => {
                if (window.UI && typeof window.UI.ready === 'function' && window.UI.ready !== bridgeReady) {
                    return window.UI.ready();
                }

                return window.UI;
            });
        }

        if (typeof UI.ready !== 'function') {
            UI.ready = bridgeReady;
        }

        if (typeof UI.onReady !== 'function') {
            UI.onReady = (callback) => bridgeReady().then(() => callback(window.UI));
        }

        window.UI = UI;
        window.__uiRuntimeAliasBridge = {
            promise: bridgePromise,
            resolve() {
                resolveBridge(window.UI);
                delete window.__uiRuntimeAliasBridge;
            },
            reject(error) {
                rejectBridge(error);
                delete window.__uiRuntimeAliasBridge;
            },
        };

        return window.__uiRuntimeAliasBridge;
    }

    function forwardCompatibleAttributes(sourceScript, targetScript) {
        if (!sourceScript?.attributes) {
            return;
        }

        for (const attribute of Array.from(sourceScript.attributes)) {
            const name = String(attribute.name || '').toLowerCase();
            if (!name || name === 'src' || name === 'async' || name === 'defer') {
                continue;
            }

            if (name.startsWith('data-') || name === 'nonce' || name === 'crossorigin' || name === 'referrerpolicy' || name === 'integrity') {
                targetScript.setAttribute(attribute.name, attribute.value);
            }
        }
    }
})(window, document);
