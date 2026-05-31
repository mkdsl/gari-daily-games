# Ekipa Noći — Game Design Document

**Datum:** 2026-05-31  
**Autor:** Mile Mehanika  
**Žanr:** Card / Kombinator — Multi-Layer Crew Builder  
**Verzija:** 1.0

---

## 1. Kompletna lista karata

Svaki event se drafta iz pool-a od 5 rola. Za svaku rolu postoji 5 karata — igrač bira 1 od 3 ponuđene po roli (= 5 draft poteza po eventu). Dole je kompletan roster.

### DJ Rola

| Ime | Traits | Synergy tagovi | base_score | cost | special_ability |
|---|---|---|---|---|---|
| Dražen Bura | Veteran, Introvert | #techno, #precision, #lowmaintenance | 22 | 14 | +4 score ako Sound karta ima #precision ili #techno tag |
| Lena Voltage | Rookie, Ekstrovert | #hype, #risky, #crowdread | 17 | 9 | Ako je Event Score na pola eventa >50, dobija +6 bonus; inače -3 |
| MC Phantom | Wildcard, Heavy Hitter | #unpredictable, #magnet, #burnout | 26 | 18 | Jednom po eventu može "reroll" jedan synergy conflict u 0 — ali dodaje #burnout efekt |
| Toni Groove | Veteran, Ekstrovert | #versatile, #easygoing, #stamina | 20 | 13 | +3 score ako ekipa ima ≥3 Veteran karata ukupno |
| Zara Static | Rookie, Introvert | #underground, #purist, #growthpotential | 13 | 7 | +5 score u sledećem eventu ako ostane u ekipi (loyalty trigger) |

### Host Rola

| Ime | Traits | Synergy tagovi | base_score | cost | special_ability |
|---|---|---|---|---|---|
| Filip Sena | Veteran, Ekstrovert | #charisma, #crowdcontrol, #expensive | 24 | 19 | Negira jedan #impulsive ili #controversy penale u ekipi |
| Mia Flare | Rookie, Ekstrovert | #energy, #impulsive, #viralmoment | 18 | 10 | Ako audience_match_bonus ≥1, dodaje +4 extra vibe bonus |
| Darko Mirni | Veteran, Introvert | #calm, #organizer, #backstageleader | 21 | 12 | Smanjuje sve conflict penale u eventu za 2 poena |
| Sasha Bold | Wildcard, Heavy Hitter | #controversy, #memeable, #polarizing | 25 | 17 | +10 score ako DJ je Heavy Hitter; -10 ako je DJ Introvert |
| Ana Tiha | Rookie, Introvert | #warm, #reliable, #undertheradar | 14 | 6 | Nema conflict penale sa bilo kojom Security kartom |

### Sound Rola

| Ime | Traits | Synergy tagovi | base_score | cost | special_ability |
|---|---|---|---|---|---|
| Boro Bas | Veteran, Introvert | #precision, #technical, #lowmaintenance | 21 | 13 | +5 score ako DJ ima #techno ili #precision tag |
| Nina Fx | Rookie, Ekstrovert | #experimental, #hype, #risky | 15 | 8 | Reroll jednog sound-related synergyja jednom po eventu |
| Marko Loud | Wildcard, Heavy Hitter | #heavy, #magnet, #burnout | 24 | 16 | +8 score ako je venue kapacitet >500 (Grand Finale uvek broji); dodaje #burnout |
| Petra Soft | Veteran, Introvert | #ambient, #easygoing, #stamina | 19 | 11 | Smanjuje #burnout efekte u ekipi za 1 bod |
| Luka Sync | Rookie, Ekstrovert | #versatile, #crowdread, #growthpotential | 12 | 6 | +3 score za svakog Ekstrovert member-a u ekipi |

### Video Rola

