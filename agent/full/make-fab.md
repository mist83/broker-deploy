# Make FAB - Floating Action Button Wrapper Generator

## TRIGGER
When the user says "make a fab", "make this into a fab", "turn this into a fab", "create a fab", "wrap this in a fab", or similar phrases, activate this command to wrap HTML content in a FAB Collection library.

## PHILOSOPHY
The FAB Collection pattern allows multiple floating action buttons (FABs) to coexist on a page, coordinating their sidebar panels. Each FAB library is self-contained - one script tag loads everything. The FAB Manager code is embedded (with DRIFT WARNING) in each library to avoid external dependencies.

This command automates the pattern: take any HTML content, wrap it in FAB infrastructure, generate deployment-ready files, and upload to S3.

## WHAT IS A FAB?
A FAB (Floating Action Button) is a circular button that appears in the bottom-right of the page. When clicked, it opens a sidebar panel from the right side. The FAB Collection system allows multiple FABs to coexist - when one sidebar opens, all FAB buttons hide. When the sidebar closes, all FABs reappear.

**Key Pattern:** Each FAB library embeds the FAB Manager code. The first library creates `window.FABCollection`, subsequent libraries reuse it. This is intentional to avoid external script dependencies.

## USER PROMPTS

Use `ask_followup_question` tool to gather required information:

### Prompt 1: FAB Name (Required)
**Question:** "What should this FAB be called? (Use kebab-case: lowercase with hyphens, e.g., 'rocket-launcher', 'task-manager')"
**Validation:** 
- Must be kebab-case (lowercase letters, numbers, hyphens only)
- No spaces, no special characters except hyphens
- Cannot start or end with hyphen

**Examples:** "data-viewer", "chart-tool", "config-panel"

### Prompt 2: Tabler Icon (Required)
**Question:** "What Tabler icon should the FAB use? (Browse icons at https://tabler.io/icons - provide the icon name like 'rocket', 'database', 'settings')"
**Validation:**
- Icon name only (e.g., "rocket" not "ti-rocket")
- Will be converted to "ti ti-{icon}" format

**Examples:** "rocket", "database", "chart-line", "settings", "pencil"

