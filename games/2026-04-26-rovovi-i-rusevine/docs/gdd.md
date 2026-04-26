# GDD — Rovovi i Ruševine

## Pregled Sistema

Taktička igra na 2D gridu. Igrač komanduje odredom (3 vojnika) koji mora probiti 3 linije rovova za max 20 poteza. Svaki potez: igrač zadaje akcije → turn engine ih rešava sekvencijalno → animacije prikazuju rezultat kao "simultano". AI neprijatelja je deterministički konačan automat (bez lookaheada).

Sistemi: `grid` (stanje mreže), `entities` (igrač + neprijatelji), `turn` (rešavanje poteza), `ai` (AI logika), `render` (Canvas + DOM), `ui` (HUD), `input` (miš/touch).

---

## Grid i Tereni

- **Dimenzije:** 12 kolona × 8 redova (konfigurabilno u `config.js`)
- **Orijentacija:** X=kolone (0-11), Y=redovi (0-7). Y=0 je gornji red (pozadina neprijatelja), Y=7 je donji red (startna zona igrača)
- **Ćelija state shape:**
  ```js
  { type: 'OPEN'|'TRENCH'|'RUBBLE'|'BLOCKED', occupant: null|unitId, visible: true }
  ```
- **Tipovi terena:**
  | Tip | Opis | Efekat |
  |---|---|---|
  | OPEN | Prazno polje, blato | Kretanje normalno |
  | TRENCH | Rov (horizontalna linija) | Odbrana +1 HP dok je jedinica u rovu |
  | RUBBLE | Ruševina | Blokira kretanje, ne blokira pucanje |
  | BLOCKED | Zid/jama | Blokira sve |

- **Layout po linijama rovova:**
  - Y=6: Startna pozicija igrača (OPEN)
  - Y=4: Linija 1 (TRENCH, neprijatelji)
  - Y=2: Linija 2 (TRENCH, neprijatelji)
  - Y=0: Linija 3 (TRENCH, neprijatelji)
  - Između linija: OPEN i RUBBLE (random seed, 20% RUBBLE)

---

## Jedinice (Entiteti)

| Tip | Strana | HP | Kretanje | Napad range | Napad šteta | Spec |
|---|---|---|---|---|---|---|
| Vojnik | Igrač | 3 | 2 ćelije | 1-2 | 1 | Može jurišati (melee, besplatno) |
| Pešak | Neprijatelj | 2 | 1 ćelija | 1 | 1 | — |
| Mitraljezac | Neprijatelj | 3 | 0 | 1-3 | 1 (2× po potezu) | Ne može se kretati |
| Oficir | Neprijatelj | 1 | 1 | 0 | 0 | Buff: +1 max HP susednim jedinicama dok je živ |
| Artiljerac | Neprijatelj | 4 | 0 | Ceo grid | 1 (radius 1) | Puca svaki 3. potez na random poziciju igrača |

**Igrač počinje sa:** 3 Vojnika na Y=6 (X=3, 5, 7).
**Spawn neprijatelja:** definisan po liniji (vidi Progression).

---

## Akcije Igrača

Po potezu, svaka jedinca može izvršiti jednu akciju:

| Akcija | Cena (meci) | Efekat | Ograničenje |
|---|---|---|---|
| Pomeranje | 0 | Pomeri do 2 ćelije (orthogonal) | Ne može na RUBBLE/BLOCKED/occupied |
| Pucanje | 2 | 1 šteta, range 1-2 (orthogonal+dijagonal) | Potrebna slobodna linija vidljivosti |
| Jurišanje | 0 | 1 šteta, igrač gubi 1 HP | Samo adjacent ćelija (range 1) |
| Dimna zavesa | 3 | Neprijatelji u 2×2 zoni oko odabrane ćelije preskipu 1 potez (STUNNED) | 1× po potezu ukupno, ne per-vojnik |

