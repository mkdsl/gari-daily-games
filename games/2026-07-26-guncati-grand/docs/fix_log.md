# Fix Log — Guncati Grand (Post Beta Iter 1)
**Datum:** 2026-07-28
**Fixer:** Jova jQuery
**Input:** beta_report.md (7.0/10, 2 CRITICAL + 1 MEDIUM)

---

## CRITICAL #1 — require() u btn-new click handleru

**Fajl:** `src/ui/ui.js` linija ~121
**Problem:** `const { clearSave } = require('../state.js')` unutar btn-new click callback-a. `require` ne postoji u browser ESM → ReferenceError pri prvom kliku "Nova Sezona". Korisnik nije mogao startovati igru.
**Fix:** Uklonjena `require()` linija i `startNewGame()` poziv. Handler sada samo poziva `navigateTo('MACRO')`. Stanje igre ispravno setuje `main.js` capture listener koji se izvršava pre ovog handler-a.

---

## CRITICAL #2 — require() u startNewGame()

**Fajl:** `src/ui/ui.js` linija ~250
**Problem:** `const { createInitialState } = require('../state.js')` kao prva linija `startNewGame()`. Crash pre dinamičkog `import()` poziva → Score ekran je bio mrtva krajnja tačka (ni "Nova Sezona" ni "Prestige Reset" nisu radili).
**Fix:** `startNewGame()` svedena na `navigateTo('MENU')`. `score_ui.js` već poziva `clearSave()` i `prestigeReset()` pre poziva callback-ova — `startNewGame()` samo treba da navigira.

---

## MEDIUM #1 — initAudio() nikad nije pozvan

**Fajl:** `src/main.js`
**Problem:** `audio.js` eksportuje `initAudio()` ali je nikad niko ne poziva. `_ctx` je null tokom cele sesije → nula zvuka (ambijent, SFX, DJ hype ramp).
**Fix:** Dodat `import { initAudio } from './audio.js'` u main.js. Dodat one-shot click listener: `document.addEventListener('click', () => { initAudio(); }, { once: true })` — inicijalizuje Web Audio Context na prvoj korisničkoj interakciji (zahtevano browser autoplay policy).

---

## BONUS — guncati:ready event nije bio dispatch-ovan

**Fajl:** `src/main.js`
**Problem:** `index.html` sluša `guncati:ready` event za skrivanje loading screen-a, ali event nikad nije bio dispatch-ovan → korisnik čeka 4-second fallback timeout pri svakom učitavanju.
**Fix:** `window.dispatchEvent(new CustomEvent('guncati:ready'))` dodat odmah posle `navigateTo('MENU')` u `main()` funkciji.

---

## Preostali LOW (za sledeći pass / patch_queue)
- `modals.js:31` — inline `onclick="closeModalGlobal()"` handler (fragilan, nije CSP-kompatibilno)
- `main.js` dead if/else grane u `hasSave` bloku (identičan kod u obe grane)
