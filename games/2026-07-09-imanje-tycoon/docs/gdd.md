# GDD — Imanje Tycoon
**Game Designer:** Mile Mehanika | **Datum:** 2026-07-09 | **Faza:** Concept → GDD

---

## 1. SCOPE DECISION

**Izabrana opcija: A — Flat 2D Dashboard**

Izometrija odbačena. Razlozi:
1. Impl sesija je jedna (09:00 trigger, ~4-5h token budget) — izometrija zahteva sprite atlas, depth sorting i click-mapping koji sam po sebi troši 30-40% budžeta
2. Flat 2D dashboard omogućava direktan CSS layout bez Canvas overhead-a za UI sloj
3. Svi ekonomski podaci su tabelarni po prirodi — dashboard je prirodna forma za tycoon sim
4. Faza C u 6-7h se teže postiže sa vizuelnim komplikatorima koji nemaju gameplay vrednost

Dashboard ima 3 taba (Jezero | Plastenik | Pečurke) + globalni Macro panel na vrhu. Sve numeričke vrednosti vidljive u realnom vremenu.

---

## 2. FAZA PROGRESSION TABELA

| Faza | Unlock condition | Ukupno gameplay sati | Dostupne grane | Mesečni prihod range |
|------|-----------------|---------------------|----------------|---------------------|
| **0 — Start** | Automatski | 0:00 | Pečurke (1×5kg blok) | 4.000–8.000 din |
| **A — Rast** | Prihod ≥ 25.000 din ukupno | ~1:30 | Pečurke (proširena) + Plastenik (starter) | 20.000–45.000 din |
| **B — Ekspanzija** | Prihod ≥ 100.000 din ukupno + Plastenik Upgrade 3 | ~3:00 | Sve 3 grane (Jezero unlock) | 60.000–120.000 din |
| **C — Prestiž prag** | Sve 3 grane aktivne + Mesečni prihod ≥ 150.000 din × 3 uzastopne sezone | ~6:30 | Sve 3 grane + sinergije + Alumni mreža | 150.000–350.000 din |

**Prestige timing target:**
- Prestige 1 unlock: ~6:30 gameplay (Faza C)
- Prestige 1 → 2: +4h (ukupno ~10:30)
- Prestige 2 → 3: +3h (ukupno ~13:30)

---

## 3. EKONOMIKA PO GRANI — FORMULE I TABELE

### Globalne formule

```
yield(t) = base_yield × 1.15^upgrades × capacity_multiplier
revenue = yield × price × channel_multiplier × reputation_bonus
reputation_bonus = 1.0 + (masterclass_count × 0.05)
channel_multiplier = {direktna: 1.0, pijaca: 1.2, restoran: 1.55, online: 1.9}
```

---

### 3a. PEČURKE

**Starter stanje:**
- Kapacitet: 1×5kg blok bukovača
- Ciklus: 21 dan realnog vremena → u igri 42 sekunde/talas (1 dan = 2 sekunde)
- Prinos po talasu: 5kg × 1.0 prinos = 5kg
- 3 talasa po bloku pre reseeding (ukupno 15kg/blok životni vek)
- Cena bukovača: 400 din/kg (direktna prodaja)
- Starter mesečni prihod: 5kg × 400 × 3 talasa ÷ 3 meseca ≈ **2.000 din/mesec**

**Break-even vreme:** Blok košta 800 din startup, prihod 2.000 din/mesec → **24 sekunde gameplay**

**Prinos formula:**
```
mushroom_yield_per_block = 5 × spawn_ratio × 1.15^upgrades
spawn_ratio = 1.0 (bukovača), 1.0 (oyster)
price = 400 (bukovača), 700 (oyster)
cycle_seconds = 42 / (1 + speed_upgrades × 0.1)
```

**Upgrade tabela — Pečurke (8 stavki):**

| # | Upgrade | Cena (din) | Efekat | Faza unlock |
|---|---------|-----------|--------|-------------|
| P1 | Drugi blok | 1.600 | +1 blok bukovača (kapacitet ×2) | 0 |
| P2 | Kontrola vlažnosti | 2.400 | Spawn ratio +20% (5kg → 6kg/blok) | 0 |
| P3 | Oyster upgrade | 3.500 | Otključava oyster blokove (700 din/kg) | A |
| P4 | Blok ×3 | 5.000 | Ukupan kapacitet 3 bloka | A |
| P5 | Ubrzani talas | 8.000 | Ciklus −15% (42s → 35.7s) | A |
| P6 | Komposter input | 12.000 | +25% spawn_ratio (sinergija sa Komposterom) | B |
| P7 | Blok ×5 | 20.000 | Ukupan kapacitet 5 blokova | B |
| P8 | Masterclass inokulacija | 45.000 | Spawn ratio ×1.4, otključava "Retke vrste" achievement | C |

