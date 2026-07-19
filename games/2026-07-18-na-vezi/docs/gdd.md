# GDD — Na Vezi
**Game Designer:** Mile Mehanika | **Datum:** 2026-07-18 | **Faza:** Concept → GDD (posle premortem korekcija)

---

## 0. SCOPE DECISION — LOC/Modul Cilj (adresira S-1)

**Nega je proverio istoriju repoa. Ovo su činjenice, ne procena:**

| Igra | Modula (JS+CSS) | JS linija |
|------|------------------|-----------|
| Imanje Tycoon (07-09) | 34 | 8.578 |
| Zemlja i Znanje (06-07) | 63 | 7.744 |
| Festival Mreža (06-04) | 39 | 5.355 |
| Avala Crew (06-06) | 26 | 6.775 |

Nijedna od četiri prethodne multi-layer igre nije prišla 18.000-28.000 JS liniji koju CLAUDE.md Scope tabela navodi za multi-layer manager/sim. Imanje Tycoon je jednom pao ceo impl stage zbog prevelikog scope-a pre nego što je stao na 8.578. **Ja ne kalibrišem "Na Vezi" na cilj koji nijedna slična igra dosad nije pogodila.**

**Baseline (bez dodatnog sadržaja):** Kad rastavim golu mehaničku listu iz concept.md — 5 macro odluka, 5 micro alarm tipova (izolovani, bez lanaca), 3 platform krive, prestige/unlock, 10-15 achievement-a — to je strukturno uporedivo sa Festival Mrežom (39 modula/5.355 linija) ili Avala Crew (26/6.775). Baseline procena: **~33 modula, ~6.000-6.800 JS linija.**

**Šta dodajem preko baseline-a — i zašto je to opravdano, ne padding:**

Premortem je tražio tri konkretna sistema (S-1 alternativa 1) koja postoje kao pravi moduli sa sopstvenom logikom, ne kao reskin postojećih:

| Novi modul | Razlog | Šta radi |
|---|---|---|
| `src/meta/reliability-tracker.js` | S-1(a) / R-2 | Gost no-show istorija koja se PAMTI kroz sezone — poseban state graf odvojen od jednonedeljnog booking-a |
| `src/micro/alarm-escalation.js` | S-1(b) | Lanac-logika: koji alarm okida koji sledeći ako se ne reši na vreme — poseban sistem od `alarm-generator.js`, ne isti fajl |
| `src/meta/replay-highlights.js` | S-1(c) | Bira 2-3 najbolja/najgora momenta iz emisije, generiše highlight state koji hrani i meta-progresiju i content hook |
| `src/ui/replay-screen.js` | S-1(c) | UI prikaz highlight reel-a — zaseban od `ui.js` jer je zaseban ekran sa svojom navigacijom |
| `src/ui/offgrid-meter.js` | R-1 | Off-grid traka kao ZASEBNA komponenta van `render.js` — garantuje da dobije sopstveni layout prostor, ne deli fajl sa ostale 4 trake |
| `src/ui/tutorial-mode.js` | R-3 | Progressive-disclosure state flag + panel-dimming logika za onboarding nedelju |
| `styles/tutorial.css` | R-3 | Vizuelno prigušivanje/sklanjanje panela u tutorial modu — zaseban od `ui.css` da se ne meša sa punim dashboard stilom |
| `src/content/chat-templates.js` | R-4 | Proceduralni slot-filling chat generator dovoljno velik da ne izgubi varijaciju pre 15-20 sesija |

**8 modula, direktno vezanih za 4 obavezne korekcije, ne za brojku radi brojke.**

**Finalni cilj:**

| Parametar | Cilj |
|---|---|
| JS linija | **8.500–9.500** |
| CSS linija | **800–1.100** |
| Broj modula (JS+CSS) | **~44** (33 baseline + 8 premortem-obavezna + main/config/state/events jezgro već uračunato u baseline) |

Ovo je iznad Festival Mreže i Avala Crew, ispod Zemlje i Znanja po modulima, uporedivo sa Imanje Tycoonom po linijama — sve unutar dokazanog opsega ovog repoa, ne u 18-28k zoni koju niko nije dostigao. Ako impl sesija (Jova, 4a) proceni da 44 modula ne stanu u token budžet jedne sesije, sme da baci **isključivo kozmetičke** module (`ui/replay-screen.js` može se privremeno spojiti u `ui.js`) — ali svih 8 modula iz tabele iznad su GDD-mandat, ne "nice to have", i moraju biti predstavljeni bar kao funkcija unutar postojećeg fajla ako se ne odobri zaseban fajl.

---

## 1. MACRO LAYER — 5 ODLUKA DETALJNO

Svaka nedelja = jedna `planning-session.js` sesija, 5 odluka se "zaključavaju" pre prelaska u micro layer.

### 1a. Format emisije

| Opcija | Priprema (min gameplay) | Content kvalitet base | Platform afinitet (R-2) |
|---|---|---|---|
| DJ lajv set | 2 min | 1.0× | TikTok spike ×1.4, IG ×1.0, YouTube ×0.8 |
| Podkast/razgovor | 3 min | 1.1× | YouTube retencija ×1.35, IG ×1.05, TikTok ×0.7 |
| Obilazak imanja ("vlog uživo") | 1.5 min | 0.9× | IG ×1.2, TikTok ×0.9, YouTube ×0.85 |

