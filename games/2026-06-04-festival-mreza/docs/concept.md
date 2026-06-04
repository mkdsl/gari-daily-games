# Concept: Festival Mreža

**Datum:** 2026-06-04  
**Agent:** Iskra Ivanović  
**Stage:** concept

---

## 1. Naziv igre

**Festival Mreža**  
*(podnaslov: "Izgradi scenu pre scene")*

---

## 2. Žanr

**Multi-layer Social Simulation / Strategy mini**  
Kombinacija: city-network building sim (makro) + real-time crowd event management (mikro) + reputation prestige meta-progresija

---

## 3. Premisa

Ti si promoter koji gradi Kluboslavija mrežu pre kulminacije na Avali 20. juna. Svaki grad na turneji — Niš, Sarajevo, Štrand, Guncati, Avala — je čvor u živoj socijalnoj mreži. Tvoj zadatak nije samo da "odradiš event" nego da razviješ organski buzz: regrutuješ lokalne koordinatore, aktiviraš zajednicu kroz micro-promo talase, i na kraju večeri direktno vodiš tok crowd-a na terenu (ko ide na koji stage, kako se energija prostora balansira, gde se formiraju bottleneck-ovi). Mreža je živa — svaki potez u jednom gradu rezonira u sledećem. Ako zanemariš Niš, Sarajevo starta hladno. Ako pregorite Štrand, Avala ima manjak goriva.

---

## 4. Core Gameplay Loop

**Makro sesija (između evenata — "sedmica planiranja"):**
- Rasporedi budžet između 5 gradova/čvorova na mapi turneje
- Angažuj lokalne koordinatore (svaki ima jedinstvene bonuse i slabosti — "Mileva iz Niša donosi underground scenu, ali košta duplo"; "Igor iz Sarajeva daje reach ali šalje pogrešnu publiku")
- Pusti promo talase (social post, flyer, radio spot) — svaki ima reach, cenu, i decay krivulju
- Prati "buzz metar" svakog grada — kumulativni efekat svih promo akcija te nedelje
- Odlučuj kojim redom idu gradovi na turneji (redosled utiče na carry-over efekte)

**Mikro sesija (sama večer eventa — "noć"):**
- Real-time, 3–5 minutni "event window"
- Crowd stižu u talasima — svaki talas ima mood, energiju, kapacitet
- Upravljaj protocima: rotiraj crowd između zona (dance floor, bar area, chill zone, stage front)
- Reaguj na incidente: pregusto → bottleneck → negativna energija; preprazno → hladan floor
- DJ set ima arc — gradnja, peak, outro — ti biraš tempo i intenzitet u svakom momentu
- Cilj: završiti noć sa "crowd satisfaction" iznad threshold-a i "energy debt" ispod max-a

**Carry-over između evenata:**
- Buzz iz prethodnog grada dolazi kao startna energija u sledećem (buzz × 0.7 carry-over faktor)
- Koordinatori naučeni u jednom gradu prate te na turneji (retencija 60% bez bonusa, 90% sa)
- Reputacija iz Niša/Sarajeva/Štranda direktno diktira Avala kapacitet (veći rep = veći venue tier)

---

## 5. Hook — Zašto bi neko igrao 15+ minuta?

**Tenzija:** Resursi su uvek prekratki. Nikad ne možeš pokriti sve gradove jednako — moraš birati gde investiraš. Svaki izbor se oseća zbog carry-over sistema. Pogreška u Sarajevu znači da dolaziš na Avalu sa polupraznim "buzz rezervoarom".

**Micro loop adiktivnost:** Real-time noć eventa je intenzivna i kratka (3–5 min) ali emotivno gustа. Gledaš crowd da "diše" ili da "ugasne". Svaki put se desi nešto drugačije jer crowd talasi su proceduralni.

**Narrative pull:** Igra ima 5 "karakter-čvorova" (koordinatori) koji imaju micro-dijalog. Otkrivaju šta se zaista dešava iza scene Kluboslavije — insajderski humor, reference na stvarne gradove, Pera Period aforizmi kao loading screen citat.

**Prestige ambicija:** Posle prvog prolaza kroz celu turu, otključavaš "Avala Grandmaster" mod — isti izazov ali sa dvostrukom složenošću crowd-a i novim koordinatorima.

---

