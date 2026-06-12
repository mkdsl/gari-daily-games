# Gari Daily Games — Multi-Day Game Pipeline

## Šta je ovo

Automatizovan pipeline koji **3 puta dnevno** (auto-trigger Europe/Belgrade) napreduje jednu HTML5 igricu kroz tri stage-a: **concept → impl → polish**. Jedna igra dnevno, kroz 3 sesije u istom danu. Svaka stage sesija je fresh Claude Code run na Anthropic cloud-u. Trigger čita najnoviji `manifest.json` u `games/`: ako je `status: "released"` (ili `games/` prazan), kreće nova igra u `concept` stage-u; inače napreduje postojeću kroz sledeći stage.

**Default trigger raspored (TBD, šef potvrđuje):**
- 03:00 — concept stage (Iskra/Sine + Nega + Mile)
- 09:00 — impl stage (Jova + Pera Piksel + Ceca)
- 17:00 — polish stage (Beta Trio + Jova fix + šef sign-off + Gari release)

8–14h razmaci omogućavaju da prethodna sesija završi (token-time bound) i da šef stigne sign-off pre polish-a u 17:00.

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

## Multi-Trigger Stage Progression (3 sesije u istom danu)

| Trigger | Stage | Koraci | Output | manifest.json |
|---------|-------|--------|--------|---------------|
| **03:00 — concept** | concept | 0, 1, 2, 3 | placeholder folder, concept.md, premortem.md, gdd.md | `stage: "concept"` |
| **09:00 — impl** | impl | 4 (4a–4f) | manifest.json popunjen, src/, styles/, index.html | `stage: "impl"` |
| **17:00 — polish** | polish | 5, 6, beta-2, šef sign-off, 7 | beta_report.md, fix_log.md, README.md, push, deploy | `stage: "polish"` → `status: "released"` |

**Auto-trigger logic (Gari KORAK 0):** Pročitaj najnoviji `manifest.json` u `games/` (po datumu fajla) i poredi sa trenutnim trigger vremenom:
- `status == "released"` ili `games/` prazan → **nova igra**, kreni concept stage (samo ako je 03:00 trigger)
- `stage == "concept"` → impl stage (samo ako je 09:00 trigger)
- `stage == "impl"` → polish stage (samo ako je 17:00 trigger)
- `stage == "polish"` (započet ali nije released) → nastavi polish do `released` (svaki sledeći trigger pokušava završiti)
- `status == "failed"` na bilo kom stage-u → sledeći trigger istog tipa pokušava nastavak; posle 2 fail → ručna intervencija šefa
- Trigger pogrešnog tipa za current stage → no-op (npr. 09:00 trigger a stage je još uvek "concept" jer je concept sesija pala — čeka sledeći 03:00 ili šef)

**Stage-per-session ekonomija:** 1 stage = 1 sesija ≈ 4–5h cloud (mora stati u trigger razmak). 10K+ LOC se gradi kroz 3 sesije istog dana, ne 1. **30+ igara mesečno** umesto ~10.

**KORAK 0a — Manifest/docs drift self-check (PRE routing tabele, svaki trigger):**

Pre primene routing tabele iz KORAK 0, proveri da li `docs/` artefakti najnovije igre
"prestižu" `manifest.json`:

- Ako `docs/beta_report_2.md` postoji ALI `manifest.stage != "polish"`:
  - Upiši `stage: "polish"`, `beta_score` (iz beta_report.md), `beta_score_iter2` i
    `post_fix_score` (iz beta_report_2.md / sef_signoff.md) u manifest.
  - Commit: `fix(<naziv-igre>): manifest/docs sync (KORAK 0a)`, push.
  - `sef_signoff` i `status` ostaju netaknuti — KORAK 6.75/7 i dalje čekaju šefa.
- Ako `docs/sef_signoff.md` ima čekirano "OK za release" ALI `manifest.sef_signoff != true`:
  - Tretiraj kao odobren KORAK 6.75 — nastavi na KORAK 7 (Finale) bez obzira na trigger tip.
- Ako nijedan drift nije nađen — preskoči, idi na routing tabelu ispod.

Ovaj korak je idempotentan i ne zahteva šef-test — sinhronizuje POSTOJEĆE rezultate, ne kreira nove.

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

### KORAK 1 — KONCEPT (03:00 trigger — concept stage)
**Agent:** Iskra Ivanović (primary) ili Sine Scenario (narrative-heavy)
**Input:** `games/README.md` (poslednjih 5 igara), `tim/iskra/gamifikacija_ideje.md` (utility backlog), Kluboslavija/Guncati current state
**Output:** `games/YYYY-MM-DD-placeholder/docs/concept.md`
**Sadržaj:** Naziv, žanr, premisa, core gameplay loop, hook (zašto bi neko igrao **15+ min**, ne 5), vizuelna estetika (paleta boja), audio mood, win condition, **brand_serves** lista (koji od K/Guncati/MKDSLend igra hrani i kako konkretno), targetirana dužina sesije, prestige/replay hook ako ima
**Posle:** Gari preimenuje folder u pravo ime (`games/YYYY-MM-DD-naziv-igre/`)

