# Crew Recruiter: Izgradi Ekipu

**Žanr:** Mini deck-builder / crew manager  
**Brand:** MKDSLend (primary) × Guncati × Kluboslavija  
**Play:** https://mkdsl.github.io/gari-daily-games/games/2026-08-14-crew-recruiter/  
**Released:** 2026-08-18

---

## Šta je igra

Ti si event organizer sa jednim nastupom koji dolazi. Imaš 5 uloga koje treba popuniti: **Tonac, Host, Content Creator, Logistika, Obezbeđenje**. Tegleš karte iz špila — svaka karta je čovek sa profilom i snagom. 6 rundi = 6 faza nastupa (Setup → Soundcheck → Opening → Climax → Breakdown → Recap). Na kraju: **Vibe Score (0–100)**.

**Nema karijere, nema kalendara.** Jedan nastup, jedna noć. Zatvorena sesija od 10–18 minuta.

## Kako se igra

1. **Vuci** — 3 karte iz špila (30+ unikatnih karaktera u Klub setu)
2. **Rasporedi** — postavi kartu na slot (ili odbaci za manje penalty)
3. **Reši** — svaki slot generiše doprinos po snazi × faznom weightingu
4. **Synergy** — komplementarne uloge na susednim slotovima daju bonus (10 parova)
5. **Ponovi × 6** — Vibe Score raste i pada po fazi; ne sme da padne na nulu

**Unlock sistem:** završi 3 partije → otključaj Outdoor set; 6 partija → Intimate set. Svaki set nosi signature karte snage 5.

## Brand sprega

- **MKDSLend (primary):** Crew Recruiter je directan show-case "Zabavni radni park" narativa — tim kao igra. Ending screen: "Pravi tim se gradi na Guncatiju."
- **Guncati (tie-in):** CTA ka guncatiju u legendar i solid endingsu (Vibe ≥ 60)
- **Kluboslavija (secondary):** Klub set karata tematski mapiran na underground event kulturu

## Rezultati

| Metrika | Vrednost |
|---------|----------|
| Beta score iter 1 | 7.0/10 |
| Beta score iter 2 | 7.5/10 |
| Post-fix score | **8.5/10** |
| CRITICAL bugovi | 2 (oba ispravljena) |
| MEDIUM ostalo | 4 (quality, ne crash) |

## Tehničke napomene

- 28 modula, 2665 JS + 1190 CSS linija
- ES6 moduli, Vanilla JS, bez build-a
- Web Audio API za crowd ambijent i SFX (0 .wav fajlova)
- Mobile-first: Pointer Events API (drag + click-to-slot fallback)
- localStorage: completedRuns, hall of fame (top 3), event type unlock

## Zašto šef odobrio

Score 7.5 je bio ispod auto-release praga (8.0), ali post_fix_score formula daje 8.5. Igra radi ispravno, 0 crash bugova, šef je odigrao partiju i potvrdio ending screen + Guncati CTA. `[x]` u `docs/sef_signoff.md` 2026-08-18.
