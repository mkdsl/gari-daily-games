# Beta Report — Tiha Avala — Iteracija 2 (post-fix verifikacija)

**Datum:** 2026-05-12  
**Testeri:** Beta Trio (Zora + Raša + Lela)  
**Verzija:** post-fix (drugi krug)

---

## Beta Score — Iter 2

**9 / 10**

Svih 7 prijavljenih bugova je fixovano i verifikovano u kodu. Jedna stilistička nedoslednost ostaje (vidi napomenu u C1), ali nema funkcionalnog breakage-a. Igra je spremna za šef sign-off.

---

## Verifikacija fixeva

### C1 — Komšija merač uvek crven

**VERIFIED ✓**

`updateMeters()` u `src/ui.js` — single-speaker grana sada ima ispravnu trojnu kondiziju:
```
kdb >= SPL_FAIL_THRESHOLD ? '#ff3030' : kdb >= SPL_WARN_THRESHOLD ? '#c0a020' : 'var(--accent-green)'
```
Sigurna grana vraća `var(--accent-green)`. Dual-speaker grana identično koristi `'var(--accent-green)'`.

> Napomena (ne-CRITICAL): single grana koristi hardkodovano `'#ff3030'` za fail umesto CSS varijable `'var(--accent-red)'` kao dual grana. Vizuelno identično, ali postoji stilistička nedoslednost. Preporučuje se ujednačavanje u sledećem maintenance pass-u.

---

### C2 — iOS AudioContext race condition

**VERIFIED ✓**

`src/audio.js` ima `unlockAudioOnGesture()` koja:
- provjerava `audioReady` flag da ne kreira `AudioContext` dvaput
- kreira `AudioContext` (uz `window.webkitAudioContext` fallback) ako ne postoji
- odmah poziva `ctx_audio.resume()` ako je suspended

`src/input.js` importuje `unlockAudioOnGesture` iz `audio.js` i poziva je u `wireAudioResume()` na oba događaja `pointerdown` i `keydown` sa `{ once: true }` opcijom — race condition je eliminisan.

---

### M1 — Menu nema pravila

**VERIFIED ✓**

`renderMenu()` u `src/ui.js` ima `<p class="menu-rules">` sa tri rečenice koje opisuju mehaniku klizača, merača i 10-sekundnog win uslova.

---

### M2 — Bass Ratio nema opis

**VERIFIED ✓**

`renderStandardHUD()` u `src/ui.js` sadrži `<small class="slider-hint">Bass: 0% = sve treble | 50% = balanced | 100% = distorzija</small>` neposredno ispod bass slider reda. Dual HUD nema bass slider, pa je izostavljanje tamo ispravno.

---

### M3 — Win condition "10 sekundi" nije bio prikazan

**VERIFIED ✓**

`renderStandardHUD()` čita `hint.win_condition` iz `HINTS[level.hint_key]` i renderuje `<div class="hud-win-condition">${win_condition}</div>` uslovnim blokom iznad merača. Ako string nije definisan, div se ne prikazuje (nema praznog elementa).

---

### M4 — Score breakdown na win screenu

**VERIFIED ✓**

`renderWinScreen()` u `src/ui.js` izračunava `time_bonus` i `margin_bonus` lokalnom formulom i prikazuje:
```html
<div class="result-score-breakdown">
  <span>Vreme: ${time_bonus} pts</span>
  <span>Margina: ${margin_bonus} pts</span>
</div>
```
Odvaja ukupni skor od komponenti, što je tražena UX promena.

---

### M5 — grace_ms nije bio implementiran u sim.js

**VERIFIED ✓**

`tickSim()` u `src/systems/sim.js` — fail_crowd kondizija glasi:
```javascript
now - state.fail_crowd_start >= FAIL_CROWD_DURATION_MS &&
elapsed > (level.grace_ms || 0)
```
Tačno ta kondizija iz fix_log-a. `|| 0` fallback osigurava da nivoi bez `grace_ms` rade identično kao ranije.

---

## Novi CRITICAL bugovi

Nema novih CRITICAL.

---

## Finalna preporuka

**SPREMAN ZA ŠEF SIGN-OFF**

Sva 7 prijavljena buga iz prvog beta kruga su verifikovano ispravljena. Igra nema novih CRITICAL problema. Jedina otvorena stavka (`#ff3030` vs `var(--accent-red)` nedoslednost u `updateMeters()`) je kozmetička i ne utiče na gameplay — može u backlog.
