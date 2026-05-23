# Beta Report — Pakuj Torbu: Avala Edition
_Beta Trio: Zora (UX) + Raša (tech) + Lela (engagement)_

---

## Zora — UX / First Impression

**Pozitivno:**
- Ghost preview (zeleno/crveno) je odličan UX element — igrajući odmah razumeju gde predmet ide.
- Naslov „PAKUJ TORBU“ je direktan i ne zahteva objasnjenje.
- Item panel je čit i strukturiran: emoji + naziv + pts + required vs. bonus distinkcija.
- Countdown do Avale na start screenu je lepa detalj.

**Problemi:**
- `[MEDIUM]` Panel width (160px) može biti preuzak na 375px telefonu — canvas za grid dobija ~215px, što je za 6×8 grid sa 52px ćelijama (312px) **premalo**. Canvas resize logika mora skalirati cell size dinamicki.
- `[MEDIUM]` Nema vizuelnog feedback-a kad se selektuje predmet a onda klikne van grida — player ne zna je li selekcija ostala aktivna.
- `[LOW]` CTA dugme na game-over screenu je dobro pozicionirano ali malo — na mobilnom trebalo bi veće touch target (min 48px height).

---

## Raša — Tech / Bugs

**Pozitivno:**
- ES6 moduli su korektno strukturirani, bez cirkularnih dependencija.
- Audio fallback (try/catch na AudioContext) je solidan.
- LocalStorage highscore ima try/catch — neće crashovati na incognito.
- Canvas resize on window resize je implementiran.

**Problemi:**
- `[CRITICAL]` `CELL_SIZE` je fiksiran na 52px ali canvas dimenzija je dinamična. Na manjem ekranu grid može izaći van canvas bounds. Potrebno: `const cellSize = Math.min(CELL_SIZE, Math.floor((canvas.height - 40) / backpack.height), Math.floor((canvas.width - 40) / backpack.width))` i prosleđivati ga u render funkcije.
- `[MEDIUM]` `requestAnimationFrame` loop se ne pauzira kad je screen !== 'playing' — render() se poziva na start/game-over screenovima. Neefikasno ali ne buggy.
- `[MEDIUM]` `item.placed` i `state.placedItems` mogu biti out of sync ako se isti item objekt koristi na više mesta. Treba centralizovati state mutation.
- `[LOW]` `touchend` na item panelu koristi `passive: false` ali ne sprečava ghost click na desktop — može doći do double-fire. Treba `e.stopPropagation()`.

---

## Lela — Engagement / Retention

**Pozitivno:**
- 5 nivoa sa rastom teškoće je dobar retention hook.
- Daily highscore je pravi daily-driver mehanizam.
- Particle efekti pri smeštanju daju satisfying feedback.
- Grade sistem sa 3 tira motivise na re-play za "Savršeno pakovanje".
- Karta kao REQUIRED predmet je genije — bilet CTA je organski.

**Problemi:**
- `[MEDIUM]` Nema vizuelnog slavlja kad se ispakuju SVI required predmeti (mid-level milestone). Kratka celebracija bi pojačala retention.
- `[LOW]` Score pop animacija je implementirana ali nije učešćena (ne poziva se `spawnScorePop` u main.js). Treba ga wiredovati.
- `[LOW]` Nema sharing preview slike — Web Share API daje samo tekst. OG image bi pojačao social virality.

---

## Finalna ocena

**beta_score: 7.5 / 10**

Igra radi, konceptualno je dobra, brand integracija je odlična. Glavna stvar za fix je **dinamično skaliranje cell size-a** kako bi grid stao na sve ekrane. Ostalo su polish items.
