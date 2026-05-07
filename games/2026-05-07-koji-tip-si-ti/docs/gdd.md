# GDD — Koji Tip Si Ti u MKDSLendu?

**Verzija:** 1.0  
**Autor:** Mile Mehanika  
**Datum:** 2026-05-07  
**Status:** Spreman za implementaciju

---

## 1. Quiz Flow (UI korak po korak)

```
[SPLASH SCREEN]
  ↓
  Naslov: "Koji Tip Si Ti u MKDSLendu?"
  Podnaslov: "8 pitanja. Jedan arhetip. Nula laskanja."
  Intro tekst (2 rečenice):
    "Svi koji dolaze u MKDSLend donose nešto različito.
     Šta ti donosiš?"
  CTA dugme: [Kreni]
  ↓
[PITANJE 1 od 8]
  ↓  (klik na odgovor — bez potvrde, bez back dugmeta)
[PITANJE 2 od 8]
  ↓
  ...
[PITANJE 8 od 8]
  ↓  (klik na poslednji odgovor)
[LOADING SCREEN]
  Tekst: "Analiziramo tvoj profil..."
  Trajanje: 1.5 sekundi (fake delay za dramatiku)
  ↓
[RESULT SCREEN]
  - Puni ekran, ime arhetipa velikim slovima
  - Kratak opis (2–3 rečenice)
  - Ikoničan citat arhetipa
  - CTA preporuka (link)
  - Dugme: [Podeli rezultat]
  ↓
[SHARE ACTION]
  - Tekst kopiran u clipboard
  - Potvrda: "Kopirano! Spremi za FB/IG."
  - Opcija: [Igraj ponovo]
```

**Napomene:**
- Nema back dugmeta u quiz toku — jednom kliknuto, ne vraća se
- `history.pushState` blokada na svakom koraku sprečava browser back (mobilni slučajan tap)
- `beforeunload` upozorenje ako korisnik pokuša da napusti pre završetka
- Bez frameworka — vanilla JS state mašina

---

## 2. Arhetipovi (6)

Naziv (srpski) — slug — skraćenica za matricu

| # | Naziv | Slug | Skr. |
|---|-------|------|------|
| 1 | DJ | `dj` | DJ |
| 2 | Permakultura Nerd | `pk` | PK |
| 3 | Sound Geek | `sg` | SG |
| 4 | Event Host | `eh` | EH |
| 5 | Slobodan Elektron | `se` | SE |
| 6 | Crew Builder | `cb` | CB |

> **Napomena o arhetip 5:** Originalnog "Curious Visitor" zamenjuje **Slobodan Elektron** — aktivan identitet koji istražuje sisteme bez unapred definisanog plana. Nije fallback nego tip koji je vredan po samoj svojoj nefiksiranosti. Detalji u sekciji 4.

---

## 3. 8 Pitanja sa odgovorima

### Q1 — Slobodno vreme
**Nalaziš se u nepoznatom gradu, imaš 2 slobodna sata. Šta radiš?**

- **A)** Tražim klub, bar ili mesto gde nešto svira — živu muziku, DJ set, bilo šta sa dobrim zvukom.
- **B)** Tražim pijacu, park ili baštu — nešto zeleno gde mogu da vidim kako grad uzgaja hranu.
- **C)** Pitam prvog zanimljivog tipa koga sretnem šta bi on radio, pa pratim.

### Q2 — Idealan MKDSLend vikend
**Zamišljaš idealan vikend u MKDSLendu. Koji element je neophodan?**

- **A)** Da postoji barem jedan set koji vredi pamtiti — dobre bine, dobar zvuk, prava energija.
- **B)** Da radim nešto rukama — zemlja, drvo, vatra, ili bašta — nešto što ostavlja trag.
- **C)** Da dovedem celu svoju ekipu i vidim kako se snalaze na novom mestu.

### Q3 — Zvuk
**Na eventu, set počinje. Zvuk je odličan. Šta primećuješ prvo?**

