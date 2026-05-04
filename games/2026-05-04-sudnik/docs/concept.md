# Concept: Sudnik — Tribunal of Cards

## 1. Naziv igre
**Sudnik** (srpski za "sudija / onaj koji sudi")  
Podnaslov: *Tribunal of Cards*

---

## 2. Žanr
**Card / Deckbuilder** — sa elementima Strategy mini (turn-based decision making)

*(Nije rađen od 2026-04-24, a Kartaški Front je bio ratni; ovde idemo u pravni/moralni pravac — svež ugao na isti žanr)*

---

## 3. Premisa

Prva sekunda: Mračna sudnica osvetljena jednom lampom. Pred tobom — sto sa tri kartonske dosijea. Iza tebe — masa koja šapuće. Na klupici — optuženi koji te gleda u oči.

Ti si sudija u distopijskom gradu koji nema zakone — ima samo *presedane*. Svaka tvoja presuda postaje nova karta u tvojoj ruki. Svaka karta je argument — za ili protiv. Ti odlučuješ ko je kriv, ali tvoje odluke se vraćaju — sledećeg slučaja, optužba će citirati tvoje prethodne presude.

Igrač **oseća** moralnu težinu bez moralizacije. Mehanika *pita* — narativ *ne odgovara*.

---

## 4. Core Gameplay Loop

1. **Izvuci dosije** — Novi slučaj se otvori: kratki opis zločina (2-3 rečenice), optuženi, svedoci
2. **Sakupi argumente** — Iz hand-a od 5 karata (argument kartica), odigraj 1-3 u korist ili protiv optuženog
3. **Donesi presudu** — Na osnovu "balance of evidence" (numerički balans odigranih karata), pritisni [KRIV] ili [SLOBODAN]
4. **Nova karta** — Presuda generiše novu karticu sa efektom koji menja buduće slučajeve (npr. "Presedant: Posedovanje = +2 krivica automatski")
5. **Reputation check** — Nakon 5 slučajeva, Masa i Vlast ocenjuju tvoje presude. Ako izgubiti oboje — igra je gotova.

---

## 5. Hook

**Zašto 5 minuta?**  
Svaka presuda se oseća kao tvoja. Nema ispravnog odgovora — ali mehanika te tera da budeš dosledan (presedanti). Igrač počne da se pita: "Jesam li sudija ili sam alat sistema?"

**Zašto nastaviti?**  
Deck raste. Presedanti se akumuliraju. Negde posle 8-10 slučajeva, tvoj deck je portret tvoje "filozofije". Igrač želi da vidi u šta se pretvorio — i da proba ponovo sa drugačijim izborom.

---

## 6. Vizuelna Estetika

**Stil:** Minimalist noir — crno-bela sa jednom bojom akcenta; tamni papir tekstura kao pozadina

**Paleta (5 boja):**
| Uloga | Boja | Hex |
|---|---|---|
| Pozadina | Duboka tamnina | `#0D0D0D` |
| Papir / karte | Prljava krema | `#E8DFC8` |
| Tekst / linije | Tamna tinta | `#1A1A2E` |
| Krivica (akcenat) | Crvenokrv | `#8B0000` |
| Nevinost (akcenat) | Bledo nebo | `#4A7FA5` |

Karte izgledaju kao novinska isečci / stari dokumenti. Fontovi su serifni (CSS `Georgia`). Animacije su spore, deliberate — bez bljeska.

---

## 7. Audio Mood

**Ambijent:** Low drone, jedna niska nota koja lagano pulzira (Web Audio OscillatorNode, `sine` wave, ~55Hz, gain envelope 0.02-0.08)  
**Karte odigrana:** Kratki "papir" šum — kratki white noise burst (50ms, brzi fade)  
**Presuda KRIV:** Bas udar + kratki disharmonični akord (dva OscillatorsNode razmak minor 2nd)  
**Presuda SLOBODAN:** Isti bas, ali sa čistim major tercom — ambivalentno, ne trijumfalno  
**Masa odobrava:** Subtilni "hum" koji naraste na 0.5s pa nestane  
**Game over:** Sve stišava, samo drone ostaje, pa i on gasne

---

## 8. Win Condition

Nema klasičnog "pobedio si" ekrana.  
**Peak moment** = Igrač preživi 15 slučajeva sa oba resursa (Masa + Vlast) iznad 0.  
Na kraju se prikaže **"Profil Sudnika"** — statistika: koliko % krivi, koje presedante si stvorio, tvoj "sudski sistem" u jednoj rečenici generisanoj iz podataka.

Primer: *"Sudija koji nikad nije oslobodio bogatog, a uvek je oprostio mladima."*

To je nagrada — ogledalo, ne trofej.

---

## 9. Targetirana Dužina Sesije

**5-8 minuta** po partiji (15 slučajeva, po ~30 sekundi svaki)  
Replayability visoka — drugi run sa drugačijim presedant-pristupom daje drugačiji profil.

---

## 10. Zašto Danas?

Posle Fermenter-a (pasivno klikanje, ekonomija rasta), Sudnik donosi **aktivnu moralnu agenciju** — svaki klik ima posledicu, a ne samo broj koji raste; savršen kontrast koji resetuje igrača za sledeću sesiju.
