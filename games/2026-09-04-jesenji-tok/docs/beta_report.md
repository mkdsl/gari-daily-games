# Beta Report — Jesenji Tok (Iter 1)
**Datum:** 2026-09-06
**Beta Trio:** Zora UX + Raša tech + Lela engagement

---

## Executive Summary

Jesenji Tok je jedan od čišćih DOM-based puzzle-ova u GDG pipelinu — arhitektura je modularna, validacija robustna, i core loop (selektuj karticu → tapni ćeliju → sezona zatvori) funkcioniše bez blokadera. Jedan CRITICAL bug postoji: **achievement sistem je projektovan da persisira across runs ali u praksi se briše na svakom novom pokretanju igre** (uključujući `prestige_3` koji zahteva inter-run praćenje i nikad ne može biti otključan). Pored toga, dve MEDIUM greške: eco bonus indikatori ne prikazuju se u breakdown tabeli (pogrešna imena propertija u score-screen.js), i forecast reveal mechanic — koji tutorijal eksplicitno uči — nije uopšte žičan (FORECAST_FIRST_ASSIGN_REVEAL konstanta definisana ali nikad pozvana). Bez ova tri fixa igra je "solidna" sa neisporučenim obećanjima. **Iter 1 score: 6.5/10.**

---

## CRITICAL Issues (blokira release)

### [CRITICAL] Achievements se brišu na svakom novom runu — `prestige_3` nikad ne može biti otključan

- **Opis:** Achievement sistem u `state.js` čuva `state.achievements` i `saveState()` ga persisira. Ali `handlePlayAgain()` i `handlePrestige()` u `main.js` oba pozivaju `state = createState()` čime se kreće potpuno svež state sa `achievements: {}`, zatim `saveState()` overwrite-uje localStorage sa praznim achievements. Sledeći browser refresh učitava prazan achievements record. Niti jedan achievement ne preživljava prelaz između runova — ni `first_assign` (nema smisla da se prikazuje svaki run), ni `ekosistem_bonus`, a pogotovo ne `prestige_3` koji po dizajnu zahteva 3 runa.
- **Repro:**
  1. Igraj sezonu, otključaj `first_assign` ili `ekosistem_bonus`
  2. Klikni "Nova sezona" (play-again)
  3. Osvežite stranicu (F5)
  4. `state.achievements` = `{}` — svi achievements izgubljeni
  5. Isti problem ako uđeš u prestige i odabereš bonus
- **Root cause:** `handlePlayAgain` (main.js ~657–671): `skipPrestige(state)` ispravno zove `resetForNewRun` koji čuva achievements, ali odmah zatim `state = createState()` (achievements = `{}`) je novi state koji se snima — prethodni rad `skipPrestige` je discardovan. `handlePrestige` ima isti pattern.
- **Modul:** `src/main.js` (handlePlayAgain L656–671, handlePrestige L683–713)
- **Fix smer:** Učitaj achievements iz starog state-a pre `createState()` i kopiraj ih, ili snimi achievements u poseban localStorage ključ (analogno `STORAGE_KEYS.prestige_bonus`).

---

## MEDIUM Issues (oštećuje first-impression)

### [MEDIUM] Eco bonus i hot penalty indikatori ne prikazuju se u breakdown tabeli (pogrešna property imena)

- **Opis:** `score-screen.js` koristi `b.eco_bonus` i `b.penalty` u bura animaciji i u `buildBreakdownRow()`. Ali `scoring.js` `TaskScore` typedef definiše ova polja kao `ecosystem_bonus_applied` i `hot_penalty_applied`. Rezultat: `b.eco_bonus` uvek `undefined` (falsy), `b.penalty` uvek `undefined` (falsy). Igrač nikad ne vidi 🌿 indicator pored zadataka koji su dobili eco bonus u breakdown tabeli niti u bura reveal-u, niti ⚠️ pored Komposta u vatreno_lisce sezoni.
- **Repro:**
  1. Postavi Micelij + Jezero + Kompost sva tri u prozor (eco bonus triggerovati)
  2. Zatvori sezonu → probaj da vidis 🌿 u bura animaciji ili u breakdown tabeli
  3. Nema 🌿 nigde — ali score numerički jeste uvećan (to radi ispravno)
