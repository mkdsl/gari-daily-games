# GDD — Zimovnica
**Mile Mehanika · KORAK 3 · 2026-09-17**

---

## 1. Mehanike (sve akcije)

### Action Slot Economy
- Svaki dan = **4 action slots** (svaki = ~2h realna zimovnica radna jedinica)
- Akcija troši 1–3 slota zavisno od kompleksnosti
- Slots ne prenose se u sledeći dan (use-it-or-lose-it)

| Akcija | Slots | Input | Output | Notes |
|---|---|---|---|---|
| Beri sirovine | 1 | — | RNG harvest pool | jednom dnevno |
| Peči paprike | 1 | 10–20 kg paprika | Pečene paprike | prerekvizit za ajvar |
| Toci ajvar | 2 | Pečene paprike ≥20 kg | Tegle ajvara | vidi Recipe Table |
| Pravi sos | 1 | ≥10 kg paradajza | Tegle sosa | |
| Pravi pelat | 1 | ≥15 kg paradajza | Tegle pelata | |
| Suši voće | 1 | ≥5 kg jabuka ILI šljiva | Sušeno (passive 2 dana) | |
| Pravi džem | 1 | ≥8 kg jabuka | Tegle džema | |
| Utisni kupus (Bačva) | 2 | ≥20 kg kupusa | `bačva_status: "fermenting"` | WINDOW MECHANIC |
| Pokupuj turšiju | 1 | ≥10 kg krastavaca + 5 kg bostanuše | Tegle turšije (passive) | |
| Pravi pekmez | 1 | ≥12 kg šljiva | Tegle pekmeza | |
| Destilišu rakiju | 3 | ≥15 kg jabuka ILI ≥10 kg šljiva | Rakija Reserve (L) | Dan 7+ unlock |
| Prodaj na pijaci | 1 | Tegle (bilo koji tip) | Kasa (RSD) | prestige unlock |
| Kupi police upgrade | 1 | Kasa (RSD) | +1 polica | vidi §7 |
| Pravi medenjake | 2 | Rakija Reserve + Sušene šljive carry-over | Medenjaci (prestige) | Run 2+ only |

---

## 2. Ekonomija Brojeva

### Harvest RNG (po danu, modifikovan vremenskim eventima)

```
harvest_raw[sirovina] = floor(base_min + rand() * (base_max - base_min)) * weather_mult

weather_mult: ☀️ = 1.0, ⛅ = 0.85, 🌧️ = 0.60
```

**REŠENJE MEDIUM #1 — Floor garantija:**
- Paprike: min floor **25 kg** (ne 0), max 80 kg
- Paradajz: min floor **15 kg**, max 60 kg
- Ostatak sirovine (jabuke/šljive/krastavci/kupus): floor **0 kg** (ne garantovano svaki dan — treba da tražiš)
- Berba daje **uvek bar 2 sirovine na ≥20 kg** (paprike + paradajz) + random 1–3 od ostalih

### Recipe Yield Formule

```
ajvar_yield_tegle  = floor(input_kg * 0.18)       # 80 kg paprika → ~14 tegli
sos_yield_tegle    = floor(input_kg * 0.22)        # 30 kg → ~6 tegli  
pelat_yield_tegle  = floor(input_kg * 0.20)        # 45 kg → ~9 tegli
dzem_yield_tegle   = floor(input_kg * 0.25)        # 20 kg → 5 tegli
pekmez_yield_tegle = floor(input_kg * 0.28)        # 12 kg → 3 tegli
tursija_yield_tegle = floor(input_kg * 0.15)       # 30 kg total → 4–5 tegli (pasivno)
suseno_yield       = floor(input_kg * 0.30)        # suvo voće (u kg)
rakija_yield_L     = floor(input_kg * 0.08)        # jabuke 15 kg → 1.2 L  
medenjaci_yield    = floor(rakija_L * 3 + susene_kg * 2)  # prestige formula
```

