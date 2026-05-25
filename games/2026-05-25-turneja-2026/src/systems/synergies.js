// synergies.js — Synergy and contra-synergy calculation

import { SYNERGIES, CONTRA_SYNERGIES, makeSynergyKey } from '../config.js';

/**
 * Calculate all synergies and contra-synergies for a set of cards in a block
 * @param {Array} block_cards - array of card objects { role, id }
 * @returns {Object} { bonuses: [], penalties: [], total_multiplier: float, morale_bonus: float, fan_base_bonus: float, event_reduce: float, preboost: float }
 */
export function calculateSynergies(block_cards) {
  const roles = block_cards.map(c => c.role);
  const bonuses = [];
  const penalties = [];

  let fan_score_mult = 1.0;
  let media_mult = 1.0;
  let morale_bonus = 0;
  let fan_base_bonus = 0;
  let event_reduce = 0;
  let preboost = 0;

  // Check all pairs
  for (let i = 0; i < roles.length; i++) {
    for (let j = i + 1; j < roles.length; j++) {
      const key = makeSynergyKey(roles[i], roles[j]);

      // Positive synergy
      if (SYNERGIES[key]) {
        const syn = SYNERGIES[key];
        bonuses.push({ key, ...syn });

        switch (syn.category) {
          case 'fan_score':    fan_score_mult += syn.value; break;
          case 'media':        media_mult += syn.value; break;
          case 'morale':       morale_bonus += syn.value * 100; break; // convert from % to absolute
          case 'fan_base':     fan_base_bonus += syn.value; break;
          case 'event_reduce': event_reduce += syn.value; break;
          case 'fan_preboost': preboost += syn.value; break;
        }
      }

      // Contra-synergy
      if (CONTRA_SYNERGIES[key]) {
        const contra = CONTRA_SYNERGIES[key];
        penalties.push({ key, ...contra });

        switch (contra.category) {
          case 'fan_score': fan_score_mult += contra.value; break; // value is negative
          case 'media':     media_mult += contra.value; break;
        }
      }
    }
  }

  // Clamp multipliers to sensible ranges
  fan_score_mult = Math.max(0.1, fan_score_mult);
  media_mult = Math.max(0.1, media_mult);

  return {
    bonuses,
    penalties,
    fan_score_mult,
    media_mult,
    morale_bonus: Math.round(morale_bonus),
    fan_base_bonus,
    event_reduce,
    preboost,
    total_multiplier: fan_score_mult // primary multiplier alias
  };
}

/**
 * Get synergy highlights for a set of currently selected roles
 * Returns map of role -> 'synergy' | 'contra' | null
 */
export function getSynergyHighlights(selectedRoles) {
  const highlights = {};
  selectedRoles.forEach(r => highlights[r] = null);

  for (let i = 0; i < selectedRoles.length; i++) {
    for (let j = i + 1; j < selectedRoles.length; j++) {
      const key = makeSynergyKey(selectedRoles[i], selectedRoles[j]);
      if (SYNERGIES[key]) {
        highlights[selectedRoles[i]] = 'synergy';
        highlights[selectedRoles[j]] = 'synergy';
      }
      if (CONTRA_SYNERGIES[key]) {
        // Contra overrides synergy highlight
        highlights[selectedRoles[i]] = 'contra';
        highlights[selectedRoles[j]] = 'contra';
      }
    }
  }

  return highlights;
}

/**
 * Get a list of synergy descriptions for display
 */
export function getSynergyDescriptions(synResult) {
  const lines = [];
  synResult.bonuses.forEach(b => {
    lines.push({ type: 'bonus', text: `${b.key}: ${b.desc}` });
  });
  synResult.penalties.forEach(p => {
    lines.push({ type: 'penalty', text: `${p.key}: ${p.desc}` });
  });
  return lines;
}
