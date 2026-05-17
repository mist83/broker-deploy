// Visual Sitemap Builder - Cytoscape-based sitemap editor
// Maps visual graph to sitemap.json structure

class VisualSitemapBuilder {
    constructor() {
        this.cy = null;
        this.selectedNode = null;
        this.nodeCounter = 0;
        this.iconList = [
            'ti-book', 'ti-palette', 'ti-wand', 'ti-settings', 'ti-home',
            'ti-user', 'ti-chart-bar', 'ti-file', 'ti-folder', 'ti-star',
            'ti-heart', 'ti-bell', 'ti-mail', 'ti-search', 'ti-plus'
        ];
    }

    initialize() {
        const container = document.getElementById('canvas');
        
        this.cy = cytoscape({
            container: container,
            style: this.getStyles(),
            layout: { name: 'preset' },
            minZoom: 0.3,
            maxZoom: 3,
            wheelSensitivity: 0.2
        });

        this.setupEventListeners();
        this.loadFromLocalStorage();
        
        console.log('Visual Sitemap Builder initialized');
    }

    getStyles() {
        return [
            {
                selector: 'node',
                style: {
                    'label': 'data(label)',
                    'text-valign': 'center',
                    'text-halign': 'center',
                    'font-size': '14px',
                    'font-weight': 'bold',
                    'color': '#ffffff',
                    'text-wrap': 'wrap',
                    'text-max-width': '120px',
                    'width': '100px',
                    'height': '100px',
                    'border-width': '3px'
                }
            },
            {
                selector: 'node[type="tab"]',
                style: {
                    'background-color': '#2196F3',
                    'border-color': '#1976D2',
                    'shape': 'round-rectangle'
                }
            },
            {
                selector: 'node[type="sidebar"]',
                style: {
                    'background-color': '#FFC220',
                    'border-color': '#FFA000',
                    'shape': 'ellipse',
                    'width': '80px',
                    'height': '80px'
                }
            },
            {
                selector: 'node[type="detail"]',
                style: {
                    'background-color': '#4CAF50',
                    'border-color': '#388E3C',
                    'shape': 'rectangle',
                    'width': '70px',
                    'height': '70px'
                }
            },
            {
                selector: 'node:selected',
                style: {
                    'border-width': '5px',
                    'border-color': '#FF5722',
                    'overlay-color': '#FF5722',
                    'overlay-opacity': 0.2
                }
            },
            {
                selector: 'edge',
                style: {
                    'width': 3,
                    'line-color': '#999',
                    'target-arrow-color': '#999',
                    'target-arrow-shape': 'triangle',
                    'curve-style': 'bezier'
                }
            },
            {
                selector: 'edge[type="tab-sidebar"]',
                style: {
                    'line-color': '#2196F3',
                    'target-arrow-color': '#2196F3'
                }
            },
            {
                selector: 'edge[type="sidebar-detail"]',
                style: {
                    'line-color': '#FFC220',
                    'target-arrow-color': '#FFC220'
                }
            }
        ];
    }

    setupEventListeners() {
        // Palette items - click to add node
        document.querySelectorAll('.palette-item').forEach(item => {
            item.addEventListener('click', () => {
                const type = item.dataset.type;
                this.addNode(type);
            });
        });

        // Toolbar buttons
        document.getElementById('btn-new').addEventListener('click', () => this.newSitemap());
        document.getElementById('btn-load').addEventListener('click', () => this.loadSitemap());
        document.getElementById('btn-save').addEventListener('click', () => this.exportSitemap());
        document.getElementById('btn-clear').addEventListener('click', () => this.clearCanvas());
        document.getElementById('btn-layout').addEventListener('click', () => this.autoLayout());

        // Canvas events
        this.cy.on('tap', 'node', (evt) => {
            this.selectNode(evt.target);
        });

        this.cy.on('tap', (evt) => {
            if (evt.target === this.cy) {
                this.deselectNode();
            }
        });

        // Drag to connect nodes
        this.cy.on('taphold', 'node', (evt) => {
            this.startConnection(evt.target);
        });

        // Update node count
        this.cy.on('add remove', 'node', () => {
            this.updateNodeCount();
        });

        // Auto-save on changes
        this.cy.on('add remove data', () => {
            this.saveToLocalStorage();
        });
    }

    addNode(type, data = {}) {
        const nodeId = `node-${++this.nodeCounter}`;
        const defaultLabels = {
            tab: 'New Tab',
            sidebar: 'New Item',
            detail: 'Detail View'
        };

        const node = {
            group: 'nodes',
            data: {
                id: nodeId,
                type: type,
                label: data.label || defaultLabels[type],
                nodeId: data.nodeId || type + '-' + this.nodeCounter,
                icon: data.icon || 'ti ti-circle',
                ...data
            },
            position: {
                x: Math.random() * 400 + 200,
                y: Math.random() * 300 + 150
            }
        };

        this.cy.add(node);
        this.hideEmptyState();
        this.updateStatus(`Added ${type} node`);
        
        return nodeId;
    }

