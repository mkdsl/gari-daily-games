## BETA TEST REPORT — Aforizam Generator

_Testeri: Beta Trio — Zora (UX) + Raša (Tehničko) + Lela (Engagement)_  
_Datum: 2026-05-08 | Branch: main | Read: izvor direktno (bez deploy-a)_

### Ukupna ocena: 7.5/10

---

### Zora (UX): 8/10

**Šta radi:**
- Auto-load funkcioniše — `generator.init()` u `DOMContentLoaded` odmah popunjava `aforizam-text`, korisnik ne vidi prazan ekran.
- `aria-live="polite"` postoji na `#toast` i toast menja `textContent` dinamički — screen reader ce pročitati poruku bez fokus-skoka. Implementacija je ispravna.
- Kontrast teksta `#f0ece4` na tamnoj pozadini `#0d0d0d` (pretpostavljeno iz watermark boje i `#1a1a1a` toast pozadine) prolazi WCAG AA — odnos je ~16:1, daleko iznad praga 4.5:1.
- Fontovi se učitavaju sa `display=swap` parametrom direktno u Google Fonts URL-u (`?family=Lora:ital@1&display=swap`) — render se ne blokira, sistem-serif se prikazuje dok se Lora ne učita.
- `font-size: clamp(18px, 5.5vw, 28px)` osigurava čitljivost na svim veličinama ekrana.

**Šta ne radi:**
- Dugmad: `padding: 14px 28px` daje visinu ~43px (14+14+15px line-height ≈ 43px) — jedan piksel ispod preporučenog 44px touch targeta. Marginalna greška, ali postoji.
- Na `#aforizam-text` nema `role` ili `aria-label` atributa — screen reader čita sadržaj ali ne najavljuje da je to aforizam koji se menja. Korisnik čuje novu rečenicu ali bez konteksta "novi aforizam".
- `lang="sr"` je ispravno setovano, ali nema `lang` atributa na tekstu koji bi screen readeru signalizirao srpski izgovor za TTS engine.
- Toast poruka "Nalepi u IG story" ima platformski pretpostavku — na desktop-u nema smisla (vidi Lela sekciju).

---

### Raša (Tehničko): 7.5/10

**Šta radi:**
- Nema circular importa. Graf: `ui.js` importuje samo `config.js`. `share.js` importuje `config.js` i `ui.js`. `input.js` importuje `config.js` i `ui.js`. `main.js` orkestrira sve. Čist jednosmerni graf.
- `showAforizam` koristi `transitioning` flag koji blokira sve pozive dok animacija traje. `isTransitioning()` je eksportovana i `input.js` je proverava pre nego što pozove `onNext()`. Debounce od 600ms je dodatni sloj zaštite. Overlapping animacije su blokirane na oba nivoa.
- Fisher-Yates shuffle je implementiran ispravno (in-place kopija, `i--` redosled).
- `execCommand` fallback za starije browsere postoji i rukuje greškom — dobra defensive implementacija.
- Google Fonts `display=swap` je prisutan u HTML `<link>` href-u — render ne blokira.

**Šta puca:**
- **Animation reset bug (MEDIUM):** Nakon što `showAforizmImmediate` postavi `fadeIn` animaciju, `setTimeout` resetuje `style.animation = ''`. Ovo je OK za initial load. Ali u `showAforizam` (async verzija), isti CSS property se koristi i za `fadeOut` i za `fadeIn` sekvencijalno na istom elementu. Problem: browser može da ne "vidi" promenu kada se setuje ista `animation` vrednost drugi put jer CSSOM ne detektuje novu animaciju ako je property vrednost identična stringu. Konkretno, ako se `fadeIn` završi, `style.animation` se resetuje na `''`, a sledeći `showAforizam` ponovo setuje `fadeOut` — to radi. Ali ako korisnik uspešno prodje kroz oba poziva sa istim timing-om, browser može skipovati reflow. Bezbednije bi bilo koristiti `animation` klase + `requestAnimationFrame` za force-reflow.
- **`showAforizmImmediate` ne setuje `transitioning` flag:** Ako se `showAforizmImmediate` pozove u toku `fadeIn` (300ms), `transitioning` ostaje `false` jer ga `showAforizmImmediate` nikad ne setuje. Praktično to nije problem jer se `showAforizmImmediate` poziva samo jednom pri init-u pre nego što korisnik može da klikne — ali je arhitekturalni rizik ako se ikad pozove iz drugog konteksta.
- **`btnCopy` nema debounce ni `isTransitioning()` check:** Korisnik može da klikne "Kopiraj za IG" tokom fade animacije i dobiće tekst koji je u tranziciji (stari ili novi, zavisno od timing-a). `generator.current` u tom trenutku je već zamenjen novim tekstom, ali animacija vizuelno još prikazuje stari. Raskorak između prikazanog i kopiranog teksta je moguć.
- **`execCommand` deprecated:** `document.execCommand('copy')` je deprecated u svim modernim browserima. Fallback je tu i funkcionalan, ali MDN ga označava kao legacy. Nije bug danas, ali treba napomenuti.
- **`navigator.share` na desktopima:** `navigator.share` nije dostupan u Firefox desktop i starije Chrome desktop verzije — kod ispravno pada na `copyToClipboard`, ali `share.catch()` koji takodje poziva `copyToClipboard` znači da mobile Web Share greška (korisnik otkaže share) rezultuje u neočekivanom clipboard kopiranju bez korisnikovog eksplicitnog pristanka.

