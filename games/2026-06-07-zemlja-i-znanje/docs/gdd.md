# GDD: Zemlja i Znanje
**Autor:** Mile Mehanika — Game Designer & Economy Balancer
**Datum:** 2026-06-07
**Input:** concept.md (Iskra Ivanović) + premortem.md (Nega Negovanović)
**Verzija:** 1.0 — sve Negine showstopper tačke adresurane

---

## 1. Micro Session UX Flow

### Korak-po-korak: od "Pokreni Sesiju" do kraja dana

Ovo je kanonski tok koji Jova implementira bez improvizacije. Svaki korak ima tačan redosled, tačan trigger i tačan vizuelni element koji se prikazuje.

---

**KORAK 0 — Ulaz u sesiju (sekunda 0–3)**

- Igrač klikne "Pokreni Sesiju" u macro planeru
- Crni fade-in (300ms) → Canvas scena imanja se pojavljuje
- DOM overlay se ucrtava odozgo: tajmlajn traka (horizontal top), energija metar (desno), HUD info (levo)
- Prikazuju se figurice polaznika na Canvas-u (4–8, raspoređene na radnom mestu)
- Audio: jutarnji ambijent počinje (ptice + tihi vetar, Web Audio, 200ms fade-in)
- Ispod tajmlajn trake pojavljuje se tooltip: "Povuci aktivnost u vremenski slot. Počni teorijom." (samo u prvoj sezoni — guided mode)

---

**KORAK 1 — Planiranje prvog bloka (sekunde 3–30)**

- Igrač vidi tajmlajn traku praznu (8 slotova, svaki = 1 sat od 08:00 do 16:00)
- Desni panel prikazuje kartu aktivnosti: [Teorija] [Demonstracija] [Praktični rad] [Pauza] [Evaluacija]
- Igrač drag-and-drop (ili klik na slot + klik na aktivnost) postavlja aktivnosti u slotove
- Sistem validacije: pauza ne može biti u prvih 2 sata; evaluacija mora biti u poslednjem satu
- Greška: slot postaje crvenkast + tooltip "Prerano za pauzu — polaznici tek stigli"
- Potvrda rasporeda: klik na "Kreni" → sesija počinje

---

**KORAK 2 — Tok sesije (minuta 0 do N u realnom vremenu)**

- Tajmlajn traka ima kursor koji se pomera s leva na desno (1 sat igre = 60 sekundi realnog vremena, može se ubrzati ×2 u postavkama)
- Aktivna aktivnost je označena na traci (highlight + naziv)
- Figurice polaznika menjaju animaciju po aktivnosti:
  - Teorija: figurice sedaju, slušaju (animacija: naklon ka "instruktoru")
  - Praktični rad: figurice se saginju, rade (animacija: gore-dole pokret)
  - Pauza: figurice stoje raštrkano, neke hodaju, jedna sedi
- Energija metar: horizontalni bar po svakom polazniku (DOM overlay, desno) — ažurira se svakih 10 sekundi realnog vremena
- Zadovoljstvo: prikazano kao broj (%) u HUD-u gore-levo

---

**KORAK 3 — Incident pojava (tokom sesije)**

- Incident se generiše na osnovu weight tabele (vidi Sekcija 3)
- Pojava: kartica "klizi" odozgo desno (CSS transition, 400ms) i staje u "incident zone" (DOM, desno ispod energija metera)
- Zvuk: kratki "dink" (Web Audio, oscilator 880Hz, 80ms)
- Karta prikazuje: [ikona] [naziv incidenta] [kratki opis, max 2 rečenice] [opcija A] [opcija B] [opcija C ako postoji]
- Igrač mora odabrati opciju pre nego što aktivni incident-timer (vidljiv krug koji se prazni) istekne
- Timer: 20 sekundi za prvu sezonu, 15 sekundi od sezone 2, 12 sekundi od prestiža 1+

---

**KORAK 4 — Decision i posledica (sekunde 3–5 posle odabira)**

- Igrač klikne opciju → kartica nestaje (fade-out, 200ms)
- Efekat se aplicira odmah: energija metar se pomera, zadovoljstvo brojač skače/pada
- Vizuelni feedback: ako je odluka pozitivna → kratki zlatni sjaj oko relevantne figurice; ako negativna → kratki crveni treptaj
- Aforizem Pere Perioda se prikazuje u HUD-u ispod naziva aktivnosti (rotira, 1 po incidentu)
- Tok sesije se nastavlja bez pauze — nema "pojaviš se u meniju" moment

---

**KORAK 5 — Prelaz između aktivnosti (automatski)**

- Kad kursor dostigne granicu slota, aktivnost se automatski menja
- Kratka audio promena: teorija → praktični = čekić počinje, vetar se smanjuje
- Figurice menjaju animaciju u 500ms (CSS transition)
- Igrač ne mora ništa da klikne osim ako želi ručno da prilagodi raspored (drag unutar sesije, samo na slobodne buduće slotove)