## 6. Multi-layer arhitektura

### Macro Layer — Turneja Planiranje (nedelja)
- **Resursi:** Budžet (EUR), Energija tima, Reputacija (per grad), Veze (coordinator network)
- **Akcije:** Investiraj u promo, zaposli koordinatora, planira redosled evenata, kupi "insurance" (plan B za loš event)
- **Vremenski horizont:** 5 evenata = 5 makro rundi pre Avale
- **Output prema mikro:** Buzz startni bonus, koordinator bonusi, venue tier (mali/srednji/veliki)

### Micro Layer — Noć Eventa (real-time 3-5 min)
- **Entiteti:** Crowd grupe (svaka ima mood score, energiju, kapacitet), Zones (dance floor, chill, bar, stage front), DJ set arc
- **Kontrole:** Zona routing (drag crowd prema zoni), Tempo slider (DJ BPM direktno utiče na crowd speed i energy decay), Special actions (spotlight event, free round, security call)
- **Output prema meta:** Satisfaction score → buzz carry-over; incident count → reputacija penalty/bonus
- **Fizika:** Crowd se akumulira, cirkuliše, greje ili hladi — sve animirano kroz particle sistem na Canvas-u

### Meta Progresija — Karijera Promotera
- **Karijer tier:** Rookie → Regional → Balkanski Fenomen → Legenda Turneje
- **Permanentni bonusi:** Svaka završena turneja daje permanent stat upgrade (budžet multiplikator, coordinator loyalty bonus, crowd capacity bonus)
- **Prestige reset:** "Avala run" — kompletiraš turneju, prestige-uješ se, naredna turneja starta sa × multiplier ali harder crowd procedurals
- **Achievements:** "Niš bez incidenta", "Svi koordinatori na Avali", "Buzz 95+ u svim gradovima", "Perfektna noć" (0 incidents, max satisfaction)
- **Unlockables:** Nova gradovi (Zagreb, Ljubljana posle prestige-a), novi koordinatori sa unikatnim stilovima, vizuelni skin za venue

---

## 7. Vizuelna estetika