**Zašto ovaj balans:**
- Pucanje (2 meci) ograničava agresiju — 20 metaka / 2 = max 10 hitova, dovoljno za 15 neprijatelja uz malo jurišanja
- Jurišanje (besplatno, 1 HP cena) daje izbor igraču koji je ostao bez metaka — nije instant-lose
- Dimna zavesa (3 meci) je skuplja ali game-changing — rezervisana za krizne momente

---

## Ekonomija Municije

- **Početna vrednost:** 20 metaka
- **Trošak po potezu (tipičan igrač):** 3-5 metaka (1-2 pucanja + moguća dimna zavesa)
- **Tipičan pobednički run (12-15 poteza):** 12-16 metaka potrošeno, ostaje 4-8
- **Hard floor:** 0 (jurišanje je uvek dostupno, gubi HP)
- **Regeneracija:** nema — municija je pressure mehanika
- **Municija se prikazuje u HUD-u kao brojač** — igrač uvek zna stanje

---

## AI Konačan Automat

Svaka neprijateljska jedinica ima state: `HOLD | RETREAT | ATTACK | REINFORCE | ARTILLERY`

### Prelazi (deterministički, evaluirani ovim redom svaki potez):

```
1. Ako je Artiljerac → pređi u ARTILLERY state ako je (potezBroj % 3 === 0), inače HOLD
2. Ako je igrač u range-u napada → ATTACK
3. Ako je napadnut s boka (igrač na istom Y ±1 X) → RETREAT (pomeri se na Y+1 ako slobodna, inače HOLD)
4. Ako je slobodna ćelija iza fronta i linija < 50% HP → REINFORCE (spawn pešaka, 1× per linija per potez)
5. Default → HOLD
```

### Akcije po stanju:
| State | Akcija |
|---|---|
| HOLD | Ostaje na mestu, eventualno puca ako je igrač u range-u |
| RETREAT | Pomeri se za 1 ćeliju prema Y+1 (dalje od igrača) |
| ATTACK | Pomeri se za 1 ćeliju prema igraču ili pucaj |
| REINFORCE | Spawn 1 pešak na slobodnoj ćeliji iza fronta (Y+1 od linije) |
| ARTILLERY | Odaberi random vojnika igrača, nanesite 1 štetu svim jedinicama u radius 1 |

**Bez randomizma u kretanju** — AI je 100% predvidiv za iskusnog igrača, ali ne i za novog. Ovo je "genijalni komandir" loop iz koncepta.

---

## Turn Engine — Redosled Rešavanja

Sekvencijalno rešavanje koje se vizuelno prikazuje kao simultano (animacije se play-uju sve zajedno na kraju):

```
Faza 1: Sakupi igrač-akcije (već zadane pre "Potez!" klika)
Faza 2: SMRT — ukloni sve sa HP≤0
Faza 3: KRETANJE IGRAČA — izvrši move akcije (collission check: occupied ćelija = cancel)
Faza 4: AI ODLUKA — svaka neprijateljska jedinica evaluira stanje automata
Faza 5: KRETANJE NEPRIJATELJA — izvrši AI move akcije
Faza 6: NAPAD IGRAČA — izvrši pucanje/jurišanje igrača
Faza 7: NAPAD NEPRIJATELJA — izvrši pucanje neprijatelja
Faza 8: SMRT PONOVO — ukloni sve sa HP≤0
Faza 9: PROVERI LINIJU — ako sve neprijateljske jedinice na liniji uklone, označi liniju kao "cleared"
Faza 10: GENERIŠI ANIMACIONE EVENTE — lista event-a za render (move, hit, death, spawn)
```

**Conflict resolution:** Ako dva vojnika hoće istu ćeliju — prvi u listi dobija, drugi cancel. Igrač ima prioritet nad AI.

---

## Fog of War

**`flag: false`** — sve ćelije su vidljive u prvoj verziji. Implementaciona kompleksnost nije opravdana za scope jednog dana. Može se dodati kao v2 feature.

