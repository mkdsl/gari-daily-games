## PREMORTEM — Sudnik: Tribunal of Cards

### Razumem ideju (steelman)

Igrač preuzima ulogu sudije u distopijskom gradu bez pisanih zakona — jedino pravo je ono koje si sam stvorio prethodnim presudama. Svaka odluka generiše novu karticu (presedant) koja modifikuje buduće slučajeve, što znači da deck koji igrač izgradi nije nasumičan nego autobiografski — ogledalo sopstvene "sudske filozofije". Dve sile (Masa i Vlast) prate tvoje presude sa suprotnim simpatijama, što ti daje trajno napetost između populizma i vladavinskog konformizma. Sesija od 15 slučajeva je kratka i visoko replayable — svaki run gradi drugačiji deck i završava drugačijim profilom sudnika. Estetika noir dokumentarnog filma (serifni font, prljava krema, crvenokrv akcenat) savršeno podupire ton bez ikakvog ilustrovanog sadržaja — što je ogromna prednost za single-developer tim bez asset pipeline-a.

---

### Rizici i potencijalni problemi

#### Showstopper rizici (game-breaking — ako se ne reše NE IZLAZI)

**1. Presedant loop — deck se zaključa u nepobedivo stanje**
- *Opis:* Ako presedanti automatski dodaju krivicu ili nevinost svakom budućem slučaju ("+2 krivica automatski"), igrač može doći u situaciju gde Masa ili Vlast pad postaje matematički neizbežan bez obzira na odluke. To nije teško — to je broken.
- *Verovatnoća:* Visoka (70%) ako dizajner ne postavi cap ili counter-mechanic
- *Uticaj:* Ekstrem — igra postaje unigriva posle slučaja 8-10
- *Fix:* Svaki presedant mora imati trajanje (npr. "naredna 3 slučaja"), a ne permanent efekt. Ili igrač mora moći da "ukine" stariji presedant igrajući kontrakartu. Ovo mora ući u GDD.

**2. "Balance of evidence" numerika nije opisana — implementacija može biti netransparentna**
- *Opis:* Igrač igra 1-3 karte "u korist ili protiv" optuženog, a presuda se bazira na "numeričkom balansu". Međutim, concept ne objašnjava: koji je prag za KRIV vs SLOBODAN? Da li igrač VIDI score pre nego pritisne dugme? Ako ne vidi, mehanika deluje arbitrarno i frustrira.
- *Verovatnoća:* Visoka (65%) da implementacija ostavi igrača u mraku
- *Uticaj:* Visok — bez vidljivog feedback-a igrač ne razume zašto je izgubio Reputation
- *Fix:* Obavezno: vizuelna "vaga" (balance scale UI element ili jednostavna numerička traka) koja se pomera u realnom vremenu dok igrač igra karte. Igrač mora uvek znati gde stoji PRE finalne odluke.

**3. Generisanje "profila sudnika" u jednoj rečenici bez LLM**
- *Opis:* Concept kaže rečenica poput "Sudija koji nikad nije oslobodio bogatog, a uvek je oprostio mladima" — ovo zvuči kao NLP. Ali bez LLM-a, to mora biti template sistem. Pitanje je: ima li dovoljno kombinacija da rečenica ne bude trivijalna ili ponavljajuća?
- *Verovatnoća:* Srednja (50%) da template sistem ispadne plitko i razočaravajući
- *Uticaj:* Visok — "Profil sudnika" je jedina nagrada. Ako zvuči generički, ceo emocionalni klimaks igre pada.
- *Fix:* Definiši 4-6 osa (bogatstvo optuženog, starost, tip zločina, recidiv, svedočanstvo) i napravi cross-product template sa ~20-30 unikatnih rečeničnih šablona. Dovoljno za replayability, implementabilno bez LLM-a. Ovo MORA biti specifikovano u GDD pre implementacije.

---

#### Srednji rizici (UX/pacing/mehanička pukotina — može izaći ali treba fiksovati)

**4. Touch targets za karte na mobilnom**
- *Opis:* Igrač ima 5 karata u ruci i mora da "odigra" 1-3 od njih prevlačenjem ili tapom. Na mobilnom ekranu (360px širine), 5 karata u horitonzalnom redu su ~65px svaka — na granici minimalnog touch targeta (48px po Google HIG). Ako karte imaju i tekst (argument), font mora biti čitljiv.
- *Verovatnoća:* Visoka (60%) da je layout natrpan bez eksplicitnog mobilnog dizajna
- *Uticaj:* Srednji — igra je igriva ali frustrirajuća na telefonu
- *Fix:* Karte se prikazuju kao vertikalni stack sa swipe-up gestom za igranje, ili grid 2x3 umesto horizontalnog reda. Mora se odlučiti pre implementacije.

