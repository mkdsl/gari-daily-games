# Gari Daily Games — Multi-Day Game Pipeline

## Šta je ovo

Automatizovan pipeline koji napreduje jednu HTML5 igricu kroz tri stage-a: **concept → impl → polish**. **Jedan trigger dnevno (03:00 CET)**, jedan stage po sesiji — igra završi za 3 dana (Dan 1: concept, Dan 2: impl, Dan 3: polish). Svaka stage sesija je fresh Claude Code run na Anthropic cloud-u. Trigger čita najnoviji `manifest.json` u `games/`: ako je `status: "released"` (ili `games/` prazan), kreće nova igra u `concept` stage-u; inače napreduje postojeću kroz sledeći stage.

**Aktivan trigger raspored:**
- **03:00 — jedini GDG trigger** (concept / impl / polish — zavisi od manifest.stage)

**Teorijski raspored ako šef postavi 09:00 i 17:00 triggere (Opcija A, nije aktivno):**
- 03:00 — concept stage; 09:00 — impl stage; 17:00 — polish stage (tada igra = 1 dan, 30+ igara/mesec)

**Trenutni kapacitet (1 trigger / dan):** ~10 igara mesečno (3 dana po igri).

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

## Stage Progression (1 sesija po danu, 03:00 trigger)

| Dan | Stage | Koraci | Output | manifest.json |
|-----|-------|--------|--------|---------------|
| **Dan 1 — 03:00** | concept | 0, 1, 2, 3 | placeholder folder, concept.md, premortem.md, gdd.md | `stage: "concept"` |
| **Dan 2 — 03:00** | impl | 4 (4a–4f) | manifest.json popunjen, src/, styles/, index.html | `stage: "impl"` |
| **Dan 3 — 03:00** | polish | 5, 6, beta-2, šef sign-off, 7 | beta_report.md, fix_log.md, README.md, push, deploy | `stage: "polish"` → `status: "released"` |

**Auto-trigger logic (Gari KORAK 0):** Pročitaj najnoviji `manifest.json` u `games/` (po datumu fajla):
- `status == "released"` ili `games/` prazan → **nova igra**, kreni concept stage
- `stage == "concept"` → impl stage (Dan 2)
- `stage == "impl"` → polish stage (Dan 3)
- `stage == "polish"` (nije released) → nastavi polish do `released`
- `status == "failed"` → pokušaj nastavak istog stage-a; posle 2 fail → ručna intervencija šefa

**Stage-per-session ekonomija:** 1 stage = 1 sesija ≈ 4–5h cloud. 10K+ LOC se gradi kroz 3 dana, ne 3 sesije istog dana. **~10 igara mesečno** (3 dana po igri).

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

**KORAK 0b — Backlog cap pre nove igre (PRE routing tabele, samo 03:00 trigger):**

