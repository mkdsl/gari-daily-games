# Šef Sign-Off — Festival Mreža

**Datum zahteva:** 2026-06-19 (retroaktivno — manifest/docs sync urađen danas, KORAK 0a; beta iter 2 je završena 2026-06-05, sign-off zahtev nije bio kreiran jer je manifest pogrešno ostao na `stage: "impl"`)
**Stage:** polish (beta iter 2 završena)
**Play URL:** https://mkdsl.github.io/gari-daily-games/games/2026-06-04-festival-mreza/

## Zašto je ova igra hitna

**Direktno Avala-tematska — najjača sprega u celom backlogu.** Grand win uslov je eksplicitno "Završi Avala event sa satisfaction ≥ 90%". Macro mreža (Niš → Sarajevo → Štrand → Guncati → Avala) replicira pravu Kluboslavija turneju; reputacija iz ranijih gradova direktno diktira Avala kapacitet u igri. Avala event je sutra (20.06).

## Status Beta Testa

| Iteracija | Score | Napomena |
|-----------|-------|----------|
| Beta iter 1 | 7.4/10 | 3+ CRITICAL (coordinator deserialization gubi loyalty/ability posle reload, 60fps macro re-render DOM leak, promo crash na undefined cityId) + 11 MEDIUM |
| Beta iter 2 | 8.1/10 | Sva 3 CRITICAL verifikovano rešena (throttle na 2fps, guard na cityId, pun coordinator merge na load) |
| post_fix_score | 9.0/10 | (formula: iter2 + CRITICAL×1 + MEDIUM×0.5, cap 9.0) |

## Šta testirati (5+ minuta)

1. **Otvori play_url** — macro mreža grafikon, 5 gradova, budžet/koordinatori/promo talasi vidljivi?
2. **Uđi u mikro event** (jedan grad) — real-time crowd routing, redirect dugmad rade?
3. **BPM slider** — pomeranje utiče vidljivo na crowd mood/floor temp?
4. **Reload stranice mid-run** — da li se koordinatori vraćaju sa ispravnim loyalty tier-om (bio CRITICAL bug)?
5. **Stigni do Avale** (ili pročitaj kako reputacija iz ranijih gradova utiče na Avala kapacitet) — jasno povezano sa pravim eventom 20.06?
6. **Mobile + desktop** kontrole, share karta na kraju.

## Sign-Off (popuni)

- [ ] OK za release
- [ ] Vrati u fix: ________________________

**Napomene:** _(opcionalno)_

---

*Po odobrenju, Gari nastavlja sa KORAK 7 (Finale — README.md, games/README.md update, git release commit).*
