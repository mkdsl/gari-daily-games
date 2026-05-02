# Premortem — Mozaik Ludila

## Steelmanning (razumem koncept)

Sine je pogodio nešto važno: **Tetris zamor dolazi od gravitacije i vremenskog pritiska**, a ne od prostorne taktike same po sebi. Mozaik Ludila uklanja gravitaciju (fragment ideš TI — ne on), ali zadržava fundamentalnu tenziju "board se puni". Rezultat je hibrid koji je istovremeno taktičniji (slobodno postavljanje = više izbora = više agencije) i meditativniji (nema padajućeg objekta koji te terira).

Pet boja + tri condition za brisanje (red, kolona, 2×2 kvadrant) je zanimljivo jer kvadrant uslovi igrača da razmišlja **lokalno** (gusti klasteri), dok red/kolona rade **globalno** (horizontalno/vertikalno iščišćavanje). To su dva mentalna moda u jednoj igri — i oni se taktički suprotstavljaju. Mozak mora da drži oba u glavi, što generuje onaj "još jedan potez" efekat.

Mediteranska/vizantijska estetika je pametan izbor: mozaici su **kulturno asocirani sa savršenošću i completeness** — što pojačava psihološki reward matcha. Estetika i mehanika komuniciraju.

Win condition od 5000 poena je hrabar izbor — daje definisan kraj sesije koji je popularan u puzzle mobilnim igrama (Candy Crush je naučio sve nas da volimo progress bar). Bez toga bi igra bila beskonačna što bi smanjilo dnevnu privlačnost.

---

## Rizici i pukotine

### Showstopper rizici (blokatori implementacije)

**1. Detekcija validnih pozicija za postavljanje — Algoritmičke složenosti**
- **Problem:** Game Over se triggeruje "kada fragment ne može stati ni na jedno mesto". Ovo znači da na SVAKOM potezu mora da se ispita da li novi fragment (koji može biti L, T, I, S oblika u 4 rotacije) ima barem jedno validno mesto na 8×8 gridi. To je 64 × 4 rotacije = 256 provjera po poteza.
- **Zašto je problem:** Nije samo "je li ćelija prazna" — fragment je polimino od 1–4 pločice, svaka rotacija ima drugačiji footprint. Bez prekalkulisanih footprint mapa, svaki placement check je ručni algoritam koji može imati off-by-one bugove koji čine game over preuranjenim ili zakasnjenim.
- **Ozbiljnost:** VISOK (nije showstopper, ali ako se implementira pogrešno — igra je broken na kraju svake sesije)
- **Alternativa:** Pre game starta, prekalkuliši shape footprints za sve 4 rotacije svakog oblika i snimi kao const array. Validacija je tada O(n) array lookup, ne ad-hoc geometrija.

**2. Drag-and-drop bez native HTML5 Drag API na Canvas**
- **Problem:** Concept kaže Canvas rendering (prirodna pretpostavka za grid igre). HTML5 Drag & Drop API ne radi na Canvas elementima — sve mora biti custom: mousedown → mousemove → mouseup + touch events.
- **Zašto je problem:** Custom drag mora pratiti: (a) offset od tačke hvatanja do origin fragmenta, (b) snapping na grid ćeliju, (c) vizuelni feedback tokom dragging-a (ghost), (d) odbijanje nevažećeg dropa. Ovo je 150–250 linija samo za input handling.
- **Ozbiljnost:** SREDNJI (iskusan JS developer to zna da implementira, ali je bug-prone — posebno na mobile)
- **Alternativa:** Razmotri klik-za-selekciju + klik-za-postavljanje umesto drag-and-drop. Duplo jednostavnija implementacija, radi identično na mobile i desktop, nema ghost rendering problema.

**3. Particle sistem pri match explosion**
- **Problem:** Concept eksplicitno zahteva "prsnu u sitne krhotine (CSS/Canvas particle burst)" i "zlatne čestice" za combo. Particle sistem u Vanilla Canvas je 50–100+ linija, i ako nije pool-ovan, može uzrokovati GC hiccup-ove koji degradiraju animacije.
- **Ozbiljnost:** NIZAK do SREDNJI (igra radi bez partikala, ali je "feel" kompletno drugačiji)
- **Alternativa:** Implementiraj najpre bez partikala, dodaj na kraju. Ako ostane vremena — simple radial burst od 8–12 statičnih čestica bez physics-a (samo linear interpolation ka random offsets) je dovoljno vizuelno efektno i jeftino za implementaciju.

