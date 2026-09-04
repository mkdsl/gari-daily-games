# Premortem — Jesenji Tok

**Verdict: drži uz korekcije**

---

## Showstopper rizici

**1. Mobile drag-drop na 6×12 gridu je fizički problem.**
72 ćelija na 375px ekranu = ~6×6px po ćeliji ako grid zauzme celu širinu. To nije igriva površina — to je taktilni haos. Concept ne rešava ovo ni aludom. Scrollable grid? Zoom? Tap-to-select umesto drag? Bez eksplicitnog rešenja, mobile je bloker. GDG igre moraju raditi na mobitelu. Ovo nije opcija.

**2. Information overload bez onboarding plana.**
Igrač u prvih 30 sekundi treba da razume: 6 parcela sa tipovima, 6 radova sa prozorima, 3 radne grupe, weather blok mehaniku, ekosistem bonus uslov, i prestige. Concept ne pominje FTUE, tutorial, progressive reveal, ništa. 8–12 minuta session target je mrtvo slovo ako igrač prvih 3 minute provede čitajući pravila. Ovo mora biti adresovano pre impl-a.

---

## High rizici

**3. "Nema lose" = nema tenzije.**
Concept kaže: 0 preskočen = "Zemlja nije zaboravila — ali ti jesi." To je estetski poraz, ne mehanički. Igrač ne gubi save, ne gubi progres, prestige ima samo upside. Bez pravog fail state-a, scheduling puzzle gubi zubiće — biraš redosled ali nema pravog konflikta. Rešenje: eksplicitni threshold (npr. score < 200 = sezona propala, nema prestige opcije) ili negativna posledica (nedelja 1 u sledećoj sezoni zauzeta zbog "dorade").

**4. Weather mehanika kao decoration.**
"4 weather preset nasumično" — ako igrač ne može da predvidi ili prilagodi, weather je samo excuse za loš score, ne strateška varijabla. Da li igrač vidi forecast pre drag-assign? Concept ne govori. Ako ne, graditeljski radovi postaju kockanje, ne planiranje. Treba eksplicitna weather-preview mehanika (npr. vidljivost 2 nedelje unapred).

---

## Brand-utility kritika

**Guncati: funkcioniše, ali sa uslovom.**
"Prikazuje stvaran ritam imanja" je legitimna edukativna tvrdnja — radni prozori su realni (micelij inokulacija avg–okt, ozimo žito avg–sept). Igrač koji odigra igru zaista saznaje KADA se šta radi. Ovo je vredan Guncati asset, posebno kao pre-masterclass sadržaj. Ali samo ako ekrani imaju jednu rečenicu konteksta po radnom tipu (zašto taj prozor, šta se dogodi van njega). Bez teksta, to je boja na gridu, ne edukacija.

**Kluboslavija: decoration.**
"Event companion za jesenji masterclass" — nije dovoljno da opravda tag. Gde je Kluboslavija u igri? Nema logo, nema event hook, nema share card sa datumom Guncati eventa. Bez konkretnog integration pointa, Kluboslavija brand utility je wishful thinking. Ili dodati jedan share screen sa datumom/lokacijom masterclassa, ili ukloniti tag iz manifest-a.

---

## Šta je dobro

- **Žanr izbor je svež i opravdan.** GDG nije imao scheduling puzzle. Grid × timeline forma je prirodna za sezonsko planiranje.
- **Radovi su stvarni i tematski konzistentni.** Micelij, ozimo, jezero zimska priprema — ovo su Brana-stvari, ne dekoracija. Daje igri autentičnost.
- **Ekosistem bonus je pametna mehanika.** ×1.5 ako Micelij+Jezero+Kompost svi u prozoru — nagrada za holistično razmišljanje, ne samo optimizaciju jedne varijable.
- **Prestige je tačno skaliran.** Jedan bonus po sezoni, 3 opcije, grid reset — ne preambiciozan, ne premali.
- **Score rangovi su glasoviti.** "Zemlja nije zaboravila — ali ti si." je odlična kopija.

---

## Korekcije (obavezne pre impl-a)

1. **Mobile grid rešenje** mora biti u GDD-u pre KORAK 4. Predlog: tap-to-select + tap-ćeliju za assign, ne drag. Ili vertikalni scroll po parcelama sa horizontalnim nedeljama.
2. **FTUE plan** — bar 3 tutorial koraka u GDD-u: prva parcela guided, weather preview objašnjen, ekosistem uslov najavljen.
3. **Fail threshold** — definisati score ispod kojeg prestige nije dostupan (predlog: <300).
4. **Weather forecast vidljivost** — eksplicitno u GDD-u: igrač vidi N nedelja unapred.
5. **Guncati tekst kontekst** — jedna rečenica po radu (zašto taj prozor). Može biti tooltip ili fixed info panel.
