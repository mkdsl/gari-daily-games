# Beta Report — DJ za Pultom
**Beta Trio** (Zora / Raša / Lela) | 2026-05-09

## Ocena: 3.5 / 10

Igra ima solidnu arhitekturu i dobro zamišljen loop, ali ima **dva CRITICAL buga koji sprečavaju pokretanje** (broken import putevi), plus niz MEDIUM bugova koji lome vizuelni feedback i end-screen. U ovom stanju igra se ne može učitati u browseru.

---

## Bug 1 — CRITICAL: Broken import putevi — render.js i ui.js

**Raša** | Igra se ne učitava u browseru (ES module import error)

**render.js, red 8:**
```js
import { getCurrentZone } from '../../state.js';
// ↑ render.js je u src/ — putanja treba biti '../state.js' ili './state.js'
// '../../state.js' traži fajl dva nivoa gore (van game direktorijuma)
```

**ui.js, red 8–9:**
```js
import { formatElapsed, getZoneProgress } from '../../systems/zones.js';
import { getAvailableUpgrades, canBuyUpgrade } from '../../systems/upgrades.js';
// ↑ ui.js je u src/ — putanje treba biti './systems/zones.js' i './systems/upgrades.js'
// '../../systems/' traži fajlove van game direktorijuma
```

**Predloženo rješenje:**
- `render.js`: zamijeni `'../../state.js'` → `'./state.js'`
- `ui.js`: zamijeni `'../../systems/zones.js'` → `'./systems/zones.js'` i `'../../systems/upgrades.js'` → `'./systems/upgrades.js'`

---

## Bug 2 — CRITICAL: Zone ID mismatch — canvas nikad ne mijenja boje

**Raša** | `render.js` koristi pogrešne zone ID-ove za lookup

`render.js` definira `ZONE_COLORS` sa ključevima `'zagrevanje'`, `'vrhunac'`, `'after_hours'`, ali `getCurrentZone()` vraća Zone objekt čiji je `.id` iz `config.js` — a tamo su ID-ovi `'warmup'`, `'peak'`, `'afterhours'`. Render.js pri tome ne uzima `.id` s objekta nego koristi cijeli objekt kao ključ:

```js
// render.js — getCurrentZone() vraća OBJEKT, ne string
const zoneName = getCurrentZone ? getCurrentZone() || 'zagrevanje' : 'zagrevanje';
const zone = ZONE_COLORS[zoneName] || DEFAULT_ZONE;
// ↑ ZONE_COLORS[{ id:'warmup', ... }] = undefined → uvijek DEFAULT_ZONE (zelena)
```

Čak i kada se ispravi na string, `getCurrentZone().id` vraća `'warmup'`/`'peak'`/`'afterhours'`, dok ZONE_COLORS ima `'zagrevanje'`/`'vrhunac'`/`'after_hours'` — **nikad se ne matchaju**.

Rezultat: canvas ostaje u zelenoj "zagrevanje" boji tokom cijele igre. Laser efekti u Vrhucu se ne pojavljuju. Avala silhueta u After Hours se ne pojavljuje.

**Predloženo rješenje:** Uskladiti ključeve — ili promijeniti ZONE_COLORS ključeve u `'warmup'`, `'peak'`, `'afterhours'`, ili mapirati zone ID u display key:
```js
const ID_TO_COLOR_KEY = { warmup: 'zagrevanje', peak: 'vrhunac', afterhours: 'after_hours' };
const zoneName = ID_TO_COLOR_KEY[getCurrentZone().id] || 'zagrevanje';
```

---

## Bug 3 — MEDIUM: Zone badge zauvijek pokazuje ZAGREVANJE ×1.0

**Zora / Raša** | `ui.js` zone ID mismatch — badge se nikad ne ažurira

`setBodyZone()` u ui.js prima zone ID iz state.js (`'warmup'`, `'peak'`, `'afterhours'`) i dodaje CSS klasu `zona-warmup`, `zona-peak`, `zona-afterhours`. Ali `_updateZone()` čita body klasu i provjerava za `zona-vrhunac` i `zona-after-hours` — koji nikad nisu postavljeni. `ZONE_LABELS` ima ključeve `'zagrevanje'`, `'vrhunac'`, `'after_hours'`.

```js
// setBodyZone('peak') → body dobija klasu 'zona-peak'
// _updateZone() provjerava: body.classList.contains('zona-vrhunac') → false
// → zoneName ostaje 'zagrevanje' → badge uvijek: ZAGREVANJE ×1.0
```

Igrač nikad ne vidi vizuelnu potvrdu zone tranzicije u HUD-u, čak i kada audio/canvas efekti krenu (nakon popravke Bug 2).

**Predloženo rješenje:** Uskladiti ID-ove u `setBodyZone()` i `ZONE_LABELS` — koristiti iste ključeve (`'warmup'`/`'peak'`/`'afterhours'`) u oba mjesta, ili mapirati pri postavljanju klase.

---

## Bug 4 — MEDIUM: End-screen statistike su uvijek prazne / nule

**Zora** | `_endGame()` šalje pogrešne ključeve u `showScreen()`

