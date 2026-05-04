// src/ui.js — Sav DOM rendering za Sudnik (GDD §5, §6, §7, §10)
// DOM-based igra: karte su HTML elementi, UI je HTML/CSS.
// Nema Canvas. Sve se renderuje u #game-root DOM stablu.

import { CONFIG } from './config.js';
import { getEffectiveCardValue } from './precedents.js';

// ─── DOM element reference cache ───────────────────────────────────────────

/** @returns {HTMLElement} */
const el = (id) => document.getElementById(id);

// ─── Phase switcher ─────────────────────────────────────────────────────────

/**
 * Prikazuje odgovarajuću sekciju (fazu) i skriva sve ostale.
 * Faze: 'draw', 'play', 'verdict', 'reputation', 'gameover', 'summary'
 *
 * @param {'draw'|'play'|'verdict'|'reputation'|'gameover'|'summary'} phase
 */
export function renderPhase(phase) {
  const phases = ['draw', 'play', 'verdict', 'reputation', 'gameover', 'summary'];
  const hud = el('hud');
  const hiddenDuringGame = ['gameover', 'summary'];

  phases.forEach(p => {
    const section = el(`phase-${p}`);
    if (section) section.classList.toggle('hidden', p !== phase);
  });

  // HUD je vidljiv samo tokom play faza
  if (hud) {
    hud.classList.toggle('hidden', hiddenDuringGame.includes(phase));
  }
}

// ─── Resources (Masa / Vlast) ────────────────────────────────────────────────

/**
 * Ažurira prikaz Masa i Vlast traka u HUD-u.
 * @param {{masa: number, vlast: number}} resources
 */
export function renderResources(resources) {
  const masaValue = el('hud-masa-value');
  const vlastValue = el('hud-vlast-value');
  const masaBar = el('hud-masa-bar');
  const vlastBar = el('hud-vlast-bar');

  if (masaValue) masaValue.textContent = resources.masa;
  if (vlastValue) vlastValue.textContent = resources.vlast;
  if (masaBar) masaBar.style.width = `${Math.max(0, Math.min(100, resources.masa))}%`;
  if (vlastBar) vlastBar.style.width = `${Math.max(0, Math.min(100, resources.vlast))}%`;
}

// ─── Balance (Vaga) ──────────────────────────────────────────────────────────

/**
 * Ažurira vizuelni prikaz vage u realnom vremenu.
 * Numerička vrednost, traka (-10 do +10), boja zone.
 *
 * @param {number} balanceScore — currentCase.balanceScore
 */
export function renderBalance(balanceScore) {
  const valueEl = el('balance-value');
  const fillNeg = el('balance-fill-neg');
  const fillPos = el('balance-fill-pos');
  const track = el('balance-track');

  // Clamp score na -10..+10 za vizuelni prikaz
  const clamped = Math.max(CONFIG.BALANCE_DISPLAY_MIN, Math.min(CONFIG.BALANCE_DISPLAY_MAX, balanceScore));
  const range = CONFIG.BALANCE_DISPLAY_MAX - CONFIG.BALANCE_DISPLAY_MIN; // 20

  // Ažuriraj numeričku vrednost
  if (valueEl) {
    valueEl.textContent = balanceScore > 0 ? `+${balanceScore}` : `${balanceScore}`;
    if (balanceScore > 0) {
      valueEl.style.color = CONFIG.COLORS.GUILTY; // crvena = krivica
    } else if (balanceScore < 0) {
      valueEl.style.color = CONFIG.COLORS.FREE; // plava = sloboda
    } else {
      valueEl.style.color = '#E8E0D0';
    }
  }

  // Fill za negativnu stranu (slobodan — plava, raste od centra ka levo)
  if (fillNeg) {
    const negPct = clamped < 0 ? (Math.abs(clamped) / (range / 2)) * 50 : 0;
    fillNeg.style.width = `${negPct}%`;
  }

  // Fill za pozitivnu stranu (kriv — crvena, raste od centra ka desno)
  if (fillPos) {
    const posPct = clamped > 0 ? (clamped / (range / 2)) * 50 : 0;
    fillPos.style.width = `${posPct}%`;
  }

  // Pulse animacija na ekstremnim vrednostima
  if (track) {
    track.classList.remove('extreme-guilty', 'extreme-free');
    if (balanceScore >= CONFIG.BALANCE_STRONG_THRESHOLD) {
      track.classList.add('extreme-guilty');
    } else if (balanceScore <= -CONFIG.BALANCE_STRONG_THRESHOLD) {
      track.classList.add('extreme-free');
    }
  }
}