KORAK 0 routing gleda "najnoviji manifest po datumu fajla" — kad nova igra uđe u pipeline, starije
završene igre koje čekaju sef_signoff trajno ispadaju iz vidokruga (nijedan trigger ih više ne
pominje, ne postoje u routing tabeli jer nisu "najnovije"). Od 2026-05-21 do 2026-06-17 ovo je
proizvelo 9 igara zaglavljenih u `stage: "polish"` sa `sef_signoff: false` (najstarija 36 dana —
vidi `tim/retrospektiva/2026-06-17.md` u ajajaj repo, Nalaz #1). Pipeline je nastavljao da pravi
NOVE igre dok je red rastao, umesto da stane i traži test postojećih.

Pre nego što 03:00 trigger pokrene NOVU igru (uslov: `status == "released"` ili `games/` prazan),
prebroj sve postojeće manifeste koji NISU released:

```bash
count=0
for m in games/*/manifest.json; do
  stage=$(grep -o '"stage": *"[^"]*"' "$m" | cut -d'"' -f4)
  status=$(grep -o '"status": *"[^"]*"' "$m" | cut -d'"' -f4)
  [ -z "$stage" ] && continue
  [ "$status" = "released" ] && continue
  [ "$status" = "failed" ] && continue
  count=$((count+1))
done
echo "$count"
```

- Ako je `count >= 2` → **ne kreni novu igru.** Umesto toga, regeneriši/osveži JEDAN konsolidovan
  signoff-test paket (lista svih čekajućih igara sortirana od najstarije, sa play_url za svaku) i
  commit-uj samo to (`chore: signoff backlog refresh, N igara čekaju`). Sesija se završava ovde —
  ne trošiti token budžet na koncept za igru #N+1 dok već N >= 2 čekaju test.
- Ako je `count < 2` → nastavi normalno na routing tabelu ispod.

Ovaj korak ne dira sef_signoff/release logiku niti postojeće igre — samo zaustavlja STVARANJE nove
zaglavljene igre dok red ne padne ispod 2. Šef revertuje jednim `git revert` ako se ne slaže.

**KORAK 0c — Cross-game registry drift check (PRE routing tabele, svaki trigger):**

Cross-game mehanizmi (npr. Kluboslavija Pasoš — `games/2026-05-10-cross-event-pasos/`)
imaju svoj registar (`SLUG_WHITELIST` u `pasos-sdk.js`, `STAMPS` u `config.js`) koji niko
ne osvežava automatski kad nova igra bude `released` — KORAK 0/0a/0b prate samo
`manifest.json` polja (`stage`, `status`, `sef_signoff`), ne i ove sekundarne registre.
2026-06-21 (vidi `tim/retrospektiva/2026-06-21.md` u ajajaj repo, Iskra nalaz) ovo je
nađeno tek slučajno — Pasoš je imao 3/28 igara registrovanih, netaknut od 10.05, 6+ nedelja
niko nije primetio jer nijedan trigger nije gledao taj fajl.

Pre routing tabele, prebroj:

```bash
released=$(for m in games/*/manifest.json; do grep -q '"status": *"released"' "$m" && echo x; done | wc -l)
registered=$(grep -c "slug:" games/2026-05-10-cross-event-pasos/src/config.js 2>/dev/null || echo 0)
```

- Ako je `released - registered >= 5` → dodaj jedan red u `docs/signoff_backlog.md` (ili
  ekvivalentni dnevni artefakt): "Pasoš registry drift: N released igara nije u SLUG_WHITELIST/STAMPS
  — vidi `games/2026-05-10-cross-event-pasos/src/config.js`." Ne dodaješ slugove sam (to je
  Jovin posao, brand/copy odluka po igri) — samo flaguješ da gap postoji i koliko je velik.
- Ako je gap `< 5` → preskoči, idi na routing tabelu ispod.

Ovaj korak je idempotentan, samo izveštava (ne piše u config.js/manifest), ne dira release logiku.

**KORAK 0d — Orphaned concept/impl rescue (PRE routing tabele, svaki trigger):**

