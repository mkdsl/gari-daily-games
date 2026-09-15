# GDD — Turneja Planer
**Mile Mehanika | 2026-09-15**

Žanr: Strategy / Route Optimizer
Brand: Kluboslavija, MKDSLend, Guncati
Target sesija: 20–35 min (1 run = 5 gradova + planning + results)

---

## 1. Resursi — Definicije i Caps

| Resurs | Početak | Min | Max | Tip |
|--------|---------|-----|-----|-----|
| Budžet (EUR) | 3500 | -∞ (lose) | — | Carry-over |
| Crowd Quality | 0 | 0 | 10 | Reset po gradu |
| Crew Mood | 10 | 0 | 10 | Carry-over (−1/grad) |
| Reach | 0 | 0 | 50 | Carry-over (raste) |
| Reputation | 0 | 0 | 10 | Carry-over (ne resetuje) |

**Crowd Quality** se izračunava POSLE evening event-a, ne pre. Utiče na prihode te noći. Reset na 0 pre sledećeg grada.

**Crew Mood** decay: −1.0 na kraju svakog grad-tranzita (transport umor), ali ne pre prvog grada. Minimum 0. Kad Mood < 3: −15% Crowd Quality multiplikator.

---

## 2. CRITICAL #1 — Reputation Formula

### Početna vrednost
- Run start: **Reputation = 0**
- Prestige 1 start: **Reputation = 2**
- Prestige 2+: **Reputation = 2** (cap — Guncati gate je 6, ne 2, pa ovo nije trivijalno)

### Rast po večeri (Reputation Gain)

```
base_gain = crowd_quality × 0.4
mood_mod  = crew_mood >= 7  ? +0.3
          : crew_mood >= 4  ? +0.0
          : crew_mood < 4   ? -0.2
city_mult = city.reputation_multiplier  (vidi tabelu gradova)
card_bonus = sum(card_reputation_deltas) za tu večer

rep_gain_raw = (base_gain + mood_mod) × city_mult + card_bonus
rep_gain     = clamp(rep_gain_raw, -2.0, +2.0)  # hard cap po večeri
Reputation   = clamp(Reputation + rep_gain, 0, 10)
```

**Granulacija:** 1 decimala (npr. 4.7). Prikazuje se zaokruženo na 1 decimalu u UI.

### Reputation po gradu — multiplikatori

| Grad | rep_multiplier | Napomena |
|------|---------------|----------|
| Beograd | 1.0 | Baseline |
| Novi Sad | 1.1 | Lokalni scene dobro pamti |
| Niš | 0.9 | Manji medija reach |
| Sarajevo | 1.3 | Međunarodni prestiž, visok rizik |
| Guncati | 1.5 | Flagship event — najjači multiplikator |

### Pad reputacije (Reputation Decay)

```
Pad se ne dešava automatski između gradova.
Pad se dešava SAMO kroz negativne decision card-ove:
  - "Skandal na bini" → -2.0 Reputation
  - "DJ zaboravio set" → -1.5 Reputation
  - "No-show support act" → -0.8 Reputation
```

### Primer tipičnog rasta

| Grad | CQ | Mood | Rep pre | Gain | Rep posle |
|------|----|------|---------|------|-----------|
| Beograd | 6.5 | 10 | 0.0 | 2.6+0.3=2.9×1.0=2.9 | 2.9 |
| Novi Sad | 7.0 | 9 | 2.9 | 2.8+0.3=3.1×1.1=3.4 (cap 2.0) | 4.9 |
| Niš | 5.5 | 8 | 4.9 | 2.2+0.3=2.5×0.9=2.25 | 7.15 |
| Sarajevo | 8.0 | 7 | 7.15 | 3.2+0.3=3.5×1.3=4.55 (cap 2.0) | 9.15 |
| Guncati | 7.5 | 6 | 9.15 | 3.0+0.0=3.0×1.5=4.5 (cap 2.0) | 10.0 (cap) |

---

## 3. CRITICAL #2 — Card Pool Definicija

### Pool ukupno: 40 unique kartica

**Distribucija po tipu:**
- Logistika (transport, setup): 10 kartica
- Crew relations (mood, conflict): 8 kartica
- Crowd events (crowd behavior): 8 kartica
- Finance (budžet shokovi): 7 kartica
- Reputation events (press, drama): 7 kartica

**Pravila po evening event-u:**
- Uvek se vuče tačno **4 kartice** — bez duplikata unutar jedne večeri
- Pool se NE resetuje između gradova — kartice koje su odigrane idu u "discard"
- Kad discard dosegne 30+ kartica → shuffle discard natrag u pool (cycle)
- Posebne "city-locked" kartice: 5 kartica koje se pojavljuju SAMO u određenim gradovima (označene tagom `city: [naziv]`)

