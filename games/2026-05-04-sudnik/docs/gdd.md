# GDD — Sudnik: Tribunal of Cards

---

## 1. Stanje igre (State Shape)

```json
{
  "session": {
    "caseIndex": 0,
    "totalCases": 10,
    "phase": "draw | play | verdict | reputation | gameover | summary"
  },
  "resources": {
    "masa": 50,
    "vlast": 50
  },
  "deck": [
    { "id": "string", "name": "string", "value": 0, "type": "string", "effect": "string" }
  ],
  "hand": [],
  "discardPile": [],
  "precedents": [
    {
      "id": "string",
      "name": "string",
      "description": "string",
      "effect": { "target": "balance|masa|vlast", "delta": 0, "condition": "string|null" },
      "casesRemaining": 3
    }
  ],
  "currentCase": {
    "id": "string",
    "crimeType": "string",
    "suspectWealth": "siromasan|srednji|bogat",
    "suspectAge": "mlad|sredovecni|star",
    "isRecidivist": false,
    "hasWitness": false,
    "descriptionTemplate": "string",
    "balanceScore": 0,
    "playedCards": [],
    "discardUsed": false,
    "verdict": "null|guilty|free"
  },
  "stats": {
    "totalGuilty": 0,
    "totalFree": 0,
    "guiltyByWealth": { "siromasan": 0, "srednji": 0, "bogat": 0 },
    "guiltyByAge": { "mlad": 0, "sredovecni": 0, "star": 0 },
    "guiltyByCrime": {},
    "guiltyRecidivists": 0,
    "freeRecidivists": 0,
    "precedentsCreated": []
  }
}
```

**Napomene:**
- `resources.masa` i `resources.vlast` su na skali 0–100. Početna vrednost: 50 svaki.
- `session.phase` je string enum koji kontroliše koje UI sekcije su aktivne.
- `precedents` je array aktivnih presedanata; kada `casesRemaining` dostigne 0, presedant se uklanja iz niza.
- `stats` se koristi isključivo za generisanje profila sudnika na kraju — ne utiče na gameplay direktno.

---

## 2. Kartice — Tipovi i Vrednosti

### Tipovi karata

Postoje 4 tipa kartice. `value` je ceo broj; pozitivan = ide u korist krivice (guilty), negativan = ide u korist nevinosti (free).

| Tip | Opis | Opseg value |
|---|---|---|
| `dokaz` | Materijalni dokaz — fizički predmeti, tragovi | -3 do +3 |
| `svedok` | Svedočanstvo — pouzdano ili upitno | -2 do +2 |
| `zakon` | Pravni argument — precedent, propis, analogija | -4 do +4 |
| `karakter` | Karakter optuženog — reputacija, kontekst | -2 do +2 |

### Starter Deck (10 karata)

Igrač počinje svaku partiju sa ovim tačnim deck-om (shuffled):

| ID | Naziv | Type | Value | Effect opis |
|---|---|---|---|---|
| `c01` | Tragovi na mestu zločina | `dokaz` | +2 | none |
| `c02` | Svedok koji je video sve | `svedok` | +2 | none |
| `c03` | Nedostatak alibi-ja | `zakon` | +3 | none |
| `c04` | Čist dosije | `karakter` | -2 | none |
| `c05` | Sumnjivi motiv | `dokaz` | +1 | none |
| `c06` | Nepouzdani svedok | `svedok` | -1 | none |
| `c07` | Tehnička greška u istrazi | `zakon` | -3 | none |
| `c08` | Pozajmljeni predmeti | `dokaz` | +1 | none |
| `c09` | Porodične veze | `karakter` | -2 | none |
| `c10` | Emocionalni apel | `karakter` | +1 | `vlast` -2 pri igranju |

**Starter deck ukupno:** 10 karata. Na početku svakog slučaja iz deck-a se vuče 5 karata u ruku.

### Presedant karte (generirane tokom igre)

Presedant karte se **dodaju u deck** posle svake presude. Nisu deo starter deck-a. Opisane u sekciji 3.

---

## 3. Presedant Sistem

### Generisanje presedant karte

