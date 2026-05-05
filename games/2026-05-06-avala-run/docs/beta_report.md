# Beta Report — Avala Run (2026-05-06)

**Beta score: 6.2 / 9.0**

---

## Zora — UX

**Meni:** Prisutni su svi osnovni elementi — naslov, datum/branding, kontrole (tastatura + touch), CTA dugme. Nema vizualnog pregleda kako igra izgleda, ali za mobilni runner to nije obavezno.

**Game Over screen — checklist:**
- [x] Distanca (`distMeters`) — prikazana kao `${distMeters}m`
- [x] Broj karata (`state.cardCount`)
- [x] Broj smeća (`state.trashCount`)
- [x] Random aforizam iz `CONFIG.AFORIZMI`
- [x] Link ka bilet.rs/show/261 — link postoji
- [ ] **PROBLEM:** Link tekst kaže `bilet.rs/show/261` ali `href` ide na `https://app.bilet.rs/show/261` — domena u tekstu ne odgovara stvarnoj URL-u
- [x] Tekst `Pravila — Kluboslavija IG bio` prisutan
- [x] Daily highscore tabela (Top Score + Top Smeće)
- [x] Restart dugme

**Touch kontrole:** Implementacija je ispravna — gornja polovina canvasa = jump, donja = duck. `touchstart` koristi `rect.height / 2` kao granicu. Međutim postoji UX problem: `touchend` handler resetuje i `input.jump` i `input.duck` bez razlike po tome koji je prst bio aktivan. Na multi-touch uređajima (npr. jedan prst drži duck, drugi greškom touchend) može doći do preranog otkazivanja inputa.

**HUD:** `updateHUD` prikazuje score, karte i smeće putem DOM elemenata `score-display`, `card-display`, `trash-display`. Ažurira se svaki frame tokom igre. Vizualno potpuno.

**Ocena Zora: 7.5 / 10** — Game over screen je kompletan i emocionalno jak. Touch UX ima jednu ranjivost. Link subdomain mismatch je sitnica ali treba popraviti.

---

## Raša — Tehnika

### Import/Export audit

| Fajl | Exportuje | Importuje se u | Status |
|------|-----------|----------------|--------|
| `input.js` | `initInput`, `consumeJump`, `consumeDuck`, `getInput` | `main.js` (initInput), `player.js` (consumeJump, consumeDuck) | OK |
| `render.js` | `render` | `main.js` | OK |
| `world.js` | `initWorld`, `updateWorld`, `drawBackground`, `drawBranding` | `main.js`, `render.js` | OK |
| `spawner.js` | `initSpawner`, `updateSpawner`, `objScreenX` | `main.js`, `render.js`, `collision.js` | OK |
| `collision.js` | `checkCollisions` | `main.js` | OK |
| `player.js` | `initPlayer`, `updatePlayer`, `drawPlayer` | `main.js`, `render.js` | OK |
| `state.js` | `createState`, `loadDailyHighscore`, `saveDailyHighscore` | `main.js` | OK |

### Bugovi

**[CRITICAL] `drawAvalaSilhouette` — dvostruki parallax faktor**
- Fajl: `src/systems/world.js`, funkcija `drawAvalaSilhouette`
- `parallaxOffsets[1]` se računa kao `scrollX * 0.15` u `updateWorld`
- U `drawAvalaSilhouette`: `const off = (offset * 0.15) % tileW` — `offset` se ponovo množi sa 0.15
- Rezultat: Avala silhoueta se pomera na 0.0225x brzinu skrola — praktično stoji
- Fix: `const off = offset % tileW` (bez dodatnog 0.15 množioca)

**[MEDIUM] `touchend` ne resetuje `jumpPressed` / `duckPressed`**
- Fajl: `src/input.js`, `touchend` handler (linija ~38)
- `touchend` postavlja `input.jump = false` i `input.duck = false`, ali ne resetuje `input.jumpPressed` ni `input.duckPressed`
- Ako `touchstart` postavi `jumpPressed = true`, a loop nije stigao da pozove `consumeJump()` pre nego što `touchend` okine, stanje je nekonzistentno: `jump = false` ali `jumpPressed = true`
- Ovaj slučaj je malo verovatno vidljiv u normalnoj igri jer loop trči na rAF, ali na sporijim uređajima može izazvati fantomski skok/duck u pogrešnom momentu
- Fix: u `touchend` dodati `input.jumpPressed = false; input.duckPressed = false;`

**[MEDIUM] `PARALLAX_SPEEDS` ima 4 elementa, `parallaxOffsets` ima 5**
- Fajl: `src/systems/world.js` i `src/state.js`
- `PARALLAX_SPEEDS = [0.05, 0.15, 0.35, 0.60]` — 4 elementa
- `state.world.parallaxOffsets = [0, 0, 0, 0, 0]` — 5 elemenata
- `updateWorld` koristi `forEach` po `PARALLAX_SPEEDS`, pa peti offset uvek ostaje `0`
- Nije crash bug (peti offset se ne koristi nigde u rendereru), ali je dead state koji govori o nedovršenoj refaktorizaciji — npr. nestali peti parallax sloj (može biti Avala sa posebnim offsetom)
- Fix: sinhronizovati na 4 elementa u state.js

**[LOW] Ticket URL mismatch između `href` i display teksta**
- Fajl: `src/ui.js` i `src/config.js`
- `CONFIG.TICKET_URL = 'https://app.bilet.rs/show/261'`
- Game over screen prikazuje tekst: `bilet.rs/show/261` (bez `app.` prefiksa)
- Korisnik koji ručno ukuca link neće stići na pravo mesto
- Fix: promeniti display tekst u `app.bilet.rs/show/261` ili obrnuto uskladiti URL

