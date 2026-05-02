# Beta Report — Mozaik Ludila

## Ocena: 7.0 / 10

---

## UX (Zora)

**Fragment zona — selekcija i jasnoća: DOBRO**
Klik-za-selekciju model je implementiran. Aktivan fragment se skalira na `SELECTED_SCALE = 1.1` kada je selektovan (`render.js:328`), što daje vidljivi vizuelni feedback. Rotacija klikom na isti fragment je intuitivna.

**Problemi:**
- `_isInActiveFragmentZone` (`input.js:140-146`) koristi hardkodovane ±80px / ±60px hit zone relativno na `logicalW/2, fragmentZoneY+50`. Na mobilnim ekranima sa `cellSize=38` (umesto 60), ova zona nije skalirana i može biti suviše velika ili neprecizna — fragmenti pored centra (peek zona) mogu slučajno aktivirati selekciju ili je blokovati.

**Ghost preview: DOBRO**
Implementiran u `render.js:259-300`. Validna pozicija = boja fragmenta na opacity 0.45, nevalidna = crvena (`GHOST_INVALID_COLOR`). Radi ispravno. Border (beli) se crta samo za validne pozicije — dobar vizuelni distinkcija.

**Nevalidni placement shake: POSTOJI ALI OGRANIČEN**
U `input.js:239`: `state.animations.shakeTimer = PLACEMENT_SHAKE_FRAMES * 16`. Shake pomiče ceo grid horizontalno (`render.js:50-52`). Vizualni feedback postoji. Međutim, shake samo pomiče grid — ne i fragment zonu. Za igrača može biti zbunjujuće jer treperi samo gornji deo ekrana.

**Win/Game Over overlays: JASNI**
Win overlay (`render.js:471-501`) prikazuje skor, best combo, vreme i zeleno dugme "Novi mozaik". Game Over overlay (`render.js:507-535`) prikazuje skor, procenat restauracije, best combo i plavo dugme "Ponovo". Oba su jasna i kompletna.

**Hint glow: POSTOJI I RADI**
Implementiran u `render.js:167-254`. Glows se crtaju za redove, kolone i 2×2 kvadrante sa >= 3 pločice iste boje. Logika je ispravna i korisna za igrača.

**Ocena UX: 7 / 10**

---

## Tech (Raša)

### Import/Export analiza

Svi importi su konzistentni i ispravni:
- `input.js` importuje `PLACEMENT_SHAKE_FRAMES`, `PLACEMENT_SHAKE_OFFSET`, `INPUT_BLOCK_DURATION`, `MATCH_ANIM_DURATION` iz `config.js` — sve ove konstante postoje.
- `render.js` importuje sve potrebne konstante iz `config.js` — nema mismatch-a.
- Nema cirkularnih zavisnosti u vidljivom kodu.

### SET logika u matching.js: ISPRAVNA

`evaluateMatches` (`matching.js:60-106`) koristi `Set<string>` ključeve "r,c" — duplikati su automatski elimisani. Redovi, kolone i 2×2 kvadranti se evaluiraju ispravno. Granični uslovi su tačni (r ∈ [0..6] za kvadrante).

**Jedina logička napomena:** Za kolone, provera počinje od `grid[0][c]` (`matching.js:75`). Ako je `grid[0][c]` null, kolona se preskače čak i ako preostalih 7 ćelija imaju istu boju — ali to je ispravno ponašanje jer null ≠ null za color match.

### checkGameOver: ISPRAVNA

`checkGameOver` (`placement.js:80-104`) iterira sve rotacije × sve pozicije na gridu. Logika je O(rotations × 64 × cells) kao što GDD specifikuje. Vraća `false` ako `activeFragment` je `null` — ovo je sigurno.

### initFragmentQueue i enqueueNewFragment: POSTOJE I PRAVILNO SE KORISTE

Obe funkcije postoje u `fragments.js`. `main.js:91-103` ispravno poziva `initFragmentQueue(3, 0)` pri inicijalizaciji i `resetGame`. `input.js:221-223` poziva `enqueueNewFragment` posle svakog postavljanja, pa `shift()` na queue.

### KRITIČAN BUG — Race condition: clearMatchedCells vs checkGameOver

U `input.js:214-217`:
```js
setTimeout(() => {
  clearMatchedCells(state.grid, matched);
}, INPUT_BLOCK_DURATION);
```

