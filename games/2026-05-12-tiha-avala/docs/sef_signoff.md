# Šef Sign-Off — Tiha Avala

**Datum zahteva:** 2026-06-18 (retroaktivno — igra je beta-testirana 05-12/05-13, ovaj fajl je nedostajao)
**Stage:** polish (beta iter 2 završena)
**Play URL:** https://mkdsl.github.io/gari-daily-games/games/2026-05-12-tiha-avala/

## Status Beta Testa

| Iteracija | Score | Napomena |
|-----------|-------|----------|
| Beta iter 1 | 6.0/10 | 7 bugova prijavljeno (CRITICAL + MEDIUM) |
| Beta iter 2 | 9.0/10 | Svih 7 bugova verifikovano ispravljeno, 0 novih CRITICAL |
| post_fix_score | 9.0/10 | (formula: iter2 + CRITICAL×1 + MEDIUM×0.5, cap 9.0) |

## Zašto je ova igra hitna

**Najstarija u backlogu — 37 dana čeka.** Direktno Avala-tematska: igrač je audio inženjer Kluboslavija turneje koji podešava SPL/bass/ugao zvučnika na terenu Avale pre 20. juna, balansirajući "publika srećna" vs "komšija ne zove inspekciju". Avala event je za 2 dana (20.06) — ovo je countdown-hook igra napisana baš za ovaj trenutak i nikad nije testirana.

## Šta testirati (5 minuta)

1. **Otvori play_url** — učitava li se mapa terena (bina, kuće komšija, šuma/dolina/brdo/asfalt)?
2. **3 slidera** — Master SPL (dB), Bass Ratio (%), Speaker Angle (°) — rade li smooth na touch/mouse?
3. **TESTIRAJ dugme** — pokreće li se simulacija zvučnih talasa s animacijom?
4. **Dva merača** — Dance Floor Srećnost (%) i Komšija SPL (dB) ažuriraju se li u realnom vremenu?
5. **Level Clear / Fail** — uspe li bar 1 od 6 nivoa da se završi, vidi li se outcome ekran?
6. **Mobile** — radi li touch kontrola za slidere?

## Sign-Off (popuni)

- [ ] OK za release
- [ ] Vrati u fix: ________________________

**Napomene:** _(opcionalno)_

---

*Po odobrenju, Gari nastavlja sa KORAK 7 (Finale — README.md, games/README.md update, git release commit).*
