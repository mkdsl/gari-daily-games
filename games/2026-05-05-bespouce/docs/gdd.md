# GDD: Bespuće

## 1. Mehanike

### 1.1 Fizika broda

| Parametar | Vrednost | Napomena |
|-----------|----------|----------|
| `GRAVITY` | 0.18 px/frame² | Konstanta nadole (+y) |
| `THRUST_UP` | -0.42 px/frame² | Tap/hold gore (suprotno gravitaciji) |
| `THRUST_HORIZ` | ±0.30 px/frame² | Levo/desno pritisak |
| `MAX_VY` | ±7.0 px/frame | Terminalna brzina vertikalno |
| `MAX_VX` | ±5.0 px/frame | Max horizontalna brzina |
| `DRAG` | 0.92 | Multiplikator svaki frame: `vx *= DRAG; vy *= DRAG` |
| `SHIP_SIZE` | 18px (bounding radius) | Isoceles trougao, visina ~30px |

**Integracija (Euler):**
```
vy += GRAVITY
vy += input.up ? THRUST_UP : 0
vx += input.left ? -THRUST_HORIZ : 0
vx += input.right ? THRUST_HORIZ : 0
vx = clamp(vx, -MAX_VX, MAX_VX)
vy = clamp(vy, -MAX_VY, MAX_VY)
ship.x += vx
ship.y += vy
```

Brod je uvek vertikalno centriran na Y=canvasHeight/2 u vizuelnom smislu — **hodnik se skroluje, brod se vizuelno ne pomera po Y previse** (scroll kamera prati brod sa damping 0.1).

---

### 1.2 Hodnik (Chunk sistem)

**Orijentacija:** Horizontalni scroll — svet ide levo, brod lebdi na mestu (X=200px od leve ivice). Hodnik je kanal Gore-Dole.

**Dimenzije:**
- Canvas: 800×500px (desktop), skalira se na mobile
- Hodnik širina: počinje na **320px**, sužava se po pacing tablici
- Zidovi: gornji i donji, definisani kao Y offset od centra

**Chunk struktura:**
```js
{
  width: 600,           // px, koliko traje ovaj chunk
  topWall: [...],       // array {x, y} tačaka gornjeg zida (relativno)
  bottomWall: [...],    // array {x, y} tačaka donjeg zida
  obstacles: [...],     // lista prepreka (vidi §1.3)
  checkpoint: bool,     // da li ovaj chunk ima checkpoint
  crystalSpawns: [...]  // pozicije kristala/ćelija
}
```

**Queue pravila:**
- Queue drži **5 chunk-ova** u memoriji
- Novi chunk se generiše kada prednji chunk pređe x < -600 (izađe van ekrana)
- Chunk generator prima `difficulty` parametar (0.0–1.0) koji raste s distancom

**Generisanje zidova (spline-smooth):**
```
topY = baseTop + sin(t * freq) * amplitude
bottomY = baseBottom + cos(t * freq + phase) * amplitude
hodnikSirina = topY - bottomY >= MIN_WIDTH (nikad manji od 160px)
```

**Scroll brzina** raste po pacing tablici (vidi §7).

---

### 1.3 Prepreke

Sve prepreke imaju **AABB hitbox** (sa -4px padding za fer feel).

| Tip | Naziv | AABB (w×h) | Opis | Pojava |
|-----|-------|-----------|------|--------|
| A | `WALL_SPIKE` | 40×80px | Pravougaonik iz zida, izlazi gore ili dole | Od sekunde 0 |
| B | `FLOAT_BLOCK` | 60×25px | Horizontalni blok koji lebdi na sredini | Od sekunde 20 |
| C | `MOVING_GATE` | 20×150px (otvor 80px) | Vertikalni zid sa prolazom koji se pomera gore/dole | Od sekunde 45 |
| D | `DIAGONAL_BAR` | 80×15px | Dijagonalna letva (rotirana 30°, ali AABB je 80×55) | Od sekunde 70 |

**Spawn pravila po chunk-u:**
- Max 3 prepreke po chunk-u (na difficulty < 0.5), max 6 (difficulty 1.0)
- Min razmak između prepreka: 120px horizontalno
- Ne smeju blokirati ceo prolaz — generator proverava da postoji slobodan vertikalni prolaz od min 80px

---

### 1.4 Pickups

**Energetska ćelija (kristal):**
- Vizuelno: rotirajući hexagon, 14px radius, boja #ffe066
- Daje: **+1 kristal** (meta valuta) + **+50 score**
- Spawn freq: 1–2 po chunk-u, nasumično pozicionirani u hodnik (ne blizu zidova)
- Hitbox: circle, radius 20px (šira od vizuelnog = magnet feel)

