# Signoff Backlog — Konsolidovani Test Paket

**Generisano:** 2026-06-18, 03:00 trigger (KORAK 0b)
**Status:** 11 igara u `stage: "polish"` čekaju šefov 5-minutni test. Najstarija (Tiha Avala) čeka 37 dana. Avala event je za 2 dana (20.06).

**KORAK 0b je aktivan:** broj igara koje NISU `released` je 20 (≫ 2). 03:00 trigger danas NIJE pokrenuo novu igru — umesto toga je osvežio ovaj paket i sinhronizovao 2 manifesta koja su zaostala iza svojih docs/ fajlova (Sarajevo ili Smrt, Avala Crew — KORAK 0a).

## Brza akcija — Avala-relevantne prvo (T-2 do 20.06)

Otvori, odigraj 2-5 min, javi "OK [ime]" ili "vrati u fix [ime]: [šta]".

| # | Igra | Dana čeka | Score (post-fix) | Brand | Play |
|---|------|-----------|-------------------|-------|------|
| 1 | **Tiha Avala** | 37 | 9.0/10 | kluboslavija | [Play](https://mkdsl.github.io/gari-daily-games/games/2026-05-12-tiha-avala/) |
| 2 | **Park Mapa** | 5 | 9.0/10 | mkdslend × kluboslavija × guncati | [Play](https://mkdsl.github.io/gari-daily-games/games/2026-06-13-park-mapa/) |
| 3 | **Avala Crew** | 12 | 9.0/10 | kluboslavija × mkdslend | [Play](https://mkdsl.github.io/gari-daily-games/games/2026-06-06-avala-crew/) |
| 4 | **Zvučna Proba** | 25 | 9.0/10 | kluboslavija | [Play](https://mkdsl.github.io/gari-daily-games/games/2026-05-24-zvucna-proba/) |
| 5 | **Kluboslavija: Turneja 2026** | 24 | 9.0/10 | kluboslavija × mkdslend | [Play](https://mkdsl.github.io/gari-daily-games/games/2026-05-25-turneja-2026/) |
| 6 | **DJ Akademija** | 21 | 9.0/10 | kluboslavija | [Play](https://mkdsl.github.io/gari-daily-games/games/2026-05-28-dj-akademija/) |

## Ostalo — bez čvrstog roka

| # | Igra | Dana čeka | Score (post-fix) | Brand | Play |
|---|------|-----------|-------------------|-------|------|
| 7 | Sound vs Tišina | 27 | 9.0/10 | kluboslavija × mkdslend | [Play](https://mkdsl.github.io/gari-daily-games/games/2026-05-22-sound-vs-tisina/) |
| 8 | Gari Tim Simulator | 23 | 9.0/10 | mkdslend | [Play](https://mkdsl.github.io/gari-daily-games/games/2026-05-26-gari-tim-simulator/) |
| 9 | Sarajevo ili Smrt | 15 | 9.0/10 | kluboslavija × mkdslend | [Play](https://mkdsl.github.io/gari-daily-games/games/2026-06-03-sarajevo-ili-smrt/) |
| 10 | Pečurka Inokulator | 16 | 9.0/10 | guncati | [Play](https://mkdsl.github.io/gari-daily-games/games/2026-06-02-pecurka-inokulator/) |
| 11 | Zemlja i Znanje | 11 | 9.0/10 | guncati × mkdslend | [Play](https://mkdsl.github.io/gari-daily-games/games/2026-06-07-zemlja-i-znanje/) |

Svaka igra ima `docs/sef_signoff.md` u svom folderu sa konkretnom test checklistom (5-6 koraka, <5 min). Sve ocenjene `post_fix_score: 9.0` (cap) — Beta Trio smatra sve playable i bez first-impression blokera. Ovo NE zamenjuje šefov test (KORAK 6.75 je obavezan bez obzira na score).

## Ako odgovoriš "OK SVE"

Gari prolazi kroz svih 11 redom, radi KORAK 7 (manifest finalize + README + release commit) za svaku.

## Zaglavljeno ranije u pipeline-u (nije još na sign-off, ne treba test još)

Ovih 4 igara nije u backlogu iznad jer nisu stigle do polish/beta — treba im impl ili polish trigger da nastave, ne šefov test:

| Igra | Stage | Status |
|------|-------|--------|
| Niš Fuga (06-01) | concept | čeka impl (09:00 trigger) |
| Akva-Sklop (05-30) | impl | čeka polish (17:00 trigger) |
| Ekipa Noći (05-31) | impl | čeka polish (17:00 trigger) |
| Festival Mreža (06-04) | impl | čeka polish (17:00 trigger) |

## Napuštene/legacy stavke (pre-KORAK-0a šema, van scope-a ovog paketa)

`games/2026-04-22-kanal`, `2026-04-24-kartaski-front`, `2026-05-06-park-ranger`, `2026-05-11-dj-za-pultom-v1`, `2026-05-21-park-mapa` (zamenjena retry-em 06-13) — stariji manifest format bez `stage` polja ili nestandardni `status`. Ne blokiraju trenutni routing (nisu "najnoviji po datumu fajla"); šef odlučuje da li ih treba arhivirati ili ponovo otvoriti.