---

### Gameplay rizici (igrivost)

**4. "Dead zone" problem — Board se puni pre nego što igrač nešto shvati**
- **Problem:** Sa 5 boja i slobodnim postavljanjem, igrač bez iskustva prirodno distribuira boje nasumično. Red od 8 pločica sa 5 boja NIKAD ne uklanja se (samo jednobojna). Početnik može puniti board "taktički" a zapravo ne napraviti nijedan match i doživeti game over za 2 minuta bez ijednog poena osim onih od plasmana.
- **Zašto je problem:** Negativna feedback petlja. Igrač ne razume zašto gubi. Bez tutoriala ili vizuelnog hint-a da "ove 3 plava u redu trebaju još 5 plavih" — frustracija bez učenja.
- **Ozbiljnost:** VISOK
- **Alternativa:** Dodati vizuelni hint-sistem — red/kolona/kvadrant koji imaju 4+ pločice iste boje dobijaju blagi glow/outline. Ovo ne daje odgovor ali pokazuje "vrelo je ovde". Alternativno — smanjiti grid na 6×6 za manje zastrašujući start.

**5. Scoring ekonomija nije balansirani za 5000 cilj**
- **Problem:** 1 pločica = 10 poena. Brisanje kompletnog reda na 8×8 znači 8 pločica = 80 poena (bez combo). Za 5000 poena treba ~62 kompletna reda. Na 8×8 gridi, samo redovi od iste boje se brišu — to je ekstremno teško postići konzistentno. Sa combo ×2 i ×3 matematika postaje bolja, ali combo je nestabilan.
- **Zašto je problem:** Igrač koji igra 3–5 minuta verovatno neće dostići 5000 bez combo lanca. "Progress bar" stagnira i osećaj progresa se gubi.
- **Ozbiljnost:** SREDNJI
- **Alternativa:** Smanjiti win target na 2500–3000, ili dodati placement bonus (svaka pločica postavljena = +1) da progress bar uvek lagano ide napred.

**6. Fragmenti bez rotacije = ograničena taktika**
- **Problem:** Concept ne pominje rotaciju fragmenata. Bez rotacije, L-oblik uvek ide u jednom smeru, što drastično smanjuje broj izbora. Sa rotacijom — taktika eksplodira (4× više mogućnosti po fragmentu).
- **Zašto je problem:** Bez rotacije, ponekad fragment jednostavno "ne odgovara nigde korisno" i igrač je prisiljen na loš potez. To je frustriranje bez agencije.
- **Ozbiljnost:** SREDNJI
- **Alternativa:** Dodati rotaciju klikom (tap na fragment pre postavljanja). Jedan klik = 90° rotacija. Implementacijski trivijalno (transpose + reverse footprint matrice).

---

### Tehnički rizici (implementacija)

