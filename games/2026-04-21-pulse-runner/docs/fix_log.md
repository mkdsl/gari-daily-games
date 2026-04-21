# Fix Log — Pulse Runner

## Ispravke posle beta testa

### Fix 1: ctx.scale akumulacija (main.js)
- Problem: `ctx.scale(dpr, dpr)` se akumulira na svakom resize eventu
- Fix: zamenjeno sa `ctx.setTransform(dpr, 0, 0, dpr, 0, 0)`

### Fix 2: Race condition u _onMiss (pulse.js)
- Problem: endRun može biti pozvan u istom pulsu kad nextLevel
- Fix: dodat guard `if (state.screen !== 'playing') return;` na početak _onMiss

### Fix 3: Input window vizuelna indikacija (render.js)
- Problem: igrač nije imao vizuelni signal kad sme da pritisne dirku
- Fix: dodat crveni border oko canvas-a tokom input window-a

## Ignorisano (nice to have)
- DOM caching u ui.js — funkcionalno, nije blocker
- Progresivna promena boje pozadine — sutra je nov dan
