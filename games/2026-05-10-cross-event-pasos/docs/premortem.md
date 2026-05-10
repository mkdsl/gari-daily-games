# Premortem — Kluboslavija Pasoš

*Autor analize: Nega Negovanović — kritički analitičar tima*
*Datum: 2026-05-10*

---

## Steelmanning koncepta

Kluboslavija Pasoš je meta-sloj koji od fragmentisanog niza nezavisnih event-igara pravi koherentnu sezonu sa identitetom. Umesto da svaki event bude izolovano iskustvo koje igrač zaboravi sutradan, Pasoš gradi narativ — "bio sam tamo, imam pečat, gradim priču." Mehanizam je asimetričan po dizajnu: retro pečati (manual claim) za prošlost, automatski pečati za budućnost — što znači da se sistem nadograđuje organički bez retkonstriranja. Vizuelna metafora putne isprave nije slučajna — dokumenti imaju težinu, kolekcija ima gravitas, a screenshot-sharing je viralni vektor koji košta nula development truda. Koncept je ujedno najlakši i najteži deo GDG 2026: lak jer ne mora da bude gameplay, težak jer cela sezona mora da mu veruje da bi imao vrednost.

---

## Analiza rizika

### 1. Integritet bez validacije — SREDNJI RIZIK

**Problem:** Igrač može da klikne "Odigrao/la sam ovo" za Avala Run, Aforizam i DJ za Pultom a da nikad nije otvorio ni jedan od tih URL-ova. Za 60 sekundi dobija 3 pečata i sve nagrade do nivoa "Ekipni Čovek".

**Zašto je problem:** Vrednost Pasoša kao artefakta zajednice leži u tome da je pečat *dokaz prisustva*. Ako pečat znači "kliknuo sam dugme", screenshot koji neko deli nema socijalnu težinu — postaje estetski predmet bez memorije. Igrači koji su *zaista* bili na eventima i odigrali igre imaju isti pečat kao onaj ko je prevario sistem. To ne ruši tehničku funkcionalnost, ali ruši semantičku vrednost koja je srž koncepta.

**Zašto NIJE showstopper:** Sistem ne troši servere, nije takmičarski (nema leaderboard), nema materijalne nagrade. Crew member badge u localStorage ne znači ništa van browser-a. Realna populacija koja bi zloupotrebila: minimalna. GDG zajednica nije motivišana da cheats-uje booklet.

**Alternativa / korekcija:** Dve opcije — (A) Prihvati honor system svesno i eksplicitno, dodaj micro-copy uz dugme: *"Ovo je na tvoju savest — pečat se ne može poništiti"* — čime se psihološki troška prebacuje na igrača. (B) Za retro igre implementiraj soft-gating: prikaz URL-a igre sa CTA "Odigraj pa se vrati" pre nego što se pojavi claim dugme, bez tehničke provere ali sa friction-om koji odvraća pasivne claimere. Preporuka: opcija A, brže i iskrenije.

---

### 2. Nula pečata na startu = prazna stranica — SREDNJI RIZIK

**Problem:** Igrač koji dođe na Pasoš bez ikakvog prethodnog iskustva vidi prazan booklet — možda 0/7 stranica popunjenih. Svaki slot je prazan kružić ili placeholder. Nema konteksta, nema orijentacije, nema nagoveštaja šta bi trebalo da uradi.

**Zašto je problem:** Prazan state je najkritičniji UX momenat — korisnik koji ne razume za prvih 10 sekundi šta treba da radi, odlazi. "Ova stranica čeka tvoj dolazak" kao jedina povratna informacija na 7 praznih slotova je poetično ali nije informativno. Postoji realna opasnost da igrač pomisli da je stranica broken.

**Zašto NIJE showstopper:** Retro claim dugmad za 3 prošle igre postoje — dakle čak i novi igrač može *odmah* da počne da puni Pasoš bez čekanja. Taj mehanizam pretvara prazan start u akcioni poziv. Problem je samo ako ta dugmad nisu vizuelno prominentna odmah na startu.

