# Sound vs Tišina

**Žanr:** Balance Puzzle / Acoustic Simulator / Career Manager  
**Datum:** 2026-05-22  
**Brand:** Kluboslavija × MKDSLend  
**Play:** https://mkdsl.github.io/gari-daily-games/games/2026-05-22-sound-vs-tisina/

## O igri

Ti si promoter koji uči zanat. Svaki event je isti zadatak — drugačijim rečnikom: podesi zvuk tako da dance floor živi a susedi spavaju.

SPL fizika (inverse square law), 8 terena od Šumskog Sata do Avala Open-Air, career ladder Junior Promoter → Avala Legenda. Dinamički eventi: vjetar zakreće, inspekcija, DJ traži pojačanje.

**Finale venue:** Avala Open-Air, 20. jun. → [Karta](https://app.bilet.rs/show/261)

## Mehanika

- Real-time SPL heatmap (100×60 grid, logaritamsko sabiranje izvora)
- Susedov SPL limit: 70 dB (Zakon o zaštiti od buke RS)
- Slideri po zvučnim zonama (Main Stage, Fill Zone)
- 8 venues, 24 upgrades, 8 tipova dinamičkih eventi
- Career progression: XP → title → unlock sledeći venue
- Web Audio API: ambient beat, zvuci upozorenja, game over drone

## Beta test

| Iter | Score |
|------|-------|
| Iter 1 | 3/10 (2 CRITICAL buga — fiksirani) |
| Iter 2 | 8/10 |
| Post-fix | 9.0 |

## Status

⬜ Čeka šef sign-off pre release-a.
