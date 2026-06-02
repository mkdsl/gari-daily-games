# Pečurka Inokulator — Game Design Document

**Autor:** Mile Mehanika (game designer)
**Datum:** 2026-06-02
**Bazira se na:** concept.md + premortem.md

---

## 1. Overview

**Naziv:** Pečurka Inokulator
**Žanr:** Timing / Precision Arcade
**Platforma:** Browser (HTML5 Canvas, mobile + desktop)
**Sesija:** 5–10 minuta
**Nivoa:** 10
**Kompleksnost:** 2/5

---

## 2. Core Mehanika

### Scena

Igrač vidi fiksnu scenu odozgo/koso:
- **Drveni sto** u centru ekrana — rustikalno-laboratorijska estetika
- **Vreća/tegla supstrata** na stolu (pixel art, bela plastika ili staklo)
- **Inokulacioni sprej/igla** sa strane — vizuelno naznačava akciju igrača
- **Timing bar** — horizontalni pas na dnu ili centru ekrana (dominantan UI element)
- **Sterilni prozor** (zeleni pas) koji se kreće po timing bar-u

### Timing Window Mehanika

Timing bar je horizontalna traka puna širine ili 80% ekrana. Po njoj se kreće **zeleni pas** (sterilni prozor):

- Prozor osciluje levo-desno (sinusoidno kretanje ili linearna ping-pong bounca)
- Brzina kretanja raste sa svakim nivoom
- Unutar prozora postoji **ciljna zona** (bela vertikalna linija ili tačka) — to je tačna meta

**Akcija:** Igrač klikne/tapne u bilo kom trenutku.

- Klik dok je ciljna zona unutar zelenog prozora → **Uspešna inokulacija**
  - Animacija: micelij se širi iz vreće (beli pikselni talasi)
  - Zvuk: ding + fizzy bubbles
  - Score += `base_score × nivo_bonus × combo_multiplier`
- Klik dok je ciljna zona izvan prozora → **Kontaminacija**
  - Animacija: plesni (zeleno-narandžasta mrlja) raste iz vreće
  - Zvuk: buzzer + splat
  - Životi -= 1
  - Streak se resetuje

### Životi

- 3 života po celoj igri (ne po nivou)
- Vizualni prikaz: 3 inokulacione igle u HUD-u, prazne se pri grešci
- Kada se izgube sva 3 → Game Over

---

## 3. Sistem Nivoa

Svaki nivo ima definisan set **vreća** koje treba inokulisati. Kada se sve vreće uspešno inokulišu → Level Clear.

Broj vreća po nivou: nivoi 1–6 = 1 vreća po potezu, nivoi 7–10 = više vreća.

### Tabela 10 Nivoa

| Nivo | Window trajanje (ms) | Window brzina | Skor po hit | Specijalnost |
|------|---------------------|---------------|-------------|--------------|
| 1    | 800                 | spora         | 100         | Uvod, vizuelni tutorial overlay, nema fake-out |
| 2    | 700                 | spora         | 120         | +1 fake hit zone (siva traka, ne smeta) |
| 3    | 600                 | srednja       | 150         | Window menja pravac (bez bounce-a, smooth reverse) |
| 4    | 500                 | srednja       | 180         | 2 inokulacije po vreći (2 klika nužna) |
| 5    | 450                 | srednja-brza  | 220         | Bonus window (zlatni, 2× score, kratkotrajan) |
| 6    | 400                 | brza          | 260         | Treper window (zeleni pas blinkuje, otežava čitanje) |
| 7    | 350                 | brza          | 300         | 2 vreće istovremeno (2 timing bar-a, svaki ima svoj prozor) |
| 8    | 300                 | brza          | 350         | Fake-out (siva zona koja izgleda kao zelena) + golden window |
| 9    | 260                 | veoma brza    | 400         | 3 vreće, random redosled aktivacije (ne sve odjednom) |
| 10   | 220                 | max           | 500         | Sve prethodne mehanike kombinovane (treper + fake + multi-bag) |

**Napomena uz premortem korekciju #3:** Nivoi 7 i 8 koriste fiksni seed za raspored fake-out zona u prvih 5 partija novog igrača (localStorage flag `firstRunDone`). Posle 5 partija prelazi na puni random.

---

