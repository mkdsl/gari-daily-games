/**
 * main.js — Avala Crew entry point, screen manager, game flow wire
 * Jova jQuery @ Gari Daily Games 2026-06-06
 */

import { createState, loadState, saveState, resetNightSession, getNightOutcome,
         addToNightHistory, updateCareerTier, isAbilitySpent, markAbilitySpent } from './state.js';
import { NIGHT_SCORE_CAP, PHASE_COMPLETION_BONUSES, CREW_INTEGRITY_BONUS, TICKETING_URL } from './config.js';
import { initInput, buildActionHandlers } from './input.js';
import { showScreen, initScreen, showToast, showModal, closeModal, showPrestigePrompt } from './ui.js';
import { initAudio, playAmbient, playCardSound, crossfadeTo } from './audio.js';
import { generateShareCard, shareCrewCard } from './share.js';
import { renderRosterScreen } from './rendering/roster_renderer.js';
import { renderScenarioScreen, showResolutionResult, showPhaseTransition } from './rendering/scenario_renderer.js';
import { renderOutroScreen } from './rendering/outro_renderer.js';
import { buildCrewFromState } from './entities/crewMember.js';
import { Scenario } from './entities/scenario.js';
import { resolveScenario, applyScoreGained } from './systems/resolution.js';
import { detectSynergies, getSynergyNightBonus, getPhaseEndBonus,
         getDepartureWinBonus, getAftermathDurationReduction } from './systems/synergy.js';
import { pushAftermath, tickAftermath, applyDurationReduction } from './systems/aftermath.js';
import { updateCrewXP, updateBonds, checkUnlocks, checkPrestige, applyPrestigeReset,
         checkAndGrantAchievements } from './systems/progression.js';
import { selectNightScenarios, generateNightSeed } from './systems/scenario_selector.js';
import { getScenarioById } from './content/scenarios_data.js';
import { getMemberById, CREW_DATA } from './content/crew_data.js';

// ── Game state singleton ──────────────────────────────────────
let state = loadState() ?? createState();

// ── Active crew objects (rebuilt each scenario) ──────────────
let _crew = [];

// ── Current scenario object ───────────────────────────────────
let _currentScenario = null;

// ── Pending choice selection ──────────────────────────────────
let _pendingChoiceKey = null;

// ── Audio initialized flag ────────────────────────────────────
let _audioInited = false;

// ── Save interval ─────────────────────────────────────────────
let _saveTimer = null;

/**
 * Application entry point
 */
function main() {
  // Show intro screen immediately
  renderIntroHTML();
  initScreen('intro');

  // Wire all input actions
  const handlers = buildActionHandlers({
    toggleMember,
    removeMember,
    changeRole,
    startNight,
    resolveScenario: resolveCurrentScenario,
    useAbility,
    selectChoice,
    nextNight,
    share: doShare,
    ctaClick: doCTAClick,
    startGame: onStartGame
  });
  initInput(handlers);

  // Auto-save every 10 seconds
  _saveTimer = setInterval(() => saveState(state), 10000);

  // Save on visibility change (tab switch)
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) saveState(state);
  });
}

// ── Screen rendering ──────────────────────────────────────────

function renderIntroHTML() {
  const screen = document.getElementById('screen-intro');
  if (screen) {
    screen.innerHTML = `
      <div class="intro-container">
        <div class="intro-logo">
          <div class="intro-logo-text">AVALA CREW</div>
          <div class="intro-logo-tagline">festival crew builder</div>
        </div>
        <div class="intro-description">
          Sastaviš ekipu od 5 ljudi za Avala festival noć.<br>
          Biraš ko ide, dodeliš uloge, i vodiš ekipu kroz 10 scenarija.<br>
          Sinergije, Aftermath efekti, i share karta na kraju.
        </div>
        <div class="intro-festival-badge">
          <span class="badge-date">🎉 20. jun 2026</span>
          <span class="badge-name">Kluboslavija na Avali</span>
        </div>
        <button class="btn-start btn-primary" data-action="start-game">
          ⚡ Sastavi ekipu!
        </button>
        ${state.completedNights > 0 ? `
          <div class="intro-continue">
            <span>Nastavi igru: ${state.completedNights} noći, ${state.crewXP} XP</span>
          </div>
        ` : ''}
        <div class="intro-credits">Gari Daily Games · 2026-06-06</div>
      </div>
    `;
  }
}

