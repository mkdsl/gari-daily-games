# Beta Report — Fermenter: Varenički Bunt
**Datum testa:** 2026-05-03
**Verzija:** 1.0.0-beta

---

## Ocena: 5.5/10

Igra ima solidnu arhitekturu i lepu estetiku, ali pati od jednog game-breaking UX buga koji efektivno blokira igrača u prvim minutama. Audio ne radi na Chrome-u iz dizajnerske greške. Ostatak je igriva idle igra sa jasnim prestiže hookom.

---

## Raša — Tehnički nalaz

### Kritični bugovi (game-breaking)

**Bug 1 — Upgrade dugmad ostaju zaključana i pored dovoljno SJ**

`renderUpgradePanel` se poziva samo jednom na init i posle **uspešne kupovine**. `updateHUD` (svakih 100ms) osvežava HUD brojeve ali ne poziva `renderUpgradePanel`. Rezultat: disabled stanje dugmadi (affordability) se NIKAD ne ažurira automatski dok igrač sakuplja SJ pasivno.

Scenario koji lomi igru: igrač otvori igru, čeka da pasivni FJ/s napuni SJ na 10+, pogleda panel — sva dugmad su i dalje siva (`disabled`). Nema načina da ih aktivira osim slučajnog klika koji JavaScript blokira (`disabled` attr). Igra izgleda kao da ne radi. Igrač zatvori tab.

Lokacija: `src/main.js:159` (`updateHUD` se zove bez `renderUpgradePanel`) + `src/main.js:235` (`renderUpgradePanel` samo u `handleUpgradeBuy` na uslov `newLevel > prevLevel`).

Preporuka: u `updateHUD` ili u UI throttle bloku (svaki 100ms) dodati `renderUpgradePanel(state, handleUpgradeBuy)`. Ili efikasnije — u `renderUpgradePanel` ne replace-ovati innerHTML nego samo ažurirati klase i disabled stanje postojećih dugmadi.

---

### Srednji bugovi (UX problem, zaobilazno)

**Bug 2 — Audio ne radi na Chrome (AudioContext policy)**

`initAudio()` se poziva na `DOMContentLoaded` (main.js:79, pre bilo kakvog korisničkog gesta). Chrome kreira AudioContext u **suspended** stanju. Nakon toga, `setFermentRate()` se poziva svaki frame (main.js:117) i pokušava da pokrene ambient hum — ali suspendovani context tiho odbacuje sve pozive. `initAudio()` ima logiku za resume samo ako `audioCtx !== null` (audio.js:44), ali ta grana se ne pogađa jer se `initAudio()` poziva samo jednom.

Efekt: nema klik zvuka, nema huma, nema prestiže swepa. Degradation warning nikad ne svira. Igra je tiha.

Lokacija: `src/audio.js:57` (kreacija AudioContext bez resume-a) + `src/main.js:79` (poziv pre user gesture).

Preporuka: u `handleBarrelClick` (ili u prvom klik handleru) dodati `audioCtx.resume()` poziv. Ili proveriti `audioCtx.state === 'suspended'` na svakom audio pozivu i resume-ovati tamo.

---

**Bug 3 — M2 Etanol-Rezistentan mutacija nema implementaciju u kodu**

Mutacija M2 (`effectType: 'ethanolResist'`) opisuje da fermentRate ne opada na visokim SJ nivoima. Međutim, nigde u `computeDerivedStats`, `tickFermentation` ili `checkDegradation` ne postoji logika koja proverava `activeMutations.includes('M2')`. Mutacija se dodaje u `activeMutations` listu, prikazuje se kao badge, ali **nema nikakav efekat na gameplay**.

Lokacija: `src/systems/mutations.js:56` (switch nema 'M2' case) + `src/state.js:computeDerivedStats` (nema M2 grana).

Napomena: Originalni opis govori o "SJ nivoima koji utiču na fermentRate" — ali ni baza nigde ne implementira takav mehanizam koji bi M2 trebalo da override-uje. M2 je deklarisana ali "mrtva".

Preporuka: Ili implementirati M2 efekat (npr. `fermentRate` ne pada ispod 80% kad je `sj > SJ_CAPACITY * 0.8`), ili zameniti M2 nečim implementiranim.

---

### Manji bugovi / Napomene

**M1 Termofilni Kvasac — hardkodiran dt**

