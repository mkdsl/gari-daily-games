## BETA TEST REPORT 2 — Pečurka Inokulator (iter 2)

**Testeri:** Beta Trio (Zora + Raša + Lela)
**Datum:** 2026-06-02
**Baza:** fix_log.md (iter 1 → iter 2)

### Ukupna ocena: 7.5/10

---

### Verifikacija CRITICAL fix-ova

- **C1 (Blink collision): ✅ FIKSIRANO**
  `collision.js` red 35: `if (timingState.blinkState === false) return { hit: false, type: 'miss' };`
  Provera se radi pre provere granica zelenog prozora, dakle kad je prozor nevidljiv klik uvek vraća `miss`.
  Jedina sitnica (nije bug): `blinkState` check ne blokira `goldenBounds` (zlatni prozor se proverava pre blink checka, red 27–30). Zlatni prozor je aktivan u `all_combined` (nivo 10) koji ima i blink — igrač može da pogodi zlatni i dok je zeleni nevidljiv. Ovo je **namerna i ispravna** odluka (zlatni ne treperi), ali nije eksplicitno dokumentovano.

- **C2 (Audio dead code): ✅ FIKSIRANO**
  `main.js` importuje `resumeAudio`, `playBlink`, `playPerfect` (redovi 19, 27–28).
  `timing.js` `update()` vraća `{ tick, blinkToggled }` (red 40).
  Game loop (main.js red 313–315): `if (blinkToggled && audioReady) playBlink();` — poziva se na svakom frame-u gde se stanje promeni.
  `levelClear()` (main.js red 240): `if (audioReady) playPerfect();` — poziva se kad `missCount === 0`.
  `resumeAudio` (main.js red 339–341): poziva se na `visibilitychange` sa iOS guard-om.
  Sve tri funkcije su sada živodane i pravilno okačene.

- **C3 (Nivo 10 multi-bag): ✅ FIKSIRANO — uz rezervu (vidi novi bug NB1)**
  `config.js` red 16: `{ id: 10, ..., speciality: 'all_combined', multiCount: 2 }` — `multiCount` dodan.
  `bag.js` red 120: `if ((speciality === 'multi_bag_2' || speciality === 'all_combined') && multiCount) simultaneous = 2;` — `all_combined` tretira se kao `multi_bag_2`.
  Vreće se kreiraju u grupama od 2, side-by-side.
  **Rezerva:** Vidi NB1 ispod — vizuelni raspored je ispravan ali interakcija je i dalje sekvencijalna unutar grupe.

---

### Verifikacija MEDIUM fix-ova

- **M1 (Direction change): ✅ FIKSIRANO**
  `window.js` red 65: `this.usesSinusoid = (sp === 'tutorial');`
  `direction_change` je uklonjen iz `usesSinusoid` uslova — nivo 3 sada koristi linearni mod.
  `update()` red 125: `if (sp === 'direction_change' || sp === 'all_combined')` — `dirChangeTimer` radi normalno.
  Smjer se menja svake 1200–2400ms (randomizovano), što daje predvidiv ali ne dosadan ritam.

- **M2 (Countdown bar): ✅ FIKSIRANO**
  `ui.js` red 179: `<div class="lc-countdown-bar"><div class="lc-countdown-fill"></div></div>`
  CSS `lc-drain` animacija: `3s linear forwards`, `scaleX(1 → 0)`.
  Vizuelni indikator je prisutan i vremenski usklađen sa `LEVEL_CLEAR_AUTO_MS: 3000`.

---

### Novi bugovi (ako postoje)

#### MEDIUM — NB1: Multi-bag vreće se prikazuju side-by-side ali reaguju sekvencijalno

**Fajlovi:** `src/main.js` (red 214–221), `src/render.js` (red 349–362), `src/entities/bag.js` (red 148)

**Opis:**
U multi-bag modu (nivo 7, 9, 10), dve vreće su postavljene jedna pored druge u grupi. Render prikazuje SVE vreće iz aktivne grupe odjednom (`renderBags` prikazuje celu grupu bez filtriranja po statusu). Međutim, `state.activeBagIndex` napreduje jedan po jedan — tek kad je `bags[0]` inokulisan, aktivira se `bags[1]`. Igrač vidi dve vreće od kojih je samo jedna stvarno aktuelna meta.

**Konkretan scenario (nivo 10, 4 vreće u grupama od 2):**
- Prikazuju se vreće [0] i [1] istovremeno.
- `activeBagIndex = 0` → samo vreća 0 prima pogotke.
- Tek posle inokulacije vreće 0, aktivira se vreća 1 (i dalje ista vizuelna pozicija).
- Igrač ne zna koja je "aktivna" — strelica postoji ali je suptilna.
- Nije katastrofalno (igra je igriva), ali zbunjuje prvi put.

**Procena:** Originalni C3 fix je ispravio konfiguraciju i layout, ali nije ispravio semantiku "simultano". Naziv `multi_bag` implicira da se obe vreće inokulišu paralelno — sada to nije slučaj. Ovo je MEDIUM jer ne puca igru, ali degradira nivo 10 experience.

**Predlog fixa:** Ili (a) inokulisati obe vreće u grupi pri svakom pogotku (dok god je `activeBagIndex` unutar grupe), ili (b) eksplicitno promeniti naziv mehanike u "sekventu vreća" i dodati bolji vizuelni cue koja je aktivna.

#### LOW — NB2: `isClickInWindow` u `TimingManager` nije usklađen sa `checkClick` iz `collision.js`

**Fajl:** `src/timing.js` red 76–79

`TimingManager.checkClick()` delegira na `TimingWindow.isClickInWindow()` koji ne proverava `blinkState` ni fake zone. Ovaj metod nije direktno pozivan u game loopu (main.js koristi `checkClick` iz `collision.js`), ali ako ga neko greškom pozove, vratiće netačan rezultat. Mrtvi kod, nije bloker — ali može izazvati zbunjenost pri budućoj izmeni.

#### LOW — NB3: `btn-next-level` ima dva `addEventListener` — timer se ne cancelluje ispravno

**Fajl:** `src/ui.js` redovi 183–195

```js
const btn = document.getElementById('btn-next-level');
btn?.addEventListener('click', () => { this.hideMenu(); onContinue(); }); // red 184
// ...
btn?.addEventListener('click', () => clearTimeout(timer), { once: true }); // red 195
```

Oba listenera su zakačena, ali ne kao `{ once: true }` za prvi. Drugi listener ispravno cancelluje timer. Problem: kad igrač klikne dugme, `onContinue()` se poziva (novi level startuje), i posle 3s timer i dalje može da okine ako `hideMenu()` nije uklonio DOM element (timer drži closure). U praksi `hideMenu()` čisti `innerHTML` pa `onContinue` nikad ne dolazi dvaput, ali je krhka konstrukcija. Nije bloker.

---

### Zaključak

- **Da li se igra može objaviti?** USLOVNO
- **Preostali blockers:**
  - NB1 (MEDIUM): Multi-bag simultanost je lažna — vizuelno side-by-side, funkcionalno sekvencijalno. Nivo 10 ne čini ono što tvrdi. Preporučuje se fix pre release-a ili eksplicitno dokumentovanje u GDD-u kao "sekventu" mehanike.
- **NB2 i NB3 su LOW** — mogu ići u "next pass" ili ostati kako jesu.
- Sva tri CRITICAL buga iz iter 1 su ispravno fiksirani. Oba MEDIUM fixa su ispravna. Igra je stabilna i igriva kroz nivoe 1–9. Nivo 10 experience je umanjen zbog NB1.
