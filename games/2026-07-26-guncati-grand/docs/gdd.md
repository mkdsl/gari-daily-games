# Game Design Document — Guncati Grand

**Verzija:** 1.0 | **Dizajner:** Mile Mehanika | **Datum:** 2026-07-26

---

## 1. Budžet Ekonomija (500 GC / nedelja)

### 1.1 Kategorije i bazni efekti

| Kategorija | Bazni efekat (100 GC) | Skaliranje | Cap (GC) |
|---|---|---|---|
| **Gradnja** | +15 Crowd Capacity, +2% Revenue | +1 Capacity/10 GC investirano | 250 GC/nedelja |
| **Hrana** | +10 Wellbeing volontera | +1 WB/10 GC | 200 GC/nedelja |
| **Marketing** | +8% ticket sales rate | +0.7%/10 GC, diminishing returns posle 150 GC | 200 GC/nedelja |
| **Zajednica** | +12 Wellbeing + otključava TomSawyer thresh | +1 WB/8 GC | 200 GC/nedelja |

**Napomena:** Ukupan budžet je TAČNO 500 GC — neiskorišćeni GC ne prenose se u narednu nedelju (use-it-or-lose-it). Kombinovani efekat Hrana + Zajednica na Wellbeing ne prelazi kap od 100.

### 1.2 Tom Sawyer kriva

Wellbeing threshold za besplatan rad volontera je **60%**. Svaki procenat iznad 60% daje:

```
GC_saved_per_point = 4 GC / 1% WB iznad 60%
Max WB bonus: 40% iznad praga = 160 GC uštevina/nedelja
```

Praktično: Zajednica-first igrač koji drži WB na 90% štedi ~120 GC/nedelja na platama — to je ekvivalent punog Marketing slot-a, čineći strategiju viabilnom.

**Wellbeing decay:** Bez Hrana ili Zajednica investicije, WB pada -5% po nedelji (min 20%). Posle eventi-a, pada dodatnih -10% (Grand Finala: -15%).

### 1.3 Marketing skaliranje (diminishing returns)

```
ticket_rate_bonus(M) = M ≤ 150 GC: M × 0.07%
                       M > 150 GC: 150×0.07% + (M-150)×0.03%
Kap: +18% ukupnog ticket rate-a
```

---

## 2. Building Ekonomija

### 2.1 Building tipovi i levelovi

| Building | L1 (cena) | L2 (cena) | L3 (cena) | Efekat po levelu |
|---|---|---|---|---|
| **Pozornica** | 80 GC | +120 GC | +200 GC | +50/+80/+120 Crowd Cap; Grand Finala DJ slot unlock (L2, L3) |
| **WC blok** | 40 GC | +60 GC | +80 GC | +10/+15/+20 Wellbeing; Crowd Cap penalty removal (L1 removes -20 cap debuff) |
| **Šatre** | 50 GC | +70 GC | +100 GC | +25/+40/+60 Crowd Cap; +5/+8/+12% Revenue |
| **Bar** | 60 GC | +90 GC | +130 GC | +3/+5/+8% Revenue; +5/+8/+12 Wellbeing; stanje "dobra pića" = +Vibe micro |
| **Parking** | 35 GC | +50 GC | +70 GC | +20/+35/+50 pristupačnost (Marketing multiplikator ×1.1/×1.2/×1.3) |

**Unlock uslovi:**
- Pozornica L2: Nedelja ≥ 4, Crowd Cap ≥ 150
- Pozornica L3: Nedelja ≥ 7, ukupan Revenue ≥ 3000 GC
- Bar L3: WC L2 mora biti izgrađen (higijenski minimum)
- Šatre L3: Parking L1 mora biti izgrađen (logistika)

**Gradnja cap po nedelji:** Maksimalno 2 building upgrades po nedelji (simulira logistiku gradilišta).

---

## 3. Volonteri — Tom Sawyer Micro Layer

### 3.1 Tipovi volontera

