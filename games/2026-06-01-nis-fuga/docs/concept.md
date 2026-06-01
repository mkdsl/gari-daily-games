# Niš Fuga — Concept
### Iskra Ivanović | GDG Concept Dizajner

---

## 1. Naziv

**Niš Fuga** — zadržavam naziv. "Fuga" radi na dva nivoa: muzička forma (kontrapunkt, više glasova koji se prepliću — kao što ekipa rešava probleme paralelno) i urgentno bežanje/jurnjava kroz grad. Nema potrebe za promenom.

---

## 2. Žanr

Point-and-click mini avantura sa dijaloški sistemom. Igrač klikće na hotspotove u scenama, bira odgovore u dijalogu i upravlja resursima (vreme, strpljenje, ekipni moral). Nije linearna priča — svaki izbor menja stanje pre sledeće scene.

---

## 3. Premisa

Kluboslavija ekipa dolazi u Niš u 09:00 ujutro. Soundcheck je u 14:00 h, kapija se otvara u 21:00 h, a između stoji pet niškospecifičnih prepreka koje samo lokalni čovek može razumeti — i samo strpljiv organizator može preživeti. Vodiš Jovanku, tour managera ekipe, kroz pet lokacija od parkinga na Bulevaru do same kapije kluba, dok grad funkcioniše po svom ritmu koji ne poštuje ničiji raspored.

---

## 4. Core Gameplay Loop

```
DOLAZAK U SCENU
     ↓
Igrač vizualno istražuje scenu (klik na hotspotove)
     ↓
Otkriva problem/zaplet scene
     ↓
Dijalog sa NPC-om → 3 izbora odgovora
     ↓
Izbor menja resurse (vreme ±, strpljenje ±, ekipni moral ±, reputacija ±)
     ↓
Scena se razrešava (uspešno / delimično / loše)
     ↓
Efekti se prenose u sledeću scenu
     ↓
Nakon 5 scena → Ending trigger na osnovu akumuliranih resursa
```

Igrač ne može "umreti" tokom scena — svaki izbor je valid, ali loši izbori akumuliraju negativne resurse koji vode ka slabijim endings-ima. Jedini hard fail je ako vreme padne na 0 (stižeš posle soundcheck deadlinea).

---

## 5. Pet Scena

---

### SCENA 1 — Parking na Bulevaru Nemanjića

**Lokacija:** Jutarnji Bulevar Nemanjića, 09:05 h. Combo van parkiran pola na trotoaru, pola u zabranjenom parking pojasu. Karakteristična niškobetonska arhitektura u pozadini.

**Problem/zaplet:** Parking-inspektor Dragoljub već šeta oko kombija. Sva oprema (PA sistem, mixing stolovi) je unutra — ne može se brzo isprazniti i premestiti.

**Izbori:**
- **A) Diplomatski razgovor** — Jovanka objašnjava da su muzičari na kulturnoj misiji. Dragoljub se zainteresuje: "Koji bend?" Ako reputacija ≥ 2, Dragoljub kaže "Ahh, Kluboslavija! Moj brat je bio na Beogradu." Kazna otpada. Vreme: -5 min. Strpljenje: +1.
- **B) Platiti kaznu odmah** — Brzo, efikasno. Vreme: -2 min. Moral ekipe: -1.
- **C) Pokušati da se izvuče bez razgovora** — Dragoljub primeti. Sad traži i tehnički pregled. Vreme: -20 min. Strpljenje: -2.

**Lokalni geg:** Dragoljub vadi blok za kazne ali ga drži naopako. Kad Jovanka to primeti i ljubazno ukaže, on se nasmeje: "Ej, tek se razbudih. I ja radim smenu od osam."

---

### SCENA 2 — Jedini otvoreni kiosk (Medijana, kod Čaira)

**Lokacija:** Uglasto raskršće u stambenom kraju Medijana, 09:20 h. Kiosk Bace Mileta — jedino mesto otvoreno u ovom delu grada.

**Problem/zaplet:** Baca Mile ima kafu. Print može — ali njegova "štampačina" je Epson iz 2009. koji radi "kad mu se prigne." Ekipa stoji u redu iza jednog tipa koji kupuje tačno 11 stvari i plaća kusur.

**Izbori:**
- **A) Strpljivo čekati red** — Dobijate sve što trebate + gratis "Nišku" čokoladu. Vreme: -10 min. Moral: +2. *Flag: setlista_printovana=true*
- **B) Zamoliti da vas propuste** — Čovek ispred se uvredi. Kafa brže ali bez setliste. Vreme: -4 min. Strpljenje: -1. Moral: -1.
- **C) Odložiti print** — Setlista nikad ne stigne. *Flag: setlista_printovana=false*, debuff za Scenu 5. Vreme: -2 min.

**Lokalni geg:** Epson izbaci papir sa pola teksta i logom nekog starijeg eventi. Basista: "Ovako i meni izgleda setlista."

---

### SCENA 3 — Kafana "Kod Pante" (blizu Tvrđave)

**Lokacija:** Stara kafana u ulici iza Tvrđave, 10:00 h. Panta radi od 08:00 jer njemu tako odgovara.

**Problem/zaplet:** Nema signala u kafani. Panta ima WiFi lozinku ali je ćerka namestila. Jovanka mora da ubedi Pantu.

**Izbori:**
- **A) Objasniti Panti šta je soundcheck** — 3 razmene dijaloga. Lozinka dobijena. Vreme: -8 min. Reputacija: +2. Moral: +1. *Flag: tonika_potvrdjeno=true*
- **B) Naći signal napolju** — Srđan na hladnoći, konekcija pada 2x. Vreme: -12 min. Strpljenje: -2.
- **C) Odložiti poziv** — Ton-majstor nedostupan do kasno. Vreme: 0, ali Scena 5 +20min komplikacija.

