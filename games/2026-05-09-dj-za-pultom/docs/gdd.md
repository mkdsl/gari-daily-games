# GDD — DJ za Pultom
**Verzija:** 1.0 | **Datum:** 2026-05-09 | **Autor:** Mile Mehanika

---

## 1. Core Brojevi

### crowd_energy
- Tip: `float`, opseg `0.0–100.0`
- Inicijalna vrednost: `50.0`
- Win uslov: `crowd_energy > 0.0` kada `elapsed_time >= 21600s` (6h)
- Fail uslov: `crowd_energy <= 0.0` u bilo kom trenutku

### Pasivni pad po sekundi (po zoni)
| Zona | Vreme (real) | Pad/s (bez upgrades) | Multiplikator |
|---|---|---|---|
| Zagrevanje | 0–2h | `0.030` | ×1.0 |
| Vrhunac | 2–4h | `0.050` | ×1.5 |
| After Hours | 4–6h | `0.075` | ×2.0 |

Formula: `crowd_energy -= (base_drain - passive_retention) * zone_mult` svake sekunde.
`passive_retention` = suma svih kupljenih upgrade efekata (u energy/s).

### Klik — "Next Track"
- Bonus: `+2.5` crowd_energy po kliku
- Cooldown: **3 sekunde** (vizuelni feedback: dugme se deaktivira)
- Klik je NE OBAVEZAN — igrač može pobediti bez ijednog klika ako su upgrades dovoljni
- Klik ne daje Music Coins direktno; samo energy

### Music Coins (MC)
- Pasivni prihod: `1.0 MC/s` (uvek, od starta)
- Klik bonus: `+5 MC` po kliku (isti 3s cooldown deli se s energy bonusom — jedan klik = oba efekta)

---

## 2. Upgrade Tabela

| ID | Naziv | Efekat (energy/s) | Cena (MC) | Zona |
|---|---|---|---|---|
| U01 | Bolji USB stick | +0.010 /s | 30 | Zagrevanje |
| U02 | Hidratantni balzam | +0.015 /s | 80 | Zagrevanje |
| U03 | Backup laptop | +0.020 /s | 180 | Zagrevanje |
| U04 | Bežični in-ear monitor | +0.028 /s | 350 | Zagrevanje |
| U05 | Smoke machine | +0.035 /s | 650 | Vrhunac |
| U06 | Laser show sync | +0.045 /s | 1200 | Vrhunac |
| U07 | Crowd hype mic | +0.055 /s | 2200 | Vrhunac |
| U08 | Energy drink sponzor | +0.070 /s | 4000 | After Hours |
| U09 | Avala kolaboracija | +0.090 /s | 7500 | After Hours |
| U10 | Legendarni turntable | +0.120 /s | 14000 | After Hours |

**Formula rasta cene** (za eventualne buduće proširke): `next_cost = base_cost * 1.15^n` (n = broj već kupljenih upgrades u istoj zoni).

Svaki upgrade se kupuje **samo jednom**. Kupovina postaje dostupna ulaskom u zonu ili odmah ako igrač ima dovoljno MC.

---

## 3. Progression Curve

- **Min 1:** Igrač ima ~60 MC, može kupiti U01. Energy pada ~0.03/s → -1.8/min. Klikom nadoknađuje 2.5 na 3s.
- **Min 5:** S U01+U02, retention 0.025/s. Net pad ~0.005/s — gotovo neutralno u Zagrevanju.
- **Min 15:** Ulazi u Vrhunac, pad skače na ×1.5. Bez U05/U06 energija opada; igrač mora klikovati aktivno.
- **Min 30:** Treba 3–4 Vrhunac upgrades da ostane neutralan. MC su oskudni — bira se redosled.
- **Min 60+:** After Hours zahteva sva 3 kasna upgrades + aktivno klikanje. Igrač nikad nije "siguran".

**Zašto igra nije rešena za 10 min:** Net drain u Zagrevanju je maleno pozitivan, ali Vrhunac (×1.5) i After Hours (×2.0) povećavaju potreban retention daleko iznad onoga što je dostupno u prvoj zoni. Igrač fizički ne može skupiti MC za kasne upgrades pre nego što uđe u te zone.

---

## 4. Offline Progress Formula

