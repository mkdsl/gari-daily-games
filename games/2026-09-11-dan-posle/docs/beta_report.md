# Beta Report — Dan Posle (iter 1)
**Datum:** 2026-09-13
**Beta score:** 7.3/10

---

## Zora (UX): 7.0/10

**[CRITICAL] Mute dugme ruši igru dok je intro screen aktivan (`main.js` linija 74–77)**

Reprodukcija:
1. Otvori igru → intro screen se prikazuje, `state = null`
2. Klikni bilo gde na stranici (ne na mute) → `onFirstClick` se okida jednom, `audioStarted = true`, ali `state` i dalje `null` (guard `if (state &&...)` štiti ovde)
3. Klikni mute dugme → `!nowMuted && audioStarted` je `true` → `startAmbient(getCurrentHour(state))` se poziva → `getCurrentHour(null)` → `TypeError: Cannot read properties of null (reading 'currentHourIndex')` → igra se zamrzava

Mute dugme je van `.screen` div-a (u globalnom HUD-u), vidljivo i klikabilno na intro ekranu. `onFirstClick` handler ima `if (state && ...)` guard, mute handler nema. Crash je reproducibilan u prvim 30 sekundi za svakog ko klikne negde a zatim probi mute.

**[MEDIUM] Community Score prikazuje `0.0` odmah na startu**

Početni resursi: veze=3, secanja=2, nered=10 → CS = 3 + 2 − 10/2 = **0.0**.
HUD pokazuje "Community Score: 0.0" čim igra počne. Nema onboarding objašnjenja da je 0.0 početna vrednost po dizajnu, ne kazna. Svaki novi igrač pomisli da je nešto pošlo naopako pre prve odluke.

**[MEDIUM] Badge DOM redosled u decision card (`render.js` linija 84–98)**

`renderDecisionCard` dodaje badge (Toma / Kluboslavija) na `header` *pre* nego što dodaje `time` i `title` elemente. DOM redosled: `badge → time → title`. Vizuelno: badge se pojavljuje iznad naslova, ne pored ili ispod. Na mobilnom ovo gurа naslov naniže i narušava hijerarhiju.

**[LOW] Nema vizuelne potvrde za energija=0 stanje**

Kada opcija postane `auto: true`, label dobija suffix " (automatski)". Ali nema HUD signal ili tooltip koji objašnjava zašto. Igrač koji nije pažljivo čitao ne zna zašto su neke opcije zasivljene.

---

## Raša (tech): 7.0/10

**[CRITICAL] `startAmbient(getCurrentHour(null))` → crash (vidi Zora gore)**

Isti bug, tehnički uzrok: `mute handler` u `boot()` (main.js:74–77) poziva `startAmbient(getCurrentHour(state))` bez provere `state !== null`. `getCurrentHour` iz `timer.js` direktno pristupa `state.currentHourIndex` — bez null guard-a. Jedna linija fix: `if (state && !nowMuted && audioStarted)`.

**[MEDIUM] Energija=0 edge case: sve opcije dobijaju `auto: true` ako nijedna nema `delta.e` (`decision_engine.js` linija 94–114)**

Kada `energija <= 0`, kod traži opciju sa `bestE` (najveći e delta). Ako sve opcije imaju `delta.e = 0` ili nepostavljeno (što je čest slučaj za N2, N4, N5 tip nodova koji ne diraju energiju), tada `bestE = 0`, i sve opcije su `isBest = true` → sve su `auto: true`, nijedna `disabled`. Player vidi sve dugmiće sa "(automatski)" labela, ali može kliknuti bilo koji. Funkcionalno radi, ali UX je zbunjujuć i sugestivan da je "automatski" odabir zapravo automatski — igrač možda čeka da igra izabere sama.

**[MEDIUM] `prestigeInfo` (`loadPrestige()`) dodeljen ali nekorišćen (`main.js` linija 47)**

`const prestigeInfo = loadPrestige();` — vrednost se nikad ne čita. `isPrestigeUnlocked()` (iz `prestige.js`) se poziva odvojeno. Dve odvojene localStorage operacije za isti podatak. Nije crash, ali ako ikad dođe do desynca između ta dva poziva, prestige dugme se može prikazati pogrešno.

**[MEDIUM] `renderHUD` iz `render.js` importovan ali nikad pozvan u `main.js`**

