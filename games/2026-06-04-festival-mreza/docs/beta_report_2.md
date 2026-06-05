# Beta Report 2 — Festival Mreža (iter 2, posle fixova)
**Datum:** 2026-06-05
**Agenti:** Zora Zona + Raša Raštura + Lela Loop

---

## Ukupna ocena: 8.1/10

---

## Verifikacija fixova iz iter 1

### CRITICAL-01 (Coordinator deserialization)
Status: ✅ Fiksovano

Komentar: `loadMacroState` u `src/state.js` (linije 137–152) korektno rekonstruiše pune coordinator objekte. Merge je potpun: `...staticData` prenosi sve statičke property-e (`baseReach`, `portraitColor`, `baseCostMultiplier`, `tier1–5Ability`, itd.), zatim se override-uju sa saved podacima (`id`, `loyalty`, `usedThisCity`). `getLoyaltyTier` i `getActiveAbility` se pozivaju da popune `loyaltyTier` i `activeAbility`. `saveMacroState` ispravno serializuje samo `{id, loyalty, usedThisCity}` — round-trip je konzistentan. Coordinator session reload više ne rezultira broken state-om.

### CRITICAL-02 (renderMacroScreen 60fps)
Status: ✅ Fiksovano

Komentar: `_macroRenderTimer` i `MACRO_RENDER_INTERVAL = 0.5` su deklarisani na linijama 45–46 u `src/main.js`. Game loop (linije 108–116) akumulira `dt` i rebuild `renderMacroScreen` poziva se samo kad timer dostigne 500ms — efektivno max 2fps za HTML rebuild. `#btn-start-event` je pokriven document-level delegatom u `src/input.js` (linije 55–61) koji preživljava rebuild jer je na `document`, ne na zamenjenom DOM elementu. Listener leak je eliminisan — nema višestrukog registrovanja jer document-level handler postoji samo jednom (registrovan pri `initInput`).

### CRITICAL-03/MEDIUM-05 (PromoRecord crash)
Status: ✅ Fiksovano

Komentar: `getCityBuzzSimple` u `src/rendering/macro_renderer.js` (linije 159–180) pravilno implementira guard: `typeof p.currentBuzz === 'function'` pre poziva metode. Inline fallback kalkulacija koristi `p.initialBuzz`, `p.halfLife`, `p.dayPlaced` — sve property-i koji opstaju kroz JSON serializaciju. `promo_investments.filter(p => p.active !== false)` u `loadMacroState` (linija 133) čisti expired promo objekte pre nego što dođu do renderera. TypeError na plain JSON objektima je eliminisan.

### MEDIUM-01 (BPM hint)
Status: ✅ Fiksovano

Komentar: `index.html` linije 119–122 prikazuju `<span class="bpm-hint">ritam muzike</span>` ispod `<span class="bpm-title">BPM</span>` unutar `.bpm-label-col` flex kolone. Inline stilovi (`font-size:9px`, `opacity:0.7`) su adekvatni. Hint je vidljiv bez hover-a — radi na mobilnom.

### MEDIUM-02 (Redirect reason)
Status: ✅ Fiksovano

Komentar: `updateRedirectButtons` u `src/ui.js` (linije 245–273) dinamički kreira `<span class="redirect-reason redirect-reason-{i}">` element ispod svakog disabled dugmeta. `display:block` kad je dugme disabled i postoji `state.reason`, `display:none` kad je enabled. Parent element dobija `position:relative` za apsolutno pozicionirani span na `bottom:-14px`. Jedina napomena: span se kreira samo ako ne postoji (`if (!reasonEl)`) što znači da pri prvom pozivu radi, ali ako se parent element u potpunosti zameni kroz innerHTML rebuild negde van ovog scope-a, span će biti recreated — nije bug, samo edge case koji ne utiče na normalan gameplay.

### MEDIUM-04 (Victory/Prestige dugmad)
Status: ✅ Fiksovano — sa jednom napomenom

Komentar: Document-level delegation u `src/input.js` (linije 43–49) hvata sve `[data-action]` klikove van `#macro-screen`. Victory screen dugmad `data-action="share"` i `data-action="prestige"` su pokrivena — oba se oslanjaju na `_gameState.onShare()` i `_gameState.onPrestige()` koji su definisani u `gameState` objektu u `main.js`. 

`btn-confirm-prestige` **nema** `data-action` atribut — oslanja se na direktan `addEventListener` unutar `renderPrestigeScreen`. To je ispravno ponašanje, nije regression: dugme se renderuje jednom po prestige pozivanju, listener se registruje jednom, nema leak-a jer se prestige screen ne rebuilda u loop-u.

**Napomena — potencijalni MEDIUM (novi):** `btn-confirm-prestige` listener se dodaje svaki put kad se pozove `renderPrestigeScreen` bez prethodnog čišćenja starog listener-a (nema `removeEventListener` niti `{ once: true }`). Ako igrač nekako dobije mogućnost da se prestige screen prikaže više puta u istoj sesiji (npr. korisnik brzo trostruko klikne Prestige Reset dok se ekran renderuje), može doći do višestrukog pozivanja `onSelect` callback-a i višestrukog `executePrestige`. Ovo je **MEDIUM-NEW-01** — nije blocker za release, ali treba fix u sledećoj sesiji.

---

## Novi CRITICAL (uvedeni kroz fix-ove)

Nema novih CRITICAL.

---

## Novi MEDIUM

- **[MEDIUM-NEW-01]** `renderPrestigeScreen` u `src/ui.js` (linija 429) dodaje novi `click` listener na `#btn-confirm-prestige` pri svakom pozivu bez `removeEventListener` ili `{ once: true }`. Ako se prestige screen prikaže više puta u istoj sesiji (mali prozor za race condition), `executePrestige` može biti pozvan višestruko. Fix: dodati `{ once: true }` opciju ili `removeEventListener` pre dodavanja novog. Fajl: `src/ui.js`, linija 429.

---

## Zaključak

**Drži za release uz sitni fix preporuku.**

Sva tri CRITICAL buga su ispravno rešena — nije surface-level patch, radi se o strukturalnim popravkama (round-trip serializacija, throttle + document-level delegation, inline fallback kalkulacija). Svi MEDIUM koji su trebali biti rešeni (01, 02, 04) su rešeni. Novi MEDIUM-NEW-01 (prestige listener accumulation) je low-probability issue koji ne utiče na first-impression ni tipičan gameplay flow — igrač mora namerno pokušati da triggeruje prestige screen više puta brzo da bi osetio problem. Nije blocker.

LOW-01 through LOW-07 ostaju nepromenjen status — relevantni za sledeći pass, ne za release decision.

---

## Finalna ocena vs iter 1

**Smer: gore** — 7.4 → **8.1**

Obrazloženje: Eliminisanjem tri CRITICAL-a igra je prešla iz "može crashovati na reload" u stabilno stanje. UI UX je poboljšan (BPM hint, redirect reasons, funkcionalna victory dugmad). Odbitak od 0.5 od hipotetičnih ~8.6 zbog MEDIUM-NEW-01 prestige listener issue i sedam LOW-ova koji ostaju neadresirani ali su svesno odloženi. Igra je funkcionalna, zabavna i brand-relevantna — sprema se za šef sign-off.
