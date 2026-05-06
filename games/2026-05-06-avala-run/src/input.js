const input = { jump: false, duck: false, jumpPressed: false, duckPressed: false, left: false, right: false };

let _isTouchDevice = false;

export function initInput(canvas) {
  window.addEventListener('keydown', e => {
    if (['ArrowUp', 'Space', 'KeyW'].includes(e.code)) {
      input.jump = true;
      input.jumpPressed = true;
    }
    if (['ArrowDown', 'KeyS'].includes(e.code)) {
      input.duck = true;
      input.duckPressed = true;
    }
    if (['ArrowLeft', 'KeyA'].includes(e.code)) input.left = true;
    if (['ArrowRight', 'KeyD'].includes(e.code)) input.right = true;
    if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) e.preventDefault();
  });

  window.addEventListener('keyup', e => {
    if (['ArrowUp', 'Space', 'KeyW'].includes(e.code)) input.jump = false;
    if (['ArrowDown', 'KeyS'].includes(e.code)) {
      input.duck = false;
      input.duckPressed = false;
    }
    if (['ArrowLeft', 'KeyA'].includes(e.code)) input.left = false;
    if (['ArrowRight', 'KeyD'].includes(e.code)) input.right = false;
  });

  // Detect touch device and setup touch button controls
  _isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);

  if (_isTouchDevice) {
    _initTouchButtons();
  }

  // Keep canvas touch fallback for devices without visible buttons (shouldn't happen, but safe)
  canvas.addEventListener('touchstart', e => {
    e.preventDefault();
  }, { passive: false });

  canvas.addEventListener('touchend', e => {
    e.preventDefault();
  }, { passive: false });
}

function _initTouchButtons() {
  const btnJump = document.getElementById('btn-touch-jump');
  const btnLeft = document.getElementById('btn-touch-left');
  const btnDuck = document.getElementById('btn-touch-duck');
  const btnRight = document.getElementById('btn-touch-right');

  if (!btnJump || !btnLeft || !btnDuck || !btnRight) return;

  // Helper to add touch listeners
  function addTouchHandler(el, onStart, onEnd) {
    el.addEventListener('touchstart', e => {
      e.preventDefault();
      el.classList.add('active');
      onStart();
    }, { passive: false });
    el.addEventListener('touchend', e => {
      e.preventDefault();
      el.classList.remove('active');
      onEnd();
    }, { passive: false });
    el.addEventListener('touchcancel', e => {
      el.classList.remove('active');
      onEnd();
    }, { passive: false });
  }

  addTouchHandler(btnJump,
    () => { input.jump = true; input.jumpPressed = true; },
    () => { input.jump = false; }
  );
  addTouchHandler(btnLeft,
    () => { input.left = true; },
    () => { input.left = false; }
  );
  addTouchHandler(btnDuck,
    () => { input.duck = true; input.duckPressed = true; },
    () => { input.duck = false; input.duckPressed = false; }
  );
  addTouchHandler(btnRight,
    () => { input.right = true; },
    () => { input.right = false; }
  );
}

/** Show touch controls (call when game is playing) */
export function showTouchControls() {
  if (!_isTouchDevice) return;
  const el = document.getElementById('touch-controls');
  if (el) el.classList.remove('hidden');
}

/** Hide touch controls (call on menu/game over) */
export function hideTouchControls() {
  const el = document.getElementById('touch-controls');
  if (el) el.classList.add('hidden');
}

export function consumeJump() {
  const v = input.jumpPressed;
  input.jumpPressed = false;
  return v;
}

export function consumeDuck() {
  const v = input.duckPressed;
  input.duckPressed = false;
  return v;
}

export function getInput() { return input; }
