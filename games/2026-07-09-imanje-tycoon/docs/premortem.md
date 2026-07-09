# Premortem: Imanje Tycoon
*Nega Negovanović, 2026-07-09*

---

## Globalni Verdict

**DRŽI UZ KOREKCIJE** — ali korekcije nisu kozmetičke. Ekonomska osnova je solidna, brand sprega sa Guncati je stvarna (ne dekorativna), i multi-layer dizajn ima potencijal. Međutim, tri strukturna problema moraju biti rešena u GDD-u pre nego što Jova napiše i jednu liniju koda: trajanje igre (50h je pogubno za HTML5), vidljivost Macro→Micro veze (igrač mora videti kapacitetni plafon u Micro UI), i scope renderinga (izometrija + tri sub-game + multi-layer u jednoj 4-5h impl sesiji nije izvodljivo).

---

## CRITICAL Rizici — Showstopperi

### CRITICAL-1: 50 sati do prestige ubija igru kao brand asset

**Specifičan problem:** Concept eksplicitno targetira "40-50 sati real-time gameplay" do Faze C. Prosečna HTML5 sesija traje 10-20 minuta. Čak i lojalni igrač koji se vraća svaki dan da odigra 20 minuta dostigne 50h posle 150 dana, što je bukvalno 5 meseci svakodnevnog igranja.

**Konkretan scenario propasti:** Guncati šalje potencijalnog posetioca na igru kao pre-event sadržaj (za masterclass ili posetu). Igrač igra 20 minuta, dostigne Fazu 0→A tranziciju, vidi da je "4+ sezone" do Faze C, i zatvori browser. Niti je edukovan, niti je konvertovan, niti shaeruje. Brand asset je bio beskoristan jer je win condition bio nedostižan u realnom engagement prozoru.

**Jedina prihvatljiva korekcija:** Kompresija celokupnog timeline-a. Faza A = 30-45 minuta, Faza B = 90-120 minuta, Faza C = 4-6 sati ukupno. Sve tri Faze moraju biti dostižne u jednoj vikend sesiji od 5-6 sati. Ekonomske cifre ostaju realne, ali "sezone" moraju biti kraće (npr. 1 in-game sezona = 5-8 minuta real-time, ne 30-45).

---

### CRITICAL-2: Macro→Micro veza je nevidljiva igraču u kritičnom trenutku odluke

**Specifičan problem:** Concept kaže "kapacitet koji si izgradio u Makroo direktno određuje Mikro yield kapacitet." Ovo je tačno i dobra mehanika, ali NIGDE u concept-u nije opisano kako igrač vidi taj kapacitet pre nego što potroši kapital.

**Konkretan scenario propasti:** Igrač investira 15.000 din u ribnjak (sve što ima u Fazi A). Micro layer prikazuje "Hranjenje ribe" i "Praćenje pH" kao svakodnevne akcije. Igrač klika svaki dan. Na kraju sezone, prihod od ribnjaka je 4.800 din — igrač ne razume zašto je tako mali, jer nigde nije video da 200m² ribnjak ima kapacitet od svega 2.400 kg/god, i da mu bez prodajnog kanala samo pijaca kupuje po 25% ispod tržišne cene. Investicija se čini kao greška igre, ne kao njegova strateška odluka.

**Jedina prihvatljiva korekcija:** Micro UI mora imati fiksni widget pre svake grane koji prikazuje: "Ribnjak kapacitet: 200m² → potencijal 2.400 kg/god → sa pijačnim kanalom = 1.560.000 din/god maksimum. Trenutno: [X%] iskorišćeno." Ovaj widget se prikazuje KAD igrač razmatra investiciju u Makroo, NE tek posle investicije. Mile mora ovo ugraditi kao obavezan "pre-invest projection screen" u GDD, ne ostaviti za impl fazu da improvizuje.

---

### CRITICAL-3: Izometrijski 2.5D Canvas + tri Micro sub-game = impl scope koji ne staje u 4-5 sati

**Specifičan problem:** Concept zahteva: (1) izometrijski 2.5D pixel art render engine, (2) ribnjak pH/O2 balans mini-puzzle, (3) plastenik berba timing window (brzoklik u prozoru zrelosti), (4) pečurke temperatura alarm + inkubacija monitoring, (5) Macro strateški planning UI, (6) prestige sistem, (7) tri scenarija (Guncati/Avala/Štrand), (8) Web Audio folk ambient generisan procedualno. Ovo nije jedna igra — ovo je pet igara zapakovanih u jedan manifest.json.

