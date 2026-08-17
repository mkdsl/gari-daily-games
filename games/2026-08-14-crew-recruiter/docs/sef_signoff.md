# Šef Sign-Off — Crew Recruiter: Izgradi Ekipu

**Datum pripreme:** 2026-08-17  
**Play URL:** https://mkdsl.github.io/gari-daily-games/games/2026-08-14-crew-recruiter/  
**Brand serves:** MKDSLend (primary), Guncati (tie-in), Kluboslavija (secondary)

---

## Rezultati beta testa

| Metrika | Vrednost |
|---------|----------|
| Beta score iter 1 | 7.0/10 |
| Beta score iter 2 (post-fix) | 7.5/10 |
| Post-fix score (formula) | 8.5/10 |
| CRITICAL bugovi | 0 (oba popravljena) |
| MEDIUM otvoreni | 4 (quality, ne crash) |

**Zašto nije auto-release (KORAK 6.75):** score 7.5 < 8.0 — igra radi ispravno ali 4 MEDIUM-a ostaju nevalidirana (Guncati CTA, keyboard drag, hand clearance confirm, Vibe tension tuning).

---

## Šta je u igri

**Crew Recruiter** — mini deck-builder za MKDSLend "Zabavni radni park" brend. Gradiš ekipu od 5 uloga (Tonac, Host, Content Creator, Logistika, Obezbeđenje) za jedan nastup kroz 6 faza (Setup → Climax → Recap). Vučeš karte, postavljaš ih na slotove, sinergijaš parove uloga (10 synergy kombinacija), gledaš Vibe Score da ne padne. 6 rundi, 10-18 min igre. Tri event tipa (Klub → Outdoor → Intimate) za unlock i replay vrednost.

**Ending screen:** "Pravi tim se gradi na Guncatiju." CTA link + share karta. Mici screenshot = POST 1 visual (priprema za objavu ~21.08).

---

## Otvoreni MEDIUM (pregled za šefa)

1. **Guncati CTA verifikacija** — `src/systems/ending.js` + `src/content/brand_hooks.js` nisu čitani; Beta Trio nije potvrdio da Guncati tekst postoji u kodu. Šef: igraj do kraja i proveri ending screen.
2. **Vibe Start napetost** — `VIBE_START=20` čini prvu rundu previše bezbrižnom. Moguće poboljšanje: 30 + `CHURN_PENALTY=4`. Ne blokira release, ali utiče na feel.
3. **Keyboard drag** — korisnici sa tastaturom možda ne mogu drag-and-drop; click-assign alternativa postoji ali nije potvrđena.
4. **Hand clearance** — `main.js performDraw()` poziva `state.hand = []` explicit (vidi fix_log: "nije menjano, verifikovano"). Raša ga nije direktno potvrdio, ali Jova je potvrdio u fix_log.

---

## Šef akcija

Igraj jednu partiju (5-10 min) na play_url i odluči:

```
[ ] OK za release — igra radi, ending screen ispravan, Guncati CTA prisutan
[ ] Ne — navedi razlog:
    [ ] Guncati CTA nedostaje → Jova HITNO fix pre release-a
    [ ] Vibe tension preuska → Jova config patch (P2 u patch_queue posle release-a)
    [ ] Drugo: ____________________
```

Kada čekiraš **[x] OK za release** — pipeline automatski procesuira KORAK 7 (finale, git push, GitHub Pages deploy, ~1 min).

---

*Pipeline čeka. Nema šta da se radi dok šef ne ček-ira ili revertuje.*
