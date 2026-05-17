# Implementation Plan: Migrate AIdeaBloom to ui.mikesendpoint.com Styling

## [Overview]
Migrate AIdeaBloom from custom CSS files to the centralized ui.mikesendpoint.com styling framework, eliminating redundant styling code and ensuring consistency with the Active Style typography guide.

The project currently has 7 custom CSS files totaling ~1000 lines of styling code that duplicates functionality already provided by ui.mikesendpoint.com. The index.html already loads the ui framework (https://styles.mikesendpoint.com/style.css and ui.js), but custom CSS files override and duplicate these styles. This migration will:

1. Delete all custom CSS files that duplicate framework functionality
2. Migrate app-specific styles to ui.mikesendpoint.com if they're reusable patterns
3. Keep only truly app-specific CSS (Cytoscape node styling, animations)
4. Replace all inline styles with CSS classes from the framework
5. Update JavaScript to use classList instead of direct style manipulation
6. Document remaining technical debt

## [Types]
No new type definitions required - this is a pure styling refactor.

All existing TypeScript/C# types remain unchanged. The refactor only affects CSS classes and HTML structure.

## [Files]

### Files to DELETE (Framework Duplicates)
- `wwwroot/styles.css` - All styles duplicated by ui.mikesendpoint.com
- `wwwroot/unified-canvas.css` - Panel positioning and layout (use framework classes)
- `wwwroot/conversation-bloom.css` - Basic styling (use framework classes)
- `wwwroot/source-manager.css` - Grid layouts and badges (use framework classes)

### Files to KEEP (App-Specific)
- `wwwroot/agent-rules-canvas.css` - Cytoscape node styling (app-specific)
- `wwwroot/world-of-goo-viz.css` - Visualization animations (app-specific)
- `wwwroot/live-flow.css` - Execution state animations (app-specific)

### Files to MODIFY

#### HTML Files
- `wwwroot/index.html`
  - Remove inline style from LLM Docs link (line 21)
  - Add CSS class for positioned link instead
  
#### JavaScript Files (Replace inline styles with classList)
- `wwwroot/agent-rules-canvas.js`
  - Lines 250, 253, 288: Replace `.style.display` with `.classList` toggle
  
- `wwwroot/canvas-navigation.js`
  - Lines 113-117, 132-136: Replace `.style.display` with `.classList` toggle
  
- `wwwroot/collaboration-ui.js`
  - Line 52: Replace `.style.borderColor` with CSS class
  
- `wwwroot/conversation-bloom.js`
  - Line 139: Replace `.style.display` with `.classList` toggle
  
- `wwwroot/source-manager.js`
  - Lines 397, 400: Replace `.style.display` with `.classList` toggle

- `wwwroot/js/layout-debug.js`
  - Line 87: Replace `.style.overflow` with CSS class

### Files to CREATE

#### New Minimal CSS Files
- `wwwroot/app-specific.css` - Consolidated app-specific styles only
  - Cytoscape node colors and shapes
  - Animation keyframes
  - Visualization-specific styling
  
#### Technical Debt Documentation
- `TECH-DEBT.md` - Document remaining inline styles and why they exist

## [Functions]
No function signature changes required.

All existing JavaScript functions remain unchanged in signature. Only internal implementation changes to replace:
- `element.style.property = value` → `element.classList.add/remove('class-name')`
- `element.style.display = 'block'` → `element.classList.remove('hidden')`
- `element.style.display = 'none'` → `element.classList.add('hidden')`

## [Classes]
No C# class changes required.

This is a pure frontend refactor. All backend C# classes remain unchanged.

## [Dependencies]
No new dependencies required.

The project already loads ui.mikesendpoint.com framework:
```html
<link rel="stylesheet" href="https://styles.mikesendpoint.com/style.css">
<script src="https://styles.mikesendpoint.com/ui.js"></script>
```

### Potential Framework Updates
If app-specific patterns are reusable, they should be added to ui.mikesendpoint.com at:
`C:\code\git\projects\ui`

Candidates for framework inclusion:
- Status badge variations (execution states)
- Panel positioning utilities
- Animation keyframes (pulse, shake, flow)

## [Testing]
Manual visual testing required after each migration step.

### Test Checklist
1. **Visual Regression Testing**
   - Compare before/after screenshots of each tab
   - Verify all panels render correctly
   - Check responsive behavior at different screen sizes
   
2. **Interaction Testing**
   - Test all button clicks
   - Verify panel show/hide functionality
   - Test filter toggles
   - Verify canvas interactions
   
3. **Animation Testing**
   - Verify execution state animations work
   - Check flow visualization animations
   - Test hover states
   
4. **Browser Testing**
   - Test in Chrome (primary)
   - Test in Edge
   - Verify no console errors

### Test Files
No automated test files needed - this is visual/manual testing only.

## [Implementation Order]

### Phase 1: Audit and Document (30 minutes)
1. Create `TECH-DEBT.md` with all inline styles found
2. Categorize inline styles:
   - Can be replaced with framework classes
   - Need new framework classes
   - Truly dynamic (must stay inline)
3. Document decision for each inline style

### Phase 2: Delete Duplicate CSS Files (15 minutes)
4. Delete `wwwroot/styles.css` (all framework duplicates)
5. Delete `wwwroot/unified-canvas.css` (use framework layout classes)
6. Delete `wwwroot/conversation-bloom.css` (use framework classes)
7. Delete `wwwroot/source-manager.css` (use framework grid/badge classes)
8. Test: Verify app still loads (will look broken, that's expected)

### Phase 3: Update HTML (30 minutes)
9. Fix `index.html` inline style:
   - Remove `style="position: absolute; top: 20px; right: 20px; color: var(--text-primary); text-decoration: none;"`
   - Add class `class="header-link"` to LLM Docs link
   - Add `.header-link` style to `app-specific.css`
10. Review all tab HTML files for inline styles
11. Test: Verify header renders correctly

### Phase 4: Replace JS Inline Styles (2 hours)
12. Create utility CSS classes in `app-specific.css`:
    ```css
    .hidden { display: none !important; }
    .visible { display: block !important; }
    .panel-open { display: block; opacity: 1; pointer-events: auto; }
    .panel-closed { display: none; opacity: 0; pointer-events: none; }
    ```

13. Update `agent-rules-canvas.js`:
    - Line 250: `analyzeFacetsBtn.classList.remove('hidden')`
    - Line 253: `visualizeFacetsBtn.classList.add('hidden')`
    - Line 288: `visualizeBtn.classList.remove('hidden')`

14. Update `canvas-navigation.js`:
    - Lines 113-117: Replace with `container.classList.toggle('hidden')`
    - Lines 132-136: Replace with `panel.classList.toggle('hidden')`

15. Update `collaboration-ui.js`:
    - Line 52: Create CSS class for border color, use `indicator.classList.add('presence-active')`

16. Update `conversation-bloom.js`:
    - Line 139: `panel.classList.remove('hidden')`

17. Update `source-manager.js`:
    - Lines 397, 400: `statusEl.classList.toggle('hidden')`

18. Update `js/layout-debug.js`:
    - Line 87: Create CSS class for overflow, use `issue.parent.classList.add('overflow-hidden')`

19. Test after each file: Verify functionality still works

### Phase 5: Consolidate App-Specific CSS (1 hour)
20. Create `wwwroot/app-specific.css` with ONLY:
    - Cytoscape node styling from `agent-rules-canvas.css`
    - Visualization animations from `world-of-goo-viz.css`
    - Execution state animations from `live-flow.css`
    - New utility classes created in Phase 4

21. Update `agent-rules-canvas.css`:
    - Keep: Cytoscape node selectors, rule type colors, trigger indicators
    - Delete: Filter panel styling (use framework)
    - Delete: Button styling (use framework)

22. Update `world-of-goo-viz.css`:
    - Keep: Animation keyframes, Cytoscape-specific styling
    - Delete: Panel positioning (use framework)
    - Delete: Button styling (use framework)
    - Delete: CSS variables (use framework variables)

23. Update `live-flow.css`:
    - Keep: Execution state classes, animation keyframes
    - Delete: Stats overlay styling (use framework)

24. Update `index.html` to load `app-specific.css`:
    ```html
    <link rel="stylesheet" href="app-specific.css">
    ```

25. Test: Full visual regression test of all tabs

### Phase 6: Framework Enhancement (Optional, 30 minutes)
26. Identify reusable patterns for ui.mikesendpoint.com:
    - Status badge variations
    - Panel positioning utilities
    - Common animation keyframes

27. If patterns are reusable, add to `C:\code\git\projects\ui`:
    - Update `colors.css` with new semantic colors
    - Update `layout.css` with new utility classes
    - Redeploy ui.mikesendpoint.com

28. Update AIdeaBloom to use new framework classes

### Phase 7: Documentation and Cleanup (30 minutes)
29. Update `TECH-DEBT.md` with remaining inline styles:
    - Document why each inline style must stay
    - Provide examples of acceptable inline style usage
    - Set review date for future cleanup

30. Update `README.md`:
    - Document styling approach
    - Link to ui.mikesendpoint.com typography guide
    - Explain app-specific.css purpose

31. Final test: Complete visual regression test

### Phase 8: Deployment (15 minutes)
32. Commit changes with clear message:
    ```
    Migrate to ui.mikesendpoint.com styling framework
    
    - Deleted 4 duplicate CSS files (~700 lines)
    - Replaced inline styles with CSS classes
    - Consolidated app-specific styles
    - Documented technical debt
    ```

33. Deploy to test environment
34. Verify deployment works correctly
35. Deploy to production

## Total Estimated Time: 5-6 hours

## Rollback Plan
If issues arise:
1. Revert commit
2. Redeploy previous version
3. Document issues in TECH-DEBT.md
4. Plan incremental migration instead

## Success Criteria
- [ ] Zero duplicate CSS between app and framework
- [ ] All inline styles documented or removed
- [ ] Visual appearance unchanged
- [ ] All interactions work correctly
- [ ] No console errors
- [ ] TECH-DEBT.md documents remaining issues
- [ ] README.md updated with styling approach

## Notes
- The project already uses ui.mikesendpoint.com framework in index.html
- Most custom CSS duplicates framework functionality
- Inline styles in JS are the biggest technical debt
- Cytoscape styling must remain app-specific (no framework equivalent)
- Animation keyframes are app-specific (execution states, flow visualization)
