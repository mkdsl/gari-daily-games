## BETA TEST REPORT — Kluboslavija Pasoš

### Ukupna ocena: 7.5/10

---

### Zora (UX): 7/10

**Šta radi:**
- Onboarding trofrejm struktura (3 slajda) je jasna i brza — igrač za 10 sekundi razume koncept "pečat = odigrana igra"
- Cover ekran sa "Tapni za otvaranje" tagline odmah komunicira akciju
- Stamp detail modal prikazuje i claim dugme i link ka igri — tok je intuitivan
- Micro-copy "Ovo je na tvoju savest — pečat se ne može poništiti." postoji i pozicioniran je ispod claim dugmeta (`.claim-warning`), tačno kako treba
- Prazan (empty) slot vizuelno je jasno različit od claimed: `opacity: 0.3`, `border-style: dashed` — ne izgleda kao greška
- Accessibility: `role="button"`, `tabindex="0"`, `aria-label` na svim interaktivnim elementima, Escape zatvara overlay-e
- Progress bar sa labelom `X / Y pečata` daje jasan signal napretka

**Šta ne radi:**
- Onboarding **nema input polje za ime** — igrač ne može da personalizuje pasoš, defaultuje na 'Klubnik'. Nedostaje osećaj vlasništva nad pasošem
- Close dugme (✕) na stamp-detail-modal je `position: absolute`, ali nema `min-width/min-height` — touch target može biti ispod 44px (CSS definiše samo `font-size: 1.1rem`)
- Hover audio nije kačen na stamp hover eventove — sitna ali primetna praznina u feedback-u
- Na 320px ekranu stamps-grid koristi `flex-wrap: wrap` sa `gap: 16px` i stamp krugovima od 80px — tri pečata u redu daju 3×80 + 2×16 = 272px što staje, ali sa `padding: 16px` svake strane dolazimo na 272 + 32 = 304px, što je u granici. Horizontalni scroll nije prisutan, ali je marža minimalna
- Onboarding modal `max-width: 300px` — na 320px ekranu ostaje samo 10px margin sa svake strane, malo tijesno

**Bug list:**
- **[LOW]** Close button (.close-btn) nema eksplicitnu `min-width: 44px; min-height: 44px` — touch target potencijalno premali na mobilnom
- **[LOW]** Onboarding ne nudi unos imena — welcome personalizacija izostaje, igrač uvek vidi 'Klubnik'
- **[LOW]** Hover audio nije priključen na stamp-item hover event

---

### Raša (Tehničko): 8/10

**Šta radi:**
- **localStorage key konzistentnost: OK.** `pasos-sdk.js` definiše `const STORAGE_PREFIX = 'pasos_stamp_'` i koristi taj prefix u `utisniPecat()` i `imaPecat()`. `state.js` uvozi `STORAGE_PREFIX` iz `./config.js` i koristi ga u `claimStamp()` i `loadStampRecord()`. `isStampClaimed()` delegira na `imaPecat(slug)` iz SDK-a. **Pod uslovom da `config.js` eksportuje `STORAGE_PREFIX = 'pasos_stamp_'`, ključevi su konzistentni** — nije CRITICAL bug
- `claimStamp()` u `state.js` piše direktno (ne kroz SDK `utisniPecat()`), ali koristi isti `STORAGE_PREFIX + slug` key i isti format objekta — kompatibilnost je očuvana
- Audio init je lazy i vezan na `click` i `touchstart` sa `{ once: true }` — ispravno
- `document.fonts.ready` await postoji u `share.js` pre `html2canvas` poziva — ispravno
- `try/catch` postoji oko svih localStorage operacija (`safeGet`/`safeSet` u `state.js` i interni `_safeGet`/`_safeSet` u SDK-u)
- `share.js` ima explicit `try/catch` oko `html2canvas` i prikazuje korisničku poruku na fail — silent fail je obrađen
- `manifest.json` sadrži sve obavezne ključeve: `play_url`, `status`, `modules`
- Import putanje u `main.js` su relativne i konzistentne sa strukturom (`./state.js`, `./ui.js`, `./animations.js`, `./audio.js`, `./share.js`)
- `importState()` nikad ne briše postojeće pečate — merge logika je ispravna
- `getCrew()` u SDK-u čita `gdg_crew_member` key; `updateRewards()` u `state.js` piše `STORAGE_CREW` — ovo mora biti `'gdg_crew_member'` u `config.js` da bi bilo konzistentno

