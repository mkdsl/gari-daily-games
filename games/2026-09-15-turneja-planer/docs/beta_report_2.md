# Beta Report 2 — Turneja Planer
**Datum:** 2026-09-16
**Iteracija:** 2 (post-fix re-test)
**Beta Trio:** Zora · Raša · Lela

## Beta Score: 7.8/10

## Fix verifikacija

- **C1 revenue: POTVRĐEN**
  `computeCityResults` (main.js:252–254) izračunava `revenue = attendance × 8 × promoMult(split.promo)` i dodaje ga na `newState.resources.budget` (linija 308). Napomena: koristi lokalnu konstantu `TICKET_PRICE = 8` umesto importovanog `TICKET_PRICE_EUR` iz config.js — funkcionalno identično, ali nedoslednost sa deklarisanim fix-om. LOW napomena, ne bug.

- **C2 travel cost: POTVRĐEN**
  `on('route_selected')` (main.js:63–66) poziva `calcRouteCost(route)` (import dodat na liniji 14) i odmah primenjuje `applyResourceDelta(state, { budget: -travel_cost })` pre `setState`. Travel cost se oduzima pre crew select ekrana.

- **M1 budget UI: POTVRĐEN (render) / DJELIMIČNO — vidi Novi bugovi**
  `renderCityBudget` (render.js:171–172) izračunava `available = Math.max(0, state.resources.budget - crew_cost)` i koristi je za "Dostupno" label i slider max atribute. Render je tačan. Međutim, handler nije ažuriran — vidi Bug #1 ispod.

- **M2 Guncati gate: POTVRĐEN**
  `doTransit()` (main.js:329–346) proverava `next_city_id === 'guncati'`, poziva `checkGuncatiGate(state.resources.reputation)`, i ako `gate.ok === false` — poziva `accumulateFanDB` pre nego što postavi `screen: 'ending'` sa `ending_id: 'GUNCATI_ZATVOREN'`. Return sprečava dalji transit flow. Redosled operacija ispravan.

- **L1 dead code: POTVRĐEN**
  `evaluateEnding` u endings.js (linija 90–97) ne sadrži granu `budget > 500 && reach >= 40`. Grana je uklonjena. Logika završetka je čista i dostižna za sve putanje.

---

## Novi bugovi

### Bug #1 — MEDIUM: `budget_slider` handler koristi pun budžet kao ceiling (ne `available`)

**Fajl:** `src/main.js`, linija 93–95

**Opis:**
```js
on('budget_slider', ({ key, value }) => {
    const split = { ...state.budget_split, [key]: value };
    const total = splitTotal(split);
    if (total > state.resources.budget) {          // ← BUG: treba budget - crew_cost
      split[key] = Math.max(0, state.resources.budget - splitTotal({ ...split, [key]: 0 }));
                            // ↑ BUG: isti problem u clamp logici
    }
    ...
    updateBudgetPreview(split, state.resources.budget);  // ← BUG: treba available, ne budget
});
```

**Efekt:** M1 fix je ažurirao render (slider HTML max atributi postavljeni na `available = budget - crew_cost`), ali kombinovani ceiling u handleru ostaje `state.resources.budget` (pun budžet). Svaki slider individualno ne može preći `available`, ali kombinovani zbir tri slidera može dostići pun budžet (`budget`), ne samo `available`. Razlika = `crew_cost`.

**Konkretan scenario (crew €400/dan, budget €2000, available €1600):**
- Transport = 500, Promo = 1000, Tech = 100 → total = 1600 (nije blokiran, tačno)
- Transport = 500, Promo = 1000, Tech = 600 → total = 2100 → handler clamp-uje na 2000, ne na 1600
- Rezultat: `startCityEvent()` oduzima crew_cost (400) + split_total (2000) od budžeta (2000) → **budget = -400**
- Ending POREZ_I_DUG isprovociran greškom alata, ne lošim igranjem — narrative integrity narušena.

**Severity: MEDIUM** — igra ne crashuje, max overdraft je bounded na visinu crew_cost, ali finansijska logika igre se pokvari tihim negativnim budžetom.

**Fix:** Linija 93 treba biti `if (total > state.resources.budget - totalDailyRate(crew))`, uz isti uslov u clamp liniji 95. `updateBudgetPreview` u liniji 98 treba da prosledi `available` umesto `state.resources.budget`.

---

## Zaključak

Pet originalnih bugova (C1, C2, M1 render, M2, L1) fiksirani su tačno kako je deklarisano u fix_log.md. Core loop sada funkcioniše: revenue od ulaznica teče u budžet, travel cost se oduzima pri odabiru rute, Guncati gate blokira nedostojne igrače, dead code je uklonjen.

**Jedan novi MEDIUM bug** uveden M1 fix-om — render je popravljen ali handler nije. Bugovi nema CRITICAL kategorije.

**Preporuka: još jedna fix iteracija** (samo `src/main.js`, budget_slider handler — jednolinijaška korekcija × 2). Posle toga: score >= 8.0, 0 CRITICAL → KORAK 6.75 auto-release gate moguć.
