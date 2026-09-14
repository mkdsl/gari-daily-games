# Patch Queue — Dan Posle

## Otvoreni patčevi

### P1 — Bug (brand / UX šteta)
- [x] P1 `src/share.js` — ispraviti URL u generateScoreCard (done 2026-09-14, commit ff42382)
- [x] P1 `src/systems/prestige.js` + `src/state.js` — konsolidovati loadPrestige() na keš (done 2026-09-14, commit d7cd43e)

### P2 — Polish (vidno poboljšanje)
- [x] P2 `src/ui.js` — resource bar fill clamp dodat (done 2026-09-14, commit 0a4c68d)
- [x] P2 `src/main.js` — dead import-i renderHUD + loadAchievements uklonjeni (done 2026-09-14, commit 0a4c68d)
- [x] P2 `src/systems/decision_engine.js` — dead partitionNodes() uklonjena (done 2026-09-14, commit 0a4c68d)
- [ ] P2 `src/ui.js` + `styles/ui.css` — midgame CS progress hint: na satu 12 (podne) prikaži netametni tooltip "Trenutno: CS X — za 'Dobar posao' trebaš 6+ do 19:00" sa progress barom koji nestaje posle 4s
- [ ] P2 `src/state.js` + `src/ui.js` — CS start reframe: umesto "CS: 0.0" na startu, prikaži "Nered: 10 — danas krećeš od nule" kao vizuelni ankor (psihološki prioritet je čišćenje, ne apsolutni skor)
- [ ] P2 `src/ui.js` + `styles/ui.css` — decision momentum cue: kad igrač donese 3 uzastopne odluke u isti ending-pravac (sve Veze++ ili sve Nered--), kratki ambient flash + tekst "Nešto se kristališe..." (2s, bez spoilovana ishoda)

### P3 — Content / Feature expansion
- [ ] P3 `src/content/brand_hooks.js` — dodati Guncati volonterski CTA u "Zajednica nastaje" ending: dugme "Prijavi se za Guncati tim 2027 →" sa href="https://guncati.rs/volonteri" (novi tab, ne prekida igru)
- [ ] P3 `src/content/brand_hooks.js` — prestige ending "Sledeće leto" dobija Guncati loyalty hook: dialog node prikazuje "Toma zna — Guncati grand finale čeka." + subtekst "Budi prvi koji zna kad karte izađu → guncati.rs" (samo 2. playthrough, CS >= 8)
- [ ] P3 `src/share.js` — generateScoreCard dodaje Kluboslavija hashtag u share tekst: "#KluboslavijaTurneja2026 #DanPosle" + play_url
- [ ] P3 `src/content/brand_hooks.js` + `src/ui.js` — endings screen (sva 4 endinga) dobija footer link "Sledeća Kluboslavija stanica →" sa NEXT_EVENT konstantom iz config.js; ako je null — link se ne prikazuje
- [ ] P3 `src/content/brand_hooks.js` — achievement A3 unlock reward: Kluboslavija promo placeholder koji šef zamenjuje pre narednog event-a; do tada "Prati Kluboslavija → instagram.com/kluboslavija"
- [ ] P3 `src/ui.js` + `styles/game.css` — pre-ending horizon signal: na satu 18 (Sumrak), ambijentalni CSS filter počinje blagi warm shift — emocionalni signal da se dan zatvara bez teksta
- [ ] P3 `src/state.js` + `src/content/aforizmi.js` — prestige ton marker: N9B i N26B Tomin aforizam se prikazuje u italic + blago drugačijoj boji uz prefix "(Toma: '...')" — vizuelna razlika od prvog playthrough-a
- [ ] P3 `src/content/dialogue.js` — "prolog" monolog na intro screenu (menja se po prestige runu): run 0 = "Jutros ništa ne znaš. To je prednost."; run 1+ = "Prošle noći si napravio izbor. Toma pamti. Slavko pamti. Ti si zaboravio."
- [ ] P3 `src/content/dialogue.js` + `src/systems/prestige.js` — Toma prestige epilog (N26B) zavisi od Slavko statusa: pomiren = "Rekao je da ste vi dokaz da se može."; ogorčen = "Rekao je da si selektivan sa mirenjem."
- [ ] P3 `src/content/dialogue.js` — Slavko arc treća tačka: novi N17 varijanta dostupna samo ako je pomirenje (N3) pre podne — Slavko šalje poruku oko 14:00 sa pozivom za zajednički projekt
- [ ] P3 `src/content/dialogue.js` — Ana zatvaranje: ako je N1 outcome "helped", dodati SMS node oko N14 (14:00) gde Ana javlja je li stigla i sadi Kluboslavija hook
- [ ] P3 `src/content/dialogue.js` — "tihi svedok" node za N22 (Jova Instagram pitch): ako igrač ima i pomirenog Slavka i dobar Toma odnos, Jova dodaje "i komšije su za nas" — mala narativna nagrada za poseban playthrough

## Završeni patčevi

_(prazan)_
