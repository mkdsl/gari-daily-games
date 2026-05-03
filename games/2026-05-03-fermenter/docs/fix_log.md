# Fix Log — Fermenter: Varenički Bunt

## Bug 1 — CRITICAL: Upgrade panel se nikad ne auto-osvežava

**Fajl:** `src/main.js`

U UI throttle bloku (oko linije 154), neposredno posle poziva `updateHUD(state)`, dodat je poziv `renderUpgradePanel(state, handleUpgradeBuy)`. Panel se sada osvežava svakih `CONFIG.UI_UPDATE_INTERVAL` ms (100ms), što znači da dugmad postaju `enabled` čim igrač skupi dovoljno SJ pasivno — bez potrebe za ručnim klikom.

## Bug 2 — MEDIUM: Audio ne radi na Chrome (AudioContext suspended)

**Fajlovi:** `src/audio.js` i `src/main.js`

**audio.js:** U `initAudio()`, posle kreiranja novog `AudioContextClass` instance, dodata je provera i resume:
```js
if (audioCtx.state === 'suspended') {
  audioCtx.resume().catch(() => {});
}
```
Funkciaja je već bila idempotent za slučaj kad `audioCtx !== null` (imala je resume logiku), ali nije imala resume odmah pri kreaciji — Chrome može odmah suspendovati novi context.

**main.js:** U `handleBarrelClick`, na samom početku (odmah posle `if (paused) return;`), dodat je poziv `initAudio()`. Ovo osigurava da se na svaki klik na bure pokuša resume AudioContext-a, što je user gesture koji Chrome zahteva.

## Bug 3 — MEDIUM: M2 mutacija (Etanol-Rezistentan) nema efekta

**Fajl:** `src/state.js`

U `computeDerivedStats`, posle linije gde se finalizuje `state.fermentRate` (nakon primene degradacije), dodat je M2 blok:
```js
// M2 Etanol-Rezistentan: +15% fermentRate kad je SJ buffer >=90% kapaciteta
if (state.activeMutations.includes('M2') && state.sj >= CONFIG.SJ_CAPACITY * 0.9) {
  state.fermentRate *= 1.15;
}
```
M2 sada daje +15% `fermentRate` kad je SJ buffer skoro pun (>=90% kapaciteta), čime efikasno kompenzuje "ceiling penalty" situaciju — igrač ne gubi momentum dok čeka da potroši SJ.
