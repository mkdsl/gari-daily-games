# Sudnik — Tribunal of Cards

**Datum:** 2026-05-04  
**Žanr:** Card / Deckbuilder + Strategy mini  
**Trajanje sesije:** 6-9 minuta  

## Opis

Ti si sudija u distopijskom gradu koji nema zakone — ima samo *presedante*. Svaka tvoja presuda postaje nova karta u tvojoj ruci. Svaka karta je argument. Ti odlučuješ ko je kriv, ali tvoje odluke se vraćaju — sledećeg slučaja, optužba će citirati tvoje prethodne presude.

Balansiraš između dve sile: **Masa** (narod) i **Vlast** (sistem). Ako izgubiš oboje — smenjen si.

Na kraju 10 slučajeva, igra generiše tvoj **Profil Sudnika** — ogledalo tvoje filozofije, ne trofej.

## Kako se igra

1. Svaki slučaj prikazuje optuženog i opis zločina
2. Iz ruke od 5 karata, odigraj 1-3 na KRIV ili SLOBODAN stranu vage
3. Vaga pokazuje numerički balans u realnom vremenu
4. Pritisni **KRIV** ili **SLOBODAN** — ti uvek možeš presuditi suprotno od vage
5. Svaka presuda generiše novi *presedant* koji važi 3 slučaja i menja buduće slučajeve
6. Jednom po slučaju možeš odbaciti 1-2 karte i povući nove

## Strategija

- Presedanti akumuliraju tvoju "filozofiju" — budi dosledan ili ćeš se zaglavljati
- Masa i Vlast imaju suprotne interese — "pobuna" kaznjena čuva Vlast, ali ljuti Masu
- Tutorijalni slučaj (1. slučaj) je uvek krađa — nauči mehaniku tu
- 10. slučaj je uvek "pobuna" — najdramatičniji finale

## Tim

| Uloga | Ko |
|---|---|
| Koncept & Narativ | Sine Scenario |
| Premortem | Nega Negovanović |
| Game Design | Mile Mehanika |
| Implementacija | Jova jQuery |
| UI & CSS | Pera Piksel |
| Beta Test | Beta Trio (Zora + Raša + Lela) |
| Orkestrator | Gari |

## Tehničke napomene

- Vanilla JS ES6 moduli, bez frameworka
- DOM-based (ne Canvas)
- Mobile + desktop (touch + keyboard)
- Save/load u localStorage
- Svi vizuali generisani u kodu (CSS), bez eksternih asset fajlova

## Skorovi

- **Beta ocena:** 7.5/10
- **Post-fix ocena:** 9.0/10
