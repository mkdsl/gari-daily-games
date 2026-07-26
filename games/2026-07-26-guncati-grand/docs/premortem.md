# Premortem — Guncati Grand

## Verdict: drži uz korekcije

Concept ima srce i logiku, ali 3 simultana layera u browseru bez savršenog onboarding-a su direktna ruta ka abandon rate > 60% u prvoj sesiji. Tom Sawyer mechanic je jedinstven i emocionalno ubedljiv — to je stub koji drži celu konstrukciju. Problemi nisu fatalni ali su konkretni i izvršni: scope treba oštriji scoping, Micro layer ima ozbiljan implementacioni rizik, i Grand Finala mora biti mechanically interaktivna (ne pseudo-interaktivna).

---

## Showstopper rizici (ovi ubijaju igru)

### 1. Tri layera bez jasnog prelaza = novi igrač se gubi u 90 sekundi
Igrač otvara igru i suočava se sa: Macro alokacijom (500 GC, 4 kategorije), Micro mini-scenarijem (5 volontera, 4 zadatka, 3 atributa), i Grand Finala na horizontu. Nema natural funneling koji kaže "uradi ovo prvo." Ako onboarding nije sekvencijalan i prisiljen (Nedelja 1 = SAMO Macro, Nedelja 2 = uvodi Micro), igrač pokušava da optimizuje sve odjednom i odustaje.

**Rizik:** CRITICAL. Bez strukturiranog tutoriala koji blokira access do narednog layera, concept se urušava u prvim minutima.

### 2. Grand Finala — "15 min real-time sim" je obećanje koje kod lako ne ispuni
"3 DJ slota, bar resupply klik, vremenski event, Crowd mood meter" zvuči konkretno, ali 15 minuta real-time u browseru znači da je cela igra samo setup za 1/3 svog trajanja. Ako Finala nije mechanically bogata (ako klik na "bar resupply" i jedan weather event nisu dovoljni da drže pažnju 15 min), oseća se kao cutscene sa dugmićima. Igrač bi trebalo da ima barem 7–10 aktivnih odluka u tih 15 minuta, ne 2–3.

**Rizik:** CRITICAL. Ako Finala razočara, nema retry motivacije — kompletan concept pada jer je sve ostalo bilo samo build-up.

### 3. Save state u browseru za 30+ min sesiju
10 nedelja × 3 min = 30 min + 15 min Finala = 45 min sesija, bez pauze. Browser tab crash, accidental close, ili phone interrupt = izgubljena sesija. Ako nema auto-save po nedelji (sa resumable state), igrač koji dođe do Nedelje 8 i izgubi progres nikad ne vraća.

**Rizik:** CRITICAL ako nema per-week checkpoint save-a u localStorage. Ovo se mora implementirati u 4b fazi (state.js) bez kompromisa.

---

## Dizajn rizici (mogu oslabiti iskustvo)

### 4. Micro layer volonteri — implementaciona kompleksnost vs. vrednost
5 volontera × 3 atributa (Energija/Glad/Vibe) × 4 zadatka = 60 individualnih state kombinacija po nedelji. Ovo je sistem koji traži balansiranje. Ako Jova ne implementira jasnu feedback petlju ("Mira je gladna, ne stavljaj je na kopanje"), igrač ne razume zašto Vibe pada i sistem se čini arbitrarnim. Micro layer mora imati vidljive warnings pre nego što greška napravi štetu.

**Rizik:** MEDIUM. Rešivo sa dobrim UI u ui.js, ali zahteva explicitno dizajnersko odlučivanje u gdd.md.

### 5. 500 GC/nedelja alokacija — da li su kategorije dovoljno tenzične?
Ako optimalna alokacija postoji (npr. uvek 200 Gradnja / 150 Hrana / 100 Marketing / 50 Zajednica), igrač je otkriva u 2. runu i igra postaje mechanical. Tom Sawyer mechanic (Wellbeing ≥ 60% = besplatni rad) mora biti dovoljno jak da nagradu od 0 GC u Marketing-u kompenzuje realno — inače je matematički inferioran i niko ga ne koristi.

**Rizik:** MEDIUM. Balanser (Mile) mora eksplicitno testirati "Zajednica-first" vs. "Marketing-first" strategije i osigurati da više staza vode do pobede.

### 6. Prestige (Stara Šaraga mode) je slabo definisan
"Počinješ bez para ali sa reputacijom. Reputation × 0.1 = GC bonus/nedelja." Ako je Reputation iz prvog runa = 100, to je +10 GC/nedelja — gotovo neosetan bonus na 500 GC budžetu. Prestige mora biti dramatičniji (možda ×0.5 GC bonus) ili must unlock nešto što first-run nije imao (poseban volonter, DJ koji ne košta). Inače prestige je checkbox, ne motivacija.

**Rizik:** MEDIUM. Mile mora ovo razraditi u gdd.md sa konkretnim tabelama.

