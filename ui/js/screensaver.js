/**
 * UI Screensaver - Canon Slideshow Controller
 * @version 1.0.0
 * @description Full-bleed media slideshow with keyboard-friendly controller API
 * @license MIT
 */

(function(window, document) {
    'use strict';

    const UI = window.UI || (window.UI = {});
    const PLAYBACK_RANDOM = 'random';
    const PLAYBACK_SEQUENTIAL = 'sequential';
    const DEFAULT_INTERVAL_MS = 9000;
    const DEFAULT_FLASH_MS = 1400;
    const DEFAULT_CHROME_HIDE_MS = 3000;
    const STYLE_ID = 'ui-screensaver-style';

    function attach(target, options = {}) {
        const root = resolveTarget(target);
        if (!root) {
            throw new Error('UI.Screensaver.attach target was not found.');
        }
        return new ScreensaverController(root, options);
    }

    class ScreensaverController {
        constructor(root, options) {
            this.root = root;
            this.options = options || {};
            this.items = sanitizeItems(this.options.items);
            this.index = this.items.length > 0 ? 0 : -1;
            this.activeLayer = 0;
            this.timer = 0;
            this.flashTimer = 0;
            this.chromeTimer = 0;
            this.isPaused = false;
            this.destroyed = false;
            this.playbackMode = sanitizePlaybackMode(this.options.playbackMode);
            this.brokenSrcs = new Set();
            this.boundRevealChrome = () => this.revealChrome();
            this.boundVisibilityChange = () => {
                if (document.hidden) this.pause();
                else this.play();
            };

            ensureStyles();
            this.renderShell();
            this.bindChrome();
            document.addEventListener('visibilitychange', this.boundVisibilityChange);
            this.showIndex(this.index, { immediate: true });
            this.play();
        }

        renderShell() {
            this.root.replaceChildren();
            this.root.classList.add('screensaver-shell');

            const stage = document.createElement('div');
            stage.id = 'slideshow-stage';
            stage.className = 'screensaver-stage';
            stage.tabIndex = -1;
            stage.setAttribute('role', 'region');
            stage.setAttribute('aria-label', this.options.label || 'Slideshow stage');

            const layerA = document.createElement('div');
            layerA.className = 'screensaver-stage__layer is-active';
            layerA.dataset.slideshowLayer = '0';

            const layerB = document.createElement('div');
            layerB.className = 'screensaver-stage__layer';
            layerB.dataset.slideshowLayer = '1';

            const empty = document.createElement('div');
            empty.className = 'screensaver-stage__empty is-hidden';
            const emptyIcon = document.createElement('i');
            emptyIcon.className = this.options.emptyIcon || 'ti ti-photo-off';
            const emptyText = document.createElement('span');
            emptyText.textContent = this.options.emptyText || 'No slideshow media is available.';
            empty.append(emptyIcon, emptyText);

            const meta = document.createElement('div');
            meta.className = 'screensaver-stage__meta';

            const eyebrow = document.createElement('div');
            eyebrow.className = 'screensaver-stage__eyebrow screensaver-stage__chip';

            const position = document.createElement('div');
            position.id = 'slideshow-position-badge';
            position.className = 'screensaver-stage__position screensaver-stage__chip';

            const title = document.createElement('div');
            title.className = 'screensaver-stage__title';

            meta.append(eyebrow, position, title);

            const flash = document.createElement('div');
            flash.className = 'screensaver-stage__flash is-hidden';

            stage.append(layerA, layerB, empty, meta, flash);
            this.root.append(stage);

            this.stageEl = stage;
            this.layers = [layerA, layerB];
            this.emptyEl = empty;
            this.metaEl = meta;
            this.eyebrowEl = eyebrow;
            this.positionEl = position;
            this.titleEl = title;
            this.flashEl = flash;
        }

        bindChrome() {
            this.chromeRoot = this.options.chromeRoot || document.body;
            this.chromeRoot?.addEventListener?.('mousemove', this.boundRevealChrome);
            this.chromeRoot?.addEventListener?.('pointerdown', this.boundRevealChrome);
            this.scheduleChromeHide();
        }

        currentItem() {
            return this.items[this.index] || null;
        }

        setItems(items) {
            const nextItems = sanitizeItems(items);
            const currentId = this.currentItem()?.id || '';
            this.items = nextItems;

            if (this.items.length === 0) {
                this.index = -1;
            } else {
                const preservedIndex = currentId
                    ? this.items.findIndex((item) => item.id === currentId)
                    : -1;
                this.index = preservedIndex >= 0 ? preservedIndex : Math.min(Math.max(this.index, 0), this.items.length - 1);
            }

            this.showIndex(this.index, { immediate: true });
            this.play();
        }

        getPlaybackMode() {
            return this.playbackMode;
        }

        setPlaybackMode(mode) {
            this.playbackMode = sanitizePlaybackMode(mode);
            this.play();
        }

        play() {
            this.isPaused = false;
            this.clearTimer();
            if (this.items.length > 1) {
                this.timer = window.setTimeout(() => {
                    void this.advance();
                }, toPositiveNumber(this.options.intervalMs, DEFAULT_INTERVAL_MS));
            }
        }

        pause() {
            this.isPaused = true;
            this.clearTimer();
        }

        async advance() {
            return this.next({ auto: true });
        }

        async next() {
            if (this.items.length === 0) return null;
            const nextIndex = this.playbackMode === PLAYBACK_RANDOM
                ? this.pickRandomIndex(1)
                : (this.index + 1) % this.items.length;
            return this.showIndex(nextIndex);
        }

        async previous() {
            if (this.items.length === 0) return null;
            const nextIndex = this.playbackMode === PLAYBACK_RANDOM
                ? this.pickRandomIndex(-1)
                : (this.index - 1 + this.items.length) % this.items.length;
            return this.showIndex(nextIndex);
        }

        pickRandomIndex(direction) {
            if (this.items.length <= 1) return 0;
            let nextIndex = this.index;
            for (let attempts = 0; attempts < 6 && nextIndex === this.index; attempts += 1) {
                nextIndex = Math.floor(Math.random() * this.items.length);
            }
            if (nextIndex === this.index) {
                nextIndex = (this.index + direction + this.items.length) % this.items.length;
            }
            return nextIndex;
        }

        async showIndex(index, options = {}) {
            this.clearTimer();

            if (this.items.length === 0 || index < 0) {
                this.index = -1;
                this.renderEmpty();
                return null;
            }

            this.index = normalizeIndex(index, this.items.length);
            const item = this.items[this.index];
            const source = this.resolveRenderableSource(item);
            if (!source) {
                this.brokenSrcs.add(item.src || item.id || String(this.index));
                if (this.items.length > 1) {
                    return this.next();
                }
                this.renderEmpty();
                return null;
            }

            this.renderItem(item, source, options);
            this.options.onItemChange?.(item, {
                index: this.index,
                total: this.items.length,
            });
            this.scheduleChromeHide();

            if (!this.isPaused) {
                this.play();
            }

            return item;
        }

        resolveRenderableSource(item) {
            const sources = Array.isArray(item.sources) && item.sources.length > 0
                ? item.sources
                : [{ kind: item.kind || 'image', src: item.src, alt: item.alt, label: item.label }];
            return sources.find((source) => source?.src && !this.brokenSrcs.has(source.src)) || null;
        }

        renderEmpty() {
            this.layers.forEach((layer) => {
                layer.replaceChildren();
                layer.classList.remove('is-active');
            });
            this.emptyEl?.classList.remove('is-hidden');
            if (this.eyebrowEl) this.eyebrowEl.textContent = '';
            if (this.positionEl) this.positionEl.textContent = '0 / 0';
            if (this.titleEl) this.titleEl.textContent = '';
        }

        renderItem(item, source, options = {}) {
            this.emptyEl?.classList.add('is-hidden');
            const targetLayerIndex = options.immediate ? this.activeLayer : 1 - this.activeLayer;
            const layer = this.layers[targetLayerIndex];
            const staleLayer = this.layers[1 - targetLayerIndex];
            layer.replaceChildren();

            const media = this.createMediaElement(item, source);
            applyMotion(media, item.motion);
            layer.append(media);

            layer.classList.add('is-active');
            staleLayer.classList.remove('is-active');
            this.activeLayer = targetLayerIndex;

            if (this.eyebrowEl) this.eyebrowEl.textContent = item.eyebrow || source.label || 'Preview';
            if (this.positionEl) this.positionEl.textContent = `${this.index + 1} / ${this.items.length}`;
            if (this.titleEl) {
                this.titleEl.replaceChildren();
                const title = document.createElement('span');
                title.className = 'screensaver-stage__title-main';
                title.textContent = item.title || item.id || 'Untitled';
                this.titleEl.append(title);
                if (item.suffix) {
                    const suffix = document.createElement('span');
                    suffix.className = 'screensaver-stage__title-suffix';
                    suffix.textContent = item.suffix;
                    this.titleEl.append(suffix);
                }
            }
        }

        createMediaElement(item, source) {
            const kind = source.kind || item.kind || 'image';
            const media = kind === 'video'
                ? document.createElement('video')
                : document.createElement('img');
            media.className = 'screensaver-stage__media';

            if (kind === 'video') {
                media.src = source.src;
                media.muted = true;
                media.loop = true;
                media.playsInline = true;
                media.autoplay = true;
            } else {
                media.src = source.src;
                media.alt = source.alt || item.alt || item.title || '';
                media.decoding = 'async';
                media.loading = 'eager';
            }

            media.addEventListener('error', () => {
                this.brokenSrcs.add(source.src);
                void this.showIndex(this.index, { immediate: true });
            }, { once: true });

            return media;
        }

        flash(message) {
            if (!this.flashEl) return;
            window.clearTimeout(this.flashTimer);
            this.flashEl.textContent = String(message || '');
            this.flashEl.classList.toggle('is-hidden', !message);
            if (message) {
                this.flashTimer = window.setTimeout(() => {
                    this.flashEl.classList.add('is-hidden');
                }, toPositiveNumber(this.options.flashDurationMs, DEFAULT_FLASH_MS));
            }
        }

        revealChrome() {
            this.chromeRoot?.classList?.remove('is-screensaver-chrome-hidden');
            this.scheduleChromeHide();
        }

        scheduleChromeHide() {
            window.clearTimeout(this.chromeTimer);
            const delay = toPositiveNumber(this.options.chromeHideDelayMs, DEFAULT_CHROME_HIDE_MS);
            this.chromeTimer = window.setTimeout(() => {
                this.chromeRoot?.classList?.add('is-screensaver-chrome-hidden');
            }, delay);
        }

        clearTimer() {
            window.clearTimeout(this.timer);
            this.timer = 0;
        }

        destroy() {
            this.destroyed = true;
            this.clearTimer();
            window.clearTimeout(this.flashTimer);
            window.clearTimeout(this.chromeTimer);
            document.removeEventListener('visibilitychange', this.boundVisibilityChange);
            this.chromeRoot?.removeEventListener?.('mousemove', this.boundRevealChrome);
            this.chromeRoot?.removeEventListener?.('pointerdown', this.boundRevealChrome);
            this.chromeRoot?.classList?.remove('is-screensaver-chrome-hidden');
            this.root.replaceChildren();
            this.root.classList.remove('screensaver-shell');
        }
    }

    function resolveTarget(target) {
        if (typeof target === 'string') {
            return document.querySelector(target);
        }
        return target && target.nodeType === 1 ? target : null;
    }

    function sanitizeItems(items) {
        return Array.isArray(items)
            ? items.filter((item) => item && (item.src || Array.isArray(item.sources)))
            : [];
    }

    function sanitizePlaybackMode(mode) {
        return mode === PLAYBACK_SEQUENTIAL ? PLAYBACK_SEQUENTIAL : PLAYBACK_RANDOM;
    }

    function normalizeIndex(index, total) {
        if (total <= 0) return -1;
        return ((Number(index) || 0) % total + total) % total;
    }

    function toPositiveNumber(value, fallback) {
        const number = Number(value);
        return Number.isFinite(number) && number > 0 ? number : fallback;
    }

    function applyMotion(element, motion = {}) {
        const pairs = {
            startX: '--screensaver-start-x',
            startY: '--screensaver-start-y',
            endX: '--screensaver-end-x',
            endY: '--screensaver-end-y',
            startScale: '--screensaver-start-scale',
            endScale: '--screensaver-end-scale',
            startRotate: '--screensaver-start-rotate',
            endRotate: '--screensaver-end-rotate',
        };

        Object.entries(pairs).forEach(([key, cssName]) => {
            if (motion[key] !== undefined && motion[key] !== null) {
                element.style.setProperty(cssName, String(motion[key]));
            }
        });
    }

    function ensureStyles() {
        if (document.getElementById(STYLE_ID)) return;
        const style = document.createElement('style');
        style.id = STYLE_ID;
        style.textContent = `
.screensaver-shell {
    min-height: 100%;
    background: #05070b;
    color: #fff;
    overflow: hidden;
}
.screensaver-stage {
    position: relative;
    width: 100%;
    min-height: 100vh;
    overflow: hidden;
    background: #05070b;
    outline: none;
}
.screensaver-stage__layer {
    position: absolute;
    inset: 0;
    opacity: 0;
    transition: opacity 700ms ease;
}
.screensaver-stage__layer.is-active {
    opacity: 1;
    z-index: 1;
}
.screensaver-stage__media {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    background: #05070b;
    animation: screensaver-drift 18s ease-in-out alternate infinite;
    transform-origin: center;
}
.screensaver-stage__empty {
    position: absolute;
    inset: 0;
    z-index: 2;
    display: grid;
    place-content: center;
    gap: 14px;
    justify-items: center;
    color: rgba(255, 255, 255, 0.72);
    font: 700 18px/1.35 system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}
.screensaver-stage__empty i {
    font-size: 44px;
}
.screensaver-stage__empty.is-hidden,
.screensaver-stage__flash.is-hidden {
    display: none;
}
.screensaver-stage__meta {
    position: absolute;
    left: clamp(18px, 3vw, 44px);
    right: clamp(18px, 3vw, 44px);
    bottom: clamp(18px, 4vw, 52px);
    z-index: 5;
    display: flex;
    flex-wrap: wrap;
    align-items: end;
    gap: 10px 12px;
    pointer-events: none;
}
.screensaver-stage__chip {
    min-height: 34px;
    display: inline-flex;
    align-items: center;
    padding: 7px 12px;
    border-radius: 999px;
    background: rgba(7, 12, 18, 0.7);
    border: 1px solid rgba(255, 255, 255, 0.18);
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.28);
    color: rgba(255, 255, 255, 0.86);
    font: 750 12px/1 system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    backdrop-filter: blur(14px);
    -webkit-backdrop-filter: blur(14px);
}
.screensaver-stage__rank.is-hidden {
    display: none;
}
.screensaver-stage__title {
    flex-basis: 100%;
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    gap: 0;
    max-width: min(980px, 92vw);
    color: #fff;
    text-shadow: 0 4px 24px rgba(0, 0, 0, 0.62);
    font: 850 clamp(42px, 8vw, 118px)/0.92 system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}
.screensaver-stage__title-suffix {
    color: rgba(255, 255, 255, 0.72);
    font-weight: 760;
}
.screensaver-stage__flash {
    position: absolute;
    top: 50%;
    left: 50%;
    z-index: 7;
    transform: translate(-50%, -50%);
    padding: 14px 22px;
    border-radius: 999px;
    background: rgba(7, 12, 18, 0.76);
    border: 1px solid rgba(255, 255, 255, 0.2);
    color: #fff;
    font: 850 22px/1 system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    box-shadow: 0 16px 48px rgba(0, 0, 0, 0.34);
}
@keyframes screensaver-drift {
    from {
        transform: translate3d(var(--screensaver-start-x, 0), var(--screensaver-start-y, 0), 0)
            scale(var(--screensaver-start-scale, 1.08))
            rotate(var(--screensaver-start-rotate, 0deg));
    }
    to {
        transform: translate3d(var(--screensaver-end-x, 0), var(--screensaver-end-y, 0), 0)
            scale(var(--screensaver-end-scale, 1.14))
            rotate(var(--screensaver-end-rotate, 0deg));
    }
}
@media (max-width: 700px) {
    .screensaver-stage__meta {
        bottom: 18px;
    }
    .screensaver-stage__title {
        font-size: clamp(34px, 14vw, 72px);
    }
}
`;
        (document.head || document.documentElement).appendChild(style);
    }

    UI.Screensaver = {
        attach,
    };
})(window, document);