---

### 3b. PLASTENIK

**Starter stanje:**
- Kapacitet: 20m² (starter plastenik)
- Paradajz ciklus: 4.5 meseca = 540 dana → 180 sekundi gameplay (1 dan = 1/3 sekunde)
- Yield: 27 kg/m²/sezon × 20m² = 540 kg/sezon
- Cena paradajza: 215 din/kg (direktna)
- Mesečni prihod (amortizovano): 540 × 215 ÷ 4.5 = **25.800 din/mesec**

**Mikrobiljke alternativa:**
- Ciklus: 21 dan = 14 sekundi gameplay
- Yield: brut 200g/m²/ciklus (4 ciklusa/mesec)
- Cena: 1.000 din/kg
- 20m² × 0.2 kg × 4 ciklusa × 1.000 din = **16.000 din/mesec**
- Unlock: Faza A Upgrade P3

**Break-even plastenik (starter):**
- Investicija: 15.000 din
- Mesečni prihod: 25.800 din
- Break-even: ~0.58 sezone = **87 sekundi gameplay**

**Prinos formula:**
```
plastenik_yield = base_crop_yield × area_m2 × 1.15^upgrades × mulj_bonus
mulj_bonus = 1.0 pre Faze B, 1.30 posle (sinergija Mulj đubrivo)
area_m2 starts at 20, max 200 bez prestige
```

**Upgrade tabela — Plastenik (8 stavki):**

| # | Upgrade | Cena (din) | Efekat | Faza unlock |
|---|---------|-----------|--------|-------------|
| T1 | Proširenje +20m² | 8.000 | Area 20→40m² | 0 |
| T2 | Kapljično navodnjavanje | 6.000 | Yield +15% (smanjuje vodni stres) | 0 |
| T3 | Mikrobiljke linija | 4.000 | Otključava mikrobiljke ciklus (21-dan, 1.000 din/kg) | A |
| T4 | Proširenje +40m² | 18.000 | Area 40→80m² | A |
| T5 | Toplinska pumpa | 22.000 | Ciklus paradajza −20%, 2 sezone/god → 3 | B |
| T6 | Mulj đubrivo link | 0 (sinergija) | +30% yield ako Jezero Upgrade J5 aktivan | B |
| T7 | Proširenje +80m² | 45.000 | Area 80→160m² | B |
| T8 | Pametni senzori | 80.000 | Auto-harvest (ne treba aktivni klik), yield +10% | C |

---

### 3c. JEZERO (Ribnjak + Patke)

**Starter stanje:**
- Kapacitet: 200m² ribnjak
- Smuđ: 12 kg/m²/god = 2.400 kg/god = 200 kg/mesec × 1.200 din/kg = **240.000 din/mesec** (max, posle 12 meseci uzgoja)
- Šaran: 12 kg/m²/god = 200 kg/mesec × 650 din/kg = **130.000 din/mesec** (max)
- Uzgoj ciklus: 12 meseci = 720 sekundi gameplay
- Starter prihod (šaran, mesec 1-3): ~30.000 din/mesec (rast je linearan prvih 6 meseci)

**Rast ribe formula:**
```
fish_mass(t) = final_mass × (t / growth_cycle) ^ 0.8  // logistička kriva aprox
fish_harvest = fish_mass(cycle_end) × area_m2 × stocking_density
stocking_density = 0.012 kg/m²/dan (base)
```

**Patke:**
- Starter: 5 patki × 80 jaja/god = 400 jaja/god ≈ 33 jaja/mesec × 35 din = **1.155 din/mesec**
- Unlock: Faza A (niska vrednost standalone, visoka sinergija sa Komposterom)

**Break-even jezero:**
- Investicija: 50.000 din (bazen, aeracija, starter riba)
- Mesec 1-3: ~30.000 din/mesec
- Break-even: ~1.7 meseca = **204 sekundi gameplay** (od Faze B unlock)

**Upgrade tabela — Jezero (8 stavki):**

