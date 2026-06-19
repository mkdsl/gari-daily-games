# Šef Sign-Off — Ekipa Noći

**Datum zahteva:** 2026-06-19 (retroaktivno — manifest/docs sync urađen danas, KORAK 0a; beta iter 2 je završena 2026-05-31, sign-off zahtev nije bio kreiran jer je manifest pogrešno ostao na `stage: "impl"`)
**Stage:** polish (beta iter 2 završena)
**Play URL:** https://mkdsl.github.io/gari-daily-games/games/2026-05-31-ekipa-noci/

## Zašto je ova igra hitna

**Avala-tematska — terminalni event u igri je baš sutrašnja Avala (20.06).** Pet evenata: Štrand → Avala → Niš → Sarajevo → Grand Finale. Posle Grand Finala generiše se "Moja Ekipa" share kartica sa CTA na `bilet.rs/show/261`.

## Status Beta Testa

| Iteracija | Score | Napomena |
|-----------|-------|----------|
| Beta iter 1 | 6.8/10 | 4 CRITICAL (waitForEvent deadlock, input/phase_display dupli flow, departed cards bug, ROLE_LABELS missing export) + 9 MEDIUM |
| Beta iter 2 | 8.5/10 | Svi CRITICAL iz iter 1 verifikovano rešeni, 1 nov MEDIUM (redundantan poziv, ima guard) |
| post_fix_score | 9.0/10 | (formula: iter2 + CRITICAL×1 + MEDIUM×0.5, cap 9.0) |

## Šta testirati (5 minuta)

1. **Otvori play_url** — draft ekipe: biraš DJ/Host/Sound/Video/Security iz 3 ponuđene karte po roli?
2. **Potvrdi odabir** — radi li dugme glatko, bez zaglavljivanja (bio CRITICAL bug — fixovan timeout)?
3. **Event rezultat** — vidi se score breakdown i ko ostaje/odlazi iz ekipe (imena, ne ID stringovi)?
4. **Pet evenata** — Štrand → Avala → Niš → Sarajevo → Grand Finale, redosled se poštuje?
5. **Tour Score + share kartica** — generiše li se na kraju, sa linkom na bilet.rs/show/261?
6. **Mobile** — karte se mogu birati touch-om, breakpoint na malim ekranima radi?

## Sign-Off (popuni)

- [ ] OK za release
- [ ] Vrati u fix: ________________________

**Napomene:** _(opcionalno)_

---

*Po odobrenju, Gari nastavlja sa KORAK 7 (Finale — README.md, games/README.md update, git release commit).*
