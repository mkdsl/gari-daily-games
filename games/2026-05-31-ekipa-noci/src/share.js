/**
 * @file share.js
 * Tour Card generator i Web Share API integracija za Ekipa Noći.
 * Generiše Canvas sliku sa rezultatima turneje i deli je.
 */

// ---------------------------------------------------------------------------
// Konstante
// ---------------------------------------------------------------------------

const CANVAS_W = 800;
const CANVAS_H = 1000;

const COLORS = {
  bg_top:      '#050510',
  bg_bottom:   '#0d0d2b',
  neon_purple: '#b94fff',
  neon_cyan:   '#00f5ff',
  neon_green:  '#39ff14',
  neon_orange: '#ff6b1a',
  neon_red:    '#ff2d55',
  white:       '#ffffff',
  white_dim:   'rgba(255,255,255,0.7)',
  white_faint: 'rgba(255,255,255,0.15)',
  card_bg:     'rgba(255,255,255,0.08)',
  bar_great:   '#39ff14',
  bar_ok:      '#ffcc00',
  bar_bad:     '#ff2d55',
  grade_S:     '#b94fff',
  grade_A:     '#00f5ff',
  grade_B:     '#39ff14',
  grade_C:     '#ffcc00',
  grade_D:     '#ff6b1a',
  grade_F:     '#ff2d55',
};

const BILET_URL = 'bilet.rs/show/261';
const EVENT_DATE = 'Kluboslavija Avala · 20.jun 2026';

// ---------------------------------------------------------------------------
// Grade color helper
// ---------------------------------------------------------------------------

/**
 * Vraca boju za grade.
 * @param {string} grade
 * @returns {string}
 */
function gradeColor(grade) {
  return COLORS[`grade_${grade}`] || COLORS.white;
}

// ---------------------------------------------------------------------------
// Canvas drawing helpers
// ---------------------------------------------------------------------------

/**
 * Crta zaobljeni pravougaonik.
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} x
 * @param {number} y
 * @param {number} w
 * @param {number} h
 * @param {number} r  radius
 */
function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

/**
 * Crta tekst sa neon glow efektom.
 * @param {CanvasRenderingContext2D} ctx
 * @param {string} text
 * @param {number} x
 * @param {number} y
 * @param {string} color
 * @param {number} glowBlur
 */
function neonText(ctx, text, x, y, color, glowBlur = 12) {
  ctx.save();
  ctx.shadowColor = color;
  ctx.shadowBlur  = glowBlur;
  ctx.fillStyle   = color;
  ctx.fillText(text, x, y);
  ctx.restore();
}

/**
 * Crta horizontalnu glow liniju.
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} x
 * @param {number} y
 * @param {number} w
 * @param {string} color
 */
function glowLine(ctx, x, y, w, color) {
  ctx.save();
  ctx.shadowColor  = color;
  ctx.shadowBlur   = 8;
  ctx.strokeStyle  = color;
  ctx.lineWidth    = 1.5;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + w, y);
  ctx.stroke();
  ctx.restore();
}

// ---------------------------------------------------------------------------
// Section drawers
// ---------------------------------------------------------------------------

/**
 * Crta background gradient.
 * @param {CanvasRenderingContext2D} ctx
 */
function drawBackground(ctx) {
  const grad = ctx.createLinearGradient(0, 0, 0, CANVAS_H);
  grad.addColorStop(0, COLORS.bg_top);
  grad.addColorStop(1, COLORS.bg_bottom);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

  // Suptilna grid mreza
  ctx.save();
  ctx.strokeStyle = 'rgba(185,79,255,0.06)';
  ctx.lineWidth   = 1;
  for (let x = 0; x <= CANVAS_W; x += 40) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, CANVAS_H); ctx.stroke();
  }
  for (let y = 0; y <= CANVAS_H; y += 40) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(CANVAS_W, y); ctx.stroke();
  }
  ctx.restore();
}

/**
 * Crta header: logo + naslov.
 * @param {CanvasRenderingContext2D} ctx
 * @returns {number} Y ispod header-a
 */
