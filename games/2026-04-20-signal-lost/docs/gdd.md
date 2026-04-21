# GDD: Signal Lost

## 1. Grid Konfiguracija po Nivoima

| Nivo | Grid | Relay | Gate | Scrambler | OR-Splitter | Ukupno čvorova |
|------|------|-------|------|-----------|-------------|----------------|
| 1    | 5×5  | 16    | 6    | 1         | 0           | 23             |
| 2    | 5×5  | 14    | 7    | 2         | 0           | 23             |
| 3    | 5×5  | 13    | 7    | 2         | 1           | 23             |
| 4    | 5×5  | 12    | 8    | 2         | 1           | 23             |
| 5    | 5×5  | 11    | 8    | 3         | 1           | 23             |
| 6    | 6×6  | 22    | 9    | 3         | 1           | 35             |
| 7    | 6×6  | 20    | 10   | 3         | 2           | 35             |
| 8    | 6×6  | 18    | 11   | 4         | 2           | 35             |
| 9    | 6×6  | 17    | 11   | 4         | 3           | 35             |
| 10   | 6×6  | 15    | 12   | 5         | 3           | 35             |
| 11   | 7×7  | 28    | 13   | 5         | 3           | 49             |
| 12   | 7×7  | 26    | 14   | 5         | 4           | 49             |
| 13   | 7×7  | 24    | 15   | 6         | 4           | 49             |
| 14   | 7×7  | 22    | 16   | 6         | 5           | 49             |
| 15   | 7×7  | 20    | 17   | 7         | 5           | 49             |

## 2. Signal Brzina

Signal se kreće čvor po čvor. Brzina = ms između koraka (manja vrednost = brži signal).

| Nivo | ms/čvor | Napomena |
|------|---------|----------|
| 1    | 1500    | Spor, udoban |
| 3    | 1300    | |
| 5    | 1100    | |
| 7    | 900     | Počinje da pritiska |
| 9    | 750     | |
| 11   | 650     | Brz |
| 13   | 550     | |
| 15   | 450     | Hard cap — ne ide ispod 400ms |

**Formula:** `speed(n) = max(400, 1600 - (n * 80))` ms/čvor

**Slow Signal power-up:** privremeno dodaje +600ms/čvor, traje 5 čvorova (jednokratan).

## 3. Power-Up-ovi

Power-up se nudi na nivoima 3, 6, 9, 12. Igrač bira 1 od 3 nasumična.

| Power-Up    | Efekat | Trajanje / Ograničenje |
|-------------|--------|------------------------|
| Slow Signal | +600ms po čvoru (signal usporava) | Narednih 5 čvorova |
| Reveal      | Svi čvorovi pokazuju tip ikonom vidljivo (inače su sakriveni na višim nivoima) | 4 sekunde |
| Freeze      | Signal se potpuno pauzira | 2 sekunde |
| Time Bubble | Sve interakcije ubrzane 2× (igrač klika brže) | 6 sekundi |
| Echo        | Duplicira efekt sledećeg power-up-a koji se aktivira | Jednokratan |

**Pool:** Svaki run igrač može da skupi max 4 power-up-a (nivo 3, 6, 9, 12). Na nivou 6 i 11 (checkpointi) power-up-ovi dobijeni PRE checkpointa ostaju; oni posle checkpoint nivoa se gube pri death.

**Skriveni čvorovi:** Na nivoima 1-5 svi tipovi su vidljivi. Na nivoima 6-10 Gate/Scrambler su vidljivi, OR-Splitter je prikriven. Na nivoima 11-15 samo Relay je vidljiv, ostali prikazuju "?" — Reveal power-up ih otkriva na 4s.

## 4. Proceduralna Generacija — Solvabilnost

### Algoritam (garantovano solvabilan):

