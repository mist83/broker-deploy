(function(window) {
    'use strict';

    const DEFAULT_THEME = 'walmart';
    const DEFAULT_MODE = 'light';
    const MODES = Object.freeze(['light', 'dark']);
    const THEMES = Object.freeze([
        {
            id: 'cyberblue',
            name: 'Cyberblue',
            icon: 'ti ti-droplet',
            description: 'Theme Builder copy of cyberpink with the hot pink pushed to electric blue.',
            usage: 'Use when the synthwave chrome should stay neon and dramatic but lean blue instead of pink.',
            traits: [
                'Generated from Cyberpink by the Theme Builder.',
                'Electric blue primary with the same cyan and purple support colors.',
                'Locked named theme with static stylesheet URLs.',
            ],
            primary: '#008CFF',
            secondary: '#006DCC',
        },
        {
            id: 'cyberpink',
            name: 'Cyberpink',
            icon: 'ti ti-bolt',
            description: 'Neon-heavy synthwave treatment for loud demos and high-energy branded work.',
            usage: 'Use when the interface should feel theatrical, dark, and sharply branded.',
            traits: [
                'High-contrast neon palette.',
                'Dark-first and intentionally dramatic.',
                'Best for explicit showcase work, not generic defaults.',
            ],
            primary: '#FF4FB3',
            secondary: '#7C4DFF',
        },
        {
            id: 'ghoul',
            name: 'Ghoul',
            icon: 'ti ti-ghost-2',
            description: 'Acid green and blood red on near-black. Monospace-first dev-console palette built for log streams, party-game HUDs, and TV-room visibility.',
            usage: 'Use when the surface is a dense information stream, a developer dashboard, or anything that should read clearly from across a room.',
            traits: [
                'Monospace-first typography (JetBrains Mono + Rubik Mono One).',
                'Dark-first; calibrated for living-room TV brightness.',
                'Strong semantic colors for log levels (acid info, blood error, warn yellow).',
            ],
            primary: '#B3FF2C',
            secondary: '#FF2C4D',
        },
        {
            id: 'editorial',
            name: 'Editorial',
            icon: 'ti ti-book-2',
            description: 'Typography-led paper-and-ink theme for authored, high-intent surfaces.',
            usage: 'Use when the surface should feel authored, typographic, and deliberate without abandoning framework semantics.',
            traits: [
                'Typography-led visual system.',
                'Balances product shell structure with authored tone.',
                'Works well for docs, launch surfaces, and high-intent work.',
            ],
            primary: '#143A6B',
            secondary: '#A15C38',
        },
        {
            id: 'mockup',
            name: 'Mockup',
            icon: 'ti ti-pencil',
            description: 'Sketch-like wireframe treatment for concept reviews and low-fidelity product planning.',
            usage: 'Use for prototype walkthroughs, concept validation, and low-fidelity planning surfaces.',
            traits: [
                'Wireframe-like visual language.',
                'Deliberately low-polish presentation.',
                'Useful before brand styling matters.',
            ],
            primary: '#000000',
            secondary: '#666666',
        },
        {
            id: 'monochrome',
            name: 'Monochrome',
            icon: 'ti ti-contrast',
            description: 'Neutral grayscale system with matching grayscale dark mode.',
            usage: 'Use when the interface should stay quiet, neutral, and free of color branding.',
            traits: [
                'Single-family grayscale palette.',
                'Light mode uses white and soft grays; dark mode uses dark gray surfaces.',
                'Keeps framework spacing and behavior intact.',
            ],
            primary: '#111111',
            secondary: '#555555',
        },
        {
            id: 'blackwhite',
            name: 'Black and White',
            icon: 'ti ti-square-half',
            description: 'Strict two-color theme: black on white, white on black in dark mode.',
            usage: 'Use when the surface should be as stark and literal as possible.',
            traits: [
                'Only black and white tokens.',
                'Dark mode flips to white on black.',
                'No shadows, no rounded chrome, no intermediate grays.',
            ],
            primary: '#000000',
            secondary: '#FFFFFF',
        },
        {
            id: 'ocean',
            name: 'Ocean',
            icon: 'ti ti-wave-sine',
            description: 'Cool blue system for calmer dashboards and ambient product surfaces.',
            usage: 'Use when you want a restrained, calmer environment without losing clarity.',
            traits: [
                'Calmer product tone than the default baseline.',
                'Good for dashboards and ambient product work.',
                'Keeps contrast readable without feeling loud.',
            ],
            primary: '#1098D1',
            secondary: '#0F6C8D',
        },
        {
            id: 'pastelzom',
            name: 'Pastel Zombie',
            icon: 'ti ti-skull',
            description: 'Light pastel zombie theme built for readable asset browsers and playful horror tools.',
            usage: 'Use when a spooky or zombie-flavored surface needs to stay light, calm, and easy to scan.',
            traits: [
                'Light mint, lilac, and candy-pink palette.',
                'Atkinson Hyperlegible for body and UI text.',
                'Display-only spooky type so headers have flavor without hurting tables.',
            ],
            primary: '#2F8F5B',
            secondary: '#FF9AC8',
        },
        {
            id: 'precog',
            name: 'Precog',
            icon: 'ti ti-radar-2',
            description: 'Signal-room palette for timeline, automation, and monitoring surfaces.',
            usage: 'Use when status, history, or live operational state should feel precise without becoming loud.',
            traits: [
                'Calm blue-green status palette.',
                'Good for timelines, watches, and automation monitors.',
                'Keeps operational surfaces readable and restrained.',
            ],
            primary: '#176B8F',
            secondary: '#FFB547',
        },
        {
            id: 'pumpkin',
            name: 'Pumpkin',
            icon: 'ti ti-pumpkin-scary',
            description: 'Warm rounded theme for approachable and slightly playful product work.',
            usage: 'Use for welcoming surfaces, playful tools, and flows that should feel human and soft.',
            traits: [
                'Warm, approachable palette.',
                'Rounder shell details and softer contrast.',
                'Useful when neutral product work feels too cold.',
            ],
            primary: '#D16C1A',
            secondary: '#7A4317',
        },
        {
            id: 'sunset',
            name: 'Sunset',
            icon: 'ti ti-sunset-2',
            description: 'Warmer editorial palette for expressive showcase and storytelling surfaces.',
            usage: 'Use when the interface should feel warm, expressive, and slightly cinematic.',
            traits: [
                'Warm expressive palette.',
                'Works well for showcases and narrative surfaces.',
                'More atmospheric than the default product tones.',
            ],
            primary: '#E76F51',
            secondary: '#F4A261',
        },
        {
            id: 'terminal',
            name: 'Terminal',
            icon: 'ti ti-terminal-2',
            description: 'Sharp monochrome terminal style for command-heavy tools and operator consoles.',
            usage: 'Use when the surface should read like an operator console without losing shared UI semantics.',
            traits: [
                'Monospace-first command surface.',
                'Dark console base with high-contrast semantic accents.',
                'Crisp square controls and minimal ornament.',
            ],
            primary: '#38F277',
            secondary: '#8AE6FF',
        },
        {
            id: 'walmart',
            name: 'Walmart',
            icon: 'ti ti-brand-walmart',
            description: 'Brand-specific blue and yellow treatment for explicit Walmart-flavored work only.',
            usage: 'Use only when you intentionally need that branded color language.',
            traits: [
                'Recognizable blue and yellow branding.',
                'Strong commercial retail feel.',
                'Not appropriate for generic work.',
            ],
            primary: '#0071CE',
            secondary: '#FFC220',
        },
        {
            id: 'windows31',
            name: 'Windows 3.1',
            icon: 'ti ti-brand-windows',
            description: 'Sharp gray bevels, blue chrome, and Times-flavored retro desktop styling.',
            usage: 'Use for intentionally crusty desktop nostalgia or legacy-control-panel demos.',
            traits: [
                'Square bevels and system gray surfaces.',
                'Navy title bars and old desktop contrast.',
                'Times-flavored content typography.',
            ],
            primary: '#000080',
            secondary: '#C0C0C0',
        },
        {
            id: 'red',
            name: 'Red',
            icon: 'ti ti-circle-letter-r',
            description: 'Clean simple-theme surfaces with a red accent.',
            usage: 'Use when the surface should stay neutral and let a red accent carry attention.',
            traits: [
                'White surfaces, neutral text, single red accent.',
                'System font stack with flat enterprise chrome.',
                'Recolor of the simple theme; behavior is unchanged.',
            ],
            primary: '#DC3545',
            secondary: '#B02A37',
        },
        {
            id: 'orange',
            name: 'Orange',
            icon: 'ti ti-circle-letter-o',
            description: 'Clean simple-theme surfaces with an orange accent.',
            usage: 'Use when a warm, attention-getting accent works without leaning into pumpkin or sunset palettes.',
            traits: [
                'White surfaces, neutral text, single orange accent.',
                'System font stack with flat enterprise chrome.',
                'Recolor of the simple theme; behavior is unchanged.',
            ],
            primary: '#E65100',
            secondary: '#B23900',
        },
        {
            id: 'yellow',
            name: 'Yellow',
            icon: 'ti ti-circle-letter-y',
            description: 'Clean simple-theme surfaces with a deep-amber accent.',
            usage: 'Use when yellow is the brand cue but contrast on white still has to read clearly.',
            traits: [
                'Amber primary instead of pure yellow for AA contrast on white.',
                'System font stack with flat enterprise chrome.',
                'Recolor of the simple theme; behavior is unchanged.',
            ],
            primary: '#B58A1A',
            secondary: '#8C6913',
        },
        {
            id: 'green',
            name: 'Green',
            icon: 'ti ti-circle-letter-g',
            description: 'Clean simple-theme surfaces with a green accent.',
            usage: 'Use when the surface should stay neutral with a confident green accent.',
            traits: [
                'White surfaces, neutral text, single green accent.',
                'System font stack with flat enterprise chrome.',
                'Recolor of the simple theme; behavior is unchanged.',
            ],
            primary: '#2E7D32',
            secondary: '#1B5E20',
        },
        {
            id: 'blue',
            name: 'Blue',
            icon: 'ti ti-circle-letter-b',
            description: 'Clean simple-theme surfaces with a blue accent.',
            usage: 'Use when the surface should feel default-blue without picking up Bootstrap or Walmart branding.',
            traits: [
                'White surfaces, neutral text, single blue accent.',
                'System font stack with flat enterprise chrome.',
                'Recolor of the simple theme; behavior is unchanged.',
            ],
            primary: '#1976D2',
            secondary: '#0D47A1',
        },
        {
            id: 'indigo',
            name: 'Indigo',
            icon: 'ti ti-circle-letter-i',
            description: 'Clean simple-theme surfaces with an indigo accent.',
            usage: 'Use when the surface should feel slightly more serious than blue without going violet.',
            traits: [
                'White surfaces, neutral text, single indigo accent.',
                'System font stack with flat enterprise chrome.',
                'Recolor of the simple theme; behavior is unchanged.',
            ],
            primary: '#3949AB',
            secondary: '#1A237E',
        },
        {
            id: 'violet',
            name: 'Violet',
            icon: 'ti ti-circle-letter-v',
            description: 'Clean simple-theme surfaces with a violet accent.',
            usage: 'Use when the surface should carry a violet accent without leaning into the pastel or pink themes.',
            traits: [
                'White surfaces, neutral text, single violet accent.',
                'System font stack with flat enterprise chrome.',
                'Recolor of the simple theme; behavior is unchanged.',
            ],
            primary: '#8E24AA',
            secondary: '#4A148C',
        },
        {
            id: 'mac',
            name: 'Mac',
            icon: 'ti ti-brand-apple',
            description: 'Apple/macOS control language — SF system font, system blue, pill segmented tabs, traffic-light modal close.',
            usage: 'Use when the surface should feel like a native macOS control set.',
            traits: [
                'SF system font stack with tightened tracking on display copy.',
                'Pill segmented-control tab strip and rounded buttons.',
                'Traffic-light close on modals (red / yellow / green dots).',
                'Apple system blue accent in light and dark modes.',
            ],
            primary: '#007AFF',
            secondary: '#8E8E93',
        },
    ]);

    function cloneTheme(theme) {
        return {
            ...theme,
            traits: Array.isArray(theme.traits) ? theme.traits.slice() : [],
        };
    }

    function getThemeRecord(value) {
        const normalized = String(value || '').trim().toLowerCase();
        return THEMES.find((theme) => theme.id === normalized) || null;
    }

    function normalizeTheme(value, fallback = DEFAULT_THEME) {
        const theme = getThemeRecord(value);
        if (theme) {
            return theme.id;
        }

        if (fallback === null) {
            return null;
        }

        return getThemeRecord(fallback)?.id || DEFAULT_THEME;
    }

    function normalizeMode(value, fallback = DEFAULT_MODE) {
        const normalized = String(value || '').trim().toLowerCase();
        if (MODES.includes(normalized)) {
            return normalized;
        }

        return MODES.includes(fallback) ? fallback : DEFAULT_MODE;
    }

    const registry = {
        defaultTheme: DEFAULT_THEME,
        defaultMode: DEFAULT_MODE,
        list() {
            return THEMES.map(cloneTheme);
        },
        ids() {
            return THEMES.map((theme) => theme.id);
        },
        modes() {
            return MODES.slice();
        },
        has(value) {
            return Boolean(getThemeRecord(value));
        },
        get(value) {
            const theme = getThemeRecord(value);
            return theme ? cloneTheme(theme) : null;
        },
        getName(value) {
            return getThemeRecord(value)?.name || normalizeTheme(value);
        },
        normalize(value, fallback = DEFAULT_THEME) {
            return normalizeTheme(value, fallback);
        },
        normalizeMode(value, fallback = DEFAULT_MODE) {
            return normalizeMode(value, fallback);
        },
    };

    window.UIThemeCatalog = registry.list();
    window.UIThemeRegistry = registry;
})(window);