// ─── Case prikaz ─────────────────────────────────────────────────────────────

/**
 * Renderuje opis trenutnog slučaja.
 * @param {Object} caseObj — state.currentCase
 */
export function renderCase(caseObj) {
  const crimeEl = el('case-crime');
  const tagsEl = el('case-tags');
  const descEl = el('case-description');

  if (crimeEl) {
    crimeEl.textContent = caseObj.crimeType.toUpperCase();
  }

  if (descEl) {
    descEl.textContent = caseObj.descriptionTemplate;
  }

  if (tagsEl) {
    const tags = [];

    // Wealth tag
    const wealthLabels = { siromasan: 'Siromašan', srednji: 'Srednji sloj', bogat: 'Bogat' };
    tags.push(`<span class="tag">${wealthLabels[caseObj.suspectWealth] ?? caseObj.suspectWealth}</span>`);

    // Age tag
    const ageLabels = { mlad: 'Mlad', sredovecni: 'Sredovečni', star: 'Star' };
    tags.push(`<span class="tag">${ageLabels[caseObj.suspectAge] ?? caseObj.suspectAge}</span>`);

    // Recidivist tag
    if (caseObj.isRecidivist) {
      tags.push('<span class="tag tag-recidivist">Recidivist</span>');
    }

    // Witness tag
    if (caseObj.hasWitness) {
      tags.push('<span class="tag tag-witness">Svedok prisutan</span>');
    } else {
      tags.push('<span class="tag">Bez svedoka</span>');
    }

    tagsEl.innerHTML = tags.join('');
  }
}

// ─── Hand (karte u ruci) ─────────────────────────────────────────────────────

/**
 * Renderuje karte u ruci igrača.
 * Svaka karta je klikabilna (klik na dugme → KRIV/SLOBODAN zona).
 *
 * @param {Object[]} hand — state.hand
 * @param {Object[]} precedents — state.precedents (za getEffectiveCardValue)
 * @param {Function} onCardPlay — callback(card, direction) gde direction = 'guilty'|'free'
 */
export function renderHand(hand, precedents, onCardPlay) {
  const container = el('hand-container');
  if (!container) return;

  container.innerHTML = '';

  hand.forEach(card => {
    const effValue = getEffectiveCardValue(card, precedents);
    const cardEl = createCardElement(card, effValue, onCardPlay);
    container.appendChild(cardEl);
  });
}

/**
 * Kreira DOM element za jednu kartu.
 * @param {Object} card
 * @param {number} effectiveValue — vrednost uzimajući u obzir presedante
 * @param {Function} onCardPlay
 * @returns {HTMLElement}
 */
export function createCardElement(card, effectiveValue, onCardPlay) {
  const div = document.createElement('div');
  div.className = `card card-${card.type} card-enter`;
  div.dataset.cardId = card.id;

  // Naziv
  const nameEl = document.createElement('div');
  nameEl.className = 'card-name';
  nameEl.textContent = card.name;

  // Tip badge
  const typeEl = document.createElement('div');
  typeEl.className = 'card-type';
  const typeLabels = { dokaz: 'Dokaz', svedok: 'Svedok', zakon: 'Zakon', karakter: 'Karakter' };
  typeEl.textContent = typeLabels[card.type] ?? card.type;

  // Vrednost
  const valueEl = document.createElement('div');
  valueEl.className = 'card-value';
  if (effectiveValue > 0) {
    valueEl.textContent = `+${effectiveValue}`;
    valueEl.classList.add('positive');
  } else if (effectiveValue < 0) {
    valueEl.textContent = `${effectiveValue}`;
    valueEl.classList.add('negative');
  } else {
    valueEl.textContent = '0';
    valueEl.classList.add('zero');
  }

  // Efekat opis (ako postoji)
  let effectEl = null;
  if (card.effect) {
    effectEl = document.createElement('div');
    effectEl.className = 'card-effect';
    const effectDescriptions = {
      'vlast_minus2': 'Vlast −2'
    };
    effectEl.textContent = effectDescriptions[card.effect] ?? card.effect;
  }

  // Dugmad KRIV / SLOBODAN
  const actionsEl = document.createElement('div');
  actionsEl.className = 'card-actions';

  const guiltyBtn = document.createElement('button');
  guiltyBtn.className = 'btn btn-guilty';
  guiltyBtn.textContent = 'KRIV';
  guiltyBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    // Ako je karta u selection mode-u, ignoriši play
    if (div.classList.contains('selection-mode')) return;
    _animateCardPlay(div, () => {
      if (onCardPlay) onCardPlay(card, 'guilty');
    });
  });

  const freeBtn = document.createElement('button');
  freeBtn.className = 'btn btn-free';
  freeBtn.textContent = 'SLOB';
  freeBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (div.classList.contains('selection-mode')) return;
    _animateCardPlay(div, () => {
      if (onCardPlay) onCardPlay(card, 'free');
    });
  });

  actionsEl.appendChild(freeBtn);
  actionsEl.appendChild(guiltyBtn);

  // Presedant label ako je karta presedant
  if (card.precedentId) {
    const labelEl = document.createElement('div');
    labelEl.className = 'card-precedent-label';
    labelEl.textContent = 'PRESEDANT';
    div.classList.add('card-precedent');
    div.appendChild(labelEl);
  }

  div.appendChild(nameEl);
  div.appendChild(typeEl);
  div.appendChild(valueEl);
  if (effectEl) div.appendChild(effectEl);
  div.appendChild(actionsEl);

  return div;
}

