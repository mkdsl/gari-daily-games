# Game Design Document: Avala Crew

**Datum:** 2026-06-06  
**Agent:** Mile Mehanika  
**Input:** concept.md + premortem.md  
**Stage:** concept → impl handoff

---

## 0. Premortem adresiranje (pre svega ostalog)

Nega je flagovala CRITICAL R1: "scenario sistem nedovoljno specifikovan". Ovaj GDD rešava tačno to — kompletna resolution matrica, stat scoring formula, i Aftermath stack definition su u Sekciji 3. Nega R2 (dužina sesije) je adresiran u Sekciji 5: 10 scenarija po noći, ne 15.

---

## 1. Karte — Kompletna stat matrica

### Skala statistika

Svaki crew member ima 4 stats, svaki od 1 do 5:
- **Energija (E)** — fizička i emotivna izdržljivost, transport scenariji, noćna dugovečnost
- **Social (S)** — komunikacija, grupna dinamika, "zalepiti grupu", susret sa strancima
- **Ples (P)** — dance floor kompetentnost, muzičko čulo, noćni ritam
- **Logistika (L)** — organizacija, planiranje, navigacija, problem solving

**Ukupan stat zbir (E+S+P+L):** Svaka karta ima max **14** bodova ukupno (balans constraint — ne postoje "sve 5" karte). Starter karte: max 14. Unlocked karte: max 15 (blagi power creep kao reward).

### Starter karte (6) — Kompletna matrica

| # | Ime | E | S | P | L | Ukupno | Pasivni Trait | Aktivna Sposobnost | CD |
|---|-----|---|---|---|---|--------|---------------|--------------------|----|
| 1 | **Maja Magnetar** | 5 | 4 | 3 | 2 | 14 | Contagious: svi crew dobijaju +1E na početku Faze Vrh | Spark: +8 Night Score (1× po noći) | — |
| 2 | **Dragan Navigatorović** | 2 | 3 | 1 | 5 | 11 | Always Has a Plan: Logistika scenariji minimum 50% resolution | Reroute: poništi jedan Aftermath debuff (1× po noći) | — |
| 3 | **Ana Atmosfera** | 3 | 5 | 2 | 2 | 12 | Webs: Social scenariji +3 Night Score kad Ana je u crew | Connect: failed Social → partial win (1× po noći) | — |
| 4 | **Bojan Breakdancer** | 2 | 2 | 5 | 1 | 10 | Floor Commander: Dance scenariji u Fazi Vrh +25% resolution | Solo: Dance scenario auto-win (1× po noći) | — |
| 5 | **Lena Lokalni Znalac** | 3 | 3 | 2 | 4 | 12 | Home Turf: Navigation scenariji guaranteed partial win | Shortcut: preskoči 1 Logistics scenario — auto-resolve neutral (1× po noći) | — |
| 6 | **Pedja Sentimental** | 4 | 4 | 3 | 1 | 12 | Memory Keeper: +5 Night Score posle svake kompletne Faze | Toast: konvertuj 1 Kaos aftermath → Neutral (1× po noći) | — |

**Napomena za Jovu:** Svaki stat je integer 1–5. "Aktivna Sposobnost" se triggeruje kliком u toku scenarija. Cooldown (CD) je "1× po noći" — tj. boolean flag koji se resetuje na početku svake nove noći.

---

### Unlocked karte (6) — Ekspanzija roster-a

