# Tiha Avala — Game Design Document
**Autor:** Mile Mehanika
**Datum:** 2026-05-12
**Ulaz:** concept.md + premortem.md (sve Negine korekcije ugrađene)

---

## Ulazni Parametri (Sliders)

| Slider | Range | Default | Korak |
|--------|-------|---------|-------|
| Master SPL | 80–130 dB | 100 dB | 0.5 dB |
| Bass Ratio | 0–100% | 50% | 1% |
| Speaker Angle | -60°–+60° | 0° | 1° |

Angle je relativan: 0° = direktno prema dance flooru. Negativno = levo, pozitivno = desno.

---

## Akustičke Formule

### Dance Floor Srećnost (Hs)

```js
const raw_coverage = Math.max(0, (60 - Math.abs(angle)) / 60); // 0..1
const bass_mod = (bass_ratio < 30 ? -0.2 : 0) + (bass_ratio > 85 ? -0.15 : 0);
const Hs = clamp(
  (spl - level.min_spl) / level.spl_range * raw_coverage + bass_mod + level.dance_boost,
  0, 1
);
```

**Zelena zona:** Hs > 0.70

### Komšija SPL (Kdb) — po svakom komšiji posebno

```js
const path_mod = neighbour.terrain_path.reduce((sum, t) => sum + TERRAIN_MOD[t], 0);
const angle_atten = compute_angle_atten(angle, neighbour.direction_from_stage);
const wind_mod = level.has_wind ? windState.current_delta : 0;
const Kdb = spl - 20 * Math.log10(neighbour.distance) + path_mod + angle_atten + wind_mod;
```

**Crvena zona:** Kdb > 70 dB → inspekcija (FAIL)
**Upozorenje:** Kdb > 67 dB → early warning lampica

### Angle Attenuation

```js
function compute_angle_atten(speaker_angle, direction_to_neighbour) {
  const diff = Math.abs(speaker_angle - direction_to_neighbour);
  if (diff > 60) return -12;  // van fokusa
  if (diff > 30) return -5;   // parcijalni fokus
  return 0;                    // direktno
}
```

---

## Terrain Modifikatori (Gameplay-kalibrisani)

| Teren | Mod (dB) | Napomena |
|-------|----------|----------|
| Otvoreno | 0 | Baseline |
| Borova šuma | -10 | Apsorpcija |
| Dolina | +7 | Amplifikacija |
| Asfalt/beton | +4 | Refleksija |
| Brdo (shadow zone) | -18 | Blokada |

---

## 6 Nivoa — Kompletne Specifikacije

### Nivo 1: Livada (Tutorial)
- Teren: sve otvoreno (sve terrain_mod = 0)
- Komšije: 1 kuća, 80m, direction = +40° (malo desno)
- `min_spl`: 88, `spl_range`: 20, `dance_boost`: +0.15
- Win sweet spot: SPL~100, Bass~50%, Angle~0°
- Hints: puni tutorial — strelice, tooltipovi, objašnjenja svakog slidera
- Nema fail-a prvih 30s (grace period za onboarding)

### Nivo 2: Borova Šuma
- Teren: šuma između bine i komšije (terrain_path: ['forest'])
- Komšije: 1 kuća, 120m, direction = 0°
- `min_spl`: 93, `spl_range`: 18, `dance_boost`: +0.05
- Twist: šuma blokira → mora podesiti više SPL nego što igrač očekuje
- Educativni tooltip na startu: "Šuma apsorbuje zvuk. Mora jaće, ali bezbedno."
- Win sweet spot: SPL~110, Bass~60%, Angle~0°

### Nivo 3: Avala Dolina
- Teren: dolina (+7 dB) između bine i komšija
- Komšije: 2 kuće: L(60m, -30°, dolina), R(65m, +35°, dolina)
- `min_spl`: 88, `spl_range`: 15, `dance_boost`: 0
- Twist: Speaker Angle je ključan — usmeri ka centru, izbegni obe strane
- Win sweet spot: SPL~92, Bass~55%, Angle~0° (±5° tolerance)

### Nivo 4: Zidovi Sela
- Teren: asfalt (+4 dB) sve oko
- Komšije: 2 kuće: A(50m, -45°, asfalt), B(70m, +50°, asfalt)
- `min_spl`: 88, `spl_range`: 16, `dance_boost`: 0
- Twist: Bass ratio mora biti < 55% (visoki bass + asfalt = refleksija → više dB)
- Bass penalty za Kdb: `kdb += (bass_ratio - 50) * 0.08` (ako bass > 50%)
- Win sweet spot: SPL~93, Bass~45%, Angle~±10°

