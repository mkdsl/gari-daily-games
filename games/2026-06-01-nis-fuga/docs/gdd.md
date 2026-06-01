# Niš Fuga — Game Design Document
### Mile Mehanika | GDG Game Designer

*Verzija 1.0 | Na osnovu concept.md (Iskra) i premortem.md (Nega) | 2026-06-01*

*Uvažene Negine CRITICAL primedbe: resource rebalansiranje (CRITICAL-2), dialog tree hard cap (CRITICAL-1), CSS art component library (CRITICAL-3), Scena 4 redizajn (MEDIUM-2), reputacija vidljiva (MEDIUM-1), eksplicitno Kluboslavija brandiranje.*

---

## 1. Mehanike Detaljno

### 1.1 Point-and-Click Sistem

**Desktop:** Igrač klikće na hotspot zone. Cursor postaje pointer iznad hotspota. Svaka scena: 2-3 istraživačka hotspota (flavor) + 1 primary action hotspot (zaplet).

**Mobile:** Touch target minimum 48×48px. Action bar dole sa 2-3 dugmadi koja odgovaraju hotspotovima. Dualni input: vizuelni tap I action bar rade.

**Hotspot feedback:** CSS transform scale 0.95→1.05 (120ms) + click SFX (Web Audio 800Hz pluck, 80ms decay).

---

### 1.2 Dijalog Sistem

**Arhitektura:** Svi dijalog čvorovi su JSON data struktura. `DialogEngine.js` čita JSON i renderuje. Sadržaj se menja bez dodirivanja logike.

**Čvor struktura:**
```json
{
  "id": "s1_dragoljub_start",
  "speaker": "Dragoljub",
  "text": "Mladi čoveče, ovo je zabranjena zona...",
  "portrait": "dragoljub_neutral",
  "choices": [
    {
      "text": "Oprostite, mi smo Kluboslavija ekipa...",
      "next": "s1_dragoljub_diplomatic",
      "requires": null,
      "effects": {"time": -5, "reputation": 0}
    }
  ]
}
```

**Hard cap:** 60 dijalog čvorova ukupno (~12 po sceni).

**Resource-gated opcije:** Ako uslov nije ispunjen, opcija je vidljiva ali greyed-out sa tooltipom. Igrač vidi da postoji — motivacija za replay.

---

### 1.3 Resource Tracking

| Resurs | Prikaz | Raspon | Vidljivost |
|--------|--------|--------|------------|
| Vreme (min do deadlinea) | Analogni sat | 0-60 | Uvek |
| Strpljenje | Termometar (5 stepeni) | 0-5 | Uvek |
| Ekipni moral | 4 figure ikone | 0-4 | Uvek |
| Reputacija | Srca ikona | 0-5 | Uvek |

**Reskaliranje vremena (CRITICAL-2 fix):** Igra počinje u 13:00 h (60 minuta pre soundcheck u 14:00). Loši izbori koštaju 8-20 minuta.

- All-bad scenario: -20 + 0 + 0 + -20 + (-25+15) = -80 min od 60 dostupnih → **HARD FAIL** ✓
- All-good scenario: -5 + 0 + 0 + -10 + -5 = -20 min → 40 min spare
- Razlika je osetna. Hard fail je achievable.

---

## 2. Pet Scena — Detaljan Dizajn

---

### SCENA 1 — Parking na Bulevaru

**CSS art:** Horizontalna kompozicija. Bulevar blokovi (geometrijski pravougaonici, bež/siva). Combo van (duguljast box, tamni prozori). Parking znak (CSS circle, P na plavoj). Jutarnje nebo (narandžast gradijent). Dragoljub desno (uniforma, tamno plava + žuti akcenat, beležnica).

**NPC:** Dragoljub Đorđević — parking inspektor, 48 god, pravedan ali čuje argument.

| Opcija | Tekst | Outcome | Efekti |
|--------|-------|---------|--------|
| A | "Oprostite, mi smo Kluboslavija ekipa..." | Kazna otpada | Vreme: -5min, Rep: +2, Moral: +1 |
| B | "Platimo odmah" | Brzo, bez razgovora | Vreme: -2min, Moral: -1 |
| C | Tiho odmakne van | Dragoljub poziva inspekciju | Vreme: -20min, Str: -2, Moral: -2 |

**Flavor hotspoti:** (1) Van bočna strana → "Svira Đole Balašević iz prozora. U 09:00 ujutro. Normalno." (2) Parking znak → "Stoji od 07:00 do 21:00. Ko god je dizajnirao Bulevar nije mislio na tour kombije."