- **Impact:** Igrač ne vidi koji zadatak je dobio bonus — ključna pedagoška vrednost igre (razumeti ZAŠTO su poeni veći) je izgubljena.
- **Modul:** `src/ui/score-screen.js` L152–153 (renderBuraAnimation), L388–389 (buildBreakdownRow)
- **Fix:** Promeni `b.eco_bonus` → `b.ecosystem_bonus_applied`, `b.penalty` → `b.hot_penalty_applied` na oba mesta.

### [MEDIUM] Forecast reveal mechanic nije uopšte wiran — tutorijal lažno obećava progresivno otkrivanje

- **Opis:** Config definiše `FORECAST_FIRST_ASSIGN_REVEAL = 1` (jedna dodatna nedelja otkriva se posle prve dodele) i `revealForecast()` funkcija postoji u `systems/weather.js`. Tutorijal korak 3 eksplicitno kaže "Prvih 3 nedelje su uvek vidljive. Ostalo se otkriva postepeno." — ali u `handleAssign()` u main.js nikad se ne poziva `revealForecast()`. Rezultat: igrač bez `full_forecast` prestige-a UVEK vidi samo 3 nedelje prognoze tokom cele sezone, nema progressivnog otkrivanja.
- **Repro:**
  1. Počni novu igru (bez prestige-a)
  2. Dodeli zadatke u nedelje 4–12 — prognoza se ne otkriva
  3. Forecast bar i dalje prikazuje samo N1–N3, ostalo "❓"
- **Impact:** Puzzle je namerno teži nego što je dizajniran — "fog of war" se nikad ne smanjuje. Igrači koji su pročitali tutorijal izgubljeni su jer obećano ponašanje ne dođe.
- **Modul:** `src/main.js` (handleAssign), `src/systems/weather.js` (revealForecast — postoji ali nije pozvana), `src/config.js` (FORECAST_FIRST_ASSIGN_REVEAL — definisano ali nigde importovano)
- **Fix:** U `handleAssign` nakon uspešne dodele pozovi `revealForecast(state.weather, FORECAST_FIRST_ASSIGN_REVEAL)` i zatim re-renderuj forecast bar.

---

## LOW Issues (polish, nice-to-have)

### [LOW] `skipPrestige(state)` call u `handlePlayAgain` je dead code

- **Opis:** `handlePlayAgain` poziva `skipPrestige(state)` koji ispravno zove `resetForNewRun` (čuva achievements, inkrementuje run_number) i `incrementTotalRuns()`. Ali odmah zatim `state = createState()` discarduje sav taj rad. Jedina persisirana side-effecta je `incrementTotalRuns()` u localStorage. `state.run_number` uvek ostaje 0 u play-again putu.
- **Modul:** `src/main.js` L657–664 (prve 8 linija handlePlayAgain su dead code)

### [LOW] `is_new_best` field u ScoreResult je uvek `false`

- **Opis:** `calculateScore()` vraća `is_new_best: false` sa komentarom "set by caller after saveBestScore()". Ali `triggerCloseSeason()` nikad ne setuje `scoreResult.is_new_best = true` posle `saveBestScore()`. Score screen zaobilazi ovo sa `const isNewBest = scoreResult.total >= bestScore` — ali ovo je redundantna parallel logika.
- **Modul:** `src/main.js` (triggerCloseSeason L608–618), `src/systems/scoring.js` L188

### [LOW] `FORECAST_FIRST_ASSIGN_REVEAL` i `checkEcoBonusFeasibility` su dead exports

- **Opis:** Konstanta `FORECAST_FIRST_ASSIGN_REVEAL` definisana u config.js ali nigde importovana. Funkcija `checkEcoBonusFeasibility` eksportovana iz `systems/validation.js` ali nije importovana nigde u produkcijskom kodu. Cleanup radi čistoće.
- **Modul:** `src/config.js`, `src/systems/validation.js`

