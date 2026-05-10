# Premortem — Kluboslavija Pasoš

*Nega Negovanović — kritička analiza, iteracija 1*

---

## Steelmanning koncepta

Kluboslavija Pasoš nije igra — on je **meta-sloj koji igre čini vrednijim retroaktivno**. Svaki GDG event ima svoju standalone igru, ali Pasoš im daje narativ i kontinuitet: bio si tu, ostavio si trag, sezona ima smisao. Ključna snaga je u tome što sistem funkcioniše i za prošlost (retroaktivni claim) i za budućnost (automatski pečat), što znači da ni novi ni stari igrač ne osećaju da su propustili voz. Vizuelni jezik pasoškog booklet-a je odmah čitljiv svakome — nema tutorijal, nema onboarding, kontekst je u samom predmetu. Ako se dobro izvede, Pasoš postaje razlog zašto neko želi da dođe na sledeći event.

---

## Analiza rizika

### 1. Integritet bez validacije — SREDNJI RIZIK

**Problem:** Dugme "Odigrao/la sam ovo" za prošle igre ne proverava ništa. Igrač koji nikad nije video Avala Run igru može da klikne i dobije pečat.

**Zašto je problem:** Vrednost pečata počiva na percepciji da su zasluženi. Ako se pročuje da je sistem honor-based, pečati gube statusnu težinu — posebno "Crew Member" tier koji pretenduje da znači nešto unutar zajednice. Nije showstopper jer GDG nije kompetitivni kontekst, ali ako nagrada ima ikakav ekskluzivni signal (avatar frame koji se vidi drugima), lakoća dobijanja taj signal degraduje.

**Alternativa / korekcija:** Umesto tehničke validacije (koja je nemoguća za prošle evente bez backend-a), uvedи **социjalni pritisak kao jedini mehanizam**: tooltip na dugmetu kaže "Ovo je za ljude koji su stvarno bili tu — čast sistema." Uz to, retroaktivni claim je vizuelno drugačiji od auto-pečata — možda drugačija boja ili ikonica koja naznačuje "self-reported". Vrednost sistema ostaje, ali niko ne pravi iluziju verifikacije. Ako se u budućnosti uvede account sistem, ovo se može pooštriti.

---

### 2. Nula pečata na startu = prazna stranica — SREDNJI RIZIK

**Problem:** Igrač koji dolazi na cross-event-pasos URL bez ijedne prethodno odigrane igre vidi prazan booklet sa kružićima bez sadržaja.

**Zašto je problem:** Prazan state je najkritičniji UI momenat — u prvih 10 sekundi igrač odlučuje ostaje li. Booklet koji izgleda poluisprazan bez konteksta može delovati kao broken feature, ne kao poziv. Demotivisanost je realna ako igrač ne vidi path forward — šta da klikne, šta da uradi.

**Alternativa / korekcija:** Empty state nije prazan — on je **pozivnica**. Svaki prazan slot ima micro-copy: za prošle igre "Igrao si? Potvrdi pečat" (CTA odmah), za buduće "Dolazi [datum] — sačuvaj mesto." Uz to, prva animacija otvaranja pasošа prikazuje ne prazne strane nego **ukratko šta te čeka** — jedan splash screen sa "X eventa, X šansa za pečat." Igrač odmah vidi da ovo nije bug, nego onboarding.

---

### 3. Lokalizacija nagrade u localStorage — SHOWSTOPPER (operativno), SREDNJI (dizajn)

**Problem:** `gdg_crew_member: true` i svi pečati žive isključivo u browser localStorage jednog uređaja. Promena uređaja, incognito, clear browsing data — sve briše progres. "Crew Member" titula nema nikakvu portabilnost.

**Zašto je problem:** Ovo je jedini pravi showstopper u tehničkom smislu, ali samo ako se Pasoš prezentuje kao **trajna isprava**. Metafora pasošа podrazumeva dokument koji traje, koji se nosi. localStorage je po definiciji ephemeral. Ako igrač dobije "Crew Member" na laptopu, dođe na event sa telefonom i pokaže prazan pasoš, sistem je sebe diskreditovao.