---

## Progression — 3 Linije Rovova

| Linija | Y koordinata | Neprijatelji | Nova mehanička varijabla | Cilj učenja |
|---|---|---|---|---|
| **1** | Y=4 | 4 pešaka | Osnove — kretanje, pucanje, rov-bonus | Nauči kontrole |
| **2** | Y=2 | 3 pešaka + 2 mitraljezca | Mitraljezac: range 3, ne pomera se → igrač mora flankirati | Flankiranje i pozicioniranje |
| **3** | Y=0 | 2 pešaka + 1 oficir + 1 artiljerac | Oficir buff + Artiljerija svaki 3. potez → prioritet target | Resource management + target priority |

**Između linija:** 3-4 OPEN ćelije za napredovanje. Linija se "čisti" kad sve neprijateljske jedinice na njenom Y redu budu eliminisane.

---

## Ocenjivanje (S/A/B/C)

Računato na kraju runa (pobeda ili poraz):

| Ocena | Uslov |
|---|---|
| **S** | Pobeda + potezi ≤12 + meci ≥8 + svi vojnici živi |
| **A** | Pobeda + potezi ≤16 + meci ≥3 |
| **B** | Pobeda + potezi ≤20 |
| **C** | Pobeda ali ≥1 vojnik izgubljen ili 0 metaka |
| **Poraz** | Svi vojnici mrtvi ILI potezi = 20 a nismo probili sve 3 linije |

**Zašto ovi pragovi:**
- S zahteva near-perfect play (Dimna zavesa + flankiranje od prvog poteza)
- A je dostupno iskusnom igraču posle 2-3 pokušaja
- B je garancija da igrač ne napusti frustriran — svaka pobeda vredi
- C postoji da nagradi igrača koji je pobedio ali skupo

---

## Pacing Kriva

| Potezi | Faza | Šta se dešava |
|---|---|---|
| 1-4 | Linija 1 — Tutorial | 4 pešaka, nema specijalnih. Igrač uči kretanje i pucanje. Pritisak nizak. |
| 5-8 | Linija 2 — Taktika | Mitraljezci blokiraju direktan napad. Igrač mora da flankirа. Municija počinje da se troši. |
| 9-13 | Linija 3 — Kriza | Oficir buff-uje. Artiljerija svaki 3. potez. Igrač mora da prioritizuje targetove. |
| 14-20 | Endgame | Municija kritično niska. Jurišanje postaje opcija. Svaki potez je odluka. |

---

## Win/Lose Uslovi

**Pobeda:** Sve 3 linije rovova očišćene (sve neprijateljske jedinice na Y=4, Y=2, Y=0 eliminisane) u ≤20 poteza.

**Poraz:**
- Svi 3 vojnika igrača su mrtvi (HP=0)
- Ili potezBroj = 20 i nije probijena barem jedna linija

**Kraj runa:** Prikaži score screen sa ocenom, statistikama (potezi, meci potrošeni, vojnici izgubljeni) i dugmetom "Pokušaj ponovo".

---

## Mobile Layout

- **Desktop (≥600px):** Canvas 720×480px, ćelija 60×60px, 12×8 grid
- **Mobile (<600px):** Canvas = floor(screenW × 0.98) × floor(screenW × 0.65), ćelija = floor(canvasW/9)px, prikazuje se 9 kolona × 6 redova (kamera klizi horizontalno/vertikalno prema selekciji)
- **Akcije (DOM toolbar):** Fiksiran na dnu ekrana na mobile — 4 dugmeta: Pomeri / Pucaj / Juriš / Dim
- **Touch flow:** Tap na vojnika = selekcija (highlight) → Tap na target ćeliju = akcija potvrđena → "Potez!" dugme
- **Hover (desktop):** Mousemove prikazuje tooltip sa info o ćeliji/jedinici
