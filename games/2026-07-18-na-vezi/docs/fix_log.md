# Fix Log — Na Vezi

**Beta iter 1 score:** 1.2/10 (3 CRITICAL, 2 MEDIUM, 2 LOW)
**Fix sesija:** 2026-07-24

---

## CRITICAL Bugovi (svi rešeni)

### C1 — Blank screen za 100% korisnika (REŠEN)
**Uzrok:** `src/audio.js:44` — `startAmbientPad()` definisana bez `export` ključne reči, ali `src/main.js:7` je importuje kao named export → ES module SyntaxError ruši ceo import graf pre nego što `init()` ikad pozovemo. Prethodni patch (DOMContentLoaded) nije rešio koren problema.
**Fix:** Dodato `export` ispred `function startAmbientPad()` na liniji 44 u `audio.js`.

### C2 — Macro planning ekran puca odmah pri renderovanju (REŠEN)
**Uzrok:** `_renderMacroStep` u `src/main.js` pozivao `renderMacroPlanningScreen(container, optionsObject)` sa 2 argumenta umesto očekivanih 5 pozicionih. `callbacks = undefined` → `TypeError: Cannot read properties of undefined (reading 'onLockIn')`.
**Fix:** Dodat import za `getDraftPlan, getTotalSteps, nextStep, prevStep, updateDraftPlan` iz `./macro/planning-session.js` i `buyEquipment` iz `./macro/equipment-shop.js`. `_renderMacroStep` prepisan da prosleđuje sve 5 pozicionih argumenata + komplet callbacks (onNext, onPrev, onLockIn, onFormat, onAlloc, onEquip, onGuest) sa ispravnom logikom za svaki korak planiranja.

### C3 — Live emisija dashboard se nikad ne inicijalizuje (REŠEN)
**Uzrok:** `src/main.js:377` pozivao `initDashboardState()` bez argumenata. `dashboard-state.js:47` odmah pristupa `gostInfo.arrived` → `TypeError: Cannot read properties of undefined`. Sve mikro-mehanike (signal, chat, alarmi, timer, EQ) ostajale zamrznute zauvek.
**Fix:** `initDashboardState()` poziv zamenjen sa 4 argumenta iz `getState()`:
```js
const _initSt = getState();
const _initWp = _initSt.weekly_plan;
initDashboardState(_initWp, _initSt.equipment, { arrived: false, gostId: _initWp.chosen_guest_id }, _initWp.weekly_capacity);
```
Bonus fix iz KORAK 6 briga: `lockInPlan()` return vrednost (`{ ok: true }`) ne koristi se više direktno kao `_currentPlan` — plan se čita iz `getState().weekly_plan` posle uspešnog lock-in.

---

## MEDIUM Bugovi (svi rešeni)

### M1 — Signal recovery 8× sporiji od dizajniranog (REŠEN)
**Uzrok:** `passiveSignalRecover(dt)` i `tickSignal(dt)` pozivani sa `dt=1` umesto `GAME_CONFIG.SIGNAL_RECOVER_RATE=8`.
**Fix:** Oba poziva u `_tickMicro` promenjeni na `GAME_CONFIG.SIGNAL_RECOVER_RATE`.

### M2 — Timer pokazuje 45:00 umesto 8:00 (REŠEN)
**Uzrok:** `GAME_CONFIG.EMISIJA_DURATION_SECONDS` ne postoji → fallback `2700` (45 min). Pravi ključ je `GAME_CONFIG.EMISIJA_DURATION = 480` (8 min).
**Fix:** `renderTimer(elapsed, GAME_CONFIG.EMISIJA_DURATION_SECONDS || 2700)` → `renderTimer(elapsed, GAME_CONFIG.EMISIJA_DURATION)`.

---

## LOW Bugovi (logguju se za next pass)

### L1 — `resolveSignalAction` pozvan sa 2 argumenta, ali prima samo 1
Drugi argument se tiho ignoriše — nije štetno, ali mrtav/zbunjujuć kod.

### L2 — Nema top-level error boundary
Jedan typo u ~50 modula reprodukuje prazan crn ekran bez traga. Nema `try/catch` ni fallback UI.

---

## Fajlovi promenjeni (iter 1)
- `src/audio.js` — dodato `export` na `startAmbientPad`
- `src/main.js` — prošireni importi, prepisan `_renderMacroStep`, fiksovano `initDashboardState`, signal recovery rate, timer duration

---

## Fix Krug 2 — 2026-07-25 (MEDIUM Naming Mismatches)

