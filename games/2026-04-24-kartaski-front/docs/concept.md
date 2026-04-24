# Kartaški Front

## Žanr
Card/Deckbuilder — slay-the-spire lite, solo PvE dueli

## Premisa
Putujuci kartaški mađioničar prolazi kroz niz neprijatelja na karti sveta, biranjem karata iz ruke gradi ruku po runi i bori se dok god mu traje život. Svaka pobeda donosi novu kartu u špil — svaki poraz vraća na početak.

## Core gameplay loop (korak-po-korak šta igrač radi)
1. Igrač vidi bojno polje: leva strana — neprijatelj (HP traka, namera za sledeći potez), desna strana — igrač (HP, energija za rundu).
2. Na početku runde igrač vuče 5 karata iz svog špila.
3. Igrač igra karte iz ruke trošeći energiju (svaka karta košta 1-3 energije, runda daje 3 energije).
4. Karte mogu biti: Napad (nanese direktnu štetu), Odbrana (postavi štit za tu rundu), Efekat (postavi stanje: Burn, Weak, Poison, Regen).
5. Kada završi, klik "Kraj runde" — neprijatelj odigra svoju nameru (attack/block/buff).
6. Ponavljaj dok jedan od učesnika ne dospe na 0 HP.
7. Pobeda: igrač bira jednu od 3 ponuđene nove karte za špil, pa prelazi na sledeci čvor na karti.
8. Smrt: game over, novi run s početnim špilom.

## Hook — zašto bi neko igrao 5 minuta?
Svaka ruka je mala taktička odluka: koliko energije sačuvati za blok, da li riskirati agresivnu rundu ili se braniti od najavljenog napada? Špil raste i postaje sve zanimljiviji, ali igrac nikad ne zna da li je sledeci neprijatelj boss koji ce ga srušiti. Napetost "samo jos jedan boj" drži pažnju.

## Vizuelna estetika (paleta boja, vizuelni stil)
- Tamna noćna paleta: pozadina #1a1a2e (duboki plavo-crna), kartice #16213e sa zlatnim rubom #e2b96f
- Neprijatelji i igrač prikazani kao minimalistički ASCII art / Canvas-drawn likovi (pixel silhuete, par linija)
- Karte: zaobljeni pravougaonici sa ikonom (nacrtanom na Canvas) i kratkim tekstom
- HP trake: uska, jakih boja — crvena za neprijatelja, zelena za igrača
- "Namera" neprijatelja prikazana ikonografski iznad njega (mač = napad, štit = blok, skull = debuff)
- Font: monospace, old-school feel

## Audio mood
Tmuran, ambijentalan — spori dronovi i povremeni metal-na-metal zvuk pri napadu. Web Audio API: dva sinusna oscilatora u laganom disharmoničnom intervalu za ambijent, kratki FilteredNoise burst za karte koje "padaju" na sto. Tih i ne-nametljiv.

## Win condition
Pobediti sva 3 čvora na "karti sveta" (3 obična boja + 1 boss na kraju = 4 borbe ukupno). Ko prode sve 4 borbe, dobija "Pobednik" ekran sa ukupno nanetom štetom i brojem odigranih karata. Nema trajne progresije — svaki run je svež, ali postoji lokalni highscore (broj poena = HP ostalo × karte u špilu).

## Targetirana dužina sesije
3–7 minuta po runu. Brze runde (30–60 sekundi po borbi), 4 borbe ukupno. Izgubiti i početi iznova je brzo i bezbolno — očekujemo 2-3 pokušaja u sesiji od 10 minuta.
