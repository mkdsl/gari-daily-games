# Premortem: Kanal — Odbrana Dunava

**Analitičar:** Nemanja "Nega" Negovanović
**Datum:** 2026-04-22
**Metoda:** Gary Klein Premortem

---

## 1. STEELMANNING — Razumijem ideju bolje od autora

Tower defense je žanr sa dokazanom petljom: postavi → gledaj → optimizuj → ponovi. Kanal to ne komplikuje, nego dodaje jednu oštru modifikaciju — loot koji tone. Ovo nije kozmetika. To je mehanički pritisak koji sprečava da igrač postane pasivan posmatrač dok kule rade posao. Rezultat: svaki talas ima dve paralelne brige (odbrambena linija + ekonomija skupljanja), što je znatno više angažmana nego standardni TD.

Estetika je mudro odabrana: minimalistički canvas pixel art smanjuje workload renderinga, a ratna tema Dunava nudi atmosferu bez narativnih troškova. Paleta od 4 boje je disciplinovana i implementabilna. Audio je generisan proceduralnim putem — nema .mp3 fajlova koji bi zahtevali storage.

Beskonačan mod sa score-om eliminiše problem "dizajniranja kraja igre" — najteži design problem za TD u jednoj sesiji.

**Ovo je solidan okvir. Sada gde puca.**

---

## 2. RASTAVLJANJE — Pretpostavke i komponente

Koncept pretpostavlja da sledeće funkcioniše:

| Komponenta | Pretpostavka |
|---|---|
| Grid 9×5 | Placement radi click-to-cell mapiranjem, bez drag&drop |
| Enemy AI | Fiksni koridori — ne traži put (pathfinding), ide ravno |
| Tower range + targeting | AABB ili circle-range query svakog frame-a za sve kule |
| Loot mehanika | Timed entity koja nestaje posle N sekundi, klikabilna |
| Wave manager | Spawn timer, enemy queue, boss svakih 10 talasa |
| Budget/Economy | Zlatni counter, cene kula, upgrade logika |
| HP sistem | Vrednost koja pada kad enemy prođe levu ivicu |
| Specijal aktivacija | Ručni trigger po kuli, cooldown sistem |
| Sinusoidna animacija vode | Canvas overlay ili CSS, svakog frame-a |
| Particle eksplozije | Pool kvadratića sa velocity + fade |
| Web Audio ambijent | Drone oscillator + noise buffer + alarm |
| Unlock svakih 5 talasa | State tracker, UI notifikacija |

To je **12 odvojenih sistema** koje Jova treba da implementira, integriše i debuguje u jednoj sesiji.

---

## 3. NAPAD — Šta može da pukne

### SHOWSTOPPER rizici

**[HIGH] Loot timing + touch kolizija je dupli UI problem**
Loot entitet tone za recimo 3 sekunde. Na mobilnom, igrač mora da tapne tačno na piksel-kvadrat koji se potencijalno kreće po kanvasu, dok istovremeno tower placement reaguje na isti tap. Bez pažljivog razlikovanja tap targeta (loot zone vs. grid cell), igrač će ili slučajno postavljati kule ili propuštati loot jer tap ne registruje entitet. Ovo zahteva poseban hit-detection layer koji nije trivijalan.

**Procena:** Bez eksplicitnog razdvajanja input faza (priprema vs. talas), touch input će biti frustrirajući na mobilnom.

**[HIGH] 12 sistema za 1 sesiju — scope creep je zapečaćen**
TD igre izgledaju jednostavno ali implementacioni teret je velik: enemy spawn timing, range query po frame-u za svaku kulu, animirani loot entiteti, boss HP bar, unlock sistem, particle pool, audio sistem. Svaki od ovih delova ima edge case-ove (šta ako se kula postavi na ćeliju gde prolazi enemy? šta ako igrač klikne na kulu tokom talasa?). Rizik je da Jova provede 70% sesije na jednom sistemu (npr. targeting logika) i ostane bez vremena za kraj.

**[HIGH] Grid placement interakcija tokom talasa**
Koncept kaže da se priprema dešava između talasa (10 sekundi), ali specijal se može aktivirati tokom talasa. Ako igrač može pauzirati, to znači UI state machine: play / paused / prep. Ako ne može da pauzira na mobilnom, hitbox za klik na kulu tokom žive akcije je UX problem. Nedovoljno specificirano u konceptu.

---

### MEDIUM rizici

**[MEDIUM] Sinusoidna animacija vode — skupa za ništa**
Canvas overlay koji animira vodu svakog frame-a sinusom čita/piše piksele ili iscrtava poluprozirne shape. Ako nije optimizovano (offscreen canvas, reduce redraws), može da pojede frame budget i ostavi igru na 30fps ili manje, posebno na slabijim telefonima. Ovo je čisto kozmetičko ali sa direktnim uticajem na gameplay feel. Predlog: statična voda sa CSS pseudo-animacijom umesto canvas-a.

**[MEDIUM] Boss talas svakih 10 — special case u wave manageru**
Boss = jedan enemy sa puno HP + poseban vizual + bonus zlato. To nije samo "veći broj" — zahteva posebnu UI (HP bar za bossa), poseban spawn event, posebnu nagradu. Sve se to grana iz wave managera. Svaki poseban slučaj u wave manageru povećava bug surface.

**[MEDIUM] Unlock svakih 5 talasa — state tracking + UI**
Tri nove kule se otključavaju. To znači: state koji prati koji talasi su viđeni, UI notifikacija, promena dostupnog inventara. Nije showstopper ali je još jedna stvar koju Jova mora da drži u glavi.