| Ime / Tip | Energija | Glad | Vibe | Specijalnost | Slabost |
|---|---|---|---|---|---|
| **Stolar Mika** | 8/10 | Brzo -3/zadatak | 6/10 | Kopanje, Gradnja (+25% output) | Kuvanje (-30% output) |
| **Kulinar Jovana** | 6/10 | Sporo -1/zadatak | 9/10 | Kuvanje (+35% output), Bar | Fizički rad (-40%) |
| **Fotograf Dragan** | 5/10 | Normalno -2/zadatak | 10/10 | Foto, Marketing (+40% viral šansa) | Sve fizičko (-50%) |
| **Sveznalica Ana** | 7/10 | Normalno -2/zadatak | 7/10 | Sve zadaci (+10%), nema slabosti | Nema specijalnog bonusa |
| **Pendžerović Đule** | 10/10 | Brzo -4/zadatak | 4/10 | Kopanje, Tesanje (+30%) | Foto (-60%), Vibe zarazan (ako Vibe <3, susedni -1) |
| **DJ Student Maja** | 6/10 | Sporo -1/zadatak | 8/10 | Grand Finala DJ slot (×1.2 crowd hype) | Kopanje (-45%) |
| **Organizatorka Biljana** | 7/10 | Normalno -2/zadatak | 8/10 | Admin zadaci (+20%), debuff-uje loše dodele ostalih (-5% za pogrešnu Miku) | — |

### 3.2 Stopa pada i recovery

```
Energija pada: -2 po normalnom zadatku, -4 po teškom (kopanje/tesanje)
Glad pada:     po tipu (tabela gore)
Vibe pada:     -1 za loše dodeljen zadatak, -2 za pogrešnu + glad < 30%

Recovery:
  Rest akcija: +4 Energija, +0 Glad, nema output te nedelje
  Hrana akcija: +0 Energija, +5 Glad, +1 Vibe
  Bar (ako Bar L1+ postoji): +3 Vibe besplatno jednom/nedelja
```

**Min/Max granice:** Energija, Glad, Vibe su 0-10. Energija = 0 → volonter odbija zadatak (auto-rest, 0 output). Vibe = 0 → Wellbeing pada -5 zajednički.

### 3.3 Task compatibility matrica

| Zadatak | Mika | Jovana | Dragan | Ana | Đule | Maja | Biljana |
|---|---|---|---|---|---|---|---|
| Kopanje | ++ | -- | -- | + | ++ | - | — |
| Tesanje | ++ | - | - | + | ++ | - | — |
| Kuvanje | -- | ++ | - | + | - | - | — |
| Foto | - | - | ++ | + | -- | - | + |
| Bar servis | - | + | - | + | - | - | - |
| Admin | - | - | - | + | - | - | ++ |

`++` = +25-40% bonus output, `+` = normalan output, `-` = -30% output, `--` = -40-50% output, `—` = N/A

### 3.4 Wellbeing → aktivacioni prag

```
Prosečan Wellbeing svih volontera ≥ 60%:
  → Volonteri rade besplatno (0 GC plate)
  → Micro layer output × 1.1 (bonus motivacija)

Prosečan Wellbeing 40-59%:
  → Normalan rad, puna GC cena (20 GC/volonter/nedelja)

Prosečan Wellbeing < 40%:
  → Rizik otkaza: svaki volonter ima 20% šansu da napusti tim
  → Output × 0.8 (malodušnost)
```

---

## 4. Grand Finala — Detaljni Scenario

### 4.1 Nedelja 9-10 + 15 min real-time sim

**Setup:** Kapacitet iz Macro layera određuje max Crowd (200-600 posjetilaca). DJ slotovi zavise od Pozornica levela (L1: 1 slot, L2: 2, L3: 3).

### 4.2 Interaktivni eventi (minimum 8)