Posle svake presude (KRIV ili SLOBODAN), sistem generiše **jednu novu karticu** koja se ubacuje u deck. Tip i value karte zavisi od kombinacije presude + tipa zločina:

| Presuda | Crime type | Generiše kartu tipa | Value |
|---|---|---|---|
| KRIV | nasilje | `zakon` | +2 |
| KRIV | krađa | `dokaz` | +2 |
| KRIV | korupcija | `zakon` | +3 |
| KRIV | ubistvo | `zakon` | +4 |
| KRIV | prevara | `svedok` | +2 |
| KRIV | nasilje u porodici | `karakter` | +2 |
| KRIV | sitna krađa | `dokaz` | +1 |
| KRIV | pobuna | `zakon` | +3 |
| SLOBODAN | nasilje | `karakter` | -2 |
| SLOBODAN | krađa | `zakon` | -2 |
| SLOBODAN | korupcija | `karakter` | -3 |
| SLOBODAN | ubistvo | `zakon` | -3 |
| SLOBODAN | prevara | `svedok` | -2 |
| SLOBODAN | nasilje u porodici | `karakter` | -2 |
| SLOBODAN | sitna krađa | `dokaz` | -1 |
| SLOBODAN | pobuna | `zakon` | -2 |

### Trajanje presedanta

**Svaki presedant važi tačno 3 slučaja** (`casesRemaining: 3`). Posle trećeg slučaja (bez obzira na ishod), presedant karta nestaje iz deck-a (premešta se u `discardPile` kao spent). Ovo sprečava locked state.

**Specijalna presedant efekat karta** se ne igra iz ruke — njen efekat se **automatski primenjuje** na balans pri otvaranju slučaja ako je taj presedant aktivan. Na karti u reci piše "Presedant (X slučajeva preostalo)".

### Lista presedant efekata

Svaka presedant karta ima `effect` objekat koji se primenjuje **automatski na početku slučaja** dok je aktivan:

| ID | Naziv presedanta | Efekat (pri otvaranju slučaja) | Trajanje |
|---|---|---|---|
| `p01` | Posedovanje = dokaz | `balance += 2` automatski | 3 slučaja |
| `p02` | Mladi su nevinost | Ako `suspectAge == 'mlad'`: `balance -= 2` | 3 slučaja |
| `p03` | Bogatstvo = sumnja | Ako `suspectWealth == 'bogat'`: `balance += 2` | 3 slučaja |
| `p04` | Recidiv = nemilosrdno | Ako `isRecidivist == true`: `balance += 3` | 3 slučaja |
| `p05` | Svedok = sveto | Sve `svedok` karte: `value *= 1.5` (zaokruženo) | 3 slučaja |
| `p06` | Zakon se tumači | Sve `zakon` karte: `value *= 0.5` (zaokruženo) | 3 slučaja |
| `p07` | Vlast prašta bogatima | Ako `suspectWealth == 'bogat'`: `balance -= 2` | 3 slučaja |
| `p08` | Masa traži pravdu | `masa += 5` ako proglasim KRIV; `masa -= 5` ako SLOBODAN | 3 slučaja |
| `p09` | Bez svedoka = sumnja | Ako `hasWitness == false`: `balance += 1` | 3 slučaja |
| `p10` | Karakter govori | Sve `karakter` karte: `value *= 2` | 3 slučaja |
| `p11` | Žrtva je sistem | `balance -= 1` automatski | 3 slučaja |
| `p12` | Nulta tolerancija | `balance += 1` automatski | 3 slučaja |
| `p13` | Vlast voli red | `vlast += 5` ako proglasim KRIV; `vlast -= 5` ako SLOBODAN | 3 slučaja |
| `p14` | Starci su mudri | Ako `suspectAge == 'star'`: `balance -= 2` | 3 slučaja |
| `p15` | Siromašni su nevini | Ako `suspectWealth == 'siromasan'`: `balance -= 2` | 3 slučaja |

