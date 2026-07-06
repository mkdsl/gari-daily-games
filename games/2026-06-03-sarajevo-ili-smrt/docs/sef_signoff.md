# Šef Sign-Off — Sarajevo ili Smrt

**Datum zahteva:** 2026-06-18 (retroaktivno — manifest/docs sync urađen danas, KORAK 0a)
**Stage:** polish (beta iter 2 završena)
**Play URL:** https://mkdsl.github.io/gari-daily-games/games/2026-06-03-sarajevo-ili-smrt/

## Status Beta Testa

| Iteracija | Score | Napomena |
|-----------|-------|----------|
| Beta iter 1 | 4.5/10 | 3 CRITICAL (screen transition, CSS class mismatch, ~25 nestilovanih klasa) |
| Beta iter 2 | 6.8/10 | Sva 3 CRITICAL ispravljena, 0 novih CRITICAL — 5 LOW stavki ostaju za next pass |
| post_fix_score | 9.0/10 | (formula: iter2 + CRITICAL×1 + MEDIUM×0.5, cap 9.0) |

## Šta testirati (5 minuta)

1. **Otvori play_url** — DJ bez reputacije osvaja Sarajevo, idle-incremental-manager-sim
2. **3 kvarta** — Baščarsija, Marijin Dvor, Grbavica — vide li se svi, učitavaju li se?
3. **Sesija** — pokreni sesiju u jednom kvartu, prati LP ticker (trickle + burst na kraju)
4. **Upgrade shop** — otvori upgrade modal, da li su sve klase stilovane (bio je CRITICAL bug — sad fix)
5. **Prestige** — ako stigneš, probaj prestige reset ekran
6. **Avala Headliner** — pominje li se Avala terminal goal negde u UI-u?

## Sign-Off (popuni)

- [x] OK za release — šef: 2026-07-05
- [ ] Vrati u fix: ________________________

**Napomene:** _(opcionalno — 5 LOW stavki iz beta iter2 nisu fixovane, navedene u fix_log.md kao "next pass")_

---

*Po odobrenju, Gari nastavlja sa KORAK 7 (Finale — README.md, games/README.md update, git release commit).*
