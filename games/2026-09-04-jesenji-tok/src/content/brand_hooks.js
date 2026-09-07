/**
 * @module brand_hooks
 * Brand configuration for Guncati and Kluboslavija.
 *
 * Jesenji Tok serves two strategic brands:
 *   1. Guncati — permaculture farm learning, Tom Sawyer model, masterclass hook
 *   2. Kluboslavija — turneja 2026, community/culture, seasonal event companion
 *
 * This module provides:
 *   - Share text generation
 *   - CTAs for score screen
 *   - Event-specific messaging
 *   - Social media hashtags
 *   - Deep links for Guncati masterclass enrollment
 */

// ─── Brand Config ─────────────────────────────────────────────────────────────

/**
 * Brand configuration object
 * @type {Object}
 */
export const BRAND = {
  // Guncati
  guncati_name: 'Guncati',
  guncati_cta: 'Guncati Jesenji Masterclass — nauči planiranje imanja uživo',
  guncati_url: 'https://guncati.rs',
  guncati_tagline: 'Povratak na selo — aktivno, pametno, zajednički.',
  guncati_logo_emoji: '🌿',
  guncati_cta_short: 'Masterclass Guncati →',

  // Kluboslavija
  kluboslavija_name: 'Kluboslavija',
  kluboslavija_event: 'Jesenji event Kluboslavija',
  kluboslavija_url: 'https://kluboslavija.rs',
  kluboslavija_tagline: 'Turneja 2026 — muzika, zemlja, zajednica.',
  kluboslavija_logo_emoji: '🎵',
  kluboslavija_cta_short: 'Turneja 2026 →',

  // MKDSLend
  mkdslend_name: 'MKDSLend',
  mkdslend_tagline: 'Zabavni radni park',
  mkdslend_url: 'https://mkdslend.rs',

  // Game
  game_name: 'Jesenji Tok',
  share_url: 'https://mkdsl.github.io/gari-daily-games/games/2026-09-04-jesenji-tok/',

  // Hashtags
  hashtags: ['#Guncati', '#JesenjiTok', '#Kluboslavija', '#MKDSLend', '#SezonskoPlaniranje'],
};

// ─── Share Text ───────────────────────────────────────────────────────────────

/**
 * Build share text for social media.
 * @param {string} rank   - rank label (e.g. "Savršena sezona")
 * @param {number} score  - numerical score
 * @param {string} weatherName - weather preset name
 * @param {{ ecosystem_bonus?: boolean, prestige_bonus?: string|null }} [options]
 * @returns {string}
 */
export function buildShareText(rank, score, weatherName, options = {}) {
  const { ecosystem_bonus = false, prestige_bonus = null } = options;
  const ecoStr = ecosystem_bonus ? ' 🌿 Ekosistem bonus!' : '';
  const hashtags = BRAND.hashtags.slice(0, 3).join(' ');
  return (
    `Moja jesenja sezona: ${rank} (${score}p) 🌾\n` +
    `Vreme: ${weatherName}${ecoStr}\n` +
    `${BRAND.share_url}\n` +
    hashtags
  );
}

/**
 * Build a short one-line share text for Web Share API title field.
 * @param {string} rank
 * @param {number} score
 * @returns {string}
 */
export function buildShareTitle(rank, score) {
  return `Jesenji Tok — ${rank} (${score}p)`;
}

/**
 * Build a branded share card for a specific score tier.
 * Returns different CTAs based on score level.
 * @param {number} score
 * @param {string} rank
 * @returns {{ headline: string, body: string, cta: string, cta_url: string }}
 */
export function buildScoreCard(score, rank) {
  if (score >= 900) {
    return {
      headline: `🌟 Savršena sezona: ${score}p`,
      body: 'Sve parcele u optimalnom prozoru. Pravi farmer.',
      cta: BRAND.guncati_cta,
      cta_url: BRAND.guncati_url,
    };
  }
  if (score >= 600) {
    return {
      headline: `✅ Solidna sezona: ${score}p`,
      body: 'Dobro planiranje se vidi. Možeš bolje — masterclass?',
      cta: BRAND.guncati_cta,
      cta_url: BRAND.guncati_url,
    };
  }
  return {
    headline: `🌾 ${rank}: ${score}p`,
    body: 'Svaka sezona uči. Guncati masterclass pomaže.',
    cta: BRAND.guncati_cta_short,
    cta_url: BRAND.guncati_url,
  };
}

// ─── Score Screen CTAs ────────────────────────────────────────────────────────

/**
 * Footer CTAs shown on the score screen.
 * @type {Array<{ label: string, url: string, emoji: string, primary: boolean, description?: string }>}
 */
