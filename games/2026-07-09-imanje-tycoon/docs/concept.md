# Concept: Imanje Tycoon
*GDG 2026-07-09 — Iskra Ivanović*

---

## 1. Naziv

**Imanje Tycoon** (radni naslov, zadržava se — direktan i jasan za brand hook)

Alt: *Guncati: Od Nule do Faze C*

---

## 2. Žanr

**Multi-layer Idle/Tycoon + Farm Simulation**

Tri sloja koji se međusobno hrane:
- **Macro layer** (sezona/nedelja): strateško planiranje, kapitalne investicije, prodajni kanali
- **Micro layer** (dnevna sesija): operativna izvedba — sadnja, berba, inokulacija, nega ribnjaka
- **Meta progresija**: karijerni put ka "Faza C — komercijalno stabilno", sezonski prestige sa trajnim multiplierima

---

## 3. Premisa

Nasledio si / zakupio parcelu na ivici sela. Ništa na njoj, 5.000 dinara u džepu i Brana Barakanjin nacrt u ruci. Cilj je da za 50 realnih sati gameplay-a dostigneš **Fazu C** — imanje koje samo sebe finansira, ima B2B kupce i može da organizuje plaćene masterclasseve. Svaka odluka ima realne guncatske ekonomske posledice: da li prvo otvoriš ribnjak ili plastenik određuje kaš-flo sledeće četiri sezone.

Ovo nije bašta simulator. Ovo je **sistemsko razmišljanje kroz permakulturnu ekonomiku**.

---

## 4. Core Gameplay Loop

### Macro Layer (Sezona = 1 nedelja real-time ≈ 30-45 min play)

Igrač na početku svake sezone donosi strateške odluke:

| Odluka | Opcije | Trošak | Output |
|--------|--------|--------|--------|
| **Investicija** | Jezero (kopanje), Plastenik (konstrukcija), Pečurke (supstrat) | Kapital + vreme izgradnje | Nova produkcijska grana |
| **Prodajni kanal** | Pijaca, Restoran B2B, CSA pretplata, Webshop | Osnivački trošak + provizija | Cena × volumen = prihod |
| **Networking** | Masterclass organizacija, Partnerstvo, Sajam | Vreme + kapital | Reputacija × multiplier |
| **Resursi** | Voda, Električna, Radni sati (igrač + najamni radnik) | Mesečni operativni troškovi | Kapacitet sistema |

Makro odluke se "zaključaju" na sezonu — nema pauze na pola puta. Ovo forsira planiranje.

### Micro Layer (Dnevna sesija = idle tick + aktivni ritam)

Svaki dan unutar sezone igrač obavlja mikro-akcije koje nagrade strateške investicije:

**Jezero (ribnjak + patke + biofiltracija):**
- Hranjenje ribe (2× dnevno klik ili auto-feeder upgrade)
- Praćenje pH / O2 biofiltracijom (mini puzzle: uravnoteži aeraciju vs. troškove struje)
- Sakupljanje jaja pataka (pasivan prihod, raste sa populacijom)
- Berba ribe po sezoni (aktivni event: birkaš gde koja riba — veće instance = veća cena)

**Plastenik (povrće, semenke, mikrobiljke):**
- Sadnja (izaberi kulturu za ovu sezonu — tržišna cena fluktuira)
- Zalijevanje / đubrenje (idle tick, ubrzava se upgradima: kap-kap, komposter)
- Berba + pakovanje (aktivni event: brzi klik u prozoru zrelosti — kasniš = gubitak)

**Pečurke (inokulacija, inkubacija, berba):**
- Inokulacija blokova (priprema supstrata — vremenski gate: bukovača 18-21 dana)
- Inkubacija monitoring (temperatura alarm — ne smeš zaboraviti, inače mold)
- Berba talasa (2-3 talasa po bloku, svaki manji — realna biologija)
- Sušenje / pakovanje (dodaje vrednost, ali treba sušara — investicija Makroa)

### Carry-Over mehanizam (Macro → Micro)

- Kapacitet koji si izgradio u Makroo direktno određuje Mikro yield kapacitet
- Prodajni kanal koji si potpisao određuje cenu po kojoj Mikro berba ide
- Reputacija (od Masterclassa) povećava B2B cenu za sve grane
- Radni sati (Makro budžet) limitiraju koliko Mikro akcija možeš napraviti dnevno — najmi radnike ili ugradi automation

---

## 5. Hook — Zašto 15+ minuta, ne 5

**Ekonomska napetost:** Igrač vidi da je plastenik profitabilan u prvoj godini, ali ribnjak nosi duplu zaradu od 3. sezone nadalje. Koji put biramo? Ovo pitanje muči igrača između sesija.

