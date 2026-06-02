// entities/window.js — Timing Window entitet
import { CONFIG } from '../config.js';

/**
 * Seeded pseudo-random (LCG) za deterministički raspored fake zona.
 * Seed 42 ako je firstRun.
 */
function makePrng(seed) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 4294967296;
  };
}

export class TimingWindow {
  /**
   * @param {Object} levelConfig - CONFIG.LEVELS[n]
   * @param {boolean} firstRun - deterministički seed ako true
   */
  constructor(levelConfig, firstRun = false) {
    this.levelConfig = levelConfig;
    const sp = levelConfig.speciality;

    // Pozicija lijevog ruba zelenog prozora na baru (0–1 normalizovano)
    this.barX      = 0.1;
    this.direction = 1;   // 1 = desno, -1 = lijevo

    // Širina zelenog prozora (normalizovana) — izvedena iz windowMs i speed
    // Manji windowMs = uži prozor
    this.windowWidthNorm = this._calcWindowWidth();

    // Tip prozora koji je aktivan za KLIK logiku
    this.type = 'green'; // 'green' | 'golden' | 'fake'

    // --- Blink mehanika (nivo 6) ---
    this.blinkState = true;   // true = vidljiv, false = skriven
    this.blinkTimer = 0;

    // --- Golden window (nivo 5, 8) ---
    this.goldenActive   = false;
    this.goldenX        = 0.5;           // normalizovana pozicija
    this.goldenTimer    = 0;             // koliko je golden window vidljiv (ms)
    this.goldenCooldown = CONFIG.GOLDEN_WINDOW_INTERVAL_MS;

    // --- Fake zone (nivo 2, 8) ---
    this.hasFakeZone  = (sp === 'fake_zone' || sp === 'fake_and_golden' || sp === 'all_combined');
    this.fakeWidth    = 0.08;            // normalizovana širina fake zone
    this.fakeX        = 0.0;            // levi rub fake zone (normalizovano)

    // PRNG za fake zone poziciju (deterministički na first-run)
    this._prng = makePrng(firstRun ? 42 : Math.floor(Math.random() * 99999));
    this._placeFakeZone();

    // --- Direction change (nivo 3) ---
    this.dirChangeTimer = 0;
    this.dirChangeInterval = 1800; // ms između promjena smjera

    // --- All combined (nivo 10): uključi i blink i golden i fake ---
    this.allCombined = sp === 'all_combined';

    // Ukupno proticanje vremena (za sinusoidu)
    this.elapsed = 0;
    this.usesSinusoid = (sp === 'direction_change' || sp === 'tutorial');
  }

  // ── Privatne metode ───────────────────────────────────────────────────────

  _calcWindowWidth() {
    // windowMs 800ms → ~0.25, 220ms → ~0.07
    const ratio = this.levelConfig.windowMs / 800;
    return Math.max(0.06, 0.28 * ratio);
  }

  _placeFakeZone() {
    if (!this.hasFakeZone) return;
    // Fake zona se ne smije preklapati sa centralnom zelenom zonom
    // Stavi je na nasumičnu stranu (levo/desno od centra)
    const side = this._prng() > 0.5 ? 0 : 1;
    if (side === 0) {
      this.fakeX = 0.05 + this._prng() * 0.15;
    } else {
      this.fakeX = 0.72 + this._prng() * 0.18;
    }
  }

  _wrapBarX() {
    const maxLeft = 1.0 - this.windowWidthNorm;
    if (this.barX >= maxLeft) {
      this.barX     = maxLeft;
      this.direction = -1;
    }
    if (this.barX <= 0) {
      this.barX     = 0;
      this.direction = 1;
    }
  }

  // ── Javni API ─────────────────────────────────────────────────────────────