### Prompt 3: FAB Color (Required)
**Question:** "What color should the FAB be? (Provide hex code like #FF5722 or a color name)"
**Validation:**
- Must be valid hex code (#RRGGBB format) OR common color name
- Convert color names to hex (blue → #2196F3, green → #4CAF50, red → #f44336, orange → #FF5722, purple → #9C27B0)

**Default if invalid:** #2196F3 (blue)

### Prompt 4: Tooltip Text (Optional)
**Question:** "What tooltip text should appear on hover? (Leave empty for FAB name)"
**Default:** Capitalize the FAB name (e.g., "rocket-launcher" → "Rocket Launcher")

### Prompt 5: HTML Content Source (Required)
**Question:** "Where is the HTML content for the sidebar?"
**Options:** 
- [ ] Inline HTML (I'll provide the HTML directly)
- [ ] HTML file path (Load from existing file)
- [ ] URL (Load from a URL)

If "HTML file path" selected, ask:
**Question:** "What is the path to the HTML file?"
**Validation:** File must exist

If "URL" selected, ask:
**Question:** "What is the URL to load?"
**Validation:** Must be valid URL format

If "Inline HTML" selected, ask:
**Question:** "Paste the HTML content for the sidebar:"
**Note:** Can be simple or complex HTML

## VALIDATION RULES

Before proceeding, validate all inputs:

### FAB Name Validation
```javascript
function isValidFABName(name) {
  return /^[a-z0-9]+(-[a-z0-9]+)*$/.test(name) && 
         !name.startsWith('-') && 
         !name.endsWith('-');
}
```

### Icon Validation
Accept any icon name. Format as: `ti ti-{icon}` where {icon} is the user's input.

### Color Validation
```javascript
function normalizeColor(input) {
  const colorMap = {
    'blue': '#2196F3',
    'green': '#4CAF50',
    'red': '#f44336',
    'orange': '#FF5722',
    'purple': '#9C27B0',
    'teal': '#009688',
    'pink': '#E91E63',
    'yellow': '#FFC107'
  };
  
  if (input.startsWith('#') && /^#[0-9A-Fa-f]{6}$/.test(input)) {
    return input.toUpperCase();
  }
  
  return colorMap[input.toLowerCase()] || '#2196F3';
}
```

## FILE GENERATION

### 1. JavaScript Wrapper File

**Filename:** `{fab-name}.js`
**Location:** Current working directory

**Structure:**
```javascript
/**
 * {FAB Name} Library
 * @version 1.0.0
 * @description FAB Collection library for {purpose}
 * @license MIT
 * 
 * USAGE:
 * <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/tabler-icons.min.css">
 * <script src="https://vizio-data-ingestion-resources.s3.us-west-2.amazonaws.com/other/fabs/{fab-name}.js"></script>
 */

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
                display: flex;
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

        return {
            register,
            hideFABs,
            showFABs,
            updateFABColor
        };
    })();
}
// ==================== END FAB MANAGER ====================

(function(window, document) {
    'use strict';

    let isOpen = false;
    let panel = null;

    // Register FAB
    function createFAB() {
        window.FABCollection.register({
            id: '{fab-name}',
            icon: 'ti ti-{icon}',
            color: '{color}',
            title: '{tooltip}',
            onClick: togglePanel
        });
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
        panel.id = '{fab-name}-panel';
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

        panel.innerHTML = `
            <div style="padding: 20px; border-bottom: 2px solid #f0f0f0;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <h2 style="margin: 0; font-size: 20px;">{panel-title}</h2>
                    <button id="{fab-name}-close" style="background: none; border: none; font-size: 24px; cursor: pointer; color: #666;">&times;</button>
                </div>
            </div>
            <div id="{fab-name}-content" style="padding: 20px;">
                {content-placeholder}
            </div>
        `;

        document.body.appendChild(panel);

        document.getElementById('{fab-name}-close').addEventListener('click', closePanel);

        isOpen = true;

        // Load content
        loadContent();
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

    // Load content into panel
    function loadContent() {
        const contentDiv = document.getElementById('{fab-name}-content');
        if (!contentDiv) return;

        {content-loading-code}
    }

    // Initialize
    function init() {
        console.log('[{fab-name}] Library loaded');
        
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', createFAB);
        } else {
            createFAB();
        }
    }

    init();

})(window, document);
```

**Placeholder Replacements:**
- `{fab-name}` → User-provided FAB name
- `{icon}` → User-provided icon name
- `{color}` → Validated/normalized hex color
- `{tooltip}` → Tooltip text or capitalized FAB name
- `{panel-title}` → Capitalized FAB name for panel header
- `{content-placeholder}` → Loading message or inline HTML
- `{content-loading-code}` → Content loading logic based on source type

### Content Loading Strategies

**For Inline HTML:**
```javascript
function loadContent() {
    const contentDiv = document.getElementById('{fab-name}-content');
    if (!contentDiv) return;

    contentDiv.innerHTML = `{escaped-html}`;
}
```

**For HTML File (S3):**
```javascript
function loadContent() {
    const contentDiv = document.getElementById('{fab-name}-content');
    if (!contentDiv) return;

    contentDiv.innerHTML = '<iframe src="https://vizio-data-ingestion-resources.s3.us-west-2.amazonaws.com/other/fabs/{fab-name}.html" style="width: 100%; height: 100%; border: none;"></iframe>';
}
```

**For URL:**
```javascript
function loadContent() {
    const contentDiv = document.getElementById('{fab-name}-content');
    if (!contentDiv) return;

    contentDiv.innerHTML = '<iframe src="{url}" style="width: 100%; height: 100%; border: none;"></iframe>';
}
```

### 2. HTML Content File (if separate file)

**Filename:** `{fab-name}.html`
**Location:** Current working directory

**Only create if source is "HTML file path" or "Inline HTML" and content is substantial (>500 characters)**

**Structure:**
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{FAB Name} Content</title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/tabler-icons.min.css">
    <style>
        body {
            margin: 0;
            padding: 20px;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        }
    </style>
</head>
<body>
    {user-html-content}
</body>
</html>
```

### 3. Test Page

**Filename:** `test-{fab-name}.html`
**Location:** Current working directory

**Structure:**
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Test - {FAB Name}</title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/tabler-icons.min.css">
    <style>
        body {
            margin: 0;
            padding: 40px;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            background: #f5f5f5;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            padding: 40px;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        h1 {
            margin: 0 0 20px 0;
            color: #333;
        }
        .status {
            padding: 12px;
            background: #e3f2fd;
            border-left: 4px solid #2196F3;
            margin-bottom: 20px;
        }
        code {
            background: #f5f5f5;
            padding: 2px 6px;
            border-radius: 3px;
            font-family: monospace;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>{FAB Name} - Test Page</h1>
        
        <div class="status">
            <strong>Status:</strong> FAB should appear in bottom-right corner
        </div>

        <h2>Instructions</h2>
        <ol>
            <li>Look for the FAB button (circular, {color}) in the bottom-right corner</li>
            <li>Click the FAB to open the sidebar panel</li>
            <li>Verify your content loads in the sidebar</li>
            <li>Close the sidebar with the × button</li>
            <li>Verify the FAB reappears</li>
        </ol>

        <h2>Integration</h2>
        <p>To use this FAB in your own page, add these lines:</p>
        <pre><code>&lt;link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/tabler-icons.min.css"&gt;
&lt;script src="https://vizio-data-ingestion-resources.s3.us-west-2.amazonaws.com/other/fabs/{fab-name}.js"&gt;&lt;/script&gt;</code></pre>

        <h2>Publish Steps</h2>
        <ol>
            <li>Upload files to S3: <code>aws s3 cp {fab-name}.js s3://vizio-data-ingestion-resources/other/fabs/ --content-type "application/javascript"</code></li>
            <li>If separate HTML: <code>aws s3 cp {fab-name}.html s3://vizio-data-ingestion-resources/other/fabs/ --content-type "text/html"</code></li>
            <li>Make files public: <code>aws s3 cp s3://vizio-data-ingestion-resources/other/fabs/{fab-name}.js s3://vizio-data-ingestion-resources/other/fabs/{fab-name}.js --acl public-read</code></li>
        </ol>
    </div>

    <!-- Load FAB from local file for testing -->
    <script src="./{fab-name}.js"></script>
</body>
</html>
```

## IMPLEMENTATION SEQUENCE

Execute in this exact order:

1. **Validate trigger phrase** - Confirm user wants to create a FAB

2. **Gather user inputs** - Use ask_followup_question for all 5 prompts
   - FAB name (validate kebab-case)
   - Icon name (format as ti ti-{icon})
   - Color (normalize to hex)
   - Tooltip (default to capitalized name)
   - HTML content source and content

3. **Validate all inputs** - Ensure format correctness before proceeding

4. **Read reference implementation** - Read MockApi/wwwroot/mock-api-simple.js to verify FAB Manager code is current

5. **Generate JavaScript wrapper file:**
   - Create {fab-name}.js
   - Embed FAB Manager code with DRIFT WARNING intact
   - Replace all placeholders
   - Implement appropriate content loading strategy
   - Ensure proper escaping for inline HTML

6. **Generate HTML content file (if needed):**
   - Only if content source is file or inline HTML >500 chars
   - Create {fab-name}.html with full HTML document structure
   - Include Tabler icons CDN
   - Add user's content

7. **Generate test page:**
   - Create test-{fab-name}.html
   - Include instructions and integration code
   - Load FAB from local file for testing

8. **Provide S3 upload commands:**
   - Generate AWS CLI commands for uploading
   - Include content-type headers
   - Include public-read ACL commands

9. **Report completion with:**
   - List of files created
   - S3 upload commands
   - Test instructions
   - Integration example
   - Follow-up instructions

## S3 UPLOAD COMMANDS

Provide these exact commands:

```bash
# Upload JavaScript library
aws s3 cp {fab-name}.js s3://vizio-data-ingestion-resources/other/fabs/ --content-type "application/javascript"

# Make JavaScript public
aws s3 cp s3://vizio-data-ingestion-resources/other/fabs/{fab-name}.js s3://vizio-data-ingestion-resources/other/fabs/{fab-name}.js --acl public-read

# Upload HTML (if separate file)
aws s3 cp {fab-name}.html s3://vizio-data-ingestion-resources/other/fabs/ --content-type "text/html"

# Make HTML public
aws s3 cp s3://vizio-data-ingestion-resources/other/fabs/{fab-name}.html s3://vizio-data-ingestion-resources/other/fabs/{fab-name}.html --acl public-read
```

## COMPLETION MESSAGE

After all files generated, provide this message:

```
FAB library created! ✅

**Files Created:**
- {fab-name}.js - Main FAB library (with embedded FAB Manager)
- {fab-name}.html - Content file (if applicable)
- test-{fab-name}.html - Local test page

**Configuration:**
- Name: {fab-name}
- Icon: ti ti-{icon}
- Color: {color}
- Tooltip: {tooltip}

**Test Locally:**
1. Open test-{fab-name}.html in your browser
2. Verify FAB appears in bottom-right corner
3. Click FAB to open sidebar
4. Test content loads correctly

**Deploy to S3:**

Upload JavaScript:
aws s3 cp {fab-name}.js s3://vizio-data-ingestion-resources/other/fabs/ --content-type "application/javascript"
aws s3 cp s3://vizio-data-ingestion-resources/other/fabs/{fab-name}.js s3://vizio-data-ingestion-resources/other/fabs/{fab-name}.js --acl public-read

{if-html-file}
Upload HTML:
aws s3 cp {fab-name}.html s3://vizio-data-ingestion-resources/other/fabs/ --content-type "text/html"
aws s3 cp s3://vizio-data-ingestion-resources/other/fabs/{fab-name}.html s3://vizio-data-ingestion-resources/other/fabs/{fab-name}.html --acl public-read
{endif}

**Integration Example:**
Add to any HTML page:

<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/tabler-icons.min.css">
<script src="https://vizio-data-ingestion-resources.s3.us-west-2.amazonaws.com/other/fabs/{fab-name}.js"></script>

**FAB Collection:**
This FAB integrates with the FAB Collection system. Multiple FABs can coexist on the same page. When one opens its sidebar, all FABs hide. When the sidebar closes, all FABs reappear.

**Publish Steps:**
1. Test locally with test-{fab-name}.html
2. Upload to S3 using commands above
3. Integrate into your web page
4. Test with other FABs to verify coordination
```

## IMPORTANT NOTES

1. **DRIFT WARNING** - The FAB Manager code is intentionally duplicated. Keep the DRIFT WARNING comments intact.

2. **Self-Contained** - Each FAB library must be 100% self-contained. Single script tag is all that's needed.

3. **FAB Coordination** - When sidebar opens, call `window.FABCollection.hideFABs()`. When sidebar closes, call `window.FABCollection.showFABs()`.

4. **Content Strategy:**
   - Inline HTML (<500 chars): Embed directly in JS
   - Inline HTML (>500 chars): Create separate HTML file, load via iframe
   - File path: Copy file, load via iframe
   - URL: Load via iframe

5. **No Configuration** - FABs should work immediately with no setup required from the user.

6. **Test Before Deploy** - Always generate test page for local verification before S3 upload.

7. **S3 Paths** - All FABs go to `other/fabs/` directory with public-read ACL.

8. **Icon Format** - Always use `ti ti-{icon}` format for Tabler icons.

9. **Panel Width** - Default sidebar width is 400px. Can be adjusted if user specifies.

10. **Z-Index Layers:**
    - FAB Container: 999996
    - Sidebar Panel: 1000000
    - Ensures proper stacking with other elements

## EDGE CASES

### If FAB name already exists in S3:
- Ask user: "A FAB with this name may already exist in S3. Do you want to overwrite it?"
- Options: ["Yes, overwrite", "No, choose a different name"]

### If HTML content is very large:
- Warn user: "This HTML is quite large. Consider hosting it separately and loading via URL instead."
- Options: ["Continue with current approach", "Provide a URL instead"]

### If no HTML content provided:
- Use placeholder content:
```html
<div style="text-align: center; padding: 40px;">
    <i class="ti ti-{icon}" style="font-size: 48px; color: {color};"></i>
    <h3>Welcome to {FAB Name}</h3>
    <p>This is a placeholder. Replace with your content.</p>
</div>
```

### If icon name is invalid:
- Use default: "ti ti-square" and inform user to browse https://tabler.io/icons for valid icons.

## TESTING CHECKLIST

After generation, verify:
- [ ] JavaScript file contains complete FAB Manager code
- [ ] DRIFT WARNING comments are present
- [ ] All placeholders replaced
- [ ] Content loading logic matches source type
- [ ] Test page generated with correct paths
- [ ] S3 commands are correct
- [ ] FAB name is kebab-case
- [ ] Icon format is "ti ti-{icon}"
- [ ] Color is valid hex code

## REMEMBER

This automation follows the proven pattern from mock-api-simple.js and html-canvas-overlay.js. The FAB Manager embedding is intentional to keep libraries self-contained. The DRIFT WARNING acknowledges this technical debt but makes the trade-off for simplicity.

Every FAB created with this command should work immediately when the JS file is loaded via script tag. No additional configuration or dependencies required (except Tabler icons CSS).

---

# FAB STANDARDS (Validated 2026-01-10)

The following standards have been validated with real implementations and should be followed for all NEW FABs. Existing FABs (mock-api, bug-beacon, pointy-clicky) are legacy reference implementations and should not be modified unless there's a functional reason.

## SEMANTIC COLOR SYSTEM

Use semantic color roles instead of arbitrary colors. This provides consistency and makes intent clear.

```javascript
const COLORS = {
    // Semantic roles
    primary: '#2196F3',      // Primary actions (blue)
    success: '#4CAF50',      // Success states (green)
    warning: '#FF9800',      // Warnings (orange)
    danger: '#f44336',       // Errors/destructive actions (red)
    info: '#00BCD4',         // Informational (cyan)
    
    // Panel theming (dark theme)
    bgPanel: '#2a2a2a',      // Panel background
    bgCard: '#1a1a1a',       // Card/section background
    bgButton: '#3a3a3a',     // Button background
    borderColor: '#3a3a3a',  // Border color
    borderLight: '#4a4a4a',  // Lighter border
    
    // Text colors
    textPrimary: '#e0e0e0',  // Primary text
    textSecondary: '#b0b0b0', // Secondary text
    textMuted: '#999999',    // Muted text
    textOnAccent: '#ffffff'  // Text on colored backgrounds
};
```

**When to use each color:**
- `primary` - Main action buttons, primary FAB color for general tools
- `success` - Confirmation actions, success states, "save" buttons
- `warning` - Caution states, non-critical alerts
- `danger` - Delete actions, error states, destructive operations
- `info` - Informational FABs, help content, neutral notifications

**FAB Color Selection Guide:**
- Data/API tools → `primary` (blue)
- Error monitoring → `danger` (red)
- UI tools → `warning` (orange)
- Testing/dev tools → `info` (cyan)
- Success indicators → `success` (green)

## Z-INDEX HIERARCHY

Explicit z-index layers prevent visual conflicts between FABs and other page elements.

```javascript
const Z_INDEX = {
    fabContainer: 999999,    // FAB container (shared with all FABs)
    panel: 1000000,          // Sidebar panels
    modal: 1000001,          // Modal dialogs
    overlay: 1000002,        // Full-screen overlays (like BSOD)
    tooltip: 1000003         // Tooltips (highest)
};
```

**Rules:**
1. FAB container MUST use `999999` (standar