| # | Ime | E | S | P | L | Ukupno | Unlock uslov | Trait / Sposobnost |
|---|-----|---|---|---|---|--------|-------------|-------------------|
| 7 | **Mirko Multiresurs** | 3 | 3 | 3 | 3 | 12 | 3 noći completed | Trait: Flexible — može popuniti bilo koju ulogu bez debuffa. Ability: Adapt — kopiraj stat bonus poslednjeg aktivnog crew member (1× po noći) |
| 8 | **Tanja Techno** | 2 | 3 | 5 | 2 | 12 | Bojan Bond Nivo 2 | Trait: BPM Locked — Dance scenariji u svim fazama +30% (ne samo Vrh). Ability: Drop — jednom po noći, odmah triggeriraj sledeći scenario kao Dance tip |
| 9 | **Stefan Stres** | 4 | 2 | 2 | 5 | 13 | 5 noći (any outcome) | Trait: Worst Case Prepared — kad Night Score padne ispod 40, sve Logistika resolution krivulje se flattened (+15% bonus). Ability: Emergency Protocol — jednom po noći, jedna Aftermath chain je prekinuta |
| 10 | **Ivana Influencer** | 3 | 5 | 2 | 3 | 13 | Ana Bond Nivo 2 | Trait: Content Machine — svaki scenario koji završi kao Win generiše +2 Night Score bonus. Ability: Story Time — jednom po noći, povećaj Share Score multiplier za 1.2× |
| 11 | **Guncati Lokalni** | 4 | 3 | 1 | 4 | 12 | 1 Prestige run | Trait: Rural Calm — Energy scenariji nikad ne daju exhausted status. Ability: Slow Down — jednom po noći, pauzira Aftermath snowball za 2 scenarija |
| 12 | **Tonović DJ** | 2 | 4 | 5 | 1 | 12 | "Legendarna noć" achievement | Trait: Professional Ear — Dance i Social scenariji daju dvostruki Night Score bonus. Ability: Set Peak — jednom po noći u Fazi Vrh, sve preostale scenarije u Fazi dobijaju +15% resolution bonus |

---

## 2. Uloge — Stat modifikatori

Svaki crew member dobija jednu od 5 uloga. Uloga modulira koji stats se pojačavaju za koje scenario tipove.

| Uloga | Pojačani stat | Pojačanje | Smanjeni stat | Kazna |
|-------|--------------|-----------|--------------|-------|
| **Navigator** | Logistika | ×1.4 | Ples | ×0.7 |
| **Hype Person** | Energija + Social | ×1.3 svaki | Logistika | ×0.6 |
| **Logistics** | Logistika + Energija | ×1.3 svaki | Social | ×0.7 |
| **Dance Captain** | Ples | ×1.5 | Logistika | ×0.5 |
| **Anchor** | Social + Energija | ×1.2 svaki | — | — (balans uloga, nema debuff) |

**Pravilo dobrih uloga:** Ako igrač postavi crew member u "prirodnu" ulogu (najviši stat = uloga affinity), dobija +10% bonus na sve resolution checks. Prikazati ovo vizuelno kao "Good Fit" indikator u roster screenu.

---

## 3. Scenario Resolution sistem (KOMPLETNA MATRICA)

### 3.1 Scenario tipovi

Svaki scenario je jedan od 5 tipova — tip određuje koji stats se **primarno** testiraju:

| Tip | Primarni stat | Sekundarni stat | Opis tipa |
|-----|--------------|----------------|-----------|
| **E** (Energy) | Energija | Logistika | Fizički izazov, zamor, dugo čekanje |
| **S** (Social) | Social | Energija | Međuljudska situacija, stranac, grupna dinamika |
| **P** (Dance) | Ples | Social | Muzika, dance floor, ritam situacija |
| **L** (Logistics) | Logistika | Energija | Navigacija, problem rešavanje, koordinacija |
| **X** (Mixed) | Energija + Social | Ples + Logistika | Kompleksni scenario, sve stats releantne |

### 3.2 Resolution formula

**Crew Score za scenario** = suma primarnog stat-a svih 5 članova × uloga modifikator + pasivni trait bonusi + aktivne sposobnosti (ako aktivirane)

```
CrewScore = Σ(member.primaryStat × roleMultiplier) + Σ(passiveTraitBonus) + activeAbilityBonus
```

**Scenario Threshold:** Svaki scenario ima definisan `successThreshold` i `partialThreshold`:
- `CrewScore ≥ successThreshold` → **WIN** — scenario se rešava pozitivno, dobija Night Score bonus
- `partialThreshold ≤ CrewScore < successThreshold` → **PARTIAL** — delimično rešen, manji Night Score, manji Aftermath negativan efekat  
- `CrewScore < partialThreshold` → **FAIL** — scenario propada, nema Night Score, negativan Aftermath

