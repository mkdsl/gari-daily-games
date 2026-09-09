# Beta Report — Put do Guncata (iter 1)
**Datum:** 2026-09-09
**Testers:** Beta Trio (Zora UX + Raša tech + Lela engagement)
**Manifest stage:** impl → polish
**play_url:** https://mkdsl.github.io/gari-daily-games/games/2026-09-07-put-do-guncata/

---

## Ocena

| | Ocena | Beleška |
|---|---|---|
| **Zora (UX)** | 5.5/10 | Dobar first-impression, ali igra završava u dead-end-u |
| **Raša (tech)** | 5.5/10 | Solidna modularna arhitektura, ali CRITICAL restart bug |
| **Lela (engagement)** | 6.0/10 | Jak journey koncept, ali replay hook je slomljen |
| **UKUPNO** | **5.8/10** | **CRITICAL blocker sprečava release** |

---

## CRITICAL bugovi (release blokeri)

### CRITICAL-1 — Igra se ne može restartovati bez refresha stranice

**Fajlovi:** `src/entities/scenes/etapa5-dolazak.js:58–61` + `src/main.js:31–43`

**Problem:** `etapa5-dolazak.js` destruktuira `callbacks` i očekuje `onPlayAgain`:

```js
const {
  onShareRequested,
  onPlayAgain = () => {},   // <-- default no-op
  onGuncatiGrand
} = callbacks;
```

Ali router (`main.js`) registruje scenu 5 i prosleđuje callbacks:

```js
scene.mount(_container, state, {
  next: nextStage,
  onEnd: () => _onGameEndCb?.()
})
```

Callbacks ne sadrže `onPlayAgain` — pa destrukturacija uzima default `() => {}`. Kada
igrač klikne "Odigraj ponovo" na end-screen-u, poziva se no-op. Igra ostaje zagljavljena
na end-screen-u. Nije moguće startovati novi run bez ručnog refresha stranice.

**Impact:** Igra je faktički single-play. Za brand asset koji treba da se deli i igra više
puta — ovo je release blocker kategorija A.

**Fix:** U `src/main.js`, wrapper za scenu 5 treba da prosledi `onPlayAgain`:
```js
mod.mount(container, st, {
  ...cbs,
  onPlayAgain: cbs.onEnd || cbs.next
});
```
ILI u `etapa5-dolazak.js` promeniti default:
```js
const onPlayAgain = callbacks.onPlayAgain || callbacks.onEnd || callbacks.next || (() => {});
```

---

## MEDIUM bugovi (oštećuju first-impression)

### MEDIUM-1 — `src/ui.js` (globalni HUD) nikad nije montiran

**Fajl:** `src/main.js` (nedostaje import)

**Problem:** `src/ui.js` (242 linije) je u manifestu opisan kao "HUD (pripremljenost meter,
etapa progress indikator, gorivo-bar/mood signali)" — ali `main.js` ga nikad ne importuje
ni poziva. `#hud` element u `index.html` ostaje prazan za celo vreme igre. Igrač nema
persistentni globalni prikaz pripremljenosti između etapa — svaka scena prikazuje lokalni
broj ali on nestaje pri prelasku na sledeću etapu.

**Zora primećuje:** Na prelasku Etapa 1→2, score koji smo "zaradili" nestaje iz vidokruga
na ~0.5 sekundi dok se nova scena mountuje. Kod narrative igre koja gradi tenziju ka
završetku, to narušava osećaj kontinuiteta.

**Fix:** U `main.js`, dodati import i inicijalizaciju globalnog HUD-a nakon `routerInit()`.

---

### MEDIUM-2 — Fali `og.png` (broken OG image za share)

**Fajl:** `index.html:9`

**Problem:**
```html
<meta property="og:image" content="...2026-09-07-put-do-guncata/og.png">
```
Fajl `og.png` ne postoji — igra koristi sve CSS/Canvas/Web Audio generisane assete bez
statičkih fajlova. Svaki share (WhatsApp, Telegram, FB) imaće blank preview. Za brand
asset koji treba da pokrene Guncati turneja awareness, broken OG image pri prvom
sharingu je neželjeni utisak.

**Fix:** Generisati ili hand-craftovati `og.png` (1200×630) — minimalno screenshot
lake scene + logo. Alternativno, ukloniti `og:image` tag dok asset ne bude spreman.

---

### MEDIUM-3 — Etapa 2 score display vara igrača tokom event-a