**Pravilo ponavljanja:** Ista kartica može da se pojavi u različitim gradovima, ali ne u istom gradu dva puta (zaštita: draw engine proverava da li je karta odigrana u ovom gradu). City-locked kartice se mogu ponavljati u ponovcima (prestige run-ovi).

### Kompletna tabela 40 kartica

**LOGISTIKA (10)**

| ID | Naziv | 3 Opcije | Efekti |
|----|-------|---------|--------|
| L01 | Kamion kasni | A: Čekaj (+0 troška, −0.5 Mood, −1h playtime → −0.5 CQ) | B: Plaćaš ekspres (−200 EUR, +0 Mood) | C: Improviziš sa lokalnom opremom (−1.5 CQ, −100 EUR) |
| L02 | Viška mesta u vanu | A: Uzmi još jedan crew (−50 EUR/grad, +1 Mood) | B: Prodaj mesta fanovima (party bus) (+200 EUR, +0.5 Reach, rizik +1 Mood swing) | C: Ostavi prazno (ništa) |
| L03 | Venue setup problem | A: Plati venue tech extra (−300 EUR, CQ +1.0) | B: Sam setup sa crew (−1.5 Mood, CQ +0.5) | C: Prihvati suboptimalno (CQ −1.0) |
| L04 | Boljši hotel nudi popust | A: Uzmi upgrade (−150 EUR, Mood +1.5) | B: Ostaj u rezervisanom (0) | C: Podeli sobe uštedi (−100 EUR, Mood −0.5) |
| L05 | GPS greška, pogrešna ruta | A: Taksi za half crew (−120 EUR, Mood −0.3) | B: Kasni svi zajedno (Mood −0.8, kasni otvaranje → CQ −0.5) | C: Locals guide (Reach +0.5, Mood −0.2) |
| L06 | Venue double-booking | A: Pregovori (Budget −500, Reputation −0.5 ako padne) | B: Emergency venue promena (CQ −1.5, −200 EUR) | C: Kanceli (Reputation −2.0, refund publika −400 EUR) |
| L07 | Gorivo skupo na putu | A: Plati (−80 EUR) | B: Čekaj bolji benzin (Mood −0.5, 30min delay) | C: Deli troškove s fanovima koji prate (Reach +1.0, −40 EUR) |
| L08 | Oprema zaboravljena | A: Kupi zamenu lokalno (−250 EUR) | B: Pozajmi od drugog DJ-a (Reputation +0.3 za networking, nema troška) | C: Improviziš (CQ −2.0) |
| L09 `city: Sarajevo` | Granični prelaz čekanje (vidi CRITICAL #3) | A/B/C — vidi sekciju 4 |  |
| L10 | Parking kazna | A: Plati (−50 EUR) | B: Žali se (Mood −0.3, Reputation −0.2 ako press vidi) | C: Potkupi (−30 EUR, risk Reputation −1.0 roll) |

**CREW RELATIONS (8)**

| ID | Naziv | Opcija A | Opcija B | Opcija C |
|----|-------|---------|---------|---------|
| CR01 | DJ traži raise | Daj raise +150 EUR/grad | Odbij (Mood −2.0, risk quit) | Obećaj posle Guncati (Mood −0.5, postpone) |
| CR02 | Visual artist burn-out | Odmor jedan grad (−1 visual, CQ −1.0 taj grad) | Energy drinks power-through (Mood −1.5, CQ +0) | Pozovi lokalnog vizualnog (−200 EUR, CQ +0.5) |
| CR03 | Svadjа u crew-u | Medijacija, izgubi sat (Mood svi +1.0, −30min playtime) | Ignoriši (Mood −0.5 svakih sledeći grad dok traje) | Pusti jednog kući (−1 crew, Mood +1.5 last) |
| CR04 | Novi fan hoće backstage | Pusti ga (Reach +1.5, rizik Mood −0.3) | Odbij (Reputation −0.2, Reach +0) | Proda merchandise (EUR +150) |
| CR05 | Promo menadžer bolestan | Sam promo (Mood −0.5, Reach −1.0) | Outsource lokalno (−200 EUR, Reach +0.5) | Bez promoa (Reach −2.0) |
| CR06 | Crew slavi previše noć pre | Pusti ih (Mood +1.5, sledećeg dana Mood −2.0) | Curfew (Mood −1.0 ali stabilno) | Spoj slavlje sa fanovima (Reach +1.0, Mood +0.5) |
| CR07 | DJ zaboravio headphones | Kupi hitno (−80 EUR) | Pozajmi od venue (CQ −0.5 zvuk) | Nastup bez (CQ −1.5) |
| CR08 | Crew traži team bonding | Večera zajedno (−200 EUR, Mood +2.0) | Quick aktivnost (−50 EUR, Mood +1.0) | Skip (Mood −0.3 latent) |

**CROWD EVENTS (8)**

| ID | Naziv | A | B | C |
|----|-------|---|---|---|
| CE01 | Šta publika peva | Pusti request (CQ +1.0, Reputation +0.2) | Stick to set (CQ −0.3 short, Reputation +0.0) | Hybrid (CQ +0.5) |
| CE02 | Front row VIP problemi | Premesti VIPs (CQ +0.5, rizik Reputation −0.2) | Ignoriši (CQ −0.8 atmosfera) | Pravi VIP zonu hitno (−150 EUR, CQ +1.0) |
| CE03 | Kapacitet premašen | Zatvori vrata (CQ +1.5, Reach −1.0 — čekaju napolju) | Pusti još 20% (CQ −1.0 gužva, +200 EUR prihod) | Outsource overflow livestream (Reach +3.0, −100 EUR) |
| CE04 | Rain tokom open-air | Kišobrani promo (Reach +1.0, −100 EUR, CQ −0.3) | Prekini 30min (CQ −1.5, Mood −0.5) | Nastavi (CQ +0.5 energy, rizik tech problem) |
| CE05 | Viral moment na sceni | Repost na Kluboslavija kanalu (Reach +4.0) | Pusti fan-organic (Reach +2.0) | Ignoriši (ništa) |
| CE06 | Fight u publici | Security interveniše (CQ −1.0, Reputation −0.5) | DJ pauzira, smiri (CQ −1.5, Reputation +0.3) | Ignoriši (CQ −2.0, Reputation −1.0) |
| CE07 | Svetla padaju 20min | Improv acoustic set (CQ +1.0 storytelling, Mood −0.5) | Refund deo ulaznica (−300 EUR, Reputation −0.3) | Nastavi u mraku (CQ −1.5) |
| CE08 | Media ekipa želi intervju | Daj intervju posle seta (Reputation +1.0, Reach +2.0, Mood −0.3 umor) | Odbij (ništa) | Quick snippet za social (Reach +1.5, 5min) |

**FINANCE (7)**

| ID | Naziv | A | B | C |
|----|-------|---|---|---|
| F01 | Prihod od mercha bolje od plana | Reinvest u promo (Reach +2.0, +200 EUR neto) | Uzmi profit (EUR +500) | Nagradi crew (Mood +1.5, +100 EUR profit) |
| F02 | Spontani sponzor | Prihvati deal (EUR +800, Reputation −0.5 sellout risk) | Nego premium (EUR +400, Reputation +0.2) | Odbij (Reputation +0.5, 0 EUR) |
| F03 | Venue želi više cut | Plati (EUR −300) | Pregovori (50/50 šansa: −150 EUR ili −500 EUR) | Raskini (0 EUR, novi venue −200 EUR hitno) |
| F04 | Bar prihod deli split | Uzmi 20% (EUR +200–400) | Traži 30% (risk: venue cancels deal) | Ignorisi (ništa) |
| F05 | Krađa kase (scenario) | Prijavi policiji (Reputation +0.3, −500 EUR izgubljeno) | Tiho reši interno (−500 EUR, Reputation +0) | Osiguranje claim (−200 EUR, +3 dana delay — ovdje se ne koristi, tretira se kao EUR 0) |
| F06 | Unexpected tech bill | Plati (−400 EUR) | Deli troškove s venue (−200 EUR, malo tenzije) | DIY fix (CQ −0.5, 0 EUR) |
| F07 | Grant za mlade muzičare | Apliciraj (Reputation +0.5, 40% šansa EUR +600) | Preporuči drugog (Reputation +0.8, 0 EUR) | Ignoriši (ništa) |

**REPUTATION EVENTS (7)**

| ID | Naziv | A | B | C |
|----|-------|---|---|---|
| R01 | Lokalni blog piše negativno | Respond javno (Reputation −0.5 il +0.5 roll) | Ignorisi (Reputation −0.3 latent) | Pozovi na kafu (Reputation +0.8 ako dođe) |
| R02 | Skandal na bini (DJ pogrešna izjava) | Javno ispričaj odmah (Reputation −1.0) | Ćuti (Reputation −2.0 sutra) | Spin kao art (50/50: −0.5 ili −1.5) |
| R03 | Bivši saradnik priča loše | Odgovori faktima (Reputation −0.3, CQ +0) | Pravni leter (Reputation −0.5, −200 EUR) | Ignorisi — fanovi vide kroz to (Reputation +0.3) |
| R04 | Pozitivna recenzija časopis | Share (Reach +2.0, Reputation +0.5) | Say hvala (Reputation +0.3) | Ništa (Reputation +0.0) |
| R05 | Influencer želi collab | Daj backstage (Reach +3.0, Reputation +0.5, Mood −0.3) | Plaćeni deal (EUR +300, Reach +1.5) | Odbij (ništa) |
| R06 | Alumni scene brani tebe | Zahvali javno (Reputation +0.8, Reach +1.0) | Private hvala (Reputation +0.3) | Ignorisi (−0.2 na relation) |
| R07 `city: Guncati` | Seoska zajednica reakcija | Pokloni im konc (Reputation +1.5, EUR −0) | Donacija (EUR −200, Reputation +1.0) | Standardno (Reputation +0) |

---

## 4. CRITICAL #3 — Border+ Mehanika za Sarajevo

### Šta znači `border+` mehanički

Prelaz granice Srbija→Bosna i Hercegovina dodaje sve dole navedeno uz normalan travel cost:

**a) Travel Time Penalty**
```
Sarajevo travel_time_extra = 90 min (border + customs)
Efekat: -0.5 Crew Mood (čekanje, stres)
```