**Eksplicitno brandiranje:** Dragoljub u opciji A pita: "Kluboslavija? Čuo sam — moj nećak kaže da su odlični."

---

### SCENA 2 — Kiosk Medijana

**CSS art:** Kiosk box dominira centrom (šareni magneti kao CSS text/box elementi, rolo-kapak napola). Iza: stambena zgrada Medijane (tamniji blok). Ispred: 2 lika u redu. Gore desno: 0-bar signal ikona.

**NPC:** Baca Mile (Milenko Đokić) — vlasnik kioska 22 god, zna sve za svakog.

| Opcija | Tekst | Outcome | Efekti |
|--------|-------|---------|--------|
| A | Strpljivo čekati, pitati za sve | Kafa + print + čokolada | Vreme: -10min, Moral: +2, Rep: +1, *setlista=true* |
| B | Zamoliti da se propustite | Kafa bez setliste | Vreme: -4min, Str: -1, Moral: -1 |
| C | Print "kad bude gotov" | Setlista ne stigne | Vreme: -2min, *setlista=false*, Scena 5 debuff |

---

### SCENA 3 — Kafana "Kod Pante"

**CSS art:** Kafana interijer. Keramički zidni rapat (CSS repeating pattern, rombovi, zelenkasto-beli). Drveni šank (braon box). Kroz prozor: Niška Tvrđava silhueta (crvena cigla, jutarnje nebo). Panta iza šanka.

**NPC:** Panta Stefanović — kafandžija, 65 god, ne zna šta je soundcheck ali zna šta su lepe reči.

| Opcija | Tekst | Outcome | Efekti |
|--------|-------|---------|--------|
| A | Objasniti Panti soundcheck (3 razmene) | WiFi lozinka dobijena | Vreme: -8min, Rep: +2, Moral: +1, *tonika=true* |
| B | Signal napolju | Srđan na hladnoći, 2x pada | Vreme: -12min, Str: -2 |
| C | Odložiti poziv | Ton-majstor nedostupan | Vreme: 0, Scena 5 +20min komplikacija |

**Soundcheck dijalog (3 čvora, Scena 3 Grana A):**
1. Jovanka: "Moramo proveriti da svi mikrofoni i zvučnici rade." → Panta: "Pa naravno, mora se probati. Mi isto probamo svakog jutra je l' radi ormar."
2. Jovanka: "Malo kompleksnije — sat-dva da podesimo akustiku." → Panta: "Akustiku? Moja kafana ima odličnu akustiku, evo čuješ." *(ambient zvuk kafane)*
3. Panta: "A dobro, vi to zovete soundcheck. Mi to zovemo 'da vidimo radi li'. Evo ti lozinka: Niska2019."

---

### SCENA 4 — Niška Tvrđava (susret sa Bojanom)

*Redizajn po Negi MEDIUM-2: turistički vodič je background detalj, NPC je lokalni muzičar Bojan.*

**CSS art:** Park pored Tvrđave. Tvrđava zid (CSS repeating pattern, cigla crvena/braon). Zelena trava (horizontalne linije). Park klupa (geometrijski shape). Bojan sa gitarskim koferom. Slobodan i turisti vidljivi u daljini (mali, statični, ukrasni).

**NPC:** Bojan Tasić — lokalni gitarista, 28 god, otvara za Kluboslavija večeras.

| Opcija | Tekst | Outcome | Efekti |
|--------|-------|---------|--------|
| A | Napraviti mesta u kombiju | Bojan oduševljen | Moral: +2, Rep: +1, Vreme: -10min, *bojan=true* |
| B | Taxi alternativa | Stiže kasno ali stiže | Moral: +1, Vreme: -3min |
| C | Nema mesta (laž) | Bojan vidi otvorena vrata | Moral: -2, Rep: -1, Str: -1 |

**Flavor hotspotovi:** (1) Tvrđava zid → "Rimska, vizantijska, srpska, otomanska, austrijska gradnja. Svako ko je prošao kroz Niš nešto je dogradio." (2) Klupa → "Nova klupa, 2024. Piše 'Ne sedite sa psom.' Pas sedi. Dobar pas."

**Lokalni geg:** Bojan: "Moja Niva je kod majstora zbog... točka. Jedan točak. Majstor kaže do petka. Danas je ponedeljak."

---

### SCENA 5 — Kapija Kluba

