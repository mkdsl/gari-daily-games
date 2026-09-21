# Fix Log — Zimovnica (KORAK 6)
**Datum:** 2026-09-21

## Fiksovani bugovi

### [BUG-01] Recipe kg default — src/render.js
`buildActionGrid` je dodao `kg:` polje na svaki recipe action objekat sa default vrednošću iz trenutnih zaliha (`Math.max(0, s.paprike || 0)` za ajvar, `s.paradajz` za sos/pelat, `s.jabuke` za džem, `s.sljive` za pekmez, `s.krastavci + s.bostanusa` za turšiju, `s.kupus` za bačvu, `jabuke >= 15 ? jabuke : sljive` za rakiju). `buildActionBtn` prosljeđuje `actionDef.kg` u `btn.dataset.kg` kada je definirano. Svi recipe handleri koji provjeravaju `params.kg` sada dobijaju stvarnu vrijednost.

### [BUG-02] Event screen — src/main.js
`nextDay()` sada provjerava `state.today_events?.length > 0` posle `saveGame` i poziva `setScreen('event')` umjesto `renderFrame()` kada postoje eventi. `handleAction` je ažuriran — za `event_choice` akcije, ako nema više `today_events` posle resolucije, prebacuje na `setScreen('game')` umjesto `renderFrame()`.

### [BUG-03] event_choice handler — src/systems/time_system.js
Dodan import `resolveEvent` iz `./event_engine.js`. Dodan `case 'event_choice': return actionEventChoice(state, persistent, params);` u `processAction` switch. Implementirana nova helper funkcija `actionEventChoice` koja pronalazi event u `today_events` po `eventId`, mapira `choiceId` na indeks u `choices` arrayu, poziva `resolveEvent(state, eventId, safeIdx, persistent)`, uklanja razriješeni event iz liste i vraća ažurirani state. Slot guard u `processAction` izuzima `event_choice` (event resolucija ne troši slotove).

### [BUG-04] Rakija case u actionKuvanje — src/systems/time_system.js
Dodan `case 'rakija': return actionDestilisiRakiju(state, persistent, params);` u `actionKuvanje` switch. Rakija dugme sada korektno poziva destilaciju.

### [BUG-05] Ajvar → actionTociAjvar — src/systems/time_system.js + src/render.js
`actionKuvanje` za `'ajvar'` route-uje na `actionTociAjvar` (preskočen intermediate `actionPeciPaprike` korak). `actionTociAjvar` automatski koristi `pečene_paprike` ako postoje, inače svježe paprike. Dugme "Peči ajvar" sada kosta 2 slota (kao `actionTociAjvar`) i kreira tegle direktno. Igrač ne mora prolaziti kroz 2-step proces.

### [BUG-06] Log panel prazan — src/render.js
Uklonjen `renderLog(state.log)` poziv iz `renderGame` dok je `screen` element još izvan DOM-a. Zamjenjen direktnom DOM gradnjom logPanel-a unutar `renderGame`: `state.log.slice(-8).reverse()` kreira div elemente sa `log-entry {type}` klasom i `[D${day}] ${text}` sadržajem, koje appenda na logPanel prije nego što `screen` ide u `root`. querySelector problem eliminisan.

---

## Nije fiksirano (LOW, naredni krug)

- **BUG-07** — Ending stats grid vizuelno broken (3-col layout, label/value alterniraju pogrešno) — `src/render.js` `buildEndingStats`
- **BUG-08** — `actionBacvaInit` preskače 20kg minimum check — `src/systems/time_system.js` `actionBacvaInit`
