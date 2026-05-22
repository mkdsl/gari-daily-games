# Beta Report — Sound vs Tišina
## Overall beta_score: 3/10

---

## Zora (UX)
Izgled je solidan — dark theme, CSS varijable su dobro postavljene, slider UI ima vizuelni feedback (safe/warn/danger boje), termometar ima marker za limit. Menu i game-over ekrani imaju jasnu strukturu.

Međutim: igra ne može ni da se pokrene zbog CRITICAL import buga, pa UX uopšte nije testabilan. Venue-select grid je responsivan ali venue kartice nemaju scroll lock na mobilnoj verziji (touchend handler je duplikat sa click). Setup screen je funkcionalan. Game-over CTA za Avalu je prisutan i dobro pozicioniran.

Mobilni termometar: JS setuje `height` ali CSS ga na mobilnoj verziji konvertuje u `width` — vizuelno polomljeno.

---

## Raša (tech)
Arhitektura je ispravno zamišljena — ES6 moduli, double-buffer heatmap, ticker na setInterval, render loop na rAF. SPL formula (inverse-square + log-sum) je korektna. Sve `.js` ekstenzije u import-ima su prisutne.

**CRITICAL BUG 1**: `src/main.js:17` — `import { TICK_RATE, GAME_DURATION_REAL_SEC, UPGRADES } from './config.js'` — `UPGRADES` ne postoji u `config.js`. Ovo uzrokuje ES module error pri prvom loadovanju stranice. Igra se ne može pokrenuti.

**CRITICAL BUG 2**: Ukupno JS koda je ~1870 linija po realnom brojevanju (manifest kaže 1050 — netačno). Prag za kompletnu implementaciju je 2000 linija. Više modula su skeletal stubs — posebno `src/entities/neighbor.js` (12 linija, nikad instaniran u `venue.js` koji ga importuje ali ne koristi), `src/systems/warnings.js` nema vizuelni indikator za shutdown osim screen-shake koji je spreman u CSS, `src/render/terrain.js` crta samo granicu i isprekidane pravougaonike bez pravih floor-plan detalja.

**MEDIUM BUG 3**: `src/ui/hud.js` — `updateThermometer` setuje `fill.style.height` ali CSS `game.css` na mobilnoj verziji (max-width 600px) menja termometar u horizontalni i zahteva `fill.style.width`. JS ne prati tu promenu.

**MEDIUM BUG 4**: `src/ui/game-over.js:14` — typo: `'Sjajna večera!'` treba da bude `'Sjajno veče!'`

**LOW**: `src/systems/venue.js` importuje `Neighbor` iz `entities/neighbor.js` ali nikad ne kreira instancu. Import je dead code.

**LOW**: `src/main.js` importuje `rebuildSliders` ali je nikad ne poziva direktno (samo `initSliders` je dovoljno).

**LOW**: `src/systems/warnings.js` importuje `isShutdown` ali main.js nikad ne koristi tu funkciju (shutdown se proverava direktnim return-om iz `triggerComplaint`).

---

## Lela (engagement)
Karijerna progresija (9 titula, XP sistem) i 8 terena daju dobru longitudinalnu motivaciju. Avala CTA je vidljiv na game-over screenu sa pulsing animacijom. Dinamički eventi (8 tipova) sa seeded RNG daju replay value.

Međutim: igra je trenutno totalno blokirana CRITICAL bugom — niko ne može ni da stigne do game loopa. Mentor linije su pisane i kvalitetne. Beat loop reaguje na happiness. Sve što je pisano za engagement sloj je dobro zamišljeno ali nedostupno.

---

## Bugovi

### CRITICAL
- **[C1]** `src/main.js:17` — `UPGRADES` se importuje iz `'./config.js'` ali tamo ne postoji. Mora biti `'./content/upgrades.js'`. Uzrokuje ES module SyntaxError/ReferenceError — igra ne može da se pokrene.
- **[C2]** JS implementacija je skeletal: ~1870 stvarnih linija, ispod praga od 2000. Konkretno: `neighbor.js` nikad instaniran, `terrain.js` ne crta pravi floor plan, `heatmap.js` nema vizuelni zoom/scale indikator za SPL legend-u, `game-over.js` ne poziva `shareScore` nigde — share dugme nedostaje.

### MEDIUM
- **[M1]** `src/ui/hud.js` — mobilni termometar: JS koristi `height` ali CSS mobile verzija zahteva `width`. Termometar je vizuelno broken na uređajima < 600px.
- **[M2]** `src/ui/game-over.js:14` — typo `'Sjajna večera!'` → `'Sjajno veče!'`
- **[M3]** `src/render/terrain.js` — floor plan je skelet (samo border + dashed zone boxes). Nedostaje vizuelni identitet terena (boje zone, stage silhoueta).
- **[M4]** Game-over screen nema Share dugme koje poziva `shareScore()` iz `share.js` — modul je implementiran ali ne koristiti.

### LOW
- **[L1]** `src/systems/venue.js` importuje `Neighbor` ali ga nikad ne koristi — dead import.
- **[L2]** `src/main.js` importuje `rebuildSliders` ali je ne poziva.
- **[L3]** `src/main.js` importuje `isShutdown` ali je ne koristi.
- **[L4]** SPL legend (boja → dB vrednost mapa) nije vidljiva nigde u UI — igrač ne zna šta boje znače.
- **[L5]** `src/config.js` nema `GAME_DURATION_REAL_SEC` u UPGRADES — OK, ali nema ni `UPGRADES` export — to je C1 bug.

---

## Zaključak

beta_score: **3/10**

Ocenjivanje:
- Igra može da se pokrene? **NE** → -3 (C1 bug: UPGRADES import iz pogrešnog modula)
- Heatmap reaguje na slidere? Delimično — logika je ispravna, ali igra se ne pokreće da bi se testiralo → -2
- Susedov termometar radi? Logika OK, mobilni broken → -1
- Svi venues prisutni? DA, svih 8 → 0
- Game over ima Avala CTA? DA → 0
- Implementacija kompletna >2000 linija? NE (~1870 linija) → -1 (delimičan penalitet)

Posle fix-ova (C1 + flesh-out + M bugovi) igra ima odličnu osnovu za 8+/10.
