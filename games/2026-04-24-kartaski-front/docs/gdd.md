# GDD — Kartaški Front

## 1. State Machine

### Enum stanja
```
PLAYER_TURN → igrač igra karte
RESOLVING   → karte se primenjuju (kratka pauza, klikovi zablokirani)
ENEMY_TURN  → neprijatelj izvršava intent
REWARD      → igrač bira novu kartu
MAP         → prikaz mape (izbor sledećeg čvora — samo 1 path, linear)
GAME_OVER   → run završen porazom
VICTORY     → sva 4 čvora pobedjena
```

### Transition tabela
| Iz stanja  | Uslov                                  | U stanje   |
|------------|----------------------------------------|------------|
| MAP        | Klik na čvor                           | PLAYER_TURN|
| PLAYER_TURN| Klik "Kraj runde"                      | RESOLVING  |
| RESOLVING  | applyCards() završen (sync, bez delay) | ENEMY_TURN |
| ENEMY_TURN | applyEnemyIntent() završen             | PLAYER_TURN (ako niko nije mrtav) |
| ENEMY_TURN | igrač HP ≤ 0                           | GAME_OVER  |
| PLAYER_TURN| neprijatelj HP ≤ 0                     | REWARD (ako čvor < 4) ili VICTORY |
| REWARD     | Igrač klikne kartu                     | MAP (ako čvor < 4) ili VICTORY    |

**Pravilo:** Svaki click handler PRVO proverava `state.phase === 'PLAYER_TURN'`. Ako nije — ignoriše klik.

---

## 2. Starter Deck (10 karata)

| Naziv          | Tip    | Cost | Efekat                              |
|----------------|--------|------|-------------------------------------|
| Šamar          | Attack | 1    | Nanese 6 damage                     |
| Blok           | Block  | 1    | Dodaj 5 Shield                      |
| Ubod           | Attack | 1    | Nanese 4 damage                     |
| Odupiranje     | Block  | 1    | Dodaj 4 Shield                      |
| Guranje        | Attack | 2    | Nanese 9 damage                     |
| Štit           | Block  | 2    | Dodaj 8 Shield                      |
| Udar           | Attack | 1    | Nanese 5 damage                     |
| Oprez          | Block  | 1    | Dodaj 5 Shield                      |
| Taktika        | Effect | 2    | Sledeći napad igrača +4 damage      |
| Odmor          | Effect | 0    | Igrač povrati 3 HP (max HP cap)     |

**Starter deck: 6× Attack, 3× Block, 1× Effect. Min 6 karata sa cost 1.**

---

## 3. Kompletna Karta Biblioteka (20 karata + 10 starter = 20 unique)

### Starter karte (gore) — nisu u reward pool-u.

### Reward karte (10 karata):

| Naziv           | Tip    | Cost | Efekat                                        | Reward od čvora |
|-----------------|--------|------|-----------------------------------------------|-----------------|
| Dvojni Udar     | Attack | 2    | Nanese 7 damage dva puta (14 ukupno)          | 1, 2            |
| Bled            | Effect | 1    | Neprijatelj dobija Poison 2 (2 dmg/rundi, 3r) | 1               |
| Regen Touch     | Effect | 1    | Igrač dobija Regen 2 (2 HP/rundi, 2r)        | 1               |
| Gvozdeni Zid   | Block  | 2    | Dodaj 12 Shield                               | 2               |
| Burn Touch      | Effect | 1    | Neprijatelj dobija Burn 2 (2 dmg/rundi, 3r)  | 2               |
| Slabost         | Effect | 1    | Neprijatelj dobija Weak 2 runde               | 2               |
| Oluja           | Attack | 3    | Nanese 25 damage                              | 3               |
| Čelični Oklop   | Block  | 3    | Dodaj 20 Shield                               | 3               |
| Lančani Burn    | Effect | 2    | Burn 3 (3 dmg/rundi, 4r) neprijatelju        | 3               |
| Vampirizam      | Attack | 2    | Nanese 10 damage, igrač povrati 5 HP          | 3               |

