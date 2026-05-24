# GDD — Zvučna Proba
**Verzija:** 1.0 | **Autor:** Mile Mehanika | **Tim:** GDG | **Datum:** 2026-05-24
**Brend:** Kluboslavija 2026 | **Platform:** Web (Mobile-first)

---

## 1. Mehanike

### 1.1 Sistem dijagnoze

Svaka runda počinje 3.5-sekundnim audio snippetom generisanim Web Audio API-jem. Signal nosi jedan namerni EQ defekt. Igraču se prikazuju **3 opcije dijagnoze** kao dugmadi:

- **Tačna opcija** — opisuje stvarni defekt (npr. "Bas je preglasan")
- **Distraktor A** — simptom koji zvuči logično ali pogađa suprotni kraj spektra
- **Distraktor B** — neutralna ali pogrešna tvrdnja koja koristi isti termin u drugom kontekstu

Distraktori se biraju iz banke problema tako da uvek postoji jedan u istoj frekvencijskoj zoni (plausibilan) i jedan u drugoj zoni (klopka). Vremenski prozor dijagnoze: 5 sekundi u ranim rundama, skalira po tabeli ispod.

### 1.2 Sistem korekcije — Trostepeni odabir

Po potvrđenoj dijagnozi igrač bira korekciju na **max 2 EQ ose** (nikad slider). Svaka osa nudi tri dugmeta:

| Dugme | Vrednost | Opis |
|---|---|---|
| ◀ Malo smanjiti | −1 | −4 dB na ciljnoj frekvenciji |
| ● OK | 0 | Bez promene |
| ▶ Malo pojačati | +1 | +4 dB na ciljnoj frekvenciji |

**Zelena zona** = tačna vrednost ±1 korak. Ako je target −4 dB, zelena zona prihvata −4 dB i 0 dB (ali ne +4 dB). Igrač bira obe ose pre verifikacije — nema parcijalne potvrde.

### 1.3 Verifikacija

Po odabiru korekcije, Web Audio graf se ažurira u realnom vremenu:
- `BiquadFilterNode.gain` za pogođenu frekvencijsku zonu dobija novu vrednost (+4 / 0 / −4 dB)
- Snippet se reproducira ponovo — isti izvor, novi filter parametri
- VU meter i waveform se osvežavaju: vizuelna promena je **obavezna**
- Ako korekcija ulazi u zelenu zonu — zeleni flash na waveformu + SFX "Proba OK"
- Ako ne — crveni flash + SFX "Problema i dalje ima"

### 1.4 Scoring formula

```
Base score po rundi       = 100 bodova (tačna dijagnoza + tačna korekcija)
Parcijalni bod            = 40 bodova (tačna dijagnoza, pogrešna korekcija)
Promašaj                  = 0 bodova

Time bonus                = floor((preostalo_vreme / ukupno_vreme) × 50)
  — max +50, min 0

Streak multiplier         = 1.0 + (streak_count × 0.1), cap 2.0
  — streak_count = uzastopni tačni odabiri dijagnoze

Score runde               = (Base + Time bonus) × Streak multiplier

Session total             = Σ Score rundi (10 rundi)
  — Max teoretski: (100 + 50) × 2.0 × 10 = 3000 bodova

Daily highscore tabela:
  — Top 3 po Session total
  — Top 3 po max Streak u sesiji
```

---

## 2. Progression kriva

### 2.1 Tabela rundi

| Runda | Frekvencijska zona | Opcije dijagnoze | Vremenski prozor | Tolerancija zelene zone |
|---|---|---|---|---|
| 1 | Bass (80–200 Hz) | 3 | 8 sek | ±1 korak |
| 2 | Highs (4–12 kHz) | 3 | 8 sek | ±1 korak |
| 3 | **BOSS — Mid + Bass** | 3 | 7 sek | ±1 korak |
| 4 | Mid (500–2000 Hz) | 3 | 7 sek | ±1 korak |
| 5 | Bass (sub, 40–80 Hz) | 3 | 6 sek | ±1 korak |
| 6 | **BOSS — Highs + Mid** | 4 | 6 sek | ±0 koraka (egzaktno) |
| 7 | Mid (presence, 2–4 kHz) | 3 | 6 sek | ±1 korak |
| 8 | Highs (air, 12–16 kHz) | 3 | 5 sek | ±1 korak |
| 9 | **BOSS — sve 3 zone** | 4 | 5 sek | ±0 koraka |
| 10 | Igrač bira zonu | 3 | 5 sek | ±0 koraka |