  /**
   * @param {number} dt - delta time ms
   */
  update(dt) {
    const sp    = this.levelConfig.speciality;
    const speed = this.levelConfig.speed;
    this.elapsed += dt;

    // ── Kretanje prozora ──────────────────────────────────────────────────
    if (this.usesSinusoid) {
      // Sinusoidna oscilacija — glatka promjena smjera
      const period = 2000 / speed; // ms za jednu punu sinusoidu
      const t      = (this.elapsed % period) / period;
      const maxLeft = 1.0 - this.windowWidthNorm;
      this.barX     = ((Math.sin(t * Math.PI * 2) + 1) / 2) * maxLeft;
    } else {
      // Linearna ping-pong oscilacija
      const speedNorm = speed * 0.00028; // pikseli/ms u normalizovanom prostoru
      this.barX += this.direction * speedNorm * dt;
      this._wrapBarX();
    }

    // ── Direction change (nivo 3) — slučajne promjene smjera ─────────────
    if (sp === 'direction_change' || sp === 'all_combined') {
      this.dirChangeTimer += dt;
      if (this.dirChangeTimer >= this.dirChangeInterval) {
        this.dirChangeTimer = 0;
        this.dirChangeInterval = 1200 + Math.random() * 1200;
        this.direction *= -1;
        this._wrapBarX();
      }
    }

    // ── Blink mehanika (nivo 6, all_combined) ────────────────────────────
    if (sp === 'blink_window' || this.allCombined) {
      this.blinkTimer += dt;
      if (this.blinkTimer >= CONFIG.BLINK_INTERVAL_MS) {
        this.blinkTimer  = 0;
        this.blinkState  = !this.blinkState;
      }
    }

    // ── Golden window (nivo 5, 8, all_combined) ───────────────────────────
    if (sp === 'golden_window' || sp === 'fake_and_golden' || this.allCombined) {
      if (this.goldenActive) {
        this.goldenTimer += dt;
        if (this.goldenTimer >= CONFIG.GOLDEN_WINDOW_DURATION_MS) {
          this.goldenActive   = false;
          this.goldenTimer    = 0;
          this.goldenCooldown = CONFIG.GOLDEN_WINDOW_INTERVAL_MS;
          this.type           = 'green';
        }
      } else {
        this.goldenCooldown -= dt;
        if (this.goldenCooldown <= 0) {
          this.goldenActive   = true;
          this.goldenTimer    = 0;
          this.goldenCooldown = CONFIG.GOLDEN_WINDOW_INTERVAL_MS;
          // Random pozicija koja ne koincidira sa zelenom zonom
          this.goldenX        = 0.05 + Math.random() * 0.85;
          this.type           = 'golden';
        }
      }
    }

    // Fake zone se povremeno premješta (svake ~4 sekunde)
    if (this.hasFakeZone && Math.floor(this.elapsed / 4000) !== Math.floor((this.elapsed - dt) / 4000)) {
      this._placeFakeZone();
    }

    // Default type
    if (!this.goldenActive) {
      this.type = 'green';
    }
  }

  /**
   * Vraća granice zelenog prozora u normalizovanim koordinatama (0-1).
   * @returns {{ left: number, right: number }}
   */
  getWindowBounds() {
    return {
      left:  this.barX,
      right: this.barX + this.windowWidthNorm,
    };
  }

  /**
   * Granice fake zone (0-1).
   * @returns {{ left: number, right: number } | null}
   */
  getFakeBounds() {
    if (!this.hasFakeZone) return null;
    return {
      left:  this.fakeX,
      right: this.fakeX + this.fakeWidth,
    };
  }

  /**
   * Granice golden window (0-1) ili null ako nije aktivna.
   * @returns {{ left: number, right: number } | null}
   */
  getGoldenBounds() {
    if (!this.goldenActive) return null;
    const halfW = 0.07; // zlatni prozor uži od zelenog
    return {
      left:  Math.max(0, this.goldenX - halfW),
      right: Math.min(1, this.goldenX + halfW),
    };
  }

  /**
   * Provjera da li je klik u prozoru (ignoriše blink state za logiku — igrač pogađa na slepo).
   * @param {number} clickXNorm - normalizovani X (0-1) na timing baru
   * @returns {boolean}
   */
  isClickInWindow(clickXNorm) {
    const bounds = this.getWindowBounds();
    return clickXNorm >= bounds.left && clickXNorm <= bounds.right;
  }
}
