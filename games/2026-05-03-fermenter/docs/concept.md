# Fermenter — Varenički Bunt

## Žanr
Idle/Incremental (sa roguelike elementima — svakom prestitge resetuje sve, ali donosi novu trajnu mutaciju)

## Premisa
Podrum jedne stare pivare. Igrač upravlja živom kolonijom kvasca koja fermentira bure po bure alkohola. Ali kvasac se menja — svaki klik evoluira ćelije, svaka prestiže spušta igrača nazad na prazno bure, ali sa jednom genetskom mutacijom koja zauvek menja pravila igre. Ton je topao i organski — ne distopija, nego živahna biohemija.

## Core Gameplay Loop
Svakih ~30 sekundi igrač:
1. Klikće bure da ubrzava fermentaciju (klik = +šećer koji kvasac guta)
2. Kupi upgrejde koji automatizuju klik (kvasac se širi sam, auto-ferment)
3. Prati "Mutacioni pritisak" — metrika koja raste sa svakim ciklusom; kad dostigne 100%, pojavljuje se opcija Prestiže (Mutacija)
4. Bira jednu od tri ponuđene mutacije (npr. "Termofilni kvasac — +50% u toplim buradima", "Etanol-rezistentan — fermentacija ne usporava na kraju")
5. Reset svega osim trajnih mutacija — nova partija je brža i sa drugačijim pravilima

## Hook
Svaka prestiže donosi novu trajnu moć koja menja kako igra FUNKCIONIŠE, ne samo koliko je brzo — igrač uvek hoće da vidi šta sledeća mutacija radi.

## Vizuelna Estetika
Tamna pozadina boje starog hrasta (#1a0f07). Centralno bure kao krug — buburi animirani CSS keyframe krugovima koji rastu i pucaju (boje: jantarno-žuta #d4a017, penušava bela #f5f0e8). HUD sa metrikama u stilu old-school LCD displeja (zeleni tekst #39ff14 na crnom). Svaka mutacija dobija vizuelni badge — mali CSS hexagon sa ikonom napravljenom od karaktera (npr. ♨ za termo). Kada prestiže — bure "eksplodira" u canvas particle spray jantarne boje, zatim fade-in praznog bureta.

## Audio Mood
Dubok, topao, spor. Web Audio API generišetan bas-hum (sinusoid ~55 Hz, niska amplituda) koji pulsira u ritmu fermentacije. Klik = kratki "plop" (kratki decrescendo oscillator ~200 Hz). Prestiže = uzlazni swept sweep od 100 Hz do 800 Hz za 1.2 sekunde. Bez muzičke podloge — samo organski zvuci procesa.

## Win/Lose Uslovi
- **Pobeda (Prestiže):** Dostići 100% Mutacionog pritiska i izabrati mutaciju — igrač "pobeđuje" tu rundu i počinje novu. Konačna pobeda: sakupiti 7 različitih mutacija (otključava se "Savršeni Kvasac" ekran).
- **Poraz:** Nema klasičnog poraza — idle žanr. Ali: postoji "Kontaminacija" mehanika — ako igrač previše dugo ignoriše igru (bure predugo miruje), kvasac "umire" i igrač gubi trenutni napredak (ne i mutacije). Ovo forsira bar minimalan engagement svakih nekoliko minuta tokom sesije.

## Targetirana Dužina Sesije
4—7 minuta. Prva prestiže je dizajnirana da stigne za ~3-4 minute aktivne igre. Igrač koji hoće drugu mutaciju ostaje još 3-4 minute. Sedam mutacija = meta-cilj za višednevne igrače, ali svaka sesija je satisfaktorni sam po sebi.