**Napomena za implementaciju:** Presedant efekat koji modifikuje value karata (`p05`, `p06`, `p10`) se primenjuje na vrednost karte u trenutku njenog igranja — ne retroaktivno. Efekti tipa `balance += X` se primenjuju na `currentCase.balanceScore` odmah na početku slučaja, pre vuče karata.

---

## 4. Slučaj Sistem

### Proceduralna generacija slučaja

Svaki slučaj se generiše kombinacijom 3 nasumična atributa iz pool-a. Slučajevi se ne ponavljaju u istoj sesiji (prati se `usedCaseIds` array).

### Atributi slučaja

**crimeType** (8 opcija):
```
"nasilje", "krađa", "korupcija", "ubistvo", "prevara",
"nasilje u porodici", "sitna krađa", "pobuna"
```

**suspectWealth** (3 opcije): `"siromasan"`, `"srednji"`, `"bogat"`

**suspectAge** (3 opcije): `"mlad"`, `"sredovecni"`, `"star"`

**isRecidivist** (boolean): 30% šansa `true`

**hasWitness** (boolean): 50% šansa `true`

### Template opisi slučajeva

Opis slučaja generiše se spajanjem 3 template stringa. Format:

```
[intro_template(crimeType)] [suspect_template(wealth, age)] [witness_template(hasWitness)]
```

**intro_templates** (po crimeType):

| crimeType | Template string |
|---|---|
| nasilje | "Optuženi je uhapšen posle tuče u kojoj je žrtva zadobila telesne povrede." |
| krađa | "Pronađen sa ukradenom robom vrednom 400 dinara u džepu." |
| korupcija | "Primio mito od službenika opštine u iznosu koji se nije moglo dokazati." |
| ubistvo | "Prisustvovao incidentu u kome je jedna osoba izgubila život — okolnosti sporne." |
| prevara | "Prodavao lažne dokumente građanima koji su tražili posao." |
| nasilje u porodici | "Supruga prijavila povrede. Optuženi tvrdi da je bila nesreća." |
| sitna krađa | "Zatečen kako iznosi hleb iz magacina fabrike gde radi." |
| pobuna | "Učestvovao u javnom skupu koji je vlast proglasila nelegalnim." |

**suspect_templates** (kombinacija wealth + age):

| wealth | age | Template string |
|---|---|---|
| siromasan | mlad | "Optuženi: mladić bez posla, živi kod rodbine." |
| siromasan | sredovecni | "Optuženi: radnik koji nije primio platu tri meseca." |
| siromasan | star | "Optuženi: penzioner sa invaliditetom, sam živi." |
| srednji | mlad | "Optuženi: student, sin lokalnog trgovca." |
| srednji | sredovecni | "Optuženi: službenik, besprekoran dosije do sada." |
| srednji | star | "Optuženi: bivši profesor, dobro poznat u kvartu." |
| bogat | mlad | "Optuženi: sin uglednog gradskog savetnika." |
| bogat | sredovecni | "Optuženi: vlasnik fabrike sa vezama u upravi." |
| bogat | star | "Optuženi: penzionisani funkcioner sa još uvek aktivnim kontaktima." |

**witness_templates**:

| hasWitness | Template string |
|---|---|
| true | "Jedan svedok je prisutan i spreman da svedoči." |
| false | "Nema svedoka. Samo reč optuženog i reč tužioca." |

**isRecidivist** dodaje suffix rečenicu:

| isRecidivist | Suffix |
|---|---|
| true | "Ovo nije prvi put — optuženi ima prethodnu presudu." |
| false | *(nema suffix-a)* |

---

## 5. Numerički Balans — "Vaga"

### Računanje balance score

`balanceScore` počinje na 0 za svaki slučaj.

1. **Na početku slučaja** — primenjuju se svi aktivni presedanti (automatski efekti).
2. **Tokom igranja karata** — svaka odigrana karta dodaje svoju `value` na `balanceScore`:
   - Odigrana "u korist krivice" (guilty direction): `balanceScore += card.value`
   - Odigrana "u korist nevinosti" (free direction): `balanceScore -= card.value`
   - **Napomena:** Ako `card.value` je negativan i igra se u korist krivice, `balanceScore` se povećava za negativan broj (tj. efektivno smanjuje).
   - **Preporučena implementacija:** igrač vuče kartu na jednu od dve zone (GUILTY / FREE). Promena balance-a je uvek: `direction == 'guilty' ? +card.value : -card.value`.