**Gradijentni Night Score po scenariju:**
```
scenarioScore = WIN:  baseScore × (1.0 + (CrewScore - successThreshold) / 20)
                      capped na baseScore × 1.5
PARTIAL: baseScore × 0.5
FAIL:    0 (+ negativni Aftermath)
```

### 3.3 Threshold kalibracija — Starter crew reference

Starter crew (sve 6 karata, "prirodne" uloge) ima sledeće prosečne stat sume:
- Energija suma (5 članova): ~17 (bez uloga modifikatora)
- Social suma: ~21
- Ples suma: ~16
- Logistika suma: ~14

**Dizajn princip:** `successThreshold` je kalibrisan na ~75% optimalne kombinacije = da bi WIN bio moguć sa dobrim izborom uloga, a ne samo sa max stats. `partialThreshold` = ~50% optimalne kombinacije.

| Scenario tip | successThreshold (bez modifikatora) | partialThreshold |
|-------------|-------------------------------------|-----------------|
| E (Energy) | 20 | 12 |
| S (Social) | 22 | 14 |
| P (Dance) | 19 | 11 |
| L (Logistics) | 18 | 10 |
| X (Mixed) | 38 (E+S) | 24 |

**Napomena:** Thresholds se skaliraju sa Prestige faktorom: `threshold × (1.0 + prestigeLevel × 0.15)`. Na Prestige 1: thresholds su 15% viši.

### 3.4 Aftermath sistem

Aftermath je **buff/debuff modifier** koji se primenjuje na naredni(e) scenario(e) posle tekućeg.

**Format:**
```
Aftermath = { type: "buff"|"debuff", magnitude: 0.05-0.30, duration: 1-3 scenarija, statAffected: "E"|"S"|"P"|"L"|"all" }
```

**Aftermath stack pravila:**
1. Maksimalno **3 aktivna Aftermath-a** istovremeno (novi brisgu najstariji ako je stack pun)
2. `buff` i `debuff` na isti stat se **ne oduzimaju direktno** — primenjuju se multiplikativno: `(1 + buff) × (1 - debuff)` na stat za taj scenario
3. Pedja Toast sposobnost konvertuje jedan FAIL Aftermath u `{type: "neutral", magnitude: 0, duration: 0}` — efektivno ga uklanja
4. Dragan Reroute poništava jedan debuff Aftermath (uklanja ga iz stack-a potpuno)

**Aftermath vizualizacija:** Aktivni Aftermath-i prikazani kao mali ikone na dnu scenarija screena (max 3 ikone). Buff = zelena strelica gore. Debuff = crvena strelica dole. Duration = broj pored ikone.

---

## 4. Scenario baza — 20 scenarija

Noć uvek ima **10 scenarija**: 3 u Sabiranje fazi + 4 u Vrh fazi + 3 u Rastanak fazi. Pool je 20 scenarija — svaka noć bira semi-nasumično iz pool-a (seed baziran na datum + karijer tier), sa garantijom da se svaki tip (E/S/P/L/X) pojavi barem jednom.

### 4.1 SABIRANJE FAZA (3 scenarija, selection pool: scenariji 1–8)

