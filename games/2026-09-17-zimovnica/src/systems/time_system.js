/**
 * time_system.js — Day advancement, action slot deduction, passive timer tick.
 * Centralna tačka za sve promene state-a.
 */

import {
  SLOTS_PER_DAY, GAME_DAYS, BARREL_WINDOW_DAYS,
  YIELD, SLOT_COST, SHELF_UPGRADES, FERMENTATION_DAYS, DRYING_DAYS,
  RAKIJA_UNLOCK_DAY, RAKIJA_LEGAL_CAP_L, JAR_PRICES
} from '../config.js';
import { applyDecay } from '../entities/ingredient.js';
import { createBatchJob } from '../entities/batchjob.js';
import { createJar } from '../entities/jar.js';
import { addLog, resolvePassiveJobs } from '../state.js';
import { generateWeather } from './weather.js';
import { drawDailyEvents, resolveEvent } from './event_engine.js';
import { tickBacva, initBacva } from './barrel_init.js';
import { checkProgressionUnlocks } from './progression.js';
import { checkEnding } from './prestige.js';
import { generateHarvest, mergeHarvest } from './rng_harvest.js';
import { sellJars, buyIngredient } from './trade.js';
import { getCapacity } from './capacity.js';

/**
 * Prelazi na sledeći dan. Tikuje sve sisteme.
 * @param {object} state
 * @param {object} persistent
 * @returns {{ state: object, persistent: object }}
 */
export function advanceDay(state, persistent) {
  if (state.game_over || state.day >= GAME_DAYS) {
    return endGame(state, persistent);
  }

  let s = { ...state };

  // 1. Tikuj bačvu
  s = tickBacva(s);

  // 2. Passive jobs — završeni poslovi daju tegle
  s = resolvePassiveJobs(s);

  // 3. Decay sirovine
  const { sirovine: decayed_sirovine, decayed } = applyDecay(s.sirovine, s.today_weather);
  s = { ...s, sirovine: decayed_sirovine };

  // Log decay
  for (const [id, loss] of Object.entries(decayed)) {
    if (loss >= 1) {
      s = addLog(s, `⚠️ ${id}: -${loss.toFixed(1)} kg propalo`, 'warn');
    }
  }

  // 4. Pređi na sledeći dan
  s = { ...s, day: s.day + 1, slots: SLOTS_PER_DAY, harvest_done_today: false };

  // 5. Vreme za novi dan
  const { today, tomorrow } = generateWeather(s.tomorrow_weather);
  s = { ...s, today_weather: today, tomorrow_weather: tomorrow };

  // 6. Unlock check
  s = checkProgressionUnlocks(s);

  // 7. Generiši dnevne događaje
  const events = drawDailyEvents(s);
  s = { ...s, today_events: events };

  // 8. Bačva critical window check
  if (s.day <= BARREL_WINDOW_DAYS && s.bačva_status === 'unsalted') {
    s = { ...s, bačva_status: 'critical_window' };
    s = addLog(s, '🪣 Prozor za bačvu još otvoren!', 'warn');
  } else if (s.day > BARREL_WINDOW_DAYS + 1 && s.bačva_status === 'unsalted') {
    s = { ...s, bačva_status: 'failed' };
    s = addLog(s, '💀 Bačva — inicijacioni prozor propušten!', 'error');
  }

  // 9. Zadnji dan?
  if (s.day > GAME_DAYS) {
    return endGame(s, persistent);
  }

  return { state: s, persistent };
}

/**
 * Procesira jednu akciju igrača (kuvanje, berba, prodaja...).
 * @param {object} state
 * @param {object} persistent
 * @param {string} actionType
 * @param {object} params
 * @returns {{ state: object, persistent?: object } | null}
 */
