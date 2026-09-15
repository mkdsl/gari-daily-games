# Premortem — Turneja Planer

**Autor:** Nega Negovanović
**Datum:** 2026-09-15
**Concept verzija:** v1 (Iskra)

---

## Verdict

**DRŽI UZ KOREKCIJE** — jedna iteracija od Iskre pre GDD-a.

Brand-utility je autentičan (jedina igra u katalogu koja direktno simulira Kluboslavija 2026 turneju — to nije decoration). Mehanike imaju solidan kostur. Ali 4 kritične praznine u konceptu garantuju impl dug koji će zaustaviti Jovu na pola posla.

---

## Rizici

### [CRITICAL] Reputation gain formula ne postoji u concept.md

Guncati gate zahteva Reputation ≥ 6 pri dolasku. Concept ne definiše:
- Početnu vrednost Reputation-a
- Za šta tačno player dobija +rep (crowd size? dobar izbor kartice? prestige bonus?)
- Korak promene — koliko +/- po gradu

**Posledica:** Mile ne može da napravi progression krivu. Jova implementuje placeholder, Guncati gate je random za playera. "Guncati Zatvoren" ending postaje lottery, ne posledica loših odluka. Ovo kvari celu narrative arc igre.

**Fix:** Iskra dodaje u concept.md: početna vrednost + formula rasta (npr. +1–3 per grad, based on crowd+cards), i minimum achievable per grad bez krize.

---

### [CRITICAL] Card pool neuređen — randomness ruši "Strategy/Route Optimizer" žanr

4 random decision cards po gradu. Concept ne navodi:
- Ukupan broj unique kartica u pool-u po gradu (ili shared pool?)
- Da li su kartice città-specific ili generic
- Procenat pojavljivanja po tipu

**Posledica:** Ako je pool mali (npr. 8–10 kartica ukupno, 4 random po večeri), player vidi iste kartice i uči ih napamet za 2 run-a — prestige postaje grindan, ne strateški. Ako je pool velik (40+), impl je zapravo mini card-game engine, ne route optimizer — drastično drugačiji scope od onoga što concept sugerira.

"Strategy" žanr zahteva da skill > luck ratio bude merljiv. Trenutno concept implicira inverziju.

**Fix:** Iskra definiše: broj kartica po gradu (ili shared), tip distribuciju (% crisis vs. opportunity vs. neutral), i da li player može da predvidi/filtrira pool (npr. Crew Mood utiče na koje kartice se pojavljuju).

---

### [CRITICAL] "border+" za Sarajevo — mehanički undefined

Risk 3 za Sarajevo + "border+" tag. Nigde u concept-u ne piše šta border+ triggeruje gameplay-no.

**Mogućnosti su potpuno različite u scope-u:**
- Samo flavor tag (risk = generic crisis multiplier) — trivialno, ali zašto onda poseban tag?
- Specijalni border delay event koji oduzima sat ili resurse — novi mechanic
- Gate check (dokumenti, dozvole) koji zahteva prethodnu resource alokaciju — novi sistem

Jova ne može da implementuje "border+" bez definicije. Svaka pretpostavka kreira neplaniran feature.

**Fix:** Iskra eksplicitno definiše šta border+ radi mechanically. Jedna rečenica dovoljna.

---

### [MEDIUM] Crew Mood -1 između gradova — matematički trivijalno bez threshold definicije

5 gradova. Carrying Crew Mood između njih sa -1 penalom. Concept ne daje:
- Početnu vrednost
- Threshold efekte (šta se dešava na Mood 0? 1? negativno?)
- Kartice koje vraćaju Mood (ima ih? koliko?)

Bez threshold-a, Mood je dekoracija — player je ignorišu. Sa krivim threshold-ima (npr. Mood 0 = crew odlazi = game over) igra može biti brute-hard na prvom playthroughу.

**Ovo nije blocker za Iskru** — Mile može da reši u GDD-u pod uslovom da Iskra doda bar početnu vrednost i je li negativan Mood moguć.

---

### [MEDIUM] Prestige balans favoruzuje "Završeno i Plaćeno" ending

Prestige: budžet pada 3500 → 2500 (−28%), Reputation kreće od 2 (ne 0), +1 crisis/grad.
Fan Database carry-over jedina materijalna nagrada.

Igrač koji dođe do "Turneja Legenda" i pritisne Prestige dobija teži run bez jasne mehaničke nagrade osim Fan Database-a koji concept ne definiše konkretno.

**Rizik:** Prestige se ne isplati percipirano. Player igra do Legende jednom, odustaje. Replay vrednost kolapsira.

