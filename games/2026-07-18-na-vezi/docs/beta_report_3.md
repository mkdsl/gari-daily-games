# Beta Report 3 — Na Vezi

**Datum:** 2026-07-25
**Tip testa:** Code review (post fix krug 2, 10 naming mismatch zamena)
**Tester:** Beta Trio (Zora UX + Raša tech + Lela engagement) — code review mode, dublja verifikacija
**Beta score iter 3:** 3/10

---

## Core Mehanike — Verifikacija

### Platform allocation ✅ (naming ispravno, ali poziv calcPlatformEngagement je CRITICAL — vidi ispod)

`plan.platform_alloc` se ispravno koristi na 3 mesta:
- Linija 345: Lock-in summary — `const alloc = plan.platform_alloc || {}`
- Linija 470: `_tickMicro` — `const alloc = plan.platform_alloc || { ig: 100, tiktok: 0, youtube: 0 }`
- Linija 572: `_renderMicro` — isti pattern

`tickChat(dt, alloc, momentum)` dobija ispravan alloc objekat. Naming fix je primenjen.

**UPOZORENJE:** Poziv `calcPlatformEngagement` unutar for-petlje (main.js 491-496) prosleđuje pogrešne argumente — vidi CRITICAL #1 ispod.

### Gost dolazak ❌ KRITIČNO

Naming fix `plan.guest` → `plan.chosen_guest_id` je primenjen (linije 416, 420, 528, 531), ali je otkrio
dubji bug koji pre fix kruga 2 nije bio vidljiv:

`handleGuestArrival` u `src/micro/guest-runtime.js` (linija 21) prima JEDAN argument tipa `arrivalResult` — objekat oblika `{ arrived: bool, noShow: bool }`:

```js
export function handleGuestArrival(arrivalResult) {
  if (arrivalResult.noShow) { emit(EVENTS.GUEST_NOSHOW, ...) }
  else if (arrivalResult.arrived) { emit(EVENTS.GUEST_ARRIVED, ...) }
}
```

Ali main.js linija 420 ga zove:
```js
handleGuestArrival(plan.chosen_guest_id, getState());
// plan.chosen_guest_id = string npr. 'g1'
```

String `'g1'` nema `.noShow` ni `.arrived` (oba su `undefined` → falsy).
`EVENTS.GUEST_ARRIVED` i `EVENTS.GUEST_NOSHOW` se nikad ne emituju.
`ds.gostArrived` ostaje `false` za celo trajanje emisije.

Posledice:
- `tickGuestStandout` uvek vraća `false` (proverava `ds.gostArrived`, linija 40 guest-runtime.js)
- `calcOverallEngagement` u dashboard-state.js linija 165: `if (gostArrived) gostFactor = ...` → uvek 0
- `emisija-resolver.js` linija 61: svaki bookovan gost tretira se kao no-show

Ispravka: poziv treba biti:
```js
import { resolveGostArrival } from './content/gost-roster.js';
// ...
const arrivalResult = resolveGostArrival(plan.chosen_guest_id);
handleGuestArrival(arrivalResult);
```

`resolveGostArrival` (gost-roster.js linija 149) vraća upravo `{ arrived: bool, noShow: bool }`.

### Battery/offgrid ✅

- `ds.offgrid` je validno polje — inicijalizovano u `initDashboardState` (dashboard-state.js linija 29: `offgrid: emisijaCapacity`)
- Main.js linija 587-591: `renderOffgridMeter(ds.offgrid !== undefined ? ds.offgrid : ...)` radi ispravno
- `tickBattery` u `_tickMicro` step 3 ažurira `_tickState.offgrid` svaku sekund

Naming fix `ds.offgridCapacity` → `ds.offgrid` je ispravan i funkcioniše.

### Lock-in summary ✅

Linija 354: `${Math.round(plan.weekly_capacity || 80)}%` — prikazuje pravi weekly kapacitet.
`initDashboardState` prima `_initWp.weekly_capacity` kao 4. argument (linija 399). Funkcioniše.

---

## Novi CRITICAL bugovi

### CRITICAL #1 — `calcPlatformEngagement` pogrešan poziv → TypeError svake sekunde → igra se ne završava

Potpis funkcije (`src/micro/platform-curves.js` linija 31):
```js
calcPlatformEngagement(elapsed, signalLevel, chatMomentum, gostArrived, format, platformAlloc)
//                       broj    broj 0-100   {ig,tt,yt}   bool         string  {ig,tt,yt}
```