export function processAction(state, persistent, actionType, params) {
  // event_choice does not consume slots — bypass slot guard
  if (actionType !== 'event_choice' && state.slots <= 0) return null;

  switch (actionType) {
    // Legacy names
    case 'berba':         return actionBerba(state, persistent, params);
    case 'kuvanje':       return actionKuvanje(state, persistent, params);
    case 'bacva_init':    return actionBacvaInit(state, persistent, params);
    case 'prodaja':       return actionProdaja(state, persistent, params);
    case 'kupovina':      return actionKupovina(state, persistent, params);
    case 'shelf_upgrade': return actionShelfUpgrade(state, persistent, params);
    // New action names from brief
    case 'peci_paprike':     return actionPeciPaprike(state, persistent, params);
    case 'toci_ajvar':       return actionTociAjvar(state, persistent, params);
    case 'pravi_sos':        return actionPraviSos(state, persistent, params);
    case 'pravi_pelat':      return actionPraviPelat(state, persistent, params);
    case 'susi_voce':        return actionSusiVoce(state, persistent, params);
    case 'pravi_dzem':       return actionPraviDzem(state, persistent, params);
    case 'utisni_kupus':     return actionUtisniKupus(state, persistent, params);
    case 'pokupuj_tursiju':  return actionPokupujTursiju(state, persistent, params);
    case 'pravi_pekmez':     return actionPraviPekmez(state, persistent, params);
    case 'destilisi_rakiju': return actionDestilisiRakiju(state, persistent, params);
    case 'prodaj':           return actionProdaj(state, persistent, params);
    case 'kupi_policu':      return actionKupiPolicu(state, persistent, params);
    case 'event_choice':     return actionEventChoice(state, persistent, params);
    default:          return null;
  }
}

/** Berba — harvest sirovine */
function actionBerba(state, persistent, params) {
  if (state.harvest_done_today) {
    return { state: addLog(state, '⚠️ Berba već obavljena danas.', 'warn'), persistent };
  }
  const cost = SLOT_COST.berba || 1;
  if (state.slots < cost) return null;

  const harvest = generateHarvest(state.day, state.today_weather, state.prestige_bonuses);
  const newSirovine = mergeHarvest(state.sirovine, harvest);
  const gained_list = Object.entries(harvest).map(([k, v]) => `${k}: +${v} kg`).join(', ');

  let s = { ...state, sirovine: newSirovine, slots: state.slots - cost, harvest_done_today: true };
  s = addLog(s, `🌿 Berba: ${gained_list}`, 'success');
  return { state: s, persistent };
}

/** Kuvanje — legacy dispatcher, uzima params.recipe za tip */
function actionKuvanje(state, persistent, params) {
  const recipe = params?.recipe || '';
  switch (recipe) {
    case 'ajvar':       return actionTociAjvar(state, persistent, params);
    case 'sos':         return actionPraviSos(state, persistent, params);
    case 'pelat':       return actionPraviPelat(state, persistent, params);
    case 'dzem':        return actionPraviDzem(state, persistent, params);
    case 'pekmez':      return actionPraviPekmez(state, persistent, params);
    case 'tursija':     return actionPokupujTursiju(state, persistent, params);
    case 'suseno':      return actionSusiVoce(state, persistent, params);
    case 'rakija':      return actionDestilisiRakiju(state, persistent, params);
    default:            return { state, persistent };
  }
}

/** initBacva — starts barrel fermentation */
function actionBacvaInit(state, persistent, params) {
  const kg = params?.kg || params?.kupus_kg || state.sirovine.kupus;
  const { state: s, error } = initBacva(state, kg);
  if (error) return { state: addLog(state, `⚠️ ${error}`, 'warn'), persistent };
  return { state: s, persistent };
}

/** Prodaja — legacy sell, dispatches to sellJars */
function actionProdaja(state, persistent, params) {
  const type = params?.type || params?.jarType;
  const qty = params?.qty || 1;
  if (!type) return { state, persistent };
  const { state: s, error } = sellJars(state, type, qty);
  if (error) return { state: addLog(state, `⚠️ ${error}`, 'warn'), persistent };
  return { state: s, persistent };
}

/** Kupovina — legacy buy, dispatches to buyIngredient */
function actionKupovina(state, persistent, params) {
  const id = params?.ingredientId || params?.id;
  const kg = params?.kg || 1;
  if (!id) return { state, persistent };
  const { state: s, error } = buyIngredient(state, id, kg);
  if (error) return { state: addLog(state, `⚠️ ${error}`, 'warn'), persistent };
  return { state: s, persistent };
}

/** shelf_upgrade — legacy shelf upgrade handler */
function actionShelfUpgrade(state, persistent, params) {
  return actionKupiPolicu(state, persistent, params);
}