function onStartGame() {
  _initAudioOnce();
  showRoster();
}

function showRoster() {
  crossfadeTo('roster');
  renderRosterScreen(state, {
    onStartNight: startNight,
    onCardClick: toggleMember
  });
  showScreen('roster');
}

function showScenario() {
  const scenarioId = state.scenariosForNight[state.currentScenarioIndex];
  if (!scenarioId) {
    endNight();
    return;
  }

  _currentScenario = new Scenario(scenarioId);
  _crew = buildCrewFromState(state.activeCrew, state);

  // Rebuild active synergies
  const crewIds = state.activeCrew.map(c => c.memberId);
  const synergyObjects = detectSynergies(crewIds);
  state.activeSynergies = synergyObjects.map(s => s.synergyId);

  const phase = getPhaseForIndex(state.currentScenarioIndex);
  crossfadeTo(phase);

  renderScenarioScreen(_currentScenario, state, _crew, {
    onResolve: resolveCurrentScenario,
    onUseAbility: useAbility,
    onChoiceSelect: selectChoice
  });
  showScreen('scenario');
}

// ── Roster actions ────────────────────────────────────────────

/**
 * Toggle crew member selection
 * @param {string} memberId
 */
function toggleMember(memberId) {
  if (!memberId) return;
  _initAudioOnce();
  playCardSound('select');

  const idx = state.activeCrew.findIndex(c => c.memberId === memberId);

  if (idx !== -1) {
    // Deselect
    state.activeCrew.splice(idx, 1);
  } else {
    // Select (max 5)
    if (state.activeCrew.length >= 5) {
      showToast('Ekipa je popunjena! Ukloni nekoga prvo.', 'warning');
      return;
    }

    const member = getMemberById(memberId);
    if (!member) return;

    // Default to primary role
    const role = member.primaryRole || 'anchor';
    state.activeCrew.push({ memberId, role });

    // Check for synergy activation
    const crewIds = state.activeCrew.map(c => c.memberId);
    const synergies = detectSynergies(crewIds);
    if (synergies.length > 0) {
      const lastSyn = synergies[synergies.length - 1];
      playCardSound('synergy');
      showToast(`✨ Sinergija aktivirana: ${lastSyn.name}!`, 'win', 2000);
    }
  }

  // Re-render roster
  renderRosterScreen(state, { onStartNight: startNight, onCardClick: toggleMember });
  saveState(state);
}

/**
 * Remove a member from active crew
 * @param {string} memberId
 */
function removeMember(memberId) {
  state.activeCrew = state.activeCrew.filter(c => c.memberId !== memberId);
  renderRosterScreen(state, { onStartNight: startNight, onCardClick: toggleMember });
  saveState(state);
}

/**
 * Change a member's role
 * @param {string} memberId
 * @param {string} newRole
 */
function changeRole(memberId, newRole) {
  const slot = state.activeCrew.find(c => c.memberId === memberId);
  if (slot) {
    slot.role = newRole;
    const member = getMemberById(memberId);
    if (member && member.primaryRole === newRole) {
      showToast(`★ ${member.name} je u prirodnoj ulozi — +10% bonus!`, 'info', 1500);
    }
    renderRosterScreen(state, { onStartNight: startNight, onCardClick: toggleMember });
    saveState(state);
  }
}

// ── Night lifecycle ───────────────────────────────────────────

/**
 * Start a new night — selects scenarios, resets session state
 */
function startNight() {
  if (state.activeCrew.length < 5) {
    showToast('Treba 5 članova u ekipi!', 'warning');
    return;
  }

  _initAudioOnce();
  resetNightSession(state);

  // Generate seed and select scenarios
  const today = new Date().toISOString().slice(0, 10);
  state.currentNightSeed = generateNightSeed(today, state.careerTier, state.completedNights);

  const crewIds = state.activeCrew.map(c => c.memberId);
  state.scenariosForNight = selectNightScenarios(
    today,
    state.careerTier,
    state.completedNights,
    crewIds,
    state.bondLevels
  );
  state.currentScenarioIndex = 0;

  // Setup active synergies
  const synergyObjects = detectSynergies(crewIds);
  state.activeSynergies = synergyObjects.map(s => s.synergyId);

  if (synergyObjects.length > 0) {
    const names = synergyObjects.map(s => s.name).join(', ');
    showToast(`✨ Aktivne sinergije: ${names}`, 'info', 3000);
  }

  state.currentPhase = 'gathering';
  saveState(state);
  showScenario();
}

