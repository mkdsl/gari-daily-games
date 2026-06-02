# Pečurka Inokulator — Concept

**Autor:** Iskra Ivanović (brand-utility lens)
**Datum:** 2026-06-02

---

## Naziv i žanr

**Pečurka Inokulator** — Timing / Precision Arcade

## Premisa

Imaš lab, imaš supstrat, imaš sprej. Kontaminacija vrebata iz vazduha. Ubrizgaj micelij u tačnom trenutku — ili posmatraš kako plesni jedu tvoje vreće.

## Core Gameplay Loop

Igrač gleda timing bar koji osciluje levo-desno. Zeleni prozor se kreće, skuplja, trepe — zavisno od nivoa. Klik/tap u zelenom = uspešna inokulacija, micelij raste, skor raste. Klik van zelenog = kontaminacija, -1 život. 3 životi po nivou, 10 nivoa ukupno. Svaki nivo donosi brži prozor, više vreća, fake-out zone i zlatne bonus hitove.

## Hook — zašto 10-15 minuta?

Highscore je lokalni daily izazov. "Prošao si nivo 6, ali prijatelj drži rekord na 8." Mehanika je jednostavna ali se ne zamara — brzina raste i svaki nivo ima novu varijantu (treper, zlatni, multi-bag). Streak multiplier nagrađuje preciznost, ne brzinu samu. 10 nivoa = tačno dovoljno da sesija ne postane posao.

## Vizuelna Estetika

Pixel art, laboratorijsko-rustikalni mix. Drveni sto, bele plastične vreće/tegle, zeleni zidovi. Paleta: tamno zelena (#1a3a2a), svetlo zelena (#7bc67a), krem bela za opremu. Pečurke (Pleurotus siluete) u pozadini kao dekoracija. Guncati logo diskretno u uglu.

## Audio Mood

Tih ambient hum (sterile hood). Metronomski tick dok prozor osciluje — tempo raste sa nivoom. "Ding" + fizzy bubbles pri uspehu. Buzzer + splat pri kontaminaciji. Kratki fanfare pri level clear.

## Win / Game Over

- **Win (nivo clear):** sve inokulacije urađene, prelazi na sledeći nivo
- **Game Over:** 3 greške = kontaminacija sve ruši; prikazuje skor, combo, nivo, Guncati edukativno fakta

## Brand Serves — Guncati

Igra konkretno edukuje: inokulacija ima "prozor" i nije trivijalna. Game over ekran rotira 4 fakta o miceliju, Pleurotus-u i Guncati radionicama (jesen 2026). Link → guncati.rs. Ko igra i razume zašto je teško, spremniji je da plati radionicu. Igra je edukativni asset i lead gen u jednom.

## Sesija i Replay

- Targetirana sesija: 5–10 min (10 nivoa × 30–60 sec + game over)
- Replay hook: daily highscore (top 3) u localStorage + "Igraj ponovo" pull
