# GDD — Park Mapa

**Autor:** Mile Mehanika, Game Designer & Economy Balancer
**Datum:** 2026-06-13
**Verzija GDD:** 1.1 (V0.3 launch target — retry/port)
**Brand serves:** MKDSLend (primarni), Kluboslavija (Bina zona), Guncati (Staklenici — Season 2)

---

## V0.3 Scope (Impl Sesija Target)

Impl sesija isporučuje **V0.3**, ne V1.0. To konkretno znači:

### Šta se isporučuje u V0.3

| Komponenta | V0.3 | V1.0 (buduće) |
|---|---|---|
| Aktivne zone | **3** (Pult, Bina, Šuma) | 9 |
| Logbook unosi | Skeleton (bez content-a) | 180+ |
| Mini-priče po zoni | **5 karica** po zoni (15 ukupno) | 20+ po zoni |
| Easter egg hunt | **7 dnevno** (fiksna gornja granica) | 7-12 |
| NPC misije | **4 NPC, 1 misija svaki** na sedmičnom rotacijon | 4 NPC × 52 sedmice |
| Sezonski ciklus | **1 sezona** (proleće/launch paleta) | 4 godišnja doba |
| Zona nivoi | Sistem implementiran, **Level 1–2 dostupni na launch** | Level 1–5 |
| Prestige | Logika implementirana, ne dostupno u V0.3 | Aktivno od Sezone 2 |
| Staklenici zona | **Locked / u izgradnji** (vizuelni tizer) | Season 2 |
| Zone 4–9 | **Locked / u izgradnji** (vizuelni tizer) | Postepeno otključavanje |

### Šta Zone 4–9 izgledaju u V0.3

Locked zone se prikazuju kao:
- Sivi/desaturovani tile sa mrežastim obrisima (animacija: pulsira slab beli sjaj)
- Tekst overlay: `"U izgradnji..."` ili `"Uskoro — [naziv zone]"`
- Kursor hover: kratka tooltip poruka, npr. `"Guncati Staklenici otvaraju se u Sezoni 2"`
- Nisu klikabilne za check-in — ali su prisutne na mapi kao vizuelna obećanja

---

## Zona Mapa (V0.3)

Ukupno 9 zona u finalnoj verziji. V0.3 aktivira tačno 3.

```
┌─────────────────────────────────────────┐
│           MKDSLend Park                 │
│                                         │
│  ┌────────┐  ┌────────┐  ┌────────┐    │
│  │        │  │        │  │        │    │
│  │  PULT  │  │  BINA  │  │  ŠUMA  │    │
│  │  ✓ V0.3│  │  ✓ V0.3│  │  ✓ V0.3│    │
│  └────────┘  └────────┘  └────────┘    │
│                                         │
│  ┌──────┐  ┌──────┐  ┌──────┐         │
│  │JEZERO│  │KAFANA│  │ARENE │         │
│  │🔒 V1 │  │🔒 V1 │  │🔒 V1 │         │
│  └──────┘  └──────┘  └──────┘         │
│                                         │
│  ┌─────────┐  ┌──────────┐  ┌───────┐  │
│  │STAKLENICI│  │ ČUVARICA │  │BIBLIO.│  │
│  │🔒 S2    │  │🔒 V1     │  │🔒 V1  │  │
│  └─────────┘  └──────────┘  └───────┘  │
└─────────────────────────────────────────┘
```

### Zona Profili

| Zona | Status | Vizuelni ID | Brand | Aktivacijska nota |
|---|---|---|---|---|
| **Pult** | ✅ V0.3 aktivan | Neon roze/ljubičasto, equalizer blink | MKDSLend | F# minor pad |
| **Bina** | ✅ V0.3 aktivan | Toplo jantarno, akustični talasi | Kluboslavija | G major pad |
| **Šuma** | ✅ V0.3 aktivan | Zeleno-tirkizno, bioluminiscencija | MKDSLend | D minor pad |
| **Jezero** | 🔒 V1 locked | Svetlo-plavo, vodeni ripple | MKDSLend | A major pad |
| **Kafana** | 🔒 V1 locked | Toplo braon/crveno, dim-efekt | MKDSLend | — |
| **Arene** | 🔒 V1 locked | CRT scan-line, 8-bit blink | MKDSLend | — |
| **Staklenici** | 🔒 S2 locked | Zeleno-žuto, rast biljke | Guncati | — |
| **Čuvarica** | 🔒 V1 locked | Tamno-zeleno, baterijska lampa | MKDSLend | — |
| **Biblioteka** | 🔒 V1 locked | Sivo-plavo, lebdeća slova | MKDSLend | — |

---

## Core Mehanike

### 1. Park Board (Mapa)

Park Board je centralni ekran — interaktivna piksel-art mapa koja je uvek vidljiva. Nije menu, nije hub screen: **mapa je igra**.

**Vizuelni stanja mape:**
- **Podrazumevano:** Noćna/sumračna paleta. Tamno-plava osnova `#0D1B2A`. Zona lampioni trepere.
- **Aktivna zona** (hover/focus): Zona dobija svetlosni halo efekt (Canvas radial gradient širi se prema ivicama zone, 400ms easing).
- **Dnevno Svetlo zona:** Zlatni pulsing okvir oko te zone, vidljiv odmah pri otvaranju.
- **Locked zone:** Desaturovani sivi tile, pulsira slab beli sjaj, ne reaguje na hover sem tooltip-a.

**Parallax slojevi (CSS transform):**
1. Pozadinski oblaci — spori drift, 120s loop
2. Srednji sloj — krošnje, krovovi zona — umjereni drift, 80s loop
3. Foreground detalji (lampioni, puteljci) — statični (za mobile performance)

**Park Board stanje raste vizuelno** s Parktokenima:
- Level 1 zona: Osnovna silueta, 1-2 lampiona
- Level 3 zona: Puteljci su popunjeni, NPC siluete hodaju
- Level 5 zona: Posebni dekorativni efekti (specifični po zoni), zona "svetli" i bez hovera

**Kursor:**
- Globalni default: lampion ikona
- Hover nad Pultom: vinilna ploča ikona (32px CSS sprite)
- Hover nad Binom: nota / mikrofon ikona
- Hover nad Šumom: list biljke ikona
- Hover nad locked zonom: ključ ikona (grayout)

---

### 2. Zone System

Svaka aktivna zona ima svoju mašinu stanja i lifecycle.

**Zona lifecycle:**
```
idle → hover → activating (3-5s animacija) → active → check-in complete → cooldown (23h)
```

**Zona Check-In:**
1. Igrač klikne/tapne aktivnu zonu
2. "Ulazna animacija" — zona se uvećava, fill-efekt (3-5 sekundi, Canvas radial expand)
3. Flavor screen prikazan: naziv zone + trenutno stanje (tekstualni string iz `zones/[zona].js` content pool-a)
   - Primer Pult: `"Neon treperi. Set počinje za 2h. Toplo pivo čeka na šanku."`
   - Primer Bina: `"Tiha noć. Zvuk čeka. Sutra je proba."`
   - Primer Šuma: `"Lišće pada. Tišina šumori. Neko je bio ovde pre tebe."`
