/**
 * GraphEverywhere - Opinionated Graph Navigation Library
 * @version 1.0.0
 * @description Cytoscape wrapper with locked-down navigation patterns
 * @license MIT
 */

class GraphEverywhere {
    constructor(container, options = {}) {
        this.container = typeof container === 'string' ? document.querySelector(container) : container;
        this.options = {
            signalrChannel: options.signalrChannel || null,
            signalrUserId: options.signalrUserId || 'user-' + Math.random().toString(36).substr(2, 9),
            readOnly: options.readOnly || false,
            autoSave: options.autoSave !== false,
            // Cytoscape layout config. Default 'preset' preserves the original
            // explicit-position behavior. Pass e.g. { name: 'cose' } or 'cose'
            // for force-directed layouts when node positions aren't pre-computed.
            layout: options.layout || { name: 'preset' },
            ...options
        };
        if (typeof this.options.layout === 'string') {
            this.options.layout = { name: this.options.layout };
        }
        
        this.cy = null;
        this.selectedNode = null;
        this.selectedEdge = null;
        this.isAnimating = false;
        this.nodeCounter = 1;
    }

    themeValue(name, fallback) {
        const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
        return value || fallback;
    }

    init() {
        if (!this.container) {
            console.error('[GraphEverywhere] Container not found');
            return;
        }

        this.cy = cytoscape({
            container: this.container,
            style: [
                {
                    selector: 'node',
                    style: {
                        'background-color': 'data(color)',
                        'label': 'data(label)',
                        'color': this.themeValue('--text-dark', '#000000'),
                        'text-valign': 'center',
                        'text-halign': 'center',
                        'font-size': '16px',
                        'font-weight': '600',
                        'width': '80px',
                        'height': '80px',
                        'border-width': '3px',
                        'border-color': this.themeValue('--border-dark', '#444444')
                    }
                },
                {
                    selector: 'node:selected',
                    style: {
                        'border-color': this.themeValue('--color-secondary', '#FFC220'),
                        'border-width': '4px'
                    }
                },
                {
                    selector: 'edge',
                    style: {
                        'width': 3,
                        'line-color': 'data(edgeColor)',
                        'target-arrow-color': 'data(edgeColor)',
                        'curve-style': 'bezier',
                        'target-arrow-shape': 'triangle'
                    }
                }
            ],
            layout: this.options.layout,
            userZoomingEnabled: true,
            userPanningEnabled: true,
            wheelSensitivity: 0.1
        });

        this.setupEventHandlers();
        this.setupKeyboardHandlers();
        
        console.log('[GraphEverywhere] Initialized');
        window.cy = this.cy;
    }

    setupEventHandlers() {
        this.cy.on('tap', (evt) => {
            if (evt.target === this.cy && !this.options.readOnly) {
                const pos = evt.position;
                this.addNode(pos.x, pos.y);
            }
        });

        this.cy.on('select', 'node', (evt) => {
            if (!this.options.readOnly) {
                this.selectedNode = evt.target;
                this.showSidebar(evt.target);
            }
        });

        this.cy.on('unselect', 'node', () => {
            this.selectedNode = null;
            this.hideSidebar();
        });
    }

    setupKeyboardHandlers() {
        document.addEventListener('keydown', (evt) => {
            if (evt.key === 'z' || evt.key === 'Z') {
                this.cy.animate({
                    fit: { eles: this.cy.elements(), padding: 50 },
                    duration: 400
                });
                evt.preventDefault();
            }
            
            if (evt.key === '[') {
                this.cycleNode(-1);
                evt.preventDefault();
            }
            
            if (evt.key === ']') {
                this.cycleNode(1);
                evt.preventDefault();
            }
        });
    }

    addNode(x, y, label = null) {
        const nodeLabel = label || `Node ${this.nodeCounter}`;
        const nodeId = `n${Date.now()}`;
        
        this.cy.add({
            group: 'nodes',
            data: { 
                id: nodeId,
                label: nodeLabel,
                color: this.themeValue('--color-primary', '#0071CE')
            },
            position: { x, y }
        });
        
        this.nodeCounter++;
        return nodeId;
    }

    cycleNode(direction) {
        if (!this.cy || this.isAnimating) return;
        
        const allNodes = this.cy.nodes().toArray();
        if (allNodes.length === 0) return;
        
        this.isAnimating = true;
        
        const currentIndex = allNodes.findIndex(n => n.selected());
        const nextIndex = (currentIndex + direction + allNodes.length) % allNodes.length;
        
        this.cy.$(':selected').unselect();
        allNodes[nextIndex].select();
        
        this.zoomToNode(allNodes[nextIndex]);
        
        setTimeout(() => {
            this.isAnimating = false;
        }, 500);
    }

    zoomToNode(node) {
        if (!node) return;
        
        const sidebar = document.getElementById('graph-sidebar');
        const sidebarWidth = (sidebar && sidebar.style.transform === 'translateX(0px)') ? 350 : 0;
        
        const bb = node.boundingBox();
        const fullWidth = this.cy.width();
        const visibleWidth = fullWidth - sidebarWidth;
        
        const zoom = Math.min(visibleWidth / (bb.w + 200), this.cy.height() / (bb.h + 200));
        
        const visibleCenterX = sidebarWidth + (visibleWidth / 2);
        const panX = visibleCenterX - (node.position('x') * zoom);
        const panY = (this.cy.height() / 2) - (node.position('y') * zoom);
        
        this.cy.animate({
            zoom: zoom,
            pan: { x: panX, y: panY },
            duration: 500
        });
    }