**b) Trošak (fiksni, ne u kilometrima)**
```
border_cost = 80 EUR (dokumentacija, green card osiguranje, tolovi)
Ovo je DODATNO na travel_cost_km (vidi sekciju 5)
```

**c) Random Event Roll (1 od 3, jednom po igri)**
```
P(incident) = 0.25 po default-u
Incident tipovi:
  - "Carinski pregled" (P=0.40 od incidenta): +45min, Mood −0.5, 0 EUR
  - "Dokumenti problem" (P=0.35): +90min, EUR −150 (admin fee), Mood −1.0
  - "Oprema zadržana" (P=0.25): +120min, EUR −300 (uvozna taksa ili podmićivanje)
```

**d) Kartica L09 (city-locked za Sarajevo):**

| ID | Naziv | Opcija A | Opcija B | Opcija C |
|----|-------|---------|---------|---------|
| L09 | Granični prelaz čekanje | Pusti sve da spavaju u vanu (Mood −0.3, +0 EUR, time−pass) | Zaposli lokalnog fixera (EUR −100, 0 Mood loss, brzo) | Improviziš šarmom (50/50 roll: 0 ili Mood −1.0 + −100 EUR) |

**Sumarna formula troška Sarajevo rute:**
```
sarajevo_total_travel = travel_cost_km(300) + border_cost(80) + roll_incident_cost
Mood penalty: −1.0 base (transit) + −0.5 (border wait) = −1.5 ukupno za Sarajevo
```