4. Zona Mini-Priča kartica br. N se otključava (sekvencijalno, 1-5 u V0.3)
5. Parktoken reward dodat
6. Zona ulazi u 23h cooldown (timestamp localStorage)

**Zona cooldown vizuelno:**
- Zona tile ima suptilni timer overlay (CSS clip-path circle koji se puni, animacija 23h ali vidljiva samo pri hoveru)
- Hover tooltip: `"Sledeći poseta za: 14h 32min"`

**Zona aktivacija zahtevi:**
- Check-in je uvek dostupan (nema "ulaznice" ni ograničenja sem cooldown-a)
- Cooldown je 23h (ne 24h) — daje igraču koji svaki dan dođe u različito vreme fleksibilnost

---

### 3. Easter Egg Hunt

**Šta su Easter Egg-ovi:**
Skriveni interaktivni objekti postavljeni po mapi (ne unutar zona) svaki dan. Vizuelni tipovi: zarđala klupa, neobičan poster, lampion čudnog oblika, zaboravljena torba, otvorena knjiga na klupi.

**Dnevna generacija (pseudo-random, seed = `dateString + zoneId`):**
- Fiksno **7 egg-ova po danu** za V0.3 (ne 7-12 — fiksna gornja granica je anti-abuse odluka)
- Egg pozicije se biraju iz pool-a od 40 predefinisanih "hot spot" koordinata po mapi
- Seed formula: `dateSeed = parseInt(dateString.replace(/-/g, '')) % 40`
- 7 pozicija iz pool-a bira se deterministički via seed (nema runtime randomness, nema reload exploit-a pozicije)
- Egg je vizuelno prisutan na mapi čim se mapa učita — ne treba "tražiti", potrebno je **kliknuti**

**Egg Click Reward:**
- Kratki 3-note ascending Web Audio chord (major triad, staccato, 200ms)
- +5–10 Parktokena (random, seed-based — isti egg uvek daje isti reward)
- Micro-lore rečenica (jedna od 30 pool rečenica po zoni/oblasti)
- Egg nestaje (CSS fade-out, 400ms), ne može se kliknuti ponovo

**Egg vizuelni prikaz:**
- Blagi CSS glow efekt na egg sprite-u (pulse, 2s loop) — diskretno, ne da se ne može propustiti
- Hover: kursor prelazi u ikonu ruke

---

### 4. Parktoken Economy

Parktokeni (PT) su jedina valuta. Zarađuju se aktivnošću, troše na zona-progresiju.

**Kako se zarađuju:**

| Akcija | PT nagrada | Limit / dan |
|---|---|---|
| Zona Check-In (normalan) | +15 PT | 1× po zoni (max 3 zona × 1 = 3 check-in) |
| Zona Check-In (Dnevno Svetlo zona) | +25 PT | 1× ukupno |
| Easter Egg klik | +5–10 PT (seed-based avg. 7 PT) | 7 egg-ova × 7 PT = max 49 PT |
| Mini-Priča otključana | +5 PT | Max 3 dnevno (1 po zoni) |
| NPC Misija završena | +30–50 PT | 1 misija tjedno po NPC = max 4 tjedno |
| Dnevni Closure bonus (Skupi Dnevno Svetlo) | +10 PT | 1× dnevno |

**Dnevni casual earning (tipična sesija):**
```
3× check-in (15 PT) = 45 PT
+ 7× egg = 49 PT
+ 1× mini-priča = 5 PT
+ Closure bonus = 10 PT
= ~109 PT / sesija (aktivna sesija)
```

**Dnevni casual earning (pasivna sesija — samo Dnevno Svetlo):**
```
1× Dnevno Svetlo check-in = 25 PT
+ Dnevno Svetlo egg bonus = 10 PT
+ Closure bonus = 10 PT
= ~45 PT / sesija (minimalna sesija)
```

**Target range:** 40–60 PT za minimalnu sesiju — ovo osigurava da casual igrač koji otvori igru jednom dnevno i "samo provjeri Dnevno Svetlo" i dalje napreduje, ali sporije od aktivnog igrača. Aktivna sesija (sve akcije) daje ~100+ PT.

---

### 5. Zona Progresija (5 Nivoa)

Svaka zona ima 5 nivoa razvoja. Nivoima se podiže zona kupovinom — ne automatski.

**Nivo nazivi (universal):**
1. **Zapušteno** — osnovna silueta, dim
2. **Otvoreno** — lampioni uključeni, 1 NPC silueta
3. **Aktivno** — puteljci vidljivi, 2 NPC siluete, ambijentalni zvuk glasniji
4. **Popularno** — zona dobija zonu-specifični vizuelni detalj (neonski natpis, biljke, zastave)
5. **Ikonično** — permanentni glow-efekt, posebna dekoracija, zona pokreće pasivni daily bonus (+5 PT/dan)

**Cena napredovanja (eksponencijalna, ×3 faktor):**

| Nivo prelaz | Cena (PT) | Kumulativno (PT) | Dana casual igrača |
|---|---|---|---|
| 1 → 2 | 50 PT | 50 PT | ~1.5 dan |
| 2 → 3 | 150 PT | 200 PT | ~5 dana |
| 3 → 4 | 400 PT | 600 PT | ~14 dana |
| 4 → 5 | 1000 PT | 1600 PT | ~37 dana |

**Kumulativna analiza (casual ~45 PT/sesija):**
- Level 2: ~1-2 dana
- Level 3: ~4-5 dana od levela 2
- Level 4: ~9 dana od levela 3
- Level 5: ~22 dana od levela 4
- **Ukupno Level 1→5: ~36-38 dana** — prestiže punu prvu sezonu (28 dana), što primorava igrača da igra u Sezoni 2 da dostigne Level 5

**Za aktivnog igrača (~100 PT/sesija):**
- Level 5: ~16-17 dana — dostižno u prvoj sezoni za dedikovanog igrača

**Park Budget (nedeljni resurs):**
- Parktokeni zarađeni u toku nedelje formiraju "Park Budget" koji se resetuje svake nedelje u ponedeljak
- Budget koji se ne potroši ne prenosi se (max 400 PT carry-over, višak se gubi)
- UI prikazuje budget timer i carry-over warning 24h pre reseta

---

### 6. Dnevni Closure Loop

**Problem koji rešavamo:** Ambient persistent igra bez jasnog closure-a dovodi do churn-a — igrač otvori igru, ne vidi šta je novo, zatvori.

**Rešenje: "Skupi Dnevno Svetlo" kao jedina dnevna "obaveza"**

Svaki dan, jedna od 3 aktivne zone (V0.3) proglašava se **Dnevno Svetlo zonom** (rotacija via seed = datum):
- Vizuelno: Zlatni pulsing okvir, vidljiv odmah pri otvaranju mape
- Tooltip: `"Dnevno Svetlo: Šuma — bonus +10 PT, ekskluzivni easter egg, nestaje u ponoć"`
- Aktivacija: Igrač ode u Dnevno Svetlo zonu i klikne Check-In
- Reward: +25 PT (umesto 15), ekskluzivni egg na toj zoni (+10 PT), Closure bonus +10 PT
- Fanfare: **Completion fanfare** — lampioni po celom parku zasvetlucaju 3 sekunde (CSS keyframe flash, all `.lampion` elements), celebratory 5-note arpeggio (Web Audio)
- UI indikator: Zelena kljuka pored Dnevno Svetlo indikatora → `"Danas završeno ✓"`