`import { renderDecisionCard, renderHUD, ... } from './render.js'` — `renderHUD` se ne poziva nigde u main.js; koristi se `updateHUD` iz `ui.js`. Dead import. Nije bug sam po sebi, ali povećava konfuziju: postoje dve funkcije sa istom svrhom u dva različita modula — ko je autoritativan?

**[LOW] `partitionNodes()` u `decision_engine.js` definisan ali nekorišćen**

`event_selector.js` radi vlastitu particiju inline (regular/kl/toma filter). `partitionNodes` je dead code.

**[LOW] Resource bar fill nije clamped na [0, 100] (`ui.js` linija 188)**

`fill.style.width = \`${(val / def.max) * 100}%\`` — nema `Math.min(100, ...)`. Ako resursi pređu max (nije moguće u normalnom toku ako `resource_manager.js` clampuje), bar bi se prelila izvan kontejnera. Verifikacija clampovanja u resource_manager.js nije urađena u ovom review-u.

**[LOW] `loadState()` ne proverava konzistentnost `currentHourIndex`**

Validacija: `if (!parsed.resources || parsed.currentHourIndex === undefined) return null;` — ali ne proverava da li je `currentHourIndex` u validnom opsegu `[0, HOURS.length-1]`. Corrupted localStorage sa `currentHourIndex: 99` prošao bi validaciju i probušio `HOURS[99]` → undefined sat → chain crash u `getOrderedNodesForHour`.

---

## Lela (engagement): 8.0/10

**[LOW] Community Score 0.0 na startu demotiviše pre prve odluke (vidi Zora)**

CS formula je matematički korektna po dizajnu, ali 0.0 kao start value bez konteksta deluje kao "nisi uradio ništa dobro". Preporučeno: dodati mali tooltip ili intro nota "Tvoj CS raste sa svakom dobrom odlukom — kreneš sa 0, cilj je što veći broj."

**[LOW] Prestige run onboarding: ne kaže šta se razlikuje**

`showIntroScreen` prikazuje prestige dugme kada je unlocked, ali `INTRO_TEXT` iz `organizer.js` nije pročitan — nije jasno da li prestige run objašnjava Toma memory mehaniku igraču koji ga prvi put vidi. Ako ne, prestige može delovati kao "novi game+" bez jasnog benefita.

**Pozitivno — sve što radi:**
- Narativna struktura (32 noda, 12 sati) čvrsta; regular → kl → toma redosled po satu je dobar ritam.
- Achievement notif sistem (toast, 2.5s) mera je prava.
- Atmosphere/hour transition (1000ms overlay + 400ms fade) dobar tempo za narrative pacing.
- Hour intro text po prvom nodu u satu — dobar UX touch, orijentiše igrača.
- Delta preview tagovi na opcijama (+2V, -1E) su čitljivi i pomažu decision making.
- Ending detection + prestige unlock flow izgleda kompletno.
- Audio init na prvom user interakciji (ne autoplay) je ispravno.
- Save/load: silent fail na private browsing je dobra praksa.
- Share + score card implementacija prisutna.

---

## Zbir: CRITICAL: 1, MEDIUM: 5, LOW: 6

**Prag za auto-release (KORAK 6.75): beta_score >= 8.0 AND 0 CRITICAL → NIJE ISPUNJEN.**

### Fix prioriteti za KORAK 6:

1. **[CRITICAL — 1 linija]** `main.js` mute handler: dodaj `state &&` guard:
   ```js
   if (state && !nowMuted && audioStarted) {
     startAmbient(getCurrentHour(state));
   }
   ```

2. **[MEDIUM — CSS ili DOM reorder]** `render.js` badge redosled: apprenduj badge *posle* title, ne pre, ili koristi CSS `order` na flex kontejneru.

3. **[MEDIUM — UX copy]** CS start confusion: dodaj jedan red ispod CS displeja na HUD ili u intro tekst: npr. "Počinješ sa CS 0 — raste sa svakom koneksom."

4. **[MEDIUM — 3 linije]** `decision_engine.js` energija=0 edge: ako `bestE === 0` (sve opcije neutralne za E), ne markiraj ih kao `auto` — ostavi sve enabled, nijedna nije preferred.

5. **[MEDIUM — 1 linija]** `state.js` `loadState` validacija: dodaj `parsed.currentHourIndex < HOURS.length` check.

LOW bugove (dead code, unclamped bar) idi u patch_queue posle release-a.
