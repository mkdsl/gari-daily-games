# Kolonija 7

**Žanr:** Simulation / Idle — ant colony resource management

**Datum:** 2026-04-23

## Opis

Poslednja kolonija mrava na planeti pokušava da preživi ispod pustinjske površine. Ti si Kraljica. Kopi tunele, skupljaj hranu i minerale, gradi sobe i preživljavaj peskane bure — sve dok ne pronađeš Drevni Kristal duboko u zemlji.

## Kako se igra

- **Klikni** na ćeliju susednu iskopanome tunelu da je iskoplješ
- **Klikni na iskopanu ćeliju** da otvoriš meni za gradnju sobe (Leglo, Magacin, Zid)
- Radnice **automatski skupljaju** resurse — ti odlučuješ gde se kopa i šta se gradi
- Svakih 90 sekundi dolazi **peskana bura** — Odbrambeni Zid štiti radnice
- Iskopaj **Drevni Kristal** (dubina 16–19) za prestige — biraš trajni bonus i krećeš ponovo

## Cilj

3 prestige ciklusa → **"Kolonija Besmrtna"** meta ending

## Tim

- **Sine Scenario** — koncept i narativ
- **Mile Mehanika** — GDD i ekonomski balans
- **Jova jQuery** — implementacija (Canvas, Vanilla JS ES6)
- **Pera Piksel** — CSS animacije i pustinjska estetika
- **Ceca Čujka** — Web Audio zvuci (drone, dig, bura, kristal)
- **Nega Negovanović** — premortem analiza
- **Beta Trio** — QA i bug report

## Tehničke napomene

- Vanilla JS ES6 moduli, bez npm
- Canvas rendering, responsive
- LocalStorage save/load
- Mobile touch + desktop mouse/keyboard
