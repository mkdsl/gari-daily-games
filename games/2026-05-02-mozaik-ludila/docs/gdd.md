# GDD — Mozaik Ludila

## 1. Core Mehanika

### Grid

- **Dimenzije:** 8 kolona × 8 redova = 64 ćelije
- **Koordinatni sistem:** `(row, col)` gdje je `(0, 0)` gornji levi ugao
- **Ćelija:** `cell_size = 60px` (desktop), skalira se responsivno na mobile
- **Canvas raspored:**
  - Grid počinje na `(grid_offset_x, grid_offset_y)` od canvas origin-a
  - `grid_offset_x = (canvas_width - 8 × cell_size) / 2`
  - `grid_offset_y = 120px` (rezervisano za HUD na vrhu)
- **Fuga (grout line):** 2px između ćelija, iscrtana u boji `#2e3350`
- **Svaka ćelija može biti:** prazna (`null`) ili popunjena bojom (`string hex`)

### Fragmenti (Shapes)

Postoji **7 oblika**, svaki definisan kao array `[row, col]` offseta od **origin ćelije** (gornji-levi ugao bounding boxa). Svaki oblik postoji u **4 rotacije** (0°, 90°, 180°, 270°).

**Rotaciona formula:** Za rotaciju za 90° u smeru kazaljke:
```
[r, c] → [c, maxRow - r]
```
Gde je `maxRow` maksimalni red u trenutnoj rotaciji. Normalizovati posle rotacije da `min(row) == 0` i `min(col) == 0`.

#### Oblici (rotacija 0°):

| ID | Naziv | Ćelije (offset od origina) |
|----|-------|---------------------------|
| `I2` | I-2 | `[0,0], [0,1]` |
| `I3` | I-3 | `[0,0], [0,1], [0,2]` |
| `I4` | I-4 | `[0,0], [0,1], [0,2], [0,3]` |
| `L`  | L    | `[0,0], [1,0], [2,0], [2,1]` |
| `J`  | J (mirror L) | `[0,1], [1,1], [2,0], [2,1]` |
| `T`  | T    | `[0,0], [0,1], [0,2], [1,1]` |
| `S`  | S    | `[0,1], [0,2], [1,0], [1,1]` |
| `Z`  | Z    | `[0,0], [0,1], [1,1], [1,2]` |
| `O`  | O (2×2) | `[0,0], [0,1], [1,0], [1,1]` |
| `Single` | Jedna pločica | `[0,0]` |

> **Napomena:** `O` oblik i `Single` imaju samo 1 efektivnu rotaciju (simetričan). `I2`, `I3`, `I4` imaju 2 efektivne rotacije (horizontalna + vertikalna).

#### Prekalkulisane rotacije

Sve rotacije se prekalkulišu **jednom pri inicijalizaciji** kao `const SHAPES` objekat. Svaki entry je array od 1–4 rotacija, svaka rotacija je array `[row, col]` tuplova.

```js
// Primer (Jova popunjava sve):
const SHAPES = {
  I3: [
    [[0,0],[0,1],[0,2]],   // 0°
    [[0,0],[1,0],[2,0]],   // 90°
    // (180° = 0°, 270° = 90° — deduplikovano)
  ],
  L: [
    [[0,0],[1,0],[2,0],[2,1]],  // 0°
    [[0,0],[0,1],[0,2],[1,0]],  // 90°
    [[0,0],[0,1],[1,1],[2,1]],  // 180°
    [[0,2],[1,0],[1,1],[1,2]],  // 270°
  ],
  // ... svi oblici
};
```

### Input Flow

Klik-za-selekciju model. **Ni jedan drag-and-drop.** Sve se resolvuje na `mouseup` / `touchend`.

**Korak-po-korak:**

1. **Idle state:** U fragment zoni (ispod grida) prikazuju se 1 aktivan fragment i 2 sledeća (peek queue). Igrač vidi šta dolazi.

