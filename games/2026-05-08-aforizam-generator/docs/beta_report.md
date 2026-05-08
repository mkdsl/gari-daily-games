## BETA TEST REPORT — Aforizam Generator

**Datum:** 2026-05-08  
**Testeri:** Beta Trio — Zora (UX) + Raša (Tehničko) + Lela (Engagement)  
**Verzija:** main branch, SHA 29e9e17

### Ukupna ocena: 7.5/10

---

### Zora (UX): 8/10

**Šta radi:**
- Auto-load radi ispravno — `showAforizmImmediate` se poziva na init, korisnik ne vidi prazan ekran ni milisekundu.
- `aria-live="polite"` postoji na `#toast` elementu — screen reader će čitati potvrdu kopiranja bez prekidanja korisnika.
- Kontrast `#f0ece4` teksta na `#0d0d0d` pozadini je odličan (ratio ~19:1, WCAG AAA prolazi bez greške).
- Google Fonts se učitava sa `&display=swap` u URL-u — tekst se prikazuje u fallback fontu dok se Lora ne učita, nema blokiranog rendera.
- Struktura je čista: jedna kartica, dva dugmeta, footer watermark. Korisnik odmah zna šta da radi.

**Šta ne radi:**
- Dugmad (`#btn-next`, `#btn-copy`) nemaju definisanu minimalnu visinu u CSS-u. `game.css` ne setuje `min-height: 44px` — na mobilnom uređaju touch target može biti premali, posebno za `Kopiraj za IG` button koji ima duži label. WCAG 2.5.5 preporučuje minimum 44×44px.
- Nema vizuelnog feedbacka na dugmadima dok je `transitioning = true` (pointer-events se gasi na `#controls`, ali dugmad vizuelno izgledaju identično — korisnik ne zna zašto klik ne reaguje).
- Toast poruka nakon kopiranja nije videna u kodu (tekst poruke dolazi iz `share.js` koji nije čitan), ali ako kaže samo "Kopirano" bez konteksta, korisnik možda ne zna šta je kopirano.

---

### Raša (Tehničko): 7/10

**Šta radi:**
- Nema circular importa. `ui.js` → `config.js` only. `input.js` → `config.js` + `ui.js`. `share.js` → `config.js` + `ui.js`. Graf je acikličan, ES moduli će se učitati bez problema.
- Dvostruka zaštita od spam-klika: `isTransitioning()` guard u `input.js` + `DEBOUNCE_MS` (600ms) timestamp check. Čak i ako se guard zaobiđe, debounce hvata ponovne klikove.
- `showAforizmImmediate` se koristi samo jednom (na init), pa izostanak `transitioning` flaga nije problem u trenutnoj upotrebi.
- Shuffle algoritam (Fisher-Yates in-place na kopiji) je korektno implementiran. Reset na kraju queue je elegantan.

**Šta puca:**
- **Animation retrigger rizik u `showAforizam`:** Kada se `aforizmEl.style.animation` postavi na `fadeOut`, pa odmah na `fadeIn`, neki browseri (Chrome posebno) ne retriggeruju animaciju jer nije bilo `reflow` između. Standardni fix je `element.offsetHeight` (forced reflow) ili `element.style.animation = 'none'` + `requestAnimationFrame` pre setovanja nove animacije. Trenutni kod radi pouzdano samo zato što `await delay(FADE_OUT_MS)` između assignmenta daje browseru dovoljno vremena za paint — ali ovo je sretan slučaj, ne garantovan. Ako se timing promeni, animacija može "zalepiti".
- **`showAforizmImmediate` ne setuje `transitioning = true`:** Ako se ova funkcija ikad pozove van init konteksta (npr. u budućem feature-u), overlapping animacija je moguća.
- **`aforizmEl.style.animation = ''` reset na kraju `showAforizam`:** Element ostaje u fully-opaque stanju jer `fadeIn` animacija završi na `opacity: 1`, ali bez `animation-fill-mode: forwards` u inline stilu (postoji u keyframe stringu kao `forwards`), reset animacije može prouzrokovati flash na `opacity: 0` u edge case-u. Malo verovatno, ali nije nemoguće.
- **Copy button nema debounce:** `btnCopy` listener poziva `onCopy()` bez ikakvog ograničenja — brzi dvostruki klik može pozvati share/clipboard API dva puta i prikazati dva toasta u nizu.