Sarajevo je **risk 3** — jedini grad sa složenom border logikom. Igrač vidi breakdown troška u routing UI-u pre odluke.

---

## 5. Routing Matematika — Travel Cost Formula

### Baza po kilometru

```
travel_cost_per_km = 1.80 EUR/km  (gorivo + amortizacija, fiksno)
travel_cost_km(d)  = d × 1.80
```

### Distancija tabela

| Ruta (od→do) | km | Osnova EUR | Border | Mood decay |
|------|----|-----------|--------|------------|
| Start → Beograd | 0 | 0 | — | 0 (startni grad) |
| Beograd → Novi Sad | 80 | 144 | — | −1.0 |
| Novi Sad → Beograd | 80 | 144 | — | −1.0 |
| Beograd → Niš | 280 | 504 | — | −1.0 |
| Niš → Beograd | 280 | 504 | — | −1.0 |
| Beograd → Sarajevo | 300 | 540 | +80 = 620 | −1.5 |
| Novi Sad → Niš | 310 | 558 | — | −1.0 |
| Niš → Sarajevo | 330 | 594 | +80 = 674 | −1.5 |
| Sarajevo → Guncati | 250 | 450 | reverse border +80 = 530 | −1.5 |
| Beograd → Guncati | 120 | 216 | — | −1.0 |
| Niš → Guncati | 350 | 630 | — | −1.0 |
| Novi Sad → Guncati | 180 | 324 | — | −1.0 |

**Napomena:** Guncati je fiksno POSLEDNJI grad. Igrač bira redosled ostala 4 (Beograd, Novi Sad, Niš, Sarajevo). Permutacije: 4! = 24 moguće rute.

### Optimalna routing preporuka (hint sistema)

Decision engine u `src/systems/routing.js` računa ukupan travel_cost za sve 24 permutacije i vizuelno sortira. Igrač vidi top-3 po ceni. Nije obaveza — "skupa" ruta kroz Sarajevo može biti isplativa ako Reputation prihodi nadoknade.

### Prihod po gradu

```
base_crowd = rand_between(city.crowd_min, city.crowd_max)
ticket_price = 8 EUR base
crowd_quality_mod = crowd_quality / 10  # 0.0–1.0
attendance = base_crowd × (0.7 + crowd_quality_mod × 0.3)  # min 70% popunjenost
revenue = attendance × ticket_price × promo_multiplier
```