**CSS art:** Noćna scena. Industrijska kapija (tamno siva, border texture). Neonski natpis "KLUBA" (CSS text-shadow glow). Nenad u crnoj uniformi. Pozadina: pulsing svetlo kroz puknuće (CSS animation keyframes — bas ritam nagovestaj).

**NPC:** Nenad Stojković — čuvar, prvi dan na eventu, radi po pravilniku.

| Opcija | Uslov | Tekst | Efekti |
|--------|-------|-------|--------|
| A | Rep ≥ 3 | Digitalni mejl + reference iz Niša | Vreme: -5min |
| B | Uvek | Čekati Gorana | Vreme: -15min (ili -5 ako tonika=true) |
| C | setlista=true | Baca Mileov print | Vreme: -2min, Rep: +1 |
| Bonus | bojan=true | Bojan izlazi i garantuje | Vreme: 0 |

---

## 3. Resource Sistem

### 3.1 Početni Vrednosti i Raspon

| Resurs | Start | Min | Max |
|--------|-------|-----|-----|
| Vreme (min) | 60 | 0 | 60 |
| Strpljenje | 4 | 0 | 5 |
| Moral ekipe | 3 | 0 | 4 |
| Reputacija | 0 | 0 | 5 |

### 3.2 Endings Formula

```
E = Vreme_ostalo + (Moral × 8) + (Reputacija × 4)
```

| Score | Ending |
|-------|--------|
| ≥ 70 | Legendarno jutro |
| 50-69 | Solidno jutro |
| 30-49 | Prošlo je nekako |
| 10-29 | Chaos morning |
| Vreme=0 | Nismo stigli (hard fail) |

**Kombinatorni endings (Negin MEDIUM-4 fix):**
- Rep ≥ 4 + Moral ≤ 1 → "Svi te vole, ekipa te mrzi" (override score)
- bojan=true + setlista=true + score ≥ 50 → "Niš nas je primio" (secret ending)

---

## 4. Endings Tabela

| # | Naziv | Uslov | Opis |
|---|-------|-------|------|
| 1 | **Legendarno jutro** | Score ≥ 70 | Stigli 40 min pre soundcheck-a. Ton-majstor čeka sa kafom. Goran: "Jedina ekipa koja je ikad stigla ranije od mene u Nišu." |
| 2 | **Solidno jutro** | Score 50-69 | Standardno dobro. Panta je zapravo u publici. |
| 3 | **Prošlo je nekako** | Score 30-49 | 5 min pre soundcheck-a. Basista: "Half-soundcheck." |
| 4 | **Chaos morning** | Moral=0 ili Score 10-29 | Stigli šutljivi. Svira dobro ali jutro se oseti. |
| 5 | **Nismo stigli** | Vreme=0 | 14:47 h. Soundcheck preskočen. Goran: "Ovo nije prvi put." |
| S1 | **Svi te vole, ekipa te mrzi** | Rep≥4 + Moral≤1 | Svi Nišlije je vole, ekipa je ne trpi. Ironični ending. |
| S2 | **Niš nas je primio** | bojan+setlista+score≥50 | Bojan posveti pesmu Kluboslavija ekipi. Secret. |

---

## 5. Achievements / Trophies

| # | Naziv | Uslov | Poruka |
|---|-------|-------|--------|
| 1 | **Dragoljubova Milost** | Scena 1 opcija A, Rep=0 | "Ubedio si parking inspektora bez i jednog poznanstva u Nišu. Talent." |
| 2 | **Baca Mile Zna Sve** | Setlista + čokolada (Scena 2 opcija A) | "Kiosk Bace Mileta je tačka gde se sve ukrštaju. Sada i ti to znaš." |
| 3 | **Soundcheck Objašnjenje** | Sve 3 razmene sa Pantom | "Uspeo si da objasniš soundcheck čoveku od 1987. Misija nemoguća." |
| 4 | **Niš Logika** | Nenadov "nemojte reći da sam ja pustio" | "Ovo je kvintesencija Niš rešavanja problema." |
| 5 | **Tajni Gost** | Secret ending S2 | "Bojan je posvetio pesmu vašoj ekipi. Niko u publici nije znao zašto." |
| 6 | **I Ovako Nekad Bude** | Hard fail ending | "Stigli ste u 14:47. Soundcheck je bio u 14:00." (ironično) |
| 7 (skriveni) | **Rimska Logistika** | Tvrđava hotspot posle basistovog komentara | "Primetio si da basista ima poente." |
| 8 (skriveni) | **Epson Legenda** | Dobiti stari print u Sceni 2 | "Epson iz 2009. nikad nije pogriješio. Samo nije uvek štampao prave stvari." |
| 9 (skriveni) | **Niva Do Petka** | Opcija C u Sceni 4 | "Videlo se da je van bio prazan. Nikad više ne laži čoveku čija je Niva kod majstora." |