**Magnet upgrade efekat:** Ako `META.magnet >= 1`, ćelije u radijusu 120px se privlače ka brodu brzinom 3px/frame.

---

### 1.5 Power-up checkpoint sistem

**Checkpoint pojava:** Svakih **400px** distance (≈ svakih 10–15s na ranim brzinama), markiran zelenom linijom na zidu.

**Pool power-up-a (8 ukupno):**

| ID | Naziv | Efekat | Trajanje |
|----|-------|--------|----------|
| `SHIELD` | Štit | Jedan hit absorb, vizuelna aura | 1 udarac |
| `SLOW_TIME` | Slow-mo | Scroll brzina × 0.6 | 5s |
| `SCORE_2X` | Dvojni score | Score multiplier × 2 | 8s |
| `MAGNET_TEMP` | Temp magnet | Magnet radius 200px | 10s |
| `WIDE_SHIP` | ??? Širi? | NE — NARROW: hitbox radius -4px | 8s |
| `SPEED_BURST` | Turbo | Scroll brzina × 1.4, score × 1.5 | 4s |
| `GHOST_PASS` | Faza | Brod prolazi kroz F_BLOCK tip prepreke | 6s |
| `CRYSTAL_RAIN` | Kiša kristala | 5 kristala spawna odmah | instant |

**Selekcija:** 2 nasumična power-upa od pool-a (bez ponavljanja), prikazana kao 2 dugmeta. Igra **pauzira** tokom biranja (scroll staje, max 3s ili autoselect random).

---

## 2. Scoring i Progression

### 2.1 Score formula

```
baseScore = distance_scrolled_px / 10       // 1 poen na svakih 10px
pickupBonus = crystals_collected * 50
score = (baseScore + pickupBonus) * multiplier
```

**Multiplier rast:**
- Počinje na 1.0
- Raste za +0.1 svakih 30s preživljavanja
- `SCORE_2X` power-up: multiplier × 2 dok traje
- Cap: 5.0×

**Prikazano na HUD:** trenutni score (gornji levi), best score (gornji desno), multiplier (ikonica ×N)

---

### 2.2 Kristali (meta valuta)

- Zarada: 1 kristal po pickup-u + bonus kristali za checkpoint surpassing
- Checkpoint bonus: +2 kristala ako preživiš chunk bez ijednog close calla (brod nije bio unutar 20px od zida)
- Prosečan run (60s, medium skill): **8–14 kristala**
- Kristali se čuvaju u `localStorage` između runova — **ne gube se na smrt**

---

### 2.3 Meta nadogradnje

| Nadogradnja | Nivo 1 | Nivo 2 | Nivo 3 | Cena L1 | Cena L2 | Cena L3 | Max |
|-------------|--------|--------|--------|---------|---------|---------|-----|
| **Max Brzina** (`speed`) | Scroll +10% | Scroll +22% | Scroll +35% | 15 | 35 | 70 | 3 |
| **Shield Pulse** (`shield`) | 1 auto-štit / run | 2 auto-štita | 3 auto-štita | 20 | 50 | — | 2 |
| **Magnet** (`magnet`) | Radius 120px | Radius 200px | Auto-collect sve | 25 | 60 | 120 | 3 |

**Ukupna investicija za max sve:** 395 kristala ≈ **30–50 runova** za dedicated igrača.

Meta upgrade ekran dostupan samo iz MENU stanja (nije mid-run).

---

## 3. Collision

### 3.1 Brod hitbox

- **Circle**, radius = **14px** (vizuelni trougao je ~18px, -4px za fer feel)
- Centar: geometrijski centar trougla (ne vrh)
- Provjera: `distance(ship.center, obstacle.center) < ship.radius + approxRadius`

### 3.2 Prepreka hitbox (AABB)

```js
function circleAABB(cx, cy, r, rx, ry, rw, rh) {
  const nearX = clamp(cx, rx, rx + rw);
  const nearY = clamp(cy, ry, ry + rh);
  const dx = cx - nearX;
  const dy = cy - nearY;
  return (dx*dx + dy*dy) < (r*r);
}
```

- AABB vrednosti: vizuelne dimenzije -4px sa svake strane (padding za fer feel)
- Zid collision: ako `ship.y - 14 < topWallY` ili `ship.y + 14 > bottomWallY` → smrt

---

## 4. Ghost sistem

**ODLUKA: OUT.**

Ghost sistem povećava kompleksnost zapisa, reprodukcije i renderinga bez proporcionalnog gameplay benefita za jednog developera u jednom danu.