/**
 * Animira "odigranu" kartu i poziva callback po završetku.
 * @param {HTMLElement} cardEl
 * @param {Function} callback
 */
function _animateCardPlay(cardEl, callback) {
  cardEl.classList.add('card-played');
  // pointer-events:none već u CSS, koristimo animation duration
  setTimeout(callback, CONFIG.CARD_PLAY_ANIM_MS);
}

// ─── Played cards zona ───────────────────────────────────────────────────────

/**
 * Ažurira prikaz KRIV i SLOBODAN zona sa odigranim kartama.
 * Prikazuje efektivnu vrednost uzimajući u obzir aktivne presedant multiplikatore.
 * @param {Object[]} playedCards — state.currentCase.playedCards
 * @param {Object[]} precedents — state.precedents (za getEffectiveCardValue)
 */
export function renderPlayedZones(playedCards, precedents = []) {
  const guiltyZone = el('zone-guilty');
  const freeZone = el('zone-free');

  if (!guiltyZone || !freeZone) return;

  // Ukloni sve karte ali zadrži zone-label
  const removeCards = (zone) => {
    Array.from(zone.querySelectorAll('.played-card-mini')).forEach(c => c.remove());
  };
  removeCards(guiltyZone);
  removeCards(freeZone);

  playedCards.forEach(card => {
    const mini = document.createElement('div');
    mini.className = `played-card-mini card-type-${card.type}`;

    const nameSpan = document.createElement('span');
    nameSpan.className = 'played-card-name';
    nameSpan.textContent = card.name;

    const effectiveVal = getEffectiveCardValue(card, precedents);
    const sign = effectiveVal >= 0 ? '+' : '';
    const valSpan = document.createElement('span');
    valSpan.className = `played-card-val ${effectiveVal > 0 ? 'positive' : effectiveVal < 0 ? 'negative' : 'zero'}`;
    valSpan.textContent = `${sign}${effectiveVal}`;

    mini.appendChild(nameSpan);
    mini.appendChild(valSpan);

    if (card.direction === 'guilty') {
      guiltyZone.appendChild(mini);
    } else {
      freeZone.appendChild(mini);
    }
  });
}

// ─── Presedanti lista ────────────────────────────────────────────────────────

/**
 * Renderuje listu aktivnih presedanata.
 * @param {Object[]} precedents — state.precedents
 */
export function renderPrecedents(precedents) {
  const list = el('precedents-list');
  if (!list) return;

  list.innerHTML = '';

  if (!precedents || precedents.length === 0) {
    const emptyLi = document.createElement('li');
    emptyLi.className = 'precedent-item';
    emptyLi.style.color = '#444';
    emptyLi.style.fontStyle = 'italic';
    emptyLi.textContent = 'Nema aktivnih presedanata.';
    list.appendChild(emptyLi);
    return;
  }

  precedents.forEach(p => {
    const li = document.createElement('li');
    li.className = `precedent-item${p.casesRemaining === 1 ? ' precedent-expiring' : ''}`;

    const nameSpan = document.createElement('span');
    nameSpan.className = 'precedent-name';
    nameSpan.textContent = `${p.name} — ${p.description}`;

    const countSpan = document.createElement('span');
    countSpan.className = 'precedent-countdown';
    countSpan.textContent = `${p.casesRemaining} sl.`;
    countSpan.title = `Preostalo slučajeva: ${p.casesRemaining}`;

    li.appendChild(nameSpan);
    li.appendChild(countSpan);
    list.appendChild(li);
  });
}

