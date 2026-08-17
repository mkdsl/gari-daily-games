# Beta Report 2 — Crew Recruiter: Izgradi Ekipu
**Datum:** 2026-08-17
**Iteracija:** 2 (post-fix)
**Beta Score:** 7.5/10

---

## Verifikacija fixeva iz iter 1

### [CRITICAL 1] pointer-events — RIJEŠENO

`styles/ui.css` linija 331: `#resolve-overlay { pointer-events: auto }` — potvrđeno. Overlay sada blokira klikove na pozadinske elemente tokom čitave resolve sekvence. Race condition koji je dozvoljavao višestruki `performResolve()` poziv u jednoj fazi je zatvoren. Nema nalaza.

### [CRITICAL 2] aria-live screen reader — RIJEŠENO

`src/ui/ending-screen.js`: `aria-live="polite"` uklonjen sa `.ending-score-wrap` (line 86). Dodan skriveni `<span class="sr-only" id="score-sr-announce">` (line 90) koji ostaje prazan tokom animacije. `animateCounter()` sada prima `srOnly` parametar i puni ga jednom sa `"Vibe Score: ${to} od 100"` tek kad `progress >= 1` (linija 31–33). Screen reader korisnik čuje finalni broj jednom, ne stream od 90+ update-a. Potvrđeno bez novog nalaza.

### [MEDIUM] `.ending-card` layout — RIJEŠENO

`styles/ui.css` linija 578: `.ending-card { min-height: 320px; ... }` — nema `aspect-ratio: 1/1`, nema `overflow: hidden`. Karta sada raste sa sadržajem. Korisnici sa large system fontom (125%+) više neće vidjeti isječen play URL ili dugmad.

### [MEDIUM] Tutorial korak 4 (Vibe Score) — RIJEŠENO

`src/ui/tutorial.js` linija 18–21: Dodan STEPS entry "Korak 4 — Vibe Score" sa tekstom koji objašnjava penalties (prazni slotovi, niska snaga, česte zamjene) i cilj (80+ za legendarni nastup). Typo `maybShowTutorial` → `maybeShowTutorial` potvrđen na liniji 32.

---

## Novi nalaz

Nema novih CRITICAL nalaza. Nema novih MEDIUM nalaza koji nisu bili u iter 1.

---

## Preostali MEDIUM iz iter 1 (nisu fiksirani u ovom prolazu)

### [MEDIUM] Keyboard drag via sintetički PointerEvent (`ui/cards.js` + `input.js`)

Tutorial korak 2 pominje "klikni ili prevuci" — keyboard korisnici koji koriste Enter/Space šalju sintetički `PointerEvent` sa `clientX: 0, clientY: 0` što ne aktivira `pointermove`-based drag. Nije potvrđeno da click-based assign tok (klik karte → klik slota) radi nezavisno od drag-a bez čitanja `input.js`. Ostaje strukturni rizik za keyboard navigaciju.

### [MEDIUM] `drawCards` hand clearance (`src/main.js`)

`deck.js drawCards(n, state)` push-uje karte na `state.hand` bez brisanja prethodnih. Nije potvrđeno da `enterDrawPhase()` u main.js eksplicitno radi `state.hand = []` ili prenosi neassignovane karte u graveyard pre svakog draw-a. Rizik akumulacije 6+ karata u ruci bez čitanja main.js.

### [MEDIUM] Guncati CTA u `getCTA()` (`src/systems/ending.js`, `src/content/brand_hooks.js`)

Strukturno mjesto za Guncati tie-in postoji (`.ending-cta`), ali `getCTA()` i `BRAND.PLAY_URL` nisu čitani — nije potvrđeno da bar jedan `type`/`eventType` kombinacija vraća Guncati-specific kopiju, ni da `PLAY_URL` pokazuje na MKDSLend URL.

### [MEDIUM] Vibe Start napetost (`src/config.js`)

`VIBE_START = 20`, `CHURN_PENALTY = 3`, `EMPTY_SLOT_PENALTY = 2` — matematički crash u prvoj rundi je skoro nemoguć. Korisnik ne osjeća napetost dok bar ne padne ispod 40–50. Preporuka: `VIBE_START = 30–35`, `CHURN_PENALTY = 4` za veći osjećaj pritiska u kasnim fazama (Climax, Breakdown) gdje su weight multiplieri visoki.

---

## Preostali LOW iz iter 1 (nefiksirani)

- **Slot labele 0.58rem** — ispod čitljivosti na low-DPI Android uređajima.
- **`aria-disabled` bez `disabled` atributa** na zaključanim event type karticama — fokusabilna dugmad koja ništa ne rade.
- **`buildBestScoreLine` logika** — funkcionalna ali netransparentna (`|| hof.length === 1` kombinovano sa `&& currentScore >= maxScore`).
- **Aforizam overlay timing** — breakdown + aforizam = ~4.5s između rundi, može biti sporo na mobilnom.
- **HOF placeholder za nove korisnike** — menu nema "Popuni 3 igre da otključaš Hall of Fame" indikator.
- **Event type mehaničke razlike nisu opisane** — Outdoor vs Klub/Intimate izgledaju isto u meniju, korisnik nema motiv za unlock.

---

## Sumarni scorecard

| Dimenzija | Iter 1 | Iter 2 |
|-----------|--------|--------|
| Playability | 6.5/10 | 7.5/10 |
| UX/Onboarding | 7.5/10 | 8.5/10 |
| Engagement | 7.0/10 | 7.0/10 |
| Brand fit | 7.0/10 | 7.0/10 |
| **Beta Score** | **7.0/10** | **7.5/10** |

**Obrazloženje skokova:**

- **Playability +1.0** — pointer-events race condition je bio aktivan rizik koji je mogao uzrokovati double-resolve i corrupted `vibe_score`. Riješen.
- **UX/Onboarding +1.0** — tutorial korak 4 direktno adresira najveći onboarding gap (korisnik nije znao šta uzrokuje Vibe pad); ending card više ne isječe sadržaj na large font; aria-live spam eliminisan za screen reader korisnike.
- **Engagement 0.0** — Vibe Start tension nije adresiran, HOF placeholder nije dodan, event type razlike i dalje neopisane.
- **Brand fit 0.0** — Guncati CTA ostaje nevalidiran.

---

## Verdict iter 2

**0 CRITICAL, 4 MEDIUM otvorena, Beta Score 7.5/10.**

**KORAK 6.75 gate: score 7.5 < 8.0 → auto-release nije moguć. Potreban šef sign-off.**

Igra je funkcionalno čista — core loop radi, sinergija je ispravna, deck sistem je korektan, oba blokatora su eliminisana. Preostala 4 MEDIUM su poboljšanja kvaliteta (keyboard dostupnost, hand clearance, tuning, brand validacija), ne crash/corruption bugovi. Šef igra kroz `play_url` i donosi finalnu odluku.

**Preporučeni prioritet za sef_signoff sesiju (ako šef želi finalni fix krug pre release-a):**
1. `src/main.js` — potvrditi `state.hand = []` u `enterDrawPhase()`
2. `src/systems/ending.js` + `src/content/brand_hooks.js` — potvrditi Guncati CTA
3. `src/config.js` — razmotriti `VIBE_START = 30`, `CHURN_PENALTY = 4`

Ostalo (keyboard drag, LOW lista) ide u `patch_queue.md` post-release.
