# Fix Log — Crew Recruiter: Izgradi Ekipu
**Datum:** 2026-08-17
**Beta iter:** 1 → 2

## Ispravljeno

### [CRITICAL] pointer-events na resolve-overlay (ui.css)
**Fajl:** `styles/ui.css`, linija 331
**Problem:** `#resolve-overlay` je imao `pointer-events: none`, što je propuštalo klikove kroz overlay na elemente ispod (slotovi, akcijsko dugme) tokom resolve faze. Korisnik je mogao slučajno pokrenuti akcije dok se prikazuje resolve animacija.
**Fix:** `pointer-events: none` → `pointer-events: auto`. Overlay sada blokira sve klikove dok je vidljiv. Guard `state.gamePhase === 'resolve'` u main.js sprječava double-resolve kao backup, ali overlay sada primarno blokira UX probleme.

---

### [CRITICAL] aria-live screen reader spam (ending-screen.js)
**Fajl:** `src/ui/ending-screen.js`
**Problem:** `.ending-score-wrap` je imao `aria-live="polite"` i `aria-label` direktno na kontejneru. `aria-live` region koji prima promjene `textContent` svakog frame-a rAF animacije (60fps × 1.5s = ~90 announcements) izaziva screen reader spam — TalkBack/VoiceOver izgovara svaki frame, što je nečitljivo i uznemiravajuće za korisnike.
**Fix:**
1. Uklonjen `aria-live="polite"` i `aria-label` sa `.ending-score-wrap` diva.
2. Dodan skriveni `<span class="sr-only" id="score-sr-announce"></span>` unutar wrappera, van animiranog `#score-counter` spana.
3. `animateCounter()` dobio opcionalni peti parametar `srOnly` (HTMLElement). Kada animacija završi (`progress >= 1`), postavlja `srOnly.textContent = "Vibe Score: N od 100"` — jedan announcement po završetku.
4. `showEndingScreen()` selektuje `#score-sr-announce` i prosljeđuje ga `animateCounter()`.

`.sr-only` klasa već postoji u `styles/base.css` (linija 61) — nije dodavana ponovo.

---

### [MEDIUM] ending-card overflow + aspect-ratio (ui.css)
**Fajl:** `styles/ui.css`, linija 578-594
**Problem:** `.ending-card` je imao `aspect-ratio: 1 / 1` i `overflow: hidden`. Na telefonima sa uvećanim fontom ili accessibility zoom-om, sadržaj je prelazio visinu kvadrata i bio isječen — nisu bili vidljivi CTA tekst, best score red i share/restart dugmad.
**Fix:**
- `aspect-ratio: 1 / 1` → `min-height: 320px` — card sad raste sa sadržajem umjesto da ga siječe.
- Uklonjen `overflow: hidden` — sadržaj više ne može biti clipped. Flex column layout i `gap` obezbjeđuju uredno slaganje.

---

### [MEDIUM] Tutorial korak za Vibe Score (ui/tutorial.js)
**Fajl:** `src/ui/tutorial.js`
**Problem:** Tutorial nije objašnjavao Vibe metar — korisnici nisu znali šta smanjuje score (prazni slotovi, niska power karte, zamjene) niti koji je cilj (80+).
**Fix:** Dodan četvrti STEPS entry:
```js
{
  title: 'Korak 4 — Vibe Score',
  text:  'Tvoj Vibe Score raste po svakoj rundi. Prazni slotovi, niska snaga karte ili prečeste zamjene smanjuju ga. Cilj: 80+ za legendaran nastup!'
}
```
Progress indikator u tutorialu ("1 / 3" → "1 / 4") se automatski ažurira jer koristi `STEPS.length`.

---

### [LOW] maybShowTutorial → maybeShowTutorial typo (tutorial.js + main.js)
**Fajlovi:** `src/ui/tutorial.js` (export), `src/main.js` (import + poziv)
**Problem:** Ime funkcije je imalo typo (`maybShow` umjesto `maybeShow`). Igra je radila jer su i export i import koristili isto pogrešno ime, ali je bilo konfuzno i potencijalno problema za buduće maintainere ili rename-ove.
**Fix:** Preimenovano u oba fajla:
- `tutorial.js`: `export function maybShowTutorial` → `export function maybeShowTutorial`
- `main.js`: `import { maybShowTutorial }` → `import { maybeShowTutorial }` i poziv `maybShowTutorial(` → `maybeShowTutorial(`

---

## Nije mijenjano (verifikovano)

- **hand clearance u `performDraw()` (main.js)** — ispravan. `state.graveyard.push(...state.hand)` pa `state.hand = []` radi explicitni clear prije svakog draw-a. Nema rizika od duplikata u ruci između rundi.
- **`pointer-events: none` na `#toast`** — namjerno (toast je non-interactive info element, propuštanje klikova ispod je željeno ponašanje dok se prikazuje).

---

## Preostaje za Beta iter 2

- Keyboard drag via sintetički PointerEvent — provjera cross-browser kompatibilnosti
- HOF placeholder za neulogovane korisnike (prazna lista pri prvom pokretanju)
- `slot-label` font-size 0.58rem može biti premalo na low-DPI ekranima (LOW)
