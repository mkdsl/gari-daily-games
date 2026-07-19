# Premortem: Na Vezi
*Nega Negovanović, 2026-07-18*

---

## Pre nego što napadnem — šta koncept stvarno pokušava

Da budem fer: ovo NIJE "uzmi generičku tycoon šemu, obuci je u Guncati boje". Iskra je pogodila nešto što retko koji GDG koncept pogodi — **off-grid resurs kao stvaran ograničavajući faktor** nije flavor text, nego mehanički centralni tenzioni izvor koji direktno modeluje zašto Guncati TV danas radi ono što radi (kraće emisije, niži bitrate posle oblačnog dana). To je razlika između "žig na fasadi" i "zgrada je sagrađena od pravog materijala". Takođe cenim: (a) disciplinu oko brojeva — Napomene sekcija eksplicitno odbija da izmisli watt-satne kapacitete i real engagement % dok Mile ne balansira, tačno po Pravilu 7 iz korenskog CLAUDE.md; (b) svesnost da alarm-mini-igra ne sme da bude Zvučna Proba 2.0 — eksplicitno je ograničena na 2-4s, jedan od pet, ne centralna mehanika; (c) IG>TikTok>YouTube redosled je stvaran prioritet iz Guncati prakse, ne izmišljen radi "tri dugmeta za tri platforme".

Sad, rastavimo ga.

---

## Globalni Verdict

**DRŽI UZ KOREKCIJE.** Brand-sprega je jedna od najjačih u backlogu — ne zato što je najlepša nego zato što je off-grid resurs mehanika koja bi propala/uspela na isti način da je real sistem, ne oslikan sistem. Ali dva strukturna problema moraju biti rešena PRE nego što Mile pretvori ovo u GDD sa konkretnim formulama: (1) **scope-realnost je neverifikovana** — ovaj repo ima four prior multi-layer igre i nijedna nije ni blizu pogodila liniju/modul cilj koji se ovde postavlja, i (2) **jedini stvarno brand-specifičan sistem (off-grid resurs) rizikuje da bude jedna traka od pet na dashboardu**, umesto dominantna mehanika koju koncept tvrdi da jeste.

---

## SHOWSTOPPER

### S-1: 18-28k JS linija / 25-40 modula cilj nema pokriće u istoriji ovog repoa — a scope samog koncepta je tanji nego što izgleda

**Problem:** Ovo je multi-layer manager/sim (macro+micro+meta), što po CLAUDE.md Scope tabeli cilja **18.000-28.000 JS linija i 50-90 modula** (ne 25-40 — to je KORAK 4a generički scaffold broj, ne multi-layer red iz iste tabele; ova nekonzistentnost unutar samog pipeline dokumenta je posebna sitna zamerka, vidi kraj ovog nalaza). Bez obzira koji broj važi, pogledao sam stvarne ishode četiri prethodne multi-layer igre u ovom repou:

| Igra | Modula | JS linija |
|------|--------|-----------|
| Imanje Tycoon (07-09) | 34 | 8.578 |
| Zemlja i Znanje (06-07) | 63 | 7.744 |
| Festival Mreža (06-04) | 39 | 5.355 |
| Avala Crew (06-06) | 26 | 6.775 |

Nijedna nije prešla 8.6k JS linija. Najambiciozniji pokušaj (Imanje Tycoon — izometrija + tri sub-igre + macro/micro/meta) je **pao ceo impl stage jednom** (`docs/FAILED_STAGE.md`, 2026-07-10 — silent failure, 0 commit-a) upravo zato što je scope bio prevelik za jednu 4-5h sesiju, i čak posle uspešnog drugog pokušaja završio na 8.578 linija — trećina donje granice od 18k.

