# Fix Log — Imanje Tycoon (posle beta iter 1)
*Jova jQuery, 2026-07-13*

## MEDIUM (sve ispravljeno)

- **[M1] doInokulacija return mismatch** — `mushrooms.js:92,101`
  `doInokulacija()` je vraćala `true`/`false`; `mushroom-tab.js:273` proverava `result.success`
  što je uvek `undefined` na `true`. Promenjeno: `return false` → `return { success: false }`,
  `return true` → `return { success: true, bonus: GAME_CONFIG.INOKULACIJA_BONUS }`.
  Postojeći `spawnRevenueParticle` feedback sada ispravno izvršava; `result.bonus` prikazuje
  `+10% bonus!` u particle-u.

- **[M2] getBlockRevenueProjection dead import** — `mushrooms.js` (nova funkcija)
  `mushroom-tab.js` importuje `getBlockRevenueProjection` iz `mushrooms.js` ali funkcija
  nije postojala → import bio `undefined`. Dodata `export function getBlockRevenueProjection(state, block)`
  koja računa `Math.round(cyclesPerSeason * kgPerCycle * price * channelMultiplier)`.
  Signature odgovara call site-u u `mushroom-tab.js:171` (`getBlockRevenueProjection(state, block)`).
  Revenue projekcija po bloku sada prikazuje na block kartici.

- **[M3] Stale event listener na mushroom-tab panelu** — `mushroom-tab.js`
  `bindMushroomEvents` dodavala je `panel.addEventListener('click', ...)` pri svakom rebuild-u;
  `initialized = false` na kraju click handlera triggerovao je rebuild svaki tick → listener-i
  su se akumulirali → stacked toast-ovi.
  Fix: dodat `let _mushroomClickCtrl = null` na module nivou. `bindMushroomEvents` pre svakog
  `addEventListener` poziva `_mushroomClickCtrl.abort()` i kreira novi `AbortController`.
  `addEventListener` prima `{ signal: _mushroomClickCtrl.signal }` — stari listener se uklanja
  pre dodavanja novog.

- **[M4] Locked tabovi bez objašnjenja** — `src/ui/tabs.js`, `styles/base.css`
  Klik na locked tab (`greenhouse`/`fishpond`) nije davao feedback — tab se prosto prikazivao
  (panel sadržaj je već imao locked state u `greenhouse-tab.js` i `fishpond-tab.js`).
  Fix u `tabs.js`: click handler proverava `btn.classList.contains('tab-locked')` i prikazuje
  dynamic `showToast('🔒 ' + btn.title)` umesto prelaska na tab.
  Fix u `base.css`: dodane CSS rules `.tab-btn.tab-locked { opacity: 0.4; cursor: not-allowed; }`
  i `.tab-btn.tab-locked:hover { background: none; color: var(--clr-text-muted); }` odmah posle
  `.tab-btn:hover:not(.active)` bloka.

- **[M5] Macro-toggle bez click listenera** — `src/input.js`
  `initInput(gameRef)` samo je postavljao `_gameRef`. Tastatura `m` radila (pozivala
  `toggleMacroPanel` direktno), ali klik na dugme nije imao bindovan handler.
  Fix: u `initInput` dodat `document.getElementById('macro-toggle')` lookup sa `data-input-bound`
  guard-om (sprečava dupliranje pri višestrukim pozivima). Klik poziva isti
  `toggleMacroPanel(_gameRef?.state)` kao i tastatura.

- **[M6] INOKULACIJA_WINDOW_SEC: 10 → 18** — `src/config.js:93`
  10s premalo za mobile tap latenciju. Povećano na 18s — kompromis između dovoljnog
  vremena za tap i zadržane urgentnosti.

## LOW (ispravljeno)

- **[L1] Typo u phases.js:128** — `'dostiuguta'` → `'dostiguta'`
  String `'Maksimalna faza dostiuguta!'` u `getPhaseProgress` return-u.

- **[L2] Phantom sezona pri seasonTimer=0** — `src/state.js:164`
  U `applyOfflineProgress` while petlji: ako `state.seasonTimer` uđe u petlju sa vrednosti `0`,
  `thisSeason = Math.min(timeLeft, 0) = 0`, `state.seasonTimer -= 0` ostaje `0`, uslov
  `if (state.seasonTimer <= 0)` je tačan → `state.season++` bez ikakve provedene sekunde
  (phantom sezona). Fix: dodata guard provera na početku while tela — ako `state.seasonTimer <= 0`,
  resetuje se na `dur` pre `Math.min(...)` kalkulacije.

- **[L3] clearEvent async fix** — `src/systems/seasons.js:266`
  `setTimeout(() => clearEvent(state), 200)` u `inspekcija` case-u mutirao je state asinkrono.
  Zamenjen direktnim pozivom `clearEvent(state)` — ako je animacija potrebna, delay treba
  primeniti samo na UI, ne na state mutation.

## Nije dirano

- `src/economy/market.js` — tržišna ekonomija
- `src/economy/greenhouse.js` — plastenik ekonomija
- `src/economy/fishpond.js` — jezero ekonomija
- `src/systems/progression.js`, `prestige.js` — prestige loop
- `src/systems/seasons.js` (osim `clearEvent` fix na l.266)
- `src/render.js`, `src/audio.js`, `src/share.js`
- `src/ui/hud.js`, `src/ui/macro-panel.js`, `src/ui/upgrades-panel.js`
- `src/ui/greenhouse-tab.js`, `src/ui/fishpond-tab.js` (locked state već implementiran)
- `styles/ui.css`, `styles/game.css`, `styles/theme.css`
- `index.html`, `src/main.js`, `src/content/`
