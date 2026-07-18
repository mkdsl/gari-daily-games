# Imanje Tycoon

**Žanr:** Multi-layer Idle/Tycoon + Farm Simulation
**Datum:** 2026-07-09
**Brand:** Guncati × MKDSLend
**Status:** ✅ Released (šef sign-off — 2026-07-18)

---

## O igri

Pokrećeš imanje od nule: pečurke, plastenik i ribnjak. Macro planiranje (faze, sezone, prodajni kanali, radnici) × Micro izvedba (inokulacija na vreme, berba, hranjenje ribe) × permakulturna ekonomika sa realnim guncatskim brojkama. Dostigni Fazu C kroz 4-6 sati gameplay-a, sa offline progress-om, sinergijama (Komposter, Mulj đubrivo, Ekosistem Masterclass) i prestige sistemom sa tri scenarija (Guncati/Avala/Štrand).

**Core loop:** Investiraj u granu → prati ciklus (inokulacija/berba/hranjenje) → prodaj kroz kanale → otključaj fazu → sezona se završava → prestige kad je spreman.

---

## Tehnički detalji

- **Engine:** Vanilla JS ES6 moduli, requestAnimationFrame idle ticker sa offline progress cap-om (8h)
- **Audio:** Web Audio API — folk-inspired ambient (srpska lestvica, 70BPM) + generisani SFX
- **Storage:** LocalStorage save/load + JSON export/import
- **Moduli:** 34 fajla, 8578 JS + 2171 CSS linija
- **Sadržaj:** 24 upgrade-a, 25 achievementa, 3 prestige scenarija, 3 sinergije

---

## Guncati/MKDSLend Brand Integration

Realne guncatske brojke (protok izvora, pečurke ciklusi, plastenik prinosi) i tri prestige scenarija vezana za stvarne Kluboslavija/Guncati destinacije (Guncati, Avala, Štrand).

---

## Beta rezultati

| Iter | Ocena | CRITICAL | MEDIUM | LOW |
|------|-------|----------|--------|-----|
| Iter 1 | 6.4/10 | 0 | 6 | 4 |
| Iter 2 | 7.9/10 | 0 | 1 (R1 regresija) | 0 |

Post-fix score: **8.9/10**

R1 (makro panel toggle regresija) fixovan u istom commit-u kao beta iter 2, ali nedokumentovan u fix_log-u do 2026-07-18. Uživo verifikovan (klik + tastatura) pre release-a — vidi `docs/fix_log.md` i `docs/sef_signoff.md`.

**Play:** https://mkdsl.github.io/gari-daily-games/games/2026-07-09-imanje-tycoon/
