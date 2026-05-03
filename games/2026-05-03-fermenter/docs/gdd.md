# Game Design Document — Fermenter: Varenički Bunt

## 1. Mehanike

### 1.1 Fermentacija (klik mehanika)

**Šta klik radi:**
Svaki klik na bure dodaje `clickPower` šećernih jedinica (SJ) direktno u bazen kvasca. Kvasac automatski konzumira SJ i generiše Fermentacione jedinice (FJ) po stopi `fermentRate` FJ/s. FJ se akumuliraju i paralelno pune Mutacioni pritisak.

**Base vrednosti (pre svih upgrada, pre prvog prestiža):**
- `clickPower` = 1.0 SJ po kliku
- `fermentRate` = 0.2 FJ/s (base, bez upgrada)
- SJ kapacitet = 50 (buffer koji kvasac crpi)
- Kvasac troši SJ brzinom = `fermentRate × 1` (1:1 konverzija)

**Efekat upgrada na klik:**
Upgrade "Pojačana Membrana" i "Enzimski Boost" direktno skaliraju `clickPower` (videti tabelu 1.2).

**Vizuelna potvrda klika:**
Svaki klik spawn-uje 3–5 mini bubble čestica iz centra bureta, koje rastu i nestaju za 0.4s. Bure lagano "pulsira" (scale 1.0 → 1.04 → 1.0 za 120ms).

---

### 1.2 Automatizacija (idle mehanika)

Upgrejdi se kupuju iz SJ (ne FJ). Cena upgrada raste po formuli:
```
cena_level_n = baseCena × growthFactor^(n-1)
```

| # | Naziv | Efekat | Base cena | Growth factor | Cap (max level) |
|---|-------|--------|-----------|---------------|-----------------|
| 1 | **Mlečna Baza** | +0.5 FJ/s pasivno | 10 SJ | 1.18 | 20 |
| 2 | **Pojačana Membrana** | +1.0 clickPower po kliku | 25 SJ | 1.22 | 15 |
| 3 | **Micelij Mreža** | ×1.5 na sve pasivne FJ/s | 80 SJ | 1.30 | 10 |
| 4 | **Auto-Ferment I** | +2.0 FJ/s pasivno + auto-klik svakih 3s | 200 SJ | 1.35 | 8 |
| 5 | **Termal Regulator** | Smanjuje degradaciju za 60% (videti 1.6) | 350 SJ | 1.25 | 5 |
| 6 | **Presurni Katalizator** | Mutacioni pritisak raste ×1.4 brže | 600 SJ | 1.40 | 5 |
| 7 | **Auto-Ferment II** | +5.0 FJ/s pasivno + auto-klik svakih 1s | 1200 SJ | 1.50 | 5 |

**Napomena za Jovu:** SJ se trošeuju na upgrejde, ali regenerišu se pasivno kroz fermentaciju po kursu 1 FJ = 2 SJ. Igrač uvek ima nešto da troši.

**Formula ukupnog fermentRate-a:**
```
fermentRate = (0.2 + Mlečna_Baza_lvl × 0.5 + Auto_Ferment_I_lvl × 2.0 + Auto_Ferment_II_lvl × 5.0) × Micelij_multiplier
```
gde je `Micelij_multiplier = 1.5^Micelij_Mreža_lvl`.

---

### 1.3 Mutacioni pritisak

**Šta je:** Centralni progress bar (0–100%) koji predstavlja genetski stres kvasca. Vizuelno dominantan — odmah ispod bureta, cela širina ekrana, debeo (30px visina), jantarne boje sa glow efektom.

**Kako raste:**
```
pressurePerSec = fermentRate × 0.015 × Katalizator_multiplier
```
gde je `Katalizator_multiplier = 1.4^Presurni_Katalizator_lvl` (1.0 ako nema upgrada).

**Target vreme za 100%:**
- Bez upgrada, samo klik: ~220 sekundi (≈3.7 min) — realistično uz povremeni klik svake 2-3 sekunde
- Sa Mlečna Baza lvl 2 + jedan klik/s: ~160–180 sekundi (≈2.7–3.0 min)
- Sa Auto-Ferment I aktivan: ~100–120 sekundi (≈1.7–2.0 min za drugi i treći prestiže)

**HUD prikaz:**
```
[MUTACIONI PRITISAK: ████████░░ 78%]
```
Tekst iznad bara treće veličine fonta (LCD stil). Kad dostigne 80%, bar počinje da pulsira (opacity 1.0 ↔ 0.7, period 800ms). Na 100% — bar postaje beli flash i pojavljuje se dugme "MUTACIJA →".

