# Game Design Document — Jesenji Tok

## 1. Mehanike

### Grid Model
- **Matrica:** 6 parcela (redovi) × 12 nedelja (kolone). Nedelja 1 = 20. avg, Nedelja 12 = 5. nov.
- **Kapacitet po nedelji:** 3 grupna poena (group-points). Zadaci koji zahtevaju 2 grupe troše 2 poena; zadaci od 1 grupe troše 1 poen.
- **Parcela tipovi:** Šuma/hlad, Otvorena, Vodena, Graditeljska, Voćnjak, Kompost — svaki tip prima samo zadatke koji mu odgovaraju (config.js).
- **Assign pravilo:** Igrač raspoređuje task card u jednu nedelju unutar prozora. Zadatak traje tačno 1 nedelju. Jednom potvrđen, može se premestiti dok ta nedelja nije prošla.

### Input Model — Mobile (primarno, Nega korekcija #1)
- **Tap task card** → karta se selektuje (žuti highlight okvir)
- **Tap ćeliju u gridu** → assign (ako je legalan) ili error shake + tooltip (ako nije)
- **Tap van grid-a** → deselect
- **Desktop fallback:** drag & drop task card → ćelija, ili click card + click ćelija

### Conflict Detection (`systems/conflict.js`)
| Konflikt | Vizuelna reakcija | Tooltip poruka |
|----------|------------------|---------------|
| Tip mismatch | Crveni shake | "Ova parcela nije [tip]" |
| Kapacitet overflow | Narandžasti flash na nedeljnom headeru | "Nedelja popunjena — premesti jedan rad" |
| Van datumskog prozora | Žuti warning badge (assign dozvoljen) | "Van optimalnog prozora — 60% poena" |
| Weather blok (Graditeljski + kiša) | Crni X animacija | "Kiša blokira — premesti u suvu nedelju" |

---

## 2. Pacing po Minutama

| Vreme | Faza | Šta se dešava |
|-------|------|---------------|
| 0:00 – 1:00 | FTUE | 3 vođena koraka (vidi Sec. 6) |
| 1:00 – 5:00 | Planning | Slobodan raspored svih 6 task card-a |
| 5:00 – 8:00 | Review | Forecast bar aktivan; igrač menja raspored |
| 8:00 – 10:00 | Zimska bura | Grid se tika kroz nedelje, weather se otkriva u realnom tempu |
| 10:00 – 12:00 | Score screen | Rang, breakdown po zadatku, prestige izbor (ako score ≥ 300) |

---

## 3. Scoring Formula

**Bodovi po zadatku:**
| Zadatak | In-window | Out-window (×0.6) | Preskočen |
|---------|-----------|-------------------|-----------|
| Micelij inokulacija | 180 | 108 | 0 |
| Ozimo žito | 150 | 90 | 0 |
| Jezero zimska priprema | 160 | 96 | 0 |
| Graditeljski (suvozid/tarabe) | 170 | 102 | 0 |
| Zimska rezidba | 130 | 78 | 0 |
| Kompost zimski | 140 | 84 | 0 |
| **Max bez bonusa (svi in-window)** | **930** | | |

**Ekosistem bonus:**
- Uslov: Micelij + Jezero + Kompost — svi troje in-window
- Formula: `(180 + 160 + 140) × 1.5 = 720` umesto 480 → **+240 bonus poena**
- Maksimalni zbir sa bonusom: 720 + (150 + 170 + 130) = **1170 pts**

**Rang pragovi:**
| Rang | Prag | Tipična situacija |
|------|------|------------------|
| Savršena Sezona | ≥ 900 | Svi in-window (930), ili 5 in-window + ekosistem bonus (≥ 1000) |
| Solidna Sezona | 600 – 899 | 4–5 in-window, bez ekosistem bonusa |
| Preživećeš | 300 – 599 | 2–3 in-window, ostalo out ili skip |
| Zemlja nije zaboravila — ali ti si | 0 – 299 | ≤ 1 zadatak in-window |

