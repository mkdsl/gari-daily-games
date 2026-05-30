# Akva-Sklop — Game Design Document

**Autor:** Mile Mehanika (game design agent)
**Datum:** 2026-05-30
**Status:** Production spec — za Jovu (implementacija) i Peru Piksel (vizual)
**Verzija:** 1.0

---

## 0. Kontekst i arhitekturalne odluke

Ovaj GDD razrešava sve blokatere iz premortema (Nega, 2026-05-30) pre nego što Jova napiše prvi red koda. Svaka arhitekturalna odluka je finalna.

### 0.1 Finalne arhitekturalne odluke

| Pitanje | Odluka | Razlog |
|---------|--------|--------|
| Renderer | **Canvas 2D** | Ne isometric CSS, ne WebGL. Canvas daje kontrolu nad česticama, nema rendering pipeline iznenađenja na mobilnom. |
| Grid projekcija | **Top-down 2D** | Ne 2.5D izometrija. Top-down eliminiše mobilni touch problem (24px izometrijski tile → 15px efektivna surface). |
| Tile veličina | **48px** | Ispunjava Apple HIG minimum 44px za touch surface. |
| Session max | **~10 minuta** | 12 nedelja × max 45s Planning Phase + 4s sim po nedelji = 9 minuta hard max. |
| Simulation redosled | Fiksiran (vidi sekciju 4) | Ne slobodna interpretacija. |
| Planning Phase | Bounded 45s + 3 AP | Rešava "undefined session length" premortem problem. |
| Event sistem | Pseudo-random schedule | Ne pure random. Rešava "mathematically unfair" premortem problem. |
| Debug panel | Ugrađen od dana 1 | Keyboard toggle `D` — prikazuje state machine posle svakog sim koraka. |

---

## 1. Premisa i žanr

**Žanr:** Puzzle / resource management / daily game
**Platform:** Web (mobile-first, desktop compatible)
**Sesija:** 8–10 minuta po runu, 12 nedelja simuliranog vremena

**Premisa:** Ti si Brana, menadžer voda na Guncati permakulturnom imanju u Srbiji. Imaš jedan izvor (0.4 l/s), tri jezera na gravitacionoj padini i 12 nedelja da uspostaviš ekosistem koji se sam-reguliše pre dolaska investitora. Svaki tile koji postaviš troši deo tog protoka. Svaka greška u nedelji 3 može ubiti ribe u nedelji 9.

**Core tenzija:** Konačan protok (0.4 l/s) mora da napoji biofiltraciju, životinje i akumulaciju vode — istovremeno. Nema "ispravnog" rešenja; postoji balans koji igrač pronalazi kroz posledice.

---

## 2. Grid i terrain sistem

### 2.1 Dimenzije grida

- **20 kolona × 15 redova** = 300 tile-ova
- Tile veličina: **48×48px** na Canvas-u
- Ukupna canvas dimenzija: **960×720px** (desktop), skalira se na `min(viewport_width, 960)` za mobilni
- Koordinatni sistem: `(col, row)` gde je `(0,0)` gore-levo

### 2.2 Visinska mapa (fiksan terrain)

Tri jezera su pozicionirana na fiksnim visinama koje određuju tok gravitacije. Visina je apstraktna (0–3), ne piksel offset — koristiti je isključivo za flow routing logiku.

```
Visina 3 (gornje) — Jezero A:  pozicija ~(14, 2), zona 4×3 tile-ova
Visina 2 (srednje) — Jezero B: pozicija ~(10, 7), zona 4×3 tile-ova
Visina 1 (donje)  — Jezero C:  pozicija ~(4,  11), zona 4×3 tile-ova

Izvor (Source):               pozicija (17, 0), fiksan, ne može se ukloniti
```

**Gravity rule (apsolutna):** Voda teče SAMO sa više visine na nižu. Tok uzbrdo je nemoguć bez Pump tile-a. Pump tile nije dostupan u Fazi 0 i Fazi A — samo Faza B.

### 2.3 Tile tipovi — kompletna tabela