- **A)** Energija poda — da li plesači "love" muziku ili samo stoje.
- **B)** Detalje u miks-u — šta je u mid-rangeu, da li je bas čist, gde su efekti postavljeni.
- **C)** Ko je za aparatom i kako cela postavka izgleda iznutra.

### Q4 — Priroda
**MKDSLend ima i šumu i livadu. Kako ih koristiš tokom vikenda?**

- **A)** Šetam kad mi treba vazduh između setova — ali ne idem daleko od zvuka.
- **B)** To je pola razloga zašto sam tu — tlo, drveće, biodiverzitet. Gledam ko je tu od biljaka.
- **C)** Organizujem da ima aktivnosti napolju za ljude koji ne plešu — svako treba nešto za sebe.

### Q5 — Uloga u grupi
**Stigla je nova grupa na event i deluje izgubljena. Šta ti radiš?**

- **A)** Objanim ko svira i što pre ih odvučem na podijum.
- **B)** Ignorem — oni će se snaći. Ja sam zauzet nečim.
- **C)** Povežem ih s nekim iz svoje ekipe ko će ih uvesti u tok.

### Q6 — Problem-solving
**Tokom postavljanja zvuka nešto ne radi — hum u sistemu, loš kabl, nejasno odakle. Šta radiš?**

- **A)** Tražim šta u signal chain-u može biti uzrok — sistematično, od izvora do zvučnika.
- **B)** Zovem tehničara ili koga god zna — nije moje da kopam po kablovima.
- **C)** Dok neko drugi rešava tehnikum, organizujem ljude da problem ne utiče na program.

### Q7 — Šta donosiš
**Pozivu te na event koji ne poznaješ, prvi put. Šta tipično "uneseš" u prostor?**

- **A)** Muziku — u glavi, u razgovoru, ili bukvalno na USB-u.
- **B)** Pitanja — puno pitanja o tome kako mesto funkcioniše, ko je tu i zašto.
- **C)** Ljude — retko dolazim sam, a kad dođem, brzo napravim krug.

### Q8 — Jutro posle
**Vikend je završen. Sutradan ujutru, šta si ti?**

- **A)** Razmišljam o setovima — šta je prošlo, šta nije, šta bih promenio.
- **B)** Već planiram sledeće — lokacija, datum, ko dolazi, šta treba organizovati.
- **C)** Pričam sa novim ljudima koje sam upoznao — ili im šaljem poruku dok je sve još sveže.

---

## 4. Bodovna matrica (8×6)

Svaki odgovor dodeljuje +1 bod tačno jednom arhetip. Arhetip s najviše bodova na kraju pobeđuje.

| Pitanje | Tema | Odg. A (+1) | Odg. B (+1) | Odg. C (+1) |
|---------|------|-------------|-------------|-------------|
| Q1 | Slobodno vreme | DJ | PK | SE |
| Q2 | Idealan vikend | DJ | PK | CB |
| Q3 | Zvuk — percepcija | EH | SG | SG |
| Q4 | Priroda | DJ | PK | EH |
| Q5 | Uloga u grupi | DJ | SE | CB |
| Q6 | Problem-solving | SG | SE | EH |
| Q7 | Šta donosiš | DJ | SE | CB |
| Q8 | Jutro posle | SG | EH | CB |

**Distribucija bodova po arhetip:**

| Arhetip | Q1 | Q2 | Q3 | Q4 | Q5 | Q6 | Q7 | Q8 | Max |
|---------|----|----|----|----|----|----|----|-----|-----|
| DJ | A | A | — | A | A | — | A | — | 5 |
| PK | B | B | — | B | — | — | — | — | 3 |
| SG | — | — | B/C| — | — | A | — | A | 4 |
| EH | — | — | A | C | — | C | — | B | 4 |
| SE | C | — | — | — | B | B | B | — | 4 |
| CB | — | C | — | — | C | — | C | C | 4 |