**Sezonski timer:** Sezona se završava bez obzira da li si spreman. Ako nisi posadio ništa u Makroo — prazna berba. Ova urgentnost drži igrača.

**Tri produktivne grane koje se sinergišu:** Ribnjak → izmet pataka → đubrivo za plastenik → bogatiji supstrat za pečurke → mulj iz ribnjaka → humus nazad. Svaka veza između grana je gameplay nagrada — igrač sam otkriva sinergije.

**Faze kao narrative milestones:** Dostizanje Faze A (prva komercijalna berba), Faze B (B2B ugovor), Faze C (Masterclass) su emocionalni vrhunci koji su jasno naznačeni — igrač uvek zna gdje ide i koliko je blizu.

**Real brojke kao gamifikacija:** "Ribnjak 200m² = 2.400-3.000 kg/godišnje = 720.000-900.000 din prihoda" — kad igrač to dostigne u igri, ta informacija je stvarna. Igrač izlazi pametniji nego što je ušao.

---

## 6. Vizuelna Estetika

**Stil:** CSS/Canvas pixel art, izometrički 2.5D pogled odozgo na imanje. Nije realistično — je čisto, čitljivo, "tween game" estetika (Stardew Valley informisano, ali čistije za mobile).

**Paleta boja:**

| Element | Boja | HEX |
|---------|------|-----|
| Zemlja (osnova) | Topla smeđa | `#6B4C2A` |
| Trava / rast | Guncati zelena | `#4A7C3F` |
| Voda (ribnjak) | Mirna plava | `#3A7BD5` |
| Plastenik (staklo) | Blijedo zelena | `#A8D5A2` |
| Pečurke | Bela + lila nijansa | `#E8D5F0` |
| UI / HUD | Off-white + tamno siva | `#F5F0E8` / `#2D2D2D` |
| Kapital $ | Toplo zlatna | `#D4A017` |
| Akcent (Faza event) | Guncati narandžasta | `#E07B39` |

**Ambient:** Jutarnje svetlo, blage senke, sezonske promene (sneg zimi utiče na yield, prolećno buđenje vizuelni event). Patke plivaju po ribnjaku. Pečurke rastu vidljivo tokom inkubacije. Plastenik menja boju kad je pun biljaka.

---

## 7. Audio Mood

**Muzika:** Ambient folk — srpski instrumentalni motivi (frula, gusle kao bas element), spor BPM (70-80), bez pevanja. Evolves po sezonama: zima = sporiji, tišiji; leto = življe, više slojeva. Web Audio API generisano.

**SFX:**
- Berba klik: zadovoljavajuć "chomp" / "pluck" zvuk
- Ribnjak: blago prskanje vode u idle loopi
- Pečurke inkubacija: tiho humanje tople prostorije
- Masterclass event: aplauz + "ding" zvono
- Alarm (temperatura, pH): delikatno ali jasno upozorenje, ne anxiety-inducing

**Opšta atmosfera:** Produktivno mirenje sa ritmom prirode. Nije stresno — je fokusirano.

---

## 8. Win Condition / Meta Goal

**Primary goal:** Dostići **Fazu C — Komercijalno stabilno** — mesečni operativni surplus ≥ 150.000 din, aktivni B2B ugovor za bar 2 grane, jedan održani Masterclass sa ≥ 10 učesnika.

**Prestige moment:** Na kraju Faze C, igrač dobija opciju: **Sezonski reset** — imanje se "vraća" na Fazu A ali sa trajnim multiplierima (iskustvo prethodnog ciklusa povećava growth rate za sledeći). Svaki reset donosi:
- +15% prinos na sve grane (akumulativno)
- Novi scenario (nova lokacija: Guncati → Avala → Štrand lokacija uz reku)
- Ekskluzivna biljka/riba/vrsta pečurke za taj scenario

**Branching ishodi:**
- Igrač koji investira SAMO u jednu granu raste brže ali je ranjiviji na tržišne šokove
- Igrač koji balansira sve tri grane sporije raste ali unlockuje sinergijske bonuse
- Igrač koji prioritizuje Masterclass gradi "zajednicu" (reputacijski multiplier) koji ubrzava Fazu C

---

## 9. brand_serves

