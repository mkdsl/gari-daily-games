# GDD — Graviton

## 1. Entiteti

### 1.1 Brod (Player)

| Parametar | Vrednost |
|-----------|----------|
| Vizuelna veličina | 16×16 px (pixel art trokut) |
| Hitbox | 10×10 px krug, centriran na brodu |
| Hitbox offset | (3, 3) od gornjeg levog ugla sprite-a |
| X pozicija | fiksirana na 15% širine ekrana (ne pomera se horizontalno) |
| Y pozicija | kontinuirana promenljiva, kreće od centra ekrana |
| Gravitacioni pol | `UP` ili `DOWN`, počinje `DOWN` |
| G-overload stanje | float 0.0–1.0, vidljiv tek od zone 4 |

**Vizuelni status boja (G-overload):**

| g_overload | Boja broda |
|------------|------------|
| 0.0–0.49 | bela `#FFFFFF` |
| 0.50–0.74 | žuta `#FFD700` |
| 0.75–0.99 | narandžasto-crvena `#FF4500` |
| 1.0 | crvena `#FF0000` → smrt |

Interpolacija: `lerpColor(WHITE, YELLOW, t)` za 0–0.5, `lerpColor(YELLOW, RED, (t-0.5)*2)` za 0.5–1.0.

Flip animacija: 180° rotacija vizuelnog trokuta za tačno 150 ms (lerp), hitbox se ne rotira.

---

### 1.2 Zona

Zona je segment terena širine **800 px** (= 1 "screen width" pri standardnom prikazu 800×450 px). Igra uvek ima tačno **3 zone vidljive/aktivne** u bafer-u (jedna iza broda, jedna u kojoj je brod, jedna ispred).

Zona se definiše objektom:

```
{
  template_id: 0–9,        // indeks šablona
  floor_y: number,          // Y koordinata poda (od vrha)
  ceil_y: number,           // Y koordinata plafona (od vrha)
  obstacles: Obstacle[],   // lista prepreka u lokalnom koordinatnom sistemu
  gap_width: number,        // slobodan prolaz u px (min 60, max 200)
  scroll_speed_override: null | number  // null = koristi globalnu brzinu
}
```

Koordinate prepreka su relativne na levu ivicu zone (0–800 px) i visinu zone (`ceil_y` do `floor_y`).

---

### 1.3 Prepreke

#### Blok (Wall Block)
- Pravougaonik, hitbox = vizuelni kvadrat do na 2 px margine
- Dimenzije: širina 40–120 px, visina = od poda do slobodnog prolaza (ili od plafona)
- Boja: `#FF6B2B`

#### Šiljak (Spike)
- Vizuelno: trougao, baza 20 px, visina 28 px
- Hitbox: 14×20 px pravougaonik centriran na trougao (±3 px tolerancija)
- Pričvršćen uz pod (`floor_y`) ili plafon (`ceil_y`)
- Boja: `#FF6B2B`

#### Buzzsaw
- Vizuelno: kvadrat 32×32 px koji se rotira vizuelno (CSS transform / canvas rotate)
- **Hitbox: statičan krug poluprecnika 14 px**, centriran na kvadrat — ne rotira, ne menja se
- Rotacija samo vizuelna: 360°/s konstantna brzina
- Može biti statičan (fiksiran X, Y) ili oscilujući (vertikalno kretanje ±40 px, period 2 s)
- Boja: `#FF6B2B`

#### Pod i Plafon
- Pod: crna traka, Y = `FLOOR_Y = canvas.height - 30`, debljina 30 px, neon zelena gornja ivica `#39FF14` 2 px
- Plafon: crna traka, Y = 0, debljina 30 px, neon zelena donja ivica `#39FF14` 2 px
- Hitbox = cela traka (30 px)

---

## 2. Fizika

### 2.1 Scroll

| Parametar | Vrednost |
|-----------|----------|
| Bazna scroll brzina | `SCROLL_BASE = 180 px/s` |
| Brzina po speed levelu | `SCROLL_SPEED(lvl) = SCROLL_BASE + lvl * 18` |
| Maksimalna brzina | `SCROLL_MAX = 360 px/s` (dostiže se na speed level 10) |
| Speed level raste | svakih 60 sekundi survivala |

Prepreke se kreću ulijevo brzinom `SCROLL_SPEED(currentLevel)` px/s. Brod stoji na fiksiranom X.

`ZONE_SPAWN_LOOKAHEAD = 2` — nova zona se generiše/učitava dok je 2 × 800 px = 1600 px desno od borda vidnog polja.

### 2.2 Gravitacija

