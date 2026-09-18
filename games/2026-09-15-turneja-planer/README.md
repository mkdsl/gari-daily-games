# Turneja Planer

**Žanr:** Strategy / Route Optimizer  
**Datum:** 2026-09-15  
**Brands:** Kluboslavija · MKDSLend · Guncati  
**Play:** [Pokreni igru](https://mkdsl.github.io/gari-daily-games/games/2026-09-15-turneja-planer/)

---

## O igri

Organizuješ DJ turneju kroz 5 gradova Balkana. Biraš redosled (4 permutacije + Guncati grand finale uvek na kraju), sakupljaš crew od 10 dostupnih članova (min 2, max 5, DJ skill obavezan), raspoređuješ budžet između transporta/promo/techa, i donosiš odluke kroz 4 karte po gradu.

Guncati je reputacioni gate — ispod 6.0 rep, ulaz odbijen pre nego što potroširte pare.

**Dužina sesije:** 15–25 minuta po runu. Prestige loop otvara ponovo kad dobiješ jedan od 4 završetka.

## Gameplay Loop

```
Ruta (biraš redosled 4 grada + Guncati) →
  Crew select (2–5, DJ obavezan) →
    Budget split (transport / promo / tech) →
      4 decision karte →
        City Results (attendance, CQ, revenue) →
          Transit (mood decay) →
            Ponovi × 4 → Guncati gate check → Ending
```

## Resursi

| Resurs | Opis |
|--------|------|
| **Budget (€)** | Starta na €3500. Revenue = crowd × €8 × promo_mult po gradu. |
| **Crew Mood** | 0–100, pada po transitu, utiče na CQ formulu. |
| **Reputacija** | 0–10, Guncati gate ≥ 6.0, TURNEJA_LEGENDA zahteva ≥ 7.0. |
| **Reach** | 0–50k, viral threshold na 35+ reach. |

## Završeci

| Ending ID | Uslov |
|-----------|-------|
| `TURNEJA_LEGENDA` | budget > 2000 + rep ≥ 7.0 |
| `ZAVRSENO_SLAVNO` | rep ≥ 6.0 (ali ne LEGENDA) |
| `ZAVRSENO` | 500 < budget ≤ 2000 |
| `POREZ_I_DUG` | budget ≤ 0 |
| `GUNCATI_ZATVOREN` | rep < 6.0 pri dolasku na Guncati |

## Prestige

Nakon završetka, Fan DB akumulira fans iz svih gradova. Prestige level daje `promo_eff_bonus` koji boostuje sve buduće promo efikasnosti. Reset ne briše Fan DB — grade se kroz runove.

## Tehnika

- ES6 moduli (34 fajlova, ~3700 JS linija, ~1036 CSS linija)
- DOM rendering (bez Canvasa)
- Web Audio API — border crossing, crowd cheer, win/fail SFX
- localStorage save/load
- 40 decision karata (L/CR/CE/F/R kategorije)

## Beta Journey

| Iteracija | Score | Ključni nalaz |
|-----------|-------|---------------|
| Iter 1 | 5.0/10 | 2 CRITICAL: revenue nikad dodan, travel cost nikad oduzet |
| Iter 2 | 7.8/10 | Svi CRITICAL+MEDIUM fiksovani; slider cap bug nađen |
| Iter 3 | 8.5/10 | Slider fix potvrđen, 0 CRITICAL — auto-release |