## 4. Scoring Formula

### Base Score

```
hit_score = base_nivo_score × nivo_bonus_factor × combo_multiplier
```

Gde:
- `base_nivo_score` — vrednost iz tabele nivoa (100–500)
- `nivo_bonus_factor` = 1.0 (standardno), 2.0 (zlatni prozor)
- `combo_multiplier` = 1.0 (bez combo), 1.5 (streak ≥ 3), 2.0 (streak ≥ 6)

### Streak

- Streak se gradi uzastopnim čistim hitovima (bez greške između)
- 3+ uzastopnih čistih hita → `streak_multiplier = 1.5`
- 6+ uzastopnih čistih hita → `streak_multiplier = 2.0`
- Svaka greška resetuje streak na 0

### Perfect Round Bonus

Ako se ceo nivo završi bez ijedne greške:
```
perfect_bonus = base_nivo_score × 2
```

Bonus se dodaje na kraj nivoa pre prelaska na sledeći.

### Primer Kalkulacije (Nivo 5, streak 4):

```
hit_score = 220 × 1.0 × 1.5 = 330
perfect_bonus (ako nema greški) = 220 × 2 = 440
```

---

## 5. Highscore Sistem

### Lokalni Daily Highscore

- Čuvanje u `localStorage` pod ključem `pecurka_highscore`
- Top 3 rezultata za tekući dan (datum se proverava — reset sledećeg dana)
- Format:
```json
{
  "date": "2026-06-02",
  "scores": [
    { "score": 4200, "level": 10, "combo": 8 },
    { "score": 3150, "level": 8, "combo": 5 },
    { "score": 2800, "level": 7, "combo": 3 }
  ]
}
```

### Prikazivanje

- Na **početnom ekranu**: "Tvoj današnji rekord: 4200" (prvi iz liste)
- Na **game over ekranu**: cela top 3 lista

---

## 6. Tutorial Overlay (Nivo 1)

**Uz premortem korekciju #1:**

Pre prvog poteza na nivou 1, prikazuje se overlay:
- Tamni poluprozirni sloj preko celog ekrana
- Strelica pokazuje na zeleni prozor na timing bar-u
- Tekst: *"Klikni kad si u zelenoj zoni — to je tvoj sterilni prozor."*
- "Skip" dugme u uglu (nestaje automatski posle 3 sekunde)
- Prikazuje se samo prvi put (localStorage flag `tutorialSeen`)

---

## 7. Game Over Ekran

Prikazuje se po gubitku sva 3 života.

**Elementi:**
- Naslov: "Kontaminacija!" (crveno-narandžasti pixel art tekst)
- **Total Score** (krupan, centriran)
- **Best Combo** (streak koji je dostignut)
- **Nivo na kom je igra završena**
- **Guncati Edukativno Fakta** (1 od 4, random rotacija):
  1. *"Micelij je mozak pečurke. Inokulacijom ubacuješ tu 'misao' u supstrat."*
  2. *"Kontaminacija se dešava u mikro-sekundama. Sterilnost nije hobij, to je zanat."*
  3. *"Pleurotus raste za 10–14 dana od inokulacije. Ove pečurke su za ~ 12. jul."*
  4. *"Na Guncati imanju, Alatko priprema prvu inokulacionu radionicu jesen 2026."*
- **Link:** "Nauči više → guncati.rs" (placeholder do launch-a sajta)
- **"Igraj ponovo"** dugme (resetuje state, vraća na nivo 1)
- **Top 3 highscore** za danas

---

## 8. Level Clear Ekran

**Uz premortem korekciju #2:**

Kratki overlay između nivoa (2–3 sekunde, skip dugme):
- "Nivo X — Čisto!" poruka
- Score za ovaj nivo
- **Guncati Mikro-fakt** (jedna kratka rečenica, rotira kroz 4 fakta — drugačiji od game over rotacije)
- Animacija micelija koji se širi iz vreće u pozadini

---

## 9. Vizuelni Opis (za Pera Piksel)

### Paleta

