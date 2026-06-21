# Signoff Backlog — Konsolidovani Test Paket

**Generisano:** 2026-06-21, trigger (KORAK 0b)
**Status:** 14 igara u `stage: "polish"` čekaju šefov 5-minutni test. Najstarija (Tiha Avala) čeka 40 dana. **Avala event je bio JUČE (20.06) — prozor je zatvoren, nijedna od 6 countdown-igara nije izašla pre/tokom eventa.**

**KORAK 0b je aktivan:** broj igara koje NISU `released` je 20 (≫ 2). Trigger danas NIJE pokrenuo novu igru — isti 14-igara backlog kao juče, samo +1 dan. Nijedan `docs/sef_signoff.md` nije čekiran ("OK za release") otkad je paket osvežen 2026-06-20, što znači **0 progresa u 24h**, i 0 progresa preko same Avala večeri.

## ⚠️ Avala prozor je zatvoren — prvi konkretan promašaj

6 od 14 igara u backlogu su izgrađene kao **countdown-do-Avale** sadržaj (Tiha Avala, Zvučna Proba, Turneja 2026, Ekipa Noći, Festival Mreža, Avala Crew). Juče (20.06) je bio sam event. Danas (21.06) taj prozor je definitivno zatvoren — ovo nije više "ističe večeras" upozorenje, ovo je potvrđen ishod: **nijedna od 6 Avala-hook igara nije dobila sign-off ni release, ni pre ni tokom eventa.** Marketing vrednost tih 6 igara kao "anticipacija/countdown" je sada nula; ako se ipak release-uju, to je samo "uspomena/recap" sadržaj, ne promo hook. Ovo je prvi put da je rok iz prethodnog refresh-a stvarno prošao bez ishoda — vredno šefove pažnje van rutinske liste ispod.

## Sign-off lista (14 igara, najstarije prvo)

Otvori, odigraj 2-5 min, javi "OK [ime]" ili "vrati u fix [ime]: [šta]".

| # | Igra | Dana čeka | Score (post-fix) | Brand | Napomena | Play |
|---|------|-----------|-------------------|-------|----------|------|
| 1 | **Tiha Avala** | 40 | 9.0/10 | kluboslavija | Avala hook — prozor zatvoren | [Play](https://mkdsl.github.io/gari-daily-games/games/2026-05-12-tiha-avala/) |
| 2 | Sound vs Tišina | 30 | 9.0/10 | kluboslavija × mkdslend | | [Play](https://mkdsl.github.io/gari-daily-games/games/2026-05-22-sound-vs-tisina/) |
| 3 | **Zvučna Proba** | 28 | 9.0/10 | kluboslavija | Avala hook — prozor zatvoren | [Play](https://mkdsl.github.io/gari-daily-games/games/2026-05-24-zvucna-proba/) |
| 4 | **Kluboslavija: Turneja 2026** | 27 | 9.0/10 | kluboslavija × mkdslend | Avala hook — prozor zatvoren | [Play](https://mkdsl.github.io/gari-daily-games/games/2026-05-25-turneja-2026/) |
| 5 | Gari Tim Simulator | 26 | 9.0/10 | mkdslend | | [Play](https://mkdsl.github.io/gari-daily-games/games/2026-05-26-gari-tim-simulator/) |
| 6 | DJ Akademija | 24 | 9.0/10 | kluboslavija | | [Play](https://mkdsl.github.io/gari-daily-games/games/2026-05-28-dj-akademija/) |
| 7 | Akva-Sklop | 22 | 9.0/10 | guncati | | [Play](https://mkdsl.github.io/gari-daily-games/games/2026-05-30-akva-sklop/) |
| 8 | **Ekipa Noći** | 21 | 9.0/10 | kluboslavija × mkdslend | Avala hook — prozor zatvoren | [Play](https://mkdsl.github.io/gari-daily-games/games/2026-05-31-ekipa-noci/) |
| 9 | Pečurka Inokulator | 19 | 9.0/10 | guncati | | [Play](https://mkdsl.github.io/gari-daily-games/games/2026-06-02-pecurka-inokulator/) |
| 10 | Sarajevo ili Smrt | 18 | 9.0/10 | kluboslavija × mkdslend | | [Play](https://mkdsl.github.io/gari-daily-games/games/2026-06-03-sarajevo-ili-smrt/) |
| 11 | **Festival Mreža** ⚠️ najjača Avala-sprega (grand-win uslov) | 17 | 9.0/10 | kluboslavija × mkdslend | Avala hook — prozor zatvoren | [Play](https://mkdsl.github.io/gari-daily-games/games/2026-06-04-festival-mreza/) |
| 12 | **Avala Crew** | 15 | 9.0/10 | kluboslavija × mkdslend | Avala hook — prozor zatvoren | [Play](https://mkdsl.github.io/gari-daily-games/games/2026-06-06-avala-crew/) |
| 13 | Zemlja i Znanje | 14 | 9.0/10 | guncati × mkdslend | | [Play](https://mkdsl.github.io/gari-daily-games/games/2026-06-07-zemlja-i-znanje/) |
| 14 | Park Mapa | 8 | 9.0/10 | mkdslend × kluboslavija × guncati | | [Play](https://mkdsl.github.io/gari-daily-games/games/2026-06-13-park-mapa/) |

Svaka igra ima `docs/sef_signoff.md` u svom folderu sa konkretnom test checklistom (5-6 koraka, <5 min). Sve ocenjene `post_fix_score: 9.0` (cap) — Beta Trio smatra sve playable i bez first-impression blokera. Ovo NE zamenjuje šefov test (KORAK 6.75 je obavezan bez obzira na score).

## Ako odgovoriš "OK SVE"

Gari prolazi kroz svih 14 redom, radi KORAK 7 (manifest finalize + README + release commit) za svaku.

## Zaglavljeno ranije u pipeline-u (nije još na sign-off, ne treba test još)

| Igra | Stage | Status |
|------|-------|--------|
| Niš Fuga (06-01) | concept | čeka impl (09:00 trigger) — 20 dana stoji, nikad nije ušla u impl |
| Park Mapa (05-21, original) | concept | napuštena, zamenjena retry-em 06-13 koji je gore u tabeli |

## Napuštene/legacy stavke (pre-KORAK-0a šema, van scope-a ovog paketa)

`games/2026-04-22-kanal`, `2026-04-24-kartaski-front`, `2026-05-06-park-ranger`, `2026-05-11-dj-za-pultom-v1` — stariji manifest format bez `stage` polja ili nestandardni `status`. Ne blokiraju trenutni routing (nisu "najnoviji po datumu fajla"); šef odlučuje da li ih treba arhivirati ili ponovo otvoriti.