// ─── Verdict animacija ───────────────────────────────────────────────────────

/**
 * Prikazuje kratku animaciju presude pre prelaza na 'reputation' fazu.
 * @param {'guilty'|'free'} verdict
 * @param {Function} onDone — callback po završetku animacije
 */
export function renderVerdictAnimation(verdict, onDone) {
  renderPhase('verdict');

  const flash = el('verdict-flash');
  const textEl = el('verdict-text');

  if (flash && textEl) {
    flash.className = `verdict-flash verdict-${verdict}`;
    textEl.textContent = verdict === 'guilty' ? 'KRIV' : 'SLOBODAN';
  }

  setTimeout(onDone, CONFIG.VERDICT_ANIM_MS);
}

// ─── Discard button ──────────────────────────────────────────────────────────

/**
 * Ažurira stanje "Odbaci i Povuci" dugmeta.
 * @param {boolean} used — da li je već iskorišćeno u ovom slučaju
 */
export function renderDiscardButton(used) {
  const btn = el('btn-discard');
  if (!btn) return;

  btn.disabled = used;
  if (used) {
    btn.title = 'Iskorišćeno za ovaj slučaj';
    btn.textContent = 'Odbaci i Povuci ✓';
  } else {
    btn.title = `Odbaci do ${CONFIG.MAX_CARDS_TO_DISCARD} karte i povuci nove`;
    btn.textContent = 'Odbaci i Povuci';
  }
}

// ─── Game Over ekran ─────────────────────────────────────────────────────────

/**
 * Renderuje Game Over ekran (GDD §10).
 * @param {Object} state — game state
 * @param {string} causeMessage — poruka uzroka (getGameOverMessage())
 */
export function renderGameOver(state, causeMessage) {
  const causeEl = el('gameover-cause');
  const casesEl = el('gameover-cases');
  const masaEl = el('gameover-masa');
  const vlastEl = el('gameover-vlast');
  const lamp = el('gameover-lamp');

  if (causeEl) causeEl.textContent = causeMessage;

  if (casesEl) {
    const casesDone = state.session.caseIndex;
    casesEl.textContent = `Presudio si ${casesDone} od ${CONFIG.TOTAL_CASES} slučajeva.`;
  }

  if (masaEl) {
    masaEl.textContent = state.resources.masa;
    masaEl.style.color = state.resources.masa <= 0 ? CONFIG.COLORS.GUILTY : '#C8C0B0';
  }

  if (vlastEl) {
    vlastEl.textContent = state.resources.vlast;
    vlastEl.style.color = state.resources.vlast <= 0 ? CONFIG.COLORS.GUILTY : '#C8C0B0';
  }

  // Animacija lampice gašenja
  if (lamp) {
    lamp.style.setProperty('--lamp-duration', `${CONFIG.GAMEOVER_LAMP_MS}ms`);
    // Kratka pauza da se CSS primeni pre animacije
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        lamp.classList.add('animating');
        // Dodaj 'off' klasu po završetku
        setTimeout(() => {
          lamp.classList.add('off');
        }, CONFIG.GAMEOVER_LAMP_MS);
      });
    });
  }
}

// ─── Summary (Profil sudnika) ekran ──────────────────────────────────────────

/**
 * Renderuje Completion ekran sa profilom sudnika (GDD §10).
 * Typewriter animacija za tekst profila.
 *
 * @param {Object} state — game state
 * @param {Object} profileTemplate — izabrani template (iz profile.js)
 */
