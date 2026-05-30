# Akva-Sklop — Premortem

**Autor:** Nega Negovanović (devil's advocate)
**Datum:** 2026-05-30
**Faza:** Pre-GDD

---

## Ocena

**drži uz korekcije**

Concept ima jaku premisu i jasnu brand-utility vezu sa Guncati. Ali ima 3 tačke koje mogu da sruše ceo projekt pre nego što Mile napiše prvi red GDD-a. Ako se te tačke ne razreše eksplicitno — ne isometric CSS-om koji "možda radi", nego odlukama — Mile ulazi u dev sesiju bez tla pod nogama.

---

## P1 — Showstopper rizici (blokiraju launch)

### 1. Izometrijski CSS grid sa animiranim česticama vode — nije "medium risk", ovo je high risk

Concept kaže: "isometric CSS box tiles sa izometrijskom transformacijom, bez sprite-ova, bez WebGL." Odmah posle toga kaže: "animirani čestični tok vode može zahtevati Canvas fallback."

Problem: ovo su dve kontradikcije u istom dokumentu. Ako čestice vode zahtevaju Canvas, onda nisi implementirao igru u čistom CSS-u — implementirao si hybrid koji niko nije testirao u jednoj dev sesiji na ovom projektu. CSS `transform: rotate(45deg) scaleY(0.5)` na grid elementima funkcioniše za statičan layout. Čim počneš da animiraš desine, pedesine, stotine čestica vode koje se gravitaciono kreću po izometrijskom griidu — browser rendering pipeline postaje nepredvidiv na mobilnom.

**Severity:** Kritičan. Ako Mile počne GDD pretpostavljajući "CSS sa Canvas fallback, videćemo", završiće sesiju sa half-baked rešenjem koje ne izgleda ni kao CSS ni kao Canvas.

**Predlog rešenja:** Odluka pre GDD-a. Ili: (a) čestice vode su CSS-only, ali su stilizovane i abstraktne — ne realistični fluid, nego pulsing opacity na tile-ovima koji predstavljaju tok; ili (b) cela igra ide u Canvas/PixiJS od starta, isometric transform se radi programski. Hibrid nije opcija za jednu sesiju.

---

### 2. Hidraulična simulacija 0.4 l/s — matematika koja ne prašta greške u GDD fazi

Sistem zahteva: gravitacioni tok između 3 jezera na različitim visinama, tile troškovi protoka (0.05 / 0.08 / 0.16 l/s), pH dinamiku koja je funkcija pataka + biofiltera + protoka, random event koji privremeno menja izvorni kapacitet na 0.2 l/s.

Ovo su 4 međusobno zavisne varijable koje se menjaju svake "nedelje". Svaka promena jedne utiče na ostale. Concept ne definiše: kojim redosledom se računaju? Je li pH funkcija protoka te nedelje ili akumuliranog stanja prethodnih nedelja? Šta se dešava ako suša (0.2 l/s) dođe u nedelji kad igrač ima tile-ove koji troše 0.31 l/s — da li sistem samo blokira, ili postepeno oduzima vodu od jezera po prioritetu?

**Severity:** Kritičan. Ovo nije "tuning posle playtestinga." Ovo je state machine koja mora biti definisana pre nego što Mile napiše jednu jedinu funkciju. Ako GDD ostavi ove praznine, implementacija će biti puna `if/else` krpljenja koje niko ne razume posle 48 sati.

**Predlog rešenja:** Sine ili Iskra pišu pseudokod simulation loop pre GDD-a. Jedna stranica. Redosled operacija, šta blokira šta, šta je hard cap a šta soft degradacija. Mile implementira po tom pseudokodu, ne po slobodnoj interpretaciji concept.md-a.

---

### 3. Multi-layer debugovanje bez vizualnog bug-checking nije opcija

Macro (planning) + Micro (4s simulacija) + Meta (localStorage) = 3 sloja stanja koja moraju biti konzistentna. Concept kaže da igrač "ne može da menja tile tokom simulacije" — što je dobra dizajn odluka. Ali to znači da developer tokom testiranja ne može interaktivno da vidi šta se dešava interno tokom simulacije.

Ako ribe uginu u nedelji 7, igrač (i developer) vide krajnji rezultat, ne uzrok. Je li pH pao zbog pataka? Zbog zatvorenog biofiltera? Zbog suše random eventa koji se okinio pre nego što je simulacija završena? Concept ne definiše debug mode niti logging.

**Severity:** Kritičan za dev sesiju. Bugs u simulation logic-u bez visibility alata znači da Mile provodi 60% sesije guessing-om umesto implementacijom.

**Predlog rešenja:** GDD mora da uključi developer-only debug panel (toggle sa keyboard shortcut) koji prikazuje state svakog tile-a i svake varijable na kraju svakog simulacionog koraka. Ovo nije feature za igrača — ovo je alat bez kojeg se igra ne može testirati.

---

## P2 — Ozbiljni rizici (oštećuju iskustvo)

### 4. UI čitljivost na mobilnom — izometrijski 24px tile-ovi su nečitljivi

24px tile-ovi na izometrijskom gridu. HUD sa live vrednostima: protok, pH, score, nedelja. Plus patke, ribe, animirani tok vode. Na desktop monitoru — možda. Na 375px wide mobilnom ekranu u landscape modu — ne.

Izometrijski grid na mobilnom je poznato graveyard mobilnih web igara. CSS transform koji izgleda dobro na 1920px postaje zamrljana mreža linija na 375px. Tilovi postaju nemogući za tap — 24px tile na izometrijskom griidu ima efektivnu touch surface od ~15px, što je ispod Apple HIG minimuma od 44px.

**Severity:** Ozbiljan. Concept eksplicitno kaže da je QR-kod-na-imanju use case — što znači mobilni je primary. Ako igra ne radi na mobilnom, brand-utility argument pada.

**Predlog rešenja:** Ili povećaj tile-ove na minimum 48px efektivne touch surface, ili napravi poseban mobilni layout koji nije izometrijski (top-down 2D za mobilne, izometrijski za desktop). GDD mora da specificira koji layout je MVP.

---

### 5. "12 nedelja" — session length koji nije rezolviran

Concept kaže: "Jedna igra: 8–12 minuta." Ali ne objašnjava šta se dešava tokom tih 8–12 minuta. 12 × Planning Phase (koliko traje planiranje jedne nedelje?) + 12 × 4s Micro simulacija = 48 sekundi čiste simulacije. Ostatak je na igraču.

Ako igrač spor i misli — igra traje 25 minuta. Ako je brz i impulsivan — 4 minute. Ni jedno ni drugo nije "daily game format" koji concept obećava. Daily game format znači predvidivo, konzistentno vreme sesije — kao Wordle (2 minuta), ne kao Civilization ("još jedna nedelja").

**Severity:** Ozbiljan. Daily game format je core value proposition. Ako session length nije bounded, retencija pada i GDG platforma integracija nema smisla.

**Predlog rešenja:** Dodaj timer per Planning Phase — npr. 60 sekundi za odabir akcija, posle čega se automatski pokreće simulacija. Ili eksplicitno reci: igra nije time-bounded, a "daily game" se odnosi samo na calendar unlock, ne na session duration. Jedno od dvoje — ne oboje.

---

### 6. Random events + difficulty balans u jednoj sesiji — matematički nemoguće bez podataka

Concept definiše random event verovatnoće: suša 15%, patka jato 10%, kontaminacija 8%. Ove brojeve niko nije testirao. U 12 nedelja, igrač može da dobije 0 random eventa ili 4 uzastopna. Sa 15% suša šansom, očekivana vrednost je ~0.75 suša po run-u — ali varijansa je visoka. Faza B sa samo 2 akciona poena i striktnijim pH opsegom [7.0, 8.0] u kombinaciji sa suša eventom može biti matematički nepopravljiva situacija.

**Severity:** Ozbiljan. Frustracija iz "mathematically unfair" situacije je najbrži put do uninstall-a (ili u ovom slučaju — nikad više ne otvaranja igre).

**Predlog rešenja:** Implementiraj pseudo-random event scheduling umesto pure random. Npr. garantovano jedna suša između nedelje 4–8, ali njena tačna pozicija je random. Ovo daje consistency bez eliminacije iznenađenja. Concept već pominje event blackout za prve nedelje — proširi tu logiku na ceo event sistem.

---

## Brand-utility kritika

### Da li je "Akva-Sklop za Guncati" zaista utility — ili je to themed game sa Guncati bojama?

Ovo je najvažnije pitanje i concept ga ne razrešava direktno.

**Šta igra zaista komunicira o Guncati specifično:**
- 0.4 l/s izvorni kapacitet — ovo je stvarni podatak. Dobar.
- 3 jezera na različitim visinama — stvarna fizička konfiguracija. Dobar.
- "Gravitacioni tok, biofiltacija, zatvoreni vodni krugovi" — ovo su principi permakulture generalno, ne Guncati specifično.

Skini Guncati brend sa igre. Ostaje ti: permakulturna farma u neimenovanoj Srbiji, sa generičkim vodnim sistemom koji bi mogao biti bilo koja imanje u regionu. "Brana" je generički karakter bez specifičnog lica ili glasa.

**"Guncati Knows" kartice — problem verifikacije i specifičnosti:**

Concept prikazuje primere kartica:
- "Patke filtriraju do 2l/h od organskih čestica" — ovo je opšta biologija, ne Guncati.
- "Biofilter od šljunka povećava pH za 0.2–0.4 u idealnim uslovima" — opšta hidroponija.
- "Gravitacioni pad od 1m na 10m daje dovoljan pritisak za pasivni tok" — fizika.
- "Suša smanjuje izvorni protok i do 60% u avgustu" — moguće da je specifično za Guncati lokaciju, ali nije navedeno.

Od 4 primera, 0 su Guncati-specifični. Ako "Guncati Knows" kartice sadrže opštu permakulturnu edukaciju, onda je igra edukativna igra o permakulturi — ne brand asset za Guncati.

**Šta se gubi ako Guncati postane generic "permakulturno imanje":**

Izgubi se: investitor narativ ("12 nedelja do stabilnog ekosistema" kao pitching tool), QR kod na imanju use case (zašto bi posetilac skenirao QR kod koji vodi na generičku igru?), i lead magnet veza sa guncati.rs.

Ostaje: edukativna igra o vodnom menadžmentu koja može da se rebranduje za bilo koji permakulturni projekat.

**Zaključak o brand-utilityu:**

Igra može biti genuine Guncati asset, ali samo ako "Guncati Knows" kartice sadrže informacije koje posetilac imanja ne može da nađe na Wikipedia-u. Konkretno: stvarni pH merenja sa Guncati jezera u različitim godišnjim dobima, stvarni flow rate podatak Guncati izvora po mesecima, specifični biofilter dizajn koji Brana koristi sa real-world rezultatima. Bez toga — igra je permakultura edukacija sa Guncati logom.

**Ovo je korekcija koju Sine/Iskra moraju da urade pre GDD-a.** Concept.md mora da specificira minimum 8 "Guncati Knows" kartica sa konkretnim, verifikovanim, Guncati-specifičnim podacima. Ako Brana ne može da isporuči te podatke — igra se rebranduje kao generic, ili se ne pravi.

---

## Preporuke za Mile (GDD)

1. **Ne počinjaj GDD dok nema simulation loop pseudokoda.** Jedan dokument, jedna stranica, koji definiše redosled računanja pH, protoka, health-a — po nedelji. Mile implementira taj pseudokod, ne interpretira concept.

2. **Odluči renderer pre prvog reda koda.** CSS-only (abstraktne animacije, bez čestica) ili Canvas (realistični tok, više dev vremena). Nema hibrid opcije u jednoj sesiji. Preporuka: CSS-only za MVP, Canvas kao post-launch enhancement.

3. **Implementiraj debug panel od dana 1.** Keyboard toggle koji prikazuje state svakog tile-a, svake varijable, na kraju svakog simulacionog koraka. Bez ovoga — bugovanje simulation logic-a je guessing game.

4. **Bounded Planning Phase.** Ili timer (60s po nedelji), ili eksplicitno odustati od "daily game" pozicioniranja. Bez ovoga — session length je undefined i GDG platforma integracija nema smisla.

5. **Pseudo-random event scheduling umesto pure random.** Definiši event slots unapred (npr. jedna suša garantovano između nedelje 4–8), randomizuj samo poziciju unutar slota. Ovo je implementirano za jedno popodne i eliminiše "mathematically unfair" frustraciju.

---

## Verdict

**drži uz korekcije**

Concept ima solidnu kosti: jasan win/lose sistem, dobro definisan macro/micro loop, legitimna brand-utility veza sa Guncati. Nije prazna ideja.

Ali ne sme da ide u GDD dok se ne razreše sledeće tačke:

**Sine/Iskra moraju da isporuče pre nego što Mile počne GDD:**

1. **Simulation loop pseudokod** — redosled operacija, šta blokira šta, edge cases za suša + prekoračenje protoka. Jedna stranica, nije opciono.
2. **Renderer odluka** — CSS-only ili Canvas. Napisati eksplicitno u concept reviziji.
3. **Minimum 8 Guncati-specifičnih "Guncati Knows" kartica** — verifikovani, konkretni, ne-Wikipedia podaci koje Brana potvrdi. Ako ovo nije moguće → rebrand na generic ili cancel.
4. **Session length odluka** — timer po Planning Phase, ili eksplicitno odustajanje od "daily game" formata.
5. **Mobile layout odluka** — izometrijski na mobilnom (sa većim tile-ovima) ili top-down 2D fallback za mobilne. QR-kod use case zahteva jasan odgovor.

Ako ove 5 tačaka budu razrešene — igra je gradiva u jednoj solid dev sesiji i ima pravi brand-utility potencijal. Bez njih — Mile gubi sesiju na odluke koje su trebale biti donesene pre.

---

*Nega Negovanović, devil's advocate*
*Gari Daily Games tim*
