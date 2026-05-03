# Premortem — Fermenter: Varenički Bunt

## Steelmanning (razumeš ideju)

Fermenter cilja na ono što idle žanr radi najbolje: osećaj neprekidnog rasta koji ne zahteva punu pažnju, ali nagrađuje povremeni engagement. Prestiže-sa-mutacijom je pametna varijacija na klasičnu formulu — umesto čistog numeričkog skaliranja, svaki reset donosi mehanički twist koji menja kako igrač razmišlja o igri. To je razlika između "imam 2x više" i "sad igram po drugačijim pravilima", što je daleko interesantnije narativno i kognitivno. Pivarska tematika je originalna u žanru (nema tu Cooka), vizuelni jezik s jantarnim buradima i LCD HUD-om je kohezivan, i audio dizajn koji NEMA muziku nego samo organski ambijentalac je osvežavajuća ideja koja ne zahteva licencu ni kompleksnu implementaciju. Sesija od 4-7 minuta je realna za daily igru — prva prestiže za 3-4 minuta znači da čak i usputni igrač oseća progresiju.

---

## Rizici

### Showstopper rizici (mogu da ubiju igru potpuno)

**Rizik 1: "Kontaminacija" mehanika je designerski paradoks koji ruši idle žanr.**

Problem: Idle igre su definisane time što možeš da ih ostaviš. "Kontaminacija" (kvasac umire ako bure predugo miruje) direktno udara u tu ugovornu obavezu žanra. Igrač koji otvori igru, podesi auto-fermenter i ostavi da ode na wc može se vratiti na ekran poraza. Za petominutnu sesiju koja se igra jedanput, to je frustracija bez upozorenja.

Zašto je ozbiljno: Showstopper nije samo "buggy" — to je dizajnerska odluka koja protivreči marketing poruki ("idle igra"). Igrač koji ne čita concept.md neće razumeti da postoji timeout mehanika dok ga ne pokosi. Jednom pokošen = zatvori tab.

Preporuka: Ili ukloni Kontaminaciju potpuno (idli su legalni razlog žanra), ili je redefiniši kao "spori pad" koji traje bar 10-15 minuta pasivnosti — ne kao hard reset već kao degradacija brzine fermentacije. Hard gubitak napretka u idle žanru je visokonaponska žica.

---

**Rizik 2: 7 mutacija kao meta-cilj je preteran scope za daily igru.**

Problem: "Savršeni Kvasac" ekran za 7 prestiža implicira višednevno igranje u igri koja živi na jednoj URL adresi i sutra ima konkurenciju od sledeće igre. Niko se ne vraća. To znači da je meta-cilj mrtav na papiru.

Zašto je ozbiljno: Jova mora da implementira balansirani prestiže sistem sa 7+ mutacija sa dovoljno varijacije da svaka bude mehanički distinktivna. To je ozbiljan scope za implementaciju. Ako se svede na "ista igra, različiti bonusi" — mutacije gube hook. Ako se zaista implementira 7 mehanički různih mutacija — verovatno se prelazi 5000 linija JS i vreme sesije.

Preporuka: Redukuj meta-cilj na 3-4 mutacije za kompletni arc. "Savršeni Kvasac" posle 3 prestiža u jednoj sesiji je ostvarivo i satisfaktorno. 7 je ambicija za live-service igru, ne daily.

---

### Srednji rizici (UX/mehanički problemi)

**Rizik 3: "Mutacioni pritisak" metrika nije intuitivna iz prvog pogleda.**

Problem: Igrač vidi HUD sa šećerom, fermnetacijom, i "Mutacionim pritiskom" — treća metrika koja raste nevidljivo u pozadini. Bez tutoriala ili jasnog vizuelnog signala, igrač možda ne shvata da je Mutacioni pritisak svrha igre, a ne sporedni brojač.

Zašto je ozbiljan: Idle igre zahtevaju jasnu hijerarhiju metrika. Ako igrač misli da je cilj "maksimizirati fermentaciju" (logično, to je ono što klikće), a zapravo je cilj "dostići 100% pritiska" — postoji kognitivna disonanca. Može proći cela sesija bez prve prestiže jer igrač ne zna šta gura.

Preporuka: Mutacioni pritisak mora biti vizuelno dominantan — centralni progress bar ispod bureta, ne tuckan u ugao HUD-a. Možda i kratki one-liner pri startu ("Fermentacija puni pritisak. 100% = Mutacija.").

---

**Rizik 4: Tri ponuđene mutacije zahtevaju UI koji Jova mora da ispolira pod tajm-presurom.**

