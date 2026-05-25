# Fix Log — Kluboslavija: Turneja 2026

## Iteracija 1 (Beta iter 1 → fix)

### FIX-C1: checkWin budget gameover
- Fajl: src/systems/progression.js
- Promena: Uslov `if (t.budget <= 0 && t.completed_events.length === 0)` promenjen u `if (t.budget <= 0)` — gameover_budget se sada okida bez obzira na broj završenih gradova. Uklonjen je i duplirani blok koji je proveravao `budget < 1000`.
- Status: ✅

### FIX-C2: Avala CTA threshold
- Fajl: src/ui.js
- Promena: Uslov `if (isAvalaEvent && totalFans >= AVALA_CTA.threshold_score)` promenjen u `if (isAvalaEvent)` — CTA se prikazuje uvek kada je Avala event aktivan, bez skorovog praga.
- Status: ✅

### FIX-M2: MacroHQ grad off-by-one
- Fajl: src/ui.js
- Promena: `const cityIdx = (t.current_city_index || 0) + 1` promenjen u `const cityIdx = t.current_city_index || 0` — HQ header sada prikazuje tekući grad umesto sledećeg.
- Status: ✅

### FIX-M3: ćirilично slovo
- Fajl: src/ui.js
- Promena: Ćirilično `о` u `'Razumeо — NASTAVI'` zamenjeno latiničnim `o` → `'Razumeo — NASTAVI'`.
- Status: ✅