**Definicija "dnevna sesija završena":**
> Igrač je kliknuo Check-In na Dnevno Svetlo zonu → primio completion fanfare → zeleni checkmark se pojavio u uglu.

Ovo je jedina akcija koja formalno "zatvara" dnevnu sesiju. Igrač može ostati i raditi ostale stvari, ali ovaj momenat je psihološki closure point.

**"Šta je novo danas" splash:**
Pri prvom otvaranju mape tog dana, prikazuje se 2-sekudnni splash (ne modal, ne blocker — elegantni slide-in banner):
```
┌──────────────────────────────────────────┐
│  Dobrodošao nazad u MKDSLend Park       │
│  Danas: Dnevno Svetlo → ŠUMA            │
│  [novi easter egg otkriven u Šumi]      │
└──────────────────────────────────────────┘
```
Banner nestaje sam, ili klikom. Ne zahteva akciju.

---

## Ekonomija Brojeva

### Parktoken Formule

**Zona XP (interni) ≠ Parktoken (valuta):**
- Parktokeni su vidljivi igraču, troše se eksplicitno
- Zona XP je interni counter koji ne resetuje

**Eksponcijalna cena nivoa:**
```
levelCost(n) = 50 × 3^(n-1)
  n=1→2: 50 × 3^0 = 50 PT
  n=2→3: 50 × 3^1 = 150 PT
  n=3→4: 50 × 3^2 = 450 PT  ← zaokrušeno na 400 za UX čitljivost
  n=4→5: 50 × 3^3 = 1350 PT ← zaokrušeno na 1000 za UX čitljivost
```

Zaokruživanje je svesna UX odluka — "lepi" brojevi su lakši za planeranje.

**Park Legenda Rang kumulativni PT zahtevi:**

| Rang | Naziv | Kumulativni PT | Procenjeni dani |
|---|---|---|---|
| 1 | Izletnik | 0 PT | Launch |
| 2 | Poznavalac | 300 PT | ~7 dana |
| 3 | Domaćin | 900 PT | ~20 dana |
| 4 | Legenda | 2500 PT | ~55 dana (Sezona 2) |
| 5 | MKDSLend Original | 6000 PT | ~133 dana (Sezona 5) |

Rang 4-5 su namerno van domašaja V0.3 sezone — to je dugoročni retention hook.

### Park Budget Formula

```
weeklyBudget = sum(PT earned this week)
maxCarryOver  = 400 PT
if (weeklyBudget > spentThisWeek + 400):
  weeklyBudget = spentThisWeek + 400  // višak se gubi
```

**Park projekti (nedeljni troškovi):**

| Projekat | Cena | Efekat |
|---|---|---|
| Novi puteljak (vizuelni) | 80 PT | Dekorativni link između 2 zone |
| Fontana (dekoracija) | 120 PT | +5 PT pasivni dnevni bonus 7 dana |
| Info-tabla | 60 PT | Otključava lore fragment koji nije vezan za zonu |
| Lampion niz | 40 PT | Vizuelni efekt na ruti |
| Klupa (NPC sedi) | 30 PT | NPC silueta se pojavljuje na puteljku |

---

## Progression Krivulja

### Po minutama (tipična sesija)

| Minuta | Šta se dešava | Psihološki efekat |
|---|---|---|
| 0:00 | Mapa se otvara. Dnevni "što je novo" banner slide-in. | Orijentacija, FOMO od Dnevno Svetlo |
| 0:05 | Igrač vidi zlatni okvir na Dnevno Svetlo zoni. | Clear action item |
| 0:30 | Hover nad prvim Easter Egg-om na mapi. Kursor se menja. | Curiosity trigger |
| 1:00 | Klik na Egg. Zvuk, flash, +7 PT. Micro-lore rečenica. | Instant reward, lore hook |
| 1:30 | Igrač pronalazi još egg-ova (vidljivi glow). | "Samo još jedan" compulsion loop |
| 3:00 | Igrač klikne Check-In na Dnevno Svetlo zonu. Ulazna animacija. | Anticipation |
| 3:30 | Flavor screen prikazan. Mini-priča kartica 1 otključana. | Lore investment |
| 4:00 | Closure fanfare — lampioni svetlucaju. +35 PT combo. | Satisfying closure |
| 5:00 | Igrač je "gotov za danas" ali vidi PT balance. Zona level progress bar. | Prosto još malo do sledećeg nivoa? |
| 7:00 | Igrač klikne Check-In na drugu zonu (Pult). Nova mini-priča. | Additional lore pull |
| 10:00 | Igrač skupi preostalih 4-5 egg-ova. | Completionist drive |
| 15:00 | Svi egg-ovi skupljeni. "Park je za danas tvoj" poruka. PT balance visible. | Kompletiran dnevni loop |
| 20:00 | Igrač gleda Park Budget, planira koji projekat da kupi ove nedelje. | Taktičko planiranje = investment |
| 30:00+ | Igrač čita Logbook, poredeći mini-priče. Vraća se sutra. | Narativni engagement |

### Sesija 1 vs Sesija 15 vs Sesija 30

**Sesija 1 (novi igrač):**
- Sve zone na Level 1 (Zapušteno)
- Mapa izgleda prazna ali intrigantna
- Fokus: "Šta su ovi objekti? Zašto su locked zone tu?"
- Hook: Bina zlatni okvir + turnejski datum na Setlist Tabli

**Sesija 15 (dve sedmice igre):**
- 2-3 zone na Level 2, možda jedna na Level 3
- Puteljci počinju da se popunjavaju vizuelno
- Mini-priče su na karticama 3-4, narativ se razvija
- NPC misija bar 1-2 završene, lore fragmenti u Logbooku
- Igrač ima "investiciju" u parku — ne želi da preskoči dan

**Sesija 30 (kraj sezone 1):**
- Pult ili Bina blizu Level 4
- 15 mini-priča pročitano, Logbook popunjen ~40%
- Rang: Domaćin (Rang 3) možda dostignut
- Igrač jedva čeka Sezonu 2 i vizuelni skin reset
- Prestige opcija se pojavljuje: "Pokreni Veliku Renovaciju?"

---

## Dnevno Svetlo Sistem

**Rotacija (deterministička, seed-based):**
```javascript
function getDailyZone(dateString) {
  const zones = ['pult', 'bina', 'suma'];  // V0.3 pool
  const seed   = dateString.split('-').join('');
  const idx    = parseInt(seed, 10) % zones.length;
  return zones[idx];
}
```

Ista zona neće biti Dnevno Svetlo dva dana zaredom (matematički osigurano za pool od 3+ zona).