### Guncati (primary)
- **Edukacija kao gameplay:** Svaka grana (jezero, plastenik, pečurke) koristi realne guncatske ekonomske parametre. Igrač izlazi znajući da je bukovača isplativija od šampinjona na malim površinama, i zašto.
- **Lead magnet za B2B posete:** "Odigraj pre nego što dođeš" — Faza B Masterclass event u igri direktno nagoveštava Guncati masterclass program. CTA na kraju Faze B ekrana: "Odigraj i dođi na pravi Masterclass."
- **Tom Sawyer model demonstriran:** Igrač kroz igru razumeva permakultura = sistemsko razmišljanje. Nije bašta. Nije hobby. Je ozbiljan ekonomski model.
- **Konkretan sadržaj za social:** Screenshot Faze C → "Dostigao sam Fazu C u Imanje Tycoon — 3 sezone, 2 B2B ugovora, 1 Masterclass. Sledeći korak: pravi Guncati." Shareovanjivo.

### MKDSLend (secondary)
- **"Zabavni radni park" filozofija demonstrirana kroz gameplay:** Svaka Mikro akcija ima "rad = igra" logiku — berba je mini-game, planiranje je puzzle, ali sav taj rad gradi nešto stvarno. Igrač oseća MKDSLend viziju, ne samo čuje o njoj.
- **Masterclass kao brand moment:** Kad igrač organizuje prvu Masterclass u igri, pojavi se "MKDSLend Network" logo. Nije ad — je gameplay nagrada. Zajednica = accelerator za Fazu C.

---

## 10. Targetirana Dužina Sesije

| Sesija | Trajanje | Šta igrač radi |
|--------|----------|----------------|
| Prva sesija (onboarding) | 15-20 minuta | Tutorial: postavi jednu granu (preporučeno pečurke — najbrže rezultati), nauči Makro/Mikro ritam |
| Redovna sesija (middle game) | 20-35 minuta | Pregled sezone, berba, Mikro akcije, Makro planiranje sledeće sezone, eventualni event |
| Prestige / Faza event sesija | 45-60 minuta | Dostizanje Faze C, Prestige odluka, novi scenario setup |
| **Ukupno do prvog prestige-a** | **40-50 sati** (real time, spread across sessions) | Simulira realan Guncati timeline Faze 0 → C |

Idle elementi znače da igrač može otvoriti igru na 5 minuta, pokrenuti berbu, i zatvoriti — ali maksimalne nagrade i napredovanje zahtevaju aktivno planiranje.

---

## 11. Prestige / Replay Hook

**Sezonski prestige (soft reset):** Na kraju Faze C, igrač bira reset koji čuva sve permanentne bafove ali vraća imanje na početak novog scenarija. Svaki prestige ciklus traje ~10-15 sati kraće jer su multipliieri ugrađeni.

**Tri scenarija (unlock redosledom):**
1. **Guncati** (default) — ravan teren, srpski kontekst, sve tri grane jednako pristupačne
2. **Avala** — brežuljkast teren, ograničena voda, pečurke i šumske vrste su povoljnije; ribnjak je skuplji
3. **Štrand** (Novi Sad) — urbani kontekst, premium cene za tržnicu, ali visoki troškovi zakupa i regulativa

**Achievement sistem:** 30+ achievementa koji nagrađuju specifične puteve (mono-grana run, speed Faza C, max reputacija bez B2B, itd.) — svaki achievement objašnjava ZAŠTO je ta strategija moguća u realnoj permakulturi.

**Zajednica multiplier:** Svaki Masterclass u igri koji igrač organizuje gradi "Alumni mrežu" — NPCs koji vraćaju periodične bonuse (referrals, bulk cene, know-how). Na prestige-u, Alumni mreža se prenosi u novi scenario sa 50% snage.

---

## Napomene za Mile (GDD ulaz)

- **Ekonomika jezera:** baza yield = 12 kg/m²/god, cijena smuđ = 1.200 din/kg, šaran = 650 din/kg; površina 200m² je starter; patke = 80 jaja/god/patka, cena jajeta 35 din
- **Ekonomika pečurki:** supstrat prinos 1:1 (1 kg supstrata = 1 kg bukovače kroz 3 talasa), bukovača prodajna cena 350-450 din/kg, oyster 600-800 din/kg; blok = 5 kg supstrata = starter
- **Ekonomika plastenika:** paradajz = 25-30 kg/m²/sezona, cena 180-250 din/kg, ali 4-5 mesečni ciklus; mikrobiljke = brži obrt (21 dan), premium cena 800-1200 din/kg
- **Sinergija kao progression gate:** Plastenik → Pečurke sinergija (komposter → supstrat) treba biti Faza A unlock. Ribnjak → Plastenik (mulj đubrivo) treba biti Faza B unlock.
- **Resource troškovi:** Voda, struja, radni sati kao svakodnevni "tick" koji smanjuje kapital — igra ne sme da bude samo prihodi, troškovi moraju biti vidljivi i upravljivi.

---

*Iskra Ivanović, 2026-07-09*
*"Ovo nije bašta. Ovo je sistem koji se uči kroz igru."*