> **Napomena Q3:** Odgovori B i C oba boduju SG (+1 svaki), jer oba opisuju tehničku percepciju zvuka. Odgovor A boduje EH. Ovo je namerno — Q3 je primarno SG/EH diferencijator.

**Maksimalni mogući skor = 8 (1 po pitanju). Skor 0 za arhetip je moguć.**

---

## 5. Tiesbreak Pravilo

**Odabrano pravilo: sekundarni skor na Q8 → Q7 → Q6 (prioritet poslednjih pitanja)**

### Procedura:

1. Izračunaj skor svih 6 arhetipova.
2. Ako jedan arhetip ima jedinstven maksimum → taj je pobednik.
3. Ako dva ili više arhetipova dele maksimum (tie):
   - Pobednik je onaj od tiesbreak kandidata koji je **bodovan na Q8**.
   - Ako ni Q8 ne razrešava (oba su bodovana ili ni jedan) → proveri **Q7**.
   - Ako ni Q7 ne razrešava → proveri **Q6**.
   - Ako su svi Q8/Q7/Q6 izjednačeni → **pobeda ide DJ-u** (hard-coded fallback, transparentno objašnjeno u kodu komentarom).

### Obrazloženje:
- Q8 i Q7 su situaciona pitanja na kraju quiza — u njima se jasnije kristališe identitet nakon što su ranija pitanja "zagrejala" igrača.
- Hard-coded fallback (DJ) je bolji od random() jer je ponovljiv i testabilan — isti input uvek daje isti output.
- Fallback je krajnje redak slučaj: zahteva potpuno ravnomerno rasipanje svih 8 odgovora bez ijednog dominantnog arhetipa.

### JS pseudokod:
```js
function getWinner(scores) {
  const max = Math.max(...Object.values(scores));
  const tied = Object.keys(scores).filter(k => scores[k] === max);
  if (tied.length === 1) return tied[0];

  // Tiesbreak: Q8 → Q7 → Q6
  for (const q of ['Q8', 'Q7', 'Q6']) {
    const scoredOnQ = tied.filter(arch => answersMap[q].winner === arch);
    if (scoredOnQ.length === 1) return scoredOnQ[0];
  }

  // Hard fallback
  return 'dj';
}
```

---

## 6. Opisi Arhetipova (za Result Screen)

### 1. DJ
**Naziv za prikaz:** DJ  
**Opis (result screen):**  
Zvuk je za tebe jezik, ne pozadina. Znaš šta znači da set "radi" i znaš kada ne radi — i to osećaš pre nego što to iko drugi primeti. U MKDSLendu tražiš ozvučenje, prostor za probe i ljude koji slušaju kako treba.

**Citat:** *"Loš zvuk je loša komunikacija."*  
**CTA:** → GDG igra *Setlista* (link placeholder) + MKDSLend Booking info

---

### 2. Permakultura Nerd
**Naziv za prikaz:** Permakultura Nerd  
**Opis (result screen):**  
Zemlja, kompost, polinatori i regenerativni sistemi — ovo ti nije hobi, ovo ti je način razmišljanja. MKDSLend vidiš kao živi laboratorij, ne kao vikend odmorište. Dok drugi traže program, ti gledaš u tlo.

**Citat:** *"Zemlja nije podloga. Zemlja je sistem."*  
**CTA:** → GDG igra *Šta Raste?* (link placeholder) + MKDSLend Permakultura radni vikend info

---

### 3. Sound Geek
**Naziv za prikaz:** Sound Geek  
**Opis (result screen):**  
Nisi nužno DJ, ali znaš razliku između sub-basa i mid-basa i imaš mišljenje o tome. Kablovi, miksete, akustika prostora — tvoja zona udobnosti. Voliš da razumeš sisteme iznutra, a ne samo da uživaš u rezultatu.

**Citat:** *"Signal chain je biografija zvuka."*  
**CTA:** → GDG igra *Signal Chain* (link placeholder) + MKDSLend tehničke radionice

