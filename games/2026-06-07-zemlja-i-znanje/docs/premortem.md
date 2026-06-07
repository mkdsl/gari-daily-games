# Premortem: Zemlja i Znanje

**Autor:** Nega Negovanović — Kritički Analitičar & Devil's Advocate
**Datum:** 2026-06-07
**Input:** concept.md (Iskra Ivanović)

---

## Verdict: drži uz korekcije

Koncept je solidan i brand-utility sprega je jedna od jačih u poslednjih mesec dana. Ali igra ima tri strukturalna rizika koja, ako se ne adresiraju u GDD fazi, mogu srušiti iskustvo: (1) dual-layer tajming problem u micro sesiji, (2) scope koji je realno 1.5 impl sesija, ne 1, i (3) onboarding koji može izgubiti igrača pre nego što hook uopšte uđe. Uz precizne korekcije — igra prolazi.

---

## Showstopper rizici

### SS-1: Micro layer je igra-u-igri i nema prototipa u GDD
Tajmlajn traka + metar energije po osobi + incident queue + decision cards — to su četiri simultane mehanike u jednom ekranu. Nijedna sama po sebi nije komplikovana, ali zajedno zahtevaju dizajn koji mora biti istestiran pre implementacije. Ako Mile ne napiše konkretan tok korisnika (šta igrač gleda prvog sekunde, čim crta mišem, kojim redom reaguje na incidente) — Jova implementira nešto što ne funkcioniše, a to se otkriva tek u beta fazi. **Showstopper jer micro layer je 60% gameplay vrednosti ove igre.**

### SS-2: Izometrijska Canvas scena bez frameworka
Concept kaže "izometrijski pogled na imanje (Canvas, bez frameworka)". Izometrijsko iscrtavanje sa animiranim figuricama, promenom svetlosti po dobu dana i CSS filterima — nije trivijalno. Ako Pera Piksel i Jova nemaju precizno dogovorenu granicu šta je Canvas i šta je DOM overlay, render.js i session-ui.js postaju konfliktna zona. U jednoj impl sesiji, ako iscrtavanje ne radi do 4c faze, sve ostalo kaže: 4f sa share.js i brand hookovima neće stići. **Showstopper ako se ne napravi jasna render granica pre implementacije.**

### SS-3: Onboarding nula
Concept opisuje hook odlično — ali ne opisuje kako igrač uči. Igra ima makro planer, micro sesiju, incident queue i prestiž sistem. Igrač koji otvori igru prvi put i vidi "planiranje sezone" bez objašnjenja će zatvoriti u 90 sekundi. Nema pomenutog tutoriala, nema guided first season, nema tooltip sloja. Ako Mile ne dizajnira guided first season (prva sezona = malo decision cards, manji polaznici, poznati incident) — igra nije za ljude koji dolaze sa Guncati landing page-a. **Showstopper jer brand-utility vrednost pada na nulu ako igrač ne preživi prvih 5 minuta.**

---

## Implementacioni rizici

### IMP-1: 65 modula u jednoj impl sesiji — nerealno bez rezova
Gruba računica: 65 modula × prosečno 120–180 linija = 7800–11700 linija. To je u opsegu multi-layer cap-a (8000–12000 za single-layer, 18000–28000 za multi-layer). Problem nije broj linija nego **broj međuzavisnih modula koje Jova mora da zakači u jednoj sesiji**. Macro state mora biti gotov pre micro state, participant-profiles moraju biti gotovi pre incident-generator, unlock-manager mora čitati i macro i meta — graf zavisnosti je dubok. Ako implementacija krene bez scaffold-a, 4c/4d paralelizacija ne funkcioniše.

**Rizik:** Jova uradi 4a scaffold solidno, 4b/4c krenu paralelno, ali micro layer (16 modula) ostane na stubovima jer 4c preuzme systems faza i jede vreme. Rezultat: igra koja ima macro planer ali ne može da pokrene sesiju. Deploy ide, igra je broken.

### IMP-2: instructor-ai.js je skrivena kompleksnost
`src/micro/instructor-ai.js` u listi modula izgleda kao jedan fajl. Ali "AI instruktora" koji reaguje na incident queue, utiče na satisfaction-calc i ima kapacitet/raspoloživost parametar — to je mini behavior sistem. Ni concept ni GDD (još nepostojeći) ne definišu koliko je ovaj modul složen. Postoji rizik da Jova implementira stub koji ništa ne radi (jer nema vremena), a beta faza dobija prazan instructor slot.

