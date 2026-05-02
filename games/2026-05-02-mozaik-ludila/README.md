# Mozaik Ludila

**Žanr:** Puzzle (logic grid + color matching)
**Datum:** 2026-05-02
**Beta ocena:** 7.0 / 10 → **Post-fix: 8.5 / 10**

## O igri

Ti si restorer starih mozaika u haotičnom arhivu. Fragmenti pločica dolaze jedan po jedan — postavljaš ih slobodno na 8×8 rešetku. Kad formiraš kompletan red, kolonu ili 2×2 kvadrant iste boje, pločice nestaju i oslobađaju prostor. Dostigni 2500 poena pre nego što se rešetka popuni.

Mediteranska/vizantijska estetika u tamnim kamenim bojama, serif fontovi, zlatni combo efekti.

## Kako se igra

1. **Klikni na fragment** u donjoj zoni da ga selektuješ (videćeš ga uvećanog)
2. **Klikni R** ili ponovo na fragment da ga rotiraš (90° u smeru kazaljke)
3. **Klikni na grid** da postaviš fragment — semi-transparentni preview pokazuje gde bi išao
4. **Crveni preview** = nevalidna pozicija (zauzeto ili van grida)
5. **Hint glow** oko redova/kolona/kvadranata = blizu si matcha, nastavi tu!
6. **Combo** = uzastopni matchevi povećavaju multiplikator (do ×5)

**Cilj:** Dostići 2500 poena (progress bar na vrhu)

**Kraj:** Ako sledeći fragment ne može stati nigde → Game Over

## Kontrole

| Akcija | Desktop | Mobile |
|--------|---------|--------|
| Selektuj fragment | Klik | Tap |
| Rotiraj | R ili klik na fragment | Tap na fragment |
| Postavi | Klik na grid | Tap na grid |
| Deselektuj | Escape / klik van | Tap van |

## Tim

- **Sine Scenario** — Koncept i narativ
- **Nega Negovanović** — Premortem (DRŽI UZ KOREKCIJE)
- **Mile Mehanika** — Game design i balans
- **Jova jQuery** — Implementacija (Vanilla JS, Pure Canvas)
- **Pera Piksel** — CSS estetika (mediteranski stil)
- **Ceca Čujka** — Web Audio zvučni efekti
- **Beta Trio** — Testiranje i bug report
