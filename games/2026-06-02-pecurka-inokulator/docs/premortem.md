# Pečurka Inokulator — Premortem

**Autor:** Nega Negovanović (devil's advocate)
**Datum:** 2026-06-02

---

## Steelmanning

Timing mehanika je vremenski testirana — od Guitar Hero do Fruit Ninja, svi razumeju "klikni u pravo vreme." Sprega sa realnom edukacijom (inokulacija zaista ima vremenski prozor) čini mehaniku autentičnom, ne izmišljenom. 10 nivoa sa progresivnim twist-ovima daje strukturiranu krivulju koja drži pažnju bez objašnjavanja.

---

## Rizici

| # | Rizik | Severity |
|---|-------|----------|
| 1 | **Timing window frustracija** — ako prozor bude i marginalno preuzak na ranim nivoima, igrač odustaje pre nego što shvati loop. Nivo 1 (800ms) je solidan, ali greška u implementaciji može window osećati manji nego što jeste (click latency, visual lag). | SHOWSTOPPER |
| 2 | **Kontekstualna praznina** — igrač bez ikakvog uvoda ne zna šta je "sterilni prozor" niti zašto greška = kontaminacija. Bez kratkog 2-3 rečeničnog tutoriala, brand edukacija pada na game over ekran koji niko ne čita. | MEDIUM |
| 3 | **Repetitivnost** — 10 nivoa sa istom baznom akcijom (klikni bar) može postati monotono od nivoa 6 nadalje. Specijalne mehanike (treper, multi-bag) moraju biti vizuelno jasno diferencirane, inače se stope u blur. | MEDIUM |
| 4 | **Difficulty spike / padina** — nivo 7 (2 vreće) → nivo 8 (fake-out + golden) je skok koji može biti ili prejednostavan (rutina) ili preterano brutalan zavisno od random-a. Potreban playtesting balansa. | MEDIUM |
| 5 | **Brand hook kao dekoracija** — ako Guncati fakta žive SAMO na game over ekranu, 80% igrača koji ne izgube nikad ih ne vide. Logo u uglu ne edukuje. | LOW |

---

## Zaključak

**Drži uz korekcije.**

Konkretne korekcije:
1. **Nivo 1 mora imati vizuelni tutorial overlay** (strelica + "Klikni kad si u zelenoj zoni") — jedan ekran, 3 sekunde, skip dugme.
2. **Guncati fakta treba prikazati i pri level clear** (rotacija, kratko, jedno po level clear) — ne samo na game over.
3. **Difficulty krivulja nivoa 7–8 zahteva fiksni seed za random** u prvih 5 partija da ne bude brutalan spike za novog igrača.
