# Beta Report — Gari Tim Simulator
## Datum: 2026-05-26, Iter 1

### Ukupna ocena: 5.8 / 10

---

### CRITICAL bugovi (blokira igranje):

- **[CRITICAL] Beskonačna petlja — Dule micro-scene.** `dule_micro_line2.next` je `'scene7_resolution'`. `resolveNext()` u `main.js` interceptuje taj ID i proverava `state.affinity.dule >= 9`. Pošto micro-scena ne smanjuje dule affinity, uslov ostaje `true` → `dule_micro_start` se poziva ponovo → beskonačna rekurzija. Igra freezuje/crasha na svakom runu gde dule dostiže 9. Može se dosegnut lakše nego što izgleda (scene1_C daje dule+2, scene4_D daje dule+2, scene5_B daje dule+2, scene6_D daje dule+2 = 8 pre micro-scena, a scene6_micro_D_laugh dodaje još +1 hardkodovano = 9). **Fix:** dodati boolean flag npr. `flags.dule_micro_done` i proveriti ga u `resolveNext()` pre ponovnog trigera.

- **[CRITICAL] `dule_greska` flag nikad nije setovan.** U `dialogue_tree.js` ne postoji nijedan node sa `flags: { dule_greska: true }`. Posledica: uslov `!state.flags.dule_greska` u `endings.js` je uvek `true`. Svaki run gde dule >= 9 daje Ending 5, bez ikakve mogućnosti kazne. Mechanic je opisan ali nije implementiran — ovo je ili missing content ili dead game design feature.

---

### MEDIUM bugovi (oštećuje iskustvo):

- **[MEDIUM] Ending 1 (Gari) praktično nedostižan.** Uslov je `gari >= 12` I svi ostali < 9. Problem: svaki odgovor koji podize gari affiniti neizbežno podiže i mici, brana ili tonket kao companion delta (npr. scene2_B: `gari+3, mici+1`; scene4_C: `gari+3, dule+1`). Na putu ka gari >= 12, mici, brana ili tonket gotovo uvek dostignu 9. Pokrivanje svih gari scena bez kompromisa je jedini put, ali priority order endings.js tada svejedno favorizuje Ending 5 ako dule negde pokupi 9 poena. U test-playthrough fokusiranom na Garija, umesto Ending 1 dobija se Ending 5.

- **[MEDIUM] Lose state nema Share opciju.** `SHARE_TEXTS.lose` postoji i ima tekst, ali `showLoseEnding()` ne prikazuje share card — samo dugme "Restartuj". Igrač koji dobije lose state ne može da podeli rezultat. Ovo je inkonsistentno sa ostalih 6 endinga i ostavlja lose state kao mrtvu granu bez engagement vrednosti.

- **[MEDIUM] `scene8_share` node je dead code.** Tip `'share'` nije pokriven ni u `runNode()` switchu. `loadScene(8)` vraća `'scene8_share'` ali scene 8 nikad nije pozvana — scene 7 direktno poziva `resolveEnding()`. Node postoji bez funkcije i path do njega ne postoji. Nije crash jer je nepozvano, ali zbunjuje kod i sugeriše nedovršen dizajn.

- **[MEDIUM] Affinity mutacija van sistema (`scene6_micro_D_laugh`).** U `handleNarrationNode()`: `if (node.id === 'scene6_micro_D_laugh') { state.affinity.dule += 1; }` — ova linija je hardkodovana bypass celog `applyDelta()` sistema. Nije bug u izolaciji, ali narušava konzistentnost: nema traga u `dialogue_tree.js`, ne može se refaktorisati bez editovanja main.js, i upravo ova +1 vrednost može da gurne dule na 9 i triguje broken loop opisani gore.

---

### LOW (kozmetičko/minorno):

- **[LOW] Tipfeler u dijalogu: `scene3_mici_q2` prompt.** Tekst kaže `"funkcióniše"` — akcent na ó nije standardan srpski zapis. Treba `"funkcioniše"`.

- **[LOW] Nema Open Graph / social meta tagova u `index.html`.** `<meta property="og:image">`, `og:title`, `og:description` nisu prisutni. Share via Web Share API radi, ali link preview na Twitteru/iMessage/WhatsAppu biće prazan. Minimalan fix: statička OG slika i title tag.

- **[LOW] Pera Period odsutan iz Scene 5.** Svi ostali likovi su pomenuti u Scene 5 (Tonket govori, Brana u kontekstu), ali Pera nema ni rečenice naracije. Scene 0, 1, 2, 4, 6 imaju Perin passivni passivni presence. Scene 5 (Tonketov test) ne.

- **[LOW] `stopTyping()` u `startTyping()` setuje `isTyping = false` pre nego što nova sesija počne.** Između `stopTyping()` i `isTyping = true` postoji mikro-prozor gde `isCurrentlyTyping()` vraća false. U praksi ne pravi bug jer je sinhron JS, ali arhitekturalno krhko.

---

### UX (Zora):