---

**KORAK 6 — Pauza za ručak (ako je igrač stavio pauzu u raspored)**

- Kursor stiže do pauze slota → posebna animacija: sunce se pomera po nebu na Canvas-u
- Figurice "sede za sto" (nova animacija zona)
- Energija metar raste tokom pauze (rate: +8 energy/min realnog vremena)
- Audio: tišina + grlica + žubor vode
- Igrač može u pauzi otvoriti "Staff Panel" (DOM overlay) i proveriti status stručnjaka

---

**KORAK 7 — Kraj dana i evaluacija (automatski po kraju rasporeda)**

- Kursor dođe do 16:00 → sesija završava automatski
- Crni fade-out (500ms) → Evaluacija ekran (DOM, fullscreen overlay)
- Prikazuje se: [Zadovoljstvo %] [Energija na kraju %] [Incidenti: N] [Naučeni materijal %]
- Progress bar se animira od 0 do finalnog broja (800ms)
- Ako zadovoljstvo >= 75% i naučeni materijal >= 60%: zlatni confetti (Canvas particle), zvuk "uspeh" (Web Audio crescendo)
- Ako ispod threshold: crveni ekran ivice, zvuk "pad" (dugi ton)
- Dugme "Nastavi" → vraća se u macro planer sa ažuriranim podacima

---

**KORAK 8 — Guided mode (samo prva sezona, prve 2 sesije)**

- SS-3 adresiran: guided first season je ugrađen u flow, ne popup
- U guided mode: incident timer je 30 sekundi (ne 20); max 1 aktivan incident u queue; budžet je zaštićen (ne može u minus)
- Guided indikator: tanka zlatna bordura oko ekrana tokom guided mode-a
- Po završetku druge sesije: kratka animacija "Spreman si — dalje sam" + zlatna bordura nestaje

---

## 2. Canvas vs DOM Render Granica

Ovo je binding kontrakt između render.js i session-ui.js. Nikakvo mešanje.

### Canvas (render.js) — statičko i animirano pozadinsko

| Element | Opis |
|---------|------|
| Pozadina imanja | Izometrijska scena: terasa, jezerce, radionica, povrtnjak — statičan sprite iz Canvas draw calls |
| Polaznici — figurice | SVG-like Canvas draw, 4–8 figura, svaka ima x/y poziciju i animation frame (max 4 frame-a po stanju) |
| Animacija figurica | Canvas requestAnimationFrame loop, 12fps za figurice (ne 60fps — štedi compute) |
| Svetlo po dobu dana | CSS filter na `<canvas>` elementu: jutro `brightness(0.85) sepia(0.2)`, podne `brightness(1.0)`, popodne `hue-rotate(15deg) brightness(0.95)` |
| Vreme/kiša | Canvas overlay layer: providni plavi krugovi koji padaju (kiša), sive mrlje (oblaci) |
| Particle efekti | Canvas: confetti (end of session), zlatni sjaj (pozitivna odluka), crveni treptaj (negativna) |
| Stručnjak figurica | Canvas: Brana/Alatko/Cana — posebna ikona blizu polaznika ako je angažovan |

### DOM Overlay (session-ui.js) — interaktivni UI elementi

| Element | CSS pozicija | Opis |
|---------|-------------|------|
| Tajmlajn traka | `position: fixed; top: 0; left: 0; right: 0; height: 60px` | Horizontalna traka, slot-ovi su div-ovi, drag-and-drop via JS |
| Energija metar (per participant) | `position: fixed; right: 0; top: 60px; width: 200px` | Vertikalni stack, jedan div per polaznik, CSS width transition |
| HUD info levo | `position: fixed; left: 0; top: 60px; width: 180px` | Zadovoljstvo %, budžet, dan/sat |
| Incident kartica | `position: fixed; right: 200px; top: 80px` | CSS slide-in, z-index 100 |
| Decision buttons | Deo incident kartice | Tri `<button>` elementa |
| Incident timer (krug) | Deo incident kartice | SVG `<circle>` stroke-dashoffset animiran |
| Staff panel (pauza) | `position: fixed; center; 400px wide` | Modal overlay, z-index 200 |
| Aforizem text | `position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%)` | Max 80 char, fade-in/out 1s |
| Evaluacija ekran | `position: fixed; inset: 0; background: rgba(0,0,0,0.85)` | Fullscreen, z-index 300 |
| Macro planer | Zamenjuje ceo viewport | Nije overlay — Canvas je hidden u macro modu |

**Pravilo za Jovu:** `render.js` nikada ne dira DOM. `session-ui.js` nikada ne crta na Canvas. Komunikacija ide kroz events.js (event bus pattern).

---

## 3. Incident System

### Incident Tipovi (minimum 12, iz incident-library.js)

