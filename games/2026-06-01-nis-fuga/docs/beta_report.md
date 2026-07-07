# Beta Report — Niš Fuga (iter 1, 2026-07-07)

**Beta Trio:** Zora (UX) + Raša (tech) + Lela (engagement)
**Score: 8.2/10**

---

## Zora (UX & First Impression)

Igra se pokreće bez greške. Loading screen → main menu → prva scena Bulevar su vizuelno koherentni. Dragoljub NPC se iscrtava, dijalog bubble se pojavljuje, choice buttons su odmah vidljivi.

**Problem: skip tipkanja ne prikazuje pun tekst (MEDIUM)**
Kliknuti na dialog bubble tokom typing animacije bi trebalo da prikaže ceo tekst i pokaže "Klikni za nastavak..." hint. Umesto toga, `skipTyping()` u `DialogRenderer.js` briše tajmer ali ne popunjava `textEl` sa punim tekstom — emituje `'dialog:node:skip'` event koji niko ne sluša, a `onComplete()` nikad ne puca. Rezultat: polu-prikazan tekst ostaje vidljiv, hint ostaje na opacity 0. Choice buttons SU vidljivi jer ChoiceMenu dobija iste podatke simultano sa DIALOG_NODE eventom — igra nije blokirana, ali prvi utisak je zbunjujući svaki put kad igrač klikne za skip.

**Problem: dupli NPC element po sceni (LOW)**
`SceneManager.renderSceneBackground()` kreira `div.scene-npc.npc-dragoljub` i ubacuje ga u `.scene-bg`. Potom `SceneBulevar.setup()` poziva `createNpcElement('dragoljub')` i appenda ga na isti `.scene-bg`. Rezultat: dva NPC elementa u DOM-u. Vizuelni efekat zavisi od CSS-a, ali potencijalni overlap je bug.

**Opšti utisak:** Main menu lepo urađen (achievement grid, continue banner, branding). Resource bar (sat, srca, strpljenje, figure morala) je intuitivan na prvi pogled. Scena 1 narativ je prirodan i brzo uvodi igru.

---

## Raša (Tech & Robustness)

**Problem: `applyScene3Complication()` šalje nepotpun RESOURCE_CHANGED event (MEDIUM)**

U `ResourceManager.js`, funkcija `applyScene3Complication()` ažurira state ispravno ali emituje:
```js
EventBus.emit(EVENTS.RESOURCE_CHANGED, {
    resource: 'time',
    delta: -actualMinus,
    reason: 'scene3_complication'
});
```

ResourceBar.js osluškuje `RESOURCE_CHANGED` i destrukturira `{ resource, to, from }`. Pošto `to` i `from` nisu emitovani, oba su `undefined`. Posledice:
- `els.timeVal.textContent = 'undefined min'` — HUD prikazuje "undefined min"
- `updateClock(undefined)` → `60 - undefined = NaN` → clock hands dobijaju `rotate(NaN deg)` — invalid CSS, kazaljke se zamrznu
- Traje do sledeće legitimne resource promene iz choice-a (koja ima ispravan `to`)

Trigeriše se SAMO na putanji s3_c (odlaženje poziva — +20 min komplikacija). Nakon prvog izbora u sceni 5 koji menja resurse, HUD se ispravlja. Ali u tim sekundama između ulaska u scenu 5 i prvog klika, HUD je pokvaren.

Fix: u `applyScene3Complication()` koristiti `GameState.getResource('time')` pre i posle delta-e pa emitovati `to`/`from`:
```js
const before = GameState.getResource('time');
GameState.applyResourceDelta({ time: -actualMinus });
const after = GameState.getResource('time');
EventBus.emit(EVENTS.RESOURCE_CHANGED, {
    resource: 'time',
    from: before,
    to: after,
    delta: -actualMinus,
    reason: 'scene3_complication'
});
```

**Problem: `dialog_open` SFX duplirano na prvom dijalogu svake scene (MEDIUM)**

`SfxPlayer.js` registruje listener na `EVENTS.DIALOG_START`:
```js
EventBus.on(EVENTS.DIALOG_START, () => play('dialog_open'));
```
Ali `DialogRenderer.showNode()` direktno poziva `SfxPlayer.play('dialog_open')` pri svakom DIALOG_NODE eventu. Kako `DIALOG_START` puca jednom (pri početku scene dijaloga) i DIALOG_NODE puca odmah zatim za isti prvi čvor, `dialog_open` se čuje dva puta istovremeno na prvom dijalogu svake scene.

Fix: ukloniti `EVENTS.DIALOG_START` listener iz SfxPlayer.js (DialogRenderer.showNode ga ionako poziva za svaki čvor).

**Dead code: `els.clock` u ResourceBar.js (LOW)**

```js
els.clock = container.querySelector('.rb-clock-hands');
```
Klasa `.rb-clock-hands` ne postoji u `buildHTML()` — jedina clock-related klasa je `.rb-clock-face`. Selektor vraća `null`. `els.clock` se nigde posle ne koristi (samo `els.clockMinute` i `els.clockHour` se koriste u `updateClock()`). Nema runtime impakta.