Main.js linije 491-496 ga zove u for-petlji:
```js
for (const platform of ['ig', 'tiktok', 'youtube']) {
  if ((alloc[platform] || 0) > 0) {
    calcPlatformEngagement(
      platform,              // STRING — ide kao `elapsed` (treba broj)
      currentDs.elapsed || 0, // ide kao `signalLevel` (treba signal 0-100)
      alloc[platform],       // BROJ (npr. 60) — ide kao `chatMomentum` (treba objekat)
      momentum[platform] || 0.2  // BROJ — ide kao `gostArrived` (treba bool)
      // format   = undefined (5. arg nije prosleđen)
      // platformAlloc = undefined (6. arg nije prosleđen)
    );
  }
}
```

Unutar funkcije, linija 41: `if (platformAlloc.ig > 0)` — baca **TypeError: Cannot read properties of undefined (reading 'ig')**.

Ova greška propagira iz `_tickMicro()` kroz `while (_tickAccum >= 1.0)` petlju u `_gameLoop()`.
`_renderMicro()` linija posle while petlje NE IZVRŠAVA SE na svakom tik-frame.

Sve što dolazi POSLE step 5 u `_tickMicro` nikad ne izvršava:
- Step 6: `tryGenerateAlarm` — alarmi se nikad ne generišu automatski
- Step 8-9: alarm rešavanje, EQ minigame okidanje — nikad
- Step 11: `tickGuestStandout` — nikad (i ionako blokirano CRITICAL #2)
- Step 12: `checkAllAchievements` — nikad
- **Step 13: `if (isEmisijaOver() && !_emisijaEnded)` — NIKAD se ne poziva**

**Posledica: Timer odbroji do 00:00 ali emisija se NIKAD ne završava prirodno.
Igrač je zarobljen u micro layeru beskonačno. Jedini izlaz je ručno dugme "⏹ Završi emisiju".**

Ispravka (jedan poziv van petlje):
```js
const freshDs2 = getDashboardState();
calcPlatformEngagement(
  freshDs2.elapsed || 0,       // elapsed
  freshDs2.signal || 100,      // signalLevel
  getAllMomentum(),             // chatMomentum — ceo objekat
  freshDs2.gostArrived || false, // gostArrived
  plan.format || 'dj_lajv',   // format
  alloc                        // platformAlloc — ceo alloc objekat
);
```

Severity: **CRITICAL** — igra ne može da se normalno završi.

---

## LOW bugovi iz iter 2 — re-evaluacija

### L1 — `resolveSignalAction` pozvan sa 2 argumenta (prima 1)

`signal-system.js:29`: `export function resolveSignalAction(action)` — 1 param.
`main.js:728,731,734`: `resolveSignalAction('reroute', ds)`, `resolveSignalAction('push', ds)`.

Unutar funkcije odmah se poziva `getDashboardState()` sama — `ds` argument se potpuno ignoriše.
Nema greške, nema pada, nema uticaja na logiku.

**Ostaje LOW — harmless ignore.**

### L2 — Nema top-level error boundary

Nema try-catch u `_gameLoop`. CRITICAL #1 (TypeError) ne vidimo kao vidljivi crash u UI — greška
se tiho guta od strane browser-a, RAF nastavlja. Bez error boundary-a, CRITICAL bugovi postaju
"igra radi ali ne radi" umesto jasne greške. Ovo je razlog zašto se igra score 5.3/10 percipirala
kao "delimično funkcionalna" u iter 2 — greške su bile tihe.

**Ostaje LOW pre-release, preporučuje se kao P1 u patch_queue posle release-a.**

---

## Rezime

Fix krug 2 je ispravno rešio naming mismatche ali je u procesu otkrio dva dublja buga. CRITICAL #2
(handleGuestArrival tip mismatch) je bio skriven jer je `plan.guest` bio undefined pa se uslov
`if (plan.chosen_guest_id)` nikad nije izvršavao. CRITICAL #1 (calcPlatformEngagement argument
order) je novi regresioni bug: pre fixa, platformAlloc je bio prazan ({}) pa se petlja nikad nije
izvršavala; posle fixa, alokacije su non-zero pa petlja pokušava poziv i pada. Igra se ne može
normalno završiti — to je blocker.

**Beta score procena: 3/10** (timer i baterija rade, chat delimično, sve ostalo broken)

## Preporuka

**FIX PA RELEASE** — 2 targetirane ispravke u `src/main.js`:

1. **Linija ~420** (CRITICAL #2 — gost): dodati import `resolveGostArrival` iz `./content/gost-roster.js`, zameniti `handleGuestArrival(plan.chosen_guest_id, getState())` sa:
   ```js
   handleGuestArrival(resolveGostArrival(plan.chosen_guest_id));
   ```

2. **Linije ~489-497** (CRITICAL #1 — calcPlatformEngagement): zameniti for-petlju jednim ispravnim pozivom sa svim 6 argumenata i ispravnim redosledom (elapsed, signal, momentumObjekat, gostArrived, format, allocObjekat).