| ID | Naziv | Weight | Cooldown (sek) | Doba dana |
|----|-------|--------|----------------|-----------|
| INC_01 | Previše pitanja | 5 | 180 | jutro, podne |
| INC_02 | Kiša počela | 3 | 300 | ceo dan |
| INC_03 | Alat zaboravljen | 4 | 240 | jutro |
| INC_04 | Alergija sumnja | 2 | 600 | ceo dan |
| INC_05 | Polaznik se povrijedio blago | 1 | 900 | praktični rad |
| INC_06 | Struja nestala (punjač telefona) | 2 | 500 | ceo dan |
| INC_07 | Polaznik nema veštine za korak | 4 | 200 | praktični rad |
| INC_08 | Stručnjak kasni 30min | 3 | 0 (jednom) | jutro |
| INC_09 | Hrana se pregrela/pokvarila | 2 | 0 (jednom) | podne |
| INC_10 | Fotograf/mediji stigli neplanirano | 2 | 600 | ceo dan |
| INC_11 | Polaznik želi odustati | 1 | 1200 | popodne |
| INC_12 | Vjetar oborio deo konstrukcije | 2 | 0 (jednom) | ceo dan |
| INC_13 | Polazniku nije jasna teorija | 5 | 120 | teorija |
| INC_14 | Ceca Čujka problemi (samo muzički modul) | 1 | 0 | ceo dan |
| INC_15 | Susedi se žale na buku | 1 | 0 | posle podne |

### Weight Sistem

```
Incident spawn check interval: svakih 90 sekundi realnog vremena
Spawn roll: random 1–100
Incident se spawna ako: roll <= (weight × intensity_modifier × 10)
Max 1 aktivan incident u queue (sezona 1–2)
Max 2 aktivna incidenta u queue (sezona 3–4, prestiž 0)
Max 3 aktivna incidenta u queue (prestiž 1+)
```

### Intensity Modifier po dobu dana

```javascript
// session_hour = sat sesije (0 = 08:00, 8 = 16:00)
function getIntensityModifier(session_hour) {
  if (session_hour < 2)  return 0.5;  // jutro: nizak
  if (session_hour < 4)  return 0.9;  // pre podne: raste
  if (session_hour < 5)  return 0.7;  // oko pauze: malo niže
  if (session_hour < 6)  return 0.8;  // posle pauze: srednje
  if (session_hour >= 6) return 1.3;  // crescendo pred kraj
}
```

### Decision Outcomes (primer za ključne incidente)

**INC_01 — Previše pitanja**
- Opcija A: "Posveti 10 min Q&A" → zadovoljstvo +8, naučeni materijal +5, vreme -10min
- Opcija B: "Odloži na kraj sesije" → zadovoljstvo -3, naučeni materijal +0, vreme +0
- Opcija C: "Brana preuzima" (samo ako Brana angažovan) → zadovoljstvo +12, passive bonus

**INC_02 — Kiša počela**
- Opcija A: "Nastavi napolju sa kabanicama" → zadovoljstvo -10, energija -15
- Opcija B: "Premesti unutra" → zadovoljstvo +5, vreme -15min (setup)
- Opcija C: "Kiša je lekcija" (themed decision) → zadovoljstvo +15, achievement trigger "Kiša ne zaustavlja"

**INC_03 — Alat zaboravljen**
- Opcija A: "Idi po alat (30 min)" → vreme -30min, zadovoljstvo -5
- Opcija B: "Improvizuj" → zadovoljstvo +8 ako uspeh (70% šanse), -15 ako ne
- Opcija C: "Pozajmi od suseda" (unlock posle reputacija 150) → vreme -10min, zadovoljstvo +3

**INC_05 — Polaznik povređen**
- Opcija A: "Pauza za prvu pomoć" → zadovoljstvo -5, energija grupe +5 (drama zbližava)
- Opcija B: "Nastavi, polaznik odlazi na odmor" → zadovoljstvo -15, INC_11 verovatnoća +50%

**INC_07 — Polaznik nema veštine**
- Opcija A: "Spusti nivo zadatka" → naučeni materijal -10, zadovoljstvo +5
- Opcija B: "Upari sa iskusnim" → naučeni materijal +0, zadovoljstvo +8, vreme -5min
- Opcija C: "Brana/Alatko demonstriraju" (ako angažovani) → naučeni materijal +10, zadovoljstvo +12

**INC_11 — Polaznik želi odustati**
- Opcija A: "Razgovor 1:1" (15 min) → 80% zadržava polaznike, zadovoljstvo +5, vreme -15min
- Opcija B: "Pusti ga" → gubitak 1 polaznika, zadovoljstvo grupe +3 (dinamika se smiruje)

### Cooldown Enforcement

```javascript
// incident-queue.js
function canSpawnIncident(incidentId, lastSpawnTime, cooldown) {
  return (Date.now() - lastSpawnTime[incidentId]) > cooldown * 1000;
}
// Jednom eventi (INC_08, INC_09, INC_12) se ne vraćaju u toku iste sesije
```

