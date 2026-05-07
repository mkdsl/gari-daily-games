# Beta Report — Koji Tip Si Ti u MKDSLendu?

## Beta Score: 6.8 / 10.0

---

## Zora (UX/Accessibility):

- [⚠️] **Splash CTA** — Dugme `#start-btn` postoji i stilizovano je kroz `.cta-btn` klasu (bold, accent boja, tap feedback). Nedostaje provjera HTML-a (index.html nije u manifestu), ali flow u `main.js` je ispravno ožičen. Bez vizuelne potvrde HTML strukture — ne može se dati pun ✅.
- [❌] **Progress bar — off-by-one greška** — `renderQuestion` u `ui.js` računa `percent = Math.round((qIndex / total) * 100)`. Na Q1 (`qIndex=0`): **0%**. Na Q8 (`qIndex=7`): **87.5%**. GDD zahteva Q1=12.5%, Q8=87.5%. Fix: `(qIndex + 1) / total * 100`. Korisnik na prvom pitanju vidi prazan progress bar — loš prvi utisak.
- [⚠️] **Result screen hijerarhija** — U `renderResult()`: ime → opis → citat → CTA link → share dugme. CSS poredak u `.result-card` prati isti sled. Hijerarhija je logična, ali `cta-link` (tekst-link ka igri) i `share-btn` (button) nisu vizuelno razdvojeni ni grupovani — na malim ekranima može biti nejasno koji CTA je primarni.
- [✅] **Share toast** — `showToast('Kopirano! Spremi za FB/IG. 📋')` implementiran, CSS toast animacija postoji, z-index: 1000. Jasna povratna informacija.
- [⚠️] **overflow: hidden + result card na malim ekranima** — `html, body` imaju `overflow: hidden`, ali `.screen` je `position: fixed; inset: 0; overflow-y: auto`. Ovo bi trebalo raditi, ALI: na uređajima sa visinom viewporta ≤480px (stariji Android, landscape mode), `result-card` sa `padding: 2rem + gap: 1rem * 6 elemenata` lako prelazi 480px. `.screen` ima `overflow-y: auto` ali bez eksplicitne `height: 100%` ili `max-height` — postoji rizik da card ne bude skrolabilan na najsitnijim ekranima. Potrebna provjera na 360×640.

---

## Raša (tehnički):

- [❌] **Progress bar off-by-one — tehnički uzrok** — `qIndex` je 0-bazirani indeks koji se prosleđuje pre `recordAnswer()`, što je ispravno za prikaz "pitanje N od 8", ali formula `qIndex / total` daje 0% na startu Q1. Formula mora biti `(qIndex + 1) / total`. Ovo je isti bug kao Zorin nalaz — CRITICAL jer je vidljiv od prve sekunde igranja.
- [✅] **resetState() — nema shallow copy problema** — `state.scores = { DJ: 0, ... }` kreira **novu referencu** objekta (nije shallow copy od starog). `state.answers = []` kreira nov niz. Prethodne reference su napuštene. Stanje se čisti ispravno.
- [✅] **Double-click zaštita** — `allBtns.forEach(b => { b.disabled = true; })` se poziva **sinhrono** pre `setTimeout(250ms)`. Svi odgovori su onemogućeni pre nego tranzicija počne. Nema race conditiona.
- [✅] **window.__shareText undefined pri preranom kliku** — `shareBtn` listener proverava `if (!text) return;` eksplicitno. Pored toga, share dugme je dostupno samo na result ekranu koji se prikazuje tek posle `renderResult()` → `setShareText()`. Dvostruka zaštita.
- [✅] **pointer-events tokom fade-out** — `.screen--active` klasa se skida **odmah** iz JS-a, što znači `pointer-events: none` stupa na snagu trenutno (CSS property je bez tranzicije). Opacity se menja 320ms, ali klikovi su blokirani od prvog frema. Nema klika kroz poluvidljive ekrane.
- [⚠️] **Tiesbreak dead code** — U `calculateResult()`: `const scoredOnQ = tied.filter(arch => arch === winner)` — ova provjera `scoredOnQ.length === 1` je uvijek tačna (rezultat je ili 0 ili 1, a 0 je već isključen prethodnim `if (winner && tied.includes(winner))`). Nije runtime bug, ali je zbunjujući dead code koji može sakriti buduće greške.
- [⚠️] **Tiesbreak edge case — Q3 dvostruki SG** — Q3 odgovori B i C oba boduju SG. `answersMap` uvijek mapira Q3→SG bez obzira koji odgovor korisnik izabere. Ovo nije bug (SG dobija bod svejedno), ali znači da Q3 nema disambiguation vrednost u tiesbreak-u — ako je SG tied sa nekim i Q8/Q7 ne razrešavaju, Q6 je poslednja šansa. Nije greška, ali je slepa mrlja u dizajnu tiesbreaka.

---

## Lela (engagement/retention):