2. **Selekcija fragmenta:**
   - Igrač klikne/tapne na aktivan fragment u fragment zoni.
   - Fragment prelazi u `SELECTED` state — vizuelno se podiže (scale 1.1, senka).
   - Na fragment zoni: prikazuje se tekst "Klikni na grid za postavljanje | R = rotacija".

3. **Rotacija (opciono, pre postavljanja):**
   - Klik/tap **ponovo na selektovani fragment** (ili pritisak `R` na keyboard) rotira ga za 90° u smeru kazaljke.
   - Nema ograničenja — igrač može rotirati koliko puta hoće.
   - Svaka rotacija odmah ažurira preview ako je kursor već nad gridom.

4. **Preview na gridu:**
   - Dok kursor/prst prolazi iznad grid ćelija (bez klika) — iscrtava se **ghost/preview** fragmenta.
   - Ghost: poluprovidne pločice (opacity 0.45) fragmentove boje na pozicijama koje bi zauzeo, sa bela border outline.
   - Ako pozicija **nije validna** (izlazi van grida ili prekriva popunjenu ćeliju): ghost je crven (rgba(255, 60, 60, 0.45)), bez bijele bordure.
   - Origin ćelija = ćelija ispod vrha kursora (ne centar fragmenta).

5. **Potvrda postavljanja:**
   - Igrač klikne/tapne na ćeliju u gridu dok je fragment selektovan.
   - Ako je pozicija **validna**: fragment se postavlja, prelazi u `IDLE` state, pokreće match evaluaciju.
   - Ako je pozicija **nevalidna**: kratki vizuelni shake grida (3 frejmova, ±4px na x osi), bez promene state.
   - Placement bonus se dodeljuje odmah (+1 po pločici fragmenta).

6. **Deselect:**
   - Klik/tap izvan grida i izvan fragment zone: deselektuje fragment, vraća u `IDLE` bez promene queue.
   - Pritisak `Escape`: isto.

7. **Sledeći fragment:**
   - Posle uspešnog postavljanja, queue se pomera: sledeći fragment postaje aktivan, treći ulazi u peek.
   - Novi fragment se generiše i ubacuje na kraj queue.

### Match Evaluacija

Pokreće se **jednom posle svakog uspešnog postavljanja.** Redosled:

```
1. Evaluiraj sve redove (8 redova × 8 ćelija)
2. Evaluiraj sve kolone (8 kolona × 8 ćelija)
3. Evaluiraj sve 2×2 kvadrante (7×7 = 49 mogućih pozicija: top-left = (r,c) gde r ∈ [0..6], c ∈ [0..6])

Za svaku grupu:
  - Proveri da li su SVE ćelije popunjene I sve iste boje
  - Ako DA → dodaj sve ćelije te grupe u globalni SET (JS Set sa key = "r,c")

4. Nakon evaluacije svih uslova:
   - matched_cells = konvertovani SET u array
   - Ako matched_cells.length == 0 → nema combo, kraj evaluacije
   - Obriši sve matched_cells sa grida (postavi na null)
   - Izračunaj score za ovaj placement (vidi Scoring)
   - Pokreni match animaciju
   - Ažuriraj combo brojač

5. Proveri Game Over (vidi Game Over sekcija)
```

**Ključna pravila:**
- SET garantuje da se ista ćelija ne broji dvaput — čak i ako je u redu I kvadrantu.
- Evaluacija je **eager**: evaluira se kompletna tabla jednom, ne rekurzivno. Nema "chain" evalucije posle brisanja — sledeća evaluacija dešava se tek pri sledećem postavljanju.
- Combo se aktivira ako `matched_cells.length > 0` i aktuelni move je uzastopni match (vidi Combo sistem).

### Game Over

**Trigger:** Posle svakog postavljanja (posle match evaluacije i ažuriranja table), provjeri:

```
Za aktivan fragment sa svim njegovim rotacijama:
  Za svaku rotaciju fragmenta:
    Za svaki (row, col) na gridu (0..7, 0..7):
      Ako svi (row + dr, col + dc) za (dr, dc) u rotaciji:
        - su unutar [0..7] × [0..7]
        - i su prazni (null)
      → postoji validna pozicija → NIJE game over

Ako nijedno nije pronađeno → GAME OVER
```

Ovu provjeru izvesti korišćenjem prekalkulisanih footprint-a (O(shapes × rotations × 64) = max 10 × 4 × 64 = 2560 operacija po potezu — trivijalno brzo).

**Game Over ekran:**
- Overlay na canvas-u (tamna poluprozirna pozadina)
- Prikazati: "KRAJ RESTAURACIJE", finalni score, postotak do cilja (`score / 2500 × 100`%), best combo multiplicator
- Dugme "Ponovo" (klik/tap) → reset sve state, novi run

---

## 2. Scoring & Progression

### Tabela poena

| Akcija | Poeni |
|--------|-------|
| Postavljanje 1 pločice fragmenta | +1 (placement bonus) |
| Brisanje 1 matched pločice | +10 |
| "Perfektni red" bonus (ceo red iste boje, svih 8 pločica) | +100 |
| "Perfektna kolona" bonus (ceo stupac iste boje, svih 8 pločica) | +100 |
| "Perfektni kvadrant" bonus (2×2 iste boje) | +25 |
| Combo ×2 (drugi uzastopni match) | sve brisanje × 2 |
| Combo ×3 (treći uzastopni match) | sve brisanje × 3 |
| Combo ×N (N-ti uzastopni match) | sve brisanje × N, max ×5 |

**Formula za jedan move:**

```
placement_bonus = broj_plocica_fragmenta × 1
base_match_score = matched_cells.length × 10
perfect_bonuses = (red_count × 100) + (kolona_count × 100) + (kvadrant_count × 25)
raw_score = placement_bonus + (base_match_score + perfect_bonuses) × combo_multiplier
total_score += raw_score
```

Gde `combo_multiplier` = 1 ako nema komboa, 2 ako je drugi uzastopni match, itd. (max 5).

**Važno:** `placement_bonus` se NE množuje sa combo_multiplier. Samo match score se množi.

### Combo sistem

**Aktivacija:** Combo se gradi isključivo na osnovu uzastopnih poteza koji rezultuju matchem.

```
combo_count = 0   // na početku sesije

Posle svakog poteza:
  Ako matched_cells.length > 0:
    combo_count += 1
    combo_multiplier = min(combo_count, 5)
    → prikaži combo feedback
  Else:
    combo_count = 0
    combo_multiplier = 1
```

**Combo feedback:** Ako `combo_count >= 2`:
- Kratki tekst na canvas-u: "COMBO ×N!" u zlatnoj boji, fade-out za 1.2s
- Ako `combo_count >= 3`: ekran lagano pulsira zlatnim overlay-em (opacity 0 → 0.15 → 0, trajanje 600ms)

**Reset:** Svaki potez bez matcha resetuje `combo_count` na 0.

### Win Condition

**Target:** `score >= 2500`

**Trigger:** Provjera posle svake ažuriranja score-a.

**Win ekran:**
- "MOZAIK RESTAURIRAN!" animacija (tekst se pojavljuje pločicu po pločicu, svaka sa random bojom)
- Prikazati: finalni score, broj poteza, best combo, vreme sesije (mm:ss)
- Progress bar u HUD-u: `min(score / 2500, 1.0) × 100%`
- Dugme "Novi mozaik" → nova sesija (ne resetuje highscore)
- **Highscore** (localStorage): čuva se highest score ikad i fastest win time

---

## 3. Fragment Generation

### Fragment pool

**Queue sistem:** Uvek postoje **3 fragmenta u queue** (1 aktivan + 2 peek). Kad aktivan bude postavljen, queue se pomera i generiše se novi na kraju.