| # | Upgrade | Cena (din) | Efekat | Faza unlock |
|---|---------|-----------|--------|-------------|
| J1 | Aeracija pumpa | 12.000 | Stocking density +20%, manje mortaliteta | B |
| J2 | Smuđ nasad | 8.000 | Otključava smuđ (1.200 din/kg vs 650) | B |
| J3 | Patke starter (5 kom) | 3.500 | +33 jaja/mesec, +Komposter sinergija | B |
| J4 | Proširenje +100m² | 25.000 | Area 200→300m² | B |
| J5 | Mulj sistem | 18.000 | Otključava Mulj đubrivo sinergiju za Plastenik +30% | B |
| J6 | Patke ×3 (15 kom) | 9.000 | +100 jaja/mesec, Komposter ×2 input | C |
| J7 | Proširenje +200m² | 55.000 | Area 300→500m² | C |
| J8 | Premium kanal (restoran direktno) | 35.000 | channel_multiplier smuđ → 1.55 (restoran), auto-isporuka | C |

---

## 4. MACRO LAYER SPECIFIKACIJA

### Sezonski kalendar

| Sezona | Trajanje (sek gameplay) | Unlock/Odluke | Specijalni event |
|--------|------------------------|---------------|-----------------|
| S1 — Proleće | 120s | Start: Pečurke grena | Seedling sajam (−15% starter cost) |
| S2 — Leto | 120s | Plastenik unlock (Faza A) | Suša event: +navodnjavanje trošak, ili Toplinska pumpa preskočen prihod |
| S3 — Jesen | 120s | Jezero unlock (Faza B) | Berba festival: channel_multiplier +0.2 direktna prodaja (1 sezona) |
| S4 — Zima | 90s | Sinergije aktivne | Masterclass sezona (masterclass_count++ ako aktivirano) |
| S5+ | 90s/sezon | Prestige eligible posle S4+ sa Fazom C | Slučajni eventi (suša, rekordna sezona, inspekcija) |

**Slučajni eventi (5-10% šansa po sezoni od S3+):**
- Suša: Plastenik yield −30% naredna sezona (mitigacija: navodnjavanje upgrade)
- Bolest ribe: Jezero yield −25% (mitigacija: aeracija)
- Gljivična zaraza: Pečurke yield −20% (mitigacija: kontrola vlažnosti)
- Rekordna sezona: Sve grane +15% yield naredna sezona
- Inspekcija: Ako rep < 1.2, −10.000 din kazna

---

### PRE-INVEST PROJECTION SCREEN (CRITICAL)

Prikazuje se KAD god igrač klikne na investiciju > 5.000 din:

```
┌─────────────────────────────────────────────────────┐
│  PROJEKCIJA INVESTICIJE                              │
├─────────────────────────────────────────────────────┤
│  Investicija:     [ 25.000 din ]                    │
│  Kapacitet:       [ 40 m² plastenik ]               │
│  Yield/mesec:     [ ~1.080 kg paradajz ]            │
│  Prihod/mesec:    [ ~48.600 din (direktna) ]        │
│                   [ ~75.330 din (restoran) ]        │
│  Break-even:      [ 0.5 sezone (~52 sek) ]          │
│  ROI @ 3 sezone:  [ ×5.8 ]                         │
├─────────────────────────────────────────────────────┤
│         [ POTVRDI ]        [ ODUSTANI ]             │
└─────────────────────────────────────────────────────┘
```

**Implementaciona nota (za Jovu):** `ProjectionScreen` komponenta prima `InvestmentConfig` objekat i računa sve vrednosti pre rendera. Nikad hardkodirano — čita iz `config.js` konstante.

---

### Prodajni kanali

| Kanal | Osnivački trošak | Provizija % | Cena × | Kapacitet limit |
|-------|-----------------|-------------|--------|----------------|
| Direktna prodaja | 0 | 0% | 1.0× | Neograničeno |
| Pijaca | 5.000 din | 10% | 1.2× | 500 kg/mesec |
| Restoran ugovor | 20.000 din | 0% (fiksna cena) | 1.55× | 300 kg/mesec |
| Online shop | 35.000 din | 8% | 1.9× | 200 kg/mesec |
| Masterclass (event) | 0 (unlock S4+) | 0% | 2.5× | 50 kg/event |

**Kanal logika:** Igrač bira raspodelu % po kanalu (slider u Macro panelu). Kapacitet limit primenjuje "overflow" koji ide u direktnu prodaju automatski.

---

## 5. MICRO LAYER SPECIFIKACIJA

### Capacity widget (HUD)

Uvek vidljiv u gornjem desnom uglu svakog taba:

```
[ PEČURKE ] Kapacitet: 3/5 blokova (60%) | Sledeći talas: 12s
[ PLASTENIK ] Kapacitet: 75/160 m² (47%) | Harvest: 45s
[ JEZERO ] Kapacitet: 280/500 m² (56%) | Riba: 67% rast
```

---

### 5a. Pečurke micro

**Idle tick:** Svaki sekund += `spawn_rate × (elapsed_seconds / cycle_seconds)` za svaki blok
- Formula: `partial_yield = yield_per_block × min(elapsed/cycle_duration, 1.0)`
- Auto-collect pri 100% (bez klika ako T8 unlock, inače klik required)

**Aktivni event — Inokulacija:**
- Trigger: Talas završen, blok treba reseeding
- Vremenski prozor: 10 sekundi (vizuelno "klipa" odbroji)
- On-time bonus: +10% prinos narednog talasa
- Miss penalty: Blok gubi 1 talas (automatski poseje sam sebe, −10% prinos)

---

### 5b. Plastenik micro

**Idle tick:** Rast po formuli linearan tokom sezone
- Formula: `current_yield = total_yield × min(elapsed/season_duration, 1.0)`
- Harvest je jednom po sezoni (nije idle auto-collect bez T8)

**Aktivni event — Zalivanje u suši:**
- Trigger: Ako "Suša" random event aktivan
- Vremenski prozor: 30 sekundi svaka 2 minuta tokom suše sezone
- On-time bonus: Yield normalan (bez penalty)
- Miss penalty: −5% yield kumulativno po propuštenoj akciji (max −30%)

**Aktivni event — Mikrobiljke harvest:**
- Trigger: Ciklus završen (svake 14 sekundi)
- Vremenski prozor: 8 sekundi
- On-time bonus: +5% prinos
- Miss penalty: 0 (auto-collect sa −10% gubitkom bez klika)

---

### 5c. Jezero micro

**Idle tick:** Rast ribe po logističkoj krivoj
- Formula: `fish_mass(t) = final_mass × (t/growth_cycle)^0.8`
- Ne zahteva akciju tokom rasta

**Aktivni event — Hranjenje ribe:**
- Trigger: Svake 60 sekundi realnog vremena (dok riba raste)
- Vremenski prozor: 15 sekundi
- On-time bonus: Rast +5% kumulativno (max +25%)
- Miss penalty: Rast −3% (blagi, ribe su otporne)

**Aktivni event — Harvest:**
- Trigger: Rast 100%, igrač inicira harvest
- Prozor: Slobodan (igrač bira kada)
- Efekat: Restoran kanal zahteva "dogovoreni datum" (±1 sezona) — miss −20% cene

---

## 6. CARRY-OVER FORMULE

```javascript
// Macro → Micro kapacitet
micro_yield_cap = macro_capacity_m2 × base_yield_per_m2;
// Pečurke: blocks × 5kg; Plastenik: area_m2 × 27; Jezero: area_m2 × 12

// Prodajna cena sa kanalima i reputacijom
sell_price = base_price × channel_multiplier × reputation_bonus;
// reputation_bonus = 1.0 + (masterclass_count × 0.05), max 1.5

// Dnevni akcioni limit (koliko aktivnih eventova igrač može da izvrši optimalno)
daily_action_limit = base_actions + (hired_workers × 3);
// base_actions = 5, hired_workers 0→3 tokom igre (unlock Faza A, B, C)

// Reputacija
reputation_bonus = 1.0 + (masterclass_count × 0.05);
// masterclass_count++ pri svakom Masterclass eventu (max 10 → reputation_bonus 1.5)

// Prestige carry-over (50% Macro resursa)
post_prestige_capital = current_capital × 0.50;
post_prestige_capacity = base_capacity × 0.50; // ostatak se ponovo kupuje
prestige_yield_multiplier = 1.15 ^ prestige_count; // kompound

// Alumni mreža bonus
alumni_network_bonus = prestige_count × 0.08; // +8% po prestiže na sve prihode
// Prestige 1: +8%, Prestige 2: +16%, Prestige 3: +24%
```

---

## 7. SINERGIJE

### Sinergija 1 — Komposter (Faza A)

- **Trošak:** 8.000 din (jedan-off purchase u Macro panelu)
- **Mehanizam:** Patke (J3) + Pečurke otpadna supstanca → Komposter → đubrivo za Pečurke
- **Bonus:** +25% spawn_ratio na sve pečurke blokove dok su patke aktivne (J3 unlock required)
- **Vizuelno:** "Komposter" indikator u HUD-u: `[Pečurke] +25% (Komposter aktivan)`

