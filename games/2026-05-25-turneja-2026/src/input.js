// input.js — Touch/click normalization and centralized input setup

let _callbacks = {};

/**
 * Normalize touch & click into unified 'tap' handler
 * Prevents double-fire on mobile devices
 */
function normalizeTap(element, handler) {
  let touchStarted = false;
  let touchMoved = false;
  let startX = 0;
  let startY = 0;

  element.addEventListener('touchstart', (e) => {
    touchStarted = true;
    touchMoved = false;
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
  }, { passive: true });

  element.addEventListener('touchmove', (e) => {
    const dx = Math.abs(e.touches[0].clientX - startX);
    const dy = Math.abs(e.touches[0].clientY - startY);
    if (dx > 8 || dy > 8) touchMoved = true;
  }, { passive: true });

  element.addEventListener('touchend', (e) => {
    if (touchStarted && !touchMoved) {
      e.preventDefault();
      touchStarted = false;
      handler(e);
    }
    touchStarted = false;
  });

  element.addEventListener('click', (e) => {
    if (!touchStarted) {
      handler(e);
    }
  });
}

/**
 * Register a tap/click listener on an element, with touch normalization
 * Returns a cleanup function
 */
export function onTap(element, handler) {
  if (!element) return () => {};
  normalizeTap(element, handler);
  return () => {
    // Cleanup is implicit via removing element from DOM
  };
}

/**
 * Register tap on all elements matching a selector within a root
 */
export function onTapAll(root, selector, handler) {
  const els = root.querySelectorAll(selector);
  els.forEach(el => onTap(el, (e) => handler(e, el)));
}

/**
 * Setup centralized input callbacks for the game
 * callbacks: { onCardTap, onButtonTap, onOverlayTap }
 */
export function setupInput(callbacks) {
  _callbacks = callbacks || {};
}

/**
 * Make a button element fully tap-ready with min dimensions
 */
export function makeTapReady(el) {
  if (!el) return;
  el.style.minHeight = el.style.minHeight || '44px';
  el.style.minWidth = el.style.minWidth || '44px';
  el.style.touchAction = 'manipulation';
  el.style.webkitUserSelect = 'none';
  el.style.userSelect = 'none';
  el.style.cursor = 'pointer';
}

/**
 * Apply tap-ready styling to all buttons in a container
 */
export function makeAllTapReady(container) {
  if (!container) return;
  const btns = container.querySelectorAll('button, .btn, .crew-card, .booking-card, .promo-card, .crew-action-card');
  btns.forEach(makeTapReady);
}
