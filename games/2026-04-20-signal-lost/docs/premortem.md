# Premortem: Signal Lost
**Analitičar:** Nemanja "Nega" Negovanović  
**Datum:** 2026-04-20  
**Status koncepta:** Sine Scenario v1.0

---

## 1. RAZUMI — Šta je ova igra zapravo

Signal Lost je **puzzle igra sa roguelike ljuskom**. Suština je statična: igrač gleda mrežu čvorova, dekodira koji čvorovi moraju biti u kom stanju pre nego signal prođe kroz njih, klikće da postavi to stanje — i čeka da vidi je li uradio pravo.

Signal koji putuje je **vizuelni tajmer**, ne mehanika per se. Igrač ne kontroliše signal — kontroliše **mrežu pre signala**. Ovo je bitna distinkcija: igra je zapravo turn-based puzzle sa animiranim pritiskom, ne action-timing igra.

Roguelike element je minimalan: 15 nivoa, permadeath, power-up pikovi na svakih 3 nivoa. Proceduralna generacija mreže po nivou. Nema metaprogresia, nema perzistentnih unlock-ova. Više je "endless puzzle" nego "roguelike" u pravom smislu.

**Sesija:** 3-5 min. **Hook:** "Vidim pretnju, znam rešenje, gledam sebe kako to izvršavam." Satisfakcija je vizuelna (signal prođe kroz správno postavljenu mrežu).

---

## 2. RASTAVI — Ključne pretpostavke

| # | Pretpostavka | Kritičnost |
|---|---|---|
| A | Mreža se uvek može rešiti (solvabilnost garantovana) | KRITIČNA |
| B | Igrač može da razume Scrambler interakcije intuitivno | VISOKA |
| C | Splitter mreža se uvek može rešiti bez konflikta | KRITIČNA |
| D | Timing pritisak je "stresan ali pravedan" | VISOKA |
| E | Proceduralna generacija daje raznovrsnost bez repeticije | SREDNJA |
| F | 2500 linija Vanilla JS je dovoljno za sve mehanike | VISOKA |
| G | Power-up izbori osećaju se kao strategija, ne kao kosmetika | SREDNJA |
| H | Casual igrač ostaje posle prvog fail-a | VISOKA |

---

## 3. NAPADNI — Šta može da pukne

### 3.1 Solvabilnost Splitter čvorova — SHOWSTOPPER

Splitter deli signal na dva puta. Oba puta moraju doći do cilja. Proceduralna generacija **ne garantuje** da oba puta mogu biti simultaneo validna.

**Scenario koji puca:** Oba splitter puta prolaze kroz isti Scrambler čvor. Aktiviranje Scrambler-a za jedan put — onemogućava drugi. Ovo nije edge case; u 7x7 gridu sa više Splitter-a i Scrambler-a, ovo je gotovo izvesno.

**Drugi problem:** Šta je "cilj" za split signal? Concept kaže "oba moraju doći do cilja" ali je u mrežnoj topologiji jedan cilj-čvor. Da li oba puta trebaju stići do **istog** čvora? Kako merge dva signala nazad? Ako ne merge — da li su oba podjednako aktivna? Šta se dešava ako jedan dođe, drugi ne?

Bez eksplicitnog algoritma koji garantuje solvabilnost pri generisanju, svaki run koji sadrži Splitter je **potencijalno neresiv**. Igrač ne može da zna da li je igra neresiva ili on griješi — a to je smrtni udarac za puzzle igru.

### 3.2 Scrambler semantika — neintuitivan dizajn

"Obrće logiku susednih čvorova" je nejasno. Pitanja koja igrač mora da shvati samostalno:
- Obrće trenutno stanje suseda, ili promeni ponašanje budućih klikova?
- Da li Scrambler utiče na sebe sama?
- Ako aktiviram Scrambler koji obrće Gate koji je već aktivan — da li Gate postaje neaktivan?
- Šta ako se dva Scrambler-a međusobno obrću?

Ovo je **klasičan case inverted-logic mehanike**: intuitivan kada ga developer osmisli, noćna mora kada ga igrač sretne po prvi put bez tutorial-a. Scrambler-Gate-Scrambler lance igrač neće moći da rezonuje bez alata (Reveal power-up). Ali Reveal je jednokratan power-up — ne tutorial alat.

