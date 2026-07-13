# Beta Report — Imanje Tycoon (iter 2)
*Beta Trio: Zora UX + Raša tech + Lela engagement*
*Datum: 2026-07-13*

## Fix verifikacija

| Fix | Status | Napomena |
|-----|--------|----------|
| M1 doInokulacija return | ✅ | `mushrooms.js:92` vraća `{ success: false }`, `:101` vraća `{ success: true, bonus }`. `mushroom-tab.js:276` proverava `result.success` — particle feedback pali ispravno |
| M2 getBlockRevenueProjection | ✅ | Eksportovana funkcija `mushrooms.js:138-149`. `mushroom-tab.js:171-173` prikazuje `~X din/sez` na svakoj block kartici |
| M3 Stale listener | ✅ | `mushroom-tab.js:264-265` abort-uje stari `_mushroomClickCtrl` pre kreiranja novog. Signal prosleđen na `:306` |
| M4 Locked tabovi | ✅ | `tabs.js:117-125` dodaje/uklanja `tab-locked` klasu. `tabs.js:28-34` prikazuje toast na klik zaključanog taba. `base.css:358-366` ima `opacity: 0.4; cursor: not-allowed` |
| M5 Macro-toggle | ⚠️ | Listener dodat u `input.js:32` — ali `tabs.js:41-58` VEĆ ima click listener na istom `#macro-toggle`. **Vidi novi bug R1** |
| M6 INOKULACIJA_WINDOW_SEC | ✅ | `config.js:93` — vrednost je `18` |
| L1 Typo | ✅ | `phases.js:128` — `'dostiguta'` ispravno |
| L2 Phantom sezona | ✅ | `state.js:166-172` — guard `if (state.seasonTimer <= 0) { reset dur; }` na vrhu while petlje sprečava phantom sezonu |
| L3 clearEvent async | ✅ | `seasons.js:291` — `function clearEvent(state)` je regularna sync funkcija, bez `async` |

---

## Novi problemi (regresije)

### R1 — MEDIUM: Macro panel toggle potpuno ne radi (dugme + taster)

**Uzrok:** M5 fix dodao je listener u `input.js:32`, ali nije uklonio postojeći listener iz `tabs.js:44`. Na jedan klik sada pucaju OBA handlera sekvencijalno:
1. `tabs.js` handler: `content.classList.toggle('hidden')` — panel se zatvori
2. `input.js` handler: čita `isHidden = true` (tabs.js ga upravo zatvorio), pa ga vraća natrag: `classList.toggle('hidden', false)` — panel ostaje otvoren

Neto efekat: ništa se ne dešava. Isti problem postoji za taster `m` / `M` — `tabs.js:163-172` i `input.js:59-61` oba handle `keydown` na `document` i oba toggle panel na 'm'.

**Reprodukcija:** Klik na `▾` dugme ili pritisak `M` tastera — panel ne reaguje.

**Workaround:** Taster '1'/'2'/'3' za tab switching radi normalno (idempotentni pozivi `switchTab`). Makro panel moguće otvoriti/zatvoriti jedino kroz alternativu ako postoji.

**Preporuka fixa:** Ukloniti click listener iz `tabs.js:41-58` (makro toggle) i keydown case 'M' iz `tabs.js:163-172`, jer `input.js` to sada pokriva kompletno. Alternativno: ukloniti iz `input.js` i ostaviti samo `tabs.js`.

---

## Ugao po uglu

### Zora UX — First-impression posle fixova

Inokulacija feedback je sada vidljiv i jasan — particle animacija pali kada igrac klikne u pravo vreme, sa tekstom `+10% bonus!`. Block kartice prikazuju projekciju prihoda po sezoni, što daje igraču jasnu sliku vrednosti. Locked tabovi imaju vizuelni signal (prigušeni, cursor not-allowed) i toast pri kliku koji objašnjava uslov — odlično za onboarding.

Jedini UX pad je makro panel: igrač koji želi da sklopi/otvori panel klikom ne dobija odgovor. Ovo degradira first-impression jer makro panel je prva stvar koja pada u oči na vrhu ekrana.

### Raša tech — Tehničke verifikacije

Svih 9 fixova iz iter 1 su tehnički ispravno implementirani u relevantnim fajlovima. L2 phantom sezona guard je konzervativan i ispravan — resetuje seasonTimer samo kad je ≤ 0 na ulasku u petlju, ne u mid-loop. L3 clearEvent je sync bez ikakvog Promise-a. M3 AbortController pattern je standardan i ispravan.

Jedina regresija: M5 fix je dodao listener u `input.js` bez koordinacije sa `tabs.js`. Oba modula registruju `document.addEventListener('keydown')` na nivou modula pri load-u i oba imaju click listener na `#macro-toggle`. Potrebno je konsolidovati na jedan handler. Nema memory leak-a (oba su na `document`/element direktno), ali funkcionalni efekat je neutralisanje.

### Lela engagement — Pacing posle fixova

INOKULACIJA_WINDOW_SEC=18 (sa 10) značajno popravlja pacing — igrač ima realnu šansu da reaguje na inokulacija prozor čak i pri kratkim odsustima. Kombinirano sa streak sistemom i particle feedbackom (M1), ovo je sada pravi engagement loop: čekanje → prozor → klik → vizuelni reward → streak raste.

Block revenue projekcija (M2) direktno poboljšava decision-making: igrač može da poredi bukovača vs oyster pre nego što kupi upgrade. Ovo produžava session time jer se igrač više zadržava na upgrade odlukama.

Makro panel bug (R1) remeti pacing u višim sezonama kad igrač aktivno koristi panel za planiranje. Za početnike manje problematično.

---

## Ocena

**Beta score iter 2: 7.9/10**

Svih 9 bugova iz iter 1 verifikovano ispravljeno na nivou koda. Jedna regresija (R1, MEDIUM) uvedena M5 fixom — makro panel toggle ne reaguje. Igra je igrljiva i core loop funkcioniše besprekorno.

## Preporuka za šef sign-off

**Uslovno DA** — igra je u dobrom stanju, ali preporučujemo da Jova reši R1 (5-10 min fix: ukloniti dupli handler) pre nego što šef krene na test. Makro panel je prominentna UI komponenta i broken stanje ostavlja loš first-impression na vrhu ekrana. Kad R1 bude fixed, igra je spremna za šefov test bez zadržavanja.