| Tile ID | Naziv | AP cena | Protočni trošak | Efekat na ekosistem | Icon (CSS emoji fallback) |
|---------|-------|---------|----------------|---------------------|--------------------------|
| `drainage` | Drenaža | 1 | +0.08 l/s kapaciteta prema nižem jezeru | Usmerava tok između jezera; bez drenažne veze jezero ne prima vodu | 〜 |
| `biofilter` | Biofilter | 2 | 0 (ne troši protok) | pH += 0.1 × (broj biofiltara u jezeru) po simulacionom koraku; cap na 8.5 | 🌿 |
| `wetland` | Močvara | 1 | 0 | +4 ducks kapacitet jezera; duck health bonus +10% ako postoji | 🌾 |
| `lake_1` | Jezero Nivo 1 | 2 | 0 | Kapacitet 50L; domaćin životinja | 💧 |
| `lake_2` | Jezero Nivo 2 | 3 | 0 | Kapacitet 100L; domaćin životinja; zahteva lake_1 na toj poziciji | 💧💧 |
| `dam` | Brana | 2 | 0 | Blokira gravitacioni tok na tom tile-u; akumulira +20L u gornje jezero | ▪️ |
| `remove` | Ukloni | 1 | 0 | Uklanja tile s pozicije; vraća AP-trošak tile-a? Ne — AP je potrošen. | ✖️ |

**Napomena za Jovu:** `lake_2` je upgrade `lake_1`, ne zaseban tile. Ako igrač postavi `lake_2` na poziciju koja nema `lake_1` — akcija je blokirana s porukom "Potrebno je prvo Jezero Nivo 1."

**Drain routing logika:** Drainage tile mora biti postavljen između dva jezera na adjacent tile-ovima koji formiraju putanju. Sistem automatski detektuje da li je drainage tile deo kontinuiranog lanca koji spaja jezero više visine s jezerom niže visine. Prekinut lanac = 0 protoka.

---

## 3. Planning Phase

### 3.1 Struktura po fazama igre

| Nedelja | Faza | AP po nedelji (Standard/Faza B) | Timer | Random eventi |
|---------|------|--------------------------------|-------|---------------|
| 1–3 | Tutorial | 5 AP / 4 AP | 45s | 0 (blackout) |
| 4–8 | Main game | 3 AP / 2 AP | 45s | Max 1/nedelja |
| 9–12 | Crisis | 2 AP / 1 AP | 45s | Garantovano 1/nedelja |

**Timer:** Svaka Planning Phase traje maksimalno 45 sekundi. Countdown vidljiv u HUD-u. Po isteku — simulacija se automatski pokreće s trenutnim stanjem (i nepotrošeni AP se gube, ne prenose).

**Tutorial (nedelja 1–3):** Igra prikazuje inline tooltipe za svaki tile tip. Izvor i jedno jezero (Jezero B) su pre-placed. Igrač uči da postavi drenaže između jezera.

### 3.2 AP trošenje i validacija

- AP se troshi u realnom vremenu tokom Planning Phase
- Ako igrač nema dovoljno AP — akcija je blokirana (tile iz palete je greyed out)
- Live preview: kad igrač drži tile iz palete iznad grida, crvena highlight zona prikazuje nedozvoljena polja (već zauzeti tile-ovi, jezero pogrešne visine za drainage)
- **Flow budget preview:** U HUD-u se prikazuje projekcija "Protok posle: X.XX / 0.40 l/s" dok igrač drži tile u ruci. Ako bi akcija prekoračila kapacitet — tile se prikazuje s crvenom ikonom ali nije hard-blokiran (igrač može da postavi — to će se odraziti u simulaciji kao flow deficit, ne kao hardcoded blokada pre simulacije)

---

## 4. Hydraulična simulacija — pseudokod za Jovu

Ovo je fiksiran redosled operacija. Svaki korak se izvršava u ovom redosledu, bez izuzetaka.

