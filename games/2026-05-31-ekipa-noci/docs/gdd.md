# Ekipa Noći — Game Design Document

**Žanr:** Card / Kombinator — Multi-Layer Crew Builder  
**Verzija:** 1.0  
**Datum:** 2026-05-31  
**Autor:** Mile Mehanika

---

## 1. Kompletna lista karata

Svaki event zahteva popunu 5 rola: **DJ, Host, Sound, Video, Security**. Po roli postoji pool od 5 karata; igrač bira 1 po roli (draft), ukupno 5 poteza po eventu.

### DJ rola

| # | Ime | Traits | Synergy tagovi | base_score | cost | special_ability |
|---|---|---|---|---|---|---|
| D1 | Dražen Bura | Veteran, Introvert | #techno, #precision, #lowmaintenance | 22 | 14 | +4 score ako Sound ima #precision tag |
| D2 | Lena Voltage | Rookie, Ekstrovert | #hype, #risky, #crowdread | 16 | 9 | +6 score ako je Event Score publike preferira #hype |
| D3 | MC Phantom | Wildcard, Heavy Hitter | #unpredictable, #magnet, #burnout | 27 | 18 | +10 vibe na kraju eventa; -5 ako u ekipi postoji drugi #burnout |
| D4 | Toni Groove | Veteran, Ekstrovert | #versatile, #easygoing, #stamina | 20 | 13 | Ne generiše conflict penale sa drugim Veteran kartama |
| D5 | Zara Static | Rookie, Introvert | #underground, #purist, #growthpotential | 13 | 7 | +3 base_score na svakom sledećem eventu gde ostaje u ekipi (max +9) |

### Host rola

| # | Ime | Traits | Synergy tagovi | base_score | cost | special_ability |
|---|---|---|---|---|---|---|
| H1 | Filip Sena | Veteran, Ekstrovert | #charisma, #crowdcontrol, #expensive | 24 | 19 | Poništava jedan conflict penal u ekipi po eventu |
| H2 | Mia Flare | Rookie, Ekstrovert | #energy, #impulsive, #viralmoment | 17 | 10 | +8 score ako Video ima #viralmoment ili #hype tag |
| H3 | Darko Mirni | Veteran, Introvert | #calm, #organizer, #backstageleader | 21 | 13 | +5 production bonus ako Sound ima #precision ili #lowmaintenance |
| H4 | Sasha Bold | Wildcard, Heavy Hitter | #controversy, #memeable, #polarizing | 26 | 17 | +12 score ako je Event Score publike Legenda tier; -10 ako je Kiks tier |
| H5 | Ana Tiha | Rookie, Introvert | #warm, #reliable, #undertheradar | 14 | 8 | Nikad ne izaziva #burnout; ostaje u ekipi bez obzira na Event Score |

### Sound rola

| # | Ime | Traits | Synergy tagovi | base_score | cost | special_ability |
|---|---|---|---|---|---|---|
| S1 | Bojan Eq | Veteran, Introvert | #precision, #technical, #lowmaintenance | 21 | 13 | +5 score ako DJ ima #techno ili #purist tag |
| S2 | Katja Bass | Rookie, Ekstrovert | #hype, #energy, #risky | 15 | 8 | +4 score ako Host ima #energy ili #impulsive tag |
| S3 | Mrki Loud | Wildcard, Heavy Hitter | #magnet, #unpredictable, #burnout | 25 | 16 | +8 score u prvom eventu na novoj lokaciji; -6 na ponovljenoj lokaciji |
| S4 | Vesna Frekvencija | Veteran, Ekstrovert | #versatile, #stamina, #easygoing | 19 | 12 | Smanjuje sve conflict penale u ekipi za 2 poena |
| S5 | Nik Šum | Rookie, Introvert | #underground, #growthpotential, #purist | 12 | 6 | +3 base_score za svaki naredni event u kome ostaje (max +9) |

### Video rola

| # | Ime | Traits | Synergy tagovi | base_score | cost | special_ability |
|---|---|---|---|---|---|---|
| V1 | Petra Lens | Veteran, Introvert | #precision, #technical, #lowmaintenance | 20 | 12 | +5 production ako Sound ima #precision ili #technical |
| V2 | Luka Klik | Rookie, Ekstrovert | #viralmoment, #hype, #impulsive | 16 | 9 | +7 score ako Host ima #viralmoment ili #energy tag |
| V3 | Ghost Frame | Wildcard, Heavy Hitter | #unpredictable, #magnet, #controversy | 26 | 18 | +10 score; ali uvodi -5 logistics penalty ako je u ekipi još jedan Wildcard |
| V4 | Andrej Steady | Veteran, Ekstrovert | #versatile, #stamina, #crowdread | 19 | 12 | +3 audience_match_bonus za svaki preferred tag u ekipi (umesto +5, daje +8) |
| V5 | Mila Fokus | Rookie, Introvert | #underground, #purist, #growthpotential | 11 | 6 | +2 base_score za svaki naredni event u kome ostaje (max +8); unlock-uje se |