// ─── New action handlers (task brief names) ───────────────────────────────

/** Peči paprike — priprema pečene paprike za ajvar (1:1, -1 slot) */
function actionPeciPaprike(state, persistent, params) {
  const cost = 1;
  if (state.slots < cost) return null;
  const kg = params?.kg || 0;
  if (kg <= 0) return { state: addLog(state, '⚠️ Unesi količinu paprika.', 'warn'), persistent };
  if ((state.sirovine.paprike || 0) < kg) {
    return { state: addLog(state, `⚠️ Nema dovoljno paprika (ima ${(state.sirovine.paprike || 0).toFixed(1)} kg).`, 'warn'), persistent };
  }
  const newSirovine = { ...state.sirovine, paprike: state.sirovine.paprike - kg,
    pečene_paprike: (state.sirovine.pečene_paprike || 0) + kg };
  let s = { ...state, sirovine: newSirovine, slots: state.slots - cost };
  s = addLog(s, `🔥 Pečeno ${kg} kg paprika.`, 'info');
  return { state: s, persistent };
}

/** Toči ajvar — od pečenih paprika (ili svežih ako nema pečenih), -2 slota */
function actionTociAjvar(state, persistent, params) {
  const cost = 2;
  if (state.slots < cost) return null;
  const kg = params?.kg || 0;
  if (kg <= 0) return { state: addLog(state, '⚠️ Unesi količinu za ajvar.', 'warn'), persistent };

  // Prefer pečene_paprike, fallback to paprike
  const hasPecene = (state.sirovine.pečene_paprike || 0) >= kg;
  const hasFresh = (state.sirovine.paprike || 0) >= kg;
  if (!hasPecene && !hasFresh) {
    return { state: addLog(state, '⚠️ Nema dovoljno paprika za ajvar.', 'warn'), persistent };
  }

  const efficiency = state.prestige_bonuses?.recipe_efficiency || 1.0;
  const output = Math.floor(kg * YIELD.ajvar * efficiency);
  const cap = getCapacity(state);
  const used = state.tegle.reduce((s, j) => s + j.qty, 0);
  if (used + output > cap) {
    return { state: addLog(state, `⚠️ Nema mesta na policama (slobodno: ${(cap - used).toFixed(1)} kg).`, 'warn'), persistent };
  }

  const newSirovine = { ...state.sirovine };
  if (hasPecene) {
    newSirovine.pečene_paprike = (newSirovine.pečene_paprike || 0) - kg;
  } else {
    newSirovine.paprike = newSirovine.paprike - kg;
  }

  const jar = createJar('ajvar', output, state.day);
  let s = { ...state, sirovine: newSirovine, tegle: [...state.tegle, jar], slots: state.slots - cost };
  s = addLog(s, `🫙 Ajvar: ${kg} kg → ${output} kg tegli.`, 'success');
  return { state: s, persistent };
}

/** Pravi sos od paradajza — -1 slot */
function actionPraviSos(state, persistent, params) {
  const cost = 1;
  if (state.slots < cost) return null;
  const kg = params?.kg || 0;
  if (kg <= 0) return { state: addLog(state, '⚠️ Unesi količinu paradajza.', 'warn'), persistent };
  if ((state.sirovine.paradajz || 0) < kg) {
    return { state: addLog(state, `⚠️ Nema dovoljno paradajza.`, 'warn'), persistent };
  }
  const efficiency = state.prestige_bonuses?.recipe_efficiency || 1.0;
  const output = Math.floor(kg * YIELD.sos * efficiency);
  const cap = getCapacity(state);
  const used = state.tegle.reduce((s, j) => s + j.qty, 0);
  if (used + output > cap) return { state: addLog(state, '⚠️ Police pune.', 'warn'), persistent };

  const newSirovine = { ...state.sirovine, paradajz: state.sirovine.paradajz - kg };
  const jar = createJar('sos', output, state.day);
  let s = { ...state, sirovine: newSirovine, tegle: [...state.tegle, jar], slots: state.slots - cost };
  s = addLog(s, `🍅 Sos: ${kg} kg → ${output} kg.`, 'success');
  return { state: s, persistent };
}

