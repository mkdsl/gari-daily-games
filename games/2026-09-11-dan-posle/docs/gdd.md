# GDD — Dan Posle

**Žanr:** Narrative choice / community builder | **brand_serves:** guncati, kluboslavija

---

## 1. Resource Ekonomija

| Resurs | Start | Min | Max | Prikazivanje |
|--------|-------|-----|-----|-------------|
| Energija | 6 | 0 | 10 | Bar zeleni, 0–10 |
| Veze | 3 | 0 | 10 | Bar plavi, 0–10 |
| Sećanja | 2 | 0 | 10 | Bar žuti, 0–10 |
| Nered | 10 | 0 | 10 | Bar crveni + label "manje = bolje", ikonice kese smeća se smanjuju |

**Community Score = Veze + Sećanja − (Nered / 2)**

Početni CS: 3 + 2 − 5 = **0**. Teorijski max: 10 + 10 − 0 = **20**.

### Ending Mapping

| Uslov (provjera redom) | Ending |
|------------------------|--------|
| Veze ≥ 8 AND Sećanja ≥ 5 | "Zajednica nastaje" |
| CS 6–10 | "Dobar posao" |
| CS < 6 AND Energija > 3 | "Sledeće leto" + **Prestige unlock** |
| CS < 6 AND Energija ≤ 3 | "Sagoreo si" (no prestige) |

### Energija = 0 Pravilo

Kad Energija padne na 0: sve opcije se zagrejavaju u sivo osim jedne — automatski se označi
opcija sa najnižim Energija troškom i labelom `(automatski — nema snage za drugo)`. Igrač može
kliknuti drugu opciju samo ako i ona ima Energija delta ≥ 0. Ovo modeluje iscrpljenost bez
game-over-a.

---

## 2. Decision Nodovi (32 ukupno, po satu)

Format: `Opcija → E/V/S/N` (delta Energija / Veze / Sećanja / Nered; 0 = nema promene)

> Toma nodovi označeni **[T]**, Kluboslavija nodovi označeni **[K]**

### 07:00 — Jutro (3 noda)

**N1 — Volonter propustio autobus**
- A: Voziš ga → E−2 / V+2 / S+1 / N−1
- B: Nočeva kod tebe → V+1 / S+2 / N+1
- C: Taksi organizuješ → E−1 / V+1 / N−1

**N2 — Sponzorska zahvalnica (SMS)** *(binarna)*
- A: Zahvaljuješ se odmah → V+1
- B: Ignorišeš za sada → N+1

**N3 [T] — Toma: "Kako si?"** *(binarna)*
- A: Iskreno (umoran) → S+1
- B: "Okej sam" → E+1

### 08:00 — Komšija i Đubre (3 noda)

**N4 — Komšija Slavko buni se**
- A: Izvinjenje, razgovor → E−1 / V+2 / N−2
- B: Kafa sutra → V+1 / S+1 / N−1
- C: Javljam upravi → V−1 / N−1

**N5 — Vreće đubreta**
- A: Sam skupljaš → E−2 / N−3
- B: Organizuješ ekipu → E−1 / V+1 / N−2
- C: Ostaviš za popodne → *(nema promene)*

**N6 — Hladna kafa na stolu** *(binarna)*
- A: Piješ hladnu → E+1
- B: Praviš novu → E+2 / S+1

### 09:00 — Mediji (2 noda)

**N7 [K] — Novinarka pita o turneji 2026 (Kluboslavija)**
- A: 20 min razgovor, pomeneš Klavoslavija turneju 2026 → E−2 / V+1 / S+2
- B: Odbijaš → E+1 / V−1 / N+1
- C: Šalješ ka Brani → E−1 / V+1 / S+1

**N8 — WhatsApp "BRAVO" od prijatelja**
- A: Odgovaraš odmah → V+1
- B: Screenshot za story → S+1
- C: Sačuvaš za kasno → *(nema promene)*