### Security rola

| # | Ime | Traits | Synergy tagovi | base_score | cost | special_ability |
|---|---|---|---|---|---|---|
| SE1 | Dragan Zid | Veteran, Introvert | #reliable, #stamina, #lowmaintenance | 20 | 11 | Smanjuje -burnout efekat za 50%: #burnout karte ne odlaze automatski ako je Security Veteran |
| SE2 | Jovana Štit | Rookie, Ekstrovert | #energy, #crowdcontrol, #impulsive | 15 | 8 | +5 crowd_control bonus ako Host ima #crowdcontrol tag |
| SE3 | Rambo Čelik | Wildcard, Heavy Hitter | #magnet, #controversial, #burnout | 24 | 16 | +9 score; uvodi -8 crowd_control penalty ako Host nije Veteran ili Ekstrovert |
| SE4 | Ina Senka | Veteran, Introvert | #calm, #organizer, #backstageleader | 18 | 11 | +4 score po svakom Veteran-u u ekipi (max +12) |
| SE5 | Kosta Patka | Rookie, Ekstrovert | #versatile, #easygoing, #growthpotential | 12 | 7 | Uvek dostupan za sledeći event (ne odlazi); +2 base_score po eventu (max +6) |

---

## 2. Synergy matrica

| Trait A + Trait B (ili tag + tag) | Efekat | Flavor text |
|---|---|---|
| Veteran + Veteran (ista ekipa, 2+ karate) | +10 production | "Stari znaju posao — bez iznenađenja." |
| Wildcard + Introvert (ista ekipa) | -8 conflict | "Haos traži pažnju, tišina se povlači." |
| #hype + #crowdread (ista ekipa) | +8 vibe | "Znaju šta publika hoće pre nego što publika zna." |
| Rookie + Rookie (2+ karate u ekipi) | -5 coordination | "Svi žele da dovedu, niko ne koordinira." |
| Veteran (DJ) + Veteran (Sound) | +10 production, +2 score | "Frekvencije usklađene pre zvuka — magija." |
| Wildcard + Heavy Hitter (isti karakter) | +7 chaos_bonus | "Nepredvidiv i jak — noć pamte svi." |
| #burnout + #burnout (2+ karte) | -10 stamina, -5 score | "Svi na ivici — neko će pući." |
| Ekstrovert + Introvert (DJ + Host) | -5 vibe | "Jedan gura ka svetlima, drugi beži od njih." |
| #techno + #precision (ista ekipa) | +6 production | "Zvuk je nauka — ovi to znaju." |
| #viralmoment + #magnet (ista ekipa) | +10 reach | "Kamera prati magneta — clip se sam pravi." |
| Heavy Hitter + Veteran (različite role) | +5 stability | "Iskustvo drži ambiciju na zemlji." |
| #lowmaintenance + #lowmaintenance (2+ karte) | +5 logistics | "Nema drame iza scene — sve teče." |

---

## 3. Event Score formula

```
Event Score = Σ(base_score karata) + synergy_total - conflict_total + audience_match_bonus

synergy_total   = zbir svih aktivnih synergy bonusa iz Synergy matrice
conflict_total  = zbir svih aktivnih conflict penala iz Synergy matrice

audience_match_bonus:
  Svaki event ima 2 "preferred tags".
  Za svaki preferred tag koji se pojavljuje u barem jednoj karti u ekipi → +5 poena.
  Maksimalan audience_match_bonus = +10 (oba taga prisutna).
  Andrej Steady (V4) menja ovu vrednost na +8 po tagu.

Primeri konflikata:
  Wildcard + Introvert u istoj ekipi → -8 conflict
  Rookie + Rookie (2+ karate)        → -5 conflict
  #burnout + #burnout (2+ karte)     → -10 conflict

Event Score je zaokružen na ceo broj, opseg 0–100.
```

---

## 4. Reputation i Budget ekonomija

