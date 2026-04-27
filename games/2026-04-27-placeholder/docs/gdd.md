# GDD: Frekventni Grad

## 1. Core Mehanika — Beat Hitovanje

Beat krugovi se pojavljuju na jednoj od 3 lane-a i putuju ka timing liniji (fiksna horizontalna traka na dnu ekrana). Igrač tapuje/klikne u trenutku kada krug stigne na liniju.

**Timing Windows:**
| Ocena | Window | Poeni |
|-------|--------|-------|
| PERFECT | ±40ms od beat vremena | 100 × multiplier |
| GOOD | ±80ms od beat vremena | 50 × multiplier |
| MISS | van 80ms ili propušten | 0, combo reset |
| EARLY | klik >80ms pre beata | tretira se kao MISS |

**KRITIČNO:** Jedini dozvoljen clock je `AudioContext.currentTime`. Nikad `Date.now()`, nikad frame counter. Beat vreme se izračunava iz AudioContext i čuva u pattern objektu.

**Lanes:** 3 lane-a — leva (key: A / touch zona levo), centar (key: S ili Space / touch zona centar), desna (key: D ili touch zona desno).

---

## 2. Combo & Multiplier

- Combo počinje od 1
- Svaki PERFECT: combo++, multiplier = min(1 + combo * 0.1, 4.0)
- Svaki GOOD: combo ostaje, multiplier se ne povećava
- MISS: combo = 0, multiplier = 1.0
- Vizuelno: multiplier prikazan u HUD-u, treperi kad dostigne 2×, 3×, 4×

---

## 3. Energy Bar (Publika)

- Početna vrednost: 60%
- PERFECT: +3%
- GOOD: +1%
- MISS: -8%
- Opseg: 0% – 100% (cap)
- **Game Over:** energy pada na 0% tokom pesme → "Noć propala" ekran
- **Crowd Hype:** energy > 80% → neon boje pulsiraju (CSS animation na pozadini), bass boost efekat u audio
- Energy se NE resetuje između pesama u istoj noći (nosi se kroz celu noć)

---

## 4. Beat Pattern Sistem

**Format jednog beata:**
```js
{ time: 4.36, lane: 1 }  // time u sekundama od početka pesme, lane 0|1|2
```

**Format pesme:**
```js
{
  bpm: 110,
  duration: 32,        // sekundi
  beats: [ {time, lane}, ... ]
}
```

Pattern fajlovi žive u `src/levels/` — jedan fajl po klubu, export-uje array pesama.

**Generisanje pattern-a:** Hardkodirani nizovi (ne proceduralni) — sigurniji za gameplay feel. Svaki klub ima 5 noći × 3 pesme = 15 pesama. Pesme u okviru kluba dele isti BPM ali rastu po kompleksnosti.

---

## 5. Progression — Noći i Klubovi

**Tabela klubova:**
| Klub | BPM | Simultani beatovi | Lane-ovi aktivni | Pattern tip |
|------|-----|------------------|-----------------|-------------|
| Podrum (0) | 110 | 1 | 1 (centar) | Jednolinijski, ravnomerni |
| Krov (1) | 120 | 1-2 | 2 (leva+centar) | Dvolinijski, mali gap-ovi |
| Metro (2) | 132 | 2 | 3 | Dvolinijski, syncopated |
| Orbita (3) | 140 | 2-3 | 3 | Trolinijski, random gaps |

- 5 noći po klubu, 3 pesme po noći
- Total: 4 × 5 × 3 = 60 pesama (ali mnoge mogu biti varijante)
- Noć traje ~5 min (3 pesme × ~90 sekundi + ekrani)

**Save progress:** currentClub i currentNight se čuvaju u localStorage — igrač nastavlja od poslednje noći.

---

## 6. Setlist Kartice (Kozmetičke)

Između svake pesme u noći igrač bira 1 od 3 kartice. Kartice menjaju **SAMO vizuelnu temu** — tempo i pattern ostaju nepromenjeni.

