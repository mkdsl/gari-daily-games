# Beta Report — Zemlja i Znanje
## Datum: 2026-06-08

---

### ZORA UX — First Impression (prvih 5 minuta)

**Start screen** je čist i čitljiv. Naslov, subtitle, kratak opis — razumljivo za laika. "Nastavi" dugme se ispravno disabluje za novog igrača (`meta.totalSessions === 0`). Ovo je solidno.

**Planning screen onboarding** ima jedan ozbiljan problem: forma se prikazuje bez ikakvog uvodnog teksta koji objašnjava šta je cilj pre nego što korisnik vidi 4 sekcije (Tema, Polaznici, Stručnjaci, Raspored). "Pomoć ?" dugme postoji, ali je sekundarno — novi korisnik ne zna zašto kliće Suvozid, šta znači "Carry-over" ili zašto postoji "Evaluacija" zaključana na kraju rasporeda. Tooltip text na locked temama koristi `title` atribut koji nije vidljiv na mobilnom uređaju.

**Budget preview sekcija** prikazuje "Prihodi", "Troškovi", "Profit", "Carry-over", "Budžet dostupan" — pet vrednosti bez kontekstualizacije. Za prvog korisnika ovo je zbunjujuće jer ne zna da li "Budžet dostupan" mora da pokrije "Troškove" ili nije relevantan za start.

**Touch target veličine**: Kandidat kartice (`.candidate-card`) koriste inline stilove samo za energy bar. Nema garancije da su 44px visoke. Dugmad `-/+` za broj polaznika (`btn-count` class) verovatno imaju min-width problem na mobilnom — nisu eksplicitno definisana u pregledanim fajlovima.

**[MEDIUM]** Planning screen nema kratki intro/tooltip koji orijentiše novog korisnika pre popunjavanja forme.
**[MEDIUM]** Locked teme koriste samo `title` atribut za lock info — nevidljivo na touchscreenu.
**[LOW]** Budget "Budžet dostupan" red nije jasno označen kao kontekstualna info-linija (nije cena koja se oduzima).

---

### RAŠA TECH — Tehničke Provere

**Bug 1 — CRITICAL: `tickClock` vraća objekat, ne broj, ali se tretira kao broj na jednom mestu.**
`session-runner.js:64`: `const { minutesElapsed, slotChanged, newSlot } = tickClock(deltaMs, speed)` — destrukturiranje radi ispravno.
MEĐUTIM u `session-state.js:49`: `if (!_micro || _micro.isPaused || _micro.sessionEnded) return 0;` — u tom edge case vraća `0` (broj), dok inače vraća objekat. Pozivajući kod destrukturira `{ minutesElapsed, slotChanged, newSlot }` iz toga — sve tri varijable postaju `undefined` kad je micro pauziran i tickClock vrati `0`. `updateParticipants(micro.participantStates, activity, undefined, ...)` i `updateModuleProgress(micro.moduleProgress, activity, micro.currentSlot, undefined)` primaju `undefined` kao `minutesElapsed`. Ako ove funkcije ne štite od `undefined`, to je runtime error u prvoj sesiji čim korisnik pritisne pauzu.

**Bug 2 — CRITICAL: Dvostruki render loop / dvostruki `requestAnimationFrame`.**
`main.js:286-298` pokreće `startRenderLoop()` koji zove `renderFrame` u svom rAF. Paralelno, `session-runner.js:46` pokreće sopstveni rAF loop (`loop`). Oba se izvršavaju istovremeno tokom sesije. `session-runner.loop` zove `updateSessionUI` direktno svaki frame, a `main.js` loop zove `renderFrame` svaki frame. Nema sinhronizacije ni jasnog vlasništva. Na sporijim uređajima ovo stvara dvojno ažuriranje DOM-a po frame-u. Nije blocker za desktop, ali je MEDIUM performance rizik i potencijalni vizuelni glitch.

**Bug 3 — MEDIUM: `onSessionEnd` u `main.js` sluša `EVT.SESSION_END`, ali `session-runner.js` emituje `EVT.SESSION_END` DIREKTNO iz `endSession()`, a zatim zove i `showEvaluationOverlay()` koji dodaje "Nastavi →" dugme. Klик na to dugme emituje `EVT.SCREEN_CHANGE` → `'season_summary'`. Ali `main.js:81` ISTO sluša `EVT.SESSION_END` i zove `onSessionEnd(result, repGained)` koji ODMAH zove `navigateTo('season_summary', ...)`. Rezultat: `navigateTo('season_summary')` se poziva DVAPUT — jednom iz `onSessionEnd` odmah po `SESSION_END`, i jednom kad korisnik klikne "Nastavi". Drugi klik daje prazan summary bez data-a. Ovo je race condition između `showEvaluationOverlay` i `onSessionEnd`.**

**Bug 4 — MEDIUM: `refreshTimeline()` u `planning-ui.js:346` iterira samo `.timeline-slot:not(.locked)` i mapira ih po index-u `i`, ali `_state.plan` može imati locked slotove ubačene u sredinu. Ako je locked slot na poziciji 3, ne-locked slot `i=3` u NodeList zapravo odgovara `_state.plan[4]`. Potencijalni off-by-one u refreshu vizuelnog timeline-a — slot može prikazivati pogrešnu aktivnost.**