| ID | Naziv | Tip | baseScore | successThreshold | partialThreshold | WIN Aftermath | FAIL Aftermath |
|----|-------|-----|-----------|-----------------|-----------------|---------------|----------------|
| S01 | **"Ko vozi?"** | L | 12 | 18 | 10 | +5% Logistika buff (2 scenarija) | -10% Energija debuff (1 scenario) |
| S02 | **"Gde se skupljamo?"** | L | 10 | 18 | 10 | +3 Night Score bonus (flat) | +5 minute delay narrative, -5 Night Score |
| S03 | **"Neko ne može da nađe outfit"** | S | 10 | 22 | 14 | +10% Social buff (2 scenarija) | -5% Social debuff (2 scenarija) |
| S04 | **"Taksi košta duplo"** | E | 11 | 20 | 12 | +8% Energija buff (1 scenario) | -8% Energija debuff (2 scenarija) |
| S05 | **"Neko hoće da dovedе +1"** | S | 13 | 22 | 14 | +15 Night Score (bonus +1 klik karata) | -10 Night Score + "stranac" Mixed scenario ubačen |
| S06 | **"Lista/rezervacija pitanje"** | L | 11 | 18 | 10 | Skip linije Aftermath: +10% svi stats (1 scenario) | -15 Night Score flat |
| S07 | **"Kašnjenje 45 minuta"** | E | 9 | 20 | 12 | "Adrenalinski bonus" — +15% sve stats naredna 2 | -10% Energija debuff (3 scenarija) |
| S08 | **"Neko se premišlja"** | X | 14 | 38 | 24 | +10 Night Score + crew moral buff (all stats +5% za 2) | -20 Night Score + 1 crew member "hesitant" (debuff na Anchor ulozi) |

### 4.2 VRH FAZA (4 scenarija, selection pool: scenariji 9–15)

| ID | Naziv | Tip | baseScore | successThreshold | partialThreshold | WIN Aftermath | FAIL Aftermath |
|----|-------|-----|-----------|-----------------|-----------------|---------------|----------------|
| V01 | **"Koji stage?"** | P | 14 | 19 | 11 | Dance buff +20% (naredna 2 scenarija) | Split crew risk: -10 Night Score, debuff Anchor (2 scenarija) |
| V02 | **"Nekoga nema — telefon ne radi"** | L | 15 | 18 | 10 | "Found!" +15 Night Score | -25 Night Score + "Lost Member" status (persistent za ostatak Vrha) |
| V03 | **"Ko ide po pića?"** | E | 12 | 20 | 12 | Energy buff +10% crew (2 scenarija) | -10% Energija debuff (2 scenarija) |
| V04 | **"Susret sa eks"** | S | 16 | 22 | 14 | Unexpectedly Great buff: +20 Night Score | -15 Night Score + Social debuff (1 scenario) |
| V05 | **"Mešanje s drugom ekipom"** | S | 14 | 22 | 14 | +10 Night Score + Social chain bonus (flat +3 na sledeći S) | -10 Night Score |
| V06 | **"Peak hora — niko neće sa dance floora"** | P | 17 | 19 | 11 | Night Score × 1.1 multiplier za ostatak Vrha | Miss the peak debuff: -15% Ples stats (2 scenarija) |
| V07 | **"Neko se loše oseća"** | E | 13 | 20 | 12 | Pulled Through buff: +moral bonus (all +5% 2 scenarija) | -20 Night Score + 1 crew member "exhausted" |

### 4.3 RASTANAK FAZA (3 scenarija, selection pool: scenariji 16–20)

| ID | Naziv | Tip | baseScore | successThreshold | partialThreshold | WIN Aftermath | FAIL Aftermath |
|----|-------|-----|-----------|-----------------|-----------------|---------------|----------------|
| R01 | **"Svi zajedno ili po grupama?"** | S | 12 | 22 | 14 | Cohesion bonus: +10 Night Score (flat) | Scatter debuff: -15 Night Score |
| R02 | **"Taxi ratova u 3 ujutro"** | L | 14 | 18 | 10 | "Organized Exit" bonus: +8 Night Score | -10 Night Score + latency penalty |
| R03 | **"Ko ide na after?"** | X | 15 | 38 | 24 | After Party bonus: Night Score × 1.15 multiplier | No after, Night Score nepromenjen (neutral outcome) |
| R04 | **"Zajednička slika pre rastanka"** | S | 10 | 22 | 14 | Share Score × 1.3 (multiplikator za share kartu) | Share Score × 0.8 |
| R05 | **"Svi kući bezbedno?"** | E | 11 | 20 | 12 | +12 Night Score + "Dobra noć" label guarantee ako score ≥ 55 | -5 Night Score |