**Rezultat:** Igrač će nasumično klikati i posmatrati efekte umesto da rezonuje. Ovo **razbija puzzle osećaj** i igru pretvara u trial-and-error timing igru.

### 3.3 Timing bez checkpointa — frustracija eskalira eksponencijalno

Concept: permadeath, restart od nivoa 1 pri grešci. 15 nivoa, svaki 15-20 sekundi = 4-5 minuta run.

**Problem:** Rani nivoi su trivijalni (5x5 grid, samo Relay i Gate). Igrač koji stigne do nivoa 12 i pogriješi zbog jednog misklika na Scrambler — vraća se na nivo 1 i prolazi 4-5 minuta trivijalnih nivoa pre nego dođe do izazova.

Ovo je **"podmornica" problem**: početak runa je bored, kraj je stressed. Roguelike permadeath funkcioniše kada je ceo run konzistentno izazovan (Dead Cells, Hades). Ovde neće biti.

Pored toga: timing pressure + puzzle rezonovanje je loša kombinacija. Pravi puzzle igrač želi da razmišlja koliko hoće. Pravi action igrač želi reflex challenge, ne logiku. Ova igra pada između dve stolice i može da ne zadovolji ni jednu publiku.

### 3.4 Proceduralna generacija bez solvabilnosti validation-a — implementacioni rizik

Generisati **garantovano resiv** puzzle u realnom vremenu je netrivijalan algoritamski problem. Standardni pristup: generiši rešenje unazad (od cilja ka početku), pa onda dodaj noise. Ali Scrambler logika to komplikuje — mora se simulirati efekt svakog Scrambler-a na sve susede da bi se potvrdilo da rešenje postoji.

Za 7x7 grid sa 4 tipa čvorova, ovaj validator može biti računski skup i tegoban za debuggovanje. U 2500 linija Vanilla JS bez frameworka, Jova mora da implementira:
- Grid generisanje + path routing
- Solvabilnost check (BFS/DFS sa state tracking)
- Signal animaciju
- 4 tipa čvor logike + Scrambler propagaciju
- Power-up sistem
- Rendering (Canvas), UI, audio

**Procena:** 2500 linija je prenisko. Realno 3500-4000 za stabilan proizvod. Nije blocker per se, ali scope je podcenjen.

### 3.5 Power-up dizajn — asimetrična korisnost

Tri power-up-a:
- **Slow Signal** — direktno rešava timing problem. Uvek koristan.
- **Reveal** — otkriva tipove čvorova na 3 sekunde. Jedino koristan za Scrambler igranje.
- **Freeze** — pauzira signal 1.5s. Sitni Slow Signal.

Igrač će gotovo uvek birati Slow Signal ili Freeze. Reveal je situacionalan. Ovo narušava roguelike "interesting choices" princip. Ako se svi power-up-ovi biraju iz nasumičnog seta, igrač koji ne dobije Slow Signal može biti u strukturnom hendikepu na višim nivoima.

**Manji, ali prisutan problem:** Power-up koji "otkriva" tipove čvorova implicira da čvorovi imaju skrivene tipove. Concept to ne specificira eksplicitno — da li su tipovi vidljivi pre Reveal-a ili ne?

### 3.6 "Oba Splitter puta moraju doći do cilja" — UX problem

Ako Splitter deli signal na dva puta, igrač mora da prati oba vizuelno. Na 7x7 gridu sa više čvorova, praćenje dva simultana signala dok ujedno klika čvorove je **kognitivno preopterećenje** za casual publiku.

Ovo može biti dizajnerski intendovano (hard mode), ali concept ne markira to kao "kasni game" izazov — Splitter je prisutan od početka run-ova.

---

## 4. RANGIRAJ — Prioritet problema

| Problem | Kategorija | Objašnjenje |
|---|---|---|
| Splitter solvabilnost u procedural gen | SHOWSTOPPER | Igra može biti neresiva; igrač ne može razlikovati grešku od bug-a |
| Scrambler semantika bez tutorial-a | OZBILJAN RIZIK | Ruši puzzle osećaj, pretvara u trial-and-error |
| Permadeath bez progressiona — frustracija | OZBILJAN RIZIK | Duga restartovanja kroz trivijalne nivoe uništavaju retention |
| Splitter semantika ("šta je cilj?") | OZBILJAN RIZIK | Mehanska nedorečenost blokira implementaciju |
| Scope (2500 linija je premalo) | OZBILJAN RIZIK | Podcenjen budžet, ali Jova može da se snađe sa 3500 |
| Power-up asimetrija | KOZMETIKA | Loš balans, ali igra je igriva |
| Dual-signal UX na kasnim nivoima | KOZMETIKA | Teško, ali podnošljivo ako je Splitter redak |

