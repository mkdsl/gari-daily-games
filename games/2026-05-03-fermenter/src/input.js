/**
 * @file input.js
 * Fermenter — Varenički Bunt
 * Keyboard/mouse/touch input handlers za bure klik.
 * Upgrade dugmad dobijaju handlere direktno u ui.js → renderUpgradePanel().
 */

/**
 * Inicijalizuje input handlere na bureu.
 * @param {GameState} state
 * @param {Function} onBarrelClick - poziva se na klik/touch bureta
 * @param {Function} onUpgradeBuy - prosleđuje se ui.js, ovde nije potreban
 */
export function initInput(state, onBarrelClick, onUpgradeBuy) {
  // Koristimo event delegation — bure možda još nije u DOM-u u trenutku poziva
  const container = document.getElementById('game-container');
  if (!container) return;

  // Mouse click na bure
  container.addEventListener('click', (e) => {
    if (e.target.closest('#barrel')) {
      onBarrelClick(e);
    }
  });

  // Touch (sprečava double-tap zoom na mobilnom)
  container.addEventListener('touchstart', (e) => {
    if (e.target.closest('#barrel')) {
      e.preventDefault();
      onBarrelClick(e);
    }
  }, { passive: false });

  // Keyboard: Space klika bure ako fokus nije na interaktivnom elementu
  document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
      const active = document.activeElement;
      const isInteractive = active && (active.tagName === 'BUTTON' || active.tagName === 'INPUT');
      if (!isInteractive) {
        e.preventDefault();
        onBarrelClick(null);
      }
    }
  });
}