**Boje:** Fragment dobija **jednu boju** celog oblika. Boja se bira uniformno random iz polja:
```
COLORS = ['#e07b54', '#4a8dbf', '#4db87a', '#f0c040', '#c0405a']
```

**Oblici po fazama:**

| Faza | Score prag | Dostupni oblici | Težina (verovatnoća) |
|------|-----------|-----------------|---------------------|
| 1 — Početak | 0–499 | Single, I2, I3, O | Single 25%, I2 35%, I3 25%, O 15% |
| 2 — Napredak | 500–1499 | I2, I3, I4, L, J, O | I2 20%, I3 25%, I4 15%, L 15%, J 15%, O 10% |
| 3 — Izazov | 1500–2499 | I3, I4, L, J, T, S, Z | I3 10%, I4 15%, L 20%, J 20%, T 15%, S 10%, Z 10% |
| 4 — Maestro | 2500+ (posle win, novi run) | Svi oblici | Uniforno random |

**Implementacija izbora:**

```js
function pickShape(score) {
  const pool = getPoolForScore(score); // vraća [{id, weight}]
  const totalWeight = pool.reduce((s, x) => s + x.weight, 0);
  let r = Math.random() * totalWeight;
  for (const entry of pool) {
    r -= entry.weight;
    if (r <= 0) return entry.id;
  }
}
```

**Rotacija novog fragmenta:** Svaki novokreirani fragment dobija **random početnu rotaciju** (0–N-1 dostupnih rotacija za taj oblik). Igrač može menjati rotaciju pre postavljanja.

### Težina curve

Težina se menja skokovito na score pragovima (nije smooth curve). Promjena je samo u **pool-u dostupnih oblika** — nema brzinskog timera, nema penaltija za sporo igranje. Jedini pritisak je punjenje table.

**Board density awareness (passive):** Nema eksplicitnog "težina raste sa brojem pločica na tabli". Prirodna mehanika punjenja table je dovoljna.

---

## 4. Visual Feedback

### Hint sistem

**Trigger:** Posle svakog postavljanja ili brisanja, ažuriraj hint state.

```
Za svaki red r (0..7):
  Grupiši pročicane boje u redu
  Za svaku boju koja se pojavljuje ≥ 3 puta:
    red r dobija HINT glow te boje

Za svaku kolonu c (0..7): isto

Za svaki 2×2 kvadrant sa top-left (r, c):
  Ako sva 4 popunjena I iste boje → to je match, ne hint
  Ako 3 od 4 iste boje → kvadrant dobija HINT glow te boje
```

**Vizualizacija hint-a:**

- Glow se crta KAO BORDER oko svakog reda/kolone/kvadranta (ne unutar ćelija)
- Stil: `shadowColor = boja_plocice`, `shadowBlur = 12px`, linija debljine 2px
- Glow je **uvek boja koja se "skuplja"** (ne bela, ne zlatna)
- Intenzitet: konstantan, ne treperi
- Ažurira se pri svakom game state change

**Šta hint NIJE:** Hint ne govori igraču "stavi ovde". Pokazuje samo "ovde se nešto greje".

### Match animacija

**Timeline (od trenutka triggerovanja matcha):**

| Vreme (ms) | Šta se dešava |
|------------|---------------|
| 0 | Matched ćelije se selektuju; počinju da "trepere" (opacity: 1 → 0.5 → 1, period 80ms) |
| 0–160 | Trepere 2 puta |
| 160 | Brisanje sa grida (postavljamo na null u state-u) |
| 160–400 | Particle burst: za svaku matched ćeliju, 6–8 čestica lete radijalno (random angle, speed 60–120px/s, fade opacity 1 → 0) |
| 400 | Animacija završena; sledeći fragment postaje dostupan za selekciju |

