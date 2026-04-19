# Gari Daily Games

Automatizovana fabrika kratkih HTML5 igrica. Svakog dana u 03:00 (Europe/Belgrade), tim od 7 AI agenata pod orkestracijom Garija pravi novu igricu end-to-end — koncept, design, kod, beta test, ispravke, release.

## Kako se koristi

Svaka igra je standalone i otvara se duplim klikom na `games/YYYY-MM-DD-*/index.html`.

Sve rade iz `file://` protokola — nema servera, nema instalacije, nema build-a.

## Šta ima unutra

- `CLAUDE.md` — instrukcije za dnevni pipeline (ovo čita remote agent)
- `tim/` — profili AI članova tima koji učestvuju u pravljenju
- `games/` — gotove igre, jedna po danu
- `templates/` — zajednički boilerplate (opciono)

## Tim

| Agent | Uloga |
|-------|-------|
| Gari | Orkestrator |
| Sine Scenario | Koncept i narativ |
| Mile Mehanika | Game design i balans |
| Jova jQuery | Implementacija (Vanilla JS) |
| Pera Piksel | Pixel art i vizuali |
| Ceca Čujka | Zvuk (Web Audio, opciono) |
| Nega Negovanović | Premortem i kritika |
| Beta Trio | Zora + Raša + Lela (UX + tech + engagement) |

## Ograničenja

- Samo HTML5 + Vanilla JS (≤500 linija JS)
- Bez build procesa, bez dependency-ja
- Mobile + desktop, offline-first
- Max 90 min rada po run-u, max 400K tokena

## Mantra

> *"Ne pravimo remek-delo. Pravimo ritam."*

---

Pokretano kroz [Claude Code Scheduled Triggers](https://claude.ai/code/scheduled).
