## BETA TEST REPORT — Pulse Runner

### Ukupna ocena: 7/10

### Zora (UX): 7/10
Šta radi: Ritam igre je jasno komuniciran — puls flash + screen shake daju čitljiv signal za kretanje, a miss counter sa "danger" klasom na 2+ miss gradi pritisak bez zbunjivanja. Game Over ekran sadrži sve relevantne informacije (depth, score, best).
Šta ne radi:
- Nema vizuelne indikacije "input window" na gridu — igrač ne zna kada sme da pritisne dirku, samo osjeća puls
- Controls hint ("← → ↑ ↓ ili swipe") prikazan samo na main meniju, ne i tokom pauze ili game over ekrana
- HP se prikazuje Unicode srčicama (♥/♡) bez boje — na tamnoj pozadini teško čitljivo, nema kontrast

### Raša (Tehničko): 6/10
Šta radi: Importi su konzistentni između fajlova — nema circular importa između collision.js i pulse.js (pulse.js uvozi tryMove iz collision.js, collision.js ne uvozi ništa iz pulse.js). BFS u maze.js je stvarno implementiran i ispravan — nije commented out (samo debugPrintGrid helper je zakomentarisan). Canvas dimenzije se čitaju ispravno u render.js (canvas.width / dpr, linija 171).
Šta puca:
- `render.js:170` — `devicePixelRatio` se čita bez `window.` prefiksa, može pući u non-browser okruženjima (Worker/SSR) iako u praksi radi u pregledaču
- `main.js:42` — `ctx.scale(dpr, dpr)` se poziva svaki put u `resize()` bez resetovanja transform matrice; svaki `window.resize` event akumulira scale, što rezultira sve sitnijim i krivo pozicioniranim gridom nakon prvog resiza
- `ui.js:68–78` — `updateHUD` radi `getElementById` 4 puta svaki frame (60fps = 240 DOM lookupa/s) bez keširanja referenci
- `maze.js:119` — komentari unutar `_tryGenerate` skaču sa "5. BFS" direktno na "7. Postavi collectibles" (step 6 je naveden u header doc-u ali preskočen u inline komentarima) — ne utiče na logiku, ali zbunjuje čitaoca

### Lela (Engagement): 8/10
Šta radi: Core loop je čvrst — ritam + kretanje + miss sistem stvaraju pravi pritisak. Proceduralni maze sa BFS garancijom znači da svaki nivo uvek ima rešenje. Collectibles koji resetuju miss counter su odlična taktička nagrada.
Šta dosadi:
- Grid vizuelno izgleda identično od nivoa 1 do visokih nivoa — nema progresivne promjene boje, tema, ni ambient promjene koja bi signalizovala dubinu
- Nema highscore animacije ni zvučne nagrade za "NEW RECORD" momenat (prikazuje se samo tekst)
- Pulse tempo raste sa nivoom ali igrač nema vizualni feedback koliko brzo kuca srce (bez BPM indikatora ili sličnog)

### TOP 3 kritična problema (BLOCKER)
1. **ctx.scale akumulacija pri resize** — `main.js:42`: `ctx.scale(dpr, dpr)` se poziva bez prethodnog `ctx.setTransform(1,0,0,1,0,0)` reseta; svaki `window.resize` event množi transform, grid se smanjuje i pomera na krivom mestu posle prvog resiza. Fix: dodati `ctx.setTransform(dpr, 0, 0, dpr, 0, 0)` umesto `ctx.scale(dpr, dpr)` (setTransform uvek postavlja apsolutnu matricu, ne množi).
2. **Input window nije vidljiv igraču** — `pulse.js:81` postavlja `state.inInputWindow = true` ali ni `render.js` ni `ui.js` ne koriste taj flag za vizualnu indikaciju; igrač pogađa ritam na sluh bez vizuelnog vodiča. Fix: u `render.js` promeniti boju pozadine grida (ili dodati border na canvas) kad je `state.inInputWindow === true` — jeftin signal, veliki UX gain.
3. **miss counter reset se ne dešava na levelTransition** — `main.js:79` (nextLevel) resetuje `missCount = 0`, ali `collision.js:77` (_onCollectible) takođe radi inline reset. Problem: ako igrač stigne do exita sa 2 miss-a, level transition se dogodi pre nego što endRun provjeri — to je ispravno. Međutim, ako `endRun` bude pozvan iz `_onMiss` ISTOG frame-a kad `tryMove` vrati 'exit' (zbog redosljeda u _onPulse), moguće je dvostruko okidanje (nextLevel i endRun u istom pulsu ako postoji race). Fix: dodati `if (state.screen !== 'playing') return;` na početak `_onMiss` u pulse.js.

### TOP 3 nice to have
1. Keširati DOM reference u `ui.js:initUI` (čuvati `hud-hp`, `hud-score`, `hud-level`, `hud-miss` u module-level varijablama) i koristiti ih u `updateHUD` umesto `getElementById` svaki frame.
2. Koristiti `state.inInputWindow` u `render.js` za vizuelni hint — npr. blagi brightness boost ili border na grid containeru dok je input window otvoren.
3. Dodati progresivnu promenu boje pozadine ili grid teme sa porastom `state.depth` — čak i linearna interpolacija od tamno-plave ka crveno-crnoj bila bi dovoljna za osećaj napredovanja.