| Parametar | Vrednost |
|-----------|----------|
| Gravitaciona akceleracija | `GRAVITY = 900 px/s²` |
| Maksimalna fall brzina | `VELOCITY_MAX = 500 px/s` |
| Flip: instant promena smera akceleracije | da — brzina se NE resetuje na 0 pri flipu |
| Dodir poda/plafona | brzina Y = 0, brod "lepi" se uz traku |

**Update loop (per frame, dt u sekundama):**
```
velocity_y += gravity_direction * GRAVITY * dt
velocity_y = clamp(velocity_y, -VELOCITY_MAX, VELOCITY_MAX)
brod.y += velocity_y * dt
```

`gravity_direction` je `+1` (prema dole) ili `-1` (prema gore). Flip = `gravity_direction *= -1`.

### 2.3 Flip Tajming

- Input: `Space`, `ArrowUp`, `ArrowDown`, levi klik/tap bilo gde
- Flip se prihvata **jedan put po pritisku** (ne drži se)
- Cooldown između dva flipa: **200 ms** (sprečava accidental double-flip)
- Flip se procesira odmah (bez buffering-a)

---

## 3. G-Overload Sistem

### 3.1 Timer

| Parametar | Vrednost |
|-----------|----------|
| `G_OVERLOAD_MAX_TIME` | 4.0 sekunde |
| `G_OVERLOAD_WARNING_THRESHOLD` | 0.5 (50%) |
| Timer aktivacija | tek od zone 4 (≥ 4 zone prošle) |
| Reset pri flipu | timer se resetuje na 0.0 odmah |
| Reset pri dodir poda/plafona | NE resetuje — samo flip resetuje |

### 3.2 Logika

```
if (zone_index >= 4):
    g_overload_timer += dt
    g_overload_ratio = g_overload_timer / G_OVERLOAD_MAX_TIME
    
    if g_overload_ratio >= 1.0:
        triggerDeath("G-OVERLOAD")
    
    updateBrodColor(g_overload_ratio)
    if g_overload_ratio >= G_OVERLOAD_WARNING_THRESHOLD:
        triggerBeepWarning(g_overload_ratio)
else:
    g_overload_timer = 0
    g_overload_ratio = 0
```

Posle flip-a:
```
g_overload_timer = 0
g_overload_ratio = 0
```

### 3.3 Vizuelni Feedback

- Boja broda: interpolacija prema tabeli iz sekcije 1.1
- Screen vignette: **NE** (izbačeno prema premortem preporuci — single feature, ne scope-bloat)
- Beep: počinje kad `g_overload_ratio >= 0.5`, frekvencija beep-ova raste: interval = `800ms * (1 - g_overload_ratio)` ms

---

## 4. Proceduralni Generator

### 4.1 Pravila Predgeneracije

Na startu sesije (pre prvog frame-a):
1. Generisati sekvencu od **100 zona** i sačuvati kao niz
2. Prve 3 zone su uvek: `TUTORIAL_1`, `TUTORIAL_2`, `TUTORIAL_3` (fiksni šabloni, bez buzzsaw-a)
3. Počevši od zone 4: random shuffle šablona 0–9 sa parametarskom varijacijom
4. Constraint: nikad isti `template_id` dva puta uzastopno
5. Constraint: `template_id` koji sadrži buzzsaw ne sme biti u prvih 3 pozicije pool-a (zone 4–6)
6. Constraint: posle šablona tipa `NARROW_PASS` ne sledi šablon tipa `NARROW_PASS` niti `FULL_BUZZSAW`

### 4.2 Šabloni Zona (8 šablona + 3 tutorial)

#### Tutorial šabloni (zone 1–3, fiksni):

**TUTORIAL_1** — Samo prolaz kroz centar
- Nema prepreka
- Gap: 200 px, centriran vertikalno
- Cilj: igrač nauči flip

**TUTORIAL_2** — Jedan blok na podu
- Jedan blok 80×60 px na podu, na X = 400
- Gap: 180 px iznad bloka
- Cilj: nauči flip na vreme

**TUTORIAL_3** — Šiljci na podu i plafonu naizmenično
- 3 šiljka na podu, 3 šiljka na plafonu, naizmenično, X razmak 120 px
- Gap: 160 px
- Cilj: ritam flipping

#### Gameplay šabloni (zone 4+):

**T0 — CORRIDOR_LOW** — Uski niski prolaz
- Blok od poda visine `H * 0.3` do `H * 0.45`, X = 200–600
- Gap: `gap_width` px iznad bloka (parametar: 80–130 px)
- Bez buzzsaw-a
- Varijacija: gap pozicija gore/dole

