// input.js — svi input handleri: Next Track, upgrade drawer, touch podrška
import { CLICK_COOLDOWN_MS } from './config.js';

// ---------------------------------------------------------------------------
// Interni state
// ---------------------------------------------------------------------------

let _trackCooldownTimer = null;  // setTimeout handle; null = nije u cooldownu
let _drawerOpen         = false;
let _lastTouchEnd       = 0;     // timestamp zadnjeg touchend — ghost click zaštita

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Registruje sve event listenere.
 * Poziva se jednom iz main.js::init().
 *
 * @param {() => void}           onTrackClick  — callback za "Next Track" klik
 * @param {(id: string) => void} onUpgradeBuy  — callback za kupovinu upgrada
 */
export function setupInput(onTrackClick, onUpgradeBuy) {
  _setupTrackButton(onTrackClick);
  _setupUpgradeDrawer(onUpgradeBuy);
}

/**
 * Vraća true ako je "Next Track" u cooldownu.
 * Može koristiti render.js za vizualizaciju.
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

  // touchend: brži odgovor na mobilnom, preventDefault blokira ghost click
  btn.addEventListener('touchend', (e) => {
    e.preventDefault();
    _lastTouchEnd = Date.now();
    _fireTrackClick(btn, onTrackClick);
  }, { passive: false });

  // click: na desktopu ili ako touchend nije okidao
  btn.addEventListener('click', () => {
    // Ignoriši ghost click koji browser generira ~300ms nakon touchend
    if (Date.now() - _lastTouchEnd < 500) return;
    _fireTrackClick(btn, onTrackClick);
  });
}

/**
 * Izvršava klik ako nije aktivan cooldown, pa pokreće cooldown.
 * @param {HTMLElement} btn
 * @param {() => void} onTrackClick
 */
function _fireTrackClick(btn, onTrackClick) {
  if (_trackCooldownTimer !== null) return; // odbaci — u cooldownu

  onTrackClick();
  _startCooldown(btn);
}

/**
 * Disejbluje dugme vizualno i pokreće progress bar animaciju.
 * @param {HTMLElement} btn
 */
function _startCooldown(btn) {
  btn.classList.add('cooldown');
  btn.setAttribute('aria-disabled', 'true');

  // Opcionalni progres bar unutar dugmeta
  const progressEl = btn.querySelector('.cooldown-bar');
  if (progressEl) {
    progressEl.style.transition = 'none';
    progressEl.style.width      = '100%';
    void progressEl.offsetWidth; // force reflow
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
    // Klik/tap na toggle dugme
    toggleBtn.addEventListener('click', () => {
      _toggleDrawer(toggleBtn, drawer);
    });

    toggleBtn.addEventListener('touchend', (e) => {
      e.preventDefault();
      _toggleDrawer(toggleBtn, drawer);
    }, { passive: false });

    // Swipe-up na draweru otvara ga; swipe-down zatvara
    _setupSwipeUp(drawer, () => {
      if (!_drawerOpen) _toggleDrawer(toggleBtn, drawer);
    });
    _setupSwipeDown(drawer, () => {
      if (_drawerOpen) _toggleDrawer(toggleBtn, drawer);
    });
  }

  // Event delegacija — klik na bilo koje dugme sa data-upgrade-id atributom
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
 * Toggleuje otvoreno/zatvoreno stanje drawera i ažurira ARIA atribute.
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
// Swipe geste (touch-only)
// ---------------------------------------------------------------------------

/**
 * Registruje swipe-up listener. Threshold: 50px.
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
    const diff = startY - e.changedTouches[0].clientY; // pozitivno = gore
    if (diff > 50) callback();
    startY = null;
  }, { passive: true });
}

/**
 * Registruje swipe-down listener. Threshold: 50px.
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
    const diff = e.changedTouches[0].clientY - startY; // pozitivno = dole
    if (diff > 50) callback();
    startY = null;
  }, { passive: true });
}
