# Niš Fuga

**Žanr:** Point-and-click Mini Avantura
**Datum:** 2026-06-01
**Brand:** Kluboslavija
**Status:** ✅ Released (auto-release, KORAK 6.75 — 2026-07-18)

---

## O igri

Vodiš Jovanku, tour managera Kluboslavija ekipe, kroz Niš u jutro pred event. Pet autentičnih niških scena — Bulevar, Kiosk, Kafana, Tvrđava, Kapija — dijaloški izbori koji troše i vraćaju resurse (vreme/moral/strpljenje/reputacija), sedam različitih endinga. Cilj: stigni na soundcheck na vreme.

**Core loop:** Uđi u scenu → čitaj dijalog → biraj opciju → resursi se menjaju vidljivo u HUD-u → prelaz u sledeću scenu → jedan od 7 endinga na kraju.

---

## Tehnički detalji

- **Engine:** Vanilla JS ES6 moduli, JSON-driven dialog/scene data (58 dijalog čvorova, 5 scena)
- **Audio:** Web Audio API — 5 generativnih scena-ambijenata + SFX + 7 ending stingera
- **Storage:** LocalStorage save/load, session analytics
- **Moduli:** 35 fajlova, 6932 JS + 1090 CSS linija

---

## Kluboslavija Brand Integration

Ending screen nosi Kluboslavija branding i direktan CTA ka `bilet.rs/show/261`.

---

## Beta rezultati

| Iter | Ocena | CRITICAL | MEDIUM | LOW |
|------|-------|----------|--------|-----|
| Iter 1 | 8.2/10 | 0 | 3 | 3 |
| Iter 2 | 9.7/10 | 0 | 0 (novih) | 0 (novih) |

Post-fix score: **9.0/10**

Auto-release uslovi (KORAK 6.75) ispunjeni: beta_score_iter2 9.7 ≥ 8.0, 0 CRITICAL u oba izveštaja. Šef obavešten posle release-a — veto putem `git revert` ostaje dostupan.

**Play:** https://mkdsl.github.io/gari-daily-games/games/2026-06-01-nis-fuga/
