# Beta Report 4 — Na Vezi

**Datum:** 2026-07-25
**Tip testa:** Code review (post fix krug 3, verifikacija 7 CRITICAL ispravki + sken novih bugova)
**Tester:** Beta Trio (Zora UX + Raša tech + Lela engagement)
**Beta score iter 4:** 3.0/10

---

## Verifikacija Fix Krug 3

### CRITICAL #1 — calcPlatformEngagement ✅ ISPRAVNO

`src/main.js` linije 490–497: poziv je sada jedan, sa 6 ispravnih argumenata:

```js
calcPlatformEngagement(
  currentDs.elapsed || 0,
  currentDs.signal || 100,
  getAllMomentum(),
  currentDs.gostArrived || false,
  plan.format || 'dj_lajv',
  alloc
);
```

Potpis u `platform-curves.js` linija 31: `(elapsed, signalLevel, chatMomentum, gostArrived, format, platformAlloc)` — podudaranje ✅

**Napomena (MEDIUM):** Povratna vrednost je odbačena — `calcPlatformEngagement` vraća `{ ig, tiktok, youtube }` ali nijedan poziv ne čuva tu vrednost. Detalji u Sekciji 2, MEDIUM #1.

---

### CRITICAL #2 — handleGuestArrival ✅ ISPRAVNO

`src/main.js` linija 421:
```js
handleGuestArrival(resolveGostArrival(plan.chosen_guest_id));
```
`resolveGostArrival` u `gost-roster.js` linija 149 vraća `{ arrived: boolean, noShow: boolean }`. `handleGuestArrival` u `guest-runtime.js` linija 21 prima `(arrivalResult)` — jedan objekat. Podudaranje ✅

---

### CRITICAL #3 — GUEST_ARRIVED / GUEST_NOSHOW listeneri ✅ ISPRAVNO

U `_wireSystemEvents()` (main.js linije 1044–1050):
```js
on(EVENTS.GUEST_ARRIVED, () => { updateDashboardState({ gostArrived: true }); });
on(EVENTS.GUEST_NOSHOW,  () => { updateDashboardState({ gostArrived: false }); });
```
Oba listenera prisutna i ispravno ažuriraju dashboard state ✅

---

### CRITICAL #4 — tickGuestStandout ✅ ISPRAVNO

`src/main.js` linija 528:
```js
const standout = tickGuestStandout(getDashboardState().elapsed || 0, plan.format || 'dj_lajv');
```
Potpis u `guest-runtime.js` linija 38: `(elapsed, format)` — podudaranje ✅

**Napomena (MEDIUM):** Povratna vrednost je `boolean`, ne string teksta. Detalji u Sekciji 2, MEDIUM #3.

---

### CRITICAL #5 — tickBattery ✅ ISPRAVNO

`src/main.js` linija 482: `tickBattery(dt, drainPerSec)`
Potpis u `offgrid-runtime.js` linija 37: `(dt, drainPerSec)` — podudaranje ✅

---

### CRITICAL #6 — tickChat ✅ ISPRAVNO

`src/main.js` linija 486:
```js
tickChat(getDashboardState().elapsed || 0, { platform_alloc: alloc }, isTutorialMode())
```
Potpis u `chat-momentum.js` linija 24: `(elapsed, plan, tutorialMode)` — podudaranje ✅

`plan.platform_alloc` se koristi ispravno u `chat-momentum.js` linija 29: `Object.keys(plan.platform_alloc).filter(...)` ✅

---

### CRITICAL #7 — Alarm sistem ✅ ISPRAVNO

**tryGenerateAlarm:** `main.js` linije 508–510:
```js
const escalationBonuses = getEscalationBonuses();
const newAlarm = tryGenerateAlarm(escalationBonuses);
```
Potpis u `alarm-generator.js` linija 66: `(escalationBonuses = {})` — podudaranje ✅

**tickAlarms + return vrednost:** `main.js` linije 513–517:
```js
const expiredIds = tickAlarms(dt);
for (const id of expiredIds) {
  const alarm = missAlarm(id);
  if (alarm) processEscalation(alarm);
}
```
`tickAlarms` vraća `string[]` (IDs) — koristi se ✅. `missAlarm` vraća alarm objekat — prosleđuje se `processEscalation` ✅. `processEscalation` se poziva isključivo per missed alarm, ne svaki tik ✅.

---

