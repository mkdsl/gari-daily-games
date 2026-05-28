# Beta Report — DJ Akademija
**Tester:** Beta Trio (Zora UX + Raša tech + Lela engagement)  
**Datum:** 2026-05-28  
**Build:** izvorni kod, pre deploya

---

## 1. Tehnički nalaz (Raša)

### [NEMA CRITICALA — potvrda]

**Replay scoring reset** — `resetScoring()` radi `_answers.length = 0`, mutira array in-place, ispravno. `questionIndex = 0` resetuje u `goIntro()`. Nema buga.

**Brzi dupli klik** — `handleChoice` ima guard `if (phase !== 'QUESTION') return`. čim igrač klikne, faza prelazi u `'FEEDBACK'` i svaki naredni klik/keydown se ignoriše. Ispravno.

**Timer leak** — `stopTimer()` se poziva sinhrono u `handleChoice()` pre `setTimeout()`. `onTimerExpire` ima sopstveni guard. Race condition pokriven. Nema leak-a.

**DOM event listener leak** — `btn-start`, `btn-share`, `btn-replay` se dodaju na svežem DOM-u (`innerHTML` rekreira element pri svakom pozivu). `dja:replay` listener se dodaje jednom u `init()`. Nema leak-a.

**ES6 module paths** — relativne putanje su ispravne za GitHub Pages deployment.

---

### [MEDIUM] `QUESTIONS_COUNT` hardcoded, odvojen od `QUESTIONS.length`

`config.js` definiše `QUESTIONS_COUNT = 10`, ali `questions.js` ima 10 pitanja nezavisno. Ako neko doda pitanje bez promene konstante, igra se završi pre poslednjeg pitanja (tiha greška, nema crash-a). Preporuka: assertion pri startu ili `QUESTIONS.length`.

### [LOW] Timer prikazuje "1s" dok vreme već ističe

`Math.ceil(remaining / 1000)` sa `remaining = 100ms` daje `1`. Vizuelno nekonzistentno, nije gamebreaking.

### [LOW] Timer boja je statička

`timer-fill` ima fiksni `linear-gradient(purple → red)` bez obzira na preostalo vreme. Pravi urgency signal bi bio da bar postaje crveniji dinamicki ispod 30% preostalog vremena.

### [LOW] `overflow: hidden` na `body` vs. iOS Safari dynamic viewport

Na iOS sa soft keyboard-om, `100dvh` se ne rekompajlira dinamički u svim verzijama Safari-a. Nije sigurno testirano na uređaju.

---

## 2. UX nalaz (Zora)

### [MEDIUM] Feedback window od 1.5s je prekratak za čitanje fact-a

`FEEDBACK_TRANSITION_MS = 1500ms`. Fact tekst je edukativni sadržaj (cela rečenica, 8-15 reči). Prosečno vreme čitanja jedne rečenice je 2-3 sekunde. Pri 1.5s igrač jedva registruje da fact postoji pre nego što ga sledeće pitanje zameni. Direktno urušava edukativnu vrednost. **Preporuka: minimum 2500ms.**

### [LOW] Intro ne komunicira format igre jasno

"10 pitanja · 20 sekundi svako" je u `intro-meta` klasi — 0.8rem, muted boja, zakopano. Nema vizuelne naznake urgentnosti pre prvog pitanja.

### [LOW] Disabled button hover stanje može zbuniti desktop korisnika

Cursor je `default` (ne `not-allowed`) na disabled dugmadima. Mala smetnja.

### [LOW] `.intro-spacer` fragilna na malim ekranima

Na uređajima sa visinom < ~500px (landscape na manjim telefonima), `flex: 1` spacer se komprimuje i START dugme nije na dnu.

---

## 3. Engagement nalaz (Lela)

### [MEDIUM] Share tekst ne nosi numerički score za srednje tier-ove

Igrač sa 6/10 i igrač sa 9/10 šalju skoro identičan tekst — samo titula se razlikuje. Bez brojke, share nema takmičarsku dimenziju. **Preporuka: dodati `[score]/10` u share string za sve tier-ove.**

### [MEDIUM] Jackpot CTA (10/10) nema direkciju

"Pošalji screenshot Kluboslavija DM-u" — nema Instagram handle, nema linka. Igrač koji postigne 10/10 mora sam da zna gde da pošalje. **Preporuka: dodati `@kluboslavija` direktno u jackpot tekst.**

### [LOW] Titule su premalo diferencirane za srednji opseg

Opseg 6-9 pokriva 4 moguća score-a ali ima samo 2 titule. Može ostati za v2.

### [LOW] Nema inter-session motivatora osim best score-a

Ista pitanja uvek. Za dan pre eventa dovoljno, ali ne maximizira "pitaj prijatelja" potencijal.

### [INFO] Q10 (Sarajevo kick-off) je insider pitanje

Relevantno za pratioče, potencijalno frustirajuće za prve kontakte. Svesna odluka.

---

## 4. Beta Score

**6.5 / 10**

**Obrazloženje:**
- Mehanika je solidna, nema showstopper JS bug-ova (+4)
- Vizuelni identitet koherentan, dark paleta + gold funkcioniše za brand (+1)
- Pitanja su kvalitetna: miks DJ kulture, fizike zvuka i lokalnog konteksta (+1)
- Odbitak: `FEEDBACK_TRANSITION_MS = 1500ms` urušava edukativnu vrednost (-0.5)
- Odbitak: share string bez score broja (-0.5)
- Odbitak: jackpot CTA bez handle-a (-0.5)
- Odbitak: `QUESTIONS_COUNT` hardcode + timer statična boja (-0.5)

---

## 5. Zaključak

**Treba fix-ova pre release-a. MORA biti fiksirano:**
1. `FEEDBACK_TRANSITION_MS` → 2500ms
2. Share string mora uključivati numerički score za sve tier-ove
3. Jackpot CTA mora imati `@kluboslavija` handle

**Preoručeni fix:**
4. Timer fill boja: dinamicki swap ispod 30% preostalog vremena
5. `QUESTIONS_COUNT = QUESTIONS.length` ili assertion

**Može ostati za v2:** intro layout, cursor na disabled, timer "1s" display lag