function drawHeader(ctx) {
  // Top divider
  glowLine(ctx, 40, 36, CANVAS_W - 80, COLORS.neon_purple);

  // EKIPA NOĆI
  ctx.font = 'bold 52px "Helvetica Neue", Arial, sans-serif';
  ctx.textAlign = 'center';
  neonText(ctx, 'EKIPA NOĆI', CANVAS_W / 2, 95, COLORS.neon_purple, 20);

  // Subtitle
  ctx.font = '16px "Helvetica Neue", Arial, sans-serif';
  ctx.fillStyle = COLORS.white_dim;
  ctx.textAlign = 'center';
  ctx.fillText('KLUBOSLAVIJA TURNEJA 2026', CANVAS_W / 2, 122);

  glowLine(ctx, 40, 140, CANVAS_W - 80, COLORS.neon_purple);

  return 158;
}

/**
 * Crta Grade bubble i Tour Score.
 * @param {CanvasRenderingContext2D} ctx
 * @param {string} grade
 * @param {number} tourScore
 * @param {number} startY
 * @returns {number} Y ispod sekcije
 */
function drawGradeAndScore(ctx, grade, tourScore, startY) {
  const gColor = gradeColor(grade);

  // Grade bubble (levo)
  const bubbleX = 80;
  const bubbleY = startY + 8;
  const bubbleR = 52;

  ctx.save();
  ctx.shadowColor = gColor;
  ctx.shadowBlur  = 24;
  ctx.beginPath();
  ctx.arc(bubbleX, bubbleY + bubbleR, bubbleR, 0, Math.PI * 2);
  ctx.strokeStyle = gColor;
  ctx.lineWidth   = 3;
  ctx.stroke();

  ctx.font      = 'bold 64px "Helvetica Neue", Arial, sans-serif';
  ctx.fillStyle = gColor;
  ctx.textAlign = 'center';
  ctx.fillText(grade, bubbleX, bubbleY + bubbleR + 22);
  ctx.restore();

  // Tour Score (desno)
  ctx.textAlign = 'right';
  ctx.font      = '14px "Helvetica Neue", Arial, sans-serif';
  ctx.fillStyle = COLORS.white_dim;
  ctx.fillText('TOUR SCORE', CANVAS_W - 60, startY + 28);

  ctx.font = 'bold 80px "Helvetica Neue", Arial, sans-serif';
  neonText(ctx, String(tourScore), CANVAS_W - 60, startY + 112, COLORS.neon_cyan, 18);

  ctx.textAlign = 'left';
  return startY + 140;
}

/**
 * Crta event arc (bar chart za 5 evenata).
 * @param {CanvasRenderingContext2D} ctx
 * @param {number[]} eventScores
 * @param {string[]} eventNames
 * @param {number}   startY
 * @returns {number} Y ispod sekcije
 */
function drawEventArc(ctx, eventScores, eventNames, startY) {
  const sectionY = startY + 12;

  ctx.font      = 'bold 13px "Helvetica Neue", Arial, sans-serif';
  ctx.fillStyle = COLORS.white_dim;
  ctx.textAlign = 'left';
  ctx.fillText('EVENT ARC', 60, sectionY);

  glowLine(ctx, 60, sectionY + 8, CANVAS_W - 120, COLORS.neon_purple);

  const BAR_H       = 28;
  const BAR_MAX_W   = CANVAS_W - 200;
  const BAR_X       = 150;
  const ROW_H       = 44;
  const LABEL_W     = 130;
  const maxScore    = 100;

  eventScores.forEach((score, idx) => {
    const rowY = sectionY + 22 + idx * ROW_H;

    // Label
    ctx.font      = '13px "Helvetica Neue", Arial, sans-serif';
    ctx.fillStyle = COLORS.white_dim;
    ctx.textAlign = 'right';
    const label = eventNames[idx] ? eventNames[idx].substring(0, 12) : `E${idx + 1}`;
    ctx.fillText(label, BAR_X - 10, rowY + BAR_H / 2 + 5);

    // Bar background
    ctx.save();
    roundRect(ctx, BAR_X, rowY, BAR_MAX_W, BAR_H, 4);
    ctx.fillStyle = COLORS.white_faint;
    ctx.fill();
    ctx.restore();

    // Bar fill
    const fillW  = Math.max(4, Math.round((score / maxScore) * BAR_MAX_W));
    const bColor = score >= 61 ? COLORS.bar_great : score >= 31 ? COLORS.bar_ok : COLORS.bar_bad;

    ctx.save();
    ctx.shadowColor = bColor;
    ctx.shadowBlur  = 6;
    roundRect(ctx, BAR_X, rowY, fillW, BAR_H, 4);
    ctx.fillStyle = bColor;
    ctx.fill();
    ctx.restore();

    // Score number
    ctx.font      = 'bold 13px "Helvetica Neue", Arial, sans-serif';
    ctx.fillStyle = COLORS.white;
    ctx.textAlign = 'left';
    ctx.fillText(String(score), BAR_X + fillW + 8, rowY + BAR_H / 2 + 5);
  });

  return sectionY + 22 + eventScores.length * ROW_H + 20;
}

