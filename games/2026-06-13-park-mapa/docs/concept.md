# Park Mapa — Concept

> **Retry 2026-06-13** — koncept je 23 dana čekao u backlog-u (V1.0, 2026-05-21). `gdd.md` (V0.3, Mile Mehanika) već postoji i REŠAVA sve P0 korekcije iz premortema (scope cut na 3 zone, Bina setlist u JSON-u, anti-abuse dizajnerska odluka, Canvas LOD arhitektura, dnevni closure loop, 30 modula V0.3). Ova verzija (1.1) je targeted refresh originalnog koncepta — premisa, core loop, multi-layer arhitektura, vizuelna estetika, audio mood, win condition, replay hook i prestige mehanika OSTAJU NEPROMENJENI. Mile-ov gdd.md je izgrađen na ovim temeljima i ne dira se.

## Premisa

MKDSLend Park je živi, piksel-art svet koji raste zajedno sa igračem — interaktivna mapa koja nije samo navigacija nego i sopstvena igra istraživanja, kolekcije i izgradnje. Svaki dan koji igrač proveže sa GDG ekosistemom ostavlja trag na mapi: zone se pale, lampioni se pale, park se menja.

## Core Gameplay Loop

1. **Otvoriš mapu** — park dočeka igrača u sumračnom/noćnom stanju, neke zone svetle, neke su u tami ili magli.
2. **Istraži** — kretanjem kursora (ili tapom) po mapi otkrivaš skrivene detalje: pejzažne fragmente, NPC siluete, ambijentalne poruke.
3. **Aktiviraj zonu** — klikneš na zonu, dobijač kratki flavor text + progress marker za tu zonu pre nego što (opcionalno) uđeš u igru.
4. **Skupi Parktoken** — svaka poseta zoni, svaki easter egg, svaki "check-in" donosi Parktokene koji se reinvestiraju u vizuelni rast parka.
5. **Park raste** — Parktokeni se troše automatski na nove dekoracije, svetlosne efekte, NPC rutine i sezonske promene — igrač vidi konkretan vizuelni napredak pri svakom povratku.
6. **Dnevni ritual** — svaki dan park ima jedno "Dnevno Svetlo": istaknuta zona sa bonus nagradom, kratkom anegdotom ili easter eggom koji nestaje sutra.

---

## Multi-Layer Arhitektura

### Macro Layer
*(Sezonski / nedeljni ritam — planiranje i rast parka)*

- **Sezonski ciklus (4 nedelje):** Svaka sezona menja vizuelni ton mape (proleće → leto → jesen → zima) i otključava sezonske dekoracije i NPC dijaloge.
- **Zona-progresija:** Svaka zona ima 5 nivoa razvoja (Zapušteno → Otvoreno → Aktivno → Popularno → Ikonično). Nivo raste skupljanjem Sezonskih Žetona koji se prenose iz micro sloja.
- **Park Budget:** Nedeljni resurs koji se zarađuje iz micro aktivnosti i troši na "Park projekte" — novi puteljci, fontane, info-table, vizuelne nadogradnje koje su permanentne.
- **Networking Board:** Lista NPC-ova (Kurator, Park Ranger, DJ Silueta, Biljkar) koji nude nedeljne misije i bonuse. Ispunjeni zadaci otključavaju lore fragmente MKDSLend istorije.

### Micro Layer
*(Sesija — samo istraživanje i interakcija sa zonom)*

- **Zona Check-In:** Svaka zona ima svoju "ulaznu animaciju" (3-5 sekundi) i kratki flavor screen sa aktuelnim stanjem zone (npr. "Bina: Tiha noć, zvuk pričeka" ili "Pult: Neon treperi, set počinje za 2h").
- **Easter Egg Hunt:** Po parku je skriveno 7–12 interaktivnih objekata dnevno (lampion, zarđala klupa, tajanstveni poster) — klik na svaki daje Parktokene i micro-lore rečenicu.
- **Zona Mini-Priča:** Svaka zona ima 20+ kratkih narativnih kartica koje se otključavaju redom kroz posete — ne puna igra nego 3-4 rečenice atmosfere i backstorya.
- **Ambijentalni Kursor:** Kursor se menja zavisno od zone (lampion u šumi, vinilna ploča na pultu, klas u stakleniku) — mikrointerakcija koja povećava imerzirani osećaj.

