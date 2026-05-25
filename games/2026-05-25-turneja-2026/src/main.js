// main.js — Game loop state machine
// Phases: START → TUTORIAL → MACRO → EVENT_INTRO → RISK_WARNING → BLOCK_PHASE → BLOCK_RESULT → EVENT_RESULT → WIN/GAMEOVER

import { AudioManager } from './audio.js';
import { createInitialState, saveState, loadState, clearState } from './state.js';
import { CITIES, BOOKING_TIERS } from './config.js';
import { createFullDeck } from './entities/crew_card.js';
import { generateOffers } from './entities/booking_offer.js';
import { calculateSynergies } from './systems/synergies.js';
import { rollEvent, applyEvent, getMostLikelyRisk, shouldShowRiskWarning } from './systems/events.js';
import { scoreBlock, getBlockBpm } from './systems/scoring.js';
import { applyBlockResult, applyEventResult, prepareNextEvent, advanceToNextCity, checkWin } from './systems/progression.js';
import { saveHighscore, checkDailyHighscore } from './systems/highscore.js';
import { startCanvasLoop, drawBlockProgress } from './render.js';
import {
  showStart, showTutorial, showMacroHQ, showEventIntro,
  showRiskWarning, showBlockPhase, showBlockResult, showEventResult,
  showGameOver, showWin, showToast
} from './ui.js';
import { TUTORIAL_STEPS } from './content/brand_hooks.js';

// ===================== GAME ENGINE =====================

class GameEngine {
  constructor() {
    this.audio = new AudioManager();
    this.state = null;
    this.canvasLoopCancel = null;
    this._blockEventResult = null; // event result for current block
    this._currentOffers = null;
    this._pendingMacroChoices = null;
  }

  // ===================== INIT =====================
  init() {
    // Try to load saved state
    const saved = loadState();
    if (saved && saved.phase && saved.phase !== 'START' && saved.phase !== 'GAMEOVER' && saved.phase !== 'WIN') {
      this.state = saved;
      this.dispatch(this.state.phase);
    } else {
      this.showStartScreen(!!saved);
    }
  }

  showStartScreen(hasSave) {
    showStart(
      () => this.startNewGame(),
      () => {
        const saved = loadState();
        if (saved) {
          this.state = saved;
          this.dispatch(this.state.phase);
        }
      },
      hasSave
    );
  }

  // ===================== NEW GAME =====================
  startNewGame() {
    clearState();
    this.state = createInitialState();

    // Tutorial first if not done
    if (!this.state.tutorial_done) {
      this.state.phase = 'TUTORIAL';
      this.state.tutorial_step = 0;
      // Set up Avala as current city for tutorial
      this.state.tourney.current_city = 'avala';
      this.state.tourney.current_city_index = 0;
      // Give tutorial a fixed deck
      this.state.event_state.deck = createFullDeck();
      saveState(this.state);
      this.runTutorial();
    } else {
      this.enterMacro();
    }
  }

  // ===================== TUTORIAL =====================
  runTutorial() {
    const step = this.state.tutorial_step || 0;
    this.audio.playAmbient();

    showTutorial(
      step,
      this.state.event_state.deck,
      () => {
        // Next step
        this.state.tutorial_step = (this.state.tutorial_step || 0) + 1;
        if (this.state.tutorial_step >= TUTORIAL_STEPS.length) {
          this.completeTutorial();
        } else {
          saveState(this.state);
          this.runTutorial();
        }
      },
      () => {
        // Skip tutorial
        this.completeTutorial();
      }
    );
  }

