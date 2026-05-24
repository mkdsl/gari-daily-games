# Zvučna Proba — Sound Check Simulator

**Žanr:** Rhythm / Reaction Puzzle
**Datum:** 2026-05-24
**Brend:** Kluboslavija turneja 2026

---

## Premisa

Ti si tonac na probi za Kluboslavija. Sava i Tonket su na bini, zvuk dolazi — ali nešto nije kako treba. Imaš 10 sekundi da uhvatiš problem i koriguj EQ pre nego što publika primeti.

---

## Core Gameplay Loop

1. **Slušanje** — Web Audio API generiše 3–4 sec snippet (sintetizovani bas, mid, visoke frekvencije simulirane oscilatorima). Snippet traje tačno 3.5 sec, bez pauze.
2. **Dijagnoza** — Na ekranu se pojavljuje pitanje: "Šta čuješ?" + 3 ponuđena odgovora (npr. "Preglasan bas", "Previše visokih", "Mid je ugušen"). Igrač bira jednim tapom.
3. **Korekcija** — Trostepeni odabir po EQ osi (◀ Malo smanjiti / ● OK / ▶ Malo pojačati) — max 2 parametra, **nikad slider**.
4. **Verifikacija** — Audio snippet se pušta ponovo sa korigovanim parametrima. Igrač čuje/vidi razliku (VU meter + flash efekt).
5. **Rezultat runde** — Bodovi: tačnost dijagnoze + vreme korekcije. Sledeća runda.

Svake 3 runde dolazi "Boss proba": kompleksniji snippet, vremenski pritisak povećan, publika reaguje u pozadini.

---

## Hook — Zašto 15+ minuta?

Svaka runda traje ~30 sec, ali krivulja težine progresivno uvodi nove frekvencijske zone (runda 1–3: bas, runda 4–6: visoke, runda 7+: mid + kombinovani problemi). Igrač uči stvarni EQ jezik bez da zna da uči. Želi da "završi probu" pre nastupa — narativni sat koji otkucava. Leaderboard po sesiji (lokalni) daje razlog za "još jednom".

---

## Vizuelna Estetika

- **Paleta:** Tamna pozadina (#0D0D0D), neonski amber (#F5A623) za aktivne elemente, electric blue (#00CFFF) za talasne forme, crvena (#FF3B3B) za grešku.
- **Reference:** Studijska oprema iz 80-ih, analogni vumetar, CRT ekran efekti — ali flat, ne kičasto retro.
- **UI:** Brutalno čisto. Jedan veliki waveform vizualizer u centru. Sve kontrole pri dnu, palac zona.

---

## Audio Mood

Problematični snippet zvuči "prljavo" (namerno distorziran/neizbalansiran). Korigovani snippet zvuči toplo i čisto. Kontrast je sam nagrađivanje — igrač čuje razliku.

---

## Win Condition i Game Over

- **Win:** Završi sve runde probe (10 rundi = jedan nastup). Finalni ekran: "Klub je spreman. Tonket kaže: dobar zvuk."
- **Game Over:** Tri uzastopne pogrešne dijagnoze = "Sava je zaustavio probu." Mogu restart od iste runde.

---

## Brand Serves

| Vrednost | Kako igra isporučuje |
|---|---|
| **Kluboslavija pozicioniranje** | Igrač razume da iza žurke stoji profesionalna priprema — ne USB, nego sound design. |
| **Tonket kao ekspertiza** | Ime Tonket se pojavljuje kao "sound director" čiji standard igrač pokušava da dostigne. |
| **Sava kao lik** | Sava je na bini, daje verbal feedback između rundi — humanizuje brend. |
| **Edukacija publike** | Igrač koji nikad nije čuo za EQ zna šta je "muddy bas" posle prve sesije. |
| **Turneja hype** | Countdown: "Do Avale: 27 dana. Proba ide dobro." — direktan link na stvarni događaj. |

---

## Targetirana Dužina Sesije

**12–18 minuta** (10 rundi + Boss probe + leaderboard pregled).

---

## Replay Hook

Svaka sesija generiše drugačiji redosled "problema" (parametri se rotiraju iz banke od 8+ kombinacija). Leaderboard pokazuje "Personal Best" po rundi — uvek postoji jedan moment koji si mogao brže.
