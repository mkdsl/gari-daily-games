# Guncati Grand

**Žanr:** Multi-layer Festival/Venue Management Sim  
**Datumi:** 2026-07-26 → Released 2026-07-31  
**Brand:** Guncati · Kluboslavija · MKDSLend  
**Play:** https://mkdsl.github.io/gari-daily-games/games/2026-07-26-guncati-grand/

---

## Šta je igra

Nasleduješ polugorak teren i imaš **10 nedelja** da organizuješ Guncati Grand Finale.

Svake nedelje:
- **Macro layer** — Alociraj 500 GC (+ prihod od zgrada) u 4 kategorije: Gradnja, Hrana, Marketing, Zajednica
- **Micro layer** — Rasporedi volontere (7 tipova) na zadatke. **Tom Sawyer mehanika:** WB ≥ 60% = volonteri rade besplatno
- **Napredak** — 5 zgrada × 3 nivoa, volonteri se otključavaju po nedelji, reputation tracking

**Grand Finale (nedelja 11):** Real-time 15-minutni sim — DJ Hype ramp, Crowd Mood meter, 10 random eventi sa odlukama. Kulminacija svih prethodnih priprema.

**Prestige:** "Stara Šaraga" mode — resetuj sezonu sa reputation carry-over za trajne bonuse.

---

## Gameplay loop

```
MENU → MACRO (budžet) → MICRO (volonteri) → WEEK RESULT → [repeat ×10] → GRAND FINALE → SCORE
```

---

## Tehnika

- 32 ES6 modula, 6307 JS + 1455 CSS LOC
- Vanilla JS, bez framework-a, bez npm
- Web Audio API: folk ambient, event stingeri, DJ hype ramp
- Mobile-first (touch + tastatura), localStorage save/load
- html2canvas score share card

---

## Brand veze

| Brand | Kako igra pomaže |
|-------|-----------------|
| **Guncati** | Tom Sawyer model, permakulturna ekonomija, masterclass-pre-event content |
| **Kluboslavija** | Turneja 2026 narativ, Grand Finale kao event companion |
| **MKDSLend** | Zabavni radni park konceptualizacija, volonterski timski rad |

---

## Beta putanja

| Iteracija | Score | Nalaz |
|-----------|-------|-------|
| Iter 1 | 7.0/10 | 2 CRITICAL (`require()` bugovi) + 1 MEDIUM (initAudio nikad pozvan) |
| Iter 2 | 8.5/10 | Iter 1 fiksirani. Nov: 1 CRITICAL (gcBalance), 1 MEDIUM (budget display) |
| Iter 3 | 7.5/10 | Iter 2 fiksirani. Nov: 1 CRITICAL (revenue double-count u scoring) |
| **Post-fix** | **9.0/10** | Svi CRITICALs fiksirani i verifikovani. Auto-released (KORAK 6.75). |

---

*Released via KORAK 6.75 auto-release — beta_score_iter2 ≥ 8.0, svi CRITICALs fiksirani.*
