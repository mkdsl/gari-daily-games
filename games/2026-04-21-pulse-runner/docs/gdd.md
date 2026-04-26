# GDD — Pulse Runner

## Core Mehanike

### Grid
- Nivo 1: 7×7, 20% zidova, 3 collectibles
- Nivo 2-4: raste za 1 po dva nivoa, zidovi +3% po nivou
- Nivo 5+: max 12×12, 40% zidova, 2 collectibles
- Generisanje: random postavi zidove, ZATIM BFS od start do exit — ako nema puta, regeneriši (max 10 pokušaja)
- Start: uvek gornji levi 2x2 ugao random, Exit: uvek donji desni 2x2 ugao random

### Puls Sistem
- Puls interval formula: `max(0.65, 1.5 - (level - 1) * 0.09)` sekundi
- Input window: 80% puls intervala (igrač može da unese smer)
- Queued input: igrač unosi smer u bilo kom trenutku, izvršava se na SLEDEĆEM pulsu
- "Miss" = puls prođe a igrač nije uneo NIJEDAN input (ne "udario u zid")

### HP / Energija
- Počinje: 3 HP
- Collectible (zlatna ćelija) daje +1 HP, max 5
- Miss counter: 3 uzastopnih miss = GAME OVER
- Miss counter resetuje se kada igrač sakupi collectible ILI kada pređe nivo

### Score
- Formula: `depth * 100 + totalCollected * 25`
- Depth = broj pređenih nivoa
- High score u localStorage

### Level Transition
- Stigne do exit ćelije = novi nivo se generiše odmah (bez loading)
- Animacija: ekran flash tirkiznom bojom 0.5s

## Tabela Ekonomije

| Nivo | Grid  | Zidovi | Puls Interval | Collectibles | Napomena        |
|------|-------|--------|---------------|--------------|-----------------|
| 1    | 7×7   | 20%    | 1.50s         | 3            | Tutorial tempo  |
| 2    | 7×7   | 23%    | 1.41s         | 3            | Easy            |
| 3    | 8×8   | 26%    | 1.32s         | 3            | First pressure  |
| 4    | 8×8   | 29%    | 1.23s         | 3            | Getting fast    |
| 5    | 9×9   | 32%    | 1.14s         | 2            | Medium          |
| 6    | 9×9   | 35%    | 1.05s         | 2            | Hard start      |
| 7    | 10×10 | 37%    | 0.96s         | 2            | Pressure        |
| 8    | 10×10 | 38%    | 0.87s         | 2            | Expert          |
| 9    | 11×11 | 39%    | 0.78s         | 2            | Expert+         |
| 10+  | 12×12 | 40%    | 0.65s (cap)   | 2            | Endless hard    |

## Pacing po Minutama

- **0:00-0:30** — Tutorial nivo 1: igrač shvata puls mehaniku
- **0:30-1:30** — Nivo 2-3: zabavno, mali pritisak, collectibles dostupni
- **1:30-3:00** — Nivo 4-6: "aha momenat" (shvata routing strategiju unapred)
- **3:00-5:00** — Nivo 7-9: visoka tenzija, igrač fokusiran
- **5:00+** — Nivo 10+: endless grind za score, igrač umoran ali "još jedan"

## Win/Lose
- Lose: 3 uzastopna miss NA ISTOM NIVOU (counter resetuje na level transition i collectible)
- No "win" — roguelike je beskrajan, high score je meta-goal
- Game Over ekran: depth, score, personal best + RESTART dugme

## Edge Cases
- Refresh usred igre: vraća na main menu (localStorage samo high score)
- Input buffer: max 1 queued input (novi overwrites stari)
- BFS timeout: ako 10 regeneracija ne napravi solvable grid, smanjiti zidove za 5% i pokušati još 5x
