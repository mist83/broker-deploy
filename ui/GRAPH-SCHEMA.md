# GraphEverywhere - Canonical JSON Schema

**Version:** 1.0  
**Purpose:** Standard format for graph data across all tools using ui.mullmania.com

## Schema Definition

```json
{
  "version": "1.0",
  "name": "graph-name",
  "nodes": [
    {
      "id": "n1234567890",
      "label": "Node Label",
      "description": "Optional description text",
      "color": "#0071CE",
      "size": "medium",
      "textSize": "medium",
      "x": 100.5,
      "y": 200.3
    }
  ],
  "edges": [
    {
      "id": "e1234567890",
      "source": "n1234567890",
      "target": "n9876543210",
      "label": "Optional edge label",
      "edgeColor": "#0071CE",
      "thickness": "medium",
      "lineStyle": "solid",
      "targetArrow": "triangle",
      "sourceArrow": "none"
    }
  ]
}
```

## Node Properties

| Property | Type | Required | Default | Values |
|----------|------|----------|---------|--------|
| id | string | Yes | - | Unique identifier (e.g., "n1234567890") |
| label | string | Yes | - | Display text |
| description | string | No | "" | Multi-line description |
| color | string | No | "#0071CE" | Hex color code |
| size | string | No | "medium" | "small", "medium", "large" |
| textSize | string | No | "medium" | "small", "medium", "large" |
| x | number | Yes | - | X position in canvas |
| y | number | Yes | - | Y position in canvas |

**Size Mapping:**
- small: 60px × 60px
- medium: 80px × 80px
- large: 100px × 100px

**Text Size Mapping:**
- small: 12px
- medium: 16px
- large: 20px

## Edge Properties

| Property | Type | Required | Default | Values |
|----------|------|----------|---------|--------|
| id | string | Yes | - | Unique identifier (e.g., "e1234567890") |
| source | string | Yes | - | Source node ID |
| target | string | Yes | - | Target node ID |
| label | string | No | "" | Display text |
| edgeColor | string | No | "#0071CE" | Hex color code |
| thickness | string | No | "medium" | "thin", "medium", "thick" |
| lineStyle | string | No | "solid" | "solid", "dashed", "dotted" |
| targetArrow | string | No | "triangle" | "triangle", "none" |
| sourceArrow | string | No | "none" | "triangle", "none" |

**Thickness Mapping:**
- thin: 2px
- medium: 3px
- thick: 5px

## Usage

### Import Graph Data

```javascript
const graph = new GraphEverywhere('#container');
graph.init();

// Load from JSON
const data = {
  version: "1.0",
  name: "my-graph",
  nodes: [
    { id: "n1", label: "Start", color: "#4CAF50", x: 100, y: 100 }
  ],
  edges: []
};

graph.importJSON(data);
```

### Export Graph Data

```javascript
const data = graph.exportJSON();
console.log(JSON.stringify(data, null, 2));
```

### Render Existing DAG JSON

```javascript
// DAG's JSON format is compatible
fetch('my-dag.json')
  .then(r => r.json())
  .then(data => graph.importJSON(data));
```

## Rendering Preferences (Locked In)

**Node Rendering:**
- Circular nodes with labels
- Text background for readability
- Border highlights on selection
- Size and text size independently configurable

**Edge Rendering:**
- Bezier curves
- Configurable line style (solid/dashed/dotted)
- Configurable arrows (source/target)
- Configurable thickness
- Color per edge

**Interaction:**
- Left sidebar (350px) for properties
- Keyboard navigation (`[`, `]`, `z`)
- Sidebar-aware zoom
- Animation debouncing

## Compatibility

This schema is compatible with:
- dag.mikesendpoint.com (native format)
- aidea-bloom.mikesendpoint.com (can adapt)
- Any tool using GraphEverywhere library

## Migration

To migrate existing graph data:

**From simple format:**
```javascript
// Old format
{ nodes: [{ id: "n1", label: "Node" }] }

// Add defaults
{ 
  version: "1.0",
  nodes: [{ 
    id: "n1", 
    label: "Node",
    color: "#0071CE",
    size: "medium",
    textSize: "medium",
    x: 0,
    y: 0
  }]
}
```

**From other formats:**
Map your data to this schema before calling `importJSON()`.

## Validation

GraphEverywhere validates on import:
- Missing required fields → uses defaults
- Invalid enum values → uses defaults
- Missing positions → places at (0, 0)

No errors thrown - graceful degradation.
