# Beta Report 3 — Turneja Planer
**Datum:** 2026-09-16
**Iteracija:** 3 (post-fix re-test za Bug #1 iz iter 2)
**Beta Trio:** Zora · Raša · Lela

## **Beta Score: 8.5/10**

---

## Fix verifikacija — Bug #1 (MEDIUM iz iter 2): POTVRĐEN

`src/main.js`, handler `on('budget_slider', ...)`, linije 90–100:

```js
on('budget_slider', ({ key, value }) => {
  const crew = state.selected_crew_ids.map(id => CREW_MAP.get(id)).filter(Boolean);
  const available = Math.max(0, state.resources.budget - totalDailyRate(crew));  // ✓ crew oduzet
  const split = { ...state.budget_split, [key]: value };
  const total = splitTotal(split);
  if (total > available) {                                                        // ✓ ceiling = available
    split[key] = Math.max(0, available - splitTotal({ ...split, [key]: 0 }));   // ✓ clamp = available
  }
  state = { ...state, budget_split: split };
  updateBudgetPreview(split, available);                                          // ✓ preview dobija available
});
```

Sve četiri tačke iz Bug #1 opisa su fiksirane. Kombinovani zbir tri slidera ne može preći
`available = budget - crew_cost`. Scenario iz iter 2 (crew €400/dan, budget €2000 → overdraft
−€400) više nije moguć.

`src/render.js`, `renderCityBudget` (linija 171–172): nepromenjen od iter 2, tačan i dalje.

---

## Nasleđeni nalazi iz iter 2 — status

- **C1 revenue:** POTVRĐEN (nepromenjeno)
- **C2 travel cost:** POTVRĐEN (nepromenjeno)
- **M1 budget UI render:** POTVRĐEN (nepromenjeno)
- **M2 Guncati gate:** POTVRĐEN (nepromenjeno)
- **L1 dead code:** POTVRĐEN (nepromenjeno)
- **Bug #1 MEDIUM handler ceiling:** POTVRĐEN kao fixed (vidi gore)

---

## 0 CRITICAL bugova

Nema novih nalaza. Nema otvorenih CRITICAL u nijednom `beta_report*.md`.

---

## Finalna preporuka

**Auto-release spreman: DA**

Score 8.5/10, 0 CRITICAL — KORAK 6.75 uslovi ispunjeni. Pipeline može nastaviti na KORAK 7.
