# Beta Report: Bespuće

## Generalni sud

Igra je u suštini igriva — osnovna petlja (leti kroz hodnik, skupljaj kristale, pogini, nadogradi se) funkcioniše i state mašina prolazi sve tranzicije bez rušenja. Međutim, pronađena su dva ozbiljna funkcionalna propusta: checkpoint vizuelni marker nikad ne pojavljuje se na ekranu (funkcija `createCheckpoint` nije pozvana nigde u kodu), i crystal score se obračunava dvostruko — ali "bonus" koji respektuje multiplier iz collision.js biva prebrisan svakim frameom jer se score računa iznova od nule. Na mobilnom, nedostaje vizualna oznaka za thrust zonu (gornja polovina ekrana), što znači da novi igrač ne zna kako da ide gore. Sve ostalo — fizika, scroll, meta progress, obstacle spawn — radi kako treba.

## Score: 6.5/10

## Bugovi i problemi

### Bug 1 — CRITICAL: Checkpoint vizuelni marker nikad ne prikazuje

`createCheckpoint()` je definisana u `src/entities/pickup.js` (linija 31) ali se ne poziva nigde u celoj bazi koda. Zbog toga `run.pickups` nikad ne sadrži objekat tipa `'CHECKPOINT'`, pa `drawCheckpointLines()` u `render.js` (linija 332) uvek crta prazno, a `pickup.js` linija 89 (CHECKPOINT trigger logika) ne aktivira se nikad. Igrač nema nikakvu vizuelnu najavu pre nego što CHECKPOINT_SELECT overlay iskočí. Zelena isprekidana linija koja najavljuje checkpoint raskrsnicu — funkcija koja je dizajnirana, implementirana i stilizovana (CONFIG.COLORS.CHECKPOINT_LINE = '#00ff88') — nikad se ne vidi.

**Fix:** U `systems/chunks.js`, `generateChunk()` već računa `checkpointLocalX`. Iskoristiti to: u `updateChunks()` pri generisanju novog chunk-a, ako `newChunk.checkpointLocalX >= 0`, pozvati `run.pickups.push(createCheckpoint(newChunk.worldX + newChunk.checkpointLocalX))`. Uvesti `import { createCrystal, createCheckpoint } from '../entities/pickup.js'` (već importuje `createCrystal`).

### Bug 2 — CRITICAL: Crystal score kalkulacija je polomjena — multiplier se gubi

U `systems/index.js` linija 147–148, skor se svaki frame iznova izračunava iz nule:
```js
run.score = Math.floor(
  (run.distance / CONFIG.SCORE_DIVISOR) * score2x * run.multiplier
) + run.crystals * CONFIG.CRYSTAL_SCORE;
```
`run.crystals * CONFIG.CRYSTAL_SCORE` ne uzima u obzir `multiplier` ni `score2x`. Paralelno, `collision.js` linija 94 dodaje `run.score += CONFIG.CRYSTAL_SCORE * run.multiplier` pri sakupljanju — ali taj bonus se prepiše sledećim frameom jer se `run.score` uvek iznova izračunava. Konačno: svaki kristal uvek vredi ravnih 50 poena, bez obzira na multiplier. Progression sistem koji nagrada duže preživljavanje većim multiplierom je nefunkcionalan za kristale.

**Fix:** Ili (a) ukloniti inkrementalni `run.score +=` iz `collision.js` i umesto toga čuvati `run.crystalScore` akumulativan bonus koji se množi tek u finalnoj formuli, ili (b) prepraviti formulu u `index.js` da bude `+ run.crystals * CONFIG.CRYSTAL_SCORE * run.multiplier * score2x`.

### Bug 3 — MEDIUM: Mobilni thrust zone nema vizuelni hint

`render.js` `drawTouchZones()` (linija 460) crta samo dve zone na dnu ekrana (levo ◀ i desno ▶). Gornja polovina ekrana je thrust zona (`input.js` linija 33: `if (y < h * 0.5) touch.thrust = true`), ali ne postoji nikakav vizuelni indikator za nju. Na mobilnom, novi igrač nema pojma kako da brod ide gore — čitavo primarno upravljanje je nevidljivo. Brod odmah pada i pogine pre nego što igrač shvati mehaniku.

