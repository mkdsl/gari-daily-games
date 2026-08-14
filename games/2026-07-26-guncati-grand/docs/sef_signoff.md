# Šef Sign-off — Guncati Grand
**Datum kreiranja:** 2026-07-28
**Status:** Čeka šef sign-off

---

## Zašto nije auto-released

Auto-release gate (KORAK 6.75) zahteva `beta_score_iter2 >= 8.0` I `0 CRITICAL u oba beta_report.md`.

- `beta_score_iter2 = 8.5 ≥ 8.0` ✅
- beta_report_2.md ima 1 CRITICAL (CRITICAL #3 — gcBalance) ❌

CRITICAL #3 je **pronađen i popravljen** u post-iter-2 fix rundi, ali pošto postoji u izveštaju, gate je formalno blokiran. Igra je funkcionalna posle fixa.

---

## Rezime beta testiranja

| | Iter 1 | Iter 2 (post-fix) |
|--|---|---|
| **Score** | 7.0/10 | **8.5/10** |
| **CRITICAL** | 2 (oba fiksovani) | 1 (fiksovan post-iter) |
| **MEDIUM** | 1 (fiksovan) | 1 (fiksovan post-iter) |

### Svi CRITICAL bugovi i status
- CRITICAL #1: `require()` u btn-new handler → **FIKSOVAN** (navigateTo umesto require)
- CRITICAL #2: `require()` u startNewGame() → **FIKSOVAN** (navigateTo('MENU'))
- CRITICAL #3: gcBalance nikad ne raste između nedelja → **FIKSOVAN** (WEEKLY_BUDGET + weekRevenue u advanceWeek)

---

## Igra u brojkama

| | Vrednost |
|--|--|
| **JS modula** | 32 |
| **JS LOC** | 6307 |
| **CSS LOC** | 1455 |
| **Ukupno LOC** | 7914 |
| **Brand** | guncati, kluboslavija, mkdslend |
| **Žanr** | Multi-layer Festival/Venue Management Sim |

---

## Šta igra radi

10 nedelja pripreme festival terena (Guncati Grand Finale). Svake nedelje:
- **Macro:** Alociraj 500 GC + prihod u 4 kategorije (gradnja/hrana/marketing/zajednica)
- **Micro:** Rasporedi volontere (7 tipova) na zadatke — Tom Sawyer mehanika: WB > 60% = besplatan rad
- **Napredak:** 5 zgrada × 3 nivoa, 7 volontera koji se otključavaju, reputation tracking

Grand Finale (nedelja 11): real-time 15-min sim — DJ Hype, Crowd Mood, 10 random eventi.
Prestige: "Stara Šaraga" mode — reset sa reputation carry-over.

---

## Play URL

**https://mkdsl.github.io/gari-daily-games/games/2026-07-26-guncati-grand/**

*(GitHub Pages deploy ~1 min od push-a)*

---

## Šef sign-off

- [ ] OK za release — pusti igru (`status: "released"`)
- [ ] Veto — ne puštaj
- [ ] Veto + feedback: _______________

*Čekiraj `[x]` i pushni, ili reci Gariju šta treba.*