**Posle prestiža:** Pressure se resetuje na 0%.

---

### 1.4 Prestiže sistem

**Trigger:** Mutacioni pritisak = 100%. Igrač ne mora odmah da klikne — pressure ostaje na 100% dok se ne donese odluka. Igra normalno teče (može da nastavi da fermentira).

**Šta se resetuje:**
- Sve SJ i FJ akumulirane
- Svi upgrade level-ovi (vraćaju se na 0)
- Fermentacija rate na base

**Šta OSTAJE (trajno):**
- Sve prethodno izabrane mutacije (aktivne zauvek)
- Broj prestiža (broji se 1, 2, 3)
- "Savršeni Kvasac" progress tracker (videti Sekciju 4)

**Prestiže speed bonus (implicitni):**
Mutacije koje igrač skupi čine svaku sledeću runu brežom mehanički (ne numerički scale — nego mehanički twist). Igrač drugi put igra drugačije, ne samo brže.

**Animacija prestiže:**
1. Bure "eksplodira" — canvas particle spray, 40 čestica jantarne boje, raznose se radijalno za 1.0s
2. Fade-out svega (0.5s)
3. Prikaz modal-a za izbor mutacije (3 ponuđene od pool-a, videti 1.5)
4. Igrač bira — nova hexagon badge se prikazuje u HUD corner-u
5. Fade-in praznog bureta (0.5s)
6. Igra restartuje

---

### 1.5 Mutacije (pool od 8, ponuđene 3 random svaki prestiže, bez ponavljanja već izabranih)

Svaki prestiže prikazuje 3 nasumično izabrane mutacije iz pool-a od kojih igrač još nema. Ako igrač ima 5 mutacija i ostale 3, ponuđuje svih 3 preostalih.

| ID | Naziv | Mehanički efekat | Badge znak |
|----|-------|-----------------|------------|
| M1 | **Termofilni Kvasac** | `clickPower` se duplira svakih 30s aktivnog klika (stack-uje do ×4, resetuje se na pauzu >10s) | ♨ |
| M2 | **Etanol-Rezistentan** | `fermentRate` se ne smanjuje kako raste SJ buffer — nema "ceiling penalty" na visokim nivoima | ⚗ |
| M3 | **Sporo Sazrevanje** | Svaki klik ima 20% šansu da generiše +5 FJ instant umesto +SJ. "Lucky ferment" | 🍀 |
| M4 | **Micelarna Mreža** | Pasivna FJ/s se nastavlja da teče tokom prestiže animacije (prvih 5s novog runa) — lagani "head start" | ∞ |
| M5 | **Pritisak Kaskada** | Kad pressure dostigne 50%, sledeće pola puta do 100% teče ×1.6 brže automatski | ↑↑ |
| M6 | **Osmofilna Adaptacija** | Upgejdi tipa "Auto-Ferment" imaju base cost ×0.7 (30% jeftiniji permanentno) | ◈ |
| M7 | **Endosporna Forma** | Degradacija (videti 1.6) je potpuno imuna — bure nikad ne degradira | ⬡ |
| M8 | **Bifidogena Sinerija** | Ako igrač ima 2+ prethodne mutacije aktivne, sve FJ/s se množeći sa 1.0 + (0.1 × broj_mutacija) | ✦ |

**Pravilo za Jovu:** Pool se filtrira pre prikaza — igrač ne može dobiti mutaciju koju već ima. Redosled ponude je random, ali seed-ovan na `Date.now()` u trenutku prestiža.

**Modal UI za izbor:** Tri kartice u redu. Svaka kartica: naziv (bold), badge znak (40px, centrirano), jedan-red opis efekta (plaintext, ne marketinški — "Šta se menja: ..."). Dugme "IZABERI" ispod. Bez cancel opcije — mora se izabrati.

---

### 1.6 Kontaminacija (degradacija, ne gubitak)

**Trigger:** Bure "miruje" ako `fermentRate × dt` < 0.001 FJ u poslednjih 5 minuta (300s). To znači da ni klik ni pasivni upgradi ne generišu FJ — igrač je stvarno otišao.

**Šta se dešava (degradacija, NE reset):**
```
degradationFactor = 0.95 per 30s neaktivnosti (posle threshold-a)
fermentRate_efektivni = fermentRate × degradationFactor^(intervals_inactive)
```
- Fermentacija usporava, ne staje
- SJ se ne gube
- Upgrade level-ovi ostaju
- Pressure se ne smanjuje

