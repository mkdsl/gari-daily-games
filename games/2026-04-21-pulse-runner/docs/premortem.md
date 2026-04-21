# Premortem — Pulse Runner

## Steelmanning (razumem ideju)

Pulse Runner je pametan jer rešava klasičan roguelike problem — previše informacija odjednom — tako što ih temporalno segmentira: jedna odluka po otkucaju, jedna tačka fokusa. Ritam kao gating mehanizam nije samo estetika, on je kognitivno rasterećenje. Grid od 7×7 do 11×11 je dovoljno mali da igrač može da "vidi" celu situaciju za jednu sekundu, što čini svaki otkucaj taktilno zadovoljštvo, a ne paniku. Geometric minimalism + monohromatska paleta znači da nema asset dependency-ja, što je tačno ono što se može isporučiti u jednom danu.

## Pretpostavke koje nisu verifikovane

- **"Samo tokom pulsa smeš da se pomeriš"** — pretpostavlja da je igrač uvek spreman da reaguje za ~0.3s window. Na desktopu verovatno drži. Na touchu — nije jasno kolika je ta window, i nije definisano u konceptu.
- **Proceduralni grid uvek ima rešenje** — koncept kaže "zidovi agresivniji na višim nivoima" ali ne govori KAKO se grid generiše. Naslepo generisani grid može lako biti unsolvable (igrač zatvoren, exit nedostupan). Bez solver-a ili garantovane generacije, ovo je bug koji igrač doživi kao "igra je pokvarena".
- **"3 uzastopna otkucaja bez pomaka = kraj"** — "uzastopnih" je ključna reč. Ako igrač legitimno čeka da proceni situaciju, ovo ga kažnjava za razmišljanje. Definicija "bez pomaka" nije precizna — da li udar u zid broji kao "pokušao, ali blokiran" ili "nije se pomerio"?
- **Run traje 5-10 nivoa** — ovo nije mehanički garantovano. Ako je grid na nivou 3 već tesko solvable, run se završi za 2 minuta. Ako je prelagan, igrač ne oseća tension ni posle 15 nivoa. Pacing kriva nije specificirana.
- **Energija = životi za sledeće nivoe** — mehanika sakupljanja energije je pomenuta, ali nije razrađena. Kako tačno energija štiti od "3 missed beats"? Da li je to buffer koji resetuje brojač? Ovo je game design rupa u konceptu.
- **Audio tišina pojačava tenziju** — pretpostavlja da igrač igra u tihom okruženju. Na mobilnom, većina korisnika igra bez zvuka. Ako je ritam vizuelno dovoljan (bljesak + shake), ovo drži. Ako nije — igra bez zvuka je konfuzna.

## Rizici (rangirani)

### Showstopperi (ubijaju igru ako puknu)

- **Touch latency vs. puls window**
  Problem: Mobilni touchscreen ima inherentni input lag od 50-100ms. Ako je window za unos ~300ms (0.3s fade), igrač koji tapne čak i na početku bljeska može da "promaši" zbog buffering delay-a. Ovo je naročito problem na starijim Android uređajima.
  Zašto je problem: Igra postaje unfair bez da igrač razume zašto. "Tapnuo sam!" — a igra registruje miss. Frustration, uninstall.
  Alternativa: Window za input treba da bude barem 400-500ms. Bolje: igrač smije da stisne taster/swipe IZMEĐU otkucaja, a pokret se IZVRŠAVA na sledećem pulsu (queued input model). Ovo eliminiše timing problem i čini igru fluidnijom.

- **Unsolvable proceduralni grid**
  Problem: Ako se grid generiše nasumično bez provere prolaznosti (pathfinding od starta do exita), igrač može biti matematički zarobljen. Ovo se dešava češće nego što author misli — čak i sa 30% density zidova, blocked gridi su česti.
  Zašto je problem: Igrač ne razlikuje "loš potez moj" od "nemoguće da prođem". Integritet igre se ruši.
  Alternativa: Koristiti flood-fill ili BFS od starta do exita kao validaciju posle generacije. Ako nije solvable — regeneriši. Ovo je ~30 linija JS i mora biti u scope-u. Bez ovoga — ne puštati.

