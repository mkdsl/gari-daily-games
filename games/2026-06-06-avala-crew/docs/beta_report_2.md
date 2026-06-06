# Beta Report — Iteracija 2
**Igra:** Avala Crew  
**Datum:** 2026-06-06  
**Agenti:** Zora (UX) + Raša (Tech) + Lela (Engagement)  
**Fokus:** Verifikacija fix-ova iz iteracije 1

---

## Ukupna Ocena: 8.3/10

Sve CRITICAL i MEDIUM stavke iz iter 1 su pravilno fiksirane. Nema novih CRITICAL bugova. Pronašli smo jednu MEDIUM i jednu LOW stavku kao efekte fikseva.

---

## Verifikacija Fix-ova

### CRITICAL-01a — Bojan ability (`bojanAutoWin`) ✅

**Raša:** `main.js` linije 282–287 — fix primenjen ispravno.

```js
if (state.bojanAutoWin && _currentScenario && _currentScenario.type === 'P') {
    appliedAbilities['bojan'] = { forceOutcome: 'win' };
    state.bojanAutoWin = false;
} else if (state.bojanAutoWin) {
    state.bojanAutoWin = false; // consumed on wrong type, silently
}
```

Flag se resetuje u **oba** code path-a — ne može ostati zaglavljeno u `true`. `resolution.js` linije 125–131 pravilno obrađuje `forceOutcome: 'win'` za P-type scenarije postavljanjem `forcedOutcome = 'win'`. Logika u resolution.js proverava `scenario.type === 'P'` kao additional guard — redundantno ali bezopasno. **VERIFIED.**

### CRITICAL-01b — Ana ability (`anaOverridePending`) ✅

**Raša:** `main.js` linije 289–294 — isti pattern, isti fix za `anaOverridePending` na S-type scenarije. Flag se resetuje u oba branch-a. `resolution.js` linije 133–138 obrađuje `overrideOutcome: 'partial'` postavljanjem `forceMinOutcome = 'partial'` (jedino ako `forcedOutcome !== 'win'`, što je ispravna precedenca). **VERIFIED.**

### MEDIUM-01 — Onboarding panel ✅

**Zora:** `roster_renderer.js` linije 84–100 — `.how-to-play` div postoji i kondicionalan je na `state.completedNights === 0`. Panel sadrži E/S/P/L legendu sa opisima, 4 koraka objašnjenja sa ikonama, i grid layout. CSS klasa `.how-to-play` postoji u `ui.css` (linija 1587) sa kompletnim stilovima uključujući `.htp-title`, `.htp-grid`, `.htp-item`, `.htp-stats`. **VERIFIED.**

### MEDIUM-02 — Good Fit label ✅

**Zora:** `roster_renderer.js` linije 244–261 — `isPrimaryRole` se računa kao `member.primaryRole === slot.role`. Kad je `isPrimaryRole === true`, renderuje se i `.good-fit-badge` (checkmark u slotu) i `.good-fit-label` div (`★ Prirodna uloga (+10%)`). CSS klasa `.good-fit-label` postoji u `ui.css` (linija 1647) u neon green boji. **VERIFIED.**

### LOW-01 — Unused import `renderIntroScreen` ✅

**Raša:** Grep kroz `main.js` vraća 0 rezultata za `import.*renderIntroScreen`. Import je uklonjen. Funkcija i dalje postoji u `render.js` (linija 248) ali nije više importovana — to je ok, nije greška. **VERIFIED.**

---

## Novi Bugovi

### MEDIUM-02-new — Bojan/Ana ability "silent consume" na pogrešnom tipu scenarija

**Raša | MEDIUM**

Ako igrač aktivira Bojanovu ability (koja radi samo na P-type) ali sledeći scenario je E/S/L-type, flag se tiho konzumira (`state.bojanAutoWin = false`) bez ikakve povratne informacije igraču. Ability je "potrošena" ali bez efekta — igrač ne zna zašto ništa nije se desilo.

Isto važi za Anu na non-S scenariju.

**Impact:** Ne blokira gameplay, ali može frustrirati igrača koji ne razume zašto ability nije "radila". Posebno problema na prvoj partiji.

**Preporučen fix:** Toast notifikacija tipa `"Bojanova ability aktivirana — čeka se P-tip scenarij"` kada se flag postavi, i `"Scenarij nije bio P-tip — ability iskorišćena bez efekta"` ako se tiho konzumira. Ili, alternativno, ability se ne konzumira na pogrešnom tipu i ostaje aktivna za sledeći odgovarajući scenarij.

---

### LOW-02-new — `.htp-stats` CSS klasa nedostaje u `ui.css`

**Raša | LOW**

`roster_renderer.js` linija 93 renderuje `<div class="htp-stats">` ali `ui.css` definiše samo `.htp-title`, `.htp-grid`, `.htp-item` — nema eksplicitnog CSS bloka za `.htp-stats`. Panel prikazuje tekst ali bez stylinga (samo default flow, bez gap/flex između E/S/P/L labela). Vizuelno suboptimalno ali funkcionalno.

---

## Lelin Engagement Ugao

**Lela:** Onboarding panel je jasno napisan i pomaže first-timer-u. Good fit badge + label su vidljivi i intuitivni — igrač odmah vidi zašto je neko dobar za ulogu. Ability consume feedback problem (MEDIUM-02-new) jedini je značajan flow problem koji ostaje — igrač može napraviti "grešku" koja se ne objašnjava.

---

## Finalni Verdict

**Spremo za šef sign-off** — uz preporuku da se MEDIUM-02-new (ability silent consume) ispravi pre release-a ili odmah posle (low complexity fix, 1 toast u main.js + eventualno izmena logic-a da ability ne "propadne").

CRITICAL-i su rešeni. Prva partija je sada vodena (onboarding panel), role feedback je vidljiv. Igra je igriva i ima jasnu Avala brand vezu.

**Šef treba da proveri:** ability UX edge case (aktiviraš Bojana, al' nije P scenarij — šta se desi vidljivo?). Ako šef smatra da je prihvatljivo za release, nema blokera.
