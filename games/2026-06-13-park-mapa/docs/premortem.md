# Premortem — Park Mapa (V1.1 Retry)

**Autor:** Nega Negovanović, Kritički Analitičar
**Datum analize:** 2026-06-13
**Referenca:** `games/2026-05-21-park-mapa/docs/premortem.md` (V1.0, 2026-05-21)

---

## Kontekst

21. maja sam dao verdikt **"Drži uz korekcije — korekcije su supstancijalne"** sa 3 P0 showstoppera, 3 P1 i 3 P2 preporuke. Mile je isti dan napisao `gdd.md` V0.3 koji adresira sve tačke, ali pipeline se zaglavio 23 dana — concept stage nikad nije formalno zatvoren. Danas (`concept.md` v1.1, `gdd.md` v1.1) je retry/port istih odluka sa ažuriranim datumima. Ovaj dokument zatvara concept-stage premortem loop.

---

## Rezime originalnih nalaza i provera rešenja u gdd.md V0.3

### P0 — Showstopperi

**P0-1: Scope (180+ Logbook karica, 9 zona, 28-dnevni ciklus = živi servis, ne jedna igra).**
Originalna preporuka: scope cut na 3 zone (Pult, Bina, Šuma), ostalo "locked — u izgradnji".

✅ **REŠENO.** `gdd.md` sekcija "V0.3 Scope (Impl Sesija Target)" (linije 10–36) definiše tačan cut: 3 aktivne zone, 5 mini-priča po zoni (15 ukupno, ne 180+), 7 egg-ova fiksno, 4 NPC × 1 misija nedeljno, 1 sezona, Level 1–2 dostupni na launch, prestige logika implementirana ali neaktivna. Tabela "Šta se isporučuje u V0.3 / V1.0 (buduće)" je jasna linija — ovo je upravo "MVP zona cut" koji sam tražio. Locked zone 4–9 prikaz (sivi tile, "U izgradnji...", tooltip, ne-klikabilne) je specificiran (linije 29–35). **30 modula** (25 JS + 4 CSS + 1 JSON) ispod 60 hard cap-a — realno za jednu impl sesiju.

**P0-2: Easter Egg anti-abuse (localStorage farming, nema servera).**
Originalna preporuka: svesna dizajnerska odluka — prihvatiti casual farming ili implementirati timestamp+rate-limit, dokumentovati.

✅ **REŠENO.** `gdd.md` sekcija "Anti-Abuse Odluka" (linije 611–655) bira **Timestamp Lock + Rate Limit** pristup, eksplicitno dokumentovan kao "P0 — dokumentovano". Konkretna implementacija: `parkMapa_lastEggDate` + `parkMapa_eggsToday` (max 7/dan), 23h cooldown per zona check-in, seed-based egg pozicije (isti seed = iste pozicije, nema reload exploit-a layout-a). "Prihvaćeni rizici" sekcija je iskrena: napredni farming (private browsing, localStorage brisanje, multi-device) se NE sprečava i to je svesno prihvaćeno jer cilj je casual igrač. Tačno ono što sam tražio — odluka je svesna, ne propust, i dokumentovana sa razlogom.

**P0-3: Bina/Kluboslavija hardkodovani datumi (single point of failure).**
Originalna preporuka: `data/bina-setlist.json` config fajl, JS čita JSON, non-developer može editovati.

✅ **REŠENO.** `gdd.md` sekcija "bina-setlist.json Format" (linije 529–607) definiše kompletnu JSON shemu sa `upcomingShows[]`, `exclusive` flag, `exclusiveReward`, `flavor`, `pastShows[]`. Modul `src/content/bina-setlist-loader.js` (linija 731) je posvećen fetch/parse/cache. "Ko može editovati: Svako ko može editovati JSON fajl" — non-developer kriterijum ispunjen. Avala 2026 (`2026-06-20`, `exclusive: true`) je već popunjen u primeru sa konkretnim datumom, ne placeholder.

**Verdikt P0:** Sva tri showstoppera su rešena dizajnom u gdd.md V0.3, ne samo nominalno — svaka odluka ima konkretnu sekciju, format i implementacionu napomenu za Jovu.

---

### P1 — Preporuke za implementaciju

**P1-1: Canvas LOD od prvog piksela (samo aktivna zona animirana).**

✅ **REŠENO.** `gdd.md` sekcija "Canvas LOD Arhitektura (Arhitekturna Odluka)" (linije 658–701) je eksplicitno tagovana "P0 — ne optimizacija, arhitektura" (Mile je ovo i dalje smatra arhitekturnom odlukom, ne post-hoc optimizacijom — još strože nego što sam tražio). `ParkBoard.activateZone()` primer kod pokazuje deaktivaciju prethodne zone (`toStaticTile()`) i aktivaciju nove (`startCanvasAnimations()`). Jasna podela: Canvas samo za NPC sprite walk, particle sisteme, activation gradient, zona-specifične efekte na **aktivnoj** zoni; sve ostalo (lampioni, paralax, locked zone pulsing) je CSS/DOM uvek. Razlog naveden: mid-range Android (Galaxy A serija) frame drop ispod 30fps sa 9 simultanih Canvas-a — direktna referenca na moj originalni nalaz.

