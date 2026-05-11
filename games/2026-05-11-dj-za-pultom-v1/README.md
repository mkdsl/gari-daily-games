# DJ za Pultom — v1 scaffold + core

**Status:** SCAFFOLD + CORE — playable end-to-end (sa Micro layer placeholder-om)
**Build:** 2026-05-11 overnight by Jova jQuery
**Spec source:** `../gdd/mile-gdd-v1-sezona1.md` (Mile Mehanika)
**Audio source:** `../audio-engine-concept.md` (Ceca — placeholder integracija)

---

## Kako se igra

1. Otvori `index.html` u modernom browser-u (Chrome, Firefox, Safari — ES6 modules required).
2. Ako serviraš lokalno (preporuka jer ES6 modules + file:// može da blokira):
   - `python3 -m http.server 8000` u ovom folderu, zatim otvori `http://localhost:8000`
3. **Flow:**
   - **Splash** — "Nova karijera" ili "Nastavi" (ako postoji save)
   - **Origin Creator** — 5 pitanja, Custom je default, klase ispod
   - **Macro Planner** — 9 vector slot-ovi, drag/select aktivnosti, "Komituj nedelju"
   - **Micro Night** (ako je žurka ove nedelje) — placeholder set simulator (effort + pre-drinks + signature picks)
   - **Week Recap** — stat deltas, Pera Period komentar, cascade events
   - **Finale** (nedelja 12+) — path-finale identifikacija, achievements
4. **Save je automatski** — localStorage, ključ `dj-za-pultom-v1-save`. Obrisi sa "Obrisi save" na splash-u, ili u DevTools console: `window.__dj.resetState()`.

---

## Šta je playable (end-to-end)

- [x] Splash sa continue/new/clear-save flow
- [x] Origin Creator — 5 pitanja, Custom + 3 klase (Bogata deca / Radnicka klasa / Posthumna penzija)
- [x] Custom keyword parsing (cita Q3 + custom_text, primenjuje side flags)
- [x] Class baseline stat-ovi se primenjuju (Mile sekcija 5.1 brojevi u config.js)
- [x] Macro week loop sa svih 9 vector-a:
  - V1 Promo (frequency + ad money)
  - V2 Music research (4 source + budget)
  - V3 Knowledge (4 source + hours, diminishing returns formula)
  - V4 Mixing (session length + mixtape)
  - V5 Izgled (garderoba/fitness/frizer/fotka)
  - V6 Scene Presence composite (mingling + atmospheric + guest sets)
  - V7 Finansije (sponsor outreach + bookkeeping)
  - V8 Energija (san/joga/setnja/hobi/porodica/mirna nedelja)
  - V9 Reckless Selection (passive, otkljucan Knowledge tier 2+)
- [x] Žrtvovanje sistem (Health / Odnosi / Normalnost) sa drain/recovery formulama
- [x] Cascade thresholds — Hard Fail 1 (Health crash), Hard Fail 2 (Bankrupt), Identity crisis, Tragic Genius
- [x] Reputation events triggered iz Scene Presence
- [x] Pasoš pecat sistem (akumulacija, Crew loyalty boost)
- [x] Set quality formula sa svim modifikatorima (Mile sekcija 11.5)
- [x] Path tracker — 7 paths + 2 achievements (The Lasting DJ / The Tragic Genius)
- [x] Pera Period nudges (placeholder bank, ~30 lines)
- [x] Recognizability decay if Normalnost low
- [x] Šljakanje tax mehanika (radnicka klasa, music dev efikasnost bonus)
- [x] Apstinent / alkohol weekly drain
- [x] Save/load preko localStorage
- [x] HUD + sacrifice bar (simptomatski signali, gradient) + tier grid
- [x] Pressure indicator (skrivena time/budget vrednost → vidljiv signal)
- [x] Money estimate u planner-u (igrač vidi šta će platiti pre commit-a)

---

## Šta je PLACEHOLDER (jasno označeno)

- **Micro Night žurka:** SIMPLIFIED. Effort slider (low/normal/high/max) + pre-drinks + signature pick attempts → random outcome u formuli. Nema 2-deck UI, nema live beat-tap, nema de-sync alarm. **Sledeća iteracija** kad Ceca audio engine bude integrisan (lib/dj-audio).
- **Pera Period aforizmi:** 30+ placeholder linija u `src/data/aforizmi.js`. Pera Period agent šalje **80-120 finalnih** sutra-prekjuče.
- **Audio engine:** noop stub u `src/audio.js`. Ceca implementira `lib/dj-audio/` paralelno.
- **NPC dialog (Sine):** nema scene-mentor dialog za rad-klasa nedelja 2-3. Pending.
- **UI mockup (Zoki):** trenutno je quick CSS — dark theme, accent #ff7a00. Zoki šalje proper visual mockups.
- **Reputation events full tree:** Mile sekcija 4.3 spec ima 4 event tipa sa 2-3 izbora po event-u. Trenutno je generic placeholder.
- **Hard Mode preset za Posthumna penzija:** spomenut u config-u, ne i u UI-u.
- **Hustler / Showman / Underground Craftsman / Survivor path emergent flagging** — path tracker evaluira sve, ali UI prikaz koristi top 3 path-a.
- **Mobile lite mode** — nije implementiran (Mile sekcija 9.4).

---

## Line counts (procena)

| Folder | Approx LOC |
|---|---|
| `index.html` | ~15 |
| `manifest.json` | ~145 |
| `src/main.js` | ~75 |
| `src/config.js` | ~340 |
| `src/state.js` | ~190 |
| `src/util.js` | ~90 |
| `src/render.js` | ~30 |
| `src/ui.js` | ~125 |
| `src/audio.js` | ~30 |
| `src/data/classes.js` | ~50 |
| `src/data/origin-questions.js` | ~80 |
| `src/data/keywords.js` | ~70 |
| `src/data/paths.js` | ~50 |
| `src/data/aforizmi.js` | ~120 |
| `src/data/vector-meta.js` | ~110 |
| `src/systems/origin.js` | ~50 |
| `src/systems/macro.js` | ~95 |
| `src/systems/micro.js` | ~130 |
| `src/systems/sacrifice.js` | ~110 |
| `src/systems/cascade.js` | ~55 |
| `src/systems/scene-presence.js` | ~110 |
| `src/systems/recognizability.js` | ~20 |
| `src/systems/finansije.js` | ~75 |
| `src/systems/path-tracker.js` | ~80 |
| `src/systems/pera-period.js` | ~30 |
| `src/systems/pasos.js` | ~25 |
| `src/systems/vector-promo.js` | ~30 |
| `src/systems/vector-music.js` | ~50 |
| `src/systems/vector-knowledge.js` | ~40 |
| `src/systems/vector-mixing.js` | ~40 |
| `src/systems/vector-visual.js` | ~45 |
| `src/systems/vector-energy.js` | ~60 |
| `src/systems/vector-reckless.js` | ~45 |
| `src/scenes/splash.js` | ~40 |
| `src/scenes/origin-creator.js` | ~120 |
| `src/scenes/macro-planner.js` | ~220 |
| `src/scenes/micro-night.js` | ~130 |
| `src/scenes/week-recap.js` | ~80 |
| `src/scenes/finale.js` | ~75 |
| `styles/base.css` | ~70 |
| `styles/ui.css` | ~210 |
| `styles/scenes.css` | ~330 |
| `styles/game.css` | ~55 |
| **TOTAL** | **~4200 LOC** |
| **MODULA** | **~42** |

> Napomena: Mile target 18-28K LOC pokriva FULL multi-layer scope sa Micro Diner Dash UI, full Pera bank (80-120 aforizam), Sine NPC trees, full reputation event branching, full balance config po svim path-ovima. Overnight scope je oko 18-22% target-a — to je očekivano za prvi scaffold + core. Šef ima radnu verziju za feedback, ostatak ide u sledeće iteracije.

---

## Sledeći koraci (sutra ili posle šef-igranja)

1. **Šef igra-testira** i koriguje Mile sekciju 13 (Najveći nesigurni brojevi):
   - Reckless Selection peak/drop magnitude
   - Žrtvovanje drain rates
   - Šljakanje music dev efikasnost bonus
   - Money baseline brojevi
   - Recognizability tier rast tempo
   - De-sync timer
2. **Pera Period agent** šalje 80-120 finalnih aforizam → `src/data/aforizmi.js` zamena
3. **Sine Scenario** šalje rad-klasa scene-mentor NPC dialog za nedelju 2-3
4. **Zoki Piksel** šalje 5 screen mockups (mobile-first) → ja prilagodjavam CSS
5. **Ceca + Tonket** kompletiraju `lib/dj-audio/` → ja zamenjujem `src/audio.js` stub i pravim full Micro layer sa 2 deck-a + beat-tap
6. **Mile** kalibrise balance brojeve posle šef test-a, GDD v2 → ja apliciram u `config.js`
7. **Multi-layer scope expansion:** Hustler/Showman/Underground/Survivor path full support u UI, full reputation event branching, Hard Mode preset, mobile lite mode

---

## GDG repo prebacivanje

Sandbox dozvoljava samo worktree. **Šef ujutru kopira ovaj folder** u GDG repo:

```
cp -r implementacija/* ~/ajajaj/projekti/gari-daily-games/games/2026-05-11-dj-za-pultom-v1/
```

Pa commit + push na `origin/main` (GDG repo) — to ne mogu da uradim iz worktree-a jer sandbox blokira Bash.

---

## Debug

Console:
- `window.__dj.getState()` — vidi state
- `window.__dj.resetState()` — reset state

Save key u localStorage: `dj-za-pultom-v1-save`

Status flagove u state.flags:
- `hard_fail_health` — Hard Fail 1
- `hard_fail_bankrupt` — Hard Fail 2
- `identity_crisis` — Normalnost cascade
- `tragic_genius` — sva 3 zrtvovanje = 0
- `lasting_dj` — Pro Set + sva 3 ≥ 40% + hobby ≥ 8
- `season_completed` / `season_lost`

---

**Mantra:** *"DJ ne pocinje za pultom. DJ pocinje sa onim sto ti je zivot dao, i onim sto ti je dragog dovoljno da to ne izgubis dok stignes."*

— Mile Mehanika, GDD v1 Sezona 1