**Vizuelni signal:** Bure postaje sivkasto (CSS filter: saturate(0.3)), tekstualni upozorenje "KVASAC USPORAVA — klikni da oporaviš". Bez alarma zvuka.

**Recovery:** Čim igrač klikne, `degradationFactor` se resetuje na 1.0 momentalno. Jedan klik = puna oporavka. Nema penalty perioda.

**Cap degradacije:** `fermentRate_efektivni` ne može pasti ispod 10% base fermentRate-a (= 0.02 FJ/s minimum). Igra ne može potpuno da stane.

**Napomena:** Upgrade "Termal Regulator" smanjuje degradationFactor per interval sa 0.95 na 0.98 (znatno sporija degradacija). Level 5 Termal Regulator = praktično imun.

---

## 2. Ekonomija brojeva

### 2.1 Fermentacija rate — skaliranje kroz sesiju

| Faza | Vreme | FJ/s (approximate) | SJ/s generisano | Pressure/s |
|------|-------|--------------------|-----------------|------------|
| Start (bez upgrada) | 0–60s | 0.2 | 0.4 | 0.003 |
| Mlečna Baza ×2 | 60–120s | 1.2 | 2.4 | 0.018 |
| Auto-Ferment I ×1 | 120–180s | 3.2 | 6.4 | 0.048 |
| Prestiže 1 trigger | ~200–240s | — | — | 100% |
| Posle prestiže 1 (sa mutacijom) | 0–60s | 0.2+ | — | ~0.003–0.006 |
| Auto-Ferment I ×1 (brže dostignut) | 60–120s | 3.2+ | — | ~0.060–0.080 |
| Prestiže 2 trigger | ~120–160s | — | — | 100% |

**Zaključak:** Svaki prestiže komprimuje vreme za ~30–40% zbog kupljenih mutacija koje menjaju mehaniku (ne čisto numerički bonus).

### 2.2 Upgrade cene — konkretni primeri

**Mlečna Baza (base 10 SJ, ×1.18):**
| Level | Cena (SJ) | Kumulativna cena |
|-------|-----------|-----------------|
| 1 | 10 | 10 |
| 2 | 12 | 22 |
| 3 | 14 | 36 |
| 5 | 19 | 72 |
| 10 | 43 | 225 |
| 20 | 206 | 1,640 |

**Auto-Ferment I (base 200 SJ, ×1.35):**
| Level | Cena (SJ) |
|-------|-----------|
| 1 | 200 |
| 2 | 270 |
| 3 | 365 |
| 5 | 664 |
| 8 | 1,840 (cap) |

**Presurni Katalizator (base 600 SJ, ×1.40):**
| Level | Cena (SJ) | Pressure multiplier kumulativni |
|-------|-----------|--------------------------------|
| 1 | 600 | ×1.4 |
| 2 | 840 | ×1.96 |
| 3 | 1,176 | ×2.74 |
| 5 | 2,304 (cap) | ×5.38 |

### 2.3 Mutacioni pritisak rast — verifikacija timinga

**Scenario A: Samo klikeri, bez upgrada**
- Prosečan igrač klika svake 2s = 0.5 klika/s
- `fermentRate` = 0.2 + (0.5 klik/s × 1.0 SJ/klik × 1.0) = 0.2 FJ/s (SJ buffer ne utiče na base rate direktno, ali klik puni buffer)
- Realni efektivni FJ/s ≈ 0.3 (klik + base pasivno)
- `pressurePerSec` = 0.3 × 0.015 = 0.0045%/s
- Vreme do 100%: 100 / 0.0045 ≈ 222s ≈ **3.7 minuta** ✓

**Scenario B: Mlečna Baza lvl 3 + Pojačana Membrana lvl 2 + klik svake 3s**
- `fermentRate` = 0.2 + (3 × 0.5) = 1.7 FJ/s
- Klik doprinos ≈ 0.3 FJ/s efektivno (svakih 3s = 0.33 klika/s × (1.0 + 2×1.0) clickPower = ~1.0 SJ/s → konvertuje u ~0.5 FJ/s)
- Total ≈ 2.2 FJ/s
- `pressurePerSec` = 2.2 × 0.015 = 0.033%/s
- Vreme do 100%: ~50s — prebrzo, igrač nije ni stigao da kupi sve upgrejde

**Korekcija:** Upgrades se ne kupuju simultano. Realna putanja je postepena. Igrač troši SJ na upgrade umesto da akumulira → pressure path je organski usporen. Nije potrebno hard-cap pressure gain — ekonomija SJ trošenja prirodno usporava pressure jer igrač troši SJ na upgrade umesto što ih gomila za fermentaciju.