### [LOW] `total_runs` praćen na dva mesta koja mogu da divergiraju

- **Opis:** `state.total_runs` (in-memory, setuje se u `triggerCloseSeason` ali nije u `saveState()` toSave objektu — dakle nije persisiran) i `STORAGE_KEYS.total_runs` (persisiran via `incrementTotalRuns()` u prestige/skipPrestige). `loadTotalRuns()` (u achievements.js) čita localStorage ključ, dok `handlePrestige` čita `state.total_runs`. Ova dva broja divergiraju posle prvog runa.
- **Modul:** `src/state.js` (saveState ne include total_runs), `src/main.js` (triggerCloseSeason L611)

### [LOW] Accessibility: Escape na score/prestige overlay ne zatvara

- **Opis:** `handleEscapeOverlay()` ima comment "Overlays for bura/score are NOT dismissible by Escape" ali igrači koji pritisku Escape na score screenu neće dobiti nikakav feedback — ništa se ne dešava, dugme Escape je "mrtvo". Moglo bi biti vredan aria-live "Koristi dugme Nova sezona" hint.
- **Modul:** `src/main.js` L360–371 (handleEscapeOverlay)

---

## Zora UX

**Onboarding:** Tutorial je zapravo 5 koraka (ne 3 kako piše u briefu) — što je bolje. Sadržaj je odličan: svaki korak uči konkretnu mehaniku sa interactionnim hintom. Dot navigacija, arrow key support, Skip dugme — sve tu. Jedini problem: Korak 3 uči "Ostalo se otkriva postepeno" za forecast, ali to ne funkcioniše (vidi MEDIUM).

**First 5 minuta flow:** Solidno. Igrač koji završi tutorial odmah zna šta da radi. Hint sistem (45s idle) je dobro pozicioniran za novo otkrivanje. "Preskoči" dugme u tutorijalu je dostupno od prvog koraka — ne primorava nikoga.

**Mobile UX:** Grid je 6×12 — na uskim ekranima (360px wide) ovo može biti nevidljivo bez horizontalnog scrolla. `src/game.css` nije u scope ovog read-a, ali MEDIUM rizik za mobile overflow postoji. Touch event handling je ispravno urađen (`{ passive: true }` za touchstart). Haptic feedback je implementiran.

