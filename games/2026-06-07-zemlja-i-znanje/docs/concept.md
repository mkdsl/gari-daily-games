# Concept: Zemlja i Znanje

## Premisa

Vodiš **Guncati Imanje** — živu školu prirodnih zanata na selu. Tvoj posao: planirati i izvoditi masterclass sezone (suvozid, rammed earth, inokulacija pečuraka, akvakultura, permakultura dizajn) za polaznike koji plaćaju da rade, ne da sede. Svaka sesija je stvarna — alati se kvare, kiša menja planove, polaznici gube energiju. Reputacija imanja raste kroz konkretne, dobro izvedene radionice. Posle pet sezona, možeš pokrenuti prestiž reset — nova sezona sa boljim resursima, boljom reputacijom, višom cenom ulaznice — i dokazati da si napravio ne samo imanje nego i instituciju.

## Core Gameplay Loop (multi-layer opis)

**Macro Layer — Planiranje Sezone (nedeljni ritam)**

Pre svake sezone (5–7 nedelja), ulazite u planer:
- Biraš temu masterclass-a iz kataloga (suvozid, inokulacija, akvakultura, rammed earth, permakultura dizajn, kombinovani modul)
- Određuješ cenu ulaznice, maksimalan broj polaznika (4–18), trajanje (1, 2 ili 3 dana)
- Raspoređuješ redosled modula unutar programa (teorija → demonstracija → praktični rad → evaluacija)
- Upravljaš resursima: budžet (materijali, hrana, honorar stručnjaka), raspored stručnjaka (Brana, Alatko, Cana — svaki ima kapacitet i raspoloživost), zalihe hrane, stanje alata
- Svaka odluka u macro fazi direktno određuje uslove micro faze

Resource carry-over je obavezan: alati koji se ne kupe ove sezone jeftiniji su za 20% sledeće, hrana konzervirana ovde (Cana sistem) smanjuje trošak narednog masterclass-a, reputacija otvorena ovde privlači kvalitetnije polaznike.

**Micro Layer — Izvedba Sesije (real-time upravljanje)**

Kada sezona počne, prelaziš na termin po termin. Svaka sesija ima:
- **Tajmlajn trake** (6–8 sati radnog dana, vidljiv kao horizontalna traka) — vučeš aktivnosti u prozore
- **Metar energije polaznika** (grupe od 4–18, svaka osoba je ikonica sa individualnom energijom i znatiželja stat-om)
- **Incident queue** (nasumični događaji ulaze u red: polaznik pita previše, pada kiša, Alatko je zaboravio bušilicu, netko alergičan na pečurke...)
- **Decision cards** — svaki incident traži odluku (odložiti? improvizovati? zvati Branu? dati pauzu ranije?)

Tajming je mehanika: ako Q&A počne prekasno, energija pada; ako pauzu daš pre nego što se akumulirala glad, "trošiš" bez efekta. Svaka minuta kasnjenja smanjuje zadovoljstvo, svaki dobar tajming ga povećava. Cilj: dovesti grupu do kraja dana sa zadovoljstvo 75+% i naučeni materijal 60+%.

**Meta Progresija — Reputacija i Karijera**

- Reputacija imanja raste (0–1000 poena), otključava nove masterclass teme, stručnjake, opremu
- Cena ulaznice se može povećavati kako reputacija raste (polaznici prihvataju premium)
- Career stat: ukupno polaznika kroz program, ukupni prihod, stopa povratka polaznika
- Achievements: "Kiša ne zaustavlja", "Soldata gladnih" (100 obroka bez reklamacije), "Čista tehnika" (5 sesija bez incidenta)
- Prestiž reset posle 5 sezona: počinješ iz nule ali sa +25% početne reputacije, jednim otključanim stručnjakom i jednim premium alatom. Svaki prestiž krug ostavlja trajni multiplier na zaradu.

## Hook (zašto bi neko igrao 15+ minuta)

