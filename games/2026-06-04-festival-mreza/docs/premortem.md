# Premortem: Festival Mreža

**Agent:** Nega Negovanović  
**Datum:** 2026-06-04  
**Iteracija:** 1

---

## VERDICT

**DRŽI UZ KOREKCIJE**

Concept je strukturno solidan i brand-utility za Kluboslaviju je ovde stvarna, ne dekorativna. Ali ima tri implementaciona showstoppera koji moraju biti razrešeni pre nego što Mile krene u GDD — i svi su predvidivi, svi su sprečivi sada, a svi su ubojiti ako se ignorišu.

---

## 1. SHOWSTOPPER RIZICI (max 3)

### SHOWSTOPPER 1 — Real-time mikro layer je drugi engine unutar igre

Concept traži da mikro sesija bude "real-time, 3–5 minuta, crowd grupe, zona routing, DJ tempo slider, particle sistem za crowd." To nije mini-igra unutar strategy sim-a — to je kompletan event management sim sa vlastitim game loop-om, Canvas renderingom, entity sistemom za crowd grupe i routing logikom. Jova mora da napiše dva odvojena game loop-a koji komuniciraju kroz zajednički state: jedan za makro (turn-based, UI-driven) i jedan za mikro (real-time, Canvas).

**Konkretan rizik:** Impl sesija se zaglavlja u mikro layer-u i makro nikad ne dobija pažnju. Ili obrnuto — makro bude solid, mikro layer bude stub sa fake animacijom bez prave routing mehanike, Beta Trio vidi "crowd management koji ništa ne radi" i zasuje sa CRITICAL-ima.

Dodatno: drag-and-drop zona routing na touchscreen-u bez framework-a je notorno teško dobro napraviti. Concept kaže "mobile + desktop" a drag interaction je na mobilnom košmar. Ako se ovo ne reši u concept fazi, Jova improvizuje i improvizacija u input handling-u ubija mobile playability.

**Preporuka za Iskru/Mile:** Eksplicitno zaključati mikro layer MVP. Crowd routing = zona-redirect buttons (ne drag-and-drop). Particle sistem = vizuelna metafora (colored tačkice koje pulsiraju), ne physics simulation svake tačke. Incident response = turn-based modal, ne real-time interrupt. Ovo je scope cap koji sprečava impl sesiju da se utopi.

---

### SHOWSTOPPER 2 — State schema ne postoji; tri sloja bez granice je CRITICAL bug u inkubatoru

Igra ima makro state (budžet, reputacija, veze, koordinatori — persist kroz 5 rundi) + mikro state (crowd, zone, BPM, incident — ephemeral po eventu) + meta state (karijer tier, prestige multiplikatori, alumni). Tri paralelna state sloja bez jasne granice ko šta čita i kada.

Concept kaže "auto-save posle svakog eventa" ali ne definiše šta se save-uje. Ako Jova ne dobije jasan state shape od Mileta, implementiraće nešto što radi na happy path i pada na edge case-evima: browser refresh između makro i mikro faze, prestige tokom aktivne turneje, coordinator angažman posle bankrota.

**Konkretan rizik:** Igrač završi Sarajevo event, osvježi browser, starta Štrand sa 0 budžetom jer carry-over nije serializovan. To je CRITICAL bug u beta testu koji Jova ne može brzo da fiksuje jer state je rasut po 10 modula.

Buzz × 0.7 carry-over, coordinator retencija 60%/90%, reputacija → venue tier — sve su međuzavisne varijable koje se propagiraju kroz 5 makro rundi. localStorage save u kompleksnom multi-round state-u sa cross-round dependency-ima je poznat izvor korupcije.

**Preporuka za Mile:** GDD mora sadržati eksplicitnu state shape tabelu kao PRVI deliverable — pre progression kriva, pre upgrade tabela. Koja polja žive u `macro_state`, koja u `micro_state`, koja u `meta_state`, koji od ova tri se serialozuju u localStorage i kojim ključevima, koji se resetuju na prestige. Jova ne krece da kodira dok ova tabela ne postoji.

---

### SHOWSTOPPER 3 — Audio API granica između Cece i Jove nije definisana

Concept predviđa adaptive audio koji "gradi se od 90 BPM prema 138 BPM dok event napreduje" i reaguje na DJ slider vrednost. Ceca to može implementirati. Ali: ko zove `audio.setTempo(bpm)`? Ko triggeruje "peak phase" audio event? Ko šalje signal kad incident nastane?

Concept ne definiše interfejs između audio modula i gameplay logike. Ako Jova i Ceca rade paralelno (što pipeline predviđa u 4c i 4e), završiće sa dve implementacije koje se ne slažu — Jova pretpostavlja da Ceca eksponira jedan API, Ceca pretpostavlja da Jova šalje drugi format.

