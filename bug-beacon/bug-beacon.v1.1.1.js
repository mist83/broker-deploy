/**
 * Bug Beacon Library
 * @version 1.1.0
 * @description Error monitoring FAB that lights up when bugs are detected
 * @license MIT
 * 
 * USAGE:
 * <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/tabler-icons.min.css">
 * <script src="https://bug-beacon.mullmania.com/bug-beacon.js"></script>
 */

(function(global) {
    'use strict';

    if (!global || !global.document) {
        return;
    }

    const window = global;
    const document = global.document;

// ==================== FAB MANAGER (DO NOT EDIT - See DRIFT WARNING) ====================
// Source: https://vizio-data-ingestion-resources.s3.us-west-2.amazonaws.com/fab-manager/fab-manager-core.js
// WARNING: This code is duplicated across libraries. Changes MUST be synced manually until CI/CD is implemented.

if (!window.FABCollection) {
    window.FABCollection = (function() {
        'use strict';

        const fabs = [];
        let container = null;
        let activeSidebar = null;
        let dragState = {
            isDragging: false,
            fabId: null,
            startX: 0,
            startY: 0,
            offsetX: 0,
            offsetY: 0
        };

        function initContainer() {
            if (container) return container;

            container = document.getElementById('fab-area');
            if (!container) {
                container = document.createElement('div');
                container.id = 'fab-area';
                
                const savedPosition = loadPosition();
                
                container.style.cssText = `
                    position: fixed;
                    bottom: ${savedPosition.bottom};
                    right: ${savedPosition.right};
                    display: flex;
                    flex-direction: row-reverse;
                    gap: 12px;
                    align-items: center;
                    z-index: 999996;
                    pointer-events: none;
                `;
                document.body.appendChild(container);

                setupDragging();
            }

            return container;
        }

        function loadPosition() {
            try {
                const saved = localStorage.getItem('fab-area-position');
                if (saved) {
                    return JSON.parse(saved);
                }
            } catch (e) {
                console.warn('[FAB Manager] Error loading position:', e);
            }
            return { bottom: '24px', right: '24px' };
        }

        function savePosition(bottom, right) {
            try {
                localStorage.setItem('fab-area-position', JSON.stringify({ bottom, right }));
            } catch (e) {
                console.warn('[FAB Manager] Error saving position:', e);
            }
        }

        function setupDragging() {
            let isDragging = false;
            let startX, startY, startBottom, startRight;

            container.addEventListener('mousedown', (e) => {
                if (e.target.closest('button')) return;

                isDragging = true;
                startX = e.clientX;
                startY = e.clientY;

                const style = window.getComputedStyle(container);
                startBottom = parseInt(style.bottom);
                startRight = parseInt(style.right);

                container.style.cursor = 'grabbing';
                e.preventDefault();
            });

            document.addEventListener('mousemove', (e) => {
                if (!isDragging) return;

                const deltaX = startX - e.clientX;
                const deltaY = e.clientY - startY;

                const newBottom = Math.max(0, Math.min(window.innerHeight - 80, startBottom + deltaY));
                const newRight = Math.max(0, Math.min(window.innerWidth - 80, startRight + deltaX));

                container.style.bottom = newBottom + 'px';
                container.style.right = newRight + 'px';
            });

            document.addEventListener('mouseup', () => {
                if (isDragging) {
                    isDragging = false;
                    container.style.cursor = '';

                    savePosition(container.style.bottom, container.style.right);
                }
            });
        }

        function register(config) {
            const fabContainer = initContainer();

            const fab = document.createElement('button');
            fab.id = `fab-${config.id}`;
            fab.className = 'fab-button';
            fab.type = 'button';
            fab.innerHTML = `<i class="${config.icon}"></i>`;
            fab.title = config.title || '';
            
            fab.style.cssText = `
                width: 56px;
                height: 56px;
                border-radius: 50%;
                background: ${config.color || '#2196F3'};
                border: none;
                color: white;
                font-size: 28px;
                cursor: pointer;
                box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                display: ${config.hidden ? 'none' : 'flex'};
                align-items: center;
                justify-content: center;
                transition: transform 0.2s, box-shadow 0.2s;
                pointer-events: auto;
            `;

            fab.addEventListener('mouseenter', () => {
                fab.style.transform = 'scale(1.1)';
                fab.style.boxShadow = '0 6px 16px rgba(0,0,0,0.4)';
            });

            fab.addEventListener('mouseleave', () => {
                fab.style.transform = 'scale(1)';
                fab.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
            });

            fab.addEventListener('click', () => {
                if (config.onClick) {
                    config.onClick();
                }
            });

            fabContainer.appendChild(fab);

            fabs.push({
                id: config.id,
                element: fab,
                config: config
            });

            return fab;
        }

        function hideFABs() {
            if (container) {
                container.style.display = 'none';
            }
        }

        function showFABs() {
            if (container) {
                container.style.display = 'flex';
            }
        }

        function updateFABColor(fabId, color) {
            const fab = fabs.find(f => f.id === fabId);
            if (fab && fab.element) {
                fab.element.style.background = color;
            }
        }

        function showFAB(fabId) {
            const fab = fabs.find(f => f.id === fabId);
            if (fab && fab.element) {
                fab.element.style.display = 'flex';
            }
        }

        function hideFAB(fabId) {
            const fab = fabs.find(f => f.id === fabId);
            if (fab && fab.element) {
                fab.element.style.display = 'none';
            }
        }

        return {
            register,
            hideFABs,
            showFABs,
            updateFABColor,
            showFAB,
            hideFAB
        };
    })();
}
// ==================== END FAB MANAGER ====================

(function(window, document) {
    'use strict';

    let isOpen = false;
    let panel = null;
    let errors = [];
    let layoutIssues = [];
    let originalConsoleError = console.error;
    let suppressConsoleErrorCapture = false;
    let layoutScanScheduled = false;
    let layoutResizeObserver = null;
    let layoutMutationObserver = null;

    // Register FAB (hidden by default)
    function createFAB() {
        window.FABCollection.register({
            id: 'bug-beacon',
            icon: 'ti ti-bug',
            color: '#dc3545',
            title: 'Bug Beacon - Error Monitor',
            hidden: true,
            onClick: togglePanel
        });

        // Start error monitoring immediately
        attachErrorListeners();
        // Start layout-issue monitoring (DOM mutations, viewport resize, initial settle).
        attachLayoutWatcher();
    }

    // Toggle panel open/close
    function togglePanel() {
        if (isOpen) {
            closePanel();
        } else {
            openPanel();
        }
    }

    // Open sidebar panel
    function openPanel() {
        if (isOpen) return;

        // Hide all FABs when opening sidebar
        window.FABCollection.hideFABs();

        panel = document.createElement('div');
        panel.id = 'bug-beacon-panel';
        panel.style.cssText = `
            position: fixed;
            top: 0;
            right: 0;
            width: 400px;
            height: 100vh;
            background: #ffffff;
            box-shadow: -8px 0 24px rgba(0,0,0,0.3);
            z-index: 1000000;
            overflow-y: auto;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        `;

        const errorCount = errors.length;
        const layoutCount = layoutIssues.length;
        const totalCount = errorCount + layoutCount;
        const errorReport = generateLLMFriendlyReport();

        panel.innerHTML = `
            <div style="padding: 20px; border-bottom: 2px solid #f0f0f0;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <h2 style="margin: 0; font-size: 20px;"><i class="ti ti-bug"></i> Bug Beacon</h2>
                    <div style="display: flex; gap: 8px; align-items: center;">
                        <button type="button" id="bug-beacon-clear" style="background: none; border: none; font-size: 18px; cursor: pointer; color: #dc3545; padding: 4px;" title="Clear errors"><i class="ti ti-trash"></i></button>
                        <button type="button" id="bug-beacon-close" style="background: none; border: none; font-size: 24px; cursor: pointer; color: #666;">&times;</button>
                    </div>
                </div>
            </div>
            <div id="bug-beacon-content" style="padding: 20px;">
                <div style="margin-bottom: 15px;">
                    <p style="font-weight: 600; margin-bottom: 10px;">JS errors: ${errorCount} &middot; Layout issues: ${layoutCount}</p>
                    <p style="font-size: 13px; color: #666;">LLM-friendly report for debugging:</p>
                </div>
                <div style="position: relative; background: #1e1e1e; color: #d4d4d4; padding: 15px; border-radius: 4px; max-height: 400px; overflow-y: auto; font-family: monospace; font-size: 12px; line-height: 1.6;">
                    <button type="button" id="bug-beacon-copy" style="position: absolute; top: 8px; right: 8px; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); color: #d4d4d4; padding: 4px 6px; border-radius: 3px; cursor: pointer; font-size: 11px;" title="Copy report"><i class="ti ti-copy"></i></button>
                    <pre style="margin: 0; white-space: pre-wrap; word-wrap: break-word;">${escapeHtml(errorReport)}</pre>
                </div>
                <div style="margin-top: 15px;">
                    <label style="display: block; margin-bottom: 5px; font-weight: 600; font-size: 13px;">Additional Context (Optional)</label>
                    <textarea id="bug-beacon-context" placeholder="Describe what you were doing when the error occurred..." style="width: 100%; min-height: 80px; padding: 8px; border: 1px solid #ddd; border-radius: 4px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 13px; resize: vertical;"></textarea>
                </div>
                <div style="position: sticky; bottom: 0; background: white; padding: 15px 0; margin-top: 15px; border-top: 2px solid #f0f0f0;">
                    <button type="button" id="bug-beacon-autofix" style="width: 100%; padding: 12px; background: #28a745; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 14px; font-weight: 600;"><i class="ti ti-wand"></i> Auto Fix</button>
                </div>
            </div>
        `;

        document.body.appendChild(panel);

        document.getElementById('bug-beacon-close').addEventListener('click', closePanel);
        document.getElementById('bug-beacon-copy').addEventListener('click', copyErrors);
        document.getElementById('bug-beacon-clear').addEventListener('click', clearErrors);
        document.getElementById('bug-beacon-autofix').addEventListener('click', showAutoFixModal);

        isOpen = true;
    }

    // Close sidebar panel
    function closePanel() {
        if (!isOpen || !panel) return;

        panel.remove();
        panel = null;
        isOpen = false;

        // Show all FABs when closing sidebar
        window.FABCollection.showFABs();
    }

    // Attach error listeners
    function attachErrorListeners() {
        originalConsoleError = console.error;

        // Capture window errors
        window.addEventListener('error', (e) => {
            captureError({
                type: 'Error',
                message: e.message,
                filename: e.filename,
                lineno: e.lineno,
                colno: e.colno,
                stack: e.error?.stack || 'No stack trace',
                timestamp: new Date().toISOString()
            });
        });

        // Capture promise rejections
        window.addEventListener('unhandledrejection', (e) => {
            captureError({
                type: 'Unhandled Promise Rejection',
                message: e.reason?.message || String(e.reason),
                stack: e.reason?.stack || 'No stack trace',
                timestamp: new Date().toISOString()
            });
        });

        // Override console.error to capture
        console.error = (...args) => {
            if (!suppressConsoleErrorCapture) {
                captureError({
                    type: 'Console Error',
                    message: args.map(a => String(a)).join(' '),
                    stack: new Error().stack || 'No stack trace',
                    timestamp: new Date().toISOString()
                });
            }

            originalConsoleError.apply(console, args);
        };
    }

    // Capture error and show FAB
    function captureError(error) {
        errors.push(error);

        // Show the FAB when an error is captured
        window.FABCollection.showFAB('bug-beacon');

        console.log('[Bug Beacon] Error captured:', error);
    }

    // ==================== LAYOUT WATCHER ====================
    // Scans the page for likely CSS issues (text clipped by overflow/ellipsis/line-clamp,
    // tiny text, scrollable containers with significant hidden content, horizontal viewport overflow).
    // Each issue lights up the FAB and appears in the LLM-friendly report alongside JS errors.

    function attachLayoutWatcher() {
        const scheduleScan = (reason) => {
            if (layoutScanScheduled) return;
            layoutScanScheduled = true;
            // Coalesce rapid triggers and wait for layout to settle.
            setTimeout(() => {
                layoutScanScheduled = false;
                scanLayoutIssues(reason);
            }, 250);
        };

        // Initial scan after load + a slack for late layout shifts.
        if (document.readyState === 'complete') {
            scheduleScan('initial');
        } else {
            window.addEventListener('load', () => scheduleScan('initial'));
        }

        // Re-scan on viewport resize.
        if (typeof ResizeObserver === 'function') {
            try {
                layoutResizeObserver = new ResizeObserver(() => scheduleScan('resize'));
                layoutResizeObserver.observe(document.documentElement);
            } catch (e) {
                reportInternalError('[Bug Beacon] ResizeObserver attach failed:', e);
            }
        } else {
            window.addEventListener('resize', () => scheduleScan('resize'));
        }

        // Re-scan on DOM mutations (debounced via scheduleScan).
        if (typeof MutationObserver === 'function') {
            try {
                layoutMutationObserver = new MutationObserver(() => scheduleScan('mutation'));
                layoutMutationObserver.observe(document.body, {
                    childList: true,
                    subtree: true,
                    attributes: true,
                    attributeFilter: ['class', 'style']
                });
            } catch (e) {
                reportInternalError('[Bug Beacon] MutationObserver attach failed:', e);
            }
        }
    }

    function scanLayoutIssues(reason) {
        if (!document.body) return;
        const found = [];
        const viewportW = window.innerWidth;
        const all = document.body.querySelectorAll('*');
        for (const el of all) {
            // Skip bug-beacon's own DOM so we don't recurse on ourselves.
            if (el.id === 'fab-area' || el.id === 'bug-beacon-panel' || el.id === 'bug-beacon-modal') continue;
            if (el.closest && (el.closest('#fab-area') || el.closest('#bug-beacon-panel') || el.closest('#bug-beacon-modal'))) continue;

            const cs = getComputedStyle(el);
            if (cs.display === 'none' || cs.visibility === 'hidden') continue;
            const r = el.getBoundingClientRect();
            if (r.width <= 1 || r.height <= 1) continue;
            // Skip screen-reader-only patterns (clip-path:inset(50%) / absolute clip / opacity:0+pointer-events:none).
            if (cs.position === 'absolute' && (cs.clipPath && (cs.clipPath.indexOf('inset(50%)') >= 0 || cs.clipPath.indexOf('inset(100%)') >= 0))) continue;
            if (cs.opacity === '0' && cs.pointerEvents === 'none') continue;

            const text = (el.textContent || '').trim();

            // 1. Single-line text-overflow:ellipsis clipping (content overflows visible)
            if (cs.textOverflow === 'ellipsis' && cs.whiteSpace === 'nowrap'
                    && el.scrollWidth > el.clientWidth + 1 && text.length > 0) {
                pushLayoutIssue(found, el, { kind: 'ellipsis-clip', sel: selectorForLayoutWatcher(el), text: text.slice(0, 80) });
            }

            // 2. Multi-line -webkit-line-clamp clipping
            if (cs.webkitLineClamp && cs.webkitLineClamp !== 'none' && cs.webkitLineClamp !== 'auto'
                    && el.scrollHeight > el.clientHeight + 1 && text.length > 0) {
                pushLayoutIssue(found, el, { kind: 'line-clamp', sel: selectorForLayoutWatcher(el), clamp: cs.webkitLineClamp, text: text.slice(0, 80) });
            }

            // 3. overflow:hidden silently swallowing text (no ellipsis to signal it)
            if ((cs.overflow === 'hidden' || cs.overflowX === 'hidden' || cs.overflowY === 'hidden')
                    && (el.scrollWidth > el.clientWidth + 1 || el.scrollHeight > el.clientHeight + 1)
                    && text.length > 0 && el.children.length === 0
                    && cs.textOverflow !== 'ellipsis'
                    && (!cs.webkitLineClamp || cs.webkitLineClamp === 'none' || cs.webkitLineClamp === 'auto')) {
                pushLayoutIssue(found, el, { kind: 'overflow-hidden-clip', sel: selectorForLayoutWatcher(el), text: text.slice(0, 80) });
            }

            // 4. Horizontal viewport overflow (content pushes past viewport width — common cause of mobile sideways scroll)
            if (r.right > viewportW + 2 && cs.position !== 'fixed') {
                pushLayoutIssue(found, el, { kind: 'overflow-x-viewport', sel: selectorForLayoutWatcher(el), right: Math.round(r.right), vp: viewportW });
            }

            // 5. Tiny visible text (< 11px in body text)
            const fontPx = parseFloat(cs.fontSize);
            if (fontPx && fontPx < 11 && text.length > 0 && el.children.length === 0) {
                pushLayoutIssue(found, el, { kind: 'tiny-text', sel: selectorForLayoutWatcher(el), font: fontPx, text: text.slice(0, 40) });
            }

            // 6. Scrollable container with significant hidden content (more than 30% past the fold)
            if ((cs.overflowY === 'auto' || cs.overflowY === 'scroll')
                    && el.scrollHeight > el.clientHeight * 1.3 && el.clientHeight > 200) {
                pushLayoutIssue(found, el, { kind: 'hidden-scroll-content', sel: selectorForLayoutWatcher(el), hidden: el.scrollHeight - el.clientHeight, visible: el.clientHeight, ratio: (el.scrollHeight / el.clientHeight).toFixed(2) });
            }
        }

        // Dedupe by kind+selector+text
        const seen = new Set();
        const unique = found.filter(i => {
            const k = i.kind + '|' + i.sel + '|' + (i.text || '');
            if (seen.has(k)) return false;
            seen.add(k);
            return true;
        });

        // Reset the snapshot — the watcher reports current state, not cumulative.
        const prevCount = layoutIssues.length;
        layoutIssues = unique.map(i => ({ ...i, viewport: { w: viewportW, h: window.innerHeight }, reason, timestamp: new Date().toISOString() }));

        if (layoutIssues.length > 0) {
            window.FABCollection.showFAB('bug-beacon');
        } else if (prevCount > 0 && errors.length === 0) {
            // Issues cleared and no JS errors — hide the FAB.
            window.FABCollection.hideFAB('bug-beacon');
        }
    }

    function pushLayoutIssue(found, el, issue) {
        if (!isLayoutIssueIgnored(el, issue.kind)) {
            found.push(issue);
        }
    }

    function isLayoutIssueIgnored(el, kind) {
        if (!el || !el.closest) return false;
        const target = el.closest('[data-bug-beacon-ignore-layout]');
        if (!target) return false;

        const raw = (target.getAttribute('data-bug-beacon-ignore-layout') || '').trim().toLowerCase();
        if (!raw || raw === 'all' || raw === '*') return true;

        const tokens = raw.split(/[\s,]+/).filter(Boolean);
        return tokens.includes(String(kind || '').toLowerCase());
    }

    function selectorForLayoutWatcher(el) {
        if (el.id) return '#' + el.id;
        const cls = el.className && typeof el.className === 'string'
            ? '.' + el.className.split(/\s+/).filter(Boolean).slice(0, 2).join('.')
            : '';
        return el.tagName.toLowerCase() + cls;
    }

    // ==================== END LAYOUT WATCHER ====================


    // Generate LLM-friendly report
    function generateLLMFriendlyReport() {
        let report = `# Bug Beacon Report\n`;
        report += `Generated: ${new Date().toISOString()}\n`;
        report += `JS Errors: ${errors.length}\n`;
        report += `Layout Issues: ${layoutIssues.length}\n`;
        report += `URL: ${window.location.href}\n`;
        report += `Viewport: ${window.innerWidth} x ${window.innerHeight}\n`;
        report += `User Agent: ${navigator.userAgent}\n\n`;

        report += `## Errors\n\n`;

        errors.forEach((error, index) => {
            report += `### Error ${index + 1}: ${error.type}\n`;
            report += `Time: ${error.timestamp}\n`;
            report += `Message: ${error.message}\n`;
            
            if (error.filename) {
                report += `File: ${error.filename}:${error.lineno}:${error.colno}\n`;
            }
            
            report += `\nStack Trace:\n\`\`\`\n${error.stack}\n\`\`\`\n\n`;
            report += `-------------------------------\n\n`;
        });

        if (layoutIssues.length > 0) {
            report += `## Layout Issues\n\n`;
            layoutIssues.forEach((issue, index) => {
                report += `### Issue ${index + 1}: ${issue.kind}\n`;
                report += `Selector: ${issue.sel}\n`;
                if (issue.text) report += `Text: ${JSON.stringify(issue.text)}\n`;
                if (issue.font) report += `Font size: ${issue.font}px (below 11px threshold)\n`;
                if (issue.clamp) report += `Line clamp: ${issue.clamp}\n`;
                if (issue.right && issue.vp) report += `Right edge: ${issue.right}px vs viewport ${issue.vp}px\n`;
                if (issue.hidden) report += `Hidden content: ${issue.hidden}px past ${issue.visible}px visible (ratio ${issue.ratio})\n`;
                report += `Viewport at scan: ${issue.viewport.w} x ${issue.viewport.h}\n`;
                report += `Triggered by: ${issue.reason}\n\n`;
            });
            report += `-------------------------------\n\n`;
        }

        return report;
    }

    // Show Auto Fix modal
    function showAutoFixModal() {
        const modal = document.createElement('div');
        modal.id = 'bug-beacon-modal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000001;
        `;
        
        modal.innerHTML = `
            <div style="background: white; padding: 30px; border-radius: 8px; max-width: 500px; width: 90%; text-align: center;">
                <h3 style="margin: 0 0 15px 0; color: #dc3545;"><i class="ti ti-alert-triangle"></i> Feature Disabled</h3>
                <p style="margin: 0 0 20px 0; color: #666; line-height: 1.6;">
                     Company policy earmarks automatable tasks for human development
                </p>
                <button id="bug-beacon-modal-close" style="padding: 10px 24px; background: #0071CE; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 14px;">Got it</button>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        document.getElementById('bug-beacon-modal-close').addEventListener('click', () => {
            modal.remove();
        });
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    // Copy errors to clipboard
    function copyErrors() {
        let report = generateLLMFriendlyReport();
        
        // Add user context if provided
        const contextField = document.getElementById('bug-beacon-context');
        const userContext = contextField?.value.trim();
        if (userContext) {
            report += `\n## User Context\n\n${userContext}\n`;
        }
        
        const writeToClipboard = navigator.clipboard?.writeText
            ? () => navigator.clipboard.writeText(report)
            : () => legacyCopyToClipboard(report);

        writeToClipboard().then(() => {
            const btn = document.getElementById('bug-beacon-copy');
            const originalText = btn.innerHTML;
            btn.innerHTML = '<i class="ti ti-check"></i> Copied!';
            btn.style.background = '#28a745';
            setTimeout(() => {
                btn.innerHTML = originalText;
                btn.style.background = '#0071CE';
            }, 2000);
        }).catch(err => {
            reportInternalError('[Bug Beacon] Copy failed:', err);
            alert('Failed to copy to clipboard');
        });
    }

    function reportInternalError(...args) {
        suppressConsoleErrorCapture = true;
        try {
            originalConsoleError.apply(console, args);
        } finally {
            suppressConsoleErrorCapture = false;
        }
    }

    function legacyCopyToClipboard(text) {
        return new Promise((resolve, reject) => {
            const textarea = document.createElement('textarea');
            textarea.value = text;
            textarea.setAttribute('readonly', '');
            textarea.style.position = 'fixed';
            textarea.style.opacity = '0';
            textarea.style.pointerEvents = 'none';
            document.body.appendChild(textarea);
            textarea.focus();
            textarea.select();

            try {
                const successful = document.execCommand('copy');
                textarea.remove();
                if (successful) {
                    resolve();
                } else {
                    reject(new Error('execCommand(copy) returned false'));
                }
            } catch (error) {
                textarea.remove();
                reject(error);
            }
        });
    }

    // Clear errors and layout issues, hide FAB
    function clearErrors() {
        errors = [];
        layoutIssues = [];

        // Hide the FAB when both error and layout snapshots are clear.
        window.FABCollection.hideFAB('bug-beacon');

        // Close the panel
        closePanel();
    }

    // Escape HTML for display
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Initialize
    function init() {
        console.log('[Bug Beacon] Library loaded - monitoring for errors');
        
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', createFAB);
        } else {
            createFAB();
        }
    }

    init();

})(window, document);

})(typeof window !== 'undefined' ? window : null);