/**
 * Resolve current scenario
 */
function resolveCurrentScenario() {
  if (!_currentScenario || !_crew.length) return;

  const crewIds = state.activeCrew.map(c => c.memberId);
  const synergyObjects = detectSynergies(crewIds);
  const phase = getPhaseForIndex(state.currentScenarioIndex);

  // Build applied abilities map (abilities used this scenario via pre-resolution)
  const appliedAbilities = {};

  // Consume pre-set ability flags
  if (state.bojanAutoWin && _currentScenario && _currentScenario.type === 'P') {
    appliedAbilities['bojan'] = { forceOutcome: 'win' };
    state.bojanAutoWin = false;
  } else if (state.bojanAutoWin) {
    state.bojanAutoWin = false; // consumed on wrong type, silently
  }

  if (state.anaOverridePending && _currentScenario && _currentScenario.type === 'S') {
    appliedAbilities['ana'] = { overrideOutcome: 'partial' };
    state.anaOverridePending = false;
  } else if (state.anaOverridePending) {
    state.anaOverridePending = false;
  }

  const result = resolveScenario(
    _crew,
    _currentScenario,
    state.aftermathStack,
    appliedAbilities,
    synergyObjects,
    {
      currentPhase: phase,
      peakPhaseBonus: state.peakPhaseBonus || 0,
      aftermathFrozen: state.aftermathFrozenFor > 0,
      nightScore: state.nightScore
    }
  );

  // Apply passive score bonuses from crew
  let bonusScore = 0;
  for (const member of _crew) {
    if (member.passiveTrait && member.passiveTrait.trigger === 'scenario_resolve') {
      const pr = member.applyPassive(result.outcome, _currentScenario, phase, state);
      if (pr && pr.scoreBonus) bonusScore += pr.scoreBonus;
    }
  }
  result.scoreGained += bonusScore;

  // Synergy departure WIN bonus
  const depBonus = getDepartureWinBonus(synergyObjects, phase, result.outcome);
  result.scoreGained += depBonus;

  // Check Ana's passive for social scenarios (S type)
  const ana = _crew.find(m => m.id === 'ana');
  if (ana && _currentScenario.type === 'S' &&
      (result.outcome === 'win' || result.outcome === 'partial')) {
    result.scoreGained += 3;
  }

  // Check Ivana passive (WIN = +2)
  const ivana = _crew.find(m => m.id === 'ivana');
  if (ivana && result.outcome === 'win') {
    result.scoreGained += 2;
  }

  // Apply score to night total
  state.nightScore = applyScoreGained(state.nightScore, result.scoreGained);

  // Record result
  state.scenarioResults = state.scenarioResults || [];
  state.scenarioResults.push({
    scenarioId: _currentScenario.id,
    scenarioName: _currentScenario.name,
    scenarioType: _currentScenario.type,
    outcome: result.outcome,
    scoreGained: result.scoreGained,
    contributions: result.memberContributions
  });

  // Aftermath
  if (result.newAftermath && state.aftermathFrozenFor <= 0) {
    // Apply synergy duration reduction
    const durationReduction = getAftermathDurationReduction(synergyObjects);
    const aftermath = { ...result.newAftermath };
    if (aftermath.type === 'debuff' && durationReduction > 0) {
      aftermath.duration = Math.max(1, aftermath.duration - durationReduction);
    }
    pushAftermath(state.aftermathStack, aftermath);
  }

  // Tick aftermath
  tickAftermath(state.aftermathStack);

  // Tick frozen counter
  if (state.aftermathFrozenFor > 0) state.aftermathFrozenFor--;

  // Play SFX
  playCardSound(result.outcome === 'win' ? 'win' : result.outcome === 'partial' ? 'partial' : 'fail');

  // Show result overlay
  showResolutionResult(result, _currentScenario, () => {
    advanceScenario(result);
  });

  saveState(state);
}

/**
 * Advance to next scenario or next phase
 * @param {Object} result - Resolution result
 */
