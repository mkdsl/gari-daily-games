# GDD — Pakuj Torbu: Avala Edition
_Stil: Mile — detaljna mehanika_

---

## Tabela predmeta

| ID | Naziv | Emoji | Shape | Boja | Required | Bodovi |
|----|-------|-------|-------|------|----------|--------|
| karta | Karta | 🏟 | 1×2 | #FFD700 | DA | 50 |
| cup | Časa | ♻ | 1×1 | #4FC3F7 | DA | 30 |
| sluskalice | Slušalice | 🎧 | L-shape 2×2 | #BA68C8 | DA | 40 |
| sunblock | Krema | ☀ | 2×1 | #FFB74D | DA | 20 |
| boca | Boca | 💧 | 3×1 | #29B6F6 | DA | 35 |
| kabel | Kabel | 🔌 | 1×2 | #78909C | DA | 25 |
| jakna | Jakna | 🧥 | 2×3 | #66BB6A | NE | 60 |
| powerbank | Powerbank | 🔋 | L-shape | #EF5350 | NE | 30 |
| naocare | Naočare | 😎 | 1×2 | #26C6DA | NE | 20 |
| grickalice | Grickalice | 🍫 | 2×1 | #A1887F | NE | 15 |
| kes | Novčanik | 👛 | L-shape | #EC407A | NE | 25 |
| narukvica | Narukvica | ✨ | 1×3 | #FFEE58 | NE | 20 |

---

## Level tabela

| Level | Vreme | Grid | Required items | Bonus items |
|-------|-------|------|----------------|-------------|
| 1 | 90s | 6×6 | karta, cup, sluskalice, boca | naocare, grickalice |
| 2 | 75s | 6×7 | + sunblock | + powerbank, narukvica |
| 3 | 70s | 6×8 | + kabel | + jakna, naocare |
| 4 | 65s | 6×8 | isti kao 3 | + powerbank, narukvica (više bonus) |
| 5 | 60s | 6×8 | + kes | + svi bonus |

---

## Scoring formula

```
score = Σ placed_item.points
      - (missed_required_count × 30)
      + (allRequiredPacked ? 100 : 0)
      + floor(timeLeft) × 1

final = max(0, score)
```

---

## Grade thresholds

| Score | Grade | Poruka |
|-------|-------|--------|
| ≥ 300 | Savršeno pakovanje | Sišao si na Avalu ko profesionalac! |
| ≥ 150 | Solidno | Možeš na Avalu, ali ćeš nešto zaboraviti... |
| < 150 | Nosi manje — živiš bolje | Avala teče bez torbe? Možda... |

---

## Timer balance

- Level 1 (90s): Dovoljno za sve required + 1-2 bonus
- Level 2 (75s): Tight ako se ne zna rotacija
- Level 3-4 (65-70s): Profesionalac tempo
- Level 5 (60s): Speed-run territory

Urgent zone: < 10s → timer pulsira crveno + tick zvuk svake sekunde.

---

## Progression kriva

```
Difficulty:
5 |          *
4 |       *
3 |     *
2 |   *
1 | *
  +--+--+--+--+--
    1  2  3  4  5  Level
```

Grid raste (36 → 42 → 48 ćelija), required items raste (4 → 7), vreme pada (90 → 60s). Kod level 3 ukupna količina potrebnih ćelija je ~15-16, grid je 48 ćelija — postoji dovoljno prostora za sve ali raspored zahteva planiranje.

---

## Grid fizika

- **Rotacija:** 90° clockwise. Svaki predmet se može rotovati u 4 orijentacije (ali neke su identične za simetrične shape-ove).
- **Placement:** Click-to-select, click-to-place. Ghost preview (semi-transparent overlay) pokazuje gde će predmet sleteti. Zeleno = može, crveno = kolizija.
- **Collision:** Ćelija u backpack grid-u može biti: null (prazna) ili itemId string (zauzeta). `canPlace` šeta sve cells u currentShape, proverava bounds i nullness.
- **Remove:** Predmet se može ukloniti iz grida klikom na njega u gridu (desna sekcija) — vraća se u panel.
