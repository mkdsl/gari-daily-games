# DJ za Pultom — v2 build (Sezona 1 + S2 substance UI)

**Status:** V2 BUILD — playable end-to-end (Cinematic A hook + Macro 7×3 + Simptomatski HUD + Persona Profile sa Telesno stanje/Recovery/Compound tab-ovima)
**Build:** 2026-05-11 overnight by Jova jQuery
**Spec source:**
- `../gdd/mile-gdd-v2-sezona1.md` (Mile Mehanika)
- `../gdd/mile-gdd-s2-substance.md` (Mile S2)
- `../joca/ui-spec-s1-v2.md` (Joca FTUE + Macro 7×3 + simptomatski + Numeric Mode)
- `../joca/ui-spec-s2-substance.md` (Joca S2 — Telesno stanje + Zovi covika + Recovery + Compound)

---

## Kako se igra

1. Otvori `index.html` u modernom browser-u (Chrome, Firefox, Safari — ES6 modules required).
2. Lokalni server (preporuka jer ES6 modules + `file://` blokira):
   - `python3 -m http.server 8000` u ovom folderu, zatim otvori `http://localhost:8000`
3. **Flow:**
   - **Cinematic A** — crn ekran 0.5s, dub bass start (kreće posle prvog touch-a — iOS Safari guard), 1 rečenica fade-in 2s, "Pojacaj" + "Slusaj jos" button-i. Auto-move posle 30s.
   - **Origin Creator** — 9 preseta u jednoj flat listi (NEMA "Klasični/Mladi" labela). Q2-Q5 single-choice.
   - **Macro Week** — 7 dana × 3 slota = 21 kvadratić. Drag-drop iz sticker palette (9 vector + 3 recovery + hobby + zovi covika). Tap-uj sticker → tap-uj kvadrat. Tap na zauzet kvadrat = brisanje.
   - **Micro Night** (kad je gig nedelja) — placeholder set simulator + substance de-sync audio cue (drift/chaos/panic).
   - **Week Recap** — stat deltas, Pera Period subtitle overlay.
   - **Finale** (nedelja 12+).
4. **Save auto** — localStorage ključ `dj-za-pultom-v1-save`. Reset: `window.__dj.resetState()`.
5. **Settings ikona** (⚙) u Macro top-bar-u — Numeric Mode toggle, audio toggle, Pera overlay toggle, "Replay Cinematic A".
6. **Persona ikona** (◐) u Macro top-bar-u — 4 tabs:
   - **Pregled** — origin preset, klasa, week log
   - **Telesno stanje** — 44 dijagnoze T1/T2/T3 color zone, organizovane po substance
   - **Recovery** — 3 tipa × 2 uses (Tisina, Integracija, Reality check)
   - **Compound** — venn-style overlap circles + poly-use dijagnoze

---

## V2 šta je gotovo (playable end-to-end)

### S1 (Joca UI Spec S1 v2)
- [x] **Cinematic A hook** — `scenes/splash-cinematic.js` (113 LOC) + procedural dub bass (`systems/cinematic-audio.js`, 161 LOC) — Web Audio sub-bass sine ~58 Hz, dub delay, arrhythmic stagger
- [x] **Origin Creator update** — 9 preseta u jednoj listi (4 klasicni: punk_to_dj, classical_kontinuum, migrant_scene, kafanski_muzicar + 5 mladi: m1-m5)
- [x] **Macro Week 7×3 kalendar** — `scenes/macro-planner.js` (387 LOC) — 21 slot grid, 14 stickers, drag-drop (touch + mouse), pressure indicator (color zone, ne brojevno)
- [x] **Simptomatski HUD** — `src/ui.js` (227 LOC) — Money brojevno (default), Telo/Odnosi/Normalnost = color zone (zelena/zuta/orange/crvena, pulse na crvenom), Energija = uze/struna (frayed/broken), Knowledge = polica sa pločama (◤ count), Network = silhouette krug (☻ count), Recogn = ripple (~), Reputation = zvezde
- [x] **Numeric Mode toggle** — `scenes/settings.js` (95 LOC) — default OFF, ON overlay-uje 0-100% na sve stat-ove i dijagnoze
- [x] **Pera Period overlay** — `systems/pera-overlay.js` (63 LOC) — bottom-center fade-in subtitle 4.5s, triggers iz aforizmi.js po contextu (set_high, set_low, symptom_zone, rep_event, ...)

