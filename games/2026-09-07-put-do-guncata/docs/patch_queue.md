# Patch Queue — Put do Guncata

## Otvoreni patčevi

### Nega (P1/P2 — tehnički dug)
- [x] P1 `index.html` + `src/ui.js` — ukloniti statički `#hud` div iz HTML-a (duplikat ID, invalid HTML), `initHUD` ga već dinamički kreira (done 2026-09-10, no-op — hud div bio uklonjen u polish commit de3822d)
- [x] P1 `src/main.js` — dodati guard log kad su `cbs.onEnd` i `cbs.next` oba nullish u `onPlayAgain` fallback-u (silent no-op edge case) (done 2026-09-10, commit e8ccbe8)
- [x] P2 `src/systems/branching.js` + `src/state.js` — `resetBranching()` se poziva samo u `startBtn` click-u, dodati i u `initState()` da bude idempotentan (done 2026-09-10, commit 88e425c)
- [ ] P2 `src/input.js` — `detachFrom` eksportovan ali niko ga ne zove; kompletirati par `attachTo`/`detachFrom` u `router.js` stage tranzicijama da se spreči potencijalni listener leak
- [ ] P2 `src/entities/scenes/etapa2-autoput.js` — color-hint na `scoreEl` maskira ali ne rešava konfuziju (igrač vidi "+3" i isti broj); dodati kratki tooltip/aria-live "biće uračunato na kraju etape"

### Iskra (P3 — brand hooks)
- [ ] P3 `src/content/brand_hooks.js` — masterclass CTA prikazan samo za zeleni score bucket; proširiti na sve tri varijante sa sezonskim copy-em za celogodišnji Guncati masterclass funnel
- [ ] P3 `src/ui/end-screen.js` — dodati "bio sam tamo" path via localStorage bridge sa Guncati Grand/Pasošem za povratnike, pretvara igru u keepsake ne samo teaser
- [ ] P3 `src/content/aforizmi.js` — dodati event-tied Pera Period linije za svaku Kluboslavija stanicu turneje (Avala, Štrand, Sarajevo, Guncati) u radio overlay pool
- [ ] P3 `src/share.js` + `src/content/brand_hooks.js` — event-specifičan share copy za Guncati Grand finalni period (sept-okt 2026), svaki share postaje direktan promo

### Dule (P2/P3 — retention i emocionalna kriva)
- [ ] P2 `src/ui/end-screen.js` + `src/systems/prestige.js` — end-screen ne komunicira koliko varijanti igrač još nije video (ruta×dan/noć kombinatorika), dodati vizuelni signal tipa "Ostale ti 2 rute + noćna vožnja" da prestige unlock bude pull, ne push
- [ ] P2 `src/ui/end-screen.js` — epilog nema personalizovan trag koji igrač prepoznaje kao "moj run": ubaciti jedan konkretan detalj puta (ime rute + aforizam koji je čuo na radiju etape 1–2) u zaključnu karticu da dolazak oseća earned, ne generički
- [ ] P2 `src/ui/share-card.js` — share karta uvek koristi jezero paletu bez obzira na rutu — personalizovati background po etapa-3 izboru (beton za brzinu / žito za slikovitost / šuma za sigurnost) jer igrač deli identitet "kojim putem sam išao", ne samo score
- [ ] P3 `src/content/dialogues.js` — etapa 2 (~3 min, najduža) nema mid-journey emocionalni break: dodati kratak unutrašnji monolog aktiviran prvom promenom radio stanice koji spušta napon i daje psihološki "predah" pre random eventa, bez promene mehanike
- [ ] P3 `src/systems/branching.js` + `src/content/branching-tree.js` — etapa 4 počinje bez reference na izbor iz etape 3, što slabi osećaj posledica: dodati jednu "naknadnu misao" liniju na ulasku u etapu 4 koja direktno imenuje izabranu rutu ("Brži put — ali niko nije rekao da je i ravniji.")

### Sine (P3 — narativna ekspanzija)
- [ ] P3 `src/content/aforizmi.js` — ruta-specifičan Pera Period aforizam pool za radio overlay (svaka od 3 rute u etapi 2 čuje drugačije citate, svaki run je unikatna "radio emisija")
- [ ] P3 `src/content/dialogues.js` — etapa 3: unutrašnje misli pred svaku tablu (9 varijanti — 3 table × 3 raspoloženja), igrač oseća dramsku dilemu a ne samo UI labelu
- [ ] P3 `src/content/branching-tree.js` — "putničke beleške" micro-tekst na kraju etape 4 koji zatvara narativni luk odabrane rute pre epiloga, daje koheziju celom run-u
- [ ] P3 `src/content/brand_hooks.js` — sezonske varijante Braninih linija (mart/jun/septembar) da igra funkcioniše kao evergreen Guncati companion, ne samo avgustovska promo
- [ ] P3 `src/content/dialogues.js` — etapa 4: "umorni vozač" inner monologue per vrsta prepreke (šaraf/blato/grana), daje osobnost šumskoj sekciji bez dodirivanja mehaničkih sistema

## Završeni patčevi
