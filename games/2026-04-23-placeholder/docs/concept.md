# Kolonija 7 — Concept

## Žanr
Simulation / Idle (ant colony + resource management)

## Premisa
Poslednja kolonija mrava na planeti pokušava da preživi ispod pustinjske površine. Ti si Kraljica — jedini izvor novih radnica. Svaki teren koji iskopaju otkriva resurse ili opasnost, a kolonija sama radi dok ti odlučuješ gde da kopaju i šta da grade.

## Core Gameplay Loop
1. **Kopaj** — Klikni na ćeliju susednu već iskopanome prostoru da pošalješ radnice da iskopaju tunel
2. **Skupljaj** — Radnice automatski nose hranu i minerale koji se nađu u iskopanome prostoru ka centru kolonije
3. **Gradi** — Troši resurse na sobe: Leglo (rast populacije), Magacin (kapacitet), Odbrambeni zid (blokiraj pustinjski pesak koji se sipa odozgo)
4. **Prestiži mini** — Kad dostigneš dubinu 20 i iskoplješ "Drevni kristal", unlockuješ trajnu nadogradnju (brže radnice, veći magacin) i kreneš ponovo dublje
5. **Preživljaj napade** — Svakih 90 sekundi "peskana bura" oštećuje neopasan gornji sloj — radnice bez zaštite ginu, Odbrambeni zid ih štiti

## Hook
Samo jos jedan tunel — i onda ces vidjeti sta je iza tog kamena.

## Vizuelna Estetika
- **Paleta:** Tamno smeđa/crna pozadina (zemlja), topli jantarni i narandžasti tonovi za hodnike i sobe, beli piksel-tačkice za pesak na vrhu, plavo-zeleni kristali na dubini
- **Stil:** Canvas, top-down cross-section (pogled sa strane u zemlju), grid 20x30 ćelija
- **Radnice:** Pokretni pikseli 3x3 koji hodaju po tunelima, animirani CSS-om
- **Sobe:** Pravougaonici sa ikonama crtanim Canvas API-jem (krug = leglo, kvadrat = magacin, cik-cak = zid)
- **Sve generisano kodom** — nema .png, samo Canvas drawRect/arc i CSS

## Audio Mood
- Duboki, tih drone kao "zemlja koja diše" (Web Audio: OscillatorNode na 40Hz, nizak gain)
- Klik iskopavanja: kratki "thud" (BufferSource sa generisanim noise burstom, 80ms)
- Alarm bure: narastajuci bijeli sum, 2 sekunde pre napada
- Pesana bura tokom napada: visokofrekventni sum koji lupa kao kisa
- Skupljanje resursa: mek "tik" zvuk (sine wave 880Hz, 30ms, brz decay)

## Win/Lose Condition
- **Pobeda (po rundi):** Iskopaj Drevni Kristal na dubini 20 → aktivira se prestige, dobijaš trajnu nagradu, nova runda krece
- **Lose:** Populacija padne na 0 (sve radnice uginu od bura bez zaštite) — game over ekran sa dubinom i trajanjem kao scoreom
- **Meta pobeda:** Skupi sve 3 vrste kristala (3 prestige ciklusa) za "Kolonija besmrtna" ending

## Targetirana Dužina Sesije
5-8 minuta do prvog prestige-a za novog igrača — sa dovoljno "jedan klik pa jos jedan" momenata da niko ne primeti da je prošlo 12.
