# Fix Log — Sudnik: Tribunal of Cards

## Bug 1 — CRITICAL: Duplikacija karata u deck-u pri reshufflovanju
**Fajl:** `src/deck.js` — funkcija `discardHand`
**Problem:** `discardHand` dodavala je `state.currentCase.playedCards` direktno u `discardPile` bez provere duplikata. Ako je `reshuffleDiscard` bio pozvan tokom draw faze (kada deck ostane prazan), karte sa istim ID-jevima su već bile u `discardPile`. Na sledećem `reshuffleDiscard` isti card.id bi ušao u deck dvaput — deck se inflatuje oko slučaja 5-6, karte se ponavljaju, balanceScore postaje netačan.
**Fix:** Pre dodavanja karata iz ruke i `playedCards` u `discardPile`, gradi `Set` postojećih ID-jeva i dodaje samo karte čiji ID nije već prisutan. Za `playedCards` se pri dodavanju čuva samo `baseCard` (bez `direction` i ostalih runtime polja).

## Bug 2 — MEDIUM: Touch targeti na kartama premali za mobilni
**Fajl:** `styles/ui.css` — selektor `.card-actions .btn-guilty, .card-actions .btn-free` (linija 333)
**Problem:** Dugmad KRIV/SLOBODAN na karticama imala su `padding: 4px 2px; font-size: 0.6rem`. Efektivna touch area bila je ~24-28px visine — daleko ispod minimalnog 48px preporučenog za mobilne uređaje. Korisnici su morali precizno da ciljaju prst na mali prostor.
**Fix:** Padding povećan na `10px 8px`, font-size na `0.72rem`, dodato `min-height: 44px` i eksplicitna `font-family`, `font-weight`, `cursor` i `border: none` da se osigura konzistentna vizuelna i touch oblast.

## Bug 3 — MEDIUM: `renderPlayedZones` ignorišuje presedant multiplikatore
**Fajl:** `src/ui.js` — funkcija `renderPlayedZones`; `src/main.js` — pozivači funkcije
**Problem:** Funkcija je koristila `card.value` (originalnu vrednost) za prikaz u mini kartama odigranih zona. Kada su bili aktivni presedanti p05 (svedok ×1.5), p06 (zakon ×0.5) ili p10 (karakter ×2), vaga i `balanceScore` su bili ispravni jer `onCardPlay` koristi `getEffectiveCardValue`, ali prikazana vrednost u zoni je bila pogrešna — igrač bi video "+2" a vaga bi pomerila "+3".
**Fix:** Dodat `precedents = []` parametar u `renderPlayedZones`. Vrednost se računa sa `getEffectiveCardValue(card, precedents)` umesto `card.value`. Import `getEffectiveCardValue` je već bio prisutan u `ui.js`. Oba poziva u `main.js` (draw faza i `onCardPlay`) ažurirana da prosleđuju `state.precedents`.

---

## Bonus Fix — Animacija `deltaPopIn` nije se aktivirala u reputation fazi
**Fajl:** `styles/game.css`
**Problem:** CSS selektor bio je `.delta-item`, ali `renderReputation` u `ui.js` generiše elemente sa klasom `.delta-row`. Animacija `deltaPopIn` se nije primenjivala — delta promene Mase i Vlasti su se pojavljivale bez pop-in efekta.
**Fix:** Selektor promenjen sa `.delta-item` na `.delta-row` (uključujući `:nth-child(2)` delay selektor).
