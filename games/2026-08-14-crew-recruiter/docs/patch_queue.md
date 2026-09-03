# Patch Queue — Crew Recruiter: Izgradi Ekipu

## Otvoreni patčevi

- [x] P1 `src/main.js` + `src/state.js` — hand clearance regresija: `drawCards(n, state)` push-uje na `state.hand` bez prethodnog brisanja; ako `enterDrawPhase()` u main.js ne radi explicit `state.hand = []` pre poziva, svaka nova faza akumulira karte iz prethodne — posle 3 faze ruka prelazi 6 karata, UI puca i game flow je broken; verifikuj da `state.js resetForNewRun()` pokriva i međufazni hand clear, ne samo novi run (done 2026-08-21: dodato `if (state.gamePhase !== 'draw') return;` guard u performDraw(), JSDoc komentar u resetForNewRun() potvrđuje da inter-phase clear ide kroz performDraw — popularna double-click regresija zatvorena)

- [x] P2 `src/ui/cards.js` + `src/input.js` — keyboard assign flow nepotvrdjen: Enter/Space šalje sintetički `PointerEvent` sa `clientX: 0, clientY: 0` koji ne aktivira `pointermove`-based drag; nije verifikovano da click-based tok (klik karte → klik slota) radi kao nezavisan fallback bez drag-a; potvrdi da flow prolazi end-to-end bez pointera, i dodaj keyboard hint u `src/ui/tutorial.js` korak 2 ako drag nije jedini put (done 2026-09-03, commit 2f72666)

- [x] P2 `src/systems/ending.js` + `src/content/brand_hooks.js` — Guncati CTA nepotvrdjena: igra deklaruje `brand_serves: ["guncati"]` ali `getCTA(type, eventType)` i `brand_hooks.js` nisu verifikovani da vraćaju Guncati string ni za jedan `type`/`eventType` kombinaciju; proveri sve grane u `getCTA()`; ako Guncati CTA nedostaje, dodaj ga kao fallback za `eventType !== "outdoor"` (Guncati masterclass hook) (done 2026-09-03, commit 9333972)

- [x] P2 `src/config.js` — Vibe Start bez napetosti: `VIBE_START = 20` uz `CHURN_PENALTY = 3` i `EMPTY_SLOT_PENALTY` čini matematički crash u prvoj rundi skoro nemogućim — igrač nema razloga da pazi; podesi `VIBE_START = 30`, `CHURN_PENALTY = 4`, preračunaj `PHASE_THRESHOLDS` da oba kraja krive (legendary / crash) ostanu dostižni bez novih CRITICAL rizika (done 2026-09-03, commit f472784)

- [x] P2 `styles/ui.css` — dva accessibility duga iz iter 1: (1) `.slot-label { font-size: 0.58rem }` — ~9px na 96dpi, ispod minimuma čitljivosti na low-DPI ekranima, podesi na `0.7rem`; (2) zaključane event type kartice koriste `aria-disabled` bez `disabled` atributa na `<button>` elementima — screen reader i keyboard fokus prolaze kroz zaključane opcije, dodaj `disabled` atribut uz `aria-disabled="true"` (done 2026-09-03, commit fad6d8e)

- [x] P2 `src/ui/ending-screen.js` — Legendary ending vizuelni burst: ending screen je flat za sve tipove — Legendary (Vibe ≥ 80) ne daje vizuelni "high" koji tera na deljenje i povratak; dodaj CSS keyframe confetti/burst animaciju aktiviranu samo kad `vibeScore >= 80`; čisti CSS, bez biblioteke, bez canvas (done 2026-09-03, commit 8efb28f)

- [x] P2 `src/systems/ending.js` + `src/ui/ending-screen.js` — Crash/weak "near miss" dijagnostika: bez razloga za retry, crash ending samo frustrira; `getEndingType()` već zna tip — proširi da vrati i `worstPhase` (faza sa najvećim negativnim deltom); ending screen prikazuje jednorečeničnu lekciju ("Climax je sišao nizbrdo — Tonac je bio slab u toj fazi") koja pretvara frustration u puzzle koji vuče na run 2 (done 2026-09-03, commit 8c037f8)

- [ ] P2 `src/audio.js` — phase-specific audio klimaks: sve faze zvuče isto (linearan volume ramp), što emocionalno ravna igru; Climax (faza 4) treba bass peak, Breakdown (faza 5) treba inverzan pad — implementiraj kao per-phase parametri (`PHASE_AUDIO_PROFILE`) u postojećem phase tracking-u bez promene arhitekture audio.js