/**
 * Crta final crew mini kartice.
 * @param {CanvasRenderingContext2D} ctx
 * @param {Array}  finalCrew  — Card[]
 * @param {Object} loyaltyBonuses — { [id]: number }
 * @param {number} startY
 * @returns {number} Y ispod sekcije
 */
function drawFinalCrew(ctx, finalCrew, loyaltyBonuses, startY) {
  const sectionY = startY + 10;

  ctx.font      = 'bold 13px "Helvetica Neue", Arial, sans-serif';
  ctx.fillStyle = COLORS.white_dim;
  ctx.textAlign = 'left';
  ctx.fillText('FINALNA EKIPA', 60, sectionY);

  glowLine(ctx, 60, sectionY + 8, CANVAS_W - 120, COLORS.neon_cyan);

  if (!finalCrew || finalCrew.length === 0) {
    ctx.font      = '13px "Helvetica Neue", Arial, sans-serif';
    ctx.fillStyle = COLORS.white_dim;
    ctx.textAlign = 'center';
    ctx.fillText('— nema podataka —', CANVAS_W / 2, sectionY + 44);
    return sectionY + 70;
  }

  const CARD_W = (CANVAS_W - 120 - (finalCrew.length - 1) * 10) / Math.min(finalCrew.length, 5);
  const CARD_H = 70;
  const CARD_Y = sectionY + 22;
  const startX = 60;

  finalCrew.slice(0, 5).forEach((card, idx) => {
    const cx = startX + idx * (CARD_W + 10);
    const loyal = loyaltyBonuses && loyaltyBonuses[card.id] > 0;

    // Card background
    ctx.save();
    if (loyal) {
      ctx.shadowColor = COLORS.neon_purple;
      ctx.shadowBlur  = 10;
    }
    roundRect(ctx, cx, CARD_Y, CARD_W, CARD_H, 6);
    ctx.fillStyle = loyal ? 'rgba(185,79,255,0.18)' : COLORS.card_bg;
    ctx.fill();
    if (loyal) {
      ctx.strokeStyle = COLORS.neon_purple;
      ctx.lineWidth   = 1.5;
      ctx.stroke();
    }
    ctx.restore();

    // Role
    ctx.font      = '10px "Helvetica Neue", Arial, sans-serif';
    ctx.fillStyle = COLORS.neon_cyan;
    ctx.textAlign = 'center';
    ctx.fillText((card.role || '').toUpperCase(), cx + CARD_W / 2, CARD_Y + 16);

    // Name
    const displayName = (card.name || card.id || '').toUpperCase();
    ctx.font      = `bold ${CARD_W > 100 ? 13 : 11}px "Helvetica Neue", Arial, sans-serif`;
    ctx.fillStyle = COLORS.white;
    ctx.textAlign = 'center';
    // Skrati ime ako je dugo
    const maxChars = Math.floor(CARD_W / 7);
    const shortName = displayName.length > maxChars ? displayName.substring(0, maxChars - 1) + '…' : displayName;
    ctx.fillText(shortName, cx + CARD_W / 2, CARD_Y + 34);

    // Base score
    ctx.font      = '11px "Helvetica Neue", Arial, sans-serif';
    ctx.fillStyle = COLORS.white_dim;
    ctx.textAlign = 'center';
    ctx.fillText(`Score: ${card.base_score ?? '?'}`, cx + CARD_W / 2, CARD_Y + 50);

    // Loyalty badge
    if (loyal) {
      ctx.font      = '9px "Helvetica Neue", Arial, sans-serif';
      ctx.fillStyle = COLORS.neon_purple;
      ctx.textAlign = 'center';
      ctx.fillText('★ LOYAL', cx + CARD_W / 2, CARD_Y + 64);
    }
  });

  return CARD_Y + CARD_H + 24;
}

/**
 * Crta footer sa CTA i URL-om.
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} startY
 */
