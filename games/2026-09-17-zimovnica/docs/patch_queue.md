# Patch Queue — Zimovnica

## Otvoreni patčevi

- [ ] P2 `src/render.js` — ending stats grid: promeni `gridTemplateColumns` sa `repeat(3, 1fr)` na `repeat(2, 1fr)` u `buildEndingStats` (linija ~569). 6 DOM elemenata (3 label/value para) u 2-col gridu = 3 ispravne kolone label | value. Validovano: beta_report_2.md [BUG-07]
- [ ] P2 `src/systems/time_system.js` — bačva minimum check: u `actionBacvaInit` dodaj explicit guard `if ((params?.kg || state.sirovine.kupus) < 20) return { ...state, log: [...state.log, { day: state.day, text: '⚠️ Bačva zahteva min 20 kg kupusa.', type: 'warning' }] };` pre `initBacva` poziva. Disabled condition na dugmetu je 10 kg — missmatch sa recipe-om. Validovano: beta_report_2.md [BUG-08]
- [ ] P2 `src/render.js` + `src/systems/time_system.js` — džem šljive mismatch: u `buildActionGrid` za džem promeni `kg: Math.max(0, s.jabuke || 0)` u `kg: Math.max(0, (s.jabuke || 0) + (s.sljive || 0))`. U `actionPraviDzem` dodaj branching: ako `params.kg_jabuke > 0` koristi jabuke, inače šljive — ili koristi `Math.min(params.kg, s.jabuke || 0)` za jabuke i ostatak iz šljiva. Cilj: igrač sa samo šljivama može uspešno napraviti džem. Validovano: beta_report_2.md [NEW MEDIUM]

## Završeni patčevi

_(prazno)_