---

## 6. Replay Hooks

1. **Gated opcije vidljive:** Greyed-out opcija u Sceni 5 u prvom run-u — igrač zna da može da je otključa
2. **Secret ending hint:** Na kraju "Solidno jutro" sitnim tekstom: "Bojan kaže da je dobro prošlo. Pitaš se da li je moglo bolje."
3. **Achievement lista na main menu-u:** 9 achievements, 3 skrivena — completionism motivacija
4. **"Svi te vole, ekipa te mrzi"** — čudan ending, igrači žele da razumeju kako su stigli tu
5. **Dijalog varijante:** Dragoljub i Panta imaju alternate intro tekst za visoku/nisku reputaciju

---

## 7. Dialog Tree Mapa

**Ukupno: 58 čvorova** (ispod hard cap-a od 60)

```
Scena 1: 12 čvorova (uvod + 3 grane × 2-3 dubine + 2 flavor)
Scena 2: 11 čvorova
Scena 3: 13 čvorova (soundcheck grana ima 4 dubine)
Scena 4: 11 čvorova
Scena 5: 11 čvorova
UKUPNO: 58
```

Prosečna dubina stabla: 3-4 čvora. Maksimalna: 5 (Scena 3, soundcheck grana).

---

## 8. CSS Art Lista

### Backgrounds (5)

| ID | Opis | Ključni CSS |
|----|------|------------|
| `bg-bulevar` | Jutarnji Bulevar, blokovi, parking | Repeating box pattern, gradijent nebo |
| `bg-kiosk` | Kiosk, stambena zgrada, red | Izometrijski kiosk box, bilbord text |
| `bg-kafana` | Kafana interijer, šank, Tvrđava kroz prozor | Rombičan keramički rapat, Tvrđava silhueta |
| `bg-tvrdjava` | Park, Tvrđava zid, klupa | Repeating radial gradient (cigla), grass lines |
| `bg-kapija` | Noćna kapija kluba, neon glow | Metalik box texture, CSS glow, pulsing animation |

### NPC Sprites (5) — 80×120px CSS div kompozicije

| ID | Opis | Karakteristični detalj |
|----|------|----------------------|
| `npc-dragoljub` | Parking inspektor | Žuta traka na uniformi, beležnica |
| `npc-bacamile` | Kiosk vlasnik | Šajkača (CSS polygon), pregača |
| `npc-panta` | Kafandžija | Bela košulja, džezva u ruci |
| `npc-bojan` | Gitarista | Gitarski kofler box, casual jakna |
| `npc-nenad` | Čuvar | Crna uniforma, ruke skrštene |

### UI Elementi (7)

| ID | Opis |
|----|------|
| `ui-clock` | Analogni sat (CSS kazaljke sa animacijom) |
| `ui-patience` | Termometar (fill koji se smanjuje) |
| `ui-morale` | 4 figure ikone, greyed kad moral pada |
| `ui-reputation` | 5 srca (puno/prazno) |
| `ui-dialog-bubble` | Speech bubble (bela, zaobljeni ugao, tail) |
| `ui-choice-button` | Izbor dugme (hover, greyed-out za gate) |
| `ui-ending-screen` | Full-screen overlay sa Kluboslavija brandingom |

---

## 9. Audio Spec

### Ambient per Scena

| Scena | Opis | Implementacija |
|-------|------|----------------|
| Bulevar | Jutarnji grad, ptice | OscillatorNode 80Hz + filtered WhiteNoise + stochastic clicks |
| Kiosk | Radio u daljini, štampač | BandPass filtered noise + ritmični percussive bursts |
| Kafana | Tiha folk melodija, keramika | OscillatorNode (D-G-A-D pentatonic random walk) + decay pops |
| Tvrđava | Vetar, park tišina | LFO-modulated WhiteNoise (LowPass 400Hz) |
| Kapija | Bass dron, muffled muzika | SubOscillator 40Hz + pulsed BandPass 200-500Hz |

### UI SFX

| Zvuk | Implementacija |
|------|----------------|
| `sfx-click` | 800Hz, 80ms decay, sine |
| `sfx-dialog-open` | 1200Hz→800Hz sweep, 200ms |
| `sfx-resource-gain` | Ascending major third: 440→550Hz, 300ms |
| `sfx-resource-lose` | Descending minor third: 440→370Hz, 300ms |
| `sfx-gated` | Low thud: 150Hz, 100ms |
| `sfx-transition` | White noise fade 500ms + sin sweep |