**Konkretan scenario propasti:** Jova počinje impl stage, gradi izometrijsko renderovanje (4-6 sati samo za to), ostaje bez token budžeta pre nego što implementira Micro sub-game za ribnjak. Deploy je placeholder sa lepim izometrijskim tileovima i praznim ribnjak tileom bez funkcionalnosti. Beta Trio u polish-u nema šta da testira.

**Jedina prihvatljiva korekcija:** Scope rezovi u GDD-u:
- Vizuelno: flat top-down 2D (kao Stardew Valley odozgo, bez izometrije) ili čak dashboard/panel UI (tabela kolona po granama) — izometrija je vizuelni luxury koji kosta 30-40% impl budžeta
- Micro sub-game: zadržati JEDAN aktivan mini-game (preporučujem pečurke inkubacija/berba — najunikalniji, najpedagoškiji), ostale dve grane mogu biti "auto-tick + upgrade" dok ne dođe do Faze B
- Audio: elektronski ambient sa folk-inspirisanom lestvom (Ceca može ovo), NE procedualni folk instrumenti — gusle/frula procedualno je nerealan zadatak

---

## HIGH Rizici — Ozbiljno Oštećuju Iskustvo

### HIGH-1: Cena paradajza fluktuira bez igraču vidljivog uzroka

Concept pominje tržišnu fluktuaciju cena plastenika. U igri bez transparentnog kauzalnog lanca, fluktuacija se doživljava kao random punitivnost, ne kao tržišna logika. Ako igrač posadi paradajz (4-5 mesečni ciklus), a cena padne 35% u berbi i ne postoji ni signal ni objašnjenje, odreagovace "igra me je prevarila."

**Korekcija:** Mile mora dizajnirati "tržišni radar" — 2-sezonski forecast koji se vidi u Macro planning ekranu pre sadnje. Ne treba da bude tačan 100% (tržište može da varira), ali mora biti dostupan. Format: "Proleće 2: paradajz — 220-250 din/kg (normalna potražnja), mikrobiljke — 950-1100 din/kg (visoka potražnja, restoran tender)."

---

### HIGH-2: Tri putanja (mono-grana / balans / Masterclass fokus) bez ranog signaliranja u FTUE

Concept preporučuje pečurke kao onboarding starter jer "najbrže rezultati." Međutim, pečurke su mono-grana putanja. Ako igrač 60+ minuta investira samo u pečurke i tek u Fazi A otkrije da je "Plastenik→Pečurke sinergija Faza A unlock" znači da mu treba plastenik koji nikad nije izgradio — osetiće da je igra skrivala ključnu informaciju.

**Korekcija:** Sinergijsko stablo mora biti vidljivo od prvog minuta (locked ali vidljivo — kao tech tree u strategy igrama). "Komposter (Faza A): zahteva Plastenik + Pečurke grane — povećava supstrat prinos 40%" mora biti vizualizovano BEFORE igrač donese prvu Macro investicijsku odluku.

---

### HIGH-3: Berba timing window ("kasniš = gubitak") je dizajnerska kontradikcija u idle igri

Concept opisuje plastenik berbu kao "aktivni event: brzi klik u prozoru zrelosti — kasniš = gubitak." Ovo je mehanika stresan vremenskog pritiska. U istom pasusu, audio mood kaže "nije stresno — je fokusirano." Ovo su oprečna iskustva.

Šire: idle igre funkcionišu jer NAGRAĐUJU offline vreme. Penalizovanje igrača koji je bio offline 2 sata i propustio berbu window direktno se protivi idle žanru. Svako ko igra igru u transportu ili u pauzama od posla izgubice povrće i osetiti da je igra nepravedna.

**Korekcija:** Berba mora imati GRACE period (npr. 4h od zrelosti pre nego što počne da gubi vrednost, ne instant gubitak). Alternativa: "zrela berba" se automatski ubacuje u "na čekanju" state sa smanjenjem cene od 20% posle grace perioda — igrač gubi nešto ali ne gubi sve.

---

### HIGH-4: Alumni mreža "50% na prestige" je vaga bez jedinice mere

"Alumni mreža prenosi 50% na prestige" — ovo je apstraktan broj. Šta je Alumni mreža u kodu? Broj (npr. "Alumni Points: 847")? Set NPC-a sa individualnim bonusima? Multiplier koji se primenjuje na reputaciju? Bez konkretnog dizajna, ovo je flavor text koji implementator ne može da prevede u sistem.

