# Patch Queue — Na Vezi

## Otvoreni patčevi

### Nega — Tehničke ispravke

- [x] P1 `src/main.js` — dodaj top-level `try/catch` sa `console.error` i vidljivom DOM porukom (crveni overlay "Greška u inicijalizaciji — refresh") umesto crnog ekrana kad typo u bilo kom od 44 modula baci SyntaxError (LOW L2 — nije ušao u fix krug) (done 2026-08-06, commit 82ad2c7)
- [x] P1 `src/main.js` — zameni guest ID sa `guest.name` u lock-in summary (`_showLockin` line 354: `getGostProfile(plan.chosen_guest_id)?.name || plan.chosen_guest_id`); bug bio u main.js ne ui.js (done 2026-08-07, commit 8eff2bd)
- [x] P1 `src/systems/signal.js` — uklonjen redundantan `ds` argument iz sva 3 call site-a u `main.js:729/732/735`; `resolveSignalAction` već poziva `getDashboardState()` interno (done 2026-08-08, commit TBD)
- [ ] P2 `src/state.js` — dodaj migracioni guard za save-ove koji su kreirani pre `platformAlloc`/`plan.guest`/`offgridCapacity` renaiming fixa; `loadState()` treba da detektuje stari key format i shim-uje podatke umesto da vrati `undefined` i sruši macro planning na prvom load-u posle update-a (regresija od iter 2 fixa — utiče samo na igrače sa existing save-om)
- [ ] P2 `src/systems/planning.js` — dodaj null check za `guest.profile` pre pristupa `.reliability` u petlji planiranja; crash je rešen ali samo za poznat set gostiju — treći-party data (buduće proširenje gost liste) može ponovo da trigger-uje isti crash

### Iskra — Brand hooks

- [ ] P3 `src/content/brand_hooks.js` — dodaj "Guncati Terenska Emisija" event: kad igrač dostigne off-grid capacity tier 3, otključava specijalnu emisiju snimljenu "sa sela" (zelena paleta, statički šum kao flavor, Brana Barakonja kao gost profil) — direktna Guncati brand integracija u core loop
- [ ] P3 `src/content/brand_hooks.js` — dodaj "Kluboslavija Predaj-tura" format unlock: pet uzastopnih uspešnih emisija sa gostom koji ima `type: "live_performer"` otključava podcast format "Na putu do Avale / Štranda / Sarajeva / Guncata" — četiri epizode kao progression, svaka sa Kluboslavija venue flavor tekstom u intro overlay-u
- [ ] P3 `src/share.js` — unaprediti shareable broadcast card posle emisije: dodaj `play_url` link i format/platforme u share tekst; trenutni screenshot nema URL pa igrač koji šeruje ne vuče novi promet ka igri — fiksirati Web Share API `text` payload sa pozivom na akciju i linkom
- [ ] P3 `src/content/brand_hooks.js` — MKDSLend studio upgrade milestone copy: kad igrač kupi studio tier 4+ prikaži overlay sa "Zabavni radni park — studio je spreman" flavor tekstom i mention-om MKDSLend koncepta; kopija ide u `aforizmi.js` pod `studioMilestones[]` array koji vec postoji

### Dule — Retention & Replay

- [ ] P2 `src/ui.js` + `styles/ui.css` — end-of-emisija ekran je pre-hladan: dodaj animated "Reach" metar (listener count pulse) i progress bar za sledeći guest unlock; bez ovog igrač nema vizuelni pull ka narednoj sesiji — "još jedan" moment nedostaje u emocionalnoj krivoj
- [ ] P2 `src/ui.js` — achievement unlock je trenutno tih (samo checkmark u listi); dodaj 400ms slide-in toast sa achievement ikonom i jednorednim flavor tekstom — 14 achievement-a su sav mid-game reward i treba da se osete kao event, ne log entry
- [ ] P3 `src/ui.js` — dodaj "reliability trend" ikonicu (↑ ↓ →) pored gosta u booking ekranu baziranu na poslednjih 3 emisije; igrač treba da oseti da gradi ili troši vezu sa gostom, ne samo da bookira statičnu vrednost — emocionalna investicija u repeat booking
- [ ] P3 `src/state.js` + `src/ui.js` — prestige reset je brutal bez tranzicije: dodaj "Loyal Core Ceremony" ekran (5 sekundi, ime svakog od 15% retained slušalaca) koji pretvara mehaničku odluku o resetu u emocionalni moment — igra koja ti pokaže koga zadržavaš vs. koga gubiš ima mnogo veći replay zamah od puke multiplikator matematike

### Sine — Narrative

- [ ] P3 `src/content/aforizmi.js` — dodaj `guestIntros[]` array: svaki od 8 gostiju dobija 2-3 rečenice backstory-a koji se prikazuje kao tooltip na prvom book-u; trenutno su gosti mehanička vrednost (`reliability: 0.8`) bez ličnosti — prva interakcija sa Nenadom Jokićem ili Sarom Vuković treba da se oseti kao susret, ne stats screen
- [ ] P3 `src/content/brand_hooks.js` — incident micro-narativ tokom emisije: kad alarm pukne (signal drop, battery red zone) prikaži jednorednu in-character poruku u chat stream-u — gost kaže nešto, inženjer reaguje, slušaoci komentarišu; 12-15 varijanti po alarm tipu, random pick; pretvara mehaničku krizu u storytelling beat
- [ ] P3 `src/content/aforizmi.js` — prestige aforizam: kad igrač trigeruje prestige reset prikaži jedan od 6 Pera Period-style aforizma o početku-posle-znanja ("Vraćaš se na nulu ali ne kao isti čovek"); treba da stoji između `Loyal Core Ceremony` ekrana (Dule P3) i novog macro planning-a — most između meta odluke i sledeće sezonske priče
- [ ] P3 `src/content/brand_hooks.js` — guest chemistry callback: kad igrač bukirа dva ista gosta u uzastopnim nedeljama, inject-uj jednoredni dijalog u emisiju chat log koji referencira prethodnu sesiju ("Pamtiš šta smo rekli prošle nedelje o..."); 3-4 varijante po paru gostiju koji se prirodno sparuju po `type` tagu — nagrađuje igrača koji prati ko dobro ide zajedno

## Završeni patčevi

- [x] P1 `src/main.js` — try/catch + error overlay (done 2026-08-06, commit 82ad2c7)
