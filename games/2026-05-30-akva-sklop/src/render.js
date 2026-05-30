import {
  GRID_COLS, GRID_ROWS,
  TILE_TYPES, TILE_CONFIG,
  COLORS,
  LAKE_A_ORIGIN, LAKE_A_SIZE,
  LAKE_B_ORIGIN, LAKE_B_SIZE,
  LAKE_C_ORIGIN, LAKE_C_SIZE,
} from './config.js';

let canvas, ctx;
let animLerp = 0;    // 0–1 tokom simulacione animacije (4s)
let prevLakes = null; // snapshot za interpolaciju water level

// ─── Inicijalizacija ──────────────────────────────────────────────────────────

export function initRender(canvasEl) {
  canvas = canvasEl;
  ctx = canvas.getContext('2d');
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);
}

function resizeCanvas() {
  // Full viewport width na mobilnom, max 960px na desktopu
  const maxW = Math.min(window.innerWidth, 960);
  canvas.width  = maxW;
  canvas.height = Math.floor(maxW * (GRID_ROWS / GRID_COLS)); // aspect ratio
}

// ─── Glavni render frame ──────────────────────────────────────────────────────

export function renderFrame(grid, state) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // 1. Background
  ctx.fillStyle = COLORS.bg;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // 2. Height-map tint (suptilna gradijentna indikacija visine)
  drawHeightTint();

  // 3. Grid tile-ovi
  drawGrid(grid, state);

  // 4. Grid linije (fine mrežaste linije)
  drawGridLines();

  // 5. Water overlay na jezerima
  drawWaterLevels(state);

  // 6. Species (patke i ribe kao obojene tačke)
  drawSpecies(state);

  // 7. Hover highlight (gde će tile da se postavi)
  if (state.hoverCell) drawHoverHighlight(state.hoverCell, state.selectedTile, grid);
}

// ─── Height tint ─────────────────────────────────────────────────────────────

function drawHeightTint() {
  // Blagi overlay koji naznačava visinski gradijent (3 → 1)
  // Viši = malo svetliji, niži = malo tamniji
  // Ovo je čisto vizualni hint, ne usporava gameplay
  const import_height_map_later = true; // height map se čita iz config
  // (statički, ne re-importujemo svaki frame — height map je uvek isti)
}

// ─── Tiles ───────────────────────────────────────────────────────────────────

function drawGrid(grid, state) {
  const tileW = canvas.width  / GRID_COLS;
  const tileH = canvas.height / GRID_ROWS;

  for (let row = 0; row < GRID_ROWS; row++) {
    for (let col = 0; col < GRID_COLS; col++) {
      const cell = grid[row * GRID_COLS + col];
      const x = col * tileW;
      const y = row * tileH;

      // Tile pozadina (1px gap je "grid linija" efekt)
      ctx.fillStyle = getTileColor(cell);
      ctx.fillRect(x + 1, y + 1, tileW - 2, tileH - 2);

      // Tile emoji/ikona centrirana
      const icon = getTileIcon(cell);
      if (icon) {
        ctx.font         = `${Math.floor(tileH * 0.52)}px serif`;
        ctx.textAlign    = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(icon, x + tileW / 2, y + tileH / 2);
      }
    }
  }
}

function getTileColor(cell) {
  if (!cell || cell.type === TILE_TYPES.EMPTY)   return COLORS.empty;
  if (cell.type === TILE_TYPES.TERRAIN)          return COLORS.terrain;
  if (cell.type === TILE_TYPES.SOURCE)           return COLORS.source;
  if (cell.type === TILE_TYPES.LAKE_1)           return COLORS.lake;
  if (cell.type === TILE_TYPES.LAKE_2)           return COLORS.lakeDeep;
  if (cell.type === TILE_TYPES.DRAINAGE)         return COLORS.drainage;
  if (cell.type === TILE_TYPES.BIOFILTER)        return COLORS.biofilter;
  if (cell.type === TILE_TYPES.WETLAND)          return COLORS.wetland;
  if (cell.type === TILE_TYPES.DAM)              return COLORS.dam;
  return TILE_CONFIG[cell.type]?.color || COLORS.empty;
}

