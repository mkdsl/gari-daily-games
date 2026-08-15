# Premortem: Crew Recruiter — Izgradi Ekipu

**Datum:** 2026-08-14
**Agent:** Nega Negovanović
**Input:** `games/2026-08-14-crew-recruiter/docs/concept.md` (pre-produced od Iskre, 2026-08-11 + Ending Screen spec dodatak 2026-08-13)
**Stage:** premortem

---

## Verdict

**DRŽI UZ KOREKCIJE**

Core loop je jasan i tehnički skroman (CSS karte, event-driven JS, bez canvas-a — realno izvodljivo za Jovu). Problem nije da li se ovo MOŽE napraviti, nego (a) da li je koncept dovoljno specifikovan da se napravi bez re-dizajna usred impl-a, i (b) da li GDG katalog treba treću skoro identičnu crew-builder igru u tri meseca sa brand spregom koja je, kod dva od tri brenda, dekorativna ili nepotvrđena. Nijedan pojedinačni nalaz je showstopper — kombinacija R1+R2+R3 jeste blokirajuća za GDD dok se ne reši.

---

## Rizici (po severitetu)

### CRITICAL — R1: Persistence model za 6 rundi vs 5 slotova nije definisan

**Šta može da puca:** Core loop kaže "Draw 3 karte → Assign na 1 od 5 slotova → Resolve → Repeat ×6". Ali slotova ima 5, rundi ima 6. Šta se dešava u rundi 2: da li novo dodeljena karta **zamenjuje** kartu iz runde 1 na istom slotu (stara karta se gubi, njen bonus prestaje da važi)? Ili se slot popuni jednom i onda **isti crew** rešava svih 6 faza (a runde 2–6 onda ne dodeljuju ništa novo, što je u suprotnosti sa "Draw 3 karte" ×6)? Concept ne kaže nijedno eksplicitno.

**Zašto je CRITICAL:** Ovo je srž state mašine igre. `state.js` (slots, hand, vibe_score, phase_index) ne može se napisati dok se ovo ne reši — Jova će morati da izmisli pravilo usred impl sesije, što je tačno greška koju je Avala Crew premortem (R1, 2026-06-06) već flagovao za istog autora koncepta i istu porodicu mehanike. Ponovljena greška obrasca.

**Preporuka:** Mile mora u GDD napisati eksplicitnu state mašinu: da li je "Assign" reversible/overridable po rundi, da li stare karte ostaju u igri (i dalje doprinose synergy-ju) ili se povlače, i da li se Resolve u svakoj rundi računa samo za novododeljeni slot ili za sve popunjene slotove. Bez ovoga — nema impl-a.

---

### CRITICAL — R2: Broj uloga je interno kontradiktoran (5 vs 7)

**Šta može da puca:** Premisa i Core Loop navode **5** uloga (Tonac, Host, Content Creator, Logistika, Obezbeđenje) i 5 slotova. Ali sekcija "Sadržaj koji treba" traži od Milea "synergy matrica (**7 uloga × 5 event slotova** = 35 ćelija)". Odakle dolaze 2 dodatne uloge nije objašnjeno nigde u tekstu.

**Zašto je CRITICAL:** Mile ne može popuniti tabelu sa dva različita broja rola u istom dokumentu. Ako je 7 tačno, treba definisati koje su preostale 2 uloge i kako se uklapaju u 5 fizičkih slotova (da li neke uloge dele slot, da li su to "wildcard" karte bez fiksnog slota). Ako je 5 tačno, "7 uloga × 5" u concept.md je prosta greška koju neko mora ispraviti pre nego što Mile krene da računa 35 ćelija koje ne postoje.

**Preporuka:** Gari/Iskra pre GDD-a potvrđuju jedan broj. Ako ostaje 5×5 = 25 ćelija, popraviti concept.md liniju. Ako je namera bila 7, dopisati koje su te uloge i njihov odnos prema 5 slotova.

---

### CRITICAL (brand/factual) — R3: "Nije rađeno u GDG katalogu" je netačna tvrdnja — treći crew-builder u ~2.5 meseca