function drawFooter(ctx, startY) {
  glowLine(ctx, 40, startY, CANVAS_W - 80, COLORS.neon_purple);

  ctx.font      = 'bold 15px "Helvetica Neue", Arial, sans-serif';
  ctx.fillStyle = COLORS.white;
  ctx.textAlign = 'center';
  ctx.fillText(EVENT_DATE, CANVAS_W / 2, startY + 30);

  ctx.font      = '13px "Helvetica Neue", Arial, sans-serif';
  neonText(ctx, BILET_URL, CANVAS_W / 2, startY + 54, COLORS.neon_cyan, 8);

  ctx.font      = '11px "Helvetica Neue", Arial, sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,0.35)';
  ctx.textAlign = 'center';
  ctx.fillText('gari.daily.games', CANVAS_W / 2, startY + 76);
}

// ---------------------------------------------------------------------------
// Main export functions
// ---------------------------------------------------------------------------

/**
 * Generiše Tour Card Canvas i vraca data URL (PNG).
 *
 * @param {Object} tourData
 * @param {number[]}  tourData.event_scores
 * @param {string[]}  tourData.event_names
 * @param {number}    tourData.tour_score
 * @param {string}    tourData.tour_rank       grade: S/A/B/C/F
 * @param {Array}     tourData.final_crew       Card[]
 * @param {Object}    tourData.loyalty_bonuses  { [id]: number }
 * @returns {Promise<string>} data URL
 */
export async function generateTourCard(tourData) {
  const canvas = document.createElement('canvas');
  canvas.width  = CANVAS_W;
  canvas.height = CANVAS_H;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('generateTourCard: canvas 2D context unavailable');

  const {
    event_scores   = [],
    event_names    = [],
    tour_score     = 0,
    tour_rank      = 'F',
    final_crew     = [],
    loyalty_bonuses = {},
  } = tourData;

  // 1. Background
  drawBackground(ctx);

  // 2. Header
  let y = drawHeader(ctx);

  // 3. Grade + Tour Score
  y = drawGradeAndScore(ctx, tour_rank, tour_score, y);

  // 4. Event Arc
  y = drawEventArc(ctx, event_scores, event_names, y + 10);

  // 5. Final Crew
  y = drawFinalCrew(ctx, final_crew, loyalty_bonuses, y + 10);

  // 6. Footer — anchored near bottom
  const footerY = Math.max(y + 20, CANVAS_H - 110);
  drawFooter(ctx, footerY);

  return canvas.toDataURL('image/png');
}

/**
 * Deli Tour Card sliku putem Web Share API ili download fallback.
 *
 * @param {Object} tourData  — isti shape kao generateTourCard
 */
export async function shareTourCard(tourData) {
  let dataUrl;
  try {
    dataUrl = await generateTourCard(tourData);
  } catch (err) {
    console.error('shareTourCard: generisanje slike nije uspelo', err);
    return;
  }

  const shareTitle = 'Ekipa Noći — Kluboslavija Turneja 2026';
  const shareText  = `Moj Tour Score: ${tourData.tour_score ?? 0} (Grade ${tourData.tour_rank ?? '?'}) · Kupi kartu:`;
  const shareUrl   = 'https://bilet.rs/show/261';

  if (navigator.share && navigator.canShare) {
    try {
      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], 'ekipa-noci.png', { type: 'image/png' });
      const shareData = { title: shareTitle, text: shareText, url: shareUrl, files: [file] };

      if (navigator.canShare(shareData)) {
        await navigator.share(shareData);
        return;
      }
    } catch (err) {
      // Korisnik otkazao ili share nije uspio — fallback
      if (err.name !== 'AbortError') {
        console.warn('shareTourCard: Web Share API nije uspio, koristim fallback', err);
      }
    }
  }

  // Fallback: share samo text+url bez fajla
  if (navigator.share) {
    try {
      await navigator.share({ title: shareTitle, text: shareText, url: shareUrl });
      return;
    } catch {
      // ignorisi
    }
  }

  // Konacni fallback: download
  fallbackDownload(dataUrl);
}

/**
 * Preuzima sliku kao PNG fajl.
 * @param {string} dataUrl
 */
function fallbackDownload(dataUrl) {
  const link = document.createElement('a');
  link.href     = dataUrl;
  link.download = 'ekipa-noci-tour.png';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