3. **Pre presude** — igrač vidi `balanceScore` numerički i vizuelno na "Vagi".

### Prag za presudu

| balanceScore | Sistem preporučuje |
|---|---|
| >= +4 | Jako KRIV (crvena zona) |
| +1 do +3 | Blago KRIV (svetlo crvena zona) |
| 0 | Neutralno — igrač bira slobodno |
| -1 do -3 | Blago SLOBODAN (svetlo plava zona) |
| <= -4 | Jako SLOBODAN (plava zona) |

**Ključno:** Igrač **uvek može presuditi suprotno** od preporuke vage. Vaga je informacija, ne odluka. Presuda KRIV ili SLOBODAN je igrač pritisne dugme.

### Vizuelni prikaz vage (obavezan)

UI element koji prikazuje u realnom vremenu:
- Numerička vrednost `balanceScore` (npr. "+3" u crvenoj ili "-2" u plavoj boji)
- Horizontalna traka od -10 do +10, sa nulom u centru. Traka se boji crveno desno od nule (krivica) i plavo levo (nevinost).
- Traka se animira (CSS transition 0.2s ease) pri svakom igranju karte.
- Maksimalni vizuelni opseg: -10 do +10 (vrednosti van opsega se clampuju vizuelno ali ne numerički).

---

## 6. Masa i Vlast Reputation

### Početne vrednosti

```
masa:  50   (opseg: 0–100, game over ako padne na 0)
vlast: 50   (opseg: 0–100, game over ako padne na 0)
```

### Kako presude utiču na resurse

Svaka presuda (KRIV ili SLOBODAN) menja oba resursa. Promena zavisi od `crimeType` i `suspectWealth`. Tabela ispod definiše **punu promenu** (delta) koja se primenjuje odmah posle presude.

#### Tabela — Presuda KRIV

| crimeType | Masa delta | Vlast delta |
|---|---|---|
| nasilje | +8 | +5 |
| krađa | +5 | +3 |
| korupcija | +10 | -3 |
| ubistvo | +10 | +8 |
| prevara | +5 | +2 |
| nasilje u porodici | +6 | +2 |
| sitna krađa | -3 | +3 |
| pobuna | -8 | +12 |

#### Tabela — Presuda SLOBODAN

| crimeType | Masa delta | Vlast delta |
|---|---|---|
| nasilje | -5 | -3 |
| krađa | -3 | -2 |
| korupcija | -8 | +5 |
| ubistvo | -10 | -5 |
| prevara | -4 | -3 |
| nasilje u porodici | -4 | -2 |
| sitna krađa | +5 | -2 |
| pobuna | +10 | -10 |

#### Wealth modifier (applies on top)

| suspectWealth | Masa bonus | Vlast bonus |
|---|---|---|
| siromasan | +2 | -2 |
| srednji | 0 | 0 |
| bogat | -3 | +3 |

**Primer:** Presuda KRIV za `korupcija` + `bogat`:
- Masa: +10 + (-3) = +7
- Vlast: -3 + (+3) = 0

#### Presedant efekti na resurse (p08, p13)

Presedanti p08 i p13 dodaju bonuse **pored** gore navedenih delta-a, ako su aktivni.

### Game Over uslov

Igra se završava ODMAH (pre sledećeg slučaja) ako:
- `masa <= 0` → Game Over: "Masa te je okrenula leđima"
- `vlast <= 0` → Game Over: "Vlast te je smenila"

Oba resursa padaju na 0: "Pao si sa obe strane — ni narod ni vlast te ne prepoznaju"

Vrednosti su clamped na 0–100 (ne može preći 100 ni pasti ispod 0 osim kao game over trigger).

---

## 7. "Odbaci i Povuci" Mehanika

### Pravila