function advanceScenario(result) {
  const currentIndex = state.currentScenarioIndex;
  const nextIndex = currentIndex + 1;

  // Check phase transition
  const currentPhase = getPhaseForIndex(currentIndex);
  const nextPhase = nextIndex < 10 ? getPhaseForIndex(nextIndex) : 'outro';

  if (nextPhase !== currentPhase) {
    // Phase end bonuses
    let phaseBonus = PHASE_COMPLETION_BONUSES[currentPhase] || 0;

    // Pedja passive (phase end +5)
    const pedja = _crew.find(m => m.id === 'pedja');
    if (pedja) phaseBonus += 5;

    // Synergy phase end bonus (SYN05)
    const crewIds = state.activeCrew.map(c => c.memberId);
    const synergyObjects = detectSynergies(crewIds);
    phaseBonus += getPhaseEndBonus(synergyObjects, currentPhase);

    state.nightScore = Math.min(state.nightScore + phaseBonus, NIGHT_SCORE_CAP);

    if (nextPhase === 'outro') {
      endNight();
      return;
    }

    state.currentPhase = nextPhase;
    state.currentScenarioIndex = nextIndex;

    showPhaseTransition(nextPhase, phaseBonus, () => {
      showScenario();
    });
  } else {
    state.currentScenarioIndex = nextIndex;
    showScenario();
  }
}

/**
 * End night — calculate final score, update career, show outro
 */
function endNight() {
  // Crew integrity bonus
  const crewSize = state.activeCrew.length;
  if (crewSize === 5) state.nightScore += CREW_INTEGRITY_BONUS.all5;
  else if (crewSize >= 4) state.nightScore += CREW_INTEGRITY_BONUS.four;
  state.nightScore = Math.min(state.nightScore, NIGHT_SCORE_CAP);

  // Synergy activation bonus
  const crewIds = state.activeCrew.map(c => c.memberId);
  const synergyObjects = detectSynergies(crewIds);
  const synergyBonus = getSynergyNightBonus(synergyObjects);
  state.nightScore = Math.min(state.nightScore + synergyBonus, NIGHT_SCORE_CAP);

  // Determine outcome
  const nightOutcome = getNightOutcome(state.nightScore);

  // Update completed nights
  state.completedNights = (state.completedNights || 0) + 1;
  if (nightOutcome === 'legendary') {
    state.totalLegendaryNights = (state.totalLegendaryNights || 0) + 1;
    state.prestigeNightCount = (state.prestigeNightCount || 0) + 1;
  }

  // Add to history
  addToNightHistory(state, state.nightScore, nightOutcome, crewIds);
  updateCareerTier(state);

  // Update XP and bonds
  const { xpGained, newUnlocks: xpUnlocks } = updateCrewXP(state, nightOutcome);
  const { leveledBonds } = updateBonds(state, state.activeCrew);

  // Check achievements
  const newAchievements = checkAndGrantAchievements(state, nightOutcome, state.nightScore);

  // Check new unlocks
  const allNewUnlocks = checkUnlocks(state);

  // Merge unlocks
  const newUnlocks = [...new Set([...allNewUnlocks])];

  // Notify about XP
  if (xpGained > 0) {
    showToast(`+${xpGained} XP! Ukupno: ${state.crewXP}`, 'info', 2000);
  }

  // Notify about bonds
  if (leveledBonds.length > 0) {
    showToast(`💛 Bond nivo povećan!`, 'info', 2000);
  }

  // Check prestige
  const canPrestige = checkPrestige(state);
  if (canPrestige) {
    setTimeout(() => {
      showPrestigePrompt(
        state.prestigeLevel + 1,
        'Guncati Lokalni',
        () => {
          const { newPrestigeLevel, bonusUnlocked } = applyPrestigeReset(state);
          saveState(state);
          showToast(`⭐ Prestige ${newPrestigeLevel}! ${bonusUnlocked ? 'Otključan ' + bonusUnlocked : ''}`, 'unlock', 3000);
          showRoster();
        },
        () => {}
      );
    }, 1500);
  }

  state.currentPhase = 'outro';
  crossfadeTo('departure');
  saveState(state);

  // Render outro
  renderOutroScreen(state, nightOutcome, newUnlocks, {
    onShare: doShare,
    onCTA: doCTAClick,
    onNextNight: nextNight
  });
  showScreen('outro');
}

// ── Scenario actions ──────────────────────────────────────────