**Alternativa / korekcija:** Uvedi onboarding sekvence koja se pokreće samo pri prvoj poseti (flag u localStorage): kratka animacija (3 frame-a) koja pokazuje prazan Pasoš → pečat koji se utiskuje → popunjen Pasoš. Zatim direct CTA na retro sekciju. Alternativno: empty state tekst umesto praznog kružića koji kaže "Odigraj [naziv igre] da dobiješ ovaj pečat" — konkretno, akciono, bez poetike.

---

### 3. Lokalizacija nagrade u localStorage — SHOWSTOPPER (uslovno)

**Problem:** Sve — pečati, profil, nagrade, crew_member status — živi u jednom browseru, na jednom uređaju. Igrač koji menja telefon, briše kolačiće, ili koristi inkognito mod gubi sve. `gdg_crew_member: true` je trofej koji nestaje čišćenjem cache-a.

**Zašto je problem:** Ako se Pasoš pozicionira kao *dokaz prisustva kroz sezonu*, a taj dokaz može nestati nasumično, onda nije dokaz — onda je privremeni UI state. Igrač koji ponosi pokazuje screenshot u junu, a do septembra kada dođe novi event, nema više ništa u Pasošu. Restart iskustva je demotivišuć. Još ozbiljnije: ako buduće igre čitaju `gdg_crew_member` da bi otključale nešto specijalno — taj benefit je krhak.

**Zašto je uslovno showstopper:** Ako nagrade ostanu čisto estetske (avatar frame u igri, badge u UI Pasoša) i ne postoje cross-site benefiti koji zavise od localStorage flagova — prihvatljivo je. Postaje showstopper tek ako neka buduća igra kaže *"ako imaš gdg_crew_member dobijaš bonus nivo"* jer taj benefit ne može biti garant.

**Alternativa / korekcija:** Kratkoročno: eksport/import feature — dugme "Sačuvaj Pasoš" koje generiše JSON string koji korisnik može da kopira i uveze na drugom uređaju. Nula backend-a, nula infrastrukture. Srednjeročno: enkodovani URL parametar (base64 state) koji se može bookmarkovati ili podeliti — Pasoš se rekonstruiše iz URL-a. Dugoročno (van scope-a ove igre): GitHub-based auth ili Google Sheet write. Preporuka za MVP: export/import JSON — jedan dan implementacije, eliminiše showstopper.

---

### 4. html2canvas dependency — SREDNJI RIZIK

**Problem:** html2canvas je jedina eksterna biblioteka u projektu. Uvodi ~200KB overhead, ima poznate probleme sa: custom fontovima (pixel font može biti blank), CSS gradijentima, transform animacijama, i cross-origin slikama. Rendering izlaza zavisi od browser verzije i OS-a.

**Zašto je problem:** Ako screenshot funkcija ne radi — deli se broken slika ili se share uopšte ne dogodi. To direktno udara na viralni vektor koji je u konceptu identifikovan kao ključni. Pixel art font koji ne renderuje u screenshotu je posebno bolan jer je vizuelni identitet Pasoša zavistan od tog fonta.

**Zašto NIJE showstopper:** html2canvas je de-facto standard za ovaj problem u browser-only projektima. Problemi sa fontovima su rešivi loadom kroz FontFace API pre renderovanja. Ovo je tehnički rizik koji ima jasno rešenje, nije arhitekturalni problem.

**Alternativa / korekcija:** Plan B: umesto canvas screenshota, generiši SVG reprezentaciju Pasoša koji se može downlodovati direktno — SVG ne zavisi od browser rendering, piksel-perfekt je, lightweight. Plan A+ (bolje od html2canvas): koristi OffscreenCanvas + font preloading sekvence:
```js
await document.fonts.ready; // čeka da pixel font bude učitan
html2canvas(element, { useCORS: true, scale: 2 })
```
Dodati fallback: ako html2canvas baci error, prikaži "Napravi screenshot ručno" sa highlight animacijom na Pasošu. Nikad ne ostavljaj korisnika sa silent fail.

---

### 5. Placeholder stranice za buduće igre — KOZMETIKA (sa upozorenjem)

