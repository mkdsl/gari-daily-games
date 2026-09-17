# Concept: Zimovnica

**Naziv:** Zimovnica
**Žanr:** Seasonal Resource Strategy / Preservation Puzzle
**Datum:** 2026-09-16
**brand_serves:** guncati, mkdslend

> ⚙️ **Pipeline nota:** Ovo je FINALNA verzija concept.md — Cana Ćup corrections (09-10) su ugrađene.
> Trigger KORAK 1 brief-check: kopiraj direktno kao `docs/concept.md`. Ne spawni Iskru ponovo.
> Mile: pročitaj sekciju "Korekcije za GDD" pre otvaranja ovog fajla za balansiranje.

---

## Premisa

Leto je prošlo. Berba je bila dobra — ili nije. Sad imaš 14 dana do prve ruje, i pun podrum
sirovine koja ili postaje zimovnica ili truli.

Odlučuješ šta da zgotoviš, šta da prodaš, šta da sačuvaš živo. Svaka odluka se lančano
odražava — pogrešiš li red, ajvar ostaje kiseo, turšija se raspadne pre januara.

Ovo nije "kuhanje". Ovo je strategija prezimljavanja. Imanje zavisi od tebe.

---

## Core Gameplay Loop

**Makro sloj (14 dana do prve ruje):**
Imaš fiksni inventar sirovine (bira se nasumično svaki run, iz "berba RNG pool-a"):
- Paprike (0–80 kg): za ajvar (visoko vreme, visoka vrednost), pečene (brzo), prodaja
- Paradajz (0–60 kg): sos, pelat, sušeni (dugačko ali najduže traje)
- Krastavci + bostanuša: turšija (fermentacija, 7–21 dana, mora se pratiti)
- Jabuke: sušeno voće, džem — i Rakija (kasni unlock, vidi dole)
- Kupus: kiseli kupus (bačva = kritičan process sa inicijacionim prozorom, vidi dole)
- Šljive: pekmez, sušene šljive (base za prestige Medenjake), rakija plum base

Svaki dan imaš 4 "radna sata" (action slots). Aktivnosti koje traju:
- Ajvar: 3h prep + 2h kuvanje + 1h teglanje = 6h total (2 dana radnog vremena)
- Turšija: 1h prep, ali čekaš 7–14 dana fermentacije (pasivno, posle inicijacije)
- Sušenje: 0.5h prep, ali čekaš 3–7 dana (pasivno, zavisi od VREMENSKE PROGNOZE)
- Rakija (unlock Day 10+): 2h priprema + 4-8h destilacija BLOKIRA sve action slots tog dana

**Mikro sloj (svaki aktivni dan):**
3 random "dnevni eventi" iz event pool-a:
- **Komšija nosi viška paprika** — prihvati (+20kg paprika, −2h dan) ili odbij
- **Kiša 3 dana** — sušeno voće izvan se kvari ako nije unutra
- **Berba jabuka — berač slobodan jutros** — iskoristi berača (brže, −5 EUR) ili sam (sporije, besplatno)
- **Tegla puknuta u ajvaru** — −2 tegle gotovog (RNG loss, nauči te da praviš rezerve)
- **Mesna industrija nudi otkup paprika** — prodaj odmah po tržišnoj ceni (brže, ali manje od kuvane vrednosti)
- **Kupus bačva — pH check** — proveravaš pH (mini QTE: pH 3.5–4.5 = dobro, van = kvarite bačvu)
- **BAČVA KO** — vidi Korekciju #1 dole

**Resursi:**
| Resurs | Raspon | Opis |
|--------|--------|------|
| Sirovine | 0–240 kg total | Raspadaju se po tipu ako ne obradiš na vreme |
| Zimovnica Storage | 0–200 tegli/kg | Koliko si zgotovio što traje |
| Kasa | 0–3000 RSD | Prihod od prodaje, rashod od berača/staklenki |
| Dani do Ruje | 14–0 | Countdown, nepromenljiv |
| Prostorni kapacitet | 4 police | Svaka polica = 20 tegli (fizičko ograničenje!) |
| Rakija Status | 0–50L | Godišnji zakonski cap (gameplay ograničenje) |

**Carry-over između run-ova:**
- Kasa ostaje (akumuliraš kapital za upgrade police, suvo voće opremu)
- Recepti: svaki uspešno završen tip otključava napredniji recept (više tegli po kg)
- Sezona: Run 1 = leto→zima, Run 2 = proleće→jesen... svaka sezona ima drugačiju berbu RNG

---

## Korekcije za GDD (Mile čita ovo PRE nego što otvori ostatak)

### Korekcija #1 — Bačva KO: inicijacioni prozor za kiseli kupus