---

## 4. Ekonomija Brojeva

### Cena Ulaznice

```
price = BASE_PRICE × (1 + reputation / 200)

Gde:
  BASE_PRICE = 80  // eura, za suvozid (najjeftiniji)
  BASE_PRICE = 100 // eura, za inokulaciju pečuraka
  BASE_PRICE = 120 // eura, za rammed earth
  BASE_PRICE = 150 // eura, za akvakultura
  BASE_PRICE = 130 // eura, za permakultura dizajn
  BASE_PRICE = 200 // eura, za kombinovani modul (3+ dana)

Primeri (suvozid):
  Rep   0 → 80 × 1.00 = 80€
  Rep 100 → 80 × 1.50 = 120€
  Rep 300 → 80 × 2.50 = 200€
  Rep 600 → 80 × 4.00 = 320€
  Rep 1000 → 80 × 6.00 = 480€  (hard cap)
```

**Hard cap na cenu:** `price = min(price, BASE_PRICE × 6)` — sprečava "beskonačna cena" exploit.

### Reputacija Gain Per Sezona

```
rep_gain = participants × avg_satisfaction × season_multiplier

Gde:
  participants    = broj polaznika koji su završili sezonu (nisu odustali)
  avg_satisfaction = prosek zadovoljstva svih polaznika (0.0–1.0)
  season_multiplier = vidi tabelu ispod

Primeri:
  6 polaznika, 80% zadovoljstvo, sezona 1 (multiplier 1.0):
    rep_gain = 6 × 0.80 × 1.0 = 4.8 → zaokruženo na 5

  8 polaznika, 90% zadovoljstvo, sezona 3 (multiplier 1.4):
    rep_gain = 8 × 0.90 × 1.4 = 10.08 → zaokruženo na 10
```

### Season Multiplier Tabela

| Sezona u prestiž ciklusu | Multiplier |
|--------------------------|-----------|
| 1 | 1.0 |
| 2 | 1.2 |
| 3 | 1.4 |
| 4 | 1.6 |
| 5 (pre prestiž reset-a) | 2.0 |
| 1 (prestiž 1, novi ciklus) | 1.3 |
| 2 (prestiž 1) | 1.5 |
| 3 (prestiž 1) | 1.7 |
| 5 (prestiž 1) | 2.5 |
| 5 (prestiž 2+) | 3.0 |

### Satisfaction Thresholds

| Zadovoljstvo | Ishod | Reputacija efekat |
|-------------|-------|-------------------|
| < 50% | Fail — "ozbiljna kritika" | rep_gain × 0 |
| 50–64% | Prolaz — "prosečna sezona" | rep_gain × 0.5 |
| 65–74% | Dobro — "zadovoljavajuće" | rep_gain × 0.8 |
| 75–84% | Odlično — normalan rep_gain | rep_gain × 1.0 |
| 85–94% | Izvrsno — bonus | rep_gain × 1.2 |
| 95–100% | Savršeno — "legendarno" | rep_gain × 1.5 + achievement |

### Budžet po Sezoni

```
season_budget = BASE_BUDGET + (reputation × 0.5)
BASE_BUDGET = 500  // eura (poklon novog sezons)

Fiksni troškovi:
  materijali_po_danu = 60 × broj_dana
  hrana_po_polazniku_po_danu = 15
  honorar_strucnjaka_po_danu = 80 (ako angažovan)

Prihod:
  prihod = participants × price_per_participant

Profit:
  profit = prihod - (materijali + hrana + honorar)

Carry-over:
  Ako profit > 0, 30% ide u sledeću sezonu kao "start kapital"
  Alat kupljen ovde: jeftiniji 20% sledeće sezone (tool_discount flag u state)
  Hrana konzervirana (Cana aktivan): trošak hrane -25% sledeće sezone
```

---

## 5. Prestiž Ekonomija

### Prestiž Unlock Uslovi

- 5 završenih sezona u tekućem ciklusu
- Sve sezone imaju status "završena" (ne failed)
- Ukupno zadovoljstvo prosečno >= 65%

### Prestiž Bonusi (eksponencijalni rast)

| Prestiž nivo | Start reputacija | Earning multiplier | Unlock |
|-------------|------------------|-------------------|--------|
| 0 (base) | 0 | 1.0× | — |
| 1 | 250 (25% od 1000) | 1.10× | Novi stručnjak ostaje; 1 premium alat |
| 2 | 450 (45% od 1000) | 1.20× | Nova tema: "Prirodna gradnja — zemlja i slama" |
| 3 | 650 (65% od 1000) | 1.35× | Secret achievement "Institucija" + MKDSLend flavortext |
| 4 | 750 | 1.55× | Max polaznici unlock: 12 (iz 8) |
| 5 | 850 | 1.80× | Max polaznici unlock: 18; nova tema "Akvakultura napredna" |

