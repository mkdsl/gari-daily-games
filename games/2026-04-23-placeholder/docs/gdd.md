# GDD — Kolonija 7

## 1. Grid i Ćelije
- 15 kolona x 20 redova, ćelija 24x24px desktop / 18x18px mobile
- Tipovi: ZEMLJA (kopaju se), TUNEL (iskopano), SOBA (posebne), KRISTAL (na redu 18-20)
- Proceduralna distribucija resursa: svaka 4. ćelija sadrži Hranu (red 1-10) ili Minerale (red 8-20)
- Red 0 (vrh) = površina — nikad kopljiva, crveni rub za buru telegraph
- Koordinate: (col 0-14, row 0-19), row 0 = vrh, row 19 = dno

## 2. Radnice (Apstrakcija)
- Radnice = kapacitet (broj, integer)
- Početni broj: 3
- Rate skupljanja (auto, 1s tick): `(broj_radnica × 2)` hrane/min + `(broj_radnica × 1)` minerala/min
  - Tj. po tiku (1s): `+radnice*2/60` hrane, `+radnice*1/60` minerala — skuplja se samo ako grid ima odkrivenih resursa
- Max radnica: 50
- Vizualni prikaz: broj u HUD-u + particle efekti (male tačkice putuju straight-line od random tunela ka centru grida, bez pathfinding-a)
- Radnice ginu jedino od bure

## 3. Resursi
| Resurs | Početni cap | Raste sa | Dubina nalaza |
|--------|-------------|----------|---------------|
| Hrana | 100 | Magasin (+100/nivo) | redovi 1-15 |
| Minerali | 50 | Magasin (+100/nivo) | redovi 5-20 |

- Resursi se skupljaju auto (tick), ili instant klik na ćeliju sa resursima (direktan pickup)
- "Odkriveni resurs" = TUNEL ćelija sa quantity > 0 u njoj
- Kad se ćelija iskopa, njena količina se ODMAH dodaje u zalihe (instant collect pri kopu)

## 4. Kopanje
- Može se kopati samo ćelija susedna iskopanome prostoru (4-directional: gore/dole/levo/desno)
- Početni iskopan prostor: ceo red 0 (površina) + ćelija (7, 1) = ulaz u koloniju
- Kopanje: instant klik na ZEMLJA ćeliju susednu tunelu
- Sadržaj po ćeliji (pri generisanju, random seed):
  - 60% prazno (postaje TUNEL pri kopu)
  - 25% Hrana: `1 + floor(random * 5)` jedinica (1-5), prikazano zelenom bojom
  - 15% Minerali: `1 + floor(random * 3)` jedinica (1-3), prikazano plavom bojom
- **Kristal**: TAČNO JEDAN na gridu, nasumično placiran u opsegu row 16-19, col 2-12
  - Prikazan posebnom ćelijom (žuto/zlatno), vidljiv tek kad se iskopa
  - Susedne ćelije kristala nemaju resurs (buffer zona)

## 5. Sobe (Gradnja — klik na iskopanu TUNEL ćeliju)
- UI: desni klik (desktop) ili hold-tap (mobile) na tunel ćeliju → popup meni sa opcijama gradnje
- Soba zauzima 1 ćeliju, postaje tip SOBA (drugačiji vizual od tunela)

| Soba | Cena nivo 1 | Cena nivo 2 | Cena nivo 3 | Efekat po nivou |
|------|-------------|-------------|-------------|-----------------|
| Leglo | 50 hrane | 130 hrane | 280 hrane | +5 max radnica |
| Magasin | 30 minerala | 80 minerala | 180 minerala | +100 cap hrane i minerala |
| Odbrambeni Zid | 40 minerala | 100 minerala | — (max nivo 2) | HP zida: nivo1=50, nivo2=100 |

- Nadgradnja: klik na postojeću sobu → "Upgrade (cena)" dugme
- Leglo nivo 1 → nivo 2 = plaćaš razliku (80h), ne punu cenu
- Može biti više instanci iste sobe (npr. 2 Legla = 2×5 = +10 max radnica)
- Nema hard limit na broj soba, limit je prostor u gridu

## 6. Peskana Bura
- Ciklus: napad svakih **90 sekundi** (reset posle svakog napada)
- Telegraph sekvenca:
  - T−60s: žuti flash na vrhu ekrana (traje 2s), HUD poruka "Bura se sprema!"
  - T−30s: crvena traka na vrhu (stalna do napada), HUD poruka "Bura dolazi!"
  - T−0: screen shake (CSS transform translateX ±8px, 5 puta, 400ms), vizual bure, damage
- Damage kalkulacija pri udaru:
  - BEZ Odbrambenog Zida: −5 radnica
  - Sa Zidom nivo 1 (HP > 0): −2 radnice, Zid HP −20
  - Sa Zidom nivo 2 (HP > 0): −0 radnica, Zid HP −15
  - Ako Zid HP padne na 0: Zid se degradira za 1 nivo (nivo2→nivo1, nivo1→nestaje)
- Minimum radnica posle bure: 0 (može izazvati game over)
- Bura ne resetuje timer između prestige rundi (nastavlja brojati)

## 7. Prestige
- **Trigger:** igrač iskopa ćeliju sa Kristalom (klik na kristal ćeliju)
- **Prestige overlay** se prikazuje (ne može se otkazati) — prikaži stats (vreme, dubina, radnice)
- **Reset (gubi se):** ceo grid (regeneriše se novi), hrana, minerali, broj radnica (vraća na 3), sve sobe
- **Ostaje trajno (prestige bonus — bira igrač 1 od 3):**

