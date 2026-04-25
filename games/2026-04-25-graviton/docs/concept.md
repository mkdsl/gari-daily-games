# Graviton — concept.md

## 1. Naziv igre
**Graviton**

## 2. Žanr
Platformer / Arkada (auto-scroll sa kontrolom gravitacije)

## 3. Premisa
Igrač ne kontroliše kretanje likа — brod se sam kotrlja udesno po beskrajnoj traci. Jedino što možeš je **okrenuti gravitaciju** jednim pritiskom. Svet je prepreka od betona, šiljaka i rotujućih oštrica — a ti ploviš između njih gore-dole kao lopta odbijena između dva magneta.

## 4. Core gameplay loop
Svakih 5–15 sekundi nailazi nova "zona":
- Vidljiv su šiljci na podu — tapneš (Space / tap) i gravitacija se okrene, lepiš se za plafon
- Prolazak kroz uski prolaz zahteva precizno tajmovanje drugog prelaza
- Ako si predugo na jednom gravitacionom polu, boja broda postaje crvena (upozorenje za "G-overload") — moraš promeniti pol pre nego što eksplodiraš
- Svaki živi minut donosi +1 Speed Level — zona se generišu brže i kompleksnije

Radnja jednog ciklusa:
1. Vidiš prepreku
2. Proceniš — flip ili čekaj
3. Tapneš (ili ne)
4. Brod prođe ili udari — instant death, restart od tallje 0

## 5. Hook
**"Još jedan pokušaj"** faktor je čist kao u Flappy Bird-u, ali sa dubinom: igrač brzo shvati da nije sreca već tajming. Svaki pokušaj je kratak (30s–2min), ali uvek misliš "bio sam TOLIKO blizu". Nove zone dolaze u randomizovanom redosledu iz pool-a od ~20 šablona — nikad isti run dva puta. Pored toga, **G-overload mehanika** dodaje pritisak i u "lakim" zonama: ne možeš jednostavno zalepiti se za plafon i čekati.

## 6. Vizuelna estetika
- **Pozadina:** duboki indigo (#0D0D2B) sa laganim horizontal scroll efektom — pruge svetlosti koje liče na zvezdanu maglu
- **Brod:** maleni bijeli trokut, 16×16 piksela, pixel art, bez animacije osim rotacije pri flipu (180° u 150ms)
- **Prepreke:** tamnonarančaste (#FF6B2B) geometrijske forme — blokovi, šiljci (trouglovi), rotirajući kvadrati koji liče na pile buzzsaw-e
- **Pod i plafon:** čvrste crne trake sa neonsko-zelenim (#39FF14) rubnim linijama
- **G-overload zona:** brod postepeno prelazi od belog → žutog → crvenog, a screen edges dobijaju crveni vignette
- **Stil:** minimalistički sci-fi, bez teksta unutar igre osim HUD-a

## 7. Audio mood
- **Ambient loop:** duboki synthwave drone, sporo pulsira u tempu ~70 BPM
- **Flip zvuk:** kratki "whoosh" + reverb plop — generisan Web Audio API (oscillator sweep)
- **Upozorenje (G-overload):** visokofrekventni beep koji se ubrzava kako brod crveni
- **Smrt:** kratki dissonant chord (tri oscilatori u minor cluster, fadeout 300ms)
- **Score milestone (svaki minut):** kratki ascending arpeggio, chiptune stil

## 8. Win condition
Nema kraja — igra je endless survival. "Pobeda" po sesiji se definiše kao:
- Preživeti **5 minuta** = zlatna zvezda na end screenu
- Preživeti **10 minuta** = platinum

High score se čuva u localStorage (vreme u sekundama). End screen pokazuje vreme + best time.

## 9. Lose condition
Brod dodirne šiljak, zid ili bočne prepreke — ili **G-overload** dosegne 100% (previše dugo na jednom polu bez flipa). Instant smrt, fade to black, end screen sa "CRASHED AT X:XX" + best time + dugme RESTART.

## 10. Targetirana dužina sesije
- Prosečan novi igrač: **1–3 minute** po pokušaju, 5–10 pokušaja
- Iskusni igrač: sesija od **10–20 minuta** tražeći novi rekord
- Ukupno vreme pre "zasićenja": ~20–30 minuta

## 11. Folder naziv
`2026-04-25-graviton`
