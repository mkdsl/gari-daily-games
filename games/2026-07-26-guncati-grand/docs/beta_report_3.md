# Beta Report — Guncati Grand (Iter 3 — Verifikacija post-iter-2 fixeva)
**Datum:** 2026-07-31
**Beta score iter 3:** 7.5/10

---

## Verifikacija post-iter-2 fixeva

### CRITICAL #3 — gcBalance se nikad ne puni

[FIX VERIFIED]

`src/systems/progression.js`, linija 76, unutar `setState()` poziva u `advanceWeek()`:

```js
gcBalance: CONFIG.WEEKLY_BUDGET + weekRevenue,
```

Svake nedelje `gcBalance` se ispravno resetuje na fiksni budžet + prihod te nedelje. Igrač više ne ostaje na 0 GC od nedelje 2. Makro layer je otvoren.

### MEDIUM #2 — Budget panel prikazuje hardkodovanih "500 GC"

[FIX VERIFIED]

**Fix A** — `src/ui/macro_ui.js`, linija 77 (initial render):
```html
<span class="budget-total" id="budget-display">${formatGC(state.gcBalance)} GC</span>
```
Dinamički, ne više statički string.

**Fix B** — `src/ui/macro_ui.js`, linije 285–286 (`updateMacroTotals()`):
```js
const budgetEl = container.querySelector('#budget-display');
if (budgetEl) budgetEl.textContent = formatGC(state.gcBalance) + ' GC';
```
Budget display se osvežava na svakom slider event-u. Oba puta verifikovano.

---

## Novi bugovi pronađeni u iter 3

### CRITICAL #4 — Finale revenue se dvaput uračunava u final score

**Fajlovi:** `src/systems/finale.js` (linije 241–244) + `src/systems/scoring.js` (linija 19) + `src/ui/ui.js` (linije 231–235)

**Problem:** `endFinale()` dodaje `finaleRevenue` (floored float) u `state.totalRevenue` pre nego što poziva `_onFinaleEnd` callback:

```js
// finale.js, endFinale()
const finaleRevenue = Math.floor(fin.revenue);
setState({
  finale: { ...fin, active: false },
  totalRevenue: (state.totalRevenue || 0) + finaleRevenue,  // <-- dodato ovde
  screen: 'SCORE'
});
// ...
if (_onFinaleEnd) _onFinaleEnd({ revenue: finaleRevenue, ... });
```

Zatim, `_onFinaleEnd` u `ui.js` poziva `getState()` (dobija stanje SA već uvećanim `totalRevenue`) i odmah prosleđuje `calcFinalScore`:

```js
// ui.js, onFinaleEnd callback
const state = getState();  // state.totalRevenue VEC sadrži finaleRevenue
const breakdown = calcFinalScore(state);
```

A `calcFinalScore` PONOVO dodaje `finale.revenue`:

```js
// scoring.js, linija 19
const totalRev = (totalRevenue || 0) + (finale?.revenue || 0);
//               ^^^^^^^^^^^^^^^^^^^^   ^^^^^^^^^^^^^^^^^^^^
//               includes finaleRevenue  + same amount again
```

`state.finale.revenue` nikada nije resetovano na 0 u `setState` unutar `endFinale()` — ostaje kao float od pre `Math.floor`.

**Efekat:** Finale prihod se dvaput uračunava u `revenueScore`. Npr. za finale sa 8000 GC prihoda: `totalRev = (weeklyRevenue + 8000) + 8000` umesto `weeklyRevenue + 8000`. Za igre gde je `revenueScore` blizu 1.0×, duplikacija može gurnuti score na cap 1.5× i veštački povećati finalni score za 0.3–0.8 poena. Share card prikazuje netačan rezultat — direktno oštećuje brand narrative "Guncati Grand skor".

**Failure scenario:** Igrač odigra mediokritetnu sezonu (revenueScore ~0.6), ali finale prihod duplikuje revenueScore na ~1.2 → final score raste sa npr. 5.8 na 7.1 → nepravedni "Lepo, ali..." umesto "Teren vraća poruku". Igrač deli lažni skor.