Format bira i baznu potrošnju off-grid kapaciteta (Rasveta scaling u sekciji 2): DJ lajv format sa punom rasvetom troši najviše baterije po satu emisije; podkast (samo mikrofon + jedan feed) troši najmanje. **Ovo je prva od tri outcome-teksta koja direktno referencira solar/baterijski kontekst (R-1):** *"DJ lajv sa punom rasvetom je najgladniji za bateriju — razmisli da li ova nedelja ima kapaciteta za to pre nego što zaključaš format."*

### 1b. Platform alokacija

Bandwidth budžet po platformi, slider UI, ukupno ograničen na `weekly_offgrid_capacity` (sekcija 2). **Druga solar-tie odluka (R-1):** YouTube viša rezolucija (za retenciju) troši ~1.6× bandwidth po satu u odnosu na IG; ako je nedelja bila oblačna, outcome tekst kaže: *"Baterija ove nedelje ne pokriva YouTube u punoj rezoluciji — ili skraćuješ segment, ili žrtvuješ kvalitet slike."*

```
platform_cost_per_unit = { ig: 1.0, tiktok: 1.15, youtube: 1.6 }
required_capacity = sum(allocation[p] × platform_cost_per_unit[p] for p in platforms)
if required_capacity > weekly_offgrid_capacity:
  → forced downgrade: bitrate_tier -1 PO platformi dok required_capacity <= weekly_offgrid_capacity
  → nikad hard-block emisije, uvek postoji "niži kvalitet" fallback (concept: "blago, ne punish-heavy")
```

### 1c. Oprema / infrastruktura

Pun katalog u sekciji 3 (18 stavki). **Treća solar-tie odluka (R-1), Negin sopstveni primer implementiran doslovno:** L1 "Drugi internet link" outcome tekst: *"Smanjuje zavisnost od bandwidth-a kad je baterija niska — reroute ne mora da čeka pun signal."*

### 1d. Gost

Booking iz roster-a (sekcija 4), no-show rizik je funkcija `reliability-tracker.js` istorije, ne fiksni broj po gostu.

### 1e. Off-grid resurs menadžment

Detaljno u sekciji 2 — ovo NIJE "još jedna od pet ravnopravnih odluka" u UI-ju, vidi R-1 UI mandat ispod.

---

## 2. OFF-GRID RESURS SISTEM (R-1 — primarni sistem, ne dekoracija)

### UI mandat (eksplicitan zahtev za Jovu, ne njegovo nahođenje)

- Off-grid traka je **najveća i najgornja komponenta dashboard-a**, u zasebnom fajlu `src/ui/offgrid-meter.js` — ne jedna od 4-5 vizuelno ravnopravnih traka.
- Zauzima minimum 25% vertikalnog prostora dashboard header-a (naspram ~10-12% za svaku od preostalih traka: signal, chat×3, publika×3).
- "Diše" (puni se/prazni) kao što concept sekcija 6 opisuje — ovo je vizuelni prioritet, ne floskula.
- U macro layeru, off-grid kapacitet broj je PRVA stvar prikazana na weekly briefing ekranu (pre bilo koje od 5 odluka), pošto direktno određuje šta je uopšte moguće te nedelje.

### Formula — nedeljni kapacitet (0-100 apstraktna skala, NE watt-sati)

```javascript
function rollWeeklyCapacity(baseCapacity, weatherVarianceReduction) {
  const roll = Math.random();
  let band, mult;
  if (roll < 0.25)      { band = "oblačno";  mult = randRange(0.45, 0.65); }
  else if (roll < 0.75) { band = "prosečno"; mult = randRange(0.80, 1.00); }
  else                   { band = "sunčano";  mult = randRange(1.00, 1.15); }

  // B2 (solar panel dodatak) sužava varijansu — predvidljivije, ne veće
  if (weatherVarianceReduction) {
    mult = lerp(mult, 1.0, 0.35); // 35% bliže "prosečnom" ishodu
  }
  return clamp(Math.round(baseCapacity * mult), 15, 100);
}

BASE_OFFGRID_CAPACITY_START = 55   // /100, pre ijedne Battery/Solar investicije
```

Svaka Battery/Solar oprema (sekcija 3, kategorija B) trajno podiže `BASE_OFFGRID_CAPACITY`, roll se dešava iznad te nove baze. Ovo je namerno RNG "blago, ne punish-heavy" (concept napomena) — donja granica 15 sprečava potpuni nulti ishod, gornja 100 je hard cap skale.

### Runtime trošenje (micro layer)

```javascript
// tick svake sekunde emisije dok je "on air"
capacity_remaining -= (base_drain_rate[format] + lighting_draw[equip_tier] + platform_draw_active)
// signal-drop reroute na backup link (E1/L1) troši dodatnih capacity_remaining -= REROUTE_COST (jednokratno)
```

Ako `capacity_remaining` padne ispod 15, `battery-critical` alarm šansa raste (formula u sekciji 6) — ovo je runtime posledica loše macro alokacije, tačno carry-over petlja iz concept sekcije 6.

---