**Particle čestica:**
- Početna pozicija: centar ćelije
- Random ugao: 0–360°
- Lifetime: 240ms
- Veličina: 4×4px kvadrat, boja = boja ćelije
- Bez fizike (gravity = 0) — čisto linearna putanja

**Tokom animacije (160ms):** Input je **blokiran** — igrač ne može selektovati novi fragment dok animacija traje.

### Placement preview

**Aktivira se** čim je fragment selektovan i kursor/prst uđe na canvas oblast grida.

**Ghost rendering:**
- Svaka ghost ćelija: pravougaonik iste boje kao fragment, opacity 0.45
- Bijela border: 1.5px, opacity 0.8
- **Validna pozicija:** ghost boja = boja fragmenta (opacity 0.45)
- **Nevalidna pozicija:** ghost boja = `rgba(255, 60, 60, 0.45)`, crven border

**Origin computing:**
- Kursor/prst je na canvas koordinati `(cx, cy)`
- Grid ćelija = `col = floor((cx - grid_offset_x) / cell_size)`, `row = floor((cy - grid_offset_y) / cell_size)`
- Ovo je **origin ćelija** (gornji-levi ugao fragmenta)
- Ghost se crta od origin ćelije + svi offseti iz tekuće rotacije

**Fragment u fragment zoni:**
- Aktivan fragment uvek prikazan u centralnoj tački fragment zone
- Selektovan fragment: scale 1.1, box-shadow simuliran sa canvas `shadowBlur = 16px`
- Peek fragmenti (2 sledeća): prikazani manji (scale 0.7), opacity 0.6, bez interakcije

---

## 5. Konstante (za config.js)

| Konstanta | Vrednost | Opis |
|-----------|----------|------|
| `GRID_COLS` | 8 | Broj kolona |
| `GRID_ROWS` | 8 | Broj redova |
| `CELL_SIZE` | 60 | Piksel-veličina ćelije (desktop) |
| `CELL_SIZE_MOBILE` | 38 | Piksel-veličina ćelije (< 480px širine) |
| `GRID_GAP` | 2 | Razmak između ćelija (fuga) |
| `GRID_OFFSET_Y` | 120 | Gornji offset od canvas vrha do grida (za HUD) |
| `FRAGMENT_ZONE_HEIGHT` | 100 | Visina zone ispod grida za prikaz fragmenata |
| `COLORS` | `['#e07b54','#4a8dbf','#4db87a','#f0c040','#c0405a']` | 5 boja pločica |
| `COLOR_BG` | `#1a1d2e` | Pozadina canvas-a |
| `COLOR_GRID_LINE` | `#2e3350` | Boja fuga/linija grida |
| `SCORE_WIN` | 2500 | Win condition |
| `SCORE_PER_TILE` | 10 | Poeni za jedno matchovano obrisano polje |
| `SCORE_PLACEMENT_BONUS` | 1 | Poeni po postavljenoj pločici fragmenta |
| `SCORE_PERFECT_ROW` | 100 | Bonus za kompletan red iste boje |
| `SCORE_PERFECT_COL` | 100 | Bonus za kompletnu kolonu iste boje |
| `SCORE_PERFECT_QUAD` | 25 | Bonus za 2×2 iste boje |
| `COMBO_MAX` | 5 | Maksimalni combo multiplikator |
| `HINT_THRESHOLD` | 3 | Min pločica iste boje u grupi da se aktivira hint |
| `QUEUE_SIZE` | 3 | Ukupno fragmenta u queue (1 aktivan + 2 peek) |
| `PARTICLE_COUNT` | 8 | Čestica po matched ćeliji |
| `PARTICLE_LIFETIME` | 240 | Trajanje čestice (ms) |
| `PARTICLE_SPEED_MIN` | 60 | Min brzina čestice (px/s) |
| `PARTICLE_SPEED_MAX` | 120 | Max brzina čestice (px/s) |
| `MATCH_ANIM_DURATION` | 400 | Trajanje cele match animacije (ms) |
| `INPUT_BLOCK_DURATION` | 160 | Blokiranje inputa tokom brisanja (ms) |
| `GHOST_OPACITY_VALID` | 0.45 | Opacity validnog preview fragmenta |
| `GHOST_OPACITY_INVALID` | 0.45 | Opacity nevalidnog preview (boja = crvena) |
| `SELECTED_SCALE` | 1.1 | Scale selektovanog fragmenta u fragment zoni |
| `PEEK_SCALE` | 0.7 | Scale peek fragmenata |
| `PEEK_OPACITY` | 0.6 | Opacity peek fragmenata |
| `HINT_SHADOW_BLUR` | 12 | shadowBlur za hint glow |
| `COMBO_PULSE_OPACITY` | 0.15 | Max opacity zlatnog combo overlay-a |
| `COMBO_PULSE_DURATION` | 600 | Trajanje combo pulse animacije (ms) |
| `COMBO_TEXT_DURATION` | 1200 | Trajanje combo teksta na ekranu (ms) |
| `PLACEMENT_SHAKE_FRAMES` | 3 | Broji frejmova za shake pri nevažećem postavljanju |
| `PLACEMENT_SHAKE_OFFSET` | 4 | Amplituda shake-a (px) |

