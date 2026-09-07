# GDD — Put do Guncata

**Autor:** Mile Mehanika
**Input:** `docs/concept.md` (Iskra) + `docs/premortem.md` (Nega — "Drži uz korekcije", 7 nalaza)
**Datum:** 2026-09-07
**Status:** Rešava sve korekcije iz premortem-a (Rizik 1–4, 6, 7 direktno; Rizik 5 jednom rečenicom niže)

---

## 0. Single-layer izuzetak (Rizik 5, jedna rečenica)

Ova igra je namerno single-layer (žanr diverzitet posle dva multi-layer projekta zaredom — Crew Recruiter, Jesenji Tok), izuzetak od CLAUDE.md multi-layer default pravila za branded/utility igre — vidi Žanr Paleta sekciju. Dokumentovano ovde i u concept.md da spreči lažni "drift" alarm u budućim retrospektivama.

---

## 1. MEHANIKE PO ETAPI

Svaka etapa ima: input tip, target trajanje, formulu bodovanja/težine, feedback signale. Baseline Pripremljenost = **50** (neutralna polazna vrednost pre bilo koje etape), svaka etapa dodaje/oduzima deltu, finalni score = `clamp(50 + Δ1 + Δ2 + Δ3 + Δ4 + Δ5, 0, 100)`.

### Etapa 1 — Beograd Parkiralište
- **Input:** tap timing (radial meter)
- **Target trajanje:** 45–60s (hard cap 60s countdown)
- **Mehanika:** Radijalni meter kruži oko parking-mesta ikone; "sweet spot" zona je 20% obima kruga i pomera se nasumično svakih 15s. Igrač tapće da "uđe" u zonu. Neuspešan tap NE prekida igru — samo troši 5s od preostalog vremena (anti-fail, konzistentno sa GDG tonom). Ako 60s istekne bez uspešnog tap-a, auto-park fallback (accuracy = 0).
- **Formula:**
  ```
  offset = |tap_position - zone_center| (0–100, 0 = savršen pogodak)
  accuracy = clamp(100 - offset * 1.4, 0, 100)
  Δ1 = round(accuracy / 100 * 20) - 5   → raspon: -5 .. +15
  ```
- **Feedback signali:** zona menja boju kad je tap blizu (žuta → zelena), kratak "SPARK" mikro-flash na uspešnom tap-u, brojčani accuracy% prikazan 1s posle poteza. Radio overlay (Pera Period aforizam) igra u pozadini nezavisno od uspeha — ambijentalna doza brenda, ne nagrada za dobru igru.

### Etapa 2 — Autoput E75 (najduža etapa)
- **Input:** resource-balance (pasivni decay + aktivni tap-ovi na radio/event)
- **Target trajanje:** ~180s (3 min)
- **Mehanika:** Gorivo opada 100→0 preko ~150s baseline brzine (0.67/s), igrač može "smanjiti gas" (tap na sporiji ritam ikonicu) da uspori decay za 30% na 10s cooldown-u, po cenu produžetka etape (ne bod-relevantno, samo pacing). 2–3 random eventa (gužva/pojačanje/pogrešan izlaz) tokom etape, svaki daje 2s reakcioni prozor za tap. Mood/radio: 3 stanice, tap za promenu, čisto engagement (bez skill-gate-a).
- **Formula:**
  ```
  fuel_score = round(fuel_at_end / 100 * 15)              → 0 .. 15
  event_score = Σ (event: +3 tačan tap unutar 2s, -2 promašen/nema reakcije)
                capped na raspon -6 .. +9 (za 2-3 eventa)
  mood_bonus = +1 ako je igrač bar jednom promenio stanicu, inače 0
  Δ2 = clamp(fuel_score + event_score + mood_bonus, -10, 25)
  ```
