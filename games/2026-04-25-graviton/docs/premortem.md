# Premortem — Graviton

## Steelman

Graviton je jedan-dugme survival runner sa precizno definisanom petljom: vidiš prepreku, odlučiš flip ili čekaj, živiš ili umreš. Core mehanika je instant-readable (svi razumeju gravitaciju) ali ne-trivijalna za ovladati. G-overload mehanika sprečava pasivnu strategiju — ne možeš samo da se zalepiv za plafon i "sigurno" proletiš. Vizuelni jezik (indigo pozadina, neon zeleni rubovi, narandžaste prepreke) je čist i čitljiv. Session dužina od 30s–2min znači nula friction za "još jedan pokušaj". Ovo je prototip koji može da radi.

## Pretpostavke koje treba proveriti

- Da igrač može *vidljivo* da proceni prepreku dovoljno rano za pravovremeni flip (zahteva pažljivo tuning scroll brzine i spawn distance-a)
- Da 20 šablona zona zaista daje percepciju raznolikosti — možda je 10 realističniji cilj uz isti osećaj randomizacije
- Da G-overload timer nije toliko agresivan da postane izvor frustracije umesto taktičke dubine
- Da proceduralni generator zona ne može da složi nemoguće kombinacije (npr. spike-filled prolaz + G-overload crvena faza simultano)
- Da canvas collision detection (AABB ili pixel-perfect?) radi fer na svim brzinama bez tunneling-a

## Rizici (rangirani)

| Rizik | Verovatnoća | Uticaj | Korekcija |
|-------|-------------|--------|-----------|
| Scroll brzina + zona spawn distance poorly tuned — igrač ne vidi prepreke na vreme | V | V | Definiši u config.js: `ZONE_SPAWN_LOOKAHEAD` = 2–3 ekrana ispred; testirati pri max speed levelu |
| Nemoguće sekvence iz proceduralnog generatora (spike + overload + uski prolaz) | S | V | Dodaj constraint u generator: ne slažii "G-overload opasnost" zonu odmah posle "uskog prolaza" zone |
| G-overload mehanika = zbunjujuće pravilo za novog igrača | V | S | Onboarding: prve 3 zone bez G-overload efekta, timer se aktivira tek od zone 4 |
| 20 šablona zona — scope bloat za jedan dan implementacije | V | S | Seci na 8–10 kvalitetnih šablona; generator koji mešanjem delova pravi privid raznolikosti |
| Flappy Bird frustration curve — igrač odustane pre nego što nauči | S | S | Prve zone budu intentionally easy (dugi prolazi, bez buzzsaw-a) — gradijent, ne cliff |
| Rotirajući buzzsaw kolizija nije trivijalna (rotiran sprite + AABB = netačan hitbox) | S | V | Simplifikuj: buzzsaw vizuelno rotira ali hitbox ostaje statičan kvadrat/krug |
| Web Audio API na mobile Safari — poznati compatibility problemi | S | S | Audio je opcioni (Ceca Čujka); igra mora raditi bez zvuka |

## Fokus pitanja

1. **G-overload mehanika: zabava ili scope bloat?**
   Mehanika ima smisla — rešava problem "pasivnog strop-hugger-a" i dodaje ritam. Rizik je implementacioni: zahteva poseban timer, vizuelni feedback (color transition + vignette) i audio cue. To su 3+ modula koja moraju biti sinhronizovana. Ako se radi, treba ga tretirati kao first-class feature sa jasnim config konstantama (`G_OVERLOAD_MAX_TIME`, `G_OVERLOAD_WARNING_THRESHOLD`). Preporuka: **drži mehaniku, simplifikuj vizualni feedback** — samo color transition broda, bez vignette za prvu verziju.

2. **20 šablona zona — realno za 1 dan?**
   Nije. 20 unique, testiranih šablona znači ~20 manuelno balanssovanih konfiguracija. Realnije je **8–10 šablona** plus parametarsku varijaciju (širina prolaza, broj šiljaka, pozicija buzzsaw-a). Generator koji mixa parametre može dati 50+ perceivably različitih prolaza iz 8 šablona.

3. **Frustration curve: Flappy Bird feel + G-overload = previše?**
   Postoji realni rizik double-punishment: umreš od prepreke I od overload-a, nikad ne znaš koji je bio problem. Rešenje: erste 60 sekunde igre su "tutorial zona" — samo flip mehanika, bez G-overload aktivacije. Igrač nauči jedan sistem pre nego što dobiješ drugi.

4. **Runtime rizik proceduralnog generatora?**
   Nizak ako je generator jednostavan (random shuffle iz pool-a šablona). Visok ako pokušava geometrijsku plauzibilnost u realnom vremenu. Preporuka: predgenerisati sekvencu od 100 zona na start sesije, ne generisati live.

## Verdikt

**DRŽI UZ KOREKCIJE**

Tri obavezne korekcije pre nego što Mile piše GDD:

1. **Seci zone pool na 8–10 šablona** (ne 20) — ostatak dolazi iz parametarske varijacije unutar šablona
2. **G-overload se aktivira tek od zone 4** (posle ~20 sekundi) — nove igrače ne kaznjavaj za nepoznavanje drugog pravila
3. **Buzzsaw hitbox = statičan krug/kvadrat**, vizuelna rotacija je samo CSS/canvas transform bez uticaja na koliziju