**Zašto je ovo relevantno za "Na Vezi" konkretno:** Kad rastavim mehaničku listu koncepta — 5 macro odluka (format, platforma, oprema, gost, off-grid), 5 micro alarm tipova, 3 platform krive, prestige/format unlock, 10-15 achievement-a — to je **respektabilna lista, ali strukturno slična onome što su Zemlja i Znanje i Festival Mreža već imali** i koje su i dalje završile na 5-8k linija. Konkretna opasnost: "5 alarm tipova" i "3 platform ponašanja" prirodno postaju 5+3 tanka modula koja se razlikuju samo po konstantama (isti signal-handling kostur, drugi threshold brojevi) — to NIJE 8 modula vredna imena, to je 1 sistem sa config tabelom. Ako Jova mora da "napravi" 25-40 (ili 50-90) modula iz ove liste, realan ishod je ili (a) veštačko usitnjavanje u fajlove koji ne rade ništa sami za sebe (stub-teritorija kroz zadnja vrata — brojčano "modul" postoji, sadržajno je prazan), ili (b) isti pattern kao prethodne četiri igre: pošten commit na pola cilja, i taj gap se nikad ne imenuje jer manifest.json ne kažnjava "manje od cilja", samo beleži broj.

**Koliko ozbiljno:** Showstopper — ne za sam koncept (koncept ne mora da diktira LOC), nego za GDD/impl fazu koja dolazi posle. Ako Mile napiše GDD sa formulama i pacing tabelama kalibrisanim na "treba da stane u 25-40/18-28k" cilj koji ni jedna slična igra dosad nije dostigla, GDD će ili biti neproverljivo optimističan, ili će Jova morati da izmišlja sadržaj bez balansa da bi "popunio" brojku.

**Alternativa:** Dve stvari, ne jedna.
1. **Pre GDD-a:** Iskra/Mile treba da dodaju konkretan sadržajni "meso" koji trenutni koncept nema, da cilj bude ostvariv sa pravim sistemima a ne tankim reskin-om: (a) roster stalnih gostiju sa individualnim reliability profilima koji se pamte kroz sezone (ne generic "gost/no gost"), (b) eskalirajući alarm-lanci (jedan glitch može okinuti drugi ako se ne reši na vreme — realan broadcast chaos, ne 5 izolovanih random eventova), (c) mali "posle-emisije" replay/highlight sistem koji hrani i meta-progresiju i stvaran Guncati TV content hook iz sekcije 9. Ovo je sadržaj koji ima razlog da postoji kao zaseban modul, ne floskula radi brojke.
2. **U GDD-u:** Mile treba eksplicitno da napiše realan LOC/modul cilj baziran na ISTORIJI ovog repoa (6-9k JS, 30-40 modula je iskustveno dostižno za ovaj tip igre), ne na CLAUDE.md apstraktnom rasponu koji nijedna igra još nije pogodila. Ako šef želi da 18-28k postane stvaran, to je posebna, eksplicitna odluka o promeni pipeline template-a/procesa — nije nešto što se rešava tako što jedan koncept "pokuša jače".

*(Sitna napomena van scope-a ove igre: CLAUDE.md KORAK 4a kaže "25-40 modula" kao generički hardcheck-minimum, dok Scope tabela za multi-layer kaže "50-90 modula". Ovo je nekonzistentnost u samom pipeline dokumentu, ne u concept.md — flagujem je jer je task brief za ovaj premortem citirao 25-40 kao da je to multi-layer target, a nije. Ovo ne blokira "Na Vezi" ali vredi da neko u timu uskladi tabelu.)*

---

## RIZIK — Ozbiljno, popravljivo u GDD-u

### R-1: Off-grid resurs — jedini istinski Guncati-specifičan sistem — rizikuje da postane "još jedna traka na dashboardu"

**Problem:** Kad izbrojim šta je u ovom konceptu STVARNO nezamenjivo Guncati (ne bi radilo za bilo koji generic "streamer sim"), to je u suštini JEDAN sistem: off-grid solar/baterijski budžet. Signal drop, feedback glitch, chat momentum, platform-specifične krive — sve to su standardne mehanike žanra "broadcast/streamer management sim" (postoji ceo žanr "Streamer Life Simulator"-tipa igara sa identičnim building blokovima). Nijedna od njih sama po sebi ne uči igrača ništa o Guncatiju — mogle bi biti u bilo kojoj igri o bilo kom studiju sa neograničenim resursima. Off-grid limit je taj koji nosi celu brand-tezu iz sekcije 9 ("gledaocima daje poštovanje za bare bones fazu").