Prvih pet minuta — planiraš prvu sezonu, biraš temu, postavljaš cenu. Činiš se moćan. Onda krene sesija: tri stvari odjednom zahtevaju pažnju, polaznik koji plaća 120 eura stoji sa krivom lopatom i čeka tvoj signal, a Alatko ti javlja da je bušilica ostala u autu na parkingu. Ti donosiš odluke u sekundi. Kada sesija završi i vidite zadovoljstvo grupe 89% — osećaš da si nešto zaista izveo. Onda se otvori macro planer za sledeću nedelju i vidiš da možeš poditi cenu za 15%. Taj feedback loop — planiranje → stres izvedbe → nagrada → viša uloga — drži 30 minuta pre nego što shvatiš da si zaboravio pauzu.

Replay se vozi kroz to što nijedna sezona nije identična: incidents su proceduralni, vremenske prilike poluslučajne, polaznici imaju generisane profile (student, farmer, kuvar koji "traži promenu", umirovljeni inženjer). Svaki prestiž reset otvara novu temu masterclass-a i novu grupu potencijalnih polaznika sa drugačijim profilima.

## Vizuelna Estetika (paleta boja, stil)

Stil: **tople, zasićene boje srpskog sela u junu** — ne cartoon, ali ni realistično. Izometrijski pogled na imanje (Canvas, bez frameworka). Terasa od suvozida, jezerce u pozadini, povrtnjak, radionica.

Paleta:
- Tamnozelena (maslinasta) — trava, drveće, krovovi: `#4A6741`
- Topla zemlja — putevi, zidovi: `#C4956A`
- Crvena glina — rammed earth detalji: `#A0522D`
- Bijela kamen — suvozid: `#E8E0D0`
- Tamna voda — jezerce: `#2C5F6E`
- Sunčana žuta — akcenti, UI highlight: `#F4C430`

UI je pisan srpskim fontom (serif za nazive, sans za podatke), ćirilica za tematske naslove, latinica za UI mehanike. Energija polaznika vizualizovana kao male figurice koje menjaju pozu (CSS animacija — stojeći/sagnuti/sedi-odmara).

Vreme dana menja svetlost pozadine (jutarnje plavo → podnevna bela → popodnevna zlatna) kroz CSS filter na canvas overlay.

## Audio Mood

Ambijent — imanje zvuči živo:

- Jutro: ptice (proceduralno generisane frekventne sekvence, Web Audio oscillator), tihi vetar
- Rad: čekić na kamenu (ritmičke perkusije), šuštanje lišća, voda u pozadini za akvakulturne module
- Pauza: tišina sa grlom grljičice, žubor potoka
- Incident: kratki zvučni "signal" — ne alarm, nego nešto između zvona i škljocanja, da ne stresira nego obaveštava
- Prestiž finala: kratki mali crescendo — drvo pucketanje + duboki ton jezera

Sve generisano isključivo Web Audio API — nema .mp3 ni .wav. Ceca Čujka implementira kompletnu zvučnu sliku kroz sintezu.

## Win Condition + Prestige Hook

**Win po sezoni:** Završiš svih 5–7 nedelja masterclass-a sa prosečnim zadovoljstvo polaznika ≥ 70% i finansijskim plusom. Otključava se novi modul u katalogu i +reputacija.

**Win po karijeri:** Dostigneš reputaciju 1000 (rang "Živo Učilište") sa ukupno 500 polaznika.

**Prestiž hook:** Posle 5 završenih sezona aktivira se opcija "Nova Generacija" — reset karijere, ali:
- Počinješ sa 25% startne reputacije (nije nula)
- Jedan stručnjak ostaje zaposlen (tvoj izbor)
- Jedan premium alat prenosi se u novu eru
- Svaki prestiž krug dodaje permanentni +10% na zaradu po polazniku
- Otvara se nova masterclass tema koja ne postoji u prvom ciklusu (npr. "Prirodna gradnja — zemlja i slama" ili "Akvakultura za početnike — ribnjak od nule")