**Bug 5 — MEDIUM: `save.js:loadMacro` proverava `data.version !== 1` ali ni jedan od vidljivih `saveMacro/saveMicro` poziva ne dodaje `version: 1` u objekat pre serijalizacije. Ako `macroState` ili `microState` ne sadrže `version` property, load uvek vraća `null` i igra ne može da se učita posle refresha.**

**Bug 6 — LOW: `decision-cards.js:115-116` koristi `document.getElementById('incident-timer-arc')` i `document.getElementById('incident-timer-num')` umesto da pretraži unutar `_card` elementa. Ako na stranici postoje dva simultana incident card-a (race condition), querySelector gleda samo prvi u DOM-u. Malo verovatno ali moguće.**

**Bug 7 — LOW: `session-runner.js:135-137` šalje `EVT.RAIN_START` **svaki frame** dok `weather.rain` je true. Nema debounce-a niti "rain already started" flaga. Audio/particle sistem verovatno prima hiljade RAIN_START event-a po sekundi.**

---

### LELA ENGAGEMENT — Game Feel & Retention

**Game feel sesije** je u principu dobar: SVG timer na incident karticama, aforizmi u scrollu, energy bars po polaznicima, brzina 1×/2×. Vizuelna gustina je odgovarajuća za žanr.

**Pacing problem:** Sesija se završava direktno kroz `evaluacija` slot — nema "crescendo" momenta. Player ne dobija feedback o tome da sesija ide dobro ili loše *tokom* sesije, osim energy/sat bara. Nije CRITICAL ali osećaj "šta ću sad da uradim" između incidenata nedostaje.

**Retry hook** je prisutan (prestiž, season summary sa grade). Grade sistem (S/A/B/C/D/F) je dobar motivator. Unlock drvo postoji. Solidno.

**Season summary** ekran ima sve bitne podatke ali "Sledeća Sezona" odmah vodi nazad u planning bez tranzicije. Korisnik nema trenutak da "proslavi" ili "žali" ishod.

**Meta ekran** je dobro napravljen — career stats, achievements grid, prestige prompt. Prestige UI koristi `<select>` za odabir stručnjaka koji se zadržava — malo arhaično, ali funkcionalno.

**[LOW]** Nema mid-session feedback osim energy/sat bara (nema "hajde" ili "oprez" notifikacija u HUD-u).
**[LOW]** Season summary → planning tranzicija je abruptna bez kratke animacije ili pauze.

---

### Bug List

| ID | Severity | Opis | Fajl:linija |
|----|----------|------|------------|
| B1 | CRITICAL | `tickClock()` vraća `0` (ne objekat) kad je micro pauziran/završen — destrukturiranje u calleru daje `undefined` za `minutesElapsed`/`slotChanged`/`newSlot`, propagira u `updateParticipants` i `updateModuleProgress` | `session-state.js:49`, `session-runner.js:64` |
| B2 | CRITICAL | Dvostruki `EVT.SESSION_END` handling: `session-runner.endSession()` emituje event + montira overlay, `main.js:onSessionEnd` odmah navigira na `season_summary` — overlay dugme vodi na prazan drugi summary | `session-runner.js:162`, `main.js:81,282` |
| B3 | MEDIUM | Dvostruki rAF loop (`main.js:startRenderLoop` + `session-runner.js:loop`) rade paralelno tokom sesije bez sinhronizacije | `main.js:286`, `session-runner.js:46` |
| B4 | MEDIUM | `refreshTimeline()` off-by-one: iterira ne-locked slot-ove po `i` ali mapira na `_state.plan[i]`, preskaičući locked slot-ove u plan array-u | `planning-ui.js:346-355` |
| B5 | MEDIUM | `loadMacro`/`loadMicro` uvek vraća `null` jer `version: 1` nije serijalizovano u objekat pri save-u — save/load je broken | `save.js:25`, `save.js:56` |
| B6 | LOW | `EVT.RAIN_START` se emituje svaki render frame dok traje kiša, bez debounce-a | `session-runner.js:135-137` |
| B7 | LOW | `document.getElementById()` u `decision-cards.js` ne traži unutar `_card` el-a | `decision-cards.js:115-116` |
| B8 | MEDIUM | Locked teme: `title` atribut za lock info nije vidljiv na touchscreen-u (mobilni korisnik ne vidi zašto je tema zaključana) | `planning-ui.js:108` |
| B9 | LOW | Planning screen nema uvodni tekst koji objašnjava flow novom korisniku | `planning-ui.js:63-98` |

---

### Beta Score: 5.5 / 10

### Preporuka: FIX REQUIRED

**Obrazloženje:** Dva CRITICAL buga (B1, B2) blokiraju sesiju ili season summary u normalnom playthroughu. B5 (save/load broken) znači da svako osvežavanje stranice resetuje igru — direktno oštećuje meta progresiju i retention. Ova tri mora da budu rešena pre release-a. Medium bugovi B3, B4, B8 kvaре first impression na mobilnom i mogu uzrokovati vizuelne glitch-eve. Core arhitektura (incident queue, decision cards, timing engine, meta ekran) je čvrsta i dobro zamišljena — igra ima potencijal za S tier nakon fix-ova.