**T1 — CORRIDOR_HIGH** — Uski visoki prolaz
- Blok od plafona visine `H * 0.3` do `H * 0.45`, X = 200–600
- Gap: `gap_width` px ispod bloka (parametar: 80–130 px)
- Bez buzzsaw-a

**T2 — SPIKE_FLOOR** — Šiljci na podu
- 2–5 šiljaka na podu, X razmak između: 60–100 px, početni X: 100–200
- Varijacija: broj šiljaka (parametar: `spike_count` 2–5)
- Bez buzzsaw-a

**T3 — SPIKE_CEIL** — Šiljci na plafonu
- 2–5 šiljaka na plafonu, X razmak između: 60–100 px
- Varijacija: `spike_count` 2–5
- Bez buzzsaw-a

**T4 — SPIKE_BOTH** — Šiljci gore i dole naizmenično
- 2 para šiljaka, gore-dole alterniraju
- Gap između para: min 70 px
- Bez buzzsaw-a

**T5 — BUZZSAW_STATIC** — Buzzsaw na fiksnoj poziciji
- 1 buzzsaw, Y = sredina kanala ± 30 px (random), X = 350–450
- `gap_width` min 80 px sa obe strane buzzsaw-a
- Hitbox: krug R=14 px

**T6 — BUZZSAW_OSCILLATE** — Buzzsaw koji osciluje vertikalno
- 1 buzzsaw, osciluje ±40 px oko Y centra, period 2.0 s
- Igrač mora da proceni "rupa" u oscilaciji
- X = 300–500

**T7 — DOUBLE_BLOCK** — Dva bloka, jedan gore jedan dole
- Blok 60×80 od poda na X=200, blok 60×80 od plafona na X=500
- Gap između: `gap_width` px (parametar: 90–150 px)
- Igrač mora dva puta promeniti pol

**T8 — GAUNTLET** — Kombinacija šiljaka + blok
- Blok od poda na X=150, šiljci na plafonu X=350–550
- Gap: 90–120 px
- Nema buzzsaw-a
- Najteži čist šablon — count u pool-u: max 15% ukupnih zona

**T9 — CALM_OPEN** — Otvorena zona, odmor
- Nema prepreka
- Gap: 250 px, slobodan prolaz
- Namena: "breathing room" posle teških sekvenci
- Pravilo: insertuje se automatski svakih 7–10 zona (random u tom opsegu)

### 4.3 Parametarska Varijacija

Sledeći parametri se randomizuju pri generaciji svake zone (uniform random u opsegu):

| Parametar | Opseg | Default |
|-----------|-------|---------|
| `gap_width` | po šablonu (videti gore) | 120 px |
| `spike_count` | 2–5 | 3 |
| Buzzsaw start phase | 0–2π | random |
| Block X pozicija | ±50 px od default | fixed |
| Zone floor/ceil padding | ±10 px od default | 0 |

### 4.4 Difficulty Scaling u Parametrima

`gap_width` i `spike_count` zavise od speed levela:

```
gap_width = base_gap - level * 4      (min clamp: 60 px)
spike_count_max = 2 + floor(level/2)  (max clamp: 5)
```

---

## 5. Speed Progression

| Speed Level | Scroll brzina | Vreme za dostizanje |
|-------------|---------------|---------------------|
| 0 | 180 px/s | start |
| 1 | 198 px/s | 60 s |
| 2 | 216 px/s | 120 s |
| 3 | 234 px/s | 180 s |
| 4 | 252 px/s | 240 s |
| 5 | 270 px/s | 300 s (5 min — zlatna zvezda) |
| 6 | 288 px/s | 360 s |
| 7 | 306 px/s | 420 s |
| 8 | 324 px/s | 480 s |
| 9 | 342 px/s | 540 s |
| 10 | 360 px/s | 600 s (10 min — platinum) |

Formula: `SCROLL_SPEED = 180 + speed_level * 18`, cap na 360.
`speed_level = floor(survival_seconds / 60)`, cap na 10.

Level-up trigger: `if floor(current_seconds / 60) > speed_level → speed_level++`

---

## 6. Scoring

### 6.1 Score

```
score = floor(survival_time_seconds)   // 1 bod = 1 sekunda
```

Score se prikazuje u HUD-u kao `X.X s` (jedan decimalni).

### 6.2 Milestone Pragovi

| Prag | Oznaka | Uslov |
|------|--------|-------|
| 30 s | — | audio: ascending arpeggio |
| 60 s | Speed +1 | audio: arpeggio + HUD bljesak |
| 120 s | Speed +1 | isto |
| 300 s | Zlatna zvezda | na end screenu |
| 600 s | Platinum | na end screenu |

### 6.3 High Score

```javascript
localStorage.setItem('graviton_best', best_seconds.toString())
localStorage.getItem('graviton_best') ?? '0'
```

