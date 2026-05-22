# GDD — Sound vs Tišina

> Autor: Mile Mehanika
> Datum: 2026-05-22
> Odgovor na: concept.md + premortem.md

---

## Mehanike detalj

### Sistem slojeva

| Layer | Naziv | Opis | Prioritet |
|-------|-------|------|-----------|
| L1 | Micro — SPL Puzzle | Slajderi, heatmap, dinamički eventi | P0 — must ship |
| L2 | Macro — Season Manager | Venue izbor, budžet, oprema | P1 — ship ako vreme dozvoljava |
| L3 | Meta — Career Progression | XP, reputacija, unlock | P2 — post-launch |

### Tick rate
- Simulacija se izvršava na 10 ticks/sekundi (100ms per tick)
- SPL se recalculate svaki tick
- Dinamički eventi se proveravaju svaki tick, trigerišu se po rasporedu
- UI refresh: 30 FPS (vizuelni heatmap)

---

## SPL Propagation Model (formula)

### Osnovna formula

```
spl_at_point = source_db - 20 * log10(d / d0) + reflection_bonus - wind_factor
```

Gde:
- `source_db` — izlazni SPL izvora u dB (slider vrednost, 50–115 dB)
- `d` — udaljenost od izvora do tačke merenja u metrima
- `d0` — referentna udaljenost = 1 metar
- `reflection_bonus` — bonus dB od refleksija (zavisi od terena, 0–8 dB)
- `wind_factor` — korekcija zbog vetra (0 ako nema vetra, -3 do +5 dB u zavisnosti od smera)

### Refleksija tabela

| Tip terena | reflection_bonus |
|------------|------------------|
| Otvoren teren (polje) | 0 dB |
| Meka šuma (apsorpcija) | -2 dB |
| Gusta šuma (odbijanje) | +4 dB |
| Betonski zidovi (urban) | +8 dB |
| Rečna površina | +3 dB |
| Planinska dolina | +6 dB |

### Wind factor tabela

| Situacija | wind_factor |
|-----------|-------------|
| Bez vetra | 0 dB |
| Laki povetarac, prema susedu | +2 dB |
| Srednji vjetar, prema susedu | +4 dB |
| Bura prema susedu | +5 dB |
| Vjetar od suseda (prema stage-u) | -3 dB |

### Happiness formula

```
happiness = clamp((spl_at_dancefloor - 75) / 15, 0, 1) * 100
```

- Optimalni SPL na dance flooru: 85–95 dB
- Ispod 75 dB: happiness = 0%
- 95+ dB: happiness = 100% (ali source mora biti > 100 dB = risk)
- Iznad 110 dB: happiness počinje da pada (publika beži od prekomernog) — penalty -0.5% per dB iznad 110

### Neighbor SPL check

```
neighbor_spl = sum(spl_at_neighbor_point(source) for source in all_active_sources)
```

- Koristimo logaritamsko sabiranje izvora: `total = 10 * log10(sum(10^(spl_i/10)))`
- Hard cap: 70 dB (Zakon o zaštiti od buke RS, noćni period 22:00–06:00)
- Dnevni period: 75 dB limit
- Tolerance window: 70.0–71.5 dB = yellow warning (bez penala)
- Iznad 71.5 dB = crvena zona, generišse complaint po 3 sekunde kontinuiranog prekoračenja

---

## Ekonomija — Reputacija i Budžet

### Reputacija sistem

**Dve poluge:**

| Poluga | Max | Početna | Promena |
|--------|-----|---------|--------|
| Publika Rep | 100 | 50 | +/- po eventu |
| Komšijska Rep | 100 | 50 | +/- po eventu |

**Publika Rep promene:**
- Happiness > 80% na kraju noći: +10
- Happiness 60–80%: +5
- Happiness 40–60%: 0
- Happiness < 40%: -10
- Bonus: nula tehničkih kvarova tokom noći: +3
- Bonus: peak na 95 dB tačno u 01:00 (prime time): +5

**Komšijska Rep promene:**
- 0 complaints tokom noći: +8
- 1–2 complaints: +2
- 3–5 complaints: -5
- 6+ complaints: -15
- Event shutdown zbog buke: -25
- Bonus: event završen pre 04:00: +3