## 3. OPREMA — UPGRADE TABELA (18 stavki)

Cena je igra-interna valuta ("kapital", kao dinari u Imanje Tycoonu — ne realan Guncati broj). Efekat na alarm % koristi eksponencijalni diminishing-returns obrazac (sekcija 6).

| # | Upgrade | Kategorija | Cena (kapital) | Efekat | Nivo |
|---|---------|-----------|-----------------|--------|------|
| E1 | Rezervni encoder | Signal | 1.800 | Signal-drop % nivo 1 (decay 0.80) | 1 |
| E2 | Encoder Pro | Signal | 4.500 | Signal-drop % nivo 2 | 2 |
| E3 | Auto-failover modul | Signal | 9.000 | Signal-drop % nivo 3 + Hardware-fault % nivo 1 | 3 |
| E4 | Enterprise encoder | Signal | 22.000 | Signal-drop % nivo 4 (cap), stabilizuje reroute troškove | 4 |
| A1 | Bolji mikrofon | Audio | 2.200 | Feedback-glitch % nivo 1, +5% podkast engagement | 1 |
| A2 | Zvučna izolacija/pop filter | Audio | 3.800 | Feedback-glitch % nivo 2 | 2 |
| A3 | Mixer sa DSP EQ | Audio | 8.500 | Feedback-glitch % nivo 3, EQ mini-fix prozor +1s | 3 |
| A4 | Studio-grade audio interfejs | Audio | 16.000 | Feedback-glitch % nivo 4 (cap) | 4 |
| R1 | Osnovna LED rasveta | Rasveta | 1.500 | +6% DJ lajv engagement, `lighting_draw` +8/100 kapaciteta/sat | 1 |
| R2 | String lights upgrade | Rasveta | 2.600 | +4% engagement sve formate (ambient), `lighting_draw` +3/100/sat | 1 |
| R3 | Profesionalna rasveta | Rasveta | 12.000 | +15% DJ lajv engagement, `lighting_draw` +18/100 kapaciteta/sat | 3 |
| L1 | Drugi internet link (backup) | Link | 5.000 | Signal-drop % nivo 2 dodatno, smanjuje reroute cost 40% | 2 |
| L2 | Bandwidth optimizer softver | Link | 3.200 | Platform-hiccup % nivo 1 | 1 |
| L3 | Redundantni SIM/hotspot | Link | 7.500 | Signal-drop % nivo 3 dodatno, smanjuje zavisnost od kućnog routera (manji battery draw) | 2 |
| B1 | Dodatna baterijska banka | Off-grid | 6.000 | `BASE_OFFGRID_CAPACITY` +10 trajno | 1 |
| B2 | MPPT/solar panel dodatak | Off-grid | 14.000 | `BASE_OFFGRID_CAPACITY` +15 trajno, sužava weather varijansu 35% | 2 |
| B3 | Energy-efficient encoder mod | Off-grid | 9.500 | `platform_cost_per_unit` sve platforme −15% | 2 |
| B4 | Battery health monitor | Off-grid | 4.200 | Battery-critical % nivo 2 dodatno, rano upozorenje UI (5s pre kritičnog) | 1 |

**18 stavki**, min 4 po kategoriji signal/audio/link, 3 rasveta, 4 off-grid (namerno najveća kategorija po broju — off-grid je i najveći sistem po pravilu R-1, ne slučajnost).

---

## 4. GOST ROSTER — RELIABILITY SISTEM (R-2, S-1a)

### Formula — reliability koja se pamti kroz sezone

```javascript
// state persistira u meta/reliability-tracker.js, NE resetuje se pri prestige (sekcija 8)
function noShowChance(guest) {
  const base = GUEST_BASE_NO_SHOW[guest.id];
  const reliabilityAdjust = (guest.reliability - 50) * 0.006; // -0.006 po poenu iznad 50, obrnuto ispod
  return clamp(base - reliabilityAdjust, 0.03, 0.55);
}

function onEmisijaResolved(guest, showedUp, wasStandout) {
  if (!guest) return;
  if (showedUp) {
    const gain = wasStandout ? 9 : 5;
    guest.reliability = clamp(guest.reliability + gain * (1 - guest.reliability / 120), 0, 100); // diminishing returns blizu 100
  } else {
    guest.reliability = clamp(guest.reliability - 15, 0, 100);
  }
}
```

### Roster tabela (8 gostiju)

| # | Gost | Format afinitet | Base reliability | Base no-show % | Engagement bonus | Napomena |
|---|------|------------------|-------------------|------------------|--------------------|----------|
| G1 | Domaćin sa Imanja (Guncati ekipa) | Sve formate | 85 | 5% | +8% (stabilan) | Uvek na imanju, najsigurniji izbor |
| G2 | DJ "Susedovo Dvorište" | DJ lajv | 60 | 15% | +22% DJ lajv, +5% ostalo | Lokalni, brz dolazak |
| G3 | DJ "Iz Grada" | DJ lajv | 45 | 25% | +30% DJ lajv (TikTok spike) | Putuje — no-show rizik raste ako je prošla nedelja imala loš internet (remote dogovor) |
| G4 | Kum sa Farme | Podkast/Obilazak | 75 | 8% | +15% (topao ton) | Dostupan vikendom |
| G5 | Gost-stručnjak (rotira po temi) | Podkast | 65 | 12% | +18% (YouTube retencija) | Edukativni sadržaj, veže se na masterclass ekosistem |
| G6 | "Sused" (rotirajući flavor NPC) | Obilazak | 70 | 10% | +6% | Siguran fallback, nizak upside |
| G7 | DJ "Prvi Put" | DJ lajv | 40 (otkriva se posle 1. bookinga) | 30% | +35% ako uspe | Najveći rizik/nagrada gost u igri |
| G8 | Niko — solo emisija | Sve | N/A | 0% | 0% | Default fallback, sigurno, najmanje zanimljivo |

