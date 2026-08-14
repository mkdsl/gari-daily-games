# Concept — Guncati Grand

**Naziv igre:** Guncati Grand
**Žanr:** Multi-layer Festival/Venue Management Sim
**Datum koncepta:** 2026-07-26
**Brand serves:** guncati (primary), kluboslavija (secondary), mkdslend (tertiary)

---

## Premisa

Ti si šef. Nasledjuješ polugorak teren — dva jezera, par stabala, i san o Grand Finali.
Rok: 10 nedelja. Uslov: na kraju mora se desiti jedan neverovatan event.
Svaka nedelja = 3 min realnog vremena. 10 nedelja = 30 min. Event dan = 15 min kulminacije.

---

## Core Gameplay Loop

### Macro Layer — Sezona (nedeljni ciklus, 10 sedmica)

**Svake nedelje: alociraš 500 GC (Guncati Coins)**

| Kategorija | Šta gradi | Efekat |
|---|---|---|
| 🏗️ Gradnja | Pozornica, WC, šatre, parking | Crowd capacity, wet-weather protection |
| 🌱 Hrana | Pečurke, povrtnjak, bar | Event-day revenue + Wellbeing bonus za volontere |
| 📢 Marketing | IG story boost, event listing | Ticket sales rate × multiplikator |
| 🤝 Zajednica | Majstorski kamp pozivi | Tom Sawyer mechanic: besplatna radna snaga |

**Tom Sawyer mechanic** (nova mehanika, nije u nijednoj dosadašnjoj GDG igri):
Ne PLATIŠ gradnju — ULOŽIŠ u iskustvo (hrana, muzika, priča). Ako Wellbeing ≥ 60%,
volonteri dolaze i rade. Ispod 60% — odu pre pola posla. Balans između gradnje i zajednice.

### Micro Layer — Vikend Rad (Majstorski Kamp)

Svake nedelje: jedan vikend mini-scenario sa 3–5 volontera.
Svaki volonter ima: Energija / Glad / Vibe (troše se po zadatku + vremenu).
Dodeli zadatak: kopanje, tesanje, kuvanje, fotografisanje.
Pogrešna dodela (introvert kuvanje ne voli) → Vibe pada → zadatak ne pada.
Ispravna dodela → bonus output + Wellbeing bonus za narednu nedelju.
Audio ambient prati Vibe bar: jutro (ptice), rad (čekić, smeh), obrok (gitara).

### Meta Layer — Grand Finala Event (Nedelja 9–10 + Event Dan)

Sve što si gradio sad konvergira:
- **Stage kapacitet** → max crowd bez gužve
- **Hrana production** → koliko dugo bar ne ostaje prazan
- **Marketing score** → 100–500 posetilaca spektar
- **Zajednica score** → koliko volontera ostaje tokom event deja

Event Dan (15 min real-time sim):
- 3 × 45-min DJ slota: ti biraš koji DJ ide kad (balans crowd hype vs. drain)
- Bar resupply: klikni u pravo vreme da popuniš
- Vremenski event (random): oblak / pljusak → krov li si gradio?
- Crowd mood meter konstantno → ako padne ispod 40%, event fail
- Kraj: Final Score = crowd happiness × revenue × community vibe

---

## Hook — Zašto 15+ Minuta

Svake nedelje je realna dilema: **gradim WC ili investiram u marketing?**
Bez WC-a crowd capacity ne raste. Bez marketinga, nema kome da prodaš.
500 GC/nedelja znači žrtvovanje — svaki run je različit jer prioriteti su različiti.

Tom Sawyer mechanic je emocionalni hook: brinuješ o volonterima, ne samo o resursima.
Glad volontera koji ode pre posla boli drugačije od "minus 50 GC". To je priča.

Grand Finala Event nije cutscene — to je 15 minuta napetosti gde sve odluke iz sezone
dolaze po račun. Real-time, ruke na podu.

---

## Vizuelna Estetika

**Paleta:**
- `#1a1208` — tamna zemlja, noć (background)
- `#8B4513` — sirova glina, drvo (primary UI, boje elemenata)
- `#2d5016` — gusta šuma, trava (terrain)
- `#FFD700` — festival svetla, dusk (accent, highlight)
- `#FF6B35` — zalazak sunca, festival toplina (CTA, energija bar)
- `#E8D5B0` — pesak, papirus (text, neutralno)

**Stil:** Pixel art (Pera Piksel). Farma se vizuelno transformiše nedelju po nedelju
— stage se gradi od nule, šatre niču, parking se crta. Noćni event: neon overlay na earth tones.