## Novi bugovi (pronađeni tokom skeniranja)

### CRITICAL #8 — addActiveAlarm nikad nije pozvan CRITICAL

**Fajl:** `src/main.js` linije 747–758 (`_handleNewAlarm`), `src/micro/alarm-generator.js` linija 133

**Problem:** `tryGenerateAlarm` kreira alarm i vraća ga, ali `_handleNewAlarm` ga samo renderuje — ne poziva `addActiveAlarm`. Posledica: `ds.activeAlarms` je UVEK prazno polje.

Lanac kvarova:
- `tickAlarms(dt)` iterira prazan `ds.activeAlarms` → uvek vraća `[]` → `expiredIds` je uvek prazan → `missAlarm` se nikad ne poziva → timeout eskalacija nikad ne okida
- `resolveAlarm(alarmId, ...)` traži alarm u praznom `ds.activeAlarms` → uvek vraća `null` → `ds.alarmsResolved` nikad ne raste
- Cap od 3 simultana alarma (`ds.activeAlarms.length >= 3`) nikad se ne primenjuje → alarmi se mogu nakupiti u UI-u bez ograničenja
- Sva dostignuća (achievements) bazirana na broju rešenih/promašenih alarma nikad se ne otključavaju

**Vidljivost za igrača:** Alarm kartica se prikazuje i nestaje (DOM manipulacija radi ispravno), success chime zvuči — igrač ne primećuje grešku vizuelno, ali progresija/achievements su slomljeni.

**Ispravka:** U `_handleNewAlarm`, odmah posle `renderAlarm(alarm, overlay)`, dodati:
```js
addActiveAlarm(alarm); // import postoji u alarm-generator.js
```

---

### CRITICAL #9 — processResolution prima string ID umesto alarm objekta CRITICAL

**Fajl:** `src/main.js` linije 722 i 739

**Problem:** Obe linije pozivaju `processResolution(alarmId, action, ds)` gde je `alarmId` string. Potpis u `alarm-escalation.js` linija 82: `processResolution(resolvedAlarm)` — prima alarm objekat. Unutar funkcije, `resolvedAlarm.type` = `undefined` (`.type` na stringu vraća `undefined`), uslov `if (_escalationBonuses[resolvedAlarm.type])` uvek promašuje, bonusi nikad ne opadaju.

**Posledica:** Eskalacioni bonusi su jednosmerni — rastu kad se alarmi promaše (ispravna logika u `processEscalation`), ali nikad ne opadaju kad se alarmi rešavaju. U kombinaciji sa CRITICAL #8 (alarmi nikad ne timeoutuju pa se eskalacija ne gradi via `processEscalation`), ovo je maskirano — ali ostaje slomljeno čim se CRITICAL #8 popravi.

**Ispravka:** Uhvati povratnu vrednost `resolveAlarm` i prosledi objekat:
```js
// Trenutno:
resolveAlarm(alarmId, action, ds);
processResolution(alarmId, action, ds);

// Ispravno:
const resolved = resolveAlarm(alarmId, action);
if (resolved) processResolution(resolved);
```

---

### MEDIUM #1 — calcPlatformEngagement povratna vrednost odbačena MEDIUM

**Fajl:** `src/main.js` linije 490–497, 612–620

**Problem:** `calcPlatformEngagement(...)` u `_tickMicro` se poziva ali povratna vrednost se ne čuva. `_tickState.engagement` ostaje na inicijalnim vrednostima (`{ ig: 0.5, tiktok: 0.3, youtube: 0.2 }`) tokom cele emisije.

U `_renderMicro` (linije 612–620):
```js
engagement[p] = calcOverallEngagement(p) || 0;
```
`calcOverallEngagement` u `dashboard-state.js` linija 157 nema parametre — ignoriše `p` i vraća jedan kombinovani skalar. Rezultat: `engagement.ig === engagement.tiktok === engagement.youtube` (iste vrednosti za sve platforme).

**Posledica:** Per-platforma engagement prikazuje identičnu vrednost za sve aktivne platforme. Igrač ne može da razlikuje platformski performans.

**Ispravka:** U `_tickMicro` sačuvati povratnu vrednost i upisati u state:
```js
const engResult = calcPlatformEngagement(...);
updateDashboardState({ engagement: engResult });
```
U `_renderMicro` čitati `ds.engagement[p]` direktno umesto pozivanja `calcOverallEngagement(p)`.

---

