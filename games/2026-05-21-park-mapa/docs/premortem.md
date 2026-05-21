# Premortem — Park Mapa

**Autor:** Nega Negovanović, Kritički Analitičar
**Datum analize:** 2026-05-21

---

## Ukupna Procena

**Drži uz korekcije — ali korekcije su supstancijalne.**

Koncept je arhitekturno hrabar i brand-koherentan na papiru. Problem je što su tri od četiri stubna rizika strukturne prirode — ne mogu se rešiti tuning-om, zahtevaju redizajn pre implementacije. Ako se uđe u impl fazu bez rešavanja scope-a i anti-abuse mehanike, isporuka neće biti stabilna.

---

## Showstopper Rizici

### 1. Scope je ubojit u impl sesiji

180+ Logbook karica + 20+ mini-priča po zoni x 9 zona + 4 NPC misije + 7-12 easter egg-ova dnevno + 5-stepeni rang sistem + 28-dnevni sezonski ciklus — sve ovo zajedno nije "jedna igra", ovo je živi servis sa sadržajem koji se meri čovek-nedeljama.

Implementacioni trigger je 09:00. Do 17:00 nema ni skeletalne verzije koja drži sve ove slojeve. Ono što će biti isporučeno biće ili:
- Fasada (vizualna mapa bez stvarne mehanike), ili
- Jedna zona funkcionalna, osam praznine, ili
- Poluzavršen sistem koji u produkciji puca pri prvom igraču

**Ovo je showstopper ako se scope ne reže agresivno pre početka.**

### 2. Dnevni Easter Egg Hunt bez anti-abuse = broken core loop od prvog dana

LocalStorage farming je trivijalan: otvoriš igru, sakupiš easter egg-ove, reloaduješ stranicu, sakupiš ponovo. Ako timestamp lock nije implementiran na serverskoj strani (a nema servera — vanilla JS, bez npm), jedina barijera je `localStorage.setItem('lastHunt', today)`. Ovo se obiđe brisanjem localStorage-a ili private browsing-om.

Posledica: igrači koji hoće da farme, farmaće. Igrači koji ne farme, osećaju se usporenim. Core retention mehanika (compulsion loop od 7-12 predmeta dnevno) gubi vrednost jer nisu scarce.

**Nema serverskog state-a = nema pouzdanog anti-abusea. Ovo treba biti svesna dizajnerska odluka, ne propust.**

### 3. Bina zona Kluboslavija = hardkodovani datumi u JS-u koji zahtevaju ručni deploy

Setlist Tabla sa turnejskim datumima i Avala 2026 ekskluziv u nedelji 20. jun — ovo nije dinamički sadržaj, ovo je statički JS objekat koji neko mora da edituje i komituje svaki put kad se datum promeni ili kad se dodaje novi nastup. Ako Gari nije taj neko, ili ako zaboravi, igrači vide pogrešne datume. Ako je Gari jedini koji to može, to je single point of failure za brand servis.

**Minimum: Bina zona mora čitati iz JSON config fajla koji je odvojen od game logike. Idealno: markdown ili JSON koji može da edituje i ne-developer.**

---

## Brand-Utility Kritika

### MKDSLend integracija — funkcioniše, ali samo kao identitet, ne kao driver

Park kao MKDSLend dom je koherentan. Problem je što fizički prostor identitet ne donosi nikakav gameplay benefit koji igrač oseća. "Kanonična home base" je narativna tvrdnja koja neće biti vidljiva igraču koji nikad nije bio u MKDSLend-u fizički. Bez eksplicitne veze (QR kod u prostoru koji otključava zonu, exkluzivni token za posetioce), digitalni park i fizički prostor su paralelni svetovi koji se nikad ne susreću.

**Brand sprega za MKDSLend je dekorativna bez offline-online bridge mehanike.**

### Kluboslavija / Bina — funkcioniše, ali krhko