---

### 4. Event Host
**Naziv za prikaz:** Event Host  
**Opis (result screen):**  
Ti si onaj zbog koga se ljudi dobro provode a da ne znaju zašto. Logistika, energija prostora, tajming — osećaš to instinktivno. MKDSLend za tebe nije destinacija nego platforma za ono što tek treba da se desi.

**Citat:** *"Dobar event je nevidljiv. Loš event je jedini koji svi primete."*  
**CTA:** → GDG igra *Program Menadžer* (link placeholder) + MKDSLend Event Hosting info

---

### 5. Slobodan Elektron
**Naziv za prikaz:** Slobodan Elektron  
**Opis (result screen):**  
Ne dolaziš po programu — dolaziš po mogućnostima. Istraživaš sisteme, postavljaš neočekivana pitanja i pronalaziš veze koje drugi ne vide. U svakoj zajednici, Slobodan Elektron je katalizator: nema fiksnu ulogu, ali sve malo pokrene.

**Citat:** *"Najzanimljiviji deo svakog mesta je ono što niko nije planirao."*  
**CTA:** → GDG intro igra *Prva Poseta* (link placeholder) + MKDSLend Open Weekend info

> **Dizajnerska napomena:** Ovaj arhetip NIJE fallback. Boduje se aktivno na Q1-C, Q5-B, Q6-B i Q7-B — igrač koji ga dobija je onaj ko eksplicitno bira istraživačke, nestrukturirane odgovore, ne onaj ko ne zna šta odgovara.

---

### 6. Crew Builder
**Naziv za prikaz:** Crew Builder  
**Opis (result screen):**  
Zajednica nije apstrakcija za tebe — to su konkretni ljudi koje si doveo, povezao i čuvaš. Mrežiš bez da mrežiš. MKDSLend vidiš kao mesto gde tvoja ekipa može da postane nešto veće od zbira pojedinaca.

**Citat:** *"Dolazim sam samo kad testiram novo mesto. Posle dolazim sa svima."*  
**CTA:** → GDG igra *Ko Je Ko?* (link placeholder) + MKDSLend Crew Residency info

---

## 7. Share Card Sadržaj

### Result Screen prikaz:
```
[Ime arhetipa — veliki serif font]
[Opis — 2–3 rečenice]
[Citat — italic, manja veličina]
[CTA link]
────────────────────────
[Dugme: Podeli rezultat]
[Dugme: Igraj ponovo]
```

### Clipboard tekst (kopira se klikom na "Podeli rezultat"):

Format za svaki arhetip:
```
[ARHETIP] — [citat]. Koji si ti u MKDSLendu? → https://mkdsl.games/koji-tip-si-ti
```

**Konkretni share tekstovi:**

| Arhetip | Share tekst |
|---------|-------------|
| DJ | `DJ — "Loš zvuk je loša komunikacija." Koji si ti u MKDSLendu? → https://mkdsl.games/koji-tip-si-ti` |
| Permakultura Nerd | `Permakultura Nerd — "Zemlja nije podloga. Zemlja je sistem." Koji si ti u MKDSLendu? → https://mkdsl.games/koji-tip-si-ti` |
| Sound Geek | `Sound Geek — "Signal chain je biografija zvuka." Koji si ti u MKDSLendu? → https://mkdsl.games/koji-tip-si-ti` |
| Event Host | `Event Host — "Dobar event je nevidljiv." Koji si ti u MKDSLendu? → https://mkdsl.games/koji-tip-si-ti` |
| Slobodan Elektron | `Slobodan Elektron — "Najzanimljiviji deo svakog mesta je ono što niko nije planirao." Koji si ti u MKDSLendu? → https://mkdsl.games/koji-tip-si-ti` |
| Crew Builder | `Crew Builder — "Dolazim sam samo kad testiram novo mesto." Koji si ti u MKDSLendu? → https://mkdsl.games/koji-tip-si-ti` |

