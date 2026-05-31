/**
 * @file main.js
 * Game Orchestrator — Ekipa Noći
 * Uvezuje sve module u playabilan game loop.
 */

import {
  getState,
  setState,
  loadFromStorage,
  loadMeta,
  saveToStorage,
  saveMeta,
  selectCardForRole,
  advanceDraftRole,
  resetState,
} from './state.js';

import { ROLES, ROLE_LABELS } from './config.js';

import { initInput, teardownInput } from './input.js';
import { updateSelectedCard, clearHand } from './render.js';
import { initUI, updateHUD, showPhase, showMessage, showStinger } from './ui.js';
import {
  initAudio,
  playLobbyBeat,
  stopLobbyBeat,
  playCardWhoosh,
  playCardSelect,
  playEventSuccess,
  playEventKiks,
  playTourEnd,
} from './audio.js';

import { drawHand } from './systems/deck.js';
import { calcEventScore } from './systems/scoring.js';
import { resolveEvent } from './systems/progression.js';
import { calcTourScore, finalizeTour } from './systems/tour.js';
import { getLoyalCardIds } from './systems/crew.js';
import { generateFinalePreferredTags } from './systems/grand_finale.js';

import { renderDraftPhase, clearDraftPhase } from './ui/phase_display.js';
import { renderEventResult } from './ui/event_result.js';
import { renderTourEnd } from './ui/tour_end.js';
import { openCodex, closeCodex } from './ui/codex.js';

import { getCardsByRole } from './content/cards_data.js';
import { getEventByIndex } from './content/events_data.js';

import { shareTourCard } from './share.js';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Ceka custom DOM event — koristi se da bridguje user input sa async flowom.
 * Timeout od 5 minuta tiho nastavlja (ne baci grešku) — bezbednost bez frustriranja aktivnog igrača.
 * @param {string} eventName
 * @param {number} [timeoutMs=300_000]
 * @returns {Promise<void>}
 */
function waitForEvent(eventName, timeoutMs = 300_000) {
  return new Promise((resolve, reject) => {
    const ac = new AbortController();
    document.addEventListener(eventName, () => { ac.abort(); resolve(); }, { once: true, signal: ac.signal });
    setTimeout(() => { ac.abort(); resolve(); /* tiho nastavi */ }, timeoutMs);
  });
}

/**
 * Promisified setTimeout.
 * @param {number} ms
 * @returns {Promise<void>}
 */
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Wraps showStinger (callback-based) u Promise.
 * @param {string} variant
 * @returns {Promise<void>}
 */
function stingerAsync(variant) {
  return new Promise(resolve => {
    showStinger(variant, resolve);
  });
}

/**
 * Gradi HUD state objekat iz game state-a.
 * @param {import('./state.js').GameState} state
 * @param {import('./content/events_data.js').EventData} eventData
 * @returns {Object}
 */
function buildHUDState(state, eventData) {
  const roleIndex = state.draft.current_role_index;
  const activeRoleName = ROLE_LABELS[ROLES[roleIndex]] || ROLES[roleIndex];
  const completedRoles = ROLES.slice(0, roleIndex).map(r => ROLE_LABELS[r] || r);

  return {
    eventName: eventData ? eventData.name : 'Ekipa Noći',
    eventIndex: state.current_event_index,
    totalEvents: 5,
    budget: state.available_budget,
    maxBudget: eventData ? eventData.base_budget : 60,
    cumulativeXP: state.cumulative_xp,
    activeRole: activeRoleName,
    completedRoles,
  };
}

/**
 * Gradi listu svih karata za Codex.
 * @returns {import('./entities/card.js').Card[]}
 */
function getAllCards() {
  return ROLES.flatMap(role => getCardsByRole(role));
}

// ---------------------------------------------------------------------------
// Draft Phase
// ---------------------------------------------------------------------------

/**
 * Vodi igrača kroz 5 draft rola za jedan event.
 * @param {number} eventIndex  0-based
 */