| Ime | Traits | Synergy tagovi | base_score | cost | special_ability |
|---|---|---|---|---|---|
| Vuk Frame | Veteran, Introvert | #cinematic, #purist, #precision | 20 | 12 | +4 score ako Sound karta ima #technical ili #ambient tag |
| Ela Vizual | Rookie, Ekstrovert | #viralmoment, #energy, #impulsive | 16 | 9 | Ako je audience preferred tag #viralmoment, daje +7 bonus umesto +5 |
| Rex Glitch | Wildcard, Heavy Hitter | #unpredictable, #memeable, #burnout | 23 | 15 | Generiše +5 vibe bonus ali dodaje -3 logistics; ima #burnout |
| Soma Still | Veteran, Introvert | #calm, #organizer, #lowmaintenance | 18 | 10 | Nema #burnout efekta ni od jednog Wildcard u ekipi (blokira 1 burnout) |
| Kika Motion | Rookie, Ekstrovert | #crowdread, #versatile, #growthpotential | 11 | 5 | +2 score za svaki audience_match_bonus koji ekipa osvoji |

### Security Rola

| Ime | Traits | Synergy tagovi | base_score | cost | special_ability |
|---|---|---|---|---|---|
| Zoran Zid | Veteran, Introvert | #crowdcontrol, #reliable, #stamina | 20 | 11 | Smanjuje sve #risky conflict penale u eventu za 3 poena |
| Branka Štit | Veteran, Ekstrovert | #charisma, #crowdcontrol, #easygoing | 19 | 12 | +5 score ako Host ima #charisma ili #crowdcontrol tag |
| Simo Hajduk | Wildcard, Heavy Hitter | #heavy, #polarizing, #burnout | 22 | 14 | +10 score ako conflict_total = 0; -5 score ako conflict_total ≥ 10 |
| Tara Senka | Rookie, Introvert | #underground, #reliable, #undertheradar | 13 | 6 | Ne izaziva ni jedan conflict penale bez obzira na trait kombinacije |
| Boban Grom | Rookie, Heavy Hitter | #hype, #magnet, #risky | 17 | 10 | +6 score ako DJ ili Host ima #hype tag; -4 ako nijedno nije hype |

---

## 2. Synergy matrica

| Trait A + Trait B (ili tag + tag) | Efekat | Flavor text |
|---|---|---|
| Veteran + Veteran (iste role ili različite) | +10 production | "Rutina gradi čudo." |
| Wildcard + Introvert (u istoj ekipi) | -8 conflict | "Previše tišine — previše haosa." |
| Ekstrovert + Ekstrovert (3+ u ekipi) | +8 vibe, -4 logistics | "Svi pričaju, niko ne sluša." |
| Heavy Hitter + Heavy Hitter (2+ u ekipi) | +12 vibe, -6 crowd control | "Eksplozija na sve strane." |
| #burnout + #burnout (2+ karte) | -10 ukupni score | "Ekipa je sagorela pre ponoći." |
| #lowmaintenance + #lowmaintenance (2+ karte) | +6 logistics | "Sami se snalaze — menadžer diše." |
| #crowdread + #hype (bilo koja 2 karte) | +8 audience_match | "Znaju tačno šta publika hoće." |
| Rookie + Veteran (ista rola — nije moguće, ali u različitim rolama) | +5 mentorship bonus | "Stariji uči mlađeg uživo." |
| #risky + #crowdcontrol (u istoj ekipi) | -6 conflict | "Vatrogasac gasi požar koji je sam zapalio." |
| Wildcard + Veteran (u istoj ekipi) | +15 vibe, -5 logistics | "Veteran drži kaos pod kontrolom — nekako." |
| #precision + #techno (2+ karte) | +10 production | "Sve sinhronizovano do milisekunde." |
| #magnet + #viralmoment (u istoj ekipi) | +9 vibe, +3 reach | "Event se sam šeruje." |

---

## 3. Event Score formula

```
Event Score = Σ(base_score svih 5 karata u ekipi)
            + synergy_total
            - conflict_total
            + audience_match_bonus

synergy_total  = zbir svih aktivnih synergy bonusa (iz matrice + special abilities)
conflict_total = zbir svih aktivnih conflict penala (iz matrice)
audience_match_bonus = +5 po preferred tagu koji se nalazi u ekipi
                       (svaki event ima 2 preferred taga, max +10)

Primer:
  Ekipa: Dražen Bura (22) + Darko Mirni (21) + Boro Bas (21) + Vuk Frame (20) + Zoran Zid (20)
  Σ base_score = 104  →  kapuje se na 100 max

  Synergy: Veteran+Veteran × 2 para = +20, #precision+#techno = +10
  Conflict: nema
  audience_match (Avala: #techno, #easygoing): #techno pogodak = +5
  Event Score = 100 + 30 + 0 + 5 = 100 (kap na 100)

Konflikt primer:
  Ekipa sa Wildcard + Introvert: -8 conflict
  Ekipa sa dva #burnout: -10
  Ako je conflict_total > synergy_total, Event Score može biti ispod Σ base_score.
```

