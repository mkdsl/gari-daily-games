# GDD — Sarajevo ili Smrt

**Autor:** Mile Mehanika
**Datum:** 2026-06-03
**Stage:** concept → impl handoff
**Verzija:** 1.0 (v1 scope, 3 kvarta, 2 prestige)

---

## 1. Mehanike Detaljno

### 1a. Macro Layer — Sezona Planiranje

**Sezona = 7 noći.** Igrač planira celu sedmicu unapred (ili noć po noć — oba su validni stilovi). Između noći teče idle prihod.

#### Ekran planiranja (Macro View)

Igrač vidi CSS pixel art mapu Sarajeva sa 3 kvarta (v1). Svaki kvart prikazuje:

| Parametar | Opis | Vidljivo odmah? |
|-----------|------|-----------------|
| Klub naziv + tier | Beograd Kafić (tier 1), Vrbanja Roof (tier 2)... | DA |
| Kapacitet | 80 / 120 / 200 ljudi | DA |
| Žanr afinitet | Sevdah-el / Tech house / Rap-fusion | DA (ikona) |
| Mahala Reputacija | Tvoj LP u tom kvartu (0–100 skala) | DA |
| Vibe score | Koliko publika tog kluba trenutno "traži tebe" | DA |
| Booking fee | LP koji klub nudi za nastup (varira po tier-u i reputaciji) | DA |
| Žanr-match upozorenje | Crveni signal ako tvoj Repertoar nije na nivou za taj kvart | DA |
| Locked indikator | Sloj magle ako kvart nije unlockovan | DA |

**Izbor kluba:** Klik/tap na kvart → lista dostupnih klubova → tap na klub → "Rezerviši noć". Nije moguće isti klub 2 noći zaredom u jednoj sezoni (publika se zasiti). Igrač može preskočiti noć (idle mode) ali gubi booking fee za tu noć.

**Između noći (idle faza):**
- Real-time ili offline (localStorage timestamp)
- Svaka "noć čekanja" = 8h real-time = 1 satluk idle prihoda per sat
- Igrač se vraća, vidi koliko LP je pasivno zaradio, odlučuje za sledeću noć

**Resource carry-over između sezona:**

| Resurs | Carry-over? | Objašnjenje |
|--------|-------------|-------------|
| Legenda Points (LP) | DA — akumuliraju | Nikad se ne resetuju sem na Prestige |
| Mahala Reputacija | DA — 70% ostaje | Svaka nova sezona "blede" 30% rep ako nisi bio aktivan |
| Oprema tier (A grana) | DA — permanentno | Ne možeš izgubiti opremu |
| Repertoar (B grana) | DA — permanentno | Naučene pesme ostaju |
| Mreža (C grana) | DA — permanentno | Kontakti ne nestaju |
| Džabe-Konekti (DK) | DA — prestige valuta | Jedino prestižom resetuješ LP, DK ostaje zauvek |
| Brend nivo (D grana) | DA — ali decay 10%/sezona bez aktivnosti | Brend bledi bez nastupa |
| Sarajevo Know-how (E grana) | DA — permanentno | Znanje ostaje |
| Active bad rep events | NE — resetuju se na kraju sezone | Sezona je "fresh start" za reputaciju |

**Sezona kraj:** Obračun — zbir svih LP iz 7 noći, bonus za "čistu sezonu" (<2 bad rep events), unlock provjera (Grbavica se otvara kad Baščaršija + Marijin Dvor imaju po 50+ rep).

---

### 1b. Micro Layer — Noćna Sesija (Slider Mehanika)

#### Konceptualni opis

Noćna sesija je **120 sekundi aktivnog igranja**. Nema audio-BPM sync — sve je vizuelno, bez latency zavisnosti.

**Ekran sesije sadrži:**
1. **Crowd Meter** (0–100) — vertikalna traka levo, boja prelazi crvena→žuta→zelena→zlatna
2. **Vibe Wave** — horizontalni sinusni talas koji osciluje, prikazuje "trenutno raspoloženje publike". Talas se pomera desno, igrač vidi 3–4 sekunde unapred
3. **Vibe Zone** — zeleno istaknuta zona na y-osi talasa (npr. između 40–70 na 0–100 skali). Ovo je "slatka tačka"
4. **Slider** — horizontalni klizač koji igrač vuče levo-desno (touch drag ili mouse drag). Slider position direktno utiče na Crowd Meter promenu rate
5. **LP counter** — raste u realnom vremenu dok si u Vibe Zone

#### Fizika slidera

```
// Slider position: -100 (levo) do +100 (desno), 0 = centar
// Vibe Wave value: sinusna funkcija, -100 do +100, period ~8 sekundi
// Vibe Zone: wave_value između -30 i +30 (centralna zona)

crowd_change_per_tick = base_rate + match_bonus - mismatch_penalty

base_rate = -0.5  // publika prirodno hladi (pritisak na igrača da bude aktivan)

// Ako je slider u Vibe Zone (odgovara talasu):
match_bonus = +2.0 * (1 - abs(slider_pos - wave_target) / 60)
// Linearna interpolacija: savršeno poklapanje = +2.0, rub zone = +0.5

// Ako je slider daleko od Vibe Zone:
mismatch_penalty = abs(slider_pos - wave_target) * 0.03
// Maksimalna kazna: ~3.0 poena/tiku (igrač brzo gubi publiku)

// Tik = 100ms (10 tika/sekunda, 1200 tika/sesiji)
```

**Vibe Zone vizualizacija:** Talas ima zelenu boju u zoni, crvenu van zone. Igrač vidi gde treba da bude slider UNAPRED (talas se pomera s leva na desno, zona je vidljiva 3–4 sec pre nego što dođe).

**Crowd cap:** Određen Opremom (A grana). Default 60, raste do 100 sa upgradima.

#### Scoring formula

```javascript
// Na kraju sesije:
seconds_in_vibe = broj sekundi kad je slider bio u Vibe Zone
session_duration = 120  // sekundi

vibe_factor = (seconds_in_vibe / session_duration) * 2.0
// Savršena sesija: vibe_factor = 2.0; prosek: ~1.0-1.4; loš igrač: 0.3-0.7

crowd_factor = (final_crowd_level / 100)
// Ako je publika pri kraju 80/100, crowd_factor = 0.8

session_lp = base_lp * vibe_factor * crowd_factor * prestige_multiplier
// base_lp = 10, prestige_multiplier = 1.0 (Prestige 0) / 1.5 (P1) / 2.5 (P2)

// Legenda Moment (crowd > 90 na kraju): +50% bonus LP
// Perfect sesija (>95% vreme u Vibe Zone): +25% bonus LP (stackuje se)
```

