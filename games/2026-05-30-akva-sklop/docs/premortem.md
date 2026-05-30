# Akva-Sklop — Premortem

**Autor:** Nega Negovanović (devil's advocate)
**Datum:** 2026-05-30
**Status concept-a:** drži uz korekcije

---

## Ocena: drži uz korekcije

Concept ima jasnu premisu, konkretnu brand vezu i potencijal da bude jedna od boljih igara u GDG portfoliju. Ali ima tri mesta gde može da pukne pre nego što bilo šta postane playable — i jedno fundamentalno pitanje o brand utility koje concept još nije iskreno odgovorilo. Mile ne sme da počne GDD dok se ova pitanja ne zatvore.

---

## P1 — Showstopper rizici (blokiraju launch)

### P1.1 — Isometric CSS grid: izvodljivo, ali animirani tok je drugi problem

**Severity: HIGH**

Statičan 2.5D izometrijski CSS grid od 24px tile-ova je izvodljiv u jednoj impl sesiji. To je 6–8h posla, ima dovoljno CSS transform precedenata.

Problem nije grid. Problem je "animirani čestični tok vode" koji concept opisuje kao centralni vizuelni element. Čestični sistemi u čistom CSS-u su hack — bukvalno `animation-delay` na stotinama div elemenata. Na mobilnom to ubija frame rate. Canvas fallback nije opcija za MVP ako je ceo grid CSS — mešanje rendering konteksta za isti vizuelni prostor je složeno i sklono bug-ovima.

**Ako tok nije vizualno uverljiv, igra gubi centralni estetski argument.** Mini Metro radi zato što tok vizualno funkcioniše. Akva-Sklop koji "planiraš" bez vizuelnog feedbacka protoka postaje tabela sa slikama.

**Predlog rešenja:** Mile treba da napravi throwaway prototip SAMO toka vode (bez ijedne game mehanike) u prvom 2h sessiona. Ako čestični CSS tok ne radi na mobilnom — odmah na Canvas za tok, CSS za grid. To nije blocker ako se odluči rano. Blocker je ako se otkrije u nedelji 3 implementacije.

---

### P1.2 — Hydraulička simulacija: matematika je upravljiva, ali debagovanje nije

**Severity: HIGH**

0.4 l/s hard cap sa tile troškovima (0.05, 0.08, 0.16 l/s) nije matematički kompleksna simulacija — to je sabiranje. Ta logika se piše za sat vremena.

Pravi problem je **debagovanje emergentnih stanja** bez vizuelnog bug-checkinga:

- pH fluktuira zbog pataka → biofilter kompenzuje → protok pada → ribe umiru u nedelji 9
- Ovaj lanac uzročnosti treba biti providan igraču, ali i developeru koji debuguje

Concept kaže igrač može da "pauzira simulaciju i vidi tooltip state svakog tile-a" — ali tooltip implementacija za svaki tile u svakom simulacionom koraku je netrivijalna. Ako tile state nije eksponiran u debug modu od prvog dana, Mile će debugovati simulacione bug-ove slepo.

**Edge case koji concept pominje ali ne rešava:** suša (random event) može da gurne ukupnu potrošnju iznad novog kapaciteta (0.2 l/s), a planning phase to nije blokirala jer je tada limit bio 0.4. Ovo je garantovani game-breaking edge case koji se otkriva tek u playtestingu ako nema debug visibility.

**Predlog rešenja:** Pre bilo kojeg gameplay koda — napraviti tabelu stanja (JSON dump svakog tile-a svakim simulacionim korakom, vidljiv u dev modu). Bez toga, balansiranje je pogađanje.

---

### P1.3 — Multi-layer arhitektura (macro + micro + meta) u jednoj impl sesiji: realan rizik scope creep-a

**Severity: MEDIUM-HIGH**

Tri sloja su konceptualno elegantna. Implementaciono, to su tri odvojena state machine-a koja moraju da komuniciraju:

- Planning Phase (React/JS state): tile placement, action point tracking, live preview
- Simulation Phase (animation loop): particle flow, animal behavior, pH calculation
- Meta layer (localStorage): card unlocks, run history, difficulty progression

Svaki od ovih slojeva je samostalna igra. Zajedno, u jednoj impl sesiji od 6–8h, to je rizičan scope.

**Konkretan scenario otkaza:** Mile implementira Planning + Simulation (layers 1+2), ostaje mu 1h u sesiji. Meta layer (Guncati Knows kartice, Faza C unlock) ide "za posle." Posle ne dolazi — igra se pušta bez meta progression i retention hook-a koji je jedini razlog zašto igrač dolazi drugi put.

**Predlog rešenja:** Eksplicitno označiti meta layer kao "post-launch feature" u GDD-u, ne kao MVP. MVP = Planning + Simulation + win/lose stanje. Kartice su v1.1. Ovo mora biti svesna odluka, ne "videćemo."

---

## P2 — Ozbiljni rizici (oštećuju iskustvo)

### P2.1 — UI čitljivost na mobilnom: tile grid + HUD zajedno su pretrpan ekran

Izometrijski 2.5D grid na mobilnom ekranu (375px širina) sa 24px tile-ovima daje otprilike 15 tile-ova po redu. To je mala površina za "jezero, drenaže, biofiltere, patke i ribe" sve u isto vreme. HUD oduzima dodatnih 60–80px vertikalno.

Igrač u Planning Phase mora da vidi: mapu, HUD vrednosti, live preview protoka, i action point counter. Na desktopu to je udobno. Na mobilnom je konfuzno.

Concept ne adresira touch targets za tile placement (tap na 24px tile sa prstom = preciznost od 44px minimum po Apple HIG). Ovo nije estetski problem — ovo je funkcionalni problem koji ubija playtestere.

**Konkretan predlog:** Grid ne sme biti manji od 32px tile-ova na mobilnom, ili treba eksplicitno dizajnirati mobile-first layout sa scroll-able mapom i fiksiranim HUD-om. Jedno od dvoje — ne oboje.

---

### P2.2 — "12 nedelja" session length: concept kaže 8–12 minuta, ali to nije testirano

Concept tvrdi "jedna igra = 8–12 minuta." Ta procena počiva na:
- 12 nedelja × (Planning Phase + 4s Simulation) = minimalno 48 sekundi čiste animacije
- Plus razmišljanje, čitanje tooltipova, random event resolving

Realnost: igrači ne razmišljaju brzo u novim sistemima. Faza 0 tutorial koji "traje 4–5 minuta" može lako biti 12 minuta za igrača koji prvi put vidi izometrijski grid sa flow simulacijom.

**Problem je asimetričan:** Ako sesija traje 20 minuta — daily game format puca. Ovo nije igra za podzemnu železnicu. Ako sesija traje 5 minuta — engagement je premalen za meta progression i brand storytelling.

**Decision needed:** Playtestirati tutorial sa 3 osobe koje nikad nisu videle igru. Ako prosečno vreme prelazi 10 minuta, smanjiti broj nedelja ili ubrzati simulaciju. 12 nedelja je flavor broj, ne mehanička nužnost.

---

### P2.3 — Random eventi + difficulty balansiranje: nemoguće bez playtesting pipeline-a

`SUŠA` na 15%, `PATKA JATO` na 10%, `ŠUMSKA KONTAMINACIJA` na 8% — ovi procenti su izmišljeni. Concept to ne krije (tražen je Nega review), ali GDD ne sme da nasledi ove brojeve kao "gotove."

Problem: balansiranje random eventa bez playtesting infrastructure nije balansiranje — to je pogađanje. Svaka od tri Faze (0, A, B) ima drugačiji action point budget i drugačiji pH opseg, što znači da isti random event ima drugačiji impact u svakoj Fazi.

**Konkretan scenario otkaza:** `SUŠA` u Fazi B (2 akciona poena, striktni pH [7.0, 8.0]) + igrač koji nema pump tile → instant lose bez ijedne greške igrača. Frustration, uninstall.

**Predlog:** Random eventi u MVP idu na fiksne nedelje (scripted events), ne na probability. Probability sistem dolazi u v1.1 kada postoji playtesting data. Scripted eventi su predvidivi, mogu se balansirati bez statistike.

---

## Brand-utility kritika

### Ključno pitanje: da li je Akva-Sklop zaista utility za Guncati, ili je "themed game" sa Guncati etiketom?

Ovo je najosetljivije mesto concept-a i jedino gde Nega mora biti oštra.

**Šta concept tvrdi:** Parametri (0.4 l/s, 3 jezera, gravitacioni tok) su direktno iz stvarnog plana. Igrač koji igra 3 puta razume logiku bolje od PDF-a.

**Šta concept ne dokazuje:** Da li igrač koji završi 3 run-a zaista razume nešto specifično o Guncati što ne bi naučio iz bilo koje permakuturne igre sa istom mehanikom?

Odgovor zavisi od jednog elementa: **"Guncati Knows" kartice.** Ako su te kartice generičke ("biofilter od šljunka povećava pH") — igra je permakuturna igra sa Guncati logom. Ako su kartice konkretne ("Brana je primetio da pH pada svaki put posle kiše zbog glina na parceli 4") — igra je stvarno Guncati.

Concept navodi primer kartice: "Gravitacioni pad od 1m na 10m daje dovoljan pritisak za pasivni tok." To je generički hidrološki fakt. To nije Guncati znanje. To je Wikipedia.

**Šta se gubi ako Guncati postane generic "permakulturno imanje":** Sve. Brand utility pada na nulu. Ostaje igra koja je lepa ali koja ne opravdava partnerstvo, ne gradi Guncati brand, i ne može biti pitching tool za investitore koji ne vide razliku između Guncati i bilo koje druge farme.

**Konkretan test:** Uzmi 5 "Guncati Knows" kartica iz concept-a i pitaj: "Da li ovu karticu mogu da koristim u igri o bilo kojoj permakulturnoj farmi na Balkanu?" Ako je odgovor "da" za više od 2 kartice — igra nema dovoljno brand specifičnosti.

**Predlog:** Pre GDD-a, Sine/Iskra moraju da sednu sa Branom i izvuku minimum 8 kartica koje su nedvosmisleno Guncati-specifične. Ne generički principi — konkretne opservacije, konkretni brojevi sa konkretnih parcela, konkretni propusti i naučene lekcije. Bez toga, brand utility je marketing copy, ne stvarnost.

---

## Preporuke za Mile (GDD)

1. **Throwaway prototip toka vode pre ijedne linije gameplay koda.** 2h, samo vizualizacija protoka na izometrijskom gridu, na mobilnom uređaju. Ako ne radi u CSS-u — Canvas za animacije, CSS za grid tiles. Ova odluka mora biti doneta pre GDD-a, ne tokom implementacije.

2. **Meta layer (Guncati Knows kartice, Faza C vizualizacija) eksplicitno izvan MVP scope-a.** GDD označava ove feature-e kao "v1.1 — post-launch." MVP = Planning Phase + Simulation Phase + win/lose screen. Sve ostalo je bonus.

3. **Scripted eventi umesto probability sistema za MVP.** `SUŠA` se okida u nedelji 6, tačno. `PATKA JATO` u nedelji 8. Ovo je testabilno i balansirabilno bez playtesting pipeline-a. Probability sistem dolazi kada postoji data.

4. **Tile veličina na mobilnom minimum 32px, ne 24px.** Touch target problem je deal-breaker za daily game format — igra se igra u podzemnoj, u redu za kafu, jednom rukom. Ili dizajnirati scroll-able mapu sa fiksiranim HUD-om, ili povećati tile-ove. Ne oboje, ne kompromis.

5. **Session length playtesting pre finalizacije 12-nedelja formata.** Dati tutorial-u 3 prve osobe koje ne znaju ništa o igri. Ako prosek prelazi 10 minuta — smanjiti na 8 nedelja ili ubrzati simulaciju na 2s. 12 nedelja je narrativno motivisan broj. Mehanički, 8 nedelja radi isti posao sa manjim rizikom od session fatigue.

---

## Verdict: drži uz korekcije

**Šta Sine/Iskra mora da koriguje pre nego što Mile počne GDD:**

1. **CSS flow vizualizacija feasibility** — dobiti eksplicitnu potvrdu od Mile da li je čestični tok u CSS-u izvodljiv na mobilnom, ili dokumentovati Canvas fallback kao plan A.

2. **Meta layer scope** — eksplicitno isključiti iz MVP i napisati to u concept-u, ne ostaviti kao "videćemo."

3. **Guncati-specifične kartice** — sedeti sa Branom, izvući minimum 8 kartica koje su nedvosmisleno Guncati, ne generički permakulturni fakti. Bez ovog koraka, igra nije brand utility tool — to je lepa igra sa pogrešnim logom.

Ako ove tri tačke budu zatvorene — Mile dobija čist GDD brief. Igra ima potencijal da bude flagship GDG naslov za 2026. Ali samo ako se brand utility dokaže, ne pretpostavi.

---

*Nega Negovanović*
*Gari Daily Games — Devil's Advocate*