/** Pravi pelat od paradajza — -1 slot */
function actionPraviPelat(state, persistent, params) {
  const cost = 1;
  if (state.slots < cost) return null;
  const kg = params?.kg || 0;
  if (kg <= 0) return { state: addLog(state, '⚠️ Unesi količinu paradajza.', 'warn'), persistent };
  if ((state.sirovine.paradajz || 0) < kg) {
    return { state: addLog(state, '⚠️ Nema dovoljno paradajza.', 'warn'), persistent };
  }
  const efficiency = state.prestige_bonuses?.recipe_efficiency || 1.0;
  const output = Math.floor(kg * YIELD.pelat * efficiency);
  const cap = getCapacity(state);
  const used = state.tegle.reduce((s, j) => s + j.qty, 0);
  if (used + output > cap) return { state: addLog(state, '⚠️ Police pune.', 'warn'), persistent };

  const newSirovine = { ...state.sirovine, paradajz: state.sirovine.paradajz - kg };
  const jar = createJar('pelat', output, state.day);
  let s = { ...state, sirovine: newSirovine, tegle: [...state.tegle, jar], slots: state.slots - cost };
  s = addLog(s, `🥫 Pelat: ${kg} kg → ${output} kg.`, 'success');
  return { state: s, persistent };
}

/** Suši voće (jabuke ili šljive) — pasivni posao, -1 slot */
function actionSusiVoce(state, persistent, params) {
  const cost = 1;
  if (state.slots < cost) return null;
  const kg = params?.kg || 0;
  const type = params?.type || 'jabuke'; // 'jabuke' | 'sljive'
  if (kg <= 0) return { state: addLog(state, '⚠️ Unesi količinu.', 'warn'), persistent };
  if ((state.sirovine[type] || 0) < kg) {
    return { state: addLog(state, `⚠️ Nema dovoljno ${type}.`, 'warn'), persistent };
  }

  const efficiency = state.prestige_bonuses?.recipe_efficiency || 1.0;
  const recipe = type === 'sljive' ? 'sušene_šljive' : 'suseno_voce';
  const yieldRate = type === 'sljive' ? 0.35 : YIELD.suseno;
  const output = Math.floor(kg * yieldRate * efficiency);
  const duration = DRYING_DAYS.suseno || 2;

  const newSirovine = { ...state.sirovine, [type]: state.sirovine[type] - kg };
  const job = createBatchJob(recipe, state.day, duration, kg, output, type);
  let s = { ...state, sirovine: newSirovine, passive_jobs: [...state.passive_jobs, job], slots: state.slots - cost };
  s = addLog(s, `🍎 Sušenje ${kg} kg ${type} — gotovo za ${duration} dana.`, 'info');
  return { state: s, persistent };
}

/** Pravi džem od jabuka — -1 slot */
function actionPraviDzem(state, persistent, params) {
  const cost = 1;
  if (state.slots < cost) return null;
  const kg = params?.kg || 0;
  if (kg <= 0) return { state: addLog(state, '⚠️ Unesi količinu jabuka.', 'warn'), persistent };
  if ((state.sirovine.jabuke || 0) < kg) {
    return { state: addLog(state, '⚠️ Nema dovoljno jabuka.', 'warn'), persistent };
  }
  const efficiency = state.prestige_bonuses?.recipe_efficiency || 1.0;
  const output = Math.floor(kg * YIELD.dzem * efficiency);
  const cap = getCapacity(state);
  const used = state.tegle.reduce((s, j) => s + j.qty, 0);
  if (used + output > cap) return { state: addLog(state, '⚠️ Police pune.', 'warn'), persistent };

  const newSirovine = { ...state.sirovine, jabuke: state.sirovine.jabuke - kg };
  const jar = createJar('dzem', output, state.day);
  let s = { ...state, sirovine: newSirovine, tegle: [...state.tegle, jar], slots: state.slots - cost };
  s = addLog(s, `🍓 Džem: ${kg} kg → ${output} kg.`, 'success');
  return { state: s, persistent };
}

/** Utisni kupus u bačvu — -2 slota */
function actionUtisniKupus(state, persistent, params) {
  const kg = params?.kg || params?.kupus_kg || state.sirovine.kupus;
  if (kg < 20) return { state: addLog(state, '⚠️ Minimum 20 kg kupusa za bačvu.', 'warn'), persistent };
  const { state: s, error } = initBacva(state, kg);
  if (error) return { state: addLog(state, `⚠️ ${error}`, 'warn'), persistent };
  return { state: s, persistent };
}

