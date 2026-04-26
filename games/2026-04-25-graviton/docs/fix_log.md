# Fix Log — Graviton (post-beta)

## Bug 1 — CRITICAL: Timer leak u `playBeepWarning`

**Fajl:** `src/audio.js:135`
**Problem:** `playBeepWarning` se poziva 60x/s iz `main.js` dok je G-overload aktivan. Svaki poziv kreirao novi `setTimeout` bez clearing prethodnog → deseci paralelnih beep lanaca.
**Fix:** Dodato `if (_beepTimer !== null) clearTimeout(_beepTimer)` pre `setTimeout`.

## Bug 2 — CRITICAL: Zone pool exhaust (~100 zona = ~222s pri max speed)

**Fajl:** `src/systems/generator.js:54`
**Problem:** `initGenerator` generisao 3 tutorial + 97 gameplay = 100 zona. Pri max scroll (360 px/s): 100 × 800px / 360 ≈ 222s ≈ 3.7 min. Platinum milestone (600s) bio nedostižan.
**Fix:** Pool povećan na 3 tutorial + 497 gameplay = 500 zona (~18 min pokriveno pri max speed).

## Bug 3 — MEDIUM: Visual/collision 8px mismatch u `renderPlayer`

**Fajl:** `src/render.js:220-221`
**Problem:** `physics.js` i `collision.js` tretiraju `brod.x/y` kao centar hitbox-a. `render.js` dodavao `+8` na oba (tretirao kao top-left), pa vizuelni trokut bio 8px pomeren od kolizije.
**Fix:** Uklonjen `+8` offset — `cx = brod.x; cy = brod.y`.
