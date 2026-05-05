/**
 * render.js — Canvas 2D rendering za Bespuće
 * Redosled slojeva: BG → zidovi/chunks → record line → checkpoint → prepreke → kristali → brod → čestice → HUD → touch zones
 * Eksportuje: render
 */
import { CONFIG } from './config.js';

// ─── Helper: hexagon ─────────────────────────────────────────────────────────

/**
 * Nacrta pravilni šestougaonik — put je otvoren, caller poziva fill/stroke.
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} x      - centar
 * @param {number} y      - centar
 * @param {number} r      - poluprečnik
 * @param {number} angle  - rotacija u radijanima
 */
function drawHexagon(ctx, x, y, r, angle) {
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const a  = angle + (Math.PI / 3) * i;
    const px = x + r * Math.cos(a);
    const py = y + r * Math.sin(a);
    i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
  }
  ctx.closePath();
}

// ─── Helper: brod ────────────────────────────────────────────────────────────

/**
 * Nacrta brod (isosceles trougao s nosom desno) i thruster efekat.
 * @param {CanvasRenderingContext2D} ctx
 * @param {object} player  - Player state
 */
function drawShip(ctx, player) {
  const { x, y, thrusterActive, shieldAura } = player;

  // ── Thruster plamen ──────────────────────────────────────────────────────
  if (thrusterActive) {
    const flameLen = 18 + Math.random() * 8;  // varijacija
    const flameW   =  7 + Math.random() * 3;

    const grad = ctx.createLinearGradient(x - 14, y, x - 14 - flameLen, y);
    grad.addColorStop(0,   CONFIG.COLORS.SHIP_THRUSTER);
    grad.addColorStop(0.5, 'rgba(194,68,255,0.6)');
    grad.addColorStop(1,   'rgba(194,68,255,0)');

    ctx.save();
    ctx.globalAlpha = 0.85;
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(x - 14,           y);
    ctx.lineTo(x - 14 - flameLen, y - flameW / 2);
    ctx.lineTo(x - 14 - flameLen, y + flameW / 2);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  } else {
    // Mali statički thruster
    ctx.save();
    ctx.globalAlpha = 0.45;
    ctx.fillStyle = CONFIG.COLORS.SHIP_THRUSTER;
    ctx.beginPath();
    ctx.moveTo(x - 14,      y);
    ctx.lineTo(x - 14 - 8,  y - 3);
    ctx.lineTo(x - 14 - 8,  y + 3);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  // ── Trup broda ───────────────────────────────────────────────────────────
  ctx.save();
  ctx.shadowBlur  = 8;
  ctx.shadowColor = 'rgba(255,255,255,0.4)';
  ctx.fillStyle   = CONFIG.COLORS.SHIP;
  ctx.beginPath();
  ctx.moveTo(x + 16, y);       // nos (desno)
  ctx.lineTo(x - 14, y - 12);  // gornji ugao
  ctx.lineTo(x - 14, y + 12);  // donji ugao
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // ── Shield aura ──────────────────────────────────────────────────────────
  if (shieldAura > 0) {
    const alpha = Math.min(1, shieldAura / 2) * 0.7;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = CONFIG.COLORS.POWERUP_A;
    ctx.lineWidth   = 2;
    ctx.shadowBlur  = 12;
    ctx.shadowColor = CONFIG.COLORS.POWERUP_A;
    ctx.beginPath();
    ctx.arc(x, y, CONFIG.PLAYER_RADIUS + 6, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }
}

// ─── Helper: HUD tekst ───────────────────────────────────────────────────────

/**
 * Nacrta tekst s neon glow efektom.
 * @param {CanvasRenderingContext2D} ctx
 * @param {string} text
 * @param {number} x
 * @param {number} y
 * @param {string} [color]
 * @param {string} [align]  - 'left' | 'right' | 'center'
 */
function hudText(ctx, text, x, y, color = CONFIG.COLORS.HUD_TEXT, align = 'left') {
  ctx.save();
  ctx.font        = '14px "Courier New", monospace';
  ctx.textAlign   = align;
  ctx.textBaseline = 'top';
  ctx.fillStyle   = color;
  ctx.shadowBlur  = 6;
  ctx.shadowColor = color;
  ctx.fillText(text, x, y);
  ctx.restore();
}

// ─── Zidovi (chunks) ─────────────────────────────────────────────────────────

/**
 * Nacrta gornji i donji zid za jedan chunk.
 * @param {CanvasRenderingContext2D} ctx
 * @param {object} chunk
 * @param {number} w      - canvas logička širina
 * @param {number} h      - canvas logička visina
 */
function drawChunkWalls(ctx, chunk, w, h) {
  const samples = chunk.samples;
  if (!samples || samples.length < 2) return;

  const ox = chunk.worldX; // world X offset

  // ── Gornji zid (fill) ────────────────────────────────────────────────────
  ctx.beginPath();
  ctx.moveTo(ox + samples[0].localX, 0);
  for (const s of samples) {
    ctx.lineTo(ox + s.localX, s.topY);
  }
  ctx.lineTo(ox + samples[samples.length - 1].localX, 0);
  ctx.closePath();
  ctx.fillStyle = CONFIG.COLORS.WALL;
  ctx.fill();

  // ── Gornji zid (edge stroke) ─────────────────────────────────────────────
  ctx.beginPath();
  for (let i = 0; i < samples.length; i++) {
    const s = samples[i];
    i === 0 ? ctx.moveTo(ox + s.localX, s.topY)
            : ctx.lineTo(ox + s.localX, s.topY);
  }
  ctx.strokeStyle = CONFIG.COLORS.WALL_STROKE;
  ctx.lineWidth   = 1.5;
  ctx.shadowBlur  = 6;
  ctx.shadowColor = CONFIG.COLORS.WALL_STROKE;
  ctx.stroke();
  ctx.shadowBlur  = 0;

  // ── Donji zid (fill) ─────────────────────────────────────────────────────
  ctx.beginPath();
  ctx.moveTo(ox + samples[0].localX, h);
  for (const s of samples) {
    ctx.lineTo(ox + s.localX, s.bottomY);
  }
  ctx.lineTo(ox + samples[samples.length - 1].localX, h);
  ctx.closePath();
  ctx.fillStyle = CONFIG.COLORS.WALL;
  ctx.fill();

  // ── Donji zid (edge stroke) ──────────────────────────────────────────────
  ctx.beginPath();
  for (let i = 0; i < samples.length; i++) {
    const s = samples[i];
    i === 0 ? ctx.moveTo(ox + s.localX, s.bottomY)
            : ctx.lineTo(ox + s.localX, s.bottomY);
  }
  ctx.strokeStyle = CONFIG.COLORS.WALL_STROKE;
  ctx.lineWidth   = 1.5;
  ctx.shadowBlur  = 6;
  ctx.shadowColor = CONFIG.COLORS.WALL_STROKE;
  ctx.stroke();
  ctx.shadowBlur  = 0;
}

// ─── Record line ─────────────────────────────────────────────────────────────

/**
 * Nacrta Ghost Record Line (isprekidana polylinja iz prošlog rekordnog runa).
 * @param {CanvasRenderingContext2D} ctx
 * @param {number[]} recordRunY   - Array Y uzoraka (svaki na 10px distance)
 * @param {number}   distance     - Trenutna run.distance
 */
function drawRecordLine(ctx, recordRunY, distance) {
  if (!recordRunY || recordRunY.length === 0) return;

  ctx.save();
  ctx.setLineDash([4, 8]);
  ctx.strokeStyle = CONFIG.COLORS.RECORD_LINE;
  ctx.lineWidth   = 1;
  ctx.globalAlpha = 0.55;
  ctx.shadowBlur  = 5;
  ctx.shadowColor = CONFIG.COLORS.RECORD_LINE;

  ctx.beginPath();
  let started = false;

  for (let i = 0; i < recordRunY.length; i++) {
    // Canvas X: sample i je uzet na distance = i*10
    // Relativno od broda: (i*10 - distance) + PLAYER_X
    const cx = (i * 10 - distance) + CONFIG.PLAYER_X;
    const cy = recordRunY[i];

    if (cx < -20 || cx > 3000) continue; // van vidnog polja

    if (!started) {
      ctx.moveTo(cx, cy);
      started = true;
    } else {
      ctx.lineTo(cx, cy);
    }
  }

  if (started) ctx.stroke();
  ctx.restore();
}

// ─── Prepreke ────────────────────────────────────────────────────────────────

/**
 * Nacrta sve prepreke iz run.obstacles.
 * @param {CanvasRenderingContext2D} ctx
 * @param {object[]} obstacles
 */
function drawObstacles(ctx, obstacles) {
  for (const obs of obstacles) {
    // Skip ako je daleko van vidnog polja
    if (obs.x + obs.w < -40 || obs.x > 4000) continue;

    ctx.save();
    ctx.fillStyle   = CONFIG.COLORS.OBSTACLE_FILL;
    ctx.strokeStyle = CONFIG.COLORS.OBSTACLE_STROKE;
    ctx.lineWidth   = 1.5;
    ctx.shadowBlur  = 8;
    ctx.shadowColor = CONFIG.COLORS.OBSTACLE_STROKE;

    if (obs.type === 'D') {
      // DIAGONAL_BAR — crtaj rotirano
      ctx.translate(obs.x + obs.w / 2, obs.y + obs.h / 2);
      ctx.rotate(obs.angle);
      ctx.fillRect(-obs.w / 2, -obs.h / 2, obs.w, obs.h);
      ctx.strokeRect(-obs.w / 2, -obs.h / 2, obs.w, obs.h);
    } else if (obs.type === 'C') {
      // MOVING_GATE — puni zid s prolazom (gap) gde se prolazi.
      // obs.y..obs.y+obs.h je gate blok (solid — kolizija). Prolaz je izvan toga.
      // Vizuelno crtamo gornji i donji deo kao trake, ostavljamo gap na gate poziciji.
      const gateTop    = obs.y;
      const gateH      = obs.h;
      const barW       = obs.w;
      const screenH    = 2000;

      // Gornja traka: od 0 do gateTop
      if (gateTop > 0) {
        ctx.fillRect(obs.x, 0, barW, gateTop);
        ctx.strokeRect(obs.x, 0, barW, gateTop);
      }
      // Donja traka: od (gateTop + gateH) do fiktivnog dna
      ctx.fillRect(obs.x, gateTop + gateH, barW, screenH - (gateTop + gateH));
      ctx.strokeRect(obs.x, gateTop + gateH, barW, screenH - (gateTop + gateH));
    } else {
      // WALL_SPIKE ('A') i FLOAT_BLOCK ('B') — prost pravougaonik
      ctx.fillRect(obs.x, obs.y, obs.w, obs.h);
      ctx.strokeRect(obs.x, obs.y, obs.w, obs.h);
    }

    ctx.restore();
  }
}

// ─── Kristali ────────────────────────────────────────────────────────────────

/**
 * Nacrta sve nekupljene kristale iz run.pickups.
 * @param {CanvasRenderingContext2D} ctx
 * @param {object[]} pickups
 */
function drawPickups(ctx, pickups) {
  for (const pu of pickups) {
    if (pu.type !== 'CRYSTAL' || pu.collected) continue;
    if (pu.x < -30 || pu.x > 4000) continue;

    ctx.save();

    // Glow
    ctx.shadowBlur  = 14;
    ctx.shadowColor = CONFIG.COLORS.CRYSTAL_GLOW;

    // Hexagon fill
    ctx.fillStyle   = CONFIG.COLORS.CRYSTAL;
    drawHexagon(ctx, pu.x, pu.y, 10, pu.angle);
    ctx.fill();

    // Hexagon stroke
    ctx.strokeStyle = 'rgba(255,255,180,0.7)';
    ctx.lineWidth   = 1;
    ctx.stroke();

    // Inner highlight dot
    ctx.shadowBlur  = 0;
    ctx.fillStyle   = 'rgba(255,255,255,0.6)';
    ctx.beginPath();
    ctx.arc(pu.x, pu.y, 2.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
}

// ─── Checkpoint linja ─────────────────────────────────────────────────────────

/**
 * Nacrta vertikalnu checkpoint liniju za checkpoint pickupe koji nisu triggerirani.
 * @param {CanvasRenderingContext2D} ctx
 * @param {object[]} pickups
 * @param {number}   h     - canvas logička visina
 */
function drawCheckpointLines(ctx, pickups, h) {
  for (const pu of pickups) {
    if (pu.type !== 'CHECKPOINT' || pu.triggered) continue;
    if (pu.x < -10 || pu.x > 4000) continue;

    ctx.save();
    ctx.setLineDash([6, 10]);
    ctx.strokeStyle = CONFIG.COLORS.CHECKPOINT_LINE;
    ctx.lineWidth   = 1.5;
    ctx.globalAlpha = 0.75;
    ctx.shadowBlur  = 8;
    ctx.shadowColor = CONFIG.COLORS.CHECKPOINT_LINE;
    ctx.beginPath();
    ctx.moveTo(pu.x, 0);
    ctx.lineTo(pu.x, h);
    ctx.stroke();
    ctx.restore();
  }
}

// ─── Čestice ─────────────────────────────────────────────────────────────────

/**
 * Nacrta sve aktivne čestice.
 * @param {CanvasRenderingContext2D} ctx
 * @param {object[]} particles
 */
function drawParticles(ctx, particles) {
  for (const p of particles) {
    if (p.life <= 0) continue;

    const alpha = Math.max(0, p.life / p.maxLife);
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle   = CONFIG.COLORS.PARTICLE;
    ctx.shadowBlur  = 4;
    ctx.shadowColor = CONFIG.COLORS.PARTICLE;
    ctx.fillRect(p.x - 1.5, p.y - 1.5, 3, 3);
    ctx.restore();
  }
}

// ─── HUD na canvasu ──────────────────────────────────────────────────────────

/**
 * Nacrta HUD (score, best, multiplier, kristali, milestone flash, power-up timeri).
 * @param {CanvasRenderingContext2D} ctx
 * @param {object} state
 * @param {number} w  - logička širina
 * @param {number} h  - logička visina
 */
function drawHUD(ctx, state, w, h) {
  if (state.screen !== 'RUNNING') return;

  const run  = state.run;
  const meta = state.meta;
  const PAD  = 14;

  // ── Score (gornji levi) ──────────────────────────────────────────────────
  hudText(ctx, `SCORE  ${run.score}`, PAD, PAD, CONFIG.COLORS.HUD_TEXT, 'left');

  // ── Multiplier (gornji levi, ispod score-a) ──────────────────────────────
  if (run.multiplier > 1.0) {
    hudText(ctx, `×${run.multiplier.toFixed(1)}`, PAD, PAD + 20,
            CONFIG.COLORS.POWERUP_B, 'left');
  }

  // ── Best (gornji desni) ──────────────────────────────────────────────────
  hudText(ctx, `BEST  ${meta.bestScore}`, w - PAD, PAD, CONFIG.COLORS.HUD_TEXT, 'right');

  // ── Kristali (gornji desni, ispod best-a) ────────────────────────────────
  // Mali hexagon + broj
  const hxX = w - PAD - 14;
  const hxY = PAD + 26;
  ctx.save();
  ctx.fillStyle   = CONFIG.COLORS.CRYSTAL;
  ctx.shadowBlur  = 6;
  ctx.shadowColor = CONFIG.COLORS.CRYSTAL;
  drawHexagon(ctx, hxX, hxY + 5, 5, run.crystals * 0.5);  // lagana rotacija kao marker
  ctx.fill();
  ctx.restore();
  hudText(ctx, `${run.crystals}`, hxX - 8, PAD + 19, CONFIG.COLORS.CRYSTAL, 'right');

  // ── Aktivni power-upi (gornji srednji) ───────────────────────────────────
  const player = run.player;
  if (player) {
    const activeNames = [];
    const pw = player.powerups;
    if (pw.slowTime    > 0) activeNames.push(`SLOW-MO ${pw.slowTime.toFixed(1)}s`);
    if (pw.score2x     > 0) activeNames.push(`×2 SCORE ${pw.score2x.toFixed(1)}s`);
    if (pw.magnetTemp  > 0) activeNames.push(`MAGNET ${pw.magnetTemp.toFixed(1)}s`);
    if (pw.narrowHitbox > 0) activeNames.push(`NARROW ${pw.narrowHitbox.toFixed(1)}s`);
    if (pw.speedBurst  > 0) activeNames.push(`TURBO ${pw.speedBurst.toFixed(1)}s`);
    if (pw.ghostPass   > 0) activeNames.push(`GHOST ${pw.ghostPass.toFixed(1)}s`);
    if (run.shieldsLeft > 0) activeNames.push(`SHIELD×${run.shieldsLeft}`);

    activeNames.forEach((label, i) => {
      hudText(ctx, label, w / 2, PAD + i * 18, CONFIG.COLORS.POWERUP_A, 'center');
    });
  }

  // ── Milestone flash (sredina ekrana) ─────────────────────────────────────
  if (run.milestoneText && run.milestoneTimer > 0) {
    const tRatio = run.milestoneTimer / 2.0; // pretpostavi max 2s
    const alpha  = Math.min(1, tRatio * 2);  // fade in + hold
    const offsetY = (1 - tRatio) * 30;       // pomeraj gore

    ctx.save();
    ctx.globalAlpha  = Math.max(0, alpha);
    ctx.font         = `bold 22px "Courier New", monospace`;
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle    = CONFIG.COLORS.CRYSTAL;
    ctx.shadowBlur   = 20;
    ctx.shadowColor  = CONFIG.COLORS.CRYSTAL;
    ctx.fillText(run.milestoneText, w / 2, h / 2 - 20 - offsetY);
    ctx.restore();
  }
}

// ─── Touch zone hint ──────────────────────────────────────────────────────────

/**
 * Nacrta virtuelne touch zone u donjem uglu (samo na touch uređajima tokom RUNNING).
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} w
 * @param {number} h
 */
function drawTouchZones(ctx, w, h) {
  if (!('ontouchstart' in window)) return;

  const zoneW  = w * 0.35;
  const zoneH  = 90;
  const zoneY  = h - zoneH - 12;
  const radius = 8;

  // Pomocna funkcija za zaobljeni pravougaonik
  const roundRect = (x, y, rw, rh, r) => {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + rw - r, y);
    ctx.arcTo(x + rw, y, x + rw, y + r, r);
    ctx.lineTo(x + rw, y + rh - r);
    ctx.arcTo(x + rw, y + rh, x + rw - r, y + rh, r);
    ctx.lineTo(x + r, y + rh);
    ctx.arcTo(x, y + rh, x, y + rh - r, r);
    ctx.lineTo(x, y + r);
    ctx.arcTo(x, y, x + r, y, r);
    ctx.closePath();
  };

  ctx.save();

  // Gornja thrust zona hint
  ctx.globalAlpha = 0.12;
  ctx.strokeStyle = CONFIG.COLORS.WALL_STROKE;
  ctx.lineWidth = 1;
  ctx.setLineDash([8, 12]);
  ctx.strokeRect(4, 4, w - 8, h * 0.5 - 8);
  ctx.setLineDash([]);
  ctx.globalAlpha = 0.25;
  ctx.fillStyle = CONFIG.COLORS.HUD_TEXT;
  ctx.font = `13px "Courier New", monospace`;
  ctx.textAlign = 'center';
  ctx.fillText('▲ TAP — THRUST', w / 2, h * 0.25);

  ctx.restore();

  ctx.save();
  ctx.globalAlpha = 0.22;

  // Levo dugme (◀ GORE/DOLE LEVO)
  ctx.fillStyle   = 'rgba(74,158,255,0.15)';
  ctx.strokeStyle = 'rgba(74,158,255,0.5)';
  ctx.lineWidth   = 1;
  roundRect(12, zoneY, zoneW, zoneH, radius);
  ctx.fill();
  ctx.stroke();

  // Desno dugme (▶ GORE/DOLE DESNO)
  roundRect(w - zoneW - 12, zoneY, zoneW, zoneH, radius);
  ctx.fill();
  ctx.stroke();

  ctx.globalAlpha = 0.45;
  ctx.fillStyle   = 'rgba(74,158,255,0.8)';
  ctx.font        = '13px "Courier New", monospace';
  ctx.textAlign   = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('◀', 12 + zoneW / 2, zoneY + zoneH / 2);
  ctx.fillText('▶', w - zoneW / 2 - 12, zoneY + zoneH / 2);

  ctx.restore();
}

// ─── Scanline stripes (subtle) ───────────────────────────────────────────────

/**
 * Nacrta blage CRT scan linije (samo na RUNNING ekranu, opciono za performance).
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} w
 * @param {number} h
 */
function drawScanlines(ctx, w, h) {
  ctx.save();
  ctx.globalAlpha = 0.03;
  ctx.fillStyle   = '#000000';
  for (let y = 0; y < h; y += 4) {
    ctx.fillRect(0, y, w, 2);
  }
  ctx.restore();
}

// ─── Glavni render poziv ─────────────────────────────────────────────────────

/**
 * Renderuj jedan frame.
 * @param {CanvasRenderingContext2D} ctx
 * @param {object} state  - Cijeli state (state.screen, state.run, state.meta)
 */
export function render(ctx, state) {
  const w = ctx.canvas.width  / devicePixelRatio;
  const h = ctx.canvas.height / devicePixelRatio;

  // 1 ── Pozadina ─────────────────────────────────────────────────────────────
  ctx.fillStyle = CONFIG.COLORS.BG;
  ctx.fillRect(0, 0, w, h);

  // Za ne-RUNNING ekrane prikaži samo tamnu pozadinu (UI je DOM overlay)
  if (state.screen !== 'RUNNING') {
    // Lagani ambient glow u centru
    const grad = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, Math.max(w, h) * 0.6);
    grad.addColorStop(0,   'rgba(74,158,255,0.04)');
    grad.addColorStop(1,   'rgba(0,0,0,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
    return;
  }

  const run = state.run;
  if (!run.player) return;

  // 2 ── Zidovi chunks-a ───────────────────────────────────────────────────────
  for (const chunk of run.chunks) {
    drawChunkWalls(ctx, chunk, w, h);
  }

  // 3 ── Record line ──────────────────────────────────────────────────────────
  if (state.meta.recordRunY && state.meta.recordRunY.length > 0) {
    drawRecordLine(ctx, state.meta.recordRunY, run.distance);
  }

  // 4 ── Checkpoint linije ────────────────────────────────────────────────────
  drawCheckpointLines(ctx, run.pickups, h);

  // 5 ── Prepreke ─────────────────────────────────────────────────────────────
  drawObstacles(ctx, run.obstacles);

  // 6 ── Kristali ─────────────────────────────────────────────────────────────
  drawPickups(ctx, run.pickups);

  // 7 ── Brod ─────────────────────────────────────────────────────────────────
  if (run.player.alive) {
    drawShip(ctx, run.player);
  }

  // 8 ── Čestice ──────────────────────────────────────────────────────────────
  drawParticles(ctx, run.particles);

  // 9 ── HUD ──────────────────────────────────────────────────────────────────
  drawHUD(ctx, state, w, h);

  // 10 ── Touch zone hint ─────────────────────────────────────────────────────
  drawTouchZones(ctx, w, h);
}
