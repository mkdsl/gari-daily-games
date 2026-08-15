# Game Design Document: Crew Recruiter — Izgradi Ekipu

**Datum:** 2026-08-14
**Agent:** Mile Mehanika
**Input:** `docs/concept.md` (finalna, korigovana verzija) + `docs/premortem.md` (Nega, verdikt: DRŽI UZ KOREKCIJE)
**Stage:** concept → impl handoff

---

## 0. Premortem adresiranje (pre svega ostalog)

Nega je u premortem-u dala 3 CRITICAL nalaza. R2 (7 vs 5 uloga kontradikcija) i R3 (netačna "nije rađeno u katalogu" tvrdnja + nedovoljna diferencijacija) su već rešeni u finalnoj verziji concept.md — 5 uloga svuda, i "Diferencijacija naspram Ekipa Noći / Avala Crew" sekcija sa 3 konkretne mehaničke razlike. Ostaje **R1 — state mašina za 6 rundi vs 5 slotova** — to je glavni fokus ovog GDD-a i rešava se detaljno u Sekciji 1.

Dodatno, Gari mi je dao 5 "red line" uslova koje MORAM eksplicitno rešiti pre nego što ovaj GDD ide u impl:

1. **State mašina (6 rundi / 5 slotova)** — Sekcija 1.
2. **Modul/LOC target** — 25–40 modula, 8000–12000 JS linija (Sekcija 12) — ovo ISPRAVLJA concept.md liniju "20–28 modula" (Kompleksnost sekcija concept.md-a), koja je pisana pre nego što je Gari finalizovao GDG projektni standard za single-layer igre. Concept.md se ne menja retroaktivno (nije moja nadležnost), ali ovaj GDD je autoritativan za Jovin impl budžet.
3. **Single-layer opravdanje** — Sekcija 11.
4. **Tagline usklađivanje** — Sekcija 7.2 bira JEDNU kanonsku verziju.
5. **"Completed run" definicija** — Sekcija 8.1.

---

## 1. Core mehanike — Draw / Assign / Resolve / Score ciklus

### 1.1 Osnovni ciklus (svaka od 6 rundi)

```
1. DRAW    — izvuci 3 karte iz špila (30-karte deck, bez reshuffle-a — vidi 1.4)
2. ASSIGN  — svaku od 3 izvučenih karata: postavi na 1 od 5 slotova ILI odbaci (graveyard)
3. RESOLVE — izračunaj Vibe Score doprinos za CEO trenutni roster (Sekcija 5)
4. SCORE   — Vibe Score += roundDelta, clamp [0, 100]; ako Vibe == 0 → runda je poslednja (loss ending)
5. ADVANCE — phase_index += 1 (Setup → Soundcheck → Opening → Climax → Breakdown → Recap)
```

Runda 6 (Recap) se rešava isto kao svaka druga — posle Recap Resolve/Score, igra ide direktno na Ending (Sekcija 7), bez posebnog 7. koraka.

### 1.2 State mašina — 6 rundi, 5 slotova (REDLINE #1, glavna odluka ovog GDD-a)

**Odluka (usvajam preporučeno rešenje iz brief-a, bez izmena):**

- Svaki od 5 slotova je popuniv **više puta** tokom partije. Karta dodeljena u rundi 2+ na već popunjen slot **PREPISUJE** staru kartu: stara karta ide u `graveyard[]` i njen doprinos prestaje odmah (ne broji se u toj ni ijednoj narednoj rundi).
- Zamena (churn) ima cenu: **-3 Vibe** odmah tog kruga, po svakoj zameni (ne po slotu — ako igrač u istoj rundi zameni 2 slota, to je -6, itd.). Maksimalno 3 zamene po rundi jer se dodeljuju samo 3 izvučene karte.
- **Resolve svake runde računa CEO trenutni roster** — sumu svih trenutno popunjenih slotova (bez obzira u kojoj rundi je koja karta stigla), ne samo novododeljeni slot. Vibe Score odražava "kako crew radi TRENUTNO", ne istoriju popunjavanja.

**Zašto ovo rešenje i ne alternativa ("slot se popuni jednom, ostaje ceo ostatak igre"):** Ta alternativa bi značila da runde 2–6 nemaju stvarnu odluku čim je 5 slotova popunjeno (obično do runde 2–3, pošto se izvlači 3 karte po rundi) — "Draw 3 karte" u rundama 4, 5, 6 bi bio kozmetički čin bez posledice. Sa replacement pravilom, svaka runda nosi pravi izbor: zadrži dobru postavku (siguran, rastući roster power) ili riskiraj zamenu za jaču kartu (churn cena, ali dugoročno viši Vibe jer kasnije faze imaju viša očekivanja — vidi Sekciju 5.3 Crowd Impatience). Ovo direktno opravdava zašto se izvlači svih 6 rundi.

