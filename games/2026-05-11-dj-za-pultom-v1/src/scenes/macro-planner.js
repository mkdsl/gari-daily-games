// =============================================================================
// scenes/macro-planner.js — Macro week planner UI
// =============================================================================
import { el, clearChildren, pressureSignal } from '../util.js';
import {
  renderHUD, renderSacrificeBar, renderTierGrid,
  bigButton, panel, peraQuote, infoLine, meterBar
} from '../ui.js';
import { VECTORS } from '../data/vector-meta.js';
import { runWeek, getCurrentGigScheduled } from '../systems/macro.js';
import { saveState } from '../state.js';
import { GIG_SCHEDULE, WEEKS_PER_SEASON } from '../config.js';
import { isUnlocked as isRecklessUnlocked } from '../systems/vector-reckless.js';

export function renderMacroPlanner(mount, state, transition) {
  // Plan template
  const plan = {
    promo: { frequency: 0, ad_money: 0 },
    music: { source: 'digital', money_invested: 0 },
    knowledge: { source: 'citanje', hours: 0 },
    mixing: { session_length: 0, record_mixtape: false },
    visual: { category: 'none' },
    scene: { mingling_count: 0, atmospheric_count: 0, guest_set: false },
    finance: { sponsor_outreach: false, bookkeeping: false },
    energy: { san: true, joga: false, setnja: false, hobi: false, porodica: false, mirna_nedelja: false }
  };

  function timeUsed() {
    // Quick estimate per vector
    let t = 0;
    // promo
    const promoT = { 0: 0, 1: 5, 3: 10, 5: 15 }[plan.promo.frequency] || 0;
    t += promoT;
    // music
    if (plan.music.money_invested > 0) t += 5 + Math.min(10, Math.floor(plan.music.money_invested / 30));
    // knowledge
    t += Math.max(0, plan.knowledge.hours);
    // mixing
    t += { 30: 5, 60: 10, 120: 18, 240: 25 }[plan.mixing.session_length] || 0;
    // visual
    if (plan.visual.category !== 'none') t += { garderoba: 5, fitness: 8, frizer: 3, fotka: 4 }[plan.visual.category] || 0;
    // scene
    t += (plan.scene.mingling_count || 0) * 8;
    t += (plan.scene.atmospheric_count || 0) * 8;
    if (plan.scene.guest_set) t += 25;
    // finance
    if (plan.finance.sponsor_outreach) t += 5;
    if (plan.finance.bookkeeping) t += 3;
    // energy
    for (const k of ['san', 'joga', 'setnja', 'hobi', 'porodica', 'mirna_nedelja']) {
      if (plan.energy[k]) t += { san: 5, joga: 8, setnja: 6, hobi: 10, porodica: 12, mirna_nedelja: 30 }[k];
    }
    return t;
  }

  function moneyEstimate() {
    let m = 0;
    m -= plan.promo.ad_money;
    m -= plan.music.money_invested;
    if (plan.knowledge.source === 'mentor') m -= 100;
    if (plan.knowledge.source === 'label') m -= 30;
    if (plan.visual.category === 'garderoba') m -= 200;
    if (plan.visual.category === 'frizer') m -= 80;
    if (plan.visual.category === 'fotka') m -= 120;
    m -= (plan.scene.mingling_count || 0) * 60;
    m -= (plan.scene.atmospheric_count || 0) * 25;
    if (plan.energy.joga) m -= 30;
    if (plan.energy.hobi) m -= 20;
    if (plan.energy.porodica) m -= 50;
    return m;
  }

  function build() {
    clearChildren(mount);
    const gig = getCurrentGigScheduled(state);
    const pressure = pressureSignal(timeUsed(), 100);
    const moneyDelta = moneyEstimate();

    mount.appendChild(el('div', { className: 'scene macro-scene' },
      renderHUD(state),
      renderSacrificeBar(state),
      renderTierGrid(state),

      // Weekly summary header
      el('div', { className: 'planner-header' },
        el('h2', null, `Nedelja ${state.week}`),
        gig
          ? el('div', { className: 'gig-indicator' },
              el('span', { className: 'gig-icon' }, '·'),
              el('span', null, 'Zurka ove nedelje.')
            )
          : el('div', { className: 'no-gig' }, 'Nema zurke ove nedelje.'),
        el('div', { className: `pressure-indicator ${pressure.cls}` },
          `Pritisak: ${pressure.label}`
        ),
        el('div', { className: 'money-estimate' }, `Trosak plana: ${moneyDelta >= 0 ? '+' : ''}${moneyDelta} RSD`)
      ),

      // 9 Vector slots
      el('div', { className: 'vectors-grid' },
        // V1 Promo
        vectorPanel('promo', plan, build,
          el('div', null,
            el('label', null, 'Frekvencija: '),
            el('select', {
              onchange: e => { plan.promo.frequency = Number(e.target.value); build(); }
            },
              [0, 1, 3, 5].map(v => el('option', { value: v, selected: plan.promo.frequency === v }, `${v}x/wk`))
            )
          ),
          el('div', null,
            el('label', null, 'Ad budzet: '),
            el('input', {
              type: 'range', min: 0, max: 50, step: 5, value: plan.promo.ad_money,
              oninput: e => { plan.promo.ad_money = Number(e.target.value); build(); }
            }),
            el('span', null, ` ${plan.promo.ad_money} RSD`)
          )
        ),

        // V2 Music
        vectorPanel('music', plan, build,
          el('div', null,
            el('label', null, 'Izvor: '),
            el('select', {
              onchange: e => { plan.music.source = e.target.value; build(); }
            },
              ['digital', 'vinyl', 'soundcloud', 'friend'].map(v =>
                el('option', { value: v, selected: plan.music.source === v }, v)
              )
            )
          ),
          el('div', null,
            el('label', null, 'Budzet: '),
            el('input', {
              type: 'range', min: 0, max: 300, step: 25, value: plan.music.money_invested,
              oninput: e => { plan.music.money_invested = Number(e.target.value); build(); }
            }),
            el('span', null, ` ${plan.music.money_invested} RSD`)
          )
        ),

        // V3 Knowledge
        vectorPanel('knowledge', plan, build,
          el('div', null,
            el('label', null, 'Izvor: '),
            el('select', {
              onchange: e => { plan.knowledge.source = e.target.value; build(); }
            },
              ['citanje', 'podcast', 'label', 'mentor'].map(v =>
                el('option', { value: v, selected: plan.knowledge.source === v }, v)
              )
            )
          ),
          el('div', null,
            el('label', null, 'Sati: '),
            el('input', {
              type: 'range', min: 0, max: 20, step: 1, value: plan.knowledge.hours,
              oninput: e => { plan.knowledge.hours = Number(e.target.value); build(); }
            }),
            el('span', null, ` ${plan.knowledge.hours}h`)
          )
        ),

        // V4 Mixing
        vectorPanel('mixing', plan, build,
          el('div', null,
            el('label', null, 'Sesija: '),
            el('select', {
              onchange: e => { plan.mixing.session_length = Number(e.target.value); build(); }
            },
              [0, 30, 60, 120, 240].map(v =>
                el('option', { value: v, selected: plan.mixing.session_length === v }, v === 0 ? 'preskocim' : `${v} min`)
              )
            )
          ),
          plan.mixing.session_length >= 240
            ? el('div', null,
                el('label', null,
                  el('input', {
                    type: 'checkbox', checked: plan.mixing.record_mixtape,
                    onchange: e => { plan.mixing.record_mixtape = e.target.checked; build(); }
                  }),
                  ' Snimi mixtape'
                )
              )
            : null
        ),

        // V5 Visual
        vectorPanel('visual', plan, build,
          el('div', null,
            el('label', null, 'Kategorija: '),
            el('select', {
              onchange: e => { plan.visual.category = e.target.value; build(); }
            },
              ['none', 'garderoba', 'fitness', 'frizer', 'fotka'].map(v =>
                el('option', { value: v, selected: plan.visual.category === v }, v === 'none' ? 'preskocim' : v)
              )
            )
          )
        ),

        // V6 Scene
        vectorPanel('scene', plan, build,
          el('div', null,
            el('label', null, 'Mingling izlazaka: '),
            el('input', {
              type: 'number', min: 0, max: 5, value: plan.scene.mingling_count,
              onchange: e => { plan.scene.mingling_count = Number(e.target.value); build(); }
            })
          ),
          el('div', null,
            el('label', null, 'Atmospheric hangouts: '),
            el('input', {
              type: 'number', min: 0, max: 3, value: plan.scene.atmospheric_count,
              onchange: e => { plan.scene.atmospheric_count = Number(e.target.value); build(); }
            })
          ),
          el('div', null,
            el('label', null,
              el('input', {
                type: 'checkbox', checked: plan.scene.guest_set,
                onchange: e => { plan.scene.guest_set = e.target.checked; build(); }
              }),
              ' Guest set ovaj put'
            )
          )
        ),

        // V7 Finance
        vectorPanel('finance', plan, build,
          el('div', null,
            el('label', null,
              el('input', {
                type: 'checkbox', checked: plan.finance.sponsor_outreach,
                onchange: e => { plan.finance.sponsor_outreach = e.target.checked; build(); }
              }),
              ' Sponsor outreach'
            )
          ),
          el('div', null,
            el('label', null,
              el('input', {
                type: 'checkbox', checked: plan.finance.bookkeeping,
                onchange: e => { plan.finance.bookkeeping = e.target.checked; build(); }
              }),
              ' Bookkeeping'
            )
          )
        ),

        // V8 Energy
        vectorPanel('energy', plan, build,
          ...[
            ['san', 'San'],
            ['joga', 'Joga'],
            ['setnja', 'Setnja'],
            ['hobi', 'Hobi'],
            ['porodica', 'Porodica'],
            ['mirna_nedelja', 'Mirna nedelja']
          ].map(([k, lbl]) =>
            el('div', null,
              el('label', null,
                el('input', {
                  type: 'checkbox', checked: plan.energy[k],
                  onchange: e => { plan.energy[k] = e.target.checked; build(); }
                }),
                ` ${lbl}`
              )
            )
          )
        ),

        // V9 Reckless — passive, locked or hint
        el('div', { className: 'vector-panel v9' },
          el('div', { className: 'vp-title' }, `${VECTORS.reckless.n} ${VECTORS.reckless.label}`),
          el('div', { className: 'vp-short' }, VECTORS.reckless.short),
          isRecklessUnlocked(state)
            ? el('div', { className: 'reckless-status unlocked' },
                'Otkljucan. Aktivira se u zurci.'
              )
            : el('div', { className: 'reckless-status locked' }, VECTORS.reckless.locked_text)
        )
      ),

      // Commit week + Goto zurka
      el('div', { className: 'planner-cta' },
        bigButton('Zavrsi nedelju', () => {
          state.gigs_this_week = gig ? 1 : 0;
          const log = runWeek(state, plan);
          saveState(state);

          if (gig) {
            transition('micro', { weekLog: log });
          } else {
            transition('recap', { weekLog: log });
          }
        }, 'btn-primary btn-cta')
      ),

      // Pera last-week recap
      state.pera_log.length > 0
        ? peraQuote(state.pera_log[state.pera_log.length - 1].line)
        : null
    ));
  }

  build();
}

function vectorPanel(key, plan, rerenderFn, ...inputs) {
  const v = VECTORS[key];
  return el('div', { className: `vector-panel v-${key}` },
    el('div', { className: 'vp-title' }, `${v.n} ${v.label}`),
    el('div', { className: 'vp-short' }, v.short),
    el('div', { className: 'vp-inputs' }, ...inputs)
  );
}
