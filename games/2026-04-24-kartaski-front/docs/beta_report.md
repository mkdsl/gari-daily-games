# BETA TEST REPORT — Kartaški Front

**Datum:** 2026-04-24 | **Metod:** Code review (browser nije dostupan)

### Ukupna ocena: 6.5/10

---

### Zora (UX): 6/10

**Šta radi:**
- MAP screen vizuelno jasno pokazuje linearni put — aktivni čvor svetli zlatnom bojom, prošli su zelenkasti, budući sivi
- Karte imaju cost badge (gornji desni ugao), ikonu po tipu (⚔/🛡/✨), i kratki opis — dovoljno za razumevanje
- Toolbar prikazuje čvor, energiju, špil/discard count — sve korisne informacije
- Overlay sa `backdrop-filter: blur(8px)` daje dobar fokus na modalne ekrane
- Reward ekran jasan — 3 karte, hover lift, klik

**Šta ne radi:**
- Nema **HP igrača u toolbar-u** — `#hp-info` span ne postoji u HTML-u; HP je vidljiv samo na Canvas silhueti (mala traka). Na mobilnom to nije čitljivo — igrač ne zna koliko mu je HP ostalo
- **Nema onboardinga** — igrač otvori igru i vidi MAP bez ijednog teksta koji objašnjava mehaniku. "Šta su te karte?", "Šta je energija?" — neće biti jasno novom igraču
- Karte su 80px wide — granično za touch target (min 44px zadovoljen, ali jedva)
- `btn-inactive` CSS klasa u `updateToolbar` — button dobija klasu `btn-inactive` ali ui.css ne definiše `.btn-inactive` (samo `.btn-disabled`); vizuelno će dugme izgledati aktivno kad nije

**Bug list:**
- `updateToolbar`: `btnEnd.className = 'btn-primary btn-inactive'` umesto `'btn-primary btn-disabled'` — CSS klasa ne postoji (ui.css:39: `.btn-primary.btn-disabled`)

---

### Raša (Tehničko): 6/10

**Šta radi:**
- State machine tranzicije su ispravne: MAP → PLAYER_TURN → ENEMY_TURN → PLAYER_TURN, sa REWARD i VICTORY/GAME_OVER
- `applyEnemyEndOfTurn` se poziva u `_doEnemyTurn` — enemy shield resetuje, efekti tiku ✅
- `state.player.energy` obnavlja se posle enemy turna ✅
- `state.phase = PLAYER_TURN` postavlja se posle enemy turna ✅
- `discardHand` + `drawHand` ciklus radi ispravno — refill iz discard kad deck isprazni ✅
- `getRewardCards(state)` vraća ispravni pool (node+1 za 1-indexed pool) ✅
- `state.stats.roundsPlayed++` inkrementirani ✅
- Phase guard `if (state.phase !== CONFIG.PHASES.PLAYER_TURN) return` u svim handlerima ✅

**Šta puca:**

**BUG #1 (KRITIČAN):** `Weak` efekat ne radi nikad.
```
combat.js: const weakMult = getEffectValue(entity, 'weak') > 0 ? 0.75 : 1.0;
```
`weak` efekat ima `value = 0` u svim definicijama (config.js, Čuvar intent). `getEffectValue` vraća `effect.value = 0`, pa `0 > 0` je uvek `false`. Slabost karta (cost 1) ne radi, Čuvarov debuff ne radi.
**Fix:** Zameniti `getEffectValue(entity, 'weak') > 0` sa `getEffectDuration(entity, 'weak') > 0`.

**BUG #2 (SREDNJI):** `initInput` se poziva ponovo na restart (`handleOverlayClick` case 'restart'). Ovo dodaje duplikate event listenera na `#btn-end-turn`, `#overlay`, `#hand-zone`. Phase guard-i sprečavaju double-processing za većinu akcija, ali svaki restart akumulira listenere.
**Fix:** Dodati `_initialized` flag u `input.js` i preskočiti re-init; ili koristiti `removeEventListener`.

**BUG #3 (LAKI):** `updateToolbar` postavlja `btnEnd.className = 'btn-primary btn-inactive'` ali CSS definiše `.btn-primary.btn-disabled` (ne `.btn-inactive`). Dugme "Kraj runde" izgledaće kao aktivan/klikabilan tokom enemy turn-a.

**Bug list:**
- `src/main.js` (`_handleCombatEnd`): `state.node >= CONFIG.TOTAL_NODES - 1` kao uslov za VICTORY — proveriti: node 3 >= 3 → true ✅ OK
- `src/ui.js` (`updateToolbar`): `btn-inactive` klasa ne postoji u CSS-u
- `src/systems/combat.js`: obe `weakMult` provere koriste `getEffectValue > 0` umesto `getEffectDuration > 0`

---

### Lela (Engagement): 7/10

**Šta radi:**
- Taktička odluka svake runde je stvarna — 3 energije, 5 karata, treba birati
- Intent prikaz (⚔/🛡/☠ + vrednost) daje pravi roguelike feel — igrač planira
- Špil raste posle svake borbe → napetost između "biram napad" ili "biram blok"
- Boss Nekromajer (70HP, runda 4: 18 damage) — dovoljno napeto
- Pacing 3-4 min do bossa je tačan (Gremlin ~2-3 runde, Ratnik ~4 runde, Čuvar ~4 runde, Boss ~5 runde)

**Šta dosadi / nedostaje:**
- Nema nikakve animacije/feedback kada karta "odigrana" — karta nestaje (removeChild pri renderHand) bez ikakvog efekta. `screenFlash` je implementiran u ui.js ali se NIKAD ne poziva iz main.js (nije importovan). `highlightCardPlayed` nije implementiran.
- Odmor karta (heal 3) ima cost 0 — previše jaka za cost 0 u starter decku, posebno ako igrač dobija Regen Touch kao reward
- Gremlin (20HP, 6 damage svake runde) — preterano lak. Sa 5 karata i 3 energije igrač može naneti 6+4+5=15 damage u rundi 1, u rundi 2 ubiti. Nema tenzije.

**Balans:**
- Starter deck OK za prve 2-3 borbe
- Boss sa Burn 2 (runda 2) je dobra krivulja — igrač mora da uči efekat
- Weak neraditi je ENGAGEMENT problem — `Slabost` karta postaje beskorisna

---

### TOP 3 kritična problema (blocker za release)

1. **Weak efekat completely broken** — `combat.js`: `getEffectValue(entity, 'weak') > 0` uvek false. `Slabost` karta (cost 1) ne radi. Čuvarov buff ne radi. **Fix: 1 linija × 2 mesta.**

2. **HP igrača nije vidljiv van Canvas-a** — toolbar nema HP span, na mobilnom Canvas traka je premala. Igrač ne zna kad je u opasnosti. **Fix: dodati `<span id="hp-info">` u index.html.**

3. **"Kraj runde" dugme vizuelno aktivan tokom enemy turn-a** — `btn-inactive` CSS klasa ne postoji, dugme ne dobija disabled izgled. **Fix: promeniti klasu u `btn-disabled` u `updateToolbar`.**

---

### TOP 3 "nice to have" (ako ima vremena)

1. **Feedback za odigranu kartu** — importovati i pozvati `screenFlash('red'/'green')` u `handleCardClick` iz main.js

2. **Onboarding tekst na MAP screen-u** — dodati kratko objašnjenje ispod "Karta sveta": "Izaberi borbu. Odigraj karte iz ruke. Pobedi — osvoji nagradu."

3. **Gremlin HP buff ili damage buff** — 20HP/6dmg je prelako za prvu borbu; preporučujem 25HP ili 8dmg za malo više tenzije