function getTileIcon(cell) {
  if (!cell)                                    return null;
  if (cell.type === TILE_TYPES.EMPTY)           return null;
  if (cell.type === TILE_TYPES.TERRAIN)         return null;
  if (cell.type === TILE_TYPES.SOURCE)          return '💦';
  return TILE_CONFIG[cell.type]?.emoji || null;
}

// ─── Grid linije ─────────────────────────────────────────────────────────────

function drawGridLines() {
  const tileW = canvas.width  / GRID_COLS;
  const tileH = canvas.height / GRID_ROWS;

  ctx.strokeStyle = COLORS.gridLine;
  ctx.lineWidth   = 0.5;
  ctx.beginPath();

  for (let col = 0; col <= GRID_COLS; col++) {
    ctx.moveTo(col * tileW, 0);
    ctx.lineTo(col * tileW, canvas.height);
  }
  for (let row = 0; row <= GRID_ROWS; row++) {
    ctx.moveTo(0, row * tileH);
    ctx.lineTo(canvas.width, row * tileH);
  }
  ctx.stroke();
}

// ─── Water levels ─────────────────────────────────────────────────────────────

const LAKE_DEFS = [
  { id: 'A', origin: LAKE_A_ORIGIN, size: LAKE_A_SIZE },
  { id: 'B', origin: LAKE_B_ORIGIN, size: LAKE_B_SIZE },
  { id: 'C', origin: LAKE_C_ORIGIN, size: LAKE_C_SIZE },
];