---

## 5. Night Score ekonomija

### 5.1 Scoring formula

**Night Score** (0–100) se računa kroz noć:

```
baseNightScore = 0

Per scenario:
  if WIN:     nightScore += scenarioBaseScore × winMultiplier × aftermathStack
  if PARTIAL: nightScore += scenarioBaseScore × 0.5 × aftermathStack
  if FAIL:    nightScore += 0 (+ negativni Aftermath primenjeni)

endOfPhaseBonus:
  Faza Sabiranje complete (sve 3): +5 Night Score
  Faza Vrh complete (sve 4):      +8 Night Score
  Faza Rastanak complete (sva 3): +7 Night Score

Crew Integrity bonus (po završetku):
  Svi crew prisutni i non-exhausted: +10 Night Score
  4/5 crew: +5 Night Score
  3/5 ili manje: +0

Synergy bonus (po noći):
  Per aktivna sinergija koja se "okinula" u noći: +3 Night Score (max 5 sinergija = +15 max)
```

**Finalni Night Score** = min(nightScore, 100)

### 5.2 Win/Lose tabela

| Score | Outcome | Label | Efekti |
|-------|---------|-------|--------|
| 85–100 | **Legendarna noć** | "Za legende se priča" | +5 Crew XP, Prestige unlock ako je prvi put, Share Score ×1.5 |
| 60–84 | **Dobra noć** | "Biće priče za godinu dana" | +3 Crew XP, Share Score ×1.0 |
| 35–59 | **Preživeli smo** | "Moglo je i gore" | +1 Crew XP, Share Score ×0.7 |
| 0–34 | **Kaos noć** | "Nikad više... do sledeće subote" | +0 Crew XP, Share Score ×0.5, "Kaos" badge na share karti |

**Automatic Fail trigger:** Ako 2+ crew members dobiju "Exhausted" status tokom Vrh faze → noć se završava sa Night Score = tekući score × 0.6 (penalty), outcome se ne može poboljšati iznad "Preživeli smo".

---

## 6. Sinergija sistem — 8 sinergija u starter setu

| ID | Karte | Naziv sinergije | Efekat | Vidljivost |
|----|-------|----------------|--------|------------|
| SYN01 | Maja + Ana | **Magnetar × Webs** | Social scenariji +20% resolution | Vidljiva od roster screen-a |
| SYN02 | Dragan + Lena | **Plan × Znalac** | Logistika scenariji WIN threshold snižen za 3 | Vidljiva od roster screen-a |
| SYN03 | Bojan + Maja | **Floor × Spark** | Dance scenariji u Vrhu +35% (umesto 25%) | Otkriva se prvi put kad oba u crew |
| SYN04 | Ana + Pedja | **Webs × Sentimental** | Na kraju svake Faze +8 Night Score (umesto +5 Pedja) | Otkriva se prvi put |
| SYN05 | Lena + Dragan | **Shortcut × Reroute** | Jednom po noći, mogu se oba sposobnosti koristiti na istom scenariju (normalno samo 1 po scenariju) | Skrivena — discovery |
| SYN06 | Maja + Bojan | **Energija × Floor** | Ako su oba na stage, Exhausted status se ne može dodeliti u Fazi Vrh | Skrivena — discovery |
| SYN07 | Pedja + Ana | **Memory × Atmosfera** | Svi Social AND Energy scenariji daju minimum PARTIAL (nikad čisti FAIL) | Skrivena — discovery |
| SYN08 | Dragan + Pedja | **Plan × Sentiment** | Aftermath stack maksimum povećan na 4 (umesto 3), i Dragan Reroute resetuje svaki put Pedja Memory keeper se triggeruje | Skrivena — discovery |

