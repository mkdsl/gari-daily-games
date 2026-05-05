# Fix Log — Avala Run (2026-05-06)

## Bug 1 — CRITICAL: Avala silueta ne scrolluje
**Fajl:** src/systems/world.js  
**Problem:** Dvostruko množenje parallax offset-a (0.15 × 0.15 = 0.0225x) — silueta praktično nepokretna.  
**Fix:** Uklonjen sekundarni 0.15 multiplier u `drawAvalaSilhouette`.

## Bug 2 — MEDIUM: Touch phantom jump/duck
**Fajl:** src/input.js  
**Problem:** `touchend` nije resetovao `jumpPressed`/`duckPressed` — zaostale true vrednosti na sporijim uređajima.  
**Fix:** Dodato `input.jumpPressed = false; input.duckPressed = false;` u touchend handler.

## Bug 3 — LOW: Ticket URL display tekst
**Fajl:** src/ui.js  
**Problem:** Display tekst prikazuje `bilet.rs/show/261` umesto `app.bilet.rs/show/261`.  
**Fix:** Display tekst ažuriran da odgovara stvarnom URL-u.