async function runDraftPhase(eventIndex) {
  const eventData = getEventByIndex(eventIndex);
  if (!eventData) {
    console.error(`runDraftPhase: nema eventa za index ${eventIndex}`);
    return;
  }

  // Grand Finale — generiši preferred tags unapred ako ih nema
  if (eventIndex === 4) {
    const state = getState();
    if (!state.finale_preferred_tags) {
      const tags = generateFinalePreferredTags(state);
      setState({ finale_preferred_tags: tags });
    }
  }

  showPhase('draft');

  // Loop kroz 5 rola
  for (let roleIdx = 0; roleIdx < ROLES.length; roleIdx++) {
    const role = ROLES[roleIdx];
    const state = getState();
    const roleName = ROLE_LABELS[role] || role;

    // Postavi current_role_index u slucaju da ne prati
    if (state.draft.current_role_index !== roleIdx) {
      setState({
        draft: { ...getState().draft, current_role_index: roleIdx, hand: [] }
      });
    }

    // Izvuci ruku
    const tier3Unlocked = !!(getState()._tier3_unlocked);
    const hand = drawHand(role, getState(), { tier3Unlocked });

    // Sacuvaj hand u state
    setState({ draft: { ...getState().draft, hand } });

    // Azuriraj HUD
    updateHUD(buildHUDState(getState(), eventData));

    // Renderuj draft screen za ovu rolu
    const draftState = {
      activeRole: roleName,
      hand,
      eventName: eventData.name,
      eventIndex,
      totalEvents: 5,
      selectedCardId: null,
    };

    renderDraftPhase(
      draftState,
      (cardId) => {
        // onCardSelected — selektuj kartu u state
        selectCardForRole(role, hand.find(c => String(c.id) === String(cardId)) || null);
        updateSelectedCard(document.getElementById('card-hand'), cardId);
        playCardWhoosh();
      },
      () => {
        // onConfirm iz phase_display — dispatchujemo game event
        document.dispatchEvent(new Event('game:confirm'));
      }
    );

    // Cekaj potvrdu
    await waitForEvent('game:confirm');

    // Verifikuj da je karta odabrana
    const selectedCard = getState().draft.selected[role];
    if (!selectedCard) {
      // Fallback: odaberi prvu u ruci
      selectCardForRole(role, hand[0]);
      showMessage('Automatski odabrana prva karta.', 'info');
    }

    playCardSelect();

    // Oduzmi budzet za odabranu kartu
    const picked = getState().draft.selected[role];
    if (picked) {
      const newBudget = Math.max(0, getState().available_budget - (picked.cost || 0));
      setState({ available_budget: newBudget });
    }

    // Naprednij rolu (osim posle poslednje)
    if (roleIdx < ROLES.length - 1) {
      advanceDraftRole();
    }

    updateHUD(buildHUDState(getState(), eventData));
    clearDraftPhase();
  }

  // Svi rolovi popunjeni — idi na resolve
  await runEventResolve(eventIndex);
}

// ---------------------------------------------------------------------------
// Event Resolve
// ---------------------------------------------------------------------------

/**
 * Racuna score, prikazuje stinger, renderuje rezultat.
 * @param {number} eventIndex
 */