**Konkretan rizik:** Audio radi izolovano (demo mode: pulsira u pozadini ali ne reaguje na gameplay). Ili Jova hardcode-uje `audio.setTempo(90)` na startu i ne menja ga nikad jer DJ slider nema definisanog slušaoca.

**Preporuka za Mile:** GDD mora definisati audio event API kao deo systems dizajna — lista event-a koje gameplay sistem emituje prema audio modulu: `onEventStart(cityId)`, `onBPMChange(value)`, `onPeakPhase()`, `onIncident(severity)`, `onEventEnd(satisfaction)`. Ceca implementira handlere. Jova samo emituje event-e iz gameplay sistema. Bez ovoga, audio integracija je manual merge na kraju impl sesije — i grešiće.

---

## 2. SCOPE RIZICI

Ovo je definitvno **3-session igra na gornjoj granici kapaciteta.** Konkretna procena po sesiji:

- **Concept sesija (03:00):** Završena.
- **Impl sesija (09:00):** VISOKI RIZIK. Dva odvojena game loop-a (makro turn-based + mikro real-time), kompleksan state sistem sa tri sloja, 28+ upgrades, 5 koordinatora sa unique statovima i dijalozima, particle sistem, adaptive audio. Ako Jova krene sa mikro layerom, makro ostaje stub. Ako krene sa makrom, mikro bude thin. Sesija može završiti sa jednim layerom solidnim i jednim broken.
- **Polish sesija (17:00):** Ako impl sesija preda obadva layer-a na 70%, polish mora da fiksuje fundamentalne gameplay probleme umesto da polira. To je recept za FAILED_STAGE.

**Gde se konkretno zaglavljuje:**

1. Mikro routing logika — čak i simplifikovana zona-redirect, potreban je routing state, crowd capacity tracking po zoni, feedback per zone
2. Koordinator dijalog sistem — čak i "micro-dijalog" znači dialog box sistem, portrait render, trigger logic po mestu u turneji
3. Share karta — "personalizovana Mreža karta" zahteva html2canvas da snapshot-uje specifičan Canvas state, što je tricky sa multi-Canvas arhitekturom (makro network graf + mikro venue su dva odvojena Canvas-a)
4. Content: 28 upgrades × 3 kategorije = ~84 balance stavke koje Mile piše, Jova implementira, Pera Period tekstualno popunjava

**Preporuka:** Smanjiti na 20 upgrades (ostaje iznad hardcheck praga od 20), 3 koordinatora za baznu igru + 2 unlockable posle prestige-a. Content scope se prepolovi, gameplay kvalitet ostaje isti. Jova treba eksplicitni raspored 4a–4f koji kaže šta je MVP i šta je "ako stigne."

---

## 3. BRAND-UTILITY KRITIKA

### Kluboslavija sprega: STVARNA i timing-smart, ali conditionally

**Što radi:**
Insajderska priča hook je autentičan. Igrač koji prođe 5 gradova pre Avale zaista oseća da razume logiku turneje — zašto gradovi idu tim redom, šta znači buzz rezervoar, kako reputacija utiče na venue. To je edukativni hook koji se ne može falsifikovati — direktno mapira na pravi Kluboslavija redosled. Ovo je najjača stvar u celom concept-u.

Share karta posle Avala eventa je konkretan share moment. AKO karta vizuelno izgleda impresivno (pixel art network graf sa named koordinatorima i final scores) I AKO share API radi na mobilnom, ovo je funkcionalan brand asset, ne dekoracija. Jova + Pera Piksel moraju tretirati ovu kartu kao first-class deliverable, ne afterthought.

Timing: igra izlazi 4. juna, Avala je 20. juna — 16 dana je pravi window za CTA. Ovo je timing-sensitive utility. Ako igra zakasni i dođe 18. juna, brand-utility se prepolovi. Postoji pritisak da impl sesija ne premaši token budžet.

**Što je conditionally decorativno:**
Sprega funkcioniše samo ako igrač stigne do Avala eventa. 45–60 minuta je investicija koju casual igrač (Kluboslavija target demografija) neće dati igri na GitHub Pages-u bez onboardinga. Ako makro planning faza bude zbunjujuća bez tutorial-a, igrač odlazi u Nišu i nikad ne vidi brand message.

**Obavezno:** Niš event mora biti tutorial event — limitovane opcije, guided prompts, bez lose state. Mile ovo mora ugraditi u GDD.

### MKDSLend sprega: DEKORATIVNA u trenutnom stanju