/**
 * Use a crew member's active ability
 * @param {string} memberId
 */
function useAbility(memberId) {
  if (!memberId || !_crew.length) return;

  if (isAbilitySpent(state, memberId)) {
    showToast('Sposobnost je već potrošena ove noći!', 'warning');
    return;
  }

  _initAudioOnce();
  playCardSound('ability');

  const member = _crew.find(m => m.id === memberId);
  if (!member) return;

  const memberData = getMemberById(memberId);
  if (!memberData || !memberData.activeAbility) return;

  // Execute ability
  let result;
  const ability = memberData.activeAbility;

  switch (memberId) {
    case 'maja':
      // +8 Night Score
      result = { scoreBonus: 8, message: 'Maja zapali atmosferu — +8 poena!' };
      state.nightScore = Math.min(state.nightScore + 8, NIGHT_SCORE_CAP);
      break;

    case 'dragan':
      // Remove first debuff
      if (state.aftermathStack.length > 0) {
        const debuffIdx = state.aftermathStack.findIndex(a => a.type === 'debuff');
        if (debuffIdx !== -1) {
          const removed = state.aftermathStack.splice(debuffIdx, 1)[0];
          result = { message: `Dragan ukida: "${removed.label}"` };
        } else {
          result = { message: 'Nema aktivnih debuffova.' };
        }
      } else {
        result = { message: 'Aftermath stack je prazan.' };
      }
      break;

    case 'ana':
      // Override next social fail → partial
      state.anaOverridePending = true;
      result = { message: 'Ana je spremna da spasi sledeću Social situaciju!' };
      break;

    case 'bojan':
      // Dance scenario auto-win (applied in resolveCurrentScenario)
      if (_currentScenario && _currentScenario.type === 'P') {
        state.bojanAutoWin = true;
        result = { message: 'Bojan ulazi u solo — Dance scenario = auto WIN!' };
      } else {
        result = { message: 'Radi samo na Dance (P) scenarijima.' };
      }
      break;

    case 'lena':
      // Skip logistics scenario
      if (_currentScenario) {
        state.nightScore = Math.min(state.nightScore + 5, NIGHT_SCORE_CAP);
        result = { message: 'Lena zna prečicu — scenario preskočen (+5 poena)!' };
        markAbilitySpent(state, memberId);
        saveState(state);
        showToast(result.message, 'win', 2000);
        // Advance past current scenario
        const fakeResult = { outcome: 'partial', scoreGained: 5, memberContributions: [], newAftermath: null, passiveBonuses: [], abilityBonuses: [], synergyBonuses: [] };
        advanceScenario(fakeResult);
        return;
      }
      break;

    case 'pedja':
      // Convert worst debuff to neutral
      const worstIdx = state.aftermathStack.findIndex(a => a.type === 'debuff');
      if (worstIdx !== -1) {
        state.aftermathStack[worstIdx].type = 'neutral';
        state.aftermathStack[worstIdx].magnitude = 0;
        state.aftermathStack[worstIdx].label = 'Zdravica (neutralizovano)';
        result = { message: 'Pedja diže čašu — debuff neutralizovan!' };
      } else {
        result = { message: 'Nema debuffova za neutralizovati.' };
      }
      break;

    case 'mirko':
      // Copy best stat from last scenario top contributor
      const lastResult = state.scenarioResults && state.scenarioResults[state.scenarioResults.length - 1];
      if (lastResult && lastResult.contributions && lastResult.contributions.length > 0) {
        const best = lastResult.contributions.reduce((a, b) => a.contribution > b.contribution ? a : b);
        state.mirkoBonus = { memberId: best.memberId, value: best.contribution * 0.5 };
        result = { message: `Mirko kopira bonus od ${best.memberId}: +${Math.round(best.contribution * 0.5 * 10) / 10}` };
      } else {
        result = { message: 'Nema prethodnih rezultata za kopirati.' };
      }
      break;

    case 'tanja':
      // Force next scenario to be P type
      state.forceNextScenarioType = 'P';
      result = { message: 'Tanja najavljuje drop — sledeći scenario je Dance (P)!' };
      break;

    case 'stefan':
      // Clear entire aftermath stack
      const count = state.aftermathStack.length;
      state.aftermathStack.splice(0, state.aftermathStack.length);
      result = { message: `Stefan aktivira protokol — ${count} aftermath-a uklonjeno!` };
      break;

    case 'ivana':
      // Share score multiplier
      state.shareScoreMultiplier = (state.shareScoreMultiplier || 1) * 1.2;
      result = { message: 'Ivana pravi priču — Share Score +20%!' };
      break;

    case 'guncati':
      // Pause aftermath for 2 scenarios
      state.aftermathFrozenFor = 2;
      result = { message: 'Guncati smiriva situaciju — aftermath zamrznuti 2 scenarija!' };
      break;

    case 'tonovic':
      // Peak phase bonus
      state.peakPhaseBonus = (state.peakPhaseBonus || 0) + 0.15;
      result = { message: 'Tonović pustio peak set — Vrh +15% za ostatak noći!' };
      break;

    default:
      result = { message: `${memberId}: sposobnost izvršena.` };
  }

  markAbilitySpent(state, memberId);
  saveState(state);

  if (result && result.message) {
    showToast(result.message, 'win', 2500);
  }

  // Re-render scenario screen with updated state
  if (_currentScenario && _crew.length) {
    renderScenarioScreen(_currentScenario, state, _crew, {
      onResolve: resolveCurrentScenario,
      onUseAbility: useAbility,
      onChoiceSelect: selectChoice
    });
  }
}