---

## 4. DoT Timing Pravila

Svi efekti tiku na KRAJU VLASNIKOVE RUNDE (pre nego što protivnik odigra intent).

| Efekat  | Stack? | Max slogova | Trajanje   | Tick kada            | Formula           |
|---------|--------|-------------|------------|----------------------|-------------------|
| Burn    | Ne     | 1           | N rundi    | Kraj vlasnikove runde | flatDmg po tipu   |
| Poison  | Ne     | 1           | N rundi    | Kraj vlasnikove runde | flatDmg po tipu   |
| Weak    | Ne     | 1           | N rundi    | Pasivno              | Attack dealer -25% |
| Regen   | Ne     | 1           | N rundi    | Kraj vlasnikove runde | flatHeal po tipu  |

**Vrednosti:** Burn 2 = 2 dmg/rundi, Burn 3 = 3 dmg/rundi. Poison iste vrednosti.  
**Weak:** dok je aktivan, SVE napad karte -25% damage (round down).  
**Regen:** leči igrača, max do maxHP (30).  
**Trajanje** = broj rundi koji stoji u card efektu. Smanjuje se za 1 svake runde vlasnika.

```js
// Redosled na kraju igrača runde:
applyPlayerEndOfTurn(state) {
  applyDoT(state.player, 'regen');  // Regen leči igrača
  state.player.shield = 0;          // Shield se resetuje
  state.player.effects.forEach(e => e.duration--);
  state.player.effects = state.player.effects.filter(e => e.duration > 0);
}
// Redosled na kraju neprijateljevog intent:
applyEnemyEndOfTurn(state) {
  applyDoT(state.enemy, 'burn');
  applyDoT(state.enemy, 'poison');
  state.enemy.shield = 0;
  state.enemy.effects.forEach(e => e.duration--);
  state.enemy.effects = state.enemy.effects.filter(e => e.duration > 0);
}
```

---

## 5. Neprijatelji

| Naziv      | HP | Vizuelna boja | Runda 1              | Runda 2            | Runda 3             | Specijal                          |
|------------|----|--------------|-----------------------|--------------------|---------------------|-----------------------------------|
| Gremlin    | 20 | #8888aa (siva)| Attack 6             | Attack 6           | Attack 6            | Nema — čisto attack svaku rundu   |
| Ratnik     | 35 | #aa8844 (žuta)| Block 8              | Attack 10          | Attack 12           | Altern. blok/napad                |
| Čuvar      | 45 | #44aa88 (teal)| Attack 8             | Buff (Weak player) | Attack 14           | Svaka 3. runda: Weak na igrača    |
| Boss Nekromajer | 70 | #cc3333 (crvena) | Attack 12    | Attack 8 + Burn 2  | Block 10           | Svaka 4. runda: Attack 18 (FINALI)|

**Intent prikaz:** Ikona iznad neprijatelja — mač (attack), štit (block), skull (debuff/buff).

**Looping pattern:** Runda 4 = runda 1 za sve neprijatelje osim bossa (boss ima Finali u rundi 4).

---

## 6. Formule

```
// Damage kalkulacija
effectiveDamage(card, attacker, target):
  base = card.damage
  if attacker.effects.includes('weak') → base = floor(base * 0.75)
  dmg = max(0, base - target.shield)
  target.shield = max(0, target.shield - base)
  target.hp -= dmg

// Shield reset: na kraju SVAKE runde igrača (u applyPlayerEndOfTurn)
state.player.shield = 0

// HP max igrača: 30, min 0
// HP nikad ne ide ispod 0 (clamp)

// Highscore formula:
score = (state.player.hp * 10) + (state.totalDamageDealt / 5) + (state.node * 50)
```

---

## 7. UI Layout