**Dnevno Svetlo sadržaj:**
- +10 bonus PT na check-in (iznad normalnog)
- **Ekskluzivni dnevni egg** (8. egg — izvan normalnog pool-a od 7, pojavljuje se samo unutar zone u Dnevno Svetlo status-u)
- **Dnevna narativna kartica** — kratka (1-3 rečenice) koja nestaje sutradan (ne čuva se u Logbook, pojačava FOMO)
- **Completion fanfare** (jedini dnevni events koji daje fanfare)

**Timer prikaz:**
- UI element: `"Dnevno Svetlo nestaje za: HH:MM:SS"` (countdown, ažurira se realtime)
- Vidljiv u gornjem desnom uglu — ne intruzivan, ali uočljiv

**Ako igrač propusti Dnevno Svetlo:**
- Nikakva kazna, nikakav "streak broken" anxiousness — ovo je ambient iskustvo, ne Duolingo
- Sutra: nova zona, novi bonus, nema efekta na progresiju
- Propuštena dnevna narativna kartica = zauvek izgubljena → lagani FOMO, ali ne katastrofa

---

## NPC Networking Board (V0.3)

4 NPC-a, minimalni set za launch. Svaki NPC ima 1 aktivnu misiju tjedno. Misije se rotiraju iz pool-a od 4 po NPC-u (16 ukupno za V0.3 launch).

### NPC Profili

**1. Kurator — "Vlado"**
- Lokacija: Pult zona
- Vizuelni: Silueta s naočarima i olovkom iza uha
- Misija pool (rotira tjedno):
  - `"Poseti Pult 3 puta ove nedelje"` → +45 PT + lore fragment
  - `"Skupi 10 easter egg-ova ove nedelje"` → +40 PT + special dekoracija unlock
  - `"Pročitaj 5 mini-priča"` → +35 PT + Logbook badge
  - `"Kupi 1 Park projekat"` → +30 PT + pasivni bonus sljedeće nedelje
- Lore uloga: Istoričar MKDSLend parka, otkriva backstory u fragmentima

**2. Park Ranger — "Mara"**
- Lokacija: Šuma zona
- Vizuelni: Silueta s kapom i baterlijskom lampom
- Misija pool:
  - `"Pronađi sve egg-ove u Šumi ove nedelje (5× check)"` → +40 PT
  - `"Poseti Šumu 4 dan zaredom"` → +50 PT + streak badge
  - `"Skupi 25 PT iz egg-ova u jednoj sesiji"` → +30 PT + easter egg kartica
  - `"Otključaj nivo 2 u bilo kojoj zoni"` → +35 PT
- Lore uloga: Čuvarica parka, zna tajne šume, govori o ekologiji i starim puteljcima

**3. DJ Silueta — "Ace"**
- Lokacija: Bina zona
- Vizuelni: Silueta s slušalicama, uvek okrenut leđima
- Misija pool:
  - `"Check-in na Binu kad je Dnevno Svetlo"` → +50 PT + ekskluzivni setlist unos
  - `"Pročitaj sve Bina mini-priče ove nedelje"` → +45 PT
  - `"Skupi 30 PT iz Bine ove nedelje"` → +35 PT + Kluboslavija lore fragment
  - `"Poseti sve 3 zone u jednoj sesiji"` → +40 PT
- Lore uloga: Veza sa Kluboslavija svetom, dijeli šifrovane poruke o nastupima

**4. Biljkar — "Đorđe"**
- Lokacija: Između Pult i Šuma zona (puteljak)
- Vizuelni: Silueta s kantom za zalivanje
- Misija pool:
  - `"Investiraj 100 PT u Park projekte ove nedelje"` → +40 PT + dekorativni cvjet
  - `"Poseti sve 3 zone 2× ove nedelje"` → +35 PT
  - `"Skupi 50 PT u jednoj sesiji"` → +30 PT
  - `"Budi u parku 5 dana ove nedelje"` → +45 PT + prestiž hint (info o Sezoni 2)
- Lore uloga: Tih, kontemplativan — Guncati primer, njegova priča je seed za Season 2 Staklenici

**NPC Networking Board UI:**
- Pristup: Klik/tap na "Board" dugme (sidebar ili donji nav)
- Prikazuje 4 kartice, jedna po NPC-u
- Svaka kartica: NPC ime, tekst misije, reward, progress bar (0/X), deadline (dani do nedeljnog reseta)
- Completed misija: zeleni okvir, "Predaj" dugme → PT animacija, lore fragment unlock

---

## Logbook Arhitektura

Logbook je kolekcionar parka. Permanentan, nikad se ne resetuje.

**Kategorije unosa:**

| Kategorija | Izvor | V0.3 kapacitet |
|---|---|---|
| Mini-priče | Zona Check-In, sekvencijalno | 5 po zoni × 3 zone = 15 |
| Dnevne narativne kartice | Dnevno Svetlo (prop) | 0 (ne čuvaju se u V0.3) |
| Lore fragmenti | NPC misije | 4 per season (1/NPC) |
| Easter Egg zapisi | Prva nalaz tipologije | 7 tipova × 3 zone = 21 |
| Zona milestones | Zona level-up | 2 po zoni × 3 = 6 (Levels 1→2 samo u V0.3) |
| Renovacioni Žigovi | Sezonski prestige | 0 (V0.3 sezona 1 je live) |
| Ekskluzivni unosi | Posebni eventi (Avala 2026 itd.) | TBD |

**Logbook UI:**
- Grid prikaz sa kategorizacijom (tab po kategoriji)
- Locked unosi: `"???"` sa sugestivnim siluetom → radoznalost bez spoilera
- Svaki unos: naslov, datum otkrića, 2-3 rečenice teksta, vizuelni thumbnail (CSS pixel art)
- Filter: po zoni, po datumu, po tipu

**Logbook persistence:**
- Sve u localStorage, key: `parkMapa_logbook_v1`
- Export/import JSON dugme (Settings meni) — obavezno za V0.3
- Max localStorage payload za V0.3: ~50 KB (zanemarljivo)

---

## Sezonski Ciklus & Prestige (Renovacija)

### Sezonski ciklus

- Trajanje: **28 dana** po sezoni
- V0.3 je Sezona 1 (proleće/launch paleta)
- Sezona 2+ dolaze sa release-ovima nakon V0.3

**Šta se menja između sezona:**
- Vizuelni skin (paleta) — CSS varijable se update-uju na sezonski set
  - Sezona 1 (Proleće): `--sky: #0D1B2A`, `--accent: #FFD700`
  - Sezona 2 (Leto): `--sky: #0A1628`, `--accent: #FF6B35`
  - Sezona 3 (Jesen): `--sky: #1A0D00`, `--accent: #FF8C42`
  - Sezona 4 (Zima): `--sky: #050D1A`, `--accent: #4FC3F7`
- NPC Networking Board misije resetuju pool → novi set 16 misija
- Dnevno Svetlo historija briše se (nova sezona, nova priča)
- Mini-priča serija "zatvori" u Arhivu, nova serija počinje

**Šta se NE menja (permanentno):**
- Logbook (sve kategorije — permanentni)
- Zona nivoi (akumulativni, nikad padaju)
- Park Legenda Rang (kumulativni)
- Parktokeni u "trezoru" (nepotrošeni)

