// =============================================================================
// scenes/week-recap.js — End-of-week recap (deltas + Pera + next)
// =============================================================================
import { el, clearChildren } from '../util.js';
import {
  renderHUD, renderSacrificeBar, renderTierGrid,
  bigButton, panel, peraQuote, deltaLine, infoLine
} from '../ui.js';
import { saveState, isSeasonOver } from '../state.js';
import { getPeraNudge, getDrainNudges } from '../systems/pera-period.js';

export function renderWeekRecap(mount, state, transition) {
  // Find latest week log
  const log = state.week_log[state.week_log.length - 1];
  if (!log) {
    mount.appendChild(el('div', null, 'Greška: nema log-a. Vraća te na splash.'));
    setTimeout(() => transition('splash'), 1500);
    return;
  }
  const pre = log.pre;
  const post = log.post;

  // Pera nudge — generic week end + drain nudges
  const mainLine = getPeraNudge(state, 'week_end_generic');
  const drainNudges = getDrainNudges(state, log.drainDeltas);
  saveState(state);

  // Cascade events
  const seasonOver = isSeasonOver(state);

  mount.appendChild(el('div', { className: 'scene recap-scene' },
    renderHUD(state),
    renderSacrificeBar(state),

    el('h2', null, `Rezime nedelje ${log.week}`),

    panel('Promene',
      deltaLine('Znanje', pre.stats.knowledge, post.stats.knowledge),
      deltaLine('Miks', pre.stats.mixing, post.stats.mixing),
      deltaLine('Izgled', pre.stats.visual, post.stats.visual),
      deltaLine('Mreža', pre.stats.network, post.stats.network),
      deltaLine('Prepoznatljivost', pre.stats.recognizability, post.stats.recognizability),
      deltaLine('Reputacija', pre.stats.reputation, post.stats.reputation),
      deltaLine('Telo', pre.sacrifice.health, post.sacrifice.health, '%'),
      deltaLine('Odnosi', pre.sacrifice.odnosi, post.sacrifice.odnosi, '%'),
      deltaLine('Normalnost', pre.sacrifice.normalnost, post.sacrifice.normalnost, '%'),
      deltaLine('Novac', pre.money, post.money, ' RSD')
    ),

    // Cascade events
    log.cascadeEvents.length > 0
      ? panel('Kaskadni događaji',
          ...log.cascadeEvents.map(ev => el('div', { className: 'cascade-event' },
            el('strong', null, ev.type), ' — ', ev.label
          ))
        )
      : null,

    // Reputation events triggered
    state.reputation_events.length > 0 && state.reputation_events[state.reputation_events.length - 1].week === log.week
      ? panel('Reputacijski događaj',
          el('div', null, state.reputation_events[state.reputation_events.length - 1].label)
        )
      : null,

    // Paths progress
    log.pathsAchieved.length > 0
      ? panel('Putevi koje pratiš',
          ...log.pathsAchieved.map(p => el('div', { className: 'path-tag' }, p))
        )
      : null,

    // Pera
    peraQuote(mainLine),
    ...drainNudges.map(d => peraQuote(d.line)),

    // Next button
    seasonOver
      ? bigButton('Vidi finale', () => transition('finale'), 'btn-primary btn-cta')
      : bigButton(`Idi na nedelju ${state.week}`, () => transition('macro'), 'btn-primary btn-cta')
  ));
}