**[LOW] `reqJump` polje u `OBSTACLES` config nije korišćeno**
- Fajl: `src/config.js` (svi obstacle defovi imaju `reqJump`), `src/systems/collision.js` (ne čita `reqJump`)
- Dron ima `reqJump: false` što implicira duck logiku, ali collision tretira sve prepreke jednako (uvek game over)
- Nije bug koji krši igru (dron se može izbeći duckovanjem zbog `groundOffset: 52`), ali `reqJump` je mrtvo polje koje zbunjuje

### Collision konzistentnost

`collision.js` koristi `state.world.scrollX` iz state shape-a (definisano u `state.js`) — konzistentno. `objScreenX` se importuje iz `spawner.js` — ispravno. Player hitbox Y logika je konzistentna sa physics-om u `player.js` (gornja ivica = `p.y`, donja = `p.y + ph`).

**Ocena Raša: 5.5 / 10** — Struktura koda je solidna i importi su ispravni. Avala silhouete bug je vidljiv vizuelno (stoji na mestu), touch input bug je latentni, parallax state je nekonzistentan.

---

## Lela — Engagement

**Zanimljivost:** Runner format je provereno adiktivan. Dual collectible sistem (karte + smeće) daje dve motivacije u jednom runu. Card boost mehanika (ubrzanje na 2s) nagrađuje skill. Napredovanje brzine je postepeno ali jasno.

**Daily Highscore motivacija:** Implementiran top-3 score i top-3 smeće per dan. Persistencija je localStorage, reset po datumu. Ovo je dobro — daje razlog za replay i jutarnje takmičenje. Nema sharing dugmeta (ne šalje score na socijale), što je propuštena prilikaza viralnost.

**Kluboslavija branding:** `drawBranding` crta `K KLUBOSLAVIJA` u donjem desnom uglu sa `globalAlpha = 0.4` — nenametljivo, estetski uklopljeno u noćnu paletu. Subtitle u meniju (`Kluboslavija · Avala · 20. jun 2026.`) jasno komunicira event. Game over je bogat Kluboslavija sadržajem bez da gušii.

**Aforizmi:** Pet aforizma su autentična, lokalna i emocionalna. `"Avala ne pita da li si spreman. Avala pita da li si tu."` je posebno jak. Atribucija `— Pera` je misteriozna i pamtljiva.

**Ticket link:** Prisutan i vizuelno istaknut u game over screenu. Funnel je logičan: igraj → game over → emocija → kupi kartu.

**Ocena Lela: 8.0 / 10** — Engagement loop je kompletiran. Jedina propuštena šansa je share dugme za score.

---

## Ukupno

| Oblast | Ocena |
|--------|-------|
| Zora — UX | 7.5 / 10 |
| Raša — Tehnika | 5.5 / 10 |
| Lela — Engagement | 8.0 / 10 |
| **Prosek** | **6.2 / 9.0** |

Igra NIJE na 7.0 pragu za branded Kluboslavija publikaciju. Avala silhoueta bug je vizuelno odmah vidljiv (stoji na mestu dok sve ostalo teče) i narušava atmosferu noćne trke. To mora biti fixed pre release-a.

---

### BUGOVI ZA FIX (Top 3)

## Bug 1 — CRITICAL: Avala silhoueta ne scrolluje

Dvostruki parallax množilac u `drawAvalaSilhouette`: `offset` je već `scrollX * 0.15`, a zatim se u funkciji ponovo množi sa `0.15`, dajući efektivni speed od `0.0225x`. Avala stoji na mestu dok borovi i zvezde idu — vizualno odmah uočljivo kao broken background.

**Fajl:** `src/systems/world.js`, funkcija `drawAvalaSilhouette`, linija:
```js
const off = (offset * 0.15) % tileW;  // BUG
// Fix:
const off = offset % tileW;
```

## Bug 2 — MEDIUM: Touch input — jumpPressed/duckPressed ne resetuju na touchend

`touchend` handler resetuje `input.jump` i `input.duck` na `false`, ali ne resetuje `jumpPressed` ni `duckPressed`. Na sporijim uređajima ili u slučaju brzih tapova, `consumeJump()`/`consumeDuck()` u sledećem frejmu mogu pročitati zaostalu `true` vrednost i aktivirati akciju u pogrešnom kontekstu (npr. phantom jump u game over screenu pre nego što `screen` state predje u `playing`).

**Fajl:** `src/input.js`, `touchend` event listener (~linija 38)
```js
canvas.addEventListener('touchend', e => {
  e.preventDefault();
  input.jump = false;
  input.duck = false;
  // Dodati:
  input.jumpPressed = false;
  input.duckPressed = false;
}, { passive: false });
```

## Bug 3 — LOW: Ticket URL subdomain mismatch

`CONFIG.TICKET_URL = 'https://app.bilet.rs/show/261'` ali game over screen prikazuje link tekst `bilet.rs/show/261` (bez `app.` prefiksa). Korisnik koji ručno ukuca URL ne stiže na pravo mesto.

**Fajl:** `src/ui.js`, `showGameOver` funkcija — `<a href="${CONFIG.TICKET_URL}" ...>\u{1F3AB} Uzmi kartu — bilet.rs/show/261</a>`

Fix: promeniti display tekst u `app.bilet.rs/show/261`.
