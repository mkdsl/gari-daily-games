# Patch Queue — Jesenji Tok

## Otvoreni patčevi

<!-- Nega P1/P2 — tehnički dug, LOW bugovi iz beta, potencijalne regresije -->

<!-- Iskra P3 — brand hooks, Guncati/Kluboslavija sprega u narednih 6 meseci -->
- [x] P3 `src/content/brand_hooks.js` — Dinamičan masterclass CTA per rang (done 2026-09-07, commit f3381ab)
- [x] P3 `src/content/brand_hooks.js` + `src/share.js` — Stories 9:16 share card (done 2026-09-07, commit 0af27e1)
- [x] P3 `src/content/brana_dialogs.js` — Weather agroekološki saveti po presetima (done 2026-09-07, commit aa96633)
- [x] P3 `src/content/tasks.js` — edu_deep_link po zadatku za Guncati content hub (done 2026-09-07, commit f1e96a2)
- [x] P3 `src/content/brand_hooks.js` — Kluboslavija grand finale cross-promo (done 2026-09-07, commit 6eb0710)

<!-- Sine P3 — narativna ekspanzija, dijaloški lukovi, content koji produžuje igru -->
- [ ] P3 `src/content/brana_dialogs.js` — dodati "priču po zadatku": kratki micronarativ (1–2 rečenice) koji se prikazuje kao Brana overlay u trenutku kad igrač postavi karticu na grid — svaki od 6 radova dobija svoju anegdotu sa imanja: Micelij: "Dedina šuma još uvek miriše na bukovač. On se ne seje — pamti se mesto."; Ozimo: "Baka bi rekla: žito u zemlju pre Miholjdana i zima ne može da te iznenadi."; Jezero: "Riba ne čeka da ti bude zgodno. Pripremiš je ti, ili zima pripremi nju."; Graditeljski: "Zid koji se diže pre kiše stoji trideset godina. Zid koji čeka proljeće — čeka."; Rezidba: "Voćnjak koji ne odrežeš vrati ti duplo manje sledeće proleće — drvo ne zaboravlja."; Kompost: "Sve što baciš, vraća se. Pitanje je samo — kad i u kakvom obliku."
- [ ] P3 `src/content/brana_dialogs.js` — proširiti weather arc: svaki od 4 weather preseta treba zaseban Brana opening monolog na startu sesije (ne samo generički weather komentari na nedeljnom nivou) — sunny: "Lepo vreme vara — ko sedne, propustio je prozor."; rainy: "Kiša te ne pita. Plan mora da je spreman i kad nebo ne pristaje."; overcast: "Magla ne znači kraj — znači da moraš da znaš šta radiš i bez sunca."; mixed: "Svaka nedelja je priča za sebe. Raspored mora da izdrži sve četiri." — ovi monolozi se prikazuju jednom na početku sesije u bočnom panelu, ne kao tooltip
- [ ] P3 `src/content/brana_dialogs.js` + `src/ui/score-screen.js` — dodati "Ekosistem glas": specijalni Brana overlay kad igrač postavi sva tri rada koji čine ekosistem bonus (Micelij + Jezero + Kompost) u prozor — prikazuje se jednom pri postavljanju trećeg od tri — tekst: "Zemlja je šuma, voda i trulež. Ko razume ovo, razume zašto se ne gradi bez komposta, ne zasejava bez gljiva, ne zimi bez jezera. Sve ostalo je dekoracija." — vizuelno: zlatni glow-flash simultano na sve tri kartice; score-screen.js prikazuje posebnu ikonu ekosistema pored x1.5 multiplikatora
- [ ] P3 `src/content/brana_dialogs.js` + `src/ui/prestige-screen.js` — prestige-arc narativ: "Drugi sezon" ekran treba različit Brana uvodni monolog po broju prestige resetova — run 1: "Prošao si zimu. Nije malo."; run 2: "Drugi krug je drugačiji — znaš kuda vodi svaka greška."; run 3+: "Stari majstor ne planira jer mora. Planira jer je to jedini način da zemlja ostane zemlja." — prestige-screen.js poziva novu getPrestigeNarrative(runCount) iz brana_dialogs.js; tekst se pojavljuje kao intro pre prikaza tri bonus opcije
- [ ] P3 `src/content/brana_dialogs.js` — inter-task easter egg komentari za 3 kombinacije radova: (1) Rezidba i Jezero u susednim nedeljama → "Nož i voda — prvo odrežeš što je odslužilo, pa uliješ što treba da prezimi. Red nije slučajnost."; (2) Graditeljski i Ozimo u istoj nedelji (maksimalan angažman radnih grupa) → "Kad sve grupe rade odjednom, nema greške — samo ritam."; (3) svi radovi završeni u prozoru na mixed weather presetu → unlock kratak epilog pred zimsku buru: "Zemlja je uzela šta je njena i ostavila šta je tvoje. Eto celog sporazuma." — achievements.js detektuje ove kombinacije i triggeruje dialog overlay