**Zašto je opasno:** Dashboard u Micro sloju ima, po opisu, "nekoliko traka (signal jačina, chat aktivnost po platformi, baterija/napon panela, publika po platformi)". Baterija je jedna traka od četiri-pet vizuelno ravnopravnih elemenata. Ako GDD/impl ne da joj eksplicitan vizuelni i mehanički prioritet, prosečan igrač je doživljava kao "još jedan resource meter" (isti trop kao sto drugih tycoon igara — mana bar, stamina bar, itd.), ne kao nosioca brand-poruke. Konkretan scenario: igrač završi 3-4 sesije, dobro upravlja signalom i chat-om, retko obraća pažnju na baterijsku traku jer se retešava (RNG "blago, ne punish-heavy" po sopstvenom opisu koncepta) — igra prođe, a poruka "off-grid je stvaran ograničavajući faktor" se nikad nije osetila kao težina, samo kao statistika u uglu ekrana.

**Koliko ozbiljno:** Ovo je razlika između "DRŽI" i "DRŽI UZ KOREKCIJE" za mene. Ako se ovo ne reši, cela brand_serves sekcija 9 postaje aspiracija na papiru koju gameplay ne isporučuje — tačno ona zamka koju ovaj premortem treba da spreči (dekorativna nalepnica pod maskom "duboke" integracije, samo jedan sloj dublje nego običan palette-swap).

**Alternativa (konkretna, za GDD):**
- Off-grid traka dobija **primarno mesto na dashboardu** (najveća, najgornja, ili centralna — ne jedna od četiri ravnopravne), i to eksplicitno piše u GDD kao UI zahtev, ne prepušta se Jovinom nahođenju u impl fazi.
- Najmanje 2 od 5 macro odluka (ne samo "off-grid resurs menadžment" red) moraju imati tekst ishoda koji se DIREKTNO poziva na solar/baterijski kontekst — npr. investicija u "drugi internet link" opisana kao "smanjuje zavisnost od bandwidth-a kad je baterija niska", ne kao apstraktni "smanjuje šansu za alarm".
- Flavor copy (koju kasnije piše Pera/Sine) mora vezivati apstraktni 0-100 broj za konkretne Guncati objekte — "panel je dao manje danas, oblačno je bilo" umesto generičkog "resurs nizak" teksta. Ovo NE krši Napomene pravilo o izmišljanju watt brojeva (0-100 skala ostaje), samo traži da narativni sloj bude ukorenjen, ne apstraktan.

### R-2: "Format emisije" i "Gost" macro odluke nemaju jasan carry-over — rizik da 5-osni izbor postane 2-osni u praksi

**Problem:** Sekcija 6 (Carry-Over) imenuje samo tri veze: oprema→manji alarm rizik, ishod emisije→kapital, loše upravljan off-grid resurs→nauči za sledeći put. Format emisije (DJ lajv/podkast/vlog) i Gost odluka su opisani u tabeli sekcije 4 sa "output" (različita publika/dužina; content kvalitet + engagement bonus), ali nijedan od ta dva outputa se ne pojavljuje u Carry-Over sekciji niti u Branching ishodima (sekcija 8, koja pominje samo platform-alokaciju i opremu-vs-gost prioritet, ne format).

**Zašto je opasno:** Ako Format i Gost realno ne nose posledicu iz nedelje u nedelju (samo menjaju flavor te jedne emisije), igrač brzo optimizuje na "uvek isti format koji je najsigurniji, uvek isti gost izbor" i preostale dve od pet ponuđenih odluka postaju kozmetički meni, ne strateški izbor. To je tačno kritika koju sam trebao da testiram po zadatku — i delimično se potvrđuje: 3 od 5 macro osi (platforma, oprema, off-grid) imaju jasan carry-over; 2 od 5 (format, gost) trenutno nemaju.

**Koliko ozbiljno:** Rizik, ne showstopper — lako se popravlja brojevima u GDD-u, ne zahteva redizajn koncepta.