**Alternativa / korekcija:** Tri opcije, po prioritetu:
1. **Export koda** — po dostizanju nagrade generiše se kratki alfanumerički kod (hash od slug+datum+random salt, bez backend-a) koji igrač može da snimi i unese na novom uređaju. Nije foolproof ali je jednosmerna portabilnost.
2. **QR code pasoša** — screenshot koji se skenira importuje state. Kompleksno ali konsistentno sa pasoš metaforom.
3. **Eksplicitno upozorenje** — u UI jasno stoji "Pasoš živi u ovom browser-u. Sačuvaj screenshot kao rezervu." Ako ne postoji ambicija trajnosti, bar upravljaj očekivanjima.

Minimum koji mora ući u dizajn: opcija 3 + poziv na screenshot share (koji ionako postoji).

---

### 4. html2canvas dependency — KOZMETIKA (izvedba), SREDNJI (edge cases)

**Problem:** html2canvas je ~200KB overhead, ima poznate probleme sa custom fontovima, pixel-art renderingom, i shadow-dom elementima. Može da produži load time i da isporuči screenshot koji izgleda lošije od stvarnog UI-a.

**Zašto je problem:** Share funkcionalnost je jedini viralni vektor Pasoša. Ako screenshot izgleda grdo (font nije loadovan, boje su off, pixel-art je blurry) — deljeni sadržaj radi suprotno od namere. Na sporim vezama, 200KB extra može da produbi LCP problem.

**Alternativa / korekcija:** Primarni alternativni plan koji ne zahteva eksternu biblioteku: **pre-generisana SVG/Canvas šablona**. Umesto da renderuješ HTML u sliku, generiši sliku direktno u `<canvas>` koristeći native Canvas API — iscrtaj pozadinu, boje, pečate i tekst programski. Ovo je ~0KB overhead, deterministički output, i radi konzistentno cross-browser. Fallback ostaje html2canvas samo ako native pristup ne može da reprodukuje pixel-art fidelnost. Procena: native Canvas rešenje je ovde 2-3 dana rada ali eliminiše dependency rizik u potpunosti.

---

### 5. Previše placeholder stranica — SREDNJI RIZIK

**Problem:** Ako Pasoš ima 10+ budućih event slotova koji su prazni, vizuelni utisak je booklet koji je 80% prazan prostor i 20% sadržaj.

**Zašto je problem:** Kontraintuitivno radi od namere — umesto da motiviše, prazan booklet sugeriše nedovršen proizvod. Specifično na prvoj poseti: igrač otvori pasoš, vidi 3 pečata koja može da claim-uje i 8 praznih slotova bez datuma i bez sadržaja. Pasoš izgleda kao mockup, ne kao produkt.

**Alternativa / korekcija:** Prikaži samo **poznate evente + jedan "coming soon" slot** koji je vizuelno drugačiji od placeholder-a za konkretan event. Ne prikazuj stranice za evente koji nisu objavljeni — stranice se dodaju kako se eventi objavljuju. Alternativno, ako je statična struktura neophodna, eventi bez datuma imaju **drugačiji vizuelni tretman** (npr. zamagljeno, bez naslova, sa "Season 2026" watermark-om umesto praznog kruga). Ovo čuva doživljaj kompletnog dokumenta.

---

### 6. Inter-game API bez koordinacije — SHOWSTOPPER

**Problem:** Buduće igre moraju samostalno da znaju i poštuju localStorage slug konvenciju (`gdg_pasos_[slug]`) da bi pečat bio upisan. Ne postoji formalizovana specifikacija — postoji samo ova linija u concept.md.

**Zašto je problem:** Ovo je jedini pravi arhitekturni showstopper. Jedan dev koji napravi igru za GDG event u julu 2026, bez pristupa ovom concept.md-u ili bez eksplicitnog briefinga, neće pisati u `gdg_pasos_` namespace. Ili će pogešiti slug. Ili će zaboraviti. Rezultat: pečat se ne pojavljuje u Pasošu, igrač ne razume zašto, sistem je tiho broken. Cross-event integracija koja se oslanja na neformalni dogovor je krhka po definiciji.

**Alternativa / korekcija:** Mora da postoji **shared JS modul / snippet** koji svaka igra importuje — jednolinijski API:
```js
import { stampPassport } from '../shared/passport.js';
stampPassport('avala-run', { score: 420 });
```
Modul enkapsulira localStorage logiku, slug normalizaciju, i format objekta. Nije backend, nije server — samo zajednički client-side utility koji živi u repo-u. Svi game devovi dobijaju snippet u brief-u. Bez ovog modula, Pasoš sistem se raspada sa svakom novom igrom koja ne prati standard.