**Format↔platforma ukrštanje (R-2 drugi deo):** DJ lajv format sa DJ gostom (G2/G3/G7) dobija dodatni TikTok spike multiplier ×1.15 preko baznog format bonusa iz sekcije 1a — gost i format se ne tretiraju nezavisno, kombinacija ima sopstveni broj.

---

## 5. MICRO LAYER — DASHBOARD I ALARM SISTEM

### 5a. Dashboard traka (prioritet, R-1)

1. **Off-grid kapacitet** — najveća, najgornja (`ui/offgrid-meter.js`)
2. Signal jačina
3. Chat aktivnost (IG/TikTok/YouTube, jedna traka po platformi)
4. Publika po platformi

### 5b. Alarm generator + eskalacija (S-1b)

```javascript
// alarm-generator.js — bira KOJI alarm, alarm-escalation.js — šta se dešava ako nerešen
function rollAlarm(equipLevels, weeklyCapacity) {
  const chances = {
    signal_drop:      alarmChance('signal_drop', equipLevels.signal),
    feedback_glitch:  alarmChance('feedback_glitch', equipLevels.audio),
    battery_critical: alarmChance('battery_critical', equipLevels.offgrid, weeklyCapacity),
    platform_hiccup:  alarmChance('platform_hiccup', equipLevels.link),
    hardware_fault:   alarmChance('hardware_fault', equipLevels.signal) * 0.5, // retkiji base, raste kroz eskalaciju
  };
  return weightedPick(chances);
}
```

### Alarm tipovi (5, sa eskalacijom)

| # | Alarm | Base % | Smanjuje (oprema) | Reakcija igrača | Eskalacija ako nerešen |
|---|-------|--------|---------------------|-------------------|--------------------------|
| AL1 | Signal Drop | 22% | Signal kategorija (E1-E4) | Reroute na backup (troši kapacitet) ili "guraj kroz" (rizik) | +15% šansa za AL3 sledeći check (encoder povlači rezervnu snagu) |
| AL2 | Feedback/Audio Glitch | 15% | Audio kategorija (A1-A4) | EQ mini-fix, 2-4s prozor | Promašen prozor: +10% šansa za SLEDEĆI alarm bilo kog tipa (operater uzrujan) |
| AL3 | Battery Critical / Power Sag | 18% | Off-grid kategorija (B1-B4) + `weeklyCapacity` | Smanji load (isključi jednu platformu privremeno) ili ignoriši (rizik) | +20% šansa za AL1 (napon padne, encoder gubi signal) |
| AL4 | Platform API Hiccup | 12% | Link kategorija (L1-L3) | Restart feed na toj platformi (kratak gap) | Nema lančanu eskalaciju na druge alarme — lokalizovan, ali produžen chat penalty na toj platformi |
| AL5 | Hardware Fault / Overheating | 8% base (retkiji) | Signal kategorija (E3+) | Emergency restart (žrtvuje off-grid kapacitet da "restartuje/ohladi") | Ako se desi kao 2. nerešeni alarm u istoj emisiji: +25% šansa (kaskadni hardverski stres); nerešen AL5 = rizik ranog kraja emisije |

### Formula — alarm % (eksponencijalni diminishing returns, kao prestige logika iz Imanje Tycoona)

```javascript
const DECAY = 0.80; // svaki nivo opreme seče PREOSTALU šansu za 20%

function alarmChance(type, equipLevel, weeklyCapacity = null) {
  let chance = BASE_ALARM_CHANCE[type] * Math.pow(DECAY, equipLevel);
  if (type === 'battery_critical' && weeklyCapacity !== null && weeklyCapacity < 60) {
    chance *= 1 + (60 - weeklyCapacity) / 100; // niska nedeljna baterija = veći rizik uživo
  }
  return Math.max(chance, MIN_ALARM_CHANCE[type]); // floor, nikad 0%
}

BASE_ALARM_CHANCE = { signal_drop: 0.22, feedback_glitch: 0.15, battery_critical: 0.18, platform_hiccup: 0.12, hardware_fault: 0.08 };
MIN_ALARM_CHANCE  = { signal_drop: 0.04, feedback_glitch: 0.03, battery_critical: 0.05, platform_hiccup: 0.03, hardware_fault: 0.02 };
```

Prva investicija u kategoriju najviše seče (22% → 17.6% za E1), dalje investicije diminishing returns (nivo 4: 22% × 0.8^4 ≈ 9%) — identična logika kao Imanje Tycoon `1.15^upgrades` yield compounding, samo obrnuti smer (smanjenje umesto rasta).

