# Premortem: Zimovnica
**Analyst:** Nega Negovanović
**Datum:** 2026-09-17
**Verdict:** DRŽI UZ KOREKCIJE (3 kritičnih, 4 medijum)

---

## Šta može da puca

### CRITICAL #1 — Storage matematika je nemoguća

Koncept definiše storage kao `4 police × 20 tegli = 80 tegli max`. Prestige uslov je `≥120 tegli`. To je 50% iznad kapaciteta.

**Fail scenario:** Igrač igra savršeno, nema nijednog propadanja, ali fizički ne može da dostigne prestige jer container ne može da primi 120 tegli. Niko to ne kaže eksplicitno — igrač samo vidi da ne može i misli da greši. Police moraju ili da budu upgradeable (nije pomenuto u concept-u) ili da se prestige threshold spusti na ≤80 tegli ili da se uvede police upgrade sistem koji concept trenutno ne specifikuje.

**Šta treba u concept.md:** Ili dodati police upgrade u progression stablu, ili promeniti prestige na `≥70 tegli, ≥500 kasa`.

---

### CRITICAL #2 — Turšija timing paradox

Turšija: `1h prep, 7–21 dana fermentacije`. Igra traje `14 dana`.

Poslednji dan kad možeš startovati turšiju i dobiti je gotovu: **Dan 7** (7 dana minimum). Dan 8 startirano = najbrža fermentacija završava se Dan 15 = posle game over. Dan 6 startirano = gotova Dan 13 (jedva).

Problem: turšija sa 14–21 dana fermentacijom (hladnije) ne može biti gotova ni ako startuje Dan 1. A `14 dana fermentacije` opcija je normalna za kisele krastavce. Igrač koji zna pravljenje turšije u stvarnosti — naš target audience — znaće da je fermentacija 14 dana realistična. Taj igrač startuje Dan 3, čeka, pa vidi da nije gotovo i da ga je realna praksa iznevela.

**Šta treba:** Kompresovati fermentaciju na `3–7 in-game dana` (ostaje realističan ritam, ali uklapa se u 14-dnevni window) ili produžiti igru na 21 dan i rebrandovati kao "do Nikoljdana". Event "kiša 3 dana kvari sušeno voće napolju" i "turšija pH check" impliciraju da prognoze postoje — ali niko ne govori igraču unapred koliko će fermentacija trajati za konkretnu berbu.

---

### CRITICAL #3 — Rakija je trap, ne reward

Rakija unlock: `Dan 10+`. Igra: 14 dana. Preostalo po otključavanju: 4 dana.

Priprema + destilacija: `2h + 4–8h`, BLOKIRA SVE ACTION SLOTS tog dana. Igrač koji želi Medenjaci prestige ending mora: sušiti šljive (3–7 dana pasivno, dakle mora startovati Dan 1–7), AND odraditi Rakija Dan 10–14 (gubi čitav dan od 4 preostalih). Narrowest funnel u igri = prestige ending koji bi trebao biti nagrada.

Uži problem: "Medenjaci od šljive" traže `carry-over sušene šljive + rakija reserve`. Carry-over znači iz prethodnog run-a. To znači da Medenjaci NEMOGUĆE u prvom run-u. Concept ne kaže to eksplicitno — naprotiv, opisuje Medenjake kao ending, sugerirajući da je dostižan u jednoj sesiji.

**Šta treba:** Ili eksplicitno naglasiti da je Medenjaci multi-run, ili dati alternativni path za Medenjake u single run (kupovina šljiva od komšije, event). Rakija timing se mora popraviti — otključaj Dan 7, ne Dan 10.

---

### MEDIJUM #1 — RNG harvest floor nije definisan

Berba RNG pool: `paprike (0–80 kg)`. Nula je moguće. Šta se dešava ako igrač dobije run sa 0 paprika, 0 paradajza, samo 5 kg jabuka? Matematički moguće po concept-u, gameplay nije.

Concept ne navodi minimum floor. Ako ga nema, jedan od prvih 5 run-ova (statistički) će biti near-unwinnable zbog RNG. Igrači koji ne razumeju da je RNG to uzrokovao misliće da su pogrešili.

**Šta treba:** Definisati minimum floor po berbi (npr. paprike min 20 kg, ili guarantee ≥2 main ingredient-a na >20 kg).

