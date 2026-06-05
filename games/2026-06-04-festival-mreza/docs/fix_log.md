# Fix Log — Festival Mreža (posle Beta iter 1)

## Rešeni CRITICAL

- **CRITICAL-01 — Coordinator deserialization** (`src/state.js`): `loadMacroState` sada rekonstruiše pune coordinator objekte spajanjem saved `{id, loyalty, usedThisCity}` sa statičkim COORDINATORS podacima. Koristi `getLoyaltyTier` (importovan iz `coordinators_data.js`) i lokalni `getActiveAbility` da popuni `loyaltyTier`, `activeAbility`, `baseReach`, `portraitColor`, `baseCostMultiplier` i ostale statičke property koji su nedostajali posle reload-a. `COORDINATORS` i `getLoyaltyTier` su importovani na vrhu fajla.

- **CRITICAL-02 — renderMacroScreen na 60fps** (`src/main.js`): Dodat `_macroRenderTimer` i `MACRO_RENDER_INTERVAL = 0.5` (max 2fps za macro HTML rebuild). Game loop sada throttluje poziv `renderMacroScreen(macro, meta)` — rebuild se dešava najčešće svakih 500ms umesto na svakom animation frame. Event delegation za `#btn-start-event` u `src/input.js` koristi document-level `closest('#btn-start-event')` handler koji survives innerHTML rebuild — "Počni Event" dugme radi i posle throttled rebuild-a.

- **CRITICAL-03 / MEDIUM-05 — PromoRecord.currentBuzz() crash** (`src/rendering/macro_renderer.js`): `getCityBuzzSimple` sada koristi inline buzz kalkulaciju umesto poziva `p.currentBuzz(now)` kao metode. Proverava da li je `p.currentBuzz` funkcija (živući objekat) — ako jeste, koristi ga; inače izračunava buzz inline koristeći `p.initialBuzz`, `p.halfLife`, `p.dayPlaced` i `macro.current_city_index`. Plain JSON deserialization objekti više ne izazivaju TypeError.

## Rešeni MEDIUM

- **MEDIUM-01 — BPM slider label** (`index.html`): BPM labela proširena sa `bpm-hint` spanom koji prikazuje "ritam muzike" ispod glavnog "BPM" naslova. Implementovano inline stilom (`font-size:9px`, `opacity:0.7`) unutar `.bpm-label-col` flex kolone — vidljivo bez tooltip-a na mobilnom.

- **MEDIUM-02 — Redirect buttons disabled reason** (`src/ui.js`): `updateRedirectButtons` sada pored `btn.title` kreira i vidljivi `<span class="redirect-reason redirect-reason-{i}">` element ispod svakog dugmeta. Span se prikazuje (`display:block`) kad je dugme disabled i postoji `state.reason`; skriva se kad je dugme enabled. Pozicionirano absolutno na `bottom:-14px` unutar parent elementa koji dobija `position:relative`.

- **MEDIUM-04 — Victory/Prestige dugmad ne rade** (`src/input.js`): Dodat document-level click handler koji hvata `data-action` dugmad van `#macro-screen` (victory i prestige ekrani). Handler proverava `e.target.closest('#macro-screen')` — ako nije macro screen, šalje event ka `onMacroClick`. Victory screen dugmad (`data-action="share"`, `data-action="prestige"`) i prestige screen (`btn-confirm-prestige` via direktni listener u renderPrestigeScreen) sada rade ispravno. Dodat i drugi document-level handler za `#btn-start-event` koji direktno poziva `_gameState.onStartEvent()`.

## LOW (ostavljeno za next pass)

- **LOW-01**: Text cue overlay iznad macro screen-a — ostaje za next pass
- **LOW-02**: Hardcoded nazivi gradova na nekoliko mesta — ostaje za next pass
- **LOW-03**: Prestige screen already-selected vizuelni indikator — ostaje za next pass
- **LOW-04**: Guncati lokacija vidljiva pre runde 3 — ostaje za next pass
- **LOW-05**: Audio ordering (ambient vs SFX prioritet) — ostaje za next pass
- **LOW-06**: Redirect dugmad na srpskom jeziku nedosledna — ostaje za next pass
- **LOW-07**: Rešeno kao deo CRITICAL-02 fix-a (event listener leak eliminisan throttle-om)
