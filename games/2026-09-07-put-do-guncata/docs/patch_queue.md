# Patch Queue — Put do Guncata

## Otvoreni patčevi

- [ ] P2 `src/ui/end-screen.js` + `src/systems/prestige.js` — end-screen ne komunicira koliko varijanti igrač još nije video (ruta×dan/noć kombinatorika), dodati vizuelni signal tipa "Ostale ti 2 rute + noćna vožnja" da prestige unlock bude pull, ne push
- [ ] P2 `src/ui/end-screen.js` — epilog nema personalizovan trag koji igrač prepoznaje kao "moj run": ubaciti jedan konkretan detalj puta (ime rute + aforizam koji je čuo na radiju etape 1–2) u zaključnu karticu da dolazak oseća earned, ne generički
- [ ] P2 `src/ui/share-card.js` — share karta uvek koristi jezero paletu bez obzira na rutu — personalizovati background po etapa-3 izboru (beton za brzinu / žito za slikovitost / šuma za sigurnost) jer igrač deli identitet "kojim putem sam išao", ne samo score
- [ ] P3 `src/content/dialogues.js` — etapa 2 (~3 min, najduža) nema mid-journey emocionalni break: dodati kratak unutrašnji monolog aktiviran prvom promenom radio stanice koji spušta napon i daje psihološki "predah" pre random eventa, bez promene mehanike
- [ ] P3 `src/systems/branching.js` + `src/content/branching-tree.js` — etapa 4 počinje bez reference na izbor iz etape 3, što slabi osećaj posledica: dodati jednu "naknadnu misao" liniju na ulasku u etapu 4 koja direktno imenuje izabranu rutu ("Brži put — ali niko nije rekao da je i ravniji.")

## Završeni patčevi