**Svaki naredni prestiž multiplikuje earning rate eksponencijalno:**

```
earning_multiplier(prestige_level) = 1.0 + (prestige_level × 0.10) + (prestige_level ^ 1.3 × 0.03)

Vrednosti:
  P0: 1.00×
  P1: 1.10 + 0.03 = 1.13×
  P2: 1.20 + 0.09 = 1.29×
  P3: 1.35 + 0.18 = 1.53×
  P4: 1.55 + 0.31 = 1.86×
  P5: 1.80 + 0.49 = 2.29×
```

### Earning Formula Per Polaznik

```
earning_per_participant = base_per_participant × prestige_mult × rep_bonus × satisfaction_bonus

Gde:
  base_per_participant = price (iz cena formule, sekcija 4)
  prestige_mult        = earning_multiplier(prestige_level)
  rep_bonus            = 1 + (reputation / 500)  // od 1.0 do 3.0 (cap na rep 1000)
  satisfaction_bonus   = vidi satisfaction thresholds tabela (0.5 do 1.5×)

Primer (prestiž 1, rep 300, cena suvozid 200€, 90% zadovoljstvo, 7 polaznika):
  base = 200
  prestige_mult = 1.13
  rep_bonus = 1 + 300/500 = 1.60
  satisfaction_bonus = 1.2
  earning_per = 200 × 1.13 × 1.60 × 1.2 = 434.88€
  ukupno = 7 × 434.88 = 3044€ prihod
```

### Šta se prenosi kroz prestiž reset

| Element | Prenosi se | Ne prenosi se |
|---------|-----------|---------------|
| Start reputacija | DA (% od 1000) | — |
| Earning multiplier | DA (permanentan) | — |
| Odabrani stručnjak | 1 po prestiž levelu | Ostali |
| Premium alat | 1 po prestiž levelu | Ostali alati |
| Otključane teme | Kumulativno | — |
| Career stats (ukupno polaznici) | DA | — |
| Budžet | NE | Sve para |
| Tool discount | NE | — |

---

## 6. Progression Kriva — Unlock Tabela

Minimum 20 stavki. Sve su vezane za reputaciju (0–1000).

| Reputacija | Šta se otključava |
|-----------|-------------------|
| 0 | Tema: Suvozid, 4 polaznika, Alatko dostupan |
| 25 | Achievement "Prva Sesija Gotova" — zlatna ikona u meta UI |
| 50 | Tema: Inokulacija pečuraka, Brana dostupan |
| 75 | Max polaznici: 5 |
| 100 | Tema: Rammed Earth dostupna |
| 125 | Cana Čup stručnjak dostupan (hrana boljeg kvaliteta → +5 energija svakim obrokom) |
| 150 | Decision option: "Pozajmi od suseda" (INC_03) |
| 175 | Max polaznici: 6 |
| 200 | Tema: Permakultura dizajn dostupna |
| 250 | Sesija može biti 2 dana (multi-day masterclass) |
| 300 | Applicant pool raste: 20+ kandidata za selekciju (bio: farmer, student, kuvar, inženjer, umetnik) |
| 350 | Max polaznici: 7 |
| 400 | Tema: Akvakultura dostupna; audio menja se na "jezerce ambijent" |
| 450 | Premium alat: "Profesionalna bušilica" (-20% vreme praktičnih aktivnosti) |
| 500 | Achievement "Polovina Puta" — mid-career milestone; share karta deblokuje |
| 550 | Max polaznici: 8 (hard cap v1); Sesija može biti 3 dana |
| 600 | Tema: Kombinovani modul dostupna (multi-tema, viša cena) |
| 700 | Passive bonus: "Stalni polaznici" — 2 polaznika iz prethodne sezone uvek se vraćaju |
| 800 | Achievement "Prepoznatljivi" + Guncati link u end screen se aktivira sa custom tagline-om |
| 900 | Tema: "Muzika i prostor" dostupna (sezoni 4+) |
| 950 | Vizuelni unlock: imanje dobija novu zgradu na Canvas-u (radionica proširana) |
| 1000 | Achievement "Živo Učilište" — career win; prestiž run reset opcija se pojavljuje; secret achievement MKDSLend reveal |

---

## 7. Save Kontrakt

### Atomarnost Micro Sesije

**Micro sesija je atomarna jedinica.** Ne može se nastaviti posle browser close.

```
Ako igrač zatvori browser tokom micro sesije:
  → auto-resolve sa formulom:
    auto_satisfaction = progress_ratio × target_satisfaction × 0.75
    progress_ratio = (elapsed_time / total_session_time)
    target_satisfaction = prosek dostignut do trenutka zatvaranja

  Primer: sesija 6h, zatvoreno posle 3h (50%), dostignut 80% zadovoljstvo:
    auto_satisfaction = 0.50 × 80 × 0.75 = 30%
    Sesija se smatra "delimično završenom", rep_gain × 0.3

  → macro state se uvek čuva (sesija je bila "u toku", ostaje kao completed sa auto score)
```