### S2 (Joca UI Spec S2 + Mile S2 GDD)
- [x] **Telesno stanje tab** — 44 dijagnoze sa Tier 1/2/3 color (T1 gray-zelen, T2 žut, T3 crven pulse), Pera linija po dijagnozi (`data/pera-substance.js` 169 LOC)
- [x] **Zovi čovika sticker** — Macro Week slot tip, cumulative call tracker (visible: "this week × · season total ×"), time currency cost u plan
- [x] **Compound venn-style indikator** — `tab-compound` u persona-profile — venn circles sa screen blend mode + lista compound dijagnoza sa Pera linijama
- [x] **Recovery slot UI** — 3 tipa (Tisina / Integration / Reality check), 2 use po sezoni svaki = 6 total, dot indikator (● used / ○ free)
- [x] **Substance audio de-sync** — `cinematic-audio.js` getDesyncProfile() — alcohol drift +10%, stim +15%, psihodelici chaos 0.4, compound C8 panic 0.6 — anti-stylish per Nega (arrhythmic stagger, NE uniformno)

### Core engine (zadržano iz v1, sad sa v2 hook-ovima)
- [x] 9 macro vector systems (promo/music/knowledge/mixing/visual/scene/finance/energy/reckless)
- [x] Žrtvovanje (Health/Odnosi/Normalnost drain/recovery)
- [x] Cascade thresholds (Hard Fail 1/2, Identity crisis, Tragic Genius)
- [x] Path tracker (7 paths + Lasting DJ + Tragic Genius achievements)
- [x] Pasoš pečat + Crew loyalty
- [x] Save/load localStorage
- [x] Smoke test pass: 12-week sim + buildPlanFromGrid + 44 dijagnoza + 9 preseta + compound detection

---

## V2 šta je PLACEHOLDER (jasno označeno)

- **Micro Night žurka** SIMPLIFIED — effort slider + pre-drinks + signature picks → random outcome. Nema 2-deck UI ni live beat-tap (čeka šef OGG opus track drop). Audio engine init + half-beat delay + de-sync drift su funkcionalni.
- **Setlist** — `buildSetlistFromCatalog` vraća prazan array dok šef ne dropne OGG opus fajlove sa BPM-KEY-name-BARS.opus naming-om.
- **Mile S2 substance deeper integration** — substance state je u `state.substance.active_substances`, dijagnoze prikazuju, compound se detektuje, ali aktivacija novih substanci tokom sezona još NIJE u Micro/Macro loop-u (treba Mile S2 GDD fine-grained event tabela). Substance baseline iz origin preseta je tu.
- **Sine NPC dialog** — nije pull-ovan u kod (worktree-only specs). Schenа za rad-klasa mentor i M4 stream-native event su planirani za sledeci pass.
- **Zoki Piksel mockups** — trenutno CSS pixel art je radni; Zoki shouts → CSS replace točno.
- **Reputation events full tree** — generic placeholder, Mile 4.3 spec ima 4 event tipa × 2-3 izbora.
- **Hard Mode preset** za Posthumna penzija — u config-u, ne u UI-u.
- **Mobile lite mode** — audio engine ima detection, UI scaffold respektuje touch (sticker drag radi i u mobile tap, drag) ali fine-tuning fali.

---

## Line counts

| Folder | LOC |
|---|---|
| `index.html` | 18 |
| `manifest.json` | ~140 |
| `src/main.js` | 116 |
| `src/config.js` | 511 |
| `src/state.js` | 277 |
| `src/util.js` | 87 |
| `src/render.js` | 31 |
| `src/ui.js` | 227 |
| `src/audio.js` | 288 |
| `src/data/` (7 files) | 1068 |
| `src/scenes/` (9 files) | 1481 |
| `src/systems/` (19 files) | 1369 |
| `styles/` (5 files) | 1568 |
| **TOTAL** | **~7086 LOC** |

