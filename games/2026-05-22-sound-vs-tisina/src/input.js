// input.js — mouse + touch handler per canvas
export class InputManager {
  constructor(canvas) {
    this.canvas = canvas;
    this.mousePos = { x: 0, y: 0 };
    this.mouseDown = false;
    this._handlers = [];
    this._bind();
  }

  _bind() {
    const c = this.canvas;

    const onMouseMove = (e) => {
      const rect = c.getBoundingClientRect();
      const scaleX = c.width / rect.width;
      const scaleY = c.height / rect.height;
      this.mousePos = {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY
      };
    };

    const onMouseDown = (e) => {
      this.mouseDown = true;
      const rect = c.getBoundingClientRect();
      const scaleX = c.width / rect.width;
      const scaleY = c.height / rect.height;
      const pos = {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY
      };
      this._dispatch('click', pos);
    };

    const onMouseUp = () => { this.mouseDown = false; };

    const onTouchStart = (e) => {
      e.preventDefault();
      this.mouseDown = true;
      const rect = c.getBoundingClientRect();
      const scaleX = c.width / rect.width;
      const scaleY = c.height / rect.height;
      const t = e.touches[0];
      const pos = {
        x: (t.clientX - rect.left) * scaleX,
        y: (t.clientY - rect.top) * scaleY
      };
      this.mousePos = pos;
      this._dispatch('click', pos);
    };

    const onTouchMove = (e) => {
      e.preventDefault();
      const rect = c.getBoundingClientRect();
      const scaleX = c.width / rect.width;
      const scaleY = c.height / rect.height;
      const t = e.touches[0];
      this.mousePos = {
        x: (t.clientX - rect.left) * scaleX,
        y: (t.clientY - rect.top) * scaleY
      };
    };

    const onTouchEnd = () => { this.mouseDown = false; };

    c.addEventListener('mousemove', onMouseMove);
    c.addEventListener('mousedown', onMouseDown);
    c.addEventListener('mouseup', onMouseUp);
    c.addEventListener('touchstart', onTouchStart, { passive: false });
    c.addEventListener('touchmove', onTouchMove, { passive: false });
    c.addEventListener('touchend', onTouchEnd);

    this._handlers = [
      [c, 'mousemove', onMouseMove],
      [c, 'mousedown', onMouseDown],
      [c, 'mouseup', onMouseUp],
      [c, 'touchstart', onTouchStart],
      [c, 'touchmove', onTouchMove],
      [c, 'touchend', onTouchEnd]
    ];
  }

  on(event, fn) {
    if (!this._listeners) this._listeners = {};
    if (!this._listeners[event]) this._listeners[event] = [];
    this._listeners[event].push(fn);
  }

  _dispatch(event, data) {
    if (!this._listeners || !this._listeners[event]) return;
    for (const fn of this._listeners[event]) fn(data);
  }

  destroy() {
    for (const [el, ev, fn] of this._handlers) {
      el.removeEventListener(ev, fn);
    }
  }
}