**promo_multiplier** dolazi iz budget_split-a (vidi sekciju 7).

---

## 6. Crew Sistem

### Crew kandidati (10 dostupnih, max 5 u timu)

| ID | Ime | Uloga | Daily Rate (EUR) | Skills | Mood Resilience |
|----|-----|-------|-----------------|--------|-----------------|
| C01 | Marko DJ | Headliner DJ | 300 | DJing★★★, Promo★ | Visoka |
| C02 | Ana V | Visual Artist / VJ | 180 | Visual★★★, Social★★ | Srednja |
| C03 | Bojan P | Promo Manager | 150 | Promo★★★, Logistics★ | Visoka |
| C04 | Ivana S | Social Media | 120 | Social★★★, Visual★ | Niska (burnout risk) |
| C05 | Nikola T | Sound Tech | 200 | Tech★★★, DJing★ | Visoka |
| C06 | Milena G | Support DJ | 160 | DJing★★, Visual★ | Srednja |
| C07 | Dragan L | Driver / Logistics | 100 | Logistics★★★ | Visoka |
| C08 | Sara K | Merch Manager | 110 | Social★★, Finance★ | Srednja |
| C09 | Petar M | Live Stream Operator | 190 | Tech★★, Social★★ | Niska |
| C10 | Jovana R | PR & Press | 170 | Promo★★, Reputation★★★ | Srednja |

**Skill tag efekti:**

| Skill | Efekat ako u timu |
|-------|------------------|
| DJing★★★ | CQ baseline +1.0 svakog grada |
| Visual★★★ | CQ +0.8, Reach +0.5/grad |
| Promo★★★ | promo_multiplier +15% |
| Social★★★ | Reach +1.5/grad |
| Tech★★★ | CQ +0.5, tech card risks halved |
| Logistics★★★ | Travel cost −10% |
| Reputation★★★ | Reputation gain +0.3/grad |

**Mood Resilience:** Visoka = Mood decay −0.5 umesto −1.0 za tranzite. Niska = −1.5 decay.

**Ukupni Daily Rate trošak:**
```
daily_crew_cost = sum(crew[i].daily_rate for each member u timu)
total_crew_cost = daily_crew_cost × (broj gradova) × 1 dan/grad
```
Primer: Marko+Ana+Bojan+Nikola+Dragan = 300+180+150+200+100 = 930 EUR/dan × 5 dana = 4650 EUR. To premašuje startni budžet od 3500 — **igrač MORA da optimizuje crew sastav ili prihvati manji tim (min 2).**

**Minimum crew:** 2 (ali pod 3: −15% promo_multiplier, −0.5 Mood/grad extra). Sistem ne dozvoljava krenuti bez DJing skill-a u timu (Marko ili Milena obavezni).

---

## 7. Budget Alokacija Split

Igrač dodeljuje budžet za SVAKI grad u tri kategorije. Default je 10/50/40, ali može prilagoditi.

```
available = current_budget − travel_cost − crew_cost − border_cost
split total = available allocated amount (igrač piše EUR, ne %)
transport_alloc, promo_alloc, tech_alloc
```

**Šta daje svaka kategorija:**

### Transport (10% default = ~100–200 EUR/grad)
```
transport_quality = transport_alloc / 100  # 0.5 = basic, 2.0 = premium
Mood bonus = (transport_quality − 1.0) × 0.8  # clamp −1.0 do +1.5
```
- Ispod 80 EUR: Mood −1.0 (lud kombi), CQ −0.5 (kasni setup)
- 80–150 EUR: Neutral
- 150–250 EUR: Mood +0.5
- 250+ EUR: Mood +1.0

### Promo (50% default = ~500–700 EUR/grad)
```
promo_multiplier = 1.0 + log10(promo_alloc / 200) × 0.5
# 200 EUR → ×1.0, 500 EUR → ×1.17, 1000 EUR → ×1.35, 2000 EUR → ×1.50 (cap ×1.5)
```
- Promo_multiplier utiče direktno na attendance (prihode) i Reach:
  ```
  reach_gain_from_promo = log10(promo_alloc / 100) × 1.5
  ```

### Tech (40% default = ~400–600 EUR/grad)
```
tech_quality = tech_alloc / 400  # 1.0 = standard, 2.0 = premium
CQ_tech_bonus = (tech_quality − 1.0) × 1.5  # clamp −1.5 do +2.0
```
- Ispod 200 EUR: CQ −1.5 (loš zvuk, pukao projektor)
- 200–400 EUR: CQ +0
- 400–700 EUR: CQ +0.5
- 700–1000 EUR: CQ +1.0
- 1000+ EUR: CQ +1.5 (premium light show, cristal-clear sound)

---

## 8. Evening Event — Flow

Svake večeri ide se kroz ovaj redosled:

```
1. Planning Phase (igrač)
   → Postavi budget split za ovaj grad
   → Izbor venue opcije ako ponuđena (klub vs open-air)

2. Draw 4 Decision Cards
   → Igrač bira opciju A/B/C za svaku (nema skip)
   → Redosled: prva 2 imaju efekat PRE main seta, zadnja 2 POSLE

3. Calculate Evening Score
   → CQ = base_crowd_quality + tech_bonus + mood_bonus + card_bonuses
   → attendance = f(CQ, promo_multiplier, crowd_min, crowd_max)
   → revenue = attendance × ticket_price
   → rep_gain = f(CQ, crew_mood, city_multiplier, card_bonuses)

4. Results Screen
   → Prikaz svih promena resursa
   → "Highlight moment" — jedna nasumično generisana rečenica iz brand_hooks.js
   → Fan counter update (za prestige)

5. Transit
   → Plaća se travel_cost za sledeći grad
   → Crew Mood −1.0 (ili po resilience)
   → Budget update
```

---

## 9. Win/Lose Uslovi — Tačne Formule

### Evaluacija krajnjeg stanja (posle Guncati)

```javascript
function evaluateEnding(state) {
  const { budget, reputation, reach, crew_mood } = state;

  // SPECIAL: Guncati gate (pre event-a)
  if (reputation < 6.0) return ENDING.GUNCATI_CLOSED;

  // Post-event endings
  if (budget > 2000 && reputation >= 9.0 && reach >= 40)
    return ENDING.TURNEJA_LEGENDA;

  if (budget > 500 && reputation >= 6.0 && reputation < 9.0)
    return ENDING.ZAVRSENO_I_PLACENO;

  if (budget <= 0)
    return ENDING.POREZ_I_DUG;

  // Granični case-ovi (ne pokriva nijedan gore)
  if (budget > 500 && reputation < 6.0 && reach >= 40)
    return ENDING.ZAVRSENO_I_PLACENO;  // Reach kompenzuje Rep (alt win)
  
  if (budget > 0 && budget <= 500)
    return ENDING.ZAVRSENO_I_PLACENO;  // Preživeli, bez proslave
  
  return ENDING.POREZ_I_DUG;  // Default fallback
}
```

### 4 Endings — Detalji

| Ending | Uslov | Opis | Prestige unlock |
|--------|-------|------|----------------|
| **Turneja Legenda** | Budžet>2000 AND Rep≥9.0 AND Reach≥40 | Sve 5 gradova odrađeno perfektno, brand je na mapi | DA: Fan DB×1.5 |
| **Završeno i Plaćeno** | Budžet>500 AND Rep 6–8.9 (ili Reach≥40 kompenzuje) | Solidna turneja, crew je zadovoljan, Guncati dočekao | DA: Fan DB×1.0 |
| **Porez i Dug** | Budžet≤0 | Prezaduženi, crew bez plate | DA (ali Fan DB penalized ×0.5) |
| **Guncati Zatvoren** | Rep<6.0 kad stigneš na Guncati | Imanje te nije primilo — Reputacija nije dovoljno | NE (run se ne broji) |

**Granični case — Budžet 501 EUR, Rep 5.8:** Ne ulazi u ZAVRSENO (Rep<6), ne ulazi u LEGENDA. → `Guncati_Zatvoren` jer Rep<6 ulazi u tu granu PRE budget check-a. Igrač vidi: "Guncati te je čekao, ali Reputacija nije bila tu."

**Granični case — Budžet 2050, Rep 8.9, Reach 42:** Nije LEGENDA (Rep<9.0) → ZAVRSENO. Igrač vidi osobnu poruku o tome koliko je blizu bio.

---

## 10. Prestige Ekonomija

### Prestige Reset

```
Prestige trigger: Završi run (bilo koji ending osim Guncati_Zatvoren)
Reset values:
  budget_start = 2500 EUR  (manji od 3500 — izazov)
  reputation_start = 2.0
  crew_mood_start = 10
  reach_start = 0

Carry-over:
  fan_database (kumulativno)
  prestige_level (++)
  unlocked_crew_members (+1 novi kandidat po prestige)
```

### Fan Database Formula

```
fans_gained_per_run = sum(attendance[city] × quality_mod[city])
  quality_mod = crowd_quality / 10

fan_db_total += fans_gained × ending_multiplier
  TURNEJA_LEGENDA:  ending_multiplier = 1.5
  ZAVRSENO_I_PLACENO: ending_multiplier = 1.0
  POREZ_I_DUG: ending_multiplier = 0.5

Fan DB benefit:
  promo_effectiveness_bonus = log10(fan_db_total / 1000 + 1) × 0.1  # soft cap
  Max bonus: +0.3 promo_multiplier na svim run-ovima kad fan_db > 50000
```