---

### Lela (Engagement): 7/10

**Šta radi:**
- Aforizmi zvuče autentično Pera Period — rečenice su kratke, udaraju u kraju, imaju ritam. Primeri koji funkcionišu odlično:
  - _"Subwoofer ne laže. Sve ostalo — možda."_ — savršen format: setup + obrat u dve reči.
  - _"Posle četiri ujutru, iskrenost je jedini preostali filter."_ — precizno, nije kliše.
  - _"Telo pamti muziku duže nego što mozak pamti reči."_ — emocionalno tačno.
  - _"Kafana u podne ima svoju filozofiju. Ona ne sudi, samo sluša i naplati."_ — lokalni glas, duhovito.
  - _"Blok pamti sve — ko je otišao, ko se vratio i ko se pravio da nije bio."_ — sjajan ritam.
- 52 aforizama je dovoljan broj za casual session (prosečan korisnik ne klikne više od 10-15 puta). Reset shuffle posle 52 je elegantan — korisnik dobija novu permutaciju, ne istu sekvencu.
- Fade 200ms out + 300ms in = 500ms total — nije sporo, ali nije ni instantno. Za aforizam format (kratke rečenice koje treba da "slete") ovo je prihvatljivo. Sporiji fade bi bio bolji za duže rečenice.

**Šta dosadi:**
- **"Kopiraj za IG" label:** Pretpostavlja da korisnik ima Instagram. Korisnici koji nemaju IG (ili koriste Threads, X, TikTok) osećaju se isključeno. "Kopiraj" bi bio neutralan i dovoljno jasan.
- **"Nalepi u IG story" u toast-u i share-u:** Na desktop browseru ovo je besmisleno. Desktop korisnik koji kopira tekst ne može da "nalepi u IG story" direktno. Toast bi trebalo da bude kontekstualan: mobilni → "Nalepi u IG story", desktop → "Kopirano u clipboard".
- **Nekoliko aforizama je generičnija filozofija nego Pera Period glas:** _"Smisao nije skriven. On je samo previše blizu da bismo ga videli."_ i _"Sloboda je najlakša dok je nema niko drugi da je primeti."_ zvuče više kao opšta mudrost nego kao neko ko izlazi iz kluba u 5 ujutru. Ove bi mogle biti oštrije.
- **Nema kategorije ili mooda:** Korisnik ne zna da li dolazi klub aforizam ili ljubavni. Shuffle je totalno nasumičan pa može da se dogodi 3 filozofska zaredom — ritam sadržaja nije orkestriran.
- **Share suffix nije vidljiv u kodu koji smo čitali** (CONFIG.SHARE_SUFFIX iz config.js nije pročitan) — ne možemo oceniti koliko je CTA u share tekstu jak.

---

### TOP 3 kritična problema

1. **MEDIUM — Animation CSS reset može preskočiti reflow:** U `showAforizam`, sekvencijalno setovanje `style.animation` na isti `fadeIn` string bez force-reflowa može izazvati da browser ne pokrene novu animaciju. Fix: dodati `void aforizmEl.offsetWidth` (reflow trigger) između resetovanja i ponovnog setovanja animacije, ili koristiti CSS klase umesto inline `style.animation`.

2. **MEDIUM — Kopiraj dugme nema transitioning guard:** `btnCopy` može biti kliknut tokom fade tranzicije i kopirati `generator.current` koji je već sledeći aforizam, dok ekran još prikazuje prethodni. Fix: dodati `if (isTransitioning()) return;` u `btnCopy` click handler.

3. **LOW — Toast i button label su IG-specifični bez detekcije platforme:** "Kopiraj za IG" i "Nalepi u IG story" alienuju ne-Instagram korisnike i zbunjuju desktop korisnike. Fix: label → "Kopiraj", toast → `isMobile ? 'Nalepi u IG story.' : 'Kopirano u clipboard.'`.

---

### TOP 3 "nice to have"

1. **Kategorisani shuffle ili mood filter:** Dugme ili swipe gesta za promenu "mooda" (Klub / Ljubav / Filozofija) bi povećalo vreme provedeno u igri i dalo korisniku osećaj kontrole nad iskustvom.

2. **Progres indikator aforizama:** Sitna oznaka tipa "14 / 52" (ili čak vizuelni progress bar) daje korisniku osećaj da "sakuplja" aforizme i motiviše da dođe do kraja šuflovane liste.

3. **`aria-label` na aforizam kontejneru + live region role:** Dodati `role="status"` ili eksplicitni `aria-label="Trenutni aforizam"` na `#aforizam-text` kako bi screen reader korisnici imali bolji kontekst bez oslanjanja isključivo na `aria-live` toast.