### 10:00 — Teren i Detalji (3 noda)

**N9 [T] — Toma: inspekcija terena**
- A: Zajedno obilazite → E−1 / V+1 / S+2
- B: Šalješ ga kući da spava → S+1 / N−1
- C: Toma pomaže sa Slavkovim dvorištem → V+2 / N−2

**N10 — Strujna tablica (baterija ispražnjena)**
- A: Pronalaziš punjaće → E−1 / N−1
- B: Naručuješ kurirom → N−1
- C: Preskačeš → N+2

**N11 — Stara fotografija nađena u travi**
- A: Čuvaš u džepu → S+2
- B: Postiraš story odmah → S+1 / V+1
- C: Ne gledaš, baciš → *(nema promene)*

### 11:00 — Predmeti (2 noda)

**N12 — Fotoaparat bez vlasnika**
- A: Čuvaš kod sebe → S+1 / N+1
- B: Story odmah → E−1 / S+2 / V+1
- C: Vidno mesto → S+1 / N−1

**N13 — Voda se iscrpila**
- A: Kupuješ više → E+1
- B: Nađi česmu → S+1
- C: Volonter trči → V−1 / E+1

### 12:00 — Podne (3 noda)

**N14 — Ručak (poslednji komad pice)**
- A: Jedeš sam → E+2 / V−1
- B: Pozivaš Tomu → E+1 / V+1 / S+1
- C: Ostavljaš volonterima → E−1 / V+2 / S+1

**N15 [T] — Toma se smeje nečemu ćutke** *(binarna)*
- A: Pitaš šta je → S+2 / V+1
- B: Nastaviš da radiš → *(nema promene)*

**N16 — SMS od lokalnog medija**
- A: Daješ 5 min → E−1 / S+1 / V+1
- B: Odbijaš → E+1
- C: Šalješ linku na stories → S+1

### 13:00 — Gosti (2 noda)

**N17 — Kamp-gost hoće da ostane**
- A: Da, ostaje → S+1 / V+1 / N+1
- B: Ne → V−1 / N−1
- C: Pomaže čišćenjem → V+1 / S+1 / N−2

**N18 — Buka iz starog šatora**
- A: Proveraš sam → E−1 / S+1
- B: Šalješ nekoga → *(nema promene)*
- C: Ostavljaš → N+1

### 14:00 — Popodne (3 noda)

**N19 — Baštenski sto slomljen**
- A: Prijaviš vlasnicima → V+1 / N−1
- B: Popravljaš sam → E−2 / N−2
- C: Ostaviš za sutra → N+1

**N20 — Dete zaboravilo igračku**
- A: Čuvaš, praviš zapis → S+1 / N+1
- B: Pozivaš roditelje odmah → E−1 / V+1
- C: Ostavljaš na ulazu → N−1

**N21 [T] — Toma pita: "Radimo li sledeće leto?"**
- A: "Da, radimo!" → E−1 / V+2 / S+2
- B: "Možda, vidimo" → V+1 / S+1
- C: "Ne znam još" → E+1

### 15:00 — Komunikacija (2 noda)

**N22 — Instagram recap request**
- A: 3 rečenice → E−1 / S+1 / V+1
- B: Aforizam → S+2 / V+1
- C: Ne → E+1 / N+1

**N23 — Poslednji volonter odlazi**
- A: Grliš, razgovaraš → E−1 / V+2 / S+1
- B: Zahvaljuješ formalno → V+1
- C: Daješ mu ostatak hrane → E−1 / V+1 / S+1

### 16:00 — Kraj Dana (2 noda)

**N24 — Susedovo dete pomaže bez pitanja**
- A: Prihvataš → E+1 / V+1 / N−1
- B: Odbijaš → N+1
- C: Nudiš keks → V+1 / S+1

**N25 — Nađena novčanica (500 din)**
- A: Prijaviš izgubljenima → V+1 / S+1
- B: Čuvaš za sebe → E+1 / V−1
- C: Daješ za fond idućeg festivala → S+1 / V+1