  completeTutorial() {
    this.state.tutorial_done = true;
    this.state.tutorial_step = 0;
    showToast('Tutorial završen! Avala čeka.', 'success');

    // Run actual Avala tutorial event (1 block, no random events)
    this.state.phase = 'TUTORIAL_EVENT';
    this.state.event_state.deck = createFullDeck();
    this.state.tourney.current_city = 'avala';
    this.state.tourney.current_city_index = 0;

    // Skip macro for first city, use defaults
    this.state.event_state.dj_tier = 1;
    this.state.event_state.booking_id = 'budget';

    saveState(this.state);
    this.audio.stopAmbient();

    // Show event intro then go directly to block phase
    const city = CITIES[0];
    showEventIntro(city, 0, () => {
      this.state.phase = 'BLOCK_PHASE';
      saveState(this.state);
      this.runBlockPhase(0, true); // isTutorial = true
    });
  }

  // ===================== MACRO HQ =====================
  enterMacro() {
    this.audio.stopBeat();
    this.audio.playAmbient();

    const cityIdx = this.state.tourney.current_city_index;
    const nextIdx = cityIdx + 1;

    // Check if all cities done
    if (nextIdx >= CITIES.length && this.state.tourney.completed_events.length >= CITIES.length) {
      this.resolveEndgame();
      return;
    }

    // Advance city index if needed
    if (nextIdx < CITIES.length && nextIdx !== cityIdx) {
      this.state.tourney.current_city_index = nextIdx;
      this.state.tourney.current_city = CITIES[nextIdx].id;
    }

    this.state.phase = 'MACRO';

    // Generate booking offers
    const offers = generateOffers({}, {
      budget: this.state.tourney.budget,
      reputation: this.state.tourney.reputation
    });
    this._currentOffers = offers;
    this._pendingMacroChoices = { booking_id: null, promo_id: 'none', crew_action_id: 'none' };

    saveState(this.state);

    showMacroHQ(this.state, offers, {
      onBookingSelect: (offer) => {
        this._pendingMacroChoices.booking_id = offer.id;
      },
      onPromoSelect: (promo) => {
        this._pendingMacroChoices.promo_id = promo.id;
      },
      onCrewAction: (action) => {
        this._pendingMacroChoices.crew_action_id = action.id;
      },
      onConfirm: (choices) => {
        this._pendingMacroChoices = {
          booking_id: choices.booking.id,
          promo_id: choices.promo ? choices.promo.id : 'none',
          crew_action_id: choices.crewAction ? choices.crewAction.id : 'none'
        };
        this.startEvent(this._pendingMacroChoices);
      },
      audio: this.audio
    });
  }

  // ===================== EVENT START =====================
  startEvent(macroChoices) {
    this.audio.stopAmbient();

    // Apply macro choices to state
    prepareNextEvent(this.state, macroChoices);

    // Give crew the full deck
    this.state.event_state.deck = createFullDeck();
    this.state.event_state.blocks_done = 0;
    this.state.event_state.blocks_results = [];
    this.state.event_state.fan_score = 0;
    this.state.event_state.revenue = 0;
    this.state.event_state.media_coverage = 0;

    const cityIdx = this.state.tourney.current_city_index;
    const city = CITIES[cityIdx];

    this.state.phase = 'EVENT_INTRO';
    saveState(this.state);

    const preboost = this.state.tourney.pending_fan_preboost || 0;
    showEventIntro(city, preboost, () => {
      this.runBlockPhase(0, false);
    });
  }

  // ===================== BLOCK PHASE =====================
  runBlockPhase(blockIndex, isTutorial) {
    const city = CITIES[this.state.tourney.current_city_index || 0];
    const bpm = getBlockBpm(blockIndex);

    // Check if risk warning should show (not in tutorial)
    if (!isTutorial) {
      const shouldWarn = shouldShowRiskWarning(city.id);
      if (shouldWarn) {
        const riskInfo = getMostLikelyRisk(city.id);
        if (riskInfo) {
          this.state.phase = 'RISK_WARNING';
          saveState(this.state);
          showRiskWarning(
            { icon: riskInfo.icon, label: riskInfo.label, mitigates: riskInfo.mitigates },
            () => this.showBlockScreen(blockIndex, isTutorial, bpm)
          );
          return;
        }
      }
    }

    this.showBlockScreen(blockIndex, isTutorial, bpm);
  }

