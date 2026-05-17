# No Inline Styles - CSS Class Enforcement

## TRIGGER
ALWAYS ACTIVE - Enforced during code generation and review.

## PHILOSOPHY
Inline styles in JavaScript are a code smell. They mix concerns, make dark mode difficult, and create maintenance nightmares. Always use CSS classes.

## BANNED PATTERNS

### JavaScript Inline Style Setting
```javascript
❌ element.style.background = '#ffffff';
❌ element.style.color = '#000000';
❌ element.style.borderLeft = '3px solid #FFC220';
❌ element.style.fontWeight = '600';

✅ element.classList.add('sidebar-item-active');
✅ element.classList.remove('sidebar-item-inactive');
```

### HTML Inline Styles (Dynamic Content Exception)
```html
❌ <div style="background: white; color: black;">Static Content</div>

✅ <div class="content-card">Static Content</div>

⚠️ EXCEPTION: Generated/dynamic HTML (innerHTML, template literals) MAY use inline styles
   if the content is truly dynamic and CSS classes won't work.
```

## RULES

### 1. CSS Classes First
When you need styling:
1. Check if a class exists
2. If not, create a reusable class in CSS
3. Apply the class via JavaScript

### 2. CSS Variables for Themes
```css
✅ .my-element {
    background: var(--bg-primary);
    color: var(--text-primary);
    border: 1px solid var(--border-color);
}

❌ .my-element {
    background: #ffffff;
    color: #000000;
}
```

### 3. Shared Utilities
For repeated patterns (like sidebar selection):
- Create a shared utility function
- Use consistent class names
- Single source of truth

Example: `window.SidebarUtils.selectItem()`

## ENFORCEMENT

When you see:
```javascript
element.style.something = value;
```

**Stop and ask:**
1. Can this be a CSS class?
2. Does a class already exist?
3. Is this truly dynamic or just lazy?

**If lazy:** Refactor to CSS classes
**If dynamic:** Document why inline is necessary

## EXCEPTIONS

Inline styles ARE acceptable for:
- Dynamically calculated positions (drag/drop)
- Animation endpoints (computed at runtime)
- User-driven style overrides (theme customizer)
- Generated HTML where classes can't apply

But even then, consider CSS custom properties:
```javascript
element.style.setProperty('--dynamic-position', calculatedValue);
```

## REFACTORING GUIDE

**Before:**
```javascript
function selectItem(id) {
    items.forEach(item => {
        item.style.background = '';
        item.style.color = '#374151';
    });
    
    const active = getItem(id);
    active.style.background = '#ffffff';
    active.style.color = '#000000';
}
```

**After:**
```javascript
function selectItem(id) {
    items.forEach(item => {
        item.classList.remove('item-active');
        item.classList.add('item-inactive');
    });
    
    const active = getItem(id);
    active.classList.remove('item-inactive');
    active.classList.add('item-active');
}
```

## REMEMBER

Less inline styles = Better maintenance = Easier theming = Cleaner code = Happier developers

If you find yourself setting more than 2 inline styles, you need a CSS class.
