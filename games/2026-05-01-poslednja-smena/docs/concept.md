# Concept: Poslednja Smena

**Datum:** 2026-05-01
**Autor koncepta:** Siniša "Sine" Scenario

---

## 1. Naziv igre

**Poslednja Smena**
*(Tagline: "Svaki izbor ostavlja trag.")*

---

## 2. Žanr

**Text/Narrative — Interactive Fiction sa stat-tracking elementima**

Hibrid: choose-your-own-adventure + mood-board stat tracker. Nema akcije, nema platformi — samo reči, izbori, i posledice koje se skupljaju.

---

## 3. Premisa

Radnik u fabrici dobija pismo za otkaz dan pre penzije — i u poslednjih osam sati smene mora da odluči ko je i šta je vredelo.

---

## 4. Core Gameplay Loop

1. **Čitaš scenu** — kratki prose paragraf (2-5 rečenica), atmosfera fabrike, zvuk mašina, miris ulja
2. **Biraš reakciju** — 2 do 3 opcije, nikad "ispravna" — svaka nosi trošak i dobitak
3. **Statistike se tiho menjaju** — Ponos / Umor / Solidarnost / Gorčina (vidljive, ali ne alarmantne)
4. **Susreti** — 5-7 kratkih scena sa kolegama, šefom, starom mašinom, ogledalom u hodniku
5. **Finale** — poslednja scena zavisi od akumuliranih stat-ova; jedno od 4 različita završetka

Ceo loop traje 8-12 minuta. Nema "game over". Nema pogrešnih odgovora. Samo tvoj radnik — i tvoja verzija priče.

---

## 5. Hook

"Još jedan izbor" momenat ovde nije klik za nagradu — nego znatiželja: *šta bi se desilo da sam odabrao drugačije?*

Igra je kratka namerno. Posle prvog prolaska, igrač se vraća da vidi drugi kraj. Statistike su dovoljno transparentne da se oseti "aha, promenio sam Ponos → drugačiji razgovor sa šefom." Replayability nije o randomizaciji — o emocionalnoj curiosity.

Tajni hook: kraj koji izgleda kao poraz može biti najlepši od svih.

---

## 6. Vizuelna Estetika

**Paleta — 4 boje:**
- `#1a1a2e` — Tamna noć / pozadina (plavo-crna)
- `#e8d5b7` — Stari papir / tekst (topla bež)
- `#c0392b` — Akcenat / statistike u crvenom (Gorčina, upozorenja)
- `#27ae60` — Akcenat / statistike u zelenoj (Solidarnost, mir)

**Stil:** Minimalistički, text-heavy. Monospaced font (Courier varijanta generisana CSS-om). Retro terminal estetika — ali topla, ne hladna. Blago skenirana-papir tekstura — CSS noise filter.

Svaka scena ima jednu ASCII / CSS art ilustraciju: silueta mašine, fabričko okno, ručni sat. Sve generisano u Canvas draw kodu — bez PNG fajlova.

Statistike su prikazane kao 4 horizontalne trake u gornjem desnom uglu — tiho, non-intrusive.

---

## 7. Audio Mood

**Atmosfera:** Industrijska melanholija. Topla, ali umorna.

**Web Audio API synthesis elementi:**
- Niska drone nota (oscilator, ~60Hz) — konstantna kao hum mašinerije, skoro čujna
- Povremeni metalički "klik" pri izboru opcije (short square wave burst)
- Kad se završi scena: kratki fade-in string-like tone (triangle wave, decay)
- Kraj igre: tišina — pa jedan dubok ton koji se rastvara

Zvuk je namerno supptlen — igra se može igrati bez zvuka i ne izgubi ništa. Ali sa slušalicama? Drugačija rečenica.

---

## 8. Win Condition

**Nema "pobede" u klasičnom smislu.**

Igra se završi kad prođe poslednja scena (8. scena + finale). Sva 4 kraja su validna. Prikazuje se kratka "epitaf kartica" radnika — jedno-dve rečenice koje sumiraju koga si bio u toj smeni.

Postoji skriveni "peti kraj" — dostupan samo ako igrač nijednom nije promenio prvobitni instinkt (bira uvek prvu opciju tokom celog prolaska). Taj kraj je najtišiji od svih.

---

## 9. Targetirana Dužina Sesije

**8-12 minuta** za jedan prolazak.
Ukupno sa replayom: 20-30 minuta prirodno (3-4 prolaska da se vide svi krajevi).
Nema timer-a, nema pritiska. Čita se kao kratka priča.

---

## 10. Zašto Danas?

*Danas je 1. maj — Praznik rada. Svet slavi rad, a mi smo napravili igru o čoveku kome su upravo rekli da više nije potreban. Nema gorčeg ironijskog okvira — ni boljeg trenutka da podsetnimo igrača da iza svake statistike stoji neki Mirko, neka Vesna, neka poslednja smena.*

---

## Tehničke Napomene za Implementaciju

- **Sav narativni sadržaj** živi u `src/levels/scenes.js` kao JS objekat/array — lako editovati, lako proširiti
- **State engine** je minimalan: 4 stat-varijable (0-100), trenutna scena, log izbora
- **Routing logika** u `src/systems/narrative.js` — bira sledeću scenu na osnovu statova i prethodnih izbora
- **Rendering** je čist DOM, ne Canvas (tekst + CSS tranzicije) — Canvas samo za ASCII ilustracije u scenama
- **Realistična JS procena:** 1200-1800 linija ukupno — najmanji scope do sada, ali najgušći emotivno
- Mobile je prirodno podržan — tekst + dugmad, nema kompleksnih touch gesture-a

Ovo je svesno skromnija igra po kodu — ali priča je najambicioznija stvar koju smo stavili u `docs/concept.md` do sada.