```javascript
function simulateWeek(state) {
  const { grid, lakes, source, week } = state;

  // ============================================================
  // STEP 1: FLOW CALCULATION
  // ============================================================
  // Izvor daje max 0.4 l/s ukupno (Faza 0: 0.5 l/s)
  // Drought event može smanjiti na 0.2 l/s privremeno
  const sourceRate = source.baseRate * source.droughtMultiplier; // l/s

  // Drenaža routing: od višeg jezera ka nižem
  // Jezera se procesiraju u opadajućem redosledu visine (A→B→C)
  const lakesOrderedByHeight = [...lakes].sort((a, b) => b.height - a.height);

  for (const lake of lakesOrderedByHeight) {
    // Prikupi sve drainage tile-ove koji vode KA ovom jezeru
    const inboundDrains = grid.getDrainageToLake(lake.id);
    
    // Izračunaj inflow iz višeg jezera (ili izvora ako je Jezero A)
    if (lake.id === 'A') {
      lake.inflow = Math.min(sourceRate, 0.4); // direktno iz izvora
    } else {
      const higherLake = lakesOrderedByHeight.find(l => l.height > lake.height);
      // Protok = min(raspoloživi outflow višeg jezera, kapacitet drenažnih tile-ova)
      lake.inflow = Math.min(
        higherLake.availableOutflow,
        inboundDrains.length * 0.08 // svaka drenaža = 0.08 l/s
      );
      higherLake.availableOutflow -= lake.inflow;
    }

    // Dam blokira outflow: ako je dam tile između dva jezera → outflow = 0 ali +20L u lake.level
    if (grid.hasDamBetween(lake.id, nextLower(lake))) {
      lake.storageBonusThisWeek = 20;
      lake.availableOutflow = 0;
    } else {
      lake.availableOutflow = lake.inflow * 0.9; // 10% gubitak na putu
    }

    // Aktualizuj nivo jezera
    lake.level = clamp(
      lake.level + (lake.inflow * 168) - (lake.naturalEvaporation * 168) + lake.storageBonusThisWeek,
      0,
      lake.capacity // lake_1 = 50L, lake_2 = 100L
    );
    // * 168 jer je nedelja = 168 sati, ali koristimo pojednostavljeni model
    // Stvarno: lake.level += (lake.inflow - lake.evaporation) per sim step
    lake.storageBonusThisWeek = 0; // reset
  }

  // ============================================================
  // STEP 2: BIOFILTER EFFECT
  // ============================================================
  for (const lake of lakes) {
    const biofilterCount = grid.countAdjacentBiofilters(lake.id);
    
    // pH raste zbog biofiltera
    lake.pH = clamp(lake.pH + 0.1 * biofilterCount, 5.0, 8.5);
    
    // pH pada zbog pataka (organski otpad acidifikuje)
    const duckWasteEffect = lake.ducks * 0.01; // 0.01 per patka po nedelji
    lake.pH = clamp(lake.pH - duckWasteEffect, 5.0, 9.0);
    
    // pH prirodno pada bez biofiltera (kiša je pH ~5.6)
    if (biofilterCount === 0) {
      lake.pH = clamp(lake.pH - 0.05, 5.0, 9.0);
    }
  }

  // ============================================================
  // STEP 3: SPECIES HEALTH
  // ============================================================
  for (const lake of lakes) {
    // RIBE: zdravlje OK ako je pH u opsegu [6.5, 8.5]
    if (lake.pH >= 6.5 && lake.pH <= 8.5) {
      lake.fishHealth = Math.min(100, lake.fishHealth + 10); // oporavak
    } else {
      lake.fishHealth = Math.max(0, lake.fishHealth - 30); // brzo pada
    }
    
    // PATKE: zdravlje OK ako ima dovoljno vode (level > 20L) i prostora
    const duckCapacity = 4 + grid.countAdjacentWetlands(lake.id) * 4;
    if (lake.level > 20 && lake.ducks <= duckCapacity) {
      lake.duckHealth = Math.min(100, lake.duckHealth + 5);
    } else {
      lake.duckHealth = Math.max(0, lake.duckHealth - 20);
    }
    
    // GAME OVER provjera: ribe uginu (fishHealth = 0) dva uzastopna koraka
    if (lake.fishHealth === 0) {
      lake.consecutiveDeadFishWeeks++;
      if (lake.consecutiveDeadFishWeeks >= 2) {
        return { gameOver: true, reason: 'fish_died', lake: lake.id };
      }
    } else {
      lake.consecutiveDeadFishWeeks = 0;
    }
  }

  // ============================================================
  // STEP 4: ECOSYSTEM SCORE (0–100 za ovu nedelju)
  // ============================================================
  // waterScore: prosek (lake.level / lake.capacity) × 100 po svim jezerima
  const waterScore = average(lakes.map(l => (l.level / l.capacity) * 100));
  
  // pHScore: koliko je prosečni pH blizu idealnog (7.2)
  const pHScore = average(lakes.map(l => {
    if (l.pH >= 6.5 && l.pH <= 8.5) return 100;
    if (l.pH >= 6.0 && l.pH < 6.5) return 60;
    if (l.pH > 8.5 && l.pH <= 9.0) return 60;
    return 0;
  }));
  
  // speciesScore: prosek fish i duck health-a po svim jezerima
  const speciesScore = average(lakes.map(l =>
    (l.fishHealth + l.duckHealth) / 2
  ));

  const weekScore = Math.round((waterScore + pHScore + speciesScore) / 3);
  state.weeklyLog.push({ week, weekScore, events: state.pendingEvents });

  // ============================================================
  // STEP 5: EVENT CHECK
  // ============================================================
  // Pseudo-random: eventi su pre-scheduled u state.eventSchedule
  // (generiše se na početku runa, ne per-week)
  const scheduledEvent = state.eventSchedule[week];
  if (scheduledEvent) {
    applyEvent(scheduledEvent, state);
    state.pendingEvents = [scheduledEvent];
  } else {
    state.pendingEvents = [];
  }

  return { gameOver: false, weekScore, state };
}
```

