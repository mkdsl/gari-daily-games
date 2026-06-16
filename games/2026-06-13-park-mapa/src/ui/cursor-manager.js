let currentCursor = 'default';
let targetEl = null;

export function initCursorManager(element) {
  targetEl = element || document.body;
  setCursor('crosshair');
}

export function setCursor(cursorType) {
  if (currentCursor === cursorType) return;
  currentCursor = cursorType;
  if (targetEl) targetEl.style.cursor = cursorType;
}

export function updateCursorForContext(context) {
  // context: { zone, isLocked, isEgg, isButton }
  if (context.isButton) { setCursor('pointer'); return; }
  if (context.isEgg) { setCursor('pointer'); return; }
  if (context.isLocked) { setCursor('not-allowed'); return; }

  switch (context.zone) {
    case 'pult': setCursor('cell'); break;
    case 'bina': setCursor('default'); break;
    case 'suma': setCursor('cell'); break;
    default: setCursor('crosshair'); break;
  }
}

export function resetCursor() {
  setCursor('crosshair');
}

export function getCurrentCursor() { return currentCursor; }
