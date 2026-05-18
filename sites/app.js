const DEFAULT_SITE_PLATFORM = Object.freeze({
  baseDomain: 'mullmania.com',
  canon: {
    version: '2026.04.26',
    source: 'https://development-canon.mullmania.com/canon.json',
    profile: 'frontdoor-v1',
    docs: {
      canonJson: 'https://development-canon.mullmania.com/canon.json',
      quickstart: 'https://development-canon.mullmania.com/QUICKSTART.md',
      syncGuide: 'https://development-canon.mullmania.com/sync-site-with-canon.md',
      uiSection: 'https://development-canon.mullmania.com/#canon/ui',
      exampleFrontdoor: 'https://development-canon.mullmania.com/examples/host-a-site/site/frontdoor.json',
    },
  },
  siteIds: {
    root: '_root',
    current: 'sites',
    ui: 'ui',
    reserved: ['_root', 'sites', 'ui', 'index'],
    alwaysPublic: ['_root', 'sites', 'ui'],
    reservedAliases: ['www', 'sites', 'ui', 'index'],
  },
  categoryTags: [
    { id: 'frontend-ui', label: 'Frontend / UI', aliases: ['shared-ui', 'frontend', 'css', 'design', 'editor'] },
    { id: 'ui-framework', label: 'UI / Framework', aliases: ['uses-ui-mullmania', 'ui-consumer', 'shared-ui-runtime'] },
    { id: 'tooling', label: 'Tooling', aliases: ['developer-tooling', 'automation', 'library', 'framework-support'] },
    { id: 'data', label: 'Data', aliases: ['mullmania-data', 'generated-assets'] },
    { id: 'games', label: 'Games', aliases: ['game', 'arcade', 'card-game', 'minigame', 'multiplayer'] },
    { id: 'fun-experiment', label: 'Fun / Experiment', aliases: ['fun', 'experiment', 'experiments', 'playground', 'prototype'] },
    { id: 'simulation', label: 'Simulation', aliases: ['physics', 'science-art'] },
    { id: 'docs', label: 'Docs', aliases: ['documentation', 'demo-docs'] },
    { id: 'audio-visual', label: 'Audio / Visual', aliases: ['audio', 'music'] },
    { id: 'backend-api', label: 'Backend / API', aliases: ['api', 'backend', 'lambda-api', 'lambda-backed'] },
  ],
  featureFacets: [
    {
      id: 'phone-remote',
      label: 'Phone Remote',
      shortLabel: 'Remote',
      rule: 'Use the canonical phone pairing primitive from ui/js/pair.js when a phone controls the app, TV, or dashboard surface.',
    },
    {
      id: 'signalr',
      label: 'SignalR',
      shortLabel: 'SignalR',
      rule: 'Use signal-argh through the SignalR client for real-time messaging; do not hand-roll raw WebSocket protocol code.',
    },
    {
      id: 's3-storage',
      label: 'S3 Storage',
      shortLabel: 'S3',
      rule: 'Use the Mullmania hosting/data bucket conventions for static artifacts, persisted metadata, and deploy-safe storage.',
    },
    {
      id: 'lambda-api',
      label: 'Lambda API',
      shortLabel: 'Lambda',
      rule: 'Use a Lambda/API-backed route when the feature needs trusted mutation, shared state, or server-owned integration.',
    },
    {
      id: 'frontend-canon',
      label: 'Frontend Canon',
      shortLabel: 'Canon',
      rule: 'Follow the development canon and ui.mullmania.com shell rules for browser-facing UI.',
    },
    {
      id: 'threejs',
      label: 'Three.js',
      shortLabel: '3D',
      rule: 'Use Three.js for 3D surfaces, keep the primary scene visible and interactive, and verify the canvas is not blank.',
    },
    {
      id: 'tv-telemetry',
      label: 'TV Telemetry',
      shortLabel: 'Logs',
      rule: 'Wire tv-tail/log-tap for browser surfaces where target-device debugging is difficult.',
    },
  ],
  ui: {
    activeThemeId: 'active',
    defaultThemeId: 'walmart',
    themeIds: ['active', 'blackwhite', 'cyberblue', 'cyberpink', 'editorial', 'ghoul', 'mockup', 'monochrome', 'ocean', 'pastelzom', 'precog', 'pumpkin', 'sunset', 'terminal', 'walmart', 'windows31'],
    themeLabels: {
      blackwhite: 'Black and White',
      cyberblue: 'Cyber Blue',
      cyberpink: 'Cyber Pink',
      pastelzom: 'Pastel Zombie',
      windows31: 'Windows 3.1',
    },
  },
});
let sitePlatform = DEFAULT_SITE_PLATFORM;
let BASE_DOMAIN = window.__baseDomain || (function() {
  var host = location.hostname;
  var parts = host.split('.');
  var base = parts.length >= 3 ? parts.slice(-2).join('.') : host;
  if (base === 'localhost' || base === '127.0.0.1' || base === '0.0.0.0') {
    base = DEFAULT_SITE_PLATFORM.baseDomain;
  }
  return base;
})();

function baseDomain() {
  return BASE_DOMAIN;
}

function rootHost() {
  return baseDomain();
}

function uiOrigin() {
  return `https://ui.${baseDomain()}`;
}

function sitesOrigin() {
  return `https://sites.${baseDomain()}`;
}

function imageFiberOrigin() {
  const configuredOrigin = typeof state !== 'undefined'
    ? String(state.config?.imageFiberApiBaseUrl || '').trim().replace(/\/+$/, '')
    : '';
  return configuredOrigin || `https://image-fiber.${baseDomain()}`;
}

function siteHost(siteId) {
  const normalizedSiteId = String(siteId || '').trim();
  return normalizedSiteId === ROOT_SITE_ID ? rootHost() : `${normalizedSiteId}.${baseDomain()}`;
}

function siteUrl(siteId) {
  return `https://${siteHost(siteId)}/`;
}

const VIEW_STORAGE_KEY = 'mullmania-launchpad-view';
const IS_EMBEDDED_CONTEXT = (() => {
  try {
    return window.self !== window.top;
  } catch {
    return true;
  }
})();
function usePersistentViewState() {
  return !IS_EMBEDDED_CONTEXT;
}
function isMobileSwipeViewport() {
  if (typeof window === 'undefined') {
    return false;
  }
  if (typeof window.matchMedia === 'function') {
    return window.matchMedia(MOBILE_SWIPE_MEDIA_QUERY).matches;
  }
  return window.innerWidth <= 480;
}
const JSON_VIEW_MODE_STORAGE_KEY = 'mullmania-launchpad-json-view-mode';
const JSON_WRAP_STORAGE_KEY = 'mullmania-launchpad-json-wrap';
const TABLE_PAGE_SIZE_STORAGE_KEY = 'mullmania-launchpad-table-page-size';
const SEARCH_FIELDS_STORAGE_KEY = 'mullmania-launchpad-search-fields';
const OPERATOR_KEY_STORAGE_KEY = 'mullmania-launchpad-operator-key';
const ACCESS_JOBS_STORAGE_KEY = 'mullmania-launchpad-access-jobs';
const FULLSCREEN_PREVIEW_SOURCE_STORAGE_KEY = 'mullmania-launchpad-fullscreen-preview-source';
const MOBILE_SWIPE_MEDIA_QUERY = '(max-width: 480px)';
const MOBILE_LIST_INITIAL_LIMIT = 25;
const MOBILE_LIST_INCREMENT = 25;
const MOBILE_WALL_INITIAL_LIMIT = 36;
const MOBILE_WALL_INCREMENT = 36;
const GALLERY_BROADCAST_HUB_STORAGE_KEY = 'mullmania-launchpad-gallery-broadcast-hub';
const GALLERY_BROADCAST_CHANNEL_STORAGE_KEY = 'mullmania-launchpad-gallery-broadcast-channel';
const CONNJURE_TVS_STORAGE_KEY = 'mullmania-launchpad-connjure-tvs';
const GALLERY_BROADCAST_DEFAULT_HUB = 'https://signalargh.mullmania.com';
const GALLERY_BROADCAST_DEFAULT_CHANNEL = 'mullmania-gallery';
const GALLERY_BROADCAST_TOPIC = 'sites.gallery.broadcast';
const GALLERY_BROADCAST_MAX_SITES = 24;
const SIGNALR_CLIENT_URL = 'https://cdnjs.cloudflare.com/ajax/libs/microsoft-signalr/8.0.0/signalr.min.js';
const VALET_LOCAL_BASE_URL = 'http://127.0.0.1:9471';
const VSCODE_EXTENSION_DOWNLOAD_PATH = './downloads/mullmania-sites.vsix';
const VSCODE_OPEN_URI_BASE = 'vscode://mist83.mullmania-sites/open';
const VSCODE_DEPLOY_COMMAND = 'aws s3 cp s3://mullmania.com-data/_tools/deploy.sh - | bash -s -- apply';
const TABLE_PAGE_SIZE_ALL = 'all';
const DEFAULT_TABLE_PAGE_SIZE = 50;
const FEATURE_MATRIX_STORAGE_KEY = 'mullmania-launchpad-feature-matrix';
const FEATURE_MATRIX_SCOPE_VISIBLE = 'visible';
const FEATURE_MATRIX_SCOPE_ALL = 'all';
const FEATURE_MATRIX_STATE_UNKNOWN = 'unknown';
const FEATURE_MATRIX_STATE_ON = 'on';
const FEATURE_MATRIX_STATE_OFF = 'off';
const FEATURE_MATRIX_STATE_DEFERRED = 'deferred';
const FEATURE_MATRIX_STATE_MIXED = 'mixed';
const FEATURE_MATRIX_STATES = Object.freeze({
  [FEATURE_MATRIX_STATE_UNKNOWN]: { id: FEATURE_MATRIX_STATE_UNKNOWN, label: 'Unknown', shortLabel: '?', icon: 'ti ti-circle-dotted' },
  [FEATURE_MATRIX_STATE_ON]: { id: FEATURE_MATRIX_STATE_ON, label: 'On', shortLabel: 'Yes', icon: 'ti ti-check' },
  [FEATURE_MATRIX_STATE_OFF]: { id: FEATURE_MATRIX_STATE_OFF, label: 'Off', shortLabel: 'No', icon: 'ti ti-x' },
  [FEATURE_MATRIX_STATE_DEFERRED]: { id: FEATURE_MATRIX_STATE_DEFERRED, label: 'Deferred', shortLabel: 'Later', icon: 'ti ti-clock' },
});
const FEATURE_MATRIX_STATE_ORDER = Object.freeze([
  FEATURE_MATRIX_STATE_UNKNOWN,
  FEATURE_MATRIX_STATE_ON,
  FEATURE_MATRIX_STATE_OFF,
  FEATURE_MATRIX_STATE_DEFERRED,
]);
const SEARCH_FIELD_DEFINITIONS = Object.freeze([
  { id: 'title', label: 'Title', ariaLabel: 'Search titles' },
  { id: 'url', label: 'URL', ariaLabel: 'Search URLs and subdomains' },
  { id: 'description', label: 'Desc', ariaLabel: 'Search descriptions' },
]);
const DEFAULT_SEARCH_FIELD_IDS = Object.freeze(['title', 'url']);
let CATEGORY_TAG_DEFINITIONS = Object.freeze([...DEFAULT_SITE_PLATFORM.categoryTags]);
let CATEGORY_BOARD_TAG_IDS = new Set(CATEGORY_TAG_DEFINITIONS.map((tag) => tag.id));
let CATEGORY_TAG_LABEL_BY_ID = new Map(CATEGORY_TAG_DEFINITIONS.map((tag) => [tag.id, tag.label]));
let CATEGORY_TAG_ALIAS_BY_ID = new Map(CATEGORY_TAG_DEFINITIONS.flatMap((tag) => (
  [tag.id, ...tag.aliases].map((alias) => [alias, tag.id])
)));
let FEATURE_MATRIX_FACETS = Object.freeze(DEFAULT_SITE_PLATFORM.featureFacets.map((facet) => ({ ...facet })));
const COMPOSER_UNAVAILABLE_MESSAGE = 'Protected launchpad actions are not enabled on this build.';
const OPERATOR_KEY_HELP_MESSAGE = 'Management actions include create, overwrite, delete, notes, tags, rank, preview refresh, and main-site changes.';
const COMPOSER_INTENT_AUTHORING = 'authoring';
const COMPOSER_INTENT_ACCESS_GATE = 'access-gate';
const DEPENDENCY_GRAPH_MIN_SCALE = 0.28;
const DEPENDENCY_GRAPH_MAX_SCALE = 2.6;
const DEPENDENCY_GRAPH_NODE_WIDTH = 272;
const DEPENDENCY_GRAPH_NODE_HEIGHT = 72;
const DEPENDENCY_GRAPH_EDGE_GAP = 10;
const PROTECTED_ACTION_SITE_STATE = 'site-state';
const PROTECTED_ACTION_RANK = 'rank';
const PROTECTED_ACTION_NOTE = 'note';
const PROTECTED_ACTION_RENAME_SITE = 'rename-site';
const PROTECTED_ACTION_RENAME_MANY = 'rename-many';
const PROTECTED_ACTION_REFRESH_PREVIEW = 'refresh-preview';
const PROTECTED_ACTION_MAIN_SITE = 'main-site';
const PROTECTED_ACTION_SITE_ACCESS = 'site-access';
const PROTECTED_ACTION_REDEPLOY = 'redeploy';
const PROTECTED_ACTION_SITE_ALIASES = 'site-aliases';
const PROTECTED_ACTION_DISPLAY_NAME = 'display-name';
const PROTECTED_ACTION_DELETE_SITE = 'delete-site';
const PROTECTED_ACTION_RESTORE_SITE = 'restore-site';
const PROTECTED_ACTION_TAG = 'tag';
const PROTECTED_ACTION_DEPENDENCIES = 'dependencies';
const TAG_DRAG_MIME = 'application/x-mullmania-catalog-tag-id';
const PROTECTED_ACTION_COMPOSER_BLANK = 'composer-blank';
const PROTECTED_ACTION_COMPOSER_EDITOR = 'composer-editor';
const PROTECTED_ACTION_COMPOSER_ASSIST = 'composer-assist';
const PROTECTED_ACTION_COMPOSER_INTENT = 'composer-intent';
const PROTECTED_ACTION_COMPOSER_DELETE = 'composer-delete';
const COMPOSER_DRAFT_PRESET_STARTER = 'starter';
const COMPOSER_DRAFT_PRESET_CUSTOM = 'custom';
const COMPOSER_DRAFT_PRESET_LOADED = 'loaded';
const COMPOSER_DEFAULT_RECIPE_ID = 'theme';
const COMPOSER_UI_SITE_STARTER_ID = 'ui-site';
const COMPOSER_DEFAULT_STARTER_ID = 'basic-example';
const COMPOSER_SLACK_BOT_STARTER_ID = 'slack-bot';
const COMPOSER_DEFAULT_THEME_ID = 'walmart';
const COMPOSER_DEFAULT_SURFACE_ID = 'site-page';
const COMPOSER_DEFAULT_DATA_SOURCE_ID = 'none';
const COMPOSER_RECIPE_OPTIONS = Object.freeze([
  {
    id: COMPOSER_DEFAULT_RECIPE_ID,
    label: 'Theme',
    summary: 'Create a hosted page from the choices below.',
  },
  {
    id: 'tv-app',
    label: 'TV App',
    summary: 'Create a TV-style launcher page and copy the selected media assets.',
  },
  {
    id: 'copy-site',
    label: 'Copy Site',
    summary: 'Duplicate an existing hosted site into the new subdomain.',
  },
]);
const COMPOSER_RECIPE_IDS = new Set(COMPOSER_RECIPE_OPTIONS.map((option) => option.id));
let COMPOSER_THEME_OPTIONS = Object.freeze([
  { id: 'cyberpink', label: 'Cyberpink' },
  { id: 'editorial', label: 'Editorial' },
  { id: 'ghoul', label: 'Ghoul' },
  { id: 'mockup', label: 'Mockup' },
  { id: 'monochrome', label: 'Monochrome' },
  { id: 'blackwhite', label: 'Black and White' },
  { id: 'ocean', label: 'Ocean' },
  { id: 'pastelzom', label: 'Pastel Zombie' },
  { id: 'precog', label: 'Precog' },
  { id: 'pumpkin', label: 'Pumpkin' },
  { id: 'sunset', label: 'Sunset' },
  { id: 'terminal', label: 'Terminal' },
  { id: 'walmart', label: 'Walmart' },
  { id: 'windows31', label: 'Windows 3.1' },
]);
let COMPOSER_THEME_IDS = new Set(COMPOSER_THEME_OPTIONS.map((option) => option.id));
const APP_STYLE_STORAGE_KEY = 'mullmania-launchpad-app-style';
const APP_STYLE_DEFAULT_ID = 'active';
let APP_STYLE_OPTIONS = Object.freeze([
  { id: APP_STYLE_DEFAULT_ID, label: 'Published default' },
  ...COMPOSER_THEME_OPTIONS,
]);
let APP_STYLE_IDS = new Set(APP_STYLE_OPTIONS.map((option) => option.id));
const COMPOSER_STARTER_OPTIONS = Object.freeze([
  {
    id: COMPOSER_UI_SITE_STARTER_ID,
    label: 'UI Site',
    summary: 'Ready page shell with header, tabs, sidebar, and the selected theme.',
  },
  {
    id: 'basic-example',
    label: 'Plain Page',
    summary: 'Small HTML, CSS, and JS page you can edit directly.',
  },
  {
    id: COMPOSER_SLACK_BOT_STARTER_ID,
    label: 'Slack Bot',
    summary: 'Static bot page plus example Slack manifest and Bolt server code.',
  },
  {
    id: 'game',
    label: 'Game',
    summary: 'Canvas playfield with a requestAnimationFrame loop, score/state UI, and a keyboard/touch input stub.',
  },
]);
const COMPOSER_SHARED_UI_STARTER_IDS = new Set([COMPOSER_UI_SITE_STARTER_ID]);

// Operator-facing flat picker (the seven cards in the Create modal).
// Each entry maps to an internal (recipeId, starterId, mode) tuple so the existing
// composer state machine keeps working without restructuring. tvFormFactorAutoOn = true
// auto-checks the TV form-factor flag when this card is picked.
const COMPOSER_FLAT_STARTER_OPTIONS = Object.freeze([
  { id: 'plain-page',    recipeId: 'theme',     starterId: 'basic-example',                  mode: 'starter', tvFormFactorAutoOn: false },
  { id: 'ui-shell',      recipeId: 'theme',     starterId: COMPOSER_UI_SITE_STARTER_ID,      mode: 'starter', tvFormFactorAutoOn: false },
  { id: 'tv-app',        recipeId: 'tv-app',    starterId: 'basic-example',                  mode: 'starter', tvFormFactorAutoOn: true  },
  { id: 'slack-bot',     recipeId: 'theme',     starterId: COMPOSER_SLACK_BOT_STARTER_ID,    mode: 'starter', tvFormFactorAutoOn: false },
  { id: 'game',          recipeId: 'theme',     starterId: 'game',                           mode: 'starter', tvFormFactorAutoOn: false },
  { id: 'copy-existing', recipeId: 'copy-site', starterId: 'basic-example',                  mode: 'starter', tvFormFactorAutoOn: false },
  { id: 'from-editor',   recipeId: 'theme',     starterId: 'basic-example',                  mode: 'editor',  tvFormFactorAutoOn: false },
]);
const COMPOSER_FLAT_STARTER_IDS = new Set(COMPOSER_FLAT_STARTER_OPTIONS.map((option) => option.id));
const COMPOSER_DEFAULT_FLAT_STARTER_ID = 'plain-page';
const COMPOSER_TV_FORM_FACTOR_TAG = 'tv-form-factor';
const COMPOSER_PLACEHOLDER_TAG_PREFIX = 'placeholder-unimplemented:';
const COMPOSER_SURFACE_OPTIONS = Object.freeze([
  { id: COMPOSER_DEFAULT_SURFACE_ID, label: 'Site / Page', shell: 'Page', summary: 'A hosted page with sections and one main action.' },
  { id: 'tool-app', label: 'Tool / App', shell: 'Workspace', summary: 'Navigation, panels, actions, and status.' },
  { id: 'game', label: 'Game', shell: 'Playfield', summary: 'A browser game page with a play area and score/status.' },
  { id: 'api-frontdoor', label: 'API Front Door', shell: 'Endpoint index', summary: 'A visible route list and health section.' },
]);
const COMPOSER_SURFACE_IDS = new Set(COMPOSER_SURFACE_OPTIONS.map((option) => option.id));
const COMPOSER_ADDON_OPTIONS = Object.freeze([
  { id: 'pwa', label: 'PWA', summary: 'requires manifest, service worker, and icon assets before it is a real one-file starter', files: [] },
  { id: 'mobile', label: 'Mobile/touch optimized', summary: 'adds a touch-safe responsive baseline to the generated page', files: [] },
  { id: 'tv-tail', label: 'tv-tail logging', summary: 'adds SignalArgh channel wiring, log-tap setup, and a Telestrate pairing link', files: [] },
]);
const COMPOSER_ADDON_IDS = new Set(COMPOSER_ADDON_OPTIONS.map((option) => option.id));
const COMPOSER_DATA_SOURCE_OPTIONS = Object.freeze([
  { id: COMPOSER_DEFAULT_DATA_SOURCE_ID, label: 'None', summary: 'No sample data is generated.' },
  { id: 'ipzom', label: 'Sample data', summary: 'Fetches a deterministic Ipzom sample asset and renders it in the starter.' },
  { id: 'bring-own', label: 'Bring my own later', summary: 'Needs a deploy-time data.json asset before it is real.' },
]);
const COMPOSER_DATA_SOURCE_IDS = new Set(COMPOSER_DATA_SOURCE_OPTIONS.map((option) => option.id));
const COMPOSER_COPY_RESULT_LIMIT = 12;
const COMPOSER_TV_DEFAULT_MEDIA_BUNDLE_ID = 'milkshake';
const COMPOSER_TV_MEDIA_BUNDLES = Object.freeze([
  {
    id: COMPOSER_TV_DEFAULT_MEDIA_BUNDLE_ID,
    label: 'Milkshake',
    displayName: 'Red Velvet (레드벨벳) - Milkshake',
    videoPath: 'assets/videos/Milkshake.mp4',
    audioPath: 'assets/music/Milkshake.m4a',
    adImagePath: 'assets/ad-links/milkshake.png',
    brandImagePath: 'assets/images/walmart.png',
    accentStart: '#3d5af1',
    accentEnd: '#ffb703',
  },
]);
const COMPOSER_TV_MEDIA_BUNDLE_IDS = new Set(COMPOSER_TV_MEDIA_BUNDLES.map((bundle) => bundle.id));
const COMPOSER_TV_DEFAULT_CONFIG = Object.freeze({
  appTitle: 'TV App',
  launcherLabels: ['Launch', 'Browse', 'Featured', 'More'],
  nowPlayingLabel: 'Now Playing',
  adBadgeText: 'Delivery in under 60 minutes with Walmart',
  adBadgeEnabled: true,
  mediaBundleId: COMPOSER_TV_DEFAULT_MEDIA_BUNDLE_ID,
  tvTailEnabled: true,
});
const COMPOSER_TV_TAIL_TOPIC_STATE = 'sites.tv-tail.state';
const COMPOSER_TV_TAIL_TOPIC_COMMAND = 'sites.tv-tail.command';
const COMPOSER_TV_TAIL_LOG_TAP_URL = `https://tv-tail.${baseDomain()}/log-tap.js`;
const COMPOSER_TV_TAIL_TELESTRATE_URL = `https://telestrate.${baseDomain()}/`;
let DEVELOPMENT_CANON_VERSION = DEFAULT_SITE_PLATFORM.canon.version;
let DEVELOPMENT_CANON_DOCS = Object.freeze({ ...DEFAULT_SITE_PLATFORM.canon.docs });
const FULLSCREEN_PREVIEW_SOURCE_SNAPSHOT = 'snapshot';
const FULLSCREEN_PREVIEW_SOURCE_LIVE = 'live';
const PREVIEW_REFRESH_DEFAULTS = Object.freeze({
  width: 1024,
  height: 768,
  settleDelayMs: 5000,
  randomizeStyle: false,
});
const FULLSCREEN_LIVE_VIEWPORT_PRESETS = Object.freeze([
  { width: 1600, height: 1000 },
  { width: 1440, height: 900 },
  { width: 1280, height: 800 },
  { width: 1024, height: 640 },
]);
const PREVIEW_PLACEHOLDER_URL = buildPreviewPlaceholderUrl();
let ROOT_SITE_ID = DEFAULT_SITE_PLATFORM.siteIds.root;
let ALWAYS_PUBLIC_SITE_IDS = new Set(DEFAULT_SITE_PLATFORM.siteIds.alwaysPublic);
let RESERVED_COMPOSER_SITE_IDS = new Set(DEFAULT_SITE_PLATFORM.siteIds.reserved);
const PREVIEW_MANIFEST_PATH = './previews/manifest.json';
const REEL_EXPORT_DURATION_MS = 8000;
const REEL_EXPORT_FPS = 30;
const MANUAL_RANK_SAVE_DEBOUNCE_MS = 450;
const SLIDESHOW_INTERVAL_MS = 9000;
const SLIDESHOW_CHROME_HIDE_DELAY_MS = 3000;
const SLIDESHOW_FLASH_DURATION_MS = 1400;
const REVIEW_PAGE_SIZE = 12;
const TV_QUEUE_PAGE_SIZE = REVIEW_PAGE_SIZE;
const AUDIT_DECK_SIZE = REVIEW_PAGE_SIZE;
const AUDIT_REVISIT_OPTIONS = Object.freeze([
  { value: '', label: 'Auto' },
  { value: '1', label: 'Tomorrow' },
  { value: '2', label: '2 days' },
  { value: '7', label: '1 week' },
  { value: '14', label: '2 weeks' },
  { value: '30', label: '1 month' },
  { value: '90', label: '3 months' },
]);
const AUDIT_FILTER_REVIEW = 'review';
const AUDIT_FILTER_HAS_FEEDBACK = 'has-feedback';
const AUDIT_PREVIEW_SCALE_ACTUAL = 'actual';
const AUDIT_PREVIEW_SCALE_FIT = 'fit';
const AUDIT_FIT_VIEWPORT_WIDTH = 1440;
const AUDIT_FIT_VIEWPORT_HEIGHT = 900;
const DEFAULT_AUDIT_CRITIQUE_PRESETS = Object.freeze([
  {
    id: 'ui-canon-bugfix',
    label: 'UI canon + BUGFIX',
    text: 'Make this follow ui.mullmania.com exclusively. Report implementation errors to itchy-brain.mullmania.com in the BUGFIX room.',
  },
  {
    id: 'mobile-layout',
    label: 'Mobile layout',
    text: 'Fix mobile layout issues: no clipped controls, no overlapping text, and no horizontal scroll.',
  },
  {
    id: 'missing-proof',
    label: 'Missing proof',
    text: 'Add or refresh proof artifacts: screenshot/poster, health output, and live demo metadata.',
  },
  {
    id: 'copy-cleanup',
    label: 'Copy cleanup',
    text: 'Clean up page copy so the purpose, current state, and next action are obvious.',
  },
]);
const ACCESS_VERIFY_TIMEOUT_MS = 60000;
const ACCESS_VERIFY_INTERVAL_MS = 1500;
const ACCESS_JOB_MAX_AGE_MS = 10 * 60 * 1000;
const CATALOG_RESUME_REFRESH_MIN_INTERVAL_MS = 1500;
const SLIDESHOW_PLAYBACK_RANDOM = 'random';
const SLIDESHOW_PLAYBACK_SEQUENTIAL = 'sequential';
const SLIDESHOW_SCOPE_ALL = 'all';
const SLIDESHOW_SCOPE_TOP_50 = 'top-50';
const SLIDESHOW_TOP_LIMIT = 50;
const SLIDESHOW_NAV_RANDOM = 'random';
const SLIDESHOW_NAV_SORTED = 'sorted';
const SLIDESHOW_NAV_TOP_50 = 'top-50';
const SLIDESHOW_MOTION_DEFAULT = Object.freeze([
  { startScale: 1.08, endScale: 1.16, startX: '0%', endX: '0%', startY: '0%', endY: '0%', startRotate: '0deg', endRotate: '0deg' },
  { startScale: 1.18, endScale: 1.12, startX: '-5%', endX: '0%', startY: '-3%', endY: '0%', startRotate: '0deg', endRotate: '0deg' },
  { startScale: 1.18, endScale: 1.18, startX: '0%', endX: '-5%', startY: '0%', endY: '0%', startRotate: '0deg', endRotate: '0deg' },
  { startScale: 1.18, endScale: 1.18, startX: '0%', endX: '0%', startY: '0%', endY: '-5%', startRotate: '0deg', endRotate: '0deg' },
  { startScale: 1.16, endScale: 1.22, startX: '-4%', endX: '-1%', startY: '-2%', endY: '0%', startRotate: '-0.18deg', endRotate: '0.16deg' },
]);
const SLIDESHOW_MOTION_SHARED_UI = Object.freeze([
  { startScale: 1.18, endScale: 1.18, startX: '0%', endX: '-6%', startY: '0%', endY: '0%', startRotate: '0deg', endRotate: '0deg' },
  { startScale: 1.18, endScale: 1.18, startX: '0%', endX: '0%', startY: '0%', endY: '-6%', startRotate: '0deg', endRotate: '0deg' },
  { startScale: 1.22, endScale: 1.14, startX: '-6%', endX: '0%', startY: '-4%', endY: '0%', startRotate: '0deg', endRotate: '0deg' },
  { startScale: 1.16, endScale: 1.22, startX: '0%', endX: '-4%', startY: '0%', endY: '-2%', startRotate: '0deg', endRotate: '0deg' },
  { startScale: 1.18, endScale: 1.16, startX: '-5%', endX: '0%', startY: '0%', endY: '0%', startRotate: '-0.12deg', endRotate: '0deg' },
]);
const JSON_VIEW_MODE_TREE = 'tree';
const JSON_VIEW_MODE_RAW = 'raw';
const REEL_PALETTE = ['#ff5a4f', '#ffad14', '#86df00', '#11b8d7', '#7d5cff', '#ff4fb2'];
const NATURAL_TEXT_COLLATOR = new Intl.Collator(undefined, {
  numeric: true,
  sensitivity: 'base',
});
const DENSE_LIST_ROW_HEIGHT = 76;
const DENSE_LIST_ROW_HEIGHT_NARROW = 92;
const DENSE_LIST_OVERSCAN = 8;
const slideshowMediaPromises = new Map();
const manualRankSaveQueue = new Map();
const BULK_REFRESH_PIN_IMAGE_FILTER_EVENT = 'mullmania:bulk-refresh-pin-image-filter';
const BATCH_CATALOG_TAG_PATTERN = /^batch(\d+)$/;
const FILTER_ONLY_CATALOG_TAG_IDS = new Set(['public', 'private']);
const TAG_LABEL_TOKEN_OVERRIDES = new Map([
  ['github', 'GitHub'],
  ['ui', 'UI'],
]);
const ENTRY_MODIFIED_FIELDS = Object.freeze([
  { key: 'lastPublishedAt', label: 'Published' },
  { key: 'publishedAt', label: 'Published' },
  { key: 'siteAccessUpdatedAt', label: 'Access' },
  { key: 'siteAliasesUpdatedAt', label: 'Aliases' },
  { key: 'mainSiteUpdatedAt', label: 'Main site' },
  { key: 'manualRankUpdatedAt', label: 'Rank' },
  { key: 'operatorNoteUpdatedAt', label: 'Note' },
]);

const state = {
  entries: [],
  rawEntries: [],
  tagRegistry: [],
  rawSummary: null,
  summary: null,
  mainSiteId: ROOT_SITE_ID,
  mainSiteBusy: false,
  catalogMode: 'catalog',
  catalogSourceUrl: '',
  catalogRefreshedAt: 0,
  activeCatalogTagIds: new Set(),
  searchFields: new Set(DEFAULT_SEARCH_FIELD_IDS),
  sort: 'rank',
  search: '',
  selected: new Set(),
  rowMergeDrag: {
    sourceSiteId: '',
    targetSiteId: '',
  },
  familySelections: {},
  visibleEntries: [],
  visibleSiteEntries: [],
  lastSelectedSiteId: null,
  activeTableSiteId: null,
  previewObserver: null,
  previewManifest: {},
  previewBusy: new Set(),
  previewAutoEnsureTried: new Set(),
  fullscreenEntry: null,
  fullscreenMode: 'preview',
  fullscreenPreviewSource: FULLSCREEN_PREVIEW_SOURCE_SNAPSHOT,
  fullscreenTimeline: {
    siteId: '',
    commits: [],
    index: -1,
    loading: false,
    restoring: false,
    sourceRequestId: 0,
    snapshotCache: {},
    selectedSnapshot: null,
    headSha: '',
    historyStatus: '',
    cloudManaged: false,
    canRestore: false,
    restoreDisabledReason: '',
    statusMessage: '',
    statusTone: '',
  },
  fullscreenImageCarouselIndex: 0,
  viewMode: 'table',
  jsonViewMode: JSON_VIEW_MODE_TREE,
  jsonWrap: false,
  tablePage: 0,
  tablePageSize: DEFAULT_TABLE_PAGE_SIZE,
  tablePageSizeOptions: [25, DEFAULT_TABLE_PAGE_SIZE, 100, 250, TABLE_PAGE_SIZE_ALL],
  mobileListLimit: MOBILE_LIST_INITIAL_LIMIT,
  mobileWallLimit: MOBILE_WALL_INITIAL_LIMIT,
  flightDeckLimit: 12,
  flightDeckSectionPages: {},
  dependencies: {
    loaded: false,
    loading: false,
    saving: false,
    error: '',
    statusMessage: '',
    statusTone: '',
    selectedSiteId: '',
    nodeIds: new Set(),
    edges: [],
    positions: {},
    savedSignature: '',
    updatedAt: '',
    viewport: {
      x: 0,
      y: 0,
      scale: 1,
    },
    interaction: {
      mode: '',
      pointerId: 0,
      startX: 0,
      startY: 0,
      originX: 0,
      originY: 0,
      nodeOffsetX: 0,
      nodeOffsetY: 0,
      siteId: '',
    },
    graphRenderFrame: 0,
    pendingFullGraphRender: false,
    hasFit: false,
  },
  featureMatrix: {
    saved: null,
    draft: null,
    scope: FEATURE_MATRIX_SCOPE_VISIBLE,
    statusMessage: '',
    statusTone: '',
  },
  listScrollTop: 0,
  galleryPage: 0,
  galleryPageSize: 18,
  wallPage: 0,
  wallPageSize: 9,
  tvIndex: 0,
  tvPage: 0,
  tvPreviewScaleMode: AUDIT_PREVIEW_SCALE_ACTUAL,
  tvCastEntry: null,
  slideshowPlaybackMode: SLIDESHOW_PLAYBACK_RANDOM,
  slideshowScope: SLIDESHOW_SCOPE_ALL,
  slideshowController: null, // Set by UI.Screensaver.attach when the slideshow view mounts.
  slideshowControllerPending: false,
  // Legacy state fields kept null/empty for any stale reader; the canon
  // component owns queue/timer/layer/signature/broken-media tracking now.
  slideshowQueue: [],
  slideshowBrokenMedia: new Set(),
  slideshowCurrentSiteId: '',
  slideshowActiveLayer: 0,
  slideshowTimer: 0,
  slideshowSignature: '',
  slideshowChromeTimer: 0,
  slideshowFlashTimer: 0,
  slideshowShowRequestId: 0,
  config: {},
  shell: null,
  apiBaseUrl: '',
  liveCatalog: false,
  catalogError: '',
  pendingProtectedAction: null,
  swipeIndex: 0,
  swipeMode: false,
  tvReelBusy: false,
  rankBusy: new Set(),
  noteBusy: new Set(),
  tagBusy: new Set(),
  renameBusy: new Set(),
  accessBusy: new Set(),
  redeployBusy: new Set(),
  accessJobs: {},
  accessModalSiteId: '',
  rankModal: {
    siteId: '',
    draftRank: 0,
    statusMessage: '',
    statusTone: '',
  },
  aliasBusy: new Set(),
  displayNameBusy: new Set(),
  siteStateBusy: new Set(),
  deleteBusy: new Set(),
  notesBulkClearBusy: false,
  noteDraftTexts: {},
  noteDraftRanks: {},
  auditDeck: {
    queue: [],
    displayQueue: [],
    summary: null,
    generatedAt: '',
    batchSize: AUDIT_DECK_SIZE,
    pageIndex: 0,
    totalCount: 0,
    currentIndex: 0,
    filterMode: AUDIT_FILTER_REVIEW,
    previewScaleMode: AUDIT_PREVIEW_SCALE_ACTUAL,
    loading: false,
    savingSiteId: '',
    error: '',
    seed: '',
    drafts: {},
  },
  auditCritiquePresets: {
    presets: [...DEFAULT_AUDIT_CRITIQUE_PRESETS],
    loading: false,
    loaded: false,
    saving: false,
    error: '',
    updatedAt: '',
  },
  tagManager: {
    query: '',
    createLabel: '',
    editingTagId: '',
    editingLabel: '',
    draggingTagId: '',
    dropTargetTagId: '',
    busy: false,
    processing: false,
    pendingMutations: [],
    failedCount: 0,
    lastError: '',
  },
  catalogTagDrag: {
    tagId: '',
    targetSiteId: '',
  },
  fullscreenTagPicker: {
    open: false,
    query: '',
  },
  fullscreenSiteState: {
    siteId: '',
    initial: null,
    draft: null,
    statusMessage: '',
    statusTone: '',
    subdomainEditing: false,
    dismissedDirtySignature: '',
  },
  composer: {
    mode: 'blank',
    editorPane: 'html',
    busy: false,
    aiBusy: false,
    intentBusy: false,
    valetBusy: false,
    deleteArmedSiteId: '',
    intent: COMPOSER_INTENT_AUTHORING,
    intentRecord: null,
    loadRequestId: 0,
    loadedSiteId: '',
    loadingSource: false,
    recipeId: COMPOSER_DEFAULT_RECIPE_ID,
    draftPreset: COMPOSER_DRAFT_PRESET_STARTER,
    builderLocked: false,
    builderLockReason: '',
    starterSiteId: '',
    starterId: COMPOSER_DEFAULT_STARTER_ID,
    surfaceId: COMPOSER_DEFAULT_SURFACE_ID,
    addonIds: [],
    dataSourceId: COMPOSER_DEFAULT_DATA_SOURCE_ID,
    themeId: COMPOSER_DEFAULT_THEME_ID,
    tvFormFactor: false,
    copyQuery: '',
    copySourceSiteId: '',
    sourceFiles: [],
    history: {
      siteId: '',
      commits: [],
      index: -1,
      loading: false,
      sourceRequestId: 0,
      sourceCache: {},
    },
    tvConfig: {
      appTitle: COMPOSER_TV_DEFAULT_CONFIG.appTitle,
      launcherLabels: [...COMPOSER_TV_DEFAULT_CONFIG.launcherLabels],
      nowPlayingLabel: COMPOSER_TV_DEFAULT_CONFIG.nowPlayingLabel,
      adBadgeText: COMPOSER_TV_DEFAULT_CONFIG.adBadgeText,
      adBadgeEnabled: COMPOSER_TV_DEFAULT_CONFIG.adBadgeEnabled,
      mediaBundleId: COMPOSER_TV_DEFAULT_CONFIG.mediaBundleId,
    },
  },
  bulkRename: {
    rows: [],
    step: 'edit',
    sortKey: 'original',
    sortDirection: 'asc',
    started: false,
    running: false,
    finished: false,
    paused: false,
    progressIndex: 0,
    activeRowId: '',
    executionOrder: [],
    statusMessage: '',
    statusTone: '',
  },
  pinnedMissingImage: {
    search: '',
    filterKey: '',
    siteIds: new Set(),
  },
};

const reelImageCache = new Map();
let denseListRenderFrame = 0;
let catalogRefreshPromise = null;

const DEFAULT_VIEW_CONFIG = {
  table: { value: 'table', label: 'Table', icon: 'ti ti-table' },
  flightdeck: { value: 'flightdeck', label: 'Now', icon: 'ti ti-radar-2' },
  gallery: { value: 'gallery', label: 'Gallery', icon: 'ti ti-layout-grid' },
  tv: { value: 'tv', label: 'Showcase', icon: 'ti ti-device-tv' },
  features: { value: 'features', label: 'Features', icon: 'ti ti-checklist' },
  categorize: { value: 'categorize', label: 'Categorize', icon: 'ti ti-layout-kanban' },
  dependencies: { value: 'dependencies', label: 'Dependencies', icon: 'ti ti-graph' },
  audit: { value: 'audit', label: 'Review', icon: 'ti ti-clipboard-check' },
  swipe: { value: 'swipe', label: 'Focus', icon: 'ti ti-hand-finger' },
  slideshow: { value: 'slideshow', label: 'Slideshow', icon: 'ti ti-photo' },
  json: { value: 'json', label: 'JSON', icon: 'ti ti-braces' },
};

const mastheadBrandEl = document.getElementById('masthead-brand');
const mastheadSearchSlotEl = document.getElementById('masthead-search-slot');
const mastheadActionsEl = document.getElementById('masthead-actions');
const toolbarViewsEl = document.getElementById('toolbar-views');
const toolbarFiltersRowEl = document.getElementById('toolbar-filters-row');
const toolbarFiltersEl = document.getElementById('toolbar-filters');
const toolbarContextActionsEl = document.getElementById('toolbar-context-actions');
const toolbarContextSlotEl = document.getElementById('toolbar-context-slot');
const flightDeckViewEl = document.getElementById('flightdeck-view');
const flightDeckSectionsEl = document.getElementById('flightdeck-sections');
const dependenciesViewEl = document.getElementById('dependencies-view');
const dependenciesSourceCountEl = document.getElementById('dependencies-source-count');
const dependenciesSourceListEl = document.getElementById('dependencies-source-list');
const dependenciesSummaryEl = document.getElementById('dependencies-summary');
const dependenciesStatusEl = document.getElementById('dependencies-status');
const dependenciesLayoutButton = document.getElementById('dependencies-layout');
const dependenciesFitButton = document.getElementById('dependencies-fit');
const dependenciesResetButton = document.getElementById('dependencies-reset');
const dependenciesSaveButton = document.getElementById('dependencies-save');
const dependenciesGraphStageEl = document.getElementById('dependencies-graph-stage');
const dependenciesGraphEl = document.getElementById('dependencies-graph');
const dependenciesEmptyEl = document.getElementById('dependencies-empty');
const dependenciesDetailEl = document.getElementById('dependencies-detail');
const tableViewEl = document.getElementById('table-view');
const listViewEl = document.getElementById('list-view');
const galleryViewEl = document.getElementById('gallery-view');
const wallViewEl = document.getElementById('wall-view');
const tvViewEl = document.getElementById('tv-view');
const featureMatrixViewEl = document.getElementById('features-view');
const featureMatrixSummaryEl = document.getElementById('feature-matrix-summary');
const featureMatrixScopeEl = document.getElementById('feature-matrix-scope');
const featureMatrixSaveButton = document.getElementById('feature-matrix-save');
const featureMatrixResetButton = document.getElementById('feature-matrix-reset');
const featureMatrixCopyButton = document.getElementById('feature-matrix-copy');
const featureMatrixSeedButton = document.getElementById('feature-matrix-seed');
const featureMatrixStatusEl = document.getElementById('feature-matrix-status');
const featureMatrixTableHeadEl = document.getElementById('feature-matrix-head');
const featureMatrixTableBodyEl = document.getElementById('feature-matrix-body');
const featureMatrixSynopsisEl = document.getElementById('feature-matrix-synopsis');
const categorizeViewEl = document.getElementById('categorize-view');
const auditViewEl = document.getElementById('audit-view');
const auditQueueEl = document.getElementById('audit-queue');
const auditDeckEyebrowEl = document.getElementById('audit-deck-eyebrow');
const auditDeckTitleEl = document.getElementById('audit-deck-title');
const auditFilterTabsEl = document.getElementById('audit-filter-tabs');
const auditFilterButtons = Array.from(document.querySelectorAll('[data-audit-filter]'));
const auditFrameEl = document.getElementById('audit-frame');
const auditFrameStatusEl = document.getElementById('audit-frame-status');
const auditPreviewImageEl = document.getElementById('audit-preview-image');
const auditTitleEl = document.getElementById('audit-title');
const auditMetaEl = document.getElementById('audit-meta');
const auditDescriptionEl = document.getElementById('audit-description');
const auditNoteEl = document.getElementById('audit-note');
const auditAttachmentInputEl = document.getElementById('audit-attachment-input');
const auditAttachmentListEl = document.getElementById('audit-attachment-list');
const auditRankFieldEl = document.getElementById('audit-rank-field');
const auditRankEl = document.getElementById('audit-rank');
const auditPresetsListEl = document.getElementById('audit-presets-list');
const auditPresetsEditButton = document.getElementById('audit-presets-edit');
const auditPresetsModalEl = document.getElementById('audit-presets-modal');
const auditPresetsEditorEl = document.getElementById('audit-presets-editor');
const auditPresetsStatusEl = document.getElementById('audit-presets-status');
const auditPresetsSaveButton = document.getElementById('audit-presets-save');
const auditPresetsResetButton = document.getElementById('audit-presets-reset');
const auditPresetsAddButton = document.getElementById('audit-presets-add');
const auditSaveButton = document.getElementById('audit-save');
const auditResetFeedbackButton = document.getElementById('audit-reset-feedback');
const auditOpenButton = document.getElementById('audit-open');
const auditFullscreenButton = document.getElementById('audit-fullscreen');
const auditScaleToggleButton = document.getElementById('audit-scale-toggle');
const auditPrevButton = document.getElementById('audit-prev');
const auditNextButton = document.getElementById('audit-next');
const auditPageSummaryEl = document.getElementById('audit-page-summary');
const auditPageStatusEl = document.getElementById('audit-page');
const auditPagePrevButton = document.getElementById('audit-page-prev');
const auditPageNextButton = document.getElementById('audit-page-next');
const auditStatusMessageEl = document.getElementById('audit-status-message');
const slideshowViewEl = document.getElementById('slideshow-view');
const jsonViewEl = document.getElementById('json-view');
const tableBodyEl = document.getElementById('site-table-body');
const tablePageSummaryEl = document.getElementById('table-page-summary');
const tablePageEl = document.getElementById('table-page');
const tablePrevButton = document.getElementById('table-prev');
const tableNextButton = document.getElementById('table-next');
const tablePageSizeEl = document.getElementById('table-page-size');
const listScrollEl = document.getElementById('list-scroll');
const listViewportEl = document.getElementById('list-viewport');
const listSpacerEl = document.getElementById('list-spacer');
const listEmptyEl = document.getElementById('list-empty');
const listSummaryEl = document.getElementById('list-summary');
const galleryGridEl = document.getElementById('gallery-grid');
const galleryEmptyEl = document.getElementById('gallery-empty');
const galleryPageSummaryEl = document.getElementById('gallery-page-summary');
const galleryPageEl = document.getElementById('gallery-page');
const galleryPrevButton = document.getElementById('gallery-prev');
const galleryNextButton = document.getElementById('gallery-next');
const wallGridEl = document.getElementById('wall-grid');
const wallEmptyEl = document.getElementById('wall-empty');
const wallPageSummaryEl = document.getElementById('wall-page-summary');
const wallPageEl = document.getElementById('wall-page');
const wallPrevButton = document.getElementById('wall-prev');
const wallNextButton = document.getElementById('wall-next');
const tvEmptyEl = document.getElementById('tv-empty');
const tvLayoutEl = document.getElementById('tv-layout');
const tvPositionEl = document.getElementById('tv-position');
const tvModeEl = document.getElementById('tv-mode');
const tvPrevButton = document.getElementById('tv-prev');
const tvNextButton = document.getElementById('tv-next');
const tvItemPrevButton = document.getElementById('tv-item-prev');
const tvItemNextButton = document.getElementById('tv-item-next');
const tvSlideshowButton = document.getElementById('tv-slideshow');
const tvDetailsButton = document.getElementById('tv-details');
const tvFeedbackButton = document.getElementById('tv-feedback');
const tvScaleToggleButton = document.getElementById('tv-scale-toggle');
const tvExportButton = document.getElementById('tv-export');
const tvVideoEl = document.getElementById('tv-video');
const tvImageEl = document.getElementById('tv-image');
const tvFrameEl = document.getElementById('tv-frame');
const tvExportCanvasEl = document.getElementById('tv-export-canvas');
const tvTitleEl = document.getElementById('tv-title');
const tvVersionShellEl = document.querySelector('.tv-sidebar__version-switcher');
const tvVersionLabelEl = document.getElementById('tv-version-label');
const tvVersionPrevButton = document.getElementById('tv-version-prev');
const tvVersionNextButton = document.getElementById('tv-version-next');
const tvHostEl = document.getElementById('tv-host');
const tvDescriptionEl = document.getElementById('tv-description');
const tvQueueSummaryEl = document.getElementById('tv-queue-summary');
const tvPageSummaryEl = document.getElementById('tv-page-summary');
const tvPageEl = document.getElementById('tv-page');
const tvQueueEl = document.getElementById('tv-queue');
const slideshowEmptyEl = document.getElementById('slideshow-empty');
const slideshowStageEl = document.getElementById('slideshow-stage');
const slideshowSlideEls = Array.from(document.querySelectorAll('[data-slideshow-layer]'));
const slideshowRankBadgeEl = document.getElementById('slideshow-rank-badge');
const slideshowEyebrowEl = document.getElementById('slideshow-eyebrow');
const slideshowTitleEl = document.getElementById('slideshow-title');
const slideshowTitleMainEl = document.getElementById('slideshow-title-main');
const slideshowTitleTailEl = document.getElementById('slideshow-title-tail');
const slideshowTitleTailWordEl = document.getElementById('slideshow-title-tail-word');
const slideshowTitleDomainEl = document.getElementById('slideshow-title-domain');
const slideshowPositionBadgeEl = document.getElementById('slideshow-position-badge');
const slideshowModeFlashEl = document.getElementById('slideshow-mode-flash');
const jsonSummaryEl = document.getElementById('json-summary');
const jsonContentEl = document.getElementById('json-content');
const jsonModeButtons = Array.from(document.querySelectorAll('[data-json-mode]'));
const jsonWrapToggleButton = document.getElementById('json-wrap-toggle');
const jsonCopyButton = document.getElementById('json-copy');
let pageSummaryEl = document.getElementById('page-summary') || null;
const viewSummaryEl = document.getElementById('view-summary');
let searchEl = document.getElementById('search') || null;
let searchClearButton = document.getElementById('search-clear') || null;
let openNewSiteButton = document.getElementById('open-new-site') || null;
let openSettingsButton = document.getElementById('open-settings') || null;
let cycleViewButton = document.getElementById('cycle-view') || null;
const selectVisibleButton = document.getElementById('select-visible');
const clearSelectionButton = document.getElementById('clear-selection');
const copySelectedIdsButton = document.getElementById('copy-selected-ids');
const copySelectedPromptButton = document.getElementById('copy-selected-prompt');
const openBulkRenameButton = document.getElementById('open-bulk-rename');
const selectAllVisibleCheckbox = document.getElementById('select-all-visible');
const rowTemplate = document.getElementById('site-row-template');
const denseListRowTemplate = document.getElementById('dense-list-row-template');
const galleryCardTemplate = document.getElementById('gallery-card-template');
const wallCardTemplate = document.getElementById('wall-card-template');
const tvQueueCardTemplate = document.getElementById('tv-queue-card-template');
let viewButtons = Array.from(document.querySelectorAll('[data-view]'));
const fullscreenModalEl = document.getElementById('fullscreen-modal');
const fullscreenTitleEl = document.getElementById('fullscreen-title');
const fullscreenHostEl = document.getElementById('fullscreen-host');
const fullscreenRenameShellEl = document.getElementById('fullscreen-rename-shell');
const fullscreenSiteLinkEl = document.getElementById('fullscreen-site-link');
const fullscreenSiteSelectEl = document.getElementById('fullscreen-site-select');
const fullscreenRenameInputEl = document.getElementById('fullscreen-site-id');
const fullscreenRenameStatusEl = document.getElementById('fullscreen-rename-status');
const fullscreenRenameSaveButton = document.getElementById('fullscreen-rename-save');
const fullscreenDomainSuffixEl = document.getElementById('fullscreen-domain-suffix');
const fullscreenUnsavedNoticeEl = document.getElementById('fullscreen-unsaved-notice');
const fullscreenUnsavedDismissButton = document.getElementById('fullscreen-unsaved-dismiss');
const fullscreenQrButtonEl = document.getElementById('fullscreen-qr-button');
const fullscreenQrIconEl = document.getElementById('fullscreen-qr-icon');
const fullscreenQrLabelEl = document.getElementById('fullscreen-qr-label');
const fullscreenLiveToggleButton = document.getElementById('fullscreen-live-toggle');
const fullscreenQrStageEl = document.getElementById('fullscreen-qr-stage');
const fullscreenQrStageLabelEl = document.getElementById('fullscreen-qr-stage-label');
const fullscreenQrStageCanvasEl = document.getElementById('fullscreen-qr-stage-canvas');
const fullscreenQrStageUrlEl = document.getElementById('fullscreen-qr-stage-url');
const fullscreenStageEl = document.querySelector('.fullscreen-modal__stage');
const fullscreenPreviewLoadingEl = document.getElementById('fullscreen-preview-loading');
const fullscreenPrevButton = document.getElementById('fullscreen-prev');
const fullscreenNextButton = document.getElementById('fullscreen-next');
const fullscreenEditButton = document.getElementById('fullscreen-edit');
const fullscreenVscodeButton = document.getElementById('fullscreen-vscode');
const fullscreenUseAppButton = document.getElementById('fullscreen-use-app');
const fullscreenDeleteButton = document.getElementById('fullscreen-delete');
const fullscreenMainButton = document.getElementById('fullscreen-main');
const fullscreenTvCastButton = document.getElementById('fullscreen-tv-cast');
const fullscreenRedeployButton = document.getElementById('fullscreen-redeploy');
const fullscreenNoteButton = document.getElementById('fullscreen-note');
const fullscreenSiteStateSaveButton = document.getElementById('fullscreen-site-state-save');
const fullscreenWhitelistButton = document.getElementById('fullscreen-whitelist');
const fullscreenRefreshButton = document.getElementById('fullscreen-refresh');
const fullscreenFooterStatusEl = document.getElementById('fullscreen-footer-status');
const fullscreenVideoEl = document.getElementById('fullscreen-video');
const fullscreenImageShellEl = document.getElementById('fullscreen-image-shell');
const fullscreenImageLeftCardEl = document.getElementById('fullscreen-image-left-card');
const fullscreenImageLeftEl = document.getElementById('fullscreen-image-left');
const fullscreenImageEl = document.getElementById('fullscreen-image');
const fullscreenImageRightCardEl = document.getElementById('fullscreen-image-right-card');
const fullscreenImageRightEl = document.getElementById('fullscreen-image-right');
const fullscreenLiveShellEl = document.getElementById('fullscreen-live-shell');
const fullscreenFrameEl = document.getElementById('fullscreen-frame');
const fullscreenTimelineDockEl = document.getElementById('fullscreen-timeline-dock');
const fullscreenTimelineSliderEl = document.getElementById('fullscreen-timeline-slider');
const fullscreenTimelinePickerEl = document.getElementById('fullscreen-timeline-picker');
const fullscreenTimelineSelectEl = document.getElementById('fullscreen-timeline-select');
const fullscreenTimelineLabelEl = document.getElementById('fullscreen-timeline-label');
const fullscreenTimelineCountEl = document.getElementById('fullscreen-timeline-count');
const fullscreenTimelineStatusEl = document.getElementById('fullscreen-timeline-status');
const fullscreenTimelineRestoreButton = document.getElementById('fullscreen-timeline-restore');
const fullscreenPropertiesDockEl = document.getElementById('fullscreen-properties-dock');
const fullscreenTagsDockEl = document.getElementById('fullscreen-tags-dock');
const fullscreenTagToggleButton = document.getElementById('fullscreen-tag-toggle');
const fullscreenTagsListEl = document.getElementById('fullscreen-tags-list');
const fullscreenTagPickerEl = document.getElementById('fullscreen-tag-picker');
const fullscreenTagSearchEl = document.getElementById('fullscreen-tag-search');
const fullscreenTagPickerListEl = document.getElementById('fullscreen-tag-picker-list');
const fullscreenTagStatusEl = document.getElementById('fullscreen-tag-status');
const fullscreenFriendlyNameInputEl = document.getElementById('fullscreen-friendly-name');
const fullscreenFriendlyNameStatusEl = document.getElementById('fullscreen-friendly-name-status');
const fullscreenFriendlyNameSaveButton = document.getElementById('fullscreen-friendly-name-save');
const fullscreenAliasesInputEl = document.getElementById('fullscreen-aliases');
const fullscreenAliasesStatusEl = document.getElementById('fullscreen-aliases-status');
const fullscreenAliasesSaveButton = document.getElementById('fullscreen-aliases-save');
const fullscreenRankInputEl = document.getElementById('fullscreen-rank-input');
const fullscreenRankSaveButton = document.getElementById('fullscreen-rank-save');
const accessModalEl = document.getElementById('access-modal');
const accessModalPanelEl = accessModalEl?.querySelector('.access-modal__panel') ?? null;
const accessModalIconEl = document.getElementById('access-modal-icon');
const accessModalTitleEl = document.getElementById('access-modal-title');
const accessModalHostEl = document.getElementById('access-modal-host');
const accessModalPreviewEl = document.getElementById('access-modal-preview');
const accessModalSummaryEl = document.getElementById('access-modal-summary');
const accessModalStatusEl = document.getElementById('access-modal-status');
const accessModalConfirmButton = document.getElementById('access-modal-confirm');
const accessModalCancelButton = document.getElementById('access-modal-cancel');
const rankModalEl = document.getElementById('rank-modal');
const rankModalPanelEl = rankModalEl?.querySelector('.rank-modal__panel') ?? null;
const rankModalIconEl = document.getElementById('rank-modal-icon');
const rankModalTitleEl = document.getElementById('rank-modal-title');
const rankModalHostEl = document.getElementById('rank-modal-host');
const rankModalCurrentEl = document.getElementById('rank-modal-current');
const rankModalPositionEl = document.getElementById('rank-modal-position');
const rankModalInputEl = document.getElementById('rank-modal-input');
const rankModalNeighborsEl = document.getElementById('rank-modal-neighbors');
const rankModalStatusEl = document.getElementById('rank-modal-status');
const rankModalSaveButton = document.getElementById('rank-modal-save');
const tvCastModalEl = document.getElementById('tv-cast-modal');
const tvCastModalPanelEl = tvCastModalEl?.querySelector('.tv-cast-modal__panel') ?? null;
const tvCastSiteEl = document.getElementById('tv-cast-site');
const tvCastEmptyEl = document.getElementById('tv-cast-empty');
const tvCastListEl = document.getElementById('tv-cast-list');
const tvCastStatusEl = document.getElementById('tv-cast-status');
const vscodeModalEl = document.getElementById('vscode-modal');
const vscodeModalPanelEl = vscodeModalEl?.querySelector('.vscode-modal__panel') ?? null;
const vscodeModalHostLinkEl = document.getElementById('vscode-modal-host-link');
const vscodeModalPreviewEl = document.getElementById('vscode-modal-preview');
const vscodeModalDownloadEl = document.getElementById('vscode-modal-download');
const vscodeModalOpenLinkEl = document.getElementById('vscode-modal-open-link');
const vscodeModalCommandEl = document.getElementById('vscode-modal-command');
const vscodeModalCopyCommandButton = document.getElementById('vscode-modal-copy-command');
const vscodeModalStatusEl = document.getElementById('vscode-modal-status');
const notesModalEl = document.getElementById('notes-modal');
const notesSummaryEl = document.getElementById('notes-summary');
const notesContextEl = document.getElementById('notes-context');
const notesListEl = document.getElementById('notes-list');
const notesClearVisibleButton = document.getElementById('notes-clear-visible');
const notesCopyJsonButton = document.getElementById('notes-copy-json');
const notesCopyCsvButton = document.getElementById('notes-copy-csv');
const tagManagerModalEl = document.getElementById('tag-manager-modal');
const tagManagerPanelEl = tagManagerModalEl?.querySelector('.tag-manager-modal__panel') ?? null;
const tagManagerSummaryEl = document.getElementById('tag-manager-summary');
const tagManagerCreateInputEl = document.getElementById('tag-manager-create-input');
const tagManagerCreateButton = document.getElementById('tag-manager-create');
const tagManagerCreateShellEl = tagManagerCreateInputEl?.closest('.tag-manager-modal__create') ?? null;
const tagManagerStatusEl = document.getElementById('tag-manager-status');
const tagManagerListEl = document.getElementById('tag-manager-list');
const bulkRenameModalEl = document.getElementById('bulk-rename-modal');
const bulkRenamePanelEl = bulkRenameModalEl?.querySelector('.bulk-rename-modal__panel') ?? null;
const bulkRenameSummaryEl = document.getElementById('bulk-rename-summary');
const bulkRenameProgressEl = document.getElementById('bulk-rename-progress');
const bulkRenameTableBodyEl = document.getElementById('bulk-rename-table-body');
const bulkRenameStatusEl = document.getElementById('bulk-rename-status');
const bulkRenameOriginalHeaderEl = document.getElementById('bulk-rename-original-header');
const bulkRenameFriendlyHeaderEl = document.getElementById('bulk-rename-friendly-header');
const bulkRenameNewHeaderEl = document.getElementById('bulk-rename-new-header');
const bulkRenameSortOriginalButton = document.getElementById('bulk-rename-sort-original');
const bulkRenameSortFriendlyButton = document.getElementById('bulk-rename-sort-friendly');
const bulkRenameSortNewButton = document.getElementById('bulk-rename-sort-new');
const bulkRenameCancelButton = document.getElementById('bulk-rename-cancel');
const bulkRenameBackButton = document.getElementById('bulk-rename-back');
const bulkRenameNextButton = document.getElementById('bulk-rename-next');
const bulkRenameStartButton = document.getElementById('bulk-rename-start');
const bulkRenameCloseActionButton = document.getElementById('bulk-rename-close-action');
const noteModalEl = document.getElementById('note-modal');
const noteSiteLabelEl = document.getElementById('note-site-label');
const notePreviewButton = document.getElementById('note-preview-button');
const notePreviewImageEl = document.getElementById('note-preview-image');
const noteSiteLinkEl = document.getElementById('note-site-link');
const noteSiteMetaEl = document.getElementById('note-site-meta');
const noteSiteSummaryEl = document.getElementById('note-site-summary');
const notePresetsListEl = document.getElementById('note-presets-list');
const notePresetsEditButton = document.getElementById('note-presets-edit');
const noteTextEl = document.getElementById('note-text');
const noteStatusEl = document.getElementById('note-status');
const noteClearButton = document.getElementById('note-clear');
const noteSaveButton = document.getElementById('note-save');
const settingsModalEl = document.getElementById('settings-modal');
const settingsPanelEl = settingsModalEl?.querySelector('.settings-modal__panel') ?? null;
const settingsOperatorKeyEl = document.getElementById('settings-operator-key');
const settingsRememberKeyEl = document.getElementById('settings-remember-key');
const settingsStatusEl = document.getElementById('settings-status');
const settingsClearKeyButton = document.getElementById('settings-clear-key');
const settingsSubmitButton = document.getElementById('settings-submit');
const settingsStyleComboboxEl = document.getElementById('settings-style-combobox');
const settingsStyleButtonEl = document.getElementById('settings-style-button');
const settingsStyleLabelEl = document.getElementById('settings-style-label');
const settingsStyleListEl = document.getElementById('settings-style-options');
const composerModalEl = document.getElementById('composer-modal');
const composerTitleEl = document.getElementById('composer-title');
const composerDescriptionEl = document.getElementById('composer-description');
const composerVscodeButton = document.getElementById('composer-vscode');
const composerSiteIdEl = document.getElementById('composer-site-id');
const composerSiteIdStatusEl = document.getElementById('composer-site-id-status');
const composerHtmlEl = document.getElementById('composer-html');
const composerCssEl = document.getElementById('composer-css');
const composerJsEl = document.getElementById('composer-js');
const composerPreviewEl = document.getElementById('composer-preview');
const composerBlankPanelEl = document.getElementById('composer-blank-panel');
const composerEditorPanelEl = document.getElementById('composer-editor-panel');
const composerStarterSummaryEl = document.getElementById('composer-starter-summary');
const composerBuilderLockEl = document.getElementById('composer-builder-lock');
const composerBuilderLockCopyEl = document.getElementById('composer-builder-lock-copy');
const composerBuilderResetButton = document.getElementById('composer-builder-reset');
const composerIntentPromptEl = document.getElementById('composer-intent-prompt');
const composerIntentPlanButton = document.getElementById('composer-intent-plan');
const composerIntentSummaryEl = document.getElementById('composer-intent-summary');
const composerThemeFieldEl = document.getElementById('composer-theme-field');
const composerThemeSelectEl = document.getElementById('composer-theme-select');
const composerFlatStarterButtons = Array.from(document.querySelectorAll('[data-composer-flat-starter]'));
const composerTvFormFactorCheckboxEl = document.getElementById('composer-tv-form-factor');
const composerRecipeButtons = Array.from(document.querySelectorAll('[data-composer-recipe]'));
const composerRecipePanels = Array.from(document.querySelectorAll('[data-composer-recipe-panel]'));
const composerSurfaceButtons = Array.from(document.querySelectorAll('[data-composer-surface]'));
const composerAddonButtons = Array.from(document.querySelectorAll('[data-composer-addon]'));
const composerDataSourceButtons = Array.from(document.querySelectorAll('[data-composer-data-source]'));
const composerPlanSummaryEl = document.getElementById('composer-plan-summary');
const composerPlanListEl = document.getElementById('composer-plan-list');
const composerTvAppTitleEl = document.getElementById('composer-tv-app-title');
const composerTvMediaBundleEl = document.getElementById('composer-tv-media-bundle');
const composerTvLaunchEls = [
  document.getElementById('composer-tv-launch-1'),
  document.getElementById('composer-tv-launch-2'),
  document.getElementById('composer-tv-launch-3'),
  document.getElementById('composer-tv-launch-4'),
];
const composerTvNowPlayingLabelEl = document.getElementById('composer-tv-now-playing-label');
const composerTvAdBadgeTextEl = document.getElementById('composer-tv-ad-badge-text');
const composerTvAdBadgeEnabledEl = document.getElementById('composer-tv-ad-badge-enabled');
const composerTvTailEnabledEl = document.getElementById('composer-tv-tail-enabled');
const composerCopySearchEl = document.getElementById('composer-copy-search');
const composerCopyResultsEl = document.getElementById('composer-copy-results');
const composerCopySelectedEl = document.getElementById('composer-copy-selected');
const composerCopyPreviewImageEl = document.getElementById('composer-copy-preview-image');
const composerCopyPreviewTitleEl = document.getElementById('composer-copy-preview-title');
const composerCopyPreviewHostEl = document.getElementById('composer-copy-preview-host');
const composerCopyPreviewDescriptionEl = document.getElementById('composer-copy-preview-description');
const composerCopyVariantsEl = document.getElementById('composer-copy-variants');
const composerCopyPreviewNoteEl = document.getElementById('composer-copy-preview-note');
const composerStatusEl = document.getElementById('composer-status');
const composerDeleteToggleButton = document.getElementById('composer-delete-toggle');
const composerSubmitButton = document.getElementById('composer-submit');
const composerTabButtons = Array.from(document.querySelectorAll('[data-composer-tab]'));
const composerStarterButtons = Array.from(document.querySelectorAll('[data-composer-starter]'));
const composerEditorPaneButtons = Array.from(document.querySelectorAll('[data-composer-editor-pane]'));
const composerEditorFileButtons = Array.from(document.querySelectorAll('[data-composer-editor-file]'));
const composerEditorPanePanels = Array.from(document.querySelectorAll('[data-composer-editor-pane-panel]'));
const composerAiPromptEl = document.getElementById('composer-ai-prompt');
const composerAiAssistButton = document.getElementById('composer-ai-assist');
const composerValetAssistButton = document.getElementById('composer-valet-assist');
const composerHistoryEl = document.getElementById('composer-history');
const composerHistorySliderEl = document.getElementById('composer-history-slider');
const composerHistoryLabelEl = document.getElementById('composer-history-label');
const composerHistoryCountEl = document.getElementById('composer-history-count');
const selectAllVisibleCheckboxIcon = document.querySelector('.table-checkbox__icon--select-all');

let previewDebounce = null;
let fullscreenQrStageCode = null;
let fullscreenLiveViewportSyncFrame = 0;
let tagManagerMutationFlushPromise = null;
let tagManagerMutationSequence = 0;
const derivedTagRegistryCache = {
  managedEntries: null,
  managedEntryMap: null,
  catalogEntries: null,
  filterEntries: null,
  tagManagerEntries: null,
};

init().catch((error) => {
  console.error(error);
  renderStartupError('Sites could not start', error.message || String(error));
});

function markLaunchpadBootReady() {
  document.documentElement.classList.remove('launchpad-preboot');
  document.documentElement.classList.add('launchpad-booted');
}

async function init() {
  await loadSitePlatformContract();
  restoreFeatureMatrixState();
  applyStoredAppStyle();
  state.galleryPageSize = calculateGalleryPageSize();
  state.wallPageSize = calculateWallPageSize();
  clearDeprecatedClientState();
  restoreAccessJobs();
  if (fullscreenDomainSuffixEl) {
    fullscreenDomainSuffixEl.textContent = `.${BASE_DOMAIN}`;
  }
  restoreStoredView();
  restoreSearchFields();
  applyUrlStateOverrides();
  await loadShell();
  configurePaginationFromShell();
  renderShell();
  await loadConfig();
  await loadPreviewManifest();
  populateTablePageSizeOptions();
  syncComposerEntryPoints();
  bindEvents();
  installTestHooks();
  installBulkRefreshBridge();
  setComposerEditorPane(state.composer.editorPane);
  syncComposerStarterControls();
  restoreOperatorKey();
  syncViewButtons();
  await refreshCatalog();
  markLaunchpadBootReady();
  resumeStoredAccessJobs();
  if (state.swipeMode) {
    initSwipeView();
  }
  applyAutoCompose();
}

async function loadSitePlatformContract() {
  let contract = DEFAULT_SITE_PLATFORM;
  try {
    contract = await fetchJson('./site-platform.json');
  } catch (error) {
    console.warn('[sites] site-platform.json unavailable; using bundled platform defaults.', error);
  }
  try {
    applySitePlatformContract(contract);
  } catch (error) {
    console.warn('[sites] site-platform.json invalid; using bundled platform defaults.', error);
    applySitePlatformContract(DEFAULT_SITE_PLATFORM);
  }
}

function applySitePlatformContract(contract) {
  if (!contract || typeof contract !== 'object') {
    throw new Error('site-platform.json is not a JSON object.');
  }

  sitePlatform = {
    ...DEFAULT_SITE_PLATFORM,
    ...contract,
    canon: {
      ...DEFAULT_SITE_PLATFORM.canon,
      ...(contract.canon || {}),
      docs: {
        ...DEFAULT_SITE_PLATFORM.canon.docs,
        ...(contract.canon?.docs || {}),
      },
    },
    siteIds: {
      ...DEFAULT_SITE_PLATFORM.siteIds,
      ...(contract.siteIds || {}),
    },
    featureFacets: normalizeFeatureMatrixFacets(contract.featureFacets, DEFAULT_SITE_PLATFORM.featureFacets),
    ui: {
      ...DEFAULT_SITE_PLATFORM.ui,
      ...(contract.ui || {}),
      themeLabels: {
        ...DEFAULT_SITE_PLATFORM.ui.themeLabels,
        ...(contract.ui?.themeLabels || {}),
      },
    },
  };

  BASE_DOMAIN = normalizePlatformString(sitePlatform.baseDomain, DEFAULT_SITE_PLATFORM.baseDomain);
  if (typeof window !== 'undefined') {
    window.__baseDomain = BASE_DOMAIN;
  }

  ROOT_SITE_ID = normalizePlatformString(sitePlatform.siteIds.root, DEFAULT_SITE_PLATFORM.siteIds.root);
  ALWAYS_PUBLIC_SITE_IDS = new Set(normalizePlatformStringList(sitePlatform.siteIds.alwaysPublic, DEFAULT_SITE_PLATFORM.siteIds.alwaysPublic));
  RESERVED_COMPOSER_SITE_IDS = new Set(normalizePlatformStringList(sitePlatform.siteIds.reserved, DEFAULT_SITE_PLATFORM.siteIds.reserved));

  CATEGORY_TAG_DEFINITIONS = Object.freeze(normalizeCategoryTagDefinitions(sitePlatform.categoryTags, DEFAULT_SITE_PLATFORM.categoryTags));
  CATEGORY_BOARD_TAG_IDS = new Set(CATEGORY_TAG_DEFINITIONS.map((tag) => tag.id));
  CATEGORY_TAG_LABEL_BY_ID = new Map(CATEGORY_TAG_DEFINITIONS.map((tag) => [tag.id, tag.label]));
  CATEGORY_TAG_ALIAS_BY_ID = new Map(CATEGORY_TAG_DEFINITIONS.flatMap((tag) => (
    [tag.id, ...tag.aliases].map((alias) => [alias, tag.id])
  )));
  FEATURE_MATRIX_FACETS = Object.freeze(normalizeFeatureMatrixFacets(sitePlatform.featureFacets, DEFAULT_SITE_PLATFORM.featureFacets));

  const themeIds = normalizePlatformStringList(sitePlatform.ui.themeIds, DEFAULT_SITE_PLATFORM.ui.themeIds)
    .filter((themeId) => themeId !== APP_STYLE_DEFAULT_ID);
  COMPOSER_THEME_OPTIONS = Object.freeze(themeIds.map((themeId) => ({
    id: themeId,
    label: normalizePlatformString(sitePlatform.ui.themeLabels?.[themeId], humanizeToken(themeId)),
  })));
  COMPOSER_THEME_IDS = new Set(COMPOSER_THEME_OPTIONS.map((option) => option.id));
  APP_STYLE_OPTIONS = Object.freeze([
    { id: APP_STYLE_DEFAULT_ID, label: 'Published default' },
    ...COMPOSER_THEME_OPTIONS,
  ]);
  APP_STYLE_IDS = new Set(APP_STYLE_OPTIONS.map((option) => option.id));

  DEVELOPMENT_CANON_VERSION = normalizePlatformString(sitePlatform.canon.version, DEFAULT_SITE_PLATFORM.canon.version);
  DEVELOPMENT_CANON_DOCS = Object.freeze({
    ...DEFAULT_SITE_PLATFORM.canon.docs,
    ...(sitePlatform.canon.docs || {}),
  });
}

function normalizePlatformString(value, fallback = '') {
  return String(value || '').trim() || fallback;
}

function normalizePlatformStringList(value, fallback = []) {
  const source = Array.isArray(value) ? value : fallback;
  return source.map((item) => String(item || '').trim()).filter(Boolean);
}

function normalizeCategoryTagDefinitions(value, fallback = []) {
  const source = Array.isArray(value) ? value : fallback;
  const normalized = source
    .map((item) => ({
      id: String(item?.id || '').trim(),
      label: String(item?.label || '').trim(),
      aliases: normalizePlatformStringList(item?.aliases, []),
    }))
    .filter((item) => item.id && item.label);
  if (normalized.length > 0 || source === fallback) {
    return normalized;
  }
  return normalizeCategoryTagDefinitions(fallback, []);
}

function normalizeFeatureMatrixFacets(value, fallback = []) {
  const source = Array.isArray(value) ? value : fallback;
  const seen = new Set();
  const normalized = [];
  for (const item of source) {
    const id = normalizeCatalogToken(item?.id || item?.label || '');
    const label = String(item?.label || '').trim();
    if (!id || !label || seen.has(id)) {
      continue;
    }
    seen.add(id);
    normalized.push({
      id,
      label,
      shortLabel: String(item?.shortLabel || label).trim() || label,
      rule: String(item?.rule || '').trim(),
    });
  }
  if (normalized.length > 0 || source === fallback) {
    return normalized;
  }
  return normalizeFeatureMatrixFacets(fallback, []);
}

function renderStartupError(title, message) {
  markLaunchpadBootReady();
  document.body.className = '';
  document.body.innerHTML = `
    <main class="launchpad-error-shell">
      <section class="card launchpad-error-card">
        <span class="badge badge-primary">Mullmania</span>
        <h1>${escapeHtml(title)}</h1>
        <p>${escapeHtml(message)}</p>
      </section>
    </main>`;
}

function installTestHooks() {
  if (typeof window === 'undefined') {
    return;
  }

  if (!['127.0.0.1', 'localhost'].includes(window.location.hostname)) {
    return;
  }

  window.__launchpadTestHooks = {
    openComposerForCreate: () => openComposerForCreate(),
    openComposerForEdit: (siteId) => openComposerForEdit(siteId),
    openFullscreenForSite: (siteId) => {
      const entry = findEntryBySiteId(siteId);
      return entry ? openFullscreenPreview(entry) : false;
    },
    setViewMode: (nextView) => setViewMode(nextView),
  };
}

function installBulkRefreshBridge() {
  if (typeof window === 'undefined') {
    return;
  }

  window.__launchpadBulkRefresh = {
    canRefreshSite(siteId) {
      const entry = findEntryBySiteId(siteId);
      return Boolean(
        entry
        && state.apiBaseUrl
        && !state.previewBusy.has(entry.siteId)
        && entry.url
        && canMutateEntry(entry)
      );
    },
    hasPreview(siteId) {
      return Boolean(getPreviewUrl(siteId));
    },
    async refreshSitePreview(siteId, captureOptions = {}) {
      const entry = findEntryBySiteId(siteId);
      if (!entry) {
        throw new Error(`Site ${siteId} was not found.`);
      }

      const preview = await refreshPreviewForEntry(entry, captureOptions.force !== false, null, captureOptions);
      if (!preview) {
        throw new Error(`Preview refresh failed for ${siteId}.`);
      }
      return preview;
    },
  };
}

function getRepresentedSiteIds(entry) {
  const members = Array.isArray(entry?.familyMembers) && entry.familyMembers.length > 0
    ? entry.familyMembers
    : [entry];
  const siteIds = [];

  for (const member of members) {
    const siteId = normalizeSiteId(member?.siteId);
    if (siteId && !siteIds.includes(siteId)) {
      siteIds.push(siteId);
    }
  }

  return siteIds;
}

function syncBulkRefreshMetadata(element, entry) {
  if (!element) {
    return;
  }

  element.dataset.refreshSiteIds = getRepresentedSiteIds(entry).join(',');
}

function getPinnedMissingImageFilterKey() {
  return getActiveCatalogTagIds().slice().sort(compareNaturalText).join(',');
}

function clearPinnedMissingImageTargets() {
  state.pinnedMissingImage.search = '';
  state.pinnedMissingImage.filterKey = '';
  state.pinnedMissingImage.siteIds.clear();
}

function pinMissingImageTargets(siteIds) {
  if (!normalizeSearchTerms(state.search).requireMissingImage) {
    clearPinnedMissingImageTargets();
    return;
  }

  state.pinnedMissingImage.search = state.search;
  state.pinnedMissingImage.filterKey = getPinnedMissingImageFilterKey();
  state.pinnedMissingImage.siteIds = new Set(
    (Array.isArray(siteIds) ? siteIds : [])
      .map((siteId) => normalizeSiteId(siteId))
      .filter(Boolean)
  );
}

function isPinnedMissingImageSite(siteId) {
  const normalizedSiteId = normalizeSiteId(siteId);
  if (!normalizedSiteId || state.pinnedMissingImage.siteIds.size === 0) {
    return false;
  }

  if (state.pinnedMissingImage.search !== state.search) {
    return false;
  }

  if (state.pinnedMissingImage.filterKey !== getPinnedMissingImageFilterKey()) {
    return false;
  }

  return state.pinnedMissingImage.siteIds.has(normalizedSiteId);
}

function handleBulkRefreshPinImageFilter(event) {
  pinMissingImageTargets(event?.detail?.siteIds);
  render();
}

function buildPreviewPlaceholderUrl() {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 360" role="img" aria-label="Preview unavailable"><rect width="640" height="360" fill="#eef2f6"/><rect x="80" y="64" width="480" height="232" rx="20" fill="#dde5ee" stroke="#c3cfdb" stroke-width="8"/><circle cx="202" cy="148" r="36" fill="#b0bfd0"/><path d="M182 250l78-72 52 48 70-72 76 96H182z" fill="#bac7d4"/><text x="320" y="318" font-family="Arial, sans-serif" font-size="26" text-anchor="middle" fill="#6c7b88">Preview unavailable</text></svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function invalidateDerivedTagRegistryCache() {
  derivedTagRegistryCache.managedEntries = null;
  derivedTagRegistryCache.managedEntryMap = null;
  derivedTagRegistryCache.catalogEntries = null;
  derivedTagRegistryCache.filterEntries = null;
  derivedTagRegistryCache.tagManagerEntries = null;
}

function clearDeprecatedClientState() {
  localStorage.removeItem('mullmania-launchpad-groups');
  localStorage.removeItem('mullmania-launchpad-group-task');
}

function getDefaultSearchFieldIds() {
  return [...DEFAULT_SEARCH_FIELD_IDS];
}

function getKnownSearchFieldIds() {
  return SEARCH_FIELD_DEFINITIONS.map((field) => field.id);
}

function getActiveSearchFieldIds() {
  if (isMobileSwipeViewport()) {
    return getKnownSearchFieldIds();
  }
  return getKnownSearchFieldIds().filter((fieldId) => state.searchFields.has(fieldId));
}

function restoreSearchFields() {
  const defaultIds = getDefaultSearchFieldIds();
  const knownIds = new Set(getKnownSearchFieldIds());
  const stored = String(localStorage.getItem(SEARCH_FIELDS_STORAGE_KEY) || '').trim();
  if (!stored) {
    state.searchFields = new Set(defaultIds);
    return;
  }

  const storedFields = stored
    .split(',')
    .map((value) => normalizeCatalogToken(value))
    .filter((fieldId) => knownIds.has(fieldId));
  const nextFields = new Set(storedFields);
  if (storedFields.length === knownIds.size && storedFields.every((fieldId) => knownIds.has(fieldId))) {
    state.searchFields = new Set(defaultIds);
    persistSearchFields();
    return;
  }
  state.searchFields = nextFields;
}

function persistSearchFields() {
  localStorage.setItem(SEARCH_FIELDS_STORAGE_KEY, getActiveSearchFieldIds().join(','));
}

function syncSearchFieldToggles() {
  document.querySelectorAll('[data-search-field]').forEach((button) => {
    const fieldId = button.getAttribute('data-search-field') || '';
    const active = state.searchFields.has(fieldId);
    button.classList.toggle('is-active', active);
    button.setAttribute('aria-pressed', active ? 'true' : 'false');
  });
}

function syncSearchClearButton() {
  const hasValue = Boolean(searchEl?.value);
  if (!searchClearButton) {
    return;
  }
  searchClearButton.classList.toggle('has-value', hasValue);
  searchClearButton.setAttribute('aria-label', hasValue ? 'Clear search' : 'Search is empty');
}

function toggleSearchField(fieldId) {
  const normalizedFieldId = normalizeCatalogToken(fieldId);
  if (!getKnownSearchFieldIds().includes(normalizedFieldId)) {
    return;
  }
  if (state.searchFields.has(normalizedFieldId)) {
    state.searchFields.delete(normalizedFieldId);
  } else {
    state.searchFields.add(normalizedFieldId);
  }
  persistSearchFields();
  syncSearchFieldToggles();
  state.tablePage = 0;
  resetMobileLoadedItems();
  state.galleryPage = 0;
  state.wallPage = 0;
  state.tvIndex = 0;
  state.tvPage = 0;
  state.auditDeck.pageIndex = 0;
  state.auditDeck.currentIndex = 0;
  render();
}

async function loadShell() {
  state.shell = await fetchOptionalJson('./sitemap.json') ?? buildDefaultShell();
}

function buildDefaultShell() {
  return {
    header: {
      icon: 'ti ti-stack-3',
      title: 'Mullmania',
      search: {
        id: 'search',
        placeholder: 'Search sites by title, subdomain, or description...',
        ariaLabel: 'Search sites',
      },
    controls: [
        {
          id: 'cycle-view',
          type: 'view-cycle',
          label: 'Table',
          icon: 'ti ti-table',
          title: 'Switch view',
          className: 'surface-shell-action',
        },
        {
          id: 'open-new-site',
          type: 'action',
          label: 'Create',
          icon: 'ti ti-plus',
          title: 'Create',
          className: 'surface-shell-action',
        },
      ],
    },
    toolbar: {
      views: [
        { id: 'view-table', value: 'table', label: 'Table', icon: 'ti ti-table', className: 'surface-toggle' },
        { id: 'view-flightdeck', value: 'flightdeck', label: 'Now', icon: 'ti ti-radar-2', className: 'surface-toggle' },
        { id: 'view-gallery', value: 'gallery', label: 'Gallery', icon: 'ti ti-layout-grid', className: 'surface-toggle' },
        { id: 'view-tv', value: 'tv', label: 'Showcase', icon: 'ti ti-device-tv', className: 'surface-toggle' },
        { id: 'view-features', value: 'features', label: 'Features', icon: 'ti ti-checklist', className: 'surface-toggle' },
        { id: 'view-categorize', value: 'categorize', label: 'Categorize', icon: 'ti ti-layout-kanban', className: 'surface-toggle' },
        { id: 'view-dependencies', value: 'dependencies', label: 'Dependencies', icon: 'ti ti-graph', className: 'surface-toggle' },
        { id: 'view-audit', value: 'audit', label: 'Review', icon: 'ti ti-clipboard-check', className: 'surface-toggle' },
        { id: 'view-slideshow', value: 'slideshow', label: 'Slideshow', icon: 'ti ti-photo', className: 'surface-toggle' },
        { id: 'view-json', value: 'json', label: 'JSON', icon: 'ti ti-braces', className: 'surface-toggle' },
      ],
    },
    catalog: {
      table: {
        defaultPageSize: DEFAULT_TABLE_PAGE_SIZE,
        pageSizeOptions: [10, 25, 50, 100, 250, TABLE_PAGE_SIZE_ALL],
      },
    },
  };
}

function configurePaginationFromShell() {
  const tableConfig = state.shell?.catalog?.table ?? {};
  const pageSizeOptions = normalizePageSizeOptions(tableConfig.pageSizeOptions);
  state.tablePageSizeOptions = pageSizeOptions;
  state.tablePageSize = normalizePageSize(tableConfig.defaultPageSize, pageSizeOptions[0]);
  restoreStoredTablePageSize();
}

function normalizePageSizeOptions(value) {
  const options = Array.isArray(value) ? value : [];
  const normalized = options
    .map((item) => normalizePageSizeOption(item))
    .filter((item) => item !== null);

  return normalized.length > 0 ? Array.from(new Set(normalized)) : [25, DEFAULT_TABLE_PAGE_SIZE, 100, 250, TABLE_PAGE_SIZE_ALL];
}

function normalizePageSizeOption(value) {
  const normalizedToken = normalizeCatalogToken(value);
  if (normalizedToken === TABLE_PAGE_SIZE_ALL) {
    return TABLE_PAGE_SIZE_ALL;
  }

  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

function normalizePageSize(value, fallback) {
  return normalizePageSizeOption(value) ?? fallback;
}

function populateTablePageSizeOptions() {
  if (!tablePageSizeEl) {
    return;
  }

  tablePageSizeEl.innerHTML = state.tablePageSizeOptions
    .map((size) => `<option value="${size}">${size === TABLE_PAGE_SIZE_ALL ? 'All' : size}</option>`)
    .join('');
  tablePageSizeEl.value = String(state.tablePageSize);
}

function restoreStoredTablePageSize() {
  const storedPageSize = normalizePageSize(localStorage.getItem(TABLE_PAGE_SIZE_STORAGE_KEY), null);
  if (storedPageSize === TABLE_PAGE_SIZE_ALL) {
    localStorage.removeItem(TABLE_PAGE_SIZE_STORAGE_KEY);
    return;
  }
  if (storedPageSize !== null && state.tablePageSizeOptions.includes(storedPageSize)) {
    state.tablePageSize = storedPageSize;
  }
}

function persistTablePageSize() {
  if (isAllTablePageSize()) {
    localStorage.removeItem(TABLE_PAGE_SIZE_STORAGE_KEY);
    return;
  }
  localStorage.setItem(TABLE_PAGE_SIZE_STORAGE_KEY, String(state.tablePageSize));
}

function renderShell() {
  renderHeaderShell(state.shell?.header);
  renderToolbarShell(state.shell?.toolbar);
  cacheShellElements();
  ensureValidViewMode();
  syncViewButtons();
}

function renderHeaderShell(header = {}) {
  if (mastheadBrandEl) {
    mastheadBrandEl.innerHTML = `
      <h1 class="surface-masthead__title">
        <button
          id="open-settings"
          type="button"
          class="launchpad-title-settings-trigger"
          title="Settings"
          aria-label="Open settings"
        >
          <i class="${escapeHtml(header.icon || 'ti ti-stack-3')}"></i>
          <span>${escapeHtml(header.title || 'Mullmania')}</span>
        </button>
      </h1>
    `;
  }

  const search = header.search || {};
  const searchPlaceholder = isMobileSwipeViewport()
    ? (search.mobilePlaceholder || search.shortPlaceholder || 'Search sites')
    : (search.placeholder || 'Search sites by title, subdomain, or description...');
  if (mastheadSearchSlotEl) {
    mastheadSearchSlotEl.innerHTML = `
      <div class="launchpad-search-shell">
        <input
          id="${escapeHtml(search.id || 'search')}"
          type="search"
          class="surface-masthead__search launchpad-search-shell__input"
          placeholder="${escapeHtml(searchPlaceholder)}"
          aria-label="${escapeHtml(search.ariaLabel || 'Search sites')}"
        >
        <div id="search-tag-filters" class="launchpad-search-tags" aria-label="Tag filters"></div>
        <button
          id="search-clear"
          type="button"
          class="launchpad-search-clear"
          aria-label="Search is empty"
          title="Clear search"
        >
          <i class="ti ti-x"></i>
        </button>
        <div class="launchpad-search-shell__toggles" aria-label="Search fields">
          ${SEARCH_FIELD_DEFINITIONS.map((field) => `
            <button
              type="button"
              class="launchpad-search-field-toggle"
              data-search-field="${escapeHtml(field.id)}"
              aria-label="${escapeHtml(field.ariaLabel)}"
              aria-pressed="true"
            >${escapeHtml(field.label)}</button>
          `).join('')}
        </div>
      </div>
    `;
  }

  if (mastheadActionsEl) {
    const controls = Array.isArray(header.controls) ? header.controls : [];
    const controlsMarkup = controls.map((control) => {
      if (control.type === 'view-cycle') {
        return `
          <label
            class="${escapeHtml(control.className || 'surface-shell-action')} surface-shell-action--select-shell"
            title="${escapeHtml(control.title || 'Choose view')}"
            aria-label="${escapeHtml(control.ariaLabel || control.label || control.title || 'Choose view')}"
          >
            <i id="${escapeHtml(control.id || 'cycle-view')}-icon" class="${escapeHtml(control.icon || 'ti ti-layout-grid')}"></i>
            <select
              id="${escapeHtml(control.id || 'cycle-view')}"
              class="surface-shell-action__select-input"
              aria-label="${escapeHtml(control.ariaLabel || control.label || control.title || 'Choose view')}"
            ></select>
            <i class="ti ti-chevron-down surface-shell-action__select-caret" aria-hidden="true"></i>
          </label>
        `;
      }

      return `
        <button
          id="${escapeHtml(control.id || '')}"
          type="button"
          class="${escapeHtml(control.className || 'surface-shell-action')}"
          title="${escapeHtml(control.title || control.label || '')}"
          aria-label="${escapeHtml(control.ariaLabel || control.label || control.title || 'Action')}"
          ${control.type ? `data-control-type="${escapeHtml(control.type)}"` : ''}
        >
          ${control.icon ? `<i class="${escapeHtml(control.icon)}"></i>` : ''}
          ${control.label ? `<span>${escapeHtml(control.label)}</span>` : ''}
        </button>
      `;
    }).join('');

    mastheadActionsEl.innerHTML = controlsMarkup;
  }
}

function renderToolbarShell(toolbar = {}) {
  if (toolbarViewsEl) {
    const configuredViews = Array.isArray(toolbar.views) && toolbar.views.length > 0
      ? toolbar.views
      : Object.values(DEFAULT_VIEW_CONFIG);
    const availableViews = configuredViews
      .map((item) => {
        const value = String(item?.value || '').trim();
        if (!value || (value === 'swipe' && !isMobileSwipeViewport()) || !document.getElementById(`${value}-view`)) {
          return null;
        }
        return {
          ...DEFAULT_VIEW_CONFIG[value],
          ...item,
          value,
        };
      })
      .filter(Boolean);

    toolbarViewsEl.innerHTML = availableViews.map((item) => `
      <button
        type="button"
        class="${escapeHtml(item.className || 'surface-toggle')}"
        data-view="${escapeHtml(item.value || '')}"
        aria-label="${escapeHtml(item.label || item.value || 'View')}"
      >
        ${item.icon ? `<i class="${escapeHtml(item.icon)}"></i>` : ''}
        <span>${escapeHtml(item.label || item.value || 'View')}</span>
      </button>
    `).join('');
    renderMobileViewNav(availableViews);
  }
}

function renderMobileViewNav(availableViews = getAvailableViewConfigs()) {
  const navHostEl = document.body;
  if (!navHostEl) return;
  let navEl = document.getElementById('mobile-view-nav');
  if (!navEl) {
    navEl = document.createElement('nav');
    navEl.id = 'mobile-view-nav';
    navEl.className = 'mobile-view-nav';
    navEl.setAttribute('aria-label', 'Mobile views');
  }
  if (navEl.parentElement !== navHostEl) {
    navHostEl.append(navEl);
  }

  const primaryValues = isMobileSwipeViewport()
    ? ['table', 'gallery', 'swipe']
    : ['table', 'gallery', 'tv', 'audit'];
  const primaryViews = primaryValues
    .map((value) => availableViews.find((item) => item.value === value) || DEFAULT_VIEW_CONFIG[value])
    .filter(Boolean);

  navEl.innerHTML = `
    <div class="mobile-view-nav__primary">
      ${primaryViews.map((item) => renderMobileViewButton(item)).join('')}
    </div>
  `;
}

function renderMobileViewButton(view, menu = false) {
  if (!view?.value) return '';
  const label = getMobileViewLabel(view);
  const className = menu ? 'mobile-view-nav__menu-item' : 'mobile-view-nav__item';
  return `
    <button type="button" class="${className}" data-view="${escapeHtml(view.value)}" aria-label="${escapeHtml(label)}" role="${menu ? 'menuitem' : 'button'}">
      ${view.icon ? `<i class="${escapeHtml(view.icon)}" aria-hidden="true"></i>` : ''}
      <span>${escapeHtml(label)}</span>
    </button>
  `;
}

function getMobileViewLabel(view) {
  switch (view?.value) {
    case 'table':
      return 'List';
    case 'gallery':
      return 'Wall';
    case 'swipe':
      return 'Focus';
    case 'tv':
      return 'TV';
    default:
      return view?.label || humanizeToken(view?.value || 'View');
  }
}

function toggleMobileViewMenu(button) {
  const navEl = document.getElementById('mobile-view-nav');
  const menuEl = navEl?.querySelector('.mobile-view-nav__menu');
  if (!menuEl) return;
  const shouldOpen = menuEl.classList.contains('is-hidden');
  menuEl.classList.toggle('is-hidden', !shouldOpen);
  button.setAttribute('aria-expanded', shouldOpen ? 'true' : 'false');
}

function closeMobileViewMenu() {
  const navEl = document.getElementById('mobile-view-nav');
  const menuEl = navEl?.querySelector('.mobile-view-nav__menu');
  const button = navEl?.querySelector('[data-mobile-more-toggle]');
  menuEl?.classList.add('is-hidden');
  button?.setAttribute('aria-expanded', 'false');
}

function cacheShellElements() {
  searchEl = document.getElementById('search');
  searchClearButton = document.getElementById('search-clear');
  syncSearchFieldToggles();
  syncSearchClearButton();
  openNewSiteButton = document.getElementById('open-new-site');
  openSettingsButton = document.getElementById('open-settings');
  cycleViewButton = document.getElementById('cycle-view') || mastheadActionsEl?.querySelector('[data-control-type="view-cycle"]') || null;
  viewButtons = Array.from(document.querySelectorAll('[data-view]'));
  pageSummaryEl = document.getElementById('page-summary');
  if (pageSummaryEl) {
    pageSummaryEl.remove();
    pageSummaryEl = null;
  }
}

function bindEvents() {
  const toolbarToggle = document.getElementById('toolbar-toggle');
  const toolbar = document.querySelector('.toolbar');
  if (toolbarToggle && toolbar) {
    toolbarToggle.addEventListener('click', () => {
      toolbar.classList.toggle('toolbar--mobile-open');
      toolbarToggle.classList.toggle('is-active');
    });
  }

  searchEl?.addEventListener('input', () => {
    applySearchValue(searchEl.value);
    syncSearchClearButton();
  });
  searchClearButton?.addEventListener('click', () => {
    applySearchValue('');
    searchEl?.focus({ preventScroll: true });
  });
  const searchTagFiltersEl = document.getElementById('search-tag-filters');
  searchTagFiltersEl?.addEventListener('click', handleInlineCatalogTagFilterClick);
  searchTagFiltersEl?.addEventListener('dragstart', handleInlineCatalogTagDragStart);
  searchTagFiltersEl?.addEventListener('dragend', handleInlineCatalogTagDragEnd);
  document.addEventListener('pointerdown', handleCatalogTagFilterOutsidePointer);
  document.addEventListener('keydown', handleCatalogTagFilterKeydown);
  document.querySelectorAll('[data-search-field]').forEach((button) => {
    button.addEventListener('click', () => {
      toggleSearchField(button.getAttribute('data-search-field') || '');
    });
  });

  window.addEventListener(BULK_REFRESH_PIN_IMAGE_FILTER_EVENT, handleBulkRefreshPinImageFilter);

  document.querySelectorAll('.workspace-table__sortable').forEach((header) => {
    header.addEventListener('click', () => {
      const sortKey = header.dataset.sort;
      if (state.sort === sortKey) {
      state.sort = 'alpha';
    } else {
      state.sort = sortKey;
    }
    state.tablePage = 0;
    resetMobileLoadedItems();
    state.listScrollTop = 0;
    state.galleryPage = 0;
    state.wallPage = 0;
    state.tvIndex = 0;
    state.tvPage = 0;
    updateSortIcons();
    render();
  });
  });

  viewButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const nextView = button.dataset.view;
      if (nextView) {
        closeMobileViewMenu();
        setViewMode(nextView);
      }
    });
  });

  document.getElementById('mobile-view-nav')?.addEventListener('click', (event) => {
    const target = event.target instanceof Element ? event.target : null;
    const viewButton = target?.closest('#mobile-view-nav [data-view]');
    if (viewButton instanceof HTMLButtonElement) {
      closeMobileViewMenu();
      const nextView = viewButton.dataset.view;
      if (nextView) {
        setViewMode(nextView);
      }
      return;
    }
  });

  if (cycleViewButton instanceof HTMLSelectElement) {
    cycleViewButton.addEventListener('change', () => {
      setViewMode(cycleViewButton.value);
    });
  } else {
    cycleViewButton?.addEventListener('click', () => {
      cycleViewMode();
    });
  }

  listScrollEl?.addEventListener('scroll', () => {
    state.listScrollTop = listScrollEl.scrollTop;
    scheduleDenseListWindowRender();
  }, { passive: true });

  document.querySelector('.workspace-table-scroll')?.addEventListener('scroll', (event) => {
    maybeExtendMobileLoadedItems('table', event.currentTarget);
  }, { passive: true });

  galleryGridEl?.addEventListener('scroll', (event) => {
    maybeExtendMobileLoadedItems('gallery', event.currentTarget);
  }, { passive: true });

  wallGridEl?.addEventListener('scroll', (event) => {
    maybeExtendMobileLoadedItems('wall', event.currentTarget);
  }, { passive: true });

  auditPagePrevButton?.addEventListener('click', () => {
    loadAuditDeckPage(state.auditDeck.pageIndex - 1, { focus: 'end' });
  });

  auditPageNextButton?.addEventListener('click', () => {
    loadAuditDeckPage(state.auditDeck.pageIndex + 1, { focus: 'start' });
  });

  auditFilterTabsEl?.addEventListener('click', (event) => {
    const button = event.target instanceof Element ? event.target.closest('[data-audit-filter]') : null;
    if (!(button instanceof HTMLButtonElement)) {
      return;
    }
    const filter = button.dataset.auditFilter || AUDIT_FILTER_REVIEW;
    setAuditFilterMode(state.auditDeck.filterMode === filter ? AUDIT_FILTER_REVIEW : filter);
  });

  auditResetFeedbackButton?.addEventListener('click', resetCurrentAuditFeedback);

  auditPrevButton?.addEventListener('click', () => {
    navigateAuditDeck(-1);
  });

  auditNextButton?.addEventListener('click', () => {
    navigateAuditDeck(1);
  });

  auditOpenButton?.addEventListener('click', () => {
    const entry = getCurrentAuditEntry();
    if (entry?.url) {
      window.open(entry.url, '_blank', 'noopener,noreferrer');
    }
  });

  auditFullscreenButton?.addEventListener('click', () => {
    const entry = resolveAuditCatalogEntry(getCurrentAuditEntry());
    if (entry) {
      openFullscreenPreview(entry);
    }
  });

  auditScaleToggleButton?.addEventListener('click', () => {
    toggleAuditPreviewScaleMode();
  });

  auditFrameEl?.addEventListener('load', () => {
    setAuditFrameStatus(getCurrentAuditEntry() ? 'ready' : 'empty');
  });
  auditFrameEl?.addEventListener('error', () => {
    setAuditFrameStatus('error');
  });
  auditSaveButton?.addEventListener('click', () => {
    saveCurrentAuditReview();
  });

  auditQueueEl?.addEventListener('click', (event) => {
    const button = event.target instanceof Element ? event.target.closest('[data-audit-index]') : null;
    if (!(button instanceof HTMLButtonElement)) {
      return;
    }
    setAuditIndex(Number.parseInt(button.dataset.auditIndex || '0', 10));
  });

  auditNoteEl?.addEventListener('input', () => {
    updateAuditDraft({ note: auditNoteEl.value });
  });
  auditNoteEl?.addEventListener('paste', handleAuditAttachmentPaste);
  auditAttachmentInputEl?.addEventListener('change', async () => {
    await addAuditAttachmentFiles(Array.from(auditAttachmentInputEl.files || []));
    auditAttachmentInputEl.value = '';
  });
  auditAttachmentListEl?.addEventListener('click', (event) => {
    const button = event.target instanceof Element ? event.target.closest('[data-audit-attachment-remove]') : null;
    if (!(button instanceof HTMLButtonElement)) {
      return;
    }
    removeAuditAttachment(button.dataset.auditAttachmentRemove || '');
  });
  auditAttachmentListEl?.addEventListener('dragover', (event) => {
    event.preventDefault();
    auditAttachmentListEl.classList.add('is-drop-target');
  });
  auditAttachmentListEl?.addEventListener('dragleave', () => {
    auditAttachmentListEl.classList.remove('is-drop-target');
  });
  auditAttachmentListEl?.addEventListener('drop', async (event) => {
    event.preventDefault();
    auditAttachmentListEl.classList.remove('is-drop-target');
    await addAuditAttachmentFiles(Array.from(event.dataTransfer?.files || []));
  });

  auditRankEl?.addEventListener('input', () => {
    updateAuditDraft({ manualRank: auditRankEl.value });
  });

  auditPresetsListEl?.addEventListener('click', (event) => {
    const button = event.target instanceof Element ? event.target.closest('[data-audit-preset-id]') : null;
    if (!(button instanceof HTMLButtonElement)) {
      return;
    }
    applyAuditCritiquePreset(button.dataset.auditPresetId || '');
  });

  auditPresetsEditButton?.addEventListener('click', openAuditPresetsModal);
  notePresetsListEl?.addEventListener('click', (event) => {
    const button = event.target instanceof Element ? event.target.closest('[data-note-preset-id]') : null;
    if (!(button instanceof HTMLButtonElement)) {
      return;
    }
    applyNoteFeedbackPreset(button.dataset.notePresetId || '');
  });
  notePresetsEditButton?.addEventListener('click', openAuditPresetsModal);
  auditPresetsEditorEl?.addEventListener('click', (event) => {
    const removeButton = event.target instanceof Element
      ? event.target.closest('[data-audit-preset-remove]')
      : null;
    if (!(removeButton instanceof HTMLButtonElement)) {
      return;
    }
    removeButton.closest('.audit-preset-editor-card')?.remove();
    updateAuditPresetsStatus('Preset removed. Save to publish the change.', 'warning');
  });
  auditPresetsAddButton?.addEventListener('click', () => {
    appendAuditPresetEditorRow({
      id: '',
      label: 'New critique',
      text: '',
    });
    const newest = auditPresetsEditorEl?.querySelector('.audit-preset-editor-card:last-child textarea');
    newest?.focus({ preventScroll: true });
    updateAuditPresetsStatus('Added a preset row. Fill in the note text, then save.', 'info');
  });
  auditPresetsSaveButton?.addEventListener('click', saveAuditCritiquePresets);
  auditPresetsResetButton?.addEventListener('click', () => {
    renderAuditPresetEditorRows(DEFAULT_AUDIT_CRITIQUE_PRESETS);
    updateAuditPresetsStatus('Loaded default presets. Save to publish them.', 'warning');
  });
  document.querySelectorAll('[data-close-audit-presets]').forEach((element) => {
    element.addEventListener('click', closeAuditPresetsModal);
  });

  jsonModeButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const nextMode = normalizeJsonViewMode(button.dataset.jsonMode) || JSON_VIEW_MODE_TREE;
      if (nextMode === state.jsonViewMode) {
        return;
      }
      state.jsonViewMode = nextMode;
      if (usePersistentViewState()) {
        localStorage.setItem(JSON_VIEW_MODE_STORAGE_KEY, state.jsonViewMode);
      }
      renderJsonView();
    });
  });

  jsonWrapToggleButton?.addEventListener('click', () => {
    state.jsonWrap = !state.jsonWrap;
    if (usePersistentViewState()) {
      localStorage.setItem(JSON_WRAP_STORAGE_KEY, state.jsonWrap ? '1' : '0');
    }
    renderJsonView();
  });

  jsonCopyButton?.addEventListener('click', async () => {
    await copyJsonView();
  });

  selectVisibleButton?.addEventListener('click', () => {
    setVisibleSelection(true);
  });

  selectAllVisibleCheckbox?.addEventListener('change', () => {
    setVisibleSelection(selectAllVisibleCheckbox.checked);
  });

  clearSelectionButton?.addEventListener('click', () => {
    state.selected.clear();
    state.lastSelectedSiteId = null;
    render();
  });

  tablePrevButton?.addEventListener('click', () => {
    if (state.tablePage === 0) {
      return;
    }
    state.tablePage -= 1;
    render();
  });

  tableNextButton?.addEventListener('click', () => {
    const totalPages = getTablePageCount();
    if (state.tablePage >= totalPages - 1) {
      return;
    }
    state.tablePage += 1;
    render();
  });

  tablePageSizeEl?.addEventListener('change', () => {
    state.tablePageSize = normalizePageSize(tablePageSizeEl.value, state.tablePageSizeOptions[0]);
    persistTablePageSize();
    state.tablePage = 0;
    resetMobileLoadedItems();
    render();
  });

  copySelectedIdsButton?.addEventListener('click', async () => {
    const selectedEntries = getSelectedEntries();
    if (selectedEntries.length === 0) {
      flashButton(copySelectedIdsButton, 'Select some first');
      return;
    }

    await navigator.clipboard.writeText(selectedEntries.map((entry) => entry.siteId).join('\n'));
    flashButton(copySelectedIdsButton, 'IDs copied');
  });

  copySelectedPromptButton?.addEventListener('click', async () => {
    const selectedEntries = getSelectedEntries();
    if (selectedEntries.length === 0) {
      flashButton(copySelectedPromptButton, 'Select some first');
      return;
    }

    await navigator.clipboard.writeText(buildSelectionPacket(selectedEntries));
    flashButton(copySelectedPromptButton, 'Packet copied');
  });
  openBulkRenameButton?.addEventListener('click', () => {
    openBulkRenameModal();
  });

  galleryPrevButton.addEventListener('click', () => {
    if (state.galleryPage === 0) {
      return;
    }
    state.galleryPage -= 1;
    render();
  });

  galleryNextButton.addEventListener('click', () => {
    const totalPages = getGalleryPageCount();
    if (state.galleryPage >= totalPages - 1) {
      return;
    }
    state.galleryPage += 1;
    render();
  });

  dependenciesSourceListEl?.addEventListener('click', handleDependenciesSourceClick);
  dependenciesSourceListEl?.addEventListener('dragstart', handleDependenciesSourceDragStart);
  flightDeckSectionsEl?.addEventListener('click', handleFlightDeckSectionClick);
  dependenciesDetailEl?.addEventListener('click', handleDependenciesDetailClick);
  dependenciesDetailEl?.addEventListener('change', handleDependenciesDetailChange);
  dependenciesLayoutButton?.addEventListener('click', () => {
    runDependencyForceLayout({ force: true });
    setDependenciesStatus('Layout frozen.', 'info');
    renderDependenciesView();
  });
  dependenciesFitButton?.addEventListener('click', () => {
    fitDependenciesGraph();
    renderDependenciesView();
  });
  dependenciesResetButton?.addEventListener('click', resetDependencyDraft);
  dependenciesSaveButton?.addEventListener('click', () => {
    void saveDependencies();
  });
  dependenciesGraphEl?.addEventListener('pointerdown', handleDependenciesGraphPointerDown);
  dependenciesGraphEl?.addEventListener('pointermove', handleDependenciesGraphPointerMove);
  dependenciesGraphEl?.addEventListener('pointerup', handleDependenciesGraphPointerUp);
  dependenciesGraphEl?.addEventListener('pointercancel', handleDependenciesGraphPointerUp);
  dependenciesGraphEl?.addEventListener('wheel', handleDependenciesGraphWheel, { passive: false });
  dependenciesGraphStageEl?.addEventListener('dragover', handleDependenciesGraphDragOver);
  dependenciesGraphStageEl?.addEventListener('drop', handleDependenciesGraphDrop);
  featureMatrixScopeEl?.addEventListener('change', () => {
    setFeatureMatrixScope(featureMatrixScopeEl.value);
  });
  featureMatrixTableBodyEl?.addEventListener('click', handleFeatureMatrixClick);
  featureMatrixSaveButton?.addEventListener('click', saveFeatureMatrixDraft);
  featureMatrixResetButton?.addEventListener('click', resetFeatureMatrixDraft);
  featureMatrixSeedButton?.addEventListener('click', seedFeatureMatrixHeuristics);
  featureMatrixCopyButton?.addEventListener('click', () => {
    void copyFeatureMatrixSynopsis();
  });

  wallPrevButton?.addEventListener('click', () => {
    if (state.wallPage === 0) {
      return;
    }
    state.wallPage -= 1;
    render();
  });

  wallNextButton?.addEventListener('click', () => {
    const totalPages = getWallPageCount();
    if (state.wallPage >= totalPages - 1) {
      return;
    }
    state.wallPage += 1;
    render();
  });

  tvPrevButton?.addEventListener('click', () => {
    navigateTvPage(-1);
  });

  tvNextButton?.addEventListener('click', () => {
    navigateTvPage(1);
  });

  tvItemPrevButton?.addEventListener('click', () => {
    navigateTv(-1);
  });

  tvItemNextButton?.addEventListener('click', () => {
    navigateTv(1);
  });

  tvSlideshowButton?.addEventListener('click', () => {
    openShowcaseSlideshow();
  });

  tvDetailsButton?.addEventListener('click', () => {
    const entry = getCurrentTvEntry();
    if (!entry) {
      return;
    }
    openFullscreenPreview(entry);
  });

  tvFeedbackButton?.addEventListener('click', () => {
    const entry = getCurrentTvEntry();
    if (!entry) {
      return;
    }
    openNoteEditor(entry.siteId);
  });

  tvScaleToggleButton?.addEventListener('click', () => {
    toggleTvPreviewScaleMode();
  });
  tvExportButton?.addEventListener('click', async () => {
    await exportCurrentTvReel();
  });
  slideshowStageEl?.addEventListener('mousedown', (event) => {
    if (event.button !== 0 || state.viewMode !== 'slideshow') {
      return;
    }
    hideSlideshowChromeImmediately();
  });
  openNewSiteButton?.addEventListener('click', () => {
    openComposerForCreate();
  });
  openSettingsButton?.addEventListener('click', () => {
    openSettingsModal();
  });

  composerTabButtons.forEach((button) => {
    button.addEventListener('click', () => {
      setComposerMode(button.dataset.composerTab);
    });
  });
  composerFlatStarterButtons.forEach((button) => {
    button.addEventListener('click', () => {
      setComposerFlatStarter(button.dataset.composerFlatStarter);
    });
  });
  composerTvFormFactorCheckboxEl?.addEventListener('change', () => {
    setComposerTvFormFactor(Boolean(composerTvFormFactorCheckboxEl.checked));
  });
  composerRecipeButtons.forEach((button) => {
    button.addEventListener('click', () => {
      setComposerRecipe(button.dataset.composerRecipe);
    });
  });
  composerStarterButtons.forEach((button) => {
    button.addEventListener('click', () => {
      setComposerStarter(button.dataset.composerStarter);
    });
  });
  composerSurfaceButtons.forEach((button) => {
    button.addEventListener('click', () => {
      setComposerSurface(button.dataset.composerSurface);
    });
  });
  composerAddonButtons.forEach((button) => {
    button.addEventListener('click', () => {
      toggleComposerAddon(button.dataset.composerAddon);
    });
  });
  composerDataSourceButtons.forEach((button) => {
    button.addEventListener('click', () => {
      setComposerDataSource(button.dataset.composerDataSource);
    });
  });
  composerThemeSelectEl?.addEventListener('change', () => {
    setComposerTheme(composerThemeSelectEl.value);
  });
  composerEditorPaneButtons.forEach((button) => {
    button.addEventListener('click', () => {
      setComposerEditorPane(button.dataset.composerEditorPane, { focus: true });
    });
  });
  composerEditorFileButtons.forEach((button) => {
    button.addEventListener('click', () => {
      setComposerEditorPane(button.dataset.composerEditorFile, { focus: true });
    });
  });
  composerBuilderResetButton?.addEventListener('click', () => {
    resetComposerFromBuilder();
  });
  composerTvAppTitleEl?.addEventListener('input', () => {
    updateComposerTvConfig({ appTitle: composerTvAppTitleEl.value });
  });
  composerTvMediaBundleEl?.addEventListener('change', () => {
    updateComposerTvConfig({ mediaBundleId: composerTvMediaBundleEl.value });
  });
  composerTvLaunchEls.forEach((input, index) => {
    input?.addEventListener('input', () => {
      const nextLabels = normalizeComposerTvConfig(state.composer.tvConfig).launcherLabels.slice();
      nextLabels[index] = input.value;
      updateComposerTvConfig({ launcherLabels: nextLabels });
    });
  });
  composerTvNowPlayingLabelEl?.addEventListener('input', () => {
    updateComposerTvConfig({ nowPlayingLabel: composerTvNowPlayingLabelEl.value });
  });
  composerTvAdBadgeTextEl?.addEventListener('input', () => {
    updateComposerTvConfig({ adBadgeText: composerTvAdBadgeTextEl.value });
  });
  composerTvAdBadgeEnabledEl?.addEventListener('change', () => {
    updateComposerTvConfig({ adBadgeEnabled: composerTvAdBadgeEnabledEl.checked });
  });
  composerTvTailEnabledEl?.addEventListener('change', () => {
    updateComposerTvConfig({ tvTailEnabled: composerTvTailEnabledEl.checked });
  });
  composerCopySearchEl?.addEventListener('input', () => {
    state.composer.copyQuery = composerCopySearchEl.value;
    renderComposerCopyResults();
  });
  composerIntentPromptEl?.addEventListener('input', () => {
    clearComposerIntentRecord();
    syncComposerInteractiveState();
  });
  composerIntentPlanButton?.addEventListener('click', async () => {
    await planComposerIntentDraft();
  });

  composerSiteIdEl.addEventListener('input', () => {
    cancelComposerSourceLoad();
    state.composer.loadedSiteId = '';
    resetComposerHistory();
    if (state.composer.deleteArmedSiteId && normalizeSiteId(composerSiteIdEl.value) !== state.composer.deleteArmedSiteId) {
      clearComposerDeleteArm();
    }
    if (syncComposerStarterDraftWithSiteId()) {
      updateComposerPreview();
    }
    const validation = validateComposerSiteId();
    syncComposerChrome(validation);
  });
  settingsOperatorKeyEl?.addEventListener('input', () => {
    persistOperatorKeyIfNeeded();
    syncSettingsSubmitButton();
  });
  settingsRememberKeyEl?.addEventListener('change', () => {
    persistOperatorKeyIfNeeded();
    syncSettingsSubmitButton();
  });
  settingsClearKeyButton?.addEventListener('click', () => {
    clearStoredOperatorKey();
    updateSettingsStatus('Forgot the remembered key for this browser.', 'success');
    settingsOperatorKeyEl?.focus();
  });
  settingsSubmitButton?.addEventListener('click', async () => {
    await submitSettingsModal();
  });
  settingsStyleButtonEl?.addEventListener('click', () => {
    toggleSettingsStyleCombobox();
  });
  settingsStyleButtonEl?.addEventListener('keydown', (event) => {
    handleSettingsStyleButtonKeydown(event);
  });
  settingsStyleListEl?.addEventListener('click', (event) => {
    const optionButton = event.target instanceof Element
      ? event.target.closest('[data-settings-style-option]')
      : null;
    if (!(optionButton instanceof HTMLElement)) {
      return;
    }
    applyAppStyle(optionButton.dataset.settingsStyleOption);
    closeSettingsStyleCombobox();
    settingsStyleButtonEl?.focus();
  });
  settingsStyleListEl?.addEventListener('keydown', (event) => {
    handleSettingsStyleListKeydown(event);
  });
  document.addEventListener('click', (event) => {
    if (
      settingsStyleComboboxEl instanceof HTMLElement
      && event.target instanceof Node
      && !settingsStyleComboboxEl.contains(event.target)
    ) {
      closeSettingsStyleCombobox();
    }
  });
  composerHtmlEl.addEventListener('input', () => {
    markComposerDraftAsCustom();
    scheduleComposerPreview();
  });
  composerCssEl.addEventListener('input', () => {
    markComposerDraftAsCustom();
    scheduleComposerPreview();
  });
  composerJsEl.addEventListener('input', () => {
    markComposerDraftAsCustom();
    scheduleComposerPreview();
  });
  composerAiPromptEl?.addEventListener('input', syncComposerInteractiveState);
  composerHistorySliderEl?.addEventListener('input', () => {
    const nextIndex = Number.parseInt(composerHistorySliderEl.value, 10);
    if (!Number.isFinite(nextIndex)) {
      return;
    }
    void applyComposerHistoryIndex(nextIndex);
  });
  fullscreenTimelineSliderEl?.addEventListener('input', () => {
    const nextIndex = Number.parseInt(fullscreenTimelineSliderEl.value, 10);
    if (!Number.isFinite(nextIndex)) {
      return;
    }
    void applyFullscreenTimelineIndex(nextIndex);
  });
  fullscreenTimelineSelectEl?.addEventListener('change', () => {
    const nextIndex = Number.parseInt(fullscreenTimelineSelectEl.value, 10);
    if (!Number.isFinite(nextIndex)) {
      return;
    }
    void applyFullscreenTimelineIndex(nextIndex);
  });
  fullscreenTimelineRestoreButton?.addEventListener('click', async () => {
    await restoreFullscreenTimelineSelection();
  });
  composerDeleteToggleButton?.addEventListener('click', toggleComposerDeleteArm);
  composerAiAssistButton?.addEventListener('click', async () => {
    await assistComposerDraft();
  });
  composerValetAssistButton?.addEventListener('click', async () => {
    await launchComposerValetFix();
  });

  composerSubmitButton.addEventListener('click', async () => {
    if (isComposerDeleteArmed()) {
      await submitComposerDelete();
      return;
    }
    if (state.composer.mode === 'editor') {
      await submitComposerEditor();
      return;
    }
    await submitComposerBlank();
  });

  document.querySelectorAll('[data-close-preview]').forEach((element) => {
    element.addEventListener('click', closeFullscreenPreview);
  });
  document.querySelectorAll('[data-close-access-modal]').forEach((element) => {
    element.addEventListener('click', closeAccessModal);
  });
  document.getElementById('close-access-modal')?.addEventListener('click', closeAccessModal);
  accessModalCancelButton?.addEventListener('click', closeAccessModal);
  accessModalConfirmButton?.addEventListener('click', async () => {
    await submitAccessModal();
  });
  document.querySelectorAll('[data-close-rank-modal]').forEach((element) => {
    element.addEventListener('click', closeRankModal);
  });
  document.getElementById('close-rank-modal')?.addEventListener('click', closeRankModal);
  rankModalEl?.addEventListener('click', (event) => {
    const target = event.target instanceof HTMLElement ? event.target : null;
    const deltaButton = target?.closest('[data-rank-delta]');
    if (deltaButton instanceof HTMLElement) {
      event.preventDefault();
      const delta = Number.parseInt(deltaButton.dataset.rankDelta || '0', 10);
      applyRankModalDelta(Number.isFinite(delta) ? delta : 0);
      return;
    }
    const resetButton = target?.closest('[data-rank-reset]');
    if (resetButton instanceof HTMLElement) {
      event.preventDefault();
      resetRankModalDraft();
    }
  });
  rankModalInputEl?.addEventListener('input', updateRankModalFromInput);
  rankModalInputEl?.addEventListener('keydown', async (event) => {
    if (event.key !== 'Enter') {
      return;
    }
    event.preventDefault();
    await submitRankModal();
  });
  rankModalSaveButton?.addEventListener('click', async () => {
    await submitRankModal();
  });
  document.querySelectorAll('[data-close-vscode-modal]').forEach((element) => {
    element.addEventListener('click', closeVsCodeModal);
  });
  vscodeModalCopyCommandButton?.addEventListener('click', copyVsCodeDeployCommand);
  fullscreenPrevButton?.addEventListener('click', () => navigateFullscreenPreview(-1));
  fullscreenNextButton?.addEventListener('click', () => navigateFullscreenPreview(1));
  fullscreenImageLeftCardEl?.addEventListener('click', () => shiftFullscreenImageCarousel(-1));
  fullscreenImageRightCardEl?.addEventListener('click', () => shiftFullscreenImageCarousel(1));
  fullscreenEditButton?.addEventListener('click', openFullscreenEditor);
  fullscreenVscodeButton?.addEventListener('click', () => {
    openVsCodeModal(state.fullscreenEntry?.siteId || '');
  });
  fullscreenUseAppButton?.addEventListener('click', openFullscreenUseAsApp);
  fullscreenDeleteButton?.addEventListener('click', openFullscreenDeleteFlow);
  fullscreenFrameEl?.addEventListener('load', () => {
    if (fullscreenModalEl.classList.contains('is-hidden')) {
      return;
    }
    const panel = fullscreenModalEl.querySelector('.fullscreen-modal__panel');
    if (panel instanceof HTMLElement) {
      panel.focus({ preventScroll: true });
    }
  });
  document.getElementById('close-preview').addEventListener('click', closeFullscreenPreview);

  document.querySelectorAll('[data-close-notes]').forEach((element) => {
    element.addEventListener('click', closeNotesModal);
  });
  document.querySelectorAll('[data-close-tag-manager]').forEach((element) => {
    element.addEventListener('click', closeTagManagerModal);
  });
  document.querySelectorAll('[data-close-settings]').forEach((element) => {
    element.addEventListener('click', () => closeSettingsModal());
  });
  document.getElementById('close-settings')?.addEventListener('click', () => closeSettingsModal());
  document.getElementById('close-notes')?.addEventListener('click', closeNotesModal);
  document.getElementById('close-tag-manager')?.addEventListener('click', closeTagManagerModal);
  tagManagerCreateInputEl?.addEventListener('input', () => {
    state.tagManager.createLabel = normalizeManagedTagLabel(tagManagerCreateInputEl.value);
    syncTagManagerControls();
  });
  tagManagerCreateInputEl?.addEventListener('keydown', async (event) => {
    if (event.key !== 'Enter') {
      return;
    }
    event.preventDefault();
    await createCatalogTag(state.tagManager.createLabel);
  });
  tagManagerCreateButton?.addEventListener('click', async () => {
    await createCatalogTag(state.tagManager.createLabel);
  });
  tagManagerListEl?.addEventListener('input', (event) => {
    const input = event.target instanceof HTMLInputElement
      ? event.target.closest('[data-tag-manager-rename-input]')
      : null;
    if (!(input instanceof HTMLInputElement)) {
      return;
    }
    state.tagManager.editingLabel = normalizeManagedTagLabel(input.value);
    syncTagManagerControls();
  });
  tagManagerListEl?.addEventListener('keydown', async (event) => {
    const input = event.target instanceof HTMLInputElement
      ? event.target.closest('[data-tag-manager-rename-input]')
      : null;
    if (!(input instanceof HTMLInputElement)) {
      return;
    }
    if (event.key === 'Escape') {
      event.preventDefault();
      stopTagManagerEditing();
      return;
    }
    if (event.key !== 'Enter') {
      return;
    }
    event.preventDefault();
    await renameCatalogTag(state.tagManager.editingTagId, state.tagManager.editingLabel);
  });
  tagManagerListEl?.addEventListener('click', async (event) => {
    const previewButton = event.target instanceof Element
      ? event.target.closest('[data-preview-site-id]')
      : null;
    if (previewButton instanceof HTMLElement) {
      const entry = findEntryBySiteId(previewButton.dataset.previewSiteId || '');
      if (entry) {
        openFullscreenPreview(entry);
      }
      return;
    }

    const startEditButton = event.target instanceof Element
      ? event.target.closest('[data-tag-manager-start-edit]')
      : null;
    if (startEditButton instanceof HTMLButtonElement) {
      startTagManagerEditing(startEditButton.dataset.tagManagerStartEdit || '');
      return;
    }

    const cancelButton = event.target instanceof Element
      ? event.target.closest('[data-tag-manager-cancel]')
      : null;
    if (cancelButton instanceof HTMLButtonElement) {
      stopTagManagerEditing();
      return;
    }

    const saveButton = event.target instanceof Element
      ? event.target.closest('[data-tag-manager-save]')
      : null;
    if (saveButton instanceof HTMLButtonElement) {
      await renameCatalogTag(saveButton.dataset.tagManagerSave || '', state.tagManager.editingLabel);
      return;
    }

    const deleteButton = event.target instanceof Element
      ? event.target.closest('[data-tag-manager-delete]')
      : null;
    if (deleteButton instanceof HTMLButtonElement) {
      await deleteCatalogTag(deleteButton.dataset.tagManagerDelete || '');
    }
  });
  tagManagerListEl?.addEventListener('dragstart', (event) => {
    const row = event.target instanceof Element
      ? event.target.closest('[data-tag-manager-row]')
      : null;
    if (!(row instanceof HTMLElement)) {
      return;
    }

    const tagId = normalizeManagedTagId(row.dataset.tagManagerRow || '');
    const entry = getTagManagerEntry(tagId);
    if (!canMutateTagManagerEntry(entry)) {
      event.preventDefault();
      return;
    }

    state.tagManager.draggingTagId = tagId;
    state.tagManager.dropTargetTagId = '';
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', tagId);
    }
    syncTagManagerDragDecorations();
  });
  tagManagerListEl?.addEventListener('dragover', (event) => {
    const draggingTagId = normalizeManagedTagId(state.tagManager.draggingTagId);
    if (!draggingTagId) {
      return;
    }

    const row = event.target instanceof Element
      ? event.target.closest('[data-tag-manager-row]')
      : null;
    const targetTagId = row instanceof HTMLElement
      ? normalizeManagedTagId(row.dataset.tagManagerRow || '')
      : '';

    if (!canMergeTagManagerEntries(draggingTagId, targetTagId)) {
      if (state.tagManager.dropTargetTagId) {
        state.tagManager.dropTargetTagId = '';
        syncTagManagerDragDecorations();
      }
      return;
    }

    event.preventDefault();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move';
    }
    if (state.tagManager.dropTargetTagId !== targetTagId) {
      state.tagManager.dropTargetTagId = targetTagId;
      syncTagManagerDragDecorations();
    }
  });
  tagManagerListEl?.addEventListener('dragleave', (event) => {
    const row = event.target instanceof Element
      ? event.target.closest('[data-tag-manager-row]')
      : null;
    if (!(row instanceof HTMLElement)) {
      return;
    }

    const relatedTarget = event.relatedTarget instanceof Node ? event.relatedTarget : null;
    if (relatedTarget && row.contains(relatedTarget)) {
      return;
    }

    if (state.tagManager.dropTargetTagId === normalizeManagedTagId(row.dataset.tagManagerRow || '')) {
      state.tagManager.dropTargetTagId = '';
      syncTagManagerDragDecorations();
    }
  });
  tagManagerListEl?.addEventListener('drop', async (event) => {
    const row = event.target instanceof Element
      ? event.target.closest('[data-tag-manager-row]')
      : null;
    const targetTagId = row instanceof HTMLElement
      ? normalizeManagedTagId(row.dataset.tagManagerRow || '')
      : '';
    const sourceTagId = normalizeManagedTagId(
      state.tagManager.draggingTagId
      || event.dataTransfer?.getData('text/plain')
      || ''
    );

    if (!canMergeTagManagerEntries(sourceTagId, targetTagId)) {
      clearTagManagerDragState();
      return;
    }

    event.preventDefault();
    clearTagManagerDragState();
    await mergeCatalogTags(sourceTagId, targetTagId);
  });
  tagManagerListEl?.addEventListener('dragend', () => {
    clearTagManagerDragState();
  });
  document.querySelectorAll('[data-close-bulk-rename]').forEach((element) => {
    element.addEventListener('click', closeBulkRenameModal);
  });
  document.getElementById('close-bulk-rename')?.addEventListener('click', closeBulkRenameModal);
  bulkRenameCancelButton?.addEventListener('click', closeBulkRenameModal);
  bulkRenameCloseActionButton?.addEventListener('click', closeBulkRenameModal);
  bulkRenameBackButton?.addEventListener('click', () => {
    if (!state.bulkRename.started) {
      setBulkRenameStep('edit');
    }
  });
  bulkRenameNextButton?.addEventListener('click', () => {
    const plan = getBulkRenamePlan();
    if (plan.readyCount === 0 || plan.errorCount > 0) {
      renderBulkRenameModal();
      return;
    }
    setBulkRenameStep('confirm');
  });
  bulkRenameStartButton?.addEventListener('click', async () => {
    await startBulkRenameQueue({ resume: state.bulkRename.started });
  });
  bulkRenameSortOriginalButton?.addEventListener('click', () => {
    setBulkRenameSort('original');
  });
  bulkRenameSortFriendlyButton?.addEventListener('click', () => {
    setBulkRenameSort('friendly');
  });
  bulkRenameSortNewButton?.addEventListener('click', () => {
    setBulkRenameSort('new');
  });
  bulkRenameTableBodyEl?.addEventListener('input', (event) => {
    const input = event.target instanceof HTMLInputElement
      ? event.target.closest('[data-bulk-rename-input]')
      : null;
    if (!(input instanceof HTMLInputElement)) {
      return;
    }
    updateBulkRenameDraft(input.dataset.rowId || '', input.dataset.rowField || '', input.value);
  });
  bulkRenameTableBodyEl?.addEventListener('click', (event) => {
    const removeButton = event.target instanceof Element
      ? event.target.closest('[data-bulk-rename-remove="true"]')
      : null;
    if (removeButton instanceof HTMLButtonElement) {
      removeBulkRenameRow(removeButton.dataset.rowId || '');
      return;
    }

    const applyButton = event.target instanceof Element
      ? event.target.closest('[data-bulk-rename-apply-title="true"]')
      : null;
    if (applyButton instanceof HTMLButtonElement) {
      event.preventDefault();
      applyBulkRenameTitleToBatch(applyButton.dataset.rowId || '');
      return;
    }

    const button = event.target instanceof Element
      ? event.target.closest('[data-bulk-rename-reset="true"]')
      : null;
    if (!(button instanceof HTMLButtonElement)) {
      return;
    }
    event.preventDefault();
    resetBulkRenameDraft(button.dataset.rowId || '', button.dataset.rowField || '', { focusInput: true });
  });
  notesClearVisibleButton?.addEventListener('click', async () => {
    await clearVisibleNotes();
  });
  notesCopyJsonButton?.addEventListener('click', async () => {
    const payload = buildNotesExportPayload();
    if (payload.notes.length === 0) {
      flashButton(notesCopyJsonButton, 'No notes yet');
      return;
    }
    await navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
    flashButton(notesCopyJsonButton, 'JSON copied');
  });
  notesCopyCsvButton?.addEventListener('click', async () => {
    const csv = buildNotesExportCsv();
    if (!csv) {
      flashButton(notesCopyCsvButton, 'No notes yet');
      return;
    }
    await navigator.clipboard.writeText(csv);
    flashButton(notesCopyCsvButton, 'CSV copied');
  });
  notesListEl?.addEventListener('click', async (event) => {
    const button = event.target instanceof HTMLElement ? event.target.closest('[data-note-action]') : null;
    if (!(button instanceof HTMLElement)) {
      return;
    }
    const siteId = button.dataset.siteId || '';
    if (!siteId) {
      return;
    }
    const action = button.dataset.noteAction || '';
    if (action === 'preview') {
      const entry = findEntryBySiteId(siteId);
      if (entry) {
        openFullscreenPreview(entry);
      }
      return;
    }
    if (action === 'save') {
      await submitNotesCard(siteId);
      return;
    }
    if (action === 'delete-note') {
      await deleteNotesCardNote(siteId);
    }
  });
  notesListEl?.addEventListener('input', (event) => {
    const rankInput = event.target instanceof HTMLInputElement ? event.target.closest('[data-note-rank-input]') : null;
    if (rankInput instanceof HTMLInputElement) {
      const siteId = rankInput.dataset.noteRankInput || '';
      if (!siteId) {
        return;
      }
      state.noteDraftRanks[siteId] = rankInput.value;
      syncNotesCardControls(siteId);
      return;
    }

    const noteInput = event.target instanceof HTMLTextAreaElement ? event.target.closest('[data-note-text-input]') : null;
    if (!(noteInput instanceof HTMLTextAreaElement)) {
      return;
    }
    const siteId = noteInput.dataset.noteTextInput || '';
    if (!siteId) {
      return;
    }
    state.noteDraftTexts[siteId] = noteInput.value;
    syncNotesCardControls(siteId);
  });
  notesListEl?.addEventListener('keydown', async (event) => {
    const input = event.target instanceof HTMLInputElement ? event.target.closest('[data-note-rank-input]') : null;
    if (!(input instanceof HTMLInputElement)) {
      const noteInput = event.target instanceof HTMLTextAreaElement ? event.target.closest('[data-note-text-input]') : null;
      if (!(noteInput instanceof HTMLTextAreaElement)) {
        return;
      }
      if (!(event.metaKey || event.ctrlKey) || event.key !== 'Enter') {
        return;
      }
      event.preventDefault();
      const siteId = noteInput.dataset.noteTextInput || '';
      if (!siteId) {
        return;
      }
      await submitNotesCard(siteId);
      return;
    }
    if (event.key !== 'Enter') {
      return;
    }
    event.preventDefault();
    const siteId = input.dataset.noteRankInput || '';
    if (!siteId) {
      return;
    }
    await submitNotesCard(siteId);
  });

  document.querySelectorAll('[data-close-note]').forEach((element) => {
    element.addEventListener('click', closeNoteEditor);
  });
  document.getElementById('close-note')?.addEventListener('click', closeNoteEditor);
  notePreviewButton?.addEventListener('click', () => {
    const siteId = noteModalEl?.dataset?.siteId || '';
    const entry = findEntryBySiteId(siteId);
    if (entry) {
      openFullscreenPreview(entry);
    }
  });
  noteSaveButton?.addEventListener('click', async () => {
    await submitNoteEditor();
  });
  noteClearButton?.addEventListener('click', async () => {
    const siteId = noteModalEl?.dataset?.siteId || '';
    if (!siteId || !(noteModalEl?.dataset?.initialNote || '')) {
      return;
    }
    await saveSiteNote(siteId, '');
  });
  noteTextEl?.addEventListener('input', () => {
    syncNoteEditorControls();
  });

  fullscreenMainButton?.addEventListener('click', () => {
    toggleFullscreenDraftMainSite();
  });
  fullscreenWhitelistButton?.addEventListener('click', () => {
    toggleFullscreenDraftSiteAccess();
  });
  fullscreenTvCastButton?.addEventListener('click', () => {
    openTvCastModal(state.fullscreenEntry);
  });
  fullscreenRedeployButton?.addEventListener('click', async () => {
    await redeployCurrentFullscreenSite();
  });
  fullscreenNoteButton?.addEventListener('click', () => {
    if (state.fullscreenEntry?.siteId) {
      openNoteEditor(state.fullscreenEntry.siteId);
    }
  });
  document.querySelectorAll('[data-close-tv-cast-modal]').forEach((element) => {
    element.addEventListener('click', closeTvCastModal);
  });
  tvCastListEl?.addEventListener('click', (event) => {
    const button = event.target instanceof Element ? event.target.closest('[data-tv-cast-target]') : null;
    if (!(button instanceof HTMLButtonElement)) {
      return;
    }
    const tvId = button.getAttribute('data-tv-cast-target') || '';
    const tv = getConnjureTvTargets().find((item) => item.id === tvId);
    if (tv && state.tvCastEntry) {
      void castSiteToTv(state.tvCastEntry, tv, button);
    }
  });
  fullscreenRefreshButton?.addEventListener('click', async () => {
    const entry = state.fullscreenEntry;
    if (!entry || !canMutateEntry(entry)) {
      return;
    }
    await refreshPreviewForEntry(entry, true, fullscreenRefreshButton);
  });
  fullscreenUnsavedDismissButton?.addEventListener('click', () => {
    state.fullscreenSiteState.dismissedDirtySignature = getFullscreenDirtySignature();
    syncFullscreenUnsavedNotice();
  });
  fullscreenRenameSaveButton?.addEventListener('click', () => {
    toggleFullscreenSubdomainEditor();
  });
  fullscreenRenameInputEl?.addEventListener('input', () => {
    const sanitized = sanitizeSiteIdInput(fullscreenRenameInputEl.value);
    if (fullscreenRenameInputEl.value !== sanitized) {
      fullscreenRenameInputEl.value = sanitized;
    }
    updateFullscreenDraftSiteState({ siteId: sanitized });
    syncFullscreenRenameControls();
    syncFullscreenSiteStateControls();
  });
  fullscreenRenameInputEl?.addEventListener('keydown', async (event) => {
    if (event.key !== 'Enter') {
      return;
    }
    event.preventDefault();
    state.fullscreenSiteState.subdomainEditing = false;
    syncFullscreenRenameControls();
    syncFullscreenSiteStateControls();
  });
  fullscreenSiteSelectEl?.addEventListener('change', () => {
    const nextSiteId = normalizeSiteId(fullscreenSiteSelectEl.value || '');
    if (!nextSiteId || nextSiteId === state.fullscreenEntry?.siteId) {
      return;
    }
    const nextEntry = findEntryBySiteId(nextSiteId);
    if (nextEntry) {
      openFullscreenPreview(nextEntry, { mode: state.fullscreenMode });
    }
  });
  fullscreenSiteSelectEl?.addEventListener('keydown', (event) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') {
      return;
    }
    event.preventDefault();
    navigateFullscreenGroupedSite(event.key === 'ArrowLeft' ? -1 : 1);
  });
  fullscreenTagToggleButton?.addEventListener('click', () => {
    toggleFullscreenTagPicker();
  });
  fullscreenTagSearchEl?.addEventListener('input', () => {
    updateFullscreenTagPickerQuery(fullscreenTagSearchEl.value);
  });
  fullscreenTagSearchEl?.addEventListener('keydown', async (event) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      closeFullscreenTagPicker({ focusToggle: true });
      return;
    }
    if (event.key !== 'Enter') {
      return;
    }
    event.preventDefault();
    await addFullscreenTag();
  });
  fullscreenTagsListEl?.addEventListener('click', async (event) => {
    const button = event.target instanceof Element ? event.target.closest('[data-tag-remove]') : null;
    if (!(button instanceof HTMLButtonElement)) {
      return;
    }
    const siteId = String(button.dataset.siteId || '').trim();
    const tagId = String(button.dataset.tagRemove || '').trim();
    if (!siteId || !tagId) {
      return;
    }
    await removeTagFromSite(siteId, tagId);
  });
  fullscreenTagPickerListEl?.addEventListener('click', async (event) => {
    const button = event.target instanceof Element ? event.target.closest('[data-tag-pick], [data-tag-create]') : null;
    if (!(button instanceof HTMLButtonElement)) {
      return;
    }
    if (button.dataset.tagPick) {
      await addTagToSite(state.fullscreenEntry?.siteId || '', button.dataset.tagPick);
      return;
    }
    if (button.dataset.tagCreate) {
      await addTagToSite(state.fullscreenEntry?.siteId || '', button.dataset.tagCreate);
    }
  });
  fullscreenSiteStateSaveButton?.addEventListener('click', async () => {
    await saveFullscreenSiteState();
  });
  fullscreenFriendlyNameInputEl?.addEventListener('input', () => {
    updateFullscreenDraftSiteState({
      displayName: normalizeFriendlyName(fullscreenFriendlyNameInputEl.value),
    });
    syncFullscreenSiteStateControls();
  });
  fullscreenFriendlyNameInputEl?.addEventListener('keydown', async (event) => {
    if (event.key !== 'Enter') {
      return;
    }
    event.preventDefault();
    await saveFullscreenSiteState();
  });
  fullscreenFriendlyNameInputEl?.addEventListener('blur', () => {
    const normalized = normalizeFriendlyName(fullscreenFriendlyNameInputEl.value);
    if (fullscreenFriendlyNameInputEl.value !== normalized) {
      fullscreenFriendlyNameInputEl.value = normalized;
    }
    updateFullscreenDraftSiteState({ displayName: normalized });
    syncFullscreenSiteStateControls();
  });
  fullscreenAliasesInputEl?.addEventListener('input', () => {
    updateFullscreenDraftSiteState({
      aliases: normalizeAliasList(fullscreenAliasesInputEl.value),
    });
    syncFullscreenSiteStateControls();
  });
  fullscreenAliasesInputEl?.addEventListener('keydown', async (event) => {
    if (event.key !== 'Enter') {
      return;
    }
    event.preventDefault();
    await saveFullscreenSiteState();
  });
  fullscreenAliasesInputEl?.addEventListener('blur', () => {
    const formatted = formatAliasList(fullscreenAliasesInputEl.value);
    if (fullscreenAliasesInputEl.value !== formatted) {
      fullscreenAliasesInputEl.value = formatted;
    }
    updateFullscreenDraftSiteState({ aliases: normalizeAliasList(formatted) });
    syncFullscreenSiteStateControls();
  });
  fullscreenRankInputEl?.addEventListener('input', () => {
    const parsedRank = parseFullscreenRankDraft();
    updateFullscreenDraftSiteState({
      manualRank: Number.isFinite(parsedRank) ? parsedRank : fullscreenRankInputEl.value,
    });
    syncFullscreenSiteStateControls();
  });
  fullscreenRankInputEl?.addEventListener('keydown', async (event) => {
    if (event.key !== 'Enter') {
      return;
    }
    event.preventDefault();
    await saveFullscreenSiteState();
  });
  composerVscodeButton?.addEventListener('click', () => {
    openVsCodeModal(resolveVsCodeModalSiteId());
  });
  document.querySelectorAll('[data-close-composer]').forEach((element) => {
    element.addEventListener('click', closeComposer);
  });
  document.getElementById('close-composer').addEventListener('click', closeComposer);

  window.addEventListener('resize', () => {
    scheduleFullscreenLiveViewportLayout();
    applyAuditPreviewScale();
    if (state.viewMode === 'swipe' && !isMobileSwipeViewport()) {
      state.viewMode = 'table';
      if (usePersistentViewState()) {
        localStorage.setItem(VIEW_STORAGE_KEY, state.viewMode);
      }
    }
    const nextSwipeMode = shouldUseMobileSwipeMode();
    const nextPageSize = calculateGalleryPageSize();
    const nextWallPageSize = calculateWallPageSize();
    const swipeModeChanged = nextSwipeMode !== state.swipeMode;
    const galleryPageSizeChanged = nextPageSize !== state.galleryPageSize;
    const wallPageSizeChanged = nextWallPageSize !== state.wallPageSize;
    const denseListVisible = state.viewMode === 'list';

    if (!swipeModeChanged && !galleryPageSizeChanged && !wallPageSizeChanged && !denseListVisible) {
      return;
    }

    if (galleryPageSizeChanged) {
      state.galleryPageSize = nextPageSize;
      clampGalleryPage();
    }

    if (wallPageSizeChanged) {
      state.wallPageSize = nextWallPageSize;
      clampWallPage();
    }

    state.swipeMode = nextSwipeMode;
    if (state.swipeMode) {
      initSwipeView();
    } else {
      toolbar?.classList.remove('toolbar--mobile-open', 'swipe-toolbar-open');
      toolbarToggle?.classList.remove('is-active');
      closeSwipeToolbar();
      swipeEls.frame?.removeAttribute('src');
    }

    if (denseListVisible && !swipeModeChanged && !galleryPageSizeChanged && !wallPageSizeChanged) {
      scheduleDenseListWindowRender();
      return;
    }

    render();
  });

  document.addEventListener('click', (event) => {
    if (!state.fullscreenTagPicker.open) {
      return;
    }
    if (!(event.target instanceof Element)) {
      closeFullscreenTagPicker();
      return;
    }
    if (event.target.closest('#fullscreen-tags-dock')) {
      return;
    }
    closeFullscreenTagPicker();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      if (state.fullscreenTagPicker.open) {
        closeFullscreenTagPicker({ focusToggle: true });
        return;
      }
      if (!tagManagerModalEl?.classList.contains('is-hidden')) {
        closeTagManagerModal();
        return;
      }
      if (!settingsModalEl?.classList.contains('is-hidden')) {
        closeSettingsModal();
        return;
      }
      if (!rankModalEl?.classList.contains('is-hidden')) {
        closeRankModal();
        return;
      }
      if (!vscodeModalEl?.classList.contains('is-hidden')) {
        closeVsCodeModal();
        return;
      }
      if (!composerModalEl?.classList.contains('is-hidden')) {
        closeComposer();
        return;
      }
      if (!bulkRenameModalEl?.classList.contains('is-hidden')) {
        closeBulkRenameModal();
        return;
      }
      closeNotesModal();
      closeNoteEditor();
      closeComposer();
      closeFullscreenPreview();
      closeSwipeToolbar();
      return;
    }

    if (!bulkRenameModalEl?.classList.contains('is-hidden')) {
      return;
    }

    if (handleTagManagerKeyboardEntry(event)) {
      return;
    }

    if (!tagManagerModalEl?.classList.contains('is-hidden')) {
      return;
    }

    if (!notesModalEl?.classList.contains('is-hidden')) {
      if (event.key === 'Backspace' && !isEditableKeyTarget(event.target)) {
        event.preventDefault();
        closeNotesModal();
      }
      return;
    }

    if (!noteModalEl.classList.contains('is-hidden')) {
      return;
    }

    handleFullscreenKeyboardEntry(event);
    handleBulkRenameKeyboardEntry(event);
    handleSlideshowKeyboardEntry(event);
    handleSwipeKeyboardEntry(event);
    handleTvKeyboardEntry(event);
    handleTableKeyboardEntry(event);
    handleGlobalSearchKeyboardEntry(event);
  });
  // Pointer-driven chrome reveal is owned by UI.Screensaver (its container
  // listeners). We just need visibilitychange to drive catalog refresh and
  // let the controller resume when the tab returns.
  document.addEventListener('visibilitychange', () => {
    syncSlideshowPlayback();
    if (document.visibilityState === 'visible') {
      void maybeRefreshCatalogOnResume('visibility');
    }
  });
  window.addEventListener('focus', () => {
    void maybeRefreshCatalogOnResume('focus');
  });
}

function setAuditFrameStatus(status) {
  const browserEl = auditFrameEl?.closest('.audit-browser');
  if (!browserEl || !auditFrameStatusEl) {
    return;
  }

  browserEl.dataset.status = status;
  const showStatus = status === 'empty' || status === 'error';
  auditFrameStatusEl.classList.toggle('is-hidden', !showStatus);
  const titleEl = auditFrameStatusEl.querySelector('strong');
  const copyEl = auditFrameStatusEl.querySelector('span');
  if (titleEl) {
    titleEl.textContent = status === 'empty' ? 'Pick a site to review' : 'Preview unavailable';
  }
  if (copyEl) {
    copyEl.textContent = status === 'empty'
      ? 'The live site preview appears here.'
      : 'Open the site directly to inspect it.';
  }
}

async function loadConfig() {
  const config = await fetchOptionalJson('./config.json');
  state.config = config ?? {};
  state.apiBaseUrl = String(state.config.apiBaseUrl ?? '').replace(/\/+$/, '');
}

async function refreshTagRegistry(options = {}) {
  let registry = [];

  if (state.apiBaseUrl) {
    try {
      const payload = await fetchJson(`${state.apiBaseUrl}/api/catalog/tags`);
      registry = Array.isArray(payload?.tags) ? payload.tags : [];
    } catch (error) {
      console.warn('Could not load tag registry, falling back to catalog-derived tags.', error);
    }
  }

  setTagRegistryState(registry);
  if (options.render !== false) {
    render();
  }
}

async function refreshDependencies(options = {}) {
  state.dependencies.loading = true;

  try {
    if (!state.apiBaseUrl) {
      applyDependenciesState({});
      return;
    }

    const payload = await fetchJson(`${state.apiBaseUrl}/api/dependencies`);
    applyDependenciesState(payload);
  } catch (error) {
    console.warn('Could not load dependency graph.', error);
    state.dependencies.error = error.message || 'Dependency graph unavailable.';
    state.dependencies.loaded = true;
  } finally {
    state.dependencies.loading = false;
    if (options.render !== false) {
      render();
    }
  }
}

function applyDependenciesState(payload = {}) {
  const statePayload = payload?.state && typeof payload.state === 'object' ? payload.state : payload;
  const nodeIds = normalizeDependencyNodeIds(statePayload.nodeIds || statePayload.nodes || []);
  const edges = normalizeDependencyEdges(statePayload.edges || [], nodeIds);
  const positions = normalizeDependencyPositions(statePayload.positions || {}, nodeIds);

  state.dependencies.nodeIds = nodeIds;
  state.dependencies.edges = edges;
  state.dependencies.positions = positions;
  state.dependencies.updatedAt = String(statePayload.updatedAt || payload?.updatedAt || '').trim();
  state.dependencies.error = '';
  state.dependencies.loaded = true;
  state.dependencies.savedSignature = getDependencySignature();

  if (state.dependencies.selectedSiteId && !nodeIds.has(state.dependencies.selectedSiteId)) {
    state.dependencies.selectedSiteId = '';
  }
}

function normalizeDependencyNodeIds(values) {
  const known = new Set(state.entries.map((entry) => entry.siteId));
  const nodeIds = new Set();
  for (const value of Array.isArray(values) ? values : []) {
    const siteId = normalizeCatalogToken(value);
    if (siteId && siteId !== ROOT_SITE_ID && (known.size === 0 || known.has(siteId))) {
      nodeIds.add(siteId);
    }
  }
  return nodeIds;
}

function normalizeDependencyEdges(values, nodeIds = state.dependencies.nodeIds) {
  const known = new Set(state.entries.map((entry) => entry.siteId));
  const edges = [];
  const seen = new Set();
  for (const value of Array.isArray(values) ? values : []) {
    const from = normalizeCatalogToken(value?.from || value?.source || value?.siteId);
    const to = normalizeCatalogToken(value?.to || value?.target || value?.dependsOn);
    if (!from || !to || from === to || from === ROOT_SITE_ID || to === ROOT_SITE_ID) {
      continue;
    }
    if (known.size > 0 && (!known.has(from) || !known.has(to))) {
      continue;
    }
    const key = `${from}->${to}`;
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    nodeIds.add(from);
    nodeIds.add(to);
    edges.push({ from, to });
  }
  return edges;
}

function normalizeDependencyPositions(value, nodeIds = state.dependencies.nodeIds) {
  const positions = {};
  const source = value && typeof value === 'object' ? value : {};
  for (const siteId of nodeIds) {
    const raw = source[siteId];
    const x = Number(raw?.x);
    const y = Number(raw?.y);
    if (Number.isFinite(x) && Number.isFinite(y)) {
      positions[siteId] = {
        x: Math.max(-5000, Math.min(5000, x)),
        y: Math.max(-5000, Math.min(5000, y)),
      };
    }
  }
  return positions;
}

async function loadPreviewManifest() {
  const manifest = await fetchOptionalJson(getPreviewManifestUrl());
  state.previewManifest = normalizePreviewManifest(manifest);
}

function getPreviewManifestUrl() {
  if (state.apiBaseUrl) {
    return `${state.apiBaseUrl}/api/previews/manifest.json`;
  }
  return PREVIEW_MANIFEST_PATH;
}

function hasBlockingCatalogRefreshDrafts() {
  if (isFullscreenFriendlyNameDirty() || isFullscreenAliasesDirty() || isFullscreenNoteDirty() || isFullscreenRankDirty()) {
    return true;
  }

  const noteInitial = noteModalEl?.dataset?.initialNote ?? '';
  const noteCurrent = noteTextEl?.value ?? '';
  if (!noteModalEl?.classList.contains('is-hidden') && noteCurrent !== noteInitial) {
    return true;
  }

  return false;
}

async function maybeRefreshCatalogOnResume(reason = 'resume') {
  if (!state.apiBaseUrl || document.visibilityState === 'hidden') {
    return false;
  }
  if (hasPendingTagManagerMutations()) {
    return false;
  }
  if (hasBlockingCatalogRefreshDrafts()) {
    return false;
  }
  if ((Date.now() - state.catalogRefreshedAt) < CATALOG_RESUME_REFRESH_MIN_INTERVAL_MS) {
    return false;
  }

  try {
    await refreshCatalogAndRestoreFullscreen();
    return true;
  } catch (error) {
    console.warn(`Could not refresh the Mullmania catalog on ${reason}.`, error);
    return false;
  }
}

async function refreshCatalog() {
  if (catalogRefreshPromise) {
    return catalogRefreshPromise;
  }

  catalogRefreshPromise = (async () => {
    const previousSelection = new Set(state.selected);
    const bundle = await loadCatalogBundle();
    const { sites, summary, liveCatalog, catalogMode, catalogSourceUrl } = bundle;

    if (catalogMode === 'error') {
      state.catalogMode = 'error';
      state.catalogError = bundle.catalogError || 'Catalog unavailable.';
      state.liveCatalog = false;
      renderCatalogError(state.catalogError);
      return;
    }

    state.catalogError = '';
    clearCatalogError();

    const rawEntries = sites
      .filter((entry) => entry.hasHostedSite !== false)
      .map((entry) => ({ ...entry, notes: normalizeCatalogEntryNotes(entry.notes) }));
    const entries = rawEntries.map(enrichEntry);
    state.mainSiteId = resolveMainSiteId(entries, summary);
    applyMainSiteId(entries, state.mainSiteId);
    state.entries = entries;
    state.rawEntries = rawEntries;
    state.rawSummary = summary ? { ...summary } : {};
    state.summary = summarizeMainSiteState(summary, entries, state.mainSiteId);
    state.catalogMode = catalogMode;
    state.catalogSourceUrl = catalogSourceUrl;
    state.liveCatalog = liveCatalog;
    state.catalogRefreshedAt = Date.now();
    state.selected = new Set(
      state.entries
        .filter((entry) => previousSelection.has(entry.siteId))
        .map((entry) => entry.siteId)
    );

    await refreshTagRegistry({ render: false });
    render();
  })();

  try {
    await catalogRefreshPromise;
  } finally {
    catalogRefreshPromise = null;
  }
}

async function refreshCatalogAndRestoreFullscreen(siteId = '') {
  const activeFullscreenSiteId = state.fullscreenEntry?.siteId || '';
  const restoreMode = state.fullscreenMode;
  const shouldRestore = Boolean(
    activeFullscreenSiteId
    && (!siteId || siteId === activeFullscreenSiteId)
    && fullscreenModalEl
    && !fullscreenModalEl.classList.contains('is-hidden')
  );

  await refreshCatalog();

  if (!shouldRestore) {
    return;
  }

  const nextEntry = resolveDisplayEntryForSite(activeFullscreenSiteId) || findEntryBySiteId(activeFullscreenSiteId);
  if (!nextEntry) {
    closeFullscreenPreview({ force: true });
    return;
  }

  state.fullscreenEntry = nextEntry;
  openFullscreenPreview(nextEntry, { mode: restoreMode === 'qr' ? 'qr' : 'preview' });
}

function renderCatalogError(message) {
  clearCatalogError();
  const banner = document.createElement('div');
  banner.id = 'catalog-error-banner';
  banner.setAttribute('role', 'alert');
  banner.style.cssText = 'position:fixed;top:0;left:0;right:0;z-index:9999;padding:1rem 1.5rem;background:#8d2f1f;color:#fff;font-weight:600;text-align:center;font-size:0.95rem;';
  banner.textContent = message;
  document.body.prepend(banner);
}

function clearCatalogError() {
  const existing = document.getElementById('catalog-error-banner');
  if (existing) {
    existing.remove();
  }
}

async function loadCatalogBundle() {
  const csvUrl = resolveRequestedCsvUrl();
  if (csvUrl) {
    try {
      return await loadCsvCatalogBundle(csvUrl);
    } catch (error) {
      console.warn('Falling back to built or live Mullmania catalog after CSV import failed.', error);
    }
  }

  if (state.apiBaseUrl) {
    try {
      const payload = await fetchJson(`${state.apiBaseUrl}/api/catalog`, { cache: 'default' });
      return {
        sites: payload.sites ?? [],
        summary: payload.summary ?? {},
        liveCatalog: true,
        catalogMode: 'catalog',
        catalogSourceUrl: '',
      };
    } catch (error) {
      console.warn('Live catalog API unreachable. Falling back to the built catalog.', error);
      const fallback = await loadBuiltCatalogBundle();
      if (fallback) {
        return {
          ...fallback,
          catalogMode: 'built-fallback',
          catalogSourceUrl: './catalog.json',
        };
      }
      return buildCatalogLoadError(`Catalog API failed: ${error.message || 'unknown error'}`);
    }
  }

  return await loadBuiltCatalogBundle() ?? buildCatalogLoadError('No API endpoint configured and no built catalog was found.');
}

async function loadBuiltCatalogBundle() {
  try {
    const [sites, summary] = await Promise.all([
      fetchJson('./catalog.json'),
      fetchOptionalJson('./summary.json'),
    ]);
    return {
      sites: Array.isArray(sites) ? sites : [],
      summary: summary && typeof summary === 'object' ? summary : {},
      liveCatalog: false,
      catalogMode: 'built',
      catalogSourceUrl: './catalog.json',
    };
  } catch (error) {
    console.warn('Built catalog unavailable.', error);
    return null;
  }
}

function buildCatalogLoadError(message) {
  return {
    sites: [],
    summary: {},
    liveCatalog: false,
    catalogMode: 'error',
    catalogSourceUrl: '',
    catalogError: message,
  };
}

function resolveMainSiteId(entries, summary) {
  if (summary?.csvImport === true) {
    const explicitCsvMain = typeof summary?.mainSiteId === 'string' ? summary.mainSiteId.trim() : '';
    return explicitCsvMain && entries.some((entry) => entry.siteId === explicitCsvMain)
      ? explicitCsvMain
      : '';
  }

  const summarySiteId = typeof summary?.mainSiteId === 'string' ? summary.mainSiteId.trim() : '';
  if (summarySiteId && entries.some((entry) => entry.siteId === summarySiteId)) {
    return summarySiteId;
  }

  const explicitMain = entries.find((entry) => entry.mainSite);
  if (explicitMain) {
    return explicitMain.siteId;
  }

  if (entries.some((entry) => entry.siteId === ROOT_SITE_ID)) {
    return ROOT_SITE_ID;
  }

  return entries[0]?.siteId ?? '';
}

async function loadCsvCatalogBundle(csvUrl) {
  const response = await fetch(csvUrl, { cache: 'no-store' });
  if (!response.ok) {
    throw new Error(`Failed to load CSV feed ${csvUrl}: ${response.status}`);
  }

  const csvText = await response.text();
  const parsed = parseCsvRecords(csvText);
  const { sites, summary } = buildCsvCatalogBundle(parsed, csvUrl);
  return {
    sites,
    summary,
    liveCatalog: false,
    catalogMode: 'csv',
    catalogSourceUrl: csvUrl,
  };
}

function resolveRequestedCsvUrl() {
  const url = new URL(window.location.href);
  return normalizeCatalogCsvUrl(url.searchParams.get('csv'));
}

function normalizeCatalogCsvUrl(value) {
  const raw = String(value || '').trim();
  if (!raw) {
    return '';
  }

  try {
    const url = new URL(raw, window.location.href);
    if (!/^https?:$/i.test(url.protocol)) {
      return '';
    }
    return url.toString();
  } catch {
    return '';
  }
}

function parseCsvRecords(text) {
  const rows = [];
  let row = [];
  let cell = '';
  let inQuotes = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];

    if (inQuotes) {
      if (char === '"' && next === '"') {
        cell += '"';
        index += 1;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        cell += char;
      }
      continue;
    }

    if (char === '"') {
      inQuotes = true;
      continue;
    }

    if (char === ',') {
      row.push(cell);
      cell = '';
      continue;
    }

    if (char === '\r') {
      if (next === '\n') {
        index += 1;
      }
      row.push(cell);
      rows.push(row);
      row = [];
      cell = '';
      continue;
    }

    if (char === '\n') {
      row.push(cell);
      rows.push(row);
      row = [];
      cell = '';
      continue;
    }

    cell += char;
  }

  if (cell.length > 0 || row.length > 0) {
    row.push(cell);
    rows.push(row);
  }

  if (rows.length > 0 && rows[0].length > 0) {
    rows[0][0] = String(rows[0][0] || '').replace(/^\uFEFF/, '');
  }

  return rows;
}

function buildCsvCatalogBundle(rows, csvUrl) {
  if (!Array.isArray(rows) || rows.length === 0) {
    return {
      sites: [],
      summary: {
        csvImport: true,
        csvSourceUrl: csvUrl,
        visibleHostedSites: 0,
        stats: {
          catalogSiteCount: 0,
          hostedSiteCount: 0,
          dataNamespaceCount: 0,
          syntheticSiteCount: 0,
          operatorNoteCount: 0,
          demoPosterCount: 0,
          demoVideoCount: 0,
        },
      },
    };
  }

  const headerRow = rows[0].map((value) => normalizeCsvHeader(value));
  const seenSiteIds = new Map();
  const entries = rows
    .slice(1)
    .filter((row) => row.some((cell) => String(cell || '').trim()))
    .map((row, index) => buildCsvCatalogEntry(headerRow, row, csvUrl, index, seenSiteIds))
    .filter(Boolean);

  applyCsvFamilyMeta(entries);

  const demoPosterCount = entries.filter((entry) => Boolean(entry.demo?.posterUrl)).length;
  const demoVideoCount = entries.filter((entry) =>
    Array.isArray(entry.demo?.sources) && entry.demo.sources.some((source) => String(source?.type || '').startsWith('video/'))
  ).length;

  return {
    sites: entries,
    summary: {
      csvImport: true,
      csvSourceUrl: csvUrl,
      launchpadBuiltAt: new Date().toISOString(),
      visibleHostedSites: entries.length,
      mainSiteId: null,
      mainSiteHost: null,
      mainSiteUrl: null,
      stats: {
        catalogSiteCount: entries.length,
        hostedSiteCount: entries.length,
        dataNamespaceCount: 0,
        syntheticSiteCount: 0,
        operatorNoteCount: 0,
        demoPosterCount,
        demoVideoCount,
      },
    },
  };
}

function normalizeCsvHeader(value) {
  return normalizeCatalogToken(String(value || '').replace(/\s+/g, '')).replace(/[^a-z0-9]/g, '');
}

function buildCsvCatalogEntry(headers, row, csvUrl, rowIndex, seenSiteIds) {
  const record = Object.create(null);
  headers.forEach((header, index) => {
    if (!header) {
      return;
    }
    record[header] = String(row[index] || '').trim();
  });

  const entryUrl = normalizeCsvEntryUrl(
    firstCsvValue(record, ['url', 'href', 'link', 'siteurl', 'website']),
    csvUrl
  );
  if (!entryUrl) {
    return null;
  }

  const entryHost = extractHostFromUrl(entryUrl);
  const rawSiteId = firstCsvValue(record, ['siteid', 'site', 'slug', 'id', 'name', 'title', 'displayname'])
    || entryHost
    || `imported-${rowIndex + 1}`;
  const baseSiteId = normalizeSiteId(rawSiteId)
    || normalizeSiteId(entryHost)
    || `imported-${rowIndex + 1}`;
  const siteId = dedupeCsvSiteId(baseSiteId, seenSiteIds);
  const displayName = firstCsvValue(record, ['displayname', 'title', 'name']) || siteId;
  const description = firstCsvValue(record, ['description', 'summary', 'note']);
  const tags = splitCsvTagList(firstCsvValue(record, ['tags', 'tag']));
  const showcaseRank = Number.parseInt(firstCsvValue(record, ['showcaserank', 'rank']), 10);
  const familyRaw = firstCsvValue(record, ['familyid', 'family', 'groupid', 'group']);
  const familyLabel = firstCsvValue(record, ['familylabel', 'grouplabel']) || familyRaw;
  const demoPosterUrl = normalizeCsvEntryUrl(firstCsvValue(record, ['posterurl', 'poster']), csvUrl);
  const demoVideoUrl = normalizeCsvEntryUrl(firstCsvValue(record, ['videourl', 'video', 'videosrc']), csvUrl);
  const demoVideoType = firstCsvValue(record, ['videotype', 'mimetype', 'type']) || inferCsvMediaType(demoVideoUrl);
  const demoDuration = Number(firstCsvValue(record, ['durationsec', 'duration']));
  const familyId = normalizeSiteId(familyRaw) || '';

  const entry = {
    siteId,
    host: entryHost,
    url: entryUrl,
    displayName,
    description,
    tags: Array.from(new Set(['csv-loaded', ...tags])),
    hasHostedSite: true,
    currentHostedSite: false,
    hasData: false,
    syntheticIndex: false,
    frameworkSite: false,
    manualRank: 0,
    showcaseRank: Number.isFinite(showcaseRank) ? showcaseRank : 0,
    catalogSource: 'csv',
    externalCatalog: true,
    managedBy: 'csv-import',
  };

  if (familyId) {
    entry.family = {
      id: familyId,
      label: familyLabel || familyId,
      kind: 'csv-feed',
      leadSiteId: siteId,
      memberOrder: 1,
      count: 1,
    };
  }

  if (demoPosterUrl || demoVideoUrl || Number.isFinite(demoDuration)) {
    entry.demo = {
      posterUrl: demoPosterUrl || '',
      sources: demoVideoUrl ? [{ src: demoVideoUrl, type: demoVideoType || 'video/mp4' }] : [],
      durationSec: Number.isFinite(demoDuration) && demoDuration > 0 ? demoDuration : null,
      mode: demoVideoUrl ? 'video' : (demoPosterUrl ? 'poster' : null),
      posterKind: demoPosterUrl ? 'csv-feed' : null,
      posterNote: 'Imported from CSV feed.',
    };
  }

  return entry;
}

function firstCsvValue(record, keys) {
  for (const key of keys) {
    const value = String(record[key] || '').trim();
    if (value) {
      return value;
    }
  }
  return '';
}

function normalizeCsvEntryUrl(value, csvUrl) {
  const raw = String(value || '').trim();
  if (!raw) {
    return '';
  }

  try {
    const url = new URL(raw, csvUrl || window.location.href);
    if (!/^https?:$/i.test(url.protocol)) {
      return '';
    }
    return url.toString();
  } catch {
    return '';
  }
}

function extractHostFromUrl(value) {
  try {
    return new URL(String(value || '')).host || '';
  } catch {
    return '';
  }
}

function inferCsvMediaType(value) {
  const raw = String(value || '').trim().toLowerCase();
  if (!raw) {
    return '';
  }
  if (raw.endsWith('.webm')) {
    return 'video/webm';
  }
  if (raw.endsWith('.mov')) {
    return 'video/quicktime';
  }
  if (raw.endsWith('.m4v')) {
    return 'video/x-m4v';
  }
  if (raw.endsWith('.png')) {
    return 'image/png';
  }
  if (raw.endsWith('.jpg') || raw.endsWith('.jpeg')) {
    return 'image/jpeg';
  }
  if (raw.endsWith('.webp')) {
    return 'image/webp';
  }
  if (raw.endsWith('.svg')) {
    return 'image/svg+xml';
  }
  return 'video/mp4';
}

function dedupeCsvSiteId(siteId, seenSiteIds) {
  const count = seenSiteIds.get(siteId) || 0;
  seenSiteIds.set(siteId, count + 1);
  if (count === 0) {
    return siteId;
  }
  return `${siteId}-${count + 1}`;
}

function splitCsvTagList(value) {
  return String(value || '')
    .split(/[|;,]/)
    .map((part) => normalizeCatalogToken(part))
    .filter(Boolean);
}

function applyCsvFamilyMeta(entries) {
  const groups = new Map();
  for (const entry of entries) {
    if (!entry.family?.id) {
      continue;
    }
    const key = entry.family.id;
    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key).push(entry);
  }

  groups.forEach((members) => {
    const ordered = [...members].sort(compareAlphabetical);
    const leadSiteId = ordered[0]?.siteId || '';
    ordered.forEach((entry, index) => {
      entry.family = {
        ...entry.family,
        count: ordered.length,
        memberOrder: index + 1,
        leadSiteId,
      };
    });
  });
}

function applyMainSiteId(entries, mainSiteId) {
  entries.forEach((entry) => {
    const isMainSite = entry.siteId === mainSiteId;
    entry.mainSite = isMainSite;
    if (entry.categories) {
      entry.categories.main = isMainSite;
    }
  });
}

function summarizeMainSiteState(summary, entries, mainSiteId) {
  const nextSummary = { ...(summary ?? {}) };
  const mainEntry = entries.find((entry) => entry.siteId === mainSiteId) ?? null;
  nextSummary.mainSiteId = mainSiteId || null;
  nextSummary.mainSiteHost = mainEntry?.host ?? null;
  nextSummary.mainSiteUrl = mainEntry?.url ?? null;
  return nextSummary;
}

function normalizePreviewManifest(manifest) {
  const entries = manifest?.entries;
  if (!entries || typeof entries !== 'object' || Array.isArray(entries)) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(entries)
      .filter(([, value]) => value && typeof value === 'object' && value.status === 'ok')
      .map(([siteId, value]) => [siteId, normalizePreviewManifestEntry(siteId, value)])
  );
}

function normalizePreviewManifestEntry(siteId, value = {}) {
  const version = String(value.version ?? '').trim();
  const path = String(value.path || `/api/previews/${siteId}.png`).trim() || `/api/previews/${siteId}.png`;
  const rawUrl = String(value.url || '').trim() || (version ? `${path}?v=${encodeURIComponent(version)}` : path);
  const url = resolvePreviewAssetUrl(rawUrl);
  const screenshots = normalizePreviewScreenshotList(siteId, value, { path, url, version });
  return {
    siteId,
    status: 'ok',
    path,
    url,
    version,
    capturedAt: String(value.capturedAt || '').trim() || null,
    objectKey: String(value.objectKey || '').trim() || null,
    screenshots,
  };
}

function normalizePreviewScreenshotList(siteId, value = {}, fallback = {}) {
  const seen = new Set();
  const screenshots = [];
  const rawScreenshots = Array.isArray(value.screenshots) ? value.screenshots : [];
  const keysForScreenshot = (screenshot) => [
    screenshot?.path,
    screenshot?.url,
    screenshot?.objectKey,
    screenshot?.version,
  ].filter(Boolean);

  for (const item of rawScreenshots) {
    const screenshot = normalizePreviewScreenshot(siteId, item);
    if (!screenshot) {
      continue;
    }
    const keys = keysForScreenshot(screenshot);
    if (keys.length > 0 && !keys.some((key) => seen.has(key))) {
      keys.forEach((key) => seen.add(key));
      screenshots.push(screenshot);
    }
  }

  if (fallback.url || fallback.path) {
    const fallbackScreenshot = normalizePreviewScreenshot(siteId, {
      path: fallback.path,
      url: fallback.url,
      version: fallback.version,
      capturedAt: value.capturedAt,
      objectKey: value.objectKey,
      label: 'Latest',
      params: value.params,
      style: value.style,
    });
    const fallbackKeys = keysForScreenshot(fallbackScreenshot);
    if (fallbackScreenshot && fallbackKeys.length > 0 && !fallbackKeys.some((key) => seen.has(key))) {
      fallbackKeys.forEach((key) => seen.add(key));
      screenshots.unshift(fallbackScreenshot);
    }
  }

  return screenshots;
}

function normalizePreviewScreenshot(siteId, value = {}) {
  if (!value || typeof value !== 'object') {
    return null;
  }
  const version = String(value.version ?? '').trim();
  const path = String(value.path || '').trim();
  const rawUrl = String(value.url || '').trim() || (version && path ? `${path}?v=${encodeURIComponent(version)}` : path);
  const url = resolvePreviewAssetUrl(rawUrl);
  if (!url && !path) {
    return null;
  }
  return {
    siteId,
    status: 'ok',
    path,
    url,
    version,
    capturedAt: String(value.capturedAt || '').trim() || null,
    objectKey: String(value.objectKey || '').trim() || null,
    label: String(value.label || '').trim(),
    style: String(value.style || '').trim(),
    params: value.params && typeof value.params === 'object' ? value.params : null,
    width: Number(value.width) || null,
    height: Number(value.height) || null,
  };
}

function setPreviewManifestEntry(siteId, value) {
  state.previewManifest[siteId] = normalizePreviewManifestEntry(siteId, value);
}

function renamePreviewManifestEntry(previousSiteId, nextSiteId, value = null) {
  if (!previousSiteId || !nextSiteId) {
    return;
  }

  if (value) {
    setPreviewManifestEntry(nextSiteId, value);
  } else if (state.previewManifest[previousSiteId]) {
    state.previewManifest[nextSiteId] = normalizePreviewManifestEntry(nextSiteId, state.previewManifest[previousSiteId]);
  }

  if (previousSiteId !== nextSiteId) {
    delete state.previewManifest[previousSiteId];
  }
}

function getPreviewManifestEntry(siteId) {
  return state.previewManifest[siteId] || null;
}

function getPreviewUrl(siteId) {
  const entry = getPreviewManifestEntry(siteId);
  return entry?.url || '';
}

function buildPreviewResizeRequestUrl(sourceUrl, options = {}) {
  const source = resolvePreviewAssetUrl(sourceUrl);
  if (!source || source === PREVIEW_PLACEHOLDER_URL) {
    return '';
  }
  try {
    const parsedSource = new URL(source, window.location.href);
    if (['localhost', '127.0.0.1', '::1'].includes(parsedSource.hostname)) {
      return '';
    }
  } catch (error) {
    return '';
  }

  const width = Math.round(Number(options.width ?? options.w ?? 0));
  const height = Math.round(Number(options.height ?? options.h ?? 0));
  const longestEdge = Math.round(Number(options.longestEdge ?? options.max ?? 0));
  const quality = Math.round(Number(options.quality ?? options.q ?? 72));
  const format = String(options.format || 'webp').trim().toLowerCase();
  const params = new URLSearchParams({ url: source });

  if (width > 0) {
    params.set('w', String(width));
  }
  if (height > 0) {
    params.set('h', String(height));
  }
  if (longestEdge > 0) {
    params.set('max', String(longestEdge));
  }
  if (format) {
    params.set('format', format);
  }
  if (quality > 0) {
    params.set('q', String(Math.min(Math.max(quality, 1), 100)));
  }
  if (!params.has('w') && !params.has('h') && !params.has('max')) {
    return '';
  }

  return `${imageFiberOrigin()}/api/Gallery/resize?${params.toString()}`;
}

function getPreviewScreenshots(siteId) {
  const entry = getPreviewManifestEntry(siteId);
  return Array.isArray(entry?.screenshots) ? entry.screenshots : [];
}

function hasPreviewImage(entry) {
  return Boolean(getPreviewUrl(entry?.siteId));
}

// Canon placeholder route. When a site's posterKind is the legacy
// 'generated-placeholder' (cream/serif Georgia SVG baked into each repo),
// route through the sites API so we get a sans-serif canon SVG built
// from live catalog data. Real screenshot posters (showcase-reel) are unaffected.
const LAUNCHPAD_API_ORIGIN = typeof window === 'undefined'
  ? `${sitesOrigin()}/api`
  : `${window.location.origin.replace(/\/+$/, '')}/api`;
function resolvePosterUrl(entry) {
  const demo = entry?.demo || {};
  if (demo.posterKind === 'generated-placeholder' && entry?.siteId) {
    return `${LAUNCHPAD_API_ORIGIN}/placeholder/${encodeURIComponent(entry.siteId)}.svg`;
  }
  return demo.posterUrl || '';
}

function getOperatorNote(entry) {
  return typeof entry?.operatorNote === 'string'
    ? entry.operatorNote.replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim()
    : '';
}

function hasOperatorNote(entry) {
  return Boolean(getOperatorNote(entry));
}

function buildOperatorNotePreview(entry) {
  const note = getOperatorNote(entry).replace(/\s+/g, ' ').trim();
  if (!note) {
    return '';
  }
  return note.length > 96 ? `${note.slice(0, 93)}...` : note;
}

function normalizeManagedTagLabel(value) {
  return String(value || '').replace(/\s+/g, ' ').trim();
}

function normalizeManagedTagId(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^-+|-+$/g, '');
}

function canonicalizeCategoryTagId(value) {
  const normalizedTagId = normalizeManagedTagId(value);
  if (!normalizedTagId) {
    return '';
  }
  return CATEGORY_TAG_ALIAS_BY_ID.get(normalizedTagId) || '';
}

function resolveManagedTagId(value) {
  return canonicalizeCategoryTagId(value);
}

function normalizeManagedTagList(values) {
  return Array.from(
    new Set(
      (Array.isArray(values) ? values : [])
        .map((value) => resolveManagedTagId(value))
        .filter((value) => !isReservedCatalogTagId(value))
        .filter(Boolean)
    )
  );
}

function buildFallbackManagedTagLabel(tagId) {
  const formatted = formatSlideshowDescriptorTag(tagId);
  return formatted || humanizeToken(tagId || '');
}

function getEntryOperatorTags(entry) {
  return normalizeManagedTagList([
    ...(Array.isArray(entry?.tags) ? entry.tags : []),
    ...(Array.isArray(entry?.operatorTags) ? entry.operatorTags : []),
  ]).sort(compareCatalogTagIds);
}

function normalizeTagRegistryEntry(value) {
  const label = normalizeManagedTagLabel(value?.label || value?.name || value?.id || value?.tagId || '');
  const id = resolveManagedTagId(value?.id || value?.tagId || label);
  if (!id || isReservedCatalogTagId(id)) {
    return null;
  }

  return {
    id,
    label: label || CATEGORY_TAG_LABEL_BY_ID.get(id) || buildFallbackManagedTagLabel(id),
    createdAt: String(value?.createdAt || '').trim() || null,
    updatedAt: String(value?.updatedAt || '').trim() || null,
  };
}

function setTagRegistryState(registry) {
  const normalized = Array.from(
    new Map(
      (Array.isArray(registry) ? registry : [])
        .map((entry) => normalizeTagRegistryEntry(entry))
        .filter(Boolean)
        .map((entry) => [entry.id, entry])
    ).values()
  ).sort((left, right) => left.label.localeCompare(right.label));

  state.tagRegistry = normalized;
  invalidateDerivedTagRegistryCache();
}

function getManagedTagRegistryEntries() {
  if (derivedTagRegistryCache.managedEntries) {
    return derivedTagRegistryCache.managedEntries;
  }

  const counts = new Map();
  const samples = new Map();

  for (const entry of state.entries) {
    for (const tagId of getEntryOperatorTags(entry)) {
      counts.set(tagId, (counts.get(tagId) || 0) + 1);
      const sampleList = samples.get(tagId) || [];
      if (sampleList.length < 5) {
        sampleList.push(entry.siteId);
        samples.set(tagId, sampleList);
      }
    }
  }

  const seedEntries = state.tagRegistry.length > 0
    ? state.tagRegistry
    : CATEGORY_TAG_DEFINITIONS;
  const registry = new Map(seedEntries.map((entry) => [entry.id, {
    id: entry.id,
    label: entry.label,
    createdAt: entry.createdAt || null,
    updatedAt: entry.updatedAt || null,
  }]));

  derivedTagRegistryCache.managedEntries = Array.from(registry.values())
    .map((entry) => ({
      ...entry,
      siteCount: counts.get(entry.id) || 0,
      samples: samples.get(entry.id) || [],
    }))
    .sort((left, right) => left.label.localeCompare(right.label));
  derivedTagRegistryCache.managedEntryMap = new Map(
    derivedTagRegistryCache.managedEntries.map((entry) => [entry.id, entry])
  );

  return derivedTagRegistryCache.managedEntries;
}

function isBatchCatalogTagId(tagId) {
  const normalizedTagId = normalizeCatalogToken(tagId);
  return BATCH_CATALOG_TAG_PATTERN.test(normalizedTagId);
}

function getBatchCatalogTagNumber(tagId) {
  const normalizedTagId = normalizeCatalogToken(tagId);
  const match = normalizedTagId.match(BATCH_CATALOG_TAG_PATTERN);
  return match ? Number.parseInt(match[1], 10) : NaN;
}

function getCatalogTagLabel(tagId) {
  const normalizedTagId = normalizeCatalogToken(tagId);
  if (!normalizedTagId) {
    return '';
  }
  const categoryLabel = CATEGORY_TAG_LABEL_BY_ID.get(normalizedTagId);
  if (categoryLabel) {
    return categoryLabel;
  }

  const batchNumber = getBatchCatalogTagNumber(normalizedTagId);
  if (Number.isFinite(batchNumber)) {
    return `Batch ${batchNumber}`;
  }

  return normalizedTagId
    .split('-')
    .filter(Boolean)
    .map((part) => TAG_LABEL_TOKEN_OVERRIDES.get(part) || (part.charAt(0).toUpperCase() + part.slice(1)))
    .join(' ');
}

function compareCatalogTagIds(leftTagId, rightTagId) {
  const leftBatchNumber = getBatchCatalogTagNumber(leftTagId);
  const rightBatchNumber = getBatchCatalogTagNumber(rightTagId);
  if (Number.isFinite(leftBatchNumber) && Number.isFinite(rightBatchNumber)) {
    return leftBatchNumber - rightBatchNumber;
  }
  if (Number.isFinite(leftBatchNumber)) {
    return 1;
  }
  if (Number.isFinite(rightBatchNumber)) {
    return -1;
  }
  return getCatalogTagLabel(leftTagId).localeCompare(getCatalogTagLabel(rightTagId), undefined, {
    numeric: true,
    sensitivity: 'base',
  });
}

function getReservedCatalogTagIds() {
  return new Set(FILTER_ONLY_CATALOG_TAG_IDS);
}

function getEntryCatalogTagIds(entry) {
  if (!entry) {
    return [];
  }
  return normalizeManagedTagList([
    ...(Array.isArray(entry.tags) ? entry.tags : []),
    ...(Array.isArray(entry.operatorTags) ? entry.operatorTags : []),
  ]);
}

function getEntryCatalogFilterTagIds(entry) {
  return getEntryCatalogTagIds(entry);
}

function getCatalogTagRegistryEntries() {
  if (derivedTagRegistryCache.catalogEntries) {
    return derivedTagRegistryCache.catalogEntries;
  }

  const registry = new Map();
  const managedTagIds = new Set(getManagedTagRegistryEntries().map((entry) => entry.id));

  for (const entry of state.entries) {
    for (const tagId of getEntryCatalogTagIds(entry)) {
      const normalizedTagId = normalizeCatalogToken(tagId);
      if (!normalizedTagId || !managedTagIds.has(normalizedTagId)) {
        continue;
      }

      let tag = registry.get(normalizedTagId);
      if (!tag) {
        tag = {
          id: normalizedTagId,
          label: getManagedTagLabel(normalizedTagId),
          siteCount: 0,
          samples: [],
          createdAt: null,
          updatedAt: null,
          system: false,
          editable: true,
        };
        registry.set(normalizedTagId, tag);
      }

      tag.siteCount += 1;
      if (tag.samples.length < 5) {
        tag.samples.push(entry.siteId);
      }
    }
  }

  derivedTagRegistryCache.catalogEntries = Array.from(registry.values()).sort((left, right) => compareCatalogTagIds(left.id, right.id));
  return derivedTagRegistryCache.catalogEntries;
}

function getCatalogFilterRegistryEntries() {
  if (derivedTagRegistryCache.filterEntries) {
    return derivedTagRegistryCache.filterEntries;
  }

  const registry = new Map();
  const managedTagIds = new Set(getManagedTagRegistryEntries().map((entry) => entry.id));

  for (const entry of state.entries) {
    for (const tagId of getEntryCatalogFilterTagIds(entry)) {
      const normalizedTagId = normalizeCatalogToken(tagId);
      if (!normalizedTagId || (!managedTagIds.has(normalizedTagId) && !FILTER_ONLY_CATALOG_TAG_IDS.has(normalizedTagId))) {
        continue;
      }

      let tag = registry.get(normalizedTagId);
      if (!tag) {
        tag = {
          id: normalizedTagId,
          label: FILTER_ONLY_CATALOG_TAG_IDS.has(normalizedTagId)
            ? getCatalogTagLabel(normalizedTagId)
            : getManagedTagLabel(normalizedTagId),
          siteCount: 0,
          samples: [],
          createdAt: null,
          updatedAt: null,
          system: FILTER_ONLY_CATALOG_TAG_IDS.has(normalizedTagId),
          editable: !FILTER_ONLY_CATALOG_TAG_IDS.has(normalizedTagId),
          filterOnly: FILTER_ONLY_CATALOG_TAG_IDS.has(normalizedTagId),
        };
        registry.set(normalizedTagId, tag);
      }

      tag.siteCount += 1;
      if (tag.samples.length < 5) {
        tag.samples.push(entry.siteId);
      }
    }
  }

  derivedTagRegistryCache.filterEntries = Array.from(registry.values()).sort((left, right) => compareCatalogTagIds(left.id, right.id));
  return derivedTagRegistryCache.filterEntries;
}

function getCatalogTagDefinition(tagId) {
  const normalizedTagId = normalizeCatalogToken(tagId);
  if (!normalizedTagId) {
    return null;
  }
  return getCatalogFilterRegistryEntries().find((entry) => entry.id === normalizedTagId)
    || (getReservedCatalogTagIds().has(normalizedTagId)
      ? {
        id: normalizedTagId,
        label: getCatalogTagLabel(normalizedTagId),
        siteCount: 0,
        samples: [],
        createdAt: null,
        updatedAt: null,
        system: true,
        editable: false,
        filterOnly: FILTER_ONLY_CATALOG_TAG_IDS.has(normalizedTagId),
      }
      : null);
}

function getCatalogTagManagerEntries() {
  return [];
}

function getTagManagerRegistryEntries() {
  if (derivedTagRegistryCache.tagManagerEntries) {
    return derivedTagRegistryCache.tagManagerEntries;
  }

  const combined = new Map();

  for (const entry of getCatalogTagManagerEntries()) {
    combined.set(entry.id, entry);
  }

  for (const entry of getCatalogTagRegistryEntries()) {
    combined.set(entry.id, entry);
  }

  for (const entry of getManagedTagRegistryEntries()) {
    if (combined.has(entry.id)) {
      const existing = combined.get(entry.id);
      combined.set(entry.id, {
        ...existing,
        ...entry,
        system: Boolean(existing?.system),
        editable: !(existing?.system),
        filterOnly: Boolean(existing?.filterOnly),
      });
      continue;
    }
    combined.set(entry.id, {
      ...entry,
      system: false,
      editable: true,
    });
  }

  derivedTagRegistryCache.tagManagerEntries = Array.from(combined.values());
  return derivedTagRegistryCache.tagManagerEntries;
}

function getManagedTagEntry(tagId) {
  const normalizedTagId = normalizeManagedTagId(tagId);
  if (!normalizedTagId) {
    return null;
  }
  if (!derivedTagRegistryCache.managedEntryMap) {
    getManagedTagRegistryEntries();
  }
  return derivedTagRegistryCache.managedEntryMap?.get(normalizedTagId) || null;
}

function getManagedTagLabel(tagId) {
  return getManagedTagEntry(tagId)?.label || buildFallbackManagedTagLabel(tagId);
}

function getEntryCatalogDisplayTags(entry) {
  if (!entry) {
    return [];
  }

  return getEntryCatalogTagIds(entry)
    .map((tagId) => ({
      id: tagId,
      label: getManagedTagLabel(tagId),
      removable: true,
      system: false,
    }));
}

function getEntryDisplayTags(entry) {
  return getEntryCatalogDisplayTags(entry);
}

function getEntryModifiedDetails(entry) {
  const candidates = Array.isArray(entry?.familyMembers) && entry.familyMembers.length > 0
    ? entry.familyMembers
    : [entry];
  let best = null;

  for (const candidateEntry of candidates) {
    for (const field of ENTRY_MODIFIED_FIELDS) {
      const rawValue = String(candidateEntry?.[field.key] || '').trim();
      if (!rawValue) {
        continue;
      }

      const timestamp = Date.parse(rawValue);
      const candidate = {
        value: rawValue,
        label: field.label,
        siteId: String(candidateEntry?.siteId || '').trim(),
        timestamp: Number.isFinite(timestamp) ? timestamp : 0,
        parseable: Number.isFinite(timestamp),
      };

      if (!best) {
        best = candidate;
        continue;
      }

      if (candidate.parseable && !best.parseable) {
        best = candidate;
        continue;
      }

      if (candidate.parseable === best.parseable && candidate.timestamp > best.timestamp) {
        best = candidate;
      }
    }
  }

  return best || {
    value: '',
    label: '',
    siteId: '',
    timestamp: 0,
    parseable: false,
  };
}

function getEntryModifiedTimestamp(entry) {
  return getEntryModifiedDetails(entry).timestamp;
}

function getAssignableTagRegistryEntries() {
  return getManagedTagRegistryEntries().filter((entry) => !entry.system);
}

function normalizeSearchTerms(search) {
  const tokens = String(search || '')
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);

  const requireNote = tokens.some((token) => token === 'has:note' || token === 'has:notes' || token === 'has:todo');
  const requireDemo = tokens.some((token) => token === 'has:demo' || token === 'has:media');
  const requireImage = tokens.some((token) =>
    token === 'has:image'
    || token === 'has:preview'
    || token === 'image:any'
    || token === 'preview:any'
  );
  const requireMissingImage = tokens.some((token) =>
    token === 'image:none'
    || token === 'preview:none'
    || token === '-image'
    || token === '-preview'
  );
  const textTokens = tokens.filter((token) =>
    token !== 'has:note'
    && token !== 'has:notes'
    && token !== 'has:todo'
    && token !== 'has:demo'
    && token !== 'has:media'
    && token !== 'has:image'
    && token !== 'has:preview'
    && token !== 'image:any'
    && token !== 'preview:any'
    && token !== 'image:none'
    && token !== 'preview:none'
    && token !== '-image'
    && token !== '-preview'
  );

  return {
    requireNote,
    requireDemo,
    requireImage,
    requireMissingImage,
    textTokens,
  };
}

function normalizeCatalogEntryNotes(value) {
  const source = Array.isArray(value) ? value : [value];
  return source
    .map((note) => String(note || '').replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim())
    .filter(Boolean);
}

function getSearchNotes(entry) {
  return normalizeCatalogEntryNotes(entry?.notes)
    .map((note) => normalizeNote(note))
    .filter(Boolean);
}

function resolvePreviewAssetUrl(value) {
  const raw = String(value || '').trim();
  if (!raw) {
    return '';
  }
  if (/^https?:\/\//i.test(raw)) {
    return raw;
  }
  if (raw.startsWith('/api/previews/') && state.apiBaseUrl) {
    return `${state.apiBaseUrl}${raw}`;
  }
  if (raw.startsWith('/api/previews/')) {
    return `${sitesOrigin()}${raw.replace('/api/previews/', '/previews/')}`;
  }
  try {
    return new URL(raw, window.location.href).href;
  } catch (error) {
    return raw;
  }
}

function normalizeAliasLabel(value) {
  let alias = String(value || '').trim().toLowerCase();
  if (!alias) {
    return '';
  }
  if (alias.endsWith(`.${BASE_DOMAIN}`)) {
    alias = alias.slice(0, -(`.${BASE_DOMAIN}`.length));
  }
  alias = alias.replace(/^\.+|\.+$/g, '');
  if (!alias || alias.includes('.')) {
    return '';
  }
  if (!/^[a-z0-9-]+$/.test(alias)) {
    return '';
  }
  if (alias.startsWith('-') || alias.endsWith('-') || alias.length > 63) {
    return '';
  }
  return alias;
}

function buildAliasPlaceholder(siteId) {
  const aliasBase = normalizeAliasLabel(siteId) || 'subdomain';
  if (aliasBase === 'subdomain') {
    return 'e.g. <subdomain>-temp-<random>';
  }
  let hash = 0;
  for (const char of aliasBase) {
    hash = ((hash * 31) + char.charCodeAt(0)) >>> 0;
  }
  const suffix = hash.toString(36).padStart(4, '0').slice(-4);
  return `e.g. ${aliasBase}-temp-${suffix}`;
}

function normalizeAliasList(value) {
  const aliases = [];
  const parts = Array.isArray(value) ? value : String(value || '').split(/[,\n]+/);
  for (const part of parts) {
    const alias = normalizeAliasLabel(part);
    if (alias && !aliases.includes(alias)) {
      aliases.push(alias);
    }
  }
  return aliases;
}

function formatAliasList(value) {
  return normalizeAliasList(value).join(', ');
}

function resolveEntryUrl(entry) {
  const explicitUrl = normalizeCsvEntryUrl(entry?.url, window.location.href);
  if (explicitUrl) {
    return explicitUrl;
  }
  const host = resolveEntryHost(entry);
  if (host) {
    return `https://${host}/`;
  }
  return null;
}

function resolveEntryHost(entry) {
  if (isValidHostedHost(entry?.host)) {
    return entry.host;
  }
  const siteId = normalizeSiteId(entry?.siteId);
  if (!siteId || siteId === ROOT_SITE_ID) {
    return '';
  }
  return `${siteId}.${BASE_DOMAIN}`;
}

function restoreStoredView() {
  if (usePersistentViewState()) {
    const storedView = normalizeUrlViewMode(localStorage.getItem(VIEW_STORAGE_KEY));
    if (storedView) {
      state.viewMode = storedView;
    }
    state.jsonViewMode = normalizeJsonViewMode(localStorage.getItem(JSON_VIEW_MODE_STORAGE_KEY)) || JSON_VIEW_MODE_TREE;
    state.jsonWrap = localStorage.getItem(JSON_WRAP_STORAGE_KEY) === '1';
    localStorage.removeItem(FULLSCREEN_PREVIEW_SOURCE_STORAGE_KEY);
  } else {
    state.jsonViewMode = JSON_VIEW_MODE_TREE;
    state.jsonWrap = false;
  }
  state.fullscreenPreviewSource = FULLSCREEN_PREVIEW_SOURCE_SNAPSHOT;
}

function applyUrlStateOverrides() {
  const url = new URL(window.location.href);
  const requestedView = normalizeUrlViewMode(url.searchParams.get('view'));
  const requestedSlideshowMode = normalizeUrlSlideshowPlaybackMode(url.searchParams.get('slideshowMode'));
  const requestedSlideshowScope = normalizeUrlSlideshowScope(url.searchParams.get('slideshowScope'));
  const compactSlideshowValue = url.searchParams.get('slideshow');
  const compactSlideshowMode = normalizeUrlSlideshowPlaybackMode(compactSlideshowValue);
  const hasCompactSlideshowOverride = compactSlideshowValue !== null;

  if (requestedView) {
    state.viewMode = requestedView;
  }

  if (hasCompactSlideshowOverride || requestedSlideshowMode || requestedSlideshowScope) {
    state.viewMode = 'slideshow';
  }

  if (compactSlideshowMode) {
    state.slideshowPlaybackMode = compactSlideshowMode;
  }

  if (requestedSlideshowMode) {
    state.slideshowPlaybackMode = requestedSlideshowMode;
  }

  if (requestedSlideshowScope) {
    state.slideshowScope = requestedSlideshowScope;
  }
}

function normalizeUrlViewMode(value) {
  const normalized = normalizeCatalogToken(value);
  if (normalized === 'audit' || normalized === 'review') {
    return 'audit';
  }
  return DEFAULT_VIEW_CONFIG[normalized] ? normalized : '';
}

function normalizeJsonViewMode(value) {
  const normalized = normalizeCatalogToken(value);
  return normalized === JSON_VIEW_MODE_RAW || normalized === JSON_VIEW_MODE_TREE ? normalized : '';
}

function normalizeFullscreenPreviewSource(value) {
  const normalized = normalizeCatalogToken(value);
  return normalized === FULLSCREEN_PREVIEW_SOURCE_LIVE || normalized === FULLSCREEN_PREVIEW_SOURCE_SNAPSHOT
    ? normalized
    : '';
}

function normalizeUrlSlideshowPlaybackMode(value) {
  const normalized = normalizeCatalogToken(value);
  if (!normalized) {
    return '';
  }
  if (normalized === 'ordered' || normalized === 'sequential') {
    return SLIDESHOW_PLAYBACK_SEQUENTIAL;
  }
  if (normalized === 'random') {
    return SLIDESHOW_PLAYBACK_RANDOM;
  }
  return '';
}

function normalizeUrlSlideshowScope(value) {
  const normalized = normalizeCatalogToken(value);
  if (!normalized) {
    return '';
  }
  if (normalized === 'top50' || normalized === 'top-50') {
    return SLIDESHOW_SCOPE_TOP_50;
  }
  if (normalized === 'all') {
    return SLIDESHOW_SCOPE_ALL;
  }
  return '';
}

function ensureValidViewMode() {
  const views = getAvailableViewConfigs();
  if (views.length === 0) {
    return;
  }
  if (state.viewMode === 'swipe' && isMobileSwipeViewport()) {
    return;
  }
  if (!views.some((item) => item.value === state.viewMode)) {
    state.viewMode = views[0].value;
  }
}

function enrichEntry(entry) {
  const isRootSite = entry.siteId === ROOT_SITE_ID;
  const hasExplicitMainSite = Object.prototype.hasOwnProperty.call(entry, 'mainSite');
  const isMainSite = entry.mainSite === true || (isRootSite && !hasExplicitMainSite);
  const tagSet = new Set(normalizeCatalogTagList(entry.tags));
  const isSnapshot = tagSet.has('snapshots');
  const isLegacy = tagSet.has('legacy');
  const frameworkSite = tagSet.has('framework');
  const frameworkBucket = frameworkSite ? normalizeCatalogToken(entry.frameworkBucket) : '';
  const criticality = frameworkSite ? normalizeCatalogToken(entry.criticality) : '';
  const testStatus = frameworkSite ? normalizeCatalogToken(entry.testStatus) : '';
  const healthStatus = frameworkSite ? normalizeCatalogToken(entry.healthStatus) : '';
  const isAnchor = tagSet.has('anchors');
  const isCurated = tagSet.has('curated');
  const githubBacked = entry.githubBacked === true || !!entry.publishContext?.github || tagSet.has('github');
  const githubRepo = entry.githubRepo || entry.publishContext?.github?.repository || null;
  const family = normalizeFamilyMeta(entry.family, entry.siteId);
  const demo = normalizeDemoMeta(entry.demo);
  const showcaseRank = normalizeShowcaseRank(entry.showcaseRank);
  const host = resolveEntryHost(entry);
  const url = resolveEntryUrl(entry);
  const aliases = normalizeAliasList(entry.aliases);
  const notes = normalizeCatalogEntryNotes(entry.notes);
  const externalCatalog = entry.externalCatalog === true || entry.catalogSource === 'csv';
  const sharedUiRuntime = tagSet.has('shared-ui');

  return {
    ...entry,
    aliases,
    notes,
    host,
    hasHostedSite: entry.hasHostedSite !== false,
    operatorNote: getOperatorNote(entry),
    displayName: isRootSite ? 'Portal' : (entry.displayName || entry.siteId),
    url,
    previewUrl: getPreviewUrl(entry.siteId),
    mainSite: isMainSite,
    manualRank: normalizeManualRank(entry.manualRank),
    showcaseRank,
    frameworkBucket,
    criticality,
    testStatus,
    healthStatus,
    githubBacked,
    githubRepo,
    family,
    demo,
    categories: {
      root: isRootSite,
      main: isMainSite,
      framework: frameworkSite,
      snapshot: isSnapshot,
      legacy: isLegacy,
      anchor: isAnchor,
      curated: isCurated,
      synthetic: tagSet.has('synthetic'),
      data: tagSet.has('data'),
      github: tagSet.has('github'),
      sharedUiRuntime,
      externalCatalog,
      invalidHost: Boolean(host) && !url,
      hiddenInDefault: isRootSite,
      // packagesHub: this site IS the private-NuGet index (packages.mullmania.com)
      packagesHub: entry.siteId === 'packages' || (entry.tags ?? []).includes('packages-hub'),
      // hasPackage: this site HAS a published NuGet package
      hasPackage: Array.isArray(entry.publishedPackages) && entry.publishedPackages.length > 0,
    },
  };
}

function normalizeShowcaseRank(value) {
  const rank = Number(value);
  return Number.isFinite(rank) ? rank : 0;
}

function normalizeDemoMeta(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return null;
  }

  const sources = Array.isArray(value.sources)
    ? value.sources
      .map((source) => normalizeDemoSource(source))
      .filter(Boolean)
    : [];
  const posterUrl = resolveAbsoluteCatalogUrl(value.posterUrl);
  const durationSec = Number(value.durationSec);

  if (sources.length === 0 && !posterUrl && !Number.isFinite(durationSec)) {
    return null;
  }

  return {
    sources,
    posterUrl,
    durationSec: Number.isFinite(durationSec) && durationSec > 0 ? durationSec : null,
    mode: String(value.mode || '').trim() || null,
    posterKind: String(value.posterKind || '').trim() || null,
    posterNote: String(value.posterNote || '').trim() || null,
  };
}

function normalizeDemoSource(source) {
  if (!source || typeof source !== 'object') {
    return null;
  }

  const src = resolveAbsoluteCatalogUrl(source.src);
  const type = String(source.type || '').trim().toLowerCase();
  if (!src) {
    return null;
  }
  return { src, type };
}

function resolveAbsoluteCatalogUrl(value) {
  const raw = String(value || '').trim();
  if (!raw) {
    return '';
  }
  if (/^https?:\/\//i.test(raw) || raw.startsWith('data:')) {
    return raw;
  }
  if (raw.startsWith('/')) {
    return `${window.location.origin}${raw}`;
  }
  try {
    return new URL(raw, window.location.href).toString();
  } catch {
    return '';
  }
}

function isValidHostedHost(value) {
  const host = String(value || '').trim().toLowerCase();
  if (!host) {
    return false;
  }

  return host.split('.').every((label) =>
    label.length > 0
    && label.length <= 63
    && /^[a-z0-9-]+$/.test(label)
    && !label.startsWith('-')
    && !label.endsWith('-'));
}

function shouldUseMobileSwipeMode() {
  return state.viewMode === 'swipe' && isMobileSwipeViewport();
}

function syncSwipeModeForViewport() {
  if (state.viewMode === 'swipe' && !isMobileSwipeViewport()) {
    state.viewMode = 'table';
    if (usePersistentViewState()) {
      localStorage.setItem(VIEW_STORAGE_KEY, state.viewMode);
    }
  }
  const nextSwipeMode = shouldUseMobileSwipeMode();
  if (nextSwipeMode === state.swipeMode) {
    return false;
  }

  state.swipeMode = nextSwipeMode;
  if (state.swipeMode) {
    initSwipeView();
  } else {
    closeSwipeToolbar();
    document.querySelector('.toolbar')?.classList.remove('toolbar--mobile-open', 'swipe-toolbar-open');
    document.getElementById('toolbar-toggle')?.classList.remove('is-active');
    swipeEls.frame?.removeAttribute('src');
  }
  return true;
}

function render() {
  invalidateDerivedTagRegistryCache();
  syncSwipeModeForViewport();
  const shouldRestoreTableFocus = state.viewMode === 'table' && tableViewEl.contains(document.activeElement);
  syncCatalogFilterState();
  state.visibleSiteEntries = getVisibleSiteEntries();
  state.visibleEntries = buildDisplayEntries(state.visibleSiteEntries);
  clampTablePage();
  clampGalleryPage();
  clampWallPage();
  clampTvIndex();
  ensureTvPageContainsIndex();
  renderSummary();
  updateSortIcons();
  renderCatalogFilterRow();
  if (tablePageSizeEl && tablePageSizeEl.value !== String(state.tablePageSize)) {
    tablePageSizeEl.value = String(state.tablePageSize);
  }
  syncActiveView();

  if (state.viewMode === 'list') {
    renderDenseListView(state.visibleEntries);
  } else if (state.viewMode === 'flightdeck') {
    renderFlightDeckView();
  } else if (state.viewMode === 'dependencies') {
    renderDependenciesView();
  } else if (state.viewMode === 'features') {
    renderFeatureMatrixView();
  } else if (state.viewMode === 'gallery') {
    renderGallery(state.visibleEntries);
  } else if (state.viewMode === 'wall') {
    renderWall(state.visibleEntries);
  } else if (state.viewMode === 'tv') {
    renderTvView();
  } else if (state.viewMode === 'audit') {
    if (state.auditDeck.filterMode === AUDIT_FILTER_REVIEW && state.auditDeck.queue.length === 0 && !state.auditDeck.loading) {
      ensureAuditDeckLoaded();
    }
    renderAuditView();
  } else if (state.viewMode === 'slideshow') {
    renderSlideshowView();
  } else if (state.viewMode === 'json') {
    renderJsonView();
  } else {
    renderRows(state.visibleEntries);
  }

  updateSelectionUi();
  setupLazyPreviews();

  if (state.viewMode === 'table') {
    restoreActiveTableRow(shouldRestoreTableFocus);
  }

  syncSlideshowPlayback();

  if (!fullscreenModalEl.classList.contains('is-hidden')) {
    syncFullscreenNavigationControls();
    syncFullscreenEntryActionButtons();
    renderFullscreenTagEditor(state.fullscreenEntry, { preserveStatus: true });
    syncFullscreenNoteEditorControls();
  }

  if (!notesModalEl?.classList.contains('is-hidden')) {
    renderNotesModal();
  }

  if (!tagManagerModalEl?.classList.contains('is-hidden')) {
    renderTagManagerModal();
  }

  if (!rankModalEl?.classList.contains('is-hidden')) {
    renderRankModal();
  }

  if (!bulkRenameModalEl?.classList.contains('is-hidden')) {
    renderBulkRenameModal();
  }

  if (state.swipeMode) {
    renderSwipeView();
  }
}

function syncActiveView() {
  const swipeMode = state.swipeMode;
  flightDeckViewEl?.classList.toggle('is-hidden', swipeMode || state.viewMode !== 'flightdeck');
  dependenciesViewEl?.classList.toggle('is-hidden', swipeMode || state.viewMode !== 'dependencies');
  featureMatrixViewEl?.classList.toggle('is-hidden', swipeMode || state.viewMode !== 'features');
  tableViewEl.classList.toggle('is-hidden', swipeMode || state.viewMode !== 'table');
  listViewEl?.classList.toggle('is-hidden', swipeMode || state.viewMode !== 'list');
  galleryViewEl.classList.toggle('is-hidden', swipeMode || state.viewMode !== 'gallery');
  wallViewEl?.classList.toggle('is-hidden', swipeMode || state.viewMode !== 'wall');
  tvViewEl.classList.toggle('is-hidden', swipeMode || state.viewMode !== 'tv');
  categorizeViewEl?.classList.toggle('is-hidden', swipeMode || state.viewMode !== 'categorize');
  auditViewEl?.classList.toggle('is-hidden', swipeMode || state.viewMode !== 'audit');
  slideshowViewEl.classList.toggle('is-hidden', swipeMode || state.viewMode !== 'slideshow');
  jsonViewEl.classList.toggle('is-hidden', swipeMode || state.viewMode !== 'json');
  swipeEls.view?.classList.toggle('is-hidden', !swipeMode);
  document.body.classList.toggle('is-gallery-mode', state.viewMode === 'gallery');
  document.body.classList.toggle('is-flightdeck-mode', state.viewMode === 'flightdeck');
  document.body.classList.toggle('is-dependencies-mode', state.viewMode === 'dependencies');
  document.body.classList.toggle('is-features-mode', state.viewMode === 'features');
  document.body.classList.toggle('is-categorize-mode', state.viewMode === 'categorize');
  document.body.classList.toggle('is-audit-mode', state.viewMode === 'audit');
  document.body.classList.toggle('is-slideshow-mode', state.viewMode === 'slideshow');
  document.body.classList.toggle('is-swipe-mode', swipeMode);
  syncSlideshowChromeAutoHide();
}

function updateSortIcons() {
  document.querySelectorAll('.workspace-table__sortable').forEach((header) => {
    const icon = header.querySelector('.workspace-table__sort-icon');
    if (!icon) return;
    const active = header.dataset.sort === state.sort;
    icon.className = active
      ? 'ti ti-sort-ascending workspace-table__sort-icon workspace-table__sort-icon--active'
      : 'ti ti-arrows-sort workspace-table__sort-icon';
  });
}

function syncViewButtons() {
  viewButtons.forEach((button) => {
    const isActive = button.dataset.view === state.viewMode;
    button.classList.toggle('is-active', isActive);
    button.setAttribute('aria-pressed', isActive ? 'true' : 'false');
  });
  updateCycleViewButton();
  updateSwipeViewSelect();
}

function isReservedCatalogTagId(tagId) {
  const normalizedTagId = normalizeCatalogToken(tagId);
  return Boolean(normalizedTagId) && getReservedCatalogTagIds().has(normalizedTagId);
}

function getAvailableCatalogTagEntries() {
  return getCatalogTagRegistryEntries().filter((entry) => entry.siteCount > 0);
}

function getAvailableCatalogFilterEntries() {
  const entries = getCatalogFilterRegistryEntries().filter((entry) => entry.siteCount > 0);
  if (state.viewMode === 'categorize') {
    return entries.filter((entry) => CATEGORY_BOARD_TAG_IDS.has(entry.id));
  }
  return entries;
}

function getActiveCatalogTagIds() {
  const availableDefinitionIds = new Set(getAvailableCatalogFilterEntries().map((entry) => entry.id));
  return Array.from(state.activeCatalogTagIds)
    .map((tagId) => normalizeCatalogToken(tagId))
    .filter((tagId) => availableDefinitionIds.has(tagId));
}

function syncCatalogFilterState() {
  const availableCatalogTagIds = new Set(getAvailableCatalogFilterEntries().map((entry) => entry.id));
  const normalizedActiveCatalogTagIds = getActiveCatalogTagIds().filter((tagId) => availableCatalogTagIds.has(tagId));
  if (
    normalizedActiveCatalogTagIds.length !== state.activeCatalogTagIds.size
    || normalizedActiveCatalogTagIds.some((tagId) => !state.activeCatalogTagIds.has(tagId))
  ) {
    state.activeCatalogTagIds = new Set(normalizedActiveCatalogTagIds);
  }
}

function shouldBypassCatalogFilters(activeCatalogTagIds, availableCatalogTags) {
  return activeCatalogTagIds.length === 0;
}

function getCatalogFilterLabels(activeCatalogTagIds = getActiveCatalogTagIds()) {
  return activeCatalogTagIds.map((tagId) => getCatalogTagLabel(tagId));
}

function getLegacyCatalogFilterToken(activeCatalogTagIds = getActiveCatalogTagIds(), availableCatalogTags = getAvailableCatalogFilterEntries()) {
  if (shouldBypassCatalogFilters(activeCatalogTagIds, availableCatalogTags)) {
    return 'all';
  }
  return activeCatalogTagIds.length === 1 ? activeCatalogTagIds[0] : 'multiple';
}

function renderCatalogFilterRow() {
  renderInlineCatalogTagFilters();

  if (!toolbarFiltersEl || !toolbarFiltersRowEl) {
    return;
  }

  toolbarFiltersEl.innerHTML = '';
  toolbarFiltersRowEl.classList.toggle('is-hidden', getSelectedEntries().length === 0);
}

function renderInlineCatalogTagFilters() {
  const container = document.getElementById('search-tag-filters');
  if (!container) {
    return;
  }

  const availableCatalogTags = getAvailableCatalogFilterEntries();
  const activeCatalogTagIds = getActiveCatalogTagIds();
  const activeCatalogTagIdSet = new Set(activeCatalogTagIds);
  const open = container.dataset.open === 'true';

  if (availableCatalogTags.length === 0) {
    container.innerHTML = '';
    container.classList.add('is-empty');
    container.dataset.open = 'false';
    return;
  }

  container.classList.remove('is-empty');
  container.classList.toggle('is-open', open);
  container.innerHTML = `
    <div class="launchpad-search-tags__badges" aria-label="Applied tag filters">
      ${activeCatalogTagIds.map((tagId) => {
        const entry = availableCatalogTags.find((candidate) => candidate.id === tagId);
        const label = entry?.label || getCatalogTagLabel(tagId);
        return `
          <button
            type="button"
            class="launchpad-search-tag-badge"
            data-catalog-tag-filter="${escapeHtml(tagId)}"
            aria-label="${escapeHtml(`Remove ${label} tag filter`)}"
            title="${escapeHtml(`Remove ${label}`)}"
          >
            <span>${escapeHtml(label)}</span>
            <i class="ti ti-x" aria-hidden="true"></i>
          </button>
        `;
      }).join('')}
    </div>
    <button
      type="button"
      class="launchpad-search-tags__menu-button"
      data-catalog-tag-menu-toggle="true"
      aria-haspopup="menu"
      aria-expanded="${open ? 'true' : 'false'}"
      aria-label="Open tag filters"
      title="Tag filters"
    >...</button>
    <div class="launchpad-search-tags__menu ${open ? '' : 'is-hidden'}" role="menu" aria-label="Tag filters">
      ${availableCatalogTags.map((entry) => {
        const active = activeCatalogTagIdSet.has(entry.id);
        return `
          <button
            type="button"
            class="launchpad-search-tags__menu-item ${active ? 'is-active' : ''}"
            data-catalog-tag-filter="${escapeHtml(entry.id)}"
            role="menuitemcheckbox"
            aria-checked="${active ? 'true' : 'false'}"
          >
            <span class="launchpad-search-tags__menu-label">${escapeHtml(entry.label)}</span>
            <span class="launchpad-search-tags__menu-count">${entry.siteCount.toLocaleString()}</span>
          </button>
        `;
      }).join('')}
      <button
        id="open-tag-manager"
        type="button"
        class="launchpad-search-tags__manage"
        data-open-tag-manager="true"
        role="menuitem"
      >
        <i class="ti ti-settings" aria-hidden="true"></i>
        <span>Manage tags</span>
      </button>
    </div>
  `;
  const badgeStrip = container.querySelector('.launchpad-search-tags__badges');
  if (badgeStrip instanceof HTMLElement) {
    window.requestAnimationFrame(() => {
      const badges = Array.from(badgeStrip.querySelectorAll('.launchpad-search-tag-badge'));
      const totalBadgeWidth = badges.reduce((sum, badge) => sum + badge.getBoundingClientRect().width, 0)
        + Math.max(0, badges.length - 1) * 4;
      const overflowing = totalBadgeWidth > badgeStrip.clientWidth + 1;
      badgeStrip.classList.toggle('is-overflowing', overflowing);
      if (overflowing) {
        window.requestAnimationFrame(() => {
          badgeStrip.scrollLeft = badgeStrip.scrollWidth;
        });
      }
    });
  }
}

function toggleCatalogTagFilter(tagId, options = {}) {
  const normalizedTagId = normalizeCatalogToken(tagId);
  if (!normalizedTagId) {
    return;
  }
  const availableCatalogTagIds = new Set(getAvailableCatalogFilterEntries().map((entry) => entry.id));
  if (!availableCatalogTagIds.has(normalizedTagId)) {
    return;
  }
  const nextActiveCatalogTagIds = new Set(state.activeCatalogTagIds);
  if (options.force === true) {
    nextActiveCatalogTagIds.add(normalizedTagId);
  } else if (options.force === false) {
    nextActiveCatalogTagIds.delete(normalizedTagId);
  } else if (nextActiveCatalogTagIds.has(normalizedTagId)) {
    nextActiveCatalogTagIds.delete(normalizedTagId);
  } else {
    nextActiveCatalogTagIds.add(normalizedTagId);
  }
  clearPinnedMissingImageTargets();
  state.activeCatalogTagIds = nextActiveCatalogTagIds;
  state.tablePage = 0;
  resetMobileLoadedItems();
  state.listScrollTop = 0;
  state.galleryPage = 0;
  state.wallPage = 0;
  state.tvIndex = 0;
  state.tvPage = 0;
  render();
}

function setCatalogTagFilterMenuOpen(open) {
  const container = document.getElementById('search-tag-filters');
  if (!container) {
    return;
  }
  container.dataset.open = open ? 'true' : 'false';
  renderInlineCatalogTagFilters();
}

function toggleCatalogTagFilterMenu() {
  const container = document.getElementById('search-tag-filters');
  const open = container?.dataset.open === 'true';
  setCatalogTagFilterMenuOpen(!open);
}

function closeCatalogTagFilterMenu() {
  const container = document.getElementById('search-tag-filters');
  if (!container || container.dataset.open !== 'true') {
    return;
  }
  setCatalogTagFilterMenuOpen(false);
}

function handleInlineCatalogTagFilterClick(event) {
  const container = document.getElementById('search-tag-filters');
  if (!container) {
    return;
  }

  const toggleButton = event.target instanceof Element ? event.target.closest('[data-catalog-tag-menu-toggle]') : null;
  if (toggleButton instanceof HTMLButtonElement) {
    event.preventDefault();
    toggleCatalogTagFilterMenu();
    return;
  }

  const managerButton = event.target instanceof Element ? event.target.closest('[data-open-tag-manager]') : null;
  if (managerButton instanceof HTMLButtonElement && container.contains(managerButton)) {
    event.preventDefault();
    closeCatalogTagFilterMenu();
    openTagManagerModal();
    return;
  }

  const tagButton = event.target instanceof Element ? event.target.closest('[data-catalog-tag-filter]') : null;
  if (tagButton instanceof HTMLButtonElement && container.contains(tagButton)) {
    event.preventDefault();
    toggleCatalogTagFilter(tagButton.dataset.catalogTagFilter || '');
  }
}

function handleCatalogTagFilterOutsidePointer(event) {
  const container = document.getElementById('search-tag-filters');
  if (!container || container.dataset.open !== 'true') {
    return;
  }
  if (event.target instanceof Node && container.contains(event.target)) {
    return;
  }
  closeCatalogTagFilterMenu();
}

function handleCatalogTagFilterKeydown(event) {
  if (event.key === 'Escape') {
    closeCatalogTagFilterMenu();
  }
}

function handleInlineCatalogTagDragStart(event) {
  const button = event.target instanceof Element ? event.target.closest('[data-catalog-tag-filter]') : null;
  if (!(button instanceof HTMLButtonElement)) {
    return;
  }
  const tagId = normalizeManagedTagId(button.dataset.catalogTagFilter || '');
  if (!tagId || !CATEGORY_BOARD_TAG_IDS.has(tagId)) {
    event.preventDefault();
    return;
  }
  state.catalogTagDrag.tagId = tagId;
  state.catalogTagDrag.targetSiteId = '';
  button.classList.add('is-dragging');
  event.dataTransfer?.setData(TAG_DRAG_MIME, tagId);
  event.dataTransfer?.setData('text/plain', getManagedTagLabel(tagId));
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'copy';
  }
}

function handleInlineCatalogTagDragEnd() {
  document.querySelectorAll('.launchpad-search-tags [data-catalog-tag-filter].is-dragging').forEach((button) => {
    button.classList.remove('is-dragging');
  });
  state.catalogTagDrag.tagId = '';
  state.catalogTagDrag.targetSiteId = '';
}

function getVisibleSiteEntries() {
  const availableCatalogTags = getAvailableCatalogFilterEntries();
  const activeCatalogTagIds = getActiveCatalogTagIds();
  const bypassCatalogFilters = shouldBypassCatalogFilters(activeCatalogTagIds, availableCatalogTags);
  return state.entries
    .filter((entry) => matchesCatalogFilters(entry, activeCatalogTagIds, bypassCatalogFilters))
    .filter(matchesSearch)
    .sort(compareEntries);
}

function buildDisplayEntries(entries) {
  const visibleGroups = buildDisplayGroupMap(entries);
  const catalogGroups = buildDisplayGroupMap(state.entries);

  return Array.from(visibleGroups.values(), (group) => buildDisplayEntry({
    key: group.key,
    visibleEntries: group.entries,
    entries: catalogGroups.get(group.key)?.entries || group.entries,
  }));
}

function getEntryFriendlyName(entry) {
  return normalizeFriendlyName(entry?.displayTitle || entry?.displayName);
}

function getDisplayGroupLabel(entry) {
  return getEntryFriendlyName(entry) || normalizeSiteId(entry?.siteId);
}

function getDisplayGroupKey(entry) {
  const label = getDisplayGroupLabel(entry);
  return label ? label.toLocaleLowerCase() : '';
}

function buildDisplayGroupMap(entries) {
  const groups = new Map();
  for (const entry of Array.isArray(entries) ? entries : []) {
    const key = getDisplayGroupKey(entry);
    if (!key) {
      continue;
    }
    const existing = groups.get(key);
    if (existing) {
      existing.entries.push(entry);
      continue;
    }
    groups.set(key, { key, entries: [entry] });
  }
  return groups;
}

function resolveDisplayGroupLabel(entries, fallback = '') {
  const members = sortFamilyMembers(entries);
  const firstNamedMember = members.find((entry) => getEntryFriendlyName(entry));
  return getEntryFriendlyName(firstNamedMember) || members[0]?.siteId || fallback;
}

function buildDisplayEntry(group) {
  const members = sortFamilyMembers(group.entries);
  const visibleMembers = sortFamilyMembers(group.visibleEntries || group.entries);
  const preferredSiteId = resolvePreferredFamilySiteId(group.key, visibleMembers, members);
  const activeIndex = Math.max(0, members.findIndex((entry) => entry.siteId === preferredSiteId));
  const activeEntry = members[activeIndex] || members[0];
  const groupLabel = resolveDisplayGroupLabel(members, activeEntry?.siteId || group.key);
  const displayTitle = groupLabel || activeEntry.displayName || activeEntry.siteId;

  state.familySelections[group.key] = activeEntry.siteId;

  return {
    ...activeEntry,
    displayEntryKey: group.key,
    displayTitle,
    familyMembers: members,
    visibleFamilyMembers: visibleMembers,
    family: members.length > 1 ? {
      id: group.key,
      label: groupLabel,
      kind: 'friendly-name',
      count: members.length,
      memberOrder: activeIndex + 1,
      leadSiteId: members[0]?.siteId || activeEntry.siteId,
    } : null,
  };
}

function resolvePreferredFamilySiteId(groupKey, visibleEntries, members) {
  const selectedSiteId = state.familySelections[groupKey];
  if (selectedSiteId && visibleEntries.some((entry) => entry.siteId === selectedSiteId)) {
    return selectedSiteId;
  }

  const mainSite = visibleEntries.find((entry) => entry.mainSite);
  if (mainSite) {
    return mainSite.siteId;
  }

  const anchorSite = visibleEntries.find((entry) => entry.categories.anchor);
  if (anchorSite) {
    return anchorSite.siteId;
  }

  if (visibleEntries[0]?.siteId) {
    return visibleEntries[0].siteId;
  }
  if (selectedSiteId && members.some((entry) => entry.siteId === selectedSiteId)) {
    return selectedSiteId;
  }

  const catalogMainSite = members.find((entry) => entry.mainSite);
  if (catalogMainSite) {
    return catalogMainSite.siteId;
  }

  const catalogAnchorSite = members.find((entry) => entry.categories.anchor);
  if (catalogAnchorSite) {
    return catalogAnchorSite.siteId;
  }

  return members[0]?.siteId || '';
}

function sortFamilyMembers(entries) {
  return [...entries].sort(compareNaturalSiteEntries);
}

function compareNaturalSiteEntries(left, right) {
  return compareNaturalText(left?.siteId, right?.siteId);
}

function hasMultipleVersions(entry) {
  return Array.isArray(entry?.familyMembers) && entry.familyMembers.length > 1;
}

function buildDisplayTitle(entry) {
  return entry?.displayTitle || entry?.displayName || entry?.siteId || '';
}

function buildGalleryHostLabel(entry) {
  const host = String(entry?.host || '').trim();
  if (!host) {
    return 'No public host';
  }

  const baseSuffix = `.${BASE_DOMAIN}`.toLowerCase();
  if (host.toLowerCase().endsWith(baseSuffix) && host.length > baseSuffix.length) {
    return `.${BASE_DOMAIN}`;
  }

  return host;
}

function buildVersionLabel(entry) {
  const order = Math.max(1, Number(entry?.family?.memberOrder ?? 1));
  const count = Math.max(1, Number(entry?.family?.count ?? entry?.familyMembers?.length ?? 1));
  return `${order}/${count}`;
}

function buildVersionSummary(entry) {
  const count = Math.max(1, Number(entry?.family?.count ?? entry?.familyMembers?.length ?? 1));
  return count === 1 ? '1 site in group' : `${count} sites in group`;
}

function cycleFamilyVersion(entry, delta) {
  if (!hasMultipleVersions(entry)) {
    return;
  }

  const members = entry.familyMembers;
  const currentIndex = Math.max(0, members.findIndex((member) => member.siteId === entry.siteId));
  const nextIndex = (currentIndex + delta + members.length) % members.length;
  const nextEntry = members[nextIndex];
  const familyKey = entry.displayEntryKey || getDisplayGroupKey(entry) || entry.siteId;
  const wasSelected = state.selected.delete(entry.siteId);

  state.familySelections[familyKey] = nextEntry.siteId;

  if (wasSelected) {
    state.selected.add(nextEntry.siteId);
  }
  if (state.lastSelectedSiteId === entry.siteId) {
    state.lastSelectedSiteId = nextEntry.siteId;
  }
  if (state.activeTableSiteId === entry.siteId) {
    state.activeTableSiteId = nextEntry.siteId;
  }

  render();
}

function wireVersionSwitcher({ shell, labelEl, prevButton, nextButton }, entry) {
  if (!shell || !labelEl || !prevButton || !nextButton) {
    return;
  }

  const multiVersion = hasMultipleVersions(entry);
  shell.classList.toggle('is-hidden', !multiVersion);
  if (!multiVersion) {
    return;
  }

  const current = Math.max(1, Number(entry.family?.memberOrder ?? 1));
  const total = Math.max(1, Number(entry.family?.count ?? entry.familyMembers.length));
  const familyLabel = entry.family?.label || buildDisplayTitle(entry);

  labelEl.textContent = buildVersionLabel(entry);
  labelEl.title = `Site ${current} of ${total}`;

  prevButton.disabled = total < 2;
  nextButton.disabled = total < 2;
  prevButton.title = `Show previous ${familyLabel} site`;
  nextButton.title = `Show next ${familyLabel} site`;
  prevButton.setAttribute('aria-label', prevButton.title);
  nextButton.setAttribute('aria-label', nextButton.title);

  prevButton.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    cycleFamilyVersion(entry, -1);
  });

  nextButton.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    cycleFamilyVersion(entry, 1);
  });
}

function matchesCatalogFilters(entry, activeCatalogTagIds = getActiveCatalogTagIds(), bypassCatalogFilters = shouldBypassCatalogFilters(activeCatalogTagIds, getAvailableCatalogFilterEntries())) {
  if (bypassCatalogFilters) {
    return !entry.categories.hiddenInDefault || Boolean(state.search);
  }

  const entryTagIds = new Set(getEntryCatalogFilterTagIds(entry));
  return activeCatalogTagIds.some((tagId) => entryTagIds.has(tagId));
}

function matchesSearch(entry) {
  if (!state.search) {
    return true;
  }

  const {
    requireNote,
    requireDemo,
    requireImage,
    requireMissingImage,
    textTokens,
  } = normalizeSearchTerms(state.search);
  if (requireNote && !hasOperatorNote(entry)) {
    return false;
  }
  if (requireDemo && !entry.demo) {
    return false;
  }
  if (requireImage && !hasPreviewImage(entry)) {
    return false;
  }
  if (requireMissingImage && hasPreviewImage(entry) && !isPinnedMissingImageSite(entry.siteId)) {
    return false;
  }

  if (textTokens.length === 0) {
    return true;
  }

  const haystack = buildEntrySearchText(entry);
  return textTokens.every((token) => haystack.includes(token));
}

function buildEntrySearchText(entry) {
  const fields = getEntrySearchFields(entry);
  const activeFieldIds = getActiveSearchFieldIds();
  return activeFieldIds
    .flatMap((fieldId) => fields[fieldId] || [])
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
}

function getEntrySearchFields(entry) {
  const description = normalizeSummaryText(entry?.description);
  const summary = normalizeSummaryText(buildSummary(entry));
  const notes = Array.isArray(entry?.notes) ? entry.notes.map(normalizeSummaryText) : [];
  const operatorNote = normalizeSummaryText(entry?.operatorNote);
  const testNotes = normalizeSummaryText(entry?.testNotes);
  const tags = Array.isArray(entry?.tags)
    ? entry.tags.flatMap((tag) => [normalizeCatalogToken(tag), humanizeToken(tag)])
    : [];
  const title = normalizeFriendlyName(buildDisplayTitle(entry));
  const displayName = normalizeFriendlyName(entry?.displayName);
  const siteId = normalizeSiteId(entry?.siteId);
  const host = String(entry?.host || '').trim();
  const url = resolveEntryUrl(entry) || entry?.url || '';
  const aliases = Array.isArray(entry?.aliases) ? entry.aliases : [];

  return {
    title: [title, displayName],
    url: [siteId, host, url, ...aliases],
    description: [description, summary, operatorNote, testNotes, ...notes, ...tags],
  };
}

function getTypeRank(entry) {
  if (entry.categories.framework) return 1;
  if (entry.githubBacked) return 2;
  if (entry.categories.synthetic) return 4;
  if (entry.categories.snapshot) return 5;
  if (entry.categories.legacy) return 6;
  return 3;
}

function compareEntries(left, right) {
  switch (state.sort) {
    case 'rank':
      return compareManualRank(left, right);
    case 'public':
      return comparePublic(left, right);
    case 'type': {
      const delta = getTypeRank(left) - getTypeRank(right);
      return delta !== 0 ? delta : compareAlphabetical(left, right);
    }
    case 'recent':
      return compareRecent(left, right);
    default:
      return compareAlphabetical(left, right);
  }
}

function compareManualRank(left, right) {
  const delta = (right.manualRank ?? 0) - (left.manualRank ?? 0);
  if (delta !== 0) {
    return delta;
  }
  const mainDelta = Number(right.mainSite === true) - Number(left.mainSite === true);
  return mainDelta !== 0 ? mainDelta : compareAlphabetical(left, right);
}

function comparePublic(left, right) {
  const delta = Number(right?.isPublic === true) - Number(left?.isPublic === true);
  if (delta !== 0) {
    return delta;
  }
  return compareAlphabetical(left, right);
}

function compareRecent(left, right) {
  const leftTime = getEntryModifiedTimestamp(left);
  const rightTime = getEntryModifiedTimestamp(right);
  if (leftTime !== rightTime) {
    return rightTime - leftTime;
  }
  return left.siteId.localeCompare(right.siteId);
}

function inferDateScore(siteId) {
  const match = siteId.match(/^(\d{4})-(\d{2})-(\d{2})(?:-(\d{2})-(\d{2})-(\d{2}))?/);
  if (!match) {
    return -1;
  }

  const [year, month, day, hour = '00', minute = '00', second = '00'] = match.slice(1);
  return Number(`${year}${month}${day}${hour}${minute}${second}`);
}

function renderSummary() {
  if (viewSummaryEl) {
    viewSummaryEl.textContent = state.catalogMode === 'csv' ? 'CSV feed' : 'Summary';
  }

  if (swipeEls.summary) {
    const searchLabel = searchEl ? searchEl.value.trim() : '';
    const searchNote = state.search ? ` for "${searchLabel}"` : '';
    const groupCount = state.visibleEntries.length;
    const siteCount = countRepresentedSites(state.visibleEntries);
    const sourceNote = state.catalogMode === 'csv' ? ' from CSV' : '';
    swipeEls.summary.textContent = `${groupCount.toLocaleString()} groups / ${siteCount.toLocaleString()} sites${sourceNote}${searchNote}`;
  }
}

function countRepresentedSites(entries) {
  const siteIds = new Set();
  for (const entry of Array.isArray(entries) ? entries : []) {
    const members = Array.isArray(entry?.familyMembers) && entry.familyMembers.length > 0
      ? entry.familyMembers
      : [entry];
    for (const member of members) {
      if (member?.siteId) {
        siteIds.add(member.siteId);
      }
    }
  }
  return siteIds.size;
}

function getVisibleNotedEntries() {
  return state.visibleSiteEntries.filter((entry) => hasOperatorNote(entry));
}

function getVisibleMutableNotedEntries() {
  return getVisibleNotedEntries().filter((entry) => canMutateEntry(entry));
}

function getFeedbackEntriesForAuditFilter(filterMode = state.auditDeck.filterMode) {
  return getVisibleNotedEntries();
}

function openFeedbackWorkspace(filterMode = AUDIT_FILTER_HAS_FEEDBACK) {
  openNotesModal();
}

function setAuditFilterMode(filterMode, options = {}) {
  const normalized = normalizeAuditFilterMode(filterMode);
  state.auditDeck.filterMode = normalized;
  state.auditDeck.currentIndex = 0;
  if (normalized !== AUDIT_FILTER_REVIEW) {
    state.auditDeck.error = '';
    state.auditDeck.loading = false;
  }
  if (options.render !== false) {
    render();
  }
}

function normalizeAuditFilterMode(value) {
  const normalized = normalizeCatalogToken(value);
  if (normalized === AUDIT_FILTER_HAS_FEEDBACK) {
    return normalized;
  }
  return AUDIT_FILTER_REVIEW;
}

function ensureAuditDeckLoaded() {
  if (state.auditDeck.queue.length > 0 || state.auditDeck.loading || state.auditDeck.error) {
    renderAuditView();
    return;
  }
  loadAuditDeck();
}

async function loadAuditDeck(options = {}) {
  if (!state.apiBaseUrl) {
    state.auditDeck.error = COMPOSER_UNAVAILABLE_MESSAGE;
    renderAuditView();
    return false;
  }
  if (state.auditDeck.loading) {
    return false;
  }

  const requestedPageIndex = Math.max(0, Number.parseInt(
    options.pageIndex ?? state.auditDeck.pageIndex ?? 0,
    10,
  ) || 0);
  state.auditDeck.loading = true;
  state.auditDeck.error = '';
  if (options.force) {
    state.auditDeck.seed = new Date().toISOString();
  }
  renderAuditView();

  try {
    const params = new URLSearchParams({
      size: String(AUDIT_DECK_SIZE),
      page: String(requestedPageIndex + 1),
    });
    if (state.auditDeck.seed) {
      params.set('seed', state.auditDeck.seed);
    }
    const payload = await fetchJson(`${state.apiBaseUrl}/api/audit/deck?${params.toString()}`);
    state.auditDeck.queue = Array.isArray(payload.queue) ? payload.queue : [];
    state.auditDeck.summary = payload.summary || null;
    state.auditDeck.generatedAt = payload.generatedAt || '';
    state.auditDeck.batchSize = Number.parseInt(payload.batchSize || AUDIT_DECK_SIZE, 10) || AUDIT_DECK_SIZE;
    state.auditDeck.pageIndex = Math.max(
      0,
      (Number.parseInt(payload.page || '', 10) || requestedPageIndex + 1) - 1,
    );
    state.auditDeck.totalCount = Number.parseInt(
      payload.totalCount ?? payload.summary?.candidateCount ?? state.auditDeck.queue.length,
      10,
    ) || state.auditDeck.queue.length;
    const focus = options.focus === 'end'
      ? state.auditDeck.queue.length - 1
      : options.focus === 'start'
        ? 0
        : state.auditDeck.currentIndex;
    state.auditDeck.currentIndex = clampNumber(focus, 0, Math.max(state.auditDeck.queue.length - 1, 0));
    state.auditDeck.drafts = {};
    hydrateAuditDraftForCurrentEntry();
    renderAuditView();
    return true;
  } catch (error) {
    if (state.visibleSiteEntries.length > 0) {
      const fallbackPage = sliceFixedPage(
        state.visibleSiteEntries,
        requestedPageIndex,
        state.auditDeck.batchSize || AUDIT_DECK_SIZE,
      );
      state.auditDeck.queue = fallbackPage.items.map(buildCatalogAuditEntry);
      state.auditDeck.summary = {
        candidateCount: state.visibleSiteEntries.length,
        unresolvedCount: state.visibleSiteEntries.length,
      };
      state.auditDeck.generatedAt = new Date().toISOString();
      state.auditDeck.pageIndex = fallbackPage.page;
      state.auditDeck.totalCount = state.visibleSiteEntries.length;
      state.auditDeck.currentIndex = 0;
      state.auditDeck.drafts = {};
      state.auditDeck.error = '';
      hydrateAuditDraftForCurrentEntry();
      renderAuditView();
      return true;
    }
    state.auditDeck.error = error.message || 'Could not load review deck.';
    renderAuditView();
    return false;
  } finally {
    state.auditDeck.loading = false;
    renderAuditView();
  }
}

function getAuditDeckPageCount() {
  return getFixedPageCount(getAuditPagerTotal(), state.auditDeck.batchSize || AUDIT_DECK_SIZE);
}

function canLoadAuditDeckPage(pageIndex) {
  return state.auditDeck.filterMode === AUDIT_FILTER_REVIEW
    && !state.auditDeck.loading
    && pageIndex >= 0
    && pageIndex < getAuditDeckPageCount();
}

async function loadAuditDeckPage(pageIndex, options = {}) {
  if (!canLoadAuditDeckPage(pageIndex)) {
    return false;
  }
  if (isAuditReviewSearchMode()) {
    state.auditDeck.pageIndex = pageIndex;
    const queue = buildAuditDisplayQueue();
    state.auditDeck.currentIndex = options.focus === 'end' ? Math.max(queue.length - 1, 0) : 0;
    renderAuditView();
    return true;
  }
  return loadAuditDeck({ pageIndex, focus: options.focus || 'start' });
}

async function loadAuditCritiquePresets() {
  if (!state.apiBaseUrl || state.auditCritiquePresets.loading || state.auditCritiquePresets.loaded) {
    renderAuditPresets();
    renderNoteFeedbackPresets();
    return false;
  }
  state.auditCritiquePresets.loading = true;
  state.auditCritiquePresets.error = '';
  renderAuditPresets();
  renderNoteFeedbackPresets();
  try {
    const payload = await fetchJson(`${state.apiBaseUrl}/api/audit/critique-presets`);
    state.auditCritiquePresets.presets = normalizeAuditCritiquePresets(payload.presets);
    state.auditCritiquePresets.updatedAt = payload.updatedAt || '';
    state.auditCritiquePresets.loaded = true;
    renderAuditPresets();
    renderNoteFeedbackPresets();
    return true;
  } catch (error) {
    state.auditCritiquePresets.error = error.message || 'Could not load critique presets.';
    state.auditCritiquePresets.presets = [...DEFAULT_AUDIT_CRITIQUE_PRESETS];
    state.auditCritiquePresets.loaded = true;
    renderAuditPresets();
    renderNoteFeedbackPresets();
    return false;
  } finally {
    state.auditCritiquePresets.loading = false;
    renderAuditPresets();
    renderNoteFeedbackPresets();
  }
}

function renderAuditView() {
  if (!auditViewEl) {
    return;
  }
  const queue = buildAuditDisplayQueue();
  state.auditDeck.displayQueue = queue;
  state.auditDeck.currentIndex = clampNumber(state.auditDeck.currentIndex, 0, Math.max(queue.length - 1, 0));
  const current = getCurrentAuditEntry();
  const draft = hydrateAuditDraftForCurrentEntry();
  syncAuditFilterControls(queue);
  renderAuditQueue(queue);
  renderAuditCurrent(current, draft);
  renderAuditPresets();
  updateAuditStatusMessage();
}

function buildAuditDisplayQueue() {
  if (state.auditDeck.filterMode === AUDIT_FILTER_REVIEW) {
    if (isAuditReviewSearchMode()) {
      const page = sliceFixedPage(
        state.visibleSiteEntries,
        state.auditDeck.pageIndex,
        state.auditDeck.batchSize || AUDIT_DECK_SIZE,
      );
      state.auditDeck.pageIndex = page.page;
      return page.items.map(buildCatalogAuditEntry);
    }
    return state.auditDeck.queue;
  }

  const notedEntries = getFeedbackEntriesForAuditFilter()
    .map(buildFeedbackAuditEntry)
    .filter(Boolean);

  notedEntries.sort((left, right) => {
    const rankDelta = (right.manualRank || 0) - (left.manualRank || 0);
    if (rankDelta !== 0) return rankDelta;
    return (Date.parse(right.operatorNoteUpdatedAt || '') || 0) - (Date.parse(left.operatorNoteUpdatedAt || '') || 0);
  });
  return notedEntries;
}

function isAuditReviewSearchMode() {
  return state.auditDeck.filterMode === AUDIT_FILTER_REVIEW && Boolean(state.search);
}

function getAuditPagerTotal(queue = getActiveAuditQueue()) {
  if (isAuditReviewSearchMode()) {
    return state.visibleSiteEntries.length;
  }
  if (state.auditDeck.filterMode === AUDIT_FILTER_REVIEW) {
    return Math.max(state.auditDeck.totalCount || 0, state.auditDeck.queue.length || 0);
  }
  return queue.length;
}

function buildCatalogAuditEntry(entry) {
  const note = getOperatorNote(entry);
  const manualRank = normalizeManualRank(entry.manualRank);
  return {
    siteId: entry.siteId,
    host: entry.host,
    url: entry.url || `https://${entry.siteId}.${BASE_DOMAIN}/`,
    displayName: buildDisplayTitle(entry) || entry.siteId,
    description: entry.description || note || '',
    tags: Array.isArray(entry.tags) ? [...entry.tags] : [],
    manualRank,
    operatorNote: note,
    operatorNoteAttachments: normalizeFeedbackAttachments(entry.operatorNoteAttachments),
    operatorNoteUpdatedAt: entry.operatorNoteUpdatedAt || null,
    priorityScore: manualRank,
    priorityReason: 'search',
    audit: {
      status: normalizeAuditStatus(entry.audit?.status || 'needs-work'),
      quality: Number.isFinite(entry.audit?.quality) ? entry.audit.quality : 3,
      reviewCount: Number(entry.audit?.reviewCount || 0),
      latestNote: entry.audit?.latestNote || note || null,
      lastReviewedAt: entry.audit?.lastReviewedAt || entry.operatorNoteUpdatedAt || null,
    },
  };
}

function buildFeedbackAuditEntry(entry) {
  const note = getOperatorNote(entry);
  if (!note) {
    return null;
  }
  const manualRank = normalizeManualRank(entry.manualRank);
  return {
    siteId: entry.siteId,
    host: entry.host,
    url: entry.url || `https://${entry.siteId}.${BASE_DOMAIN}/`,
    displayName: buildDisplayTitle(entry) || entry.siteId,
    description: entry.description || '',
    tags: Array.isArray(entry.tags) ? [...entry.tags] : [],
    manualRank,
    operatorNote: note,
    operatorNoteAttachments: normalizeFeedbackAttachments(entry.operatorNoteAttachments),
    operatorNoteUpdatedAt: entry.operatorNoteUpdatedAt || null,
    priorityScore: manualRank,
    priorityReason: 'saved-feedback',
    audit: {
      status: manualRank > 0 ? 'todo' : 'reviewed',
      quality: manualRank > 0 ? 2 : 3,
      reviewCount: 0,
      latestNote: note,
      lastReviewedAt: entry.operatorNoteUpdatedAt || null,
    },
  };
}

function syncAuditFilterControls(queue) {
  const mode = state.auditDeck.filterMode;
  auditFilterButtons.forEach((button) => {
    const active = button.dataset.auditFilter === mode;
    button.setAttribute('aria-pressed', active ? 'true' : 'false');
    button.classList.toggle('is-active', active);
  });

  if (auditDeckEyebrowEl) {
    auditDeckEyebrowEl.textContent = '';
  }
  if (auditDeckTitleEl) {
    auditDeckTitleEl.textContent = '';
  }
  renderAuditPager(queue);
}

function renderAuditPager(queue = getActiveAuditQueue()) {
  const mode = state.auditDeck.filterMode;
  const isReviewMode = mode === AUDIT_FILTER_REVIEW;
  const pageIndex = isReviewMode ? state.auditDeck.pageIndex : 0;
  const total = getAuditPagerTotal(queue);
  const page = buildFixedPage(total, pageIndex, state.auditDeck.batchSize || AUDIT_DECK_SIZE);
  const pageCount = isReviewMode ? page.pageCount : 1;
  const range = formatFixedPageRange(page, total, queue.length);

  if (auditPageSummaryEl) {
    auditPageSummaryEl.textContent = total > 0
      ? `${range.start.toLocaleString()}-${range.end.toLocaleString()} of ${total.toLocaleString()} sites`
      : 'No sites';
  }
  if (auditPageStatusEl) {
    auditPageStatusEl.textContent = `Page ${(page.page + 1).toLocaleString()} of ${pageCount.toLocaleString()}`;
  }
  if (auditPagePrevButton) {
    auditPagePrevButton.disabled = !isReviewMode || state.auditDeck.loading || page.page <= 0;
  }
  if (auditPageNextButton) {
    auditPageNextButton.disabled = !isReviewMode || state.auditDeck.loading || page.page >= pageCount - 1;
  }
}

function toggleAuditPreviewScaleMode() {
  state.auditDeck.previewScaleMode = state.auditDeck.previewScaleMode === AUDIT_PREVIEW_SCALE_FIT
    ? AUDIT_PREVIEW_SCALE_ACTUAL
    : AUDIT_PREVIEW_SCALE_FIT;
  applyAuditPreviewScale();
}

function syncAuditPreviewScaleToggle(scale) {
  if (!auditScaleToggleButton) {
    return;
  }
  const scaled = state.auditDeck.previewScaleMode === AUDIT_PREVIEW_SCALE_FIT;
  auditScaleToggleButton.setAttribute('aria-pressed', scaled ? 'true' : 'false');
  auditScaleToggleButton.classList.toggle('is-active', scaled);
  auditScaleToggleButton.title = scaled
    ? `Showing scaled ${AUDIT_FIT_VIEWPORT_WIDTH}x${AUDIT_FIT_VIEWPORT_HEIGHT} preview at ${Math.round(scale * 100)}%. Switch to 1:1.`
    : 'Showing 1:1 preview. Scale preview to fit.';
  auditScaleToggleButton.setAttribute('aria-label', scaled ? 'Switch preview to 1:1' : 'Scale preview to fit');
  const labelEl = auditScaleToggleButton.querySelector('span');
  if (labelEl) {
    labelEl.textContent = scaled ? '1:1' : 'Scale';
  }
  const iconEl = auditScaleToggleButton.querySelector('i');
  if (iconEl) {
    iconEl.className = scaled ? 'ti ti-aspect-ratio' : 'ti ti-arrows-maximize';
  }
}

function applyAuditPreviewScale() {
  if (!auditFrameEl) {
    return;
  }
  if (state.auditDeck.previewScaleMode !== AUDIT_PREVIEW_SCALE_FIT) {
    auditFrameEl.classList.remove('is-scaled');
    auditFrameEl.style.removeProperty('--audit-frame-scale');
    auditFrameEl.style.removeProperty('width');
    auditFrameEl.style.removeProperty('height');
    auditFrameEl.style.removeProperty('transform');
    syncAuditPreviewScaleToggle(1);
    return;
  }

  const container = auditFrameEl.parentElement;
  const bounds = container?.getBoundingClientRect();
  const availableWidth = Math.max(1, bounds?.width || auditFrameEl.clientWidth || AUDIT_FIT_VIEWPORT_WIDTH);
  const availableHeight = Math.max(1, bounds?.height || auditFrameEl.clientHeight || AUDIT_FIT_VIEWPORT_HEIGHT);
  const scale = Math.min(1, availableWidth / AUDIT_FIT_VIEWPORT_WIDTH, availableHeight / AUDIT_FIT_VIEWPORT_HEIGHT);
  auditFrameEl.classList.add('is-scaled');
  auditFrameEl.style.width = `${AUDIT_FIT_VIEWPORT_WIDTH}px`;
  auditFrameEl.style.height = `${AUDIT_FIT_VIEWPORT_HEIGHT}px`;
  auditFrameEl.style.setProperty('--audit-frame-scale', String(scale));
  auditFrameEl.style.transform = `translate(-50%, -50%) scale(${scale})`;
  syncAuditPreviewScaleToggle(scale);
}

function renderAuditPresets() {
  if (!auditPresetsListEl) {
    return;
  }
  const hasCurrentEntry = Boolean(getCurrentAuditEntry()?.siteId);
  const presets = state.auditCritiquePresets.presets.length > 0
    ? state.auditCritiquePresets.presets
    : [...DEFAULT_AUDIT_CRITIQUE_PRESETS];
  auditPresetsListEl.innerHTML = presets.map((preset) => `
    <button
      type="button"
      class="audit-preset-chip"
      data-audit-preset-id="${escapeHtml(preset.id)}"
      title="${escapeHtml(preset.text)}"
      ${hasCurrentEntry ? '' : 'disabled'}
    >
      <i class="ti ti-message-plus"></i>
      <span>${escapeHtml(preset.label)}</span>
    </button>
  `).join('');
}

function renderNoteFeedbackPresets() {
  if (!notePresetsListEl) {
    return;
  }
  const presets = state.auditCritiquePresets.presets.length > 0
    ? state.auditCritiquePresets.presets
    : [...DEFAULT_AUDIT_CRITIQUE_PRESETS];
  notePresetsListEl.innerHTML = presets.map((preset) => `
    <button
      type="button"
      class="audit-preset-chip"
      data-note-preset-id="${escapeHtml(preset.id)}"
      title="${escapeHtml(preset.text)}"
    >
      <i class="ti ti-message-plus"></i>
      <span>${escapeHtml(preset.label)}</span>
    </button>
  `).join('');
}

function renderAuditQueue(queue) {
  if (!auditQueueEl) {
    return;
  }
  if (state.auditDeck.loading && queue.length === 0) {
    auditQueueEl.innerHTML = `
      <div class="audit-empty">
        <i class="ti ti-loader-2"></i>
        <p>Loading review deck...</p>
      </div>
    `;
    return;
  }
  if (state.auditDeck.error && queue.length === 0) {
    auditQueueEl.innerHTML = `
      <div class="audit-empty">
        <i class="ti ti-alert-circle"></i>
        <p>${escapeHtml(state.auditDeck.error)}</p>
      </div>
    `;
    return;
  }
  if (queue.length === 0) {
    const emptyMessage = state.auditDeck.filterMode === AUDIT_FILTER_REVIEW
      ? 'No reviewable sites are available.'
      : 'No visible sites have saved feedback.';
    auditQueueEl.innerHTML = `
      <div class="audit-empty">
        <i class="ti ti-clipboard-off"></i>
        <p>${escapeHtml(emptyMessage)}</p>
      </div>
    `;
    return;
  }

  const isReviewMode = state.auditDeck.filterMode === AUDIT_FILTER_REVIEW;
  const numberOffset = isReviewMode
    ? buildFixedPage(getAuditPagerTotal(queue), state.auditDeck.pageIndex, state.auditDeck.batchSize || AUDIT_DECK_SIZE).start
    : 0;
  auditQueueEl.innerHTML = queue.map((entry, index) => {
    const active = index === state.auditDeck.currentIndex;
    const hasFeedback = auditEntryHasFeedback(entry);
    const showFeedbackBadge = hasFeedback && state.auditDeck.filterMode === AUDIT_FILTER_HAS_FEEDBACK;
    const queueNumber = numberOffset + index + 1;
    const previewUrl = resolvePreviewAssetUrl(getPreviewUrl(entry.siteId));
    const numberStyle = previewUrl ? ` style="--audit-queue-preview: url('${escapeHtml(previewUrl)}')"` : '';
    return `
      <button
        type="button"
        class="audit-queue-card ${active ? 'is-active' : ''} ${hasFeedback ? 'has-feedback' : ''}"
        data-audit-index="${index}"
        aria-pressed="${active ? 'true' : 'false'}"
      >
        <span class="audit-queue-card__number${previewUrl ? ' has-preview' : ''}"${numberStyle}>
          <span class="audit-queue-card__ordinal">${queueNumber.toLocaleString()}</span>
          ${showFeedbackBadge ? '<span class="audit-feedback-marker" aria-label="Has feedback" title="Has saved feedback"><i class="ti ti-message-circle"></i></span>' : ''}
        </span>
        <span class="audit-queue-card__copy">
          <strong>${escapeHtml(entry.displayName || entry.siteId)}</strong>
          <span>${escapeHtml(entry.host || entry.siteId)}</span>
        </span>
      </button>
    `;
  }).join('');
}

function auditEntryHasFeedback(entry) {
  if (!entry) {
    return false;
  }
  const catalogEntry = resolveAuditCatalogEntry(entry);
  return Boolean(
    getOperatorNote(catalogEntry || entry)
    || getOperatorNote(entry)
    || normalizeManualRank(catalogEntry?.manualRank ?? entry.manualRank) > 0
  );
}

function renderAuditCurrent(entry, draft) {
  const hasEntry = Boolean(entry);
  if (auditTitleEl) {
    auditTitleEl.textContent = hasEntry ? (entry.displayName || entry.siteId) : 'Review';
  }
  if (auditMetaEl) {
    const audit = entry?.audit || {};
    const parts = [
      entry?.host || '',
      audit.lastReviewedAt ? `Reviewed ${formatTimestamp(audit.lastReviewedAt)}` : '',
    ].filter(Boolean);
    auditMetaEl.textContent = parts.join(' / ');
    auditMetaEl.href = hasEntry && entry.url ? entry.url : '#';
  }
  if (auditDescriptionEl) {
    auditDescriptionEl.textContent = entry?.description || entry?.operatorNote || '';
  }
  if (auditFrameEl) {
    const nextSrc = hasEntry && entry.url ? entry.url : 'about:blank';
    if (auditFrameEl.src !== nextSrc && auditFrameEl.getAttribute('src') !== nextSrc) {
      setAuditFrameStatus(hasEntry ? 'loading' : 'empty');
      auditFrameEl.src = nextSrc;
    }
    applyAuditPreviewScale();
  }
  if (auditPreviewImageEl) {
    if (hasEntry) {
      const catalogEntry = resolveAuditCatalogEntry(entry);
      assignPreviewImage(auditPreviewImageEl, getPreviewUrl(entry.siteId), `${entry.siteId} preview`, catalogEntry || entry);
      auditPreviewImageEl.classList.add('is-hidden');
    } else {
      auditPreviewImageEl.removeAttribute('src');
      auditPreviewImageEl.classList.add('is-hidden');
    }
  }

  if (auditNoteEl && document.activeElement !== auditNoteEl) {
    auditNoteEl.value = draft.note || '';
  }
  auditAttachmentListEl?.closest('.audit-attachments')?.classList.toggle(
    'is-hidden',
    state.auditDeck.filterMode === AUDIT_FILTER_REVIEW,
  );
  renderAuditAttachments(draft.attachments || []);
  if (auditRankFieldEl) {
    auditRankFieldEl.classList.toggle('is-hidden', state.auditDeck.filterMode === AUDIT_FILTER_REVIEW);
  }
  if (auditRankEl && document.activeElement !== auditRankEl) {
    auditRankEl.value = String(draft.manualRank ?? normalizeManualRank(entry?.manualRank));
  }
  const busy = Boolean(entry?.siteId && state.auditDeck.savingSiteId === entry.siteId);
  [auditSaveButton, auditOpenButton, auditFullscreenButton, auditScaleToggleButton, auditPrevButton, auditNextButton, auditRankEl].forEach((button) => {
    if (!button) return;
    button.disabled = !hasEntry || busy;
  });
  const queueLength = getActiveAuditQueue().length;
  const canMoveBack = state.auditDeck.currentIndex > 0
    || (state.auditDeck.filterMode === AUDIT_FILTER_REVIEW && state.auditDeck.pageIndex > 0);
  const canMoveNext = state.auditDeck.currentIndex < queueLength - 1
    || (state.auditDeck.filterMode === AUDIT_FILTER_REVIEW && state.auditDeck.pageIndex < getAuditDeckPageCount() - 1);
  if (auditPrevButton) auditPrevButton.disabled = !hasEntry || busy || !canMoveBack || state.auditDeck.loading;
  if (auditNextButton) auditNextButton.disabled = !hasEntry || busy || !canMoveNext || state.auditDeck.loading;
  if (auditSaveButton) {
    auditSaveButton.disabled = !hasEntry || busy || !state.apiBaseUrl;
    auditSaveButton.querySelector('span').textContent = busy
      ? 'Saving...'
      : 'Save feedback';
  }
  if (auditResetFeedbackButton) {
    const catalogEntry = hasEntry ? resolveAuditCatalogEntry(entry) : null;
    const hasClearableFeedback = hasEntry && auditDraftHasFeedbackContent(draft);
    const canReset = hasClearableFeedback && canMutateEntry(catalogEntry || entry) && !busy && !state.notesBulkClearBusy;
    auditResetFeedbackButton.disabled = !canReset;
    auditResetFeedbackButton.classList.toggle('is-hidden', !hasEntry);
    auditResetFeedbackButton.title = !hasEntry
      ? 'Pick a site first.'
      : !hasClearableFeedback
        ? 'No feedback to clear.'
        : !canMutateEntry(catalogEntry || entry)
          ? 'Imported CSV rows stay read-only in the launchpad.'
          : 'Clear feedback.';
    auditResetFeedbackButton.setAttribute('aria-label', auditResetFeedbackButton.title);
  }
}

function updateAuditStatusMessage(message, tone = '') {
  if (!auditStatusMessageEl) {
    return;
  }
  const text = message || state.auditDeck.error || buildAuditSummaryText();
  auditStatusMessageEl.textContent = text;
  auditStatusMessageEl.classList.toggle('is-error', tone === 'error' || Boolean(state.auditDeck.error));
  auditStatusMessageEl.classList.toggle('is-success', tone === 'success');
  auditStatusMessageEl.classList.toggle('is-warning', tone === 'warning');
}

function buildAuditSummaryText() {
  if (state.auditDeck.filterMode !== AUDIT_FILTER_REVIEW) {
    const feedbackCount = getFeedbackEntriesForAuditFilter(AUDIT_FILTER_HAS_FEEDBACK).length;
    return `${feedbackCount.toLocaleString()} visible ${feedbackCount === 1 ? 'site has' : 'sites have'} saved feedback.`;
  }
  const summary = state.auditDeck.summary;
  if (!summary) {
    return 'Reviews save to the Mullmania data bucket and feed the next deck order.';
  }
  const unresolved = Number(summary.unresolvedCount || 0);
  const candidates = Number(summary.candidateCount || 0);
  return `${candidates.toLocaleString()} reviewable sites / ${unresolved.toLocaleString()} unresolved.`;
}

function getActiveAuditQueue() {
  return state.auditDeck.filterMode === AUDIT_FILTER_REVIEW && !isAuditReviewSearchMode()
    ? state.auditDeck.queue
    : state.auditDeck.displayQueue;
}

function getCurrentAuditEntry() {
  return getActiveAuditQueue()[state.auditDeck.currentIndex] || null;
}

function resolveAuditCatalogEntry(entry) {
  if (!entry?.siteId) {
    return null;
  }
  return resolveDisplayEntryForSite(entry.siteId) || findEntryBySiteId(entry.siteId) || entry;
}

function setAuditIndex(index) {
  const queue = state.auditDeck.filterMode === AUDIT_FILTER_REVIEW
    ? state.auditDeck.queue
    : buildAuditDisplayQueue();
  if (!queue.length) {
    state.auditDeck.currentIndex = 0;
    renderAuditView();
    return;
  }
  state.auditDeck.currentIndex = clampNumber(index, 0, queue.length - 1);
  hydrateAuditDraftForCurrentEntry();
  renderAuditView();
}

async function navigateAuditDeck(delta) {
  const queue = getActiveAuditQueue();
  if (!queue.length || !Number.isFinite(delta) || delta === 0) {
    return false;
  }
  const nextIndex = state.auditDeck.currentIndex + delta;
  if (nextIndex >= 0 && nextIndex < queue.length) {
    setAuditIndex(nextIndex);
    return true;
  }
  if (state.auditDeck.filterMode !== AUDIT_FILTER_REVIEW) {
    return false;
  }
  if (delta > 0) {
    return loadAuditDeckPage(state.auditDeck.pageIndex + 1, { focus: 'start' });
  }
  return loadAuditDeckPage(state.auditDeck.pageIndex - 1, { focus: 'end' });
}

function hydrateAuditDraftForCurrentEntry() {
  const entry = getCurrentAuditEntry();
  if (!entry?.siteId) {
    return { status: 'needs-work', note: '', quality: 3, manualRank: '0', attachments: [] };
  }
  if (!state.auditDeck.drafts[entry.siteId]) {
    const audit = entry.audit || {};
    const catalogEntry = resolveAuditCatalogEntry(entry);
    state.auditDeck.drafts[entry.siteId] = {
      status: normalizeAuditStatus(audit.status === 'unreviewed' ? 'needs-work' : audit.status),
      note: audit.latestNote || '',
      quality: Number.isFinite(audit.quality) ? audit.quality : 3,
      manualRank: String(normalizeManualRank(entry.manualRank)),
      attachments: normalizeFeedbackAttachments(catalogEntry?.operatorNoteAttachments || entry.operatorNoteAttachments),
    };
  }
  return state.auditDeck.drafts[entry.siteId];
}

function normalizeFeedbackAttachments(values) {
  if (!Array.isArray(values)) {
    return [];
  }
  return values
    .filter((item) => item && typeof item === 'object')
    .slice(0, 6)
    .map((item, index) => ({
      id: String(item.id || item.key || item.url || item.dataUrl || `attachment-${index}`),
      name: String(item.name || `feedback-image-${index + 1}`),
      contentType: String(item.contentType || 'image/png'),
      size: Number.isFinite(Number(item.size)) ? Number(item.size) : 0,
      key: item.key ? String(item.key) : '',
      url: item.url ? String(item.url) : '',
      dataUrl: item.dataUrl ? String(item.dataUrl) : '',
      createdAt: item.createdAt ? String(item.createdAt) : '',
    }))
    .filter((item) => item.url || item.dataUrl || item.key);
}

function renderAuditAttachments(attachments = []) {
  if (!auditAttachmentListEl) {
    return;
  }
  const normalized = normalizeFeedbackAttachments(attachments);
  if (normalized.length === 0) {
    auditAttachmentListEl.innerHTML = `
      <div class="audit-attachment-empty">
        <i class="ti ti-photo-plus"></i>
        <span>No images attached</span>
      </div>
    `;
    return;
  }
  auditAttachmentListEl.innerHTML = normalized.map((attachment) => {
    const src = attachment.url || attachment.dataUrl;
    return `
      <div class="audit-attachment-chip">
        <a href="${escapeHtml(src)}" target="_blank" rel="noreferrer" title="${escapeHtml(attachment.name)}">
          <img src="${escapeHtml(src)}" alt="${escapeHtml(attachment.name)}">
        </a>
        <button type="button" class="audit-attachment-remove" data-audit-attachment-remove="${escapeHtml(attachment.id)}" aria-label="Remove ${escapeHtml(attachment.name)}">
          <i class="ti ti-x"></i>
        </button>
      </div>
    `;
  }).join('');
}

async function handleAuditAttachmentPaste(event) {
  const files = Array.from(event.clipboardData?.files || []).filter((file) => file.type.startsWith('image/'));
  if (files.length === 0) {
    return;
  }
  event.preventDefault();
  if (state.auditDeck.filterMode === AUDIT_FILTER_REVIEW) {
    updateAuditStatusMessage('Switch to Has feedback before attaching images.', 'warning');
    return;
  }
  await addAuditAttachmentFiles(files);
}

async function addAuditAttachmentFiles(files) {
  const imageFiles = files.filter((file) => file?.type?.startsWith('image/'));
  if (imageFiles.length === 0) {
    return false;
  }
  const entry = getCurrentAuditEntry();
  if (!entry?.siteId) {
    updateAuditStatusMessage('Pick a site before attaching images.', 'warning');
    return false;
  }
  if (state.auditDeck.filterMode === AUDIT_FILTER_REVIEW) {
    updateAuditStatusMessage('Switch to Has feedback before attaching images.', 'warning');
    return false;
  }
  const current = hydrateAuditDraftForCurrentEntry();
  const currentAttachments = normalizeFeedbackAttachments(current.attachments);
  const availableSlots = Math.max(0, 6 - currentAttachments.length);
  if (availableSlots === 0) {
    updateAuditStatusMessage('Feedback can keep up to 6 images.', 'warning');
    return false;
  }

  const nextAttachments = [...currentAttachments];
  for (const file of imageFiles.slice(0, availableSlots)) {
    if (file.size > 5 * 1024 * 1024) {
      updateAuditStatusMessage(`${file.name || 'Image'} is larger than 5 MB.`, 'warning');
      continue;
    }
    nextAttachments.push({
      id: `local-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      name: file.name || 'pasted-image.png',
      contentType: file.type || 'image/png',
      size: file.size,
      dataUrl: await readFileAsDataUrl(file),
    });
  }
  updateAuditDraft({ attachments: nextAttachments });
  updateAuditStatusMessage('Image attached. Save feedback to persist it.', 'info');
  return true;
}

function removeAuditAttachment(attachmentId) {
  const entry = getCurrentAuditEntry();
  if (!entry?.siteId || !attachmentId) {
    return;
  }
  const current = hydrateAuditDraftForCurrentEntry();
  updateAuditDraft({
    attachments: normalizeFeedbackAttachments(current.attachments)
      .filter((attachment) => attachment.id !== attachmentId),
  });
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(reader.error || new Error('Could not read image.'));
    reader.readAsDataURL(file);
  });
}

function updateAuditDraft(patch) {
  const entry = getCurrentAuditEntry();
  if (!entry?.siteId) {
    return;
  }
  const current = hydrateAuditDraftForCurrentEntry();
  const nextNote = Object.prototype.hasOwnProperty.call(patch, 'note')
    ? patch.note
    : auditNoteEl?.value ?? current.note ?? '';
  const nextManualRank = Object.prototype.hasOwnProperty.call(patch, 'manualRank')
    ? patch.manualRank
    : auditRankEl?.value ?? current.manualRank ?? String(normalizeManualRank(entry.manualRank));
  state.auditDeck.drafts[entry.siteId] = {
    ...current,
    ...patch,
    note: nextNote,
    quality: Number.isFinite(current.quality) ? current.quality : 3,
    manualRank: nextManualRank,
    attachments: normalizeFeedbackAttachments(patch.attachments ?? current.attachments),
  };
  renderAuditView();
}

function parseAuditDraftRank(value) {
  const parsed = Number.parseInt(String(value ?? '').trim(), 10);
  return Number.isFinite(parsed) ? parsed : 0;
}

function getAuditFeedbackBaseline(entry) {
  const catalogEntry = resolveAuditCatalogEntry(entry) || entry || {};
  return {
    note: normalizeSiteNoteText(getOperatorNote(catalogEntry)),
    manualRank: normalizeManualRank(catalogEntry.manualRank),
    attachments: normalizeFeedbackAttachments(catalogEntry.operatorNoteAttachments),
  };
}

function feedbackAttachmentsEqual(left = [], right = []) {
  const normalize = (items) => normalizeFeedbackAttachments(items)
    .map((item) => [
      item.id,
      item.key,
      item.url,
      item.dataUrl,
      item.name,
      item.contentType,
      String(item.size || 0),
    ].join('\u0001'))
    .sort();
  const leftList = normalize(left);
  const rightList = normalize(right);
  return leftList.length === rightList.length
    && leftList.every((value, index) => value === rightList[index]);
}

function isAuditFeedbackDraftDirty(entry, draft = hydrateAuditDraftForCurrentEntry()) {
  if (!entry?.siteId) {
    return false;
  }
  const baseline = getAuditFeedbackBaseline(entry);
  return normalizeSiteNoteText(draft.note || '') !== baseline.note
    || parseAuditDraftRank(draft.manualRank) !== baseline.manualRank
    || !feedbackAttachmentsEqual(draft.attachments || [], baseline.attachments);
}

function auditDraftHasFeedbackContent(draft = {}) {
  return Boolean(normalizeSiteNoteText(draft.note || ''))
    || parseAuditDraftRank(draft.manualRank) !== 0
    || normalizeFeedbackAttachments(draft.attachments || []).length > 0;
}

function applyAuditCritiquePreset(presetId) {
  const entry = getCurrentAuditEntry();
  if (!entry?.siteId) {
    updateAuditStatusMessage('Pick a site first.', 'warning');
    return;
  }
  const preset = state.auditCritiquePresets.presets.find((item) => item.id === presetId);
  if (!preset) {
    updateAuditStatusMessage('That critique preset is not available.', 'warning');
    return;
  }
  const current = hydrateAuditDraftForCurrentEntry();
  const currentNote = normalizeSiteNoteText(current.note || '');
  const presetText = normalizeSiteNoteText(preset.text || '');
  const nextNote = currentNote
    ? `${currentNote}\n\n${presetText}`
    : presetText;
  updateAuditDraft({
    note: nextNote,
  });
  if (auditNoteEl) {
    auditNoteEl.focus({ preventScroll: true });
    auditNoteEl.selectionStart = auditNoteEl.value.length;
    auditNoteEl.selectionEnd = auditNoteEl.value.length;
  }
  updateAuditStatusMessage(`Added "${preset.label}" critique.`, 'success');
}

function applyNoteFeedbackPreset(presetId) {
  if (!noteTextEl) {
    return;
  }
  const preset = state.auditCritiquePresets.presets.find((item) => item.id === presetId)
    || DEFAULT_AUDIT_CRITIQUE_PRESETS.find((item) => item.id === presetId);
  if (!preset) {
    updateNoteStatus('That feedback preset is not available.', 'warning');
    return;
  }
  const currentNote = normalizeSiteNoteText(noteTextEl.value || '');
  const presetText = normalizeSiteNoteText(preset.text || '');
  noteTextEl.value = currentNote ? `${currentNote}\n\n${presetText}` : presetText;
  noteTextEl.focus({ preventScroll: true });
  noteTextEl.selectionStart = noteTextEl.value.length;
  noteTextEl.selectionEnd = noteTextEl.value.length;
  updateNoteStatus(`Added "${preset.label}" feedback.`, 'success');
  syncNoteEditorControls();
}

function normalizeAuditCritiquePresets(values) {
  const raw = Array.isArray(values) ? values : [];
  const presets = raw
    .map((item) => {
      if (!item || typeof item !== 'object') {
        return null;
      }
      const label = String(item.label || '').trim().slice(0, 48);
      const text = normalizeSiteNoteText(item.text || '');
      if (!label || !text) {
        return null;
      }
      return {
        id: normalizeManagedTagId(item.id || label) || normalizeManagedTagId(label),
        label,
        text,
      };
    })
    .filter((item) => item && item.id);
  return presets.length > 0 ? presets : [...DEFAULT_AUDIT_CRITIQUE_PRESETS];
}

function openAuditPresetsModal() {
  if (!auditPresetsModalEl || !auditPresetsEditorEl) {
    return;
  }
  renderAuditPresetEditorRows(state.auditCritiquePresets.presets);
  updateAuditPresetsStatus('Edit the label and note text for each reusable critique.', '');
  auditPresetsModalEl.classList.remove('is-hidden');
  auditPresetsEditorEl.querySelector('input, textarea, select')?.focus({ preventScroll: true });
}

function closeAuditPresetsModal() {
  auditPresetsModalEl?.classList.add('is-hidden');
}

function renderAuditPresetEditorRows(presets) {
  if (!auditPresetsEditorEl) {
    return;
  }
  auditPresetsEditorEl.replaceChildren();
  const normalized = normalizeAuditCritiquePresets(presets);
  normalized.forEach((preset) => appendAuditPresetEditorRow(preset));
}

function appendAuditPresetEditorRow(preset) {
  if (!auditPresetsEditorEl) {
    return;
  }
  const card = document.createElement('section');
  card.className = 'audit-preset-editor-card';
  card.dataset.presetId = preset.id || '';
  card.innerHTML = `
    <div class="audit-preset-editor-card__top">
      <label class="field audit-field audit-preset-editor-card__label">
        <span>Label</span>
        <input data-audit-preset-field="label" type="text" maxlength="48" value="${escapeHtml(preset.label || '')}">
      </label>
      <button type="button" class="secondary audit-preset-editor-card__remove" data-audit-preset-remove="true" aria-label="Remove preset">
        <i class="ti ti-trash"></i>
        <span>Delete</span>
      </button>
    </div>
    <label class="field audit-field">
      <span>Critique text</span>
      <textarea data-audit-preset-field="text" class="audit-preset-editor-card__text" rows="3">${escapeHtml(preset.text || '')}</textarea>
    </label>
  `;
  auditPresetsEditorEl.appendChild(card);
}

function collectAuditPresetEditorRows() {
  if (!auditPresetsEditorEl) {
    return [];
  }
  return Array.from(auditPresetsEditorEl.querySelectorAll('.audit-preset-editor-card')).map((card) => {
    const getField = (name) => card.querySelector(`[data-audit-preset-field="${name}"]`)?.value || '';
    const label = String(getField('label')).trim();
    return {
      id: card.dataset.presetId || normalizeManagedTagId(label),
      label,
      text: normalizeSiteNoteText(getField('text')),
    };
  });
}

async function saveAuditCritiquePresets() {
  if (!auditPresetsEditorEl || !state.apiBaseUrl) {
    updateAuditPresetsStatus(COMPOSER_UNAVAILABLE_MESSAGE, 'error');
    return false;
  }
  const rawPresets = collectAuditPresetEditorRows();
  const incompletePreset = rawPresets.find((preset) => !preset.label || !preset.text);
  if (incompletePreset) {
    updateAuditPresetsStatus('Every preset needs both a label and critique text.', 'error');
    return false;
  }
  const presets = normalizeAuditCritiquePresets(rawPresets);
  const operatorKey = resolveOperatorKeyForProtectedAction({
    label: 'Saving critique presets',
    type: PROTECTED_ACTION_NOTE,
  });
  if (!operatorKey) {
    updateAuditPresetsStatus('Open Settings and paste the operator key once to save presets.', 'warning');
    return false;
  }
  state.auditCritiquePresets.saving = true;
  auditPresetsSaveButton.disabled = true;
  updateAuditPresetsStatus('Saving critique presets...', 'info');
  try {
    const response = await fetch(`${state.apiBaseUrl}/api/audit/critique-presets`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-operator-key': operatorKey,
      },
      body: JSON.stringify({ presets }),
    });
    const data = await readJsonResponse(response);
    if (!response.ok) {
      throw new Error(data.error ?? `Preset save failed (${response.status})`);
    }
    state.auditCritiquePresets.presets = normalizeAuditCritiquePresets(data.presets);
    state.auditCritiquePresets.updatedAt = data.updatedAt || '';
    renderAuditPresets();
    renderNoteFeedbackPresets();
    updateAuditPresetsStatus('Critique presets saved.', 'success');
    return true;
  } catch (error) {
    updateAuditPresetsStatus(error.message || 'Preset save failed.', 'error');
    return false;
  } finally {
    state.auditCritiquePresets.saving = false;
    if (auditPresetsSaveButton) {
      auditPresetsSaveButton.disabled = false;
    }
  }
}

function updateAuditPresetsStatus(message, tone = '') {
  if (!auditPresetsStatusEl) {
    return;
  }
  auditPresetsStatusEl.textContent = message || '';
  auditPresetsStatusEl.classList.toggle('is-error', tone === 'error');
  auditPresetsStatusEl.classList.toggle('is-success', tone === 'success');
  auditPresetsStatusEl.classList.toggle('is-warning', tone === 'warning');
}

async function saveCurrentFeedbackEntry(entry, draft) {
  const siteId = entry?.siteId || '';
  const catalogEntry = findEntryBySiteId(siteId) || entry;
  if (!siteId || !catalogEntry) {
    updateAuditStatusMessage('Pick a feedback item first.', 'warning');
    return false;
  }

  const nextNote = normalizeSiteNoteText(auditNoteEl?.value ?? draft.note ?? '');
  const rankValue = auditRankEl?.value ?? draft.manualRank ?? normalizeManualRank(catalogEntry.manualRank);
  const parsedRank = Number.parseInt(String(rankValue).trim(), 10);
  if (!Number.isFinite(parsedRank)) {
    updateAuditStatusMessage('Action rank must be an integer.', 'warning');
    return false;
  }

  const noteDirty = nextNote !== normalizeSiteNoteText(getOperatorNote(catalogEntry));
  const rankDirty = parsedRank !== normalizeManualRank(catalogEntry.manualRank);
  const shouldSaveNote = true;
  if (!shouldSaveNote && !rankDirty) {
    updateAuditStatusMessage('No feedback changes to save.', 'info');
    return false;
  }

  const operatorKey = resolveOperatorKeyForProtectedAction({
    label: 'Saving feedback',
    type: PROTECTED_ACTION_NOTE,
    siteId,
    note: nextNote,
    value: parsedRank,
  });
  if (!operatorKey) {
    updateAuditStatusMessage('Open Settings and paste the operator key once to save feedback.', 'warning');
    return false;
  }

  state.auditDeck.savingSiteId = siteId;
  updateAuditStatusMessage(`Saving feedback for ${siteId}...`, 'info');
  renderAuditView();

  try {
    if (shouldSaveNote) {
      const response = await fetch(`${state.apiBaseUrl}/api/catalog/note/${encodeURIComponent(siteId)}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-operator-key': operatorKey,
        },
        body: JSON.stringify({
          operatorNote: nextNote,
          operatorNoteAttachments: normalizeFeedbackAttachments(draft.attachments),
          source: location.hostname,
        }),
      });
      const data = await readJsonResponse(response);
      if (!response.ok) {
        throw new Error(data.error ?? `Note save failed (${response.status})`);
      }
      applyOperatorNoteToState(
        siteId,
        data.operatorNote || nextNote,
        data.operatorNoteUpdatedAt || null,
        data.operatorNoteAttachments || draft.attachments || [],
      );
    }

    if (rankDirty) {
      const response = await fetch(`${state.apiBaseUrl}/api/catalog/rank/${encodeURIComponent(siteId)}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-operator-key': operatorKey,
        },
        body: JSON.stringify({ value: parsedRank }),
      });
      const data = await readJsonResponse(response);
      if (!response.ok) {
        throw new Error(data.error ?? `Rank update failed (${response.status})`);
      }
      applyManualRankToState(siteId, data.manualRank, data.manualRankUpdatedAt || null);
    }

    state.auditDeck.drafts[siteId] = {
      ...draft,
      note: nextNote,
      manualRank: String(parsedRank),
      attachments: normalizeFeedbackAttachments(draft.attachments),
    };
    updateAuditStatusMessage(`Saved feedback for ${siteId}.`, 'success');
    render();
    return true;
  } catch (error) {
    updateAuditStatusMessage(error.message || `Could not save feedback for ${siteId}.`, 'error');
    return false;
  } finally {
    state.auditDeck.savingSiteId = '';
    render();
  }
}

async function saveCurrentAuditReview() {
  const entry = getCurrentAuditEntry();
  if (!entry?.siteId) {
    updateAuditStatusMessage('Pick a site first.', 'warning');
    return false;
  }
  if (!state.apiBaseUrl) {
    updateAuditStatusMessage(COMPOSER_UNAVAILABLE_MESSAGE, 'error');
    return false;
  }
  const draft = hydrateAuditDraftForCurrentEntry();
  if (state.auditDeck.filterMode !== AUDIT_FILTER_REVIEW) {
    return saveCurrentFeedbackEntry(entry, draft);
  }
  const operatorKey = resolveOperatorKeyForProtectedAction({
    label: 'Saving site feedback',
    type: PROTECTED_ACTION_NOTE,
    siteId: entry.siteId,
  });
  if (!operatorKey) {
    updateAuditStatusMessage('Open Settings and paste the operator key once to save feedback.', 'warning');
    return false;
  }

  state.auditDeck.savingSiteId = entry.siteId;
  updateAuditStatusMessage(`Saving feedback for ${entry.siteId}...`, 'info');
  renderAuditView();

  try {
    const response = await fetch(`${state.apiBaseUrl}/api/audit/review/${encodeURIComponent(entry.siteId)}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-operator-key': operatorKey,
      },
      body: JSON.stringify({
        status: 'needs-work',
        note: normalizeSiteNoteText(draft.note || ''),
        quality: draft.quality,
        source: location.hostname,
      }),
    });
    const data = await readJsonResponse(response);
    if (!response.ok) {
      throw new Error(data.error ?? `Feedback save failed (${response.status})`);
    }
    entry.audit = {
      ...(entry.audit || {}),
      ...(data.review || {}),
    };
    updateAuditStatusMessage(`Saved feedback for ${entry.siteId}.`, 'success');
    await loadAuditDeck({ pageIndex: state.auditDeck.pageIndex });
    return true;
  } catch (error) {
    updateAuditStatusMessage(error.message || 'Feedback save failed.', 'error');
    renderAuditView();
    return false;
  } finally {
    state.auditDeck.savingSiteId = '';
    renderAuditView();
  }
}

async function resetCurrentAuditFeedback() {
  const entry = getCurrentAuditEntry();
  if (!entry?.siteId) {
    updateAuditStatusMessage('Pick a site first.', 'warning');
    return false;
  }
  const current = hydrateAuditDraftForCurrentEntry();
  if (!auditDraftHasFeedbackContent(current)) {
    updateAuditStatusMessage('No feedback to clear.', 'info');
    return false;
  }
  state.auditDeck.drafts[entry.siteId] = {
    ...current,
    note: '',
    manualRank: '0',
    attachments: [],
  };
  if (auditNoteEl) {
    auditNoteEl.value = '';
  }
  if (auditRankEl) {
    auditRankEl.value = '0';
  }
  renderAuditView();
  updateAuditStatusMessage('Cleared feedback. Save feedback to persist.', 'info');
  return true;
}

function normalizeAuditStatus(value) {
  const normalized = normalizeCatalogToken(value);
  if (normalized === 'needswork' || normalized === 'needs-review' || normalized === 'needsreview') {
    return 'needs-work';
  }
  return normalized || 'needs-work';
}

function humanizeAuditReason(value) {
  const normalized = normalizeCatalogToken(value);
  if (normalized === 'note-feedback') return 'note feedback';
  if (normalized === 'needs-work') return 'needs work';
  return normalized ? humanizeToken(normalized) : 'review';
}

function clampNumber(value, min, max) {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed)) {
    return min;
  }
  return Math.max(min, Math.min(parsed, max));
}

function buildNotesContextLabel(noteCount) {
  const parts = [];
  const rawSearch = searchEl?.value?.trim() || '';
  const filterLabels = getCatalogFilterLabels();

  if (filterLabels.length > 0) {
    parts.push(`tags ${filterLabels.join(', ')}`);
  }
  if (rawSearch) {
    parts.push(`search "${rawSearch}"`);
  }

  if (noteCount === 0) {
    return parts.length === 0
      ? 'No saved notes are visible right now.'
      : `No saved notes matched ${parts.join(' and ')}.`;
  }

  if (parts.length === 0) {
    return 'Shows saved notes for the current result set. Copy JSON or CSV when you want to hand the whole packet to Codex.';
  }

  return `Shows saved notes for ${parts.join(' and ')}. Copy JSON or CSV when you want to hand the whole packet to Codex.`;
}

function buildNotesExportPayload(options = {}) {
  const activeCatalogTagIds = getActiveCatalogTagIds();
  const availableCatalogTags = getAvailableCatalogFilterEntries();
  const sourceEntries = Array.isArray(options.entries) ? options.entries : getVisibleNotedEntries();
  const notes = sourceEntries.map((entry) => ({
    siteId: entry.siteId,
    host: entry.host || null,
    url: entry.url || null,
    displayName: buildDisplayTitle(entry) || entry.siteId,
    manualRank: normalizeManualRank(entry.manualRank),
    manualRankUpdatedAt: entry.manualRankUpdatedAt || null,
    operatorNote: getOperatorNote(entry),
    operatorNoteAttachments: normalizeFeedbackAttachments(entry.operatorNoteAttachments),
    operatorNoteUpdatedAt: entry.operatorNoteUpdatedAt || null,
    description: entry.description || null,
    tags: Array.isArray(entry.tags) ? [...entry.tags] : [],
    family: entry.family?.id ? {
      id: entry.family.id,
      label: entry.family.label || null,
      count: Number.isFinite(entry.family.count) ? entry.family.count : null,
      memberOrder: Number.isFinite(entry.family.memberOrder) ? entry.family.memberOrder : null,
      leadSiteId: entry.family.leadSiteId || null,
    } : null,
  }));
  return {
    notes,
    summary: {
      noteCount: notes.length,
      mainSiteId: state.summary?.mainSiteId || null,
      mainSiteHost: state.summary?.mainSiteHost || null,
      mainSiteUrl: state.summary?.mainSiteUrl || null,
      filter: getLegacyCatalogFilterToken(activeCatalogTagIds, availableCatalogTags),
      filters: activeCatalogTagIds,
      search: searchEl?.value?.trim() || '',
    },
  };
}

function buildNotesExportCsv(options = {}) {
  const payload = buildNotesExportPayload(options);
  if (payload.notes.length === 0) {
    return '';
  }
  const rows = [
    ['siteId', 'host', 'url', 'displayName', 'manualRank', 'manualRankUpdatedAt', 'operatorNoteUpdatedAt', 'operatorNoteAttachmentUrls', 'tags', 'description', 'operatorNote'],
    ...payload.notes.map((entry) => [
      entry.siteId,
      entry.host || '',
      entry.url || '',
      entry.displayName || '',
      String(entry.manualRank ?? 0),
      entry.manualRankUpdatedAt || '',
      entry.operatorNoteUpdatedAt || '',
      (entry.operatorNoteAttachments || []).map((attachment) => attachment.url).filter(Boolean).join('|'),
      (entry.tags || []).join('|'),
      entry.description || '',
      entry.operatorNote || '',
    ]),
  ];
  return rows
    .map((row) => row.map((value) => {
      const text = String(value ?? '');
      return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
    }).join(','))
    .join('\n');
}

function hydrateNotesPreviews(entries) {
  if (!notesListEl) {
    return;
  }

  const entryMap = new Map(entries.map((entry) => [entry.siteId, entry]));
  notesListEl.querySelectorAll('img[data-note-preview-site-id]').forEach((img) => {
    if (!(img instanceof HTMLImageElement)) {
      return;
    }

    const siteId = img.dataset.notePreviewSiteId || '';
    const entry = entryMap.get(siteId) || findEntryBySiteId(siteId);
    if (!entry) {
      applyPreviewFallback(img);
      return;
    }

    assignPreviewImage(img, getPreviewUrl(siteId), `${buildDisplayTitle(entry) || siteId} preview`, entry);
  });
}

function buildNotesCard(entry) {
  const displayEntry = resolveDisplayEntryForSite(entry.siteId) || entry;
  const note = getOperatorNote(entry);
  const displayTitle = buildDisplayTitle(displayEntry) || entry.siteId;
  const updatedAt = entry.operatorNoteUpdatedAt ? formatTimestamp(entry.operatorNoteUpdatedAt) : 'Unknown time';
  const editable = canMutateEntry(entry);
  const currentRank = normalizeManualRank(entry.manualRank);
  const draftNote = Object.prototype.hasOwnProperty.call(state.noteDraftTexts, entry.siteId)
    ? String(state.noteDraftTexts[entry.siteId] ?? '')
    : note;
  const draftValue = Object.prototype.hasOwnProperty.call(state.noteDraftRanks, entry.siteId)
    ? state.noteDraftRanks[entry.siteId]
    : String(currentRank);
  const parsedDraft = Number.parseInt(String(draftValue || '').trim(), 10);
  const noteDirty = normalizeSiteNoteText(draftNote) !== normalizeSiteNoteText(note);
  const rankDirty = String(draftValue).trim() !== String(currentRank);
  const dirty = noteDirty || rankDirty;
  const busy = state.notesBulkClearBusy || isSiteMutationBusy(entry.siteId);
  const canDeleteNote = editable && Boolean(state.apiBaseUrl) && !busy && Boolean(normalizeSiteNoteText(note));
  const deleteTitle = busy
    ? `Working on ${entry.siteId}…`
    : !editable
      ? 'Imported CSV rows stay read-only in the launchpad.'
      : !state.apiBaseUrl
        ? COMPOSER_UNAVAILABLE_MESSAGE
        : !normalizeSiteNoteText(note)
          ? 'No saved note yet.'
          : `Delete note for ${entry.siteId}`;
  const saveTitle = !editable
    ? 'Imported CSV rows stay read-only in the launchpad.'
    : !state.apiBaseUrl
      ? COMPOSER_UNAVAILABLE_MESSAGE
      : busy
        ? `Saving changes for ${entry.siteId}…`
        : !dirty
          ? 'No note or rank changes yet.'
          : !Number.isFinite(parsedDraft)
            ? 'Rank must be an integer.'
            : `Save note changes for ${entry.siteId}`;
  const metaParts = [
    entry.host || '',
    hasMultipleVersions(displayEntry) ? buildVersionSummary(displayEntry) : '',
    entry.operatorNoteUpdatedAt ? `Updated ${updatedAt}` : '',
  ].filter(Boolean);
  return `
    <article class="notes-card" data-notes-site-id="${escapeHtml(entry.siteId)}">
      <div class="notes-card__header">
        <div class="notes-card__copy">
          <a class="notes-card__title" href="${escapeHtml(entry.url || '#')}" target="_blank" rel="noreferrer">${escapeHtml(displayTitle)}</a>
          <div class="notes-card__meta">${escapeHtml(metaParts.join(' • '))}</div>
        </div>
        <div class="notes-card__actions">
          <label class="notes-card__rank-field">
            <span>Rank</span>
            <input
              type="number"
              inputmode="numeric"
              class="notes-card__rank-input"
              data-note-rank-input="${escapeHtml(entry.siteId)}"
              value="${escapeHtml(String(draftValue))}"
              ${busy || !editable ? 'disabled' : ''}
            >
          </label>
          <button
            type="button"
            class="secondary notes-card__save"
            data-note-action="save"
            data-site-id="${escapeHtml(entry.siteId)}"
            title="${escapeHtml(saveTitle)}"
            ${busy || !editable || !Number.isFinite(parsedDraft) || !dirty || !state.apiBaseUrl ? 'disabled' : ''}
          >
            <i class="ti ti-device-floppy"></i>
            <span>${busy ? 'Working…' : 'Save'}</span>
          </button>
          <button
            type="button"
            class="secondary notes-card__delete-note"
            data-note-action="delete-note"
            data-site-id="${escapeHtml(entry.siteId)}"
            title="${escapeHtml(deleteTitle)}"
            ${canDeleteNote ? '' : 'disabled'}
          >
            <i class="ti ti-trash"></i>
            <span>${busy ? 'Working…' : 'Delete note'}</span>
          </button>
        </div>
      </div>
      <div class="notes-card__layout">
        <button
          type="button"
          class="notes-card__preview"
          data-note-action="preview"
          data-site-id="${escapeHtml(entry.siteId)}"
          aria-label="Preview ${escapeHtml(displayTitle)}"
          ${entry.url ? '' : 'disabled'}
        >
          <img
            class="notes-card__preview-img"
            data-note-preview-site-id="${escapeHtml(entry.siteId)}"
            alt="${escapeHtml(displayTitle)} preview"
            loading="lazy"
          >
          <span class="notes-card__preview-badge">
            <i class="ti ti-browser"></i>
            <span>Preview</span>
          </span>
        </button>
        <textarea
          class="note-modal__textarea notes-card__body notes-card__textarea"
          data-note-text-input="${escapeHtml(entry.siteId)}"
          spellcheck="true"
          maxlength="4000"
          rows="6"
          placeholder="Say what should change here."
          ${busy ? 'disabled' : !editable ? 'readonly' : ''}
        >${escapeHtml(draftNote)}</textarea>
      </div>
    </article>
  `;
}

function normalizeSiteNoteText(note) {
  return String(note ?? '')
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .trim();
}

function getNotesCardDraftText(siteId, entry = findEntryBySiteId(siteId)) {
  if (Object.prototype.hasOwnProperty.call(state.noteDraftTexts, siteId)) {
    return String(state.noteDraftTexts[siteId] ?? '');
  }
  return getOperatorNote(entry);
}

function getNotesCardDraftRank(siteId, entry = findEntryBySiteId(siteId)) {
  if (Object.prototype.hasOwnProperty.call(state.noteDraftRanks, siteId)) {
    return String(state.noteDraftRanks[siteId] ?? '');
  }
  return String(normalizeManualRank(entry?.manualRank));
}

function isNotesCardNoteDirty(siteId, entry = findEntryBySiteId(siteId)) {
  return normalizeSiteNoteText(getNotesCardDraftText(siteId, entry)) !== normalizeSiteNoteText(getOperatorNote(entry));
}

function isNotesCardRankDirty(siteId, entry = findEntryBySiteId(siteId)) {
  return String(getNotesCardDraftRank(siteId, entry)).trim() !== String(normalizeManualRank(entry?.manualRank));
}

function syncNotesCardControls(siteId) {
  if (!notesListEl || !siteId) {
    return;
  }

  const card = notesListEl.querySelector(`[data-notes-site-id="${CSS.escape(siteId)}"]`);
  const entry = findEntryBySiteId(siteId);
  if (!(card instanceof HTMLElement) || !entry) {
    return;
  }

  const editable = canMutateEntry(entry);
  const busy = state.notesBulkClearBusy || isSiteMutationBusy(siteId);
  const noteInput = card.querySelector(`[data-note-text-input="${CSS.escape(siteId)}"]`);
  const rankInput = card.querySelector(`[data-note-rank-input="${CSS.escape(siteId)}"]`);
  const saveButton = card.querySelector('[data-note-action="save"]');
  const deleteButton = card.querySelector('[data-note-action="delete-note"]');
  const draftRank = getNotesCardDraftRank(siteId, entry);
  const parsedRank = Number.parseInt(String(draftRank).trim(), 10);
  const noteDirty = isNotesCardNoteDirty(siteId, entry);
  const rankDirty = isNotesCardRankDirty(siteId, entry);
  const dirty = noteDirty || rankDirty;
  const hasSavedNote = Boolean(normalizeSiteNoteText(getOperatorNote(entry)));

  if (noteInput instanceof HTMLTextAreaElement) {
    noteInput.disabled = busy;
    noteInput.readOnly = !editable;
  }
  if (rankInput instanceof HTMLInputElement) {
    rankInput.disabled = busy || !editable;
  }
  if (saveButton instanceof HTMLButtonElement) {
    saveButton.disabled = busy || !editable || !state.apiBaseUrl || !dirty || !Number.isFinite(parsedRank);
    saveButton.title = !editable
      ? 'Imported CSV rows stay read-only in the launchpad.'
      : !state.apiBaseUrl
        ? COMPOSER_UNAVAILABLE_MESSAGE
        : busy
          ? `Saving changes for ${siteId}…`
          : !dirty
            ? 'No note or rank changes yet.'
            : !Number.isFinite(parsedRank)
              ? 'Rank must be an integer.'
              : `Save note changes for ${siteId}`;
    const labelEl = saveButton.querySelector('span');
    if (labelEl) {
      labelEl.textContent = busy ? 'Working…' : 'Save';
    }
  }
  if (deleteButton instanceof HTMLButtonElement) {
    deleteButton.disabled = busy || !editable || !state.apiBaseUrl || !hasSavedNote;
    deleteButton.title = busy
      ? `Working on ${siteId}…`
      : !editable
        ? 'Imported CSV rows stay read-only in the launchpad.'
        : !state.apiBaseUrl
          ? COMPOSER_UNAVAILABLE_MESSAGE
          : !hasSavedNote
            ? 'No saved note yet.'
            : `Delete note for ${siteId}`;
    const labelEl = deleteButton.querySelector('span');
    if (labelEl) {
      labelEl.textContent = busy ? 'Working…' : 'Delete note';
    }
  }
}

async function submitNotesCard(siteId) {
  const entry = findEntryBySiteId(siteId);
  if (!entry) {
    return false;
  }

  const noteDirty = isNotesCardNoteDirty(siteId, entry);
  const rankDirty = isNotesCardRankDirty(siteId, entry);
  const draftRank = getNotesCardDraftRank(siteId, entry);
  const parsedRank = Number.parseInt(String(draftRank).trim(), 10);

  if (!noteDirty && !rankDirty) {
    return false;
  }

  if (rankDirty && !Number.isFinite(parsedRank)) {
    window.alert('Rank must be an integer.');
    syncNotesCardControls(siteId);
    return false;
  }

  if (noteDirty) {
    const savedNote = await saveSiteNote(siteId, getNotesCardDraftText(siteId, entry));
    if (!savedNote) {
      syncNotesCardControls(siteId);
      return false;
    }
    delete state.noteDraftTexts[siteId];
  }

  if (rankDirty) {
    const savedRank = await setManualRank(siteId, draftRank);
    if (!savedRank) {
      syncNotesCardControls(siteId);
      return false;
    }
  }

  syncNotesCardControls(siteId);
  return true;
}

async function deleteNotesCardNote(siteId) {
  const entry = findEntryBySiteId(siteId);
  if (!entry || !normalizeSiteNoteText(getOperatorNote(entry))) {
    syncNotesCardControls(siteId);
    return false;
  }

  const deleted = await saveSiteNote(siteId, '');
  if (!deleted) {
    syncNotesCardControls(siteId);
    return false;
  }

  delete state.noteDraftTexts[siteId];
  syncNotesCardControls(siteId);
  return true;
}

function syncNotesModalControls() {
  if (!notesClearVisibleButton) {
    return;
  }

  const visibleCount = getVisibleNotedEntries().length;
  const mutableCount = getVisibleMutableNotedEntries().length;
  const busy = state.notesBulkClearBusy;
  const labelEl = notesClearVisibleButton.querySelector('span');

  notesClearVisibleButton.disabled = busy || mutableCount === 0;
  notesClearVisibleButton.title = visibleCount === 0
    ? 'No saved notes are visible.'
    : mutableCount === 0
      ? 'Visible notes stay read-only in this view.'
      : `Clear ${mutableCount.toLocaleString()} visible saved ${mutableCount === 1 ? 'note' : 'notes'}.`;

  if (labelEl) {
    labelEl.textContent = busy ? 'Clearing…' : 'Clear visible';
  }

  if (busy) {
    notesClearVisibleButton.setAttribute('aria-busy', 'true');
  } else {
    notesClearVisibleButton.removeAttribute('aria-busy');
  }
}

function renderNotesModal() {
  if (!notesSummaryEl || !notesContextEl || !notesListEl) {
    return;
  }

  const notes = getVisibleNotedEntries();
  notesSummaryEl.textContent = notes.length === 1
    ? '1 saved note'
    : `${notes.length.toLocaleString()} saved notes`;
  notesContextEl.textContent = buildNotesContextLabel(notes.length);

  if (notes.length === 0) {
    notesListEl.innerHTML = `
      <div class="endpoints-list__empty">
        <i class="ti ti-notes-off"></i>
        <p>No saved notes match the current search and filter.</p>
      </div>
    `;
    syncNotesModalControls();
    return;
  }

  notesListEl.innerHTML = notes.map(buildNotesCard).join('');
  hydrateNotesPreviews(notes);
  setupLazyPreviews();
  syncNotesModalControls();
}

function openNotesModal() {
  renderNotesModal();
  notesModalEl?.classList.remove('is-hidden');
  setupLazyPreviews();
  const panel = notesModalEl?.querySelector('.notes-modal__panel');
  if (panel instanceof HTMLElement) {
    panel.focus({ preventScroll: true });
  }
}

function closeNotesModal() {
  notesModalEl?.classList.add('is-hidden');
}

async function clearVisibleNotes(options = {}) {
  if (state.notesBulkClearBusy) {
    return false;
  }

  const entries = Array.isArray(options.entries) ? options.entries : getVisibleMutableNotedEntries();
  const flashTarget = options.button || notesClearVisibleButton;
  if (entries.length === 0) {
    flashButton(flashTarget, 'No feedback');
    return false;
  }

  const noun = entries.length === 1 ? 'note' : 'notes';
  if (!window.confirm(`Clear ${entries.length.toLocaleString()} visible saved ${noun}?`)) {
    return false;
  }

  const operatorKey = resolveOperatorKeyForProtectedAction({
    label: `Clearing ${entries.length.toLocaleString()} visible ${noun}`,
    type: PROTECTED_ACTION_NOTE,
    siteId: entries.length === 1 ? entries[0].siteId : '',
    note: '',
  });
  if (!operatorKey) {
    return false;
  }

  let cleared = 0;
  const failed = [];
  state.notesBulkClearBusy = true;
  renderNotesModal();
  renderAuditView();

  try {
    for (const entry of entries) {
      const ok = await saveSiteNote(entry.siteId, '');
      if (ok) {
        cleared += 1;
      } else {
        failed.push(entry.siteId);
      }
    }
  } finally {
    state.notesBulkClearBusy = false;
    renderNotesModal();
    renderAuditView();
  }

  if (failed.length === 0) {
    flashButton(flashTarget, cleared === 1 ? 'Cleared' : `${cleared} cleared`);
    return true;
  }

  window.alert(
    failed.length === entries.length
      ? `Could not clear the visible ${noun}.`
      : `Cleared ${cleared} of ${entries.length} ${noun}. Failed: ${failed.join(', ')}.`
  );
  return false;
}

function getAvailableViewConfigs() {
  const configured = Array.isArray(state.shell?.toolbar?.views) ? state.shell.toolbar.views : [];
  const normalized = configured
    .map((item) => {
      const value = String(item?.value || '').trim();
      if (!value) {
        return null;
      }
      if (value === 'swipe' && !isMobileSwipeViewport()) {
        return null;
      }
      const section = document.getElementById(`${value}-view`);
      if (!section) {
        return null;
      }
      return {
        ...DEFAULT_VIEW_CONFIG[value],
        ...item,
        value,
      };
    })
    .filter(Boolean);

  if (normalized.length > 0) {
    return normalized;
  }

  return Object.values(DEFAULT_VIEW_CONFIG).filter((item) =>
    !(item.value === 'swipe' && !isMobileSwipeViewport())
    && document.getElementById(`${item.value}-view`)
  );
}

function updateCycleViewButton() {
  if (!cycleViewButton) {
    return;
  }

  const views = getAvailableViewConfigs();
  const currentIndex = Math.max(0, views.findIndex((item) => item.value === state.viewMode));
  const current = views[currentIndex] || DEFAULT_VIEW_CONFIG[state.viewMode] || { label: humanizeToken(state.viewMode), icon: 'ti ti-layout-grid', value: state.viewMode };
  const next = views[(currentIndex + 1) % Math.max(views.length, 1)] || current;
  if (cycleViewButton instanceof HTMLSelectElement) {
    cycleViewButton.innerHTML = views.map((view) => `
      <option value="${escapeHtml(view.value || '')}">${escapeHtml(view.label || humanizeToken(view.value || 'view'))}</option>
    `).join('');
    cycleViewButton.value = current.value || '';
    cycleViewButton.disabled = views.length <= 1;
    cycleViewButton.title = 'Choose view';
    cycleViewButton.setAttribute('aria-label', 'Choose view');

    const cycleViewIcon = document.getElementById('cycle-view-icon');
    if (cycleViewIcon) {
      cycleViewIcon.className = current.icon || 'ti ti-layout-grid';
    }
    return;
  }

  cycleViewButton.innerHTML = `
    ${current.icon ? `<i class="${escapeHtml(current.icon)}"></i>` : ''}
    <span>${escapeHtml(current.label || humanizeToken(current.value || 'view'))}</span>
  `;
  cycleViewButton.disabled = views.length <= 1;
  cycleViewButton.title = views.length <= 1
    ? `${current.label || humanizeToken(current.value || 'view')} is the only available view`
    : `Switch view to ${next.label || humanizeToken(next.value || 'view')}`;
  cycleViewButton.setAttribute('aria-label', cycleViewButton.title);
}

function setViewMode(nextView) {
  nextView = normalizeUrlViewMode(nextView) || nextView;
  if (nextView === 'swipe' && !isMobileSwipeViewport()) {
    nextView = 'table';
  }
  if (!nextView || nextView === state.viewMode) {
    syncViewButtons();
    return;
  }

  if (nextView === 'slideshow' && document.activeElement instanceof HTMLElement) {
    document.activeElement.blur();
  }

  if (nextView === 'slideshow') {
    const currentEntry = getCurrentContextEntry();
    state.slideshowCurrentSiteId = currentEntry?.siteId || '';
  }

  state.viewMode = nextView;
  if (usePersistentViewState()) {
    localStorage.setItem(VIEW_STORAGE_KEY, state.viewMode);
  }
  syncViewButtons();
  render();

  if (nextView === 'slideshow') {
    requestBrowserFullscreen();
  }

  if (nextView === 'slideshow' && slideshowStageEl) {
    window.requestAnimationFrame(() => {
      if (state.viewMode === 'slideshow' && slideshowStageEl && fullscreenModalEl?.classList.contains('is-hidden')) {
        slideshowStageEl.focus({ preventScroll: true });
      }
    });
  }

  if (nextView === 'audit') {
    loadAuditCritiquePresets();
    if (state.auditDeck.filterMode === AUDIT_FILTER_REVIEW) {
      ensureAuditDeckLoaded();
    } else {
      renderAuditView();
    }
  }
}

function requestBrowserFullscreen() {
  const root = document.documentElement;
  if (!(root instanceof HTMLElement) || document.fullscreenElement) {
    return;
  }

  const requestFullscreen = root.requestFullscreen;
  if (typeof requestFullscreen !== 'function') {
    return;
  }

  try {
    const result = requestFullscreen.call(root, { navigationUI: 'hide' });
    if (result && typeof result.catch === 'function') {
      result.catch(() => {});
    }
  } catch {
    // Ignore browsers that reject fullscreen outside a trusted gesture.
  }
}

function cycleViewMode() {
  const views = getAvailableViewConfigs();
  if (views.length <= 1) {
    syncViewButtons();
    return;
  }

  const currentIndex = views.findIndex((item) => item.value === state.viewMode);
  const nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % views.length;
  setViewMode(views[nextIndex].value);
}

function renderRows(entries) {
  tableBodyEl.innerHTML = '';

  if (entries.length === 0) {
    state.activeTableSiteId = null;
    tableBodyEl.innerHTML = '<tr><td colspan="7" class="workspace-table__empty-cell">Nothing matches the current search and filters.</td></tr>';
    updateTableFooter(0, 0, 0, 0, 0, 0);
    return;
  }

  const pageCount = getTablePageCount();
  const pageIndex = Math.min(state.tablePage, Math.max(pageCount - 1, 0));
  const effectivePageSize = getEffectiveTablePageSize(entries.length);
  const isMobileList = isMobileSwipeViewport();
  const startIndex = isMobileList ? 0 : pageIndex * effectivePageSize;
  const pageEntries = isMobileList
    ? entries.slice(0, getMobileLoadedLimit('table', entries.length))
    : entries.slice(startIndex, startIndex + effectivePageSize);
  const bodyFragment = document.createDocumentFragment();

  ensureActiveTableSite(pageEntries);

  for (const entry of pageEntries) {
    const fragment = rowTemplate.content.cloneNode(true);
    const row = fragment.querySelector('.site-row');
    const typeIcon = fragment.querySelector('.site-type-icon');
    const previewShell = fragment.querySelector('.preview-shell');
    const previewImgs = Array.from(fragment.querySelectorAll('.site-preview-img'));
    const title = fragment.querySelector('.site-cell__title');
    const versionShell = fragment.querySelector('.site-cell__version-switcher');
    const versionLabel = fragment.querySelector('.site-cell__version-label');
    const versionPrevButton = fragment.querySelector('.site-cell__version-prev');
    const versionNextButton = fragment.querySelector('.site-cell__version-next');
    const host = fragment.querySelector('.site-cell__host');
    const family = fragment.querySelector('.site-cell__family');
    const publicMarker = fragment.querySelector('.site-cell__public');
    const rankValue = fragment.querySelector('.site-cell__rank-value');
    const rankDownButton = fragment.querySelector('.site-cell__rank-down');
    const rankUpButton = fragment.querySelector('.site-cell__rank-up');
    const rankEditorButton = fragment.querySelector('.site-cell__status-shell');
    const editButton = fragment.querySelector('.site-cell__edit');
    const mainSiteButton = fragment.querySelector('.site-cell__main-site');
    const refreshPreviewButton = fragment.querySelector('.site-cell__refresh-preview');
    const tags = fragment.querySelector('.site-cell__tags');
    const modified = fragment.querySelector('.site-cell__modified');
    const summary = fragment.querySelector('.summary-text');

    row.dataset.siteId = entry.siteId;
    syncBulkRefreshMetadata(row, entry);
    row.tabIndex = entry.siteId === state.activeTableSiteId ? 0 : -1;
    row.classList.toggle('is-active', entry.siteId === state.activeTableSiteId);
    row.classList.toggle('is-selected', state.selected.has(entry.siteId));
    row.setAttribute('aria-selected', state.selected.has(entry.siteId) ? 'true' : 'false');
    row.addEventListener('focusin', () => {
      setActiveTableSiteId(entry.siteId);
    });
    row.addEventListener('click', (event) => {
      const statusIndicator = event.target instanceof HTMLElement
        ? event.target.closest('.site-cell__status-shell')
        : null;
      if (statusIndicator) {
        return;
      }
      const interactiveTarget = event.target instanceof HTMLElement
        ? event.target.closest('a, button, input, label, textarea, select')
        : null;
      const mobileTitleLink = event.target instanceof HTMLElement
        ? event.target.closest('.site-cell__title')
        : null;
      if (isMobileSwipeViewport()) {
        if (interactiveTarget && !mobileTitleLink) {
          return;
        }
        event.preventDefault();
        event.stopPropagation();
        openFullscreenPreview(entry);
        return;
      }
      if (interactiveTarget) {
        return;
      }
      updateSelection(entry.siteId, !state.selected.has(entry.siteId), event.shiftKey);
    });
    row.addEventListener('keydown', (event) => {
      if (isMobileSwipeViewport() && event.target === event.currentTarget && (event.key === 'Enter' || event.key === ' ' || event.key === 'Spacebar')) {
        event.preventDefault();
        openFullscreenPreview(entry);
        return;
      }
      handleTableRowKeydown(event, entry.siteId);
    });
    wireRowMergeDrag(row, entry);
    wireCatalogTagDropTarget(row, entry);

    wirePreviewButton(previewShell, previewImgs, entry);
    previewShell.classList.toggle('is-single-preview', !hasMultipleVersions(entry) && getPreviewScreenshots(entry.siteId).length <= 1);

    typeIcon.className = `site-type-icon ${buildTypeDescriptor(entry).icon}`;
    typeIcon.title = buildTypeDescriptor(entry).tooltip || '';
    title.textContent = buildDisplayTitle(entry);
    renderPackageBadge(title, entry);
    host.textContent = entry.host ?? 'No public host';
    wireVersionSwitcher({
      shell: versionShell,
      labelEl: versionLabel,
      prevButton: versionPrevButton,
      nextButton: versionNextButton,
    }, entry);
    renderFamilyLine(family, entry);
    renderTablePublicMarker(publicMarker, entry);
    wireRankControl({ valueEl: rankValue, downButton: rankDownButton, upButton: rankUpButton }, entry);
    wireRankModalControl(rankEditorButton, entry);
    wireEditControl(editButton, entry);
    wireMainSiteControl(mainSiteButton, entry);
    wirePreviewRefreshControl(refreshPreviewButton, entry);
    renderTableTags(tags, entry);
    renderTableModified(modified, entry);
    const summaryDescription = document.createElement('span');
    summaryDescription.className = 'summary-text__description';
    summaryDescription.textContent = buildSummary(entry);
    summary.replaceChildren(summaryDescription);

    if (entry.url) {
      title.href = entry.url;
    } else {
      title.removeAttribute('href');
    }

    bodyFragment.appendChild(fragment);
  }

  tableBodyEl.appendChild(bodyFragment);

  updateTableFooter(
    isMobileList ? 1 : pageIndex + 1,
    isMobileList ? 1 : pageCount,
    entries.length,
    countRepresentedSites(entries),
    startIndex + 1,
    startIndex + pageEntries.length,
  );
}

function scheduleDenseListWindowRender() {
  if (!listScrollEl || !listViewportEl || state.viewMode !== 'list') {
    return;
  }

  if (denseListRenderFrame) {
    window.cancelAnimationFrame(denseListRenderFrame);
  }

  denseListRenderFrame = window.requestAnimationFrame(() => {
    denseListRenderFrame = 0;
    renderDenseListWindow(state.visibleEntries);
  });
}

function getDenseListRowHeight() {
  return window.innerWidth <= 860 ? DENSE_LIST_ROW_HEIGHT_NARROW : DENSE_LIST_ROW_HEIGHT;
}

function renderDenseListView(entries) {
  if (!listScrollEl || !listViewportEl || !listSpacerEl || !listEmptyEl || !listSummaryEl) {
    return;
  }

  const familyCount = entries.length;
  const siteCount = countRepresentedSites(entries);
  const rowHeight = getDenseListRowHeight();
  listSummaryEl.textContent = familyCount === 0
    ? 'No rows'
    : `${familyCount.toLocaleString()} groups / ${siteCount.toLocaleString()} sites in one scrollable list`;

  if (familyCount === 0) {
    listEmptyEl.classList.remove('is-hidden');
    listSpacerEl.style.height = '0px';
    listViewportEl.style.transform = 'translateY(0px)';
    listViewportEl.replaceChildren();
    state.listScrollTop = 0;
    return;
  }

  listEmptyEl.classList.add('is-hidden');
  listSpacerEl.style.height = `${familyCount * rowHeight}px`;

  const viewportHeight = Math.max(listScrollEl.clientHeight, rowHeight);
  const maxScrollTop = Math.max(0, (familyCount * rowHeight) - viewportHeight);
  const targetScrollTop = Math.min(state.listScrollTop, maxScrollTop);
  if (Math.abs(listScrollEl.scrollTop - targetScrollTop) > 1) {
    listScrollEl.scrollTop = targetScrollTop;
  }
  state.listScrollTop = targetScrollTop;

  renderDenseListWindow(entries);
}

function renderDenseListWindow(entries) {
  if (!listScrollEl || !listViewportEl || !listSpacerEl || state.viewMode !== 'list') {
    return;
  }

  const rowHeight = getDenseListRowHeight();
  if (entries.length === 0) {
    listViewportEl.style.transform = 'translateY(0px)';
    listViewportEl.replaceChildren();
    return;
  }

  const viewportHeight = Math.max(listScrollEl.clientHeight, rowHeight);
  const maxScrollTop = Math.max(0, (entries.length * rowHeight) - viewportHeight);
  const scrollTop = Math.min(state.listScrollTop, maxScrollTop);
  const startIndex = Math.max(0, Math.floor(scrollTop / rowHeight) - DENSE_LIST_OVERSCAN);
  const visibleCount = Math.max(1, Math.ceil(viewportHeight / rowHeight) + (DENSE_LIST_OVERSCAN * 2));
  const endIndex = Math.min(entries.length, startIndex + visibleCount);
  const fragment = document.createDocumentFragment();

  listSpacerEl.style.height = `${entries.length * rowHeight}px`;
  listViewportEl.style.transform = `translateY(${startIndex * rowHeight}px)`;

  for (let index = startIndex; index < endIndex; index += 1) {
    fragment.appendChild(buildDenseListRow(entries[index]));
  }

  listViewportEl.replaceChildren(fragment);
}

function buildDenseListRow(entry) {
  const fragment = denseListRowTemplate.content.cloneNode(true);
  const row = fragment.querySelector('.dense-list-row');
  const iconButton = fragment.querySelector('.dense-list-row__icon-button');
  const typeIcon = fragment.querySelector('.dense-list-row__type-icon');
  const title = fragment.querySelector('.dense-list-row__title');
  const score = fragment.querySelector('.dense-list-row__score');
  const summary = fragment.querySelector('.dense-list-row__summary');

  row.dataset.siteId = entry.siteId;
  wireRowMergeDrag(row, entry);
  wireCatalogTagDropTarget(row, entry);

  const type = buildTypeDescriptor(entry);
  if (iconButton instanceof HTMLElement) {
    const staticIndicator = document.createElement('div');
    staticIndicator.className = `${iconButton.className} is-static`;
    while (iconButton.firstChild) {
      staticIndicator.appendChild(iconButton.firstChild);
    }
    iconButton.replaceWith(staticIndicator);
  }
  typeIcon.className = `site-type-icon dense-list-row__type-icon ${type.icon}`;
  typeIcon.title = type.tooltip || '';

  title.textContent = buildDisplayTitle(entry);
  title.title = entry.host || buildVersionSummary(entry) || entry.siteId;
  score.textContent = String(normalizeManualRank(entry.manualRank));
  summary.textContent = buildSummary(entry) || 'No summary yet.';

  return row;
}

function renderJsonView() {
  if (!jsonSummaryEl || !jsonContentEl) {
    return;
  }

  const payload = buildRawJsonViewPayload();
  const text = JSON.stringify(payload, null, 2);
  const sourceLabel = state.catalogMode === 'csv' ? 'CSV feed' : state.liveCatalog ? 'live catalog' : 'catalog';
  jsonSummaryEl.textContent = `${payload.meta.siteCount.toLocaleString()} sites / ${payload.meta.groupCount.toLocaleString()} groups from ${sourceLabel}`;
  if (state.jsonViewMode === JSON_VIEW_MODE_RAW) {
    renderRawJsonLines(text);
  } else {
    renderJsonTree(payload, text);
  }
  syncJsonViewControls();
}

function syncJsonViewControls() {
  if (!jsonContentEl) {
    return;
  }

  const rawModeActive = state.jsonViewMode === JSON_VIEW_MODE_RAW;
  jsonContentEl.classList.toggle('is-tree', !rawModeActive);
  jsonContentEl.classList.toggle('is-wrapped', rawModeActive && state.jsonWrap);
  jsonContentEl.setAttribute('aria-label', rawModeActive ? 'Raw JSON with line numbers' : 'Collapsible JSON tree');

  jsonModeButtons.forEach((button) => {
    const active = button.dataset.jsonMode === state.jsonViewMode;
    button.classList.toggle('is-active', active);
    button.setAttribute('aria-pressed', active ? 'true' : 'false');
  });

  if (jsonWrapToggleButton) {
    jsonWrapToggleButton.hidden = !rawModeActive;
    const span = jsonWrapToggleButton.querySelector('span');
    if (span) {
      span.textContent = state.jsonWrap ? 'Wrap on' : 'Wrap off';
    }
    jsonWrapToggleButton.classList.toggle('is-active', rawModeActive && state.jsonWrap);
    jsonWrapToggleButton.setAttribute('aria-pressed', rawModeActive && state.jsonWrap ? 'true' : 'false');
    jsonWrapToggleButton.title = rawModeActive
      ? (state.jsonWrap ? 'Disable line wrapping' : 'Enable line wrapping')
      : 'Wrapping is available in RAW mode';
  }
}

function renderRawJsonLines(text) {
  const fragment = document.createDocumentFragment();
  const lines = String(text || '').split('\n');

  lines.forEach((line, index) => {
    const row = document.createElement('div');
    row.className = 'json-line';
    row.dataset.line = String(index + 1);

    const value = document.createElement('span');
    value.className = 'json-line__text';
    value.textContent = line || ' ';

    row.append(value);
    fragment.append(row);
  });

  jsonContentEl.replaceChildren(fragment);
}

function renderJsonTree(payload, fallbackText) {
  jsonContentEl.replaceChildren();

  const JsonFormatter = window.JSONFormatter?.default || window.JSONFormatter;
  if (typeof JsonFormatter !== 'function') {
    console.warn('[launchpad] JSON tree library missing; falling back to raw mode.');
    renderRawJsonLines(fallbackText);
    return;
  }

  const formatter = new JsonFormatter(payload, 1, {
    animateOpen: false,
    animateClose: false,
    hoverPreviewEnabled: true,
    hoverPreviewArrayCount: 8,
    hoverPreviewFieldCount: 4,
  });
  const tree = formatter.render();
  tree.classList.add('launchpad-json-tree');
  jsonContentEl.append(tree);
}

function buildRawJsonViewPayload() {
  const activeCatalogTagIds = getActiveCatalogTagIds();
  const availableCatalogTags = getAvailableCatalogFilterEntries();
  const rawEntryMap = new Map(state.rawEntries.map((entry) => [entry.siteId, entry]));
  const sites = state.visibleSiteEntries.map((entry) => {
    const rawEntry = rawEntryMap.get(entry.siteId);
    return rawEntry ? { ...rawEntry } : buildRawJsonFallback(entry);
  });

  return {
    meta: {
      generatedAt: new Date().toISOString(),
      catalogMode: state.catalogMode,
      liveCatalog: state.liveCatalog,
      sourceUrl: state.catalogSourceUrl || null,
      filter: getLegacyCatalogFilterToken(activeCatalogTagIds, availableCatalogTags),
      filters: activeCatalogTagIds,
      search: searchEl?.value?.trim() || '',
      groupCount: state.visibleEntries.length,
      familyCount: state.visibleEntries.length,
      siteCount: sites.length,
      mainSiteId: state.summary?.mainSiteId || null,
    },
    summary: state.rawSummary ? { ...state.rawSummary } : { ...(state.summary || {}) },
    sites,
  };
}

function buildRawJsonFallback(entry) {
  return {
    siteId: entry.siteId,
    host: entry.host || null,
    url: entry.url || null,
    description: entry.description || null,
    manualRank: entry.manualRank,
    manualRankUpdatedAt: entry.manualRankUpdatedAt || null,
    operatorNote: getOperatorNote(entry) || null,
    operatorNoteUpdatedAt: entry.operatorNoteUpdatedAt || null,
    tags: Array.isArray(entry.tags) ? [...entry.tags] : [],
    family: entry.family ? { ...entry.family } : null,
    publishContext: entry.publishContext ? { ...entry.publishContext } : null,
  };
}

async function copyJsonView() {
  const text = JSON.stringify(buildRawJsonViewPayload(), null, 2);
  try {
    await navigator.clipboard.writeText(text);
    if (jsonCopyButton) {
      flashButton(jsonCopyButton, 'Copied');
    }
  } catch {
    window.prompt('Copy the JSON below:', text);
  }
}

function restoreFeatureMatrixState() {
  const saved = loadStoredFeatureMatrixState();
  state.featureMatrix.saved = saved;
  state.featureMatrix.draft = cloneFeatureMatrixState(saved);
  state.featureMatrix.scope = FEATURE_MATRIX_SCOPE_VISIBLE;
  state.featureMatrix.statusMessage = '';
  state.featureMatrix.statusTone = '';
}

function loadStoredFeatureMatrixState() {
  try {
    const raw = JSON.parse(localStorage.getItem(FEATURE_MATRIX_STORAGE_KEY) || 'null');
    return normalizeFeatureMatrixState(raw);
  } catch {
    return createFeatureMatrixState();
  }
}

function createFeatureMatrixState(assignments = {}, updatedAt = '') {
  return {
    version: 1,
    updatedAt: String(updatedAt || '').trim(),
    assignments,
  };
}

function cloneFeatureMatrixState(matrixState) {
  return normalizeFeatureMatrixState(JSON.parse(JSON.stringify(matrixState || createFeatureMatrixState())));
}

function normalizeFeatureMatrixState(raw) {
  const source = raw && typeof raw === 'object' ? raw : {};
  const facetIds = new Set(FEATURE_MATRIX_FACETS.map((facet) => facet.id));
  const rawAssignments = source.assignments && typeof source.assignments === 'object'
    ? source.assignments
    : {};
  const assignments = {};

  for (const [rawSiteId, rawFacets] of Object.entries(rawAssignments)) {
    const siteId = normalizeCatalogToken(rawSiteId);
    if (!siteId || !rawFacets || typeof rawFacets !== 'object') {
      continue;
    }

    const nextFacets = {};
    for (const [rawFacetId, rawCell] of Object.entries(rawFacets)) {
      const facetId = normalizeCatalogToken(rawFacetId);
      if (!facetIds.has(facetId)) {
        continue;
      }
      const cellState = normalizeFeatureMatrixCellState(
        typeof rawCell === 'string' ? rawCell : rawCell?.state
      );
      if (cellState === FEATURE_MATRIX_STATE_UNKNOWN) {
        continue;
      }
      const evidence = Array.isArray(rawCell?.evidence)
        ? rawCell.evidence.map((item) => String(item || '').trim()).filter(Boolean).slice(0, 4)
        : [];
      const confidence = Number(rawCell?.confidence);
      nextFacets[facetId] = {
        state: cellState,
        updatedAt: String(rawCell?.updatedAt || source.updatedAt || '').trim(),
        source: String(rawCell?.source || '').trim(),
        confidence: Number.isFinite(confidence) ? Math.max(0, Math.min(1, confidence)) : 0,
        evidence,
      };
    }

    if (Object.keys(nextFacets).length > 0) {
      assignments[siteId] = nextFacets;
    }
  }

  return createFeatureMatrixState(assignments, source.updatedAt);
}

function normalizeFeatureMatrixCellState(value) {
  const normalized = normalizeCatalogToken(value);
  return Object.prototype.hasOwnProperty.call(FEATURE_MATRIX_STATES, normalized)
    ? normalized
    : FEATURE_MATRIX_STATE_UNKNOWN;
}

function getFeatureMatrixDraft() {
  if (!state.featureMatrix.draft) {
    restoreFeatureMatrixState();
  }
  return state.featureMatrix.draft;
}

function getFeatureMatrixSaved() {
  if (!state.featureMatrix.saved) {
    restoreFeatureMatrixState();
  }
  return state.featureMatrix.saved;
}

function getFeatureMatrixRows() {
  const source = state.featureMatrix.scope === FEATURE_MATRIX_SCOPE_ALL
    ? buildDisplayEntries(state.entries)
    : state.visibleEntries;
  return (Array.isArray(source) ? source : [])
    .map((entry) => buildFeatureMatrixRowModel(entry))
    .filter((row) => row.siteIds.length > 0)
    .sort(compareFeatureMatrixRows);
}

function buildFeatureMatrixRowModel(entry) {
  const members = getFeatureMatrixRowMembers(entry);
  const visibleMembers = getFeatureMatrixVisibleMembers(entry, members);
  const rowKey = entry?.displayEntryKey || getDisplayGroupKey(entry) || normalizeCatalogToken(entry?.siteId || '');
  const title = buildDisplayTitle(entry) || entry?.siteId || rowKey;
  const lead = visibleMembers[0] || members[0] || entry;
  const siteIds = visibleMembers.map((member) => member.siteId);
  return {
    key: rowKey || siteIds[0] || '',
    title,
    lead,
    members: visibleMembers,
    allMembers: members,
    siteIds,
    siteCount: siteIds.length,
    totalSiteCount: members.length,
    host: lead?.host || (lead?.siteId ? `${lead.siteId}.${BASE_DOMAIN}` : ''),
  };
}

function getFeatureMatrixRowMembers(entry) {
  const members = Array.isArray(entry?.familyMembers) && entry.familyMembers.length > 0
    ? entry.familyMembers
    : [entry];
  return sortFamilyMembers(members)
    .filter((member) => member?.siteId && member.siteId !== ROOT_SITE_ID && member.hasHostedSite !== false);
}

function getFeatureMatrixVisibleMembers(entry, members) {
  if (state.featureMatrix.scope === FEATURE_MATRIX_SCOPE_ALL) {
    return members;
  }
  const visibleIds = new Set(
    (Array.isArray(entry?.visibleFamilyMembers) && entry.visibleFamilyMembers.length > 0
      ? entry.visibleFamilyMembers
      : [entry]
    )
      .map((member) => member?.siteId)
      .filter(Boolean)
  );
  return members.filter((member) => visibleIds.has(member.siteId));
}

function compareFeatureMatrixRows(left, right) {
  const titleDelta = compareNaturalText(left?.title, right?.title);
  if (titleDelta !== 0) {
    return titleDelta;
  }
  return compareNaturalText(left?.key, right?.key);
}

function getFeatureMatrixCellState(siteId, facetId, matrixState = getFeatureMatrixDraft()) {
  const normalizedSiteId = normalizeCatalogToken(siteId);
  const normalizedFacetId = normalizeCatalogToken(facetId);
  return normalizeFeatureMatrixCellState(matrixState?.assignments?.[normalizedSiteId]?.[normalizedFacetId]?.state);
}

function getFeatureMatrixCellMeta(siteId, facetId, matrixState = getFeatureMatrixDraft()) {
  const normalizedSiteId = normalizeCatalogToken(siteId);
  const normalizedFacetId = normalizeCatalogToken(facetId);
  return matrixState?.assignments?.[normalizedSiteId]?.[normalizedFacetId] || null;
}

function assignFeatureMatrixCellState(draft, siteId, facetId, cellState, metadata = {}) {
  const normalizedSiteId = normalizeCatalogToken(siteId);
  const normalizedFacetId = normalizeCatalogToken(facetId);
  const normalizedState = normalizeFeatureMatrixCellState(cellState);
  if (!draft || !normalizedSiteId || !FEATURE_MATRIX_FACETS.some((facet) => facet.id === normalizedFacetId)) {
    return false;
  }

  const previousState = getFeatureMatrixCellState(normalizedSiteId, normalizedFacetId, draft);
  if (previousState === normalizedState) {
    return false;
  }

  if (!draft.assignments[normalizedSiteId]) {
    draft.assignments[normalizedSiteId] = {};
  }

  if (normalizedState === FEATURE_MATRIX_STATE_UNKNOWN) {
    delete draft.assignments[normalizedSiteId][normalizedFacetId];
    if (Object.keys(draft.assignments[normalizedSiteId]).length === 0) {
      delete draft.assignments[normalizedSiteId];
    }
    return true;
  }

  const confidence = Number(metadata.confidence);
  const evidence = Array.isArray(metadata.evidence)
    ? metadata.evidence.map((item) => String(item || '').trim()).filter(Boolean).slice(0, 4)
    : [];
  draft.assignments[normalizedSiteId][normalizedFacetId] = {
    state: normalizedState,
    updatedAt: String(metadata.updatedAt || new Date().toISOString()),
    source: String(metadata.source || '').trim(),
    confidence: Number.isFinite(confidence) ? Math.max(0, Math.min(1, confidence)) : 0,
    evidence,
  };
  return true;
}

function setFeatureMatrixCellState(siteId, facetId, cellState) {
  const draft = getFeatureMatrixDraft();
  const changed = assignFeatureMatrixCellState(draft, siteId, facetId, cellState);
  if (!changed) {
    return;
  }

  draft.updatedAt = new Date().toISOString();
  setFeatureMatrixStatus('Draft changed.', 'warning');
  renderFeatureMatrixView();
}

function setFeatureMatrixRowCellState(rowKey, facetId, cellState) {
  const row = getFeatureMatrixRows().find((candidate) => candidate.key === rowKey);
  if (!row) {
    return;
  }
  const draft = getFeatureMatrixDraft();
  const updatedAt = new Date().toISOString();
  let changed = 0;
  for (const member of row.members) {
    if (assignFeatureMatrixCellState(draft, member.siteId, facetId, cellState, { updatedAt })) {
      changed += 1;
    }
  }
  if (changed === 0) {
    return;
  }

  draft.updatedAt = updatedAt;
  setFeatureMatrixStatus(row.siteCount === 1 ? 'Draft changed.' : `Draft changed for ${changed} sites in ${row.title}.`, 'warning');
  renderFeatureMatrixView();
}

function getNextFeatureMatrixCellState(currentState) {
  const normalized = normalizeFeatureMatrixCellState(currentState);
  const currentIndex = FEATURE_MATRIX_STATE_ORDER.indexOf(normalized);
  return FEATURE_MATRIX_STATE_ORDER[(Math.max(currentIndex, 0) + 1) % FEATURE_MATRIX_STATE_ORDER.length];
}

function setFeatureMatrixScope(value) {
  const nextScope = normalizeCatalogToken(value) === FEATURE_MATRIX_SCOPE_ALL
    ? FEATURE_MATRIX_SCOPE_ALL
    : FEATURE_MATRIX_SCOPE_VISIBLE;
  if (state.featureMatrix.scope === nextScope) {
    renderFeatureMatrixView();
    return;
  }
  state.featureMatrix.scope = nextScope;
  renderFeatureMatrixView();
}

function handleFeatureMatrixClick(event) {
  const button = event.target instanceof Element
    ? event.target.closest('[data-feature-cell]')
    : null;
  if (!(button instanceof HTMLButtonElement)) {
    return;
  }
  const rowKey = button.getAttribute('data-row-key') || '';
  const facetId = button.getAttribute('data-feature-id') || '';
  const nextState = getNextFeatureMatrixCellState(button.getAttribute('data-feature-state') || '');
  setFeatureMatrixRowCellState(rowKey, facetId, nextState);
}

function renderFeatureMatrixView() {
  if (!featureMatrixViewEl || !featureMatrixTableHeadEl || !featureMatrixTableBodyEl) {
    return;
  }

  getFeatureMatrixDraft();
  const rows = getFeatureMatrixRows();
  const changes = getFeatureMatrixChanges(rows);
  const dirty = isFeatureMatrixDirty();
  const scopeLabel = state.featureMatrix.scope === FEATURE_MATRIX_SCOPE_ALL ? 'all groups' : 'visible groups';
  const siteCount = rows.reduce((total, row) => total + row.siteCount, 0);

  if (featureMatrixScopeEl && featureMatrixScopeEl.value !== state.featureMatrix.scope) {
    featureMatrixScopeEl.value = state.featureMatrix.scope;
  }

  featureMatrixTableHeadEl.innerHTML = renderFeatureMatrixHeader(rows);
  featureMatrixTableBodyEl.innerHTML = rows.length
    ? rows.map((entry) => renderFeatureMatrixRow(entry)).join('')
    : '<tr><td class="feature-matrix-empty" colspan="99">No apps match this scope.</td></tr>';

  if (featureMatrixSummaryEl) {
    featureMatrixSummaryEl.textContent = `${rows.length.toLocaleString()} ${scopeLabel} / ${siteCount.toLocaleString()} sites - ${FEATURE_MATRIX_FACETS.length.toLocaleString()} facets - ${changes.length.toLocaleString()} changed`;
  }

  if (featureMatrixStatusEl) {
    const fallback = dirty ? 'Unsaved local changes' : (getFeatureMatrixSaved().updatedAt ? 'Saved locally' : 'No saved decisions yet');
    featureMatrixStatusEl.textContent = state.featureMatrix.statusMessage || fallback;
    featureMatrixStatusEl.dataset.tone = state.featureMatrix.statusTone || (dirty ? 'warning' : 'info');
  }

  if (featureMatrixSaveButton) {
    featureMatrixSaveButton.disabled = !dirty;
  }
  if (featureMatrixResetButton) {
    featureMatrixResetButton.disabled = !dirty;
  }
  if (featureMatrixSeedButton) {
    featureMatrixSeedButton.disabled = rows.length === 0;
  }
  if (featureMatrixSynopsisEl) {
    featureMatrixSynopsisEl.value = buildFeatureMatrixSynopsis(rows, changes);
  }
}

function renderFeatureMatrixHeader(rows) {
  const countsByFacet = getFeatureMatrixCounts(rows);
  const facetHeaders = FEATURE_MATRIX_FACETS.map((facet) => {
    const counts = countsByFacet[facet.id] || {};
    const countParts = [
      `${counts[FEATURE_MATRIX_STATE_ON] || 0} on`,
      `${counts[FEATURE_MATRIX_STATE_OFF] || 0} off`,
      `${counts[FEATURE_MATRIX_STATE_DEFERRED] || 0} later`,
    ];
    if (counts[FEATURE_MATRIX_STATE_MIXED] > 0) {
      countParts.push(`${counts[FEATURE_MATRIX_STATE_MIXED]} mixed`);
    }
    const countLabel = countParts.join(' / ');
    return `
      <th class="feature-matrix-facet" title="${escapeHtml(facet.rule || facet.label)}">
        <span>${escapeHtml(facet.shortLabel || facet.label)}</span>
        <small>${escapeHtml(countLabel)}</small>
      </th>
    `;
  }).join('');
  return `
    <tr>
      <th class="feature-matrix-app">Group</th>
      ${facetHeaders}
    </tr>
  `;
}

function renderFeatureMatrixRow(row) {
  const title = row.title || row.key;
  const memberLabel = row.siteCount === 1
    ? row.host
    : `${row.siteCount.toLocaleString()} sites${row.totalSiteCount > row.siteCount ? ` visible / ${row.totalSiteCount.toLocaleString()} total` : ''}`;
  const cells = FEATURE_MATRIX_FACETS.map((facet) => {
    const cellState = getFeatureMatrixRowCellState(row, facet.id);
    const stateMeta = getFeatureMatrixStateMeta(cellState);
    const evidence = getFeatureMatrixRowEvidence(row, facet.id);
    const evidenceLabel = evidence.length > 0 ? ` Evidence: ${evidence.join(' | ')}` : '';
    return `
      <td class="feature-matrix-cell">
        <button
          type="button"
          class="feature-matrix-state is-${escapeHtml(cellState)}"
          data-feature-cell="true"
          data-row-key="${escapeHtml(row.key)}"
          data-feature-id="${escapeHtml(facet.id)}"
          data-feature-state="${escapeHtml(cellState)}"
          title="${escapeHtml(`${title} / ${facet.label}: ${stateMeta.label}. ${facet.rule || ''}${evidenceLabel}`)}"
          aria-label="${escapeHtml(`${title} ${facet.label} ${stateMeta.label}`)}"
        >
          <i class="${escapeHtml(stateMeta.icon)}" aria-hidden="true"></i>
          <span>${escapeHtml(stateMeta.shortLabel)}</span>
        </button>
      </td>
    `;
  }).join('');

  return `
    <tr data-feature-matrix-row="${escapeHtml(row.key)}">
      <th class="feature-matrix-site" scope="row">
        <a href="${escapeHtml(row.lead?.url || '#')}" target="_blank" rel="noreferrer">${escapeHtml(title)}</a>
        <span>${escapeHtml(memberLabel || row.key)}</span>
      </th>
      ${cells}
    </tr>
  `;
}

function getFeatureMatrixStateMeta(stateId) {
  if (stateId === FEATURE_MATRIX_STATE_MIXED) {
    return { id: FEATURE_MATRIX_STATE_MIXED, label: 'Mixed', shortLabel: 'Mix', icon: 'ti ti-adjustments-horizontal' };
  }
  return FEATURE_MATRIX_STATES[stateId] || FEATURE_MATRIX_STATES[FEATURE_MATRIX_STATE_UNKNOWN];
}

function getFeatureMatrixRowCellState(row, facetId, matrixState = getFeatureMatrixDraft()) {
  const states = new Set(row.members.map((member) => getFeatureMatrixCellState(member.siteId, facetId, matrixState)));
  if (states.size <= 1) {
    return states.values().next().value || FEATURE_MATRIX_STATE_UNKNOWN;
  }
  return FEATURE_MATRIX_STATE_MIXED;
}

function getFeatureMatrixRowEvidence(row, facetId, matrixState = getFeatureMatrixDraft()) {
  const evidence = [];
  for (const member of row.members) {
    const meta = getFeatureMatrixCellMeta(member.siteId, facetId, matrixState);
    if (!meta?.source && (!Array.isArray(meta?.evidence) || meta.evidence.length === 0)) {
      continue;
    }
    const stateLabel = formatFeatureMatrixState(meta.state).toLowerCase();
    const prefix = row.siteCount > 1 ? `${member.siteId}: ${stateLabel}` : stateLabel;
    const detail = Array.isArray(meta.evidence) && meta.evidence.length > 0
      ? meta.evidence.join(', ')
      : meta.source;
    evidence.push(`${prefix} (${detail})`);
    if (evidence.length >= 3) {
      break;
    }
  }
  return evidence;
}

function getFeatureMatrixCounts(rows = getFeatureMatrixRows()) {
  const countsByFacet = Object.fromEntries(FEATURE_MATRIX_FACETS.map((facet) => [facet.id, {
    [FEATURE_MATRIX_STATE_UNKNOWN]: 0,
    [FEATURE_MATRIX_STATE_ON]: 0,
    [FEATURE_MATRIX_STATE_OFF]: 0,
    [FEATURE_MATRIX_STATE_DEFERRED]: 0,
    [FEATURE_MATRIX_STATE_MIXED]: 0,
  }]));
  for (const row of rows) {
    for (const facet of FEATURE_MATRIX_FACETS) {
      const cellState = getFeatureMatrixRowCellState(row, facet.id);
      countsByFacet[facet.id][cellState] += 1;
    }
  }
  return countsByFacet;
}

function getFeatureMatrixChanges(rows = getFeatureMatrixRows()) {
  const saved = getFeatureMatrixSaved();
  const draft = getFeatureMatrixDraft();
  const changes = [];
  for (const row of rows) {
    for (const facet of FEATURE_MATRIX_FACETS) {
      const fromState = getFeatureMatrixRowCellState(row, facet.id, saved);
      const toState = getFeatureMatrixRowCellState(row, facet.id, draft);
      if (fromState === toState) {
        continue;
      }
      changes.push({
        rowKey: row.key,
        siteIds: row.siteIds,
        title: row.title || row.key,
        facet,
        fromState,
        toState,
      });
    }
  }
  return changes;
}

function getFeatureMatrixAssignmentSignature(matrixState) {
  return JSON.stringify((matrixState || createFeatureMatrixState()).assignments || {});
}

function isFeatureMatrixDirty() {
  return getFeatureMatrixAssignmentSignature(getFeatureMatrixSaved()) !== getFeatureMatrixAssignmentSignature(getFeatureMatrixDraft());
}

function saveFeatureMatrixDraft() {
  const saved = cloneFeatureMatrixState(getFeatureMatrixDraft());
  saved.updatedAt = new Date().toISOString();
  state.featureMatrix.saved = saved;
  state.featureMatrix.draft = cloneFeatureMatrixState(saved);
  try {
    localStorage.setItem(FEATURE_MATRIX_STORAGE_KEY, JSON.stringify(saved));
    setFeatureMatrixStatus('Saved locally.', 'success');
  } catch {
    setFeatureMatrixStatus('Local save failed. Copy the prompt before leaving.', 'error');
  }
  renderFeatureMatrixView();
}

function resetFeatureMatrixDraft() {
  state.featureMatrix.draft = cloneFeatureMatrixState(getFeatureMatrixSaved());
  setFeatureMatrixStatus('Reset to saved matrix.', 'info');
  renderFeatureMatrixView();
}

async function copyFeatureMatrixSynopsis() {
  const text = buildFeatureMatrixSynopsis();
  const result = await copyTextWithFeatureMatrixFallback(text);
  if (result.copied) {
    if (featureMatrixCopyButton) {
      flashButton(featureMatrixCopyButton, 'Copied');
    }
    setFeatureMatrixStatus('Prompt copied.', 'success');
  } else {
    setFeatureMatrixStatus('Prompt selected. Use your copy shortcut.', 'warning');
  }
  renderFeatureMatrixView();
  if (!result.copied && featureMatrixSynopsisEl) {
    featureMatrixSynopsisEl.focus({ preventScroll: true });
    featureMatrixSynopsisEl.select();
  }
}

async function copyTextWithFeatureMatrixFallback(text) {
  const clipboardText = String(text || '');
  if (navigator.clipboard?.writeText) {
    let timeoutId = 0;
    try {
      await Promise.race([
        navigator.clipboard.writeText(clipboardText),
        new Promise((_, reject) => {
          timeoutId = window.setTimeout(() => reject(new Error('Clipboard write timed out.')), 900);
        }),
      ]);
      window.clearTimeout(timeoutId);
      return { copied: true };
    } catch {
      window.clearTimeout(timeoutId);
    }
  }

  if (!featureMatrixSynopsisEl) {
    return { copied: false };
  }

  featureMatrixSynopsisEl.value = clipboardText;
  featureMatrixSynopsisEl.focus({ preventScroll: true });
  featureMatrixSynopsisEl.select();
  try {
    return { copied: document.execCommand('copy') === true };
  } catch {
    return { copied: false };
  }
}

function setFeatureMatrixStatus(message, tone = '') {
  state.featureMatrix.statusMessage = message || '';
  state.featureMatrix.statusTone = tone || '';
}

function buildFeatureMatrixSynopsis(rows = getFeatureMatrixRows(), changes = getFeatureMatrixChanges(rows)) {
  const scopeLabel = state.featureMatrix.scope === FEATURE_MATRIX_SCOPE_ALL ? 'all apps' : 'currently visible apps';
  const searchText = String(searchEl?.value || '').trim();
  const activeTags = getActiveCatalogTagIds().map((tagId) => getCatalogTagLabel(tagId)).filter(Boolean);
  const lines = [
    'Feature Matrix handoff for sites.mullmania.com',
    '',
    `Scope: ${scopeLabel}`,
    `Apps in scope: ${rows.length}`,
    `Generated: ${new Date().toISOString()}`,
  ];

  if (searchText) {
    lines.push(`Search filter: ${searchText}`);
  }
  if (activeTags.length) {
    lines.push(`Tag filters: ${activeTags.join(', ')}`);
  }

  lines.push(
    '',
    'Interpretation:',
    '- ON means implement or preserve the facet according to its rule.',
    '- OFF means the absence is intentional. Do not add that facet unless the matrix changes.',
    '- DEFERRED means leave it alone for this pass and call out the follow-up.',
    '- UNKNOWN means audit first; do not assume support either way.',
    '',
    'Facet rules:'
  );

  for (const facet of FEATURE_MATRIX_FACETS) {
    lines.push(`- ${facet.label}: ${facet.rule || 'Use the operator-provided rule for this facet.'}`);
  }

  lines.push('', 'Changes since last saved matrix:');
  if (changes.length === 0) {
    lines.push('- No changed cells in this scope.');
  } else {
    for (const change of changes) {
      lines.push(`- ${change.siteId} (${change.title}) / ${change.facet.label}: ${formatFeatureMatrixState(change.fromState)} -> ${formatFeatureMatrixState(change.toState)}`);
    }
  }

  lines.push('', 'Current explicit decisions in scope:');
  let explicitDecisionCount = 0;
  for (const facet of FEATURE_MATRIX_FACETS) {
    const byState = {
      [FEATURE_MATRIX_STATE_ON]: [],
      [FEATURE_MATRIX_STATE_OFF]: [],
      [FEATURE_MATRIX_STATE_DEFERRED]: [],
    };
    for (const entry of rows) {
      const cellState = getFeatureMatrixCellState(entry.siteId, facet.id);
      if (byState[cellState]) {
        byState[cellState].push(entry.siteId);
      }
    }
    const chunks = [];
    for (const stateId of [FEATURE_MATRIX_STATE_ON, FEATURE_MATRIX_STATE_OFF, FEATURE_MATRIX_STATE_DEFERRED]) {
      if (byState[stateId].length > 0) {
        explicitDecisionCount += byState[stateId].length;
        chunks.push(`${formatFeatureMatrixState(stateId)}: ${byState[stateId].join(', ')}`);
      }
    }
    if (chunks.length > 0) {
      lines.push(`- ${facet.label} - ${chunks.join(' | ')}`);
    }
  }
  if (explicitDecisionCount === 0) {
    lines.push('- No explicit ON/OFF/DEFERRED decisions yet.');
  }

  lines.push(
    '',
    'Agent request:',
    'Use the matrix as operator intent. For ON cells, make the matching app follow the facet rule exactly. For OFF cells, keep the facet absent and document that the absence is intentional. For DEFERRED cells, do not implement now. For UNKNOWN cells, inspect before proposing changes.'
  );

  return `${lines.join('\n')}\n`;
}

function formatFeatureMatrixState(stateId) {
  const stateMeta = FEATURE_MATRIX_STATES[normalizeFeatureMatrixCellState(stateId)] || FEATURE_MATRIX_STATES[FEATURE_MATRIX_STATE_UNKNOWN];
  return stateMeta.label.toUpperCase();
}

function renderFlightDeckView() {
  if (!flightDeckViewEl || !flightDeckSectionsEl) {
    return;
  }

  const model = buildFlightDeckModel();
  flightDeckSectionsEl.innerHTML = model.sections.map((section) => renderFlightDeckSection(section)).join('');
  flightDeckSectionsEl.querySelectorAll('[data-flightdeck-site-id]').forEach((card) => {
    const siteId = card.getAttribute('data-flightdeck-site-id') || '';
    const entry = state.entries.find((item) => item.siteId === siteId);
    if (!entry) {
      return;
    }
    wireCatalogTagDropTarget(card, entry);
    card.addEventListener('click', (event) => {
      const interactiveTarget = event.target instanceof HTMLElement
        ? event.target.closest('a, button, input, label, textarea, select')
        : null;
      if (interactiveTarget) {
        return;
      }
      openFullscreenPreview(entry);
    });
  });
}

function buildFlightDeckModel() {
  const entries = state.visibleSiteEntries;
  const limit = Math.max(4, Number(state.flightDeckLimit) || 12);
  const recent = entries
    .filter((entry) => getEntryModifiedTimestamp(entry) > 0)
    .sort((left, right) => getEntryModifiedTimestamp(right) - getEntryModifiedTimestamp(left));
  const feedback = entries
    .filter((entry) => hasOperatorNote(entry))
    .sort(compareFlightDeckFeedbackEntries);
  const previewIssues = entries
    .filter((entry) => shouldShowFlightDeckPreviewIssue(entry))
    .sort(compareManualRank);
  const uncategorized = entries
    .filter((entry) => !hasFlightDeckCategory(entry))
    .sort(compareManualRank);
  const processing = entries
    .filter((entry) => getFlightDeckProcessingLabels(entry).length > 0)
    .sort(compareAlphabetical);
  const stale = entries
    .filter((entry) => isFlightDeckStale(entry))
    .sort((left, right) => getEntryModifiedTimestamp(left) - getEntryModifiedTimestamp(right));

  const metrics = [
    { label: 'Visible apps', value: entries.length.toLocaleString() },
    { label: 'Feedback', value: feedback.length.toLocaleString() },
    { label: 'Uncategorized', value: uncategorized.length.toLocaleString() },
    { label: 'Preview issues', value: previewIssues.length.toLocaleString() },
    { label: 'Processing', value: processing.length.toLocaleString() },
    { label: 'Stale', value: stale.length.toLocaleString() },
  ];

  return {
    totalVisible: entries.length,
    metrics,
    sections: [
      buildFlightDeckSectionModel({
        key: 'recent',
        icon: 'ti ti-clock',
        title: 'Recently changed',
        empty: 'No recent catalog changes match this view.',
        entries: recent,
        limit,
        reason: buildFlightDeckRecentReason,
      }),
      buildFlightDeckSectionModel({
        key: 'feedback',
        icon: 'ti ti-message-dots',
        title: 'Has feedback',
        empty: 'No saved feedback matches this view.',
        entries: feedback,
        limit,
        reason: buildFlightDeckFeedbackReason,
      }),
      buildFlightDeckSectionModel({
        key: 'processing',
        icon: 'ti ti-loader-2',
        title: 'Processing',
        empty: 'No background access or preview work is in progress.',
        entries: processing,
        limit,
        reason: (entry) => getFlightDeckProcessingLabels(entry).join(', '),
      }),
      buildFlightDeckSectionModel({
        key: 'preview',
        icon: 'ti ti-photo-off',
        title: 'Preview issues',
        empty: 'Every visible app has a cached preview image.',
        entries: previewIssues,
        limit,
        reason: () => 'No cached preview image',
      }),
      buildFlightDeckSectionModel({
        key: 'uncategorized',
        icon: 'ti ti-tags-off',
        title: 'Uncategorized',
        empty: 'Every visible app has a category tag.',
        entries: uncategorized,
        limit,
        reason: () => 'No category tag',
      }),
      buildFlightDeckSectionModel({
        key: 'stale',
        icon: 'ti ti-hourglass-empty',
        title: 'Stale or unknown',
        empty: 'No stale apps match this view.',
        entries: stale,
        limit,
        reason: buildFlightDeckStaleReason,
      }),
    ],
  };
}

function buildFlightDeckSectionModel(section) {
  const allEntries = Array.isArray(section.entries) ? section.entries : [];
  const totalCount = allEntries.length;
  const limit = Math.max(4, Number(section.limit) || 12);
  const pageCount = Math.max(1, Math.ceil(totalCount / limit));
  const requestedPage = Number(state.flightDeckSectionPages[section.key]) || 0;
  const page = Math.max(0, Math.min(pageCount - 1, requestedPage));
  state.flightDeckSectionPages[section.key] = page;
  const start = page * limit;
  return {
    ...section,
    entries: allEntries.slice(start, start + limit),
    totalCount,
    limit,
    page,
    pageCount,
    start,
    end: Math.min(totalCount, start + limit),
  };
}

function renderFlightDeckSection(section) {
  const totalCount = Number.isFinite(section.totalCount) ? section.totalCount : section.entries.length;
  const pager = renderFlightDeckSectionPager(section);
  const pageNote = totalCount > 0 && section.pageCount > 1
    ? `<div class="flightdeck-section__limit">Showing ${(section.start + 1).toLocaleString()}-${section.end.toLocaleString()} of ${totalCount.toLocaleString()}</div>`
    : '';
  return `
    <section class="flightdeck-section flightdeck-section--${escapeHtml(section.key)}">
      <div class="flightdeck-section__header">
        <div class="flightdeck-section__title">
          <i class="${escapeHtml(section.icon)}" aria-hidden="true"></i>
          <h2>${escapeHtml(section.title)}</h2>
        </div>
        <div class="flightdeck-section__header-actions">
          ${pager}
          <span class="flightdeck-section__count">${totalCount.toLocaleString()}</span>
        </div>
      </div>
      <div class="flightdeck-section__body">
        ${totalCount === 0
          ? `<p class="flightdeck-empty">${escapeHtml(section.empty)}</p>`
          : `${section.entries.map((entry) => renderFlightDeckCard(entry, section.reason(entry))).join('')}${pageNote}`}
      </div>
    </section>
  `;
}

function renderFlightDeckSectionPager(section) {
  if (!section || section.pageCount <= 1) {
    return '';
  }
  const previousDisabled = section.page <= 0;
  const nextDisabled = section.page >= section.pageCount - 1;
  return `
    <div class="flightdeck-section__pager" aria-label="${escapeHtml(section.title)} pages">
      <button type="button" class="flightdeck-section__pager-button" data-flightdeck-page-action="prev" data-flightdeck-section="${escapeHtml(section.key)}" ${previousDisabled ? 'disabled' : ''} aria-label="Previous ${escapeHtml(section.title)} page">
        <i class="ti ti-chevron-left"></i>
      </button>
      <span class="flightdeck-section__pager-label">${(section.page + 1).toLocaleString()}/${section.pageCount.toLocaleString()}</span>
      <button type="button" class="flightdeck-section__pager-button" data-flightdeck-page-action="next" data-flightdeck-section="${escapeHtml(section.key)}" ${nextDisabled ? 'disabled' : ''} aria-label="Next ${escapeHtml(section.title)} page">
        <i class="ti ti-chevron-right"></i>
      </button>
    </div>
  `;
}

function renderFlightDeckCard(entry, reason = '') {
  const title = buildDisplayTitle(entry);
  const tags = getEntryDisplayTags(entry).slice(0, 3);
  const extraTagCount = Math.max(0, getEntryDisplayTags(entry).length - tags.length);
  const modified = getEntryModifiedDetails(entry);
  const host = entry.host || `${entry.siteId}.${BASE_DOMAIN}`;
  const summary = buildSummary(entry) || buildOperatorNotePreview(entry) || 'No summary yet.';
  const previewUrl = getPreviewUrl(entry.siteId) || PREVIEW_PLACEHOLDER_URL;
  return `
    <article class="flightdeck-card" data-flightdeck-site-id="${escapeHtml(entry.siteId)}" tabindex="0">
      <img class="flightdeck-card__preview" src="${escapeHtml(previewUrl)}" alt="${escapeHtml(title)} preview" loading="lazy">
      <div class="flightdeck-card__copy">
        <div class="flightdeck-card__topline">
          <strong>${escapeHtml(title)}</strong>
          ${reason ? `<span>${escapeHtml(reason)}</span>` : ''}
        </div>
        <div class="flightdeck-card__host">${escapeHtml(host)}</div>
        <p>${escapeHtml(summary)}</p>
        <div class="flightdeck-card__meta">
          ${tags.map((tag) => `<span class="fullscreen-tag-chip site-cell__tag-chip"><span class="fullscreen-tag-chip__label">${escapeHtml(tag.label)}</span></span>`).join('')}
          ${extraTagCount > 0 ? `<span class="site-cell__overflow-chip" aria-label="${extraTagCount} more tags">...</span>` : ''}
          ${modified.value ? `<span>${escapeHtml(modified.label)} ${escapeHtml(formatFlightDeckRelativeTime(modified.timestamp))}</span>` : '<span>No known change date</span>'}
        </div>
      </div>
    </article>
  `;
}

function handleFlightDeckSectionClick(event) {
  const button = event.target instanceof Element ? event.target.closest('[data-flightdeck-page-action]') : null;
  if (!button) {
    return;
  }

  const sectionKey = button.getAttribute('data-flightdeck-section') || '';
  const action = button.getAttribute('data-flightdeck-page-action') || '';
  if (!sectionKey || (action !== 'prev' && action !== 'next')) {
    return;
  }

  const currentPage = Number(state.flightDeckSectionPages[sectionKey]) || 0;
  state.flightDeckSectionPages[sectionKey] = Math.max(0, currentPage + (action === 'next' ? 1 : -1));
  render();
}

function renderDependenciesView() {
  if (!dependenciesViewEl) {
    return;
  }

  if (!state.dependencies.loaded && !state.dependencies.loading) {
    void refreshDependencies();
  }

  ensureDependencySelection();
  ensureDependencyPositions();
  renderDependenciesSourceList();
  renderDependenciesDetail();
  renderDependenciesSummary();
  renderDependenciesGraph();
}

function ensureDependencySelection() {
  if (state.dependencies.selectedSiteId && state.dependencies.nodeIds.has(state.dependencies.selectedSiteId)) {
    return;
  }
  state.dependencies.selectedSiteId = Array.from(state.dependencies.nodeIds).sort(compareSiteIdsByTitle)[0] || '';
}

function renderDependenciesSourceList() {
  if (!dependenciesSourceListEl) {
    return;
  }

  const entries = getDependencySourceEntries();
  const groups = getDependencySourceGroups(entries);
  if (dependenciesSourceCountEl) {
    dependenciesSourceCountEl.textContent = groups.length.toLocaleString();
  }

  if (groups.length === 0) {
    dependenciesSourceListEl.innerHTML = '<p class="dependencies-empty-copy">No matching apps.</p>';
    return;
  }

  dependenciesSourceListEl.innerHTML = groups.map((group) => {
    const representative = getDependencyGroupRepresentative(group.key, entries);
    if (!representative) {
      return '';
    }
    const optedIn = group.entries.some((entry) => state.dependencies.nodeIds.has(entry.siteId));
    const selected = group.entries.some((entry) => entry.siteId === state.dependencies.selectedSiteId);
    return `
      <section class="dependencies-source-group ${optedIn ? 'is-in-graph' : ''}" data-dependency-source-group="${escapeHtml(group.key)}" draggable="true">
        ${renderDependencySourceCard(representative, {
          groupKey: group.key,
          label: group.label,
          count: group.entries.length,
          optedIn,
          selected,
        })}
      </section>
    `;
  }).join('');
}

function renderDependencySourceCard(entry, options = {}) {
    const groupKey = options.groupKey || (getDisplayGroupKey(entry) || normalizeSiteId(entry.siteId));
    const optedIn = Boolean(options.optedIn ?? state.dependencies.nodeIds.has(entry.siteId));
    const selected = Boolean(options.selected ?? state.dependencies.selectedSiteId === entry.siteId);
    const title = options.label || buildDisplayTitle(entry) || entry.siteId;
    const host = entry.host || `${entry.siteId}.${BASE_DOMAIN}`;
    const previewUrl = getPreviewUrl(entry.siteId) || PREVIEW_PLACEHOLDER_URL;
    return `
      <article class="dependencies-source-card ${optedIn ? 'is-in-graph' : ''} ${selected ? 'is-selected' : ''}" data-dependency-source-site-id="${escapeHtml(entry.siteId)}" data-dependency-source-group-key="${escapeHtml(groupKey)}">
        <img class="dependencies-source-card__preview" src="${escapeHtml(previewUrl)}" alt="${escapeHtml(title)} preview" loading="lazy">
        <button type="button" class="dependencies-source-card__copy" data-dependency-action="select-group" data-group-key="${escapeHtml(groupKey)}">
          <strong>${escapeHtml(title)}</strong>
          <span>${escapeHtml(host)}</span>
        </button>
        <button type="button" class="secondary dependencies-source-card__action" data-dependency-action="${optedIn ? 'remove-group' : 'add-group'}" data-group-key="${escapeHtml(groupKey)}" data-site-id="${escapeHtml(entry.siteId)}">
          <i class="ti ${optedIn ? 'ti-minus' : 'ti-plus'}"></i>
          <span>${optedIn ? 'Remove' : 'Add'}</span>
        </button>
      </article>
    `;
}

function getDependencySourceGroups(entries = getDependencySourceEntries()) {
  const groups = new Map();
  for (const entry of entries) {
    const key = getDisplayGroupKey(entry) || normalizeSiteId(entry.siteId);
    const label = getDisplayGroupLabel(entry) || entry.siteId;
    const group = groups.get(key) || { key, label, entries: [] };
    group.entries.push(entry);
    groups.set(key, group);
  }
  return Array.from(groups.values())
    .map((group) => ({
      ...group,
      entries: group.entries.sort(compareNaturalSiteEntries),
    }))
    .sort((left, right) => compareNaturalText(left.label, right.label) || compareNaturalText(left.key, right.key));
}

function getDependencySourceGroupByKey(groupKey, entries = getDependencySourceEntries()) {
  const normalizedKey = String(groupKey || '').trim();
  if (!normalizedKey) {
    return null;
  }
  return getDependencySourceGroups(entries).find((group) => group.key === normalizedKey) || null;
}

function getDependencyGroupForSiteId(siteId) {
  const entry = findEntryBySiteId(siteId);
  if (!entry) {
    return null;
  }
  const groupKey = getDisplayGroupKey(entry) || normalizeSiteId(entry.siteId);
  const entries = state.entries
    .filter((candidate) => candidate.siteId !== ROOT_SITE_ID && candidate.hasHostedSite)
    .filter((candidate) => (getDisplayGroupKey(candidate) || normalizeSiteId(candidate.siteId)) === groupKey)
    .sort(compareNaturalSiteEntries);
  if (entries.length === 0) {
    return null;
  }
  return {
    key: groupKey,
    label: getDisplayGroupLabel(entry) || entry.siteId,
    entries,
  };
}

function getDependencyGroupRepresentative(groupKey, entries = null) {
  const group = entries
    ? getDependencySourceGroupByKey(groupKey, entries)
    : getDependencySourceGroupByKey(groupKey) || getDependencySourceGroupByKey(groupKey, state.entries);
  if (!group) {
    return null;
  }
  return group.entries[0]
    || null;
}

function renderDependenciesDetail() {
  if (!dependenciesDetailEl) {
    return;
  }

  const selectedEntry = findEntryBySiteId(state.dependencies.selectedSiteId);
  if (!selectedEntry) {
    dependenciesDetailEl.innerHTML = `
      <div class="dependencies-detail-empty">
        <i class="ti ti-point"></i>
        <p>Pick an app.</p>
      </div>
    `;
    return;
  }

  const title = buildDisplayTitle(selectedEntry) || selectedEntry.siteId;
  const host = selectedEntry.host || `${selectedEntry.siteId}.${BASE_DOMAIN}`;
  const dependsOn = state.dependencies.edges
    .filter((edge) => edge.from === selectedEntry.siteId)
    .sort((left, right) => compareSiteIdsByTitle(left.to, right.to));
  const dependedOnBy = state.dependencies.edges
    .filter((edge) => edge.to === selectedEntry.siteId)
    .sort((left, right) => compareSiteIdsByTitle(left.from, right.from));
  const targetOptions = getDependencyTargetEntries(selectedEntry.siteId)
    .map((entry) => `<option value="${escapeHtml(entry.siteId)}">${escapeHtml(buildDisplayTitle(entry) || entry.siteId)}</option>`)
    .join('');

  dependenciesDetailEl.innerHTML = `
    <div class="dependencies-selected-card">
      <img class="dependencies-selected-card__preview" src="${escapeHtml(getPreviewUrl(selectedEntry.siteId) || PREVIEW_PLACEHOLDER_URL)}" alt="${escapeHtml(title)} preview" loading="lazy">
      <div class="dependencies-selected-card__copy">
        <strong>${escapeHtml(title)}</strong>
        <span>${escapeHtml(host)}</span>
      </div>
    </div>
    <label class="field dependencies-relation-field">
      <span>Depends on</span>
      <select id="dependencies-target-select" ${targetOptions ? '' : 'disabled'}>
        ${targetOptions || '<option value="">No targets</option>'}
      </select>
    </label>
    <button id="dependencies-add-relation" type="button" class="secondary dependencies-add-relation" ${targetOptions ? '' : 'disabled'}>
      <i class="ti ti-arrow-up-right"></i>
      <span>Add link</span>
    </button>
    ${renderDependencyRelationList('Outgoing', 'to', dependsOn)}
    ${renderDependencyRelationList('Incoming', 'from', dependedOnBy)}
  `;
}

function renderDependencyRelationList(title, peerKey, edges) {
  return `
    <section class="dependencies-relation-list">
      <h3>${escapeHtml(title)}</h3>
      ${edges.length === 0
        ? '<p class="dependencies-empty-copy">None.</p>'
        : edges.map((edge) => {
          const peerId = edge[peerKey];
          const peerEntry = findEntryBySiteId(peerId);
          return `
            <div class="dependencies-relation-row">
              <span>${escapeHtml(buildDisplayTitle(peerEntry) || peerId)}</span>
              <button type="button" class="dependencies-relation-remove" data-dependency-action="remove-edge" data-from="${escapeHtml(edge.from)}" data-to="${escapeHtml(edge.to)}" aria-label="Remove dependency">
                <i class="ti ti-x"></i>
              </button>
            </div>
          `;
        }).join('')}
    </section>
  `;
}

function renderDependenciesSummary() {
  const nodeCount = state.dependencies.nodeIds.size;
  const edgeCount = state.dependencies.edges.length;
  const dirty = isDependencyDraftDirty();

  if (dependenciesSummaryEl) {
    dependenciesSummaryEl.textContent = `${nodeCount.toLocaleString()} apps · ${edgeCount.toLocaleString()} links`;
  }

  if (dependenciesStatusEl) {
    const fallbackMessage = state.dependencies.loading
      ? 'Loading...'
      : state.dependencies.saving
        ? 'Saving...'
        : dirty
          ? 'Unsaved changes'
          : state.dependencies.error || state.dependencies.statusMessage || '';
    dependenciesStatusEl.textContent = fallbackMessage;
    dependenciesStatusEl.dataset.tone = state.dependencies.error ? 'error' : state.dependencies.statusTone || (dirty ? 'warning' : '');
  }

  if (dependenciesSaveButton) {
    dependenciesSaveButton.disabled = !dirty || state.dependencies.saving || !state.apiBaseUrl;
  }
  if (dependenciesResetButton) {
    dependenciesResetButton.disabled = !dirty || state.dependencies.saving;
  }
  if (dependenciesLayoutButton) {
    dependenciesLayoutButton.disabled = nodeCount === 0;
  }
  if (dependenciesFitButton) {
    dependenciesFitButton.disabled = nodeCount === 0;
  }
}

function renderDependenciesGraph() {
  if (!dependenciesGraphEl) {
    return;
  }

  const nodes = getDependencyGraphNodes();
  const edges = getDependencyGraphEdges(nodes);
  const width = dependenciesGraphStageEl?.clientWidth || 900;
  const height = dependenciesGraphStageEl?.clientHeight || 560;
  dependenciesGraphEl.setAttribute('viewBox', `0 0 ${Math.max(1, width)} ${Math.max(1, height)}`);
  dependenciesGraphEl.dataset.empty = nodes.length === 0 ? 'true' : 'false';
  dependenciesEmptyEl?.classList.toggle('is-hidden', nodes.length !== 0);

  if (nodes.length === 0) {
    dependenciesGraphEl.innerHTML = '';
    return;
  }

  if (!state.dependencies.hasFit) {
    fitDependenciesGraph({ render: false });
  }

  const transform = getDependenciesViewportTransform();
  const edgeMarkup = edges.map((edge) => renderDependencyEdge(edge)).join('');
  const nodeMarkup = orderDependencyNodesForRender(nodes).map((node) => renderDependencyNode(node)).join('');

  dependenciesGraphEl.innerHTML = `
    <defs>
      <marker id="dependency-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z"></path>
      </marker>
      <filter id="dependency-node-shadow" x="-20%" y="-20%" width="140%" height="150%">
        <feDropShadow dx="0" dy="8" stdDeviation="7" flood-opacity="0.13"></feDropShadow>
      </filter>
    </defs>
    <g class="dependencies-graph__viewport" transform="${transform}">
      <g class="dependencies-graph__edges">${edgeMarkup}</g>
      <g class="dependencies-graph__nodes">${nodeMarkup}</g>
    </g>
  `;
}

function renderDependencyEdge(edge) {
  const from = state.dependencies.positions[edge.from] || { x: 0, y: 0 };
  const to = state.dependencies.positions[edge.to] || { x: 0, y: 0 };
  const start = getDependencyEdgeEndpoint(from, to);
  const end = getDependencyEdgeEndpoint(to, from);
  const isSelected = edge.from === state.dependencies.selectedSiteId || edge.to === state.dependencies.selectedSiteId;
  return `
    <line
      class="dependency-edge ${isSelected ? 'is-selected' : ''}"
      data-dependency-edge-from="${escapeHtml(edge.from)}"
      data-dependency-edge-to="${escapeHtml(edge.to)}"
      x1="${start.x.toFixed(2)}"
      y1="${start.y.toFixed(2)}"
      x2="${end.x.toFixed(2)}"
      y2="${end.y.toFixed(2)}"
      marker-end="url(#dependency-arrow)"
    ></line>
  `;
}

function getDependenciesViewportTransform() {
  return `translate(${state.dependencies.viewport.x.toFixed(3)} ${state.dependencies.viewport.y.toFixed(3)}) scale(${state.dependencies.viewport.scale.toFixed(4)})`;
}

function renderDependencyNode(node) {
  const selected = node.siteId === state.dependencies.selectedSiteId;
  const dragging = state.dependencies.interaction.mode === 'node' && state.dependencies.interaction.siteId === node.siteId;
  const previewUrl = getPreviewUrl(node.siteId) || PREVIEW_PLACEHOLDER_URL;
  const textX = 86;
  const textWidth = DEPENDENCY_GRAPH_NODE_WIDTH - textX - 16;
  const title = truncateDependencyLabel(node.title, 26);
  const host = truncateDependencyLabel(node.host, 24);
  const x = node.x - (DEPENDENCY_GRAPH_NODE_WIDTH / 2);
  const y = node.y - (DEPENDENCY_GRAPH_NODE_HEIGHT / 2);
  const clipId = `dependency-node-text-${safeSvgId(node.siteId)}`;
  return `
    <g class="dependency-node ${selected ? 'is-selected' : ''} ${dragging ? 'is-dragging' : ''}" data-dependency-node="${escapeHtml(node.siteId)}" transform="translate(${x.toFixed(2)} ${y.toFixed(2)})" tabindex="0">
      <clipPath id="${clipId}">
        <rect x="${textX}" y="12" width="${textWidth}" height="48"></rect>
      </clipPath>
      <rect class="dependency-node__shell" width="${DEPENDENCY_GRAPH_NODE_WIDTH}" height="${DEPENDENCY_GRAPH_NODE_HEIGHT}" rx="8"></rect>
      <image class="dependency-node__preview" href="${escapeHtml(previewUrl)}" x="10" y="10" width="64" height="48" preserveAspectRatio="xMidYMid slice"></image>
      <g clip-path="url(#${clipId})">
        <text class="dependency-node__title" x="${textX}" y="30">${escapeHtml(title)}</text>
        <text class="dependency-node__host" x="${textX}" y="52">${escapeHtml(host)}</text>
      </g>
    </g>
  `;
}

function orderDependencyNodesForRender(nodes) {
  const draggingSiteId = state.dependencies.interaction.mode === 'node' ? state.dependencies.interaction.siteId : '';
  if (!draggingSiteId) {
    return nodes;
  }
  const draggingNode = nodes.find((node) => node.siteId === draggingSiteId);
  if (!draggingNode) {
    return nodes;
  }
  return [
    ...nodes.filter((node) => node.siteId !== draggingSiteId),
    draggingNode,
  ];
}

function safeSvgId(value) {
  return String(value || 'node').replace(/[^a-zA-Z0-9_-]+/g, '-');
}

function truncateDependencyLabel(value, maxLength) {
  const text = String(value || '').trim();
  if (text.length <= maxLength) {
    return text;
  }
  return `${text.slice(0, Math.max(0, maxLength - 3)).trimEnd()}...`;
}

function getDependencyEdgeEndpoint(from, to) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const absDx = Math.abs(dx);
  const absDy = Math.abs(dy);
  if (absDx < 0.001 && absDy < 0.001) {
    return { x: from.x, y: from.y };
  }

  const halfWidth = DEPENDENCY_GRAPH_NODE_WIDTH / 2;
  const halfHeight = DEPENDENCY_GRAPH_NODE_HEIGHT / 2;
  const boundaryT = Math.min(
    absDx > 0.001 ? halfWidth / absDx : Infinity,
    absDy > 0.001 ? halfHeight / absDy : Infinity
  );
  const distance = Math.hypot(dx, dy);
  const gapT = DEPENDENCY_GRAPH_EDGE_GAP / Math.max(distance, 1);
  const t = boundaryT + gapT;
  return {
    x: from.x + dx * t,
    y: from.y + dy * t,
  };
}

function getDependencySourceEntries() {
  return state.visibleSiteEntries
    .filter((entry) => entry.siteId !== ROOT_SITE_ID && entry.hasHostedSite)
    .sort(compareEntriesByTitle);
}

function getDependencyTargetEntries(sourceSiteId) {
  const sourceGroupKey = getDependencyGroupForSiteId(sourceSiteId)?.key || '';
  const existingTargets = new Set(
    state.dependencies.edges
      .filter((edge) => edge.from === sourceSiteId)
      .map((edge) => edge.to)
  );
  return getDependencySourceGroups(
    state.entries.filter((entry) => entry.siteId !== ROOT_SITE_ID && entry.hasHostedSite)
  )
    .filter((group) => group.key !== sourceGroupKey)
    .map((group) => group.entries[0])
    .filter((entry) => entry && entry.siteId !== sourceSiteId && !existingTargets.has(entry.siteId))
    .sort(compareEntriesByTitle);
}

function getDependencyGraphNodes() {
  return Array.from(state.dependencies.nodeIds)
    .map((siteId) => {
      const entry = findEntryBySiteId(siteId);
      const position = state.dependencies.positions[siteId] || { x: 0, y: 0 };
      if (!entry) {
        return null;
      }
      return {
        siteId,
        title: buildDisplayTitle(entry) || siteId,
        host: entry.host || `${siteId}.${BASE_DOMAIN}`,
        x: position.x,
        y: position.y,
      };
    })
    .filter(Boolean)
    .sort((left, right) => compareSiteIdsByTitle(left.siteId, right.siteId));
}

function getDependencyGraphEdges(nodes = getDependencyGraphNodes()) {
  const nodeIds = new Set(nodes.map((node) => node.siteId));
  return state.dependencies.edges.filter((edge) => nodeIds.has(edge.from) && nodeIds.has(edge.to));
}

function ensureDependencyPositions() {
  const nodeIds = Array.from(state.dependencies.nodeIds).sort(compareSiteIdsByTitle);
  let changed = false;
  const radius = Math.max(180, nodeIds.length * 28);
  nodeIds.forEach((siteId, index) => {
    const current = state.dependencies.positions[siteId];
    if (current && Number.isFinite(current.x) && Number.isFinite(current.y)) {
      return;
    }
    const angle = (Math.PI * 2 * index) / Math.max(nodeIds.length, 1);
    state.dependencies.positions[siteId] = {
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius,
    };
    changed = true;
  });

  for (const siteId of Object.keys(state.dependencies.positions)) {
    if (!state.dependencies.nodeIds.has(siteId)) {
      delete state.dependencies.positions[siteId];
      changed = true;
    }
  }

  if (changed) {
    state.dependencies.hasFit = false;
  }
}

function runDependencyForceLayout(options = {}) {
  const nodeIds = Array.from(state.dependencies.nodeIds).sort(compareSiteIdsByTitle);
  if (nodeIds.length === 0) {
    return;
  }

  ensureDependencyPositions();
  const positions = state.dependencies.positions;
  const iterations = options.force ? 220 : 110;
  const linkDistance = 260;
  const centerStrength = 0.012;
  const linkStrength = 0.024;
  const repelStrength = Math.min(42000, 18000 + nodeIds.length * 190);

  for (let iteration = 0; iteration < iterations; iteration += 1) {
    const deltas = Object.fromEntries(nodeIds.map((siteId) => [siteId, { x: 0, y: 0 }]));

    for (let leftIndex = 0; leftIndex < nodeIds.length; leftIndex += 1) {
      for (let rightIndex = leftIndex + 1; rightIndex < nodeIds.length; rightIndex += 1) {
        const leftId = nodeIds[leftIndex];
        const rightId = nodeIds[rightIndex];
        const left = positions[leftId];
        const right = positions[rightId];
        const dx = left.x - right.x || 0.01;
        const dy = left.y - right.y || 0.01;
        const distanceSq = Math.max(1600, dx * dx + dy * dy);
        const force = repelStrength / distanceSq;
        const distance = Math.sqrt(distanceSq);
        const fx = (dx / distance) * force;
        const fy = (dy / distance) * force;
        deltas[leftId].x += fx;
        deltas[leftId].y += fy;
        deltas[rightId].x -= fx;
        deltas[rightId].y -= fy;
      }
    }

    for (const edge of state.dependencies.edges) {
      if (!positions[edge.from] || !positions[edge.to]) {
        continue;
      }
      const from = positions[edge.from];
      const to = positions[edge.to];
      const dx = to.x - from.x || 0.01;
      const dy = to.y - from.y || 0.01;
      const distance = Math.max(1, Math.hypot(dx, dy));
      const force = (distance - linkDistance) * linkStrength;
      const fx = (dx / distance) * force;
      const fy = (dy / distance) * force;
      deltas[edge.from].x += fx;
      deltas[edge.from].y += fy;
      deltas[edge.to].x -= fx;
      deltas[edge.to].y -= fy;
    }

    const cooling = 0.62 * (1 - iteration / (iterations * 1.4));
    for (const siteId of nodeIds) {
      const position = positions[siteId];
      position.x += (deltas[siteId].x - position.x * centerStrength) * cooling;
      position.y += (deltas[siteId].y - position.y * centerStrength) * cooling;
      position.x = Math.max(-4800, Math.min(4800, position.x));
      position.y = Math.max(-4800, Math.min(4800, position.y));
    }
  }

  state.dependencies.hasFit = false;
}

function fitDependenciesGraph(options = {}) {
  const nodes = getDependencyGraphNodes();
  const width = dependenciesGraphStageEl?.clientWidth || 900;
  const height = dependenciesGraphStageEl?.clientHeight || 560;
  if (nodes.length === 0) {
    state.dependencies.viewport = { x: width / 2, y: height / 2, scale: 1 };
    state.dependencies.hasFit = true;
    return;
  }

  const bounds = nodes.reduce((acc, node) => ({
    minX: Math.min(acc.minX, node.x - DEPENDENCY_GRAPH_NODE_WIDTH / 2),
    maxX: Math.max(acc.maxX, node.x + DEPENDENCY_GRAPH_NODE_WIDTH / 2),
    minY: Math.min(acc.minY, node.y - DEPENDENCY_GRAPH_NODE_HEIGHT / 2),
    maxY: Math.max(acc.maxY, node.y + DEPENDENCY_GRAPH_NODE_HEIGHT / 2),
  }), {
    minX: Infinity,
    maxX: -Infinity,
    minY: Infinity,
    maxY: -Infinity,
  });

  const graphWidth = Math.max(1, bounds.maxX - bounds.minX);
  const graphHeight = Math.max(1, bounds.maxY - bounds.minY);
  const scale = Math.max(
    DEPENDENCY_GRAPH_MIN_SCALE,
    Math.min(DEPENDENCY_GRAPH_MAX_SCALE, Math.min((width - 72) / graphWidth, (height - 72) / graphHeight))
  );
  state.dependencies.viewport = {
    scale,
    x: (width / 2) - ((bounds.minX + graphWidth / 2) * scale),
    y: (height / 2) - ((bounds.minY + graphHeight / 2) * scale),
  };
  state.dependencies.hasFit = true;

  if (options.render !== false) {
    renderDependenciesGraph();
  }
}

function addDependencyNode(siteId, options = {}) {
  const entry = findEntryBySiteId(siteId);
  if (!entry || entry.siteId === ROOT_SITE_ID) {
    return;
  }
  state.dependencies.nodeIds.add(entry.siteId);
  state.dependencies.selectedSiteId = entry.siteId;
  if (options.position && Number.isFinite(options.position.x) && Number.isFinite(options.position.y)) {
    state.dependencies.positions[entry.siteId] = {
      x: Math.max(-5000, Math.min(5000, options.position.x)),
      y: Math.max(-5000, Math.min(5000, options.position.y)),
    };
  }
  ensureDependencyPositions();
  setDependenciesStatus('Added.', 'info');
  renderDependenciesView();
}

function addDependencyGroup(groupKey, options = {}) {
  const representative = getDependencyGroupRepresentative(groupKey);
  if (!representative) {
    return;
  }
  addDependencyNode(representative.siteId, options);
}

function removeDependencyGroup(groupKey) {
  const group = getDependencySourceGroupByKey(groupKey) || getDependencySourceGroupByKey(groupKey, state.entries);
  if (!group) {
    return;
  }
  const groupSiteIds = new Set(group.entries.map((entry) => entry.siteId));
  for (const siteId of groupSiteIds) {
    state.dependencies.nodeIds.delete(siteId);
    delete state.dependencies.positions[siteId];
  }
  state.dependencies.edges = state.dependencies.edges.filter((edge) => !groupSiteIds.has(edge.from) && !groupSiteIds.has(edge.to));
  if (groupSiteIds.has(state.dependencies.selectedSiteId)) {
    state.dependencies.selectedSiteId = '';
  }
  state.dependencies.hasFit = false;
  setDependenciesStatus('Removed.', 'info');
  renderDependenciesView();
}

function replaceDependencyNodeIncarnation(currentSiteId, nextSiteId) {
  const currentId = normalizeCatalogToken(currentSiteId);
  const nextId = normalizeCatalogToken(nextSiteId);
  if (!currentId || !nextId || currentId === nextId || !state.dependencies.nodeIds.has(currentId)) {
    return;
  }
  const currentGroup = getDependencyGroupForSiteId(currentId);
  if (!currentGroup || !currentGroup.entries.some((entry) => entry.siteId === nextId)) {
    return;
  }
  if (state.dependencies.nodeIds.has(nextId)) {
    state.dependencies.selectedSiteId = nextId;
    setDependenciesStatus('Selected existing incarnation.', 'info');
    renderDependenciesView();
    return;
  }

  const position = state.dependencies.positions[currentId];
  state.dependencies.nodeIds.delete(currentId);
  state.dependencies.nodeIds.add(nextId);
  if (position) {
    state.dependencies.positions[nextId] = position;
  }
  delete state.dependencies.positions[currentId];
  state.dependencies.edges = dedupeDependencyEdges(
    state.dependencies.edges
      .map((edge) => ({
        from: edge.from === currentId ? nextId : edge.from,
        to: edge.to === currentId ? nextId : edge.to,
      }))
      .filter((edge) => edge.from !== edge.to)
  );
  state.dependencies.selectedSiteId = nextId;
  state.dependencies.hasFit = false;
  setDependenciesStatus('Incarnation changed.', 'info');
  renderDependenciesView();
}

function dedupeDependencyEdges(edges) {
  const seen = new Set();
  const deduped = [];
  for (const edge of edges) {
    const from = normalizeCatalogToken(edge.from);
    const to = normalizeCatalogToken(edge.to);
    if (!from || !to || from === to) {
      continue;
    }
    const key = `${from}->${to}`;
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    deduped.push({ from, to });
  }
  return deduped;
}

function removeDependencyNode(siteId) {
  const normalized = normalizeCatalogToken(siteId);
  state.dependencies.nodeIds.delete(normalized);
  state.dependencies.edges = state.dependencies.edges.filter((edge) => edge.from !== normalized && edge.to !== normalized);
  delete state.dependencies.positions[normalized];
  if (state.dependencies.selectedSiteId === normalized) {
    state.dependencies.selectedSiteId = '';
  }
  state.dependencies.hasFit = false;
  setDependenciesStatus('Removed.', 'info');
  renderDependenciesView();
}

function addDependencyEdge(from, to) {
  const sourceId = normalizeCatalogToken(from);
  const targetId = normalizeCatalogToken(to);
  if (!sourceId || !targetId || sourceId === targetId || !findEntryBySiteId(sourceId) || !findEntryBySiteId(targetId)) {
    return;
  }
  if (state.dependencies.edges.some((edge) => edge.from === sourceId && edge.to === targetId)) {
    setDependenciesStatus('That link already exists.', 'warning');
    renderDependenciesView();
    return;
  }
  state.dependencies.nodeIds.add(sourceId);
  state.dependencies.nodeIds.add(targetId);
  state.dependencies.edges.push({ from: sourceId, to: targetId });
  state.dependencies.selectedSiteId = sourceId;
  ensureDependencyPositions();
  runDependencyForceLayout();
  setDependenciesStatus('Link added.', 'info');
  renderDependenciesView();
}

function removeDependencyEdge(from, to) {
  const sourceId = normalizeCatalogToken(from);
  const targetId = normalizeCatalogToken(to);
  state.dependencies.edges = state.dependencies.edges.filter((edge) => edge.from !== sourceId || edge.to !== targetId);
  setDependenciesStatus('Link removed.', 'info');
  renderDependenciesView();
}

function handleDependenciesSourceClick(event) {
  const button = event.target instanceof Element ? event.target.closest('[data-dependency-action]') : null;
  if (!button) {
    return;
  }

  const action = button.getAttribute('data-dependency-action') || '';
  const siteId = button.getAttribute('data-site-id') || '';
  if (action === 'add-group') {
    addDependencyGroup(button.getAttribute('data-group-key') || '');
    return;
  }
  if (action === 'remove-group') {
    removeDependencyGroup(button.getAttribute('data-group-key') || '');
    return;
  }
  if (action === 'select-group') {
    const groupKey = button.getAttribute('data-group-key') || '';
    const representative = getDependencyGroupRepresentative(groupKey);
    if (!representative) {
      return;
    }
    const existingEntry = getDependencySourceGroupByKey(groupKey, state.entries)?.entries
      .find((entry) => state.dependencies.nodeIds.has(entry.siteId));
    const entry = existingEntry || representative;
    if (!state.dependencies.nodeIds.has(entry.siteId)) {
      addDependencyNode(entry.siteId);
      return;
    }
    state.dependencies.selectedSiteId = entry.siteId;
    renderDependenciesView();
    return;
  }
  if (action === 'select') {
    if (!state.dependencies.nodeIds.has(siteId)) {
      state.dependencies.nodeIds.add(siteId);
      ensureDependencyPositions();
    }
    state.dependencies.selectedSiteId = siteId;
    renderDependenciesView();
  } else if (action === 'add-node') {
    addDependencyNode(siteId);
  } else if (action === 'remove-node') {
    removeDependencyNode(siteId);
  }
}

function handleDependenciesSourceDragStart(event) {
  const group = event.target instanceof Element ? event.target.closest('[data-dependency-source-group]') : null;
  if (!group || !event.dataTransfer) {
    return;
  }

  const groupKey = group.getAttribute('data-dependency-source-group') || '';
  if (!groupKey) {
    return;
  }

  event.dataTransfer.effectAllowed = 'copy';
  event.dataTransfer.setData('application/x-mullmania-dependency-group', groupKey);
  event.dataTransfer.setData('text/plain', groupKey);
}

function handleDependenciesDetailClick(event) {
  const button = event.target instanceof Element ? event.target.closest('[data-dependency-action], #dependencies-add-relation') : null;
  if (!button) {
    return;
  }

  if (button.id === 'dependencies-add-relation') {
    const select = document.getElementById('dependencies-target-select');
    addDependencyEdge(state.dependencies.selectedSiteId, select?.value || '');
    return;
  }

  const action = button.getAttribute('data-dependency-action') || '';
  if (action === 'remove-edge') {
    removeDependencyEdge(button.getAttribute('data-from') || '', button.getAttribute('data-to') || '');
  }
}

function handleDependenciesDetailChange(event) {
  if (!(event.target instanceof HTMLSelectElement)) {
    return;
  }
  if (event.target.id === 'dependencies-incarnation-select') {
    replaceDependencyNodeIncarnation(event.target.getAttribute('data-current-site-id') || state.dependencies.selectedSiteId, event.target.value);
    return;
  }
  if (event.target.id === 'dependencies-target-select') {
    setDependenciesStatus('', '');
  }
}

function handleDependenciesGraphDragOver(event) {
  if (!Array.from(event.dataTransfer?.types || []).includes('application/x-mullmania-dependency-group')) {
    return;
  }
  event.preventDefault();
  event.dataTransfer.dropEffect = 'copy';
}

function handleDependenciesGraphDrop(event) {
  const groupKey = event.dataTransfer?.getData('application/x-mullmania-dependency-group') || '';
  if (!groupKey) {
    return;
  }
  event.preventDefault();
  addDependencyGroup(groupKey, {
    position: dependencyClientToGraph(event.clientX, event.clientY),
  });
}

function handleDependenciesGraphPointerDown(event) {
  if (!(dependenciesGraphEl instanceof SVGSVGElement)) {
    return;
  }

  const node = event.target instanceof Element ? event.target.closest('[data-dependency-node]') : null;
  dependenciesGraphEl.setPointerCapture?.(event.pointerId);
  const point = dependencyClientToGraph(event.clientX, event.clientY);
  if (node) {
    const siteId = node.getAttribute('data-dependency-node') || '';
    const position = state.dependencies.positions[siteId] || { x: 0, y: 0 };
    state.dependencies.selectedSiteId = siteId;
    state.dependencies.interaction = {
      mode: 'node',
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      originX: position.x,
      originY: position.y,
      nodeOffsetX: position.x - point.x,
      nodeOffsetY: position.y - point.y,
      siteId,
    };
    renderDependenciesSourceList();
    renderDependenciesDetail();
    const nodesLayer = dependenciesGraphEl.querySelector('.dependencies-graph__nodes');
    if (nodesLayer instanceof SVGGElement) {
      nodesLayer.appendChild(node);
      node.classList.add('is-dragging');
    } else {
      renderDependenciesGraph();
    }
    return;
  }

  state.dependencies.interaction = {
    mode: 'pan',
    pointerId: event.pointerId,
    startX: event.clientX,
    startY: event.clientY,
    originX: state.dependencies.viewport.x,
    originY: state.dependencies.viewport.y,
    nodeOffsetX: 0,
    nodeOffsetY: 0,
    siteId: '',
  };
}

function handleDependenciesGraphPointerMove(event) {
  const interaction = state.dependencies.interaction;
  if (!interaction.mode || interaction.pointerId !== event.pointerId) {
    return;
  }

  event.preventDefault();
  if (interaction.mode === 'pan') {
    state.dependencies.viewport.x = interaction.originX + event.clientX - interaction.startX;
    state.dependencies.viewport.y = interaction.originY + event.clientY - interaction.startY;
  } else if (interaction.mode === 'node' && interaction.siteId) {
    const point = dependencyClientToGraph(event.clientX, event.clientY);
    state.dependencies.positions[interaction.siteId] = {
      x: point.x + interaction.nodeOffsetX,
      y: point.y + interaction.nodeOffsetY,
    };
  }
  scheduleDependenciesGraphRender();
}

function handleDependenciesGraphPointerUp(event) {
  if (state.dependencies.interaction.pointerId !== event.pointerId) {
    return;
  }
  dependenciesGraphEl?.releasePointerCapture?.(event.pointerId);
  const needsFinalRender = Boolean(state.dependencies.interaction.mode);
  state.dependencies.interaction = {
    mode: '',
    pointerId: 0,
    startX: 0,
    startY: 0,
    originX: 0,
    originY: 0,
    nodeOffsetX: 0,
    nodeOffsetY: 0,
    siteId: '',
  };
  renderDependenciesSummary();
  if (needsFinalRender) {
    scheduleDependenciesGraphRender({ full: true });
  }
}

function handleDependenciesGraphWheel(event) {
  if (!(dependenciesGraphEl instanceof SVGSVGElement) || state.dependencies.nodeIds.size === 0) {
    return;
  }
  event.preventDefault();
  const rect = dependenciesGraphEl.getBoundingClientRect();
  const sx = event.clientX - rect.left;
  const sy = event.clientY - rect.top;
  const before = dependencyClientToGraph(event.clientX, event.clientY);
  const factor = event.deltaY < 0 ? 1.09 : 0.92;
  const nextScale = Math.max(DEPENDENCY_GRAPH_MIN_SCALE, Math.min(DEPENDENCY_GRAPH_MAX_SCALE, state.dependencies.viewport.scale * factor));
  state.dependencies.viewport.scale = nextScale;
  state.dependencies.viewport.x = sx - before.x * nextScale;
  state.dependencies.viewport.y = sy - before.y * nextScale;
  renderDependenciesGraph();
}

function dependencyClientToGraph(clientX, clientY) {
  const rect = dependenciesGraphEl?.getBoundingClientRect();
  const viewport = state.dependencies.viewport;
  if (!rect) {
    return { x: 0, y: 0 };
  }
  return {
    x: (clientX - rect.left - viewport.x) / viewport.scale,
    y: (clientY - rect.top - viewport.y) / viewport.scale,
  };
}

function scheduleDependenciesGraphRender(options) {
  const fullRender = Boolean(options?.full);
  if (state.dependencies.graphRenderFrame) {
    if (fullRender) {
      state.dependencies.pendingFullGraphRender = true;
    }
    return;
  }
  if (fullRender) {
    state.dependencies.pendingFullGraphRender = true;
  }
  state.dependencies.graphRenderFrame = window.requestAnimationFrame(() => {
    state.dependencies.graphRenderFrame = 0;
    const needsFullRender = state.dependencies.pendingFullGraphRender;
    state.dependencies.pendingFullGraphRender = false;
    if (needsFullRender) {
      renderDependenciesGraph();
      return;
    }
    applyDependenciesGraphInteractionFrame();
  });
}

function applyDependenciesGraphInteractionFrame() {
  const interaction = state.dependencies.interaction;
  if (interaction.mode === 'pan') {
    applyDependenciesViewportTransform();
    return;
  }
  if (interaction.mode === 'node' && interaction.siteId) {
    applyDependencyNodePosition(interaction.siteId);
    return;
  }
  renderDependenciesGraph();
}

function applyDependenciesViewportTransform() {
  const viewportEl = dependenciesGraphEl?.querySelector('.dependencies-graph__viewport');
  if (viewportEl) {
    viewportEl.setAttribute('transform', getDependenciesViewportTransform());
  }
}

function applyDependencyNodePosition(siteId) {
  const position = state.dependencies.positions[siteId];
  if (!position || !dependenciesGraphEl) {
    return;
  }
  const nodeEl = dependenciesGraphEl.querySelector(`[data-dependency-node="${CSS.escape(siteId)}"]`);
  if (nodeEl) {
    const x = position.x - (DEPENDENCY_GRAPH_NODE_WIDTH / 2);
    const y = position.y - (DEPENDENCY_GRAPH_NODE_HEIGHT / 2);
    nodeEl.setAttribute('transform', `translate(${x.toFixed(2)} ${y.toFixed(2)})`);
  }
  dependenciesGraphEl.querySelectorAll('.dependency-edge').forEach((edgeEl) => {
    const fromId = edgeEl.getAttribute('data-dependency-edge-from') || '';
    const toId = edgeEl.getAttribute('data-dependency-edge-to') || '';
    if (fromId !== siteId && toId !== siteId) {
      return;
    }
    const from = state.dependencies.positions[fromId];
    const to = state.dependencies.positions[toId];
    if (!from || !to) {
      return;
    }
    const start = getDependencyEdgeEndpoint(from, to);
    const end = getDependencyEdgeEndpoint(to, from);
    edgeEl.setAttribute('x1', start.x.toFixed(2));
    edgeEl.setAttribute('y1', start.y.toFixed(2));
    edgeEl.setAttribute('x2', end.x.toFixed(2));
    edgeEl.setAttribute('y2', end.y.toFixed(2));
  });
}

function getDependencyStatePayload() {
  return {
    version: 1,
    nodeIds: Array.from(state.dependencies.nodeIds).sort(compareSiteIdsByTitle),
    edges: [...state.dependencies.edges].sort(compareDependencyEdges),
    positions: Object.fromEntries(
      Object.entries(state.dependencies.positions)
        .filter(([siteId]) => state.dependencies.nodeIds.has(siteId))
        .sort(([left], [right]) => compareSiteIdsByTitle(left, right))
        .map(([siteId, position]) => [siteId, { x: Math.round(position.x * 100) / 100, y: Math.round(position.y * 100) / 100 }])
    ),
  };
}

function getDependencySignature() {
  return JSON.stringify(getDependencyStatePayload());
}

function isDependencyDraftDirty() {
  return getDependencySignature() !== state.dependencies.savedSignature;
}

function resetDependencyDraft() {
  if (!state.dependencies.savedSignature) {
    applyDependenciesState({});
  } else {
    applyDependenciesState(JSON.parse(state.dependencies.savedSignature));
  }
  setDependenciesStatus('Reset.', 'info');
  renderDependenciesView();
}

async function saveDependencies() {
  if (!state.apiBaseUrl) {
    setDependenciesStatus(COMPOSER_UNAVAILABLE_MESSAGE, 'error');
    renderDependenciesSummary();
    return false;
  }

  const operatorKey = resolveOperatorKeyForProtectedAction({
    label: 'Saving dependencies',
    type: PROTECTED_ACTION_DEPENDENCIES,
  });
  if (!operatorKey) {
    setDependenciesStatus('Open Settings and paste the operator key once to save dependencies.', 'warning');
    renderDependenciesSummary();
    return false;
  }

  state.dependencies.saving = true;
  setDependenciesStatus('Saving...', 'info');
  renderDependenciesSummary();

  try {
    const response = await fetch(`${state.apiBaseUrl}/api/dependencies`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-operator-key': operatorKey,
      },
      body: JSON.stringify({ state: getDependencyStatePayload() }),
    });
    const data = await readJsonResponse(response);
    if (!response.ok) {
      const error = new Error(data.error ?? `Dependency save failed (${response.status})`);
      error.status = response.status;
      throw error;
    }
    applyDependenciesState(data.state || data);
    setDependenciesStatus('Saved.', 'success');
    renderDependenciesView();
    return true;
  } catch (error) {
    if (isInvalidOperatorKeyFailure(error.status, error.message)) {
      reopenOperatorAccessGate({
        label: 'Saving dependencies',
        type: PROTECTED_ACTION_DEPENDENCIES,
      });
    }
    setDependenciesStatus(error.message || 'Dependency save failed.', 'error');
    renderDependenciesSummary();
    return false;
  } finally {
    state.dependencies.saving = false;
    renderDependenciesSummary();
  }
}

function setDependenciesStatus(message, tone = '') {
  state.dependencies.statusMessage = message;
  state.dependencies.statusTone = tone;
}

function compareEntriesByTitle(left, right) {
  return compareSiteIdsByTitle(left?.siteId || '', right?.siteId || '');
}

function compareSiteIdsByTitle(leftSiteId, rightSiteId) {
  const leftEntry = findEntryBySiteId(leftSiteId);
  const rightEntry = findEntryBySiteId(rightSiteId);
  const leftLabel = buildDisplayTitle(leftEntry) || leftSiteId;
  const rightLabel = buildDisplayTitle(rightEntry) || rightSiteId;
  return leftLabel.localeCompare(rightLabel, undefined, { numeric: true, sensitivity: 'base' })
    || String(leftSiteId).localeCompare(String(rightSiteId), undefined, { numeric: true, sensitivity: 'base' });
}

function compareDependencyEdges(left, right) {
  return compareSiteIdsByTitle(left.from, right.from) || compareSiteIdsByTitle(left.to, right.to);
}

function compareFlightDeckFeedbackEntries(left, right) {
  const leftTime = Date.parse(left.operatorNoteUpdatedAt || '') || 0;
  const rightTime = Date.parse(right.operatorNoteUpdatedAt || '') || 0;
  if (leftTime !== rightTime) {
    return rightTime - leftTime;
  }
  return compareManualRank(left, right);
}

function hasFlightDeckCategory(entry) {
  return getEntryCatalogTagIds(entry).some((tagId) => CATEGORY_BOARD_TAG_IDS.has(tagId));
}

function shouldShowFlightDeckPreviewIssue(entry) {
  return !entry.categories.synthetic && !hasPreviewImage(entry);
}

function isFlightDeckStale(entry) {
  const timestamp = getEntryModifiedTimestamp(entry);
  if (!timestamp) {
    return true;
  }
  const ageMs = Date.now() - timestamp;
  return ageMs > 1000 * 60 * 60 * 24 * 45;
}

function buildFlightDeckRecentReason(entry) {
  const details = getEntryModifiedDetails(entry);
  return details.value ? `${details.label} ${formatFlightDeckRelativeTime(details.timestamp)}` : 'Recent signal';
}

function buildFlightDeckFeedbackReason(entry) {
  if (entry.operatorNoteUpdatedAt) {
    return `Feedback ${formatFlightDeckRelativeTime(Date.parse(entry.operatorNoteUpdatedAt) || 0)}`;
  }
  return 'Feedback saved';
}

function buildFlightDeckStaleReason(entry) {
  const timestamp = getEntryModifiedTimestamp(entry);
  return timestamp ? `Last signal ${formatFlightDeckRelativeTime(timestamp)}` : 'No known change date';
}

function getFlightDeckProcessingLabels(entry) {
  const labels = [];
  const accessJob = getAccessJob(entry.siteId);
  if (accessJob && accessJob.status !== 'success' && accessJob.status !== 'error') {
    labels.push('Access update');
  }
  if (state.previewBusy.has(entry.siteId)) {
    labels.push('Preview refresh');
  }
  if (isSiteMutationBusy(entry.siteId)) {
    labels.push('Site update');
  }
  return labels;
}

function formatFlightDeckRelativeTime(timestamp) {
  if (!Number.isFinite(timestamp) || timestamp <= 0) {
    return 'unknown';
  }
  const deltaMs = Date.now() - timestamp;
  const absMs = Math.abs(deltaMs);
  const minutes = Math.round(absMs / 60000);
  if (minutes < 2) {
    return 'just now';
  }
  if (minutes < 60) {
    return `${minutes}m ago`;
  }
  const hours = Math.round(minutes / 60);
  if (hours < 48) {
    return `${hours}h ago`;
  }
  const days = Math.round(hours / 24);
  if (days < 90) {
    return `${days}d ago`;
  }
  return formatTimestamp(new Date(timestamp).toISOString());
}

function renderGallery(entries) {
  galleryGridEl.innerHTML = '';
  const mobileWall = isMobileSwipeViewport();
  state.galleryPageSize = mobileWall
    ? Math.max(getMobileLoadedLimit('gallery', entries.length), 1)
    : calculateGalleryPageSize();

  if (entries.length === 0) {
    galleryEmptyEl.classList.remove('is-hidden');
    updateGalleryFooter(0, 0, 0, 0);
    return;
  }

  galleryEmptyEl.classList.add('is-hidden');

  const pageCount = getGalleryPageCount();
  const pageIndex = Math.min(state.galleryPage, Math.max(pageCount - 1, 0));
  state.galleryPage = pageIndex;
  const startIndex = pageIndex * state.galleryPageSize;
  const pageEntries = mobileWall
    ? entries.slice(0, getMobileLoadedLimit('gallery', entries.length))
    : entries.slice(startIndex, startIndex + state.galleryPageSize);
  const masonryColumns = createGalleryMasonryColumns();

  pageEntries.forEach((entry, index) => {
    const fragment = galleryCardTemplate.content.cloneNode(true);
    const card = fragment.querySelector('.gallery-card');
    const previewButton = fragment.querySelector('.gallery-card__preview');
    const previewImg = fragment.querySelector('.gallery-card__img');
    const badge = fragment.querySelector('.gallery-card__overlay-badge');
    const number = fragment.querySelector('.gallery-card__index');
    const title = fragment.querySelector('.gallery-card__title');
    const tags = fragment.querySelector('.gallery-card__tags');
    const summary = fragment.querySelector('.gallery-card__summary');
    const noteButton = fragment.querySelector('.note-trigger--badge');

    const absoluteIndex = mobileWall ? index + 1 : startIndex + index + 1;
    card.dataset.siteId = entry.siteId;
    syncBulkRefreshMetadata(card, entry);
    wireCatalogTagDropTarget(card, entry);
    card.classList.toggle('is-selected', state.selected.has(entry.siteId));
    badge.textContent = buildDisplayTitle(entry);
    number.textContent = `#${absoluteIndex}`;
    title.textContent = buildDisplayTitle(entry);
    if (entry.url) {
      title.href = entry.url;
      title.title = `Open ${buildDisplayTitle(entry)}`;
    } else {
      title.removeAttribute('href');
      title.title = 'No public URL';
      title.classList.add('is-disabled');
    }
    summary.textContent = buildSummary(entry);
    wireNoteControl(noteButton, entry);
    renderTableTags(tags, entry);

    if (entry.url) {
      assignPreviewThumbnailImage(previewImg, getPreviewUrl(entry.siteId), `${entry.siteId} preview`, entry, {
        width: mobileWall ? 640 : 720,
        quality: mobileWall ? 72 : 76,
      });
      previewButton.addEventListener('click', () => openFullscreenPreview(entry));
    } else {
      previewButton.classList.add('is-unavailable');
      applyPreviewFallback(previewImg);
    }

    appendGalleryCardToShortestColumn(masonryColumns, fragment);
  });

  if (!state.search && getLegacyCatalogFilterToken() === 'all' && pageIndex === pageCount - 1) {
    const newCard = document.createElement('button');
    newCard.type = 'button';
    newCard.className = 'gallery-card gallery-card--new';
    newCard.innerHTML = `
      <div class="gallery-card__new-icon">
        <i class="ti ti-plus"></i>
      </div>
      <div class="gallery-card__new-copy">
        <strong>New site</strong>
        <span>Create a new site from the modal</span>
      </div>
    `;
    newCard.addEventListener('click', () => openComposerForCreate());
    appendGalleryCardToShortestColumn(masonryColumns, newCard);
  }

  updateGalleryFooter(mobileWall ? 1 : pageIndex + 1, mobileWall ? 1 : pageCount, entries.length, countRepresentedSites(entries));
}

function createGalleryMasonryColumns() {
  const metrics = getGalleryPageMetrics();
  const columnCount = metrics.cols;
  galleryViewEl?.style.setProperty('--gallery-row-count', String(metrics.rows));
  galleryViewEl?.style.setProperty('--gallery-card-body-height', `${metrics.bodyHeight}px`);
  const columns = Array.from({ length: columnCount }, () => {
    const column = document.createElement('div');
    column.className = 'showcase-grid__column';
    column.dataset.galleryLoad = '0';
    galleryGridEl.appendChild(column);
    return column;
  });
  return columns;
}

function appendGalleryCardToShortestColumn(columns, node) {
  const target = columns.reduce((shortest, column) => {
    const columnLoad = Number(column.dataset.galleryLoad || '0');
    const shortestLoad = Number(shortest.dataset.galleryLoad || '0');
    return columnLoad < shortestLoad ? column : shortest;
  }, columns[0]);
  target.appendChild(node);
  target.dataset.galleryLoad = String((Number(target.dataset.galleryLoad || '0') || 0) + 1);
}

function updateGalleryFooter(pageNumber, pageCount, totalVisible, totalSites) {
  galleryPrevButton.disabled = pageNumber <= 1;
  galleryNextButton.disabled = pageNumber >= pageCount;
  galleryPageEl.textContent = totalVisible === 0
    ? 'No pages'
    : `Page ${pageNumber} of ${pageCount}`;
  if (galleryPageSummaryEl) {
    if (totalVisible === 0) {
      galleryPageSummaryEl.textContent = 'No cards';
    } else {
      const start = state.galleryPage * state.galleryPageSize + 1;
      const end = Math.min((state.galleryPage + 1) * state.galleryPageSize, totalVisible);
      galleryPageSummaryEl.textContent = `${start.toLocaleString()}-${end.toLocaleString()} of ${totalVisible.toLocaleString()} cards (${totalSites.toLocaleString()} sites)`;
    }
  }
}

function getGalleryBroadcastHub() {
  const stored = String(localStorage.getItem(GALLERY_BROADCAST_HUB_STORAGE_KEY) || '').trim();
  return stored || GALLERY_BROADCAST_DEFAULT_HUB;
}

function getGalleryBroadcastChannel() {
  const stored = String(localStorage.getItem(GALLERY_BROADCAST_CHANNEL_STORAGE_KEY) || '').trim();
  return stored || GALLERY_BROADCAST_DEFAULT_CHANNEL;
}

function setGalleryBroadcastStatus(message = '', tone = '') {
  setTvCastStatus(message, tone);
}

function normalizeConnjureTvTarget(value, index = 0) {
  if (!value || typeof value !== 'object') {
    return null;
  }
  const channel = String(value.channel || value.channelId || value.id || '').trim();
  if (!channel) {
    return null;
  }
  const name = String(value.name || value.label || value.displayName || channel).trim() || channel;
  const hub = String(value.hub || value.hubUrl || value.url || '').trim().replace(/\/+$/, '') || getGalleryBroadcastHub().replace(/\/+$/, '');
  return {
    id: String(value.id || channel || `tv-${index}`).trim(),
    name,
    channel,
    hub,
    status: String(value.status || value.state || '').trim(),
  };
}

function getConnjureTvTargets() {
  let raw = null;
  try {
    raw = JSON.parse(localStorage.getItem(CONNJURE_TVS_STORAGE_KEY) || '[]');
  } catch {
    raw = [];
  }
  const source = Array.isArray(raw) ? raw : Array.isArray(raw?.tvs) ? raw.tvs : [];
  const seen = new Set();
  return source
    .map((item, index) => normalizeConnjureTvTarget(item, index))
    .filter((item) => {
      if (!item || seen.has(item.id)) {
        return false;
      }
      seen.add(item.id);
      return true;
    });
}

function setTvCastStatus(message = '', tone = '') {
  if (!tvCastStatusEl) {
    return;
  }
  tvCastStatusEl.textContent = message;
  tvCastStatusEl.classList.toggle('is-error', tone === 'error');
  tvCastStatusEl.classList.toggle('is-success', tone === 'success');
}

function openTvCastModal(entry = state.fullscreenEntry) {
  if (!tvCastModalEl || !entry?.siteId) {
    return false;
  }
  state.tvCastEntry = entry;
  renderTvCastModal(entry);
  tvCastModalEl.classList.remove('is-hidden');
  tvCastModalPanelEl?.focus({ preventScroll: true });
  return true;
}

function closeTvCastModal() {
  tvCastModalEl?.classList.add('is-hidden');
  state.tvCastEntry = null;
  setTvCastStatus('', '');
}

function renderTvCastModal(entry = state.tvCastEntry) {
  const tvs = getConnjureTvTargets();
  if (tvCastSiteEl) {
    tvCastSiteEl.textContent = entry?.host || entry?.siteId || '';
  }
  if (tvCastEmptyEl) {
    tvCastEmptyEl.classList.toggle('is-hidden', tvs.length > 0);
  }
  if (!tvCastListEl) {
    return;
  }
  tvCastListEl.innerHTML = '';
  tvCastListEl.classList.toggle('is-hidden', tvs.length === 0);
  for (const tv of tvs) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'tv-cast-modal__target';
    button.dataset.tvCastTarget = tv.id;
    button.innerHTML = `
      <i class="ti ti-device-tv"></i>
      <span class="tv-cast-modal__target-copy">
        <strong></strong>
        <small></small>
      </span>
    `;
    button.querySelector('strong').textContent = tv.name;
    button.querySelector('small').textContent = tv.status ? `${tv.channel} · ${tv.status}` : tv.channel;
    tvCastListEl.appendChild(button);
  }
  setTvCastStatus(tvs.length === 0 ? 'No TVs to connect to.' : '', tvs.length === 0 ? 'error' : '');
}

async function castSiteToTv(entry, tv, button = null) {
  if (!entry?.siteId || !tv?.channel) {
    setTvCastStatus('No TV selected.', 'error');
    return;
  }

  if (button) {
    button.disabled = true;
  }
  setTvCastStatus(`Connecting to ${tv.name}...`);
  let connection = null;
  try {
    await ensureSignalRClient();
    const userId = `sites-tv-cast-${Date.now().toString(36)}`;
    connection = new window.signalR.HubConnectionBuilder()
      .withUrl(`${tv.hub}/hub?channelId=${encodeURIComponent(tv.channel)}&userId=${encodeURIComponent(userId)}`, buildSignalRWebSocketOptions())
      .withAutomaticReconnect()
      .build();
    const payload = buildSiteBroadcastPayload(entry);
    await connection.start();
    await connection.invoke('SendCustomMessage', tv.channel, GALLERY_BROADCAST_TOPIC, JSON.stringify(payload));
    await waitForGalleryBroadcastFlush();
    setTvCastStatus(`Sent ${buildDisplayTitle(entry)} to ${tv.name}.`, 'success');
  } catch (error) {
    console.error('[tv-cast] failed', error);
    setTvCastStatus(error?.message || 'Could not connect to that TV.', 'error');
  } finally {
    if (connection) {
      connection.stop().catch((error) => {
        console.warn('[tv-cast] SignalR close warning', error);
      });
    }
    if (button) {
      button.disabled = false;
    }
  }
}

function buildGalleryBroadcastPayload(entries) {
  const broadcastEntries = entries.slice(0, GALLERY_BROADCAST_MAX_SITES);
  return {
    schemaVersion: 'mullmania-sites-gallery-broadcast-v1',
    source: `sites.${BASE_DOMAIN}`,
    view: 'gallery',
    url: buildGalleryBroadcastUrl(),
    generatedAt: new Date().toISOString(),
    count: broadcastEntries.length,
    totalCount: entries.length,
    truncated: entries.length > broadcastEntries.length,
    sites: broadcastEntries.map((entry, index) => ({
      index: index + 1,
      siteId: entry.siteId,
      title: buildDisplayTitle(entry),
      host: entry.host || '',
      url: entry.url || '',
      previewUrl: getPreviewUrl(entry.siteId),
      tags: getEntryCatalogTagIds(entry).map((tagId) => ({
        id: tagId,
        label: getManagedTagLabel(tagId),
      })),
    })),
  };
}

function buildSiteBroadcastPayload(entry) {
  return buildGalleryBroadcastPayload([entry]);
}

function waitForGalleryBroadcastFlush() {
  return new Promise((resolve) => window.setTimeout(resolve, 1500));
}

function buildGalleryBroadcastUrl() {
  const url = new URL(window.location.href);
  url.searchParams.set('view', 'gallery');
  if (state.search) {
    url.searchParams.set('q', state.search);
  } else {
    url.searchParams.delete('q');
  }
  return url.toString();
}

function ensureSignalRClient() {
  if (window.signalR?.HubConnectionBuilder) {
    return Promise.resolve();
  }

  const existingScript = document.querySelector('script[data-signalr-client="true"]');
  if (existingScript) {
    return new Promise((resolve, reject) => {
      existingScript.addEventListener('load', () => resolve(), { once: true });
      existingScript.addEventListener('error', () => reject(new Error('Could not load SignalR client.')), { once: true });
    });
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = SIGNALR_CLIENT_URL;
    script.async = true;
    script.dataset.signalrClient = 'true';
    script.addEventListener('load', () => resolve(), { once: true });
    script.addEventListener('error', () => reject(new Error('Could not load SignalR client.')), { once: true });
    document.head.appendChild(script);
  });
}

function buildSignalRWebSocketOptions() {
  const options = { withCredentials: false };
  if (window.signalR?.HttpTransportType?.WebSockets) {
    options.skipNegotiation = true;
    options.transport = window.signalR.HttpTransportType.WebSockets;
  }
  return options;
}

function renderWall(entries) {
  wallGridEl.innerHTML = '';

  if (entries.length === 0) {
    wallEmptyEl.classList.remove('is-hidden');
    updateWallFooter(0, 0, 0, 0);
    return;
  }

  wallEmptyEl.classList.add('is-hidden');

  const pageCount = getWallPageCount();
  const pageIndex = Math.min(state.wallPage, Math.max(pageCount - 1, 0));
  const mobileWall = isMobileSwipeViewport();
  const startIndex = mobileWall ? 0 : pageIndex * state.wallPageSize;
  const pageEntries = mobileWall
    ? entries.slice(0, getMobileLoadedLimit('wall', entries.length))
    : entries.slice(startIndex, startIndex + state.wallPageSize);

  pageEntries.forEach((entry, entryIndex) => {
    const fragment = wallCardTemplate.content.cloneNode(true);
    const card = fragment.querySelector('.wall-card');
    const frame = fragment.querySelector('.wall-card__iframe');
    const previewButton = fragment.querySelector('.wall-card__preview');
    const number = fragment.querySelector('.wall-card__index');
    const title = fragment.querySelector('.wall-card__title');
    const versionShell = fragment.querySelector('.wall-card__version-switcher');
    const versionLabel = fragment.querySelector('.wall-card__version-label');
    const versionPrevButton = fragment.querySelector('.wall-card__version-prev');
    const versionNextButton = fragment.querySelector('.wall-card__version-next');
    const host = fragment.querySelector('.wall-card__host');
    const flags = fragment.querySelector('.wall-card__flags');
    const summary = fragment.querySelector('.wall-card__summary');
    const editButton = fragment.querySelector('.wall-card__edit');
    const openButton = fragment.querySelector('.wall-card__open');

    const displayTitle = buildDisplayTitle(entry);

    card.dataset.siteId = entry.siteId;
    number.textContent = `#${(startIndex + entryIndex + 1).toLocaleString()}`;
    wireNoteControl(number, entry);
    title.textContent = displayTitle;
    host.textContent = entry.host ?? 'No public host';
    summary.textContent = buildSummary(entry);
    previewButton.setAttribute('aria-label', `Preview ${displayTitle}`);

    wireVersionSwitcher({
      shell: versionShell,
      labelEl: versionLabel,
      prevButton: versionPrevButton,
      nextButton: versionNextButton,
    }, entry);
    wireEditControl(editButton, entry);

    if (entry.url) {
      frame.src = entry.url;
      title.href = entry.url;
      openButton.href = entry.url;
      previewButton.addEventListener('click', () => openFullscreenPreview(entry));
    } else {
      frame.removeAttribute('src');
      previewButton.disabled = true;
      previewButton.classList.add('is-disabled');
      title.removeAttribute('href');
      openButton.removeAttribute('href');
      openButton.classList.add('is-disabled');
    }

    wallGridEl.appendChild(fragment);
  });

  updateWallFooter(mobileWall ? 1 : pageIndex + 1, mobileWall ? 1 : pageCount, entries.length, countRepresentedSites(entries));
}

function updateWallFooter(pageNumber, pageCount, totalVisible, totalSites) {
  if (wallPrevButton) {
    wallPrevButton.disabled = pageNumber <= 1;
  }
  if (wallNextButton) {
    wallNextButton.disabled = pageNumber >= pageCount;
  }
  if (wallPageEl) {
    wallPageEl.textContent = totalVisible === 0 ? 'No pages' : `Page ${pageNumber} of ${pageCount}`;
  }
  if (wallPageSummaryEl) {
    if (totalVisible === 0) {
      wallPageSummaryEl.textContent = 'No tiles';
    } else {
      const start = state.wallPage * state.wallPageSize + 1;
      const end = Math.min((state.wallPage + 1) * state.wallPageSize, totalVisible);
      wallPageSummaryEl.textContent = `${start.toLocaleString()}-${end.toLocaleString()} of ${totalVisible.toLocaleString()} tiles (${totalSites.toLocaleString()} sites)`;
    }
  }
}

function getTvEntries() {
  return state.visibleEntries
    .filter((entry) => Boolean(resolveViewerMedia(entry)))
    .sort(compareTvEntries);
}

function compareTvEntries(left, right) {
  const showcaseDelta = (right.showcaseRank ?? 0) - (left.showcaseRank ?? 0);
  if (showcaseDelta !== 0) {
    return showcaseDelta;
  }
  return compareEntries(left, right);
}

function clampTvIndex() {
  const entries = getTvEntries();
  if (entries.length === 0) {
    state.tvIndex = 0;
    state.tvPage = 0;
    return;
  }
  state.tvIndex = Math.max(0, Math.min(state.tvIndex, entries.length - 1));
}

function ensureTvPageContainsIndex(entries = getTvEntries()) {
  if (entries.length === 0) {
    state.tvPage = 0;
    return;
  }
  clampTvPage(entries);
  const page = buildFixedPage(entries.length, state.tvPage, TV_QUEUE_PAGE_SIZE);
  if (state.tvIndex < page.start || state.tvIndex >= page.end) {
    state.tvPage = Math.min(Math.floor(state.tvIndex / TV_QUEUE_PAGE_SIZE), getTvPageCount(entries) - 1);
  }
}

function getCurrentTvEntry() {
  const entries = getTvEntries();
  if (entries.length === 0) {
    return null;
  }
  clampTvIndex();
  return entries[state.tvIndex] ?? null;
}

function navigateTv(delta) {
  const entries = getTvEntries();
  if (entries.length <= 1) {
    return;
  }
  state.tvIndex = (state.tvIndex + delta + entries.length) % entries.length;
  ensureTvPageContainsIndex(entries);
  render();
}

function openShowcaseSlideshow() {
  const entry = getCurrentTvEntry();
  if (!entry) {
    return;
  }
  state.slideshowCurrentSiteId = entry.siteId;
  setViewMode('slideshow');
}

function navigateTvPage(delta) {
  const entries = getTvEntries();
  if (entries.length === 0) {
    return;
  }
  clampTvIndex();
  clampTvPage(entries);
  const nextPage = Math.max(0, Math.min(state.tvPage + delta, getTvPageCount(entries) - 1));
  if (nextPage === state.tvPage) {
    return;
  }
  state.tvPage = nextPage;
  state.tvIndex = buildFixedPage(entries.length, state.tvPage, TV_QUEUE_PAGE_SIZE).start;
  render();
}

function getSlideshowMediaCandidates(entry) {
  const candidates = [];
  const pushCandidate = (src, alt, label) => {
    const resolvedSrc = resolvePreviewAssetUrl(src);
    if (!resolvedSrc || state.slideshowBrokenMedia.has(resolvedSrc)) {
      return;
    }
    if (candidates.some((candidate) => candidate.src === resolvedSrc)) {
      return;
    }
    candidates.push({
      kind: 'image',
      src: resolvedSrc,
      alt,
      label,
    });
  };

  const previewUrl = getPreviewUrl(entry?.siteId);
  if (previewUrl) {
    pushCandidate(previewUrl, `${buildDisplayTitle(entry)} cached screenshot`, 'Screenshot');
  }

  const posterUrl = resolvePosterUrl(entry);
  if (posterUrl) {
    pushCandidate(posterUrl, `${buildDisplayTitle(entry)} poster image`, 'Poster');
  }

  const demoSource = resolveDemoSource(entry);
  if (demoSource?.src && !String(demoSource.type || '').startsWith('video/')) {
    pushCandidate(demoSource.src, `${buildDisplayTitle(entry)} poster image`, 'Poster');
  }

  return candidates;
}

function resolveSlideshowMedia(entry) {
  return getSlideshowMediaCandidates(entry)[0] || null;
}

function getSlideshowEntries() {
  const entries = buildDisplayEntries(
    state.entries
      .filter(matchesSearch)
      .sort(compareEntries)
  ).filter((entry) => Boolean(resolveSlideshowMedia(entry)));

  if (state.slideshowScope === SLIDESHOW_SCOPE_TOP_50) {
    return entries.slice(0, SLIDESHOW_TOP_LIMIT);
  }

  return entries;
}

function getActiveSlideshowSiteId() {
  return state.slideshowController?.currentItem?.()?.id || '';
}

function getCurrentSlideshowEntry() {
  const currentSiteId = getActiveSlideshowSiteId();
  if (!currentSiteId) return null;
  return state.entries.find((entry) => entry.siteId === currentSiteId) || null;
}

function buildSlideshowSignature(entries) {
  return entries
    .map((entry) => `${entry.siteId}:${resolveSlideshowMedia(entry)?.src || ''}`)
    .sort()
    .join('|');
}

function shuffleSlideshowQueue(entries, excludeSiteId = '') {
  const queue = entries
    .map((entry) => entry.siteId)
    .filter((siteId) => siteId && siteId !== excludeSiteId);

  for (let index = queue.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [queue[index], queue[swapIndex]] = [queue[swapIndex], queue[index]];
  }

  return queue;
}

// ============================================================
// SLIDESHOW VIEW — canon UI.Screensaver adapter
// ============================================================
// This module owns building items from state.entries, the rank-badge overlay
// hook, top-50 scope toggling, voting via keyboard, and the navigation-mode
// cycle. The UI.Screensaver canon component owns layer crossfade, motion
// drift, image preload + recovery, position chip, eyebrow chip, mode flash,
// and chrome auto-hide. See ui.mullmania.com/js/screensaver.js.

function buildSlideshowItemForEntry(entry) {
  const candidates = getSlideshowMediaCandidates(entry);
  if (candidates.length === 0) return null;
  const titleParts = buildSlideshowTitleParts(entry);
  return {
    id: entry.siteId,
    src: candidates[0].src,
    sources: candidates,
    alt: candidates[0].alt,
    title: titleParts.title,
    suffix: titleParts.suffix,
    eyebrow: pickSlideshowEyebrow(entry),
    motion: pickSlideshowMotion(entry),
  };
}

function buildSlideshowItems() {
  return getSlideshowEntries().map(buildSlideshowItemForEntry).filter(Boolean);
}

function buildSlideshowAriaLabel(entry) {
  if (!entry) return 'No slideshow preview available';
  const displayTitle = buildDisplayTitle(entry);
  const currentMode = formatSlideshowNavigationLabel();
  return `Showing ${displayTitle}. Use Left and Right to change sites, Up and Down to rank it, and Enter to cycle Random, Sorted, and Top 50. Current mode: ${currentMode}.`;
}

function attachSlideshowController() {
  if (!slideshowViewEl) return;
  if (!window.UI?.Screensaver?.attach) {
    if (!state.slideshowControllerPending && window.UI?.ready) {
      state.slideshowControllerPending = true;
      window.UI.ready().then(() => {
        state.slideshowControllerPending = false;
        if (state.viewMode === 'slideshow') {
          syncSlideshowController();
        }
      }).catch(() => {
        state.slideshowControllerPending = false;
      });
    }
    return;
  }
  state.slideshowControllerPending = false;
  const items = buildSlideshowItems();
  state.slideshowController = window.UI.Screensaver.attach(slideshowViewEl, {
    items,
    label: 'Slideshow stage',
    emptyText: 'No preview images match the current search.',
    emptyIcon: 'ti ti-photo-off',
    chromeRoot: document.body,
    chromeHideDelayMs: SLIDESHOW_CHROME_HIDE_DELAY_MS,
    intervalMs: SLIDESHOW_INTERVAL_MS,
    flashDurationMs: SLIDESHOW_FLASH_DURATION_MS,
    playbackMode: state.slideshowPlaybackMode,
    onItemChange: (item) => {
      const entry = state.entries.find((e) => e.siteId === item?.id) || null;
      ensureSlideshowRankBadgeEl();
      updateSlideshowRankBadge(entry);
      const stage = slideshowViewEl?.querySelector('.screensaver-stage');
      if (stage) stage.setAttribute('aria-label', buildSlideshowAriaLabel(entry));
    },
  });
  ensureSlideshowRankBadgeEl();
  const startSiteId = state.slideshowCurrentSiteId || '';
  const startIndex = startSiteId
    ? items.findIndex((item) => item?.id === startSiteId)
    : -1;
  if (startIndex >= 0 && typeof state.slideshowController?.showIndex === 'function') {
    state.slideshowController.showIndex(startIndex, { immediate: true });
  }
}

// Sites injects an additional "manual rank" chip into the canon's meta row.
// We can't ask the canon to render this directly (rank semantics are
// sites-specific), so we splice the chip in once the canon has built its DOM.
function ensureSlideshowRankBadgeEl() {
  if (!slideshowViewEl) return;
  let chip = slideshowViewEl.querySelector('#slideshow-rank-badge');
  if (chip) return;
  const meta = slideshowViewEl.querySelector('.screensaver-stage__meta');
  if (!meta) return;
  chip = document.createElement('div');
  chip.id = 'slideshow-rank-badge';
  chip.className = 'screensaver-stage__rank screensaver-stage__chip is-hidden';
  // Insert right after the eyebrow (matches the original sites layout).
  const positionChip = meta.querySelector('.screensaver-stage__position');
  if (positionChip) meta.insertBefore(chip, positionChip);
  else meta.appendChild(chip);
}

function destroySlideshowController() {
  if (!state.slideshowController) return;
  try { state.slideshowController.destroy(); } catch {}
  state.slideshowController = null;
  document.body.classList.remove('is-screensaver-chrome-hidden');
  updateSlideshowRankBadge(null);
}

function syncSlideshowController() {
  if (state.viewMode !== 'slideshow') {
    destroySlideshowController();
    return;
  }
  if (!state.slideshowController) {
    attachSlideshowController();
    return;
  }
  state.slideshowController.setItems(buildSlideshowItems());
  if (state.slideshowController.getPlaybackMode() !== state.slideshowPlaybackMode) {
    state.slideshowController.setPlaybackMode(state.slideshowPlaybackMode);
  }
  // Pause whenever the fullscreen modal is open; resume when it closes.
  if (fullscreenModalEl && !fullscreenModalEl.classList.contains('is-hidden')) {
    state.slideshowController.pause();
  } else {
    state.slideshowController.play();
  }
}

// ── Compat shims for the existing call sites in this file ────────────────
// Keeps every legacy entry point working while routing through the canon.

function stopSlideshowPlayback() {
  state.slideshowController?.pause();
}

// Chrome auto-hide is owned by the UI.Screensaver canon (chromeRoot mirror).
// Stubs remain so existing call sites keep working without refactor churn.
function clearSlideshowChromeHideTimer() {}
function canAutoHideSlideshowChrome() { return false; }
function scheduleSlideshowChromeHide() {}
function hideSlideshowChromeImmediately() {
  if (state.viewMode === 'slideshow') {
    document.body.classList.add('is-screensaver-chrome-hidden');
  }
}
function revealSlideshowChrome() {
  document.body.classList.remove('is-screensaver-chrome-hidden');
}
function syncSlideshowChromeAutoHide() {}

function isSharedUiRuntimeEntry(entry) {
  return Boolean(entry?.categories?.sharedUiRuntime);
}

function pickSlideshowMotion(entry) {
  const pool = isSharedUiRuntimeEntry(entry) ? SLIDESHOW_MOTION_SHARED_UI : SLIDESHOW_MOTION_DEFAULT;
  return pool[Math.floor(Math.random() * pool.length)] || pool[0];
}

// Motion + media preload + image-error recovery are owned by UI.Screensaver.
// These stubs keep external call sites compiling but defer to the canon.
function applySlideshowMotion() {}
function preloadSlideshowSrc() { return Promise.resolve(); }
function prepareSlideshowMedia() { return Promise.resolve(null); }
function markSlideshowMediaBroken() { return false; }
function handleSlideshowImageError() {}
function recoverSlideshowImageError() { return Promise.resolve(); }

function getCurrentSlideshowEntryIndex(entries = getSlideshowEntries()) {
  const currentSiteId = getActiveSlideshowSiteId();
  if (!currentSiteId) {
    return -1;
  }
  return entries.findIndex((entry) => entry.siteId === currentSiteId);
}

function formatSlideshowPosition(index, total) {
  const width = Math.max(2, String(Math.max(total, 1)).length);
  return `${String(index + 1).padStart(width, '0')} / ${String(total).padStart(width, '0')}`;
}

function formatSlideshowPlaybackLabel(mode = state.slideshowPlaybackMode) {
  return mode === SLIDESHOW_PLAYBACK_SEQUENTIAL ? 'Sorted' : 'Random';
}

function formatSlideshowScopeLabel(scope = state.slideshowScope) {
  return scope === SLIDESHOW_SCOPE_TOP_50 ? 'Top 50' : 'All Sites';
}

function getSlideshowNavigationMode() {
  if (state.slideshowScope === SLIDESHOW_SCOPE_TOP_50) {
    return SLIDESHOW_NAV_TOP_50;
  }
  return state.slideshowPlaybackMode === SLIDESHOW_PLAYBACK_SEQUENTIAL
    ? SLIDESHOW_NAV_SORTED
    : SLIDESHOW_NAV_RANDOM;
}

function formatSlideshowNavigationLabel(mode = getSlideshowNavigationMode()) {
  if (mode === SLIDESHOW_NAV_TOP_50) {
    return 'Top 50';
  }
  return mode === SLIDESHOW_NAV_SORTED ? 'Sorted' : 'Random';
}

// Mode flash is owned by UI.Screensaver (controller.flash).
function clearSlideshowModeFlash() {}
function flashSlideshowMode(message) {
  state.slideshowController?.flash?.(message);
}

function setSlideshowNavigationMode(nextMode, options = {}) {
  const normalized = nextMode === SLIDESHOW_NAV_TOP_50
    ? SLIDESHOW_NAV_TOP_50
    : nextMode === SLIDESHOW_NAV_SORTED
      ? SLIDESHOW_NAV_SORTED
      : SLIDESHOW_NAV_RANDOM;

  const nextPlaybackMode = normalized === SLIDESHOW_NAV_RANDOM
    ? SLIDESHOW_PLAYBACK_RANDOM
    : SLIDESHOW_PLAYBACK_SEQUENTIAL;
  const nextScope = normalized === SLIDESHOW_NAV_TOP_50
    ? SLIDESHOW_SCOPE_TOP_50
    : SLIDESHOW_SCOPE_ALL;

  if (state.slideshowPlaybackMode === nextPlaybackMode && state.slideshowScope === nextScope) {
    if (options.flash) {
      flashSlideshowMode(formatSlideshowNavigationLabel(normalized));
    }
    return;
  }

  state.slideshowPlaybackMode = nextPlaybackMode;
  state.slideshowScope = nextScope;
  render();
  if (options.flash) {
    flashSlideshowMode(formatSlideshowNavigationLabel(normalized));
  }
}

function cycleSlideshowNavigationMode() {
  const currentMode = getSlideshowNavigationMode();
  const nextMode = currentMode === SLIDESHOW_NAV_RANDOM
    ? SLIDESHOW_NAV_SORTED
    : currentMode === SLIDESHOW_NAV_SORTED
      ? SLIDESHOW_NAV_TOP_50
      : SLIDESHOW_NAV_RANDOM;
  setSlideshowNavigationMode(nextMode, { flash: true });
}

function formatSlideshowDescriptorTag(value) {
  const normalized = normalizeCatalogToken(value);
  if (!normalized) {
    return '';
  }

  const label = humanizeToken(normalized);
  return label
    .replace(/\bAi\b/g, 'AI')
    .replace(/\bApi\b/g, 'API')
    .replace(/\bAws\b/g, 'AWS')
    .replace(/\bChatgpt\b/g, 'ChatGPT')
    .replace(/\bCss\b/g, 'CSS')
    .replace(/\bCsv\b/g, 'CSV')
    .replace(/\bGithub\b/g, 'GitHub')
    .replace(/\bHtml\b/g, 'HTML')
    .replace(/\bJs\b/g, 'JS')
    .replace(/\bJson\b/g, 'JSON')
    .replace(/\bMcp\b/g, 'MCP')
    .replace(/\bS3\b/g, 'S3')
    .replace(/\bTv\b/g, 'TV')
    .replace(/\bUi\b/g, 'UI');
}

function collectSlideshowDescriptorTags(entry) {
  const labels = new Set();

  for (const tag of entry?.tags ?? []) {
    const normalized = normalizeCatalogToken(tag);
    if (
      !normalized
      || isFrameworkMetaTag(normalized)
      || normalized === 'csv-loaded'
      || normalized === 'packages-hub'
      || normalized.startsWith('shared-ui-')
    ) {
      continue;
    }

    const label = formatSlideshowDescriptorTag(normalized);
    if (label) {
      labels.add(label);
    }
  }

  if (entry?.categories?.sharedUiRuntime) {
    labels.add(getCatalogTagLabel('shared-ui'));
  }
  if (entry?.categories?.framework) {
    labels.add(getCatalogTagLabel('framework'));
  }
  if (entry?.githubBacked) {
    labels.add(getCatalogTagLabel('github'));
  }
  if (entry?.categories?.anchor) {
    labels.add(getCatalogTagLabel('anchors'));
  }
  if (entry?.categories?.curated) {
    labels.add(getCatalogTagLabel('curated'));
  }
  if (entry?.categories?.data) {
    labels.add(getCatalogTagLabel('data'));
  }

  return Array.from(labels);
}

function pickSlideshowEyebrow(entry) {
  const labels = collectSlideshowDescriptorTags(entry);
  if (labels.length === 0) {
    return 'Hosted Site';
  }

  const baseSeed = hashReelSeed(entry?.siteId || entry?.host || buildDisplayTitle(entry));
  const ordered = labels
    .slice()
    .sort((left, right) => {
      const delta = hashReelSeed(`${entry?.siteId}:${left}`) - hashReelSeed(`${entry?.siteId}:${right}`);
      return delta !== 0 ? delta : left.localeCompare(right);
    });
  const count = ordered.length > 1 && (baseSeed % 3 !== 0) ? 2 : 1;
  return ordered.slice(0, Math.min(count, ordered.length)).join(' · ');
}

function buildSlideshowTitleParts(entry) {
  const fallbackTitle = buildDisplayTitle(entry);
  const host = String(entry?.host || '').trim();
  const href = resolveEntryUrl(entry) || '';
  if (!host) {
    return {
      title: fallbackTitle,
      suffix: '',
      href,
    };
  }

  const dotIndex = host.indexOf('.');
  if (dotIndex > 0 && dotIndex < host.length - 1) {
    return {
      title: host.slice(0, dotIndex) || fallbackTitle,
      suffix: host.slice(dotIndex),
      href,
    };
  }

  return {
    title: fallbackTitle,
    suffix: '',
    href,
  };
}

function splitSlideshowTitleTail(title) {
  const normalizedTitle = String(title || '').trim();
  if (!normalizedTitle) {
    return {
      lead: '',
      tail: '',
    };
  }

  const lastHyphenIndex = normalizedTitle.lastIndexOf('-');
  if (lastHyphenIndex > 0 && lastHyphenIndex < normalizedTitle.length - 1) {
    return {
      lead: normalizedTitle.slice(0, lastHyphenIndex + 1),
      tail: normalizedTitle.slice(lastHyphenIndex + 1),
    };
  }

  const lastSpaceIndex = normalizedTitle.lastIndexOf(' ');
  if (lastSpaceIndex > 0 && lastSpaceIndex < normalizedTitle.length - 1) {
    return {
      lead: `${normalizedTitle.slice(0, lastSpaceIndex)} `,
      tail: normalizedTitle.slice(lastSpaceIndex + 1),
    };
  }

  return {
    lead: '',
    tail: normalizedTitle,
  };
}

// Queue + picker + populate + show are owned by UI.Screensaver.
function peekRandomSlideshowEntry() { return null; }
function primeUpcomingSlideshowMedia() {}
function updateSlideshowOverlay() {}
function setSlideshowStageMetadata() {}
function rebuildRandomSlideshowQueue() {}
function pickRandomSlideshowEntry(entries) { return entries?.[0] || null; }
function pickSequentialSlideshowEntry(entries) { return entries?.[0] || null; }
function populateSlideshowSlide() { return false; }
function showSlideshowEntry() { return Promise.resolve(false); }

function setSlideshowPlaybackMode(nextMode) {
  const normalized = nextMode === SLIDESHOW_PLAYBACK_SEQUENTIAL
    ? SLIDESHOW_PLAYBACK_SEQUENTIAL
    : SLIDESHOW_PLAYBACK_RANDOM;
  if (state.slideshowPlaybackMode === normalized) {
    return;
  }
  state.slideshowPlaybackMode = normalized;
  syncSlideshowPlayback();
}

function toggleSlideshowPlaybackMode() {
  setSlideshowPlaybackMode(
    state.slideshowPlaybackMode === SLIDESHOW_PLAYBACK_RANDOM
      ? SLIDESHOW_PLAYBACK_SEQUENTIAL
      : SLIDESHOW_PLAYBACK_RANDOM
  );
}

function setSlideshowScope(nextScope) {
  const normalized = nextScope === SLIDESHOW_SCOPE_TOP_50
    ? SLIDESHOW_SCOPE_TOP_50
    : SLIDESHOW_SCOPE_ALL;
  if (state.slideshowScope === normalized) {
    return;
  }
  state.slideshowScope = normalized;
  render();
}

function toggleSlideshowScope() {
  setSlideshowScope(
    state.slideshowScope === SLIDESHOW_SCOPE_TOP_50
      ? SLIDESHOW_SCOPE_ALL
      : SLIDESHOW_SCOPE_TOP_50
  );
}

// Navigate / advance / playback / render are routed through the canon controller.
async function navigateSlideshow(direction) {
  if (!state.slideshowController) return;
  if (direction < 0) await state.slideshowController.previous();
  else await state.slideshowController.next();
}

async function advanceSlideshow() {
  if (!state.slideshowController?.advance) return;
  await state.slideshowController.advance();
}

function syncSlideshowPlayback() {
  syncSlideshowController();
}

function renderSlideshowView() {
  syncSlideshowController();
}

function resolveDemoSource(entry) {
  const sources = Array.isArray(entry?.demo?.sources) ? entry.demo.sources : [];
  let fallback = null;
  for (const source of sources) {
    if (!source?.src) {
      continue;
    }
    if (source.type.startsWith('video/')) {
      return source;
    }
    if (!fallback) {
      fallback = source;
    }
  }
  return fallback;
}

function resolveViewerMedia(entry) {
  const demoSource = resolveDemoSource(entry);
  if (demoSource?.src) {
    if (demoSource.type.startsWith('video/')) {
      return {
        kind: 'video',
        src: demoSource.src,
        poster: resolvePosterUrl(entry),
        label: 'Demo',
        durationSec: entry.demo?.durationSec ?? null,
      };
    }
    return {
      kind: 'image',
      src: demoSource.src,
      poster: '',
      label: 'Poster',
      durationSec: entry.demo?.durationSec ?? null,
    };
  }

  const posterUrl = resolvePosterUrl(entry);
  if (posterUrl) {
    return {
      kind: 'image',
      src: posterUrl,
      poster: '',
      label: 'Poster',
      durationSec: entry.demo?.durationSec ?? null,
    };
  }

  if (entry?.url) {
    return {
      kind: 'iframe',
      src: entry.url,
      poster: '',
      label: 'Live',
      durationSec: null,
    };
  }

  return null;
}

function resolveFullscreenPreviewMedia(entry) {
  const screenshots = getPreviewScreenshots(entry?.siteId);
  if (screenshots.length > 0) {
    const screenshot = screenshots[0];
    return {
      kind: 'image',
      src: screenshot.url,
      poster: '',
      label: screenshot.label || screenshot.style || 'Snapshot',
      alt: `${buildDisplayTitle(entry)} cached snapshot`,
      screenshot,
    };
  }

  const previewUrl = getPreviewUrl(entry?.siteId);
  if (previewUrl) {
    return {
      kind: 'image',
      src: previewUrl,
      poster: '',
      label: 'Snapshot',
      alt: `${buildDisplayTitle(entry)} cached snapshot`,
    };
  }

  const posterUrl = resolvePosterUrl(entry);
  if (posterUrl) {
    return {
      kind: 'image',
      src: posterUrl,
      poster: '',
      label: 'Poster',
      alt: `${buildDisplayTitle(entry)} poster image`,
    };
  }

  const demoSource = resolveDemoSource(entry);
  if (demoSource?.src && !demoSource.type.startsWith('video/')) {
    return {
      kind: 'image',
      src: demoSource.src,
      poster: '',
      label: 'Poster',
      alt: `${buildDisplayTitle(entry)} poster image`,
    };
  }

  return {
    kind: 'image',
    src: PREVIEW_PLACEHOLDER_URL,
    poster: '',
    label: 'Preview unavailable',
    alt: `${buildDisplayTitle(entry)} preview unavailable`,
  };
}

function resolveFullscreenImageCarouselItems(entry, media = resolveFullscreenPreviewMedia(entry)) {
  if (media?.kind !== 'image' || !media.src) {
    return [];
  }

  const screenshots = getPreviewScreenshots(entry?.siteId);
  if (screenshots.length > 0) {
    return screenshots.map((screenshot, index) => ({
      id: `${entry?.siteId || 'site'}:screenshot:${screenshot.version || index}`,
      src: screenshot.url,
      alt: `${buildDisplayTitle(entry)} ${screenshot.label || `screenshot ${index + 1}`}`,
      label: screenshot.label || screenshot.style || screenshot.capturedAt || `Screenshot ${index + 1}`,
      entry,
      screenshot,
    }));
  }

  return getPreviewStackEntries(entry).map((stackEntry, index) => {
    const stackMedia = resolveFullscreenPreviewMedia(stackEntry);
    return {
      id: `${stackEntry?.siteId || entry?.siteId || 'site'}:${index}`,
      src: stackMedia?.src || PREVIEW_PLACEHOLDER_URL,
      alt: stackMedia?.alt || `${buildDisplayTitle(stackEntry)} preview image`,
      label: stackMedia?.label || buildDisplayTitle(stackEntry) || 'Preview',
      entry: stackEntry,
    };
  });
}

function normalizeFullscreenImageCarouselIndex(index, items) {
  const length = Array.isArray(items) ? items.length : 0;
  if (length <= 0) {
    return 0;
  }
  return ((Number(index) || 0) % length + length) % length;
}

function getFullscreenImageCarouselWindow(items, activeIndex = state.fullscreenImageCarouselIndex) {
  if (!Array.isArray(items) || items.length === 0) {
    return null;
  }

  const centerIndex = normalizeFullscreenImageCarouselIndex(activeIndex, items);
  const leftIndex = normalizeFullscreenImageCarouselIndex(centerIndex - 1, items);
  const rightIndex = normalizeFullscreenImageCarouselIndex(centerIndex + 1, items);

  return {
    left: { index: leftIndex, item: items[leftIndex] },
    center: { index: centerIndex, item: items[centerIndex] },
    right: { index: rightIndex, item: items[rightIndex] },
  };
}

function clearFullscreenImageCard(imageEl) {
  if (!(imageEl instanceof HTMLImageElement)) {
    return;
  }

  imageEl.removeAttribute('src');
  imageEl.alt = '';
  delete imageEl.dataset.previewSiteId;
  delete imageEl.dataset.previewSourceSiteId;
  imageEl.classList.add('is-hidden');
}

function applyFullscreenImageCard(imageEl, item) {
  if (!(imageEl instanceof HTMLImageElement)) {
    return;
  }

  if (!item?.src) {
    clearFullscreenImageCard(imageEl);
    return;
  }

  const resolvedSrc = resolvePreviewAssetUrl(item.src);
  if (imageEl.getAttribute('src') !== resolvedSrc) {
    imageEl.src = resolvedSrc;
  }
  imageEl.alt = item.alt || '';
  imageEl.dataset.previewSiteId = item.entry?.siteId || '';
  imageEl.dataset.previewSourceSiteId = item.entry?.sourceSiteId || item.entry?.siteId || '';
  imageEl.classList.remove('is-hidden');
}

function clearFullscreenImageCarousel() {
  if (fullscreenImageShellEl) {
    fullscreenImageShellEl.classList.add('is-hidden');
    fullscreenImageShellEl.classList.remove('is-single-preview');
  }
  if (fullscreenImageLeftCardEl) {
    fullscreenImageLeftCardEl.disabled = false;
    fullscreenImageLeftCardEl.removeAttribute('aria-hidden');
  }
  if (fullscreenImageRightCardEl) {
    fullscreenImageRightCardEl.disabled = false;
    fullscreenImageRightCardEl.removeAttribute('aria-hidden');
  }
  clearFullscreenImageCard(fullscreenImageLeftEl);
  clearFullscreenImageCard(fullscreenImageEl);
  clearFullscreenImageCard(fullscreenImageRightEl);
}

function renderFullscreenImageCarousel(entry, media) {
  const items = resolveFullscreenImageCarouselItems(entry, media);
  if (items.length === 0) {
    clearFullscreenImageCarousel();
    return null;
  }

  const singlePreview = items.length === 1;
  const windowItems = getFullscreenImageCarouselWindow(items);
  const leftItem = singlePreview ? null : windowItems.left.item;
  const centerItem = singlePreview ? items[0] : windowItems.center.item;
  const rightItem = singlePreview ? null : windowItems.right.item;

  if (leftItem) {
    applyFullscreenImageCard(fullscreenImageLeftEl, leftItem);
  } else {
    clearFullscreenImageCard(fullscreenImageLeftEl);
  }
  applyFullscreenImageCard(fullscreenImageEl, centerItem);
  if (rightItem) {
    applyFullscreenImageCard(fullscreenImageRightEl, rightItem);
  } else {
    clearFullscreenImageCard(fullscreenImageRightEl);
  }

  if (fullscreenImageLeftCardEl) {
    fullscreenImageLeftCardEl.disabled = !leftItem;
    fullscreenImageLeftCardEl.setAttribute('aria-hidden', leftItem ? 'false' : 'true');
    fullscreenImageLeftCardEl.setAttribute(
      'aria-label',
      leftItem ? `Show ${leftItem.label || 'previous preview image'}` : 'Previous preview image unavailable'
    );
  }
  if (fullscreenImageRightCardEl) {
    fullscreenImageRightCardEl.disabled = !rightItem;
    fullscreenImageRightCardEl.setAttribute('aria-hidden', rightItem ? 'false' : 'true');
    fullscreenImageRightCardEl.setAttribute(
      'aria-label',
      rightItem ? `Show ${rightItem.label || 'next preview image'}` : 'Next preview image unavailable'
    );
  }
  if (fullscreenImageShellEl) {
    fullscreenImageShellEl.classList.toggle('is-single-preview', singlePreview);
    fullscreenImageShellEl.classList.remove('is-hidden');
  }

  return centerItem;
}

function clearViewerMedia({ videoEl, imageEl, frameEl, frameShellEl }) {
  if (videoEl) {
    videoEl.pause?.();
    videoEl.removeAttribute('src');
    videoEl.removeAttribute('poster');
    videoEl.load?.();
    videoEl.classList.add('is-hidden');
  }
  if (imageEl) {
    imageEl.removeAttribute('src');
    imageEl.alt = '';
    imageEl.classList.add('is-hidden');
  }
  if (frameEl) {
    frameEl.removeAttribute('srcdoc');
    frameEl.src = '';
    frameEl.classList.add('is-hidden');
  }
  if (frameShellEl) {
    frameShellEl.classList.add('is-hidden');
  }
}

function renderViewerMedia({ videoEl, imageEl, frameEl, frameShellEl }, entry) {
  const media = entry?.__fullscreenMedia || resolveViewerMedia(entry);
  if (!media) {
    clearViewerMedia({ videoEl, imageEl, frameEl, frameShellEl });
    return null;
  }

  if (media.kind === 'video') {
    if (imageEl) {
      imageEl.removeAttribute('src');
      imageEl.alt = '';
      imageEl.classList.add('is-hidden');
    }
    if (frameEl) {
      frameEl.removeAttribute('srcdoc');
      frameEl.src = '';
      frameEl.classList.add('is-hidden');
    }
    if (frameShellEl) {
      frameShellEl.classList.add('is-hidden');
    }
    if (videoEl) {
      if (videoEl.src !== media.src) {
        videoEl.src = media.src;
      }
      if (media.poster) {
        videoEl.poster = media.poster;
      } else {
        videoEl.removeAttribute('poster');
      }
      videoEl.classList.remove('is-hidden');
    }
    return media;
  }

  if (media.kind === 'image') {
    if (videoEl) {
      videoEl.pause?.();
      videoEl.removeAttribute('src');
      videoEl.removeAttribute('poster');
      videoEl.load?.();
      videoEl.classList.add('is-hidden');
    }
    if (frameEl) {
      frameEl.removeAttribute('srcdoc');
      frameEl.src = '';
      frameEl.classList.add('is-hidden');
    }
    if (frameShellEl) {
      frameShellEl.classList.add('is-hidden');
    }
    if (imageEl) {
      if (imageEl.src !== media.src) {
        imageEl.src = media.src;
      }
      imageEl.alt = media.alt || `${buildDisplayTitle(entry)} preview image`;
      imageEl.classList.remove('is-hidden');
    }
    return media;
  }

  if (videoEl) {
    videoEl.pause?.();
    videoEl.removeAttribute('src');
    videoEl.removeAttribute('poster');
    videoEl.load?.();
    videoEl.classList.add('is-hidden');
  }
  if (imageEl) {
    imageEl.removeAttribute('src');
    imageEl.alt = '';
    imageEl.classList.add('is-hidden');
  }
  if (frameEl) {
    frameEl.removeAttribute('srcdoc');
    const currentSrc = frameEl.getAttribute('src') || '';
    if (currentSrc !== media.src) {
      frameEl.src = media.src;
    }
    frameEl.classList.remove('is-hidden');
  }
  if (frameShellEl) {
    frameShellEl.classList.remove('is-hidden');
  }
  return media;
}

function shiftFullscreenImageCarousel(delta) {
  const entry = state.fullscreenEntry;
  if (!entry || state.fullscreenMode !== 'preview') {
    return;
  }

  const media = resolveFullscreenStageMedia(entry);
  const items = resolveFullscreenImageCarouselItems(entry, media);
  if (items.length < 2) {
    return;
  }
  state.fullscreenImageCarouselIndex = normalizeFullscreenImageCarouselIndex(
    state.fullscreenImageCarouselIndex + (Number.isFinite(delta) && delta < 0 ? -1 : 1),
    items
  );
  renderFullscreenImageCarousel(entry, media);
}

function formatDemoDuration(value) {
  const durationSec = Number(value);
  if (!Number.isFinite(durationSec) || durationSec <= 0) {
    return '';
  }

  const totalSeconds = Math.round(durationSec);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

function hashReelSeed(value) {
  let result = 0;
  for (const char of String(value || '')) {
    result = ((result << 5) - result) + char.charCodeAt(0);
    result |= 0;
  }
  return Math.abs(result);
}

function getReelAccent(entry) {
  const seed = hashReelSeed(entry?.displayEntryKey || entry?.family?.id || entry?.siteId || '');
  return REEL_PALETTE[seed % REEL_PALETTE.length];
}

function getReelSecondaryAccent(entry) {
  const seed = hashReelSeed(entry?.siteId || '');
  return REEL_PALETTE[(seed + 2) % REEL_PALETTE.length];
}

function mutedReelColor(color, alpha = 0.18) {
  const hex = String(color || '').replace('#', '');
  if (hex.length !== 6) {
    return `rgba(10, 110, 203, ${alpha})`;
  }
  const r = Number.parseInt(hex.slice(0, 2), 16);
  const g = Number.parseInt(hex.slice(2, 4), 16);
  const b = Number.parseInt(hex.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function canExportReels() {
  return Boolean(tvExportCanvasEl?.captureStream && window.MediaRecorder);
}

function resolveTvReelSource(entry) {
  const explicitSource = resolvePosterUrl(entry) || getPreviewUrl(entry?.siteId);
  if (!explicitSource) {
    return PREVIEW_PLACEHOLDER_URL;
  }

  if (explicitSource.startsWith('data:')) {
    return explicitSource;
  }

  try {
    const url = new URL(explicitSource, window.location.href);
    return url.origin === window.location.origin ? url.toString() : PREVIEW_PLACEHOLDER_URL;
  } catch {
    return PREVIEW_PLACEHOLDER_URL;
  }
}

async function loadReelImage(sourceUrl) {
  const src = String(sourceUrl || '').trim();
  if (!src) {
    return null;
  }

  const cached = reelImageCache.get(src);
  if (cached) {
    return cached;
  }

  const image = new Image();
  image.decoding = 'async';
  if (!src.startsWith('data:')) {
    image.crossOrigin = 'anonymous';
  }

  const pending = new Promise((resolve) => {
    image.addEventListener('load', () => resolve(image), { once: true });
    image.addEventListener('error', () => resolve(null), { once: true });
  });
  image.src = src;
  reelImageCache.set(src, pending);
  return pending;
}

function wrapReelText(ctx, text, x, y, maxWidth, lineHeight, maxLines = 3, fromBottom = false) {
  const words = String(text || '').trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) {
    return;
  }

  const lines = [];
  let current = '';
  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (ctx.measureText(next).width <= maxWidth) {
      current = next;
      continue;
    }
    if (current) {
      lines.push(current);
    }
    current = word;
    if (lines.length >= maxLines - 1) {
      break;
    }
  }
  if (current && lines.length < maxLines) {
    lines.push(current);
  }

  lines.forEach((line, index) => {
    const drawY = fromBottom ? y - ((lines.length - 1 - index) * lineHeight) : y + (index * lineHeight);
    ctx.fillText(line, x, drawY);
  });
}

function drawReelFallback(ctx, canvas, entry, elapsedMs) {
  const accent = getReelAccent(entry);
  const secondary = getReelSecondaryAccent(entry);
  ctx.fillStyle = '#050912';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (let index = 0; index < 5; index += 1) {
    const width = 320 + (index * 64);
    const wobble = Math.sin((elapsedMs * 0.00045) + (index * 1.1)) * 42;
    ctx.save();
    ctx.translate((index * 216) - 120 + wobble, 0);
    ctx.rotate((-16 + (index * 4)) * (Math.PI / 180));
    ctx.fillStyle = index % 2 === 0 ? accent : secondary;
    ctx.globalAlpha = index % 2 === 0 ? 0.92 : 0.32;
    ctx.fillRect(0, -140, width, canvas.height + 280);
    ctx.restore();
  }

  ctx.globalAlpha = 1;
  ctx.fillStyle = 'rgba(5, 8, 14, 0.46)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawReelImage(ctx, canvas, image, elapsedMs) {
  const scale = 1.03 + ((Math.sin(elapsedMs / 1800) + 1) * 0.03);
  const drawWidth = canvas.width * scale;
  const drawHeight = canvas.height * scale;
  const offsetX = (canvas.width - drawWidth) / 2;
  const offsetY = (canvas.height - drawHeight) / 2;
  ctx.drawImage(image, offsetX, offsetY, drawWidth, drawHeight);
  ctx.fillStyle = 'rgba(5, 8, 14, 0.42)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawReelOverlay(ctx, canvas, entry) {
  const accent = getReelAccent(entry);
  const summary = buildSummary(entry) || entry.description || 'Published site';

  ctx.fillStyle = accent;
  ctx.font = '600 24px system-ui';
  ctx.fillText((entry.host || entry.siteId || '').toUpperCase(), 70, 92);

  ctx.fillStyle = '#f4f7fb';
  ctx.font = '700 78px system-ui';
  wrapReelText(ctx, buildDisplayTitle(entry), 70, 340, canvas.width - 140, 86, 3);

  ctx.fillStyle = '#b7c4dd';
  ctx.font = '500 30px system-ui';
  wrapReelText(ctx, summary, 72, canvas.height - 132, canvas.width - 144, 38, 3, true);

  ctx.fillStyle = accent;
  ctx.fillRect(canvas.width - 320, 72, 248, 10);
  ctx.fillStyle = '#f4f7fb';
  ctx.font = '600 22px system-ui';
  ctx.fillText(resolveViewerMedia(entry)?.label?.toUpperCase() || 'PREVIEW', canvas.width - 318, 126);

  const badgeText = entry?.family?.count > 1
    ? `${entry.family.memberOrder || 1}/${entry.family.count} IN GROUP`
    : 'SINGLE SITE';
  ctx.fillStyle = mutedReelColor(accent, 0.26);
  ctx.fillRect(70, canvas.height - 228, 256, 46);
  ctx.fillStyle = '#f4f7fb';
  ctx.font = '600 18px system-ui';
  ctx.fillText(badgeText, 88, canvas.height - 198);
}

function renderTvReelFrame(entry, image, elapsedMs) {
  if (!tvExportCanvasEl) {
    return;
  }

  const ctx = tvExportCanvasEl.getContext('2d');
  if (!ctx) {
    return;
  }

  ctx.clearRect(0, 0, tvExportCanvasEl.width, tvExportCanvasEl.height);
  if (image && image.complete && image.naturalWidth) {
    drawReelImage(ctx, tvExportCanvasEl, image, elapsedMs);
  } else {
    drawReelFallback(ctx, tvExportCanvasEl, entry, elapsedMs);
  }
  drawReelOverlay(ctx, tvExportCanvasEl, entry);
}

function pickReelMimeType() {
  const candidates = [
    'video/webm;codecs=vp9,opus',
    'video/webm;codecs=vp8,opus',
    'video/webm',
  ];

  if (typeof window.MediaRecorder === 'undefined' || typeof window.MediaRecorder.isTypeSupported !== 'function') {
    return '';
  }

  return candidates.find((value) => window.MediaRecorder.isTypeSupported(value)) || '';
}

async function exportCurrentTvReel() {
  if (state.tvReelBusy || !canExportReels()) {
    return;
  }

  const entry = getCurrentTvEntry();
  if (!entry || !tvExportCanvasEl) {
    return;
  }

  const image = await loadReelImage(resolveTvReelSource(entry));
  const mimeType = pickReelMimeType();
  const mediaRecorder = new window.MediaRecorder(tvExportCanvasEl.captureStream(REEL_EXPORT_FPS), mimeType ? { mimeType } : undefined);
  const chunks = [];
  let frameHandle = 0;
  let startTime = performance.now();

  state.tvReelBusy = true;
  updateTvControls(entry, getTvEntries().length);

  const stopped = new Promise((resolve) => {
    mediaRecorder.addEventListener('dataavailable', (event) => {
      if (event.data?.size) {
        chunks.push(event.data);
      }
    });
    mediaRecorder.addEventListener('stop', resolve, { once: true });
  });

  const draw = (now) => {
    renderTvReelFrame(entry, image, now - startTime);
    if (state.tvReelBusy) {
      frameHandle = window.requestAnimationFrame(draw);
    }
  };

  try {
    renderTvReelFrame(entry, image, 0);
    mediaRecorder.start();
    frameHandle = window.requestAnimationFrame(draw);
    await new Promise((resolve) => window.setTimeout(resolve, REEL_EXPORT_DURATION_MS));
  } catch (error) {
    console.error(error);
    window.alert(`Reel export failed: ${error.message}`);
  } finally {
    state.tvReelBusy = false;
    window.cancelAnimationFrame(frameHandle);
    renderTvReelFrame(entry, image, REEL_EXPORT_DURATION_MS);
    if (mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
    }
  }

  await stopped;

  updateTvControls(getCurrentTvEntry(), getTvEntries().length);

  if (chunks.length > 0) {
    const blob = new Blob(chunks, { type: mimeType || 'video/webm' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `${entry.siteId}-reel.webm`;
    anchor.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    flashInline(tvExportButton, 'Saved');
  }
}

function toggleTvPreviewScaleMode() {
  state.tvPreviewScaleMode = state.tvPreviewScaleMode === AUDIT_PREVIEW_SCALE_FIT
    ? AUDIT_PREVIEW_SCALE_ACTUAL
    : AUDIT_PREVIEW_SCALE_FIT;
  syncTvScaleToggle();
  applyTvPreviewScale();
}

function syncTvScaleToggle() {
  if (!tvScaleToggleButton) {
    return;
  }
  const scaled = state.tvPreviewScaleMode === AUDIT_PREVIEW_SCALE_FIT;
  tvScaleToggleButton.setAttribute('aria-pressed', scaled ? 'true' : 'false');
  tvScaleToggleButton.classList.toggle('is-active', scaled);
  if (!tvScaleToggleButton.disabled) {
    tvScaleToggleButton.title = scaled ? 'Switch preview to 1:1' : 'Scale preview to fit';
  }
  tvScaleToggleButton.setAttribute('aria-label', tvScaleToggleButton.disabled ? tvScaleToggleButton.title : (scaled ? 'Switch preview to 1:1' : 'Scale preview to fit'));
  const labelEl = tvScaleToggleButton.querySelector('span');
  if (labelEl) {
    labelEl.textContent = scaled ? '1:1' : 'Scale';
  }
  const iconEl = tvScaleToggleButton.querySelector('i');
  if (iconEl) {
    iconEl.className = scaled ? 'ti ti-arrows-minimize' : 'ti ti-arrows-maximize';
  }
}

function applyTvPreviewScale() {
  if (!tvFrameEl) {
    return;
  }
  if (state.tvPreviewScaleMode !== AUDIT_PREVIEW_SCALE_FIT || tvFrameEl.classList.contains('is-hidden')) {
    tvFrameEl.classList.remove('is-scaled');
    tvFrameEl.style.removeProperty('--tv-frame-scale');
    tvFrameEl.style.removeProperty('width');
    tvFrameEl.style.removeProperty('height');
    tvFrameEl.style.removeProperty('transform');
    return;
  }

  const container = tvFrameEl.parentElement;
  const bounds = container?.getBoundingClientRect?.();
  const availableWidth = Math.max(1, bounds?.width || tvFrameEl.clientWidth || AUDIT_FIT_VIEWPORT_WIDTH);
  const availableHeight = Math.max(1, bounds?.height || tvFrameEl.clientHeight || AUDIT_FIT_VIEWPORT_HEIGHT);
  const scale = Math.min(availableWidth / AUDIT_FIT_VIEWPORT_WIDTH, availableHeight / AUDIT_FIT_VIEWPORT_HEIGHT);
  tvFrameEl.classList.add('is-scaled');
  tvFrameEl.style.width = `${AUDIT_FIT_VIEWPORT_WIDTH}px`;
  tvFrameEl.style.height = `${AUDIT_FIT_VIEWPORT_HEIGHT}px`;
  tvFrameEl.style.setProperty('--tv-frame-scale', String(scale));
  tvFrameEl.style.transform = `translate(-50%, -50%) scale(${scale})`;
}

function toggleTvPlayback(entry) {
  const media = resolveViewerMedia(entry);
  if (media?.kind !== 'video' || !tvVideoEl || tvVideoEl.classList.contains('is-hidden')) {
    return;
  }

  if (tvVideoEl.paused) {
    tvVideoEl.play().catch(() => {});
  } else {
    tvVideoEl.pause();
  }
}

function buildTvQueuePage(entries) {
  return sliceFixedPage(entries, state.tvPage, TV_QUEUE_PAGE_SIZE);
}

function renderTvView() {
  const entries = getTvEntries();
  if (!tvLayoutEl || !tvQueueEl || !tvEmptyEl) {
    return;
  }

  if (entries.length === 0) {
    tvLayoutEl.classList.add('is-hidden');
    tvEmptyEl.classList.remove('is-hidden');
    if (tvQueueSummaryEl) {
      tvQueueSummaryEl.textContent = 'No entries';
    }
    if (tvPageEl) {
      tvPageEl.textContent = 'No pages';
    }
    if (tvPageSummaryEl) {
      tvPageSummaryEl.textContent = 'No sites';
    }
    if (tvPositionEl) {
      tvPositionEl.textContent = '0 / 0';
    }
    if (tvModeEl) {
      tvModeEl.textContent = 'Unavailable';
    }
    if (tvTitleEl) {
      tvTitleEl.textContent = 'No showcase entry';
    }
    if (tvHostEl) {
      tvHostEl.textContent = '';
      tvHostEl.removeAttribute('href');
    }
    if (tvDescriptionEl) {
      tvDescriptionEl.textContent = '';
    }
    updateTvControls(null, entries.length);
    clearViewerMedia({ videoEl: tvVideoEl, imageEl: tvImageEl, frameEl: tvFrameEl });
    syncTvScaleToggle();
    applyTvPreviewScale();
    tvQueueEl.innerHTML = '';
    return;
  }

  clampTvIndex();
  ensureTvPageContainsIndex(entries);
  const entry = entries[state.tvIndex];
  const media = renderViewerMedia({ videoEl: tvVideoEl, imageEl: tvImageEl, frameEl: tvFrameEl }, entry);
  const total = entries.length;
  const displayTitle = buildDisplayTitle(entry);
  const durationLabel = formatDemoDuration(media?.durationSec);

  tvLayoutEl.classList.remove('is-hidden');
  tvEmptyEl.classList.add('is-hidden');
  if (tvPositionEl) {
    tvPositionEl.textContent = `${state.tvIndex + 1} / ${total.toLocaleString()}`;
  }
  if (tvModeEl) {
    tvModeEl.textContent = durationLabel ? `${media?.label || 'Live'} • ${durationLabel}` : (media?.label || 'Live');
  }
  if (tvTitleEl) {
    tvTitleEl.textContent = displayTitle;
  }
  if (tvHostEl) {
    tvHostEl.textContent = entry.host ?? 'No public host';
    if (entry.url) {
      tvHostEl.href = entry.url;
    } else {
      tvHostEl.removeAttribute('href');
    }
  }
  if (tvDescriptionEl) {
    tvDescriptionEl.textContent = entry.description || entry.operatorNote || '';
  }

  wireVersionSwitcher({
    shell: tvVersionShellEl,
    labelEl: tvVersionLabelEl,
    prevButton: tvVersionPrevButton,
    nextButton: tvVersionNextButton,
  }, entry);
  updateTvControls(entry, total);
  syncTvScaleToggle();
  applyTvPreviewScale();
  renderTvQueue(entries);
}

function updateTvControls(entry, total) {
  const pageCount = getTvPageCount();
  if (tvPrevButton) {
    tvPrevButton.disabled = total === 0 || state.tvPage <= 0;
    tvPrevButton.title = pageCount > 1 ? 'Show the previous page of showcase entries.' : 'No previous page.';
  }
  if (tvNextButton) {
    tvNextButton.disabled = total === 0 || state.tvPage >= pageCount - 1;
    tvNextButton.title = pageCount > 1 ? 'Show the next page of showcase entries.' : 'No next page.';
  }
  if (tvItemPrevButton) {
    tvItemPrevButton.disabled = total <= 1;
    tvItemPrevButton.title = total > 1 ? 'Show the previous showcase item.' : 'No previous item.';
  }
  if (tvItemNextButton) {
    tvItemNextButton.disabled = total <= 1;
    tvItemNextButton.title = total > 1 ? 'Show the next showcase item.' : 'No next item.';
  }
  if (tvSlideshowButton) {
    tvSlideshowButton.disabled = total === 0;
    tvSlideshowButton.title = entry ? `Start slideshow from ${entry.siteId}.` : 'No showcase item.';
  }
  if (tvDetailsButton) {
    tvDetailsButton.disabled = !entry;
    tvDetailsButton.title = entry ? `Details for ${entry.siteId}.` : 'No showcase item.';
  }
  if (tvFeedbackButton) {
    tvFeedbackButton.disabled = !entry;
    tvFeedbackButton.title = entry ? `Feedback for ${entry.siteId}.` : 'No showcase item.';
  }
  if (tvScaleToggleButton) {
    const media = resolveViewerMedia(entry);
    tvScaleToggleButton.disabled = total === 0 || media?.kind !== 'iframe';
    tvScaleToggleButton.title = !entry
      ? 'No showcase item.'
      : media?.kind !== 'iframe'
        ? 'Scale is available for live site previews.'
        : tvScaleToggleButton.title;
  }
  if (tvExportButton) {
    const exportable = !!entry && canExportReels();
    tvExportButton.disabled = !exportable || state.tvReelBusy;
    tvExportButton.title = !entry
      ? 'Pick a site first.'
      : !canExportReels()
        ? 'This browser cannot record reel exports.'
        : 'Record an 8-second WebM reel for the current site.';
    const label = tvExportButton.querySelector('span');
    if (label) {
      label.textContent = state.tvReelBusy ? 'Recording…' : 'Export reel';
    }
  }
}

function renderTvQueue(entries) {
  if (!tvQueueEl || !tvQueueCardTemplate) {
    return;
  }

  tvQueueEl.innerHTML = '';
  const paged = buildTvQueuePage(entries);
  const activeEntry = entries[state.tvIndex];

  if (tvQueueSummaryEl) {
    const range = formatFixedPageRange(paged, entries.length, paged.items.length);
    tvQueueSummaryEl.textContent = `${range.start.toLocaleString()}-${range.end.toLocaleString()} of ${entries.length.toLocaleString()} showcase groups`;
  }
  if (tvPageSummaryEl) {
    const range = formatFixedPageRange(paged, entries.length, paged.items.length);
    tvPageSummaryEl.textContent = entries.length === 0
      ? 'No sites'
      : `${range.start.toLocaleString()}-${range.end.toLocaleString()} of ${entries.length.toLocaleString()} sites`;
  }
  if (tvPageEl) {
    tvPageEl.textContent = `Page ${paged.page + 1} of ${paged.pageCount}`;
  }

  paged.items.forEach((entry, index) => {
    const fragment = tvQueueCardTemplate.content.cloneNode(true);
    const button = fragment.querySelector('.tv-queue-card');
    const image = fragment.querySelector('.tv-queue-card__img');
    const badge = fragment.querySelector('.tv-queue-card__badge');
    const title = fragment.querySelector('.tv-queue-card__title');
    const host = fragment.querySelector('.tv-queue-card__host');
    const meta = fragment.querySelector('.tv-queue-card__meta');
    const queueIndex = paged.start + index;
    const media = resolveViewerMedia(entry);

    button.classList.toggle('is-active', entry.siteId === activeEntry?.siteId);
    button.dataset.siteId = entry.siteId;
    button.setAttribute('aria-label', `Show ${buildDisplayTitle(entry)}`);
    button.addEventListener('click', () => {
      state.tvIndex = queueIndex;
      render();
    });

    title.textContent = buildDisplayTitle(entry);
    host.textContent = entry.host ?? 'No public host';
    meta.textContent = [
      media?.label || 'Live',
      hasMultipleVersions(entry) ? buildVersionSummary(entry) : '',
    ].filter(Boolean).join(' • ');
    badge.textContent = media?.label || 'Live';

    assignPreviewImage(image, getPreviewUrl(entry.siteId), `${entry.siteId} showcase preview`, entry);
    tvQueueEl.appendChild(fragment);
  });
}

function updateTableFooter(pageNumber, pageCount, totalVisible, totalSites, start, end) {
  const showingAllRows = totalVisible > 0 && isAllTablePageSize();
  if (tablePrevButton) {
    tablePrevButton.disabled = pageNumber <= 1;
  }
  if (tableNextButton) {
    tableNextButton.disabled = pageNumber >= pageCount;
  }
  if (tablePageEl) {
    tablePageEl.textContent = totalVisible === 0
      ? 'No pages'
      : showingAllRows
      ? 'All rows'
      : `Page ${pageNumber} of ${pageCount}`;
  }
  if (tablePageSummaryEl) {
    tablePageSummaryEl.textContent = totalVisible === 0
      ? 'No rows'
      : `${start.toLocaleString()}-${end.toLocaleString()} of ${totalVisible.toLocaleString()} rows (${totalSites.toLocaleString()} sites)`;
  }
}

function getPreviewStackEntries(entry) {
  if (!entry) {
    return [];
  }

  const screenshots = getPreviewScreenshots(entry.siteId);
  if (screenshots.length > 1) {
    return screenshots.slice(0, 3).map((screenshot, index) => ({
      ...entry,
      siteId: `${entry.siteId}::screenshot-${index}`,
      previewUrl: screenshot.url,
      previewLabel: screenshot.label || screenshot.style || screenshot.capturedAt || `Screenshot ${index + 1}`,
      previewScreenshot: screenshot,
      sourceSiteId: entry.siteId,
    }));
  }

  if (!hasMultipleVersions(entry)) {
    return [entry];
  }

  const members = Array.isArray(entry?.familyMembers) && entry.familyMembers.length > 0
    ? entry.familyMembers
    : [entry];
  const currentIndex = Math.max(0, members.findIndex((member) => member.siteId === entry.siteId));
  const previousEntry = members[(currentIndex - 1 + members.length) % members.length] || entry;
  const currentEntry = members[currentIndex] || entry;
  const nextEntry = members[(currentIndex + 1) % members.length] || entry;

  return [previousEntry, currentEntry, nextEntry];
}

const previewStackCycleTimers = new WeakMap();
const PREVIEW_STACK_CYCLE_MS = 1200;

function assignPreviewImages(images, url, alt, entry = null) {
  images.forEach((img) => {
    assignPreviewImage(img, url, alt, entry);
  });
}

function renderPreviewStackImages(previewImgs, entry, offset = 0) {
  const previewEntries = getPreviewStackEntries(entry);
  const count = previewEntries.length;
  previewImgs.forEach((img, index) => {
    const sourceIndex = count > 0 ? (index + offset) % count : 0;
    const previewEntry = previewEntries[sourceIndex] || entry;
    assignPreviewThumbnailImage(img, previewEntry.previewUrl || getPreviewUrl(previewEntry.siteId), '', previewEntry, {
      width: isMobileSwipeViewport() ? 720 : 480,
      quality: 74,
    });
    if (img.dataset.src && img.dataset.previewState === 'placeholder' && !previewQueue.pending.includes(img)) {
      previewQueue.pending.push(img);
    }
  });
  drainPreviewQueue();
}

function stopPreviewStackCycle(previewShell, previewImgs = [], entry = null) {
  const active = previewStackCycleTimers.get(previewShell);
  if (active) {
    window.clearInterval(active.timer);
    previewStackCycleTimers.delete(previewShell);
  }
  if (entry) {
    renderPreviewStackImages(previewImgs, entry, 0);
  }
}

function startPreviewStackCycle(previewShell, previewImgs, entry) {
  const previewEntries = getPreviewStackEntries(entry);
  if (!previewShell || previewEntries.length < 2 || previewStackCycleTimers.has(previewShell)) {
    return;
  }

  let offset = 0;
  const timer = window.setInterval(() => {
    if (!document.contains(previewShell)) {
      stopPreviewStackCycle(previewShell);
      return;
    }
    offset = (offset + 1) % previewEntries.length;
    renderPreviewStackImages(previewImgs, entry, offset);
  }, PREVIEW_STACK_CYCLE_MS);
  previewStackCycleTimers.set(previewShell, { timer });
}

function wirePreviewButton(previewShell, previewImgs, entry) {
  const displayTitle = buildDisplayTitle(entry);
  previewShell.dataset.previewSourceSiteId = entry?.siteId || '';
  if (entry.url) {
    const screenshots = getPreviewScreenshots(entry.siteId);
    const label = screenshots.length > 1
      ? `Open preview for ${displayTitle}. Hover or focus to cycle ${screenshots.length} screenshots.`
      : `Open preview for ${displayTitle}`;
    previewShell.title = label;
    previewShell.setAttribute('aria-label', label);
    renderPreviewStackImages(previewImgs, entry, 0);
    previewShell.addEventListener('mouseenter', () => startPreviewStackCycle(previewShell, previewImgs, entry));
    previewShell.addEventListener('mouseleave', () => stopPreviewStackCycle(previewShell, previewImgs, entry));
    previewShell.addEventListener('focus', () => startPreviewStackCycle(previewShell, previewImgs, entry));
    previewShell.addEventListener('blur', () => stopPreviewStackCycle(previewShell, previewImgs, entry));
    previewShell.addEventListener('click', () => openFullscreenPreview(entry));
  } else {
    const label = `No preview available for ${displayTitle}`;
    previewShell.title = label;
    previewShell.setAttribute('aria-label', label);
    previewShell.classList.add('is-unavailable');
    previewShell.disabled = true;
    previewImgs.forEach((img) => applyPreviewFallback(img));
  }
}

function wirePreviewRefreshControl(button, entry) {
  if (!button) {
    return;
  }

  button.disabled = !state.apiBaseUrl || state.previewBusy.has(entry.siteId) || !entry.url || !canMutateEntry(entry);
  button.title = !canMutateEntry(entry)
    ? 'Imported CSV rows stay read-only in the launchpad.'
    : !state.apiBaseUrl
    ? COMPOSER_UNAVAILABLE_MESSAGE
    : `Refresh cached preview for ${entry.siteId}`;
  button.addEventListener('click', async () => {
    if (!canMutateEntry(entry)) {
      return;
    }
    const captureOptions = readPreviewRefreshOptions(button);
    await refreshPreviewForEntry(entry, captureOptions?.force ?? true, button, captureOptions);
  });
}

function readStoredPreviewRefreshRandomizeStyle() {
  if (typeof window === 'undefined' || !window.localStorage) {
    return false;
  }

  try {
    const raw = JSON.parse(window.localStorage.getItem('mullmania-launchpad-bulk-refresh-settings') || '{}');
    return raw.randomizeStyle === true;
  } catch (_) {
    return false;
  }
}

function readPreviewRefreshOptions(triggerButton) {
  if (!triggerButton?.dataset) {
    return null;
  }

  const width = parsePreviewRefreshNumber(triggerButton.dataset.bulkRefreshWidth, 100, 3840);
  const height = parsePreviewRefreshNumber(triggerButton.dataset.bulkRefreshHeight, 100, 2160);
  const settleDelayMs = parsePreviewRefreshNumber(triggerButton.dataset.bulkRefreshSettleDelayMs, 0, 5000);
  const randomizeStyle = triggerButton.dataset.bulkRefreshRandomStyle === '1'
    ? true
    : triggerButton.dataset.bulkRefreshRandomStyle === '0'
      ? false
      : readStoredPreviewRefreshRandomizeStyle();
  const force = triggerButton.dataset.bulkRefreshForce === '0'
    ? false
    : triggerButton.dataset.bulkRefreshForce === '1'
      ? true
      : null;

  if (
    !Number.isFinite(width)
    && !Number.isFinite(height)
    && !Number.isFinite(settleDelayMs)
    && force === null
  ) {
    return {
      ...PREVIEW_REFRESH_DEFAULTS,
      randomizeStyle,
    };
  }

  return {
    force,
    width: Number.isFinite(width) ? width : PREVIEW_REFRESH_DEFAULTS.width,
    height: Number.isFinite(height) ? height : PREVIEW_REFRESH_DEFAULTS.height,
    settleDelayMs: Number.isFinite(settleDelayMs) ? settleDelayMs : PREVIEW_REFRESH_DEFAULTS.settleDelayMs,
    randomizeStyle,
  };
}

function parsePreviewRefreshNumber(value, min, max) {
  const parsed = Number.parseInt(String(value || '').trim(), 10);
  if (!Number.isFinite(parsed)) {
    return null;
  }

  return Math.min(max, Math.max(min, parsed));
}

function clearPreviewRefreshOptions(triggerButton) {
  if (!triggerButton?.dataset) {
    return;
  }

  delete triggerButton.dataset.bulkRefreshForce;
  delete triggerButton.dataset.bulkRefreshWidth;
  delete triggerButton.dataset.bulkRefreshHeight;
  delete triggerButton.dataset.bulkRefreshSettleDelayMs;
  delete triggerButton.dataset.bulkRefreshRandomStyle;
}

function updateSelection(siteId, checked, shiftKey) {
  const visibleIds = state.visibleEntries.map((entry) => entry.siteId);

  if (shiftKey && state.lastSelectedSiteId && visibleIds.includes(siteId) && visibleIds.includes(state.lastSelectedSiteId)) {
    const start = visibleIds.indexOf(state.lastSelectedSiteId);
    const end = visibleIds.indexOf(siteId);
    const [from, to] = start <= end ? [start, end] : [end, start];

    for (const selectedId of visibleIds.slice(from, to + 1)) {
      setSelectionValue(selectedId, checked);
    }
  } else {
    setSelectionValue(siteId, checked);
  }

  state.lastSelectedSiteId = siteId;
  state.activeTableSiteId = siteId;
  render();
}

function setSelectionValue(siteId, selected) {
  if (selected) {
    state.selected.add(siteId);
  } else {
    state.selected.delete(siteId);
  }
}

function setVisibleSelection(selected) {
  for (const entry of state.visibleEntries) {
    setSelectionValue(entry.siteId, selected);
  }
  render();
}

function updateSelectionUi() {
  const selectedCount = getSelectedEntries().length;
  const visibleCount = state.visibleEntries.length;
  const visibleSelectedCount = state.visibleEntries.filter((entry) => state.selected.has(entry.siteId)).length;
  const hasSelection = selectedCount > 0;

  if (toolbarContextActionsEl) {
    toolbarContextActionsEl.classList.toggle('is-hidden', !hasSelection);
  }

  if (toolbarContextSlotEl) {
    toolbarContextSlotEl.dataset.selectionActive = hasSelection ? 'true' : 'false';
  }

  if (selectVisibleButton) {
    selectVisibleButton.disabled = visibleCount === 0;
    selectVisibleButton.title = visibleCount === 0
      ? 'No filtered results to select.'
      : `Select all ${visibleCount.toLocaleString()} visible results in the current filtered set.`;
  }

  if (clearSelectionButton) {
    clearSelectionButton.disabled = selectedCount === 0;
    clearSelectionButton.title = selectedCount === 0
      ? 'No selected sites to clear.'
      : `Clear all ${selectedCount.toLocaleString()} selected sites.`;
  }

  if (copySelectedIdsButton) {
    copySelectedIdsButton.disabled = selectedCount === 0;
  }

  if (copySelectedPromptButton) {
    copySelectedPromptButton.disabled = selectedCount === 0;
  }

  if (openBulkRenameButton) {
    openBulkRenameButton.disabled = selectedCount === 0;
    openBulkRenameButton.title = selectedCount === 0
      ? 'Select at least one site first.'
      : `Rename ${selectedCount.toLocaleString()} selected sites.`;
  }

  if (selectAllVisibleCheckbox) {
    selectAllVisibleCheckbox.disabled = visibleCount === 0;
    selectAllVisibleCheckbox.checked = visibleCount > 0 && visibleSelectedCount === visibleCount;
    selectAllVisibleCheckbox.indeterminate = visibleSelectedCount > 0 && visibleSelectedCount < visibleCount;
    selectAllVisibleCheckbox.title = visibleCount === 0
      ? 'No filtered results to toggle.'
      : `Toggle all ${visibleCount.toLocaleString()} visible results.`;
    syncCheckboxIcon(selectAllVisibleCheckbox, selectAllVisibleCheckboxIcon);
  }

}

function syncCheckboxIcon(input, icon) {
  if (!input || !icon) {
    return;
  }

  const iconClass = input.indeterminate
    ? 'ti-square-minus'
    : input.checked
      ? 'ti-square-check-filled'
      : 'ti-square';

  const baseClasses = icon.className
    .split(' ')
    .filter((token) => token && !token.startsWith('ti-') && token !== 'ti');

  icon.className = [...baseClasses, 'ti', iconClass].join(' ');
}

function ensureActiveTableSite(entries) {
  if (entries.length === 0) {
    state.activeTableSiteId = null;
    return;
  }

  if (entries.some((entry) => entry.siteId === state.activeTableSiteId)) {
    return;
  }

  if (state.lastSelectedSiteId && entries.some((entry) => entry.siteId === state.lastSelectedSiteId)) {
    state.activeTableSiteId = state.lastSelectedSiteId;
    return;
  }

  state.activeTableSiteId = entries[0].siteId;
}

function setActiveTableSiteId(siteId) {
  if (!siteId || state.activeTableSiteId === siteId) {
    return;
  }

  state.activeTableSiteId = siteId;
  syncActiveTableRows();
}

function syncActiveTableRows() {
  const rows = Array.from(tableBodyEl.querySelectorAll('.site-row'));
  if (rows.length === 0) {
    return;
  }

  for (const row of rows) {
    const isActive = row.dataset.siteId === state.activeTableSiteId;
    row.tabIndex = isActive ? 0 : -1;
    row.classList.toggle('is-active', isActive);
  }
}

function restoreActiveTableRow(shouldFocus) {
  syncActiveTableRows();

  if (!shouldFocus) {
    return;
  }

  const row = getActiveTableRow();
  if (!row) {
    return;
  }

  row.focus({ preventScroll: true });
  row.scrollIntoView({ block: 'nearest' });
}

function getActiveTableRow() {
  return Array.from(tableBodyEl.querySelectorAll('.site-row'))
    .find((row) => row.dataset.siteId === state.activeTableSiteId) ?? null;
}

function handleTableRowKeydown(event, siteId) {
  if (event.target !== event.currentTarget) {
    return;
  }

  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault();
      moveActiveTableRow(1);
      break;
    case 'ArrowUp':
      event.preventDefault();
      moveActiveTableRow(-1);
      break;
    case 'PageDown':
      event.preventDefault();
      moveActiveTableRow(getTablePageStep());
      break;
    case 'PageUp':
      event.preventDefault();
      moveActiveTableRow(-getTablePageStep());
      break;
    case ' ':
    case 'Spacebar':
      event.preventDefault();
      updateSelection(siteId, !state.selected.has(siteId), event.shiftKey);
      break;
    default:
      break;
  }
}

function moveActiveTableRow(offset) {
  if (state.visibleEntries.length === 0) {
    return;
  }

  const currentIndex = Math.max(
    state.visibleEntries.findIndex((entry) => entry.siteId === state.activeTableSiteId),
    0,
  );
  const nextIndex = Math.min(
    state.visibleEntries.length - 1,
    Math.max(0, currentIndex + offset),
  );

  state.activeTableSiteId = state.visibleEntries[nextIndex].siteId;
  state.tablePage = Math.floor(nextIndex / getEffectiveTablePageSize(state.visibleEntries.length));
  render();

  const row = getActiveTableRow();
  if (!row) {
    return;
  }

  row.focus({ preventScroll: true });
  row.scrollIntoView({ block: 'nearest' });
}

function getTablePageStep() {
  const firstRow = tableBodyEl.querySelector('.site-row');
  if (!firstRow) {
    return 10;
  }

  const rowHeight = firstRow.getBoundingClientRect().height || 1;
  const rowTop = firstRow.getBoundingClientRect().top;
  const visibleHeight = Math.max(240, window.innerHeight - Math.max(rowTop, 0) - 24);
  return Math.max(1, Math.floor(visibleHeight / rowHeight) - 1);
}

function isEditableKeyTarget(target) {
  return target instanceof HTMLElement
    && Boolean(target.closest('input, textarea, select, [contenteditable="true"]'));
}

function getGlobalSearchInput() {
  if (searchEl instanceof HTMLInputElement) {
    return searchEl;
  }
  if (swipeEls.searchInput instanceof HTMLInputElement) {
    return swipeEls.searchInput;
  }
  return null;
}

function focusGlobalSearchInputAtEnd() {
  const input = getGlobalSearchInput();
  if (!(input instanceof HTMLInputElement)) {
    return;
  }

  input.focus({ preventScroll: true });
  const end = input.value.length;
  input.setSelectionRange(end, end);
}

function canBootstrapGlobalSearchFromKeyboard(event) {
  if (
    event.defaultPrevented
    || event.ctrlKey
    || event.metaKey
    || event.altKey
    || event.isComposing
    || isEditableKeyTarget(event.target)
  ) {
    return false;
  }

  const input = getGlobalSearchInput();
  if (!(input instanceof HTMLInputElement) || input.disabled) {
    return false;
  }

  if (
    !settingsModalEl?.classList.contains('is-hidden')
    || !composerModalEl.classList.contains('is-hidden')
    || !bulkRenameModalEl?.classList.contains('is-hidden')
    || !tagManagerModalEl?.classList.contains('is-hidden')
    || !notesModalEl?.classList.contains('is-hidden')
    || !noteModalEl.classList.contains('is-hidden')
    || !vscodeModalEl?.classList.contains('is-hidden')
    || !fullscreenModalEl.classList.contains('is-hidden')
  ) {
    return false;
  }

  const key = String(event.key || '');
  return key === 'Backspace' || key === 'Delete' || key.length === 1;
}

function handleGlobalSearchKeyboardEntry(event) {
  if (!canBootstrapGlobalSearchFromKeyboard(event)) {
    return false;
  }

  const input = getGlobalSearchInput();
  if (!(input instanceof HTMLInputElement)) {
    return false;
  }

  const key = String(event.key || '');
  const currentValue = String(input.value || '');
  let nextValue = currentValue;

  if (key === 'Backspace') {
    nextValue = currentValue.slice(0, -1);
  } else if (key !== 'Delete') {
    nextValue = `${currentValue}${key}`;
  }

  event.preventDefault();
  applySearchValue(nextValue);
  focusGlobalSearchInputAtEnd();
  return true;
}

function handleTagManagerKeyboardEntry(event) {
  return false;
}

function canOpenBulkRenameFromKeyboard(event) {
  if (event.defaultPrevented || event.ctrlKey || event.metaKey || event.altKey) {
    return false;
  }
  if (String(event.key || '').toLowerCase() !== 'r') {
    return false;
  }
  if (
    !bulkRenameModalEl?.classList.contains('is-hidden')
    || !composerModalEl.classList.contains('is-hidden')
    || !fullscreenModalEl.classList.contains('is-hidden')
    || !noteModalEl.classList.contains('is-hidden')
    || !notesModalEl?.classList.contains('is-hidden')
    || isEditableKeyTarget(event.target)
  ) {
    return false;
  }
  return getSelectedEntries().length > 0;
}

function handleBulkRenameKeyboardEntry(event) {
  if (!canOpenBulkRenameFromKeyboard(event)) {
    return;
  }
  event.preventDefault();
  openBulkRenameModal();
}

function handleTableKeyboardEntry(event) {
  if (event.defaultPrevented || state.viewMode !== 'table' || state.visibleEntries.length === 0) {
    return;
  }

  if (
    !composerModalEl.classList.contains('is-hidden')
    || !fullscreenModalEl.classList.contains('is-hidden')
    || !noteModalEl.classList.contains('is-hidden')
    || !notesModalEl?.classList.contains('is-hidden')
  ) {
    return;
  }

  if (isEditableKeyTarget(event.target)) {
    return;
  }

  if (tableViewEl.contains(document.activeElement)) {
    return;
  }

  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault();
      enterTableKeyboardMode('down');
      break;
    case 'ArrowUp':
      event.preventDefault();
      enterTableKeyboardMode('up');
      break;
    case 'PageDown':
      event.preventDefault();
      enterTableKeyboardMode('page-down');
      break;
    case 'PageUp':
      event.preventDefault();
      enterTableKeyboardMode('page-up');
      break;
    default:
      break;
  }
}

function handleSwipeKeyboardEntry(event) {
  if (event.defaultPrevented || !state.swipeMode || state.visibleEntries.length === 0) {
    return;
  }

  if (
    !composerModalEl.classList.contains('is-hidden')
    || !fullscreenModalEl.classList.contains('is-hidden')
    || !noteModalEl.classList.contains('is-hidden')
    || !notesModalEl?.classList.contains('is-hidden')
  ) {
    return;
  }

  if (isEditableKeyTarget(event.target)) {
    return;
  }

  const toolbarOpen = swipeEls.toolbar && !swipeEls.toolbar.classList.contains('is-hidden');

  switch (event.key) {
    case 'ArrowLeft':
      event.preventDefault();
      navigateSwipe(-1);
      break;
    case 'ArrowRight':
      event.preventDefault();
      navigateSwipe(1);
      break;
    case 'ArrowUp':
      event.preventDefault();
      focusGlobalSearchInputAtEnd();
      break;
    case 'ArrowDown':
      if (!toolbarOpen) return;
      event.preventDefault();
      closeSwipeToolbar();
      break;
    case 'Enter':
      event.preventDefault();
      focusGlobalSearchInputAtEnd();
      break;
    case 'Backspace':
      if (!toolbarOpen) return;
      event.preventDefault();
      closeSwipeToolbar();
      break;
    default:
      break;
  }
}

function handleSlideshowKeyboardEntry(event) {
  if (event.defaultPrevented || state.viewMode !== 'slideshow' || state.swipeMode) {
    return;
  }

  if (
    !composerModalEl.classList.contains('is-hidden')
    || !fullscreenModalEl.classList.contains('is-hidden')
    || !noteModalEl.classList.contains('is-hidden')
    || !notesModalEl?.classList.contains('is-hidden')
    || isEditableKeyTarget(event.target)
  ) {
    return;
  }

  switch (event.key) {
    case 'ArrowLeft':
      event.preventDefault();
      hideSlideshowChromeImmediately();
      navigateSlideshow(-1);
      break;
    case 'ArrowRight':
      event.preventDefault();
      hideSlideshowChromeImmediately();
      navigateSlideshow(1);
      break;
    case 'ArrowUp': {
      const entry = getCurrentSlideshowEntry();
      if (!entry) {
        return;
      }
      event.preventDefault();
      void updateManualRank(entry.siteId, 1);
      break;
    }
    case 'ArrowDown': {
      const entry = getCurrentSlideshowEntry();
      if (!entry) {
        return;
      }
      event.preventDefault();
      void updateManualRank(entry.siteId, -1);
      break;
    }
    case 'Enter':
      event.preventDefault();
      cycleSlideshowNavigationMode();
      break;
    default:
      break;
  }
}

function getFullscreenEntries() {
  if (state.viewMode === 'tv') {
    return getTvEntries();
  }
  if (state.viewMode === 'slideshow') {
    return getSlideshowEntries();
  }
  return state.visibleEntries;
}

function getFullscreenEntryIndex() {
  if (!state.fullscreenEntry) {
    return -1;
  }
  const entries = getFullscreenEntries();
  const directIndex = entries.findIndex((entry) => entry.siteId === state.fullscreenEntry.siteId);
  if (directIndex !== -1) {
    return directIndex;
  }

  const activeDisplayKey = state.fullscreenEntry.displayEntryKey || getDisplayGroupKey(state.fullscreenEntry);
  if (!activeDisplayKey) {
    return -1;
  }
  return entries.findIndex((entry) => (entry.displayEntryKey || getDisplayGroupKey(entry)) === activeDisplayKey);
}

function syncFullscreenNavigationControls() {
  const entries = getFullscreenEntries();
  const hasNavigation = entries.length > 1;
  if (fullscreenPrevButton) {
    fullscreenPrevButton.disabled = !hasNavigation;
    fullscreenPrevButton.title = hasNavigation ? 'Previous site (Left)' : 'Only one site in the current result set';
  }
  if (fullscreenNextButton) {
    fullscreenNextButton.disabled = !hasNavigation;
    fullscreenNextButton.title = hasNavigation ? 'Next site (Right)' : 'Only one site in the current result set';
  }
}

function getFullscreenQrState() {
  return 'empty';
}

function syncFullscreenQrStageSurface() {
}

function syncFullscreenQrButton() {
}

function syncFullscreenLiveToggleButton(entry = state.fullscreenEntry) {
}

function setFullscreenPreviewSource(source, options = {}) {
  const normalized = FULLSCREEN_PREVIEW_SOURCE_SNAPSHOT;
  state.fullscreenPreviewSource = normalized;
  if (usePersistentViewState()) {
    localStorage.removeItem(FULLSCREEN_PREVIEW_SOURCE_STORAGE_KEY);
  }
  if (options.exitQr !== false && state.fullscreenMode === 'qr') {
    state.fullscreenMode = 'preview';
  }
  syncFullscreenLiveToggleButton(state.fullscreenEntry);
  if (options.render !== false && state.fullscreenEntry) {
    renderFullscreenStage(state.fullscreenEntry);
  }
}

function getActiveFullscreenPreviewSource(entry = state.fullscreenEntry) {
  return FULLSCREEN_PREVIEW_SOURCE_SNAPSHOT;
}

function resolveFullscreenStageMedia(entry) {
  return resolveFullscreenPreviewMedia(entry);
}

function getFullscreenPreviewStatusText(entry, media) {
  if (media?.label === 'Snapshot' || media?.screenshot) {
    return 'Cached snapshot preview.';
  }
  if (media?.label === 'Poster') {
    return 'Static poster preview.';
  }
  return 'No cached snapshot yet.';
}

function resolveFullscreenLiveViewportMetrics() {
  if (!(fullscreenStageEl instanceof HTMLElement)) {
    return null;
  }

  const styles = window.getComputedStyle(fullscreenStageEl);
  const paddingLeft = Number.parseFloat(styles.paddingLeft) || 0;
  const paddingRight = Number.parseFloat(styles.paddingRight) || 0;
  const paddingTop = Number.parseFloat(styles.paddingTop) || 0;
  const paddingBottom = Number.parseFloat(styles.paddingBottom) || 0;
  const availableWidth = Math.max(fullscreenStageEl.clientWidth - paddingLeft - paddingRight, 0);
  const availableHeight = Math.max(fullscreenStageEl.clientHeight - paddingTop - paddingBottom, 0);

  if (!availableWidth || !availableHeight) {
    return null;
  }

  const minComfortScale = availableWidth <= 760 ? 0.56 : availableWidth <= 980 ? 0.62 : 0.7;
  const preset = FULLSCREEN_LIVE_VIEWPORT_PRESETS.find((candidate) => (
    Math.min(availableWidth / candidate.width, availableHeight / candidate.height, 1) >= minComfortScale
  )) || FULLSCREEN_LIVE_VIEWPORT_PRESETS[FULLSCREEN_LIVE_VIEWPORT_PRESETS.length - 1];
  const scale = Math.min(availableWidth / preset.width, availableHeight / preset.height, 1);

  return {
    width: preset.width,
    height: preset.height,
    scale: Math.max(scale, 0.01),
  };
}

function syncFullscreenLiveViewportLayout() {
  fullscreenLiveViewportSyncFrame = 0;

  if (!(fullscreenStageEl instanceof HTMLElement) || fullscreenModalEl?.classList.contains('is-hidden')) {
    return;
  }

  const timelineSnapshot = getActiveFullscreenTimelineSnapshot(state.fullscreenEntry);
  const previewSource = timelineSnapshot ? 'timeline' : getActiveFullscreenPreviewSource(state.fullscreenEntry);
  fullscreenStageEl.dataset.previewSource = previewSource;
  if (previewSource !== FULLSCREEN_PREVIEW_SOURCE_LIVE && previewSource !== 'timeline') {
    return;
  }

  const metrics = resolveFullscreenLiveViewportMetrics();
  if (!metrics) {
    return;
  }

  fullscreenStageEl.style.setProperty('--fullscreen-live-width', `${metrics.width}px`);
  fullscreenStageEl.style.setProperty('--fullscreen-live-height', `${metrics.height}px`);
  fullscreenStageEl.style.setProperty('--fullscreen-live-scale', metrics.scale.toFixed(4));
  fullscreenStageEl.style.setProperty('--surface-stage-live-width', `${metrics.width}px`);
  fullscreenStageEl.style.setProperty('--surface-stage-live-height', `${metrics.height}px`);
  fullscreenStageEl.style.setProperty('--surface-stage-live-scale', metrics.scale.toFixed(4));
}

function scheduleFullscreenLiveViewportLayout() {
  if (fullscreenLiveViewportSyncFrame) {
    window.cancelAnimationFrame(fullscreenLiveViewportSyncFrame);
  }
  fullscreenLiveViewportSyncFrame = window.requestAnimationFrame(syncFullscreenLiveViewportLayout);
}

function syncFullscreenModalChrome() {
  document.body.classList.toggle(
    'has-fullscreen-preview-open',
    Boolean(fullscreenModalEl && !fullscreenModalEl.classList.contains('is-hidden'))
  );
}

function setFullscreenActionButtonState(button, { busy = false, idleIcon, idleLabel, busyLabel }) {
  if (!button) {
    return;
  }

  button.innerHTML = busy
    ? `<i class="ti ti-loader-2 fullscreen-modal__spinner"></i><span>${busyLabel}</span>`
    : `<i class="${idleIcon}"></i><span>${idleLabel}</span>`;
}

function setFullscreenRenameStatus(message = '', tone = '') {
  if (!fullscreenRenameStatusEl) {
    return;
  }

  const text = message ?? '';
  fullscreenRenameStatusEl.textContent = text;
  const base = tone
    ? `field-note fullscreen-modal__rename-status is-${tone}`
    : 'field-note fullscreen-modal__rename-status';
  fullscreenRenameStatusEl.className = text ? base : `${base} is-hidden`;
}

function validateRenameSiteIdSyntax(rawValue, currentSiteId) {
  const sanitized = sanitizeSiteIdInput(rawValue);
  const value = normalizeSiteId(sanitized);

  if (!sanitized) {
    return {
      rawValue: sanitized,
      siteId: '',
      valid: false,
      unchanged: false,
      message: 'Lowercase letters, numbers, and hyphens only.',
      tone: '',
    };
  }

  if (sanitized.endsWith('-')) {
    return {
      rawValue: sanitized,
      siteId: value,
      valid: false,
      unchanged: false,
      message: 'Finish the name after the trailing hyphen.',
      tone: '',
    };
  }

  if (!/^[a-z0-9-]+$/.test(value) || value === ROOT_SITE_ID) {
    return {
      rawValue: sanitized,
      siteId: value,
      valid: false,
      unchanged: false,
      message: 'Use lowercase letters, numbers, and hyphens only.',
      tone: 'error',
    };
  }

  if (RESERVED_COMPOSER_SITE_IDS.has(value)) {
    return {
      rawValue: sanitized,
      siteId: value,
      valid: false,
      unchanged: false,
      message: 'That one is reserved for the core surface.',
      tone: 'error',
    };
  }

  if (value === currentSiteId) {
    return {
      rawValue: sanitized,
      siteId: value,
      valid: true,
      unchanged: true,
      message: '',
      tone: '',
    };
  }

  return {
    rawValue: sanitized,
    siteId: value,
    valid: true,
    unchanged: false,
    message: '',
    tone: '',
  };
}

function validateFullscreenRenameInput(entry = state.fullscreenEntry) {
  const currentSiteId = entry?.siteId || fullscreenRenameInputEl?.dataset.currentSiteId || '';
  if (!fullscreenRenameInputEl || !entry || !canRenameEntry(entry)) {
    return { valid: false, unchanged: true, siteId: currentSiteId };
  }

  const syntax = validateRenameSiteIdSyntax(fullscreenRenameInputEl.value, currentSiteId);
  fullscreenRenameInputEl.value = syntax.rawValue;

  if (!syntax.valid) {
    setFullscreenRenameStatus(syntax.message, syntax.tone);
    return { valid: false, unchanged: false, siteId: syntax.siteId };
  }

  const existingEntry = state.entries.find((candidate) => candidate.siteId === syntax.siteId);
  if (existingEntry && syntax.siteId !== currentSiteId) {
    setFullscreenRenameStatus(`https://${existingEntry.host}/ already exists.`, 'warning');
    return { valid: false, unchanged: false, siteId: syntax.siteId };
  }

  if (syntax.unchanged) {
    setFullscreenRenameStatus('', '');
    return { valid: true, unchanged: true, siteId: syntax.siteId };
  }

  setFullscreenRenameStatus(`Will rename to https://${syntax.siteId}.${BASE_DOMAIN}/`, 'success');
  return { valid: true, unchanged: false, siteId: syntax.siteId };
}

function getFullscreenInitialSiteId(entry = state.fullscreenEntry) {
  return getFullscreenInitialSiteState(entry)?.siteId || entry?.siteId || '';
}

function getFullscreenDraftSiteId(entry = state.fullscreenEntry) {
  return getFullscreenDraftSiteState(entry)?.siteId || getFullscreenInitialSiteId(entry);
}

function getHostedSiteUrlForEntry(entry) {
  const explicitUrl = normalizeCsvEntryUrl(entry?.url, window.location.href);
  if (explicitUrl) {
    return explicitUrl;
  }
  if (isValidHostedHost(entry?.host)) {
    return `https://${entry.host}/`;
  }
  const siteId = String(entry?.siteId || '').trim();
  return siteId ? `https://${siteId}.${BASE_DOMAIN}/` : '#';
}

function getFullscreenGroupedSiteOptions(entry = state.fullscreenEntry) {
  const members = Array.isArray(entry?.familyMembers) && entry.familyMembers.length > 1
    ? entry.familyMembers
    : [];
  return members.filter((member) => member?.siteId);
}

function syncFullscreenGroupedSiteSelect(entry = state.fullscreenEntry, editing = false) {
  if (!(fullscreenSiteSelectEl instanceof HTMLSelectElement)) {
    return false;
  }

  const members = getFullscreenGroupedSiteOptions(entry);
  const showSelect = !editing && members.length > 1;
  fullscreenSiteSelectEl.classList.toggle('is-hidden', !showSelect);
  fullscreenSiteSelectEl.disabled = !showSelect;
  if (!showSelect) {
    fullscreenSiteSelectEl.replaceChildren();
    fullscreenSiteSelectEl.dataset.memberSignature = '';
    return false;
  }

  const memberSignature = members.map((member) => member.siteId).join('|');
  if (fullscreenSiteSelectEl.dataset.memberSignature !== memberSignature) {
    fullscreenSiteSelectEl.replaceChildren(...members.map((member, index) => {
      const option = document.createElement('option');
      option.value = member.siteId;
      option.textContent = `${index + 1}/${members.length} ${member.host || `${member.siteId}.${BASE_DOMAIN}`}`;
      return option;
    }));
    fullscreenSiteSelectEl.dataset.memberSignature = memberSignature;
  }
  fullscreenSiteSelectEl.value = entry?.siteId || '';
  fullscreenSiteSelectEl.title = `Select a site in ${entry?.family?.label || 'this grouped row'}`;
  return true;
}

function navigateFullscreenGroupedSite(delta) {
  const members = getFullscreenGroupedSiteOptions(state.fullscreenEntry);
  if (members.length <= 1) {
    return false;
  }
  const currentIndex = Math.max(0, members.findIndex((member) => member.siteId === state.fullscreenEntry?.siteId));
  const nextIndex = (currentIndex + delta + members.length) % members.length;
  const nextEntry = members[nextIndex];
  if (!nextEntry || nextEntry.siteId === state.fullscreenEntry?.siteId) {
    return false;
  }
  return openFullscreenPreview(nextEntry, { mode: state.fullscreenMode });
}

function validateFullscreenDraftSiteId(entry = state.fullscreenEntry) {
  const currentSiteId = getFullscreenInitialSiteId(entry);
  const requestedSiteId = getFullscreenDraftSiteId(entry);
  const unchanged = requestedSiteId === currentSiteId;
  if (!entry || !currentSiteId) {
    return { valid: false, unchanged: true, siteId: currentSiteId, message: 'Pick a site first.', tone: 'warning' };
  }
  if (unchanged) {
    return { valid: true, unchanged: true, siteId: currentSiteId, message: '', tone: '' };
  }
  if (!canRenameEntry(entry)) {
    return {
      valid: false,
      unchanged: false,
      siteId: requestedSiteId,
      message: getRenameUnavailableMessage(entry),
      tone: 'warning',
    };
  }

  const syntax = validateRenameSiteIdSyntax(requestedSiteId, currentSiteId);
  if (!syntax.valid) {
    return syntax;
  }

  const existingEntry = state.entries.find((candidate) => candidate.siteId === syntax.siteId);
  if (existingEntry && syntax.siteId !== currentSiteId) {
    return {
      valid: false,
      unchanged: false,
      siteId: syntax.siteId,
      message: `https://${existingEntry.host}/ already exists.`,
      tone: 'warning',
    };
  }

  return {
    ...syntax,
    message: `Will rename to https://${syntax.siteId}.${BASE_DOMAIN}/ when saved.`,
    tone: 'success',
  };
}

function toggleFullscreenSubdomainEditor() {
  const entry = state.fullscreenEntry;
  if (!entry || !canRenameEntry(entry)) {
    return;
  }
  state.fullscreenSiteState.subdomainEditing = !state.fullscreenSiteState.subdomainEditing;
  syncFullscreenRenameControls(entry);
  syncFullscreenSiteStateControls();
  if (state.fullscreenSiteState.subdomainEditing) {
    window.requestAnimationFrame(() => {
      fullscreenRenameInputEl?.focus({ preventScroll: true });
      fullscreenRenameInputEl?.select?.();
    });
  }
}

function syncFullscreenPreviewBusyState() {
  const siteId = state.fullscreenEntry?.siteId || '';
  const busy = Boolean(siteId) && state.previewBusy.has(siteId);

  fullscreenStageEl?.classList.toggle('is-preview-refreshing', busy);
  fullscreenPreviewLoadingEl?.classList.toggle('is-hidden', !busy);
  if (fullscreenPreviewLoadingEl) {
    fullscreenPreviewLoadingEl.setAttribute('aria-hidden', busy ? 'false' : 'true');
  }
}

function syncFullscreenRenameControls(entry = state.fullscreenEntry) {
  const editable = canRenameEntry(entry);
  const siteId = getFullscreenInitialSiteId(entry);
  const draftSiteId = getFullscreenDraftSiteId(entry);
  const busy = Boolean(siteId) && (state.renameBusy.has(siteId) || state.siteStateBusy.has(siteId));
  const previewBusy = Boolean(siteId) && state.previewBusy.has(siteId);
  const blocked = !state.apiBaseUrl || previewBusy || busy;
  const editing = Boolean(state.fullscreenSiteState.subdomainEditing && editable && !busy && !previewBusy);
  const validation = validateFullscreenDraftSiteId(entry);

  fullscreenRenameShellEl?.classList.remove('is-hidden');
  fullscreenRenameShellEl?.classList.toggle('is-editing', editing);
  fullscreenRenameShellEl?.classList.toggle('is-dirty', Boolean(validation && !validation.unchanged));
  fullscreenHostEl?.classList.add('is-hidden');

  if (fullscreenSiteLinkEl) {
    const href = entry ? getHostedSiteUrlForEntry(entry) : '#';
    const host = entry?.host || (siteId ? `${siteId}.${BASE_DOMAIN}` : '');
    const groupSelectVisible = syncFullscreenGroupedSiteSelect(entry, editing);
    fullscreenSiteLinkEl.href = href;
    fullscreenSiteLinkEl.textContent = host;
    fullscreenSiteLinkEl.title = host ? `Open ${host}` : '';
    fullscreenSiteLinkEl.classList.toggle('is-hidden', editing || groupSelectVisible);
    fullscreenSiteLinkEl.setAttribute('aria-disabled', host ? 'false' : 'true');
  } else {
    syncFullscreenGroupedSiteSelect(entry, editing);
  }

  if (!editable) {
    if (fullscreenRenameInputEl) {
      fullscreenRenameInputEl.dataset.currentSiteId = siteId;
      fullscreenRenameInputEl.value = draftSiteId;
      fullscreenRenameInputEl.disabled = true;
    }
    fullscreenRenameInputEl?.closest('.fullscreen-modal__rename-field')?.classList.add('is-hidden');
    syncFullscreenGroupedSiteSelect(entry, false);
    if (fullscreenRenameSaveButton) {
      fullscreenRenameSaveButton.disabled = true;
      setFullscreenActionButtonState(fullscreenRenameSaveButton, {
        busy: false,
        idleIcon: 'ti ti-pencil',
        idleLabel: 'Edit',
        busyLabel: 'Working…',
      });
      fullscreenRenameSaveButton.title = getRenameUnavailableMessage(entry);
      fullscreenRenameSaveButton.setAttribute('aria-pressed', 'false');
    }
    setFullscreenRenameStatus('', '');
    return { valid: false, unchanged: true, siteId: '' };
  }

  if (fullscreenRenameInputEl && fullscreenRenameInputEl.dataset.currentSiteId !== siteId) {
    fullscreenRenameInputEl.dataset.currentSiteId = siteId;
  }
  if (fullscreenRenameInputEl && fullscreenRenameInputEl.value !== draftSiteId) {
    fullscreenRenameInputEl.value = draftSiteId;
  }
  fullscreenRenameInputEl?.closest('.fullscreen-modal__rename-field')?.classList.toggle('is-hidden', !editing);

  if (fullscreenRenameInputEl) {
    fullscreenRenameInputEl.disabled = !editing || blocked;
  }

  if (!state.apiBaseUrl) {
    setFullscreenRenameStatus(COMPOSER_UNAVAILABLE_MESSAGE, 'error');
  } else if (busy) {
    setFullscreenRenameStatus(`Saving ${siteId}…`, '');
  } else if (validation.message) {
    setFullscreenRenameStatus(validation.message, validation.tone);
  } else {
    setFullscreenRenameStatus('', '');
  }

  if (fullscreenRenameSaveButton) {
    fullscreenRenameSaveButton.disabled = blocked || !editable;
    fullscreenRenameSaveButton.title = !state.apiBaseUrl
      ? COMPOSER_UNAVAILABLE_MESSAGE
      : busy
        ? `Saving ${siteId}`
        : editing
          ? 'Show the site link.'
          : 'Edit subdomain.';
    fullscreenRenameSaveButton.setAttribute('aria-pressed', editing ? 'true' : 'false');
    setFullscreenActionButtonState(fullscreenRenameSaveButton, {
      busy,
      idleIcon: editing ? 'ti ti-check' : 'ti ti-pencil',
      idleLabel: editing ? 'Done' : 'Edit',
      busyLabel: 'Saving…',
    });
  }

  return validation;
}

function syncFullscreenEntryActionButtons(entry = state.fullscreenEntry) {
  if (!entry) {
    if (fullscreenEditButton) {
      fullscreenEditButton.disabled = true;
      fullscreenEditButton.title = 'No site selected.';
      fullscreenEditButton.setAttribute('aria-label', 'No site selected.');
    }
    if (fullscreenVscodeButton) {
      fullscreenVscodeButton.disabled = true;
      fullscreenVscodeButton.title = 'No site selected.';
      fullscreenVscodeButton.setAttribute('aria-label', 'No site selected.');
    }
    if (fullscreenUseAppButton) {
      fullscreenUseAppButton.disabled = true;
      fullscreenUseAppButton.title = 'No site selected.';
      fullscreenUseAppButton.setAttribute('aria-label', 'No site selected.');
    }
    if (fullscreenDeleteButton) {
      updateDeleteButton(fullscreenDeleteButton, entry);
    }
    if (fullscreenMainButton) {
      fullscreenMainButton.disabled = true;
    }
    if (fullscreenTvCastButton) {
      fullscreenTvCastButton.disabled = true;
      fullscreenTvCastButton.title = 'No site selected.';
    }
    if (fullscreenRedeployButton) {
      fullscreenRedeployButton.disabled = true;
      fullscreenRedeployButton.title = 'No site selected.';
      fullscreenRedeployButton.setAttribute('aria-label', 'No site selected.');
      setFullscreenActionButtonState(fullscreenRedeployButton, {
        busy: false,
        idleIcon: 'ti ti-rocket',
        idleLabel: 'Redeploy',
        busyLabel: 'Queuing deploy...',
      });
    }
    if (fullscreenNoteButton) {
      fullscreenNoteButton.disabled = true;
      fullscreenNoteButton.title = 'No site selected.';
      fullscreenNoteButton.setAttribute('aria-label', 'No site selected.');
    }
    updateSiteAccessButton(fullscreenWhitelistButton, null);
    if (fullscreenRefreshButton) {
      fullscreenRefreshButton.disabled = true;
      fullscreenRefreshButton.title = 'No site selected.';
      fullscreenRefreshButton.setAttribute('aria-label', 'No site selected.');
      setFullscreenActionButtonState(fullscreenRefreshButton, {
        busy: false,
        idleIcon: 'ti ti-refresh',
        idleLabel: 'Refresh snapshot',
        busyLabel: 'Refreshing snapshot…',
      });
    }
    syncFullscreenPreviewBusyState();
    syncFullscreenRenameControls(entry);
    syncFullscreenAliasEditorControls();
    syncFullscreenLiveToggleButton(entry);
    return;
  }

  const siteBusy = isSiteMutationBusy(entry.siteId);
  const previewBusy = state.previewBusy.has(entry.siteId);
  const mutable = canMutateEntry(entry);
  const editable = canEditEntry(entry);

  if (fullscreenEditButton) {
    fullscreenEditButton.disabled = !editable || siteBusy || previewBusy;
    fullscreenEditButton.title = editable
      ? siteBusy || previewBusy
        ? 'Working…'
        : `Edit ${entry.siteId}`
      : entry?.categories?.externalCatalog
        ? 'Imported CSV rows stay read-only in the launchpad.'
        : 'Core Mullmania sites stay managed outside this editor.';
    fullscreenEditButton.setAttribute('aria-label', fullscreenEditButton.title);
  }

  if (fullscreenVscodeButton) {
    fullscreenVscodeButton.disabled = !entry.siteId;
    fullscreenVscodeButton.title = entry.siteId
      ? `Open ${entry.siteId} in the VS Code bridge.`
      : 'No site selected.';
    fullscreenVscodeButton.setAttribute('aria-label', fullscreenVscodeButton.title);
  }

  if (fullscreenUseAppButton) {
    fullscreenUseAppButton.disabled = !entry.url;
    fullscreenUseAppButton.title = entry.url
      ? `Open ${entry.siteId || entry.host || 'this site'} so the browser can install it as an app.`
      : 'No hosted URL to install.';
    fullscreenUseAppButton.setAttribute('aria-label', fullscreenUseAppButton.title);
  }

  if (fullscreenDeleteButton) {
    updateDeleteButton(fullscreenDeleteButton, entry);
    if (!state.deleteBusy.has(entry.siteId) && (siteBusy || previewBusy)) {
      fullscreenDeleteButton.disabled = true;
      fullscreenDeleteButton.title = 'Working…';
    }
  }

  if (fullscreenMainButton) {
    updateMainSiteButton(fullscreenMainButton, entry);
    if (!state.mainSiteBusy && (siteBusy || previewBusy)) {
      fullscreenMainButton.disabled = true;
      fullscreenMainButton.title = 'Working…';
    }
  }

  if (fullscreenTvCastButton) {
    fullscreenTvCastButton.disabled = !entry.siteId || !entry.url;
    fullscreenTvCastButton.title = entry.url
      ? `Put ${entry.siteId} on a Connjure TV.`
      : 'No live URL to put on a TV.';
  }

  if (fullscreenRedeployButton) {
    const redeployBusy = state.redeployBusy.has(entry.siteId);
    fullscreenRedeployButton.disabled = !state.apiBaseUrl || !entry.siteId || siteBusy || previewBusy || redeployBusy;
    fullscreenRedeployButton.title = !state.apiBaseUrl
      ? COMPOSER_UNAVAILABLE_MESSAGE
      : redeployBusy
        ? `Queuing deploy for ${entry.siteId}...`
        : siteBusy || previewBusy
          ? 'Working...'
          : `Redeploy ${entry.siteId}`;
    fullscreenRedeployButton.setAttribute('aria-label', fullscreenRedeployButton.title);
    setFullscreenActionButtonState(fullscreenRedeployButton, {
      busy: redeployBusy,
      idleIcon: 'ti ti-rocket',
      idleLabel: 'Redeploy',
      busyLabel: 'Queuing deploy...',
    });
  }

  if (fullscreenNoteButton) {
    fullscreenNoteButton.disabled = !entry.siteId;
    fullscreenNoteButton.title = entry.siteId
      ? `Open notes for ${entry.siteId}.`
      : 'No site selected.';
    fullscreenNoteButton.setAttribute('aria-label', fullscreenNoteButton.title);
  }

  updateSiteAccessButton(fullscreenWhitelistButton, entry);

  if (fullscreenRefreshButton) {
    fullscreenRefreshButton.disabled = !state.apiBaseUrl || !mutable || siteBusy || previewBusy || !entry.url;
    fullscreenRefreshButton.title = !mutable
      ? 'Imported CSV rows stay read-only in the launchpad.'
      : !state.apiBaseUrl
        ? COMPOSER_UNAVAILABLE_MESSAGE
        : previewBusy
          ? `Refreshing cached snapshot for ${entry.siteId}`
          : siteBusy
            ? 'Working…'
            : `Refresh cached snapshot for ${entry.siteId}`;
    fullscreenRefreshButton.setAttribute('aria-label', fullscreenRefreshButton.title);
    setFullscreenActionButtonState(fullscreenRefreshButton, {
      busy: previewBusy,
      idleIcon: 'ti ti-refresh',
      idleLabel: 'Refresh snapshot',
      busyLabel: 'Refreshing snapshot…',
    });
  }

  syncFullscreenPreviewBusyState();
  syncFullscreenRenameControls(entry);
  syncFullscreenSiteStateControls();
  syncFullscreenLiveToggleButton(entry);
}

function renderFullscreenEntryHeader(entry) {
  if (!entry) {
    return;
  }

  syncFullscreenTitlePreview(entry);
  if (fullscreenHostEl) {
    fullscreenHostEl.textContent = entry.host ?? '';
  }
  syncFullscreenEntryActionButtons(entry);
}

function syncFullscreenTitlePreview(entry = state.fullscreenEntry) {
  if (!fullscreenTitleEl || !entry) {
    return;
  }
  const draftTitle = getFullscreenDraftSiteState(entry)?.displayName || '';
  fullscreenTitleEl.textContent = normalizeFriendlyName(draftTitle) || buildDisplayTitle(entry);
}

function getFullscreenFriendlyNameTargets(entry = state.fullscreenEntry) {
  if (!entry) {
    return [];
  }

  const members = Array.isArray(entry.familyMembers) && entry.familyMembers.length > 1
    ? entry.familyMembers
    : [entry];

  return members
    .map((member) => findEntryBySiteId(member?.siteId) || member)
    .filter((member) => Boolean(member?.siteId));
}

function getFullscreenFriendlyNameTargetSiteIds(entry = state.fullscreenEntry) {
  return Array.from(new Set(
    getFullscreenFriendlyNameTargets(entry)
      .map((member) => String(member?.siteId || '').trim())
      .filter(Boolean)
  ));
}

function parseFullscreenSiteStateRankInput(value) {
  const raw = String(value ?? '').trim();
  if (!raw || !/^-?\d+$/.test(raw)) {
    return {
      raw,
      valid: false,
      numeric: null,
    };
  }
  return {
    raw,
    valid: true,
    numeric: normalizeManualRank(Number.parseInt(raw, 10)),
  };
}

function cloneFullscreenSiteStateValue(value) {
  if (!value || typeof value !== 'object') {
    return null;
  }
  const rankInfo = parseFullscreenSiteStateRankInput(value.manualRankInput ?? value.manualRank);
  const fallbackRank = normalizeManualRank(value.manualRank);
  return {
    siteId: sanitizeSiteIdInput(value.siteId || ''),
    displayName: normalizeFriendlyName(value.displayName || ''),
    aliases: normalizeAliasList(value.aliases || []),
    manualRank: rankInfo.valid ? rankInfo.numeric : fallbackRank,
    manualRankInput: rankInfo.raw || String(fallbackRank),
    operatorNote: normalizeSiteNoteText(value.operatorNote || ''),
    isPublic: value.isPublic === true,
    mainSite: value.mainSite === true,
    tags: normalizeManagedTagList(value.tags || []),
  };
}

function buildFullscreenSiteState(entry) {
  if (!entry) {
    return null;
  }
  const manualRank = normalizeManualRank(entry.manualRank);
  return cloneFullscreenSiteStateValue({
    siteId: entry.siteId,
    displayName: buildDisplayTitle(entry),
    aliases: entry.aliases || [],
    manualRank,
    manualRankInput: String(manualRank),
    operatorNote: getOperatorNote(entry),
    isPublic: entry.isPublic === true,
    mainSite: entry.mainSite === true,
    tags: getEntryOperatorTags(entry),
  });
}

function hasActiveFullscreenSiteState(entry = state.fullscreenEntry) {
  return Boolean(entry?.siteId) && state.fullscreenSiteState.siteId === entry.siteId;
}

function getFullscreenInitialSiteState(entry = state.fullscreenEntry) {
  return hasActiveFullscreenSiteState(entry) ? state.fullscreenSiteState.initial : null;
}

function getFullscreenDraftSiteState(entry = state.fullscreenEntry) {
  return hasActiveFullscreenSiteState(entry) ? state.fullscreenSiteState.draft : null;
}

function setFullscreenSiteStateStatus(message = '', tone = '') {
  state.fullscreenSiteState.statusMessage = message || '';
  state.fullscreenSiteState.statusTone = tone || '';
}

function initializeFullscreenSiteState(entry, options = {}) {
  const initial = buildFullscreenSiteState(entry);
  state.fullscreenSiteState.siteId = entry?.siteId || '';
  state.fullscreenSiteState.initial = initial;
  state.fullscreenSiteState.draft = cloneFullscreenSiteStateValue(initial);
  state.fullscreenSiteState.subdomainEditing = false;
  state.fullscreenSiteState.dismissedDirtySignature = '';
  if (options.preserveStatus !== true) {
    setFullscreenSiteStateStatus('', '');
  }
}

function clearFullscreenSiteState() {
  state.fullscreenSiteState.siteId = '';
  state.fullscreenSiteState.initial = null;
  state.fullscreenSiteState.draft = null;
  state.fullscreenSiteState.subdomainEditing = false;
  state.fullscreenSiteState.dismissedDirtySignature = '';
  setFullscreenSiteStateStatus('', '');
}

function replaceFullscreenDraftSiteState(nextState) {
  state.fullscreenSiteState.draft = cloneFullscreenSiteStateValue(nextState);
}

function updateFullscreenDraftSiteState(patch) {
  const current = getFullscreenDraftSiteState();
  if (!current) {
    return;
  }

  const nextState = {
    ...current,
    ...patch,
  };

  if (Object.prototype.hasOwnProperty.call(patch, 'displayName')) {
    nextState.displayName = normalizeFriendlyName(patch.displayName || '');
  }
  if (Object.prototype.hasOwnProperty.call(patch, 'siteId')) {
    nextState.siteId = sanitizeSiteIdInput(patch.siteId || '');
  }
  if (Object.prototype.hasOwnProperty.call(patch, 'aliases')) {
    nextState.aliases = normalizeAliasList(patch.aliases || []);
  }
  if (Object.prototype.hasOwnProperty.call(patch, 'manualRankInput')) {
    const rankInfo = parseFullscreenSiteStateRankInput(patch.manualRankInput);
    nextState.manualRankInput = rankInfo.raw;
    if (rankInfo.valid) {
      nextState.manualRank = rankInfo.numeric;
    }
  } else if (Object.prototype.hasOwnProperty.call(patch, 'manualRank')) {
    const rankInfo = parseFullscreenSiteStateRankInput(patch.manualRank);
    if (rankInfo.valid) {
      nextState.manualRank = rankInfo.numeric;
      nextState.manualRankInput = rankInfo.raw || String(rankInfo.numeric);
    }
  }
  if (Object.prototype.hasOwnProperty.call(patch, 'operatorNote')) {
    nextState.operatorNote = normalizeSiteNoteText(patch.operatorNote || '');
  }
  if (Object.prototype.hasOwnProperty.call(patch, 'isPublic')) {
    nextState.isPublic = patch.isPublic === true;
  }
  if (Object.prototype.hasOwnProperty.call(patch, 'mainSite')) {
    nextState.mainSite = patch.mainSite === true;
  }
  if (Object.prototype.hasOwnProperty.call(patch, 'tags')) {
    nextState.tags = normalizeManagedTagList(patch.tags || []);
  }

  replaceFullscreenDraftSiteState(nextState);
  const dirtySignature = getFullscreenDirtySignature();
  if (dirtySignature && dirtySignature !== state.fullscreenSiteState.dismissedDirtySignature) {
    state.fullscreenSiteState.dismissedDirtySignature = '';
  }
  syncFullscreenTitlePreview();
}

function getFullscreenFriendlyNameInitial() {
  return getFullscreenInitialSiteState()?.displayName ?? '';
}

function isFullscreenFriendlyNameDirty() {
  return getFullscreenSiteStateDirtyFields().includes('title');
}

function updateFullscreenFriendlyNameStatus(message = '', tone = '') {
  setFullscreenSiteStateStatus(message, tone);
  syncFullscreenFooterStatus();
}

function syncFullscreenFriendlyNameEditorControls() {
  syncFullscreenSiteStateControls();
}

function renderFullscreenFriendlyNameEditor(entry) {
  renderFullscreenSiteStateEditor(entry);
}

function clearFullscreenFriendlyNameEditor() {
  clearFullscreenSiteState();
  syncFullscreenSiteStateControls();
}

function getFullscreenNoteInitial() {
  return getFullscreenInitialSiteState()?.operatorNote ?? '';
}

function getFullscreenRankInitial() {
  return getFullscreenInitialSiteState()?.manualRankInput ?? '';
}

function parseFullscreenRankDraft() {
  const rankInfo = parseFullscreenSiteStateRankInput(
    getFullscreenDraftSiteState()?.manualRankInput ?? fullscreenRankInputEl?.value ?? ''
  );
  return rankInfo.valid ? rankInfo.numeric : null;
}

function syncFullscreenNoteTextareaSize() {
}

function isFullscreenNoteDirty() {
  return getFullscreenSiteStateDirtyFields().includes('note');
}

function isFullscreenRankDirty() {
  return getFullscreenSiteStateDirtyFields().includes('rank');
}

function updateFullscreenNoteStatus(message, tone = '') {
  setFullscreenSiteStateStatus(message, tone);
  syncFullscreenFooterStatus();
}

function getFullscreenAliasesInitial() {
  return formatAliasList(getFullscreenInitialSiteState()?.aliases || []);
}

function isFullscreenAliasesDirty() {
  return getFullscreenSiteStateDirtyFields().includes('aliases');
}

function updateFullscreenAliasesStatus(message = '', tone = '') {
  setFullscreenSiteStateStatus(message, tone);
  syncFullscreenFooterStatus();
}

function syncFullscreenAliasEditorControls() {
  syncFullscreenSiteStateControls();
}

function renderFullscreenAliasEditor(entry) {
  renderFullscreenSiteStateEditor(entry);
}

function clearFullscreenAliasEditor() {
  clearFullscreenSiteState();
  syncFullscreenSiteStateControls();
}

function syncFullscreenNoteEditorControls() {
  syncFullscreenSiteStateControls();
}

function focusFullscreenNoteEditor() {
  fullscreenFriendlyNameInputEl?.focus();
  fullscreenFriendlyNameInputEl?.select?.();
}

function describeFullscreenSiteStateField(field) {
  switch (field) {
    case 'siteId':
    case 'subdomain':
      return 'subdomain';
    case 'displayName':
    case 'title':
      return 'title';
    case 'aliases':
      return 'aliases';
    case 'manualRank':
    case 'rank':
      return 'rank';
    case 'operatorNote':
    case 'note':
      return 'note';
    case 'isPublic':
    case 'privacy':
      return 'privacy';
    case 'mainSite':
    case 'main':
      return 'main site';
    case 'tags':
      return 'tags';
    default:
      return String(field || '').trim();
  }
}

function formatFullscreenSiteStateFieldList(fields = []) {
  const labels = fields.map((field) => describeFullscreenSiteStateField(field)).filter(Boolean);
  if (labels.length <= 1) {
    return labels[0] || '';
  }
  if (labels.length === 2) {
    return `${labels[0]} and ${labels[1]}`;
  }
  return `${labels.slice(0, -1).join(', ')}, and ${labels[labels.length - 1]}`;
}

function getFullscreenSiteStateDirtyFields(entry = state.fullscreenEntry) {
  const initial = getFullscreenInitialSiteState(entry);
  const draft = getFullscreenDraftSiteState(entry);
  if (!initial || !draft) {
    return [];
  }

  const dirtyFields = [];

  if (draft.siteId !== initial.siteId) dirtyFields.push('subdomain');
  if (draft.displayName !== initial.displayName) dirtyFields.push('title');
  if (formatAliasList(draft.aliases) !== formatAliasList(initial.aliases)) dirtyFields.push('aliases');
  if (draft.isPublic !== initial.isPublic) dirtyFields.push('privacy');
  if (draft.mainSite !== initial.mainSite) dirtyFields.push('main');
  if (normalizeManagedTagList(draft.tags).join(',') !== normalizeManagedTagList(initial.tags).join(',')) dirtyFields.push('tags');
  return dirtyFields;
}

function isFullscreenSiteStateDirty(entry = state.fullscreenEntry) {
  return getFullscreenSiteStateDirtyFields(entry).length > 0;
}

function getFullscreenDirtySignature(entry = state.fullscreenEntry) {
  const initial = getFullscreenInitialSiteState(entry);
  const draft = getFullscreenDraftSiteState(entry);
  if (!initial || !draft) {
    return '';
  }
  const dirtyFields = getFullscreenSiteStateDirtyFields(entry);
  if (dirtyFields.length === 0) {
    return '';
  }
  return JSON.stringify({
    siteId: initial.siteId,
    dirtyFields,
    draft: {
      siteId: draft.siteId,
      displayName: draft.displayName,
      aliases: normalizeAliasList(draft.aliases),
      manualRankInput: draft.manualRankInput,
      isPublic: draft.isPublic,
      mainSite: draft.mainSite,
      tags: normalizeManagedTagList(draft.tags),
    },
  });
}

function buildFullscreenFooterPreviewStatus() {
  if (!state.fullscreenEntry) {
    return '';
  }
  if (getActiveFullscreenTimelineSnapshot(state.fullscreenEntry)) {
    return 'Previewing saved version. Live site unchanged.';
  }

  const media = resolveFullscreenStageMedia(state.fullscreenEntry);
  return getFullscreenPreviewStatusText(state.fullscreenEntry, media);
}

function renderFullscreenSiteStateEditor(entry, options = {}) {
  if (!entry) {
    clearFullscreenSiteState();
    if (fullscreenPropertiesDockEl) {
      fullscreenPropertiesDockEl.dataset.siteId = '';
      fullscreenPropertiesDockEl.dataset.initialRank = '';
    }
    if (fullscreenFriendlyNameInputEl) {
      fullscreenFriendlyNameInputEl.dataset.initialFriendlyName = '';
      fullscreenFriendlyNameInputEl.value = '';
      fullscreenFriendlyNameInputEl.disabled = true;
    }
    if (fullscreenSiteLinkEl) {
      fullscreenSiteLinkEl.href = '#';
      fullscreenSiteLinkEl.textContent = '';
      fullscreenSiteLinkEl.classList.remove('is-hidden');
    }
    syncFullscreenGroupedSiteSelect(null, false);
    if (fullscreenRenameInputEl) {
      fullscreenRenameInputEl.dataset.currentSiteId = '';
      fullscreenRenameInputEl.value = '';
      fullscreenRenameInputEl.disabled = true;
    }
    if (fullscreenAliasesInputEl) {
      fullscreenAliasesInputEl.dataset.initialAliases = '';
      fullscreenAliasesInputEl.value = '';
      fullscreenAliasesInputEl.placeholder = buildAliasPlaceholder('');
      fullscreenAliasesInputEl.disabled = true;
    }
    if (fullscreenRankInputEl) {
      fullscreenRankInputEl.value = '';
      fullscreenRankInputEl.disabled = true;
    }
    syncFullscreenSiteStateControls();
    return;
  }

  if (!hasActiveFullscreenSiteState(entry) || options.reset === true) {
    initializeFullscreenSiteState(entry, { preserveStatus: options.preserveStatus === true });
  }

  const initial = getFullscreenInitialSiteState(entry);
  const draft = getFullscreenDraftSiteState(entry);
  if (!initial || !draft) {
    return;
  }

  if (fullscreenPropertiesDockEl) {
    fullscreenPropertiesDockEl.dataset.siteId = entry.siteId || '';
    fullscreenPropertiesDockEl.dataset.initialRank = initial.manualRankInput;
  }
  if (fullscreenSiteLinkEl) {
    const href = getHostedSiteUrlForEntry(entry);
    const host = entry.host || (initial.siteId ? `${initial.siteId}.${BASE_DOMAIN}` : '');
    fullscreenSiteLinkEl.href = href;
    fullscreenSiteLinkEl.textContent = host;
    fullscreenSiteLinkEl.title = host ? `Open ${host}` : '';
  }
  if (fullscreenRenameInputEl) {
    fullscreenRenameInputEl.dataset.currentSiteId = initial.siteId || '';
    if (fullscreenRenameInputEl.value !== draft.siteId) {
      fullscreenRenameInputEl.value = draft.siteId;
    }
  }
  if (fullscreenFriendlyNameInputEl) {
    fullscreenFriendlyNameInputEl.dataset.initialFriendlyName = initial.displayName;
    if (fullscreenFriendlyNameInputEl.value !== draft.displayName) {
      fullscreenFriendlyNameInputEl.value = draft.displayName;
    }
  }
  if (fullscreenAliasesInputEl) {
    const initialAliases = formatAliasList(initial.aliases);
    const formattedAliases = formatAliasList(draft.aliases);
    fullscreenAliasesInputEl.dataset.initialAliases = initialAliases;
    fullscreenAliasesInputEl.placeholder = buildAliasPlaceholder(entry.siteId);
    if (fullscreenAliasesInputEl.value !== formattedAliases) {
      fullscreenAliasesInputEl.value = formattedAliases;
    }
  }
  if (fullscreenRankInputEl && fullscreenRankInputEl.value !== draft.manualRankInput) {
    fullscreenRankInputEl.value = draft.manualRankInput;
  }
  syncFullscreenTitlePreview(entry);
  syncFullscreenSiteStateControls();

  if (options.focus === true) {
    focusFullscreenNoteEditor();
  }
}

function syncFullscreenFooterStatus() {
  if (!fullscreenFooterStatusEl) {
    return;
  }

  const dirtyFields = getFullscreenSiteStateDirtyFields();
  const statusMessage = state.fullscreenSiteState.statusMessage
    || (dirtyFields.length > 0 ? `Unsaved changes: ${formatFullscreenSiteStateFieldList(dirtyFields)}.` : buildFullscreenFooterPreviewStatus());
  const statusTone = state.fullscreenSiteState.statusTone || (dirtyFields.length > 0 ? 'info' : '');
  fullscreenFooterStatusEl.textContent = statusMessage || '';
  fullscreenFooterStatusEl.className = statusTone
    ? `fullscreen-modal__footer-status composer-status is-${statusTone}`
    : 'fullscreen-modal__footer-status';
}

function syncFullscreenUnsavedNotice() {
  if (!fullscreenUnsavedNoticeEl) {
    return;
  }
  const signature = getFullscreenDirtySignature();
  const visible = Boolean(signature && signature !== state.fullscreenSiteState.dismissedDirtySignature);
  fullscreenUnsavedNoticeEl.classList.toggle('is-hidden', !visible);
}

function syncFullscreenSiteStateControls() {
  const entry = state.fullscreenEntry;
  const draft = getFullscreenDraftSiteState(entry);
  const initial = getFullscreenInitialSiteState(entry);
  const siteId = entry?.siteId || '';
  const hasEntry = Boolean(entry && draft && initial);
  const editable = canMutateEntry(entry);
  const apiUnavailable = !state.apiBaseUrl;
  const busy = Boolean(siteId) && state.siteStateBusy.has(siteId);
  const dirtyFields = getFullscreenSiteStateDirtyFields(entry);
  const dirtyCount = dirtyFields.length;
  const siteIdValidation = validateFullscreenDraftSiteId(entry);
  const subdomainValid = !dirtyFields.includes('subdomain') || siteIdValidation.valid;
  const aliasesEditable = editable && entry?.hasHostedSite === true;
  const accessToggleable = canToggleSiteAccess(entry);
  const canUseAsMainSite = entry?.siteId === ROOT_SITE_ID || draft?.isPublic === true;
  const mainNoop = Boolean(initial?.mainSite && draft?.mainSite);

  if (fullscreenPropertiesDockEl) {
    fullscreenPropertiesDockEl.classList.toggle('is-read-only', hasEntry && !editable);
  }

  if (fullscreenFriendlyNameInputEl) {
    fullscreenFriendlyNameInputEl.readOnly = hasEntry && !editable;
    fullscreenFriendlyNameInputEl.disabled = !hasEntry || busy || apiUnavailable;
  }
  if (fullscreenAliasesInputEl) {
    fullscreenAliasesInputEl.readOnly = hasEntry && !aliasesEditable;
    fullscreenAliasesInputEl.disabled = !hasEntry || busy || apiUnavailable || !aliasesEditable;
  }
  if (fullscreenRankInputEl) {
    fullscreenRankInputEl.readOnly = hasEntry && !editable;
    fullscreenRankInputEl.disabled = !hasEntry || busy || apiUnavailable;
  }
  if (fullscreenWhitelistButton) {
    const isPublic = draft?.isPublic === true;
    fullscreenWhitelistButton.classList.toggle('is-public', isPublic);
    fullscreenWhitelistButton.classList.toggle('is-private', hasEntry && !isPublic);
    fullscreenWhitelistButton.classList.toggle('is-active', isPublic);
    fullscreenWhitelistButton.setAttribute('aria-pressed', isPublic ? 'true' : 'false');
    fullscreenWhitelistButton.disabled = !hasEntry || busy || apiUnavailable || !accessToggleable;
    setFullscreenActionButtonState(fullscreenWhitelistButton, {
      busy: false,
      idleIcon: isPublic ? 'ti ti-world' : 'ti ti-lock',
      idleLabel: isPublic ? 'Public' : 'Private',
      busyLabel: 'Saving…',
    });
    fullscreenWhitelistButton.title = !hasEntry
      ? 'Pick a site first.'
      : !accessToggleable
        ? 'Only hosted, mutable sites can change direct-host privacy.'
        : busy
          ? 'Saving…'
          : isPublic
            ? `Stage ${siteId} as private.`
            : `Stage ${siteId} as public.`;
  }

  if (fullscreenMainButton) {
    fullscreenMainButton.classList.toggle('is-active', draft?.mainSite === true);
    fullscreenMainButton.setAttribute('aria-pressed', draft?.mainSite === true ? 'true' : 'false');
    fullscreenMainButton.disabled = !hasEntry || busy || apiUnavailable || !editable || (!canUseAsMainSite && draft?.mainSite !== true) || mainNoop;
    fullscreenMainButton.title = !hasEntry
      ? 'Pick a site first.'
      : !editable
        ? 'Read-only row.'
        : mainNoop
          ? `${siteId} is the current main site for mullmania.com`
          : !canUseAsMainSite
            ? 'Make this site public before using it as mullmania.com.'
            : draft?.mainSite === true
              ? `Undo the staged main-site change for ${siteId}.`
              : `Stage ${siteId} as the main site for mullmania.com.`;
  }

  if (fullscreenSiteStateSaveButton) {
    const saveDisabled = !hasEntry || !editable || apiUnavailable || busy || dirtyCount === 0 || !subdomainValid;
    fullscreenSiteStateSaveButton.disabled = saveDisabled;
    fullscreenSiteStateSaveButton.classList.toggle('is-dirty', dirtyCount > 0 && !saveDisabled && !busy);
    setFullscreenActionButtonState(fullscreenSiteStateSaveButton, {
      busy,
      idleIcon: 'ti ti-device-floppy',
      idleLabel: 'Save',
      busyLabel: 'Saving…',
    });
    fullscreenSiteStateSaveButton.title = !hasEntry
      ? 'Pick a site first.'
      : !editable
        ? 'Read-only row.'
        : apiUnavailable
          ? COMPOSER_UNAVAILABLE_MESSAGE
          : busy
            ? `Saving ${siteId}…`
            : dirtyCount === 0
              ? 'No site-state changes yet.'
              : !subdomainValid
                ? 'Subdomain must be valid before saving.'
                : `Save ${dirtyCount} pending change${dirtyCount === 1 ? '' : 's'} for ${siteId}.`;
  }

  syncFullscreenTagEditorControls();
  syncFullscreenFooterStatus();
  syncFullscreenUnsavedNotice();
}

function toggleFullscreenDraftSiteAccess() {
  const entry = state.fullscreenEntry;
  const draft = getFullscreenDraftSiteState(entry);
  if (!entry || !draft || !canToggleSiteAccess(entry)) {
    return;
  }
  if (draft.mainSite === true && draft.isPublic === true) {
    updateFullscreenNoteStatus('Main sites must stay public.', 'warning');
    return;
  }
  updateFullscreenDraftSiteState({ isPublic: !draft.isPublic });
  syncFullscreenSiteStateControls();
}

function toggleFullscreenDraftMainSite() {
  const entry = state.fullscreenEntry;
  const draft = getFullscreenDraftSiteState(entry);
  const initial = getFullscreenInitialSiteState(entry);
  if (!entry || !draft || !initial || !canMutateEntry(entry)) {
    return;
  }
  if (initial.mainSite && draft.mainSite) {
    return;
  }
  if (!draft.mainSite) {
    if (entry.siteId !== ROOT_SITE_ID && draft.isPublic !== true) {
      updateFullscreenNoteStatus('Make this site public before using it as mullmania.com.', 'warning');
      return;
    }
    updateFullscreenDraftSiteState({ mainSite: true });
    syncFullscreenSiteStateControls();
    return;
  }
  updateFullscreenDraftSiteState({ mainSite: false });
  syncFullscreenSiteStateControls();
}

function renderFullscreenNoteEditor(entry, options = {}) {
  renderFullscreenSiteStateEditor(entry, options);
}

function clearFullscreenNoteEditor() {
  clearFullscreenSiteState();
  syncFullscreenSiteStateControls();
}

async function saveFullscreenFriendlyName() {
  return saveFullscreenSiteState();
}

async function saveFullscreenNote() {
  return saveFullscreenSiteState();
}

async function saveFullscreenRank() {
  return saveFullscreenSiteState();
}

async function saveFullscreenAliases() {
  return saveFullscreenSiteState();
}

function buildFullscreenSiteStateSuccessMessage(data, siteId) {
  const changedFields = Array.isArray(data?.changed) ? data.changed : [];
  if (changedFields.length === 0) {
    return `No site-state changes were needed for ${siteId}.`;
  }
  return `Saved ${formatFullscreenSiteStateFieldList(changedFields)} for ${siteId}.`;
}

async function persistSiteTagMutation(siteId, action, tagId, operatorKey) {
  const label = getManagedTagLabel(tagId);
  const response = await fetch(`${state.apiBaseUrl}/api/catalog/tags/site/${encodeURIComponent(siteId)}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-operator-key': operatorKey,
    },
    body: JSON.stringify({
      action,
      tagId,
      label,
      source: location.hostname,
    }),
  });
  const data = await readJsonResponse(response);
  if (!response.ok) {
    const message = data.error ?? `Tag update failed (${response.status})`;
    if (isInvalidOperatorKeyFailure(response.status, message)) {
      reopenOperatorAccessGate({
        label: 'Saving site state',
        type: PROTECTED_ACTION_SITE_STATE,
        siteId,
      });
    }
    throw new Error(message);
  }
  applyManagedTagRegistryPayload(data);
  return data;
}

async function saveFullscreenTagSet(siteId, initialTags, draftTags, operatorKey) {
  const before = normalizeManagedTagList(initialTags);
  const after = normalizeManagedTagList(draftTags);
  const beforeSet = new Set(before);
  const afterSet = new Set(after);
  const removals = before.filter((tagId) => !afterSet.has(tagId));
  const additions = after.filter((tagId) => !beforeSet.has(tagId));

  if (additions.length === 0 && removals.length === 0) {
    return false;
  }

  state.tagBusy.add(siteId);
  try {
    for (const tagId of removals) {
      await persistSiteTagMutation(siteId, 'remove', tagId, operatorKey);
    }
    for (const tagId of additions) {
      await persistSiteTagMutation(siteId, 'add', tagId, operatorKey);
    }
    return true;
  } finally {
    state.tagBusy.delete(siteId);
  }
}

async function saveFullscreenSiteState() {
  const entry = state.fullscreenEntry;
  const initial = cloneFullscreenSiteStateValue(getFullscreenInitialSiteState(entry));
  const draft = cloneFullscreenSiteStateValue(getFullscreenDraftSiteState(entry));
  const dirtyFields = getFullscreenSiteStateDirtyFields(entry);
  const siteId = initial?.siteId || entry?.siteId || '';
  if (!entry || !initial || !draft) {
    setFullscreenSiteStateStatus('Pick a site first.', 'warning');
    syncFullscreenFooterStatus();
    return false;
  }
  if (!canMutateEntry(entry)) {
    setFullscreenSiteStateStatus('Read-only rows cannot be changed here.', 'warning');
    syncFullscreenFooterStatus();
    return false;
  }
  if (!state.apiBaseUrl) {
    setFullscreenSiteStateStatus(COMPOSER_UNAVAILABLE_MESSAGE, 'warning');
    syncFullscreenFooterStatus();
    return false;
  }
  if (dirtyFields.length === 0) {
    setFullscreenSiteStateStatus('No site-state changes yet.', 'info');
    syncFullscreenFooterStatus();
    return false;
  }

  const siteIdValidation = validateFullscreenDraftSiteId(entry);
  if (dirtyFields.includes('subdomain') && !siteIdValidation.valid) {
    setFullscreenSiteStateStatus(siteIdValidation.message || 'Subdomain must be valid before saving.', 'warning');
    syncFullscreenFooterStatus();
    state.fullscreenSiteState.subdomainEditing = true;
    syncFullscreenRenameControls();
    fullscreenRenameInputEl?.focus();
    return false;
  }

  const rankInfo = parseFullscreenSiteStateRankInput(draft.manualRankInput);

  if (draft.mainSite === true && draft.isPublic !== true && siteId !== ROOT_SITE_ID) {
    setFullscreenSiteStateStatus('Main sites must stay public.', 'warning');
    syncFullscreenFooterStatus();
    return false;
  }

  const operatorKey = resolveOperatorKeyForProtectedAction({
    label: 'Saving site state',
    type: PROTECTED_ACTION_SITE_STATE,
    siteId,
  });
  if (!operatorKey) {
    setFullscreenSiteStateStatus('Open Settings and paste the operator key once to save site state.', 'warning');
    syncFullscreenFooterStatus();
    return false;
  }

  state.siteStateBusy.add(siteId);
  if (draft.siteId && draft.siteId !== siteId) {
    state.siteStateBusy.add(draft.siteId);
  }
  setFullscreenSiteStateStatus(`Saving ${siteId}…`, 'info');
  closeFullscreenTagPicker();
  syncFullscreenSiteStateControls();

  try {
    const changedLabels = [];
    const titleTargetSiteIds = getFullscreenFriendlyNameTargetSiteIds(entry);
    let activeSiteId = siteId;
    let activeEntry = entry;

    if (dirtyFields.includes('subdomain') && draft.siteId !== siteId) {
      const renameResult = await renameSiteById(siteId, draft.siteId, {
        operatorKey,
        actionLabel: {
          label: 'Saving site state',
          type: PROTECTED_ACTION_SITE_STATE,
          siteId,
        },
      });
      if (!renameResult.ok) {
        throw new Error(renameResult.error || 'Rename failed.');
      }
      activeSiteId = renameResult.data?.siteId || draft.siteId;
      activeEntry = renameResult.entry || findEntryBySiteId(activeSiteId) || activeEntry;
      changedLabels.push('subdomain');
    }

    const stateDirtyFields = dirtyFields.filter((field) => field !== 'subdomain' && field !== 'tags');
    if (stateDirtyFields.length > 0) {
      const titleDirty = dirtyFields.includes('title');
      const response = await fetch(`${state.apiBaseUrl}/api/catalog/site-state/${encodeURIComponent(activeSiteId)}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-operator-key': operatorKey,
        },
        body: JSON.stringify({
          state: {
            siteId: activeSiteId,
            displayName: titleDirty ? draft.displayName : buildDisplayTitle(activeEntry),
            siteIds: titleTargetSiteIds.map((targetSiteId) => targetSiteId === siteId ? activeSiteId : targetSiteId),
            aliases: draft.aliases,
            manualRank: rankInfo.numeric,
            operatorNote: draft.operatorNote,
            isPublic: draft.isPublic === true,
            mainSite: draft.mainSite === true,
          },
        }),
      });
      const data = await readJsonResponse(response);
      if (!response.ok) {
        const message = data.error ?? `Site-state save failed (${response.status})`;
        if (isInvalidOperatorKeyFailure(response.status, message)) {
          reopenOperatorAccessGate({
            label: 'Saving site state',
            type: PROTECTED_ACTION_SITE_STATE,
            siteId: activeSiteId,
          });
        }
        throw new Error(message);
      }
      changedLabels.push(...(Array.isArray(data?.changed) ? data.changed : stateDirtyFields));
    }

    if (dirtyFields.includes('tags')) {
      const savedTags = await saveFullscreenTagSet(activeSiteId, initial.tags, draft.tags, operatorKey);
      if (savedTags) {
        changedLabels.push('tags');
      }
    }

    await refreshCatalogAndRestoreFullscreen(activeSiteId);
    if (!fullscreenModalEl.classList.contains('is-hidden') && state.fullscreenEntry?.siteId === activeSiteId) {
      renderFullscreenSiteStateEditor(state.fullscreenEntry, { reset: true, preserveStatus: true });
      syncFullscreenSiteStateControls();
    }

    setFullscreenSiteStateStatus(
      changedLabels.length > 0
        ? `Saved ${formatFullscreenSiteStateFieldList(changedLabels)} for ${activeSiteId}.`
        : `No site-state changes were needed for ${activeSiteId}.`,
      'success'
    );
    syncFullscreenFooterStatus();
    return true;
  } catch (error) {
    setFullscreenSiteStateStatus(error.message, 'error');
    syncFullscreenFooterStatus();
    return false;
  } finally {
    state.siteStateBusy.delete(siteId);
    if (draft?.siteId) {
      state.siteStateBusy.delete(draft.siteId);
    }
    syncFullscreenSiteStateControls();
  }
}

function ensureFullscreenNoteSaved(targetLabel = 'leave this site') {
  const entry = state.fullscreenEntry;
  const dirtyFields = getFullscreenSiteStateDirtyFields(entry);
  if (!entry || dirtyFields.length === 0) {
    return true;
  }

  const message = `Save the ${formatFullscreenSiteStateFieldList(dirtyFields)} for ${entry.siteId} before you ${targetLabel}.`;
  setFullscreenSiteStateStatus(message, 'warning');
  syncFullscreenFooterStatus();

  if (dirtyFields.includes('title')) {
    fullscreenFriendlyNameInputEl?.focus();
    fullscreenFriendlyNameInputEl?.select?.();
  } else if (dirtyFields.includes('aliases')) {
    fullscreenAliasesInputEl?.focus();
    fullscreenAliasesInputEl?.select?.();
  } else if (dirtyFields.includes('privacy')) {
    fullscreenWhitelistButton?.focus();
  } else if (dirtyFields.includes('main')) {
    fullscreenMainButton?.focus();
  }

  return false;
}

function navigateFullscreenPreview(delta) {
  const entries = getFullscreenEntries();
  if (entries.length === 0 || !state.fullscreenEntry) {
    return;
  }

  if (!ensureFullscreenNoteSaved('move to another site')) {
    return;
  }

  const currentIndex = getFullscreenEntryIndex();
  const safeIndex = currentIndex === -1 ? 0 : currentIndex;
  const nextIndex = (safeIndex + delta + entries.length) % entries.length;
  openFullscreenPreview(entries[nextIndex], { mode: state.fullscreenMode });
}

function openFullscreenSite() {
  if (!state.fullscreenEntry?.url) {
    return;
  }
  window.open(state.fullscreenEntry.url, '_blank', 'noreferrer');
}

function buildInstallIntentUrl(entry = state.fullscreenEntry) {
  const rawUrl = entry?.url || (entry?.host ? `https://${entry.host}/` : '');
  if (!rawUrl) {
    return '';
  }
  try {
    const targetUrl = new URL(rawUrl, window.location.href);
    targetUrl.searchParams.set('install', '1');
    targetUrl.searchParams.set('utm_source', 'sites-launchpad');
    targetUrl.searchParams.set('utm_medium', 'pwa-install');
    return targetUrl.toString();
  } catch {
    return rawUrl;
  }
}

function openFullscreenUseAsApp() {
  const targetUrl = buildInstallIntentUrl(state.fullscreenEntry);
  if (!targetUrl) {
    return;
  }
  window.open(targetUrl, '_blank', 'noopener,noreferrer');
  setFullscreenSiteStateStatus('Opened app install flow. Use Install or Add to Home Screen there.', 'info');
  syncFullscreenFooterStatus();
}

function toggleBrowserFullscreen() {
  if (typeof document === 'undefined' || !fullscreenModalEl) {
    return;
  }
  const panel = fullscreenModalEl.querySelector('.fullscreen-modal__panel');
  if (!(panel instanceof HTMLElement)) {
    return;
  }
  if (document.fullscreenElement) {
    document.exitFullscreen?.().catch(() => {});
    return;
  }
  panel.requestFullscreen?.().catch(() => {});
}

function toggleFullscreenQrPreview() {
}

function handleFullscreenKeyboardEntry(event) {
  if (event.defaultPrevented || fullscreenModalEl.classList.contains('is-hidden') || !state.fullscreenEntry) {
    return;
  }

  if (!composerModalEl.classList.contains('is-hidden') || isEditableKeyTarget(event.target)) {
    return;
  }

  switch (event.key) {
    case 'ArrowLeft':
    case 'PageUp':
      event.preventDefault();
      navigateFullscreenPreview(-1);
      break;
    case 'ArrowRight':
    case 'PageDown':
      event.preventDefault();
      navigateFullscreenPreview(1);
      break;
    case 'Enter':
    case 'o':
    case 'O':
      event.preventDefault();
      openFullscreenSite();
      break;
    case 'Backspace':
      event.preventDefault();
      closeFullscreenPreview();
      break;
    case 'f':
    case 'F':
      event.preventDefault();
      toggleBrowserFullscreen();
      break;
    default:
      break;
  }
}

function handleTvKeyboardEntry(event) {
  if (event.defaultPrevented || state.viewMode !== 'tv' || state.swipeMode) {
    return;
  }

  if (!composerModalEl.classList.contains('is-hidden') || !fullscreenModalEl.classList.contains('is-hidden') || isEditableKeyTarget(event.target)) {
    return;
  }

  const currentEntry = getCurrentTvEntry();
  if (!currentEntry) {
    return;
  }

  switch (event.key) {
    case 'ArrowLeft':
      event.preventDefault();
      navigateTv(-1);
      break;
    case 'ArrowRight':
      event.preventDefault();
      navigateTv(1);
      break;
    case 'ArrowUp':
      if (!hasMultipleVersions(currentEntry)) {
        return;
      }
      event.preventDefault();
      cycleFamilyVersion(currentEntry, -1);
      break;
    case 'ArrowDown':
      if (!hasMultipleVersions(currentEntry)) {
        return;
      }
      event.preventDefault();
      cycleFamilyVersion(currentEntry, 1);
      break;
    case 'Enter':
      event.preventDefault();
      openFullscreenPreview(currentEntry);
      break;
    case ' ':
    case 'Spacebar':
    case 'k':
    case 'K':
      event.preventDefault();
      toggleTvPlayback(currentEntry);
      break;
    case 'Backspace':
      event.preventDefault();
      setViewMode('table');
      break;
    case 'o':
    case 'O':
      event.preventDefault();
      if (currentEntry.url) {
        window.open(currentEntry.url, '_blank', 'noreferrer');
      }
      break;
    case '/':
      event.preventDefault();
      searchEl?.focus();
      searchEl?.select?.();
      break;
    default:
      break;
  }
}

function enterTableKeyboardMode(mode) {
  if (state.visibleEntries.length === 0) {
    return;
  }

  ensureActiveTableSite(state.visibleEntries);

  if (mode === 'up' && state.visibleEntries.length > 0 && !state.activeTableSiteId) {
    state.activeTableSiteId = state.visibleEntries[state.visibleEntries.length - 1].siteId;
  }

  restoreActiveTableRow(true);

  switch (mode) {
    case 'page-down':
      moveActiveTableRow(getTablePageStep());
      break;
    case 'page-up':
      moveActiveTableRow(-getTablePageStep());
      break;
    default:
      break;
  }
}

const previewQueue = { pending: [], active: 0, max: 3, delayMs: 200 };
const previewCache = new Map();
const previewResolvedUrlCache = new Map();

function getPreviewQueueCacheKey(img, url) {
  const resizeWidth = img?.dataset?.previewResizeWidth || '';
  const resizeHeight = img?.dataset?.previewResizeHeight || '';
  const resizeMax = img?.dataset?.previewResizeMax || '';
  const resizeFormat = img?.dataset?.previewResizeFormat || '';
  const resizeQuality = img?.dataset?.previewResizeQuality || '';
  return (resizeWidth || resizeHeight || resizeMax || resizeFormat || resizeQuality)
    ? `resize:${resizeWidth}:${resizeHeight}:${resizeMax}:${resizeFormat}:${resizeQuality}:${url}`
    : url;
}

function getStoredPreviewResizeUrl(cacheKey) {
  try {
    return sessionStorage.getItem(`mullmania-preview-resize:${cacheKey}`) || '';
  } catch {
    return '';
  }
}

function storePreviewResizeUrl(cacheKey, url) {
  if (!url) {
    return;
  }
  previewResolvedUrlCache.set(cacheKey, url);
  try {
    sessionStorage.setItem(`mullmania-preview-resize:${cacheKey}`, url);
  } catch {
    /* sessionStorage can be disabled or full; the in-memory cache still helps this page view. */
  }
}

function escapeCssAttributeValue(value) {
  return String(value || '').replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

function updateRenderedPreviewCacheKey(cacheKey, url) {
  if (!cacheKey || !url) {
    return;
  }
  document.querySelectorAll(`img[data-preview-cache-key="${escapeCssAttributeValue(cacheKey)}"]`).forEach((img) => {
    applyLoadedPreview(img, url);
  });
}

function updateRenderedPreviewCacheFallbacks(cacheKey) {
  if (!cacheKey) {
    return;
  }
  document.querySelectorAll(`img[data-preview-cache-key="${escapeCssAttributeValue(cacheKey)}"]`).forEach((img) => {
    applyPreviewFallback(img);
  });
}

async function resolvePreviewQueueUrl(img, url, cacheKey) {
  const resizeWidth = Math.round(Number(img?.dataset?.previewResizeWidth || 0));
  const resizeHeight = Math.round(Number(img?.dataset?.previewResizeHeight || 0));
  const resizeMax = Math.round(Number(img?.dataset?.previewResizeMax || 0));
  const resizeFormat = String(img?.dataset?.previewResizeFormat || '').trim();
  const resizeQuality = Math.round(Number(img?.dataset?.previewResizeQuality || 0));
  if (!resizeWidth && !resizeHeight && !resizeMax) {
    return url;
  }

  const cachedUrl = previewResolvedUrlCache.get(cacheKey) || getStoredPreviewResizeUrl(cacheKey);
  if (cachedUrl) {
    previewResolvedUrlCache.set(cacheKey, cachedUrl);
    return cachedUrl;
  }

  const requestUrl = buildPreviewResizeRequestUrl(url, {
    width: resizeWidth,
    height: resizeHeight,
    max: resizeMax,
    format: resizeFormat || 'webp',
    quality: resizeQuality || 72,
  });
  if (!requestUrl) {
    return url;
  }

  const response = await fetch(requestUrl);
  if (!response.ok) {
    throw new Error(`Preview resize failed (${response.status}).`);
  }
  const payload = await response.json();
  const resizedUrl = String(payload?.url || '').trim();
  if (!resizedUrl) {
    throw new Error('Preview resize response did not include a URL.');
  }
  storePreviewResizeUrl(cacheKey, resizedUrl);
  return resizedUrl;
}

function drainPreviewQueue() {
  previewQueue.pending = previewQueue.pending.filter((img, index, pending) => img && img.isConnected && pending.indexOf(img) === index);

  while (previewQueue.pending.length > 0 && previewQueue.active < previewQueue.max) {
    const img = previewQueue.pending.shift();
    const url = img?.dataset?.src;
    const siteId = img?.dataset?.previewSiteId || '';
    const cacheKey = getPreviewQueueCacheKey(img, url);
    const propagatesToSite = cacheKey === url && Boolean(siteId);
    if (!img || !img.isConnected || !url || img.dataset.previewState === 'loaded' || img.dataset.previewState === 'error') {
      continue;
    }

    const cachedState = previewCache.get(cacheKey);
    if (cachedState === 'done') {
      const resolvedUrl = previewResolvedUrlCache.get(cacheKey) || url;
      if (propagatesToSite) {
        updateRenderedPreviewImages(siteId, resolvedUrl);
      } else {
        updateRenderedPreviewCacheKey(cacheKey, resolvedUrl);
      }
      continue;
    }
    if (cachedState === 'error') {
      if (propagatesToSite) {
        updateRenderedPreviewFallbacks(siteId);
      } else {
        updateRenderedPreviewCacheFallbacks(cacheKey);
      }
      continue;
    }
    if (cachedState === 'loading') {
      continue;
    }

    previewQueue.active += 1;
    previewCache.set(cacheKey, 'loading');
    const loader = new Image();
    loader.decoding = 'async';
    loader.addEventListener('load', () => {
      const resolvedUrl = previewResolvedUrlCache.get(cacheKey) || loader.src || url;
      previewCache.set(cacheKey, 'done');
      if (propagatesToSite) {
        updateRenderedPreviewImages(siteId, resolvedUrl);
      } else if (img.isConnected) {
        updateRenderedPreviewCacheKey(cacheKey, resolvedUrl);
      }
      onPreviewDone();
    }, { once: true });
    loader.addEventListener('error', async () => {
      try {
        const recoveredUrl = await ensurePreviewAfterMiss(img);
        if (recoveredUrl) {
          previewCache.set(cacheKey, 'done');
          previewCache.set(recoveredUrl, 'done');
          if (propagatesToSite) {
            updateRenderedPreviewImages(siteId, recoveredUrl);
          } else if (img.isConnected) {
            updateRenderedPreviewCacheKey(cacheKey, recoveredUrl);
          }
          return;
        }
        previewCache.set(cacheKey, 'error');
        if (propagatesToSite) {
          updateRenderedPreviewFallbacks(siteId);
        } else if (img.isConnected) {
          updateRenderedPreviewCacheFallbacks(cacheKey);
        }
      } finally {
        onPreviewDone();
      }
    }, { once: true });
    resolvePreviewQueueUrl(img, url, cacheKey)
      .then((resolvedUrl) => {
        previewResolvedUrlCache.set(cacheKey, resolvedUrl);
        loader.src = resolvedUrl;
      })
      .catch((error) => {
        console.warn('Preview resize failed; loading original preview.', error);
        previewResolvedUrlCache.set(cacheKey, url);
        loader.src = url;
      });
  }
}

function onPreviewDone() {
  previewQueue.active -= 1;
  setTimeout(drainPreviewQueue, previewQueue.delayMs);
}

function setupLazyPreviews() {
  if (state.previewObserver) {
    state.previewObserver.disconnect();
    state.previewObserver = null;
  }

  const images = Array.from(document.querySelectorAll('img[data-src]'));
  if (images.length === 0) {
    return;
  }

  state.previewObserver = new IntersectionObserver((entries, observer) => {
    for (const item of entries) {
      if (!item.isIntersecting) {
        continue;
      }

      const img = item.target;
      observer.unobserve(img);
      if (img.dataset.src && img.dataset.previewState === 'placeholder') {
        previewQueue.pending.push(img);
      }
    }
    drainPreviewQueue();
  }, {
    rootMargin: '300px 0px',
    threshold: 0.01,
  });

  for (const img of images) {
    state.previewObserver.observe(img);
  }
}


function getSelectedEntries() {
  return state.entries.filter((entry) => state.selected.has(entry.siteId));
}

function getBulkRenameSelectedEntries() {
  const expandedEntries = [];
  const seenGroupKeys = new Set();
  const seenSiteIds = new Set();

  for (const entry of getSelectedEntries()) {
    const groupKey = getDisplayGroupKey(entry) || entry.siteId;
    const familyMembers = sortFamilyMembers(state.entries.filter((candidate) => getDisplayGroupKey(candidate) === groupKey));
    const entriesToAdd = familyMembers.length > 0 ? familyMembers : [entry];

    if (seenGroupKeys.has(groupKey)) {
      continue;
    }
    seenGroupKeys.add(groupKey);

    for (const member of entriesToAdd) {
      if (!member?.siteId || seenSiteIds.has(member.siteId)) {
        continue;
      }
      seenSiteIds.add(member.siteId);
      expandedEntries.push(member);
    }
  }

  return expandedEntries;
}

function getCurrentContextEntry() {
  if (!fullscreenModalEl.classList.contains('is-hidden') && state.fullscreenEntry) {
    return state.fullscreenEntry;
  }

  if (state.swipeMode) {
    return getCurrentSwipeEntry();
  }

  if (state.viewMode === 'tv') {
    return getCurrentTvEntry();
  }

  if (state.viewMode === 'slideshow') {
    return getCurrentSlideshowEntry();
  }

  if (state.viewMode === 'table') {
    return state.visibleEntries.find((entry) => entry.siteId === state.activeTableSiteId) || state.visibleEntries[0] || null;
  }

  return state.visibleEntries[0] || null;
}

function buildEmptyBulkRenameState() {
  return {
    rows: [],
    step: 'edit',
    sortKey: 'original',
    sortDirection: 'asc',
    started: false,
    running: false,
    finished: false,
    paused: false,
    progressIndex: 0,
    activeRowId: '',
    executionOrder: [],
    statusMessage: '',
    statusTone: '',
  };
}

function isBulkRenameModalOpen() {
  return Boolean(bulkRenameModalEl && !bulkRenameModalEl.classList.contains('is-hidden'));
}

function findBulkRenameRow(rowId) {
  return state.bulkRename.rows.find((row) => row.rowId === rowId) ?? null;
}

function getBulkRenameLockReason(row) {
  const entry = findEntryBySiteId(row.currentSiteId) || findEntryBySiteId(row.initialSiteId);
  if (row.githubBacked || entry?.githubBacked) {
    const repoLabel = row.githubRepo ? ` (${row.githubRepo})` : '';
    return `GitHub-backed${repoLabel}. Rename the repo side first.`;
  }
  if (entry?.categories?.externalCatalog) {
    return 'Imported CSV rows stay read-only in the launchpad.';
  }
  if (!canEditSiteId(row.currentSiteId)) {
    return 'Core Mullmania sites stay managed outside this tool.';
  }
  return '';
}

function setBulkRenameStatus(message = '', tone = '') {
  state.bulkRename.statusMessage = message;
  state.bulkRename.statusTone = tone;
}

function buildBulkRenameRow(entry, overrides = {}) {
  const sourceEntry = findEntryBySiteId(entry?.siteId) || entry;
  const currentDisplayName = getEntryFriendlyName(sourceEntry);
  const nextDisplayName = Object.prototype.hasOwnProperty.call(overrides, 'nextDisplayName')
    ? normalizeFriendlyName(overrides.nextDisplayName)
    : currentDisplayName;
  const nextSiteId = Object.prototype.hasOwnProperty.call(overrides, 'nextSiteId')
    ? normalizeSiteId(overrides.nextSiteId)
    : sourceEntry.siteId;

  return {
    rowId: sourceEntry.siteId,
    initialSiteId: sourceEntry.siteId,
    currentSiteId: sourceEntry.siteId,
    nextSiteId: nextSiteId || sourceEntry.siteId,
    initialDisplayName: currentDisplayName,
    currentDisplayName,
    nextDisplayName,
    githubBacked: sourceEntry.githubBacked === true,
    githubRepo: String(sourceEntry.githubRepo?.fullName || sourceEntry.githubRepo?.name || sourceEntry.githubRepo?.repository || '').trim(),
    phase: 'idle',
    resultMessage: '',
  };
}

function openBulkRenameModal(options = {}) {
  if (!bulkRenameModalEl) {
    return false;
  }

  const explicitEntries = Array.isArray(options.entries)
    ? options.entries
    : null;
  const selectedEntries = explicitEntries || getBulkRenameSelectedEntries();
  if (selectedEntries.length === 0) {
    if (openBulkRenameButton) {
      flashButton(openBulkRenameButton, 'Select some first');
    }
    return false;
  }

  state.bulkRename = {
    ...buildEmptyBulkRenameState(),
    rows: selectedEntries.map((entry) => buildBulkRenameRow(entry, options.rowOverrides?.[entry.siteId] || {})),
  };
  if (options.statusMessage) {
    setBulkRenameStatus(options.statusMessage, options.statusTone || '');
  }

  bulkRenameModalEl.classList.remove('is-hidden');
  renderBulkRenameModal();
  bulkRenamePanelEl?.focus({ preventScroll: true });
  return true;
}

function getBulkRenameMergeEntries(entry) {
  const members = Array.isArray(entry?.familyMembers) && entry.familyMembers.length > 0
    ? entry.familyMembers
    : [entry];
  const seen = new Set();
  return members
    .map((member) => findEntryBySiteId(member?.siteId) || member)
    .filter((member) => {
      if (!member?.siteId || seen.has(member.siteId)) {
        return false;
      }
      seen.add(member.siteId);
      return true;
    });
}

function getDropMergeLabel(entry) {
  const label = normalizeFriendlyName(entry?.family?.label)
    || normalizeFriendlyName(entry?.displayTitle)
    || getEntryFriendlyName(entry)
    || humanizeToken(entry?.displayEntryKey || entry?.siteId);
  return label;
}

function clearRowMergeDragState() {
  state.rowMergeDrag.sourceSiteId = '';
  state.rowMergeDrag.targetSiteId = '';
  document.querySelectorAll('.site-row.is-merge-drag-source, .site-row.is-merge-drop-target, .dense-list-row.is-merge-drag-source, .dense-list-row.is-merge-drop-target')
    .forEach((element) => {
      element.classList.remove('is-merge-drag-source', 'is-merge-drop-target');
    });
}

function openDropMergeRenameModal(sourceSiteId, targetSiteId) {
  const sourceEntry = resolveDisplayEntryForSite(sourceSiteId);
  const targetEntry = resolveDisplayEntryForSite(targetSiteId);
  if (!sourceEntry || !targetEntry || sourceEntry.siteId === targetEntry.siteId) {
    clearRowMergeDragState();
    return false;
  }

  const targetLabel = getDropMergeLabel(targetEntry);
  if (!targetLabel) {
    clearRowMergeDragState();
    return false;
  }

  const mergeEntries = getBulkRenameMergeEntries(sourceEntry).filter((entry) => entry?.siteId !== targetEntry.siteId);
  if (mergeEntries.length === 0) {
    clearRowMergeDragState();
    return false;
  }

  const rowOverrides = {};
  for (const entry of mergeEntries) {
    rowOverrides[entry.siteId] = {
      nextDisplayName: targetLabel,
      nextSiteId: entry.siteId,
    };
  }

  clearRowMergeDragState();
  return openBulkRenameModal({
    entries: mergeEntries,
    rowOverrides,
    statusMessage: `Drop merge draft: ${buildDisplayTitle(sourceEntry)} will join ${targetLabel}. Review, then start updates.`,
    statusTone: '',
  });
}

function getCatalogTagIdFromDragEvent(event) {
  const dataTransferTagId = normalizeManagedTagId(event?.dataTransfer?.getData(TAG_DRAG_MIME) || '');
  const stateTagId = normalizeManagedTagId(state.catalogTagDrag.tagId || '');
  const tagId = dataTransferTagId || stateTagId;
  return CATEGORY_BOARD_TAG_IDS.has(tagId) ? tagId : '';
}

function clearCatalogTagDropTargets() {
  document.querySelectorAll('.is-tag-drop-target, .is-tag-drop-disabled')
    .forEach((element) => {
      element.classList.remove('is-tag-drop-target', 'is-tag-drop-disabled');
    });
}

function clearCatalogTagDragState() {
  state.catalogTagDrag.tagId = '';
  state.catalogTagDrag.targetSiteId = '';
  clearCatalogTagDropTargets();
  toolbarFiltersEl?.querySelectorAll('[data-catalog-tag-filter].is-dragging')
    .forEach((element) => element.classList.remove('is-dragging'));
}

function canDropCatalogTagOnEntry(entry, tagId) {
  return Boolean(
    entry?.siteId
    && tagId
    && canMutateEntry(entry)
    && !state.tagBusy.has(entry.siteId)
    && !getEntryOperatorTags(entry).includes(tagId)
  );
}

function syncCatalogTagDropTarget(element, entry, tagId) {
  const canDrop = canDropCatalogTagOnEntry(entry, tagId);
  element.classList.toggle('is-tag-drop-target', canDrop);
  element.classList.toggle('is-tag-drop-disabled', Boolean(tagId) && !canDrop);
  state.catalogTagDrag.targetSiteId = canDrop ? entry.siteId : '';
  return canDrop;
}

function wireCatalogTagDropTarget(element, entry) {
  if (!(element instanceof HTMLElement) || !entry?.siteId) {
    return;
  }

  element.dataset.tagDropSiteId = entry.siteId;

  element.addEventListener('dragover', (event) => {
    const tagId = getCatalogTagIdFromDragEvent(event);
    if (!tagId) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    const canDrop = syncCatalogTagDropTarget(element, entry, tagId);
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = canDrop ? 'copy' : 'none';
    }
  });

  element.addEventListener('dragleave', (event) => {
    if (event.relatedTarget instanceof Node && element.contains(event.relatedTarget)) {
      return;
    }
    element.classList.remove('is-tag-drop-target', 'is-tag-drop-disabled');
    if (state.catalogTagDrag.targetSiteId === entry.siteId) {
      state.catalogTagDrag.targetSiteId = '';
    }
  });

  element.addEventListener('drop', async (event) => {
    const tagId = getCatalogTagIdFromDragEvent(event);
    if (!tagId) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    const canDrop = syncCatalogTagDropTarget(element, entry, tagId);
    if (!canDrop) {
      clearCatalogTagDragState();
      return;
    }
    element.classList.add('is-tag-drop-saving');
    await addTagToSite(entry.siteId, tagId);
    element.classList.remove('is-tag-drop-saving');
    clearCatalogTagDragState();
  });
}

function wireRowMergeDrag(row, entry) {
  if (!(row instanceof HTMLElement) || !entry?.siteId) {
    return;
  }

  row.draggable = true;
  row.dataset.mergeDropSiteId = entry.siteId;
  row.title = row.title || 'Drag onto another row to open a rename draft for merging.';

  row.addEventListener('dragstart', (event) => {
    const interactiveTarget = event.target instanceof HTMLElement
      ? event.target.closest('a, button, input, label, textarea, select')
      : null;
    if (interactiveTarget) {
      event.preventDefault();
      return;
    }
    state.rowMergeDrag.sourceSiteId = entry.siteId;
    state.rowMergeDrag.targetSiteId = '';
    row.classList.add('is-merge-drag-source');
    event.dataTransfer?.setData('text/plain', entry.siteId);
    event.dataTransfer?.setData('application/x-mullmania-site-id', entry.siteId);
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
    }
  });

  row.addEventListener('dragover', (event) => {
    const sourceSiteId = state.rowMergeDrag.sourceSiteId || event.dataTransfer?.getData('application/x-mullmania-site-id') || '';
    if (!sourceSiteId || sourceSiteId === entry.siteId) {
      return;
    }
    event.preventDefault();
    state.rowMergeDrag.targetSiteId = entry.siteId;
    row.classList.add('is-merge-drop-target');
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move';
    }
  });

  row.addEventListener('dragleave', (event) => {
    if (event.relatedTarget instanceof Node && row.contains(event.relatedTarget)) {
      return;
    }
    row.classList.remove('is-merge-drop-target');
  });

  row.addEventListener('drop', (event) => {
    const sourceSiteId = state.rowMergeDrag.sourceSiteId || event.dataTransfer?.getData('application/x-mullmania-site-id') || event.dataTransfer?.getData('text/plain') || '';
    if (!sourceSiteId || sourceSiteId === entry.siteId) {
      clearRowMergeDragState();
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    openDropMergeRenameModal(sourceSiteId, entry.siteId);
  });

  row.addEventListener('dragend', () => {
    clearRowMergeDragState();
  });
}

function closeBulkRenameModal() {
  if (!bulkRenameModalEl) {
    return;
  }

  if (state.bulkRename.started && !state.bulkRename.finished) {
    setBulkRenameStatus('Finish or resume the update queue before closing.', 'warning');
    renderBulkRenameModal();
    return;
  }

  bulkRenameModalEl.classList.add('is-hidden');
  state.bulkRename = buildEmptyBulkRenameState();
}

function setBulkRenameStep(step) {
  if (!bulkRenameModalEl || state.bulkRename.running) {
    return;
  }
  state.bulkRename.step = step === 'confirm' ? 'confirm' : 'edit';
  if (!state.bulkRename.started) {
    setBulkRenameStatus('', '');
  }
  renderBulkRenameModal();
}

function setBulkRenameSort(sortKey) {
  if (!sortKey) {
    return;
  }
  if (state.bulkRename.sortKey === sortKey) {
    state.bulkRename.sortDirection = state.bulkRename.sortDirection === 'asc' ? 'desc' : 'asc';
  } else {
    state.bulkRename.sortKey = sortKey;
    state.bulkRename.sortDirection = 'asc';
  }
  renderBulkRenameModal();
}

function updateBulkRenameDraft(rowId, field, rawValue) {
  if (state.bulkRename.started) {
    return;
  }
  const row = findBulkRenameRow(rowId);
  if (!row || getBulkRenameLockReason(row)) {
    return;
  }
  if (field === 'displayName') {
    row.nextDisplayName = normalizeFriendlyName(rawValue);
  } else {
    row.nextSiteId = sanitizeSiteIdInput(rawValue);
  }
  row.phase = 'idle';
  row.resultMessage = '';
  state.bulkRename.step = 'edit';
  setBulkRenameStatus('', '');
  renderBulkRenameModal();
}

function isBulkRenameDraftDirty(row, field = '') {
  if (!row) {
    return false;
  }
  const siteIdDirty = normalizeSiteId(row.nextSiteId) !== normalizeSiteId(row.currentSiteId);
  const friendlyNameDirty = normalizeFriendlyName(row.nextDisplayName) !== normalizeFriendlyName(row.currentDisplayName);

  if (field === 'displayName') {
    return friendlyNameDirty;
  }
  if (field === 'siteId') {
    return siteIdDirty;
  }
  return siteIdDirty || friendlyNameDirty;
}

function focusBulkRenameDraftInput(rowId, field = 'siteId') {
  if (!bulkRenameTableBodyEl || !rowId || !field) {
    return;
  }
  const escapedRowId = typeof CSS !== 'undefined' && typeof CSS.escape === 'function'
    ? CSS.escape(rowId)
    : rowId;
  const escapedField = typeof CSS !== 'undefined' && typeof CSS.escape === 'function'
    ? CSS.escape(field)
    : field;
  const input = bulkRenameTableBodyEl.querySelector(`[data-bulk-rename-input][data-row-id="${escapedRowId}"][data-row-field="${escapedField}"]`);
  if (!(input instanceof HTMLInputElement)) {
    return;
  }
  input.focus({ preventScroll: true });
  const caret = input.value.length;
  input.setSelectionRange(caret, caret);
}

function resetBulkRenameDraft(rowId, field, options = {}) {
  if (state.bulkRename.started) {
    return;
  }
  const row = findBulkRenameRow(rowId);
  if (!row || getBulkRenameLockReason(row) || !field) {
    return;
  }
  if (field === 'displayName') {
    row.nextDisplayName = row.currentDisplayName;
  } else {
    row.nextSiteId = row.currentSiteId;
  }
  row.phase = 'idle';
  row.resultMessage = '';
  state.bulkRename.step = 'edit';
  setBulkRenameStatus('', '');
  renderBulkRenameModal();
  if (options.focusInput) {
    focusBulkRenameDraftInput(rowId, field);
  }
}

function removeBulkRenameRow(rowId) {
  if (state.bulkRename.started) {
    return;
  }
  const row = findBulkRenameRow(rowId);
  if (!row) {
    return;
  }
  state.bulkRename.rows = state.bulkRename.rows.filter((candidate) => candidate.rowId !== rowId);
  state.bulkRename.step = 'edit';
  setBulkRenameStatus(`Removed ${row.initialSiteId} from this batch.`, 'info');
  renderBulkRenameModal();
}

function applyBulkRenameTitleToBatch(rowId) {
  if (state.bulkRename.started) {
    return;
  }
  const sourceRow = findBulkRenameRow(rowId);
  if (!sourceRow || getBulkRenameLockReason(sourceRow)) {
    return;
  }
  const nextDisplayName = normalizeFriendlyName(sourceRow.nextDisplayName);
  if (!nextDisplayName) {
    setBulkRenameStatus('Type a title before applying it to the batch.', 'warning');
    renderBulkRenameModal();
    focusBulkRenameDraftInput(rowId, 'displayName');
    return;
  }

  let changedCount = 0;
  let editableCount = 0;
  for (const row of state.bulkRename.rows) {
    if (!row || getBulkRenameLockReason(row)) {
      continue;
    }
    editableCount += 1;
    if (normalizeFriendlyName(row.nextDisplayName) !== nextDisplayName) {
      changedCount += 1;
    }
    row.nextDisplayName = nextDisplayName;
    row.phase = 'idle';
    row.resultMessage = '';
  }

  state.bulkRename.step = 'edit';
  setBulkRenameStatus(
    changedCount > 0
      ? `Applied "${nextDisplayName}" to ${editableCount.toLocaleString()} editable titles.`
      : `All ${editableCount.toLocaleString()} editable titles already match "${nextDisplayName}".`,
    changedCount > 0 ? 'success' : ''
  );
  renderBulkRenameModal();
  focusBulkRenameDraftInput(rowId, 'displayName');
}

function compareBulkRenameRows(left, right, plan) {
  let primary = 0;

  switch (state.bulkRename.sortKey) {
    case 'friendly':
      primary = compareNaturalText(
        normalizeFriendlyName(left?.nextDisplayName || left?.currentDisplayName || ''),
        normalizeFriendlyName(right?.nextDisplayName || right?.currentDisplayName || '')
      );
      break;
    case 'new':
      primary = compareNaturalText(
        normalizeSiteId(left?.nextSiteId),
        normalizeSiteId(right?.nextSiteId)
      );
      break;
    default:
      primary = compareNaturalText(left?.initialSiteId, right?.initialSiteId);
      break;
  }

  const fallback = compareNaturalText(left?.initialSiteId, right?.initialSiteId);
  const direction = state.bulkRename.sortDirection === 'desc' ? -1 : 1;
  return direction * (primary || fallback);
}

function getSortedBulkRenameRows(plan) {
  const effectivePlan = plan || getBulkRenamePlan();
  return [...state.bulkRename.rows].sort((left, right) => compareBulkRenameRows(left, right, effectivePlan));
}

function getBulkRenamePlan() {
  const rows = state.bulkRename.rows;
  const existingEntries = new Map(state.entries.map((entry) => [entry.siteId, entry]));
  const plan = {
    byRowId: new Map(),
    order: [],
    selectedCount: rows.length,
    editableCount: 0,
    lockedCount: 0,
    changedCount: 0,
    readyCount: 0,
    errorCount: 0,
  };
  const candidates = new Map();
  const candidateByCurrentId = new Map();
  const duplicateTargets = new Map();
  const invalidRowIds = new Set();

  for (const row of rows) {
    const lockReason = getBulkRenameLockReason(row);
    if (lockReason) {
      plan.lockedCount += 1;
      plan.byRowId.set(row.rowId, {
        kind: 'lock',
        label: 'LOCK',
        tone: 'lock',
        message: lockReason,
        targetSiteId: row.currentSiteId,
        targetDisplayName: normalizeFriendlyName(row.currentDisplayName),
      });
      continue;
    }

    plan.editableCount += 1;

    const syntax = validateRenameSiteIdSyntax(row.nextSiteId, row.currentSiteId);
    const targetDisplayName = normalizeFriendlyName(row.nextDisplayName);
    const displayNameChanged = targetDisplayName !== normalizeFriendlyName(row.currentDisplayName);
    if (!syntax.valid) {
      plan.errorCount += 1;
      plan.byRowId.set(row.rowId, {
        kind: 'error',
        label: 'ERROR',
        tone: 'error',
        message: syntax.message,
        targetSiteId: syntax.siteId,
        targetDisplayName,
      });
      continue;
    }

    const siteIdChanged = !syntax.unchanged;
    if (!siteIdChanged && !displayNameChanged) {
      plan.byRowId.set(row.rowId, {
        kind: 'same',
        label: 'SAME',
        tone: 'same',
        message: 'Unchanged, skipped.',
        targetSiteId: syntax.siteId,
        targetDisplayName,
      });
      continue;
    }

    plan.changedCount += 1;

    const candidate = {
      row,
      targetSiteId: syntax.siteId,
      targetDisplayName,
      siteIdChanged,
      displayNameChanged,
    };
    candidates.set(row.rowId, candidate);
    candidateByCurrentId.set(row.currentSiteId, candidate);
    if (siteIdChanged) {
      duplicateTargets.set(syntax.siteId, (duplicateTargets.get(syntax.siteId) || 0) + 1);
    }
  }

  for (const candidate of candidates.values()) {
    if (candidate.siteIdChanged && (duplicateTargets.get(candidate.targetSiteId) || 0) > 1) {
      invalidRowIds.add(candidate.row.rowId);
      plan.byRowId.set(candidate.row.rowId, {
        kind: 'error',
        label: 'ERROR',
        tone: 'error',
        message: `Duplicate target: ${candidate.targetSiteId}.`,
        targetSiteId: candidate.targetSiteId,
        targetDisplayName: candidate.targetDisplayName,
      });
    }
  }

  const dependencies = new Map();
  const indegree = new Map();
  for (const candidate of candidates.values()) {
    if (!invalidRowIds.has(candidate.row.rowId)) {
      dependencies.set(candidate.row.rowId, []);
      indegree.set(candidate.row.rowId, 0);
    }
  }

  for (const candidate of candidates.values()) {
    const rowId = candidate.row.rowId;
    if (invalidRowIds.has(rowId)) {
      continue;
    }

    if (!candidate.siteIdChanged) {
      continue;
    }

    const ownerCandidate = candidateByCurrentId.get(candidate.targetSiteId);
    if (ownerCandidate && ownerCandidate.row.rowId !== rowId) {
      if (invalidRowIds.has(ownerCandidate.row.rowId)) {
        invalidRowIds.add(rowId);
        plan.byRowId.set(rowId, {
          kind: 'error',
          label: 'ERROR',
          tone: 'error',
          message: `Target ${candidate.targetSiteId} is still occupied in this set.`,
          targetSiteId: candidate.targetSiteId,
          targetDisplayName: candidate.targetDisplayName,
        });
        continue;
      }
      if (!ownerCandidate.siteIdChanged) {
        invalidRowIds.add(rowId);
        plan.byRowId.set(rowId, {
          kind: 'error',
          label: 'ERROR',
          tone: 'error',
          message: `Target ${candidate.targetSiteId} is staying in place in this batch.`,
          targetSiteId: candidate.targetSiteId,
          targetDisplayName: candidate.targetDisplayName,
        });
        continue;
      }
      dependencies.get(ownerCandidate.row.rowId)?.push(rowId);
      indegree.set(rowId, (indegree.get(rowId) || 0) + 1);
      continue;
    }

    const existingEntry = existingEntries.get(candidate.targetSiteId);
    if (existingEntry && candidate.targetSiteId !== candidate.row.currentSiteId) {
      invalidRowIds.add(rowId);
      plan.byRowId.set(rowId, {
        kind: 'error',
        label: 'ERROR',
        tone: 'error',
        message: `https://${existingEntry.host || `${candidate.targetSiteId}.${BASE_DOMAIN}`}/ already exists.`,
        targetSiteId: candidate.targetSiteId,
        targetDisplayName: candidate.targetDisplayName,
      });
    }
  }

  const remainingIds = Array.from(indegree.keys()).filter((rowId) => !invalidRowIds.has(rowId));
  const readyQueue = remainingIds
    .filter((rowId) => (indegree.get(rowId) || 0) === 0)
    .sort((left, right) => {
      const leftRow = findBulkRenameRow(left);
      const rightRow = findBulkRenameRow(right);
      return String(leftRow?.initialSiteId || '').localeCompare(String(rightRow?.initialSiteId || ''));
    });

  while (readyQueue.length > 0) {
    const rowId = readyQueue.shift();
    plan.order.push(rowId);
    for (const dependentId of dependencies.get(rowId) || []) {
      indegree.set(dependentId, (indegree.get(dependentId) || 0) - 1);
      if ((indegree.get(dependentId) || 0) === 0) {
        readyQueue.push(dependentId);
        readyQueue.sort((left, right) => {
          const leftRow = findBulkRenameRow(left);
          const rightRow = findBulkRenameRow(right);
          return String(leftRow?.initialSiteId || '').localeCompare(String(rightRow?.initialSiteId || ''));
        });
      }
    }
  }

  for (const rowId of remainingIds) {
    if (plan.order.includes(rowId) || invalidRowIds.has(rowId)) {
      continue;
    }
    invalidRowIds.add(rowId);
    plan.byRowId.set(rowId, {
      kind: 'error',
      label: 'ERROR',
      tone: 'error',
      message: 'Rename cycle detected. Use a temporary name first.',
      targetSiteId: candidates.get(rowId)?.targetSiteId || '',
      targetDisplayName: candidates.get(rowId)?.targetDisplayName || '',
    });
  }

  for (const candidate of candidates.values()) {
    if (invalidRowIds.has(candidate.row.rowId)) {
      continue;
    }
    plan.byRowId.set(candidate.row.rowId, {
      kind: 'ready',
      label: 'READY',
      tone: 'ready',
      message: candidate.siteIdChanged && candidate.displayNameChanged
        ? 'Ready to rename the slug and update the title.'
        : candidate.siteIdChanged
          ? 'Ready to rename the site.'
          : 'Ready to update the title.',
      targetSiteId: candidate.targetSiteId,
      targetDisplayName: candidate.targetDisplayName,
    });
  }

  plan.readyCount = plan.order.length;
  plan.errorCount = Array.from(plan.byRowId.values()).filter((item) => item.kind === 'error').length;
  return plan;
}

function getBulkRenameRowState(row, plan) {
  if (row.phase === 'running') {
    return {
      label: 'RUNNING',
      tone: 'running',
      message: row.resultMessage || 'Applying updates now…',
      targetSiteId: normalizeSiteId(row.nextSiteId),
      targetDisplayName: normalizeFriendlyName(row.nextDisplayName),
    };
  }
  if (row.phase === 'done') {
    return {
      label: 'DONE',
      tone: 'success',
      message: row.resultMessage || 'Updated.',
      targetSiteId: normalizeSiteId(row.nextSiteId),
      targetDisplayName: normalizeFriendlyName(row.nextDisplayName),
    };
  }
  if (row.phase === 'failed') {
    return {
      label: 'FAILED',
      tone: 'error',
      message: row.resultMessage || 'Update failed.',
      targetSiteId: normalizeSiteId(row.nextSiteId),
      targetDisplayName: normalizeFriendlyName(row.nextDisplayName),
    };
  }
  if (row.phase === 'queued' && state.bulkRename.started) {
    return {
      label: 'READY',
      tone: 'ready',
      message: row.resultMessage || 'Queued to run.',
      targetSiteId: normalizeSiteId(row.nextSiteId),
      targetDisplayName: normalizeFriendlyName(row.nextDisplayName),
    };
  }
  return plan.byRowId.get(row.rowId) || {
    label: 'SAME',
    tone: 'same',
    message: 'Unchanged, skipped.',
    targetSiteId: row.currentSiteId,
    targetDisplayName: normalizeFriendlyName(row.currentDisplayName),
  };
}

function renderBulkRenameModal() {
  if (!bulkRenameModalEl || !bulkRenameTableBodyEl || !bulkRenameSummaryEl || !bulkRenameStatusEl) {
    return;
  }

  const tableShell = bulkRenameTableBodyEl.closest('.bulk-rename-modal__table-shell');
  const activeInput = bulkRenameModalEl.contains(document.activeElement)
    ? document.activeElement.closest('[data-bulk-rename-input]')
    : null;
  const focusRowId = activeInput instanceof HTMLInputElement ? activeInput.dataset.rowId || '' : '';
  const focusField = activeInput instanceof HTMLInputElement ? activeInput.dataset.rowField || '' : '';
  const selectionStart = activeInput instanceof HTMLInputElement ? activeInput.selectionStart : null;
  const selectionEnd = activeInput instanceof HTMLInputElement ? activeInput.selectionEnd : null;
  const scrollTop = tableShell instanceof HTMLElement ? tableShell.scrollTop : 0;
  const plan = getBulkRenamePlan();
  const doneCount = state.bulkRename.rows.filter((row) => row.phase === 'done').length;
  const failedCount = state.bulkRename.rows.filter((row) => row.phase === 'failed').length;
  const started = state.bulkRename.started;
  const running = state.bulkRename.running;
  const finished = state.bulkRename.finished;
  const closeBlocked = started && !finished;
  const runnableCount = started ? state.bulkRename.executionOrder.length : plan.readyCount;

  bulkRenameSummaryEl.textContent = started
    ? finished
      ? `Queue finished for ${doneCount + failedCount} runnable updates.`
      : `Queue running for ${state.bulkRename.executionOrder.length.toLocaleString()} runnable updates.`
    : `${plan.selectedCount.toLocaleString()} selected sites in this batch.`;

  const sortButtons = [
    [bulkRenameSortOriginalButton, bulkRenameOriginalHeaderEl, 'original', 'Original'],
    [bulkRenameSortFriendlyButton, bulkRenameFriendlyHeaderEl, 'friendly', 'Title'],
    [bulkRenameSortNewButton, bulkRenameNewHeaderEl, 'new', 'New slug'],
  ];
  for (const [button, header, sortKey, label] of sortButtons) {
    if (!(button instanceof HTMLButtonElement)) {
      continue;
    }
    const icon = button.querySelector('i');
    const isActive = state.bulkRename.sortKey === sortKey;
    button.classList.toggle('is-active', isActive);
    button.setAttribute(
      'aria-label',
      `${label} sort ${isActive ? state.bulkRename.sortDirection : 'none'}`
    );
    if (icon) {
      icon.className = isActive
        ? state.bulkRename.sortDirection === 'desc'
          ? 'ti ti-sort-descending'
          : 'ti ti-sort-ascending'
        : 'ti ti-arrows-sort';
    }
    header?.setAttribute('aria-sort', isActive
      ? (state.bulkRename.sortDirection === 'desc' ? 'descending' : 'ascending')
      : 'none');
  }

  if (bulkRenameProgressEl) {
    if (!started) {
      bulkRenameProgressEl.classList.add('is-hidden');
      bulkRenameProgressEl.innerHTML = '';
    } else {
      const total = Math.max(state.bulkRename.executionOrder.length, 1);
      const completed = Math.min(state.bulkRename.progressIndex, total);
      const percent = Math.round((completed / total) * 100);
      bulkRenameProgressEl.classList.remove('is-hidden');
      bulkRenameProgressEl.innerHTML = `
        <div class="bulk-rename-modal__progress-bar">
          <span class="bulk-rename-modal__progress-fill" style="width:${percent}%"></span>
        </div>
        <div class="bulk-rename-modal__progress-copy">
          <strong>${completed.toLocaleString()} / ${total.toLocaleString()}</strong>
          <span>${running ? 'Queue running' : finished ? 'Queue finished' : 'Queue paused'}</span>
        </div>
      `;
    }
  }

  const rowsMarkup = getSortedBulkRenameRows(plan).map((row) => {
    const rowState = getBulkRenameRowState(row, plan);
    const editMode = state.bulkRename.step === 'edit' && !started;
    const disabled = !editMode || rowState.tone === 'lock';
    const previewEntry = findEntryBySiteId(row.currentSiteId) || findEntryBySiteId(row.initialSiteId) || null;
    const previewSiteId = previewEntry?.siteId || row.currentSiteId || row.initialSiteId;
    const previewUrl = previewEntry ? getPreviewUrl(previewSiteId) : '';
    const previewState = previewUrl ? 'placeholder' : 'error';
    const previewClasses = previewUrl
      ? 'site-preview-img bulk-rename-table__preview-img is-placeholder'
      : 'site-preview-img bulk-rename-table__preview-img is-placeholder is-failed';
    const originalFriendlyName = row.initialDisplayName || '';
    const friendlyNameValue = editMode
      ? row.nextDisplayName
      : normalizeFriendlyName(rowState.targetDisplayName ?? row.nextDisplayName);
    const siteNameValue = editMode
      ? row.nextSiteId
      : (rowState.targetSiteId || normalizeSiteId(row.nextSiteId) || row.nextSiteId);
    const showFriendlyReset = editMode && !disabled && isBulkRenameDraftDirty(row, 'displayName');
    const showSiteReset = editMode && !disabled && isBulkRenameDraftDirty(row, 'siteId');
    const canApplyFriendlyName = editMode && !disabled && Boolean(normalizeFriendlyName(friendlyNameValue));
    return `
      <tr class="bulk-rename-table__row is-${escapeHtml(rowState.tone)}" data-bulk-rename-row="${escapeHtml(row.rowId)}">
        <td class="bulk-rename-table__original-cell">
          <div class="bulk-rename-table__original-shell">
            <span class="bulk-rename-table__preview">
              <img
                class="${previewClasses}"
                src="${escapeHtml(PREVIEW_PLACEHOLDER_URL)}"
                ${previewUrl ? `data-src="${escapeHtml(previewUrl)}"` : ''}
                data-preview-site-id="${escapeHtml(previewSiteId)}"
                data-preview-state="${escapeHtml(previewState)}"
                alt="${escapeHtml(`${originalFriendlyName || row.initialSiteId} preview`)}"
                decoding="async"
              >
            </span>
            <span class="bulk-rename-table__original-copy">
              <span class="bulk-rename-table__original-friendly${originalFriendlyName ? '' : ' is-muted'}">${escapeHtml(originalFriendlyName || 'No title')}</span>
              <span class="bulk-rename-table__original-site">${escapeHtml(row.initialSiteId)}</span>
              <span class="bulk-rename-table__row-status bulk-rename-table__row-status--${escapeHtml(rowState.tone)}" title="${escapeHtml(rowState.message)}">${escapeHtml(`${rowState.label} · ${rowState.message}`)}</span>
            </span>
          </div>
        </td>
        <td class="bulk-rename-table__name-cell">
          <div class="bulk-rename-table__input-shell bulk-rename-table__input-shell--title">
            <input
              type="text"
              class="bulk-rename-table__input bulk-rename-table__input--friendly"
              value="${escapeHtml(friendlyNameValue)}"
              placeholder="${editMode ? 'Title (spaces okay)' : 'No title'}"
              data-bulk-rename-input="true"
              data-row-id="${escapeHtml(row.rowId)}"
              data-row-field="displayName"
              spellcheck="false"
              autocomplete="off"
              ${disabled ? 'disabled' : ''}
            >
            <button
              type="button"
              class="bulk-rename-table__inline-action bulk-rename-table__apply-title"
              data-bulk-rename-apply-title="true"
              data-row-id="${escapeHtml(row.rowId)}"
              aria-label="Apply this title to the batch"
              title="Apply this title to all editable rows"
              ${canApplyFriendlyName ? '' : 'disabled'}
            >
              <i class="ti ti-copy-check"></i>
            </button>
            <button
              type="button"
              class="bulk-rename-table__inline-action bulk-rename-table__reset${showFriendlyReset ? '' : ' is-placeholder'}"
              data-bulk-rename-reset="true"
              data-row-id="${escapeHtml(row.rowId)}"
              data-row-field="displayName"
              aria-label="Reset the title for ${escapeHtml(row.initialSiteId)}"
              title="Reset to ${escapeHtml(row.currentDisplayName || 'no title')}"
              ${showFriendlyReset ? '' : 'tabindex="-1" aria-hidden="true"'}
              ${disabled ? 'disabled' : ''}
            >
              <i class="ti ti-x"></i>
            </button>
          </div>
        </td>
        <td class="bulk-rename-table__name-cell">
          <div class="bulk-rename-table__input-shell bulk-rename-table__input-shell--slug">
            <input
              type="text"
              class="bulk-rename-table__input bulk-rename-table__input--site"
              value="${escapeHtml(siteNameValue)}"
              data-bulk-rename-input="true"
              data-row-id="${escapeHtml(row.rowId)}"
              data-row-field="siteId"
              inputmode="text"
              spellcheck="false"
              autocomplete="off"
              placeholder="subdomain-slug"
              ${disabled ? 'disabled' : ''}
            >
            <button
              type="button"
              class="bulk-rename-table__inline-action bulk-rename-table__reset${showSiteReset ? '' : ' is-placeholder'}"
              data-bulk-rename-reset="true"
              data-row-id="${escapeHtml(row.rowId)}"
              data-row-field="siteId"
              aria-label="Reset the slug for ${escapeHtml(row.initialSiteId)}"
              title="Reset to ${escapeHtml(row.currentSiteId)}"
              ${showSiteReset ? '' : 'tabindex="-1" aria-hidden="true"'}
              ${disabled ? 'disabled' : ''}
            >
              <i class="ti ti-x"></i>
            </button>
          </div>
          <button
            type="button"
            class="bulk-rename-table__remove-row"
            data-bulk-rename-remove="true"
            data-row-id="${escapeHtml(row.rowId)}"
            aria-label="Remove ${escapeHtml(row.initialSiteId)} from this rename batch"
            title="Remove from this batch"
            ${started ? 'disabled' : ''}
          >
            <i class="ti ti-x"></i>
          </button>
        </td>
      </tr>
    `;
  }).join('');

  bulkRenameTableBodyEl.innerHTML = rowsMarkup || '<tr><td colspan="3" class="workspace-table__empty-cell">No selected sites.</td></tr>';
  setupLazyPreviews();

  let statusMessage = state.bulkRename.statusMessage;
  let statusTone = state.bulkRename.statusTone;
  if (!statusMessage) {
    if (running) {
      statusMessage = `Applying ${state.bulkRename.executionOrder.length.toLocaleString()} queued updates one at a time.`;
    } else if (finished) {
      statusMessage = failedCount > 0
        ? `Finished with ${doneCount.toLocaleString()} updated and ${failedCount.toLocaleString()} failed.`
        : `Finished. Updated ${doneCount.toLocaleString()} sites.`;
      statusTone = failedCount > 0 ? 'warning' : 'success';
    } else if (state.bulkRename.step === 'edit') {
      statusMessage = plan.errorCount > 0
        ? 'Fix the invalid rows before continuing.'
        : plan.readyCount > 0
          ? `${plan.readyCount.toLocaleString()} updates are ready to confirm.`
          : 'Change at least one title or slug to continue.';
      statusTone = plan.errorCount > 0 ? 'warning' : '';
    } else {
      statusMessage = plan.readyCount > 0
        ? `${plan.readyCount.toLocaleString()} updates will run. Title duplicates are fine; slug conflicts stay blocked.`
        : 'No runnable updates in this batch yet.';
      statusTone = plan.errorCount > 0 ? 'warning' : '';
    }
  }

  const workflowLabel = started
    ? running
      ? 'Queue running'
      : finished
        ? 'Queue finished'
        : state.bulkRename.paused
          ? 'Queue paused'
          : 'Confirm + Run'
    : state.bulkRename.step === 'confirm'
      ? 'Confirm + Run'
      : 'Edit';
  const footerMeta = [
    workflowLabel,
    `${plan.selectedCount.toLocaleString()} selected`,
    `${plan.editableCount.toLocaleString()} editable`,
    `${plan.lockedCount.toLocaleString()} locked`,
    `${runnableCount.toLocaleString()} runnable`,
    started ? `${doneCount.toLocaleString()} done` : '',
    started ? `${failedCount.toLocaleString()} failed` : '',
  ].filter(Boolean).join(' · ');

  bulkRenameStatusEl.innerHTML = `
    <span class="bulk-rename-modal__status-meta">${escapeHtml(footerMeta)}</span>
    <span class="bulk-rename-modal__status-message">${escapeHtml(statusMessage)}</span>
  `;
  bulkRenameStatusEl.className = statusTone
    ? `bulk-rename-modal__status is-${statusTone}`
    : 'bulk-rename-modal__status';

  if (bulkRenameCancelButton) {
    bulkRenameCancelButton.classList.toggle('is-hidden', started);
  }
  if (bulkRenameBackButton) {
    bulkRenameBackButton.classList.toggle('is-hidden', state.bulkRename.step !== 'confirm' || started);
  }
  if (bulkRenameNextButton) {
    bulkRenameNextButton.classList.toggle('is-hidden', state.bulkRename.step !== 'edit' || started);
    bulkRenameNextButton.disabled = plan.readyCount === 0 || plan.errorCount > 0;
  }
  if (bulkRenameStartButton) {
    const paused = state.bulkRename.paused;
    bulkRenameStartButton.classList.toggle('is-hidden', state.bulkRename.step !== 'confirm' || (started && !paused));
    bulkRenameStartButton.disabled = paused ? false : plan.readyCount === 0 || plan.errorCount > 0;
    const startLabel = bulkRenameStartButton.querySelector('span');
    if (startLabel) {
      startLabel.textContent = paused ? 'Resume queue' : 'Start updates';
    }
  }
  if (bulkRenameCloseActionButton) {
    bulkRenameCloseActionButton.classList.toggle('is-hidden', !finished);
  }
  const closeButton = document.getElementById('close-bulk-rename');
  if (closeButton instanceof HTMLButtonElement) {
    closeButton.disabled = closeBlocked;
    closeButton.title = closeBlocked ? 'Finish or resume the queue before closing.' : 'Close rename';
  }

  if (tableShell instanceof HTMLElement) {
    tableShell.scrollTop = scrollTop;
  }
  if (focusRowId && focusField) {
    const escapedRowId = typeof CSS !== 'undefined' && typeof CSS.escape === 'function'
      ? CSS.escape(focusRowId)
      : focusRowId;
    const escapedField = typeof CSS !== 'undefined' && typeof CSS.escape === 'function'
      ? CSS.escape(focusField)
      : focusField;
    const nextInput = bulkRenameTableBodyEl.querySelector(`[data-bulk-rename-input][data-row-id="${escapedRowId}"][data-row-field="${escapedField}"]`);
    if (nextInput instanceof HTMLInputElement && !nextInput.disabled) {
      nextInput.focus({ preventScroll: true });
      if (selectionStart != null && selectionEnd != null) {
        nextInput.setSelectionRange(selectionStart, selectionEnd);
      }
    }
  }
}

function syncBulkRenameRowAfterRename(previousSiteId, nextSiteId) {
  const row = state.bulkRename.rows.find((candidate) => candidate.currentSiteId === previousSiteId);
  if (!row) {
    return;
  }
  row.currentSiteId = nextSiteId;
}

function syncBulkRenameRowAfterDisplayName(siteId, nextDisplayName) {
  const row = state.bulkRename.rows.find((candidate) => candidate.currentSiteId === siteId);
  if (!row) {
    return;
  }
  row.currentDisplayName = normalizeFriendlyName(nextDisplayName);
}

function compareNaturalText(left, right) {
  return NATURAL_TEXT_COLLATOR.compare(String(left ?? ''), String(right ?? ''));
}

function compareAlphabetical(left, right) {
  const groupDelta = compareNaturalText(getDisplayGroupLabel(left), getDisplayGroupLabel(right));
  if (groupDelta !== 0) {
    return groupDelta;
  }
  return compareNaturalText(left?.siteId, right?.siteId);
}

function normalizeManualRank(value) {
  const rank = Number.parseInt(value, 10);
  return Number.isFinite(rank) ? rank : 0;
}

function formatManualRank(value) {
  const rank = normalizeManualRank(value);
  return rank > 0 ? `+${rank}` : String(rank);
}

function formatManualRankBadge(value) {
  return `Rank ${formatManualRank(value)}`;
}

function isSiteMutationBusy(siteId) {
  return Boolean(siteId) && (
    state.rankBusy.has(siteId)
    || state.noteBusy.has(siteId)
    || state.tagBusy.has(siteId)
    || state.renameBusy.has(siteId)
    || state.accessBusy.has(siteId)
    || state.aliasBusy.has(siteId)
    || state.displayNameBusy.has(siteId)
    || state.siteStateBusy.has(siteId)
    || state.redeployBusy.has(siteId)
    || state.deleteBusy.has(siteId)
  );
}

function updateRankValueElement(valueEl, rank, busy) {
  if (!valueEl) {
    return;
  }

  valueEl.textContent = formatManualRank(rank);
  valueEl.classList.toggle('is-positive', rank > 0);
  valueEl.classList.toggle('is-negative', rank < 0);
  valueEl.classList.toggle('is-busy', busy);
  valueEl.title = busy ? `Saving manual rank: ${rank}` : `Manual rank: ${rank}`;
}

function updateSlideshowRankBadge(entry) {
  // The chip is injected by the adapter once the canon has built its DOM,
  // so resolve it dynamically (the module-load `slideshowRankBadgeEl` const
  // is null because the markup no longer ships in index.html).
  const chip = document.getElementById('slideshow-rank-badge');
  if (!chip) return;

  if (!entry?.siteId) {
    chip.textContent = '';
    chip.title = '';
    chip.classList.add('is-hidden');
    chip.classList.remove('is-positive', 'is-negative');
    return;
  }

  const rank = normalizeManualRank(entry.manualRank);
  chip.textContent = formatManualRankBadge(rank);
  chip.title = `Manual rank for ${entry.siteId}: ${rank}`;
  chip.classList.remove('is-hidden');
  chip.classList.toggle('is-positive', rank > 0);
  chip.classList.toggle('is-negative', rank < 0);
}

function clearQueuedManualRankSave(siteId) {
  const queue = manualRankSaveQueue.get(siteId);
  if (!queue) {
    return;
  }

  if (queue.timerId) {
    window.clearTimeout(queue.timerId);
  }
  manualRankSaveQueue.delete(siteId);
}

function isManualRankInteractionBlocked(siteId) {
  return Boolean(siteId) && (
    state.noteBusy.has(siteId)
    || state.renameBusy.has(siteId)
    || state.deleteBusy.has(siteId)
  );
}

function scheduleQueuedManualRankSave(siteId) {
  const queue = manualRankSaveQueue.get(siteId);
  if (!queue) {
    return;
  }

  if (queue.timerId) {
    window.clearTimeout(queue.timerId);
  }
  queue.timerId = window.setTimeout(() => {
    queue.timerId = 0;
    void flushQueuedManualRankSave(siteId);
  }, MANUAL_RANK_SAVE_DEBOUNCE_MS);
}

async function flushQueuedManualRankSave(siteId) {
  const queue = manualRankSaveQueue.get(siteId);
  if (!queue || queue.inFlight) {
    return false;
  }

  const entry = findEntryBySiteId(siteId);
  if (!entry || !canMutateEntry(entry)) {
    clearQueuedManualRankSave(siteId);
    return false;
  }

  if (!state.apiBaseUrl) {
    applyManualRankToState(siteId, queue.savedRank, queue.savedUpdatedAt);
    clearQueuedManualRankSave(siteId);
    render();
    window.alert(COMPOSER_UNAVAILABLE_MESSAGE);
    return false;
  }

  if (isManualRankInteractionBlocked(siteId)) {
    scheduleQueuedManualRankSave(siteId);
    return false;
  }

  const operatorKey = queue.operatorKey || resolveOperatorKeyForProtectedAction({
    label: 'Ranking sites',
    type: PROTECTED_ACTION_RANK,
    siteId,
    value: queue.pendingRank,
  });
  if (!operatorKey) {
    applyManualRankToState(siteId, queue.savedRank, queue.savedUpdatedAt);
    clearQueuedManualRankSave(siteId);
    render();
    return false;
  }

  queue.operatorKey = operatorKey;
  queue.inFlight = true;
  const requestedRank = normalizeManualRank(queue.pendingRank);

  state.rankBusy.add(siteId);
  render();

  try {
    const response = await fetch(`${state.apiBaseUrl}/api/catalog/rank/${encodeURIComponent(siteId)}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-operator-key': operatorKey,
      },
      body: JSON.stringify({ value: requestedRank }),
    });
    const data = await readJsonResponse(response);
    if (!response.ok) {
      const message = data.error ?? `Rank update failed (${response.status})`;
      if (isInvalidOperatorKeyFailure(response.status, message)) {
        applyManualRankToState(siteId, queue.savedRank, queue.savedUpdatedAt);
        clearQueuedManualRankSave(siteId);
        reopenOperatorAccessGate({
          label: 'Ranking sites',
          type: PROTECTED_ACTION_RANK,
          siteId,
          value: requestedRank,
        });
        return false;
      }
      throw new Error(message);
    }

    applyManualRankToState(siteId, data.manualRank, data.manualRankUpdatedAt || null);

    const activeQueue = manualRankSaveQueue.get(siteId);
    if (activeQueue) {
      activeQueue.savedRank = normalizeManualRank(data.manualRank);
      activeQueue.savedUpdatedAt = data.manualRankUpdatedAt || null;
      if (activeQueue.pendingRank === requestedRank) {
        clearQueuedManualRankSave(siteId);
      } else {
        scheduleQueuedManualRankSave(siteId);
      }
    }
    return true;
  } catch (error) {
    applyManualRankToState(siteId, queue.savedRank, queue.savedUpdatedAt);
    clearQueuedManualRankSave(siteId);
    render();
    window.alert(error.message);
    return false;
  } finally {
    const activeQueue = manualRankSaveQueue.get(siteId);
    if (activeQueue) {
      activeQueue.inFlight = false;
    }
    state.rankBusy.delete(siteId);
    render();
  }
}

async function queueManualRankValue(siteId, nextRank) {
  const entry = findEntryBySiteId(siteId);
  if (!canMutateEntry(entry)) {
    return false;
  }
  if (!state.apiBaseUrl) {
    window.alert(COMPOSER_UNAVAILABLE_MESSAGE);
    return false;
  }
  if (isManualRankInteractionBlocked(siteId)) {
    return false;
  }

  const targetRank = normalizeManualRank(nextRank);
  const operatorKey = getKnownOperatorKey() || resolveOperatorKeyForProtectedAction({
    label: 'Ranking sites',
    type: PROTECTED_ACTION_RANK,
    siteId,
    value: targetRank,
  });
  if (!operatorKey) {
    return false;
  }

  let queue = manualRankSaveQueue.get(siteId);
  if (!queue) {
    queue = {
      pendingRank: normalizeManualRank(entry.manualRank),
      savedRank: normalizeManualRank(entry.manualRank),
      savedUpdatedAt: entry.manualRankUpdatedAt || null,
      timerId: 0,
      inFlight: false,
      operatorKey,
    };
    manualRankSaveQueue.set(siteId, queue);
  } else {
    queue.operatorKey = operatorKey;
  }

  queue.pendingRank = targetRank;
  applyManualRankToState(siteId, targetRank, new Date().toISOString());
  render();

  if (!queue.inFlight) {
    scheduleQueuedManualRankSave(siteId);
  }
  return true;
}

function updateMainSiteButton(button, entry) {
  if (!button) {
    return;
  }

  const canUseAsMainSite = entry?.siteId === ROOT_SITE_ID || entry?.isPublic === true;
  const disabled = !state.apiBaseUrl || state.mainSiteBusy || !canMutateEntry(entry) || !canUseAsMainSite;
  const isActive = entry.mainSite === true;
  button.classList.toggle('is-active', isActive);
  button.setAttribute('aria-pressed', isActive ? 'true' : 'false');
  button.disabled = disabled || isActive;
  button.title = !canMutateEntry(entry)
    ? 'Imported CSV rows stay read-only in the launchpad.'
    : !canUseAsMainSite
    ? 'Make this site public before using it as mullmania.com.'
    : !state.apiBaseUrl
    ? COMPOSER_UNAVAILABLE_MESSAGE
    : isActive
      ? `${entry.siteId} is the current main site for mullmania.com`
      : `Make ${entry.siteId} the main site for mullmania.com`;
}

function updateSiteAccessButton(button, entry) {
  if (!button) {
    return;
  }

  const siteId = entry?.siteId || '';
  const accessBusy = Boolean(siteId) && state.accessBusy.has(siteId);
  const previewBusy = Boolean(siteId) && state.previewBusy.has(siteId);
  const otherMutationBusy = Boolean(siteId) && isSiteMutationBusy(siteId) && !accessBusy;
  const canToggle = canToggleSiteAccess(entry);
  const isPublic = entry?.isPublic === true;

  button.classList.toggle('is-public', isPublic);
  button.classList.toggle('is-private', Boolean(entry) && !isPublic);
  button.classList.toggle('is-active', isPublic);
  button.setAttribute('aria-pressed', isPublic ? 'true' : 'false');
  button.disabled = !state.apiBaseUrl || !canToggle || accessBusy || previewBusy || otherMutationBusy;

  let title = 'No site selected.';
  if (entry?.categories?.externalCatalog) {
    title = 'Imported CSV rows stay read-only in the launchpad.';
  } else if (ALWAYS_PUBLIC_SITE_IDS.has(entry?.siteId)) {
    title = entry?.siteId === ROOT_SITE_ID
      ? 'mullmania.com stays public outside the extension gate.'
      : `${siteHost(entry.siteId)} stays public outside the extension gate.`;
  } else if (entry && entry.hasHostedSite !== true) {
    title = 'Only hosted sites can use the access toggle.';
  } else if (!state.apiBaseUrl) {
    title = COMPOSER_UNAVAILABLE_MESSAGE;
  } else if (accessBusy) {
    title = `Processing public access for ${siteId}`;
  } else if (previewBusy || otherMutationBusy) {
    title = 'Working…';
  } else if (entry) {
    title = isPublic
      ? `${siteId}.${BASE_DOMAIN} is public. Any configured aliases stay public too. Click to make only the direct host private.`
      : `${siteId}.${BASE_DOMAIN} requires the extension header. Any configured aliases still stay public. Click to make the direct host public too.`;
  }

  button.title = title;
  button.setAttribute('aria-label', title);
  setFullscreenActionButtonState(button, {
    busy: accessBusy,
    idleIcon: isPublic ? 'ti ti-world' : 'ti ti-lock',
    idleLabel: isPublic ? 'Public' : 'Private',
    busyLabel: 'Processing…',
  });
}

function getAppStyleOption(styleId) {
  const normalized = String(styleId || '').trim().toLowerCase();
  return APP_STYLE_OPTIONS.find((option) => option.id === normalized) || APP_STYLE_OPTIONS[0];
}

function normalizeAppStyleId(styleId, fallback = APP_STYLE_DEFAULT_ID) {
  const normalized = String(styleId || '').trim().toLowerCase();
  if (APP_STYLE_IDS.has(normalized)) {
    return normalized;
  }
  return fallback;
}

function getStoredAppStyleId() {
  return normalizeAppStyleId(localStorage.getItem(APP_STYLE_STORAGE_KEY) || '', '');
}

function getCurrentAppStyleId() {
  return getStoredAppStyleId() || APP_STYLE_DEFAULT_ID;
}

function buildAppStyleHref(styleId) {
  const normalized = normalizeAppStyleId(styleId);
  return normalized === APP_STYLE_DEFAULT_ID
    ? `${uiOrigin()}/active/style.css`
    : `${uiOrigin()}/${encodeURIComponent(normalized)}/style.css`;
}

function applyStoredAppStyle() {
  const storedStyleId = getStoredAppStyleId();
  if (storedStyleId) {
    applyAppStyle(storedStyleId, { persist: false, render: false });
    return;
  }
  syncSettingsStyleCombobox();
}

function applyAppStyle(styleId, options = {}) {
  const normalized = normalizeAppStyleId(styleId);
  const uiCssLink = document.getElementById('ui-css');
  if (uiCssLink instanceof HTMLLinkElement) {
    uiCssLink.href = buildAppStyleHref(normalized);
  }
  document.documentElement.dataset.appStyle = normalized;
  if (options.persist !== false) {
    localStorage.setItem(APP_STYLE_STORAGE_KEY, normalized);
  }
  if (options.render !== false) {
    syncSettingsStyleCombobox();
  }
}

function syncSettingsStyleCombobox() {
  const selectedStyleId = getCurrentAppStyleId();
  const selectedOption = getAppStyleOption(selectedStyleId);
  if (settingsStyleLabelEl) {
    settingsStyleLabelEl.textContent = selectedOption.label;
  }
  if (settingsStyleButtonEl) {
    settingsStyleButtonEl.setAttribute('aria-expanded', 'false');
  }
  if (settingsStyleComboboxEl) {
    settingsStyleComboboxEl.dataset.open = 'false';
  }
  if (!settingsStyleListEl) {
    return;
  }
  settingsStyleListEl.innerHTML = APP_STYLE_OPTIONS.map((option) => `
    <button
      type="button"
      class="settings-style-combobox__option"
      role="option"
      aria-selected="${option.id === selectedStyleId ? 'true' : 'false'}"
      data-settings-style-option="${escapeHtml(option.id)}"
    >
      <span>${escapeHtml(option.label)}</span>
      <i class="ti ti-check"></i>
    </button>
  `).join('');
  settingsStyleListEl.classList.add('is-hidden');
}

function openSettingsStyleCombobox() {
  if (!settingsStyleComboboxEl || !settingsStyleButtonEl || !settingsStyleListEl) {
    return;
  }
  settingsStyleComboboxEl.dataset.open = 'true';
  settingsStyleButtonEl.setAttribute('aria-expanded', 'true');
  settingsStyleListEl.classList.remove('is-hidden');
}

function closeSettingsStyleCombobox() {
  if (!settingsStyleComboboxEl || !settingsStyleButtonEl || !settingsStyleListEl) {
    return;
  }
  settingsStyleComboboxEl.dataset.open = 'false';
  settingsStyleButtonEl.setAttribute('aria-expanded', 'false');
  settingsStyleListEl.classList.add('is-hidden');
}

function toggleSettingsStyleCombobox() {
  if (settingsStyleComboboxEl?.dataset.open === 'true') {
    closeSettingsStyleCombobox();
    return;
  }
  openSettingsStyleCombobox();
}

function focusSettingsStyleOption(offset = 0) {
  const options = Array.from(settingsStyleListEl?.querySelectorAll('[data-settings-style-option]') || []);
  if (!options.length) {
    return;
  }
  const currentIndex = Math.max(0, options.findIndex((option) => option.getAttribute('aria-selected') === 'true'));
  const nextIndex = (currentIndex + offset + options.length) % options.length;
  options[nextIndex]?.focus();
}

function handleSettingsStyleButtonKeydown(event) {
  if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    openSettingsStyleCombobox();
    focusSettingsStyleOption(event.key === 'ArrowDown' ? 1 : 0);
  } else if (event.key === 'Escape') {
    closeSettingsStyleCombobox();
  }
}

function handleSettingsStyleListKeydown(event) {
  const currentOption = event.target instanceof Element
    ? event.target.closest('[data-settings-style-option]')
    : null;
  if (!(currentOption instanceof HTMLElement)) {
    return;
  }
  if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
    event.preventDefault();
    const options = Array.from(settingsStyleListEl?.querySelectorAll('[data-settings-style-option]') || []);
    const currentIndex = options.indexOf(currentOption);
    const offset = event.key === 'ArrowDown' ? 1 : -1;
    options[(currentIndex + offset + options.length) % options.length]?.focus();
  } else if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    applyAppStyle(currentOption.dataset.settingsStyleOption);
    closeSettingsStyleCombobox();
    settingsStyleButtonEl?.focus();
  } else if (event.key === 'Escape') {
    event.preventDefault();
    closeSettingsStyleCombobox();
    settingsStyleButtonEl?.focus();
  }
}

function updateSettingsStatus(message = '', tone = '') {
  if (!settingsStatusEl) {
    return;
  }
  settingsStatusEl.textContent = message;
  settingsStatusEl.className = tone ? `settings-modal__status is-${tone}` : 'settings-modal__status';
}

function syncSettingsSubmitButton() {
  if (!settingsSubmitButton) {
    return;
  }
  const pendingAction = state.pendingProtectedAction;
  settingsSubmitButton.innerHTML = pendingAction
    ? '<i class="ti ti-key"></i><span>Save and Continue</span>'
    : '<i class="ti ti-device-floppy"></i><span>Save Settings</span>';
  if (settingsClearKeyButton) {
    settingsClearKeyButton.disabled = !getKnownOperatorKey();
  }
}

function openSettingsModal(options = {}) {
  if (!settingsModalEl) {
    return false;
  }
  settingsModalEl.classList.remove('is-hidden');
  syncSettingsSubmitButton();
  syncSettingsStyleCombobox();
  if (options.statusMessage) {
    updateSettingsStatus(options.statusMessage, options.statusTone || 'info');
  } else if (options.resetStatus !== false) {
    updateSettingsStatus('', '');
  }
  if (options.focusOperatorKey !== false && settingsOperatorKeyEl instanceof HTMLInputElement) {
    settingsOperatorKeyEl.focus();
    const end = settingsOperatorKeyEl.value.length;
    settingsOperatorKeyEl.setSelectionRange(end, end);
  } else if (settingsPanelEl instanceof HTMLElement) {
    settingsPanelEl.focus({ preventScroll: true });
  }
  return true;
}

function closeSettingsModal(options = {}) {
  if (settingsModalEl) {
    settingsModalEl.classList.add('is-hidden');
  }
  if (!options.keepProtectedAction) {
    state.pendingProtectedAction = null;
  }
  if (!options.keepStatus) {
    updateSettingsStatus('', '');
  }
  closeSettingsStyleCombobox();
  syncSettingsSubmitButton();
}

function resolveOperatorKeyForProtectedAction(actionLabel) {
  const action = normalizeProtectedActionRequest(actionLabel);
  const existing = getKnownOperatorKey();
  if (existing) {
    return existing;
  }

  state.pendingProtectedAction = action;
  openSettingsModal({
    focusOperatorKey: true,
    statusMessage: `${action.label} needs the private operator key. Paste it below and continue.`,
    statusTone: 'warning',
  });
  return '';
}

function normalizeProtectedActionRequest(request) {
  if (typeof request === 'string') {
    return {
      label: request,
      type: '',
      siteId: '',
      nextSiteId: '',
      siteIds: [],
      isPublic: null,
      delta: 0,
      value: null,
      force: false,
      note: '',
      tagId: '',
      nextTagId: '',
      nextLabel: '',
      tagOperation: '',
      commitSha: '',
      expectedHeadSha: '',
      skipConfirm: false,
    };
  }

  if (!request || typeof request !== 'object') {
    return {
      label: 'Protected action',
      type: '',
      siteId: '',
      nextSiteId: '',
      siteIds: [],
      isPublic: null,
      delta: 0,
      value: null,
      force: false,
      note: '',
      tagId: '',
      nextTagId: '',
      nextLabel: '',
      tagOperation: '',
      commitSha: '',
      expectedHeadSha: '',
      skipConfirm: false,
    };
  }

  return {
    label: String(request.label || 'Protected action'),
    type: String(request.type || ''),
    siteId: String(request.siteId || ''),
    nextSiteId: String(request.nextSiteId || ''),
    siteIds: Array.isArray(request.siteIds)
      ? request.siteIds.map((value) => String(value || '').trim()).filter(Boolean)
      : [],
    isPublic: typeof request.isPublic === 'boolean' ? request.isPublic : null,
    delta: Number.isFinite(request.delta) ? request.delta : 0,
    value: Number.isFinite(request.value) ? request.value : null,
    force: request.force === true,
    note: typeof request.note === 'string' ? request.note : '',
    tagId: String(request.tagId || ''),
    nextTagId: String(request.nextTagId || ''),
    nextLabel: typeof request.nextLabel === 'string' ? request.nextLabel : '',
    tagOperation: String(request.tagOperation || ''),
    commitSha: String(request.commitSha || ''),
    expectedHeadSha: String(request.expectedHeadSha || ''),
    skipConfirm: request.skipConfirm === true,
  };
}

function getKnownOperatorKey() {
  const existing = settingsOperatorKeyEl?.value.trim() || localStorage.getItem(OPERATOR_KEY_STORAGE_KEY) || '';
  if (existing && settingsOperatorKeyEl && !settingsOperatorKeyEl.value.trim()) {
    settingsOperatorKeyEl.value = existing;
  }
  return existing;
}

function isInvalidOperatorKeyFailure(status, message = '') {
  return Number(status) === 403 && /invalid operator key/i.test(String(message || ''));
}

function reopenOperatorAccessGate(action, statusMessage = 'The remembered operator key was rejected. Paste the current key and continue.') {
  clearStoredOperatorKey();
  state.pendingProtectedAction = normalizeProtectedActionRequest(action);
  openSettingsModal({
    focusOperatorKey: true,
    statusMessage,
    statusTone: 'warning',
  });
}

async function resumeProtectedAction(action) {
  switch (action?.type) {
    case PROTECTED_ACTION_COMPOSER_BLANK:
      await submitComposerBlank();
      return;
    case PROTECTED_ACTION_COMPOSER_EDITOR:
      await submitComposerEditor();
      return;
    case PROTECTED_ACTION_COMPOSER_ASSIST:
      await assistComposerDraft();
      return;
    case PROTECTED_ACTION_COMPOSER_INTENT:
      await planComposerIntentDraft();
      return;
    case PROTECTED_ACTION_COMPOSER_DELETE:
      await submitComposerDelete();
      return;
    case PROTECTED_ACTION_SITE_STATE:
      await saveFullscreenSiteState();
      return;
    case PROTECTED_ACTION_RANK:
      if (Number.isFinite(action.value)) {
        await queueManualRankValue(action.siteId, action.value);
        return;
      }
      await updateManualRank(action.siteId, action.delta);
      return;
    case PROTECTED_ACTION_NOTE:
      await saveSiteNote(action.siteId, action.note);
      return;
    case PROTECTED_ACTION_TAG:
      switch (action.tagOperation) {
        case 'add-site':
          await addTagToSite(action.siteId, action.nextLabel || action.tagId);
          return;
        case 'create-catalog':
          await createCatalogTag(action.nextLabel || action.tagId);
          return;
        case 'rename-catalog':
          await renameCatalogTag(action.tagId, action.nextLabel || action.tagId);
          return;
        case 'merge-catalog':
          await mergeCatalogTags(action.tagId, action.nextTagId || normalizeManagedTagId(action.nextLabel));
          return;
        case 'delete-catalog':
          await deleteCatalogTag(action.tagId);
          return;
        case 'remove-site':
          await removeTagFromSite(action.siteId, action.tagId);
          return;
        default:
          return;
      }
    case PROTECTED_ACTION_DEPENDENCIES:
      await saveDependencies();
      return;
    case PROTECTED_ACTION_RENAME_SITE:
      await submitFullscreenRename({
        siteId: action.siteId,
        nextSiteId: action.nextSiteId,
      });
      return;
    case PROTECTED_ACTION_RENAME_MANY:
      await startBulkRenameQueue({ resume: state.bulkRename.started });
      return;
    case PROTECTED_ACTION_REFRESH_PREVIEW: {
      const entry = findEntryBySiteId(action.siteId);
      if (entry) {
        await refreshPreviewForEntry(entry, action.force === true);
      }
      return;
    }
    case PROTECTED_ACTION_MAIN_SITE:
      await updateMainSite(action.siteId);
      return;
    case PROTECTED_ACTION_SITE_ACCESS:
      if (typeof action.isPublic === 'boolean') {
        await setSitePublicAccess(action.siteId, action.isPublic);
      }
      return;
    case PROTECTED_ACTION_SITE_ALIASES:
      if (action.siteId) {
        await updateSiteAliases(action.siteId, normalizeAliasList(fullscreenAliasesInputEl?.value || ''));
      }
      return;
    case PROTECTED_ACTION_DISPLAY_NAME:
      if (action.siteId) {
        await updateSiteDisplayName(
          action.siteId,
          normalizeFriendlyName(fullscreenFriendlyNameInputEl?.value || action.nextLabel || ''),
          action.siteIds
        );
      }
      return;
    case PROTECTED_ACTION_DELETE_SITE:
      await deleteSite(action.siteId, { skipConfirm: action.skipConfirm, quiet: true });
      return;
    case PROTECTED_ACTION_RESTORE_SITE:
      await restoreFullscreenTimelineSelection({
        skipConfirm: action.skipConfirm,
        commitSha: action.commitSha,
        expectedHeadSha: action.expectedHeadSha,
      });
      return;
    default:
      return;
  }
}

function restoreOperatorKey() {
  const savedKey = localStorage.getItem(OPERATOR_KEY_STORAGE_KEY);
  if (!savedKey) {
    syncSettingsSubmitButton();
    return;
  }

  if (settingsOperatorKeyEl) {
    settingsOperatorKeyEl.value = savedKey;
  }
  if (settingsRememberKeyEl) {
    settingsRememberKeyEl.checked = true;
  }
  syncSettingsSubmitButton();
}

function clearStoredOperatorKey() {
  if (settingsOperatorKeyEl) {
    settingsOperatorKeyEl.value = '';
  }
  if (settingsRememberKeyEl) {
    settingsRememberKeyEl.checked = false;
  }
  localStorage.removeItem(OPERATOR_KEY_STORAGE_KEY);
  syncSettingsSubmitButton();
}

function persistOperatorKeyIfNeeded() {
  if (settingsRememberKeyEl?.checked && settingsOperatorKeyEl?.value.trim()) {
    localStorage.setItem(OPERATOR_KEY_STORAGE_KEY, settingsOperatorKeyEl.value.trim());
    return;
  }

  localStorage.removeItem(OPERATOR_KEY_STORAGE_KEY);
}

async function submitSettingsModal() {
  const operatorKey = settingsOperatorKeyEl?.value.trim() || '';
  if (!operatorKey) {
    updateSettingsStatus(`Paste the private operator key first. ${OPERATOR_KEY_HELP_MESSAGE}`, 'warning');
    settingsOperatorKeyEl?.focus();
    return;
  }

  persistOperatorKeyIfNeeded();

  const action = state.pendingProtectedAction;
  closeSettingsModal({ keepProtectedAction: true });
  state.pendingProtectedAction = null;

  if (!action) {
    return;
  }

  await waitForProtectedActionReady(action);
  await resumeProtectedAction(action);
}

function protectedActionIsBusy(action) {
  switch (action?.type) {
    case PROTECTED_ACTION_COMPOSER_BLANK:
    case PROTECTED_ACTION_COMPOSER_EDITOR:
    case PROTECTED_ACTION_COMPOSER_ASSIST:
    case PROTECTED_ACTION_COMPOSER_INTENT:
    case PROTECTED_ACTION_COMPOSER_DELETE:
      return composerBuilderIsBusy();
    case PROTECTED_ACTION_RESTORE_SITE:
      return state.fullscreenTimeline?.restoring === true;
    default:
      return false;
  }
}

function waitForProtectedActionReady(action, timeoutMs = 3000) {
  if (!protectedActionIsBusy(action)) {
    return Promise.resolve();
  }

  const startedAt = window.performance.now();
  return new Promise((resolve) => {
    const check = () => {
      if (!protectedActionIsBusy(action) || window.performance.now() - startedAt >= timeoutMs) {
        resolve();
        return;
      }
      window.requestAnimationFrame(check);
    };
    window.requestAnimationFrame(check);
  });
}

async function refreshPreviewForEntry(entry, force = false, triggerButton = null, captureOptions = null) {
  if (!entry?.siteId || !entry.url || !state.apiBaseUrl || !canMutateEntry(entry)) {
    return null;
  }

  const effectiveCaptureOptions = captureOptions ?? PREVIEW_REFRESH_DEFAULTS;

  const operatorKey = force
    ? resolveOperatorKeyForProtectedAction({
      label: 'Refreshing previews',
      type: PROTECTED_ACTION_REFRESH_PREVIEW,
      siteId: entry.siteId,
      force,
    })
    : getKnownOperatorKey();
  if (!operatorKey) {
    return null;
  }

  if (state.previewBusy.has(entry.siteId)) {
    return null;
  }

  state.previewBusy.add(entry.siteId);
  if (triggerButton) {
    triggerButton.disabled = true;
  }
  syncFullscreenEntryActionButtons(state.fullscreenEntry);

  try {
    const requestBody = { force };
    if (effectiveCaptureOptions?.width) {
      requestBody.width = effectiveCaptureOptions.width;
    }
    if (effectiveCaptureOptions?.height) {
      requestBody.height = effectiveCaptureOptions.height;
    }
    if (effectiveCaptureOptions?.settleDelayMs !== null && effectiveCaptureOptions?.settleDelayMs !== undefined) {
      requestBody.settleDelayMs = effectiveCaptureOptions.settleDelayMs;
    }
    if (effectiveCaptureOptions?.randomizeStyle === true || effectiveCaptureOptions?.randomizeStyle === false) {
      requestBody.randomizeStyle = effectiveCaptureOptions.randomizeStyle;
    }

    const response = await fetch(`${state.apiBaseUrl}/api/preview/cache/${encodeURIComponent(entry.siteId)}`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-operator-key': operatorKey,
      },
      body: JSON.stringify(requestBody),
    });
    const payload = await readJsonResponse(response);
    if (!response.ok || !payload?.preview) {
      if (force) {
        const message = payload?.error || `Preview refresh failed (${response.status}).`;
        reportPreviewRefreshFailure(entry, message, triggerButton);
      }
      return null;
    }

    setPreviewManifestEntry(entry.siteId, payload.preview);
    entry.previewUrl = getPreviewUrl(entry.siteId);
    previewCache.set(entry.previewUrl, 'done');
    updateRenderedPreviewImages(entry.siteId);
    if (state.fullscreenEntry?.siteId === entry.siteId) {
      const refreshedEntry = findEntryBySiteId(entry.siteId) || state.fullscreenEntry || entry;
      state.fullscreenEntry = refreshedEntry;
      renderFullscreenEntryHeader(refreshedEntry);
      renderFullscreenStage(refreshedEntry);
      syncFullscreenNoteEditorControls();
    }
    if (force && triggerButton) {
      flashInline(triggerButton, 'Snapshot ready');
    }
    return payload.preview;
  } finally {
    state.previewBusy.delete(entry.siteId);
    clearPreviewRefreshOptions(triggerButton);
    syncFullscreenEntryActionButtons(state.fullscreenEntry);
    render();
  }
}

function reportPreviewRefreshFailure(entry, message, triggerButton = null) {
  const siteId = entry?.siteId || 'site';
  const normalizedMessage = String(message || `Preview refresh failed for ${siteId}.`).trim();
  console.warn('[preview-refresh]', normalizedMessage);

  if (triggerButton) {
    triggerButton.title = normalizedMessage;
    triggerButton.setAttribute('aria-label', normalizedMessage);
    flashInline(triggerButton, 'Failed');
  }

  if (state.fullscreenEntry?.siteId === siteId) {
    setFullscreenSiteStateStatus(normalizedMessage, 'warning');
    syncFullscreenFooterStatus();
  }
}

function updateRenderedPreviewImages(siteId, url = '') {
  if (!siteId) {
    return;
  }

  const entry = findEntryBySiteId(siteId);
  if (entry) {
    document.querySelectorAll(`.preview-shell[data-preview-source-site-id="${siteId}"]`).forEach((previewShell) => {
      const previewImgs = Array.from(previewShell.querySelectorAll('.site-preview-img'));
      stopPreviewStackCycle(previewShell, previewImgs, entry);
    });
  }

  const nextUrl = url || getPreviewUrl(siteId);
  if (!nextUrl) {
    return;
  }

  document.querySelectorAll(`img[data-preview-site-id="${siteId}"], img[data-preview-source-site-id="${siteId}"]`).forEach((img) => {
    if (!img.closest('.preview-shell')) {
      applyLoadedPreview(img, nextUrl);
    }
  });
}

function updateRenderedPreviewFallbacks(siteId) {
  if (!siteId) {
    return;
  }

  document.querySelectorAll(`img[data-preview-site-id="${siteId}"]`).forEach((img) => {
    applyPreviewFallback(img);
  });
}

function renderNoteEditorContext(entry) {
  if (!entry || !notePreviewImageEl || !notePreviewButton || !noteSiteLinkEl || !noteSiteMetaEl || !noteSiteSummaryEl) {
    return;
  }

  const displayEntry = resolveDisplayEntryForSite(entry.siteId) || entry;
  const displayTitle = buildDisplayTitle(displayEntry) || entry.siteId;
  const metaParts = [
    entry.host || 'No public host',
    hasMultipleVersions(displayEntry) ? buildVersionSummary(displayEntry) : '',
  ].filter(Boolean);

  noteSiteLinkEl.textContent = displayTitle;
  noteSiteLinkEl.title = entry.url || displayTitle;
  if (entry.url) {
    noteSiteLinkEl.href = entry.url;
    notePreviewButton.disabled = false;
    notePreviewButton.title = `Preview ${displayTitle}`;
    notePreviewButton.setAttribute('aria-label', `Preview ${displayTitle}`);
  } else {
    noteSiteLinkEl.removeAttribute('href');
    notePreviewButton.disabled = true;
    notePreviewButton.title = `Preview unavailable for ${displayTitle}`;
    notePreviewButton.setAttribute('aria-label', notePreviewButton.title);
  }

  noteSiteMetaEl.textContent = metaParts.join(' • ');
  noteSiteSummaryEl.textContent = buildSummary(entry) || 'No summary yet.';
  assignPreviewImage(notePreviewImageEl, getPreviewUrl(entry.siteId), `${displayTitle} preview`, entry);
  setupLazyPreviews();
}

function updateNoteStatus(message, tone = '') {
  if (!noteStatusEl) {
    return;
  }

  noteStatusEl.textContent = message || '';
  noteStatusEl.className = tone ? `composer-status is-${tone}` : 'composer-status';
}

function syncNoteEditorControls() {
  const siteId = noteModalEl?.dataset?.siteId || '';
  const initial = noteModalEl?.dataset?.initialNote ?? '';
  const current = noteTextEl?.value ?? '';
  const busy = siteId ? state.noteBusy.has(siteId) : false;
  if (noteSaveButton) {
    noteSaveButton.disabled = busy || current === initial;
  }
  if (noteClearButton) {
    noteClearButton.disabled = busy || !initial;
  }
}

function updateNoteTrigger(element, entry) {
  if (!element) {
    return;
  }

  const preview = buildOperatorNotePreview(entry);
  const hasNote = Boolean(preview);
  const label = hasNote
    ? `Saved note for ${entry.siteId}. Open the note editor to edit it. Saved note: ${preview}`
    : `No saved note for ${entry.siteId}. Open the note editor to add one.`;

  element.classList.toggle('is-noted', hasNote);
  element.title = label;
  element.setAttribute('aria-label', label);
}

function applyManualRankToState(siteId, rank, updatedAt) {
  const entry = findEntryBySiteId(siteId);
  if (!entry) {
    return;
  }
  const rawEntry = findRawEntryBySiteId(siteId);

  entry.manualRank = normalizeManualRank(rank);
  if (updatedAt) {
    entry.manualRankUpdatedAt = updatedAt;
  }
  if (rawEntry) {
    rawEntry.manualRank = entry.manualRank;
    if (updatedAt) {
      rawEntry.manualRankUpdatedAt = updatedAt;
    }
  }
  state.noteDraftRanks[siteId] = String(entry.manualRank);
  if (fullscreenPropertiesDockEl?.dataset?.siteId === siteId && fullscreenRankInputEl && !isFullscreenRankDirty()) {
    const normalizedRank = String(entry.manualRank);
    fullscreenPropertiesDockEl.dataset.initialRank = normalizedRank;
    fullscreenRankInputEl.value = normalizedRank;
  }
}

function openNoteEditor(entryOrSiteId) {
  const entry = typeof entryOrSiteId === 'string'
    ? findEntryBySiteId(entryOrSiteId)
    : findEntryBySiteId(entryOrSiteId?.siteId || '');
  if (!entry || !noteModalEl) {
    return false;
  }
  const currentNote = getOperatorNote(entry);
  noteModalEl.dataset.siteId = entry.siteId;
  noteModalEl.dataset.initialNote = currentNote;
  if (noteSiteLabelEl) {
    noteSiteLabelEl.textContent = entry.siteId;
  }
  if (noteTextEl) {
    noteTextEl.value = currentNote;
  }
  renderNoteFeedbackPresets();
  if (!state.auditCritiquePresets.loaded && !state.auditCritiquePresets.loading) {
    loadAuditCritiquePresets().then(renderNoteFeedbackPresets).catch(() => renderNoteFeedbackPresets());
  }
  renderNoteEditorContext(entry);
  updateNoteStatus('Use has:note in search to find saved notes.', '');
  syncNoteEditorControls();
  noteModalEl.classList.remove('is-hidden');
  noteTextEl?.focus({ preventScroll: true });
  return true;
}

function closeNoteEditor(options = {}) {
  if (!noteModalEl) {
    return;
  }

  noteModalEl.classList.add('is-hidden');
  noteModalEl.dataset.siteId = '';
  noteModalEl.dataset.initialNote = '';
  if (noteTextEl) {
    noteTextEl.value = '';
  }
  if (noteSiteLabelEl) {
    noteSiteLabelEl.textContent = '';
  }
  if (notePreviewImageEl) {
    applyPreviewFallback(notePreviewImageEl);
  }
  if (noteSiteLinkEl) {
    noteSiteLinkEl.textContent = '';
    noteSiteLinkEl.removeAttribute('href');
    noteSiteLinkEl.removeAttribute('title');
  }
  if (noteSiteMetaEl) {
    noteSiteMetaEl.textContent = '';
  }
  if (noteSiteSummaryEl) {
    noteSiteSummaryEl.textContent = '';
  }
  if (notePreviewButton) {
    notePreviewButton.disabled = true;
    notePreviewButton.title = 'Preview site';
    notePreviewButton.setAttribute('aria-label', 'Preview site');
  }
  updateNoteStatus('', '');
  syncNoteEditorControls();
}

function wireNoteControl(button, entry) {
  if (!button) {
    return;
  }

  const editable = canMutateEntry(entry);
  updateNoteTrigger(button, entry);
  if (button instanceof HTMLButtonElement) {
    button.disabled = !editable;
  } else {
    button.setAttribute('role', 'button');
    button.tabIndex = editable ? 0 : -1;
    button.setAttribute('aria-disabled', editable ? 'false' : 'true');
  }
  if (!editable) {
    button.title = 'Imported CSV rows stay read-only in the launchpad.';
    button.setAttribute('aria-label', button.title);
  }
  button.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (!editable) {
      return;
    }
    openNoteEditor(entry.siteId);
  });
  if (!(button instanceof HTMLButtonElement)) {
    button.addEventListener('keydown', (event) => {
      if (event.key !== 'Enter' && event.key !== ' ') {
        return;
      }
      event.preventDefault();
      event.stopPropagation();
      if (!editable) {
        return;
      }
      openNoteEditor(entry.siteId);
    });
  }
}

function cloneTagRegistry() {
  return state.tagRegistry.map((entry) => ({ ...entry }));
}

function setEntryOperatorTags(entry, operatorTags) {
  if (!entry || typeof entry !== 'object') {
    return;
  }

  const normalized = normalizeManagedTagList(operatorTags);
  if (normalized.length > 0) {
    entry.tags = normalized;
  } else {
    delete entry.tags;
  }
  delete entry.operatorTags;
  invalidateDerivedTagRegistryCache();
}

function setEntryCatalogTags(entry, tags) {
  if (!entry || typeof entry !== 'object') {
    return;
  }

  setEntryOperatorTags(entry, tags);
}

function rebuildEntriesFromRaw() {
  const nextEntries = state.rawEntries.map(enrichEntry);
  applyMainSiteId(nextEntries, state.mainSiteId);
  state.entries = nextEntries;
  state.summary = summarizeMainSiteState(state.rawSummary, nextEntries, state.mainSiteId);
  invalidateDerivedTagRegistryCache();
}

function mergeManagedTagIntoState(tag) {
  const normalizedTag = normalizeTagRegistryEntry(tag);
  if (!normalizedTag) {
    return null;
  }

  setTagRegistryState([
    ...cloneTagRegistry().filter((entry) => entry.id !== normalizedTag.id),
    normalizedTag,
  ]);
  return normalizedTag;
}

function removeManagedTagFromState(tagId) {
  const normalizedTagId = normalizeManagedTagId(tagId);
  if (!normalizedTagId) {
    return;
  }
  setTagRegistryState(cloneTagRegistry().filter((entry) => entry.id !== normalizedTagId));
}

function applyManagedTagRegistryPayload(data, fallbackTag = null) {
  if (Array.isArray(data?.tags)) {
    setTagRegistryState(data.tags);
    return;
  }
  if (fallbackTag) {
    mergeManagedTagIntoState(fallbackTag);
  }
}

function applyOperatorTagsToState(siteId, operatorTags) {
  if (!siteId) {
    return;
  }

  const normalized = normalizeManagedTagList(operatorTags);
  setEntryOperatorTags(findEntryBySiteId(siteId), normalized);
  setEntryOperatorTags(findRawEntryBySiteId(siteId), normalized);
}

function updateTagManagerStatus(message = '', tone = '') {
  if (!tagManagerStatusEl) {
    return;
  }

  tagManagerStatusEl.textContent = message || '';
  tagManagerStatusEl.className = tone ? `tag-manager-modal__status is-${tone}` : 'tag-manager-modal__status';
}

function getTagManagerPendingMutationCount() {
  return Array.isArray(state.tagManager.pendingMutations) ? state.tagManager.pendingMutations.length : 0;
}

function hasPendingTagManagerMutations() {
  return getTagManagerPendingMutationCount() > 0;
}

function clearTagManagerErrorState(options = {}) {
  state.tagManager.failedCount = 0;
  state.tagManager.lastError = '';
  if (options.clearStatus !== false) {
    updateTagManagerStatus('', '');
  }
}

function buildTagManagerSummaryText(filteredCount, totalCount) {
  const base = `${totalCount} tag${totalCount === 1 ? '' : 's'}`;
  const pendingCount = getTagManagerPendingMutationCount();
  if (pendingCount > 0) {
    return `${base} · ${pendingCount} pending`;
  }
  if (state.tagManager.failedCount > 0) {
    return `${base} · ${state.tagManager.failedCount} failed`;
  }
  return base;
}

function getTagManagerBadgeModel() {
  const pendingCount = getTagManagerPendingMutationCount();
  if (pendingCount > 0) {
    return {
      label: pendingCount > 99 ? '99+' : String(pendingCount),
      title: `${pendingCount} queued tag change${pendingCount === 1 ? '' : 's'}`,
      toneClassName: 'surface-chip__count--pending',
    };
  }
  if (state.tagManager.failedCount > 0) {
    return {
      label: '!',
      title: `${state.tagManager.failedCount} tag change${state.tagManager.failedCount === 1 ? '' : 's'} failed`,
      toneClassName: 'surface-chip__count--error',
    };
  }
  return null;
}

function clearTagManagerDragState() {
  state.tagManager.draggingTagId = '';
  state.tagManager.dropTargetTagId = '';
  syncTagManagerDragDecorations();
}

function canMutateTagManagerEntry(entry) {
  return Boolean(entry && !entry.system);
}

function canMergeTagManagerEntries(sourceTagId, targetTagId) {
  const sourceEntry = getTagManagerEntry(sourceTagId);
  const targetEntry = getTagManagerEntry(targetTagId);
  return Boolean(
    sourceEntry
    && targetEntry
    && canMutateTagManagerEntry(sourceEntry)
    && canMutateTagManagerEntry(targetEntry)
    && sourceEntry.id !== targetEntry.id
  );
}

function syncTagManagerDragDecorations() {
  if (!tagManagerListEl) {
    return;
  }

  const draggingTagId = normalizeManagedTagId(state.tagManager.draggingTagId);
  const dropTargetTagId = normalizeManagedTagId(state.tagManager.dropTargetTagId);
  tagManagerListEl.querySelectorAll('[data-tag-manager-row]').forEach((row) => {
    if (!(row instanceof HTMLElement)) {
      return;
    }

    const rowTagId = normalizeManagedTagId(row.dataset.tagManagerRow || '');
    const isDragging = Boolean(draggingTagId) && rowTagId === draggingTagId;
    const isDropTarget = Boolean(dropTargetTagId) && rowTagId === dropTargetTagId;
    const isDropDisabled = Boolean(draggingTagId)
      && rowTagId !== draggingTagId
      && !isDropTarget
      && !canMergeTagManagerEntries(draggingTagId, rowTagId);

    row.classList.toggle('is-dragging', isDragging);
    row.classList.toggle('is-drop-target', isDropTarget);
    row.classList.toggle('is-drop-disabled', isDropDisabled);
    row.setAttribute('aria-grabbed', isDragging ? 'true' : 'false');
  });
}

function getTagManagerCreateValidation(rawLabel = state.tagManager.createLabel) {
  const label = normalizeManagedTagLabel(rawLabel);
  const rawTagId = normalizeManagedTagId(label);
  const tagId = resolveManagedTagId(label);

  if (!label || !rawTagId) {
    return { valid: false, label, tagId, reason: 'Type a tag name first.' };
  }
  if (!tagId) {
    return { valid: false, label, tagId: rawTagId, reason: 'Use one of the platform tags.' };
  }
  if (isReservedCatalogTagId(tagId)) {
    return {
      valid: false,
      label,
      tagId,
      reason: `${getCatalogTagLabel(tagId)} is a visibility filter, not a site tag.`,
    };
  }

  const existing = getManagedTagEntry(tagId);
  if (existing) {
    return {
      valid: false,
      label,
      tagId,
      reason: `${existing.label} already exists.`,
    };
  }

  return { valid: true, label, tagId, reason: '' };
}

function getTagManagerRenameValidation(tagId, rawLabel = state.tagManager.editingLabel) {
  const currentTagId = normalizeManagedTagId(tagId);
  const currentTag = getManagedTagEntry(currentTagId);
  if (!currentTagId || !currentTag) {
    return { valid: false, label: '', tagId: '', reason: 'Pick a tag first.' };
  }

  const label = normalizeManagedTagLabel(rawLabel);
  const rawNextTagId = normalizeManagedTagId(label);
  const nextTagId = currentTagId;
  if (!label || !rawNextTagId) {
    return { valid: false, label, tagId: rawNextTagId, reason: 'Type a tag name first.' };
  }
  if (isReservedCatalogTagId(nextTagId)) {
    return {
      valid: false,
      label,
      tagId: nextTagId,
      reason: `${getCatalogTagLabel(nextTagId)} is a visibility filter, not a site tag.`,
    };
  }
  if (currentTagId === nextTagId && currentTag.label === label) {
    return { valid: false, label, tagId: nextTagId, reason: 'No change yet.' };
  }

  const existing = getManagedTagEntry(nextTagId);
  if (existing && existing.id !== currentTagId) {
    return {
      valid: false,
      label,
      tagId: nextTagId,
      reason: `${existing.label} already exists.`,
    };
  }

  return { valid: true, label, tagId: nextTagId, currentTagId, reason: '' };
}

function getTagManagerEntries() {
  return getTagManagerRegistryEntries();
}

function getTagManagerEntry(tagId) {
  const normalizedTagId = normalizeCatalogToken(tagId);
  if (!normalizedTagId) {
    return null;
  }
  return getTagManagerRegistryEntries().find((entry) => entry.id === normalizedTagId) || null;
}

function formatTagManagerMeta(entry) {
  const parts = [];
  if (entry?.filterOnly) {
    parts.push('Visibility filter');
  }
  return parts.join(' · ');
}

function formatTagManagerSiteCount(entry) {
  const siteCount = Number(entry?.siteCount || 0);
  return siteCount === 1 ? '1 site' : `${siteCount.toLocaleString()} sites`;
}

function getTagManagerSampleEntries(entry, limit = 5) {
  const sampleIds = Array.isArray(entry?.samples)
    ? entry.samples.map((value) => normalizeSiteId(value)).filter(Boolean)
    : [];
  const tagId = normalizeManagedTagId(entry?.id || '');
  const seen = new Set();
  const samples = [];

  for (const siteId of sampleIds) {
    const siteEntry = findEntryBySiteId(siteId);
    if (!siteEntry || seen.has(siteEntry.siteId)) {
      continue;
    }
    samples.push(siteEntry);
    seen.add(siteEntry.siteId);
    if (samples.length >= limit) {
      return samples;
    }
  }

  if (!tagId) {
    return samples;
  }

  for (const siteEntry of state.visibleSiteEntries) {
    if (samples.length >= limit) {
      break;
    }
    if (seen.has(siteEntry.siteId)) {
      continue;
    }
    const catalogTags = getEntryCatalogTagIds(siteEntry).map((value) => normalizeManagedTagId(value));
    const operatorTags = getEntryOperatorTags(siteEntry).map((value) => normalizeManagedTagId(value));
    if (!catalogTags.includes(tagId) && !operatorTags.includes(tagId)) {
      continue;
    }
    samples.push(siteEntry);
    seen.add(siteEntry.siteId);
  }

  return samples;
}

function buildTagManagerPreviewRail(entry) {
  const samples = getTagManagerSampleEntries(entry, 5);
  if (samples.length === 0) {
    return `
      <div class="tag-manager-list__preview-empty">
        No tagged sites yet.
      </div>
    `;
  }

  return `
    <div class="tag-manager-list__preview-rail" aria-label="${escapeHtml(entry.label)} tagged sites">
      ${samples.map((siteEntry) => {
        const title = buildDisplayTitle(siteEntry) || siteEntry.siteId;
        const previewUrl = getPreviewUrl(siteEntry.siteId) || PREVIEW_PLACEHOLDER_URL;
        return `
          <button type="button" class="tag-manager-list__preview-card" data-preview-site-id="${escapeHtml(siteEntry.siteId)}" title="${escapeHtml(title)}">
            <img src="${escapeHtml(previewUrl)}" alt="${escapeHtml(title)} preview" loading="lazy">
            <span>${escapeHtml(title)}</span>
          </button>
        `;
      }).join('')}
    </div>
  `;
}

function focusTagManagerEditInput(tagId) {
  if (!tagManagerListEl || !tagId) {
    return;
  }
  const input = Array.from(tagManagerListEl.querySelectorAll('[data-tag-manager-rename-input]'))
    .find((element) => element instanceof HTMLInputElement && element.dataset.tagManagerRenameInput === tagId);
  if (!(input instanceof HTMLInputElement)) {
    return;
  }
  input.focus({ preventScroll: true });
  const end = input.value.length;
  input.setSelectionRange(end, end);
}

function stopTagManagerEditing(options = {}) {
  state.tagManager.editingTagId = '';
  state.tagManager.editingLabel = '';
  if (options.render !== false) {
    renderTagManagerModal();
  }
}

function startTagManagerEditing(tagId) {
  const tag = getManagedTagEntry(tagId);
  if (!tag) {
    return;
  }

  state.tagManager.editingTagId = tag.id;
  state.tagManager.editingLabel = tag.label;
  renderTagManagerModal();
  window.requestAnimationFrame(() => {
    focusTagManagerEditInput(tag.id);
  });
}

function syncTagManagerControls() {
  const hasApi = Boolean(state.apiBaseUrl);
  const validation = getTagManagerCreateValidation();
  const createMessage = !hasApi
    ? COMPOSER_UNAVAILABLE_MESSAGE
    : validation.valid
      ? `Create ${validation.label}`
      : validation.reason;

  if (tagManagerCreateShellEl instanceof HTMLElement) {
    tagManagerCreateShellEl.hidden = false;
  }

  if (tagManagerCreateInputEl) {
    tagManagerCreateInputEl.disabled = !hasApi;
    tagManagerCreateInputEl.value = state.tagManager.createLabel;
    tagManagerCreateInputEl.title = createMessage;
  }
  if (tagManagerCreateButton) {
    tagManagerCreateButton.disabled = !hasApi || !validation.valid;
    tagManagerCreateButton.title = createMessage;
  }

  tagManagerListEl?.querySelectorAll('button').forEach((button) => {
    if (!(button instanceof HTMLButtonElement)) {
      return;
    }
    if (button.dataset.tagManagerStartEdit || button.dataset.tagManagerDelete) {
      button.disabled = !hasApi;
    }
    if (button.dataset.tagManagerCancel) {
      button.disabled = false;
    }
    if (button.dataset.tagManagerSave) {
      const validation = getTagManagerRenameValidation(state.tagManager.editingTagId, state.tagManager.editingLabel);
      button.disabled = !hasApi || !validation.valid;
      button.title = !hasApi
        ? COMPOSER_UNAVAILABLE_MESSAGE
        : validation.valid
          ? `Save ${validation.label}`
          : validation.reason;
    }
  });

  tagManagerListEl?.querySelectorAll('[data-tag-manager-rename-input]').forEach((element) => {
    if (element instanceof HTMLInputElement) {
      element.disabled = !hasApi;
      if (element.dataset.tagManagerRenameInput === state.tagManager.editingTagId) {
        element.value = state.tagManager.editingLabel;
      }
    }
  });
}

function buildTagManagerListMarkup(entries) {
  if (entries.length === 0) {
    return `
      <div class="tag-manager-list__empty">
        No tags yet.
      </div>
    `;
  }

  return entries.map((entry) => {
    const siteCount = Number(entry.siteCount || 0);
    const countLabel = siteCount > 999 ? `${Math.round(siteCount / 100) / 10}k` : siteCount.toLocaleString();
    const meta = formatTagManagerMeta(entry);
    const previewRail = buildTagManagerPreviewRail(entry);
    const isEditing = !entry.system && state.tagManager.editingTagId === entry.id;
    const canDrag = canMutateTagManagerEntry(entry) && !isEditing;
    const dragAttributes = canDrag
      ? ' draggable="true" data-tag-manager-draggable="true" title="Drag onto another tag to merge"'
      : '';
    if (isEditing) {
      return `
        <div class="tag-manager-list__row tag-manager-list__row--editing" data-tag-manager-row="${escapeHtml(entry.id)}">
          <div class="tag-manager-list__header">
            <div class="tag-manager-list__label-row">
              <input
                type="text"
                class="tag-manager-list__rename-input"
                data-tag-manager-rename-input="${escapeHtml(entry.id)}"
                value="${escapeHtml(state.tagManager.editingLabel)}"
                aria-label="Rename ${escapeHtml(entry.label)}"
                spellcheck="false"
                autocomplete="off"
              >
              <span class="tag-manager-list__count" title="${escapeHtml(formatTagManagerSiteCount(entry))}">${escapeHtml(countLabel)}</span>
            </div>
            <div class="tag-manager-list__actions">
              <button
                type="button"
                class="secondary"
                data-tag-manager-save="${escapeHtml(entry.id)}"
                title="Save ${escapeHtml(entry.label)}"
              >
                <i class="ti ti-device-floppy"></i>
                <span>Save</span>
              </button>
              <button
                type="button"
                class="secondary"
                data-tag-manager-cancel="${escapeHtml(entry.id)}"
                title="Cancel rename"
              >
                <i class="ti ti-x"></i>
                <span>Cancel</span>
              </button>
            </div>
          </div>
          ${meta ? `<div class="tag-manager-list__meta">${escapeHtml(meta)}</div>` : ''}
          ${previewRail}
        </div>
      `;
    }

    if (entry.system) {
      return `
        <div class="tag-manager-list__row tag-manager-list__row--readonly" data-tag-manager-row="${escapeHtml(entry.id)}">
          <div class="tag-manager-list__header">
            <div class="tag-manager-list__label-row">
              <span class="tag-manager-list__label">${escapeHtml(entry.label)}</span>
              <span class="tag-manager-list__count" title="${escapeHtml(formatTagManagerSiteCount(entry))}">${escapeHtml(countLabel)}</span>
            </div>
          </div>
          ${meta ? `<div class="tag-manager-list__meta">${escapeHtml(meta)}</div>` : ''}
          ${previewRail}
        </div>
      `;
    }

    const deleteLabel = siteCount > 0
      ? `Delete ${entry.label} and remove it from ${siteCount.toLocaleString()} site${siteCount === 1 ? '' : 's'}`
      : `Delete ${entry.label}`;
    return `
      <div class="tag-manager-list__row tag-manager-list__row--mergeable" data-tag-manager-row="${escapeHtml(entry.id)}"${dragAttributes}>
        <div class="tag-manager-list__header">
          <button
            type="button"
            class="tag-manager-list__label-button"
            data-tag-manager-start-edit="${escapeHtml(entry.id)}"
            title="Rename ${escapeHtml(entry.label)}"
          >
            <span class="tag-manager-list__label">${escapeHtml(entry.label)}</span>
            <span class="tag-manager-list__count" title="${escapeHtml(formatTagManagerSiteCount(entry))}">${escapeHtml(countLabel)}</span>
          </button>
          <div class="tag-manager-list__actions">
            <button
              type="button"
              class="secondary tag-manager-list__delete"
              data-tag-manager-delete="${escapeHtml(entry.id)}"
              title="${escapeHtml(deleteLabel)}"
            >
              <i class="ti ti-trash"></i>
              <span>Delete</span>
            </button>
          </div>
        </div>
        ${meta ? `<div class="tag-manager-list__meta">${escapeHtml(meta)}</div>` : ''}
        ${previewRail}
      </div>
    `;
  }).join('');
}

function renderTagManagerModal() {
  if (!tagManagerModalEl || !tagManagerSummaryEl || !tagManagerListEl) {
    return;
  }

  if (state.tagManager.editingTagId && !getManagedTagEntry(state.tagManager.editingTagId)) {
    stopTagManagerEditing({ render: false });
  }

  const entries = getTagManagerEntries();
  const totalCount = getTagManagerRegistryEntries().length;
  const filteredCount = entries.length;
  tagManagerSummaryEl.textContent = buildTagManagerSummaryText(filteredCount, totalCount);
  tagManagerListEl.innerHTML = buildTagManagerListMarkup(entries);
  syncTagManagerControls();
  syncTagManagerDragDecorations();
}

function openTagManagerModal() {
  if (!tagManagerModalEl) {
    return false;
  }

  renderTagManagerModal();
  tagManagerModalEl.classList.remove('is-hidden');
  if (!state.apiBaseUrl) {
    updateTagManagerStatus(COMPOSER_UNAVAILABLE_MESSAGE, 'warning');
  } else if (state.tagManager.lastError) {
    updateTagManagerStatus(state.tagManager.lastError, 'error');
  } else {
    updateTagManagerStatus('', '');
  }
  if (tagManagerPanelEl instanceof HTMLElement) {
    tagManagerPanelEl.focus({ preventScroll: true });
  }
  if (tagManagerPanelEl instanceof HTMLElement) {
    tagManagerPanelEl.focus({ preventScroll: true });
  }
  return true;
}

function closeTagManagerModal(options = {}) {
  if (tagManagerModalEl) {
    tagManagerModalEl.classList.add('is-hidden');
  }
  state.tagManager.query = '';
  clearTagManagerDragState();
  state.tagManager.createLabel = '';
  stopTagManagerEditing({ render: false });
  if (!options.keepStatus) {
    updateTagManagerStatus('', '');
  }
  syncTagManagerControls();
}

function applyTagMutationToEntries(entries, tagId, nextTagId = '') {
  const currentTagId = normalizeManagedTagId(tagId);
  const replacementTagId = normalizeManagedTagId(nextTagId);
  if (!currentTagId) {
    return;
  }

  for (const entry of entries) {
    const currentTags = getEntryOperatorTags(entry);
    if (!currentTags.includes(currentTagId)) {
      continue;
    }
    const nextTags = replacementTagId
      ? normalizeManagedTagList(currentTags.map((value) => (value === currentTagId ? replacementTagId : value)))
      : currentTags.filter((value) => value !== currentTagId);
    setEntryOperatorTags(entry, nextTags);
  }
}

function applyCatalogTagRenameToState(tagId, nextTagId) {
  const currentTagId = normalizeManagedTagId(tagId);
  const replacementTagId = normalizeManagedTagId(nextTagId);
  if (!currentTagId || !replacementTagId || currentTagId === replacementTagId) {
    return;
  }
  applyTagMutationToEntries(state.entries, currentTagId, replacementTagId);
  applyTagMutationToEntries(state.rawEntries, currentTagId, replacementTagId);
}

function applyCatalogTagMergeToState(sourceTagId, targetTagId) {
  applyCatalogTagRenameToState(sourceTagId, targetTagId);
}

function applyCatalogTagDeleteToState(tagId) {
  const currentTagId = normalizeCatalogToken(tagId);
  if (!currentTagId) {
    return;
  }

  for (const entry of state.rawEntries) {
    setEntryCatalogTags(entry, normalizeCatalogTagList(entry.tags).filter((value) => value !== currentTagId));
    setEntryOperatorTags(entry, getEntryOperatorTags(entry).filter((value) => value !== currentTagId));
  }

  rebuildEntriesFromRaw();
}

async function recoverTagManagerMutationQueue(errorMessage, mutation = null) {
  const normalizedMessage = String(errorMessage || 'Tag save failed.').trim() || 'Tag save failed.';
  const queuedCount = getTagManagerPendingMutationCount();
  state.tagManager.pendingMutations = [];
  state.tagManager.processing = false;
  state.tagManager.busy = false;
  state.tagManager.failedCount += 1;
  state.tagManager.lastError = normalizedMessage;

  try {
    await refreshCatalog();
  } catch (refreshError) {
    console.error('Could not refresh the tag manager after a failed mutation.', refreshError);
  }

  render();
  renderTagManagerModal();
  updateTagManagerStatus(
    queuedCount > 1
      ? `${normalizedMessage} Dropped ${queuedCount.toLocaleString()} queued tag changes and reloaded the live state.`
      : `${normalizedMessage} Reloaded the live state.`,
    'error'
  );

  if (tagManagerModalEl?.classList.contains('is-hidden')) {
    window.alert(normalizedMessage);
  }

  if (mutation && isInvalidOperatorKeyFailure(mutation.responseStatus, normalizedMessage)) {
    reopenOperatorAccessGate(mutation.protectedAction, 'The remembered operator key was rejected. Paste the current key and continue.');
  }
}

async function flushTagManagerMutationQueue() {
  if (tagManagerMutationFlushPromise) {
    return tagManagerMutationFlushPromise;
  }

  tagManagerMutationFlushPromise = (async () => {
    while (state.tagManager.pendingMutations.length > 0) {
      const mutation = state.tagManager.pendingMutations[0];
      if (!mutation) {
        break;
      }

      state.tagManager.processing = true;
      state.tagManager.busy = true;
      render();

      try {
        const response = await fetch(`${state.apiBaseUrl}/api/catalog/tags`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-operator-key': mutation.operatorKey,
          },
          body: JSON.stringify(mutation.payload),
        });
        const data = await readJsonResponse(response);
        if (!response.ok) {
          mutation.responseStatus = response.status;
          throw new Error(data.error ?? `Tag save failed (${response.status})`);
        }

        applyManagedTagRegistryPayload(data, mutation.fallbackTag || null);
        if (typeof mutation.commitSuccess === 'function') {
          mutation.commitSuccess(data);
        }
        state.tagManager.pendingMutations.shift();
        render();
      } catch (error) {
        await recoverTagManagerMutationQueue(error.message, mutation);
        break;
      }
    }

    state.tagManager.processing = false;
    state.tagManager.busy = false;
    render();
    return !state.tagManager.lastError;
  })().finally(() => {
    tagManagerMutationFlushPromise = null;
  });

  return tagManagerMutationFlushPromise;
}

function mutateCatalogTag(payload, options = {}) {
  if (!state.apiBaseUrl) {
    updateTagManagerStatus(COMPOSER_UNAVAILABLE_MESSAGE, 'error');
    syncTagManagerControls();
    return false;
  }

  const operatorKey = resolveOperatorKeyForProtectedAction(options.protectedAction);
  if (!operatorKey) {
    updateTagManagerStatus('Open Settings and paste the private operator key to manage tags.', 'warning');
    syncTagManagerControls();
    return false;
  }

  try {
    if (typeof options.optimisticApply === 'function') {
      options.optimisticApply();
    }
    if (typeof options.optimisticFinalize === 'function') {
      options.optimisticFinalize();
    }
  } catch (error) {
    updateTagManagerStatus(error.message || 'Could not stage the tag change.', 'error');
    return false;
  }

  clearTagManagerErrorState();
  state.tagManager.pendingMutations.push({
    id: `tag-mutation-${++tagManagerMutationSequence}`,
    payload,
    operatorKey,
    protectedAction: options.protectedAction || null,
    fallbackTag: options.fallbackTag || null,
    commitSuccess: typeof options.commitSuccess === 'function' ? options.commitSuccess : null,
    responseStatus: 0,
  });

  render();
  void flushTagManagerMutationQueue();
  return true;
}

async function createCatalogTag(rawLabel = state.tagManager.createLabel) {
  const validation = getTagManagerCreateValidation(rawLabel);
  if (!validation.valid) {
    updateTagManagerStatus(validation.reason, 'warning');
    syncTagManagerControls();
    return false;
  }

  return mutateCatalogTag({
    action: 'create',
    tagId: validation.tagId,
    label: validation.label,
    source: location.hostname,
  }, {
    protectedAction: {
      label: 'Saving tags',
      type: PROTECTED_ACTION_TAG,
      tagId: validation.tagId,
      nextLabel: validation.label,
      tagOperation: 'create-catalog',
    },
    fallbackTag: {
      id: validation.tagId,
      label: validation.label,
    },
    optimisticApply: () => {
      mergeManagedTagIntoState({
        id: validation.tagId,
        label: validation.label,
      });
    },
    optimisticFinalize: () => {
      state.tagManager.createLabel = '';
    },
  });
}

async function renameCatalogTag(tagId, rawLabel = state.tagManager.editingLabel) {
  const validation = getTagManagerRenameValidation(tagId, rawLabel);
  if (!validation.valid) {
    updateTagManagerStatus(validation.reason, 'warning');
    syncTagManagerControls();
    return false;
  }
  return mutateCatalogTag({
    action: 'rename',
    tagId: validation.currentTagId,
    label: validation.label,
    nextTagId: validation.tagId,
    source: location.hostname,
  }, {
    protectedAction: {
      label: 'Saving tags',
      type: PROTECTED_ACTION_TAG,
      tagId: validation.currentTagId,
      nextLabel: validation.label,
      tagOperation: 'rename-catalog',
    },
    fallbackTag: {
      id: validation.tagId,
      label: validation.label,
    },
    optimisticApply: () => {
      applyCatalogTagRenameToState(validation.currentTagId, validation.tagId);
      if (validation.currentTagId !== validation.tagId) {
        removeManagedTagFromState(validation.currentTagId);
      }
      mergeManagedTagIntoState({
        id: validation.tagId,
        label: validation.label,
      });
    },
    optimisticFinalize: () => {
      stopTagManagerEditing({ render: false });
    },
  });
}

async function mergeCatalogTags(sourceTagId, targetTagId) {
  const sourceEntry = getTagManagerEntry(sourceTagId);
  const targetEntry = getTagManagerEntry(targetTagId);
  if (!sourceEntry || !targetEntry) {
    updateTagManagerStatus('Pick two valid tags first.', 'warning');
    return false;
  }
  if (!canMutateTagManagerEntry(sourceEntry) || !canMutateTagManagerEntry(targetEntry)) {
    updateTagManagerStatus('Visibility filters cannot be merged.', 'warning');
    return false;
  }
  if (sourceEntry.id === targetEntry.id) {
    updateTagManagerStatus('Drop a tag onto a different target.', 'warning');
    return false;
  }

  return mutateCatalogTag({
    action: 'merge',
    tagId: sourceEntry.id,
    targetTagId: targetEntry.id,
    source: location.hostname,
  }, {
    protectedAction: {
      label: 'Saving tags',
      type: PROTECTED_ACTION_TAG,
      tagId: sourceEntry.id,
      nextTagId: targetEntry.id,
      nextLabel: targetEntry.label,
      tagOperation: 'merge-catalog',
    },
    fallbackTag: {
      id: targetEntry.id,
      label: targetEntry.label,
    },
    optimisticApply: () => {
      applyCatalogTagMergeToState(sourceEntry.id, targetEntry.id);
      removeManagedTagFromState(sourceEntry.id);
      mergeManagedTagIntoState({
        id: targetEntry.id,
        label: targetEntry.label,
      });
    },
    optimisticFinalize: () => {
      if (state.tagManager.editingTagId === sourceEntry.id) {
        stopTagManagerEditing({ render: false });
      }
    },
  });
}

async function deleteCatalogTag(tagId) {
  const normalizedTagId = normalizeCatalogToken(tagId);
  const tag = getTagManagerEntry(normalizedTagId);
  if (!normalizedTagId || !tag) {
    updateTagManagerStatus('Pick a valid tag first.', 'warning');
    return false;
  }
  if (tag.system) {
    updateTagManagerStatus(`${tag.label} is a visibility filter and cannot be deleted.`, 'warning');
    return false;
  }

  return mutateCatalogTag({
    action: 'delete',
    tagId: normalizedTagId,
    source: location.hostname,
  }, {
    protectedAction: {
      label: 'Saving tags',
      type: PROTECTED_ACTION_TAG,
      tagId: normalizedTagId,
      tagOperation: 'delete-catalog',
    },
    optimisticApply: () => {
      applyCatalogTagDeleteToState(normalizedTagId);
      removeManagedTagFromState(normalizedTagId);
    },
    optimisticFinalize: () => {
      if (state.tagManager.editingTagId === normalizedTagId) {
        stopTagManagerEditing({ render: false });
      }
    },
  });
}

function updateFullscreenTagStatus(message = '', tone = '') {
  if (!fullscreenTagStatusEl) {
    return;
  }

  fullscreenTagStatusEl.textContent = message || '';
  fullscreenTagStatusEl.className = tone ? `fullscreen-modal__footer-status composer-status is-${tone}` : 'fullscreen-modal__footer-status';
}

function resetFullscreenTagPickerState() {
  state.fullscreenTagPicker.open = false;
  state.fullscreenTagPicker.query = '';
}

function updateFullscreenTagPickerQuery(value = '') {
  state.fullscreenTagPicker.query = normalizeManagedTagLabel(value);
  syncFullscreenTagEditorControls();
}

function closeFullscreenTagPicker(options = {}) {
  const { clearQuery = true, focusToggle = false } = options;
  state.fullscreenTagPicker.open = false;
  if (clearQuery) {
    state.fullscreenTagPicker.query = '';
  }
  syncFullscreenTagEditorControls();
  if (focusToggle) {
    window.requestAnimationFrame(() => {
      fullscreenTagToggleButton?.focus({ preventScroll: true });
    });
  }
}

function openFullscreenTagPicker(options = {}) {
  const entry = state.fullscreenEntry;
  const siteId = entry?.siteId || '';
  const busy = siteId ? isSiteMutationBusy(siteId) : false;
  const stagedSiteState = isFullscreenSiteStateDirty(entry);
  if (!entry) {
    updateFullscreenTagStatus('Pick a site first.', 'warning');
    return;
  }
  if (!canMutateEntry(entry)) {
    updateFullscreenTagStatus('Read-only row. Tags can only be changed on mutable launchpad entries.', 'warning');
    return;
  }
  if (!state.apiBaseUrl) {
    updateFullscreenTagStatus(COMPOSER_UNAVAILABLE_MESSAGE, 'warning');
    return;
  }
  if (stagedSiteState) {
    updateFullscreenTagStatus('Save the staged site-state changes before editing tags.', 'warning');
    return;
  }
  if (busy) {
    return;
  }

  state.fullscreenTagPicker.open = true;
  if (options.preserveQuery !== true) {
    state.fullscreenTagPicker.query = '';
  }
  syncFullscreenTagEditorControls();
  window.requestAnimationFrame(() => {
    if (!state.fullscreenTagPicker.open) {
      return;
    }
    fullscreenTagSearchEl?.focus({ preventScroll: true });
    fullscreenTagSearchEl?.select();
  });
}

function toggleFullscreenTagPicker() {
  if (state.fullscreenTagPicker.open) {
    closeFullscreenTagPicker({ focusToggle: true });
    return;
  }
  openFullscreenTagPicker();
}

function getFullscreenDraftTagIds(entry = state.fullscreenEntry) {
  return normalizeManagedTagList(getFullscreenDraftSiteState(entry)?.tags || getEntryOperatorTags(entry));
}

function shouldStageFullscreenTagEdit(siteId) {
  return Boolean(
    siteId
    && fullscreenModalEl
    && !fullscreenModalEl.classList.contains('is-hidden')
    && state.fullscreenEntry?.siteId === siteId
    && hasActiveFullscreenSiteState(state.fullscreenEntry)
  );
}

function getFullscreenTagPickerModel(entry) {
  const assignedTagIds = getFullscreenDraftTagIds(entry);
  const catalogTagsOnSite = assignedTagIds.map((tagId) => ({
    id: tagId,
    label: getManagedTagLabel(tagId),
    removable: true,
    system: false,
  }));
  const queryLabel = normalizeManagedTagLabel(state.fullscreenTagPicker.query);
  const queryId = resolveManagedTagId(queryLabel);
  const filteredCatalogTags = queryLabel
    ? catalogTagsOnSite.filter((tag) => `${tag.label} ${tag.id}`.toLowerCase().includes(queryLabel.toLowerCase()))
    : catalogTagsOnSite;
  const availableTags = getAssignableTagRegistryEntries().filter((tag) => !assignedTagIds.includes(tag.id));
  const filteredTags = queryLabel
    ? availableTags.filter((tag) => `${tag.label} ${tag.id}`.toLowerCase().includes(queryLabel.toLowerCase()))
    : availableTags;
  const exactExisting = queryId ? availableTags.find((tag) => tag.id === queryId) || getManagedTagEntry(queryId) : null;
  const alreadyAssigned = Boolean(queryId) && assignedTagIds.includes(queryId);
  const reservedTag = queryId ? getCatalogTagDefinition(queryId) : null;
  const canCreate = Boolean(queryLabel && queryId && !exactExisting && !reservedTag);

  return {
    availableCount: availableTags.length,
    catalogTagCount: catalogTagsOnSite.length,
    filteredCatalogTags,
    queryLabel,
    filteredTags,
    alreadyAssigned,
    reservedTag,
    canCreate,
  };
}

function buildFullscreenTagPickerMarkup(entry) {
  const model = getFullscreenTagPickerModel(entry);
  const items = [];

  items.push(...model.filteredCatalogTags.map((tag) => `
      <div class="fullscreen-tag-picker__item fullscreen-tag-picker__item--static">
        <span class="fullscreen-tag-picker__item-label">${escapeHtml(tag.label)}</span>
        <span class="fullscreen-tag-picker__item-meta">Already on this site</span>
      </div>
    `));

  items.push(...model.filteredTags.map((tag) => {
    const siteCount = Number(tag.siteCount || 0);
    const countLabel = siteCount === 1 ? '1 site' : `${siteCount.toLocaleString()} sites`;
    return `
      <button
        type="button"
        class="fullscreen-tag-picker__item"
        data-tag-pick="${escapeHtml(tag.id)}"
        title="Add ${escapeHtml(tag.label)} to ${escapeHtml(entry.siteId)}"
      >
        <span class="fullscreen-tag-picker__item-label">${escapeHtml(tag.label)}</span>
        <span class="fullscreen-tag-picker__item-meta">${escapeHtml(countLabel)}</span>
      </button>
    `;
  }));

  if (model.alreadyAssigned) {
    items.unshift(`
      <div class="fullscreen-tag-picker__item fullscreen-tag-picker__item--static">
        <span class="fullscreen-tag-picker__item-label">${escapeHtml(getManagedTagLabel(normalizeManagedTagId(model.queryLabel)))}</span>
        <span class="fullscreen-tag-picker__item-meta">Already added</span>
      </div>
    `);
  }

  if (model.reservedTag && !model.filteredCatalogTags.some((tag) => tag.id === model.reservedTag.id)) {
    items.unshift(`
      <div class="fullscreen-tag-picker__item fullscreen-tag-picker__item--static">
        <span class="fullscreen-tag-picker__item-label">${escapeHtml(model.reservedTag.label)}</span>
        <span class="fullscreen-tag-picker__item-meta">Visibility filter</span>
      </div>
    `);
  }

  if (model.canCreate) {
    items.push(`
      <button
        type="button"
        class="fullscreen-tag-picker__item fullscreen-tag-picker__item--create"
        data-tag-create="${escapeHtml(model.queryLabel)}"
        title="Create ${escapeHtml(model.queryLabel)} and add it to ${escapeHtml(entry.siteId)}"
      >
        <span class="fullscreen-tag-picker__item-label">Create "${escapeHtml(model.queryLabel)}"</span>
        <span class="fullscreen-tag-picker__item-meta">New tag</span>
      </button>
    `);
  }

  if (items.length === 0) {
    const emptyLabel = model.queryLabel
      ? model.reservedTag
        ? 'Visibility filters cannot be added as site tags.'
        : 'No matching tags.'
      : model.availableCount > 0
        ? 'No matching tags.'
        : model.catalogTagCount > 0
          ? 'No extra tags are available.'
          : 'No tags exist yet.';
    return `<div class="fullscreen-tag-picker__empty">${escapeHtml(emptyLabel)}</div>`;
  }

  return items.join('');
}

function renderFullscreenTagPicker(entry, options = {}) {
  if (!fullscreenTagToggleButton || !fullscreenTagPickerEl || !fullscreenTagSearchEl || !fullscreenTagPickerListEl) {
    return;
  }

  const disabled = options.disabled === true;
  const open = Boolean(entry) && state.fullscreenTagPicker.open && !disabled;
  fullscreenTagToggleButton.setAttribute('aria-expanded', open ? 'true' : 'false');
  fullscreenTagToggleButton.classList.toggle('is-active', open);
  fullscreenTagPickerEl.classList.toggle('is-hidden', !open);
  fullscreenTagSearchEl.value = state.fullscreenTagPicker.query;
  fullscreenTagSearchEl.disabled = disabled || !entry;

  if (!open || !entry) {
    fullscreenTagPickerListEl.innerHTML = '';
    return;
  }

  fullscreenTagPickerListEl.innerHTML = buildFullscreenTagPickerMarkup(entry);
}

function syncFullscreenTagEditorControls() {
  const entry = state.fullscreenEntry;
  const siteId = entry?.siteId || '';
  const busy = siteId ? isSiteMutationBusy(siteId) : false;
  const editable = canMutateEntry(entry);
  const hasEntry = Boolean(entry);
  const disabled = !hasEntry || busy || !editable || !state.apiBaseUrl;

  if (disabled) {
    state.fullscreenTagPicker.open = false;
  }

  if (fullscreenTagsDockEl) {
    fullscreenTagsDockEl.classList.toggle('is-read-only', hasEntry && !editable);
  }

  if (fullscreenTagToggleButton) {
    fullscreenTagToggleButton.disabled = disabled;
    fullscreenTagToggleButton.title = !hasEntry
      ? 'Pick a site first.'
      : !editable
        ? 'Read-only row.'
        : !state.apiBaseUrl
          ? COMPOSER_UNAVAILABLE_MESSAGE
          : busy
            ? `Saving tags for ${siteId}…`
            : `Pick or create a tag for ${siteId}.`;
  }

  fullscreenTagsListEl?.querySelectorAll('[data-tag-remove]').forEach((button) => {
    if (button instanceof HTMLButtonElement) {
      button.disabled = disabled;
    }
  });

  renderFullscreenTagPicker(entry, { disabled });
}

function renderFullscreenTagEditor(entry, options = {}) {
  if (!fullscreenTagsDockEl || !fullscreenTagsListEl || !fullscreenTagPickerListEl) {
    return;
  }

  if (!entry) {
    clearFullscreenTagEditor();
    return;
  }

  const previousSiteId = fullscreenTagsDockEl.dataset.siteId || '';
  if (previousSiteId && previousSiteId !== entry.siteId) {
    resetFullscreenTagPickerState();
  }

  const tags = getFullscreenDraftTagIds(entry).map((tagId) => ({
    id: tagId,
    label: getManagedTagLabel(tagId),
  }));
  fullscreenTagsDockEl.dataset.siteId = entry.siteId || '';
  fullscreenTagsListEl.innerHTML = tags.length > 0
    ? tags.map((tag) => {
      const label = tag.label;
      return `
        <span class="fullscreen-tag-chip">
          <span class="fullscreen-tag-chip__label">${escapeHtml(label)}</span>
          <button
            type="button"
            class="fullscreen-tag-chip__remove"
            data-site-id="${escapeHtml(entry.siteId)}"
            data-tag-remove="${escapeHtml(tag.id)}"
            title="Remove ${escapeHtml(label)} from ${escapeHtml(entry.siteId)}"
            aria-label="Remove ${escapeHtml(label)} from ${escapeHtml(entry.siteId)}"
          >
            <i class="ti ti-x"></i>
          </button>
        </span>
      `;
    }).join('')
    : '<p class="fullscreen-modal__tags-empty">No tags yet.</p>';

  if (options.preserveStatus !== true) {
    if (!canMutateEntry(entry)) {
      updateFullscreenTagStatus('Read-only row. Tags can only be changed on mutable launchpad entries.', 'warning');
    } else if (!state.apiBaseUrl) {
      updateFullscreenTagStatus(COMPOSER_UNAVAILABLE_MESSAGE, 'warning');
    } else {
      updateFullscreenTagStatus('', '');
    }
  }

  syncFullscreenTagEditorControls();
}

function clearFullscreenTagEditor() {
  resetFullscreenTagPickerState();
  if (fullscreenTagsDockEl) {
    fullscreenTagsDockEl.dataset.siteId = '';
    fullscreenTagsDockEl.classList.remove('is-read-only');
  }
  if (fullscreenTagsListEl) {
    fullscreenTagsListEl.textContent = '';
  }
  if (fullscreenTagSearchEl) {
    fullscreenTagSearchEl.value = '';
    fullscreenTagSearchEl.disabled = true;
  }
  if (fullscreenTagPickerListEl) {
    fullscreenTagPickerListEl.innerHTML = '';
  }
  if (fullscreenTagPickerEl) {
    fullscreenTagPickerEl.classList.add('is-hidden');
  }
  if (fullscreenTagToggleButton) {
    fullscreenTagToggleButton.disabled = true;
    fullscreenTagToggleButton.classList.remove('is-active');
    fullscreenTagToggleButton.setAttribute('aria-expanded', 'false');
  }
  updateFullscreenTagStatus('', '');
}

async function mutateSiteTags(siteId, options) {
  const entry = findEntryBySiteId(siteId);
  const editable = canMutateEntry(entry);
  const isEditingThisSite = !fullscreenModalEl?.classList.contains('is-hidden') && state.fullscreenEntry?.siteId === siteId;

  if (!editable) {
    if (isEditingThisSite) {
      updateFullscreenTagStatus('Read-only rows cannot be changed here.', 'warning');
    }
    return false;
  }
  if (!state.apiBaseUrl) {
    if (isEditingThisSite) {
      updateFullscreenTagStatus(COMPOSER_UNAVAILABLE_MESSAGE, 'error');
    }
    syncFullscreenTagEditorControls();
    return false;
  }
  if (state.tagBusy.has(siteId)) {
    return false;
  }

  const operatorKey = resolveOperatorKeyForProtectedAction(options.protectedAction);
  if (!operatorKey) {
    if (isEditingThisSite) {
      updateFullscreenTagStatus('Open Settings and paste the operator key once to manage tags.', 'warning');
    }
    return false;
  }

  const previousTags = getEntryOperatorTags(entry);
  const previousRegistry = cloneTagRegistry();
  state.tagBusy.add(siteId);

  if (options.optimisticTag) {
    mergeManagedTagIntoState(options.optimisticTag);
  }
  applyOperatorTagsToState(siteId, options.optimisticTags);
  if (isEditingThisSite) {
    updateFullscreenTagStatus(options.pendingMessage, 'info');
  }
  render();

  try {
    const response = await fetch(`${state.apiBaseUrl}/api/catalog/tags/site/${encodeURIComponent(siteId)}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-operator-key': operatorKey,
      },
      body: JSON.stringify(options.payload),
    });
    const data = await readJsonResponse(response);
    if (!response.ok) {
      const message = data.error ?? `Tag update failed (${response.status})`;
      if (isInvalidOperatorKeyFailure(response.status, message)) {
        applyOperatorTagsToState(siteId, previousTags);
        setTagRegistryState(previousRegistry);
        reopenOperatorAccessGate(options.protectedAction);
        if (isEditingThisSite) {
          updateFullscreenTagStatus('The remembered operator key was rejected. Paste the current key and continue.', 'warning');
        }
        return false;
      }
      throw new Error(message);
    }

    applyManagedTagRegistryPayload(data, options.optimisticTag || null);
    applyOperatorTagsToState(siteId, data.siteTags || data.operatorTags || options.optimisticTags);
    if (isEditingThisSite) {
      if (options.closePicker !== false) {
        closeFullscreenTagPicker();
      }
      updateFullscreenTagStatus(
        typeof options.successMessage === 'function' ? options.successMessage(data) : options.successMessage,
        'success'
      );
      syncFullscreenTagEditorControls();
    }
    render();
    return true;
  } catch (error) {
    applyOperatorTagsToState(siteId, previousTags);
    setTagRegistryState(previousRegistry);
    render();
    if (isEditingThisSite) {
      if (typeof options.restoreQuery === 'string') {
        state.fullscreenTagPicker.query = options.restoreQuery;
      }
      updateFullscreenTagStatus(error.message, 'error');
      syncFullscreenTagEditorControls();
    } else {
      window.alert(error.message);
    }
    return false;
  } finally {
    state.tagBusy.delete(siteId);
    render();
  }
}

async function addTagToSite(siteId, rawInput = state.fullscreenTagPicker.query || '') {
  const entry = findEntryBySiteId(siteId);
  const label = normalizeManagedTagLabel(rawInput);
  const rawTagId = normalizeManagedTagId(label);
  const tagId = resolveManagedTagId(label);
  const canonicalLabel = CATEGORY_TAG_LABEL_BY_ID.get(tagId) || label;

  if (!entry) {
    updateFullscreenTagStatus('Pick a site first.', 'warning');
    return false;
  }
  if (!label || !rawTagId) {
    updateFullscreenTagStatus('Type a tag name first.', 'warning');
    syncFullscreenTagEditorControls();
    return false;
  }
  if (!tagId) {
    updateFullscreenTagStatus('Use one of the platform tags.', 'warning');
    syncFullscreenTagEditorControls();
    return false;
  }
  if (isReservedCatalogTagId(tagId)) {
    updateFullscreenTagStatus(`${getCatalogTagLabel(tagId)} is a visibility filter, not a site tag.`, 'warning');
    syncFullscreenTagEditorControls();
    return false;
  }
  const stageInFullscreen = shouldStageFullscreenTagEdit(siteId);
  const currentTags = stageInFullscreen ? getFullscreenDraftTagIds(entry) : getEntryOperatorTags(entry);
  if (currentTags.includes(tagId)) {
    updateFullscreenTagStatus(`${getManagedTagLabel(tagId)} is already on ${siteId}.`, 'info');
    closeFullscreenTagPicker();
    syncFullscreenTagEditorControls();
    return false;
  }

  const optimisticTag = getManagedTagEntry(tagId) || { id: tagId, label: canonicalLabel };
  if (stageInFullscreen) {
    updateFullscreenDraftSiteState({ tags: [...currentTags, tagId] });
    closeFullscreenTagPicker();
    updateFullscreenTagStatus(`Staged ${optimisticTag.label}.`, 'info');
    renderFullscreenTagEditor(entry, { preserveStatus: true });
    syncFullscreenSiteStateControls();
    return true;
  }

  return mutateSiteTags(siteId, {
    payload: {
      action: 'add',
      tagId,
      label: canonicalLabel,
      source: location.hostname,
    },
    protectedAction: {
      label: 'Saving site tags',
      type: PROTECTED_ACTION_TAG,
      siteId,
      tagId,
      nextLabel: canonicalLabel,
      tagOperation: 'add-site',
    },
    optimisticTags: [...currentTags, tagId],
    optimisticTag,
    pendingMessage: `Adding ${optimisticTag.label} to ${siteId}…`,
    successMessage: (data) => {
      const nextTagId = normalizeManagedTagId(data?.tag?.id || tagId) || tagId;
      return `Added ${getManagedTagLabel(nextTagId)} to ${siteId}.`;
    },
    restoreQuery: rawInput,
  });
}

async function removeTagFromSite(siteId, tagId) {
  const entry = findEntryBySiteId(siteId);
  const normalizedTagId = normalizeManagedTagId(tagId);

  if (!entry) {
    updateFullscreenTagStatus('Pick a site first.', 'warning');
    return false;
  }
  if (!normalizedTagId) {
    updateFullscreenTagStatus('Pick a valid tag first.', 'warning');
    return false;
  }

  const stageInFullscreen = shouldStageFullscreenTagEdit(siteId);
  const currentTags = stageInFullscreen ? getFullscreenDraftTagIds(entry) : getEntryOperatorTags(entry);
  if (!currentTags.includes(normalizedTagId)) {
    updateFullscreenTagStatus(`${getManagedTagLabel(normalizedTagId)} is already gone.`, 'info');
    return false;
  }

  const label = getManagedTagLabel(normalizedTagId);
  if (stageInFullscreen) {
    updateFullscreenDraftSiteState({ tags: currentTags.filter((value) => value !== normalizedTagId) });
    updateFullscreenTagStatus(`Staged removal of ${label}.`, 'info');
    renderFullscreenTagEditor(entry, { preserveStatus: true });
    syncFullscreenSiteStateControls();
    return true;
  }

  return mutateSiteTags(siteId, {
    payload: {
      action: 'remove',
      tagId: normalizedTagId,
      source: location.hostname,
    },
    protectedAction: {
      label: 'Saving site tags',
      type: PROTECTED_ACTION_TAG,
      siteId,
      tagId: normalizedTagId,
      tagOperation: 'remove-site',
    },
    optimisticTags: currentTags.filter((value) => value !== normalizedTagId),
    pendingMessage: `Removing ${label} from ${siteId}…`,
    successMessage: `Removed ${label} from ${siteId}.`,
    closePicker: false,
  });
}

async function addFullscreenTag() {
  const siteId = state.fullscreenEntry?.siteId || '';
  if (!siteId) {
    updateFullscreenTagStatus('Pick a site first.', 'warning');
    return false;
  }
  return addTagToSite(siteId, state.fullscreenTagPicker.query || '');
}

function applyOperatorNoteToState(siteId, note, updatedAt, attachments) {
  const entry = findEntryBySiteId(siteId);
  if (!entry) {
    return;
  }
  const rawEntry = findRawEntryBySiteId(siteId);

  const normalizedAttachments = Array.isArray(attachments) ? normalizeFeedbackAttachments(attachments) : null;
  if (note || (normalizedAttachments && normalizedAttachments.length > 0)) {
    entry.operatorNote = note;
    entry.operatorNoteUpdatedAt = updatedAt || entry.operatorNoteUpdatedAt || null;
    if (normalizedAttachments) {
      entry.operatorNoteAttachments = normalizedAttachments;
    }
    if (rawEntry) {
      rawEntry.operatorNote = note;
      rawEntry.operatorNoteUpdatedAt = entry.operatorNoteUpdatedAt;
      if (normalizedAttachments) {
        rawEntry.operatorNoteAttachments = normalizedAttachments;
      }
    }
  } else {
    delete entry.operatorNote;
    delete entry.operatorNoteUpdatedAt;
    if (normalizedAttachments) {
      delete entry.operatorNoteAttachments;
    }
    if (rawEntry) {
      delete rawEntry.operatorNote;
      delete rawEntry.operatorNoteUpdatedAt;
      if (normalizedAttachments) {
        delete rawEntry.operatorNoteAttachments;
      }
    }
  }

  if (state.summary?.stats) {
    state.summary.stats.operatorNoteCount = state.entries.filter((item) => hasOperatorNote(item)).length;
  }
  if (state.rawSummary?.stats) {
    state.rawSummary.stats.operatorNoteCount = state.entries.filter((item) => hasOperatorNote(item)).length;
  }
}

async function saveSiteNote(siteId, note, options = {}) {
  const entry = findEntryBySiteId(siteId);
  if (!canMutateEntry(entry)) {
    updateNoteStatus('Imported CSV rows stay read-only in the launchpad.', 'warning');
    return false;
  }
  if (!state.apiBaseUrl) {
    updateNoteStatus(COMPOSER_UNAVAILABLE_MESSAGE, 'error');
    return false;
  }

  const normalizedNote = normalizeSiteNoteText(note);
  const operatorKey = resolveOperatorKeyForProtectedAction({
    label: 'Saving site note',
    type: PROTECTED_ACTION_NOTE,
    siteId,
    note: normalizedNote,
  });
  if (!operatorKey) {
    updateNoteStatus('Open Settings and paste the operator key once to save notes.', 'warning');
    return false;
  }

  if (state.noteBusy.has(siteId)) {
    return false;
  }

  const previousNote = getOperatorNote(entry);
  const previousUpdatedAt = entry.operatorNoteUpdatedAt || null;
  const wasEditingThisSite = !noteModalEl?.classList.contains('is-hidden') && noteModalEl?.dataset?.siteId === siteId;
  const wasEditingFullscreenThisSite = !fullscreenModalEl?.classList.contains('is-hidden') && state.fullscreenEntry?.siteId === siteId;
  const optimisticUpdatedAt = new Date().toISOString();

  state.noteBusy.add(siteId);
  syncNoteEditorControls();
  applyOperatorNoteToState(siteId, normalizedNote, optimisticUpdatedAt);
  if (wasEditingThisSite) {
    noteModalEl.dataset.initialNote = normalizedNote;
    updateNoteStatus(normalizedNote ? `Saving note for ${siteId}…` : `Clearing note for ${siteId}…`, 'info');
    closeNoteEditor({ force: true });
  }
  render();

  try {
    const response = await fetch(`${state.apiBaseUrl}/api/catalog/note/${encodeURIComponent(siteId)}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-operator-key': operatorKey,
      },
      body: JSON.stringify({
        operatorNote: normalizedNote,
        ...(Object.prototype.hasOwnProperty.call(options, 'attachments')
          ? { operatorNoteAttachments: normalizeFeedbackAttachments(options.attachments) }
          : {}),
        source: location.hostname,
      }),
    });
    const data = await readJsonResponse(response);
    if (!response.ok) {
      throw new Error(data.error ?? `Note save failed (${response.status})`);
    }

    applyOperatorNoteToState(
      siteId,
      data.operatorNote || normalizedNote,
      data.operatorNoteUpdatedAt || null,
      Object.prototype.hasOwnProperty.call(data, 'operatorNoteAttachments') ? data.operatorNoteAttachments : undefined,
    );
    delete state.noteDraftTexts[siteId];
    render();
    return true;
  } catch (error) {
    applyOperatorNoteToState(siteId, previousNote, previousUpdatedAt);
    render();
    if (wasEditingThisSite) {
      openNoteEditor(siteId);
      if (noteTextEl) {
        noteTextEl.value = normalizedNote;
      }
      if (noteModalEl) {
        noteModalEl.dataset.initialNote = previousNote;
      }
      updateNoteStatus(error.message, 'error');
      syncNoteEditorControls();
    }
    return false;
  } finally {
    state.noteBusy.delete(siteId);
    syncNoteEditorControls();
    render();
  }
}

async function submitNoteEditor() {
  const siteId = noteModalEl?.dataset?.siteId || '';
  if (!siteId) {
    updateNoteStatus('Pick a site first.', 'error');
    return false;
  }

  return saveSiteNote(siteId, noteTextEl?.value || '');
}

function wireRankControl(elements, entry) {
  const { valueEl, downButton, upButton } = elements;
  if (!valueEl || !downButton || !upButton) {
    return;
  }

  const disabled = !state.apiBaseUrl || !canMutateEntry(entry);
  const busy = isSiteMutationBusy(entry.siteId);

  updateRankValueElement(valueEl, entry.manualRank, busy);
  downButton.disabled = disabled || busy;
  upButton.disabled = disabled || busy;
  downButton.title = !canMutateEntry(entry)
    ? 'Imported CSV rows stay read-only in the launchpad.'
    : disabled
      ? COMPOSER_UNAVAILABLE_MESSAGE
      : `Lower manual rank for ${entry.siteId}`;
  upButton.title = !canMutateEntry(entry)
    ? 'Imported CSV rows stay read-only in the launchpad.'
    : disabled
      ? COMPOSER_UNAVAILABLE_MESSAGE
      : `Raise manual rank for ${entry.siteId}`;

  downButton.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (!canMutateEntry(entry)) {
      return;
    }
    updateManualRank(entry.siteId, -1);
  });
  upButton.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (!canMutateEntry(entry)) {
      return;
    }
    updateManualRank(entry.siteId, 1);
  });
}

function getRankModalEntry() {
  return findEntryBySiteId(state.rankModal.siteId);
}

function getRankModalDraftRankInfo() {
  const raw = String(rankModalInputEl?.value ?? state.rankModal.draftRank ?? '').trim();
  if (!raw || !/^-?\d+$/.test(raw)) {
    return { raw, valid: false, rank: null };
  }
  return {
    raw,
    valid: true,
    rank: normalizeManualRank(raw),
  };
}

function setRankModalStatus(message = '', tone = '') {
  state.rankModal.statusMessage = message || '';
  state.rankModal.statusTone = tone || '';
  syncRankModalControls();
}

function getRankModalSourceEntries(targetEntry) {
  const sourceEntries = state.visibleSiteEntries.length > 0
    ? state.visibleSiteEntries
    : state.entries.filter((entry) => entry?.hasHostedSite !== false);
  const bySiteId = new Map();
  for (const entry of sourceEntries) {
    if (entry?.siteId) {
      bySiteId.set(entry.siteId, entry);
    }
  }
  if (targetEntry?.siteId && !bySiteId.has(targetEntry.siteId)) {
    bySiteId.set(targetEntry.siteId, targetEntry);
  }
  return Array.from(bySiteId.values());
}

function buildRankModalProjectedEntries(targetEntry, targetRank) {
  return getRankModalSourceEntries(targetEntry)
    .map((entry) => (
      entry.siteId === targetEntry.siteId
        ? { ...entry, manualRank: targetRank }
        : entry
    ))
    .sort(compareManualRank);
}

function buildRankModalNeighborMarkup(entry, index, targetSiteId) {
  const title = buildDisplayTitle(entry) || entry.siteId;
  const host = entry.host || `${entry.siteId}.${BASE_DOMAIN}`;
  const previewUrl = getPreviewUrl(entry.siteId) || PREVIEW_PLACEHOLDER_URL;
  const isTarget = entry.siteId === targetSiteId;
  return `
    <div class="rank-modal__neighbor${isTarget ? ' is-target' : ''}">
      <span class="rank-modal__neighbor-position">${index + 1}</span>
      <span class="rank-modal__neighbor-preview" aria-hidden="true">
        <img src="${escapeHtml(previewUrl)}" alt="" loading="lazy">
      </span>
      <span class="rank-modal__neighbor-copy">
        <strong>${escapeHtml(title)}</strong>
        <small>${escapeHtml(host)}</small>
      </span>
      <span class="rank-modal__neighbor-rank">${escapeHtml(formatManualRank(entry.manualRank))}</span>
    </div>
  `;
}

function renderRankModalProjection() {
  const entry = getRankModalEntry();
  if (!entry || !rankModalNeighborsEl) {
    return;
  }

  const rankInfo = getRankModalDraftRankInfo();
  if (!rankInfo.valid) {
    rankModalNeighborsEl.innerHTML = '<div class="rank-modal__empty">Type an integer rank to preview placement.</div>';
    if (rankModalPositionEl) {
      rankModalPositionEl.textContent = 'Projected rank position';
    }
    return;
  }

  const projected = buildRankModalProjectedEntries(entry, rankInfo.rank);
  const targetIndex = projected.findIndex((item) => item.siteId === entry.siteId);
  const startIndex = Math.max(0, targetIndex - 2);
  const endIndex = Math.min(projected.length, targetIndex + 3);
  const neighbors = projected.slice(startIndex, endIndex);
  rankModalNeighborsEl.innerHTML = neighbors
    .map((item, offset) => buildRankModalNeighborMarkup(item, startIndex + offset, entry.siteId))
    .join('');

  if (rankModalPositionEl) {
    rankModalPositionEl.textContent = targetIndex >= 0
      ? `Would sit ${targetIndex + 1} of ${projected.length}`
      : 'Projected rank position';
  }
}

function syncRankModalControls() {
  if (!rankModalEl) {
    return;
  }

  const entry = getRankModalEntry();
  const rankInfo = getRankModalDraftRankInfo();
  const hasEntry = Boolean(entry);
  const editable = canMutateEntry(entry);
  const apiUnavailable = !state.apiBaseUrl;
  const busy = Boolean(entry?.siteId) && isSiteMutationBusy(entry.siteId);
  const currentRank = normalizeManualRank(entry?.manualRank);
  const unchanged = rankInfo.valid && rankInfo.rank === currentRank;
  const saveDisabled = !hasEntry || !editable || apiUnavailable || busy || !rankInfo.valid || unchanged;

  if (rankModalSaveButton) {
    rankModalSaveButton.disabled = saveDisabled;
    rankModalSaveButton.title = !hasEntry
      ? 'Pick a site first.'
      : !editable
        ? 'Read-only row.'
        : apiUnavailable
          ? COMPOSER_UNAVAILABLE_MESSAGE
          : busy
            ? `Saving ${entry.siteId}...`
            : !rankInfo.valid
              ? 'Rank must be an integer.'
              : unchanged
                ? 'No rank change yet.'
                : `Save rank ${formatManualRank(rankInfo.rank)} for ${entry.siteId}.`;
  }

  const statusMessage = state.rankModal.statusMessage
    || (!hasEntry
      ? ''
      : !editable
        ? 'Read-only row.'
        : apiUnavailable
          ? COMPOSER_UNAVAILABLE_MESSAGE
          : !rankInfo.valid
            ? 'Rank must be an integer.'
            : unchanged
              ? 'No rank change yet.'
              : '');
  const statusTone = state.rankModal.statusTone
    || (!hasEntry || (rankInfo.valid && !apiUnavailable && editable) ? '' : 'warning');
  if (rankModalStatusEl) {
    rankModalStatusEl.textContent = statusMessage;
    rankModalStatusEl.className = statusTone
      ? `rank-modal__status is-${statusTone}`
      : 'rank-modal__status';
  }
}

function renderRankModal() {
  const entry = getRankModalEntry();
  if (!entry || !rankModalEl) {
    closeRankModal();
    return;
  }

  const type = buildTypeDescriptor(entry);
  const title = buildDisplayTitle(entry) || entry.siteId;
  const host = entry.host || `${entry.siteId}.${BASE_DOMAIN}`;
  if (rankModalIconEl) {
    rankModalIconEl.className = `site-type-icon ${type.icon}`;
    rankModalIconEl.title = type.tooltip || '';
  }
  if (rankModalTitleEl) {
    rankModalTitleEl.textContent = title;
  }
  if (rankModalHostEl) {
    rankModalHostEl.textContent = host;
  }
  if (rankModalCurrentEl) {
    rankModalCurrentEl.textContent = formatManualRank(entry.manualRank);
  }
  if (rankModalInputEl && document.activeElement !== rankModalInputEl) {
    rankModalInputEl.value = String(state.rankModal.draftRank);
  }

  renderRankModalProjection();
  syncRankModalControls();
}

function updateRankModalFromInput() {
  const rankInfo = getRankModalDraftRankInfo();
  if (rankInfo.valid) {
    state.rankModal.draftRank = rankInfo.rank;
    state.rankModal.statusMessage = '';
    state.rankModal.statusTone = '';
  }
  renderRankModalProjection();
  syncRankModalControls();
}

function applyRankModalDelta(delta) {
  if (!rankModalInputEl) {
    return;
  }
  const rankInfo = getRankModalDraftRankInfo();
  const baseRank = rankInfo.valid ? rankInfo.rank : normalizeManualRank(state.rankModal.draftRank);
  rankModalInputEl.value = String(normalizeManualRank(baseRank + delta));
  updateRankModalFromInput();
  rankModalInputEl.focus({ preventScroll: true });
  rankModalInputEl.select?.();
}

function resetRankModalDraft() {
  if (!rankModalInputEl) {
    return;
  }
  rankModalInputEl.value = '0';
  updateRankModalFromInput();
  rankModalInputEl.focus({ preventScroll: true });
  rankModalInputEl.select?.();
}

function openRankModal(entryOrSiteId) {
  const entry = typeof entryOrSiteId === 'string'
    ? findEntryBySiteId(entryOrSiteId)
    : findEntryBySiteId(entryOrSiteId?.siteId || '');
  if (!entry || !rankModalEl) {
    return false;
  }

  const rank = normalizeManualRank(entry.manualRank);
  state.rankModal.siteId = entry.siteId;
  state.rankModal.draftRank = rank;
  state.rankModal.statusMessage = '';
  state.rankModal.statusTone = '';
  rankModalEl.dataset.siteId = entry.siteId;
  if (rankModalInputEl) {
    rankModalInputEl.value = String(rank);
  }
  renderRankModal();
  rankModalEl.classList.remove('is-hidden');
  document.body.classList.add('has-rank-modal-open');
  window.requestAnimationFrame(() => {
    rankModalPanelEl?.focus({ preventScroll: true });
    rankModalInputEl?.focus({ preventScroll: true });
    rankModalInputEl?.select?.();
  });
  return true;
}

function closeRankModal() {
  if (!rankModalEl) {
    return;
  }
  rankModalEl.classList.add('is-hidden');
  rankModalEl.dataset.siteId = '';
  document.body.classList.remove('has-rank-modal-open');
  state.rankModal.siteId = '';
  state.rankModal.draftRank = 0;
  state.rankModal.statusMessage = '';
  state.rankModal.statusTone = '';
  if (rankModalInputEl) {
    rankModalInputEl.value = '';
  }
  if (rankModalNeighborsEl) {
    rankModalNeighborsEl.replaceChildren();
  }
  syncRankModalControls();
}

async function submitRankModal() {
  const entry = getRankModalEntry();
  const rankInfo = getRankModalDraftRankInfo();
  if (!entry) {
    setRankModalStatus('Pick a site first.', 'warning');
    return false;
  }
  if (!rankInfo.valid) {
    setRankModalStatus('Rank must be an integer.', 'warning');
    rankModalInputEl?.focus({ preventScroll: true });
    return false;
  }
  if (!canMutateEntry(entry)) {
    setRankModalStatus('Read-only row.', 'warning');
    return false;
  }
  if (rankInfo.rank === normalizeManualRank(entry.manualRank)) {
    setRankModalStatus('No rank change yet.', 'info');
    return false;
  }

  setRankModalStatus(`Saving ${entry.siteId}...`, 'info');
  const saved = await setManualRank(entry.siteId, rankInfo.rank);
  if (saved) {
    closeRankModal();
  } else if (!rankModalEl?.classList.contains('is-hidden')) {
    renderRankModal();
  }
  return saved;
}

function wireRankModalControl(button, entry) {
  if (!button) {
    return;
  }

  const rank = normalizeManualRank(entry.manualRank);
  const title = buildDisplayTitle(entry) || entry.siteId;
  button.classList.toggle('is-positive', rank > 0);
  button.classList.toggle('is-negative', rank < 0);
  button.title = `Rank ${formatManualRank(rank)}. Open rank editor for ${title}.`;
  button.setAttribute('role', 'button');
  button.tabIndex = 0;
  button.setAttribute('aria-label', button.title);

  button.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    openRankModal(entry.siteId);
  });
  button.addEventListener('keydown', (event) => {
    if (event.key !== 'Enter' && event.key !== ' ') {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    openRankModal(entry.siteId);
  });
}

function wireMainSiteControl(button, entry) {
  if (!button) {
    return;
  }

  updateMainSiteButton(button, entry);
  button.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (!canMutateEntry(entry)) {
      return;
    }
    updateMainSite(entry.siteId);
  });
}

async function mutateManualRank(siteId, payload, optimisticRank, actionLabel) {
  const entry = findEntryBySiteId(siteId);
  if (!canMutateEntry(entry)) {
    return false;
  }
  if (!state.apiBaseUrl) {
    window.alert(COMPOSER_UNAVAILABLE_MESSAGE);
    return false;
  }

  if (isSiteMutationBusy(siteId)) {
    return false;
  }

  const operatorKey = resolveOperatorKeyForProtectedAction(actionLabel);
  if (!operatorKey) {
    return false;
  }

  const previousRank = normalizeManualRank(entry.manualRank);
  const previousUpdatedAt = entry.manualRankUpdatedAt || null;
  const nextRank = normalizeManualRank(optimisticRank);
  const optimisticUpdatedAt = new Date().toISOString();

  state.rankBusy.add(siteId);
  applyManualRankToState(siteId, nextRank, optimisticUpdatedAt);
  render();

  try {
    const response = await fetch(`${state.apiBaseUrl}/api/catalog/rank/${encodeURIComponent(siteId)}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-operator-key': operatorKey,
      },
      body: JSON.stringify(payload),
    });

    const data = await readJsonResponse(response);
    if (!response.ok) {
      const message = data.error ?? `Rank update failed (${response.status})`;
      if (isInvalidOperatorKeyFailure(response.status, message)) {
        applyManualRankToState(siteId, previousRank, previousUpdatedAt);
        reopenOperatorAccessGate(actionLabel);
        return false;
      }
      throw new Error(message);
    }

    applyManualRankToState(siteId, data.manualRank, data.manualRankUpdatedAt || null);
    return true;
  } catch (error) {
    applyManualRankToState(siteId, previousRank, previousUpdatedAt);
    render();
    window.alert(error.message);
    return false;
  } finally {
    state.rankBusy.delete(siteId);
    render();
  }
}

async function updateManualRank(siteId, delta) {
  const entry = findEntryBySiteId(siteId);
  if (!entry) {
    return false;
  }
  return queueManualRankValue(siteId, normalizeManualRank(entry.manualRank) + normalizeManualRank(delta));
}

async function setManualRank(siteId, value) {
  const parsedValue = Number.parseInt(String(value || '').trim(), 10);
  if (!Number.isFinite(parsedValue)) {
    window.alert('Rank must be an integer.');
    return false;
  }
  return mutateManualRank(
    siteId,
    { value: parsedValue },
    parsedValue,
    {
      label: 'Setting site rank',
      type: PROTECTED_ACTION_RANK,
      siteId,
      value: parsedValue,
    },
  );
}

async function updateSiteDisplayName(siteId, displayName, siteIds = [], options = {}) {
  const entry = findEntryBySiteId(siteId);
  const targets = Array.from(new Set(
    [siteId, ...(Array.isArray(siteIds) ? siteIds : [])]
      .map((value) => String(value ?? '').trim().toLowerCase())
      .filter(Boolean)
  ));

  if (!entry || targets.length === 0) {
    return false;
  }
  if (!targets.every((targetSiteId) => canMutateEntry(findEntryBySiteId(targetSiteId)))) {
    return false;
  }
  if (!state.apiBaseUrl) {
    window.alert(COMPOSER_UNAVAILABLE_MESSAGE);
    return false;
  }
  if (targets.some((targetSiteId) => state.previewBusy.has(targetSiteId) || isSiteMutationBusy(targetSiteId))) {
    return options.returnResult ? { ok: false, error: 'Another mutation is already running for this site.' } : false;
  }

  const normalizedDisplayName = normalizeFriendlyName(displayName);
  const actionLabel = options.actionLabel || {
    label: 'Updating the title',
    type: PROTECTED_ACTION_DISPLAY_NAME,
    siteId,
    siteIds: targets,
    nextLabel: normalizedDisplayName,
  };
  const operatorKey = String(options.operatorKey || '').trim() || resolveOperatorKeyForProtectedAction(actionLabel);
  if (!operatorKey) {
    return options.returnResult ? { ok: false, error: 'Missing operator key.' } : false;
  }

  targets.forEach((targetSiteId) => state.displayNameBusy.add(targetSiteId));
  if (!options.skipFullscreenStatus && state.fullscreenEntry?.siteId === siteId) {
    updateFullscreenFriendlyNameStatus(
      normalizedDisplayName
        ? `Saving the shared title for ${targets.length > 1 ? `${targets.length} sites` : siteId}…`
        : `Clearing the shared title for ${targets.length > 1 ? `${targets.length} sites` : siteId}…`,
      'info'
    );
  }
  render();

  try {
    const response = await fetch(`${state.apiBaseUrl}/api/catalog/display-name/${encodeURIComponent(siteId)}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-operator-key': operatorKey,
      },
      body: JSON.stringify({
        displayName: normalizedDisplayName,
        siteIds: targets,
        source: location.hostname,
      }),
    });

    const data = await readJsonResponse(response);
    if (!response.ok) {
      const message = data.error ?? `Title update failed (${response.status})`;
      if (isInvalidOperatorKeyFailure(response.status, message)) {
        reopenOperatorAccessGate(actionLabel);
        return options.returnResult ? { ok: false, invalidOperatorKey: true, error: message } : false;
      }
      throw new Error(message);
    }

    targets.forEach((targetSiteId) => syncBulkRenameRowAfterDisplayName(targetSiteId, normalizedDisplayName));
    if (options.skipRestore) {
      await refreshCatalog();
    } else {
      await refreshCatalogAndRestoreFullscreen(siteId);
    }
    return options.returnResult ? { ok: true } : true;
  } catch (error) {
    console.error(error);
    if (!options.skipFullscreenStatus && state.fullscreenEntry?.siteId === siteId) {
      updateFullscreenFriendlyNameStatus(error.message, 'error');
    } else if (!options.silent) {
      window.alert(error.message);
    }
    return options.returnResult ? { ok: false, error: error.message || 'Title update failed.' } : false;
  } finally {
    targets.forEach((targetSiteId) => state.displayNameBusy.delete(targetSiteId));
    render();
  }
}

async function updateMainSite(siteId) {
  const entry = findEntryBySiteId(siteId);
  if (!canMutateEntry(entry)) {
    return;
  }
  if (entry?.siteId !== ROOT_SITE_ID && entry?.isPublic !== true) {
    window.alert('Make this site public before using it as mullmania.com.');
    return;
  }
  if (!state.apiBaseUrl) {
    window.alert(COMPOSER_UNAVAILABLE_MESSAGE);
    return;
  }

  if (state.mainSiteBusy || siteId === state.mainSiteId) {
    return;
  }

  const operatorKey = resolveOperatorKeyForProtectedAction({
    label: 'Changing the main site',
    type: PROTECTED_ACTION_MAIN_SITE,
    siteId,
  });
  if (!operatorKey) {
    return;
  }

  state.mainSiteBusy = true;
  render();

  try {
    const response = await fetch(`${state.apiBaseUrl}/api/catalog/main/${encodeURIComponent(siteId)}`, {
      method: 'POST',
      headers: {
        'x-operator-key': operatorKey,
      },
    });

    const data = await readJsonResponse(response);
    if (!response.ok) {
      throw new Error(data.error ?? `Main-site update failed (${response.status})`);
    }

    await refreshCatalogAndRestoreFullscreen(siteId);
  } catch (error) {
    console.error(error);
    window.alert(error.message);
  } finally {
    state.mainSiteBusy = false;
    render();
  }
}

function waitMs(durationMs) {
  return new Promise((resolve) => window.setTimeout(resolve, durationMs));
}

function normalizeAccessJob(rawJob) {
  const siteId = String(rawJob?.siteId || '').trim();
  if (!siteId) {
    return null;
  }
  const startedAt = Number(rawJob?.startedAt) || Date.now();
  if (Date.now() - startedAt > ACCESS_JOB_MAX_AGE_MS) {
    return null;
  }
  return {
    siteId,
    expectedPublic: rawJob?.expectedPublic === true,
    host: String(rawJob?.host || `${siteId}.${BASE_DOMAIN}`).trim(),
    startedAt,
    status: String(rawJob?.status || 'processing'),
    message: String(rawJob?.message || 'Access update is still processing.'),
  };
}

function getAccessJob(siteId) {
  return state.accessJobs[String(siteId || '').trim()] || null;
}

function persistAccessJobs() {
  const jobs = Object.values(state.accessJobs).map((job) => ({
    siteId: job.siteId,
    expectedPublic: job.expectedPublic === true,
    host: job.host,
    startedAt: job.startedAt,
    status: job.status,
    message: job.message,
  }));
  if (jobs.length === 0) {
    localStorage.removeItem(ACCESS_JOBS_STORAGE_KEY);
    return;
  }
  localStorage.setItem(ACCESS_JOBS_STORAGE_KEY, JSON.stringify(jobs));
}

function syncAccessBusyFromJobs() {
  state.accessBusy.clear();
  Object.values(state.accessJobs).forEach((job) => {
    if (job?.status !== 'success' && job?.status !== 'error') {
      state.accessBusy.add(job.siteId);
    }
  });
}

function restoreAccessJobs() {
  let parsed = [];
  try {
    parsed = JSON.parse(localStorage.getItem(ACCESS_JOBS_STORAGE_KEY) || '[]');
  } catch {
    parsed = [];
  }
  state.accessJobs = {};
  (Array.isArray(parsed) ? parsed : []).forEach((rawJob) => {
    const job = normalizeAccessJob(rawJob);
    if (job) {
      state.accessJobs[job.siteId] = job;
    }
  });
  syncAccessBusyFromJobs();
  persistAccessJobs();
}

function upsertAccessJob(siteId, patch = {}) {
  const entry = findEntryBySiteId(siteId);
  const existing = getAccessJob(siteId);
  const expectedPublic = typeof patch.expectedPublic === 'boolean'
    ? patch.expectedPublic
    : existing?.expectedPublic === true;
  const job = normalizeAccessJob({
    ...existing,
    siteId,
    expectedPublic,
    host: patch.host || existing?.host || entry?.host || `${siteId}.${BASE_DOMAIN}`,
    startedAt: existing?.startedAt || Date.now(),
    status: patch.status || existing?.status || 'processing',
    message: patch.message || existing?.message || 'Access update is still processing.',
  });
  if (!job) {
    return null;
  }
  state.accessJobs[job.siteId] = job;
  syncAccessBusyFromJobs();
  persistAccessJobs();
  return job;
}

function finishAccessJob(siteId, patch = {}) {
  const job = upsertAccessJob(siteId, {
    status: patch.status || 'success',
    message: patch.message || 'Access update finished.',
  });
  syncAccessBusyFromJobs();
  persistAccessJobs();
  return job;
}

function clearAccessJob(siteId) {
  delete state.accessJobs[String(siteId || '').trim()];
  syncAccessBusyFromJobs();
  persistAccessJobs();
}

function resumeStoredAccessJobs() {
  const operatorKey = getKnownOperatorKey();
  Object.values(state.accessJobs).forEach((job) => {
    if (!operatorKey || job.status === 'success' || job.status === 'error') {
      return;
    }
    monitorSiteAccessJob(job.siteId, job.expectedPublic, operatorKey, { refreshAfter: true });
  });
  render();
}

async function fetchSiteAccessVerification(siteId, operatorKey) {
  const response = await fetch(`${state.apiBaseUrl}/api/catalog/access/verify/${encodeURIComponent(siteId)}`, {
    method: 'POST',
    headers: {
      'x-operator-key': operatorKey,
    },
  });

  const data = await readJsonResponse(response);
  if (!response.ok) {
    const message = data.error ?? `Site access verification failed (${response.status})`;
    throw new Error(message);
  }
  return data;
}

function summarizeSiteAccessExpectations(data, fallbackSiteId, fallbackExpectedPublic) {
  const explicitResults = Array.isArray(data?.results)
    ? data.results
      .filter((result) => result && typeof result.host === 'string' && result.host.trim())
      .map((result) => ({
        host: result.host.trim(),
        expectedPublic: result.expectedPublic === true,
      }))
    : [];

  const expectations = explicitResults.length > 0
    ? explicitResults
    : (
      Array.isArray(data?.probeHosts) && data.probeHosts.length > 0
        ? data.probeHosts.map((host) => ({
          host: String(host || '').trim(),
          expectedPublic: fallbackExpectedPublic,
        })).filter((item) => item.host)
        : [{
          host: `${fallbackSiteId}.${BASE_DOMAIN}`,
          expectedPublic: fallbackExpectedPublic,
        }]
    );

  const uniformExpectedPublic = expectations.length > 0 && expectations.every((item) => item.expectedPublic === expectations[0].expectedPublic)
    ? expectations[0].expectedPublic
    : null;

  return {
    expectations,
    uniformExpectedPublic,
    hostSummary: expectations
      .map((item) => `${item.expectedPublic ? 'public' : 'private'} ${item.host}`)
      .join(', '),
  };
}

async function waitForSiteAccessPropagation(siteId, expectedPublic, operatorKey, options = {}) {
  const startedAt = Date.now();
  const onProgress = typeof options.onProgress === 'function' ? options.onProgress : null;
  const pendingMessage = typeof options.pendingMessage === 'function' ? options.pendingMessage : null;
  const successMessage = typeof options.successMessage === 'function' ? options.successMessage : null;
  const timeoutMessage = typeof options.timeoutMessage === 'function' ? options.timeoutMessage : null;
  let lastData = null;
  let lastError = null;

  while (Date.now() - startedAt < ACCESS_VERIFY_TIMEOUT_MS) {
    try {
      lastData = await fetchSiteAccessVerification(siteId, operatorKey);
      const summary = summarizeSiteAccessExpectations(lastData, siteId, expectedPublic);
      if (lastData?.verified === true && lastData?.expectedPublic === expectedPublic) {
        onProgress?.({
          data: lastData,
          tone: 'success',
          message: successMessage
            ? successMessage({ data: lastData, summary })
            : summary.uniformExpectedPublic === true
              ? `Public access confirmed on ${summary.hostSummary}.`
              : summary.uniformExpectedPublic === false
                ? `Private access confirmed on ${summary.hostSummary}.`
                : `Access routing confirmed on ${summary.hostSummary}.`,
        });
        return lastData;
      }

      onProgress?.({
        data: lastData,
        tone: 'info',
        message: pendingMessage
          ? pendingMessage({ data: lastData, summary })
          : summary.uniformExpectedPublic === true
            ? `Publishing ${siteId}… checking ${summary.hostSummary}`
            : summary.uniformExpectedPublic === false
              ? `Locking ${siteId}… checking ${summary.hostSummary}`
              : `Updating ${siteId}… checking ${summary.hostSummary}`,
      });
      lastError = null;
    } catch (error) {
      lastError = error;
      onProgress?.({
        tone: 'warning',
        message: `Checking ${siteId}… ${error.message}`,
      });
    }

    await waitMs(ACCESS_VERIFY_INTERVAL_MS);
  }

  if (lastError) {
    throw new Error(`${lastError.message} The edge probe never settled within 60 seconds.`);
  }

  const summary = summarizeSiteAccessExpectations(lastData, siteId, expectedPublic);
  if (timeoutMessage) {
    throw new Error(timeoutMessage({ data: lastData, summary }));
  }
  if (summary.uniformExpectedPublic === null) {
    throw new Error(`The access routing probe for ${siteId} did not settle within 60 seconds. Checked ${summary.hostSummary}.`);
  }
  throw new Error(`The ${expectedPublic ? 'public' : 'private'} access probe for ${siteId} did not settle within 60 seconds. Checked ${summary.hostSummary}.`);
}

async function monitorSiteAccessJob(siteId, expectedPublic, operatorKey, options = {}) {
  upsertAccessJob(siteId, {
    expectedPublic,
    status: 'processing',
    message: `${expectedPublic ? 'Publishing' : 'Locking'} ${siteId}… this can take 30-60 seconds.`,
  });
  renderAccessModal();
  render();

  try {
    await waitForSiteAccessPropagation(siteId, expectedPublic, operatorKey, {
      onProgress: ({ message, tone }) => {
        upsertAccessJob(siteId, {
          expectedPublic,
          status: tone === 'warning' ? 'warning' : 'processing',
          message,
        });
        renderAccessModal();
        render();
      },
    });
    finishAccessJob(siteId, {
      status: 'success',
      message: `${siteId} is now ${expectedPublic ? 'public' : 'private'}.`,
    });
    if (options.refreshAfter !== false) {
      await refreshCatalogAndRestoreFullscreen(siteId);
    }
    renderAccessModal();
    render();
    window.setTimeout(() => {
      if (state.accessModalSiteId === siteId) {
        return;
      }
      clearAccessJob(siteId);
      renderAccessModal();
      render();
    }, 4000);
    return true;
  } catch (error) {
    console.error(error);
    finishAccessJob(siteId, {
      status: 'error',
      message: error.message,
    });
    renderAccessModal();
    render();
    return false;
  }
}

async function updateSiteAliases(siteId, aliases) {
  const entry = findEntryBySiteId(siteId);
  if (!canMutateEntry(entry) || entry?.hasHostedSite !== true) {
    return false;
  }
  if (!state.apiBaseUrl) {
    window.alert(COMPOSER_UNAVAILABLE_MESSAGE);
    return false;
  }
  if (state.aliasBusy.has(siteId) || state.previewBusy.has(siteId) || isSiteMutationBusy(siteId)) {
    return false;
  }

  const operatorKey = resolveOperatorKeyForProtectedAction({
    label: 'Updating site aliases',
    type: PROTECTED_ACTION_SITE_ALIASES,
    siteId,
  });
  if (!operatorKey) {
    return false;
  }

  state.aliasBusy.add(siteId);
  if (state.fullscreenEntry?.siteId === siteId) {
    updateFullscreenAliasesStatus(`Saving aliases for ${siteId}…`, 'info');
  }
  render();

  try {
    const response = await fetch(`${state.apiBaseUrl}/api/catalog/aliases/site/${encodeURIComponent(siteId)}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-operator-key': operatorKey,
      },
      body: JSON.stringify({ aliases }),
    });

    const data = await readJsonResponse(response);
    if (!response.ok) {
      const message = data.error ?? `Alias update failed (${response.status})`;
      if (isInvalidOperatorKeyFailure(response.status, message)) {
        reopenOperatorAccessGate({
          label: 'Updating site aliases',
          type: PROTECTED_ACTION_SITE_ALIASES,
          siteId,
        });
        return false;
      }
      throw new Error(message);
    }

    await waitForSiteAccessPropagation(siteId, entry.isPublic === true, operatorKey, {
      pendingMessage: ({ summary }) => `Updating aliases for ${siteId}… checking ${summary.hostSummary}`,
      successMessage: ({ summary }) => `Alias routing confirmed on ${summary.hostSummary}.`,
      timeoutMessage: ({ summary }) => `The alias routing probe for ${siteId} did not settle within 30 seconds. Checked ${summary.hostSummary}.`,
      onProgress: ({ message, tone }) => {
        if (state.fullscreenEntry?.siteId === siteId) {
          updateFullscreenAliasesStatus(message, tone);
        }
      },
    });

    await refreshCatalogAndRestoreFullscreen(siteId);
    return true;
  } catch (error) {
    console.error(error);
    if (state.fullscreenEntry?.siteId === siteId) {
      updateFullscreenAliasesStatus(error.message, 'error');
    } else {
      window.alert(error.message);
    }
    return false;
  } finally {
    state.aliasBusy.delete(siteId);
    render();
  }
}

function getAccessModalTarget() {
  const siteId = state.accessModalSiteId || '';
  const entry = findEntryBySiteId(siteId);
  if (!entry) {
    return { entry: null, nextIsPublic: false, job: null };
  }
  const job = getAccessJob(siteId);
  const nextIsPublic = job ? job.expectedPublic === true : entry.isPublic !== true;
  return { entry, nextIsPublic, job };
}

function setAccessModalStatus(message = '', tone = '') {
  if (!accessModalStatusEl) {
    return;
  }
  accessModalStatusEl.textContent = message;
  accessModalStatusEl.className = tone ? `access-modal__status is-${tone}` : 'access-modal__status';
}

function renderAccessModal() {
  if (!accessModalEl || accessModalEl.classList.contains('is-hidden')) {
    return;
  }
  const { entry, nextIsPublic, job } = getAccessModalTarget();
  if (!entry) {
    closeAccessModal();
    return;
  }

  const isProcessing = Boolean(job && job.status !== 'success' && job.status !== 'error');
  const isTerminal = Boolean(job && (job.status === 'success' || job.status === 'error'));
  const actionLabel = nextIsPublic ? 'Make public' : 'Make private';
  const host = entry.host || `${entry.siteId}.${BASE_DOMAIN}`;

  if (accessModalIconEl) {
    accessModalIconEl.className = nextIsPublic ? 'ti ti-lock-open' : 'ti ti-lock';
  }
  if (accessModalTitleEl) {
    accessModalTitleEl.textContent = job?.status === 'success'
      ? 'Access updated'
      : job?.status === 'error'
        ? 'Access check failed'
        : `${actionLabel}?`;
  }
  if (accessModalHostEl) {
    accessModalHostEl.textContent = host;
  }
  if (accessModalPreviewEl instanceof HTMLImageElement) {
    assignPreviewImage(accessModalPreviewEl, getPreviewUrl(entry.siteId), `${entry.siteId} preview`, entry);
  }
  if (accessModalSummaryEl) {
    accessModalSummaryEl.textContent = isTerminal && job?.message
      ? job.message
      : nextIsPublic
      ? 'Switching to public removes the site-key requirement for the direct host.'
      : 'Switching to private puts the direct host behind the site-key requirement.';
  }
  setAccessModalStatus(
    job?.message || 'After the change starts, propagation can take about 30-60 seconds.',
    job?.status === 'error' ? 'error' : job?.status === 'success' ? 'success' : job ? 'info' : ''
  );
  if (accessModalConfirmButton) {
    accessModalConfirmButton.disabled = isProcessing || isTerminal || !canToggleSiteAccess(entry);
    accessModalConfirmButton.innerHTML = isProcessing
      ? '<i class="ti ti-loader-2 fullscreen-modal__spinner"></i><span>Processing…</span>'
      : `<i class="${nextIsPublic ? 'ti ti-lock-open' : 'ti ti-lock'}"></i><span>${actionLabel}</span>`;
  }
  if (accessModalCancelButton) {
    accessModalCancelButton.textContent = job ? 'Close' : 'Cancel';
  }
}

function openSiteAccessModal(entry) {
  if (!accessModalEl || !canToggleSiteAccess(entry)) {
    return false;
  }
  state.accessModalSiteId = entry.siteId;
  accessModalEl.classList.remove('is-hidden');
  renderAccessModal();
  accessModalPanelEl?.focus({ preventScroll: true });
  return true;
}

function closeAccessModal() {
  const job = getAccessJob(state.accessModalSiteId);
  if (job?.status === 'success' || job?.status === 'error') {
    clearAccessJob(state.accessModalSiteId);
    render();
  }
  if (accessModalEl) {
    accessModalEl.classList.add('is-hidden');
  }
  state.accessModalSiteId = '';
}

function resolveVsCodeModalSiteId() {
  if (composerModalEl && !composerModalEl.classList.contains('is-hidden')) {
    const composerSiteId = normalizeSiteId(composerSiteIdEl?.value || '');
    if (composerSiteId) {
      return composerSiteId;
    }
  }

  if (state.fullscreenEntry?.siteId) {
    return state.fullscreenEntry.siteId;
  }

  return state.lastSelectedSiteId || state.activeTableSiteId || '';
}

function syncComposerVsCodeButton(validation = null) {
  if (!composerVscodeButton) {
    return;
  }
  const siteId = validation?.siteId || normalizeSiteId(composerSiteIdEl?.value || '');
  composerVscodeButton.disabled = !siteId;
  composerVscodeButton.title = siteId
    ? `Open ${siteId} in the VS Code bridge.`
    : 'Type a site name first.';
}

function openVsCodeModal(siteId = '') {
  if (!vscodeModalEl) {
    return false;
  }

  const normalizedSiteId = normalizeSiteId(siteId);
  const entry = findEntryBySiteId(normalizedSiteId);
  const host = entry?.host || (normalizedSiteId ? `${normalizedSiteId}.${BASE_DOMAIN}` : BASE_DOMAIN);
  const vscodeUri = normalizedSiteId
    ? `${VSCODE_OPEN_URI_BASE}?site=${encodeURIComponent(normalizedSiteId)}`
    : VSCODE_OPEN_URI_BASE;

  if (vscodeModalHostLinkEl instanceof HTMLAnchorElement) {
    const siteHref = `https://${host}/`;
    vscodeModalHostLinkEl.textContent = host;
    vscodeModalHostLinkEl.href = siteHref;
  }
  if (vscodeModalDownloadEl instanceof HTMLAnchorElement) {
    vscodeModalDownloadEl.href = VSCODE_EXTENSION_DOWNLOAD_PATH;
  }
  if (vscodeModalOpenLinkEl instanceof HTMLAnchorElement) {
    vscodeModalOpenLinkEl.href = vscodeUri;
  }
  if (vscodeModalCommandEl) {
    const commandCodeEl = vscodeModalCommandEl.querySelector('code') || vscodeModalCommandEl;
    commandCodeEl.textContent = VSCODE_DEPLOY_COMMAND;
  }
  if (vscodeModalStatusEl) {
    vscodeModalStatusEl.textContent = '';
    vscodeModalStatusEl.className = 'vscode-modal__status';
  }
  if (vscodeModalPreviewEl instanceof HTMLImageElement) {
    const previewEntry = entry || (normalizedSiteId ? { siteId: normalizedSiteId } : null);
    assignPreviewImage(vscodeModalPreviewEl, getPreviewUrl(normalizedSiteId), `${host} preview`, previewEntry);
    if (vscodeModalPreviewEl.dataset.src && vscodeModalPreviewEl.dataset.previewState === 'placeholder') {
      previewQueue.pending.push(vscodeModalPreviewEl);
      drainPreviewQueue();
    }
  }

  vscodeModalEl.classList.remove('is-hidden');
  vscodeModalPanelEl?.focus({ preventScroll: true });
  return true;
}

function closeVsCodeModal() {
  vscodeModalEl?.classList.add('is-hidden');
}

async function copyVsCodeDeployCommand() {
  if (!vscodeModalStatusEl) {
    return;
  }
  try {
    const command = vscodeModalCommandEl?.textContent?.trim() || VSCODE_DEPLOY_COMMAND;
    await navigator.clipboard.writeText(command);
    vscodeModalStatusEl.textContent = 'Deploy command copied.';
    vscodeModalStatusEl.className = 'vscode-modal__status is-success';
  } catch (error) {
    console.warn(error);
    vscodeModalStatusEl.textContent = 'Copy failed.';
    vscodeModalStatusEl.className = 'vscode-modal__status is-error';
  }
}

async function submitAccessModal() {
  const { entry, nextIsPublic, job } = getAccessModalTarget();
  const isProcessing = Boolean(job && job.status !== 'success' && job.status !== 'error');
  if (!entry || isProcessing) {
    return;
  }
  if (job?.status === 'success' || job?.status === 'error') {
    clearAccessJob(entry.siteId);
  }
  await setSitePublicAccess(entry.siteId, nextIsPublic, { source: 'modal' });
}

async function setSitePublicAccess(siteId, nextIsPublic, options = {}) {
  const entry = findEntryBySiteId(siteId);
  if (!canToggleSiteAccess(entry)) {
    return false;
  }
  if (!state.apiBaseUrl) {
    window.alert(COMPOSER_UNAVAILABLE_MESSAGE);
    return false;
  }
  if (state.accessBusy.has(siteId) || state.previewBusy.has(siteId) || isSiteMutationBusy(siteId)) {
    return false;
  }

  const operatorKey = resolveOperatorKeyForProtectedAction({
    label: nextIsPublic ? 'Making a site public' : 'Making a site private',
    type: PROTECTED_ACTION_SITE_ACCESS,
    siteId,
    isPublic: nextIsPublic,
  });
  if (!operatorKey) {
    return false;
  }

  upsertAccessJob(siteId, {
    expectedPublic: nextIsPublic,
    host: entry.host || `${siteId}.${BASE_DOMAIN}`,
    status: 'processing',
    message: `${nextIsPublic ? 'Publishing' : 'Locking'} ${siteId}… this can take 30-60 seconds.`,
  });
  state.accessBusy.add(siteId);
  renderAccessModal();
  render();

  try {
    const response = await fetch(`${state.apiBaseUrl}/api/catalog/access/site/${encodeURIComponent(siteId)}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-operator-key': operatorKey,
      },
      body: JSON.stringify({ isPublic: nextIsPublic }),
    });

    const data = await readJsonResponse(response);
    if (!response.ok) {
      const message = data.error ?? `Site access update failed (${response.status})`;
      if (isInvalidOperatorKeyFailure(response.status, message)) {
        clearAccessJob(siteId);
        reopenOperatorAccessGate({
          label: nextIsPublic ? 'Making a site public' : 'Making a site private',
          type: PROTECTED_ACTION_SITE_ACCESS,
          siteId,
          isPublic: nextIsPublic,
        });
        return false;
      }
      throw new Error(message);
    }

    return await monitorSiteAccessJob(siteId, nextIsPublic, operatorKey, {
      refreshAfter: options.refreshAfter !== false,
    });
  } catch (error) {
    console.error(error);
    finishAccessJob(siteId, {
      status: 'error',
      message: error.message,
    });
    if (options.source === 'modal') {
      renderAccessModal();
    } else {
      window.alert(error.message);
    }
    return false;
  } finally {
    syncAccessBusyFromJobs();
    render();
  }
}

async function redeployCurrentFullscreenSite() {
  const siteId = state.fullscreenEntry?.siteId || '';
  if (!siteId) {
    setFullscreenSiteStateStatus('Pick a site first.', 'warning');
    return false;
  }
  return redeploySite(siteId);
}

async function redeploySite(siteId) {
  const entry = findEntryBySiteId(siteId);
  if (!entry?.siteId) {
    setFullscreenSiteStateStatus('Pick a site first.', 'warning');
    return false;
  }
  if (!state.apiBaseUrl) {
    setFullscreenSiteStateStatus(COMPOSER_UNAVAILABLE_MESSAGE, 'warning');
    return false;
  }
  if (state.redeployBusy.has(entry.siteId) || state.previewBusy.has(entry.siteId) || isSiteMutationBusy(entry.siteId)) {
    return false;
  }

  const operatorKey = resolveOperatorKeyForProtectedAction({
    label: 'Redeploying a site',
    type: PROTECTED_ACTION_REDEPLOY,
    siteId: entry.siteId,
  });
  if (!operatorKey) {
    return false;
  }

  state.redeployBusy.add(entry.siteId);
  setFullscreenSiteStateStatus(`Queuing deploy for ${entry.siteId}...`, 'info');
  render();

  try {
    const response = await fetch(`${state.apiBaseUrl}/api/redeploy/${encodeURIComponent(entry.siteId)}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-operator-key': operatorKey,
      },
      body: JSON.stringify({
        reason: 'sites-console',
        source: location.hostname,
      }),
    });

    const data = await readJsonResponse(response);
    if (!response.ok) {
      const message = data.error ?? `Deploy dispatch failed (${response.status})`;
      if (isInvalidOperatorKeyFailure(response.status, message)) {
        reopenOperatorAccessGate({
          label: 'Redeploying a site',
          type: PROTECTED_ACTION_REDEPLOY,
          siteId: entry.siteId,
        });
        return false;
      }
      throw new Error(message);
    }

    const runUrl = data.github?.html_url || '';
    setFullscreenSiteStateStatus(
      runUrl
        ? `Deploy queued for ${entry.siteId}. ${runUrl}`
        : `Deploy queued for ${entry.siteId}.`,
      'success'
    );
    return true;
  } catch (error) {
    console.error(error);
    setFullscreenSiteStateStatus(error.message || 'Deploy dispatch failed.', 'error');
    return false;
  } finally {
    state.redeployBusy.delete(entry.siteId);
    render();
  }
}

function moveSiteIdInSet(values, previousSiteId, nextSiteId) {
  if (!values || !previousSiteId || !nextSiteId || previousSiteId === nextSiteId || !values.has(previousSiteId)) {
    return;
  }
  values.delete(previousSiteId);
  values.add(nextSiteId);
}

function applySiteRenameToState(previousSiteId, payload) {
  const nextSiteId = String(payload?.siteId || '').trim();
  if (!previousSiteId || !nextSiteId) {
    return null;
  }

  const previousEntry = findEntryBySiteId(previousSiteId);
  const previousRawEntry = findRawEntryBySiteId(previousSiteId);
  const previousHost = previousEntry?.host || `${previousSiteId}.${BASE_DOMAIN}`;
  const nextHost = String(payload?.host || `${nextSiteId}.${BASE_DOMAIN}`).trim();
  const nextUrl = String(payload?.url || `https://${nextHost}/`).trim();
  const nextPreview = payload?.preview || null;

  const patchEntry = (entry) => {
    if (!entry || typeof entry !== 'object') {
      return null;
    }

    if (entry.siteId === previousSiteId) {
      const currentDisplayName = String(entry.displayName || '').trim();
      entry.siteId = nextSiteId;
      entry.host = nextHost;
      entry.url = nextUrl;
      if (!currentDisplayName || currentDisplayName === previousSiteId || currentDisplayName === previousHost) {
        entry.displayName = nextSiteId;
      }
    }

    if (entry.family?.leadSiteId === previousSiteId) {
      entry.family = {
        ...entry.family,
        leadSiteId: nextSiteId,
      };
    }

    return entry;
  };

  patchEntry(previousEntry);
  patchEntry(previousRawEntry);
  state.entries.forEach((entry) => {
    if (entry !== previousEntry) {
      patchEntry(entry);
    }
  });
  state.rawEntries.forEach((entry) => {
    if (entry !== previousRawEntry) {
      patchEntry(entry);
    }
  });

  if (nextPreview) {
    renamePreviewManifestEntry(previousSiteId, nextSiteId, nextPreview);
    const nextPreviewUrl = getPreviewUrl(nextSiteId);
    if (nextPreviewUrl) {
      previewCache.set(nextPreviewUrl, 'done');
      previousEntry && (previousEntry.previewUrl = nextPreviewUrl);
      previousRawEntry && (previousRawEntry.previewUrl = nextPreviewUrl);
    }
  } else {
    renamePreviewManifestEntry(previousSiteId, nextSiteId);
  }

  moveSiteIdInSet(state.selected, previousSiteId, nextSiteId);
  moveSiteIdInSet(state.renameBusy, previousSiteId, nextSiteId);

  if (state.activeTableSiteId === previousSiteId) {
    state.activeTableSiteId = nextSiteId;
  }
  if (state.lastSelectedSiteId === previousSiteId) {
    state.lastSelectedSiteId = nextSiteId;
  }
  if (state.slideshowCurrentSiteId === previousSiteId) {
    state.slideshowCurrentSiteId = nextSiteId;
  }
  state.slideshowQueue = state.slideshowQueue.map((siteId) => siteId === previousSiteId ? nextSiteId : siteId);

  if (state.noteDraftRanks[previousSiteId] !== undefined) {
    state.noteDraftRanks[nextSiteId] = state.noteDraftRanks[previousSiteId];
    delete state.noteDraftRanks[previousSiteId];
  }
  if (state.noteDraftTexts[previousSiteId] !== undefined) {
    state.noteDraftTexts[nextSiteId] = state.noteDraftTexts[previousSiteId];
    delete state.noteDraftTexts[previousSiteId];
  }

  if (state.mainSiteId === previousSiteId) {
    state.mainSiteId = nextSiteId;
  }
  if (state.summary?.mainSiteId === previousSiteId) {
    state.summary.mainSiteId = nextSiteId;
    state.summary.mainSiteHost = nextHost;
    state.summary.mainSiteUrl = nextUrl;
  }
  if (state.rawSummary?.mainSiteId === previousSiteId) {
    state.rawSummary.mainSiteId = nextSiteId;
    state.rawSummary.mainSiteHost = nextHost;
    state.rawSummary.mainSiteUrl = nextUrl;
  }

  if (noteModalEl?.dataset?.siteId === previousSiteId) {
    noteModalEl.dataset.siteId = nextSiteId;
  }
  if (fullscreenPropertiesDockEl?.dataset?.siteId === previousSiteId) {
    fullscreenPropertiesDockEl.dataset.siteId = nextSiteId;
  }
  if (state.fullscreenEntry?.siteId === previousSiteId) {
    state.fullscreenEntry = previousEntry || state.fullscreenEntry;
  }

  return previousEntry || findEntryBySiteId(nextSiteId);
}

async function renameSiteById(previousSiteId, nextSiteId, options = {}) {
  const operatorKey = String(options.operatorKey || '').trim();
  const actionLabel = options.actionLabel || 'Renaming sites';
  const entry = findEntryBySiteId(previousSiteId);
  if (!entry || !canRenameEntry(entry)) {
    return { ok: false, error: getRenameUnavailableMessage(entry) };
  }
  if (!state.apiBaseUrl) {
    return { ok: false, error: COMPOSER_UNAVAILABLE_MESSAGE };
  }
  if (!operatorKey) {
    return { ok: false, error: 'Missing operator key.' };
  }
  if (state.renameBusy.has(previousSiteId)) {
    return { ok: false, error: `Rename already in progress for ${previousSiteId}.` };
  }

  state.renameBusy.add(previousSiteId);
  render();

  try {
    const response = await fetch(`${state.apiBaseUrl}/api/catalog/rename/${encodeURIComponent(previousSiteId)}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-operator-key': operatorKey,
      },
      body: JSON.stringify({
        siteId: nextSiteId,
        source: location.hostname,
      }),
    });
    const data = await readJsonResponse(response);
    if (!response.ok) {
      const message = data.error ?? `Rename failed (${response.status})`;
      if (isInvalidOperatorKeyFailure(response.status, message)) {
        reopenOperatorAccessGate(actionLabel);
        return { ok: false, invalidOperatorKey: true, error: message };
      }
      throw new Error(message);
    }

    applySiteRenameToState(previousSiteId, data);
    syncBulkRenameRowAfterRename(previousSiteId, data.siteId);
    render();
    await refreshCatalog();
    return { ok: true, data, entry: findEntryBySiteId(data.siteId) };
  } catch (error) {
    console.error(error);
    return { ok: false, error: error.message || 'Rename failed.' };
  } finally {
    state.renameBusy.delete(previousSiteId);
    state.renameBusy.delete(nextSiteId);
    render();
  }
}

async function submitFullscreenRename(options = {}) {
  const requestedSiteId = String(options?.siteId || state.fullscreenEntry?.siteId || '').trim();
  const entry = findEntryBySiteId(requestedSiteId) || state.fullscreenEntry;
  if (!entry || !canRenameEntry(entry)) {
    return false;
  }
  if (!ensureFullscreenNoteSaved('rename this site')) {
    return false;
  }
  if (!state.apiBaseUrl) {
    setFullscreenRenameStatus(COMPOSER_UNAVAILABLE_MESSAGE, 'error');
    return false;
  }

  if (fullscreenRenameInputEl && options?.nextSiteId) {
    fullscreenRenameInputEl.value = sanitizeSiteIdInput(options.nextSiteId);
  }

  const validation = syncFullscreenRenameControls(entry);
  if (!validation.valid || validation.unchanged) {
    return false;
  }

  const operatorKey = resolveOperatorKeyForProtectedAction({
    label: 'Renaming the site',
    type: PROTECTED_ACTION_RENAME_SITE,
    siteId: entry.siteId,
    nextSiteId: validation.siteId,
  });
  if (!operatorKey) {
    return false;
  }
  if (state.renameBusy.has(entry.siteId)) {
    return false;
  }

  syncFullscreenEntryActionButtons(entry);
  syncFullscreenNoteEditorControls();

  const result = await renameSiteById(entry.siteId, validation.siteId, {
    operatorKey,
    actionLabel: {
      label: 'Renaming the site',
      type: PROTECTED_ACTION_RENAME_SITE,
      siteId: entry.siteId,
      nextSiteId: validation.siteId,
    },
  });

  syncFullscreenEntryActionButtons(state.fullscreenEntry || entry);
  syncFullscreenNoteEditorControls();
  render();

  if (!result.ok) {
    if (!result.invalidOperatorKey) {
      setFullscreenRenameStatus(result.error || 'Rename failed.', 'error');
    }
    return false;
  }

  if (!fullscreenModalEl.classList.contains('is-hidden')) {
    const refreshedEntry = result.entry || findEntryBySiteId(result.data?.siteId || '');
    if (refreshedEntry) {
      state.fullscreenEntry = refreshedEntry;
      if (fullscreenPropertiesDockEl) {
        fullscreenPropertiesDockEl.dataset.siteId = refreshedEntry.siteId;
      }
      renderFullscreenEntryHeader(refreshedEntry);
      renderFullscreenQr(refreshedEntry.url);
      renderFullscreenStage(refreshedEntry);
      syncFullscreenNavigationControls();
      syncFullscreenNoteEditorControls();
    }
  }

  return true;
}

async function startBulkRenameQueue(options = {}) {
  if (!isBulkRenameModalOpen()) {
    return false;
  }

  const resuming = options.resume === true;
  const plan = getBulkRenamePlan();

  if (!resuming) {
    if (state.bulkRename.running || plan.readyCount === 0 || plan.errorCount > 0) {
      renderBulkRenameModal();
      return false;
    }
    const operatorKey = resolveOperatorKeyForProtectedAction({
      label: 'Updating sites',
      type: PROTECTED_ACTION_RENAME_MANY,
    });
    if (!operatorKey) {
      setBulkRenameStatus('Open Settings and paste the private operator key to start updates.', 'warning');
      renderBulkRenameModal();
      return false;
    }

    state.bulkRename.started = true;
    state.bulkRename.running = false;
    state.bulkRename.finished = false;
    state.bulkRename.paused = false;
    state.bulkRename.progressIndex = 0;
    state.bulkRename.activeRowId = '';
    state.bulkRename.executionOrder = [...plan.order];
    state.bulkRename.step = 'confirm';
    setBulkRenameStatus(`Queued ${plan.readyCount.toLocaleString()} updates.`, '');

    for (const row of state.bulkRename.rows) {
      row.phase = plan.byRowId.get(row.rowId)?.kind === 'ready' ? 'queued' : 'idle';
      row.resultMessage = '';
    }
  }

  let operatorKey = getKnownOperatorKey();
  if (!operatorKey) {
    operatorKey = resolveOperatorKeyForProtectedAction({
      label: 'Updating sites',
      type: PROTECTED_ACTION_RENAME_MANY,
    });
    if (!operatorKey) {
      setBulkRenameStatus('Open Settings and paste the private operator key to continue updates.', 'warning');
      renderBulkRenameModal();
      return false;
    }
  }

  state.bulkRename.running = true;
  state.bulkRename.paused = false;
  renderBulkRenameModal();

  while (state.bulkRename.progressIndex < state.bulkRename.executionOrder.length) {
    const rowId = state.bulkRename.executionOrder[state.bulkRename.progressIndex];
    const row = findBulkRenameRow(rowId);
    if (!row) {
      state.bulkRename.progressIndex += 1;
      continue;
    }

    row.phase = 'running';
    row.resultMessage = 'Applying updates now…';
    state.bulkRename.activeRowId = rowId;
    const targetSiteId = normalizeSiteId(row.nextSiteId);
    const targetDisplayName = normalizeFriendlyName(row.nextDisplayName);
    const renameNeeded = targetSiteId !== normalizeSiteId(row.currentSiteId);
    const displayNameNeeded = targetDisplayName !== normalizeFriendlyName(row.currentDisplayName);

    setBulkRenameStatus(
      renameNeeded && displayNameNeeded
        ? `Renaming ${row.currentSiteId} to ${targetSiteId} and updating the title…`
        : renameNeeded
          ? `Renaming ${row.currentSiteId} to ${targetSiteId}…`
          : `Updating the title for ${row.currentSiteId}…`,
      ''
    );
    renderBulkRenameModal();

    let finalSiteId = row.currentSiteId;

    if (renameNeeded) {
      const renameResult = await renameSiteById(row.currentSiteId, targetSiteId, {
        operatorKey,
        actionLabel: {
          label: 'Updating sites',
          type: PROTECTED_ACTION_RENAME_MANY,
        },
      });

      if (!renameResult.ok) {
        if (renameResult.invalidOperatorKey) {
          row.phase = 'queued';
          row.resultMessage = 'Waiting for the operator key to continue.';
          state.bulkRename.running = false;
          state.bulkRename.paused = true;
          state.bulkRename.activeRowId = '';
          setBulkRenameStatus('Queue paused. Paste the current operator key to resume.', 'warning');
          renderBulkRenameModal();
          return false;
        }

        row.phase = 'failed';
        row.resultMessage = renameResult.error || 'Rename failed.';
        state.bulkRename.progressIndex += 1;
        state.bulkRename.activeRowId = '';
        setBulkRenameStatus(row.resultMessage, 'warning');
        renderBulkRenameModal();
        continue;
      }

      finalSiteId = renameResult.data?.siteId || targetSiteId;
      row.resultMessage = `Renamed to ${finalSiteId}.`;
    }

    if (displayNameNeeded) {
      const displayNameResult = await updateSiteDisplayName(finalSiteId, targetDisplayName, [finalSiteId], {
        operatorKey,
        skipRestore: true,
        skipFullscreenStatus: true,
        silent: true,
        returnResult: true,
        actionLabel: {
          label: 'Updating the title',
          type: PROTECTED_ACTION_DISPLAY_NAME,
          siteId: finalSiteId,
          siteIds: [finalSiteId],
          nextLabel: targetDisplayName,
        },
      });

      if (!displayNameResult.ok) {
        if (displayNameResult.invalidOperatorKey) {
          row.phase = 'queued';
          row.resultMessage = 'Waiting for the operator key to continue.';
          state.bulkRename.running = false;
          state.bulkRename.paused = true;
          state.bulkRename.activeRowId = '';
          setBulkRenameStatus('Queue paused. Paste the current operator key to resume.', 'warning');
          renderBulkRenameModal();
          return false;
        }

        row.phase = 'failed';
        row.resultMessage = displayNameResult.error || 'Title update failed.';
        state.bulkRename.progressIndex += 1;
        state.bulkRename.activeRowId = '';
        setBulkRenameStatus(row.resultMessage, 'warning');
        renderBulkRenameModal();
        continue;
      }
    }

    row.phase = 'done';
    row.resultMessage = renameNeeded && displayNameNeeded
      ? `Updated ${finalSiteId} and the title.`
      : renameNeeded
        ? `Renamed to ${finalSiteId}.`
        : targetDisplayName
          ? `Updated the title for ${finalSiteId}.`
          : `Cleared the title for ${finalSiteId}.`;
    state.bulkRename.progressIndex += 1;
    state.bulkRename.activeRowId = '';
    renderBulkRenameModal();
  }

  state.bulkRename.running = false;
  state.bulkRename.finished = true;
  state.bulkRename.paused = false;
  state.bulkRename.activeRowId = '';

  const doneCount = state.bulkRename.rows.filter((row) => row.phase === 'done').length;
  const failedCount = state.bulkRename.rows.filter((row) => row.phase === 'failed').length;
  setBulkRenameStatus(
    failedCount > 0
      ? `Update queue finished with ${doneCount.toLocaleString()} updated and ${failedCount.toLocaleString()} failed.`
      : `Update queue finished. Updated ${doneCount.toLocaleString()} sites.`,
    failedCount > 0 ? 'warning' : 'success',
  );
  renderBulkRenameModal();
  return true;
}

function getCurrentSwipeEntry() {
  if (state.visibleEntries.length === 0) {
    return null;
  }
  return state.visibleEntries[Math.max(0, Math.min(state.swipeIndex, state.visibleEntries.length - 1))] ?? null;
}

function updateSwipeRankControl(entry) {
  if (!swipeEls.rankValue || !swipeEls.rankDown || !swipeEls.rankUp) {
    return;
  }

  if (!entry) {
    updateRankValueElement(swipeEls.rankValue, 0, false);
    swipeEls.rankDown.disabled = true;
    swipeEls.rankUp.disabled = true;
    swipeEls.rankValue.classList.remove('is-noted');
    swipeEls.rankValue.title = 'No site selected';
    swipeEls.rankValue.setAttribute('aria-label', 'No site selected');
    return;
  }

  const busy = isSiteMutationBusy(entry.siteId);
  updateRankValueElement(swipeEls.rankValue, entry.manualRank, busy);
  swipeEls.rankDown.disabled = !state.apiBaseUrl || busy || !canMutateEntry(entry);
  swipeEls.rankUp.disabled = !state.apiBaseUrl || busy || !canMutateEntry(entry);
  updateNoteTrigger(swipeEls.rankValue, entry);
  if (!canMutateEntry(entry)) {
    swipeEls.rankValue.title = 'Imported CSV rows stay read-only in the launchpad.';
    swipeEls.rankValue.setAttribute('aria-label', swipeEls.rankValue.title);
  }
}

function updateSwipeMainSiteControl(entry) {
  if (!swipeEls.mainSite) {
    return;
  }

  if (!entry) {
    swipeEls.mainSite.disabled = true;
    swipeEls.mainSite.classList.remove('is-active');
    swipeEls.mainSite.title = 'No site selected';
    return;
  }

  updateMainSiteButton(swipeEls.mainSite, entry);
}

function updateSwipePreviewControl(entry) {
  if (!swipeEls.refreshPreview) {
    return;
  }

  if (!entry) {
    swipeEls.refreshPreview.disabled = true;
    swipeEls.refreshPreview.title = 'No site selected';
    return;
  }

  swipeEls.refreshPreview.disabled = !state.apiBaseUrl || state.previewBusy.has(entry.siteId) || !entry.url || !canMutateEntry(entry);
  swipeEls.refreshPreview.title = !canMutateEntry(entry)
    ? 'Imported CSV rows stay read-only in the launchpad.'
    : !state.apiBaseUrl
    ? COMPOSER_UNAVAILABLE_MESSAGE
    : `Refresh mobile preview for ${entry.siteId}`;
  swipeEls.refreshPreview.dataset.bulkRefreshWidth = '390';
  swipeEls.refreshPreview.dataset.bulkRefreshHeight = '844';
  swipeEls.refreshPreview.dataset.bulkRefreshSettleDelayMs = '5000';
}

function updateSwipeEditControl(entry) {
  if (!swipeEls.editCurrent) {
    return;
  }

  const editable = canEditEntry(entry);
  swipeEls.editCurrent.disabled = !editable;
  swipeEls.editCurrent.title = editable
    ? `Edit ${entry.siteId}`
    : entry?.categories?.externalCatalog
      ? 'Imported CSV rows stay read-only in the launchpad.'
      : 'Core Mullmania sites stay managed outside this editor.';
}

function updateSwipeDeleteControl(entry) {
  updateDeleteButton(swipeEls.deleteCurrent, entry);
}

function countVisibleFamilies(entries) {
  const keys = new Set();
  for (const entry of entries) {
    keys.add(getDisplayGroupKey(entry) || entry.siteId);
  }
  return keys.size;
}

function renderFamilyLine(container, entry) {
  if (!container) {
    return;
  }
  container.textContent = '';
}

function renderFamilyBadge(container, entry) {
  if (container) {
    container.textContent = '';
  }
}

function focusFamily(entry) {
  const groupLabel = resolveDisplayGroupLabel(Array.isArray(entry?.familyMembers) ? entry.familyMembers : [entry]);
  if (!groupLabel) {
    return;
  }
  applySearchValue(groupLabel);
}

function buildFlagDescriptors(entry) {
  const flags = [];

  if (entry.categories.main) {
    flags.push({ label: 'Main', icon: 'ti ti-home-star', tone: 'tone-info', tooltip: 'Current main site for mullmania.com' });
  }
  if (entry.categories.framework) {
    flags.push({ label: getCatalogTagLabel('framework'), icon: 'ti ti-tool', tone: 'tone-info' });
  }
  if (entry.frameworkBucket) {
    flags.push({
      label: `Bucket: ${humanizeToken(entry.frameworkBucket)}`,
      icon: 'ti ti-bucket',
      tone: 'tone-success',
    });
  }
  if (entry.criticality) {
    flags.push({
      label: humanizeToken(entry.criticality),
      icon: 'ti ti-shield',
      tone: 'tone-warning',
    });
  }
  if (entry.testStatus) {
    flags.push(buildTestStatusFlag(entry.testStatus));
  }
  if (entry.healthStatus) {
    flags.push(buildHealthFlag(entry.healthStatus, entry.healthCode));
  }
  if (entry.categories.anchor && !entry.categories.main) {
    flags.push({ label: getCatalogTagLabel('anchors'), icon: 'ti ti-anchor', tone: 'tone-info', tooltip: 'Primary hosted site' });
  }
  if (entry.categories.data) {
    flags.push({ label: getCatalogTagLabel('data'), icon: 'ti ti-database', tone: 'tone-success', tooltip: 'Has a data namespace' });
  }
  if (entry.categories.synthetic) {
    flags.push({ label: getCatalogTagLabel('synthetic'), icon: 'ti ti-list', tone: 'tone-neutral', tooltip: 'File listing only — no HTML' });
  }
  if (entry.categories.snapshot) {
    flags.push({ label: getCatalogTagLabel('snapshots'), icon: 'ti ti-clock-bolt', tone: 'tone-info', tooltip: 'Timestamp snapshot' });
  }
  if (entry.categories.legacy) {
    flags.push({ label: getCatalogTagLabel('legacy'), icon: 'ti ti-history', tone: 'tone-danger', tooltip: 'Legacy import' });
  }

  if (entry.githubBacked) {
    flags.push({ label: getCatalogTagLabel('github'), icon: 'ti ti-brand-github', tone: 'tone-neutral', tooltip: `Deployed from ${entry.githubRepo || 'GitHub'}` });
  }

  for (const tagId of getEntryOperatorTags(entry).slice(0, 2)) {
    const label = getManagedTagLabel(tagId);
    flags.push({ label, icon: 'ti ti-tag', tone: 'tone-neutral', tooltip: `Tag: ${label}` });
  }

  return flags;
}

// Render the library-badge icon that marks a site as having a NuGet package.
// Called on every row render; guards against double-injection by removing any
// previous badge sibling before adding a new one.
function renderPackageBadge(titleEl, entry) {
  if (!titleEl || !titleEl.parentNode) return;
  const existing = titleEl.parentNode.querySelector(':scope > .site-cell__package-badge');
  if (existing) existing.remove();
  const pkgs = Array.isArray(entry?.publishedPackages) ? entry.publishedPackages : [];
  if (pkgs.length === 0) return;

  const head = pkgs[0];
  const anchor = (head?.hubUrl) || `https://packages.mullmania.com/#pkg-${String(head?.name || '').toLowerCase()}`;
  const badge = document.createElement('a');
  badge.className = 'site-cell__package-badge';
  badge.href = anchor;
  badge.target = '_blank';
  badge.rel = 'noreferrer';
  const summary = pkgs.map((p) => `${p.name} ${p.latest || ''}`.trim()).join(', ');
  badge.title = `Published to ${head?.feed || 'private NuGet feed'}: ${summary}`;
  badge.setAttribute('aria-label', badge.title);
  const icon = document.createElement('i');
  icon.className = 'ti ti-library';
  badge.appendChild(icon);
  titleEl.after(badge);
}

function buildTypeDescriptor(entry) {
  // Packages hub check runs before the generic framework check so it keeps
  // its own icon even though it's tagged `framework`.
  if (entry.categories.packagesHub) {
    return { icon: 'ti ti-package', tooltip: 'Private NuGet package hub' };
  }
  if (entry.categories.framework && entry.criticality === 'framework-core') {
    return { icon: 'ti ti-shield-check', tooltip: 'Framework core' };
  }
  if (entry.categories.anchor) {
    return { icon: 'ti ti-home-star', tooltip: 'Primary site' };
  }
  if (entry.categories.framework) {
    return { icon: 'ti ti-tool', tooltip: 'Framework' };
  }
  if (entry.categories.synthetic) {
    return { icon: 'ti ti-list', tooltip: 'File listing' };
  }
  if (entry.categories.snapshot) {
    return { icon: 'ti ti-clock-hour-4', tooltip: 'Snapshot' };
  }
  if (entry.categories.legacy) {
    return { icon: 'ti ti-history', tooltip: 'Legacy' };
  }
  if (entry.githubBacked) {
    return { icon: 'ti ti-brand-github', tooltip: 'GitHub repo' };
  }
  return { icon: 'ti ti-world-www', tooltip: 'Hosted site' };
}

function buildSummary(entry) {
  const description = normalizeSummaryText(entry.description);
  const invalidHostNote = entry.categories.invalidHost ? 'Host name too long. Direct subdomain disabled.' : '';
  if (description) {
    return [description, invalidHostNote].filter(Boolean).join(' • ');
  }

  const cleanedNotes = [entry.testNotes, ...(entry.notes ?? [])]
    .map(normalizeNote)
    .filter(Boolean);

  if (entry.categories.framework) {
    const frameworkBits = [];
    if (entry.frameworkBucket) {
      frameworkBits.push(`Bucket: ${humanizeToken(entry.frameworkBucket)}`);
    }
    if (entry.criticality) {
      frameworkBits.push(humanizeToken(entry.criticality));
    }
    if (entry.testStatus) {
      frameworkBits.push(`Tested: ${humanizeToken(entry.testStatus)}`);
    }
    if (entry.healthStatus) {
      frameworkBits.push(buildHealthLabel(entry.healthStatus, entry.healthCode));
    }
    if (cleanedNotes.length > 0) {
      return frameworkBits.length > 0
        ? `${frameworkBits.join(' • ')}. ${cleanedNotes[0]}`
        : cleanedNotes[0];
    }
    if (frameworkBits.length > 0) {
      return frameworkBits.join(' • ');
    }
  }

  if (cleanedNotes.length > 0) {
    return [cleanedNotes[0], invalidHostNote].filter(Boolean).join(' • ');
  }

  const descriptors = [];
  if (entry.categories.main) {
    descriptors.push('Main site');
  }
  if (entry.categories.anchor && !entry.categories.main) {
    descriptors.push('Anchor site');
  }
  if (entry.categories.snapshot) {
    descriptors.push('Timestamp snapshot');
  }
  if (entry.categories.data) {
    descriptors.push('Has data namespace');
  }
  if (entry.categories.legacy) {
    descriptors.push('Legacy import');
  }
  if (entry.categories.externalCatalog) {
    descriptors.push('Imported from CSV feed');
  }

  return [...descriptors, invalidHostNote].filter(Boolean).join(' • ');
}

function renderTablePublicMarker(container, entry) {
  if (!(container instanceof HTMLElement)) {
    return;
  }

  container.replaceChildren();
  container.removeAttribute('title');

  const isPublic = entry?.isPublic === true;
  const job = getAccessJob(entry?.siteId || '');
  const isProcessing = Boolean(job && job.status !== 'success' && job.status !== 'error');
  const hostLabel = entry?.host || (entry?.siteId ? `${entry.siteId}.${BASE_DOMAIN}` : 'This site');
  const title = isProcessing
    ? job.message
    : isPublic
      ? `${hostLabel} is publicly reachable without the site-key header. Click to make it private.`
      : `${hostLabel} requires the site-key header. Click to make it public.`;
  container.title = title;
  container.setAttribute('aria-label', title);

  const indicator = document.createElement('button');
  indicator.type = 'button';
  indicator.className = `site-access-indicator ${isPublic ? 'is-public' : 'is-private'}${isProcessing ? ' is-processing' : ''}`;
  indicator.innerHTML = `<i class="${isProcessing ? 'ti ti-loader-2' : isPublic ? 'ti ti-lock-open' : 'ti ti-lock'}" aria-hidden="true"></i>`;
  indicator.title = title;
  indicator.setAttribute('aria-label', title);
  indicator.disabled = !canToggleSiteAccess(entry);
  indicator.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    openSiteAccessModal(entry);
  });
  container.appendChild(indicator);
}

function renderTableTags(container, entry) {
  if (!(container instanceof HTMLElement)) {
    return;
  }

  container.replaceChildren();
  container.classList.remove('is-overflowing');
  delete container.dataset.fullTagList;
  delete container.dataset.fullTagCount;
  const tags = getEntryDisplayTags(entry);
  if (tags.length === 0) {
    container.textContent = '—';
    container.title = 'No assigned tags';
    return;
  }

  const fullTagList = tags.map((tag) => tag.label).join(', ');
  container.dataset.fullTagList = fullTagList;
  container.dataset.fullTagCount = String(tags.length);
  container.title = fullTagList;
  for (const tag of tags) {
    const chip = document.createElement('span');
    chip.className = `fullscreen-tag-chip site-cell__tag-chip ${tag.system ? 'site-cell__tag-chip--system' : 'site-cell__tag-chip--operator'}`;
    chip.title = `${tag.system ? 'Catalog' : 'Operator'} tag: ${tag.label}`;

    const label = document.createElement('span');
    label.className = 'fullscreen-tag-chip__label';
    label.textContent = tag.label;
    chip.appendChild(label);

    container.appendChild(chip);
  }
  const overflowChip = document.createElement('span');
  overflowChip.className = 'site-cell__overflow-chip';
  overflowChip.textContent = '...';
  overflowChip.hidden = true;
  overflowChip.setAttribute('aria-hidden', 'true');
  container.appendChild(overflowChip);
  requestAnimationFrame(() => syncTableTagOverflow(container));
}

function syncTableTagOverflow(container) {
  if (!(container instanceof HTMLElement) || !container.isConnected) {
    return;
  }

  const overflowChip = container.querySelector('.site-cell__overflow-chip');
  const tagChips = Array.from(container.querySelectorAll('.site-cell__tag-chip'));
  container.classList.remove('is-overflowing');
  tagChips.forEach((chip) => {
    chip.hidden = false;
  });
  if (overflowChip instanceof HTMLElement) {
    overflowChip.hidden = true;
  }
  const isOverflowing = container.scrollHeight > container.clientHeight + 1
    || container.scrollWidth > container.clientWidth + 1;
  container.classList.toggle('is-overflowing', isOverflowing);
  const fullTagList = container.dataset.fullTagList;
  if (isOverflowing && fullTagList) {
    if (overflowChip instanceof HTMLElement) {
      overflowChip.hidden = false;
      for (let index = tagChips.length - 1; index >= 0 && isTagContainerOverflowing(container); index -= 1) {
        tagChips[index].hidden = true;
      }
    }
    const visibleRows = container.classList.contains('gallery-card__tags') || isMobileSwipeViewport() ? 'first row' : 'first two rows';
    container.setAttribute('aria-label', `Assigned tags, showing ${visibleRows}. Full list: ${fullTagList}`);
  } else {
    container.setAttribute('aria-label', 'Assigned tags');
  }
}

function isTagContainerOverflowing(container) {
  return container.scrollHeight > container.clientHeight + 1
    || container.scrollWidth > container.clientWidth + 1;
}

function renderTableModified(container, entry) {
  if (!(container instanceof HTMLElement)) {
    return;
  }

  container.replaceChildren();
  const details = getEntryModifiedDetails(entry);
  if (!details.value) {
    container.textContent = '—';
    container.title = 'No known modified timestamp';
    return;
  }

  const value = document.createElement('div');
  value.className = 'site-modified__value';
  value.textContent = formatTimestamp(details.value);

  const meta = document.createElement('div');
  meta.className = 'site-modified__meta';
  meta.textContent = details.label;

  const sourceSuffix = details.siteId && details.siteId !== entry?.siteId ? ` (${details.siteId})` : '';
  container.title = `${details.label}${sourceSuffix}: ${formatTimestamp(details.value)}`;
  container.append(value, meta);
}

const SUMMARY_TEXT_REPLACEMENTS = new Map([
  ['Repository demo reel generated from repo metadata and available proof assets.', 'Repo docs page.'],
  ['Repo docs page with links to the site and demo files.', 'Repo docs page.'],
  ['No screenshot is published yet, so this page uses a placeholder image.', 'Placeholder image.'],
  ['No repo-specific proof asset was found yet, so this falls back to a deterministic placeholder.', 'Placeholder image.'],
  ['Deterministic public front door for GitHub Pages plus canonical demo asset links.', 'Repo docs page.'],
  ['Public front door and shareable artifact hub for this repo.', 'Repo docs page.'],
  ['Core Mullmania portal surface.', 'Main site.'],
  ['Main Mullmania home page.', 'Main site.'],
  ['Primary Mullmania launchpad and operator surface.', 'Site index.'],
  ['Main Mullmania site directory.', 'Site index.'],
  ['Canonical shared UI framework for Mullmania sites.', 'Shared UI host.'],
  ['Shared UI files for Mullmania sites.', 'Shared UI host.'],
  ['Human-friendly launchpad over the consolidated Mullmania catalog.', 'Site index.'],
  ['Human-friendly launchpad over the consolidated Mullmania catalog. PWA-enabled.', 'Site index. PWA enabled.'],
  ['Site index. PWA-enabled.', 'Site index. PWA enabled.'],
  ['Canonical local source for the shared UI framework served from ui.mullmania.com.', 'Shared UI host.'],
  ['Canonical local source for the shared UI framework served from ui.mullmania.com. Legacy mirror import is optional.', 'Shared UI host.'],
  ['Shared UI host. Legacy mirror import is optional.', 'Shared UI host.'],
  ['Managed root portal for mullmania.com.', 'Main site.'],
  ['No safer committed app surface was confirmed during this pass.', 'No better checked-in app found.'],
  ['Mullmania already publishes a non-docs surface for the live site; docs front door copy was still cleaned.', 'Root app exists. Docs copy cleaned.'],
  ['This project demonstrates how to automate an external Chrome browser window using Chrome DevTools Protocol to control the ChatGPT Conversation Analyzer.', 'Chrome DevTools Protocol automation for the ChatGPT Conversation Analyzer.'],
  ['No canonical repo-local deploy wrapper yet.', 'Missing deploy wrapper.'],
]);

function normalizeSummaryText(value) {
  return sanitizeSummaryText(value);
}

function normalizeNote(note) {
  if (!note) {
    return '';
  }

  if (note.includes('Synthetic index.html will be generated from a file list')) {
    return '';
  }

  if (note.includes('Interactive Mullmania starfield and launch controls')) {
    return '';
  }

  if (note.includes('Date-shaped experiment snapshot')) {
    return 'Timestamp snapshot.';
  }

  return sanitizeSummaryText(note);
}

function sanitizeSummaryText(value) {
  const trimmed = typeof value === 'string' ? value.trim() : '';
  if (!trimmed) {
    return '';
  }

  const directReplacement = SUMMARY_TEXT_REPLACEMENTS.get(trimmed);
  if (directReplacement !== undefined) {
    return directReplacement;
  }

  const sentences = trimmed.split(/(?<=[.?!])\s+/).map((entry) => entry.trim()).filter(Boolean);
  if (
    /^Validated against the canonical repo-local deploy wrapper/i.test(trimmed)
    || /^Canonical development ruleset and workflow guidance, now validated against/i.test(trimmed)
  ) {
    const remainder = sentences.slice(1).map((entry) => sanitizeSummaryText(entry)).filter(Boolean).join(' ');
    return remainder || 'Checked live.';
  }

  return trimmed;
}

function buildSelectionPacket(entries) {
  const lines = [
    'Look through this Mullmania batch and summarize the notable clusters, duplicates, and follow-up work.',
    '',
    'Sites:',
  ];

  for (const entry of entries) {
    lines.push(`- siteId: ${entry.siteId}`);
    if (entry.url) {
      lines.push(`  url: ${entry.url}`);
    }
    if (entry.categories.framework) {
      lines.push(`  framework bucket: ${entry.frameworkBucket || 'unbucketed'}`);
      lines.push(`  criticality: ${entry.criticality || 'unspecified'}`);
      lines.push(`  tested: ${entry.testStatus || 'unknown'}`);
      if (entry.healthStatus) {
        lines.push(`  health: ${buildHealthLabel(entry.healthStatus, entry.healthCode)}`);
      }
    }
    lines.push(`  badges: ${buildFlagDescriptors(entry).map((flag) => flag.label).join(', ') || 'none'}`);
    lines.push(`  summary: ${buildSummary(entry)}`);
    const operatorTags = getEntryOperatorTags(entry).map((tagId) => getManagedTagLabel(tagId));
    if (operatorTags.length > 0) {
      lines.push(`  tags: ${operatorTags.join(', ')}`);
    }
    if (hasOperatorNote(entry)) {
      lines.push(`  note: ${getOperatorNote(entry).replace(/\s+/g, ' ').trim()}`);
    }
  }

  lines.push('');
  lines.push('Output format:');
  lines.push('- clusters');
  lines.push('- rename or merge suggestions');
  lines.push('- obvious duplicates');
  lines.push('- things that should stay untouched');

  return lines.join('\n');
}

function flashButton(button, label) {
  const span = button.querySelector('span');
  if (!span) {
    return;
  }

  const original = span.textContent;
  span.textContent = label;
  window.setTimeout(() => {
    span.textContent = original;
  }, 1000);
}

function flashInline(button, label) {
  const span = button.querySelector('span');
  if (!span) {
    return;
  }

  const original = span.textContent;
  span.textContent = label;
  window.setTimeout(() => {
    span.textContent = original;
  }, 900);
}

function createFullscreenTimelineState(overrides = {}) {
  const previousRequestId = state.fullscreenTimeline?.sourceRequestId || 0;
  return {
    siteId: '',
    commits: [],
    index: -1,
    loading: false,
    restoring: false,
    sourceRequestId: previousRequestId + 1,
    snapshotCache: {},
    selectedSnapshot: null,
    headSha: '',
    historyStatus: '',
    cloudManaged: false,
    canRestore: false,
    restoreDisabledReason: '',
    statusMessage: '',
    statusTone: '',
    ...overrides,
  };
}

const FULLSCREEN_TIMELINE_SELECT_THRESHOLD = 24;

function resetFullscreenTimeline() {
  state.fullscreenTimeline = createFullscreenTimelineState();
  renderFullscreenTimeline();
}

function formatFullscreenTimelineCommit(commit = null) {
  if (!commit) {
    return 'No history';
  }
  const label = commit.message || commit.shortSha || 'Saved version';
  if (!commit.committedAt) {
    return label;
  }
  const date = new Date(commit.committedAt);
  const dateLabel = Number.isNaN(date.getTime())
    ? ''
    : date.toLocaleString([], { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
  return dateLabel ? `${label} · ${dateLabel}` : label;
}

function isFullscreenTimelineLatest() {
  const timeline = state.fullscreenTimeline;
  const commits = timeline.commits || [];
  return commits.length > 0 && timeline.index === commits.length - 1;
}

function getFullscreenTimelineSelectedCommit() {
  const timeline = state.fullscreenTimeline;
  const commits = timeline.commits || [];
  return commits[timeline.index] || null;
}

function getActiveFullscreenTimelineSnapshot(entry = state.fullscreenEntry) {
  const timeline = state.fullscreenTimeline;
  if (!entry || timeline.siteId !== entry.siteId || isFullscreenTimelineLatest()) {
    return null;
  }
  const commit = getFullscreenTimelineSelectedCommit();
  const snapshot = timeline.selectedSnapshot;
  if (!commit?.sha || !snapshot || snapshot.commitSha !== commit.sha) {
    return null;
  }
  return snapshot.documentHtml ? snapshot : null;
}

function canRestoreFullscreenTimelineSelection() {
  const timeline = state.fullscreenTimeline;
  const commits = timeline.commits || [];
  const commit = getFullscreenTimelineSelectedCommit();
  const snapshot = timeline.selectedSnapshot;
  return Boolean(
    state.apiBaseUrl
    && timeline.cloudManaged
    && timeline.canRestore
    && !timeline.loading
    && !timeline.restoring
    && commits.length > 0
    && timeline.index >= 0
    && timeline.index < commits.length - 1
    && commit?.sha
    && snapshot?.commitSha === commit.sha
    && snapshot?.hasIndex
    && Number(snapshot?.fileCount || 0) > 0
  );
}

function getFullscreenTimelineDefaultStatus() {
  const timeline = state.fullscreenTimeline;
  const commits = timeline.commits || [];
  if (timeline.loading) {
    return { message: 'Loading timeline...', tone: '' };
  }
  if (!commits.length) {
    return {
      message: timeline.historyStatus === 'missing' ? 'No cloud history yet.' : 'No saved versions yet.',
      tone: 'warning',
    };
  }
  if (timeline.restoring) {
    return { message: 'Restoring selected version...', tone: 'warning' };
  }
  if (isFullscreenTimelineLatest()) {
    return { message: 'Latest version selected.', tone: '' };
  }
  if (!timeline.canRestore && timeline.restoreDisabledReason) {
    return { message: `${timeline.restoreDisabledReason} Live site unchanged.`, tone: 'warning' };
  }
  return { message: 'Previewing saved version. Live site unchanged.', tone: 'info' };
}

function renderFullscreenTimeline() {
  const timeline = state.fullscreenTimeline;
  const commits = timeline.commits || [];
  const hasTimeline = timeline.loading || commits.length > 0;
  fullscreenTimelineDockEl?.classList.toggle('is-hidden', !hasTimeline);

  if (fullscreenTimelineSliderEl) {
    fullscreenTimelineSliderEl.disabled = timeline.loading || timeline.restoring || commits.length <= 1;
    fullscreenTimelineSliderEl.min = '0';
    fullscreenTimelineSliderEl.max = String(Math.max(0, commits.length - 1));
    fullscreenTimelineSliderEl.value = String(Math.max(0, timeline.index));
  }
  const showSnapshotSelect = commits.length >= FULLSCREEN_TIMELINE_SELECT_THRESHOLD;
  fullscreenTimelinePickerEl?.classList.toggle('is-hidden', !showSnapshotSelect);
  if (fullscreenTimelineSelectEl) {
    fullscreenTimelineSelectEl.disabled = timeline.loading || timeline.restoring || commits.length <= 1;
    if (showSnapshotSelect) {
      const timelineKey = [
        timeline.siteId,
        commits.length,
        commits[0]?.sha || '',
        commits[commits.length - 1]?.sha || '',
      ].join(':');
      if (fullscreenTimelineSelectEl.dataset.timelineKey !== timelineKey) {
        const options = document.createDocumentFragment();
        commits.forEach((commit, index) => {
          const option = document.createElement('option');
          option.value = String(index);
          option.textContent = `${index + 1}. ${formatFullscreenTimelineCommit(commit)}`;
          options.appendChild(option);
        });
        fullscreenTimelineSelectEl.replaceChildren(options);
        fullscreenTimelineSelectEl.dataset.timelineKey = timelineKey;
      }
      fullscreenTimelineSelectEl.value = String(Math.max(0, timeline.index));
    } else {
      fullscreenTimelineSelectEl.dataset.timelineKey = '';
      fullscreenTimelineSelectEl.replaceChildren();
    }
  }
  if (fullscreenTimelineLabelEl) {
    fullscreenTimelineLabelEl.textContent = timeline.loading
      ? 'Loading timeline...'
      : formatFullscreenTimelineCommit(commits[timeline.index]);
  }
  if (fullscreenTimelineCountEl) {
    fullscreenTimelineCountEl.textContent = commits.length
      ? `${timeline.index + 1} / ${commits.length}`
      : '';
  }

  const canRestore = canRestoreFullscreenTimelineSelection();
  if (fullscreenTimelineRestoreButton) {
    fullscreenTimelineRestoreButton.classList.toggle('is-hidden', !canRestore);
    fullscreenTimelineRestoreButton.disabled = !canRestore;
  }
  if (fullscreenTimelineStatusEl) {
    const fallback = getFullscreenTimelineDefaultStatus();
    const tone = timeline.statusTone || fallback.tone;
    fullscreenTimelineStatusEl.textContent = timeline.statusMessage || fallback.message;
    fullscreenTimelineStatusEl.className = tone
      ? `fullscreen-modal__timeline-status is-${tone}`
      : 'fullscreen-modal__timeline-status';
  }
}

function renderFullscreenTimelineSnapshot(snapshot) {
  clearFullscreenImageCarousel();
  clearViewerMedia({ videoEl: fullscreenVideoEl, imageEl: fullscreenImageEl, frameEl: fullscreenFrameEl, frameShellEl: fullscreenLiveShellEl });
  if (fullscreenFrameEl) {
    fullscreenFrameEl.removeAttribute('src');
    fullscreenFrameEl.srcdoc = snapshot.documentHtml || '';
    fullscreenFrameEl.classList.remove('is-hidden');
  }
  fullscreenLiveShellEl?.classList.remove('is-hidden');
}

async function loadFullscreenTimeline(siteId) {
  if (!state.apiBaseUrl || !siteId) {
    resetFullscreenTimeline();
    return;
  }
  const requestId = (state.fullscreenTimeline?.sourceRequestId || 0) + 1;
  state.fullscreenTimeline = createFullscreenTimelineState({
    siteId,
    loading: true,
    sourceRequestId: requestId,
  });
  renderFullscreenTimeline();

  try {
    const response = await fetch(`${state.apiBaseUrl}/api/history/${encodeURIComponent(siteId)}?limit=120`, {
      cache: 'no-store',
    });
    const data = await readJsonResponse(response);
    if (!response.ok) {
      throw new Error(data.error ?? `Could not load timeline (${response.status})`);
    }
    if (requestId !== state.fullscreenTimeline.sourceRequestId) {
      return;
    }
    const commits = Array.isArray(data.commits) ? [...data.commits].reverse() : [];
    state.fullscreenTimeline = createFullscreenTimelineState({
      siteId,
      commits,
      index: commits.length - 1,
      loading: false,
      sourceRequestId: requestId,
      snapshotCache: {},
      headSha: data.headSha || commits[commits.length - 1]?.sha || '',
      historyStatus: data.historyStatus || '',
      cloudManaged: data.cloudManaged === true,
      canRestore: data.canRestore === true,
      restoreDisabledReason: data.restoreDisabledReason || '',
    });
  } catch (error) {
    console.warn(error);
    if (requestId === state.fullscreenTimeline.sourceRequestId) {
      state.fullscreenTimeline = createFullscreenTimelineState({
        siteId,
        loading: false,
        sourceRequestId: requestId,
        historyStatus: 'error',
        statusMessage: error.message,
        statusTone: 'error',
      });
    }
  } finally {
    renderFullscreenTimeline();
    if (state.fullscreenEntry?.siteId === siteId) {
      renderFullscreenStage(state.fullscreenEntry);
    }
  }
}

async function applyFullscreenTimelineIndex(nextIndex) {
  const timeline = state.fullscreenTimeline;
  const commits = timeline.commits || [];
  if (!commits.length || nextIndex < 0 || nextIndex >= commits.length) {
    return;
  }
  const commit = commits[nextIndex];
  const siteId = timeline.siteId || state.fullscreenEntry?.siteId || '';
  if (!siteId || !commit?.sha) {
    return;
  }

  state.fullscreenTimeline.index = nextIndex;
  state.fullscreenTimeline.selectedSnapshot = null;
  state.fullscreenTimeline.statusMessage = '';
  state.fullscreenTimeline.statusTone = '';
  renderFullscreenTimeline();

  if (nextIndex === commits.length - 1) {
    renderFullscreenStage(state.fullscreenEntry);
    return;
  }

  const cached = state.fullscreenTimeline.snapshotCache[commit.sha];
  if (cached) {
    state.fullscreenTimeline.selectedSnapshot = cached;
    renderFullscreenTimeline();
    renderFullscreenStage(state.fullscreenEntry);
    return;
  }

  const requestId = state.fullscreenTimeline.sourceRequestId + 1;
  state.fullscreenTimeline.sourceRequestId = requestId;
  state.fullscreenTimeline.statusMessage = 'Loading saved version...';
  state.fullscreenTimeline.statusTone = '';
  renderFullscreenTimeline();

  try {
    const response = await fetch(`${state.apiBaseUrl}/api/history/${encodeURIComponent(siteId)}/snapshot?commit=${encodeURIComponent(commit.sha)}`, {
      cache: 'no-store',
    });
    const data = await readJsonResponse(response);
    if (!response.ok) {
      throw new Error(data.error ?? `Could not load saved version (${response.status})`);
    }
    if (requestId !== state.fullscreenTimeline.sourceRequestId) {
      return;
    }
    state.fullscreenTimeline.snapshotCache[commit.sha] = data;
    state.fullscreenTimeline.selectedSnapshot = data;
    state.fullscreenTimeline.headSha = data.headSha || state.fullscreenTimeline.headSha;
    state.fullscreenTimeline.cloudManaged = data.cloudManaged === true;
    state.fullscreenTimeline.canRestore = data.canRestore === true;
    state.fullscreenTimeline.restoreDisabledReason = data.restoreDisabledReason || '';
    state.fullscreenTimeline.statusMessage = '';
    state.fullscreenTimeline.statusTone = '';
    renderFullscreenStage(state.fullscreenEntry);
  } catch (error) {
    console.error(error);
    if (requestId === state.fullscreenTimeline.sourceRequestId) {
      state.fullscreenTimeline.statusMessage = error.message;
      state.fullscreenTimeline.statusTone = 'error';
    }
  } finally {
    renderFullscreenTimeline();
  }
}

async function restoreFullscreenTimelineSelection(options = {}) {
  const timeline = state.fullscreenTimeline;
  const siteId = timeline.siteId || state.fullscreenEntry?.siteId || '';
  const requestedCommitSha = String(options.commitSha || '').trim();
  if (requestedCommitSha && getFullscreenTimelineSelectedCommit()?.sha !== requestedCommitSha) {
    const requestedIndex = (timeline.commits || []).findIndex((candidate) => candidate.sha === requestedCommitSha);
    if (requestedIndex >= 0) {
      state.fullscreenTimeline.index = requestedIndex;
    }
  }
  const commit = getFullscreenTimelineSelectedCommit();
  if (!siteId || !commit?.sha || !canRestoreFullscreenTimelineSelection()) {
    state.fullscreenTimeline.statusMessage = timeline.restoreDisabledReason || 'Select an older cloud-managed version first.';
    state.fullscreenTimeline.statusTone = 'warning';
    renderFullscreenTimeline();
    return false;
  }
  if (!options.skipConfirm && !window.confirm(`Restore ${siteId} to ${formatFullscreenTimelineCommit(commit)}? This publishes that saved version and adds a new timeline point.`)) {
    return false;
  }

  const protectedAction = {
    label: 'Restoring site version',
    type: PROTECTED_ACTION_RESTORE_SITE,
    siteId,
    commitSha: commit.sha,
    expectedHeadSha: String(options.expectedHeadSha || timeline.headSha || ''),
    skipConfirm: true,
  };
  const operatorKey = resolveOperatorKeyForProtectedAction(protectedAction);
  if (!operatorKey) {
    return false;
  }

  state.fullscreenTimeline.restoring = true;
  state.fullscreenTimeline.statusMessage = 'Restoring selected version...';
  state.fullscreenTimeline.statusTone = 'warning';
  renderFullscreenTimeline();

  try {
    const response = await fetch(`${state.apiBaseUrl}/api/history/${encodeURIComponent(siteId)}/restore`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-operator-key': operatorKey,
      },
      body: JSON.stringify({
        commitSha: commit.sha,
        expectedHeadSha: protectedAction.expectedHeadSha,
        source: sitesOrigin(),
      }),
    });
    const data = await readJsonResponse(response);
    if (!response.ok) {
      const message = data.error ?? `Restore failed (${response.status})`;
      if (isInvalidOperatorKeyFailure(response.status, message)) {
        reopenOperatorAccessGate(protectedAction);
        return false;
      }
      throw new Error(message);
    }

    state.fullscreenTimeline.statusMessage = 'Restored. Latest version now points at that snapshot.';
    state.fullscreenTimeline.statusTone = 'success';
    await refreshCatalogAndRestoreFullscreen(siteId);
    return true;
  } catch (error) {
    console.error(error);
    state.fullscreenTimeline.statusMessage = error.message;
    state.fullscreenTimeline.statusTone = 'error';
    return false;
  } finally {
    state.fullscreenTimeline.restoring = false;
    renderFullscreenTimeline();
  }
}

function openFullscreenPreview(entry, options = {}) {
  const familySelectionChanged = syncFamilySelectionForSite(entry?.siteId || '');
  const nextEntry = resolveDisplayEntryForSite(entry?.siteId || '') || entry;
  if (!nextEntry) {
    return false;
  }
  if (familySelectionChanged) {
    render();
  }
  if (!fullscreenModalEl.classList.contains('is-hidden') && state.fullscreenEntry?.siteId === nextEntry.siteId) {
    state.fullscreenMode = options.mode === 'qr' ? 'qr' : 'preview';
    renderFullscreenEntryHeader(nextEntry);
    renderFullscreenSiteStateEditor(nextEntry);
    renderFullscreenTagEditor(nextEntry, { preserveStatus: true });
    renderFullscreenQr(nextEntry.url);
    renderFullscreenStage(nextEntry);
    if (state.fullscreenTimeline.siteId !== nextEntry.siteId) {
      void loadFullscreenTimeline(nextEntry.siteId);
    }
    if (options.focusNote === true) {
      focusFullscreenNoteEditor();
    }
    syncFullscreenModalChrome();
    syncSlideshowPlayback();
    syncSlideshowChromeAutoHide();
    return true;
  }
  if (!fullscreenModalEl.classList.contains('is-hidden') && !ensureFullscreenNoteSaved(`open ${buildDisplayTitle(nextEntry)}`)) {
    return false;
  }

  const media = resolveFullscreenPreviewMedia(nextEntry);
  if (!media) {
    return false;
  }

  state.fullscreenEntry = nextEntry;
  state.fullscreenMode = options.mode === 'qr' ? 'qr' : 'preview';
  state.fullscreenImageCarouselIndex = 0;
  resetFullscreenTimeline();
  renderFullscreenEntryHeader(nextEntry);
  syncFullscreenNavigationControls();
  renderFullscreenSiteStateEditor(nextEntry);
  renderFullscreenTagEditor(nextEntry);
  const hasQr = renderFullscreenQr(nextEntry.url);
  if (!hasQr && state.fullscreenMode === 'qr') {
    state.fullscreenMode = 'preview';
  }
  renderFullscreenStage(nextEntry);
  fullscreenModalEl.classList.remove('is-hidden');
  syncFullscreenModalChrome();
  const panel = fullscreenModalEl.querySelector('.fullscreen-modal__panel');
  if (panel instanceof HTMLElement) {
    panel.focus({ preventScroll: true });
  }
  if (options.focusNote === true) {
    focusFullscreenNoteEditor();
  }
  void loadFullscreenTimeline(nextEntry.siteId);
  syncSlideshowPlayback();
  syncSlideshowChromeAutoHide();
  return true;
}

function closeFullscreenPreview(_options = {}) {
  // Closing the fullscreen modal is cancel semantics: throw away staged edits.
  const panel = fullscreenModalEl?.querySelector('.fullscreen-modal__panel');
  if (document.fullscreenElement && panel instanceof HTMLElement && document.fullscreenElement === panel) {
    document.exitFullscreen?.().catch(() => {});
  }
  state.fullscreenEntry = null;
  state.fullscreenMode = 'preview';
  state.fullscreenImageCarouselIndex = 0;
  resetFullscreenTimeline();
  clearFullscreenQr();
  clearFullscreenTagEditor();
  clearFullscreenSiteState();
  fullscreenModalEl.classList.add('is-hidden');
  syncFullscreenModalChrome();
  if (fullscreenLiveViewportSyncFrame) {
    window.cancelAnimationFrame(fullscreenLiveViewportSyncFrame);
    fullscreenLiveViewportSyncFrame = 0;
  }
  clearFullscreenImageCarousel();
  clearViewerMedia({ videoEl: fullscreenVideoEl, imageEl: fullscreenImageEl, frameEl: fullscreenFrameEl, frameShellEl: fullscreenLiveShellEl });
  syncSlideshowPlayback();
  syncSlideshowChromeAutoHide();
  return true;
}

function renderFullscreenStage(entry) {
  const showQr = false;
  const timelineSnapshot = getActiveFullscreenTimelineSnapshot(entry);
  const media = resolveFullscreenStageMedia(entry);
  const previewSource = timelineSnapshot ? 'timeline' : getActiveFullscreenPreviewSource(entry);

  if (fullscreenStageEl) {
    fullscreenStageEl.dataset.previewSource = previewSource;
  }

  if (fullscreenQrStageEl) {
    fullscreenQrStageEl.classList.toggle('is-hidden', !showQr);
  }

  if (showQr) {
    clearFullscreenImageCarousel();
    clearViewerMedia({ videoEl: fullscreenVideoEl, imageEl: fullscreenImageEl, frameEl: fullscreenFrameEl, frameShellEl: fullscreenLiveShellEl });
  } else if (timelineSnapshot) {
    renderFullscreenTimelineSnapshot(timelineSnapshot);
  } else if (media?.kind === 'image') {
    clearViewerMedia({ videoEl: fullscreenVideoEl, imageEl: fullscreenImageEl, frameEl: fullscreenFrameEl, frameShellEl: fullscreenLiveShellEl });
    renderFullscreenImageCarousel(entry, media);
  } else {
    clearFullscreenImageCarousel();
    renderViewerMedia(
      { videoEl: fullscreenVideoEl, imageEl: fullscreenImageEl, frameEl: fullscreenFrameEl, frameShellEl: fullscreenLiveShellEl },
      { ...entry, __fullscreenMedia: media }
    );
  }

  syncFullscreenFooterStatus();
  syncFullscreenQrButton();
  syncFullscreenLiveToggleButton(entry);
  scheduleFullscreenLiveViewportLayout();
}

function renderFullscreenQr(url) {
  clearFullscreenQr();
  return false;
}

function clearFullscreenQr() {
  if (fullscreenQrStageEl) {
    fullscreenQrStageEl.classList.add('is-hidden');
  }
  if (fullscreenQrStageUrlEl) {
    fullscreenQrStageUrlEl.textContent = '';
  }
  const stageContext = fullscreenQrStageCanvasEl?.getContext('2d');
  if (stageContext) {
    stageContext.clearRect(0, 0, fullscreenQrStageCanvasEl.width, fullscreenQrStageCanvasEl.height);
  }
}

function openFullscreenEditor() {
  if (!state.fullscreenEntry) {
    return;
  }
  if (!ensureFullscreenNoteSaved('open the site editor')) {
    return;
  }

  const siteId = state.fullscreenEntry.siteId;
  closeFullscreenPreview({ force: true });
  openComposerForEdit(siteId);
}

function openFullscreenDeleteFlow() {
  const entry = state.fullscreenEntry;
  if (!entry) {
    return;
  }
  if (!ensureFullscreenNoteSaved('delete this site')) {
    return;
  }
  requestDeleteEntry(entry);
}

async function ensurePreviewAfterMiss(img) {
  const siteId = img.dataset.previewSourceSiteId || img.dataset.previewSiteId;
  if (!siteId || state.previewAutoEnsureTried.has(siteId)) {
    return '';
  }

  const entry = findEntryBySiteId(siteId);
  if (!entry?.url) {
    return '';
  }

  state.previewAutoEnsureTried.add(siteId);
  const preview = await refreshPreviewForEntry(entry, false);
  return preview?.url || '';
}

function assignPreviewImage(img, url, alt, entry = null, options = {}) {
  img.alt = alt || '';
  img.dataset.src = url || '';
  img.dataset.previewSiteId = entry?.siteId || '';
  img.dataset.previewSourceSiteId = entry?.sourceSiteId || entry?.siteId || '';
  delete img.dataset.previewResizeWidth;
  delete img.dataset.previewResizeHeight;
  delete img.dataset.previewResizeMax;
  delete img.dataset.previewResizeFormat;
  delete img.dataset.previewResizeQuality;

  const resizeOptions = options?.resize && typeof options.resize === 'object'
    ? options.resize
    : null;
  if (resizeOptions) {
    const resizeWidth = Math.round(Number(resizeOptions.width ?? resizeOptions.w ?? 0));
    const resizeHeight = Math.round(Number(resizeOptions.height ?? resizeOptions.h ?? 0));
    const resizeMax = Math.round(Number(resizeOptions.longestEdge ?? resizeOptions.max ?? 0));
    const resizeFormat = String(resizeOptions.format || 'webp').trim().toLowerCase();
    const resizeQuality = Math.round(Number(resizeOptions.quality ?? resizeOptions.q ?? 72));
    if (resizeWidth > 0) {
      img.dataset.previewResizeWidth = String(resizeWidth);
    }
    if (resizeHeight > 0) {
      img.dataset.previewResizeHeight = String(resizeHeight);
    }
    if (resizeMax > 0) {
      img.dataset.previewResizeMax = String(resizeMax);
    }
    if (resizeFormat) {
      img.dataset.previewResizeFormat = resizeFormat;
    }
    if (resizeQuality > 0) {
      img.dataset.previewResizeQuality = String(Math.min(Math.max(resizeQuality, 1), 100));
    }
    if (options.propagateLoadedPreview !== true) {
      img.dataset.previewSiteId = '';
    }
  }

  if (!url) {
    applyPreviewFallback(img);
    return;
  }

  const cacheKey = resizeOptions ? getPreviewQueueCacheKey(img, url) : url;
  if (cacheKey) {
    img.dataset.previewCacheKey = cacheKey;
  } else {
    delete img.dataset.previewCacheKey;
  }
  const cachedState = previewCache.get(cacheKey);
  if (cachedState === 'done') {
    applyLoadedPreview(img, previewResolvedUrlCache.get(cacheKey) || url);
    return;
  }
  if (cachedState === 'error') {
    applyPreviewFallback(img);
    return;
  }

  applyPreviewPlaceholder(img);
}

function assignPreviewThumbnailImage(img, url, alt, entry = null, options = {}) {
  const resizeOptions = {
    width: options.width || (isMobileSwipeViewport() ? 640 : 720),
    format: options.format || 'webp',
    quality: options.quality || 72,
  };
  assignPreviewImage(img, url, alt, entry, {
    resize: resizeOptions,
    propagateLoadedPreview: false,
  });
}

function applyPreviewPlaceholder(img) {
  img.src = PREVIEW_PLACEHOLDER_URL;
  img.dataset.previewState = 'placeholder';
  img.classList.add('is-placeholder');
  img.classList.remove('is-loaded', 'is-failed');
}

function applyLoadedPreview(img, url) {
  img.src = url;
  img.dataset.src = url;
  img.dataset.previewState = 'loaded';
  img.classList.add('is-loaded');
  img.classList.remove('is-placeholder', 'is-failed');
}

function applyPreviewFallback(img) {
  img.src = PREVIEW_PLACEHOLDER_URL;
  img.dataset.previewState = 'error';
  img.classList.add('is-placeholder', 'is-failed');
  img.classList.remove('is-loaded');
}

function syncComposerEntryPoints() {
  /* + button always visible — composer shows API status inline */
}

function findEntryBySiteId(siteId) {
  if (!siteId) {
    return null;
  }
  return state.entries.find((entry) => entry.siteId === siteId) ?? null;
}

function syncFamilySelectionForSite(siteId) {
  const entry = findEntryBySiteId(siteId);
  const groupKey = getDisplayGroupKey(entry);
  if (!entry || !groupKey) {
    return false;
  }
  const changed = state.familySelections[groupKey] !== entry.siteId;
  state.familySelections[groupKey] = entry.siteId;
  return changed;
}

function resolveDisplayEntryForSite(siteId) {
  const entry = findEntryBySiteId(siteId);
  if (!entry) {
    return null;
  }

  const groupKey = getDisplayGroupKey(entry);
  const members = sortFamilyMembers(state.entries.filter((candidate) => getDisplayGroupKey(candidate) === groupKey));
  if (members.length === 0) {
    return entry;
  }
  const activeIndex = Math.max(0, members.findIndex((member) => member.siteId === entry.siteId));
  const activeEntry = members[activeIndex] || entry;
  const groupLabel = resolveDisplayGroupLabel(members, activeEntry.siteId);
  activeEntry.displayEntryKey = groupKey;
  activeEntry.displayTitle = groupLabel || activeEntry.displayName || activeEntry.siteId;
  activeEntry.familyMembers = members;
  activeEntry.family = members.length > 1
    ? {
        id: groupKey,
        label: groupLabel,
        kind: 'friendly-name',
        count: members.length,
        memberOrder: activeIndex + 1,
        leadSiteId: members[0]?.siteId || activeEntry.siteId,
      }
    : null;
  return activeEntry;
}

function findRawEntryBySiteId(siteId) {
  if (!siteId) {
    return null;
  }
  return state.rawEntries.find((entry) => entry.siteId === siteId) ?? null;
}

function canMutateEntry(entry) {
  return Boolean(entry?.siteId) && entry?.categories?.externalCatalog !== true;
}

function canToggleSiteAccess(entry) {
  return canMutateEntry(entry) && !ALWAYS_PUBLIC_SITE_IDS.has(entry?.siteId) && entry?.hasHostedSite === true;
}

function canEditSiteId(siteId) {
  return Boolean(siteId) && !RESERVED_COMPOSER_SITE_IDS.has(siteId);
}

function canEditEntry(entry) {
  return canMutateEntry(entry) && canEditSiteId(entry?.siteId);
}

function canRenameEntry(entry) {
  return canEditEntry(entry) && entry?.githubBacked !== true;
}

function isRepoBackedEntry(entry) {
  return Array.isArray(entry?.tags) && entry.tags.includes('repo-artifacts');
}

function canDeleteDirectly(entry) {
  return canEditEntry(entry) && !isRepoBackedEntry(entry);
}

function getDeleteUnavailableMessage(entry) {
  if (!entry?.siteId) {
    return 'No site selected.';
  }
  if (entry?.categories?.externalCatalog) {
    return 'Imported CSV rows stay read-only in the launchpad.';
  }
  if (!canEditSiteId(entry.siteId)) {
    return 'Core Mullmania sites stay managed outside this editor.';
  }
  if (isRepoBackedEntry(entry)) {
    return 'Repo-backed sites stay on the tombstone workflow.';
  }
  return 'This site cannot be deleted from the launchpad.';
}

function getRenameUnavailableMessage(entry) {
  if (!entry?.siteId) {
    return 'No site selected.';
  }
  if (entry?.githubBacked) {
    return 'GitHub-backed sites should be renamed from the repo side first.';
  }
  if (entry?.categories?.externalCatalog) {
    return 'Imported CSV rows stay read-only in the launchpad.';
  }
  if (!canEditSiteId(entry.siteId)) {
    return 'Core Mullmania sites stay managed outside this editor.';
  }
  return 'This site cannot be renamed from the launchpad.';
}

function updateDeleteButton(button, entry) {
  if (!button) {
    return;
  }

  const busy = Boolean(entry?.siteId) && state.deleteBusy.has(entry.siteId);
  const canDelete = Boolean(entry) && canDeleteDirectly(entry) && Boolean(state.apiBaseUrl) && !busy;
  button.disabled = !canDelete;
  button.classList.toggle('is-disabled', !canDelete);
  button.title = busy
    ? `Deleting ${entry.siteId}…`
    : !entry
      ? 'No site selected.'
      : !state.apiBaseUrl
        ? COMPOSER_UNAVAILABLE_MESSAGE
        : canDeleteDirectly(entry)
          ? `Delete ${entry.siteId}`
          : getDeleteUnavailableMessage(entry);
  button.setAttribute('aria-label', button.title);
}

function buildDeleteConfirmationMessage(entry) {
  const target = entry?.host ? `https://${entry.host}/` : entry?.siteId || 'this site';
  return `Delete ${target}? This fast path removes the launchpad-only site and its catalog entry.`;
}

function closeDeletedSiteUi(siteId) {
  if (state.fullscreenEntry?.siteId === siteId) {
    closeFullscreenPreview();
  }
  if (!noteModalEl?.classList.contains('is-hidden') && noteModalEl?.dataset?.siteId === siteId) {
    closeNoteEditor({ force: true });
  }
  if (
    !composerModalEl?.classList.contains('is-hidden')
    && normalizeSiteId(composerSiteIdEl?.value || '') === siteId
  ) {
    closeComposer();
  }
}

async function requestDeleteEntry(entry) {
  if (!canDeleteDirectly(entry)) {
    return false;
  }

  if (!window.confirm(buildDeleteConfirmationMessage(entry))) {
    return false;
  }

  return deleteSite(entry.siteId, { skipConfirm: true });
}

async function deleteSite(siteId, options = {}) {
  const entry = findEntryBySiteId(siteId);
  if (!canDeleteDirectly(entry)) {
    if (!options.quiet && !composerModalEl?.classList.contains('is-hidden')) {
      updateComposerStatus(getDeleteUnavailableMessage(entry), 'warning');
    }
    return false;
  }
  if (!state.apiBaseUrl) {
    if (!options.quiet && !composerModalEl?.classList.contains('is-hidden')) {
      updateComposerStatus(COMPOSER_UNAVAILABLE_MESSAGE, 'error');
    }
    return false;
  }
  if (state.deleteBusy.has(siteId)) {
    return false;
  }
  if (!options.skipConfirm && !window.confirm(buildDeleteConfirmationMessage(entry))) {
    return false;
  }

  const operatorKey = resolveOperatorKeyForProtectedAction({
    label: 'Deleting sites',
    type: PROTECTED_ACTION_DELETE_SITE,
    siteId,
    skipConfirm: true,
  });
  if (!operatorKey) {
    return false;
  }

  state.deleteBusy.add(siteId);
  updateDeleteButton(fullscreenDeleteButton, entry);
  render();

  try {
    const response = await fetch(`${state.apiBaseUrl}/api/deploy/${encodeURIComponent(siteId)}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'x-operator-key': operatorKey,
      },
    });
    const data = await readJsonResponse(response);
    if (!response.ok) {
      throw new Error(data.error ?? `Delete failed (${response.status})`);
    }

    closeDeletedSiteUi(siteId);
    await refreshCatalog();
    return true;
  } catch (error) {
    console.error(error);
    if (!options.quiet && !composerModalEl?.classList.contains('is-hidden')) {
      updateComposerStatus(error.message, 'error');
    }
    return false;
  } finally {
    state.deleteBusy.delete(siteId);
    render();
  }
}

function cancelComposerSourceLoad() {
  state.composer.loadRequestId += 1;
  state.composer.loadingSource = false;
  syncComposerStarterControls();
}

function clearComposerEditorFields() {
  setComposerEditorSource({ html: '', css: '', js: '' });
  state.composer.draftPreset = COMPOSER_DRAFT_PRESET_CUSTOM;
  state.composer.starterSiteId = '';
}

function normalizeComposerRecipeId(value) {
  const normalized = String(value || '').trim().toLowerCase();
  return COMPOSER_RECIPE_IDS.has(normalized)
    ? normalized
    : COMPOSER_DEFAULT_RECIPE_ID;
}

function normalizeComposerStarterId(value) {
  const normalized = String(value || '').trim().toLowerCase();
  return COMPOSER_STARTER_OPTIONS.some((option) => option.id === normalized)
    ? normalized
    : COMPOSER_DEFAULT_STARTER_ID;
}

function normalizeComposerThemeId(value) {
  const normalized = String(value || '').trim().toLowerCase();
  return COMPOSER_THEME_IDS.has(normalized)
    ? normalized
    : COMPOSER_DEFAULT_THEME_ID;
}

function normalizeComposerSurfaceId(value) {
  const normalized = String(value || '').trim().toLowerCase();
  return COMPOSER_SURFACE_IDS.has(normalized)
    ? normalized
    : COMPOSER_DEFAULT_SURFACE_ID;
}

function normalizeComposerAddonIds(value = state.composer.addonIds) {
  const rawValues = Array.isArray(value)
    ? value
    : typeof value === 'string'
      ? value.split(',')
      : [];
  const seen = new Set();
  const normalized = [];
  for (const rawValue of rawValues) {
    const id = String(rawValue || '').trim().toLowerCase();
    if (COMPOSER_ADDON_IDS.has(id) && !seen.has(id)) {
      seen.add(id);
      normalized.push(id);
    }
  }
  return normalized;
}

function normalizeComposerDataSourceId(value) {
  const normalized = String(value || '').trim().toLowerCase();
  return COMPOSER_DATA_SOURCE_IDS.has(normalized)
    ? normalized
    : COMPOSER_DEFAULT_DATA_SOURCE_ID;
}

function normalizeComposerTvMediaBundleId(value) {
  const normalized = String(value || '').trim().toLowerCase();
  return COMPOSER_TV_MEDIA_BUNDLE_IDS.has(normalized)
    ? normalized
    : COMPOSER_TV_DEFAULT_MEDIA_BUNDLE_ID;
}

function normalizeComposerTvConfig(value = state.composer.tvConfig) {
  const raw = value && typeof value === 'object' ? value : {};
  const launcherLabels = Array.isArray(raw.launcherLabels) ? raw.launcherLabels : [];
  return {
    appTitle: String(raw.appTitle || COMPOSER_TV_DEFAULT_CONFIG.appTitle).trim().slice(0, 80) || COMPOSER_TV_DEFAULT_CONFIG.appTitle,
    launcherLabels: COMPOSER_TV_DEFAULT_CONFIG.launcherLabels.map((fallback, index) => {
      const candidate = String(launcherLabels[index] || fallback).trim().slice(0, 48);
      return candidate || fallback;
    }),
    nowPlayingLabel: String(raw.nowPlayingLabel || COMPOSER_TV_DEFAULT_CONFIG.nowPlayingLabel).trim().slice(0, 48) || COMPOSER_TV_DEFAULT_CONFIG.nowPlayingLabel,
    adBadgeText: String(raw.adBadgeText || COMPOSER_TV_DEFAULT_CONFIG.adBadgeText).trim().slice(0, 120) || COMPOSER_TV_DEFAULT_CONFIG.adBadgeText,
    adBadgeEnabled: raw.adBadgeEnabled !== false,
    mediaBundleId: normalizeComposerTvMediaBundleId(raw.mediaBundleId),
    tvTailEnabled: raw.tvTailEnabled !== false,
  };
}

function getComposerRecipeOption(recipeId = state.composer.recipeId) {
  const normalized = normalizeComposerRecipeId(recipeId);
  return COMPOSER_RECIPE_OPTIONS.find((option) => option.id === normalized) || COMPOSER_RECIPE_OPTIONS[0];
}

function getComposerStarterOption(starterId = state.composer.starterId) {
  const normalized = normalizeComposerStarterId(starterId);
  return COMPOSER_STARTER_OPTIONS.find((option) => option.id === normalized) || COMPOSER_STARTER_OPTIONS[0];
}

function getComposerThemeOption(themeId = state.composer.themeId) {
  const normalized = normalizeComposerThemeId(themeId);
  return COMPOSER_THEME_OPTIONS.find((option) => option.id === normalized) || COMPOSER_THEME_OPTIONS[0];
}

function getComposerSurfaceOption(surfaceId = state.composer.surfaceId) {
  const normalized = normalizeComposerSurfaceId(surfaceId);
  return COMPOSER_SURFACE_OPTIONS.find((option) => option.id === normalized) || COMPOSER_SURFACE_OPTIONS[0];
}

function getComposerAddonOptions(addonIds = state.composer.addonIds) {
  const selectedIds = new Set(normalizeComposerAddonIds(addonIds));
  return COMPOSER_ADDON_OPTIONS.filter((option) => selectedIds.has(option.id));
}

function getComposerDataSourceOption(dataSourceId = state.composer.dataSourceId) {
  const normalized = normalizeComposerDataSourceId(dataSourceId);
  return COMPOSER_DATA_SOURCE_OPTIONS.find((option) => option.id === normalized) || COMPOSER_DATA_SOURCE_OPTIONS[0];
}

function composerHasAddon(addonId, addonIds = state.composer.addonIds) {
  return normalizeComposerAddonIds(addonIds).includes(addonId);
}

function getComposerTvMediaBundle(mediaBundleId = state.composer.tvConfig.mediaBundleId) {
  const normalized = normalizeComposerTvMediaBundleId(mediaBundleId);
  return COMPOSER_TV_MEDIA_BUNDLES.find((bundle) => bundle.id === normalized) || COMPOSER_TV_MEDIA_BUNDLES[0];
}

function getComposerCopySourceEntry(siteId = state.composer.copySourceSiteId) {
  const normalizedSiteId = normalizeSiteId(siteId);
  if (!normalizedSiteId) {
    return null;
  }
  return state.entries.find((entry) => entry.siteId === normalizedSiteId) || null;
}

function composerBuilderIsBusy() {
  return state.composer.busy || state.composer.aiBusy || state.composer.intentBusy || state.composer.valetBusy || state.composer.loadingSource;
}

function hasComposerSource() {
  return Boolean((composerHtmlEl?.value || '').trim() || (composerCssEl?.value || '').trim() || (composerJsEl?.value || '').trim());
}

function canUseComposerAiAssist() {
  return Boolean(state.apiBaseUrl && state.config?.editorAssistEnabled);
}

function canUseComposerIntentPlan() {
  return Boolean(state.apiBaseUrl && state.config?.editorAssistEnabled);
}

function canUseComposerValetAssist(validation = validateComposerSiteId()) {
  return Boolean(state.composer.mode === 'editor' && validation?.exists && state.composer.loadedSiteId === validation.siteId);
}

function composerStarterUsesSharedUi(starterId = state.composer.starterId) {
  return COMPOSER_SHARED_UI_STARTER_IDS.has(normalizeComposerStarterId(starterId));
}

function buildComposerGeneratedPlan(siteId = sanitizeSiteIdInput(composerSiteIdEl?.value || '')) {
  const starter = getComposerStarterOption();
  const surface = getComposerSurfaceOption();
  const addons = getComposerAddonOptions();
  const dataSource = getComposerDataSourceOption();
  const usesSharedUi = composerStarterUsesSharedUi(starter.id);
  const normalizedSiteId = sanitizeSiteIdInput(siteId) || 'my-site';
  const hostLabel = `${normalizedSiteId}.${BASE_DOMAIN}`;
  const files = new Set(['index.html']);
  if (usesSharedUi) {
    files.add('inline sitemap data');
  }
  const addonLabels = addons.map((addon) => addon.label);
  if (composerTvTailEnabled(addons.map((addon) => addon.id)) && !addonLabels.includes('tv-tail logging')) {
    addonLabels.push('tv-tail logging');
  }
  const dataLabel = dataSource.id === COMPOSER_DEFAULT_DATA_SOURCE_ID
    ? 'No sample data'
    : dataSource.label;
  const summary = `${starter.label}: ${surface.label}`;
  const detailLines = [
    `Creates: https://${hostLabel}/`,
    `Writes: ${Array.from(files).join(', ')}`,
    `Saves: editable source in Sites`,
    `Uses: ${usesSharedUi ? `ui.${BASE_DOMAIN}/ui.js` : starter.label}`,
    `Page type: ${surface.label}`,
    `Adds to page: ${addonLabels.length ? addonLabels.join(', ') : 'none'}`,
    `Data: ${dataLabel}`,
  ];
  return {
    hostLabel,
    starter,
    surface,
    addons,
    dataSource,
    usesSharedUi,
    summary,
    detailLines,
    files: Array.from(files),
  };
}

function renderComposerPlanList(plan) {
  if (!composerPlanListEl) {
    return;
  }
  composerPlanListEl.replaceChildren();
  for (const line of plan.detailLines) {
    const item = document.createElement('span');
    item.className = 'composer-plan-card__line';
    item.textContent = line;
    composerPlanListEl.appendChild(item);
  }
}

function buildComposerStarterSummary(starterId = state.composer.starterId, recipeId = state.composer.recipeId) {
  const normalizedRecipeId = normalizeComposerRecipeId(recipeId);
  if (normalizedRecipeId === 'tv-app') {
    return 'Create a TV launcher page and copy the selected media files.';
  }
  if (normalizedRecipeId === 'copy-site') {
    return 'Copy an existing hosted site into a new subdomain.';
  }

  const plan = buildComposerGeneratedPlan();
  switch (normalizeComposerStarterId(starterId)) {
    case COMPOSER_SLACK_BOT_STARTER_ID:
      return `${plan.surface.label}: a bot page with example Slack manifest and server code.`;
    case 'basic-example':
      return `${plan.surface.label}: one small HTML/CSS/JS page.`;
    case 'game':
      return `${plan.surface.label}: canvas playfield with a render loop, score/state UI, and a keyboard/touch input stub.`;
    case COMPOSER_UI_SITE_STARTER_ID:
    default:
      return `${plan.surface.label}: shared UI page shell with the selected theme.`;
  }
}

function buildComposerBuilderLockCopy(reason = state.composer.builderLockReason) {
  switch (reason) {
    case 'loaded-site':
      return 'The editor is showing a live site. Rebuild Draft will replace it with the current starter choices.';
    case 'ai-rewrite':
      return 'The draft was rewritten. Rebuild Draft will replace that rewrite with the current starter choices.';
    case 'manual-edit':
    default:
      return 'The editor has custom changes. Rebuild Draft will replace those edits with the current starter choices.';
  }
}

function buildComposerCopySearchText(entry) {
  return [
    entry.siteId,
    entry.host,
    buildDisplayTitle(entry),
    entry.description,
    ...(Array.isArray(entry.notes) ? entry.notes : []),
  ].join(' ').toLowerCase();
}

function getComposerCopyFamilyMembers(entry) {
  const members = Array.isArray(entry?.familyMembers) && entry.familyMembers.length > 0
    ? entry.familyMembers
    : [entry];
  return sortFamilyMembers(members)
    .filter((member) => member?.siteId && member.siteId !== ROOT_SITE_ID && member.hasHostedSite);
}

function getPreferredComposerCopyMember(entry) {
  const members = getComposerCopyFamilyMembers(entry);
  return members.find((member) => member.siteId === entry?.siteId)
    || members.find((member) => member.mainSite)
    || members.find((member) => member.categories?.anchor)
    || members[0]
    || null;
}

function getComposerCopyCandidates(query = state.composer.copyQuery) {
  const normalizedQuery = String(query || '').trim().toLowerCase();
  const hostedEntries = state.entries
    .filter((entry) => entry?.siteId && entry.siteId !== ROOT_SITE_ID && entry.hasHostedSite);
  return buildDisplayEntries(hostedEntries)
    .filter((entry) => getComposerCopyFamilyMembers(entry).length > 0)
    .filter((entry) => {
      if (!normalizedQuery) {
        return true;
      }
      return getComposerCopyFamilyMembers(entry).some((member) => buildComposerCopySearchText(member).includes(normalizedQuery));
    })
    .slice(0, COMPOSER_COPY_RESULT_LIMIT);
}

function renderComposerCopyResults() {
  if (!composerCopyResultsEl) {
    return;
  }

  const candidates = getComposerCopyCandidates();
  const selectedSiteId = normalizeSiteId(state.composer.copySourceSiteId);
  composerCopyResultsEl.innerHTML = '';

  if (candidates.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'composer-copy__result';
    empty.innerHTML = '<strong>No matches</strong><span>Try a title, host, or a shorter description fragment.</span>';
    composerCopyResultsEl.appendChild(empty);
    return;
  }

  for (const entry of candidates) {
    const button = document.createElement('button');
    const members = getComposerCopyFamilyMembers(entry);
    const preferredEntry = getPreferredComposerCopyMember(entry) || entry;
    const isActive = members.some((member) => member.siteId === selectedSiteId);
    const displayTitle = buildDisplayTitle(entry) || entry.siteId;
    const host = preferredEntry.host || `${preferredEntry.siteId}.${BASE_DOMAIN}`;
    const description = entry.description || (entry.notes || [])[0] || 'Hosted Mullmania site.';
    const previewUrl = getPreviewUrl(preferredEntry.siteId) || PREVIEW_PLACEHOLDER_URL;
    const memberCountLabel = members.length > 1 ? `${members.length} sources` : '1 source';
    button.type = 'button';
    button.className = `composer-copy__result${isActive ? ' is-active' : ''}`;
    button.disabled = state.composer.builderLocked || composerBuilderIsBusy();
    button.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    button.innerHTML = [
      '<span class="composer-copy__result-preview" aria-hidden="true">',
      `  <img class="site-preview-img composer-copy__result-img is-placeholder" src="${escapeHtml(previewUrl)}" data-preview-site-id="${escapeHtml(entry.siteId)}" alt="">`,
      '</span>',
      '<span class="composer-copy__result-copy">',
      `  <strong>${escapeHtml(displayTitle)}</strong>`,
      `  <span class="composer-copy__result-host">${escapeHtml(host)}</span>`,
      `  <span class="composer-copy__result-description">${escapeHtml(memberCountLabel)} · ${escapeHtml(description.slice(0, 140))}</span>`,
      '</span>',
    ].join('');
    button.addEventListener('click', () => {
      setComposerCopySource(preferredEntry.siteId);
    });
    composerCopyResultsEl.appendChild(button);
    const previewImg = button.querySelector('.composer-copy__result-img');
    assignPreviewImage(previewImg, previewUrl, `${displayTitle} preview`, preferredEntry);
    if (previewImg?.dataset.src && previewImg.dataset.previewState === 'placeholder' && !previewQueue.pending.includes(previewImg)) {
      previewQueue.pending.push(previewImg);
    }
  }
  drainPreviewQueue();
}

function renderComposerCopyVariants(selectedCopyEntry) {
  if (!composerCopyVariantsEl) {
    return;
  }

  const displayEntry = selectedCopyEntry ? resolveDisplayEntryForSite(selectedCopyEntry.siteId) : null;
  const members = getComposerCopyFamilyMembers(displayEntry || selectedCopyEntry);
  composerCopyVariantsEl.innerHTML = '';
  composerCopyVariantsEl.classList.toggle('is-hidden', members.length <= 1);

  if (members.length <= 1) {
    return;
  }

  const heading = document.createElement('div');
  heading.className = 'composer-copy__variants-label';
  heading.textContent = 'Choose source';
  composerCopyVariantsEl.appendChild(heading);

  const selectedSiteId = normalizeSiteId(state.composer.copySourceSiteId);
  for (const member of members) {
    const button = document.createElement('button');
    const isActive = member.siteId === selectedSiteId;
    const title = buildDisplayTitle(member) || member.siteId;
    button.type = 'button';
    button.className = `composer-copy__variant${isActive ? ' is-active' : ''}`;
    button.disabled = state.composer.builderLocked || composerBuilderIsBusy();
    button.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    button.innerHTML = [
      `<strong>${escapeHtml(member.siteId)}</strong>`,
      `<span>${escapeHtml(title)}</span>`,
    ].join('');
    button.addEventListener('click', () => {
      setComposerCopySource(member.siteId);
    });
    composerCopyVariantsEl.appendChild(button);
  }
}

function syncComposerInteractiveState() {
  const disabled = composerBuilderIsBusy();
  const aiEnabled = canUseComposerAiAssist();
  const intentEnabled = canUseComposerIntentPlan();
  const validation = validateComposerSiteId();
  const valetEnabled = canUseComposerValetAssist(validation);
  const aiPrompt = String(composerAiPromptEl?.value || '').trim();
  const intentPrompt = String(composerIntentPromptEl?.value || '').trim();

  if (composerSubmitButton) {
    composerSubmitButton.disabled = disabled;
  }

  composerEditorPaneButtons.forEach((button) => {
    button.disabled = disabled;
  });
  composerEditorFileButtons.forEach((button) => {
    button.disabled = disabled;
  });

  [composerHtmlEl, composerCssEl, composerJsEl].forEach((input) => {
    if (input) {
      input.disabled = disabled;
    }
  });

  if (composerIntentPromptEl) {
    composerIntentPromptEl.disabled = !intentEnabled || disabled;
  }
  if (composerIntentPlanButton) {
    composerIntentPlanButton.disabled = !intentEnabled || disabled || !intentPrompt;
    composerIntentPlanButton.title = intentEnabled
      ? 'Turn this intent into an editable draft.'
      : 'Intent planning is not configured on this API.';
  }

  if (composerAiPromptEl) {
    composerAiPromptEl.disabled = (!aiEnabled && !valetEnabled) || disabled;
    composerAiPromptEl.classList.toggle('is-hidden', !aiEnabled && !valetEnabled);
  }
  if (composerAiAssistButton) {
    composerAiAssistButton.disabled = !aiEnabled || disabled || !aiPrompt || !hasComposerSource();
    composerAiAssistButton.classList.toggle('is-hidden', !aiEnabled);
  }
  if (composerValetAssistButton) {
    composerValetAssistButton.disabled = !valetEnabled || disabled || !aiPrompt || !hasComposerSource();
    composerValetAssistButton.classList.toggle('is-hidden', !valetEnabled);
    composerValetAssistButton.title = valetEnabled
      ? 'Queue this request through the local Valet agent bridge.'
      : 'Load an existing site before asking Valet.';
  }
}

function syncComposerStarterControls() {
  const recipeId = normalizeComposerRecipeId(state.composer.recipeId);
  const starterId = normalizeComposerStarterId(state.composer.starterId);
  const themeId = normalizeComposerThemeId(state.composer.themeId);
  const surfaceId = normalizeComposerSurfaceId(state.composer.surfaceId);
  const addonIds = normalizeComposerAddonIds(state.composer.addonIds);
  const dataSourceId = normalizeComposerDataSourceId(state.composer.dataSourceId);
  const tvConfig = normalizeComposerTvConfig(state.composer.tvConfig);
  const supportsTheme = recipeId === COMPOSER_DEFAULT_RECIPE_ID && composerStarterUsesSharedUi(starterId);
  const builderDisabled = state.composer.builderLocked || composerBuilderIsBusy();
  const selectedCopyEntry = getComposerCopySourceEntry();

  state.composer.recipeId = recipeId;
  state.composer.starterId = starterId;
  state.composer.surfaceId = surfaceId;
  state.composer.addonIds = addonIds;
  state.composer.dataSourceId = dataSourceId;
  state.composer.themeId = themeId;
  state.composer.tvConfig = tvConfig;
  state.composer.copyQuery = String(state.composer.copyQuery || '');

  const activeFlatStarterId = getActiveFlatStarterId();
  composerFlatStarterButtons.forEach((button) => {
    const isActive = button.dataset.composerFlatStarter === activeFlatStarterId;
    button.classList.toggle('is-active', isActive);
    button.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    button.disabled = builderDisabled;
  });
  if (composerTvFormFactorCheckboxEl) {
    const flatOption = COMPOSER_FLAT_STARTER_OPTIONS.find((option) => option.id === activeFlatStarterId);
    const autoOn = Boolean(flatOption?.tvFormFactorAutoOn);
    const effective = autoOn || Boolean(state.composer.tvFormFactor);
    composerTvFormFactorCheckboxEl.checked = effective;
    composerTvFormFactorCheckboxEl.disabled = autoOn || builderDisabled;
    composerTvFormFactorCheckboxEl.title = autoOn ? 'TV form factor is on automatically for the TV App starter.' : '';
  }

  composerRecipeButtons.forEach((button) => {
    const isActive = button.dataset.composerRecipe === recipeId;
    button.classList.toggle('is-active', isActive);
    button.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    button.disabled = builderDisabled;
  });
  composerStarterButtons.forEach((button) => {
    const isActive = button.dataset.composerStarter === starterId;
    button.classList.toggle('is-active', isActive);
    button.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    button.disabled = recipeId !== COMPOSER_DEFAULT_RECIPE_ID || builderDisabled;
  });
  composerSurfaceButtons.forEach((button) => {
    const isActive = button.dataset.composerSurface === surfaceId;
    button.classList.toggle('is-active', isActive);
    button.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    button.disabled = recipeId !== COMPOSER_DEFAULT_RECIPE_ID || builderDisabled;
  });
  composerAddonButtons.forEach((button) => {
    const isActive = addonIds.includes(button.dataset.composerAddon);
    button.classList.toggle('is-active', isActive);
    button.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    button.disabled = recipeId !== COMPOSER_DEFAULT_RECIPE_ID || builderDisabled;
  });
  composerDataSourceButtons.forEach((button) => {
    const isActive = button.dataset.composerDataSource === dataSourceId;
    button.classList.toggle('is-active', isActive);
    button.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    button.disabled = recipeId !== COMPOSER_DEFAULT_RECIPE_ID || builderDisabled;
  });
  composerRecipePanels.forEach((panel) => {
    panel.classList.toggle('is-hidden', panel.dataset.composerRecipePanel !== recipeId);
  });
  composerTabButtons.forEach((button) => {
    const isEditorTab = button.dataset.composerTab === 'editor';
    button.disabled = isEditorTab && recipeId === 'copy-site';
  });

  if (composerStarterSummaryEl) {
    composerStarterSummaryEl.textContent = buildComposerStarterSummary(starterId, recipeId);
  }

  if (composerThemeSelectEl && composerThemeSelectEl.value !== themeId) {
    composerThemeSelectEl.value = themeId;
  }

  if (composerThemeFieldEl) {
    composerThemeFieldEl.classList.toggle('is-hidden', !supportsTheme);
  }

  if (composerThemeSelectEl) {
    composerThemeSelectEl.disabled = !supportsTheme || builderDisabled;
  }

  const generatedPlan = buildComposerGeneratedPlan();
  if (composerPlanSummaryEl) {
    composerPlanSummaryEl.textContent = generatedPlan.summary;
  }
  renderComposerPlanList(generatedPlan);

  if (composerBuilderLockEl) {
    composerBuilderLockEl.classList.toggle('is-hidden', !state.composer.builderLocked);
  }
  if (composerBuilderLockCopyEl) {
    composerBuilderLockCopyEl.textContent = buildComposerBuilderLockCopy();
  }
  if (composerBuilderResetButton) {
    composerBuilderResetButton.disabled = composerBuilderIsBusy();
  }

  if (composerTvAppTitleEl && composerTvAppTitleEl.value !== tvConfig.appTitle) {
    composerTvAppTitleEl.value = tvConfig.appTitle;
  }
  if (composerTvMediaBundleEl && composerTvMediaBundleEl.value !== tvConfig.mediaBundleId) {
    composerTvMediaBundleEl.value = tvConfig.mediaBundleId;
  }
  composerTvLaunchEls.forEach((input, index) => {
    if (input && input.value !== tvConfig.launcherLabels[index]) {
      input.value = tvConfig.launcherLabels[index];
    }
    if (input) {
      input.disabled = recipeId !== 'tv-app' || builderDisabled;
    }
  });
  if (composerTvNowPlayingLabelEl) {
    if (composerTvNowPlayingLabelEl.value !== tvConfig.nowPlayingLabel) {
      composerTvNowPlayingLabelEl.value = tvConfig.nowPlayingLabel;
    }
    composerTvNowPlayingLabelEl.disabled = recipeId !== 'tv-app' || builderDisabled;
  }
  if (composerTvAdBadgeTextEl) {
    if (composerTvAdBadgeTextEl.value !== tvConfig.adBadgeText) {
      composerTvAdBadgeTextEl.value = tvConfig.adBadgeText;
    }
    composerTvAdBadgeTextEl.disabled = recipeId !== 'tv-app' || builderDisabled;
  }
  if (composerTvAdBadgeEnabledEl) {
    composerTvAdBadgeEnabledEl.checked = tvConfig.adBadgeEnabled;
    composerTvAdBadgeEnabledEl.disabled = recipeId !== 'tv-app' || builderDisabled;
  }
  if (composerTvTailEnabledEl) {
    composerTvTailEnabledEl.checked = tvConfig.tvTailEnabled;
    composerTvTailEnabledEl.disabled = recipeId !== 'tv-app' || builderDisabled;
  }
  if (composerTvAppTitleEl) {
    composerTvAppTitleEl.disabled = recipeId !== 'tv-app' || builderDisabled;
  }
  if (composerTvMediaBundleEl) {
    composerTvMediaBundleEl.disabled = recipeId !== 'tv-app' || builderDisabled;
  }

  if (composerCopySelectedEl) {
    composerCopySelectedEl.classList.toggle('is-hidden', !selectedCopyEntry);
  }
  if (composerCopySearchEl) {
    if (composerCopySearchEl.value !== state.composer.copyQuery) {
      composerCopySearchEl.value = state.composer.copyQuery;
    }
    composerCopySearchEl.disabled = recipeId !== 'copy-site' || builderDisabled;
  }
  renderComposerCopyResults();

  if (composerCopyPreviewImageEl) {
    composerCopyPreviewImageEl.src = getPreviewUrl(selectedCopyEntry?.siteId) || PREVIEW_PLACEHOLDER_URL;
  }
  if (composerCopyPreviewTitleEl) {
    composerCopyPreviewTitleEl.textContent = selectedCopyEntry
      ? (buildDisplayTitle(selectedCopyEntry) || selectedCopyEntry.siteId)
      : 'Choose a site';
  }
  if (composerCopyPreviewHostEl) {
    composerCopyPreviewHostEl.textContent = selectedCopyEntry
      ? `https://${selectedCopyEntry.host || `${selectedCopyEntry.siteId}.${BASE_DOMAIN}`}/`
      : 'Search the catalog and pick a source site to clone.';
  }
  if (composerCopyPreviewDescriptionEl) {
    composerCopyPreviewDescriptionEl.textContent = selectedCopyEntry
      ? (selectedCopyEntry.description || (selectedCopyEntry.notes || [])[0] || 'Hosted Mullmania site.')
      : 'Pick a source site. Its hosted files and saved data will be copied into the target subdomain.';
  }
  renderComposerCopyVariants(selectedCopyEntry);
  if (composerCopyPreviewNoteEl) {
    composerCopyPreviewNoteEl.textContent = selectedCopyEntry
      ? 'Copy Site copies the source as-is. The editor is disabled for this mode.'
      : 'Pick a target subdomain and source site, then create the copy.';
  }

  syncComposerInteractiveState();
}

function setComposerRecipe(recipeId) {
  const nextRecipeId = normalizeComposerRecipeId(recipeId);
  if (state.composer.builderLocked || state.composer.recipeId === nextRecipeId && state.composer.draftPreset === COMPOSER_DRAFT_PRESET_STARTER) {
    syncComposerStarterControls();
    return;
  }

  state.composer.recipeId = nextRecipeId;
  if (nextRecipeId === 'copy-site' && state.composer.mode === 'editor') {
    state.composer.mode = 'blank';
    composerModalEl?.classList.add('is-builder-mode');
    composerModalEl?.classList.remove('is-editor-mode');
    composerBlankPanelEl?.classList.remove('is-hidden');
    composerEditorPanelEl?.classList.add('is-hidden');
  }
  clearComposerDeleteArm();
  seedComposerStarterDraft(sanitizeSiteIdInput(composerSiteIdEl?.value || ''));
  const validation = syncComposerChrome();
  if (!composerModalEl?.classList.contains('is-hidden')) {
    const status = buildComposerOpenStatus(validation);
    updateComposerStatus(status.message, status.tone);
  }
}

function getActiveFlatStarterId() {
  const mode = state.composer.mode === 'editor' ? 'editor' : 'starter';
  if (mode === 'editor') {
    return 'from-editor';
  }
  const recipeId = normalizeComposerRecipeId(state.composer.recipeId);
  const starterId = normalizeComposerStarterId(state.composer.starterId);
  const match = COMPOSER_FLAT_STARTER_OPTIONS.find((option) =>
    option.mode === 'starter' && option.recipeId === recipeId && option.starterId === starterId,
  );
  if (match) {
    return match.id;
  }
  // Fallback: recipe alone (TV App / Copy Site don't care which inner starter).
  const recipeMatch = COMPOSER_FLAT_STARTER_OPTIONS.find((option) =>
    option.mode === 'starter' && option.recipeId === recipeId,
  );
  return recipeMatch ? recipeMatch.id : COMPOSER_DEFAULT_FLAT_STARTER_ID;
}

function setComposerFlatStarter(flatStarterId) {
  if (state.composer.builderLocked) {
    return;
  }
  const option = COMPOSER_FLAT_STARTER_OPTIONS.find((entry) => entry.id === flatStarterId);
  if (!option) {
    return;
  }
  // Set recipe + starter to the mapped pair. setComposerRecipe handles preview reseed.
  setComposerRecipe(option.recipeId);
  if (option.recipeId === COMPOSER_DEFAULT_RECIPE_ID) {
    setComposerStarter(option.starterId);
  }
  // TV form factor: auto-on for TV App, otherwise leave the operator's existing choice intact.
  if (option.tvFormFactorAutoOn && !state.composer.tvFormFactor) {
    state.composer.tvFormFactor = true;
  }
  setComposerMode(option.mode === 'editor' ? 'editor' : 'blank');
  syncComposerStarterControls();
}

function setComposerTvFormFactor(enabled) {
  const next = Boolean(enabled);
  if (state.composer.tvFormFactor === next) {
    return;
  }
  state.composer.tvFormFactor = next;
  syncComposerStarterControls();
  if (!state.composer.builderLocked && normalizeComposerRecipeId(state.composer.recipeId) === COMPOSER_DEFAULT_RECIPE_ID) {
    clearComposerDeleteArm();
    seedComposerStarterDraft(sanitizeSiteIdInput(composerSiteIdEl?.value || ''));
    updateComposerPreview();
  }
}

function setComposerStarter(starterId) {
  if (state.composer.builderLocked || normalizeComposerRecipeId(state.composer.recipeId) !== COMPOSER_DEFAULT_RECIPE_ID) {
    syncComposerStarterControls();
    return;
  }

  const nextStarterId = normalizeComposerStarterId(starterId);
  const shouldReseed = state.composer.starterId !== nextStarterId
    || state.composer.draftPreset !== COMPOSER_DRAFT_PRESET_STARTER;

  state.composer.starterId = nextStarterId;
  syncComposerStarterControls();

  if (shouldReseed) {
    clearComposerDeleteArm();
    seedComposerStarterDraft(sanitizeSiteIdInput(composerSiteIdEl?.value || ''));
    updateComposerPreview();
  }

  const validation = syncComposerChrome();
  if (!composerModalEl?.classList.contains('is-hidden')) {
    const status = buildComposerOpenStatus(validation);
    updateComposerStatus(status.message, status.tone);
  }
}

function setComposerTheme(themeId) {
  if (state.composer.builderLocked || normalizeComposerRecipeId(state.composer.recipeId) !== COMPOSER_DEFAULT_RECIPE_ID) {
    syncComposerStarterControls();
    return;
  }

  const nextThemeId = normalizeComposerThemeId(themeId);
  const shouldReseed = state.composer.themeId !== nextThemeId
    || state.composer.draftPreset !== COMPOSER_DRAFT_PRESET_STARTER;

  state.composer.themeId = nextThemeId;
  syncComposerStarterControls();

  if (composerStarterUsesSharedUi() && shouldReseed) {
    clearComposerDeleteArm();
    seedComposerStarterDraft(sanitizeSiteIdInput(composerSiteIdEl?.value || ''));
    updateComposerPreview();
  }

  const validation = syncComposerChrome();
  if (!composerModalEl?.classList.contains('is-hidden')) {
    const status = buildComposerOpenStatus(validation);
    updateComposerStatus(status.message, status.tone);
  }
}

function setComposerSurface(surfaceId) {
  if (state.composer.builderLocked || normalizeComposerRecipeId(state.composer.recipeId) !== COMPOSER_DEFAULT_RECIPE_ID) {
    syncComposerStarterControls();
    return;
  }

  const nextSurfaceId = normalizeComposerSurfaceId(surfaceId);
  const shouldReseed = state.composer.surfaceId !== nextSurfaceId
    || state.composer.draftPreset !== COMPOSER_DRAFT_PRESET_STARTER;

  state.composer.surfaceId = nextSurfaceId;
  syncComposerStarterControls();

  if (shouldReseed) {
    clearComposerDeleteArm();
    seedComposerStarterDraft(sanitizeSiteIdInput(composerSiteIdEl?.value || ''));
    updateComposerPreview();
  }

  const validation = syncComposerChrome();
  if (!composerModalEl?.classList.contains('is-hidden')) {
    const status = buildComposerOpenStatus(validation);
    updateComposerStatus(status.message, status.tone);
  }
}

function toggleComposerAddon(addonId) {
  if (state.composer.builderLocked || normalizeComposerRecipeId(state.composer.recipeId) !== COMPOSER_DEFAULT_RECIPE_ID) {
    syncComposerStarterControls();
    return;
  }

  const normalizedAddonId = String(addonId || '').trim().toLowerCase();
  if (!COMPOSER_ADDON_IDS.has(normalizedAddonId)) {
    syncComposerStarterControls();
    return;
  }

  const currentIds = normalizeComposerAddonIds(state.composer.addonIds);
  const nextIds = currentIds.includes(normalizedAddonId)
    ? currentIds.filter((id) => id !== normalizedAddonId)
    : [...currentIds, normalizedAddonId];
  const shouldReseed = JSON.stringify(currentIds) !== JSON.stringify(nextIds)
    || state.composer.draftPreset !== COMPOSER_DRAFT_PRESET_STARTER;
  state.composer.addonIds = nextIds;
  syncComposerStarterControls();
  clearComposerDeleteArm();
  if (shouldReseed) {
    seedComposerStarterDraft(sanitizeSiteIdInput(composerSiteIdEl?.value || ''));
  }

  const validation = syncComposerChrome();
  if (!composerModalEl?.classList.contains('is-hidden')) {
    const status = buildComposerOpenStatus(validation);
    updateComposerStatus(status.message, status.tone);
  }
}

function setComposerDataSource(dataSourceId) {
  if (state.composer.builderLocked || normalizeComposerRecipeId(state.composer.recipeId) !== COMPOSER_DEFAULT_RECIPE_ID) {
    syncComposerStarterControls();
    return;
  }

  const nextDataSourceId = normalizeComposerDataSourceId(dataSourceId);
  const shouldReseed = state.composer.dataSourceId !== nextDataSourceId
    || state.composer.draftPreset !== COMPOSER_DRAFT_PRESET_STARTER;
  state.composer.dataSourceId = nextDataSourceId;
  syncComposerStarterControls();

  if (shouldReseed) {
    clearComposerDeleteArm();
    seedComposerStarterDraft(sanitizeSiteIdInput(composerSiteIdEl?.value || ''));
    updateComposerPreview();
  }

  const validation = syncComposerChrome();
  if (!composerModalEl?.classList.contains('is-hidden')) {
    const status = buildComposerOpenStatus(validation);
    updateComposerStatus(status.message, status.tone);
  }
}

function updateComposerTvConfig(nextPatch = {}) {
  const nextConfig = normalizeComposerTvConfig({
    ...state.composer.tvConfig,
    ...nextPatch,
    launcherLabels: Array.isArray(nextPatch.launcherLabels)
      ? nextPatch.launcherLabels
      : state.composer.tvConfig.launcherLabels,
  });
  const changed = JSON.stringify(nextConfig) !== JSON.stringify(state.composer.tvConfig);
  state.composer.tvConfig = nextConfig;
  syncComposerStarterControls();

  if (changed && !state.composer.builderLocked && normalizeComposerRecipeId(state.composer.recipeId) === 'tv-app') {
    clearComposerDeleteArm();
    seedComposerStarterDraft(sanitizeSiteIdInput(composerSiteIdEl?.value || ''));
    const validation = syncComposerChrome();
    if (!composerModalEl?.classList.contains('is-hidden')) {
      const status = buildComposerOpenStatus(validation);
      updateComposerStatus(status.message, status.tone);
    }
  }
}

function setComposerCopySource(siteId) {
  const normalizedSiteId = normalizeSiteId(siteId);
  state.composer.copySourceSiteId = normalizedSiteId;
  syncComposerStarterControls();

  if (state.composer.builderLocked || normalizeComposerRecipeId(state.composer.recipeId) !== 'copy-site') {
    return;
  }

  clearComposerDeleteArm();
  seedComposerStarterDraft(sanitizeSiteIdInput(composerSiteIdEl?.value || ''));
  const validation = syncComposerChrome();
  if (!composerModalEl?.classList.contains('is-hidden')) {
    const status = buildComposerOpenStatus(validation);
    updateComposerStatus(status.message, status.tone);
  }
}

function buildComposerUiSiteSitemap({ hostLabel, themeId, themeLabel, uiOrigin, plan }) {
  const generatedPlan = plan || buildComposerGeneratedPlan();
  const addonStats = generatedPlan.addons.map((addon) => ({
    component: 'stat',
    label: addon.label,
    value: 'Shown',
    caption: addon.summary,
  }));
  const dataStat = {
    component: 'stat',
    label: 'Data',
    value: generatedPlan.dataSource.label,
    caption: generatedPlan.dataSource.summary,
  };
  return {
    header: {
      title: hostLabel,
      icon: 'ti ti-layout-sidebar-right-expand',
      controls: [
        {
          type: 'link',
          label: 'UI Docs',
          text: 'UI Docs',
          href: `${uiOrigin}/llm-docs.md`,
          icon: 'ti ti-book-2',
        },
        {
          type: 'link',
          label: 'Theme',
          text: themeLabel,
          href: `${uiOrigin}/active/typography.html?theme=${encodeURIComponent(themeId)}`,
          icon: 'ti ti-palette',
        },
      ],
    },
    tabs: [
      {
        id: 'overview',
        label: 'Overview',
        icon: 'ti ti-home',
        component: {
          component: 'app',
          title: hostLabel,
          subtitle: `Generated from Sites. Theme: ${themeLabel}.`,
          children: [
            {
              component: 'grid',
              columns: 3,
              children: [
                {
                  component: 'stat',
                  label: 'Runtime',
                  value: 'ui.js',
                  caption: `${uiOrigin}/ui.js`,
                },
                {
                  component: 'stat',
                  label: 'Theme',
                  value: themeLabel,
                  caption: 'Used by this page',
                },
                {
                  component: 'stat',
                  label: 'Page type',
                  value: generatedPlan.surface.label,
                  caption: generatedPlan.surface.shell,
                },
              ],
            },
            {
              component: 'grid',
              columns: 3,
              children: addonStats.length > 0 ? [...addonStats, dataStat] : [dataStat],
            },
            {
              component: 'alert',
              tone: 'info',
              title: 'Created by Sites',
              message: generatedPlan.detailLines.join(' · '),
            },
          ],
        },
      },
      {
        id: 'sections',
        label: 'Content',
        icon: 'ti ti-layout-sidebar-right',
        layout: 'workspace',
        sections: [
          {
            type: 'list',
            inlineData: [
              {
                id: 'hero',
                name: 'First screen',
                icon: 'ti ti-sparkles',
                description: 'Title, short description, and main button.',
                component: {
                  component: 'app',
                  title: 'First screen',
                  subtitle: 'Replace this with what the site is for.',
                  children: [
                    {
                      component: 'grid',
                      columns: 2,
                      children: [
                        {
                          component: 'stat',
                          label: 'Title',
                          value: 'Say what it is',
                          caption: 'Keep it plain',
                        },
                        {
                          component: 'stat',
                          label: 'Action',
                          value: 'One button',
                          caption: 'Make the next click obvious',
                        },
                      ],
                    },
                  ],
                },
              },
              {
                id: 'workspace',
                name: 'Workspace',
                icon: 'ti ti-layout-sidebar-right-expand',
                description: 'Use this when the page needs navigation or a list-detail layout.',
                component: {
                  component: 'app',
                  title: 'Workspace shell',
                  subtitle: 'Keep this layout when the site behaves like a tool.',
                  children: [
                    {
                      component: 'alert',
                      tone: 'info',
                      title: 'Layout',
                      message: 'Use tabs for modes and the sidebar for lists or source switching.',
                    },
                  ],
                },
              },
              {
                id: 'finish',
                name: 'Finish',
                icon: 'ti ti-rosette-discount-check',
                description: 'Add screenshots, links, or notes once the site has real content.',
                component: {
                  component: 'app',
                  title: 'Finish',
                  subtitle: 'Replace the placeholder content before treating the site as done.',
                  children: [
                    {
                      component: 'grid',
                      columns: 3,
                      children: [
                        { component: 'stat', label: 'Screenshot', value: 'Add one', caption: 'Show the current page' },
                        { component: 'stat', label: 'Links', value: 'Wire them', caption: 'Point buttons somewhere real' },
                        { component: 'stat', label: 'Notes', value: 'Keep short', caption: 'Say what still needs work' },
                      ],
                    },
                  ],
                },
              },
            ],
          },
        ],
      },
      {
        id: 'ship',
        label: 'Publish',
        icon: 'ti ti-rocket',
        component: {
          component: 'app',
          title: 'Publish',
          subtitle: 'This is a starting page. Edit the text and links before you call it finished.',
          children: [
            {
              component: 'alert',
              tone: 'success',
              title: 'What Sites saves',
              message: 'Create writes index.html and keeps the editable source so this screen can reopen it later.',
            },
          ],
        },
      },
    ],
  };
}

function buildComposerUiSiteStarterSource(siteId = '', themeId = state.composer.themeId) {
  const normalizedSiteId = sanitizeSiteIdInput(siteId) || 'my-site';
  const hostLabel = `${normalizedSiteId}.${BASE_DOMAIN}`;
  const uiOrigin = `https://ui.${BASE_DOMAIN}`;
  const themeOption = getComposerThemeOption(themeId);
  const plan = buildComposerGeneratedPlan(normalizedSiteId);
  const sitemap = buildComposerUiSiteSitemap({
    hostLabel,
    themeId: themeOption.id,
    themeLabel: themeOption.label,
    uiOrigin,
    plan,
  });

  return {
    html: [
      '<div id="header-container"></div>',
      '<div id="tabs-container" class="tabs"></div>',
      '<div id="content-container"></div>',
      `<script src="${uiOrigin}/ui.js" data-ui-theme="${themeOption.id}"></script>`,
    ].join('\n'),
    css: [
      'html, body {',
      '  margin: 0;',
      '  min-height: 100%;',
      '}',
      'body {',
      '  background: #f4f7fb;',
      '}',
    ].join('\n'),
    js: [
      `const sitemap = ${JSON.stringify(sitemap)};`,
      `document.title = ${JSON.stringify(hostLabel)};`,
      'const init = async () => {',
      '  await window.UI.ready();',
      "  const sitemapUrl = URL.createObjectURL(new Blob([JSON.stringify(sitemap)], { type: 'application/json' }));",
      '  try {',
      '    const shell = window.UI.createShell({',
      "      tabsContainerId: 'tabs-container',",
      "      contentContainerId: 'content-container',",
      '      sitemapPath: sitemapUrl,',
      "      header: { containerId: 'header-container' },",
      '    });',
      '    await shell.init();',
      '  } catch (error) {',
      "    console.error('[starter-ui-site] render failed', error);",
      '    document.body.textContent = error.message || String(error);',
      '  } finally {',
      '    URL.revokeObjectURL(sitemapUrl);',
      '  }',
      '};',
      'if (window.UI?.ready) {',
      '  init();',
      '} else {',
      "  window.addEventListener('ui-ready', init, { once: true });",
      '}',
    ].join('\n'),
  };
}

function buildComposerPlanListHtml(plan) {
  return plan.detailLines
    .map((line) => `        <li>${escapeHtml(line)}</li>`)
    .join('\n');
}

function appendComposerHtmlFragment(html, fragment) {
  const cleanFragment = String(fragment || '').trim();
  if (!cleanFragment) {
    return html;
  }
  const marker = '</main>';
  const markerIndex = String(html || '').lastIndexOf(marker);
  if (markerIndex === -1) {
    return [html, cleanFragment].filter(Boolean).join('\n');
  }
  return `${html.slice(0, markerIndex)}${cleanFragment}\n${html.slice(markerIndex)}`;
}

function buildComposerMobileBaselineCss() {
  return [
    '',
    '/* Mobile/touch baseline */',
    'html {',
    '  -webkit-text-size-adjust: 100%;',
    '}',
    'body {',
    '  touch-action: manipulation;',
    '}',
    'button, a, input, select, textarea, [role="button"] {',
    '  min-height: 44px;',
    '}',
    'button, a, [role="button"] {',
    '  -webkit-tap-highlight-color: transparent;',
    '}',
    '@media (max-width: 700px) {',
    '  body {',
    '    font-size: 16px;',
    '  }',
    '  main, .starter-shell, .tool-app-shell, .api-frontdoor-shell {',
    '    width: 100%;',
    '    max-width: 100%;',
    '  }',
    '  .starter-actions, .tool-app-actions, .api-frontdoor-actions {',
    '    flex-direction: column;',
    '    align-items: stretch;',
    '  }',
    '}',
  ].join('\n');
}

function buildComposerTvTailRuntimeConfig(siteId = '') {
  const normalizedSiteId = sanitizeSiteIdInput(siteId) || 'my-site';
  const channelId = `${normalizedSiteId}-tv-tail`;
  return {
    enabled: true,
    channelId,
    userId: `screen-${normalizedSiteId}`,
    hubUrl: `https://signalargh.${BASE_DOMAIN}/hub`,
    signalrClientUrl: SIGNALR_CLIENT_URL,
    logTapUrl: COMPOSER_TV_TAIL_LOG_TAP_URL,
    telestrateUrl: `${COMPOSER_TV_TAIL_TELESTRATE_URL}?channel=${encodeURIComponent(channelId)}&brand=tv-tail`,
    stateTopic: COMPOSER_TV_TAIL_TOPIC_STATE,
    commandTopic: COMPOSER_TV_TAIL_TOPIC_COMMAND,
  };
}

function composerTvTailEnabled(addonIds = state.composer.addonIds) {
  return Boolean(state.composer.tvFormFactor) || composerHasAddon('tv-tail', addonIds);
}

function buildComposerTvTailHtml(config) {
  return [
    '  <section class="tv-tail-panel" id="tv-tail-panel">',
    '    <div>',
    '      <p class="tv-tail-panel__eyebrow">tv-tail</p>',
    `      <p class="tv-tail-panel__copy">SignalArgh channel <strong>${escapeHtml(config.channelId)}</strong></p>`,
    '    </div>',
    '    <div class="tv-tail-panel__actions">',
    `      <a class="tv-tail-link" id="tv-tail-link" href="${escapeHtml(config.telestrateUrl)}" target="_blank" rel="noreferrer">Open Telestrate</a>`,
    '      <span class="tv-tail-status" id="tv-tail-status">preview only</span>',
    '    </div>',
    '  </section>',
  ].join('\n');
}

function buildComposerTvTailCss() {
  return [
    '',
    '/* tv-tail runtime panel */',
    '.tv-tail-panel {',
    '  margin-top: 16px;',
    '  padding: 16px;',
    '  border: 1px solid rgba(22, 28, 36, 0.14);',
    '  border-radius: 10px;',
    '  background: rgba(255, 255, 255, 0.7);',
    '  display: flex;',
    '  align-items: center;',
    '  justify-content: space-between;',
    '  gap: 16px;',
    '  flex-wrap: wrap;',
    '}',
    '.tv-tail-panel__eyebrow {',
    '  margin: 0;',
    '  font-size: 12px;',
    '  font-weight: 800;',
    '  text-transform: uppercase;',
    '  color: inherit;',
    '  opacity: 0.62;',
    '}',
    '.tv-tail-panel__copy {',
    '  margin: 4px 0 0;',
    '  overflow-wrap: anywhere;',
    '}',
    '.tv-tail-panel__actions {',
    '  display: flex;',
    '  align-items: center;',
    '  gap: 10px;',
    '  flex-wrap: wrap;',
    '}',
    '.tv-tail-link, .tv-tail-status {',
    '  min-height: 38px;',
    '  padding: 0 14px;',
    '  border-radius: 999px;',
    '  display: inline-flex;',
    '  align-items: center;',
    '  font-size: 14px;',
    '  font-weight: 800;',
    '}',
    '.tv-tail-link {',
    '  background: #111318;',
    '  color: #fff;',
    '  text-decoration: none;',
    '}',
    '.tv-tail-status {',
    '  border: 1px solid rgba(22, 28, 36, 0.14);',
    '  background: rgba(255, 255, 255, 0.75);',
    '  color: inherit;',
    '}',
  ].join('\n');
}

function buildComposerTvTailJs(config, hostLabel) {
  return [
    '',
    'const tvTailConfig = {',
    `  enabled: true,`,
    `  channelId: ${JSON.stringify(config.channelId)},`,
    `  userId: ${JSON.stringify(config.userId)},`,
    `  hubUrl: ${JSON.stringify(config.hubUrl)},`,
    `  signalrClientUrl: ${JSON.stringify(config.signalrClientUrl)},`,
    `  logTapUrl: ${JSON.stringify(config.logTapUrl)},`,
    `  telestrateUrl: ${JSON.stringify(config.telestrateUrl)},`,
    `  stateTopic: ${JSON.stringify(config.stateTopic)},`,
    `  commandTopic: ${JSON.stringify(config.commandTopic)},`,
    '};',
    "const tvTailStatusEl = document.getElementById('tv-tail-status');",
    "const tvTailPreviewMode = location.protocol === 'about:' || String(location.href || '').startsWith('about:srcdoc');",
    'let tvTailConnection = null;',
    'let tvTailConnected = false;',
    'function setTvTailStatus(label) { if (tvTailStatusEl) tvTailStatusEl.textContent = label; }',
    'function buildTvTailTransportOptions() { const options = { withCredentials: false }; if (window.signalR?.HttpTransportType?.WebSockets) { options.transport = window.signalR.HttpTransportType.WebSockets; options.skipNegotiation = true; } return options; }',
    'function loadTvTailScript(src, marker) { return new Promise((resolve, reject) => { if (!src) { resolve(); return; } const existing = document.querySelector(`script[data-tv-tail-marker="${marker}"]`); if (existing) { existing.addEventListener("load", resolve, { once: true }); existing.addEventListener("error", reject, { once: true }); if (marker === "log-tap" || window.signalR?.HubConnectionBuilder) resolve(); return; } const script = document.createElement("script"); script.src = src; script.async = true; script.dataset.tvTailMarker = marker; script.addEventListener("load", resolve, { once: true }); script.addEventListener("error", reject, { once: true }); document.head.appendChild(script); }); }',
    'function loadTvTailLogTap() { if (!tvTailConfig.enabled || tvTailPreviewMode || window.__logTap) return; window.LOG_TAP_APP_ID = tvTailConfig.channelId; window.LOG_TAP_CHANNEL = "tv-logs"; window.LOG_TAP_HUB = tvTailConfig.hubUrl.replace(/\\/hub$/, ""); loadTvTailScript(tvTailConfig.logTapUrl, "log-tap").catch(() => {}); }',
    `function tvTailState(extra = {}) { return { type: "tv-tail.state", siteId: ${JSON.stringify(hostLabel)}, channelId: tvTailConfig.channelId, title: document.title || ${JSON.stringify(hostLabel)}, url: location.href, at: new Date().toISOString(), ...extra }; }`,
    'function tvTailDispatchLocal(topic, payload) { try { window.dispatchEvent(new CustomEvent("tv-tail:event", { detail: { topic, payload } })); } catch (_error) {} }',
    'async function tvTailBroadcast(topic = tvTailConfig.stateTopic, extra = {}) { if (!tvTailConfig.enabled) return false; const payload = tvTailState(extra); tvTailDispatchLocal(topic, payload); if (!tvTailConnected || !tvTailConnection) return false; try { await tvTailConnection.invoke("SendCustomMessage", tvTailConfig.channelId, topic, JSON.stringify(payload)); return true; } catch (_error) { setTvTailStatus("local only"); return false; } }',
    'function parseTvTailPayload(raw) { if (typeof raw !== "string") return raw; try { return JSON.parse(raw); } catch (_error) { return raw; } }',
    'function handleTvTailCommand(raw) { const payload = parseTvTailPayload(raw); const command = typeof payload === "string" ? payload : String(payload?.command || payload?.type || "").replace(/^tv-tail\\.|^telestrate\\./, ""); if (!command) return; window.dispatchEvent(new CustomEvent("tv-tail:command", { detail: { command: command.toLowerCase(), payload } })); }',
    'async function connectTvTail() { if (!tvTailConfig.enabled) return; loadTvTailLogTap(); if (tvTailPreviewMode) { setTvTailStatus("preview only"); tvTailBroadcast(tvTailConfig.stateTopic, { previewMode: true }); return; } try { setTvTailStatus("connecting"); await loadTvTailScript(tvTailConfig.signalrClientUrl, "signalr"); if (!window.signalR?.HubConnectionBuilder) throw new Error("SignalR client unavailable"); tvTailConnection = new window.signalR.HubConnectionBuilder().withUrl(`${tvTailConfig.hubUrl}?channelId=${encodeURIComponent(tvTailConfig.channelId)}&userId=${encodeURIComponent(tvTailConfig.userId)}`, buildTvTailTransportOptions()).withAutomaticReconnect().build(); tvTailConnection.on("customMessage", (message) => { if (!message || typeof message !== "object") return; if (message.topic === tvTailConfig.commandTopic || message.topic === "command") handleTvTailCommand(message.message); }); tvTailConnection.onreconnected(() => { tvTailConnected = true; setTvTailStatus("connected"); tvTailBroadcast(tvTailConfig.stateTopic, { event: "reconnected" }); }); tvTailConnection.onreconnecting(() => { tvTailConnected = false; setTvTailStatus("reconnecting"); }); tvTailConnection.onclose(() => { tvTailConnected = false; setTvTailStatus("local only"); }); await tvTailConnection.start(); tvTailConnected = true; setTvTailStatus("connected"); await tvTailBroadcast(tvTailConfig.stateTopic, { event: "ready" }); } catch (error) { tvTailConnected = false; setTvTailStatus("local only"); console.info("[tv-tail] remote unavailable", error); } }',
    'window.addEventListener("message", (event) => handleTvTailCommand(event.data));',
    'window.addEventListener("hashchange", () => { const command = new URLSearchParams(String(location.hash || "").replace(/^#/, "")).get("tvCommand"); if (command) handleTvTailCommand(command); });',
    'void connectTvTail();',
  ].join('\n');
}

function buildComposerIpzomHtml() {
  return [
    '  <section class="ipzom-sample" id="ipzom-sample">',
    '    <div class="ipzom-sample__copy">',
    '      <p class="ipzom-sample__eyebrow">Ipzom sample data</p>',
    '      <h2 id="ipzom-title">Loading sample asset</h2>',
    '      <p id="ipzom-summary">Fetching a deterministic JSON sample from the Ipzom API.</p>',
    '    </div>',
    '    <a class="ipzom-sample__media" id="ipzom-link" href="https://ipzom.com/api/" target="_blank" rel="noreferrer">',
    '      <img id="ipzom-image" alt="" loading="lazy">',
    '    </a>',
    '    <pre class="ipzom-sample__meta" id="ipzom-meta">await fetch(...)</pre>',
    '  </section>',
  ].join('\n');
}

function buildComposerIpzomCss() {
  return [
    '',
    '/* Ipzom sample data panel */',
    '.ipzom-sample {',
    '  margin-top: 16px;',
    '  padding: 16px;',
    '  border: 1px solid rgba(22, 28, 36, 0.12);',
    '  border-radius: 10px;',
    '  background: rgba(255, 255, 255, 0.74);',
    '  display: grid;',
    '  grid-template-columns: minmax(0, 1fr) minmax(160px, 260px);',
    '  gap: 14px;',
    '  align-items: stretch;',
    '}',
    '.ipzom-sample__copy {',
    '  min-width: 0;',
    '  display: grid;',
    '  align-content: start;',
    '  gap: 8px;',
    '}',
    '.ipzom-sample__eyebrow {',
    '  margin: 0;',
    '  font-size: 12px;',
    '  font-weight: 800;',
    '  text-transform: uppercase;',
    '  opacity: 0.62;',
    '}',
    '.ipzom-sample h2, .ipzom-sample p {',
    '  margin: 0;',
    '}',
    '.ipzom-sample__media {',
    '  min-height: 180px;',
    '  border-radius: 8px;',
    '  overflow: hidden;',
    '  background: rgba(22, 28, 36, 0.08);',
    '}',
    '.ipzom-sample__media img {',
    '  width: 100%;',
    '  height: 100%;',
    '  min-height: 180px;',
    '  object-fit: cover;',
    '  display: block;',
    '}',
    '.ipzom-sample__meta {',
    '  grid-column: 1 / -1;',
    '  margin: 0;',
    '  max-height: 140px;',
    '  overflow: auto;',
    '  padding: 12px;',
    '  border-radius: 8px;',
    '  background: #111318;',
    '  color: #f7f8fb;',
    '  font-size: 12px;',
    '  line-height: 1.5;',
    '}',
    '@media (max-width: 760px) {',
    '  .ipzom-sample {',
    '    grid-template-columns: 1fr;',
    '  }',
    '}',
  ].join('\n');
}

function buildComposerIpzomJs(siteId = '') {
  const normalizedSiteId = sanitizeSiteIdInput(siteId) || 'my-site';
  const seed = normalizedSiteId
    .split('')
    .reduce((total, char) => total + char.charCodeAt(0), 0) % 128;
  return [
    '',
    'const LIVE_SITE_ORIGIN = "https://ipzom.com";',
    `const ipzomSampleSeed = ${seed};`,
    `const ipzomSampleUrl = \`\${LIVE_SITE_ORIGIN}/api/random/\${ipzomSampleSeed}.json\`;`,
    'const ipzomPreviewMode = location.protocol === "about:" || location.protocol === "file:" || location.origin === "null";',
    "const ipzomTitleEl = document.getElementById('ipzom-title');",
    "const ipzomSummaryEl = document.getElementById('ipzom-summary');",
    "const ipzomImageEl = document.getElementById('ipzom-image');",
    "const ipzomLinkEl = document.getElementById('ipzom-link');",
    "const ipzomMetaEl = document.getElementById('ipzom-meta');",
    'async function loadIpzomSampleData() {',
    '  try {',
    '    if (ipzomPreviewMode) {',
    '      if (ipzomTitleEl) ipzomTitleEl.textContent = "Ipzom preview sample";',
    '      if (ipzomSummaryEl) ipzomSummaryEl.textContent = "The deployed page fetches deterministic JSON from the Ipzom API."; ',
    '      if (ipzomImageEl) ipzomImageEl.removeAttribute("src");',
    '      if (ipzomLinkEl) ipzomLinkEl.href = ipzomSampleUrl;',
    '      if (ipzomMetaEl) ipzomMetaEl.textContent = JSON.stringify({ seed: ipzomSampleSeed, preview: true, url: ipzomSampleUrl }, null, 2);',
    '      return;',
    '    }',
    '    const response = await fetch(ipzomSampleUrl, { cache: "no-store" });',
    '    if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);',
    '    const payload = await response.json();',
    '    const asset = payload.asset || payload;',
    '    const title = asset.title || asset.attachment_name || asset.file_name || "Ipzom asset";',
    '    const summary = asset.prompt_excerpt || asset.request_excerpt || asset.search_text || "Sample asset loaded from Ipzom."; ',
    '    if (ipzomTitleEl) ipzomTitleEl.textContent = title;',
    '    if (ipzomSummaryEl) ipzomSummaryEl.textContent = summary;',
    '    if (ipzomImageEl) { ipzomImageEl.src = asset.image_url || asset.site_url || asset.raw_url || ""; ipzomImageEl.alt = title; }',
    '    if (ipzomLinkEl) ipzomLinkEl.href = asset.ui_url || asset.api_url || LIVE_SITE_ORIGIN;',
    '    if (ipzomMetaEl) ipzomMetaEl.textContent = JSON.stringify({ seed: payload.seed, asset_id: asset.asset_id, tags: asset.tags || [] }, null, 2);',
    '  } catch (error) {',
    '    if (ipzomTitleEl) ipzomTitleEl.textContent = "Ipzom sample unavailable";',
    '    if (ipzomSummaryEl) ipzomSummaryEl.textContent = error.message || String(error);',
    '    if (ipzomMetaEl) ipzomMetaEl.textContent = `fetch failed: ${error.message || error}`;',
    '  }',
    '}',
    'void loadIpzomSampleData();',
  ].join('\n');
}

function decorateComposerStarterSource(source, siteId = '', options = {}) {
  const addonIds = normalizeComposerAddonIds(options.addonIds ?? state.composer.addonIds);
  const dataSourceId = normalizeComposerDataSourceId(options.dataSourceId ?? state.composer.dataSourceId);
  const normalizedSiteId = sanitizeSiteIdInput(siteId) || 'my-site';
  const hostLabel = `${normalizedSiteId}.${BASE_DOMAIN}`;
  const nextSource = {
    html: source.html || '',
    css: source.css || '',
    js: source.js || '',
  };

  if (composerHasAddon('mobile', addonIds)) {
    nextSource.css = [nextSource.css, buildComposerMobileBaselineCss()].filter(Boolean).join('\n');
  }

  if (dataSourceId === 'ipzom') {
    nextSource.html = appendComposerHtmlFragment(nextSource.html, buildComposerIpzomHtml());
    nextSource.css = [nextSource.css, buildComposerIpzomCss()].filter(Boolean).join('\n');
    nextSource.js = [nextSource.js, buildComposerIpzomJs(normalizedSiteId)].filter(Boolean).join('\n');
  }

  if (composerTvTailEnabled(addonIds)) {
    const tvTailConfig = buildComposerTvTailRuntimeConfig(normalizedSiteId);
    nextSource.html = appendComposerHtmlFragment(nextSource.html, buildComposerTvTailHtml(tvTailConfig));
    nextSource.css = [nextSource.css, buildComposerTvTailCss()].filter(Boolean).join('\n');
    nextSource.js = [nextSource.js, buildComposerTvTailJs(tvTailConfig, hostLabel)].filter(Boolean).join('\n');
  }

  return nextSource;
}

function buildComposerBasicExampleStarterSource(siteId = '') {
  const normalizedSiteId = sanitizeSiteIdInput(siteId) || 'my-site';
  const hostLabel = `${normalizedSiteId}.${BASE_DOMAIN}`;
  const plan = buildComposerGeneratedPlan(normalizedSiteId);
  const lead = normalizedSiteId === 'my-site'
    ? 'Type a subdomain to name this page.'
    : `This page will be published at ${hostLabel}.`;
  const planItems = buildComposerPlanListHtml(plan);

  return {
    html: [
      '<main class="starter-shell">',
      '  <section class="starter-hero">',
      '    <p class="starter-kicker">Plain page</p>',
      `    <h1>${escapeHtml(normalizedSiteId)}</h1>`,
      `    <p class="starter-host">${escapeHtml(hostLabel)}</p>`,
      `    <p class="starter-lede">${escapeHtml(lead)}</p>`,
      '    <div class="starter-actions">',
      '      <button id="starter-theme" type="button" class="starter-button">Change accent</button>',
      '      <button id="starter-note" type="button" class="starter-button starter-button--ghost">Change note</button>',
      '    </div>',
      '  </section>',
      '  <section class="starter-grid">',
      '    <article class="starter-card starter-card--feature">',
      '      <span class="starter-card__label">Page type</span>',
      `      <h2>${escapeHtml(plan.surface.label)}</h2>`,
      `      <p>${escapeHtml(plan.surface.summary)}</p>`,
      '    </article>',
      '    <article class="starter-card">',
      '      <span class="starter-card__label">Status</span>',
      `      <p class="starter-stat" id="starter-note-text">${escapeHtml(hostLabel)} will be created by Sites.</p>`,
      '    </article>',
      '    <article class="starter-card">',
      '      <span class="starter-card__label">What gets created</span>',
      '      <ul class="starter-plan-list">',
      planItems,
      '      </ul>',
      '    </article>',
      '  </section>',
      '</main>',
    ].join('\n'),
    css: [
      ':root {',
      '  --starter-accent: #d9472f;',
      '  --starter-ink: #111318;',
      '  --starter-muted: #5d6471;',
      '  --starter-paper: #f6f1e8;',
      '  --starter-panel: rgba(255, 255, 255, 0.72);',
      '}',
      '* { box-sizing: border-box; }',
      'html, body { margin: 0; min-height: 100%; }',
      'body {',
      "  font-family: 'Avenir Next', 'Segoe UI', sans-serif;",
      '  background:',
      '    radial-gradient(circle at top left, rgba(217, 71, 47, 0.18), transparent 32%),',
      '    linear-gradient(160deg, #f7f3eb 0%, #f3ede3 48%, #ebe2d4 100%);',
      '  color: var(--starter-ink);',
      '  overflow-x: hidden;',
      '}',
      '.starter-shell {',
      '  min-height: 100vh;',
      '  padding: clamp(28px, 6vw, 56px);',
      '  display: grid;',
      '  gap: 20px;',
      '  align-content: center;',
      '  min-width: 0;',
      '}',
      '.starter-hero,',
      '.starter-card {',
      '  min-width: 0;',
      '  border: 1px solid rgba(17, 19, 24, 0.08);',
      '  border-radius: 26px;',
      '  background: var(--starter-panel);',
      '  backdrop-filter: blur(10px);',
      '  box-shadow: 0 18px 44px rgba(17, 19, 24, 0.08);',
      '}',
      '.starter-hero {',
      '  padding: clamp(24px, 4vw, 40px);',
      '  display: grid;',
      '  gap: 16px;',
      '}',
      '.starter-kicker,',
      '.starter-card__label {',
      '  margin: 0;',
      '  font-size: 12px;',
      '  font-weight: 700;',
      '  letter-spacing: 0.18em;',
      '  text-transform: uppercase;',
      '  color: var(--starter-muted);',
      '}',
      '.starter-hero h1,',
      '.starter-host,',
      '.starter-card h2,',
      '.starter-card p {',
      '  margin: 0;',
      '}',
      '.starter-hero h1 {',
      '  max-width: 100%;',
      '  overflow-wrap: anywhere;',
      '  word-break: break-word;',
      '  font-size: clamp(26px, 6vw, 58px);',
      '  line-height: 0.96;',
      '}',
      '.starter-host {',
      "  font-family: 'SFMono-Regular', 'Menlo', monospace;",
      '  max-width: 100%;',
      '  overflow-wrap: anywhere;',
      '  color: var(--starter-muted);',
      '  font-size: clamp(14px, 2vw, 18px);',
      '  line-height: 1.35;',
      '}',
      '.starter-lede {',
      '  max-width: 48ch;',
      '  font-size: clamp(16px, 2vw, 19px);',
      '  line-height: 1.55;',
      '  color: var(--starter-muted);',
      '}',
      '.starter-actions {',
      '  display: flex;',
      '  flex-wrap: wrap;',
      '  gap: 12px;',
      '}',
      '.starter-button {',
      '  min-height: 44px;',
      '  padding: 0 18px;',
      '  border-radius: 999px;',
      '  border: 1px solid transparent;',
      '  background: var(--starter-accent);',
      '  color: white;',
      '  font: inherit;',
      '  font-weight: 700;',
      '  cursor: pointer;',
      '  transition: transform 140ms ease, opacity 140ms ease, background 140ms ease;',
      '}',
      '.starter-button:hover {',
      '  transform: translateY(-1px);',
      '}',
      '.starter-button--ghost {',
      '  border-color: rgba(17, 19, 24, 0.12);',
      '  background: rgba(255, 255, 255, 0.78);',
      '  color: var(--starter-ink);',
      '}',
      '.starter-grid {',
      '  display: grid;',
      '  grid-template-columns: repeat(3, minmax(0, 1fr));',
      '  gap: 16px;',
      '}',
      '.starter-card {',
      '  padding: 22px;',
      '  display: grid;',
      '  gap: 12px;',
      '}',
      '.starter-card--feature {',
      '  grid-column: span 2;',
      '}',
      '.starter-card h2 {',
      '  font-size: clamp(22px, 3vw, 34px);',
      '  line-height: 1.02;',
      '}',
      '.starter-card p {',
      '  color: var(--starter-muted);',
      '  line-height: 1.55;',
      '}',
      '.starter-plan-list {',
      '  margin: 0;',
      '  padding-left: 18px;',
      '  color: var(--starter-muted);',
      '  line-height: 1.55;',
      '  overflow-wrap: anywhere;',
      '}',
      '.starter-stat {',
      "  font-family: 'SFMono-Regular', 'Menlo', monospace;",
      '  font-size: 15px;',
      '  color: var(--starter-ink) !important;',
      '}',
      '@media (max-width: 760px) {',
      '  .starter-shell {',
      '    padding: 22px;',
      '  }',
      '  .starter-grid {',
      '    grid-template-columns: 1fr;',
      '  }',
      '  .starter-card--feature {',
      '    grid-column: span 1;',
      '  }',
      '  .starter-hero h1 {',
      '    max-width: none;',
      '  }',
      '}',
    ].join('\n'),
    js: [
      "const accents = ['#d9472f', '#1367d4', '#0e8f64', '#8e44d6'];",
      'const notes = [',
      `  '${hostLabel} will be created by Sites.',`,
      "  'Edit index.html when you need a different layout or behavior.',",
      "  'Use Create Site to publish this starter.',",
      "  'Replace this text with the purpose of the site.',",
      '];',
      'const root = document.documentElement;',
      "const noteEl = document.getElementById('starter-note-text');",
      'let accentIndex = 0;',
      'let noteIndex = 0;',
      "document.getElementById('starter-theme')?.addEventListener('click', () => {",
      '  accentIndex = (accentIndex + 1) % accents.length;',
      "  root.style.setProperty('--starter-accent', accents[accentIndex]);",
      '});',
      "document.getElementById('starter-note')?.addEventListener('click', () => {",
      '  noteIndex = (noteIndex + 1) % notes.length;',
      '  if (noteEl) {',
      '    noteEl.textContent = notes[noteIndex];',
      '  }',
      '});',
    ].join('\n'),
  };
}

function buildComposerToolAppStarterSource(siteId = '') {
  const normalizedSiteId = sanitizeSiteIdInput(siteId) || 'my-tool';
  const hostLabel = `${normalizedSiteId}.${BASE_DOMAIN}`;
  const plan = buildComposerGeneratedPlan(normalizedSiteId);
  const planItems = buildComposerPlanListHtml(plan);

  return {
    html: [
      '<main class="tool-app-shell">',
      '  <header class="tool-app-topbar">',
      '    <div>',
      '      <p class="tool-app-kicker">Tool / App</p>',
      `      <h1>${escapeHtml(normalizedSiteId)}</h1>`,
      `      <p class="tool-app-host">${escapeHtml(hostLabel)}</p>`,
      '    </div>',
      '    <div class="tool-app-actions">',
      '      <button type="button" class="tool-app-button" id="tool-run">Run</button>',
      '      <button type="button" class="tool-app-button tool-app-button--ghost" id="tool-reset">Reset</button>',
      '    </div>',
      '  </header>',
      '  <section class="tool-app-workspace">',
      '    <aside class="tool-app-sidebar" aria-label="Workspace navigation">',
      '      <button type="button" class="tool-nav-item is-active" data-tool-panel="overview">Overview</button>',
      '      <button type="button" class="tool-nav-item" data-tool-panel="inputs">Inputs</button>',
      '      <button type="button" class="tool-nav-item" data-tool-panel="output">Output</button>',
      '    </aside>',
      '    <section class="tool-app-main">',
      '      <nav class="tool-app-tabs" aria-label="Tool modes">',
      '        <button type="button" class="tool-tab is-active" data-tool-mode="draft">Draft</button>',
      '        <button type="button" class="tool-tab" data-tool-mode="review">Review</button>',
      '        <button type="button" class="tool-tab" data-tool-mode="ship">Ship</button>',
      '      </nav>',
      '      <div class="tool-app-pane" id="tool-pane">',
      '        <p class="tool-app-kicker">Active panel</p>',
      `        <h2>${escapeHtml(plan.surface.label)}</h2>`,
      '        <p>This starter has an app workspace: navigation rail, mode tabs, action bar, main pane, and status footer.</p>',
      '        <label class="tool-field">Input <input id="tool-input" type="text" value="Replace this with the first real setting"></label>',
      '        <pre id="tool-output">Ready.</pre>',
      '      </div>',
      '    </section>',
      '    <aside class="tool-app-inspector" aria-label="Inspector">',
      '      <p class="tool-app-kicker">Build settings</p>',
      '      <ul class="tool-plan-list">',
      planItems,
      '      </ul>',
      '    </aside>',
      '  </section>',
      '  <footer class="tool-app-status" id="tool-status">Idle</footer>',
      '</main>',
    ].join('\n'),
    css: [
      ':root {',
      '  --tool-ink: #151922;',
      '  --tool-muted: #5d6676;',
      '  --tool-line: #d7dde7;',
      '  --tool-panel: #ffffff;',
      '  --tool-rail: #f1f4f8;',
      '  --tool-accent: #0c7a72;',
      '}',
      '* { box-sizing: border-box; }',
      'html, body { margin: 0; min-height: 100%; }',
      'body {',
      "  font-family: 'Inter', 'Segoe UI', system-ui, sans-serif;",
      '  color: var(--tool-ink);',
      '  background: #e9eef5;',
      '}',
      '.tool-app-shell {',
      '  min-height: 100vh;',
      '  display: grid;',
      '  grid-template-rows: auto 1fr auto;',
      '}',
      '.tool-app-topbar {',
      '  min-height: 82px;',
      '  padding: 16px 20px;',
      '  display: flex;',
      '  align-items: center;',
      '  justify-content: space-between;',
      '  gap: 16px;',
      '  border-bottom: 1px solid var(--tool-line);',
      '  background: var(--tool-panel);',
      '}',
      '.tool-app-kicker {',
      '  margin: 0;',
      '  font-size: 12px;',
      '  font-weight: 800;',
      '  text-transform: uppercase;',
      '  color: var(--tool-muted);',
      '}',
      '.tool-app-topbar h1, .tool-app-host, .tool-app-pane h2, .tool-app-pane p {',
      '  margin: 0;',
      '}',
      '.tool-app-topbar h1 {',
      '  margin-top: 2px;',
      '  font-size: 28px;',
      '  line-height: 1;',
      '  overflow-wrap: anywhere;',
      '}',
      '.tool-app-host {',
      '  margin-top: 6px;',
      '  color: var(--tool-muted);',
      "  font-family: 'SFMono-Regular', 'Menlo', monospace;",
      '  font-size: 13px;',
      '  overflow-wrap: anywhere;',
      '}',
      '.tool-app-actions { display: flex; gap: 10px; flex-wrap: wrap; }',
      '.tool-app-button, .tool-tab, .tool-nav-item {',
      '  border: 1px solid transparent;',
      '  border-radius: 8px;',
      '  font: inherit;',
      '  font-weight: 800;',
      '  cursor: pointer;',
      '}',
      '.tool-app-button {',
      '  min-height: 42px;',
      '  padding: 0 16px;',
      '  background: var(--tool-accent);',
      '  color: #fff;',
      '}',
      '.tool-app-button--ghost {',
      '  background: #fff;',
      '  color: var(--tool-ink);',
      '  border-color: var(--tool-line);',
      '}',
      '.tool-app-workspace {',
      '  min-height: 0;',
      '  display: grid;',
      '  grid-template-columns: 220px minmax(0, 1fr) minmax(220px, 300px);',
      '}',
      '.tool-app-sidebar, .tool-app-inspector {',
      '  min-width: 0;',
      '  padding: 14px;',
      '  background: var(--tool-rail);',
      '  border-right: 1px solid var(--tool-line);',
      '}',
      '.tool-app-inspector {',
      '  border-right: 0;',
      '  border-left: 1px solid var(--tool-line);',
      '}',
      '.tool-nav-item {',
      '  width: 100%;',
      '  min-height: 42px;',
      '  margin-bottom: 8px;',
      '  padding: 0 12px;',
      '  text-align: left;',
      '  background: transparent;',
      '  color: var(--tool-muted);',
      '}',
      '.tool-nav-item.is-active {',
      '  background: var(--tool-panel);',
      '  color: var(--tool-ink);',
      '  border-color: var(--tool-line);',
      '}',
      '.tool-app-main {',
      '  min-width: 0;',
      '  min-height: 0;',
      '  display: grid;',
      '  grid-template-rows: auto 1fr;',
      '  background: #f8fafc;',
      '}',
      '.tool-app-tabs {',
      '  padding: 10px 14px 0;',
      '  display: flex;',
      '  gap: 8px;',
      '  border-bottom: 1px solid var(--tool-line);',
      '}',
      '.tool-tab {',
      '  min-height: 38px;',
      '  padding: 0 14px;',
      '  background: transparent;',
      '  color: var(--tool-muted);',
      '  border-color: var(--tool-line);',
      '  border-bottom-color: transparent;',
      '  border-radius: 8px 8px 0 0;',
      '}',
      '.tool-tab.is-active {',
      '  color: var(--tool-ink);',
      '  background: var(--tool-panel);',
      '}',
      '.tool-app-pane {',
      '  min-width: 0;',
      '  padding: clamp(18px, 4vw, 34px);',
      '  display: grid;',
      '  align-content: start;',
      '  gap: 14px;',
      '  overflow: auto;',
      '}',
      '.tool-field {',
      '  display: grid;',
      '  gap: 8px;',
      '  max-width: 520px;',
      '  color: var(--tool-muted);',
      '  font-weight: 800;',
      '}',
      '.tool-field input {',
      '  min-height: 44px;',
      '  padding: 0 12px;',
      '  border: 1px solid var(--tool-line);',
      '  border-radius: 8px;',
      '  font: inherit;',
      '  color: var(--tool-ink);',
      '}',
      '#tool-output {',
      '  margin: 0;',
      '  min-height: 130px;',
      '  padding: 14px;',
      '  overflow: auto;',
      '  border-radius: 8px;',
      '  background: #151922;',
      '  color: #f7f8fb;',
      '  line-height: 1.5;',
      '}',
      '.tool-plan-list {',
      '  margin: 12px 0 0;',
      '  padding-left: 18px;',
      '  color: var(--tool-muted);',
      '  line-height: 1.55;',
      '  overflow-wrap: anywhere;',
      '}',
      '.tool-app-status {',
      '  min-height: 36px;',
      '  padding: 8px 14px;',
      '  border-top: 1px solid var(--tool-line);',
      '  background: var(--tool-panel);',
      '  color: var(--tool-muted);',
      "  font-family: 'SFMono-Regular', 'Menlo', monospace;",
      '  font-size: 12px;',
      '}',
      '@media (max-width: 920px) {',
      '  .tool-app-workspace { grid-template-columns: 170px minmax(0, 1fr); }',
      '  .tool-app-inspector { grid-column: 1 / -1; border-left: 0; border-top: 1px solid var(--tool-line); }',
      '}',
      '@media (max-width: 680px) {',
      '  .tool-app-topbar { align-items: stretch; flex-direction: column; }',
      '  .tool-app-workspace { grid-template-columns: 1fr; }',
      '  .tool-app-sidebar { display: flex; gap: 8px; overflow-x: auto; border-right: 0; border-bottom: 1px solid var(--tool-line); }',
      '  .tool-nav-item { min-width: 132px; margin-bottom: 0; }',
      '  .tool-app-tabs { overflow-x: auto; }',
      '}',
    ].join('\n'),
    js: [
      `const toolHost = ${JSON.stringify(hostLabel)};`,
      "const toolTabs = Array.from(document.querySelectorAll('[data-tool-mode]'));",
      "const toolNavItems = Array.from(document.querySelectorAll('[data-tool-panel]'));",
      "const toolInput = document.getElementById('tool-input');",
      "const toolOutput = document.getElementById('tool-output');",
      "const toolStatus = document.getElementById('tool-status');",
      'let activeMode = "draft";',
      'let activePanel = "overview";',
      'function renderToolState(eventLabel = "ready") {',
      '  toolTabs.forEach((tab) => tab.classList.toggle("is-active", tab.dataset.toolMode === activeMode));',
      '  toolNavItems.forEach((item) => item.classList.toggle("is-active", item.dataset.toolPanel === activePanel));',
      '  if (toolStatus) toolStatus.textContent = `${activeMode}/${activePanel} - ${eventLabel}`;',
      '  if (toolOutput) toolOutput.textContent = JSON.stringify({ host: toolHost, mode: activeMode, panel: activePanel, input: toolInput?.value || "" }, null, 2);',
      '}',
      'toolTabs.forEach((tab) => tab.addEventListener("click", () => { activeMode = tab.dataset.toolMode || "draft"; renderToolState("mode changed"); }));',
      'toolNavItems.forEach((item) => item.addEventListener("click", () => { activePanel = item.dataset.toolPanel || "overview"; renderToolState("panel changed"); }));',
      'toolInput?.addEventListener("input", () => renderToolState("input changed"));',
      'document.getElementById("tool-run")?.addEventListener("click", () => renderToolState("run complete"));',
      'document.getElementById("tool-reset")?.addEventListener("click", () => { activeMode = "draft"; activePanel = "overview"; if (toolInput) toolInput.value = "Replace this with the first real setting"; renderToolState("reset"); });',
      'window.addEventListener("tv-tail:command", (event) => { if (event.detail?.command === "refresh" || event.detail?.command === "run") renderToolState("remote command"); });',
      'renderToolState();',
    ].join('\n'),
  };
}

function buildComposerApiFrontdoorStarterSource(siteId = '') {
  const normalizedSiteId = sanitizeSiteIdInput(siteId) || 'my-api';
  const hostLabel = `${normalizedSiteId}.${BASE_DOMAIN}`;
  const plan = buildComposerGeneratedPlan(normalizedSiteId);
  const planItems = buildComposerPlanListHtml(plan);
  const apiOrigin = `https://${hostLabel}`;
  const routes = [
    { method: 'GET', path: '/api/health', purpose: 'Health check for monitors and deploy verification.' },
    { method: 'GET', path: '/api/items', purpose: 'List endpoint for the first resource.' },
    { method: 'POST', path: '/api/items', purpose: 'Create endpoint once the backend exists.' },
    { method: 'GET', path: '/api/items/{id}', purpose: 'Detail endpoint with a stable identifier.' },
  ];

  return {
    html: [
      '<main class="api-frontdoor-shell">',
      '  <header class="api-frontdoor-hero">',
      '    <p class="api-frontdoor-kicker">API Front Door</p>',
      `    <h1>${escapeHtml(normalizedSiteId)}</h1>`,
      `    <p class="api-frontdoor-host">${escapeHtml(apiOrigin)}</p>`,
      '    <div class="api-frontdoor-actions">',
      '      <a class="api-frontdoor-button" href="#routes">Routes</a>',
      '      <button type="button" class="api-frontdoor-button api-frontdoor-button--ghost" id="api-copy-health">Copy health curl</button>',
      '    </div>',
      '  </header>',
      '  <section class="api-frontdoor-layout">',
      '    <aside class="api-frontdoor-sidebar">',
      '      <p class="api-frontdoor-kicker">Build settings</p>',
      '      <ul class="api-plan-list">',
      planItems,
      '      </ul>',
      '    </aside>',
      '    <section class="api-frontdoor-main">',
      '      <section class="api-health-panel" aria-label="Health check">',
      '        <div>',
      '          <p class="api-frontdoor-kicker">Health</p>',
      '          <h2>Ready for /api/health</h2>',
      '          <p>This is a static front door. Wire the backend when the API contract is ready.</p>',
      '        </div>',
      '        <pre id="api-health-curl"></pre>',
      '      </section>',
      '      <section class="api-route-panel" id="routes" aria-label="Backend API routes">',
      '        <div class="api-route-panel__head">',
      '          <div>',
      '            <p class="api-frontdoor-kicker">Backend API routes</p>',
      '            <h2>Endpoint index</h2>',
      '          </div>',
      '          <button type="button" class="api-frontdoor-button api-frontdoor-button--ghost" id="api-copy-routes">Copy route JSON</button>',
      '        </div>',
      '        <div class="api-route-table" role="table" aria-label="API routes">',
      '          <div class="api-route-row api-route-row--head" role="row"><span>Method</span><span>Path</span><span>Purpose</span></div>',
      ...routes.map((route) => `          <div class="api-route-row" role="row"><span class="api-method">${escapeHtml(route.method)}</span><code>${escapeHtml(route.path)}</code><span>${escapeHtml(route.purpose)}</span></div>`),
      '        </div>',
      '      </section>',
      '      <section class="api-console-panel" aria-label="API console">',
      '        <p class="api-frontdoor-kicker">Console</p>',
      '        <pre id="api-console">No requests sent from this static shell.</pre>',
      '      </section>',
      '    </section>',
      '  </section>',
      '</main>',
    ].join('\n'),
    css: [
      ':root {',
      '  --api-ink: #142033;',
      '  --api-muted: #607086;',
      '  --api-line: #d8e1ec;',
      '  --api-paper: #f4f8fb;',
      '  --api-panel: #ffffff;',
      '  --api-accent: #1d6fbc;',
      '}',
      '* { box-sizing: border-box; }',
      'html, body { margin: 0; min-height: 100%; }',
      'body {',
      "  font-family: 'Inter', 'Segoe UI', system-ui, sans-serif;",
      '  background: var(--api-paper);',
      '  color: var(--api-ink);',
      '}',
      '.api-frontdoor-shell {',
      '  min-height: 100vh;',
      '  display: grid;',
      '  grid-template-rows: auto 1fr;',
      '}',
      '.api-frontdoor-hero {',
      '  padding: clamp(24px, 5vw, 48px);',
      '  display: grid;',
      '  gap: 14px;',
      '  border-bottom: 1px solid var(--api-line);',
      '  background: var(--api-panel);',
      '}',
      '.api-frontdoor-kicker {',
      '  margin: 0;',
      '  color: var(--api-muted);',
      '  font-size: 12px;',
      '  font-weight: 800;',
      '  text-transform: uppercase;',
      '}',
      '.api-frontdoor-hero h1, .api-frontdoor-host, .api-health-panel h2, .api-health-panel p, .api-route-panel h2 {',
      '  margin: 0;',
      '}',
      '.api-frontdoor-hero h1 {',
      '  font-size: clamp(34px, 7vw, 68px);',
      '  line-height: 0.96;',
      '  overflow-wrap: anywhere;',
      '}',
      '.api-frontdoor-host {',
      "  font-family: 'SFMono-Regular', 'Menlo', monospace;",
      '  color: var(--api-muted);',
      '  overflow-wrap: anywhere;',
      '}',
      '.api-frontdoor-actions { display: flex; flex-wrap: wrap; gap: 10px; }',
      '.api-frontdoor-button {',
      '  min-height: 42px;',
      '  padding: 0 14px;',
      '  border: 1px solid transparent;',
      '  border-radius: 8px;',
      '  display: inline-flex;',
      '  align-items: center;',
      '  justify-content: center;',
      '  background: var(--api-accent);',
      '  color: #fff;',
      '  font: inherit;',
      '  font-weight: 800;',
      '  text-decoration: none;',
      '  cursor: pointer;',
      '}',
      '.api-frontdoor-button--ghost {',
      '  background: #fff;',
      '  color: var(--api-ink);',
      '  border-color: var(--api-line);',
      '}',
      '.api-frontdoor-layout {',
      '  display: grid;',
      '  grid-template-columns: minmax(220px, 300px) minmax(0, 1fr);',
      '  min-height: 0;',
      '}',
      '.api-frontdoor-sidebar {',
      '  padding: 18px;',
      '  border-right: 1px solid var(--api-line);',
      '  background: #edf3f8;',
      '}',
      '.api-plan-list {',
      '  margin: 12px 0 0;',
      '  padding-left: 18px;',
      '  color: var(--api-muted);',
      '  line-height: 1.55;',
      '  overflow-wrap: anywhere;',
      '}',
      '.api-frontdoor-main {',
      '  min-width: 0;',
      '  padding: clamp(18px, 4vw, 34px);',
      '  display: grid;',
      '  align-content: start;',
      '  gap: 16px;',
      '}',
      '.api-health-panel, .api-route-panel, .api-console-panel {',
      '  padding: 18px;',
      '  border: 1px solid var(--api-line);',
      '  border-radius: 10px;',
      '  background: var(--api-panel);',
      '  display: grid;',
      '  gap: 14px;',
      '}',
      '.api-health-panel {',
      '  grid-template-columns: minmax(0, 1fr) minmax(220px, 420px);',
      '  align-items: start;',
      '}',
      '.api-route-panel__head {',
      '  display: flex;',
      '  align-items: center;',
      '  justify-content: space-between;',
      '  gap: 12px;',
      '}',
      '.api-route-table {',
      '  overflow: auto;',
      '  border: 1px solid var(--api-line);',
      '  border-radius: 8px;',
      '}',
      '.api-route-row {',
      '  min-width: 680px;',
      '  display: grid;',
      '  grid-template-columns: 92px minmax(180px, 260px) minmax(0, 1fr);',
      '  gap: 12px;',
      '  padding: 10px 12px;',
      '  border-top: 1px solid var(--api-line);',
      '  align-items: center;',
      '}',
      '.api-route-row:first-child { border-top: 0; }',
      '.api-route-row--head {',
      '  color: var(--api-muted);',
      '  font-size: 12px;',
      '  font-weight: 800;',
      '  text-transform: uppercase;',
      '  background: #f8fbfd;',
      '}',
      '.api-route-row code, .api-method, #api-health-curl, #api-console {',
      "  font-family: 'SFMono-Regular', 'Menlo', monospace;",
      '}',
      '.api-method {',
      '  color: var(--api-accent);',
      '  font-weight: 900;',
      '}',
      '#api-health-curl, #api-console {',
      '  margin: 0;',
      '  overflow: auto;',
      '  padding: 12px;',
      '  border-radius: 8px;',
      '  background: #142033;',
      '  color: #f7f8fb;',
      '  line-height: 1.5;',
      '}',
      '@media (max-width: 860px) {',
      '  .api-frontdoor-layout, .api-health-panel { grid-template-columns: 1fr; }',
      '  .api-frontdoor-sidebar { border-right: 0; border-bottom: 1px solid var(--api-line); }',
      '  .api-route-panel__head { align-items: stretch; flex-direction: column; }',
      '}',
    ].join('\n'),
    js: [
      `const apiOrigin = ${JSON.stringify(apiOrigin)};`,
      `const apiRoutes = ${JSON.stringify(routes)};`,
      "const healthCurlEl = document.getElementById('api-health-curl');",
      "const consoleEl = document.getElementById('api-console');",
      'const healthCurl = `curl -fsSL ${apiOrigin}/api/health`; ',
      'if (healthCurlEl) healthCurlEl.textContent = healthCurl;',
      'function writeApiConsole(message) { if (consoleEl) consoleEl.textContent = message; }',
      'async function copyText(value, label) {',
      '  try { await navigator.clipboard.writeText(value); writeApiConsole(`${label} copied.`); }',
      '  catch (_error) { writeApiConsole(value); }',
      '}',
      'document.getElementById("api-copy-health")?.addEventListener("click", () => copyText(healthCurl, "Health curl"));',
      'document.getElementById("api-copy-routes")?.addEventListener("click", () => copyText(JSON.stringify(apiRoutes, null, 2), "Route JSON"));',
      'window.addEventListener("tv-tail:command", (event) => { if (event.detail?.command === "health") writeApiConsole(`Health route: ${apiOrigin}/api/health`); });',
      'writeApiConsole("Backend API routes are documented. Connect the real API when the backend contract is ready.");',
    ].join('\n'),
  };
}

function buildComposerGameStarterSource(siteId = '') {
  const normalizedSiteId = sanitizeSiteIdInput(siteId) || 'my-game';
  const hostLabel = `${normalizedSiteId}.${BASE_DOMAIN}`;
  return {
    html: [
      '<main class="game-shell">',
      '  <header class="game-hud">',
      `    <span class="game-hud__title">${escapeHtml(normalizedSiteId)}</span>`,
      '    <span class="game-hud__score">Score <strong id="game-score">0</strong></span>',
      `    <span class="game-hud__host">${escapeHtml(hostLabel)}</span>`,
      '  </header>',
      '  <canvas id="game-canvas" class="game-canvas" aria-label="Game playfield"></canvas>',
      '  <p class="game-hint">Arrow keys / WASD to move &middot; touch &amp; drag on mobile. Edit script.js to make this your game.</p>',
      '</main>',
    ].join('\n'),
    css: [
      'html, body { margin: 0; height: 100%; background: #0b1020; color: #f0f3ff;',
      "  font-family: 'Segoe UI', system-ui, -apple-system, sans-serif; overflow: hidden; }",
      '.game-shell { display: grid; grid-template-rows: auto 1fr auto; height: 100vh; gap: 8px; padding: 12px; box-sizing: border-box; }',
      '.game-hud { display: flex; justify-content: space-between; align-items: center; padding: 8px 14px;',
      '  background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px;',
      '  font-size: 13px; letter-spacing: 0.04em; text-transform: uppercase; }',
      '.game-hud__score strong { font-size: 18px; margin-left: 6px; color: #ffd66b; }',
      '.game-hud__host { opacity: 0.55; font-size: 11px; }',
      '.game-canvas { width: 100%; height: 100%; background: radial-gradient(circle at 50% 40%, #182148 0%, #0b1020 70%);',
      '  border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; display: block; }',
      '.game-hint { margin: 0; text-align: center; opacity: 0.5; font-size: 12px; }',
      '@media (max-width: 600px) { .game-hud { flex-wrap: wrap; gap: 6px; font-size: 11px; } }',
    ].join('\n'),
    js: [
      "const canvas = document.getElementById('game-canvas');",
      "const scoreEl = document.getElementById('game-score');",
      "const ctx = canvas.getContext('2d');",
      'const state = { x: 0, y: 0, vx: 0, vy: 0, w: 32, h: 32, score: 0, lastTs: 0 };',
      'const keys = new Set();',
      'function resize() { const r = canvas.getBoundingClientRect(); canvas.width = r.width; canvas.height = r.height;',
      '  if (state.x === 0 && state.y === 0) { state.x = canvas.width / 2 - state.w / 2; state.y = canvas.height / 2 - state.h / 2; } }',
      "window.addEventListener('resize', resize); resize();",
      "window.addEventListener('keydown', (e) => keys.add(e.key.toLowerCase()));",
      "window.addEventListener('keyup', (e) => keys.delete(e.key.toLowerCase()));",
      'let touchAim = null;',
      "canvas.addEventListener('pointerdown', (e) => { touchAim = { x: e.clientX, y: e.clientY }; });",
      "canvas.addEventListener('pointermove', (e) => { if (touchAim) { touchAim.x = e.clientX; touchAim.y = e.clientY; } });",
      "canvas.addEventListener('pointerup', () => { touchAim = null; });",
      'function step(ts) {',
      '  const dt = state.lastTs ? Math.min(0.05, (ts - state.lastTs) / 1000) : 0;',
      '  state.lastTs = ts;',
      '  const speed = 280;',
      '  let ax = 0, ay = 0;',
      "  if (keys.has('arrowleft') || keys.has('a')) ax -= 1;",
      "  if (keys.has('arrowright') || keys.has('d')) ax += 1;",
      "  if (keys.has('arrowup') || keys.has('w')) ay -= 1;",
      "  if (keys.has('arrowdown') || keys.has('s')) ay += 1;",
      '  if (touchAim) {',
      '    const r = canvas.getBoundingClientRect();',
      '    const cx = r.left + state.x + state.w / 2, cy = r.top + state.y + state.h / 2;',
      '    const dx = touchAim.x - cx, dy = touchAim.y - cy;',
      '    const len = Math.hypot(dx, dy) || 1;',
      '    ax += dx / len; ay += dy / len;',
      '  }',
      '  const mag = Math.hypot(ax, ay);',
      '  if (mag > 0) { state.vx = (ax / mag) * speed; state.vy = (ay / mag) * speed; }',
      '  else { state.vx *= 0.85; state.vy *= 0.85; }',
      '  state.x = Math.max(0, Math.min(canvas.width - state.w, state.x + state.vx * dt));',
      '  state.y = Math.max(0, Math.min(canvas.height - state.h, state.y + state.vy * dt));',
      '  state.score += dt * (Math.abs(state.vx) + Math.abs(state.vy)) * 0.01;',
      '  scoreEl.textContent = Math.floor(state.score);',
      '  ctx.fillStyle = \'rgba(11, 16, 32, 0.35)\'; ctx.fillRect(0, 0, canvas.width, canvas.height);',
      '  ctx.fillStyle = \'#ffd66b\'; ctx.fillRect(state.x, state.y, state.w, state.h);',
      '  requestAnimationFrame(step);',
      '}',
      'requestAnimationFrame(step);',
    ].join('\n'),
  };
}

function buildComposerSlackBotStarterSource(siteId = '') {
  const normalizedSiteId = sanitizeSiteIdInput(siteId) || 'my-slack-bot';
  const hostLabel = `${normalizedSiteId}.${BASE_DOMAIN}`;
  const botName = normalizedSiteId
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ') || 'Mullmania Bot';
  const commandName = `/${normalizedSiteId.replace(/[^a-z0-9]/g, '').slice(0, 24) || 'mullbot'}`;
  const manifest = {
    display_information: {
      name: botName,
      description: `Slack bot scaffold for ${hostLabel}.`,
    },
    features: {
      bot_user: {
        display_name: botName,
        always_online: false,
      },
      slash_commands: [
        {
          command: commandName,
          description: `Run ${botName}`,
          usage_hint: 'status',
          url: `https://${hostLabel}/slack/commands`,
        },
      ],
    },
    oauth_config: {
      scopes: {
        bot: ['app_mentions:read', 'chat:write', 'commands'],
      },
    },
    settings: {
      event_subscriptions: {
        request_url: `https://${hostLabel}/slack/events`,
        bot_events: ['app_mention'],
      },
      interactivity: {
        is_enabled: true,
        request_url: `https://${hostLabel}/slack/interactions`,
      },
      socket_mode_enabled: false,
    },
  };
  const serverSource = [
    'import { App } from "@slack/bolt";',
    '',
    'const app = new App({',
    '  token: process.env.SLACK_BOT_TOKEN,',
    '  signingSecret: process.env.SLACK_SIGNING_SECRET,',
    '  socketMode: process.env.SLACK_SOCKET_MODE === "1",',
    '  appToken: process.env.SLACK_APP_TOKEN,',
    '});',
    '',
    `app.command("${commandName}", async ({ command, ack, respond }) => {`,
    '  await ack();',
    '  await respond({',
    '    response_type: "ephemeral",',
    `    text: \`${botName} heard \${command.text || "status"}.\`,`,
    '  });',
    '});',
    '',
    'app.event("app_mention", async ({ event, say }) => {',
    `  await say(\`Hey <@\${event.user}>. ${botName} is connected.\`);`,
    '});',
    '',
    'await app.start(Number(process.env.PORT) || 3000);',
    `console.log("${botName} is running");`,
  ].join('\n');

  return {
    html: [
      '<main class="slack-bot-shell">',
      '  <section class="slack-bot-hero">',
      '    <p class="slack-bot-kicker">Slack bot starter</p>',
      `    <h1>${escapeHtml(botName)}</h1>`,
      `    <p class="slack-bot-lede">Deploy this static site as the bot front door, then run the Bolt server scaffold with Slack app credentials.</p>`,
      '    <div class="slack-bot-actions">',
      '      <a class="slack-bot-button" href="https://api.slack.com/apps" target="_blank" rel="noreferrer">Create Slack app</a>',
      '      <a class="slack-bot-button slack-bot-button--ghost" href="https://slack.dev/bolt-js/" target="_blank" rel="noreferrer">Bolt docs</a>',
      '    </div>',
      '  </section>',
      '  <section class="slack-bot-grid" aria-label="Slack bot scaffold">',
      '    <article class="slack-bot-panel slack-bot-panel--command">',
      '      <span class="slack-bot-label">Slash command</span>',
      `      <strong id="slack-command-name">${escapeHtml(commandName)}</strong>`,
      '      <p>Use this as the first command, then point Slack at the server endpoint from your bot runtime.</p>',
      '    </article>',
      '    <article class="slack-bot-panel">',
      '      <span class="slack-bot-label">Packages</span>',
      '      <ul class="slack-bot-list">',
      '        <li>@slack/bolt</li>',
      '        <li>@slack/web-api</li>',
      '        <li>@slack/socket-mode</li>',
      '      </ul>',
      '    </article>',
      '    <article class="slack-bot-panel">',
      '      <span class="slack-bot-label">Bot settings</span>',
      '      <label>Bot name <input id="bot-name-input" type="text" autocomplete="off"></label>',
      '      <label>Command <input id="command-input" type="text" autocomplete="off"></label>',
      '    </article>',
      '    <article class="slack-bot-panel slack-bot-panel--wide">',
      '      <span class="slack-bot-label">Slack app manifest</span>',
      '      <pre id="manifest-preview"></pre>',
      '    </article>',
      '    <article class="slack-bot-panel slack-bot-panel--wide">',
      '      <span class="slack-bot-label">Bolt server scaffold</span>',
      '      <pre id="server-preview"></pre>',
      '    </article>',
      '  </section>',
      '</main>',
    ].join('\n'),
    css: [
      ':root {',
      '  --slack-ink: #1d1c1d;',
      '  --slack-muted: #616061;',
      '  --slack-border: #d9d7dc;',
      '  --slack-green: #2eb67d;',
      '  --slack-blue: #36c5f0;',
      '  --slack-yellow: #ecb22e;',
      '  --slack-red: #e01e5a;',
      '  --slack-paper: #f8f8fa;',
      '}',
      '* { box-sizing: border-box; }',
      'html, body { margin: 0; min-height: 100%; }',
      'body {',
      "  font-family: 'Avenir Next', 'Segoe UI', sans-serif;",
      '  background: linear-gradient(135deg, #ffffff 0%, #f8f8fa 50%, #eef7f4 100%);',
      '  color: var(--slack-ink);',
      '}',
      '.slack-bot-shell {',
      '  min-height: 100vh;',
      '  padding: clamp(24px, 5vw, 56px);',
      '  display: grid;',
      '  gap: 22px;',
      '}',
      '.slack-bot-hero, .slack-bot-panel {',
      '  border: 1px solid var(--slack-border);',
      '  border-radius: 18px;',
      '  background: rgba(255, 255, 255, 0.88);',
      '  box-shadow: 0 18px 42px rgba(29, 28, 29, 0.08);',
      '}',
      '.slack-bot-hero {',
      '  padding: clamp(24px, 4vw, 44px);',
      '  border-top: 8px solid var(--slack-blue);',
      '  display: grid;',
      '  gap: 14px;',
      '}',
      '.slack-bot-kicker, .slack-bot-label {',
      '  margin: 0;',
      '  color: var(--slack-muted);',
      '  font-size: 12px;',
      '  font-weight: 800;',
      '  letter-spacing: 0.14em;',
      '  text-transform: uppercase;',
      '}',
      '.slack-bot-hero h1 {',
      '  margin: 0;',
      '  max-width: 12ch;',
      '  font-size: clamp(38px, 6vw, 72px);',
      '  line-height: 0.98;',
      '}',
      '.slack-bot-lede, .slack-bot-panel p {',
      '  margin: 0;',
      '  max-width: 66ch;',
      '  color: var(--slack-muted);',
      '  font-size: 17px;',
      '  line-height: 1.55;',
      '}',
      '.slack-bot-actions { display: flex; flex-wrap: wrap; gap: 12px; }',
      '.slack-bot-button {',
      '  min-height: 42px;',
      '  padding: 10px 16px;',
      '  border-radius: 8px;',
      '  background: var(--slack-ink);',
      '  color: #fff;',
      '  font-weight: 800;',
      '  text-decoration: none;',
      '}',
      '.slack-bot-button--ghost {',
      '  background: #fff;',
      '  color: var(--slack-ink);',
      '  border: 1px solid var(--slack-border);',
      '}',
      '.slack-bot-grid {',
      '  display: grid;',
      '  grid-template-columns: repeat(3, minmax(0, 1fr));',
      '  gap: 16px;',
      '}',
      '.slack-bot-panel {',
      '  padding: 20px;',
      '  display: grid;',
      '  align-content: start;',
      '  gap: 12px;',
      '}',
      '.slack-bot-panel--command { border-top: 6px solid var(--slack-green); }',
      '.slack-bot-panel--wide { grid-column: span 3; }',
      '#slack-command-name { font-size: 30px; }',
      '.slack-bot-list { margin: 0; padding-left: 20px; line-height: 1.8; color: var(--slack-muted); }',
      '.slack-bot-panel label { display: grid; gap: 6px; color: var(--slack-muted); font-weight: 700; }',
      '.slack-bot-panel input {',
      '  min-height: 42px;',
      '  padding: 8px 10px;',
      '  border: 1px solid var(--slack-border);',
      '  border-radius: 8px;',
      '  font: inherit;',
      '  color: var(--slack-ink);',
      '}',
      '.slack-bot-panel pre {',
      '  margin: 0;',
      '  max-height: 300px;',
      '  overflow: auto;',
      '  padding: 16px;',
      '  border-radius: 8px;',
      '  background: #1d1c1d;',
      '  color: #f8f8fa;',
      '  font-size: 13px;',
      '  line-height: 1.5;',
      '}',
      '@media (max-width: 820px) {',
      '  .slack-bot-grid { grid-template-columns: 1fr; }',
      '  .slack-bot-panel--wide { grid-column: span 1; }',
      '  .slack-bot-hero h1 { max-width: none; }',
      '}',
    ].join('\n'),
    js: [
      `const siteHost = ${JSON.stringify(hostLabel)};`,
      `const initialBotName = ${JSON.stringify(botName)};`,
      `const initialCommand = ${JSON.stringify(commandName)};`,
      `const manifestTemplate = ${JSON.stringify(manifest, null, 2)};`,
      `const serverTemplate = ${JSON.stringify(serverSource)};`,
      "const botInput = document.getElementById('bot-name-input');",
      "const commandInput = document.getElementById('command-input');",
      "const commandNameEl = document.getElementById('slack-command-name');",
      "const manifestPreview = document.getElementById('manifest-preview');",
      "const serverPreview = document.getElementById('server-preview');",
      '',
      'function normalizeCommand(value) {',
      "  const compact = String(value || '').trim().toLowerCase().replace(/[^a-z0-9_-]/g, '');",
      "  return `/${compact || 'mullbot'}`;",
      '}',
      '',
      'function renderScaffold() {',
      "  const botName = String(botInput?.value || initialBotName).trim() || initialBotName;",
      '  const command = normalizeCommand(commandInput?.value || initialCommand);',
      '  const manifest = JSON.parse(JSON.stringify(manifestTemplate));',
      '  manifest.display_information.name = botName;',
      '  manifest.display_information.description = `Slack bot scaffold for ${siteHost}.`;',
      '  manifest.features.bot_user.display_name = botName;',
      '  manifest.features.slash_commands[0].command = command;',
      '  manifest.features.slash_commands[0].description = `Run ${botName}`;',
      '  if (commandNameEl) { commandNameEl.textContent = command; }',
      '  if (manifestPreview) { manifestPreview.textContent = JSON.stringify(manifest, null, 2); }',
      '  if (serverPreview) {',
      '    serverPreview.textContent = serverTemplate',
      '      .split(initialBotName).join(botName)',
      '      .split(initialCommand).join(command);',
      '  }',
      '}',
      '',
      'if (botInput) { botInput.value = initialBotName; }',
      'if (commandInput) { commandInput.value = initialCommand; }',
      "botInput?.addEventListener('input', renderScaffold);",
      "commandInput?.addEventListener('input', renderScaffold);",
      'renderScaffold();',
    ].join('\n'),
  };
}

function buildComposerDevelopmentCanonStarterSource(siteId = '', themeId = state.composer.themeId) {
  const normalizedSiteId = sanitizeSiteIdInput(siteId) || 'my-site';
  const hostLabel = `${normalizedSiteId}.${BASE_DOMAIN}`;
  const sharedUiOrigin = uiOrigin();
  const themeOption = getComposerThemeOption(themeId);
  const frontdoorDocument = {
    repo: '',
    name: normalizedSiteId,
    title: hostLabel,
    description: `Starter page using the ${themeOption.label} theme. Replace this text with the repo or project this site represents.`,
    deployMode: 'canonical-frontdoor',
    primaryLanguage: 'json',
    theme: themeOption.id,
    status: 'starter',
    links: [
      { label: 'Canon JSON', href: DEVELOPMENT_CANON_DOCS.canonJson, icon: 'ti ti-braces', variant: 'primary' },
      { label: 'Quickstart', href: DEVELOPMENT_CANON_DOCS.quickstart, icon: 'ti ti-rocket', variant: 'primary' },
      { label: 'Sync Guide', href: DEVELOPMENT_CANON_DOCS.syncGuide, icon: 'ti ti-route' },
      { label: 'Canon UI', href: DEVELOPMENT_CANON_DOCS.uiSection, icon: 'ti ti-layout-dashboard' },
      { label: 'Example Frontdoor', href: DEVELOPMENT_CANON_DOCS.exampleFrontdoor, icon: 'ti ti-file-code' },
    ],
    canon: {
      version: DEVELOPMENT_CANON_VERSION,
      source: DEVELOPMENT_CANON_DOCS.canonJson,
      profile: 'frontdoor-v1',
      summary: 'Starter page with links to the live development canon docs.',
      syncPrompt: 'Look at the new canon and sync yourself with canon.',
      checklist: [
        'Replace the placeholder title and description.',
        'Add the real repo or project links.',
        'Add screenshots or notes after the site has real content.',
      ],
      proof: {
        note: 'Sites creates the page. Repo metadata and screenshots still need to be added by you.',
      },
    },
  };

  return {
    html: [
      '<div id="app">',
      '  <main style="padding:48px;font-family:system-ui,sans-serif">',
      `    <h1>${escapeHtml(hostLabel)}</h1>`,
      '    <p>Starter page with links to the development canon docs.</p>',
      `    <p><a href="${escapeHtml(DEVELOPMENT_CANON_DOCS.canonJson)}">Canon JSON</a> <a href="${escapeHtml(DEVELOPMENT_CANON_DOCS.syncGuide)}">Quickstart</a></p>`,
      '  </main>',
      '</div>',
      `<script src="${sharedUiOrigin}/ui.js" data-ui-theme="${themeOption.id}"></script>`,
    ].join('\n'),
    css: [
      'html, body {',
      '  margin: 0;',
      '  min-height: 100%;',
      '}',
    ].join('\n'),
    js: [
      `const uiOrigin = ${JSON.stringify(sharedUiOrigin)};`,
      `const sourceUrl = ${JSON.stringify(DEVELOPMENT_CANON_DOCS.exampleFrontdoor)};`,
      `const frontdoorDocument = ${JSON.stringify(frontdoorDocument)};`,
      `document.title = ${JSON.stringify(hostLabel)};`,
      'const init = async () => {',
      '  await window.UI.ready();',
      '  try {',
      "    await window.UI.frontdoor.mount('#app', { document: frontdoorDocument, uiOrigin, sourceUrl });",
      '  } catch (error) {',
      "    console.error('[starter-development-canon] render failed', error);",
      '    document.body.textContent = error.message || String(error);',
      '  }',
      '};',
      'if (window.UI?.ready) {',
      '  init();',
      '} else {',
      "  window.addEventListener('ui-ready', init, { once: true });",
      '}',
    ].join('\n'),
  };
}

function buildComposerStarterSource(siteId = '', options = {}) {
  const recipeId = normalizeComposerRecipeId(options.recipeId ?? state.composer.recipeId);
  if (recipeId === 'tv-app') {
    return buildComposerTvStarterSource(siteId, options.tvConfig ?? state.composer.tvConfig);
  }
  if (recipeId === 'copy-site') {
    return buildComposerCopySiteStarterSource(siteId, options.copyEntry ?? getComposerCopySourceEntry());
  }

  const starterId = normalizeComposerStarterId(options.starterId ?? state.composer.starterId);
  state.composer.surfaceId = normalizeComposerSurfaceId(options.surfaceId ?? state.composer.surfaceId);
  state.composer.addonIds = normalizeComposerAddonIds(options.addonIds ?? state.composer.addonIds);
  state.composer.dataSourceId = normalizeComposerDataSourceId(options.dataSourceId ?? state.composer.dataSourceId);
  const surfaceId = state.composer.surfaceId;
  const addonIds = state.composer.addonIds;
  const dataSourceId = state.composer.dataSourceId;
  const themeId = normalizeComposerThemeId(options.themeId ?? state.composer.themeId);
  let source;

  if (starterId === COMPOSER_SLACK_BOT_STARTER_ID) {
    source = buildComposerSlackBotStarterSource(siteId);
  } else if (starterId === 'game') {
    source = buildComposerGameStarterSource(siteId);
  } else if (starterId === COMPOSER_UI_SITE_STARTER_ID) {
    source = buildComposerUiSiteStarterSource(siteId, themeId);
  } else if (surfaceId === 'tool-app') {
    source = buildComposerToolAppStarterSource(siteId);
  } else if (surfaceId === 'api-frontdoor') {
    source = buildComposerApiFrontdoorStarterSource(siteId);
  } else {
    source = buildComposerBasicExampleStarterSource(siteId);
  }

  return decorateComposerStarterSource(source, siteId, { addonIds, dataSourceId });
}

function buildComposerTvStarterSource(siteId = '', value = state.composer.tvConfig) {
  const normalizedSiteId = sanitizeSiteIdInput(siteId) || 'my-site';
  const hostLabel = `${normalizedSiteId}.${BASE_DOMAIN}`;
  const config = normalizeComposerTvConfig(value);
  const mediaBundle = getComposerTvMediaBundle(config.mediaBundleId);
  const tvTailChannelId = `${normalizedSiteId}-tv-tail`;
  const tvTailHubUrl = `https://signalargh.${BASE_DOMAIN}/hub`;
  const tvTailTelestrateUrl = `${COMPOSER_TV_TAIL_TELESTRATE_URL}?channel=${encodeURIComponent(tvTailChannelId)}&brand=tv-tail`;
  const templateConfig = {
    ...config,
    hostLabel,
    mediaBundle,
    hintLabel: 'Arrow keys move focus. Enter launches. Backspace returns.',
    tvTail: {
      enabled: config.tvTailEnabled,
      channelId: tvTailChannelId,
      userId: `screen-${normalizedSiteId}`,
      hubUrl: tvTailHubUrl,
      signalrClientUrl: SIGNALR_CLIENT_URL,
      logTapUrl: COMPOSER_TV_TAIL_LOG_TAP_URL,
      telestrateUrl: tvTailTelestrateUrl,
      stateTopic: COMPOSER_TV_TAIL_TOPIC_STATE,
      commandTopic: COMPOSER_TV_TAIL_TOPIC_COMMAND,
    },
  };

  return {
    html: [
      '<main class="tv-seed-shell">',
      '  <section class="tv-seed-hero">',
      '    <p class="tv-seed-eyebrow">TV app template</p>',
      `    <h1>${escapeHtml(config.appTitle)}</h1>`,
      `    <p class="tv-seed-lede">${escapeHtml(hostLabel)} uses a 10-foot launcher shell with the selected media bundle.</p>`,
      '    <div class="tv-seed-status-bar">',
      '      <span class="tv-seed-status-chip">TV app seed</span>',
      `      <span class="tv-seed-status-chip">${escapeHtml(mediaBundle.label)}</span>`,
      '      <span class="tv-seed-status-chip">10-foot keyboard nav</span>',
      ...(templateConfig.tvTail.enabled ? ['      <span class="tv-seed-status-chip">tv-tail remote</span>'] : []),
      '    </div>',
      '  </section>',
      '  <section class="tv-seed-launcher" id="tv-launcher">',
      '    <div class="tv-seed-launcher__head">',
      '      <p class="tv-seed-eyebrow">Launcher</p>',
      `      <p class="tv-seed-hint">${escapeHtml(templateConfig.hintLabel)}</p>`,
      '    </div>',
      '    <div class="tv-seed-grid" id="tv-launch-grid">',
      ...config.launcherLabels.flatMap((label, index) => [
        `      <button type="button" class="tv-launch-card${index === 0 ? ' is-selected' : ''}" data-tv-launch-index="${index}">`,
        `        <span class="tv-launch-card__index">0${index + 1}</span>`,
        `        <span class="tv-launch-card__label">${escapeHtml(label)}</span>`,
        '      </button>',
      ]),
      '    </div>',
      '  </section>',
      '  <section class="tv-stage is-hidden" id="tv-stage">',
      '    <div class="tv-stage__media">',
      '      <video id="tv-stage-video" loop playsinline preload="metadata"></video>',
      '      <div class="tv-stage__preview" id="tv-stage-preview">',
      '        <div class="tv-stage__preview-card">',
      '          <p class="tv-seed-eyebrow">Preview mode</p>',
      '          <h2>Inline composer preview</h2>',
      '          <p>The live modal preview stays fast and deterministic. Real media loads after deploy.</p>',
      '        </div>',
      '      </div>',
      '      <button type="button" class="tv-stage__play" id="tv-stage-play">Play</button>',
      '    </div>',
      '    <div class="tv-stage__chrome">',
      '      <div class="tv-stage__meta">',
      `        <p id="tv-now-playing">${escapeHtml(config.nowPlayingLabel)}: ${escapeHtml(mediaBundle.displayName)}</p>`,
      `        <span class="tv-stage__bundle">${escapeHtml(mediaBundle.label)}</span>`,
      '      </div>',
      `      <button type="button" class="tv-stage__ad${config.adBadgeEnabled ? '' : ' is-hidden'}" id="tv-stage-ad">${escapeHtml(config.adBadgeText)}</button>`,
      '    </div>',
      '    <div class="tv-ad-overlay is-hidden" id="tv-ad-overlay">',
      '      <div class="tv-ad-overlay__card">',
      '        <button type="button" class="tv-ad-overlay__close" id="tv-ad-close" aria-label="Close ad">&times;</button>',
      '        <img id="tv-ad-image" alt="Advertisement preview">',
      '      </div>',
      '    </div>',
      '  </section>',
      ...(templateConfig.tvTail.enabled ? [
        '  <section class="tv-tail-panel" id="tv-tail-panel">',
        '    <div>',
        '      <p class="tv-seed-eyebrow">tv-tail</p>',
        `      <p class="tv-tail-copy">SignalArgh channel <strong>${escapeHtml(tvTailChannelId)}</strong></p>`,
        '    </div>',
        `    <a class="tv-tail-link" id="tv-tail-link" href="${escapeHtml(tvTailTelestrateUrl)}" target="_blank" rel="noreferrer">Open Telestrate</a>`,
        '    <span class="tv-tail-status" id="tv-tail-status">preview only</span>',
        '  </section>',
      ] : []),
      '</main>',
    ].join('\n'),
    css: [
      ':root {',
      `  --tv-accent-start: ${mediaBundle.accentStart};`,
      `  --tv-accent-end: ${mediaBundle.accentEnd};`,
      '  --tv-border: rgba(255, 255, 255, 0.14);',
      '  --tv-panel: rgba(9, 14, 24, 0.82);',
      '  --tv-panel-soft: rgba(255, 255, 255, 0.08);',
      '  --tv-text: #f7f5ef;',
      '  --tv-muted: rgba(247, 245, 239, 0.72);',
      '}',
      '* { box-sizing: border-box; }',
      'html, body { margin: 0; min-height: 100%; }',
      'body {',
      "  font-family: 'Avenir Next', 'Segoe UI', sans-serif;",
      '  background:',
      '    radial-gradient(circle at top left, rgba(255, 183, 3, 0.24), transparent 30%),',
      '    radial-gradient(circle at top right, rgba(61, 90, 241, 0.28), transparent 32%),',
      '    linear-gradient(160deg, #04070c 0%, #08111c 44%, #121f2f 100%);',
      '  color: var(--tv-text);',
      '}',
      '.tv-seed-shell { min-height: 100vh; padding: clamp(24px, 4vw, 48px); display: grid; gap: 22px; }',
      '.tv-seed-hero, .tv-seed-launcher, .tv-stage, .tv-tail-panel { border: 1px solid var(--tv-border); border-radius: 28px; background: var(--tv-panel); box-shadow: 0 32px 70px rgba(0, 0, 0, 0.32); backdrop-filter: blur(16px); }',
      '.tv-seed-hero { padding: clamp(24px, 4vw, 40px); display: grid; gap: 16px; }',
      '.tv-seed-eyebrow, .tv-seed-hint, .tv-launch-card__index, .tv-stage__bundle { margin: 0; font-size: 12px; font-weight: 700; letter-spacing: 0.18em; text-transform: uppercase; color: var(--tv-muted); }',
      '.tv-seed-hero h1, .tv-seed-lede, .tv-seed-hint, .tv-stage__meta p, .tv-stage__preview-card h2, .tv-stage__preview-card p { margin: 0; }',
      '.tv-seed-hero h1 { font-size: clamp(42px, 8vw, 84px); line-height: 0.92; max-width: 10ch; }',
      '.tv-seed-lede, .tv-stage__preview-card p { max-width: 58ch; font-size: clamp(17px, 2vw, 22px); line-height: 1.55; color: var(--tv-muted); }',
      '.tv-seed-status-bar { display: flex; flex-wrap: wrap; gap: 10px; }',
      '.tv-seed-status-chip { min-height: 34px; padding: 0 14px; border: 1px solid rgba(255, 255, 255, 0.12); border-radius: 999px; display: inline-flex; align-items: center; color: var(--tv-muted); background: rgba(255, 255, 255, 0.06); }',
      '.tv-tail-panel { padding: 18px 20px; display: flex; align-items: center; justify-content: space-between; gap: 16px; flex-wrap: wrap; }',
      '.tv-tail-copy { margin: 4px 0 0; color: var(--tv-muted); }',
      '.tv-tail-copy strong { color: var(--tv-text); }',
      '.tv-tail-link, .tv-tail-status { min-height: 38px; padding: 0 14px; border-radius: 999px; display: inline-flex; align-items: center; font-size: 14px; font-weight: 800; }',
      '.tv-tail-link { color: #09111c; background: linear-gradient(135deg, var(--tv-accent-start), var(--tv-accent-end)); text-decoration: none; }',
      '.tv-tail-status { color: var(--tv-muted); border: 1px solid rgba(255, 255, 255, 0.12); background: rgba(255, 255, 255, 0.06); }',
      '.tv-seed-launcher { padding: clamp(20px, 3vw, 28px); display: grid; gap: 18px; }',
      '.tv-seed-launcher__head { display: flex; align-items: center; justify-content: space-between; gap: 16px; }',
      '.tv-seed-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; }',
      '.tv-launch-card { min-height: 170px; padding: 22px; border-radius: 24px; border: 1px solid rgba(255, 255, 255, 0.12); background: linear-gradient(145deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.02)); color: var(--tv-text); display: grid; align-content: space-between; text-align: left; cursor: pointer; transition: transform 160ms ease, border-color 160ms ease, box-shadow 160ms ease; }',
      '.tv-launch-card.is-selected, .tv-launch-card:focus-visible { outline: none; transform: translateY(-2px) scale(1.01); border-color: rgba(255, 183, 3, 0.62); box-shadow: 0 0 0 2px rgba(255, 183, 3, 0.28), 0 22px 40px rgba(0, 0, 0, 0.28); }',
      '.tv-launch-card__label { font-size: clamp(24px, 3vw, 34px); font-weight: 700; line-height: 1.04; }',
      '.tv-stage { min-height: 420px; padding: 18px; display: grid; gap: 14px; }',
      '.tv-stage__media { position: relative; min-height: 320px; border-radius: 24px; overflow: hidden; background: radial-gradient(circle at top left, rgba(61, 90, 241, 0.22), transparent 30%), #03060c; }',
      '.tv-stage__media video, .tv-stage__preview { position: absolute; inset: 0; width: 100%; height: 100%; }',
      '.tv-stage__preview { display: grid; place-items: center; background: linear-gradient(135deg, rgba(61, 90, 241, 0.22), rgba(255, 183, 3, 0.12)); }',
      '.tv-stage__preview-card { width: min(88%, 540px); padding: 26px; border-radius: 22px; background: rgba(4, 7, 12, 0.78); border: 1px solid rgba(255, 255, 255, 0.1); display: grid; gap: 12px; }',
      '.tv-stage__play { position: absolute; left: 24px; bottom: 24px; min-height: 46px; padding: 0 18px; border: 0; border-radius: 999px; background: linear-gradient(135deg, var(--tv-accent-start), var(--tv-accent-end)); color: #09111c; font: inherit; font-weight: 800; cursor: pointer; }',
      '.tv-stage__chrome { display: flex; align-items: center; justify-content: space-between; gap: 16px; }',
      '.tv-stage__meta { display: grid; gap: 6px; }',
      '.tv-stage__meta p { font-size: clamp(18px, 2vw, 24px); }',
      '.tv-stage__ad { min-height: 44px; padding: 0 16px; border: 1px solid rgba(255, 255, 255, 0.12); border-radius: 999px; background: rgba(255, 255, 255, 0.08); color: var(--tv-text); font: inherit; font-weight: 700; cursor: pointer; }',
      '.tv-ad-overlay { position: fixed; inset: 0; padding: 28px; display: grid; place-items: center; background: rgba(1, 3, 7, 0.86); }',
      '.tv-ad-overlay__card { position: relative; width: min(100%, 980px); padding: 18px; border-radius: 26px; background: rgba(7, 12, 20, 0.94); border: 1px solid rgba(255, 255, 255, 0.12); box-shadow: 0 28px 50px rgba(0, 0, 0, 0.34); }',
      '.tv-ad-overlay__card img { display: block; width: 100%; max-height: 76vh; object-fit: contain; border-radius: 18px; }',
      '.tv-ad-overlay__close { position: absolute; top: -12px; right: -12px; width: 42px; height: 42px; border: 0; border-radius: 999px; background: white; color: #08111c; font-size: 28px; cursor: pointer; }',
      '.is-hidden { display: none !important; }',
      '@media (max-width: 860px) {',
      '  .tv-seed-grid { grid-template-columns: 1fr; }',
      '  .tv-seed-launcher__head, .tv-stage__chrome { align-items: start; flex-direction: column; }',
      '  .tv-launch-card { min-height: 132px; }',
      '  .tv-stage__media { min-height: 240px; }',
      '}',
    ].join('\n'),
    js: [
      `const tvTemplateConfig = ${JSON.stringify(templateConfig)};`,
      "const tvState = { launchIndex: 0, stageOpen: false, adOpen: false, previewMode: location.protocol === 'about:' || String(location.href || '').startsWith('about:srcdoc') };",
      "const launchButtons = Array.from(document.querySelectorAll('[data-tv-launch-index]'));",
      "const launcherEl = document.getElementById('tv-launcher');",
      "const stageEl = document.getElementById('tv-stage');",
      "const videoEl = document.getElementById('tv-stage-video');",
      "const previewEl = document.getElementById('tv-stage-preview');",
      "const playButtonEl = document.getElementById('tv-stage-play');",
      "const nowPlayingEl = document.getElementById('tv-now-playing');",
      "const adButtonEl = document.getElementById('tv-stage-ad');",
      "const adOverlayEl = document.getElementById('tv-ad-overlay');",
      "const adCloseEl = document.getElementById('tv-ad-close');",
      "const adImageEl = document.getElementById('tv-ad-image');",
      "const mediaBundle = tvTemplateConfig.mediaBundle;",
      "const tvTailConfig = tvTemplateConfig.tvTail || { enabled: false };",
      "const tvTailStatusEl = document.getElementById('tv-tail-status');",
      "let tvTailConnection = null;",
      "let tvTailConnected = false;",
      'function setTvTailStatus(label) { if (tvTailStatusEl) { tvTailStatusEl.textContent = label; } }',
      'function buildSignalRWebSocketOptions() { const options = { withCredentials: false }; if (window.signalR?.HttpTransportType?.WebSockets) { options.transport = window.signalR.HttpTransportType.WebSockets; options.skipNegotiation = true; } return options; }',
      'function loadTvTailScript(src, marker) { return new Promise((resolve, reject) => { if (!src) { resolve(); return; } const existing = document.querySelector(`script[data-tv-tail-marker="${marker}"]`); if (existing) { existing.addEventListener("load", resolve, { once: true }); existing.addEventListener("error", reject, { once: true }); if (window.signalR?.HubConnectionBuilder || marker === "log-tap") resolve(); return; } const script = document.createElement("script"); script.src = src; script.async = true; script.dataset.tvTailMarker = marker; script.addEventListener("load", resolve, { once: true }); script.addEventListener("error", reject, { once: true }); document.head.appendChild(script); }); }',
      'function loadTvTailLogTap() { if (!tvTailConfig.enabled || tvState.previewMode || window.__logTap) return; window.LOG_TAP_APP_ID = tvTailConfig.channelId; window.LOG_TAP_CHANNEL = "tv-logs"; window.LOG_TAP_HUB = tvTailConfig.hubUrl.replace(/\\/hub$/, ""); loadTvTailScript(tvTailConfig.logTapUrl, "log-tap").catch(() => {}); }',
      'function tvTailState(extra = {}) { return { type: "tv-tail.state", siteId: tvTemplateConfig.hostLabel, channelId: tvTailConfig.channelId, appTitle: tvTemplateConfig.appTitle, launchIndex: tvState.launchIndex, launchLabel: tvTemplateConfig.launcherLabels[tvState.launchIndex] || "", stageOpen: tvState.stageOpen, adOpen: tvState.adOpen, nowPlaying: `${tvTemplateConfig.nowPlayingLabel}: ${mediaBundle.displayName}`, url: location.href, at: new Date().toISOString(), ...extra }; }',
      'function tvTailDispatchLocal(topic, payload) { try { window.dispatchEvent(new CustomEvent("tv-tail:event", { detail: { topic, payload } })); } catch (_error) {} }',
      'async function tvTailBroadcast(topic, extra = {}) { if (!tvTailConfig.enabled) return false; const payload = tvTailState(extra); tvTailDispatchLocal(topic, payload); if (!tvTailConnected || !tvTailConnection) return false; try { await tvTailConnection.invoke("SendCustomMessage", tvTailConfig.channelId, topic || tvTailConfig.stateTopic, JSON.stringify(payload)); return true; } catch (_error) { setTvTailStatus("local only"); return false; } }',
      'function parseTvTailPayload(raw) { if (typeof raw !== "string") return raw; try { return JSON.parse(raw); } catch (_error) { return raw; } }',
      'function handleTvTailCommand(raw) { const payload = parseTvTailPayload(raw); const command = typeof payload === "string" ? payload : String(payload?.command || payload?.type || "").replace(/^tv-tail\\.|^telestrate\\./, ""); if (!command) return; const normalized = command.toLowerCase(); if (normalized === "left" || normalized === "arrowleft") moveSelection("left"); if (normalized === "right" || normalized === "arrowright") moveSelection("right"); if (normalized === "up" || normalized === "arrowup") moveSelection("up"); if (normalized === "down" || normalized === "arrowdown") moveSelection("down"); if (normalized === "enter" || normalized === "select" || normalized === "launch") enterStage(Number.isFinite(Number(payload?.index)) ? Number(payload.index) : tvState.launchIndex); if (normalized === "back" || normalized === "escape" || normalized === "home") exitStage(); if (normalized === "ad") openAdOverlay(); }',
      'async function connectTvTail() { if (!tvTailConfig.enabled) return; loadTvTailLogTap(); if (tvState.previewMode) { setTvTailStatus("preview only"); tvTailBroadcast(tvTailConfig.stateTopic, { previewMode: true }); return; } try { setTvTailStatus("connecting"); await loadTvTailScript(tvTailConfig.signalrClientUrl, "signalr"); if (!window.signalR?.HubConnectionBuilder) throw new Error("SignalR client unavailable"); tvTailConnection = new window.signalR.HubConnectionBuilder().withUrl(`${tvTailConfig.hubUrl}?channelId=${encodeURIComponent(tvTailConfig.channelId)}&userId=${encodeURIComponent(tvTailConfig.userId)}`, buildSignalRWebSocketOptions()).withAutomaticReconnect().build(); tvTailConnection.on("customMessage", (message) => { if (!message || typeof message !== "object") return; if (message.topic === tvTailConfig.commandTopic || message.topic === "command") handleTvTailCommand(message.message); }); tvTailConnection.on("systemNotification", () => setTvTailStatus("connected")); tvTailConnection.onreconnected(() => { tvTailConnected = true; setTvTailStatus("connected"); tvTailBroadcast(tvTailConfig.stateTopic, { event: "reconnected" }); }); tvTailConnection.onreconnecting(() => { tvTailConnected = false; setTvTailStatus("reconnecting"); }); tvTailConnection.onclose(() => { tvTailConnected = false; setTvTailStatus("local only"); }); await tvTailConnection.start(); tvTailConnected = true; setTvTailStatus("connected"); await tvTailBroadcast(tvTailConfig.stateTopic, { event: "ready" }); } catch (error) { tvTailConnected = false; setTvTailStatus("local only"); console.info("[tv-tail] remote unavailable", error); } }',
      'function renderLaunchSelection() { launchButtons.forEach((button, index) => button.classList.toggle("is-selected", index === tvState.launchIndex)); }',
      'function updateNowPlaying() { if (nowPlayingEl) { nowPlayingEl.textContent = `${tvTemplateConfig.nowPlayingLabel}: ${mediaBundle.displayName}`; } }',
      'function closeAdOverlay() { const wasOpen = tvState.adOpen; adOverlayEl?.classList.add("is-hidden"); tvState.adOpen = false; if (wasOpen) { void tvTailBroadcast(tvTailConfig.stateTopic, { event: "ad-closed" }); } }',
      'function openAdOverlay() { if (!tvTemplateConfig.adBadgeEnabled || !adOverlayEl) { return; } if (adImageEl) { adImageEl.src = tvState.previewMode ? "" : mediaBundle.adImagePath; adImageEl.alt = `${tvTemplateConfig.appTitle} advertisement`; } adOverlayEl.classList.remove("is-hidden"); tvState.adOpen = true; void tvTailBroadcast(tvTailConfig.stateTopic, { event: "ad-opened" }); }',
      'function exitStage() { const wasOpen = tvState.stageOpen; tvState.stageOpen = false; closeAdOverlay(); launcherEl?.classList.remove("is-hidden"); stageEl?.classList.add("is-hidden"); if (videoEl) { videoEl.pause(); videoEl.removeAttribute("src"); videoEl.load(); } previewEl?.classList.remove("is-hidden"); renderLaunchSelection(); if (wasOpen) { void tvTailBroadcast(tvTailConfig.stateTopic, { event: "stage-closed" }); } }',
      'function enterStage(index) { tvState.launchIndex = Math.max(0, Math.min(index, launchButtons.length - 1)); tvState.stageOpen = true; launcherEl?.classList.add("is-hidden"); stageEl?.classList.remove("is-hidden"); updateNowPlaying(); if (adButtonEl) { adButtonEl.classList.toggle("is-hidden", !tvTemplateConfig.adBadgeEnabled); } void tvTailBroadcast(tvTailConfig.stateTopic, { event: "stage-opened" }); if (tvState.previewMode || !videoEl) { previewEl?.classList.remove("is-hidden"); return; } previewEl?.classList.add("is-hidden"); videoEl.src = mediaBundle.videoPath; videoEl.muted = false; videoEl.load(); }',
      'function moveSelection(step) { const current = tvState.launchIndex; if (step === "left" && current % 2 === 1) tvState.launchIndex -= 1; if (step === "right" && current % 2 === 0 && current + 1 < launchButtons.length) tvState.launchIndex += 1; if (step === "up" && current >= 2) tvState.launchIndex -= 2; if (step === "down" && current + 2 < launchButtons.length) tvState.launchIndex += 2; renderLaunchSelection(); if (current !== tvState.launchIndex) { void tvTailBroadcast(tvTailConfig.stateTopic, { event: "selection-changed" }); } }',
      'window.addEventListener("message", (event) => { if (tvTailConfig.enabled) handleTvTailCommand(event.data); });',
      'window.addEventListener("hashchange", () => { const command = new URLSearchParams(String(location.hash || "").replace(/^#/, "")).get("tvCommand"); if (command) handleTvTailCommand(command); });',
      'renderLaunchSelection(); updateNowPlaying(); void connectTvTail();',
      'launchButtons.forEach((button, index) => button.addEventListener("click", () => enterStage(index)));',
      'playButtonEl?.addEventListener("click", async () => { if (!videoEl || tvState.previewMode) return; try { await videoEl.play(); } catch (error) { console.error("[tv-template] play failed", error); } });',
      'adButtonEl?.addEventListener("click", openAdOverlay);',
      'adCloseEl?.addEventListener("click", closeAdOverlay);',
      'adOverlayEl?.addEventListener("click", (event) => { if (event.target === adOverlayEl) { closeAdOverlay(); } });',
      'document.addEventListener("keydown", async (event) => { if (tvState.adOpen) { if (["Escape", "Backspace", "Enter"].includes(event.key)) { event.preventDefault(); closeAdOverlay(); } return; } if (!tvState.stageOpen) { if (event.key === "ArrowLeft") { event.preventDefault(); moveSelection("left"); } if (event.key === "ArrowRight") { event.preventDefault(); moveSelection("right"); } if (event.key === "ArrowUp") { event.preventDefault(); moveSelection("up"); } if (event.key === "ArrowDown") { event.preventDefault(); moveSelection("down"); } if (event.key === "Enter") { event.preventDefault(); enterStage(tvState.launchIndex); } return; } if (event.key === "Escape" || event.key === "Backspace") { event.preventDefault(); exitStage(); return; } if (event.key === "Enter" && !tvState.previewMode && videoEl) { event.preventDefault(); if (videoEl.paused) { try { await videoEl.play(); } catch (error) { console.error("[tv-template] play failed", error); } } else { videoEl.pause(); } } });',
    ].join('\n'),
  };
}

function buildComposerCopySiteStarterSource(siteId = '', entry = getComposerCopySourceEntry()) {
  const normalizedSiteId = sanitizeSiteIdInput(siteId) || 'my-site';
  const hostLabel = `${normalizedSiteId}.${BASE_DOMAIN}`;
  const sourceEntry = entry || null;
  const sourceTitle = sourceEntry ? (buildDisplayTitle(sourceEntry) || sourceEntry.siteId) : 'Choose a source site';
  const sourceHost = sourceEntry?.host || 'Search the catalog';
  const sourceSummary = sourceEntry?.description || sourceEntry?.notes?.[0] || 'Pick a source site. Sites will copy its hosted files and saved data into the target subdomain.';

  return {
    html: [
      '<main class="starter-shell starter-shell--copy">',
      '  <section class="starter-hero">',
      '    <p class="starter-kicker">Copy site</p>',
      `    <h1>${escapeHtml(hostLabel)}</h1>`,
      '    <p class="starter-lede">Sites will copy the source site into this subdomain. Use New Site instead if you want to edit the page first.</p>',
      '  </section>',
      '  <section class="starter-grid">',
      '    <article class="starter-card starter-card--feature">',
      '      <span class="starter-card__label">Selected source</span>',
      `      <h2>${escapeHtml(sourceTitle)}</h2>`,
      `      <p>${escapeHtml(sourceSummary)}</p>`,
      '    </article>',
      '    <article class="starter-card">',
      '      <span class="starter-card__label">Source host</span>',
      `      <p class="starter-stat">${escapeHtml(sourceHost)}</p>`,
      '    </article>',
      '    <article class="starter-card">',
      '      <span class="starter-card__label">What happens</span>',
      '      <p>Hosted files and saved data are copied as-is. The editor is disabled for this mode.</p>',
      '    </article>',
      '  </section>',
      '</main>',
    ].join('\n'),
    css: buildComposerBasicExampleStarterSource(siteId).css,
    js: "console.log('copy-site draft ready');",
  };
}

function setComposerEditorSource(source = {}) {
  composerHtmlEl.value = source.html || '';
  composerCssEl.value = source.css || '';
  composerJsEl.value = source.js || '';
  state.composer.sourceFiles = normalizeComposerSourceFiles(source.files);
  syncComposerSourceFileButtons();
  updateComposerPreview();
}

function normalizeComposerSourceFiles(files) {
  if (!Array.isArray(files)) {
    return [];
  }
  return files
    .map((file) => ({
      id: normalizeComposerEditorPane(file?.id || file?.sourceKey),
      label: String(file?.label || file?.id || '').trim(),
      apiPath: String(file?.apiPath || '').trim(),
      writeApiPath: String(file?.writeApiPath || '').trim(),
      generates: String(file?.generates || '').trim(),
    }))
    .filter((file) => ['html', 'css', 'js'].includes(file.id));
}

function buildComposerFallbackSourceFiles(siteId = normalizeSiteId(composerSiteIdEl?.value || '')) {
  const safeSiteId = siteId || state.composer.loadedSiteId || 'site';
  const apiPath = `/api/source/${safeSiteId}`;
  const writeApiPath = `/api/deploy/${safeSiteId}`;
  return [
    { id: 'html', label: 'index.html', apiPath, writeApiPath, generates: 'index.html' },
    { id: 'css', label: 'styles.css', apiPath, writeApiPath, generates: 'index.html' },
    { id: 'js', label: 'script.js', apiPath, writeApiPath, generates: 'index.html' },
  ];
}

function getComposerSourceFiles(siteId = normalizeSiteId(composerSiteIdEl?.value || '')) {
  return state.composer.sourceFiles.length
    ? state.composer.sourceFiles
    : buildComposerFallbackSourceFiles(siteId);
}

function syncComposerSourceFileButtons() {
  const filesById = new Map(getComposerSourceFiles().map((file) => [file.id, file]));
  composerEditorFileButtons.forEach((button) => {
    const file = filesById.get(normalizeComposerEditorPane(button.dataset.composerEditorFile));
    if (!file) {
      return;
    }
    button.textContent = file.label || button.textContent;
    button.title = [
      file.label,
      file.apiPath ? `Read: ${file.apiPath}` : '',
      file.writeApiPath ? `Write: ${file.writeApiPath}` : '',
      file.generates ? `Generates: ${file.generates}` : '',
    ].filter(Boolean).join('\n');
  });
}

function seedComposerStarterDraft(siteId = '', options = {}) {
  const starter = buildComposerStarterSource(siteId, {
    recipeId: options.recipeId ?? state.composer.recipeId,
    starterId: options.starterId ?? state.composer.starterId,
    surfaceId: options.surfaceId ?? state.composer.surfaceId,
    addonIds: options.addonIds ?? state.composer.addonIds,
    dataSourceId: options.dataSourceId ?? state.composer.dataSourceId,
    themeId: options.themeId ?? state.composer.themeId,
    tvConfig: options.tvConfig ?? state.composer.tvConfig,
    copyEntry: options.copyEntry ?? getComposerCopySourceEntry(),
  });
  setComposerEditorSource(starter);
  state.composer.draftPreset = COMPOSER_DRAFT_PRESET_STARTER;
  state.composer.starterSiteId = sanitizeSiteIdInput(siteId);
  state.composer.loadedSiteId = '';
  resetComposerHistory();
  unlockComposerBuilder();
  syncComposerStarterControls();

}

function syncComposerStarterDraftWithSiteId() {
  if (state.composer.draftPreset !== COMPOSER_DRAFT_PRESET_STARTER || state.composer.loadingSource) {
    return false;
  }

  const nextSiteId = sanitizeSiteIdInput(composerSiteIdEl?.value || '');
  if (nextSiteId === state.composer.starterSiteId) {
    return false;
  }

  seedComposerStarterDraft(nextSiteId);
  return true;
}

function lockComposerBuilder(reason = 'manual-edit') {
  state.composer.builderLocked = true;
  state.composer.builderLockReason = reason;
}

function unlockComposerBuilder() {
  state.composer.builderLocked = false;
  state.composer.builderLockReason = '';
}

function markComposerDraftAsCustom() {
  if (state.composer.loadingSource || state.composer.draftPreset !== COMPOSER_DRAFT_PRESET_STARTER) {
    return;
  }

  state.composer.draftPreset = COMPOSER_DRAFT_PRESET_CUSTOM;
  state.composer.starterSiteId = '';
  lockComposerBuilder('manual-edit');
  syncComposerStarterControls();
}

function normalizeComposerEditorPane(pane) {
  const normalized = String(pane || '').trim().toLowerCase();
  return ['html', 'css', 'js'].includes(normalized) ? normalized : 'html';
}

function getComposerEditorPaneInput(pane = state.composer.editorPane) {
  const nextPane = normalizeComposerEditorPane(pane);
  if (nextPane === 'css') {
    return composerCssEl;
  }
  if (nextPane === 'js') {
    return composerJsEl;
  }
  return composerHtmlEl;
}

function focusComposerEditorPane(pane = state.composer.editorPane) {
  const input = getComposerEditorPaneInput(pane);
  if (!(input instanceof HTMLTextAreaElement)) {
    return;
  }

  input.focus();
  const end = input.value.length;
  input.setSelectionRange(end, end);
}

function setComposerEditorPane(pane, options = {}) {
  const nextPane = normalizeComposerEditorPane(pane);
  state.composer.editorPane = nextPane;

  composerEditorPaneButtons.forEach((button) => {
    const isActive = button.dataset.composerEditorPane === nextPane;
    button.classList.toggle('is-active', isActive);
    button.setAttribute('aria-selected', isActive ? 'true' : 'false');
    button.tabIndex = isActive ? 0 : -1;
  });
  composerEditorPanePanels.forEach((panel) => {
    const isActive = panel.dataset.composerEditorPanePanel === nextPane;
    panel.classList.toggle('is-hidden', !isActive);
  });
  composerEditorFileButtons.forEach((button) => {
    const isActive = button.dataset.composerEditorFile === nextPane;
    button.classList.toggle('is-active', isActive);
    button.classList.toggle('is-hidden', !isActive);
  });

  syncComposerInteractiveState();

  if (options.focus) {
    focusComposerEditorPane(nextPane);
  }
}

function focusComposerCredentialTarget(validation = null) {
  validation || validateComposerSiteId();
  composerSubmitButton.focus();
}

function openComposerAccessGateForAction(action, validation = null) {
  const nextValidation = validation || validateComposerSiteId();
  const normalizedAction = normalizeProtectedActionRequest(action);
  state.pendingProtectedAction = normalizedAction;
  openSettingsModal({
    focusOperatorKey: true,
    statusMessage: `${normalizedAction.label} needs the private operator key. Paste it below and continue.`,
    statusTone: 'warning',
  });
}

function clearComposerDeleteArm() {
  state.composer.deleteArmedSiteId = '';
}

function armComposerDelete(siteId) {
  state.composer.deleteArmedSiteId = String(siteId || '').trim();
}

function getComposerDeleteEntry(validation = null) {
  const nextValidation = validation || validateComposerSiteId();
  if (!nextValidation?.exists) {
    return null;
  }

  const existingEntry = findEntryBySiteId(nextValidation.siteId);
  return canDeleteDirectly(existingEntry) ? existingEntry : null;
}

function isComposerDeleteArmed(validation = null) {
  const nextValidation = validation || validateComposerSiteId();
  return Boolean(nextValidation?.siteId) && state.composer.deleteArmedSiteId === nextValidation.siteId;
}

function buildComposerDeleteStatus(validation = null) {
  const entry = getComposerDeleteEntry(validation);
  if (!entry) {
    const nextValidation = validation || validateComposerSiteId();
    const existingEntry = nextValidation?.exists ? findEntryBySiteId(nextValidation.siteId) : null;
    return {
      message: existingEntry
        ? getDeleteUnavailableMessage(existingEntry)
        : 'Pick an existing launchpad-only site before arming delete.',
      tone: 'warning',
    };
  }

  const targetUrl = entry.host ? `https://${entry.host}/` : entry.siteId;
  return {
    message: `Delete armed for ${targetUrl}. Submit will remove this site instead of overwriting it.`,
    tone: 'warning',
  };
}

function syncComposerDeleteControls(validation = null) {
  if (!composerDeleteToggleButton) {
    return;
  }

  const nextValidation = validation || validateComposerSiteId();
  const entry = getComposerDeleteEntry(nextValidation);
  const canDelete = Boolean(entry);

  if (!canDelete && state.composer.deleteArmedSiteId) {
    clearComposerDeleteArm();
  }

  composerDeleteToggleButton.classList.toggle('is-hidden', !canDelete);
  if (!canDelete) {
    return;
  }

  const armed = isComposerDeleteArmed(nextValidation);
  composerDeleteToggleButton.disabled = composerBuilderIsBusy();
  composerDeleteToggleButton.classList.toggle('secondary', !armed);
  composerDeleteToggleButton.classList.toggle('btn-danger', armed);
  composerDeleteToggleButton.setAttribute('aria-pressed', armed ? 'true' : 'false');
  composerDeleteToggleButton.title = armed
    ? `Submit will delete ${nextValidation.siteId}`
    : `Arm delete for ${nextValidation.siteId}`;
  composerDeleteToggleButton.innerHTML = armed
    ? '<i class="ti ti-alert-triangle"></i><span>Delete armed</span>'
    : '<i class="ti ti-trash"></i><span>Delete site</span>';
}

function syncComposerChrome(validation = null) {
  const nextValidation = validation || validateComposerSiteId();
  syncComposerStarterControls();
  syncComposerDeleteControls(nextValidation);
  syncComposerVsCodeButton(nextValidation);
  syncComposerHeader(nextValidation);
  updateComposerSubmit(nextValidation);
  return nextValidation;
}

function toggleComposerDeleteArm() {
  const validation = validateComposerSiteId();
  const entry = getComposerDeleteEntry(validation);
  if (!entry) {
    const existingEntry = validation?.exists ? findEntryBySiteId(validation.siteId) : null;
    updateComposerStatus(
      existingEntry ? getDeleteUnavailableMessage(existingEntry) : 'Pick an existing launchpad-only site before arming delete.',
      'warning',
    );
    return;
  }

  if (isComposerDeleteArmed(validation)) {
    clearComposerDeleteArm();
    syncComposerChrome(validation);
    const status = buildComposerOpenStatus(validation);
    updateComposerStatus(status.message, status.tone);
    return;
  }

  armComposerDelete(validation.siteId);
  syncComposerChrome(validation);
  const status = buildComposerDeleteStatus(validation);
  updateComposerStatus(status.message, status.tone);
}

function applyComposerSource(siteId, payload = {}) {
  state.composer.loadedSiteId = siteId;
  setComposerEditorSource(payload);
  state.composer.draftPreset = COMPOSER_DRAFT_PRESET_LOADED;
  state.composer.starterSiteId = '';
  lockComposerBuilder('loaded-site');
  syncComposerStarterControls();
}

function resetComposerHistory() {
  state.composer.history = {
    siteId: '',
    commits: [],
    index: -1,
    loading: false,
    sourceRequestId: (state.composer.history?.sourceRequestId || 0) + 1,
    sourceCache: {},
  };
  renderComposerHistory();
}

function formatComposerHistoryCommit(commit = null) {
  if (!commit) {
    return 'No history';
  }
  const label = commit.message || commit.shortSha || 'Saved version';
  if (!commit.committedAt) {
    return label;
  }
  const date = new Date(commit.committedAt);
  const dateLabel = Number.isNaN(date.getTime())
    ? ''
    : date.toLocaleString([], { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
  return dateLabel ? `${label} · ${dateLabel}` : label;
}

function renderComposerHistory() {
  const history = state.composer.history;
  const commits = history.commits || [];
  const hasHistory = commits.length > 0;
  composerHistoryEl?.classList.toggle('is-hidden', !hasHistory && !history.loading);
  if (composerHistorySliderEl) {
    composerHistorySliderEl.disabled = history.loading || commits.length <= 1;
    composerHistorySliderEl.min = '0';
    composerHistorySliderEl.max = String(Math.max(0, commits.length - 1));
    composerHistorySliderEl.value = String(Math.max(0, history.index));
  }
  if (composerHistoryLabelEl) {
    composerHistoryLabelEl.textContent = history.loading
      ? 'Loading history…'
      : formatComposerHistoryCommit(commits[history.index]);
  }
  if (composerHistoryCountEl) {
    composerHistoryCountEl.textContent = hasHistory
      ? `${history.index + 1} / ${commits.length}`
      : '';
  }
}

async function loadComposerHistory(siteId) {
  if (!state.apiBaseUrl || !siteId) {
    resetComposerHistory();
    return;
  }
  const requestId = state.composer.history.sourceRequestId + 1;
  state.composer.history = {
    siteId,
    commits: [],
    index: -1,
    loading: true,
    sourceRequestId: requestId,
    sourceCache: {},
  };
  renderComposerHistory();

  try {
    const response = await fetch(`${state.apiBaseUrl}/api/history/${encodeURIComponent(siteId)}?limit=120`, {
      cache: 'no-store',
    });
    const data = await readJsonResponse(response);
    if (!response.ok) {
      throw new Error(data.error ?? `Could not load history (${response.status})`);
    }
    if (requestId !== state.composer.history.sourceRequestId) {
      return;
    }
    const commits = Array.isArray(data.commits) ? [...data.commits].reverse() : [];
    state.composer.history = {
      siteId,
      commits,
      index: commits.length - 1,
      loading: false,
      sourceRequestId: requestId,
      sourceCache: {},
    };
  } catch (error) {
    console.warn(error);
    if (requestId === state.composer.history.sourceRequestId) {
      state.composer.history = {
        siteId,
        commits: [],
        index: -1,
        loading: false,
        sourceRequestId: requestId,
        sourceCache: {},
      };
    }
  } finally {
    renderComposerHistory();
  }
}

async function applyComposerHistoryIndex(nextIndex) {
  const history = state.composer.history;
  const commits = history.commits || [];
  if (!commits.length || nextIndex < 0 || nextIndex >= commits.length) {
    return;
  }
  const commit = commits[nextIndex];
  const siteId = history.siteId || state.composer.loadedSiteId || normalizeSiteId(composerSiteIdEl?.value || '');
  if (!siteId || !commit?.sha) {
    return;
  }
  state.composer.history.index = nextIndex;
  renderComposerHistory();

  const cached = state.composer.history.sourceCache[commit.sha];
  if (cached) {
    applyComposerSource(siteId, cached);
    updateComposerStatus(`Showing ${formatComposerHistoryCommit(commit)}. Save creates a new version from this point.`, 'info');
    return;
  }

  const requestId = state.composer.history.sourceRequestId + 1;
  state.composer.history.sourceRequestId = requestId;
  try {
    const response = await fetch(`${state.apiBaseUrl}/api/history/${encodeURIComponent(siteId)}/source?commit=${encodeURIComponent(commit.sha)}`, {
      cache: 'no-store',
    });
    const data = await readJsonResponse(response);
    if (!response.ok) {
      throw new Error(data.error ?? `Could not load version (${response.status})`);
    }
    if (requestId !== state.composer.history.sourceRequestId) {
      return;
    }
    state.composer.history.sourceCache[commit.sha] = data;
    applyComposerSource(siteId, data);
    updateComposerStatus(`Showing ${formatComposerHistoryCommit(commit)}. Save creates a new version from this point.`, 'info');
  } catch (error) {
    console.error(error);
    updateComposerStatus(error.message, 'error');
  } finally {
    renderComposerHistory();
  }
}

async function loadComposerSource(siteId) {
  if (!state.apiBaseUrl) {
    updateComposerStatus(COMPOSER_UNAVAILABLE_MESSAGE, 'error');
    return false;
  }
  if (!canEditSiteId(siteId)) {
    updateComposerStatus('Core sites stay managed outside this editor.', 'warning');
    return false;
  }

  const requestId = state.composer.loadRequestId + 1;
  state.composer.loadRequestId = requestId;
  state.composer.loadingSource = true;
  state.composer.loadedSiteId = '';
  clearComposerEditorFields();
  syncComposerStarterControls();
  updateComposerStatus(`Loading ${siteId}…`, 'info');

  try {
    const response = await fetch(`${state.apiBaseUrl}/api/source/${encodeURIComponent(siteId)}`, {
      cache: 'no-store',
    });
    const data = await readJsonResponse(response);
    if (!response.ok) {
      throw new Error(data.error ?? `Could not load ${siteId} (${response.status})`);
    }
    if (requestId !== state.composer.loadRequestId) {
      return false;
    }
    applyComposerSource(siteId, data);
    void loadComposerHistory(siteId);
    if (isComposerDeleteArmed({ valid: true, exists: true, siteId })) {
      const deleteStatus = buildComposerDeleteStatus({ valid: true, exists: true, siteId });
      updateComposerStatus(deleteStatus.message, deleteStatus.tone);
      focusComposerCredentialTarget({ valid: true, exists: true, siteId });
    } else {
      updateComposerStatus(`Loaded ${siteId}. Edit and update when ready.`, 'success');
      focusComposerEditorPane();
    }
    return true;
  } catch (error) {
    console.error(error);
    if (requestId === state.composer.loadRequestId) {
      updateComposerStatus(error.message, 'error');
    }
    return false;
  } finally {
    if (requestId === state.composer.loadRequestId) {
      state.composer.loadingSource = false;
      syncComposerStarterControls();
    }
  }
}

function wireEditControl(button, entry, options = {}) {
  if (!button) {
    return;
  }

  const editable = canEditEntry(entry);
  button.disabled = !editable;
  button.classList.toggle('is-disabled', !editable);
  button.title = editable
    ? `Edit ${entry.siteId}`
    : entry?.categories?.externalCatalog
      ? 'Imported CSV rows stay read-only in the launchpad.'
      : 'Core Mullmania sites stay managed outside this editor.';
  if (!editable) {
    return;
  }

  button.addEventListener('click', () => {
    if (typeof options.beforeOpen === 'function') {
      options.beforeOpen();
    }
    openComposerForEdit(entry.siteId);
  });
}

function buildComposerOpenStatus(validation) {
  if (isComposerDeleteArmed(validation)) {
    return buildComposerDeleteStatus(validation);
  }

  if (!state.apiBaseUrl) {
    return {
      message: 'Deploy API not configured — creation and overwrite will fail until an API endpoint is set.',
      tone: 'warning',
    };
  }

  if (validation?.exists) {
    const existingEntry = findEntryBySiteId(validation.siteId);
    const targetUrl = existingEntry?.host ? `https://${existingEntry.host}/` : validation.siteId;
    if (normalizeComposerRecipeId(state.composer.recipeId) === 'copy-site') {
      return {
        message: `Copy Site will replace ${targetUrl} with the selected source site. The editor is disabled in this mode.`,
        tone: 'info',
      };
    }
    return {
      message: `Editing ${targetUrl}. Starter choices stay linked until you change the HTML, CSS, or JS by hand.`,
      tone: 'info',
    };
  }

  if (normalizeComposerRecipeId(state.composer.recipeId) === 'copy-site') {
    return {
      message: 'Pick a target subdomain and source site. The hosted files and saved data will be copied as-is.',
      tone: 'info',
    };
  }

  return {
    message: 'Type a subdomain, pick a starter, and check the preview before creating the site.',
    tone: 'info',
  };
}

function openComposer(options = {}) {
  setComposerIntent(COMPOSER_INTENT_AUTHORING);
  clearComposerDeleteArm();
  if (typeof options.siteId === 'string') {
    clearComposerIntentRecord({ clearInput: true });
    composerSiteIdEl.value = sanitizeSiteIdInput(options.siteId);
  } else if (options.reset === true) {
    resetComposerDraft();
  }
  if (options.cancelSourceLoad !== false) {
    cancelComposerSourceLoad();
  }
  if (options.mode && options.mode !== state.composer.mode) {
    setComposerMode(options.mode);
  } else {
    composerModalEl?.classList.toggle('is-builder-mode', state.composer.mode !== 'editor');
    composerModalEl?.classList.toggle('is-editor-mode', state.composer.mode === 'editor');
  }
  composerModalEl.classList.remove('is-hidden');
  document.body.classList.add('has-composer-open');
  let validation = validateComposerSiteId();
  if (options.armDelete && getComposerDeleteEntry(validation)) {
    armComposerDelete(validation.siteId);
  }
  validation = syncComposerChrome(validation);
  const status = options.statusMessage
    ? { message: options.statusMessage, tone: options.statusTone || 'info' }
    : buildComposerOpenStatus(validation);
  updateComposerStatus(status.message, status.tone);
  updateComposerPreview();
  resetComposerScrollPosition();
  if (validation.exists && state.composer.mode === 'editor') {
    if (options.prefillExisting && canEditSiteId(validation.siteId)) {
      loadComposerSource(validation.siteId);
    }
    if (isComposerDeleteArmed(validation)) {
      focusComposerCredentialTarget(validation);
      return true;
    }
    if (!options.prefillExisting && !state.composer.loadingSource) {
      focusComposerEditorPane();
    }
    return true;
  }
  composerSiteIdEl.focus();
  return true;
}

function resetComposerScrollPosition() {
  if (!composerModalEl) return;
  const scrollTargets = [
    composerModalEl,
    composerModalEl.querySelector('.composer-modal__body'),
    composerModalEl.querySelector('.composer-workspace__content'),
    composerModalEl.querySelector('.composer-workspace__preview'),
    composerModalEl.querySelector('.composer-editor__panes'),
  ].filter((target) => target instanceof HTMLElement);
  for (const target of scrollTargets) {
    target.scrollTop = 0;
    target.scrollLeft = 0;
  }
  window.requestAnimationFrame(() => {
    for (const target of scrollTargets) {
      target.scrollTop = 0;
      target.scrollLeft = 0;
    }
  });
}

function openComposerForCreate() {
  openComposer({ reset: true, mode: 'blank' });
}

function openComposerForEdit(siteId) {
  const entry = findEntryBySiteId(siteId);
  if (entry?.categories?.externalCatalog) {
    openComposer({
      siteId,
      mode: 'editor',
      statusMessage: 'Imported CSV rows stay read-only in the launchpad.',
      statusTone: 'warning',
    });
    return false;
  }
  if (!canEditSiteId(siteId)) {
    openComposer({
      siteId,
      mode: 'editor',
      statusMessage: 'Core Mullmania sites stay managed outside this editor.',
      statusTone: 'warning',
    });
    return false;
  }
  if (normalizeComposerRecipeId(state.composer.recipeId) === 'copy-site') {
    state.composer.recipeId = COMPOSER_DEFAULT_RECIPE_ID;
  }
  return openComposer({
    siteId,
    mode: 'editor',
    prefillExisting: true,
    cancelSourceLoad: true,
  });
}

function openComposerForDelete(siteId) {
  const entry = findEntryBySiteId(siteId);
  if (!canEditEntry(entry)) {
    return openComposerForEdit(siteId);
  }
  if (!canDeleteDirectly(entry)) {
    return openComposer({
      siteId,
      mode: 'editor',
      prefillExisting: true,
      cancelSourceLoad: true,
      statusMessage: getDeleteUnavailableMessage(entry),
      statusTone: 'warning',
    });
  }

  return openComposer({
    siteId,
    mode: 'editor',
    prefillExisting: true,
    cancelSourceLoad: true,
    armDelete: true,
  });
}

function resetComposerDraft() {
  cancelComposerSourceLoad();
  clearComposerDeleteArm();
  clearComposerIntentRecord({ clearInput: true });
  state.composer.loadedSiteId = '';
  state.composer.recipeId = COMPOSER_DEFAULT_RECIPE_ID;
  state.composer.starterId = COMPOSER_DEFAULT_STARTER_ID;
  state.composer.surfaceId = COMPOSER_DEFAULT_SURFACE_ID;
  state.composer.addonIds = [];
  state.composer.dataSourceId = COMPOSER_DEFAULT_DATA_SOURCE_ID;
  state.composer.themeId = COMPOSER_DEFAULT_THEME_ID;
  state.composer.tvFormFactor = false;
  state.composer.copyQuery = '';
  state.composer.copySourceSiteId = '';
  state.composer.tvConfig = normalizeComposerTvConfig(COMPOSER_TV_DEFAULT_CONFIG);
  unlockComposerBuilder();
  composerSiteIdEl.value = '';
  seedComposerStarterDraft('');
  setComposerEditorPane('html');
}

function resetComposerFromBuilder() {
  clearComposerDeleteArm();
  state.composer.loadedSiteId = '';
  cancelComposerSourceLoad();
  seedComposerStarterDraft(sanitizeSiteIdInput(composerSiteIdEl?.value || ''));
  setComposerMode('blank');
  setComposerEditorPane('html', { focus: state.composer.mode === 'editor' });
  const validation = syncComposerChrome();
  updateComposerStatus('Draft rebuilt from the current starter choices.', 'success');
  return validation;
}

function closeComposer(options = {}) {
  cancelComposerSourceLoad();
  resetComposerHistory();
  clearComposerDeleteArm();
  composerModalEl.classList.add('is-hidden');
  document.body.classList.remove('has-composer-open');
  if (!options.keepProtectedAction) {
    state.pendingProtectedAction = null;
  }
  setComposerIntent(COMPOSER_INTENT_AUTHORING);
}

function setComposerMode(mode) {
  const nextMode = normalizeComposerRecipeId(state.composer.recipeId) === 'copy-site' ? 'blank' : mode;
  if (nextMode !== 'editor') {
    cancelComposerSourceLoad();
  }
  state.composer.mode = nextMode;
  composerModalEl?.classList.toggle('is-builder-mode', nextMode !== 'editor');
  composerModalEl?.classList.toggle('is-editor-mode', nextMode === 'editor');
  composerTabButtons.forEach((button) => {
    const isEditorTab = button.dataset.composerTab === 'editor';
    button.disabled = isEditorTab && normalizeComposerRecipeId(state.composer.recipeId) === 'copy-site';
    button.classList.toggle('is-active', button.dataset.composerTab === nextMode);
  });
  composerBlankPanelEl.classList.toggle('is-hidden', nextMode !== 'blank');
  composerEditorPanelEl.classList.toggle('is-hidden', nextMode !== 'editor');
  if (nextMode === 'editor') {
    setComposerEditorPane(state.composer.editorPane);
  }
  syncComposerStarterControls();
  syncComposerChrome();
  updateComposerPreview();
}

function syncComposerHeader(validation = null) {
  if (!composerTitleEl || !composerDescriptionEl) {
    return;
  }

  const exists = Boolean(validation?.exists);

  if (isComposerDeleteArmed(validation) && exists) {
    composerTitleEl.textContent = 'Delete Site';
    composerDescriptionEl.textContent = 'Submit now deletes this existing subdomain instead of overwriting it.';
    return;
  }

  const recipeId = normalizeComposerRecipeId(state.composer.recipeId);

  if (state.composer.mode === 'editor' && exists) {
    composerTitleEl.textContent = 'Edit Site';
    composerDescriptionEl.textContent = 'Update this existing subdomain in place from the editor.';
    return;
  }

  if (state.composer.mode === 'editor') {
    composerTitleEl.textContent = recipeId === 'tv-app' ? 'Deploy TV App From Editor' : 'Deploy Site From Editor';
    composerDescriptionEl.textContent = recipeId === 'tv-app'
      ? 'Create a TV app from the selected media bundle and the current HTML, CSS, and JS.'
      : 'Create a new site by publishing HTML, CSS, and JS from the editor.';
    return;
  }

  if (exists) {
    composerTitleEl.textContent = recipeId === 'copy-site' ? 'Clone Into Existing Site' : 'Overwrite Existing Site';
    composerDescriptionEl.textContent = recipeId === 'tv-app'
      ? 'Replace the existing site with the TV app, or switch to Editor and adjust the files first.'
      : recipeId === 'copy-site'
        ? 'Replace the existing site by cloning the selected source site into it.'
        : 'Replace the existing site with the selected starter, or switch to Editor and adjust the files first.';
    return;
  }

  composerTitleEl.textContent = recipeId === 'tv-app' ? 'Create TV App' : recipeId === 'copy-site' ? 'Copy Site' : 'Create Site';
  composerDescriptionEl.textContent = recipeId === 'tv-app'
    ? 'TV App starter: launcher cards plus the selected media bundle. TV form factor is auto-on.'
    : recipeId === 'copy-site'
      ? 'Duplicate an existing Mullmania site into a new subdomain.'
      : 'Pick a subdomain, pick a starter, hit Create. Theme and tweaks come after the site is live.';
}

function updateComposerSubmit(validation = null) {
  if (isComposerDeleteArmed(validation)) {
    composerSubmitButton.innerHTML = '<i class="ti ti-trash"></i><span>Delete Site</span>';
    return;
  }

  const isEditor = state.composer.mode === 'editor';
  const exists = Boolean(validation?.exists);
  const recipeId = normalizeComposerRecipeId(state.composer.recipeId);
  const label = isEditor
    ? (recipeId === 'tv-app'
      ? (exists ? 'Update TV App' : 'Deploy TV App')
      : (exists ? 'Update Site' : 'Deploy From Editor'))
    : (recipeId === 'tv-app'
      ? (exists ? 'Overwrite With TV App' : 'Create TV App')
      : recipeId === 'copy-site'
        ? (exists ? 'Copy Into Site' : 'Copy Site')
        : (exists ? 'Overwrite Site' : 'Create Site'));
  composerSubmitButton.innerHTML = `${isEditor ? '<i class="ti ti-rocket"></i>' : '<i class="ti ti-bolt"></i>'}<span>${label}</span>`;
}

function validateComposerSiteId() {
  const rawValue = sanitizeSiteIdInput(composerSiteIdEl.value);
  const value = normalizeSiteId(rawValue);
  composerSiteIdEl.value = rawValue;

  if (!rawValue) {
    composerSiteIdStatusEl.textContent = 'Lowercase letters, numbers, and hyphens only.';
    composerSiteIdStatusEl.className = 'field-note';
    return { valid: false, exists: false, siteId: '' };
  }

  if (rawValue.endsWith('-')) {
    composerSiteIdStatusEl.textContent = 'Finish the name after the trailing hyphen.';
    composerSiteIdStatusEl.className = 'field-note';
    return { valid: false, exists: false, siteId: value };
  }

  if (!/^[a-z0-9-]+$/.test(value) || value === '_root') {
    composerSiteIdStatusEl.textContent = 'Use lowercase letters, numbers, and hyphens only.';
    composerSiteIdStatusEl.className = 'field-note is-error';
    return { valid: false, exists: false, siteId: value };
  }

  if (['sites', 'ui', 'index'].includes(value)) {
    composerSiteIdStatusEl.textContent = 'That one is reserved for the core surface.';
    composerSiteIdStatusEl.className = 'field-note is-error';
    return { valid: false, exists: false, siteId: value };
  }

  const existingEntry = state.entries.find((entry) => entry.siteId === value);
  if (existingEntry) {
    if (isComposerDeleteArmed({ valid: true, exists: true, siteId: value })) {
      composerSiteIdStatusEl.textContent = `Delete armed for https://${existingEntry.host}/. Submit will remove it.`;
      composerSiteIdStatusEl.className = 'field-note is-error';
    } else if (state.composer.mode === 'editor') {
      composerSiteIdStatusEl.textContent = `Ready to update https://${existingEntry.host}/ in place.`;
      composerSiteIdStatusEl.className = 'field-note is-success';
    } else {
      composerSiteIdStatusEl.textContent = `Exists already. This modal can overwrite https://${existingEntry.host}/ in place.`;
      composerSiteIdStatusEl.className = 'field-note is-warning';
    }
    return { valid: true, exists: true, siteId: value };
  }

  composerSiteIdStatusEl.textContent = `Will create https://${value}.${BASE_DOMAIN}/`;
  composerSiteIdStatusEl.className = 'field-note is-success';
  return { valid: true, exists: false, siteId: value };
}

function scheduleComposerPreview() {
  clearTimeout(previewDebounce);
  previewDebounce = window.setTimeout(() => {
    updateComposerPreview();
  }, 250);
}

function updateComposerPreview() {
  const html = composerHtmlEl.value || '';
  const css = composerCssEl.value || '';
  const js = composerJsEl.value || '';
  const hasSource = Boolean(html.trim() || css.trim() || js.trim());
  const documentHtml = hasSource
    ? buildEditorDocument(html, css, js)
    : buildBlankDocument('Starter preview', 'The iframe fills from the editor source panes.');

  if (composerPreviewEl) {
    composerPreviewEl.srcdoc = documentHtml;
  }
}

function buildComposerCatalogTagAttribution() {
  const tags = new Set();
  const recipeId = normalizeComposerRecipeId(state.composer.recipeId);
  const activeFlatStarterId = getActiveFlatStarterId();
  const activeFlatStarter = COMPOSER_FLAT_STARTER_OPTIONS.find((option) => option.id === activeFlatStarterId);
  const tvFormFactorEnabled = Boolean(state.composer.tvFormFactor || activeFlatStarter?.tvFormFactorAutoOn || recipeId === 'tv-app');
  if (tvFormFactorEnabled) {
    tags.add(COMPOSER_TV_FORM_FACTOR_TAG);
  }

  const surfaceId = normalizeComposerSurfaceId(state.composer.surfaceId);
  if (surfaceId && surfaceId !== COMPOSER_DEFAULT_SURFACE_ID) {
    tags.add(`surface:${surfaceId}`);
  }

  const addonIds = normalizeComposerAddonIds(state.composer.addonIds);
  for (const addonId of addonIds) {
    if (addonId === 'mobile' || addonId === 'tv-tail') {
      tags.add(`addon:${addonId}`);
    } else {
      tags.add(`${COMPOSER_PLACEHOLDER_TAG_PREFIX}addon:${addonId}`);
    }
  }
  if (composerTvTailEnabled(addonIds) || (recipeId === 'tv-app' && normalizeComposerTvConfig(state.composer.tvConfig).tvTailEnabled)) {
    tags.add('addon:tv-tail');
    tags.add('tv-tail');
  }

  const dataSourceId = normalizeComposerDataSourceId(state.composer.dataSourceId);
  if (dataSourceId === 'ipzom') {
    tags.add('data-source:ipzom');
    tags.add('ipzom-data');
  } else if (dataSourceId && dataSourceId !== COMPOSER_DEFAULT_DATA_SOURCE_ID) {
    tags.add(`${COMPOSER_PLACEHOLDER_TAG_PREFIX}data-source:${dataSourceId}`);
  }
  return Array.from(tags);
}

function buildComposerEditorPayload(validation = validateComposerSiteId()) {
  return {
    mode: 'editor',
    overwrite: Boolean(validation?.exists),
    html: composerHtmlEl.value || '',
    css: composerCssEl.value || '',
    js: composerJsEl.value || '',
    source: location.hostname,
    additionalTags: buildComposerCatalogTagAttribution(),
    intentRecord: buildComposerIntentRecord(validation),
  };
}

function buildComposerTemplatePayload(validation = validateComposerSiteId()) {
  return {
    mode: 'template',
    templateId: 'tv-app',
    config: normalizeComposerTvConfig(state.composer.tvConfig),
    overwrite: Boolean(validation?.exists),
    source: location.hostname,
    additionalTags: buildComposerCatalogTagAttribution(),
    intentRecord: buildComposerIntentRecord(validation),
  };
}

function buildComposerCopyPayload(validation = validateComposerSiteId()) {
  const sourceSiteId = normalizeSiteId(state.composer.copySourceSiteId);
  if (!sourceSiteId) {
    return null;
  }

  return {
    mode: 'copy',
    sourceSiteId,
    overwrite: Boolean(validation?.exists),
    source: location.hostname,
    additionalTags: buildComposerCatalogTagAttribution(),
  };
}

async function sendComposerRequest({
  endpoint,
  payload,
  method = 'POST',
  invalidKeyAction = null,
}) {
  if (!state.apiBaseUrl) {
    throw new Error(COMPOSER_UNAVAILABLE_MESSAGE);
  }

  const operatorKey = getKnownOperatorKey();
  if (!operatorKey) {
    if (invalidKeyAction) {
      openComposerAccessGateForAction(invalidKeyAction);
      const error = new Error('Operator key required.');
      error.composerHandled = true;
      throw error;
    }
    throw new Error(`Open Settings and paste the private operator key first. ${OPERATOR_KEY_HELP_MESSAGE}`);
  }

  const response = await fetch(`${state.apiBaseUrl}${endpoint}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'x-operator-key': operatorKey,
    },
    body: payload == null ? undefined : JSON.stringify(payload),
  });

  const data = await readJsonResponse(response);
  if (!response.ok) {
    const message = data.error ?? `Request failed (${response.status})`;
    if (invalidKeyAction && isInvalidOperatorKeyFailure(response.status, message)) {
      reopenOperatorAccessGate(invalidKeyAction);
      const error = new Error(message);
      error.composerHandled = true;
      throw error;
    }
    throw new Error(message);
  }

  return data;
}

function normalizeComposerIntentPlan(plan = {}) {
  const source = plan && typeof plan === 'object' ? plan : {};
  const flatStarterId = COMPOSER_FLAT_STARTER_IDS.has(String(source.flatStarterId || '').trim().toLowerCase())
    ? String(source.flatStarterId || '').trim().toLowerCase()
    : COMPOSER_DEFAULT_FLAT_STARTER_ID;
  const addonIds = Array.isArray(source.addonIds)
    ? source.addonIds
      .map((id) => String(id || '').trim().toLowerCase())
      .filter((id, index, ids) => COMPOSER_ADDON_IDS.has(id) && ids.indexOf(id) === index)
    : [];
  return {
    summary: String(source.summary || '').trim() || 'Draft planned.',
    siteIdSuggestion: sanitizeSiteIdInput(source.siteIdSuggestion || ''),
    title: String(source.title || '').trim() || 'New Site',
    description: String(source.description || '').trim(),
    flatStarterId,
    surfaceId: normalizeComposerSurfaceId(source.surfaceId),
    addonIds,
    dataSourceId: normalizeComposerDataSourceId(source.dataSourceId),
    tvFormFactor: Boolean(source.tvFormFactor) || flatStarterId === 'tv-app',
    acceptanceChecks: Array.isArray(source.acceptanceChecks)
      ? source.acceptanceChecks.map((item) => String(item || '').trim()).filter(Boolean).slice(0, 8)
      : [],
    openQuestions: Array.isArray(source.openQuestions)
      ? source.openQuestions.map((item) => String(item || '').trim()).filter(Boolean).slice(0, 6)
      : [],
  };
}

function renderComposerIntentSummary(plan = null, draftAssistSucceeded = false) {
  if (!composerIntentSummaryEl) {
    return;
  }
  if (!plan) {
    composerIntentSummaryEl.textContent = '';
    composerIntentSummaryEl.classList.add('is-hidden');
    return;
  }
  const parts = [
    `Planned: ${plan.summary}`,
    `Starter: ${plan.flatStarterId}`,
    draftAssistSucceeded ? 'Draft tailored by AI.' : 'Starter draft kept for review.',
  ];
  composerIntentSummaryEl.textContent = parts.join(' ');
  composerIntentSummaryEl.classList.remove('is-hidden');
}

function clearComposerIntentRecord(options = {}) {
  state.composer.intentRecord = null;
  if (options.clearInput && composerIntentPromptEl) {
    composerIntentPromptEl.value = '';
  }
  renderComposerIntentSummary(null);
}

function buildComposerIntentAssistPrompt(intent, plan) {
  const checks = (plan.acceptanceChecks || []).map((item) => `- ${item}`).join('\n');
  const questions = (plan.openQuestions || []).map((item) => `- ${item}`).join('\n');
  return [
    'Turn this starter into the planned Mullmania site draft.',
    '',
    `Original intent:\n${intent}`,
    '',
    `Title: ${plan.title}`,
    `Summary: ${plan.summary}`,
    plan.description ? `Description: ${plan.description}` : '',
    `Starter: ${plan.flatStarterId}`,
    `Surface: ${plan.surfaceId}`,
    `Add-ons: ${(plan.addonIds || []).join(', ') || 'none'}`,
    `Data source: ${plan.dataSourceId}`,
    checks ? `Acceptance checks:\n${checks}` : '',
    questions ? `Open questions to make visible in the draft:\n${questions}` : '',
  ].filter(Boolean).join('\n');
}

async function requestComposerDraftAssist({ siteId = '', prompt = '', invalidKeyAction = null } = {}) {
  return sendComposerRequest({
    endpoint: '/api/editor/assist',
    payload: {
      siteId,
      prompt,
      html: composerHtmlEl.value || '',
      css: composerCssEl.value || '',
      js: composerJsEl.value || '',
    },
    invalidKeyAction,
  });
}

function buildComposerIntentRecord(validation = validateComposerSiteId()) {
  const record = state.composer.intentRecord;
  if (!record || typeof record !== 'object') {
    return null;
  }
  const appliedSiteId = validation?.valid
    ? validation.siteId
    : sanitizeSiteIdInput(composerSiteIdEl?.value || '');
  return {
    ...record,
    appliedSiteId,
  };
}

function applyComposerIntentPlan(plan) {
  const currentSiteId = sanitizeSiteIdInput(composerSiteIdEl?.value || '');
  if (!currentSiteId && plan.siteIdSuggestion) {
    composerSiteIdEl.value = plan.siteIdSuggestion;
  }

  unlockComposerBuilder();
  setComposerFlatStarter(plan.flatStarterId);
  if (normalizeComposerRecipeId(state.composer.recipeId) === COMPOSER_DEFAULT_RECIPE_ID) {
    state.composer.surfaceId = normalizeComposerSurfaceId(plan.surfaceId);
    state.composer.addonIds = normalizeComposerAddonIds(plan.addonIds);
    state.composer.dataSourceId = normalizeComposerDataSourceId(plan.dataSourceId);
  }
  state.composer.tvFormFactor = Boolean(plan.tvFormFactor);
  if (plan.flatStarterId === 'tv-app') {
    state.composer.tvConfig = normalizeComposerTvConfig({
      ...state.composer.tvConfig,
      appTitle: plan.title,
      tvTailEnabled: true,
    });
  }

  clearComposerDeleteArm();
  seedComposerStarterDraft(sanitizeSiteIdInput(composerSiteIdEl?.value || ''));
  setComposerMode('editor');
  updateComposerPreview();
}

async function planComposerIntentDraft() {
  if (composerBuilderIsBusy()) {
    return;
  }

  const intent = String(composerIntentPromptEl?.value || '').trim();
  if (!intent) {
    updateComposerStatus('Write an intent first.', 'error');
    return;
  }

  const validation = validateComposerSiteId();
  const protectedAction = {
    label: validation.valid ? `Plan draft for ${validation.siteId}` : 'Plan draft from intent',
    type: PROTECTED_ACTION_COMPOSER_INTENT,
    siteId: validation.valid ? validation.siteId : '',
  };

  if (!ensureComposerCredentials({ validation, protectedAction })) {
    return;
  }

  state.composer.intentBusy = true;
  clearComposerIntentRecord();
  syncComposerChrome(validation);
  updateComposerStatus('Planning an editable draft from the intent…', 'info');

  try {
    const plannedAt = new Date().toISOString();
    const plan = normalizeComposerIntentPlan(await sendComposerRequest({
      endpoint: '/api/editor/intent-plan',
      payload: {
        intent,
        currentSiteId: validation.valid ? validation.siteId : '',
      },
      invalidKeyAction: protectedAction,
    }));

    applyComposerIntentPlan(plan);
    const nextValidation = validateComposerSiteId();
    let draftAssistSummary = '';
    let draftAssistSucceeded = false;

    try {
      const assist = await requestComposerDraftAssist({
        siteId: nextValidation.valid ? nextValidation.siteId : '',
        prompt: buildComposerIntentAssistPrompt(intent, plan),
        invalidKeyAction: protectedAction,
      });
      setComposerEditorSource(assist);
      draftAssistSummary = String(assist.summary || '').trim();
      draftAssistSucceeded = true;
      lockComposerBuilder('intent-plan');
    } catch (assistError) {
      console.error(assistError);
      draftAssistSummary = assistError?.message || 'Draft assist failed after planning.';
    }

    state.composer.intentRecord = {
      version: 1,
      source: 'sites-composer',
      originalIntent: intent,
      plannedAt,
      appliedSiteId: nextValidation.valid ? nextValidation.siteId : '',
      plan,
      draftAssistSummary,
      draftAssistSucceeded,
    };

    renderComposerIntentSummary(plan, draftAssistSucceeded);
    syncComposerChrome(nextValidation);
    updateComposerStatus(
      draftAssistSucceeded
        ? (draftAssistSummary || 'Intent planned and draft tailored. Review before creating.')
        : 'Intent planned; review the starter draft before creating.',
      draftAssistSucceeded ? 'success' : 'warning',
    );
    focusComposerEditorPane();
  } catch (error) {
    console.error(error);
    if (!error?.composerHandled) {
      updateComposerStatus(error.message || 'Intent planning failed.', 'error');
    }
  } finally {
    state.composer.intentBusy = false;
    syncComposerChrome();
  }
}

async function assistComposerDraft() {
  if (state.composer.mode !== 'editor' || composerBuilderIsBusy()) {
    return;
  }

  const prompt = String(composerAiPromptEl?.value || '').trim();
  if (!prompt) {
    updateComposerStatus('Write a rewrite prompt first.', 'error');
    return;
  }

  if (!hasComposerSource()) {
    updateComposerStatus('Generate or load a draft before asking AI to rewrite it.', 'error');
    return;
  }

  const validation = validateComposerSiteId();
  const protectedAction = {
    label: validation.valid ? `AI rewrite for ${validation.siteId}` : 'AI rewrite for the current draft',
    type: PROTECTED_ACTION_COMPOSER_ASSIST,
    siteId: validation.valid ? validation.siteId : '',
  };

  if (!ensureComposerCredentials({ validation, protectedAction })) {
    return;
  }

  state.composer.aiBusy = true;
  syncComposerChrome(validation);
  updateComposerStatus('Rewriting the current draft with AI…', 'info');

  try {
    const data = await requestComposerDraftAssist({
      siteId: validation.valid ? validation.siteId : '',
      prompt,
      invalidKeyAction: protectedAction,
    });

    setComposerEditorSource(data);
    if (state.composer.draftPreset === COMPOSER_DRAFT_PRESET_STARTER) {
      state.composer.draftPreset = COMPOSER_DRAFT_PRESET_CUSTOM;
      state.composer.starterSiteId = '';
      lockComposerBuilder('ai-rewrite');
    }

    syncComposerChrome(validation);
    updateComposerStatus(
      String(data.summary || 'AI rewrote the draft. Review the result before deploying.'),
      'success',
    );
    focusComposerEditorPane();
  } catch (error) {
    console.error(error);
    if (!error?.composerHandled) {
      updateComposerStatus(error.message || 'AI rewrite failed.', 'error');
    }
  } finally {
    state.composer.aiBusy = false;
    syncComposerChrome(validation);
  }
}

async function fetchValetLocalJson(path, options = {}) {
  const response = await fetch(`${VALET_LOCAL_BASE_URL}${path}`, {
    mode: 'cors',
    cache: 'no-store',
    targetAddressSpace: 'loopback',
    ...options,
    headers: {
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...(options.headers || {}),
    },
  });
  const data = await readJsonResponse(response);
  if (!response.ok) {
    throw new Error(data.error || `Valet request failed (${response.status})`);
  }
  return data;
}

function valetSnapshotLooksOnline(snapshot = {}) {
  const health = snapshot.health || {};
  return health.controlRoomWriteOk !== false && health.menuBarOk !== false;
}

async function assertValetAgentsOnline() {
  let snapshot;
  try {
    snapshot = await fetchValetLocalJson('/api/local/snapshot');
  } catch (error) {
    throw new Error('Valet is not reachable on this machine. Start Valet, then try again.');
  }

  if (!valetSnapshotLooksOnline(snapshot)) {
    throw new Error('Valet is running, but its agent path is not online yet.');
  }
  return snapshot;
}

async function launchComposerValetFix() {
  if (state.composer.mode !== 'editor' || composerBuilderIsBusy()) {
    return;
  }

  const validation = validateComposerSiteId();
  if (!canUseComposerValetAssist(validation)) {
    updateComposerStatus('Load an existing site before asking Valet.', 'error');
    return;
  }

  const prompt = String(composerAiPromptEl?.value || '').trim();
  if (!prompt) {
    updateComposerStatus('Write a Valet request first.', 'error');
    return;
  }

  if (!hasComposerSource()) {
    updateComposerStatus('Load source before asking Valet.', 'error');
    return;
  }

  state.composer.valetBusy = true;
  syncComposerChrome(validation);
  updateComposerStatus('Checking Valet…', 'info');

  try {
    await assertValetAgentsOnline();
    const entry = findEntryBySiteId(validation.siteId);
    const siteUrl = entry?.url || (entry?.host ? `https://${entry.host}/` : `https://${validation.siteId}.${BASE_DOMAIN}/`);
    const data = await fetchValetLocalJson('/api/local/site-fix', {
      method: 'POST',
      body: JSON.stringify({
        siteId: validation.siteId,
        siteUrl,
        request: prompt,
        files: getComposerSourceFiles(validation.siteId),
      }),
    });
    const commandId = data?.oneShot?.commandId || data?.commandId || '';
    updateComposerStatus(
      commandId ? `Valet queued ${commandId}.` : 'Valet queued the site request.',
      'success',
    );
  } catch (error) {
    console.error(error);
    updateComposerStatus(error.message || 'Valet could not queue this request.', 'error');
  } finally {
    state.composer.valetBusy = false;
    syncComposerChrome(validation);
  }
}

async function submitComposerBlank() {
  const validation = validateComposerSiteId();
  if (!validation.valid) {
    updateComposerStatus('Pick a valid subdomain first.', 'error');
    return;
  }

  const protectedAction = {
    label: validation.exists ? `Overwriting ${validation.siteId}` : `Creating ${validation.siteId}`,
    type: PROTECTED_ACTION_COMPOSER_BLANK,
    siteId: validation.siteId,
  };

  if (!ensureComposerReady(validation.exists, { validation, protectedAction })) {
    return;
  }

  const recipeId = normalizeComposerRecipeId(state.composer.recipeId);
  if (recipeId === 'tv-app') {
    await submitComposerRequest({
      loadingLabel: validation.exists
        ? `Overwriting ${validation.siteId} with the TV app…`
        : `Creating ${validation.siteId} as a TV app…`,
      invalidKeyAction: protectedAction,
      execute: () => sendComposerRequest({
        endpoint: `/api/deploy/${encodeURIComponent(validation.siteId)}`,
        payload: buildComposerTemplatePayload(validation),
        invalidKeyAction: protectedAction,
      }),
    });
    return;
  }

  if (recipeId === 'copy-site') {
    const copyPayload = buildComposerCopyPayload(validation);
    if (!copyPayload) {
      updateComposerStatus('Pick a source site before copying.', 'error');
      return;
    }

    await submitComposerRequest({
      loadingLabel: validation.exists
        ? `Cloning ${copyPayload.sourceSiteId} into ${validation.siteId}…`
        : `Copying ${copyPayload.sourceSiteId} into ${validation.siteId}…`,
      invalidKeyAction: protectedAction,
      execute: () => sendComposerRequest({
        endpoint: `/api/deploy/${encodeURIComponent(validation.siteId)}`,
        payload: copyPayload,
        invalidKeyAction: protectedAction,
      }),
    });
    return;
  }

  const editorPayload = buildComposerEditorPayload(validation);
  if (!editorPayload.html.trim() && !editorPayload.css.trim() && !editorPayload.js.trim()) {
    updateComposerStatus('Pick a starter or add something in the editor before creating the site.', 'error');
    return;
  }

  await submitComposerRequest({
    endpoint: `/api/deploy/${encodeURIComponent(validation.siteId)}`,
    payload: editorPayload,
    loadingLabel: validation.exists ? `Overwriting ${validation.siteId}…` : `Creating ${validation.siteId}…`,
    invalidKeyAction: protectedAction,
  });
}

async function submitComposerEditor() {
  const validation = validateComposerSiteId();
  if (!validation.valid) {
    updateComposerStatus('Pick a valid subdomain first.', 'error');
    return;
  }

  const protectedAction = {
    label: validation.exists ? `Updating ${validation.siteId}` : `Deploying ${validation.siteId}`,
    type: PROTECTED_ACTION_COMPOSER_EDITOR,
    siteId: validation.siteId,
  };

  if (!ensureComposerReady(validation.exists, {
    validation,
    protectedAction,
  })) {
    return;
  }

  const recipeId = normalizeComposerRecipeId(state.composer.recipeId);
  if (recipeId === 'copy-site') {
    state.composer.mode = 'blank';
    await submitComposerBlank();
    return;
  }

  const editorPayload = buildComposerEditorPayload(validation);
  if (!editorPayload.html.trim() && !editorPayload.css.trim() && !editorPayload.js.trim()) {
    updateComposerStatus('Add something to the editor before deploying.', 'error');
    return;
  }

  if (recipeId === 'tv-app') {
    await submitComposerRequest({
      loadingLabel: validation.exists
        ? `Rebuilding ${validation.siteId} from the TV template and overlaying the editor draft…`
        : `Deploying ${validation.siteId} from the TV template and editor draft…`,
      invalidKeyAction: protectedAction,
      execute: async () => {
        await sendComposerRequest({
          endpoint: `/api/deploy/${encodeURIComponent(validation.siteId)}`,
          payload: buildComposerTemplatePayload(validation),
          invalidKeyAction: protectedAction,
        });
        return sendComposerRequest({
          endpoint: `/api/deploy/${encodeURIComponent(validation.siteId)}`,
          payload: {
            ...editorPayload,
            overwrite: true,
          },
          invalidKeyAction: protectedAction,
        });
      },
    });
    return;
  }

  await submitComposerRequest({
    endpoint: `/api/deploy/${encodeURIComponent(validation.siteId)}`,
    payload: editorPayload,
    loadingLabel: validation.exists ? `Updating ${validation.siteId} from Editor…` : `Deploying ${validation.siteId} from Editor…`,
    invalidKeyAction: protectedAction,
  });
}

function ensureComposerCredentials(options = {}) {
  if (!state.apiBaseUrl) {
    updateComposerStatus(COMPOSER_UNAVAILABLE_MESSAGE, 'error');
    return false;
  }

  const validation = options.validation || validateComposerSiteId();
  const operatorKey = getKnownOperatorKey();
  if (!operatorKey) {
    if (options.protectedAction) {
      openComposerAccessGateForAction(options.protectedAction, validation);
      return false;
    }
    updateComposerStatus(`Open Settings and paste the private operator key first. ${OPERATOR_KEY_HELP_MESSAGE}`, 'warning');
    openSettingsModal({ focusOperatorKey: true });
    return false;
  }

  return true;
}

function ensureComposerReady(exists, options = {}) {
  if (!ensureComposerCredentials(options)) {
    return false;
  }

  if (exists) {
    return window.confirm('That site already exists. Overwrite it?');
  }

  return true;
}

async function submitComposerDelete() {
  const validation = validateComposerSiteId();
  const entry = getComposerDeleteEntry(validation);
  if (!validation.valid || !entry) {
    clearComposerDeleteArm();
    syncComposerChrome(validation);
    const existingEntry = validation?.exists ? findEntryBySiteId(validation.siteId) : null;
    updateComposerStatus(
      existingEntry ? getDeleteUnavailableMessage(existingEntry) : 'Pick an existing launchpad-only site before deleting.',
      'error',
    );
    return;
  }

  const protectedAction = {
    label: `Deleting ${validation.siteId}`,
    type: PROTECTED_ACTION_COMPOSER_DELETE,
    siteId: validation.siteId,
  };

  if (!ensureComposerCredentials({
    validation,
    protectedAction,
  })) {
    return;
  }

  await submitComposerRequest({
    endpoint: `/api/deploy/${encodeURIComponent(validation.siteId)}`,
    method: 'DELETE',
    loadingLabel: `Deleting ${validation.siteId}…`,
    successMessage: `Deleted https://${entry.host}/`,
    syncReturnedSiteId: false,
    openResultUrl: false,
    invalidKeyAction: protectedAction,
    onSuccess: () => {
      resetComposerDraft();
      setComposerMode('blank');
      composerSiteIdEl.focus();
    },
  });
}

async function submitComposerRequest({
  endpoint,
  payload,
  loadingLabel,
  method = 'POST',
  successMessage = '',
  syncReturnedSiteId = true,
  openResultUrl = true,
  invalidKeyAction = null,
  onSuccess = null,
  execute = null,
}) {
  if (state.composer.busy) {
    return;
  }

  state.composer.busy = true;
  syncComposerChrome();
  updateComposerStatus(loadingLabel, 'info');

  try {
    const data = typeof execute === 'function'
      ? await execute()
      : await sendComposerRequest({
        endpoint,
        payload,
        method,
        invalidKeyAction,
      });

    await refreshCatalog();
    if (syncReturnedSiteId) {
      composerSiteIdEl.value = data.siteId ?? composerSiteIdEl.value;
      validateComposerSiteId();
    }
    if (typeof onSuccess === 'function') {
      await onSuccess(data);
    }
    const changedSiteId = normalizeSiteId(data.siteId || composerSiteIdEl.value || '');
    if (changedSiteId && state.composer.mode === 'editor') {
      void loadComposerHistory(changedSiteId);
    }
    syncComposerChrome();
    const defaultSuccessMessage = data.queued
      ? `Deploy queued for ${data.siteId || composerSiteIdEl.value}.`
      : (data.url ? `Live at ${data.url}` : 'Done.');
    updateComposerStatus(successMessage || defaultSuccessMessage, 'success');
    window.setTimeout(() => {
      if (openResultUrl && data.url && !data.queued) {
        window.open(data.url, '_blank', 'noreferrer');
      }
    }, 300);
  } catch (error) {
    console.error(error);
    if (!error?.composerHandled) {
      updateComposerStatus(error.message, 'error');
    }
  } finally {
    state.composer.busy = false;
    syncComposerChrome();
  }
}

function updateComposerStatus(message, tone) {
  composerStatusEl.textContent = message;
  composerStatusEl.className = `composer-status is-${tone}`;
}

function setComposerIntent(intent) {
  state.composer.intent = intent;
  composerModalEl.classList.toggle('is-access-gate', intent === COMPOSER_INTENT_ACCESS_GATE);
}

function buildEditorDocument(html, css, js) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>${css}</style>
</head>
<body>
${html}
<script>${js}<\/script>
</body>
</html>`;
}

function buildBlankDocument(title, message) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="stylesheet" href="https://ui.${BASE_DOMAIN}/active/style.css">
</head>
<body class="retro-mode">
  <main class="launchpad-error-shell">
    <section class="card launchpad-error-card">
      <span class="badge badge-primary">Mullmania</span>
      <h1>${escapeHtml(title)}</h1>
      <p>${escapeHtml(message)}</p>
    </section>
  </main>
</body>
</html>`;
}

function calculateGalleryPageSize() {
  const metrics = getGalleryPageMetrics();
  return Math.max(1, metrics.cols * metrics.rows);
}

function getGalleryPageMetrics() {
  if (isMobileSwipeViewport()) {
    return {
      cols: window.innerWidth >= 360 ? 3 : 2,
      rows: 1,
      bodyHeight: 40,
    };
  }

  const gridWidth = Math.max(galleryGridEl?.clientWidth || window.innerWidth - 48, 1);
  const computedStyles = galleryGridEl ? window.getComputedStyle(galleryGridEl) : null;
  const gap = computedStyles
    ? (parseFloat(computedStyles.columnGap || computedStyles.gap || '12') || 12)
    : 12;
  const gridRect = galleryGridEl?.getBoundingClientRect();
  const footerRect = galleryViewEl?.querySelector('.gallery-footer')?.getBoundingClientRect();
  const measuredGridHeight = gridRect && footerRect && footerRect.top > gridRect.top
    ? footerRect.top - gridRect.top - gap
    : 0;
  const gridHeight = Math.max(
    measuredGridHeight || galleryGridEl?.clientHeight || window.innerHeight - 180,
    1
  );
  const minColumnWidth = gridWidth <= 640 ? Math.min(gridWidth, 260) : 300;
  const cols = Math.max(1, Math.floor((gridWidth + gap) / (minColumnWidth + gap)));
  const rowHeightTarget = gridWidth <= 640 ? 260 : 260;
  const rows = Math.max(1, Math.min(2, Math.floor((gridHeight + gap) / (rowHeightTarget + gap))));
  const rowHeight = Math.max(190, Math.floor((gridHeight - gap * Math.max(0, rows - 1)) / rows));
  const bodyHeight = Math.max(88, Math.min(116, Math.floor(rowHeight * 0.34)));
  return { cols, rows, bodyHeight };
}

function calculateWallPageSize() {
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const cols = Math.max(1, Math.floor((viewportWidth - 48) / 420));
  const rows = Math.max(1, Math.floor((viewportHeight - 320) / 320));
  return Math.max(4, cols * rows);
}

function getFixedPageSize(value, fallback = REVIEW_PAGE_SIZE) {
  return Math.max(1, Number.parseInt(value || fallback, 10) || fallback);
}

function getFixedPageCount(total, pageSize) {
  return Math.max(1, Math.ceil(Math.max(0, total) / getFixedPageSize(pageSize)));
}

function buildFixedPage(total, pageIndex, pageSize) {
  const size = getFixedPageSize(pageSize);
  const pageCount = getFixedPageCount(total, size);
  const page = Math.max(0, Math.min(Number.parseInt(pageIndex || 0, 10) || 0, pageCount - 1));
  const start = page * size;
  return {
    page,
    pageCount,
    pageSize: size,
    start,
    end: Math.min(start + size, Math.max(0, total)),
  };
}

function sliceFixedPage(items, pageIndex, pageSize) {
  const source = Array.isArray(items) ? items : [];
  const page = buildFixedPage(source.length, pageIndex, pageSize);
  return {
    ...page,
    items: source.slice(page.start, page.end),
  };
}

function formatFixedPageRange(page, total, visibleCount = Math.max(0, page.end - page.start)) {
  if (!total || !visibleCount) {
    return { start: 0, end: 0 };
  }
  return {
    start: page.start + 1,
    end: Math.min(page.start + visibleCount, total),
  };
}

function getTablePageCount() {
  if (isAllTablePageSize()) {
    return 1;
  }
  return Math.max(1, Math.ceil(state.visibleEntries.length / getEffectiveTablePageSize(state.visibleEntries.length)));
}

function isAllTablePageSize(value = state.tablePageSize) {
  return value === TABLE_PAGE_SIZE_ALL;
}

function getEffectiveTablePageSize(totalVisible = state.visibleEntries.length) {
  if (isAllTablePageSize()) {
    return Math.max(totalVisible, 1);
  }
  return normalizePageSize(state.tablePageSize, DEFAULT_TABLE_PAGE_SIZE);
}

function getGalleryPageCount() {
  return Math.max(1, Math.ceil(state.visibleEntries.length / state.galleryPageSize));
}

function getWallPageCount() {
  return Math.max(1, Math.ceil(state.visibleEntries.length / state.wallPageSize));
}

function getTvPageCount(entries = getTvEntries()) {
  return getFixedPageCount(entries.length, TV_QUEUE_PAGE_SIZE);
}

function clampTablePage() {
  const pageCount = getTablePageCount();
  state.tablePage = Math.min(state.tablePage, Math.max(pageCount - 1, 0));
}

function clampGalleryPage() {
  const pageCount = getGalleryPageCount();
  state.galleryPage = Math.min(state.galleryPage, Math.max(pageCount - 1, 0));
}

function clampWallPage() {
  const pageCount = getWallPageCount();
  state.wallPage = Math.min(state.wallPage, Math.max(pageCount - 1, 0));
}

function clampTvPage(entries = getTvEntries()) {
  if (entries.length === 0) {
    state.tvPage = 0;
    return;
  }
  const pageCount = getTvPageCount(entries);
  state.tvPage = Math.max(0, Math.min(state.tvPage, pageCount - 1));
}

function resetMobileLoadedItems() {
  state.mobileListLimit = MOBILE_LIST_INITIAL_LIMIT;
  state.mobileWallLimit = MOBILE_WALL_INITIAL_LIMIT;
}

function getMobileLoadedLimit(kind, totalVisible = state.visibleEntries.length) {
  const fallback = kind === 'table' ? MOBILE_LIST_INITIAL_LIMIT : MOBILE_WALL_INITIAL_LIMIT;
  const current = kind === 'table' ? state.mobileListLimit : state.mobileWallLimit;
  const limit = Math.max(fallback, Number.parseInt(current || fallback, 10) || fallback);
  return Math.min(Math.max(totalVisible, 0), limit);
}

function extendMobileLoadedItems(kind, totalVisible = state.visibleEntries.length) {
  if (!isMobileSwipeViewport() || totalVisible <= 0) {
    return false;
  }
  const isTable = kind === 'table';
  const current = isTable ? state.mobileListLimit : state.mobileWallLimit;
  const increment = isTable ? MOBILE_LIST_INCREMENT : MOBILE_WALL_INCREMENT;
  const nextLimit = Math.min(totalVisible, Math.max(current || 0, 0) + increment);
  if (nextLimit <= (current || 0)) {
    return false;
  }
  if (isTable) {
    state.mobileListLimit = nextLimit;
  } else {
    state.mobileWallLimit = nextLimit;
  }
  return true;
}

function maybeExtendMobileLoadedItems(kind, scroller) {
  if (!isMobileSwipeViewport() || !(scroller instanceof Element)) {
    return;
  }
  const viewMatches = (kind === 'table' && state.viewMode === 'table')
    || (kind === 'gallery' && state.viewMode === 'gallery')
    || (kind === 'wall' && state.viewMode === 'wall');
  if (!viewMatches) {
    return;
  }
  const remaining = scroller.scrollHeight - scroller.scrollTop - scroller.clientHeight;
  if (remaining > 320) {
    return;
  }
  if (extendMobileLoadedItems(kind, state.visibleEntries.length)) {
    render();
  }
}


function applyAutoCompose() {
  const url = new URL(window.location.href);
  const composeMode = String(url.searchParams.get('compose') || '').trim().toLowerCase();
  const siteId = normalizeSiteId(url.searchParams.get('site') || '');
  if (composeMode === 'edit' && siteId) {
    openComposerForEdit(siteId);
    return;
  }
  if (composeMode === '1' || composeMode === 'create') {
    openComposerForCreate();
  }
}

function applySearchValue(rawValue) {
  const nextValue = String(rawValue ?? '');
  const nextSearch = nextValue.trim().toLowerCase();
  if (nextSearch !== state.search) {
    clearPinnedMissingImageTargets();
  }
  state.search = nextSearch;
  state.tablePage = 0;
  resetMobileLoadedItems();
  state.listScrollTop = 0;
  state.galleryPage = 0;
  state.wallPage = 0;
  state.tvIndex = 0;
  state.tvPage = 0;
  state.auditDeck.pageIndex = 0;
  state.auditDeck.currentIndex = 0;
  if (searchEl && searchEl.value !== nextValue) {
    searchEl.value = nextValue;
  }
  syncSearchClearButton();
  if (swipeEls.searchInput && swipeEls.searchInput.value !== nextValue) {
    swipeEls.searchInput.value = nextValue;
  }
  render();
  window.dispatchEvent(new CustomEvent('mullmania-search-change', {
    detail: { search: state.search, value: nextValue },
  }));
}

/* ===== SWIPE VIEW (mobile) ===== */

const swipeEls = {
  view: document.getElementById('swipe-view'),
  toolbar: document.getElementById('swipe-toolbar'),
  searchInput: document.getElementById('swipe-search'),
  viewSelect: document.getElementById('swipe-view-select'),
  summary: document.getElementById('swipe-summary'),
  clearSearch: document.getElementById('swipe-clear-search'),
  editCurrent: document.getElementById('swipe-edit-current'),
  deleteCurrent: document.getElementById('swipe-delete-current'),
  openComposer: document.getElementById('swipe-open-composer'),
  frame: document.getElementById('swipe-frame'),
  previewImage: document.getElementById('swipe-preview-image'),
  previewEmpty: document.getElementById('swipe-preview-empty'),
  touch: document.getElementById('swipe-touch'),
  position: document.getElementById('swipe-position'),
  title: document.getElementById('swipe-title'),
  host: document.getElementById('swipe-host'),
  prev: document.getElementById('swipe-prev'),
  next: document.getElementById('swipe-next'),
  menu: document.getElementById('swipe-menu'),
  searchBtn: document.getElementById('swipe-search-btn'),
  rankDown: document.getElementById('swipe-rank-down'),
  rankUp: document.getElementById('swipe-rank-up'),
  rankValue: document.getElementById('swipe-rank-value'),
  mainSite: document.getElementById('swipe-main-site'),
  refreshPreview: document.getElementById('swipe-refresh-preview'),
};

let swipeTouchState = null;
let swipeTouchTimer = null;
let swipeViewInitialized = false;

function initSwipeView() {
  if (!swipeEls.view || swipeViewInitialized) return;
  swipeViewInitialized = true;

  swipeEls.prev.addEventListener('click', () => navigateSwipe(-1));
  swipeEls.next.addEventListener('click', () => navigateSwipe(1));

  swipeEls.menu.addEventListener('click', () => toggleSwipeToolbar());
  swipeEls.searchBtn.addEventListener('click', () => toggleSwipeToolbar(true));
  swipeEls.searchInput?.addEventListener('input', () => {
    applySearchValue(swipeEls.searchInput.value);
  });
  swipeEls.viewSelect?.addEventListener('change', () => {
    const nextView = swipeEls.viewSelect.value;
    closeSwipeToolbar();
    setViewMode(nextView);
  });
  swipeEls.rankDown?.addEventListener('click', () => {
    const entry = getCurrentSwipeEntry();
    if (entry) {
      updateManualRank(entry.siteId, -1);
    }
  });
  swipeEls.rankUp?.addEventListener('click', () => {
    const entry = getCurrentSwipeEntry();
    if (entry) {
      updateManualRank(entry.siteId, 1);
    }
  });
  swipeEls.mainSite?.addEventListener('click', () => {
    const entry = getCurrentSwipeEntry();
    if (canMutateEntry(entry)) {
      updateMainSite(entry.siteId);
    }
  });
  swipeEls.refreshPreview?.addEventListener('click', async () => {
    const entry = getCurrentSwipeEntry();
    if (canMutateEntry(entry)) {
      const captureOptions = readPreviewRefreshOptions(swipeEls.refreshPreview);
      await refreshPreviewForEntry(entry, true, swipeEls.refreshPreview, captureOptions);
    }
  });
  swipeEls.deleteCurrent?.addEventListener('click', async () => {
    const entry = getCurrentSwipeEntry();
    if (!entry) {
      return;
    }
    closeSwipeToolbar();
    await requestDeleteEntry(entry);
  });
  swipeEls.editCurrent?.addEventListener('click', () => {
    const entry = getCurrentSwipeEntry();
    if (!canEditEntry(entry)) {
      return;
    }
    closeSwipeToolbar();
    openComposerForEdit(entry.siteId);
  });
  swipeEls.clearSearch?.addEventListener('click', () => {
    applySearchValue('');
    swipeEls.searchInput?.focus();
  });
  swipeEls.openComposer?.addEventListener('click', () => {
    closeSwipeToolbar();
    openComposerForCreate();
  });
  swipeEls.toolbar?.addEventListener('click', (event) => {
    if (event.target === swipeEls.toolbar) {
      closeSwipeToolbar();
    }
  });

  const touch = swipeEls.touch;
  touch.addEventListener('touchstart', onSwipeTouchStart, { passive: true });
  touch.addEventListener('touchmove', onSwipeTouchMove, { passive: true });
  touch.addEventListener('touchend', onSwipeTouchEnd);

  renderSwipeView();
}

function updateSwipeViewSelect() {
  if (!(swipeEls.viewSelect instanceof HTMLSelectElement)) {
    return;
  }

  const views = getAvailableViewConfigs();
  swipeEls.viewSelect.innerHTML = views.map((view) => `
    <option value="${escapeHtml(view.value || '')}">${escapeHtml(view.label || humanizeToken(view.value || 'view'))}</option>
  `).join('');
  swipeEls.viewSelect.value = state.viewMode;
  swipeEls.viewSelect.disabled = views.length <= 1;
}

function renderSwipeView() {
  updateSwipeViewSelect();
  const entries = state.visibleEntries;
  if (entries.length === 0) {
    swipeEls.position.textContent = '0 / 0';
    swipeEls.title.textContent = 'No groups match';
    swipeEls.host.textContent = '';
    swipeEls.frame.src = '';
    swipeEls.prev.disabled = true;
    swipeEls.next.disabled = true;
    updateSwipeRankControl(null);
    updateSwipeMainSiteControl(null);
    updateSwipePreviewControl(null);
    updateSwipeEditControl(null);
    updateSwipeDeleteControl(null);
    renderSwipePreview(null);
    return;
  }

  state.swipeIndex = Math.max(0, Math.min(state.swipeIndex, entries.length - 1));
  const entry = entries[state.swipeIndex];

  swipeEls.position.textContent = `${state.swipeIndex + 1} / ${entries.length.toLocaleString()}`;
  swipeEls.title.textContent = buildDisplayTitle(entry) || entry.siteId;
  swipeEls.title.href = entry.url || '#';
  swipeEls.host.textContent = entry.host ?? '';
  swipeEls.prev.disabled = state.swipeIndex <= 0;
  swipeEls.next.disabled = state.swipeIndex >= entries.length - 1;
  updateSwipeRankControl(entry);
  updateSwipeMainSiteControl(entry);
  updateSwipePreviewControl(entry);
  updateSwipeEditControl(entry);
  updateSwipeDeleteControl(entry);
  renderSwipePreview(entry);
}

function getPreferredSwipePreviewEntry(entry) {
  if (!entry?.siteId) {
    return null;
  }

  const screenshots = getPreviewScreenshots(entry.siteId);
  const mobileScreenshot = screenshots.find((screenshot) => {
    const width = Number(screenshot?.width || screenshot?.params?.width || 0);
    const height = Number(screenshot?.height || screenshot?.params?.height || 0);
    return width > 0 && height > 0 && (height >= width || width <= 480);
  });
  const screenshot = mobileScreenshot || screenshots[0] || null;
  if (!screenshot) {
    return entry;
  }

  return {
    ...entry,
    previewUrl: screenshot.url,
    previewLabel: screenshot.label || screenshot.style || screenshot.capturedAt || 'Cached preview',
    previewScreenshot: screenshot,
    sourceSiteId: entry.siteId,
  };
}

function renderSwipePreview(entry) {
  if (!swipeEls.previewImage) {
    if (!entry?.url) {
      swipeEls.frame?.removeAttribute('src');
      return;
    }
    if (swipeEls.frame && swipeEls.frame.src !== entry.url) {
      swipeEls.frame.src = entry.url;
    }
    return;
  }

  swipeEls.frame?.removeAttribute('src');

  if (!entry) {
    applyPreviewFallback(swipeEls.previewImage);
    swipeEls.previewImage.alt = '';
    swipeEls.previewEmpty?.classList.remove('is-hidden');
    swipeEls.view?.classList.add('is-preview-empty');
    return;
  }

  const displayTitle = buildDisplayTitle(entry) || entry.siteId;
  const previewEntry = getPreferredSwipePreviewEntry(entry);
  const previewUrl = previewEntry?.previewUrl || getPreviewUrl(entry.siteId);
  swipeEls.previewImage.alt = `${displayTitle} preview`;
  swipeEls.previewEmpty?.classList.toggle('is-hidden', Boolean(previewUrl));
  swipeEls.view?.classList.toggle('is-preview-empty', !previewUrl);

  if (!previewUrl) {
    applyPreviewFallback(swipeEls.previewImage);
    return;
  }

  assignPreviewThumbnailImage(swipeEls.previewImage, previewUrl, `${displayTitle} preview`, previewEntry || entry, {
    width: 760,
    quality: 76,
  });
  if (
    swipeEls.previewImage.dataset.src
    && swipeEls.previewImage.dataset.previewState === 'placeholder'
    && !previewQueue.pending.includes(swipeEls.previewImage)
  ) {
    previewQueue.pending.push(swipeEls.previewImage);
  }
  drainPreviewQueue();
}

function navigateSwipe(delta) {
  const newIndex = state.swipeIndex + delta;
  if (newIndex < 0 || newIndex >= state.visibleEntries.length) return;
  state.swipeIndex = newIndex;
  renderSwipeView();
}

function onSwipeTouchStart(event) {
  const t = event.touches[0];
  swipeTouchState = { startX: t.clientX, startY: t.clientY, currentX: t.clientX, startTime: Date.now() };
}

function onSwipeTouchMove(event) {
  if (!swipeTouchState) return;
  swipeTouchState.currentX = event.touches[0].clientX;
}

function onSwipeTouchEnd() {
  if (!swipeTouchState) return;

  const deltaX = swipeTouchState.currentX - swipeTouchState.startX;
  const elapsed = Date.now() - swipeTouchState.startTime;
  const absDelta = Math.abs(deltaX);

  if (absDelta > 50) {
    navigateSwipe(deltaX < 0 ? 1 : -1);
  }

  swipeTouchState = null;
}

/* Touch layer stays permanently on — iframe is view-only. Tap "Open" to use the site. */

function toggleSwipeToolbar(forceOpen = null) {
  if (!swipeEls.toolbar) {
    return;
  }
  const shouldOpen = typeof forceOpen === 'boolean'
    ? forceOpen
    : swipeEls.toolbar.classList.contains('is-hidden');
  swipeEls.toolbar.classList.toggle('is-hidden', !shouldOpen);
  if (shouldOpen) {
    swipeEls.searchInput?.focus();
  }
}

function closeSwipeToolbar() {
  swipeEls.toolbar?.classList.add('is-hidden');
}

/* renderSwipeView is called from render() when state.swipeMode is true */

async function fetchJson(url, options = {}) {
  const response = await fetch(url, { cache: 'no-store', ...options });
  if (!response.ok) {
    throw new Error(`Failed to load ${url}: ${response.status}`);
  }
  const contentType = response.headers.get('content-type') || '';
  const text = await response.text();
  if (!text.trim()) {
    return {};
  }
  try {
    return JSON.parse(text);
  } catch {
    const looksLikeHtml = /<\s*!doctype|<\s*html/i.test(text);
    const source = new URL(url, window.location.href);
    const label = source.pathname || source.href;
    const typeHint = contentType ? ` (${contentType.split(';')[0]})` : '';
    throw new Error(
      looksLikeHtml
        ? `Expected JSON from ${label}, but the server returned HTML${typeHint}.`
        : `Expected JSON from ${label}, but the response could not be parsed.`,
    );
  }
}

async function fetchOptionalJson(url) {
  try {
    return await fetchJson(url);
  } catch {
    return null;
  }
}

async function readJsonResponse(response) {
  const text = await response.text();
  if (!text) {
    return {};
  }

  try {
    return JSON.parse(text);
  } catch {
    return { error: text };
  }
}

function normalizeSiteId(value) {
  return sanitizeSiteIdInput(value)
    .replace(/-+$/g, '');
}

function sanitizeSiteIdInput(value) {
  return String(value ?? '')
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^-+/g, '');
}

function formatTimestamp(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function normalizeCatalogToken(value) {
  return String(value ?? '').trim().toLowerCase();
}

function normalizeCatalogTagList(values) {
  return Array.from(
    new Set(
      (Array.isArray(values) ? values : [])
        .map((value) => normalizeCatalogToken(value))
        .filter((value) => !isReservedCatalogTagId(value))
        .filter(Boolean)
    )
  );
}

function normalizeFamilyMeta(value, siteId) {
  const fallbackId = deriveFamilyId(siteId);
  const rawId = typeof value?.id === 'string' && value.id.trim() ? value.id.trim() : fallbackId;
  if (!rawId || rawId === siteId) {
    return null;
  }

  const count = Number(value?.count ?? 2);
  const memberOrder = Number(value?.memberOrder ?? inferFamilyMemberOrder(siteId, rawId));
  const memberRole = value?.memberRole === 'root' ? 'root' : (siteId === rawId ? 'root' : 'variant');

  return {
    id: rawId,
    label: normalizeFamilyLabel(value?.label, rawId),
    kind: String(value?.kind ?? 'prefix-revision').trim() || 'prefix-revision',
    count: Number.isFinite(count) ? Math.max(2, count) : 2,
    memberOrder: Number.isFinite(memberOrder) ? Math.max(1, memberOrder) : 1,
    memberRole,
    leadSiteId: String(value?.leadSiteId ?? rawId).trim() || rawId,
  };
}

function deriveFamilyId(siteId) {
  let value = normalizeCatalogToken(siteId);
  if (!value) {
    return '';
  }
  const original = value;
  value = value.replace(/-\d{4}-\d{2}-\d{2}(?:-\d{2}-\d{2}(?:-\d{2})?)?(?:-\d+)?$/i, '');
  value = value.replace(/-(?:copy|live|draft|final|new|old)$/i, '');
  value = value.replace(/-(?:v|rev|r)\d+$/i, '');
  value = value.replace(/-\d{4,}$/i, '');
  return value === original ? '' : value;
}

function inferFamilyMemberOrder(siteId, familyId) {
  if (siteId === familyId) {
    return 1;
  }
  return 2;
}

function normalizeFamilyLabel(label, familyId) {
  const fallback = humanizeToken(familyId);
  const raw = String(label ?? '').trim();
  if (!raw) {
    return fallback;
  }

  const cleaned = raw.replace(/[.!?]+$/g, '').trim();
  if (!cleaned) {
    return fallback;
  }

  const normalized = normalizeCatalogToken(cleaned.replace(/\s+/g, '-'));
  if (normalized === familyId) {
    return fallback;
  }

  if (/^[a-z0-9][a-z0-9 .'-]*$/.test(cleaned) && cleaned === cleaned.toLowerCase()) {
    return cleaned
      .split(/\s+/)
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
  }

  return cleaned;
}

function normalizeFriendlyName(value) {
  return String(value ?? '').replace(/\s+/g, ' ').trim();
}

function resolveSharedDisplayName(entries) {
  if (!Array.isArray(entries) || entries.length === 0) {
    return '';
  }

  const uniqueNames = Array.from(new Set(
    entries
      .map((entry) => normalizeFriendlyName(entry?.displayName))
      .filter(Boolean)
  ));

  return uniqueNames.length === 1 ? uniqueNames[0] : '';
}

function humanizeToken(value) {
  return String(value ?? '')
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

const HIDDEN_TAGS = new Set([
  'framework', 'framework-core', 'framework-support',
  'github-pages', 'mullmania-mirror', 'public-frontdoor',
  'repo-artifacts', 'static-ui',
]);

function isFrameworkMetaTag(value) {
  return HIDDEN_TAGS.has(String(value ?? '').toLowerCase());
}

function buildTestStatusFlag(testStatus) {
  switch (testStatus) {
    case 'deep':
      return { label: 'Deep tested', icon: 'ti ti-shield-check', tone: 'tone-success' };
    case 'smoke':
      return { label: 'Smoke tested', icon: 'ti ti-flame', tone: 'tone-info' };
    case 'manual':
      return { label: 'Manual only', icon: 'ti ti-hand-click', tone: 'tone-warning' };
    default:
      return { label: humanizeToken(testStatus), icon: 'ti ti-alert-triangle', tone: 'tone-warning' };
  }
}

function buildHealthFlag(healthStatus, healthCode) {
  if (healthStatus === 'ok') {
    return {
      label: `Live${healthCode ? ` ${healthCode}` : ''}`,
      icon: 'ti ti-circle-check',
      tone: 'tone-success',
    };
  }

  return {
    label: buildHealthLabel(healthStatus, healthCode),
    icon: 'ti ti-alert-circle',
    tone: 'tone-danger',
  };
}

function buildHealthLabel(healthStatus, healthCode) {
  if (healthStatus === 'ok') {
    return `Health: OK${healthCode ? ` ${healthCode}` : ''}`;
  }

  const suffix = healthCode ? ` ${healthCode}` : '';
  return `Health: ${humanizeToken(healthStatus)}${suffix}`;
}