**5. Dužina sesije od 30 sekundi po slučaju je optimistična**
- *Opis:* Concept tvrdi 15 slučajeva × 30 sekundi = 7.5 minuta. Ali: igrač mora pročitati opis zločina (2-3 rečenice), proceniti 5 karata, odabrati koje igra i u kom smeru, doneti odluku. Čitač srednje brzine troši 15-20 sekundi samo na čitanje. Realnije: 45-60 sekundi po slučaju = 11-15 minuta po partiji.
- *Verovatnoća:* Visoka (75%) da se sesija produžuje
- *Uticaj:* Nizak-srednji — igra nije broken, samo nije 5-8 minuta nego 10-15. Može biti i pozitivno.
- *Fix:* Ili smanjiti broj slučajeva na 10 (da bi se zadržao cilj 5-8 min), ili prihvatiti 10-15 min i ažurirati opis. Preporučujem: 10 slučajeva + "extended mode" opcija za 15.

**6. Masa vs Vlast — nedostatak vizuelnog kontrasta između resursa**
- *Opis:* Dva resursa imaju suprotstavljene interese, ali bez jasnog vizuelnog identiteta lako se zbune. Igrač mora odmah razumeti "Masa voli X, Vlast voli Y" bez čitanja uputstava.
- *Verovatnoća:* Srednja (45%)
- *Uticaj:* Srednji — confusion u core mechanic
- *Fix:* Masa = crvena boja + ikona gomile, Vlast = plava + pečat ili kruna. Ikone moraju biti prisutne na svakoj karti koja utiče na jedan od resursa.

**7. Prazna ruka — šta ako igrač nema dobre karte?**
- *Opis:* Ako presedanti poptune deck kontradiktornim kartama, igrač može imati ruku u kojoj su sve karte loše za trenutni slučaj. Nema mention-a draw mehanike, ni opcije "pass" ili "discard".
- *Verovatnoća:* Srednja (40%) da se desi u kasnijim runovima
- *Uticaj:* Srednji — igrač se oseća zarobljeno
- *Fix:* Dodati "Odbaci i povuci" akciju (jednom po slučaju, bez kazne ili sa malom reputacionom kaznom).

---

#### Kozmetički rizici (sitnice, ne utiču na igrivost)

**8. "Masa šapuće" ambijent bez audio**
- Concept opisuje masu u pozadini ali audio je samo drone i karte. Ako masa nikad ne proizvodi zvuk ni vizuelni feedback (npr. sitne animirane figure), scena deluje statično.
- *Fix:* Opciono — suptilni CSS animirani shadow figures u pozadini, ili ostavi za v2.

**9. Bez vremenskog ograničenja po slučaju — tempiranje**
- Nema mention-a tajmera. Bez njega nema urgentnosti. To može biti namerno (deliberate mood) ali i može da uspori ritam.
- *Fix:* Ostavi bez tajmera, ali pazi na animacione durations da ne budu pre-spore.

**10. Naziv "Sudnik" može biti nejasan ne-srpskim govornicima**
- Podnaslov "Tribunal of Cards" rešava problem za English audience. OK.

---

### Verdict: DRŽI UZ KOREKCIJE

Ideja je solidna, emocionalno koherentna i tehnički izvodljiva za vanilla JS u 3-4h. Estetika je jasna i ne zahteva slike. Replayability je prirodna.

**Ali** — tri showstopper rizika moraju biti razrešena na nivou GDD-a pre nego Jova napiše i red koda:

1. Presedanti moraju imati ograničeno trajanje (ne permanent) — sprečava locked state.
2. "Vaga" UI mora biti eksplicitna — igrač uvek vidi numerički balans pre finalne presude.
3. Profil sudnika mora imati definisane ose i template rečenice u GDD-u — ne sme biti improvizacija u implementaciji.

---

### Ako "drži uz korekcije" — šta tačno treba promeniti u concept.md?

| # | Sekcija u concept.md | Trenutno stanje | Potrebna korekcija |
|---|---|---|---|
| 1 | §4 Core Loop — korak 4 | "Presedant: Posedovanje = +2 krivica automatski" (zvuči permanent) | Dodati: "Svaki presedant važi za naredna X slučajeva (npr. 3-5), ne zauvek" |
| 2 | §4 Core Loop — korak 3 | "numerički balans odigranih karata" — nema UI opisa | Dodati: "Vizuelna vaga/traka prikazuje trenutni balans dok igrač igra karte" |
| 3 | §8 Win Condition | "rečenica generisana iz podataka" | Precizirati: "template sistem sa 4-6 osa i ~25 šablona; bez LLM" |
| 4 | §9 Dužina sesije | "15 slučajeva, po ~30 sekundi svaki" | Razmotriti smanjenje na 10 slučajeva ili ažurirati procenu na 10-15 minuta |
| 5 | §4 Core Loop (novo) | nedostaje | Dodati korak: "Odbaci i povuci — jednom po slučaju, igrač može zameniti 1-2 karte iz ruke" |

Bez ovih pet tačaka, Mile Mehanika će imati nedovoljno informacija za GDD, a Jova će improvisovati kritične mehaničke odluke u kodu.
