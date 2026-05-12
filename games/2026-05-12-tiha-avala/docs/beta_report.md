# Beta Report — Tiha Avala
**Reviewer:** Beta Trio (Zora / Raša / Lela)
**Datum:** 2026-05-12
**Iteracija:** 1
**Status igre u manifestu:** `in_progress`

---

## Beta Score: 6 / 10

Igra ima solidnu arhitekturu i ispravnu akustičku logiku, ali jedan vizuelni bug kritično kvari UX (merači uvek crveni), a audio inicijalizacija ima iOS problem. Engagement sloj postoji ali nije dovoljno iskorišćen.

---

## CRITICAL bugovi — blokiraju igranje ili ozbiljno varaju igrača

### C1 — Komšija meter uvek crveni (vizuelni logički bug)
**Fajl:** `src/ui.js`, funkcija `updateMeters()`

Trostruki ternarni izraz za boju bara ima grešku u grani za "zeleno" stanje:
```js
// dual mode (isti problem postoji i u single-meter grani)
bar.style.background = kdb >= SPL_FAIL_THRESHOLD
  ? 'var(--accent-red)'
  : kdb >= SPL_WARN_THRESHOLD
    ? '#c0a020'
    : 'var(--accent-red)';   // <-- GREŠKA: treba zelena, ne crvena
```
Kada je `kdb < 67 dB` (zelena zona, komšija miran), bar je i dalje crven. Igrač nikad ne vidi zeleni signal da je na dobrom putu. Ovo direktno ruši core feedback loop igre. Isti bug važi za single-meter granu.

**Fix:** Zadnju granu promeniti u `'var(--accent-green)'`.

---

### C2 — iOS AudioContext nikad nije resumed
**Fajl:** `src/audio.js` + `src/input.js`

`wireAudioResume()` registruje `pointerdown` listener koji poziva `resumeAudio()`. Ali `resumeAudio()` samo resume-uje postojeći context — ne kreira ga:
```js
export function resumeAudio() {
  if (ctx_audio && ctx_audio.state === 'suspended') {
    ctx_audio.resume();
  }
}
```
Redosled događaja na iOS-u:
1. Korisnik tapne "TESTIRAJ" → `pointerdown` → `resumeAudio()` pozvan → `ctx_audio` je `null` → no-op
2. `click` → `initAudio()` → kreira `AudioContext` koji je odmah `suspended` na iOS Safari
3. Nema više `pointerdown` listenera (`{ once: true }`) — context ostaje `suspended` zauvek

Rezultat: ceo Web Audio sloj (ambient, crowd SFX, win jingle, sirena) ćuti na iPhoneu.

**Fix:** U `initAudio()`, odmah nakon kreiranja contexta pozvati `ctx_audio.resume()`. Ili: kreirati context u `wireAudioResume` callbacku umesto u `initAudio`.

---

## MEDIUM problemi — oštećuju first-impression

### M1 — Nema objašnjenja pravila na menu screenu
**Fajl:** `src/ui.js`, `renderMenu()`

Menu prikazuje title, tagline i countdown, ali nema ni jedne rečenice koja objašnjava mehaniku. Tagline "Audio inženjer Kluboslavija turneje" nije dovoljan. Novi korisnik ne zna šta su "dva merača" ni da mora da ih drži u zelenoj 10 sekundi.

**Fix:** Dodati 2-3 linije "Kako se igra" ispod dugmeta IGRAJ, ili info ikonu sa modalnim tooltipom.

---

### M2 — Slajder za Bass Ratio prikazuje vrednost u % ali nema semantičke veze
**Fajl:** `src/ui.js`, `makeSlider()`

Slajder se zove "Bass Ratio", vrednosti idu 0–100%, ali igrač ne zna šta to znači zvučno. Nema live feedback opisa (npr. "malo basa", "previše basa"). Hint system postoji u `src/content/hints.js` ali nisu prikazani inline pored slajdera.

---

### M3 — Win uslov (10 sekundi) nije vizuelno objašnjen pre prvog testa
**Fajl:** `src/ui.js`, `renderStandardHUD()`