---

## 4. Reputation i Budget ekonomija

| Event Score | Naziv | Reputation XP | Budget za sledeći event | Tier unlock |
|---|---|---|---|---|
| 0–30 | Kiks | +5 XP | +0 bonus (ostaje base) | Samo Tier 1 |
| 31–60 | OK večer | +15 XP | +5 bonus budget | Tier 1 + Tier 2 |
| 61–85 | Dobar event | +30 XP | +12 bonus budget | Tier 1 + Tier 2 |
| 86–100 | Legenda | +50 XP | +20 bonus budget + Tier 3 unlock | Svi tieri |

**Kumulativna reputacija** se računa kao zbir svih zarađenih XP tokom turneje. Viša kumulativna reputacija zahtevniju publiku — svaki novi event dobija +1 audience difficulty za svakih 50 kumulativnih XP (otežava audience_match_bonus jer preferred tagovi postaju specifičniji).

---

## 5. Tier sistem karata

| Tier | Budget opseg (cost) | base_score opseg | Traits | Opis |
|---|---|---|---|---|
| Tier 1 | 5–8 poena | 10–15 | Jedan trait (Rookie ili Veteran) | Pouzdani ali ograničeni; bez special abilities ili slabe |
| Tier 2 | 9–15 poena | 16–22 | Dva trait-a (compound) | Balansiran profil; korektne special abilities |
| Tier 3 | 16–20 poena | 23–30 | Dva trait-a (rare combo: Wildcard/Heavy Hitter) | Visok ceiling, visok rizik; moćne special abilities |

**Početni budget po eventu:**

| Event | Base budget | Maks. dostižan budget (sa bonusom) |
|---|---|---|
| Štrand (E1) | 60 poena | 60 (nema prethodnog bonusa) |
| Avala (E2) | 65 poena | 65 + bonus iz E1 (max +20) = 85 |
| Niš (E3) | 70 poena | 70 + bonus (max +20) = 90 |
| Sarajevo (E4) | 75 poena | 75 + bonus (max +20) = 95 |
| Grand Finale (E5) | 80 poena | 80 + bonus (max +20) = 100 |

Igrač troši budget birajući karte — ako ne može da priušti kartu, ona se preskoči i dolazi nova (random iz istog tiera). Nepotrošeni budget se ne prenosi.

---

## 6. Pacing po eventima

| Event | Audience Preferred Tags | Base Budget | Starting Reputation | Difficulty modifier |
|---|---|---|---|---|
| Štrand (Event 1) | #hype, #crowdread | 60 | 0 XP | Baseline (×1.0) |
| Avala (Event 2) | #techno, #easygoing | 65 | Iz Event 1 | ×1.1 ako kum. XP ≥ 30 |
| Niš (Event 3) | #versatile, #stamina | 70 | Iz Event 2 | ×1.2 ako kum. XP ≥ 60 |
| Sarajevo (Event 4) | #charisma, #viralmoment | 75 | Iz Event 3 | ×1.3 ako kum. XP ≥ 100 |
| Grand Finale (Event 5) | Random 2 od: #hype, #techno, #precision, #crowdread, #versatile, #magnet, #charisma, #stamina | 80 | Iz Event 4 | ×1.5 uvek |

**Grand Finale preferred tagovi** se reveal-uju tek na početku draft faze tog eventa — igrač ne zna unapred. Ovo je dizajnirana neizvesnost.

---

## 7. Crew Retention između evenata