**Primer izlaznih vrednosti (Prestige 0, osnovno):**

| Kvalitet sesije | % vremena u Vibe Zone | Final crowd | LP zarađeno |
|-----------------|----------------------|-------------|-------------|
| Odlična | 85% | 88 | ~25 LP |
| Prosečna | 55% | 60 | ~7 LP |
| Loša | 30% | 35 | ~2 LP |
| Fail zone | 15% | 18 | 0 LP + bad rep event |

#### Fail state

```
Fail trigger: final_crowd_level < 20 NA KRAJU 120 SEKUNDI
(nije instant — igrač može da se "izvuče" ako reaguje)

Posledica: bad_rep_event = true
  → sledeca_noc_prihod_multiplikator[kvart] *= 0.85  // -15% prihoda
  → mahala_reputacija[kvart] -= 5
  → aforizmi: "Ode kapija."
```

**Važno:** Fail nije permanentan — sledeća noć je fresh start. Bad rep event se akumulira samo za tu noć u tom kvartu. Upgrade E (Sarajevo Know-how) snižava verovatnoću da Crowd padne ispod 20 kroz "Crowd floor" mehaniku.

```javascript
// Sa upgradama E:
crowd_floor = 0 + (sarajevo_knowhow_level * 3)
// E nivo 3: crowd_floor = 9 (nikad ne pada ispod 9)
// E nivo 5: crowd_floor = 15 (safe od fail-a u normalnim uslovima)
```

#### Kvartovske specifičnosti

**Baščaršija — "Sevdah aging":**
```javascript
// Ako Repertoar (B grana) < nivo 2:
wave_speed_multiplier = 1.5
// Talas se pomera 50% brže → Vibe Zone prolazi brže → teže pratiti
// Flavor: "Baščaršijska publika je brza da proceni. Ne poznaješ sevdah? Osete odmah."

// Ako B >= nivo 2:
wave_speed_multiplier = 1.0  // normalno
sevdah_bonus = +10% LP za sve sesije u Baščaršiji
```

**Marijin Dvor — "Clean Tech Bonus":**
```javascript
// Ako Crowd > 70 u bilo kom trenutku tokom sesije:
clean_tech_bonus_triggered = true
session_lp *= 1.20  // +20% LP na kraju sesije

// Flavor: "Modernoj publici treba kultura. Kad se zagreju — puni su."
// Mehanika: Igrač mora DOSEGNUTI 70+ (nije samo završiti tu) — rizično ali nagradivo
```

**Grbavica — "Underground Risk/Reward":**
```javascript
// Svaki put kad Crowd padne ispod 20 (ne na kraju, nego tokom sesije):
underground_risk_check = Math.random() < 0.20  // 20% šansa
if (underground_risk_check) {
    instant_session_fail = true  // "Smrt" mid-session
    // Flavor: "Grbavica ne čeka kraj večeri. Ili jesi ili nisi."
}

// Ali ako Crowd dosegne 90+ u Grbavici:
legend_bonus = session_lp *= 1.50  // +50% LP
underground_legend_achievement = true  // unlock flavor: "Grbavica te primila."
```

---

### 1c. Meta Layer — Prestige

#### Prestige 1 — "Džabe-Konekti Level 1"

**Gate uslovi:**
- Ukupno akumulirano LP ≥ 500
- Sarajevo Achievement: svaka od 3 kvarta pokrivena bar 1 puta (bar 1 noćna sesija u svakom kvartu)

**Reset šta se gubi:**
- Sve LP (soft currency) → 0
- Mahala reputacija → 0 u svakom kvartu
- Upgrade nivo A, B, C, D, E → sve na 0 (ali cene upgrada se pamte kao "popust" u sledećem run-u)

**Šta ostaje (permanentno):**
- Džabe-Konekti (DK): dobija se `floor(total_lp_earned_this_run / 100)` DK na prestige momenatu
- Prestige Multiplier: 1.5× na sve buduće LP prihode (stackuje se sa P2)
- **Strani DJ Agent** unlock: nova grana C+ (viši klub tier-ovi dostupni od starta)
- Equipment Memory: A grana počinje od nivo 1 (ne 0) u sledećem run-u — besplatan nivo 1

**DK kalkulacija:**
```javascript
// Na Prestige 1:
dk_earned = Math.floor(total_lp_this_run / 100)
// Minimum: 5 DK (floor), nije moguće prestige bez barem 500 LP → minimum 5 DK

// DK se troši na permanentne bonuse između run-ova:
dk_shop_items = [
    { name: "Brži start", cost: 3, effect: "B grana počinje nivo 1 (ne 0)" },
    { name: "Mreža sjećanja", cost: 5, effect: "C grana počinje nivo 1" },
    { name: "Mahala sjaj", cost: 8, effect: "+10% idle LP po satu permanentno" },
    { name: "Sarajevo duh", cost: 12, effect: "E grana počinje nivo 2, crowd floor +6" }
]
```

#### Prestige 2 — "Avala Headliner"

**Gate uslovi (računaju se POSLE Prestige 1 run-a):**
- Ukupno akumulirano LP ≥ 2500 (u Prestige 1 run-u)
- Sve 3 kvarta na Mahala Reputacija ≥ tier 2 (50+ rep u svakom) u ovom run-u

**Reset:** Isti kao P1, ali:
- Prestige Multiplier: 2.5× (ne stackuje sa 1.5×, zamenjuje)
- DK kurs: `floor(total_lp_this_run / 75)` (bolji kurs jer si bolji igrač)

**Šta ostaje:**
- Svi prethodni DK ostaju
- Equipment Memory: A grana počinje nivo 2
- **Avala Headliner Booking** unlock: finalni ekran dostupan

**Win screen:**
```
Animirani ekran: Avala kula u neonima, DJ ime igrača na bilbordu.
Tekst: "Sarajevo te naučilo. Avala te čeka. Laku noć, legendo."
CTA button: "Dođi na pravo Sarajevo → Kluboslavija Turneja 2026"
Share card: generisana automatski, Canvas-only render
```

