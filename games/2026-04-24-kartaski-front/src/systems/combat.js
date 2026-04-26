/**
 * combat.js — Logika borbe: primjena karata, potezi igrača i neprijatelja,
 * kraj borbe, i cleanup na kraju rundi.
 *
 * Pravila:
 *   - attack: damage = card.damage + state.nextAttackBonus; ako napadač ima 'weak' → ×0.75 (floor)
 *     Damage se prvo odbija od shielda, ostatak od HP.
 *     nextAttackBonus se resetira na 0 nakon napada.
 *   - block:  state.player.shield += card.shield
 *   - effect: heal (odmor) → leči igrača; next_attack_bonus → akumulira bonus;
 *             poison/burn/weak → dodaje efekat na target; regen → dodaje efekat na target
 *   - hits:2  (Dvojni Udar) → primijeni damage 2× zasebno
 *   - lifesteal (Vampirizam) → leči igrača za card.lifesteal (max maxHp)
 *   - shield se resetira na 0 na kraju igrač runde (endPlayerTurn)
 *   - enemy shield resetira u applyEnemyEndOfTurn
 *
 * @typedef {import('../config.js').CardDef} CardDef
 * @typedef {import('../state.js').GameState} GameState
 */

import { CONFIG } from '../config.js';
import { addEffect, applyDoT, tickEffects, getEffectValue, getEffectDuration } from './effects.js';

// ─── Interni helper-i ────────────────────────────────────────────────────────

/**
 * Primijeni damage na entitet, uvažavajući shield.
 * @param {{ hp: number, maxHp: number, shield: number }} target
 * @param {number} damage  — mora biti >= 0
 */
function dealDamage(target, damage) {
  const dmg = Math.max(0, Math.floor(damage));
  if (target.shield >= dmg) {
    target.shield -= dmg;
  } else {
    const leftover = dmg - target.shield;
    target.shield = 0;
    target.hp = Math.max(0, target.hp - leftover);
  }
}

// ─── Exports ─────────────────────────────────────────────────────────────────

/**
 * Primijeni kartu iz ruke na state.
 * Pretpostavlja da caller provjerava da igrač ima dovoljno energije.
 * @param {GameState} state
 * @param {CardDef} card
 */
export function applyCard(state, card) {
  // Troši energiju
  state.player.energy -= card.cost;

  // Statistika
  if (state.stats) {
    state.stats.totalCardsPlayed = (state.stats.totalCardsPlayed || 0) + 1;
  } else {
    state.cardsPlayedCount = (state.cardsPlayedCount || 0) + 1;
  }

  const hits = card.hits || 1;

  switch (card.type) {
    case 'attack': {
      // Weak debuff na napadača: napadač nanosi 25% manje
      const weakMult = getEffectDuration(state.player, 'weak') > 0
        ? 0.75
        : 1.0;

      // Dvojni Udar — svaki hit zasebno
      for (let h = 0; h < hits; h++) {
        // Bonus se primijenjuje samo na prvi hit
        const bonus = h === 0 ? (state.player.nextAttackBonus || 0) : 0;
        const rawDmg = ((card.damage || 0) + bonus) * weakMult;
        const finalDmg = Math.floor(rawDmg);
        dealDamage(state.enemy, finalDmg);

        // Statistika — podržava i stats sub-objekat i flat polja
        if (state.stats) {
          state.stats.totalDamageDealt = (state.stats.totalDamageDealt || 0) + finalDmg;
        } else {
          state.totalDamageDealt = (state.totalDamageDealt || 0) + finalDmg;
        }
      }

      // Resetiraj attack bonus
      state.player.nextAttackBonus = 0;

      // Vampirizam — lifesteal
      if (card.lifesteal) {
        state.player.hp = Math.min(
          state.player.maxHp,
          state.player.hp + card.lifesteal
        );
      }
      break;
    }

    case 'block': {
      state.player.shield += (card.shield || 0);
      break;
    }

    case 'effect': {
      _applyEffectCard(state, card);
      break;
    }
  }
}

/**
 * Interni handler za karte tipa 'effect'.
 * @param {GameState} state
 * @param {CardDef} card
 */
function _applyEffectCard(state, card) {
  const effect = card.effect || '';
  const value    = card.value    || 0;
  const duration = card.duration || 0;
  const target   = card.target   || 'enemy';

  switch (effect) {
    case 'heal':
      // Odmor — leči igrača direktno (nije DoT)
      state.player.hp = Math.min(state.player.maxHp, state.player.hp + value);
      break;

    case 'next_attack_bonus':
      // Taktika — akumulira bonus za sledeći napad
      state.player.nextAttackBonus = (state.player.nextAttackBonus || 0) + value;
      break;

    case 'poison':
    case 'burn':
    case 'weak':
    case 'regen': {
      const entityTarget = target === 'player' ? state.player : state.enemy;
      addEffect(entityTarget, effect, value, duration);
      break;
    }

    default:
      // Nepoznat efekat — gracefully ignoriše
      break;
  }
}