`INPUT_BLOCK_DURATION = 160ms`. Odmah POSLE ovog `setTimeout` poziva (ista sinhrona egzekucija), na linijama 221-233, kod:
1. Pomera queue (`state.fragmentQueue.shift()`)
2. Postavlja `state.activeFragment = state.fragmentQueue[0] ?? null`
3. Poziva `checkGameOver(state.grid, state.activeFragment)` — **na grid-u koji JOŠ NIJE OČIŠĆEN**

Ovo znači da `checkGameOver` evaluira game over na punom (neočišćenom) gridu — grid ima sve matched ćelije još popunjene. Ovo može uzrokovati lažne "game over" detekcije: fragment možda ne može stati na pune ćelije, ali posle brisanja bi mogao. Rezultat: igra može prerano završiti sa "game over" ekranom kada nije stvarno game over.

### Mogući null crash za state.activeFragment

Na kraju `_handlePress` (`input.js:223`): `state.activeFragment = state.fragmentQueue[0] ?? null`. Ako je queue nekako prazan, `activeFragment` postaje `null`. Ovo само po sebi ne crashi igru (checkGameOver vraća `false` za null), ali igrač ne može igrati — nema fragmenta za postavljanje, ali `gamePhase` ostaje `'playing'`. Vizualno, fragment zona prikazuje ništa, igra je zamrznuta. Ova situacija ne bi trebala nastupiti u normalnom toku (queue uvek ima 3 elementa), ali edge case u localStorage load-u (`state.js:99`: `fragmentQueue: parsed.fragmentQueue ?? []`) može ostaviti prazan queue.

### Touch koordinate: POTENCIJALNI BUG

`_getTouchPos` (`input.js:112-114`) primenjuje DPR korekciju:
```js
x: (touch.clientX - rect.left) * (canvas.width / rect.width / (window.devicePixelRatio || 1)),
```

`canvas.width` je fizički piksel (DPR skaliran). `rect.width` je CSS piksel. `canvas.width / rect.width` = DPR. Deljenje sa `devicePixelRatio` eliminira DPR korekciju i vraća logičke koordinate — ovo je ispravno.

**Ali** `_getCanvasPos` za miš (`input.js:94-99`) NE primenjuje DPR korekciju — vraća samo `clientX - rect.left` (CSS koordinate). Ovo je konzistentno sa tim da canvas render radi u logičkim pikselima (`ctx.scale(dpr, dpr)` u main.js). Za miš je ispravno.

**Ocena Tech: 6.5 / 10**

---

## Engagement (Lela)

### Win target 2500 — dostižnost: REALNO

Placement bonus je `SCORE_PLACEMENT_BONUS = 1` po pločici — dakle 1-4 poena po fragmentu. Base match: 10 po pločici. Perfect row/col: 100 bonus. Combo do ×5. 

Tipičan run bez combo-a: 2500 / 10 = ~250 matched pločica, a svaki matched potez briše 8-16 pločica. To su ~15-30 aktivnih match-ova. Dostižno u ~50-100 poteza, što je otprilike 5-10 minuta. Ciljana dužina sesije je 5 minuta — malo striktno, posebno u ranim fazama, ali prihvatljivo.

### Placement bonus: UVEK POZITIVAN ALI ZANEMARLJIV

Da, skor uvek raste (+1 do +4 po potezu). Progress bar se uvek pomiče napred. Pozitivno za engagement. Međutim, 1 bod po pločici vs 2500 target = čisto cosmetic — pravi progress dolazi od match-ova.

### Combo sistem: POSTOJI I DAJE FEEDBACK

Combo tekst "COMBO ×N!" se prikazuje 1200ms na sredini ekrana. Zlatni pulse overlay za combo >= 3. HUD prikazuje `×N` multiplier kada je combo >= 2. Sistem je kompletno implementiran i vizualno zadovoljavajući.

### Peek za sledeće fragmente: POSTOJI

`_drawPeekFragments` (`render.js:352-397`) crta 2 sledeća fragmenta sa `PEEK_OPACITY = 0.6` na ±120px od centra. Label "← Sledeći" ispod prvog peek fragmenta.

**Problem:** Peek labela kaže samo "← Sledeći" (jedina labela, samo za levi peek fragment, linija 386). Desni peek fragment nema labelu. Igrač možda neće razumeti da su to predstojeći fragmenti — posebno na prvoj sesiji.

### Replayability — random shape generation: POSTOJI

`pickRandomShape(score)` sa PHASE_POOLS — progressive težina kroz igru. Nasumičan izbor boje iz 5 boja. Svaki run je drugačiji. Sistem phase pools je dobar dizajn.