    selectNode(node) {
        this.selectedNode = node;
        this.cy.nodes().removeClass('selected');
        node.addClass('selected');
        this.showProperties(node);
    }

    deselectNode() {
        this.selectedNode = null;
        this.cy.nodes().removeClass('selected');
        this.hideProperties();
    }

    showProperties(node) {
        const data = node.data();
        const type = data.type;
        
        let html = '';

        // Common properties
        html += `
            <div class="property-group">
                <label>Type</label>
                <input type="text" value="${type}" disabled>
            </div>
            <div class="property-group">
                <label>Label</label>
                <input type="text" id="prop-label" value="${data.label || ''}">
            </div>
            <div class="property-group">
                <label>ID</label>
                <input type="text" id="prop-id" value="${data.nodeId || ''}">
            </div>
            <div class="property-group">
                <label>Icon</label>
                <select id="prop-icon">
                    ${this.iconList.map(icon => 
                        `<option value="ti ${icon}" ${data.icon === 'ti ' + icon ? 'selected' : ''}>
                            ${icon.replace('ti-', '')}
                        </option>`
                    ).join('')}
                </select>
            </div>
        `;

        // Type-specific properties
        if (type === 'sidebar') {
            html += `
                <div class="property-group">
                    <label>Name (for sidebar)</label>
                    <input type="text" id="prop-name" value="${data.name || data.label || ''}">
                </div>
            `;
        }

        // Action buttons
        html += `
            <div style="margin-top: 24px; display: flex; gap: 8px;">
                <button id="btn-update" style="flex: 1; padding: 10px; background: var(--accent-primary); color: white; border: none; border-radius: 4px; cursor: pointer;">
                    Update
                </button>
                <button id="btn-delete" style="padding: 10px; background: #f44336; color: white; border: none; border-radius: 4px; cursor: pointer;">
                    <i class="ti ti-trash"></i>
                </button>
            </div>
        `;

        document.getElementById('properties-content').innerHTML = html;

        // Bind update button
        document.getElementById('btn-update').addEventListener('click', () => {
            this.updateNodeProperties(node);
        });

        // Bind delete button
        document.getElementById('btn-delete').addEventListener('click', () => {
            this.deleteNode(node);
        });
    }

    hideProperties() {
        document.getElementById('properties-content').innerHTML = 
            '<p style="color: var(--text-muted); font-size: 13px;">Select a node to edit properties</p>';
    }

    updateNodeProperties(node) {
        const label = document.getElementById('prop-label').value;
        const nodeId = document.getElementById('prop-id').value;
        const icon = document.getElementById('prop-icon').value;
        const nameInput = document.getElementById('prop-name');
        
        node.data('label', label);
        node.data('nodeId', nodeId);
        node.data('icon', icon);
        
        if (nameInput) {
            node.data('name', nameInput.value);
        }

        this.updateStatus('Properties updated');
    }

    deleteNode(node) {
        if (confirm('Delete this node and all its connections?')) {
            this.cy.remove(node);
            this.deselectNode();
            this.updateStatus('Node deleted');
        }
    }

    startConnection(sourceNode) {
        // Simple connection: click source, then click target
        this.updateStatus('Click another node to connect');
        
        const handler = (evt) => {
            if (evt.target !== this.cy && evt.target.isNode()) {
                const targetNode = evt.target;
                if (targetNode.id() !== sourceNode.id()) {
                    this.connectNodes(sourceNode, targetNode);
                }
            }
            this.cy.off('tap', handler);
            this.updateStatus('Ready');
        };

        this.cy.one('tap', handler);
    }

    connectNodes(source, target) {
        const sourceType = source.data('type');
        const targetType = target.data('type');
        
        // Validate connection rules
        if (sourceType === 'tab' && targetType === 'sidebar') {
            this.addEdge(source.id(), target.id(), 'tab-sidebar');
        } else if (sourceType === 'sidebar' && targetType === 'detail') {
            this.addEdge(source.id(), target.id(), 'sidebar-detail');
        } else {
            alert(`Cannot connect ${sourceType} to ${targetType}`);
        }
    }

    addEdge(sourceId, targetId, type) {
        const edgeId = `edge-${sourceId}-${targetId}`;
        
        // Check if edge already exists
        if (this.cy.getElementById(edgeId).length > 0) {
            this.updateStatus('Connection already exists');
            return;
        }

        this.cy.add({
            group: 'edges',
            data: {
                id: edgeId,
                source: sourceId,
                target: targetId,
                type: type
            }
        });

        this.updateStatus('Nodes connected');
    }

