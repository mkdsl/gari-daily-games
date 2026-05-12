# Tiha Avala — Premortem
**Autor:** Nega Negovanović
**Datum:** 2026-05-12
**Verdict:** DRŽI UZ KOREKCIJE

Koncept je solidan, Avala timing je tačan, brand sprega radi. Tri showstoppera ispod.

---

## CRITICAL — Mora pre implementacije

### 1. Fizika mora biti gameplay-kalibrisana, ne matematički tačna
**Problem:** Inverse square law (`20*log10(d)`) daje minimalne razlike između nivoa. Na 100m = -40 dB, na 200m = -46 dB. Gameplay risk: nivo 1 i 2 osećaju se identično.
**Fix:** Mile definiše playtest konstante za svaki nivo posebno — ne realne vrednosti. Fizika je metafora.

### 2. Real-time slider update je obavezan — ne "testiraj" dugme
**Problem:** Ako igrač ne vidi šta radi slider dok ga pomera, igra postaje blind trial-and-error.
**Fix:** Merači se ažuriraju na svaki input event (<100ms). "TESTIRAJ" dugme pokreće samo animaciju i 10s timer — ne kalkulaciju. Kalkulacija je uvek živa.

### 3. Nivo 5 (Vetar) mora biti predvidiv
**Problem:** Random wind ±4 dB deluje nepravedno — igrač postavi dobru konfiguraciju, vetar puše, fail.
**Fix:** Wind je DETERMINISTIČKI — sinusoidna oscilacija (period 8s, amplitude ±4 dB). Vizualni wind indikator na mapi (listovi, smer). Igrač uči ritam, ne sreću.

---

## MEDIUM — Rešavati u implementaciji

### 4. Speaker Angle vizualizacija je obavezna
Igrači ne znaju šta znači "angle". Prikazati konusni crtež na mapi koji pokazuje pravac zvuka. Slider bez vizualizacije = besmislen.

### 5. Mobile slider touch UX
Tri slidera na malom ekranu — prst sklizne. Minimum: 60px visina, 44px thumb. Custom CSS, ne browser default range input.

---

## Drži (Pozitivno)

- Timing savršen — 39 dana do Avale
- Brand-utility sprega jasna bez eksplicitnog marketinga
- Casual-hard kriva: 1-3 lako, 4-6 teže — nema steep onboarding
- Puzzle se završi (nema beskonačnog idle) — clean session loop
- Vizuelni kontrast paleta je čitljiva (zeleno/crveno/amber)

---

## Verdict

Ne vraćam na Iskru. Ove tri korekcije Mile ugrađuje direktno u GDD, Jova implementira.
