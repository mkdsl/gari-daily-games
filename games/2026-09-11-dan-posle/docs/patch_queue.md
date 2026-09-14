# Patch Queue — Dan Posle

## Otvoreni patčevi

### P3 — Content / Feature expansion
- [x] P3 `src/content/brand_hooks.js` + `src/ui.js` + `styles/ui.css` — Guncati CTA u "Zajednica nastaje" ending + prestige loyalty hook (done 2026-09-14, commit 8fe5adc)
- [x] P3 `src/config.js` + `src/ui.js` + `styles/ui.css` — endings screen footer link "Sledeća Kluboslavija stanica →" sa NEXT_EVENT konstantom (done 2026-09-14, commit 0b378b3)
- [x] P3 `src/content/brand_hooks.js` + `src/ui.js` + `styles/ui.css` — A3 achievement Kluboslavija promo u notifikaciji (done 2026-09-14, commit 7d38c78)
- [x] P3 `src/atmosphere.js` + `styles/atmosphere.css` + `src/main.js` — pre-ending horizon signal: na satu 18 (Sumrak), ambijentalni CSS filter počinje blagi warm shift — emocionalni signal da se dan zatvara bez teksta (done 2026-09-14, commit a2fb094)
- [ ] P3 `src/state.js` + `src/content/aforizmi.js` — prestige ton marker: N9B i N26B Tomin aforizam se prikazuje u italic + blago drugačijoj boji uz prefix "(Toma: '...')" — vizuelna razlika od prvog playthrough-a
- [ ] P3 `src/content/dialogue.js` — "prolog" monolog na intro screenu (menja se po prestige runu): run 0 = "Jutros ništa ne znaš. To je prednost."; run 1+ = "Prošle noći si napravio izbor. Toma pamti. Slavko pamti. Ti si zaboravio."
- [ ] P3 `src/content/dialogue.js` + `src/systems/prestige.js` — Toma prestige epilog (N26B) zavisi od Slavko statusa: pomiren = "Rekao je da ste vi dokaz da se može."; ogorčen = "Rekao je da si selektivan sa mirenjem."
- [ ] P3 `src/content/dialogue.js` — Slavko arc treća tačka: novi N17 varijanta dostupna samo ako je pomirenje (N3) pre podne — Slavko šalje poruku oko 14:00 sa pozivom za zajednički projekt
- [ ] P3 `src/content/dialogue.js` — Ana zatvaranje: ako je N1 outcome "helped", dodati SMS node oko N14 (14:00) gde Ana javlja je li stigla i sadi Kluboslavija hook
- [ ] P3 `src/content/dialogue.js` — "tihi svedok" node za N22 (Jova Instagram pitch): ako igrač ima i pomirenog Slavka i dobar Toma odnos, Jova dodaje "i komšije su za nas" — mala narativna nagrada za poseban playthrough

## Završeni patčevi

- [x] P1 `src/share.js` — ispraviti URL u generateScoreCard (done 2026-09-14, commit ff42382)
- [x] P1 `src/systems/prestige.js` + `src/state.js` — konsolidovati loadPrestige() na keš (done 2026-09-14, commit d7cd43e)
- [x] P2 `src/ui.js` — resource bar fill clamp dodat (done 2026-09-14, commit 0a4c68d)
- [x] P2 `src/main.js` — dead import-i renderHUD + loadAchievements uklonjeni (done 2026-09-14, commit 0a4c68d)
- [x] P2 `src/systems/decision_engine.js` — dead partitionNodes() uklonjena (done 2026-09-14, commit 0a4c68d)
- [x] P2 `src/ui.js` + `styles/ui.css` — midgame CS hint na satu 12 (done 2026-09-14, commit bd16ff2)
- [x] P2 `src/main.js` + `src/ui.js` — CS start reframe: Nered: 10 initial text (done 2026-09-14, commit bd16ff2)
- [x] P2 `src/main.js` + `src/ui.js` + `styles/ui.css` — momentum cue (done 2026-09-14, commit bd16ff2)
- [x] P3 `src/share.js` — generateScoreCard dodaje Kluboslavija hashtag u share tekst: "#KluboslavijaTurneja2026 #DanPosle" + play_url (done 2026-09-14, commit bb9db6c)
- [x] P3 `src/atmosphere.js` + `styles/atmosphere.css` + `src/main.js` — pre-ending horizon signal: na satu 18 (Sumrak), ambijentalni CSS filter počinje blagi warm shift — emocionalni signal da se dan zatvara bez teksta (done 2026-09-14, commit a2fb094)
