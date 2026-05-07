# Beta Report — Koji Tip Si Ti u MKDSLendu?

## Beta Score: 7.1 / 10.0

---

## Zora (UX):

- [❌] **Progress bar pokazuje pogrešan progres na Q1.** Formula `(qIndex / total) * 100` daje 0% na prvom pitanju (qIndex=0), a GDD §spec kaže Q1=12.5%. Ispravna formula: `((qIndex + 1) / total) * 100`. Q8 ispravno daje 87.5% (qIndex=7), ali Q1 uvek počinje praznom bar-om — loš UX signal na ulasku.
- [⚠️] **Splash CTA funkcioniše, ali nema `aria-label` ni `role` atributa na dugmetu.** Kod koristi `#start-btn` sa `.cta-btn` klasom — vizuelno jasno, ali screen reader korisnici nemaju kontekst. Srednji accessibility propust.
- [✅] **Result screen hijerarhija je korektna.** renderResult() popunjava: name → desc → quote → cta link, što odgovara vizuelnoj hijerarhiji u ui.css (archetype-name → archetype-desc → archetype-quote → cta-link).
- [✅] **Share dugme ima jasnu toast povratnu informaciju.** `showToast('Kopirano! Spremi za FB/IG. 📋')` poziva se i na navigator.clipboard.writeText() uspehu i na fallbackCopy() uspehu. Fallback za stare mobilne je implementiran.
- [⚠️] **`overflow: hidden` na `html, body` uz `overflow-y: auto` na `.screen` je tehnički ispravno, ali krhko na malim ekranima.** `.screen` je `position: fixed; inset: 0; display: flex; align-items: center; justify-content: center`. Na uređajima sa visinom viewporta ispod ~580px, result-card (koji ima 2rem padding + više gap elemenata) može izlaziti iz okvira pre nego što scroll postane aktivan — flex centering gazi overflow. Nije reprodukovano na 360px standard, ali 320px uređaji (stari Android) su rizični.

---

## Raša (tehnički):

- [❌] **Progress bar bug: Q1 prikazuje 0% umesto 12.5%.** U `ui.js`, `renderQuestion()` računa `percent = Math.round((qIndex / total) * 100)`. Poziva se sa `qIndex=0` za prvo pitanje → `0%`. Dugme "1 / 8" je ispravno, ali vizuelna bar je prazna. Fix: promeniti u `Math.round(((qIndex + 1) / total) * 100)`.
- [⚠️] **Tiesbreak logika ima edge case koji ne crashuje, ali daje neočekivane rezultate.** `answersMap` u `calculateResult()` mapira questionId → arhetip koji je bodovan. Tiesbreak proverava samo Q8→Q7→Q6. Ako korisnik konzistentno boduje SG (jedini bodovi dolaze od Q3 i Q6), i dođe do tie-a između SG i nekog ko je bodovao Q8 — SG ne može da pobijedi tiesbreak-om jer se Q3 ne proverava. SG tada gubi ka DJ fallback-u iako ima podjednako bodova. Ovo nije crash, ali narušava integritet rezultata za određeni profil korisnika.
- [✅] **`resetState()` ispravno resetuje state.** `state.scores = { DJ: 0, ... }` kreira novi objekat (ne mutira stari), `state.answers = []` novi niz. Nema shallow copy problema — stari reference su odbačene.
- [✅] **Double-click zaštita je implementirana.** `allBtns.forEach(b => { b.disabled = true; })` se poziva pre setTimeout, dakle odmah po prvom kliku. Svi odgovori su onemogućeni tokom 250ms tranzicije.
- [✅] **`window.__shareText` undefined nije dostižan kroz normalan flow.** `setShareText()` se poziva unutar `renderResult()` koji se poziva unutar `showLoading()` callbacka, pre nego što result screen postane vidljiv. U main.js postoji dodatna zaštita: `if (!text) return;`. Scenario nije exploitabilan.
- [✅] **Prethodni screen ne ostaje klikabilan tokom fade-out tranzicije.** `showScreen()` skida `.screen--active` odmah → CSS primenjuje `pointer-events: none` trenutno (nije u transition listi — samo `opacity` je animiran). 320ms opacity fade je vizuelni artifact, ali klikovi su blokirani od prvog frame-a.

---

## Lela (engagement):