**Verifikacija kritičnog puta (startovanje):**
- Svi importi u `main.js` resolvuju na postojeće fajlove ✓
- Sve `.js` ekstenzije prisutne u relativnim import path-ovima ✓
- Data fajlovi (`scenes.json`, `dialogs.json`, `achievements.json`) postoje ✓
- EventBus singleton pattern ispravno radi kroz ES6 module sistem ✓
- `GameState.on()` postoji i radi (EventEmitter API unutar GameStateClass) ✓
- `AchievementSystem.init(achievementsData.achievements)` prima niz ispravno ✓
- Dialog tree je aciklički — sve s1-s5 grane vode do `action: "next_scene"` ili `action: "ending"`, nema dead-end čvorova ✓
- Scenario bez softlocka potvrđen: u sceni 5 (kapija), s5_b (čekati Gorana) uvek dostupan bez gejta ✓

---

## Lela (Engagement & Pacing)

Dijalog writing je odličan — Dragoljub, Baca Mile, Panta su autentični likovi sa glasom. Panta soundcheck objašnjenje (3-4 klika) je emotivni highlight i zaslužuje achievement.

**Engagement struktura je zdrava:** Svaka scena ima 3-4 izbora sa različitim trade-off-ovima (vreme vs. reputacija vs. moral). Secret endings (s1/s2) su dobro skrivene. 7 završnica za ovaj obim je solid replay value.

**Pacing opaska (LOW):** `scene3_full_explain` trigger u `AchievementSystem.checkTrigger()` je dead code — dijalog za soundcheck objašnjenje koristi `'soundcheck_objasnjenje'` direktno kao trigger, a checkTrigger ima case za `'scene3_full_explain'` koji se nikad ne poziva. `default` branch ispravno radi unlock, ali `case 'scene3_full_explain':` treba da se ukloni da ne zbunjuje buduće promene.

**Score breakdown:** "Solidno jutro" ending tekst ("Posle soundchecka, čuješ kako Panta iz kafane razgovara...") je posebno jaka detaljna scena. "Nismo stigli" ending sa Goranovom rečenicom je emotivno ubedljiv. Replay motivacija je visoka.

---

## Bug Lista

| # | Severity | Fajl | Opis | Preporučeni fix |
|---|----------|------|------|----------------|
| 1 | MEDIUM | `src/ui/DialogRenderer.js` | `skipTyping()` emituje nepostojeći event `'dialog:node:skip'`, ne popunjava textEl sa punim tekstom, onComplete nikad ne puca → polu-tekst zauvek vidljiv | Sačuvaj pun tekst u closure pri `showNode()`, u `skipTyping()` direktno setuj `textEl.textContent = fullText` i pozovi `onComplete()` |
| 2 | MEDIUM | `src/engine/ResourceManager.js` | `applyScene3Complication()` emituje RESOURCE_CHANGED bez `to`/`from` → ResourceBar prikazuje "undefined min" i zamrznute kazaljke sata | Čitaj state pre/posle delta-e, emituj sa ispravnim `to` i `from` poljima |
| 3 | MEDIUM | `src/audio/SfxPlayer.js` | Listener na `EVENTS.DIALOG_START` i direktan call iz DialogRenderer.showNode() → `dialog_open` zvuk se čuje duplo na prvom dijalogu svake scene | Ukloniti `EventBus.on(EVENTS.DIALOG_START, ...)` iz SfxPlayer.js |
| 4 | LOW | `src/ui/ResourceBar.js` | `els.clock = container.querySelector('.rb-clock-hands')` — klasa `.rb-clock-hands` ne postoji u buildHTML(), vraća null, `els.clock` se nigde ne koristi | Ukloniti liniju 30 (`els.clock = ...`) |
| 5 | LOW | `src/scenes/SceneBulevar.js` + `src/engine/SceneManager.js` | SceneManager ubacuje `div.scene-npc.npc-dragoljub`, potom SceneBulevar.setup() appenda drugi NPC element → dupli NPC u DOM-u | Ukloniti NPC append iz `SceneManager.renderSceneBackground()` — scene moduli kreira pravi sprite |
| 6 | LOW | `src/engine/AchievementSystem.js` | `case 'scene3_full_explain':` u `checkTrigger()` nikad se ne poziva — dijalog koristi `'soundcheck_objasnjenje'` direktno | Ukloniti dead case, ili preporučiti normalizaciju trigger naziva |

---

## Score Formula

```
Base: 10.0
CRITICAL: 0 × 1.5 = 0.0
MEDIUM:   3 × 0.5 = 1.5
LOW:      3 × 0.1 = 0.3
Final:    10.0 - 1.5 - 0.3 = 8.2/10
```

---

## Preporuka

**Drži uz hitne popravke.**

Igra se pokreće i igra bez CRITICAL blokatora. Narativ, UX i audio struktura su solidni. Tri MEDIUM buga su svi dostupni u specifičnim scenarijima: bug #1 (skipTyping) pogađa sve igrače koji kliknu tokom typing-a (što je uobičajen reflex), bug #2 (undefined min) pogađa igrače na s3_c putanji u sceni 5, bug #3 (dupli SFX) pogađa auditorno sve igrače. Svaki fix je 5-15 linija koda. Preporučujem KORAK 6 sa fokusom na ova tri — LOW bugovi su opcioni za isti krug.
