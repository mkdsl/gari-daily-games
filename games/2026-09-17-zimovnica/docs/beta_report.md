# Beta Report — Zimovnica (Iter 1)
**Datum:** 2026-09-21
**Testeri:** Zora (UX), Raša (tech), Lela (engagement)
**Beta Score (iter 1):** 3.5/10

---

## Izvršni rezime

Zimovnica ima jak concept i solidnu tehničku osnovu — modularna arhitektura, proceduralni audio, dobar vizuelni identitet, odlična brand sprega sa Guncatom. Međutim, igra je trenutno neigriva: tri CRITICAL buga blokiraju svaku recipe akciju, sve dnevne događaje i resoluciju tih događaja. Jedino što radi je berba i prelaz na sledeći dan. Sve ostalo — ajvar, turšija, sos, pelat, džem, pekmez, bačva kupusa, eventi — je mrtvo. Ovo nije polish problem, ovo je impl rupa koja je prošla nedetektovana.

---

## CRITICAL bugovi

### [BUG-01] Recipe dugmad ne prenose `kg` — sve recepture zauvek vraćaju "Unesi količinu"

- **Severity:** CRITICAL
- **Opis:** `buildActionGrid` u `render.js` kreira recipe dugmad sa `data-action="kuvanje"` i `data-recipe="ajvar"` (ili sos/pelat/džem/pekmez/tursija), ali bez `data-kg`. `buildParams()` u `ui.js` pretvara dataset u params — `params.kg` ostaje `undefined`. Svaki recipe handler (`actionPeciPaprike`, `actionPraviSos`, `actionPraviPelat`, itd.) proverava `const kg = params?.kg || 0; if (kg <= 0) return { state: addLog(state, '⚠️ Unesi količinu...'), persistent }`. Rezultat: klik na bilo koje recipe dugme troši 0 slotova, ne menja state, prikazuje toast "Unesi količinu" i vraća kontrolu. Igrač ne može da napravi ništa osim berbe.
- **Reprodukcija:** Pokreni igru → beri sirovine (berba radi) → klikni "Peči ajvar" (ima ≥5kg paprika) → toast "Unesi količinu paprika." → nema tegle, nema promene stanja.
- **Modul:** `src/render.js` (buildActionGrid, linije 228–335) + `src/ui.js` (buildParams) + `src/systems/time_system.js` (svi recipe handleri)
- **Fix:** Dodati `<input type="number">` u svako recipe dugme (ili modal pre dispatcha) koji popunjava `data-kg`, ILI buildActionGrid da za svaki recept uzima max dostupnu količinu kao default i postavi `btn.dataset.kg = defaultKg`. Najbrži fix: default na `state.sirovine[primaryIngredient]` capped na recipe minimumu.

---

### [BUG-02] `nextDay()` ne poziva `setScreen('event')` — dnevni događaji nikad nisu prikazani

- **Severity:** CRITICAL
- **Opis:** `nextDay()` u `main.js` (linija 74–81) poziva `advanceDay()`, koji u koraku 7 poziva `drawDailyEvents(s)` i stavlja rezultat u `s.today_events`. Međutim, `nextDay()` odmah poziva `renderFrame()` sa neizmenjenim `screen = 'game'`. `setScreen('event')` nije pozvan nigde — grep po celom `src/` potvrđuje: `setScreen` se poziva jedino za `'menu'` (iz `go_menu` akcije u `ui.js`) i nigde za `'event'`. `renderEventScreen` nikad nije prikazan. Igrač 14 dana prolazi a da ni jednom ne vidi event — nema komšijinih paprika, nema kiše, nema pH check-a bačve.
- **Reprodukcija:** Pokreni igru → klikni "Sledeći dan" → ekran ostaje na game screenu → u `state.today_events` (DevTools) postoje generisani eventi, ali overlay nikad ne pojavi.
- **Modul:** `src/main.js` (nextDay, linija 74–81) — nedostaje `setScreen('event')` posle `renderFrame()` (ili uslovni poziv ako `result.state.today_events?.length > 0`)
- **Fix:** U `nextDay()`, posle `state = result.state`, dodati:
  ```js
  if (state.today_events && state.today_events.length > 0) {
    setScreen('event');
  } else {
    renderFrame();
  }
  ```

---

### [BUG-03] `processAction` nema case za `event_choice` — event dugmad su mrtva

