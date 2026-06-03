const keys = new Set();
const pointer = { x: 0, y: 0, down: false, pressed: false, released: false };
let _pressedBuffer = false;
let _releasedBuffer = false;

export function initInput(canvas) {
  window.addEventListener('keydown', e => keys.add(e.key.toLowerCase()));
  window.addEventListener('keyup', e => keys.delete(e.key.toLowerCase()));

  const setPointer = (e, down) => {
    const rect = canvas.getBoundingClientRect();
    const t = e.touches?.[0] ?? e;
    pointer.x = (t.clientX - rect.left);
    pointer.y = (t.clientY - rect.top);
    if (down === true) { pointer.down = true; _pressedBuffer = true; }
    if (down === false) { pointer.down = false; _releasedBuffer = true; }
  };

  canvas.addEventListener('mousedown', e => setPointer(e, true));
  canvas.addEventListener('mousemove', e => setPointer(e));
  canvas.addEventListener('mouseup', e => setPointer(e, false));
  canvas.addEventListener('touchstart', e => { e.preventDefault(); setPointer(e, true); }, { passive: false });
  canvas.addEventListener('touchmove', e => { e.preventDefault(); setPointer(e); }, { passive: false });
  canvas.addEventListener('touchend', e => { setPointer(e, false); });
}

export function readInput() {
  const snapshot = {
    keys: new Set(keys),
    pointer: { ...pointer, pressed: _pressedBuffer, released: _releasedBuffer }
  };
  _pressedBuffer = false;
  _releasedBuffer = false;
  return snapshot;
}