`tickThermoMutation` koristi `const approxDt = 1 / 60` umesto stvarnog delta time-a (main.js:357). Na ekranima sa 120Hz refresh rate-om, stack će se duplirati duplo brže nego što dizajn kaže. Na sporim uređajima (30fps), stack raste prepolovljenom brzinom. Nije game-breaking ali narušava balance.

Lokacija: `src/main.js:357`.

**`checkDegradation` poziva `computeDerivedStats` svaki frame**

`checkDegradation` bezuslovno poziva `computeDerivedStats` svaki frame (fermentation.js:106), uključujući i else-granu kad nema degradacije. Duplirani poziv — `tickFermentation` ga ne poziva, ali `computeDerivedStats` je inače skupa operacija (više `find()` poziva u petlji). Na slabim uređajima može biti primetno.

Lokacija: `src/systems/fermentation.js:106`.

**`termal_regulator` effectValue nije konzistentno**

CONFIG definiše `effectValue: 0.03` za termal_regulator, ali `checkDegradation` koristi hardkodovano `0.006` po nivou (fermentation.js:88). `effectValue` se nikad ne čita za ovaj upgrade. Opis kaže "0.95→0.98" (Δ 0.03 na 5 nivoa = 0.006/nivo), što je matematički tačno, ali redundantno — `effectValue` je lažno dokumentovan.

---

## Zora — UX nalaz

### Problemi

**Onboarding: nema nikakve instrukcije šta treba kliknuti**

Igra starta direktno na bure bez ikakvog tutoriala, tooltipa, ili animovanog "klikni me" signal-a. Bure ima `role="button"` i `aria-label`, ali vizuelno — da igrač ne zna žanr — nije odmah jasno da je bure klikabilno. Hover efekat (glow) postoji i pomaže, ali na mobilnom nema hover-a.

Preporuka: jedan animirani indikator (npr. pulsirajuća strelica nadole ili trepćući tekst "KLIKNI") koji nestaje posle prvog klika.

**Mutation modal: nema close/skip dugmeta**

`showMutationModal` nema ESC handler niti "Preskoci" opciju (ui.js:247-285). Igrač je prinuđen da bira jednu od 3 mutacije — nema izlaza. Ako igrač slučajno klikne prestiže dugme, zarobljen je u modalu.

Preporuka: dodati suptilno "PRESKOČI" dugme ispod kartica (koje poziva `executePrestige(null)`).

**Upgrade panel opis: skraćen text na malim ekranima**

`.upgrade-desc` ima `white-space: nowrap; overflow: hidden; text-overflow: ellipsis` (ui.css:89-92). Na mobilnom (320px širina) opisi poput "+2.0 FJ/s + auto-klik/3s" se seku. Player ne vidi pun benefit.

### Pohvale

**Degradacija vizual je odlična.** Bure gubi zasićenost (`filter: saturate(0.3) brightness(0.7)`) — odmah jasno komunicira problem bez teksta.

**Pressure bar je dominantan i čitljiv.** Pulsiranje na >=80% (`pressurePulse` animacija) daje dobar signal da je prestiže blizu.

**LCD HUD estetika** (zeleni tekst na crnom, monospace font) je konzistentna i thematski adekvatna.

**Mutation badge tooltips** (`title` atribut) daju info o aktivnim mutacijama.

**Mobile layout** je promišljen — bure se smanjuje na 140×140px na uskim ekranima (base.css:234-238), što je iznad 100×100 minimuma za touch targets.

---

## Lela — Engagement nalaz

### Problemi

**First 30 seconds: igrač ne zna da pritisne bure**

Zbog buga sa upgrade panelom (dugmad ostaju disabled), igrač vidi locked UI i ne dobija pozitivan feedback. Čak i kad pasivni income počne, ništa se ne promeni vizuelno u panelu. Kombinacija: nema tutoriala + frozen UI = igrač misli da igra ne radi.

**Session arc: prva prestiže je ~3.7 min uz aktivno igranje, ali passively neigriva**

Matematika pali — sa 0.2 FJ/s bazom i Pressure Rate Factor od 0.015, `pressure/s = 0.2 × 0.015 = 0.003/s`. Do 100 pritiska: ~333s ≈ 5.5 minuta bez upgrada. Sa par upgrade-a (~2-3 min) može se srezati na 3.7 min. Dobro za idle žanr.