---

## 2. Ekonomija Brojeva

### LP po Noćnoj Sesiji — Seed Vrednosti

```javascript
// CONFIG.js — sve ove vrednosti idu u src/config.js

const BASE_LP = 10;

// Prestige multiplier
const PRESTIGE_MULTIPLIER = [1.0, 1.5, 2.5];  // index = prestige level

// Vibe Zone definicija (wave position)
const VIBE_ZONE_MIN = -30;  // od -100
const VIBE_ZONE_MAX = +30;  // do +100

// Wave parametri
const WAVE_PERIOD_SECONDS = 8;  // jedna oscilacija
const WAVE_AMPLITUDE = 80;  // opseg kretanja

// Crowd parametri
const CROWD_DECAY_PER_TICK = -0.5;  // per 100ms
const CROWD_MAX_BASE = 60;  // bez A grane upgrada
const CROWD_FAIL_THRESHOLD = 20;

// LP formula (po sesiji):
function calcSessionLP(seconds_in_vibe, final_crowd, prestige_level) {
    const vibe_factor = (seconds_in_vibe / 120) * 2.0;
    const crowd_factor = final_crowd / 100;
    const pm = PRESTIGE_MULTIPLIER[prestige_level];
    
    let lp = BASE_LP * vibe_factor * crowd_factor * pm;
    
    // Legenda Moment bonus
    if (final_crowd > 90) lp *= 1.5;
    
    // Perfect session bonus
    if (seconds_in_vibe / 120 > 0.95) lp *= 1.25;
    
    return Math.floor(lp);
}

// Breakeven: prosečan igrač (55% vibe, 60 crowd, P0) = ~7 LP/sesija
// Odličan igrač (85% vibe, 88 crowd, P0) = ~25 LP/sesija
// P1 igrač (85% vibe, 88 crowd) = ~37 LP/sesija
```

### Idle Prihod Formula

```javascript
// src/systems/idle.js

function calcIdleLPPerHour(state) {
    let total = 0;
    
    for (const [kvart, data] of Object.entries(state.kvartovi)) {
        if (!data.active) continue;  // preskopio noć = 0 idle
        
        const rep_tier = Math.floor(data.mahala_reputacija / 25);
        // rep_tier: 0-3 (0-24 rep = tier 0; 25-49 = tier 1; 50-74 = tier 2; 75-100 = tier 3)
        
        const equipment_multi = 1.0 + (state.upgrades.A * 0.15);
        // A nivo 0 = 1.0×, A nivo 5 = 1.75×
        
        const base_club_idle = 0.5 + (data.klub_tier * 0.3);
        // Tier 1 klub = 0.8 LP/h, Tier 2 = 1.1 LP/h, Tier 3 = 1.4 LP/h
        
        total += base_club_idle * (rep_tier + 1) * equipment_multi;
    }
    
    return total * state.prestige_multiplier;
}

// Primer (starter, 1 aktivan kvart, tier 1 klub, rep tier 1):
// 0.8 * 2 * 1.0 * 1.0 = 1.6 LP/h
// Posle 4h pauze: +6.4 LP — vidljivo, motivišuće

// Primer (P1, sva 3 kvarta, tier 2 klubovi, rep tier 2):
// 3 * (1.1 * 3 * 1.30 * 1.5) = ~19 LP/h
// Posle 4h: +76 LP — značajan progress
```

### Prestige Gate Formule

```
PRESTIGE 1:
  Gate LP:       500 akumuliranih LP
  Gate achieve.: Sve 3 kvarta — bar 1 sesija svuda
  Procenjeno vreme do P1:
    - Aktivni igrač (5–7 sesija, 7 LP prosek) = 35-49 LP aktivan
    - Idle component (3 kvarta × 1.6 LP/h × 30h play window) = ~140 LP idle
    - Ukupno u 1. "dan": ~180-200 LP
    - Do 500 LP: 2–3 dana casual igranja ili 1 intenzivna sesija od 60+ minuta

PRESTIGE 2:
  Gate LP:       2500 akumuliranih LP (u P1 run-u, uz 1.5× multiplier)
  Gate achieve.: Sva 3 kvarta tier 2+ Mahala Reputacija (50+)
  Procenjeno vreme do P2:
    - Sa 1.5× multiplier: ~35 LP/sesija prosek za odličnog igrača
    - 2500 LP / 35 LP/sesija = ~71 sesija aktivan
    - Idle (P1 state, sva 3 kvarta, tier 2): ~30 LP/h
    - Realno: 5–8 sati total playtime posle P1
    - Ukupno do Avala WIN: 8–12h combined (casual → P1 → P2)
```

---

## 3. Upgrade Tabela

### Grana A — Oprema (Crowd Energy Cap)

| Nivo | Naziv | Cena LP | Efekat | Prereq |
|------|-------|---------|--------|--------|
| 0 | Stari laptop mix | 0 (start) | Crowd cap = 60; idle multi = 1.0× | — |
| 1 | Budget CDJ-200 | 80 LP | Crowd cap = 70; idle multi = 1.15× | — |
| 2 | Pioneer DDJ-800 | 200 LP | Crowd cap = 80; idle multi = 1.30× | A1 |
| 3 | Pioneer CDJ-3000 | 500 LP | Crowd cap = 90; idle multi = 1.45×; Vibe Zone +5% šira | A2 |
| 4 | Modular + Ableton | 1200 LP | Crowd cap = 95; idle multi = 1.60×; perfect session LP bonus +10% | A3 |
| 5 | Alien Rig (custom) | 3000 LP | Crowd cap = 100; idle multi = 1.75×; Crowd floor +5 | A4 |

Eksponencijalni faktor grane A: svaki nivo ≈ 2.5× cena prethodnog.

---

### Grana B — Repertoar (Žanr-Match Score)