### Share card (vizuelni) — odluka:
**Ne postoji .png card.** Deljenje radi kao čist tekst (clipboard) + URL. OG meta tag za link preview u FB/IG biće postavljen u HTML `<head>` (statički, ne per-arhetip). Ovo je eksplicitna odluka da se izbegne canvas complexity u okviru "Kompleksnost 1/5" ograničenja.

---

## 8. Edge Cases

### Edge case 1: Svi skorovi su 0
**Scenario:** Tehnički nemoguć pri normalnom igranju (svaki klik dodaje +1 nekom arhetip-u, quiz ima 8 pitanja). Međutim, može se desiti u dev/test modu ako se state korumpira.

**Handling:**
```js
if (max === 0) {
  // Prikaži Slobodan Elektron kao default
  // Jer: "nisi siguran" == istraživač, semantički najispravniji fallback
  return 'se';
}
```
Korisniku se prikazuje normalan result screen. Nema error poruke — iskustvo ne sme da se prekine.

---

### Edge case 2: Korisnik preskoči pitanje
**Rešenje:** Nema skip opcije — nema X, nema "preskoči" dugmeta. UI ne dozvoljava prelazak na sledeće pitanje bez klika na jedan od tri odgovora. Dugme "Sledeće" ne postoji — klik na odgovor je direktno navigacija.

**Ako JS buguje i pitanje ostane bez odgovora:**
- Taj Q se tretira kao da nije bodovao nikog (+0 za sve)
- Quiz se završava normalno sa 7 umesto 8 bodova u opticaju
- Tiesbreak pravilo ostaje isto

---

### Edge case 3: Browser back (mobilni)
**Rešenje:** `history.pushState` na svakom koraku quiza. Klik na browser back pokazuje browser-native dijalog:
```
"Da li si siguran? Tvoj progres neće biti sačuvan."
```
Realizovano kroz `window.addEventListener('beforeunload', ...)` i `window.addEventListener('popstate', ...)`.

---

### Edge case 4: Višestruki tie koji nije razrešen Q8/Q7/Q6
**Scenario:** Igrač odgovori tačno po 1–2 boda na 4 različita arhetipa, ni Q8/Q7/Q6 ne razrešava.

**Handling:** Hard-coded fallback → DJ. Komentar u kodu:
```js
// FALLBACK: Ultra-rare tie koji sekundarni skor ne razrešava.
// DJ je default po dizajnerskoj odluci (ne po poziciji u nizu).
// Ver. 1.0 — Mile Mehanika, 2026-05-07
```

---

## 9. Tehnički Summary za Dev

- **Scoring:** `scores = { dj:0, pk:0, sg:0, eh:0, se:0, cb:0 }` — increment na svakom kliku
- **Answers map:** Svaki Q ima objekat `{ A: 'arhetype_slug', B: 'arhetype_slug', C: 'arhetype_slug' }`
- **Winner:** `getWinner(scores)` funkcija (pseudokod u sekciji 5)
- **No frameworks, no npm** — vanilla JS ES6
- **No back button** — state je jednosmeran
- **Share:** `navigator.clipboard.writeText(shareText[winner])` — uz fallback `document.execCommand('copy')`
- **OG meta:** Statički `<meta property="og:image">` — jedno zajedničko preview image (CSS generisano ili placeholder)

---

## 10. Checklist pre coding-a

- [ ] Svaki arhetip ima URL za CTA (popuniti placeholder linkove)
- [ ] OG image placeholder pripremiti (1200×630, plain CSS card ili statički)
- [ ] Finalna URL struktura potvrditi (`/koji-tip-si-ti` ili sub-path)
- [ ] Ceca Čujku: 6 kratkih audio opisa za opcioni ambient na result screenu
- [ ] QA: Proći sve kombinacije Q8/Q7/Q6 tiesbreak scenarija

---

*GDD: Mile Mehanika | 2026-05-07 | Adresira: premortem (Nega)*