| Event Score | Tier | Reputation XP gained | Budget za sledeći event | Komentar |
|---|---|---|---|---|
| 0–30 | Kiks | +5 XP | +0 bonus budžeta | Lokalna scena se podsmeva |
| 31–60 | OK večer | +15 XP | +5 bonus budžeta | Solidan event, nema buzz-a |
| 61–85 | Dobar event | +30 XP | +10 bonus budžeta | Booking agenti pitaju |
| 86–100 | Legenda | +50 XP | +15 bonus budžeta + Tier 3 unlock | Sve se pita ko je organizovao |

**Kumulativna reputacija** (XP) određuje koji su Tier 3 unlock kartoni dostupni (vidi Sekciju 9).

**Budget fond po eventu:**  
Svaki event počinje sa fiksnim budget fondom (vidi Sekciju 6 — Pacing). Budget bonus iz prethodnog eventa se dodaje na ovaj fond. Igrač potroši budget biranjem karata — zbir `cost` svih 5 izabranih karata ne sme preći dostupni fond.

---

## 5. Tier sistem karata

| Tier | cost opseg | base_score opseg | Traits karakteristika | Napomena |
|---|---|---|---|---|
| Tier 1 | 5–8 bp | 10–15 | Jedna osnovna trait (Rookie ili Veteran), simple synergy tagovi | Dostupno od starta |
| Tier 2 | 9–15 bp | 16–22 | Dve traits (compound kombinacije), 3 synergy taga | Dostupno od starta |
| Tier 3 | 16–20 bp | 23–30 | Dve traits uključujući Wildcard ili Heavy Hitter, 3 taga + powerful ability | Unlock kroz XP ili Legenda tier |

Tier 1 karte: D5 Zara Static, H5 Ana Tiha, S5 Nik Šum, V5 Mila Fokus, SE5 Kosta Patka  
Tier 2 karte: D1 Dražen Bura, D2 Lena Voltage, D4 Toni Groove, H3 Darko Mirni, H2 Mia Flare, S1 Bojan Eq, S2 Katja Bass, S4 Vesna Frekvencija, V1 Petra Lens, V2 Luka Klik, V4 Andrej Steady, SE1 Dragan Zid, SE2 Jovana Štit, SE4 Ina Senka  
Tier 3 karte: D3 MC Phantom, H1 Filip Sena, H4 Sasha Bold, S3 Mrki Loud, V3 Ghost Frame, SE3 Rambo Čelik  

**Primer budget kalkulacije (Event 1, fond = 60 bp):**  
Zara Static (7) + Ana Tiha (8) + Bojan Eq (13) + Andrej Steady (12) + Dragan Zid (11) = **51 bp** — validno, ostaje 9 bp neiskorišćenih (ne prenose se).

---

## 6. Pacing po eventima

| Event | Lokacija | Audience Preferred Tags | Base Budget | Starting Reputation |
|---|---|---|---|---|
| Event 1 | Štrand | #hype, #crowdread | 60 bp | 0 XP |
| Event 2 | Avala | #techno, #easygoing | 65 bp | (XP iz Eventa 1) |
| Event 3 | Niš | #versatile, #stamina | 70 bp | (XP iz Eventa 2) |
| Event 4 | Sarajevo | #charisma, #viralmoment | 75 bp | (XP iz Eventa 3) |
| Event 5 | Grand Finale | Random 2 od: #hype, #techno, #precision, #magnet, #crowdread, #viralmoment, #stamina, #underground | 80 bp | (XP iz Eventa 4) |

**Napomena za Grand Finale:** Preferred tagovi se određuju nasumično pri početku Event 5 draft faze. Igrač nema informaciju unapred — ovo je poslednji test adaptacije.

**Bonus budžet se dodaje na Base Budget:** Npr. ako je Event 1 bio Legenda tier (+15), Event 2 fond = 65 + 15 = 80 bp.

---

## 7. Crew Retention između evenata

**Pravila ostanka:**
- Crew member **ostaje** u pool-u za sledeći event ako:
  - Nema #burnout tag, ILI
  - Event Score bio 61+ (Dobar event ili Legenda), čak i ako ima #burnout

**Pravila odlaska:**
- Crew member **odlazi** (nije dostupan za draft u sledećem eventu) ako:
  - Ima #burnout tag **I** Event Score bio ≤60, ILI
  - Bio je u 2 ili više conflict penala tokom istog eventa (bez obzira na score)

