# Avala Run — Game Design Document

## Mehanika

### Kretanje
- Player X: fiksiran na 80px od leve ivice
- World scroll: desno->levo, brzina = 200 + distance x 0.025 px/s (max 600)
- Ground Y: canvas.height x 0.72

### Akcije
| Akcija | Desktop | Touch |
|--------|---------|-------|
| Skok | ArrowUp / Space / W | Tap gornja polovina |
| Duck | ArrowDown / S | Tap donja polovina |

### Skok
- Pocetna Y brzina: -420 px/s
- Gravitacija: 900 px/s2
- Jedna promena pravca (ne double jump)

### Duck
- Trajanje: 0.55s
- Hitbox visina: 22px (umesto 40px)

### Scoring
- Karta: +10 poena + 2s speed boost (+80 px/s)
- Svaka predjena udaljenost: +1 po 100px
- Trash: zasebni counter, ne utice na score

### Spawning
- Min gap: 280px, Max gap: 520px
- 20% sansa: Karta, 45%: Smece (random od 3 tipa), 35%: Prepreka (random od 4 tipa)

### Daily Highscore
- Dve liste: Top 3 score, Top 3 trash count
- Reset svako jutro (datum poredenje)

## Prepreke
| Tip | Zahteva | Velicina |
|-----|---------|----------|
| Bor | JUMP | 28x64px |
| Kamen | JUMP | 36x22px |
| Kamion | JUMP (visok) | 80x44px |
| Dron | DUCK | 36x16px, na visini 48px |

## Kolektibli
| Tip | Efekat | Velicina | Visina |
|-----|--------|----------|--------|
| Karta | +10 score, boost | 20x28px | ground-56px |
| Limenka | trash+1 | 16x24px | na tlu |
| Flasa | trash+1 | 12x28px | na tlu |
| Papir | trash+1 | 22x16px | ground-30px |