**Fix:** Jedno od tri rešenja:
- Opcija A (preporučeno): `calcFinalScore` treba da koristi SAMO `state.totalRevenue` (bez `+ finale?.revenue`) jer `endFinale()` već dodaje finale prihod tu.
- Opcija B: U `endFinale()` ne dodavati `finaleRevenue` u `totalRevenue` — neka `calcFinalScore` sam sabere.
- Opcija C: U `setState` unutar `endFinale()` resetovati `finale.revenue` na 0 posle dodavanja u totalRevenue.

---

### MEDIUM #3 — "Nova Sezona" iz menija ne resetuje aktivni save

**Fajl:** `src/ui/ui.js`, linije 120–122

**Problem:** Dugme "Nova Sezona" u MENU screenu poziva samo `navigateTo('MACRO')` bez ikakvog čišćenja stanja:

```js
container.querySelector('#btn-new')?.addEventListener('click', () => {
  navigateTo('MACRO');  // bez clearSave() ili createInitialState()
});
```

Ako igrač ima aktivni save (npr. Nedelja 6, određene zgrade i volonteri), pa napusti igru na pola i klikne "Nova Sezona" pri sledećem otvaranju — učitava se staro stanje i odlazi u MACRO sa Nedeljom 6. Igra ne počinje iznova.

Pravi new-game flow radi ispravno SAMO iz SCORE screena (`score_ui.js` poziva `clearSave()` pre callback-a). Mid-game restart je nemoguć iz menija.

**Failure scenario:** Igrač želi da restartuje jer mu ide loše u Nedelji 5. Klikne "Nova Sezona" — vraća ga u MACRO Nedelje 5 sa starim stanjem. Zbunjen, misli da je igra bugovana.

**Fix:** U `btn-new` click handleru pozvati `clearSave()` i reinicijalizovati state pre `navigateTo('MACRO')`, ili prikazati confirm dialog kada save postoji.

---

## Preostali LOW (zadržano iz iter 2, nije novo)

- `modals.js:31` — inline `onclick="closeModalGlobal()"` (nije CSP-kompatibilno)
- `main.js` — dead if/else grane u `hasSave` bloku
- `ui.js` + `progression.js` — dupli poziv `checkVolunteerUnlocks`
- Week 2 onboarding tekst "Ana se priključuje!" pogrešan (Ana već prisutna)
- DJ Transition dugme ostaje enabled posle smene (`finale_ui.js` linija 237 — `finaleState.totalSlots` je undefined u partial-object pozivu → `btn.disabled = false`)
- `applyAllocationEffects()` direktna mutacija state objekta
- Finale grid 3-kolone na 500–900px ekranima

---

## Ugao Zore (UX / First-impression)

Prvih 5 minuta (MENU → MACRO Nedelja 1 → MICRO → Week Result) prolazi glatko. Budget panel je uredan, slajderi reaguju, GC counter se ispravno ažurira — MEDIUM #2 fix je vidljivo uspeo. Onboarding poruke u Nedelji 1 i 2 se prikazuju u pravo vreme.

Ono što me zbunjuje kao prvog korisnika: klik "Nova Sezona" kada postoji save ne daje nikakvu povratnu informaciju da se nešto resetuje (jer se ništa ni ne resetuje). Nema ni confirm dialog-a ni vizuelnog znaka novog starta. Ovo je MEDIUM #3 — od strane šefa, nije ovo nešto što bi ciljni Guncati korisnik nužno naišao (verovatno igra jednu sezonu do kraja), ali je UX propust.