Concept "ne može da se prekine" je bio nedovoljno jak constraint.

**Stvarna mehanika (Cana Ćup verified):** Kad soliš kupus, imaš 6-8 sati tokom kojih MORAŠ da ga utisneš i potopiš sokom. Ako propustiš taj prozor (kupus osuši) — bačva je POKVARENA, ne samo zakasneš.

**Gameplay implementacija:**
- Kad igrač stavlja kupus u bačvu, pokreće se "Inicijacioni Tajmer" (2 action slots = 8h)
- Ako igrač ne aktivira "Utisni kupus" pre isteka tajmera → **BAČVA KO event**: `event_engine.js` emituje `BARREL_FAIL`, kupus propada (ne može u ništa drugo), tegla−0
- Fermentacija dalje je pasivna (OK, 40 dana) — samo inicijacija nije
- Mile: dodaj `bačva_status: "unsalted" | "critical_window" | "fermenting" | "ready" | "failed"` u `state.js`

### Korekcija #2 — Rakija: kasni unlock (ne core loop, ne uklanjanje)

Concept je ostavio rakiju "na pola" — naveo jabuke kao "rakija base" bez mehanike.

**Odluka (Iskra + Cana):** Rakija je kasni unlock (Day 10+), ne core loop. Prerano otvaranje bi poremetilo balans prvih 10 dana.

**Mehanika:**
- Dostupna od Day 10 ako imaš >= 15 kg jabuka ILI >= 10 kg šljiva (obe daju drugačiji output)
- Destilacija: troši CELI dan (4 action slots = blokira sve ostalo)
- Zakonski cap: 50L godišnje za ličnu upotrebu → gameplay ograničenje (ne možeš peći bez ograničenja)
- Output: "Rakija Reserve" (posebna kategorija, ne ide u "Zimovnica" brojku, ali daje +Kasa bonus na kraju run-a i otključava Medenjake u narednom run-u)
- Mile: `rakija.js` u `src/entities/` — odvojeni fajl, ne ugradi u `recipe.js` (čuva kôd čitkim)

### Korekcija #3 — Prestige unlock: aronia/dren su pogrešna sezona

Concept predlaže "džem od aronije i drena" kao prestige unlock — ali aronia se bere avgusta, dren septembra. Oba su PRE ruje (oktobar). Nisu prestige — to je regularni inventar koji igrač već ima u Run 1.

**Zamena (sezonski tačno):**
- **"Medenjaci od šljive"** (prestige unlock): pravi se decembra, zahteva:
  - Sušene šljive iz prethodnog run-a (carry-over)
  - Rakija reserve (Run 1 unlock)
  - 6h baking time
  - Output: "Zimski medenjaci" — premium zimovnica item, +Kasa bonus, unlock special ending
- Alternativa ako šljive nisu bile u prethodnom run-u: "Zimski džem od divlje jabuke" (skuplja se kasno, posle ruje — run 2 ekskluzivno)
- Mile: Prestige logic u `prestige.js` treba da proverava `previous_run.has_rakija AND previous_run.has_dried_plums` pre unlocka

---

## Prestige Loop