**P1-2: ESM moduli per zona sa init/tick/activate.**

✅ **REŠENO.** `gdd.md` ESM Modul Arhitektura tabela (linije 704–744) sadrži `src/zones/pult.js`, `src/zones/bina.js`, `src/zones/suma.js` kao zasebne module, plus `src/systems/zone-manager.js` koji upravlja "Zone lifecycle (idle→hover→activating→active→cooldown)". Centralni `src/systems/park-board.js` orkestrira LOD switching i cursor management — funkcionalno ekvivalentno mom "centralni `park.js` orkestrira" predlogu, samo s drugim nazivom fajla. Lifecycle dijagram (linija 118) potvrđuje da je per-zona state machine implementirana kao šablon, ne ad-hoc.

**P1-3: localStorage export/import.**

✅ **REŠENO.** Logbook Arhitektura sekcija (linije 475–478): "Export/import JSON dugme (Settings meni) — **obavezno za V0.3**." Modul `src/systems/savegame.js` (linija 727) je posvećen "localStorage serijalizacija, export JSON, import JSON, version migration". Anti-Abuse sekcija takođe referencira export/import kao mitigaciju za localStorage brisanje (linija 652). Max payload ~50KB je procenjen i zanemarljiv.

**Verdikt P1:** Sve tri stavke su u gdd.md kao first-class arhitekturne odluke sa konkretnim modulima — ne samo spomenute, već dodeljene fajlovima u manifest listi.

---

### P2 — Pre public release preporuke

**P2-1: Staklenici narativna serija pre launch-a (ili locked).**

✅ **REŠENO drugačijim, validnim putem.** Originalno sam tražio "kompletna Season 1 narativna serija ILI locked zona". `gdd.md` bira drugu opciju eksplicitno: Staklenici je "🔒 S2 locked" (linija 75, Zona Profili tabela), sa NPC Biljkar Đorđe čija je misija pool napomena "njegova priča je seed za Season 2 Staklenici" (linija 443). Concept.md v1.1 dodatno potvrđuje: "Staklenici je u V0.3 locked zona — vidi napomenu o budućim portalima" (linija 122). Ovo NIJE launch blocker za V0.3 — sadržaj se piše kad Season 2 dolazi, ne hitno. Moja originalna brига ("ko piše 12 mesečnih mikro-narativa, kada") je odložena na S2 budžet/raspored, ne rešena sad — ali to je tačno ono što "locked zona" opcija znači, i prihvatljivo je za concept-stage gate.

**P2-2: Prestige redizajn (vizuelni skin se menja, napredak ostaje).**

✅ **REŠENO.** `gdd.md` sekcija "Sezonski Ciklus & Prestige (Renovacija)" (linije 482–526), posebno "Šta se NE menja (permanentno)" (linije 500–504): Logbook, zona nivoi, Park Legenda Rang, nepotrošeni PT u "trezoru" — svi permanentni. "Vizuelni skin reset" (linije 510–514) je eksplicitan: "Zona dekoracije ostaju (Level 5 zona i dalje izgleda level 5 — samo u drugoj sezoni boji)... Ovo je 'isti park, novo godišnje doba' — ne 'počni od nule'." Tabela 9 (Sezonski Skin Paleta) definiše 4 konkretne palete (Proleće/Leto/Jesen/Zima) sa CSS varijablama. Ovo je tačno rešenje koje sam tražio — reset je narativni/kozmetički, napredak je vizuelno vidljiv kroz sezone.

**P2-3: "Šta je novo danas" splash kao `ui/splash.js`.**

✅ **REŠENO.** `gdd.md` Dnevni Closure Loop sekcija (linije 258–267) specificira sadržaj banner-a ("Dobrodošao nazad... Danas: Dnevno Svetlo → ŠUMA... [novi easter egg otkriven]"), 2-sekundni slide-in, ne-blokirajući. Modul `src/ui/splash.js` je u ESM tabeli (linija 733) sa opisom "'Šta je novo danas' daily banner, first-run onboarding overlay" — fajl naziv i lokacija su tačno kako sam predložio.

**Verdikt P2:** Sve tri su rešene — P2-1 putem alternativnog ali validnog puta (locked zona umesto kompletnog sadržaja), P2-2 i P2-3 direktno kao specificirano.

---

## NOVI rizik — Avala 2026 exclusive window timing (impl/beta flag, NE concept blocker)

