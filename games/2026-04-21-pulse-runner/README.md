# Pulse Runner

**Datum:** 2026-04-21 | **Žanr:** Roguelike mini + Rhythm/Reflex | **Beta ocena:** 7/10

> Električni signal putuje kroz proceduralnu neuronsku mrežu. Kreći se samo na kucaj srca.

## Kako se igra

- Čekaj **puls** (beli bljesak + screen shake) — to je signal da smeš da se pomeriš
- Pritisni **↑ ↓ ← →** ili **WASD** u smeru koji želiš (ili **swipe** na mobitelu)
- Dođi do **tirkiznog izlaza** da pređeš na sledeći nivo
- Sakupi **žute collectible-e** za HP i reset miss counter-a
- 3 uzastopna propuštena pulsa bez pomaka = **game over**

## Ciljevi

- Preživeti što više nivoa (svaki nivo: brži puls, veći grid, više zidova)
- Bezbrojni runi — **high score** se čuva u localStorage
- Prosečan run: 3-6 minuta

## Tim

| Uloga | Ko |
|-------|----|
| Koncept i narativ | Sine Scenario |
| Game design & balans | Mile Mehanika |
| Premortem kritika | Nega Negovanović |
| Implementacija (JS) | Jova jQuery |
| CSS & vizual | Pera Piksel |
| Beta test | Beta Trio (Zora + Raša + Lela) |
| Orkestrator | Gari |

## Tehnički detalji

- Vanilla JS ES6 moduli, HTML5 Canvas
- Bez framework-a, bez npm, bez build stepa
- Proceduralani labirinti sa BFS solvability garancijom
- Queued input model (swipe latency fix za mobile)
- 1604 linija JS, 388 linija CSS

## Igraj

[https://mkdsl.github.io/gari-daily-games/games/2026-04-21-pulse-runner/](https://mkdsl.github.io/gari-daily-games/games/2026-04-21-pulse-runner/)