### State Podela

**macroState** (uvek čuvan, svakih 30 sekundi realnog vremena):
```json
{
  "reputation": 0,
  "season_number": 1,
  "prestige_level": 0,
  "career_stats": {
    "total_participants": 0,
    "total_revenue": 0,
    "seasons_completed": 0
  },
  "unlocks": [],
  "multipliers": { "earning": 1.0, "start_rep_bonus": 0 },
  "staff_roster": [],
  "tool_inventory": [],
  "food_reserves": 0,
  "active_season": null
}
```

**microTempState** (čuvan svakih 10 sekundi, briše se po završetku sesije):
```json
{
  "session_id": "UUID",
  "elapsed_real_seconds": 0,
  "timeline_slots": [],
  "participant_states": [],
  "incident_log": [],
  "current_satisfaction": 0,
  "current_energy_avg": 0,
  "active_incident": null
}
```

**sessionResult** (čuvan po završetku sesije, ulazi u macroState):
```json
{
  "session_date_in_game": "Sezona 1, Dan 1",
  "final_satisfaction": 0,
  "final_learned_material": 0,
  "incidents_resolved": 0,
  "participants_kept": 0,
  "revenue": 0,
  "was_auto_resolved": false
}
```

### LocalStorage Ključevi

```javascript
const SAVE_KEYS = {
  MACRO:   'gari_ziz_macro_v1',      // macroState JSON
  MICRO:   'gari_ziz_micro_temp_v1', // microTempState JSON (briše se po end sesije)
  RESULTS: 'gari_ziz_results_v1',    // array of sessionResult
  META:    'gari_ziz_meta_v1',       // achievements, stats, version
};
// 'ziz' = Zemlja i Znanje skraćenica, sprečava koliziju sa drugim igrama
```

---

## 8. Early Reward Momenti

Nega je zahtevala minimum 3 vidljive nagrade unutar prve sezone. Svih 5 su dizajnirani da stanu u sesiju od 15–20 minuta.

### Reward 1 — "Ruke u Blatu" (minuta 3–5, unutar prve sesije)

- Trigger: igrač završi prvu aktivnost (Teorija slot, 1 sat)
- Vizuelno: figurice promene animaciju u "praktični rad" — saginju se, menjaju pozu
- Audio: čekić počinje, ptice stišaju
- DOM: mali toast "Polaznici rade! Energija: 85%" (3 sekunde, nestaje)
- Zašto radi: igrač vidi da je akcija imala efekat — figurice su žive

### Reward 2 — "Prva Kriza Prebrodjana" (minuta 8–12, posle prvog incidenta)

- Trigger: igrač reši prvi incident sa opcijom koja daje +zadovoljstvo
- Vizuelno: zlatni sjaj oko figurice na koju se incident odnosio (Canvas particle)
- DOM: Pera Period aforizem se pojavljuje dole: "Nema zanata bez greške — ima zanata bez predaje."
- Zvuk: kratki "ding" (Web Audio, dur akord, 200ms)
- Zašto radi: potvrda da je sistem reagovao na odluku igrača

### Reward 3 — "Ručak Bez Komentara" (minuta 12–15, po završetku pauze)

- Trigger: figurice završe pauzu sa energijom >= 70%
- Vizuelno: all-participants energija metar se animira zeleno istovremeno
- DOM: kratki prikaz "Cana Čup sistem: +5 energija per polaznik" ako je Cana angažovana
- Zašto radi: igrač vidi da su resursi imali efekat — investicija u hranu = konkretna korist

### Reward 4 — "Sezona Završena" (minuta 15–20, po kraju sesije)

- Trigger: sesija evaluacija ekran
- Vizuelno: progress bar se animira od 0 do finala, confetti ako >= 75%
- DOM: share karta preview (ako rep >= 500): "Sezona 1: 4 polaznika, [X]% zadovoljstvo, [Y]€ prihod"
- Zvuk: crescendo (2 sekunde, layered oscillators)
- Zašto radi: jasna završna tačka sa metrikom

### Reward 5 — "Reputacija Raste" (odmah posle evaluacije)

- Trigger: macro state se ažurira, rep_gain se prikazuje
- Vizuelno: reputacija bar u macro UI se animira od stare do nove vrednosti
- DOM: prikaz prvog unlock-a ako threshold pređen: "Novo: Tema Inokulacija Pečuraka otključana"
- Zašto radi: eksplicitni napredak ka dugoročnom cilju, vidljiv odmah

---

## 9. Participant Archetypes

Minimum 6 profila. Svaki polaznik se generiše iz ovih arhetipova sa blagim varijacijama (+/- 10% na statove). Implementira `src/content/participant-archetypes.js`.

### Arhetip 1 — Radoznali Student