| Uloga | Hex | Opis |
|-------|-----|------|
| Pozadina | `#1a3a2a` | Tamno zelena, laboratorijski zid |
| Success / prozor | `#7bc67a` | Svetlo zelena — OK zona |
| Kontaminacija | `#c0392b` | Crvena — greška, plesni |
| Zlatni bonus | `#f1c40f` | Zlatna — 2× score prozor |
| Fake-out zona | `#7f8c8d` | Siva — ne klikaj |
| Oprema / krem | `#f5f0e8` | Bela/krem — vreće, sto alat |
| Drvo stola | `#8b5e3c` | Topla smeđa |
| HUD tekst | `#ffffff` | Bela |
| Akcenat / streak | `#e67e22` | Narandžasta — streak counter |

### Elementi Scene

- **Sto:** pixel art, drvene daske (tamna smeđa), rustikalno-laboratorijski miks
- **Vreća supstrata:** bela polietilenska vreća ili staklena tegla (menja se po nivou radi vizuelne raznolikosti)
- **Inokulacioni sprej:** metalni cilindar sa iglom, leži sa strane stola; animira se (klik) pri akciji
- **Timing bar:** horizontalna traka, 80% širine ekrana, debljina ~20px, crna/tamna pozadina, zeleni pas koji klizi
- **Pečurke u pozadini:** Pleurotus siluete (pixel art), blago providne, kao wallpaper dekoracija
- **Guncati logo:** diskretno u donjem desnom uglu, ~10% vidljivosti (ne ometa gameplay)

### Animacije

- **Micelij rast (success):** beli pikselni talasi šire se iz vreće (radijalno, 0.5s)
- **Kontaminacija (fail):** zeleno-narandžasta mrlja raste iz vreće, vibrira (0.4s), screen shake (2px, 0.3s)
- **Level clear:** vreća pulse-uje (scale up/down, 0.3s), kratki confetti pikselčići

---

## 10. Audio (za Ceca Čujka)

Svi zvukovi generisani kroz **Web Audio API** (bez .wav/.mp3 fajlova).

| Event | Tip | Opis |
|-------|-----|------|
| Ambient | OscillatorNode (sine, 80Hz) | Tih laboratorijski hum — uvek u pozadini, gain ~0.05 |
| Tick (window pomera se) | OscillatorNode (square, 440Hz), kratki impulsi | Metronomski klik; interval se smanjuje sa nivoom (tempo raste) |
| Success hit | OscillatorNode (triangle, 880Hz → 1100Hz, 0.15s) + FilterNode (fizzy noise) | Čist "ding" + kratki šuštajući bubbly zvuk |
| Fail hit | OscillatorNode (sawtooth, 200Hz → 100Hz, 0.3s) + GainNode ramp-down | Buzzer + prigušeni "splat" |
| Golden hit | Success hit + extra harmonik (1320Hz overlay) | Isti ding ali sjajniji |
| Streak aktivacija | OscillatorNode (major chord, 0.2s) | Kratki chord pri dostizanju streak ×1.5 |
| Level clear | 3 note uzlazno (C5 → E5 → G5, po 0.1s svaka) | Mini fanfare |
| Game over | 3 note silazno (G4 → E4 → C4, po 0.15s svaka) | Kratki pad |

---

## 11. Moduli (za manifest.json)

Ukupno: **18 modula** (src + styles).

| Modul | Odgovornost |
|-------|-------------|
| `src/main.js` | Bootstrap, game loop (requestAnimationFrame), wire svih modula |
| `src/config.js` | Sve konstante: 10-nivo tabela (window duration, speed, score), palette hex, breakpoints |
| `src/state.js` | Game state shape (nivo, score, životi, streak, combo, highscore), save/load localStorage |
| `src/input.js` | Click + touch handlers, action dispatch prema collision sistemu |
| `src/timing.js` | Window mehanika: oscilacija (sinusoid/linear), speed scaling, smjer promene, treper logika |
| `src/render.js` | Canvas draw: sto, vreće, timing bar, window pass, background decorations, overlay |
| `src/entities/bag.js` | Vreća/tegla entitet: pozicija, status (clean/inoculated/contaminated), animacioni state |
| `src/entities/window.js` | Timing window entitet: trenutna pozicija, brzina, tip (zeleni/zlatni/fake), blink state |
| `src/systems/progression.js` | Nivo logika: unlock, prelaz na sledeći nivo, perfect bonus kalkulacija, seed za nivo 7–8 |
| `src/systems/collision.js` | Provera da li je klik unutar zelenog prozora (1D range check na timing bar-u) |
| `src/ui.js` | HUD (score, životi, nivo, streak counter), menji (start screen, game over, level clear, tutorial overlay) |
| `src/audio.js` | Web Audio API: svi SFX i ambient loop (OscillatorNode, GainNode, BiquadFilterNode) |
| `src/content/facts.js` | 4 Guncati edukativna fakta za rotaciju (game over + level clear) |
| `src/share.js` | Copy score to clipboard + Web Share API (navigator.share fallback na clipboard) |
| `styles/base.css` | Layout: full-screen canvas, body reset, font-face |
| `styles/ui.css` | HUD elementi, dugmad, overlay menji, tooltip stilovi |
| `styles/game.css` | Animacije: plesni rast, micelij širenje, screen shake (CSS keyframes za DOM overlay efekte) |
| `styles/theme.css` | Guncati paleta (CSS custom properties: `--guncati-dark`, `--guncati-green`, itd.) |

