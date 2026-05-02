# Fix Log — Mozaik Ludila

## Bug 1 — CRITICAL: checkGameOver na neočišćenom gridu

**Fajl:** src/input.js
**Problem:** checkGameOver se pozivao sinhronom dok su matched ćelije još bile na gridu (clearMatchedCells radi u setTimeout). Uzrokovalo lažni game over.
**Fix:** Pomeren queue update, checkGameOver i saveState unutar setTimeout callback-a, posle clearMatchedCells.

## Bug 2 — MEDIUM: Frozen state sa praznim fragmentQueue

**Fajl:** src/main.js
**Problem:** loadState() može vratiti state sa fragmentQueue: [], što ostavlja igru zamrznutom bez fragmenta.
**Fix:** Dodat defensive while loop posle load-a koji popunjava queue do 3 elementa.

## Bug 3 — LOW: Peek labele zbunjujuće

**Fajl:** src/render.js
**Problem:** Samo levi peek fragment imao labelu "← Sledeći" sa zbunjujućom strelicom.
**Fix:** Zamenjen sa "+1" i "+2" labelama ispod oba peek fragmenta.