**Šta puca:**
- **NEPROVERIVA TAČKA**: Vrednost `STORAGE_PREFIX` u `config.js` nije dostupna za čitanje (fajl nije isporučen u beta paketu). Ako `config.js` ne eksportuje tačno `'pasos_stamp_'`, `claimStamp()` u `state.js` i `imaPecat()` u SDK-u pisaće na različite ključeve — to bi bio CRITICAL bug. Na osnovu koda i komentara u `state.js` (`// SDK koristi 'pasos_stamp_' prefix — čitamo odatle`), vrednost je konzistentna, ali **config.js nije verifikovan**
- `claimStamp()` u `state.js` ne poziva SDK `utisniPecat()` — piše direktno. Record koji piše nema `score` i `level` polja koja SDK inače upisuje. Nije bug u smislu čitljivosti, ali je duplikacija logike i može se desinkronizovati u budućim verzijama
- `STORAGE_CREW` konstanta u `config.js` mora biti tačno `'gdg_crew_member'` da bi SDK `getCrew()` radio ispravno — nije verifikovano
- html2canvas dolazi sa CDN-a (`cdnjs.cloudflare.com`) bez SRI hash-a — ako CDN nije dostupan, `html2canvas` je `undefined` i `shareScreenshot()` će pući sa `ReferenceError` pre nego što stigne do `try/catch` bloka

**Bug list:**
- **[CRITICAL — CONDITIONAL]** `config.js` nije verifikovan — ako `STORAGE_PREFIX` nije `'pasos_stamp_'`, `imaPecat()` ne nalazi pečate koje je `claimStamp()` upisao → pečati se gube nakon refresha
- **[MEDIUM]** html2canvas CDN bez SRI integriteta — nema fallback ako CDN padne; `html2canvas is not defined` greška nije uhvaćena u try/catch (poziv je pre try bloka)
- **[LOW]** `claimStamp()` duplicira SDK zapis logiku umesto da poziva `utisniPecat()` — rizik od desinhronizacije formata

---

### Lela (Engagement): 7.5/10

**Šta radi:**
- Flip animacija korica (`flipOpen` keyframe, 650ms, `perspective: 800px`) daje fizički osećaj otvaranja — taktilno zadovoljavajuće
- `inkSpread` keyframe na `just-claimed` klasi daje satisfakciju "tresnutog pečata" — pravi "thunk" osećaj je tu kroz vizuelni razliv
- Reward overlay sa ikonom, naslovom i opisom je ceremonijalan — dovoljno za mali `wow` momenat
- Progress bar se animira (`transition: width 0.5s ease`) — jasno pokazuje napredovanje
- `${claimedCount} / ${total} pečata` label je direktan signal koliko fali do sledećeg koraka
- Rewards sekcija u pasoši prikazuje locked/unlocked stanja sa threshold brojem pečata — igrač zna šta ga čeka
- Link ka igri (`→ Otvori igru`) u stamp detail modalu je jak razlog za povratak

**Šta dosadi / nedostaje:**
- Onboarding je informativno-pasivan — ne ostavlja emocionalni trag. Nema personalizacije (nema pitanja za ime), nema vizualnog WOW-a
- Stamp hover audio nije priključen — najmanji detalj koji bi popravio svaki klik na grid
- Prazni slotovi za buduće igre (coming soon) ne postoje u UI-u — grid prikazuje samo `STAMPS` iz config-a; igrač nema informaciju o tome koliko ukupno igara postoji u sezoni, samo videni stamps. Nema anticipacije
- Claim dugme nema loading state — nakon klika ništa se ne desi vizuelno pre animacije, može delovati kao da dugme ne radi
- Nema social proof ni kompetitivnog elementa ("X igrača ima ovaj pečat")
- Reward za 3 pečata je lepa milestone, ali **nema intermediate mikro-nagrade** (npr. animirani badge posle prvog pečata) — prva nagrada kasni