### Prestige (Park Renovacija) — Sezona 2+

**Trigger:** Kraj 28-dnevnog ciklusa ILI igrač dostigne Rang "Domaćin" (Rang 3), ko god dođe pre.

**Vizuelni skin reset:**
- Park dobija novi sezonski skin (Sezona 2 = leto, itd.)
- Zona vizuelni identiteti ostaju isti (Pult je i dalje neon) ali paleta se prilagođava sezoni
- Zona dekoracije ostaju (Level 5 zona i dalje izgleda level 5 — samo u drugoj sezoni boji)
- Ovo je "isti park, novo godišnje doba" — ne "počni od nule"

**Renovacioni Žig:**
- Kompletirana sezona dodaje mali žig na kapijsku tablu parka (vidljiv na mapi)
- 4 sezonska žiga = "Godišnji veteran" vizuelni marker
- Igrač s 4 žiga ima poseban zlatni okvir oko Park Legenda ranga u UI-u

**Renovacioni Bonus (ireversibilan):**
- Igrač bira JEDNU zonu da dobije permanentni vizuelni upgrade (efekt koji nije dostupan normalnim PT)
- Izbor je dostupan samo jednom po Renovaciji
- Efekti po zoni: Pult dobija holografski neon efekt, Bina dobija zvezdani spotlight, Šuma dobija bioluminiscentne životinje
- Ne može se "poništiti" — igrač mora da bira pažljivo

---

## bina-setlist.json Format

Fajl: `data/bina-setlist.json`

Ovo je **jedini fajl** koji se menja kada se dodaju novi turnejski datumi. JavaScript čita ovaj JSON; datumi nisu hardkodovani u kodu.

```json
{
  "version": "1.0",
  "lastUpdated": "2026-06-13",
  "artist": "Kluboslavija",
  "upcomingShows": [
    {
      "id": "avala-2026",
      "venue": "Avala",
      "city": "Beograd",
      "date": "2026-06-20",
      "label": "Avala 2026",
      "exclusive": true,
      "exclusiveReward": {
        "pt": 50,
        "logbookEntry": "avala-2026-badge",
        "label": "Avala 2026 Žeton"
      },
      "flavor": "Planinski vazduh. Hiljadu glasova. Jedno veče koje ne zaboravljaš.",
      "ticketsUrl": null
    },
    {
      "id": "strand-2026",
      "venue": "Štrand",
      "city": "Novi Sad",
      "date": "2026-07-15",
      "label": "Štrand Letnji",
      "exclusive": false,
      "exclusiveReward": null,
      "flavor": "Reka. Pesak. Set koji traje dok zvezde ne pobede.",
      "ticketsUrl": null
    },
    {
      "id": "sarajevo-2026",
      "venue": "TBD",
      "city": "Sarajevo",
      "date": "2026-08-10",
      "label": "Sarajevo",
      "exclusive": false,
      "exclusiveReward": null,
      "flavor": "Dva brijega. Jedan zvuk. Balkanska noć.",
      "ticketsUrl": null
    },
    {
      "id": "guncati-finale-2026",
      "venue": "Guncati",
      "city": "Guncati",
      "date": "2026-09-20",
      "label": "Grand Finale",
      "exclusive": true,
      "exclusiveReward": {
        "pt": 80,
        "logbookEntry": "guncati-finale-badge",
        "label": "Guncati Finale Žeton"
      },
      "flavor": "Poslednje veče sezone. Zemlja, drveće, muzika. Kraj koji je i početak.",
      "ticketsUrl": null
    }
  ],
  "pastShows": []
}
```

**JSON schema pravila:**
- `exclusive: true` → Bina zona u toj sedmici (±3 dana od datuma) prikazuje ekskluzivni egg i reward
- `exclusiveReward.pt` → Bonus PT za check-in u toj sedmici
- `exclusiveReward.logbookEntry` → ID koji se piše u Logbook (mora biti unikatan)
- `flavor` → Flavor text koji se prikazuje u Bina zona check-in screen u toj sedmici
- `pastShows` → Završeni nastupi se premještaju ovde (istorija, čuva se u Logbooku)

**Ko može editovati:** Svako ko može editovati JSON fajl. Non-developer može otvoriti fajl, promijeniti `date` ili dodati novi objekat u `upcomingShows` array.

> **Napomena za impl (Jova) — aktuelnost na dan launch-a (2026-06-13):** Avala 2026 show je na `2026-06-20`, tačno **7 dana** od trenutnog datuma. Pravilo "±3 dana od datuma" za `exclusive: true` ekskluzivni prozor znači da je Avala exclusive window (2026-06-17 do 2026-06-23) **još ne aktivan** na dan deploya (13. jun je 4 dana ispred 17. juna), ali postaje aktivan već za **4 dana** — praktično odmah po launch-u igre. Drugim rečima: Bina zona treba da bude spremna da prikaže Avala ekskluzivni egg i reward **vrlo brzo posle deploya**, ne "za par nedelja" kao kad je ovaj GDD prvi put pisan (21. maj, kada je Avala bila ~30 dana unapred). Implementacija exclusive-window logike (datumsko poređenje, ne hardkodovan flag) treba da bude tačna i testirana pre release-a — first-impression igrača u prvoj nedelji vrlo verovatno pada unutar ovog prozora.

---

## Anti-Abuse Odluka

**Svesna dizajnerska odluka (P0 — dokumentovano):**

### Odabrani pristup: Timestamp Lock + Rate Limit

```javascript
// localStorage keys
const STORAGE_KEYS = {
  lastEggDate:  'parkMapa_lastEggDate',   // 'YYYY-MM-DD'
  eggsToday:    'parkMapa_eggsToday',      // integer 0-7
  lastCheckIn:  'parkMapa_lastCheckIn_[zona]', // ISO timestamp
};

// Egg anti-abuse
function canCollectEgg(eggId) {
  const today     = new Date().toISOString().split('T')[0];
  const lastDate  = localStorage.getItem(STORAGE_KEYS.lastEggDate);
  const countToday = parseInt(localStorage.getItem(STORAGE_KEYS.eggsToday) || '0');

  if (lastDate !== today) {
    // Novi dan — reset countera
    localStorage.setItem(STORAGE_KEYS.lastEggDate, today);
    localStorage.setItem(STORAGE_KEYS.eggsToday, '0');
    return true;
  }
  return countToday < 7; // Max 7 egg-ova po danu
}
```

**Zašto ovaj pristup:**
- **Casual abuse nije naš problem.** Ciljamo casual igrača koji otvori igru jednom dnevno i ne razmišlja o exploit-ima. Takav igrač nema motivaciju da briše localStorage i ponovo skuplja egg-ove.
- **Napredni farming neće biti sprečen.** Igrač koji koristi private browsing ili briše localStorage može obići ovo. To je prihvatljivo — takav igrač nije naša ciljana grupa. Park Mapa nema serversku validaciju, i to je svesna odluka.
- **Seed-based egg pozicije** dodatno smanjuju abuse — reload ne menja pozicije egg-ova (isti seed = iste pozicije = nema "novi layout" benefita od reloada).

