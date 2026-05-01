# BETA TEST REPORT — Poslednja Smena

**Tester:** Beta Trio (Zora + Raša + Lela)
**Datum:** 2026-05-01
**Metoda:** Code review + statička analiza (bez live servera)

### Ukupna ocena: 7.5/10

---

### Zora (UX): 7/10

**Šta radi:**
- DOM struktura je jasna: `#scene-container`, `#scene-title`, `#scene-text`, `#options-list`
- Opcije su stacked dugmad sa `min-height: 44px` — touch targets ispravni
- `_disableOptions()` sprečava dupli klik odmah po izboru — dobro
- Restart dugme ("↩ Odigraj ponovo") jasno postoji na epilog kartici
- Font-size bumped na 18px za mobile (<480px) — čitljivo
- `max-width: 65ch` na tekstu — optimalno za čitanje

**Šta ne radi:**
- **Nema audio toggle dugmeta.** Drone počinje automatski na prvom kliku, bez UI kontrole za mute. `setEnabled()` postoji u audio.js ali nema dugmeta. Za igru o tihoći i melanholiji — neočekivana buka sa slušalicama je problem.
- **Nema scene progress indikatora** — igrač ne zna je li na sceni 2 ili 6 od 7. Za igru od 8-12 min, malo dezorijentišuće.
- `#epilog-container` se `scrollTop = 0` ali nema smooth scroll — na mobilnom epilog može da se pojavi ispod viewporta.

**Bug list:**
- B1 (UX/MEDIUM): Nema mute dugmeta za drone audio
- B2 (UX/LOW): Nema progress indikatora

---

### Raša (Tehničko): 8/10

**Šta radi:**
- `applyChoice` je ispravno imutabilan — spread + nova kopija history, original state netaknut ✓
- `determineEnding` prioritet E→A→B→C→D korektno implementiran ✓
- `clamp` se koristi u `applyChoice` za sve stat promene ✓
- `saveState`/`loadState` sa version check — sigurno za localStorage ✓
- Nema circular importa: `narrative.js` → `state.js` (jednosmerno) ✓
- `_disableOptions()` štiti od double-click race condition ✓
- Keyboard (1/2/3) i klik oba pozivaju `onChoice`, a `clearChoiceCallback` sprečava dupli trigger ✓
- `showTransition` koristi double-rAF pre fade-in — layout-safe ✓

**Šta puca:**
- **Kraj A threshold edge case:** `determineEnding` koristi `gorčina <= LOW` (≤35), ali `_buildStatLines` u ui.js koristi `> high` (>65) za stat opise. Stat na tačno 65 triguje ending A ali ne prikazuje "Ostao si dostojanstven." — igrač dobija default tekst "Bio si isti čovek" što je tematski pogrešno za Kraj A.
- **`initCanvas` vraća ctx ali `main.js` ignoriše return value.** Oba pozivaju `canvas.getContext('2d')` — nije bug (isti objekat), ali zbunjujuće.

**Bug list:**
- B3 (TECH/LOW): `_buildStatLines` koristi `> 65` (strict) umesto `>= 65`, nekonzistentno sa `determineEnding` koji koristi `>=`. Fix: promeni u `>= high` u `_buildStatLines`.

---

### Lela (Engagement): 7.5/10

**Šta radi:**
- **Prosa je odlična.** Svaka scena ima konkretan senzorni detalj:
  - "kafa je hladna... firmin pečat crni, mali, definitivan"
  - "ruke mirišu na industrijski sapun, onaj sa zelenim zrncima"
  - "broj je izgrebán šrafcigerom u metalni okvir — 1994"
  - "pukotina... od 2019. godine, kad su menjali cev"
  - "cipele sjaje. Gleda te kako prolaziš i jedva primetno klimne"
  Ovo je daleko iznad generičkog AI prose-a. Sine je dobro preuredio brifu.
- Epilozi su emotivno diferencirani — svih 5 završetaka ima sopstvenu notu
- Replayability je genuine — svaki kraj sadrži konkretan detalj iz scena koji resonuje
- 7 scena + finale je savršena dužina — ne prenatrpano, ne kratko

**Šta dosadi:**
- **Kraj E (Nepromenjeni) je praktično nedostižan.** Zadržati sve 4 statistike u [35-65] kroz 7 scena zahteva specifičnu strategiju bez meta-znanja. Nasumičan igrač nikad neće naći ovaj kraj. Ironično — najlepši kraj je najteže videti.
- Nema vizuelnog feedbacka kada opcija "radi nešto" — igrač ne vidi ni trag promene statova tokom igre (što je dizajn po sebi), ali ni potvrdu da je klik registrovan (dugme se disable-uje ali bez animacije).
- Scena "Branko" je kratka i malo plitka u poređenju sa ostatkom — šef koji "gleda sat" je malo kliše.

**Predlog:**
- Dodati 200ms CSS animaciju na opcije dugmad pri click (scale ili opacity blip) kao "klik potvrda"
- Razmotriti hint za Kraj E na epilog kartici: "Ima još jedan kraj za koga je ostao isti..."

---

## TOP 3 kritična problema (blocker za release)

### Bug 1 — CRITICAL: Nema audio toggle UI
Drone audio počinje automatski na prvom kliku, nema dugmeta za mute. `setEnabled()` postoji u `src/audio.js` ali nije eksponiran u UI. Za igrača koji otvori igru na poslu sa glasnim zvučnicima — drone je iznenađenje bez rešenja.

**Fix:** Dodati tiho ikonicu 🔇/🔊 u gornjem desnom uglu koja zove `setEnabled(false)` / `setEnabled(true)` iz audio.js. Ili: inicijalno startovati audio kao muted, pa prikazati "Uključi atmosferu" dugme.

### Bug 2 — MEDIUM: Kraj A praktično blokiran sa jednim popularnim prvim izborom
`jutro` Opcija A ("Sklopiti, staviti u džep") daje `gorčina +5` → gorčina=55. Maksimalna gorčina redukcija u ostatku igre je −18 (branko A −5, ogledalo B −5, zvono B −8), što daje gorčina=37 > 35 = threshold za Kraj A. Igrač koji počne sa prvom opcijom, koja je tematski logična i daje ponos+8, biva locked-out Kraja A bez ikakvog znaka zašto.

**Fix:** Sniziti gorčina threshold za Kraj A na `≤ 40` umesto `≤ 35` u `narrative.js:determineEnding`. Ili: na `jutro` Opciju A izmeniti efekat u `{ ponos: +10 }` (bez gorčine) — jer sklapanje pisma u džep može biti dostojanstvo, ne gorčina.

### Bug 3 — LOW: `_buildStatLines` koristi `> 65` (strict) umesto `>= 65`
Igrač sa ponos=65 dobija Kraj A ali epilog mu prikazuje default "Bio si isti čovek" umesto "Ostao si dostojanstven." Semantička greška bez gameplay implikacije ali thematically pogrešno.

**Fix:** U `src/ui.js`, funkcija `_buildStatLines`, promeni:
```js
if (stats.ponos > high) → if (stats.ponos >= high)
```
(i za ostale statistike u istoj funkciji)

---

## TOP 3 "nice to have" (ako ima vremena)

1. **Audio mute toggle** (ako se ne uradi kao Critical fix) — barem tekstualni link "Isključi zvuk" na dnu ekrana
2. **Scene progress hint** — diskretni tekst ispod naslova: "3 / 7" ili čak samo "..." koji se skraćuje
3. **Kraj E hint** — na epilog kartici za E: "Ovo je retko." — samo to, ništa više
