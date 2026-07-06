# Signoff Backlog — Konsolidovani Test Paket

**Generisano:** 2026-07-06, trigger (KORAK 0b) — D+36 (KORAK 0b aktivan od 2026-06-17)
**Status:** 14 igara u `stage: "polish"` čekaju šefov 5-minutni test. Najstarija (Tiha Avala) čeka 55 dana. Avala event (20.06) je prošao bez ijedne od 6 countdown-igara — prozor ostaje trajno zatvoren.

**KORAK 0b je aktivan:** broj igara koje NISU `released` je 20 (≫ 2). Trigger danas NIJE pokrenuo novu igru. **0 sign-off-ova primljeno otkad praćenje postoji (KORAK 0b aktiviran 2026-06-17) — 19 uzastopnih dana, 0 progresa.** Red ne raste više (impl/concept su zamrznuti od 06-13), ali i ne opada — pipeline je u potpunosti zaglavljen na jednoj tački: šefov test.

**Napomena (06-30 rok):** Nega je imala rok 2026-06-30 da zatvori META-pitanje (auto-signoff politika) kao `[PROPOSAL]` self-commit u ajajaj repo. Ovaj backlog ne prati ajajaj — proveri tamo. Nezavisno od tog ishoda, KORAK 6.75 (manuelni test) ostaje obavezan.

## ⚠️ Avala prozor je zatvoren — potvrđen promašaj

6 od 14 igara u backlogu su izgrađene kao **countdown-do-Avale** sadržaj (Tiha Avala, Zvučna Proba, Turneja 2026, Ekipa Noći, Festival Mreža, Avala Crew). Event je bio 20.06 — prozor je definitivno zatvoren: **nijedna od 6 Avala-hook igara nije dobila sign-off ni release, ni pre ni tokom eventa.** Ako se ipak release-uju, to je samo "uspomena/recap" sadržaj, ne promo hook.

## Sign-off lista (14 igara, najstarije prvo)

Otvori, odigraj 2-5 min, javi "OK [ime]" ili "vrati u fix [ime]: [šta]".

