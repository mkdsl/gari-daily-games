# Fix Log — Kluboslavija Pasoš

## Bug 1 — CRITICAL: config.js STORAGE_PREFIX konzistentnost
**Problem:** `claimStamp()` u `state.js` direktno je pisao u localStorage koristeći `safeSet(STORAGE_PREFIX + slug, record)`, duplicirajući logiku koju SDK već ima u `utisniPecat()`. Ovo je rizik za konzistentnost: svaka promena SDK formata zapisa ne bi bila reflektovana u manualnom claim-u.
**Fix:** Situacija A — `config.js` već eksportuje `'pasos_stamp_'` (identično SDK-ovom internom prefiksu), dakle nema key buga. Ipak, `claimStamp()` je refaktorisan da poziva `utisniPecat(slug, { method: 'manual' })` iz SDK-a umesto direktnog `safeSet`, eliminišući duplikaciju. Import dodat: `utisniPecat` pored već postojećeg `imaPecat`.
**Fajlovi:** `games/2026-05-10-cross-event-pasos/src/state.js`

## Bug 2 — MEDIUM: html2canvas CDN bez null-check
**Problem:** `shareScreenshot()` u `share.js` pozivao je `html2canvas(...)` direktno unutar `try/catch`, ali `ReferenceError` na nedefinisanoj globalnoj varijabli nije uhvatljiv na taj način — greška se dešava pre ulaska u try blok, što dovodi do tihog pada bez korisne povratne informacije.
**Fix:** Dodat guard `if (typeof html2canvas === 'undefined')` na početku `shareScreenshot()` pre bilo kakvog await/try bloka. Kreirana je `showShareFallback(msg)` helper funkcija koja prikazuje poruku u `#share-status` elementu (kreira ga ako ne postoji) na 3 sekunde. Ista funkcija se koristi i u catch bloku umesto inline kreiranja elementa.
**Fajlovi:** `games/2026-05-10-cross-event-pasos/src/share.js`

## Bug 3 — MEDIUM: Touch target premali na close dugmetu
**Problem:** `.close-btn` u `ui.css` imao je samo `font-size: 1.1rem` i bez eksplicitnih dimenzija, što ga čini premalom touch metom (ispod WCAG preporučenih 44x44px) na mobilnim uređajima.
**Fix:** Dodate properties na `.close-btn`: `min-width: 44px`, `min-height: 44px`, `padding: 10px`. Svi ostali postojeći stilovi (`position`, `top`, `right`, `background`, `border`, `font-size`, `cursor`, `color`, `line-height`) su zadržani.
**Fajlovi:** `games/2026-05-10-cross-event-pasos/styles/ui.css`