**Preporuka:** instructor-ai.js treba da bude u GDD eksplicitno razrađen, ili potpuno elimisan i zamenjen pasivnim "staff bonus" sistemom koji se rešava kao config tabela, ne kao AI.

### IMP-3: Web Audio proceduralna sinteza za 5 audio zona
Concept navodi jutro/rad/pauza/incident/prestiž crescendo — to je 5 različitih audio konteksta sa proceduralno generisanim zvucima. Ceca Čujka mora implementirati sve to u jednoj audio.js sesiji. Ovo je ostvarivo (Ceca je dokazana u prethodnim igrama), ali `src/audio.js` mora dobiti detaljan brief od Mile pre nego što Ceca krene — koji oscilatori, koji timing, koji trigger iz session-runner.js. Bez briefa, audio ostaje ambient-only, a incident zvuk i prestiž crescendo se izostavlja.

### IMP-4: localStorage save za multi-layer state je netrivijalan
`src/save.js` mora serializovati macro state, micro state i meta state zajedno. Ako igrač izađe usred micro sesije — šta se čuva? Poluzavršena sesija? Auto-resolve? Parcijalna sesija koja se može nastaviti? Concept ne definiše ovo. Bez jasnog save kontraka u GDD, Jova improvizuje, i to se manifestuje kao "igra se resetuje" bug u beta fazi.

---

## Gameplay rizici

### GP-1: Micro sesija može biti stresna na pogrešan način
Tajmlajn traka + energija + incident queue + decision cards simultano — ako pacing nije precizno kalibrisan, igrač ne oseća "izveo sam to" nego "preživeo sam to". Razlika je u tome da li incidenti dolaze sa prostorom za razmišljanje ili kao flood. Ako incident generator nema cooldown i weight sistem — tri incidenta u 60 sekundi nije zabavno, to je panika. Concept opisuje "donosi odluke u sekundi" kao pozitivno — to mora biti pozicionirano kao kratak intenzitet, ne kao default tempo cele sesije.

**GDD mora definisati:** max 1 aktivan incident u queue u isto vreme za prvu sezonu, rast do max 2–3 u prestiž runovima.

### GP-2: Macro layer može biti dosadan u tranziciji
Između dve micro sesije, igrač se vraća u macro planer. Ako macro planer nema animaciju, zvuk ni dinamiku — samo forme za popunjavanje — to je administrativni posao, ne igra. Concept to opisuje dobro retoričko ali ne daje konkretne mehanike koje čine macro zabavnim. "Biraš temu i postavljaš cenu" može biti dosada ako nema vizuelni feedback (polaznici koji čekaju, budžet koji se napinje, stručnjak koji kaže nešto kad ga angažuješ).

**Risk:** Igrač igra micro sesiju 5 minuta, vrati se u macro za 30 sekundi koji izgleda kao spreadsheet, i zatvori. Prestiž hook je nedostupan ako igrač ne stigne do 5. sezone.

### GP-3: 4–18 polaznika kao ikonica — crtanje individualnih figurica
Concept kaže "svaka osoba je ikonica sa individualnom energijom i znatiželja stat-om". 18 animiranih CSS ikonica sa individualnim state-om je implementaciono moguće ali vizuelno kaotično. Ako su sve ikonce iste veličine, nikad ne vidiš šta se dešava s konkretnim polaznikom. Ako su individulane, render loop postaje spor na mobilnom.

**Preporuka:** 4–8 polaznika za prvu sezonu kao hard lock (ne "4–18 po izboru"). 18 polaznika je prestiž unlock, ne default.

### GP-4: Reputacija 0–1000 i "Živo Učilište" achievement su daleko
Prosečna sesija je 15–35 minuta. Dostigni 1000 reputacije sa 500 polaznika — to su višestruki prestiž runovi, dakle višestruki sati. Za web igru koja mora da "zakači" u prvih 15 minuta, dugoročni win condition mora biti praćen kratkoročnim nagradama na svakih 5–10 minuta. Concept pominje achievements ali ne daje dovoljno gustinu milestona u prvoj sezoni. Igrač koji otvori igru, odigra prvu sezonu i vidi "reputacija: 87/1000" neće nužno nastaviti.

