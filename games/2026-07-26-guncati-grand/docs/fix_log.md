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

---

# Post-Beta Iter 2 Fiksevi (2026-07-28)

**Input:** beta_report_2.md (8.5/10, 1 CRITICAL + 1 MEDIUM novi)

## CRITICAL #3 — gcBalance se nikad ne puni između nedelja

**Fajl:** `src/systems/progression.js` — `advanceWeek()` setState poziv
**Problem:** `weekRevenue` se dodavao samo u `totalRevenue` (kumulativna statistika). `gcBalance` nikad nije punjeno — igrač ostajao na 0 GC od nedelje 2. Makro layer zabrtvljen.
**Fix:** Dodat `gcBalance: CONFIG.WEEKLY_BUDGET + weekRevenue` u setState poziv. Svake nedelje igrač dobija fiksni budžet (500 GC) + prihod od zgrada/marketinga te nedelje.

## MEDIUM #2 — Budget panel prikazuje hardkodovanih "500 GC"

**Fajl:** `src/ui/macro_ui.js`
**Problem:** `buildMacroHTML()` imao statički `500 GC` u `#budget-display` spanু. `updateMacroTotals()` nije ažuriral `#budget-display`.
**Fix A:** HTML template promenjen na `${formatGC(state.gcBalance)} GC` za ispravan initial render.
**Fix B:** `updateMacroTotals()` dobio blok koji ažurira `#budget-display` pri svakom slider eventu.

## LOW (za patch_queue — nije rešavano u ovom pass-u)
- Dupli poziv `checkVolunteerUnlocks` (ui.js + progression.js)
- Week 2 onboarding tekst "Ana se priključuje!" pogrešan (Ana već prisutna)
- DJ Transition dugme ostaje enabled posle smene
- `applyAllocationEffects()` direktna mutacija state objekta
- Finale grid 3-kolone na 500-900px ekranima (finali breakpoint)

---

# Post-Beta Iter 3 Fiksevi (2026-07-31)

**Input:** beta_report_3.md (7.5/10, 1 CRITICAL + 1 MEDIUM[false positive])

## CRITICAL #4 — Finale revenue se dvaput uračunava u final score

**Fajl:** `src/systems/scoring.js` — `calcFinalScore()`, linja 19
**Problem:** `endFinale()` dodaje `finaleRevenue` u `state.totalRevenue` pre pozivanja `_onFinaleEnd` callback-a. Zatim `calcFinalScore()` (pozvano u `_onFinaleEnd`) ponovo dodaje `finale.revenue` na `totalRevenue` — duplo računanje. Igač sa 8000 GC finale prihoda dobijao je `totalRev = seasonRevenue + 8000 + 8000` — score karta bila netačna.
**Fix:** U `calcFinalScore()`, linja 19: `totalRev` se sada računa samo iz `state.totalRevenue` (koja već sadrži finale prihod). Uklonjeno `+ (finale?.revenue || 0)`.

## MEDIUM #3 — Verifikovano: FALSE POSITIVE

**Tvrdnja iz beta_report_3.md:** "Nova Sezona" dugme ne resetuje aktivni save.
**Verifikacija:** `main.js` ima `document.addEventListener('click', _handleMenuActions, { capture: true })`. Ovaj capture listener, koji se izvršava PRE svih bubling handlera, poziva `createInitialState()` + `setState(fresh)` + `saveState()` za svaki klik na `#btn-new`. State je pravilno resetovan pre `navigateTo('MACRO')` u ui.js handleru. Nema buga.