**Obavezni geg:** Panta donosi pitija bez narudžbe. "Po kući." Zatim još jednu rundu. Basista: "Rimljani su imali bolje logistike ali manje pitija."

---

### SCENA 4 — Niška Tvrđava (susret sa Bojanom)

**Lokacija:** Park pored Tvrđave, 11:30 h. Ekipa sreće Bojana — gitaristu lokalnog Niš benda koji otvara večeras.

**Problem/zaplet:** Bojanova Niva je kod majstora. Nema prevoz za opremu.

**Izbori:**
- **A) Napraviti mesta u kombiju** — Bojan oduševljen. Moral: +2. Reputacija: +1. Vreme: -10 min. *Flag: bojan_happy=true*
- **B) Pozvati Bojanovu bend da organizuje taxi** — Bojan razume, stiže kasno ali stiže. Moral: +1. Vreme: -3 min.
- **C) Reći da nema mesta (lažno)** — Bojan vidi otvorena vrata kombija. Awkward. Moral: -2. Reputacija: -1.

**Lokalni geg:** Bojan: "Moja Niva je kod majstora zbog... točka. Jedan točak. Majstor kaže do petka. Danas je ponedeljak."

---

### SCENA 5 — Kapija kluba (20:45 h)

**Lokacija:** Kapija kluba, 20:45 h. Obezbeđenje Nenad — novi, ne poznaje nikoga.

**Problem/zaplet:** Nenad traži guest listu i nalog promotera. Promoter Goran nedostupan.

**Izbori (resource-gated):**
- **A)** Reputacija ≥ 3 → Digitalni mejl + reference → Vreme: -5 min
- **B)** Uvek dostupno → Čekati Gorana → Vreme: -5 do -15 min
- **C)** setlista_printovana=true → Baca Mileov print → Vreme: -2 min (brže)
- **Bonus:** bojan_happy=true → Bojan izlazi i garantuje → bez gubitka vremena

**Lokalni geg:** Nenad: "Ej, ajde unutra. Ali nemojte da kažete da sam ja pustio."

---

## 6. Hook — Zašto 15+ minuta, ne 5

**Tri ending kategorije** sa 7 varijacija daju direktan replay motiv. **Gated opcije vidljive ali nedostupne** u prvom run-u — igrač vidi šta može da otključa. **Achievement lovljenje:** 9 achievements od kojih 3 skrivena. **Organic share moment:** Scena 3 (Panta i soundcheck objašnjenje) je screenshot-friendly — dijalog je smešan kao standalone citati.

---

## 7. Vizuelna Estetika

**Paleta:** Topla jutarnja — bež/krem (#F5E6C8), narandžasto-žuta jutarnja svetlost (#E8A24A), tamno-siva arhitektura (#3D3D3D), Nišava plava (#4A7FA5). NPC-ovi: zasićene tople boje (senf-žuta, bordo, zeleno-siva).

**CSS art stil:** "Flat cartoon skica" — debele konturne linije (3-4px), blagi gradijenti, bez .png fajlova. Arhitektura Niša geometrijski stilizovana — Bulevar blokovi su čisti pravougaonici, Tvrđava je crvena cigla u CSS-u.

**Layout:** Scena zauzima 70% ekrana. Dole resource bar (sat, termometar, figure). Dijalog kao speech-bubble overlay.

---

## 8. Audio Mood

Web Audio API generisano — nema .wav fajlova:
- Scena 1: Jutarnji gradski hum, ptice (stohastički high-freq clicks)
- Scena 2: Radio šum, Epson štampač (ritmični bursts)
- Scena 3: Tiha folk melodija (oscillatori), kašike i šolje
- Scena 4: Vetar, park tišina (LFO-modulated noise)
- Scena 5: Bass dron koji raste, muffled muzika iz kluba

---

## 9. Win/Lose Uslovi

**Win:** Stići na kapiju sa vremenom > 0 i moralom ≥ 2. Postoji 5 win stanja.

**Hard fail:** Vreme = 0 pre Scene 5. Teško dostići bez namerne sabotaže.

**Soft fail:** Moral = 0 → "Chaos Morning" ending.

---

## 10. Brand Serves Lista

1. **Organic share:** Scena 3 dijalog je prirodno screenshot-friendly. Nišlije delj jer "ovo je baš moj grad."
2. **Event link CTA:** Endings screen → "Budi deo stvarnog Kluboslavija Niš eventa" dugme.
3. **Niš community identifikacija:** Lokalni humor = Kluboslavija nije "beogradska ekipa", ona je "od nas."
4. **Pre-event hype:** Igra živi 10-14 dana pre eventa, perpetual share machine.
5. **Stvarne lokacije:** Bulevar, Medijana, Tvrđava — posećivači imaju reference tačke na eventa.

---

## 11. Multi-Layer Raspis

**Micro layer:** Jedna scena — istraži hotspotove → otkrij problem → beri dijalog opciju → vidi resource efekt (90 sec prosečno).

**Macro layer:** 5 scena, 4 resursa koji se prenose (vreme, strpljenje, moral, reputacija). Rane odluke utiču na kasne scene — Baca Mileov print direktno olakšava Scenu 5.

**Meta layer:** 7 endings (5 standard + 2 secret), 9 achievements (3 skrivena), gated opcije vidljive kao replay motivator.

---

## 12. Targetirana Dužina Sesije

- Prosečan run: 12-18 minuta
- Speed run: 6-8 minuta  
- Completionist: 50-60 minuta ukupno (4-5 runs)
- Endings: 7 ukupno, 2 zahtevaju specifičnu kombinaciju

---

*Iskra Ivanović | GDG Concept | 2026-06-01*