---

## 6. Implementacione napomene za Jovu

### Preporučena struktura modula

```
src/
├── main.js          — Bootstrap, requestAnimationFrame petlja, event init
├── config.js        — Sve konstante iz Sekcije 5 (+ SHAPES definicija)
├── state.js         — GameState objekat, save/load highscore u localStorage
├── input.js         — Mouse + touch handlers na canvas-u
├── render.js        — Sve canvas draw pozivi (grid, ćelije, fragmenti, HUD, overlays)
├── ui.js            — HUD rendering (score bar, combo tekst, win/gameover overlay)
├── audio.js         — Web Audio (opciono, po proceni Cece)
├── systems/
│   ├── matching.js  — evaluateMatches(grid) → {matchedCells, perfects, comboIncrement}
│   ├── fragments.js — SHAPES const, prekalkulisane rotacije, pickShape(), createFragment()
│   └── placement.js — isValidPlacement(grid, fragment, row, col), checkGameOver(grid, fragment)
└── particles.js     — ParticleSystem: spawn(), update(dt), draw(ctx)
```

### Shape footprint prekalkulacija

Ne generišu se rotacije "u letu". U `config.js` ili `fragments.js`:

```js
export const SHAPES = {
  I3: {
    rotations: [
      [[0,0],[0,1],[0,2]],
      [[0,0],[1,0],[2,0]],
    ]
  },
  L: {
    rotations: [
      [[0,0],[1,0],[2,0],[2,1]],
      [[0,0],[0,1],[0,2],[1,0]],
      [[0,0],[0,1],[1,1],[2,1]],
      [[0,2],[1,0],[1,1],[1,2]],
    ]
  },
  // ... svi oblici
};

// Fragment u igri:
// { shapeId: 'L', rotationIndex: 0, color: '#e07b54' }
// Aktuelne ćelije = SHAPES[shapeId].rotations[rotationIndex]
```

**Rotacija:** `fragment.rotationIndex = (fragment.rotationIndex + 1) % SHAPES[fragment.shapeId].rotations.length`

### Canvas koordinatni sistem

```js
// Iz canvas event-a → grid ćelija:
function canvasToGrid(canvasX, canvasY) {
  const col = Math.floor((canvasX - gridOffsetX) / CELL_SIZE);
  const row = Math.floor((canvasY - gridOffsetY) / CELL_SIZE);
  if (col < 0 || col >= GRID_COLS || row < 0 || row >= GRID_ROWS) return null;
  return { row, col };
}

// Grid ćelija → canvas pixel (gornji levi ugao ćelije):
function gridToCanvas(row, col) {
  return {
    x: gridOffsetX + col * CELL_SIZE,
    y: gridOffsetY + row * CELL_SIZE,
  };
}
```