### 5c. Chat momentum + sadržaj (R-4)

`content/chat-templates.js` — proceduralni slot-filling:

```javascript
message = pick(NAME_POOL) + " " + pick(TEMPLATE_POOL[platform][contextTag]);
// NAME_POOL: ~18 imena po platformi
// TEMPLATE_POOL[platform][tag]: ~12-15 templatea po (platforma × kontekst-tag), 4 tag-a (hype, pitanje, kritika, podrška)
// kombinacije po platformi: 18 × 12 × 4 ≈ 860 jedinstvenih poruka
```

~860 kombinacija po platformi, ~30 poruka viđenih po emisiji → ponavljanje statistički postaje primetno tek posle ~25-28 emisija (860/30), preko 15-20 sesija cilja iz R-4.

### 5d. Platform krive (formule)

```javascript
// IG — najstabilniji, srednji rast, kompaunduje nedeljno
audience_IG(week+1) = audience_IG(week) * (1 + 0.06 * allocation_IG_pct * reputationMult)

// TikTok — brz spike unutar emisije, brz pad ako se ne održava
spike_bonus = handled_first_2min ? 1.8 : 1.0
audience_TikTok(week+1) = audience_TikTok(week) * (1 - 0.12 * (allocation_TikTok_pct === 0 ? 1 : 0)) + newGain * spike_bonus

// YouTube — spor rast, duži "repovi" (retencija), kompaunduje sporije ali stabilnije
audience_YouTube(week+1) = audience_YouTube(week) * 1.03 + retentionBonus * formatLengthFactor[format]
```

IG > TikTok > YouTube prioritet iz Guncati prakse odražen kroz redosled implementacije i UI redosled (IG uvek levo/prvo), ne kroz brojeve koji favorizuju IG arbitrarno — svaka kriva ima svoju logiku, IG samo dobija najviše pažnje u default UI layout-u.

---

## 6. CARRY-OVER FORMULE (Macro → Micro → Meta)

```javascript
// Oprema → alarm šansa (sekcija 5, formula gore)

// Ishod emisije → kapital
capital(week+1) = capital(week) + revenue(week) - upkeep_cost;
revenue(week) = sum(audience[p] * engagement[p] * MONETIZATION_WEIGHT[p] for p in platforms);

// Off-grid loša alokacija → nauči za sledeći put (nema hard formula, UI feedback)
// weekly briefing eksplicitno prikazuje: "Prošle nedelje: YouTube je pojeo 60% baterije, IG (prioritet) je bio na 20%"

// Gost reliability → sekcija 4 formula

// Format↔platforma ukrštanje → sekcija 4 napomena
```

---

## 7. PRESTIGE LOOP (sezonski reset)

### Trigger

```javascript
prestige_eligible = signalStabilanReached && emisije_u_sezoni >= SEASON_LENGTH; // SEASON_LENGTH = 8
```

8 emisija po sezoni × 15-22 min po ciklusu ≈ 2-3h + finalna prestige sesija 20-25 min ≈ ukupno **~3-4h do prvog prestige-a**, poklapa se sa concept sekcijom 10.

### Šta ostaje / šta se resetuje

| Element | Ostaje | Resetuje se |
|---|---|---|
| Oprema (sve kupljeno) | ✅ trajno | — |
| Gost reliability istorija | ✅ trajno (S-1a — cela poenta sistema) | — |
| Achievement progres | ✅ trajno | — |
| Otključani formati (solo→gost→simulcast) | ✅ trajno | — |
| Publika/engagement po platformi | 15% "loyal core" carry | 85% resetuje se |
| Kapital | Starter grant skaliran multiplierom | Balans resetuje se |
| Sezonski brojač emisija | — | reset na 0 |

### Multiplier stacking

```javascript
season_multiplier = Math.pow(1.12, prestige_count); // P1: ×1.12, P2: ×1.254, P3: ×1.405
// primenjuje se na sve audience growth rate-ove (sekcija 5d) trajno

loyal_core_carry = 0.15; // % publike koji NE resetuje se
starter_grant(prestige_count) = BASE_STARTER_GRANT * season_multiplier;
```

### Format unlock redosled (iz concept sekcije 11)

1. Solo emisija (default)
2. Gost format (posle prve stabilne sezone)
3. Simulcast (kasni unlock, najviši rizik/nagrada, Kluboslavija cross-promo hook — `[PROVERI SA ŠEFOM]` pre javnog marketing copy-ja, ostaje samo unutar-igre meta cilj do tada)

---

## 8. REPLAY / HIGHLIGHT SISTEM (S-1c, novi sadržajni modul)

`meta/replay-highlights.js` + `ui/replay-screen.js`.

**Šta radi:** Na kraju svake emisije (`emisija-resolver.js`), sistem bira 2-3 "momenta" iz te emisije po jednostavnom scoring pravilu:

```javascript
function scoreHighlightCandidate(event) {
  let score = 0;
  if (event.type === 'alarm_resolved_ontime') score += 15;
  if (event.type === 'alarm_chain_broken') score += 25; // eskalirajući lanac uspešno prekinut (sekcija 5b)
  if (event.type === 'tiktok_spike_caught') score += 20;
  if (event.type === 'guest_standout') score += 18;
  if (event.type === 'battery_critical_survived') score += 22; // off-grid tenzija, direktna R-1 veza
  return score;
}
// top 2-3 po score-u postaju "highlight" — kratak tekstualni/vizuelni rezime, ne video render
```

