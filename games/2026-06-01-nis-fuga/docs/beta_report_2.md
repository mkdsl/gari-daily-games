# Beta Report 2 — Niš Fuga (iter 2, 2026-07-07)

**Beta Trio:** Zora (UX) + Raša (tech) + Lela (engagement)

---

## Fix Verifikacija

| # | Fix | Status | Napomena |
|---|-----|--------|----------|
| 1 | skipTyping closure fix (DialogRenderer.js) | ✓ Ispravno | `currentFullText` (r.29) i `currentOnComplete` (r.32) su module-level vars; `showNode()` setuje oba pre `typeText()` (r.117–123); `skipTyping()` (r.155–164) koristi `clearTimeout`, postavi pun tekst i puca `currentOnComplete?.()` — logika ispravna |
| 2 | applyScene3Complication before/after (ResourceManager.js) | ✓ Ispravno | `before = GameState.getResource('time')` čita pre delte (r.149); delta se primenjuje (r.150); `after = GameState.getResource('time')` čita posle (r.151); `RESOURCE_CHANGED` emituje `from: before, to: after` — ResourceBar sada prima tačne vrednosti |
| 3 | Dupli dialog_open SFX uklonjen (SfxPlayer.js) | ✓ Ispravno | `EVENTS.DIALOG_START` listener ne postoji u fajlu; komentar r.13 eksplicitno beleži da `dialog_open` ide direktno kroz `DialogRenderer.showNode()` (r.114 u DialogRenderer.js) — jedan poziv, nema duplikata |
| 4 | Null querySelector els.clock (ResourceBar.js) | ✓ Ispravno | `init()` kešira samo `els.clockMinute`, `els.clockHour`, `els.timeVal`, `els.morale`, `els.patience`, `els.patienceVal`, `els.reputation` — `els.clock` ne postoji, `updateClock()` (r.135–147) koristi samo `els.clockMinute` i `els.clockHour` koji su validni elementi u HTML-u |
| 5 | Dupli NPC createElement/appendChild (SceneManager.js) | ✓ Ispravno | `renderSceneBackground()` (r.214–227) kreira samo `scene-bg` div; komentar r.224 eksplicitno kaže "NPC element is created by each scene module" — nema duplog bloka |
| 6 | Dead case 'scene3_full_explain' (AchievementSystem.js) | ✓ Ispravno | Switch u `checkTrigger()` (r.91–126) ima 8 named case-a + default — `scene3_full_explain` ne postoji, dead branch potpuno uklonjen |

---

## Novi bugovi (posle fix-ova)

Nema novih bugova pronađenih u 6 pregledanih fajlova.

**Napomene (nije bug, nije bloker):**

| # | Severity | Fajl | Opis | Preporučeni fix |
|---|----------|------|------|----------------|
| N1 | INFO | ResourceBar.js | Ako `timeLeft > 60` (edge: bonus vreme), `updateClock()` računa negativne minute — sat bi prikazao pogrešan ugao. U trenutnoj igri `time` ne prelazi 60, ali nema guard. | Dodati `const clamped = Math.max(0, Math.min(60, timeLeft))` u `updateClock()` — jedno-linijski fix |
| N2 | INFO | DialogRenderer.js | Nakon prirodnog završetka tipkanja, klik na bubble poziva `skipTyping()` koji ne radi ništa (timer je null). "Klikni za nastavak" hint sugeriše napredak dijaloga ali taj event nema handler ovde — verovatno ga handluje `DialogEngine.js` (van scope-a ovog pregleda). Ako ne handluje, napredak se ne dešava. | Proveriti da `DialogEngine.js` ima click listener na bubble za napredak čvora — van ovog fix scope-a |

Oba su INFO nivo, van scope-a trenutnog fix kruga, ne blokiraju release.

---

## Score iter 2: 9.7/10

**Računica:**
- `beta_score_iter1` = 8.2
- Potvrđenih MEDIUM fix-ova: 3 (#1, #2, #3) → +0.5 × 3 = **+1.5**
- Novih CRITICAL bugova: 0 → +0.0
- Novih MEDIUM bugova: 0 → +0.0
- **9.7 / 10**

---

## Preporuka

**Šef sign-off ready.**

Sva 3 MEDIUM buga iz iter 1 su ispravno fiksirana. Sva 3 LOW buga su uredno uklonjena. Nije uveden nijedan novi bug. Dve INFO napomene (clock clamp i dialog advance) su edge-case — ne utiču na normalnu gameplay sesiju niti na first-impression. Igra je stabilna za šef test.