  showBlockScreen(blockIndex, isTutorial, bpm) {
    this.state.phase = 'BLOCK_PHASE';
    saveState(this.state);

    this.audio.startEventBeat(bpm);

    let canvasLoop = null;
    const canvasState = {
      fanScore: this.state.event_state.fan_score || 0,
      maxFans: 2000,
      bpm,
      blockIndex,
      blockScores: (this.state.event_state.blocks_results || []).map(b => b.fan_gain)
    };

    showBlockPhase(blockIndex, this.state, {
      onPlay: (selectedCards, bIdx) => {
        if (canvasLoop) canvasLoop();
        this.resolveBlock(selectedCards, bIdx, isTutorial);
      },
      getSynergies: (cards) => calculateSynergies(cards),
      onSynergySound: () => this.audio.playSynergy(),
      onCanvasReady: (canvas, bIdx) => {
        // Start canvas loop
        canvasLoop = startCanvasLoop(canvas, () => ({
          fanScore: this.state.event_state.fan_score || 0,
          maxFans: 2000,
          bpm: canvasState.bpm,
          blockIndex: bIdx,
          blockScores: (this.state.event_state.blocks_results || []).map(b => b.fan_gain)
        }));
      }
    });
  }

  // ===================== RESOLVE BLOCK =====================
  resolveBlock(selectedCards, blockIndex, isTutorial) {
    const city = CITIES[this.state.tourney.current_city_index || 0];
    const synResult = calculateSynergies(selectedCards);

    // Roll random event (skip in tutorial)
    let eventResult = null;
    if (!isTutorial) {
      const crew_roles = selectedCards.map(c => c.role);
      const eventReduce = synResult.event_reduce || 0;
      eventResult = rollEvent(city.id, crew_roles, this.state.tourney.prestige_mode, eventReduce);
    }

    // Score this block
    const booking = BOOKING_TIERS.find(b => b.id === this.state.event_state.booking_id);
    const bookingHype = booking ? booking.hypeBonus : 0;
    const promoId = this.state.event_state.promo_id;
    const promoMediaBonus = promoId === 'full' ? 0.15 : promoId === 'online' ? 0.05 : 0;

    const blockScore = scoreBlock(
      blockIndex,
      synResult,
      this.state.event_state.dj_tier,
      city.id,
      city.modVal,
      city.modifier,
      eventResult,
      { booking_hype_bonus: bookingHype, promo_media_bonus: promoMediaBonus }
    );

    // Apply event effects
    if (eventResult && !eventResult.mitigated) {
      applyEvent(eventResult, this.state.event_state, this.state.tourney);
      this.audio.playMissed();
    } else if (eventResult && eventResult.mitigated) {
      showToast(`${eventResult.event.label} mitigovan! ✓`, 'success');
    }

    // Apply block result to state
    applyBlockResult(this.state, blockScore);

    // Scale audio BPM
    const nextBpm = getBlockBpm(blockIndex + 1);
    this.audio.scaleBeat(nextBpm);

    this.state.phase = 'BLOCK_RESULT';
    saveState(this.state);

    showBlockResult(blockIndex, blockScore, synResult, eventResult, () => {
      const nextBlock = blockIndex + 1;
      if (nextBlock < 3) {
        this.runBlockPhase(nextBlock, isTutorial);
      } else {
        this.resolveEvent(isTutorial);
      }
    });
  }

