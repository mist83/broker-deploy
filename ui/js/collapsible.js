/**
 * Collapsible Section - Canon Primitive
 * @description Unified toggle logic with localStorage persistence
 * @license MIT
 *
 * USAGE:
 *   <div class="collapsible-section">
 *     <div class="collapsible-header">
 *       <span class="collapsible-toggle">>=</span>
 *       <i class="collapsible-icon ti ti-chart-bar"></i>
 *       <span class="collapsible-title">Analytics</span>
 *       <span class="collapsible-badge">7</span>
 *     </div>
 *     <div class="collapsible-content">...</div>
 *   </div>
 *
 *   UI.collapsible.init(document.getElementById('sidebar'), 'widgets');
 *
 * Companion stylesheet: ui.mullmania.com/js/collapsible.css
 */

(function() {
    'use strict';

    const STORAGE_KEY = 'collapsible-sections-state';

    /**
     * Initialize all collapsible sections in a container
     * @param {HTMLElement} container - Container with .collapsible-section elements
     * @param {string} namespace - Namespace for localStorage (e.g., 'widgets', 'data', 'settings')
     */
    function initCollapsible(container, namespace = 'default') {
        if (!container) {
            console.warn('[UI.collapsible] Container not provided');
            return;
        }

        const sections = container.querySelectorAll('.collapsible-section');
        const savedState = loadState(namespace);

        sections.forEach((section, index) => {
            const header = section.querySelector('.collapsible-header');
            const content = section.querySelector('.collapsible-content');
            const toggle = section.querySelector('.collapsible-toggle');

            if (!header || !content || !toggle) {
                console.warn('[UI.collapsible] Missing required elements in section', index);
                return;
            }

            // Generate unique ID for this section
            const sectionId = section.dataset.sectionId || `section-${namespace}-${index}`;
            section.dataset.sectionId = sectionId;

            // Load saved state or default to collapsed
            const isExpanded = savedState[sectionId] ?? false;

            // Apply initial state
            if (isExpanded) {
                content.style.display = 'block';
                toggle.style.transform = 'rotate(90deg)';
                section.classList.add('expanded');
            } else {
                content.style.display = 'none';
                toggle.style.transform = 'rotate(0deg)';
                section.classList.remove('expanded');
            }

            // Add click handler
            header.addEventListener('click', (e) => {
                // Don't toggle if clicking on a button inside header
                if (e.target.closest('button') && !e.target.closest('.collapsible-header')) {
                    return;
                }

                toggleSection(section, namespace);
            });
        });

        console.log(`[UI.collapsible] Initialized ${sections.length} sections in namespace: ${namespace}`);
    }

    /**
     * Toggle a single section
     */
    function toggleSection(section, namespace) {
        const content = section.querySelector('.collapsible-content');
        const toggle = section.querySelector('.collapsible-toggle');
        const sectionId = section.dataset.sectionId;

        if (!content || !toggle) return;

        const isExpanded = content.style.display !== 'none';

        // Toggle display
        if (isExpanded) {
            content.style.display = 'none';
            toggle.style.transform = 'rotate(0deg)';
            section.classList.remove('expanded');
        } else {
            content.style.display = 'block';
            toggle.style.transform = 'rotate(90deg)';
            section.classList.add('expanded');
        }

        // Save state
        saveState(namespace, sectionId, !isExpanded);
    }

    /**
     * Load state from localStorage
     */
    function loadState(namespace) {
        try {
            const saved = localStorage.getItem(`${STORAGE_KEY}-${namespace}`);
            return saved ? JSON.parse(saved) : {};
        } catch (e) {
            console.warn('[UI.collapsible] Error loading state:', e);
            return {};
        }
    }

    /**
     * Save state to localStorage
     */
    function saveState(namespace, sectionId, isExpanded) {
        try {
            const state = loadState(namespace);
            state[sectionId] = isExpanded;
            localStorage.setItem(`${STORAGE_KEY}-${namespace}`, JSON.stringify(state));
        } catch (e) {
            console.warn('[UI.collapsible] Error saving state:', e);
        }
    }

    /**
     * Clear all saved states (for reset functionality)
     */
    function clearAllStates() {
        try {
            const keys = Object.keys(localStorage);
            keys.forEach(key => {
                if (key.startsWith(STORAGE_KEY)) {
                    localStorage.removeItem(key);
                }
            });
            console.log('[UI.collapsible] Cleared all saved states');
        } catch (e) {
            console.warn('[UI.collapsible] Error clearing states:', e);
        }
    }

    /**
     * Expand all sections in a namespace
     */
    function expandAll(container, namespace) {
        const sections = container.querySelectorAll('.collapsible-section');
        sections.forEach(section => {
            const content = section.querySelector('.collapsible-content');
            const toggle = section.querySelector('.collapsible-toggle');
            const sectionId = section.dataset.sectionId;

            if (content && toggle) {
                content.style.display = 'block';
                toggle.style.transform = 'rotate(90deg)';
                section.classList.add('expanded');
                saveState(namespace, sectionId, true);
            }
        });
        console.log(`[UI.collapsible] Expanded all sections in: ${namespace}`);
    }

    /**
     * Collapse all sections in a namespace
     */
    function collapseAll(container, namespace) {
        const sections = container.querySelectorAll('.collapsible-section');
        sections.forEach(section => {
            const content = section.querySelector('.collapsible-content');
            const toggle = section.querySelector('.collapsible-toggle');
            const sectionId = section.dataset.sectionId;

            if (content && toggle) {
                content.style.display = 'none';
                toggle.style.transform = 'rotate(0deg)';
                section.classList.remove('expanded');
                saveState(namespace, sectionId, false);
            }
        });
        console.log(`[UI.collapsible] Collapsed all sections in: ${namespace}`);
    }

    // Expose under window.UI.collapsible (canon namespace)
    const UI = window.UI || {};
    UI.collapsible = {
        init: initCollapsible,
        toggle: toggleSection,
        expandAll: expandAll,
        collapseAll: collapseAll,
        clearStates: clearAllStates,
    };
    window.UI = UI;

    console.log('[UI.collapsible] Module loaded');
})();
