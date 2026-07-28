# Beta Report — Guncati Grand (Iter 2)
**Datum:** 2026-07-28
**Beta score iter 2:** 8.5/10

---

## Verifikacija fixeva (iz beta_report.md)

- [FIX VERIFIED] **CRITICAL #1:** `src/ui/ui.js` linja 120–122 — btn-new click handler poziva `navigateTo('MACRO')`, nema `require()`. Ispravno.
- [FIX VERIFIED] **CRITICAL #2:** `src/ui/ui.js` linja 248–250 — `startNewGame()` poziva `navigateTo('MENU')`, nema `require()`. Ispravno.
- [FIX VERIFIED] **MEDIUM #1:** `src/main.js` linja 125 — `document.addEventListener('click', () => { initAudio(); }, { once: true });` postoji i korektno inicijalizuje audio na prvom kliku.
- [FIX VERIFIED] **BONUS:** `src/main.js` linja 58 — `window.dispatchEvent(new CustomEvent('guncati:ready'))` se poziva nakon `navigateTo('MENU')` unutar `main()`. Ispravno.

---

## Novi CRITICAL bugovi

### CRITICAL #3 — `gcBalance` se nikad ne puni između nedelja (src/systems/progression.js)

**Opis:** `advanceWeek()` (linja 17–90) računa `weekRevenue` ali ga dodaje ISKLJUČIVO u `totalRevenue` (kumulativna statistika, linija 75). `gcBalance` se ne puni nedeljnim prihodom niti novim WEEKLY_BUDGET iznosom. U isto vreme, `applyAndContinue()` u `src/ui/macro_ui.js` (linja 268–274) deduktuje `state.allocation` spending iz `gcBalance`, a `resolveBuildingUpgrade()` u `src/systems/progression.js` (linja 174–176) deduktuje cene zgrada iz `gcBalance`.

**Efekat:** Igrač počinje sa `CONFIG.WEEKLY_BUDGET = 500 GC`. Posle nedelje 1, `gcBalance` pada na ostatak (ili 0 ako su potrošili sve). `advanceWeek` nikad ne vraća GC nazad u balans — ni prihod, ni novi nedeljni budžet. Od nedelje 2 pa do kraja, igrač ima 0 (ili minimalni ostatak) GC za alokaciju. Ceo makro sloj (budget alokacija, nadogradnje zgrada) je efektivno zaključan. **Igra se ne može igrati posle nedelje 1.**

**Fajl:** `src/systems/progression.js`, `setState()` poziv, linja 73–86 — nedostaje `gcBalance` update.

**Predloženi fix:** U `advanceWeek`, dodati u `setState()` poziv:
```javascript
gcBalance: CONFIG.WEEKLY_BUDGET + weekRevenue,
```
ili (ako model uključuje prenošenje ostatka):
```javascript
gcBalance: (state.gcBalance || 0) + weekRevenue + CONFIG.WEEKLY_BUDGET,
```
Ovde treba tim odluku: da li se nepotrošeni GC prenosi (carry-over) ili se svaka nedelja kreće od fiksnih 500 + prihod.

---

## Novi MEDIUM bugovi

### MEDIUM #2 — Budget panel prikazuje hardkodovanih "500 GC" (src/ui/macro_ui.js)

**Opis:** `buildMacroHTML()` (linja 77) postavlja `<span id="budget-display">500 GC</span>` statički. `updateMacroTotals()` (linja 276–302) nikad ne ažurira `#budget-display` — samo ažurira `#budget-remaining`. Podnaslov ekrana (`linja 69`) ispravno prikazuje `${state.gcBalance} GC`, ali to je drugačiji element.

**Efekat:** Prikaz "Budžet: 500 GC" u budget panelu uvek ostaje na 500, čak i kad `gcBalance` pada. Igrač vidi kontradiktornu informaciju — podnaslov kaže npr. "Raspodeli 0 GC" ali panel kaže "Budžet: 500 GC".

**Fajl:** `src/ui/macro_ui.js`, linja 77.

**Predloženi fix:** U `updateMacroTotals()`, dodati:
```javascript
const budgetEl = container.querySelector('#budget-display');
if (budgetEl) budgetEl.textContent = formatGC(state.gcBalance);
```
I u `buildMacroHTML()`, linja 77 promeniti na:
```html
<span class="budget-total" id="budget-display">${formatGC(state.gcBalance)}</span>
```

---

## Novi LOW (za patch_queue)

1. **LOW — Dupli poziv `checkVolunteerUnlocks`:** U `renderMicroScreen()` (`src/ui/ui.js`, linja 163) i unutar `advanceWeek()` (`src/systems/progression.js`, linja 55) isti poziv se izvršava dva puta po nedelji. Outer poziv se koristi za UI prikaz (modali za join), inner za state update. Redundantan kod koji može stvoriti konfuziju pri budućim izmenama. Nema runtime efekta jer oba poziva vraćaju iste volontere.

2. **LOW — Week 2 onboarding pogrešan tekst:** `showOnboarding(2, ...)` u `src/ui/modals.js` (linja 86–110) prikazuje "Ana se priključuje!" i quote, ali Ana je već dodata u `_handleMenuActions` (`src/main.js`, linja 120). Tekst "se priključuje" zbunjuje igrača koji već vidi Anu od nedelje 1.

3. **LOW — DJ Transition dugme ostaje enabled posle smene:** `bindFinaleEvents()` u `src/ui/finale_ui.js` (linja 192–203) poziva `updateTransitionButton({ pendingTransition: false })` bez `totalSlots`/`currentSlot`. U `else` grani (linja 235–240): `finaleState.totalSlots` je `undefined`, pa `btn.disabled = false || false = false`. Dugme ostaje enabled do sledećeg `pendingTransition` eventa. Klik ne radi ništa (proverava `_transitionPending`) ali vizuelno zbunjuje.

4. **LOW — `applyAllocationEffects()` direktno mutira state objekat:** `src/systems/economy.js` (linja 98–109) direktno menja `state.seasonMarketingSpent` i `state.seasonCrowdCap` na objektu koji dobija kao parametar. Pošto `getState()` vraća direktnu referencu na `_state`, ovo radi u praksi, ali zaobilazi `setState()` pattern i može prouzrokovati teške bugove pri refaktorisanju.

5. **LOW — Mobile: Finale layout se ne gubi lako na malim ekranima:** `finale-body` grid (base.css, linja 168–172) je `240px 1fr 200px`. Na iPhone SE (375px širine), kolaps na single column na 900px je dobar, ali `240px` leva kolona na npr. 500px ekranu ne kolapsira (breakpoint tek na 900px). Između 500px i 900px, finale je pritisnuti 3-kolonski grid. Preporučiti `@media (max-width: 640px)` breakpoint za finale-body.

---

## Zaključak

**Verifikacija:** Sva 4 fijxa iz iter 1 su potvrđena — oba CRITICAL-a eliminisana, initAudio i guncati:ready event ispravni.

**Novi nalazi:** Jedna nova CRITICAL (gcBalance nikad ne raste, igra puca posle nedelje 1), jedna nova MEDIUM (hardkodovani budget prikaz). Pet LOW-a za patch_queue.

**Auto-release gate: NE (score 8.5/10, 1 novi CRITICAL)**

Sledeći korak: Jova rešava CRITICAL #3 (gcBalance replenishment u `advanceWeek`) i MEDIUM #2 (budget display u `updateMacroTotals`). Nakon fix-a, gate se ponovo proverava.