**Predlog:**
1. Dodati "coming soon" dimmed slotove za sve poznate buduće igre u grid — igrač vidi finalnu mapu i jedva čeka sledeći event
2. Animirani konfeti ili blesak na prvom ikad claim-u — instant gratification koja drži igrača
3. Stamp hover audio (tihi click sound) i scale micro-animacija na hover već postoji u CSS (scale 1.05) — samo treba priključiti audio

---

### TOP 3 kritična problema (CRITICAL / MEDIUM tag obavezan)

## Bug 1 — CRITICAL: config.js STORAGE_PREFIX neproverena konzistentnost

`state.js` uvozi `STORAGE_PREFIX` iz `./config.js` i koristi ga u `claimStamp()`. SDK (`pasos-sdk.js`) definiše svoju internu konstantu `const STORAGE_PREFIX = 'pasos_stamp_'`. `isStampClaimed()` poziva `imaPecat()` iz SDK-a, koji koristi SDK-ov prefix. Ako `config.js` eksportuje drugačiji string od `'pasos_stamp_'`, pečati upisani kroz `claimStamp()` neće biti pronađeni pri `isStampClaimed()` čitanju → korisniku izgledaju izgubljeni nakon refresha. `config.js` nije bio dostupan za verifikaciju u ovom beta testu. **Akcija: odmah proveriti `src/config.js` i potvrditi `export const STORAGE_PREFIX = 'pasos_stamp_'`.**

**Reprodukcija:** Claim stamp → refresh stranice → stamp prikazan kao unclaimed.
**Fix:** Verifikovati config.js vrednost. Alternativno, prebaciti `claimStamp()` da poziva SDK `utisniPecat()` direktno i eliminisati duplikaciju.

## Bug 2 — MEDIUM: html2canvas CDN bez SRI i bez null-check

html2canvas se učitava sa CDN-a bez Subresource Integrity hash-a. Ako CDN nije dostupan (offline, CDN outage, korporativni firewall), `html2canvas` je `undefined`. U `shareScreenshot()`, poziv `await html2canvas(target, ...)` dolazi **pre** `try/catch` bloka, što znači da `ReferenceError: html2canvas is not defined` nije uhvaćen — korisnik vidi nehandlovanu grešku umesto korisne poruke.

**Fix opcija A:** Dodati `if (typeof html2canvas === 'undefined') { /* prikaži poruku */ return; }` na početku `shareScreenshot()`.
**Fix opcija B:** Dodati SRI atribut na script tag i/ili self-host html2canvas.

## Bug 3 — MEDIUM: Touch target premali na close dugmetu

`.close-btn` CSS klasa definiše samo `font-size: 1.1rem` bez eksplicitnih `width`/`height`/`padding` vrednosti dovoljnih za 44px touch target (WCAG 2.5.5 standard). Na mobilnim uređajima close dugme (✕) na stamp-detail i export modalima može biti teško pogoditi, posebno jednom rukom.

**Fix:** Dodati u CSS: `.close-btn { min-width: 44px; min-height: 44px; padding: 10px; }`

---

### TOP 3 "nice to have"

1. **"Coming soon" slotovi u gridu** — prikazati buduće igre kao dimmed/zaključane krugove sa datumom, da igrač vidi finalnu mapu sezone i ima razlog da se vrati na sledeći event datum
2. **Ime igrača u onboardingu** — dodati text input za ime na prvom ili zadnjem onboarding frame-u; ime odmah prikazati u pasoši umesto defaultnog 'Klubnik' — mali detalj koji drastično povećava osećaj vlasništva
3. **Mikro-nagrada na prvom pečatu** — kratki konfeti burst ili posebna animacija samo za prvi ikad claim — instant gratification koji drži novog igrača angažovanim pre nego što stigne do prave nagrade na 3 pečata