- **Scope: roguelike + rhythm + procedural grid u 2000-3500 JS linija**
  Problem: Ovo su tri netrivijalna sistema. Proceduralni grid sa garantovanom solvability, rhythm gating sa input buffering, roguelike progression sa energy mehanikom, Game Over screen, high score, animacije, audio — realno je 3500-4500 linija za uredan kod. Na 2500 linija sve će biti gurnuto u jedan fajl bez modularnosti, što otežava debug u beta fazi.
  Zašto je problem: Implementer pod vremenskim pritiskom reže corners. Prva žrtva je pathfinding validation (vidi gore). Druga žrtva je touch UX. Treća — progression balancing.
  Alternativa: Bez audio (Ceca Čujka se preskače) — vizuelni ritam (bljesak + shake) je dovoljan i opisano je u konceptu. Fiksni grid layouts za prve 3 nivoa, proceduralni od nivoa 4 — smanjuje rizik od unplayable starta. Energija = jednostavan counter, ne kompleksna mehanika.

### Ozbiljni rizici (degradiraju iskustvo)

- **"3 uzastopnih missed beats" — kažnjava razmišljanje**
  Problem: Na višim nivoima, igrač mora da analizira grid. 3 otkucaja = 3.6 sekunde. To nije dovoljno vremena za kompleksnu rutu na 11×11 gridu. Igrač koji "razmišlja" dobija game over iako nije napravio greške.
  Zašto je problem: Rhythm mehanika i roguelike taktika su u direktnom konfliktu. Rhythm kaže "budi brz", roguelike kaže "misli spoро".
  Mitigacija: Resetuj "missed beats" brojač kada god igrač sakupi energiju, ne samo kada se pomeri. Ili: missed beat se broji samo ako igrač ne unese NIKAKAV input (čak i pogrešan smer). "Pokušao, pogodio zid" ne bi trebalo da broji kao miss — to je decision, ne inaction.

- **Grid vizuelna čitljivost na mobilnom**
  Problem: 11×11 grid na mobilnom ekranu = ćelije od ~30px. Signal igrač, energija, exit i zidovi moraju biti čitljivi na 30×30px. Geometric minimalism pomaže, ali je mali prostor za greški.
  Zašto je problem: Igrač ne vidi gde mu je exit, tapne u pogrešnom smeru, dobija missed beat — frustracija.
  Mitigacija: Maksimalan grid 9×9 na mobilnom (media query ili screen-size check). Ekstra vizuelni signal za exit (pulsiranje, drugačija forma).

- **Undefined energija mehanika**
  Problem: Koncept pominje "energija = životi za sledeće nivoe" ali mehanika nije definisana. Da li energija resetuje missed beat counter? Da li daje extra lives? Da li povećava score multiplier? Bez jasne mehanike, implementer je slobodan da improvizuje — što može rezultirati nebalansiranim ili nerazumljivim sistemom.
  Mitigacija: Mile Mehanika mora ovo eksplicitno razraditi u GDD pre implementacije. Predlog: energija je score multiplier + buffer koji odlaže game over za 1 ekstra missed beat po 3 sakupljene.

- **Puls na 1.2 sekunde — hoće li biti dosadno?**
  Problem: 1.2s između input windowsa je sporo za ritam igru. Igrač čeka. Kontraintuitivno, čekanje na ritam igri može biti depresivno, ne napeto, ako vizuelni feedback između otkucaja nije atraktivan.
  Mitigacija: Grid mora da bude vizuelno živahan između otkucaja — idle animacija signala (pulsiranje boje), ćelije sa suptilnim texture efektima, ne "frozen frame" između otkucaja. Puls se može ubrzati sa svakim nivoom (1.2s → 0.8s na nivou 10), što se ionako spominje u konceptu.

### Kozmetički (nice to have, ne blokiraju)

- Particle efekti na sakupljanju energije — lijepo, ali skupo u JS linijama. Preskočiti ako je scope tesniji nego što izgleda.
- Pentatonska skala za audio — tehničko ograničenje koje niko neće primetiti ako svi tonovi zvuče ok. Nije potrebna pentatonska teorija — samo biramo frekvencije koje ne kolizuju.
- Personalizovana death poruka ("Srce je stalo na dubini 7") — lako za implementirati, visok emocionalni return. Preporučujem da ostane.
- Animirani exit (tirkizno pulsiranje) — estetički dodaje, ali može biti jednostavan CSS animation umesto JS — ne jede linije.
- Screen shake na puls — mora biti opcionalan ili smanjen za igrače sa motion sickness (accessibility minimum).

## Verdict

**DRŽI UZ KOREKCIJE**

Ideja je solidna i disciplinovana — mali scope, jasna estetika, originalan ritam-gating pristup. Ali dva showstoppera moraju biti rešeni pre implementacije: BFS pathfinding validation za proceduralne gridove (non-negotiable, bez ovoga igra je broken), i queued-input model za touch (inače mobilna verzija je frustracija, ne igra). Mile treba da razjasni energija mehaniku u GDD-u pre nego što Jova krene sa kodom.