| Stat | Vrednost |
|------|---------|
| Energija start | 90 |
| Znatiželja | 95 |
| Fizička izdržljivost | 60 |
| Incident reakcija | Pita puno pitanja (INC_01 weight +2 kada student u grupi) |
| Poseban efekat | Ako Q&A dobiješ opcijom A ili Brana odgovori: zadovoljstvo +12 |
| Flavor ime | Milena, Luka, Sofija |

### Arhetip 2 — Iskusni Farmer

| Stat | Vrednost |
|------|---------|
| Energija start | 75 |
| Znatiželja | 50 |
| Fizička izdržljivost | 95 |
| Incident reakcija | Sceptičan prema teoriji — INC_13 weight +3 ako teorija traje > 2h |
| Poseban efekat | Praktični rad: energija pada 20% sporije; daje +5 naučeni materijal grupi ako je on zadovoljan |
| Flavor ime | Dragan, Mitar, Slavko |

### Arhetip 3 — Kuvar U Tranziciji

| Stat | Vrednost |
|------|---------|
| Energija start | 80 |
| Znatiželja | 80 |
| Fizička izdržljivost | 70 |
| Incident reakcija | Osetljiv na hranu — INC_09 daje -20 zadovoljstvo kuvar-u specifično |
| Poseban efekat | Ako Cana Čup angažovana: kuvar dobija +15 zadovoljstvo (profesionalni respekt) |
| Flavor ime | Jelena, Marija, Branko |

### Arhetip 4 — Umirovljeni Inženjer

| Stat | Vrednost |
|------|---------|
| Energija start | 60 |
| Znatiželja | 85 |
| Fizička izdržljivost | 50 |
| Incident reakcija | Traživa preciznija objašnjenja — INC_13 weight +2; INC_01 weight +1 |
| Poseban efekat | Energija pada brže u popodne (umor), ali naučeni materijal je uvek +5 više od proseka |
| Flavor ime | Slobodan, Radoslav, Vera |

### Arhetip 5 — Mladi Preduzetnik

| Stat | Vrednost |
|------|---------|
| Energija start | 100 |
| Znatiželja | 75 |
| Fizička izdržljivost | 80 |
| Incident reakcija | Fotografiše sve — INC_10 (neplanirani mediji) nikad nije problem za njega; +2 zadovoljstvo |
| Poseban efekat | Share karta: ako mladi preduzetnik >= 75% zadovoljstvo, share karta dobija "Preporučuje" tag |
| Flavor ime | Ivan, Nikola, Mina |

### Arhetip 6 — Ekolog / Aktivista

| Stat | Vrednost |
|------|---------|
| Energija start | 85 |
| Znatiželja | 90 |
| Fizička izdržljivost | 75 |
| Incident reakcija | Jako negativan na INC_12 (obor konstrukcije): -20 zadovoljstvo automatski; traži objašnjenje |
| Poseban efekat | Ako kiša/prirodni incident (INC_02) odabrana opcija C "Kiša je lekcija": ekolog dobija +20 zadovoljstvo i achievement trigger |
| Flavor ime | Ana, Stefan, Tijana |

### Arhetip 7 (bonus) — Lokalni Mediji / Novinar

| Stat | Vrednost |
|------|---------|
| Energija start | 70 |
| Znatiželja | 100 |
| Fizička izdržljivost | 65 |
| Incident reakcija | Neutralan na incidente — piše o njima, ne reaguje emocionalno |
| Poseban efekat | Po završetku sezone: reputacija +10 bonus ako novinar >= 80% zadovoljstvo (PR boost) |
| Flavor ime | Predrag, Nataša |

---

## 10. Balance Tabela — Masterclass Teme

| Tema | Trajanje | Cena min (rep 0) | Cena max (rep 1000) | Kompleksnost (1–5) | Incident freq | Unlock rep |
|------|---------|-----------------|--------------------|--------------------|---------------|-----------|
| Suvozid | 1 dan | 80€ | 480€ | 2 | Niska (INC_03 čest) | 0 |
| Inokulacija Pečuraka | 1 dan | 100€ | 600€ | 3 | Srednja (INC_04, INC_07) | 50 |
| Rammed Earth | 2 dana | 120€ | 720€ | 3 | Srednja-visoka (INC_12, INC_07) | 100 |
| Permakultura Dizajn | 2 dana | 130€ | 780€ | 4 | Srednja (teorija-heavy → INC_13 čest) | 200 |
| Akvakultura | 2–3 dana | 150€ | 900€ | 4 | Visoka (INC_02 + INC_05 + INC_07) | 400 |
| Kombinovani Modul | 3 dana | 200€ | 1200€ | 5 | Visoka (sve kategorije) | 600 |
| Prirodna Gradnja — Zemlja i Slama | 2 dana | 140€ | 840€ | 4 | Srednja-visoka | prestiž 2 |
| Muzika i Prostor | 1 dan | 120€ | 720€ | 3 | Niska (INC_14 jedino, Guncati event hook) | 900 |
| Akvakultura Napredna | 3 dana | 180€ | 1080€ | 5 | Visoka + bonus "ribnjak od nule" mechanic | prestiž 5 |