export const SCORE_CTAS = [
  {
    label: 'Guncati Masterclass',
    url: BRAND.guncati_url,
    emoji: '🌿',
    primary: true,
    description: 'Nauči permakulturno planiranje imanja uživo sa Branom.',
  },
  {
    label: 'Kluboslavija Turneja 2026',
    url: BRAND.kluboslavija_url,
    emoji: '🎵',
    primary: false,
    description: 'Muzika, zemlja, zajednica — jesenja turneja.',
  },
];

/**
 * Educational content link shown on score screen.
 * @type {{ label: string, url: string, emoji: string }}
 */
export const EDU_LINK = {
  label: 'Nauči više o sezonskom planiranju imanja',
  url: BRAND.guncati_url,
  emoji: '📚',
};

// ─── Rank-Specific CTAs ───────────────────────────────────────────────────────

/**
 * Masterclass CTA content indexed by rank tier.
 * `overlay_text` and `overlay_subtitle` are available for richer display contexts.
 * @type {Record<'perfect'|'solid'|'lower', { label: string, url: string, emoji: string, overlay_text: string, overlay_subtitle: string, cta_button: string }>}
 */
export const MASTERCLASS_CTA_BY_RANK = {
  perfect: {
    label: 'Ti si spreman za Guncati masterclass',
    url: BRAND.guncati_url,
    emoji: '🌟',
    overlay_text: 'Ti si spreman za Guncati masterclass — prava farmerska sezona.',
    overlay_subtitle: 'Datum: proleće 2027 · Guncati imanje · Živa nastava.',
    cta_button: 'Rezerviši mesto →',
  },
  solid: {
    label: 'Evo šta ćeš naučiti na masterclassu',
    url: BRAND.guncati_url,
    emoji: '🌿',
    overlay_text: 'Evo šta ćeš naučiti na Guncati masterclassu.',
    overlay_subtitle: 'Planiranje imanja · Micelij · Zimska priprema · Jezero.',
    cta_button: 'Pogledaj program →',
  },
  lower: {
    label: 'Masterclass je za tebe — počni ponovo i pripremi se',
    url: BRAND.guncati_url,
    emoji: '🌱',
    overlay_text: 'Masterclass je za tebe — počni ponovo i pripremi se.',
    overlay_subtitle: 'Besplatni resursi na Guncati blogu dok ne budeš spreman.',
    cta_button: 'Nauči osnove →',
  },
};

/**
 * Get the appropriate masterclass CTA for a given score.
 * @param {number} score
 * @returns {{ label: string, url: string, emoji: string, overlay_text: string, overlay_subtitle: string, cta_button: string }}
 */
export function getCTAForScore(score) {
  if (score >= 900) return MASTERCLASS_CTA_BY_RANK.perfect;
  if (score >= 600) return MASTERCLASS_CTA_BY_RANK.solid;
  return MASTERCLASS_CTA_BY_RANK.lower;
}

/**
 * Get Kluboslavija event CTA for current season.
 * @returns {{ label: string, url: string, emoji: string }}
 */
export function getEventCTA() {
  return {
    label: 'Jesenji Klub event — Brana i ekipa',
    url: BRAND.kluboslavija_url,
    emoji: '🎵',
  };
}

/**
 * Build share text optimized for Instagram Stories caption (brief, visual).
 * @param {string} rank
 * @param {number} score
 * @param {{ ecosystem_bonus?: boolean }} [options]
 * @returns {string}
 */
export function buildStoriesShareText(rank, score, options = {}) {
  const ecoLine = options.ecosystem_bonus ? '\n🌿 Ekosistem bonus' : '';
  return `🌾 ${rank} · ${score}p${ecoLine}\n${BRAND.hashtags.slice(0, 2).join(' ')}\n${BRAND.share_url}`;
}

// ─── Kluboslavija Grand Finale Cross-Promo ────────────────────────────────────

/**
 * Kluboslavija grand finale overlay config.
 * Triggered after "Savršena sezona" rank (score >= 900).
 * @type {{ overlay_text: string, overlay_subtitle: string, cta_button: string, url: string, emoji: string }}
 */
export const KLUBOSLAVIJA_FINALE_CTA = {
  overlay_text: 'Guncati slavi — grand finale masterclass, datum TBD. Pridrži mesto.',
  overlay_subtitle: 'Kluboslavija grand finale · Guncati imanje · Turneja 2026',
  cta_button: 'Pridrži mesto →',
  url: BRAND.kluboslavija_url,
  emoji: '🎵',
};

/**
 * Returns Kluboslavija grand finale CTA if score qualifies (>= 900), otherwise null.
 * @param {number} score
 * @returns {typeof KLUBOSLAVIJA_FINALE_CTA | null}
 */
export function getFinalePromo(score) {
  return score >= 900 ? KLUBOSLAVIJA_FINALE_CTA : null;
}
