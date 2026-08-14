# Šef Sign-Off — Na Vezi

**Datum:** 2026-07-24
**beta_score iter 1:** 1.2/10 (3 CRITICAL — igra se nije učitavala)
**beta_score iter 2:** 5.3/10 (svi CRITICAL fiksirani; 3 nova MEDIUM naming mismatch)

---

## Status

Igra se sada **učitava i može se odigrati end-to-end** — svi 3 CRITICAL bug-a su potvrđeno rešeni. Međutim, beta iter 2 je otkrio 3 nova MEDIUM bug-a (svi u `src/main.js`, isti naming mismatch koren):

| Bug | Efekat | Fix |
|-----|--------|-----|
| `plan.platformAlloc` umesto `plan.platform_alloc` | TikTok/YouTube chat prazni, player-ove alokacione odluke ignorisane | `main.js` ~linija 470, 572 |
| `ds.offgridCapacity` umesto `ds.offgrid` | Battery meter statičan, vizuelna tenzija ne postoji | `main.js` ~linija 588 |
| `plan.guest` umesto `plan.chosen_guest_id` | Gost nikad ne dolazi, guest mehanika mrtva | `main.js` ~linija 416, 420, 531 |

**Bez ovih fixeva:** igra radi, signali i alarmi rade, timer radi — ali 3 od 4 core mehanika (platforme, gost, baterija) ne funkcionišu vidljivo za igrača.

**Sa ovim fixevima:** očekivani score 7.5–8.5/10 po Beta Trio proceni. Fix scope je mali (~8 linija u main.js).

---

## Šef, odluka je tvoja:

**Opcija A — Dozvoli brzi fix krug 2** (preporučeno):
```
- [ ] OK, uradi fix krug 2 i re-release
```
Pipeline ne predviđa auto-trigger za ovo (max 1 fix krug po pravilima). Šef eksplicitno odobrava.

**Opcija B — Pusti kao-jeste, release sad**:
```
- [ ] OK za release (5.3/10, 3 MEDIUM nefiksirani)
```
Naming bugovi idu u `patch_queue.md` kao P1 za prvi naredni patch sesiju.

**Opcija C — Odloži, vrati u pipeline sledeći trigger**:
```
- [ ] Čeka, ne diraj
```

---

## Šta radi

- Ekran se učitava (crni ekran problem rešen)
- Weekly briefing + 5 koraka planiranja navigabilno
- Lock-in odbrojavanje + micro dashboard se otvara
- Signal osciluje, alarmi zahtevaju akciju, timer odbrojava ispravno (8:00)
- EQ minigame, replay screen, aforizam, brand hook — sve dostupno
- Prestiž i achievement sistem — nema prepreka

## Šta ne radi (MEDIUM bugs)

- Platform allocation (korak 2) — ignorisana u emisiji
- Gost kojeg bookuješ — ne dolazi nikad
- Off-grid baterija — meter statičan, tenzija nevidljiva

**play_url:** https://mkdsl.github.io/gari-daily-games/games/2026-07-18-na-vezi/
