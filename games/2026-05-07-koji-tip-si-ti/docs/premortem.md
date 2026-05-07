# Premortem — Koji Tip Si Ti?

## Verdict: DRŽI UZ KOREKCIJE
Concept je čvrst i share logika postoji — ali matematika arhetipova i jedan tehnički problem mogu da sruše iskustvo pre nego što igra uopšte postane viralna.

---

## Rizici po prioritetu

### SHOWSTOPPER (zaustavlja ceo projekat ako se desi):
- **Matematika: 6 arhetipova × 8 pitanja = prevelik rizik tiesbreak-a.** Ako igrač rasporedi odgovore ravnomerno (što je čest slučaj kod generičnih pitanja), dva arhetipa će imati isti skor. Concept ne definiše tiesbreak strategiju — JS će ili baciti greška ili uvek uzeti prvog u nizu (defaultni `Curious Visitor` jer je #5, ne jer odgovara igraču). Ovo treba rešiti pre coding-a: ili tiebreak po sekundarnom skoru, ili redefinisati pitanja da forsiraju diferencijaciju.

### VISOKI RIZIK (može uništiti igrivost/vrednost):
- **Curious Visitor kao null arhetip.** Opis kaže "nisi siguran šta si" — što znači da će ga dobiti svako ko odgovara neodlučno ili čiji profil ne dominira jednom kategorijom. Ako 40%+ igrača dobije ovaj arhetip, share vrednost pada na nulu (niko ne deli "nisam siguran šta sam"). Rešenje: repozicionirati Curious Visitor kao aktivan identitet ("istraživač"), ne kao fallback.
- **FB share bez share card-a.** Concept pominje copy-paste tekst format, ali bez vizuelnog card-a (OG image) FB/IG link preview izgleda generično. Na mobilnom scroll-u tekst share bez slike prolazi neprimećeno. Nema .png u repou po tehničkom kontekstu — to znači nema card-a. Ovo treba eksplicitno odlučiti: ili dinamički canvas card (JS, izvodljivo), ili prihvatiti da share radi samo kao link.

### SREDNJI RIZIK (degradira iskustvo, ali radi):
- **"MKDSLend" brend nije samoobjašnjiv.** Korisnik koji dolazi sa FB-a i ne zna šta je MKDSLend neće imati kontekst. Intro (2 rečenice po concept-u) nije dovoljno za onboarding stranaca. Rizik: quiz radi kao retention alat za postojeću zajednicu, ne kao acquisition. Ako je cilj acquisition, treba jedna rečenica više o tome šta je MKDSLend.
- **Mobile state bez frameworks.** Vanilla JS quiz bez routing-a: ako korisnik slučajno tap-uje "back" na telefonu (browser back, ne quiz back), gubi progres i nema recap. Concept kaže "bez back dugmeta" ali ne adresira browser navigation. Treba `history.pushState` blokada ili barem upozorenje.

---

## Konkretne korekcije (DRŽI UZ KOREKCIJE):
- Definisati tiesbreak pravilo u GDD pre nego što Mile piše matricu (npr. sekundarni skor ili "poslednji arhetip koji je vodio")
- Repozicionirati Curious Visitor opis: izbaciti "nisi siguran šta si", zameniti s aktivnim kvalitetom
- Odlučiti eksplicitno: canvas share card (da/ne) — ako ne, ukloniti FB/IG iz očekivanja
- Dodati `beforeunload` / `history.pushState` zaštitu od accidental back na mobilnom
