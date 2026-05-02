# Mozaik Ludila

## Žanr
Puzzle (logic grid + match / kombinatorni)

## Premisa
Igrač je restorer starih mozaika u haotičnom arhivu. Fragmenti pločica padaju na mrežu — treba ih složiti u ispravne uzorke pre nego što se površina popuni i slika zauvek nestane.

## Core Gameplay Loop

1. **Pojava fragmenta** — Na vrhu ekrana pojavi se fragment (1–4 pločice u L, T, I ili S obliku) obojen u jednu od 5 boja.
2. **Postavljanje** — Igrač prevlači fragment (drag-and-drop na desktop / touch na mobile) na rešetku 8×8 i pušta ga na željenu poziciju.
3. **Matching** — Kad god se formira potpuni red ILI kolona ILI kvadrant 2×2 od iste boje, te pločice "svetle" i nestaju, oslobađajući prostor.
4. **Combo lanac** — Svako uklanjanje koje odmah okine novo uklanjanje (domino-efekat) donosi combo multiplikator (×2, ×3...).
5. **Pritisak vremena** — Novi fragment ne čeka; pojavljuje se odmah kada prethodni bude postavljen. Igrač bira ritam sopstvenim postavljanjem.
6. **Game Over** — Kad fragment ne može da stane nigde na mreži (overflow), sesija se završava.

## Hook
Mozaik Ludila kombinuje trenutno zadovoljstvo match-a sa prostornom taktikom Tetrisa — ali bez gravitacije i sa slobodnim postavljanjem. Svaki potez je mala zagonetka: "Kuda ovo da stavim da oslobodim onu plavu kolonicu?" Kad combo eksplodira — ekran je prekriven zlatnim česticama — mozak luči dopamin. Pet minuta prolazi kao minut.

## Vizuelna Estetika

**Stil:** Mediteranski/vizantijski mozaik — granuliran, "zrnat" izgled pločica.
**Paleta:**
- Pozadina: tamni kameni sivo-plavi (#1a1d2e)
- Pločice: 5 zasićenih boja — terakota narančasta (#e07b54), safirno plava (#4a8dbf), smaragdna zelena (#4db87a), zlatna žuta (#f0c040), crvenkasta rubin (#c0405a)
- Sjaj pri matchu: bela/zlatna particla eksplozija
- Mreža: suptilne fuge (tanje linije) u boji kamena (#2e3350)
- Font: serif, "stari dokument" feel — fallback na Georgia/serif

**Animacije:**
- Pločica se "utisne" u mrežu uz kratki bounce (scale 1 → 1.08 → 1)
- Match brisanje: pločice "prsnu" u sitne krhotine (CSS/Canvas particle burst)
- Combo: ekran lagano pulse-uje u zlatnoj boji

## Audio Mood
Ambijentalno, meditativno. Tih zvuk kamenog prostora — odjek. Svaki placement pločice: glasan "klik" keramike (kratki perkusivni ton, Web Audio OscillatorNode, sin wave + brzi decay). Match: harmoničan "ding" akord (tri sinusna tona u kvintu). Combo ×3+: kratki, vatreni "fanfare" od 4–5 uzlaznih nota. Pozadinska muzika: opcionalno tiha dronska nota (Sustain Loop) bez melodije — samo tekstura.

## Win/Lose Uslovi

**Pobeda (cilj sesije):** Dostići **score od 5000 poena** — prikazano kao progress bar "Restauracija complete X%". Kad se dostigne, kratka animacija završetka ("mozaik se skloppio") i prikaz finalnog skora + combo statistike.

**Lose:** Fragment ne može stati ni na jedno mesto na mreži (sve 64 ćelije popunjene ili nema validnog pozicioniranja). Prikaz koliko % je mozaik restauriran i best combo.

**Scoring:**
- 1 uklonjena pločica = 10 poena
- Combo ×2 = ×2 multiplikator, ×3 = ×3, itd.
- "Perfektni red" (ceo red iste boje) = bonus 200 poena

## Targetirana Dužina Sesije
3–5 minuta — jedna sesija (početnik). Napredni igrači koji manage-uju board efikasno mogu igrati duže, ali pritisak se povećava jer fragmenti postaju složeniji (više L/T/S oblika, manje I oblika) posle 3000 poena.

## Slug
mozaik-ludila