### Meta Progresija
*(Career / prestige sistem — dugoročno)*

- **Park Legenda:** Kumulativni score svih zona, easter eggova i dnevnih povrataka. Vidljiv na glavnom ekranu kao "Rang Parka" (Izletnik → Poznavalac → Domaćin → Legenda → MKDSLend Original).
- **Karta Zapisa (Logbook):** Svaki otkriveni lore fragment, easter egg i zona-priča čuva se u Logbooku — vizuelni kolekcionar koji se popunjava kroz vreme.
- **Prestige Reset (Park Renovacija):** Na kraju sezone igrač može aktivirati "Veliku Renovaciju" — park se vizuelno resetuje u novo godišnje doba, ali zadržava sve Logbook zapise i dobija ekskluzivnu Renovacioni Žeton koji otključava specijalni dekor.
- **Resource Carry-Over:** Sezonski Žetoni, Park Budget ostatak i Logbook zapisi prelaze u sledeću sezonu. Zona-nivoi se ne resetuju — akumulacija je permanentna (Legenda zona ostaje Legenda).

---

## Hook (zašto igrač ostaje 15+ min)

- **"Samo još jedan easter egg"** — dnevnih 7–12 skrivenih objekata stvara compulsion loop identičan traženju skrivenih predmeta u RPG-u.
- **Vizuelna promena u realnom vremenu** — park se animira dok igrač boravi: oblaci prolaze, NPC-ovi šetaju, lampioni trepere. Sama prisutnost je nagrađujuća.
- **Zona Mini-Priča pull** — svaka poseta zoni otkriva sledeću narativnu karticu; igrač želi da zna šta sledi za svakog NPC-a.
- **Dnevno Svetlo tajmer** — vidljivi odbrojač do nestanka dnevnog bousa stvara FOMO koji vuče igrača sutra.
- **Park Budget taktika** — nedeljni Budget ne sme da se "zatrovi" (nema prenos ako se ne potroši) pa igrač planira šta da gradi pre reseta.

---

## Vizuelna Estetika