---

## 12. State Shape

```js
// src/state.js — inicijalni state
{
  screen: 'start',          // 'start' | 'playing' | 'levelclear' | 'gameover'
  level: 1,                 // 1–10
  score: 0,
  lives: 3,
  streak: 0,
  bestCombo: 0,
  levelScore: 0,            // score za tekući nivo
  bags: [],                 // niz bag entiteta za tekući nivo
  activeWindowIndex: 0,     // koji bag je trenutno aktivan
  inoculationsDone: 0,      // koliko inokulacija urađeno u tekućem bag-u
  highscore: [],            // top 3 iz localStorage
  tutorialSeen: false,      // localStorage flag
  firstRunDone: false,      // localStorage flag (seeded nivo 7–8)
  factIndex: 0,             // trenutni indeks fakta (rotacija)
}
```

---

## 13. Progression Flow

```
Start Screen
    ↓ (klik "Igraj")
Tutorial Overlay (samo prvi put, Nivo 1)
    ↓ (skip ili 3s)
[LOOP] Nivo N
    ├── Prikaz vreće(a) i timing bar-a
    ├── Igrač klikće → collision check
    │       ├── Hit → score, micelij anim, streak++
    │       └── Miss → kontaminacija anim, lives--, streak=0
    ├── Sve vreće inokulisane → Level Clear Ekran (2s, Guncati fakt)
    │       └── N < 10 → sledeći nivo (N++)
    │       └── N = 10 → Game Over (pobeda verzija)
    └── Lives = 0 → Game Over Ekran
            ├── Score, combo, nivo
            ├── Guncati edukativni fakt (random)
            ├── Top 3 highscore
            ├── "guncati.rs" link
            └── "Igraj ponovo" → reset state → Start Screen
```

---

## 14. Balance Napomene

- **Nivo 1 window (800ms)** je namerno veliki — igrač mora osjetiti "aha, mogu ovo" u prvom potezu
- **Nivo 5 zlatni window** je kratak (200ms) ali vizuelno jasno označen (blink + goldeni boje) — nagrada za pažnju, ne kazna za propust
- **Nivo 7 (2 vreće):** oba timing bar-a prikazana vertikalno jedan ispod drugog; igrač klikće odozgo prema dole (redosled je fiksiran, nije random)
- **Nivo 9 (3 vreće, random redosled):** vizuelna strelica ukazuje koja je vreća trenutno aktivna — igrač ne mora da pogađa
- **Maksimalni skor (sve perfekte, sve złate):** ~18.000 poena — dovoljno za diferencijaciju bez inflacije

---

## 15. Edge Cases

| Situacija | Rešenje |
|-----------|---------|
| Igrač klikće pre nego što timing bar postane aktivan | Klik se ignoriše (dead zone tokom tranzicije) |
| Zlatni window i fake-out zone na istom nivou (Nivo 8) | Zlatni uvek dolazi POSLE fake — razdvojeni su fiksnim delayom (500ms) |
| Dvostruki klik/tap brzi (accidental) | Debounce 150ms na input handleru |
| Ekran bez zvuka (mobilni mute) | Ambient i SFX ne blokiraju gameplay; vizuelni feedback dovoljan |
| localStorage nedostupan (privatni browser mode) | Graceful fallback — highscore se ne čuva, igra radi normalno |