**Fajl:** `src/entities/scenes/etapa2-autoput.js:97–102`

**Problem:**
```js
onEventResult: (correct, delta) => {
  scoreEl.textContent = state.pripremljenost;  // pripremljenost se NIJE promenila
  _floatDelta(container, delta);               // ovo je OK — feedback float
},
```
Delta float (npr. "+3") animira se pravilno, ali pripremljenost broj ne menja se
odmah — ona se menja tek na kraju etape. Igrač vidi "+3" kako leti, a isti broj
kao pre. Zbunjujuće: "Reagovao sam dobro, zašto se broj nije promenio?"

**Fix:** `applyDelta` se ne sme zvati između etapa (to bi slomilo score sistem), ali
UI treba da jasno komuniciše da je delta "obećana za kraj etape" — npr. floating delta
u drugoj boji ili tooltip "biće uračunato na kraju".

---

### MEDIUM-4 — Prestige threshold je trivijalan (1 run = night mode)

**Fajl:** `src/config.js:73–75`

**Problem:**
```js
export const PRESTIGE = {
  RUNS_REQUIRED: 1,
};
```
Night mode se otključava nakon PRVOG završenog run-a. Svaki igrač koji dođe do
kraja (pa makar bio zagljavljen na end-screen-u zbog CRITICAL-1) odmah vidi
toggle na meniju. Nema misterije ni replay hook-a — noćna vožnja nije nešto što
se "zasluži", ona je default za svako vračanje.

**Lela primećuje:** Za journey igru čiji je srž "drugi put je drugačiji", ovo je
promašena prilika. Preporučujem RUNS_REQUIRED: 3 minimum, ili unlock samo za
green bucket (pripremljenost ≥ 70).

---

## LOW bugovi / nit

### LOW-1 — `branching.js` modul-level state ne resetuje se između runova

**Fajl:** `src/systems/branching.js:6–9`

**Problem:** `_selected` i `_history` su deklarisani na modul nivou i akumuliraju
se kroz sve runove iste sesije. `resetBranching()` je eksportovan ali ga niko
ne poziva. Nije gameplay-breaking (etapa4 čita `state.route` iz state.js koji
se pravilno resetuje), ali `_history` polako raste u memoriji kod dugih sesija.

**Fix:** Pozvati `resetBranching()` iz `initState()` u `state.js`, ili iz `main.js`
na startu svakog runa.

---

### LOW-2 — `attachTo` je importovan ali nekorišćen u `main.js`

**Fajl:** `src/main.js:6`

```js
import { attachTo } from './input.js';
```

`attachTo` se ne poziva nigde u `main.js` — router.js to radi interno. Dead import.

---

### LOW-3 — Etapa 3 ne daje feedback da Δ3=0 (izbor nema trenutni score uticaj)

**Fajl:** `src/systems/pripremljenost.js:78–86`

Igrač bira rutu (Brže/Slikovitije/Sigurnije) i nema score promene. Za "Slikovitije"
postoji Brana popup — dobro! Ali za "Brže" i "Sigurnije" — direktno sledeća etapa,
bez feedback-a. Igrač koji ne poznaje GDD može pomisliti da je nešto puklo.

**Fix:** Kratki toast/overlay za sve tri rute: npr. "Brza ruta — vidi se u šumskom putu"
koji se zatvori za 1.5s pre prelaska na etapa4.

---

### LOW-4 — `detachFrom` u `input.js` je exportovan ali ga niko ne zove

**Fajl:** `src/input.js:43–48`

Ista function referenca sprečava dupliranje DOM listenera (browser deduplication),
pa nema runtime bug-a, ali API je nekompletan — `attachTo` bez para `detachFrom`
je code smell koji može iznenaditi sledećeg developera.

---

## Raša: Pozitivne tehničke napomene

Ono što radi dobro:
- **Import chain je čist.** Sve `src/ui/end-screen.js`, `src/content/branching-tree.js`,
  `src/audio.js` exports su na mestu. Nema slomljenih import putanja.
- **localStorage u try/catch** na svakom read/write — iOS Safari private mode
  handled correctly.
- **Pointer Events API** (ne Touch Events) — cross-browser, future-proof.
- **`clearAll()` + ista function referenca** u `input.js` sprečava listener
  akumulaciju između stage tranzicija (browser deduplicates same function reference
  + same options).
- **`etapa5` timer leak minimizovan** — `mounted = false` flag ispravno čuva sve
  `setTimeout` callback-e od efekta ako scena nestane pre nego što fired.
