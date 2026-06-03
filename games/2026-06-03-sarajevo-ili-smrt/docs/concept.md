# Sarajevo ili Smrt — Concept

**Autor:** Iskra Ivanović
**Datum:** 2026-06-03
**Stage:** concept

---

## Naziv

**Sarajevo ili Smrt**
*(podtitl: "Jedna noć koja menja sve")*

Fraza "Sarajevo ili smrt" je istorijski slogan koji dobija playful reinterpretaciju — na Kluboslavija turneji, svaka noć u Sarajevu je "ili smrt od dosade ili legenda." Igrač je DJ koji dolazi u Sarajevo sa nula reputacije i gradi imperiju jedne noći po jedne noći, sezona za sezonom.

---

## Žanr

**Idle/Incremental Manager-Sim** — multi-layer (Macro + Micro + Meta)

Inspiracija: Game Dev Tycoon (karijerska eskalacija) + Coffee Shop (resource flow) + Mini Metro (mreža veza) + Hades (run-based ponavljanje sa stalnom progresijom). Nije clicker-stub — ovo je pravi idler sa eksponencijalnom ekonomijom, prestige reset-om i branching upgrade tree-jem.

---

## Premisa

Ti si DJ koji stiže u Sarajevo bez reputacije, bez konekcija, bez para. Imaš jedan sanduk opreme, jedan mix-tape i jednu šansu. Svaka noć je sesija u nekom klubu Sarajeva — od podrumskog kafića u Baščaršiji do roof-top kluba na Vrbanja mostu. Igraj pravu muziku za pravu publiku, gradi reputaciju po mahali, skupljaj "Legenda Points", i jednog dana — osvoji glavnu binu na Avala žurki kao headliner koji je prokrčio put kroz Sarajevo. Svaka noć koja preživi postaje deo tvoje legende. Svaka noć koja propadne je "smrt" — ali smrt iz koje se uči.

---

## Core Gameplay Loop

### Macro Layer — "Sezona" (1 sezona = 7 noći, real-time idle)

- Igrač planira raspored sedmice: koji klubovi, koji termin, koji DJ stil
- Svaki klub ima **kapacitet, vibe score, mahala reputaciju** i **žanr-match koeficijent**
- Biranje pogrešnog kluba za pogrešnu publiku = nizak prihod, pad reputacije
- Kraj sezone: obračun Legenda Points, unlock novih kvartova/klubova/eventova
- Resource carry-over: Džabe-Konekti (DJ mreža), Oprema nivo, Mahala Reputacija (po distriktu)

### Micro Layer — "Noćna Sesija" (mini-game, 2-4 min aktivnog igranja)

- Visualizer sa talasom koji se pomiče desno, igrač tapka/klik-uje u ritmu da "uhvati" vibe peak
- Svaki uspešan hit = +Energy (publika raste), miss = -Energy (publika hladi)
- **Sarajevo Crowd** ima specifična reagovanja: Baščaršija voli sevdah-elektroniku, Marijin Dvor voli tech house, Novo Sarajevo voli balkanski rap-fusion
- Crowd meter (0–100): ispod 30 = "smrt noći", iznad 70 = legenda moment → bonus LP

### Meta Progresija — "Karijera" (prestige reset + permanent bonuses)

- Nakon što pokriješ sva 4 kvarta Sarajeva → **"Sarajevo Achievement"** unlock
- Prestige reset: vraćaš se na nula Legenda Points ali zadržavaš **Džabe-Konekti** (multiplicira sve buduće prihode) i **Equipment Tier** (+1 permanentno)
- Svaki prestige otključava novu stazu: lokalne medije, strani booking, festival bina
- Krajnji cilj: **Avala Headliner Status** (unlockuje se posle 3+ prestige run-a sa Sarajevo achievement-om)

---

## Hook — Zašto Igrač Ostaje 15+ Minuta