`main.js _endGame()` poziva:
```js
showScreen(type, { elapsed, peak_zone, total_clicks, coins_earned });
```

Ali `ui.js _buildStats()` čita:
```js
data.elapsed_s    // ← traži elapsed_s, dobija undefined (poslano kao elapsed)
data.peakZone     // ← traži peakZone, dobija undefined (poslano kao peak_zone)
data.totalClicks  // ← traži totalClicks, dobija undefined (poslano kao total_clicks)
data.maxEnergy    // ← traži maxEnergy, uopšte nije poslano
```

Rezultat: win/fail screen pokazuje `—` za sve statistike i `0%` za energy. Igrač nema feedback o svom performansu.

**Predloženo rješenje:** Uskladiti ključeve u `_endGame()` da odgovaraju onome što `_buildStats()` čita, i dodati `maxEnergy` tracking u state.

---

## Bug 5 — MEDIUM: Share dugme nikad nije vidljivo

**Lela / Zora** | `shareText` se ne generiše i ne šalje u `showScreen()`

`ui.js showScreen()` prikazuje share dugme samo ako `data.shareText` postoji:
```js
if (data && data.shareText) { /* share dugme */ }
```

`main.js _endGame()` ne generiše ni ne šalje `shareText` u data objektu. Share dugme nikad nije renderirano — ni na win, ni na fail screenu.

**Predloženo rješenje:** U `_endGame()` generisati share tekst i proslijediti ga:
```js
const shareText = type === 'win'
  ? `Odradio sam 6-satnu DJ smenu! 🎧 ${Math.floor(state.music_coins)} MC zarađeno. Igraj: ${window.location.href}`
  : `Pokušao sam DJ smenu — pala mi je energija za ${formatElapsed(state.elapsed_s)}. 🎛️`;
showScreen(type, { ..., shareText });
```

---

## UX napomene (ne bugovi)

**Zora:**

- **Upgrade drawer je zatvoren po defaultu** — novi igrač neće odmah znati da postoji. Razmotriti kratki bounce animaciju drawera pri ulasku u igru, ili tooltip "Otvori upgrades ↑".
- **"Next Track" cooldown** je 3000ms (config.js `CLICK_COOLDOWN_MS`) ali vizuelni cooldown indicator postoji u input.js prema manifestu — nije vidljivo u kodu koji smo čitali. Treba verifikovati da li se cooldown vizuelno prikazuje na dugmetu.
- **Menu screen radi ispravno** — "POČNI SMENU" dugme i `startGame()` poziv su korektno implementovani. ✓
- **Offline fail zaštita** je deklarisana u komentarima ali nije implementovana u kodu: `clamp(energy, 0.0, 100.0)` dopušta da energy padne na 0 offline. Ako igrač ostavi igru duže od ~27 minuta bez upgrades u ranoj igri, sljedeći tick po povratku odmah triggera fail. Ovo treba biti `clamp(energy, 0.01, 100.0)` ili eksplicitna provjera.

---

## Engagement ocena

**Lela:**

**Prvih 30 sekundi:** Vizuelno impresivno — animirani vinyl, BPM counter, bobajuća crowd. Odmah je jasno šta treba raditi (klikni Next Track). Pozitivno.

**Passive drain tenzija:** 0.030/s u zagrevanju znači -1.8/min. Sa inicijalnom energijom od 50, bez ikakvog klika igrač ima ~27 minuta do fail-a. To je zdrava tenzija koja tjera na angažman, ali ne paniku. Dobra kalibracija za casual igru.

**Zone transition (2h mark):** Mehanika postoji i audio/vizuelni trigger je implementiran u zones.js + main.js. Međutim, zbog Bug 2 i Bug 3, igrač ne vidi vizuelnu promjenu na canvasu ni u HUD badge-u — zona tranzicija prolazi neviđena. Ovo drastično smanjuje "wow moment" koji bi trebao biti ključni engagement hook.

**Upgrade ekonomija:** 10 upgrades sa progresivnim cijenama (30 MC → 14,000 MC) uz pasivni prihod od 1 MC/s = zanimljiva odluka kada kupiti. Dobro dizajnirano.

**Win/Fail feedback:** Zbog Bug 4 i Bug 5, end-screen je prazan i nema share-a. Ovo eliminiše viralni potencijal i osjećaj satisfakcije pri pobjedi.

**Zaključak:** Engagement ideje su solidne, ali trenutni bugovi skrivaju sve "satisfying" momente. Nakon popravki, ocjena engagement-a može porasti na 7.5–8/10.

---

## Sažetak popravki po prioritetu

| # | Severity | Fajl | Problem |
|---|----------|------|---------|
| 1 | CRITICAL | `src/render.js:8`, `src/ui.js:8-9` | Broken import putevi (igra ne startuje) |
| 2 | CRITICAL | `src/render.js` | Zone ID mismatch → canvas bez promjene boje |
| 3 | MEDIUM | `src/ui.js` | Zone badge uvijek ZAGREVANJE |
| 4 | MEDIUM | `src/main.js` + `src/ui.js` | End-screen statistike prazne |
| 5 | MEDIUM | `src/main.js` | Share dugme nikad ne prikazuje |
