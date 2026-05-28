# GDD — DJ Akademija
**Gari Daily Games × Kluboslavija | Štrand, 13.jun 2026**  
Žanr: Trivia Quiz | Kompleksnost: 1/5 | Playtime: 3–5 min

---

## 1. Game Flow

```
[Intro] → [Pitanje 1..10] → [Feedback] → [Pitanje N+1 ili Final] → [Share]
```

Linearno, bez grananja. Nema retry per-pitanje.

---

## 2. Ekrani / Stanja

| Stanje | Trajanje | Prelaz |
|---|---|---|
| `INTRO` | User tap | Tap → `QUESTION` |
| `QUESTION` | 20 sek max | Odgovor → `FEEDBACK`; Timer 0 → `FEEDBACK` (wrong) |
| `FEEDBACK` | 1.5 sek | Auto → sledeći `QUESTION` ili `FINAL` |
| `FINAL` | User action | Tap Share → Web Share API |
| `SHARE` | Transient | Uspeh: nativni sheet; Fail: clipboard copy + toast |

**INTRO sadržaj:** Logo Kluboslavija, CTA "Prijavi se za ekipu", Start dugme.

---

## 3. Timer Mehanika

- Countdown: **20.000 ms**, preciznost 100 ms (vizuelni prikaz: celi sekundi).
- Implementacija: `setInterval(100ms)` + `Date.now()` delta za drift korekciju.
- Na **timer = 0**: pitanje se tretira kao **pogrešan odgovor** (score += 0), prikazuje se tačan odgovor u feedback fazi.
- Timer se resetuje na svakom `QUESTION` ulasku.
- Vizuelni indikator: progress bar, prelazi u crvenu ispod 5 sek.

---

## 4. Feedback Loop — Animaciona Sekvenca

```
[Klik opcije] →
  0 ms     : disable sve opcije
  0 ms     : highlight kliknuta (zelena / crvena)
  0 ms     : highlight tačna (zelena, ako igrač nije tačno)
  0 ms     : prikaži fact tekst ispod opcija
  800 ms   : pauza (fact se čita)
  1500 ms  : auto-prelaz na sledeće pitanje / final
```

Ukupno vidljivo: **1.5 sek** od klika do prelaza.

---

## 5. Scoring — Formula i Boundary Cases

```
score = broj tačnih odgovora (0–10)
```

- Svako pitanje: +1 tačno, +0 pogrešno ili timeout.
- Nema bonus bodova, nema penala.
- **Boundary cases:**
  - Timeout = 0 bodova za to pitanje (ekvivalentno pogrešnom).
  - Svih 10 timeout-ova → score 0 → titula "Obezbedi bio" (validno stanje).
  - Simultani klik i timer expiry: klik ima prioritet ako je registrovan pre `timer === 0`.

**Score → Titula:**
| Score | Titula |
|---|---|
| 10 | 🎛️ Head of Sound |
| 8–9 | 🎧 Sound Engineer |
| 6–7 | 🔊 Regular na Štrandu |
| 4–5 | 🎵 Slušalac u Razvoju |
| 0–3 | 🚪 Obezbedi bio |

**"Head of Sound" DM hook:** Final screen prikazuje +1 CTA: "Pošalji screenshot Kluboslavija DM-u za backstage akreditaciju." (virality + conversion, nema tech zahtev).

---

## 6. Modularna JS Struktura

```
/src
  main.js          — init, state machine, event bus
  config.js        — konstante (TIMER_MS, FEEDBACK_MS itd.)
  questions.js     — array[10] objekata {text, options[4], correct: 0-3, fact}
  timer.js         — start(ms, onTick, onExpire), stop(), reset()
  scoring.js       — addAnswer(isCorrect), getScore(), getTitle()
  state.js         — localStorage best score, load/save
  input.js         — keyboard A/B/C/D + touch/click handlers
  ui.js            — render po stanju: renderIntro, renderQuestion,
                     renderFeedback, renderFinal
  share.js         — shareResult(title, score): Web Share API →
                     fallback navigator.clipboard.writeText + toast
```

**State machine (main.js):** `INTRO | QUESTION | FEEDBACK | FINAL` — jednosmeran tok, bez back navigacije.

---

## 7. Pitanja — Data Shape

```js
{
  text: "Na kojoj frekvenciji se bas 'oseća u grudima'?",
  options: ["20–80 Hz", "200–400 Hz", "1–5 kHz", "8–16 kHz"],
  correct: 0,  // index tačne opcije
  fact: "Sub-bas ispod 80 Hz aktivira receptore u grudnom košu."
}
```

Tačni odgovori po redosledu (index): 0, 1, 0, 0, 1, 0, 0, 0, 0, 2.

---

*Autor: Mile Mehanika | v1.0 | 2026-05-28*