- Jednom po slučaju, tokom faze `play`, igrač može aktivirati "Odbaci i povuci".
- Igrač bira 1 ili 2 karte iz ruke.
- Odbačene karte idu u `discardPile`.
- Sistema vuče isti broj novih karata iz `deck`-a u ruku.
- Ako je `deck` prazan, `discardPile` (bez karata odigranih u trenutnom slučaju) se shuffluje i postaje novi `deck`.
- Akcija je praćena `currentCase.discardUsed = true` — igrač ne može koristiti ponovo u istom slučaju.
- **Cena:** Nema reputacionog penala. Jedina cena je da presedant karte koje su bile u "odbačenim" kartama nestaju iz ruke za taj slučaj.

### Vizuelni indikator

Dugme "Odbaci i Povuci" je vidljivo tokom faze play, ali postaje `disabled` i sivo nakon korišćenja. Tooltip: "Iskorišćeno za ovaj slučaj".

---

## 8. Profil Sudnika — Template Sistem

### 4 ose merenja

Na kraju igre (posle 10 slučajeva), sistem izračunava vrednosti na 4 ose:

| Os | Kako se računa | Opseg |
|---|---|---|
| **Strogost** | `(totalGuilty / 10) * 100` | 0–100 (0 = milostiv, 100 = nemilosrdan) |
| **Klasni bias** | `guiltyByWealth.bogat - guiltyByWealth.siromasan` | -max do +max |
| **Starosni bias** | `guiltyByAge.mlad - guiltyByAge.star` | -max do +max |
| **Recidivizam** | `guiltyRecidivists - freeRecidivists` | negativno do pozitivno |

### Kategorije po osama

**Strogost kategorije** (threshold):
- 0–30%: `"milostiv"`
- 31–60%: `"umeren"`
- 61–80%: `"strog"`
- 81–100%: `"nemilosrdan"`

**Klasni bias kategorije** (klasni_delta = guiltyByWealth.bogat - guiltyByWealth.siromasan):
- <= -2: `"favorizuje_bogate"` (kaznio više siromašnih nego bogatih)
- -1 do +1: `"neutralan_klasa"`
- >= +2: `"kaznio_bogate"`

**Starosni bias kategorije** (starosni_delta = guiltyByAge.mlad - guiltyByAge.star):
- <= -2: `"strog_prema_starima"`
- -1 do +1: `"neutralan_starost"`
- >= +2: `"strog_prema_mladima"`

**Recidivizam kategorije** (recidiv_delta = guiltyRecidivists - freeRecidivists):
- >= 2: `"bez_milosti_prema_recidivistima"`
- -1 do +1: `"neutralan_recidiv"`
- <= -2: `"veruje_u_rehabilitaciju"`

### 25 Template rečenica (matrica)

Format: `templateId: { strogost, klasni, starosni, recidiv, text }`

Sistem bira rečenicu koja **najbliže odgovara** svim 4 osama. Ako više rečenica odgovara, bira se prva po ID-u.

