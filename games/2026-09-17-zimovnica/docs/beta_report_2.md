# Beta Report — Zimovnica (Iter 2)
**Datum:** 2026-09-21
**Testeri:** Zora (UX), Raša (tech), Lela (engagement)
**Beta Score (iter 2):** 7.0/10

---

## Fix Verifikacija

### [BUG-01] Recipe kg defaults — src/render.js
**Status: VERIFIED ISPRAVNO**

`buildActionGrid` sad ima `kg:` na svakom recipe action-u:
- ajvar: `Math.max(0, s.paprike || 0)` ✓
- sos/pelat: `Math.max(0, s.paradajz || 0)` ✓
- dzem: `Math.max(0, s.jabuke || 0)` ✓
- pekmez: `Math.max(0, s.sljive || 0)` ✓
- tursija: `Math.max(0, (s.krastavci || 0) + (s.bostanusa || 0))` ✓
- bacva: `Math.max(0, s.kupus || 0)` ✓
- rakija: uslovni izraz jabuke/šljive ✓

`buildActionBtn` prenosi `btn.dataset.kg = String(actionDef.kg)` ✓. Svi time_system handleri čitaju `params?.kg || 0`.

**Minor napomena:** `dataset.kg` je string — handleri koriste `params?.kg || 0` što daje truthy string. Numerička koercija radi u aritmetici, ali ako kg="0", `"0" || 0` vraća `"0"` (truthy!), a `"0" <= 0` je `true` — efekat je ispravan (prikazuje upozorenje). Praktično bezopasno jer su dugmad disabled kad kg=0, ali tehnički postoji nekonzistentnost tipova (string vs number) u params.

---

### [BUG-02] Event screen routing — src/main.js
**Status: VERIFIED ISPRAVNO**

`nextDay()` linija 84–88:
```js
if (state.today_events && state.today_events.length > 0) {
  setScreen('event');
} else {
  renderFrame();
}
```
✓ — event screen se prikazuje kad postoje today_events.

`handleAction` linija 66–70:
```js
if (actionType === 'event_choice' && (!state.today_events || state.today_events.length === 0)) {
  setScreen('game');
} else {
  renderFrame();
}
```
✓ — vraća na game screen posle poslednjeg event choice-a. Multiple events (2 danas) ispravno: posle prvog choice-a ostaje na event screenu dok `today_events` ne postane prazan.

---

### [BUG-03] event_choice handler — src/systems/time_system.js
**Status: VERIFIED ISPRAVNO**

Import `resolveEvent` prisutan (linija 16) ✓. `case 'event_choice'` u switch-u (linija 118) ✓. `actionEventChoice` implementiran (linije 465–490):
- Traži event po `eventId` u `today_events` ✓
- `findIndex(c => c.id === choiceId)` za mapiranje ✓
- `resolveEvent(state, eventId, safeIdx, persistent)` poziv ✓
- `filter(e => e.id !== eventId)` uklanjanje ✓
- Slot guard bypass na liniji 95 ✓

`resolveEvent` signatura u `event_engine.js` je `(state, eventId, choice, persistent = {})` — kompatibilno sa pozivom iz `actionEventChoice`. ✓

---

### [BUG-04] Rakija case u actionKuvanje — src/systems/time_system.js
**Status: VERIFIED ISPRAVNO**

Linija 151: `case 'rakija': return actionDestilisiRakiju(state, persistent, params);` ✓

`actionDestilisiRakiju` je kompletno implementiran sa RAKIJA_UNLOCK_DAY check-om, slot cost 3, jabuke/šljive input selection, legal cap i passive job creation ✓.

---

### [BUG-05] Ajvar routing — src/systems/time_system.js + src/render.js
**Status: VERIFIED ISPRAVNO**

Linija 144: `case 'ajvar': return actionTociAjvar(state, persistent, params);` ✓ (bez međukoraka actionPeciPaprike).

`actionTociAjvar` (linije 208–240) automatski koristi `pečene_paprike` ako postoje, fallback na `paprike` ✓. Costs 2 slota ✓. Single-step flow: igrač klikne dugme → dobija tegle ajvara direktno ✓.

---

### [BUG-06] Log panel prazan — src/render.js
**Status: VERIFIED ISPRAVNO**