| Kartica | Primary boja | Background akcent |
|---------|-------------|-------------------|
| Cyan Mode | `#00E5FF` | `#001F26` |
| Amber Mode | `#FFD740` | `#261A00` |
| Purple Mode | `#E040FB` | `#1A0026` |

Odabrana boja traje za tu pesmu. Nema gameplay efekta.

---

## 7. Win/Lose Conditions

**Kraj pesme (normalan):**
- Prikaži Score Tally overlay: poeni ove pesme, PERFECT/GOOD/MISS count, trenutni multiplier
- Ako ima još pesama u noći → Setlist kartica izbor → sledeća pesma
- Ako je poslednja pesma noći → Night Summary ekran

**Night Summary ekran:**
- Ukupan score noći, prosečna energija, best combo
- Ako energy na kraju noći > 0% → "Noć pobedjena" + nastavi na sledeću noć
- Ako je poslednja noć kluba → "Klub otključan" animacija + novi klub

**Game Over (energy → 0% tokom pesme):**
- Pesma se pauzira, "Noć propala" overlay
- Opcije: Restart iste noći (score se resetuje) ili Main Menu

---

## 8. Highscore & Prestige

**localStorage ključ:** `"frekventni-grad-save"`

**Struktura:**
```js
{
  highscore: 0,
  currentClub: 0,      // 0-3
  currentNight: 0,     // 0-4 u okviru kluba
  totalNights: 0,      // ukupno odigranih noći
  prestigeCount: 0,
  prestigeSpeedMult: 1.0
}
```

**Prestige unlock:** Posle završetka 4. kluba (totalNights = 20).
- Beat krugovi su 1.2× brži (speedMult: 1.0 → 1.2 → 1.44...)
- Nova boja teme za prestige run (zlatna: `#FFD700` + crna)
- Highscore se čuva, progress se resetuje na Klub 0
- **Igrač NEĆE videti prestige u prvoj sesiji** — 20 noći zahteva 100+ minuta ukupno

---

## 9. Audio Specifikacija (OBAVEZNO — nije opciono)

Sav zvuk se generiše kroz Web Audio API. Bez .mp3, bez .ogg.

**AudioContext setup:**
```js
const ctx = new AudioContext();
// Svi beat times su ctx.currentTime + offset
```

**Bass loop (po pesmi):**
- OscillatorNode, type: `'square'`
- Frekvencija: 55 Hz (A1), attack 10ms, sustain, release 200ms
- Ritam: četvrtine na tekući BPM

**Arpeggio:**
- OscillatorNode, type: `'sawtooth'`
- Frekvencije: [220, 277, 330, 415] Hz u petlji (A3, C#4, E4, G#4)
- Osmice na tekući BPM, gain 0.15

**PERFECT hit sound:**
- OscillatorNode, type: `'sine'`, freq: 880 Hz
- Duration: 30ms, gain: 0.3, instant attack, linear release

**GOOD hit sound:**
- OscillatorNode, type: `'sine'`, freq: 660 Hz
- Duration: 40ms, gain: 0.2

**MISS sound:**
- OscillatorNode, type: `'square'`, freq: 80 Hz
- Duration: 100ms, gain: 0.2, distortion node (WaveShaper)

**Kraj noći crescendo:**
- GainNode ramp: 0.5 → 1.0 u 2 sekunde, zatim fade out na 0 u 1 sekundi

---

## 10. Difficulty Curve

Kompleksnost raste kroz 3 dimenzije: BPM, broj simultanih beatova, i "pattern gaps" (neravnomerni razmaci).

| Noć (ukupna) | Klub | BPM | Max simultani | Gap varijansa |
|---|---|---|---|---|
| 1-5 | Podrum | 110 | 1 | 0 (ravnomerni) |
| 6-10 | Krov | 120 | 2 | nizak |
| 11-15 | Metro | 132 | 2 | srednji |
| 16-20 | Orbita | 140 | 3 | visok |

U okviru jednog kluba, svaka noć dodaje jednu novu "figuru" (npr. dve četvrtine + osmina pauza).

---

— Mile Mehanika