```javascript
const PROFILE_TEMPLATES = [
  // Nemilosrdni
  { id: "t01", strogost: "nemilosrdan", klasni: "kaznio_bogate",          starosni: "neutralan_starost",     recidiv: "bez_milosti_prema_recidivistima", text: "Sudija koji ne prašta — ni moćnima ni slabima. Zakon je bio tvoja religija." },
  { id: "t02", strogost: "nemilosrdan", klasni: "favorizuje_bogate",      starosni: "neutralan_starost",     recidiv: "bez_milosti_prema_recidivistima", text: "Sistem te je naučio ko je vredan slobode — a ko nije. Bogati su prolazili, ostali ne." },
  { id: "t03", strogost: "nemilosrdan", klasni: "neutralan_klasa",        starosni: "strog_prema_mladima",   recidiv: "bez_milosti_prema_recidivistima", text: "Mladost te nije ublažavala. Svako ko greši, plaća — bez obzira na godine." },
  { id: "t04", strogost: "nemilosrdan", klasni: "neutralan_klasa",        starosni: "strog_prema_starima",   recidiv: "bez_milosti_prema_recidivistima", text: "Godine nisu opravdanje. Starost ti nije donela milost — ni njima." },
  { id: "t05", strogost: "nemilosrdan", klasni: "neutralan_klasa",        starosni: "neutralan_starost",     recidiv: "veruje_u_rehabilitaciju",        text: "Kaznio si neumorno — ali drugi put si davao šansu. Kontradikcija je bila tvoja filozofija." },

  // Strogi
  { id: "t06", strogost: "strog",       klasni: "kaznio_bogate",          starosni: "neutralan_starost",     recidiv: "bez_milosti_prema_recidivistima", text: "Bogatstvo te nije kupilo, a greška se plaća. Tvoj sud je bio skup — ali pošten." },
  { id: "t07", strogost: "strog",       klasni: "favorizuje_bogate",      starosni: "strog_prema_mladima",   recidiv: "neutralan_recidiv",              text: "Mladi su ti izgledali opasno, a moć je bila respekt. Grad je to znao." },
  { id: "t08", strogost: "strog",       klasni: "neutralan_klasa",        starosni: "strog_prema_mladima",   recidiv: "neutralan_recidiv",              text: "Mladi su te plašili — možda opravdano. Sudija strogih principa i sumnjičavog pogleda." },
  { id: "t09", strogost: "strog",       klasni: "neutralan_klasa",        starosni: "neutralan_starost",     recidiv: "bez_milosti_prema_recidivistima", text: "Jednom ogrešen — zauvek sumnjiv. Ko se ponovi, nema šanse." },
  { id: "t10", strogost: "strog",       klasni: "kaznio_bogate",          starosni: "strog_prema_mladima",   recidiv: "neutralan_recidiv",              text: "Ni bogatstvo ni mladost nisu bila opravdanje. Samo činjenice su govorile." },

  // Umereni
  { id: "t11", strogost: "umeren",      klasni: "neutralan_klasa",        starosni: "neutralan_starost",     recidiv: "neutralan_recidiv",              text: "Balansiran sudija bez jasnih favorita. Da li je to pravda — ili oklijevanje?" },
  { id: "t12", strogost: "umeren",      klasni: "favorizuje_bogate",      starosni: "neutralan_starost",     recidiv: "neutralan_recidiv",              text: "Siromašni su češće odlazili u zatvor. Možda nisi ni primetio." },
  { id: "t13", strogost: "umeren",      klasni: "kaznio_bogate",          starosni: "neutralan_starost",     recidiv: "neutralan_recidiv",              text: "Moć nije bila zaštita pred tvojim stolom. Retko u ovom gradu." },
  { id: "t14", strogost: "umeren",      klasni: "neutralan_klasa",        starosni: "strog_prema_starima",   recidiv: "veruje_u_rehabilitaciju",        text: "Starima nisi verovao, ali si davao drugima šansu. Čudna jednadžba." },
  { id: "t15", strogost: "umeren",      klasni: "neutralan_klasa",        starosni: "strog_prema_mladima",   recidiv: "veruje_u_rehabilitaciju",        text: "Mladima si bio strog ali si verovao da se čovek može popraviti. Contradictio in adjecto." },

  // Milostivi
  { id: "t16", strogost: "milostiv",    klasni: "neutralan_klasa",        starosni: "neutralan_starost",     recidiv: "neutralan_recidiv",              text: "Sloboda je bila tvoj default. Grad te je zvao slabim — ti si to zvao humanošću." },
  { id: "t17", strogost: "milostiv",    klasni: "kaznio_bogate",          starosni: "neutralan_starost",     recidiv: "neutralan_recidiv",              text: "Siromašni su prolazili slobodni, bogati su plaćali. Možda jedini pravični sudija ovog grada." },
  { id: "t18", strogost: "milostiv",    klasni: "favorizuje_bogate",      starosni: "neutralan_starost",     recidiv: "neutralan_recidiv",              text: "Bogati su prolazili — siromašni su plaćali. I ti si verovao da si pravedan." },
  { id: "t19", strogost: "milostiv",    klasni: "neutralan_klasa",        starosni: "strog_prema_mladima",   recidiv: "neutralan_recidiv",              text: "Mladima nisi verovao, ali svima drugima si davao benefit of the doubt." },
  { id: "t20", strogost: "milostiv",    klasni: "neutralan_klasa",        starosni: "strog_prema_starima",   recidiv: "neutralan_recidiv",              text: "Starima nisi verovao da se poprave. Svima ostalima — bio si blago." },
  { id: "t21", strogost: "milostiv",    klasni: "neutralan_klasa",        starosni: "neutralan_starost",     recidiv: "bez_milosti_prema_recidivistima", text: "Prvi put — opraštao si svima. Ko se ponovio, nije imao sreće." },
  { id: "t22", strogost: "milostiv",    klasni: "neutralan_klasa",        starosni: "neutralan_starost",     recidiv: "veruje_u_rehabilitaciju",        text: "Čovek se može popraviti — to je bila tvoja vera. Grad te je smatrao naivnim." },

  // Specijalni (edge cases)
  { id: "t23", strogost: "nemilosrdan", klasni: "favorizuje_bogate",      starosni: "strog_prema_mladima",   recidiv: "bez_milosti_prema_recidivistima", text: "Sistem u tebi je govorio glasnije od savesti. Nisi bio sudija — bio si alat." },
  { id: "t24", strogost: "milostiv",    klasni: "kaznio_bogate",          starosni: "strog_prema_mladima",   recidiv: "veruje_u_rehabilitaciju",        text: "Paradoks: opraštao si, ali ne mladima ni bogatima. Tvoja filozofija ostaje misterija." },
  { id: "t25", strogost: "strog",       klasni: "favorizuje_bogate",      starosni: "strog_prema_starima",   recidiv: "veruje_u_rehabilitaciju",        text: "Vlast je bila zadovoljna tobom — a ti nisi znao zašto. Ili nisi hteo da znaš." }
];
```