**Nedostatak:** Nema highscore prikaza na Win/Game Over ekranu — `saveHighScore` i `loadHighScore` postoje u `state.js`, ali rezultat se nigde ne prikazuje igračima u overlayima. Propuštena motivacija za replayability.

**Ocena Engagement: 7.5 / 10**

---

## Top 3 buga za Jovu (prioritetno)

### Bug 1 — CRITICAL: checkGameOver evaluira neočišćen grid

**Fajl:** `src/input.js`, linije 214-233  
**Problem:** `clearMatchedCells` se poziva unutar `setTimeout` sa kašnjenjem od 160ms (`INPUT_BLOCK_DURATION`). Međutim, `checkGameOver` se poziva SINHRONOM, odmah posle `setTimeout` registracije (linja 231), dok su matched ćelije još uvek popunjene na gridu. Posledica: `checkGameOver` vidi prepun grid i može falsely detektovati game over kada bi posle brisanja sigurno bilo mesta za sledeći fragment. Igra može prerano završiti.  
**Predlog fix-a:** Pomeri `checkGameOver` i queue update unutar `setTimeout` callback-a, POSLE `clearMatchedCells`:
```js
setTimeout(() => {
  clearMatchedCells(state.grid, matched);
  // Queue update i game over check OVDE, na čistom gridu
  state.fragmentQueue.shift();
  enqueueNewFragment(state.fragmentQueue, state.score);
  state.activeFragment = state.fragmentQueue[0] ?? null;
  if (checkGameOver(state.grid, state.activeFragment)) {
    state.gamePhase = 'lost';
  }
  saveState(state);
}, INPUT_BLOCK_DURATION);
// Ukloni queue update i checkGameOver iz sinhronog dela
```

---

### Bug 2 — MEDIUM: Frozen state kada je fragmentQueue prazan posle load-a

**Fajl:** `src/main.js`, linije 96-103; `src/state.js`, linija 99  
**Problem:** `loadState()` može vratiti state sa `fragmentQueue: []` ako je save fajl neispravan ili delimičan. U `main.js`, provera je `if (!state || !state.fragmentQueue || state.fragmentQueue.length === 0)` — ovo bi trebalo uhvatiti case, ali samo na inicijalnom load-u. Ako se state korumpira tokom igre (npr. parsiranjem staro save-a), `activeFragment` postaje `null` bez triggera game over. `gamePhase` ostaje `'playing'` ali igra je funkcionalno zamrznuta — fragment zona je prazna, igrač ne može ništa uraditi.  
**Predlog fix-a:** U `_handlePress` (`input.js`), posle `state.activeFragment = state.fragmentQueue[0] ?? null`, dodati proveru:
```js
if (!state.activeFragment && state.gamePhase === 'playing') {
  // Oporavi queue
  const { initFragmentQueue } = await import('./entities/fragments.js');
  state.fragmentQueue = initFragmentQueue(3, state.score);
  state.activeFragment = state.fragmentQueue[0];
}
```
Ili jednostavnije: u `main.js` posle load-a, ako `fragmentQueue.length < 3`, dopuni queue do 3.

---

### Bug 3 — LOW: Peek zona — nema jasne labele za drugi peek fragment

**Fajl:** `src/render.js`, linije 384-395  
**Problem:** Labela "← Sledeći" se prikazuje samo ispod prvog (levog) peek fragmenta. Drugi (desni) peek fragment nema labelu. Na prvoj sesiji igrač možda neće prepoznati da su to predstojeći fragmenti. Takođe, strelica "←" upućuje ulevo, ali prvi peek je već levo od centra — strelica je zbunjujuća.  
**Predlog fix-a:** Promena teksta labela: umesto `'← Sledeći'` za peek[0], koristiti `'+1'` i za peek[1] `'+2'` (ili `'2.'`). Centrirati labele ispod oba peek fragmenta:
```js
const labels = ['+1', '+2'];
// prikazati oba
```

---

## Šta radi dobro

- **Ghost preview** je vizuelno čist i informativan — validna/nevalidna distinkcija bojom je odmah jasna.
- **Hint glow sistem** funkcionalno implementiran za sve tri match kategorije (red, kolona, 2×2 kvadrant) — direktno pomaže igraču da planira poteze.
- **Combo sistem** ima potpun vizuelni i audio feedback — tekst, zlatni pulse overlay, HUD multiplier indicator.
- **Weighted phase pools** za fragment selekciju su odličan progressive design — igrač počinje sa Simple/I2 i postepeno dobija L/J/T/S/Z forme.
- **Win i Game Over overlaysi** su jasni, kompletni i prikazuju relevantne statistike (skor, combo, vreme).
