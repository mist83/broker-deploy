# PWA Lockdown Standards - Native App Experience

## TRIGGER
ALWAYS ACTIVE when creating or modifying PWA files.

## PHILOSOPHY
PWAs should feel like native apps - no browser chrome, no zoom, no scroll, no text selection. Lock it down completely.

## MANDATORY PWA LOCKDOWN

### HTML Meta Tags
```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
```

### CSS Lockdown
```css
* {
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
    -webkit-touch-callout: none;
    -webkit-tap-highlight-color: transparent;
}

html, body {
    width: 100vw;
    height: 100vh;
    overflow: hidden;
    position: fixed;
    overscroll-behavior: none;
    touch-action: manipulation;
}

input, textarea {
    -webkit-user-select: text;
    -moz-user-select: text;
    -ms-user-select: text;
    user-select: text;
}
```

### Manifest.json
```json
{
  "display": "standalone",
  "orientation": "portrait"
}
```

## COMPLETE LOCKDOWN CHECKLIST

### Viewport
- [x] `user-scalable=no` - No pinch zoom
- [x] `maximum-scale=1.0` - Lock zoom level
- [x] `initial-scale=1.0` - Start at 100%

### Selection
- [x] `user-select: none` - No text selection
- [x] `-webkit-touch-callout: none` - No context menu
- [x] `-webkit-tap-highlight-color: transparent` - No tap flash

### Scroll
- [x] `overflow: hidden` - No scroll
- [x] `position: fixed` - Lock position
- [x] `overscroll-behavior: none` - No pull-to-refresh
- [x] `100vh/100vw` - Fullscreen

### Touch
- [x] `touch-action: manipulation` - No double-tap zoom
- [x] Inputs/textareas allow selection (exception)

### Orientation
- [x] `orientation: portrait` in manifest
- [x] `apple-mobile-web-app-capable` for iOS

## EXCEPTIONS

**Allow selection in:**
- `<input>` elements
- `<textarea>` elements

These need `user-select: text` override.

## ENFORCEMENT

When creating PWA:
1. Add all meta tags to `<head>`
2. Add lockdown CSS to stylesheet
3. Set manifest orientation to portrait
4. Test on mobile device
5. Verify no zoom, no scroll, no selection

## REMEMBER

PWA = Native app experience. If it feels like a website, you're doing it wrong.