**Fix:** Dodati u `drawTouchZones()` semi-transparentnu oznaku za gornju zonu: npr. blagi outlined rectangle ili tekst "▲ THRUST" centriran u gornjem delu ekrana, sa `globalAlpha = 0.18` da ne smeta igri.

### Bug 4 — MEDIUM: WIDE_SHIP powerup ima zbunjujuće obrnutu semantiku

`POWERUP_NAMES['WIDE_SHIP']` = `'◈ Uski hitbox'` (`ui.js` linija 16). ID se zove WIDE (širok) ali efekat je narrow (uzak hitbox). U `player.js` linija 50, `WIDE_SHIP` aktivira `narrowHitbox = 8`. Na checkpoint ekranu, igrač čita "Uski hitbox" što je ispravno, ali kod je konfuzan i POWERUP_POOL u `systems/index.js` linija 26 eksponira `WIDE_SHIP` — svaki developer koji bude radio na ovome biće zbunjen.

**Fix:** Preimenuj ID u `NARROW_HITBOX` u svim fajlovima (player.js, ui.js, systems/index.js) ili bar promeni `POWERUP_NAMES` opis da jasno kaže "hitbox manja površina".

### Bug 5 — MEDIUM: Hardkodovane dimenzije ekrana u render.js

`drawObstacles()` u `render.js` linija 265 ima `const screenH = 2000`. MOVING_GATE tip crta gornju i donju traku koristeći ovu konstantu. Na uređajima višim od 2000px (retina tableti u landscape), donji zid gate-a ne pokriva ceo ekran — ostaje vidljiv prazan prostor. Slično, `drawRecordLine()` linija 219 odbacuje tačke sa `cx > 3000` što može isecati Record Line na ultra-wide monitorima.

**Fix:** Zameniti `2000` i `3000` sa `h` (visina kanvasa), respektivno `w + 100`, koji se prosleđuju kao argumenti u `render()` (već dostupni).

### Bug 6 — LOW: score2x powerup primenjen na distance score ali ne i na kristale u formuli

Kao dopuna Bug 2: `score2x` u formuli (linija 145–148) množi samo distance komponentu ali `crystals * CRYSTAL_SCORE` ostaje nepomnožen. Čak i kad se Bug 2 ispravi (dodata multiplier podrška), `score2x` bi trebalo da važi za sve komponente score-a.

---

## UX Nalazi (Zora)

1. **Onboarding**: MENU ekran ima jasnu poruku ali nema apsolutno nikakvo uputstvo za kontrole. Na desktop-u korisnik može da pogodi WASD/strelice, ali na mobilnom ne postoji nikakav hint osim vizuelnih zona dole. Gornja polovina (thrust) je potpuno tajanstvena.

2. **DEAD ekran** je dobar: score, kristali, "NOVI REKORD" flash — sve prisutno. Blinking "nastavljam za trenutak…" hint je pozitivan. Jedini problem: 1.5 sekundi čekanja pre META_UPGRADE može da se oseti dugo, posebno posle kratkih runova.

3. **META_UPGRADE ekran** je čist i funkcionalan. Dots progress bar, cene, disabled state za neaffordable — sve radi kako treba. Nedostaje opis šta tačno radi svaki upgrade (hover tooltip postoji ali touch uređaji ga ne aktiviraju).

4. **CHECKPOINT_SELECT** ima countdown timer (dobar) ali overlay iskočí bez tranzicije — abruptno. Kratki CSS fade-in (200ms) bi znatno poboljšao osećaj.

5. **HUD čitljivost** je dobra — SCORE levo, BEST desno, kristali gore desno sa hexagon ikonom. Aktivni powerupi se prikazuju u centru sa sekundama — informativno i dobro pozicionirano.

---

## Tehnika Nalazi (Raša)