**7. Render arhitektura — Canvas ili DOM?**
- **Problem:** Concept implicira Canvas ("sjaj pri matchu", "particle burst"), ali 8×8 grid od clickable elemenata je prirodno DOM (CSS grid + div pločice). Mešanje Canvas i DOM je jedno od najčešćih grešaka u browser game razvoju.
- **Zašto je problem:** Ako je sve na Canvas-u — input handling mora biti custom (vidi rizik #2). Ako je sve DOM — animacije su CSS transition-based što je lakše ali manje fleksibilno za particle efekte.
- **Ozbiljnost:** SREDNJI (arhitekturalna odluka koja ne može se promeniti na pola puta)
- **Alternativa:** Preporučujem **pure Canvas** — konzistentno, predictable, radi isto na svim platformama. DOM grid + Canvas overlay je anti-pattern za ovaj scope.

**8. Boja-based matching sa 5 boja — Colorblind pristupačnost**
- **Problem:** Igra je 100% zavisna od razlikovanja boja. Sa 5 boja (terakota, safir, smaragd, zlatna, rubin), određene kombinacije su nečitljive za ~8% muških igrača (protanopia/deuteranopia).
- **Ozbiljnost:** NIZAK (nije bloker za dnevnu igru, ali je elegantno rešivo)
- **Alternativa:** Dodati pattern/texture na svaku pločicu (dots, stripes, solid, crosshatch) pored boje. Ovo je 20 linija CSS/Canvas koda i rešava problem kompletno.

**9. Matchanje po 3 uslova istovremeno — Redosled evaluacije**
- **Problem:** Šta se dešava kada jedan potez istovremeno kompletira red I kvadrant koji dele iste ćelije? Ćelije se brišu jednom ili dva puta? Koji score se daje? Koji combo se triggeruje?
- **Zašto je problem:** Nema specifikacije u konceptu. Developer mora izmisliti pravila, a ako su pogrešna, score može biti dupliran ili combo nikad ne puca.
- **Ozbiljnost:** SREDNJI (sitna ali kritična specifikacijska rupa)
- **Alternativa:** Definisati u GDD: "svi uslovi se evaluiraju istovremeno posle svakog postavljanja, sve matching ćelije iz svih uslova se sakupljaju u SET (bez duplikata), brišu se odjednom, score se računa jednom po ćeliji".

---

### Mobile rizici

**10. Touch drag-and-drop na malim ekranima**
- **Problem:** 8×8 grid na mobilnom ekranu znači ćelije od ~38×38px na 320px širinom telefonu. Prst je ~50px u dijametru — "fat finger problem". Drag na takvim ćelijama je neprecizno i frustrirajuće.
- **Zašto je problem:** Core mehanika igre je drag-and-drop. Ako ne radi dobro na mobile — igra ne radi na mobile.
- **Ozbiljnost:** VISOK za mobile, NIZAK za desktop
- **Alternativa A:** Klik-za-selekciju + klik-za-postavljanje (eliminira drag kompleksno) — preporučujem. Alternativa B: Grid 6×6 umesto 8×8 = veće ćelije = manja preciznost potrebna. Alternativa C: Fragment "prilepljeni" za prst sa vizuelnim snap preview — touch offset calibration da prst ne blokira pogled.

**11. Scroll vs. drag conflict na touch**
- **Problem:** Mobilni browseri interpretiraju vertical touch-move kao scroll. Custom touchmove handler mora pozvati `event.preventDefault()` da spreči scroll, ali to blokira accessibility scroll na ostatku stranice i može izazvati browser warning (passive event listener).
- **Ozbiljnost:** SREDNJI
- **Alternativa:** Ceo game wrapper ima `touch-action: none` u CSS-u, plus `addEventListener('touchmove', handler, { passive: false })`. Ovo je standardno rešenje — samo mora biti eksplicitno u implementaciji.

---

## Verdict

**DRŽI UZ KOREKCIJE**

Koncept je solidan. Mehanika je proven (block-placement + color-matching je zlatna kombinacija), estetika je originalna i vizuelno distinktivna, hook je realan. Ovo MOŽE biti dobra igra.

Ali ima **dve kritične korekcije** koje Mile Mehanika mora ugraditi u GDD pre implementacije, i **jednu implementacionu odluku** koju Jova mora doneti na početku:

### Obavezne korekcije za GDD (Mile):

1. **Input model: klik-za-selekciju umesto drag-and-drop.** Ovo rešava mobile rizik #10 i implementacioni rizik #2 odjednom. Fragment se selektuje klikom/tapom, pojavi se preview na gridu gde miš/prst prelazi, potvrdi se drugim klikom/tapom. Intuitivno, radi na svim uređajima bez fat-finger problema.

2. **Vizuelni hint sistem:** Redovi/kolone/kvadranti sa 3+ pločicama iste boje dobijaju blagi glow outline te boje. Ovo je UX neophodnost — bez njega početnik ne razume board state.

3. **Definisati redosled evaluacije matcha** u GDD: sve uslove evaluirati odjednom, sve matching ćelije u SET (bez duplikata), brisati jednom, score jednom po ćeliji.

4. **Scoring rebalans:** Win target spustiti na 2500 ili dodati placement bonus (+1 po postavljenoj pločici) da progress bar uvek lagano napreduje čak i bez matcheva.

### Preporučeno za implementaciju (Jova):

5. **Pure Canvas arhitektura** — ne mešati DOM i Canvas. Cela igra, grid, fragmenti, HUD — sve na jednom Canvas elementu. Input je custom mouse/touch na canvas-u.

6. **Prekalkulisati shape footprints** kao const arrays na početku — ne računati ih dinamički pri svakom placement checku.

Ako se ovih 4 korekcije ugrade u GDD — implementacija je realna u okviru 3–4h sesije i igra će raditi na mobile i desktop. Bez korekcija #1 i #2 — postoji realna šansa da igra bude tehnički funkcionalna ali neigrativa (frustrujuća na mobile, nejasna početniku).
