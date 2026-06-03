# Premortem — Sarajevo ili Smrt

**Datum analize:** 2026-06-03
**Analitičar:** Nega Negovanović
**Stage:** Concept review (pre impl)

---

## 1. Verdict

**drži uz korekcije**

Premisa je autentična i brand-utility sprega sa Kluboslavijom je stvarna, ali 4-žanrna arhitektura (idle + manager + sim + micro-game) unutar GDG jednodnevnog pipeline-a garantuje nedovršenu igru ako se scope ne reže pre impl stage-a.

---

## 2. Showstopper rizici (CRITICAL)

### CRITICAL-01: Micro-game layer je nedovršen ili broken na mobile

**Opis:** "Tapkanje u ritmu da uhvatiš vibe peak" zahteva precizno audio-visual sync, BPM detekciju ili bar generisani ritam signal, i touch latency < 50ms na mobile. Web Audio API timing je notorno nestabilan na iOS Safari (AudioContext resume, latency jitter). Crowd meter 0–100 mora da reaguje na tap u realnom vremenu — ako lag postoji, micro-game ne funkcioniše.

**Zašto showstopper:** Micro-game je jedini aktivan gameplay moment (ostalo su menije i planiranje). Ako ne radi ili se oseća glitchy, igra pada odmah u prvoj noćnoj sesiji — pre 5. minute, pre nego što igrač vidi upgrade tree.

**Mitigacija:** Eliminisati audio-tap sync. Zameniti sa **vizuelnim talasom** (CSS animacija bez audio sync-a) + tapping koji meri konzistentnost, ne tačnost na BPM. Alternativa: zameniti micro-game sa **slider** mehanikom (vuci Crowd meter navigacijom između peak i valley zona) — implementabilno bez audio dependency.

---

### CRITICAL-02: Macro layer planiranje bez feedback loop-a = "upravljanje tabelom"

**Opis:** 7 noći, 4 kvarta, booking, resource carry-over — ovo je menadžment gameplay. Ako vizualni feedback izostane (animacije tranzicija, mapa Sarajeva, kvartovski vibe indikator), igrač gleda statičnu tabelu sa brojevima.

**Zašto showstopper:** Manager-sim bez mape ili vizuelne reprezentacije prostora nema "sense of place." Sarajevo specifičnost (jedini diferencirajući element) postaje copy u tabelici, ne doživljaj.

**Mitigacija:** MUST HAVE je CSS pixel art mapa 4 kvarta sa vizuelnim stanjem (neon lit = aktivan, tamno = locked, pulsing = dostupna noć). Ovo je 1 CSS fajl i 1 render modul — implementabilno. Bez mape, Macro layer je stub.

---

### CRITICAL-03: 4 žanra = nijedan do kraja u impl stage-u

**Opis:** Idle + Incremental + Manager-Sim + Micro-game = 4 odvojena sistema koja moraju sva da rade. Impl stage je jedna sesija (~700K tokena).

**Zašto showstopper:** GDG istorija pokazuje da se u takvim uslovima sistemi "wire-uju ali ne balansuju" — idle timer ne pali, prestige ne resetuje pravo, Crowd meter stuck.

**Mitigacija:** Scope cuts — vidi Sekcija 6.

---

## 3. Ozbiljni rizici (HIGH)

### HIGH-01: Prestige ekonomija bez playtestovanog balance-a

4 prestige nivoa + DK valuta + 5 upgrade grana × 4-5 nivo = ~20 upgrada + Crowd multiplier stacking. Svaka eksponencijalna kriva zahteva balance. Bez seed vrednosti, igra je ili trivijalno laka ili wall-gating.

**Mitigacija:** Mile mora dati konkretne formule i breakeven minute-counts u gdd.md.

---

### HIGH-02: "Sarajevo Know-how" upgrade grana je vague

"Snižava smrt-risk" — koji smrt-risk? Concept ne definiše fail mehaniku. Ako nema konkretne fail state, ova grana nema svrhu, a sa njom puca i naziv ("ili Smrt").

**Mitigacija:** Definisati jedan jasan fail state (pr. "Crowd meter < 20 na kraju noći = bad rep event = -15% prihoda sledeće noći"). Upgrade E tada jasno snižava tu šansu.

---

### HIGH-03: Audio mahala theme-ovi vs. Web Audio API kapacitet

"Synthwave/balkanski fusion" kao generated Web Audio je ambiciozan. Ceca mora da dobije konkretne parametre, ne "balkanski fusion" kao brief.

**Mitigacija:** Specificirati: Baščaršija = minor scala + reverb heavy drone; Marijin Dvor = 4/4 kick + saw wave; Grbavica = hip-hop beat + distorted bass; Bjelašnica = ambient pad.

---

### HIGH-04: Share kartica viralni multiplikator — zavisnost od html2canvas

html2canvas je poznat po glitchevima na Canvas+DOM mix-u. Share kartica je Brend D upgrade i jedini viral hook — ako ne radi, ceo viralni potencijal puca.