**Alternativa:** Mile treba da doda u GDD konkretan carry-over za oba:
- **Gost:** istorija no-show-ova/pouzdanosti po gostu se pamti (isti gost koji je jednom kasnio ima veći no-show rizik sledeći put, ili obrnuto — gost koji je "spasio" emisiju gradi reputaciju i otključava bolji engagement bonus). Ovo je jeftino mehanički (jedan brojčani atribut po gostu) i daje pravi razlog da igrač razmišlja o tome KOG gosta bira, ne samo DA LI bira gosta.
- **Format:** vezati format izbor za platform-specifične krive iz Napomena (npr. DJ lajv format ima prirodno bolju TikTok spike dinamiku, podkast bolju YouTube retenciju) — ovo pretvara "format" iz kozmetičkog labela u stratešku odluku koja se ukršta sa platform-alokacijom, umesto da su to dva nezavisna izbora.

### R-3: Onboarding UI-denzitet nije eksplicitno rešen — narrowed odluke ≠ narrowed dashboard

**Problem:** Prva sesija (12-15 min) ispravno sužava ODLUKE (jedan format, jedna platforma, jedan blag alarm) — to je dobar instinkt i sprečava klasičnu FTUE grešku. Ali koncept ne kaže da li se i sam DASHBOARD (broj vidljivih traka/panela) smanjuje za tu sesiju, ili igrač i dalje gleda pun kontrolni panel sa signal/chat×3-platforme/baterija/publika×3-platforme, samo mu je dozvoljeno da interaguje sa jednim delom. Vizuelna gustina i dalje postoji čak i kad je odluka-prostor sužen.

**Zašto je opasno:** Kognitivno opterećenje u prvih 5 minuta dolazi od onoga što igrač VIDI, ne samo od onoga što mora da ODLUČI. Pun dashboard sa alarm ikonicama, tri platform-chat trake i baterijskim indikatorom koji "diše" (sopstveni opis iz sekcije 6, vizuelni ambient) je zauzet ekran za igrača koji tek uči šta signal traka uopšte znači. Dodatan detalj — poređenje sopstvenih brojeva koncepta: redovna (već upućena) sesija makro+mikro traje 15-22 min. Onboarding sesija (za igrača koji NIŠTA ne zna) je budžetirana na 12-15 min — kraće od punog ciklusa za VEĆ upućenog igrača. To je moguće IZVODLJIVO ako je tutorial-nedelja stvarno pojednostavljena (manje UI-a, ne samo manje odluka), ali ako dashboard ostaje vizuelno pun a samo je interakcija ograničena, 12-15 min neće biti dovoljno da se i vizuelno provari i emisija odigra bez žurbe.

**Koliko ozbiljno:** Rizik — first-impression je po CLAUDE.md pravilu (KORAK 5) najviši prioritet beta faze ("prvih 5 minuta moraju da rade, ne fast-forward"). Ako se ovo ne reši u GDD-u, beta-Trio će ovo sigurno naći kao CRITICAL u iteraciji 1, što znači izgubljen fix-krug koji se mogao izbeći sad.

**Alternativa:** GDD mora eksplicitno propisati **progressive disclosure** za tutorial-nedelju: panel-i za platforme koje igrač te nedelje ne koristi su vizuelno prigušeni/sklonjeni (ne samo neaktivni), baterijska traka i signal traka su jedine punog intenziteta trake u prvoj sesiji, ostatak dashboard-a se "pali" postepeno kroz sledeće 2-3 sesije kako igrač dobija nove platforme/formate. Ovo nije dodatni rad — to je isti UI, samo sa jednim CSS/state flagom za "tutorial mode" koji Jova može implementirati jeftino ako je specificiran unapred u GDD-u, umesto da se improvizuje u impl fazi (ili, realnije, ne uradi uopšte jer nije bilo eksplicitno traženo).

### R-4: Chat-sadržaj za tri platforme nema dodeljenog vlasnika niti sistem generisanja