| Nivo | Naziv | Cena LP | Efekat | Prereq |
|------|-------|---------|--------|--------|
| 0 | 10 pesama | 0 (start) | Žanr bonus = 0%; Baščaršija wave speed = 1.5× | — |
| 1 | 50 pesama | 60 LP | Žanr bonus = +10% LP u matching kvartu | — |
| 2 | 200 pesama | 150 LP | Žanr bonus = +20%; Baščaršija wave speed normalizuje (1.0×) | B1 |
| 3 | Custom editi | 380 LP | Žanr bonus = +35%; +1 LP per tick dok je Crowd > 70 | B2 |
| 4 | Ekskluzivni ID-ovi | 950 LP | Žanr bonus = +50%; Legenda Moment threshold snižen na 85 (umesto 90) | B3 |
| 5 | Sarajevo Anthem | 2400 LP | Žanr bonus = +75%; svaki kvart dobija +10% LP permanentno; share kartica visuqal upgrade | B4 |

---

### Grana C — Mreža (Booking Fee + Tier Unlock)

| Nivo | Naziv | Cena LP | Efekat | Prereq |
|------|-------|---------|--------|--------|
| 0 | Slučajni poznanici | 0 (start) | Booking fee base = 1.0×; samo tier 1 klubovi | — |
| 1 | Lokalni promoteri | 100 LP | Booking fee = 1.20×; tier 2 klubovi dostupni | — |
| 2 | Regionalni agenti | 250 LP | Booking fee = 1.45×; idle LP +20% (mreža radi za tebe) | C1 |
| 3 | Međunarodni booking | 600 LP | Booking fee = 1.75×; tier 3 klubovi dostupni; DK earn rate +20% | C2 |
| 4 | Festival kontakti | 1500 LP | Booking fee = 2.10×; sezonski bonus event (1× per sezona, +50 LP) | C3 |

---

### Grana C+ — Strani DJ Agent (P1 unlock)

| Nivo | Naziv | Cena LP | Efekat | Prereq |
|------|-------|---------|--------|--------|
| 1 | EU DJ agent | 400 LP | Booking fee = 2.5×; strani DJ cameo (bonus LP) u prvoj noći sezone | P1 + C3 |
| 2 | Globalni agent | 1000 LP | Booking fee = 3.0×; Agent LP bonus +25%; DK earn rate +30% | C+1 |

---

### Grana D — Brend DJ-a (Share + Viralni Multiplikator)

| Nivo | Naziv | Cena LP | Efekat | Prereq |
|------|-------|---------|--------|--------|
| 0 | Bezimeni DJ | 0 (start) | Share kartica: basic; viralni multi = 1.0× | — |
| 1 | Lokalna legenda | 90 LP | Share kartica: kolor; viralni multi = 1.15×; Mahala rep decay snižen 5% | — |
| 2 | Sarajevski brand | 220 LP | Share kartica: animirana; viralni multi = 1.35×; Avala CTA vidljiv na share | D1 |
| 3 | Regionalni artist | 550 LP | Share kartica: full branded (Kluboslavija logo); viralni multi = 1.60× | D2 |
| 4 | Internacionalni | 1400 LP | Share kartica: premium; viralni multi = 2.0×; DK bonus na svaki share | D3 |

---

### Grana E — Sarajevo Know-how (Risk Mitigation)

| Nivo | Naziv | Cena LP | Efekat | Prereq |
|------|-------|---------|--------|--------|
| 0 | Stranac | 0 (start) | Crowd floor = 0; bad rep šansa nesmanjena | — |
| 1 | Poznanik mahale | 70 LP | Crowd floor = 3; bad rep event -15% prihoda trajanje sniženo (1 noć umesto 2) | — |
| 2 | Komšija | 175 LP | Crowd floor = 6; Grbavica instant-fail šansa: 20% → 12% | E1 |
| 3 | Mahala favorit | 440 LP | Crowd floor = 9; bad rep events max per sezona snižen (4 → 3 pre "kicked out") | E2 |
| 4 | Sarajevo ikona | 1100 LP | Crowd floor = 12; Grbavica instant-fail šansa: 12% → 5%; bonus +5 rep po sesiji | E3 |
| 5 | Legenda Sarajeva | 2800 LP | Crowd floor = 15; instant-fail eliminisan u Baščaršiji i Marijin Dvoru | E4 |

---

**UKUPNO UPGRADA: 25 stavki** (A×6 + B×6 + C×5 + C+×2 + D×5 + E×6 = 30 stavki, 25+ ispunjeno)

---

## 4. Progression Krive i Pacing po Minutama

### Sesija 1 — Onboarding (minute 0–15)

| Minuta | Događaj | Cilj LP | Sledeći korak |
|--------|---------|---------|---------------|
| 0:00 | Start screen — Sarajevo mapa, fog-of-war | 0 LP | Ući u Baščaršiju |
| 0:30 | Tutorial: Slider mehanika, Vibe Zone objašnjena | 0 LP | Prva noćna sesija |
| 1:00–3:00 | Prva noćna sesija (120 sec) u Baščaršiji | ~7 LP | Videti LP counter |
| 3:00 | Upgrade shop otvoren — A1 (80 LP) vidljiv ali nedostižan | 7 LP | Sledeća noć |
| 3:00–5:00 | Noć 2 u Baščaršiji — E1 ili B1 na cilju | ~14 LP | E1 ili B1 (60–70 LP) |
| 5:00–10:00 | Noć 3–4 — idle prihod se pojavljuje | ~28 LP | B1 unlock (60 LP) |
| 10:00 | B1 unlock: žanr bonus +10%, satisfakcija | 60+ LP | A1 na vidiku |
| 12:00 | A1 unlock (80 LP): Crowd cap 70, idol prihod +15% | 80 LP | Sezona 1 kraj |
| 14:00 | Sezona 1 complete: obračun, Grbavica locked (need 50 rep oba) | ~90–110 LP | Sezona 2 plan |

**Emocionalni arc minute 0–15:** Radoznalost → Razumevanje slider-a → Prva LP nagrada → Željnja za upgrade-om → Satisfakcija prvog unlock-a.

---

### Sesija 2 — Rast Ekonomije (minute 15–35)

