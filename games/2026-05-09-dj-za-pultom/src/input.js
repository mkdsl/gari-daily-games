// input.js — svi input handleri: Next Track, upgrade drawer, touch podrška
import { CLICK_COOLDOWN_MS } from './config.js';

// ---------------------------------------------------------------------------
// Interni state
// ---------------------------------------------------------------------------

let _trackCooldownTimer = null;   // setTimeout handle
let _drawerOpen         = false;
let _lastTouchEnd       = 0;      // zaštita od ghost click na touch uređajima

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Registruje sve event listenere.
 * Poziva se jednom iz main.js::init().
 *
 * @param {() => void}      onTrackClick  — callback za "Next Track" klik
 * @param {(id: string) => void} onUpgradeBuy — callback za kupovinu upgrada
 */
export function setupInput(onTrackClick, onUpgradeBuy) {
  _setupTrackButton(onTrackClick);
  _setupUpgradeDrawer(onUpgradeBuy);
}

/**
 * Vraća true ako je "Next Track" u cooldownu.
 * Može se koristiti iz render.js za vizualizaciju.
 * @returns {boolean}
 */
export function isTrackOnCooldown() {
  return _trackCooldownTimer !== null;
}

// ---------------------------------------------------------------------------
// Next Track dugme
// ---------------------------------------------------------------------------

function _setupTrackButton(onTrackClick) {
  const btn = document.getElementById('btn-next-track');
  if (!btn) return;

  // Touch: koristimo touchend da bi odgovor bio brži na mobilnom
  btn.addEventListener('touchend', (e) => {
    e.preventDefault(); // spriječi ghost click koji browser generira 300ms kasnije
    _lastTouchEnd = Date.now();
    _fireTrackClick(btn, onTrackClick);
  }, { passive: false });

  // Click: provjeri da nije ghost click od toucha (< 500ms nakon touchend)
  btn.addEventListener('click', () => {
    if (Date.now() - _lastTouchEnd < 500) return; // ghost click, ignoriši
    _fireTrackClick(btn, onTrackClick);
  });
}

/**
 * Izvršava klik ako nije u cooldownu, pa pokreće cooldown.
 * @param {HTMLElement} btn
 * @param {() => void} onTrackClick
 */
function _fireTrackClick(btn, onTrackClick) {
  if (_trackCooldownTimer !== null) return; // već u cooldownu

  onTrackClick();
  _startCooldown(btn);
}

/**
 * Disejbluje dugme i pokreće vizualni cooldown.
 * @param {HTMLElement} btn
 */
function _startCooldown(btn) {
  btn.classList.add('cooldown');
  btn.setAttribute('aria-disabled', 'true');

  // Progres bar — ako postoji u DOM-u
  const progressEl = btn.querySelector('.cooldown-bar');
  if (progressEl) {
    progressEl.style.transition = 'none';
    progressEl.style.width      = '100%';
    // Force reflow da animacija krene ispočetka
    void progressEl.offsetWidth;
    progressEl.style.transition = `width ${CLICK_COOLDOWN_MS}ms linear`;
    progressEl.style.width      = '0%';
  }

  _trackCooldownTimer = setTimeout(() => {
    _trackCooldownTimer = null;
    btn.classList.remove('cooldown');
    btn.setAttribute('aria-disabled', 'false');

    if (progressEl) {
      progressEl.style.transition = 'none';
      progressEl.style.width      = '0%';
    }
  }, CLICK_COOLDOWN_MS);
}

// ---------------------------------------------------------------------------
// Upgrade drawer
// ---------------------------------------------------------------------------

function _setupUpgradeDrawer(onUpgradeBuy) {
  const toggleBtn = document.getElementById('btn-upgrade-toggle');
  const drawer    = document.getElementById('upgrade-drawer');

  if (toggleBtn && drawer) {
    // Toggle klik/tap na header dugme
    toggleBtn.addEventListener('click', () => _toggleDrawer(toggleBtn, drawer));

    toggleBtn.addEventListener('touchend', (e) => {
      e.preventDefault();
      _toggleDrawer(toggleBtn, drawer);
    }, { passive: false });

    // Swipe-up gesta na samom draweru (za otvaranje odozdo)
    _setupSwipeUp(drawer, () => {
      if (!_drawerOpen) _toggleDrawer(toggleBtn, drawer);
    });
    _setupSwipeDown(drawer, () => {
      if (_drawerOpen) _toggleDrawer(toggleBtn, drawer);
    });
  }

  // Delegacija klikova na upgrade buy dugmad
  const upgradeList = document.getElementById('upgrade-list');
  if (upgradeList) {
    upgradeList.addEventListener('click', (e) => {
      const buyBtn = e.target.closest('[data-upgrade-id]');
      if (!buyBtn) return;
      const upgradeId = buyBtn.dataset.upgradeId;
      if (upgradeId) onUpgradeBuy(upgradeId);
    });
  }
}

/**
 * Toggleuje otvoreno/zatvoreno stanje drawera.
 * @param {HTMLElement} toggleBtn
 * @param {HTMLElement} drawer
 */
function _toggleDrawer(toggleBtn, drawer) {
  _drawerOpen = !_drawerOpen;

  drawer.classList.toggle('open', _drawerOpen);
  toggleBtn.setAttribute('aria-expanded', String(_drawerOpen));
  toggleBtn.textContent = _drawerOpen ? 'UPGRADES ▼' : 'UPGRADES ▲';
}

// ---------------------------------------------------------------------------
// Swipe geste
// ---------------------------------------------------------------------------

/**
 * Registruje swipe-up listener na element.
 * @param {HTMLElement} el
 * @param {() => void} callback
 */
function _setupSwipeUp(el, callback) {
  let startY = null;

  el.addEventListener('touchstart', (e) => {
    startY = e.touches[0].clientY;
  }, { passive: true });

  el.addEventListener('touchend', (e) => {
    if (startY === null) return;
    const endY = e.changedTouches[0].clientY;
    const diff = startY - endY; // pozitivno = gore
    if (diff > 50) callback();  // threshold 50px
    startY = null;
  }, { passive: true });
}

/**
 * Registruje swipe-down listener na element.
 * @param {HTMLElement} el
 * @param {() => void} callback
 */
function _setupSwipeDown(el, callback) {
  let startY = null;

  el.addEventListener('touchstart', (e) => {
    startY = e.touches[0].clientY;
  }, { passive: true });

  el.addEventListener('touchend', (e) => {
    if (startY === null) return;
    const endY = e.changedTouches[0].clientY;
    const diff = endY - startY; // pozitivno = dole
    if (diff > 50) callback();  // threshold 50px
    startY = null;
  }, { passive: true });
}
