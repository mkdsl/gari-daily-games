# Patch Queue — Guncati Grand

## Otvoreni patčevi

### P1 — Bugovi koji oštećuju brand ili UX

- [x] P1 `src/ui/finale_ui.js` — DJ Transition crash fix: button disabled + _transitionPending cleared + timeout cancelled pre playerDJTransition() (done 2026-08-02, commit 435fc74)
- [x] P1 `src/ui/modals.js` — inline `onclick="closeModalGlobal()"` u HTML-u (linija ~31) nije CSP-kompatibilno; blokiraće se u strožem Content Security Policy okruženju i ostavlja globalnu funkciju kao imperativni API (done 2026-08-09, commit f37e72b)

### P2 — Polish koji vidno poboljšava iskustvo

- [x] P2 `src/ui/ui.js` + `src/systems/progression.js` — dupli poziv `checkVolunteerUnlocks` (jednom iz ui.js, jednom iz progression.js u advanceWeek); može prouzrokovati duple unlock notifikacije u edge case-u (done 2026-08-12, commit b218e3e)
- [ ] P2 `src/ui/ui.js` — Week 2 onboarding tekst "Ana se priključuje!" pogrešan — Ana je prisutna od startnog state-a, ne ulazi tek u nedelji 2
- [ ] P2 `src/systems/progression.js` — `applyAllocationEffects()` direktno mutira state objekat umesto da koristi setState(); čini state diff neupotrebljivim za budući undo/time-travel debug
- [ ] P2 `src/ui/score_ui.js` + `src/content/volunteers_data.js` — Dodaj "ko je izdržao" retrospektivnu karticu na ending screenu: svaki volonter sa finalnim WB statusom (zeleno/žuto/crveno) i jedan flavor fragment za one koji su burn-out doživeli — Tom Sawyer mehanika dobija emocionalni udar koji pokreće drugi run
- [ ] P2 `src/systems/wellbeing.js` + `src/ui/hud.js` — WB milestone notifikacije sa mikro-narativom: pri prvom prelasku 60% praga (Tom Sawyer unlock) prikaži jednu liniju reakcije iz volunteers_data.js; pri padu ispod 40% prikaži umor-varijantu — WB je trenutno samo broj bez emotivnog signala
- [ ] P2 `src/systems/finale.js` + `src/systems/scoring.js` — "Ključni momenti" summary posle finale-a: lista event odluka sa timestamp-om i efektom (npr. "Min 7: Kvar na PA — ostao si miran → +12 Crowd Mood") — bez ovoga nema "šta bi se desilo" unutrašnjeg dijaloga koji pokreće drugi run

### P3 — Content/feature ekspanzija

- [ ] P3 `src/systems/prestige.js` + `src/ui/score_ui.js` — Sezonski dnevnik pri ulasku u Stara Šaraga mode: 3 auto-generisane linije iz prethodnog runa (najveća budžetska kategorija, volonter sa najviše/najmanje WB, finale moment) — "Ana se vratila, pamti te" umesto samo "+15% reputacija"
- [ ] P3 `src/content/brand_hooks.js` + `src/ui/score_ui.js` — Guncati brand narrative ending: jedinstven closing fragment baziran na final score rangu (Legenda/Veteran/Početnik) koji govori o Guncati kao mestu — share card nosi poruku, ne samo score breakdown (svaki share = organik-promo za Guncati)
- [ ] P3 `src/content/events_data.js` + `src/content/brand_hooks.js` — Kluboslavija Venue Skins: tri varijante Finale event seta (Štrand, Sarajevo, Guncati Grand Finale) sa specifičnim crowd cap-om, weather profilom i branded ending tekstom za svaki venue — igra postaje pre-event companion za svaki preostali stop turneje
- [ ] P3 `src/ui/score_ui.js` + `src/share.js` — Proširiti score screen: (a) score-gated "Postani pravi volonter Guncatija" CTA sa linkom ako je score >= 7.5, (b) branded Season Report infografik (kategorije, volonteri, crowd peak, revenue peak) spreman za IG Story deljenje — direktan community-building asset za MKDSLend
- [ ] P3 `src/systems/prestige.js` + `src/content/brand_hooks.js` — Masterclass Unlock Layer: uspešan završetak svake nedelje u Stara Šaraga modu otključava edukativan fragment iz MKDSLend metodologije (Tom Sawyer organizovanje, permakultura, event logistika) — prestige run kao interaktivna brošura za masterclass-pre-event strategiju
- [ ] P3 `src/content/volunteers_data.js` + `src/ui/micro_ui.js` — Proširiti volonterske arhetipove: 3 nova volontera bazirana na stvarnim Guncati ulogama (Majstor Gradnje, Content Creator, Farmer) sa flavor tekstom koji reflektuje "Zabavni radni park" narativ
- [ ] P3 `src/content/volunteer_arcs.js` — Sezonski arkovi volontera: 3 story beats za svakog od 7 volontera vezana za WB milestone-e (motivisan start, sredinska dilema, finalni momenat) — novi fajl
- [ ] P3 `src/content/endings.js` + `src/content/brand_hooks.js` — Personalizovani epilog baziran na kombinaciji score-a i volonterskih ishoda — novi fajl endings.js
- [ ] P3 `src/content/events_data.js` — Decision callbacks koji povezuju finale event odluke kroz ceo playthrough (choice u Min 3 utiče na dostupnost opcija u Min 11) — cross-event kontinuitet
- [ ] P3 `src/content/volunteer_arcs.js` + `src/content/events_data.js` — Volonter-event preseci: specijalni event trigeri kad određeni volonter ima WB < 30% tokom finale-a (lični momenat slabosti koji igrač mora da reši)
- [ ] P3 `src/content/brand_hooks.js` — Guncati mitologija kao Legend-only unlock: 5 fragmenti o istoriji i filozofiji Guncati imanja koji se otključavaju samo na score >= WIN_LEGEND (7.5)

## Završeni patčevi

*(prazan pri release-u)*