**Rate limit implementacija:**
- Max 7 egg-ova po danu (fiksno, ne 7-12)
- Zona Check-In cooldown: 23h timestamp per zona
- NPC misije: server-side nije dostupan, koristimo weekStart timestamp u localStorage

**Prihvaćeni rizici:**
- localStorage brisanje = reset progresije (mitigacija: export/import JSON)
- Private browsing farming (prihvaćeno — ne targeting za to)
- Više uređaja = višestruko zarađivanje (prihvaćeno u V0.3, cloud sync je V1.0+)

---

## Canvas LOD Arhitektura (Arhitekturna Odluka)

**Odluka (P0 — ne optimizacija, arhitektura):**

> Samo aktivna zona renderuje Canvas animacije. Sve ostale zone su statični CSS/DOM tile-ovi.

**Implementacija:**

```javascript
// park-board.js
class ParkBoard {
  constructor() {
    this.activeZone   = null;  // Samo jedna zona može biti "aktivna" (Canvas rendered)
    this.staticZones  = [];    // Sve ostale zone: CSS tile, nema Canvas
  }

  activateZone(zoneId) {
    if (this.activeZone) {
      this.activeZone.deactivate();  // Ugasi Canvas animacije
      this.activeZone.toStaticTile(); // Postavi CSS statični tile
    }
    this.activeZone = zones[zoneId];
    this.activeZone.startCanvasAnimations(); // Uključi Canvas za ovu zonu
  }
}
```

**Šta je Canvas (samo aktivna zona):**
- NPC sprite walking loop (4-frame)
- Particle sistemi (lišće, bioluminiscencija, čestica prašine)
- Activation radial gradient expand
- Zona-specifični ambijentalni efekti

**Šta je CSS/DOM (sve ostale zone, uvijek):**
- Zona tile pozadina (CSS background-image simulirana via box-shadow/gradient)
- Lampion trepćanje (CSS keyframe opacity pulse, random delay via CSS custom property)
- Parallax oblaci (CSS transform, nije Canvas-based)
- Locked zona pulsing (CSS keyframe)

**Zašto ovo:**
- Mid-range Android (Galaxy A serija) ne može da renderuje 9 simultanih Canvas animacija bez frame drop ispod 30fps
- CSS animacije su GPU-accelerated i ne blokiraju main thread
- Jedina aktivna zona je ona na kojoj je igrač fokusiran — nema gubitka iskustva

---

## ESM Modul Arhitektura

Minimalno 25 modula. Svaki modul je zaseban `.js` fajl sa jasno definisanim interface-om.

| Modul | Putanja | Opis |
|---|---|---|
| Entry point | `src/main.js` | Bootstrap: inicijalizuje sve module, wires event loop, učitava state |
| Konstante | `src/config.js` | Sve tuning konstante: PT vrednosti, cooldown trajanja, level cene, seeding formule |
| State | `src/state.js` | GameState shape, save/load localStorage, migration između verzija |
| Input | `src/input.js` | Mouse, touch, keyboard handlers; pointer abstraction za multi-device |
| Render | `src/render.js` | Koordinira DOM/Canvas rendering pipeline; orchestrator za zone render-e |
| UI | `src/ui.js` | HUD, panel-i, modal-i, tooltip-i, notifikacije |
| Audio | `src/audio.js` | Web Audio API wrapper: ambient loop, SFX, zona aktivacione note, arpeggio |
| Park Board | `src/systems/park-board.js` | Mapa logika: zona stanja, LOD switching, cursor management, parallax |
| Zona Manager | `src/systems/zone-manager.js` | Zone lifecycle (idle→hover→activating→active→cooldown), check-in logika |
| Easter Eggs | `src/systems/easter-eggs.js` | Seed-based egg generacija, klik detekcija, dnevni counter, anti-abuse |
| Parktoken Economy | `src/systems/economy.js` | PT zarađivanje, trošenje, Budget tracker, weekly reset |
| Zona Progresija | `src/systems/progression.js` | Level-up logika, cost formula, vizuelni triggers za level change |
| Dnevno Svetlo | `src/systems/daily-light.js` | Dnevna zona rotacija (seed), completion tracking, fanfare trigger |
| Logbook | `src/systems/logbook.js` | Unosi storage, kategorije, prikaz, export/import JSON |
| Prestige | `src/systems/prestige.js` | Sezonski ciklus, Renovacija logika, žig tracker, skin switching |
| Park Legenda Rang | `src/systems/park-legend.js` | Kumulativni PT rang, rang promjena animacija |
| NPC Board | `src/systems/npc-board.js` | NPC misije, nedeljni reset, progress tracking, reward dispatchanje |
| Savegame | `src/systems/savegame.js` | localStorage serijalizacija, export JSON, import JSON, version migration |
| Zona: Pult | `src/zones/pult.js` | Pult-specifične animacije, NPC dijalog pool, mini-priče, easter egg flavor |
| Zona: Bina | `src/zones/bina.js` | Bina animacije, Setlist Tabla renderer, `data/bina-setlist.json` fetch/parse |
| Zona: Šuma | `src/zones/suma.js` | Šuma animacije, bioluminiscencija canvas, lišće particle, NPC Mara |
| Bina Setlist | `src/content/bina-setlist-loader.js` | Fetch `data/bina-setlist.json`, parse, exclusive reward check, caching |
| Brand Hooks | `src/content/brand-hooks.js` | MKDSLend, Kluboslavija, Guncati brand integrations; lore fragment pools |
| Splash/Onboard | `src/ui/splash.js` | "Šta je novo danas" daily banner, first-run onboarding overlay |
| Closure UI | `src/ui/closure.js` | Dnevni closure fanfare, zeleni checkmark, "Park je za danas tvoj" poruka |
| Logbook UI | `src/ui/logbook-panel.js` | Logbook grid view, category tabs, locked entry styling |
| NPC Board UI | `src/ui/npc-panel.js` | NPC kartica layout, misija progress bars, submit reward interaction |
| Sezona Skin | `src/ui/season-skin.js` | CSS varijable switching za sezonske palete, hue-rotate transition |
| Cursor Manager | `src/ui/cursor-manager.js` | Zona-specifični cursor swap, hover state coordination |
| Base CSS | `styles/base.css` | Layout, responsive canvas centering, mobile-first grid |
| UI CSS | `styles/ui.css` | HUD elementi, panel-i, dugmad, tooltip styling |
| Game CSS | `styles/game.css` | Zona tile animacije, lampion pulse, parallax keyframes, egg glow |
| Theme CSS | `styles/theme.css` | MKDSLend/Kluboslavija paleta, sezonske CSS varijable, brand font |

**Ukupno: 30 modula (25 JS + 4 CSS + 1 JSON data)** — iznad minimuma od 25.

---

## Audio Dizajn Sažetak

Sav audio: Web Audio API, zero external files.

**Ambient Loop (uvijek aktivan):**
- Generativni "noćni park" šum: white noise kroz BiquadFilter (lowpass, freq 800Hz, Q 1.5)
- Cricket simulacija: noise burst-ovi u 2-6kHz opsegu, random interval 3-8 sekundi, GainNode 0.3
- Moduliran kroz LFO (0.05Hz) koji lagano vari gain 0.2→0.4