### Kasa (RSD) Prihod

| Tip tegle | Cena/tegla (bez pijace) | Cena/tegla (pijaca, prestige) |
|---|---|---|
| Ajvar | 850 | 1400 |
| Sos | 450 | 700 |
| Pelat | 380 | 580 |
| Džem | 520 | 850 |
| Pekmez | 690 | 1050 |
| Turšija | 420 | 640 |
| Medenjaci | — | 1800 (prestige only) |

### Decay Rate

```
decay_chance_per_day[sirovina] = base_decay * (1 + days_held^0.8 / 10)
base_decay: jabuke 0.12, paradajz 0.10, paprike 0.08, kupus 0.06, šljive 0.05
```

Tegle ne trule — samo sirovine u skladištu trule. Berba →odmah prerada = 0 rizika.

---

## 3. Bačva Mechanic (CRITICAL #1 iz concept-a, REŠENO)

```
bačva_status: "unsalted" | "critical_window" | "fermenting" | "ready" | "failed"
```

- **Dan 1–4:** `bačva_status: "unsalted"` — Priprema kupusa moguća
- **Dan 3–4:** `bačva_status: "critical_window"` — Mora se izvršiti "Utisni kupus" (2 slota) **pre isteka Dana 4**
- Ako Dan 5 počne a status je još `unsalted` → `"failed"`, kupus propada (sav na stoku)
- Posle uspešnog utiska: `"fermenting"` → **7 in-game dana** → `"ready"`
- Turšija (krastavci) = zasebna mehanika, fermentacija **3 in-game dana** (pasivna)

**REŠENJE CRITICAL #2 — Fermentacija timing:** Sve fermentacije su **kompresovane na 3–7 in-game dana**, ne realnih. Kiseli kupus (bačva) = 7 dana, turšija = 3 dana. Sa 14-dnevnim run-om: kupus utisnut Dan 3 → ready Dan 10 ✓; turšija Dan 5 → ready Dan 8 ✓.

---

## 4. Rakija Unlock (REŠENO CRITICAL #3)

- **Unlock uslov:** Dan 7+ **i** (≥15 kg jabuka **ili** ≥10 kg šljiva u stoku)
- Troši **3 action slots** (ceo radni dan)
- Output: Rakija Reserve u posebnoj kategoriji (ne u polici)
- Medenjaci = **Run 2+ only** (zahteva sušene šljive + Rakija Reserve iz prethodnog run-a)
- **Single-run prestige alternativa:** "Džem od divlje jabuke" (specijalni recept Run 2+, zahteva džem ≥5 tegli iz Run 1 carry-over)

---

## 5. Shelf Upgrade System (REŠENO CRITICAL #1 storage matematika)

Bazno stanje: **2 police = 40 tegli**. Prestige threshold ≥120 dostupan tek posle Upgrade 4.

| Upgrade | Cena (RSD) | Police | Kapacitet (tegle) | Unlock uslov |
|---|---|---|---|---|
| Base | — | 2 | 40 | start |
| Shelf +1 | 500 | 3 | 60 | ≥300 kasa |
| Shelf +2 | 1500 | 4 | 80 | ≥800 kasa |
| Shelf +3 | 2500 | 5 | 100 | ≥1500 kasa |
| Shelf +4 (Prestige buy) | 5000 | 6 | 120 | prestige loop aktivan |

Svaki upgrade troši 1 action slot + navedenu sumu. Kapacitet se proverava pre svake akcije punjenja tegle.

---

## 6. Prestige Loop Matematika

**Uslovi za aktivaciju prestige loop-a (Run 1 ending):**
- ≥120 tegli (zahteva Shelf +4, dakle Kasa ≥10.300 RSD tokom run-a + prestige buy)
- ≥500 kasa na kraju Dana 14
- `bačva_status: "ready"` ili `"fermenting"` do Dana 14