Prvih 5 minuta (Scene 0→1→2→3) rade korektno za srećne pathove. Typing effect je prijatan, 30ms per char daje dobar ritam. Skip-on-click mehanizam radi (global click listener). Font-size koristi `clamp()` sa minimumom 16px za naraciju i 15px za dijalog — čitljivo na mobilnom. `min-height: var(--touch-min)` (44px) je primenjen na sve interaktivne elemente — zadovoljava WCAG touch target standard. Share card izgleda screenshot-friendly: tamna pozadina, boja karaktera na titlu, border-left za naraciju, share text u monospace. Restart dugme postoji na share cardu i na lose state-u.

Hlavni UX problem: kada igra uđe u dule micro-scene beskonačnu petlju, korisnik vidi beskonačno ponavljanje naracije bez ikakvog feedback-a ili mogućnosti izlaza (nema timeout, nema escape path). Ovo je praktično lockout. Pored toga, `scene-enter` animacija se ponavlja na svakom looped nodeu, što vizuelno signalizira problem ali ne nudi rešenje.

---

### Tech (Raša):

ES6 module struktura je čista i svi `import` putovi su konzistentni. Svi referencirani fajlovi postoje prema manifest.json listi. `createState()` je čist factory. `saveToLocalStorage()` ispravno hvata greške. `DialogueEngine.handleChoice()` koristi `applyDelta()` iz affinity sistema — ali `main.js` handleChoiceNode DIREKTNO poziva `applyDelta()` umesto `DialogueEngine.handleChoice()`, što znači da `DialogueEngine` nije u upotrebi u runtime! To nije bug (state se ispravno ažurira), ali `DialogueEngine` je dead code u trenutnoj arhitekturi.

Affinity delta akumulacija je ispravna kroz sve scene. Priority order u `endings.js` je: lose → E1 → E5 → E6 → E2/E3/E4 — odgovara GDD specifikaciji. `getScene3Leader()` ispravno uzima samo `['gari', 'mici', 'brana', 'tonket']` za dinamičku scene 3. `loadScene(3)` vraća `scene3_${leader}_start` — svi četiri brancha postoje u dialogue_tree.js. Dead-end check: sve scene imaju `next` ili `choices.next` sa jednim izuzetkom — `scene8_share` (dead code, bez `next`).

**Kritičan arhitekturalni problem:** `resolveNext()` ne postavi nikakav flag pre pozivanja dule micro-scene, pa ne može da detektuje da se već izvršila. Ovo je root cause critical buga #1.

---

### Engagement (Lela):

Svih 6 endinga ima pun narativni tekst. Wordcount: E1 ~55 reči, E2 ~60, E3 ~52, E4 ~42, E5 ~58, E6 ~58. Svi su ispod ciljanih 80-120 reči — endingsi su poetski ali kratki. Share tekstovi su deljivi bez MKDSL znanja (nema internih referenci, nema akronima koje treba poznavati). Callback u Scene 3 (Gari verzija) pita direktno "Primetio sam da si seo/la pored mene" — direktna referenca na Scene 0 izbor A, odlično. Brana callback pominje sedenje — ali samo ako player ima Brana-dominated affinity što ne mora biti posledica sedeenja pored Brane. Mici verzija nema eksplicitan callback na Scene 0.

Lose state tekst: "Gari te gleda kratko. 'Pročitaj nam email kad stigneš.' Niko ne gleda gore." — funkcionalan, pomalo hladan umesto smešan. Nije dramatičan, ali nije ni funny. Potreban je jedan self-deprecating humor beat.

Pera Period prisutnost po scenama: Scene 0 (da — opisna naracija), Scene 1 (da — "Pera nešto piše"), Scene 2 (nema eksplicitne Pera linije), Scene 3 (samo Mici verzija ima Pera referencu), Scene 4 (da — naracija), Scene 5 (NE — odsutan), Scene 6 (da — naracija). Rezultat: 5 od 7 scena, ne "svaka scena" kako GDD zahteva.

---

### Šta radi dobro:

- CSS arhitektura je kompletna i dosledna. `theme.css` → `base.css` → `ui.css` → `game.css` layering je čist.
- Typing effect sa skip-on-click je implementiran ispravno i ne blokira progression.
- Web Audio API ambient (60Hz sine + white noise) je elegantno rešenje bez .mp3 fajlova.
- Keyboard accessibility: A/B/C/D tipke, ArrowUp/Down za navigaciju između dugmadi, Space/Enter za continue — sve implementirano.
- `renderChoices()` ima `chosen = true` guard koji sprečava double-click/double-key exploit.
- `loadFromLocalStorage()` ima try/catch fallback — igra ne pada u incognito mode.
- Scene 3 dinamički branching (4 lik-specifične verzije) je dobro implementiran.
- Share card dizajn je screenshot-friendly i ima tri action opcije (share/copy/restart).
- Affinity tiebreak order je konzistentan između `getLeader()` i GDD prioriteta.
- Svi `dialogue-speaker` CSS klase su definisane i mapiraju na `CHARACTER_COLORS` u config.js.

---

### Prioriteti za Iter 2:

1. **Fix dule micro-scene loop** (CRITICAL — blokira sve runove sa dule >= 9)
2. **Implementirati dule_greska mechanic** ili ga ukloniti iz endings.js
3. **Dodati Share opciju na lose state**
4. **Produžiti ending naracije** na 80-120 reči (trenutno svi ispod)
5. **Dodati Pera u Scene 5**
6. **OG meta tagovi** za share preview