1. **"Još jedna noć" petlja** — svaka sesija je kratka (2-4 min), ali odmah se otvara sledeća priložnost. Nema hard stop-a.
2. **Sarajevo specifičnost** — kvartovi se osećaju kao pravi (Baščaršija, Grbavica, Ilidža, Bjelašnica resort), svaki sa drugom publikom i easter egg-ovima (lokalni aforizmi u crowd reaction-ima, citati iz Sarajevskog rata i mira prenapravljeni u DJ humor)
3. **Legenda Points eksponencijalni skok** — prvih 100 LP se stiče sporo, ali od 1k na dalje eksponencijalni multiplier creša — igrač "oseti" kad je na pravom putu
4. **Unlock misterija** — kvartovi su zamagljeni dok se ne otključaju, igrač vidi silhuete i "šapate" (tekstualni hints) o šta sledeće čeka
5. **DJ Prestige identity** — svaki prestige run menja vizuelni identitet DJ-a (costume, naziv, boja aure) — socijalni flex za share
6. **Sarajevo → Avala pipeline** — igra je eksplicitno "practice run" za Avala event (Jun 20), što daje meta-narativni cilj van igre

---

## Vizuelna Estetika

**Stil:** CSS pixel art + retro neon na dark background, Sarajevo murals kao dekorativni elementi

**Paleta boja:**
- Pozadina: `#0a0a14` (duboka noć)
- Neon primarni: `#FF3366` (Sarajevo crvena — krvavi mak + neon)
- Neon sekundarni: `#00FFCC` (teal cyan — Miljacka reka noću)
- Akcent: `#FFD700` (zlatni — legenda status)
- Mahala boja 1 (Baščaršija): `#C8860A` (topla oker)
- Mahala boja 2 (Marijin Dvor): `#4A90D9` (plavkasta modernizacija)
- Mahala boja 3 (Grbavica): `#8B45A0` (ljubičasta underground)
- Mahala boja 4 (Bjelašnica): `#FFFFFF` (planinska bela, zimski resort vibe)

**UI stil:** Brutalist pixel font (CSS generirani) + card-based klub prikaz + animirana crowd bar sa točkićima koji skakuću

**Efekti:** Screen shake na legenda moment, particle burst (muzičke note i zvezdice) na crowd peak, fog-of-war na nezaključanim kvartovima

---

## Audio Mood (Web Audio API — sve generisano)

- **Ambient idle:** Low-frequency pulsing bass drone (simulates distant club music), 60-80 BPM
- **Noćna sesija beat:** Synthwave/balkanski fusion loop generisan kroz Web Audio oscillators — square wave bas + sawtooth melodija
- **Crowd reaction SFX:** Cheering burst (filtered white noise → fade), groan (low pitch sine down-sweep), ambient murmur (Perlin noise-based volume modulation)
- **UI SFX:** Coin sound za LP gain (A4 + E5 sine chord), unlock jingle (ascending pentatonic), prestige reset (dramatic reverb + delay sine sweep)
- **Mahala theme-ovi:** Svaki kvart ima drugačiji ambient color — Baščaršija: blago "sevdah" flavor (minor scale, slow attack), Marijin Dvor: clean techy pulse, Grbavica: distorted underground

---

## Win Condition + Replay Hook

**Short-term win:** Završiti prvu sezonu sa crowd score >50 na svim noćima (unlock Grbavica kvartal)

**Mid-term win:** Pokriti sva 4 sarajevska kvarta i dobiti "Sarajevo Achievement" badge

**Long-term win (prestige unlock):** Bookirati se kao Avala Headliner — finalni ekran sa animiranom Avala kulom i tvojim DJ imenom u neonima

**Replay hook:**
- Svaki prestige run je "drugačiji build" — možeš se specijalizovati za jedan žanr (maksimalan output u jednom kvartalu) ili biti generalist (bonus za cross-kvartal reputaciju)
- Daily challenge: "Ova noć, ovaj klub, ovaj žanr" — random seed koji svi igraju istog dana → leaderboard
- Share card: generisana "Noćna legenda" kartica sa tvojim DJ imenom, statistikama i Sarajevo-themed background — shareable na socijalima kao Kluboslavija promo materijal

---

## Brand Serves

### Kluboslavija (PRIMARY)
- **Direktni hype za Sarajevo event** — igra je eksplicitni warm-up. Svaki igrač koji dostigne "Sarajevo Achievement" dobija overlay: "Dođi na pravo Sarajevo — Kluboslavija turneja 2026, datum uskoro"
- **Avala pipeline** — Headliner unlock karika eksplicitno vodi ka Avala Jun 20 eventu, cross-promoting unapred
- **Content asset** — share kartice su branded Kluboslavija materijal koji igrači organski šire
- **Email capture hook** — "Otključaj datum Sarajevo eventa" = opt-in gate (iframe form u igri)

