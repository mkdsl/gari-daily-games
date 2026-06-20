# Signoff Backlog — Konsolidovani Test Paket

**Generisano:** 2026-06-20, trigger (KORAK 0b)
**Status:** 14 igara u `stage: "polish"` čekaju šefov 5-minutni test. Najstarija (Tiha Avala) čeka 39 dana. **Avala event je DANAS (20.06).**

**KORAK 0b je aktivan:** broj igara koje NISU `released` je 20 (≫ 2). Trigger danas NIJE pokrenuo novu igru — isti 14-igara backlog kao juče, bez izmena. Nijedan `docs/sef_signoff.md` nije čekiran ("OK za release") otkad je paket osvežen 2026-06-19, što znači **0 progresa u 24h** — svi brojevi ispod su prosto +1 dan u odnosu na juče.

## ⚠️ Vremenski prozor se zatvara DANAS

6 od 14 igara u backlogu su izgrađene kao **countdown-do-Avale** sadržaj (Tiha Avala, Zvučna Proba, Turneja 2026, Ekipa Noći, Festival Mreža, Avala Crew) — njihov hook je "još X dana do Avale". Pravi Avala event je **danas**, ne za N dana. Posle danas taj hook ne radi više kao "anticipacija", samo kao "uspomena" — marketing vrednost ovih 6 igara za Kluboslavija Avala promo opada nakon večeras bez obzira na sign-off odluku. Ako neka od njih treba da izađe PRE/TOKOM večerašnjeg eventa, to je danas ili nikad.

## Brza akcija — Avala-relevantne prvo (6 igara, danas ili nikad)

Otvori, odigraj 2-5 min, javi "OK [ime]" ili "vrati u fix [ime]: [šta]".

| # | Igra | Dana čeka | Score (post-fix) | Brand | Play |
|---|------|-----------|-------------------|-------|------|
| 1 | **Tiha Avala** | 39 | 9.0/10 | kluboslavija | [Play](https://mkdsl.github.io/gari-daily-games/games/2026-05-12-tiha-avala/) |
| 2 | **Zvučna Proba** | 27 | 9.0/10 | kluboslavija | [Play](https://mkdsl.github.io/gari-daily-games/games/2026-05-24-zvucna-proba/) |
| 3 | **Kluboslavija: Turneja 2026** | 26 | 9.0/10 | kluboslavija × mkdslend | [Play](https://mkdsl.github.io/gari-daily-games/games/2026-05-25-turneja-2026/) |
| 4 | **Ekipa Noći** | 20 | 9.0/10 | kluboslavija × mkdslend | [Play](https://mkdsl.github.io/gari-daily-games/games/2026-05-31-ekipa-noci/) |
| 5 | **Festival Mreža** ⚠️ najjača Avala-sprega (grand-win uslov) | 16 | 9.0/10 | kluboslavija × mkdslend | [Play](https://mkdsl.github.io/gari-daily-games/games/2026-06-04-festival-mreza/) |
| 6 | **Avala Crew** | 14 | 9.0/10 | kluboslavija × mkdslend | [Play](https://mkdsl.github.io/gari-daily-games/games/2026-06-06-avala-crew/) |

## Ostalo — bez čvrstog roka danas, ali i dalje stari

| # | Igra | Dana čeka | Score (post-fix) | Brand | Play |
|---|------|-----------|-------------------|-------|------|
| 7 | DJ Akademija | 23 | 9.0/10 | kluboslavija | [Play](https://mkdsl.github.io/gari-daily-games/games/2026-05-28-dj-akademija/) |
| 8 | Sound vs Tišina | 29 | 9.0/10 | kluboslavija × mkdslend | [Play](https://mkdsl.github.io/gari-daily-games/games/2026-05-22-sound-vs-tisina/) |
| 9 | Gari Tim Simulator | 25 | 9.0/10 | mkdslend | [Play](https://mkdsl.github.io/gari-daily-games/games/2026-05-26-gari-tim-simulator/) |
| 10 | Akva-Sklop | 21 | 9.0/10 | guncati | [Play](https://mkdsl.github.io/gari-daily-games/games/2026-05-30-akva-sklop/) |
| 11 | Pečurka Inokulator | 18 | 9.0/10 | guncati | [Play](https://mkdsl.github.io/gari-daily-games/games/2026-06-02-pecurka-inokulator/) |
| 12 | Sarajevo ili Smrt | 17 | 9.0/10 | kluboslavija × mkdslend | [Play](https://mkdsl.github.io/gari-daily-games/games/2026-06-03-sarajevo-ili-smrt/) |
| 13 | Zemlja i Znanje | 13 | 9.0/10 | guncati × mkdslend | [Play](https://mkdsl.github.io/gari-daily-games/games/2026-06-07-zemlja-i-znanje/) |
| 14 | Park Mapa | 7 | 9.0/10 | mkdslend × kluboslavija × guncati | [Play](https://mkdsl.github.io/gari-daily-games/games/2026-06-13-park-mapa/) |

Svaka igra ima `docs/sef_signoff.md` u svom folderu sa konkretnom test checklistom (5-6 koraka, <5 min). Sve ocenjene `post_fix_score: 9.0` (cap) — Beta Trio smatra sve playable i bez first-impression blokera. Ovo NE zamenjuje šefov test (KORAK 6.75 je obavezan bez obzira na score).

## Ako odgovoriš "OK SVE"

Gari prolazi kroz svih 14 redom, radi KORAK 7 (manifest finalize + README + release commit) za svaku.

## Zaglavljeno ranije u pipeline-u (nije još na sign-off, ne treba test još)

| Igra | Stage | Status |
|------|-------|--------|
| Niš Fuga (06-01) | concept | čeka impl (09:00 trigger) — 19 dana stoji, nikad nije ušla u impl |
| Park Mapa (05-21, original) | concept | napuštena, zamenjena retry-em 06-13 koji je gore u tabeli |

## Napuštene/legacy stavke (pre-KORAK-0a šema, van scope-a ovog paketa)

`games/2026-04-22-kanal`, `2026-04-24-kartaski-front`, `2026-05-06-park-ranger`, `2026-05-11-dj-za-pultom-v1` — stariji manifest format bez `stage` polja ili nestandardni `status`. Ne blokiraju trenutni routing (nisu "najnoviji po datumu fajla"); šef odlučuje da li ih treba arhivirati ili ponovo otvoriti.
