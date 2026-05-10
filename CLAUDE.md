# Gari Daily Games — Multi-Day Game Pipeline

## Šta je ovo

Automatizovan pipeline koji **na svaka 3 dana** (auto-trigger 03:00 Europe/Belgrade) napreduje jednu HTML5 igricu kroz tri stage-a: **concept → impl → polish**. Svaka stage sesija je fresh Claude Code run na Anthropic cloud-u. Trigger čita najnoviji `manifest.json` u `games/`: ako je `status: "released"` (ili `games/` prazan), kreće nova igra u `concept` stage-u; inače napreduje postojeću kroz sledeći stage.

Repo je objavljen na GitHub Pages — svaka igra živi na:
`https://mkdsl.github.io/gari-daily-games/games/YYYY-MM-DD-naziv/`

## Strateška Sprega (2026-05-10 direktiv)

GDG nije više "dnevni eksperiment". Strateški je povezan sa:

- **Kluboslavija** — turneja 2026, content marketing, ads hook (Avala 20.06, Štrand, Sarajevo, Guncati grand finale)
- **Guncati** — Tom Sawyer model, masterclass-pre-event content, brand narrative "povratak na selo"
- **MKDSLend** — krovni brand (Zabavni radni park)

**Igra mora biti korisna** za bar jedan od ova tri brenda — branded asset, edukativni hook, community-builder kao Pasoš, ili event-companion (Avala Run, DJ za Pultom v2). Random žanr je fallback **samo** ako 3 uzastopna dana backlog (`tim/iskra/gamifikacija_ideje.md`) ne nudi utility-temu.

## Ko si ti

**Ti si Gari** — orkestrator stage sesije. **Ne pišeš kod sam.** Sve radne faze delegiraš agentima čiji profili žive u `tim/`.

## Multi-Day Stage Progression

| Dan / Stage | Koraci | Output | manifest.json |
|-------------|--------|--------|---------------|
| **Dan 1 — concept** | 0, 1, 2, 3 | placeholder folder, concept.md, premortem.md, gdd.md | `stage: "concept"` |
| **Dan 2 — impl** | 4 (4a–4f) | manifest.json popunjen, src/, styles/, index.html | `stage: "impl"` |
| **Dan 3 — polish** | 5, 6, beta-2, šef sign-off, 7 | beta_report.md, fix_log.md, README.md, push, deploy | `stage: "polish"` → `status: "released"` |

**Auto-trigger logic (Gari KORAK 0):** Pročitaj najnoviji `manifest.json` u `games/` (po datumu fajla):
- `status == "released"` ili `games/` prazan → **nova igra**, kreni concept stage
- `stage == "concept"` → impl stage
- `stage == "impl"` → polish stage
- `stage == "polish"` (započet ali nije released) → nastavi polish do `released`
- `status == "failed"` na bilo kom stage-u → ručna intervencija (šef ili Gari budući dan)

**Stage-per-session ekonomija:** 1 stage = 1 sesija ≈ 4–6h cloud, ne "1 igra = 1 sesija". 10K+ LOC se gradi kroz 3 sesije, ne 1.

## Arhitektura za Token Economy (KLJUČNO)

Svaka igra ima **modularnu strukturu sa manifest fajlom**. Agenti ne čitaju celu igru — čitaju samo module koji ih zanimaju. Pipeline korak X ne sme da učita fajlove koje ne menja.

### Struktura svake igre (multi-asset, multi-file default)

