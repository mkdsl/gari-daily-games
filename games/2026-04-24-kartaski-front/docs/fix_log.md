# Fix Log — Kartaški Front (2026-04-24)

**Beta score:** 6.5/10 | **Fixer:** Gari (Korak 6)

## Bugovi rešeni

### BUG #1 (KRITIČAN) — Weak efekat nikad nije radio
**Fajl:** `src/systems/combat.js` (2 mesta)
**Problem:** `getEffectValue(entity, 'weak') > 0` uvek vraća `false` jer `weak` efekat ima `value=0` u svim definicijama — samo `duration > 0`.
**Fix:** Zamenjen `getEffectValue` sa `getEffectDuration` na oba mesta (linija 66 i 205). Dodat `getEffectDuration` u import.

### BUG #2 (SREDNJI) — HP igrača nije vidljiv u toolbar-u
**Fajl:** `index.html`
**Problem:** `<span id="hp-info">` nije postojao u HTML-u; `updateToolbar` u ui.js ga tražio ali ga nije nalazio. HP vidljiv samo na Canvas traci.
**Fix:** Dodat `<span id="hp-info">❤ 30/30</span>` u toolbar div. Ui.js automatski ažurira vrednost i klase (`hp-stat`, `hp-low` ispod 30%).

## Bugovi koji nisu fiks (false alarm)

### BUG #3 (LAKI) — `btn-inactive` CSS klasa
**Status:** Nije bug. `.btn-inactive` je definisan u `styles/ui.css` (linije 430–434) sa `opacity: 0.35`, `cursor: not-allowed`, `pointer-events: none`. Pored toga, `btnEnd.disabled = !active` takođe aktivira `:disabled` CSS pseudo-klasu. Dugme ispravno izgleda kao disabled tokom enemy turna.

## "Nice to have" — ignorisano (sutra je nov dan)
- screenFlash feedback za odigrane karte
- Onboarding tekst na MAP ekranu
- Gremlin HP/damage buff