/** Pokupuj turšiju — pasivni posao fermentacije, -1 slot */
function actionPokupujTursiju(state, persistent, params) {
  const cost = 1;
  if (state.slots < cost) return null;
  const kg = params?.kg || 0;
  if (kg <= 0) return { state: addLog(state, '⚠️ Unesi količinu (krastavci+bostanuša).', 'warn'), persistent };

  // Check combined krastavci + bostanusa
  const totalAvail = (state.sirovine.krastavci || 0) + (state.sirovine.bostanusa || 0);
  if (totalAvail < kg) {
    return { state: addLog(state, `⚠️ Nema dovoljno povrća za turšiju (ima ${totalAvail.toFixed(1)} kg).`, 'warn'), persistent };
  }

  const efficiency = state.prestige_bonuses?.recipe_efficiency || 1.0;
  const output = Math.floor(kg * YIELD.tursija * efficiency);
  const duration = FERMENTATION_DAYS.tursija || 3;

  // Use krastavci first, then bostanusa
  let need = kg;
  const krasAvail = state.sirovine.krastavci || 0;
  const usedKras = Math.min(krasAvail, need);
  need -= usedKras;
  const usedBost = Math.min(state.sirovine.bostanusa || 0, need);

  const newSirovine = {
    ...state.sirovine,
    krastavci: state.sirovine.krastavci - usedKras,
    bostanusa: (state.sirovine.bostanusa || 0) - usedBost
  };

  const job = createBatchJob('tursija', state.day, duration, kg, output, 'krastavci+bostanusa');
  let s = { ...state, sirovine: newSirovine, passive_jobs: [...state.passive_jobs, job], slots: state.slots - cost };
  s = addLog(s, `🥒 Turšija: ${kg} kg → gotova za ${duration} dana.`, 'info');
  return { state: s, persistent };
}

/** Pravi pekmez od šljiva — -1 slot */
function actionPraviPekmez(state, persistent, params) {
  const cost = 1;
  if (state.slots < cost) return null;
  const kg = params?.kg || 0;
  if (kg <= 0) return { state: addLog(state, '⚠️ Unesi količinu šljiva.', 'warn'), persistent };
  if ((state.sirovine.sljive || 0) < kg) {
    return { state: addLog(state, '⚠️ Nema dovoljno šljiva.', 'warn'), persistent };
  }
  const efficiency = state.prestige_bonuses?.recipe_efficiency || 1.0;
  const output = Math.floor(kg * YIELD.pekmez * efficiency);
  const cap = getCapacity(state);
  const used = state.tegle.reduce((s, j) => s + j.qty, 0);
  if (used + output > cap) return { state: addLog(state, '⚠️ Police pune.', 'warn'), persistent };

  const newSirovine = { ...state.sirovine, sljive: state.sirovine.sljive - kg };
  const jar = createJar('pekmez', output, state.day);
  let s = { ...state, sirovine: newSirovine, tegle: [...state.tegle, jar], slots: state.slots - cost };
  s = addLog(s, `🫐 Pekmez: ${kg} kg → ${output} kg.`, 'success');
  return { state: s, persistent };
}