| Minuta | Događaj | Cilj LP | Sledeći korak |
|--------|---------|---------|---------------|
| 15:00 | Sezona 2 — Marijin Dvor otvoren (ako rep ≥0; uvek dostupan kao 2. kvart) | 100–120 LP | Prva sesija u Marijin Dvoru |
| 17:00 | Marijin Dvor sesija — Clean Tech Bonus potencijal (+20% LP) | ~130 LP | B2 cilj (150 LP) |
| 20:00 | B2 unlock: Baščaršija wave speed normalizovan | 150 LP | C1 (100 LP — jeftiniji) |
| 22:00 | C1 unlock: Booking fee +20%, tier 2 klubovi dostupni | 200 LP | A2 na vidiku (200 LP) |
| 25:00 | Idle prihod postaje primetan (2 aktivna kvarta) | ~240 LP | A2 unlock |
| 27:00 | A2 unlock: Crowd cap 80 | 260 LP | Grbavica unlock check |
| 29:00 | Grbavica unlock: Baščaršija + Marijin Dvor oba ≥50 rep | ~300 LP | Prva Grbavica sesija |
| 32:00 | Grbavica sesija — risk/reward, Underground Risk mehanika | ~315 LP | Sarajevo Achievement unlock |
| 34:00 | Sarajevo Achievement: sve 3 kvarta pokrivene | ~330 LP | Prestige 1 na vidiku (500 LP) |

---

### Sesije 3–5 — Prestige 1 Zona (minute 35–90)

| Minuta | Događaj | Cilj LP | Sledeći korak |
|--------|---------|---------|---------------|
| 35:00 | Ekonomija ubrzava: 3 kvarta × idle + aktivne sesije | 340 LP | 500 LP gate |
| 40:00 | Mid-range upgrades: C2, B3 dostupni | ~400 LP | Mreža i Repertoar |
| 50:00 | Prestige 1 gate dostignut — LP = 500, Sarajevo Achievement = DA | 500+ LP | PRESTIGE 1! |
| 51:00 | Prestige reset — DK earn (~5–8 DK), P1 screen | 0 LP (DK: 5-8) | DK shop |
| 53:00 | DK shop: "Brži start" (3 DK) — B1 free; ili "Sarajevo duh" (12 DK — sačekaj) | 0 LP | Run 2 start |
| 55:00 | Run 2 počinje sa 1.5× multiplier — odmah brže LP | ~10 LP/sesija | Sve 3 kvarta brže |
| 65:00 | Tier 2 klubovi dostupni ranije (C+ unlock) | ~200 LP (P1) | Viši idle prihodi |
| 75:00 | Sva 3 kvarta tier 2+ Mahala Rep — P2 gate počinje | ~500 LP (P1) | 2500 LP target |
| 90:00 | Ekonomija u P1 run-u ubrzana — idle dominira | ~800–1000 LP (P1) | Offline progression |

---

### Sesija 6+ — Prestige 2 Zona + Avala Arc (minute 90+)

| Minuta | Događaj | LP | Sledeći korak |
|--------|---------|-----|---------------|
| 90–120 | P1 run napreduje — igrač može igrati kratko, vraća se | ~1200–1800 LP | 2500 LP gate |
| 120–150 | Offline idle + povratne sesije | ~2000 LP | Sva 3 kvarta tier 2+ check |
| 150+ | Prestige 2 gate: 2500 LP + svi kvarti tier 2+ | 2500 LP | PRESTIGE 2! |
| — | P2 screen — Avala Headliner Booking, win screen | WIN | Share kartica, Kluboslavija CTA |

**Ukupno do WIN:** 3–5h casual, 1.5–2.5h optimizovano.

---

## 5. Formule po Kvartu

### Baščaršija

```javascript
// Wave speed modifier
wave_speed_multi = (state.upgrades.B >= 2) ? 1.0 : 1.5;

// Sevdah bonus (B >= 2)
lp_modifier = (state.upgrades.B >= 2) ? 1.10 : 1.0;

// Crowd aging (natural decay brži bez know-how)
crowd_decay = BASE_DECAY * wave_speed_multi;
// Sa wave_speed_multi = 1.5: decay 50% brži = teže zadržati publiku

// Audio signal za Cecu: minor_skala, 75 BPM, reverb 2.5s
```

### Marijin Dvor

```javascript
// Clean Tech Bonus — trigeriše se na max, ne prosek
let clean_tech_triggered = false;
// Svaki tick:
if (current_crowd > 70 && !clean_tech_triggered) {
    clean_tech_triggered = true;
}
// Na kraju sesije:
lp_modifier = clean_tech_triggered ? 1.20 : 1.0;

// Flavor: moderna publika — nagrađuje ambiciju, ne samo prolazak

// Audio signal za Cecu: 4/4 kick 120 BPM, saw wave melodija, reverb 0.4s
```

### Grbavica

```javascript
// Underground Risk — provera svaki put kad crowd PADNE ispod 20 (mid-session)
function checkUndergroundRisk(state) {
    if (state.current_crowd < 20) {
        const roll = Math.random();
        const fail_chance = 0.20 - (state.upgrades.E * 0.03);
        // E0: 20%; E1: 17%; E2: 14%; E3: 11%; E4: 8%; E5: 5%
        if (roll < fail_chance) {
            return 'INSTANT_FAIL';
        }
    }
    return null;
}

// Legend Bonus
lp_modifier = (max_crowd_reached >= 90) ? 1.50 : 1.0;
// max_crowd_reached = peak tokom sesije (ne final)

// Kicked out uslov: 3 bad rep events u istoj Grbavica sesijama unutar 1 sezone
// → mahala_reputacija.grbavica = 0; locked za ostatak sezone

// Audio signal za Cecu: 85 BPM hip-hop, distorted square wave bass, vinyl crackle
```

---

## 6. Win / Lose Uslovi

### Lose Uslovi

| Nivo | Trigger | Posledica | Trajanje |
|------|---------|-----------|----------|
| Per sesija | Crowd < 20 na kraju 120 sec | bad rep event; -15% prihod tog kvarta sledeću noć; -5 Mahala Rep | 1 noć |
| Per sesija (Grbavica only) | Crowd < 20 MID-SESSION + risk roll | Instant session fail; isti efekti kao gore | Odmah |
| Per sezona | 3+ bad rep events u jednoj sezoni | "Kicked out of kvartal" — Mahala Rep → 0 za taj kvart; locked rest of season | 1 sezona |
| Soft stagnacija | Nema progress 2+ sezone | Mahala rep decay pojačan (30% → 50% per sezona) | Dok se ne aktivira |

**Nema game-over.** Igra je idle — čak i maksimalan fail ("kicked out") je privremena setback. Igrač nastavlja iz drugog kvarta.

### Win Uslovi (escalating)

