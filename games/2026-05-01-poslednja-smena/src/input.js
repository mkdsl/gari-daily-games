// Keyboard shortcuts: 1/2/3 for option selection, R for restart on epilog screen
let _keyCallback = null;

export function initInput() {
  window.addEventListener('keydown', (e) => {
    if (!_keyCallback) return;
    if (e.key === '1') _keyCallback(0);
    else if (e.key === '2') _keyCallback(1);
    else if (e.key === '3') _keyCallback(2);
  });
}

export function setChoiceCallback(fn) {
  _keyCallback = fn;
}

export function clearChoiceCallback() {
  _keyCallback = null;
}