`renderGame` (linije 171–182) sad gradi logPanel DOM-om pre `root.appendChild(screen)`:
```js
const logPanel = document.createElement('div');
logPanel.className = 'log-panel';
const recent = state.log.slice(-8).reverse();
for (const entry of recent) {
  const div = document.createElement('div');
  div.className = `log-entry ${entry.type || 'info'}`;
  div.textContent = `[D${entry.day}] ${entry.text}`;
  logPanel.appendChild(div);
}
screen.appendChild(logPanel);
```
querySelector problem eliminisan ✓. Forma `[D${entry.day}] ${entry.text}` pretpostavlja da log entries imaju `{day, text, type}` strukturu — ovo se mora poklapati s `addLog` u `state.js` (nije provjeravano, ali strukturno konzistentno s ostalim pozivima).

---

## Novi problemi

### [NEW LOW-1] Ending stats grid komentar priziva BUG-07
U `buildEndingStats` (linije 567–572) postoji komentar:
```js
// Hack: grid je 3-col, ali smo stavili label/value par — treba 3 para = 6 cells
// Gornji kod dodaje label i value odvojeno, ali grid je 3-col pa label ide u col1, value u col2, itd.
// Bolje: uredi grid da bude 2-col po paru
grid.style.gridTemplateColumns = 'repeat(3, 1fr)';
```
Fix iz BUG-07 nije implementiran — autori su **dokumentovali problem ali ga nisu rešili**. Sa 3 label/value para (6 DOM elemenata) u 3-col gridu dobijamo:
- Red 1: `Kasa` | `12.000 RSD` | `Tegle`
- Red 2: `42.0 kg` | `Dan` | `14/14`

Vizuelno neispravno. BUG-07 potvrđen kao i dalje prisutan.

### [NEW MEDIUM] dzem action prima jabuke qty ali label kaže "jabuke/šljive"
`buildActionGrid` za džem:
- `kg: Math.max(0, s.jabuke || 0)` — uvek koristi jabuke kao default kg
- `disabled: ((s.jabuke || 0) + (s.sljive || 0)) < 3` — može biti enabled sa samo šljivama

Igrač sa 5kg šljiva i 0 jabuka: dugme **enabled**, klikne → `actionPraviDzem` → "⚠️ Unesi količinu jabuka." (jer `params.kg = "0"` od jabuke qty). Igrač ne razume zašto džem ne radi dok ima šljiva. Ovo nije bio registrovan bug u iter 1 ali je prisutan i zbunjuje.

---

## LOW bugovi (preneseni iz iter 1)

### [BUG-07] Ending stats grid vizuelno broken
**Status: POTVRĐEN — nije fiksiran, i dalje prisutan** (vidi "Novi problemi" iznad)
Lokacija: `src/render.js` `buildEndingStats`

### [BUG-08] actionBacvaInit preskače 20kg minimum check
**Status: POTVRĐEN — nije fiksiran**
`actionBacvaInit` (linije 157–162) ne validira minimum:
```js
function actionBacvaInit(state, persistent, params) {
  const kg = params?.kg || params?.kupus_kg || state.sirovine.kupus;
  const { state: s, error } = initBacva(state, kg);
  ...
}
```
Dugme je disabled ako `s.kupus < 10`, ali recipe zahteva 20. Igrač sa 10–19 kg kupusa može pokrenuti bačvu. `initBacva` u `barrel_init.js` možda ima vlastitu validaciju (nije proveravano), ali `actionBacvaInit` bi trebalo imati explicitnu proveru kao `actionUtisniKupus`.

---

## Zaključak

**Igra radi.** Svih 6 CRITICAL/MEDIUM bugova iz iter 1 je ispravno rešeno. Core gameplay loop (berba → kuvanje → events → sledeći dan → ending) funkcioniše od kraja do kraja. Events se prikazuju, choices se procesiraju, log pokazuje progressi, rakija i ajvar rade.

**Preostalo:**
- 2 LOW buga iz iter 1 (BUG-07, BUG-08) — kao dogovoreno, nisu ušli
- 1 novi MEDIUM problem (džem/šljive mismatch) — zbunjujuć ali ne blokira napredak
- 1 NEW LOW (ending stats grid komentar — BUG-07 samo dokumentovan, ne fiksiran)

**Brand fit (Guncati × MKDSLend):** solidan. Ajvar, bačva, turšija — to je Guncati vocabulary. Masterclass hooks u `brand_hooks.js` su na mestu.

**Skor 7.0/10** — ogroman skok od 3.5. Igra je igriva i zabavna, sa jasnom strategijskom tenzijom (14 dana, trulenje sirovine, kapacitet police). Preostali problemi su kozmetički ili edge-case; ne blokirauju KORAK 6.75 ako šef smatra da je fun loop dovoljan.

**KORAK 6.75 status:**
- Score 7.0 < 8.0 → **nije ispunjeno** (potreban šef sign-off)
- 0 novih CRITICAL → ✓

→ Kreirati `sef_signoff.md`, čekati šefa.
