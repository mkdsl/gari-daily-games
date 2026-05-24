// input.js — Touch + click unified input

/**
 * Attach a unified tap handler to an element.
 * Works with both touchstart/touchend and click.
 */
export function onTap(element, handler) {
  if (!element) return;
  let touchStarted = false;
  let touchStartX = 0;
  let touchStartY = 0;

  element.addEventListener('touchstart', (e) => {
    touchStarted = true;
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
  }, { passive: true });

  element.addEventListener('touchend', (e) => {
    if (!touchStarted) return;
    touchStarted = false;
    const dx = e.changedTouches[0].clientX - touchStartX;
    const dy = e.changedTouches[0].clientY - touchStartY;
    // Only fire if not a swipe (< 10px movement)
    if (Math.abs(dx) < 10 && Math.abs(dy) < 10) {
      e.preventDefault();
      handler(e);
    }
  }, { passive: false });

  element.addEventListener('click', (e) => {
    if (!touchStarted) handler(e);
  });
}

/**
 * Remove all children from an element and rebuild with option buttons.
 */
export function buildOptionButtons(container, options, onSelect) {
  container.innerHTML = '';
  options.forEach((text, i) => {
    const btn = document.createElement('button');
    btn.className = 'btn btn-option';
    btn.dataset.index = i;
    btn.textContent = text;
    btn.setAttribute('aria-label', text);
    onTap(btn, () => onSelect(i, text, btn));
    container.appendChild(btn);
  });
}