/**
 * Handle choice selection (scenarios with choices)
 * @param {string} choiceKey - 'a' or 'b'
 */
function selectChoice(choiceKey) {
  if (!_currentScenario || !_currentScenario.hasChoices) return;

  const choice = _currentScenario.choices[choiceKey];
  if (!choice) return;

  _pendingChoiceKey = choiceKey;

  // Apply stat bonuses/penalties to crew temp deltas
  for (const member of _crew) {
    for (const [stat, delta] of Object.entries(choice.statBonus || {})) {
      member.applyTempDelta(stat, delta);
    }
    for (const [stat, delta] of Object.entries(choice.statPenalty || {})) {
      member.applyTempDelta(stat, delta);
    }
  }

  showToast(`Izbor: "${choice.text}" primenjen!`, 'info', 1500);

  // Re-render without choice buttons (choice made)
  renderScenarioScreen(_currentScenario, state, _crew, {
    onResolve: resolveCurrentScenario,
    onUseAbility: useAbility,
    onChoiceSelect: null
  });
}

// ── Outro actions ─────────────────────────────────────────────

/**
 * Reset for next night
 */
function nextNight() {
  state.currentPhase = 'roster';
  state.scenariosForNight = [];
  state.currentScenarioIndex = 0;
  state.scenarioResults = [];
  state.nightScore = 0;
  state.aftermathStack = [];
  state.spentAbilities = {};
  state.activeSynergies = [];
  state.aftermathFrozenFor = 0;
  state.forceNextScenarioType = null;
  state.peakPhaseBonus = 0;
  state.shareScoreMultiplier = 1;

  saveState(state);
  showRoster();
}

/**
 * Generate and share crew card
 */
async function doShare() {
  const nightOutcome = getNightOutcome(state.nightScore);
  try {
    const dataUrl = await generateShareCard(
      state.activeCrew,
      state.nightScore,
      nightOutcome,
      state.completedNights
    );
    const shareResult = await shareCrewCard(dataUrl, state.nightScore, nightOutcome);
    if (shareResult.method !== 'aborted') {
      showToast('Podeljeno! 📤', 'win', 2000);
    }
  } catch (err) {
    console.error('[Share] Error:', err);
    showToast('Greška pri deljenju. Pokušaj ponovo.', 'warning');
  }
}

/**
 * CTA button click — Avala ticket link
 */
function doCTAClick() {
  window.open(TICKETING_URL, '_blank', 'noopener,noreferrer');
}

// ── Utilities ─────────────────────────────────────────────────

/**
 * Get phase name for scenario index (0-based)
 * @param {number} index
 * @returns {'gathering'|'peak'|'departure'}
 */
function getPhaseForIndex(index) {
  if (index < 3) return 'gathering';
  if (index < 7) return 'peak';
  return 'departure';
}

/**
 * Init audio on first user interaction
 */
function _initAudioOnce() {
  if (_audioInited) return;
  _audioInited = true;
  initAudio();
}

// ── Boot ──────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', main);