**Unlock karte sinergije (4 dodatnih, otkrivaju se igrom):**
| ID | Karte | Efekat |
|----|-------|--------|
| SYN09 | Tanja + Bojan | Dance karte auto-WIN u Rastanak fazi |
| SYN10 | Ivana + Ana | Social WIN scenariji daju ×1.5 Share Score |
| SYN11 | Stefan + Dragan | Logistics FAIL ne generiše negativne Aftermath-e |
| SYN12 | Mirko + bilo ko | Mirko kopirani stat bonus + 10% ako partner ima Bond Level 1+ |

---

## 7. Meta progresija — Unlock tree

### 7.1 Crew XP i unlock krive

| Noć | Kumulativni XP (Legendarna) | Kumulativni XP (Dobra) | Unlock |
|-----|---------------------------|----------------------|--------|
| 1 | 5 | 3 | Starter roster dostupan |
| 2 | 10 | 6 | Mirko Multiresurs (7) unlocked na 9 XP |
| 3 | 15 | 9 | Mirko unlock threshold: 9 XP |
| 4 | 20 | 12 | Bond Level 1 dostupan za pair koji ima 2+ zajedničkih noći |
| 5 | 25 | 15 | Stefan Stres (9) unlocked na 15 XP; Tanja Techno potreba Bond Bojan L2 |
| 6 | 30 | 18 | Ivana Influencer potreba Bond Ana L2 |
| 7–10 | +5/+3 per noć | +3/+2 | Bond Level 2 threshold: 4 zajedničke noći (par mora 4x biti u istom crew-u) |
| 11–15 | accumulate | accumulate | Bond Level 3 threshold: 7 zajedničkih noći |
| 16+ | Prestige threshold | Prestige threshold | Prestige 1 threshold: 1 "Legendarna noć" + ukupno 50 Crew XP |

### 7.2 Bond sistem — krive i thresholds

| Bond Nivo | Zajedničke noći | Efekat |
|-----------|----------------|--------|
| Bond 0 | 0–1 | Nema bonus |
| Bond 1 | 2 | +5% synergy bonus na sve scenarije gde su oba aktivna |
| Bond 2 | 4 | Unlock zajednički Trait (specifičan za par — vidi SYN09–12) |
| Bond 3 | 7 | Unique Bond scenario se pojavljuje u pool-u — samo kad su oba u crew-u |

**Bond 3 Unique Scenariji (4, po paru):**
- Bojan + Maja: **"Spontani ples krug"** — Dance auto-WIN, +20 Night Score
- Ana + Pedja: **"Zajednička fotografija"** — Social auto-WIN + Share Score ×1.4
- Dragan + Lena: **"Imamo rezervni plan"** — Logistics auto-WIN + sve debuff Aftermath-i poništene
- Mirko + bilo ko: **"Isti talas"** — Mixed scenario sa 50% WIN chance ali ×3 Night Score ako WIN

### 7.3 Prestige — "Veteran Noći" mod

**Prestige trigger:** 1 "Legendarna noć" + 50 Crew XP  
**Prestige rewards (permanent, ostaju posle reset-a):**
- Prestige 1: Sve unlock karte dostupne za purchase odmah (ne čekanje na XP threshold) — ali sa "price" od 15 Crew XP svaka
- Prestige 2: Scenario pool proširen za 5 novih scenarija (hardcore varijante)
- Prestige 3: "Avala Pro" mode unlock — sve faze imaju po +1 scenario (4+5+4 = 13 scenarija po noći)

**Prestige reset šta se gubi:** Crew XP reset na 0; Bond Level-i resetuju za 1 nivo (Bond 2 → Bond 1, Bond 1 → Bond 0)  
**Šta ostaje posle reset-a:** Svi unlocked crew member-i; Bond Level 3 je permanent (ne resetuje se ni posle prestige-a); Prestige multiplier na Night Score: `nightScore × (1 + prestigeLevel × 0.05)` (5% po prestige)

---

## 8. Progression kriva — pacing po minutama

### 8.1 Prva partija (igrač nikad nije igrao)