### 2.2 Boss probe (Runde 3, 6, 9)

- **Runda 3 (Boss 1):** Dva istovremena EQ defekta. Korekcija na 2 ose obavezna.
- **Runda 6 (Boss 2):** Tolerancija bez greške — zelena zona = egzaktno tačan korak. Time bonus nije dostupan. Vizuelni EQ problem je suptilniji (±2 dB, ne ±6 dB).
- **Runda 9 (Boss 3):** Sve 3 frekvencijske zone imaju potencijalni defekt, ali samo 2 su stvarna problema. Četvrta opcija dijagnoze je "Nema problema" — zamka za igrače koji paničare.

---

## 3. EQ Problemi banka

### Problem 1 — Boom basa
- **Web Audio:** `BiquadFilterNode`, type: `lowshelf`, frequency: 120 Hz, gain: +9 dB
- **Vizuelni prikaz:** VU meter leva strana eksplodira crveno, niska kitica waveforma debela
- **Tačna dijagnoza:** "Bas je preglasan"
- **Distraktor A:** "Sub je pregust" | **Distraktor B:** "Mid je ugušen"
- **Inline glosar:** *"Bas = niske frekvencije, ritam i udaraljke."*

### Problem 2 — Oštre visoke
- **Web Audio:** `highshelf`, frequency: 8000 Hz, gain: +10 dB
- **Vizuelni prikaz:** Desna strana VU-a crvena, waveform šiljast vrh
- **Tačna dijagnoza:** "Visoke frekvencije su preoštre"
- **Distraktor A:** "Sibilance je prenaglo" | **Distraktor B:** "Bas nedostaje"
- **Inline glosar:** *"Visoke = frekvencije iznad 4 kHz — sibilance, sjaj, zviždanje."*

### Problem 3 — Ugušen mid
- **Web Audio:** `peaking`, frequency: 1000 Hz, gain: −8 dB, Q: 1.4
- **Vizuelni prikaz:** Srednja kitica waveforma udubljena, VU centar prazan
- **Tačna dijagnoza:** "Mid je ugušen"
- **Distraktor A:** "Bas dominira" | **Distraktor B:** "Visoke su preglasne"
- **Inline glosar:** *"Mid = srednje frekvencije 500 Hz–2 kHz — glas, gitara, klarinet."*

### Problem 4 — Sub-bas preplavljuje
- **Web Audio:** `lowshelf`, frequency: 60 Hz, gain: +12 dB
- **Vizuelni prikaz:** Waveform val na dnu ekrana, VU sub-traka zasićena
- **Tačna dijagnoza:** "Sub-bas preplavljuje mix"
- **Distraktor A:** "Bas je preglasan" | **Distraktor B:** "Mid je zagušen"
- **Inline glosar:** *"Sub-bas = frekvencije ispod 80 Hz — oseća se više nego što se čuje."*

### Problem 5 — Presence rupa
- **Web Audio:** `peaking`, frequency: 3000 Hz, gain: −10 dB, Q: 2.0
- **Vizuelni prikaz:** Usko udubljenje u sredini waveforma, VU presence marker prazan
- **Tačna dijagnoza:** "Presence frekvencija nedostaje"
- **Distraktor A:** "Mid je ugušen" | **Distraktor B:** "Visoke su slabe"
- **Inline glosar:** *"Presence = 2–5 kHz, daje jasnoću glasu i gitari."*

### Problem 6 — Air nedostaje
- **Web Audio:** `highshelf`, frequency: 12000 Hz, gain: −8 dB
- **Vizuelni prikaz:** Vrh VU-a odsečen, waveform tup na visinama
- **Tačna dijagnoza:** "Nema zraka u visokim"
- **Distraktor A:** "Sibilance je uklonjen" | **Distraktor B:** "Mid je dominantan"
- **Inline glosar:** *"Air = frekvencije iznad 12 kHz — osećaj prostora i sjaja."*

### Problem 7 — Muljavi mid-bass
- **Web Audio:** `peaking`, frequency: 250 Hz, gain: +7 dB, Q: 0.8
- **Vizuelni prikaz:** Levo-centrična zona VU-a narandžasta, waveform bubrežast
- **Tačna dijagnoza:** "Mid-bas je muljev"
- **Distraktor A:** "Bas je preglasan" | **Distraktor B:** "Presence nedostaje"
- **Inline glosar:** *"Mid-bas = 200–400 Hz — topli ali i 'muljavi' deo spektra."*