### 4.1 Debug panel (obavezan — `D` key toggle)

```javascript
// Prikazuje se u overlay-u iznad canvas-a
// Format po jezeru:
// [Jezero A] level: 42.3L / 50L | pH: 7.4 | fish: 80% | duck: 60% | inflow: 0.08 l/s
// [Jezero B] level: 18.1L / 100L | pH: 6.9 | fish: 40% | duck: 90% | inflow: 0.08 l/s
// [Jezero C] level: 0L / 50L | pH: 6.2 | fish: 0% | duck: 0% | inflow: 0 l/s
// [Event this week]: SUŠA (-50% source rate, trajanje: 2 nedelje)
// [Week Score]: 54
```

---

## 5. Pseudo-random event sistem

### 5.1 Event scheduling (generiše se na početku svakog runa)

Event schedule se kreira jednom, na početku runa, koristeći seeded pseudo-random (seed = `Date.now()` na startu). Ne postoji per-week dice roll tokom igre — sve je predodređeno ali nije otkriveno igraču.

```javascript
function generateEventSchedule(difficulty, seed) {
  const rng = seededRandom(seed);
  const schedule = {}; // { week: eventType }

  if (difficulty === 'A') {
    // Max 2 eventi u runu
    // Suša: mora biti između nedelje 4–8
    const droughtWeek = Math.floor(rng() * 5) + 4; // 4–8
    schedule[droughtWeek] = 'DROUGHT';
    
    // Drugi event (opcioni): Duck migration nedelja 5–9
    if (rng() > 0.4) { // 60% šansa da se drugi event uopšte desi
      let secondEventWeek;
      do {
        secondEventWeek = Math.floor(rng() * 5) + 5; // 5–9
      } while (secondEventWeek === droughtWeek);
      schedule[secondEventWeek] = pickSecondEvent(rng);
    }
  }

  if (difficulty === 'B') {
    // Max 4 eventi, garantovano 1/nedelja u nedelji 9–12
    // + max 2 u nedelji 4–8
    // ... (Faza B proširenje)
  }

  return schedule;
}
```

### 5.2 Event pool — kompletna tabela

