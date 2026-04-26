# Fix Log — Rovovi i Ruševine

## Beta Fixes (2026-04-26)

### Fix 1: Ammo leak pri prepisivanju akcija
**Fajl:** `src/main.js` — `queueAction()`
**Problem:** Kada igrač klikne PUCAJ (oduzima 2 metka), pa isti vojnik dobije drugu akciju, prethodna SHOOT/SMOKE akcija se brisala bez refunda metaka.
**Rešenje:** U `queueAction`, pre overwrite-a, pronalazi prethodnu akciju istog vojnika i refunduje ammo cost: `+CONFIG.AMMO_SHOOT` za SHOOT, `+CONFIG.AMMO_SMOKE` za SMOKE.

### Fix 2: Artillery spawn van vidokruga na mobilnom
**Fajl:** `src/entities/enemy.js` — `spawnLineEnemies()`, linija 3
**Problem:** Artillery se spawnovao na x=10, ali MOBILE_COLS=9 prikazuje samo kolone 0-8. Na mobilnom ekranu artillery je bio nevidljiv i neigrivao.
**Rešenje:** x promenjen sa 10 na 8.

### Fix 3: Negativan offsetY na kratkim ekranima
**Fajl:** `src/render.js` — layout computation
**Problem:** Desktop grid (8×60=480px) centriran vertikalno daje negativan offsetY na ekranima visine <520px, što gura grid van ekrana.
**Rešenje:** `Math.max(40, ...)` clamp obezbeđuje minimum 40px razmaka od vrha (ispod HUD-a).