**Mitigacija:** Renderovati share karticu isključivo na offscreen Canvas, ne snimati DOM.

---

## 4. Niski rizici (LOW)

### LOW-01: Bjelašnica tematski udaljen od DJ turneje

"Planinski resort" confuse-uje igrača. Predlog: definisati kao "festival na planini" ili odložiti za Prestige 2 unlock.

### LOW-02: "DK" skraćenica van Balkana

Funkcionalan i flavor-an, ali DK kao skraćenica može zbuniti. Pun naziv u UI-u, DK samo u kodu.

### LOW-03: Upgrade grana C vs. E overlap u percepicji igrača

C daje prihod direktno, E snižava risk. Bez narrative razlike, E se ignoriše. Needs flavor motivaciju.

### LOW-04: Avala Headliner timing window uzak

Igra izlazi 2026-06-03, event 2026-06-20. Casual igrači ne dostignu prestige 3 za 17 dana. Avala CTA mora biti vidljiv ranije — vidi Sekcija 5.

---

## 5. Brand-utility kritika

### Da li Sarajevo sprega funkcioniše?

**Funkcioniše — ali samo ako mapa postoji.** Baščaršija, Marijin Dvor, Grbavica su autentični za region. Igrač koji ne zna Sarajevo — uči kroz gameplay (dobra content marketing mehanika). Ako su kvartovi samo "theme color" na tabeli — decoration.

**Svaki kvart mora imati 1 mehaničku osobenost** (pr. Baščaršija = Crowd aging brže ako nisi igrao sevdah stil).

### Da li "Avala pipeline" zaista konvertuje?

**Wishful thinking u sadašnjoj formi.** Prestige 3 je hardkor segment — mala frakcija. Casual igrači (target publike za event) napuštaju posle 1. sezone.

**Avala CTA mora biti na Season 1 complete screen** (posle 1. prestige), ne samo terminal. Avala Headliner ikona mora biti vidljiva od startnog ekrana — "tvoja finalna destinacija."

### Da li email capture može biti intrusive?

**Da, ako je blocker.** Standardna mobile gaming greška.

**Jedino prihvatljivo:** Optional, share-flow tied. "Ostavi email → primi podsjetnik 3 dana pre Avala žurke." Ako je obavezan za share ili progress — **dropovati ga completely.** Brand damage > email lista.

---

## 6. Scope vs. Implementability

| Layer | Status | Razlog |
|-------|--------|--------|
| **Macro (planiranje sedmice, mapa)** | MUST HAVE | Jedini layer koji daje "sense of Sarajevo", strategy, replay |
| **Meta (prestige, Avala unlock)** | MUST HAVE — pared down | 2 prestige za v1, expandabilno later |
| **Idle (passive income između noći)** | SHOULD HAVE | Retention, relativno brzo implementabilno |
| **Micro-game** | NICE TO HAVE — slider, ne tap-sync | Tap-sync je 6-8h bug risk; slider je 2h |

### Scope cuts za impl stage:

1. **Prestige: 4 → 2 nivoa** — Avala = Prestige 2 reward
2. **Micro-game: tap-sync → slider mehanika** — Crowd slider (vuci, namjesti, release)
3. **Kvartovi: 4 → 3 za v1** — Bjelašnica = Prestige 2 unlock
4. **Audio: 2 kompletna themes** — Baščaršija + Marijin Dvor; Grbavica nasledi ambient

---

## 7. Finalna preporuka

### Zadržati:
- Premisa i narativ (autentičan, region-specific, Kluboslavija hook)
- 4 kvarta sa imenima (ali Bjelašnica kao Prestige unlock)
- Upgrade tree 5 grana (sa Mileovim formulama)
- Avala Headliner terminal goal (ali vidljiv od minute 1)
- Share kartica (Canvas-only render)
- Vizuelna estetika (paleta, CSS pixel art)

### Skratiti/revidirati:
- **Micro-game:** tap-sync → slider
- **Prestige:** 4 → 2 nivoa za v1
- **Kvartovi:** 3 implementirani potpuno, Bjelašnica delayed
- **Email capture:** strictly optional, nikad blocker
- **Avala pipeline CTA:** na Season 1 complete screen, ne samo terminal
- **Audio brief:** konkretni parametri po kvartu, ne "balkanski fusion"
- **Share kartica:** Canvas-only render

### Dropovati:
- Ritam/BPM audio-sync tap mehanika
- 4. prestige nivo za v1
- Bjelašnica u Sezona 1
- Email gating

### Korekcije za Mile (gdd.md input):
1. Fail state definisan: Crowd < 20 = bad rep event = -15% prihoda sledeće noći
2. Micro-game = slider, ne tap
3. 2 prestige nivoa, Avala = Prestige 2
4. 3 kvarta za Sezona 1
5. Audio konkretni parametri u gdd.md appendix

---

*Premortem završen. Nega Negovanović. 2026-06-03.*
