# Pečurka Inokulator — Concept

**Autor:** Iskra Ivanović (brand-utility lens)
**Datum:** 2026-06-02

---

## Naziv i žanr

**Pečurka Inokulator** — Timing / Precision Arcade

## Premisa

Ti si inokulant u Guncati laboratoriji. Supstrat je sterilisan, sprej je spreman — ali sterilni prozor se zatvara svakog trenutka. Klikni u pravi momenat ili kontaminacija preuzima sve.

## Core Gameplay Loop

Svake sekunde igrač gleda timing bar koji osciluje levo-desno. Zeleni pas (sterilni prozor) se pomera po baru. Kada zeleni pas pokrije ciljnu zonu — klik/tap. Tačan klik = micelij ulazi u supstrat, skor raste, animacija rasta. Promašaj = kontaminacija, -1 život. Tri promašaja i runda je gotova. 10 nivoa, svaki brži i kompleksniji od prethodnog.

## Hook — zašto 10-15 minuta?

Highscore je lokalni daily izazov. "Prošao sam nivo 6, pokušavam 7." Mehanika je jednostavna ali se ne zamara — brzina raste i svaki nivo ima novu varijantu (treper, zlatni prozor, multi-bag). Streak multiplier nagrađuje preciznost, ne brzinu samu. 10 nivoa = tačno dovoljno da sesija ne postane posao.

## Vizuelna Estetika

Pixel art, laboratorijsko-rustikalni miks. Drveni sto, bele plastične vreće/tegle, zeleni zidovi. Paleta: tamno zelena (#1a3a2a), svetlo zelena (#7bc67a), krem bela za opremu. Pleurotus siluete u pozadini kao dekoracija. Guncati logo diskretno u uglu. Čist kontrast, nikad vizuelni haos.

## Audio Mood

Tih ambient hum (sterile hood). Metronomski tick-tock dok prozor osciluje — tempo raste sa nivoom. "Ding" + fizzy bubbles pri uspehu. Buzzer + splat pri kontaminaciji. Kratki fanfare pri level clear.

## Win / Game Over

- **Win (nivo clear):** sve inokulacije urađene, prelazi na sledeći nivo
- **Game Over:** 3 greške = kontaminacija sve ruši; prikazuje skor, combo, nivo, Guncati edukativno fakta

## brand_serves: Guncati

Igra konkretno edukuje: inokulacija ima "prozor" i nije trivijalna. Game over ekran rotira 4 fakta o miceliju, Pleurotus-u i Guncati radionicama (jesen 2026). Link → guncati.rs. Ko igra i razume zašto je teško, spremniji je da plati radionicu. Igra je edukativni asset i lead gen u jednom.

## Targetirana Sesija

5–10 minuta (10 nivoa × 30–60 sec/nivo + game over ekran).

## Replay Hook

Daily highscore top 3 u localStorage + "Igraj ponovo" dugme odmah na game over ekranu. Kratka sesija = mali trošak ponovnog pokušaja.
