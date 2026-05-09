# DJ za Pultom

**Žanr:** Idle / Incremental  
**Datum:** 2026-05-09  
**Branding:** Kluboslavija ⭐

> Ti si za pultom. Šef nije dostupan — jer **šef je taj koji radi**. Šest sati. Bez pauze. Bez WC-a. Koliko dugo možeš da izdrži pre nego što floor opusteti?

## Kako se igra

- **NEXT TRACK** — klikni (ili tapni) da podigneš crowd energy (+2.5) i zaradiš bonus coinove (+5). Cooldown: 3 sekunde.
- **Upgrades** — otvori drawer odozdo (swipe up). Kupuj bolju opremu Music Coinovima da povećaš pasivni crowd retention.
- **Crowd energy** mora ostati iznad 0% tokom svih 6 sati smene.
- Igra radi i kad je zatvorena — offline progress (max 30 minuta).

## 3 Zone noći

| Zona | Vreme | Drain/s | Osećaj |
|------|-------|---------|--------|
| Zagrevanje | 0–2h | 0.030 | Lagano, publika stiže |
| Vrhunac | 2–4h | 0.050×1.5 | Pun floor, presija raste |
| After Hours | 4–6h | 0.075×2.0 | Iscrpljenost + Avala hint |

## Tim

- **Sine Scenario** — narativ i premisa  
- **Mile Mehanika** — GDD, balans brojeva  
- **Jova jQuery** — implementacija (Vanilla JS)  
- **Pera Piksel** — estetika (vektor, CSS animacije)  
- **Ceca Čujka** — Web Audio API (ambient + SFX)  
- **Nega Negovanović** — premortem  
- **Beta Trio** (Zora+Raša+Lela) — QA  
- **Gari** — orkestracija

## Tehničke napomene

- Vanilla JS ES6 moduli, bez framework-a  
- Canvas za vizualizaciju + DOM za HUD  
- localStorage save/load sa offline formula  
- Mobile-first (375px), touch kontrole  
- `prefers-reduced-motion` poštovan
