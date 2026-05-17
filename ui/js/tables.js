/**
 * Tables Everywhere - Reusable Table Component
 * @version 1.0.0
 * @description Renders sortable, scrollable tables with actions
 * @license MIT
 * 
 * USAGE:
 * const table = new TablesEverywhere({
 *     containerId: 'my-table-container',
 *     dataSource: '/api/items',
 *     columns: [ ... ],
 *     rowTemplate: (item) => ({ ... })
 * });
 * table.render();
 */

(function() {
    'use strict';
    
    class TablesEverywhere {
        constructor(config) {
            this.config = config || {};
            this.data = [];
            this.filteredData = [];
            this.sortColumn = null;
            this.sortDirection = 'asc';
            this.currentPage = 0;
            const pagination = this.config.pagination || {};
            this.pageSize = this.normalizePageSize(pagination.pageSize || this.config.pageSize || 25, 25);
            this.pageSizeOptions = this.normalizePageSizeOptions(
                pagination.pageSizeOptions || this.config.pageSizeOptions || [25, 50, 100]
            );
        }
        
        /**
         * Render table from data source
         */
        async render() {
            const container = document.getElementById(this.config.containerId);
            if (!container) {
                console.error('[Tables Everywhere] Container not found:', this.config.containerId);
                return;
            }
            
            // Create table structure
            container.innerHTML = `
                <div class="table-container">
                    <table class="data-table">
                        <thead>
                            <tr id="table-header-row"></tr>
                        </thead>
                        <tbody id="table-body">
                            <tr><td colspan="${this.config.columns.length}" class="loading"><div class="loading-spinner"></div></td></tr>
                        </tbody>
                    </table>
                </div>
                <div id="table-pager"></div>
            `;
            
            // Render header
            this.renderHeader();
            
            // Load data
            await this.loadData();
            
            // Render rows
            this.renderRows();
        }
        
        /**
         * Render table header
         */
        renderHeader() {
            const headerRow = document.getElementById('table-header-row');
            if (!headerRow) return;
            
            headerRow.innerHTML = this.config.columns.map(col => {
                const sortable = col.sortable ? 'sortable' : '';
                const colClass = col.className || '';
                return `<th class="${sortable} ${colClass}" data-sort="${col.key || ''}">${col.label}</th>`;
            }).join('');
            
            // Wire up sort handlers
            headerRow.querySelectorAll('.sortable').forEach(th => {
                th.addEventListener('click', () => {
                    const sortKey = th.dataset.sort;
                    this.sort(sortKey);
                });
            });
        }
        
        /**
         * Load data from API or inline data
         */
        async loadData() {
            if (this.config.data) {
                this.data = this.config.data;
                this.filteredData = [...this.data];
                return;
            }
            
            if (!this.config.dataSource) {
                console.error('[Tables Everywhere] No data source provided');
                return;
            }
            
            try {
                const response = await fetch(this.config.dataSource);
                const result = await response.json();
                
                // Handle both array and {success, data} wrapper
                if (Array.isArray(result)) {
                    this.data = result;
                } else if (result.success && result.data) {
                    this.data = result.data;
                } else {
                    this.data = [];
                }
                
                this.filteredData = [...this.data];
            } catch (error) {
                console.error('[Tables Everywhere] Failed to load data:', error);
                this.data = [];
                this.filteredData = [];
            }
        }
        
        /**
         * Render table rows
         */
        renderRows() {
            const tbody = document.getElementById('table-body');
            if (!tbody) return;
            
            if (this.filteredData.length === 0) {
                tbody.innerHTML = `<tr><td colspan="${this.config.columns.length}" class="loading">No items found</td></tr>`;
                this.renderPager();
                return;
            }

            this.clampPage();
            const pageRows = this.getPageRows();
            tbody.innerHTML = pageRows.map(item => this.renderRow(item)).join('');
            
            // Wire up action handlers
            this.wireUpHandlers();
            this.renderPager();
        }
        
        /**
         * Render individual row
         */
        renderRow(item) {
            const template = this.config.rowTemplate(item);
            
            const cells = this.config.columns.map(col => {
                const value = template[col.key] || '';
                return `<td>${value}</td>`;
            }).join('');
            
            return `<tr data-item-id="${item.id || item.slug}">${cells}</tr>`;
        }
        
        /**
         * Wire up action handlers
         */
        wireUpHandlers() {
            const tbody = document.getElementById('table-body');
            if (!tbody) return;
            
            // Row click handlers
            if (this.config.onRowClick) {
                tbody.querySelectorAll('tr').forEach(row => {
                    const itemId = row.dataset.itemId;
                    const item = this.data.find(i => i.id === itemId || i.slug === itemId);
                    
                    row.addEventListener('click', (e) => {
                        // Don't trigger if clicking action button
                        if (e.target.closest('button')) return;
                        
                        this.config.onRowClick(item, itemId);
                    });
                });
            }
            
            // Action button handlers
            tbody.querySelectorAll('[data-action]').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const action = btn.dataset.action;
                    const itemId = btn.closest('tr').dataset.itemId;
                    const item = this.data.find(i => i.id === itemId || i.slug === itemId);
                    
                    if (this.config.actions && this.config.actions[action]) {
                        this.config.actions[action](item, itemId);
                    }
                });
            });
        }
        
        /**
         * Sort table by column
         */
        sort(columnKey) {
            if (this.sortColumn === columnKey) {
                this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
            } else {
                this.sortColumn = columnKey;
                this.sortDirection = 'asc';
            }
            
            this.filteredData.sort((a, b) => {
                const aVal = a[columnKey];
                const bVal = b[columnKey];
                
                if (aVal < bVal) return this.sortDirection === 'asc' ? -1 : 1;
                if (aVal > bVal) return this.sortDirection === 'asc' ? 1 : -1;
                return 0;
            });

            this.currentPage = 0;
            this.renderRows();
        }
        
        /**
         * Filter table by search term
         */
        filter(searchTerm) {
            if (!searchTerm) {
                this.filteredData = [...this.data];
            } else {
                const term = searchTerm.toLowerCase();
                this.filteredData = this.data.filter(item => {
                    return this.config.columns.some(col => {
                        const value = item[col.key];
                        return value && value.toString().toLowerCase().includes(term);
                    });
                });
            }

            this.currentPage = 0;
            this.renderRows();
        }
        
        /**
         * Refresh data and re-render
         */
        async refresh() {
            await this.loadData();
            this.renderRows();
        }

        getPageCount() {
            return Math.max(1, Math.ceil(this.filteredData.length / this.pageSize));
        }

        clampPage() {
            this.currentPage = Math.min(this.currentPage, Math.max(this.getPageCount() - 1, 0));
        }

        getPageRows() {
            const start = this.currentPage * this.pageSize;
            return this.filteredData.slice(start, start + this.pageSize);
        }

        renderPager() {
            const pager = document.getElementById('table-pager');
            if (!pager) return;

            const totalItems = this.filteredData.length;
            const pageCount = this.getPageCount();
            const pageNumber = totalItems === 0 ? 0 : this.currentPage + 1;
            const start = totalItems === 0 ? 0 : this.currentPage * this.pageSize + 1;
            const end = totalItems === 0 ? 0 : Math.min((this.currentPage + 1) * this.pageSize, totalItems);

            pager.innerHTML = `
                <div class="pager">
                    <div class="pager__summary">${totalItems === 0 ? 'No rows' : `${start.toLocaleString()}-${end.toLocaleString()} of ${totalItems.toLocaleString()} rows`}</div>
                    <div class="pager__controls">
                        <label class="pager__size">
                            <span class="pager__size-label">Rows</span>
                            <select id="table-page-size" class="pager__select" aria-label="Rows per page">
                                ${this.pageSizeOptions.map((size) => `<option value="${size}" ${size === this.pageSize ? 'selected' : ''}>${size}</option>`).join('')}
                            </select>
                        </label>
                        <button id="table-page-prev" type="button" class="btn-secondary pager__button" ${pageNumber <= 1 ? 'disabled' : ''}>Prev</button>
                        <span class="pager__status">${totalItems === 0 ? 'No pages' : `Page ${pageNumber} of ${pageCount}`}</span>
                        <button id="table-page-next" type="button" class="btn-secondary pager__button" ${pageNumber >= pageCount ? 'disabled' : ''}>Next</button>
                    </div>
                </div>
            `;

            pager.querySelector('#table-page-prev')?.addEventListener('click', () => {
                if (this.currentPage === 0) return;
                this.currentPage -= 1;
                this.renderRows();
            });
            pager.querySelector('#table-page-next')?.addEventListener('click', () => {
                if (this.currentPage >= pageCount - 1) return;
                this.currentPage += 1;
                this.renderRows();
            });
            pager.querySelector('#table-page-size')?.addEventListener('change', (event) => {
                this.pageSize = this.normalizePageSize(event.target.value, this.pageSizeOptions[0] || 25);
                this.currentPage = 0;
                this.renderRows();
            });
        }

        normalizePageSizeOptions(values) {
            const normalized = (Array.isArray(values) ? values : [])
                .map((value) => Number.parseInt(value, 10))
                .filter((value) => Number.isFinite(value) && value > 0);

            return normalized.length > 0 ? Array.from(new Set(normalized)) : [25, 50, 100];
        }

        normalizePageSize(value, fallback) {
            const parsed = Number.parseInt(value, 10);
            return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
        }
    }
    
    // Export
    window.TablesEverywhere = TablesEverywhere;
    
    console.log('[Tables Everywhere] Library loaded v1.0.0');
})();
