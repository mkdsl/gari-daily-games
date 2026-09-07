# Put do Guncata — Concept

**Naziv:** Put do Guncata
**Žanr:** Text/narrative adventure (point-and-click lite) — NOVO za GDG od Niš Fuge (01.06, 3+ meseca pauze na žanru; poslednje dve igre bile su deck-builder/crew manager i seasonal scheduling puzzle, dobar diverzitet)
**Status:** CONCEPT READY (kompletan brief prenet iz `tim/iskra/gamifikacija_ideje.md`, PRIORITET #2)
**Datum:** 2026-09-07
**Session target:** 15–20 minuta
**Prestige hook:** "Noćna vožnja" — drugi run otključava noćnu varijantu etape 2 i večernji dolazak u etapi 5
**Brand serves:** Guncati (primary), Kluboslavija (secondary)

---

## PREMISA

Igrač putuje od Beograda do Guncatija u 5 etapa. Svaka etapa je kratka narativna scena upakovana oko sopstvene mini-mehanike — nije jedna mehanika ponovljena pet puta, nego pet različitih iskustava vožnje: parkiranje, autoput, raskrsnica, šumski put, dolazak. Igrač ne igra "igru o putovanju" — igrač PROLAZI put, donosi male odluke usput, i stiže na jezero sa rezultatom koji zavisi od toga koliko je bio spreman.

Svaki run otkriva drugu stranu Guncatija (jezero, ribe, glineni zidovi, muzika) jer etapa 3 grana priču u tri različite verzije etapa 4–5.

---

## CORE GAMEPLAY LOOP

**Etapa 1 — Beograd Parkiralište (timing puzzle, ~60s):** Igrač traži parking mesto pre nego što istekne parking-meter tajmer. Dok čeka, "radio" overlay pušta Pera Period aforizam kao najavljivačku špicu — prva doza brenda, ambijentalna, ne nametljiva.

**Etapa 2 — Autoput E75 (resource balance, ~3 min):** Tri resursa u tenziji: gorivo (opada), vreme (tiktak), muzika/mood (radio stanica koju igrač menja). Random event (gužva, pojačanje, pogrešan izlaz) prekida ritam i traži brzu reakciju. Ovo je najduža etapa — nosi "vožnju" osećaj.

**Etapa 3 — Skretanje u selu (navigation choice):** Tri table, tri puta — brže / slikovitije / sigurnije. Igrač bira BEZ da zna šta ga čeka na svakom. Ovo je stub grananja: izbor ovde određuje koju verziju etape 4 i etape 5 igrač vidi. Ovde se dešava i Branin brand hook — jedna ruta prolazi pored nje dok ukratko (3 linije, ne tutorial) objašnjava akvakulturni sistem.

**Etapa 4 — Šumski put (obstacle dodge, ~90s):** Mobile-friendly tap/swipe mikro-sekcija — šarafi, blato, grane. Varijanta zavisi od etape 3 izbora (druga prepreka-šema po ruti).

**Etapa 5 — Guncati Jezero, dolazak (narativni epilog):** 3–4 varijante scene, određene kumulativnim izborima (šta je igrač poneo, koliko je gorivo potrošio, koju rutu je izabrao). Zatvara se finalnim aforizmom, specijalnim po putu koji je igrač prešao.

**Zašto ovo NIJE pet puta ista mehanika:** svaka etapa menja i input tip (tajmer-tap, resource-slider, choice-tap, swipe-dodge, pasivni narativni scroll) i vizuelni kontekst (grad → drum → selo → šuma → jezero) — igrač oseća napredovanje kroz prostor, ne repeticiju kroz sistem.

---

## HOOK — zašto 15–20 min, ne 5

Tri nezavisna mehanizma drže pažnju duže od tipične GDG "jedna mehanika, jedan run" igre:

1. **Pet različitih mikro-igara u jednom run-u.** Igrač nikad ne radi istu stvar duže od ~3 minuta — čim jedna mehanika počne da zamara (timing → resource → choice → dodge → narativ), scena se menja. Session target 15–20 min je zbir pet kratkih segmenata, ne jedan dug segment koji zahteva strpljenje.
2. **Choice grananje na etapi 3 stvara stvarnu neizvesnost.** Igrač ne zna šta bira — "brže / slikovitije / sigurnije" su labele bez garancije šta unutra znače dok se ne proba. To je razlog da run #1 ne otkrije sve; radoznalost "šta bi bilo da sam izabrao drugi put" je ugrađena, ne dodata naknadno.
3. **Prestige hook ("Noćna vožnja") menja DVE etape, ne samo kozmetiku.** Drugi run nije "isto sa drugom bojom" — noćna autoput scena i večernji dolazak menjaju mood i vizuelni kontekst, što opravdava treći, četvrti replay dok igrač ne vidi sve varijante (3 rute × 2 dan/noć × 3-4 epilog varijante).

Ukupno: jedan run je 15–20 min sam po sebi (pet etapa), a kombinatorika grananja (3 rute etapa 3–4, 3–4 epilog varijante etapa 5, prestige dan/noć varijanta) daje razlog za bar 2–3 run-a pre nego što igrač oseti da je "video sve".

---

## VIZUELNA ESTETIKA (Pera Piksel)

Letnji, topao, ilustrativan CSS. Ne fotorealistično.

**Paleta:**
```
#1e2d1a — tamna šuma (etapa 4, noćna varijanta etape 2)
#f5d87a — sunce / žito (etapa 3 selo, dnevni highway)
#3a8c5c — jezero / polja (etapa 5 dolazak, dnevna verzija)
#e8dcc8 — zemlja / put (etapa 3–4 prelaz, UI pozadina teksta)
```

**Vizuelni jezik po etapi (progresija grad → drum → selo → šuma → jezero):**
- Etapa 1 (Beograd): urban sivo-beton sa akcentom `#f5d87a` (semafor/žuti znak)
- Etapa 2 (autoput): asfalt-siva sa horizontom u `#f5d87a`, radio overlay u `#e8dcc8` okviru
- Etapa 3 (skretanje): `#f5d87a` dominantno (žito, sunce), tri table kao CSS ilustracije
- Etapa 4 (šumski put): `#1e2d1a` dominantno, prepreke kao jednostavni CSS sprite oblici
- Etapa 5 (jezero): `#3a8c5c` + `#e8dcc8`, mirna kompozicija za share card

**Karakteri:** 2–3 CSS sprite-a — Brana (etapa 3 hook), random putnik (etapa 2–3 flavor), Pera aforizmator (radio overlay lice/ikonica, etapa 1–2 i finale etape 5).

Svaka etapa ima drugačiju background color-scheme tranziciju — prelazak između etapa je vizuelno obeležen (fade/wipe), ne nagli cut, da naglasi putovanje kao progres kroz prostor.

---

## AUDIO MOOD (Ceca Čujka)

- **Etapa 1–2:** city ambience → highway hum → radio efekat (Pera Period citat izgovoren/predstavljen kao "pesma" na radio stanici, sa radio-static prelazom između numera)
- **Etapa 3–4:** šumski/seoski zvuci — živinstvo, vetar kroz žito, zemlja/koraci; postepeni prelaz iz highway hum-a u ambient prirode signalizira ulazak u "Guncati teritoriju"
- **Etapa 5:** jezero ambience (voda, ptice), tiha muzika kao Guncati Grand theme motiv — direktna audio veza ka igri na koju se linkuje (crosslink)
- **Noćna varijanta (prestige):** etapa 2 dobija noćni highway ambient (grickavi insekti, tiša saobraćajna buka, radio stanica menja ton), etapa 5 dobija večernje jezero (žabe, tišina, drugačiji miks teme)

---

## WIN CONDITION — "Pripremljenost" sistem

Svaka etapa dodaje ili oduzima "Pripremljenost" bod (0–100), akumulirano kroz ceo run na osnovu performansa (koliko brzo je nađen parking, koliko gorivo/vreme ostalo na kraju etape 2, koju rutu bira igrač na etapi 3, koliko prepreka pogođeno na etapi 4).

- **≥ 70 → zelena scena:** "Stigao si spreman. Guncati te čeka." — otključava "Odigraj Guncati Grand" crosslink prompt
- **40–69 → žuta scena:** "Stigao si. Odmori se malo."
- **< 40 → humorna scena:** "Sledećeg puta, možda mapa?"

Sve tri varijante otključavaju shareable kartu — nema fail state koji blokira share, čak i loš rezultat je deljiv (humor kao safety net, konzistentno sa GDG anti-punitive tonom).

---

## SHARE CARD

"Na sam putu ka Guncatiju. Pripremljenost: [score]%. [play_url]" — Web Share API sa canvas/html2canvas screenshot fallback-om za IG Story. Karta vizuelno koristi etapa 5 pozadinu (jezero paleta) bez obzira na score-bucket, da share uvek izgleda privlačno bez obzira na ishod.

---

## BRAND SERVES

**`brand_serves: ["guncati", "kluboslavija"]`**

**Guncati (primary) — konkretno:**
- Etapa 3 brand hook: Brana se pojavljuje uživo u priči (ne kao meta-referenca) i u tri rečenice objašnjava akvakulturni sistem — igrač dobija stvaran, nepredavački uvod u imanje pre nego što ikad fizički dođe.
- Etapa 5 dolazak vizuelno i narativno prikazuje jezero, ribe, glinene zidove — funkcioniše kao pre-event teaser koji gradi očekivanje kod nekog ko planira posetu ili masterclass.
- Igra je evergreen companion — nema sezonski expiry, može se linkovati sa bilo kog Guncati poziva (masterclass najava, "poseti nas" CTA) bilo kad tokom godine.
- Zeleni ishod (≥70 pripremljenost) direktno linkuje na "Odigraj Guncati Grand" — cross-igra funnel unutar istog brenda, ne samo tematska veza.

**Kluboslavija (secondary) — konkretno:**
- Pera Period aforizmi (radio overlay etapa 1–2, finalna linija etapa 5) su ista glasovna linija koja se koristi u Kluboslavija copy-u — igra širi taj glas van event konteksta.
- Guncati Grand crosslink posredno hrani Kluboslaviju jer Guncati Grand sam po sebi nosi Kluboslavija sekundarni brand serves (potvrđeno u prethodnom konceptu te igre) — "Put do Guncata" je jedna karika više u tom lancu koja dovodi igrače do postojeće cross-promo mreže.

---

## PRESTIGE / REPLAY HOOK

**"Noćna vožnja"** — nakon prvog kompletiranog run-a otključava se:
- Alternativna verzija etape 2 (autoput noću — drugačiji vizuelni sloj, drugačiji audio, isti mehanički skelet ali sa noćnim random event-ima — npr. magla umesto gužve)
- Alternativna verzija etape 5 (večernji dolazak na jezero — drugačija paleta, drugačiji audio miks, isti score-bucket sistem ali druga scena po bucket-u)

Kombinovano sa etapa 3 grananjem (3 rute) i etapa 5 varijantama (3–4 epiloga po score bucket-u), svaki run ima realnu šansu da pokaže nešto novo — "svaki run vredi" nije prazna fraza, nego posledica kombinatorike koja premašuje ono što jedan igrač realno vidi u 2–3 sesije.

---

## SESSION TARGET

**15–20 minuta** po run-u (5 etapa × ~3 min prosečno, sa etapom 2 kao najdužom ~3 min i etapom 1/4 kao kraćim ~60–90s segmentima, plus narativni tempo etapa 3/5 koji ne žuri).

---

## PROCENA MODULA PO KATEGORIJI

**Core (5):**
1. `src/main.js` — Bootstrap, etapa progression, wire modules, session start/restart
2. `src/config.js` — etapa konfiguracije, pripremljenost pragovi, tajmeri, share template
3. `src/state.js` — pripremljenost score, resursi (gorivo/vreme), istorija izbora, save/load, prestige flag
4. `src/input.js` — unified tap/swipe/drag handling (Pointer Events: timing, dodge, choice)
5. `src/router.js` — etapa/scene router, linearno napredovanje + grananje (etapa 3 → etapa 4/5 varijanta)

**Entities (6):**
6. `src/entities/scenes/etapa1-parking.js`
7. `src/entities/scenes/etapa2-autoput.js`
8. `src/entities/scenes/etapa3-skretanje.js`
9. `src/entities/scenes/etapa4-sumski-put.js`
10. `src/entities/scenes/etapa5-dolazak.js`
11. `src/entities/characters.js` — Brana, random putnik, Pera aforizmator CSS sprite-ovi

**Systems (7):**
12. `src/systems/timing-puzzle.js` — etapa 1 parking tajmer (60s)
13. `src/systems/resource-balance.js` — etapa 2 gorivo decay, clock, radio mood shift, random event
14. `src/systems/branching.js` — etapa 3 choice tracking, određuje etapa 4/5 varijantu
15. `src/systems/obstacle-dodge.js` — etapa 4 90s mikro-sekcija (šarafi/blato/grane), ruta-zavisna šema
16. `src/systems/pripremljenost.js` — score add/subtract po etapi, threshold evaluacija (zelena/žuta/humor)
17. `src/systems/prestige.js` — "Noćna vožnja" unlock tracking, noćna etapa2 + večernja etapa5 loader
18. `src/systems/radio.js` — Pera Period aforizam rotacija kao "radio" overlay (etapa 1–2)

**UI (5):**
19. `src/ui.js` — HUD (pripremljenost meter, etapa progress indikator)
20. `src/ui/scene-overlay.js` — narativni text overlay, dialogue box
21. `src/ui/choice-prompt.js` — etapa 3 tri-table choice UI
22. `src/ui/share-card.js` — share card render (canvas/html2canvas kompozicija) + Web Share API poziv
23. `src/ui/end-screen.js` — epilog varijanta prikaz + "Odigraj Guncati Grand" crosslink prompt

**Content (4):**
24. `src/content/dialogues.js` — narativni tekst po etapi (5 etapa × varijante)
25. `src/content/aforizmi.js` — Pera Period aforizam pool (radio overlay + etapa 5 finale, po ruti)
26. `src/content/brand_hooks.js` — Branine akvakulturne linije (etapa 3), Guncati Grand crosslink copy
27. `src/content/branching-tree.js` — etapa3→4→5 grananje definicije i tekst varijante po ruti

**Audio (1):**
28. `src/audio.js` — Web Audio API: city/highway/radio/šuma/jezero ambient + noćna/večernja varijanta

**Styles (4):**
29. `styles/base.css` — layout, mobile-first, scene container
30. `styles/game.css` — etapa background color-scheme tranzicije (fade/wipe), sprite stilovi
31. `styles/ui.css` — HUD, choice prompt, dialogue box, share card
32. `styles/theme.css` — paleta varijable, etapa-po-etapa color-scheme mapiranje, dan/noć varijante

**UKUPNO: 5 + 6 + 7 + 5 + 4 + 1 + 4 = 32 modula** ✅ (≥ 25 potvrđeno; u skladu sa originalnom procenom 22–28, na gornjoj granici jer 5-etapa grananje + prestige dan/noć varijanta realno zahteva odvojene module po etapi umesto jedne generičke "scene" klase)