Posle trećeg prestiža otvara se secret achievement: "Institucija" — Guncati se pojavljuje kao referenca u bio-u narednih generacija polaznika (flavortext koji se čita u end screen-u).

## Brand Serves

**Guncati (direktno):** Igra je interaktivni preview Guncati modela. Igrač razume pre dolaska šta je "Tom Sawyer model" — plaćaš da radiš, ne da sedis. Svaka masterclass tema u igri odgovara stvarnoj temi koju Guncati planira. Na end screen-u i u pauzi između sezona: link ka Guncati web (placeholder: `https://guncati.rs`) i kratki tekst "Ovo nije samo igra — Guncati radi ovo u stvarnosti. Javi se."

**MKDSLend (indirect):** Igra pozicionira "zabavni radni park" model kao validiran format (jer igrač ga razume kroz gameplay, ne kroz marketing tekst).

**Kluboslavija (weak, ali prisutno):** Jedan od later-season masterclass tema može biti "Muzika i Prostor" (akustika, ambijentualni zvuk, event setup na imanju) — hook za Avala/Guncati event spoj 2026.

## Targetirana dužina sesije

- Prva sesija: 15–20 minuta (jedna puna sezona, prvi prestiž unlock)
- Prosečna sesija povratnika: 25–35 minuta (planiranje + izvođenje + meta pregled)
- Maksimalna sesija hardcore: 45–60 minuta (prestiž run, unlock sve teme)
- Share moment: kraj svake sezone — "Sezona 3: 14 polaznika, 94% zadovoljstvo, 2.800€ prihod" karta za Instagram

## Moduli (procena broja po layeru)

**Macro Layer — Planning Engine (18 modula)**
src/macro/season-planner.js, src/macro/calendar.js, src/macro/budget.js, src/macro/staff-roster.js, src/macro/curriculum-builder.js, src/macro/resource-manager.js, src/macro/supply-chain.js, src/macro/pricing-engine.js, src/macro/applicant-pool.js, src/macro/participant-profiles.js, src/macro/weather-forecast.js, src/macro/tool-inventory.js, src/macro/food-system.js, src/macro/module-catalog.js, src/macro/planning-ui.js, src/macro/season-summary.js, src/macro/unlock-tree.js, src/macro/macro-state.js

**Micro Layer — Session Engine (16 modula)**
src/micro/session-runner.js, src/micro/timeline.js, src/micro/participant-manager.js, src/micro/energy-system.js, src/micro/incident-queue.js, src/micro/incident-generator.js, src/micro/decision-cards.js, src/micro/timing-engine.js, src/micro/satisfaction-calc.js, src/micro/weather-runtime.js, src/micro/instructor-ai.js, src/micro/module-progress.js, src/micro/session-ui.js, src/micro/session-state.js, src/micro/pause-manager.js, src/micro/feedback-collector.js

**Meta / Progression (10 modula)**
src/meta/reputation.js, src/meta/career-stats.js, src/meta/prestige.js, src/meta/achievements.js, src/meta/unlock-manager.js, src/meta/multipliers.js, src/meta/era-manager.js, src/meta/leaderboard-local.js, src/meta/meta-state.js, src/meta/meta-ui.js

**Core / Shared (12 modula)**
src/main.js, src/config.js, src/state.js, src/input.js, src/render.js, src/audio.js, src/ui.js, src/share.js, src/save.js, src/events.js, src/utils.js, src/content/aforizmi.js

**Content / Brand (4 modula)**
src/content/masterclass-catalog.js, src/content/participant-archetypes.js, src/content/brand-hooks.js, src/content/incident-library.js

**Styles (5 fajlova)**
styles/base.css, styles/ui.css, styles/game.css, styles/theme.css, styles/macro.css

**Ukupno: 65 modula** — solidno u multi-layer 50–90 opsegu.