Setlist Tabla je konkretan, vidljiv, koristan alat za fan koji prati Kluboslaviju. Avala 2026 ekskluziv je dobar hook. Problem je operativna krhkost (videti Showstopper #3) i što Bina zona na nivou 1 ne nudi ništa sem informacija koje postoje i na društvenim mrežama. Diferencirajuća vrednost dolazi tek sa višim zona-nivoima i ekskluzivnim sadržajem — koji treba biti produciran pre isporuke, ne naknadno.

**Bina funkcioniše kao brand tool samo ako je sadržaj ažuran i ekskluzivan. Bez toga je sporiji Instagram.**

### Guncati / Staklenici — najslabija od tri brand sprege

"Godina na Guncatima narativ" i "mesečni mikro-narativ, organski CTA" zvuče dobro u konceptu. U implementaciji: ko piše 12 mesečnih mikro-narativa? Kada? Ko ih unosi? Ako je odgovor "naknadno, videćemo", onda Staklenici zona na launch-u nema diferencirajući sadržaj od bilo koje druge zone i CTA je prazan.

**Organski CTA nije organski ako je placeholder. Staklenici zona treba ili kompletnu Season 1 narativnu seriju pre launch-a, ili treba biti zakljucana zona koja se "gradi" i otvara tek kad je sadržaj spreman.**

---

## Tehničke Opasnosti

### Canvas rendering sa 9 zona na mobilnom

Piksel-art svet koji "raste sa igračem" + parallax + particle sistemi (pretpostavljam za sezonske vizualne promene i "park grows" animacije) + Canvas rendering 9 simultanih zona = ozbiljan problem na mid-range Android uređajima. Bez LOD sistema, tile culling-a ili progressive rendering-a, mobilni igrači na Galaxy A seriji vide ispod 30fps. GDG publika nije na flagship uređajima.

**Konkretno: svaka zona mora imati static/animated state toggle. Animacije samo za aktivnu zonu u viewportu. Sve ostalo statični tile.**

### LocalStorage kao jedini persistence layer

28-dnevni sezonski ciklus, Logbook sa 180+ unosa, Park Budget, Zona-nivoi — sve ovo živi u localStorage-u. LocalStorage ima ~5-10MB limit, ali važnije: `localStorage.clear()` ili browser settings brisanje = izgubljen napredak bez oporavka. Za igrača koji je proveo 4 sezone i dobio Rang 5, ovo je katastrofalan UX event.

**Minimum: Export/import napretka kao JSON fajl. Bonus: iCloud/Google Drive sync ako se ikad migrira sa vanilla JS.**

### Web Audio API bez fallback-a

Safari iOS i neki Chromium derivati blokiraju Web Audio API dok nema user gesture-a. Ako ambient audio počinje automatski, pola mobilnih igrača nema zvuk i ne zna zašto. Ako ambient audio prati sezonski ciklus (što je logično za "ambient persistent experience"), ovo je vidljiv defekt od prvog dana.

**Obavezan AudioContext.resume() u prvom touch/click event-u. Mute/unmute dugme prominentno u UI-u.**

### Vanilla JS bez bundlera na velikoj kodi bazi

9 zona x (mini-priče + easter egg logika + NPC dijalog + progresija) = verovatno 3000-5000 linija JS-a ako je sve implementirano. Bez modularnog sistema (ni ESM imports nisu pouzdani u svim ciljnim kontekstima bez bundlera), ovo postaje jeden veliki fajl koji je nemoguće maintainovati. Bug u Šuma zoni znači čitanje 4000 linija.

**ESM module pattern je obavezan. Svaka zona kao zaseban modul. Čak i bez npm, `<script type="module">` radi u svim modernim browserima.**

---

## Gameplay Rizici

### "Ambient persistent experience bez win state" ne drži za GDG format

GDG igrač je jednom-dnevni igrač, ne dedicated gamer. Ambient persistent experience radi za igrače koji imaju intrinsic motivation da se vraćaju u svet. GDG format je "otvori, odigraj, zatvori" — igrač želi closure loop u sesiji.

Trenutna arhitektura nema jasno definisan dnevni closure. "Skupi Parktokene, park raste" je difuzno — rast parka je incrementalan i nevidljiv u jednoj sesiji. Dnevno Svetlo (jedna zona sa bonus-om) je dobar hook, ali nije dovoljan sam.

**Problem: igrač otvori igru, ne vidi šta se konkretno promenilo od juče, ne oseća progress, zatvori. Ovo je churn scenario za casual igrača.**

**Potrebno: Dnevni "šta je novo" splash — konkretna jedna stvar koja je danas drugačija, vidljiva, actionable. Ne lista sistema, jedna akcija.**

### Multi-layer arhitektura se urušava bez content pipeline-a

5 nivoa po zoni x 9 zona = 45 zona-stanja koja moraju biti dizajnirana, ilustrovana (piksel art CSS), i testirana. Sezonski reset dodaje novi set vizuala svaka 4 nedelje. NPC idle reakcije zahtevaju pisanje dijaloga za sve kombinacije "koliko dana je igrač bio odsutan". Networking Board 4 nedeljne misije = 4 misije x 52 nedelje = 208 misija godišnje ako se ne ponavljaju.

**Ovo je content treadmill koji zahteva dedicated content creator, ne samo developer. Ako je to jedan čovek (Gari), burnout je pitanje vremena, ne scenarij.**

### Prestige / Renovacija mehanika — churn umesto retention?

28-dnevni reset sa "vizueli se resetuju, NPC rutine resetuju, nova narativna serija" zvuči kao prestige. U praksi, casual igrač koji je gradio park 28 dana i vidi da se "reset" znači da park izgleda "prazno" ponovo — to nije reward, to je punishment. Renovacioni Žigom na kapijskoj tabli je previše subtilan reward za gubitak vizuelnog napretka.

**Prestige mora biti vidljivo superioran state, ne "počni iznova ali sa žigom". Razmotriti: zona-nivoi ostaju, ali se tema menja (prolećni park vs. jesenji park). Reset samo narrative/NPC, ne vizualni napredak.**

### Easter Egg Hunt mehanika: 7-12 objekata dnevno nije skalabilno

7-12 novih pozicija dnevno x 365 dana = 2555-4380 unikatnih pozicija godišnje ako se ne ponavljaju. Ako se ponavljaju, igrači koji igraju dugo znaju sve pozicije i mehanika postaje "klikni ista mesta". Ako proceduralno generišete pozicije, potreban je seed sistem koji garantuje da su pozicije achievable i ne preklapaju se sa UI elementima.

**Bez definisanog rešenja za poziciju generaciju, easter egg hunt postaje ili trivijalan (poznate pozicije) ili frustrirajući (random piksel hunting).**

---

## Preporuke

### P0 — Pre implementacije (blokeri)

1. **Scope cut na MVP zonu.** Launch sa 3 zone (Pult, Bina, Šuma), ne 9. Ostalo je "locked — u izgradnji" sa vizuelnim teaserom. Bolje 3 zone koje rade nego 9 koje su fasada.

2. **Bina zona konfiguracija u JSON.** `data/bina-setlist.json` sa turnejskim datumima. JS čita JSON, ne hardkoduje datume. Jedan fajl koji može editovati i non-developer.

3. **Easter Egg anti-abuse dizajnerska odluka.** Svesno odlučiti: (a) prihvatamo farming, fokus na casual igrača koji ne farma, ili (b) implementiramo timestamp + device fingerprint (nedovoljno za određene napredne, ali dovoljno za casual abuse). Dokumentovati odluku. Ne ostavljati nedefinisano.

4. **Dnevni closure definisan.** Pre implementacije, odgovoriti: šta igrač vidi i uradi u jednoj sesiji od 3-5 minuta koja mu daje osećaj "završio sam nešto danas"? Upisati kao formal design doc, ne samo koncept.

### P1 — U toku implementacije

5. **Canvas LOD od prvog piksela.** Samo aktivna zona animirana. Ostalo statični tile. Ovo nije optimizacija za kasnije, ovo je arhitekturna odluka koja diktira ceo rendering pipeline.

6. **ESM moduli za svaku zonu.** `zones/bina.js`, `zones/suma.js`, etc. Svaka zona export-uje `init()`, `tick()`, `activate()`. Centralni `park.js` orkestira.

7. **LocalStorage export/import od prvog dana.** Nije nice-to-have, ovo je retention feature. Igrač koji izgubi napredak neće se vratiti.

### P2 — Pre public release

8. **Staklenici narativna serija Season 1 kompletna pre launch-a.** Minimum 3 meseca sadržaja. Bez toga, zona je placeholder.

9. **Prestige redizajn.** Sezonski reset menja temu (vizuelni skin), ne briše napredak. "Jesenji park" ima drukčije boje od "prolećnog parka", ali isti nivo-5 zone ostaju vidljivo grade na istim lokacijama.

10. **"Šta je novo danas" splash screen.** Jedna stvar, ne lista. Može biti generisana iz Dnevnog Svetla sistema.

---

## Zaključak

Park Mapa je najambiciozniji GDG koncept gledano po dubini sistema. To je i najveći rizik.

Arhitektura je koherentna na konceptualnom nivou. Problem nije dizajn, problem je nesrazmera između scope-a koncepta i resursa implementacije. Sa jednim developerom, bez servera, i impl sesijom kao delivery mehanizmom, jedino što može biti isporučeno je skeleton — i skeleton mora biti dovoljno engaging da igrač dođe sutra.

Ako se scope reže na 3 zone, Bina se odvoji u JSON config, i easter egg anti-abuse pitanje dobije eksplicitni odgovor, ovo može biti najdugotrajnija GDG igra u katalogu. Ako se uđe sa punih 9 zona i 180+ Logbook karica kao ciljem, isporuka neće biti stabilna i igrač koji dođe prvog dana neće se vratiti drugog.

**Preporuka: impl sesija cilja V0.3 (3 zone, core loop, Logbook skeleton) — ne V1.0. V1.0 je sezonska isporuka, ne dnevna.**
