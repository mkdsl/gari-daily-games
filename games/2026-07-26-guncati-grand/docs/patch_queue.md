# Patch Queue — Guncati Grand

## Otvoreni patčevi

### P1 — Bugovi koji oštećuju brand ili UX

- [x] P1 `src/content/brand_hooks.js` + `src/ui/score_ui.js` + `styles/ui.css` — date-aware Guncati Grand Finale CTA: od 08-20 do 08-30, ending screen prikazuje event-specific poziv ("Igrao si simulaciju — 23.8. dolazi stvarnost. Guncati Grand Finale · prijave: guncati.rs"); čisti JS `new Date()` check, self-destructs posle 08-31 (done 2026-08-20, commit dfc7b09)

- [x] P1 `src/ui/finale_ui.js` — DJ Transition crash fix: button disabled + _transitionPending cleared + timeout cancelled pre playerDJTransition() (done 2026-08-02, commit 435fc74)
- [x] P1 `src/ui/modals.js` — inline `onclick="closeModalGlobal()"` u HTML-u (linija ~31) nije CSP-kompatibilno; blokiraće se u strožem Content Security Policy okruženju i ostavlja globalnu funkciju kao imperativni API (done 2026-08-09, commit f37e72b)

### P2 — Polish koji vidno poboljšava iskustvo

- [x] P2 `src/ui/ui.js` + `src/systems/progression.js` — dupli poziv `checkVolunteerUnlocks` (jednom iz ui.js, jednom iz progression.js u advanceWeek); može prouzrokovati duple unlock notifikacije u edge case-u (done 2026-08-12, commit b218e3e)
- [x] P2 `src/ui/ui.js` + `src/ui/modals.js` + `src/ui/micro_ui.js` — Week 2 onboarding tekst "Ana se priključuje!" pogrešan — ispravljen u modals.js (naslov → "Micro Faza — raspoređuj Anu!", opis → "tu od Nedelje 1") i micro_ui.js (prazan-volonteri fallback) (done 2026-08-19, commit e677921)
- [x] P2 `src/systems/progression.js` + `src/systems/economy.js` — `applyAllocationEffects()` refaktoran da vraća `{seasonMarketingSpent, seasonCrowdCap}` umesto da mutira; progression.js koristi temp state za crowd calcs i dodaje `seasonMarketingSpent` u setState() (done 2026-08-22, commit 1c67e79)
- [x] P2 `src/ui/score_ui.js` + `src/content/volunteers_data.js` — Dodaj "ko je izdržao" retrospektivnu karticu na ending screenu: svaki volonter sa finalnim WB statusom (zeleno/žuto/crveno) i jedan flavor fragment za one koji su burn-out doživeli — Tom Sawyer mehanika dobija emocionalni udar koji pokreće drugi run (done 2026-08-23, commit eb7060c)
- [x] P2 `src/systems/wellbeing.js` + `src/ui/hud.js` — WB milestone notifikacije sa mikro-narativom: pri prvom prelasku 60% praga (Tom Sawyer unlock) prikaži jednu liniju reakcije iz volunteers_data.js; pri padu ispod 40% prikaži umor-varijantu — WB je trenutno samo broj bez emotivnog signala (done 2026-09-02, commit 7ca0225)
- [x] P2 `src/systems/finale.js` + `src/ui/ui.js` + `src/ui/score_ui.js` (+ `styles/ui.css`) — "Ključni momenti" summary posle finale-a: lista event odluka sa timestamp-om i efektom. Šef eksplicitno odobrio mini-impl scope 2026-09-03 ("neka ide"). Implementirano kao 3 JS fajla (scoring.js nije trebao — prikazni feature, ne feed-uje score formulu): `resolveFinaleEvent()` sada pushuje igračevu odluku u `_eventLog`, `onFinaleEnd` u ui.js persistuje `eventLog` u state, `buildKeyMomentsHTML()` u score_ui.js renderuje sekciju (done 2026-09-03, commit PENDING)