async function runEventResolve(eventIndex) {
  const state = getState();
  const eventData = getEventByIndex(eventIndex);
  if (!eventData) return;

  // Izgradi team iz draft.selected
  const selected = state.draft.selected;
  const team = ROLES.map(role => selected[role]).filter(Boolean);

  if (team.length !== 5) {
    console.warn('runEventResolve: nepotpun tim', team);
  }

  // Odrediti preferred_tags
  let preferredTags = eventData.preferred_tags || [];
  if (eventIndex === 4 && state.finale_preferred_tags) {
    preferredTags = state.finale_preferred_tags;
  }

  // Izracunaj score
  const scoreBreakdown = calcEventScore({
    team,
    eventData,
    state,
    preferred_tags: preferredTags,
  });

  const eventScore = scoreBreakdown.event_score;
  const bracketLabel = scoreBreakdown.bracket_label;

  // Stop lobby beat
  stopLobbyBeat();

  // Stinger animacija
  const stingerVariant = eventScore >= 61 ? 'success' : 'fail';
  await stingerAsync(stingerVariant);

  // Audio feedback
  if (eventScore >= 61) {
    playEventSuccess(eventScore);
  } else {
    playEventKiks();
  }

  // Progression: XP, budget bonus, crew update
  const progressionResult = resolveEvent(scoreBreakdown, selected);

  // Mapiraj crew update na format koji renderEventResult ocekuje
  const crewUpdate = progressionResult.crew_update;
  const crewChanges = {
    staying: (crewUpdate.retained_ids || []).map(id => {
      const card = ROLES.map(r => selected[r]).find(c => c && c.id === id);
      return card || { id, name: id, role: '' };
    }),
    leaving: (crewUpdate.departed_ids || []).map(id => {
      const card = ROLES.map(r => selected[r]).find(c => c && c.id === id);
      return card || { id, name: id, role: '' };
    }),
  };

  // Mapiraj EventResult za renderEventResult
  const eventResult = {
    event_name: eventData.name,
    base_total: scoreBreakdown.base_total,
    synergy_total: scoreBreakdown.synergy_total,
    conflict_total: scoreBreakdown.conflict_total,
    audience_match: scoreBreakdown.audience_match_bonus,
    event_score: eventScore,
    xp_earned: progressionResult.xp_earned,
    budget_bonus: progressionResult.budget_bonus,
    synergy_log: scoreBreakdown.synergy_report?.active_effects?.map(e => e.flavor || e.description || '') || [],
  };

  showPhase('resolve');
  renderEventResult(eventResult, crewChanges, () => runCrewUpdate(eventIndex, crewChanges));
}

// ---------------------------------------------------------------------------
// Crew Update
// ---------------------------------------------------------------------------

/**
 * Prikaz ekrana za crew update, zatim prelaz na sledeci event ili tour end.
 * @param {number} eventIndex
 * @param {{ staying: Object[], leaving: Object[] }} crewChanges  Card objekti za ovaj event
 */
async function runCrewUpdate(eventIndex, crewChanges) {
  showPhase('crew_update');

  // Popuni crew update screen
  const stayingEl = document.getElementById('crew-staying');
  const leavingEl = document.getElementById('crew-leaving');

  if (stayingEl) {
    stayingEl.innerHTML = '';
    (crewChanges.staying || []).forEach(card => {
      const div = document.createElement('div');
      div.classList.add('crew-member', 'crew-member--staying');
      div.textContent = `${card.name} (${ROLE_LABELS[card.role] || card.role})`;
      stayingEl.appendChild(div);
    });
  }

  if (leavingEl) {
    leavingEl.innerHTML = '';
    (crewChanges.leaving || []).forEach(card => {
      const div = document.createElement('div');
      div.classList.add('crew-member', 'crew-member--leaving');
      div.textContent = `${card.name} (${ROLE_LABELS[card.role] || card.role})`;
      leavingEl.appendChild(div);
    });
  }

  // Animacija 2s
  await delay(2000);

  if (eventIndex < 4) {
    // Sledeci event
    playLobbyBeat();
    await runDraftPhase(eventIndex + 1);
  } else {
    // Tour end
    await runTourEnd();
  }
}

// ---------------------------------------------------------------------------
// Tour End
// ---------------------------------------------------------------------------

/**
 * Finalizuj turneju i prikazi tour end screen.
 */
async function runTourEnd() {
  stopLobbyBeat();

  const tourResult = calcTourScore();
  finalizeTour();

  // finalizeTour poziva finalizeRun interno sto cuva meta i cuva state
  saveToStorage();
  saveMeta({
    runs_completed: getState().runs_completed,
    best_tour_score: getState().best_tour_score,
  });

  playTourEnd(tourResult.tour_score);

  // Loyalty bonuses mapa
  const loyalIds = getLoyalCardIds();
  const loyaltyBonuses = {};
  loyalIds.forEach(id => { loyaltyBonuses[id] = 2; }); // 2 XP prikazan bonus per loyal

  // Final crew — retained cards mapped to card objects (best effort)
  const state = getState();
  const finalCrewIds = state.crew.retained || [];
  const allCards = getAllCards();
  const finalCrew = finalCrewIds
    .map(id => allCards.find(c => c.id === id))
    .filter(Boolean);

  // Event names
  const eventNames = [];
  for (let i = 0; i < 5; i++) {
    const ev = getEventByIndex(i);
    eventNames.push(ev ? ev.name : `Event ${i + 1}`);
  }

  const tourData = {
    event_scores: tourResult.event_scores,
    event_names: eventNames,
    tour_score: tourResult.tour_score,
    tour_rank: tourResult.grade,
    final_crew: finalCrew,
    loyalty_bonuses: loyaltyBonuses,
  };

  showPhase('tour_end');
  renderTourEnd(
    tourData,
    () => shareTourCard(tourData),
    () => handlePlayAgain()
  );
}