**Korekcija:** Mile mora definisati Alumni mrežu kao konkretan roster: 5-7 named NPC-a, svaki sa jednom aktivnom bonusom (npr. "Marko Petrić — chef iz Beograda: +12% B2B cena za sve grane", "Ivana Đorđević — CSA subscriber: +8 kg/mesec auto-narudžbina bukovače"). Na prestiže, igrač zadržava 50% = zaokruži dole na celi broj NPC-a. Ovo je i game design i narativna nagrada.

---

## MEDIUM Rizici — Treba Pažnju

### MEDIUM-1: Temperature alarm za pečurke tokom noćnih sati

Pečurke inkubacija monitoring uključuje "temperatura alarm — ne smeš zaboraviti, inače mold." Ako je alarm real-time (browser notifikacija ili u-game vizualni signal koji se pojavi tokom sesije igrač mora odreagovati), ovo je OK. Ako alarm može da se pojavi u 2:00 ujutru (ili tokom Macro sezone pauze kada igrač ne igra), a mold nastane bez šanse za korekciju — ovo je punitivna mehanika koja alijenira casual igrača.

**Korekcija:** Alarm mora biti "soft fail" — mold smanjuje prinos za 25%, ali se može lečiti (antibiofilm supstrat — skuplje ali dostupno). Hard fail (celi blok propao) je presurov za HTML5 kontekst.

---

### MEDIUM-2: pH/O2 mini-puzzle u ribnjaku na mobilnom bez jasnog UI dizajna

"Uravnoteži aeraciju vs. troškove struje" zvuči elegantno. Međutim, ribnjak je samo jedna od tri Micro grane, plus postoje Macro odluke, plus berba, plus pečurke. Ribnjak mini-puzzle mora stati u mali region ekrana bez dominiranja sesijskog ritma. Concept ne opisuje niti jedan UI wireframe za ovu mehaniku.

**Korekcija:** Mile ili Joca Džojstik mora definisati konkretni UI pre impl: "Ribnjak panel = slider aeracija (0-100%), dva indikatora (O2 zeleno/narandžasto/crveno, Operativni troškovi crta), jedan dugme 'Potvrdi dnevnu aeraciju'. Prosečno 15 sekundi interakcije po dnevnom tiku."

---

### MEDIUM-3: html2canvas screenshot u Canvas igri — tehničko upozorenje

Share moment ("Screenshot Faze C → shareovanjivo") zavisi od html2canvas. html2canvas radi pouzdano na DOM sadržaju, ali ima poznate probleme sa Canvas elementima — ponekad renderuje prazan screenshot ili parcijalno proseče iframe sadržaj. Ako je igra pretežno Canvas-rendered (neophodnost za izometriju), share moment možda neće raditi od prvog beta testa.

**Korekcija:** Jova mora testirati html2canvas + Canvas kompatibilnost KORAK 4f i odlučiti: (a) screenshot se radi direktno od Canvas.toDataURL() i pakuje u share payload, (b) koristi server-side OG image generator (nije opcija za GitHub Pages static), ili (c) share prikazuje statički achievement card umesto screenshota.

---

### MEDIUM-4: Offline progress pravila nisu definisana

Concept kaže "idle elements znače da igrač može otvoriti igru na 5 minuta, pokrenuti berbu, i zatvoriti" ali ne definiše šta se dešava dok je igra zatvorena. Da li ribnjak nastavlja da raste offline? Da li pečurke inkubiraju offline? Ako inkubiraju, može li temperatura alarm da se "okine" offline? Ako temperatura alarm čeka online session — zašto bi igrač brinuo o njemu u realnom životu?

**Korekcija:** Mile mora definisati offline progress tabelu pre bilo kakvog koda (ovo utiče na state.js dizajn, save/load format, i sve timing sisteme):
- Ribnjak: offline rast DA, bez penalizacije
- Pečurke inkubacija: offline tik DA, temp alarm = soft warn pri sledećem login-u (ne retroaktivni mold)
- Plastenik: offline rast DA, zrelo postaje "na čekanju" (ne propadne)
- Macro sezone: ne teku offline (sesijska igra, ne real-time)

---

### MEDIUM-5: Tri scenarija (Guncati/Avala/Štrand) zahtevaju tri nezavisne ekonomske tabele

Avala ima "ograničena voda" i drugačiju vrstu prinosa (šumske). Štrand ima "visoki troškovi zakupa i regulativa." Ovo nisu vizuelni reskinovi — ovo su fundamentalno različite ekonomske konfiguracije. Ako Mile napiše samo jednu balance tabelu u GDD-u i tretira scenarija kao "isti config, drug background", impl će producirati tri identiče igre sa različitim pozadinama.