| Event ID | Naziv | Dostupan u | Efekat | Trajanje |
|----------|-------|------------|--------|----------|
| `DROUGHT` | Suša | Week 4–8 (Faza A, B) | `source.droughtMultiplier = 0.5` → 0.2 l/s | 2 nedelje |
| `DROUGHT_BREAK` | Kraj suše | Automatski posle DROUGHT | `source.droughtMultiplier = 1.0` | 1 nedelja |
| `DUCK_MIGRATION` | Patka jato | Week 4–8 | +6 ducks u random jezero (ponderisano prema kapacitetu) | Trajno |
| `FOREST_RUNOFF` | Šumska kontaminacija | Week 7+ | pH -= 0.8 u Jezero C | 1 nedelja |
| `HEAVY_RAIN` | Jak kiša | Faza B only, Week 6+ | Sva jezera +30L instant (može overflow, overflow = gubitak) | 1 nedelja |

**Anti-frustration rule:** Max 1 event per nedelja. DROUGHT_BREAK se ne računa u max limit — on je uvek automatski, 2 nedelje posle DROUGHT.

### 5.3 Event overflow handling (Jak kiša)

```javascript
// Ako lake.level + 30 > lake.capacity:
lake.overflow = (lake.level + 30) - lake.capacity;
lake.level = lake.capacity;
// Overflow se prikazuje vizuelno (animacija) ali nema gameplay posledica osim gubitka vode
```

---

## 6. Progression i ekonomija

### 6.1 Difficulty tabela — svi parametri

| Parametar | Faza 0 (Tutorial) | Faza A (Standard) | Faza B (Komercijalno) |
|-----------|-------------------|-------------------|----------------------|
| Source rate (base) | 0.5 l/s | 0.4 l/s | 0.4 l/s |
| Starting ducks | 2 (samo Jezero B) | 4 (B i C) | 8 (sva tri jezera) |
| Starting fish | 0 | 2 (Jezero A) | 6 (A i B) |
| AP Week 1–3 | 5 | 5 | 4 |
| AP Week 4–8 | 3 | 3 | 2 |
| AP Week 9–12 | 2 | 2 | 1 |
| Random eventi | 0 | max 2 | max 4 |
| Win threshold (Eco Score) | 60% | 80% | 85% |
| Difficulty multiplier | 0.7× | 1.0× | 1.4× |
| pH opseg za ribe | [6.5, 8.5] | [6.5, 8.5] | [6.5, 8.5] |
| Timer per Planning Phase | 45s | 45s | 45s |
| Pre-placed tiles | Izvor + Jezero B | Samo izvor | Samo izvor |

### 6.2 Scoring formula

```
Week score:    0–100, formula iz Step 4 simulacije
Run score:     average(weeklyScores[1..12]) × difficulty_multiplier
Final display: "Guncati Eco Report: XX/100 — [rank label]"

Rank labels:
  0–49:  "Izvor presušuje"
  50–69: "Ekosistem niče"
  70–84: "Balans uspostavljen"
  85–99: "Guncati Faza 0: Uspeh"
  100:   "Perfektna sezona" (achievement)
```

### 6.3 Win / lose uslovi

**Game Over (trenutni kraj):**
- Ribe uginu u 2 uzastopna simulaciona koraka (fishHealth = 0 dva puta zaredom) u bilo kom jezeru

**Soft fail (nastavi, penalizovano):**
- Nedelja bez pataka → weekScore cap 70 (ne može dostići 100 tu nedelju)
- Biofilter zatvoren (nema drainage ka njemu) → pH nastavlja da pada; UI warning

**Win:**
- Final Eco Score ≥ win threshold po difficulty-u, na kraju nedelje 12

---

## 7. "Guncati Knows" kartice

### 7.1 Unlock mehanizam

- 5 kartica ukupno
- Unlock: po završetku svakog runa (bez obzira na score ili win/lose)
- Run 1 → Kartica 1, Run 2 → Kartica 2, ... Run 5 → Kartica 5
- Svih 5 runs = sve kartice, permanentno u localStorage
- Kartice se mogu "prikačiti" na HUD kao podsetnik tokom sledećeg runa (toggle button u kartici)
- `[pending Brana verification]` = sadržaj čeka Branin review pre release-a; placeholder tekst je u igri dok review ne završi

