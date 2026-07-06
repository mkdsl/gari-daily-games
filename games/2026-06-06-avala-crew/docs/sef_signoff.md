# Šef Sign-Off — Avala Crew

**Datum zahteva:** 2026-06-18 (retroaktivno — manifest/docs sync urađen danas, KORAK 0a)
**Stage:** polish (beta iter 2 završena)
**Play URL:** https://mkdsl.github.io/gari-daily-games/games/2026-06-06-avala-crew/

## Status Beta Testa

| Iteracija | Score | Napomena |
|-----------|-------|----------|
| Beta iter 1 | 7.8/10 | CRITICAL-01 (Bojan+Ana ability bug), onboarding gap |
| Beta iter 2 | 8.3/10 | CRITICAL-01 fixovan, onboarding panel dodat, Good Fit badge dodat |
| post_fix_score | 9.0/10 | (formula: iter2 + CRITICAL×1 + MEDIUM×0.5, cap 9.0) |

## Zašto je ova igra hitna

Direktno Avala-brendirana (festival crew builder, 5 crew pills, `#AvalaCrew`, `bilet.rs/show/261` CTA na share kartici). Avala event je za 2 dana.

## Šta testirati (5 minuta)

1. **Otvori play_url** — naslovni ekran, badge "🎉 20. jun 2026 — Kluboslavija na Avali", dugme "⚡ Sastavi ekipu!"
2. **Sastavi ekipu** — biraš li crew (Maja, Dragan, Ana, Bojan, Lena...) sa Good Fit badge-ovima?
3. **Scenario** — odigraj 1 noć, aktiviraj ability (npr. Bojan) — vidi se li feedback čim ability "propadne" (bio MEDIUM bug)
4. **Outcome ekran** — WIN/PARTIAL/FAIL overlay sa score i narativnim tekstom?
5. **Share kartica** — generiše li se canvas kartica sa crew, score, `#AvalaCrew`, Kluboslavija/datum?
6. **Prestige** (ako stigneš) — "Guncati Lokalni" unlock?

## Sign-Off (popuni)

- [x] OK za release — šef: 2026-07-05
- [ ] Vrati u fix: ________________________

**Napomene:** _(opcionalno)_

---

*Po odobrenju, Gari nastavlja sa KORAK 7 (Finale — README.md, games/README.md update, git release commit).*