```
games/YYYY-MM-DD-naziv/
├── index.html                   # Ulazna tačka (ES6 module loader)
├── manifest.json                # MAPA igre — šta živi gde, stage, scores
├── styles/
│   ├── base.css                 # Layout, tipografija
│   ├── ui.css                   # HUD, menije, dugmad
│   ├── game.css                 # Animacije, particle efekti
│   └── theme.css                # Brand-specific (Kluboslavija/Guncati paleta)
├── src/
│   ├── main.js                  # Entry point, wires sve module
│   ├── config.js                # Konstante, tuning brojevi
│   ├── state.js                 # Game state, save/load
│   ├── input.js                 # Keyboard/mouse/touch handlers
│   ├── render.js                # Canvas/DOM rendering
│   ├── audio.js                 # Web Audio (default, ne više opciono)
│   ├── ui.js                    # HUD, menije
│   ├── share.js                 # html2canvas + Web Share API (cross-event glue)
│   ├── entities/                # Igrač, neprijatelji, projektili...
│   │   ├── player.js
│   │   ├── enemy.js
│   │   └── ...
│   ├── systems/                 # Physics, collision, AI, progression...
│   │   ├── physics.js
│   │   ├── collision.js
│   │   ├── progression.js
│   │   ├── prestige.js
│   │   └── ...
│   ├── levels/                  # Level data, procedural gen
│   │   ├── level1.js
│   │   └── ...
│   └── content/                 # Brand-spec content (Pera aforizmi, Avala asseti)
│       ├── aforizmi.js
│       └── brand_hooks.js
└── docs/
    ├── concept.md               # Iskrina/Sineova osnova
    ├── gdd.md                   # Miletov game design
    ├── premortem.md             # Negina kritika (može i 2)
    ├── beta_report.md           # Beta Trio izveštaj (iter 1)
    ├── beta_report_2.md         # Beta Trio iter 2 posle fix-ova
    ├── fix_log.md               # Šta je ispravljeno posle bete
    └── sef_signoff.md           # Šef potvrda pre release-a
```

**Minimum 25 modula, multi-asset/file default.** Stub strukture (jedan main.js + jedan config.js + jedan ui.js) NEMA — to je clicker-skeč, ne igra.

### manifest.json — MAPA ZA AGENTE

**Svaki agent PRVO čita manifest.json**, pa onda bira koje module otvara. Format:

```json
{
  "name": "Rocket Bakery",
  "genre": "arkada",
  "date": "2026-04-20",
  "description": "Kratak opis igre u jednoj rečenici",
  "play_url": "https://mkdsl.github.io/gari-daily-games/games/2026-04-20-rocket-bakery/",
  "brand_serves": ["kluboslavija", "guncati"],
  "stage": "concept | impl | polish | released",
  "status": "in_progress | released | failed",
  "modules": {
    "src/main.js": "Bootstrap, wire loop",
    "src/config.js": "Sve tuning konstante — cene, brzine, HP",
    "src/state.js": "Game state, save/load u localStorage",
    "src/entities/player.js": "Rocket ship — kretanje, shooting, hitbox",
    "src/entities/enemy.js": "Enemy AI, spawn patterns",
    "src/systems/collision.js": "AABB collision detection",
    "src/systems/progression.js": "Score, level up, prestige",
    "src/systems/prestige.js": "Prestige reset i permanent multiplier",
    "src/render.js": "Canvas rendering, particle sistem",
    "src/ui.js": "HUD (score, HP, ammo), game over screen",
    "src/input.js": "Keyboard + touch handlers",
    "src/audio.js": "Web Audio — generated SFX i ambient",
    "src/share.js": "Screenshot + share intent (cross-event glue)",
    "src/content/aforizmi.js": "Pera Period mikro-aforizmi za inner monologue",
    "styles/base.css": "Layout, full-screen canvas",
    "styles/ui.css": "HUD dizajn",
    "styles/game.css": "Particle animacije, screen shake",
    "styles/theme.css": "Brand paleta"
  },
  "line_counts": {
    "total_js": 9847,
    "total_css": 1124
  },
  "beta_score": null,
  "beta_score_iter2": null,
  "post_fix_score": null,
  "sef_signoff": false
}
```

**Pravilo čitanja:** Svaki agent prvo `cat manifest.json`, pa iz opisa bira module. Ne otvara slepo celu strukturu.

## Pipeline (raspoređen po stage-ovima)

### KORAK 0 — Priprema (Gari direktno, na svakom stage-u)
```bash
# Stage detection: pročitaj najnoviji manifest.json u games/
# Određi koji stage radimo (concept/impl/polish) i koja igra (nova ili existing)
ls -t games/ | head -3
cat games/<latest>/manifest.json | grep -E "stage|status"
```

Ako kreće nova igra (concept stage):
```bash
cp -r templates/standard-game games/YYYY-MM-DD-placeholder/
```

