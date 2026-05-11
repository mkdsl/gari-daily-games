// =============================================================================
// systems/cascade.js — Hard Fail check (Mile sekcija 7 + 11.6)
// =============================================================================
import { CASCADE } from '../config.js';
import { randomInt } from '../util.js';

export function checkCascadeThresholds(state) {
  const events = [];

  // Hard Fail 1: Health crash
  if (state.sacrifice.health <= CASCADE.health.hard_fail_threshold && !state.flags.hard_fail_health) {
    state.flags.hard_fail_health = true;
    state.forced_recovery_weeks = randomInt(
      CASCADE.health.hard_fail_recovery_weeks_min,
      CASCADE.health.hard_fail_recovery_weeks_max
    );
    state.stats.reputation = Math.max(0, state.stats.reputation - CASCADE.health.hard_fail_reputation_loss);
    events.push({ type: 'hard_fail_health', label: 'Hard Fail 1 — Health crash. Prinudni 4-6 nedelja recovery.' });
  }

  // Hard Fail 2: Bankrupt
  if (state.money < CASCADE.money.bankrupt_threshold
      && state.weeks_with_negative_balance >= CASCADE.money.bankrupt_weeks_required
      && !state.flags.hard_fail_bankrupt) {
    state.flags.hard_fail_bankrupt = true;
    state.flags.season_lost = true;
    events.push({ type: 'hard_fail_bankrupt', label: 'Hard Fail 2 — Bankrupt. Sezona izgubljena. Replay value.' });
  }

  // Identity crisis (Normalnost cascade)
  if (state.sacrifice.normalnost <= CASCADE.normalnost.identity_crisis_threshold
      && !state.flags.identity_crisis) {
    state.flags.identity_crisis = true;
    state.recognizability_decay_multiplier = CASCADE.normalnost.recog_decay_multiplier;
    events.push({ type: 'identity_crisis', label: 'Identity crisis. Recognizability decay 2x.' });
  }

  // Tragic Genius (sve tri = 0)
  if (state.sacrifice.health <= 0
      && state.sacrifice.odnosi <= 0
      && state.sacrifice.normalnost <= 0
      && !state.flags.tragic_genius) {
    state.flags.tragic_genius = true;
    state.flags.season_lost = true;
    events.push({ type: 'tragic_genius', label: 'Tragični Genije. Sezona izgubljena u eksplicit-osu.' });
  }

  return events;
}
