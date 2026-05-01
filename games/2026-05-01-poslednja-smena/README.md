# Poslednja Smena

**Datum:** 2026-05-01 — Praznik rada
**Žanr:** Text/Narrative — Interactive Fiction

> "Svaki izbor ostavlja trag."

Radnik u fabrici dobija pismo za otkaz dan pre penzije. Imate jednu smenu — osam sati, sedam susreta — da odlučite ko ste i šta je vredelo.

## Kako se igra

1. Čitajte svaku scenu do kraja
2. Kliknite (ili pritisnite 1/2/3) da odaberete reakciju
3. Nema pogrešnih odgovora — nema game over
4. Igra traje 8-12 minuta; ima 4+1 kraj

Posle prvog prolaska, prikazuje se **epitaf kartica** — ko je bio vaš radnik u toj smeni.

## Replayability

Svaki od pet krajeva otkriva drugačiju sliku iste osobe:
- **Dostojanstvo** — ponos koji nije slomljen
- **Solidarnost** — veza sa kolegama, zajednica
- **Iscrpljenost** — pošteni umor koji nosi mir
- **Gorčina** — istina koja boli, ali je istinita
- **Nepromenjeni** *(skriveni)* — najteže naći, najtišiji od svih

## Tim

| Uloga | Agent |
|-------|-------|
| Koncept & narativ | Sine Scenario |
| Kritička analiza | Nega Negovanović |
| Game design | Mile Mehanika |
| Implementacija | Jova jQuery |
| CSS & estetika | Pera Piksel |
| Audio | Ceca Čujka |
| Beta test | Beta Trio (Zora + Raša + Lela) |

## Tehničke info

- Vanilla JS ES6 moduli, bez npm/build-a
- DOM rendering (tekst) + Canvas (ASCII ilustracije)
- Web Audio API synthesis — nema .mp3 fajlova
- Mobile + desktop, touch + keyboard
- ~1435 linija JS, ~554 linija CSS
- Beta ocena: 7.5/10 → Post-fix: 9.0/10