**Hrani dve stvari:**
1. **Meta progresiju** — highlight-i se akumuliraju u `season-stats.js`, doprinose achievement-ima (npr. "Highlight Reel" u sekciji 9)
2. **Content hook** (concept sekcija 9, Guncati primary) — highlight rezime je tekstualni/vizuelni artefakt koji igrač može podeliti (`share.js`), i koji prirodno najavljuje "pravu" Guncati TV emisiju istog tipa

Ovo NIJE video render sistem (van scope-a za Vanilla JS/no-build ograničenje) — highlight je strukturirani tekst+ikonica rezime, renderovan kao karta u `replay-screen.js`.

---

## 9. ACHIEVEMENT TABELA (14 stavki)

| # | Achievement | Trigger | Nagrada |
|---|-------------|---------|---------|
| AC1 | Prvi Signal | Prva emisija bez kritičnog pada | +kapital bonus |
| AC2 | Signal Stabilan | Primary win: 4 uzastopne emisije bez kritičnog pada + engagement prag na sve 3 platforme + 1 emisija sa gostom bez no-show-a | Otključava "Signal Stabilan" status badge |
| AC3 | Sunčan Rezervni Fond | Emisija sa >80% iskorišćenog nedeljnog kapaciteta bez otpada | Off-grid efikasnost +3% trajno |
| AC4 | Oblačna Nedelja Preživljena | Puna emisija odrađena u "oblačnoj" nedelji bez smanjenja bitrate-a | Battery-critical % −2% dodatno |
| AC5 | Tri Platforme u Ravnoteži | Alokacija sve tri platforme u okviru 10% jedna od druge, u istoj nedelji | Reputacija bonus |
| AC6 | TikTok Spike Uhvaćen | Prvih 2 minuta emisije uspešno iskorišćena (spike_bonus aktivan) | TikTok growth rate +5% ta sezona |
| AC7 | YouTube Maratonac | Podkast format sa top-tier retention bonusom | YouTube growth rate +5% ta sezona |
| AC8 | Gost Kome Veruješ | Bilo koji gost dostigne reliability ≥ 90 | Taj gost dobija stalni engagement bonus +5% |
| AC9 | Nikad Ne Kasni | 5 bookinga bez ijednog no-show-a (bilo koja kombinacija gostiju) | Kapital bonus |
| AC10 | Alarm Lanac Prekinut | Uspešno rešen eskalirajući lanac (2+ alarma u istoj emisiji) bez gubitka emisije | Achievement + highlight garantovan |
| AC11 | Highlight Reel | Prvi highlight generisan (replay sistem) | Otključava replay-screen kozmetički skin |
| AC12 | Sezonski Reset | Prvi prestige urađen | Studio milestone (string lights upgrade) |
| AC13 | Simulcast Otključan | Simulcast format dostignut | Kozmetički dashboard skin |
| AC14 | Baterija na Ivici | Emisija završena sa off-grid kapacitetom ispod 10 | Achievement (rizični stil igre, iz concept sekcije 11 primera) |

**14 stavki**, unutar 10-15 zahteva.

---

## 10. ONBOARDING — TUTORIAL NEDELJA (R-3, progressive disclosure)

### Šta je suženo — ODLUKE (već u konceptu)

Jedan format (DJ lajv solo, unapred izabran), jedna platforma (IG), blag alarm (feedback_glitch, najlakši tip).

### Šta je NOVO suženo — DASHBOARD (GDD mandat, ne opciono)

`ui/tutorial-mode.js` postavlja `tutorialMode: true` u state-u, koji `render.js`/`offgrid-meter.js`/`ui.js` čitaju:

```javascript
if (state.tutorialMode) {
  hidePanel('chat-tiktok');
  hidePanel('chat-youtube');
  hidePanel('audience-tiktok');
  hidePanel('audience-youtube');
  dimPanel('signal', 0.6);  // vidljiv ali ne pun fokus
  fullIntensity('offgrid-meter'); // JEDINA druga puno-intenzivna traka uz signal
  fullIntensity('chat-ig');
}
```

`styles/tutorial.css` nosi `.dimmed` i `.hidden-tutorial` klase — jedan CSS/state flag, jeftino po Neginoj proceni, ali samo ako je specificirano unapred (ovde jeste).

**Sledeće 2-3 sesije:** panel-i se "pale" postepeno kako igrač dobija nove platforme/formate (TikTok panel se pojavljuje kad igrač prvi put alocira budžet ka TikTok-u, ne pre toga).

---

## 11. PACING PO MINUTAMA

### Macro (8-12 min)

| Minut | Šta se dešava |
|---|---|
| 0:00–1:30 | Weekly briefing: prošlonedeljni outcome (uptime%, engagement po platformi, kapital delta) + **off-grid kapacitet broj prvi na ekranu** |
| 1:30–3:30 | Format izbor, sa preview platform-afiniteta (sekcija 1a) |
| 3:30–5:30 | Platform alokacija (slider), live prikaz da li prelazi weekly_capacity |
| 5:30–7:30 | Oprema shop (opciono), preview alarm % promene pre kupovine |
| 7:30–9:30 | Gost booking, prikaz trenutnog reliability % po gostu |
| 9:30–11:00 | Off-grid finalna alokacija, potvrda |
| 11:00–12:00 | Lock-in, "ON AIR za X sekundi" prelaz |