**Problem:** Ako Pasoš ima 10+ stranica od kojih su 3 popunjene, a 7+ su prazni slotovi sa "Ova stranica čeka tvoj dolazak" — vizuelni utisak je da je produkt nedovršen, a ne da je sezona u toku.

**Zašto je upozorenje:** Razlika između "nedovršen" i "anticipation building" je isključivo u dizajnu. Ako su prazni slotovi tamni, zaključani, sa lock ikonom i datumom sledećeg eventa — to je anticipation. Ako su svetli prazan krug sa jedinom porukom — to je empty state bez konteksta.

**Zašto je kozmetika:** Ne ruši core loop, ne blokira vrednost, ne remeti tehničku implementaciju. Ovo je čist UX/copy problem.

**Alternativa / korekcija:** Svaki prazni slot treba da ima: (1) naziv budućeg eventa, (2) okvirni datum, (3) vizuelni marker koji ga jasno razlikuje od grešake (npr. "coming soon" ribbon umesto praznog kruga). To pretvara prazan Pasoš u event calendar — drugačiji, ali vredan informacioni artefakt. Bonus: korisnik koji vidi "GDG Hackathon — oktobar 2026" u Pasošu ima razlog da se vrati.

---

### 6. Inter-game API bez koordinacije — SHOWSTOPPER

**Problem:** Svaka buduća igra mora samostalno da implementira tačan localStorage ključ u tačnom formatu da bi pečat bio upisan. Nema centralnog registra, nema validacije, nema dokumentacije koja se enforciuje. Jedan pogrešan slug (`gdg_pasos_avala_run` umesto `gdg_pasos_avala-run`) i pečat se ne pojavljuje — bez error poruke, bez fallbacka, bez debug alata.

**Zašto je showstopper:** Ovo je distributed system problem bez koordinacionog mehanizma. Svaki dev koji piše sledeću igru mora da: (a) zna da Pasoš postoji, (b) zna tačan format ključa, (c) pravilno implementira write logiku, (d) testira da Pasoš čita taj ključ. Bilo koji od ova 4 koraka može podbaciti tiho. Ako pečat ne dođe automatski za event koji igrač jeste odigrao — sistem je izgubio poverenje i vrednost.

**Alternativa / korekcija:** Mora se definisati i distribuisati `pasos-sdk.js` — minimalni JS snippet (< 1KB) koji svaka igra importuje i poziva jednom po završetku:
```js
import { utisniPecat } from '/shared/pasos-sdk.js';
utisniPecat('avala-run', { score: 420 }); // to je sve
```
SDK interno piše ispravni localStorage ključ, ispravni format, sa timestamp-om. Slug validacija se radi u SDK-u (whitelist poznatih evenata ili regex). Dokumentacija SDK-a treba da bude u `shared/README.md` i obavezno pomenuta u dev briefingu za svaku igru. Bez ovog, Pasoš je sistem koji se oslanja na kolektivno pamćenje tima — i to nije sistem, to je nada.

---

### 7. Zjanr: "Nije pravo igra" — SREDNJI RIZIK

**Problem:** Igrač koji klikne na link za GDG igru i umesto gameplay-a dobije interaktivni booklet može biti zbunjen ili razočaran. Pasoš nema win state, nema izazov, nema loop — to je UI za kolekciju, ne igra.

**Zašto je problem:** Mismatch između očekivanja ("igra") i isporuke ("booklet") stvara kognitivnu disonancu u prvih 15 sekundi. U tom prozoru korisnik donosi odluku da li ostane ili ode. Ako CTA koji ga je doveo kaže "Igraj Pasoš" — taj mismatch je aktivan.

**Zašto NIJE showstopper:** Pasoš nije zamena za igru — on je meta-sloj *iznad* igara. Ako je komunikacija prema igraču ispravna ("Tvoj GDG Pasoš", ne "Nova igra"), mismatch nestaje. Ovo je problem framinga, ne problema dizajna.

**Alternativa / korekcija:** Sve komunikacije prema korisniku (email, socijalni post, QR kod na eventu) moraju da koriste tačan jezik: "Otvori svoj Pasoš", "Vidi koliko pečata imaš", nikad "Igraj". U samom UI, animacija otvaranja i haptic feedback (vibrate API na mobilnom) daju osećaj interakcije koja ima težinu bez potrebe za gameplay-em. Razmisli o tome da se doda jedna mini-interakcija pri utisku pečata — zvuk, particle animacija — koja daje satisfakciju čina.