| # | Event | Trigger | Opcije | Efekat |
|---|---|---|---|---|
| **1. Crowd Surge** | Minut 3, ako Crowd ≥ 80% cap | Otvori kapiju / Zatvori kapiju | Otvori: +15% Revenue, -10% Crowd Mood; Zatvori: 0% Rev, stable Mood |
| **2. Equipment Fail** | Random minut 4-8 | Rezervni PA / Pauza 2 min | Rezervni: -200 GC, Crowd Mood -5; Pauza: Crowd Mood -15, Revenue -8% |
| **3. VIP Gost** | Minut 5 (ako Marketing ≥ 80 GC uloženo u sezoni) | Backstage pristup / Ignoriši | Pristup: +300 GC, +Reputation; Ignorisi: nema |
| **4. Kišni Oblak** | Random minut 6-10 | Šatre (ako L1+) / Otvori kišobrane | Šatre: -5% Mood, nastavlja se; Kišobrani: -15% Mood, Revenue -10% |
| **5. Bar Nestašica** | Minut 7 ako Bar nije L2+ | Hitna nabavka (-150 GC) / Nastavi | Nabavka: Revenue maintained; Nastavi: -20% Revenue remaining |
| **6. DJ Slot Transition** | Svakih 5 minuta (po broju slotova) | Klik za cue DJ | Pravi prelaz: Crowd Hype +20; Kasni klik (>3s): Hype -10 |
| **7. Crowd Mood Crash** | Ako Mood padne ispod 40% | Iznenadna DJ set promena / Volonteri zabavljaju | DJ promena: -1 DJ slot, Mood +25; Volonteri: potreban Vibe ≥ 7, Mood +15 |
| **8. Lokalni Mediji** | Minut 10, ako Reputation ≥ 50 | Daj intervju (pauza 1 min) / Odbij | Intervju: +Reputation ×1.3, Revenue -5% taj minut; Odbij: nema |
| **9. Tehnička Kvar Rasveta** | Random, minut 8-12 | Backup generator (-100 GC) / Rustikalna ambijentalna svetla | Generator: bez debuffa; Ambijentalna: Mood +5 (iznenađujući efekat), 0 GC |
| **10. Spontana Zajednica** | Ako Community Vibe ≥ 80 u sezoni | Auto-event: mještani pomažu WB +20, besplatno | Nema opcije, samo se dešava kao nagrada |

### 4.3 DJ Slot sistem

```
Broj slotova: 1 (Pozornica L1), 2 (L2), 3 (L3)
Svaki slot traje: 15min / broj_slotova
Crowd Hype kriva:
  Start: 50% hype
  Raste: +3%/min dok DJ svira bez greške
  Transition bonus (pravi cue): +20% instant
  Transition fail: -10% instant
  Max: 100% hype
  Hype pada -5%/min posle eventualnog kraja (fade-out)
```

### 4.4 Crowd Mood formula

```
Crowd_Mood = base_mood + Σ(event_effects) + (Hype × 0.3) + (Wellbeing_volontera × 0.2)
base_mood = 70%
Range: 0-100%
```

### 4.5 Final Score formula

```
Revenue_final = Crowd × ticket_rate × (1 + bar_revenue%) × duration_minutes/15
Community_Vibe = prosečan Wellbeing kroz sezonu (tezinsko: nedelje 7-10 × 2)
Crowd_Happiness = Crowd_Mood_final%

Raw_Score = (Crowd_Happiness × 0.4) + (Revenue_final / Revenue_target × 0.35) + (Community_Vibe/100 × 0.25)
Revenue_target = 5000 GC (kalibracija za "dobru" sezonu)

Final_Score = Raw_Score × 10  (skala 0-10)
```

---

## 5. Prestige — Stara Šaraga Mode

### 5.1 Reputation score formula

```
Reputation = (Final_Score × 10) + (Broj_released_igara × 5) + (Community_Vibe_avg × 0.5)
Max po prvoj sezoni: ~120 Reputation
```

### 5.2 Šta ostaje / šta se resetuje

| Stavka | Prestige run |
|---|---|
| GC budžet | RESET na 500 GC, ali -50 GC/nedelja deficit start |
| Buildings | RESET (počinješ bez ičega) |
| Volonteri | RESET, ali 1 volonter (po izboru) ostaje sa sjećanjem (ne gubi Vibe decay 2 nedelje) |
| Crowd Cap | RESET |
| **Reputation** | OSTAJE, daje bonuse (tabela ispod) |
| **DJ Maja unlock** | OSTAJE ako je bila u timu |

### 5.3 Prestige bonusi (konkretni)

| Reputation prag | Bonus |
|---|---|
| ≥ 30 | +0.5 GC bonus po potrošenom GC u Zajednica (Tom Sawyer × 1.25) |
| ≥ 50 | Locked DJ slot otključan od Nedelje 3 (normalno Nedelja 5+) |
| ≥ 70 | Macro alokacija: 550 GC umesto 500 GC |
| ≥ 90 | VIP Gost event garantovan (ne random) |
| ≥ 110 | Volonteri startuju sa +2 Vibe svi |

**Ključna mehanika:** Na Reputation ≥ 50 igrač može pustiti Grand Finala sa 3 DJ slota od Nedelje 7 (accelerated unlock). Razlika u Final Score-u je ~1.5 poena — osetan, ne kosmetički.

### 5.4 "Stara Šaraga" narativni framing

Uvodni tekst: *"Svi znaju za Guncati. Legenda prethodi novcu. Počinješ bez dinara — ali zemlja te pamti."*