### Micro (6-10 min)

| Minut | Šta se dešava |
|---|---|
| 0:00–0:30 | On-air intro, dashboard init |
| 0:30–2:30 | Rani segment — TikTok spike window (ako alocirano), prvi signal check |
| 2:30–5:00 | Srednji segment — chat momentum, prvi alarm (weighted po opremi/kapacitetu), gost interakcija |
| 5:00–7:30 | Drugi alarm moguć (eskalacija ako prvi nerešen), audience tick nastavlja |
| 7:30–9:00 | Closing segment — YouTube retention payoff (ako podkast), gost wrap-up |
| 9:00–10:00 | Off-air, outcome summary, kapital/reputacija delta, highlight auto-generisan |

---

## 12. WIN / LOSE USLOVI

**Primary win ("Signal Stabilan"):** 4 uzastopne emisije bez kritičnog pada signala (AL1/AL5 neuspešno rešen) + prosečan engagement iznad praga na sve tri platforme + bar jedna emisija sa gostom bez no-show-a. Ovo NIJE game-end — igra nastavlja (prestige loop, sekcija 7).

**Soft-fail ("Studio Gašenje"):** Ako kapital negativan 2 uzastopne nedelje I sva oprema na minimalnom nivou (nema šta dalje da se rasproda/downgrade) → prinudni reset bez zarađenog prestige multipliera (kazneni, ali redak, ne punishing-po-defaultu jer zahteva dva uzastopna promašaja).

**Emisija-level rani kraj:** 2+ nerešena AL5 (Hardware Fault) lanca u istoj emisiji → emisija se prekida ranije, računa se sa umanjenim outcome-om, ali NE gubi se gost reliability niti oprema — samo ta nedelja daje manji revenue.

---

## 13. MODUL LISTA (nacrt manifest.json `modules`)

```
src/main.js              — Bootstrap, wire macro→micro→meta petlju
src/config.js             — Sve tuning konstante (base capacity, alarm %, growth rate-ovi, cene)
src/state.js               — Game state shape, save/load u localStorage
src/events.js               — Event bus (macro↔micro↔meta komunikacija, alarm↔escalation trigeri)

src/content/gost-roster.js        — 8 gostiju, base reliability profili (statički podaci)
src/content/chat-templates.js     — Proceduralni chat generator, slot-filling (R-4)
src/content/aforizmi.js           — Pera Period inner monologue mikro-aforizmi
src/content/brand-hooks.js        — CTA copy, brand_serves linkovi ([PROVERI SA ŠEFOM] placeholderi)

src/macro/planning-session.js     — Orkestrira 5 nedeljnih odluka, lock-in flow
src/macro/format-selector.js      — Format izbor + platform-afinitet preview (1a)
src/macro/platform-allocation.js  — Bandwidth slider, weekly_capacity provera (1b)
src/macro/equipment-shop.js       — Oprema kupovina, alarm % preview (1c, sekcija 3)
src/macro/guest-booking.js        — Gost izbor, reliability-aware no-show preview (1d, sekcija 4)
src/macro/offgrid-budget.js       — Nedeljni capacity roll + finalna alokacija (1e, sekcija 2)
src/macro/weekly-outcome.js       — Resolveuje prošlu nedelju u kapital/reputaciju (carry-over)

src/micro/dashboard-state.js      — Real-time tick state tokom emisije
src/micro/signal-system.js        — Signal-drop logika, reroute/guraj-kroz odluka
src/micro/alarm-generator.js      — Bira koji alarm (weighted po opremi/kapacitetu)
src/micro/alarm-escalation.js     — Lanac-logika: koji alarm okida sledeći (S-1b)
src/micro/eq-minigame.js          — Feedback/glitch 2-4s mini-fix
src/micro/chat-momentum.js        — Chat stream po platformi, momentum scoring
src/micro/platform-curves.js      — IG/TikTok/YouTube formule tick-po-tick (5d)
src/micro/guest-runtime.js        — Gost kasni/no-show runtime, banter/klip fallback
src/micro/offgrid-runtime.js      — Battery drain/charge tokom emisije
src/micro/emisija-resolver.js     — Kraj emisije: uptime, engagement, no-show flag, highlight trigger

src/meta/reliability-tracker.js   — Gost no-show istorija, PAMTI kroz sezone (S-1a/R-2)
src/meta/prestige.js               — Sezonski reset, multiplier stacking (sekcija 7)
src/meta/achievements.js           — 14 achievement provera
src/meta/unlock-manager.js         — Format unlock redosled (solo→gost→simulcast)
src/meta/replay-highlights.js      — Highlight scoring i selekcija (S-1c, sekcija 8)
src/meta/season-stats.js           — Istorija sezone, "Signal Stabilan" tracking

src/render.js               — Canvas/DOM dashboard render (signal, chat, publika trake)
src/ui.js                    — Macro planning UI, meniji, modali
src/ui/tutorial-mode.js      — Progressive-disclosure state flag (R-3)
src/ui/replay-screen.js      — Highlight reel prikaz (S-1c)
src/ui/offgrid-meter.js      — Dedicated off-grid traka, dominantan UI element (R-1)
src/input.js                  — Keyboard/mouse/touch handlers
src/audio.js                   — Web Audio SFX (alarm blip, chat tap, on-air/off-air, battery pulse)
src/share.js                    — Screenshot + Web Share API (highlight share)

styles/base.css        — Layout, tipografija
styles/ui.css            — HUD, dashboard, dugmad
styles/game.css           — Scanline/CRT flicker, battery "disanje" animacija
styles/theme.css           — Indigo/ćilibar paleta (sekcija concept.md #6)
styles/tutorial.css         — Dimmed/hidden panel klase za onboarding (R-3)
```