### 7.2 Sadržaj kartica (placeholder — svi pending Brana verifikaciju)

```
KARTICA 1 — "Izvor"
"Guncati izvor daje maksimalno 0.4 l/s — jednako 24 litara po satu, ili oko 576 litara dnevno.
 Prosečna porodica od 4 osobe troši 400–600L/dan. Guncati izvor pokriva tačno tu potrebu."
[pending Brana verification — tražiti: stvarni flow-rate merenja po mesecima]

KARTICA 2 — "Biofilter"
"Biofilm filter u jezeru može da poveća pH vode za 0.1 do 0.3 po sezoni.
 Bez njega, kišnica (pH ~5.6) prirodno acidifikuje stajačicu tokom leta."
[pending Brana verification — tražiti: koji tip biofiltarskog materijala Guncati koristi]

KARTICA 3 — "Patke"
"Patke filtriraju sitne alge i insekte iz vode, ali izlučuju azotne spojeve koji
 blago acidifikuju jezero. Više od 6 pataka po 50L bez biofiltera — pH pada brže nego raste."
[pending Brana verification — tražiti: stvaran broj pataka na Guncati i jezero koje koriste]

KARTICA 4 — "Gravitacija"
"Gravitacioni tok ne troši energiju. Guncati nema pumpe u Fazi 0 —
 samo visinska razlika između izvora i jezera obezbeđuje pasivni protok.
 Pad od 1m na 10m horizontalne dužine daje dovoljan pritisak."
[pending Brana verification — tražiti: stvarne kotne razlike između izvora i jezera]

KARTICA 5 — "Plan"
"Guncati planira tri jezera do 2027: jedno primarno za akumulaciju i navodnjavanje,
 jedno za ribolov i biofiltaciju, jedno kao plivački/rekreativni bazen.
 Sve tri funkcioniše gravitaciono — bez pumpi, bez električne energije."
[pending Brana verification — tražiti: aktuelni plan imanja, ne concept iz 2024]
```

---

## 8. UI layout

### 8.1 Desktop layout (960px+)

```
┌─────────────────────────────────────────────────────────────────────┐
│  TOP HUD                                                             │
│  ▸ Protok: 0.35 / 0.40 l/s  │  pH avg: 7.2  │  Eco: 72%  │  7/12  │
│  Planning Phase: [████████░░] 32s              AP: ●●○              │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│                    960 × 560px CANVAS                                │
│                                                                      │
│   [IZVOR]──→ [Drenaža]──→ [Jezero A] ─────→ [Jezero B] ──→ [C]    │
│               (lanac tile-ova, top-down 2D, 48px grid)               │
│                                                                      │
├─────────────────────────────────────────────────────────────────────┤
│  PALETTE:  [〜 Drain 1AP] [🌿 Bio 2AP] [🌾 Wetland 1AP]            │
│            [💧 Lake1 2AP] [💧💧 Lake2 3AP] [▪️ Dam 2AP] [✖️ 1AP]  │
│                                              AP ostalo: 3           │
├─────────────────────────────────────────────────────────────────────┤
│  [← Prošla nedelja: 68%]        [SIMULIRAJ NEDELJU 7 →]            │
└─────────────────────────────────────────────────────────────────────┘
```

### 8.2 Mobile layout (< 768px)

- Canvas: full-width, 48px tile-ovi, scroll vertikalno ako grid prelazi viewport
- HUD: 2-row compact (Row 1: Protok + pH; Row 2: Eco% + Week + Timer)
- Palette: horizontalni scroll, single row
- Simulate button: full-width, sticky bottom
- Debug panel: skrolen ispod canvas-a (ne overlay na mobilnom)

### 8.3 HUD specifikacija po elementu

