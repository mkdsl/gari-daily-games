# Fix Log — Sound vs Tišina (Polish Stage)
**Datum:** 2026-05-22
**Agent:** Jova (Polish Stage)

---

## FIX 1 — CRITICAL: UPGRADES import iz pogrešnog modula
**Fajl:** `src/main.js`
**Pre:** `import { TICK_RATE, GAME_DURATION_REAL_SEC, UPGRADES } from './config.js';`
**Posle:**
```js
import { TICK_RATE, GAME_DURATION_REAL_SEC } from './config.js';
import { UPGRADES } from './content/upgrades.js';
```
**Efekat:** Igra se sada može pokrenuti. ES module error je uklonjen.

---

## FIX 2 — MEDIUM: Mobilni termometar broken (height vs width)
**Fajl:** `src/ui/hud.js`
**Problem:** JS koristio samo `style.height` ali CSS game.css na mobile menja termometar u horizontalan layout koji zahteva `style.width`.
**Fix:** `updateThermometer()` sada detektuje `window.innerWidth <= 600` i setuje odgovarajuću dimenziju (width na mobile, height na desktop). Marker pozicija je takođe adaptivna (`left` vs `bottom`).

---

## FIX 3 — MEDIUM: Typo u game-over titlu
**Fajl:** `src/ui/game-over.js`
**Pre:** `'Sjajna večera!'`
**Posle:** `'Sjajno veče!'`

---

## FIX 4 — MEDIUM: Share dugme nedostajalo na game-over ekranu
**Fajl:** `src/ui/game-over.js`
**Problem:** `share.js` je bio implementiran ali nikad pozvan. Game-over ekran nije imao share dugme.
**Fix:** `showGameOver()` sada injektuje Share dugme u `.go-actions` ako već ne postoji, sa pozivom `shareScore(state)`.

---

## FIX 5 — Flesh-out: `src/systems/spl-engine.js`
**Problem:** Funkcija `happiness()` koristila linearni ramp koji je davao realne skor vrednosti samo u uskom opsegu.
**Fix:** Prepisana `happiness()` sa više-zonskim mapiranjem:
- < 70 dB: 0–20% (mrtav parter)
- 70–82 dB: 20–80% (rast)
- 82–95 dB: 80–100% (optimalna zona)
- 95–105 dB: 100–75% (prevruće)
- > 105 dB: pad
Dodati `isSafeForNeighbor()` i `estimateReach()` utility funkcije.
Poboljano uzorkovanje komšije (radius 3 umesto 2, bolja energetska prosek).

---

## FIX 6 — Flesh-out: `src/render/terrain.js`
**Problem:** Floor plan je bio samo border + isprekidani pravougaonici. Nema vizuelnog identiteta terena.
**Fix:** Dodat floor fill, suptilna grid mreža, dance floor area, stage silhoueta sa labelom, terrain type badge, i **SPL legenda** (boja → dB opseg) u donjem levom uglu canvasa.

---

## FIX 7 — Flesh-out: `src/render/heatmap.js`
**Problem:** Heatmap je crtao sve ćelije (uključujući near-zero) bez alpha blenda — potpuno prekrivao terrain.
**Fix:** Dodata `globalAlpha = 0.72` za heatmap sloj, skip-ovanje ćelija < 55 dB za performanse, pulsing komšija prsten sada ima i inner fill, dB readout pored kućice.

---

## FIX 8 — Flesh-out: `src/entities/neighbor.js`
**Problem:** Stub klasa (12 linija), nikad instanirana, bez korisnih metoda.
**Fix:** Proširena sa `getAnger()`, `getStatusLabel()`, `limitDb`, `isSleeping`, `toJSON()`.

---

## FIX 9 — Flesh-out: `src/systems/venue.js`
**Problem:** Dead import `Neighbor` (nikad korišćen). Nepotpuna upgrade→zona mapa.
**Fix:** Uklonjen dead import. Dodata podrska za `amp_upgrade`, `line_array_v2`, `stage_monitor` u `UPGRADE_ZONE_MAP`.

---

## Ukupan broj linija JS posle fix-ova

| Fajl | Linije |
|------|--------|
| src/main.js | ~195 |
| src/config.js | 50 |
| src/state.js | 65 |
| src/input.js | 80 |
| src/audio.js | 120 |
| src/render.js | 30 |
| src/ui.js | 18 |
| src/share.js | 32 |
| src/systems/spl-engine.js | ~195 |
| src/systems/venue.js | ~65 |
| src/systems/events.js | 65 |
| src/systems/economy.js | 45 |
| src/systems/progression.js | 50 |
| src/systems/warnings.js | 40 |
| src/entities/zone.js | 30 |
| src/entities/neighbor.js | ~40 |
| src/render/heatmap.js | ~90 |
| src/render/terrain.js | ~115 |
| src/render/ui-elements.js | 55 |
| src/ui/hud.js | ~80 |
| src/ui/sliders.js | 65 |
| src/ui/event-feed.js | 55 |
| src/ui/game-over.js | ~70 |
| src/ui/venue-select.js | 40 |
| src/content/venues.js | 200 |
| src/content/upgrades.js | 35 |
| src/content/events-pool.js | 60 |
| src/content/dialogue.js | 65 |
| **UKUPNO** | **~2205** |