**Šta može da puca:** Concept.md eksplicitno tvrdi žanr je "Mini deck-builder / crew manager (**nije rađeno u GDG katalogu do sad**)". To nije tačno. U katalogu već postoje:

- **Ekipa Noći** (2026-05-31) — "Card / Kombinator — Multi-Layer **Crew Builder**", Kluboslavija × MKDSLend. **5 uloga: DJ, Host, Sound, Video, Security.** Synergy bonusi/konflikt penali između karata u istom event-u. 25 unikatnih karata sa traits (Veteran, Rookie, Wildcard, Introvert...).
- **Avala Crew** (2026-06-06) — "Multi-layer Card/Crew Builder + Scenario Resolution", Kluboslavija × MKDSLend. Roster od 5 mesta, synergy između crew članova, faze noći, scenario resolution.

Uporedi role-taksonomiju direktno: Ekipa Noći = **DJ, Host, Sound, Video, Security**. Crew Recruiter = **Tonac, Host, Content Creator, Logistika, Obezbeđenje**. Host je identičan naziv. Sound↔Tonac, Video↔Content Creator, Security↔Obezbeđenje su isti realni posao pod drugim imenom. 4 od 5 uloga se mapiraju 1:1 na već postojeću igru. Jedina nova je Logistika (DJ je izbačen).

**Zašto je CRITICAL:** Ovo nije kozmetička sličnost — to je gotovo ista mehanička porodica (draw → assign u slot → susedni synergy bonus → agregatni score) treći put pod tri meseca, sa istim dva brenda (Kluboslavija × MKDSLend). Za igrača koji je odigrao i Ekipa Noći i Avala Crew, Crew Recruiter je "isto, treći put" — deja vu koji obara "svaka GDG igra je nešto novo" premisu iz `tim/iskra/gamifikacija_ideje.md` principa i troši kredibilitet pipeline-a. Netačna tvrdnja u konceptu takođe znači da niko (Iskra, Gari) nije uporedio ovaj koncept sa katalogom pre pisanja — signal da bi triage korak trebalo da uključi grep kroz `games/README.md` pre svakog crew/card koncepta.

**Preporuka:** Ukloniti tvrdnju iz concept.md. Mile mora u GDD eksplicitno navesti **3 konkretne razlike** naspram Ekipa Noći i Avala Crew (npr: jedan event umesto karijere/sezone; 6 kratkih faza jednog nastupa umesto multi-event arc-a; Vibe Score kao real-time metar umesto Tour/Event Score agregata) — ne kao marketing fraza nego kao stvarne mehaničke odluke koje sprečavaju da igra bude reskin. Ako se razlika ne može artikulisati u 3 konkretne tačke, koncept treba vratiti Iskri na pivot pre impl-a.

---

### MEDIUM — R4: Guncati CTA link nije potvrđen u realnom svetu

**Šta može da puca:** Ending CTA glasi "Pravi tim se gradi na Guncatiju [DATUM]" + link "ka volonterskom pozivu Guncati Grand Finale", tajmovan na W34 (17–23.08). Pretraga guncati/raspored fajlova ne nalazi potvrđen "Grand Finale volonterski poziv" na taj datum — kalendar za tu nedelju pominje "Restauracija metalnih sprava" vikend (15–16.08), a sledeći potvrđeni masterclass je ajvar 22–23.08. Dodatno, GDG katalog već ima igru doslovno nazvanu **"Guncati Grand"** (2026-07-26) čija premisa je *simulacija* organizovanja fiktivnog Grand Finale eventa — postoji realan rizik zabune između (a) stvarnog Guncati poziva za volontere i (b) reference na već objavljenu GDG igru o fiktivnom eventu.

**Zašto MEDIUM, ne CRITICAL:** Ne ruši gameplay — CTA je post-ending dekoracija, igra radi bez njega. Ali ako link vodi nikuda ili na pogrešnu stranicu, to je isti obrazac koji je Avala Crew premortem (R6) već upozorio: "Placeholder URL koji ne vodi nikud je gori od ne-postojećeg CTA-a."