### 7. Vremenska sesija vs. idle-friendly expectations
30+ minuta nije idle igra — to je dedicated session igra. Igrač mora da zna ovo pre nego što počne. Ako naslov ili thumbnail sugeriše "quick game", igrač se vara i napušta. Marketing unutar igre (onboarding screen) mora jasno reći: "Ovo traje 45 minuta. Spremi se."

**Rizik:** LOW-MEDIUM. Rešivo sa dobrim FTUE tekstom.

---

## Brand-utility kritika

### Guncati veza: ORGANSKA — ali samo za inicirane
Igrač koji nikad nije čuo za Guncati uči nešto konkretno o event planiranju u ruralnom settingu. Tom Sawyer = Zabavni radni park nije samo metafora — to je Guncati filozofija kodirana kao mechanic. Ovo je najjača brand veza u celom pitchu. Problem: igrač bez konteksta (nije fan, nema FB follow) neće prepoznati autentičnost. Moraju postojati in-game signali ("ovo je stvarno — igrač X iz Beograda već rezervisao") koji konvertuju casual igrača u interested lead.

**Ocena: 8/10 — najjača od tri veze.**

### Kluboslavija veza: FUNKCIONALNA ali plitka
"DJ booking + lineup timing = direktno iskustvo" — u Finalnoj fazi birate kojeg DJ-a stavite u koji slot. Ovo je thin. Kluboslavija veza bi bila jača kad bi specifični DJ-evi bili named (čak i fiktivni ali sa character-om), kad bi lineup order imao muzičku logiku (buildup → peak → comedown), i kad bi pogrešan redosled bio emotionally punishing, ne samo score penalizovan. Trenutno je ovo calendar UX, ne DJ culture education.

**Ocena: 5/10 — potrebna dublja mehanika ili se može izostaviti iz Finala bez gubitka.**

### MKDSLend veza: KONCEPTUALNO JAKA, implementaciono neizvesna
Tom Sawyer vizualizuje "rad kao iskustvo" savršeno. Ali MKDSLend kao brand nije poznat igraču — nema brand awareness koji bi ovaj moment učinio prepoznatljivim. Ovo je vrednost za internog reader (šef), ne za igrača. Preporučujem da MKDSLend veza ostane implicitna (u brand_serves manifest-u) ali se ne eksplicitno komunicira u igri dok brand nema javni identitet.

**Ocena: 6/10 — nije lažna, ali prerano za eksplicitno brendiranje.**

---

## Šta drži

1. **Tom Sawyer mechanic je genuino inventivan.** Wellbeing kao soft gate za besplatan rad — igrač koji tretira volontere kao resurse, a ne ljude, biva kažnjen sistemski. Ovo je edukativna mehanika koja ne predaje, ona demonstrira.

2. **10 nedelja × 3 min ritam je precizan.** Nije arbitrary — 3 min po nedelji osećaš se kao "jedan odlazak na imanje", što je tačno koliko pažnje volonter ima. Pacing je dizajnerski svestan.

3. **Grand Finala kao kulminacija, ne finalna forma.** Logično je da 80% igre je setup, a 20% je payoff. Ovo je tačna emotivna arhitektura — problem je samo da payoff mora biti dovoljno bogat.

4. **Prestige (Stara Šaraga) ima karakter.** Ime je odlično. Reputation kao carry-over vrednost je thematically consistent sa Guncati pričom o dugogodišnjem radu na imanju.

5. **Scope (25–35 modula, 10K–13K LOC) je realan za impl fazu.** Nije stub, nije overreach. Jova može ovo da isporuči u jednom impl stage-u.

---

## Preporuke (drži uz korekcije)

**Pre nego što impl počne, ovi elementi moraju biti razrađeni u gdd.md:**

1. **Onboarding sekvenca:** Nedelja 1 blokira Micro. Nedelja 2 uvodi prvog volontera. Nedelja 3+ daje pun pristup. Ovo mora biti hard-coded, ne optional tutorial.

2. **Grand Finala decision density:** Mile mora navesti minimum 8 aktivnih event-a u 15 minuta (ne samo 3). Prijedlog: crowd surge (gde stojite?), equipment fail (improvizuješ ili zaustaviš?), VIP gost (da li menjate setlistu?), itd.

3. **Per-week save checkpoint:** state.js mora snimati posle svake nedelje. Bez ovog, concept je neisporučiv.

4. **Tom Sawyer kalibracija:** Jova i Mile definišu tacnu krivulju — koliko GC vredi 1% Wellbeing iznad 60%? Ako je implicitna vrednost < 50 GC/nedelja, Tom Sawyer nikad ne dominira strategiju.

5. **Prestige rebalans:** Reputation × 0.1 GC/nedelja → minimum ×0.5 GC/nedelja, ili unlock jednog locked DJ slota, ili unlock faster Macro alokacija (4 kategorije → 5+).

**Šta NE menjati:**
- Tri layera ostaju — ne simplifikuj na dva, to je srž diferencijacije.
- Tom Sawyer ostaje imenovan i eksplicitan — ne skrivaj mechanic, promovišaj ga u FTUE.
- Grand Finala ostaje 15 min — skraćivanje ubija emotivni payoff.
