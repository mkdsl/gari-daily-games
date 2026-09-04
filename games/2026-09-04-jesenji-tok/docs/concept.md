# Concept — Jesenji Tok

**Naziv:** Jesenji Tok
**Alternativni naziv:** Zemlja Čeka
**Žanr:** Seasonal Scheduling Puzzle — NOVO za GDG (planning grid, ne arkada, ne idle, ne card)
**Datum:** 2026-09-04
**Session target:** 8–12 minuta
**Prestige hook:** "Drugi sezon" — spring reset sa trajnim bonusima
**Brand serves:** Guncati (primary), Kluboslavija (secondary)

---

## PREMISA

Ti si Brana. Kasni avgust. Zima dolazi za 80 dana.

Imaš 6 parcela, 3 radne grupe nedeljno, i 12 nedelja pre prve mrazne noći. Svaki posao ima prozor — stane u njega ili propada. Ne možeš sve odjednom. Biraš šta ide kad, ko ide gde, šta žrtvuješ.

Nije clicker. Nije idle. Nije timing reflex. Ovo je planiranje: vidiš šta dolazi, raspoređuješ šta imaš, i posle 12 nedelja zima pokaže je li ti plan bio dobar.

---

## CORE GAMEPLAY LOOP

**Setup (30 sek):** Vidiš grid — 6 parcela (redovi) × 12 nedelja (kolone). U bočnoj paleti su kartice radova, svaka obojena i sa ikonom.

**Drag-assign (main loop):** Povučeš karticu na ćeliju. Kartica "sedne" ako:
- Radna grupa je slobodna te nedelje (max 3 grupe nedeljno)
- Parcela nije zauzeta tim tipom rada

Tooltip na hover: `Prozor: 3/12 nedelja ostalo | Zahtev: 2 radne grupe | Prinos: novembar`

**Vreme (pasivna mehanika):** Nedeljni header prikazuje ikonu vremena (sunce/oblak/kiša). Kiša u datoj nedelji blokira graditeljske radove — ako si ih planirao za tu nedelju, automatski se crvene i traže premeranje. Vreme se generiše nasumično na startu sesije (jedan od 4 preset "sezona").

**Kraj — Zimska bura (nedelja 12):** Bura zatvara sezonu. Otkriva se score:
- Svaki rad završen u prozoru → puni poeni
- Svaki rad van prozora → 60% poena
- Svaki rad preskočen → 0
- Ekosistem bonus: ako su Micelij + Jezero + Kompost svi u prozoru → ×1.5 na zbir tih tri

---

## RADOVI (taskovi sa prozorima)

| Rad | Parcela tip | Prozor | Grupe | Prinos/Efekat |
|-----|-------------|--------|-------|---------------|
| Micelij inokulacija | Šuma/hlad | Aug 20 – Oct 10 | 2 | Berba bukovač novembar |
| Ozimo žito | Otvorena | Aug 20 – Sept 20 | 1 | Žitarice proleće |
| Jezero zimska priprema | Vodena | Oct 1 – Nov 1 | 1 | Ribe prezimljuju |
| Graditeljski (suvozid/tarabe) | Bilo koja | Aug 20 – Sept 30 *(kiša blokira)* | 2 | Infrastruktura |
| Zimska rezidba | Voćnjak | Sept 15 – Oct 31 | 1 | Proleće prinos +20% |
| Kompost zimski | Kompost zona | Aug 20 – Oct 20 | 1 | Prolećno gnojivo |

**6 tipova radova, 6 parcela** — jedan-na-jedan ako si efikasan. Napetost dolazi jer graditeljski i ozimo žito oba traže iste nedelje u avgustu, a igrač ima samo 3 grupe nedeljno.

---

## SCORING & BALANCE

```
base_score = Σ(poeni po radu)
ekosistem_bonus = 1.5 ako su Micelij+Jezero+Kompost svi ✅
final_score = base_score × ekosistem_bonus (max ~1200 pts)
```

**Rang lestvica:**
- 900–1200: "Savršena sezona — Brana bi bila ponosna"
- 600–899: "Solidna sezona — prezimićeš"
- 300–599: "Preživećeš. Proleće će biti teže."
- 0–299: "Zemlja nije zaboravila — ali ti si."

**Hidden achievement:** Svi radovi u prozoru sa sva 4 sun presets → unlock "Brana Mode" — kratki dialog overlay od Brane o svakom radu.

---

## PRESTIGE LOOP

**Kraj sesije → "Drugi sezon" ekran:**
- Biraš JEDAN trajni bonus: `+1 Radna grupa nedeljno` ili `Jedna parcela je iskusna (nema inokulaciju)` ili `Vreme je predvidivo (nema kiša event)`
- Reset grid, isti radovi, svežiji izazov

---

## VIZUELNA ESTETIKA