// ---------------------------------------------------------------------------
// Play Again
// ---------------------------------------------------------------------------

function handlePlayAgain() {
  teardownInput();
  resetState();
  startGame();
}

// ---------------------------------------------------------------------------
// startGame
// ---------------------------------------------------------------------------

/**
 * Zapocinje novu igru od pocetka.
 */
async function startGame() {
  loadFromStorage();
  loadMeta();

  // Reset na cist draft state
  const meta = loadMeta();
  setState({
    phase: 'draft',
    current_event_index: 0,
    draft: {
      current_role_index: 0,
      hand: [],
      selected: Object.fromEntries(ROLES.map(r => [r, null])),
    },
  });

  // Grand Finale tags — generiraj unapred ali ne otkrivaj
  const state = getState();
  if (!state.finale_preferred_tags) {
    const tags = generateFinalePreferredTags(state);
    setState({ finale_preferred_tags: tags });
  }

  // Azuriraj meta prikaz na intro screenu
  const metaEl = document.getElementById('meta-runs');
  if (metaEl) {
    const bestDisplay = meta.best_tour_score > 0 ? meta.best_tour_score : '—';
    metaEl.textContent = `Prethodnih rundi: ${meta.runs_completed} | Rekord: ${bestDisplay}`;
  }

  playLobbyBeat();
  await runDraftPhase(0);
}

// ---------------------------------------------------------------------------
// Input init
// ---------------------------------------------------------------------------

function initInputCallbacks() {
  initInput({
    onCardSelect: (cardId) => {
      const state = getState();
      const roleIdx = state.draft.current_role_index;
      const role = ROLES[roleIdx];
      const hand = state.draft.hand;
      const card = hand.find(c => String(c.id) === String(cardId));
      if (card) {
        selectCardForRole(role, card);
      }
      const handEl = document.getElementById('card-hand');
      if (handEl) updateSelectedCard(handEl, cardId);
      playCardWhoosh();
    },

    onConfirm: () => {
      document.dispatchEvent(new Event('game:confirm'));
    },

    onCodexOpen: () => {
      const state = getState();
      const allCards = getAllCards();
      openCodex(allCards, state.unlocked_card_ids || [], state.cumulative_xp || 0);
    },

    onCodexClose: () => {
      closeCodex();
    },

    onPlayAgain: () => {
      handlePlayAgain();
    },
  });
}

// ---------------------------------------------------------------------------
// Bootstrap
// ---------------------------------------------------------------------------

document.addEventListener('DOMContentLoaded', () => {
  // Ucitaj state i meta iz localStorage
  loadFromStorage();
  const meta = loadMeta();

  // Inicijalizuj UI — proslijedi state callback za Codex dugme u HUD-u
  initUI(() => {
    const state = getState();
    return {
      allCards: getAllCards(),
      unlockedCardIds: state.unlocked_card_ids || [],
      cumulativeXP: state.cumulative_xp || 0,
    };
  });

  // Inicijalizuj input
  initInputCallbacks();

  // Prikazi intro screen
  showPhase('intro');

  // Prikazi meta info na intro screenu
  const metaEl = document.getElementById('meta-runs');
  if (metaEl) {
    const bestDisplay = meta.best_tour_score > 0 ? meta.best_tour_score : '—';
    metaEl.textContent = `Prethodnih rundi: ${meta.runs_completed} | Rekord: ${bestDisplay}`;
  }

  // Start button
  const btnStart = document.getElementById('btn-start');
  if (btnStart) {
    btnStart.addEventListener('click', () => {
      initAudio();
      startGame();
    }, { once: true });
  }
});