<!-- Dule P2/P3 — retention, emocionalna kriva, "još jedan run" faktor -->
- [x] P2 `src/ui/score-screen.js` — Emotivno diferenciran bura reveal po rangu (done 2026-09-07, commit de00691)
- [x] P2 `src/content/brana_dialogs.js` + `src/ui/prestige-screen.js` — Branin glas na prestige opcijama (done 2026-09-07, commit 3b7b7a5)
- [x] P2 `src/ui/score-screen.js` + `src/content/brana_dialogs.js` — Pedagoški "Šta je puklo" sloj (done 2026-09-07, commit 7f11dbb)
- [ ] P3 `src/systems/achievements.js` + `src/content/brana_dialogs.js` — "Brana Mode" trostepeni unlock za long-term retention: trenutno achievement otključava jedan dialog overlay. Proširiti na 3 sloja — Run 1 all-in-window: Branine memorije po zadatku (postojeće); Run 2 all-in-window na prestige runu: šest CSS "slike sećanja" po jedna per task (CSS ilustracija, 0 eksternih fajlova); Run 3 sva 4 weather preseta preživeljena: unlock "Tajna parcela" — sedmi rad koji se pojavljuje samo od runa 3+ (npr. "Zimska pčelinja priprema", prozor okt 1–nov 1). Ovo daje eksplicitni long-term hook koji igra trenutno nema iza prvog prestige-a.
- [ ] P3 `src/ui/prestige-screen.js` — Emocionalni ritam pre bonus izbora: na lošem runu (score < 300) prestige screen trenutno otvara sa neutralnim tonom identičnim dobrom runu. Dodati 3-sekundnu "Brana pauzu" pre nego što se opcije pojave — ambient zvuk ostaje, UI zvukovi ne sviraju, header prikazuje "Zemlja trpi. Brana uči." umesto "Drugi sezon." Na runu ≥ 600 header ostaje "Drugi sezon." Ovaj mali ritualni prelaz pravi razliku između refleksivnog restart-a i mehaničkog klik-reset-a — sezona zaista počinje iznova.

## Završeni patčevi

- [x] P2 `src/input.js` + `src/ui.js` + `styles/game.css` — Escape feedback na score/bura overlay: shake animacija + aria-live poruka (done 2026-09-07, commit f49c944)
- [x] P1 `src/main.js` — `total_runs` divergencija: `handlePlayAgain` sada kopira `state.total_runs` u novi state (analogno prestige putu) (done 2026-09-06, commit 502bb0e)
- [x] P2 `src/main.js` — uklonjen dead import `skipPrestige` (done 2026-09-06, commit 9c0223a)
- [x] P2 `src/main.js` — `scoreResult.is_new_best` sada popunjen povratnom vrednošću `saveBestScore()` (done 2026-09-06, commit bc398ae)
- [x] P2 `src/systems/validation.js` — uklonjen dead export `checkEcoBonusFeasibility` (done 2026-09-06, commit 3618979)