### 1.3 Dizajn odluka: karte su mehanički generičke, uloga je kozmetička

Concept.md kaže "svaka karta je čovek sa profilom i snagom" i istovremeno traži "5 uloga × 5 event slotova" matricu. Ovo sam razrešio ovako da izbegnem drugi state-mašina problem (fit/mismatch sloj preko replacement sloja, što bi Kompleksnost 3/5 pretvorilo u 4/5):

- Svaka karta ima `role` polje (Tonac / Host / Content Creator / Logistika / Obezbeđenje) — **čisto kozmetičko**: određuje accent boju karte (iz concept.md Vizuelne Estetike), ime/flavor, i koji Pera aforizam se prikazuje uz nju. Ne ograničava na koji slot karta može ići.
- **Bilo koja izvučena karta može ići na bilo koji od 5 slotova.** "Role" broji se za sadržajnu raznovrsnost (6 karata po roli, vidi Sekciju 2), ne za mehaničko ograničenje.
- Sinergija (Sekcija 4) se ne računa po ulozi KARTE nego po ulozi SLOTA — ako su Tonac-slot i Logistika-slot oba popunjena (bilo kojim kartama), "Sound Ready" bonus je aktivan.

Razmatrao sam i "Good Fit" bonus (karta svoje role u odgovarajućem slotu = +X) po uzoru na Avala Crew, ali sam ga isekao iz scope-a — dodaje drugi ukršteni sistem povrh already-eksplicitnog replacement + synergy stacka, i gura Kompleksnost iznad 3/5 cilja iz concept.md. Ako beta test pokaže da je izbor "gde stavim kartu" previše plitak bez fit sloja, to je P3 patch kandidat, ne launch blocker.

### 1.4 Deck / graveyard mehanika

- Špil (deck) po event tipu ima 30 (Klub) / 35 (Outdoor) / 40 (Intimate) karata — vidi Sekciju 8.
- Max izvučeno u partiji: 3 karte × 6 rundi = **18 karata**. Pošto je najmanji deck 30 karata, **nikad nije potreban reshuffle** — deck se nikad ne prazni. Jova ne implementira reshuffle logiku (namerno izostavljeno, manje koda).
- Karte koje igrač odbaci u Assign koraku ILI koje budu prepisane (replacement) idu u `graveyard[]` i **ne vraćaju se u deck** za tu partiju.

---

## 2. Karte — stat matrica i sadržaj

### 2.1 Skala i rarity

Jedan stat po karti: **Snaga (power), integer 1–4.**

| Rarity | Power raspon | Karata po roli | Ukupno (Klub set) |
|---|---|---|---|
| Common | 1–2 | 4 | 20 |
| Rare | 3–4 | 2 | 10 |
| **Ukupno** | — | **6 po roli** | **30** |

Unutar role, tačna distribucija: 2× Common power 1, 2× Common power 2, 1× Rare power 3, 1× Rare power 4. Prosečna snaga po karti u Klub setu: (1+1+2+2+3+4)/6 ≈ **2.17**.

Ovo direktno odgovara na "broj karata po ulozi" pitanje: **6 po roli, 30 ukupno**, u skladu sa concept.md "30+" i predloženim minimumom iz brief-a.

### 2.2 Primer sadržaj strukture (Klub set, 2 od 6 po roli — ostatak je Pera/Jova content zadatak)

| Rola | Common (power) | Rare (power) |
|---|---|---|
| Tonac | Mika Mikser (2) | Slavko Saund (4) |
| Host | Zorana Zvučna (2) | Braca Bina (4) |
| Content Creator | Sanja Snimak (2) | Marko Montaža (4) |
| Logistika | Đorđe Đir (2) | Vesna Vozni Red (4) |
| Obezbeđenje | Laza Lanac (2) | Mile Muskul (4) |

Puna lista (30 imena/power/flavor) je Pera Period + Jova content zadatak u KORAK 4f, sledi ovu formulu (4 Common + 2 Rare po roli).

---

## 3. Uloge i slotovi

5 slotova, fiksni identitet (ne rotiraju se): **Tonac, Host, Content Creator, Logistika, Obezbeđenje.** Isti 5 identiteta važe za sve 3 event tipa (Sekcija 8) — menja se samo koje karte i koji brojevi stoje iza njih, ne sama struktura slotova. Slotovi nemaju fiksni redosled/susedstvo u smislu pravila (vidi 4.1 — sinergija je definisana kao par uloga, ne kao pozicija u redu), UI ih prikazuje u jednom redu radi čitljivosti (concept.md Vizuelna Estetika).