### MKDSLend (SECONDARY)
- DJ karijera kao meta-narativ rezonuje sa "zabavni radni park" konceptom — rad koji je igra
- Prestige sistem demonstrira MKDSLend brand vrednost: "Svaki reset te čini jačim" (brand copywriting)
- Igra može biti embedded u MKDSLend sajtu kao "mini svet Kluboslavije"

---

## Targetirana Dužina Sesije

- **First session (novi igrač):** 15–25 min (1 sezona + 2-3 micro sesije + prvi unlock)
- **Return session:** 5–10 min (provera idle prihoda, nova noć, upgrade kupovina)
- **Prestige run prep:** 30–45 min (planiranje, optimizacija, dostizanje Achievement gate-a)
- **Ukupno do Headliner:** 3–5h kroz više session-a (optimalan idle arc)

---

## Prestige / Meta Progresija Detalji

**Prestige valuta:** "Džabe-Konekti" (DJ skraćenica za džabe dobijene konekcije — humor) — shorthand: "DK"

**Permanentni bonusi po prestige nivou:**

| Prestige | DK Bonus | Permanent Unlock |
|----------|----------|-----------------|
| 1 | 1.5× prihod multiplier | Strani DJ agent (novi upgrade tree) |
| 2 | 2.5× prihod multiplier | Festival bina opcija |
| 3 | 4× prihod multiplier | Avala Headliner booking (win condition) |
| 4+ | +1× po prestige | New Game+ (Beograd kao sledeći grad — future DLC hook) |

**Upgrade tree outline (min 20 stavki — za Mile):**

Grana A — Oprema (direktno utiče na Crowd Energy cap):
- Stari laptop mix → Proper CDJ → Pioneer Pro → Modular Setup → Alien Rig

Grana B — Repertoar (utiče na žanr-match score):
- 10 pesama → 50 pesama → 200 pesama → Custom editi → Ekskluzivni ID-ovi

Grana C — Mreža (utiče na booking fee i klub tier unlock speed):
- Slučajni poznanici → Lokalni promoteri → Regionalni agenti → Međunarodni booking

Grana D — Brend DJ-a (utiče na share card privlačnost i viralni multiplicator):
- Bezimeni → Lokalna legenda → Regionalni brand → Internacionalni artist

Grana E — Sarajevo Know-how (snižava smrt-risk po noći, ekskluzivna za ovaj grad):
- Stranac → Poznanik → Mahala favorit → Sarajevo ikona

---

## Sarajevo Lokalni Humor i Easter Egg-ovi

(Pera Period briše iz ovih za `src/content/aforizmi.js`)

- Crowd reaction tekstovi na mahali Baščaršija: "Brate, ovo je kao burek u 4 ujutru — savršeno." / "Jesi li siguran da nisi iz Sarajeva?" / "Daj nam tu pjesmu, ne znamo ni kako se zove al' je naša."
- Crowd smrt reaction: "Ode kapija." / "Ovo i moja baka ne bi puštala." / "Ugasi, sram te."
- Unlock flavor text za Grbavicu: "Podrum, dim i najiskrenije kritike koje ćeš čuti u životu."
- Prestige reset flavor: "Umro si ali Sarajevo pamti. Počni ponovo, lakše je drugi put."
- Avala Headliner unlock: "Sarajevo te naučilo. Avala te čeka. Laku noć, legendo."

---

## Folder Predlog

```
games/2026-06-03-sarajevo-ili-smrt/
```

Naziv je već u folderu, zadržavamo.

---

## Napomena za Pipeline

Ovaj concept je za **03:00 trigger — concept stage**. Sledeće:
1. Nega Negovanović radi `premortem.md` (input: samo ovaj fajl)
2. Mile Mehanika radi `gdd.md` sa punom ekonomijom brojeva (input: concept.md + premortem.md)
3. Commit `[concept] Sarajevo ili Smrt: docs done` + push
