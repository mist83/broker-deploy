class LiskovApp {
    constructor() {
        this.apiBaseCandidates = this.buildApiBaseCandidates();
        this.baseUrl = this.apiBaseCandidates[0] || window.location.origin;
        this.authToken = '';
        this.bucketName = '';
        this.pathPrefix = '';
        this.files = [];
        this.searchQuery = '';
        this.searchResults = [];
        this.searchMeta = {
            scannedFiles: 0,
            truncated: false,
        };
        this.selectedFiles = new Set();
        this.connectionConnected = null;
        this.connectionMessage = 'Health probe pending';
        this.root = null;
        this.elements = {};
        this.shellBooted = false;

        window.liskovApp = this;

        window.addEventListener('ui-ready', () => {
            void this.bootShell();
        }, { once: true });

        if (document.readyState !== 'loading') {
            window.setTimeout(() => {
                if (!this.shellBooted && window.TabsEverywhere) {
                    void this.bootShell();
                }
            }, 0);
        }
    }

    buildApiBaseCandidates() {
        const isLocalhost = /^(localhost|127(?:\.\d{1,3}){3})$/i.test(window.location.hostname);
        const candidates = isLocalhost
            ? [window.API_BASE, window.location.origin, window.LISKOV_DIRECT_API_BASE]
            : [window.LISKOV_DIRECT_API_BASE, window.API_BASE, window.location.origin];

        return [...new Set(
            candidates
                .map((value) => String(value || '').trim().replace(/\/+$/, ''))
                .filter(Boolean)
        )];
    }

    async bootShell() {
        if (this.shellBooted || typeof window.TabsEverywhere !== 'function') {
            return;
        }

        this.shellBooted = true;
        window.UI = window.UI || {};

        const shell = new window.TabsEverywhere({
            tabsContainerId: 'tabs-container',
            contentContainerId: 'content-container',
            sitemapPath: './sitemap.json',
        });

        window.UI.tabs = shell;
        window.UI.currentShell = shell;
        await shell.init();
    }

    mountView(viewName) {
        const root = document.querySelector(`[data-lfs-view="${viewName}"]`);
        if (!root) {
            return;
        }

        this.root = root;
        this.loadConfig();
        this.cacheElements();
        this.bindViewEvents();
        this.syncViewState();

        if (this.elements.bucketName) {
            void this.loadBuckets();
        }

        void this.checkConnection();
    }

    cacheElements() {
        const find = (id) => this.root.querySelector(`#${id}`);
        this.elements = {
            authToken: find('authToken'),
            bucketName: find('bucketName'),
            pathPrefix: find('pathPrefix'),
            loadFilesBtn: find('loadFilesBtn'),
            saveConfigBtn: find('saveConfigBtn'),
            refreshBtn: find('refreshBtn'),
            uploadBtn: find('uploadBtn'),
            createFileBtn: find('createFileBtn'),
            createFolderBtn: find('createFolderBtn'),
            downloadSelectedBtn: find('downloadSelectedBtn'),
            deleteSelectedBtn: find('deleteSelectedBtn'),
            fileFilter: find('fileFilter'),
            filesList: find('filesList'),
            filesBreadcrumbs: find('filesBreadcrumbs'),
            searchQuery: find('searchQuery'),
            runSearchBtn: find('runSearchBtn'),
            clearSearchBtn: find('clearSearchBtn'),
            searchResults: find('searchResults'),
            searchCount: find('searchCount'),
            searchScope: find('searchScope'),
            baseUrl: find('baseUrl'),
            connectionText: find('connectionText'),
            connectionMeta: find('connectionMeta'),
            fileCount: find('fileCount'),
            selectedCount: find('selectedCount'),
            activeBucket: find('activeBucket'),
            activePrefix: find('activePrefix'),
            selectedFilesList: find('selectedFilesList'),
        };
    }

    bindViewEvents() {
        if (!this.root || this.root.dataset.bound === 'true') {
            return;
        }

        this.elements.authToken?.addEventListener('change', () => {
            this.authToken = this.elements.authToken.value.trim();
            this.updateSummary();
            void this.loadBuckets();
        });

        this.elements.bucketName?.addEventListener('change', () => {
            this.bucketName = this.elements.bucketName.value;
            this.updateSummary();
        });

        this.elements.pathPrefix?.addEventListener('input', () => {
            this.pathPrefix = this.normalizePrefix(this.elements.pathPrefix.value.trim());
            this.updateSummary();
            this.renderBreadcrumbs();
        });

        this.elements.loadFilesBtn?.addEventListener('click', () => void this.loadFiles());
        this.elements.saveConfigBtn?.addEventListener('click', () => this.saveConfig());
        this.elements.refreshBtn?.addEventListener('click', () => void this.loadFiles());
        this.elements.uploadBtn?.addEventListener('click', () => this.showUploadModal());
        this.elements.createFileBtn?.addEventListener('click', () => this.showCreateFileModal());
        this.elements.createFolderBtn?.addEventListener('click', () => this.showCreateFolderModal());
        this.elements.downloadSelectedBtn?.addEventListener('click', () => void this.downloadSelected());
        this.elements.deleteSelectedBtn?.addEventListener('click', () => void this.deleteSelected());
        this.elements.fileFilter?.addEventListener('input', () => this.renderFiles());
        this.elements.filesList?.addEventListener('click', (event) => this.handleFilesListClick(event));
        this.elements.filesBreadcrumbs?.addEventListener('click', (event) => this.handleBreadcrumbClick(event));
        this.elements.selectedFilesList?.addEventListener('click', (event) => this.handleSelectionListClick(event));
        this.elements.runSearchBtn?.addEventListener('click', () => void this.performSearch());
        this.elements.clearSearchBtn?.addEventListener('click', () => this.clearSearch());
        this.elements.searchResults?.addEventListener('click', (event) => this.handleSearchResultsClick(event));
        this.elements.searchQuery?.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                event.preventDefault();
                void this.performSearch();
            }
        });

        this.root.dataset.bound = 'true';
    }

    syncViewState() {
        this.writeFieldValues();
        this.updateConnectionStatus(this.connectionConnected, this.connectionMessage);
        this.updateSummary();
        this.renderBreadcrumbs();
        this.renderFiles();
        this.renderSelectedFiles();
        this.renderSearchResults();
    }

    writeFieldValues() {
        if (this.elements.authToken) {
            this.elements.authToken.value = this.authToken;
        }

        if (this.elements.pathPrefix) {
            this.elements.pathPrefix.value = this.pathPrefix;
        }

        if (this.elements.searchQuery) {
            this.elements.searchQuery.value = this.searchQuery;
        }

        if (this.elements.baseUrl) {
            this.elements.baseUrl.textContent = this.baseUrl;
        }
    }

    loadConfig() {
        const saved = localStorage.getItem('liskov-config');
        if (!saved) {
            return;
        }

        try {
            const config = JSON.parse(saved);
            this.authToken = config.authToken || '';
            this.bucketName = config.bucketName || '';
            this.pathPrefix = this.normalizePrefix(config.pathPrefix || '');
        } catch (error) {
            console.warn('[liskov] failed to parse saved config', error);
        }
    }

    saveConfig() {
        this.readStateFromInputs();

        localStorage.setItem('liskov-config', JSON.stringify({
            authToken: this.authToken,
            bucketName: this.bucketName,
            pathPrefix: this.pathPrefix,
        }));

        this.updateSummary();
        void this.loadBuckets();
        this.showToast('Session saved', 'success');
    }

    readStateFromInputs() {
        this.authToken = this.elements.authToken?.value.trim() || this.authToken;
        this.bucketName = this.elements.bucketName?.value || this.bucketName;

        if (this.elements.pathPrefix) {
            this.pathPrefix = this.normalizePrefix(this.elements.pathPrefix.value.trim());
        } else {
            this.pathPrefix = this.normalizePrefix(this.pathPrefix);
        }
    }

    async checkConnection() {
        try {
            const response = await this.apiFetch('/api/filesystem/health');
            const message = response.ok
                ? 'Health endpoint responded successfully'
                : `Health endpoint returned ${response.status}`;
            this.updateConnectionStatus(response.ok, message);
        } catch (error) {
            this.updateConnectionStatus(false, 'Health endpoint did not respond');
        }
    }

    updateConnectionStatus(connected, message = 'Health probe pending') {
        this.connectionConnected = connected;
        this.connectionMessage = message;

        if (this.elements.connectionText) {
            this.elements.connectionText.textContent = connected === null
                ? 'Checking'
                : connected
                    ? 'Connected'
                    : 'Disconnected';
        }

        if (this.elements.connectionMeta) {
            this.elements.connectionMeta.textContent = message;
        }
    }

    updateSummary() {
        const fileCountLabel = `${this.files.length} file${this.files.length === 1 ? '' : 's'}`;
        const selectedCountLabel = `${this.selectedFiles.size} selected`;
        const prefixLabel = this.pathPrefix || '(root)';
        const bucketLabel = this.bucketName || 'No bucket selected';

        if (this.elements.fileCount) {
            this.elements.fileCount.textContent = fileCountLabel;
        }

        if (this.elements.selectedCount) {
            this.elements.selectedCount.textContent = selectedCountLabel;
        }

        if (this.elements.activePrefix) {
            this.elements.activePrefix.textContent = prefixLabel;
        }

        if (this.elements.activeBucket) {
            this.elements.activeBucket.textContent = bucketLabel;
        }

        if (this.elements.searchScope) {
            this.elements.searchScope.textContent = prefixLabel;
        }

        if (this.elements.baseUrl) {
            this.elements.baseUrl.textContent = this.baseUrl;
        }
    }

    async loadBuckets() {
        const select = this.elements.bucketName;
        if (!select) {
            return;
        }

        this.readStateFromInputs();

        if (!this.authToken) {
            select.innerHTML = '<option value="">Enter auth token to load buckets</option>';
            this.updateSummary();
            return;
        }

        try {
            const response = await this.apiFetch('/api/filesystem/buckets', {
                headers: {
                    'X-Liskov-Auth-Token': this.authToken,
                },
            });

            if (!response.ok) {
                throw new Error('Failed to load buckets');
            }

            const buckets = await response.json();
            select.innerHTML = buckets.length
                ? buckets.map((bucket) => `<option value="${this.escapeHtml(bucket)}">${this.escapeHtml(bucket)}</option>`).join('')
                : '<option value="">No buckets available</option>';

            if (this.bucketName && buckets.includes(this.bucketName)) {
                select.value = this.bucketName;
            } else if (buckets.length > 0) {
                this.bucketName = buckets[0];
                select.value = buckets[0];
            } else {
                this.bucketName = '';
            }

            this.updateSummary();
        } catch (error) {
            console.error('[liskov] Error loading buckets:', error);
            select.innerHTML = '<option value="">Failed to load buckets</option>';
            this.showToast('Failed to load buckets', 'error');
        }
    }

    async loadFiles() {
        this.readStateFromInputs();
        this.updateSummary();
        this.renderBreadcrumbs();

        if (!this.bucketName) {
            this.showToast('Choose a bucket first', 'error');
            return;
        }

        try {
            const requestPath = `/api/filesystem/list-prefix?bucket=${encodeURIComponent(this.bucketName)}&prefix=${encodeURIComponent(this.pathPrefix || '')}`;
            const response = await this.apiFetch(requestPath, {
                headers: {
                    'X-Liskov-Auth-Token': this.authToken,
                },
            });

            if (!response.ok) {
                const errorPayload = await this.readErrorPayload(response);
                throw new Error(errorPayload || 'Failed to load files');
            }

            this.files = await response.json();
            this.pruneSelections();
            this.updateConnectionStatus(true, 'Health endpoint responded successfully');
            this.updateSummary();
            this.renderFiles();
            this.renderSelectedFiles();
            this.showToast(`Loaded ${this.files.length} file${this.files.length === 1 ? '' : 's'}`, 'success');
        } catch (error) {
            console.error('[liskov] Error loading files:', error);
            this.updateConnectionStatus(false, error.message || 'File load failed');
            this.showToast(error.message || 'Failed to load files', 'error');
        }
    }

    pruneSelections() {
        const available = new Set(this.files);
        this.selectedFiles = new Set([...this.selectedFiles].filter((path) => available.has(path)));
    }

    renderFiles() {
        const filesList = this.elements.filesList;
        if (!filesList) {
            return;
        }

        const items = this.getVisibleItems(this.files, this.pathPrefix);
        const query = this.elements.fileFilter?.value.trim().toLowerCase() || '';
        const visibleItems = query
            ? items.filter((item) => `${item.name} ${item.path}`.toLowerCase().includes(query))
            : items;

        if (visibleItems.length === 0) {
            const message = items.length === 0
                ? (this.bucketName ? 'No folders or files found under the current prefix.' : 'Load a bucket and prefix to list files.')
                : 'No folders or files match the current filter.';
            filesList.innerHTML = `<p class="lfs-empty-state">${message}</p>`;
            return;
        }

        filesList.innerHTML = visibleItems.map((item) => {
            if (item.kind === 'folder') {
                return this.renderFolderRow(item);
            }

            return this.renderFileRow(item);
        }).join('');
    }

    renderFolderRow(item) {
        const safePath = this.escapeHtml(item.path);
        const safeName = this.escapeHtml(item.name);
        return `
            <div class="lfs-file-row" data-path="${safePath}">
                <div class="lfs-file-main" data-action="open-folder" data-path="${safePath}">
                    <div class="lfs-file-heading">
                        <i class="ti ti-folder"></i>
                        <span class="lfs-file-name">${safeName}</span>
                    </div>
                    <span class="lfs-file-path">${safePath}</span>
                </div>
                <div class="lfs-file-actions">
                    <button class="btn-secondary lfs-icon-btn" type="button" data-action="open-folder" data-path="${safePath}" aria-label="Open folder">
                        <i class="ti ti-arrow-right"></i>
                    </button>
                </div>
            </div>
        `;
    }

    renderFileRow(item) {
        const selected = this.selectedFiles.has(item.path) ? ' is-selected' : '';
        const safePath = this.escapeHtml(item.path);
        const safeName = this.escapeHtml(item.name);
        const selectIcon = this.selectedFiles.has(item.path) ? 'ti ti-check' : 'ti ti-square';
        const fileIcon = item.textLike ? 'ti ti-file-text' : 'ti ti-file';

        return `
            <div class="lfs-file-row${selected}" data-path="${safePath}">
                <div class="lfs-file-main" data-action="view" data-path="${safePath}">
                    <div class="lfs-file-heading">
                        <i class="${fileIcon}"></i>
                        <span class="lfs-file-name">${safeName}</span>
                    </div>
                    <span class="lfs-file-path">${safePath}</span>
                </div>
                <div class="lfs-file-actions">
                    <button class="btn-secondary lfs-icon-btn" type="button" data-action="toggle-selection" data-path="${safePath}" aria-label="Toggle selection">
                        <i class="${selectIcon}"></i>
                    </button>
                    <button class="btn-secondary lfs-icon-btn" type="button" data-action="download" data-path="${safePath}" aria-label="Download file">
                        <i class="ti ti-download"></i>
                    </button>
                    <button class="btn-danger lfs-icon-btn" type="button" data-action="delete" data-path="${safePath}" aria-label="Delete file">
                        <i class="ti ti-trash"></i>
                    </button>
                </div>
            </div>
        `;
    }

    renderBreadcrumbs() {
        const breadcrumbs = this.elements.filesBreadcrumbs;
        if (!breadcrumbs) {
            return;
        }

        const normalizedPrefix = this.normalizePrefix(this.pathPrefix);
        if (!normalizedPrefix) {
            breadcrumbs.innerHTML = '<span class="lfs-breadcrumb-current">Bucket root</span>';
            return;
        }

        const segments = normalizedPrefix.replace(/\/$/, '').split('/').filter(Boolean);
        let runningPrefix = '';
        const parts = [
            '<button class="lfs-breadcrumb-btn" type="button" data-action="navigate-prefix" data-path=""><i class="ti ti-home"></i><span>Root</span></button>',
        ];

        const parentPrefix = this.getParentPrefix(normalizedPrefix);
        parts.push('<span class="lfs-breadcrumb-separator">/</span>');
        parts.push(`
            <button class="lfs-breadcrumb-btn" type="button" data-action="navigate-prefix" data-path="${this.escapeAttribute(parentPrefix)}">
                <i class="ti ti-arrow-up"></i>
                <span>Up</span>
            </button>
        `);

        segments.forEach((segment, index) => {
            runningPrefix = `${runningPrefix}${segment}/`;
            parts.push('<span class="lfs-breadcrumb-separator">/</span>');

            if (index === segments.length - 1) {
                parts.push(`<span class="lfs-breadcrumb-current">${this.escapeHtml(segment)}</span>`);
                return;
            }

            parts.push(`
                <button class="lfs-breadcrumb-btn" type="button" data-action="navigate-prefix" data-path="${this.escapeAttribute(runningPrefix)}">
                    <span>${this.escapeHtml(segment)}</span>
                </button>
            `);
        });

        breadcrumbs.innerHTML = parts.join('');
    }

    renderSelectedFiles() {
        if (!this.elements.selectedFilesList) {
            return;
        }

        const rows = [...this.selectedFiles];
        if (rows.length === 0) {
            this.elements.selectedFilesList.innerHTML = '<p class="lfs-empty-state">No files selected.</p>';
            this.updateSummary();
            return;
        }

        this.elements.selectedFilesList.innerHTML = rows.map((path) => `
            <div class="lfs-selection-chip">
                <code>${this.escapeHtml(path)}</code>
                <button
                    class="btn-secondary lfs-icon-btn"
                    type="button"
                    data-action="toggle-selection"
                    data-path="${this.escapeHtml(path)}"
                    aria-label="Remove selection"
                >
                    <i class="ti ti-x"></i>
                </button>
            </div>
        `).join('');

        this.updateSummary();
    }

    renderSearchResults() {
        if (this.elements.searchCount) {
            if (!this.searchQuery) {
                this.elements.searchCount.textContent = 'Run a search to inspect text matches.';
            } else {
                const count = `${this.searchResults.length} match${this.searchResults.length === 1 ? '' : 'es'}`;
                const scanned = `${this.searchMeta.scannedFiles} file${this.searchMeta.scannedFiles === 1 ? '' : 's'} scanned`;
                const truncated = this.searchMeta.truncated ? ' Results truncated.' : '';
                this.elements.searchCount.textContent = `${count}. ${scanned}.${truncated}`;
            }
        }

        if (!this.elements.searchResults) {
            return;
        }

        if (!this.searchQuery) {
            this.elements.searchResults.innerHTML = '<p class="lfs-empty-state">Run a search to inspect text matches.</p>';
            return;
        }

        if (this.searchResults.length === 0) {
            this.elements.searchResults.innerHTML = '<p class="lfs-empty-state">No text matches found under the current prefix.</p>';
            return;
        }

        this.elements.searchResults.innerHTML = this.searchResults.map((result) => `
            <div class="lfs-search-result">
                <div class="lfs-search-result-top">
                    <span class="lfs-search-result-path">${this.escapeHtml(result.path)}</span>
                    <span class="lfs-search-result-line">Line ${result.lineNumber}</span>
                </div>
                <p>${this.escapeHtml(result.excerpt || result.line)}</p>
                <div class="lfs-button-row">
                    <button class="btn-secondary" type="button" data-action="open-search-result" data-path="${this.escapeHtml(result.path)}">
                        <i class="ti ti-file-text"></i>
                        <span>Open file</span>
                    </button>
                </div>
            </div>
        `).join('');
    }

    handleFilesListClick(event) {
        const button = event.target.closest('[data-action]');
        if (!button) {
            return;
        }

        const path = button.dataset.path;
        const action = button.dataset.action;
        if (!action) {
            return;
        }

        if (action === 'navigate-prefix' || action === 'open-folder') {
            void this.navigateToPrefix(path || '');
            return;
        }

        if (!path) {
            return;
        }

        if (action === 'toggle-selection') {
            this.toggleFileSelection(path);
            return;
        }

        if (action === 'view') {
            void this.viewFile(path);
            return;
        }

        if (action === 'download') {
            void this.downloadFile(path);
            return;
        }

        if (action === 'delete') {
            void this.deleteFile(path);
        }
    }

    handleBreadcrumbClick(event) {
        const button = event.target.closest('[data-action="navigate-prefix"]');
        if (!button) {
            return;
        }

        void this.navigateToPrefix(button.dataset.path || '');
    }

    handleSelectionListClick(event) {
        const button = event.target.closest('[data-action="toggle-selection"]');
        if (!button?.dataset.path) {
            return;
        }

        this.toggleFileSelection(button.dataset.path);
    }

    handleSearchResultsClick(event) {
        const button = event.target.closest('[data-action="open-search-result"]');
        if (!button?.dataset.path) {
            return;
        }

        void this.viewFile(button.dataset.path);
    }

    toggleFileSelection(path) {
        if (this.selectedFiles.has(path)) {
            this.selectedFiles.delete(path);
        } else {
            this.selectedFiles.add(path);
        }

        this.renderFiles();
        this.renderSelectedFiles();
        this.updateSummary();
    }

    async navigateToPrefix(prefix) {
        this.pathPrefix = this.normalizePrefix(prefix);
        this.writeFieldValues();
        this.updateSummary();
        this.renderBreadcrumbs();
        await this.loadFiles();
    }

    async performSearch() {
        this.searchQuery = this.elements.searchQuery?.value.trim() || this.searchQuery;
        this.updateSummary();

        if (!this.bucketName) {
            this.showToast('Choose a bucket first', 'error');
            return;
        }

        if (!this.searchQuery) {
            this.showToast('Enter a search query first', 'error');
            return;
        }

        try {
            const response = await this.apiFetch(`/api/filesystem/search-text?bucket=${encodeURIComponent(this.bucketName)}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Liskov-Auth-Token': this.authToken,
                },
                body: JSON.stringify({
                    prefix: this.pathPrefix || '',
                    query: this.searchQuery,
                    maxResults: 100,
                }),
            });

            if (!response.ok) {
                const errorPayload = await this.readErrorPayload(response);
                throw new Error(errorPayload || 'Failed to search files');
            }

            const payload = await response.json();
            this.searchResults = payload.results || [];
            this.searchMeta = {
                scannedFiles: payload.scannedFiles || 0,
                truncated: Boolean(payload.truncated),
            };
            this.renderSearchResults();
            this.showToast(`Search returned ${this.searchResults.length} match${this.searchResults.length === 1 ? '' : 'es'}`, 'success');
        } catch (error) {
            console.error('[liskov] Error searching files:', error);
            this.showToast(error.message || 'Failed to search files', 'error');
        }
    }

    clearSearch() {
        this.searchQuery = '';
        this.searchResults = [];
        this.searchMeta = {
            scannedFiles: 0,
            truncated: false,
        };

        if (this.elements.searchQuery) {
            this.elements.searchQuery.value = '';
        }

        this.renderSearchResults();
    }

    getVisibleItems(allPaths, prefix) {
        const normalizedPrefix = this.normalizePrefix(prefix);
        const folders = new Map();
        const files = [];

        for (const path of allPaths) {
            if (!path.startsWith(normalizedPrefix)) {
                continue;
            }

            const remainder = path.slice(normalizedPrefix.length);
            if (!remainder || remainder === '.folder') {
                continue;
            }

            const slashIndex = remainder.indexOf('/');
            if (slashIndex >= 0) {
                const folderName = remainder.slice(0, slashIndex);
                if (!folderName || folderName === '.folder') {
                    continue;
                }

                const folderPath = `${normalizedPrefix}${folderName}/`;
                if (!folders.has(folderPath)) {
                    folders.set(folderPath, {
                        kind: 'folder',
                        name: folderName,
                        path: folderPath,
                    });
                }
                continue;
            }

            if (remainder === '.folder' || path.endsWith('/.folder')) {
                continue;
            }

            files.push({
                kind: 'file',
                name: remainder,
                path,
                textLike: this.isTextLikePath(path),
            });
        }

        const folderItems = [...folders.values()].sort((left, right) => left.name.localeCompare(right.name));
        const fileItems = files.sort((left, right) => left.name.localeCompare(right.name));
        return [...folderItems, ...fileItems];
    }

    async viewFile(path) {
        try {
            const infoResponse = await this.apiFetch(`/api/filesystem/info?bucket=${encodeURIComponent(this.bucketName)}&path=${encodeURIComponent(path)}`, {
                headers: {
                    'X-Liskov-Auth-Token': this.authToken,
                },
            });

            if (!infoResponse.ok) {
                throw new Error('Failed to get file info');
            }

            const info = await infoResponse.json();
            if (this.canEditFile(path, info)) {
                const textResponse = await this.apiFetch(`/api/filesystem/text?bucket=${encodeURIComponent(this.bucketName)}&path=${encodeURIComponent(path)}`, {
                    headers: {
                        'X-Liskov-Auth-Token': this.authToken,
                    },
                });

                if (!textResponse.ok) {
                    throw new Error('Failed to read file');
                }

                const content = await this.readTextResponse(textResponse);
                this.showTextEditorModal(path, info, content);
                return;
            }

            this.showInfoModal(path, info);
        } catch (error) {
            console.error('[liskov] Error viewing file:', error);
            this.showToast(error.message || 'Failed to inspect file', 'error');
        }
    }

    canEditFile(path, info) {
        const contentType = String(info.contentType || '').toLowerCase();
        const isTextContentType = contentType.startsWith('text/') ||
            contentType.includes('json') ||
            contentType.includes('xml') ||
            contentType.includes('javascript');

        const underPreviewLimit = !info.size || info.size <= 512 * 1024;
        return underPreviewLimit && (this.isTextLikePath(path) || isTextContentType);
    }

    showInfoModal(path, info) {
        if (!window.UI?.modals) {
            return;
        }

        const fields = [
            ['Full path', info.fullPath || path],
            ['Size', this.formatBytes(info.size)],
            ['Last modified', info.lastModified ? new Date(info.lastModified).toLocaleString() : 'Unknown'],
            ['Content type', info.contentType || 'Unknown'],
        ];

        if (info.contentHash) {
            fields.push(['Content hash', info.contentHash]);
        }

        window.UI.modals.show({
            title: this.getFileName(path),
            content: `
                <div class="lfs-modal-stack">
                    ${fields.map(([label, value]) => `
                        <div class="lfs-modal-field">
                            <label>${this.escapeHtml(label)}</label>
                            <input type="text" readonly value="${this.escapeAttribute(value)}">
                        </div>
                    `).join('')}
                </div>
            `,
            actions: [
                {
                    label: 'Download',
                    type: 'primary',
                    onClick: () => {
                        window.UI.modals.close();
                        void this.downloadFile(path);
                    },
                },
                {
                    label: 'Close',
                    type: 'secondary',
                    onClick: () => window.UI.modals.close(),
                },
            ],
        });
    }

    showTextEditorModal(path, info, content) {
        if (!window.UI?.modals) {
            return;
        }

        window.UI.modals.show({
            title: this.getFileName(path),
            content: `
                <div class="lfs-modal-stack">
                    <div class="lfs-modal-field">
                        <label>Full path</label>
                        <input type="text" readonly value="${this.escapeAttribute(info.fullPath || path)}">
                    </div>
                    <div class="lfs-modal-field">
                        <label for="modal-edit-file-content">Contents</label>
                        <textarea id="modal-edit-file-content" class="lfs-editor">${this.escapeHtml(content)}</textarea>
                    </div>
                </div>
            `,
            actions: [
                {
                    label: 'Save',
                    type: 'primary',
                    onClick: () => {
                        void this.saveTextFileFromModal(path);
                    },
                },
                {
                    label: 'Download',
                    type: 'secondary',
                    onClick: () => {
                        void this.downloadFile(path);
                    },
                },
                {
                    label: 'Close',
                    type: 'secondary',
                    onClick: () => window.UI.modals.close(),
                },
            ],
        });
    }

    async saveTextFileFromModal(path) {
        const content = document.getElementById('modal-edit-file-content')?.value ?? '';

        try {
            const response = await this.apiFetch(`/api/filesystem/text?bucket=${encodeURIComponent(this.bucketName)}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Liskov-Auth-Token': this.authToken,
                },
                body: JSON.stringify({ path, content }),
            });

            if (!response.ok) {
                const errorPayload = await this.readErrorPayload(response);
                throw new Error(errorPayload || 'Failed to save file');
            }

            window.UI.modals.close();
            this.showToast('File saved', 'success');
            await this.loadFiles();
        } catch (error) {
            console.error('[liskov] Error saving file:', error);
            this.showToast(error.message || 'Failed to save file', 'error');
        }
    }

    async downloadFile(path) {
        try {
            const requestPath = `/api/filesystem/bytes?bucket=${encodeURIComponent(this.bucketName)}&path=${encodeURIComponent(path)}`;
            const response = await this.apiFetch(requestPath, {
                headers: {
                    'X-Liskov-Auth-Token': this.authToken,
                },
            });

            if (!response.ok) {
                throw new Error('Failed to download file');
            }

            const blob = await response.blob();
            const downloadUrl = window.URL.createObjectURL(blob);
            const anchor = document.createElement('a');
            anchor.href = downloadUrl;
            anchor.download = this.getFileName(path);
            document.body.appendChild(anchor);
            anchor.click();
            document.body.removeChild(anchor);
            window.URL.revokeObjectURL(downloadUrl);
            this.showToast('File downloaded', 'success');
        } catch (error) {
            console.error('[liskov] Error downloading file:', error);
            this.showToast(error.message || 'Failed to download file', 'error');
        }
    }

    async deleteFile(path, options = {}) {
        const { skipConfirm = false, suppressReload = false } = options;
        if (!skipConfirm && !window.confirm(`Delete ${path}?`)) {
            return false;
        }

        try {
            const requestPath = `/api/filesystem?bucket=${encodeURIComponent(this.bucketName)}&path=${encodeURIComponent(path)}`;
            const response = await this.apiFetch(requestPath, {
                method: 'DELETE',
                headers: {
                    'X-Liskov-Auth-Token': this.authToken,
                },
            });

            if (!response.ok) {
                throw new Error('Failed to delete file');
            }

            this.selectedFiles.delete(path);

            if (!suppressReload) {
                await this.loadFiles();
            } else {
                this.updateSummary();
                this.renderFiles();
                this.renderSelectedFiles();
            }

            this.showToast('File deleted', 'success');
            return true;
        } catch (error) {
            console.error('[liskov] Error deleting file:', error);
            this.showToast(error.message || 'Failed to delete file', 'error');
            return false;
        }
    }

    showUploadModal() {
        if (!window.UI?.modals) {
            return;
        }

        window.UI.modals.show({
            title: 'Upload file',
            content: `
                <div class="lfs-modal-stack">
                    <div class="lfs-modal-field">
                        <label for="modal-upload-path">Destination path</label>
                        <input id="modal-upload-path" type="text" value="${this.escapeAttribute(this.pathPrefix)}" placeholder="path/to/file.txt">
                    </div>
                    <div class="lfs-modal-field">
                        <label for="modal-upload-file">Select file</label>
                        <input id="modal-upload-file" type="file">
                    </div>
                </div>
            `,
            actions: [
                {
                    label: 'Upload',
                    type: 'primary',
                    onClick: () => {
                        void this.uploadFileFromModal();
                    },
                },
                {
                    label: 'Cancel',
                    type: 'secondary',
                    onClick: () => window.UI.modals.close(),
                },
            ],
        });
    }

    async uploadFileFromModal() {
        const pathInput = document.getElementById('modal-upload-path');
        const fileInput = document.getElementById('modal-upload-file');
        const path = pathInput?.value.trim() || '';
        const file = fileInput?.files?.[0];

        if (!path || !file) {
            this.showToast('Provide a destination path and choose a file', 'error');
            return;
        }

        try {
            const formData = new FormData();
            formData.append('bucket', this.bucketName);
            formData.append('path', path);
            formData.append('file', file);

            const response = await this.apiFetch('/api/filesystem/bytes', {
                method: 'POST',
                headers: {
                    'X-Liskov-Auth-Token': this.authToken,
                },
                body: formData,
            });

            if (!response.ok) {
                throw new Error('Failed to upload file');
            }

            window.UI.modals.close();
            this.showToast('File uploaded', 'success');
            await this.loadFiles();
        } catch (error) {
            console.error('[liskov] Error uploading file:', error);
            this.showToast(error.message || 'Failed to upload file', 'error');
        }
    }

    showCreateFileModal() {
        if (!window.UI?.modals) {
            return;
        }

        window.UI.modals.show({
            title: 'Create file',
            content: `
                <div class="lfs-modal-stack">
                    <div class="lfs-modal-field">
                        <label for="modal-create-file-path">File path</label>
                        <input id="modal-create-file-path" type="text" value="${this.escapeAttribute(`${this.pathPrefix || ''}newfile.txt`)}">
                    </div>
                    <div class="lfs-modal-field">
                        <label for="modal-create-file-content">Content</label>
                        <textarea id="modal-create-file-content" placeholder="File contents"></textarea>
                    </div>
                </div>
            `,
            actions: [
                {
                    label: 'Create',
                    type: 'primary',
                    onClick: () => {
                        void this.createFileFromModal();
                    },
                },
                {
                    label: 'Cancel',
                    type: 'secondary',
                    onClick: () => window.UI.modals.close(),
                },
            ],
        });
    }

    async createFileFromModal() {
        const path = document.getElementById('modal-create-file-path')?.value.trim() || '';
        const content = document.getElementById('modal-create-file-content')?.value ?? '';

        if (!path) {
            this.showToast('File path is required', 'error');
            return;
        }

        try {
            const response = await this.apiFetch(`/api/filesystem/text?bucket=${encodeURIComponent(this.bucketName)}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Liskov-Auth-Token': this.authToken,
                },
                body: JSON.stringify({ path, content }),
            });

            if (!response.ok) {
                throw new Error('Failed to create file');
            }

            window.UI.modals.close();
            this.showToast('File created', 'success');
            await this.loadFiles();
        } catch (error) {
            console.error('[liskov] Error creating file:', error);
            this.showToast(error.message || 'Failed to create file', 'error');
        }
    }

    showCreateFolderModal() {
        if (!window.UI?.modals) {
            return;
        }

        window.UI.modals.show({
            title: 'Create folder',
            content: `
                <div class="lfs-modal-stack">
                    <div class="lfs-modal-field">
                        <label for="modal-create-folder-path">Folder path</label>
                        <input id="modal-create-folder-path" type="text" value="${this.escapeAttribute(`${this.pathPrefix || ''}newfolder/`)}">
                    </div>
                </div>
            `,
            actions: [
                {
                    label: 'Create',
                    type: 'primary',
                    onClick: () => {
                        void this.createFolderFromModal();
                    },
                },
                {
                    label: 'Cancel',
                    type: 'secondary',
                    onClick: () => window.UI.modals.close(),
                },
            ],
        });
    }

    async createFolderFromModal() {
        const path = this.normalizePrefix(document.getElementById('modal-create-folder-path')?.value.trim() || '');
        if (!path) {
            this.showToast('Folder path is required', 'error');
            return;
        }

        try {
            const response = await this.apiFetch(`/api/filesystem/text?bucket=${encodeURIComponent(this.bucketName)}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Liskov-Auth-Token': this.authToken,
                },
                body: JSON.stringify({ path: `${path}.folder`, content: '' }),
            });

            if (!response.ok) {
                throw new Error('Failed to create folder');
            }

            window.UI.modals.close();
            this.showToast('Folder created', 'success');
            await this.loadFiles();
        } catch (error) {
            console.error('[liskov] Error creating folder:', error);
            this.showToast(error.message || 'Failed to create folder', 'error');
        }
    }

    async downloadSelected() {
        if (this.selectedFiles.size === 0) {
            this.showToast('No files selected', 'error');
            return;
        }

        for (const path of this.selectedFiles) {
            await this.downloadFile(path);
        }
    }

    async deleteSelected() {
        if (this.selectedFiles.size === 0) {
            this.showToast('No files selected', 'error');
            return;
        }

        if (!window.confirm(`Delete ${this.selectedFiles.size} selected file(s)?`)) {
            return;
        }

        const paths = [...this.selectedFiles];
        let deleted = 0;
        for (const path of paths) {
            const success = await this.deleteFile(path, { skipConfirm: true, suppressReload: true });
            if (success) {
                deleted += 1;
            }
        }

        await this.loadFiles();
        this.showToast(`Deleted ${deleted} file${deleted === 1 ? '' : 's'}`, deleted ? 'success' : 'warning');
    }

    async readErrorPayload(response) {
        const contentType = response.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
            try {
                const payload = await response.json();
                return payload.error || payload.message || JSON.stringify(payload);
            } catch (error) {
                return null;
            }
        }

        try {
            return await response.text();
        } catch (error) {
            return null;
        }
    }

    async readTextResponse(response) {
        const contentType = response.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
            return await response.json();
        }

        return await response.text();
    }

    async apiFetch(path, options = {}) {
        const normalizedPath = path.startsWith('/') ? path : `/${path}`;
        let lastError = null;

        for (const candidateBase of this.apiBaseCandidates) {
            const url = `${candidateBase}${normalizedPath}`;

            try {
                const response = await fetch(url, options);
                if (this.shouldRetryAgainstDirectApi(candidateBase, response)) {
                    lastError = new Error(`Proxy rejected ${normalizedPath} with ${response.status}`);
                    continue;
                }

                this.setBaseUrl(candidateBase);
                return response;
            } catch (error) {
                lastError = error;
            }
        }

        throw lastError || new Error(`Request failed for ${normalizedPath}`);
    }

    shouldRetryAgainstDirectApi(candidateBase, response) {
        return candidateBase === window.location.origin && response.status === 405;
    }

    setBaseUrl(nextBaseUrl) {
        if (!nextBaseUrl || this.baseUrl === nextBaseUrl) {
            return;
        }

        this.baseUrl = nextBaseUrl;
        this.updateSummary();
    }

    showToast(message, type = 'info') {
        if (window.UI?.toasts?.show) {
            window.UI.toasts.show(message, type);
            return;
        }

        console.log(`[${type.toUpperCase()}] ${message}`);
    }

    getParentPrefix(prefix) {
        const trimmed = this.normalizePrefix(prefix).replace(/\/$/, '');
        if (!trimmed) {
            return '';
        }

        const parts = trimmed.split('/');
        parts.pop();
        return parts.length ? `${parts.join('/')}/` : '';
    }

    normalizePrefix(prefix) {
        const trimmed = String(prefix || '').trim().replace(/\\/g, '/').replace(/^\/+/, '');
        if (!trimmed) {
            return '';
        }

        return trimmed.endsWith('/') ? trimmed : `${trimmed}/`;
    }

    getFileName(path) {
        const parts = path.split('/');
        return parts[parts.length - 1] || path;
    }

    isTextLikePath(path) {
        const extension = path.includes('.') ? `.${path.split('.').pop().toLowerCase()}` : '';
        if (!extension) {
            const fileName = this.getFileName(path);
            return ['Dockerfile', 'LICENSE', 'README'].includes(fileName);
        }

        return [
            '.txt', '.md', '.json', '.js', '.mjs', '.cjs', '.ts', '.tsx', '.jsx',
            '.css', '.html', '.htm', '.xml', '.yml', '.yaml', '.csv', '.log',
            '.cs', '.csproj', '.sln', '.config', '.env', '.ps1', '.sh', '.sql', '.py',
        ].includes(extension);
    }

    formatBytes(bytes) {
        if (!bytes) {
            return '0 B';
        }

        const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), sizes.length - 1);
        const value = bytes / Math.pow(1024, index);
        return `${Math.round(value * 100) / 100} ${sizes[index]}`;
    }

    escapeHtml(value) {
        return String(value ?? '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    escapeAttribute(value) {
        return this.escapeHtml(value);
    }
}

new LiskovApp();
