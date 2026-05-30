# Akva-Sklop — Concept

## Premisa i hook

Ti si **Brana**, menadžer voda na Guncati imanju — permakulturnoj farmi u Srbiji koja radi na principima gravitacionog toka, biofiltacije i zatvorenih vodnih krugova. Imaš jedan jedini izvor: **0.4 l/s**. Imaš **12 nedelja** da uspostaviš ekosistem koji se sam-reguliše pre nego što investitori stignu u jesen.

Akva-Sklop nije igra o građenju. To je igra o **balansiranju živog sistema** — svaka drenaža koju postaviš oduzima vodu od jezera, svaki biofilter košta protok ali čisti pH, svaka patka je pokazatelj zdravlja vode. Greška u nedelji 3 može da ubije ribe u nedelji 9.

Inspiracija: Mini Metro estetika, ali umesto linija metro-a — **vodeni tokovi koji nose život ili smrt**.

---

## Core gameplay loop (macro + micro + meta)

### Macro layer — Planning Phase (po nedelji)

Na početku svake od 12 nedelja igrač ulazi u **Planning Phase** sa **3 akciona poena**. Mapa je izometrijski 2.5D grid sa trenutnim stanjem ekosistema.

Akcije koje troše poene:
- **Postavi tile** (drenaža, biofilter, jezero, izvor-tap): 1 poen
- **Upgrade tile** (npr. biofilter → advanced biofilter): 1 poen
- **Ukloni tile**: 1 poen
- **Premesti životinju** (patku iz jezera A u jezero B): 1 poen

Igrač vidi **live preview protoka** dok planira — ako dodaje tile koji bi prekoračio 0.4 l/s, UI signalizira crvenim i blokira simulaciju. Kada potroši poene ili klikne "Simuliraj nedelju", prelazi u Micro layer.

Ključni tile tipovi:
- **Izvor** (fiksan, 0.4 l/s ukupno, ne može se ukloniti)
- **Drenaža** (usmerava tok, troši 0.05 l/s kapaciteta)
- **Biofilter** (poboljšava pH za +0.3, ali troši 0.08 l/s)
- **Jezero** (akumulira vodu, domaćin životinja — 3 jezera na različitim visinama)
- **Pump tile** (dozvoljava tok uzbrdo, ali troši duplo — 0.16 l/s, skup)

### Micro layer — Simulation Phase

Po kliku "Simuliraj", igrač gleda **4 sekunde ubrzane animacije** jedne nedelje:

- Voda teče gravitaciono od višeg ka nižem jezeru — vizualizovano kao animirani čestični tok
- **Patke** plivaju, hranjenje generira organsku materiju → smanjuje pH
- **Ribe** reaguju na pH: ako pH padne ispod 6.5 ili poraste iznad 8.5, zdrav(lje) pada
- Na kraju simulacije: ekosistem dobija **nedeljni score** (0–100)
- Random event može da se okine (vidi Replay hook)

Igrač može da **pauzira** simulaciju i vidi tooltip state svakog tile-a, ali **ne može da dodaje/menja tile** dok simulacija teče. Ovo je namerno — prisilja planiranje, ne reaktivno "gašenje požara".

### Meta layer — Ecosystem Memory (localStorage)

Između svih run-ova, igrač akumulira **"Guncati Knows" kartice** — stvarni, verifikovani fakti sa imanja koje je Brana potvrdio:

- "Patke filtriraju do 2l/h od organskih čestica"
- "Biofilter od šljunka povećava pH za 0.2–0.4 u idealnim uslovima"
- "Gravitacioni pad od 1m na 10m daje dovoljan pritisak za pasivni tok"
- "Suša smanjuje izvorni protok i do 60% u avgustu"

Kartice se otključavaju dostizanjem threshold-a (npr. "prvi put kad ribe prežive 12 nedelja"). One nisu samo flavor — mogu da se **prikače** na HUD kao podsetnik tokom sledeće igre.

**3+ completed runs** otključavaju **"Faza C vizualizacija" mode** — umesto jednostavnog grid-a, igrač vidi Guncati mapu iz ptičije perspektive sa pravim imenima parcela i realnim kotama terena. Ovo je direktna edu-vrednost za posetioce imanja.

---

## Vizuelna estetika i audio mood

**Grid:** Izometrijski 2.5D, 24px tile-ovi, implementirano kao CSS box tiles sa izometrijskom transformacijom (ne sprite-ovi, ne WebGL). Warmth dolazi iz boja i sena, ne iz pixel kompleksnosti.

**Paleta:**
- Šuma/tlo: `#1a3a1a` (tamno zelena), `#8B5E3C` (zemlja)
- Voda: `#4ecdc4` (teal), animirano sa opacity pulse na 0.6–1.0
- Patke: `#ff6b35` (narandžaste) — jedini "topli" element, vizualni fokus
- Ribe: `#a8d8ea` (bledo plava) — suptilne, vidljive samo kad je jezero zdravo
- HUD: bela površina, `#ffffff` sa 90% opacity, monospace font za live vrednosti

**Audio mood (mood board, nije obavezan za MVP):**
- Ambient zvuk potoka — stalan, lagano se pojačava kad ekosistem raste
- Patke: kratki quack event kad se nedelja završi pozitivno
- Alarm: diskretni hum kad pH izlazi iz opsega

**HUD elementi (gornji panel):**
- Trenutni protok: `▸ 0.31 / 0.40 l/s`
- Prosečni pH jezera: `pH 7.2`
- Ecosystem Score: `◉ 74%`
- Nedelja: `Nedelja 7 / 12`

---

## Win / lose uslovi