**Fragment zone** (ispod grida):
```
fragmentZoneY = gridOffsetY + GRID_ROWS * CELL_SIZE + 16px padding
```

**Responsivnost:** Na load i na `resize` event, rekalkuliši `CELL_SIZE` i `gridOffsetX/Y` na osnovu `window.innerWidth`. Koristi `devicePixelRatio` za crisp canvas:
```js
canvas.width = window.innerWidth * devicePixelRatio;
ctx.scale(devicePixelRatio, devicePixelRatio);
```

### Touch event preporuke

**Obavezno u CSS-u (na `#game-canvas` ili wrapping div-u):**
```css
touch-action: none;
user-select: none;
```

**Obavezno pri registraciji touch handlera:**
```js
canvas.addEventListener('touchstart', onTouchStart, { passive: false });
canvas.addEventListener('touchmove', onTouchMove, { passive: false });
canvas.addEventListener('touchend', onTouchEnd, { passive: false });
```

`passive: false` je obavezno da `event.preventDefault()` unutar handlera uopšte radi (sprečava scroll).

**Koordinate iz touch event-a:**
```js
function getTouchCanvasPos(touch) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: (touch.clientX - rect.left) * (canvas.width / rect.width),
    y: (touch.clientY - rect.top) * (canvas.height / rect.height),
  };
}
// Uvek koristiti touches[0] ili changedTouches[0]
```

**Input model na touch:**
- `touchstart` → selektuj fragment ako je u fragment zoni, ili trigger postavljanje ako je fragment selektovan i tap je na gridu
- `touchmove` → ažuriraj ghost preview (dok prst klizi po gridu)
- `touchend` → ništa posebno (sve je rešeno u `touchstart`)

> Napomena: Na mobile, `touchstart` se ponaša kao "klik" — ne treba čekati `touchend` za akciju. Ovo smanjuje perceived latency.

### Matchovanje SET logika

```js
function evaluateMatches(grid) {
  const matched = new Set(); // ključevi "r,c"
  const perfects = { rows: 0, cols: 0, quads: 0 };

  // Redovi
  for (let r = 0; r < 8; r++) {
    const color = grid[r][0];
    if (color && grid[r].every(c => c === color)) {
      for (let c = 0; c < 8; c++) matched.add(`${r},${c}`);
      perfects.rows++;
    }
  }

  // Kolone
  for (let c = 0; c < 8; c++) {
    const color = grid[0][c];
    if (color && Array.from({length: 8}, (_, r) => grid[r][c]).every(x => x === color)) {
      for (let r = 0; r < 8; r++) matched.add(`${r},${c}`);
      perfects.cols++;
    }
  }

  // 2×2 kvadranti
  for (let r = 0; r < 7; r++) {
    for (let c = 0; c < 7; c++) {
      const color = grid[r][c];
      if (color && grid[r][c+1] === color && grid[r+1][c] === color && grid[r+1][c+1] === color) {
        matched.add(`${r},${c}`); matched.add(`${r},${c+1}`);
        matched.add(`${r+1},${c}`); matched.add(`${r+1},${c+1}`);
        perfects.quads++;
      }
    }
  }

  return { matched, perfects }; // matched je Set stringova "r,c"
}
```

### Game loop struktura

```
main.js:
  requestAnimationFrame(loop)
  
  function loop(timestamp) {
    dt = timestamp - lastTimestamp;
    lastTimestamp = timestamp;
    
    update(dt);   // state transitions, particle update, anim timers
    render(ctx);  // full clear + redraw everything
    
    requestAnimationFrame(loop);
  }
```

Render je **uvek full clear + full redraw** — nema dirty rect optimizacije (grid je 8×8, perf nije problem).
