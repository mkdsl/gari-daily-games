# Beta Report — Kluboslavija: Turneja 2026

**Verdict: beta_score 6.4 / 10**

---

## CRITICAL bugovi

### [C1] checkWin — gameover_budget ne aktivira se kad igrač ima > 0 završenih gradova
- Fajl: `src/systems/progression.js:168`
- Problem: Uslov `&& t.completed_events.length === 0` znači da se gameover_budget ne triggeruje kada igrač ima bar 1 grad ali ostane bez para.
- Fix: `if (t.budget <= 0) return 'gameover_budget';` bez dodatnih uslova.

### [C2] Avala CTA nikada ne prikazuje u normalnoj igri
- Fajl: `src/ui.js:718`
- Problem: Threshold 2500 za event-level fan score je praktično nedostižan. CTA se na event result screenu nikad ne prikazuje.
- Fix: Ukloniti threshold — prikazati CTA uvek kad je `isAvalaEvent === true`.

---

## MEDIUM upozorenja

### [M1] prestige_mode ostaje true ako reputation padne
- Fajl: `src/systems/progression.js:82`
- prestige_mode se ne resetuje reaktivno kada reputation padne ispod 70.

### [M2] MacroHQ prikazuje pogrešan grad (off-by-one)
- Fajl: `src/ui.js:163–164`
- `current_city_index + 1` prikazuje naredni grad umesto tekućeg.

### [M3] Ćirilično slovo u button tekstu
- Fajl: `src/ui.js:614`
- `'Razumeо'` — `о` je ćirilično U+043E, može kauzirati font issue na mobilnim.

### [M4] rollEvent — mitigation check timing nejasan
- Fajl: `src/systems/events.js:31`
- Treba osigurati da rollEvent poziv dolazi posle finalizacije selectedCards.

### [M5] Tutorial tooltip fallback nedostaje
- Fajl: `src/ui.js:117`
- Ako karta za korak nije u decku, nema fallback poruke.

---

## Engagement ocena (Lela): 6/10

Hook postoji, CTA threshold ga ubija (C2). Share dugme OK. Daily highscore motiviše.

---

## Zaključak

**Drži uz korekcije** — C1 i C2 neophodni pre release-a. Sa tim fix-ovima prelazi 7.0 threshold.