---

### MEDIJUM #2 — Vremenska prognoza je retroaktivna kazna

"Kiša 3 dana — sušeno voće izvan se kvari" je event. Ali event system daje 3 random eventi PER DAN. Igrač koji je prethodnog dana stavio voće da se suši napolju — ne može znati da će sutrašnji event biti kiša. U realnom životu pogledaš prognozu.

Bez forecast mechanic-a (makar 1-dan preview) ovo je hidden penalty koji igrači pripisuju lošoj sreći, ne lošoj odluci. Puzzle igra mora biti punishable za pogrešnu INFORMISANU odluku — ne za nedostatak telepatije.

**Šta treba:** Forecast prozorčić (simpl: "sutra: sunčano / oblačno / kiša" vidljiv pre nego što danas izabereš action slot-ove). Jedno polje, ne UI overhead.

---

### MEDIJUM #3 — MKDSLend konekcija je dekoracija

Guncati veza: čvrsta. Concept opisuje oktobarski rad na imanju — to je direktno Guncati brand narativ.

MKDSLend "Zabavni Radni Park" veza: `"rad koji je zabavan, ne rad koji liči na zabavu"`. Ovo je slogan koji se može nalepiti na bilo koju igru. Koji MEHANIZAM u Zimovnici konkretno ilustruje MKDSLend vrednost? Nema ga navedenog. Ako brand_serves lista MKDSLend a veza je samo copywriting fraza, to je problem pri prezentaciji Zimovnice kao MKDSLend branded asset-a.

**Šta treba:** Ili ukloniti MKDSLend iz brand_serves, ili dodati jedan konkretan mechanic koji je MKDSLend-specific (npr. masterclass mode gde igraš edukativni prolaz kroz proces).

---

### MEDIJUM #4 — Mobile UX za shelf-grid nije razrađen

Vizualna estetika: "Tegle kao polica-grid". 4 police × 20 tegli = 80 grid elemenata koji moraju biti interaktivni (ili bar čitljivi) na telefonu. Concept ne pominje touch UX, ne pominje zoom/scroll, ne pominje collapse mechaniku.

CLAUDE.md zahteva Mobile + desktop. Shelf grid na 375px ekranu bez razrade = jedna od prvih stvari Beta Trio reflagovaće. Bolje rešiti u konceptu nego u fix logu.

**Šta treba:** Concept.md da specifikuje "shelf grid je scrollable lista, ne fixed grid" ili "tegle su kolapsovane u kategorije na mobile" — jedan red, ali bez njega impl pravi default koji ne radi.

---

## Šta drži

- **Core loop je solid.** "14 dana do ruje, čist countdown" je jasna pressure struktura bez tutorijala. Igrač instantno razume ulog.
- **Pasivni timeri + aktivni eventi** — dobar ritam. Fermentacija čeka, ti radiš nešto drugo. Nije čekaonica.
- **4+1 ending struktura** je uredna. Fail state nije binarno — postoji gradacija katastrofe.
- **Modul plan (38 modula)** ispunjava ≥25 zahtev. Dobro je razdvojen.
- **Ajvar kao prestige-friendly item** (visoka vrednost, dugotrajno) — dobar design decision.
- **Bačva KO inicijacioni prozor** — dobar mechanic, realan pritisak, nije random.

---

## Verdict

**DRŽI UZ KOREKCIJE**

Koncept ima dušu i mehanički oslonac. Ali tri CRITICAL buga (storage math, turšija timing, rakija trap) moraju biti rešena PRE nego što Mile ide na GDD — jer su sve tri greške u brojkama, i GDD koji gradi na krivim brojkama postaje komplikovaniji problem za fix u kasnijem stadijumu.

Minimalni set ispravki za concept.md:
1. Police: ili upgrade system (navesti u concept-u) ili prestige threshold ≤80
2. Fermentacija: kompresovati na 3–7 in-game dana ili produžiti run na 21 dan
3. Rakija: otključaj Dan 7, eksplicitno reći da Medenjaci zahteva 2+ run-ova
4. RNG floor: definisati minimum garanciju sirovine po berbi
5. Forecast: jedan red u concept.md koji kaže da forecast mechanic postoji

Bez ovih 5 tačaka — impl krenuti je riskantno.
