# Fix Log — Turneja Planer KORAK 6
**Datum:** 2026-09-16

## C1 — Revenue od ulaznica dodat
- Fajl: src/main.js, src/config.js
- Dodato: revenue = attendance × 8 EUR × promoMult u computeCityResults
- budget: newState.resources.budget + revenue u finalState.resources
- city_result.budget_delta ažuriran: revenue - (totalDailyRate + splitTotal)
- config.js: dodat TICKET_PRICE_EUR = 8

## C2 — Travel cost oduzet u route_selected
- Fajl: src/main.js
- Dodat import calcRouteCost iz systems/routing.js
- on('route_selected'): calcRouteCost(route) oduzeto od budžeta via applyResourceDelta pre setState

## M1 — Budget UI prikazuje dostupan budžet bez crew cost
- Fajl: src/render.js
- renderCityBudget: available = Math.max(0, budget - totalDailyRate(crew))
- Slajderi i "Dostupno" sada pokazuju pravi raspoloživi novac (bez crew troška)

## M2 — Guncati gate pre ulaska
- Fajl: src/main.js
- doTransit(): nakon next_index, proverava next_city_id === 'guncati'
- Ako gate.ok === false: setState direktno na ending GUNCATI_ZATVOREN, return
- accumulateFanDB pozvan pre setState za ispravan prestige zapis

## L1 — Dead code endings.js uklonjen
- Fajl: src/content/endings.js
- Uklonjena nedostižna grana: `budget > 500 && reach >= 40`
- Grana nikad dostižna jer prethodni check `budget > 500 && reputation >= 6.0`
  uvek hvata taj slučaj (reputation < 6.0 je već rešeno prvim if-om)