**Zamena — "Record Line" sistem:**
- Na HUD-u: tanka horizontalna linija u boji #c244ff prikazuje **Y poziciju broda u trenutku rekordnog rana na toj X distanci**
- Implementacija: `bestPath = Array(MAX_DISTANCE).fill(null)` — čuva samo Y vrednost na svakih 10px distance
- Max memorija: 5000 tačaka × 4 bajta = 20KB po runu — prihvatljivo za localStorage
- Renderuje se kao isprekidana linija u ghost boji, bez uticaja na gameplay

---

## 5. Controls

### 5.1 Desktop

| Akcija | Primarni | Alternativni |
|--------|----------|--------------|
| Thrust gore | `ArrowUp` / `W` | Hold za kontinuiran |
| Levo | `ArrowLeft` / `A` | Hold |
| Desno | `ArrowRight` / `D` | Hold |
| Pauza | `Escape` / `P` | — |
| Checkpoint izbor | `1` / `2` | Klik na dugme |
| Restart (posle smrti) | `Space` / `Enter` | — |

### 5.2 Mobile

| Akcija | Gesta |
|--------|-------|
| Thrust gore | Tap bilo gde (kratki burst) ili Hold za kontinuiran |
| Levo | Swipe left (ili virtuelno dugme levo) |
| Desno | Swipe right (ili virtuelno dugme desno) |
| Checkpoint izbor | Tap na dugme L ili R |
| Restart | Tap na "Ponovi" dugme |

**Virtuelna dugmad na mobile:** Dva dugmeta u donjem uglu (◀ ▶), plus transparentna gornja polovina ekrana = tap za thrust. Nema joystick-a, samo diskretne zone.

---

## 6. Game States

```
STATES: MENU → RUNNING → DEAD → META_UPGRADE → MENU
                  ↓ (checkpoint)
               CHECKPOINT_SELECT → RUNNING
```

| Stanje | Opis | Tranzicija |
|--------|------|-----------|
| `MENU` | Glavni meni, best score, meta upgrade dugme | Start → RUNNING |
| `RUNNING` | Aktivna igra, scroll teče | Collision → DEAD; Checkpoint → CHECKPOINT_SELECT |
| `CHECKPOINT_SELECT` | Pauzirana igra, 2 power-up dugmeta | Izbor → RUNNING |
| `DEAD` | Eksplozija animacija (1.5s), score prikaz | Auto/tap → META_UPGRADE |
| `META_UPGRADE` | Troši kristale, prikazuje nadogradnje | Potvrdi → MENU |

**State data koji preživljava run:** kristali, best_score, bestPath (Record Line), meta upgrade nivoi — sve u `localStorage`.

---

## 7. Pacing tablica

| Interval | Scroll brzina (px/frame) | Hodnik širina (px) | Prepreka gustina | Aktivni tipovi |
|----------|--------------------------|--------------------|-----------------|----------------|
| 0–30s | 3.0 | 300 | 1–2 / chunk | A |
| 30–60s | 4.2 | 265 | 2–3 / chunk | A, B |
| 60–90s | 5.5 | 230 | 3–4 / chunk | A, B, C |
| 90–120s | 6.8 | 200 | 4–5 / chunk | A, B, C, D |
| 120s+ | `3.0 + t*0.03`, cap 12.0 | max(160, 200-t*0.1) | 5–6 / chunk | svi + nasumične kombinacije |

**Brzina raste kontinualno:** `scrollSpeed = BASE + (survivalSeconds * 0.03)`, zaokruženo na 2 decimale.

**Checkpoint freq ne menja se s težinom** — uvek svakih 400px (subjektivno češće jer brže prolazi).

---

## 8. Win/Lose uslovi

**Lose (smrt):**
- Brod (circle r=14) kolizija sa preprekom (circleAABB test)
- Brod kolizija sa gornjim ili donjim zidom hodnika
- Animacija: brod se raspada u 20 sitnih kvadratića koji lete u random smerovima, fade out 1.5s
- Zvuk: distorted sawtooth crash (Web Audio)

**Win:**
- **Nema "pobede"** — igra je čisti endless
- **Milestone poruke** (ne prekidaju igru, samo kratki flash na HUD-u):
  - 1000 poena: "Preživeo si prvu minutu"
  - 5000 poena: "Bespuće te pamti"
  - 10000 poena: "Legenda"
  - Novi rekord u toku runa: flash "NOVI REKORD" + bass pulse zvuk

**Session end condition (praktično):** igrač umre. Svaki run je 60–120s za prosečnog igrača pri tekućoj težini krivoj.
