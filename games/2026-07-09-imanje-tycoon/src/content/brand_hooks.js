const HOOKS = [
  {
    key: 'mc_hook_1',
    threshold: 3,
    message: '🌿 Ekosistem Arhitekta! 3 masterclass sesije — Guncati model u akciji. Spremi se za pravi: guncati.rs',
  },
  {
    key: 'mc_hook_2',
    threshold: 5,
    message: '🎓 Alumni mreža raste! 5 sesija, zajednica živi. Guncati Edukativni Centar — ima mesta i za tebe: guncati.rs',
  },
  {
    key: 'mc_hook_3',
    threshold: 8,
    message: '🔄 Puni krug znanja. 8 masterclass-a — prestiž filozofija Guncatija: predaj pa dobij više. guncati.rs',
  },
];

/**
 * Show Guncati brand toast on masterclass milestones (3 / 5 / 8).
 * @param {object} state
 * @param {function} showToastFn
 */
export function checkMasterclassHooks(state, showToastFn) {
  if (!state._brandHooksFired) state._brandHooksFired = {};

  for (const hook of HOOKS) {
    if (state.masterclassCount === hook.threshold && !state._brandHooksFired[hook.key]) {
      showToastFn(hook.message, 6000);
      state._brandHooksFired[hook.key] = true;
    }
  }
}
