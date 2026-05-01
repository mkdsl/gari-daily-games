# Fix Log — Poslednja Smena

## Bug 1 — CRITICAL: Nema audio mute UI
Dodat fiksni audio toggle button u `initUI()` funkciji u `src/ui.js`. Dugme se kreira jednom pri inicijalizaciji i dodaje u `#game-root` DOM element. Koristi dinamički `import('./audio.js')` da izbegne circular dependency. Ikonica se menja između 🔊 i 🔇 prema trenutnom stanju. Dodat odgovarajući CSS u `styles/ui.css` — dugme je fiksirano u gornjem desnom uglu, uvek vidljivo.

## Bug 2 — MEDIUM: Kraj A praktično blokiran prvim izborom
U `src/systems/narrative.js`, u funkciji `determineEnding`, promenjen threshold za gorčinu sa `gorčina <= LOW` (35) na `gorčina <= 40`. LOW konstanta ostaje 35 jer je koriste i drugi delovi logike (npr. `allNeutral` provera). Samo Kraj A sada ima blaži uslov za gorčinu, što ga čini dostižnim čak i kad igrač napravi jedan izbor koji blago povećava gorčinu.

## Bug 3 — LOW: _buildStatLines threshold nekonzistentan
U `src/ui.js`, u funkciji `_buildStatLines`, sva četiri poređenja promenjena sa `> high` u `>= high`. Ovo je konzistentno sa tim kako je `HIGH` definisan u ostatku sistema (kao inkluzivna granica). Statistika tačno na vrednosti `high` (65) sada ispravno aktivira odgovarajući opis u epilog kartici.