| Prestige runda | Opcija A | Opcija B | Opcija C |
|----------------|----------|----------|----------|
| 1. prestige | Radnice skupljaju ×1.5 brže | Bura nanosi 50% manje štete | Počinješ sa 10 radnica + 100 hrane |
| 2. prestige | Kopanje otkriva +1 ćelije okolo (reveal neighbors) | Sobe koštaju 25% manje | Bura dolazi svakih 120s (ne 90s) |
| 3. prestige | META WIN ekran odmah po kopanju kristala | (iste opcije, svejedno koji odabereš) | |

- Prestige counter (0-3) se čuva u localStorage, ne resetuje se
- **META WIN:** posle 3. prestige runde → "Kolonija Besmrtna" ekran sa ukupnim statistikama

## 8. Pacing Tabela (Target: 5-8 minuta po prestige rundi)

| Minuta | Akcija | Dubina (row) | Radnice | Resursi |
|--------|--------|--------------|---------|---------|
| 0:00 | Start, 3 radnice, ulaz na row 1 | 1 | 3 | 0/100h, 0/50m |
| 1:00 | Kopaj 5-8 ćelija, sakupi hranu | 3-4 | 3 | ~20-30h |
| 2:00 | Gradi Leglo nivo 1 (50h), +5 radnica | 5 | 8 | ~0h, sakupljaj |
| 3:00 | Kopaj dublje, 1. bura (T=90s) | 7-8 | 8 | minerali počinju |
| 4:00 | Gradi Zid (40m) ili Magasin (30m) | 10 | 8-13 | ~30-50m |
| 5:00 | Leglo nivo 2 (130h), dublje kopanje | 12-13 | 13 | cap raste |
| 6:00 | Kristalna zona na vidiku (row 15+) | 15 | 13-18 | dovoljan buffer |
| 7:00 | Iskopaj kristal → PRESTIGE | 16-19 | 13-18 | — |

Napomena za balanser (Jova): ako igrač dođe do kristala pre 5 min, znači da je grid premali — povećaj kristal row minimum na 17. Ako ne stigne za 8 min, smanji cenu Legla nivo 1 na 40h.

## 9. Formule i Konstante

```js
// src/config.js predložene vrednosti
GRID_COLS = 15
GRID_ROWS = 20
CELL_SIZE_DESKTOP = 24   // px
CELL_SIZE_MOBILE = 18    // px (breakpoint: window.innerWidth < 600)

WORKER_FOOD_RATE = 2     // hrana/min po radnici
WORKER_MINERAL_RATE = 1  // minerala/min po radnici
TICK_INTERVAL_MS = 1000  // 1s tick

STORM_INTERVAL_MS = 90000   // 90s između bura
STORM_WARN_EARLY_MS = 60000 // 60s pre = žuti flash
STORM_WARN_LATE_MS = 30000  // 30s pre = crvena traka

CELL_FOOD_CHANCE = 0.25      // 25% šansa za hranu
CELL_MINERAL_CHANCE = 0.15   // 15% šansa za mineral
CRYSTAL_ROW_MIN = 16
CRYSTAL_ROW_MAX = 19
CRYSTAL_COL_MIN = 2
CRYSTAL_COL_MAX = 12

PRESTIGE_COUNT_TO_WIN = 3
```

## 10. Win/Lose Uslovi

- **LOSE:** `radnice <= 0` posle bure → game over overlay
  - Prikazati: dubina dostignutog reda, vreme igre, prestige count
  - Dugme "Pokušaj ponovo" → full reset (ali prestige bonusi ostaju!)
- **WIN/ROUND:** kristal iskopan → prestige overlay → igrač bira bonus → nova runda
- **META WIN:** 3 prestige runde završene → "Kolonija Besmrtna" ekran
  - Prikazati: ukupno vreme sva 3 ciklusa, odabrani bonusi, poruka zahvalnosti

## 11. Prioritet Implementacije (za Jovu — redosled)

1. **Grid rendering + kopanje** — proceduralna generacija, klik-to-dig, resource discovery (instant collect pri kopu)
2. **Radnice kao broj + auto-collect loop** — setInterval 1s tick, rate formula, HUD prikaz
3. **Sobe** — 3 tipa, desni klik/hold na tunel → meni, upgrade sistem
4. **Peskana Bura** — timer, telegraph (žuti/crveni), screen shake, damage
5. **Prestige** — kristal trigger, reset, bonus izbor, localStorage persist
6. **Polish** — particle efekti (tačkice), game over overlay, meta win screen, mobile touch

## 12. Vizualni Jezik (Canvas prikaz)

- Pozadina: tamno smeđa (#2d1b0e) za ZEMLJA ćelije
- Tuneli: tamno siva (#1a1a1a) + tanka granica (#333)
- Hrana: zelena tačka (#5a9e3a) u sredini ćelije, intenzitet varira s količinom
- Minerali: plava tačka (#3a6aae) u sredini ćelije
- Kristal: zlatna ćelija (#ffd700) sa pulsing glow efektom (CSS filter ili Canvas shadow)
- Sobe: ikonice nacrtane Canvasom (Leglo = oval shapes, Magasin = box, Zid = brick pattern)
- Radnice particle: bele tačkice (2px) koje se kreću po straight-line putanjama ka centru
- Površina (row 0): svetlo plava (#87ceeb) traka = nebo