**Paleta:**  
- Osnova: duboki noćni plavi (#0d1b2e) i crni (#08080f)  
- Akcent 1: električni ljubičasto-roze (#c44dff) — za Kluboslavija brend  
- Akcent 2: jantarno-žuta (#ffb830) — za energiju i buzz metre  
- Akcent 3: led-plavi (#4df5ff) — za crowd particls i mreža linije  
- Bela (#f0f0f5) za tekst  
- Kada je "vrele" noći: toplije tonove push (+15 saturation na jantaru)

**Stil:**  
- Mapa turneje kao "noćni network graf" — gradovi su čvorovi, putevi su svetleće linije  
- Venue noću: odozgo (top-down), stylizovan, semi-pixel art (Pera Piksel idiom)  
- Crowd: particle sistem — male svetleće tačke koje formiraju "plime" i "odlive"  
- UI: glass-morphism elementi na tamnoj pozadini, minimalni ali informativan  
- Koordinator portreti: CSS pixel art, 32×32 style, svaki sa karakternim bespotrebnom detalom

**Mood:** "Noć pre Avale" — uzbuđenje, urbana toplina, specifična nostalgija Balkana noću

---

## 8. Audio mood

**Žanr:** Electronic/techno ambient sa ex-Yu akordskim tonalitetom  
**Makro faza:** Blagi ambient dron, low-BPM pulsiranje, "planiranje" osećaj — ne preterano  
**Mikro faza (event noć):** Adaptive muzika koja prati DJ arc — gradi se od 90 BPM prema 138 BPM dok event napreduje, peak faza ima puniji bass  
**Crowd SFX:** Proceduralni šumovi crowd-a (murmur → cheer → roar), bottle clinks, ventilator hum  
**UI SFX:** Satisfying klik za routing akcije, soft chime za coordinator angažman, alert za incident  
**Sve generisano:** Web Audio API, bez .wav fajlova — Ceca gradi sve od oscillatora i noise generatora

---

## 9. Win Condition

**Per event win:** Crowd satisfaction ≥ 70% + Energy debt ≤ max na kraju noći  
**Per turneja win:** Reach Avala sa buzz ≥ 60 u rezervoaru + reputacija ≥ "Balkanski Fenomen"  
**Grand win:** Završi Avala event sa satisfaction ≥ 90% i bez CRITICAL incidenata  
**Prestige unlock:** Sve 5 gradova završene sa satisfaction ≥ 80% → "Legenda Turneje" tier + prestige reset dostupan

**Lose states:**  
- Budžet bankrot u makro fazi → Game Over, restart od poslednjeg save checkpoint-a  
- Incident severity RED (stampedo, prekid struje, kapacitet breach) u mikro fazi → event cancelled, težak rep penalty  
- Avala buzz < 20 na start → Avala event tier downgrade na "micro event" (moralno poražavajuće, igra komentariše)

---

## 10. brand_serves

**Kluboslavija — PRIMARNA:**
- Direktan edukativni hook: igrač implicitno uči logiku turneje, zašto gradovi idu tim redosledom, šta je crowd management
- Buzz builder 16 dana pre Avale: svako ko igra oseća se deo "insajderske priče" — "znam šta ide u ovaj event"
- Shareable moment: po završetku Avala eventa, igra generiše personalizovanu "Mreža karta" (screenshot koji pokazuje tvoju turu, tvojim stilom) → direktan share intent sa #Kluboslavija2026 i #Avala0620
- Content hook za social: "Koliko si dobar festival promoter? Provjeri se u Festival Mreža" — CTA za Avala event tickets

**MKDSLend — SEKUNDARNA:**
- Koordinatori uključuju MKDSLend tim karaktere (prepoznatljivi ako pratiš brend)
- Guncati čvor na turneji mapi je grand finale (posle Avale, unlockable) — seeding za Q3 Guncati Sezona kampanju
- Ukupna "Zabavni radni park" estetika komunicira sa MKDSLend brand identity kroz venue dizajn

---

## 11. Targetirana dužina sesije

- **Jedna makro runda + jedna noć eventa:** 8–12 minuta  
- **Puna turneja (5 gradova):** 45–60 minuta first playthrough  
- **Prestige run:** 35–45 minuta (igrač je bržiи, sistem je tezi)  
- **Retention target:** 3+ prestige runovi = 2–3 sata total engagement  
- **Casual entry point:** Može se pauzirati između makro rundi; auto-save posle svakog eventa

---

## 12. Prestige / Replay Hook

**Prestige mehanika:**  
Po završetku kompletne turneje igrač može pokrenuti "Novi Sezon" — svi resursi se resetuju, ali ostaje:
- Karijer tier (permanentni multiplier na budžet i rep)
- Coordinator "alumni" lista — 2 koordinatora iz prošle turneje mogu biti ponovo angažovana po 50% ceni
- "Veteran insights" — 3 pasivna bona koja birates (npr. "+10% buzz decay resistance", "+15% crowd routing speed", "coordinator loyalty nikad pada ispod 40%")

**Proceduralni replay:**  
Crowd talasi su proceduralno generisani (seed baziran na datumu + karijer tier). Svaka noć je drugačija čak i na istim gradovima. Koordinator personality rolls variraju. Nema dva identična run-a.

**Challenge modes (unlocked posle prvog prestige-a):**  
- "Last Minute" — budžet je 40% manji, isti ciljevi  
- "Sve na Avalu" — skip sva 4 prethodna eventa, ali stignješ na Avalu sa 0 buzz rezervoarom  
- "Koordinator Haos" — svi koordinatori imaju nasumične, nepoznate statove do prve noći

---

## Napomena za Mile Mehaniku

Ova igra zahteva **eksponencijalne krive** na sledećim elementima:
- Buzz decay: logaritamski (brz decay na poretku, spor na visokim vrednostima — prestige mehanika ga pojačava)
- Coordinator cost: eksponencijalni po loyalty tieru (Tier 1: 100 EUR → Tier 5: 1600 EUR)
- Crowd capacity scaling: kvadratni po venue tieru (Tier 1: 200 crowd → Tier 3: 800 crowd → Tier 5: 3200)
- Reputation growth: stepwise po Tier sa plateaus (zahteva "achievement threshold" da pređe u sledeći tier)
- Prestige multiplier: 1.0 → 1.25 → 1.56 → 1.95 → 2.44 (×1.25 per prestige)

Minimum **28 upgrades** u makro fazi (coordinator upgrades + venue upgrades + promo upgrades + meta career upgrades).