### 17:00 — Retrospektiva (2 noda)

**N26 — Retrospektiva meeting**
- A: Odmah, danas → E−2 / V+1 / S+2
- B: Za nedelju dana → S+1
- C: DM svima → E−1 / V+1 / S+1

**N27 — Muzička oprema, vlasnik nije stigao**
- A: Čuvaš bezbedno → E−1 / N−1
- B: Napola spakovano → *(nema promene)*
- C: Šalješ u opštinski depo → N−2

### 18:00 — Poslednji Napor (2 noda)

**N28 — Završno čišćenje**
- A: Radiš sve sam → E−3 / N−3
- B: Tražiš pomoć → E−1 / V+1 / N−2
- C: Ostaviš na jutro → N+1

**N29 — Bivši volonter piše "Hvala ti"**
- A: Duga zahvalnica → E−1 / V+2 / S+1
- B: Emoji → V+1
- C: Čitaš sutra → N+1

### 19:00 — Zatvaranje (3 noda)

**N30 — Kapija**
- A: Sam zaključavaš → E−1 / S+1
- B: Sa Tomom [T] → E−1 / V+1 / S+2
- C: Telefonom (remote) → N−1

**N31 — Poslednji pogled na polje**
- A: Ostaneš da gledaš → E−1 / S+2
- B: Fotografišeš → S+1 / V+1
- C: Odmah ideš kući → E+1

**N32 — Šta ćeš sutra?**
- A: Pišeš plan → E−1 / V+1 / S+1
- B: Spavaš → E+2
- C: Zoveš prijatelja → E−1 / V+2 / S+1

---

## 3. Prestige Sistem

**Unlock uslov:** "Sledeće leto" ending (CS < 6, Energija > 3).

**Šta se pamti:** `prestige_run: true` u localStorage + broj prethodnih CS poena.

**2 nova noda u drugom playthroughu:**

- **N9b [T] (10:00 — unlock):** Toma ti pokazuje svesku sa beleškama iz prošle godine. *(Prestige only)*
  - A: Čitaš zajedno → S+3 / V+1
  - B: "Sačuvaj za kućicu" → S+1

- **N26b (17:00 — replace N26 B/C):** Toma donosi gotov draft retrospektive.
  - A: Prihvataš njegovo → V+2 / S+2 / E+1
  - B: Radite zajedno → V+1 / S+2 / E−1

**Promenjen Toma dijalog (N21, prestige):**

> Normalni playthrough: *"Da li radimo sledeće leto?"*
> Prestige playthrough: *"Rekao si isto prošle godine. Šta je drugačije ovog puta?"*

---

## 4. Achievements (8)

| ID | Naziv | Unlock Uslov |
|----|-------|-------------|
| A1 | Zajednica nastaje | Ending: Veze≥8 AND Sećanja≥5 |
| A2 | Toma bi bio ponosan | Sve 3 Toma-specific opcije A odabrane (N3A, N9A ili N9b A, N21A) |
| A3 | Kluboslavija Bašta | N7 opcija A (pomeneš turneju 2026) |
| A4 | Sve pospremljeno | Nered ≤ 2 na kraju igre |
| A5 | Aforist | N22 opcija B (aforizam umesto teksta) |
| A6 | Solo artist | Završi igru Energija ≥ 7, bez ijedne V+2 opcije koja traži pomoć |
| A7 | Sledeće leto, zaista | Prestige unlock + završi 2. playthrough |
| A8 | Fondaš | N25 opcija C (novčanica za fond) |

---

## 5. Audio Mapa (Web Audio API, bez fajlova)

