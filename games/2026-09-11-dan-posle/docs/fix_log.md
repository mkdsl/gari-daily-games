# Fix Log — Dan Posle (KORAK 6)
**Datum:** 2026-09-13

## CRITICAL (1)
- **main.js**: Mute handler — dodato `state &&` guard pre `startAmbient()` da spreči null crash na intro screenu.

## MEDIUM (4)
- **render.js**: Badge DOM redosled — badge se sada appenda POSLE time i title (hijerarhija ispravna na mobilnom).
- **decision_engine.js**: Energija=0 edge case — ako nijedna opcija ne pomaže energiji (bestE<=0), sve opcije ostaju enabled i nijedna nije "(automatski)".
- **state.js**: loadState validacija — dodato `currentHourIndex >= HOURS.length` check za corrupted localStorage.
- **index.html**: CS UX — zamenjeno "= Veze + Sećanja − Nered/2" sa "viši = bolje · raste odlukama" (kontekstualno, ne tehnička formula).

## LOW (zaostavljeno za patch_queue)
- Dead import `renderHUD` u main.js
- Dead `partitionNodes()` u decision_engine.js
- Resource bar fill bez `Math.min(100, ...)` clamp-a
- Prestige run onboarding tekst