    showSidebar(element) {
        let sidebar = document.getElementById('graph-sidebar');
        if (!sidebar) {
            sidebar = document.createElement('div');
            sidebar.id = 'graph-sidebar';
            sidebar.innerHTML = '<div id="graph-workspace"></div>';
            document.body.appendChild(sidebar);
        }
        
        const content = sidebar.querySelector('#graph-workspace');
        content.innerHTML = `
            <div style="padding: 16px;">
                <h3>Properties</h3>
                <button id="graph-sidebar-close" class="btn-secondary">Close</button>
            </div>
        `;
        
        document.getElementById('graph-sidebar-close').addEventListener('click', () => {
            this.cy.$(':selected').unselect();
        });
        
        sidebar.style.transform = 'translateX(0)';
    }

    hideSidebar() {
        const sidebar = document.getElementById('graph-sidebar');
        if (sidebar) {
            sidebar.style.transform = 'translateX(-100%)';
        }
    }

    exportJSON() {
        const nodes = [];
        const edges = [];
        
        this.cy.nodes().forEach(node => {
            nodes.push({
                id: node.id(),
                label: node.data('label'),
                description: node.data('description') || '',
                color: node.data('color') || this.themeValue('--color-primary', '#0071CE'),
                size: node.data('size') || 'medium',
                textSize: node.data('textSize') || 'medium',
                x: node.position('x'),
                y: node.position('y')
            });
        });
        
        this.cy.edges().forEach(edge => {
            edges.push({
                id: edge.id(),
                source: edge.data('source'),
                target: edge.data('target'),
                label: edge.data('label') || '',
                edgeColor: edge.data('edgeColor') || this.themeValue('--color-primary', '#0071CE'),
                thickness: edge.data('thickness') || 'medium',
                lineStyle: edge.data('lineStyle') || 'solid',
                targetArrow: edge.data('targetArrow') || 'triangle',
                sourceArrow: edge.data('sourceArrow') || 'none'
            });
        });
        
        return {
            version: '1.0',
            name: this.currentGraphName || 'untitled',
            nodes,
            edges
        };
    }

    importJSON(data) {
        this.cy.elements().remove();
        
        if (data.nodes) {
            const sizeMap = { small: 60, medium: 80, large: 100 };
            const textSizeMap = { small: '12px', medium: '16px', large: '20px' };
            
            data.nodes.forEach(node => {
                const nodeSize = node.size || 'medium';
                const nodeTextSize = node.textSize || 'medium';

                const spec = {
                    group: 'nodes',
                    data: {
                        id: node.id,
                        label: node.label,
                        description: node.description || '',
                        color: node.color || this.themeValue('--color-primary', '#0071CE'),
                        size: nodeSize,
                        textSize: nodeTextSize
                    }
                };
                // Only pin a position when one was supplied. Without this, force
                // layouts can't run because every node arrives pre-placed at
                // (undefined, undefined) -> NaN.
                if (typeof node.x === 'number' && typeof node.y === 'number') {
                    spec.position = { x: node.x, y: node.y };
                }
                const addedNode = this.cy.add(spec);
                
                addedNode.style('width', sizeMap[nodeSize]);
                addedNode.style('height', sizeMap[nodeSize]);
                addedNode.style('font-size', textSizeMap[nodeTextSize]);
            });
        }
        
        if (data.edges) {
            const thicknessMap = { thin: 2, medium: 3, thick: 5 };
            
            data.edges.forEach(edge => {
                const edgeThickness = edge.thickness || 'medium';
                const edgeColor = edge.edgeColor || this.themeValue('--color-primary', '#0071CE');
                
                const addedEdge = this.cy.add({
                    group: 'edges',
                    data: {
                        id: edge.id,
                        source: edge.source,
                        target: edge.target,
                        label: edge.label || '',
                        edgeColor: edgeColor,
                        thickness: edgeThickness,
                        lineStyle: edge.lineStyle || 'solid',
                        targetArrow: edge.targetArrow || 'triangle',
                        sourceArrow: edge.sourceArrow || 'none'
                    }
                });
                
                addedEdge.style('width', thicknessMap[edgeThickness]);
                addedEdge.style('line-color', edgeColor);
                addedEdge.style('target-arrow-color', edgeColor);
                addedEdge.style('source-arrow-color', edgeColor);
            });
        }
        
        if (data.name) {
            this.currentGraphName = data.name;
        }
    }

    /**
     * Re-run a Cytoscape layout. Pass a layout name ('cose', 'preset', etc.)
     * or a full Cytoscape layout options object. Falls back to the layout
     * configured at construction time.
     */
    runLayout(layoutSpec) {
        if (!this.cy) return;
        let spec = layoutSpec || this.options.layout || { name: 'preset' };
        if (typeof spec === 'string') {
            spec = { name: spec };
        }
        this.cy.layout(spec).run();
    }
}

// Export
window.GraphEverywhere = GraphEverywhere;
console.log('[GraphEverywhere] Library loaded v1.0.0');