"Koordinatori uključuju MKDSLend tim karaktere" — ovo je name-dropping, ne utility. Igrač koji ne prati MKDSLend ne dobija ništa. Igrač koji prati — dobija easter egg. Easter egg nije brand-utility.

"Guncati čvor na turneji mapi je grand finale (posle Avale, unlockable)" — skrivena za 80%+ igrača. Seeding koji ne vide većina igrača nije seeding.

"Zabavni radni park estetika komunicira sa MKDSLend brand identity" — vaga i nedokaziva tvrdnja. Glass-morphism noćni UI ne govori "Zabavni radni park" nikomu.

**Preporuka:** Ili konkretizuj (jedan koordinator karakter koji je EKSPLICITNO Guncati/MKDSLend persona sa brand-specifičnom mehanikom — npr. Brana Barakonja koji donosi Guncati bonus rundi i ima explicit Guncati dijalog), ili skloni MKDSLend iz `brand_serves` liste. Guncati čvor mora biti vidljiv od početka kao locked teaser sa "Otvara se posle Avale" tooltipom — aktivan brand seed, ne skriveni bonus. Lažna brand utility je gora od nijedne.

---

## 4. MEHANIKA SLABOSTI

### DJ tempo slider bez feedback loop-a je magic knob

"DJ arc 90→138 BPM" zvuči dobro na papiru. U igri: igrač pomera slider, crowd se malo brže ili sporije kreće, muzika pravi iste oscilatore brže. Bez jasnog i instant vizuelnog + audio feedback-a, slider postaje magic knob koji igrač nasumično vrti. Ovo je najčešći uzrok "ne razumem šta radim" u event management igrama.

Bez eksplicitnog feedback layer-a (floor temperature indicator, crowd energy bar koji se menja u real-time, vizuelni termometar koji postaje crvenkast kad je BPM previsok za current crowd mood), mikro layer je guessing game. Mile mora ovo ugraditi u GDD kao obavezni UI element — nije UI opcija, to je gameplay čitljivost.

### Carry-over sistem je mehanički solidan ali emocionalno prazan

Buzz × 0.7 kao statički multiplikator rešava progression matematiku ali ne daje igraču osećaj uzročno-posledične veze. "Završio sam Niš sa buzz 85, Sarajevo startuje sa 59.5" — ovo je broj, ne priča. Two Point Hospital i Game Dev Tycoon rade carry-over kroz vizuelne i narrativne queues.

**Preporuka za Mile:** Carry-over mora imati vizuelni/narrativni echo. U Sarajevo macro screen pojavljuju se "Gosti iz Niša" kao poseban crowd tip koji ima predeset mood score zbog buzz-a iz prethodnog grada. Matematika ista, igrač vidi uzrok.

### Koordinator sistem kao micromanagement hell

28 upgrades + koordinatori sa unique statovima i loyalty tier-ima + decay krive + retencija logika — u makro fazi. Ako nije pažljivo ograničeno cognitive budget-om, makro sesija postaje spreadsheet simulator u negativnom smislu. Iskrin hook "tenzija, resursi su uvek prekratki" može prerasti u analiza-paraliza.

**Preporuka za Mile:** Definisati "cognitive budget" po makro rundi — maksimalan broj meaningful decision-a po gradu (predlog: 3–5, ne 12+). Sve ostalo vizualno sažimati ili automatizovati.

### Lose state "moralno poražavajuće" nije dizajn, to je marketing copy

"Avala event tier downgrade na micro event — moralno poražavajuće, igra komentariše" — ovo je opis vibes-a, ne mehanike. Šta igrač konkretno radi posle tog downgrade-a? Nastavlja igru? Dobija game over? Može da se bori da vrati tier? Mile treba preciznu lose state mehaniku, ne vibe opis.

### Performance na mid-range mobilnom je nevalidovana pretpostavka

Concept ne pominje performance budžet. Real-time Canvas rendering (mikro layer) + Web Audio API adaptive + particle sistem — sve istovremeno — je CPU-heavy na mobilnom. Balkanska publika je mix uređaja. Ako particli usporavaju na iPhone 11 ili mid-range Android i routing postaje laggy, mikro layer je broken na target uređajima.

**Preporuka za Mile/Jovu:** GDD mora sadržati eksplicitan performance cap: max broj aktivnih particli (predlog: 200 na desktop, 80 na mobile), detekcija `navigator.hardwareConcurrency` za reduced particle mode, crowd grupe kao DOM elementi fallback opcija ako Canvas drag/render postane problematičan.

---

## 5. PREPORUKE ZA KOREKCIJE

Concept ne mora biti rewritten. Targeted korekcije, po prioritetu:

1. **Iskra (concept.md revision):** Definiši MVP mikro layer — "v1 core" vs "v2 nice-to-have" za svaki element. Incident response = turn-based modal u v1. Crowd routing = zona-redirect buttons, ne drag. Ovo mora biti u concept-u pre nego što Mile krene da piše GDD.

2. **Mile (GDD obavezni deliverables):**
   - State shape tabela (macro/micro/meta — koji se save-uju, koji se resetuju) — PRVI deliverable, pre svega
   - Audio event API lista (`onEventStart`, `onBPMChange(value)`, `onPeakPhase`, `onIncident(severity)`, `onEventEnd`)
   - DJ arc feedback layer spec (floor termometar, crowd warm/cold indikatoru) — obavezan UI element
   - Sve upgrades sa tačnim brojevima — predlog 20, ne 28
   - Coordinators: 3 base + 2 unlockable — ne 5 base
   - Cognitive budget po makro rundi (max decision-a)
   - Performance cap (max particli, mobile detection flag)
   - Carry-over vizuelni echo mehanizam ("Gosti iz Niša" crowd tip)
   - Niš = tutorial event (limitovane opcije, no lose state)

3. **Iskra (brand_serves):** Ili pojačaj MKDSLend (Brana Barakonja kao eksplicitan koordinator sa Guncati mehanikom i dijalogom), ili ga skloni iz `brand_serves`. Guncati čvor mora biti vidljiv locked teaser od starta, ne skriveni unlockable.

4. **Jova (impl brief):** Mikro layer MVP je prioritet 1 — Canvas + routing buttons + satisfaction bar + BPM slider sa feedback termometrom. Prestige sistem i challenge modes idu u "ako stigne" kategoriju, ne u must-have za beta.

---

## 6. ŠTA JE ZAISTA JAKO — NE DIRAJTE OVO

Mile i Jova, ovo je dobro — ne menjajte:

**Carry-over × 0.7 matematika** je elegantna i dovoljno jednostavna da igrač intuitvno shvati uzrok-posledica. Ne komplikujte formulu — samo dodajte vizuelni echo (gore navedeno).

**5 gradova kao struktura** je savršena. Dovoljno kratko da ne postane repetitivno, dovoljno dugo da carry-over ima smisao i da igrač oseti rast.

**Proceduralni crowd seed (datum + karijer tier)** je pametan replay hook koji ne košta mnogo implementacionog rada ali daje igraču opravdanje za "još jedan run." Ostaviti — samo osigurati da seed algoritam bude konfigurabilna konstanta u `src/config.js`, ne hardcoded.

**Coordinator alumni sistem** (2 koordinatora po 50% ceni u sledećem run-u) je emotivni hook koji daje vrednost prestige-u mimo multiplikatora. Ovo je razlog zašto igrač želi drugi run. Ne dirajte.

**Share karta po završetku Avala eventa** je najjača sprega u celom concept-u. Mora raditi na beta-u — ne "ako stigne." `src/share.js` je first-class deliverable.

**Network graph vizuelizacija turneje** kao main UI element je vizuelno jak i direktno komunicira sa Kluboslavija identitetom. Pera Piksel treba da tretira ovu mapu kao hero element, ne sidebar widget.

**Adaptive audio BPM arc** (90→138 BPM tokom mikro sesije) je autentičan game feel moment koji prosečan igrač neće naći u HTML5 igrama. Ceci dati eksplicitne BPM waypointe (90 na startu, 115 na 50% eventi, 138 na peak, decay na outro) kao hard spec — ne slobodna interpretacija.

**Eksponencijalne krive za coordinator cost i venue capacity** koje Iskra preporučuje su ispravne. Mile neka prati te formule, ne improvizuje nove.

---

## SUMMARY

Festival Mreža drži uz korekcije: brand-utility za Kluboslaviju je autentična i timing-smart (16 dana do Avale), multi-layer arhitektura je legitimna, shareable karta je konkretan deliverable. Pada na tri predvidiva mesta: mikro layer je nenabijen za jednu impl sesiju bez MVP definicije (fix: zona-redirect buttons, ne drag; incident response modal, ne real-time), state management ima tri sloja bez schema tabele što je CRITICAL bug u inkubatoru (fix: Mile piše state shape tabelu pre svega ostalog), i audio API granica između Cece i Jove nije definisana što vodi ka izolovanom audio modulu koji ne reaguje na gameplay (fix: Mile definiše audio event API u GDD-u). Sve tri korekcije su u domenu Mile/GDD brief-a i Iskra/concept MVP clarification — ne zahtevaju redesign, zahtevaju preciznost.

**Verdict: DRŽI UZ KOREKCIJE — 3 targeted izmene pre nego što Mile može da piše GDD, sve rešive unutar concept sesije.**