export function renderSummary(state, profileTemplate) {
  const profileTextEl = el('summary-profile-text');
  const casesTotalEl = el('summary-cases-total');
  const verdictsEl = el('summary-verdicts');
  const masaEl = el('summary-masa');
  const vlastEl = el('summary-vlast');
  const topCrimeEl = el('summary-top-crime');
  const precedentsEl = el('summary-precedents');

  // Statistike
  const total = state.stats.totalGuilty + state.stats.totalFree;
  const guiltyPct = total > 0 ? Math.round((state.stats.totalGuilty / total) * 100) : 0;
  const freePct = 100 - guiltyPct;

  if (casesTotalEl) casesTotalEl.textContent = `Ukupno slučajeva: ${total}`;
  if (verdictsEl) verdictsEl.textContent = `Kriv: ${guiltyPct}% | Slobodan: ${freePct}%`;
  if (masaEl) masaEl.textContent = state.resources.masa;
  if (vlastEl) vlastEl.textContent = state.resources.vlast;

  // Najčešći zločin za koji je izrečena krivica
  if (topCrimeEl) {
    const guiltyByCrime = state.stats.guiltyByCrime ?? {};
    const entries = Object.entries(guiltyByCrime).filter(([, v]) => v > 0);
    if (entries.length > 0) {
      entries.sort((a, b) => b[1] - a[1]);
      topCrimeEl.textContent = `Najčešći zločin — krivica: ${entries[0][0]} (${entries[0][1]}×)`;
    } else {
      topCrimeEl.textContent = 'Niko nije proglašen krivim.';
    }
  }

  // Presedanti koji su stvoreni
  if (precedentsEl) {
    const count = (state.stats.precedentsCreated ?? []).length;
    precedentsEl.textContent = `Presedanata stvoreno: ${count}`;
  }

  // Typewriter animacija za profil tekst
  if (profileTextEl && profileTemplate) {
    profileTextEl.textContent = '';
    profileTextEl.classList.add('typewriter-cursor');
    typewriterAnimate(
      profileTextEl,
      profileTemplate.text,
      CONFIG.PROFILE_CHAR_DELAY_MS,
      () => {
        profileTextEl.classList.remove('typewriter-cursor');
      }
    );
  }
}

/**
 * Typewriter animacija: ispisuje tekst karakter po karakter u dati element.
 * @param {HTMLElement} targetEl
 * @param {string} text
 * @param {number} delayMs — ms po karakteru
 * @param {Function} [onDone] — opcionalni callback po završetku
 */
export function typewriterAnimate(targetEl, text, delayMs, onDone) {
  targetEl.textContent = '';
  const chars = text.split('');

  chars.forEach((char, i) => {
    setTimeout(() => {
      targetEl.textContent += char;
    }, i * delayMs);
  });

  if (onDone) {
    setTimeout(onDone, chars.length * delayMs);
  }
}

// ─── Reputation ekran ─────────────────────────────────────────────────────────

/**
 * Popunjava #phase-reputation sekciju sa informacijama o presudi.
 * Poziva se odmah nakon renderPhase('reputation').
 *
 * @param {'guilty'|'free'} verdict — ishod presude
 * @param {number} masaDelta — promena Mase (može biti negativna)
 * @param {number} vlastDelta — promena Vlasti (može biti negativna)
 * @param {string|null} precedentName — naziv novog presedanta, ili null ako nema
 */
export function renderReputation(verdict, masaDelta, vlastDelta, precedentName) {
  // #reputation-title: "KRIV" crvena ili "SLOBODAN" plava
  const title = el('reputation-title');
  if (title) {
    title.textContent = verdict === 'guilty' ? 'KRIV' : 'SLOBODAN';
    title.className = 'reputation-title ' + (verdict === 'guilty' ? 'verdict-guilty' : 'verdict-free');
  }

  // #reputation-deltas: prikaz promene Mase i Vlasti
  const deltasEl = el('reputation-deltas');
  if (deltasEl) {
    const masaSign = masaDelta >= 0 ? '+' : '';
    const vlastSign = vlastDelta >= 0 ? '+' : '';
    deltasEl.innerHTML = `
      <div class="delta-row masa-delta">Masa: ${masaSign}${masaDelta}</div>
      <div class="delta-row vlast-delta">Vlast: ${vlastSign}${vlastDelta}</div>
    `;
  }

  // #precedent-gained: naziv novog presedanta
  const precEl = el('precedent-gained');
  if (precEl && precedentName) {
    precEl.textContent = `Novi presedant: "${precedentName}"`;
    precEl.classList.remove('hidden');
  } else if (precEl) {
    precEl.classList.add('hidden');
  }
}

// ─── Progress ─────────────────────────────────────────────────────────────────

/**
 * Ažurira progress indikator (slučaj X/10) u HUD-u.
 * @param {number} caseIndex — 0-based (0 = prvi slučaj, 9 = deseti)
 * @param {number} totalCases
 */
export function renderProgress(caseIndex, totalCases) {
  const progressEl = el('hud-progress');
  if (progressEl) {
    progressEl.textContent = `Slučaj ${caseIndex + 1}/${totalCases}`;
  }
}

// ─── Event binding ───────────────────────────────────────────────────────────