### KORAK 2 — PREMORTEM (03:00 trigger)
**Agent:** Nega Negovanović
**Input:** SAMO concept.md
**Output:** `docs/premortem.md`
**Sadržaj:** Šta može da puca, showstopper rizici, "drži / ne drži / drži uz korekcije", **brand-utility kritika** (da li sprega zaista funkcioniše ili je decoration)
**Ako "ne drži":** Iskra/Sine revidira concept.md (do 2 iteracije). Inače dalje.

### KORAK 3 — GAME DESIGN (03:00 trigger)
**Agent:** Mile Mehanika
**Input:** SAMO concept.md + premortem.md
**Output:** `docs/gdd.md`
**Sadržaj:** Mehanike detaljno, progression krive, ekonomija brojeva (eksponencijalne, ne linearne), formule (base, growth factor, caps), prestige loop, multiplier stacking, win/lose uslovi, tabele upgrade-ova (minimum 20 stavki ako je idle-flavor), pacing po minutama, balance tabele

**Kraj 03:00 sesije:** Commit `[concept] folder, docs/concept.md, docs/premortem.md, docs/gdd.md`. Postavi `stage: "concept"`, `status: "in_progress"` u manifest.json. Push origin/main da 09:00 trigger vidi.

### KORAK 4 — IMPLEMENTACIJA (09:00 trigger — impl stage, multi-faza)

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

**Kraj 09:00 sesije:** Commit. Postavi `stage: "impl"`. Zapiši `line_counts` u manifest. Push origin/main da 17:00 trigger vidi.

### KORAK 5 — BETA TEST (17:00 trigger — polish stage, iter 1)
**Agent:** Beta Trio (Zora UX + Raša tech + Lela engagement)
**Input:** manifest.json FIRST, pa igra kroz `play_url` (deploy ide odmah po impl push-u) ili izvor
**Output:** `docs/beta_report.md`
**Pravilo:** Beta Trio testira **first-impression strogo** — prvih 5 minuta moraju da rade, ne fast-forward. Šefov first-impression je viši authority od beta_score brojke. Severity tagovi (CRITICAL / MEDIUM / LOW) obavezni.

### KORAK 6 — ISPRAVKE (17:00 trigger, prvi krug)
**Agent:** Jova jQuery
**Input:** SAMO beta_report.md + manifest.json + TAČNO ONI MODULI koji se menjaju
**Output:** Ažurirani fajlovi + `docs/fix_log.md`
**Pravilo:** Rešava SVE CRITICAL bugove + sve MEDIUM koji oštećuju first-impression. LOW se logguje za "next pass" ako stigne.

### KORAK 6.5 — BETA ITER 2 (17:00 trigger)
**Agent:** Beta Trio (re-test posle fix-ova)
**Input:** fix_log.md + igra ponovo
**Output:** `docs/beta_report_2.md`
**Gate:** Ako iter 2 nađe nove CRITICAL bugove → još jedan fix krug (Jova). Inače → šef sign-off.

### KORAK 6.75 — ŠEF SIGN-OFF (17:00 trigger, OBAVEZAN)
**Agent:** Gari traži šefovu potvrdu eksplicitno
**Input:** Šef testira igru (`play_url`) za 5+ minuta
**Output:** `docs/sef_signoff.md` — kratka beleška šefa: "OK za release" ili "vrati u fix"
**Bez sign-off-a, igra NE ide u released status.** Beta Trio score ne zamenjuje šefa.

### KORAK 7 — FINALE (Gari direktno, 17:00 trigger kraj)
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
| Vreme po stage sesiji | 4–5h | 6h (mora stati u trigger razmak) |
| Vreme ukupno (3 stage istog dana) | 12–15h | 18h |
| JS linija ukupno (single-layer) | 8000–12000 | 15000 |
| JS linija ukupno (multi-layer manager/sim) | 18000–28000 | 35000 |
| CSS linija ukupno | 800–1500 | 3000 |
| Broj modula (single-layer) | 25–40 | 60 |
| Broj modula (multi-layer) | 50–90 | 120 |
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

**Multi-layer princip (2026-05-10 direktiv):** Branded/utility igre treba da budu **multi-layer manager/sim** (Game Dev Tycoon / Two Point Hospital / Project Highrise tier), ne single-layer time management ili clicker. Macro layer (sezona/nedelja: planiranje, promo, networking, resursi) + Micro layer (sesija: sama izvedba) + Meta progresija (career, prestige, branching ishodi). Resource carry-over između layer-a je obavezan — što se postiže u jednom uticaje sledeći. Single-layer "nezanimljivo" je default greška u concept fazi.

## Git Workflow

Svaki stage završava commit-om sa stage tag-om u poruci:
- `[concept] <Naziv>: docs done` (kraj 03:00 sesije)
- `[impl] <Naziv>: <broj> modula, <LOC> linija` (kraj 09:00 sesije)
- `[polish] <Naziv>: beta iter <N>, fix log` (17:00 sesija fix krugovi)
- `Released: <Naziv> (<žanr>) — serves <brand_serves>` (17:00 sesija finalni)

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

> *"Pravimo stvari koje valjaju. Tri sesije dnevno, jedna igra dnevno. Svaka igra hrani Kluboslaviju, Guncati ili obadva — ili ne ide."*