**Crew member OSTAJE ako:**
- Nema #burnout tag u synergy tagovima, ILI
- Event Score je bio ≥ 61 (bez obzira na #burnout — dobar event motiviše i sagorele)

**Crew member ODLAZI ako:**
- Ima #burnout tag I Event Score < 61, ILI
- Bio je uključen u ≥ 2 conflict penale u istom eventu (tracking po karti)

**Mehanika odlaska:**
- Karta se uklanja iz pool-a za sledeći event — ne može biti ponuđena u draftu
- Odlazak je permanentan za tu turneju (ne vraća se)

**Mehanika ostanka (auto-offer):**
- Ako karta ostaje, ona je uvek jedna od 3 opcija u narednom draftu za tu rolu (garantovana ponuda)
- Igrač može odbiti i uzeti drugu — ali gubi garantovanu ponudu

**Loyalty threshold:**
- Crew member koji preživi ≥ 3 eventa bez odlaska dobija "Loyal" status
- Loyal karta: +2 na base_score za svaki naredni event (kumulativno, max +6)

---

## 8. Tour Score formula

```
Tour Score = Σ(Event Score × event_weight) + loyalty_bonus + consistency_bonus

event_weight:
  Event 1 (Štrand)      = 0.8
  Event 2 (Avala)       = 0.9
  Event 3 (Niš)        = 1.0
  Event 4 (Sarajevo)    = 1.1
  Event 5 (Grand Finale) = 1.3

loyalty_bonus:
  +5 po crew member-u koji je prošao ≥ 3 eventa bez odlaska
  (max 5 članova × +5 = +25 bonus)

consistency_bonus:
  +10 ako nijedan event nije bio "Kiks" (Event Score ≥ 31 na svakom)
  +5 extra ako su sva 4 eventa pre Finale bila "Dobar event" ili "Legenda"

Primer Tour Score (idealan scenario):
  E1=80×0.8=64, E2=85×0.9=76.5, E3=90×1.0=90, E4=88×1.1=96.8, E5=95×1.3=123.5
  Σ weighted = 450.8
  loyalty_bonus = 4 loyal members × 5 = +20
  consistency_bonus = +10 + +5 = +15
  Tour Score = 485.8 → zaokružiti na 486

Maksimalan teorijski Tour Score ≈ 530 (svi eventi Legenda + pun loyalty)
```

---

## 9. Unlock sistem

Sledećih 5 karata (po jedna per rola) su zaključane na početku igre. Unlock-uju se kad igrač dostigne određeni nivo kumulativne reputacije (XP zbir tokom turneje).

| Rola | Locked karta | Unlock threshold | Unlock efekat |
|---|---|---|---|
| DJ | **Zara Static** | 40 kumulativnih XP | Postaje dostupna u draft pool-u od Event 2 nadalje |
| Host | **Sasha Bold** | 80 kumulativnih XP | Postaje dostupna u draft pool-u od Event 3 nadalje |
| Sound | **Marko Loud** | 60 kumulativnih XP | Postaje dostupna u draft pool-u od Event 2 nadalje |
| Video | **Rex Glitch** | 100 kumulativnih XP | Postaje dostupna u draft pool-u od Event 4 nadalje |
| Security | **Simo Hajduk** | 120 kumulativnih XP | Postaje dostupna u draft pool-u od Event 4 nadalje; ako igrač dostigne 120 XP pre Event 3, unlock se aktivira tada |

**Unlock pravila:**
- Karta se dodaje u draft pool odmah na početku sledećeg eventa nakon što je threshold dostignut
- Igrač dobija notifikaciju: *"Nova karta otključana: [Ime] — dostupna od sledećeg eventa"*
- Locked karte su vidljive u "Codex" modu pre unlocka (igrač zna šta ga čeka)
- Ako igrač ne dostigne threshold do kraja turneje, karta ostaje locked — ali se unlocka automatski za novu turneju

---

## Napomene za implementaciju

- `base_score` je fiksna vrednost na karti; modifikuju ga samo special abilities i loyalty bonus
- `cost` se oduzima od budget fonda pri draftu; ako nema dovoljno, karta nije izvodljiva
- Sve special abilities su triggerovane (ne pasivne stalno) — implementirati kao event listener na kraju draft faze
- Conflict tracking per karta: inkrementuj counter pri svakom aktivnom conflict penalu koji uključuje tu kartu
- Burnout tag: proveravati pri kraju eventa, pre retention kalkulacije
- Grand Finale preferred tags: seed = datum sesije + kumulativni XP igrača (deterministički random)