/**
 * Vezuje KRIV i SLOBODAN dugmad za verdict callback.
 * @param {Function} onVerdict — callback('guilty'|'free')
 */
export function bindVerdictButtons(onVerdict) {
  const guiltyBtn = el('btn-verdict-guilty');
  const freeBtn = el('btn-verdict-free');

  if (guiltyBtn) guiltyBtn.onclick = () => onVerdict('guilty');
  if (freeBtn) freeBtn.onclick = () => onVerdict('free');
}

/**
 * Vezuje "Odbaci i Povuci" dugme.
 * Aktivira selection mode na kartama — igrač selektuje 1–2, pa potvrdi.
 * @param {Function} onDiscard — callback(cardIds: string[])
 */
export function bindDiscardButton(onDiscard) {
  const btn = el('btn-discard');
  if (!btn) return;

  btn.onclick = () => {
    if (btn.disabled) return;

    const container = el('hand-container');
    if (!container) return;

    // Da li smo već u selection mode-u?
    const isSelecting = btn.dataset.selecting === 'true';

    if (!isSelecting) {
      // Aktiviraj selection mode
      btn.dataset.selecting = 'true';
      btn.textContent = 'Potvrdi odbacivanje';
      btn.classList.add('btn-primary');
      btn.classList.remove('btn-secondary');

      // Dodaj selection mode na sve karte u ruci
      const cards = container.querySelectorAll('.card');
      cards.forEach(cardEl => {
        cardEl.classList.add('selection-mode');
        cardEl.style.cursor = 'pointer';

        // Click na kartu = toggle selekcija
        cardEl._discardClickHandler = () => {
          const selected = container.querySelectorAll('.card.selected');
          if (!cardEl.classList.contains('selected') && selected.length >= CONFIG.MAX_CARDS_TO_DISCARD) {
            return; // Maks selektovano
          }
          cardEl.classList.toggle('selected');
        };
        cardEl.addEventListener('click', cardEl._discardClickHandler);
      });
    } else {
      // Potvrdi odbacivanje
      btn.dataset.selecting = 'false';
      btn.classList.remove('btn-primary');
      btn.classList.add('btn-secondary');

      const selectedCards = container.querySelectorAll('.card.selected');
      const cardIds = Array.from(selectedCards).map(c => c.dataset.cardId).filter(Boolean);

      // Ukloni selection mode
      const allCards = container.querySelectorAll('.card');
      allCards.forEach(cardEl => {
        cardEl.classList.remove('selection-mode', 'selected');
        cardEl.style.cursor = '';
        if (cardEl._discardClickHandler) {
          cardEl.removeEventListener('click', cardEl._discardClickHandler);
          delete cardEl._discardClickHandler;
        }
      });

      if (cardIds.length > 0) {
        onDiscard(cardIds);
      }
    }
  };
}

/**
 * Vezuje "Restart" dugme (game over i summary ekrani).
 * @param {Function} onRestart
 */
export function bindRestartButton(onRestart) {
  document.querySelectorAll('.btn-restart').forEach(btn => {
    btn.onclick = onRestart;
  });
}

/**
 * Vezuje "Podeli" dugme na summary ekranu.
 * @param {string} shareText — tekst za clipboard
 */
export function bindShareButton(shareText) {
  const btn = el('btn-share');
  if (!btn) return;

  btn.onclick = () => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(shareText).then(() => {
        _flashButton(btn, 'Kopirano!', 2000);
      }).catch(() => {
        _fallbackCopy(shareText);
        _flashButton(btn, 'Kopirano!', 2000);
      });
    } else {
      _fallbackCopy(shareText);
      _flashButton(btn, 'Kopirano!', 2000);
    }
  };
}

/**
 * Fallback kopiranje u clipboard za starije browsere.
 * @param {string} text
 */
function _fallbackCopy(text) {
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.style.position = 'fixed';
  ta.style.opacity = '0';
  document.body.appendChild(ta);
  ta.select();
  try { document.execCommand('copy'); } catch (e) { /* tiho ignoriši */ }
  document.body.removeChild(ta);
}

/**
 * Privremeno menja tekst dugmeta, pa vraća originalni.
 * @param {HTMLButtonElement} btn
 * @param {string} tempText
 * @param {number} durationMs
 */
function _flashButton(btn, tempText, durationMs) {
  const originalText = btn.textContent;
  btn.textContent = tempText;
  btn.disabled = true;
  setTimeout(() => {
    btn.textContent = originalText;
    btn.disabled = false;
  }, durationMs);
}