### Algoritam za izbor template-a (closest match)

```javascript
function selectProfileTemplate(stats) {
  const strogost = calcStrogostCategory(stats);      // string
  const klasni   = calcKlasniCategory(stats);        // string
  const starosni = calcStarosniCategory(stats);      // string
  const recidiv  = calcRecidivCategory(stats);       // string

  // Score = broj podudarnih osa (0-4)
  let best = null;
  let bestScore = -1;

  for (const t of PROFILE_TEMPLATES) {
    let score = 0;
    if (t.strogost === strogost) score++;
    if (t.klasni   === klasni)   score++;
    if (t.starosni === starosni) score++;
    if (t.recidiv  === recidiv)  score++;
    if (score > bestScore) {
      bestScore = score;
      best = t;
    }
  }
  return best; // Uvek postoji match (minimum 0 podudarnosti → prvi template)
}
```

---

## 9. Progression Kriva

### Tok jedne sesije (10 slučajeva)

| Slučaj | Šta se dešava | Mehaničke promene |
|---|---|---|
| 1 | Intro fade-in, prva karta, nema presedanata | Starter deck (10 karata), ruka 5. Jednostavan slučaj (srednji wealth, nije recidivist) |
| 2 | Drugi slučaj, starter deck nepromjenjen | Prva presedant karta iz slučaja 1 je u deck-u |
| 3 | Presedant iz sl.1 je aktivan | Automatski efekat se primenjuje, igrač to vidi na vagi |
| 4 | Deck raste (2 presedant karte) | Složeniji slučajevi moguće (recidivist 30% šansa) |
| 5 | **Mid-point check** | Masa i Vlast se prikazuju istaknuto. Presedant iz sl.1 ističe (bio 3 slučaja) |
| 6 | Deck se konsoliduje | Presedant sl.3 aktivan, sl.1 uklonje |
| 7 | Moguće napetije karte (bogat/recidivist) | Igrač verovatno ima 3-4 presedant karte u deck-u |
| 8 | Deck se stabilizuje | Stari presedanti ističu, novi ulaze |
| 9 | Pretposlednji slučaj — napetost | Masa ili Vlast možda blizu 0 |
| 10 | **Finale** | Posle presude → Profil sudnika ekran |

### Pacing pravila