Ključ: `graviton_best`
Vrednost: integer sekundi kao string.

High score se proverava i potencijalno ažurira SAMO pri prelasku u stanje `HIGH_SCORE_CHECK`.

---

## 7. Tutorial Zona (Zone 1–3)

Tokom zona 1, 2 i 3 (`zone_index < 4`) sledeće je **isključeno**:
- G-overload timer se ne napreduje (ostaje na 0, brod uvek beo)
- G-overload beep ne zvuči
- Buzzsaw prepreke se ne pojavljuju (šabloni T5 i T6 su zabranjeni)
- Speed level ne raste (scroll brzina fiksna na 180 px/s tokom prva 3 zone)

`zone_index` se inkrementira svakom zonom koja napusti levo vidno polje (brod je "prošao" zonu).

**Napomena:** Vizuelni HUD za G-overload (boja broda) se ne prikazuje u zone < 4. Brod je uvek beo.

---

## 8. Game States

```
IDLE → PLAYING → DEAD → HIGH_SCORE_CHECK → IDLE
```

### IDLE
- Prikazuje se start screen: naziv igre, "TAP / SPACE to start", best time
- Brod je statičan, nema scroll-a
- Input: Space / tap → prelazi u PLAYING

### PLAYING
- Glavni game loop aktivan (scroll, fizika, G-overload, collision)
- HUD vidljiv: vreme preživljavanja (gore levo), speed level (gore desno)
- Input: Space / tap / strelice → flip gravitacije
- Prelaz u DEAD: death trigger aktiviran

### DEAD
- Sve staje (scroll = 0, fizika = 0)
- Fade to black: 300 ms lerp alpha 0→0.8 na crnom overlay-u
- Sound: dissonant death chord (300 ms fadeout)
- Automatski prelaz u HIGH_SCORE_CHECK posle 400 ms

### HIGH_SCORE_CHECK
- Izračunaj `current_score`, učitaj `graviton_best` iz localStorage
- Ako `current_score > best`: ažuriraj localStorage, postavi `new_record = true`
- Prikaži end screen:
  - "CRASHED AT X:XX" (veliki font, crvena boja)
  - "BEST: X:XX" (manji font, bela boja)
  - Ako `new_record = true`: "NEW RECORD!" (zlatna boja, bljesk animacija)
  - Oznaka sesije: zlatna zvezda ako ≥ 300 s, platinum ako ≥ 600 s
  - Dugme "RESTART" (Space / tap / klik)
- Input: Space / tap / klik na RESTART → prelazi u IDLE (sa resetom sve state)

### State Reset pri IDLE

Pri prelasku u IDLE (restart):
```
survival_time = 0
speed_level = 0
zone_index = 0
g_overload_timer = 0
brod.y = canvas.height / 2
velocity_y = 0
gravity_direction = +1
regeneriši 100 zona
```

---

## 9. Win/Lose

### Lose — Death Triggers

Smrt se aktivira ako bilo koji od sledećih uslova je tačan u trenutku collision check-a:

1. **Kolizija sa preprekom:** centar hitbox-a broda (krug R=5) se preklapa sa hitbox-om prepreke (pravougaonik, spike AABB, buzzsaw krug R=14)
2. **Kolizija sa podom:** `brod.y + hitbox_radius >= FLOOR_Y`
3. **Kolizija sa plafon:** `brod.y - hitbox_radius <= CEIL_Y`
4. **G-overload 100%:** `g_overload_ratio >= 1.0` (samo od zone 4)

Collision check se radi svaki frame, AABB za blokove i šiljke, circle-circle za buzzsaw.

### Win — Milestone Achievements

Nema "pobede" koja zaustavlja igru. Milestoni su vizuelni:
- **Zlatna zvezda (≥ 300 s):** prikazuje se na end screenu pored CRASHED AT teksta
- **Platinum (≥ 600 s):** prikazuje se na end screenu umesto zlatne zvezde

Igra se nastavlja beskonačno dok ne dođe do death trigera.

---

## 10. Canvas / Ekran

| Parametar | Vrednost |
|-----------|----------|
| Canvas width | 800 px (fiksno, responsive scale wrapper) |
| Canvas height | 450 px (16:9) |
| `FLOOR_Y` | 420 px (od vrha — 30 px pod) |
| `CEIL_Y` | 30 px (od vrha — 30 px plafon) |
| Brod X | 120 px (fiksno) |
| Brod start Y | 225 px (sredina) |
| Kanal visina | `FLOOR_Y - CEIL_Y = 390 px` |

Mobile: canvas se skalira CSS-om da popuni viewport uz čuvanje aspekta. Touch tap = flip.