KORAK 0 routing bira SAMO najnoviji `manifest.json` po datumu fajla — svaka igra koja
ostane u `concept` ili `impl` stage-u kad novija igra preuzme "najnoviji" slot postaje
trajno nevidljiva nijednom trigeru. Niš Fuga (`games/2026-06-01-nis-fuga/`) je ovako
stajala u `concept` 26 dana, 0 commit-a od kreiranja — nađeno 06-18 (Nega), ponovo 06-25,
nikad strukturno popravljeno (vidi `tim/retrospektiva/2026-06-18.md` i `2026-06-25.md`
u ajajaj repo, Nalaz #2 oba puta).

Pre routing tabele, prebroj sve manifeste sa `stage` u `concept` ili `impl` koji NISU
najnoviji po datumu fajla:

```bash
latest=$(ls -t games/*/manifest.json | head -1)
for m in games/*/manifest.json; do
  [ "$m" = "$latest" ] && continue
  stage=$(grep -o '"stage": *"[^"]*"' "$m" | cut -d'"' -f4)
  if [ "$stage" = "concept" ] || [ "$stage" = "impl" ]; then
    echo "$m: orphaned at $stage"
  fi
done
```

- Ako orphan postoji → **trigger čijem stage-u orphan odgovara (09:00 za concept→impl,
  17:00 za impl→polish) radi NA ORPHAN-U umesto na najnovijem manifestu**, jedan po
  trigeru dok ne stigne do `polish`. Najnoviji manifest čeka svoj red (ne gubi se —
  ostaje na svom trenutnom stage-u do sledeće prilike).
- Ako više orphan-a postoji → najstariji po datumu fajla ide prvi.
- Ako orphan nema → nastavi normalno na routing tabelu ispod.

Ovaj korak ne dira manifest/release logiku — samo bira KOJI manifest trigger sledeći
obrađuje. Šef revertuje jednim `git revert` ako se ne slaže.

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

**⛔ SCOPE GRANICA CONCEPT STAGE:** Concept sesija commit-uje ISKLJUČIVO `docs/concept.md`, `docs/premortem.md`, `docs/gdd.md` i `manifest.json` (sa `stage: "concept"`). **NE commit-uj src/ fajlove, index.html, README.md, styles/ niti template scaffold.** Template `cp` smeš da uradiš lokalno ali ne commit-uj dok impl ne počne (Dan 2). README.md je KORAK 7 output — commit pre release-a briše ga prazninom.

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

### KORAK 6.75 — AUTO-RELEASE GATE

**Auto-release uslovi (oba moraju biti ispunjena):**
- `beta_score_iter2 >= 8.0`
- 0 CRITICAL bugova u oba `beta_report.md`

Ako **oba uslova ispunjena** → preskoči čekanje, idi direktno na KORAK 7. Šef dobija notifikaciju posle release-a. Veto: `git revert` released commita u bilo kom trenutku → igra se vraća u `polish/in_progress`.

Ako **nije ispunjeno** (score < 8.0 ili postoji CRITICAL) → kreira se `docs/sef_signoff.md` kao i pre, pipeline čeka šefov nod.

### KORAK 7 — FINALE (Gari direktno, 17:00 trigger kraj)
- Ažuriraj `manifest.json` sa line counts, oba beta_score-a, post_fix_score, `sef_signoff: true`, `stage: "polish"`, `status: "released"`
- Izračunaj `post_fix_score`:
  ```
  CRITICAL_count = broj iz oba beta_report.md
  MEDIUM_count   = broj iz oba beta_report.md
  fix_bonus      = min((CRITICAL_count × 1.0) + (MEDIUM_count × 0.5), 1.0)
  post_fix_score = min(beta_score_iter2 + fix_bonus, 9.0)
  ```
  Bonus je capovan na +1.0 PRE dodavanja — bez ovog cap-a, bonus iz dva beta_report.md kruga
  skoro uvek prelazi razliku do 9.0 i score saturira na 9.0 za svaku igru bez obzira na
  `beta_score_iter2` (nađeno 06-19, ponovljeno 06-20/06-21/06-22 — 14/14 igara u
  `docs/signoff_backlog.md` su `post_fix_score: 9.0` iako `beta_score_iter2` ide od 7.4 do 9.0).
  **Ne retroaktivno** — postojeći manifest.json brojevi se ne prepisuju, formula važi za igre
  koje tek ulaze u KORAK 7 od ove izmene nadalje. Ako šef želi retroaktivni rekalkulacija,
  to je zaseban, eksplicitan zadatak (menja postojeće podatke u 14+ fajlova, veći rizik od greške).
- Napiši `games/YYYY-MM-DD-naziv/README.md`
- Dodaj red u `games/README.md` index
- `git add games/YYYY-MM-DD-naziv/ games/README.md`
- `git commit -m "Released: [Naziv] ([žanr]) — serves [brand_serves]"`
- `git push origin main`
- GitHub Pages auto-deploy ~1min

### KORAK P-init — POPUNJAVANJE QUEUE-A (odmah posle KORAK 7, ista sesija)

Čim igra dobije `status: "released"`, četiri agenta paralelno dodaju stavke u `docs/patch_queue.md` te igre:

| Agent | Input | Šta dodaje |
|-------|-------|-----------|
| **Nega** | `beta_report.md` + `beta_report_2.md` + `fix_log.md` | P1/P2 — tehnički dug, LOW bugovi koji nisu ušli, potencijalne regresije |
| **Iskra** | `manifest.json` + `concept.md` | P3 — brand hooks, kako igra hrani K/Guncati/MKDSLend u narednih 6 meseci |
| **Dule** | `manifest.json` + `concept.md` | P2/P3 — retention, replay vrednost, emocionalna kriva posle prvog prolaska |
| **Sine** | `concept.md` | P3 — narativna ekspanzija, novi dijaloški lukovi, content koji produžuje igru |

Svaki agent dodaje 3–5 stavki. Commit: `[P-init] NazivIgre: patch queue populated (Nega/Iskra/Dule/Sine)`.

---

### KORAK P — PATCH STAGE (post-release, autonomni)

**Kada se aktivira:** KORAK 0 routing kaže "nova igra" (latest manifest `status == "released"`)
ALI pre nego što se kreira novi concept, Gari proverava da li postoji otvoreni patch bez `[HOLD]`:

```bash
for q in games/*/docs/patch_queue.md; do
  grep -qP "^- \[ \] P[123](?! \[HOLD\])" "$q" && echo "$q" && break
done
```

- Ako otvoreni patch postoji → **KORAK P umesto novog concept-a** (jedan patch, jedna igra)
- Ako nema → nastavi normalno na novi concept

**Izvršni redosled unutar jedne igre:** P1 → P2 → P3 (po redu pojavljivanja u fajlu)

**Flow KORAK P:**
1. Gari čita `manifest.json` te igre
2. Uzima PRVI otvoreni red bez `[HOLD]` (P1 first, pa P2, pa P3)
3. Brifinuje Jovu: naziv igre, opis patcha, TAČNO 1–2 modula
4. Jova čita manifest.json + navedene module (ništa više)
5. Gari commit-uje: `[patch] NazivIgre: opis — P1/P2/P3`
6. Zaokruži `[ ]` → `[x]` + dodaj datum i commit hash
7. Push — GitHub Pages auto-deploy

**Token budžet po patch sesiji:** ~50–150K

**Ko dodaje stavke:**
- Tim (Nega/Iskra/Dule/Sine) direktno commituju stavke — nema [PROPOSAL] taga, trigger ih izvršava
- Šef dodaje `[HOLD]` na stavke koje želi da pauzira ili preusmeri
- Šef može da doda sopstvene stavke direktnim editom

**patch_queue.md format:**
```markdown
# Patch Queue — Naziv Igre

## Otvoreni patčevi
- [ ] P1 `src/modul.js` — auto-izvršava odmah (bug)
- [ ] P2 `src/modul.js` + `styles/ui.css` — auto-izvršava (polish)
- [ ] P2 [HOLD] `src/audio.js` — pauziran, šef odlučuje kad
- [ ] P3 `src/content/brand_hooks.js` — auto-izvršava kad nema P1/P2

## Završeni patčevi
- [x] P1 `src/audio.js` — iOS fix (done 2026-07-10, commit abc1234)
```

**Pravila:**
- Max 2 modula po stavci — ako treba više, to je mini-impl, ne patch
- P1 = bug koji oštećuje brand ili UX
- P2 = polish koji vidno poboljšava iskustvo
- P3 = content/feature expansion
- `[HOLD]` = šef ili tim zamrzavaju stavku dok nije jasno šta treba
- Trigger radi MAX 1 patch po sesiji

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
