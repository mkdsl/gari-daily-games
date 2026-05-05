/** @type {{ jump: boolean, duck: boolean, jumpPressed: boolean, duckPressed: boolean, left: boolean, right: boolean }} */
const input = { jump: false, duck: false, jumpPressed: false, duckPressed: false, left: false, right: false };

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

  canvas.addEventListener('touchstart', e => {
    e.preventDefault();
    const touch = e.changedTouches[0];
    const rect = canvas.getBoundingClientRect();
    const relY = touch.clientY - rect.top;
    const relX = touch.clientX - rect.left;
    if (relY < rect.height / 2) {
      // Upper half = jump
      input.jump = true;
      input.jumpPressed = true;
    } else {
      // Lower half — divide into thirds
      const third = rect.width / 3;
      if (relX < third) {
        input.left = true;
      } else if (relX > third * 2) {
        input.right = true;
      } else {
        input.duck = true;
        input.duckPressed = true;
      }
    }
  }, { passive: false });

  canvas.addEventListener('touchend', e => {
    e.preventDefault();
    input.jump = false;
    input.duck = false;
    input.jumpPressed = false;
    input.duckPressed = false;
    input.left = false;
    input.right = false;
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
