/**
 * render.js — Particle feedback system.
 * DOM-based float-up effect for harvest revenue, errors, and info messages.
 * No canvas needed — uses CSS keyframes defined in styles/game.css.
 */

// ─── Particle type config ──────────────────────────────────────────────────────

const PARTICLE_STYLES = {
  revenue: {
    color: '#D4A017',
    bgColor: 'rgba(212, 160, 23, 0.12)',
    borderColor: 'rgba(212, 160, 23, 0.35)',
    prefix: '+',
  },
  error: {
    color: '#E07B39',
    bgColor: 'rgba(224, 123, 57, 0.12)',
    borderColor: 'rgba(224, 123, 57, 0.35)',
    prefix: '⚠',
  },
  info: {
    color: '#A8D5A2',
    bgColor: 'rgba(168, 213, 162, 0.12)',
    borderColor: 'rgba(168, 213, 162, 0.30)',
    prefix: '',
  },
  achievement: {
    color: '#E8D5F0',
    bgColor: 'rgba(232, 213, 240, 0.15)',
    borderColor: 'rgba(181, 134, 208, 0.45)',
    prefix: '🏆',
  },
  synergy: {
    color: '#4A7C3F',
    bgColor: 'rgba(74, 124, 63, 0.12)',
    borderColor: 'rgba(106, 163, 86, 0.40)',
    prefix: '🌿',
  },
};

const PARTICLE_DURATION_MS = 900;
const PARTICLE_OFFSET_X_RANGE = 60; // px random horizontal spread

let _particleCount = 0;

/**
 * Spawn a floating particle at the center-top of the container.
 * @param {HTMLElement} container - Target element to spawn particle in
 * @param {string} text - Display text (e.g. "1.234 din" or "Inokulacija!")
 * @param {'revenue'|'error'|'info'|'achievement'|'synergy'} type
 */
export function spawnParticle(container, text, type = 'revenue') {
  if (!container || typeof document === 'undefined') return;

  const style = PARTICLE_STYLES[type] || PARTICLE_STYLES.info;
  const el = document.createElement('div');
  el.className = `particle-float particle-${type}`;

  const prefix = style.prefix ? style.prefix + ' ' : '';
  el.textContent = prefix + text;

  // Random horizontal offset so multiple particles don't stack
  const offsetX = (Math.random() - 0.5) * PARTICLE_OFFSET_X_RANGE;
  const uniqueId = ++_particleCount;

  Object.assign(el.style, {
    position: 'absolute',
    zIndex: '200',
    pointerEvents: 'none',
    left: `calc(50% + ${offsetX.toFixed(0)}px)`,
    top: '50%',
    transform: 'translateX(-50%)',
    color: style.color,
    background: style.bgColor,
    border: `1px solid ${style.borderColor}`,
    borderRadius: '6px',
    padding: '3px 8px',
    fontSize: '0.78rem',
    fontWeight: '600',
    whiteSpace: 'nowrap',
    animation: `particle-float-up ${PARTICLE_DURATION_MS}ms ease-out forwards`,
    opacity: '1',
  });

  // Ensure container is position-relative
  const containerPos = getComputedStyle(container).position;
  if (containerPos === 'static') {
    container.style.position = 'relative';
  }

  container.appendChild(el);

  // Auto-remove after animation
  setTimeout(() => {
    if (el.parentNode) el.remove();
  }, PARTICLE_DURATION_MS + 100);

  return el;
}

/**
 * Spawn a revenue particle with formatted din amount.
 * @param {HTMLElement} container
 * @param {number} amount - Amount in din
 */
export function spawnRevenueParticle(container, amount) {
  const text = formatParticleDin(amount);
  return spawnParticle(container, text, 'revenue');
}

/**
 * Spawn an error particle.
 * @param {HTMLElement} container
 * @param {string} msg
 */
export function spawnErrorParticle(container, msg) {
  return spawnParticle(container, msg, 'error');
}

/**
 * Spawn multiple staggered particles (e.g. for large harvest).
 * @param {HTMLElement} container
 * @param {string} text
 * @param {string} type
 * @param {number} count
 */
export function spawnParticleBurst(container, text, type = 'revenue', count = 3) {
  for (let i = 0; i < count; i++) {
    setTimeout(() => spawnParticle(container, text, type), i * 120);
  }
}

// ─── Inject particle CSS keyframe (once) ──────────────────────────────────────

let _keyframeInjected = false;

/**
 * Ensure the particle-float-up keyframe is available in the document.
 * Called lazily — safe to call multiple times.
 */
export function ensureParticleCSS() {
  if (_keyframeInjected || typeof document === 'undefined') return;
  _keyframeInjected = true;

  const existing = document.querySelector('#particle-float-style');
  if (existing) return;

  const style = document.createElement('style');
  style.id = 'particle-float-style';
  style.textContent = `
    @keyframes particle-float-up {
      0%   { opacity: 1;   transform: translateX(-50%) translateY(0) scale(1); }
      60%  { opacity: 0.9; transform: translateX(-50%) translateY(-32px) scale(1.05); }
      100% { opacity: 0;   transform: translateX(-50%) translateY(-60px) scale(0.9); }
    }
  `;
  document.head.appendChild(style);
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatParticleDin(n) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M din';
  if (n >= 1000) return Math.floor(n / 1000) + 'k din';
  return Math.floor(n) + ' din';
}

// Ensure CSS is injected when module loads (browser environment)
if (typeof document !== 'undefined') {
  ensureParticleCSS();
}
