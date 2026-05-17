# Make TV App - Fullscreen Immersive UI Pattern

## TRIGGER
When the user says "make a TV app", "convert to TV", "make this TV-friendly", or similar phrases requesting a fullscreen TV-optimized interface.

## PHILOSOPHY
TV apps are keyboard-driven, fullscreen experiences designed for 10-foot viewing. Large text, minimal UI, high contrast, and simple navigation optimized for couch interaction.

## CORE PATTERN

### Visual Design
- **Fullscreen:** 100vw × 100vh, no scroll, overflow hidden
- **Large text:** 3-6.5rem for primary content
- **High contrast:** Bold colors on simple backgrounds
- **Minimal chrome:** HUD overlays only, no traditional nav
- **Animations:** Smooth transitions, gentle effects

### Interaction
- **Keyboard-first:** Arrow keys (nav), numbers (actions), Enter (select), Backspace (reset)
- **Remote control:** Optional QR + SignalR for mobile control
- **Shortcuts overlay:** Press '0' to show/hide keyboard help
- **No mouse required:** Every action has keyboard shortcut

### Structure
```
wwwroot/
  tv/
    index.html    - Main TV view
    tv.css        - TV-optimized styling
    tv.js         - Keyboard handlers & logic
    remote.html   - Optional mobile remote
    remote.js     - Optional SignalR remote control
```

## STANDARD ELEMENTS

### 1. Fullscreen Container
```html
<body>
  <main class="tv-container">
    <!-- Main content here -->
  </main>
</body>
```

```css
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  user-select: none;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  background: #000000; /* or gradient */
}

.tv-container {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}
```

### 2. HUD Overlay (Bottom)
```html
<div class="hud">
  <div class="hud-left">
    <!-- Status indicators -->
  </div>
  <div class="hud-right">
    <div class="controls">
      <div class="control-item">
        <span class="key">ENTER</span>
        <span class="action">Action</span>
      </div>
    </div>
  </div>
</div>
```

```css
.hud {
  position: fixed;
  bottom: 20px;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-between;
  padding: 0 40px;
  z-index: 100;
}

.control-item {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 20px;
}

.key {
  background: rgba(255, 215, 0, 0.25);
  border: 3px solid #ffd700;
  padding: 8px 14px;
  border-radius: 6px;
  font-weight: bold;
  color: #ffd700;
  box-shadow: 0 0 10px rgba(255, 215, 0, 0.3);
}

.action {
  color: #ffffff;
  font-weight: 600;
}
```

### 3. Shortcuts Overlay
```html
<div class="shortcuts-overlay" id="shortcuts-overlay">
  <h2>KEYBOARD SHORTCUTS</h2>
  <div class="shortcuts-grid">
    <div class="shortcut">
      <span class="shortcut-key">→</span>
      <span class="shortcut-desc">Next</span>
    </div>
    <!-- More shortcuts -->
  </div>
</div>
```

```css
.shortcuts-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.95);
  display: none;
  align-items: center;
  justify-content: center;
  z-index: 10000;
}

.shortcuts-overlay.visible {
  display: flex;
}

.shortcuts-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 30px;
  max-width: 800px;
}

.shortcut {
  display: flex;
  align-items: center;
  gap: 20px;
  font-size: 24px;
  color: white;
}

.shortcut-key {
  background: #333;
  padding: 12px 20px;
  border-radius: 12px;
  border: 3px solid #666;
  min-width: 120px;
  text-align: center;
  font-weight: bold;
}
```

### 4. JavaScript Keyboard Handler
```javascript
document.addEventListener('keydown', (e) => {
  switch(e.key) {
    case 'ArrowRight':
      e.preventDefault();
      nextItem();
      break;
    case 'ArrowLeft':
      e.preventDefault();
      previousItem();
      break;
    case 'Enter':
      e.preventDefault();
      togglePause();
      break;
    case 'Backspace':
      e.preventDefault();
      location.reload();
      break;
    case '0':
      e.preventDefault();
      toggleShortcuts();
      break;
  }
});
```

## USER PROMPTS

Use `ask_followup_question` to gather:

### Prompt 1: Content Type
**Question:** "What content should the TV app display?"
**Example:** "Trivia questions", "Image carousel", "Live data feed"

### Prompt 2: Navigation Style
**Question:** "How should users navigate?"
**Options:** 
- [ ] One item per screen (flashcard style)
- [ ] Vertical scroll with large cards
- [ ] Auto-advance with timer

### Prompt 3: Data Source
**Question:** "Where does the data come from?"
**Options:**
- [ ] Static JSON file
- [ ] API endpoint
- [ ] SignalR live stream
- [ ] CSV file

### Prompt 4: Color Scheme
**Question:** "What's the color vibe?"
**Options:**
- [ ] Dark (black background)
- [ ] Gradient (colorful)
- [ ] Themed (match content)

## GENERATED FILES

### index.html
- Fullscreen container
- Main content area
- HUD with controls
- Shortcuts overlay
- Tabler icons CDN

### tv.css
- Fullscreen body styling
- Large text (3-6rem)
- HUD positioning
- Shortcuts overlay
- Responsive breakpoints (optional)

### tv.js
- Keyboard event handlers
- Navigation logic (next/prev/pause)
- Data loading
- State management

### remote.html (optional)
- Mobile remote control interface
- QR code for connection
- SignalR integration

## BACKEND INTEGRATION

For Lambda deployment:
- Add `/tv` route redirect in Program.cs
- Serve static files from wwwroot/tv/
- Optional: Create API endpoint for data

```csharp
app.MapGet("/tv", () => Results.Redirect("/tv/index.html"));
```

## EXAMPLE OUTPUT

**For a trivia TV app:**
- Large question text (5rem)
- Answer buttons with number shortcuts
- Score HUD in corner
- Timer progress bar at bottom
- Dark background for readability

**For a feed TV app:**
- One item per screen (4rem text)
- Arrow keys navigate
- Metadata in corners
- Auto-advance option
- Pause with Enter

## COMPLETION MESSAGE

```
TV app created in wwwroot/tv/ ✅

Files:
- tv/index.html - Main TV interface
- tv/tv.css - TV-optimized styling
- tv/tv.js - Keyboard controls

Access at: https://your-url/tv

Controls:
- Arrow keys: Navigate
- Enter: Pause/Play
- 0: Show shortcuts
- Backspace: Reload
```

## IMPORTANT NOTES

1. **TV-first:** Design for 10-foot viewing (large text, simple)
2. **Keyboard-only:** Every action must have shortcut
3. **No mouse:** Assume user has remote only
4. **Responsive:** Works on actual TVs (720p to 4K)
5. **Performance:** Smooth 60fps animations
6. **Accessibility:** High contrast, readable at distance

## TONE

When creating TV apps:
- "TV view created at /tv"
- "Large text optimized for 10-foot viewing"
- "Keyboard shortcuts: arrows navigate, Enter pauses"

Not:
- "Great! I've created an amazing TV experience..."