- **Feedback signali (Rizik 7 — vidljiv trenutan feedback, KLJUČNI dodatak):**
  - Gorivo bar menja boju kontinualno: zeleno (>50%) → žuto (20–50%) → crveno + **pulsiranje** (<20%) — trenutan, jasan "stakes" signal bez potrebe za fail state-om.
  - Mood indikator (mala ikonica lica) menja izraz po aktivnoj radio stanici (neutral/veselo/fokusirano) — jeftin cosmetic feedback, ne utiče na formulu.
  - Posle svakog random event-a: floating popup broj (`+3` zeleno / `-2` crveno) iznad HUD-a, traje 800ms, direktno pokazuje uticaj na Pripremljenost u trenutku odluke — ovo je konkretna implementacija Rizik 7 korekcije iz premortem-a (`systems/pripremljenost.js` emituje event, `ui.js` renderuje popup).

### Etapa 3 — Skretanje u selu (Rizik 1 + Rizik 4 rešeni ovde)
- **Input:** choice-tap (3 table)
- **Target trajanje:** 45–60s (EKSPLICITAN budžet — rešava Rizik 4 rupu u pacing spec-u)
- **Mehanika:** Tri table — Brže / Slikovitije / Sigurnije. Izbor je **narativno slep** (ne zna se šta sledi), ali **mehanički providan po dizajnu**:
  ```
  Δ3 = 0 (FIKSNO, za sve tri rute, bez izuzetka)
  ```
  Ovo je direktno rešenje Rizika 1 ("slep stat-check" problem iz premortem-a): ruta ne nosi skriveni bonus/penal. Radoznalost ostaje ("šta ću videti"), kockanje nestaje ("koliko ću izgubiti"). Cela varijacija ide kroz etapu 4 (vidi mapiranje niže) — igrač bira STIL puta, ne VREDNOST puta.
- **Brand hook (Rizik 4 / Brand-utility rupa):** Ambijentalni Branin trag je vidljiv na **SVE TRI** rute — kratka pozadinska linija (glas iz daljine ili putokaz tekst, 1 rečenica, npr. *"Neko sa jezera dovikuje nešto o ribama..."*), dok je puna 3-rečenična verzija (Brana uživo objašnjava akvakulturni sistem) rezervisana za "Slikovitije" rutu kao bonus. Rezultat: 3/3 run-a dodiruju Guncati edukativni sadržaj (bilo tračak, bilo puna verzija), ne 1/3 kao u originalnom konceptu.
- **Feedback signali:** table imaju kratku CSS hover/tap animaciju (naginjanje table kao potvrda izbora), fade-wipe tranzicija u etapu 4 markira prelaz.

### Etapa 4 — Šumski put (Rizik 1 rešenje — ovde živi VARIJACIJA)
- **Input:** swipe/tap obstacle dodge
- **Target trajanje:** ~90s (fiksno, ne menja se po ruti — broj/brzina prepreka se menja, ukupno trajanje ostaje ~90s)
- **Mehanika:** Prepreke (šarafi = tap-dodge, blato = swipe-strane, grane = tap-duck) spadaju nasumično u putanju. Broj i brzina prepreka zavise od **etapa 3 rute** (vidi tabelu u sekciji 6), ali **formula bodovanja pogotka je IDENTIČNA za sve tri rute** — težina ulaska u sistem se menja, vrednost svakog pojedinačnog uspeha/promašaja ne.
- **Formula:**
  ```
  hit_rate = uspešno_izbegnuto / ukupno_prepreka
  Δ4 = round(clamp(hit_rate, 0, 1) * 30) - 10   → raspon: -10 .. +20
  ```
- **Feedback signali:** svaka izbegnuta prepreka daje mikro "whoosh" + kratak zeleni rub-flash ekrana; pogodak daje kratak screen-shake + crveni rub-flash. Progress bar (koliko prepreka ostalo) je uvek vidljiv.

