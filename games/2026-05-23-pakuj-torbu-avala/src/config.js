// Game-wide constants
export const CELL_SIZE = 52;        // pixels per grid cell
export const GRID_PADDING = 12;     // padding around grid canvas
export const PANEL_CELL_SIZE = 18;  // pixel size per cell in item panel previews

export const FRAME_TARGET = 60;
export const LOW_TIME_THRESHOLD = 10; // seconds

export const COLORS = {
  bgPrimary: '#0A0E1A',
  bgGrid: '#111827',
  gridLine: 'rgba(255, 215, 0, 0.2)',
  gridBorder: 'rgba(255, 215, 0, 0.5)',
  cellEmpty: 'rgba(15, 22, 40, 0.8)',
  cellHover: 'rgba(255, 215, 0, 0.12)',
  ghostValid: 'rgba(100, 220, 100, 0.45)',
  ghostInvalid: 'rgba(240, 80, 80, 0.45)',
  ghostBorderValid: 'rgba(100, 220, 100, 0.9)',
  ghostBorderInvalid: 'rgba(240, 80, 80, 0.9)',
  particleDefault: '#FFD700',
};

export const AUDIO = {
  enabled: true,
  masterVolume: 0.4,
};
