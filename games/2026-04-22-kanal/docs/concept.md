# Concept: Kanal

## Naziv igre
**Kanal** *(ili puno ime: "Kanal — Odbrana Dunava")*

## Žanr
Strategy mini — Tower Defense (turn-based talasima, real-time akcija u talasu)

## Premisa
Noć je. Dunav šumi. Na tvoju stranu reke kreću čamci — jedan za drugim, tiho, bez upozorenja.
Ti si komandant bataljona koji brani jedan jedini prelaz: staru Kanal-luku.
Nema pojačanja. Samo topovi, bodljikava žica i pamet.

## Core Gameplay Loop
1. **Priprema** — Između talasa imaš 10 sekundi i ograničen budžet. Postavljaš ili unapređuješ oružane pozicije na mrežu (grid 9×5 ćelija).
2. **Talas** — Neprijatelji kreću sa desne strane po fiksnim koridorima reke. Tvoje kule automatski pucaju; ti možeš ubrzati, pauzirati ili ručno aktivirati specijal.
3. **Zlato pada** — Uništeni brodovi i tenkoveti ostavljaju scraptovano blago na mapi. Klikni/tapni da pokupišemo pre nego što potone.
4. **Procena štete** — Neprijatelji koji prođu gaze komandni punkt. Imaš 20 HP. Izgubi sve — game over.
5. **Nova oprema** — Svaki 5. talas otvara se jedna nova kula iz arsenala (Minobacač, EMP puls, Zaštitni zid).

## Hook
"Još jedan talas" — klasičan tower defense ritam.
Ali ono što Kanal dodaje: **blago koje tone**. Ako ne pokupis loot na vreme, ostaje bez njega zauvek. To forsira aktivno učešće čak i dok kule automatski pucaju — nisi pasivni posmatrač, uvek postoji razlog da klikneš. Svaki talas je kratka taktička zagonetka: gde ću potrošiti budžet ovaj put?

## Vizuelna Estetika
**Paleta:**
- Pozadina i voda: tamno plava `#0d1b2a`
- Mreža i teren: oker/prljavo zelena `#4a5240`
- Neprijatelji (čamci, vozila): hrđa/narandžasta `#c0501a`
- UI, zlato, vatreni efekti: zlatno-žuta `#f5c842`

**Stil:** Minimalistički pixel art — kvadratne ćelije, bez anti-aliasinga. Sve se crta na `<canvas>`. Voda se animira sporim sinusoidnim talasanjem (CSS + canvas overlay). Eksplozije su particlice od kvadratića. Noćna atmosfera — malo vignette, kule bacaju mali krug svetla.

## Audio Mood
Tiho i napeto — niski drone basa kao pozadina (Web Audio oscilator, low-pass filter).
Pucnji su kratki, suvi click-boom (buffer sa white noise + kratki decay envelope).
Kada neprijatelj prođe kroz odbranu: alarm zvuk — oscilator koji raste u tonu.
Između talasa: tišina sa povremenim zvukom vode (LFO-modulisani noise).
Nema muzike — samo ambijent i feedback zvukovi.

## Win / Lose Uslovi
- **Game Over:** HP komandnog punkta padne na 0 (neprijatelji koji dođu do leve ivice mape).
- **Beskonačno sa Score-om:** Nema kraja — igra se nastavlja dok se brani. Score = ukupno uništenih neprijatelja × multiplikator talasa. Finalni ekran prikazuje domet (Talas X, Skor Y) i jednostavnu poruku sa "Pokušaj ponovo".
- **Sekundarna pobeda:** Svaki 10. talas je Boss talas (jedan mega-brod sa puno HP) — preživljavanje nosi bonus zlato i badge na ekranu.

## Targetirana Dužina Sesije
**7–12 minuta** (otprilike 12–18 talasa pre nego što tenzija postane prevelika za novi igrač; veteran može ići 25+)