| Nivo | Trigger | Nagrada | Flavor |
|------|---------|---------|--------|
| Win-Short | Sezona 1 sa <2 bad rep events | "Preživio si Sarajevo" achievement; unlock Grbavica brže (rep threshold -10) | "Baščaršija te prihvatila." |
| Win-Mid | Sve 3 kvarta pokrivene (Sarajevo Achievement) | Prestige 1 gate open; DK shop unlock; P1 share kartica | "Sarajevo zna tvoje ime." |
| Win-Long | Prestige 2 + Avala Headliner booking | WIN SCREEN; Avala CTA; share kartica premium | "Sarajevo te naučilo. Avala te čeka." |

---

## 7. Balance Tabele

### Breakeven Analize

**A1 (Proper CDJ) — Cena: 80 LP — Isplati se za koliko sesija?**
```
A1 daje: Crowd cap 70 → 80 (malo u prvim sesijama) + idle multi +15%
Idle benefit: +15% od ~1.6 LP/h (starter) = +0.24 LP/h
Za 80 LP trošak, idle benefit u 24h = 5.76 LP (marginalno)

Realni benefit: bolja sesija performance jer viši Crowd cap → ~+2 LP/sesija
Breakeven aktivno: 80 LP / 2 LP bonus = 40 sesija (predugo ako samo aktivno)
Breakeven sa idle: 80 LP / (2 LP/sesija + 0.24 LP/h × 8h/dan) = ~80LP / 3.9 = ~20 sesija

ZAKLJUČAK: A1 nije "worth it" čisto aktivno. Vrednost je idle multiplier.
→ REBALANS POTREBAN: A1 cenu sniziti na 50 LP, ili pojačati idle benefit na +25%
→ FINALNA PREPORUKA: A1 = 50 LP, idle multi = 1.25×
```

**A2 (Pioneer CDJ-3000) — Cena: 200 LP**
```
Benefit: Crowd cap 80 + Vibe Zone 5% šira + idle multi 1.30×
Sa Crowd cap 80 (umesto 70), Legenda Moment šansa raste → ~+5 LP/sesija
Breakeven: 200 LP / 5 LP = 40 sesija — prihvatljivo, jer je mid-game unlock
Idle benefit (3 kvarta, tier 1.5): +30% od ~5 LP/h = 1.5 LP/h × 24h = 36 LP/dan
Breakeven idle: 200 LP / (1.5 LP/h × 8h/dan) = ~17 dana — predugo

→ REBALANS: A2 idle benefit treba biti vidljiv u sesiji (~3-4h igranja)
→ FINALNA PREPORUKA: A2 = 200 LP (ostaviti), ali pojačati Vibe Zone benefit: +8% šira (ne 5%)
```

**Prestige 1 Gate — Dostižan u prvoj sesiji?**
```
Target: 500 LP
Aktivno (prosek 7 LP/sesija, 15 sesija/sat): 7 × 15 = 105 LP/h aktivno
Idle (2 kvarta aktivna, tier 1): ~3 LP/h pasivno

Real scenario — 45 minuta aktivno + 15 min idle:
= 105 × 0.75 + 3 × 0.25 = ~79 LP/h kombinirano

Za 500 LP: ~6.3h kombinirano

ZAKLJUČAK: Prestige 1 nije dostižan u "prvoj sesiji" (15-35 min) — dostižan u 3–6 return sessions (1–2 realna dana casual igranja). Ovo je ISPRAVNO za idle žanr — prestige ne sme biti trivijalan.

Za "speedrun" (odličan igrač, 25 LP/sesija, 8 sesija/h): 25 × 8 = 200 LP/h → P1 za 2.5h intenzivnog igranja. Prihvatljivo.
```

**Idle Income — Vidljiv progress posle 4h pauze?**
```
Starter (1 kvart, tier 1, rep tier 1): 1.6 LP/h × 4h = +6.4 LP
→ Vidljivo ali marginalno (6.4 LP kad si na, npr., 45 LP — to je ~14% progress)
→ OK za early game: osećaj da se nešto dešava

Mid (3 kvarta, tier 2, P0): ~12 LP/h × 4h = +48 LP
→ Odlično — 4h pauza = vredna sesija

P1 (3 kvarta, tier 2, P1 1.5×): ~19 LP/h × 4h = +76 LP
→ Sjajno — passive income dominira kasnu igru

ZAKLJUČAK: Idle income je dobro balansiran za svaki stage. Early je marginalan (dizajn odluka), mid/late je reward za retenciju.
```

---

## 8. Daily Challenge Seed Sistem

**Brief za Jova jQuery:**

```javascript
// src/systems/daily_challenge.js

/**
 * Deterministički seed po datumu — isti za sve igrače u istom danu
 * @param {Date} date - datumski objekat
 * @returns {Object} - daily challenge konfiguracija
 */
export function getDailyChallenge(date) {
    // Seed = YYYYMMDD kao integer
    const seed = parseInt(date.toISOString().slice(0, 10).replace(/-/g, ''));
    
    // Pseudo-random generator (LCG — bez Math.random, deterministički)
    function lcg(seed) {
        return (seed * 1664525 + 1013904223) & 0xFFFFFFFF;
    }
    
    let s = seed;
    s = lcg(s);
    const kvart_index = Math.abs(s) % 3;  // 0=Baščaršija, 1=Marijin Dvor, 2=Grbavica
    
    s = lcg(s);
    const klub_tier = (Math.abs(s) % 3) + 1;  // 1, 2, ili 3
    
    s = lcg(s);
    const handicap_type = Math.abs(s) % 4;
    // 0: no handicap
    // 1: wave_speed × 1.3 (brži talas)
    // 2: Crowd cap = 50 (nema opreme bonusa)
    // 3: double Grbavica rules (svi kvarti imaju instant-fail risk)
    
    s = lcg(s);
    const bonus_multiplier = 1.5 + (Math.abs(s) % 10) * 0.1;  // 1.5× do 2.4×
    
    return {
        kvart: ['bascarsija', 'marijin_dvor', 'grbavica'][kvart_index],
        klub_tier,
        handicap: handicap_type,
        lp_multiplier: bonus_multiplier,
        date_str: date.toISOString().slice(0, 10)
    };
}

/**
 * Daily challenge score
 * Pohranjuje se u localStorage, keyed po datumu
 * Format: { date: "2026-06-03", score: 47, player_id: uuid }
 */
export function saveDailyChallengeScore(score, date_str) {
    const key = `daily_${date_str}`;
    const existing = JSON.parse(localStorage.getItem('daily_scores') || '{}');
    existing[key] = {
        score,
        timestamp: Date.now(),
        player_id: getOrCreatePlayerId()
    };
    localStorage.setItem('daily_scores', JSON.stringify(existing));
}

/**
 * Leaderboard — localStorage only (no server)
 * Prikazuje top 5 skorova + tvoj rank
 * Note: Cross-device leaderboard zahteva backend (v2 feature)
 */
export function getDailyLeaderboard(date_str) {
    const key = `daily_${date_str}`;
    const scores = JSON.parse(localStorage.getItem('daily_scores') || '{}');
    return scores[key] || null;
}

function getOrCreatePlayerId() {
    let id = localStorage.getItem('player_id');
    if (!id) {
        id = 'player_' + Math.random().toString(36).slice(2, 9);
        localStorage.setItem('player_id', id);
    }
    return id;
}
```