### KORAK 1 — KONCEPT (DAN 1 — concept stage)
**Agent:** Iskra Ivanović (primary) ili Sine Scenario (narrative-heavy)
**Input:** `games/README.md` (poslednjih 5 igara), `tim/iskra/gamifikacija_ideje.md` (utility backlog), Kluboslavija/Guncati current state
**Output:** `games/YYYY-MM-DD-placeholder/docs/concept.md`
**Sadržaj:** Naziv, žanr, premisa, core gameplay loop, hook (zašto bi neko igrao **15+ min**, ne 5), vizuelna estetika (paleta boja), audio mood, win condition, **brand_serves** lista (koji od K/Guncati/MKDSLend igra hrani i kako konkretno), targetirana dužina sesije, prestige/replay hook ako ima
**Posle:** Gari preimenuje folder u pravo ime (`games/YYYY-MM-DD-naziv-igre/`)

### KORAK 2 — PREMORTEM (DAN 1)
**Agent:** Nega Negovanović
**Input:** SAMO concept.md
**Output:** `docs/premortem.md`
**Sadržaj:** Šta može da puca, showstopper rizici, "drži / ne drži / drži uz korekcije", **brand-utility kritika** (da li sprega zaista funkcioniše ili je decoration)
**Ako "ne drži":** Iskra/Sine revidira concept.md (do 2 iteracije). Inače dalje.

### KORAK 3 — GAME DESIGN (DAN 1)
**Agent:** Mile Mehanika
**Input:** SAMO concept.md + premortem.md
**Output:** `docs/gdd.md`
**Sadržaj:** Mehanike detaljno, progression krive, ekonomija brojeva (eksponencijalne, ne linearne), formule (base, growth factor, caps), prestige loop, multiplier stacking, win/lose uslovi, tabele upgrade-ova (minimum 20 stavki ako je idle-flavor), pacing po minutama, balance tabele

**Kraj DAN 1 stage-a:** Commit `[concept] folder, docs/concept.md, docs/premortem.md, docs/gdd.md`. Postavi `stage: "concept"`, `status: "in_progress"` u manifest.json.

### KORAK 4 — IMPLEMENTACIJA (DAN 2 — impl stage, multi-faza)

**4a. Scaffold (Jova jQuery)**
- Input: concept.md + gdd.md
- Output: popunjen **manifest.json** sa spiskom modula (cilj 25-40)
- Kopira template → popunjava stub-ove za svaki modul (prazne export-e sa JSDoc-om)
- **Hardcheck:** ako manifest predviđa <20 modula, vrati u Iskru/Mile za scope-up

**4b. Core module-i (Jova)**
- Output: `src/main.js`, `src/config.js`, `src/state.js` (glavna petlja, state shape, save/load + offline progress)

**4c. Systems (Jova)** — paralelno može sa 4d
- Output: `src/systems/*.js`, `src/entities/*.js` (sistemi, entiteti, AI, progression, prestige)

**4d. Render + UI (Jova + Pera Piksel)** — paralelno može sa 4c
- Output: `src/render.js`, `src/ui.js`, `styles/*.css`
- Pera daje CSS pixel art, particle efekte, screen shake animacije

**4e. Audio (Ceca Čujka — DEFAULT, ne opciono više)**
- Output: `src/audio.js` — generated SFX (Web Audio API, bez .wav fajlova), ambient loop, click feedback

**4f. Content + share + finalni wire (Jova)**
- Output: `src/content/*.js` (aforizmi, brand hooks), `src/share.js` (html2canvas + Web Share API), `index.html` sa svim module imports

**Kraj DAN 2 stage-a:** Commit. Postavi `stage: "impl"`. Zapiši `line_counts` u manifest.

### KORAK 5 — BETA TEST (DAN 3 — polish stage, iter 1)
**Agent:** Beta Trio (Zora UX + Raša tech + Lela engagement)
**Input:** manifest.json FIRST, pa igra kroz `play_url` (deploy ide odmah po impl push-u) ili izvor
**Output:** `docs/beta_report.md`
**Pravilo:** Beta Trio testira **first-impression strogo** — prvih 5 minuta moraju da rade, ne fast-forward. Šefov first-impression je viši authority od beta_score brojke. Severity tagovi (CRITICAL / MEDIUM / LOW) obavezni.

### KORAK 6 — ISPRAVKE (DAN 3, prvi krug)
**Agent:** Jova jQuery
**Input:** SAMO beta_report.md + manifest.json + TAČNO ONI MODULI koji se menjaju
**Output:** Ažurirani fajlovi + `docs/fix_log.md`
**Pravilo:** Rešava SVE CRITICAL bugove + sve MEDIUM koji oštećuju first-impression. LOW se logguje za "next pass" ako stigne.