Mile rešava u GDD-u (Fan Database bonusi, Reputation 2 kao prednost — ne mora Iskra).

---

### [MEDIUM] 5 gradova = ~20 minuta per run — premalo za "multi-layer"

Macro layer: 5 lokacije reorder choices + budget split = ~3 minutes.
Micro layer: 4×5 = 20 card decisions = ~12–15 minutes.
Total: under 20 minutes first run.

"Multi-layer manager/sim" standard iz CLAUDE.md implicira Game Dev Tycoon / Two Point Hospital tier — resource carry-over između sesija, branching progression, 45+ min first run.

Ova igra je bliže "5-round card game" nego "multi-layer sim". To nije nužno loše (HTML5, mobile-first, quick session) ali GDD mora to da признa i prilagodi scope (25–40 modula, ne 50–90 tier).

**Ovo ne blokira release** ali Gari treba da potvrdi sa šefom da je "kratka ali polirana" prihvatljiv cilj za ovu igru, obzirom na brand timing (Avala 20.06 je prošao, Guncati je key event).

---

### [LOW] CSS DOM (ne Canvas) za mapu — UX rizik na malom ekranu

Flex grid mapa sa 5 gradova, city color-coding, card UI. Na 360px wide mobitelima (Redmi, Tecno) flex grid od 5 noda lako postaje 2-3 noda u redu — mapa gubi prostorni smisao (sever-jug nije čitan).

Nije showstopper ali Pera Piksel treba eksplicitne breakpointe u briefu (mobile-first, ne desktop-then-scale).

---

## Brand-Utility Kritika

### Kluboslavija
**AUTENTIČNO, ne decoration.**
Igra direktno simulira 2026 turneju (Beograd, Novi Sad/Štrand, Niš, Sarajevo, Guncati). Igrač koji zna Kluboslaviju prepoznaje realan context — "Tonček sub problem" je verovatno literal. Može se koristiti kao pre-event hype content ("odigraj turneju pre nego što ona počne"), Linktree insert, Stories hook.

**Uvjet:** Igra mora biti playable pre Guncati datuma (grand finale). Ako impl slipsa, brand window je promašen.

### MKDSLend
**SLABO za nepoznate, SOLIDNO za insajdere.**
Igrač koji ne zna MKDSLend ne razume zašto je "Guncati partner-gated". Za širu publiku, Guncati je samo "teži grad". Brand story se ne prenosi kroz gameplay sama od sebe.

**Fix koji ne zahteva Iskru:** Flavor text u Guncati gate screen-u ("Guncati ne prima svakoga — samo onoga ko je izgradio reputaciju u sceni") — jedna rečenica koja nosi brand narrative. Mile ili Jova može ovo dodati.

### Guncati
**NAJJAČI brand asset u celom konceptu.**
Guncati kao locked final destination — "moraš zaslužiti pravo da sviраш tamo" — je Tom Sawyer positioning u čistom obliku. Reputation gate nije samo mehanika, to je brand statement. "Guncati Zatvoren" ending ima emotional weight koji standard platformer nikad nema.

**Rizik:** Ako je Reputation gate prelako achievable (player uvek stiže na 6+), brand weight se ruši. Gate mora biti dostizan ali naporan — ~30% first-run fail rate je target.

---

## Šta Iskra Treba da Ispravi (1 iteracija)

**Concept.md treba da doda tri konkretne stvari:**

1. **Reputation: početna vrednost + formula** — npr. "Počinje na 3. +1 za svaki grad gde Crowd Quality ≥ 60%. +1 bonus ako nisu sve kartice loše odabrane (≥2/4 optimalne). Sarajevo border+ = automatski -1 ako Travel cost nije bio rezervisan unapred." Bilo koja formula radi — samo mora biti jedna.

2. **Card pool definicija** — koliko unique kartica po gradu (ili shared), jesu li grad-specific ili ne. Ako shared: navesti ukupan broj. Jednu rečenicu.

3. **"border+" mehanička definicija** — jedna rečenica šta border+ znači u Sarajevo event-u.

Crew Mood threshold i Prestige balans → Mile rešava u GDD-u.

---

## Zaključak

Concept ide dalje. Brand connection je genuine (posebno Guncati gate), žanr fit je dobar za Kluboslavija timing, scope je realan za 3-day pipeline. Ali bez Reputation formule, card pool definicije i border+ definicije, GDD će biti nepotpun i impl će nagomilati dug u KORAK 4a.

**Jedna iteracija od Iskre (samo 3 stavke gore) → GDD može početi.**