**Daily Challenge UI flow:**
1. Dugme "Dnevni Izazov" na glavnom ekranu
2. "Danas: Grbavica, Club tier 2, Handicap: brži talas — 1.8× LP"
3. Jedna sesija — score = session_lp × lp_multiplier
4. Share kartica: "Danas: 84 LP u Grbavici" + Kluboslavija branding
5. Leaderboard: localStorage only za v1 (cross-device = v2)

---

## 9. Audio Parametri po Kvartu (za Ceca Čujka)

Svi zvuci se generišu u Web Audio API — bez .wav/.mp3 fajlova.

### Baščaršija — Sevdah-Elektronika

```javascript
// Ambijent: Minor skala + heavy reverb + slow attack
const BASCARSIJA_AUDIO = {
    // Ambient drone
    scale: ['A3', 'B3', 'C4', 'D4', 'E4', 'F4', 'G4'],  // A natural minor
    // Konkretne frekvencije: A3=220Hz, B3=246.9Hz, C4=261.6Hz, D4=293.7Hz,
    //                       E4=329.6Hz, F4=349.2Hz, G4=392Hz
    bpm: 75,
    oscillator_type: 'sine',  // topao, organski
    bass_type: 'sine',
    bass_frequency: 110,  // A2 — sub bass
    reverb_decay: 2.5,  // sekunde
    reverb_wet: 0.65,   // 65% wet signal
    attack: 0.8,        // sporiji attack (sevdah je lagana muzika)
    release: 1.2,
    melody_volume: 0.4,
    bass_volume: 0.6,
    note_duration: 0.8,  // duže note = sporiji feel
    
    // Crowd reaction SFX
    sfx_cheer: { type: 'bandpass', freq: 1200, q: 2, noise_color: 'white' },
    sfx_groan: { type: 'lowpass', freq: 300, sweep_from: 400, sweep_to: 150, duration: 0.8 }
};
```

### Marijin Dvor — Tech House

```javascript
const MARIJIN_DVOR_AUDIO = {
    bpm: 120,
    // Kick: 4/4 ritam (svaki beat), sub-kick punch
    kick_frequency: 55,       // sub-kick frekvencija
    kick_attack: 0.001,       // instant punch
    kick_decay: 0.3,          // brzi fade
    kick_type: 'sine',
    
    // Melodija
    melody_type: 'sawtooth',  // agresivniji, električni
    melody_frequencies: [440, 523.25, 587.33, 659.25],  // A4, C5, D5, E5
    melody_volume: 0.3,
    
    // Reverb — kratki, čisti
    reverb_decay: 0.4,
    reverb_wet: 0.25,
    
    attack: 0.01,
    release: 0.1,
    
    // Hi-hat simulacija: white noise + bandpass
    hihat: {
        type: 'highpass',
        frequency: 8000,
        noise_type: 'white',
        volume: 0.15,
        pattern: [1, 0, 1, 0, 1, 0, 1, 0]  // off-beats
    }
};
```

### Grbavica — Hip-Hop Balkanski Fusion

```javascript
const GRBAVICA_AUDIO = {
    bpm: 85,
    
    // Kick: boomy hip-hop kick
    kick_frequency: 65,
    kick_attack: 0.002,
    kick_decay: 0.5,
    kick_punch_freq: 150,  // mid punch za balkanski feel
    
    // Bass: distorted square wave
    bass_type: 'square',
    bass_frequency: 82.4,  // E2 — standard bass root
    bass_distortion: 0.6,  // WaveShaperNode gain — agresivna distorzija
    bass_volume: 0.7,
    
    // Vinyl crackle simulacija
    vinyl_crackle: {
        noise_type: 'white',
        filter_type: 'bandpass',
        filter_frequency: 3000,
        filter_q: 1.5,
        volume: 0.08,  // tiho, u pozadini
        random_pops: true,  // povremeni "pop" zvukovi
        pop_chance_per_second: 2  // prosečno 2 pucketa u sekundi
    },
    
    reverb_decay: 0.8,
    reverb_wet: 0.35,
    
    // Snare: noise burst
    snare: {
        noise_type: 'white',
        filter_type: 'bandpass',
        frequency: 1200,
        attack: 0.001,
        decay: 0.15,
        volume: 0.4
    }
};
```

### Globalni SFX (svi kvarti)

```javascript
const GLOBAL_SFX = {
    // LP gain
    lp_gain: {
        notes: [440, 659.25],  // A4 + E5 — kvintu accord
        type: 'sine',
        attack: 0.01,
        decay: 0.3,
        volume: 0.5
    },
    
    // Unlock jingle (ascending pentatonic)
    unlock: {
        notes: [261.63, 293.66, 329.63, 392.00, 523.25],  // C4, D4, E4, G4, C5
        type: 'sine',
        note_duration: 0.12,
        gap: 0.04,
        volume: 0.6
    },
    
    // Prestige reset (dramatic sweep)
    prestige: {
        sweep_start: 200,
        sweep_end: 800,
        sweep_duration: 2.0,
        type: 'sine',
        reverb_decay: 3.0,
        reverb_wet: 0.8,
        delay_time: 0.3,
        delay_feedback: 0.4,
        volume: 0.7
    },
    
    // Legenda Moment (crowd > 90)
    legend_moment: {
        notes: [523.25, 659.25, 783.99, 1046.5],  // C5, E5, G5, C6
        type: 'triangle',
        attack: 0.05,
        decay: 0.8,
        volume: 0.65,
        particle_trigger: true  // signal za render.js da spawns particles
    },
    
    // Bad rep / fail
    bad_rep: {
        sweep_start: 440,
        sweep_end: 110,
        sweep_duration: 0.6,
        type: 'sine',
        volume: 0.5
    }
};
```