### 2.4 Prestiže — šta se menja (implicitno kroz mutacije)

Prestiže ne daje direktan numerički multiplier na brzinu. Ubrzanje dolazi od mutacija:
- M5 (Pritisak Kaskada): skraćuje pressure phase za ~30%
- M6 (Osmofilna Adaptacija): jeftiniji auto-upgradi = brže do auto-ferment = brže pressure
- M8 (Bifidogena Sinerija): drugi i treći prestiže automatski imaju bonus zbog broja mutacija

**Estimacija za Prestiže 2:** Sa jednom mutacijom aktivnom (~50% šansa je M5 ili M6), drugi prestiže traje **2.0–2.5 minuta**.
**Estimacija za Prestiže 3:** Sa dve mutacije aktivne, treći prestiže traje **1.2–1.8 minuta**.
**Ukupna sesija za win state:** ~3.7 + 2.2 + 1.5 = **~7.4 minuta** — unutar 4–7 min tarceta (blago prekoračenje je okej jer poslednji prestiže je kratak i satisfaktoran).

---

## 3. Progression pacing

### Faza 1 (0–90s): Onboarding

**Šta se dešava:**
- Igrač vidi prazno bure, HUD sa: SJ = 0, FJ = 0.0/s, Pressure = 0%
- Jedina dostupna akcija: klik na bure
- Posle 5 klika (= 5 SJ): Mlečna Baza se otključava u upgrade panelu
- Igrač kupuje Mlečna Baza lvl 1 (10 SJ) → vidi FJ/s da raste
- Pressure bar počinje da se puni — sporo ali vidljivo

**Onboarding moment:** Kada pressure dostigne 5% (oko 30–40s), pojavljuje se LCD tooltip: "FERMENTACIJA PUNI PRITISAK. 100% = MUTACIJA."

**Šta kupuje tipičan igrač u ovoj fazi:**
- Mlečna Baza lvl 1–3 (36 SJ kumulativno)
- Možda Pojačana Membrana lvl 1 (25 SJ)

**Feel:** Klik je satisfaktoran, bubble animacije potvrđuju feedback, pressure je mali ali realan.

---

### Faza 2 (90–180s): Automatizacija

**Šta se dešava:**
- SJ generisanje je sada merljivo pasivno — igrač ne mora non-stop da klika
- Micelij Mreža postaje dostupna (80 SJ) — igrač počinje da planira
- Auto-Ferment I dostupan na 200 SJ — major threshold, igrač ga cilja
- Pressure: ~20–50% u ovom intervalu
- Pressure bar pulsira lagano da podseća da je u igri

**Šta kupuje tipičan igrač:**
- Micelij Mreža lvl 1 (80 SJ)
- Auto-Ferment I lvl 1–2 (200 + 270 SJ)

**Feel:** Igra počinje da se "igra sama" između klikova. Igrač prati pressure kao primarni cilj.

---

### Faza 3 (180–240s): Prestiže momenat

**Šta se dešava:**
- Pressure: 80–100%
- Bar pulsira (80%+), igrač zna da dolazi nešto
- Kad dostigne 100%: flash, dugme "MUTACIJA →" se pojavljuje
- Igrač klika → particle explosion → mutacija modal
- Bira jednu od 3 ponuđene mutacije (čita opis pažljivo — to je hook)
- Igra se resetuje, nova hexagon badge u HUD-u

**Feel:** Katarza. Eksplozija bureta je vizuelna nagrada. Izbor mutacije je strategijska pauza. Restart je brz.

---

### Prestiže 2 (≈120–160s): Brža igra, nova mehanika

- Igrač ulazi sa jednom mutacijom aktivnom
- Gameplay je identičan ali mehanički izmenjen zavisno od mutacije
- Primer: sa M5 (Pritisak Kaskada) — igrač svesno čeka 50% pressure, pa ga gleda da ubrzava
- Upgejdi su ponovo od 0, ali igrač zna redosled i nije frustriran — to je part of the loop
- Pressure 100% stiže za ~120–160s

### Prestiže 3 (≈80–120s): Finale run

- Dve mutacije aktivne — gameplay je vidljivo izmenjen
- Igrač sada zna šta radi — ovo je "master run"
- Pressure 100% stiže za ~80–120s
- Posle trećeg prestiže → Win State

---

## 4. Win/Lose

### Win state — "Savršeni Kvasac"