### Sinergija 2 — Mulj Đubrivo (Faza B)

- **Trošak:** 0 din extra (aktivira se kad J5 Mulj sistem kupljen)
- **Mehanizam:** Jezero mulj → Plastenik
- **Bonus:** +30% plastenik yield (yield_per_m2 × 1.30) dok je J5 aktivan
- **Uslov:** J5 Mulj sistem upgrade mora biti kupljen; automatski aktivan posle

### Sinergija 3 — Masterclass Ekosistem (Faza C)

- **Trošak:** 0 din (unlock kroz gameplay, ne kupuje se)
- **Mehanizam:** Sve 3 grane aktivne + masterclass_count ≥ 3 → "Ekosistem masterclass" event unlock
- **Bonus:** +5% na SVE grane po masterclass eventu; stekuje se do ×1.5 reputation_bonus cap-a
- **Edukativni hook:** Opisuje sinergiju permakulture (ribnjak → mulj → biljke → kompost → pečurke) sa jednom rečenicom iz Guncati filozofije

---

## 8. KOMPLETNA UPGRADE TABELA (24 stavki)

| # | Upgrade | Grana | Cena (din) | Efekat | Faza unlock |
|---|---------|-------|-----------|--------|-------------|
| P1 | Drugi blok | Pečurke | 1.600 | +1 blok (kapacitet ×2) | 0 |
| P2 | Kontrola vlažnosti | Pečurke | 2.400 | Spawn ratio +20% | 0 |
| P3 | Oyster upgrade | Pečurke | 3.500 | Otključava oyster (700 din/kg) | A |
| P4 | Blok ×3 | Pečurke | 5.000 | Kapacitet 3 bloka ukupno | A |
| P5 | Ubrzani talas | Pečurke | 8.000 | Ciklus −15% | A |
| P6 | Komposter input | Pečurke | 12.000 | +25% spawn (Komposter sinergija) | B |
| P7 | Blok ×5 | Pečurke | 20.000 | Kapacitet 5 blokova ukupno | B |
| P8 | Masterclass inokulacija | Pečurke | 45.000 | Spawn ×1.4, retke vrste unlock | C |
| T1 | Proširenje +20m² | Plastenik | 8.000 | Area 20→40m² | 0 |
| T2 | Kapljično navodnjavanje | Plastenik | 6.000 | Yield +15% | 0 |
| T3 | Mikrobiljke linija | Plastenik | 4.000 | Otključava mikrobiljke (1.000 din/kg) | A |
| T4 | Proširenje +40m² | Plastenik | 18.000 | Area 40→80m² | A |
| T5 | Toplinska pumpa | Plastenik | 22.000 | Ciklus −20%, 3 sezone/god | B |
| T6 | Mulj đubrivo link | Plastenik | 0 | +30% yield (J5 sinergija) | B |
| T7 | Proširenje +80m² | Plastenik | 45.000 | Area 80→160m² | B |
| T8 | Pametni senzori | Plastenik | 80.000 | Auto-harvest, yield +10% | C |
| J1 | Aeracija pumpa | Jezero | 12.000 | Stocking density +20% | B |
| J2 | Smuđ nasad | Jezero | 8.000 | Otključava smuđ (1.200 din/kg) | B |
| J3 | Patke starter (5 kom) | Jezero | 3.500 | +33 jaja/mesec, Komposter sinergija | B |
| J4 | Proširenje +100m² | Jezero | 25.000 | Area 200→300m² | B |
| J5 | Mulj sistem | Jezero | 18.000 | Otključava Mulj đubrivo sinergiju | B |
| J6 | Patke ×3 (15 kom) | Jezero | 9.000 | +100 jaja/mesec, Komposter ×2 | C |
| J7 | Proširenje +200m² | Jezero | 55.000 | Area 300→500m² | C |
| J8 | Premium kanal (restoran direktno) | Jezero | 35.000 | Smuđ channel_mult 1.55, auto-isporuka | C |

**Ukupno: 24 upgradova** (8 Pečurke + 8 Plastenik + 8 Jezero)

---

## 9. MONETARY PACING TABELA