**Preporuka:** Pre nego što Jova piše `share.js`/ending CTA, Gari mora potvrditi stvaran cilj linka (postoji li zaista otvoren poziv za volontere za taj datum, ili treba generic Guncati landing stranica bez izmišljenog "volonterskog poziva"). Ako do impl dana nema potvrđenog resursa, CTA ide na generičku Guncati stranicu, ne na nepostojeći formular.

---

### MEDIUM — R5: Modul/LOC target ispod projektnog poda

**Šta može da puca:** Concept traži "Target: 20–28 modula". Projektni standard (`CLAUDE.md`, Scope tabela) je **minimum 25 modula** za single-layer igru ("Stub strukture... NEMA"). Donja granica od 20 pada ispod poda. Isto tako, pominjani JS opseg 6000–10000 (iz brief-a) je ispod dokumentovanog single-layer cilja od 8000–12000.

**Zašto MEDIUM:** Lako rešivo brojevima, ali ako Jova doslovno cilja donju granicu iz concept.md (20 modula, 6k linija), rizikuje da padne ispod hard floor-a i da GDD/impl cross-check (KORAK 4a hardcheck: "<20 modula → vrati u scope-up") skoro okine.

**Preporuka:** Mile u GDD eksplicitno postavlja 25–40 modula / 8000–12000 JS linija kao cilj (single-layer standard), ne 20–28.

---

### MEDIUM — R6: Single-layer klasifikacija je van linije sa aktuelnom GDG direktivom za branded igre

**Šta može da puca:** Concept eksplicitno kaže "Kompleksnost: 3/5" i single-layer scope. Ali `CLAUDE.md` (2026-05-10 direktiv) kaže: "Branded/utility igre treba da budu multi-layer manager/sim... Single-layer 'nezanimljivo' je default greška u concept fazi." I zaista — svaka branded igra u katalogu od 06-04 nadalje (Festival Mreža, Avala Crew, Zemlja i Znanje, Sarajevo ili Smrt, Imanje Tycoon, Na Vezi, Guncati Grand) nosi oznaku "Multi-Layer" u README-u. Crew Recruiter bi bio prva branded igra u ~2.5 meseca koja se svesno vraća na single-layer.

**Zašto MEDIUM, ne CRITICAL:** Postoji legitiman argument za izuzetak — ovo NIJE career-sim (to prostor već pokrivaju Ekipa Noći i Avala Crew), nego namerno kratka, jedna-noć "companion" sesija (10–18 min, slično Avala Run pre-direktiva). Kratkoća može biti feature, ne bug — dodavanje makro sloja bi ovu igru učinilo *još* sličnijom Ekipa Noći.

**Preporuka:** Mile u GDD mora eksplicitno obrazložiti zašto je single-layer OVDE opravdan izuzetak od direktive (companion-session argument), ne prećutati odstupanje. Ako obrazloženje ne postoji u GDD-u, prva sledeća retrospektiva će ovo flagovati kao tihu direktiva-drift (isti tip nalaza kao KORAK 0c/0d/0e drift problemi koje je tim već otkrivao u prošlosti).

---

### MEDIUM — R7: Content fatigue rizik za 30+ karata — treći put isti arhetip vokabular

**Šta može da puca:** Ekipa Noći već ima 25 karata sa trait vokabularom (Veteran, Rookie, Wildcard, Introvert, Ekstrovert, Heavy Hitter) za skoro identičnu ulogu-taksonomiju. Pisanje 30+ novih karata za Crew Recruiter (Pera/Sine u KORAK 4f) nosi realan rizik nesvesnog recikliranja istih arhetipova ("veteran tonac", "wildcard host") jer je izvorni materijal (balkanska event-crew scena) ograničen i već jednom iscrpljen za skoro identičan cast.

**Zašto MEDIUM:** Ne ruši funkcionalnost, ali direktno šteti R3 problemu (deja vu) — ako i mehanika I sadržaj podsećaju na Ekipa Noći, igra je efektivno reskin.