**Zona Proximity Audio (hover):**
- Pult: sawtooth oscillator, subas boom tick pattern (BPM 120, GainNode envelope)
- Bina: plucked string simulacija (triangle oscillator + short decay, 440Hz + harmonics)
- Šuma: wind chime (series of sine oscillators, random pitch dari 800-2000Hz, reverb convolver)

**Zona Aktivacija Note (check-in):**
- Reverb-heavy single pad note (OscillatorNode + ConvolverNode)
- Pult: F# minor (185Hz osnova)
- Bina: G major (196Hz osnova)
- Šuma: D minor (147Hz osnova)

**Easter Egg otkrivanje:**
- 3-note major triad ascending (C-E-G), staccato, 200ms total, AttackRelease envelope

**Dnevni Closure Fanfare:**
- 5-note arpeggio (C-E-G-B-C), 300ms per note, slight reverb, GainNode 0.7

**Zona Level-Up:**
- Isti arpeggio ali 2× brži, +semitone shift, celebratory

**AudioContext resume:**
```javascript
// Obavezno na prvi user gesture (touch/click) zbog iOS Safari
document.addEventListener('click', () => audioContext.resume(), { once: true });
document.addEventListener('touchend', () => audioContext.resume(), { once: true });
```

**Mute dugme:** Prominentno u toplom desnom uglu (ikona zvučnika), toggle `gainNode.gain.value = 0/1`.

---

## Win/Lose Condition

**Park Mapa je ambient persistent experience — nema tvrdog win/lose.**

### Definicija "uspješne sesije":
> Igrač je kliknuo Check-In na Dnevno Svetlo zonu, primio completion fanfare, i zeleni checkmark je vidljiv.

Ovo je "win" za sesiju. Sve ostalo (egg-ovi, NPC misije, zone progresija) je bonus.

### Definicija "propuštene sesije":
> Igrač nije otvorio igru tog dana. Nikakva kazna ne postoji.

Propušteni dani ne kažnjavaju igrača. Jedini gubitak je propuštena dnevna narativna kartica (Dnevno Svetlo) i eventualni NPC idle komentar (`"Dugo te nije bilo..."`).

### NPC Idle Reakcije (za igrače koji su odsutni 3+ dana):
```javascript
// npc-board.js
function getNPCIdleText(npcId, daysSinceVisit) {
  if (daysSinceVisit >= 7)  return npcs[npcId].longAbsenceText;
  if (daysSinceVisit >= 3)  return npcs[npcId].shortAbsenceText;
  return null; // Nema komentara za manje od 3 dana
}
```

### "Park Budget hazard":
Jedina mehanika koja ima negativnu posledicu za neaktivnost je Park Budget nedeljni reset — nepotrošeni PT iznad carry-over limita (400 PT) se gube. UI upozorenje 24h unapred mitigira iznenađenje.

---

## Balance Tabele

### Tabela 1: PT Nagrade po Akciji

| Akcija | PT Minimum | PT Maksimum | Napomene |
|---|---|---|---|
| Zona Check-In (normalna) | 15 | 15 | Fiksno |
| Zona Check-In (Dnevno Svetlo) | 25 | 25 | Fiksno |
| Easter Egg klik | 5 | 10 | Seed-based avg. 7 |
| Ekskluzivni Dnevno Svetlo egg | 10 | 10 | Fiksno |
| Mini-Priča otključana | 5 | 5 | Fiksno |
| NPC Misija — laka | 30 | 30 | Fiksno |
| NPC Misija — teška | 50 | 50 | Fiksno |
| Dnevni Closure bonus | 10 | 10 | Fiksno |
| Avala 2026 ekskluziv | 50 | 50 | Jednom |
| Guncati Finale ekskluziv | 80 | 80 | Jednom |
| Zona Level-Up pasivni bonus (L5) | 5/dan | 5/dan | Per zona, permanentno |

### Tabela 2: Zona Level Thresholds & Cene

| Zona → Nivo | Cena (PT) | Kumulativno | Vizuelna promena |
|---|---|---|---|
| 1 → 2 | 50 | 50 | Lampioni uključeni, 1 NPC |
| 2 → 3 | 150 | 200 | Puteljci vidljivi, 2 NPC |
| 3 → 4 | 400 | 600 | Zona-specifični detalj, NPC dijalog |
| 4 → 5 | 1000 | 1600 | Permanentni glow, pasivni +5 PT/dan |

*Iste cene za sve 3 aktivne zone u V0.3*

### Tabela 3: Dnevni Earning Scenarija

| Tip igrača | Akcije | PT/sesija | PT/nedjelju |
|---|---|---|---|
| Minimalni (samo Dnevno Svetlo) | 1 check-in + 1 egg + closure | 45 | 315 |
| Casual (sve egg-ove + 1 check-in) | 7 egg + 1 check-in + mini-priča + closure | 89 | 623 |
| Aktivni (sve akcije) | 7 egg + 3 check-in + 3 mini-priča + closure | 124 | 868 |
| Ultra (NPC misija + sve) | Sve + 1 NPC/sedmici | 124 + 40/7 = 130 | ~912 |

### Tabela 4: Vreme do Level Thresholds (casual ~45 PT/sesija)

| Cilj | PT potrebno | Dana (casual) | Dana (aktivni ~100 PT) |
|---|---|---|---|
| Sve zone L2 | 150 PT | ~4 dana | ~2 dana |
| Prva zona L3 | 200 PT | ~5 dana | ~2 dana |
| Sve zone L3 | 600 PT | ~14 dana | ~6 dana |
| Prva zona L4 | 600 PT | ~14 dana | ~6 dana |
| Rang 3 (Domaćin) | 900 PT | ~20 dana | ~9 dana |
| Prva zona L5 | 1600 PT | ~36 dana | ~16 dana |
| Rang 4 (Legenda) | 2500 PT | ~56 dana | ~25 dana |

### Tabela 5: Park Budget Nedeljni Projekti

| Projekat | Cena | Efekat | Trajanje efekta |
|---|---|---|---|
| Novi puteljak | 80 PT | Vizuelni dekor | Permanentno |
| Fontana | 120 PT | +5 PT/dan pasivni | 7 dana |
| Info-tabla | 60 PT | Lore fragment unlock | Permanentno |
| Lampion niz | 40 PT | Vizuelni efekt | Permanentno |
| Klupa (NPC) | 30 PT | Nova NPC silueta | Permanentno |
| Sezonski cvijet | 70 PT | Sezonska dekoracija | Do kraja sezone |
| Poster (brand) | 50 PT | MKDSLend lore fragment | Permanentno |

### Tabela 6: NPC Misija Težine & Nagrade

