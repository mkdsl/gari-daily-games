# Fix Log — Kolonija 7

**Datum:** 2026-04-23
**Agent:** Jova jQuery
**Faza:** KORAK 6 — Ispravke po beta testu

---

## BUG 1 — Grid ne staje na ekran (KRITIČNO) — REŠENO

**Fajl:** `src/config.js`
**Izmena:** `CELL_SIZE: 40` → `CELL_SIZE: 32`
**Razlog:** 20 redova × 40px = 800px — ne staje na 768px ekrane. Kristal u dubokim redovima bio nedostupan. Novo: 20 × 32 = 640px + HUD = ~670px, staje na svakom ekranu.

---

## BUG 2 — `BRZE_KOPANJE` prestige bonus mrtav kod (KRITIČNO) — REŠENO

**Fajl:** `src/systems/grid.js`
**Izmena:** Dodat blok posle `digCell()` koji množi `found.food` i `found.minerals` sa 1.5 kada je `BRZE_KOPANJE` u `state.prestige.bonuses`.
**Razlog:** Bonus je bio definisan u `prestige.js` ali nikad primenjen u `handleGridInput`. Čita direktno iz state-a da izbegne cirkularne importove.

---

## BUG 3 — `doPrestige(state, null)` trovao bonuses niz (KRITIČNO) — REŠENO

**Fajl:** `src/systems/prestige.js`
**Izmena:** `state.prestige.bonuses.push(chosenBonus)` zamotan u `if (chosenBonus !== null && chosenBonus !== undefined)` proveru.
**Razlog:** Poziv sa `null` (kada igrač nema više bonusa za birati) guralo `null` u niz, što kvarilo sve `bonuses.includes()` provere.

---

## BUG 4 — `BRZE_RADNICE` bonus nikad nije radio u `tickWorkers` (OZBILJAN) — REŠENO

**Fajl:** `src/systems/workers.js`
**Izmena:** Lokalna `getPrestigeBonuses` zamenjena ispravnom implementacijom koja čita `state.prestige.bonuses` i proverava `.includes('BRZE_RADNICE')` i `.includes('VISE_RESURSA')`.
**Razlog:** Stara verzija koristila `count * 0.1` linearnu formulu umesto da čeka konkretan bonus. `VISE_RESURSA` nikad nije ni bio primenjen.

---

## BONUS FIX — `touchend` NaN koordinate — REŠENO

**Fajl:** `src/input.js`
**Izmena:** `const t = e.touches?.[0] ?? e;` → `const t = e.changedTouches?.[0] ?? e.touches?.[0] ?? e;`
**Razlog:** Tokom `touchend` eventa, `e.touches` je prazna lista — jedino `e.changedTouches` sadrži prst koji je podignut. Stari kod dao `undefined`, što je uzrokovalo `NaN` za `pointer.x/y` i kvarilo sve touch input-e.

---

## Šta NIJE promenjeno

Sve ostalo je netaknuto. Nikakav refaktoring, nikakvi novi feature-i. Samo 5 preciznih izmena u 5 fajlova.