| Vreme | Kapital akumuliran | Faza | Aktivne grane | Mesečni prihod |
|-------|-------------------|------|---------------|---------------|
| 0:00 | 0 din (starter grant: 5.000 din) | 0 | Pečurke (1 blok) | ~2.000 din |
| 0:30 | ~8.000 din | 0 | Pečurke (2 bloka, P1+P2 kupljeni) | ~5.600 din |
| 1:00 | ~18.000 din | 0→A | Pečurke (3 bloka + oyster mix) | ~14.000 din |
| 1:30 | ~35.000 din | A | Pečurke + Plastenik (starter 20m²) | ~28.000 din |
| 2:00 | ~65.000 din | A | Pečurke + Plastenik (40m² + mikrobiljke) | ~45.000 din |
| 3:00 | ~120.000 din | A→B | Pečurke + Plastenik + Jezero (unlock) | ~70.000 din |
| 4:00 | ~210.000 din | B | Sve 3 grane, sinergije aktivne | ~105.000 din |
| 5:00 | ~350.000 din | B→C | Sve 3 grane, premium kanali | ~130.000 din |
| 6:00 | ~520.000 din | C | Sve 3 grane + Masterclass Ekosistem | ~165.000 din |
| 6:30 | ~620.000 din | C (Prestige eligible) | Sve 3 grane + Alumni network | ≥ 150.000 din × 3 sezone |

**Napomena:** Kapital je kumulativan ukupan zarade, ne balance (troškovi upgradova oduzeti).

---

## 10. PRESTIGE MATEMATIKA

### Trigger condition

```
prestige_eligible = (
  current_phase === "C" &&
  consecutive_seasons_over_150k >= 3 &&
  all_three_branches_active === true
)
```

### Prestige bonusi

```javascript
// Kompound yield multiplier
prestige_yield_multiplier = 1.15 ^ prestige_count;
// P1: ×1.15, P2: ×1.3225, P3: ×1.5209

// Alumni mreža (carry-over bonus)
alumni_network_bonus = prestige_count × 0.08; // na ukupni prihod
// P1: +8%, P2: +16%, P3: +24%

// Kapital carry (50%)
post_prestige_capital = pre_prestige_capital × 0.50;
// Kapacitet se resetuje na 50% base (ostatak se ponovo kupuje brže)

// Prestige speed multiplier (zašto je P2→3 kraće)
prestige_speed = 1.0 + (prestige_count × 0.25);
// Sve cikluse/timere deli sa ovim faktorom
// P1: normale, P2: ×1.25 brže, P3: ×1.50 brže
```

### Prestige scenariji

| Scenario | Prinos razlika | Posebnost |
|----------|---------------|-----------|
| **Guncati** | Base (×1.0) | Fokus na permakultura sinergije; Komposter i Mulj bonus +10% van normale |
| **Avala** | Plastenik ×1.2 (turizam kanal) | Turistički kanal unlock (Masterclass × 2.5 cena), event S3 Avala Run cross-promo |
| **Štrand** | Jezero ×1.3 (smuđ premijum) | Restoran kanal Štrand ekskluzivni ugovor (channel_mult 2.0 za smuđ), patke ornamental bonus |

---

## 11. ACHIEVEMENT LISTA (25 stavki)

