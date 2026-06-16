import { CONFIG } from '../config.js';
import { getDailyLightZone } from '../systems/daily-light.js';

let splashEl = null;
let autoCloseTimer = null;

export function createSplashEl() {
  if (splashEl) return splashEl;

  splashEl = document.createElement('div');
  splashEl.id = 'splash-screen';
  splashEl.style.cssText = `
    position: fixed;
    top: 0; left: 0; right: 0;
    background: linear-gradient(180deg, #0D1B2A 0%, #1a2d42 100%);
    padding: 24px;
    z-index: 1000;
    transform: translateY(-100%);
    transition: transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
    text-align: center;
    color: #E8DCC8;
    font-family: monospace;
    border-bottom: 2px solid #FFD700;
    box-shadow: 0 4px 20px rgba(0,0,0,0.8);
  `;

  document.body.appendChild(splashEl);
  return splashEl;
}

export function showSplash(state) {
  const today = new Date().toISOString().slice(0, 10);

  // Only show once per day
  if (state.lastSplashDate === today) return false;

  const el = createSplashEl();
  const dlZone = getDailyLightZone(today);
  const zoneNames = { pult: 'Pult', bina: 'Bina', suma: 'Šuma' };
  const zoneAccents = { pult: '#BF5FFF', bina: '#FFB830', suma: '#40C87E' };
  const accent = zoneAccents[dlZone] || '#FFD700';
  const zoneName = zoneNames[dlZone] || dlZone;

  // Determine greeting based on time
  const hour = new Date().getHours();
  let greeting = 'Dobrodošao nazad';
  if (hour < 12) greeting = 'Dobro jutro';
  else if (hour < 18) greeting = 'Dobar dan';
  else greeting = 'Dobro veče';

  const isFirstVisit = !state.totalDaysVisited || state.totalDaysVisited === 0;

  el.innerHTML = `
    <div style="font-size: 11px; color: #666; letter-spacing: 2px; margin-bottom: 6px;">
      MKDSLEND PARK — SEZONA ${state.season || 1}
    </div>
    <div style="font-size: 20px; font-weight: bold; margin-bottom: 4px;">
      ${isFirstVisit ? 'Dobrodošao u MKDSLend Park' : greeting + ' u MKDSLend Park'}
    </div>
    <div style="font-size: 13px; color: #aaa; margin-bottom: 12px;">
      ${today}
    </div>
    <div style="display: inline-block; background: rgba(0,0,0,0.4); border: 1px solid ${accent};
                border-radius: 6px; padding: 10px 20px;">
      <div style="font-size: 10px; color: #666; margin-bottom: 4px;">DANAS — DNEVNO SVETLO</div>
      <div style="font-size: 16px; color: ${accent}; font-weight: bold;">⭐ ${zoneName}</div>
      <div style="font-size: 10px; color: #666; margin-top: 4px;">+25 PT bonus za check-in</div>
    </div>
    <div style="font-size: 10px; color: #555; margin-top: 12px;">
      Klikni ili čekaj 2.5s...
    </div>
  `;

  // Slide in
  requestAnimationFrame(() => {
    el.style.transform = 'translateY(0)';
  });

  // Auto close after 2.5s
  autoCloseTimer = setTimeout(() => hideSplash(state), 2500);

  // Click to close
  el.addEventListener('click', () => hideSplash(state), { once: true });

  return true;
}

export function hideSplash(state) {
  if (autoCloseTimer) { clearTimeout(autoCloseTimer); autoCloseTimer = null; }
  if (!splashEl) return;

  splashEl.style.transform = 'translateY(-100%)';

  // Update state
  const today = new Date().toISOString().slice(0, 10);
  state.lastSplashDate = today;
}
