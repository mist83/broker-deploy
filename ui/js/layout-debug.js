/**
 * Layout Debug Module
 * @version 2.0.0
 * @description Detects and warns about layout overflow issues
 */

class LayoutDebug {
    constructor(config = {}) {
        this.config = {
            enabled: config.enabled !== false,
            autoFix: config.autoFix || false,
            logLevel: config.logLevel || 'warn'
        };
    }

    checkOverflows() {
        if (!this.config.enabled) return;

        const issues = [];
        const allElements = document.querySelectorAll('*');

        allElements.forEach(element => {
            const parent = element.parentElement;
            if (!parent) return;

            const elementRect = element.getBoundingClientRect();
            const parentRect = parent.getBoundingClientRect();

            // Check if element overflows parent
            const overflowsRight = elementRect.right > parentRect.right + 1;
            const overflowsBottom = elementRect.bottom > parentRect.bottom + 1;
            const overflowsLeft = elementRect.left < parentRect.left - 1;
            const overflowsTop = elementRect.top < parentRect.top - 1;

            if (overflowsRight || overflowsBottom || overflowsLeft || overflowsTop) {
                const issue = {
                    element: element,
                    parent: parent,
                    elementRect: {
                        width: elementRect.width,
                        height: elementRect.height,
                        right: elementRect.right,
                        bottom: elementRect.bottom
                    },
                    parentRect: {
                        width: parentRect.width,
                        height: parentRect.height,
                        right: parentRect.right,
                        bottom: parentRect.bottom
                    },
                    overflows: {
                        right: overflowsRight,
                        bottom: overflowsBottom,
                        left: overflowsLeft,
                        top: overflowsTop
                    }
                };

                issues.push(issue);

                // Log warning
                if (this.config.logLevel === 'warn') {
                    console.warn('[Layout Debug] Overflow detected:', {
                        element: element.tagName + (element.className ? '.' + element.className : ''),
                        parent: parent.tagName + (parent.className ? '.' + parent.className : ''),
                        overflows: issue.overflows
                    });
                }

                // Auto-fix if enabled
                if (this.config.autoFix) {
                    this.fixOverflow(element, issue);
                }
            }
        });

        if (issues.length > 0) {
            console.log(`[Layout Debug] Found ${issues.length} overflow issues`);
        }

        return issues;
    }

    fixOverflow(element, issue) {
        // Auto-fix: Add overflow: hidden to parent
        if (issue.overflows.right || issue.overflows.bottom) {
            issue.parent.style.overflow = 'hidden';
            console.log('[Layout Debug] Auto-fixed overflow on:', issue.parent.tagName);
        }
    }

    startMonitoring(interval = 5000) {
        if (!this.config.enabled) return;

        console.log('[Layout Debug] Starting overflow monitoring...');
        
        // Check immediately
        this.checkOverflows();
        
        // Check periodically
        this.monitorInterval = setInterval(() => {
            this.checkOverflows();
        }, interval);
    }

    stopMonitoring() {
        if (this.monitorInterval) {
            clearInterval(this.monitorInterval);
            this.monitorInterval = null;
            console.log('[Layout Debug] Stopped monitoring');
        }
    }
}

window.LayoutDebug = LayoutDebug;

// Auto-enable in debug mode
if (window.location.hostname === 'localhost' || window.location.search.includes('debug=true')) {
    const layoutDebugger = new LayoutDebug({ enabled: true, autoFix: false });
    window.addEventListener('load', () => {
        setTimeout(() => layoutDebugger.checkOverflows(), 1000);
    });
    console.log('[Layout Debug] Auto-enabled on localhost/debug mode');
}