**Prestige bonusi (u Run 2+):**
- +20% Recipe Efficiency (yield formule × 1.20)
- Pijaca unlock (prestige prodajna cena kolona)
- "Komandir bačve" — pH mini-game (3 pitanja o kiselosti, +15% ferment speed ako tačno)
- Medenjaci recept dostupan
- Carry-over: Rakija Reserve (sav L), Sušene šljive (sve kg), Džem (sve tegle)

**Post-fix_score formula (standard KORAK 7):** ne dira se ovde.

---

## 7. Tabela Recepata (kompletna)

| Recept | Sirovina | Min input | Slots | Yield formula | Tegla tip |
|---|---|---|---|---|---|
| Pečene paprike | Paprike | 10 kg | 1 | 1:1 kg (intermediate) | — |
| Ajvar | Pečene paprike | 20 kg | 2 | ×0.18 | ajvar |
| Paradajz sos | Paradajz | 10 kg | 1 | ×0.22 | sos |
| Pelat | Paradajz | 15 kg | 1 | ×0.20 | pelat |
| Turšija (pasivna) | Krastavci + bostanuša | 10+5 kg | 1 init | ×0.15, 3 dana | turšija |
| Džem od jabuke | Jabuke | 8 kg | 1 | ×0.25 | džem |
| Sušene šljive | Šljive | 5 kg | 1 init | ×0.30, 2 dana | sušeno |
| Pekmez od šljiva | Šljive | 12 kg | 1 | ×0.28 | pekmez |
| Rakija | Jabuke ≥15 kg ILI Šljive ≥10 kg | — | 3 | ×0.08 (L) | reserve |
| Kiseli kupus | Kupus | 20 kg | 2 | bačva mechanic, 7 dana | bačva |
| Džem od divlje jabuke | Džem carry-over (Run 2+) | 5 tegli | 1 | ×1.5 tegle → džem div. | džem_divlji |
| Medenjaci | Rakija R. + Sušene šljive (Run 2+) | 1L + 5 kg | 2 | ×3L + ×2kg | medenjaci |

---

## 8. Balance Table — Harvest RNG Pool

Dnevni pool (pre weather mult):

| Sirovina | Floor (garantija) | Prosek | Max | Frekvencija pojave |
|---|---|---|---|---|
| Paprike | 25 kg | 52 kg | 80 kg | svaki dan |
| Paradajz | 15 kg | 37 kg | 60 kg | svaki dan |
| Jabuke | 0 kg | 18 kg | 40 kg | 60% dana |
| Šljive | 0 kg | 14 kg | 35 kg | 50% dana |
| Krastavci | 0 kg | 12 kg | 25 kg | 40% dana |
| Bostanuša | 0 kg | 8 kg | 15 kg | 40% dana |
| Kupus | 0 kg | 22 kg | 45 kg | 30% dana, visoka masa |

---

## 9. Dnevni Event Pool

3 eventi po danu, bez ponavljanja istog u 2 uzastopna dana:

| Event | Verovatnoća | Efekat |
|---|---|---|
| Komšijina tegla | 15% | +1 besplatna tegla (random tip), +50 kasa |
| Kiša (najava) | 20% | Sutrašnji weather_mult = 0.60 |
| Sunčan dan (najava) | 18% | Sutrašnji weather_mult = 1.0 |
| Berač prođe | 12% | +1 slot ekstra danas |
| Tegla puknuta | 10% | -1 tegla random iz police |
| Mesna otkup | 8% | Masa ponuda: 600 RSD/tegla za sos/pelat (prihvati ili odbij) |
| pH check (bačva) | 8% | Mini-game: tačan odgovor = -1 dan fermentacije |
| Bačva KO | 5% | Bačva status degradira 1 stepen → ako "fermenting" → "critical" |
| Susedova rakija | 4% | +0.5L Rakija Reserve (poklon) |