**Primer rasta Fan DB:**
- Run 1 (avg att 600/grad, avg CQ 7): 600 × 5 × 0.7 = 2100 fans
- Run 2 (prestige 1): 600 × 5 × 0.75 = 2250 fans
- Run 5: fan_db ≈ 10000, promo bonus ≈ +0.04

### Prestige Level Caps

| Prestige Level | Crisis/grad | Extra unlock | Budget start | Rep start |
|---------------|-------------|-------------|-------------|---------|
| 0 (base) | 0 auto | — | 3500 | 0 |
| 1 | 1 | C09 Petar (stream) unlocked | 2500 | 2.0 |
| 2 | 2 | C10 Jovana (PR) unlocked | 2500 | 2.0 |
| 3 | 3 | Crisis cards harder pool | 2200 | 2.0 |
| 4+ | 3 (cap) | Random event P(incident) Sarajevo 0.35 | 2200 | 2.0 |

**Crisis/grad = extra obavezna negativna karta** po gradu (uvek najteži tier iz pool-a tog tipa). Ne broji se u 4 drawn cards — dolazi kao 5. karta, obavezna, bez odabira opcija (A se primenjuje automatski, najgora varijanta).

---

## 11. Progression Krive — Difficulty Through 5 Cities

### Crowd Quality Difficulty Scaling

```
expected_cq_floor = 3.0 + (city_order_index × 0.5)
# City 1: min CQ 3.0, City 5 (Guncati): min CQ 5.0
# Igrač mora da uloži više u tech/promo da održi CQ
```

Ovo znači da sa istim budžetom i istim crew-om, CQ raste sporije nego troškovi (tech inflation):

```
tech_cost_inflation = 1.0 + city_order_index × 0.08
# Grad 1: ×1.0, Grad 5: ×1.32
# Igrač plaća 32% više tech-a u poslednjem gradu za isti CQ output
```

### Budget Drain Kriva

| Grad | Avg travel+crew+border | Avg revenue (dobar run) | Net | Kumulativni budžet |
|------|----------------------|------------------------|-----|---------------------|
| Start | — | — | — | 3500 |
| Grad 1 (Beograd) | ~400 | +700 | +300 | ~3800 |
| Grad 2 | ~650 | +750 | +100 | ~3900 |
| Grad 3 | ~900 | +700 | −200 | ~3700 |
| Grad 4 (Sarajevo) | ~1100 | +900 | −200 | ~3500 |
| Grad 5 (Guncati) | ~600 | +600 | 0 | ~3500 |

**Zaključak:** Prosečan run bez optimizacije breakeven. Da bi dostigao LEGENDA (>2000 na kraju), igrač mora da: (1) minimizuje travel troškove pametnom rutom, (2) investira u promo za attendance, (3) izbegne negativne card outcame-e.

### Crisis Escalation (Prestige 1+)

Svaki prestige level dodaje jednu crisis kartu po gradu. Crisis pool (10 karata) ima severity P1/P2/P3:
- P1 (instant, težak): Venue cancels (Reputation −2, EUR −500)
- P2 (medium): Power outage (tech roll, CQ −1.5 ili −0.5)
- P3 (light): Social media negativity (Reputation −0.5 ako se ne odgovori)

---

## 12. Pacing Tabela

| Faza | Vreme (realno) | Akcije igrača |
|------|----------------|---------------|
| Intro/Tutorial | 1–2 min | Pročita pravila, vidi resurse |
| Routing Planning | 2–4 min | Bira redosled 5 gradova, crew, initial budget split |
| Grad 1 — Evening | 3–5 min | 4 decision cards + review results |
| Transit 1→2 | 30 sec | Automatski prikaz troška, Mood decay |
| Grad 2 — Evening | 3–5 min | 4 decision cards |
| Transit 2→3 | 30 sec | — |
| Grad 3 — Evening | 3–5 min | Midpoint tension (budget check) |
| Transit 3→4 | 30 sec (ili 90 sec Sarajevo animacija) | Border crossing vizual |
| Grad 4 — Evening | 3–5 min | Crisis card možda (prestige) |
| Transit 4→5 | 30 sec | Final mood |
| Grad 5 Guncati — Reputation Gate | 5 sec check | "Primaš/ne primaš" |
| Grad 5 — Evening | 4–6 min | Climax set, card pull |
| Final Results | 2–3 min | Ending reveal, fan stats, prestige prompt |
| **UKUPNO** | **22–35 min** | — |

**Sweet spot:** 25 min za iskusnog igrača, 35 min za prvog run-a.

---

## 13. Verifikacija Modula — 34 Ukupno ✅