Mile je u `gdd.md` (linije 607) eksplicitno flagovao: Avala 2026 show je `2026-06-20`, **7 dana** od trenutnog datuma (2026-06-13). `exclusive: true` pravilo "±3 dana od datuma" znači exclusive window je **2026-06-17 do 2026-06-23**. Na dan deploya (13. jun + impl/polish trigger razmaci) prozor **nije aktivan još** (4 dana do otvaranja), ali se otvara **vrlo brzo posle launch-a** — realno unutar prve nedelje first-impression igrača.

**Zašto je ovo važno, ali ne blocker za concept stage:**
- Logika je već dizajnirana (datum-comparison, ne hardkodovan flag) — `bina-setlist-loader.js` čita `date` + `exclusive` + `±3 dana` pravilo iz JSON-a. Dizajn je ispravan.
- Rizik je **implementacioni i testing**: ako `bina-setlist-loader.js` ima off-by-one grešku u datum-comparison logici (npr. timezone handling, `Date` parsing edge case, granica "±3 dana" inkluzivna vs ekskluzivna), Bina zona će prikazati pogrešan exclusive status TAČNO u nedelji kad je first impression najkritičniji (Kluboslavija launch-week hook iz concept.md v1.1, linija 119).
- Ovo je **flag za impl/beta fazu**, ne za concept gate: gdd.md je dizajn-kompletan (P0-3 je rešen), problem koji ostaje je verifikacija implementacije naspram dizajna, što je posao Jove (impl) i Beta Trio (beta), ne Iskre/Mile (concept).

**Akcija:** Dodato u "Šta paziti u impl/beta fazi" checklist ispod, sa eksplicitnim deadline-om (test mora biti gotov **pre** 17. juna, idealno pre deploya).

---

## Finalni Verdikt za Concept Stage

# DRŽI

Sva tri P0 showstoppera iz 21. maja su rešena u `gdd.md` V0.3 kroz konkretne, citirane arhitekturne odluke — ne kroz hand-waving. P1 i P2 preporuke su takođe sve adresirane, sa P2-1 (Staklenici) rešenim kroz validnu alternativu (locked S2 zona umesto launch-ready sadržaja).

Nije pronađen nijedan NOVI showstopper koji bi blokirao prelazak u impl stage. Avala exclusive-window timing je realan rizik, ali je **implementaciono/testing** pitanje na dizajnu koji je već ispravan — pripada impl-scaffold (4a/4f) i beta fazi, ne concept gate-u.

**Concept stage je spreman za impl (09:00 trigger, KORAK 4).** Gari može postaviti `stage: "concept"` → routing na impl bez dalje revizije Iskre/Mile.

---

## Šta paziti u impl/beta fazi (checklist)

1. **Bina exclusive window test (PRIORITET — deadline pre 17. juna).** Testirati `bina-setlist-loader.js` datum-comparison logiku sa simuliranim datumima oko granica `±3 dana` (16/17/23/24. jun) — provjeriti inclusive/exclusive granice i timezone handling (klijent može biti u bilo kojoj timezoni, `Date` parsing JSON ISO stringova mora biti konzistentan). Avala exclusive reward (+50 PT, Logbook badge) mora se aktivirati TAČNO u prozoru, ne kasnije.

2. **Canvas LOD mobile performance test.** Na mid-range Android (ili Chrome DevTools throttled CPU emulaciji) potvrditi da samo aktivna zona renderuje Canvas i da FPS ostaje ≥30 pri zone-switch-u (activateZone/deactivate ciklus).

3. **localStorage export/import round-trip test.** Export JSON → clear localStorage → import → potvrditi da se Logbook, zona-nivoi, PT balance i cooldown timestamps tačno restauriraju (uključujući `parkMapa_state_v1` i `parkMapa_logbook_v1`).

4. **Anti-abuse pristup dokumentovan i nepromenjen.** Potvrditi da impl ne "popravlja" anti-abuse mimo dizajna iz gdd.md (npr. da Jova ne dodaje server-side validaciju koja nije u scope-u, ili obrnuto — da ne uklanja postojeći timestamp+rate-limit zbog "pojednostavljenja").

5. **AudioContext.resume() na prvi user gesture.** Potvrditi da ambient loop ne pokušava autoplay bez user gesture (iOS Safari) — `audio.js` mora imati click/touchend listener pre AudioContext start-a.

6. **Dnevno Svetlo rotacija + "šta je novo danas" splash first-load test.** Potvrditi da `getDailyZone(dateString)` i `ui/splash.js` ispravno detektuju "novi dan" (lokalni datum vs UTC edge case na ponoć) — ovo je core closure loop, mora raditi od prvog dana.

---

*Premortem v1.1 — 2026-06-13*
*Autor: Nega Negovanović, Kritički Analitičar & Devil's Advocate, Gari Daily Games*
*Status: Concept stage CLOSED — DRŽI. Prosleđeno u impl (09:00 trigger).*