- **Slučaj 1 je uvek:** `crimeType = "krađa"`, `suspectWealth = "srednji"`, `isRecidivist = false`, `hasWitness = true` — tutorijalni slučaj, predvidiv, bez surpriza.
- **Slučaj 10 je uvek:** `crimeType = "pobuna"` — najdramatičniji tip koji maksimalno razdvaja Masu i Vlast.
- Slučajevi 2-9 su proceduralni.
- Pool kriminalnog tipa: svaki od 8 tipova mora se pojaviti bar jednom u slučajima 2-9 (shuffle pool pa crtaj, ne čisto nasumično).

### Unlocks / Napredak

Nema permanent unlock-ova između sesija. Svaki run je fresh. Replayability dolazi iz različitih presedant izbora i deck filozofije.

---

## 10. Win/Lose Summary

### Game Over ekran

**Trigger:** Masa ili Vlast pada na 0.

**Sadržaj:**

```
[Tamna pozadina, jedina lampa gasi se animacijom 1.5s]

SMENJEN SA FUNKCIJE

Uzrok: [Masa te je okrenula leđima. | Vlast te je smenila. | Izgubio si oba.]

Presuđeno slučajeva: X/10
Kriv: X  |  Slobodan: X

[Statistika resursa:]
Masa: X/100 [traka]
Vlast: X/100 [traka]

[Dugme: NOVI SLUČAJ]
```

**Ne prikazuje** Profil sudnika — jer nije završio 10 slučajeva, nema dovoljno podataka.

### Completion ekran (pobeda — preživi svih 10 slučajeva)

**Trigger:** `caseIndex == 10` i oba resursa > 0.

**Sadržaj:**

```
[Sporo fade-in bele pozadine — jedini beli ekran u igri]

PROFIL SUDNIKA

[Animirani tekst, slovo po slovo, 0.05s per char:]
"[selectedTemplate.text]"

────────────────────────────────────────
STATISTIKA
Presuđeno: 10 slučajeva
Kriv: X (X%)   Slobodan: X (X%)

Masa: X/100
Vlast: X/100

Najčešći zločin u tvojim presudama: [crimeType]
Presedanti koje si stvorio: [lista naziva presedanata, comma-separated]

────────────────────────────────────────
[Dugme: IGRAJ PONOVO]
[Dugme: PODELI (kopira tekst u clipboard)]
```

### PODELI dugme — clipboard tekst format

```
"[selectedTemplate.text]"
— Sudnik: Tribunal of Cards | Slučajevi: 10 | Kriv: X% | Masa: X | Vlast: X
https://mkdsl.github.io/gari-daily-games/
```

---

## Appendix: Konstante za config.js

```javascript
// Sve tuning vrednosti — NE hardcode-ovati u logici

export const CONFIG = {
  TOTAL_CASES: 10,
  STARTING_MASA: 50,
  STARTING_VLAST: 50,
  STARTING_DECK_SIZE: 10,
  HAND_SIZE: 5,
  PRECEDENT_DURATION: 3,        // slučajeva
  MAX_CARDS_TO_PLAY: 3,
  MAX_CARDS_TO_DISCARD: 2,

  // Vaga vizuelni opseg
  BALANCE_DISPLAY_MIN: -10,
  BALANCE_DISPLAY_MAX: +10,

  // Prag boja na vagi
  BALANCE_STRONG_THRESHOLD: 4,  // |score| >= 4 → jako KRIV/SLOBODAN
  BALANCE_MILD_THRESHOLD: 1,    // |score| 1-3 → blago

  // Recidivist šansa
  RECIDIVIST_CHANCE: 0.30,
  WITNESS_CHANCE: 0.50,

  // Wealth modifier tabela
  WEALTH_MODIFIERS: {
    siromasan: { masa: +2, vlast: -2 },
    srednji:   { masa:  0, vlast:  0 },
    bogat:     { masa: -3, vlast: +3 }
  },

  // Animacije (ms)
  CARD_PLAY_ANIM_MS: 200,
  BALANCE_ANIM_MS: 200,
  VERDICT_ANIM_MS: 600,
  PROFILE_CHAR_DELAY_MS: 50,
  GAMEOVER_LAMP_MS: 1500
};
```
