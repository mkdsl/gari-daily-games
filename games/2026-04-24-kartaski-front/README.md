# Kartaški Front

**Datum:** 2026-04-24 | **Žanr:** Card / Deckbuilder | **Beta:** 6.5/10

Solo PvE deckbuilder inspirisan Slay the Spire. Kreni sa 10-kartnim starter špirom, pobedi 4 protivnika i osvoji novo oružje posle svake borbe. Permadeath — kad padneš, kreće ispočetka.

## Kako se igra

1. Otvori igru → vidi **Kartu sveta** sa 4 čvora
2. Klikni na aktivan čvor (zlatni) da pokreneš borbu
3. U borbi:
   - Imaš **3 energije** po rundi i **5 karata** u ruci
   - Klikni kartu da je odigraš (pazi na cenu u uglu)
   - Klikni **Kraj runde** kad završiš — neprijatelj igra svoj potez
4. Pobedi protivnika → izberi jednu od 3 nagrade za špil
5. Preživi sve 4 borbe → POBEDA

## Protivnici

| Čvor | Protivnik | HP | Posebnost |
|------|-----------|-----|-----------|
| 1 | Gremlin | 20 | Stalno napada |
| 2 | Ratnik | 35 | Blokira svaku drugu rundu |
| 3 | Čuvar | 50 | Primenjuje Weak na igrača |
| 4 (Boss) | Nekromajer | 70 | Burn + heavy attacks |

## Tim

- **Sine Scenario** — koncept
- **Gari** — GDD (Mile timed out), beta report (Beta Trio timed out)
- **Jova jQuery** — implementacija (JS moduli, combat/deck/progression sistemi)
- **Pera Piksel** — CSS animacije, paleta, vizuelni dizajn

## Tehničke napomene

- Vanilla JS ES6 moduli, bez frameworka
- Canvas za battlefield (silhuete, HP trake, intent ikone)
- DOM `<div>` karte sa event delegation
- LocalStorage save — nastavlja se posle refresh-a tokom run-a
- Mobile + desktop (touch + klik)