- **CSS variables** (`--color-text-primary`, `--color-text-muted`) su definisane u
  `theme.css` — `etapa5` inline styles neće biti invisible.
- **Audio.js** — `playAmbient` i `playEffect` exports su pravilno implementirani,
  Web Audio API bez .mp3 fajlova.

---

## Zora: UX first-impression protokol (prvih 5 minuta)

**00:00 — Loading:**
"Učitavam put..." loading screen — adekvatno. Nestaje brzo, fluid.

**00:05 — Menu:**
"Kreni 🚗" dugme je jasno, font size dobar na mobilnom. "Guncati × Kluboslavija"
brand signature je prisudan. Nema ekrana sa uputstvima — to je OK za narrative igru,
ali korisnici koji ne znaju šta je "radial meter" u etapi 1 mogu biti zbunjeni.

**00:15 — Etapa 1:**
Hint "Tapni unutar žute zone!" je prisutan — dobro. Radial SVG meter je vizuelno
čist. Feedback na tap (zeleno/crveno glow) je trenutan i jasan. Timer countdown radi.
Etapa 1 prolazi prvi test.

**00:75 — Etapa 2:**
Tri mood dugmadi su labovani ali nije jasno da njihovo korišćenje daje bonus. Fuel
bar je vertikalan i mali (22px wide) — na mobilnom teže za čitanje. Clock countdown
OK. Driving road animacija daje osećaj kretanja — pozitivno.

**03:30 — Etapa 3:**
Tri table su jasne, Brana citat je tematski prisadan. Tilt animacija na izbor je
dobar tactile feedback. "Slikovitije" ruta ima Brana popup — dobar bonus. Ostale
rute odmah prelaze na etapu 4 bez feedback-a (LOW-3).

**05:00 — Etapa 4:**
Prepreke animiraju s desna. Emoji prepreke su čitljive. Screen shake na hit radi.
"(pejzaž)" za distractor je dovoljno jasno. Traka napretka radi.

**07:00 — Etapa 5 → End Screen:**
Narativna sekvenca je atmosferska i autentična. Epilog tekst (3 varijante po bucketu)
je pažljivo napisan. Score count-up animacija je satisfying.
Ali: "Odigraj ponovo" klik → NIŠTA SE NE DEŠAVA. Dead end.
Ovo je Zora's biggest fail point.

---

## Lela: Engagement i emocionalna kriva

**Šta radi za engagement:**
- Journey metafora (Beograd → Guncati) je jaka i specifična — Srbija audience
  će prepoznati E75 referencu, "pogrešan izlaz" je authentic.
- Svaka etapa je mehanički drugačija — timing puzzle → resource balance →
  choice → dodge → narrative. Variety drži pažnju.
- Brana karakter je brand gold — percistentni NPC koji prati celo putovanje,
  čak i u Etapi 3. Ovo je retka stvar u GDG igrama.
- Narativni epilog sa 3 varijante je zadovoljavajuć "šta sam zaradio" moment.
- Pera Period aforizmi na radiju su autentični i share-worthy ("Farovi su svedoci").

**Šta kida engagement:**
- CRITICAL-1: dead-end restart ubija sve replay inerciju. Igrač koji želi odmah
  da proba "brzu rutu" umesto "slikovitije" mora refreshovati stranicu.
- Prestige threshold 1 znači da night mode nije nagrada — to je bug fix.
- Nema sharing hook koji zapravo funkcioniše (OG image broken + restart broken
  znači da share card ne može biti testirano ni u praksi).

**"Još jedan run" faktor:** 4/10 bez fixa, potencijalno 7.5/10 sa fixom CRITICAL-1.

---

## Zaključak

"Put do Guncata" ima solidne temelje — arhitektura je čista, journey koncept je
tematski autentičan za brand, mehanička raznovrsnost je tu. Kod je pisan pažljivo
(try/catch na svim kritičnim mestima, live ES6 bindings korišćeni pravilno, nema
slomljenih import putanja).

Jedan CRITICAL bug (CRITICAL-1) blokira release: igra ne može da se restartuje.
Za brand asset koji treba da se deli na Guncati turneji, ovo je neoprostivo.

**Gate za KORAK 6:** Fix CRITICAL-1 obavezan pre iter 2. MEDIUM-1 (HUD) i
MEDIUM-2 (OG image) preporučeni u istom batchu. MEDIUM-3 i MEDIUM-4 u istom
fix ciklusu ako vreme dozvoli.