**Paleta:**
```
Pozadina: #1a2e1a (tamna šuma, jesen)
Grid ćelija: #2d4a1e (zemlja)
Rad kartice boje:
  Micelij: #8b7355 (zemlja-smeđa)
  Ozimo: #c8a05a (zrela pšenica)
  Jezero: #2c5f7a (plava-zemlja)
  Graditeljski: #6b4c3b (crvena glina)
  Rezidba: #4a7c59 (lisnato)
  Kompost: #5a4e44 (humus)
Tekst: #f5e6c8 (papir/krem)
Prozor indikator: #ff6b35 (narandžasti uzbun kad < 2 nedelje)
```

**Vizuelni jezik:** Parcele su nacrtane kao izomerni blokovi (topdown-angled, ne pixel art). Radne grupe su tri sitan ikončica osobe na karticama. Nedeljni header ima animovanu ikonu vremena (loop: sunce/oblak/kiša, 3 frejma).

---

## AUDIO

Ceca Čujka: ambient jesen (lišće u vetru, povremena kiša, daleki vuk). UI klikovi: glineni "thud" za drag, drveni "click" za potvrdu. Score reveal: solo harmonika (folk motiv).

---

## BRAND UTILITY

**Guncati (primary):** Prikazuje stvaran ritam imanja — igrač koji završi igru zna KADA se šta radi. Pre masterclassa "Pripremi imanje za zimu" (jesenji event) ovo je savršen primer-sadržaj. Edukuje bez predavanja.

**Kluboslavija (secondary):** Jesenji masterclass = event companion. Igrač koji igra "Jesenji Tok" dolazi na masterclass već spreman (zna šta ga čeka). Dule ugao: igra kao intencijski primer za gosta.

**brand_serves:** `["guncati", "kluboslavija"]`

---

## KOMPLEKSNOST & SCOPE

**Kompleksnost:** 3/5 — nema fiziku, nema AI, drag-drop na grid je CSS positioning. Težina je u UX-u: grid mora biti čitljiv na mobitelu.

**Minimalni moduli po kategoriji (Iskra procena za ≥ 25 total):**

**Core (4):**
- `src/main.js` — Bootstrap, game start/restart, wire modules
- `src/config.js` — radovi, prozori, parcele, scoring formula, weather presets
- `src/state.js` — grid state, grupe-po-nedelji, weather seed, prestige bonuses, save/load
- `src/input.js` — drag-drop (touch + mouse unified Pointer Events API)

**Systems (5):**
- `src/systems/scoring.js` — score kalkulacija, ekosistem bonus, rang lestvica
- `src/systems/weather.js` — weather preset generator, blokiranje gradnje, weekly icons
- `src/systems/validation.js` — da li kartica može stati na ćeliju (grupe, parcela tip, conflict)
- `src/systems/prestige.js` — prestige bonuses track, "Drugi sezon" reset, bonus selection
- `src/systems/achievements.js` — Brana Mode hidden achievement, completion tracking

**Render + UI (6):**
- `src/render.js` — orchestrate DOM rendering, grid, header, card palette
- `src/ui.js` — HUD (nedelja tracker, grupe counter), tooltip, phase overlays
- `src/ui/grid.js` — 6×12 grid DOM, ćelija states (empty/filled/conflict/out-of-window)
- `src/ui/cards.js` — kartica DOM, drag handlers, boje po tipu, grupe-ikone
- `src/ui/score-screen.js` — zimska bura reveal, score breakdown, ekosistem bonus vizual
- `src/ui/prestige-screen.js` — "Drugi sezon" ekran, tri bonus opcije, animacija reseta

**Audio (1):**
- `src/audio.js` — Web Audio API: jesen ambient, drag thud, drop click, score reveal harmonika, weather sfx

**Content (3):**
- `src/content/tasks.js` — 6 task definicija sa prozorima, parcelom, grupama, poena
- `src/content/brana_dialogs.js` — Brana Mode dialog tekstovi (6 overlay-a), score reakcije
- `src/content/brand_hooks.js` — Guncati masterclass CTA (url, tekst), Kluboslavija hook

**Styles (4):**
- `styles/base.css` — Layout, mobile-first, grid container
- `styles/game.css` — Grid ćelija, kartica drag animacije, weather icons CSS
- `styles/ui.css` — HUD, tooltip, score screen
- `styles/theme.css` — Jesen paleta, tamna šuma estetika

**Ukupno: 23 fajlova core. Da bi se dostiglo ≥ 25, Mile/Jova može proširiti:**
- `src/systems/conflict.js` — conflict detector za prestige edge cases (odvojen od validation.js)
- `src/ui/tutorial.js` — first-run tooltip overlay (drag, grupe limit, window alert)
- `src/share.js` — Web Share API + clipboard fallback sa score

**Zbir sa proširenjem: 26 modula** ✅ (single-layer žanr, u scope za 1 impl sesiju)

---

## WIN CONDITION

Zimska bura stiže nakon 12 nedelja. Nema fail state — svaka sezona se završava, rezultat pokazuje koliko si bio spreman. Prestige loop pokreće "Drugi sezon" umesto game over ekrana.
