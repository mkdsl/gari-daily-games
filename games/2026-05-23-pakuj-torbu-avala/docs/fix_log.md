# Fix Log — Pakuj Torbu: Avala Edition

---

## v1.0 — Initial release (2026-05-23)

**Implementirano:**
- Kompletna igra sa 5 nivoa, 12 predmeta, canvas grid renderer
- Click-to-select + click-to-place mehanika
- Ghost preview (zeleno/crveno) za placement feedback
- Rotation system (90° clockwise, taster R + dugme)
- Particle system na uspesnom smeštanju
- Web Audio synth (thud, buzz, win, levelup, tick, rotate, select)
- Daily highscore localStorage (top 5)
- Level progression (5 nivoa, rastuce tezkoce)
- Game over screen sa grade, packed/missed summary, CTA
- Web Share API + clipboard fallback
- Mobile touch support (touchstart/touchmove/touchend)
- Responsive canvas resize on window.resize
- Level complete screen sa breakdown
- CSS animacije (shake, particle-fly, pulse-red, score-pop)

**Poznati problemi (za v1.1):**
- Cell size je fiksiran (52px) — treba dinamično skaliranje za manje ekrane
- Score pop animacija je implementirana u ui.js ali nije wiredovana u main.js
- Panel width na 360px telefonu može biti preuzak

---

## v1.1 (planiran)
- Dinamično skaliranje cell size-a na osnovu dostupnog prostora
- Wire score-pop animaciju
- Povećati touch target na CTA dugmetu
- Dodati vizuelnu celebraciju kad su svi required items spakovani
- First-run hint overlay (3s tutorial za mobilne)