**[MEDIUM] "10 sekundi priprema" — timer pod pritiskom**
Fiksnih 10 sekundi za placement može biti prekratko za novog igrača koji još uči šta kule rade. Nema tutoriala, nema pauze. Igrač koji ne razume sistem neće uspeti da odigra smisleno tih prvih par talasa, pa će odustati. Trebalo bi da bude bar opcija za extend ili pausable prep fazu.

---

### LOW rizici

**[LOW] Web Audio kompatibilnost**
Chrome, Firefox, Safari svi podržavaju AudioContext. Edge case: Safari iOS zahteva user interaction pre AudioContext.resume(). Ovo je rešivo sa jednom linijom koda ali se često zaboravi.

**[LOW] Score multiplikator nedovoljno definisan**
"Score = uništeni × multiplikator talasa" — koji multiplikator? Linearan (talas broj)? Eksponencijalan? Mile će ovo rešiti u GDD-u, ali ako nije jasno, implementacija može biti flat i nezanimljiva.

**[LOW] "Vignette" i "krug svetla oko kule"**
Oba su estetski detalji koji koštaju implementaciono vreme. Canvas radial gradient za vinjetu, krug svetla po svakoj kuli — ne doprinose mehanici. Mogu se izostaviti bez gubitka igrivosti.

**[LOW] Tenkoveti pored čamaca**
Koncept pominje i "brodove i tenkovete" — to su dva tipa neprijatelja odmah. Različite brzine? Različiti HP? Različiti loot? Ovo se lako skala van kontrole ako Mile u GDD-u ne stavi cap.

---

## 4. RANGIRANJE RIZIKA — Sumirano

| Rizik | Nivo | Showstopper? |
|---|---|---|
| Touch input kolizija loot vs. grid | HIGH | DA — utiče na core loop na mobilnom |
| Scope (12 sistema u 1 sesiji) | HIGH | DA — može ostaviti igru nedovršenom |
| State machine play/prep/pause | HIGH | DA — nejasna specifikacija vodi bugove |
| Animacija vode (canvas perf) | MEDIUM | NE — rešivo simplifikacijom |
| Boss specijal case u wave manager-u | MEDIUM | NE — može biti odložen ili simplifikovan |
| Unlock sistem + UI | MEDIUM | NE — može biti stub |
| Prep timer od 10 sec | MEDIUM | NE — UX problem, ne crash |
| Web Audio iOS | LOW | NE — jedna linija fixa |
| Score formula | LOW | NE — Mile definiše |
| Vignette + svetlo | LOW | NE — izbaci iz scope-a |
| Višestruki tipovi neprijatelja | LOW | NE — zahteva cap u GDD-u |

---

## 5. PREDLOZI — Alternative za ozbiljne rizike

### Za loot vs. grid touch konflikt:
Razdvoji input faze eksplicitno: **tokom talasa**, tap na grid ćeliju ništa ne radi (ili aktivira specijal samo ako tapneš na kulu). Loot entiteti su poseban layer iznad grida sa većim hit radiusom (bar 40px na mobilnom). Između talasa, loot layer se uklanja i grid postaje aktivan za placement.

### Za scope problem (12 sistema):
Mile i Jova moraju da definišu **MVP core** — šta je igra bez koje ne funkcioniše, a šta je bonus. Predlog hijerarhije:

- **Mora biti u MVP:** Grid placement, jedan tip kule (top), enemy spawn po koridoru, HP oduzimanje, loot spawn + pickup, game over ekran.
- **Može biti stub (Level 2):** Upgrade kula, specijal aktivacija, unlock sistem, boss talas.
- **Može biti izostavljen:** Višestruki tipovi neprijatelja, voda animacija, vignette, svetlo kula.

Ako Jova implementuje samo MVP, igra je igriva. Ostalo se dodaje ako ostane vremena.

### Za play/prep state machine:
Eksplicitno definiši u GDD-u: igra ima **dva moda** (PREP i WAVE). U PREP modu: grid je klikabilan, timer teče, nema neprijatelja. U WAVE modu: grid je zaključan (nije klikabilan), specijal dugmad su aktivan, loot je klikabilan. Pauza je opcija samo u PREP modu. Ovo eliminiše ambiguitet.

### Za animaciju vode:
Statična tamno-plava pozadina sa jednim CSS box-shadow ili gradient overlay umesto canvas animacije. Štedi frame budget, izgleda dovoljno dobro.

---

## 6. ZAKLJUČAK

> **Drži uz korekcije.**

Koncept je mehanički zvučan i žanrovski pouzdan. Tower defense sa loot urgency je dobar hook i ne zahteva invenciju — zahteva egzekuciju.

Ali sa 12 sistema koja treba implementirati i nejasnom specifikacijom state machine-a, rizik od nedovršene igre je realan.

### Obavezne korekcije pre implementacije:

1. **Mile mora u GDD-u da definiše MVP tier** — šta je core, šta je bonus, šta se ne dotiče.
2. **Input faze moraju biti eksplicitno razdvojene** — PREP mod vs. WAVE mod, sa jasnim pravilima šta je klikabilno kada.
3. **Loot hit area mora biti oversized za mobilni** — ne piksel-tačan, bar 40×40px touch target.
4. **Animacija vode izbaciti iz MVP-a** — statična pozadina je prihvatljiva, canvas perf nije garantovan.
5. **Višestruki tipovi neprijatelja ograničiti na max 2 u v1** — različite brzine, isti loot, bez posebnih mehanika.

Ako ove tačke uđu u GDD, Jova ima jasnu mapu i igra ima realnu šansu da bude igriva do kraja sesije.