    autoLayout() {
        this.cy.layout({
            name: 'breadthfirst',
            directed: true,
            spacingFactor: 1.5,
            padding: 50
        }).run();

        this.updateStatus('Layout applied');
    }

    exportSitemap() {
        const sitemap = this.generateSitemap();
        const json = JSON.stringify(sitemap, null, 2);
        
        // Download as file
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'sitemap.json';
        a.click();
        URL.revokeObjectURL(url);

        this.updateStatus('Sitemap exported');
    }

    generateSitemap() {
        const tabs = [];
        
        // Get all tab nodes
        const tabNodes = this.cy.nodes('[type="tab"]');
        
        tabNodes.forEach(tabNode => {
            const tabData = tabNode.data();
            const tab = {
                id: tabData.nodeId,
                label: tabData.label,
                icon: tabData.icon
            };

            // Get sidebar items for this tab
            const sidebarNodes = tabNode.outgoers('node[type="sidebar"]');
            
            if (sidebarNodes.length > 0) {
                tab.sidebar = [];
                
                sidebarNodes.forEach(sidebarNode => {
                    const sidebarData = sidebarNode.data();
                    tab.sidebar.push({
                        id: sidebarData.nodeId,
                        name: sidebarData.name || sidebarData.label,
                        icon: sidebarData.icon
                    });
                });
            }

            tabs.push(tab);
        });

        return { tabs };
    }

    loadSitemap() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        
        input.onchange = (e) => {
            const file = e.target.files[0];
            const reader = new FileReader();
            
            reader.onload = (event) => {
                try {
                    const sitemap = JSON.parse(event.target.result);
                    this.importSitemap(sitemap);
                    this.updateStatus('Sitemap loaded');
                } catch (error) {
                    alert('Failed to load sitemap: ' + error.message);
                }
            };
            
            reader.readAsText(file);
        };
        
        input.click();
    }

    importSitemap(sitemap) {
        this.clearCanvas();
        
        let yOffset = 100;
        const xSpacing = 250;
        
        sitemap.tabs.forEach((tab, tabIndex) => {
            // Add tab node
            const tabId = this.addNode('tab', {
                label: tab.label,
                nodeId: tab.id,
                icon: tab.icon
            });
            
            const tabNode = this.cy.getElementById(tabId);
            tabNode.position({ x: 150, y: yOffset });

            // Add sidebar items
            if (tab.sidebar && tab.sidebar.length > 0) {
                tab.sidebar.forEach((item, itemIndex) => {
                    const sidebarId = this.addNode('sidebar', {
                        label: item.name,
                        nodeId: item.id,
                        name: item.name,
                        icon: item.icon
                    });
                    
                    const sidebarNode = this.cy.getElementById(sidebarId);
                    sidebarNode.position({ 
                        x: 150 + xSpacing, 
                        y: yOffset + (itemIndex * 120) 
                    });

                    // Connect tab to sidebar
                    this.addEdge(tabId, sidebarId, 'tab-sidebar');
                });
                
                yOffset += (tab.sidebar.length * 120) + 50;
            } else {
                yOffset += 150;
            }
        });

        this.cy.fit(50);
    }

    newSitemap() {
        if (confirm('Clear current sitemap and start new?')) {
            this.clearCanvas();
            this.updateStatus('New sitemap created');
        }
    }

    clearCanvas() {
        this.cy.elements().remove();
        this.deselectNode();
        this.showEmptyState();
        this.nodeCounter = 0;
    }

    hideEmptyState() {
        document.getElementById('empty-state').style.display = 'none';
    }

    showEmptyState() {
        document.getElementById('empty-state').style.display = 'block';
    }

    updateNodeCount() {
        const count = this.cy.nodes().length;
        document.getElementById('node-count').textContent = `${count} node${count !== 1 ? 's' : ''}`;
    }

    updateStatus(message) {
        document.getElementById('status-text').textContent = message;
    }

    saveToLocalStorage() {
        const data = {
            elements: this.cy.json().elements,
            nodeCounter: this.nodeCounter
        };
        localStorage.setItem('visual-sitemap-builder', JSON.stringify(data));
    }

    loadFromLocalStorage() {
        const saved = localStorage.getItem('visual-sitemap-builder');
        if (saved) {
            try {
                const data = JSON.parse(saved);
                this.cy.json({ elements: data.elements });
                this.nodeCounter = data.nodeCounter || 0;
                this.hideEmptyState();
                this.updateNodeCount();
                this.updateStatus('Loaded from local storage');
            } catch (error) {
                console.error('Failed to load from localStorage:', error);
            }
        }
    }
}

// Initialize on load
let builder = null;

document.addEventListener('DOMContentLoaded', () => {
    builder = new VisualSitemapBuilder();
    builder.initialize();
});

// Export for debugging
window.builder = builder;
