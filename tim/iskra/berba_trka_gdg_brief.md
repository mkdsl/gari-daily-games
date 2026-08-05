# Berba Trka — GDG Concept Brief (pipeline-ready za KORAK 1)

> Iskra, 2026-08-05. Kopija koncepta iz ajajaj/tim/iskra/2026-08-02.md, prebačena ovde da KORAK 1 agent ne mora da čita cross-repo. Konceptu iz 08-02 nije ništa dodato, samo formatizovano za direktan paste u `docs/concept.md`.

---

## docs/concept.md — sadržaj za copy-paste

### NAZIV: Berba Trka

**Žanr:** Timing/Rhythm Puzzle (Precision Harvesting)
**Datum concept-a:** 2026-08-06 (concept stage, impl 07.08, polish 08.08)
**Brand serves:** Guncati (primary), Kluboslavija (secondary)
**Session target:** 10–15 minuta
**Prestige hook:** "Drugi krug" — reset u Nov Berbu za permanentni bonus
**Berba window narativ:** Prava berba na Guncatiju: 04–06.08 / igra: release ~08.08

---

### PREMISA

Ti si brač na Guncatijevom imanju. Plodovi su tu, ali svaki ima tačan momenat — uzmeš prerano, kiseo je; uzmeš prekasno, raspao se. Uspevaš ne snagom, nego tempom.

Nije clicker. Nije idle. Ovo je preciznost: vidiš kako raste zrelost, biraš momenat, skupiš šta možeš pre nego što kiša dođe.

---

### CORE GAMEPLAY LOOP

**Jedan krug (10–12 minuta):**
1. Na ekranu je 4–6 biljaka/voćki istovremeno, svaka sa RIPENESS METER-om koji raste sopstvenim tempom
2. Meter ide: Zeleno (nezrelo, minus) → Žuto (prime zone, max points) → Crveno (overripe, minus)
3. Igrač klika voćku kad proceni da je prime — TIMING SCORE (ms od ulaska u prime zone → % poena)
4. Paralelno pristiže VREME — sunce se pomera, oblaci dolaze, kiša može da završi krug pre vremena
5. Rezultat: "Berba Score" = Σ(timing_quality × crop_value) po biljci

**Hook (zašto 15+ min):** Biljke imaju RAZLIČITE krive — jagoda se otvori i zatvori za 2 sek, lubenica ima 8 sek prime, trešnja je varijabilna. Igrač mora da pamti ritam i prebacuje pažnju. Kiša može doći u bilo kom trenutku — svaki krug je drugačiji.

---

### RIPENESS KRIVE (za Mile / GDD)

```
jagoda:    [=====|===|====]  prime 2.5s, brza
trešnja:   [======|====|=====] prime 3s, nestabilna (+/-15% suma)
paradajz:  [========|=======|========] prime 7s, spor
lubenica:  [==========|=========|==========] prime 8s, veeelika nagrada
dinja:     [=======|=====|=======] prime 5s, srednja
kupina:    [====|==|====] prime 1.5s, TEŠKA — high risk/high reward
```

**Progression:**
- Level 1–3: 4 biljke, lagana kriva, nema kiše
- Level 4–6: 5 biljaka, nema simetrije, oblaci daju 30sek upozorenje
- Level 7–10: 6 biljaka, kiša varijabilna (može doći bez upozorenja), bonus kupina (3×)

**Market Price rotacija (svaka runda):**
- Jedan usev ima 2× vrednost — "pijačna potražnja"
- Igrač dobija info na startu ali ne zna koji — dodaje decision layer

**Prestige (Novi Krug):**
- Reset sezone, zadrži "Berba Rekord" permanentno
- Svaki prestige level dodaje 1 nova biljku u pool (orah, šipak, jabuka)

---

### VIZUELNI IDENTITET

- Paleta: Guncati — #1a1208 bg, #2d5016 biljke, #FFD700 sunce/prime, #8B8B8B oblak
- Pixel art stil: top-down garden view, biljke raspoređene po 3×2 grid
- Ripeness indikator: RING oko biljke (zelena → žuta pulsira → crvena pulsira brže)
- Kiša: šrafuranje odozgo animirano u CSS

---

### AUDIO

- Ambient: jutarnje ptice → poslepodnevne cvrčke → oblak thunder distant
- Timing click: "crunch" menja se po kvalitetu (dobar = satisfying thud, loš = soft plop)
- Prime zone entry: kratki riff (folk melodija, jedna nota)
- Kiša dolazi: crescendo rain sfx

---

### WIN CONDITION

- Sezona: sakupi 80%+ maximum mogućeg Berba Score-a kroz 10 rundi
- Per-round: svaka runda ima scoring tabelu (S/A/B/C/F) po % optimalnog momenta
- Kiša pre vremena: partial score, ali bonus za "rescued crops" (sve žute)

---

### BRAND HOOKS

**Guncati (primary):**
- Share card na kraju svakog kruga: "Moj Berba Score: [X]. Prava berba počela 04.08 na Guncatiju. [play_url]"
- In-game narativ: biljke = Guncati sorte (paradajz koji Brana uzgaja)

**Kluboslavija (secondary):**
- Easter egg: "Avala Trešnja" (poseban beli pixel sprite) → Krediti screen sa Avala event posterom
- Timing loop paralela: DJ timing (DJ za Pultom) → Berba timing — isti reful, drugačiji kontekst

---

### SCOPE NAPOMENA ZA MILE/JOVU

Ovo je single-layer timing puzzle — NE multi-layer manager sim. Target LOC: 5000–8000 JS, 400–600 CSS. 25–30 modula. Čist, brz, replay-able. Ne treba prestige sim; dovoljan je prestige reset sa jednim layer-om.

---

**ISKRA NAPOMENA ZA KORAK 1:** Ovaj brief je gotov concept — agent koji radi KORAK 1 može ga preuzeti direktno u `docs/concept.md` i prilagoditi datum i naziv foldera. Nema potrebe za regeneracijom koncepta. Premortem (KORAK 2) ide normalno.
