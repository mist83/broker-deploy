/**
 * UI.Swipe — Pointer-event swipe gesture binder
 * @version 1.0.0
 * @description Single implementation handles touch, mouse, and pen via Pointer Events.
 *              Binds to any element, fires onSwipeLeft/onSwipeRight, provides drag feedback,
 *              and exposes viewport/touch helpers.
 *
 * Usage:
 *   const handle = window.UI.Swipe.bind(cardEl, {
 *     threshold: 0.22,
 *     onSwipeLeft: () => state.next(),
 *     onSwipeRight: () => state.prev(),
 *     onDragMove: ({ progress }) => { ... },
 *   });
 *   // later: handle.destroy();
 */
(function (window, document) {
  'use strict';

  const DEFAULT_THRESHOLD = 0.25;          // fraction of element width
  const MIN_THRESHOLD_PX = 60;             // never require less than this
  const DEFAULT_VELOCITY = 0.5;            // px/ms — flicks commit even below threshold
  const DEFAULT_ROTATION = 12;             // max degrees during drag
  const COMMIT_TRANSITION_MS = 260;
  const SPRING_BACK_MS = 220;

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function noop() {}

  function supportsPointerEvents() {
    return typeof window.PointerEvent === 'function';
  }

  function bind(element, options) {
    if (!element || !(element instanceof Element)) {
      throw new Error('UI.Swipe.bind requires an Element');
    }

    const opts = options || {};
    const onSwipeLeft = opts.onSwipeLeft || noop;
    const onSwipeRight = opts.onSwipeRight || noop;
    const onDragMove = opts.onDragMove || noop;
    const onDragEnd = opts.onDragEnd || noop;
    const thresholdFraction = typeof opts.threshold === 'number' ? opts.threshold : DEFAULT_THRESHOLD;
    const velocityThreshold = typeof opts.velocityThreshold === 'number' ? opts.velocityThreshold : DEFAULT_VELOCITY;
    const allowVertical = Boolean(opts.allowVertical);
    const rotation = typeof opts.rotation === 'number' ? opts.rotation : DEFAULT_ROTATION;

    let pointerId = null;
    let startX = 0;
    let startY = 0;
    let startTime = 0;
    let lastX = 0;
    let lastTime = 0;
    let velocity = 0;
    let dragging = false;
    let released = false;
    let animationTimer = null;
    let touchStart = null;
    let touchMove = null;
    let touchEnd = null;
    let touchCancel = null;

    function thresholdPx() {
      const width = element.getBoundingClientRect().width || 1;
      return Math.max(MIN_THRESHOLD_PX, width * thresholdFraction);
    }

    function elementWidth() {
      return element.getBoundingClientRect().width || 1;
    }

    function applyTransform(dx) {
      const width = elementWidth();
      const deg = (dx / width) * rotation;
      element.style.transform = `translateX(${dx}px) rotate(${deg}deg)`;
    }

    function clearTransform() {
      element.style.transform = '';
    }

    function beginDrag(event) {
      if (pointerId !== null) return;
      pointerId = event.pointerId;
      startX = event.clientX;
      startY = event.clientY;
      lastX = event.clientX;
      lastTime = event.timeStamp;
      startTime = event.timeStamp;
      velocity = 0;
      dragging = false;
      released = false;
      element.classList.add('is-dragging');
      try {
        element.setPointerCapture(pointerId);
      } catch (err) {
        // ignore — some browsers throw if already captured
      }
    }

    function moveDrag(event) {
      if (event.pointerId !== pointerId || released) return;
      const dx = event.clientX - startX;
      const dy = event.clientY - startY;

      if (!dragging) {
        // Decide whether this is a horizontal drag or a vertical scroll.
        if (Math.abs(dy) > Math.abs(dx) && !allowVertical && Math.abs(dy) > 8) {
          // Hand off to page scroll — release capture and bail.
          try {
            element.releasePointerCapture(pointerId);
          } catch (err) { /* ignore */ }
          pointerId = null;
          released = true;
          element.classList.remove('is-dragging');
          return;
        }
        if (Math.abs(dx) > 6) {
          dragging = true;
        } else {
          return;
        }
      }

      // Velocity tracking — px/ms averaged across the last step.
      const now = event.timeStamp;
      const stepDx = event.clientX - lastX;
      const stepDt = Math.max(1, now - lastTime);
      velocity = stepDx / stepDt;
      lastX = event.clientX;
      lastTime = now;

      applyTransform(dx);
      const progress = clamp(Math.abs(dx) / thresholdPx(), 0, 1);
      onDragMove({ dx, dy, progress, velocity });
    }

    function endDrag(event, cancelled) {
      if (event.pointerId !== pointerId) return;
      const dx = event.clientX - startX;
      const absVelocity = Math.abs(velocity);
      const committed = !cancelled && (Math.abs(dx) >= thresholdPx() || absVelocity >= velocityThreshold);
      const direction = dx < 0 ? 'left' : 'right';

      try {
        element.releasePointerCapture(pointerId);
      } catch (err) { /* ignore */ }
      pointerId = null;

      if (!dragging && !committed) {
        // Tap, not a drag.
        element.classList.remove('is-dragging');
        clearTransform();
        onDragEnd({ committed: false, direction: null });
        return;
      }

      if (committed) {
        const width = elementWidth();
        const offscreen = direction === 'left' ? -width * 1.4 : width * 1.4;
        element.style.transition = `transform ${COMMIT_TRANSITION_MS}ms ease-out, opacity ${COMMIT_TRANSITION_MS}ms ease-out`;
        element.style.transform = `translateX(${offscreen}px) rotate(${direction === 'left' ? -rotation : rotation}deg)`;
        element.style.opacity = '0';
        clearTimeout(animationTimer);
        animationTimer = setTimeout(() => {
          element.classList.remove('is-dragging');
          element.style.transition = '';
          element.style.opacity = '';
          clearTransform();
          if (direction === 'left') onSwipeLeft({ dx, velocity });
          else onSwipeRight({ dx, velocity });
          onDragEnd({ committed: true, direction });
        }, COMMIT_TRANSITION_MS);
      } else {
        // Spring back to origin.
        element.style.transition = `transform ${SPRING_BACK_MS}ms ease-out`;
        clearTransform();
        clearTimeout(animationTimer);
        animationTimer = setTimeout(() => {
          element.classList.remove('is-dragging');
          element.style.transition = '';
          onDragEnd({ committed: false, direction: null });
        }, SPRING_BACK_MS);
      }
    }

    function onKeyDown(event) {
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        onSwipeLeft({ dx: -elementWidth(), velocity: 0 });
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        onSwipeRight({ dx: elementWidth(), velocity: 0 });
      }
    }

    const pointerDown = (event) => beginDrag(event);
    const pointerMove = (event) => moveDrag(event);
    const pointerUp = (event) => endDrag(event, false);
    const pointerCancel = (event) => endDrag(event, true);

    if (supportsPointerEvents()) {
      element.addEventListener('pointerdown', pointerDown);
      element.addEventListener('pointermove', pointerMove);
      element.addEventListener('pointerup', pointerUp);
      element.addEventListener('pointercancel', pointerCancel);
    } else {
      // Very old-browser fallback — touch only.
      const toPointer = (touchEvent, type) => ({
        pointerId: 1,
        clientX: (touchEvent.changedTouches && touchEvent.changedTouches[0] ? touchEvent.changedTouches[0].clientX : 0),
        clientY: (touchEvent.changedTouches && touchEvent.changedTouches[0] ? touchEvent.changedTouches[0].clientY : 0),
        timeStamp: touchEvent.timeStamp,
      });
      touchStart = (e) => beginDrag(toPointer(e, 'down'));
      touchMove = (e) => moveDrag(toPointer(e, 'move'));
      touchEnd = (e) => endDrag(toPointer(e, 'up'), false);
      touchCancel = (e) => endDrag(toPointer(e, 'cancel'), true);
      element.addEventListener('touchstart', touchStart, { passive: true });
      element.addEventListener('touchmove', touchMove, { passive: true });
      element.addEventListener('touchend', touchEnd);
      element.addEventListener('touchcancel', touchCancel);
    }

    element.addEventListener('keydown', onKeyDown);

    return {
      destroy() {
        clearTimeout(animationTimer);
        element.removeEventListener('pointerdown', pointerDown);
        element.removeEventListener('pointermove', pointerMove);
        element.removeEventListener('pointerup', pointerUp);
        element.removeEventListener('pointercancel', pointerCancel);
        if (touchStart) element.removeEventListener('touchstart', touchStart);
        if (touchMove) element.removeEventListener('touchmove', touchMove);
        if (touchEnd) element.removeEventListener('touchend', touchEnd);
        if (touchCancel) element.removeEventListener('touchcancel', touchCancel);
        element.removeEventListener('keydown', onKeyDown);
        element.classList.remove('is-dragging');
        element.style.transform = '';
        element.style.transition = '';
        element.style.opacity = '';
      },
    };
  }

  function isTouchDevice() {
    if (typeof window.matchMedia !== 'function') return false;
    return window.matchMedia('(hover: none) and (pointer: coarse)').matches;
  }

  function isMobileViewport() {
    if (typeof window.matchMedia !== 'function') return false;
    return window.matchMedia('(max-width: 768px)').matches;
  }

  function onViewportChange(callback) {
    if (typeof window.matchMedia !== 'function' || typeof callback !== 'function') {
      return () => {};
    }
    const query = window.matchMedia('(max-width: 768px)');
    const handler = (event) => callback(event.matches);
    if (query.addEventListener) {
      query.addEventListener('change', handler);
      return () => query.removeEventListener('change', handler);
    }
    query.addListener(handler);
    return () => query.removeListener(handler);
  }

  const UISwipe = {
    bind,
    isTouchDevice,
    isMobileViewport,
    onViewportChange,
    version: '1.0.0',
  };

  window.UISwipe = UISwipe;
  if (window.UI) {
    window.UI.Swipe = UISwipe;
  } else {
    // UI loader may not have created window.UI yet if this script is loaded standalone.
    window.UI = { Swipe: UISwipe };
  }
})(window, document);
