# Premortem — Rovovi i Ruševine

## Steelman (Razumem ideju)

Turn-based taktička igra na gridu je jedan od najbogatijih žanrova po "jedan potez = jedna misao" zapetu — igrač ima pravo vreme za odluku, nema stresa real-time-a, a simultano izvršenje daje kinematski "wow" trenutak. Estetika ratnih mapa iz 1917. je vizuelno koherentna i 100% izvediva bez ikakvih eksternih resursa.

## Showstopper Rizici (moraju biti rešeni pre implementacije)

1. **AI modul koji "reaguje" — PROBLEM → ZAŠTO JE PROBLEM → REŠENJE**
   - PROBLEM: Koncept kaže da AI "reaguje na pritisak, povlači se, poziva pojačanje" i pominje "minimax/rule-based". Ovo zvuči malo, ali u praksi je zamka: rule-based AI koji izgleda "pametan" zahteva desetine edge-case pravila, a svaka nova kombinacija stanja grida kreira bugu koja izgleda kao glup AI.
   - ZAŠTO: Jova ima jedan dan. Bugovanje AI-a koji "izgleda inteligentno" može pojesti 30-40% implementacionog vremena. AI koji je previše glup uništava "genijalni komandant" osećaj.
   - REŠENJE: Mile u GDD-u mora da definiše AI kao konačan automat sa tačno 4-5 jasnih stanja (npr. HOLD / RETREAT / REINFORCE / ATTACK / ARTILLERY). Svaki prelaz između stanja treba da bude deterministički — "ako napadnut s boka, retreat na N+1 liniju ako slobodna, inače hold". Bez probabilizma, bez lookahead. Ovo je izvedivo i dovoljno da izgleda pametno.

2. **Simultano rešavanje poteza (turn engine) — PROBLEM → ZAŠTO JE PROBLEM → REŠENJE**
   - PROBLEM: "Sakuplja naređenja, rešava simultano (priority queue), generiše animacione event-e" — ovo su tri odvojene ne-trivijalne implementacije u jednom modulu.
   - ZAŠTO: Priority queue koji rešava konflikte (dva vojnika hoće istu ćeliju, igrač puca na vojnika koji se povlači) ima kombinatornu eksploziju edge-case-ova. Animacioni event sistem koji to vizualizuje mora biti sinhronizovan sa tim rešavanjem. Greška u redosledu = bug koji je vidljiv svakom igraču.
   - REŠENJE: Mile mora u GDD-u da specificira tačan redosled prioriteta (primer: 1. smrt, 2. kretanje igrača, 3. kretanje neprijatelja, 4. pucanje). Jova implementira sekvencijalno rešavanje koje se samo "prezentuje" kao simultano kroz animacije. Nije varanje — igrač ne vidi razliku, a kod je 3x jednostavniji.

3. **Fog of war + "magla rata" vidljivost — PROBLEM → ZAŠTO JE PROBLEM → REŠENJE**
   - PROBLEM: "Ćelije koje nisu u vidokrugu prikazane tamnije" — ovo zahteva per-ćelijski visibility tracking, koji mora biti ažuriran svaki potez za svaku jedinicu.
   - ZAŠTO: Nije tehnički nemoguce, ali povećava kompleksnost grid state-a i render passe-a. Ako fog of war nije dobro komuniciran vizuelno (igrač ne zna šta vidi a šta ne), postaje frustracija, ne napetost.
   - REŠENJE: Fog of war se može svesti na jednostavan boolean po ćeliji (`visible: true/false`) koji se računa jednom po potezu za sve savezničke jedinice zajedno (ne per-unit). Render razlika treba biti jasna — predlažem overlay tamni rect sa opacity 0.65, ne suptilna nijansa. Ako Mile proceni da fog of war komplikuje GDD previše, može biti `configurable flag: false` za prvu verziju.

## Srednji Rizici (treba adresirati u GDD-u)

1. **Balans municije i "prisilni juriš"** — Mehanika "bez municije možeš jurišati (rizično)" mora imati precizno definisane šanse i posledice, inače igrač ne može da proceni da li je to "pravi potez" ili "siguran gubitak". GDD treba tabelu: koliko municije po tipu akcije, koliko poteza tipičan run troši, hard floor municije po težini.

2. **3 linije rovova — naglašena repetitivnost** — Svaka linija mora uvesti nešto novo (novi tip neprijatelja, novi teren) inače je osećaj "isti nivo 3 puta". Koncept kaže "novi tipovi neprijatelja" ali GDD mora konkretno specificirati šta se menja u liniji 2 i liniji 3 i da promene budu mehanički značajne, ne samo vizuelne.

3. **Sistem ocenjivanja S/A/B/C** — Bez jasnih pragova u GDD-u, igrač ne zna šta optimizuje. Može delovati kao afterthought. Pragovi moraju biti balansirani tako da S nije trivijalan ni nemoguć — GDD treba dati konkretne vrednosti za test scenario.

4. **Touch interakcija na malim ekranima** — Grid 12×8 ćelija na mobilnom ekranu (360px širina) = ćelija ~30px. Tap-target od 30px je na granici upotrebljivosti. Pera mora rešiti ovo u layout-u — ili responsive skaliranje koje smanjuje grid na 8×6 za mobile, ili horizontalni scroll.

## Sitni Rizici (nice to know)

- Sepija paleta je vizuelno koherentna ali može biti monotona — treba barem 2-3 "akcent" boje (ekspanzija — narandžasta za eksploziju, plava za dimnu zavesu).
- "Puf dim za pucnjavu" animacija u 0.8s mora biti opcionalno skipabilna (spacebar/tap) za igrače koji vole brzu igru — inače 20 poteza × 0.8s = 16 sekundi čekanja.
- Audio dron + distant cannon: ako Web Audio API nije podržan, igra mora biti funkcionalna u tišini — audio modul mora biti opt-in, ne blokirajuć.
- Naziv "Rovovi i Ruševine" zvuči dobro ali se preporučuje kratak subtitle ili tagline za index stranicu za kontekst.

## Verdikt

**DRŽI UZ KOREKCIJE**

Koncept je solidan, žanr je implementabilan u jednom danu, a estetika je jasna i izvediva bez eksternih resursa. Tri korekcije su obavezne pre implementacije: Mile mora u GDD-u da (1) svede AI na konačan automat sa ≤5 stanja i eksplicitnim prelazima, (2) definiše tačan redosled prioriteta pri rešavanju poteza umesto pravog simultanog rešavanja, i (3) odredi da li je fog of war u scope-u prvog dana ili je `flag: false`. Bez ovih preciziranja, Jova će izgubiti vreme na dizajn-odluke tokom implementacije, što je najskuplji mogući scenario.