---

## 6. Balance Tabele — 3 Viable Build-a

### 6.1 Gradnja-first

```
Strategija: Nedelje 1-5 = 250 GC Gradnja, 100 GC Marketing, 150 GC split Hrana/Zajednica
Nedelje 6-10 = 150 GC Gradnja, 150 GC Marketing, 200 GC split

Projektovan ishod:
  Crowd Cap do Finala: 450-500
  Wellbeing: 55-65% (ispod TomSawyer praga, plaća volontere)
  Final Score range: 6.5 - 7.8
  Pobednički uslov: DA (moguće ≥7.5 uz dobre finale decision-e)
```

### 6.2 Marketing-first

```
Strategija: Nedelje 1-10 = 180 GC Marketing, 150 GC Gradnja, 170 GC Hrana/Zajednica split
Projektovan ishod:
  Crowd Cap: 300-380 (nizi, ali popunjen do 95%)
  Ticket Rate: +16% bonus (blizu cap)
  Wellbeing: 60-70% (TomSawyer prag dostižan od Nedelje 6)
  Final Score range: 6.8 - 8.2
  Pobednički uslov: DA (najlakša putanja do Legenda)
```

### 6.3 Zajednica-first (Tom Sawyer)

```
Strategija: Nedelje 1-4 = 250 GC Zajednica, 150 GC Hrana, 100 GC Gradnja, 0 Marketing
Nedelje 5-10 = 200 GC Zajednica, 100 GC Hrana, 150 GC Gradnja, 50 GC Marketing
Uštevina od TomSawyer (WB ≥ 80%): ~120-160 GC/nedelja od N5 nadalje

Projektovan ishod:
  Crowd Cap: 250-320 (najniži)
  Ticket Rate: skroman (+4-6%)
  Community Vibe: 85-95% (max bonus u Final Score)
  Final Score range: 6.2 - 8.0
  Pobednički uslov: DA, ali zavisi od Finale decision-a (mora pogoditi ≥5 od 8 eventi)
  Narativno: najlepši ending, "Spontana Zajednica" event se skoro uvek okida
```

### 6.4 Crowd rast kriva (Nedelja 1-10)

```
Crowd(N) = Base_capacity + Marketing_bonus(N) × Gradnja_multiplier(N)
Base = 100 posjetilaca (Nedelja 1)
Bez investicija: raste +15/nedelja (word of mouth)
Marketing 100 GC/nedelja: +40/nedelja
Gradnja L1 sve: ×1.3 multiplikator
Max organic: 500 do Nedelje 10
```

### 6.5 Revenue kriva (ukupna sezona)

| Nedelja | Gradnja-first | Marketing-first | Zajednica-first |
|---|---|---|---|
| 1-2 | 200 GC | 180 GC | 150 GC |
| 3-5 | 450 GC | 520 GC | 360 GC |
| 6-8 | 900 GC | 1050 GC | 780 GC |
| 9-10 (Finala) | 2200 GC | 2600 GC | 1900 GC |
| **Ukupno** | **~3750 GC** | **~4350 GC** | **~3190 GC** |

---

## 7. Win Conditions i Scoring

| Final Score | Ishod | Poruka |
|---|---|---|
| ≥ 7.5 | **Legenda Guncatija** | *"Guncati će pamtiti ovu sezonu. Teren je tvoj."* |
| 5.0 – 7.49 | **Lepo ali** | *"Bilo je iskre. Sledeća sezona — još iskre."* |
| < 5.0 | **Teren vraća poruku** | *"Zemlja je strpljiva. Ti možeš biti isto."* (prestige unlock) |

**Achievementi (bonus narativni):**
- "Tom Sawyer je stvaran" — WB ≥ 80% min 6 nedelja
- "Tri slota, tri srca" — sva 3 DJ slota bez greške u Finali
- "Kišni romantičar" — pobedi uz kišni event bez Šatra

---

## 8. Onboarding Sekvenca

### Nedelja 1 — Tutorial Lock

**Dostupno:** Samo Macro layer budžet alokacija (500 GC). Gradnja i Hrana samo.
**Blokirano:** Micro volonterski layer, Marketing, Zajednica.
**Onboarding dialog (Biljana):** *"Počnemo od temelja. Reci mi — gde ćemo prvo kopati?"*
**Auto-save:** DA, posle Nedelje 1.

### Nedelja 2 — Micro Uvod