**Mehanika auto-offer:**
- Karte koje ostaju = prikazuju se kao "Returning" opcija u draft fazi sledećeg eventa.
- Igrač može da ih izabere ponovo ili da ih zameni novom kartom iz pool-a.
- Returning karta zadržava sve kumulativne bonuse (npr. Zara Static's +base_score napredak).

**Specijalne karte:**
- Ana Tiha (H5): nikad ne odlazi — nema #burnout, specijalna ability.
- Kosta Patka (SE5): nikad ne odlazi — specijalna ability eksplicitno garantuje povratak.
- Dragan Zid (SE1): Veteran ability smanjuje #burnout efekat za 50% — #burnout karte uz njega odlaze samo ako je Event Score ≤30.

---

## 8. Tour Score formula

```
Tour Score = Σ(Event Score_i × event_weight_i) + loyalty_bonus + consistency_bonus

event_weight:
  Event 1 (Štrand)        = 0.8
  Event 2 (Avala)         = 0.9
  Event 3 (Niš)           = 1.0
  Event 4 (Sarajevo)      = 1.1
  Event 5 (Grand Finale)  = 1.3

loyalty_bonus:
  +5 poena za svakog crew member-a koji je prošao ≥3 eventa bez odlaska
  Maksimum: 5 crew × +5 = +25 poena

consistency_bonus:
  +10 poena ako nijedan od 5 evenata nije bio "Kiks" tier (Event Score >30 na svakom)

Primer:
  Eventovi: 72, 68, 80, 75, 90
  Weighted: 72×0.8 + 68×0.9 + 80×1.0 + 75×1.1 + 90×1.3
           = 57.6 + 61.2 + 80.0 + 82.5 + 117.0 = 398.3
  loyalty_bonus: 3 returning members = +15
  consistency_bonus: nema Kiks = +10
  Tour Score = 398.3 + 15 + 10 = 423.3
```

**Tour Score rangovi (za finalni rating):**

| Tour Score | Rang | Opis |
|---|---|---|
| 0–199 | D — Lokalna epizoda | Niko neće pamtiti ovu turu |
| 200–299 | C — Solid underground | Scena te zna; mainstream ne |
| 300–399 | B — Ozbiljan player | Booking agenti stavljaju broj |
| 400–499 | A — Kultna tura | Priče se prepričavaju godinama |
| 500+ | S — Legenda Balkana | Dokumentarac i tribute ploča |

---

## 9. Unlock sistem

Pet karata je na početku igre zaključano (po jedna per rola). Unlock se postiže dostizanjem kumulativnog XP praga:

| XP prag | Rola | Karta koja se unlock-uje | Unlock flavor |
|---|---|---|---|
| 50 XP | DJ | D3 MC Phantom (Tier 3) | "Čulo se za tebe — Phantom prihvata poziv." |
| 80 XP | Host | H4 Sasha Bold (Tier 3) | "Kontroverza traži pažnju — Sasha Bold ulazi." |
| 120 XP | Sound | S3 Mrki Loud (Tier 3) | "Glasina o evolu — Mrki Loud želi da čuje." |
| 160 XP | Video | V5 Mila Fokus (Tier 1) | "Tiha posmatrač postaje deo ekipe." |
| 200 XP | Security | SE3 Rambo Čelik (Tier 3) | "Ozbiljna reputacija zahteva ozbiljnu zaštitu." |

**Napomene za implementaciju:**
- Mila Fokus (V5) je Tier 1 unlock — namerno je laka, ali njen growthpotential je vredan kasno u turi.
- MC Phantom (D3), Sasha Bold (H4), Mrki Loud (S3) i Rambo Čelik (SE3) su sve Tier 3 karte — unlock pre Grand Finale nije garantovan; igrač mora gađati 61+ score konzistentno.
- XP se kumulira kroz sve evente — nema reseta između lokacija.
- Locked karte se ne prikazuju u draft pool-u dok XP prag nije dostignut; prikazuje se samo silueta sa tekstom "Zaključano — potrebno X XP".

---

## Napomene za implementaciju (za Jovu)

- `base_score`, `cost`, `traits[]`, `synergy_tags[]` i `special_ability` su ključna polja po karti — JSON schema treba ovo da reflektuje.
- `synergy_total` i `conflict_total` se računaju pre sumiranja sa `base_score` — redosled operacija je bitan za debugging.
- `audience_match_bonus` se proverava po tagu (ne po karti) — jedan tag u bilo kojoj od 5 izabranih karata aktivira +5.
- `event_weight` multiplikacija se primenjuje na finalni `Event Score` (post-synergy), ne na `base_score`.
- Andrej Steady (V4) menja globalnu `audience_match_bonus` vrednost sa +5 na +8 per tag dok je u ekipi — tretirati kao override, ne kao aditivni bonus.
- Retention check se izvršava **nakon** finalnog Event Score izračuna, na kraju svakog eventa.