Problem: bez aktivnog klika (koji daje SJ → koji kupuje upgrade-e → koji ubrzavaju FJ), igra je pasivna ali spora. Tenzija "klikaj ili čekaj" postoji, ali nije dovoljno nagoveštena.

**Mutation modal: opisi su dobri ali tehnički**

"Šta se menja: clickPower se duplira svakih 30s aktivnog klika (max ×4, resetuje se na pauzu >10s)" — korisno ali suvo. Nema emotivne stake ili flavor texta. Za idle žanr igrači su navikli na suv tekst, ali malo character-a bi pomoglo.

### Pohvale

**Prestiže hook je jasno dizajniran.** Pressure bar kao vizuelni ticker ka prestiže-u je intuitivniji od threshold-based "klikni kad imaš X" mehanika.

**Mutacije su raznovrsne i imaju stvaran impact.** M7 (no degrade), M8 (synergy), M5 (cascade) su posebno interesantne kombinacije. Igrač ima razlog da istraži.

**Win screen prikazuje aktivne mutacije** (ui.js:304-310) — satisfaktorni recap koji nagrađuje accumulation.

**Degradacija kao idle-punisher je thematski autentična** — kvasac "umire" od nehaja. Dobra loop narativa.

---

## TOP 3 kritična buga za Jovu

### 1. [CRITICAL] Upgrade panel se nikad ne osvežava automatski — dugmad ostaju disabled

**Fajl:** `src/main.js`, blok oko linije 154 (UI throttle) i `src/ui.js:renderUpgradePanel`
**Problem:** `renderUpgradePanel` se ne poziva u UI refresh petlji — samo na init i na uspešnu kupovinu. Igrač ne može kupiti upgrade dok ga ne potera passivni income koji se ne reflektuje u UI.
**Fix:** U UI throttle bloku u `main.js` (~linija 154-157), dodati poziv `renderUpgradePanel(state, handleUpgradeBuy)` pored `updateHUD(state)`. Alternativno, napraviti `updateUpgradePanel(state)` koji samo ažurira `disabled` state i klase bez rebuilda innerHTML.

---

### 2. [MEDIUM] Audio ne radi na Chrome — AudioContext suspended

**Fajl:** `src/audio.js:41-69` (`initAudio`) + `src/main.js:79`
**Problem:** AudioContext kreiran pre user gesture, ostaje suspended, nikad se ne resume-uje.
**Fix:** U `handleBarrelClick` (main.js:174), na početku funkcije dodati:
```js
if (audioCtx && audioCtx.state === 'suspended') {
  audioCtx.resume().catch(() => {});
}
```
Ili: eksportovati `resumeAudio()` iz audio.js i pozvati je na prvom kliku.

---

### 3. [MEDIUM] M2 mutacija nema nikakav efekat na gameplay

**Fajl:** `src/systems/mutations.js:55` (switch bez M2 case) + `src/state.js:computeDerivedStats`
**Problem:** Igrač može izabrati M2 "Etanol-Rezistentan" i ne dobiti nikakvu prednost. Mutacija je lažno prikazana.
**Fix (minimalni):** Implementirati u `computeDerivedStats` — ako M2 aktivan i `state.sj >= CONFIG.SJ_CAPACITY * 0.7`, primeni `fermentRate *= 1.0` (bez penala) — ali budući da baza ne penalizuje visok SJ, M2 treba redizajn. Brzi fix: zameniti opis na nešto što je već implementirano, npr. "+15% na sve pasivne FJ/s" i dodati tu liniju u `computeDerivedStats`.

---

## Šta NE treba popravljati (nice-to-have, za sutra)

- **M1 hardkodiran 1/60 dt** — funckioniše na 95% uređaja, dovoljno dobro za daily game
- **`checkDegradation` poziva `computeDerivedStats` svaki frame** — mikrooptimizacija, nema vidljivog efekta na performance
- **Mutation modal bez skip dugmeta** — po dizajnu (forced choice), ne lomi igru
- **`termal_regulator` effectValue konzistentnost** — dokumentacioni bug, ne utiče na gameplay
- **Onboarding nedostatak** — pomaže, ali igra je igriva bez tutoriala kad UI radi ispravno
- **Upgrade desc text overflow na mobilnom** — estetski problem, nije game-breaking