| Element | Vrednost | Format | Boja |
|---------|----------|--------|------|
| Protok | `flow / maxFlow l/s` | `▸ 0.35 / 0.40 l/s` | Zelena ako < 90% kapaciteta, žuta 90–100%, crvena overflow |
| pH avg | Prosek pH svih jezera | `pH 7.2` | Zelena [6.5–8.5], žuta [6.0–6.5] i [8.5–9.0], crvena ostalo |
| Eco Score | Week score | `◉ 72%` | Gradijent: crvena 0–49, žuta 50–69, zelena 70+ |
| Nedelja | Trenutna / ukupna | `7 / 12` | Bijela, monospace font |
| Timer | Sekundi ostalo | `32s` | Bijela → žuta posle 15s → crvena posle 5s |
| AP | Ostalo akciona poena | `●●○` (filled/empty dots) | Zelena filled, siva empty |

---

## 9. Audio

### 9.1 Zvučni dizajn (Web Audio API)

| Zvuk | Trigger | Implementacija |
|------|---------|----------------|
| Ambient voda | Ceo gameplay, stalan | Web Audio oscillator, low freq, volume scale sa avg lake.level |
| Tile placed | Svaki put kad se tile postavi | Kratki ding, `AudioContext.createOscillator()`, 200ms |
| Simulation start | Klik "Simuliraj" | Bubbling water — noise buffer, 4s trajanje |
| Duck quack | Nedelja završena s weekScore > 70 | Kratki sample-like oscillator sweep |
| pH alarm | pH bilo kog jezera izvan [6.0, 9.0] | Diskretni 2-tone hum, ponavlja se svake 3s dok traje |
| Event trigger | Random event se okine | Zvučni cue pre simulacije (2 tone — drugačiji od tile placed) |
| Game Over | Fish died 2× | Prigušen descending tone |
| Win | Final score ≥ threshold | Ascending chord sequence |

Sve zvuče generisati programski (Web Audio API), bez file download-a. Audio je opcionalan za MVP ali `audio.js` modul mora biti scaffold-ovan s `AudioContext` i mute toggle.

---

## 10. Moduli za Jovu — scaffold lista

Minimum 16 modula. Svaki modul ima jednu jasno definisanu odgovornost.

| Modul | Putanja | Odgovornost |
|-------|---------|-------------|
| Main | `src/main.js` | Entry point; inicijalizacija, game loop, event dispatch |
| Config | `src/config.js` | Sve magične brojeve (tile costs, pH range, capacity, timer) — bez hardcodiranih konstanti u logici |
| State | `src/state.js` | Centralni state objekat; `createInitialState(difficulty)`, state mutations |
| Grid | `src/grid.js` | 20×15 tile grid; `placeTile`, `removeTile`, `getTileAt`, `getDrainageToLake`, `countAdjacentBiofilters` |
| Hydraulics | `src/hydraulics.js` | `simulateWeek(state)` — kompletan pseudokod iz sekcije 4 |
| Species | `src/species.js` | Fish i duck health updates; `applySpeciesHealth(lake)`; game over detekcija |
| Events | `src/events.js` | `generateEventSchedule(difficulty, seed)`, `applyEvent(eventId, state)`, event definitions |
| Scoring | `src/scoring.js` | `calculateWeekScore(lakes)`, `calculateFinalScore(weeklyLog, difficulty)`, rank labels |
| Progression | `src/progression.js` | Week advancement, AP tracking, phase detection (tutorial/main/crisis) |
| Input | `src/input.js` | Click i touch handler za canvas; drag-from-palette; tile selection state |
| Render | `src/render.js` | Canvas 2D drawing: grid, tiles, jezera (water level as fill%), životinje, flow animacija |
| UI | `src/ui.js` | HUD updates, palette bar render, simulate button, timer countdown, AP dots |
| Audio | `src/audio.js` | Web Audio API; mute toggle; sve zvuče iz sekcije 9 |
| Cards | `src/cards.js` | "Guncati Knows" unlock logika, localStorage persistence, card display, HUD pin |
| Share | `src/share.js` | "Guncati Eco Report" canvas screenshot; `canvas.toDataURL()` → download ili share API |
| Debug | `src/debug.js` | `D` key toggle; state dump overlay po jezeru po nedelji |
| Base CSS | `styles/base.css` | Reset, root variables, boje, fontovi |
| UI CSS | `styles/ui.css` | HUD, palette bar, buttons, cards modal |
| Game CSS | `styles/game.css` | Canvas wrapper, mobile responsive, overlay |
| Theme CSS | `styles/theme.css` | Boje teme (voda teal, zemlja brown, patke narandžaste) |