- **Severity:** CRITICAL
- **Opis:** `renderEventScreen` → `buildEventCard` kreira dugmad sa `data-action="event_choice"`, `data-event-id`, `data-choice-id`. `handleDelegatedClick` u `ui.js` (linija 183) hvata ovaj action i poziva `handleAction('event_choice', params)`. `handleAction` → `processAction` u `time_system.js`. Switch u `processAction` (linije 96–118) nema case za `'event_choice'` — pada na `default: return null`. `handleAction` provjerava `if (result)` — null = ne menja state, ne menja screen. Klikovi na event izbore su potpuno mrtvi. Čak i kada BUG-02 bude popravljan i event screen postane vidljiv, bez ovog fix-a igrač ostaje zarobljen na event overlay-u zauvek.
- **Reprodukcija:** Nije reproduktibilno dok je BUG-02 aktivan (event screen se ne prikazuje). Posle fixa BUG-02: idi na sledeći dan → event overlay se pojavi → klikni bilo koji izbor → ništa se ne dešava, overlay ostaje, state se ne menja.
- **Modul:** `src/systems/time_system.js` (processAction switch, linija 96–118) — nedostaje case `'event_choice'`
- **Fix:** Dodati case u `processAction`:
  ```js
  case 'event_choice': return actionEventChoice(state, persistent, params);
  ```
  I implementirati `actionEventChoice` koji primenjuje efekat izabranog choice-a, prazni `state.today_events`, i vraća state (main.js zatim poziva `setScreen('game')`).

---

## MEDIUM bugovi

### [BUG-04] Rakija dugme silently radi ništa

- **Severity:** MEDIUM
- **Opis:** `buildActionGrid` kreira rakija dugme sa `action: 'kuvanje', params: { recipe: 'rakija' }`. `actionKuvanje` u `time_system.js` (linije 141–151) nema `case 'rakija'` — pada na `default: return { state, persistent }`. Akcija ne troši slotove, ne loguje ništa, ne daje feedback. Igrač misli da je kliknuo, ništa se nije desilo.
- **Modul:** `src/systems/time_system.js` (actionKuvanje, linije 141–151)
- **Fix:** Dodati `case 'rakija': return actionDestilisiRakiju(state, persistent, params);` u `actionKuvanje` switch-u. Napomena: `actionDestilisiRakiju` zahteva `params.kg` (vidi BUG-01), pa se oba fixa moraju kombinovati.

---

### [BUG-05] "Peči ajvar" dugme proizvodi pečene_paprike, ne tegle ajvara

- **Severity:** MEDIUM
- **Opis:** `actionKuvanje` za `'ajvar'` route-uje na `actionPeciPaprike` ("simplified", komentar u kodu), koji konvertuje paprike → `state.sirovine.pečene_paprike`. Ne kreira nijednu teglu. Dugme je labelled "Peči ajvar" — igrač očekuje teglu. `actionTociAjvar` (koji zaista pravi teglu ajvara) ne postoji kao UI dugme. 2-step proces (peči → toči) nije eksponiran u gridu. Posle fixa BUG-01 (dodavanja kg), igrač bi videli da klikovi troše slot i sirovine ali nema tegli — frustrirajuće, neočigledno.
- **Modul:** `src/render.js` (buildActionGrid, linija 239–245) + `src/systems/time_system.js` (actionKuvanje linija 142)
- **Fix opcija A:** `actionKuvanje` za 'ajvar' route-uj na `actionTociAjvar` direktno (skoči peči korak, uprosti za first-run UX). Fix opcija B: Dodaj posebno "Peči paprike" + "Toči ajvar" dugmad u grid (pravi 2-step), uz jasna label-a.

---

### [BUG-06] Log panel se ne renderuje (querySelector ne nalazi element pre appendChild na root)

- **Severity:** MEDIUM
- **Opis:** U `renderGame` (linija 171–176 u render.js), `.log-panel` div se kreira i appenda na lokalni `screen` element, pa se odmah poziva `renderLog(state.log)`. `renderLog` u `ui.js` radi `document.querySelector('.log-panel')` — ali u tom trenutku `screen` još nije appendan na `root`/DOM (to se dešava na liniji 189: `root.appendChild(screen)`). `querySelector` vraća null, log panel ostaje prazan tokom celog game session-a.
- **Reprodukcija:** Igraj berbu → "Sledeći dan" → log panel vidljiv u DOM (via DevTools — element postoji) ali nema teksta; `state.log` u DevTools-u ima unose.
- **Modul:** `src/render.js` (renderGame, linije 171–176) + `src/ui.js` (renderLog)
- **Fix:** U `renderGame`, umesto direktnog poziva `renderLog(state.log)`, popuni log panel direktno (bez querySelector) dok si u DOM build fazi, ili pozovi `renderLog` tek na kraju `render()` funkcije (posle `root.appendChild(screen)`).