### Nivo 5: Vetrovita Noć
- Teren: mešovito (šuma parcijalna -5 dB, asfalt delimično +2 dB)
- Komšije: 2 kuće: A(70m, -20°, mixed), B(80m, +25°, mixed)
- `min_spl`: 90, `spl_range`: 16, `dance_boost`: 0, `has_wind`: true
- Wind: `sin(2π * t / 8000) * 4` — period 8s, amp ±4 dB
- Vizualni wind indikator obavezan (listovi na mapi, smer)
- Win condition: oba merača u zelenoj zoni tokom PUNOG 10s (i sa wind-om)
- Buffer logika: target sweet spot mora imati ≥ 4 dB marginu od 70 dB
- Win sweet spot: SPL~96 (buffer od wind-a), Bass~50%, Angle~0°

### Nivo 6: Generalna Proba (Boss)
- Teren: kombinovano — šuma levo (-10), dolina desno (+7), brdo iza (-18)
- Komšije: 3 kuće: L(60m, -50°, šuma), R(55m, +45°, dolina), C(100m, 0°, brdo)
- Dual speaker arrays: player kontroliše L i R zvučnik odvojeno
  - L zvučnik: sopstveni SPL + Angle slider (Angle locked negative range)
  - R zvučnik: sopstveni SPL + Angle slider (Angle locked positive range)
  - Dance floor Hs = avg(Hs_L, Hs_R)
- Win condition: sva 3 Kdb < 70, Hs > 0.70
- Win sweet spot: L(SPL~95, Angle~-25°), R(SPL~95, Angle~+25°)

---

## Score Sistem

```js
const time_bonus = Math.max(0, 300 - solve_time_seconds) * 10; // max 3000
const margin_bonus = (70 - max_neighbour_Kdb) * 50;            // bolje margina = više
const level_score = time_bonus + margin_bonus;
```

Persistencija: `localStorage['tiha-avala-scores']` = `{ level_bests: [0,0,0,0,0,0], total_best_time: null }`

---

## Sim State Machine

```
IDLE → [klikni TESTIRAJ] → SIMULATING
SIMULATING → [oba uslova 10s] → LEVEL_WIN
SIMULATING → [max Kdb > 70] → FAIL_INSPECTION
SIMULATING → [Hs < 0.5 za 5s] → FAIL_CROWD
SIMULATING → [klikni ZAUSTAVI] → IDLE (zadrži vrednosti)
LEVEL_WIN → [DALJE] → sledeći nivo IDLE
LEVEL_WIN → [PONOVO] → isti nivo IDLE
FAIL_* → [POKUŠAJ PONOVO] → isti nivo IDLE
```

U SIMULATING fazi: sliders su disabled. Animacija teče. Merači se update-uju u realnom vremenu.

---

## Wind State (Nivo 5)

```js
// U systems/wind.js
let windPhase = 0;
export function updateWind(dt) {
  windPhase = (windPhase + dt) % 8000;
  return 4 * Math.sin(2 * Math.PI * windPhase / 8000); // returns ±4 dB
}
```

Wind indicator na canvas: animirani listovi koji se pomeraju u smeru trenutnog wind vektora.

---

## Balance Tabela (Target Sweet Spots)

| Nivo | Target SPL | Bass | Angle | Max Kdb (bez winda) |
|------|-----------|------|-------|---------------------|
| 1 | 100 dB | 50% | 0° | ~57 dB |
| 2 | 110 dB | 60% | 0° | ~62 dB |
| 3 | 92 dB | 55% | 0° | ~66 dB |
| 4 | 93 dB | 45% | ±10° | ~66 dB |
| 5 | 96 dB | 50% | 0° | ~68 dB peak | 
| 6 | L:95/R:95 | L:50/R:45 | L:-25/R:+25 | ~69 dB |

---

## Modularna Struktura

```
games/2026-05-12-tiha-avala/
├── index.html
├── manifest.json
├── styles/
│   ├── base.css          Layout, canvas, mobile-first
│   ├── ui.css            Sliders (custom touch), dugmadi, merači
│   ├── game.css          Talas animacija, wind listovi, canvas wrapper
│   └── theme.css         Kluboslavija paleta, tipografija
└── src/
    ├── main.js           Boot, scene routing
    ├── config.js         Konstante, TERRAIN_MOD, SPL thresholds
    ├── state.js          Centralni state objekat
    ├── input.js          Slider + button event handlers
    ├── render.js         Canvas: terrain, talasi, speaker cone, wind, neighbours
    ├── ui.js             HUD, merači, slider UI, level select
    ├── audio.js          Web Audio engine (ambient, crowd, sfx)
    ├── systems/
    │   ├── acoustics.js  compute_Hs, compute_Kdb, angle_atten
    │   ├── wind.js       Sinus wind oscillator
    │   ├── sim.js        Simulation runner (timer, pass/fail)
    │   ├── score.js      Score + localStorage
    │   └── progression.js Nivo unlock
    ├── levels/
    │   └── level_data.js 6 nivoa kao data array
    ├── content/
    │   ├── hints.js      Tutorial tekstovi
    │   └── brand.js      Kluboslavija strings + countdown
    └── entities/
        ├── map.js        Terrain tiles + draw data
        ├── speakers.js   Speaker entity (single + dual)
        └── neighbours.js Neighbour entity + Kdb tracker
```

Target: ~7500 JS linija + ~900 CSS linija