**Win:** Ecosystem Score ≥ 80% na kraju nedelje 12. Score se računa kao prosek nedeljnih ocena: protok balans (40%), pH stabilnost (35%), biodiverzitet — broj živih životinja (25%).

**Lose — trenutni (game over):**
- **Ribe uginu:** pH ostane van opsega [6.5, 8.5] dva uzastopna simulaciona koraka
- **Izvor presuši:** ukupna potrošnja tile-ova prelazi 0.4 l/s (sistem blokira u planning, ali edge case postoji kod random eventa — suša smanjuje izvorni kapacitet na 0.2 l/s privremeno)

**Soft fail (nastavi ali penalizovan):**
- Nedelja bez pataka u jezeru → -10 na nedeljnom score-u
- Biofilter zatvoren (nema protoka) → pH počinje da pada naredne nedelje

---

## Replay / retention hook

**Scoring sistem:** Svaka nedelja daje nedeljni score koji se sabira u **Total Run Score** (max 1200 = 12 × 100). Prikazuje se na kraju kao "Guncati Eco Report" — deli se kao screenshot.

**Random event sistem** (okida se na kraju Planning Phase, pre simulacije):
- `SUŠA` (15% šansa nedelje 4–8): izvorni kapacitet pada na 0.20 l/s ovu nedelju
- `PATKA JATO` (10% šansa): +8 pataka ulazi u random jezero — povećava organsku materiju
- `ŠUMSKA KONTAMINACIJA` (8% šansa nedelje 6–10): pH jednog jezera pada za -1.2 sledeće simulacije

**3 difficulty nivoa:**
- **Faza 0 (Tutorial):** Bez random eventa, pH mnogo sporije fluktuira, 5 akcionih poena/nedelja
- **Faza A (Standardno):** Standardni parametri, 3 akciona poena, puni event sistem
- **Faza B (Komercijalno):** 2× životinja od starta, striktniji pH opseg [7.0, 8.0], samo 2 akciona poena

**Meta progression:** "Guncati Knows" kartice su permanentne između run-ova. Igrač koji dođe do Faza B već razume sistem — Faza B je izazov za experianced igrače, ne za uvod.

---

## brand_serves: ["guncati"]

**Konkretno kako igra hrani Guncati brend i projekat:**

1. **Vizualizuje realnu Faza 0 infrastrukturu:** Parametri igre (0.4 l/s, 3 jezera, gravitacioni tok) su direktno preuzeti iz stvarnog plana vodnog sistema na Guncati imanju. Igrač koji igra 3 puta razume logiku sistema bolje od čitanja PDF-a.

2. **Embed-uje domain znanje koje Brana može da verifikuje:** Svaka "Guncati Knows" kartica prolazi kroz Branin review pre release-a. Igra postaje **živi glosari** Guncati metoda.

3. **Lead magnet za guncati.rs:** CTA na kraju svakog run-a: "Napravio sam stabilne 3 ekosisteme. Šta Brana radi u stvarnosti?" → link na Guncati blog post ili newsletter signup. Konverzija je prirodna jer igrač već razume problem.

4. **Edukativni asset za posetioce imanja:** QR kod na imanju → igra na telefonu → 5 minuta razumevanja vodnog sistema pre vođene ture. Nega i Brana mogu da koriste igru kao uvod u razgovor o permakulturnm principima.

5. **Investitor narativ:** "12 nedelja do stabilnog ekosistema" direktno preslikava stvarni vremenski okvir Guncati Faza 0 projekta. Igra je pitching tool koji ne liči na pitch.

---

## Targetirana dužina sesije

- **Jedna igra (12 nedelja):** 8–12 minuta
- **Faza 0 tutorial:** 4–5 minuta
- **Optimalna sesija:** 2 run-a back-to-back (drugi run sa novim znanjem) = 18–22 minuta
- **Retention event:** "Guncati Knows" kartica otključana → motiviše treći run (Faza C unlock)

Igra je **daily game format** — jedna igra dnevno je prirodan ritam. Calendar integracija (GDG platforma) funkcioniše ovde jer se unlock stanje cuva u localStorage.

---

## Rizici i otvorena pitanja za Negu

1. **Protok balans tuning:** 0.4 l/s kao hard cap zahteva pažljivo balansiranje tile troškova. Ako je previše lako da se ostane ispod limita, nema tenzije. Predlog: playtesting sa 5 različitih tile layout-a pre finalnog balansa. **Otvoren — needs Nega review.**

2. **Isometric CSS tile feasibility:** 2.5D izometrija u čistom CSS-u je izvodljiva za statičan grid, ali animirani čestični tok vode može zahtevati Canvas fallback. **Risk: Medium. Needs Mile procenu pre dev starta.**

3. **Random event timing:** Suša u nedelji 4–8 je "fair" jer igrač ima 3–4 nedelje da izgradi buffer. Ako se okine u nedelji 2 → instant lose je frustrirajuć. Predlog: event blackout prvih 3 nedelje u Fazi A, prvih 2 u Fazi B. **Decision needed.**

4. **"Guncati Knows" kartica verifikacija:** Ko verifikuje fakta? Brana mora da pregleda minimum 12 kartica (jednu po nedelji otključavanja) pre release-a. Vremenski obaveza = ~1h review sesija. **Potrebna koordinacija sa Branom.**

5. **Faza C vizualizacija scope:** "Prava Guncati mapa" je ambiciozna. Da li koristimo stvarne GPS koordinate + real terrain data, ili stilizovanu ilustraciju imanja? Razlika u dev vremenu je značajna. **Scope decision za Negu.**

6. **Lokalizacija:** Igra je na srpskom (narativ, UI). "Guncati Knows" kartice su na srpskom. Da li treba engleski toggle za međunarodne posetioce imanja? **Nije blocker za MVP, ali pitanje za Q3.**