**Triggered by:** sef_signoff.md Opcija A, šef politika "bez mene", trigger routing "nastavi polish"
**Beta iter 2 score:** 5.3/10 — 3 MEDIUM naming mismatch u main.js

### M3 — Platform allocation ignorisana u emisiji (REŠEN)
**Uzrok:** `plan.platformAlloc` ne postoji — ispravno polje je `plan.platform_alloc`. Fallback `{}` znači da chat i engagement sistemi dobijaju 0% za sve platforme.
**Fix:** 3 zamene u `src/main.js` (linije 345, 470, 572): `plan.platformAlloc` → `plan.platform_alloc`

### M4 — Gost nikad ne dolazi (REŠEN)
**Uzrok:** `plan.guest` ne postoji — ispravno polje je `plan.chosen_guest_id`. Uslov `if (plan.guest)` uvek false → `handleGuestArrival` nikad pozvan. `tickGuestStandout` dobija `undefined` → standout event nikad ne pali.
**Fix:** 5 zamena u `src/main.js` (linije 353, 416, 420, 528, 531): `plan.guest` → `plan.chosen_guest_id`

### M5 — Battery meter statičan (REŠEN)
**Uzrok:** `ds.offgridCapacity` ne postoji u dashboard state — ispravno polje je `ds.offgrid`. `renderOffgridMeter` dobijao fallback 80 umesto stvarnog stanja baterije.
**Fix:** 1 zamena u `src/main.js` (linija 588): `ds.offgridCapacity` → `ds.offgrid`

### Bonus — Lock-in summary pokazivao pogrešan offgrid % (REŠEN)
**Uzrok:** `plan.offgridCapacity` ne postoji — ispravno polje je `plan.weekly_capacity`.
**Fix:** 1 zamena u `src/main.js` (linija 354): `plan.offgridCapacity` → `plan.weekly_capacity`

## Fajlovi promenjeni (iter 2)
- `src/main.js` — 10 naming mismatch zamena (svi u jednom fajlu)

---

## Fix Krug 3 — 2026-07-25 (7 CRITICAL architectural bugs)

**Triggered by:** Beta Trio iter 3 (score 3.0/10) — naming fix krug 2 otkrio dublje arhitekturne bugove koji su bili sakriveni dok su code paths bili mrtvi.
**Beta iter 3 score:** 3.0/10 — game se ne može normalno završiti (timer odbroji do 00:00 ali emisija ostaje aktivna)

### CRITICAL #1 — `calcPlatformEngagement` pogrešan poziv → TypeError svake sekunde → igra se nikad ne završava (REŠEN)

**Uzrok:** `_tickMicro` pozivao funkciju u for-petlji sa 4 pogrešna argumenta (`platform` string kao `elapsed`, `elapsed` kao `signalLevel`, `alloc[platform]` broj kao `chatMomentum`, `momentum[platform]` broj kao `gostArrived`). Pravi potpis: `(elapsed, signalLevel, chatMomentum, gostArrived, format, platformAlloc)`. Linija 41 unutar funkcije: `if (platformAlloc.ig > 0)` → `TypeError: Cannot read properties of undefined (reading 'ig')`. TypeError sprečava izvršavanje svih koraka posle step 5 u `_tickMicro`, uključujući step 13 (`isEmisijaOver`) — igra se nikad ne završava prirodno.

**Fix:** for-petlja zamenjena jednim ispravnim pozivom van petlje:
```js
calcPlatformEngagement(
  freshDs2.elapsed || 0,
  freshDs2.signal || 100,
  getAllMomentum(),
  freshDs2.gostArrived || false,
  plan.format || 'dj_lajv',
  alloc
);
```

### CRITICAL #2 — `handleGuestArrival` prima string umesto `{arrived, noShow}` objekta (REŠEN)

**Uzrok:** `main.js:420` pozivao `handleGuestArrival(plan.chosen_guest_id, getState())` — prosleđivao string ID (`'g1'`) kao `arrivalResult`. Funkcija odmah pristupa `arrivalResult.noShow` i `arrivalResult.arrived` — oba `undefined` (falsy). `EVENTS.GUEST_ARRIVED` i `EVENTS.GUEST_NOSHOW` se nikad ne emituju → `ds.gostArrived` ostaje `false` za celo trajanje emisije.

**Fix:** Dodat import `resolveGostArrival` iz `./content/gost-roster.js`. Poziv zamenjen sa:
```js
handleGuestArrival(resolveGostArrival(plan.chosen_guest_id));
```