**REŠENJE MEDIUM #2 — Forecast:** Na početku svakog dana (pre action selection), HUD prikazuje `sutra_weather` ikonicu (☀️/🌧️/⛅) i `sutra_event_hint` (npr. "berač u blizini?"). Forecast je 80% tačan (20% šansa da se promeni — nepredvidivost ostaje).

---

## 10. Pacing Po Danima (Run 1)

| Dana | Prioritet | Cilj po kraju dana |
|---|---|---|
| Dan 1–2 | Beri + peči paprike; pripremi kupus | ≥20 kg pečenih paprika; kupus u stoku ≥20 kg |
| Dan 3–4 | **BAČVA WINDOW** — Utisni kupus (2 slota!); prvi krug ajvara | Bačva: "fermenting"; ≥3 tegle ajvara |
| Dan 5–7 | Sos + pelat; turšija init; sušenje | ≥10 tegli ukupno; turšija u fermentaciji |
| Dan 7 | **Rakija unlock check** | Ako ≥15 kg jabuka → destiliši (3 slota) |
| Dan 8–10 | Džem, pekmez; turšija ready; shelf upgrade ako ≥300 kasa | ≥25 tegli; shelf ≥3 police |
| Dan 11–13 | Finalna berba + ajvar (drugi krug); kiseli kupus ready (Dan 10) | ≥60 tegli; kasa ≥2000 |
| Dan 14 | Finalna prodaja; prestige check | Ending determinator |

---

## 11. Endings (sa tačnim thresholdima)

| Ending | Uslov | Unlock |
|---|---|---|
| Imanje Prezimlelo | ≥120 tegli + ≥0 propadanja | Pijaca unlock (Run 2) |
| Dobra Zima | 80–119 tegli | Shelf +4 unlock (Run 2) |
| Dovoljno | 50–79 tegli | Standard |
| Zima bez Rezervi | <50 tegli | Fail state |
| Trula Berba | >30% sirovine propala | Worst case |
| Medenjaci | Prestige + Medenjaci crafted | Run 2+, multi-run ending |

---

## 12. MKDSLend Mechanic — Masterclass Mode (REŠENO MEDIUM #3)

Pre svakog recepta, popup (1 klik za dismiss, pamti se posle prvog puta):
- Ajvar: *"80 kg paprika → 14–16 kg gotovog ajvara (83% vode isparava). Na Guncatu, 2026 sezona: 200 kg branje za 2 dana."*
- Kiseli kupus: *"Fermentacija = Lactobacillus na delu. pH pada sa 6.5 na 3.5 za 7 dana. Sol: 2% od mase kupusa."*
- Rakija: *"Destilacija: 1 L rakije iz ~12 kg jabuka. Legalno: max 50L godišnje po domaćinstvu u Srbiji."*

Masterclass Mode toggle u settings (on by default). Direktna edukativna veza sa MKDSLend brandom bez UI overhead-a.

---

## 13. Mobile UX — Shelf Prikaz (REŠENO MEDIUM #4)

Shelf nije fixed 6×20 grid. Prikaz:

```
[Ajvar   🫙 × 14] [▶]
[Sos     🫙 × 6 ] [▶]
[Pelat   🫙 × 9 ] [▶]
[Turšija 🫙 × 4 ] [▶]
[Pekmez  🫙 × 3 ] [▶]
...
Total: 36/60 tegli  [Shelf: 3 police]
```

Svaka kategorija = jedan red, scrollable lista. Tap [▶] za detail (prodaj, status, datum). Na 375px ekranu, svaki red = 44px touch target. Nema grid overflow.

---

## 14. Verifikacija Modula (≥25 obavezno)