---

## Audio Mood (Ceca Čujka smernice)

- Jutro/nedeljno planiranje: lagani ambient, ptice, reka
- Majstorski kamp rad: ritmični udarci, pile, distancirani smeh
- Obrok: akustična gitara, tihi razgovor texture
- Event dan noć: deep bass pulse, crowd hum koji raste sa crowd metrom
- Grand Finale kulminacija: bas drop → crowd roar → tiho jutro aftermath

Sve Web Audio API generisano. Nema .mp3 / .wav fajlova.

---

## Win Condition

| Score | Status | Poruka |
|---|---|---|
| ≥ 7.5 / 10 | Legenda Guncatija | Grand Finale će se pričati godinama |
| 5.0 – 7.4 | Lepo, ali | Sledeća sezona je bolja |
| < 5.0 | Teren vraća poruku | Previše žurbe, premalo zajednice |

**Prestige — "Stara Šaraga" Mode:**
Posle prvog wina: počinješ bez para ali sa reputacijom.
Zajednica dolazi bez marketinga. Majstori su iskusniji. Nova ekonomija, novi challenge.
Prestige carry: Reputation Score × 0.1 = GC bonus po nedelji u sledećem runu.

---

## Brand Utility — Konkretno

| Brand | Direktna veza |
|---|---|
| **Guncati** | Igrač uči šta Grand Finale event zahteva: Stage, WC, Hrana, Parking. Igra = interaktivna brošura za posetioce i volontere. "Igrao sam, znam šta me čeka." |
| **Kluboslavija** | DJ booking + lineup timing = direktno iskustvo organizacije 3-DJ-slot eventa. Marketing asset pred Grand Finale. |
| **MKDSLend** | Tom Sawyer mechanic vizualizuje "Zabavni radni park": rad kao iskustvo. Igra JE brand message — ne objašnjava, demonstrira. |

---

## Targetirana Dužina Sesije

- Min sesija: 30 min (sezona bez event dana)
- Standardna: 45 min (sezona + event)
- Prestige run: 60 min (Stara Šaraga)
- Replay hook: budžet alokacija + RNG vremenski eventi + različiti DJ lineup = svaki run je unikatan

---

## Modul Mapa za Implementaciju

| Modul | Opis |
|---|---|
| `src/config.js` | 500 GC/nedelja, 10 nedelja, 4 kategorije, 5 building types, 5 volunteer roles |
| `src/state.js` | Sezona state, tjedni budžet, building levels, volunteer roster, event_day state |
| `src/systems/season.js` | Weekly tick, budget allocation engine, phase detection |
| `src/systems/tomSawyer.js` | Volunteer mechanic: energija/glad/vibe matrix, task assignment AI |
| `src/systems/eventDay.js` | 15-min event sim: crowd flow, DJ queue, bar resupply, weather system |
| `src/economy/buildings.js` | Stage/WC/Parking/Bar/Šatre — unlock, level, effect calculation |
| `src/economy/food.js` | Pečurke + povrtnjak revenue, Wellbeing modifier per tick |
| `src/economy/marketing.js` | Ticket sales rate, crowd size ceiling calc |
| `src/entities/volunteer.js` | Volunteer state machine (energija/glad/vibe/zadatak assignment) |
| `src/entities/dj.js` | DJ entity: booking cost, crowd hype modifier, energy drain, time slot |
| `src/render.js` | Farm canvas: building sprites po levelima, terrain growth progression |
| `src/ui.js` | Weekly budget allocation screen, building panel, volunteer card UI |
| `src/audio.js` | Web Audio: ambient layers + event SFX (ptice → crowd → aftermath) |
| `src/share.js` | Screenshot event score + "Igraj Guncati Grand" share CTA |
| `src/content/aforizmi.js` | Pera Period farm filozofija — tooltip popups tokom Majstorskog kampa |
| `styles/base.css` | Full-screen layout, panel sizing |
| `styles/ui.css` | Weekly budget screen, volunteer cards, building panel |
| `styles/game.css` | Farm canvas animacije, building grow effects, event neon overlay |
| `styles/theme.css` | Guncati paleta (#1a1208 / #8B4513 / #FFD700) |

**Procena scope-a:** 25–35 modula, ~10.000–13.000 LOC. Multi-layer (Sezona + Tom Sawyer + Event Dan). Odgovara CLAUDE.md "Game Dev Tycoon tier" zahtevima.