- [ ] P3 `src/ui/synergy-display.js` + `src/systems/synergy.js` — Synergy codex "N/10 otkriveno": igrač ne zna da postoji 10 synergy parova, pa nema meta-cilj između runova; dodaj persistent `discoveredSynergies` set u localStorage; synergy-display prikazuje "{N}/10 kombinacija otkriveno" kao passive tracker ispod aktivnih parova — pretvara igru u kolekcionar loop bez novog content-a

- [ ] P3 `src/content/brand_hooks.js` — Guncati masterclass deep link i narativ: zameni generički Guncati CTA string sa strukturiranim objektom koji nosi url (`guncati.rs/masterclass`), CTA tekst ("Pravi tim se gradi na Guncatiju — prijavi se na masterclass") i kontekst ("Tom Sawyer model: uči kroz pravljenje"). Aktivira se na Legendary i Solid endingu umesto blank linka.

- [ ] P3 `src/content/cards_outdoor.js` — Guncati Grand Finale signature ekspanzija: dodaj 5 novih karata Guncati tematike kao bonus Outdoor tier (Permakulturni Tonac, Bašta Host, Kompost Logistika, Seoska Content Kreatorka, Prirodnjak Obezbeđenje; power 5, flavor "Guncati Grand Finale 2026 — povratak na selo"). Mešaju se u Outdoor deck na 6+ completed runs, jačaju brand narativ direktno tokom igre.

- [ ] P3 `src/systems/ending.js` — Sezonski CTA window Guncati Grand (08-20 do 08-30): getCTA proverava `new Date()` i u tom periodu vraća event-specific poziv ("Igrao si regrutera — 23.8. vidimo se na Guncati Grand Finalu. Masterclass prijave: guncati.rs") umesto generickog stringa. Čini igru event companion alatom za taj vikend, nema trošak deploy-a — čisti JS date check.

- [ ] P3 `src/share.js` — Brand hashtag per event type u share payload: buildSharePayload dodaje dinamički hashtag (#GuncatiGrand za Outdoor, #MKDSLend za Klub, #Kluboslavija za Intimate) u share tekst. Svaki share postaje organski brand reach za odgovarajući kanal bez dodatnog UX-a.

- [ ] P3 `src/ui/menu.js` — MKDSLend "Pro Recruiter" mention posle 10 completed runs: ispod HOF displayja prikazuje mali blok sa linkom ka mkdslend.rs i tagline-om "MKDSLend — Zabavni Radni Park". Konvertuje engaged igrača (10+ partija) u MKDSLend brand awareness, zatvara loop krovnog brenda bez ometanja first-run UX-a.

- [ ] P3 `src/content/aforizmi.js` — proširiti pool sa 8 na 16 aforizama i uvesti tri triggeri konteksta: (1) synergy ≥ 4 (sadašnji, 6 aforizama "euforiznih"); (2) crisis trigger — Vibe < 30, novi pool od 5 aforizama gorkog tona (Pera u padu: kratke, rezignirane, crnohumore); (3) phase-6 finale trigger — 5 aforizama specifičnih za završni momenat, ton zavisi od Vibe-a pri ulasku u poslednju fazu. Sadašnjih 8 rasporediti po novim poolovima, ne brisati.

- [ ] P3 `src/ui.js` + `src/config.js` — phase narrative beat: dodati `PHASE_NARRATIVE` niz od 6 kratkih flavornih rečenica u `config.js` (po jedna po fazi, npr. faza 1: "Ekipa se skuplja. Ko kasni, ko je već otišao.", faza 6: "Ovo je ona noć o kojoj pričaju godinama — ili ne."), prikazivati u `src/ui.js` kao 2.5s overlay pri phase transition bez gameplay pauze.

- [ ] P3 `src/content/cards_klub.js` — Rare karta react linija: svaka od 12 Rare karata (2 Rare × 6 uloga) dobija opciono polje `react_line` — jedna rečenica u prvom licu koja se prikazuje u synergy feed-u kad ta karta čini deo aktivnog synergy para, umesto generičkog synergy naziva (npr. Tonac Rare: "Bas nisam podešavao ni na Exitu, ali ovde — ovo radi."). Micro-monolog karaktera, ne dijalog — zvuk osobe, ne razgovor.

- [ ] P3 `src/systems/ending.js` + `src/ui/ending-screen.js` — event-specific epilog: ending screen prikazuje isti tagline za sva tri event type-a; dodati `EVENT_ENDINGS` mapu sa 12 završnih slika (3 event type × 4 ending tip): Klub legendary = "Jutro te zatiče sa still-hot mikserom i 400 zadovoljnih lica."; Outdoor crash = "Kiša je počela u fazi 4. Niko nije imao plan B."; Intimate solid = "Trideset ljudi. Svi su ostali do kraja, niko nije uzeo jaknu." Zamenjuju generičke tagline, čine svaki event run memorabilnim.

## Završeni patčevi

(prazno — igra upravo released)