Posle prvog uspešnog prezimljava (Zimovnica >= 120 tegli, Kasa >= 500):
- Unlock: "Prodaja na pijaci" — Zimovnica se može prodavati (nova kasa ekonomija)
- Unlock: "Komandir bačve" — kiseli kupus sada ima manual pH balancing mehanika (mini-game u pH QTE)
- Trajni bonus: +20% Recipe Efficiency (manje sirovine, više tegli)
- Novi tip sirovine: **Medenjaci od šljive** (Guncati-specific zimski item — vidi Korekciju #3)

---

## Završeci

**"Imanje Prezimlelo"** (Zimovnica ≥ 150 tegli, 0 propadle sirovine):
> Podrum je pun. Ruja može da dođe.
> (Unlock Pijaca mod — sledeći run prodaješ višak)

**"Dovoljno"** (Zimovnica 80–149 tegli):
> Biće dovoljno. Neće biti viška, ali biće dovoljno.
> (Standard ending — kratka animacija podrum-police)

**"Zima bez Rezervi"** (Zimovnica < 80 tegli):
> Kuhinja je prazna do marta. Šta se desilo?
> (Fail state — recap šta si pogrešio po kategoriji)

**"Trula Berba"** (> 30% sirovine propalo):
> Nisi stigao. Ili nisi procenio. Isto je.
> (Worst case — hint "koji tip zahteva koje vreme")

**"Medenjaci"** (prestige ending — Zimovnica ≥ 150, Medenjaci crafted):
> Ima snega napolju. U kuhinji miriše na cimet i rakiju.
> (Taj miris je Guncati decembra.)

---

## Vizuelna Estetika

**Paleta:** Jesenji zemlja-tonovi na tamnoj pozadini.
- Pozadina: `#1A120B` (duboka smeđa)
- Akcenat topli: `#E25822` (narandžasto-crvena — ajvar)
- Akcenat hladni: `#4A7C59` (tamno zelena — kiseli kupus, bostanuša)
- Neutral: `#C8A97E` (pšenično bež — suvo voće, tegle)
- Text: `#F5E6C8` (krem)
- Alert/KO: `#D62828` (crvena — bačva propada, timeout)

CSS DOM layout. Inventar kao polica-grid (vizuelno sličan shelf). Tegle kao ikonice koje
se pune. Fermentacija prikazuje "mehurić" animacijom u tegli. Countdown kalendarom gore.
Bačva ima progress bar za inicijacioni prozor (postaje crven kad ostaje < 1 action slot).

**Audio:** Kuhinjski ambijent — tišina sa povremenim zvukom ključanja, kapljica, zveka tegli.
Tempo pulsira sa countdown-om (sporiji na dan 14, brži na dan 3).
Bačva KO event: kratki heavy zvuk, ne alarm (atmosferski, ne kazneni).

---

## Brand Connection

- **Guncati:** Direktno prikazuje Guncati jesenju aktivnost — ajvar, turšija, zimovnica su Guncati
  identitet, ne dekoracija. Igra ne zamišlja — prikazuje STVARNI oktobar na imanju. Može se
  pustiti kao "Šta radimo na Guncatu dok vi gledate serije."
- **MKDSLend:** "Zabavni Radni Park" princip — ovo je rad koji je zabavan, ne rad koji liči na
  zabavu. Zimovnica je ozbiljan posao sa vidljivim outputom. Igra to poštuje.
- **Sezonski prozor:** Oktobar–Novembar. Ne pre, jer nije contextually relevantna. Ne posle,
  jer je kasno. Prozor od 6 nedelja počinje 25.09 — 9 dana od danas.

---

## Targetirana Dužina Sesije

10–15 minuta (jedan run, 14 dana gameplay = 14 odluka u bržem tempu).
Prestige run: 8–12 min (znaš recepte, biziš brže).

---

## Procena Modula

| Kategorija | Moduli | Primeri |
|------------|--------|---------|
| Entities | 8 | `ingredient.js`, `recipe.js`, `jar.js`, `shelf.js`, `event_card.js`, `batchjob.js`, `market.js`, `rakija.js` |
| Systems | 11 | `time_system.js`, `fermentation.js`, `barrel_init.js`, `decay_system.js`, `weather.js`, `rng_harvest.js`, `progression.js`, `prestige.js`, `capacity.js`, `event_engine.js`, `trade.js` |
| Render | 4 | `render.js`, `shelf_renderer.js`, `hud.js`, `calendar_renderer.js` |
| Content | 5 | `recipes_data.js`, `events_data.js`, `endings_data.js`, `aforizmi.js`, `brand_hooks.js` |
| Core | 3 | `main.js`, `config.js`, `state.js` |
| Audio | 1 | `audio.js` |
| Share | 1 | `share.js` |
| Input | 1 | `input.js` |
| Styles | 4 | `base.css`, `ui.css`, `shelf.css`, `theme.css` |
| **Ukupno** | **38** | ≥25 ✅ |

**Novi moduli vs 09-09 original (Cana corrections):**
- `barrel_init.js` (nov) — inicijacioni prozor za kiseli kupus, BAČVA KO event
- `rakija.js` (nov) — kasni unlock entitet
- `systems/fermentation.js` (proširen) — sada uključuje barrel_status state machine

---

## Napomene za Pipeline

**Zavisnosti pre GDD sesije:**
- Mile PRE GDD: pročitaj sekciju "Korekcije za GDD" ovog fajla
- Mile TOKOM GDD: `barrel_init.js` treba da koordinira sa `event_engine.js` (BAČVA KO event propagacija)
- Ceca: audio za BAČVA KO (heavy zvuk, ne alarm) i Rakija destilacija (ambient low hum 4-8h)

**Šta concept trigger treba da uradi (KORAK 1):**
1. Kopiraj ovaj fajl direktno kao `games/YYYY-MM-DD-zimovnica/docs/concept.md`
2. Ne spawni Iskru — concept je finalan
3. Nastavi na KORAK 2 (Nega premortem)

---

*Izvor: `tim/iskra/2026-09-09.md` (base concept) + `tim/iskra/2026-09-10.md` (Cana corrections) — merged 2026-09-16*