**Novo:** Micro layer se otvara sa 1 volonterom (Sveznalica Ana — nema slabosti, idealna za tutorial).
**Blokirano:** Marketing alokacija (još jedan krug "zrenja").
**Onboarding dialog (Ana):** *"Evo me. Šta mi daješ? Kopanje, kuvanje ili fotografisanje?"*
**Hint:** Task compatibility prikazana u tooltip-u po prvi put.

### Nedelja 3 — Pun Pristup

**Novo:** Marketing alokacija, Zajednica, svi volonterski tipovi (po pool-u, ne svi odjednom).
**Volonter pool Nedelja 3:** Ana + Mika + random jedan od ostatka.
**Hint:** *"WB iznad 60% znači besplatan rad. Gradi tim, ne samo zgrade."*

**FTUE sugestija (Jovi):** Modal sa 3 koraka ("1. Alociraš, 2. Raspoređuješ, 3. Pratiš Wellbeing") — prikazuje se samo Nedelje 1-3, ne posle.

---

## 9. Modul Mapa (za Jovu — 28-35 modula)

```
src/
├── main.js               — Bootstrap, game loop, stage routing
├── config.js             — Sve konstante (GC, formule, thresholds)
├── state.js              — Game state shape + save/load localStorage
├── input.js              — Click/touch handlers za sve layere
├── render.js             — Canvas/DOM routing, frame manager

src/systems/
├── macro.js              — Nedeljni budžet alokacija logika
├── micro.js              — Volonterski task assignment engine
├── finale.js             — Grand Finala real-time sim (15 min)
├── economy.js            — Revenue, GC tracking, troškovi
├── wellbeing.js          — WB formula, decay, TomSawyer prag
├── progression.js        — Nedelja napredak, unlock logika
├── prestige.js           — Stara Šaraga: reset + reputation carry
├── events.js             — Finale random event dispatcher
├── checkpoint.js         — Auto-save po nedelji (localStorage)
├── scoring.js            — Final Score formula, win condition check

src/entities/
├── volunteer.js          — Volonter tip definicije, Energija/Glad/Vibe
├── building.js           — Building tip definicije, level upgrade logika
├── dj.js                 — DJ slot entitet, hype kriva
├── crowd.js              — Crowd entitet, mood, capacity

src/ui/
├── ui.js                 — Main UI coordinator
├── macro_ui.js           — Nedeljni budžet panel, sliders
├── micro_ui.js           — Volonterski assignment grid
├── finale_ui.js          — Real-time Finala HUD (mood meter, event cards)
├── hud.js                — Persistent HUD (nedelja, GC, WB)
├── modals.js             — Onboarding modali, event decision cards
├── score_ui.js           — End screen, achievement display

src/audio.js              — Web Audio: ambient folk, event stingers, DJ hype ramp
src/share.js              — html2canvas + Web Share API (Final Score share card)

src/content/
├── events_data.js        — Finale event definicije (tekst, opcije, efekti)
├── volunteers_data.js    — Volonterski flavor tekst, dijalozi
├── brand_hooks.js        — Guncati/Kluboslavija narativni keji

styles/
├── base.css              — Layout, full-screen responsive
├── ui.css                — Panel dizajn, button stilovi
├── game.css              — Animacije (WB meter, crowd pulse, event flash)
└── theme.css             — Guncati paleta (zemlja, zelena, ćilibar)
```

**Ukupno modula: 32** (unutar ciljanog 28-35 opsega)

---

## 10. Ključne Dizajnerske Odluke (Summary za Garija)

- **TomSawyer efekat kalibrisan na 4 GC / 1% WB iznad 60%** — max uštevina ~160 GC/nedelja, čini Zajednica-first build legitimno kompetitivnim bez dominiranja
- **Grand Finala ima 10 interaktivnih momenti, ne cutscene** — igrač mora pogoditi ≥5 da dostigne Legenda tier
- **Checkpoint auto-save posle svake nedelje** — nenegocijabilno, state.js ima dedikovan `checkpoint.js` sistem
- **Prestige Stara Šaraga daje osetan bonus** — Reputation ≥ 50 otključava DJ slot 2 nedelje ranije, ×1.25 TomSawyer bonus, 550 GC budžet na ≥70; ne kosmetički
- **3 viable build-a sa overlapping Final Score range-ovima** (6.2-8.2) — nema dominant strategije, sve mogu da osvoje uz dobre Finala odluke