/**
 * Kraj igrač runde:
 *   1. Primijeni regen tick na igrača
 *   2. Resetiraj igrač shield na 0
 *   3. Tick efekti na igraču (smanji duration, ukloni expired)
 * Vraća state sa phase=RESOLVING — caller treba da postavi phase=ENEMY_TURN.
 * @param {GameState} state
 * @returns {GameState}
 */
export function endPlayerTurn(state) {
  // Regen tick za igrača
  applyDoT(state.player, 'regen');
  // Burn/poison tick za igrača (ako ima)
  applyDoT(state.player, 'burn');
  applyDoT(state.player, 'poison');

  // Shield igrača se resetira svaki put na kraju runde
  state.player.shield = 0;

  // Tick efekti (smanji duration)
  tickEffects(state.player);

  // Postavi fazu — caller prelazi na ENEMY_TURN
  state.phase = CONFIG.PHASES.RESOLVING;

  return state;
}

/**
 * Neprijatelj izvršava trenutni intent (intentPattern[intentIndex % len]).
 * Primijeni efekte na početku ENEMY_TURN-a (burn/poison/regen tick za neprijatelja).
 * Poslije akcije inkrementira intentIndex.
 * @param {GameState} state
 */
export function applyEnemyIntent(state) {
  const enemy = state.enemy;
  const def   = enemy.def || CONFIG.ENEMIES[enemy.id] || null;

  if (!def || !def.intentPattern || def.intentPattern.length === 0) return;

  // Primijeni DoT na neprijatelja na početku enemy turn-a
  applyDoT(enemy, 'burn');
  applyDoT(enemy, 'poison');
  applyDoT(enemy, 'regen');

  // Provjeri da li je borba već završila (burn/poison mogao ubiti)
  if (enemy.hp <= 0) {
    enemy.intentIndex = (enemy.intentIndex + 1) % def.intentPattern.length;
    return;
  }

  const pattern = def.intentPattern;
  const intent  = pattern[enemy.intentIndex % pattern.length];

  switch (intent.type) {
    case 'attack': {
      // Weak debuff na neprijatelju: 25% manje damage
      const weakMult = getEffectDuration(enemy, 'weak') > 0 ? 0.75 : 1.0;
      const dmg = Math.floor((intent.value || 0) * weakMult);
      dealDamage(state.player, dmg);

      // Ako napad dolazi sa efekatom (npr. Boss burn napad)
      if (intent.effectName) {
        const targetEntity = (intent.target === 'player') ? state.player : state.enemy;
        addEffect(
          targetEntity,
          intent.effectName,
          intent.effectValue || 0,
          intent.effectDuration || 1
        );
      }
      break;
    }

    case 'block': {
      enemy.shield += (intent.value || 0);
      break;
    }

    case 'buff': {
      // Buff intent — Čuvar primijeni weak na igrača
      const targetEntity = (intent.target === 'player') ? state.player : state.enemy;
      addEffect(
        targetEntity,
        intent.effectName || '',
        intent.effectValue || 0,
        intent.duration || 1
      );
      break;
    }
  }

  // Inkrementiraj intentIndex
  enemy.intentIndex = (enemy.intentIndex + 1) % pattern.length;
}

/**
 * Provjeri kraj borbe.
 * @param {GameState} state
 * @returns {'player_dead' | 'enemy_dead' | null}
 */
export function checkCombatEnd(state) {
  if (state.player.hp <= 0) return 'player_dead';
  if (state.enemy.hp  <= 0) return 'enemy_dead';
  return null;
}

/**
 * Kraj enemy runde:
 *   1. Burn/poison tick za neprijatelja (ako je primio efekat nakon intent-a)
 *   2. Resetiraj enemy shield na 0
 *   3. Tick efekti na neprijatelju (smanji duration, ukloni expired)
 * @param {GameState} state
 */
export function applyEnemyEndOfTurn(state) {
  // Burn/poison tick za neprijatelja (drugi tick nije potreban — applyEnemyIntent
  // već ticka na početku ENEMY_TURN-a. Ovdje se samo resetira shield i tikaju efekti)
  state.enemy.shield = 0;
  tickEffects(state.enemy);
}
