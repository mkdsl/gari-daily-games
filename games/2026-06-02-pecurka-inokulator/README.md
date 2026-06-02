# Pečurka Inokulator

**Žanr:** Timing / Precision Arcade  
**Datum:** 2026-06-02  
**Brand:** Guncati — permakultura i pečurkarstvo  
**Status:** ⏳ Čeka šef sign-off

---

## O igri

Ti si inokulant u Guncati laboratoriji. Supstrat je sterilisan, sprej je spreman — ali sterilni prozor se zatvara svakog trenutka. Klikni u pravi momenat ili kontaminacija preuzima sve.

**Core loop:** Gledaj timing bar → klikni dok je zeleni pas aktivan → micelij se širi → nastavi na sledeću vreću.

**10 nivoa** — brzina raste od 800ms window-a (nivo 1) do 220ms (nivo 10). Svaki nivo donosi novu mehaniku: fake zone, blink window, zlatni bonus, simultane vreće.

---

## Gameplay

| Akcija | Rezultat |
|--------|----------|
| Klik u zelenoj zoni | Uspešna inokulacija — score + micelij animacija |
| Klik van zone / u fake zone | Kontaminacija — -1 život + screen shake |
| Zlatni prozor (2× bonus) | Double score za taj hit |
| Streak 3+ | 1.5× multiplier |
| Streak 6+ | 2.0× multiplier |
| Perfect nivo (nula grešaka) | Bonus score + perfect fanfare |

**Kontrole:** Klik (desktop) / Tap (mobile). Touch-first design.

---

## Guncati Brand Integration

Game over ekran rotira 4 edukativna fakta o miceliju i inokulaciji:
- Kako micelij ulazi u supstrat
- Zašto sterilnost nije opcija
- Pleurotus rok rasta (~14 dana)
- Guncati radionice jesen 2026

Link ka `guncati.rs` na svakom game over ekranu. **Lead gen asset** — ko razume igru, spremniji je za pravu radionicu.

---

## Tehnički detalji

- **Engine:** Canvas + DOM overlay, Vanilla JS ES6 moduli
- **Audio:** Web Audio API (bez .wav fajlova)
- **Storage:** LocalStorage — daily highscore top 3, tutorial flag, first-run seed
- **Mobile:** Touch-first, responsive canvas skaliranje
- **Moduli:** 19 fajlova, 2488 JS + ~900 CSS linija

---

## Beta rezultati

| Iter | Ocena | CRITICAL | MEDIUM | LOW |
|------|-------|----------|--------|-----|
| Iter 1 | 6.3/10 | 3 | 5 | 7 |
| Iter 2 | 7.5/10 | 0 | 1 | 2 |

Post-fix score: **9.0/10**

**Play:** https://mkdsl.github.io/gari-daily-games/games/2026-06-02-pecurka-inokulator/