1. **Postavi start (gornji-levi) i cilj (donji-desni) čvor**
2. **Generiši validan put** od starta do cilja koristeći random walk (preferiraj kretanje ka cilju 70% koraka). Ovaj put postaje backbone.
3. **Na backbone čvorove postavi čvorove** — uglavnom Relay, ali nasumično umetni Gate i Scrambler po tabeli iz sekcije 1.
4. **Scrambler pravilo:** Scrambler se ne postavlja na čvor koji je jedini put za prolaz, i ne sme biti susedni sa OR-Splitter junction-om.
5. **OR-Splitter:** Postavlja se na backbone čvor gde postoje 2 alternativna puta ka cilju. Oba puta su validna (oba vode do cilja). Signal bira slobodan.
6. **Popuni ostale čvorove** mrežom — nasumično Relay i Gate čvorovi koji nisu na putu (decorative, ali klikabilni — ne utiču na signal).
7. **Validacija:** Pre prikazivanja, pokreni simulacioni check — prođi signal po svakom mogućem redosledu Gate klikova, potvrdi da postoji barem jedna kombinacija koja dovodi signal do cilja.

### Scrambler deadlock prevention:
- Scrambler menja samo Gate čvorove koji su DIREKTNI susedi (4-smerno, ne dijagonalno)
- Pre plasiranja Scrambler-a: simuliraj efekat (koje Gate-ove menja) — ako menjanje blokira JEDINI put, pomeri Scrambler na drugi čvor

## 5. Score Formula

```
finalScore = (level × 100) + (timeBonus) + (powerupsLeft × 75)

timeBonus = max(0, (targetTime - actualTime) × 5)
targetTime = level × 20  // sekundi (prosek 20s po nivou)
```

**Primer:** Igrač pobedi (15 nivoa), za 240s, ostao 2 power-up-a:
- `(15 × 100) + ((300 - 240) × 5) + (2 × 75) = 1500 + 300 + 150 = 1950`

**Highscore:** Čuva se u localStorage. Prikazuje se na win ekranu i death ekranu.

## 6. UX Flow

### Death Screen
```
[Crveni flash — 300ms]

SIGNAL LOST
━━━━━━━━━━━━━━━━━━━━
Nivo: 8 / 15
Skor: 742
Highscore: 1240

[ako postoji checkpoint]: Restartuj od Nivoa 6 →
[uvek]:                   Novi Run →
```
- "Restartuj od Nivoa 6" zadrži power-up-ove stečene do nivoa 6 (checkpoint)
- "Novi Run" briše sve i počinje od 1

### Checkpoint (vizuelni feedback)
Kada igrač završi nivo 6 ili 11:
- Zeleni puls oko cele mreže (500ms)
- Kratki tekst na vrhu ekrana: "CHECKPOINT SAVED — Nivo 6" (2s, fade out)
- Checkpoint čuva se u state-u (koji nivo, koji power-up-ovi)

### Win Screen
```
[Zeleni flash + animirani signal koji stiže do cilja]

SIGNAL RESTORED
━━━━━━━━━━━━━━━━━━━━
Svi 15 nivoa završeni!

Vreme: 3:42
Klikovi: 87
Power-up-ovi preostali: 1

Skor: 1890  ★ NEW HIGHSCORE ★

Igraj Ponovo →
```

## 7. Pacing po Minutama (Mock Sesija)

| Vreme | Šta se dešava |
|-------|---------------|
| 0:00  | Uvodni ekran "SIGNAL LOST — Pomozi sondi da nađe put kući". Klik/tap za start. |
| 0:05  | Nivo 1 — 5×5 grid, sve vidljivo, 1 Scrambler, signal spor. Igrač uči klikanjem. |
| 0:25  | Nivo 2-3 — malo više Gate čvorova, signal ubrzava neznatno. Power-up izbor posle nivoa 3. |
| 1:00  | Nivo 4-5 — OR-Splitter se uvodi, igrač mora birati koji put da ostavi slobodan. |
| 1:40  | Nivo 6 — checkpoint! Grid 6×6, feedback "CHECKPOINT SAVED". Power-up izbor. |
| 2:20  | Nivo 7-8 — OR-Splitter postaje prikriven, Reveal power-up postaje vredan. Pritisak raste. |
| 3:00  | Nivo 9-10 — Signal brz (~750ms/čvor). Igrač mora da planira unapred. Power-up na 9. |
| 3:45  | Nivo 11 — checkpoint! Grid 7×7, sve osim Relay-a skriveno. "?" čvorovi. |
| 4:30  | Nivo 12-13 — maksimalna kompleksnost, signal ~550ms/čvor. Adrenalin. |
| 5:00  | Nivo 14-15 — finale. Pobeda ili smrt. Prosečan igrač pogine negde ovde. |
| 5:30+ | Win screen ili death screen. "Još jedan run" loop počinje. |