**Preporuka:** Pre pisanja karata, autor (Pera/Sine, po brief-u) čita `games/2026-05-31-ekipa-noci/src/content/cards_data.js` i Avala Crew roster fajl kao "ne ponavljaj" listu — nijedan naziv karaktera, trait tag ili one-liner ne sme se preklapati.

---

### LOW — R8: Drag-and-drop ambivalencija na mobilnom

**Šta može da puca:** Concept kaže "smooth drag/drop **ili** klik-to-slot" — ostavlja Jovi izbor. Drag-and-drop na touch uređajima je klasičan first-5-minuta ubica (case koji su prošli beta izveštaji već više puta hvatali u drugim GDG igrama) ako nije eksplicitno projektovan sa touch-friendly hitboxovima i fallback-om.

**Zašto LOW:** Impl napomena u concept.md već ispravno usmerava na Pointer Events API (unified touch+mouse) — rizik je ublažen, samo nije eksplicitno rangiran koji mod je primaran.

**Preporuka:** GDD/impl brief fiksira klik-to-slot (tapni kartu → tapni slot) kao **primarni** default na svim uređajima, drag kao opcioni enhancement za desktop miša — ne "ili" izbor prepušten Jovi usred kodiranja.

---

### LOW — R9: Dva različita ending tagline seta za isti score bucket

**Šta može da puca:** §Win Condition kaže za 80+: *"Crew je legenda. August u Guncatiju."* Ending Screen UI Spec (dodat 2 dana kasnije) kaže za ≥80: *"Crew je spreman. Svi znaju šta im je posao."* Dve različite fraze za isti prag, napisane u različitim sesijama istog dokumenta.

**Zašto LOW:** Čist copy/konzistentnost problem, ne mehanički.

**Preporuka:** Jedna kanonska tagline lista po score bucket-u — Dule (koji već po brief-u pregleda ending CTA etički) treba da dobije zadatak da i copy uskladi u istom prolazu.

---

### LOW — R10: Unlock brojači nisu precizno definisani

**Šta može da puca:** "Outdoor unlock posle 5 igara", "Intimate posle 10", "Hall of Fame posle 3 igre" — nije rečeno da li se broji svaki započeti run, ili samo run koji stigne do kraja (faza 6 odigrana ili Vibe = 0). Igrač koji zatvori tab u rundi 2 — da li se to računa?

**Zašto LOW:** Rešivo jednom rečenicom u GDD-u, ne utiče na osnovnu igrivost.

**Preporuka:** Mile definiše "completed run" (dostignut ending screen, bilo koji ishod) kao jedinicu brojanja — konzistentno sa `state.js` save-posle-svake-runde napomenom koja već postoji.

---

## Brand-utility kritika

**Da li mkdslend/guncati/kluboslavija sprega zaista radi, ili je decoration?**

**Zaključak: MKDSLend veza je konceptualno realna ali ponovljena; Guncati veza je nepotvrđena; Kluboslavija veza je čista dekoracija.**

- **MKDSLend (primary):** "Event organizer igra = Zabavni Radni Park fit" je tačan argument — ali identičan argument je već iskorišćen za Ekipa Noći i Avala Crew. Trećeg puta zaredom, "event organizator = MKDSLend fit" prestaje da bude uvid i postaje template opravdanje koje se lepi na svaki crew/roster koncept bez obzira na mehaniku. Fit postoji, ali nije diferencirajući — svaka buduća crew igra će imati isti argument.

- **Guncati (tie-in):** Ovo je tekstualno tačno "tie-in" po definiciji iz sopstvenog rubrika — jedna rečenica CTA na kraju ekrana, bez ijednog mehaničkog dodira sa Guncati temom tokom same igre (nema Guncati karte, nema Guncati faze, nema Guncati resursa u gameplay-u). Dodatno, sam link kome ta rečenica vodi nije potvrđen u realnom kalendaru — što ovo svrstava lošije od Avala Crew slučaja gde je bar ticketing URL (bilet.rs) bio stvaran proizvod. Ovde postoji rizik da CTA vodi ka nečemu što ne postoji ili se meša sa već objavljenom GDG igrom istog imena ("Guncati Grand"). **Ovo je trenutno decoration dok se link ne potvrdi.**