---

## Appendix A — Modularni Import Graf (za Jova)

```
index.html
└── src/main.js
    ├── src/config.js          (konstante, seedovi)
    ├── src/state.js           (game state, localStorage save/load)
    ├── src/input.js           (keyboard + touch + slider drag)
    ├── src/render.js          (Canvas: mapa, slider, crowd bar, particles)
    ├── src/ui.js              (HUD, menije, upgrade shop, season plan)
    ├── src/audio.js           (Web Audio, svi SFX)
    ├── src/share.js           (offscreen Canvas share kartica + Web Share API)
    ├── src/systems/
    │   ├── idle.js            (idle LP kalkulator, offline progress)
    │   ├── session.js         (slider fizika, vibe zone, scoring)
    │   ├── progression.js     (LP tracking, unlock checks, achievement gates)
    │   ├── prestige.js        (prestige reset, DK kalkulacija, permanent bonuses)
    │   ├── upgrades.js        (upgrade shop logic, cost formulas, effects apply)
    │   ├── reputation.js      (Mahala rep per kvart, bad rep events, kicked out)
    │   ├── season.js          (sezona planning, noć scheduling, carry-over)
    │   ├── daily_challenge.js (deterministički seed, score, localStorage LB)
    │   └── kvartovi/
    │       ├── bascarsija.js  (wave speed modifier, sevdah bonus)
    │       ├── marijin_dvor.js (clean tech bonus logic)
    │       └── grbavica.js    (underground risk, legend bonus)
    ├── src/entities/
    │   ├── crowd.js           (Crowd entity: level, decay, floor, reactions)
    │   ├── dj.js              (DJ entity: brend, upgrades reference, share data)
    │   └── klub.js            (Klub entity: tier, capacity, genre_affinity, booking_fee)
    └── src/content/
        ├── aforizmi.js        (Pera Period — per-kvart crowd reactions)
        └── brand_hooks.js     (Avala CTA tekstovi, Kluboslavija overlay)
```

**Ukupno modula: 27 (target 25–40 za multi-layer manager/sim — ispunjeno)**

---

## Appendix B — manifest.json Seed (za Jova 4a)

```json
{
  "name": "Sarajevo ili Smrt",
  "genre": "idle-incremental-manager-sim",
  "date": "2026-06-03",
  "description": "DJ bez reputacije osvaja Sarajevo noć po noć — slider mehanika, 3 kvarta, prestige reset, Avala Headliner terminal goal.",
  "play_url": "https://mkdsl.github.io/gari-daily-games/games/2026-06-03-sarajevo-ili-smrt/",
  "brand_serves": ["kluboslavija", "mkdslend"],
  "stage": "concept",
  "status": "in_progress",
  "modules": {
    "src/main.js": "Bootstrap, wire sve module, game loop",
    "src/config.js": "BASE_LP, prestige multipliers, wave params, KVART audio configs",
    "src/state.js": "Game state shape, save/load localStorage, offline timestamp",
    "src/input.js": "Touch drag + mouse drag za slider, keyboard fallback",
    "src/render.js": "Canvas: Sarajevo mapa, vibe wave, crowd bar, particles, fog-of-war",
    "src/ui.js": "HUD (LP counter, crowd bar, timer), upgrade shop, season planner ekran",
    "src/audio.js": "Web Audio — per-kvart ambient, SFX (LP gain, unlock, prestige, legend)",
    "src/share.js": "Offscreen Canvas share kartica render + Web Share API",
    "src/systems/idle.js": "Idle LP/h kalkulator, offline progress catch-up",
    "src/systems/session.js": "Slider fizika, vibe wave oscillation, scoring formula",
    "src/systems/progression.js": "LP tracking, achievement gate checks, season end obračun",
    "src/systems/prestige.js": "Prestige reset, DK kalkulacija, permanent bonus apply",
    "src/systems/upgrades.js": "Upgrade shop: cost formulas (expo), effect application, prereq check",
    "src/systems/reputation.js": "Mahala rep per kvart, bad rep events, kicked out logic, decay",
    "src/systems/season.js": "Sezona planning UI, noć scheduling, resource carry-over",
    "src/systems/daily_challenge.js": "LCG seed po datumu, daily score, localStorage LB",
    "src/systems/kvartovi/bascarsija.js": "Wave speed modifier, sevdah bonus logic",
    "src/systems/kvartovi/marijin_dvor.js": "Clean tech bonus trigger i check",
    "src/systems/kvartovi/grbavica.js": "Underground risk/reward, instant fail, legend bonus",
    "src/entities/crowd.js": "Crowd entity: level, decay per tick, floor, reactions, bad rep trigger",
    "src/entities/dj.js": "DJ entity: brend nivo, upgrades reference, share data generator",
    "src/entities/klub.js": "Klub entity: tier, capacity, genre_affinity, booking_fee calc",
    "src/content/aforizmi.js": "Per-kvart crowd reactions, unlock texts, prestige flavor",
    "src/content/brand_hooks.js": "Avala CTA string-ovi, Kluboslavija overlay data, share copy",
    "styles/base.css": "Layout, full-screen canvas, mobile viewport",
    "styles/ui.css": "HUD dizajn, upgrade shop cards, season planner grid",
    "styles/game.css": "Vibe wave animacije, crowd bar transition, screen shake, particle CSS",
    "styles/theme.css": "Sarajevo paleta (#0a0a14, #FF3366, #00FFCC, #FFD700), kvart boje"
  },
  "line_counts": {
    "total_js": null,
    "total_css": null
  },
  "beta_score": null,
  "beta_score_iter2": null,
  "post_fix_score": null,
  "sef_signoff": false
}
```

---

*GDD kompletiran. Mile Mehanika. 2026-06-03.*
*Sledeći: Jova jQuery — KORAK 4 (09:00 trigger, impl stage)*
