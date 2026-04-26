# Rovovi i Ruševine

## Žanr
Strategy mini — turn-based grid (hex-like kvadratna mreža), sa tower-defense elementima

## Premisa
Godina 1917. Zapadni front. Ti si komandir malog odreda koji mora da probije neprijateljske rovove pre nego što zalihe municije ponestanu. Svaki potez je odluka: rasporedi vojnike, postavi mitraljeze, pusti dimnu zavesu ili napadni. Neprijatelj se ne kreće mehanički — reaguje na pritisak, povlači se, poziva pojačanje. Igra je taktički slagalica u uniformi rata.

## Core Gameplay Loop
- **Priprema faze** (3-5 sekundi) — pogledat mrežu, videti neprijateljske pozicije, odabrati akciju iz menija
- **Postavljanje** — prevuci (ili klikni) jedinice na target ćelije pre nego što se potez odigra
- **Izvršenje** — pritisni "Potez!" i gledaj kako se sve odvija odjednom (simultano rešavanje); animacije traju 0.8s
- **Neprijateljev odgovor** — AI premešta jedinice, popunjava rovove, možda izvlači artiljeriju
- **Resursi i pritisak** — svaki potez troši meci ili živote; ako ostaneš bez municije, možeš da juriš (rizično) ili se povučeš (kraj)
- **Napredak** — probiješ li prvu liniju rovova, otvara se druga sa novim tipovima neprijatelja; 3 linije = pobeda

## Hook
Svaki potez izgleda kao da ima jedno "tačno" rešenje koje igrač neće pronaći odmah — a kada ga pronađe, oseća se kao genijalni komandir.

## Vizuelna Estetika
Paleta: tamni sepija (#2B1B0E), prljavo bela (dim, magla — #D4C9A8), zarđalo crvena za neprijatelje (#8B2500), maslinasto zelena za saveznike (#4A5C2A). Grid prikazan kao mokra zemlja sa linijama rovova. Jedinice su sitne ikonice rađene čistim CSS-om i Canvas draw (krug + ikona). Magla rata: ćelije koje nisu u vidokrugu prikazane tamnije. Efekti: mali "puf" dim za pucnjavu, crveni flash za pogodak. Bez pixelarizacije — čist, uglasti minimalizam sa military-map estetikom (kao ručno crtana karta).

## Audio Mood
Sporo, napeto — duboki dron sa povremenim udaljenim topovskim plotunima; u fazi izvršenja kratki pucnji i metalni zveketi generisani Web Audio-om.

## Win Condition
Probiješ sva 3 neprijateljska rovna pojasa za maksimalno 20 poteza. Sistem daje ocenu (S/A/B/C) na osnovu preostalih života i potrošene municije. Nema "beskonačnog" moda — svaki run je isti ili randomizovan (konfiguracioni flag), dug 10-15 poteza za iskusnog igrača.

## Targetirana Dužina Sesije
8-12 minuta po runu; jedan pokušaj može trajati i 4 minute ako igrač brzo odlučuje. Poraz (nema municije, svi vojnici mrtvi) je čest u prvim runovima — igra je dizajnirana za 2-3 pokušaja pre prve pobede.

## Tehničke Napomene
- **Canvas za grid i animacije** — 2D grid 12×8 ćelija (konfigurabilno), svaka ćelija ~60px; canvas se skalira responsivno
- **DOM za UI** — HUD, meni akcija, ocena na kraju
- **Grid sistem je srce igre** — modul `systems/grid.js` drži matricu stanja ćelija; svaka ćelija zna ko je na njoj, tip terena (rov, otvoreno, ruševina) i vidljivost (fog of war)
- **AI modul** (`systems/ai.js`) radi jednostavan minimax/rule-based (ne pun minimax) — reaguje na gustoću igrača, povlači se ako napadnut s boka, zove pojačanje ako slobodna ćelija postoji
- **Turn engine** (`systems/turn.js`) — sakuplja naređenja, rešava simultano (priority queue), generiše animacione event-e
- **Touch podrška** — tap za selekciju, tap na target za akciju; hover state na desktoppu
- **Bez eksternih resursa** — sve boje, linije rovova, ikonice jedinica idu kroz Canvas drawRect/arc/path; nijedan PNG nije potreban
- **Scope procena:** ~2800-3200 linija JS ukupno (grid + AI + turn + render + UI + entiteti)