Timer bar se pojavljuje tek kada su oba uslova ispunjena tokom simulacije. Pre toga igrač ne zna da mora da ZADRŽI vrednosti 10 sekundi. Ovo uzrokuje konfuziju zašto simulacija ne završava odmah.

**Fix:** Dodati statičan tekst u HUD pre starta: "Drži oba merača u zelenoj 10 sekundi."

---

### M4 — Score sistem nije objašnjen nigde u igri
**Fajl:** `src/systems/score.js`, `src/ui.js`

`calcScore` daje poene za vreme i marginu, ali igrač nikad ne vidi formulu ni bodovnu lestvicu. Na win screenu se prikaže broj (npr. 2750) bez konteksta — nije jasno da li je to dobro ili loše.

**Fix:** Prikazati breakdownu na win screenu: "Vreme: +1200 | Margina: +1550".

---

### M5 — Nivo 2 (`grace_ms: 0`) direktno sledi na nivo 1 (`grace_ms: 30000`)
**Fajl:** `src/levels/level_data.js`

Level 1 ima 30s grace perioda, ali `grace_ms` nije ni implementiran u `sim.js` — `tickSim` ga ne koristi nigde. Polje postoji u data ali nema efekat. Ovo znači da tutorial nivo nije "lakši" nego što bi trebao biti. Nije bloker, ali zbunjujuće.

---

## LOW — sitnice

### L1 — `share_text` u brand.js nije iskorišćen
**Fajl:** `src/content/brand.js`

```js
share_text: (level, score) => `Rešio/la nivo "${level}" — score ${score} | Tiha Avala 🎵`
```
Funkcija je definisana ali ni `ui.js` ni `main.js` je ne pozivaju. Nema share dugmeta na win screenu.

---

### L2 — Dual speaker happiness bar nema threshold liniju
**Fajl:** `src/ui.js`, `renderDualHUD()`

Standard HUD ima `<div class="meter-threshold-green" style="left: 70%">` na happiness baru. Dual HUD nema. Vizuelno nedosledno.

---

### L3 — `line_counts` u manifestu su nule
**Fajl:** `manifest.json`

```json
"line_counts": { "total_js": 0, "total_css": 0 }
```
Nije funkcionalni bug ali ostavlja utisak nedovršenosti u dev toolingu.

---

### L4 — `beta_score` u manifestu je `null`
**Fajl:** `manifest.json`

Nakon ovog reporta treba ga popuniti sa `6`.

---

### L5 — Nema global total score / leaderboard motivacije
**Fajl:** `src/ui.js`, `renderLevelSelect()`

Level select prikazuje best po nivou, ali nema zbira svih score-ova. Nema incentive da se replay-uje već pređeni nivo.

---

## Detaljni nalazi po kategoriji

### Zora — UX / First Impression

| Provera | Status | Napomena |
|---|---|---|
| Menu screen jasan? | PARCIJALNO | Nema objašnjenja pravila (M1) |
| Sliders labeled sa vrednostima u realnom vremenu? | DA | Label + live value display radi |
| Feedback na slider pokret? | DA | `playSliderTick()` + live meter update radi |
| Feedback smislen pre starta sim? | PARCIJALNO | Meters rade, ali boje su netačne (C1) |
| Fail screen jasan? | DA | Poruke su direktne i akcione |
| Win screen jasan? | PARCIJALNO | Score bez breakdown-a (M4) |
| Dual HUD vs Standard HUD konzistentnost? | DELIMIČNO | Nedostaje threshold linija na happiness baru (L2) |

**Zora rezime:** Core loop je razumljiv, ali uvodni kontekst (pravila, šta je 10s, šta je score) fali. Komšija merač koji je uvek crven (C1) je najkritičniji UX problem — igrač ne dobija pozitivni signal ni kad radi dobro.

---

### Raša — Tehnički / Bugovi