---

## 4. Synergy matrica (5×5 = 25 ćelija)

### 4.1 Dizajn odluka o "susednim slotovima"

Concept.md tekst ("komplementarne uloge na susednim slotovima") i concept.md "Sadržaj koji treba" ("5 uloga × 5 event slotova = 25 ćelija") gledaju na isti sistem iz dva ugla. Odlučio sam da "susedni" NIJE fizička pozicija u redu (concept ne definiše fiksni redosled slotova, a fiksiranje redosleda bi proizvoljno favorizovalo neke parove nad drugima bez razloga) — "susedni" = **bilo koja dva slota koja su OBA popunjena u trenutnom rosteru**. Svaki par od 5 uloga (C(5,2) = 10 unikatnih parova) ima definisan bonus. Matrica ispod je simetrična (par A+B = par B+A), dijagonala nije primenjiva (slot se ne pari sa samim sobom) — otud "25 ćelija": 10 unikatnih vrednosti × 2 (simetrija) + 5 dijagonalnih "—" = 25.

### 4.2 Kompletna matrica

| | Tonac | Host | Content Creator | Logistika | Obezbeđenje |
|---|---|---|---|---|---|
| **Tonac** | — | On Point +4 | Live Cut +3 | Sound Ready +5 | Clean Signal +3 |
| **Host** | On Point +4 | — | Buzz +5 | Timing +2 | Crowd Control +4 |
| **Content Creator** | Live Cut +3 | Buzz +5 | — | Content Flow +3 | Safe Shot +2 |
| **Logistika** | Sound Ready +5 | Timing +2 | Content Flow +3 | — | Site Secure +3 |
| **Obezbeđenje** | Clean Signal +3 | Crowd Control +4 | Safe Shot +2 | Site Secure +3 | — |

### 4.3 10 unikatnih parova (referentna lista za Jovu/config.js)

| Par | Naziv | Bonus | Flavor logika |
|---|---|---|---|
| Tonac + Logistika | Sound Ready | +5 | Tehnika i oprema rade glatko zajedno |
| Host + Content Creator | Buzz | +5 | Energija hosta se snima i širi |
| Tonac + Host | On Point | +4 | Host najavljuje tačno kad je zvuk spreman |
| Host + Obezbeđenje | Crowd Control | +4 | Obezbeđenje prati energiju koju host diže |
| Logistika + Obezbeđenje | Site Secure | +3 | Lokacija organizovana i bezbedna zajedno |
| Logistika + Content Creator | Content Flow | +3 | Prostor sređen = ima šta i gde da se snima |
| Tonac + Obezbeđenje | Clean Signal | +3 | Pristup pultu čuvan, bez ometanja |
| Tonac + Content Creator | Live Cut | +3 | Snimatelj hvata čist zvuk direktno sa pulta |
| Logistika + Host | Timing | +2 | Host zna raspored jer logistika drži plan |
| Content Creator + Obezbeđenje | Safe Shot | +2 | Snimatelj sme blizu bine, čuvano je |

### 4.4 Stacking pravilo (odgovor na "cap ili linearno")

Svi aktivni parovi se **sabiraju linearno** (ne postoji "jedan slot = max jedan par" ograničenje — slot Tonac istovremeno broji u par sa Host, Logistika, Obezbeđenje i Content Creator ako su svi popunjeni). Sirovi zbir svih 10 parova (kad je svih 5 slotova popunjeno) = 5+5+4+4+3+3+3+3+2+2 = **34**.

**Cap:** ukupan synergy doprinos po rundi je ograničen na **`MAX_SYNERGY_PER_ROUND = 12`**. Bez cap-a, treći-četvrti slot koji se popuni bi automatski dao neproporcionalno veliki skok (svaki novi popunjen slot otvara do 4 nova para odjednom) i obesmislio bi postepeni rast. Sa cap-om na 12, ranо popunjavanje (2-3 slota, par-dva aktivna) već hvata veći deo mogućeg bonusa, a peti slot dodaje marginalnu, ne eksplozivnu, korist — što je namerno: cap nagrađuje "popuni sve slotove" ali ne čini kasne slotove beskorisnim (i dalje doprinose kroz raw power, Sekcija 5).

---

## 5. Vibe Score — kompletna ekonomija

### 5.1 Formula (po rundi)