| Minuta | Šta se dešava | Što igrač oseća |
|--------|--------------|----------------|
| 0:00 | Intro screen, Avala branding, kratki copy | Uzbuđenje, prepoznatljivost |
| 0:30 | Tutorial tooltip: "Beri 5 crew članova" | Engagement, "razumem" |
| 1:00 | Roster screen sa 6 starter karata | Istraživanje, "ovo su tipovi koje poznajem" |
| 2:00 | Sinergija preview se pojavljuje prvi put (SYN01 ako Maja+Ana) | Otkrivanje, "ne moram sve znati" |
| 2:30 | Uloga selekcija, "Good Fit" indikator | Mala pobeda, osećaj kompetentnosti |
| 3:00 | Faza Sabiranje — scenario S01 "Ko vozi?" | Situaciona prepoznatljivost, humor |
| 5:00 | Faza Sabiranje završena, +5 Night Score bonus | Progress feedback, mali high |
| 5:30 | Faza Vrh počinje, atmosfera se menja (audio, vizuel) | Uzbuđenje, "sad počinje" |
| 9:00 | Faza Vrh završena (4 scenarija) | Kulminacija, igrač oseća ishod |
| 11:00 | Faza Rastanak (3 scenarija, brže) | Emotional landing, humor ili drama |
| 13:00 | Outro screen: Night Score, outcome label | Sažimanje, satisfakcija ili "opet" |
| 14:00 | Share karta generisana, ticketing CTA | Share momenat, brand utility isporučena |
| 14:30 | "Sledeća noć" prompt + "šta-bi-bilo-da" panel | Replayability hook, curiosity |

### 8.2 Prestige run (igrač ima 5+ noći iskustva)

| Faza | Trajanje | Razlika od prve partije |
|------|---------|------------------------|
| Roster | 1–2 min | Brži (zna karte), ali više opcija (12 karta) |
| Scenario resolution | 9–11 min | Harder thresholds, ali sporiji donošenje odluka |
| Outro + Share | 1 min | Beleži se prestige badge na share karti |
| Ukupno | 11–14 min | Brže al' teže |

---

## 9. Balance napomene za impl

### 9.1 Exploit zone — šta treba cap-ovati

**Exploit 1: Maja + Bojan combo (SYN06 — Exhausted immunity)**  
Ova sinergija je izuzetno snažna — sprečava game over trigger u Vrhu. Balans: sinergija mora biti skrivena (discovery, ne vidljiva od starta) i Maja+Bojan zajedno daju deficit u Logistika stats (Maja L=2, Bojan L=1 → Logistics scenariji teži). Cap nije potreban, ali igrač mora osećati tradeoff.

**Exploit 2: Dragan Reroute + Aftermath farming**  
Teoretski igrač može namerno da "uplije" u FAIL scenarije da napuni Aftermath stack, pa sve Reroute-om poništi → nema negativnih efekata. Fix: Reroute poništava **jedan** debuff, ali FAIL scenariji uvek direktno daju Night Score = 0 (ne može se retroaktivno "popraviti"). FAIL je FAIL bez obzira na Aftermath poništavanje.

**Exploit 3: Pedja Toast stacking**  
Ako igrač svaki run stavlja Pedja kao Anchor, Toast sposobnost je uvek dostupna za najgori scenario. Ovo je intentional gameplay, ne exploit — Pedja je "safe" pick, ali žrtvuješ offense slot. Anchor uloga daje Social + Energija ×1.2 ali nema debuff — Pedja je "balanced safe" karakter po dizajnu.

### 9.2 Šta je najlakše za exploit (warning za Jovu)

- **Aktivna sposobnost spam:** Igrač koji ne zna kada da koristi sposobnosti može ih ispaliti na prvom scenariju. Preporuka: UI mora jasno pokazati "1× po noći" status i da li je sposobnost spent ili ne.
- **Uloga mismatch nije jasna:** Ako igrač ne vidi vizuelni feedback za "pogrešnu ulogu" (debuff), može igrati svu noć sa suboptimalnim setup-om i ne razumeti zašto score pati. "Good Fit" indikator mora biti jasan, ne samo tekst.