---

### Lela (Engagement): 7.5/10

**Šta radi:**
- Aforizmi autentično zvuče kao Pera Period — specifični detalji (garderober, subwoofer, ćevabdžija, fontana u centru) daju lokalni karakter koji generički aforizam generatori nemaju.
- Posebno jaki primeri:
  - *"Subwoofer ne laže. Sve ostalo — možda."* — savršena brevity.
  - *"Posle četiri ujutru, iskrenost je jedini preostali filter."* — atmosferičan, tačan.
  - *"Tramvaj kasni jednako pouzdano svako jutro. Bar to možeš da računaš."* — lokalno i gorko-smešno.
  - *"Kafana u podne ima svoju filozofiju. Ona ne sudi, samo sluša i naplati."* — glasovit.
- Kategorijska raznolikost (klub/ples/ljubav/grad/filozofija) znači da sekvenca retko postane monotona.
- Fade ritam (200ms out + 300ms in = 500ms total) je dobar — nije ni tromav ni agresivan. Daje osećaj da aforizam "dolazi" a ne da se brutalno zamenjuje.
- 52 aforizama sa ponovnim shuffleom — za casual korisnika koji klikne 10-15 puta, nikada neće videti isti dva puta u sesiji.

**Šta dosadi:**
- *"Kopiraj za IG"* label pretpostavlja Instagram i zbunjuje desktop korisnike. Puno korisnika koji nisu na Instagramu (ili su na desktopu) neće znati zašto bi kliknuli. Bolji label: *"Kopiraj"* sa toast-om koji objašnjava format.
- Share poruka *"Nalepi u IG story"* nema smisla na desktopu — korisnik je kopirao tekst u clipboard ali ne može da ga paste-uje u mobil Story bez prebacivanja uređaja.
- Kategorija "Filozofija/Apsurd" (8 aforizama) je najslabija od pet — nekoliko zvuče generično (*"Smisao nije skriven. On je samo previše blizu da bismo ga videli."*) i ne nose Pera Period specifičnost ostalih kategorija.
- 52 aforizama je granica — heavy user koji otovri app svaki dan tokom nedelju dana počeće da prepoznaje aforizme. Nema mehanizma koji beleži već viđene između sesija.

---

### TOP 3 kritična problema

1. **MEDIUM:** Touch target veličina dugmadi nije garantovana — `game.css` i `ui.css` ne definišu `min-height: 44px` za `#btn-next` i `#btn-copy`. Na nekim mobilnim uređajima button može biti manji od preporučenog minimuma, što otežava tapping posebno za korisnike sa krupnijim prstima ili motoričkim poteškoćama.

2. **MEDIUM:** Animation retrigger nije robusno implementiran u `showAforizam` — oslanjanje na `await delay()` kao implicitni reflow nije garantovana tehnika. Treba dodati `requestAnimationFrame` ili `offsetHeight` reflow između `fadeOut` i `fadeIn` assignmenta da se spreči potencijalni bug pri promeni timinga ili optimizacijama browsera.

3. **LOW:** `btnCopy` nema debounce zaštitu — brzi dvostruki klik poziva `onCopy()` dva puta, što može rezultovati duplikatnim toast-ovima i višestrukim pozivima Clipboard/Share API-a. Dodati isti `isTransitioning()` ili timestamp guard kao za `btnNext`.

---

### TOP 3 "nice to have"

1. Promeniti label *"Kopiraj za IG"* u *"Kopiraj"* i u toast poruci napisati format koji je kopiran (npr. *"Tekst kopiran — spreman za deljenje"*) — eliminisati pretpostavku o platformi.

2. Dodati vizuelni disabled state na dugmad tokom `transitioning` (npr. `opacity: 0.5` ili `cursor: not-allowed`) — korisnik dobija feedback da sistem radi, a ne da je klik ignorisan.

3. Dodati 10-15 aforizma iz kategorije "Filozofija/Apsurd" sa više lokalnog karaktera (konkretni Beograd/Klub detalji, manje apstraktnih formulacija) — podići kvalitet najslabije kategorije na nivo ostalih četiri.
