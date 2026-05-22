// sliders.js — zone control sliders
import { NEIGHBOR_LIMIT_DB } from '../config.js';

let onChangeCallback = null;

export function initSliders(state, onChange) {
  onChangeCallback = onChange;
  rebuildSliders(state);
}

export function rebuildSliders(state) {
  const container = document.getElementById('zone-sliders');
  if (!container) return;
  container.innerHTML = '';

  const controllable = state.zones.filter(z => z.isControllable && !z.isNeighbor);

  controllable.forEach((zone, i) => {
    const wrap = document.createElement('div');
    wrap.className = 'slider-wrap';
    wrap.dataset.zoneId = zone.id;

    const label = document.createElement('div');
    label.className = 'slider-label';
    label.innerHTML = `<span class="zone-name">${zone.name}</span><span class="zone-dots" id="dots-${zone.id}">${zone.getDotIndicator()}</span>`;

    const slider = document.createElement('input');
    slider.type = 'range';
    slider.className = 'zone-slider';
    slider.id = `slider-${zone.id}`;
    slider.min = zone.minDb;
    slider.max = zone.maxDb;
    slider.step = 1;
    slider.value = zone.db;
    slider.setAttribute('aria-label', zone.name);

    slider.addEventListener('input', (e) => {
      const val = parseInt(e.target.value, 10);
      zone.setDb(val);
      updateSliderAppearance(zone);
      if (onChangeCallback) onChangeCallback(zone);
    });

    // Touch support is native for <input type=range>
    wrap.appendChild(label);
    wrap.appendChild(slider);
    container.appendChild(wrap);
    updateSliderAppearance(zone);
  });
}

export function updateSliderAppearance(zone) {
  const dots = document.getElementById(`dots-${zone.id}`);
  if (dots) dots.textContent = zone.getDotIndicator();

  const slider = document.getElementById(`slider-${zone.id}`);
  if (!slider) return;

  // Color thumb based on danger level
  if (zone.db > 95) {
    slider.classList.add('slider-danger');
    slider.classList.remove('slider-warn', 'slider-safe');
  } else if (zone.db > 85) {
    slider.classList.add('slider-warn');
    slider.classList.remove('slider-danger', 'slider-safe');
  } else {
    slider.classList.add('slider-safe');
    slider.classList.remove('slider-danger', 'slider-warn');
  }
}

export function syncSliders(state) {
  for (const zone of state.zones) {
    if (!zone.isControllable) continue;
    const slider = document.getElementById(`slider-${zone.id}`);
    if (slider) slider.value = zone.db;
    updateSliderAppearance(zone);
  }
}