```
slotPowerSum   = Σ power svih trenutno popunjenih slotova (0–20 kad su sva 4-power karte)
weightedPower  = round(slotPowerSum × phaseWeight[faza])
synergyBonus   = min(Σ aktivnih parova, MAX_SYNERGY_PER_ROUND=12)
emptyPenalty   = (broj praznih slotova) × 2   — IZUZETAK: 0 u Rundi 1 (nemoguće popuniti 5 od 3 karte, vidi 5.4)
impatiencePenalty = 5 ako je slotPowerSum < phaseThreshold[faza], inače 0   (vidi 5.3)
churnPenalty   = (broj zamena ove runde) × 3

roundDelta = weightedPower + synergyBonus − emptyPenalty − impatiencePenalty − churnPenalty

vibeScore = clamp(vibeScore + roundDelta, 0, 100)
```

**Početni Vibe Score: 20** (bazna "pre-show" energija publike, ne 0 — sprečava da runda 1, gde je strukturno nemoguće popuniti sve slotove, odmah gurne igrača u negativnu zonu).

### 5.2 Phase weight tabela

| Faza | Weight | Threshold (5.3) |
|---|---|---|
| Setup | 0.5 | 5 |
| Soundcheck | 0.7 | 8 |
| Opening | 0.9 | 11 |
| Climax | 1.2 | 15 |
| Breakdown | 0.8 | 13 |
| Recap | 0.6 | 10 |

Weight raste ka Climax-u (peak scrutiny publike), pada ka Recap-u (wind-down). Ovo je i vizuelni/audio cue (crowd ambient najglasniji u Climax-u, concept.md Audio Mood).

### 5.3 Decay / drift — "Crowd Impatience"

Threshold tabela (kolona iznad) definiše minimalnu `slotPowerSum` koju roster mora da drži da BI izbegao penal. Thresholds rastu kroz fazu (5 → 8 → 11 → 15) pa opadaju (13 → 10) — ovo je namerni drift mehanizam: roster koji je bio "dovoljno dobar" za Setup (threshold 5) nije automatski dovoljan za Climax (threshold 15). **Ovo je glavni razlog zašto igrač MORA da nastavi da unapređuje roster (churn) kroz svih 6 rundi**, ne samo da popuni 5 slotova jednom i stane — odgovara na isto pitanje kao 1.2, iz ugla ekonomije umesto state mašine.

### 5.4 Empty slot penalty — Runda 1 izuzetak

U Rundi 1 igrač ima tačno 3 izvučene karte i 5 slotova — **strukturno nemoguće** popuniti sve. `emptyPenalty` se NE primenjuje u Rundi 1 (grace). Od Runde 2 nadalje, penal važi normalno (do Runde 2 igrač je imao 6 ukupno izvučenih karata — dovoljno da popuni sve slotove ako bira da ne odbacuje).

### 5.5 Vibe Score granice — clamp, ne negativan broj

Vibe Score se **uvek** prikazuje kao [0, 100] — clamp se primenjuje odmah posle svake runde, internog "negativnog" stanja nema u state-u koje bi UI moglo slučajno prikazati. Ako `vibeScore == 0` posle bilo koje runde (uključujući Rundu 1–5) → **partija se odmah završava** (loss ending, Sekcija 7), preostale runde se ne igraju. Hit na 100 NE završava partiju ranije — igrač nastavlja kroz preostale faze (score ostaje capped, partija se prirodno završi u Rundi 6 sa "legendarni" ishodom).

### 5.6 Konfiguracione konstante za `config.js`

```js
VIBE_START = 20
VIBE_MIN = 0
VIBE_MAX = 100

CHURN_PENALTY = 3          // po zameni
EMPTY_SLOT_PENALTY = 2     // po praznom slotu, od Runde 2
IMPATIENCE_PENALTY = 5     // ako slotPowerSum < threshold te faze

PHASE_WEIGHTS = { setup: 0.5, soundcheck: 0.7, opening: 0.9, climax: 1.2, breakdown: 0.8, recap: 0.6 }
PHASE_THRESHOLDS = { setup: 5, soundcheck: 8, opening: 11, climax: 15, breakdown: 13, recap: 10 }

MAX_SYNERGY_PER_ROUND = 12

SYNERGY_PAIRS = {
  "tonac-logistika":        { name: "Sound Ready",    bonus: 5 },
  "host-content":           { name: "Buzz",            bonus: 5 },
  "tonac-host":             { name: "On Point",        bonus: 4 },
  "host-obezbedjenje":      { name: "Crowd Control",   bonus: 4 },
  "logistika-obezbedjenje": { name: "Site Secure",     bonus: 3 },
  "logistika-content":      { name: "Content Flow",    bonus: 3 },
  "tonac-obezbedjenje":     { name: "Clean Signal",    bonus: 3 },
  "tonac-content":          { name: "Live Cut",        bonus: 3 },
  "logistika-host":         { name: "Timing",          bonus: 2 },
  "content-obezbedjenje":   { name: "Safe Shot",       bonus: 2 }
}
```