### 10.1 Paleta boja (za Peru Piksel i Jovu)

```css
:root {
  --color-soil:       #8B5E3C;
  --color-forest:     #1a3a1a;
  --color-water:      #4ecdc4;
  --color-water-dark: #2a8a84;
  --color-duck:       #ff6b35;
  --color-fish:       #a8d8ea;
  --color-hud-bg:     rgba(255,255,255,0.92);
  --color-ok:         #4CAF50;
  --color-warn:       #FF9800;
  --color-error:      #F44336;
  --font-mono:        'Courier New', Courier, monospace;
}
```

---

## 11. Flow animacija (Canvas 2D)

Animirani tok vode tokom Simulation Phase (4 sekunde):

```javascript
// Particle system — ne sprite-ovi
// Svaki drainage tile generiše 3–5 čestica per frame
// Čestica: { x, y, vx, vy, opacity, size }
// Kretanje: od tile-a višeg jezera → prema nižem jezeru duž drainage lanca
// Vizual: mali krug (radius 2–4px), boja var(--color-water), opacity 0.4–1.0

function renderParticles(ctx, particles) {
  for (const p of particles) {
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(78, 205, 196, ${p.opacity})`;
    ctx.fill();
  }
}

// Jezero water level: renderovati kao filled rectangle unutar jezero tile-a
// fillHeight = (lake.level / lake.capacity) × tileHeight
// Animirati fill height tokom simulacije (interpolacija tokom 4s)
```

---

## 12. Lokalizacija i brand

- UI i naratv: srpski (ćirilica nije potrebna — latinica)
- "Guncati Knows" kartice: srpski, Brana verifikuje
- Engleski toggle: nije bloker za MVP; dodati `lang` state u config za buduću implementaciju
- CTA na kraju svakog runa: "Brana gradi ovo u stvarnosti → guncati.rs" (link parametrizovan u config.js)

---

## 13. Otvorene stavke (ne blokiraju GDD ali blokiraju release)

| Stavka | Vlasnik | Rok |
|--------|---------|-----|
| Verifikacija 5 "Guncati Knows" kartica | Brana | Pre release |
| Playtesting balans (5 tile layout-a) | Mile + Nega | Post-implementacija |
| "Faza C vizualizacija" (prava Guncati mapa) | Sine/Iskra | Post-MVP, ne za v1.0 |
| Engleski jezik toggle | Jova | Post-MVP |
| GPS koordinate / real terrain za Faza C | Brana | Post-MVP |

---

## 14. Definition of Done (za Jovu)

- [ ] Svih 16+ modula scaffold-ovano s jasnim interface-ima
- [ ] `simulateWeek` radi tačno po pseudokodu u sekciji 4, uključujući redosled
- [ ] Debug panel (`D` key) prikazuje state svakog jezera posle svake simulacije
- [ ] Planning Phase timer (45s) automatski pokreće simulaciju po isteku
- [ ] 3 difficulty nivoa implementirana s tačnim parametrima iz sekcije 6
- [ ] Event schedule se generiše na početku runa (seeded), ne per-week random
- [ ] "Guncati Knows" kartice persist u localStorage, unlock posle svakog runa
- [ ] Canvas 2D, top-down 2D, 48px tile-ovi — nema isometric CSS
- [ ] Mobilni layout funkcionalan na 375px viewport širini
- [ ] Audio scaffold (mute toggle funkcionira, zvuče su opcionalni za MVP)
- [ ] Share funkcija: canvas screenshot kao PNG download

---

*Mile Mehanika — Gari Daily Games*
*GDD v1.0, 2026-05-30*