### Problem 8 — Dvostruki defekt (Boss rezerva)
- **Web Audio:** `lowshelf` 100 Hz +8 dB + `highshelf` 10000 Hz +7 dB
- **Vizuelni prikaz:** Oba kraja VU-a crvena, centar prazan — "smiley EQ kriva"
- **Tačna dijagnoza:** "Bas i visoke su preglasni" (check oba)
- **Distraktor A:** "Mid je ugušen" | **Distraktor B:** "Sub dominira"
- **Inline glosar:** *"EQ kriva = grafički prikaz balansa frekvencija u mixu."*

---

## 4. Audio sistem — Brief za Ceca Čujku

### Base carrier signal
- **Tip:** `OscillatorNode` ×3 u paraleli — sine (80 Hz), sawtooth (440 Hz), square (2000 Hz)
- **Gain:** svaki na 0.33 → `GainNode` merge → `BiquadFilterNode` lanac → `AudioDestinationNode`
- **Trajanje snippeta:** 3500 ms, fade-in 50 ms, fade-out 150 ms

### SFX specifikacija
- **"Proba OK"** — kratki sine sweep 440→880 Hz, 200 ms, gain 0.6
- **"Problema i dalje ima"** — distorted square 220 Hz, 300 ms, gain 0.4, lowpass filter 800 Hz
- **Streak sound** — svaki 3. streak: sintetički 1200 Hz click ×2, 100 ms
- **Timer urgency** — poslednjih 2 sekunde: metronom tick 60 Hz, 100 ms pulse

---

## 5. UI moduli — Brief za Pera Piksel

### 5.1 Waveform VU meter
- Horizontalni EQ spektrum podeljen u 3 zone (Bass / Mid / Highs), svaka zona kao vertikalna traka
- Boja: zelena (normala) → narandžasta (±3–5 dB od targeta) → crvena (±6+ dB)
- Animacija: trake se ažuriraju u realnom vremenu za vreme playbacka (60 fps)
- Po korekciji: flash efekat — zeleni sjaj po uspehu, crveni puls po grešci

### 5.2 Trostepeni odabir dugmići
- Tri dugmeta po EQ osi: `[◀ Smanjiti] [● OK] [▶ Pojačati]`
- Veličina: min 48×48 px po dugmetu (touch target)
- Odabrani state: ispunjen, kontrastna boja (plava za neutralno, zelena za OK)
- Dve EQ ose vidljive samo u Boss rundama i rundi 10

### 5.3 Inline glosar bubble
- Pojavljuje se 500 ms nakon što termin prvi put postane vidljiv
- Tooltip bubble vezan za termin, 200 ms fade-in
- Tekst: max 12 reči, bela na tamnoj pozadini
- Prikazuje se samo jednom po terminu po sesiji

### 5.4 Timer bar
- Horizontalna traka na vrhu ekrana, puna širina
- Boja: zelena → žuta (50% preostalog vremena) → crvena (20%)
- Pulsira 1 Hz kad padne ispod 2 sekunde

### 5.5 Streak vizualizacija
- Ikone munje pored score-a: 1 munja po tačnom nizu, nestaje na prvom promašaju
- Na streaku ≥5: munje animirane (sparkle loop)
- Na streaku ≥10: ceo UI okvir pulsira zlatnom bojom

---

## 6. Game Over i Share screen

### Game Over ekran (3 uzastopna promašaja)
```
"Sava je zaustavio probu."
Poslednji problem: [naziv EQ problema koji je igrač promašio]
Tačan odgovor bio je: [dijagnoza] → [korekcija]
Tvoj score: [N] / 3000
Streak rekord ove sesije: [N]
[Pokušaj ponovo] [Podeli rezultat]
```

### Win ekran (10 rundi završeno)
```
"Klub je spreman. Tonket kaže: dobar zvuk."
Finalni score: [N] / 3000
Rang: [Početnik Tonac / Solidan Tonac / Majstor Zvuka / Legenda Probe]
  — Početnik: 0–999 | Solidan: 1000–1999 | Majstor: 2000–2599 | Legenda: 2600+
[Podeli] [Nova proba]
```

### Share string
```
🎚️ Zvučna Proba | Kluboslavija 2026
Score: [N]/3000 | Streak: [N] | Rang: [rang]
Možeš li i ti uhvatiti problem? [URL]
```

---

*GDD v1.0 — sve vrednosti su implementacijske, ne aproksimacije. Svaka promena parametara zahteva verzioniranje dokumenta.*