**GDD mora definisati:** minimum 3 vidljive nagrade u prvoj sezoni (achievement, unlock, prestiž preview) — ne posle 5 sezona.

---

## Brand-utility kritika

### Guncati sprega: DRŽI — ali samo ako je landing link aktivan

Mehanika "plaćaš da radiš" direktno modeluje Guncati Tom Sawyer format. Svaka masterclass tema u igri (suvozid, rammed earth, inokulacija, akvakultura) je stvarna Guncati aktivnost. Igrač koji preživi 15+ minuta razume model pre nego što ikad pročita marketing tekst. To je jača conversion tačka od bilo kog carousel-a.

**Problem:** Concept kaže "link ka Guncati web (placeholder: `https://guncati.rs`)". Ako link ostane placeholder na release dan — brand-utility vrednost je nula. Mora biti aktivan URL na dan deploya ili "dolazak uskoro" stranica sa email capture.

**Drugi problem:** Share karta ("Sezona 3: 14 polaznika, 94% zadovoljstvo, 2.800€ prihod") je izvrstan mechanic — ali mora imati Guncati logo i tagline u template. Ako share karta izgleda kao generička igra bez brenda — Instagramabilnost pada. Pera Piksel mora dobiti brief za share kart template.

### MKDSLend sprega: DEKORACIJA — može postati jača

Concept kaže "indirect" i to je tačna procena. MKDSLend se ne vidi u gameplay-u — samo u meta poruki. Ako Mile u GDD postavi achievement "Zabavni radni park" koji se otključava posle prvog prestiža sa flavortext-om "Guncati nije više imanje — postalo je destinacija" — to daje MKDSLend prisustvo bez silovanja koncepta.

### Kluboslavija sprega: PRESLABA

"Muzika i Prostor" masterclass tema kao later-season unlock je razumna ideja, ali nije garantovana — zavisi od toga da li igrač dostigne to otključavanje. Za event koji je 20.06 (13 dana) ova igra ne može biti Kluboslavija asset ako je hook dostupan tek posle 3 prestiž ciklusa. Ili se ta tema stavi u sezonu 2 (dostupna u prvoj sesiji igranja) — ili se Kluboslavija link u igri skroz izbaci, da ne kvari fokus.

**Preporuka:** Izbaci Kluboslavija hook iz koncepta. Igra je Guncati asset. Fokus je jak ako ostaje samo Guncati + MKDSLend indirect.

---

## Scope procena i rezovi

### Realna procena: 65 modula je 1.3–1.5 impl sesija

Ako Jova radi 4.5h sa dobrim scaffold-om i jasnim GDD-om, realnoočekivano jest:
- Macro layer (18 modula): 12–15 fajlova implementirano, 3 ostaju stub
- Micro layer (16 modula): 10–12 fajlova, timing-engine i instructor-ai na stub
- Meta/Core/Content/Styles: 90% završeno
- **Rezultat: igra koja radi ali ne završi micro sesiju potpuno.**

Ovo je neprihvatljivo za deploy. Bolje rezati scope nego imati broken core.

### Predloženi rezovi (ne menjaju koncept, samo scope)

**Rez 1 — instructor-ai.js eliminisan, zamenjen passive-bonus**
Umesto AI logike: stručnjak (Brana/Alatko/Cana) daje pasivni bonus na satisfaction-calc ako je angažovan i prisutan. Jedan config parametar po stručnjaku. Štedi 150–200 linija kompleksne logike, nema gubitka gameplay vrednosti.

**Rez 2 — weather-forecast.js i weather-runtime.js spojeni u jedan weather.js**
Macro prognoza i micro efekat vremena su isti podatak u različitim kontekstima. Jedan modul, jedan state, dva view-a. Štedi jedan fajl i 80 linija dupliranja.

**Rez 3 — leaderboard-local.js odložen (ne u v1)**
Local leaderboard je nice-to-have, ne core. Taj fajl daje 0 gameplay vrednosti u prvom runu i može se dodati u polish sesiji ako stigne. Štedi ~80 linija + LocalStorage kompleksnost.