```
┌──────────────────────────────────────────────────┐
│ Čvor: 1/4          [Energija: 3/3] [Kraj runde]  │ ← toolbar (10% visine)
├──────────────────────────────────────────────────┤
│                                                  │
│   [NEPRIJATELJ]              [IGRAČ]            │ ← Canvas battlefield (50% visine)
│   HP: ████░░░              HP: ████████         │
│   [⚔ intent ikona]          Shield: 5           │
│   Gremlin                   Mađioničar           │
│                                                  │
├──────────────────────────────────────────────────┤
│  [KARTA] [KARTA] [KARTA] [KARTA] [KARTA]         │ ← DOM karte (40% visine)
│  Šamar   Blok    Ubod    Štit   Taktika          │
│  Cost:1  Cost:1  Cost:1  Cost:2  Cost:2          │
└──────────────────────────────────────────────────┘
```

**Karte:** DOM `<div>` sa klasama `.card`, `.card-attack`, `.card-block`, `.card-effect`.  
Klik na kartu = odigraj (ako ima energije). Vizuelni feedback: `opacity: 0.4` kad nema energije.  
**Canvas:** Gornja zona — crta neprijatelja (levo), igrača (desno), HP trake, intent ikonu.  
**Intent ikona:** ⚔ = attack, 🛡 = block, ☠ = debuff — nacrtano Canvas textom ili jednostavnom geometrijom.

---

## 8. Reward Pool i Progression

```
Čvor 1 → ponudi 3 random od: [Bled, Regen Touch, Dvojni Udar]
Čvor 2 → ponudi 3 random od: [Gvozdeni Zid, Burn Touch, Slabost, Dvojni Udar]
Čvor 3 → ponudi 3 random od: [Oluja, Čelični Oklop, Lančani Burn, Vampirizam]
Čvor 4 (boss) → nema reward (VICTORY screen)
```

Igrač uvek bira 1 od 3. Karte se ne ponavljaju u ponudi (shuffle bez ponavljanja).

---

## 9. Pacing Tabela

| Vreme     | Šta se dešava                                              | Aha momenat                    |
|-----------|-------------------------------------------------------------|--------------------------------|
| 0–30s     | Čvor 1: Gremlin. Igrač uči drag-karta-na-polje            | "Aha, igrač vuče 5 karata"     |
| 30–60s    | Kraj čvora 1, reward ekran — bira prvu kartu              | "Biram Bled — špil raste!"     |
| 60–120s   | Čvor 2: Ratnik. Intent pattern — treba da čita šta radi   | "Blokujem kad on blokira"       |
| 120–180s  | Čvor 3: Čuvar — Weak debuff komplikuje napad              | "Moram da save-ujem energiju"  |
| 180–420s  | Boss: Nekromajer — sve što si naučio, primeni              | Tenzija, finalni HP             |
| 420s+     | VICTORY ili GAME OVER + statistike runa                   | "Još jedan run!"                |

---

## 10. Game Over / Victory Ekran

```
GAME OVER:
- "Pao si na čvoru X/4"
- HP ostalo: 0
- Ukupna šteta nanesena: N
- Karte u špilu: M (lista)
- Score: N/A (poginuo)
- [NOVI RUN]

VICTORY:
- "POBEDNIK! Kartaški Front pokorava se tvom špilu!"
- HP ostalo: N
- Score: X
- Ukupno karata odigrano: M
- [NOVI RUN]
```

---

## 11. Tehnički Preduslovi za Implementaciju

1. **`state.phase`** — string enum, proverava se NA POČETKU svakog event handlera
2. **Karte su DOM `<div>` elementi** — Canvas se ne koristi za karte
3. **`state.deck`** — array karata u špilu (shuffle na start borbe)
4. **`state.hand`** — max 5 karata, draw na početku svake borbe (ne svake runde!)
5. **`state.discard`** — odigrane karte idu ovde; deck se refilluje iz discard kad isprazni
6. **`state.enemy.intentIndex`** — currentIndex % intentPattern.length za looping
7. **Auto-save** svake borbe u localStorage (ključ: `kartaski-front-save`)
