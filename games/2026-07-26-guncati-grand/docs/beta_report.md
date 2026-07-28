# Beta Report — Guncati Grand (Iter 1)
**Datum:** 2026-07-28
**Testeri:** Zora UX + Raša tech + Lela engagement
**Beta score:** 7.0/10

---

## CRITICAL bugovi (blokeri)

- [CRITICAL] `require()` u #btn-new click handleru — `src/ui/ui.js:121`, redosled: destruktura `const { clearSave } = require('../state.js')` se izvršava pre `startNewGame()`. `require` ne postoji u browser ES6 modulu → ReferenceError odmah pri kliku "Nova Sezona" iz MENU ekrana. Korisnik vidi beli ekran/zamrznutu igru, nova sezona se nikad ne pokreće iz menija.

- [CRITICAL] `require()` u `startNewGame()` funkciji — `src/ui/ui.js:250`, isti pattern: `const { createInitialState } = require('../state.js')` je prva linija funkcije i crashuje pre nego što dinamički `import()` na liniji 251 dobije šansu. `startNewGame()` je jedini izlaz iz Score ekrana (callbacks `onNewGame` i `onPrestige` oba pozivaju ovu funkciju, score_ui.js:43–44). Posledica: korisnik koji dođe do kraja igre ne može pokrenuti novu rundu ni prestige reset — Score ekran je mrtva krajnja tačka.

---

## MEDIUM bugovi (oštećuju iskustvo)

- [MEDIUM] `initAudio()` se nikad ne poziva — `src/main.js` nema import ni poziv `initAudio`; `src/audio.js` eksportuje `initAudio()` ali ga ništa ne calluje. Rezultat: `_ctx` ostaje `null` tokom cele sesije, sve audio metode imaju guard `if (!_enabled || !_ctx) return` pa molče bez errora. Ceo ambijentalni sloj (menu, macro, micro, finale, score), svi SFX-ovi (dj_transition_good/bad, event_trigger, result_arpeggio) i Web Audio generation su nefunkcionalni. Spec iz CLAUDE.md: "Audio default: DA". Igra je playable ali u potpunoj tišini.

---

## LOW (log za sledeći pass)

- [LOW] `clearSave` destrukturisano iz require() na `ui.js:121` ali se nikad ne koristi u callback-u (jedini poziv je `startNewGame()` bez argumenata) — mrtav import koji je i izvor CRITICAL #1.
- [LOW] `createInitialState` destrukturisano iz require() na `ui.js:250` ali se nikad ne koristi u `startNewGame()` funkciji — mrtav import, izvor CRITICAL #2.
- [LOW] `modals.js:31` — `onclick="closeModalGlobal()"` inline HTML handler; radi jer `window.closeModalGlobal` se setuje odmah u `showModal()`, ali je fragilan obrazac (race condition ako se DOM klonira pre seta, nije CSP-kompatibilno za striktne headere).
- [LOW] `main.js:48-55` — oba if/else grana (`hasSave` i `!hasSave`) imaju identičan kod `navigateTo('MENU')`, if-else blok je efektivno prazan. Nije bug ali je zbunjujući.
- [LOW] `ui.js:120-128` — `_handleMenuActions` u main.js (capture phase) ispravno setuje inicijalni state pre nego što ui.js handler crashuje, ali ova zavisnost na redosledu event faza je nevidljiva i krhka.

---

## UX (Zora)

First impression je formalno blokiran: korisnik ne može ući u igru putem "Nova Sezona" jer require() greška sprečava tranziciju. Dizajn MENU ekrana je clean — Guncati brend je prepoznatljiv, tagline je jasan, layout nije komplikovan. `renderMenuScreen` gradivo (hero sa logoom, dugmad, story tekst, footer brand) je vizuelno konzistentno. Onboarding modali (N1/N2/N3) su implementirani sa step-card strukturom koja dobro vodi kroz 3 mehanike. Problem je što do njih nikad ne dođe u normalnom toku. Kada se CRITICAL fiksuju, first 5 minuta (Nedelja 1: alokacija budžeta → onboarding modal → raspoređivanje Ana → week result → Nedelja 2) je u kodu prisutan i logičan. Macro slider layout (4 kategorije sa min/max labelama i preview-om) i Micro volunteer grid (klik volontera → klik zadatka) su intuitivni. Mobile: `overflow-x: hidden` i `max-width: 1200px` sa `min-height: 100dvh` su OK.

---

## Tech (Raša)

Dva `require()` bugged poziva su jedini runtime-breaking problemi — ostatak koda je čist ES6 modul sistem. Dinamički `import()` na ui.js:251 je ispravan obrazac i koristio bi se da se prevazilazi require(). Finale simulacija (`_tick` → requestAnimationFrame loop) ima `dt` cap na 100ms što sprečava spiral pri visibility change. State management je čist (immutable `setState` + `getState` pattern). `autoSave` + `loadState` + `saveState` lanac je prisutan i pozvan na pravim mestima. Checkpoint sistem postoji. Nema beskonačnih petlji ni memory leak-ova u pregledanom kodu. Audio nedostatak (`initAudio()` ne callovan) je jedini sistemski propust van require() bugova — Web Audio Context Autoplay Policy zahteva user gesture za inicijalizaciju što `initAudio` poštuje, ali nikad nije pozvan. Preporučeni fix: dodati `initAudio()` poziv unutar prvog user click event-a u `main.js` (zajedno sa `AudioContext.resume()` koji se već eksportuje iz audio.js).

---

## Engagement (Lela)

Koncept je solidan i emotivno rezonira sa Guncati brendom — Tom Sawyer mehanika (WB > 60% = besplatni volonteri) je originalna i ima potencijal za "aha moment". Prestige loop sa reputation carry-over je dobro osmišljen za replay. Finale kao real-time 15-min simulacija DJ-hype/crowd-mood je autentičan za Kluboslavija kontekst. Međutim, emocionalna kriva ne može biti ocenjena jer igra ne startuje — sve je teorijsko u ovoj iteraciji. Score screen je bogat (achievements, score breakdown, narrative, reputation gain, next prestige threshold) što znači da end-game ima motivacionu vrednost. Kad se CRITICAL bugovi fiksuju, prva sesija treba da pruži: onboarding modal → alokacija → vibe zadataka → WB rast → finale kao klimaks. Pacing po nedelji deluje razuman (macro + micro = 2 aktivne odluke, result modal kao feedback).

---

## Preporuka

**Idi na fix.**

Dva CRITICAL bugged poziva su locirani u istom fajlu (`src/ui/ui.js`) na linijama 121 i 250. Fix je minimalan: zameniti oba `require(...)` sa varijablama koje su već importovane na vrhu fajla (linija 3 importuje `{ getState, setState }` iz state.js; treba dodati `clearSave, createInitialState` u isti statički import). Audio fix: dodati `import { initAudio } from './audio.js'` u `main.js` i pozvati `initAudio()` u prvom user click handleru ili kao deo `main()` async init sekvence. Procenjena veličina fixa: ~5 linija koda, 1–2 modula (ui.js + main.js).
