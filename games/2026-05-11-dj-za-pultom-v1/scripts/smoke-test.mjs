// =============================================================================
// scripts/smoke-test.mjs — Node smoke test za game state + week loop
// =============================================================================
// Pokreni: node scripts/smoke-test.mjs
// Cilj: verifikuje da svi systems-i prolaze 12-week simulaciju bez exception-a.
// =============================================================================

global.localStorage = {
  _data: {},
  getItem(k) { return this._data[k] ?? null; },
  setItem(k, v) { this._data[k] = String(v); },
  removeItem(k) { delete this._data[k]; }
};
global.window = {};
global.document = {
  readyState: 'complete',
  addEventListener: () => {},
  createElement: () => ({ appendChild: () => {}, setAttribute: () => {}, addEventListener: () => {} }),
  createTextNode: () => ({}),
  getElementById: () => null
};
global.Node = class {};

const BASE = new URL('..', import.meta.url).pathname;

(async () => {
  try {
    const { createNewState, saveState, loadState } = await import(BASE + 'src/state.js');
    const s = createNewState();
    console.log('createNewState OK, week=', s.week, 'scene=', s.scene);

    const { processOriginCompletion } = await import(BASE + 'src/systems/origin.js');
    const s2 = createNewState();
    processOriginCompletion(s2, {
      preset_key: 'kafanski_muzicar',
      q2_observed_djs: 'craftsman',
      q3_signature_taste: 'techno_drive',
      q4_first_decks: 'crew_friend',
      q5_apstinencija: 'drustveno'
    });
    console.log('processOrigin OK, preset=', s2.origin.preset_key, 'class=', s2.class_key, 'mixing=', s2.stats.mixing.toFixed(2));

    const { runWeek, getCurrentGigScheduled } = await import(BASE + 'src/systems/macro.js');
    s2.gigs_this_week = 0;
    const plan = {
      promo: { frequency: 1, ad_money: 10 },
      music: { source: 'digital', money_invested: 50 },
      knowledge: { source: 'podcast', hours: 5 },
      mixing: { session_length: 60, record_mixtape: false },
      visual: { category: 'fitness' },
      scene: { mingling_count: 1, atmospheric_count: 1, guest_set: false },
      finance: { bookkeeping: true, sponsor_outreach: false },
      energy: { san: true, hobi: true, joga: false, setnja: false, porodica: false, mirna_nedelja: false }
    };
    const log = runWeek(s2, plan);
    console.log('runWeek OK, week now=', s2.week, 'health=', s2.sacrifice.health.toFixed(1), 'money=', s2.money.toFixed(0));
    console.log('paths achieved week1:', log.pathsAchieved);

    const { simulateSet } = await import(BASE + 'src/systems/micro.js');
    s2.stats.mixing = 4;
    s2.stats.knowledge = 3;
    const setRes = simulateSet(s2, { effort: 'normal', pre_drinks: 1, attempt_signatures: 2 });
    console.log('simulateSet OK, quality=', setRes.quality.toFixed(0), 'gigFee=', setRes.gigFee);

    saveState(s2);
    const loaded = loadState();
    console.log('Save/load OK, week=', loaded.week);

    // 12-week sim
    const s3 = createNewState();
    processOriginCompletion(s3, {
      q1_class: 'bogata_deca',
      q2_observed_djs: 'showman',
      q3_signature_taste: 'tech house',
      q4_first_decks: 'self_taught',
      q5_apstinencija: 'drustveno'
    });
    for (let w = 1; w <= 12; w++) {
      const hasGig = getCurrentGigScheduled(s3);
      s3.gigs_this_week = hasGig ? 1 : 0;
      runWeek(s3, plan);
      if (hasGig) {
        simulateSet(s3, { effort: 'normal', pre_drinks: 1, attempt_signatures: s3.stats.knowledge >= 2 ? 1 : 0 });
      }
    }

    // v2: test buildPlanFromGrid
    const { buildPlanFromGrid } = await import(BASE + 'src/scenes/macro-planner.js').catch(() => ({ buildPlanFromGrid: null }));
    if (buildPlanFromGrid) {
      const { createEmptyMacroGrid } = await import(BASE + 'src/state.js');
      const grid = createEmptyMacroGrid();
      grid[0].sticker = 'promo';
      grid[1].sticker = 'mixing';
      grid[2].sticker = 'mixing';
      grid[3].sticker = 'knowledge';
      grid[4].sticker = 'energy';
      grid[5].sticker = 'hobby';
      grid[6].sticker = 'scene';
      const p = buildPlanFromGrid(grid);
      console.log('buildPlanFromGrid OK, mixing=', p.mixing.session_length, 'min, promo=', p.promo.frequency, 'x/wk');
    }

    // v2: test substance + diagnoses
    const { DIAGNOSES, detectCompounds, COUNT } = await import(BASE + 'src/data/pera-substance.js');
    console.log('DIAGNOSES count:', COUNT, '(target 44)');
    const compounds = detectCompounds(['alcohol', 'stim']);
    console.log('detectCompounds([alc,stim]):', compounds.length, 'found');

    // v2: test stickers
    const { STICKERS } = await import(BASE + 'src/data/stickers.js');
    console.log('STICKERS count:', STICKERS.length);

    // v2: test 9 origin presets
    const { ORIGIN_PRESETS } = await import(BASE + 'src/data/origin-questions.js');
    console.log('ORIGIN_PRESETS count:', ORIGIN_PRESETS.length, '(target 9)');

    // v2: test Pera bank size
    const { TOTAL_COUNT } = await import(BASE + 'src/data/aforizmi.js');
    console.log('Pera AFORIZMI total lines:', TOTAL_COUNT);
    const { evaluatePaths, getPrimaryPath } = await import(BASE + 'src/systems/path-tracker.js');
    const finalPaths = evaluatePaths(s3);
    console.log('12-week sim complete. paths:', finalPaths, 'primary:', getPrimaryPath(finalPaths));
    console.log('  health:', s3.sacrifice.health.toFixed(1), 'odnosi:', s3.sacrifice.odnosi.toFixed(1), 'normalnost:', s3.sacrifice.normalnost.toFixed(1));
    console.log('  reputation:', s3.stats.reputation.toFixed(2), 'mixing:', s3.stats.mixing.toFixed(2), 'gigs:', s3.gigs_played.length);

    console.log('\n=== ALL SMOKE TESTS PASSED ===');
  } catch (e) {
    console.error('FAILED:', e);
    process.exit(1);
  }
})();
