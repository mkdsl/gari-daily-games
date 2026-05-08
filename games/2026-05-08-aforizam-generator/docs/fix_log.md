# Fix Log — Aforizam Generator

## Bug 1 — MEDIUM: Animation CSS reset bez force-reflow
**Fajl:** src/ui.js  
**Fix:** Dodato `void aforizmEl.offsetWidth` pre setovanja fadeIn animacije.

## Bug 2 — MEDIUM: btnCopy kopira krivi aforizam tokom tranzicije
**Fajl:** src/input.js  
**Fix:** Uvezen `isTransitioning()` guard koji blokira copy tokom fade-a.

## Bug 3 — LOW: Label pretpostavlja Instagram
**Fajlovi:** index.html, src/share.js  
**Fix:** "Kopiraj za IG" → "Kopiraj", toast poruka platform-neutral.
