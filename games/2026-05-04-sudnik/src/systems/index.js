// Jova: ovaj fajl wire-uje sve systeme. Importuj iz ./physics.js, ./collision.js itd.
// i zovi ih po redu u updateSystems.

export function updateSystems(state, input, dt) {
  if (state.paused || state.gameOver) return;
  // updatePhysics(state, dt);
  // updateCollisions(state);
  // updateAI(state, dt);
  // updateProgression(state, dt);
}