---

### 7. Zanr "nije prava igra" — KOZMETIKA

**Problem:** Igrač koji dođe na cross-event-pasos URL očekujući gameplay dobija interaktivni booklet. Klik, animacija, tooltip — ali ne postoji game loop u klasičnom smislu.

**Zašto je problem:** Rizik je realan ali manji nego što izgleda. GDG publika koja dolazi na pasoš URL dolazi iz konteksta — videla je link na eventu ili u recap postu, ne iz app store-a. Kontekst uokviruje očekivanja. Pravo razočaranje nastaje samo ako se Pasoš marketinški pozicionira kao "igra" umesto kao "tvoj profil u GDG sezoni".

**Alternativa / korekcija:** Korekcija je **u copy-u, ne u dizajnu**. Nikad ne zovi Pasoš "igrom" — zovi ga "tvojom knjižicom sezone", "GDG putnom ispravom", "personalnim rekordom". Landin page ili meta opis koji kaže "Pratimo GDG 2026 zajedno — svaki event, jedan pečat" ne stvara pogrešna očekivanja. Žanr label "Meta-collection / Progression Experience" iz concept.md je tačan — on samo ne sme da se komunicira kao game.

---

### 8. Naziv: Kluboslavija Pasoš vs Cross-Event Pasoš — SREDNJI RIZIK

**Problem:** "Kluboslavija Pasoš" vezuje metahiku za specifičan brend/projekat (Kluboslavija), dok slug ostaje `cross-event-pasos`. Ova disonanca sugeriše da naziv još nije stabilan.

**Zašto je problem:** Ako "Kluboslavija" nije etabliran brend koji GDG publika prepoznaje, naziv zvuči interno — kao dev in-joke koji ne komunicira vrednost spolja. Nasuprot tome, "Cross-Event Pasoš" je deskriptivan i odmah čitljiv. Sa druge strane, ako Kluboslavija ima identitet i community, naziv može biti feature a ne bug — insider signal koji gradi tribal belonging. Problem je nekonzistentnost: concept.md koristi oba naziva u isto vreme.

**Alternativa / korekcija:** Donesi odluku pre implementacije jer naziv utiče na: URL strukturu, localStorage namespace (ako se brend ikad menja), marketing copy, i social share tekstove. Preporuka: **"GDG Pasoš 2026"** kao primarni javni naziv (jasan, brandiran, godišnji), a "Kluboslavija" kao flavor/interno ime za hard-core community layer. Slug ostaje `cross-event-pasos` kao tehnički identifier i ne mora da se menja.

---

## Zaključak

**Verdikt: Drži uz korekcije**

Konceptualna osnova je čvrsta — Pasoš rešava realan problem (GDG eventi su izolovani, bez meta-sloja koji ih vezuje) na intuitivan, vizuelno koherentan način. Nije igra koja se takmiči sa igrama, nego sloj koji igrama daje vrednost. To je dobar dizajn.

Međutim, dva showstopper-a moraju biti rešena pre nego što implementacija počne:

**Blokeri za implementaciju:**
1. **Shared passport.js modul** — mora da postoji kao zajednički utility koji sve buduće igre importuju. Bez ovog, inter-game koordinacija je neformalni dogovor koji će se pokvariti.
2. **localStorage ephemeralnost** — mora biti eksplicitno adresirana u UI (upozorenje + screenshot poziv) kao minimum, ili export kod kao bolji minimum. "Crew Member" titula ne može biti pozicionirana kao trajna bez ikakvog mehanizma portabilnosti.

**Ide dalje sa sledećim korekcijama koncepta:**
- Retroaktivni claim pečati su vizuelno distinktivni od auto-pečata (boja/ikonica), bez pretenzije na verifikaciju
- Empty state ima aktivni onboarding copy, ne prazan booklet
- Placeholder stranice za neannounced evente su skrivene ili vizuelno drugačije tretirane
- Screenshot share je pozicioniran kao "rezervna kopija pasoša", ne samo kao social feature
- Naziv se finalizuje pre implementacije — preporuka "GDG Pasoš 2026" kao primarni, "Kluboslavija" kao community layer
- html2canvas se istražuje native Canvas alternativa paralelno sa implementacijom
- Sav marketing copy izbegava reč "igra" za Pasoš sam po sebi
