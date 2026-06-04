# GDD: Festival Mreža
**Agent:** Mile Mehanika  
**Datum:** 2026-06-04  
**Verzija:** 1.0 (concept sesija — input: concept.md + premortem.md)

---

## SADRŽAJ

1. [State Shape Tabela](#1-state-shape-tabela)
2. [Macro Layer Mehanike](#2-macro-layer-mehanike)
3. [Micro Layer Mehanike](#3-micro-layer-mehanike)
4. [Carry-Over Sistem](#4-carry-over-sistem)
5. [Upgrade Table (20 stavki)](#5-upgrade-table)
6. [Coordinator Profili (5 ukupno)](#6-coordinator-profili)
7. [Karijer Tier Progression](#7-karijer-tier-progression)
8. [Prestige Sistem](#8-prestige-sistem)
9. [Pacing po Minutama](#9-pacing-po-minutama)
10. [Audio Event API](#10-audio-event-api)
11. [Performance Constraints](#11-performance-constraints)
12. [Share Karta Spec](#12-share-karta-spec)

---

## 1. STATE SHAPE TABELA

> **Jova: ovo je FIRST deliverable. Kodiraj state objekat tačno po ovoj tabeli pre nego što napišeš ijedan sistem.**

### 1.1 `macro_state` — persist između makro rundi, save u localStorage

| Polje | Tip | Default | Reset na prestige? | Reset na event end? | Opis |
|-------|-----|---------|-------------------|---------------------|------|
| `budget` | `number` | `2000` | DA (na base × prestige_mult) | NE | EUR u blagajni |
| `team_energy` | `number` | `100` | DA (na 100) | NE | 0–100, trošak akcija |
| `reputation` | `Record<CityId, number>` | `{nis:0, sarajevo:0, strand:0, guncati:0, avala:0}` | NE | NE | 0–100 per grad, nikad se ne resetuje potpuno |
| `connections` | `number` | `0` | NE | NE | Coordinator network resource, akumulira |
| `active_coordinators` | `CoordinatorId[]` | `[]` | DA (retain alumni) | NE | Koji koordinatori su trenutno angažovani |
| `coordinator_loyalty` | `Record<CoordinatorId, number>` | `{}` | DELIMICNO (alumni zadržavaju 50% loyalty) | NE | 0–100 per koordinator |
| `current_city_index` | `number` | `0` | DA (na 0) | NE | 0=Niš, 1=Sarajevo, 2=Štrand, 3=Guncati, 4=Avala |
| `tour_complete` | `boolean` | `false` | DA | NE | True kad je Avala event završen |
| `promo_investments` | `PromoRecord[]` | `[]` | DA | NE | Lista aktivnih promo talasa sa decay stanjem |
| `insurance_active` | `boolean` | `false` | DA | DA (troši se per event) | Plan B za loš event |
| `upgrades_purchased` | `UpgradeId[]` | `[]` | NE | NE | Lista kupljenih upgrades — nikad se ne resetuje |
| `city_order` | `CityId[]` | `['nis','sarajevo','strand','guncati','avala']` | DA | NE | Redosled turneje (igrač može menjati prve 4) |
| `event_results` | `EventResult[]` | `[]` | DA | NE | Istorija svih eventova u ovom run-u |

### 1.2 `micro_state` — ephemeral po eventu, NIJE u localStorage

| Polje | Tip | Default | Reset na prestige? | Reset na event end? | Opis |
|-------|-----|---------|-------------------|---------------------|------|
| `crowd_groups` | `CrowdGroup[]` | `[]` | N/A | DA | Svi aktivni crowd grupe na terenu |
| `zones` | `Record<ZoneId, ZoneState>` | vidi dole | N/A | DA | dance_floor, bar, chill, stage_front |
| `current_bpm` | `number` | `90` | N/A | DA | DJ slider vrednost |
| `floor_temperature` | `number` | `0` | N/A | DA | 0.0–1.0, kalkulisano iz BPM+density |
| `satisfaction_points` | `number` | `0` | N/A | DA | Akumulirani satisfaction score |
| `energy_debt` | `number` | `0` | N/A | DA | Akumulirani energy debt |
| `incident_queue` | `Incident[]` | `[]` | N/A | DA | Aktivni incidenti čekaju turn-based modal |
| `event_time_elapsed` | `number` | `0` | N/A | DA | Sekunde od starta mikro event-a |
| `event_duration` | `number` | `180` (Niš) / `240` | N/A | DA | Trajanje u sekundama |
| `wave_timer` | `number` | `0` | N/A | DA | Countdown do sledećeg crowd wave-a |
| `peak_phase_triggered` | `boolean` | `false` | N/A | DA | Da li je `onPeakPhase()` već emitovan |
| `guest_from_prev_city` | `CrowdGroup \| null` | `null` | N/A | DA | Carry-over crowd tip (vizuelni echo) |

**ZoneState shape:**
```js
{
  id: 'dance_floor' | 'bar' | 'chill' | 'stage_front',
  capacity: number,           // max crowd u zoni
  current_crowd: number,      // trenutno crowd count
  mood_average: number,       // 0.0–1.0 prosečan mood crowd-a u zoni
  overflow_active: boolean    // true ako current_crowd > capacity
}
```

### 1.3 `meta_state` — persist između prestige run-ova, SAVE u localStorage

| Polje | Tip | Default | Reset na prestige? | Reset na event end? | Opis |
|-------|-----|---------|-------------------|---------------------|------|
| `career_tier` | `CareerTier` | `'rookie'` | NE | NE | 'rookie' → 'regional' → 'balkanski_fenomen' → 'legenda_turneje' |
| `prestige_count` | `number` | `0` | NE | NE | Broj završenih prestige reset-ova |
| `prestige_multiplier` | `number` | `1.0` | NE | NE | Compounding ×1.25 per prestige |
| `coordinator_alumni` | `CoordinatorId[]` | `[]` | NE | NE | Max 2; dostupni za 50% cenu u sledećem run-u |
| `veteran_insights` | `InsightId[]` | `[]` | NE | NE | Max 3 od 6 izabranih insight-a |
| `lifetime_satisfaction` | `number` | `0` | NE | NE | Kumulativni satisfaction svih runova |
| `lifetime_events` | `number` | `0` | NE | NE | Ukupno evenata odigranih |
| `achievements` | `AchievementId[]` | `[]` | NE | NE | Svi otključani achievements |
| `guncati_unlocked` | `boolean` | `false` | NE | NE | True posle prvog completed Avala event-a |
| `challenge_modes_unlocked` | `boolean` | `false` | NE | NE | True posle prvog prestige-a |

### 1.4 localStorage ključevi

```js
const STORAGE_KEYS = {
  MACRO: 'festival_mreza_macro_v1',
  META:  'festival_mreza_meta_v1',
  // micro_state se NIKAD ne serialuje
};
```

**Versioning pravilo:** Ako se state schema menja u patch-u, bump broj sufiks (v1→v2) i piši migration funkciju u `src/state.js` koja upgraduje stari format.

---

## 2. MACRO LAYER MEHANIKE

### 2.1 Budžet Ekonomija

**Starting budget po karijer tier-u:**

| Karijer Tier | Base Budžet | Sa prestige_mult (×1.0–×2.44) |
|-------------|-------------|-------------------------------|
| Rookie | 2,000 EUR | 2,000 EUR (prestige 0) |
| Regional | 2,400 EUR | do 5,856 EUR (prestige 5) |
| Balkanski Fenomen | 3,000 EUR | do 7,320 EUR |
| Legenda Turneje | 3,800 EUR | do 9,272 EUR |

**Primer kalkulacije (Rookie, prestige 2):**  
`2000 × 1.56 = 3,120 EUR`

**Budget income u toku run-a:**
- Per successful event (satisfaction ≥ 70%): `+200 + (satisfaction_pct - 70) × 15 EUR`
  - Primer: satisfaction 85% → `200 + 15×15 = 425 EUR`
- Per failed event (satisfaction < 70%): `+50 EUR` (emergency cover)
- Insurance payout: `+500 EUR` (ako je incident_severity ≥ RED i insurance_active)

**Budget sinks:**
- Promo akcije (vidi 2.2)
- Coordinator angažman (vidi 2.3)
- Insurance kupovina: `300 EUR`
- Venue upgrade (vidi Upgrade Table): 100–800 EUR per upgrade

### 2.2 Promo Talasi

Tri tipa promo akcije, svaka sa reach, cenom i decay krivom:

| Tip | Reach (initial) | Cena | Decay half-life | Max Buzz doprinos | Ogr. per grad |
|-----|-----------------|------|-----------------|-------------------|----|
| Social Post | 15 buzz | 80 EUR | 2 in-game dana | 30 buzz | 3 puta |
| Flyer | 10 buzz | 40 EUR | 4 in-game dana | 20 buzz | neogr. |
| Radio Spot | 25 buzz | 200 EUR | 5 in-game dana | 50 buzz | 1 put |

**Buzz decay formula:**
```
buzz_remaining(t) = initial_buzz × 0.5^(t / half_life)
```
Primer: Social Post posle 2 dana:  
`15 × 0.5^(2/2) = 15 × 0.5 = 7.5 buzz`

**Promo Upgrade efekti** (vidi sekciju 5) menjaju `initial_buzz` i `half_life` vrednosti.

**Cognitive budget Niš:** Igrač može pustiti max 2 promo akcije pre Niš eventa (tutorijalski limit). Nema budžet bankrota u tutorijalskom Nišu.

### 2.3 Buzz Akumulacija

**Buzz state per grad (u `macro_state.promo_investments`):**

Svaki grad ima `buzz_level: number (0–100)` koji se kalkuliše pri ulasku u makro screen za taj grad:

```
buzz_level = sum(buzz_remaining(t) for all active promos) + carry_over_buzz
buzz_level = min(buzz_level, 100)
```

**Makro round:** Kada igrač klikne "Počni Event", buzz_level tog grada se "zaključava" i prenosi u mikro_state kao `starting_satisfaction_bonus`:

```
starting_satisfaction_bonus = buzz_level × 0.3
```
Primer: buzz 60 → +18 satisfaction points na start mikro sesije.

### 2.4 Coordinator Hiring

**Cost formula po loyalty tier-u:**
```
cost = 100 × 2^(tier - 1)
```

| Loyalty Tier | Cost (EUR) | Bonus |
|-------------|-----------|-------|
| Tier 1 (Novi) | 100 | Base stats only |
| Tier 2 (Poznat) | 200 | +10% reach |
| Tier 3 (Pouzdan) | 400 | +20% reach, -5% incident chance |
| Tier 4 (Veteran) | 800 | +30% reach, -10% incident chance, +1 free promo |
| Tier 5 (Legenda) | 1,600 | +50% reach, -20% incident chance, +2 free promo, unique ability active |

**Alumni discount:** Coordinator iz prethodnog run-a koji je u `meta_state.coordinator_alumni` košta 50%:
- Tier 3 alumni → 200 EUR (umesto 400)
- Tier 4 alumni → 400 EUR (umesto 800)

**Loyalty rast:**
```
loyalty_gain_per_successful_event = 15
loyalty_gain_per_failed_event = 3
loyalty_decay_per_unused_round = -5  (ako koordinator nije angažovan taj grad)
```
Primer: Koordinator angažovan za Niš + Sarajevo (oba success):  
`0 + 15 + 15 = 30 loyalty` → ostaje na Tier 1 (treba 40 za Tier 2)

**Loyalty tier thresholds:**
- Tier 1: 0–39
- Tier 2: 40–99
- Tier 3: 100–199
- Tier 4: 200–349
- Tier 5: 350+

### 2.5 Venue Tier

Venue tier za svaki grad zavisi od `reputation[cityId]`:

| Reputation | Venue Tier | Crowd Capacity | Visual |
|-----------|-----------|----------------|--------|
| 0–19 | Tier 1 (Underground) | 200 crowd | Mala sala |
| 20–49 | Tier 2 (Club) | 400 crowd | Srednji klub |
| 50–79 | Tier 3 (Venue) | 800 crowd | Pravi venue |
| 80–100 | Tier 4 (Arena) | 1,600 crowd | Scena na otvorenom |

**Avala poseban slučaj:** Avala startuje sa minimalnim Tier 1 ali može skočiti direktno na Tier 4 ako je `reputation.avala ≥ 80`. Reputacija Avale je kumulativna suma svih prethodnih gradova:

```
reputation.avala = sum(event_results[i].satisfaction_score × 0.2)
```
Primer: 4 eventa po 80 satisfaction → `4 × 80 × 0.2 = 64` → Avala Tier 3.

**Reputation decay između run-ova:** Nikad se ne resetuje, ali ne raste automatski. Ostaje na vrednosti gde si je ostavio na kraju prethodnog run-a. Ovo je trajni progres.

### 2.6 Insurance Mehanika

- **Kupovina:** 300 EUR, jednom per grad
- **Aktivacija:** Automatska ako je `event_result.satisfaction < 50` ILI incident_severity = RED u tom eventu
- **Efekat:**
  - Sprečava reputaciju da padne ispod sadašnje vrednosti - 5 (soft floor)
  - Daje +500 EUR emergency payout
  - Nije prenosiva na sledeći grad (troši se na kraju eventa, uspešno ili ne)
- **Nije dostupna za Niš** (tutorial, nema lose state)

### 2.7 Cognitive Budget po Makro Rundi

Maksimalno 5 meaningful decision po gradu (Nega preporuka):

| Slot | Decision Tip |
|------|-------------|
| 1 | Promo selekcija (koji tip, koliko puta) |
| 2 | Coordinator angažman (da/ne, koji) |
| 3 | Redosled sledećeg grada (editabilno za prvih 4) |
| 4 | Insurance kupovina (da/ne) |
| 5 | Upgrade kupovina (jedan upgrade slot per grad) |

Sve ostalo (loyalty progress, decay vizuelizacija, buzz level display) je **informativno** — igrač vidi ali ne mora da donosi odluku.

---

## 3. MICRO LAYER MEHANIKE

> **MVP scope (Nega korekcija):** zona-redirect buttons (ne drag-and-drop), vizuelni particle dots (ne physics), incident response = turn-based modal.

### 3.1 Crowd Wave Spawning

**Talas interval:** Novi talas crowd-a stizuje svakih `wave_interval` sekundi:

| Grad | Wave Interval | Talasi ukupno | Max crowd per talas |
|------|--------------|---------------|---------------------|
| Niš (Tutorial) | 30s | 4 | 30 (capped) |
| Sarajevo | 25s | 6 | venue_capacity × 0.15 |
| Štrand | 22s | 7 | venue_capacity × 0.18 |
| Guncati | 20s | 7 | venue_capacity × 0.20 |
| Avala | 18s | 8 | venue_capacity × 0.22 |

**Proceduralni seed:**
```
seed = (date_as_unix_days × 7919 + career_tier_index × 1013 + city_index × 337) % 65536
```
Svaki talas koristi `next_seed = (seed × 6364136223846793005n + 1442695040888963407n) % 2n**64n` (LCG, 64-bit). Seed je konfigurabilna konstanta u `config.js` sa override opcijom za QA.

**CrowdGroup tip:**

```js
{
  id: string,                    // unique ID
  size: number,                  // 5–50
  mood: number,                  // 0.0–1.0 (start mood)
  energy: number,                // 0.0–1.0 (decay kroz event)
  preferred_zone: ZoneId,        // preferirana zona
  current_zone: ZoneId | null,   // gde je sada
  is_guest_carry_over: boolean,  // vizuelni echo iz prethodnog grada
  mood_type: 'cold' | 'warm' | 'hot'  // utiče na BPM sweet spot
}
```

### 3.2 Zone Kapacitet i Overflow

**Zone inicijalni kapacitet** (Tier 2 venue primer — 400 crowd):

| Zona | % venue_capacity | Kapacitet (Tier 2) | Kapacitet (Tier 4) |
|------|-----------------|--------------------|--------------------|
| `dance_floor` | 40% | 160 | 640 |
| `bar` | 25% | 100 | 400 |
| `chill` | 20% | 80 | 320 |
| `stage_front` | 15% | 60 | 240 |

**Overflow logika:**
- `current_crowd > capacity × 1.1` → `overflow_active = true`
- Overflow trajanje > 15s → automatski triggeruje incident `CROWDOVERFLOW` (severity MEDIUM)
- Overflow trajanje > 30s → incident eskalira na severity HIGH

**Bottleneck vizuelizacija:** Kad je zona u overflow, particle boja za tu zonu se menja: #4df5ff (normal) → #ffb830 (warn) → #ff4444 (critical). Ovo je vizuelni feedback bez posebnog tooltip-a.

### 3.3 Zone Routing

**Implementacija:** Svaka zona ima dugme "REDIRECT →" koje je aktivno kad je zona u overflow ili kad DJ slider sugeriše da bi redistribucija pomogla.

**Redirect mehanika:**
- Klik na "REDIRECT dance_floor → chill" premešta `min(30, overflow_count)` crowd iz dance_floor u chill
- Crowd migration nije instant — `migration_speed = 1.2 crowd/second` (configurable)
- Procenat koji sledi redirect: `base_follow_rate × coordinator_routing_bonus`
  - Base: 70% crowd prati redirect
  - Sa koordinatorom Tier 3+: 85%
  - Sa Tier 5 koordinatorom: 95%
- Ostatak (30% base) ostaje u zoni — "teški gosti"

**Redirect buttons layout:** 4 dugmeta u fiksnoj poziciji, uvek vidljivi. Format: "[zona A] → [zona B]". Pre-definirani redirect parovi (ne custom):
- Dance Floor → Chill
- Bar → Dance Floor  
- Chill → Stage Front
- Stage Front → Bar (decongest)

### 3.4 DJ BPM Slider

**Range:** 90–138 BPM, korak 2 BPM  
**Slider UI:** Horizontalni slider sa 3 zone obojene: plava (cool: 90–104), zelena (warm: 105–122), crvena (hot: 123–138)

**Crowd response po BPM rangu i mood_type:**

| BPM Range | Cold crowd mood | Warm crowd mood | Hot crowd mood |
|-----------|----------------|-----------------|----------------|
| 90–104 (Cool) | Neutral (+0) | Negativan (-0.05/s) | Jako Negativan (-0.15/s) |
| 105–122 (Warm) | Pozitivan (+0.03/s) | Idealan (+0.08/s) | Pozitivan (+0.03/s) |
| 123–138 (Hot) | Negativan (-0.08/s) | Pozitivan (+0.04/s) | Idealan (+0.10/s) |

**Sweet spot logika:** Optimalni BPM za mešanu crowd (tipičan slučaj) je 108–118 BPM. Ako je BPM van opsega 100–125 na duže od 45s, tekstualni cue se pojavljuje (vidi 3.5).

**BPM auto-arc za Niš (tutorial):**
- BPM se automatski menja prema predefinirajuću krivom (90 → 105 → 115 → 108 → 95)
- Igrač može overridovati ali slider ima "magnetic pull" ka predefinirajuće vrednosti ako nije aktivan

### 3.5 DJ Arc Feedback Layer (Nega obavezno)

**Floor Temperature Indicator:**

```
floor_temp = (current_bpm - 90) / 48 × 0.6 + (zone_density_ratio) × 0.4
```
Gde je `zone_density_ratio = dance_floor.current_crowd / dance_floor.capacity` (0.0–1.0+, cap na 1.5 za vizual).

`floor_temp` vrednost 0.0–1.0:
- 0.0–0.3: Cool Blue (#4df5ff)
- 0.3–0.6: Warm Orange (#ff8c42)
- 0.6–0.8: Hot (#ff5500)
- 0.8–1.0: Overheated Red (#ff0022) + screen edge glow efekt

**Crowd Energy Bar:** Horizontalni bar koji prikazuje `average(mood)` svih crowd_groups. Menja se u real-time. Boja prati floor_temp paletu.

**Tekstualni cue (obavezan):**
- BPM < 100 i `event_time_elapsed > 60s`: `"Hladan floor — podgrej malo"`
- BPM > 130 i `floor_temp > 0.8`: `"Prevruće — spusti tempo"`
- `average_mood > 0.8` i nije `peak_phase_triggered`: `"PEAK — drži ritam!"` + emituje `onPeakPhase()`
- Cue se prikazuje 4 sekunde pa nestaje

Primer kalkulacije floor_temp: BPM=118, dance_floor 140/160 (87.5% popunjenost):
`(118-90)/48 × 0.6 + 0.875 × 0.4 = 0.583×0.6 + 0.35 = 0.35 + 0.35 = 0.70` → Hot zona.

### 3.6 Satisfaction Formula

**Akumulira kontinuirano dok je micro event aktivan:**

```
satisfaction_delta_per_second = 
    (time_above_mood_threshold × 0.4) 
  + (average_zone_utilization × 0.3) 
  - (overflow_zones × 0.2) 
  - (incident_count × 0.1)
```

Gde:
- `time_above_mood_threshold` = 1.0 ako je `average_mood ≥ 0.6`, else 0.0
- `average_zone_utilization` = prosek (current/capacity) svih zona, cap 1.0
- `overflow_zones` = broj zona sa `overflow_active = true`
- `incident_count` = ukupno aktivnih incidenata u ovom trenutku

**Final satisfaction score:**
```
raw_satisfaction = (satisfaction_points / event_duration) × 100
final_satisfaction = raw_satisfaction + starting_satisfaction_bonus
final_satisfaction = min(final_satisfaction, 100)
```

Primer: event_duration=240s, satisfaction_points=145, starting bonus=18:
`(145/240)×100 + 18 = 60.4 + 18 = 78.4%` → ≥70% = SUCCESS

### 3.7 Energy Debt Formula

**Energy debt akumulira kad je floor overheated:**

```
energy_debt_delta = max(0, floor_temp - 0.7) × 3.0  per second
energy_debt_decay = max(0, 0.7 - floor_temp) × 1.5  per second  (samo kad floor_temp < 0.7)
```

Primer: floor_temp = 0.85 (overheated):
`energy_debt += (0.85 - 0.7) × 3.0 = 0.45 per second`

**Energy debt cap:**
```
max_energy_debt = 50 + (coordinator_tier × 5)
```
Primer: Tier 3 coordinator → max 65. Bez koordinatora → max 50.

**Lose condition trigger:** `energy_debt ≥ max_energy_debt` → incident RED "CROWD BURNOUT" → event penalty.

### 3.8 Incident Sistem (Turn-Based Modal)

**3 tipa incidenata:**

#### INCIDENT: CROWD_OVERFLOW
- **Trigger:** Zona u overflow > 30s
- **Severity:** MEDIUM (automatski) → HIGH ako se ne reši za 20s
- **Modal opcije:**
  1. "Otvori rezervni izlaz" → -80 EUR, instantly premešta 40% overflow-a u chill. Efekat odmah.
  2. "DJ announcement — redirect" → besplatno, 60% follow rate, 10s delay
  3. "Ignoriši" → ništa se ne dešava, incident ostaje aktivan, mood pada -0.1/s u toj zoni
- **Incident trajanje:** Dok se overflow ne reši + 10s grace period

#### INCIDENT: FLOOR_TOO_COLD
- **Trigger:** `average_mood < 0.35` i `event_time_elapsed > 90s`
- **Severity:** LOW → MEDIUM posle 45s
- **Modal opcije:**
  1. "Spotlight moment" → -120 EUR, instant mood boost +0.25 za svu crowd, BPM se automatski setuje na 108
  2. "Free round (bar)" → -60 EUR, crowd u bar zoni dobija +0.2 mood, može ih privući ka dance_floor
  3. "Čekaj" → ništa, mood nastavlja pad
- **Incident trajanje:** Dok `average_mood > 0.45` OR igrač izabere opciju

#### INCIDENT: EQUIPMENT_FAILURE
- **Trigger:** Proceduralni (10% šansa per event, triggered na random trenutku između 60s i `event_duration - 60s`)
- **Severity:** HIGH (uvek)
- **Modal opcije:**
  1. "Technician on standby" → -200 EUR (mora biti kupljeno u makro fazi kao upgrade), rešava za 15s, nema mood penalty
  2. "Improvizovani DJ set" → besplatno, BPM se zaključava na 100 na 30s, mood pada -0.15 za sve
  3. "Pauza eventa" → 45s pauza, sav crowd stagnira, energy_debt decay za to vreme ali satisfaction bonus pause
- **Incident trajanje:** Dok igrač ne izabere opciju (modal blokira timer)

**Niš tutorial**: EQUIPMENT_FAILURE nije moguć u Nišu. Samo CROWD_OVERFLOW (LOW severity, uvek "Otvori rezervni izlaz" defaultno ponuđen kao best practice).

---

## 4. CARRY-OVER SISTEM

### 4.1 Buzz Carry-Over

```
carry_over_buzz = previous_event.final_satisfaction × 0.7
carry_over_buzz = min(carry_over_buzz, 70)  // hard cap
```

Primer: Niš satisfaction 85% → Sarajevo starta sa carry_over_buzz = `85 × 0.7 = 59.5` (cap 70, dakle 59.5).

Sarajevo zatim dodaje sopstvene promo investicije na vrh: `total_buzz = carry_over_buzz + promo_buzz`.

**Kumulativni cap:** `total_buzz = min(100, carry_over_buzz + promo_buzz)`

### 4.2 "Gosti iz [Prethodnog Grada]" — Vizuelni Echo

U prvom crowd wave-u sledećeg grada, pojavljuje se poseban `CrowdGroup` sa `is_guest_carry_over = true`:

```
guest_group = {
  size: floor(carry_over_buzz × 0.3),   // 0–21 gostiju
  mood: 0.6 + (carry_over_buzz / 100) × 0.3,  // 0.60–0.90 predeset mood
  is_guest_carry_over: true,
  label: "Gosti iz Niša"  // tekst koji se prikazuje na hover/touch
}
```

Primer: carry_over_buzz=59.5:
- size: `floor(59.5 × 0.3) = 17` gostiju
- mood: `0.6 + 0.595 × 0.3 = 0.779`

**Vizuelna distinkcija:** guest_carry_over group se renderuje u žutoj/zlatnoj boji (#ffb830) umesto standardnog plave (#4df5ff). Tooltip/label se pojavljuje na hover.

### 4.3 Coordinator Retention

**Baza retencija po event-u:** 60%  
**Sa Coordinator Loyalty Upgrade Tier 1** (vidi Upgrade Table): 75%  
**Sa Coordinator Loyalty Upgrade Tier 2:** 90%

**Mehanika:** Na kraju svakog eventa, za svakog angažovanog koordinatora:
```
retained = random() < retention_rate
```
Ako nije retained: koordinator napušta turneju, loyalty se resetuje na 0. Može biti ponovo angažovan sledećem gradu ali starta od Tier 1 (ili Tier 1 × 0.5 ako je alumni).

**Retention upgrade se kupuje u Upgrade Table** (ne u toku eventa).

### 4.4 Reputation Carry-Over

Reputacija po gradu se ne resetuje između run-ova. Raste per successful event:

```
reputation_gain = (satisfaction_score - 50) × 0.4   // samo ako satisfaction > 50
reputation_gain = max(0, min(10, reputation_gain))   // 0–10 po eventu
reputation_penalty = (50 - satisfaction_score) × 0.3  // samo ako satisfaction < 50
```

Primer: satisfaction=78%: `(78-50) × 0.4 = 11.2 → cap na 10`
Primer: satisfaction=42%: `(50-42) × 0.3 = 2.4 penalty`

**Reputation cap:** 100 per grad. Nikad ne pada ispod 0.

---

## 5. UPGRADE TABLE

**Tačno 20 upgrades, 3 kategorije.** Nega korekcija: ne 28.

Format: Naziv | Kategorija | Efekat | Base Cost | Cost Growth | Max Level | Prereq

### 5.1 PROMO UPGRADES (7 stavki)

| # | Naziv | Kategorija | Efekat | Base Cost | Cost Growth | Max Level | Prereq |
|---|-------|-----------|--------|-----------|-------------|-----------|--------|
| P1 | Viral Udio | Promo | Social Post reach: +5 buzz, half-life: +1 dan | 150 EUR | ×1.8 per level | 3 | — |
| P2 | Print Network | Promo | Flyer reach: +4 buzz, može se koristiti u 2 grada za istu cenu | 200 EUR | ×2.0 per level | 2 | — |
| P3 | Radio Partnership | Promo | Radio Spot cena -30%, može se emitovati 2× per grad | 300 EUR | ×2.5 per level | 2 | P1 Lv2 |
| P4 | Micro-Influencer Pack | Promo | Novi promo tip: Influencer Post (reach: 20 buzz, cena: 120 EUR, half-life: 3 dana) | 400 EUR | jednokratno | 1 | P1 Lv1 |
| P5 | Buzz Momentum | Promo | Carry-over faktor: 0.7 → 0.77 (per level +0.035) | 350 EUR | ×2.2 per level | 2 | — |
| P6 | Cross-City Seeding | Promo | Svaki uspješan event dodaje +3 buzz u SVIM sledećim gradovima | 500 EUR | jednokratno | 1 | P5 Lv1 |
| P7 | Decay Shield | Promo | Svi aktivni promo talasi: half-life +50% | 280 EUR | jednokratno | 1 | P2 Lv1 |

### 5.2 COORDINATOR UPGRADES (7 stavki)

| # | Naziv | Kategorija | Efekat | Base Cost | Cost Growth | Max Level | Prereq |
|---|-------|-----------|--------|-----------|-------------|-----------|--------|
| C1 | Loyalty Program | Coordinator | Coordinator retention rate: 60% → 75% (Lv1), 75% → 90% (Lv2) | 250 EUR | ×2.0 | 2 | — |
| C2 | Hiring Network | Coordinator | Novi koordinatori startuju na Tier 2 umesto Tier 1 (cost ostaje Tier 1) | 300 EUR | jednokratno | 1 | C1 Lv1 |
| C3 | Alumni Extended | Coordinator | Alumni lista sa 2 na 3 koordinatora po 50% ceni | 400 EUR | jednokratno | 1 | C1 Lv2 |
| C4 | Routing Mastery | Coordinator | Coord. bonus na zone follow rate: 70% → 85% baza (bez koordinatora), sa koordinatorom: 85% → 92% | 220 EUR | ×1.9 per level | 2 | — |
| C5 | Skill Transfer | Coordinator | Na kraju turneje: jedan koordinator zadržava punu loyalty bez alumni slot troška | 350 EUR | jednokratno | 1 | C2 |
| C6 | Emergency Network | Coordinator | Može angažovati koordinatora TOKOM eventa (ako je dostigao Tier 3+) za 200 EUR | 500 EUR | jednokratno | 1 | C1 Lv2 |
| C7 | Loyalty Accelerator | Coordinator | Loyalty rast po eventu: +15 → +20 | 180 EUR | ×1.7 per level | 2 | C1 Lv1 |

### 5.3 VENUE UPGRADES (6 stavki)

| # | Naziv | Kategorija | Efekat | Base Cost | Cost Growth | Max Level | Prereq |
|---|-------|-----------|--------|-----------|-------------|-----------|--------|
| V1 | Crowd Flow Barriers | Venue | Overflow threshold: +10% (kapacitet efektivno veći za 10%) | 120 EUR | ×1.6 per level | 3 | — |
| V2 | VIP Section | Venue | Dodaje novu zonu VIP (kapacitet: 50, crowd u VIP ima mood +0.2 bonus) | 350 EUR | jednokratno | 1 | V1 Lv2 |
| V3 | Sound System Plus | Venue | BPM sweet spot proširen: Warm zona postaje 100–127 BPM umesto 105–122 | 400 EUR | jednokratno | 1 | — |
| V4 | Bar Express | Venue | Bar zona: migration iz bar u dance_floor +50% brže (2.0/s umesto 1.2/s kada bar nije u overflow) | 150 EUR | ×1.8 per level | 2 | — |
| V5 | Technician on Standby | Venue | EQUIPMENT_FAILURE incident: opcija 1 (technician) postaje dostupna i košta 0 EUR u toku event-a | 200 EUR | jednokratno | 1 | — |
| V6 | DJ Booth Premium | Venue | DJ arc bonus: `starting_satisfaction_bonus` +5 flat; BPM tekstualni cue threshold proširiti za ±5 BPM | 280 EUR | jednokratno | 1 | V3 |

**UKUPNO: 7 + 7 + 6 = 20 upgrades.** Nega korekcija potvrđena.

---

## 6. COORDINATOR PROFILI

**3 base (dostupni od starta) + 2 unlockable (posle Avala event-a).**

---

### 6.1 MILEVA JOVANOVIĆ — Niš

| Atribut | Vrednost |
|---------|---------|
| Grad | Niš |
| Baza Reach | 18 buzz |
| Specijalizacija | Underground/alternative scena |
| Loyalty tier start | Tier 1 |
| Cost formula | `100 × 2^(tier-1)` (base: 100 EUR, ali ×2 multiplikator: base cost = **200 EUR**) |
| Unikatna sposobnost | "Underground Network" — za Tier 3+: svaki Social Post troši samo 50 EUR (umesto 80) i ima half-life +1 dan |
| Dijalog trigger | Aktivira se ako `satisfaction.nis ≥ 75` posle Niš eventa |
| Dijalog | *"Dobro si vodio. Niš ne prašta površnim promoterima — ali tebe su primili. To znači nešto."* |
| Slabost | Visoka cena (×2 vs standard), radi samo u Nišu i Sarajevu (nema bonus van ovih gradova) |

**Primer cost:** Mileva Tier 2 → `200 × 2^(2-1) = 400 EUR`.

---

### 6.2 IGOR TRIFUNOVIĆ — Sarajevo

| Atribut | Vrednost |
|---------|---------|
| Grad | Sarajevo |
| Baza Reach | 30 buzz |
| Specijalizacija | Mainstream/pop scena, širok reach |
| Loyalty tier start | Tier 1 |
| Cost formula | Standard: `100 × 2^(tier-1)` |
| Unikatna sposobnost | "Media Blast" — Radio Spot u Sarajevu sa Igorom: reach ×1.5, ali 20% crowd koji dolazi ima `mood_type: 'cold'` (pogrešna publika) |
| Dijalog trigger | Aktivira se kad `crowd_groups` sadrži ≥ 3 'cold' mood grupe istovremeno |
| Dijalog | *"Znam, znam — publika nije baš naša... Ali jesi vidio koliko ih ima? Posao je posao, promotere."* |
| Slabost | "Wrong Audience" mehanika: 20% crowd sa njim su cold mood tipovi koji zahtevaju BPM 105–122 opseg inače daju negativan satisfaction doprinos |

---

### 6.3 MARINA PETROVIĆ — Štrand

| Atribut | Vrednost |
|---------|---------|
| Grad | Štrand (Novi Sad) |
| Baza Reach | 22 buzz |
| Specijalizacija | Ljetna/festival scena, outdoor events |
| Loyalty tier start | Tier 1 |
| Cost formula | Standard: `100 × 2^(tier-1)` |
| Unikatna sposobnost | "Festival Vibe" — Mikro event na Štrandu: zone kapaciteti su +15% veći (outdoor bonus), ali ako BPM > 128 trajno > 30s, heat incident threshold snižen za 20% (sunce + BPM = brže sagorevanje) |
| Dijalog trigger | Aktivira se na startu Štrand makro faze |
| Dijalog | *"Štrand je poseban. Ovde publika dolazi da OSTANE, ne da pobegne. Samo pazi na sunce i BPM — nije kao u clubu."* |
| Slabost | Nema konkretnih slabosti, ali je specijalizovana za Štrand — nema bonus van Štranda |

---

### 6.4 BRANA BARAKONJA — Guncati *(UNLOCKABLE — posle Avala event-a)*

> Eksplicitni MKDSLend/Guncati persona. Ovo je jedini koordinator koji čini MKDSLend brand utility stvarnom, ne dekorativnom.

| Atribut | Vrednost |
|---------|---------|
| Grad | Guncati |
| Baza Reach | 15 buzz (mali grad, ali lokalna zajednica je gusta) |
| Specijalizacija | Permakultura-rooted community building, selo-event organska scena |
| Loyalty tier start | Tier 2 (dolazi sa experience-om, ne može se angažovati ispod Tier 2) |
| Cost formula | `200 × 2^(tier-2)` (Tier 2: 200, Tier 3: 400, Tier 4: 800, Tier 5: 1600) |
| Unikatna sposobnost (Tier 2) | "Guncati Koren" — Guncati round automatski daje +10 buzz u SVIM narednim roundama (carry-over echo). Igrač vidi label "Branino prisustvo" u sledećim gradovima. |
| Unikatna sposobnost (Tier 4+) | "MKDSLend Mreža" — Guncati audience konvertuje u permanentan `connections` resource: `+floor(satisfaction_score × 0.2)` connections po Guncati eventu. Connections se ne resetuju između run-ova. |
| Dijalog trigger 1 | Aktivira se na unlock ekranu (posle Avale) |
| Dijalog 1 | *"Čuo sam šta si uradio na Avali. Guncati te čeka. Ali evo — tamo igramo drugačija pravila. Nema bullshit-a, nema hype-a. Samo zajednica."* |
| Dijalog trigger 2 | Aktivira se ako `satisfaction.guncati ≥ 80` |
| Dijalog 2 | *"Ovo je ono što gradimo u Guncatiju. Ne event — memorija. Vidi ove ljude? Oni se vraćaju. I sledeće godine. I za deset godina."* |
| MKDSLend brand hook | Na Guncati mikro ekranu, venue art sadrži eksplicitne Guncati/MKDSLend vizuale (bunar, voćnjak, zajednički prostor). UI label "MKDSLend prezentuje" u gornjem uglu Guncati ekrana. |

**Guncati čvor vizibilnost:** Guncati je VIDLJIV od starta turneje mape kao locked teaser (siva boja, lokot ikona, tooltip: "Otvara se posle Avale"). Nije skriveni unlockable — aktivan brand seed koji igrač vidi svih 5 gradova.

---

### 6.5 DRAGAN "DEKI" NIKOLIĆ — Avala *(UNLOCKABLE — posle Avala event-a + karrijer tier ≥ Regional)*

| Atribut | Vrednost |
|---------|---------|
| Grad | Avala |
| Baza Reach | 35 buzz |
| Specijalizacija | Large-scale event management, climactic events |
| Loyalty tier start | Tier 3 (veteran — odmah sa iskustvom) |
| Cost formula | `400 × 2^(tier-3)` (Tier 3: 400, Tier 4: 800, Tier 5: 1600) |
| Unikatna sposobnost (Tier 3+) | "Grand Finale Protocol" — Avala event: EQUIPMENT_FAILURE incident je automatski rešen (Deki ima sve na štelovanom), satisfaction bonus +8 flat za Avalu |
| Unikatna sposobnost (Tier 5) | "Legenda Turneje" — ako je Deki na Tier 5 i Avala satisfaction ≥ 90%, aktivira se "Avala Grand Moment" cinematic trigger: poseban endgame vizual + `meta_state.career_tier = 'legenda_turneje'` automatski |
| Dijalog trigger | Aktivira se na Avala makro fazi |
| Dijalog | *"Znam koliko si radio da stigneš ovde. Avala ti nije nagrada — to je test. Ali imaš ko da te drži. Hajde."* |

---

## 7. KARIJER TIER PROGRESSION

| Tier Naziv | ID | Unlock Condition | Permanent Bonus | Prestige Mult na unlock |
|-----------|-----|-----------------|----------------|------------------------|
| Rookie | `rookie` | Start | — | ×1.0 |
| Regional | `regional` | Završi 1 kompletnu turu (5 evenata, Avala included) sa ≥ 3 satisfactions ≥ 70% | +200 EUR starting budget, +5% coordinator reach | ×1.0 (dostupan prestige tek posle 1 tije) |
| Balkanski Fenomen | `balkanski_fenomen` | Završi turu sa sva 4 pre-Avala eventa ≥ 70% satisfaction + Avala ≥ 80% | +600 EUR starting budget, +10% coordinator reach, +1 free promo po gradu | ×1.25 compounding |
| Legenda Turneje | `legenda_turneje` | Avala satisfaction ≥ 90% + 0 CRITICAL incidenata u celoj turi ILI aktivacija "Legenda Turneje" Deki ability | +1,000 EUR starting budget, +20% coordinator reach, prestige multiplier cap podiže se na ×3.05 | ×1.25 compounding |

**Karijer tier se NIKAD ne resetuje** — permanentni meta progres.

**Prestige dostupnost:** Prestige reset je dostupan tek posle `career_tier ≥ regional`.

---

## 8. PRESTIGE SISTEM

### 8.1 Šta se čuva pri prestige reset-u

- `meta_state.career_tier` — NE resetuje se
- `meta_state.prestige_count` — inkrementuje se (+1)
- `meta_state.prestige_multiplier` — raste (×1.25 compounding)
- `meta_state.coordinator_alumni` — zadržava max 2 (ili 3 sa Alumni Extended upgrade-om)
- `meta_state.veteran_insights` — zadržava odabrane insight-e (ne resetuju se)
- `meta_state.achievements` — zadržava sve
- `macro_state.reputation` — NE resetuje se (trajni progres)
- `macro_state.upgrades_purchased` — NE resetuju se (trajni progres!)

### 8.2 Šta se resetuje pri prestige-u

- `macro_state.budget` — resetuje na `base × prestige_multiplier`
- `macro_state.team_energy` — resetuje na 100
- `macro_state.active_coordinators` — čisti (alumni ostaju kao dostupni za 50% cenu)
- `macro_state.coordinator_loyalty` — resetuje (alumni zadržavaju 50% prethodnog loyaltya)
- `macro_state.current_city_index` — resetuje na 0
- `macro_state.tour_complete` — resetuje na false
- `macro_state.promo_investments` — čisti
- `macro_state.event_results` — čisti
- `macro_state.insurance_active` — resetuje

### 8.3 Prestige Multiplier Kriva

```
prestige_multiplier = 1.25^prestige_count
```

| Prestige # | Multiplier | Starting Budget (Rookie) | Starting Budget (Balkanski Fenomen) |
|-----------|-----------|--------------------------|-------------------------------------|
| 0 (base) | ×1.00 | 2,000 EUR | 3,000 EUR |
| 1 | ×1.25 | 2,500 EUR | 3,750 EUR |
| 2 | ×1.56 | 3,120 EUR | 4,687 EUR |
| 3 | ×1.95 | 3,906 EUR | 5,859 EUR |
| 4 | ×2.44 | 4,882 EUR | 7,324 EUR |
| 5 | ×3.05 | 6,103 EUR | 9,155 EUR (cap za Balkanski Fenomen) |

**Legenda Turneje tier:** Prestige cap podiže se na ×3.05 (prestige 5) umesto softcap-a na ×2.44.

### 8.4 Veteran Insights — 6 opcija, biraš 3

Prikazuje se na prestige ekranu pre reset-a. Igrač bira 3 od 6:

| ID | Insight | Efekat |
|----|---------|--------|
| `vi_buzz_decay` | "Buzz pamti" | Buzz decay resistance: promo half-life +1 dan svi tipovi |
| `vi_routing_speed` | "Osećaj za prostor" | Crowd migration speed: +0.4/s (1.2 → 1.6) |
| `vi_loyalty_floor` | "Lojalnost se gradi godinama" | Coordinator loyalty nikad ne pada ispod 40 (ne 0) |
| `vi_energy_reserve` | "Rezerva snage" | max_energy_debt +15 flat (50 → 65 base) |
| `vi_satisfaction_memory` | "Memorija publike" | starting_satisfaction_bonus formula: buzz × 0.35 umesto × 0.30 |
| `vi_incident_delay` | "Iskustvo smiruje" | MEDIUM incidenti imaju +15s pre nego što eskaliraju na HIGH |

**Veteran insights su kumulativne** ako se ista bira kroz više prestige-a:
- `vi_buzz_decay` 2× → half-life +2 dana total
- `vi_routing_speed` 2× → 1.2 + 0.8 = 2.0/s migration speed

### 8.5 Prestige Teaser na UI

Na glavnom ekranu pre prestige reset-a, prikazuje se:
- Koliko koordinatora postaje alumni (top 2 po loyalty)
- Novi starting budget (sa prestige_multiplier)
- Koji insight-i su dostupni
- "Turisti iz [svih gradova]" — sumarna lista reputacija (ostaju!)

---

## 9. PACING PO MINUTAMA

**First playthrough: 45–60 minuta total.**

| Vreme | Šta se dešava | Layer | Note |
|-------|--------------|-------|------|
| 0:00–1:00 | Onboarding: mapa turneje, objašnjenje carry-over | Meta/UI | 3 tooltip, skip dostupno |
| 1:00–3:00 | **Niš Makro** — tutorial. 2 promo akcije, Mileva intro, 1 upgrade slot. Max 3 decisions. | Macro | Bez lose state, guided |
| 3:00–6:00 | **Niš Mikro event** — 3 min (180s). BPM auto-arc. Max 4 talasa (po 30). 1 incident max (LOW). | Micro | Tutorial modal sa hint text |
| 6:00–8:00 | Niš result screen + Sarajevo makro setup | Macro | Carry-over vizuelizacija |
| 8:00–11:00 | **Sarajevo Makro** — puna sloboda. Igor dostupan. 4–5 decisions. | Macro | First non-tutorial grad |
| 11:00–15:00 | **Sarajevo Mikro event** — 4 min (240s). Igor "wrong audience" mechanic aktiva. | Micro | BPM sweet spot challenge |
| 15:00–17:00 | Sarajevo result + Štrand makro setup | Macro | |
| 17:00–19:30 | **Štrand Makro** — prva vendor upgrade odluka stiže | Macro | Upgrade costs sada realni |
| 19:30–23:30 | **Štrand Mikro event** — 4 min. Marina "festival vibe" mechanic. Outdoor feel. | Micro | |
| 23:30–26:00 | Štrand result + Guncati teaser reminder ("locked — otvara se posle Avale") + Avala makro setup | Macro | Guncati čvor vidljiv ali locked |
| 26:00–28:30 | **Avala Makro** — finalna budžet raspodela, max 5 decisions | Macro | Tension peak |
| 28:30–33:30 | **Avala Mikro event** — 5 min (300s). Deki dostupan (ako unlocked). Finalni test. | Micro | Vrhunac igre |
| 33:30–35:00 | **Avala result screen** — satisfaction reveal, reputation total, share karta | Meta/UI | Share CTA #Kluboslavija2026 |
| 35:00+ | Prestige screen (ako career_tier ≥ regional) ILI "Rookie Again" prompt | Meta | Second run unlock |

**Prestige run: 35–45 minuta** (igrač zna mehanike, manje onboarding).

---

## 10. AUDIO EVENT API

> Ovo je granica između Jove i Cece. **Jova samo emituje event-e. Ceca implementira handlere.** API mora biti identičan u oba modula.

### 10.1 API Interfejs

```js
// src/audio.js exports:
export const AudioAPI = {
  onEventStart(cityId),       // grad počinje
  onBPMChange(value),         // DJ slider pomeren
  onPeakPhase(),              // crowd satisfaction > 80% prvi put
  onIncident(severity),       // incident triggered
  onEventEnd(satisfaction),   // event završen
  onCarryOverGuests(buzzValue), // carry-over gosti stigli u prvom talasu
  onZoneOverflow(zoneId),     // zona u overflow
  onMenuOpen(),               // makro screen otvoren
  onUpgradePurchased(),       // upgrade kupen (satisfying sound)
  onCoordinatorHired(coordId) // koordinator angažovan
};
```

### 10.2 Event Specifikacije

#### `onEventStart(cityId: string)`
- **Ko emituje:** `src/systems/micro_engine.js` pri startu event loop-a
- **Ceca implementira:** City-specific ambient start
  - `'nis'`: Low underground bass drone, 60 BPM pulsiranje, dark room feel
  - `'sarajevo'`: Mid-energy Bosnian ex-YU chord, 80 BPM, nostalgičan
  - `'strand'`: Summer outdoor pad, birds ambient, 75 BPM
  - `'guncati'`: Organic acoustic, village textures, 65 BPM
  - `'avala'`: Grand build-up, orchestral swell + electronic base, 85 BPM
- **Timing:** Fade in 2s od poziva

#### `onBPMChange(value: number)`
- **Ko emituje:** `src/ui.js` na svaki slider `input` event
- **Ceca implementira:** Adaptive music tempo match u `config.AUDIO_BPM_SYNC_DELAY` (default 300ms) — ne instant, gradual
  - BPM 90–104: Sparse hi-hat pattern, minimal bass
  - BPM 105–122: Building 4-on-the-floor kick, fuller pad
  - BPM 123–138: Full drop sound, additional layer unlocks
- **Throttle:** Max 1 update per 500ms (ne svaki frame)

#### `onPeakPhase()`
- **Ko emituje:** `src/systems/satisfaction_tracker.js` kad `average_mood > 0.8` first time
- **Ceca implementira:** Audio peak unlock — dodaje treći harmonijski layer (arpeggio ili riser), +6dB boost na master (soft clip), crowd cheer SFX layer
- **Trajanje:** Peak audio stanje traje do `onEventEnd()` ili dok `average_mood < 0.65` (então fade back)

#### `onIncident(severity: 'low' | 'medium' | 'high' | 'critical')`
- **Ko emituje:** `src/systems/incident_manager.js` na incident creation
- **Ceca implementira:**
  - `'low'`: Soft warning chime (C5, 200ms)
  - `'medium'`: Dissonant stab (tritone, 300ms)
  - `'high'`: Alarm riser (400ms), ambient ducks -3dB na 2s
  - `'critical'`: Full audio interrupt — ambient fades 80%, sirena-like LFO (400Hz), 3s
- **Timing:** Sound se trigguje ODMAH, pre modal-a

#### `onEventEnd(satisfaction: number)`
- **Ko emituje:** `src/systems/micro_engine.js` na event end
- **Ceca implementira:** Outro fade baziran na satisfaction
  - satisfaction ≥ 90%: triumphant chord resolve, crowd cheer fade out
  - satisfaction 70–89%: smooth outro, neutral fade
  - satisfaction 50–69%: minor key resolve, muted end
  - satisfaction < 50%: abrupt cut, distant crowd murmur
- **Fade trajanje:** 3s

#### `onCarryOverGuests(buzzValue: number)`
- **Ko emituje:** `src/systems/crowd_spawner.js` na spawn prvog carry-over wave-a
- **Ceca implementira:** Kratki "fanfare" notch (2 tone chord, 500ms) + teksturni "travel" SFX (wind/movement), 1s ukupno
- **Timing:** Simultano sa pojavom guest_carry_over crowd group-a

#### `onZoneOverflow(zoneId: string)`
- **Ko emituje:** `src/systems/zone_manager.js` kad `overflow_active` postane `true`
- **Ceca implementira:** Zone-specific alert SFX:
  - `dance_floor`: Low rumble pulse
  - `bar`: Clinking/crowd noise stutter
  - `chill`: Soft buzz
  - `stage_front`: Higher-pitched crowd press sound
- **Cooldown:** Max 1 per zona per 8s (ne spam)

#### `onMenuOpen()`, `onUpgradePurchased()`, `onCoordinatorHired(coordId)`
- **Ko emituje:** `src/ui.js` na makro screen
- **Ceca implementira:**
  - `onMenuOpen()`: Soft vinyl-scratch transition sound
  - `onUpgradePurchased()`: Satisfying "unlock" chime (G4→C5 major third)
  - `onCoordinatorHired()`: Warm "handshake" two-tone SFX

---

## 11. PERFORMANCE CONSTRAINTS

### 11.1 Particle Caps

| Platforma | Max Aktivnih Particli | Fallback Trigger |
|-----------|----------------------|-----------------|
| Desktop (high-end) | 200 | — |
| Desktop (standard) | 150 | `navigator.hardwareConcurrency < 4` |
| Mobile | 80 | `navigator.hardwareConcurrency < 4 && isMobile` |
| Low-end (Emergency) | 40 | `detected_fps < 30 for 5s` |

**Detekcija (u `src/systems/performance_monitor.js`):**
```js
const cpuCores = navigator.hardwareConcurrency || 2;
const isMobile = /Mobi|Android/i.test(navigator.userAgent);
let particleMode = 'high';  // 'high' | 'medium' | 'mobile' | 'low'

if (isMobile || cpuCores < 4) particleMode = 'mobile';
if (cpuCores < 2) particleMode = 'low';
// + dynamic downgrade na fps detekciji u game loop-u
```

### 11.2 FPS Monitor

U `src/main.js` game loop, pratiti rolling average FPS (window 60 frames):
```js
if (rolling_avg_fps < 30 && particle_cap > 40) {
  particle_cap = Math.max(40, particle_cap - 20);
  // emitovati interni event za render.js da smanji particl density
}
```

### 11.3 DOM Fallback za Crowd Groups

Ako Canvas rendering za crowd grupe postane problematičan na test-u:
- Crowd grupe prikazati kao `div` elementi sa CSS klasa animacijom umesto Canvas `arc()` draw-a
- Fallback trigger: manuelni flag u `config.js`: `CROWD_RENDER_MODE: 'canvas' | 'dom'`
- Pera Piksel priprema oba moda u stilovima — CSS klase `.crowd-group.dance-floor`, `.crowd-group.overflow` itd.

### 11.4 Audio Performance

- Web Audio API: max 8 simultanih `OscillatorNode` instanci (Ceca mora pratiti)
- Audio context: jedinstven singleton (`src/audio.js`), lazy init na prvi user interaction (browser policy)
- Ambient layer: jedan `BufferSourceNode` u loop, ne novi per frame

---

## 12. SHARE KARTA SPEC

### 12.1 Šta Je Prikazano

**Canvas snapshot na kraju Avala event-a.** Format: **9:16 vertikalno** (mobile-share optimized: 1080×1920px ili skaliran 405×720px za web).

**Layout (odozgo ka dole):**

```
┌─────────────────────────────────┐
│  🎵 FESTIVAL MREŽA              │  (logo + naziv igre)
│  #Kluboslavija2026              │  (hashtag watermark)
├─────────────────────────────────┤
│  [NETWORK GRAPH THUMBNAIL]      │  (turnej mapa sa scored gradovima)
│  Niš ●85  Sarajevo ●72         │
│  Štrand ●68  Guncati ●--       │
│  ★ AVALA ●91                   │
├─────────────────────────────────┤
│  Koordinatori:                  │
│  [Mileva portret] [Igor portret]│
│  Mileva • Tier 3  Igor • Tier 2 │
├─────────────────────────────────┤
│  Buzz Rezervoar na Avali: 74   │
│  Karijer Tier: ★ Balkanski     │  
│                  Fenomen        │
│  Prestige: 1×  Mult: ×1.25    │
├─────────────────────────────────┤
│  "Mreža živi.                   │  (Pera Period aforizam)
│   20. jun. Avala. Budite tu."  │
├─────────────────────────────────┤
│  [CTA dugme] Igraj na:          │
│  mkdsl.github.io/gari-daily-   │
│  games/...                     │
└─────────────────────────────────┘
```

### 12.2 Tehničke Napomene za `src/share.js`

- **html2canvas target:** `#share-card-container` DOM element koji je van viewport-a (position: absolute, left: -9999px), NE snapshot live Canvas-a
- Razlog: Multi-Canvas arhitektura (makro mapa Canvas + mikro venue Canvas) nije pouzdana za html2canvas snapshot. Umesto toga, pri `onEventEnd()`, `src/share.js` builduje poseban `#share-card-container` DOM element sa SVG network grafom i text elementima
- **Web Share API fallback:** Ako `navigator.share` nije dostupan → download PNG dugme
- **Network graf u share karti:** SVG, ne Canvas — lakoša za html2canvas
- **Coordinator portreti:** CSS pixel art u `<div>` elementima sa `background-image: url()` CSS pattern (bez .png fajlova) ili inline SVG
- **Watermark:** `#Kluboslavija2026` text u donjem desnom uglu, opacity 0.8
- **Datum i play_url:** Generisani dynamically iz `manifest.json`

### 12.3 Share Intent

```js
navigator.share({
  title: `Festival Mreža — ${career_tier_label} postigao ${avala_satisfaction}% na Avali`,
  text: `Odveo sam Kluboslavija turu kroz ${cities_completed} gradova. Avala: ${avala_satisfaction}%. #Kluboslavija2026 #FestivalMreza`,
  url: 'https://mkdsl.github.io/gari-daily-games/games/2026-06-04-festival-mreza/'
});
```

---

## APPENDIX A: PREDVIĐENI MODULI (za Jova 4a scaffold)

**Cilj: 30–36 modula** (multi-layer igra, gornji deo opsega za single-layer, donji deo za multi-layer).

| Modul | Opis |
|-------|------|
| `src/main.js` | Entry point, game loop wire, layer switch |
| `src/config.js` | Sve tuning konstante (BPM range, particle caps, decay values, cost formule) |
| `src/state.js` | macro/micro/meta state shape, localStorage save/load, migration |
| `src/input.js` | Mouse/touch handlers za slider, redirect buttons, upgrade clicks |
| `src/render.js` | Canvas render dispatcher (delegira na macro_renderer i micro_renderer) |
| `src/ui.js` | DOM UI updates, macro screen layout, event screens, AudioAPI emitters za UI events |
| `src/audio.js` | AudioAPI implementacija (Ceca), sve event handler-i, Web Audio API |
| `src/share.js` | Share karta builder, html2canvas trigger, Web Share API, PNG download fallback |
| `src/systems/macro_engine.js` | Makro round turn logic, decision processing, round end handler |
| `src/systems/micro_engine.js` | Mikro event real-time loop, event_time_elapsed, event end trigger |
| `src/systems/crowd_spawner.js` | Proceduralni crowd wave generisanje, LCG seed, carry-over guest injection |
| `src/systems/zone_manager.js` | Zone state updates, overflow detection, `onZoneOverflow` emitter |
| `src/systems/routing_manager.js` | Redirect button logic, migration speed, follow rate calculation |
| `src/systems/bpm_controller.js` | BPM slider state, floor_temp calculation, Niš auto-arc, `onBPMChange` emitter |
| `src/systems/satisfaction_tracker.js` | satisfaction_delta calculation, energy_debt update, peak phase detection |
| `src/systems/incident_manager.js` | Incident creation, severity escalation, turn-based modal trigger, `onIncident` emitter |
| `src/systems/carry_over.js` | Buzz carry-over formula, reputation calculation, guest crowd group creation |
| `src/systems/promo_engine.js` | Promo decay simulation, buzz akumulacija po gradu, promo cost calculation |
| `src/systems/coordinator_manager.js` | Hiring logic, loyalty updates, retention rolls, alumni management |
| `src/systems/upgrade_manager.js` | Upgrade purchase validation, effect application, prereq checking |
| `src/systems/prestige_manager.js` | Prestige reset logic, veteran insights selection, multiplier calculation |
| `src/systems/progression.js` | Career tier check, achievement unlock, guncati/challenge unlock |
| `src/systems/performance_monitor.js` | FPS tracking, particle_mode detection, hardware concurrency check |
| `src/entities/crowd_group.js` | CrowdGroup class: mood update, energy decay, zone migration |
| `src/entities/zone.js` | Zone class: capacity, current_crowd, overflow_active, mood_average |
| `src/entities/coordinator.js` | Coordinator class: stats, loyalty tier calculation, unique ability apply |
| `src/entities/promo.js` | PromoRecord class: decay calculation, current buzz value |
| `src/rendering/macro_renderer.js` | Network graph Canvas render, city nodes, connection lines, buzz indicators |
| `src/rendering/micro_renderer.js` | Venue top-down Canvas render, crowd particle draw, zone boundaries, floor_temp color |
| `src/rendering/hud_renderer.js` | DOM HUD: satisfaction bar, energy debt bar, BPM indicator, floor temp |
| `src/rendering/incident_modal.js` | Turn-based modal render, options display, choice handler |
| `src/content/aforizmi.js` | Pera Period aforizmi: loading screen + share karta quotes (15–20 aforizama) |
| `src/content/coordinators_data.js` | Coordinator static data (dialogs, base stats, unlock conditions) |
| `src/content/cities_data.js` | City static data (venue tiers, wave configs, audio cityId mapping) |
| `src/content/upgrades_data.js` | Sve 20 upgrades sa svim atributima (tabela iz sekcije 5) |
| `styles/base.css` | Layout, full-screen, responsive |
| `styles/ui.css` | Macro screen UI, cards, buttons, modal |
| `styles/game.css` | Canvas animations, particle pulse, overflow glow, floor temp color transitions |
| `styles/theme.css` | Kluboslavija brand paleta, Guncati varjanta |

**UKUPNO: 39 modula** (38 .js + index.html + 4 CSS = 43 fajla ukupno u projektu).

---

## APPENDIX B: BALANCE SUMMARY

**Ključni brojevi za Jovu da ima u config.js:**

```js
export const CONFIG = {
  // Budžet
  STARTING_BUDGET_BY_TIER: { rookie: 2000, regional: 2400, balkanski_fenomen: 3000, legenda: 3800 },
  EVENT_SUCCESS_INCOME_BASE: 200,
  EVENT_SUCCESS_INCOME_PER_PCT: 15,
  INSURANCE_COST: 300,
  INSURANCE_PAYOUT: 500,

  // Promo
  PROMO_SOCIAL_REACH: 15, PROMO_SOCIAL_COST: 80, PROMO_SOCIAL_HALFLIFE: 2,
  PROMO_FLYER_REACH: 10, PROMO_FLYER_COST: 40, PROMO_FLYER_HALFLIFE: 4,
  PROMO_RADIO_REACH: 25, PROMO_RADIO_COST: 200, PROMO_RADIO_HALFLIFE: 5,

  // Carry-over
  BUZZ_CARRYOVER_FACTOR: 0.7,
  BUZZ_CARRYOVER_CAP: 70,
  SATISFACTION_BONUS_FROM_BUZZ: 0.30,

  // BPM
  BPM_MIN: 90, BPM_MAX: 138, BPM_STEP: 2,
  BPM_COOL_RANGE: [90, 104], BPM_WARM_RANGE: [105, 122], BPM_HOT_RANGE: [123, 138],

  // Crowd
  MIGRATION_SPEED: 1.2,
  REDIRECT_FOLLOW_RATE: 0.70,
  WAVE_INTERVAL_BY_CITY: { nis: 30, sarajevo: 25, strand: 22, guncati: 20, avala: 18 },

  // Energy Debt
  ENERGY_DEBT_ACCUMULATE_RATE: 3.0,
  ENERGY_DEBT_DECAY_RATE: 1.5,
  ENERGY_DEBT_THRESHOLD: 0.7,
  ENERGY_DEBT_MAX_BASE: 50,

  // Satisfaction
  SATISFACTION_WIN_THRESHOLD: 70,
  AVALA_GRAND_WIN_THRESHOLD: 90,

  // Prestige
  PRESTIGE_MULTIPLIER_BASE: 1.25,

  // Coordinator
  COORDINATOR_BASE_COST: 100,
  COORDINATOR_RETENTION_BASE: 0.60,
  LOYALTY_GAIN_SUCCESS: 15,
  LOYALTY_GAIN_FAIL: 3,
  LOYALTY_DECAY_UNUSED: -5,

  // Performance
  PARTICLE_CAP_HIGH: 200,
  PARTICLE_CAP_MEDIUM: 150,
  PARTICLE_CAP_MOBILE: 80,
  PARTICLE_CAP_LOW: 40,
  FPS_DOWNGRADE_THRESHOLD: 30,

  // Proceduralni seed
  CROWD_SEED_PRIME_A: 6364136223846793005n,
  CROWD_SEED_PRIME_B: 1442695040888963407n,

  // Audio
  AUDIO_BPM_SYNC_DELAY: 300,
  AUDIO_OVERFLOW_COOLDOWN: 8000,
};
```

---

**Broj upgrades u tabeli: 20** (P1–P7 + C1–C7 + V1–V6)

**Broj predviđenih modula za implementaciju: 39** (38 JS modula + index.html; 4 CSS fajla = 43 fajla ukupno)