```
offline_seconds = min(now - last_save_timestamp, 1800)  // cap: 30 min
mc_earned      = 1.0 * offline_seconds
energy_delta   = (passive_retention - zone_drain) * offline_seconds
crowd_energy   = clamp(crowd_energy + energy_delta, 0.0, 100.0)
```

**Čuva se** (localStorage / save state): `crowd_energy`, `music_coins`, `elapsed_time`, `purchased_upgrades[]`, `last_save_timestamp`.

**Ne čuva se:** BPM fluktuacija (real-time vizual only, nema uticaja na mehaniku).

Fail u offline modu nije moguć — energija se clampuje na 0.0 i prikazuje se poruka "Smena je bila napeta dok nisi bio tu."

---

## 5. Win / Fail State

**Win:** `elapsed_time >= 21600` AND `crowd_energy > 0.0`
**Fail:** `crowd_energy <= 0.0` (u bilo kom trenutku)

### End Screen sadržaj
| Polje | Vrednost |
|---|---|
| Vreme preživljeno | `MM:SS` od starta |
| Peak zona dosegnuta | naziv zone (Zagrevanje / Vrhunac / After Hours) |
| Total karata odsviranih | broj klikova na "Next Track" |
| Ukupno MC zaradjeno | suma svih MC tokom sesije |

### Auto-generated share tekst
**Win:** `"Odslužio sam 6h smenu bez incidenta. Floor je bio pun. 🎧 #DJzaPultom"`
**Fail (zona):** `"Floor se ispraznio u [ZONA] nakon [MM:SS]. Sledeći put — bolji USB. #DJzaPultom"`

---

## 6. HUD Wireframe — 375px Mobile

```
┌─────────────────────────────────┐
│  ⏱ 01:23:45   🎵 1,240 MC      │  ← TOP BAR: sat (real-time) + coins
│  ████████████░░░  72% ENERGY    │  ← ENERGY BAR (full width, color-coded)
│  Zona: VRHUNAC  ×1.5            │  ← zona badge
├─────────────────────────────────┤
│                                 │
│        [   DJ PULT   ]          │  ← CENTER: vizuelizacija (BPM pulse)
│                                 │
│    [ ▶ NEXT TRACK  ]            │  ← CTA dugme (disabled 3s nakon klika)
│                                 │
├─────────────────────────────────┤
│  UPGRADES ▲  (drawer, swipe up) │  ← BOTTOM DRAWER
│  U01 ✓  U02 ✓  U03 [180 MC]    │
│  U04 [350 MC]  U05 🔒           │
└─────────────────────────────────┘
```

- Upgrade panel: **bottom drawer**, swipe-up ili tap na "UPGRADES ▲"
- Zaključani upgrades (pogrešna zona) prikazuju se sa 🔒 i sivim bojama
- Sat kuca u realnom vremenu sesije (ne offline vreme)

---

## 7. Pacing po Minutama

| Vreme | Event |
|---|---|
| 0:00 | Start. `energy=50.0`, zona: Zagrevanje, pad: 0.030/s |
| 0:30 | ~30 MC — može kupiti U01 (+0.010/s). Net pad: 0.020/s |
| 1:20 | ~80 MC — U02 dostupan. Net pad: 0.005/s (gotovo neutralno) |
| 3:00 | ~180 MC — U03. Net pad: pozitivan! Energy raste lagano |
| 5:30 | ~350 MC — U04. Zagrevanje potpuno pokriveno |
| 10:00 | Ulaz u Vrhunac. Pad ×1.5. Net pad ponovo negativan |
| 15:00 | ~650 MC — U05 (Smoke machine). Delimično pokrivanje |
| 22:00 | ~1200 MC — U06. Energy stabilnija |
| 35:00 | ~2200 MC — U07. Vrhunac skoro pokriven |
| 40:00 | Ulaz u After Hours. Pad ×2.0. Kritična faza |
| 50:00 | ~4000 MC — U08. Postaje urgentno za preživljavanje |
| 65:00 | ~7500 MC — U09 (Avala). Avala hint se pojavljuje u backgroundu |
| 90:00 | ~14000 MC — U10. Maksimalni retention, win je izvodljiv bez klika |
| 6:00:00 | Win check: `elapsed >= 21600 AND energy > 0` |