**Rez 4 — era-manager.js odložen**
Era manager (multi-prestiž napredna logika) je relevantan tek od trećeg prestiža. Prestiž 1 i 2 mogu se rešiti direktno iz prestige.js. Era-manager može biti stub koji se popuni u polish sesiji ili sledećoj igri.

**Rez 5 — Broj polaznika hard lock na max 8 u v1**
Vizuelni i compute teret 18 animiranih figurica nije neophodan za day-1 deploy. Max 8 polaznika, 18 je prestiž unlock. Štedi render kompleksnost i simplifikuje participant-manager.js za 40%.

**Po ovim rezovima: efektivno 60 modula, realnih implementiranih ~55.** To je još uvek solidna multi-layer igra.

### Ako impl sesija krene da kasni (token/vreme cap)

Prioritet redosled ako mora da se seče u letu:
1. Macro layer mora biti 100% funkcionalan (sezona se može isplanirati)
2. Micro layer mora imati barem timeline + incident + decision cards (energija po osobi može biti agregat, ne per-person)
3. Meta (reputacija + achievements) mora prikazivati end-of-season screen
4. Audio može biti samo ambient loop + jedan incident SFX (bez prestiž crescendo)
5. Share.js je poslednji — ako ne stigne, igra se deploya bez share funkcionalnosti

---

## Preporuke za Mile (GDD fazu)

**M-1: Definiši micro session flow kao korak-po-korak UX, ne samo mehanike**
Tačno nacrtaj: šta igrač vidi na ekranu sekund 0 micro sesije, šta se menja u sekundi 30, kada ulazi prvi incident, koliko traje decision card. Bez ovog, Jova implementira nešto što ne odgovara konceptu.

**M-2: Incident queue — definiši weight sistem i cooldown**
Minimum: svaki incident ima weight (1–5) i cooldown (sekunde pre sledećeg iste vrste). Ukupan incident intenzitet po dobu dana (jutro = nizak, pre pauze = visok, posle ručka = nizak, pred kraj = visok). Ovo je srce micro mehanike.

**M-3: Guided first season — mandatory**
Prva sezona mora biti guided: manji broj polaznika (4), jedna tema (preporučena), budžet ne može ići u minus, max 1 incident po sesiji. Počev od sezone 2, igrač sam odlučuje. Tutorial mora biti ugrađen u gameplay, ne popup.

**M-4: Milestone gustina u prvoj sezoni**
Definiši minimum 3 nagrade koje igrač vidi unutar prve sezone (achievements, visual unlock, reputacioni skok). "Sezona završena" nije nagrada — to je samo kraj levela. Treba micro-celebrate momente unutar sesije: "Polaznik Milorad je savladao suvozid" sa kratkom animacijom.

**M-5: Save kontrakt**
Definiši jasno: da li se micro sesija može nastaviti posle izlaska? Preporuka: NE — micro sesija je atomarna jedinica. Ako zatvoriš browser, sesija se smatra završenom sa auto-resolve (satisfaction = prosek onoga što je postiguto). Macro state se uvek čuva.

**M-6: Prestiž reset ekonomija mora biti eksponencijalna, ne linearna**
+25% početne reputacije i +10% zarade per prestiž su preblagi za dugoročni replay. Do petog prestiža, razlika od nule je samo 50% zarade — to nije transformativno. Predlog: svaki prestiž multiplikuje earning rate, a prestiž 3+ otključava ekskluzivnu temu koja se nigde drugde ne može dostići. Prestiž mora biti "jedva čekam" moment, ne "mislim da ću".

**M-7: Vizuelna granica render.js vs session-ui.js**
Definiši u GDD-u tačno šta ide na Canvas (imanje pozadina, polaznici kao ikone, animacije terena) a šta je DOM overlay (tajmlajn traka, decision cards, metar energije, HUD). Mešanje ova dva u jednoj fazi je recipe za render bug koji uzima 2h da se debuguje.

---

*Nega Negovanović, 2026-06-07. Ovo nije pesimizam — ovo je mapa mina. Mile dobija ovaj dokument pre GDD faze i resava sve tačke marked SHOWSTOPPER pre nego sto pise ijednu mehaniku.*
