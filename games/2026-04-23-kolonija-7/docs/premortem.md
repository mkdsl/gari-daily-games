# Premortem — Kolonija 7

## Steelman (razumem ideju)

Kolonija 7 koristi "još jedan red" psihologiju koja je napajala Minecraft, Terraria i svaki idle game ikad. Suštinski mehanizam je jednostavan: svaki klik otkriva nepoznato — resurs, opasnost, ili put ka sledećem sloju. Grid pogled odozdo u stranu (cross-section) je vizualno čitljiv i odmah komunicira napredak: što dublje, to više ste uložili. Idle loop (radnice rade autonomno) smanjuje kognitivni teret — igrač donosi strateške odluke (gde kopati, šta graditi), a ne mikro-menadžuje svaki korak. Prestige sistem daje meta-napredak i razlog da se vrati posle game overa. Za jednodnevni projekt, ideja je čvrsta: mali scope, jasna vizualna reprezentacija, poznat žanr sa dokazanom retencijom.

## Ključne Pretpostavke

1. **Grid animacija radnica je izvodljiva u Canvas-u u razumnom scopeu** — Pokretni pikseli koji hode po tunelima po 20x30 gridu moraju biti rendrabilni bez frame rate problema i bez previše koda.
2. **Igrač razume šta radnice rade bez tutorijala** — Autonomni sistem mora biti čitljiv samo vizualno (pikseli se kreću ka resursu, vraćaju se ka centru).
3. **90-sekundni napad je dovoljno hitan da pritišće, a dovoljno spor da ne frustrira** — Ako je prebrz, igra postaje anksiozna; prespora, postaje beznačajna.
4. **"Samo još jedan tunel" hook funkcioniše bez narativa** — Igra nema priču ni dijalog; radoznalost grid-a mora biti dovoljna motivacija.
5. **5-8 minuta do prvog prestige-a je tačno kalibrisan tempo** — Previše brzo = nema satisfakcije; previše sporo = igrač odustaje pre nego što vidi prestige.
6. **Vanilla JS Canvas može renderovati 20x30 grid + N pokretnih entiteta bez optimizacije** — Bez WebGL, bez dirty-rect optimizacije, brute-force redraw mora biti dovoljno brz.

---

## Rizici po Prioritetu

### 🔴 SHOWSTOPPER (ubija igru ako se ne reši)

- **Pathfinding radnica je skup i kompleksan za jedan dan**: Radnice moraju "hodati po tunelima" — to znači da ne mogu samo teleportovati od A do B. Potreban je BFS/DFS po iskopanome grafu, praćenje pozicije svakog entiteta, animacija kretanja. Sa 20-50 radnica u kasnoj igri, to je 20-50 pathfinding instanci koje se ažuriraju svaki frame. Implementacija koja je i korektna i performantna u Vanilla JS Canvas za jedan dan je realan rizik scope-creep ubojice.
  → **Predlog rešenja:** Eliminiši pathfinding. Radnice ne hodaju vizualno kroz tunele — one su apstrakcija. Prikaži ih kao animirani broj (npr. "12 radnica aktivno") ili kao točkice koje pulziraju u sobama. Kretanje zameni particl efektima tipa "resurs se kreće po tunelu ka centru" (interpolacija duž straight-line putanje između dve ćelije). Vizualno isto zadovoljstvo, 90% manje koda.

- **Lose condition je pretvrda bez povratne informacije**: Ako radnice ginu od bure bez jasnog vizuelnog upozorenja (countdown, flash, audio), igrač ne razume zašto je izgubio. U grid igrama, nagla smrt bez telegrafiranja = frustracija = zatvaranje taba.
  → **Predlog rešenja:** Bura mora imati minimalno 3 vizuelna stanja pre udarca: "Bura stiže za 60s" (suptilan VFX na vrhu grida), "Bura za 30s" (crvena traka gore), "BURA!" (screen shake + crveni overlay 2s pre udarca). Ovo je 30 linija koda ali je razlika između fair i unfair death.