### CRITICAL #3 — `EVENTS.GUEST_ARRIVED` emitovan ali nema listenera → `ds.gostArrived` nikad `true` (REŠEN)

**Uzrok:** `handleGuestArrival` emituje `EVENTS.GUEST_ARRIVED`, ali `_wireSystemEvents()` nikad nije registrovao listener za taj event. `updateDashboardState({ gostArrived: true })` se nikad ne poziva → `calcOverallEngagement` uvek računa bez gost faktora.

**Fix:** Dodata dva listenera u `_wireSystemEvents()`:
```js
on(EVENTS.GUEST_ARRIVED, () => { updateDashboardState({ gostArrived: true }); });
on(EVENTS.GUEST_NOSHOW, () => { updateDashboardState({ gostArrived: false }); });
```

### CRITICAL #4 — `tickGuestStandout` pozvan sa pogrešnim argumentima (REŠEN)

**Uzrok:** `main.js:527` pozivao `tickGuestStandout(dt, plan.chosen_guest_id)` — `dt` (delta vreme ≈0.016) kao `elapsed` (ukupno proteklo vreme u sekundama), i `plan.chosen_guest_id` string kao `format` string. Funkcija nikad ne pali standout window jer `elapsed < 2` uvek (treba 120–300 sekundi).

**Fix:** `tickGuestStandout(getDashboardState().elapsed || 0, plan.format || 'dj_lajv')`

### CRITICAL #5 — `tickBattery` pozvan sa pre-izračunatom vrednošću i state objektom (REŠEN)

**Uzrok:** `main.js` pozivao `tickBattery(drainPerSec * dt, getDashboardState())`. Pravi potpis: `tickBattery(dt, drainPerSec)` — funkcija interno računuje `drainPerSec * dt`. Rezultat: funkcija primala `NaN` (broj * objekat = NaN) pa `tickOffgrid(NaN)` → baterija se nikad ne troši.

**Fix:** `tickBattery(dt, drainPerSec)`

### CRITICAL #6 — `tickChat` pozvan sa pogrešnim argumentima → samo IG chat, nikad TikTok/YT (REŠEN)

**Uzrok:** `main.js` pozivao `tickChat(dt, alloc, momentum)`. Pravi potpis: `tickChat(elapsed, plan, tutorialMode)` gde `plan.platform_alloc` određuje aktivne platforme, a `tutorialMode` (bool) limitira na IG-only. Pošto je `momentum` objekat (truthy), `tutorialMode` je uvek `true` → TikTok i YouTube chat se nikad ne generišu.

**Fix:** `tickChat(getDashboardState().elapsed || 0, { platform_alloc: alloc }, isTutorialMode())`

### CRITICAL #7 — Alarm sistem: pogrešni pozivi `tryGenerateAlarm`, `tickAlarms`, `processEscalation` (REŠEN)

**Uzrok:** Tri greške u `_tickMicro` koraku 7-9:
1. `tryGenerateAlarm(freshDs.elapsed || 0, freshDs)` — pravi potpis: `tryGenerateAlarm(escalationBonuses = {})`. Poziv sa dva argumenta ignoriše `escalationBonuses` → alarmna eskalacija nikad ne utiče na novu generaciju alarma.
2. `tickAlarms(dt)` — return vrednost (niz expired ID-ova) ignorisana → expired alarmi nikad ne prolaze kroz `missAlarm` + `processEscalation`.
3. `processEscalation(getDashboardState())` pozvan svaki tik — pravi potpis: `processEscalation(missedAlarm)` prima specifičan alarm objekat. Svaki tik poziva `_missedCount++` unutar funkcije → nakon 8 minuta (480 tika) `_missedCount` = 480+ što maxuje sve eskalacione bonuse i sabotira alarm balans.

**Fix:**
```js
// 7. Alarm generacija
const escalationBonuses = getEscalationBonuses();
const newAlarm = tryGenerateAlarm(escalationBonuses);
if (newAlarm) _handleNewAlarm(newAlarm);

// 8. Tick alarm tajmera i procesi expired
const expiredIds = tickAlarms(dt);
for (const id of expiredIds) {
  const alarm = missAlarm(id);
  if (alarm) processEscalation(alarm);
}
```
Dodat import: `missAlarm` iz `alarm-generator.js`, `getEscalationBonuses` iz `alarm-escalation.js`.

## Fajlovi promenjeni (iter 3)
- `src/main.js` — svi fiksevi u jednom fajlu (CRITICAL #1–#7)