- [✅] **Varijacija pitanja** — 8 pitanja pokriva: nepoznat grad, idealan vikend, event na podijumu, šuma vs. livada, nova izgubljena grupa, tehnički problem, dolazak na tuđi event, jutro posle. Situaciona raznolikost je dobra — nema repetitivnih struktura. Pažnja se drži kroz različite kontekste.
- [✅] **Slobodan Elektron nije meh** — SE opis: "katalizator, nema fiksnu ulogu, ali sve malo pokrene" + citat "Najzanimljiviji deo svakog mesta je ono što niko nije planirao" — ovo je pozitivno framing. Nije consolation prize. Share-worthy.
- [⚠️] **Loading screen — generičan tekst** — "Analiziramo tvoj profil..." je standard quiz UX fraza koja korisnici vide posvuda. Moglo je biti nešto specifičnije za MKDSLend kontekst (npr. "Gledamo šta si radio između setova..."). Funkcionalna, ali propuštena prilika za voice.
- [❌] **CTA linkovi su dead links** — Svi CTA URL-ovi koriste domen `https://mkdsl.games/...` koji nije GitHub Pages URL (`mkdsl.github.io/gari-daily-games`). Igre (setlista, sta-raste, signal-chain, program-menager, ko-je-ko, prva-poseta) verovatno ne postoje. Klik na CTA vodi u 404. Pored toga: typo u URL-u `program-menager` (treba `program-manager`). Ovo direktno oštećuje retention loop.
- [⚠️] **Share tekst — dobar, ali emoji nedostaje** — Share tekstovi su prirodni za copy-paste, sadrže citat + URL. Jedino što fali: nema emojija koji bi vizuelno privukao pažnju na FB/IG feed-u pre nego se klikne "Vidi više". Nije bloker, ali je propuštena optimizacija.

---

## TOP 3 buga za KORAK 6 (Jova fix):

### Bug 1 — CRITICAL: Progress bar off-by-one (Q1 prikazuje 0%)

**Opis:** Na prvom pitanju progress bar je potpuno prazan (0%). Korisnik odmah vidi grešku. Kontradikcija sa progress labelom koji kaže "1 / 8".

**Gde u kodu:** `games/2026-05-07-koji-tip-si-ti/src/ui.js`, funkcija `renderQuestion()`, linija:
```js
const percent = Math.round((qIndex / total) * 100);
```
**Fix:**
```js
const percent = Math.round(((qIndex + 1) / total) * 100);
```
Nakon fixa: Q1=12.5%, Q2=25%, ..., Q8=100% — progress bar kompletno popunjen na poslednjem pitanju pre loading screena.

---

### Bug 2 — CRITICAL: CTA linkovi vode u 404 (dead links)

**Opis:** Svih 6 arhetipovih CTA linkova koriste `https://mkdsl.games/` domen koji ne postoji. Korisnik koji dobije rezultat i klikne na CTA (npr. "→ Igraj Setlistu") dobija 404 stranicu. Retention loop je u potpunosti prekinut.

**Gde u kodu:** `games/2026-05-07-koji-tip-si-ti/src/config.js`, u `ARCHETYPES` objektu, svaki arhetip ima `cta.url`. Dodatno: URL `program-menager` sadrži typo (treba `program-manager`).

**Fix:** Zameniti URL-ove sa ispravnim GitHub Pages putanjama ili privremeno ukloniti CTA linkove dok igre ne postoje. Opcija: `href="#"` + `onclick="return false"` sa tooltipom "Uskoro".

---

### Bug 3 — MEDIUM: overflow: hidden rizik na malim ekranima (result card)

**Opis:** `html, body { overflow: hidden }` u `base.css` kombinirano sa `result-card` koji ima mnogo sadržaja može uzrokovati da dno kartice (restart dugme) bude izvan viewporta i ne može se dosegnuti skrolom na uređajima sa visinom ≤480px ili u landscape modu na telefonu.

**Gde u kodu:** `games/2026-05-07-koji-tip-si-ti/styles/base.css` — `overflow: hidden` na `html, body`. `.screen` u istom fajlu ima `overflow-y: auto`, ali bez eksplicitne visine — može se ne aktivirati na svim browserima.

**Fix:** Dodati `height: 100%` eksplicitno na `.screen` ili koristiti `overflow-y: auto` na `.result-card` kontejneru umesto oslanjanja na parent `.screen`. Testirati na 360×640 i iPhone SE (375×667).

---

## Ukupna preporuka: OBJAVI SA FIXOM

**Obrazloženje:** Igra ima solidnu mehaniku, dobar engagement i ispravnu tiesbreak logiku. Dva CRITICAL buga (progress bar 0% i dead CTA linkovi) su vizuelno i funkcionalno vidljivi prvom korisniku — ali oba imaju brz fix (jedna linija koda + URL zamena). Preporučuje se KORAK 6 fix pre objave.