**44 fajla ukupno** (39 JS + 5 CSS) — u skladu sa sekcijom 0.

---

## 14. CONFIG.JS REFERENCE VREDNOSTI

```javascript
export const GAME_CONFIG = {
  // Off-grid (0-100 apstraktna skala)
  BASE_OFFGRID_CAPACITY_START: 55,
  WEATHER_BANDS: {
    oblacno:   { chance: 0.25, min: 0.45, max: 0.65 },
    prosecno:  { chance: 0.50, min: 0.80, max: 1.00 },
    suncano:   { chance: 0.25, min: 1.00, max: 1.15 },
  },

  // Alarm (eksponencijalni diminishing returns)
  ALARM_DECAY: 0.80,
  BASE_ALARM_CHANCE: { signal_drop: 0.22, feedback_glitch: 0.15, battery_critical: 0.18, platform_hiccup: 0.12, hardware_fault: 0.08 },
  MIN_ALARM_CHANCE:  { signal_drop: 0.04, feedback_glitch: 0.03, battery_critical: 0.05, platform_hiccup: 0.03, hardware_fault: 0.02 },
  ESCALATION: {
    signal_drop_unresolved:      { target: 'battery_critical', bonus: 0.15 },
    battery_critical_unresolved: { target: 'signal_drop',      bonus: 0.20 },
    feedback_glitch_missed:      { target: 'any_next',         bonus: 0.10 },
    second_unresolved_in_session:{ target: 'hardware_fault',   bonus: 0.25 },
  },

  // Platform krive
  IG_GROWTH_RATE: 0.06,
  TIKTOK_SPIKE_MULT: 1.8,
  TIKTOK_DECAY_NO_ALLOC: 0.12,
  YOUTUBE_GROWTH_RATE: 1.03,
  PLATFORM_COST_PER_UNIT: { ig: 1.0, tiktok: 1.15, youtube: 1.6 },

  // Gost reliability
  RELIABILITY_GAIN_STANDARD: 5,
  RELIABILITY_GAIN_STANDOUT: 9,
  RELIABILITY_LOSS_NO_SHOW: 15,
  NO_SHOW_ADJUST_PER_POINT: 0.006,

  // Prestige
  SEASON_LENGTH_EMISIJE: 8,
  PRESTIGE_MULTIPLIER_BASE: 1.12,
  LOYAL_CORE_CARRY: 0.15,

  // Chat sadržaj
  CHAT_NAME_POOL_SIZE: 18,
  CHAT_TEMPLATES_PER_TAG: 13, // avg
  CHAT_CONTEXT_TAGS: 4, // hype, pitanje, kritika, podrška
};
```

---

## 15. NAPOMENE ZA IMPL SESIJU (Jova)

1. **Off-grid meter dobija sopstveni fajl i sopstveni layout prostor** — nije opciono, nije "još jedna traka u render.js petlji" (sekcija 2 UI mandat).
2. **Alarm-escalation.js je zaseban fajl od alarm-generator.js** — generator bira ŠTA se desi, escalation prati ISTORIJU nerešenih alarma unutar emisije i modifikuje sledeći roll.
3. **Reliability-tracker.js state NE prolazi kroz prestige reset** — eksplicitno izuzet u `meta/prestige.js` reset logici (sekcija 7 tabela).
4. **Tutorial mode je jedan boolean state flag** (`state.tutorialMode`), čitan od `render.js`, `ui.js`, `offgrid-meter.js` — ne posebna grana koda, samo conditional dim/hide.
5. **Chat-templates.js nije hardkodovan niz stringova** — slot-filling funkcija, lako proširiva posle release-a (P3 patch kandidat prirodno).
6. **Replay-highlights.js NIJE video sistem** — tekstualno/ikonica strukturirani rezime, konzistentno sa "sve assets generisano u kodu" ograničenjem pipeline-a.
7. **Audio (Ceca)** — SFX brief već u concept.md sekciji 7 (alarm blip, chat tap po platformi, on-air→off-air, battery pulse); dashboard "disanje" treba vizuelni i audio sync ako moguće.
8. **Simulcast/Kluboslavija hook i CTA link** — oba ostaju `[PROVERI SA ŠEFOM]` u `content/brand-hooks.js`, ne hardkodovati konkretan link/datum dok šef ne potvrdi (Nega je ovo već flagovao kao dobru disciplinu, ne diram).
