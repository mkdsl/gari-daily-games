# Pulse Runner

## Žanr
Roguelike mini + Rhythm/reflex — svaki run je proceduralan, ali ritam pulsa te vodi kroz njega.

## Premisa
Ti si signal — električni impuls koji putuje kroz kvarne neuronske mreže. Svaka ćelija je labirint koji se menja u ritmu srčanog otkucaja. Preživiš otkucaj, napreduješ. Propustiš ritam, ćelija te ispljune nazad.

## Core Gameplay Loop

1. **Pokreni run** — signal se pojavljuje na rubu proceduralnog grida (7×7 do 11×11 ćelija)
2. **Čekaj puls** — svake ~1.2 sekunde ekran "kucne" (bljesak + shake). Samo tokom pulsa smeš da se pomeriš
3. **Izaberi smer** — tap/strelica u jednom od 4 smera. Ako smer vodi u zid ili van grida, ne krećeš se i gubig otkucaj
4. **Sakupi energiju** — zlatne ćelije na gridu daju energiju. Energija = životi za sledeće nivoe
5. **Dođi do izlaza** — svaki nivo ima jedan exit. Dolaskom do njega, nivo raste (grid veći, zidovi agresivniji, puls brži). Propadneš li 3 otkucaja bez pomaka — kraj runa

## Hook (zašto 5 minuta?)
"Samo još jedan nivo" — jer grid je mali, run je kratak, ali uvek misliš da si ovaj put blizu rekorda.

## Vizuelna estetika
- **Pozadina:** `#0a0a12` — skoro crna, duboki tamno-plavi tint
- **Grid ćelije:** `#1a1a2e` — tamno-ljubičasto-plava, neaktivne
- **Signal (igrač):** `#e94560` — električno crvena, pulsira na ritam
- **Energija (collectible):** `#f5a623` — toplo žuta, meka glow aura
- **Exit:** `#00d4aa` — tirkizna, blago animirana
- **Puls efekat:** `#ffffff` → fade ka `#1a1a2e` za 0.3s — ceo ekran na otkucaj

Stil: **geometric minimalist** — samo kvadrati, bez sprite-ova. Sve je boja i tajming.

## Audio mood
Web Audio synthesis — sinusni puls na 60 Hz koji "kucne" na svaki beat (kratki attack, brzi decay, kao EKG). Collectible daje kratki ascending tone (440→880 Hz, 80ms). Game over: descending sine glide (880→110 Hz, 600ms). Sve u pentatonskoj skali da ne bode uši. Bez loopovane muzike — tišina između otkucaja naglašava tenziju.

## Win condition / Kraj sesije
- Nema "kraja" — roguelike je beskrajan u teoriji, ali prosečan run traje 5-10 nivoa
- **High score** se pamti u localStorage (broj nivoa + ukupno sakupljene energije)
- Run se završava kada igrač izgubi 3 uzastopna otkucaja bez pomaka (srce staje)
- Ekran "Game Over" prikazuje depth (broj nivoa) + energy score + personal best

## Targetirana dužina sesije
3-6 minuta po runu. Death je brz i bezbolan — restart za 2 sekunde.

## Slug
pulse-runner
