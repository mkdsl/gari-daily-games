# Fix Log — Tiha Avala

## C1: Komšija merač boja (CRITICAL)
- ui.js updateMeters() — treća grana ternary: 'accent-red' → 'accent-green' (i u dual i u single grani)

## C2: iOS AudioContext race condition (CRITICAL)
- audio.js: dodata unlockAudioOnGesture() funkcija — kreira AudioContext pri prvom gesture-u ako ne postoji, odmah resume-uje
- input.js: first gesture sada kreira i unlock-uje AudioContext (wireAudioResume poziva unlockAudioOnGesture umesto resumeAudio)

## M1: Menu screen pravila
- Dodat opis igre ispod dugmeta IGRAJ kao `<p class="menu-rules">` (3 rečenice: klizači, merači, 10s pravilo)

## M2: Bass Ratio semantički opis
- Dodat sub-label kao `<small class="slider-hint">`: "Bass: 0% = sve treble | 50% = balanced | 100% = distorzija"

## M3: Win condition vidljiv pre testa
- hints.js nivo 1 (level1): dodat win_condition string
- HUD prikazuje win_condition poruku iznad merača ako je definisana u hints za taj nivo

## M4: Score breakdown na win screenu
- Win screen prikazuje SCORE: [total] + odvojene retke za Vreme: [time_bonus] pts i Margina: [margin_bonus] pts
- time_bonus i margin_bonus izračunati lokalno istom formulom kao calcScore() u score.js

## M5: grace_ms implementiran u sim.js
- FAIL_CROWD check ne aktivira se dok elapsed < level.grace_ms
- Kondizija: `now - fail_crowd_start >= FAIL_CROWD_DURATION_MS && elapsed > (level.grace_ms || 0)`