---

### 8. Naziv: Kluboslavija Pasoš vs Cross-Event Pasoš — KOZMETIKA (sa strateškim implikacijama)

**Problem:** "Kluboslavija Pasoš" je specifičan brend koji vezuje meta-sistem za GDG Srbija/Kluboslavija identitet. "Cross-Event Pasoš" je generički deskriptivni naziv. Ako se sistem proširi van GDG-a, ili ako Kluboslavija brend evoluira, naziv postaje mismatch.

**Zašto ima strateških implikacija:** Ako je ambicija da Pasoš postane umbrella sistem za više sezoni ili više zajednica, "Kluboslavija" je previše specifičan i ograničava brendiranje. Ako je ambicija da ovo ostane GDG 2026 Srbija stvar — onda je "Kluboslavija" savršen, jer gradi lokalni identitet i in-group kulturu.

**Zašto je kozmetika u ovom trenutku:** Slug je `cross-event-pasos`, localStorage ključevi su `gdg_pasos_*`, UI naziv je `Kluboslavija Pasoš`. Ova neusklađenost nije problem za MVP ali postaje tehnički dug ako se naziv promeni nakon implementacije (refactoring localStorage ključeva je painful jer postoji live data korisnika).

**Alternativa / korekcija:** Odlučiti odmah, pre implementacije: (A) Kluboslavija Pasoš svuda — slug, ključevi, UI. Jasan GDG identitet, in-group feel, ne skalira van GDG. (B) GDG Sezona Pasoš — skalira po sezonama, neutralno, manje poetično. (C) Zadrži Kluboslavija kao UI brend, slug ostaje `cross-event-pasos`, ali dokumentuj da su ključevi `gdg_pasos_*` namerno namespace-ovani po organizaciji. Preporuka: opcija C — daje slobodu na oba nivoa, ali zahteva eksplicitnu dokumentaciju da ne bi bilo zabune u timu.

---

## Zaključak

**Verdikt: Drži uz korekcije**

Koncept je solidan, metafora je snažna, a tehnički pristup je proporcionalan ambiciji (browser-only, zero backend, kratka sezona). Dva rizika zahtevaju akciju pre implementacije.

**Blokeri za implementaciju:**

1. **Inter-game API standard (Rizik 6)** — Pre nego što se napiše i jedna linija Pasošа, mora postojati `pasos-sdk.js` (ili ekvivalentna dokumentacija sa copy-paste snippet-om) koji svaka buduća igra koristi. Bez ovog, automatski pečati su mrtvo slovo na papiru.

2. **localStorage persistencija (Rizik 3)** — Implementirati export/import JSON feature u MVP scope. Nije opcija — trofej koji nestaje čišćenjem cache-a nije trofej. Jedan dan implementacije, eliminiše strukturalni problem.

**Ide dalje sa sledećim korekcijama:**

- `pasos-sdk.js` u `shared/` direktorijumu sa slug whitelistom i write logikom — obavezno pre implementacije igara
- Export/import JSON za Pasoš state — u MVP
- Onboarding animacija pri prvoj poseti (3 frame) + konkretni CTA na retro claim
- Micro-copy uz retro claim dugme: *"Ovo je na tvoju savest"* (honor system, ne gating)
- Prazni slotovi dobijaju naziv + datum + "coming soon" vizualni marker
- html2canvas: `document.fonts.ready` pre renderovanja + silent-fail fallback
- Sve komunikacije prema korisniku: "Otvori Pasoš" nikad "Igraj Pasoš"
- Naziv: dokumentovati razliku između UI brenda (Kluboslavija Pasoš) i tehničkog namespace-a (`gdg_pasos_*`) — slug se ne menja

**Šta ostaje kako jeste:** Vizuelna estetika, win condition mapa (3/5/7 pečata), animacija flip efekta, tooltip na pečatima, screenshot sharing kao viralni vektor, ukupni scope i targetirana dužina sesije.