**Korekcija:** GDD mora imati TRI odvojene ekonomske tabele — jedna po scenariju. Avala tabla mora imati red za "vodna ograničenja" i penalty za ribnjak investiciju. Štrand tabla mora imati "regulatorna cena" kao mesečni operating cost. Samo Guncati je "plain" scenario; Avala i Štrand moraju imati asimetričan challenge.

---

### MEDIUM-6: "Srpski instrumentalni motivi (frula, gusle)" procedualno u Web Audio API

Web Audio API može generisati elektronski zvuk, perkusije, sinusoidalne tonove, FM synthesis. Procedualno simuliranje frule ili gusla (sa njihovim karakterističnim mikrotonal ornamentima i tembrom) je problem istraživanja zvuka, ne problema implementacije. Rezultat će najverovatnije biti "zvuk koji podseća na frulu" u najboljoj varijanti, ili "čudni sci-fi zvuk" u najgoroj.

**Korekcija za Cecu:** Ambient mora biti "folk-inspirisan harmonski ambijent" — koristi srpsku lestvicu (sa karakterističnom sekundom), spori ritam (70 BPM), ali instrumenti su: sintetički pad, pizzicato (zamena za gusle), breathe-noise oscilator (zamena za frulu). Ovo je izvodljivo i zvuči organski. Eksplicitno ne obeća frulu i gusle simulaciju u GDD-u.

---

## Brand-Utility Kritika

### Da li Guncati sprega funkcioniše ili je decoracija?

**Funkcioniše — ali samo uz jedan uslov:** Ekonomske cifre su prave (12 kg/m²/god, 1:1 prinos pečurki, smuđ 1.200 din/kg). Ovo je izuzetno vredan edukativni sloj koji drugi GDG brendirani naslovi ne poseduju. Međutim, igra sistematski izostavlja TROŠKOVE koji čine realni Guncati izazovnim:

- Nema disease/pest risk (pečurke u realnosti imaju 20-30% blok failure rate u prvoj godini)
- Nema regulatornih troškova (vodni žig za ribnjak, fitosanitarni pregled za plastenik)
- Nema learning curve (realna inokulacija bukovače zahteva sterilan supstrat — greška = kontaminacija)
- Nema infrastrukturnih troškova (bušotina za vodu, električna priključak, put)

Posledica: Igrač koji odigra Imanje Tycoon i poseti Guncati biće iznenađen da je stvarni Faza A mnogo teža od igračke Faze A. Ovo može degradovati poverenje u Guncati kao brand.

**Preporučena korekcija:** Dodati "Realni faktor" tooltip (vidljiv ali neobavezan): "U stvarnosti, prinos pečurki za početnike je 60-70% ovog broja zbog learning curve. Guncati Masterclass je tu da taj gap smanjuje." Ovaj tooltip radi dve stvari: čini igru intelektualno poštenijom I direktno promoviše Masterclass kao vrednost.

---

### Da li real ekonomika zaista edukuje?

**Delimično da.** Korelacija između sinergije Ribnjak→Plastenik (mulj đubrivo) i povećanja prinosa je prava permakulturna lekcija. Igrač koji otkrije ovu sinergiju razume bioregenerativne cikluse bolje nego što bi kroz čitanje.

**Ali:** Ekonomika prodajnih kanala (pijaca vs. restoran B2B vs. CSA pretplata) je previše apstrahovana. U igri, razlika je "pijaca = niska cena, B2B = visoka cena" — nema rizika naplate, nema B2B pregovaračkog rizika, nema sezonalnosti narudžbina. Ovo je "realistically flavored numbers" bez edukativne dubine prodajnog kanala. Mile bi trebalo da dizajnira B2B kanal kao izazov (sporadično plaćanje, minimalne količine, kvalitetni zahtevi) da bi edukacija bila stvarna.

---

### Da li Masterclass/MKDSLend brand moment deluje organski?

**MKDSLend je bolted-on.** "Kad igrač organizuje prvu Masterclass u igri, pojavi se MKDSLend Network logo" — ovo je logotip koji se pojavi u specifičnom trenutku, a zatim nestane. To nije brand integracija; to je banner ad ugrađen u gameplay event.

**Snažnija alternativa:** MKDSLend može biti in-game "platforma za profesionalizaciju" — vidljiva od Faze A kao opcija za listovanje produkata (webshop kanal = MKDSLend tržnica), i koja raste u važnosti ka Fazi C (MKDSLend Network = Alumni agregator). Na ovaj način, brand nije jedan logo-moment; brand je infrastruktura kroz koju igrač prolazi kroz celu igru.

