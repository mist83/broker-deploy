# Add Feature Flags - F3 Integration

## TRIGGER
When the user says "add feature flags", "add f3", "use feature flags", or similar phrases requesting feature flag functionality.

## PURPOSE
Integrate the F3 Feature Flag FAB into HTML files to enable localStorage-based feature flag management with event broadcasting.

## WHAT IS F3?
F3 is a self-contained Feature Flag FAB that:
- Manages boolean feature flags in localStorage
- Broadcasts `f3:flag:changed` events when flags change
- Provides UI for creating/editing/toggling flags
- Supports import/export as JSON
- Has planned auto-sync mode for future backend coordination
- Works with other FABs (Bug Beacon, Mock API, etc.)

## DETECTION
Identify HTML files in the current workspace that would benefit from feature flags.

## IMPLEMENTATION STEPS

### Step 1: Detect HTML Files
Look for HTML files in the current directory or ask user which file to modify.

### Step 2: Check for Existing Integration
Search for existing F3 script tag:
```html
<script src="https://vizio-data-ingestion-resources.s3.us-west-2.amazonaws.com/other/fabs/f3.js"></script>
```

If already present, inform user and skip integration.

### Step 3: Add Tabler Icons (if not present)
Check if Tabler icons CSS is already included. If not, add to `<head>`:
```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/tabler-icons.min.css">
```

### Step 4: Add F3 Script Tag
Add before closing `</body>` tag:
```html
<script src="https://vizio-data-ingestion-resources.s3.us-west-2.amazonaws.com/other/fabs/f3.js"></script>
```

### Step 5: Add Console Message Script
Add immediately after F3 script tag:
```html
<script>
// F3 Feature Flags - How to Enable
console.log('%c[F3] Feature Flags Library Loaded', 'color: #2196F3; font-weight: bold;');
console.log('%cTo enable the FAB, run:', 'color: #666;');
console.log('%clocalStorage.setItem("fab-lous:f3", "true"); location.reload();', 'color: #4CAF50; font-family: monospace;');
console.log('%cTo disable:', 'color: #666;');
console.log('%clocalStorage.removeItem("fab-lous:f3"); location.reload();', 'color: #f44336; font-family: monospace;');
</script>
```

### Step 6: Add Example Usage Comment (Optional)
Add commented example code showing how to use flags:
```html
<!--
F3 Feature Flags Usage:

// Listen for flag changes
window.addEventListener('f3:flag:changed', (e) => {
  console.log('Flag changed:', e.detail.key, '=', e.detail.value);
  
  if (e.detail.key === 'my-feature') {
    if (e.detail.value) {
      enableMyFeature();
    } else {
      disableMyFeature();
    }
  }
});

// Check flag on page load
function isFeatureEnabled(key) {
  const flags = JSON.parse(localStorage.getItem('f3:flags') || '{}');
  return flags[key]?.value || false;
}

if (isFeatureEnabled('my-feature')) {
  enableMyFeature();
}
-->
```

## COMPLETION MESSAGE

After integration, inform user:

```
F3 Feature Flags integrated! ✅

**Added to:** {filename}

**To Enable the FAB:**
Open browser console and run:
localStorage.setItem('fab-lous:f3', 'true');
location.reload();

**To Disable:**
localStorage.removeItem('fab-lous:f3');
location.reload();

**Usage:**
1. Enable FAB using console command above
2. Click blue flag FAB in bottom-right corner
3. Create feature flags (e.g., 'new-dashboard', 'dark-mode')
4. Toggle flags on/off
5. Listen for changes with: window.addEventListener('f3:flag:changed', handler)

**Event Structure:**
{
  detail: {
    key: 'flag-name',
    value: true/false,
    previousValue: true/false,
    allFlags: { ... }
  }
}

**localStorage Keys:**
- f3:flags - Flag storage
- f3:auto-sync - Auto-sync mode state
- fab-lous:f3 - FAB visibility toggle

**Library URL:**
https://vizio-data-ingestion-resources.s3.us-west-2.amazonaws.com/other/fabs/f3.js

**Test Page:**
https://vizio-data-ingestion-resources.s3.us-west-2.amazonaws.com/other/fabs/test-f3.html
```

## OPT-IN PATTERN

F3 uses the "fab-lous" opt-in pattern:
- FAB only appears if `localStorage.getItem('fab-lous:f3') === 'true'`
- This prevents unwanted FABs from appearing on production sites
- User must explicitly enable via console command
- Can be disabled at any time

## IMPORTANT NOTES

1. **Opt-in Required** - FAB won't appear until user enables it via localStorage
2. **Console Message** - Always show enable/disable commands in console
3. **No Auto-Enable** - Never automatically set the localStorage flag
4. **Tabler Icons** - Required dependency, add if missing
5. **Script Order** - F3 script must come after Tabler icons CSS
6. **Event Name** - `f3:flag:changed` (namespaced to avoid conflicts)
7. **Storage Prefix** - All F3 keys use `f3:` prefix

## EDGE CASES

### If HTML file has no <head> tag:
Add both Tabler icons and F3 script before closing `</body>` tag.

### If HTML file has no <body> tag:
Inform user that HTML structure is invalid and cannot integrate.

### If multiple HTML files exist:
Ask user which file(s) to modify using `ask_followup_question`.

### If file already has F3:
Inform user: "F3 already integrated in {filename}. No changes needed."

## TESTING CHECKLIST

After integration:
- [ ] Tabler icons CSS included
- [ ] F3 script tag added
- [ ] Console message script added
- [ ] File saved successfully
- [ ] User informed about enable command

## TONE

Direct and helpful:
- "F3 integrated into {filename}"
- "Enable FAB with: localStorage.setItem('fab-lous:f3', 'true')"
- "Reload page to see FAB"

Not:
- "Great! I've successfully added..."
