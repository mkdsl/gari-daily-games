# Rovovi i Ruševine

**Žanr:** Strategy mini — turn-based grid  
**Datum:** 2026-04-26  
**Status:** ✅ Released  
**Ocena:** B (beta score 6/10)

## Opis

Godina 1917. Zapadni front. Komanduj odredom od 3 vojnika kroz 3 linije neprijateljskih rovova. Svaki potez je odluka — pucaj, kreći se, juriš ili postavi dimnu zavesu. AI neprijatelj reaguje na tvoj pritisak. Imas 20 poteza.

## Kako se igra

1. **Klikni vojnika** da ga selektuješ (zeleni border)
2. **Izaberi akciju** u toolbar-u: POMERI / PUCAJ / JURIŠ / DIM
3. **Klikni target** — ćeliju za kretanje ili neprijatelja za napad
4. **POTEZ ▶** — sve akcije se izvršavaju simultano, neprijatelj odgovara
5. Probiješ sve 3 linije rovova → pobeda, ocena S/A/B/C po efikasnosti

## Mehanika

| Akcija | Cena | Efekat |
|--------|------|--------|
| Pomeri | 0 metaka | Do 2 ćelije (Manhattan) |
| Pucaj | 2 metka | Šteta 1, range 1-2 |
| Juriš | 0 (gubi 1 HP) | Melee šteta 1 |
| Dim | 3 metka | Stun neprijatelja u 2×2 zoni, 2 poteza |

## Neprijatelji

- **Pešak** — brz, klasičan napad
- **Mitraljezac** — range 3, ne pomera se, puca 2×
- **Oficir** — ubiti za slabljenje linije
- **Artiljerac** — area napad svaki 3. potez

## Tim

- **Sine Scenario** — koncept i narativ
- **Mile Mehanika** — game design i balans
- **Gari** — implementacija, beta test, release

[▶ Igraj](https://mkdsl.github.io/gari-daily-games/games/2026-04-26-rovovi-i-rusevine/)
