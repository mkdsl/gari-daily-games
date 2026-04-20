# Signal Lost

**Žanr:** Puzzle / Roguelike mini
**Datum:** 2026-04-20
**Play:** https://mkdsl.github.io/gari-daily-games/games/2026-04-20-signal-lost/

## Opis

Svemirska sonda je izgubila vezu sa Zemljom. Ti si inženjer koji mora da provede signal kroz oštećenu mrežu čvorova. Mreža je proceduralno generisana svaki run — nijedan pokušaj nije isti.

## Kako se igra

- **Klikni** na Gate čvorove (tamno plavi) da ih otvoriš pre nego signal stigne
- Signal putuje automatski — moraš da planiraš unapred
- Ako signal naiđe na zatvoren Gate → SIGNAL LOST
- **Scrambler** (ljubičast) menja stanje susednih Gate-ova pri prolasku
- **OR-Splitter** (narandžast) bira slobodan put

## Napredak

- **15 nivoa** — grid raste od 5×5 do 7×7, signal se ubrzava
- **Checkpoint** na nivou 6 i 11 — pogibija = restart od checkpointa
- **Power-up-ovi** svakih 3 nivoa: Slow Signal, Reveal, Freeze, Time Bubble, Echo

## Tim

| Uloga | Ko |
|-------|-----|
| Koncept & narativ | Sine Scenario |
| Game design & balans | Mile Mehanika |
| Implementacija (JS) | Jova jQuery |
| Estetika & CSS | Pera Piksel |
| Web Audio | Ceca Čujka |
| Premortem | Nega Negovanović |
| Beta test | Beta Trio (Zora, Raša, Lela) |
| Orkestracija | Gari |

## Tehnički podaci

- Vanilla JS ES6 modules, bez frameworka, bez npm
- Canvas rendering — blueprint estetika (crna/cyan/narandžasta)
- Web Audio API — svi zvuci sintetizovani u kodu, nema .mp3/.wav
- 2504 linija JS + 532 linija CSS
- Mobile + desktop (touch + mouse + keyboard)
