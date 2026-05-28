# Fix Log — DJ Akademija
**Pošto:** Beta Trio iter 1 (score 6.5/10)  
**Datum:** 2026-05-28

## Izmene

1. **`src/config.js`** — `FEEDBACK_TRANSITION_MS`: 1500 → 2500  
   *Fact tekst nije bio čitljiv za 1.5s na prosečnom čitacu.*

2. **`src/share.js`** — share string sada uključuje `(score/10)` za sve tier-ove  
   *Numerički score daje takmičarsku dimenziju za prijatelje.*

3. **`src/ui.js`** — jackpot CTA sada sadrži `@kluboslavija` handle  
   *10/10 igrač sada zna tačno gde da pošalje screenshot.*

4. **`src/main.js`** + **`styles/game.css`** — timer urgency ispod 30%  
   *Timer fill postaje solid crvena ispod 6 sekundi preostalih.*

## Nije fiksirano (LOW / v2)
- `QUESTIONS_COUNT` hardcoded — relevantno samo pri menjanju banke pitanja
- `.intro-spacer` fragilnost na landscape < 500px
- Timer "1s" display lag (kosmetski)
- cursor: not-allowed na disabled dugmadima