---

## 6. Faze — 6 rundi detaljno

| # | Faza | Weight | Threshold | Flavor / crowd audio cue |
|---|---|---|---|---|
| 1 | Setup | 0.5 | 5 | Tih ambijent, crowd tek stiže |
| 2 | Soundcheck | 0.7 | 8 | Prvi zvučni test, tehnički fokus |
| 3 | Opening | 0.9 | 11 | Vrata otvorena, crowd murmur raste |
| 4 | Climax | 1.2 | 15 | Pun ambijent, najviši ulog |
| 5 | Breakdown | 0.8 | 13 | Energija opada, kontrola izlaza |
| 6 | Recap | 0.6 | 10 | Wind-down, poslednji utisak |

Draw/Assign/Resolve/Score ciklus je identičan u svih 6 — jedina razlika je koji `phaseWeight`/`phaseThreshold` je aktivan (Sekcija 5.6).

---

## 7. Win / Lose uslovi

### 7.1 Ishodi

| Vibe Score | Ishod | Kada se dešava |
|---|---|---|
| 80–100 | **Legendarna partija** | Runda 6 završena, finalni Vibe ≥ 80 |
| 50–79 | **Solidna partija** | Runda 6 završena, finalni Vibe 50–79 |
| 1–49 | **Slaba partija** | Runda 6 završena, finalni Vibe < 50 (ali nikad tačno 0 pre kraja) |
| 0 | **Raspao se crew** (early loss) | Vibe Score pao na 0 u BILO KOJOJ rundi — partija se odmah završava, preostale runde se preskaču |

### 7.2 Kanonske tagline (REDLINE #4 — bira JEDNU verziju)

Concept.md ima dve neusklađene verzije (Win Condition sekcija vs. Ending Screen UI Spec sekcija, potonja je novija — 2026-08-13, i već ima potpun Jova impl spec sa aria-live/share payload oko nje). Biram **Ending Screen UI Spec verziju kao kanonsku** — evergreen fraze bez vremenski osetljivih referenci (Win Condition verzija sadrži "August u Guncatiju", koja zastareva čim igra pređe avgust; Ending Screen verzija fokusirana je na sam crew, ne na kalendarski mesec):

| Prag | Kanonska tagline |
|---|---|
| ≥ 80 | "Crew je spreman. Svi znaju šta im je posao." |
| 50–79 | "Solidno. Malo još rada na sinergiji." |
| < 50 | "Sutra probaj ponovo. Crew se gradi vremenom." |
| 0 (early loss) | "Sutra probaj ponovo. Crew se gradi vremenom." (isti tekst kao < 50 — early loss je podskup "slaba partija" ishoda, ne poseban peti tekst) |

**Napomena za Dule (sledeći korak, etički/copy pass):** ovo su MOJE brojčane/strukturne odluke (koji prag dobija koji red), ne finalni copy. Dule potvrđuje ton i etičku ispravnost teksta, može predložiti alternativnu formulaciju istog mapiranja prag→poruka.

### 7.3 Bonus ending — Hall of Fame

Nepromenjeno iz concept.md: unlock posle 3 completed runs (definicija u 8.1). Prikazuje poslednja 3 completed-run Vibe Score-a (rolling window — svaki novi completed run gura najstariji od ta 3 napolje), shareable PNG.

---

## 8. Progression / Prestige — 3 event tipa

### 8.1 "Completed run" definicija (REDLINE #5)

**Completed run** = partija je stigla do Ending screen-a, bez obzira na ishod (Legendarna / Solidna / Slaba / Raspao se crew-early-loss su SVI completed runs — early loss i dalje prikazuje ending screen, samo sa najnižim tagline-om). Napuštanje partije pre ending screen-a (zatvoren tab, refresh usred Runde 3, itd.) se **ne** broji. `completedRuns` counter u `state.js` se inkrementira TAČNO jednom, u trenutku kad se ending screen renderuje (ne ranije).

### 8.2 Event tipovi — unlock uslovi i konkretne razlike

| Event tip | Unlock uslov | Deck | Rebalans naspram Klub-a |
|---|---|---|---|
| **Klub** (default) | Uvek dostupan | 30 karata (Sekcija 2) | — (baseline) |
| **Outdoor** | 5 completed runs | 30 base + 5 signature karata (1 po roli, power 5) = 35 | Site Secure (Logistika+Obezbeđenje) 3→**6**; Buzz (Host+CC) 5→**3**; Setup weight 0.5→**0.7**; Climax weight 1.2→**1.0** |
| **Intimate** | 10 completed runs | 30 base + 5 Outdoor signature + 5 Intimate signature (1 po roli, power 5) = 40 | Buzz (Host+CC) 5→**8**; Sound Ready (Tonac+Logistika) 5→**3**; Climax weight 1.2→**0.9**; Recap weight 0.6→**0.9** |