Problem: Biranje između tri opcije u prestiže momentu zahteva dobro dizajniran modal — igrač mora da razume šta svaka mutacija radi, vizualno jasno, pre nego što klikne nepovratnu odluku. Loše odabrana mutacija zbog nejasnog opisa je frustrujuće.

Zašto je ozbiljan: Modal UI sa hexagon badge-evima, opisima mutacija, i animacijom prestiže je jedan od najkompleksnijih UI delova implementacije. Ako Jova žuri, modal je generičan, opisi su nejasni, i hook se gubi. "Šta radi termofilni kvasac?" nije jasno samo iz naziva.

Preporuka: Svaka mutacija mora imati one-line gameplay opis u formatu "Šta se menja: [mehanički efekat]". Hexagon badge je vizuelni bonus, ali plaintext opis je obaveza.

---

**Rizik 5: Particle spray pri prestiže na mobilnom može biti loš za performanse.**

Problem: Canvas particle spray + CSS keyframe bubbles + animated badge — sve simultano pri prestiže momentu može da "zaguši" mid-range mobilne telefone.

Zašto je ozbiljan: Ako prestiže animacija lagguje upravo u momentu koji treba da bude reward, osećaj nagrade postaje frustracija. Idle igrači često igraju na slabijim uređajima.

Preporuka: Particle count mora biti cappovan na ~30-50 čestica. CSS animacije ne bi trebale da teku simultano sa canvas renderingom — staggeovati ili izabrati jedno.

---

### Manji rizici (kozmetika, nice-to-have)

**Rizik 6: Audio bas-hum od 55 Hz može biti neprijatan na laptop speakerima.**

Problem: Sinusoid na 55 Hz je ispod frekvencijskog odgovora većine laptop i telefon zvučnika — čuje se ili kao slabo ili kao distorzovano zujanje, ne kao topli bas-hum zamišljen u konceptu.

Zašto je manji: Zvuk nije core mehanika, i igrači mogu mute-ovati. Ali ako Ceca implementira i pušta na default, prvi utisak može biti "šta ovo zuji".

Preporuka: Pomeri na 80-110 Hz sa blagim sinusoidom. Ili dodaj low-cut filter na 60 Hz da se izbegne problem.

---

**Rizik 7: "#39ff14 zeleni tekst na crnom" LCD estetika može biti naporna za duže čitanje.**

Problem: Neon zeleni tekst je estetski distinktivan, ali za metrike koje se stalno prate (fermentacija%, pritisak%, šećer), visoki kontrast neon-na-crnom bez anti-aliasinga može zamarniti oči posle 2-3 minute.

Zašto je manji: Sesije su kratke (4-7 min), tako da nije dugotrajna ekspozicija. Ali ako igrač misli "ovo me boli za oči" — zatvoriće tab pre prve prestiže.

Preporuka: Smanji opacity na LCD tekstu na 0.85 ili dodaj blagi text-shadow glow da ublažiš oštrinu. Čisto neon bez glowa je agresivno.

---

**Rizik 8: Naziv "Varenički Bunt" možda pravi jezičku barijeru.**

Problem: "Varenički" je srpska reč vezana za varenje/pivarenje, ali nije svima odmah jasno. Međunarodni igrači (GitHub Pages je javno) neće razumeti naziv.

Zašto je manji: Daily igra na srpskom GitHub repou — lokalizacija nije primarni cilj. Ali ako se ikad deli link, naziv je teže ukucati ili zapamtiti.

Preporuka: Podnaslov u index.html na engleskom ("The Yeast Uprising") je dovoljan.

---

## Zaključak

**Drži uz korekcije**

Fermenter je konceptualno solidan — hook kroz mehaničke mutacije je prava inovacija za idle žanr i može da drži igrača 5-7 minuta sa legitimnim "još jedna prestiže" osjećajem. Tematika i vizuelni jezik su kohezivni i originalni.

Ali dva srednja/showstopper problema moraju biti adresirana pre implementacije:

1. **Kontaminacija mehanika mora biti ublažena ili uklonjena.** Ne sme da kaznuje odsustvo u idle igri hard resetom napretka. Redizajnuj kao degradaciju (ne gubitak) ili ukloni.

2. **Meta-cilj sa 7 mutacija mora biti skaliran na 3-4.** Scope implementacije je realan, a satisfakcija posle 3 prestiže u jednoj sesiji je dovoljna.

Vizuelni UI za prestiže modal (mutacioni izbor) i dominantnost Mutacionog pritiska u HUD-u su implementacioni prioriteti koje Mile mora da definiše eksplicitno u GDD-u — Jova ne bi trebalo da te odluke donosi na licu mesta.

Sve ostalo (audio, estetika, performanse) su fine-tuning koji ne blokira implementaciju.