**Kontrast i čitljivost:** Tamna šuma paleta (#1a2415 bg, #f5e6c8 tekst) daje dobar kontrast. Accent #8bc34a je WCAG AA-kompatibilan na tamnoj pozadini.

**Pristupačnost:** `aria-live`, `role="listbox"`, `role="dialog"`, `aria-label` su konzistentno postavljeni. `announce()` funkcija u ui.js za screen readere je dobar touch. Fokus management na score screenu (focus na "Nova sezona" dugme) je ispravan.

---

## Raša tech

**Import/export konzistentnost:** Sve 26 modula navedenih u manifest.json postoje. ES6 relativni import path-ovi su konzistentni (`.js` ekstenzije). Jedina potencijalna greška: score-screen.js importuje `playWeekReveal` i `playBuraEnd` iz audio.js — oba su pozvana u try/catch pa neće crash čak i ako audio nije dostupan.

**Validacija (max 3/4 grupe):** Capacity check u `validation.js` ispravno računa `getEffectiveTaskCost` (poštuje cheap_micelij prestige). Edge case "already here" (re-assign iste ćelije) je pokriven. Rain block i capacity su hard blocks, out-of-window je soft warning — dizajn je clean.

**State persistencija:** `saveState()`/`loadState()` su dobro napravljeni — merge sa defaults, čiste transient fields na load. **Kritičan bug: achievements se brišu na svakom new runu (vidi CRITICAL).** `prestige_bonus` je ispravno sniman u poseban ključ i preživljava resetove.

**AudioContext inicijalizacija:** `initAudio()` se zove u `init()` pre user gesture — na modernim browserima AudioContext će biti `suspended` do interakcije. Ovo je ispravno rešeno: `resumeAudio()` je pozvan na `click`, `touchstart` i `keydown` (first interaction handler). Mute toggle je ispravno implementiran.

**Scoring formula:**
- Base score za sve zadatke: micelij=180, ozimo=150, jezero=160, graditeljski=170, rezidba=130, kompost=140 = 930
- Eco bonus: (180+160+140)×0.5 = 240 → max = 1170 (matches config komentari)
- Out-window: ×0.6 multiplier
- vatreno_lisce Kompost penalty: ×0.9 (primenjuje se na modifier pre eco check)
- Eco bonus check: `allEcoInWindow = ecosystemScores.every(b => b && b.week !== null && b.in_window)` — ispravna logika
- Rank thresholds: 900+ savrsena, 600+ solidna, 300+ preziveces, 0+ propala — odgovaraju opisanim

**Edge case: 0 assignmenta pa zatvori sezonu:** `calculateScore` sa praznim assignments vraća sve zadatke sa `week: null`, `final: 0`. `total = 0`. Rank = propala. Score screen se prikazuje ispravno. Nema crash.

**Weather presets:** kisna_jesen dinamički generiše 3 uzastopne kišne nedelje u rasponu N1–N8 (`start = random(1..6)`). rani_mraz cap-uje Micelij i Rezidbu na `frost_week - 1`. vatreno_lisce produžava Ozimo za 1 nedelju. Sve ispravno.

---

## Lela engagement

**Session target (8–12 min):** Realan. Sa 6 zadataka i 12 nedelja, igrač koji zna mehanike može da završi raspored za 3–5 min. Sa tutorijalom i razmišljanjem, 8–10 min je dostižno. Bura animacija (~320ms × 12 = 3.8s) daje dramatičan prelaz bez da je dosadna.

**Zimska bura reveal:** Progresivno otkrivanje nedelja sa running total brojačem i weather emoji-jem je dobra dramaturgija. Score counter eased animation (cubic ease-out, 1400ms) je satisfying. Harmonika na 600+ poena je odličan touch.

**Prestige replay hook:** 3 prestige opcije (extra_group, cheap_micelij, full_forecast) su dovoljno raznolike da motivišu razlicite playstyle-ove. Prestige screen dobro komunicira efekte. Problem: achievements koji bi trebalo da nagrade prestige replay ne persisiraju (CRITICAL).

**Hint sistem:** BRANA_HINTS niz (7 hints) je specifičan i edukativan, ne generičan. 45s idle = razumno. Reset hintIndex na interakciju znači da isti igrač neće videti isti hint uzastopno. Solidno.

**Brand utility (Guncati):** Edukativni tooltipovi (tooltip_edu po zadatku) su autentični i konkretni (npr. "Seje se do 20. septembra — posle toga zemlja se hladi, klijanje kasni..."). Ovo direktno hrani Guncati brand narrative. Brana persona je kohezivna. Score screen CTA-ovi vode na Guncati masterclass i Kluboslavija.

**Replay vrednost:** 4 weather presets × 3 prestige opcije = 12 kombinacija. Relativno ograničeno za deep replay, ali dovoljno za 5–8 runova. `achievements` sistem bi dao motiv za više runova — ali pošto ne persisteju (CRITICAL), ta vrednost je efektivno nula.

**Share funkcionalnost:** Web Share API sa clipboard fallback — dobro implementirano. Share text uključuje rank, score i weather preset. Guncati/Kluboslavija brand text je tu.

---

## Beta Score

**Iter 1 score: 6.5/10**

Justifikacija: Core gameplay loop je tehnički ispravan i educativan — validacija, scoring, weather mehanike, i bura animacija sve funkcionišu. Arhitektura je čista i maintainable. Međutim, jedan CRITICAL bug (achievements cleared svakog runa — core progression feature je broken), dve MEDIUM greške koje oštećuju feedback kvalitet (eco bonus indikatori nikad ne prikazuju; forecast reveal nikad ne triggeruje uprkos tutorijal obećanju), i četiri LOW cleanup stavke. Score ne može preći 7.0 sa CRITICAL bugom. Posle fix-a (CRITICAL + obe MEDIUM) igra bi trebalo da dostigne 8.0–8.5.