| # | Achievement | Trigger | Reward | Edukativna poruka |
|---|-------------|---------|--------|-------------------|
| A1 | **Prva berba** | Prihod od pečurki ≥ 1.000 din | +500 din bonus | Bukovača raste na piljevini jer joj celuloza iz drveta daje ugljenik koji pretvara u proteine. |
| A2 | **Talas majstor** | 10 uzastopnih on-time inokulacija | Ciklus −5% trajno | Pečurke inokulisane u pravo vreme razvijaju čvršći micelij koji donosi veće i zdravije plodove. |
| A3 | **Oyster pioneer** | Prihod od oyster-a ≥ 5.000 din | Spawn ratio +5% trajno | Oyster pečurke čiste zaraženu piljevinu razgrađujući teške molekule, uključujući neke pesticide. |
| A4 | **Zeleni krov** | Plastenik starter kupljen | channel_multiplier ×0.05 boost direktna | Plastenik produži sezonu 2-3 meseca i štiti od mraza bez grejanja ako je dobro orijentisan. |
| A5 | **Kap po kap** | Kapljično navodnjavanje kupljeno | Suša event severity −30% | Kapljično navodnjavanje troši 30-50% manje vode od zalivanja po krošnji i smanjuje bolesti listova. |
| A6 | **Mikrobiljka manija** | 100 kg mikrobiljki ubrano | Mikrobiljke cena +10% | Mikrobiljke imaju 4-40× više vitamina od odraslih biljaka jer su sva energija skoncentrisana u klici. |
| A7 | **Paradajz kralj** | 1.000 kg paradajza ubrano kumulativno | Plastenik yield +5% | Paradajz gajiti u plastenicima na jugu Srbije znači 3 meseca duže sezone nego na otvorenom polju. |
| A8 | **Jezero aktivno** | Jezero grena otključana | Aeracija pumpa −20% cene | Biološka filtracija u ribnjaku počinje od prvog dana — bakterije na šljunku vrše nitrifikaciju prirodno. |
| A9 | **Smuđ gastro** | Smuđ harvest ≥ 500 kg | Restoran kanal capacity +100 kg/mesec | Smuđ u Srbiji dostiže prodajnu masu od ~500g za 18-24 meseca pri ishrani visokoproteinski obrokom. |
| A10 | **Pačje prisustvo** | 5 patki kupljeno | Komposter bonus +5% | Patke konzumiraju 200-300g invertebrata dnevno i na taj način kontrolišu insekte u ribnjaku organički. |
| A11 | **Komposter korak** | Komposter kupljen | Pečurke spawn ratio +5% odmah | Komposter od organskog otpada daje supstrat bogat azotom koji bukovači pomaže u prvom talasu. |
| A12 | **Mulj čarolija** | Mulj đubrivo sinergija aktivna | Plastenik yield +3% dodatno | Ribnjački mulj sadrži fosfor, kalijum i mikroorganizme koji supstituju veštačka đubriva. |
| A13 | **Tri stuba** | Sve 3 grane aktivne istovremeno | Mesečni prihod cap +50.000 din | Permakultura traži diversifikaciju: 3+ sistema u sinergiji prave otpornost na klimatske udare. |
| A14 | **Sezonski igrač** | 4 sezone završene | Alumni network unlock | Godišnji ciklus imanja ide od pripreme tla u zimu do prerade u jesen — nema "mrtve sezone". |
| A15 | **Reputacija raste** | reputation_bonus ≥ 1.20 | Online shop capacity +50 kg | Lokalna reputacija raste eksponencijalno — 5 zadovoljnih kupaca donosi 25-50 novih preporukom. |
| A16 | **Masterclass domaćin** | 1 masterclass event završen | +500 din po igraču × participant_count | Edukativni eventi na imanjima grade community i monetizuju znanje — "farma kao škola". |
| A17 | **Pijaca regularac** | Pijaca kanal aktivan 3 sezone | channel_multiplier pijaca +0.05 | Redovno prisustvo na pijaci gradi lojalnost kupaca koja direktna online prodaja teško može da zameni. |
| A18 | **Online prisutnost** | Online shop otključan | reputation_bonus +0.05 odmah | Online direktna prodaja eliminiše posrednike koji uzimaju 30-50% od maloprodajne cene. |
| A19 | **Prestiž pionir** | Prestige 1 urađen | +8% alumni bonus aktivan | Rotacija useva i prestiž ciklus imitiraju prirodni "reset" — tlo odmara, pa rađa bolje. |
| A20 | **Veterani tima** | 3 hired workers | daily_action_limit +3 | Diversifikovano imanje traži specijalizovane radnike — jedan expert za pečurke vredi tri generalista. |
| A21 | **Sinergijaš** | Sve 3 sinergije aktivne istovremeno | Svi prihodi +5% | Permakultura "output jednog sistema postaje input drugog" — zatvorena petlja smanjuje gubitke na 0. |
| A22 | **Ekosistem arhitekta** | Masterclass Ekosistem unlock (Faza C) | Reputation_bonus cap 1.5 → 1.75 | Imanje koje je i škola i proizvođač i community hub je najotporniji model na tržišne fluktuacije. |
| A23 | **Guncati duh** | Avala scenario Prestige 2 | Turistički kanal capacity ×2 | Guncati model "povratka na selo" nije nostalgija — to je strateška repozicija ka autentičnom iskustvu. |
| A24 | **Šaran i smuđ zajedno** | Oba tipa ribe u jezeru (mix kapacitet) | Stocking density +10% za oba | Polikultura ribe koristi različite zone jezera — smuđ gore, šaran dno — bez kompeticije za hranu. |
| A25 | **Imanje Tycoon** | Mesečni prihod ≥ 300.000 din × 3 sezone | Ekskluzivni Guncati Frame + share badge | Pravo imanje pravi surplus koji se investira u zajednicu — ovo je MKDSLend filozofija u akciji. |

