// timing.js — wrapper koji upravlja TimingWindow-om za tekući nivo
import { TimingWindow } from './entities/window.js';

export class TimingManager {
  constructor() {
    this.window       = null;
    this.tickTimer    = 0;
    this.tickInterval = 800; // ms između tik zvuka (mijenja se sa nivoom)
    this._firstRun    = false;
  }

  /**
   * Inicijalizuje novi TimingWindow za dati nivo.
   * @param {Object} levelConfig - CONFIG.LEVELS[n]
   * @param {boolean} firstRun - da li koristiti deterministički seed
   */
  reset(levelConfig, firstRun = false) {
    this._firstRun    = firstRun;
    this.window       = new TimingWindow(levelConfig, firstRun);
    // Tick interval smanjuje se sa brzinom (metronom ubrzava)
    this.tickInterval = Math.round(800 / levelConfig.speed);
    this.tickTimer    = 0;
  }

  /**
   * @param {number} dt - delta time ms
   * @returns {{ tick: boolean }} - shouldTick flag za audio
   */
  update(dt) {
    if (!this.window) return { tick: false, blinkToggled: false };

    const prevBlink = this.window.blinkState;
    this.window.update(dt);
    const blinkToggled = this.window.blinkState !== prevBlink;

    this.tickTimer += dt;
    const tick = this.tickTimer >= this.tickInterval;
    if (tick) this.tickTimer = 0;

    return { tick, blinkToggled };
  }

  /**
   * Vraća sve relevantne podatke o trenutnom timing stanju za render i collision.
   * @returns {Object}
   */
  getState() {
    if (!this.window) {
      return {
        barX:        0,
        windowBounds: { left: 0, right: 0 },
        type:         'green',
        blinkState:   true,
        fakeBounds:   null,
        goldenBounds: null,
        windowWidthNorm: 0.2,
      };
    }

    return {
      barX:            this.window.barX,
      windowBounds:    this.window.getWindowBounds(),
      type:            this.window.type,
      blinkState:      this.window.blinkState,
      fakeBounds:      this.window.getFakeBounds(),
      goldenBounds:    this.window.getGoldenBounds(),
      windowWidthNorm: this.window.windowWidthNorm,
    };
  }

  /**
   * Provjera klika — delegira na TimingWindow.
   * @param {number} clickXNorm
   * @returns {boolean}
   */
  checkClick(clickXNorm) {
    if (!this.window) return false;
    return this.window.isClickInWindow(clickXNorm);
  }
}