### Etapa 5 — Guncati Jezero, dolazak (Rizik 2 rešenje — epilog matrica)
- **Input:** pasivni narativni scroll/read
- **Target trajanje:** 90–120s (ne žuri, čitanje + share card)
- **Mehanika:** Prikazuje finalni score i epilog scenu. **Δ5 = 0** — etapa 5 ne dodaje/oduzima poene, samo prikazuje kumulativni rezultat prethodne 4 etape (Δ3 je uvek 0, pa efektivno Δ1+Δ2+Δ4 određuju bucket).
- **Grananje (rešava Rizik 2 — dve nepomirene ose):** Tekst prati **SCORE BUCKET** (3 varijante, zelena/žuta/humor — već formalizovano u WIN CONDITION). Ruta NE dobija sopstveni tekst — utiče samo na **jednu umetnutu flavor rečenicu** (koji pejzažni detalj/životinja se pominje) unutar bazne bucket scene. Day/night (prestige) menja paletu/audio/uvodnu-zatvornu liniju, ne bazni tekst. Detaljna matrica u sekciji 7.
- **Feedback signali:** finalni score broji uzlazno (count-up animacija 0→score%), share card se generiše automatski, "Odigraj Guncati Grand" crosslink prompt se pojavljuje SAMO na zelenom ishodu.

---

## 2. PROGRESSION / PACING (0–20 min)

