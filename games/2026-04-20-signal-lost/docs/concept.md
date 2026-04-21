# Concept: Signal Lost

## 1. Naziv igre
**Signal Lost**

## 2. Žanr
Puzzle / Roguelike mini (kombinacija)

## 3. Premisa
Svemirska sonda je izgubila vezu sa Zemljom. Igrač je inženjer koji mora da povuče "signal" kroz oštećenu mrežu čvorova — svaki čvor je mali zagonetni izazov koji treba da se "odblokira" da bi signal prošao dalje. Mreža je proceduralno generisana svaki run, a čvorovi se kvare po Murphyjevom zakonu — uvek kada najmanje treba. Nema spasa, nema helikoptera — ima samo logike i hladnih živaca.

## 4. Core Gameplay Loop

**Sekund-za-sekundom:**
- Na ekranu je mreža čvorova (5x5 do 7x7 grid), vizualizovana kao crtani krug-linkovi na crnoj pozadini.
- Svaki čvor ima jedan od 4 tipa: **Relay** (propušta signal automatski), **Gate** (traži da bude aktivan pre nego što propusti — aktiviraš ga klikom), **Scrambler** (vidi preciznu definiciju ispod), **OR-Splitter** (račva signal na dva moguća izlaza — signal mora da stigne do JEDNOG od ta dva izlaza, nije potrebno do oba).
- Signal kreće iz jednog ugla mreže ka suprotnom uglu. Animiran je kao putujuće svetlo kroz linije.
- Igrač klika čvorove da ih aktivira/deaktivira pre nego što signal stigne do tog čvora.
- Ako signal naiđe na blokirani Gate ili Scrambler u pogrešnom stanju — signal se gasi, run se završava.

**Definicija Scrambler čvora:**
Scrambler, kada je aktivan, menja stanje svih direktno susednih Gate čvorova (aktivan→neaktivan, neaktivan→aktivan). Ovo se dešava jedanput, u trenutku kada signal prođe kroz Scrambler. Scrambler sam po sebi ne blokira signal — signal prolazi slobodno, ali okidač se izvršava odmah pre nego što signal nastavi ka sledećem čvoru.

**Definicija OR-Splitter čvora:**
OR-Splitter račva signal na dva moguća izlazna puta. Signal mora da stigne do tačno JEDNOG od ta dva definisana izlaza (OR logika, ne AND). Koji put signal uzme određuje se stanjem čvorova na svakom putu — signal prati onaj put koji nije blokiran. Ako su oba puta slobodna, signal uzima gornji/desni (prioritet po poziciji). Ako su oba blokirana — fail.

**Minuta-za-minutom:**
- Svaki uspešno preneseni signal = novi, teži "level" (složenija mreža, više Scrambler-a, više OR-Splitter-a, brži signal).
- Na svakih 3 nivoa, igrač bira jedan od 3 **Power-Up**-a: "Slow Signal" (signal ide sporije za 2s), "Reveal" (svi tipovi čvorova se otkriju na 3s), "Freeze" (pauzira signal na 1.5s).
- Power-Up-ovi su jednokratni i biraju se iz nasumičnog seta — roguelike element.
- Run traje dok igrač ne pogriješi ili ne prođe 15 nivoa (win condition).

## 5. Hook
Signal koji se kreće kroz mrežu je vidljiv celo vreme — igrač vidi pretnju kako se bliži. To stvara pritisak, ali ne paničan (kao Tetris) — igrač mora da MISLI i da KLIKA tačno u pravo vreme. "Ja sam ga video, znam šta treba — samo da kliknem pre nego stigne" je loop koji natjera čoveka da kaže "još jedan run". Proceduralna generacija znači da nijedan run nije isti. Power-up izbori daju iluziju strategije i borbe sa RNG-om.

## 6. Vizuelna Estetika
- **Paleta:** Crna pozadina (`#0a0a0f`), čvorovi u tamno plavoj (`#1a2a4a`), aktivni čvorovi u cyan (`#00e5ff`), signal kao putujuća narandžasta tačka sa glow efektom (`#ff6b2b`), linije mreže u tamno sivoj (`#1f2937`).
- **Stil:** Minimalistički "blueprint" / sci-fi inženjering estetika. Bez pixel art-a. Čisti Canvas krugovi i linije. Svaki čvor ima ikonu unutra — jednostavni geometrijski simboli (strelica za Relay, bravar za Gate, spirala za Scrambler, račva za OR-Splitter).
- **Animacije:** Signal pulsira dok putuje (glowing dot). Aktiviranje čvora ima kratki "ripple" efekat. Uspješan prolaz = kratki zeleni flash cele mreže. Fail = crveni flash + signal se gasi sa fade-om.

## 7. Audio Mood
- **Mood:** Napeti ambijent, kao svemirska kontrolna soba u krizi. Tihi, ritmični hum u pozadini (Web Audio oscilator sa nisko frekvencijom ~60Hz, lagani tremolo).
- **Sound effects (generisani):**
  - Klik na čvor: kratki "bip" (sinusni oscilator, ~800Hz, 80ms)
  - Signal prolazi kroz čvor: lagani "swoosh" (filtered noise, 150ms)
  - Aktivacija Gate: "clunk" (sintetizovani beli šum sa pitchom prema dole, 200ms)
  - Level clear: kratka uzlazna melodija (4 tona, pentatonik, ~500ms)
  - Fail: pad tona + distorzija (oscilator prema 0Hz kroz 400ms)
- Sve sintetizovano kroz Web Audio API `OscillatorNode` + `GainNode` + `BiquadFilterNode`. Nema .mp3/.wav fajlova.

## 8. Win/Lose Condition
- **Win:** Igrač uspešno preusmeri signal kroz sva 15 generisana nivoa. Prikaže se "Signal Restored" ekran sa scorom (vreme + broj klikova + power-up-ovi koji su preostali).
- **Lose:** Signal naiđe na čvor u pogrešnom stanju (blokirani Gate, OR-Splitter bez slobodnog puta) — signal se gasi, prikaže se "Signal Lost — Nivo X" sa opcijom "Try Again".
- **Checkpoint sistem:** Checkpoint se automatski beleži na nivou 6 i nivou 11. Igrač koji pogine posle checkpointa restartuje od poslednjeg checkpointa (nova proceduralna mreža od tog nivoa), ali **gubi sve power-up-ove sakupljene posle checkpointa**. Power-up-ovi stečeni pre checkpointa ostaju. Pogibija pre nivoa 6 = restart od nivoa 1. Roguelike duh ostaje jer power-up progresija nije garantovana ni posle checkpointa.

## 9. Targetirana Dužina Sesije
**3-5 minuta** po run-u (15 nivoa x ~15-20 sekundi prosečno). Igrač koji pogriješi rano može završiti run za 1 minutu i odmah restartovati — ritam kratkih run-ova.

## 10. Zašto Ova Igra Danas
Puzzle+roguelike combo je žanr koji se implementira relativno kompaktno (nema fizike, nema AI, nema sprite-a), ali daje visok replay — idealno za prvi dan kada se uspostavlja pipeline i želi solidan, završen proizvod bez riskantnih tehničkih dugova.