**Masterclass event** je prirodan Guncati hook i organik ga je. Problem je timing — na 30+ sati gameplay-a po originalnom concept-u, niko ne stigne. Sa kompresovanim timelineom (6h ukupno), Masterclass event u Fazi B-→C tranziciji (oko 4h gameplay) je viable.

---

## Specifični Rizici za Multi-Layer Sistem

### Macro→Micro vidljivost kapaciteta

Ako ribnjak kapacitet nije prikazan kao konkretan ceiling u Micro UI pre nego što igrač investira, igrač ne razume zašto je investicija vredela ili nije vredela. Konkretan format koji Mile mora definisati:

Pre investicije (Macro planning ekran):
> "Ribnjak 200m²: procenjeni prihod sezona 1 = 156.000 din (sa pijačnim kanalom) / 312.000 din (sa B2B kanalom). Breakeven: sezona 2."

Tokom Micro sesije (widget, uvek vidljiv):
> "Ribnjak: 200m² | Kapacitet: 2.400 kg/god | Ovaj mesec: 187 kg harvested (93% od mesečnog potencijala)"

Bez ova dva broja, Macro→Micro je neproziran sistem.

---

### 50h do prestige je fatalno za HTML5

Ovaj rizik je izuzetno visok i zaslužuje da bude CRITICAL-1, ali je izlistanu posebno jer utiče i na multi-layer specifiku: ako je Macro layer "1 nedelja real-time = 30-45 min play" i Faza C traje "40-50 sati", to znači 60-100 Macro nedelja, što je 1-2 in-game godine. Ovo može biti zanimljivo u native mobile igri sa push notifikacijama, ne u HTML5 browser igri bez account sistema i bez persistence garancija.

HTML5 localStorage je krhak: browser clear = izgubljena igra. Igrač koji je investirao 30h i izgubi save jer je kliknuo "clear site data" u browser-u napusti igru trajno i ima negativno iskustvo sa Guncati brendom.

**Korekcija:** GDD mora definisati cloud sync ili export-import save sistem (JSON download/upload) pre impl — ovaj feature je obavezan za bilo koji HTML5 igru dužu od 3 sata gameplay.

---

## Preporuka Milu za GDD

1. **Timeline kompresija je non-negotiable:** Redesignuj ekonomiku tako da Faza C bude dostižna za 4-8 sati. Ekonomske cifre ostaju realne, ali sezone su kraće (1 in-game sezona = 5-8 min real-time).

2. **Dizajnuj "Pre-Invest Projection Screen" kao obavezan UI komponent:** Svaki Macro investment mora imati projekcioni ekran koji prikazuje procenjeni prihod po sezoni, breakeven period, i kapacitetni ceiling u Micro sloju. Bez ovoga, igrač donosi slepih odluka.

3. **Definiši offline progress tabelu u GDD kao Sekciju 0:** Ovo utiče na sve — state.js, save format, timing, alarm sistem. Ne ostaviti za impl da rešava.

4. **Tri scenarija = tri odvojene economic tabele:** Svaki scenario mora imati vlastiti set parametara (troškovi, ograničenja, cene, specifične vrste). Guncati je baseline; Avala i Štrand su izazovne varijante sa asimetričnim pravilima.

5. **Definiši Alumni mrežu kao roster NPC-a, ne kao apstraktan multiplier:** 5-7 named NPC-a, svaki sa konkretnim bonus-om koji igrač vidi i razume.

6. **Scope rezovi su neophodni — ovo nije preporuka, ovo je zahtev:** Ili izometrija PADA (prelazi se na flat 2D ili dashboard UI), ili jedan od tri Micro sub-game pada (preferujem zadržati pečurke inkubacija kao aktivan, ostale dve su auto-tick do Faze B). Kombinacija izometrija + 3 sub-game + 3 scenarija + multi-layer + prestige ne staje u 4-5h impl sesiju.

7. **Save/export sistem je obavezan feature, ne optional:** `localStorage` + JSON export/import dugme u Settings. Bez toga, 6+ sati investicija igrača je u opasnosti od browser cleare.

8. **Razreši ton kontradikciju:** Ili berba ima grace period (soft penalty), ili audio "nije stresno" se menja u "fokusirano ali urgentno." Kombinacija "idle zen" ambijenta sa real-time penalty berba mechanicsom je disonantno iskustvo.

---

*"Igra drži — ali drži na tankom koncu. Kompresuj vreme, otvori kapacitet prema igraču, reži scope renderinga. Svaki od ovih rizika je rešiv pre nego što Jova napiše prvu liniju koda. Niko od nas ne želi da beta tester otvori prazan ribnjak tile u polish sesiji."*

— Nega Negovanović
