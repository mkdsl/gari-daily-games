/**
 * effects.js — Status efekti na entitetima (igraču i neprijatelju).
 *
 * Podržani efekti:
 *   burn    — nanese damage entitetu po tick-u
 *   poison  — nanese damage entitetu po tick-u
 *   regen   — leči entitet po tick-u (ne prelazi maxHp)
 *   weak    — pasivni debuff: entitet nanosi -25% damage (čita ga combat.js)
 *
 * Svi efekti imaju { name, value, duration }.
 * duration se smanjuje za 1 po tick-u (tickEffects); 0 → uklanja se.
 * applyDoT nanosi efekt bez mijenjanja duration-a (samo čita).
 */

/**
 * @typedef {{ name: string, value: number, duration: number }} ActiveEffect
 * @typedef {{ hp: number, maxHp: number, effects: ActiveEffect[] }} Entity
 */

/**
 * Dodaje efekat entitetu. Ako efekat sa istim imenom već postoji,
 * zamijenjuje ga (uzima novi value i duration).
 * @param {Entity} entity
 * @param {string} name
 * @param {number} value
 * @param {number} duration
 */
export function addEffect(entity, name, value, duration) {
  const existing = entity.effects.find(e => e.name === name);
  if (existing) {
    existing.value = value;
    existing.duration = duration;
  } else {
    entity.effects.push({ name, value, duration });
  }
}

/**
 * Vraća trenutni value efekta ili 0 ako efekat ne postoji.
 * @param {Entity} entity
 * @param {string} name
 * @returns {number}
 */
export function getEffectValue(entity, name) {
  const eff = entity.effects.find(e => e.name === name);
  return eff ? eff.value : 0;
}

/**
 * Vraća trenutni duration efekta ili 0 ako efekat ne postoji.
 * @param {Entity} entity
 * @param {string} name
 * @returns {number}
 */
export function getEffectDuration(entity, name) {
  const eff = entity.effects.find(e => e.name === name);
  return eff ? eff.duration : 0;
}

/**
 * Primijeni jedan tick DoT/HoT efekta na entitet.
 * Ne mijenja duration — to radi tickEffects().
 * Podržani efekti:
 *   burn, poison  → entity.hp -= Math.floor(value)
 *   regen         → entity.hp = Math.min(entity.hp + Math.floor(value), entity.maxHp)
 * Ako entitet nema taj efekat — ne radi ništa.
 * @param {Entity} entity
 * @param {string} effectName
 */
export function applyDoT(entity, effectName) {
  const eff = entity.effects.find(e => e.name === effectName);
  if (!eff) return;

  switch (eff.name) {
    case 'burn':
    case 'poison':
      entity.hp = Math.max(0, entity.hp - Math.floor(eff.value));
      break;
    case 'regen':
      entity.hp = Math.min(entity.maxHp, entity.hp + Math.floor(eff.value));
      break;
    // 'weak' je pasivan — nema DoT
  }
}

/**
 * Smanji duration svakog efekta za 1 i ukloni one sa duration <= 0.
 * @param {Entity} entity
 */
export function tickEffects(entity) {
  entity.effects = entity.effects
    .map(e => ({ ...e, duration: e.duration - 1 }))
    .filter(e => e.duration > 0);
}

/**
 * Primeni sve end-of-turn efekte za dati entitet:
 *   - Za igrača ('player'): Regen tick, zatim tick trajanja svih efekata
 *   - Za neprijatelja ('enemy'): Burn + Poison tick, zatim tick trajanja
 * Shield se NE resetuje ovde — to radi combat.js.
 *
 * @param {import('../state.js').GameState} state
 * @param {'player' | 'enemy'} whose
 */
export function applyEndOfTurnEffects(state, whose) {
  const entity = whose === 'player' ? state.player : state.enemy;

  if (whose === 'player') {
    applyDoT(entity, 'regen');
    applyDoT(entity, 'burn');    // igrač može imati burn od bossa
    applyDoT(entity, 'poison');  // igrač može imati poison
  } else {
    applyDoT(entity, 'burn');
    applyDoT(entity, 'poison');
    applyDoT(entity, 'regen');   // neprijatelj generalno nema regen, ali podržavamo
  }

  tickEffects(entity);
}