**Complaint generisanje:**
- 1 complaint = neighbor SPL > 71.5 dB za 3+ sekunde
- Max 1 complaint per 10 sekundi (cooldown)

### Budžet sistem

**Prihod per event:**
```
event_profit = (happiness_avg / 100) * audience_size * ticket_price - expenses
```

- `ticket_price` po nivou: Level 1–2: 500 RSD, Level 3–4: 800 RSD, Level 5–6: 1200 RSD, Level 7–8: 2000 RSD
- `expenses` = rental_cost + equipment_depreciation (5% vrednosti opreme po eventu) + permit_cost

**Rental cost po venueu:**

| Level | Venue | Rental Cost |
|-------|-------|-------------|
| 1 | Šumski Sat | 5.000 RSD |
| 2 | Rečna Obala | 8.000 RSD |
| 3 | Industrijska Zona | 12.000 RSD |
| 4 | Urbani Blok | 18.000 RSD |
| 5 | Prigradska Arena | 25.000 RSD |
| 6 | Rečni Brod | 30.000 RSD |
| 7 | Avala Predgorje | 45.000 RSD |
| 8 | Avala Open-Air | 80.000 RSD |

---

## Career Progression Table

| Rang | Naziv | Uslov za otključavanje | Dostupni venui |
|------|-------|----------------------|----------------|
| 0 | Asistent | Start | Šumski Sat |
| 1 | Junior Promoter | Level 1 završen, bilo koji rep ≥ 30 | + Rečna Obala |
| 2 | Lokalni Heroj | Level 2 završen, obe rep ≥ 40 | + Industrijska Zona |
| 3 | Organizator | Level 3 završen, ukupna rep ≥ 90 | + Urbani Blok |
| 4 | Regionalni Promoter | Level 4 završen, ukupna rep ≥ 110 | + Prigradska Arena |
| 5 | Regionalni Menadžer | Level 5 završen, Publika Rep ≥ 60 | + Rečni Brod |
| 6 | Ekspert za Zvuk | Level 6 završen, 0 shutdownova ukupno | + Avala Predgorje |
| 7 | Avala Legenda | Level 7 završen, obe rep ≥ 70 | + Avala Open-Air |
| 8 | Prestiž — Hard Mode | Sve 8 nivoa, prosek happiness ≥ 75% | Hard Mode unlock |

### Hard Mode modifikatori
- Sused limit: 65 dB (umesto 70 dB)
- Bez permit opcije
- Vjetar 2x češći
- Complaint cooldown: 5 sekundi (umesto 10)
- Ticket price: isti, ali rental cost +50%

---

## Venue Table (8 nivoa)

| # | Naziv | Površina (m²) | Kapacitet | Sused (m) | Reflection | Vjetar | Slot | Permit dostupan |
|---|-------|--------------|-----------|-----------|------------|--------|------|------------------|
| 1 | Šumski Sat | 2.000 | 200 | 150 | +4 dB (gusta šuma) | Ne | 20:00–00:00 | Da |
| 2 | Rečna Obala | 3.500 | 400 | 200 | +3 dB (reka) | Da (povetarac) | 21:00–02:00 | Da |
| 3 | Industrijska Zona | 5.000 | 800 | 100 | +8 dB (beton) | Ne | 22:00–04:00 | Da |
| 4 | Urbani Blok | 4.000 | 600 | 80 | +8 dB (beton) | Ne | 22:00–03:00 | Da |
| 5 | Prigradska Arena | 8.000 | 1.500 | 300 | +2 dB (mešovito) | Da (srednji) | 21:00–04:00 | Da |
| 6 | Rečni Brod | 1.500 | 300 | 250 | +3 dB (reka) | Da (bura moguća) | 22:00–05:00 | Ne |
| 7 | Avala Predgorje | 12.000 | 2.500 | 400 | +6 dB (dolina) | Da (bura) | 20:00–05:00 | Da |
| 8 | Avala Open-Air | 20.000 | 5.000 | 500 | +5 dB (mešovito) | Da (bura moguća) | 20:00–06:00 | Da |

### Zone layout per venue