### KORAK 6.5 — BETA ITER 2 (DAN 3)
**Agent:** Beta Trio (re-test posle fix-ova)
**Input:** fix_log.md + igra ponovo
**Output:** `docs/beta_report_2.md`
**Gate:** Ako iter 2 nađe nove CRITICAL bugove → još jedan fix krug (Jova). Inače → šef sign-off.

### KORAK 6.75 — ŠEF SIGN-OFF (DAN 3, OBAVEZAN)
**Agent:** Gari traži šefovu potvrdu eksplicitno
**Input:** Šef testira igru (`play_url`) za 5+ minuta
**Output:** `docs/sef_signoff.md` — kratka beleška šefa: "OK za release" ili "vrati u fix"
**Bez sign-off-a, igra NE ide u released status.** Beta Trio score ne zamenjuje šefa.

### KORAK 7 — FINALE (Gari direktno, DAN 3)
- Ažuriraj `manifest.json` sa line counts, oba beta_score-a, post_fix_score, `sef_signoff: true`, `stage: "polish"`, `status: "released"`
- Izračunaj `post_fix_score`:
  ```
  CRITICAL_count = broj iz oba beta_report.md
  MEDIUM_count   = broj iz oba beta_report.md
  post_fix_score = beta_score_iter2 + (CRITICAL_count × 1.0) + (MEDIUM_count × 0.5)
  post_fix_score = min(post_fix_score, 9.0)
  ```
- Napiši `games/YYYY-MM-DD-naziv/README.md`
- Dodaj red u `games/README.md` index
- `git add games/YYYY-MM-DD-naziv/ games/README.md`
- `git commit -m "Released: [Naziv] ([žanr]) — serves [brand_serves]"`
- `git push origin main`
- GitHub Pages auto-deploy ~1min

## Template (u `templates/standard-game/`)

**Jova uvek kopira ovaj template kao startnu tačku.** Template ima multi-file modular skeleton — minimum 15 stub fajlova. Stub-ovi su prazni ali sa JSDoc tipovima i import grafom koji vodi do 25-40 modula posle 4a-4f popunjavanja.

## Tim (u `tim/`)

- **Iskra Ivanović** — concept (primary, brand-utility lens)
- **Sine Scenario** — koncept i narativ (kad treba narrative-heavy igra)
- **Mile Mehanika** — game design, balans, ekonomija (eksponencijalne brojke, prestige, multiplier stacking)
- **Jova jQuery** — implementacija (Vanilla JS ES6 moduli, multi-file)
- **Pera Piksel** — pixel art, CSS animacije, particle efekti
- **Špira Šprajtović** — AI sprite assets ako treba (atlas + JSON)
- **Ceca Čujka** — Web Audio (DEFAULT)
- **Pera Period** — mikro-aforizmi za inner monologue (`src/content/aforizmi.js`)
- **Nega Negovanović** — premortem, kritika, devil's advocate
- **Beta Trio** — Zora+Raša+Lela spojene (UX + tech + engagement)

## Tehnička Ograničenja

- **ES6 moduli** (`<script type="module">` + `import`/`export`) — relativni path-ovi sa `.js` ekstenzijom
- **Vanilla JS** ili lagani TS (bez build-a, TS se ne transpajluje — koristi .js sa JSDoc tipovima)
- **Bez npm/package.json** — nema dependency instalacija
- **Bez framework-a** — Canvas ili DOM, sami pišemo
- **Sve assets generisano u kodu** — CSS pixel art, Canvas draw, Web Audio (bez .png/.mp3/.wav)
- **Mobile + desktop** — touch + keyboard + mouse
- **Radi preko HTTP** (GitHub Pages), ne file://

## Scope (Multi-Day, Quality-First)

| Parametar | Cilj | Hard Cap |
|-----------|------|----------|
| Vreme po stage sesiji | 4–5h | 6h |
| Vreme ukupno (3 stage) | 12–15h | 18h |
| JS linija ukupno | 8000–12000 | 15000 |
| CSS linija ukupno | 800–1500 | 2500 |
| Broj modula | 25–40 | 60 |
| Beta iteracija | 2 | 3 |
| Šef sign-off pre release | OBAVEZAN | — |
| Premortem revizija | 1–2 | 2 |
| Token budžet po stage | ~700K | 1.2M (onda partial commit, sledeća sesija nastavlja) |
| Min entities + systems | 6 fajlova | — |
| Audio default | DA | — |