| Provera | Status | Napomena |
|---|---|---|
| ES6 importi u index.html | ISPRAVNI | Samo `src/main.js`, type="module" |
| ES6 importi u main.js | ISPRAVNI | Svi moduli postoje u manifestu i fajl sistemu |
| ES6 importi u ui.js | ISPRAVNI | `./content/brand.js`, `./content/hints.js` sve OK |
| ES6 importi u sim.js | ISPRAVNI | `./wind.js` postoji u manifestu |
| ES6 importi u acoustics.js | ISPRAVNI | `../config.js` — jedan import, tačan |
| `compute_Hs` za L1 sweet spot (SPL=100, bass=0.5, angle=0) | ISPRAVNO | Hs = (100-88)/20 × 1.0 + 0 + 0.15 = **0.75** > 0.70 ✓ |
| `compute_Kdb` za L1 sweet spot | ISPRAVNO | kdb = 100 − 38.06 − 5 + 0 + 0 = **56.94 dB** < 70 ✓ |
| sim.js detektuje pass condition | ISPRAVNO | Win: hs ≥ 0.70 AND max_kdb < 70, trajanje ≥ 10 000ms |
| localStorage implementiran | ISPRAVNO | `tiha-avala-scores`, try/catch, score+time per level |
| AudioContext kreiran uz user gesture | DJELIMIČNO | Desktop OK, iOS bug (C2) |
| Meter boje u `updateMeters()` | GREŠKA | Zelena zona prikazana crvenom (C1) |
| `grace_ms` implementiran u sim.js | NIJE | Polje postoji u data ali se ne koristi (M5) |

**Raša rezime:** Nema grešaka u import putanjama. Akustičke formule su matematički ispravne. Dva su prava buga: meter boja (C1 — logička greška u ternarnom operatoru) i iOS audio (C2 — race condition u AudioContext lifecycle-u).

---

### Lela — Engagement / Retention

| Provera | Status | Napomena |
|---|---|---|
| Replay motivacija | PARCIJALNO | "PONOVO" dugme postoji, ali nema score target da se bije |
| Scoring sistem jasno prikazan | NE | Broj postoji, nema breakdowna niti konteksta (M4) |
| Kluboslavija branding postoji ali nije nametljiv | DA | Title, tagline, footer link — nenametljivo ✓ |
| Countdown timer ka 20. jun | DA | `BRAND.countdown()` dinamički računa dane, prikazan na menu ✓ |
| Share funkcionalnost | NE | `share_text` postoji ali nije eksponiran (L1) |
| Global leaderboard / total score | NE | Level-by-level best radi, zbir ne postoji (L5) |
| Progresija nivoa jasna | DA | Level-select sa lock ikonama, `completed` CSS class |

**Lela rezime:** Countdown je implementiran korektno i stvara festival anticipaciju. Branding je suptilan i na mestu. Glavna slabost je što igrač posle win-a nema razlog da se vrati — score bez benchmark-a, nema share-a, nema total leaderboard-a. Dodavanje share dugmeta (kôd postoji!) bi bio najbrži engagement win.

---

## Prioritizovana lista popravki

| Prioritet | ID | Šta | Gde | Složenost |
|---|---|---|---|---|
| 1 | C1 | Zelena boja za kdb < 67dB | `ui.js:updateMeters()` | 1 linija |
| 2 | C2 | iOS AudioContext resume | `audio.js:initAudio()` | 2 linije |
| 3 | M1 | Pravila igre na menu | `ui.js:renderMenu()` | 5 linija HTML |
| 4 | M3 | "Drži 10s" tekst u HUD | `ui.js:renderStandardHUD()` | 1 linija HTML |
| 5 | M4 | Score breakdown na win screenu | `ui.js:renderWinScreen()` | 3 linije |
| 6 | L1 | Share dugme (kôd postoji) | `ui.js:renderWinScreen()` | 5 linija |
| 7 | M5 | Implementirati grace_ms u sim | `sim.js:tickSim()` | 10 linija |
| 8 | L2 | Threshold linija u dual HUD | `ui.js:renderDualHUD()` | 1 linija HTML |

---

*Beta Trio — Zora (UX) / Raša (tech) / Lela (engagement)*
*Generisano: 2026-05-12*
