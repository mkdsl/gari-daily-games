# Beta Report — Ekipa Noći
**Datum:** 2026-05-31  
**Iteracija:** 2 (post-fix)  
**Beta Trio ocena:** 8.5 / 10

## CRITICAL bugovi iz iter 1 — status

- [✅ REŠENO] `ROLE_LABELS` nije bio exportovan iz `config.js` — export postoji na kraju fajla, pravilno mapira sve 5 rola.
- [✅ REŠENO] `advanceDraftRole()` pozivan u `input.js` (dupliranje) — fajl ne sadrži nijedan poziv; advance je isključivo u `main.js` draft loopu.
- [✅ REŠENO] `waitForEvent` bez timeoutа — timeout je 300 000 ms (5 min) sa tihim `resolve()` fallbackom, ne baca grešku.
- [✅ REŠENO] `runCrewUpdate` koristio `card.title`/`card.label` — sada koristi `card.name` i `ROLE_LABELS[card.role]`.
- [✅ REŠENO] `generateFinalePreferredTags` pozivana kroz wrapper koji nije postojao — poziva se direktno; guard `if (!state.finale_preferred_tags)` sprečava duplu inicijalizaciju.
- [✅ REŠENO] Synergy log koristio `e.description` umesto `e.flavor` — izraz je `e.flavor || e.description` (graceful fallback).
- [✅ REŠENO] `codex.js` koristio `unlock_xp` — koristi `card.locked_until_xp` na oba mesta (sort i overlay).
- [✅ REŠENO] `phase_display.js` koristio `card.description` — preview koristi `card.special`.
- [✅ REŠENO] `showStinger` bez fallbacka — `setTimeout` od 600 ms čisti listener i poziva `onDone` ako `animationend` ne okine.
- [✅ REŠENO] `#screen-draft { display: none }` blokiralo draft screen — pravilo ne postoji; screen se kontroliše isključivo `.screen--active` / `.screen--hidden` klasama.
- [✅ REŠENO] Nedostajao `prefers-reduced-motion` — media query postoji u `game.css`, gasi sve animacije i tranzicije.
- [✅ REŠENO] Nedostajao mobilni breakpoint za karte — `@media (max-width: 440px)` u `ui.css` skalira `.card` na 110×160 px.

## Nova CRITICAL/MEDIUM pitanja (ako ih ima)

- [MEDIUM] `generateFinalePreferredTags` se poziva dva puta pri startu prve runde: jednom bezuslovno u `startGame()` i jednom (s guardom) u `runDraftPhase()` za `eventIndex === 4`. Guard sprečava stvarni problem, ali redudantan poziv u `startGame` može zbuniti čitaoce i stvara kratkotrajan višak state-a; preporučuje se uklanjanje poziva iz `startGame`.

## LOW iz iter 1 koji ostaju (samo nabroj, bez opisa)

- Nema otvorenih LOW stavki iz iter 1 — sve identifikovane LOW tačke su obuhvaćene ovim fix pass-om ili su prethodno zatvorene.

## Finalna ocena: Objavi uz napomenu

Svi CRITICAL bugovi su potvrđeno rešeni; igra je stabilna i igriva na desktopu i mobilnom. Pre sledećeg iterativnog release-a preporučuje se uklanjanje redudantnog `generateFinalePreferredTags` poziva iz `startGame` kako bi se zadržala čistoća orkestracionog toka.