**Paleta:** Tamno-plava noć (#0D1B2A) kao osnova, sa toplim ambijentom po zonama. Akcenti: zlatno-narandžasto (lampioni, bina), neon-zeleno/ljubičasto (pult), srebrnasto-plava (jezero/šuma), zemlja-crvena (staklenici).

**Piksel art stil:** 16x16 / 32x32 tile-based RPG mapa. Inspiracija: Stardew Valley town map + SNES JRPG world map (Final Fantasy VI, Chrono Trigger). Karakteri su 16px siluete bez lica — ambijentalne, ne portretne.

**Animacije:**
- Paralax drifting oblaci (CSS transform, 3 sloja brzine)
- Trepćući lampioni (CSS keyframe opacity pulse, random delay po lampionu)
- NPC hodanje po puteljcima (Canvas sprite loop, 4 frejma)
- Zona "aktivacija" — krug svetlosti koji se širi ka ivicama zone pri hoveru (Canvas radial gradient expand)
- Sezonska promena — blagi hue-rotate filter transition koji traje 2–3 sekunde pri promeni sezone

**Zona vizuelni identiteti:**
- **Pult** — neon roze/ljubičasto, blink-efekti, equalizer bar animacija u pozadini
- **Bina** — toplo jantarno, prašina čestica u vazduhu (Canvas particle), akustični talasi pri hoveru
- **Šuma** — zeleno-tirkizno, lišće pada (Canvas), bioluminiscentne tačke po tlu
- **Jezero** — svetlo-plavo, vodeni ripple krug (Canvas sine wave), odraz zvezdanog neba
- **Kafana** — toplo braon/crveno, dim-efekt, karte na stolu
- **Staklenici** — zeleno-žuto, rast biljke animacija pri check-inu
- **Arene** — CRT scan-line efekt, retro blok pixeli, 8-bit blink
- **Čuvarica** — tamno-zeleno, baterijska lampa krug svetlosti koji prati kursor u toj zoni
- **Biblioteka** — sivo-plavo, otvorena knjiga animacija, lebdeće slovo-partikle

> **Napomena V1.1 — V0.3 scope:** Aktivne zone u V0.3 ostaju **Pult, Bina, Šuma** (nepromenjeno od premortem korekcije). Jezero, Kafana, Staklenici, Arene, Čuvarica i Biblioteka su "locked — u izgradnji" sa vizuelnim teaserom, kako je definisano u gdd.md.

---

## Audio Mood

Sav audio je Web Audio API, bez eksternih fajlova.

- **Ambijentalni loop:** Generativni šum sa low-pass filterom — "noćni park" zvuk (crickets simulirani noise bursts u 2–6kHz opsegu, sporo moduliran).
- **Zona proximity audio:** Svaka zona emituje tematski ton kad je kursor blizu — Pult: subas boom tick; Bina: fingerpick pluck; Šuma: wind chime; Jezero: water drop ping; Kafana: playing card flick; Staklenici: soft bell.
- **Easter egg otkrivanje:** Kratki 3-note ascending Web Audio chord (major triad, staccato, 200ms).
- **Zona aktivacija:** Reverb-heavy single pad note, karakteristična nota po zoni (Pult: F# minor; Bina: G major; Šuma: D minor; Jezero: A major).
- **Park rast:** Celebratory 5-note arpeggio kad zona napravi level-up.

---

## Win Condition / Session End

Nema tvrdog "win" — Park Mapa je ambient persistent experience.

**Prirodni session end signali:**
- Igrač skupi sve dnevne easter eggove (counter: 7/7 → "Park je za danas tvoj" poruka).
- Dnevni Zona Check-In kompletiran (posetio zonu koja je imala dnevni bonus).
- Park Budget potrošen za nedelju → "Gradnja u toku, vrati se sutra" vizuelni feedback.

**"Dovoljno za danas" UI:** Diskretni zeleni indikator u uglu koji pokazuje koliko dnevnih zadataka je završeno (ne intruzivni, ali vidljiv). Kad dostiže 100% — lampioni po celom parku zasvetlucaju 3 sekunde, tihi celebratory audio.

---

## Brand Serves

**MKDSLend (primarni):**
Park Mapa je kanonična home base MKDSLend identiteta. Svaki brand asset (logo lampion na ulazu, natpis "MKDSLend Park" na kapiji, mapa-stil koji je konzistentan sa svim GDG materijalima) direktno gradi brand recognition. Igrač doživljava MKDSLend kao fizički prostor sa istorijom, ne samo kao ime.

**Kluboslavija (turnejski integrisano):**
Bina zona direktno mapira na Tiha Avala igru i turnejska mesta — Avala, Štrand, Sarajevo, Guncati. U Bina zoni postoji "Setlist Tabla" sa turnejskim datumima (čita se iz `data/bina-setlist.json`, gdd.md V0.3). Check-in na Bina zonu u nedelji Avala koncerta (20. jun) daje ekskluzivni "Avala 2026" Parktokene i Logbook unos.

> **Napomena V1.1 — vremenski pritisak:** Od 2026-05-21 do danas (2026-06-13), Avala show je prešao iz "~30 dana daleko" u **samo 7 DANA do launch-a**. Bina ekskluziv (Setlist Tabla + "Avala 2026" Parktokeni) nije više buduća feature — ovo je odmah relevantan, launch-week hook. Ako V0.3 izađe ove sedmice, Bina zona mora imati popunjen `data/bina-setlist.json` sa Avala datumom već na launch dan, ne kao "coming soon".

**Guncati (permakultura vektor):**
Staklenici zona je vizuelno i narativno vezana za Guncati imanje. Zona Mini-Priča u Staklenicima prati "Godinu na Guncatima" — mesečni mikro-narativ o kombuhi, fermentaciji, sezoni. Staklenici zona level-up otključava lore koji direktno reklamira Guncati kao fizičko mesto (bez ekspicitnog CTAa — samo atmosferom). *(Staklenici je u V0.3 locked zona — vidi napomenu o budućim portalima ispod.)*

---

## Napomena V1.1 — Locked zone kao portali ka GDG katalogu (buduće sezone)

Od originalne ideje #10 u `tim/iskra/gamifikacija_ideje.md` — "Park Mapa kao krov/landing page koji povezuje sve GDG igre kao zone" — ovaj ugao je u V1.0 bio implicitan. Od 21. maja do danas GDG katalog je narastao sa ~10 na ~15+ branded igara (Pakuj Torbu — Avala Edition, Zvučna Proba, Turneja 2026, Gari Tim Simulator, DJ Akademija, Akva-Sklop, Ekipa Noći, Niš Fuga, Pečurka Inokulator, Avala Crew, Zemlja i Znanje, i dalje), pa je "dovoljno zona da park bude krov" uslov sada mnogo jače ispunjen nego pre 23 dana.

**Za buduće sezone (posle V0.3):** Locked zone (Jezero, Kafana, Arene, Staklenici, Čuvarica, Biblioteka) mogu postati **direktni portali/linkovi ka postojećim GDG igrama** — npr.:
- **Jezero** → Akva-Sklop (akvakultura vektor, prirodna tematska veza)
- **Staklenici** → Zemlja i Znanje / Guncati permakultura igre
- **Arene** → neka od arkadnih GDG igara (Avala Crew i slične)
- **Biblioteka** → narativne/edukativne GDG igre (Zemlja i Znanje, Ekipa Noći)

Ovo ne menja V0.3 scope — **tri aktivne zone ostaju Pult, Bina, Šuma**, nepromenjeno. Ali "unlock zone" momenat u budućim sezonama dobija jasniju nagradu: otključavanje zone = otključavanje portala ka novoj igri u katalogu, što direktno realizuje originalnu "krov za sve GDG igre" viziju bez dodatnog scope-a sada.

---

## Replay / Retention Hook

- **Dnevni Dnevno Svetlo** — jedna zona po danu ima bonus easter egg i narativnu karticu koja nestaje sutradan. Čist daily return driver.
- **Sezonska promena** — vizuelna transformacija parka svakih 28 dana daje razlog da se "pogleda šta je novo" čak i pasivnim igračima.
- **Logbook kompletiranje** — 20+ narativnih karica po zoni × 9 zona = 180+ kolekcionarskih unosa. Collector's itch.
- **NPC Networking misije** — nedeljne misije od 4 NPC-a stvaraju strukturu koja povlači igrača bar jednom nedeljno.
- **Zone koje "čekaju" igrača** — NPC siluete imaju "idle reakcije" na igrača koji nije bio u zoni 3+ dana (mjehurić iznad glave: "Dugo te nije bilo...").

---

## Prestige Mechanic

**Park Renovacija (kraj sezone):**

Kada igrač dostigne Rang "Domaćin" ili dočeka kraj 28-dnevne sezone (ko god dođe pre), pojavljuje se opcija "Pokrenuti Veliku Renovaciju."

- **Šta se resetuje:** Vizuelni stil parka (paleta prelazi u sledeće godišnje doba), NPC pozicije i nedeljne misije, Dnevno Svetlo historija, zona narativne kartice se "zatvore" u Arhivu i počinju nova serija.
- **Šta ostaje:** Svi Logbook zapisi (permanentni), zona-nivoi (ne padaju), Rang Parka (akumulativan), specijalni "Renovacioni Žeton" koji ostaje vidljiv na mapi kao dekorativni marker sezone.
- **Vizuelni marker prestige-a:** Svaka završena Renovacija dodaje mali "žig" na kapijsku tablu parka — igrač koji ima 4 žiga je "zima-leto-proleće-jesen" veteran, vidljivo i njemu i (u budućem multiplayer/leaderboard sloju) drugima.
- **Renovacioni Bonus:** Jedna zona po izboru dobiva permanentni vizuelni upgrade (poseban efekt koji nije dostupan redovnim Parktokenima) — igrač bira, odluka je ireversibilna.

---

*Concept version: 1.1 — 2026-06-13 (retry/refresh of V1.0, 2026-05-21)*
*Autor: Iskra Ivanović, Kreativni Direktor, Gari Daily Games*