| Kategorija | Modul | Opis |
|---|---|---|
| **Entities (8)** | ingredient.js | Klasa sirovine: tip, kg, decay_rate, freshness |
| | recipe.js | Recipe definicija: input, output, yield_fn, slot_cost |
| | jar.js | Tegla: tip, datum_nastanka, prodajna_cena |
| | shelf.js | Police: kapacitet, lista tegli, upgrade_level |
| | event_card.js | Event: tip, efekat_fn, verovatnoća, cooldown |
| | batchjob.js | Pasivan posao: recipe_ref, start_day, end_day, status |
| | market.js | Pijaca: cenovnik, prestige_mult, unlock_state |
| | rakija.js | Rakija Reserve: L, destilat_source, run_id |
| **Systems (11)** | time_system.js | Dan counter, slot manager, end-of-day trigger |
| | fermentation.js | Passive job progress, status enum, batchjob update |
| | barrel_init.js | Bačva window logic, status machine, fail trigger |
| | decay_system.js | Dnevni decay roll po sirovini, propast update |
| | weather.js | Forecast gen, weather_mult aplikacija, 80% accuracy |
| | rng_harvest.js | Dnevni pool gen sa floor garantijama |
| | progression.js | Unlock check: police, rakija, pijaca, masterclass |
| | prestige.js | Prestige trigger, carry-over, bonus aplikacija |
| | capacity.js | Kapacitet check pre svake jar akcije |
| | event_engine.js | 3/dan draw, cooldown, efekat dispatch |
| | trade.js | Prodaja tegli, kasa update, mesna_otkup handler |
| **Render (4)** | render.js | Main render loop, scene manager |
| | shelf_renderer.js | Scrollable shelf lista, category rows |
| | hud.js | Kasa, dani, tegle total, forecast strip |
| | calendar_renderer.js | 14-dan grid, current day highlight, event dot |
| **Content (5)** | recipes_data.js | Sve recipe definicije (12 recepata) |
| | events_data.js | Ceo event pool (9 tipova) sa tekstom |
| | endings_data.js | 6 ending-a sa threshold-ima i tekstovima |
| | aforizmi.js | Pera Period mikro-aforizmi za event feedback |
| | brand_hooks.js | Masterclass Mode tekst po receptu (Guncati/MKDSLend) |
| **Core (6)** | main.js | Entry point, game loop wire |
| | config.js | Sve konstante: formule, dani, cene, thresholds |
| | state.js | Game state, save/load localStorage, prestige carry-over |
| | audio.js | Web Audio: clink tegle, kiša ambient, ferment bubble |
| | share.js | html2canvas screenshot + Web Share API |
| | input.js | Touch + click handlers, shelf scroll |
| **Styles (4)** | base.css | Layout, full-screen |
| | ui.css | HUD, dugmad, event card dizajn |
| | game.css | Shelf animacije, pulse na bačva window |
| | theme.css | Guncati paleta (zemlja, crvena, zelena) |

**Ukupno: 38 modula ≥ 25 ✅**

---

## 15. Negin Premortem — Rešenja Summary

| # | Problem | Status | GDD sekcija |
|---|---|---|---|
| CRITICAL #1 | Storage 80 max vs. prestige 120 | ✅ Shelf upgrade system (§5) | §5, §7 |
| CRITICAL #2 | Turšija 7–21 dana > 14-dnevni run | ✅ Kompresija: kupus 7d, turšija 3d in-game | §3 |
| CRITICAL #3 | Rakija Dan 10 = trap; Medenjaci nejasni | ✅ Dan 7 unlock; Medenjaci Run 2+ explicit | §4 |
| MEDIUM #1 | RNG floor 0 = unwinnable | ✅ Floor: paprike 25 kg, paradajz 15 kg guaranteed | §2, §8 |
| MEDIUM #2 | Retroaktivna kiša bez forecastinga | ✅ 1-dan forecast strip u HUD-u | §9 |
| MEDIUM #3 | MKDSLend veza samo slogan | ✅ Masterclass Mode popup po receptu | §12 |
| MEDIUM #4 | 80 tegli u grid na 375px | ✅ Scrollable category lista | §13 |