/** Destiliši rakiju — samo od dana 7, -3 slota, pasivni posao */
function actionDestilisiRakiju(state, persistent, params) {
  if (!state.unlocks.rakija && state.day < RAKIJA_UNLOCK_DAY) {
    return { state: addLog(state, `⚠️ Rakija dostupna od Dana ${RAKIJA_UNLOCK_DAY}.`, 'warn'), persistent };
  }
  const cost = 3;
  if (state.slots < cost) return null;

  // Use jabuke first, then sljive
  const jabuke = state.sirovine.jabuke || 0;
  const sljive = state.sirovine.sljive || 0;
  const inputType = jabuke >= 15 ? 'jabuke' : (sljive >= 10 ? 'sljive' : null);
  if (!inputType) {
    return { state: addLog(state, '⚠️ Treba min 15 kg jabuka ili 10 kg šljiva.', 'warn'), persistent };
  }

  const kg = params?.kg || (inputType === 'jabuke' ? jabuke : sljive);
  const legalCap = RAKIJA_LEGAL_CAP_L;
  const efficiency = state.prestige_bonuses?.recipe_efficiency || 1.0;
  const rawL = kg * YIELD.rakija * efficiency;
  const outputL = Math.min(rawL, legalCap - (state.rakija_reserve_L || 0));
  if (outputL <= 0) {
    return { state: addLog(state, `⚠️ Zakonski limit ${legalCap}L dostignut.`, 'warn'), persistent };
  }

  const newSirovine = { ...state.sirovine, [inputType]: state.sirovine[inputType] - kg };
  const job = createBatchJob('rakija', state.day, 1, kg, outputL, inputType);
  let s = { ...state, sirovine: newSirovine, passive_jobs: [...state.passive_jobs, job], slots: state.slots - cost };
  s = addLog(s, `🫗 Destilacija: ${kg} kg ${inputType} → ~${outputL.toFixed(1)} L rakije sutra.`, 'info');
  return { state: s, persistent };
}

/** Prodaj tegle (nova forma) */
function actionProdaj(state, persistent, params) {
  return actionProdaja(state, persistent, params);
}

/** Kupi policu — upgrejduje police */
function actionKupiPolicu(state, persistent, params) {
  const nextLevel = state.shelf_level + 1;
  if (nextLevel >= SHELF_UPGRADES.length) {
    return { state: addLog(state, '⚠️ Maksimalan nivo polica dostignut.', 'warn'), persistent };
  }
  const upgrade = SHELF_UPGRADES[nextLevel];
  if (upgrade.prestige_only && !state.prestige_active) {
    return { state: addLog(state, '⚠️ Ova polica zahteva prestige run.', 'warn'), persistent };
  }
  if (state.kasa < upgrade.cost) {
    return { state: addLog(state, `⚠️ Nema dovoljno dinara (treba ${upgrade.cost} din).`, 'warn'), persistent };
  }
  if (upgrade.kasa_req && state.kasa < upgrade.kasa_req + upgrade.cost) {
    return { state: addLog(state, `⚠️ Nedovoljna kasa (min ${upgrade.kasa_req} din za ovaj nivo).`, 'warn'), persistent };
  }

  let s = { ...state, shelf_level: nextLevel, kasa: state.kasa - upgrade.cost };
  s = addLog(s, `📦 Polica upgrejdovana! Kapacitet: ${upgrade.capacity} kg.`, 'success');
  return { state: s, persistent };
}

/**
 * Rešava event choice — primenjuje efekat izabranog odgovora, uklanja event.
 * @param {object} state
 * @param {object} persistent
 * @param {object} params - { eventId, choiceId }
 * @returns {{ state: object, persistent: object }}
 */
function actionEventChoice(state, persistent, params) {
  const { eventId, choiceId } = params;
  if (!eventId) return { state, persistent };

  // Nađi event u today_events
  const eventDef = state.today_events && state.today_events.find(e => e.id === eventId);
  if (!eventDef) {
    // Event ne postoji u listi — samo ukloni (sigurnost)
    return {
      state: { ...state, today_events: (state.today_events || []).filter(e => e.id !== eventId) },
      persistent
    };
  }

  // Mapiranje choiceId → indeks u choices arrayu
  const choices = eventDef.choices || [];
  const choiceIdx = choiceId ? choices.findIndex(c => c.id === choiceId) : 0;
  const safeIdx = choiceIdx < 0 ? 0 : choiceIdx;

  // Primijeni efekat izbora
  const { state: newState, persistent: newPersistent } = resolveEvent(state, eventId, safeIdx, persistent);

  // Ukloni razrješeni event iz liste
  const remaining = (newState.today_events || []).filter(e => e.id !== eventId);
  return { state: { ...newState, today_events: remaining }, persistent: newPersistent };
}

/**
 * Završava igru i određuje ending.
 * @param {object} state
 * @param {object} persistent
 * @returns {{ state: object, persistent: object }}
 */
function endGame(state, persistent) {
  const ending = checkEnding(state, persistent);
  const s = { ...state, game_over: true, ending };
  return { state: s, persistent };
}