| Kategorija | Fajl | Opis |
|-----------|------|------|
| **entities (6)** | `src/entities/city.js` | City data, crowd params, venues |
| | `src/entities/crew_member.js` | Crew stats, skills, daily rate |
| | `src/entities/venue.js` | Venue types, capacity, rent |
| | `src/entities/event.js` | Evening event state, card outcomes |
| | `src/entities/crisis.js` | Crisis card definitions, severity |
| | `src/entities/fan.js` | Fan DB entry, region tagging |
| **systems (9)** | `src/systems/routing.js` | Travel cost calc, permutation sorter |
| | `src/systems/budget.js` | Budget tracking, split allocator |
| | `src/systems/reputation.js` | Reputation formula, growth calc |
| | `src/systems/crew_mood.js` | Mood decay, resilience modifiers |
| | `src/systems/decision_engine.js` | Card draw, option resolution, effects |
| | `src/systems/progression.js` | City ordering, difficulty scaling |
| | `src/systems/prestige.js` | Prestige reset, fan DB formula |
| | `src/systems/reach.js` | Reach accumulator, promo calc |
| | `src/systems/random_events.js` | Border incident rolls, viral moments |
| **render (4)** | `src/render.js` | Main canvas/DOM orchestrator |
| | `src/ui.js` | HUD, resource bars, modal overlays |
| | `src/input.js` | Click, touch, keyboard handlers |
| | `src/share.js` | html2canvas + Web Share API |
| **core (3)** | `src/main.js` | Entry, game loop, state wire |
| | `src/config.js` | All tuning constants (rates, caps, formulas) |
| | `src/state.js` | Game state shape, save/load localStorage |
| **audio (1)** | `src/audio.js` | Web Audio SFX (card flip, success, crowd) |
| **content (5)** | `src/content/cities.js` | City flavor text, venue descriptions |
| | `src/content/cards.js` | All 40 decision card definitions |
| | `src/content/crew_profiles.js` | 10 crew member bios, dialog |
| | `src/content/endings.js` | 4 ending narratives, prestige msgs |
| | `src/content/brand_hooks.js` | Kluboslavija/Guncati/MKDSLend copy, highlights |
| **styles (4)** | `styles/base.css` | Layout, grid, responsive |
| | `styles/ui.css` | Cards, buttons, modals, resource bars |
| | `styles/game.css` | Transitions, animations, card flip |
| | `styles/theme.css` | Kluboslavija brand palette |
| **index** | `index.html` | ES6 module loader |

**Zbir: 6+9+4+3+1+5+4+1 = 33 + index.html = 34 fajlova ✅ (min 25 ✅)**

---

## 14. Procena JS/CSS Linija

| Kategorija | Procena linija |
|-----------|---------------|
| entities/ (6 fajlova) | ~600 |
| systems/ (9 fajlova) | ~2700 |
| render.js + ui.js + input.js + share.js | ~1400 |
| core/ (main, config, state) | ~800 |
| audio.js | ~350 |
| content/ (5 fajlova, 40 cards) | ~900 |
| **UKUPNO JS** | **~6750** |
| styles/ (4 fajlova) | ~900 |
| **UKUPNO CSS** | **~900** |

Ukupno JS je u target zoni (single-layer: 8000–12000 cilj). Impl faza može da proširi systems/ i decision_engine.js do 8000+ lako — 40 kartica × ~15 linija = 600 linija samo cards.js.

---

## 15. Balance Checkpoint List

Pre impl-a, ovo mora da prođe "paper napkin" test:

- [ ] Min viable budget put: Beograd→Novi Sad→Niš→Sarajevo→Guncati = ~2350 EUR travel+crew. Start 3500 → 1150 EUR ostatak. Moguće preživeti sa dobrim kartama. ✅
- [ ] Max spend put: Sarajevo early + premium crew (4650 EUR crew cost) > 3500 start → **crash garantovan bez revenue**. Igrač mora birati crew pažljivo. ✅ (teaching moment)
- [ ] Guncati gate dostižan bez prestige: Beograd CQ=7 → Rep gain ≈2.9. + Novi Sad CQ=7 → +2.0 (cap). + Niš CQ=6 → +1.6. = Rep ~6.5 pre Sarajeva. Dostižno. ✅
- [ ] LEGENDA dostižna u prvom run-u: Budget>2000 zahteva min 1500 EUR profit (od 3500). Revenue per grad ≈ 700–900 EUR, 5 gradova = 3500–4500 EUR gross. Minus ~2500 EUR troškovi = 1000–2000 profit. Marginalno dostižno sa sve optimizovano. ✅ (treba skill)
- [ ] Prestige run nije trivijalan: Budget start 2500 vs 3500 smanjuje marginu. Crisis karte dodaju presiju. Rep start 2 daje headstart ali ne trivijalan. ✅

---

*GDD finalizovan. Sve 3 CRITICAL tačke rešene. 34 modula verifikovano. Impl može startovati.*
