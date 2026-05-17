(function(window) {
    'use strict';

    const UI = window.UI || {};

    if (!UI.presets || typeof UI.presets.register !== 'function') {
        return;
    }

    function classes() {
        return Array.from(arguments).filter(Boolean).join(' ');
    }

    function icon(name) {
        return {
            tag: 'i',
            className: name,
        };
    }

    function statusBadge(label, statusClass) {
        return {
            tag: 'span',
            className: classes('status-badge', statusClass),
            text: label,
        };
    }

    function patternCard(_number, title, description, body) {
        const bodyChildren = Array.isArray(body) ? body : [body];

        return {
            tag: 'div',
            className: 'card mb-lg',
            children: [
                { tag: 'h3', className: 'mb-xs', text: title },
                {
                    tag: 'p',
                    className: 'text-secondary mb-md',
                    text: description,
                },
                ...bodyChildren,
            ],
        };
    }

    function frame(children, options = {}) {
        return {
            tag: 'div',
            className: classes('bg-tertiary', options.className),
            style: {
                border: '1px solid var(--border-color)',
                padding: options.padding || 'var(--space-md)',
                minHeight: options.minHeight,
                height: options.height,
                position: options.position,
                overflow: options.overflow,
            },
            children: Array.isArray(children) ? children : [children],
        };
    }

    function paddedCard(title, subtitle) {
        return {
            tag: 'div',
            className: 'card',
            children: [
                title ? { tag: 'div', className: 'card-title', text: title } : null,
                subtitle ? { tag: 'div', className: 'card-subtitle', text: subtitle } : null,
            ],
        };
    }

    function statCard(value, label) {
        return {
            tag: 'div',
            className: 'card text-center',
            children: [
                {
                    tag: 'span',
                    className: 'stat-value',
                    text: value,
                },
                {
                    tag: 'p',
                    className: 'text-muted mb-xs mt-sm',
                    text: label,
                },
            ],
        };
    }

    function tableCell(tagName, value) {
        if (value && typeof value === 'object' && value.tag === tagName) {
            return value;
        }

        if (value && typeof value === 'object' && !Array.isArray(value) && !('tag' in value)) {
            return {
                tag: tagName,
                ...value,
            };
        }

        if (Array.isArray(value)) {
            return {
                tag: tagName,
                children: value,
            };
        }

        if (value && typeof value === 'object') {
            return {
                tag: tagName,
                children: [value],
            };
        }

        return {
            tag: tagName,
            text: value === undefined || value === null ? '' : String(value),
        };
    }

    function tableNode(headers, rows) {
        return {
            tag: 'div',
            className: 'table-container',
            children: [
                {
                    tag: 'table',
                    className: 'data-table',
                    children: [
                        {
                            tag: 'thead',
                            children: [
                                {
                                    tag: 'tr',
                                    children: headers.map((header) => tableCell('th', header)),
                                },
                            ],
                        },
                        {
                            tag: 'tbody',
                            children: rows.map((row) => ({
                                tag: 'tr',
                                children: row.map((cell) => tableCell('td', cell)),
                            })),
                        },
                    ],
                },
            ],
        };
    }

    function labelField(label, control) {
        return {
            tag: 'div',
            className: 'grid gap-sm',
            children: [
                {
                    tag: 'label',
                    className: 'field-label',
                    text: label,
                },
                control,
            ],
        };
    }

    function sidebarLayout(sidebarChildren, contentChildren, options = {}) {
        return {
            tag: 'div',
            className: 'layout workspace',
            style: {
                height: options.height || '100%',
            },
            children: [
                {
                    tag: 'div',
                    className: 'sidebar',
                    children: [
                        {
                            tag: 'div',
                            className: 'sidebar-scroll',
                            children: sidebarChildren,
                        },
                    ],
                },
                {
                    tag: 'div',
                    className: classes('content', options.contentClassName),
                    style: options.contentStyle,
                    children: contentChildren,
                },
            ],
        };
    }

    function sidebarItem(iconClass, text, active) {
        return {
            tag: 'div',
            className: classes('sidebar-item', active ? 'active' : ''),
            children: [
                icon(iconClass),
                {
                    tag: 'span',
                    text,
                },
            ],
        };
    }

    function buildStructurePage() {
        return UI.app({
            title: 'Page Structure',
            subtitle: 'Shared shell patterns expressed as preset data instead of page-local HTML fragments.',
            children: [
                patternCard(1, 'Header Bar', 'Framework header with brand/title on the left and actions on the right.', frame({
                    tag: 'div',
                    className: 'header',
                    style: {
                        marginBottom: '0',
                    },
                    children: [
                        {
                            tag: 'h1',
                            children: [
                                icon('ti ti-layout-navbar'),
                                {
                                    tag: 'span',
                                    text: 'Header Example',
                                },
                            ],
                        },
                        {
                            tag: 'div',
                            className: 'grid-row gap-sm',
                            children: [
                                statusBadge('Live', 'status-enabled'),
                                UI.button({ label: 'Open', variant: 'secondary' }),
                            ],
                        },
                    ],
                }, { padding: '0' })),
                patternCard(2, 'Container Fill', 'The app shell uses grid rows so header, tabs, and content stay stable.', frame({
                    tag: 'div',
                    style: {
                        display: 'grid',
                        gridTemplateRows: 'auto auto 1fr',
                        minHeight: '220px',
                    },
                    children: [
                        {
                            tag: 'div',
                            className: 'header',
                            style: {
                                marginBottom: '0',
                            },
                            children: [
                                {
                                    tag: 'h1',
                                    children: [
                                        icon('ti ti-box'),
                                        { tag: 'span', text: 'Container Demo' },
                                    ],
                                },
                                { tag: 'span' },
                            ],
                        },
                        {
                            tag: 'div',
                            className: 'tabs',
                            children: [
                                { tag: 'button', className: 'tab active', text: 'Home' },
                                { tag: 'button', className: 'tab', text: 'Analytics' },
                                { tag: 'button', className: 'tab', text: 'Users' },
                            ],
                        },
                        {
                            tag: 'div',
                            className: 'p-md bg-primary',
                            children: [
                                { tag: 'p', text: 'Scrollable content area fills the remaining row.' },
                                { tag: 'p', className: 'text-muted', text: 'The shell owns the chrome and the scroll split.' },
                            ],
                        },
                    ],
                })),
                patternCard(3, 'Page Container', 'Document pages stay centered inside the shared page container.', frame({
                    tag: 'div',
                    className: 'page-container',
                    style: {
                        border: '2px dashed var(--color-primary)',
                    },
                    children: [
                        { tag: 'h3', text: 'Centered Content Area' },
                        { tag: 'p', className: 'text-secondary', text: 'Use the page container for docs and longer read-only pages.' },
                    ],
                })),
                patternCard(4, 'Single Column Layout', 'Use the single layout when the page does not need sidebar navigation.', frame({
                    tag: 'div',
                    className: 'layout single',
                    style: {
                        height: '220px',
                    },
                    children: [
                        {
                            tag: 'div',
                            className: 'content',
                            children: [
                                { tag: 'h4', text: 'Full Width Content' },
                                { tag: 'p', className: 'text-secondary', text: 'No sidebar. Just one scrollable content rail.' },
                                {
                                    tag: 'div',
                                    className: 'grid-2 gap-md mt-md',
                                    children: [
                                        statCard('1,234', 'Users'),
                                        statCard('567', 'Orders'),
                                    ],
                                },
                            ],
                        },
                    ],
                })),
                patternCard(5, 'Sidebar Content Layout', 'The common app pattern: fixed sidebar, scrollable content.', frame(sidebarLayout([
                    { tag: 'div', className: 'sidebar-header', text: 'Navigation' },
                    sidebarItem('ti ti-home', 'Dashboard', true),
                    sidebarItem('ti ti-users', 'Team Members'),
                    sidebarItem('ti ti-settings', 'Settings'),
                    sidebarItem('ti ti-chart-bar', 'Reports'),
                    sidebarItem('ti ti-mail', 'Messages'),
                ], [
                    { tag: 'h3', text: 'Dashboard' },
                    { tag: 'p', className: 'text-secondary', text: 'Sidebar stays fixed while content can hold the full page body.' },
                    UI.alert({
                        tone: 'info',
                        message: 'On mobile the sidebar collapses off-screen and the content stays primary.',
                    }),
                ], {
                    height: '300px',
                }), { padding: '0', height: '300px' })),
                patternCard(6, 'Tabs Navigation', 'Tabs separate major modes. The active tab stays obvious.', {
                    tag: 'div',
                    className: 'tabs',
                    children: [
                        { tag: 'button', className: 'tab active', children: [icon('ti ti-home'), ' Overview'] },
                        { tag: 'button', className: 'tab', children: [icon('ti ti-database'), ' Data'] },
                        { tag: 'button', className: 'tab', children: [icon('ti ti-chart-pie'), ' Charts'] },
                        { tag: 'button', className: 'tab', children: [icon('ti ti-bell'), ' Notifications'] },
                        { tag: 'button', className: 'tab', children: [icon('ti ti-adjustments'), ' Config'] },
                    ],
                }),
                patternCard(7, 'Section Show And Hide', 'The shell can keep inactive sections in the DOM and only show the active one.', frame([
                    {
                        tag: 'div',
                        className: 'section active',
                        children: [
                            { tag: 'p', children: [icon('ti ti-eye'), ' This section is active and visible.'] },
                        ],
                    },
                    {
                        tag: 'div',
                        className: 'section',
                        children: [
                            { tag: 'p', text: 'This section stays hidden until selected.' },
                        ],
                    },
                    {
                        tag: 'p',
                        className: 'text-muted mt-md',
                        text: 'Hidden sections stay structured but do not take layout space.',
                    },
                ])),
                patternCard(8, 'Scrollbar Styling', 'Scrollable regions inherit the shared scrollbar treatment.', {
                    tag: 'div',
                    style: {
                        height: '120px',
                        overflowY: 'scroll',
                        border: '1px solid var(--border-color)',
                        padding: 'var(--space-md)',
                    },
                    children: Array.from({ length: 10 }, (_, index) => ({
                        tag: 'p',
                        text: `Line ${index + 1} - shared scrollbar demo`,
                    })),
                }),
            ],
        });
    }

    function buildGridsPage() {
        return UI.app({
            title: 'Grid System',
            subtitle: 'Core layout classes shown through preset data so the shell owns the pattern library.',
            children: [
                patternCard(9, 'Grid 2', 'Two equal columns for paired content.', {
                    tag: 'div',
                    className: 'grid-2 gap-md',
                    children: [
                        paddedCard('Left Column', 'Paired details'),
                        paddedCard('Right Column', 'Paired details'),
                    ],
                }),
                patternCard(10, 'Grid 3', 'Three-column layout for summary content.', {
                    tag: 'div',
                    className: 'grid-3 gap-md',
                    children: [
                        paddedCard('Queue', '18 open items'),
                        paddedCard('Deploys', '4 running'),
                        paddedCard('Alerts', '2 active'),
                    ],
                }),
                patternCard(11, 'Grid 4', 'Four stat cards for dense KPI rows.', {
                    tag: 'div',
                    className: 'grid-4 gap-md',
                    children: [
                        statCard('2,847', 'Total Users'),
                        statCard('99.9%', 'Uptime'),
                        statCard('$12.4K', 'Revenue'),
                        statCard('143ms', 'Avg Response'),
                    ],
                }),
                patternCard(12, 'Grid Auto', 'Auto-fit cards create responsive rows without per-page CSS.', {
                    tag: 'div',
                    className: 'grid-auto gap-md',
                    children: [
                        paddedCard('One', 'auto-fit'),
                        paddedCard('Two', 'auto-fit'),
                        paddedCard('Three', 'auto-fit'),
                        paddedCard('Four', 'auto-fit'),
                    ],
                }),
                patternCard(13, 'Grid Center', 'Centered empty states use the shared grid-center helper.', frame({
                    tag: 'div',
                    className: 'grid-center',
                    style: {
                        minHeight: '180px',
                    },
                    children: [
                        {
                            tag: 'div',
                            className: 'text-center',
                            children: [
                                icon('ti ti-target'),
                                { tag: 'h4', className: 'mt-md mb-sm', text: 'Centered Content' },
                                { tag: 'p', className: 'text-muted', text: 'Use this for empty states and focused callouts.' },
                            ],
                        },
                    ],
                })),
                patternCard(14, 'Grid Between', 'Shared split row for label/value or title/action pairs.', {
                    tag: 'div',
                    className: 'grid gap-sm',
                    children: [
                        { tag: 'div', className: 'grid-between p-sm bg-tertiary', children: [{ tag: 'span', text: 'Current Theme' }, statusBadge('Active', 'status-success')] },
                        { tag: 'div', className: 'grid-between p-sm bg-tertiary', children: [{ tag: 'span', text: 'Review Queue' }, statusBadge('12', 'status-warning')] },
                    ],
                }),
                patternCard(15, 'Grid Column', 'Vertical stacking can still stay inside the shared grid vocabulary.', {
                    tag: 'div',
                    className: 'grid-column gap-sm',
                    children: [
                        UI.alert({ tone: 'info', message: 'Top item' }),
                        UI.alert({ tone: 'success', message: 'Middle item' }),
                        UI.alert({ tone: 'warning', message: 'Bottom item' }),
                    ],
                }),
                patternCard(16, 'Grid Row', 'Inline action rows stay on the shared grid helpers too.', {
                    tag: 'div',
                    className: 'grid-row gap-sm',
                    children: [
                        UI.button({ label: 'Approve', variant: 'primary' }),
                        UI.button({ label: 'Hold', variant: 'secondary' }),
                        UI.button({ label: 'Delete', variant: 'danger' }),
                    ],
                }),
                patternCard(17, 'Cards Grid', 'Cards grids are just a semantic class over shared CSS grid behavior.', {
                    tag: 'div',
                    className: 'cards-grid',
                    children: [
                        paddedCard('Project Alpha', 'Web application'),
                        paddedCard('Project Beta', 'Mobile app'),
                        paddedCard('Project Gamma', 'API service'),
                        paddedCard('Project Delta', 'Data pipeline'),
                    ],
                }),
                patternCard(18, 'Nested Grid', 'Grid helpers can compose without local layout systems.', {
                    tag: 'div',
                    className: 'grid-2 gap-md',
                    children: [
                        {
                            tag: 'div',
                            className: 'grid gap-sm',
                            children: [
                                paddedCard('Lane A', 'Work in progress'),
                                paddedCard('Lane B', 'Needs review'),
                            ],
                        },
                        {
                            tag: 'div',
                            className: 'grid gap-sm',
                            children: [
                                paddedCard('Lane C', 'Ready'),
                                paddedCard('Lane D', 'Blocked'),
                            ],
                        },
                    ],
                }),
                patternCard(19, 'Responsive Rule', 'The same grid helpers collapse on mobile without custom page CSS.', UI.alert({
                    tone: 'info',
                    title: 'Shared responsive behavior',
                    message: 'Grid classes collapse through the framework CSS, not through per-page media queries.',
                })),
            ],
        });
    }

    function buildTypographyPage() {
        return UI.app({
            title: 'Typography',
            subtitle: 'Type roles and utility classes shown as framework-owned specimens.',
            children: [
                patternCard(20, 'Heading Scale', 'All heading levels stay available for semantic structure.', frame({
                    tag: 'div',
                    children: [
                        { tag: 'h1', text: 'h1 - Page Title' },
                        { tag: 'h2', text: 'h2 - Section Heading' },
                        { tag: 'h3', text: 'h3 - Subsection' },
                        { tag: 'h4', text: 'h4 - Group Label' },
                        { tag: 'h5', text: 'h5 - Small Heading' },
                        { tag: 'h6', text: 'h6 - Tiny Heading' },
                    ],
                })),
                patternCard(21, 'Body Text', 'Default paragraph, secondary text, and muted text.', {
                    tag: 'div',
                    children: [
                        { tag: 'p', text: 'This is a standard paragraph with the shared body rhythm.' },
                        { tag: 'p', className: 'text-secondary', text: 'Secondary text handles lower-priority explanation.' },
                        { tag: 'p', className: 'text-muted', text: 'Muted text is reserved for support copy and metadata.' },
                    ],
                }),
                patternCard(22, 'Font Size Scale', 'Token-backed size samples.', {
                    tag: 'div',
                    className: 'grid gap-sm',
                    children: [
                        { tag: 'div', className: 'grid-between p-sm bg-tertiary', children: [{ tag: 'span', style: { fontSize: 'var(--text-xs)' }, text: '.text-xs - 11px' }, { tag: 'code', text: '--text-xs' }] },
                        { tag: 'div', className: 'grid-between p-sm bg-tertiary', children: [{ tag: 'span', style: { fontSize: 'var(--text-sm)' }, text: '.text-sm - 13px' }, { tag: 'code', text: '--text-sm' }] },
                        { tag: 'div', className: 'grid-between p-sm bg-tertiary', children: [{ tag: 'span', style: { fontSize: 'var(--text-base)' }, text: '.text-base - 14px' }, { tag: 'code', text: '--text-base' }] },
                        { tag: 'div', className: 'grid-between p-sm bg-tertiary', children: [{ tag: 'span', style: { fontSize: 'var(--text-md)' }, text: '.text-md - 16px' }, { tag: 'code', text: '--text-md' }] },
                        { tag: 'div', className: 'grid-between p-sm bg-tertiary', children: [{ tag: 'span', style: { fontSize: 'var(--text-lg)' }, text: '.text-lg - 18px' }, { tag: 'code', text: '--text-lg' }] },
                        { tag: 'div', className: 'grid-between p-sm bg-tertiary', children: [{ tag: 'span', style: { fontSize: 'var(--text-xl)' }, text: '.text-xl - 20px' }, { tag: 'code', text: '--text-xl' }] },
                        { tag: 'div', className: 'grid-between p-sm bg-tertiary', children: [{ tag: 'span', style: { fontSize: 'var(--text-2xl)' }, text: '.text-2xl - 24px' }, { tag: 'code', text: '--text-2xl' }] },
                        { tag: 'div', className: 'grid-between p-sm bg-tertiary', children: [{ tag: 'span', style: { fontSize: 'var(--text-3xl)' }, text: '.text-3xl - 36px' }, { tag: 'code', text: '--text-3xl' }] },
                    ],
                }),
                patternCard(23, 'Code And Pre Blocks', 'Inline code and multi-line code blocks stay standard.', {
                    tag: 'div',
                    children: [
                        {
                            tag: 'p',
                            className: 'mb-md',
                            children: [
                                'Use ',
                                { tag: 'code', text: 'UI.createShell(...)' },
                                ' to initialize the shell after loading.',
                            ],
                        },
                        {
                            tag: 'pre',
                            children: [
                                {
                                    tag: 'code',
                                    text: [
                                        'const shell = UI.createShell({',
                                        "  tabsContainerId: 'tabs-container',",
                                        "  contentContainerId: 'content-container',",
                                        '  sitemap: sitemapData',
                                        '});',
                                        'await shell.init();',
                                    ].join('\n'),
                                },
                            ],
                        },
                    ],
                }),
                patternCard(24, 'Text Color Utilities', 'Semantic text color classes are part of the shared contract.', {
                    tag: 'div',
                    className: 'grid gap-sm',
                    children: [
                        { tag: 'p', className: 'text-primary p-sm bg-tertiary', children: [{ tag: 'code', text: '.text-primary' }, ' - Primary text color'] },
                        { tag: 'p', className: 'text-secondary p-sm bg-tertiary', children: [{ tag: 'code', text: '.text-secondary' }, ' - Secondary text'] },
                        { tag: 'p', className: 'text-muted p-sm bg-tertiary', children: [{ tag: 'code', text: '.text-muted' }, ' - Muted text'] },
                        { tag: 'p', className: 'text-success p-sm bg-tertiary', children: [{ tag: 'code', text: '.text-success' }, ' - Success text'] },
                        { tag: 'p', className: 'text-danger p-sm bg-tertiary', children: [{ tag: 'code', text: '.text-danger' }, ' - Danger text'] },
                        { tag: 'p', className: 'text-warning p-sm bg-tertiary', children: [{ tag: 'code', text: '.text-warning' }, ' - Warning text'] },
                        { tag: 'p', className: 'text-info p-sm bg-tertiary', children: [{ tag: 'code', text: '.text-info' }, ' - Info text'] },
                    ],
                }),
                patternCard(25, 'Background Color Utilities', 'Background helpers stay semantic too.', {
                    tag: 'div',
                    className: 'grid gap-sm',
                    children: [
                        { tag: 'div', className: 'bg-primary p-sm', style: { border: '1px solid var(--border-color)' }, children: [{ tag: 'code', text: '.bg-primary' }] },
                        { tag: 'div', className: 'bg-secondary p-sm', children: [{ tag: 'code', text: '.bg-secondary' }] },
                        { tag: 'div', className: 'bg-tertiary p-sm', children: [{ tag: 'code', text: '.bg-tertiary' }] },
                        { tag: 'div', className: 'bg-success p-sm', children: [{ tag: 'code', text: '.bg-success' }] },
                        { tag: 'div', className: 'bg-danger p-sm', children: [{ tag: 'code', text: '.bg-danger' }] },
                        { tag: 'div', className: 'bg-warning p-sm', children: [{ tag: 'code', text: '.bg-warning' }] },
                        { tag: 'div', className: 'bg-info p-sm', children: [{ tag: 'code', text: '.bg-info' }] },
                    ],
                }),
                patternCard(26, 'Text Alignment', 'Alignment helpers stay available for edge cases.', {
                    tag: 'div',
                    className: 'grid gap-sm',
                    children: [
                        { tag: 'div', className: 'text-left bg-tertiary p-sm', children: [{ tag: 'code', text: '.text-left' }, ' - Left aligned'] },
                        { tag: 'div', className: 'text-center bg-tertiary p-sm', children: [{ tag: 'code', text: '.text-center' }, ' - Center aligned'] },
                        { tag: 'div', className: 'text-right bg-tertiary p-sm', children: [{ tag: 'code', text: '.text-right' }, ' - Right aligned'] },
                    ],
                }),
                patternCard(27, 'Links', 'Links stay readable and themed through shared CSS.', {
                    tag: 'p',
                    children: [
                        'Here is a ',
                        {
                            tag: 'a',
                            attrs: { href: '#' },
                            text: 'standard link',
                        },
                        ' inside a paragraph.',
                    ],
                }),
            ],
        });
    }

    function buildButtonsPage() {
        return UI.app({
            title: 'Buttons',
            subtitle: 'Every shared button variant mounted from preset data.',
            children: [
                patternCard(28, 'Primary Button', 'Default action button.', {
                    tag: 'div',
                    className: 'grid-row gap-md',
                    children: [
                        UI.button({ label: 'Default Button', variant: 'primary' }),
                        UI.button({ label: 'Explicit .btn-primary', variant: 'primary' }),
                        UI.button({ label: 'With Icon', variant: 'primary', icon: 'ti ti-plus' }),
                    ],
                }),
                patternCard(29, 'Secondary Button', 'Support action button.', {
                    tag: 'div',
                    className: 'grid-row gap-md',
                    children: [
                        UI.button({ label: 'Secondary', variant: 'secondary' }),
                        UI.button({ label: 'Cancel', variant: 'secondary', icon: 'ti ti-x' }),
                    ],
                }),
                patternCard(30, 'Danger Button', 'Destructive action button.', {
                    tag: 'div',
                    className: 'grid-row gap-md',
                    children: [
                        UI.button({ label: 'Delete', variant: 'danger' }),
                        UI.button({ label: 'Remove Item', variant: 'danger', icon: 'ti ti-trash' }),
                    ],
                }),
                patternCard(31, 'Cancel Button', 'Back or neutral cancel flow.', {
                    tag: 'div',
                    className: 'grid-row gap-md',
                    children: [
                        UI.button({ label: 'Cancel', variant: 'cancel' }),
                        UI.button({ label: 'Go Back', variant: 'cancel', icon: 'ti ti-arrow-left' }),
                    ],
                }),
                patternCard(32, 'Link Button', 'Inline button that behaves like text action.', {
                    tag: 'div',
                    className: 'grid-row gap-md',
                    children: [
                        UI.button({ label: 'Learn more', variant: 'link' }),
                        UI.button({ label: 'View details', variant: 'link' }),
                        UI.button({ label: 'Skip this step', variant: 'link' }),
                    ],
                }),
                patternCard(33, 'Disabled Buttons', 'Disabled state is shared too.', {
                    tag: 'div',
                    className: 'grid-row gap-md',
                    children: [
                        UI.button({ label: 'Disabled Primary', variant: 'primary', attrs: { disabled: true } }),
                        UI.button({ label: 'Disabled Secondary', variant: 'secondary', attrs: { disabled: true } }),
                        UI.button({ label: 'Disabled Danger', variant: 'danger', attrs: { disabled: true } }),
                    ],
                }),
                patternCard(34, 'Common Button Groups', 'Typical button combinations used in modals and forms.', {
                    tag: 'div',
                    className: 'grid gap-md',
                    children: [
                        {
                            tag: 'div',
                            children: [
                                { tag: 'h4', className: 'mb-sm', text: 'Dialog Footer' },
                                {
                                    tag: 'div',
                                    className: 'grid-row gap-md',
                                    children: [
                                        UI.button({ label: 'Save Changes', variant: 'primary', icon: 'ti ti-check' }),
                                        UI.button({ label: 'Cancel', variant: 'cancel' }),
                                    ],
                                },
                            ],
                        },
                        {
                            tag: 'div',
                            children: [
                                { tag: 'h4', className: 'mb-sm', text: 'Confirm Delete' },
                                {
                                    tag: 'div',
                                    className: 'grid-row gap-md',
                                    children: [
                                        UI.button({ label: 'Delete Forever', variant: 'danger', icon: 'ti ti-trash' }),
                                        UI.button({ label: 'Keep It', variant: 'secondary' }),
                                    ],
                                },
                            ],
                        },
                    ],
                }),
                patternCard(35, 'Full Width Buttons On Mobile', 'Stack buttons in a narrow column and let the shared CSS handle mobile width.', {
                    tag: 'div',
                    className: 'grid gap-sm',
                    style: {
                        maxWidth: '360px',
                    },
                    children: [
                        UI.button({ label: 'Sign In', variant: 'primary', icon: 'ti ti-login' }),
                        UI.button({ label: 'Create Account', variant: 'secondary', icon: 'ti ti-user-plus' }),
                        UI.button({ label: 'Forgot Password?', variant: 'link' }),
                    ],
                }),
            ],
        });
    }

    function buildFormsPage() {
        return UI.app({
            title: 'Forms',
            subtitle: 'Shared form controls expressed through preset data.',
            children: [
                patternCard(36, 'Text Inputs', 'Standard text-like inputs.', {
                    tag: 'div',
                    className: 'grid-2 gap-md',
                    children: [
                        labelField('Text', { tag: 'input', attrs: { type: 'text', placeholder: 'Plain text' } }),
                        labelField('Email', { tag: 'input', attrs: { type: 'email', placeholder: 'name@example.com' } }),
                        labelField('Password', { tag: 'input', attrs: { type: 'password', value: 'hunter2' } }),
                        labelField('Number', { tag: 'input', attrs: { type: 'number', value: '42' } }),
                    ],
                }),
                patternCard(37, 'Search And Contact', 'Search, phone, and URL fields use the same framework styling.', {
                    tag: 'div',
                    className: 'grid-3 gap-md',
                    children: [
                        labelField('Search', { tag: 'input', attrs: { type: 'search', placeholder: 'Search records' } }),
                        labelField('Phone', { tag: 'input', attrs: { type: 'tel', placeholder: '(555) 010-2020' } }),
                        labelField('URL', { tag: 'input', attrs: { type: 'url', placeholder: 'https://example.com' } }),
                    ],
                }),
                patternCard(38, 'Textarea', 'Longer text fields use the same tokens.', labelField('Description', {
                    tag: 'textarea',
                    attrs: {
                        rows: '4',
                    },
                    text: 'Describe the deployment notes here.',
                })),
                patternCard(39, 'Select', 'Select menus are part of the same form system.', labelField('Environment', {
                    tag: 'select',
                    children: [
                        { tag: 'option', text: 'Production' },
                        { tag: 'option', text: 'Staging' },
                        { tag: 'option', text: 'Development' },
                    ],
                })),
                patternCard(40, 'Checkboxes', 'Boolean settings stay shared too.', {
                    tag: 'div',
                    className: 'grid gap-sm',
                    children: [
                        {
                            tag: 'label',
                            className: 'grid-row gap-sm',
                            children: [
                                { tag: 'input', attrs: { type: 'checkbox', checked: true } },
                                ' Send deployment email',
                            ],
                        },
                        {
                            tag: 'label',
                            className: 'grid-row gap-sm',
                            children: [
                                { tag: 'input', attrs: { type: 'checkbox' } },
                                ' Pause alerts during rollout',
                            ],
                        },
                    ],
                }),
                patternCard(41, 'Radio Inputs', 'Single-choice groups use shared radios.', {
                    tag: 'div',
                    className: 'grid gap-sm',
                    children: [
                        {
                            tag: 'label',
                            className: 'grid-row gap-sm',
                            children: [
                                { tag: 'input', attrs: { type: 'radio', name: 'rollout-speed', checked: true } },
                                ' Safe rollout',
                            ],
                        },
                        {
                            tag: 'label',
                            className: 'grid-row gap-sm',
                            children: [
                                { tag: 'input', attrs: { type: 'radio', name: 'rollout-speed' } },
                                ' Fast rollout',
                            ],
                        },
                    ],
                }),
                patternCard(42, 'Range And Disabled States', 'Range inputs and disabled controls stay first-class.', {
                    tag: 'div',
                    className: 'grid gap-md',
                    children: [
                        labelField('Traffic Shift', { tag: 'input', attrs: { type: 'range', min: '0', max: '100', value: '60' } }),
                        {
                            tag: 'div',
                            className: 'grid-3 gap-md',
                            children: [
                                labelField('Disabled Text', { tag: 'input', attrs: { type: 'text', value: 'Locked', disabled: true } }),
                                labelField('Disabled Notes', { tag: 'textarea', attrs: { rows: '2', disabled: true }, text: 'Disabled text area' }),
                                labelField('Disabled Select', {
                                    tag: 'select',
                                    attrs: { disabled: true },
                                    children: [{ tag: 'option', text: 'Locked Option' }],
                                }),
                            ],
                        },
                    ],
                }),
            ],
        });
    }

    function buildCardsPage() {
        return UI.app({
            title: 'Cards',
            subtitle: 'Card patterns stay in shared primitives and data, not local markup fragments.',
            children: [
                patternCard(43, 'Basic Cards', 'Simple cards for summary content.', {
                    tag: 'div',
                    className: 'grid-2 gap-md',
                    children: [
                        paddedCard('Card Title', 'Basic card with default styling.'),
                        paddedCard('Content Card', 'Same shared treatment, still data-driven.'),
                    ],
                }),
                patternCard(44, 'Cards With Photo Area', 'Photo-style cards still use the same card shell.', {
                    tag: 'div',
                    className: 'grid-3 gap-md',
                    children: [
                        {
                            tag: 'div',
                            className: 'card',
                            style: {
                                padding: '0',
                                overflow: 'hidden',
                            },
                            children: [
                                { tag: 'div', className: 'card-photo placeholder', children: [icon('ti ti-photo')] },
                                { tag: 'div', className: 'card-header', children: [{ tag: 'div', className: 'card-title', children: [icon('ti ti-building'), ' Headquarters'] }, { tag: 'div', className: 'card-subtitle', text: 'San Francisco, CA' }] },
                            ],
                        },
                        {
                            tag: 'div',
                            className: 'card',
                            style: {
                                padding: '0',
                                overflow: 'hidden',
                            },
                            children: [
                                { tag: 'div', className: 'card-photo placeholder', children: [icon('ti ti-map-pin')] },
                                { tag: 'div', className: 'card-header', children: [{ tag: 'div', className: 'card-title', children: [icon('ti ti-building'), ' East Office'] }, { tag: 'div', className: 'card-subtitle', text: 'New York, NY' }] },
                            ],
                        },
                        {
                            tag: 'div',
                            className: 'card',
                            style: {
                                padding: '0',
                                overflow: 'hidden',
                            },
                            children: [
                                { tag: 'div', className: 'card-photo placeholder', children: [icon('ti ti-world')] },
                                { tag: 'div', className: 'card-header', children: [{ tag: 'div', className: 'card-title', children: [icon('ti ti-building'), ' EU Hub'] }, { tag: 'div', className: 'card-subtitle', text: 'London, UK' }] },
                            ],
                        },
                    ],
                }),
                patternCard(45, 'Stat Cards', 'KPI cards use stat-value for the shared large-number treatment.', {
                    tag: 'div',
                    className: 'grid-4 gap-md',
                    children: [
                        statCard('2,847', 'Total Users'),
                        statCard('99.9%', 'Uptime'),
                        statCard('$12.4K', 'Revenue'),
                        statCard('143ms', 'Avg Response'),
                    ],
                }),
                patternCard(46, 'Cards Grid', 'Card grids can still represent dynamic collections without local HTML.', {
                    tag: 'div',
                    className: 'cards-grid',
                    children: [
                        paddedCard('Project Alpha', 'Web application'),
                        paddedCard('Project Beta', 'Mobile app'),
                        paddedCard('Project Gamma', 'API service'),
                        paddedCard('Project Delta', 'Data pipeline'),
                    ],
                }),
                patternCard(47, 'Card Composition', 'Cards can mix status, buttons, and nested structure.', {
                    tag: 'div',
                    className: 'grid-2 gap-md',
                    children: [
                        {
                            tag: 'div',
                            className: 'card',
                            children: [
                                {
                                    tag: 'div',
                                    className: 'grid-between mb-md',
                                    children: [
                                        { tag: 'h4', className: 'mb-xs', text: 'Server Status' },
                                        statusBadge('Healthy', 'status-success'),
                                    ],
                                },
                                {
                                    tag: 'div',
                                    className: 'grid gap-sm',
                                    children: [
                                        { tag: 'div', className: 'grid-between', children: [{ tag: 'span', className: 'text-secondary', text: 'API Gateway' }, { tag: 'span', className: 'text-success', children: [icon('ti ti-circle-check'), ' Online'] }] },
                                        { tag: 'div', className: 'grid-between', children: [{ tag: 'span', className: 'text-secondary', text: 'Database' }, { tag: 'span', className: 'text-success', children: [icon('ti ti-circle-check'), ' Online'] }] },
                                        { tag: 'div', className: 'grid-between', children: [{ tag: 'span', className: 'text-secondary', text: 'Cache Layer' }, { tag: 'span', className: 'text-warning', children: [icon('ti ti-alert-triangle'), ' Degraded'] }] },
                                    ],
                                },
                            ],
                        },
                        {
                            tag: 'div',
                            className: 'card',
                            children: [
                                { tag: 'h4', className: 'mb-md', text: 'Quick Actions' },
                                {
                                    tag: 'div',
                                    className: 'grid gap-sm',
                                    children: [
                                        UI.button({ label: 'Restart Services', variant: 'primary', icon: 'ti ti-refresh' }),
                                        UI.button({ label: 'Export Logs', variant: 'secondary', icon: 'ti ti-download' }),
                                        UI.button({ label: 'Shutdown', variant: 'danger', icon: 'ti ti-power' }),
                                    ],
                                },
                            ],
                        },
                    ],
                }),
            ],
        });
    }

    function buildTablesPage() {
        return UI.app({
            title: 'Tables',
            subtitle: 'Tables remain a shared primitive even when they hold richer cell content.',
            children: [
                patternCard(48, 'Basic Data Table', 'Basic data table with headers, rows, and status badges.', tableNode([
                    'Name',
                    'Role',
                    'Department',
                    'Status',
                ], [
                    ['Alice Johnson', 'Lead Engineer', 'Platform', statusBadge('Active', 'status-success')],
                    ['Bob Martinez', 'Product Manager', 'Growth', statusBadge('Active', 'status-success')],
                    ['Carol Chen', 'Designer', 'UX', statusBadge('On Leave', 'status-warning')],
                    ['David Kim', 'DevOps Engineer', 'Infrastructure', statusBadge('Active', 'status-success')],
                    ['Elena Petrov', 'Data Scientist', 'Analytics', statusBadge('Onboarding', 'status-info')],
                ])),
                patternCard(49, 'Sortable Headers', 'Sortable columns get the shared sortable class.', tableNode([
                    { className: 'sortable', children: ['ID ', icon('ti ti-arrows-sort')] },
                    { className: 'sortable', children: ['Service ', icon('ti ti-arrows-sort')] },
                    { className: 'sortable', children: ['Requests ', icon('ti ti-arrows-sort')] },
                    { className: 'sortable', children: ['Latency ', icon('ti ti-arrows-sort')] },
                    'Actions',
                ], [
                    ['SVC-001', 'Auth API', '12,847', '45ms', { children: [UI.button({ label: 'View', variant: 'link' })] }],
                    ['SVC-002', 'User Service', '8,392', '62ms', { children: [UI.button({ label: 'View', variant: 'link' })] }],
                    ['SVC-003', 'Payment Gateway', '3,156', '189ms', { children: [UI.button({ label: 'View', variant: 'link' })] }],
                    ['SVC-004', 'Notification Hub', '24,591', '28ms', { children: [UI.button({ label: 'View', variant: 'link' })] }],
                ])),
                patternCard(50, 'State Table', 'Rows can carry semantic state badges.', tableNode([
                    'Order ID',
                    'Customer',
                    'Amount',
                    'Status',
                ], [
                    ['ORD-1001', 'Acme Corp', '$2,450.00', statusBadge('Completed', 'status-completed')],
                    ['ORD-1002', 'Globex Inc', '$890.50', statusBadge('Processing', 'status-warning')],
                    ['ORD-1003', 'Initech LLC', '$1,200.00', statusBadge('Shipped', 'status-enabled')],
                    ['ORD-1004', 'Umbrella Co', '$3,100.00', statusBadge('Pending', 'status-created')],
                ])),
                patternCard(51, 'Rich Cell Content', 'Cells can still mix icons, badges, and links.', tableNode([
                    'Deployment',
                    'Environment',
                    'Status',
                    'Last Deploy',
                    'Actions',
                ], [
                    [[icon('ti ti-git-branch'), ' main'], statusBadge('Production', 'status-enabled'), { children: [{ tag: 'span', className: 'text-success', children: [icon('ti ti-circle-check'), ' Healthy'] }] }, { className: 'text-muted', text: '2 hours ago' }, { children: [{ tag: 'div', className: 'grid-row gap-sm', children: [UI.button({ label: 'Logs', variant: 'link' }), UI.button({ label: 'Rollback', variant: 'link' })] }] }],
                    [[icon('ti ti-git-branch'), ' staging'], statusBadge('Staging', 'status-warning'), { children: [{ tag: 'span', className: 'text-warning', children: [icon('ti ti-alert-triangle'), ' Degraded'] }] }, { className: 'text-muted', text: '45 min ago' }, { children: [{ tag: 'div', className: 'grid-row gap-sm', children: [UI.button({ label: 'Logs', variant: 'link' }), UI.button({ label: 'Rollback', variant: 'link' })] }] }],
                    [[icon('ti ti-git-branch'), ' develop'], statusBadge('Development', 'status-info'), { children: [{ tag: 'span', className: 'text-danger', children: [icon('ti ti-circle-x'), ' Down'] }] }, { className: 'text-muted', text: '10 min ago' }, { children: [{ tag: 'div', className: 'grid-row gap-sm', children: [UI.button({ label: 'Logs', variant: 'link' }), UI.button({ label: 'Redeploy', variant: 'link' })] }] }],
                ])),
                patternCard('51R', 'Footer Rail', 'Pinned workspace rails stay framework-owned, including the denser sites-style pager variant.', frame([
                    UI.scrollViewport({
                        reserve: '96px',
                        className: 'p-md',
                        style: {
                            height: '280px',
                            overflowY: 'auto',
                        },
                        children: [
                            tableNode([
                                'Site',
                                'Host',
                                'Status',
                                'Updated',
                            ], [
                                ['sites', 'sites.mullmania.com', statusBadge('Live', 'status-enabled'), '2 min ago'],
                                ['lorem-ipzom', 'lorem-ipzom.mullmania.com', statusBadge('Live', 'status-enabled'), '14 min ago'],
                                ['ui', 'ui.mullmania.com', statusBadge('Shared', 'status-info'), '22 min ago'],
                                ['frontdoor', 'frontdoor.mullmania.com', statusBadge('Review', 'status-warning'), '48 min ago'],
                                ['launchpad', 'launchpad.mullmania.com', statusBadge('Draft', 'status-created'), '1 hr ago'],
                                ['reel', 'reel.mullmania.com', statusBadge('Queued', 'status-planning'), '2 hr ago'],
                                ['proof', 'proof.mullmania.com', statusBadge('Live', 'status-enabled'), '4 hr ago'],
                                ['catalog', 'catalog.mullmania.com', statusBadge('Live', 'status-enabled'), '5 hr ago'],
                            ]),
                        ],
                    }),
                    UI.surfaceRail({
                        placement: 'footer',
                        style: {
                            position: 'absolute',
                            '--surface-rail-inline': '12px',
                            '--surface-rail-block': '12px',
                        },
                        children: [
                            UI.pager({
                                className: 'pager--rail',
                                summary: 'Showing 1-8 of 42 sites',
                                status: 'Page 1 of 6',
                                page: 1,
                                pageCount: 6,
                                before: {
                                    tag: 'label',
                                    className: 'pager__size',
                                    children: [
                                        { tag: 'span', className: 'pager__size-label', text: 'Rows' },
                                        {
                                            tag: 'select',
                                            className: 'pager__select',
                                            attrs: { 'aria-label': 'Rows per page' },
                                            children: [
                                                { tag: 'option', attrs: { selected: true }, text: '50' },
                                                { tag: 'option', text: '100' },
                                            ],
                                        },
                                    ],
                                },
                            }),
                        ],
                    }),
                ], {
                    minHeight: '320px',
                    padding: '0',
                    position: 'relative',
                    overflow: 'hidden',
                })),
            ],
        });
    }

    function buildAlertsPage() {
        return UI.app({
            title: 'Alerts And Badges',
            subtitle: 'Status, alert, and loading patterns rendered through shared preset data.',
            children: [
                patternCard(52, 'Alert Banners', 'Shared success, error, warning, and info alert banners.', {
                    tag: 'div',
                    className: 'grid gap-sm',
                    children: [
                        UI.alert({ tone: 'success', title: 'Success:', message: 'Your changes have been saved. Deployment will begin shortly.' }),
                        UI.alert({ tone: 'error', title: 'Error:', message: 'Failed to connect to the database. Check the connection string and try again.' }),
                        UI.alert({ tone: 'warning', title: 'Warning:', message: 'Your API key expires in 3 days. Rotate it to avoid service disruption.' }),
                        UI.alert({ tone: 'info', title: 'Info:', message: 'A new version is available. Update to v2.4.1 for the latest features.' }),
                    ],
                }),
                patternCard(53, 'Status Badges', 'Semantic badge classes stay part of the shared language.', {
                    tag: 'div',
                    className: 'grid-2 gap-lg',
                    children: [
                        {
                            tag: 'div',
                            className: 'grid gap-sm',
                            children: [
                                { tag: 'div', className: 'grid-between', children: [{ tag: 'code', text: '.status-success / .status-completed' }, statusBadge('Success', 'status-success')] },
                                { tag: 'div', className: 'grid-between', children: [{ tag: 'code', text: '.status-error / .status-failed' }, statusBadge('Error', 'status-error')] },
                                { tag: 'div', className: 'grid-between', children: [{ tag: 'code', text: '.status-warning / .status-executing' }, statusBadge('Warning', 'status-warning')] },
                                { tag: 'div', className: 'grid-between', children: [{ tag: 'code', text: '.status-enabled' }, statusBadge('Enabled', 'status-enabled')] },
                                { tag: 'div', className: 'grid-between', children: [{ tag: 'code', text: '.status-cancelled' }, statusBadge('Cancelled', 'status-cancelled')] },
                            ],
                        },
                        {
                            tag: 'div',
                            className: 'grid gap-sm',
                            children: [
                                { tag: 'div', className: 'grid-between p-sm bg-tertiary', children: [{ tag: 'span', text: 'Build #1284' }, statusBadge('Completed', 'status-completed')] },
                                { tag: 'div', className: 'grid-between p-sm bg-tertiary', children: [{ tag: 'span', text: 'Build #1285' }, statusBadge('Failed', 'status-failed')] },
                                { tag: 'div', className: 'grid-between p-sm bg-tertiary', children: [{ tag: 'span', text: 'Build #1286' }, statusBadge('Executing', 'status-executing')] },
                                { tag: 'div', className: 'grid-between p-sm bg-tertiary', children: [{ tag: 'span', text: 'Build #1287' }, statusBadge('Planning', 'status-planning')] },
                                { tag: 'div', className: 'grid-between p-sm bg-tertiary', children: [{ tag: 'span', text: 'Build #1288' }, statusBadge('Created', 'status-created')] },
                            ],
                        },
                    ],
                }),
                patternCard(54, 'Badges In Context', 'Badges can sit inline, inside lists, and inside sidebars.', {
                    tag: 'div',
                    className: 'grid gap-md',
                    children: [
                        {
                            tag: 'p',
                            children: [
                                'The service is currently ',
                                statusBadge('Enabled', 'status-enabled'),
                                ' and running in ',
                                statusBadge('Staging', 'status-warning'),
                                ' mode.',
                            ],
                        },
                        {
                            tag: 'div',
                            style: {
                                maxWidth: '250px',
                                border: '1px solid var(--border-color)',
                            },
                            children: [
                                {
                                    tag: 'div',
                                    className: 'sidebar-item active',
                                    children: [
                                        icon('ti ti-inbox'),
                                        {
                                            tag: 'div',
                                            className: 'grid-between',
                                            children: [
                                                { tag: 'span', text: 'Inbox' },
                                                statusBadge('12', 'status-success'),
                                            ],
                                        },
                                    ],
                                },
                                {
                                    tag: 'div',
                                    className: 'sidebar-item',
                                    children: [
                                        icon('ti ti-send'),
                                        {
                                            tag: 'div',
                                            className: 'grid-between',
                                            children: [
                                                { tag: 'span', text: 'Sent' },
                                                statusBadge('3', 'status-info'),
                                            ],
                                        },
                                    ],
                                },
                                {
                                    tag: 'div',
                                    className: 'sidebar-item',
                                    children: [
                                        icon('ti ti-archive'),
                                        {
                                            tag: 'div',
                                            className: 'grid-between',
                                            children: [
                                                { tag: 'span', text: 'Archive' },
                                                statusBadge('0', 'status-cancelled'),
                                            ],
                                        },
                                    ],
                                },
                            ],
                        },
                    ],
                }),
                patternCard(55, 'Loading States', 'Spinner and pulse states come from the shared CSS.', {
                    tag: 'div',
                    className: 'grid-row gap-lg',
                    style: {
                        alignItems: 'center',
                    },
                    children: [
                        {
                            tag: 'div',
                            children: [
                                { tag: 'p', className: 'text-muted mb-sm', text: '.spinner' },
                                { tag: 'div', className: 'spinner' },
                            ],
                        },
                        {
                            tag: 'div',
                            children: [
                                { tag: 'p', className: 'text-muted mb-sm', text: '.pulse' },
                                { tag: 'div', className: 'pulse', children: [icon('ti ti-loader')] },
                            ],
                        },
                    ],
                }),
            ],
        });
    }

    function buildModalsPage() {
        return UI.app({
            title: 'Modals And Toasts',
            subtitle: 'Interactive shared overlays without page-local HTML fragments.',
            children: [
                patternCard(56, 'Modal Structure', 'Static modal preview using the shared modal classes.', frame([
                    {
                        tag: 'div',
                        style: {
                            background: 'rgba(0,0,0,0.5)',
                            position: 'absolute',
                            inset: '0',
                            display: 'grid',
                            placeItems: 'center',
                        },
                        children: [
                            {
                                tag: 'div',
                                className: 'modal',
                                style: {
                                    position: 'relative',
                                    maxWidth: '500px',
                                },
                                children: [
                                    {
                                        tag: 'div',
                                        className: 'modal-header',
                                        children: [
                                            { tag: 'span', className: 'modal-title', text: 'Confirm Action' },
                                            { tag: 'button', className: 'modal-close', children: [icon('ti ti-x')] },
                                        ],
                                    },
                                    { tag: 'p', className: 'mb-lg', text: 'Are you sure you want to deploy this build to production?' },
                                    {
                                        tag: 'div',
                                        className: 'grid-row gap-md',
                                        children: [
                                            UI.button({ label: 'Deploy', variant: 'primary', icon: 'ti ti-rocket' }),
                                            UI.button({ label: 'Cancel', variant: 'cancel' }),
                                        ],
                                    },
                                ],
                            },
                        ],
                    },
                ], {
                    minHeight: '300px',
                    position: 'relative',
                })),
                patternCard(57, 'Interactive Modals', 'Shared modal actions can still be wired declaratively.', {
                    tag: 'div',
                    className: 'grid-row gap-md',
                    children: [
                        UI.button({
                            label: 'Confirm Modal',
                            variant: 'primary',
                            icon: 'ti ti-check',
                            attrs: { id: 'demo-modal-confirm' },
                            action: {
                                type: 'modal',
                                title: 'Confirm Deployment',
                                content: '<p>Deploy build <strong>#1284</strong> to production?</p><p class="text-muted">This will replace the current live version.</p>',
                            },
                        }),
                        UI.button({
                            label: 'Info Modal',
                            variant: 'secondary',
                            icon: 'ti ti-info-circle',
                            attrs: { id: 'demo-modal-info' },
                            action: {
                                type: 'modal',
                                title: 'System Information',
                                content: '<p>Framework: UI Everywhere v3.3.0</p><p>Theme: Active</p><p>Components loaded: shared runtime primitives</p>',
                            },
                        }),
                        UI.button({
                            label: 'Danger Modal',
                            variant: 'danger',
                            icon: 'ti ti-alert-triangle',
                            attrs: { id: 'demo-modal-danger' },
                            action: {
                                type: 'modal',
                                title: 'Delete Environment',
                                content: '<div class="alert alert-error"><i class="ti ti-alert-triangle"></i><span>This will permanently delete the staging environment and all associated data.</span></div>',
                            },
                        }),
                    ],
                }),
                patternCard(58, 'Toast Notifications', 'Toasts can also stay declarative.', {
                    tag: 'div',
                    className: 'grid gap-md',
                    children: [
                        {
                            tag: 'div',
                            children: [
                                { tag: 'h4', className: 'mb-sm', text: 'Toast Types' },
                                {
                                    tag: 'div',
                                    className: 'grid-row gap-md mb-lg',
                                    children: [
                                        UI.button({ label: 'Success', variant: 'primary', icon: 'ti ti-circle-check', attrs: { id: 'demo-toast-success' }, action: { type: 'toast', toastType: 'success', message: 'Changes saved successfully!' } }),
                                        UI.button({ label: 'Error', variant: 'danger', icon: 'ti ti-circle-x', attrs: { id: 'demo-toast-error' }, action: { type: 'toast', toastType: 'error', message: 'Failed to save changes.' } }),
                                        UI.button({ label: 'Warning', variant: 'cancel', icon: 'ti ti-alert-triangle', attrs: { id: 'demo-toast-warning' }, action: { type: 'toast', toastType: 'warning', message: 'API rate limit approaching.' } }),
                                        UI.button({ label: 'Info', variant: 'secondary', icon: 'ti ti-info-circle', attrs: { id: 'demo-toast-info' }, action: { type: 'toast', toastType: 'info', message: 'New version available.' } }),
                                    ],
                                },
                            ],
                        },
                        {
                            tag: 'div',
                            children: [
                                { tag: 'h4', className: 'mb-sm', text: 'Toast Positions' },
                                {
                                    tag: 'div',
                                    className: 'grid-3 gap-sm',
                                    children: [
                                        UI.button({ label: 'Top Left', variant: 'secondary', attrs: { id: 'demo-toast-tl' }, action: { type: 'toast', toastType: 'info', message: 'Toast at top-left', position: 'top-left' } }),
                                        UI.button({ label: 'Top Center', variant: 'secondary', attrs: { id: 'demo-toast-tc' }, action: { type: 'toast', toastType: 'info', message: 'Toast at top-center', position: 'top-center' } }),
                                        UI.button({ label: 'Top Right', variant: 'secondary', attrs: { id: 'demo-toast-tr' }, action: { type: 'toast', toastType: 'info', message: 'Toast at top-right', position: 'top-right' } }),
                                        UI.button({ label: 'Bottom Left', variant: 'secondary', attrs: { id: 'demo-toast-bl' }, action: { type: 'toast', toastType: 'info', message: 'Toast at bottom-left', position: 'bottom-left' } }),
                                        UI.button({ label: 'Bottom Center', variant: 'secondary', attrs: { id: 'demo-toast-bc' }, action: { type: 'toast', toastType: 'info', message: 'Toast at bottom-center', position: 'bottom-center' } }),
                                        UI.button({ label: 'Bottom Right', variant: 'secondary', attrs: { id: 'demo-toast-br' }, action: { type: 'toast', toastType: 'info', message: 'Toast at bottom-right', position: 'bottom-right' } }),
                                    ],
                                },
                            ],
                        },
                    ],
                }),
                patternCard(59, 'Modal Sizes', 'Shared size conventions can be shown with simple blocks.', {
                    tag: 'div',
                    className: 'grid-3 gap-md',
                    children: [
                        { tag: 'div', className: 'bg-tertiary p-md text-center', style: { border: '2px dashed var(--border-color)' }, children: [{ tag: 'p', className: 'text-muted mb-sm', text: 'Small' }, { tag: 'p', className: 'text-muted', text: 'max-width: 400px' }] },
                        { tag: 'div', className: 'bg-tertiary p-md text-center', style: { border: '2px dashed var(--color-primary)' }, children: [{ tag: 'p', className: 'mb-sm', text: 'Medium (default)' }, { tag: 'p', className: 'text-muted', text: 'max-width: 600px' }] },
                        { tag: 'div', className: 'bg-tertiary p-md text-center', style: { border: '2px dashed var(--border-color)' }, children: [{ tag: 'p', className: 'text-muted mb-sm', text: 'Large' }, { tag: 'p', className: 'text-muted', text: 'max-width: 800px' }] },
                    ],
                }),
            ],
        });
    }

    function buildDetailPage() {
        return UI.app({
            title: 'Detail',
            subtitle: 'Detail shells and nested detail layouts rendered from shared preset data.',
            children: [
                patternCard(60, 'Detail Header And Body', 'Header and body layout for item views.', {
                    tag: 'div',
                    style: {
                        border: '1px solid var(--border-color)',
                    },
                    children: [
                        {
                            tag: 'div',
                            className: 'detail-header',
                            children: [
                                { tag: 'h2', text: 'Project Alpha - Release v2.4.1' },
                                { tag: 'p', className: 'detail-subtitle', text: 'Deployed by Alice Johnson on April 12, 2026 at 14:30 UTC' },
                            ],
                        },
                        {
                            tag: 'div',
                            className: 'detail-body',
                            children: [
                                { tag: 'h3', text: 'Release Notes' },
                                { tag: 'p', text: 'This release improves the data pipeline and fixes a critical auth race condition.' },
                                { tag: 'h3', text: 'Changes' },
                                {
                                    tag: 'div',
                                    className: 'grid gap-sm',
                                    children: [
                                        { tag: 'div', className: 'grid-between p-sm bg-tertiary', children: [{ tag: 'span', children: [icon('ti ti-bug'), ' Fix token refresh race condition'] }, statusBadge('Merged', 'status-completed')] },
                                        { tag: 'div', className: 'grid-between p-sm bg-tertiary', children: [{ tag: 'span', children: [icon('ti ti-rocket'), ' Optimize batch processing throughput'] }, statusBadge('Merged', 'status-completed')] },
                                        { tag: 'div', className: 'grid-between p-sm bg-tertiary', children: [{ tag: 'span', children: [icon('ti ti-database'), ' Add connection pooling for PostgreSQL'] }, statusBadge('Merged', 'status-completed')] },
                                    ],
                                },
                            ],
                        },
                    ],
                }),
                patternCard(61, 'Detail With Stats', 'Detail header, stat row, and event table.', {
                    tag: 'div',
                    style: {
                        border: '1px solid var(--border-color)',
                    },
                    children: [
                        {
                            tag: 'div',
                            className: 'detail-header',
                            children: [
                                { tag: 'h2', children: [icon('ti ti-server'), ' API Gateway'] },
                                { tag: 'p', className: 'detail-subtitle', text: 'Primary load balancer serving production traffic across 3 regions' },
                            ],
                        },
                        {
                            tag: 'div',
                            className: 'detail-body',
                            children: [
                                { tag: 'div', className: 'grid-4 gap-md mb-lg', children: [statCard('99.97%', 'Uptime (30d)'), statCard('2.1M', 'Requests Today'), statCard('47ms', 'P50 Latency'), statCard('0', 'Active Errors')] },
                                { tag: 'h3', text: 'Recent Events' },
                                tableNode(['Time', 'Event', 'Severity'], [
                                    [{ className: 'text-muted', text: '14:30' }, 'Auto-scaled to 8 instances', statusBadge('Info', 'status-info')],
                                    [{ className: 'text-muted', text: '12:15' }, 'SSL certificate renewed', statusBadge('Success', 'status-success')],
                                    [{ className: 'text-muted', text: '09:00' }, 'Daily health check passed', statusBadge('Success', 'status-success')],
                                ]),
                            ],
                        },
                    ],
                }),
                patternCard(62, 'Detail In Sidebar Layout', 'Nested sidebar/detail view is still a shared shell pattern.', frame(sidebarLayout([
                    { tag: 'div', className: 'sidebar-header', text: 'Environments' },
                    sidebarItem('ti ti-server', 'Production', true),
                    sidebarItem('ti ti-server', 'Staging'),
                    sidebarItem('ti ti-server', 'Development'),
                ], [
                    {
                        tag: 'div',
                        className: 'detail-header',
                        children: [
                            { tag: 'h2', text: 'Production' },
                            { tag: 'p', className: 'detail-subtitle', text: 'us-east-1 | 4 instances | Auto-scaling enabled' },
                        ],
                    },
                    {
                        tag: 'div',
                        className: 'detail-body',
                        children: [
                            UI.alert({
                                tone: 'success',
                                message: 'All systems operational. Last deployment: 2 hours ago.',
                            }),
                            {
                                tag: 'div',
                                className: 'grid-2 gap-md',
                                children: [
                                    statCard('4', 'Instances'),
                                    statCard('23%', 'CPU Usage'),
                                ],
                            },
                        ],
                    },
                ], {
                    height: '350px',
                    contentStyle: {
                        padding: '0',
                    },
                }), {
                    padding: '0',
                    height: '350px',
                })),
            ],
        });
    }

    function buildSpacingPage() {
        return UI.app({
            title: 'Spacing And Utilities',
            subtitle: 'Spacing utilities and breakpoints shown as shared preset data.',
            children: [
                patternCard(63, 'Padding Utilities', 'Padding classes apply consistent spacing tokens.', {
                    tag: 'div',
                    className: 'grid gap-sm',
                    children: [
                        { tag: 'div', className: 'p-xs bg-tertiary', text: '.p-xs' },
                        { tag: 'div', className: 'p-sm bg-tertiary', text: '.p-sm' },
                        { tag: 'div', className: 'p-md bg-tertiary', text: '.p-md' },
                        { tag: 'div', className: 'p-lg bg-tertiary', text: '.p-lg' },
                        { tag: 'div', className: 'p-xl bg-tertiary', text: '.p-xl' },
                    ],
                }),
                patternCard(64, 'Margin Utilities', 'Spacing between sections should use shared margin helpers.', {
                    tag: 'div',
                    children: [
                        { tag: 'div', className: 'mb-xs p-sm bg-tertiary', text: '.mb-xs example' },
                        { tag: 'div', className: 'mb-sm p-sm bg-tertiary', text: '.mb-sm example' },
                        { tag: 'div', className: 'mb-md p-sm bg-tertiary', text: '.mb-md example' },
                        { tag: 'div', className: 'mb-lg p-sm bg-tertiary', text: '.mb-lg example' },
                    ],
                }),
                patternCard(65, 'Gap Utilities', 'Gap classes keep grid spacing predictable.', {
                    tag: 'div',
                    className: 'grid-3 gap-md',
                    children: [
                        { tag: 'div', className: 'grid gap-xs', children: [{ tag: 'div', className: 'p-sm bg-tertiary', text: 'gap-xs' }, { tag: 'div', className: 'p-sm bg-tertiary', text: 'gap-xs' }] },
                        { tag: 'div', className: 'grid gap-sm', children: [{ tag: 'div', className: 'p-sm bg-tertiary', text: 'gap-sm' }, { tag: 'div', className: 'p-sm bg-tertiary', text: 'gap-sm' }] },
                        { tag: 'div', className: 'grid gap-lg', children: [{ tag: 'div', className: 'p-sm bg-tertiary', text: 'gap-lg' }, { tag: 'div', className: 'p-sm bg-tertiary', text: 'gap-lg' }] },
                    ],
                }),
                patternCard(66, 'Breakpoint Table', 'Breakpoints stay documented through shared data.', tableNode([
                    'Breakpoint',
                    'Range',
                    'Use',
                ], [
                    ['Mobile', '< 768px', 'Single-column layouts and collapsed sidebars'],
                    ['Tablet', '768px - 1023px', 'Two-column layouts and dense cards'],
                    ['Desktop', '>= 1024px', 'Full shell with workspace layout'],
                ])),
                patternCard(67, 'Utility Rule', 'Use the shared utility set instead of page-local spacing rules.', UI.alert({
                    tone: 'info',
                    title: 'Shared rhythm',
                    message: 'If a new page needs custom spacing, add a primitive or a shared utility. Do not tune pixels per page.',
                })),
            ],
        });
    }

    function buildFullPage() {
        return UI.app({
            title: 'Full Pages',
            subtitle: 'Full app compositions mounted from preset data instead of stored HTML.',
            children: [
                patternCard(68, 'Dashboard', 'Stats, alerts, and a data table in one composed page.', {
                    tag: 'div',
                    style: {
                        border: '1px solid var(--border-color)',
                    },
                    children: [
                        {
                            tag: 'div',
                            className: 'header',
                            style: {
                                marginBottom: '0',
                            },
                            children: [
                                {
                                    tag: 'h1',
                                    children: [
                                        icon('ti ti-dashboard'),
                                        { tag: 'span', text: 'Operations Dashboard' },
                                    ],
                                },
                                {
                                    tag: 'div',
                                    className: 'grid-row gap-sm',
                                    children: [
                                        statusBadge('Live', 'status-enabled'),
                                    ],
                                },
                            ],
                        },
                        {
                            tag: 'div',
                            className: 'p-lg',
                            children: [
                                UI.alert({
                                    tone: 'warning',
                                    message: 'Cache layer showing elevated error rates in us-west-2. Investigation ongoing.',
                                    className: 'mb-lg',
                                }),
                                {
                                    tag: 'div',
                                    className: 'grid-4 gap-md mb-lg',
                                    children: [
                                        statCard('12', 'Services'),
                                        statCard('99.8%', 'Availability'),
                                        statCard('847K', 'Requests/hr'),
                                        statCard('3', 'Active Alerts'),
                                    ],
                                },
                                { tag: 'h3', className: 'mb-md', text: 'Service Health' },
                                tableNode(['Service', 'Region', 'Status', 'Latency', 'Error Rate'], [
                                    [[icon('ti ti-lock'), ' Auth API'], 'us-east-1', statusBadge('Healthy', 'status-success'), '23ms', { className: 'text-success', text: '0.01%' }],
                                    [[icon('ti ti-users'), ' User Service'], 'us-east-1', statusBadge('Healthy', 'status-success'), '45ms', { className: 'text-success', text: '0.03%' }],
                                    [[icon('ti ti-database'), ' Cache Layer'], 'us-west-2', statusBadge('Degraded', 'status-warning'), '189ms', { className: 'text-warning', text: '2.4%' }],
                                    [[icon('ti ti-credit-card'), ' Payment API'], 'eu-west-1', statusBadge('Healthy', 'status-success'), '67ms', { className: 'text-success', text: '0.00%' }],
                                ]),
                            ],
                        },
                    ],
                }),
                patternCard(69, 'Settings Page', 'Sidebar plus form is still the shared shell.', frame(sidebarLayout([
                    { tag: 'div', className: 'sidebar-header', text: 'Settings' },
                    sidebarItem('ti ti-user', 'Profile', true),
                    sidebarItem('ti ti-bell', 'Notifications'),
                    sidebarItem('ti ti-shield', 'Security'),
                    sidebarItem('ti ti-plug', 'Integrations'),
                    sidebarItem('ti ti-palette', 'Appearance'),
                ], [
                    {
                        tag: 'div',
                        className: 'detail-header',
                        children: [
                            { tag: 'h2', text: 'Profile Settings' },
                            { tag: 'p', className: 'detail-subtitle', text: 'Manage your personal information and preferences' },
                        ],
                    },
                    {
                        tag: 'div',
                        className: 'detail-body',
                        children: [
                            {
                                tag: 'div',
                                className: 'grid gap-md',
                                style: {
                                    maxWidth: '500px',
                                },
                                children: [
                                    {
                                        tag: 'div',
                                        className: 'grid-2 gap-md',
                                        children: [
                                            labelField('First Name', { tag: 'input', attrs: { type: 'text', value: 'Mike' } }),
                                            labelField('Last Name', { tag: 'input', attrs: { type: 'text', value: 'Smith' } }),
                                        ],
                                    },
                                    labelField('Email', { tag: 'input', attrs: { type: 'email', value: 'mike@example.com' } }),
                                    labelField('Timezone', {
                                        tag: 'select',
                                        children: [
                                            { tag: 'option', text: 'Eastern (UTC-5)' },
                                            { tag: 'option', text: 'Central (UTC-6)' },
                                            { tag: 'option', text: 'Pacific (UTC-8)' },
                                        ],
                                    }),
                                    {
                                        tag: 'label',
                                        className: 'grid-row gap-sm',
                                        children: [
                                            { tag: 'input', attrs: { type: 'checkbox', checked: true } },
                                            ' Show online status',
                                        ],
                                    },
                                    {
                                        tag: 'div',
                                        className: 'grid-row gap-md mt-md',
                                        children: [
                                            UI.button({ label: 'Save', variant: 'primary', icon: 'ti ti-check' }),
                                            UI.button({ label: 'Discard', variant: 'cancel' }),
                                        ],
                                    },
                                ],
                            },
                        ],
                    },
                ], {
                    height: '400px',
                    contentStyle: {
                        padding: '0',
                    },
                }), {
                    padding: '0',
                    height: '400px',
                })),
                patternCard(70, 'Master Detail', 'List on the left, detail on the right.', frame(sidebarLayout([
                    { tag: 'div', className: 'sidebar-header', text: 'Projects' },
                    sidebarItem('ti ti-folder', 'UI Framework', true),
                    sidebarItem('ti ti-folder', 'Auth Service'),
                    sidebarItem('ti ti-folder', 'Data Pipeline'),
                    sidebarItem('ti ti-folder', 'Mobile App'),
                ], [
                    {
                        tag: 'div',
                        className: 'detail-header',
                        children: [
                            { tag: 'h2', text: 'UI Framework' },
                            { tag: 'p', className: 'detail-subtitle', text: 'CSS framework with JS component libraries' },
                        ],
                    },
                    {
                        tag: 'div',
                        className: 'detail-body',
                        children: [
                            { tag: 'div', className: 'grid-3 gap-md mb-lg', children: [statCard('6', 'Themes'), statCard('7', 'JS Modules'), statCard('70+', 'CSS Variables')] },
                            {
                                tag: 'div',
                                className: 'grid-row gap-md',
                                children: [
                                    UI.button({ label: 'Open', variant: 'primary', icon: 'ti ti-external-link' }),
                                    UI.button({ label: 'Settings', variant: 'secondary', icon: 'ti ti-settings' }),
                                ],
                            },
                        ],
                    },
                ], {
                    height: '350px',
                    contentStyle: {
                        padding: '0',
                    },
                }), {
                    padding: '0',
                    height: '350px',
                })),
                patternCard(71, 'Empty State', 'Centered empty state with call to action.', {
                    tag: 'div',
                    className: 'grid-center bg-tertiary',
                    style: {
                        height: '250px',
                        border: '1px solid var(--border-color)',
                    },
                    children: [
                        {
                            tag: 'div',
                            className: 'text-center',
                            children: [
                                icon('ti ti-inbox-off'),
                                { tag: 'h3', className: 'mt-md mb-sm', text: 'No items yet' },
                                { tag: 'p', className: 'text-muted mb-lg', text: 'Create your first project to get started.' },
                                UI.button({ label: 'Create Project', variant: 'primary', icon: 'ti ti-plus' }),
                            ],
                        },
                    ],
                }),
                patternCard(72, 'Error State', 'Centered recovery state with two actions.', {
                    tag: 'div',
                    className: 'grid-center bg-tertiary',
                    style: {
                        height: '250px',
                        border: '1px solid var(--border-color)',
                    },
                    children: [
                        {
                            tag: 'div',
                            className: 'text-center',
                            children: [
                                icon('ti ti-alert-octagon'),
                                { tag: 'h3', className: 'mt-md mb-sm', text: 'Something went wrong' },
                                { tag: 'p', className: 'text-muted mb-lg', text: 'We could not load your data. Please try again.' },
                                {
                                    tag: 'div',
                                    className: 'grid-row gap-md',
                                    style: {
                                        justifyContent: 'center',
                                    },
                                    children: [
                                        UI.button({ label: 'Retry', variant: 'primary', icon: 'ti ti-refresh' }),
                                        UI.button({ label: 'Go Home', variant: 'secondary', icon: 'ti ti-home' }),
                                    ],
                                },
                            ],
                        },
                    ],
                }),
            ],
        });
    }

    function controlButton(id, label, iconName) {
        return {
            tag: 'button',
            className: 'btn-secondary',
            attrs: {
                type: 'button',
                id,
            },
            children: [
                icon(iconName),
                ` ${label}`,
            ],
        };
    }

    function selectField(id, label, options) {
        return labelField(label, {
            tag: 'select',
            attrs: {
                id,
            },
            children: options.map((option) => ({
                tag: 'option',
                attrs: {
                    value: option.value,
                },
                text: option.label,
            })),
        });
    }

    function buildMountedPreset(spec, setup) {
        const host = document.createElement('div');
        UI.mount(host, spec);
        if (typeof setup === 'function') {
            setup(host);
        }
        return host;
    }

    function buildLivePreviewPage() {
        const defaultSitemap = {
            tabs: [
                {
                    id: 'overview',
                    label: 'Overview',
                    icon: 'ti ti-home',
                    contractSource: '/contracts/fixtures/operations-dashboard.json',
                },
                {
                    id: 'components',
                    label: 'Components',
                    icon: 'ti ti-components',
                    layout: 'workspace',
                    sections: [
                        {
                            type: 'list',
                            inlineData: [
                                { id: 'queue', name: 'Quality Queue', icon: 'ti ti-checklist', contractSource: '/contracts/fixtures/quality-queue.json' },
                                { id: 'preview', name: 'Preview Catalog', icon: 'ti ti-device-desktop', contractSource: '/contracts/fixtures/preview-catalog.json' },
                                { id: 'readiness', name: 'Release Readiness', icon: 'ti ti-list-check', componentSource: '/contracts/components/release-readiness.json' },
                            ],
                        },
                    ],
                },
            ],
        };

        return buildMountedPreset(UI.app({
            title: 'Preview',
            icon: 'ti ti-eye',
            subtitle: 'Edit sitemap JSON, keep the last valid render alive, and preview the same app shell under any supported look and mode.',
            children: [
                {
                    tag: 'div',
                    className: 'grid-2 gap-md mb-lg',
                    children: [
                        {
                            tag: 'div',
                            className: 'card',
                            children: [
                                {
                                    tag: 'div',
                                    className: 'grid-between mb-md',
                                    children: [
                                        {
                                            tag: 'h3',
                                            className: 'mb-xs',
                                            children: [
                                                icon('ti ti-code'),
                                                ' sitemap.json',
                                            ],
                                        },
                                        {
                                            tag: 'span',
                                            className: 'status-badge status-info',
                                            attrs: {
                                                id: 'editor-status',
                                            },
                                            text: 'Ready',
                                        },
                                    ],
                                },
                                {
                                    tag: 'div',
                                    className: 'grid gap-md',
                                    children: [
                                        {
                                            tag: 'div',
                                            className: 'row-wrap gap-sm',
                                            children: [
                                                controlButton('preview-format', 'Format', 'ti ti-align-left'),
                                                controlButton('preview-copy-json', 'Copy JSON', 'ti ti-copy'),
                                                controlButton('preview-copy-url', 'Copy URL', 'ti ti-link'),
                                                controlButton('preview-download', 'Download', 'ti ti-download'),
                                                controlButton('preview-load-current', 'Load Current', 'ti ti-refresh'),
                                            ],
                                        },
                                        {
                                            tag: 'div',
                                            className: 'grid-2 gap-md',
                                            children: [
                                                selectField('preview-theme', 'Theme', [
                                                    { value: 'active', label: 'Active' },
                                                    { value: 'walmart', label: 'Walmart' },
                                                    { value: 'mockup', label: 'Mockup' },
                                                ]),
                                                selectField('preview-mode', 'Mode', [
                                                    { value: 'light', label: 'Light' },
                                                    { value: 'dark', label: 'Dark' },
                                                ]),
                                            ],
                                        },
                                        {
                                            tag: 'textarea',
                                            className: 'live-preview-editor',
                                            attrs: {
                                                id: 'sitemap-editor',
                                            },
                                        },
                                    ],
                                },
                            ],
                        },
                        {
                            tag: 'div',
                            className: 'card',
                            children: [
                                {
                                    tag: 'div',
                                    className: 'grid-between mb-md',
                                    children: [
                                        {
                                            tag: 'h3',
                                            className: 'mb-xs',
                                            children: [
                                                icon('ti ti-browser'),
                                                ' Rendered App',
                                            ],
                                        },
                                        {
                                            tag: 'a',
                                            className: 'btn-link',
                                            attrs: {
                                                id: 'preview-open',
                                                href: '/preview.html?theme=active&mode=light',
                                                target: '_blank',
                                                rel: 'noreferrer',
                                            },
                                            children: [
                                                icon('ti ti-external-link'),
                                                ' Open',
                                            ],
                                        },
                                    ],
                                },
                                {
                                    tag: 'div',
                                    className: 'alert alert-error is-hidden mb-md',
                                    attrs: {
                                        id: 'preview-error',
                                    },
                                    children: [
                                        icon('ti ti-alert-circle'),
                                        {
                                            tag: 'span',
                                            attrs: {
                                                id: 'preview-error-text',
                                            },
                                            text: 'Error',
                                        },
                                    ],
                                },
                                {
                                    tag: 'div',
                                    className: 'preview-screen',
                                    children: [
                                        {
                                            tag: 'div',
                                            className: 'preview-screen__frame',
                                            children: [
                                                {
                                                    tag: 'div',
                                                    className: 'preview-screen__chrome',
                                                    children: [
                                                        {
                                                            tag: 'span',
                                                            className: 'preview-screen__chrome-dot',
                                                            attrs: {
                                                                'aria-hidden': 'true',
                                                            },
                                                        },
                                                        {
                                                            tag: 'span',
                                                            className: 'preview-screen__chrome-label',
                                                            attrs: {
                                                                id: 'preview-chrome-label',
                                                            },
                                                            text: 'Preview',
                                                        },
                                                        {
                                                            tag: 'span',
                                                            className: 'preview-screen__read-only',
                                                            children: [
                                                                icon('ti ti-lock'),
                                                                ' Read only',
                                                            ],
                                                        },
                                                    ],
                                                },
                                                {
                                                    tag: 'div',
                                                    className: 'preview-screen__viewport',
                                                    children: [
                                                        {
                                                            tag: 'iframe',
                                                            className: 'preview-screen__media preview-screen__media--iframe',
                                                            attrs: {
                                                                id: 'preview-frame',
                                                                src: '/preview.html?theme=active&mode=light',
                                                                title: 'Live sitemap preview',
                                                                loading: 'lazy',
                                                                referrerpolicy: 'no-referrer',
                                                            },
                                                        },
                                                    ],
                                                },
                                            ],
                                        },
                                    ],
                                },
                            ],
                        },
                    ],
                },
                {
                    tag: 'div',
                    className: 'card',
                    children: [
                        { tag: 'h3', className: 'mb-md', text: 'Supported Shape' },
                        {
                            tag: 'p',
                            className: 'text-secondary mb-md',
                            text: 'Top-level tabs use `sections` for list/detail flows. Legacy `sidebar` arrays are still imported and normalized to `sections` when you paste older JSON.',
                        },
                        tableNode(['Key', 'Type', 'Notes'], [
                            [{ tag: 'code', text: 'tabs' }, 'array', 'Required. Each tab needs `id` and `label`.'],
                            [{ tag: 'code', text: 'layout' }, 'string', 'Defaults to `workspace` when omitted.'],
                            [{ tag: 'code', text: 'sections' }, 'array', 'Preferred list/detail shape.'],
                            [{ tag: 'code', text: 'sidebar' }, 'array', 'Legacy import path. Normalized into `sections` on load.'],
                            [{ tag: 'code', text: 'contractSource' }, 'string', 'Preferred path for JSON-first tabs and list items.'],
                            [{ tag: 'code', text: 'htmlSource' }, 'string', 'Legacy compatibility path for static fragments. Do not use for new work.'],
                        ]),
                    ],
                },
            ],
        }), (root) => {
            const standalonePath = '/tabs/canonical/live-preview/index.html';
            const isStandalonePage = window.location.pathname.endsWith(standalonePath);
            const editor = root.querySelector('#sitemap-editor');
            const status = root.querySelector('#editor-status');
            const errorBox = root.querySelector('#preview-error');
            const errorText = root.querySelector('#preview-error-text');
            const previewFrame = root.querySelector('#preview-frame');
            const previewOpen = root.querySelector('#preview-open');
            const previewChromeLabel = root.querySelector('#preview-chrome-label');
            const themeSelect = root.querySelector('#preview-theme');
            const modeSelect = root.querySelector('#preview-mode');
            let renderTimer = null;
            let lastValidSitemap = null;
            let lastPreviewUrl = '/preview.html?theme=active&mode=light';

            themeSelect.value = document.documentElement.dataset.uiTheme || 'active';
            modeSelect.value = document.documentElement.dataset.uiMode || 'light';

            function setStatus(text, tone) {
                status.textContent = text;
                status.className = `status-badge status-${tone}`;
            }

            function setError(message) {
                errorText.textContent = message;
                errorBox.classList.remove('is-hidden');
            }

            function clearError() {
                errorText.textContent = '';
                errorBox.classList.add('is-hidden');
            }

            function encodeSpec64(value) {
                return btoa(JSON.stringify(value))
                    .replace(/\+/g, '-')
                    .replace(/\//g, '_')
                    .replace(/=+$/g, '');
            }

            function decodeSpec64(value) {
                const normalized = String(value || '').replace(/-/g, '+').replace(/_/g, '/');
                const padded = normalized + '='.repeat((4 - (normalized.length % 4 || 4)) % 4);
                return JSON.parse(atob(padded));
            }

            function normalizeSitemap(rawSitemap) {
                if (!rawSitemap || !Array.isArray(rawSitemap.tabs)) {
                    throw new Error('Sitemap must be a JSON object with a `tabs` array.');
                }

                return {
                    tabs: rawSitemap.tabs.map((tab) => {
                        const normalizedTab = { ...tab };
                        if (!normalizedTab.id || !normalizedTab.label) {
                            throw new Error('Every tab needs `id` and `label`.');
                        }

                        if (!normalizedTab.layout) {
                            normalizedTab.layout = 'workspace';
                        }

                        if (!normalizedTab.sections && Array.isArray(normalizedTab.sidebar)) {
                            normalizedTab.sections = [{
                                type: 'list',
                                inlineData: normalizedTab.sidebar.map((item) => ({
                                    id: item.id,
                                    name: item.name || item.label || item.id,
                                    icon: item.icon || '',
                                    htmlSource: item.htmlSource || null,
                                    contractSource: item.contractSource || null,
                                    preset: item.preset || null,
                                    componentSource: item.componentSource || null,
                                    componentSpec: item.componentSpec || null,
                                })),
                            }];
                        }

                        return normalizedTab;
                    }),
                };
            }

            function validateSitemap(sitemap) {
                sitemap.tabs.forEach((tab) => {
                    if (!['workspace', 'document', 'single', 'tabs'].includes(tab.layout)) {
                        throw new Error(`Tab "${tab.id}" has unsupported layout "${tab.layout}".`);
                    }

                    if (tab.sections) {
                        tab.sections.forEach((section) => {
                            if (!section.type) {
                                throw new Error(`Tab "${tab.id}" has a section without a type.`);
                            }

                            if (section.type === 'list' && section.inlineData && !Array.isArray(section.inlineData)) {
                                throw new Error(`Tab "${tab.id}" list section needs an array of inlineData items.`);
                            }
                        });
                    }
                });
            }

            function buildPreviewUrl(sitemap) {
                const spec64 = encodeSpec64(sitemap);
                const theme = themeSelect.value;
                const mode = modeSelect.value;
                return `/preview.html?theme=${encodeURIComponent(theme)}&mode=${encodeURIComponent(mode)}&spec64=${encodeURIComponent(spec64)}`;
            }

            function applyPreview(url) {
                lastPreviewUrl = url;
                previewFrame.src = url;
                previewOpen.href = url;
                previewChromeLabel.textContent = `${themeSelect.value} / ${modeSelect.value}`;
            }

            function updateHashFromSitemap(sitemap) {
                if (!isStandalonePage) {
                    return;
                }

                const nextUrl = new URL(window.location.href);
                nextUrl.hash = `spec64=${encodeSpec64(sitemap)}`;
                history.replaceState(null, '', nextUrl);
            }

            function scheduleRender() {
                clearTimeout(renderTimer);
                renderTimer = setTimeout(renderNow, 300);
            }

            function renderNow() {
                try {
                    const sitemap = normalizeSitemap(JSON.parse(editor.value));
                    validateSitemap(sitemap);
                    clearError();
                    setStatus('Valid JSON', 'success');
                    lastValidSitemap = sitemap;
                    applyPreview(buildPreviewUrl(sitemap));
                    updateHashFromSitemap(sitemap);
                } catch (error) {
                    setStatus('Needs Fix', 'warning');
                    setError(error.message || 'Could not render preview.');
                    if (lastPreviewUrl) {
                        previewFrame.src = lastPreviewUrl;
                    }
                }
            }

            function loadIntoEditor(sitemap) {
                editor.value = JSON.stringify(normalizeSitemap(sitemap), null, 2);
                renderNow();
            }

            async function copyText(value, successText) {
                await navigator.clipboard.writeText(value);
                setStatus(successText, 'info');
            }

            root.querySelector('#preview-format').addEventListener('click', () => {
                try {
                    const parsed = JSON.parse(editor.value);
                    editor.value = JSON.stringify(parsed, null, 2);
                    renderNow();
                } catch (error) {
                    setStatus('Needs Fix', 'warning');
                    setError(error.message || 'Could not format JSON.');
                }
            });

            root.querySelector('#preview-copy-json').addEventListener('click', async () => {
                await copyText(editor.value, 'JSON Copied');
            });

            root.querySelector('#preview-copy-url').addEventListener('click', async () => {
                if (lastValidSitemap) {
                    updateHashFromSitemap(lastValidSitemap);
                }
                const shareUrl = isStandalonePage
                    ? window.location.href
                    : new URL(previewOpen.href, window.location.origin).toString();
                await copyText(shareUrl, 'URL Copied');
            });

            root.querySelector('#preview-download').addEventListener('click', () => {
                const blob = new Blob([editor.value], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = 'sitemap.json';
                link.click();
                URL.revokeObjectURL(url);
                setStatus('Downloaded', 'info');
            });

            root.querySelector('#preview-load-current').addEventListener('click', async () => {
                const response = await fetch('/sitemap.json');
                const sitemap = await response.json();
                loadIntoEditor(sitemap);
                setStatus('Loaded Current Sitemap', 'info');
            });

            editor.addEventListener('input', scheduleRender);
            themeSelect.addEventListener('change', () => {
                if (lastValidSitemap) {
                    applyPreview(buildPreviewUrl(lastValidSitemap));
                }
            });
            modeSelect.addEventListener('change', () => {
                if (lastValidSitemap) {
                    applyPreview(buildPreviewUrl(lastValidSitemap));
                }
            });

            if (isStandalonePage && window.location.hash.startsWith('#spec64=')) {
                try {
                    loadIntoEditor(decodeSpec64(window.location.hash.slice('#spec64='.length)));
                    setStatus('Loaded Shared URL', 'info');
                    return;
                } catch (error) {
                    editor.value = JSON.stringify(defaultSitemap, null, 2);
                    setStatus('Ready', 'info');
                    setError('Could not load the shared URL. Showing the starter sitemap instead.');
                    renderNow();
                    return;
                }
            }

            editor.value = JSON.stringify(defaultSitemap, null, 2);
            setStatus('Ready', 'info');
            renderNow();
        });
    }

    function buildContractLabPage() {
        const starterDocument = {
            $schema: '/page-contract.schema.json',
            version: 1,
            title: 'Starter Example',
            page: {
                component: 'app',
                title: 'Starter Example',
                subtitle: 'Edit this contract and render it through the shared runtime.',
                sections: [
                    {
                        component: 'section',
                        title: 'Overview',
                        children: [
                            {
                                component: 'grid',
                                columns: 2,
                                children: [
                                    {
                                        component: 'stat',
                                        label: 'Status',
                                        value: 'Ready',
                                        badge: {
                                            label: 'Live',
                                            tone: 'success',
                                        },
                                    },
                                    {
                                        component: 'alert',
                                        tone: 'info',
                                        title: 'Contract-safe',
                                        message: 'Use shared components and safe tags instead of page-local HTML.',
                                    },
                                ],
                            },
                        ],
                    },
                ],
            },
        };

        return buildMountedPreset(UI.app({
            title: 'Build Page',
            icon: 'ti ti-file-code',
            subtitle: 'Edit page JSON on the left and render the same contract-safe surface on the right.',
            children: [
                {
                    tag: 'div',
                    className: 'grid-2 gap-md mb-lg',
                    children: [
                        {
                            tag: 'div',
                            className: 'card',
                            children: [
                                {
                                    tag: 'div',
                                    className: 'grid-between mb-md',
                                    children: [
                                        {
                                            tag: 'h3',
                                            className: 'mb-xs',
                                            children: [
                                                icon('ti ti-code'),
                                                ' page-contract.json',
                                            ],
                                        },
                                        {
                                            tag: 'span',
                                            className: 'status-badge status-info',
                                            attrs: {
                                                id: 'contract-status',
                                            },
                                            text: 'Ready',
                                        },
                                    ],
                                },
                                {
                                    tag: 'div',
                                    className: 'grid gap-md',
                                    children: [
                                        {
                                            tag: 'div',
                                            className: 'row-wrap gap-sm',
                                            children: [
                                                controlButton('contract-format', 'Format', 'ti ti-align-left'),
                                                controlButton('contract-copy-json', 'Copy JSON', 'ti ti-copy'),
                                                controlButton('contract-copy-url', 'Copy URL', 'ti ti-link'),
                                                controlButton('contract-load-example', 'Load Example', 'ti ti-sparkles'),
                                            ],
                                        },
                                        {
                                            tag: 'div',
                                            className: 'grid-2 gap-md',
                                            children: [
                                                {
                                                    tag: 'div',
                                                    children: [
                                                        { tag: 'label', className: 'field-label', attrs: { for: 'contract-fixture' }, text: 'Fixture' },
                                                        {
                                                            tag: 'select',
                                                            attrs: {
                                                                id: 'contract-fixture',
                                                            },
                                                            children: [
                                                                {
                                                                    tag: 'option',
                                                                    attrs: {
                                                                        value: '__example__',
                                                                    },
                                                                    text: 'Starter example',
                                                                },
                                                            ],
                                                        },
                                                    ],
                                                },
                                                selectField('contract-theme', 'Theme', [
                                                    { value: 'active', label: 'Active' },
                                                    { value: 'walmart', label: 'Walmart' },
                                                    { value: 'mockup', label: 'Mockup' },
                                                ]),
                                            ],
                                        },
                                        {
                                            tag: 'div',
                                            className: 'grid-2 gap-md',
                                            children: [
                                                selectField('contract-mode', 'Mode', [
                                                    { value: 'light', label: 'Light' },
                                                    { value: 'dark', label: 'Dark' },
                                                ]),
                                                {
                                                    tag: 'div',
                                                    children: [
                                                        { tag: 'label', className: 'field-label', attrs: { for: 'contract-renderer' }, text: 'Renderer' },
                                                        {
                                                            tag: 'input',
                                                            attrs: {
                                                                id: 'contract-renderer',
                                                                type: 'text',
                                                                value: '/render.html',
                                                                readonly: true,
                                                            },
                                                        },
                                                    ],
                                                },
                                            ],
                                        },
                                        {
                                            tag: 'textarea',
                                            className: 'live-preview-editor',
                                            attrs: {
                                                id: 'contract-editor',
                                            },
                                        },
                                    ],
                                },
                            ],
                        },
                        {
                            tag: 'div',
                            className: 'card',
                            children: [
                                {
                                    tag: 'div',
                                    className: 'grid-between mb-md',
                                    children: [
                                        {
                                            tag: 'h3',
                                            className: 'mb-xs',
                                            children: [
                                                icon('ti ti-browser'),
                                                ' Rendered Page',
                                            ],
                                        },
                                        {
                                            tag: 'a',
                                            className: 'btn-link',
                                            attrs: {
                                                id: 'contract-open',
                                                href: '/render.html?theme=active&mode=light',
                                                target: '_blank',
                                                rel: 'noreferrer',
                                            },
                                            children: [
                                                icon('ti ti-external-link'),
                                                ' Open',
                                            ],
                                        },
                                    ],
                                },
                                {
                                    tag: 'div',
                                    className: 'alert alert-error is-hidden mb-md',
                                    attrs: {
                                        id: 'contract-error',
                                    },
                                    children: [
                                        icon('ti ti-alert-circle'),
                                        {
                                            tag: 'span',
                                            attrs: {
                                                id: 'contract-error-text',
                                            },
                                            text: 'Error',
                                        },
                                    ],
                                },
                                {
                                    tag: 'div',
                                    className: 'preview-screen',
                                    children: [
                                        {
                                            tag: 'div',
                                            className: 'preview-screen__frame',
                                            children: [
                                                {
                                                    tag: 'div',
                                                    className: 'preview-screen__chrome',
                                                    children: [
                                                        {
                                                            tag: 'span',
                                                            className: 'preview-screen__chrome-dot',
                                                            attrs: {
                                                                'aria-hidden': 'true',
                                                            },
                                                        },
                                                        {
                                                            tag: 'span',
                                                            className: 'preview-screen__chrome-label',
                                                            attrs: {
                                                                id: 'contract-preview-label',
                                                            },
                                                            text: 'active / light',
                                                        },
                                                        {
                                                            tag: 'span',
                                                            className: 'preview-screen__read-only',
                                                            children: [
                                                                icon('ti ti-lock'),
                                                                ' Read only',
                                                            ],
                                                        },
                                                    ],
                                                },
                                                {
                                                    tag: 'div',
                                                    className: 'preview-screen__viewport',
                                                    children: [
                                                        {
                                                            tag: 'iframe',
                                                            className: 'preview-screen__media preview-screen__media--iframe preview-screen__media--read-only',
                                                            attrs: {
                                                                id: 'contract-preview-frame',
                                                                src: '/render.html?theme=active&mode=light',
                                                                title: 'Page contract preview',
                                                                loading: 'lazy',
                                                                tabindex: '-1',
                                                                referrerpolicy: 'no-referrer',
                                                            },
                                                        },
                                                    ],
                                                },
                                            ],
                                        },
                                    ],
                                },
                            ],
                        },
                    ],
                },
                {
                    tag: 'div',
                    className: 'card',
                    children: [
                        { tag: 'h3', className: 'mb-md', text: 'Contract Shape' },
                        {
                            tag: 'p',
                            className: 'text-secondary mb-md',
                            text: 'Use `page` for explicit JSON structure or `preset` for a built-in specimen. Query params can override document theme and mode without changing the JSON itself.',
                        },
                        tableNode(['Key', 'Type', 'Notes'], [
                            [{ tag: 'code', text: 'version' }, 'number', 'Use `1`.'],
                            [{ tag: 'code', text: 'theme' }, 'string', 'Optional document default. Query param still wins.'],
                            [{ tag: 'code', text: 'mode' }, 'string', 'Optional document default. Supports `light` and `dark`.'],
                            [{ tag: 'code', text: 'page' }, 'object', 'Use shared components, safe tags, and declarative actions.'],
                            [{ tag: 'code', text: 'preset' }, 'string', 'Optional shortcut to a built-in specimen.'],
                            [{ tag: 'code', text: 'spec64' }, 'query param', 'Base64url encoded contract for share links and iframe previews.'],
                        ]),
                    ],
                },
            ],
        }), (root) => {
            const standalonePath = '/tabs/canonical/contract-lab/index.html';
            const isStandalonePage = window.location.pathname.endsWith(standalonePath);
            const editor = root.querySelector('#contract-editor');
            const status = root.querySelector('#contract-status');
            const errorBox = root.querySelector('#contract-error');
            const errorText = root.querySelector('#contract-error-text');
            const previewFrame = root.querySelector('#contract-preview-frame');
            const previewOpen = root.querySelector('#contract-open');
            const previewLabel = root.querySelector('#contract-preview-label');
            const fixtureSelect = root.querySelector('#contract-fixture');
            const themeSelect = root.querySelector('#contract-theme');
            const modeSelect = root.querySelector('#contract-mode');
            let renderTimer = null;
            let lastValidDocument = starterDocument;
            let lastPreviewUrl = '/render.html?theme=active&mode=light';

            themeSelect.value = document.documentElement.dataset.uiTheme || 'active';
            modeSelect.value = document.documentElement.dataset.uiMode || 'light';

            function setStatus(text, tone) {
                status.textContent = text;
                status.className = `status-badge status-${tone}`;
            }

            function setError(message) {
                errorText.textContent = message;
                errorBox.classList.remove('is-hidden');
            }

            function clearError() {
                errorText.textContent = '';
                errorBox.classList.add('is-hidden');
            }

            function encodeSpec64(value) {
                return btoa(JSON.stringify(value))
                    .replace(/\+/g, '-')
                    .replace(/\//g, '_')
                    .replace(/=+$/g, '');
            }

            function decodeSpec64(value) {
                const normalized = String(value || '').replace(/-/g, '+').replace(/_/g, '/');
                const padded = normalized + '='.repeat((4 - (normalized.length % 4 || 4)) % 4);
                return JSON.parse(atob(padded));
            }

            function fallbackNormalizeDocument(rawDocument) {
                if (!rawDocument || typeof rawDocument !== 'object' || Array.isArray(rawDocument)) {
                    return {
                        version: 1,
                        page: rawDocument,
                    };
                }

                const documentKeys = new Set(['$schema', 'version', 'title', 'description', 'theme', 'mode', 'preset', 'presetOptions', 'page', 'meta']);
                const isEnvelope = Object.keys(rawDocument).some((key) => documentKeys.has(key));

                if (isEnvelope) {
                    return {
                        version: rawDocument.version ?? 1,
                        ...rawDocument,
                    };
                }

                return {
                    version: 1,
                    page: rawDocument,
                };
            }

            function normalizeDocument(rawDocument) {
                if (window.UI?.contract?.normalize) {
                    return window.UI.contract.normalize(rawDocument);
                }

                return fallbackNormalizeDocument(rawDocument);
            }

            function validateDocument(rawDocument) {
                if (window.UI?.contract?.validate) {
                    return window.UI.contract.validate(rawDocument);
                }

                return {
                    valid: true,
                    errors: [],
                    document: normalizeDocument(rawDocument),
                };
            }

            function buildPreviewUrl(documentContract) {
                const spec64 = encodeSpec64(documentContract);
                const theme = themeSelect.value;
                const mode = modeSelect.value;
                return `/render.html?theme=${encodeURIComponent(theme)}&mode=${encodeURIComponent(mode)}&spec64=${encodeURIComponent(spec64)}`;
            }

            function applyPreview(url) {
                lastPreviewUrl = url;
                previewFrame.src = url;
                previewOpen.href = url;
                previewLabel.textContent = `${themeSelect.value} / ${modeSelect.value}`;
            }

            function updateHash(documentContract) {
                if (!isStandalonePage) {
                    return;
                }

                const nextUrl = new URL(window.location.href);
                nextUrl.hash = `spec64=${encodeSpec64(documentContract)}`;
                history.replaceState(null, '', nextUrl);
            }

            function scheduleRender() {
                clearTimeout(renderTimer);
                renderTimer = setTimeout(renderNow, 300);
            }

            function renderNow() {
                try {
                    const parsed = JSON.parse(editor.value);
                    const validation = validateDocument(parsed);
                    if (!validation.valid) {
                        throw new Error(validation.errors[0] || 'Contract is invalid.');
                    }

                    clearError();
                    setStatus(window.UI?.contract?.validate ? 'Valid Contract' : 'JSON Ready', window.UI?.contract?.validate ? 'success' : 'info');
                    lastValidDocument = validation.document || normalizeDocument(parsed);
                    applyPreview(buildPreviewUrl(lastValidDocument));
                    updateHash(lastValidDocument);
                } catch (error) {
                    setStatus('Needs Fix', 'warning');
                    setError(error.message || 'Could not render contract.');
                    if (lastPreviewUrl) {
                        previewFrame.src = lastPreviewUrl;
                    }
                }
            }

            function loadIntoEditor(documentContract) {
                const normalized = normalizeDocument(documentContract);
                editor.value = JSON.stringify(normalized, null, 2);
                renderNow();
            }

            async function loadFixtureFromSource(source) {
                const response = await fetch(source);
                if (!response.ok) {
                    throw new Error(`Could not load fixture from ${source}.`);
                }

                const documentContract = await response.json();
                loadIntoEditor(documentContract);
                setStatus('Fixture Loaded', 'info');
            }

            async function populateFixtures() {
                try {
                    const response = await fetch('/contracts/fixtures/manifest.json');
                    if (!response.ok) {
                        throw new Error('Fixture manifest request failed.');
                    }

                    const manifest = await response.json();
                    manifest.fixtures.forEach((fixture) => {
                        const option = document.createElement('option');
                        option.value = fixture.source;
                        option.textContent = fixture.label;
                        fixtureSelect.appendChild(option);
                    });
                } catch (_) {
                    const option = document.createElement('option');
                    option.value = '';
                    option.textContent = 'Fixtures unavailable';
                    option.disabled = true;
                    fixtureSelect.appendChild(option);
                }
            }

            async function copyText(value, successText) {
                await navigator.clipboard.writeText(value);
                setStatus(successText, 'info');
            }

            root.querySelector('#contract-format').addEventListener('click', () => {
                try {
                    const parsed = JSON.parse(editor.value);
                    editor.value = JSON.stringify(parsed, null, 2);
                    renderNow();
                } catch (error) {
                    setStatus('Needs Fix', 'warning');
                    setError(error.message || 'Could not format JSON.');
                }
            });

            root.querySelector('#contract-copy-json').addEventListener('click', async () => {
                await copyText(editor.value, 'JSON Copied');
            });

            root.querySelector('#contract-copy-url').addEventListener('click', async () => {
                if (lastValidDocument) {
                    updateHash(lastValidDocument);
                }
                const shareUrl = isStandalonePage
                    ? window.location.href
                    : new URL(previewOpen.href, window.location.origin).toString();
                await copyText(shareUrl, 'URL Copied');
            });

            root.querySelector('#contract-load-example').addEventListener('click', () => {
                fixtureSelect.value = '__example__';
                loadIntoEditor(starterDocument);
                setStatus('Loaded Example', 'info');
            });

            fixtureSelect.addEventListener('change', async () => {
                if (fixtureSelect.value === '__example__') {
                    loadIntoEditor(starterDocument);
                    setStatus('Loaded Example', 'info');
                    return;
                }

                try {
                    await loadFixtureFromSource(fixtureSelect.value);
                } catch (error) {
                    setStatus('Needs Fix', 'warning');
                    setError(error.message || 'Could not load fixture.');
                }
            });

            editor.addEventListener('input', scheduleRender);
            themeSelect.addEventListener('change', () => {
                if (lastValidDocument) {
                    applyPreview(buildPreviewUrl(lastValidDocument));
                }
            });
            modeSelect.addEventListener('change', () => {
                if (lastValidDocument) {
                    applyPreview(buildPreviewUrl(lastValidDocument));
                }
            });

            populateFixtures().finally(() => {
                if (isStandalonePage && window.location.hash.startsWith('#spec64=')) {
                    try {
                        loadIntoEditor(decodeSpec64(window.location.hash.slice('#spec64='.length)));
                        setStatus('Loaded Shared URL', 'info');
                        return;
                    } catch (error) {
                        setError('Could not load the shared URL. Showing the starter contract instead.');
                    }
                }

                loadIntoEditor(starterDocument);
                setStatus('Ready', 'info');
            });
        });
    }

    const builders = {
        'canonical.structure': buildStructurePage,
        'canonical.grids': buildGridsPage,
        'canonical.typography': buildTypographyPage,
        'canonical.buttons': buildButtonsPage,
        'canonical.forms': buildFormsPage,
        'canonical.cards': buildCardsPage,
        'canonical.tables': buildTablesPage,
        'canonical.alerts': buildAlertsPage,
        'canonical.modals': buildModalsPage,
        'canonical.detail': buildDetailPage,
        'canonical.spacing': buildSpacingPage,
        'canonical.full-page': buildFullPage,
        'canonical.live-preview': buildLivePreviewPage,
        'canonical.contract-lab': buildContractLabPage,
    };

    const presetMeta = {
        'canonical.structure': { category: 'pattern', preferredTabs: ['canonical'], title: 'Page Structure' },
        'canonical.grids': { category: 'pattern', preferredTabs: ['canonical'], title: 'Grid System' },
        'canonical.typography': { category: 'pattern', preferredTabs: ['canonical'], title: 'Typography' },
        'canonical.buttons': { category: 'control', preferredTabs: ['builder', 'canonical'], title: 'Buttons' },
        'canonical.forms': { category: 'control', preferredTabs: ['builder', 'canonical'], title: 'Forms' },
        'canonical.cards': { category: 'control', preferredTabs: ['builder', 'canonical'], title: 'Cards' },
        'canonical.tables': { category: 'control', preferredTabs: ['builder', 'canonical'], title: 'Tables' },
        'canonical.alerts': { category: 'control', preferredTabs: ['builder', 'canonical'], title: 'Alerts & Badges' },
        'canonical.modals': { category: 'control', preferredTabs: ['builder', 'canonical'], title: 'Modals & Toasts' },
        'canonical.detail': { category: 'pattern', preferredTabs: ['canonical'], title: 'Detail Pages' },
        'canonical.spacing': { category: 'pattern', preferredTabs: ['canonical'], title: 'Spacing & Utilities' },
        'canonical.full-page': { category: 'pattern', preferredTabs: ['canonical'], title: 'Full Pages' },
        'canonical.live-preview': { category: 'lab', preferredTabs: ['canonical'], title: 'Live Preview' },
        'canonical.contract-lab': { category: 'lab', preferredTabs: ['canonical'], title: 'Contract Lab' },
    };

    Object.entries(builders).forEach(([name, builder]) => {
        UI.presets.register(name, () => {
            const result = builder();
            if (typeof UI.demoDocs?.attachPresetAdoption !== 'function') {
                return result;
            }
            return UI.demoDocs.attachPresetAdoption(result, {
                presetName: name,
                ...(presetMeta[name] || {}),
            });
        });
    });
})(window);
