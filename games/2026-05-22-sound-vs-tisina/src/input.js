// Input manager — mouse + touch on canvas

export class InputManager {
  constructor(canvas) {
    this.canvas = canvas;
    this.mouse = { x: 0, y: 0, down: false };
    this.listeners = {};
    this._bind();
  }

  _bind() {
    const c = this.canvas;

    const getPos = (e) => {
      const rect = c.getBoundingClientRect();
      const scaleX = c.width / rect.width;
      const scaleY = c.height / rect.height;
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      return {
        x: (clientX - rect.left) * scaleX,
        y: (clientY - rect.top) * scaleY
      };
    };

    c.addEventListener('mousedown', (e) => {
      const pos = getPos(e);
      this.mouse = { ...pos, down: true };
      this._emit('down', pos);
    });

    c.addEventListener('mousemove', (e) => {
      const pos = getPos(e);
      this.mouse = { ...pos, down: this.mouse.down };
      if (this.mouse.down) this._emit('drag', pos);
      this._emit('move', pos);
    });

    c.addEventListener('mouseup', (e) => {
      const pos = getPos(e);
      this.mouse = { ...pos, down: false };
      this._emit('up', pos);
    });

    c.addEventListener('touchstart', (e) => {
      e.preventDefault();
      const pos = getPos(e);
      this.mouse = { ...pos, down: true };
      this._emit('down', pos);
    }, { passive: false });

    c.addEventListener('touchmove', (e) => {
      e.preventDefault();
      const pos = getPos(e);
      this.mouse = { ...pos, down: true };
      this._emit('drag', pos);
      this._emit('move', pos);
    }, { passive: false });

    c.addEventListener('touchend', (e) => {
      e.preventDefault();
      this.mouse.down = false;
      this._emit('up', this.mouse);
    }, { passive: false });
  }

  on(event, fn) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(fn);
    return this;
  }

  off(event, fn) {
    if (!this.listeners[event]) return;
    this.listeners[event] = this.listeners[event].filter(f => f !== fn);
  }

  _emit(event, data) {
    if (!this.listeners[event]) return;
    for (const fn of this.listeners[event]) fn(data);
  }
}