function drawWaterLevels(state) {
  const tileW = canvas.width  / GRID_COLS;
  const tileH = canvas.height / GRID_ROWS;

  LAKE_DEFS.forEach(({ id, origin, size }) => {
    const lake = state.lakes?.[id];
    if (!lake || lake.capacity === 0) return;

    // Bounding box jezera u pikselima
    const lx = origin.col * tileW;
    const ly = origin.row * tileH;
    const lw = size.cols  * tileW;
    const lh = size.rows  * tileH;

    // Lerp level za animaciju (animLerp 0→1 tokom 4s simulacije)
    let displayLevel = lake.level;
    if (prevLakes && prevLakes[id]) {
      const prev = prevLakes[id].level;
      displayLevel = prev + (lake.level - prev) * animLerp;
    }

    const cap = lake.capacity;
    const pct = Math.max(0, Math.min(1, displayLevel / cap));

    // Voda raste od dna tile zone
    const waterH = lh * pct;
    const waterY = ly + lh - waterH;

    // Providna plava voda
    const alpha = 0.25 + pct * 0.55;
    ctx.fillStyle = `rgba(79, 195, 247, ${alpha})`;
    ctx.fillRect(lx, waterY, lw, waterH);

    // pH color bar na vrhu jezera
    const pHColor = getPHColor(lake.pH);
    ctx.fillStyle = pHColor;
    ctx.fillRect(lx, ly, lw, 4);

    // Label: nivo u litrama, centiran
    const cx = lx + lw / 2;
    const cy = ly + lh / 2;
    ctx.fillStyle    = COLORS.text;
    ctx.font         = `bold ${Math.floor(tileH * 0.32)}px sans-serif`;
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${displayLevel.toFixed(0)}L`, cx, cy - tileH * 0.12);

    // pH label ispod
    ctx.font      = `${Math.floor(tileH * 0.25)}px sans-serif`;
    ctx.fillStyle = COLORS.textMuted;
    ctx.fillText(`pH ${lake.pH?.toFixed(1) ?? '?'}`, cx, cy + tileH * 0.15);

    // Jezero ID slovo (A / B / C)
    ctx.font      = `bold ${Math.floor(tileH * 0.42)}px sans-serif`;
    ctx.fillStyle = 'rgba(255,255,255,0.18)';
    ctx.fillText(id, cx, cy + tileH * 0.5);
  });
}

function getPHColor(pH) {
  if (!pH) return 'rgba(128,128,128,0.4)';
  if (pH >= 6.5 && pH <= 8.5) return 'rgba(76, 175, 80, 0.55)';
  if (pH >= 6.0 && pH <= 9.0) return 'rgba(255, 152, 0, 0.55)';
  return 'rgba(244, 67, 54, 0.55)';
}

// ─── Species ──────────────────────────────────────────────────────────────────

function drawSpecies(state) {
  const tileW = canvas.width  / GRID_COLS;
  const tileH = canvas.height / GRID_ROWS;

  LAKE_DEFS.forEach(({ id, origin, size }) => {
    const lake = state.lakes?.[id];
    if (!lake) return;

    const lx = origin.col * tileW;
    const ly = origin.row * tileH;
    const lw = size.cols  * tileW;
    const lh = size.rows  * tileH;
    const cx = lx + lw / 2;
    const cy = ly + lh / 2;

    // Patke — narandžaste kružice raspoređene eliptično oko centra jezera
    const duckCount = Math.min(lake.ducks || 0, 12);
    for (let i = 0; i < duckCount; i++) {
      const angle  = (i / Math.max(duckCount, 1)) * Math.PI * 2 - Math.PI / 2;
      const rx     = lw * 0.32;
      const ry     = lh * 0.22;
      const dx     = cx + Math.cos(angle) * rx;
      const dy     = cy + Math.sin(angle) * ry;
      ctx.fillStyle = COLORS.duck;
      ctx.beginPath();
      ctx.arc(dx, dy, Math.max(3, tileW * 0.08), 0, Math.PI * 2);
      ctx.fill();
    }

    // Ribe — svetloplave manje kružice, unutrašnji prsten
    const fishCount = Math.min(lake.fish || 0, 8);
    for (let i = 0; i < fishCount; i++) {
      const angle  = (i / Math.max(fishCount, 1)) * Math.PI * 2 + Math.PI / 6;
      const rx     = lw * 0.16;
      const ry     = lh * 0.12;
      const fx     = cx + Math.cos(angle) * rx;
      const fy     = cy + Math.sin(angle) * ry;
      ctx.fillStyle = COLORS.fish;
      ctx.beginPath();
      ctx.arc(fx, fy, Math.max(2, tileW * 0.055), 0, Math.PI * 2);
      ctx.fill();
    }
  });
}

// ─── Hover highlight ──────────────────────────────────────────────────────────

function drawHoverHighlight(hoverCell, selectedTile, grid) {
  if (!hoverCell || !selectedTile) return;

  const tileW = canvas.width  / GRID_COLS;
  const tileH = canvas.height / GRID_ROWS;
  const { col, row } = hoverCell;

  if (col < 0 || col >= GRID_COLS || row < 0 || row >= GRID_ROWS) return;

  const x = col * tileW;
  const y = row * tileH;

  const cfg = TILE_CONFIG[selectedTile];

  // Determina da li je pozicija validna (npr. ne TERRAIN, ne SOURCE)
  const cell = grid?.[row * GRID_COLS + col];
  const isInvalid =
    (cell && cell.type === TILE_TYPES.TERRAIN) ||
    (cell && cell.type === TILE_TYPES.SOURCE && selectedTile !== 'remove');

  if (isInvalid) {
    ctx.fillStyle = COLORS.invalidTile;
  } else {
    ctx.fillStyle = cfg ? cfg.color + '55' : COLORS.previewValid;
  }
  ctx.fillRect(x + 1, y + 1, tileW - 2, tileH - 2);

  // Border
  ctx.strokeStyle = isInvalid ? COLORS.critical : '#ffffff';
  ctx.lineWidth   = 2;
  ctx.strokeRect(x + 1, y + 1, tileW - 2, tileH - 2);

  // Preview ikona
  const icon = cfg?.emoji || (selectedTile === 'remove' ? '✖' : null);
  if (icon) {
    ctx.font         = `${Math.floor(tileH * 0.45)}px serif`;
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';
    ctx.globalAlpha  = 0.65;
    ctx.fillText(icon, x + tileW / 2, y + tileH / 2);
    ctx.globalAlpha  = 1.0;
  }
}

// ─── Animacija exports ────────────────────────────────────────────────────────

export function setAnimLerp(v) {
  animLerp = Math.max(0, Math.min(1, v));
}

export function setPrevLakes(lakes) {
  prevLakes = JSON.parse(JSON.stringify(lakes));
}