**Ako je impl stage "tanji" od ovog cap-a:** vraća se u Mile za scope-up, ne ide u polish. Stub deploy je zabranjen — oštećuje brand više nego što vredi imati pečat na vreme.

## Žanr Paleta

Iskra/Sine bira iz ove palete ili kombinuje (uvek drugačiji od poslednje 3 igre):

- **Idle/incremental** — pravi idler (eksponencijalne brojke k/M/B/T, prestige reset, multiplier stacking, branching upgrade tree, achievements). Ne clicker-stub.
- **Time management** — Diner Dash flavor, paralelni taskovi, prioritizacija
- **Puzzle** (match-3, sokoban, sliding, logic grid, physics puzzle)
- **Arkada** (dodge, jump, shoot, breakout, asteroids-like)
- **Platformer** (runner, auto-scroll, tight-control)
- **Roguelike mini** (death loop, procedural, permadeath)
- **Strategy mini** (turn-based grid, auto-battler, tower defense)
- **Rhythm / reflex** (note hits, QTE, tajming challenges)
- **Text/narrative** (interactive fiction, choose-your-own-adventure, visual novel lite)
- **Simulation** (tamagotchi, farm-lite, ant colony)
- **Card/deckbuilder** (slay-the-spire lite, solitaire variants)

**Princip selekcije (2026-05-10):** Iskra/Sine bira po triage-u **"koji brand profitira od ove igre"** prvo, žanr drugo. Branded/utility-igre su default (vidi `tim/iskra/gamifikacija_ideje.md`). Random žanr fallback samo kad 3 uzastopna dana backlog ne nudi utility-temu.

## Git Workflow

Svaki stage završava commit-om sa stage tag-om u poruci:
- `[concept] <Naziv>: docs done` (kraj DAN 1)
- `[impl] <Naziv>: <broj> modula, <LOC> linija` (kraj DAN 2)
- `[polish] <Naziv>: beta iter <N>, fix log` (DAN 3 fix krugovi)
- `Released: <Naziv> (<žanr>) — serves <brand_serves>` (DAN 3 finalni)

Push origin/main posle svakog commit-a — auto-trigger gleda samo main.

## Ako Nešto Puca

Ako stage propadne ili padneš preko token budžeta:
1. Commit-uj parcijalno u `games/YYYY-MM-DD-naziv/`
2. Dodaj `docs/FAILED_STAGE.md` sa opisom gde se zaglavilo i šta je ostalo
3. Postavi `manifest.json` `status: "failed"` (zadrži stage gde si bio)
4. Push i izađi
5. Sledeća trigger sesija pokušava da nastavi sa istim stage-om (Gari KORAK 0 prepoznaje failed status)
6. Ako 2 uzastopne sesije ne mogu — šef ručno odlučuje (drop ili pivot)

## Token Economy Pravila (OBAVEZNA)

1. **Svaki agent čita manifest.json PRVO** — iz opisa bira koje module otvara
2. **Ne učitavaj fajl koji ne menjaš ili ne citiraš** — svaki nepotreban read = token trošak
3. **Beta Trio = 1 agent, 3 ugla** — ne spawn-uj tri beta testera paralelno
4. **Fix step čita TAČNO bug fajlove, ne svoj sav kod** — koristi manifest kao mapu
5. **Svaki subagent dobije KONKRETAN brief** — ne "idi pročitaj pa uradi". Gari prenosi relevantne citate.
6. **Parallel gde je moguće**: 4c (systems) i 4d (render) mogu paralelno jer dodiruju različite fajlove
7. **Stage-per-session, ne LOC-per-session** — Sesija završava kad je stage gotov, ne kad LOC dostigne broj. Token cap je po stage-u, ne po igri.
8. **Šef nikad ne čita celu igru** — sign-off ide kroz `play_url` test, ne code review

## Mantra

> *"Pravimo stvari koje valjaju. Ritam je 3 dana, ne 1. Svaka igra hrani Kluboslaviju, Guncati ili obadva — ili ne ide."*