### P3 — Content/feature ekspanzija

- [x] P3 `src/systems/prestige.js` + `src/ui/score_ui.js` — Sezonski dnevnik pri ulasku u Stara Šaraga mode: 3 auto-generisane linije iz prethodnog runa (najveća budžetska kategorija, volonter sa najviše/najmanje WB, finale moment) — "Ana se vratila, pamti te" umesto samo "+15% reputacija" (done 2026-09-02, commit 79f67fa)
- [x] P3 `src/content/brand_hooks.js` + `src/ui/score_ui.js` — Guncati brand narrative ending: jedinstven closing fragment baziran na final score rangu (Legenda/Veteran/Početnik) koji govori o Guncati kao mestu — share card nosi poruku, ne samo score breakdown (svaki share = organik-promo za Guncati) (done 2026-09-03, commit bce7131)
- [x] P3 `src/content/events_data.js` + `src/content/brand_hooks.js` — Kluboslavija Venue Skins: tri varijante Finale event seta (Štrand, Sarajevo, Guncati Grand Finale) sa specifičnim crowd cap-om, weather profilom i branded ending tekstom za svaki venue — igra postaje pre-event companion za svaki preostali stop turneje (done 2026-09-03, commit c6c8ab0)
- [x] P3 `src/ui/score_ui.js` + `src/share.js` — Proširiti score screen: (a) score-gated "Postani pravi volonter Guncatija" CTA sa linkom ako je score >= 7.5, (b) branded Season Report infografik (kategorije, volonteri, crowd peak, revenue peak) spreman za IG Story deljenje — direktan community-building asset za MKDSLend (done 2026-09-03, commit 4ab4c88)
- [x] P3 `src/systems/prestige.js` + `src/content/brand_hooks.js` — Masterclass Unlock Layer: uspešan završetak svake nedelje u Stara Šaraga modu otključava edukativan fragment iz MKDSLend metodologije (Tom Sawyer organizovanje, permakultura, event logistika) — prestige run kao interaktivna brošura za masterclass-pre-event strategiju (done 2026-09-03, commit f996ab8)
- [x] P3 `src/content/volunteers_data.js` + `src/ui/micro_ui.js` — Proširiti volonterske arhetipove: 3 nova volontera bazirana na stvarnim Guncati ulogama (Majstor Gradnje, Content Creator, Farmer) sa flavor tekstom koji reflektuje "Zabavni radni park" narativ (done 2026-09-03, commit 57d7f4b)
- [x] P3 `src/content/volunteer_arcs.js` — Sezonski arkovi volontera: 3 story beats za svakog od 7 volontera vezana za WB milestone-e (motivisan start, sredinska dilema, finalni momenat) — novi fajl (done 2026-09-03, commit 78b1889)
- [x] P3 `src/content/endings.js` + `src/content/brand_hooks.js` — Personalizovani epilog baziran na kombinaciji score-a i volonterskih ishoda — novi fajl endings.js (done 2026-09-03, commit a847bb3)
- [x] P3 `src/content/events_data.js` — Decision callbacks koji povezuju finale event odluke kroz ceo playthrough (choice u Min 3 utiče na dostupnost opcija u Min 11) — cross-event kontinuitet (done 2026-09-03, commit 7ad001a)
- [x] P3 `src/content/volunteer_arcs.js` + `src/content/events_data.js` — Volonter-event preseci: specijalni event trigeri kad određeni volonter ima WB < 30% tokom finale-a (lični momenat slabosti koji igrač mora da reši) (done 2026-09-03, commit 3a272ba)
- [x] P3 `src/content/brand_hooks.js` — Guncati mitologija kao Legend-only unlock: 5 fragmenti o istoriji i filozofiji Guncati imanja koji se otključavaju samo na score >= WIN_LEGEND (7.5) (done 2026-09-03, commit e4bd3f3)

## Završeni patčevi

*(prazan pri release-u)*