### 🟡 OZBILJAN RIZIK (degradira iskustvo)

- **Prestige loop se možda nikad ne doživi u testiranju**: Dubina 20 sa ekonomijom resursa koja nije fino kalibrirana može biti ili trivijalna (5min) ili neostvariva (25min+). Ako Mile Mehanika ne napravi eksplicitne formule za resource rate vs. room cost vs. bura damage, Jova implementira "nešto" i igra ili nema napetosti ili je brutalno teška. Beta tester možda ne stigne ni do dubine 10.
  → **Predlog rešenja:** Mile mora da definište target resource rates po minutu i cene soba kao eksplicitne tabele, ne "otprilike nešto". GDD treba da kaže: "Radnica skuplja 2 hrane/min, Leglo košta 50 hrane, dakle 3. radnica se otključa za ~8min." Gari mora da eksplicitno zatraži ove tabele.

- **Grid od 20x30 = 600 ćelija na ekranu**: Na mobilnom (375px širine), svaka ćelija je ~18x18px. To je gde piksel-radnice od 3x3 postaju jedva vidljive, room ikone nerazgovjete, a touch target za klik na ćeliju postaje frustrirajući. Desktop je ok, mobile je problem.
  → **Predlog rešenja:** Smanji grid na 15x20 ili uvedite scroll/zoom. Alternativno: grid je scrollable i kamera prati iskopavanje (samo vidljivi deo rendrujete). Ovo je ionako dobra Canvas optimizacija.

- **Tri prestige ciklusa = "meta pobeda" možda nije ostvarivo u demo sesiji**: Svaki prestige verovatno traje 5-8min → ukupno 15-25min za meta pobedu. To je ok za engaged igrača, ali nikad nećete videti to u beta testu jednog dana.
  → **Predlog rešenja:** Ovo nije problem za implementaciju — samo za beta scope. Beta treba da testira prestige mehaniku ekspres (debug mode koji daje instant resurse) umesto da igra celu sesiju.

### 🟢 KOZMETIKA (nice-to-have)

- **Audio mood (drone, thud, tik)** može biti preskočen bez gubitka core iskustva — Web Audio API drumming je nice touch ali nije bloker. Ako vreme pritišće, ovo ide poslednje.
- **"Drevni kristal" kao win trigger** je narrativno weak — naziv zvuči generično. Ne utiče na mehaniku, ali za flavor bi bolje stajalo nešto vezano za premisu ("Fosil Pramatice", "Jaje Nultog Roja").
- **CSS animacija radnica** (pomenuta u konceptu) je kontradikcija sa Canvas renderingom — ili je Canvas ili je CSS, ne mešajte. Nije bloker, ali Jova mora da odluči jedno pre nego što počne.

---

## Zaključak

**Drži uz korekcije** — Ideja je solidna i žanrovski proverena, ali pathfinding radnica kao vizualni element je ozbiljan scope rizik koji mora biti eliminisan ili drastično uprosćen pre GDD faze, i ekonomija mora biti eksplicitno izbalansirana u tabelama.

---

## Preporuke za Mile Mehaniku (GDD faza)

1. **Definiši resource economy kao eksplicitne tabele** — resource rate po radnici, cena svake sobe, HP Odbrambenog zida, damage od bure. Bez konkretnih brojeva, Jova će "napraviti nešto" i igra neće biti balansirana.

2. **Redefiniši radnice kao apstraktni resource, ne vizualne entitete** — Radnice su broj (kapacitet), ne pikseli koji hodaju. Vizuelni prikaz kretanja resursa (hrana teče ka centru) je dovoljan i daleko jeftiniji za implementaciju. GDD ne sme da specifikuje individualni pathfinding.

3. **Daj Jovi eksplicitni prioritet implementacije**: Core loop (kopanje + skupljanje + gradnja) mora raditi pre nego što se doda bura. Bura je druga faza. Prestige je treća. Ako se zaglave, imaju šta da pokažu.