### MEDIUM #2 — Alarm countdown bar-ovi nikad ne osvežavaju MEDIUM

**Fajl:** `src/main.js` linije 622–631; `src/micro/dashboard-state.js`

**Problem:** `initDashboardState` ne inicijalizuje `alarmTimers` ni `alarmLimits` u `_tickState`. Uslov `if (overlay && ds.alarmTimers)` (linija 624) uvek je `false` → `updateAlarmTimer` se nikad ne poziva → alarm countdown progress bar-ovi u UI-u su statični od trenutka spawna.

**Posledica:** Igrač ne vidi koliko vremena ima za reakciju. Urgentnost alarma nije vizuelno jasna.

**Ispravka (opcija A):** Inicijalizovati `alarmTimers: {}` i `alarmLimits: {}` u `initDashboardState`, puniti ih u `addActiveAlarm` i čistiti u `resolveAlarm`/`missAlarm`.
**Ispravka (opcija B):** Promeniti render logiku da čita `timeRemaining`/`timeLimit` direktno iz `ds.activeAlarms` umesto hash mape.

---

### MEDIUM #3 — Standout chat poruka prikazuje "g{id}: true" MEDIUM

**Fajl:** `src/main.js` linije 528–532

**Problem:** `tickGuestStandout` vraća `boolean` (`true`/`false`), ali main.js ga prosleđuje kao `text` u `_injectGuestStandoutChat(standout, plan.chosen_guest_id)`. Unutar funkcije:
```js
el.innerHTML = `<span class="name">💫 ${gostName || 'Gost'}</span>: ${text}`;
```
`text` je `true` → poruka glasi `"💫 g2: true"`.

Dodatno: `gostName` prima `plan.chosen_guest_id` ('g2', 'g3'...) umesto formatovanog imena gosta.

**Posledica:** Standout event — vrhunac gostovog nastupa koji treba da bude emotivni highlight — prikazuje se kao uninteligentan debug string.

**Ispravka:**
```js
if (standout && !getDashboardState().guestStandoutDone) {
  updateDashboardState({ guestStandoutDone: true });
  const moment = getStandoutMoment(plan.chosen_guest_id); // već importovano
  const profile = getGostProfile(plan.chosen_guest_id);   // iz gost-roster
  _injectGuestStandoutChat(moment?.note || 'Gost oduševljava!', profile?.name || 'Gost');
}
```

---

## Rezime

Svih 7 CRITICAL ispravki iz Fix Kruga 3 su ispravno primenjene — argumenti potpuno podudaraju potpise funkcija, event listeneri su na mestu, alarm tick/miss/escalation lanac je strukturno korektan.

Međutim, temeljniji pregled kod blokova `_handleNewAlarm` i `_handleAlarmAction` (koji nisu bili u opsegu Fix Kruga 3) otkriva dva CRITICAL-a koji su bili skriveni u prethodnim iteracijama: `addActiveAlarm` se nikad ne poziva (alarm sistem radi samo vizuelno, ne na nivou state-a), i `processResolution` prima pogrešan tip argumenta. Ova kombinacija znači da su achievement tracking, alarm cap i eskalacioni feedback kompleti slomljeni kroz celu igru, uprkos tome što vizuelni/audio feedback alarma radi ispravno.

Tri MEDIUM buga utiču na kvalitet prikaza (identičan per-platforma engagement, frozen countdown bar-ovi, standout poruka prikazuje "true") ali ne sprečavaju igranje.

**Beta score iter 4: 3.0/10**
- Baza: 8.5
- CRITICAL #8 (addActiveAlarm nije pozvan): −2.0 → 6.5
- CRITICAL #9 (processResolution pogrešan arg): −2.0 → 4.5
- MEDIUM #1 (calcPlatformEngagement povratna vrednost): −0.5 → 4.0
- MEDIUM #2 (alarm countdown bar statičan): −0.5 → 3.5
- MEDIUM #3 (standout chat "g2: true"): −0.5 → 3.0

## Preporuka

**FIX PA RELEASE**

Fix Krug 4 treba da adreksira CRITICAL #8 i #9 obavezno — oba su 2–3 linije koda svaki. Uz to, MEDIUM #3 (standout tekst) je lak win koji značajno poboljšava emotivni vrhunac emisije. MEDIUM #1 i #2 mogu u isti krug ako budžet dopušta, ili odložiti u patch_queue P2.