**Zašto ovi konkretni brojevi:** Outdoor je fizički zahtevniji setup (teren, struja, pristup) i manje viralan (nema zatvorenog prostora za snimanje) — otud Site Secure raste, Buzz pada, Setup teži. Intimate je mali, angažovan crowd gde je content zlato ali tehnički zvuk manje kritičan (mali prostor) i nema pravog "peak-a" — otud Buzz raste najviše u čitavom sistemu, Climax weight pada ispod čak i Recap-a Klub seta.

**Deck izbor je per-run, ne kumulativan:** kad igrač bira "Outdoor" tip partije, deck za TU partiju je isključivo 35-karata Outdoor set (ne Klub 30 + Outdoor 5 pomešano) — svaki event tip je samostalan mod sa svojim setom i svojom sinergijskom tabelom (Sekcija 8.2 desna kolona), ne aditivna nadogradnja istog deck-a.

### 8.3 Meta progresija van jedne partije

- `completedRuns` (globalni brojač, localStorage) otključava Outdoor (5) i Intimate (10) — permanent, ne resetuje se.
- Hall of Fame (Sekcija 7.3) dostupan trajno posle 3. completed run-a.
- Nema prestige reset-a (za razliku od Avala Crew) — namerno: ovo je "companion" sesija, ne karijera. Vidi Sekciju 11.

---

## 9. Pacing po minutama

Cilj: 10–18 min po sesiji (concept.md).

| Trenutak | Prva partija (sa tutorial tooltip-ovima) | Replay partija |
|---|---|---|
| Intro/meni | 0:30 | 0:15 |
| Runda 1 — Setup | 1:30 (tutorial: "Popuni slotove") | 1:00 |
| Runda 2 — Soundcheck | 1:45 | 1:15 |
| Runda 3 — Opening | 2:00 | 1:30 |
| Runda 4 — Climax | 2:30 (najviše odluka — upgrade/churn izbori) | 1:45 |
| Runda 5 — Breakdown | 1:45 | 1:15 |
| Runda 6 — Recap | 1:30 | 1:00 |
| Ending screen + share | 1:00 | 0:45 |
| **Ukupno** | **~12:30** | **~8:45–10:00** |

Prva partija pada čvrsto u 10–18 min opseg. Replay je brži (poznate mehanike, manje čitanja) — legitimno pada blizu donje granice ili malo ispod za igrače koji već znaju sinergije; "još jedan run" hook (concept.md Hook sekcija) računa na to da je replay BRŽI, ne isti, kao deo curiosity/synergy-testing petlje.

---

## 10. Balance — kompletni worked examples (3 partije, 6 rundi svaka)

Svrha: proveriti da formula (Sekcija 5) realno proizvodi sve 3+1 ishoda iz Sekcije 7.1 sa verovatnim igračkim ponašanjem, ne samo teorijski.

### 10.1 DOBRA partija — cilj: 80+ (Legendarna)

Igrač popunjava slotove brzo, bira Rare karte kad ih izvuče, jedan promišljen upgrade u Climax-u.

| Runda | Akcija | slotPowerSum | weightedPower | synergyBonus | penali | roundDelta | Vibe (posle) |
|---|---|---|---|---|---|---|---|
| 1 Setup | + Tonac(2), + Logistika(3) | 5 | 3 | +5 (Sound Ready) | 0 (grace) | 8 | 20 → **28** |
| 2 Soundcheck | + Host(4), + CC(2) | 11 | 8 | +12 (cap, 6 parova aktivnih) | empty×1 = -2 | 18 | 28 → **46** |
| 3 Opening | + Obezbeđenje(3) — svih 5 popunjeno | 14 | 13 | +12 (cap) | 0 | 25 | 46 → **71** |
| 4 Climax | zamena CC(2)→CC(4), 1 churn | 16 | 19 | +12 (cap) | churn -3 | 28 | 71 → **99** |
| 5 Breakdown | drži postavku | 16 | 13 | +12 (cap) | 0 | 25 | 99 → **100** (clamp) |
| 6 Recap | drži postavku | 16 | 10 | +12 (cap) | 0 | 22 | 100 → **100** (clamp) |

**Finalni Vibe: 100 → Legendarna partija.** Runde 5–6 su "cruise" pošto je cap dostignut u Rundi 4 — ovo je namerno (nagrada za savršenu igru), Breakdown/Recap i dalje nose flavor/audio/aforizme čak i kad je score maksiran.

