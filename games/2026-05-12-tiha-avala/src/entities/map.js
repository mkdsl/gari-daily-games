// map.js — terrain draw data helpers

export const TERRAIN_COLORS = {
  open: { base: '#1a3a1a', noise: '#1d3d1d' },
  forest: { base: '#0d2a0d', crown: '#16421a' },
  valley: { base: '#1a2a3a', center: '#1f3040' },
  asphalt: { base: '#2a2a2a', line: '#252525' },
  hill_shadow: { base: '#1a1a1a', cross: '#161616' }
};

// Given canvas width/height and a rect [rx, ry, rw, rh] (all 0..1), return pixel coords
export function relToPixel(W, H, rect) {
  return [
    Math.round(rect[0] * W),
    Math.round(rect[1] * H),
    Math.round(rect[2] * W),
    Math.round(rect[3] * H)
  ];
}

export function relPosToPixel(W, H, x, y) {
  return [Math.round(x * W), Math.round(y * H)];
}