---

## 12. CONFIG.JS REFERENCE VREDNOSTI

Za Jovu — direktno kopiraj u `config.js`:

```javascript
export const GAME_CONFIG = {
  // Timing (sekunde realno = sekunde gameplay)
  SEASON_DURATION_SEC: 120,          // Sezone 1-4; skraćuje se na 90s od S5
  DAY_TO_SEC_RATIO: 2,               // 1 igrani dan = 2 sekunde (pečurke)
  PLASTENIK_DAY_TO_SEC: 0.333,       // 1 igrani dan = 0.333 sekunde (paradajz)
  FISH_GROWTH_CYCLE_SEC: 720,        // 12 meseci uzgoja = 720 sek

  // Starter kapaciteti
  MUSHROOM_STARTER_BLOCKS: 1,
  MUSHROOM_BLOCK_KG: 5,
  PLASTENIK_STARTER_M2: 20,
  FISH_STARTER_M2: 200,
  DUCK_STARTER_COUNT: 0,             // Unlock J3

  // Prinosi (base, bez upgradova)
  MUSHROOM_SPAWN_RATIO: 1.0,
  MUSHROOM_WAVES_PER_BLOCK: 3,
  PLASTENIK_TOMATO_KG_M2: 27,
  PLASTENIK_MICRO_KG_M2_CYCLE: 0.2,
  FISH_KG_M2_YEAR: 12,
  DUCK_EGGS_PER_YEAR: 80,

  // Cene
  PRICE_BUKOVACA: 400,
  PRICE_OYSTER: 700,
  PRICE_PARADAJZ: 215,
  PRICE_MIKROBILJKE: 1000,
  PRICE_SARAN: 650,
  PRICE_SMUDJ: 1200,
  PRICE_JAJE: 35,

  // Kanali
  CHANNEL_MULTIPLIERS: {
    direktna: 1.0,
    pijaca: 1.2,
    restoran: 1.55,
    online: 1.9,
    masterclass: 2.5,
  },
  CHANNEL_COSTS: {
    pijaca: 5000,
    restoran: 20000,
    online: 35000,
  },
  CHANNEL_CAPS_KG: {
    pijaca: 500,
    restoran: 300,
    online: 200,
    masterclass: 50,
  },

  // Upgrade multiplier
  UPGRADE_YIELD_PER_LEVEL: 1.15,

  // Prestiž
  PRESTIGE_CAPITAL_CARRY: 0.50,
  PRESTIGE_YIELD_MULTIPLIER_BASE: 1.15,
  PRESTIGE_SPEED_PER_COUNT: 0.25,
  ALUMNI_BONUS_PER_PRESTIGE: 0.08,

  // Reputacija
  REPUTATION_BASE: 1.0,
  REPUTATION_PER_MASTERCLASS: 0.05,
  REPUTATION_CAP: 1.5,              // 1.75 sa A22 achievementom

  // Faza uslovi
  PHASE_A_TOTAL_REVENUE: 25000,
  PHASE_B_TOTAL_REVENUE: 100000,
  PHASE_C_MONTHLY_SURPLUS: 150000,
  PHASE_C_CONSECUTIVE_SEASONS: 3,

  // Radnici
  BASE_DAILY_ACTIONS: 5,
  ACTIONS_PER_WORKER: 3,

  // Random eventi (šansa po sezoni od S3+)
  EVENT_CHANCE_PER_SEASON: 0.08,
};
```

---

## 13. NAPOMENE ZA IMPL SESIJU

1. **Flat 2D dashboard** — 3 taba + Macro header. CSS flexbox/grid, nikakav Canvas za UI.
2. **Projection screen** — modal komponenta, prikazuje se na svaki upgrade > 5.000 din.
3. **Capacity widget** — HUD uvek vidljiv, update svake sekunde iz game state.
4. **Sinergije** — boolean flag u state.js (`komposter_active`, `mulj_active`, `ekosistem_active`), checked u yield formula.
5. **Prestige modal** — poseban screen sa 3 scenario kartice (Guncati, Avala, Štrand) pre konfirmacije.
6. **Achievement toast** — bottom-right, 3 sekunde, sa edukativnom porukom.
7. **Audio cues (Ceca)** — harvest click, season change, achievement unlock, prestige fanfare.
8. **Share** — Screenshot + "Imanje Tycoon: zarađujem X din/mesec @Guncati" payload za Web Share API.