- [✅] **8 pitanja imaju dobru varijaciju konteksta.** Pokrivaju: nepoznat grad, idealan vikend, event kao plesač, šuma/livada, nova grupa, zvuk problem, poziv na nepoznat event, jutro posle. Nije repetitivno — tema ostaje MKDSL bez da se osjeća kao anketa.
- [✅] **"Slobodan Elektron" je zanimljiv arhetip za share.** Ima distinctivan opis ("katalizator bez fiksne uloge"), dobar citat ("Najzanimljiviji deo svakog mesta je ono što niko nije planirao"), i vlastiti CTA (Prva Poseta). Nije "meh" fallback — korisnici koji ga dobiju imaju što da podijele.
- [⚠️] **Loading screen tekst je previše generičan.** "Analiziramo tvoj profil..." je standard mobile quiz kliše. Nema reference na MKDSL brend ni na specifičan kontekst. Moglo bi biti npr. "Gledam šta kažu šuma, bina i kablovi..." — nešto što daje flavor bez usporavanja.
- [⚠️] **CTA linkovi vode na `mkdsl.games` domen koji nije isti kao `mkdsl.github.io`.** Svih 6 arhetipskih CTA URL-ova (`https://mkdsl.games/setlista`, `https://mkdsl.games/sta-raste`, itd.) referenciraju igre koje možda ne postoje. Domen `mkdsl.games` nije verifikovan u repozitorijumu. Korisnik koji klikne na CTA posle quiza može završiti na 404 — direktno ubija retention loop.
- [✅] **Share tekstovi su prirodni za FB/IG.** Svaki arhetip ima kratak share string: ime + citat + URL. Nije predugačak, nema hashtagova koji bi izgledali forsirano, URL je human-readable. Kopiraće se bez stida.

---

## TOP 3 buga za KORAK 6 (Jova fix):

### Bug 1 — MEDIUM: Progress bar pokazuje 0% na prvom pitanju

U fajlu `src/ui.js`, funkcija `renderQuestion()`, linija:
```js
const percent = Math.round((qIndex / total) * 100);
```
Kada se prikazuje Q1, `qIndex=0`, pa je `percent=0` — korisnik vidi praznu bar na prvom pitanju. GDD spec kaže Q1=12.5%.

**Fix:** `const percent = Math.round(((qIndex + 1) / total) * 100);`

Ovo daje Q1=12.5%, Q2=25%, ..., Q8=100% (što je i bolje UX — 100% na zadnjem pitanju pre loading screena).

### Bug 2 — MEDIUM: Tiesbreak preskače SG profil koji boduje samo Q3

U fajlu `src/state.js`, funkcija `calculateResult()`, tiesbreak sekvenca `['Q8', 'Q7', 'Q6']` ne uključuje Q3 — jedini SG-heavy pitanje koje boduje SG na oba odgovora (B i C po GDD matrici). Profil koji odgovori B ili C na Q3 i SG na Q6 (jedini SG bodovi), pa uđe u tie sa npr. DJ-em koji je bodovao Q8 — SG gubi ka DJ fallback-u, iako je legitimno izjednačen.

**Fix:** Proširiti tiesbreak sekvencu na `['Q8', 'Q7', 'Q6', 'Q3']` — Q3 je SG-specifično pitanje i logično pripada tiesbreak lancu.

### Bug 3 — LOW: CTA linkovi nisu verifikovani (potencijalni 404)

U fajlu `src/config.js`, svih 6 arhetipova ima CTA URL-ove na `https://mkdsl.games/*` domen. Domen nije isti kao GitHub Pages hosting (`mkdsl.github.io`). Ako igre ne postoje, korisnici koji kliknu na "→ Igraj Setlistu" i sl. završe na 404 — retention loop je prekinut.

**Fix (short-term):** Postaviti CTA URL-ove na `#` ili `/` sa `TODO` komentarom do lansiranja pravih igara. Ili: dodati `rel="noopener"` i `target="_blank"` na CTA linkove kao minimum, sa provjerom da domeni postoje pre objavljivanja.

---

## Ukupna preporuka: OBJAVI SA FIXOM

Nijedno od 3 nađena buga nije CRITICAL (nema crash-a, nema gubitka podataka, nema blokirajućeg UX problema). Bug 1 i Bug 2 su MEDIUM — vidljivi korisnicima ali ne sprečavaju igranje. Bug 3 je LOW pre objave, ali postaje MEDIUM ako CTA linkovi stvarno vode na 404.

Igra je tehnički stabilna, engagement vrijednosti arhetipova su dobre, share flow radi. Sa fix-om progress bara (Bug 1) i tiesbreak proširenjem (Bug 2), igra je spremna za objavljivanje.
