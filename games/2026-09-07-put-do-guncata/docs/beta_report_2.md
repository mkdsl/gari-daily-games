# Beta Report — Put do Guncata — Iter 2

**Datum:** 2026-09-09
**Tim:** Beta Trio — Zora (UX), Raša (tech), Lela (engagement)
**Score: 8.1 / 10**

---

## Verifikacija fix-ova iz Iter 1

### CRITICAL-1: onPlayAgain callback u etapa5 — REŠEN ✓

`main.js` (linija 41): `mod.mount(container, st, { ...cbs, onPlayAgain: cbs.onEnd || cbs.next })`

Pravilno. `etapa5-dolazak.js` destrukturiše `onPlayAgain` iz callbacks-a i poziva ga u `mountEndScreen` wrapper-u:

```js
onPlayAgain: () => {
  unmountEndScreen();
  if (onPlayAgain) onPlayAgain();
},
```

Restart dugme sada funkcioniše — igrač se vraća na meni, state se resetuje na "Kreni" klik (koji poziva `initState()` + `resetBranching()`). Kompletan restart flow: Ponovo → meni → Kreni → nova vožnja od etape 1. CRITICAL rešen.

### MEDIUM-1: initHUD pozvan iz main.js — REŠEN ✓ (sa napomenom)

`main.js` (linije 7, 25-28): `import { initHUD }` + poziv posle `routerInit`. HUD element se kreira i `prepend`-uje u `#game-container`. Pripremljenost bar, progress dots i delta popup su vizuelno prisutni tokom igre.

**Napomena (LOW-4 dole):** Fix je uveo duplikat `#hud` ID — vidi novi bug sekciju.

### MEDIUM-2: Broken og:image uklonjen — REŠEN ✓

`index.html` ne sadrži više `<meta property="og:image">` koji je referisao nepostojeći `og.png`. OG preview više ne pokazuje pokvarenu sliku.

### MEDIUM-3: etapa2 scoreEl color hint — REŠEN ✓

`etapa2-autoput.js` (logika u `onEventResult`): `scoreEl` dobija zelenu ili crvenu boju na 800ms kada igrač reaguje na event. Vizuelni smer promene je odmah čitljiv bez čekanja da `_floatDelta` animacija dovrši ažuriranje broja.

### MEDIUM-4: PRESTIGE.RUNS_REQUIRED = 3 — REŠEN ✓

`config.js` (linija 74): `RUNS_REQUIRED: 3`. Noćna vožnja se više ne otključava posle prve vožnje. Prestige je sada prikladan kao mid-term unlock.

### LOW-1: resetBranching() na startu runa — REŠEN ✓

`main.js` (linije 8, 122): import + poziv u `startBtn` click handler-u, pre `state.isRunning = true`. Branching state se čisti između runova.

### LOW-2: Dead import uklonjen — REŠEN ✓

`main.js` (linija 6): `import './input.js'` — named import `attachTo` ispravno uklonjen.

### LOW-3: Toast za Brže i Sigurnije rute — REŠEN ✓

`etapa3-skretanje.js` (linije 81-101): `_showToast` helper kreiran sa `.e3-toast` CSS klasom. Rute "Brže" i "Sigurnije" prikazuju odgovarajući toast poruku 1500ms pre prelaska na etapu 4. CSS animacija (e3toastIn) i pozicioniranje su korektni.

---

## Novi bugovi pronađeni u Iter 2

### LOW-4 — Duplikat `#hud` ID u DOM-u

**Fajl:** `index.html` (linija 34) + `src/ui.js` (linija 54)

`index.html` već sadrži `<div id="hud" role="banner">` kao dete `#game-container`. `initHUD()` u `ui.js` kreira još jedan `<div id="hud">` i prepend-uje ga na isti kontejner.

Rezultat u DOM-u:
```
#game-container
  ├─ #hud (kreiran od initHUD — ima sadržaj, vidljiv) ← prepend
  ├─ #hud (iz HTML — prazan) ← ostaje, duplikat
  └─ #game-stage
```

HTML invalidan (duplikat IDs). Vizuelno je trenutno OK jer prazni div ne zauzima prostor, a CSS targetuje prvog. `document.getElementById('hud')` vraća ispravni element. Ali je tehnički dug i može postati problem ako `ui.css` HUD stilovi imaju `display:flex` ili `min-height` koji bi renderovao prazni div kao prostor.

**Fix:** Ukloniti `<div id="hud">` iz `index.html` (ostaviti ga da `initHUD` kreira dinamički) — ili alternativno: `initHUD` da ne kreira novi element već da popuni postojeći.

### LOW-5 — onPlayAgain null-path u etapa5 (edge case)

**Fajl:** `src/main.js` (linija 41)

`onPlayAgain: cbs.onEnd || cbs.next` — ako router ne preda ni `onEnd` ni `next` (edge case pri netipičnom pozivanju scene 5 van normalnog flow-a), `onPlayAgain` u etapa5 defaultuje na `() => {}` tiho. "Ponovo" dugme bi postalo vizuelni no-op bez loga. U normalnom flow-u router uvek daje `cbs.next`, pa ovo neće uticati na igrača — ali nema guard log za debugging.

**Fix (opcionalan):** Dodati `console.warn` u etapa5 mount kada je `onPlayAgain` fallback.

---

## Pregled severity posle Iter 2

| Severity | Iter 1 | Iter 2 (novo) | Status |
|----------|--------|---------------|--------|
| CRITICAL | 1 | 0 | Sve rešeno ✓ |
| MEDIUM | 4 | 0 | Sve rešeno ✓ |
| LOW | 3 | 2 | LOW-4, LOW-5 novi |

---

## Zora (UX) — komentar

Prvih 5 minuta funkcionišu glatko. Menu → Etapa 1 → … → Etapa 5 → Ponovo → Menu — loop je zatvoren. HUD je vidljiv i čitljiv tokom vožnje. Toast na skretanju daje jasnu potvrdu izbora. Epilog sekvenca u etapi 5 (narativne linije, Brana ambient, end-screen) ima atmosferu i pacing koji drže pažnju. Brand utility za Guncati je autentičan — igra deluje kao content marketing, ne kao random mini-igra.

## Raša (tech) — komentar

Nema runtime crash-a u normalnom flow-u. ES6 moduli, no dependencies. Dinamički import za etapa5 radi korektno sa fallback-om. LOW-4 (duplikat ID) je tehnički dug ali ne crash. LOW-5 je edge-case koji neće pogoditi stvarnog igrača. PRESTIGE.RUNS_REQUIRED ispravno pisan u config.js, prestige logic ga čita.

## Lela (engagement) — komentar

Replay hook postoji — prestige (noćna vožnja) je sada pravilno gated na 3 runa. Brzo-prvi-run traje ~5-7 minuta, što je solidno za share-worthiness. Tri rute daju razlog za replay pre prestige-a (koji outcome, koji epilog). "Ponovo" dugme radi — ovo je bilo ključno. Score bucket vizualizacija na kraju daje jasnu naredbu akcije (podeliti ili pokušati ponovo).

---

## Zaključak

**Score: 8.1 / 10**
**CRITICAL bugovi: 0**

KORAK 6.75 gate: **PROŠAO** (score ≥ 8.0, 0 CRITICAL).

Igra je u stanju za release. LOW-4 (duplikat #hud) i LOW-5 (onPlayAgain guard) mogu ući u `patch_queue.md` kao P2/P1 post-release, ne blokiraju izlazak. Šef final check kroz `play_url` — pogledati narativni epilog na "Slikovitiji put" ruti za Brana FULL integraciju.
