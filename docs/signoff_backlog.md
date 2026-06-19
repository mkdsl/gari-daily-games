# Signoff Backlog — Konsolidovani Test Paket

**Generisano:** 2026-06-19, 03:00 trigger (KORAK 0b)
**Status:** 14 igara u `stage: "polish"` čekaju šefov 5-minutni test. Najstarija (Tiha Avala) čeka 38 dana. **Avala event je SUTRA (20.06).**

**KORAK 0b je aktivan:** broj igara koje NISU `released` je 20 (≫ 2). 03:00 trigger danas NIJE pokrenuo novu igru. Umesto toga: KORAK 0a je otkrio da su **Ekipa Noći** i **Festival Mreža** (obe direktno Avala-tematske — Festival Mreža ima Avala kao eksplicitan grand-win uslov) bile zaglavljene na `stage: "impl"` uprkos završenoj beti, što ih je činilo nevidljivim u jučerašnjem paketu. Akva-Sklop je sinhronizovan iz istog razloga. Sve tri su sada dodate ispod.

## Brza akcija — Avala-relevantne prvo (Avala je SUTRA)

Otvori, odigraj 2-5 min, javi "OK [ime]" ili "vrati u fix [ime]: [šta]".

| # | Igra | Dana čeka | Score (post-fix) | Brand | Play |
|---|------|-----------|-------------------|-------|------|
| 1 | **Tiha Avala** | 38 | 9.0/10 | kluboslavija | [Play](https://mkdsl.github.io/gari-daily-games/games/2026-05-12-tiha-avala/) |
| 2 | **Zvučna Proba** | 26 | 9.0/10 | kluboslavija | [Play](https://mkdsl.github.io/gari-daily-games/games/2026-05-24-zvucna-proba/) |
| 3 | **Kluboslavija: Turneja 2026** | 25 | 9.0/10 | kluboslavija × mkdslend | [Play](https://mkdsl.github.io/gari-daily-games/games/2026-05-25-turneja-2026/) |
| 4 | **DJ Akademija** | 22 | 9.0/10 | kluboslavija | [Play](https://mkdsl.github.io/gari-daily-games/games/2026-05-28-dj-akademija/) |
| 5 | **Ekipa Noći** ⚠️ novo (bila skrivena, KORAK 0a) | 19 | 9.0/10 | kluboslavija × mkdslend | [Play](https://mkdsl.github.io/gari-daily-games/games/2026-05-31-ekipa-noci/) |
| 6 | **Festival Mreža** ⚠️ novo (bila skrivena, KORAK 0a — Avala je explicit grand-win uslov) | 15 | 9.0/10 | kluboslavija × mkdslend | [Play](https://mkdsl.github.io/gari-daily-games/games/2026-06-04-festival-mreza/) |
| 7 | **Avala Crew** | 13 | 9.0/10 | kluboslavija × mkdslend | [Play](https://mkdsl.github.io/gari-daily-games/games/2026-06-06-avala-crew/) |
| 8 | **Park Mapa** | 6 | 9.0/10 | mkdslend × kluboslavija × guncati | [Play](https://mkdsl.github.io/gari-daily-games/games/2026-06-13-park-mapa/) |

## Ostalo — bez čvrstog roka

| # | Igra | Dana čeka | Score (post-fix) | Brand | Play |
|---|------|-----------|-------------------|-------|------|
| 9 | Sound vs Tišina | 28 | 9.0/10 | kluboslavija × mkdslend | [Play](https://mkdsl.github.io/gari-daily-games/games/2026-05-22-sound-vs-tisina/) |
| 10 | Gari Tim Simulator | 24 | 9.0/10 | mkdslend | [Play](https://mkdsl.github.io/gari-daily-games/games/2026-05-26-gari-tim-simulator/) |
| 11 | Akva-Sklop ⚠️ novo (bila skrivena, KORAK 0a) | 20 | 9.0/10 | guncati | [Play](https://mkdsl.github.io/gari-daily-games/games/2026-05-30-akva-sklop/) |
| 12 | Pečurka Inokulator | 17 | 9.0/10 | guncati | [Play](https://mkdsl.github.io/gari-daily-games/games/2026-06-02-pecurka-inokulator/) |
| 13 | Sarajevo ili Smrt | 16 | 9.0/10 | kluboslavija × mkdslend | [Play](https://mkdsl.github.io/gari-daily-games/games/2026-06-03-sarajevo-ili-smrt/) |
| 14 | Zemlja i Znanje | 12 | 9.0/10 | guncati × mkdslend | [Play](https://mkdsl.github.io/gari-daily-games/games/2026-06-07-zemlja-i-znanje/) |

Svaka igra ima `docs/sef_signoff.md` u svom folderu sa konkretnom test checklistom (5-6 koraka, <5 min). Sve ocenjene `post_fix_score: 9.0` (cap) — Beta Trio smatra sve playable i bez first-impression blokera. Ovo NE zamenjuje šefov test (KORAK 6.75 je obavezan bez obzira na score).

## Ako odgovoriš "OK SVE"

Gari prolazi kroz svih 14 redom, radi KORAK 7 (manifest finalize + README + release commit) za svaku.

## Zaglavljeno ranije u pipeline-u (nije još na sign-off, ne treba test još)

| Igra | Stage | Status |
|------|-------|--------|
| Niš Fuga (06-01) | concept | čeka impl (09:00 trigger) |

## Napuštene/legacy stavke (pre-KORAK-0a šema, van scope-a ovog paketa)

`games/2026-04-22-kanal`, `2026-04-24-kartaski-front`, `2026-05-06-park-ranger`, `2026-05-11-dj-za-pultom-v1`, `2026-05-21-park-mapa` (zamenjena retry-em 06-13) — stariji manifest format bez `stage` polja ili nestandardni `status`. Ne blokiraju trenutni routing (nisu "najnoviji po datumu fajla"); šef odlučuje da li ih treba arhivirati ili ponovo otvoriti.
