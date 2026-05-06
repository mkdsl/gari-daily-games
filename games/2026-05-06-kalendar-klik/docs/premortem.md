# Premortem — Park Ranger

## Verdikt: DRŽİ UZ KOREKCIJE

---

## Top showstopper rizici (poredaj po opasnosti)

### Rizik 1: Streak reset = abandon
**Opis:** Igrač gradi 12 dana streak, propusti jedan dan — streak pada na 0, lik se degraduje na Level 0 sivi sprite. Concept kaže “nema kazne” ali vizuelno kaznii igrača. Ovo je kognitivna disonanca. Kod habit appova dokumentovano je da je streak break najveći single trigger churna. Concept nema streak freeze mehaniku, nema grace period.
**Verovatnoća:** visoka
**Uticaj:** kritičan
**Mitigacija:** Uvesti “Park Propusnica” mehaniku — jednom mesečno igrač može sačuvati streak. Ili: streak buffer (pada za 30% umesto na 0). Minimum: rekord streak mora biti permanentno vidljiv na glavnom ekranu.

---

### Rizik 2: Nema push notifikacija = nema re-engagement
**Opis:** PWA bez native app statusa ne može slati push notifikacije na iOS (bez add-to-homescreen instalacije). Prosječan korisnik nikad ne instalira PWA. Bez podsetnika, daily habit app je mrtav za većinu korisnika u roku od 3–5 dana.
**Verovatnoća:** visoka
**Uticaj:** kritičan
**Mitigacija:** Obavezno implementovati Service Worker push notifications uz eksplicitan onboarding korak. Framing: “Čuvar Parka te zove svakog jutra”. Minimum viable: prominentan “Dodaj na Home Screen” prompt sa animacijom.

---

### Rizik 3: Quest pool isrčpljenost u 14 dana
**Opis:** ~12 quest primera po 4 kategorije = ~48 questova. Rotacija će postati uočljiva za 2–3 nedelje. Tačno kad navika počinje da se formira — igra izgubi svrhu.
**Verovatnoća:** visoka
**Uticaj:** visok
**Mitigacija:** Pre launcha minimum 120 questova (30 po kategoriji). Sezonski quest expansion plan svakih 30 dana. Quest težina skalira sa levelom igrača.

---

### Rizik 4: Lažni [DONE] klik i erozija vrednosti
**Opis:** Igra ne može verifikovati da je quest završen. U dugom roku, navika laži postaje navika.
**Verovatnoća:** srednja
**Uticaj:** visok
**Mitigacija:** Na reward screenu dodati pitanje “Kako se osjećaš posle?” sa tri pixel-art lica. Čuvar Parka daje različitu poruku zavisno od odgovora. Gradi refleksivnu naviku.

---

### Rizik 5: PWA install friction
**Opis:** “Add to Home Screen” je obscure UX gest koji prosječan korisnik nikad ne uradi spontano. Browser-only PWA ima drastično nižu retenciju od installed PWA.
**Verovatnoća:** visoka
**Uticaj:** visok
**Mitigacija:** Custom “Install Guide” overlay pri prvoj poseti — korak-po-korak animacija za iOS i Android. Framing: “Čuvar Parka živi na tvom telefonu — dodaj ga.”

---

### Rizik 6: Šta posle Level 7 / 60 dana
**Opis:** Park Champion je meko win stanje bez jasnog “šta sad?”. Upravo ti korisnici su ambasadori koji šire word-of-mouth.
**Verovatnoća:** srednja
**Uticaj:** srednji
**Mitigacija:** “Park Legend” stanje: ekskluzivni Legacy questovi, gold streak counter, mogućnost pisanja vlastite kvesta.

---

### Rizik 7: MKDSLend kontekst neprozizan za nove korisnike
**Opis:** “Radnik Parka” bez MKDSLend konteksta zvuči bizarno, ne misteriozno.
**Verovatnoća:** srednja
**Uticaj:** srednji
**Mitigacija:** Jedan-rečenični context layer pri prvoj poseti. Alternativno: dizajnirati igru da stoji sama bez MKDSLend konteksta.

---

## Sitni rizici

- **localStorage jedina baza:** Brisanje cache = gubitak napretka. Treba export/import JSON ili QR share.
- **Chiptune audio na mobilnom:** Audio autoplay blokiran bez user gesture. Mora biti tied na tap event.
- **Datum logika za timezone rubove:** Midnight rubovi moraju biti robustno tretirani.
- **Retroaktivni quest:** Quest mora biti vezan za datum otvaranja, ne klikanja DONE.
- **Vizualna degradacija pri streak resetu:** Može biti demotivišuća — testirati pre zaključka.

---

## Šta sigurno drži

- Core concept je zvučan. Daily habit + pixel art + retro RPG = kombinacija koja ima precedent.
- 2-minutna sesija je strategška prednost. Igra greši u smeru jednostavnosti — ispravna strana greške.
- Streak kao jedina valuta je dobar dizajnerski izbor.
- “Nema game over” message od Čuvara Parka je izvrsna kopija. Sačuva se.
- Estetika je konzistentna i targetirana — razlikuje se od pastelnih wellness appova.
- Anti-pyramid poruka ugrađena u mehaniku je pametan move.
- Single CTA per screen je ispravna mobilna UX odluka.

---

## Preporuke za Mile Mehaniku (GDD korak)

- Definisati tačan broj questova: minimum 30 per kategorija = 120 ukupno.
- Specificirati streak protection mehaniku (“Park Propusnica”) u GDD kao obaveznu.
- Push notification flow mora biti u GDD kao obavezna komponenta, ne opciona.
- Level 7+ stanje mora biti definisano konkretno.
- Uvrstiti playtesting protocol za streak break.
- Razmotriti social sharing mehaniku za Level-up moment.
- Quest pool mora biti u eksternom JSON-u — ne hard-coded, jer će trebati update bez redeploya.
