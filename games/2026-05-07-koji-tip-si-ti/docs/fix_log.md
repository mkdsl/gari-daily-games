# Fix Log — Koji Tip Si Ti u MKDSLendu?

## Bug 1 — CRITICAL: Progress bar off-by-one

`renderQuestion` u `src/ui.js` računao je progress kao `qIndex / total`, što daje 0% na prvom pitanju (index 0) i nikad ne dostiže 100% (poslednji index je `total - 1`).

**Promenjeno:** `Math.round((qIndex / total) * 100)` → `Math.round(((qIndex + 1) / total) * 100)`

Progress bar sada ispravno prikazuje 12.5% na prvom pitanju i 100% na poslednjem.

## Bug 2 — CRITICAL: Dead CTA linkovi

Svih 6 arhetipova u `src/config.js` imalo je `cta.url` vrednosti koje ukazuju na `https://mkdsl.games/` — domen koji ne postoji. Isto važi za `shareText` polja koja su koristila `https://mkdsl.games/koji-tip-si-ti`.

**Promenjeno — novi cta.text i cta.url po arhetip-u:**

| Arhetip | cta.text | cta.url |
|---------|----------|---------|
| DJ | `→ Igraj Avala Run` | `https://mkdsl.github.io/gari-daily-games/games/2026-05-06-avala-run/` |
| PK | `→ Istraži GDG` | `https://mkdsl.github.io/gari-daily-games/` |
| SG | `→ Igraj Frekventni Grad` | `https://mkdsl.github.io/gari-daily-games/games/2026-04-27-frekventni-grad/` |
| EH | `→ Istraži GDG` | `https://mkdsl.github.io/gari-daily-games/` |
| CB | `→ Istraži GDG` | `https://mkdsl.github.io/gari-daily-games/` |
| SE | `→ Igraj Signal Lost` | `https://mkdsl.github.io/gari-daily-games/games/2026-04-20-signal-lost/` |

**Promenjeno — shareText URL** u svim 6 arhetipova: `https://mkdsl.games/koji-tip-si-ti` → `https://mkdsl.github.io/gari-daily-games/games/2026-05-07-koji-tip-si-ti/`

## Bug 3 — MEDIUM: overflow:hidden iOS Safari scroll bug

U `styles/base.css`, `overflow: hidden` bio je postavljen na oba `html` i `body` selektora unutar jednog bloka. Na iOS Safari, `overflow: hidden` na `html` elementu blokira scroll unutar `position: fixed` elemenata (`.screen`), što skriva donji deo result card-a na manjim ekranima.

**Promenjeno:** Razdvojen zajednički `html, body { overflow: hidden; }` blok u dva odvojena pravila. `overflow: hidden` zadržan samo na `body`, uklonjen sa `html`. Ovo popravlja iOS Safari ponašanje jer browser poštuje scroll unutar fixed elementa kada `html` nema `overflow: hidden`.
