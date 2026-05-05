# Fix Log: Bespuće

## Bug 1 — CRITICAL: Checkpoint marker nikad ne prikazuje
**Problem:** createCheckpoint() nije pozivano.
**Fix:** Dodat import i createCheckpoint() poziv u updateChunks() kada chunk.checkpointLocalX >= 0.
**Fajl:** src/systems/chunks.js

## Bug 2 — CRITICAL: Crystal score ignoriše multiplier
**Problem:** index.js formula kristale množi bez multiplier/score2x.
**Fix:** Unifikovana formula u index.js; uklonjen redundantni run.score += iz collision.js.
**Fajlovi:** src/systems/index.js, src/systems/collision.js

## Bug 3 — MEDIUM: Mobilni thrust zona nevidljiva
**Problem:** drawTouchZones() nema hint za gornju zonu.
**Fix:** Dodat semi-transparentni outlined rect + "▲ TAP — THRUST" tekst u drawTouchZones().
**Fajl:** src/render.js

## Bonus — TEHNIKA: ctx.scale akumulira na resize
**Problem:** scale() bez prethodnog reset — mogući vizuelni glitch.
**Fix:** ctx.setTransform(1,0,0,1,0,0) pre scale() u resize().
**Fajl:** src/main.js