---

## 5. PREDLOŽI — Alternative za ozbiljne probleme

### Za Splitter solvabilnost:
**Opcija A (preporučena):** Izbaci Splitter iz v1. Igra ima dovoljno dubine sa Relay + Gate + Scrambler. Splitter se može dodati kao "bonus čvor koji se otključa na nivo 10+" — jedan po gridu, i to samo kada generator može garantovati solvabilnost.

**Opcija B:** Splitter ne deli signal na dva puta ka istom cilju — već ka **dva odvojena Exit-a** koji oba moraju biti aktivna. Ovo čini generisanje lakšim (dve nezavisne grane) i semantiku jasnijom. Zahteva redizajn win condition-a.

### Za Scrambler semantiku:
**Opcija A (preporučena):** Scrambler ne obrće susede u realnom vremenu — obrće samo **igrač-kov sledeći klik** u susednom čvoru. "Tvoj sledeći klik na susedni čvor imaće obrnut efekat." Ovo je deterministično, razumljivo, i vizuelno se može naznačiti (susedni čvorovi dobiju inverted ikonu dok je Scrambler aktivan).

**Opcija B:** Scrambler je jednostavno "deaktivira susede pri aktivaciji" — bez obrtanja klika. Predvidljivo, ali manje zanimljivo.

### Za permadeath frustraciju:
**Opcija A (preporučena):** Uvedi **checkpoint na nivo 5 i nivo 10**. Roguelike puristi će gunđati — casual igrači će ostati. Za 3-5 min sesiju, permadeath hard restart je preoštar.

**Opcija B:** "Soft permadeath" — pri grešci, igrač dobija opciju "Continue from level X-2" sa penaltyjem (gubi sve power-up-ove). Greška ima cenu, ali nije brutalna.

---

## 6. ZAKLJUČAK

### Verdict: DRŽI UZ KOREKCIJE

Jezgro je solidno. Blueprint estetika + signal animacija + proceduralna mreža = vizuelno ubedljiv i tehnički ostvariv koncept za jedan dan. Roguelike ljuska daje replay. Web Audio sintetizacija je realistična.

Ali tri problema moraju biti rešena **pre nego Jova napiše red koda**, jer su arhitekturalni — ne kosmetički:

---

### OBAVEZNE KOREKCIJE ZA SINE (max 3):

**Korekcija 1 — Izbaci Splitter iz v1 (ili redizajniraj)**  
Splitter u sadašnjoj formi ("oba puta do istog cilja") je neimplementabilan bez složenog solvabilnost-validatora koji košta previše tokena i vremena. Ili ga izbaci i ostavi za v2, ili redefiniši: Splitter kreira dva nezavisna Izlaza, oba moraju biti otvorena da signal prođe (dve Gate-ke na kraju). Dodati u concept.md koja je tačno semantika.

**Korekcija 2 — Precizno definiši Scrambler pravilo**  
Scrambler mora imati jednoznačno, igraču-objašnjivo pravilo. Predlog: "Dok je Scrambler aktivan, svi susedni Gate-ovi su deaktivirani — bez obzira na igrača." Ili: "Scrambler invertuje stanje susednih čvorova u trenutku aktivacije (jednom, ne kontinuirano)." Odaberi jedno i upiši u concept.md kao finalno pravilo. Mile će ti biti zahvalan u GDD-u.

**Korekcija 3 — Dodaj checkpoint sistem**  
Umesto full permadeath: checkpoint na nivo 6 i 11. Igrač koji padne između checkpoint-ova — restartuje od poslednjeg checkpoint-a, ali **gubi sve power-up-ove i dobija novu mapu od tog checkpoint-a**. Kazna postoji, ali pet minuta trivijalnih nivoa ne mora da se prođe svaki put. Ovo je razlika između casual hit i casual drop.

---

*"Igra nije loša ideja — ima loše definirane rubne slučajeve. Definiši ih pre implementacije i imaš solidan dan."*  
— Nega N.