**Standardni layout (Level 1–4):**
- Zone A: Main Stage (izvor 1)
- Zone B: Fill Zone (izvor 2)
- Zone C: Buffer
- Zone D: Neighbor measurement point

**Napredni layout (Level 5–8):**
- Zone A: Main Stage (izvor 1)
- Zone B: Side Fill (izvor 2)
- Zone C: Delay Tower (izvor 3, opcioni)
- Zone D: Buffer
- Zone E: Neighbor measurement point
- Zone F: Secondary neighbor (ako postoji)

---

## Timing i pacing po minutama

### Per-event vremenski tok (simulirano, kompresovano)

| Simulirano vreme | Real vreme | Događaji |
|-----------------|------------|----------|
| 20:00–22:00 | 0–1 min | Warm-up. SPL limit: 85 dB. Vjetar check. Postavljanje zona. |
| 22:00–23:00 | 1–2 min | Rast publike (+30% kapaciteta). Happiness threshold aktivan. |
| 23:00–01:00 | 2–5 min | Prime Time. Publika traži više SPL. Dinamički eventi počinju. |
| 01:00–02:00 | 5–7 min | Peak. Happiness threshold +10%. Inspekcija moguća (30% šansa). |
| 02:00–04:00 | 7–10 min | Closing. SPL mora početi da pada. Vjetar evento češći. |
| 04:00+ | 10–12 min | Wrap-up. Rezultat. Rep i budžet update. |

### Dinamički eventi tabela (minimum 5 per venue)

| Event tip | Trigger uslov | Efekat | Trajanje |
|-----------|--------------|--------|----------|
| Vjetar zaokreće | Random, 23:00–04:00 | wind_factor +2 prema susedu, 60s | 60 sec |
| Publika spike | 01:00 prime time | Happiness threshold +10%, 120s | 120 sec |
| Inspekcija | Random 01:00–03:00, 30% šansa | Neighbor limit -5 dB za 30s (inspector merenje) | 30 sec |
| Kvar opreme | Random, jednom per event | Jedna zona gubi -10 dB izlaz, treba korekcija | Dok se ne ispravi (max 45s) |
| Media arrival | Level 5+, random | Happiness bonus +15% na kraju ako nema shutdowna | Ostatak eventa |
| Susedu se probudi dete | Level 3+, 23:30 | Neighbor limit -3 dB za 90s | 90 sec |
| Kišni pljusak | Level 2, 6 (reka/brod) | reflection_bonus -2 dB, vjetar menja smer | 120 sec |
| DJ zahtev | Level 4+, 01:30 | DJ traži +5 dB na main stage, igrač odlučuje | 30s za odluku |

---

## Win/lose definicija za svaki layer

### Micro layer (L1 — core, per-event)

| Metrika | Win | Borderline | Lose |
|---------|-----|------------|------|
| Neighbor SPL | ≤ 70 dB tokom cele noći | 70–72 dB (1-2 complaint) | > 72 dB, 3+ complaints |
| Happiness @ end | > threshold po nivou | threshold ± 5% | < threshold - 5% |
| Complaints ukupno | 0–2 | 3–5 | 6+, ili shutdown |
| Event completion | Bez shutdowna | — | Shutdown = instant lose |

**Happiness threshold po nivou:**

| Level | Threshold |
|-------|----------|
| 1 (Šumski Sat) | 60% |
| 2 (Rečna Obala) | 62% |
| 3 (Industrijska Zona) | 65% |
| 4 (Urbani Blok) | 67% |
| 5 (Prigradska Arena) | 70% |
| 6 (Rečni Brod) | 72% |
| 7 (Avala Predgorje) | 75% |
| 8 (Avala Open-Air) | 80% |

### Macro layer (L2 — per-season)

| Metrika | Win | Lose |
|---------|-----|------|
| Budžet na kraju sezone | > 0 RSD | ≤ 0 RSD = bankrot |
| Prosečan event profit | > rental cost | < rental cost za 3 uzastopna eventa |

### Meta layer (L3 — karijera)

