# Visual Sitemap Builder

A Cytoscape-based visual editor for creating and editing sitemap.json files through an intuitive graph interface.

## What It Does

The Visual Sitemap Builder lets you design app structures graphically instead of editing JSON manually. Each node represents a UI component (Tab, Sidebar Item, Detail View) that maps directly to your sitemap.json format.

## Features

### Node Types

1. **Tab Node** (Blue Rounded Rectangle)
   - Top-level navigation sections
   - Properties: id, label, icon
   - Can have sidebar children

2. **Sidebar Node** (Yellow Circle)
   - Sub-navigation items within tabs
   - Properties: id, name, icon
   - Can have detail view children

3. **Detail Node** (Green Rectangle)
   - Content pages/views
   - Properties: path, content type

### Workflow

1. **Add Nodes**: Click components in the left palette to add them to the canvas
2. **Connect Nodes**: Long-press a node, then click another to create connections
   - Tab → Sidebar (valid)
   - Sidebar → Detail (valid)
   - Other combinations are blocked
3. **Edit Properties**: Click a node to edit its properties in the right panel
4. **Auto Layout**: Click "Auto Layout" to organize nodes automatically
5. **Export**: Click "Export JSON" to download sitemap.json
6. **Import**: Click "Load Sitemap" to import existing sitemap.json

### Connection Rules

- **Tab → Sidebar**: Creates sidebar navigation under a tab
- **Sidebar → Detail**: Links detail views to sidebar items
- Invalid connections are prevented

### Auto-Save

The builder automatically saves your work to localStorage. Your graph persists between sessions.

## Usage Example

### Creating a New Sitemap

1. Click "Tab" in the palette → adds blue tab node
2. Edit properties: id="home", label="Home", icon="ti ti-home"
3. Click "Sidebar" in palette → adds yellow sidebar node
4. Long-press the tab node, then click the sidebar node to connect
5. Edit sidebar properties: id="dashboard", name="Dashboard"
6. Click "Export JSON" to download

### Loading Existing Sitemap

1. Click "Load Sitemap"
2. Select your sitemap.json file
3. Graph automatically renders with all tabs and sidebar items
4. Edit visually, then export

## Technical Details

### Cytoscape Integration

Based on the proven pattern from aidea-bloom's unified-canvas.js:
- Cytoscape.js for graph rendering
- Custom node styles per type
- Breadthfirst layout algorithm
- Pan/zoom controls

### Data Mapping

**Graph → JSON:**
```javascript
{
  tabs: [
    {
      id: tabNode.nodeId,
      label: tabNode.label,
      icon: tabNode.icon,
      sidebar: [
        {
          id: sidebarNode.nodeId,
          name: sidebarNode.name,
          icon: sidebarNode.icon
        }
      ]
    }
  ]
}
```

### Storage

- **localStorage**: Auto-saves graph state
- **Export**: Downloads sitemap.json file
- **Import**: Loads sitemap.json and renders graph

## Keyboard Shortcuts

- **Click**: Select node
- **Long-press**: Start connection
- **Click canvas**: Deselect all

## Future Enhancements

- [ ] Drag-and-drop from palette
- [ ] Undo/redo
- [ ] Copy/paste nodes
- [ ] Multi-select
- [ ] Export as PNG
- [ ] Validation warnings
- [ ] Detail view properties
- [ ] Custom node colors
- [ ] Search/filter nodes

## Architecture

```
tabs/visual-builder/
  index.html          - UI layout (3-column grid)
  visual-builder.js   - Core logic (Cytoscape + sitemap mapping)
  README.md           - This file
```

### Key Classes

**VisualSitemapBuilder**
- `initialize()` - Setup Cytoscape canvas
- `addNode(type)` - Create new node
- `connectNodes(source, target)` - Create edge
- `generateSitemap()` - Export to JSON
- `importSitemap(json)` - Load from JSON
- `autoLayout()` - Apply breadthfirst layout

## Integration

The Visual Builder is integrated into the main app via sitemap.json:

```json
{
  "tabs": [
    {
      "id": "visual-builder",
      "label": "Visual Builder",
      "icon": "ti ti-topology-star"
    }
  ]
}
```

Access at: `#visual-builder`

## Design Philosophy

**Visual-first, JSON-second**: Design your app structure visually, export to JSON when ready. The graph IS the source of truth during design.

**Constraint-based**: Only valid connections are allowed. The UI enforces sitemap structure rules.

**Auto-save**: Never lose work. Graph persists automatically.

**Round-trip**: Import existing sitemap.json, edit visually, export back. Seamless workflow.