- **Kluboslavija (secondary):** "Karte su stereotipi DJ turneja scene, prepoznatljivi publici" — nema nijednog mehaničkog hook-a: nema Kluboslavija žig/logo u kartama, nema reference na turneju 2026, nema linka ka bilo kom Kluboslavija eventu ili biletu. Ovo je najslabija od tri sprege u konceptu — čisto imenovanje uloga (Tonac, Host, Obezbeđenje) koje bi jednako dobro poslužilo bilo kom event brendu na svetu. Po sopstvenom kriterijumu ovog rubrika ("kozmetički dodatak bez suštinske veze"), ovo TAČNO to jeste.

**Sprega prestaje da bude decoration samo ako:**
1. Guncati link je potvrđen i stvarno vodi negde pre 21.08 posta (ili je zamenjen generičkom, ali realnom, Guncati stranicom)
2. Bar jedna karta nosi eksplicitan, prepoznatljiv Kluboslavija detalj (ime iz turneje, žig referenca, ne generičan "Tonac")
3. GDD artikuliše 3 konkretne mehaničke razlike naspram Ekipa Noći/Avala Crew (R3) — bez toga, MKDSLend "fit" argument je recikliran, ne nov

---

## Preporuke za korekcije (sažeto, za Mile Mehaniku u GDD)

1. **Razrešiti broj uloga**: 5 ili 7 — ispraviti "7 uloga × 5 slotova" grešku u concept.md pre balans tabele.
2. **Definisati persistence state mašinu** za 6 rundi vs 5 slotova — da li assign u kasnijim rundama zamenjuje raniju kartu, i da li se Resolve svake runde odnosi na sve popunjene slotove ili samo novi.
3. **Ukloniti "nije rađeno u GDG katalogu"** iz concept.md; dodati u GDD 3 konkretne mehaničke razlike naspram Ekipa Noći (05-31) i Avala Crew (06-06).
4. **Modul/LOC target na projektni pod**: 25–40 modula, 8000–12000 JS linija (ne 20–28 / 6–10k).
5. **Obrazložiti single-layer izuzetak** eksplicitno u GDD (companion-session argument), ne prećutati odstupanje od 2026-05-10 multi-layer direktive.
6. **Potvrditi ili degradirati Guncati CTA link** pre impl dana — realan volonterski poziv ili generička Guncati stranica, nikad izmišljen URL.
7. **Content brief za karte**: pisac karata prvo čita Ekipa Noći `cards_data.js` i Avala Crew roster fajl kao "ne ponavljaj" listu arhetipova/trait-ova.
8. **Klik-to-slot kao primarni mobile interaction**, drag kao opcioni desktop enhancement — ukloniti "ili" iz spec-a.
9. **Jedna kanonska ending tagline lista** po score bucket-u (uskladiti §Win Condition sa Ending Screen Spec) — Dule prolazi kroz oba u istom pass-u.
10. **Definisati "completed run"** kao jedinicu brojanja za unlock pragove (5/10/3 igre).

---

## Red line — koji uslov znači "ne ide u impl"

**Igra ne ide u impl dok GDD ne sadrži sve od sledećeg:**
- Razrešen broj uloga (5 ili 7) i eksplicitna state mašina za 6 rundi/5 slotova (R1+R2)
- 3 konkretne mehaničke razlike naspram Ekipa Noći i Avala Crew, pismeno u GDD-u — ne marketing fraza (R3)
- Guncati CTA link potvrđen ili svesno zamenjen realnom alternativom (R4)

Bez ova tri, Jova ponavlja tačno onu grešku koju je Avala Crew premortem već upozorio istom timu pre 2 meseca (underspecified core mechanic → 2+ sata re-dizajna usred impl sesije), i GDG katalog dobija treću skoro identičnu crew-builder igru bez artikulisanog razloga zašto postoji.

**Sve ostalo (R5–R10) su korekcije, ne blokeri** — modul target, tagline konzistentnost, unlock brojači i content-fatigue upozorenje idu u GDD kao instrukcije, ne kao uslov za zaustavljanje pipeline-a.