### Ending Stingeri

| Ending | Melodija |
|--------|----------|
| Legendarno jutro | D major arpeggio ascending (2s) |
| Solidno jutro | G major chord (1.5s) |
| Prošlo je nekako | A minor flat (1.5s) |
| Chaos morning | Dissonant minor cluster (2s) |
| Nismo stigli | Descending chromatic (2s, pomalo komičan) |
| Secret endings | D minor → D major pivot (3s) |

---

## 10. Pacing

| Scena | Prosek | Brzi prolaz | Istraživač |
|-------|--------|-------------|------------|
| Scena 1 | 2.5 min | 1 min | 4 min |
| Scena 2 | 3 min | 1.5 min | 5 min |
| Scena 3 | 4 min | 2 min | 6 min |
| Scena 4 | 2.5 min | 1 min | 4 min |
| Scena 5 | 2 min | 1 min | 3 min |
| Endings | 1 min | 0.5 min | 2 min |
| **TOTAL** | **15 min** | **7 min** | **24 min** |

---

## 11. Lokalizacija Niš Gegova (8 referenci)

| # | Referenca | Gde se koristi |
|---|-----------|----------------|
| 1 | Bulevar Nemanjića blok arhitektura | Scena 1 background |
| 2 | "Niška" čokolada | Scena 2, opcija A reward |
| 3 | Kafana radi od 08:00 "jer Panta tako želi" | Scena 3 premise |
| 4 | WiFi lozinka "Niska2019" | Scena 3 Panta dijalog |
| 5 | Konstantin Veliki, Niš, ponosno | Scena 4 Tvrđava hotspot |
| 6 | Niva kod majstora do petka | Scena 4 Bojan geg |
| 7 | Čuvarev "nemojte reći da sam ja pustio" | Scena 5 |
| 8 | Đole Balašević iz prozora u 09:00 | Scena 1 van hotspot |

---

## 12. Modul Arhitektura (29 moduli)

```
games/2026-06-01-nis-fuga/
├── index.html
├── src/
│   ├── engine/
│   │   ├── SceneManager.js      # Učitavanje i tranzicija scena
│   │   ├── DialogEngine.js      # JSON parser i renderer
│   │   ├── ResourceManager.js   # Resurs tracker + formula engine
│   │   ├── EventBus.js          # Inter-module komunikacija
│   │   ├── HotspotEngine.js     # Click/touch detekcija
│   │   └── AchievementSystem.js # Trophy tracker
│   ├── scenes/
│   │   ├── SceneBulevar.js
│   │   ├── SceneKiosk.js
│   │   ├── SceneKafana.js
│   │   ├── SceneTvrdjava.js
│   │   ├── SceneKapija.js
│   │   └── SceneEnding.js
│   ├── data/
│   │   ├── dialogs.json         # Svi dijalog čvorovi (58)
│   │   ├── scenes.json          # Scene metadata i hotspot definicije
│   │   └── achievements.json   # Achievement definicije
│   ├── audio/
│   │   ├── AudioEngine.js
│   │   ├── AmbientPlayer.js
│   │   └── SfxPlayer.js
│   ├── ui/
│   │   ├── DialogRenderer.js
│   │   ├── ResourceBar.js
│   │   ├── ChoiceMenu.js
│   │   └── EndingScreen.js
│   ├── art/
│   │   ├── BackgroundRenderer.js
│   │   ├── NpcRenderer.js
│   │   └── UiComponents.js
│   └── utils/
│       ├── GameState.js
│       ├── SaveSystem.js
│       ├── FlagManager.js
│       └── Analytics.js
└── docs/
    ├── concept.md
    ├── premortem.md
    └── gdd.md
```

**29 moduli** (iznad minimuma od 25).

## 13. MVP vs Polish

**MVP (mora biti u launch verziji):**
- Svih 5 scena, funkcionalne
- 3 glavna endings (Legendarno, Solidno, Nismo stigli)
- Resource sistem
- Mobile touch support
- Audio ambijent
- Kluboslavija CTA na endings screen-u

**Polish (nice-to-have):**
- Svih 7 endings uključujući 2 secret
- Svih 9 achievements
- Animirani NPC sprites
- Resource-gated greyed opcije sa tooltipom
- Per-ending unikatne melodije
- Flavor hotspot audio

---

*Mile Mehanika | GDG Game Design Document | 2026-06-01*