**Fail threshold (Nega korekcija #3):** Score < 300 → sezona "propala" → prestige nije dostupan. Prikazuje se "Narednog proleća — pokušaj ponovo" ekran, grid se resetuje bez ikakvih bonusa.

---

## 4. Weather Sistem

**4 preset-a (slučajno se bira jedan po sesiji):**
| Naziv | Karakteristika | Efekt |
|-------|---------------|-------|
| Suva Jesen | Bez kiše, idealni uslovi | Nema bloka |
| Kišna Jesen | 3 uzastopne kišne nedelje (random N1–N8) | Graditeljski blokiran u te nedelje |
| Rani Mraz | Mraz pada u Nedelji 10 | Micelij window zatvara N10 (umesto N11), Rezidba window zatvara N10 |
| Vatreno Lišće | Topli suhi period N1–N3 | Ozimo window produžen za 1 nedelju (do N5); Kompost u N1–N2 = −10% poena (previše vruće) |

**Forecast bar (Nega korekcija #4):**
- Prikazuje tekuću + 2 naredne nedelje: ☀️ suvo / 🌧️ kiša / ❄️ mraz / 🍂 toplo
- Weather preset se otkriva postepeno — igrač ne vidi celu sezonu odjednom, samo 2-nedeljni buffer
- **Prestige "Čitljivo nebo"** otključava punu sezonu vidljivu od starta

---

## 5. Prestige Loop

**Ulazni uslov:** score ≥ 300. Fail sesija ne otvara prestige.

**3 opcije (biratiš jednu pre reset-a grida):**
1. **+1 Radna grupa** — nedelja ima 4 group-points umesto 3 (trajno za tu sesiju)
2. **Iskusna parcela** — Micelij inokulacija kosta 1 group-point umesto 2 (jedna parcela po izboru)
3. **Čitljivo nebo** — cela weather forecast vidljiva od starta, nema 2-nedeljnog buffer-a

**Save format (localStorage):**
```json
{
  "jt_prestige_bonus": "extra_group | experienced_parcel | full_forecast | null",
  "jt_experienced_parcel_id": "micelij | null",
  "jt_best_score": 0,
  "jt_total_runs": 0,
  "jt_ftue_done": false
}
```

---

## 6. FTUE — 3 Vođena Koraka (Nega korekcija #2)

**Korak 1 — Prva parcela guided (Ozimo žito):**
- Overlay strelica na Ozimo žito card: "Tap da selektuješ"
- Overlay strelica na Otvorena parcela, Nedelja 2: "Tap da raspoređuješ"
- Potvrda animacija + tekst: "Prozor avgusta do 20. septembra. Zasadi rano — proleće hvali."

**Korak 2 — Weather preview:**
- Forecast bar pulsira sa "pip" animacijom: "Vidiš 2 nedelje unapred. Kiša blokira graditeljske radove — planiraj suhe nedelje za suvozid."
- Ako je preset Kišna Jesen: kišne nedelje su odmah vidljive u forecast-u kao motivacioni signal.

**Korak 3 — Ekosistem uslov:**
- Info kartica sa ikonicama za Micelij + Jezero + Kompost: "Svi troje u prozoru = ×1.5 bonus na ta tri. Vredi uskladiti."
- Dismiss: dugme "Razumem"

**Replay:** `jt_ftue_done: true` u localStorage → FTUE se preskače, direktno na planning fazu.

---

## 7. Guncati Edukativni Tekst po Zadatku (Nega korekcija #5)

| Zadatak | Tooltip (jednom tapom na info ikonu) |
|---------|-------------------------------------|
| Micelij inokulacija | "Bukovač inokulacija traži hlad i vreme za rast. Van avgusta–oktobra, micelijum ne stiže pre mraza. Berba novembar." |
| Ozimo žito | "Seje se do 20. septembra — posle toga zemlja se hladi, klijanje kasni, prinos pada. Proleće žetva." |
| Jezero zimska priprema | "Ribe prezimljuju bolje uz oktobarska/novembarska aeracija. Bez pripreme, kiseonik pada pod ledom." |
| Graditeljski (suvozid/tarabe) | "Kamen i malta ne drže u vlazi. Suvi prozor avgusta–septembra je jedini pravi; dockan kišni rad pravi pukotine do proleća." |
| Zimska rezidba | "Reže se posle prvih mrazeva, pre dubokog mirovanja. Prozor sept 15 – okt 31. Ranije ili dockan = prinos −20% idućeg proleća." |
| Kompost zimski | "Fermentacija je aktivna dok temperatura drži. Posle 20. oktobra mikrobi usporavaju — prolećno gnojivo gubi moć." |

---

## 8. Modul Lista

| # | Fajl | Opis |
|---|------|------|
| 1 | `src/main.js` | Bootstrap, game loop, event wire-up |
| 2 | `src/config.js` | Task windows, group costs, score values, rank thresholds, weather preset data |
| 3 | `src/state.js` | Game state shape, save/load localStorage, prestige persistence |
| 4 | `src/input.js` | Tap/click handler, drag&drop fallback, card select/deselect logika |
| 5 | `src/systems/scoring.js` | Score kalkulacija, ekosistem bonus, rang određivanje, fail threshold |
| 6 | `src/systems/weather.js` | Preset selekcija, forecast buffer generisanje, blok aplikacija na grid |
| 7 | `src/systems/validation.js` | Legalan assign check (tip, kapacitet, weather blok, prozor) |
| 8 | `src/systems/prestige.js` | Prestige ulazni uslov, bonus aplikacija na novi grid |
| 9 | `src/systems/achievements.js` | Unlock logika: prvi ekosistem bonus, savršena sezona, 3× prestige |
| 10 | `src/systems/conflict.js` | Conflict detection, error animacija trigger, tooltip poruka routing |
| 11 | `src/render.js` | Canvas/DOM render engine, grid crtanje, tick animacije tokom Zimske bure |
| 12 | `src/ui.js` | Orkestrira sve UI komponente, state→UI sync |
| 13 | `src/ui/grid.js` | Grid prikaz, ćelija stanja (prazna / assigned / blokirana / warning) |
| 14 | `src/ui/cards.js` | Task card komponente, selection highlight, group cost badge |
| 15 | `src/ui/score-screen.js` | Score ekran sa breakdown-om po zadatku, rang animacija |
| 16 | `src/ui/prestige-screen.js` | 3 prestige opcije, confirm/cancel flow |
| 17 | `src/ui/tutorial.js` | FTUE 3-korak overlay, localStorage flag za preskakanje |
| 18 | `src/audio.js` | Web Audio: jesen ambient, glineni thud za assign, drveni click za confirm, solo harmonika za score screen |
| 19 | `src/share.js` | html2canvas score card snimak, Web Share API, Kluboslavija event link |
| 20 | `src/content/tasks.js` | Task definicije: id, naziv, parcel_type, window_start/end, group_cost, base_score |
| 21 | `src/content/brana_dialogs.js` | Brana komentari po rangu (4 teksta: Savršena / Solidna / Preživećeš / Propala) |
| 22 | `src/content/brand_hooks.js` | Guncati masterclass CTA tekst, Kluboslavija event datum i URL za share card |
| 23 | `styles/base.css` | Layout, full-screen grid container, responsive breakpoints |
| 24 | `styles/game.css` | Grid ćelija animacije, drag efekti, weather overlay, error shake keyframes |
| 25 | `styles/ui.css` | Card dizajn, forecast bar, HUD, score screen layout |
| 26 | `styles/theme.css` | Tamna šuma paleta: bg `#1a2415`, surface `#2d3d20`, accent `#8bc34a`, amber `#f5a623` |

**Zbir: 26 modula ✓ (≥ 25)**

---

## 9. Balance Tabela

### Pressure Point: Avg 20 – Sept 20 (Nedelje 1–4)

Dostupni zadaci u N1–N4: Micelij (2pts), Ozimo (1pt), Graditeljski (2pts), Kompost (1pt)
Kapacitet: 4 nedelje × 3pts = 12 group-points. Potrebno: 2+1+2+1 = 6pts → matematički ima mesta.

**Ali uz Kišnu Jesen (3 blok nedelje unutar N1–N8):** Ako kišne nedelje padnu na N2–N4, Graditeljski sme samo u N1. N1 = Graditeljski(2) + 1pt zadatak = popunjena. Micelij(2pts) mora u N2, ali kiša ne blokira Micelij (kiša blokira samo Graditeljski tip) — dakle Micelij može u N2. Rezultat: bez prestige bonusa igrač uspe da rasporedi sve, ali bez greške u rasporedu. Jedna loša click → Graditeljski ostaje bez mesta.

**Sa prestige "+1 radna grupa" (4pts/nedelja):** Graditeljski(2) + Micelij(2) = 4pts → mogu u isti tjedan. Pressure point nestaje.

### Scenario matrica po weather preset-u

| Preset | Graditeljski rizik | Micelij rizik | Preporučena strategija |
|--------|-------------------|---------------|----------------------|
| Suva Jesen | Nema | Nema | Slobodan raspored; ekosistem lako |
| Kišna Jesen | Kritičan | Nizak | Graditeljski odmah u N1 ili N7–N8 |
| Rani Mraz | Nizak | Umeren | Micelij u N1–N5; ne čekati kraj prozora |
| Vatreno Lišće | Nizak | Nizak | Kompost ne u N1–N2; Ozimo ima extra nedelja |

### Optimal vs. Suboptimal scoring

| Situacija | Zbir | Rang |
|-----------|------|------|
| Svi in-window + ekosistem bonus | 1170 | Savršena |
| Svi in-window, bez ekosistem | 930 | Savršena |
| Graditeljski out (102), ostalo in-window + ekosistem | 720 + 150 + 130 + 102 = **1102** | Savršena |
| Micelij out (108), nema ekosistem, ostalo in-window | 108+150+160+170+130+140 = **858** | Solidna |
| 4 in-window (Micelij+Graditeljski out, bez ekosistem) | ~760 | Solidna |
| 2 in-window, 2 out-window, 2 skip | ~410 | Preživećeš |
| 1 in-window, 4 out, 1 skip | ~250 | Propala (no prestige) |

---

## 10. Kluboslavija Integration — Odluka

**Odluka: share card sa event linkom.**

Score screen prikazuje dugme "Podeli sezonski izveštaj" (aktivan samo na rangu Solidna ili Savršena). `share.js` generiše html2canvas snimak score kartice. Web Share API poruka:

> "Moja jesenja sezona na Guncati: [RANG] ([score] poena) 🌾 Guncati Jesenji Masterclass — [event_datum] — [event_url]"

`brand_hooks.js` drži `EVENT_DATE` i `EVENT_URL` kao config konstante — Iskra ih ažurira pre deploy-a kad je datum potvrđen. Ovo je konkretan integration point; Kluboslavija ostaje u `brand_serves`.