| Metrika | Win | Lose |
|---------|-----|------|
| Publika Rep | ≥ 50 na kraju Level 8 | < 30 (ne možeš otključati sledeći level) |
| Komšijska Rep | ≥ 50 na kraju Level 8 | < 30 (ne možeš otključati sledeći level) |
| Ukupna karijera win | Obe rep ≥ 50, Level 8 završen | — |

---

## Balance tablice

### Audio oprema upgrade tree (minimum 20 stavki)

| # | Naziv | Cena (RSD) | Efekat | Dostupno od |
|---|-------|-----------|--------|-------------|
| 1 | Starter PA System (500W) | Start | source_db max 95 dB | Level 1 |
| 2 | Subwoofer Add-on | 15.000 | +5 dB bass, happiness +5% | Level 1 |
| 3 | Fill Speaker (pasivni) | 8.000 | Dodaje 2. zonu bez dodatnog izvora SPL | Level 1 |
| 4 | Digital Mixer Upgrade | 12.000 | Preciznost slajdera: 0.5 dB step (umesto 1 dB) | Level 2 |
| 5 | Monitoring Package | 10.000 | Prikazuje real-time neighbor SPL broj | Level 2 |
| 6 | Acoustic Barrier Panel (×2) | 20.000 | reflection_bonus -2 dB prema susedu | Level 2 |
| 7 | 1kW Active System | 25.000 | source_db max 100 dB | Level 3 |
| 8 | Line Array (single hang) | 45.000 | Fokusiraniji zvuk: -3 dB bočno rasipanje | Level 3 |
| 9 | Delay Tower | 18.000 | 3. zona bez punog SPL rasta | Level 3 |
| 10 | Noise Permit (jednokratni) | 5.000 | Limit za taj event: 75 dB (noć) | Po evtu |
| 11 | Wind Sensor | 8.000 | 10s advance warning pre wind eventa | Level 4 |
| 12 | Crowd Monitor Software | 15.000 | Happiness vidljiv u realnom vremenu | Level 4 |
| 13 | 2kW System | 50.000 | source_db max 105 dB | Level 4 |
| 14 | Acoustic Barrier Panel (×4) | 35.000 | reflection_bonus -4 dB prema susedu | Level 4 |
| 15 | Line Array (dual hang) | 80.000 | -5 dB bočno, +3 dB usmereno ka dance flooru | Level 5 |
| 16 | Inspekcija Konsultant | 20.000 | -50% šansa inspekcije per event | Level 5 |
| 17 | 4kW System | 90.000 | source_db max 110 dB | Level 6 |
| 18 | Full Barrier Wall | 60.000 | reflection_bonus -6 dB prema susedu | Level 6 |
| 19 | Delay Tower Network (×3) | 55.000 | 4 zone bez centralnog SPL rasta | Level 6 |
| 20 | Pro Monitoring Suite | 30.000 | Prikazuje sve zone SPL + neighbor prediction | Level 7 |
| 21 | Festival Line Array | 150.000 | source_db max 115 dB, -7 dB bočno | Level 7 |
| 22 | Full Acoustic Engineering | 200.000 | reflection_bonus optimizovan automatski | Level 8 |
| 23 | Seasonal Noise Permit | 50.000 | Limit za celu sezonu: 75 dB (svi eventi) | Level 6 |
| 24 | PR Kampanja — Susedi | 25.000 | +5 Komšijska Rep odmah, jednokratno | Bilo koji level |

### Balans napomena

- SPL formula je deterministička — isti slider, isti teren = isti rezultat. Jedini randomnes su dinamički eventi.
- Dinamički eventi imaju seed baziran na datumu igranja (reproducibilni za leaderboard fair play)
- Happiness formula namenski raste sporije od SPL-a: duplo pojačanje ≠ duplo sretnija publika
- Neighbor SPL sabiranje (logaritamsko) znači da više izvora ne znači linearno veći problem — ali znači kumulativni rast koji igrači moraju naučiti

### Prestiž aktivacija

- Uslov: Level 8 završen, prosečna happiness po svim eventima ≥ 75%, 0 career shutdownova
- Otključava: Hard Mode, global leaderboard pristup, Avala easter egg (Kluboslavija audio fragment)
- Hard Mode: isti venui, 65 dB limit, bez permit-a, vetar 2x češći