### 10.2 SREDNJA partija — cilj: 50–79 (Solidna)

Igrač popunjava sporo (jedan slot po rundi), sve Common karte, bez churn-a.

| Runda | Akcija | slotPowerSum | weightedPower | synergyBonus | penali | roundDelta | Vibe (posle) |
|---|---|---|---|---|---|---|---|
| 1 Setup | + Tonac(2) | 2 | 1 | 0 | impatience -5 | -4 | 20 → **16** |
| 2 Soundcheck | + Host(1) | 3 | 2 | +4 (On Point) | impatience -5, empty×3 -6 | -5 | 16 → **11** |
| 3 Opening | + Logistika(2) | 5 | 5 | +11 (3 para) | impatience -5, empty×2 -4 | 7 | 11 → **18** |
| 4 Climax | + Content Creator(2) | 7 | 8 | +12 (cap) | impatience -5, empty×1 -2 | 13 | 18 → **31** |
| 5 Breakdown | + Obezbeđenje(1) — svih 5 popunjeno | 8 | 6 | +12 (cap) | impatience -5 | 13 | 31 → **44** |
| 6 Recap | drži postavku | 8 | 5 | +12 (cap) | impatience -5 | 12 | 44 → **56** |

**Finalni Vibe: 56 → Solidna partija.** Potvrđuje da spora/pasivna ali ne-katastrofalna igra pada tačno u srednji pojas, ne slučajno u ekstrem.

### 10.3 LOŠA partija — cilj: < 50, potencijalni early loss (Raspao se crew)

Igrač popunjava samo 2 slota i stane, bez ijedne dobre odluke posle toga.

| Runda | Akcija | slotPowerSum | weightedPower | synergyBonus | penali | roundDelta | Vibe (posle) |
|---|---|---|---|---|---|---|---|
| 1 Setup | + Logistika(1) | 1 | 1 | 0 | impatience -5 | -4 | 20 → **16** |
| 2 Soundcheck | + Content Creator(2) | 3 | 2 | +3 (Content Flow) | impatience -5, empty×3 -6 | -6 | 16 → **10** |
| 3 Opening | besmislena zamena Logistika(1)→Logistika(1), 1 churn | 3 | 3 | +3 | impatience -5, empty×3 -6, churn -3 | -8 | 10 → **2** |
| 4 Climax | ništa novo | 3 | 4 | +3 | impatience -5, empty×3 -6 | -4 | 2 → **0 → GAME OVER** |

**Partija se prekida u Rundi 4 (Climax) sa Vibe = 0 → Raspao se crew.** Runde 5–6 se ne igraju. Ovo potvrđuje da formula realno kažnjava pasivnu/lošu igru dovoljno da izazove early-loss mehaniku iz Sekcije 5.5/7.1, ne samo teorijski nego u verovatnom scenariju gde igrač jednostavno ne prati porast threshold-a.

**Ekstremni sanity-check (potpuno pasivan igrač, 0 karata ikad dodeljeno):** Runda 1: roundDelta = 0 − 5 (impatience, empty grace) = -5 → Vibe 15. Runda 2: roundDelta = 0 − 5 (impatience) − 10 (empty×5) = -15 → Vibe 0 → game over u Rundi 2. Formula kažnjava totalnu pasivnost brzo, što je ispravno ponašanje.

---

## 11. Zašto single-layer (izuzetak od GDG multi-layer direktive)

GDG projektni standard (2026-05-10 direktiv, `CLAUDE.md`) traži multi-layer manager/sim za branded/utility igre — macro sloj (sezona/nedelja) + micro sloj (sesija) + meta progresija. Crew Recruiter je **namerno single-layer** i to je opravdan izuzetak, ne previd:

1. **Ovo je "companion" sesija, ne career-sim.** Ekipa Noći i Avala Crew već pokrivaju prostor "izgradi karijeru/sezonski crew kroz više eventova" — to je macro sloj koji već postoji dvaput u katalogu za identičnu brend-kombinaciju (Kluboslavija × MKDSLend). Dodavanje macro sloja Crew Recruiter-u bi ga učinilo trećom skoro identičnom igrom u istom prostoru (tačno rizik koji je Nega flagovala kao R3 u premortem-u), umesto trećom igrom koja radi nešto DRUGAČIJE.
2. **Diferencijacija je eksplicitna dizajn odluka, ne posledica nedostatka vremena** — concept.md "Diferencijacija" sekcija (3 tačke) postoji upravo zato da single-layer/jedan-event format bude ISTAKNUT kao razlika, ne sakriven kao manjkavost.
3. **Meta progresija i dalje postoji**, samo je plića namerno: 3 event tipa (Sekcija 8.2) + Hall of Fame (7.3) daju replay hook bez punog macro-sloja. Ovo je isti nivo kompromisa koji drži sesiju u 10–18 min cilju (Sekcija 9) — macro sloj bi gurnuo minimalnu sesiju iznad 20+ min i van "kratka companion igra" niše koju concept.md eksplicitno cilja.

