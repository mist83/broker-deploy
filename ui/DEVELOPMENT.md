# UI Framework Development Guide

## Architecture

### Theme-Agnostic Design
Framework uses CSS variables for all colors, allowing themes to define their own color schemes without changing component code.

**Key Pattern:**
```css
/* Theme defines colors */
:root {
    --color-primary: #0071CE;
    --color-secondary: #FFC220;
}

/* Components use variables */
button {
    background: var(--color-primary);
}
```

### X-Everywhere Consolidation
All component libraries consolidated into `js/` directory:
- `js/ui.js` - Bundle loader (loads all libraries)
- `js/modals.js` - Modal dialogs
- `js/tabs.js` - Tab navigation
- `js/toasts.js` - Toast notifications
- `js/tables.js` - Data tables
- `js/cards.js` - Card grids

**Usage:**
```html
<script src="https://ui.mullmania.com/js/ui.js"></script>
```

Loads all libraries automatically.

## Design Principles

### Flat Design Only
- No gradients
- No complex shadows
- No rounded corners > 4px
- No animations (except spin/pulse for loading)

### CSS Grid Only (NO FLEXBOX)
All layouts use CSS Grid:
```css
.grid-2 { display: grid; grid-template-columns: repeat(2, 1fr); }
.layout.workspace { display: grid; grid-template-columns: 250px 1fr; }
```

### No Inline Styles
Use CSS classes, not inline styles:
```javascript
// WRONG
element.style.background = '#0071CE';

// RIGHT
element.classList.add('btn-primary');
```

### Tabler Icons Only
Use Tabler icons, not emojis:
```html
<i class="ti ti-check"></i>
<i class="ti ti-x"></i>
```

## Component Patterns

### Modal Pattern
```javascript
function showModal(title, content) {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.style.display = 'grid';
    overlay.innerHTML = `
        <div class="modal">
            <div class="modal-header">
                <h3>${title}</h3>
                <button class="modal-close">&times;</button>
            </div>
            <div>${content}</div>
        </div>
    `;
    document.body.appendChild(overlay);
}
```

### Toast Pattern
```javascript
function showToast(type, message) {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}
```

### Sidebar Selection Pattern
```javascript
document.querySelectorAll('.sidebar-item').forEach(item => {
    item.addEventListener('click', function() {
        // Remove active from all
        document.querySelectorAll('.sidebar-item').forEach(i => 
            i.classList.remove('active'));
        // Add active to clicked
        this.classList.add('active');
    });
});
```

## Mobile Responsiveness

### Sidebar Collapse
On mobile (< 768px), sidebar becomes fixed overlay:
```css
@media (max-width: 768px) {
    .sidebar {
        position: fixed;
        left: -250px;
        transition: left 0.3s ease;
    }
    
    .sidebar.mobile-open {
        left: 0;
    }
}
```

### Grid Stacking
Grids automatically stack on mobile:
```css
@media (max-width: 768px) {
    .grid-2, .grid-3, .grid-4 {
        grid-template-columns: 1fr;
    }
}
```

## Testing Strategy

### Puppeteer Tests
Three test suites:
1. `typography-page.test.js` - Basic component tests
2. `typography-comprehensive.test.js` - Comprehensive interaction tests
3. `ui-framework-exhaustive.test.js` - Exhaustive UI tree walk

**Run tests:**
```powershell
cd tests
npm test
```

### AI Slop Detection
Exhaustive test auto-detects:
- Rounded corners > 8px
- Gradients in backgrounds
- Complex animations (non-spin/pulse)

## Theme Creation

### Step 1: Create Theme Directory
```
mytheme/
  colors.css
  layout.css
  style.css
```

### Step 2: Define Colors
```css
/* mytheme/colors.css */
:root {
    --color-primary: #your-primary;
    --color-secondary: #your-secondary;
    --bg-primary: #your-bg;
    /* ... all required variables */
}
```

### Step 3: Copy Layout
```css
/* mytheme/layout.css */
@import url('../active/layout.css');
```

Or customize layout if needed.

### Step 4: Create Bundle
```css
/* mytheme/style.css */
@import url('colors.css');
@import url('layout.css');
```

## Deployment

### Deploy to S3
```powershell
cd StylesApi/scripts
.\deploy.ps1
```

Deploys to:
- S3: `vizio-data-ingestion-resources/styles/`
- CloudFront: `https://ui.mullmania.com`

### Test Locally
```powershell
cd StylesApi/StylesApi
dotnet run
```

Access at: `http://localhost:5000`

## Key Learnings

### Theme-Agnostic Variables
Using `--color-primary` instead of `--walmart-blue` makes framework reusable across brands. Themes define colors, components adapt automatically.

### CSS Grid Superiority
Grid handles both 1D and 2D layouts better than Flexbox. Simpler syntax, more predictable behavior.

### Flat Design Benefits
- Faster rendering (no gradients/shadows)
- Cleaner visual hierarchy
- Easier to maintain
- Better accessibility

### Component Library Consolidation
Single `ui.js` loader simplifies integration. One script tag loads everything.

### Mobile-First Responsive
Sidebar collapse pattern works across all apps. Grids automatically stack. Typography scales appropriately.

## Common Patterns

### Header with Icon
```html
<header class="header">
    <h1>
        <i class="ti ti-icon"></i>
        <span>Your <span style="color: var(--color-secondary);">App</span></span>
    </h1>
    <div class="header-links">
        <a class="header-link" href="/docs">
            <i class="ti ti-book"></i>
            <span>Docs</span>
        </a>
    </div>
</header>
```

### Tabs with Icons
```html
<div class="tabs">
    <button class="tab active">
        <i class="ti ti-home"></i> Dashboard
    </button>
    <button class="tab">
        <i class="ti ti-list"></i> Tasks
    </button>
</div>
```

### Status Badges
```html
<span class="status-badge status-success">Active</span>
<span class="status-badge status-error">Failed</span>
<span class="status-badge status-warning">Pending</span>
```

### Grid Layouts
```html
<div class="grid-2 gap-md">
    <div class="card">Item 1</div>
    <div class="card">Item 2</div>
</div>
```

## Troubleshooting

### Theme Not Loading
Check CSS path is correct:
```html
<link rel="stylesheet" href="https://ui.mullmania.com/active/style.css">
```

### Icons Not Showing
Include Tabler icons CSS:
```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/tabler-icons.min.css">
```

### Mobile Sidebar Not Working
Add mobile toggle button and overlay:
```html
<button class="mobile-sidebar-toggle">
    <i class="ti ti-menu"></i>
</button>
<div class="sidebar-overlay"></div>
```

### Components Not Working
Load component libraries:
```html
<script src="https://ui.mullmania.com/js/ui.js"></script>
```

## Future Enhancements

- [ ] Dark mode toggle component
- [ ] Form validation helpers
- [ ] Dropdown menu component
- [ ] Breadcrumb navigation
- [ ] Pagination component
- [ ] Loading skeleton screens

---

**Last Updated:** 2026-03-13
**Version:** 1.1.0