  // ===================== RESOLVE EVENT =====================
  resolveEvent(isTutorial) {
    this.audio.stopBeat();

    const cityIdx = this.state.tourney.current_city_index || 0;
    const isAvala = CITIES[cityIdx].id === 'avala';

    // Apply event results to tourney
    applyEventResult(this.state);

    // If tutorial event, mark city done and advance
    if (isTutorial) {
      // Tutorial Avala counts as a completed event
      this.state.tourney.completed_events.push({
        city: 'avala',
        fan_score: this.state.event_state.fan_score || 0,
        revenue: this.state.event_state.revenue || 0,
        media: this.state.event_state.media_coverage || 0
      });
    }

    // Check win/lose
    const outcome = checkWin(this.state);

    this.state.phase = 'EVENT_RESULT';
    saveState(this.state);

    // Save highscore
    const hs = checkDailyHighscore(this.state.tourney.fan_base);
    if (hs.isNewRecord) {
      saveHighscore(this.state.tourney.fan_base, CITIES[cityIdx].name);
    }

    showEventResult(this.state, isAvala, () => {
      if (outcome === 'win' || outcome === 'partial_win') {
        this.resolveEndgame(outcome);
        return;
      }
      if (outcome === 'gameover_budget' || outcome === 'gameover_morale') {
        this.showGameOver(outcome);
        return;
      }

      // Check if all cities done
      if (this.state.tourney.completed_events.length >= CITIES.length) {
        this.resolveEndgame('win');
        return;
      }

      this.enterMacro();
    });
  }

  // ===================== ENDGAME =====================
  resolveEndgame(outcome) {
    this.audio.stopBeat();
    this.audio.stopAmbient();

    const fans = this.state.tourney.fan_base;

    if (outcome === 'gameover_budget' || outcome === 'gameover_morale') {
      this.showGameOver(outcome);
      return;
    }

    saveHighscore(fans, this.state.tourney.current_city || 'Guncati');
    this.audio.playWin();

    this.state.phase = 'WIN';
    saveState(this.state);

    showWin(this.state, () => {
      clearState();
      this.startNewGame();
    });
  }

  showGameOver(reason) {
    this.audio.stopBeat();
    this.audio.stopAmbient();
    this.audio.playGameOver();

    this.state.phase = 'GAMEOVER';
    saveState(this.state);

    showGameOver(reason, this.state, () => {
      clearState();
      this.startNewGame();
    });
  }

  // ===================== DISPATCH =====================
  dispatch(phase) {
    switch (phase) {
      case 'START':
        this.showStartScreen(false);
        break;
      case 'TUTORIAL':
        this.runTutorial();
        break;
      case 'TUTORIAL_EVENT':
        // Resume tutorial event
        this.runBlockPhase(this.state.event_state.blocks_done || 0, true);
        break;
      case 'MACRO':
        this.enterMacro();
        break;
      case 'EVENT_INTRO': {
        const cityIdx = this.state.tourney.current_city_index || 0;
        const city = CITIES[cityIdx];
        const preboost = this.state.tourney.pending_fan_preboost || 0;
        showEventIntro(city, preboost, () => this.runBlockPhase(0, false));
        break;
      }
      case 'RISK_WARNING':
      case 'BLOCK_PHASE': {
        const blocksDone = this.state.event_state.blocks_done || 0;
        this.runBlockPhase(blocksDone, false);
        break;
      }
      case 'BLOCK_RESULT':
        // Re-render from last block result
        this.runBlockPhase(Math.max(0, (this.state.event_state.blocks_done || 1) - 1), false);
        break;
      case 'EVENT_RESULT':
        this.resolveEvent(false);
        break;
      case 'WIN':
        this.resolveEndgame('win');
        break;
      case 'GAMEOVER':
        this.showGameOver('gameover_budget');
        break;
      default:
        this.showStartScreen(false);
    }
  }
}

// ===================== BOOT =====================
document.addEventListener('DOMContentLoaded', () => {
  const game = new GameEngine();
  game.init();

  // Unlock audio on first interaction (browser policy)
  const unlockAudio = () => {
    game.audio._getCtx();
    document.removeEventListener('touchstart', unlockAudio);
    document.removeEventListener('click', unlockAudio);
  };
  document.addEventListener('touchstart', unlockAudio, { passive: true });
  document.addEventListener('click', unlockAudio);

  // Expose for debugging in dev
  if (typeof window !== 'undefined') {
    window._game = game;
  }
});
