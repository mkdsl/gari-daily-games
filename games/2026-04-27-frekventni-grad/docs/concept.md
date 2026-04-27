# Frekventni Grad

## Žanr
Rhythm/Reflex — tajming igra sa narativnom atmosferom

## Premisa
Ti si DJ u podzemnom klubu razrušenog megagrada koji još uvek treperi od muzike. Svake noći na scenu dolaze novi nastupajući, a publika ima jednu od tri rasejanosti — umor, tugu, haos. Tvoj zadatak: uhvati ritam, prati boj svetla, drži publiku budnom. Pobedi noć, prevaziđi sebe.

## Core Gameplay Loop
- Na ekranu se redom pojavljuju "beat krugovi" koji putuju ka središnjoj liniji tempa
- Igrač pritiska taster (ili tapuje) u tačno pravo vreme — PERFECT / GOOD / MISS ocena
- Combo lanac povećava energiju publike (energy bar); miss ga prekida
- Između rundi biraš jednu od tri "setlist kartice" — nova pesma menja vizuelni stil, tempo i pattern krugova
- Svakih 3 pesme publika reaguje: ako je energija visoka, dobijaju novu scenu (bonus sekunda buffer); ako pada ispod 30%, "boo" mehanika gde dolaze razbacani beatovi
- Napredovanje: svakih 5 noći otključavaš novi lokacija/klub sa težim ritmovima i drukčijim vizuelnim temama

## Hook
Svaki klik zvuči i izgleda tačno — čuješ, vidiš i osećaš svaki beat koji pogodis, i taj "lock" efekat tera te da ostaješ na još jednu pesmu.

## Vizuelna Estetika
- Paleta boja: `#0D0D1A` (tamna noć), `#E040FB` (neon ljubičasta), `#00E5FF` (electric cyan), `#FFD740` (warm amber spotlight)
- Stil: neon minimalist — geometrijske forme, sjaj efekti (CSS box-shadow + canvas glow), retro-futuristička tipografija
- Ključni vizuelni element: Beat krugovi koji se šire kao "sonar ring" i eksplodiraju u neon sjaj u trenutku preciznog tapа

## Audio Mood
Sintetički 8-bit house bas sa melodičnim arpeggio-ima — generisan Web Audio API-jem; tempo 110–140 BPM zavisno od lokacije; kratki "click" za PERFECT, prigušeni "thud" za MISS, crescendo za kraj noći

## Win Condition
Beskonačno sa prestige mehanikom: svakih 5 "noći" otključavaš novi klub (ukupno 4 lokacije: Podrum, Krov, Metro, Orbita). Posle 4. kluba — "Legendarni Status" — igra se restart-uje sa ubrzanim ritmovima i novom bojom teme, ali zadržavaš highscore titulu.

## Targetirana Dužina Sesije
10–20 min (jedna "noć" = 3–4 pesme = ~5 min; prirodni break point, lako se vraća)

## Slug
frekventni-grad