| Vreme | Etapa | Šta se dešava |
|-------|-------|----------------|
| 0:00–0:60 | Etapa 1 — Parkiralište | Timing puzzle, radio uvod (Pera aforizam #1) |
| 0:60–1:00 | Tranzicija | Fade/wipe grad→autoput |
| 1:00–4:00 | Etapa 2 — Autoput E75 | Resource balance, 2–3 random eventa, mood radio |
| 4:00–4:15 | Tranzicija | Highway hum → seoski ambient |
| 4:15–5:15 | Etapa 3 — Skretanje | Choice UI, Branin ambijentalni/puni hook |
| 5:15–5:30 | Tranzicija | Fade u šumu (paleta menja se po ruti-modifikovanom tempu) |
| 5:30–7:00 | Etapa 4 — Šumski put | Obstacle dodge, 90s ± mala varijansa po ruti |
| 7:00–7:15 | Tranzicija | Šuma → jezero |
| 7:15–9:00 | Etapa 5 — Dolazak | Epilog scena, score reveal, share card |
| 9:00+ | Post-run | "Odigraj Guncati Grand" (zeleni bucket) ili replay poziv |

**Ukupno jedan run: ~9 min mehanike + čitanje/pauze/UI tranzicije realno donosi do 15–20 min sesijski target** (igrač ne žuri kroz dialogue/scene-overlay tekst, posebno etapa 3/5 narativni tempo — konzistentno sa concept.md session target sekcijom, koja već računa na ne-žurenje kao deo od 15-20 min, ne na čist mehanički vremenski zbir).

---

## 3. EKONOMIJA — PRIPREMLJENOST FORMULA (precizno)

```
BASE = 50

Δ1 (Etapa 1, parking)     : -5 .. +15   (accuracy-driven)
Δ2 (Etapa 2, autoput)     : -10 .. +25  (fuel + event + mood)
Δ3 (Etapa 3, skretanje)   : 0 FIKSNO    (rešava Rizik 1)
Δ4 (Etapa 4, šumski put)  : -10 .. +20  (hit-rate driven, ruta menja težinu ne formulu)
Δ5 (Etapa 5, dolazak)     : 0 FIKSNO    (čist reveal, ne scoring)

FINALNI SCORE = clamp(BASE + Δ1 + Δ2 + Δ3 + Δ4 + Δ5, 0, 100)
```

**Teorijski raspon pre clamp-a:** 50 - 5 - 10 + 0 - 10 + 0 = **25** (minimum) do 50 + 15 + 25 + 0 + 20 + 0 = **110 → clamp 100** (maksimum).

**Verifikacija balansa (prosečna igra, ~50% accuracy/hit-rate svuda):**
```
Δ1 = round(0.5*20)-5 = 5
Δ2 = fuel_score(50%→8) + event(1 od 2 tačno: +3-2=+1) + mood(1) = 10
Δ4 = round(0.5*30)-10 = 5
Score = 50+5+10+0+5+0 = 70 → tačno na granici zelene scene
```
Ovo je namerno — prosečan igrač treba da završi na/iznad zelene granice (konzistentno sa anti-punitivnim tonom, "loš" ishod treba stvaran ispod-proseka rezultat, ne default). Slabija igra (25% accuracy/hit-rate svuda) daje score ≈ 48 (žuta). Loša igra (0% svuda) daje score ≈ 31 (humor, i dalje ≥25 minimum, nikad ispod).

---

## 4. PRESTIGE LOOP — "Noćna vožnja"

**Unlock uslov:** `state.completedRuns >= 1` (posle PRVOG kompletiranog run-a, bilo kog score bucket-a — nema score-gate na prestige, samo completion-gate).

**Šta se tačno menja (asset/tekst/audio swap, ne nova mehanika):**

| Etapa | Dnevna verzija | Noćna verzija (swap) |
|-------|----------------|------------------------|
| Etapa 2 | `#f5d87a` horizont, dnevni random eventi (gužva/pojačanje/pogrešan izlaz) | `#1e2d1a` paleta, noćni random eventi (magla umesto gužve, farovi drugog auta umesto pojačanja) — ISTI mehanički skelet (fuel/event/mood formula identična, Δ2 raspon nepromenjen) |
| Etapa 5 | `#3a8c5c`+`#e8dcc8` dnevna paleta, dnevni audio miks | Večernje jezero (žabe, tišina, drugačiji audio miks), ISTI epilog text-matrix sistem (score bucket i dalje određuje tekst, samo se paleta/audio/uvodna-zatvorna linija menjaju) |

**Formula unlock-a:**
```js
if (state.completedRuns >= 1) {
  state.prestigeUnlocked = true;
  // etapa2 i etapa5 loaderi biraju night variant asset/audio set
  // umesto day variant, na osnovu state.prestigeUnlocked flag-a
}
```

Nema dodatnog scoring uticaja — noćna vožnja je čisto kozmetički/atmosferski replay hook (konzistentno sa "menja mood i vizuelni kontekst" iz concept.md HOOK sekcije), ne menja Pripremljenost formulu iz sekcije 3.

---

## 5. WIN/LOSE USLOVI

| Bucket | Prag | Naziv scene | Kratak opis |
|--------|------|-------------|-------------|
| **Zelena** | ≥ 70 | "Stigao si spreman" | Jezero u punom svetlu, Brana i porodica dočekuju na obali, glinen zid i ribnjak vidljivi u pozadini. Otključava "Odigraj Guncati Grand" crosslink. |
| **Žuta** | 40–69 | "Stigao si, odmori se" | Jezero mirno, igrač sedi na klupi/dok-u, kraći tekst bez punog dočeka — i dalje pozitivan ton, ne kazna. |
| **Humor** | < 40 | "Sledećeg puta, možda mapa?" | Samoironičan epilog (npr. igrač stiže pogrešnim putem/kasno, ali stigao), i dalje jezero u kadru, share card i dalje generisan. |

Nema fail state-a ni na jednom bucket-u — sve tri su "uspešan" završetak run-a (konzistentno sa concept.md i premortem Rizik 7 zaključkom da se ovo NE menja).

---

## 6. ETAPA 3 RUTE × ETAPA 4 TEŽINA (mapiranje — rešava Rizik 1)

| Ruta (etapa 3) | Etapa 4 modifikator | Broj prepreka | Brzina/reakciono vreme | Δ3 (base score uticaj) |
|----------------|---------------------|----------------|--------------------------|--------------------------|
| **Brže** | Najteža | 12 prepreka | 1.3× brzina (~0.6s reakcija po prepreci) | **0** |
| **Slikovitije** | Najlakša + 1 flavor-tap koji NE boduje | 8 prepreka | 0.85× brzina (~1.0s reakcija), + 1 "pogledaj pejzaž" distraktor tap bez uticaja na Δ4 | **0** |
| **Sigurnije** | Srednja, duži reakcioni prozor | 10 prepreka | 1.0× brzina (~0.8s), ali +0.2s bonus reakcionog prozora po prepreci (sporiji tempo puta) | **0** |

**Ključno:** kolona "Δ3 uticaj" je uvek 0 — ruta bira KOLIKO PREPREKA I KOJOM BRZINOM igrač mora da reaguje (input difficulty), ne KOLIKO SVAKA PREPREKA VREDI (formula iz sekcije 1/3 ostaje `round(hit_rate*30)-10` identična za sve tri). Igrač koji je podjednako vešt na sve tri rute dobija podjednako raspoređen Δ4 u proseku — teža ruta (Brže) ima veći potencijal za nizak hit_rate ako igrač nije spretan, ali i identičan max (+20) ako jeste. Nema rute koja je "besplatan bonus".

---

## 7. ETAPA 5 EPILOG MATRICA (rešava Rizik 2)

**Primarna osa = SCORE BUCKET (3 bazna teksta).** Ruta menja samo umetnutu flavor rečenicu unutar bazne scene — **NE** pun poseban tekst po ruti. Day/night menja paletu/audio/uvodnu-zatvornu liniju, ne bazni tekst niti flavor rečenicu.

| Score Bucket | Bazni tekst (fiksan, 1 od 3) | Flavor umetak po ruti (1 rečenica, ubačena u bazni tekst) | Day/Night razlika |
|--------------|-------------------------------|-------------------------------------------------------------|----------------------|
| **Zelena (≥70)** | "Stigao si spreman. Guncati te čeka." + puni dolazak opis | Brže: *"Prošao si pored žitnog polja bez zastajanja."* / Slikovitije: *"Sećaš se glasa sa jezera — Brana te čeka na doku."* / Sigurnije: *"Bezbedno, korak po korak, stigao si tačno na vreme."* | Dnevna: sunčan dolazak, puna paleta `#3a8c5c`. Noćna: žabe, tišina, uvodna linija "Mesec je već iznad jezera kad..." |
| **Žuta (40–69)** | "Stigao si. Odmori se malo." + neutralan dolazak | Brže: *"Brzina je koštala malo mira usput."* / Slikovitije: *"Pejzaž je bio lep, ali si zakasnio na deo priče."* / Sigurnije: *"Nije bilo brzo, ali jeste bilo mirno."* | Dnevna: umerena svetlost. Noćna: tiši audio miks, ista fraza-struktura. |
| **Humor (<40)** | "Sledećeg puta, možda mapa?" + samoironičan dolazak | Brže: *"Brzina bez plana — klasika."* / Slikovitije: *"Gledao si pejzaž umesto puta, iskreno vredelo je."* / Sigurnije: *"Bezbedno vozio, bezbedno se izgubio."* | Dnevna: i dalje sunčano (humor ne treba mračnu paletu). Noćna: isti humor ton, "bar zvezde su lepe" zatvorna linija. |

**Broj jedinstvenih tekst-komada:** 3 bazna teksta + 9 flavor rečenica (3 bucket × 3 ruta, svaka 1 rečenica, ne pasus) + 2 day/night uvodne/zatvorne linije po bucket-u (opciono, ~6 kratkih linija) = **~18 kratkih tekst fragmenata**, ne 18 PUNIH epilog scena. Ovo je red veličine manji LOC/content trošak od "9-18 jedinstvenih epilog tekstova" scenarija koji je Nega flagovao u Riziku 2 — fragmenti se sastavljaju (compose), ne pišu ponovo za svaku kombinaciju.

---

## 8. BUILD PRIORITET (impl sesija, rešava Rizik 6)

**Protected (ne smeju biti odsečene ako budžet pritisne pred kraj 09:00 impl sesije):**
1. Core moduli (`main.js`, `config.js`, `state.js`, `router.js`, `input.js`) — bez ovih ništa ne radi
2. **Etapa 3** (`etapa3-skretanje.js`, `branching.js`, `branching-tree.js`) — nosi brand hook (Brana), gubitak ovde direktno oštećuje Guncati primary brand serves
3. **Etapa 5** (`etapa5-dolazak.js`, `end-screen.js`, `share-card.js`) — nosi Guncati payoff + Guncati Grand crosslink, gubitak ovde ubija ceo funnel svrhu igre
4. `systems/pripremljenost.js` — centralna formula, greška ovde kvari sve ostalo
5. `audio.js` — GDG default pravilo, ne opciono

**Prve kandidati za stanjivanje ako 700K–1.2M token budžet pritisne pred kraj sesije:**
1. **Etapa 1** (parking timing) — može pasti na jednostavniji single-tap bez radial-meter finese (zadržava formulu, gubi vizuelnu poliranost)
2. **Etapa 4** (obstacle dodge) — najviše "generic" mehanika po Neginoj proceni (Rizik 6); može se stanjiti na manje tipova prepreka (2 umesto 3: samo šarafi+grane, izbaci blato-swipe) bez rušenja Δ4 formule
3. `radio.js` rotacija — može startovati sa manjim pool-om aforizama (proširi se u P3 patch fazi kasnije, ne blokira release)
4. Noćna/dan prestige varijanta etape 2 (magla event) — može startovati sa recikliranim dnevnim eventima ako vreme pritisne, prava noćna event-šema ide u P2/P3 patch

---

## 9. VERIFIKACIJA MODUL LISTE (obavezna provera pre izlaska iz zadatka)

GDD rešenja iz sekcija 1–8 (Δ3=0 fiksno, epilog matrica, build prioritet, etapa2 feedback) **ne dodaju nove fajlove niti dele/spajaju postojeće module** — sve žive unutar već predviđenih modula (`systems/pripremljenost.js`, `systems/branching.js`, `content/branching-tree.js`, `ui/end-screen.js`, `ui.js`). Modul lista iz concept.md ostaje **NEPROMENJENA**:

| Kategorija | Broj modula |
|------------|-------------|
| Core | 5 |
| Entities | 6 |
| Systems | 7 |
| UI | 5 |
| Content | 4 |
| Audio | 1 |
| Styles | 4 |
| **UKUPNO** | **32** |

**32 ≥ 25 → potvrđeno.** Broj modula je identičan concept.md proceni — GDD je dodao DUBINU (formule, feedback signali, epilog fragment-kompozicija, build prioritet), ne nove module, tačno kako je Rizik 3 korekcija tražila.

### LOC procena posle dodate dubine

| Modul | Procena LOC (JS) |
|-------|-------------------|
| main.js / config.js / state.js / input.js / router.js (core) | 1430 |
| entities/* (6 fajlova) | 1800 |
| systems/* (7 fajlova) | 2040 |
| ui/* (5 fajlova) | 1300 |
| content/* (4 fajla) | 1200 |
| audio.js | 380 |
| **JS ukupno** | **~8150** |
| styles/* (4 fajla, CSS) | ~840 |

**~8150 JS linija — unutar GDG target opsega 8000–12000 za single-layer igru** (bio je 6000-8000 u konceptu, ispod donje granice; dubina iz formula/feedback/epilog-kompozicije/route-mapiranja gura ga u ispravan opseg PRE impl-a, kako je Rizik 3 tražio).

---

## 10. SAŽETAK — mapiranje na Nega korekcije

| # | Nega korekcija | Gde je rešeno u ovom GDD-u |
|---|------------------|------------------------------|
| 1 | Etapa 3 ~0 neto, varijacija kroz etapu 4 izvedbu | Sekcija 1 (Etapa 3/4), Sekcija 3 (Δ3=0 fiksno), Sekcija 6 (mapiranje) |
| 2 | Score bucket kao primarna osa epiloga, ruta = vizuelni detalj | Sekcija 7 (epilog matrica) |
| 3 | LOC dubina bez novih modula, ka 8000-12000 | Sekcija 9 (LOC tabela, ~8150) |
| 4 | Etapa 3 time budget + Branin hook na sve 3 rute | Sekcija 1 (Etapa 3: 45-60s target, ambient na sve rute) |
| 5 | Build prioritet protected vs thinnable | Sekcija 8 |
| 6 | Vidljiv trenutan feedback etapa 2 | Sekcija 1 (Etapa 2 feedback signali: gorivo bar boja/pulse, mood ikonica, +/- popup) |