### 9.3 Tuning varijable koje Jova mora da eksponuje u config.js

```js
// Scenario thresholds base values (skalirani gore po prestige)
SCENARIO_THRESHOLDS = { E: 20, S: 22, P: 19, L: 18, X_primary: 38 }
SCENARIO_PARTIAL_THRESHOLDS = { E: 12, S: 14, P: 11, L: 10, X_primary: 24 }

// Aftermath stack max
AFTERMATH_STACK_MAX = 3 // (4 sa SYN08 aktivnom)

// Score caps i multiplieri
NIGHT_SCORE_CAP = 100
PHASE_COMPLETION_BONUSES = { gathering: 5, peak: 8, departure: 7 }
CREW_INTEGRITY_BONUS = { all5: 10, four: 5, three_or_less: 0 }
SYNERGY_BONUS_PER_ACTIVATION = 3
MAX_SYNERGY_BONUS = 15

// Crew XP table
XP_PER_OUTCOME = { legendary: 5, good: 3, survived: 1, kaos: 0 }
XP_UNLOCK_THRESHOLDS = { mirko: 9, stefan: 15 }

// Bond thresholds
BOND_LEVEL_THRESHOLDS = [0, 2, 4, 7] // zajedničke noći za Bond 0/1/2/3

// Prestige scaling
PRESTIGE_THRESHOLD_MULTIPLIER = 0.15 // 15% harder thresholds per prestige level
PRESTIGE_SCORE_MULTIPLIER = 0.05    // 5% night score bonus per prestige level
```

### 9.4 Scenario selekcija — semi-proceduralni algoritam

```
Faza Sabiranje (3 od 8):
  - Garantovan 1 L-tip scenario
  - Garantovan 1 S ili E-tip scenario
  - Treći: random iz ostatka (seed baziran na date + careerTier)

Faza Vrh (4 od 7):
  - Garantovan 1 P-tip (dance)
  - Garantovan 1 S-tip (social)
  - Garantovan 1 E ili L-tip
  - Četvrti: random, ali ako Bond 3 scenarij je eligible → prioritet za Bond 3

Faza Rastanak (3 od 5):
  - Garantovan R04 "Zajednička slika" (uvek) — jer direktno utiče na Share Score
  - Ostala 2: random iz R01/R02/R03/R05
```

**Seed logika:** `Math.seedrandom(date + careerTier + nightNumber)` — isti dan i isti tier = ista noć, ali različiti career tier = drugačija noć. Igrači na istom tieru mogu "podeliti" noć kao social element.

---

## 10. Napomene za Jovu (Impl brief)

1. **config.js** — sve tuning varijable iz Sekcije 9.3 moraju biti u jednom fajlu, ne hardkodirane u logici
2. **state.js** — game state mora da čuva: activeCrew (5 membera + uloge), activeAftermath[], nightScore, phaseIndex, scenarioIndex, crewXP, bondLevels{}, prestigeLevel, completedNights[], spentAbilities{}
3. **entities/crewMember.js** — klasa sa: id, name, stats{E,S,P,L}, passiveTrait, activeAbility, abilitySpent (bool), bondPartners{}
4. **entities/scenario.js** — klasa sa: id, name, type, baseScore, thresholds, aftermaths{win,fail}, choiceOptions[] (opciono za X-tip scenarije)
5. **systems/resolution.js** — čista funkcija: `resolveScenario(crew, scenario, aftermath_stack, activeAbilities)` → `{outcome: "win"|"partial"|"fail", scoreGained, aftermathsToAdd[]}`
6. **systems/synergy.js** — detektuje aktivne sinergije na osnovu currentCrew[] → vraća `activeSynergies[]` za preview i za bonus kalkulaciju
7. **systems/progression.js** — XP, bond tracking, prestige logic, unlock gating
8. **share.js** — **Impl prioritet #1** (Nega R-3 kritika) — html2canvas + Web Share API, mora raditi na mobilnom, generisana karta mora biti share-ready za Instagram/Twitter format