### Kompleksnost Efekat na Incident Spawn Rate

```
incident_spawn_modifier = 1 + ((complexity - 1) × 0.15)

Kompleksnost 1: 1.0× (base)
Kompleksnost 2: 1.15×
Kompleksnost 3: 1.30×
Kompleksnost 4: 1.45×
Kompleksnost 5: 1.60×
```

### Naučeni Materijal Baseline po Temi

```
learned_baseline = 40 + (complexity × 5)

Suvozid (k=2):    40 + 10 = 50%  baseline koji se može dostići
Inokulacija (k=3): 40 + 15 = 55%
Rammed Earth (k=3): 55%
Permakultura (k=4): 60%
Akvakultura (k=4):  60%
Kombinovani (k=5):  65%  (teži, ali vredi više rep_gain-a)
```

---

## Implementacioni Napomene za Jovu (ne GDD sadržaj, servis info)

### Dependency Graf (redosled implementacije, 4b → 4c)

```
config.js
  ↓
state.js (macro + meta)
  ↓
save.js
  ↓
events.js (event bus)
  ↓
content/masterclass-catalog.js
content/participant-archetypes.js
content/incident-library.js
  ↓
macro/season-planner.js
macro/budget.js
macro/staff-roster.js
macro/participant-profiles.js
macro/pricing-engine.js
macro/resource-manager.js
  ↓
micro/session-state.js (temp state)
micro/timeline.js
micro/energy-system.js
micro/participant-manager.js
micro/incident-generator.js  (čita incident-library.js)
micro/incident-queue.js
micro/decision-cards.js
micro/timing-engine.js
micro/satisfaction-calc.js
micro/weather.js  (spojeni weather-forecast + weather-runtime)
micro/module-progress.js
  ↓
meta/reputation.js
meta/prestige.js
meta/achievements.js
meta/career-stats.js
meta/multipliers.js
meta/unlock-manager.js
  ↓
render.js  (Canvas, ne zna za DOM)
session-ui.js (DOM overlay, ne zna za Canvas)
audio.js  (Ceca Čujka — 5 audio zona, trigger iz events.js)
  ↓
main.js  (wire sve)
```

### Instructor = Passive Config (IMP-1 adresiran)

`instructor-ai.js` je ELIMINISAN. Zamenjen je sa tabela u `config.js`:

```javascript
export const STAFF_BONUSES = {
  brana: {
    satisfaction_flat: +5,         // per sesija ako angažovan
    incident_option_unlock: true,  // otključava C opciju u INC_01, INC_07
    capacity_per_day: 1,           // može biti u 1 masterclass dnevno
  },
  alatko: {
    time_reduction_pct: 0.15,      // praktični rad 15% kraći (manje grešaka)
    incident_option_unlock: true,  // otključava C opciju u INC_03
    capacity_per_day: 1,
  },
  cana: {
    energy_per_meal: +8,           // umesto default +5
    satisfaction_flat: +3,         // per sesija
    food_cost_reduction: 0.25,     // -25% naredne sezone
    capacity_per_day: 1,
  },
};
```

### Audio Brief za Cecu

```
Zone 1 — Jutro:
  Oscillators: sine 400Hz (ptice simulacija, 3× random timing), noise filtered 80Hz (vetar)
  Trigger: session_hour < 2

Zone 2 — Praktični rad:
  Oscillators: square 120Hz hit (čekić, svake 2-4 sek random), noise 200Hz (lišće)
  Trigger: event 'activity_changed', type === 'prakticni_rad'

Zone 3 — Pauza:
  Oscillators: sine 600Hz × sine 1.5Hz = tremolo (grljičica), sine 200Hz slow LFO (potok)
  Trigger: event 'activity_changed', type === 'pauza'

Zone 4 — Incident:
  Single shot: oscillator 880Hz, exponential decay, 80ms
  Trigger: event 'incident_appeared'

Zone 5 — Prestiž/Kraj sezone (uspeh):
  Layered: sine 261Hz + sine 329Hz + sine 392Hz (C dur akord), noise crackle filter (drvo),
           sine 120Hz swell 2s (jezero duboki ton)
  Trigger: event 'session_success', satisfaction >= 75
```

---

*Mile Mehanika — GDD v1.0 za Zemlja i Znanje. Sve Negine SS tačke adresurane (SS-1: sekcija 1, SS-2: sekcija 2, SS-3: sekcija 1 KORAK 8). Scope rezovi iz premortemera primenjeni (instructor-ai eliminisan, weather spojen, leaderboard/era stub za polish). Jova ima dependency graf i može krenuti u 4a scaffold.*