---

## LOW bugovi

### [BUG-07] Ending stats grid vizuelno broken (3-col layout, label/value alterniraju pogrešno)

- **Severity:** LOW
- **Opis:** `buildEndingStats` dodaje `label` i `value` kao odvojene children u grid sa `gridTemplateColumns: 'repeat(3, 1fr)'`. Sa 3 para (Kasa/Tegle/Dan), 6 elemenata u 3-col gridu = label/value/label u prvom redu, value/label/value u drugom. Vizuelno: "Kasa" + vrednost + "Tegle" u redu 1, vrednost + "Dan" + vrednost u redu 2.
- **Modul:** `src/render.js` (buildEndingStats, linije 527–557)
- **Fix:** `gridTemplateColumns: '1fr 1fr'` sa 2-col layoutom, ili grupišite label+value u wrapper div.

### [BUG-08] `actionBacvaInit` preskače 20kg minimum check

- **Severity:** LOW
- **Opis:** Dugme "Pokreni bačvu" (action: `bacva_init`) ne prenosi kg (vidi BUG-01 pattern) pa `actionBacvaInit` pada na `state.sirovine.kupus` kao default — koristi SV kupus odjednom. Nema min 20kg guard (koji postoji samo u `actionUtisniKupus`, ne ovde). Igrač sa 5kg kupusa može pokrenut bačvu sa 5kg (ispod minimalnog za fermentaciju).
- **Modul:** `src/systems/time_system.js` (actionBacvaInit, linije 154–159)
- **Fix:** Dodati `if (kg < 20) return { state: addLog(state, '⚠️ Minimum 20 kg kupusa.', 'warn'), persistent };` na početak `actionBacvaInit`.

---

## Pozitivne strane

- **Arhitektura je solidna.** Modularna struktura (entities, systems, render pipeline) — fiksevi su lokalizovani, nema circular dependency problema, BUG-01/-02/-03 su svaki u tačno jednom mestu.
- **Audio modul ispravan.** `initAudio` koristi try/catch, idempotentan je, nema load greške, radi bez .wav fajlova.
- **Vizuelni identitet jak.** Paleta boja (tamno-toplo-zeleno), tipografija, brand tag "Guncati × MKDSLend" — sve konzistentno, ne izgleda nedovršeno.
- **Mobile layout u redu.** `base.css` — `max-width: 600px`, `overflow: hidden`, min 44px touch target na dugmadima. Nema horizontalnog scroll-a.
- **Brand sprega autentična.** Zimovnica kao Guncati asset funkcioniše — sezonska strategija prezimljavanja direktno korespondira sa Tom Sawyer narativom imanja. Nije decoration.
- **Berba i next-day loop rade.** `actionBerba`, `advanceDay` (decay, passive job ticking, weather gen) su svi funkcionalni.
- **Prestige/run struktura potpuna.** Prestige screen, carry_bonuses, persistent state — implementirani i vizuelno prisutni.

---

## Preporuke

**Prioritet fix redosled za Jovu:**

1. **BUG-01 (render.js)** — Dodaj `kg` input u recipe dugmad, ili default na min potrebnu količinu iz sirovine. Bez ovog fixa sve ostalo ostaje blokiran.
2. **BUG-02 (main.js)** — 2 linije koda. `nextDay()` treba uslovni `setScreen('event')` posle advanceDay-a.
3. **BUG-03 (time_system.js)** — Implementirati `actionEventChoice` + case u processAction switchu.
4. **BUG-05 (render.js + time_system.js)** — Odlučiti 1-step vs 2-step ajvar UX i implementirati konzistentno.
5. **BUG-04 (time_system.js)** — 1 linija: case 'rakija' u actionKuvanje.
6. **BUG-06 (render.js)** — Pomeriti renderLog poziv posle root.appendChild.

BUG-07 i BUG-08 mogu u sledeći krug.

**Procena posle fikseva:** Sa rešenim BUG-01/-02/-03, igra postaje igriva. Base concept je dovoljan jak (7.0+) da opravda 2. beta iteraciju. Očekujemo 7.5–8.0 na iter 2 ako recipe loop i event loop rade ispravno i nema novih regresija.
