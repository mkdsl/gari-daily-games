# Tiha Avala — Game Concept
**Žanr:** Balance Puzzle / Acoustic Simulator
**Datum:** 2026-05-12
**Autor:** Iskra Ivanović (concept), Sine Scenario (naratni okvir)
**Brand serves:** Kluboslavija (Avala 20.jun — primarno), MKDSLend (sekundarno)

## Premisa (Naratni Okvir)
Ti si audio inžinjer Kluboslavija turneje. Svake noći, sedmicama pre Avale, testirate zvučne sisteme na terenu. Zadatak je jednostavan: muzika mora BITI GLASNA ali komšije ne smeju zvati inspekciju. Problem je: Avala ima kompleksan teren — šume, doline, brda, asfalt. Zvuk se ponaša drugačije svake noći.

Pronađi "slatku tačku" pre 20. juna. Avala čeka.

## Core Gameplay Loop

1. **Setup faza** — Vidiš top-down piksel art mapu terena (Avala okolina)
   - Prikazano: bina (izvor zvuka), kuće komšija, teren (šuma/dolina/brdo/asfalt)
2. **Podešavanje (3 slidera):**
   - **Master SPL (dB)** — ukupna jačina zvuka sa bine (80–130 dB range)
   - **Bass Ratio (%)** — odnos basa prema trebleu (0–100%)
   - **Speaker Angle (°)** — pravac fokusiranja zvuka (-60° do +60°, utiče na coverage)
3. **Simulacija** — Klikneš "TESTIRAJ" → zvučni talasi se animiraju po mapi; merači se ažuriraju u realnom vremenu dok simulacija teče
4. **Dva merača:**
   - 🎉 **Dance Floor Srećnost (%)** — mora biti > 70% da bi nivo prošao
   - 📵 **Komšija SPL (dB)** — mora biti < 70 dB (zakonski limit u RS)
5. **Outcome:**
   - Oba uslova ispunjena 10s → **LEVEL CLEAR** + time bonus score
   - Komšija > 70 dB → inspekcija dolazi → FAIL
   - Publika < 50% za 5s → publika odlazi → FAIL

## 6 Nivoa (Progresija)

| Nivo | Naziv | Teren | Komšije | Twist |
|------|-------|-------|---------|-------|
| 1 | Livada | Otvoreno | 1 kuća | Tutorial — nema prepreka |
| 2 | Borova Šuma | Šuma između | 1 kuća | Šuma apsorbuje — podesi jače |
| 3 | Avala Dolina | Dolina | 2 kuće | Dolina fokusira zvuk — opasno |
| 4 | Zidovi Sela | Asfalt + beton | 2 kuće | Refleksija podiže SPL |
| 5 | Vetrovita Noć | Mix | 2 kuće | Sinus wind ±4 dB, vidljiv indikator |
| 6 | Generalna Proba | Sve kombinirano | 3 kuće | Dual speaker arrays, boss nivo |

## Fizika (Simplifikovana, gameplay-kalibrisana)

```
dB_at_point = source_dB - 20*log10(distance) + terrain_mod + angle_attenuation + wind_mod
```

Terrain modifiers (gameplay, ne realni):
- Otvoreno: 0 dB
- Šuma: -10 dB
- Dolina: +7 dB
- Asfalt/beton: +4 dB
- Brdo (senka): -18 dB

Dance Floor srećnost:
```
Hs = clamp((spl - min_spl) / spl_range * coverage_factor + bass_mod + level_mod, 0, 1)
```

## Vizualni Identitet (Pera Piksel brief)

- Pixel art, top-down perspektiva, noćna/sumračna atmosfera
- Paleta: tamno zelena (šuma), tamno plava (nebo), warm amber (bina), crvena (komšija alarm)
- Zvučni talas: koncentrični krugovi koji se šire od bine, fade po rubovima
- Kuće komšija: svetlo u prozoru zeleno/crveno po SPL nivou
- Speaker cone: vizualni prikaz Speaker Angle na mapi (konusni crteć)
- HUD: dva merača (srećnost zelen bar, SPL komšije crven bar)

## Audio (Ceca Čujka brief)

- Festival ambient: generisani bass beat (~120 BPM, Web Audio API, proceduralan)
- Crowd: cheering/booing interpoliran sa srećnošću
- Slider tick: subtle klik na svakom input eventu
- Warning: alarm pre 70 dB (na 67 dB — early warning)
- Inspekcija: sirena + zvono (fail)
- Level clear: kratak "ding" + festival cheer burst

## Share Hook

- Level clear ekran: vreme rešavanja + SPL margin bonus
- "39 dana do Avale — testirao/la si zvučni sistem!"
- Share dugme sa rezultatom

## Zašto Hrani Kluboslavija Avala

1. Goodwill: prikazuje da Kluboslavija razmišlja o zajednici
2. Edukacija: publika shvata da je sound design kompleksan
3. Timski PR: pozicionira sound tim (Tonket, Sava) kao stručnjake
4. Share trigger: frustracija nivo 5/6 → viralni potencijal
5. Countdown content: "39 dana do Avale"

## Target Sesija

20–30 minuta za sve nivoe. Replay za time challenge. Mobile-first (touch sliders).

## Brand Serves

- Kluboslavija (primary — Avala 20.jun)
- MKDSLend (secondary — tim ekspertiza)
