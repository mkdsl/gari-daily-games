/**
 * @module timing-puzzle — etapa1 radial meter, 60s countdown
 */
import { ETAPA1 } from '../config.js';

const R = 80, CX = 100, CY = 100;

/**
 * @param {SVGElement} svgEl
 * @param {(accuracy: number) => void} onComplete
 * @param {(accuracy: number) => void} onTap
 * @returns {{ start: Function, stop: Function, handleTap: Function, setTimerEl: Function }}
 */
export function createTimingPuzzle(svgEl, onComplete, onTap) {
  let zoneCenterDeg = Math.random() * 360;
  let timeLeft = ETAPA1.DURATION_S;
  let active = false;
  let _tick = null;
  let _zoneMove = null;
  let _timerEl = null;
  let _zoneEl = null;
  let _arcEl = null;

  function _rad(deg) { return (deg - 90) * Math.PI / 180; }

  function _pt(deg) {
    return { x: CX + R * Math.cos(_rad(deg)), y: CY + R * Math.sin(_rad(deg)) };
  }

  function _arcPath(s, e) {
    const a = _pt(s), b = _pt(e);
    const large = ((e - s + 360) % 360) > 180 ? 1 : 0;
    return `M ${a.x} ${a.y} A ${R} ${R} 0 ${large} 1 ${b.x} ${b.y}`;
  }

  function _svg(tag, attrs) {
    const el = document.createElementNS('http://www.w3.org/2000/svg', tag);
    Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
    return el;
  }

  function _draw() {
    svgEl.setAttribute('viewBox', '0 0 200 200');
    svgEl.innerHTML = '';

    // Track ring
    svgEl.appendChild(_svg('circle', { cx: CX, cy: CY, r: R, fill: 'none', stroke: '#3a3a4a', 'stroke-width': '12' }));

    // Zone arc (sweet spot)
    _zoneEl = _svg('path', { fill: 'none', stroke: '#f5d87a', 'stroke-width': '14', 'stroke-linecap': 'round' });
    svgEl.appendChild(_zoneEl);

    // Time ring
    _arcEl = _svg('circle', {
      cx: CX, cy: CY, r: R, fill: 'none',
      stroke: '#f5d87a', 'stroke-width': '4', 'stroke-opacity': '0.3',
      'stroke-dasharray': `${2 * Math.PI * R}`,
      'stroke-dashoffset': '0',
      transform: `rotate(-90 ${CX} ${CY})`
    });
    svgEl.appendChild(_arcEl);

    // Center circle
    svgEl.appendChild(_svg('circle', { cx: CX, cy: CY, r: '22', fill: '#2a2a3a', stroke: '#f5d87a', 'stroke-width': '2' }));

    const label = _svg('text', { x: CX, y: CY + 5, 'text-anchor': 'middle', 'font-size': '13', fill: '#f5d87a' });
    label.textContent = 'TAP';
    svgEl.appendChild(label);

    _updateZone();
  }

  function _updateZone() {
    if (!_zoneEl) return;
    const h = ETAPA1.SWEET_SPOT_DEG / 2;
    _zoneEl.setAttribute('d', _arcPath(zoneCenterDeg - h, zoneCenterDeg + h));
  }

  function _updateArc() {
    if (!_arcEl) return;
    const circ = 2 * Math.PI * R;
    _arcEl.setAttribute('stroke-dashoffset', `${circ * (1 - timeLeft / ETAPA1.DURATION_S)}`);
  }

  /** @param {HTMLElement} el */
  function setTimerEl(el) { _timerEl = el; }

  function start() {
    active = true;
    _draw();
    _tick = setInterval(() => {
      timeLeft = Math.max(0, timeLeft - 1);
      _updateArc();
      if (_timerEl) _timerEl.textContent = timeLeft + 's';
      if (timeLeft <= 0) { stop(); onComplete(0); }
    }, 1000);
    _zoneMove = setInterval(() => {
      zoneCenterDeg = Math.random() * 360;
      _updateZone();
    }, ETAPA1.ZONE_MOVE_INTERVAL_S * 1000);
  }

  function stop() {
    active = false;
    clearInterval(_tick);
    clearInterval(_zoneMove);
    _tick = _zoneMove = null;
  }

  /**
   * @param {number} clientX
   * @param {number} clientY
   * @returns {number} accuracy 0–100
   */
  function handleTap(clientX, clientY) {
    if (!active) return 0;
    const rect = svgEl.getBoundingClientRect();
    const sx = (clientX - rect.left) * (200 / rect.width);
    const sy = (clientY - rect.top)  * (200 / rect.height);
    const tapDeg = (Math.atan2(sy - CY, sx - CX) * 180 / Math.PI + 90 + 360) % 360;

    let offset = Math.abs(tapDeg - zoneCenterDeg);
    if (offset > 180) offset = 360 - offset;

    const accuracy = Math.max(0, Math.min(100, 100 - offset * ETAPA1.ACCURACY_COEFF));

    // Zone colour feedback
    if (_zoneEl) {
      _zoneEl.setAttribute('stroke', offset <= ETAPA1.SWEET_SPOT_DEG / 2 ? '#4caf50' : '#e57373');
      setTimeout(() => { if (_zoneEl) _zoneEl.setAttribute('stroke', '#f5d87a'); }, 350);
    }

    onTap(accuracy);
    stop();
    setTimeout(() => onComplete(accuracy), 400);
    return accuracy;
  }

  return { start, stop, handleTap, setTimerEl };
}

/**
 * @param {number} accuracy 0–100
 * @returns {number} Δ1: -5..+15
 */
export function computeDelta1(accuracy) {
  return Math.round(accuracy / 100 * 20) - 5;
}