Finale ekran (15-minutni real-time sim) vizuelno je ubedljiv — Crowd Mood meter, DJ Hype bar i Revenue ticker dobro komuniciraju stanje. Ali igrač nikada neće znati da je njegov skor lažiran (CRITICAL #4).

---

## Ugao Raše (Tech / Robustnost)

Verifikacija fixeva je čvrsta. `progression.js` advanceWeek() je sada ispravan — setState šalje pravi gcBalance sa svakim krajem nedelje, a allocation se deductuje u `applyAndContinue()`. Nema duplog punjenja.

Najveći nalaz ove iteracije je CRITICAL #4 — nije u gameplay logici već u pipeline između `endFinale()` → `onFinaleEnd` callback → `calcFinalScore()`. Specifično:
- `endFinale()` bavi se "čuvanjem" finale prihoda u totalRevenue
- `calcFinalScore()` zna za finale prihod kroz `finale.revenue` field
- Niko od ta dva nije "vlasnk" podatka — oba ga uzimaju

Ovo je klasičan double-write / double-read bug između dva modula bez jasnog dogovora ko je authority za revenue aggregation. Nije teško fiksovati — jedna linija izmene.

Ostale tehničke rizike (DJ transition partial-object call, applyAllocationEffects mutacija) procenjujem kao LOW — ne blokiraju gameplay, samo su loša praksa.

Finale RAF (requestAnimationFrame) loop je ispravno implementiran — pauseFinale/resumeFinale handleri postoje za mobile focus loss, _rafId se canceluje u endFinale(). Nema memory leak rizika.

---

## Ugao Lele (Engagement / Retention)

"Još jedan krug" faktor je prisutan: prestige sistem (Stara Šaraga mode) je implementiran, achievements su definisani (9 tipova), score tiers (fail/decent/legend) daju cilj za retry. Tom Sawyer mehanika (WB threshold 60%) je jedinstven hook koji vas tera da ulažete u zajednicu, ne samo u prihod.

Konkretno u ovoj iteraciji: finale ekran sa real-time decision kartama daje adrenalinski finish koji opravdava 10 nedelja priprema. DJ Hype ramp od +3%/min je palpabilan — vidite razliku između dobre i loše tranzicije.

Međutim, CRITICAL #4 ozbiljno narušava retention loop: ako igrač vidi 8.5/10 kad je zaista napravio 7.0/10 run, sledeći pokušaj neće imati pravi reference point za poboljšanje. "Koji je moj pravi skor?" postaje pitanje bez odgovora. Share card sa lažnim skorom je posebno loš za Guncati brand (igrači dele pogrešne rezultate pred Grand Finale event u junu).

---

## Finalni zaključak

**NEEDS ANOTHER FIX ROUND**

Post-iter-2 fixevi (CRITICAL #3 i MEDIUM #2) su verifikovani i drže. Makro layer sada funkcioniše end-to-end.

Međutim, iter 3 otkriva jedan novi **CRITICAL #4** (revenue double-counting u final score calculation) koji direktno oštećuje integritet score sistema — core deliverable igre za brand. Skor se ne može smatrati tačnim dok ovaj bug postoji.

Preporučeni fix scope za Jovu (sledeći pass):
1. **CRITICAL #4** — `scoring.js` linija 19: ukloniti `+ (finale?.revenue || 0)` OR `finale.js` linija 244: ne dodavati finaleRevenue u `totalRevenue` u `setState` (let calcFinalScore be the single authority)
2. **MEDIUM #3** — `ui.js` linija 120: dodati `clearSave()` + `createInitialState()` pre `navigateTo('MACRO')` u btn-new handleru (sa confirm dialog ako save postoji)

Posle ova dva fixa: 0 CRITICAL, 0 MEDIUM — igra ispunjava AUTO-RELEASE kriterijume (beta_score_iter2 = 8.5 >= 8.0). Preporuka: **šef sign-off nije potreban** (KORAK 6.75 kriterijumi) — Gari može da pusti direktno na KORAK 7 posle fix verifikacije.

**Razlozi za skor 7.5/10:**
- Od 8.5 oduzeto za 1 novi CRITICAL (+0.0 za verifikovane fixeve od 8.5, -1.0 penalty za novu CRITICAL, +0 za novu MEDIUM jer je graničan scenarij)
- Core gameplay loop (macro → micro → week result → finale) je solidan i meritable
- Finale real-time sim je vizuelno ubedljiv i engagement-rich
- Score penalty reflektuje da je krajnji output igre (score card) kompromitovan
