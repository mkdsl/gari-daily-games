// Legacy stub — Imanje Tycoon uses DOM event listeners directly on elements.
// No canvas-based input needed. Kept for compatibility.

export function initInput(_canvas) { /* no-op */ }
export function readInput() { return { keys: new Set(), pointer: { x: 0, y: 0, down: false } }; }