| Sat | Ambient Tip | Frekvencija / BPM | Nota |
|-----|-------------|-------------------|------|
| 07:00 | Tišina + ptičji crikut | 220 Hz sine tremolo 4 Hz | Pink noise, vol 0.1 |
| 08:00 | Jutarnji hum + kafa | 440 Hz, 60 BPM distant pulse | Filtered brown noise |
| 09:00 | Koraci šljunka + razgovor | 330 Hz, intermittent step clicks | |
| 10:00 | Toplo jutro | 220 Hz sine pad, 72 BPM | AM modulation |
| 11:00 | Letnji zujevi | 110 Hz buzz, AM 3 Hz | Insect-like drone |
| 12:00 | Podnevna vrućina | 180 Hz sustain, slow LFO 0.2 Hz | Max loudness |
| 13:00 | Postpodnevni pad | 160 Hz pad, 60 BPM | Low energy |
| 14:00 | Aktivni rad | 200 Hz, filtered percussion 90 BPM | |
| 15:00 | Zamor + senka | 220 Hz, 70 BPM | Volume fading |
| 16:00 | Popodnevni vetar | Bandpass noise sweep, 80 BPM | Breeze |
| 17:00 | Zlatni sat | 320 Hz warmth, 55 BPM — najsporije | |
| 18:00 | Sumrak | 160 Hz fade, 40 BPM | Dim |
| 19:00 | Mrak i kraj | 80 Hz drone, 30 BPM → fade out 8s | |

**SFX events:**
- Klik opcije: sine burst 800 Hz, 50ms, decay 20ms
- Resurs gain: 1200 Hz ping, 200ms
- Resurs loss: 200 Hz thud, 150ms
- Ending swell: 4s crescendo, 200→800 Hz sweep

---

## 6. Atmosphere CSS po Satu (13 vrednosti)

```
07:00 → background: #f5e6c8  /* bledožuta zora */
08:00 → background: #f2d9a8  /* narandžasto jutro */
09:00 → background: #f0d090  /* zlatno jutro */
10:00 → background: #efd67a  /* sunčano */
11:00 → background: #f5e84e  /* vreli pre-podne */
12:00 → background: #f7f2a0  /* beli podne, glare */
13:00 → background: #e8e87a  /* popodnevna žuta */
14:00 → background: #d4e088  /* zelenasto toplo */
15:00 → background: #c8d898  /* hlađenje počinje */
16:00 → background: #b8c8b0  /* zelenkasto popodne */
17:00 → background: #e8c880  /* zlatni sat */
18:00 → background: #d47050  /* narandžasti sumrak */
19:00 → background: #804050  /* ljubičasto-tamni kraj */
```

**iOS Safari fallback:** transitions.js koristi class toggle umesto CSS `transition` property.
Atmosphere.js detect: `const ios = /iP(hone|ad)/.test(navigator.userAgent)` — ako true, instant swap.

---

## 7. Verifikacija Modula

| Kategorija | Fajlovi | Broj |
|------------|---------|------|
| Core | main.js, config.js, state.js | 3 |
| Entities | characters.js, organizer.js, event_aftermath.js, location.js, item.js | 5 |
| Systems | decision_engine.js, timer.js, resource_manager.js, narrative_state.js, endings.js, achievements.js, prestige.js, event_selector.js | 8 |
| Render | render.js, ui.js, atmosphere.js, transitions.js | 4 |
| Content | decisions.js, dialogue.js, characters_data.js, endings_data.js, aforizmi.js | 5 |
| Audio | audio.js | 1 |
| Share | share.js | 1 |
| Styles | base.css, ui.css, atmosphere.css, theme.css | 4 |
| **Ukupno** | | **31** |

✓ 31 ≥ 25 — potvrđeno.

---

*Odluke 32, nodovi po satu 07–19 = 13 slotova. Toma nodovi: N3, N9, N15, N21, N30 (5). Kluboslavija node: N7 (novinarka, turneja 2026). Svaki resurs ima min 3 opcije koje ga direktno poboljšavaju. Prestige definisan i specifičan. Audio bez .mp3/.wav — 100% Web Audio API.*