1. **Nema null/undefined crasheva** u kritičnim pathovima. `render.js` linija 555 guardi `if (!run.player) return` sprečavaju crash između `resetRun` i `initPlayer`. `checkCollisions` guardi `if (!p || !p.alive) return`. Solidna odbrana.

2. **State tranzicije** su ispravne za sve korisnički dostupne putanje: MENU→RUNNING, RUNNING→DEAD, DEAD→META_UPGRADE, META_UPGRADE→MENU, RUNNING→CHECKPOINT_SELECT→RUNNING. Autoselect na checkpoint timeout radi. Nema petlje.

3. **Nema circular importa**: dependency graph je acycličan — main.js importuje sve, systems/index.js importuje physics/chunks/collision/entities, entities nemaju cross-importa osim config.

4. **Chunk scroll preciznost**: `updateChunks` u `chunks.js` linija 148 pomera `chunk.worldX` direktno. Kristali se skroluju zasebno u `pickup.js`. Nema sinhronizacione greške između chunk koordinata i pickup pozicija, jer kristali nose sopstvenu `x` koordinatu.

5. **`resize()` u main.js** poziva `ctx.scale(devicePixelRatio, devicePixelRatio)` svaki put. Na ponovljenim `resize` event-ima, scale se akumulira — svaki poziv dodaje novi scale layer na transform matricu bez resetovanja. Ovo može uzrokovati da canvas izgleda pogrešno skaliran posle prvog resize (rotacije ekrana na mobilnom, resize u desktop browseru).

   **Fix:** Dodati `ctx.setTransform(1, 0, 0, 1, 0, 0)` pre `ctx.scale(...)` call-a u `resize()`.

---

## Engagement Nalazi (Lela)

1. **"Još jedan run" loop** je prisutan i ubedljiv: eksplozija čestica + score prikaz + kristali + potencijalni "NOVI REKORD!" flash daju satisfakciju. Autoredirect u META_UPGRADE olakšava konverziju.

2. **Meta progression** sa 3 upgrade stabla (speed, shield, magnet) je minimalna ali smislena. Speed upgrade (3 nivoa, do +36% scroll) je kontra-intuitivan — zašto plaćati za to da igra bude teža? Bez konteksta u UI-u zašto je brzina upgrade a ne hazard.

3. **Difficulty curve**: `chunks.js` linija 160 — `difficulty = clamp(run.distance / 3000, 0, 1)`. Full difficulty na 3000px distance. Sa base scroll speed 180px/s, to je ~16 sekundi. DIAGONAL_BAR tip prepreka (najtežji) pojavljuje se tek na difficulty >= 0.9 = 2700px = ~15 sekundi. Kriva je realistična za arkadni format.

4. **Close call bonus** (CHECKPOINT_CLOSE_CALL_DIST u config.js) je definisan ali ne implementiran nigde — nema koda koji proverava da li je igrač prošao blizu zida i dodaje `CHECKPOINT_BONUS_CRYSTALS`. Mala izgubljena šansa za engagement feedback.

5. **Crystal Rain powerup** ispred igrača (5 kristala na fiksnoj Y poziciji igrača) može spawnovati kristale direktno u zidu u kasnijim tezinskim nivoima. Kristali su na `run.player.y` ali hodnik može biti uzak i playerova Y može biti blizu zida. Nije game-breaking ali vizuelno konfuzno.

---

## Top 3 kritična za fix

1. **Bug 1 — CRITICAL**: Pozvati `createCheckpoint()` iz `updateChunks` za chunk-ove koji imaju `checkpointLocalX >= 0` — bez toga checkpoint vizuel nikad ne postoji i igrač nema najavu.

2. **Bug 2 — CRITICAL**: Popraviti crystal score formulu u `systems/index.js` da uključi `run.multiplier` i `score2x`, i ukloniti redundantni `run.score +=` iz `collision.js` (ili ga zadržati kao jedini mehanizam umesto formule).

3. **Bug 3 — MEDIUM**: Dodati vizuelni thrust hint za gornju zonu ekrana u `render.js` `drawTouchZones()` — mobilna igrivost direktno zavisi od ovoga.