**Trigger:** Treći prestiže završen (igrač je izabrao mutaciju i igra se resetovala treći put).

**Umesto normalnog restarta:** Fade-to-black, pa win screen.

**Win screen sadržaj:**
```
╔══════════════════════════════╗
║    SAVRŠENI KVASAC           ║
║    Fermenter: Varenički Bunt ║
╠══════════════════════════════╣
║  Vaša kolonija je evoluirala ║
║  3 puta i dostigla genetsku  ║
║  savršenost.                 ║
║                              ║
║  Aktivne mutacije:           ║
║  [badge] Naziv mutacije 1    ║
║  [badge] Naziv mutacije 2    ║
║  [badge] Naziv mutacije 3    ║
║                              ║
║  Ukupno vreme: XX:XX         ║
║  Prestiži: 3                 ║
╠══════════════════════════════╣
║  [NOVA PARTIJA] [OSTAVI]     ║
╚══════════════════════════════╝
```

- LCD zeleni tekst, tamna pozadina, iste boje kao ostatak igre
- "Ukupno vreme" = timer od prvog klika do poslednjeg prestiža
- "Nova Partija" briše sve (uključujući mutacije) i startuje fresh
- Bubble animacije nastavljaju u pozadini tokom win screena

---

### Soft lose — degradacija (videti i 1.6)

**Threshold:** 5 minuta bez ikakve FJ generacije

**Efekat:** fermentRate pada do minimum 10% base-a (0.02 FJ/s). Pressure sporije raste ali ne staje.

**Recovery:** Jedan klik = momentalna oporavka.

**Nema hard lose.** Igrač ne može da "izgubi" igru — može samo da uspori. Ovaj dizajn je svesna odluka u skladu sa idle žanrom.

---

## 5. UI/UX prioriteti (za Jovu)

### Hijerarhija metrika (odozgo prema dole, po vizuelnoj prominentnosti):

1. **BURE** — centralni element, klikabilno, zauzima 40% ekrana, bubble animacija uvek aktivna
2. **MUTACIONI PRITISAK** — odmah ispod bureta, debeo progress bar (30px), pulsira na 80%+, tekst iznad "MUTACIONI PRITISAK: XX%"
3. **FJ/s** — u LCD HUD-u, prominentno, igrač prati ovo kao meru napretka
4. **SJ balance** — u HUD-u, vidljiv ali ne dominantan
5. **Upgrade panel** — desna strana ili ispod, scrollable lista, svaki upgrade ima: naziv, cena, level, kratki efekat opis

### Obavezne UX regule:

- **Upgrade dugme sivo + lock kad igrač nema dovoljno SJ.** Ne sakrivaj — prikazuj sa lockom i cenom.
- **Mutacioni pritisak NIKAD ne sme biti u uglu.** Centralan, ispod bureta, uvek vidljiv bez scrollanja.
- **Prestiže dugme se prikazuje SAMO kad je pressure = 100%.** Pre toga — ne postoji u DOM-u. Kad se pojavi, treba da "uleti" iz desna sa slide animacijom (0.3s).
- **Mutacija modal:** Ne sme biti zatvoriv bez izbora. Overlay celom ekranu. Tri kartice side-by-side (ili stack na mobilnom). Svaka kartica: badge (CSS hexagon, 40px), naziv (bold 16px), opis efekta (12px regular, max 2 reda).
- **HUD badge-evi za aktivne mutacije:** Mali hexagon ikonice u top-right corner-u. Max 3 badge-a (= max 3 prestiže). Tooltip na hover sa nazivom mutacije.
- **Mobilni layout:** Bure gore (full width), pressure bar odmah ispod, upgrade lista scroll-abilna ispod toga. Touch target za bure min 100×100px.
- **Timer na win screenu:** Startuje od prvog klika, prikazuje se samo na win screenu (ne tokom igre).

### Šta Jova NE treba da sam smisli:

- Mutacioni pritisak je UVEK centralan — to je dizajnerska odluka, ne estetska
- Tri prestiže = win state (hardcoded `MAX_PRESTIGES = 3`)
- Pool mutacija je tačno ovih 8 — bez dodavanja
- Degradacija je soft (min 10% rate), nikad hard reset

### Performanse napomene (iz Neginog premortem):

- Particle count za prestiže capped na 40 čestica (ne više)
- CSS bubble animacije na bureu: max 8 simultanih bubbles
- Ne pokretati canvas render loop i CSS animacije simultano tokom prestiže sekvence — pausovati canvas za 1.5s dok traje particle spray, pa resume