> Mile v2 target 22-25K (S1) ili 35K (S1+S2 combined). Ovo je ~32% S1+S2 combined target-a — solidno za overnight v2 build. Šef ima radnu verziju za testing, ostatak ide u sledeće iteracije (Micro full 2-deck UI + Sine NPC dialog trees + Reputation event branching + Mobile lite tuning + Zoki Piksel assets).

---

## V2 status snapshot

| Feature | Status |
|---|---|
| Cinematic A boot | ✅ playable |
| 9 origin preseta | ✅ playable |
| Macro 7×3 kalendar | ✅ playable |
| 14 stickers (drag-drop) | ✅ playable |
| Simptomatski HUD | ✅ playable (toggle Numeric Mode u Settings) |
| Pera overlay (4.5s subtitle) | ✅ playable |
| Telesno stanje tab (44 dijagnoze) | ✅ playable |
| Recovery slot (6 uses) | ✅ playable u Macro + Persona Profile |
| Compound venn | ✅ playable |
| Zovi čovika tracker | ✅ playable |
| Substance audio de-sync | ⚠ implementiran ali nema actual audio playback (placeholder Micro) |
| Micro 2-deck full UI | ❌ placeholder simplified |
| OGG opus track set | ❌ čeka šef asset drop |

---

## Beta Trio flag

**Zora Zona** (UX) — testiraj prvo:
1. **Cinematic A** — boot sa novim save-om, da li dub bass kreće odmah ili tek posle touch-a (iOS Safari)? Da li line + buttons fade-in tajming radi?
2. **Origin Creator** — 9 preseta single list — da li je scroll prirodan na mobilnom? Da li "Krecem" radi sa first preset + 4 Q's?
3. **Macro 7×3** — touch drag-drop na mobile (iOS Safari)?

**Raša Raštura** (tehnički) — testiraj prvo:
1. **Cinematic + Audio** — postoji li XMLHttpRequest? AudioContext suspended → resume failure?
2. **Drag-drop** — što ako drag na sticker palette → drop na cell → reload → state persist?
3. **Save migration** — stari v1 save (samo state.scene='splash') → da li se migrate u v2 bez crash-a? (main.js radi migration)
4. **Replay Cinematic A** — Settings → "Replay Cinematic A" → trigger first_run_done=false → može li opet da prođe sve isto?

**Lela Loop** (engagement) — testiraj prvo:
1. **Pera overlay** — da li frequency overlay-a feels "right"? (Trebalo bi da se javi ~1× per Macro commit + ~1× per Set high/low)
2. **Telesno stanje progression** — kako se T1 → T2 → T3 escalation oseti? Da li je T3 trigger ("week >= 8 OR sacrifice < 40") na vreme?
3. **Compound venn** — da li je vidljiv only kad ima compound (test sa preset koji ima 2+ substance baseline, npr. punk_to_dj alc+nic), ili predugačko mrtvo?

---

## Debug

- `window.__dj.getState()` — vidi state
- `window.__dj.resetState()` — reset state
- `window.__dj.toggleNumericMode()` — toggle simptomatski/brojevno

Save key u localStorage: `dj-za-pultom-v1-save`

State.flags:
- `hard_fail_health`, `hard_fail_bankrupt`, `identity_crisis`, `tragic_genius`, `lasting_dj`
- `season_completed`, `season_lost`

State.settings:
- `numeric_mode` — pokazi brojeve (default OFF)
- `audio_enabled` — dub + set audio
- `first_run_done` — cinematic skip
- `pera_overlay_off` — disable subtitle

State.substance:
- `baseline`, `active_substances`, `diagnoses`, `zovi_covika_total`, `zovi_covika_this_week`
- `compound_active`, `recovery_uses: {tisina, integration, reality}`

---

**Mantra:** *"Niko ne počinje za pultom. Počinje od onoga što mu je život ostavio na podu."*

— Pera Period (cinematic_hook bank, v2)