Zaključak: single-layer ovde nije "lakši put", nego mehanička posledica namerne pozicije u katalogu (kratka, zatvorena, jedan-nastup igra pored dve postojeće karijera-igre).

---

## 12. Modul / LOC target i napomene za Jovu

### 12.1 Target (REDLINE #2 — ispravlja concept.md broj)

**25–40 modula, 8000–12000 JS linija.** Concept.md Kompleksnost sekcija pominje "20–28 modula" — taj broj je pisan pre nego što je GDG standard finalizovan za single-layer igre (vidi `CLAUDE.md` Scope tabela: single-layer cilj je 25–40 modula / 8000–12000 JS linija, hard cap 60 modula / 15000 linija). Ovaj GDD je autoritativan izvor za Jovin impl budžet — concept.md broj se ne koristi.

### 12.2 Predloženi modul raspored (orijentacioni, Jova finalizuje u manifest.json KORAK 4a)

```
src/main.js                    — bootstrap, wire loop
src/config.js                  — SVE konstante iz Sekcije 5.6 + 8.2
src/state.js                   — hand[], slots[5], graveyard[], vibe_score, phase_index, completedRuns, eventType
src/entities/card.js            — klasa: id, name, role, power, rarity
src/systems/resolution.js       — resolveRound(slots, phase) → { weightedPower, synergyBonus, penalties, roundDelta }
src/systems/synergy.js          — detectActivePairs(slots) → aktivni parovi + suma (sa cap-om)
src/systems/deck.js             — draw(), graveyard tracking, po event tipu
src/systems/progression.js      — completedRuns tracking, event tip unlock gating
src/render.js, src/ui.js        — hand/slot prikaz, Vibe meter, faza indikator
src/input.js                    — pointer events (touch+mouse), drag ili klik-to-slot
src/audio.js                    — crowd ambient (raste po fazi), SFX (Sekcija concept.md Audio Mood)
src/share.js                    — Web Share API + clipboard fallback (concept.md Ending Screen spec)
src/content/cards_klub.js        — 30 karata Klub seta
src/content/cards_outdoor.js     — 5 Outdoor signature karata
src/content/cards_intimate.js    — 5 Intimate signature karata
src/content/aforizmi.js          — 8 Pera aforizama za synergy trigger momente
styles/base.css, ui.css, game.css, theme.css
```

Ovo je ~20 imenovanih fajlova — Jova širi `systems/`, `entities/` i `content/` dalje (npr. odvojiti `entities/slot.js`, `systems/ending.js`, `systems/hall_of_fame.js`) da dostigne 25–40 modula bez veštačkog nabijanja, prirodnom dekompozicijom gore navedenih odgovornosti.

### 12.3 Ostale napomene za Jovu

- State shape iz concept.md Napomena za KORAK 4 (`game_state.hand[]`, `slots[5]`, `vibe_score`, `phase_index`) se proširuje sa: `graveyard[]`, `completedRuns`, `eventType` ("klub"/"outdoor"/"intimate"), `churnCountThisRound` (resetuje se na 0 svaki Draw korak).
- Save u localStorage posle svake runde (Score koraka), ne posle svakog pojedinačnog Assign-a — potvrđeno iz concept.md, nepromenjeno.
- Ending screen UI spec (layout, score-gated tagline, Web Share API payload, aria-live/aria-label) je već kompletno specificiran u concept.md "Ending Screen UI Spec" sekciji — Jova implementira TAJ layout, sa tagline mapiranjem iz Sekcije 7.2 OVOG dokumenta (kanonska verzija, ne Win Condition sekcija concept.md-a).
- `MAX_SYNERGY_PER_ROUND`, `PHASE_WEIGHTS`, `PHASE_THRESHOLDS`, `SYNERGY_PAIRS` iz Sekcije 5.6 idu direktno u `config.js` — nijedan broj ne sme biti hardkodiran u `systems/resolution.js` ili `systems/synergy.js`.
- Deck-per-event-tip (Sekcija 8.2) znači `systems/deck.js` prima `eventType` kao parametar pri init-u partije i učitava odgovarajući card set + synergy/phase rebalans iz `config.js` — ne globalna promenljiva koja se menja usred partije (event tip se bira PRE Runde 1, ne menja se tokom partije).
