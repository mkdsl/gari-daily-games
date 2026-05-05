/** @type {{ jump: boolean, duck: boolean, jumpPressed: boolean, duckPressed: boolean }} */
const input = { jump: false, duck: false, jumpPressed: false, duckPressed: false };

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
    if (['Space', 'ArrowUp', 'ArrowDown'].includes(e.code)) e.preventDefault();
  });

  window.addEventListener('keyup', e => {
    if (['ArrowUp', 'Space', 'KeyW'].includes(e.code)) input.jump = false;
    if (['ArrowDown', 'KeyS'].includes(e.code)) {
      input.duck = false;
      input.duckPressed = false;
    }
  });

  canvas.addEventListener('touchstart', e => {
    e.preventDefault();
    const touch = e.changedTouches[0];
    const rect = canvas.getBoundingClientRect();
    const relY = touch.clientY - rect.top;
    if (relY < rect.height / 2) {
      input.jump = true;
      input.jumpPressed = true;
    } else {
      input.duck = true;
      input.duckPressed = true;
    }
  }, { passive: false });

  canvas.addEventListener('touchend', e => {
    e.preventDefault();
    input.jump = false;
    input.duck = false;
  }, { passive: false });
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