| NPC | Misija Tip | Difficulty | Nagrada |
|---|---|---|---|
| Kurator Vlado | Poseti Pult 3× | Easy | +45 PT |
| Kurator Vlado | Skupi 10 egg-ova | Medium | +40 PT |
| Park Ranger Mara | 4-dan streak Šuma | Hard | +50 PT |
| Park Ranger Mara | Pronađi sve Šuma egg-ove 5× | Medium | +40 PT |
| DJ Ace | Check-in Bina = Dnevno Svetlo | Easy (timing) | +50 PT |
| DJ Ace | Sve Bina mini-priče | Medium | +45 PT |
| Biljkar Đorđe | Investiraj 100 PT projekti | Hard (cost) | +40 PT |
| Biljkar Đorđe | 5-dan streak ukupno | Medium | +45 PT |

### Tabela 7: Park Legenda Rang Cene

| Rang | Naziv | Kumulativni PT | Reward |
|---|---|---|---|
| 1 | Izletnik | 0 | — |
| 2 | Poznavalac | 300 | Posebni Logbook naslovnica |
| 3 | Domaćin | 900 | Prestige unlock (Renovacija dostupna) |
| 4 | Legenda | 2500 | Ekskluzivna zona dekoracija (birač) |
| 5 | MKDSLend Original | 6000 | Posebni zlatni border UI, Logbook premium strana |

### Tabela 8: Easter Egg Tip Pool (V0.3)

| Egg Tip | Vizualni Opis | PT Nagrada | Lore Pool |
|---|---|---|---|
| Zarđala klupa | Silueta sa hrđom | 5 PT | Stari posetioci, zaboravljene priče |
| Neobičan poster | Raspored, nejasno pismo | 7 PT | Istorija parka, bivši events |
| Lampion čudnog oblika | Asymetrical glow | 6 PT | Graditelji parka, craft tradicija |
| Zaboravljena torba | Obrisana silueta | 8 PT | Izgubljeni i nađeni, tajne |
| Otvorena knjiga | Stranice se "listaju" | 9 PT | Biblioteka lore, znanje |
| Razbijena pločica | Piksel fragment | 5 PT | Renovacije, stari parkovi |
| Skrivena nota | Složena papirić | 10 PT | NPC tajne poruke |

### Tabela 9: Sezonski Skin Paleta

| Sezona | Naziv | `--sky` | `--accent` | `--zone-glow` |
|---|---|---|---|---|
| 1 | Proleće (Launch) | `#0D1B2A` | `#FFD700` | `#98FB98` |
| 2 | Leto | `#0A1628` | `#FF6B35` | `#FFD700` |
| 3 | Jesen | `#1A0D00` | `#FF8C42` | `#DAA520` |
| 4 | Zima | `#050D1A` | `#4FC3F7` | `#E0F7FA` |

### Tabela 10: Sezonski Ciklus Timeline

| Dan | Event | Tip |
|---|---|---|
| Dan 1 | Sezona počinje, novi skin, novi NPC misije pool | Auto |
| Dan 7 | Park Budget reset #1 | Auto (nedeljno) |
| Dan 14 | Park Budget reset #2 | Auto |
| Dan 21 | Park Budget reset #3 | Auto |
| Dan 28 | Kraj sezone — Renovacija opcija dostupna | Player-triggered |
| Dan 28+ | Sezona se nastavlja ako igrač ne aktivira Renovaciju | — |

### Tabela 11: Zona Level Vizuelni Milestone-i (Pult)

| Level | Vizuelna promena | Canvas ili CSS |
|---|---|---|
| 1 | Osnovna silueta, 0 lampiona, dim | CSS static |
| 2 | 2 lampiona uključena (trepću) | CSS keyframe |
| 3 | Equalizer bar animacija u pozadini, 1 NPC silueta | Canvas (aktivna zona) / CSS (pasivna) |
| 4 | Neon znak pali se ("PULT" tekst), puteljak vidljiv | CSS |
| 5 | Holografski neon overflow efekt, permanentni glow | Canvas (aktivna) / CSS (pasivna) |

### Tabela 12: Zona Level Vizuelni Milestone-i (Bina)

| Level | Vizuelna promena | Canvas ili CSS |
|---|---|---|
| 1 | Prazna pozornica, nema rasvjete | CSS static |
| 2 | Spotlight na praznoj sceni (treperi) | CSS keyframe |
| 3 | Akustični talasi pri hoveru, 1 NPC (DJ Ace) | Canvas (aktivna) |
| 4 | Setlist Tabla vidljiva, turnejski datumi prikazani | DOM/HTML |
| 5 | Zvezdani spotlight efekt, pasivni glow | Canvas (aktivna) |

### Tabela 13: Zona Level Vizuelni Milestone-i (Šuma)

| Level | Vizuelna promena | Canvas ili CSS |
|---|---|---|
| 1 | Tamna šuma, nema bioluminiscencije | CSS static |
| 2 | 3 bioluminiscentne tačke (pulse animation) | CSS keyframe |
| 3 | Lišće pada (CSS, ne Canvas — performance), 1 NPC (Mara) | CSS animation |
| 4 | Baterijska lampa krug prati kursor u zoni | Canvas (aktivna) |
| 5 | Bioluminiscentne životinje (CSS sprite), permanentni glow | CSS + Canvas (aktivna) |

### Tabela 14: Logbook Kapacitet po Versiji

| Kategorija | V0.3 | V1.0 | V2.0 (kraj S2) |
|---|---|---|---|
| Mini-priče | 15 (5×3 zone) | 45 (5×9 zone) | 180 (20×9) |
| Lore fragmenti | 4 (1/NPC) | 16 (4/NPC per sezona) | 32+ |
| Easter Egg types | 7 tipova | 21 tipova | 63 |
| Zona milestones | 6 (L1→2 ×3) | 18 (L1→5 ×3 aktiv. zone) | 45 |
| Renovacioni žigovi | 0 | 2 | 6+ |
| Ekskluzivni | 2-4 (Avala, Guncati) | 10+ | 20+ |

### Tabela 15: Anti-Abuse LocalStorage Keys

| Key | Vrednost | Reset trigger |
|---|---|---|
| `parkMapa_lastEggDate` | `'YYYY-MM-DD'` | Na novu kalendarsku vrijednost |
| `parkMapa_eggsToday` | `integer 0-7` | Kad `lastEggDate` promijeni |
| `parkMapa_lastCheckIn_pult` | ISO timestamp | Nikad (cooldown se računa od toga) |
| `parkMapa_lastCheckIn_bina` | ISO timestamp | Nikad |
| `parkMapa_lastCheckIn_suma` | ISO timestamp | Nikad |
| `parkMapa_dailyClosure` | `'YYYY-MM-DD'` | Na novu kalendarsku vrijednost |
| `parkMapa_weekStart` | ISO timestamp | Svaki ponedjeljak |
| `parkMapa_state_v1` | JSON string | Nikad (migration via version key) |
| `parkMapa_logbook_v1` | JSON string | Nikad |

---

*GDD verzija: 1.1 — Park Mapa V0.3*
*Autor: Mile Mehanika, Game Designer & Economy Balancer, Gari Daily Games*
*Datum: 2026-06-13*
*Napomena: Retry/port iz 2026-05-21 V1.0 — dizajn nepromenjen, samo datum/aktuelnost korekcija (bina-setlist primer).*