| # | Igra | Dana čeka | Beta iter2 | Brand | Napomena | Play |
|---|------|-----------|------------|-------|----------|------|
| 1 | **Tiha Avala** | 55 | 9.0/10 | kluboslavija | Avala hook — prozor zatvoren | [Play](https://mkdsl.github.io/gari-daily-games/games/2026-05-12-tiha-avala/) |
| 2 | Sound vs Tišina | 45 | 8.0/10 | kluboslavija × mkdslend | Beta1=3.0 — imala ozbiljnih bug-ova inicijalno | [Play](https://mkdsl.github.io/gari-daily-games/games/2026-05-22-sound-vs-tisina/) |
| 3 | **Zvučna Proba** | 43 | 8.5/10 | kluboslavija | Avala hook — prozor zatvoren | [Play](https://mkdsl.github.io/gari-daily-games/games/2026-05-24-zvucna-proba/) |
| 4 | **Kluboslavija: Turneja 2026** | 42 | 9.0/10 | kluboslavija × mkdslend | Avala hook — prozor zatvoren | [Play](https://mkdsl.github.io/gari-daily-games/games/2026-05-25-turneja-2026/) |
| 5 | Gari Tim Simulator | 41 | 8.5/10 | mkdslend | | [Play](https://mkdsl.github.io/gari-daily-games/games/2026-05-26-gari-tim-simulator/) |
| 6 | DJ Akademija | 39 | 8.5/10 | kluboslavija | | [Play](https://mkdsl.github.io/gari-daily-games/games/2026-05-28-dj-akademija/) |
| 7 | Akva-Sklop | 37 | 7.4/10 | guncati | Najslabiji beta iter2 u listi | [Play](https://mkdsl.github.io/gari-daily-games/games/2026-05-30-akva-sklop/) |
| 8 | **Ekipa Noći** | 36 | 8.5/10 | kluboslavija × mkdslend | Avala hook — prozor zatvoren | [Play](https://mkdsl.github.io/gari-daily-games/games/2026-05-31-ekipa-noci/) |
| 9 | Pečurka Inokulator | 34 | 7.5/10 | guncati | | [Play](https://mkdsl.github.io/gari-daily-games/games/2026-06-02-pecurka-inokulator/) |
| 10 | Sarajevo ili Smrt | 33 | 6.8/10 ⚠️ | kluboslavija × mkdslend | Najniži beta iter2 — ispod 7.0 | [Play](https://mkdsl.github.io/gari-daily-games/games/2026-06-03-sarajevo-ili-smrt/) |
| 11 | **Festival Mreža** ⚠️ najjača Avala-sprega (grand-win uslov) | 32 | 8.1/10 | kluboslavija × mkdslend | Avala hook — prozor zatvoren | [Play](https://mkdsl.github.io/gari-daily-games/games/2026-06-04-festival-mreza/) |
| 12 | **Avala Crew** | 30 | 8.3/10 | kluboslavija × mkdslend | Avala hook — prozor zatvoren | [Play](https://mkdsl.github.io/gari-daily-games/games/2026-06-06-avala-crew/) |
| 13 | Zemlja i Znanje | 29 | 9.0/10 | guncati × mkdslend | | [Play](https://mkdsl.github.io/gari-daily-games/games/2026-06-07-zemlja-i-znanje/) |
| 14 | Park Mapa | 23 | 7.8/10 | mkdslend × kluboslavija × guncati | | [Play](https://mkdsl.github.io/gari-daily-games/games/2026-06-13-park-mapa/) |

Svaka igra ima `docs/sef_signoff.md` u svom folderu sa konkretnom test checklistom (5-6 koraka, <5 min). Kolona "Beta iter2" je stvarni rezultat posle fix-ova (post_fix_score u manifestima je sve 9.0 zbog stare formule bez bonus-cap — ne uzimaj ga kao indikator; iter2 je pravi). **Sarajevo ili Smrt (beta2=6.8) i Akva-Sklop (beta2=7.4) su kandidati za dodatni fix pre release-a ako šef tako odluči.** Ovo NE zamenjuje šefov test (KORAK 6.75 je obavezan bez obzira na score).

## ⚠️ Pasoš cross-game registry drift (KORAK 0c, potvrđeno i danas)

Kluboslavija Pasoš (`games/2026-05-10-cross-event-pasos/src/config.js`) ima **3 registrovana slug-a** od **17 released igara** — gap = 14 (≫ 5 prag), nepromenjeno. Drift je netaknut od 10.05 (preko 7 nedelja). Čak i kad bi sve 14 igara iznad dobile sign-off danas, Pasoš ih ne bi prepoznao dok neko ne dopiše slugove/stamps u `config.js` (Jovin posao, brand/copy odluka po igri — ovaj korak samo izveštava, ne piše u config). Vidi `tim/retrospektiva/2026-06-21.md` (ajajaj repo) za poreklo nalaza.

## ⚠️ Orphaned concept igre (KORAK 0d, potvrđeno i danas)

Dve igre su zaglavljene u `concept` stage-u i nevidljive normalnom routing-u:

| Igra | Stage | Dana stoji | Napomena |
|------|-------|-----------|----------|
| Park Mapa (05-21, original) | concept | 46 dana | Napuštena — zamenjena retry-em 06-13 koji je u sign-off tabeli iznad |
| **Niš Fuga** (06-01) | concept | 35 dana | Nikad ušla u impl — čeka 09:00 trigger koji je poveže sa impl subagentom |

KORAK 0d kaže: 09:00 trigger treba da radi impl na Niš Fugi (najstariji orphan u concept). Ali KORAK 0b (count=20 ≫ 2) zaustavlja sve dok sign-off red ne padne ispod 2.

## Ako odgovoriš "OK SVE"

Gari prolazi kroz svih 14 redom, radi KORAK 7 (manifest finalize + README + release commit) za svaku.

## Napuštene/legacy stavke (pre-KORAK-0a šema, van scope-a ovog paketa)

`games/2026-04-22-kanal`, `2026-04-24-kartaski-front`, `2026-05-06-park-ranger`, `2026-05-11-dj-za-pultom-v1` — stariji manifest format bez `stage` polja ili nestandardni `status`. Ne blokiraju trenutni routing (nisu "najnoviji po datumu fajla"); šef odlučuje da li ih treba arhivirati ili ponovo otvoriti.