**Problem:** "Chat momentum" mehanika (sekcija 4, Micro Layer) pretpostavlja da igrač vidi i reaguje na chat poruke sa tri platforme kroz višestruke sesije/sezone. Koncept ne kaže ko piše taj sadržaj niti kako se generiše da ne postane repetitivan posle 5-10 emisija (što je realan broj s obzirom da je puni prestige ciklus ~3-4h razbijen u mnogo kratkih sesija).

**Zašto je opasno:** Bez template/proceduralnog sistema sa dovoljnom varijacijom, chat feed postaje isti recikliran pool od 15-20 poruka koje se ponavljaju — što ubija tačno onaj "aha, platforme se stvarno ponašaju drugačije" hook koji sekcija 5 obećava kao glavni razlog da igra drži pažnju 15+ minuta.

**Koliko ozbiljno:** Rizik, srednje ozbiljan — ne ruši igru, ali potkopava specifično onaj hook koji je označen kao primarni ("Tri platforme, tri različita rezona" — sekcija 5).

**Alternativa:** GDD treba da dodeli chat-content sistem eksplicitno — verovatno `src/content/chat_templates.js` (Jova piše strukturu, Pera Period ili Sine daju stvarni tekstualni pool po platformi/tonu), sa proceduralnim slot-filling (ime + template + kontekst-tag) dovoljno velikim da se ne oseti petlja pre 15-20 sesija.

---

## KOZMETIKA

- **EQ mini-fix vs Zvučna Proba:** dobro ograđeno (2-4s, jedan od pet, ne 1:1 repeat) — samo pažnja u impl fazi da ne "naraste" u punu DSP mini-igru jer je to već druga igra u ovom repou (potvrdio sam — Zvučna Proba, 2026-05-24, postoji i taj teren je zauzet).
- **CTA link ka pravom Guncati TV kanalu i Simulcast-Kluboslavija hook** — oba već ispravno markirana `[PROVERI SA ŠEFOM]`, nema šta da se doda, dobra disciplina.
- **Alt naslovi (Eter / Signal sa Imanja):** nema problema, "Na Vezi" nosi dvostruko značenje bolje od alternativa, ostaviti kako jeste.

---

## Zaključak

**DRŽI UZ KOREKCIJE.** Ovo je jedan od ređih GDG koncepata gde je brand-veza stvarno strukturna (off-grid resurs kao gameplay, ne kao boja) — ne bacati ovaj koncept i ne tražiti novu ideju. Ali pre nego što Mile sedne za GDD:

1. **Obavezno (S-1):** Uskladiti realan LOC/modul cilj sa istorijom repoa (6-9k JS / 30-40 modula je dokazano dostižno; 18-28k nije nikad pogođeno) ILI dodati konkretan sadržajni "meso" (gost-reliability sistem, eskalirajući alarm-lanci, replay/highlight meta-sistem) koji opravdava veći cilj pravim sistemima, ne tankim reskin-om.
2. **Obavezno (R-1):** Off-grid traka dobija eksplicitan vizuelni i mehanički prioritet na dashboardu u GDD-u, plus najmanje 2 macro odluke sa tekstom ishoda koji se direktno poziva na solar/baterijski kontekst — inače je brand-teza iz sekcije 9 aspiracija koju gameplay ne isporučuje.
3. **Preporučeno (R-2):** Dati Format i Gost odlukama stvaran carry-over (gost-reliability istorija, format↔platform-krivа ukrštanje) da 5 macro osa ne kolabira u praksi na 3.
4. **Preporučeno (R-3):** GDD eksplicitno propisuje progressive-disclosure UI za tutorial-nedelju (ne samo sužene odluke, nego i sužen vizuelni dashboard) — ovo će inače beta Trio naći kao CRITICAL u iteraciji 1.
5. **Preporučeno (R-4):** Dodeliti vlasnika i proceduralni sistem za chat-sadržaj pre nego što uđe u manifest kao "gotov" modul.

Showstopper (1) mora biti rešen pre GDD brojeva. Preporučeni popravci (2-4) su jeftini ako uđu u GDD sada — skupi ako se otkriju tek u beta testu.

---

*Nemanja "Nega" Negovanović, 2026-07-18*
