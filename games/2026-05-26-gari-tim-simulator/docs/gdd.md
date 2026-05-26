# Gari Tim Simulator — Game Design Document

## Scene Graph
0 → 1 → 2 → 3 (dynamic) → 4 → 5 → 6 → 7 (resolution) → 8 (share card)

## State
```
scene, affinity{gari,mici,brana,tonket,dule,pera}, flags, ending
```

## Endings Redosled
1. Lose — sve affinity ≤ 1
2. Ending 1 (Gari) — gari ≥ 12 AND nijedno drugo ≥ 9
3. Ending 5 (Dule) — dule ≥ 9 AND dule_greska = false
4. Ending 6 (Pera) — pera ≥ 6 OR total ≤ 5
5. Endings 2/3/4 — po max affinitiju, tie-break Mici > Brana > Tonket

## Audio
- Ambijent: 60Hz osc + white noise (gain 0.02)
- Gari scene: +40Hz sub-bass
- Click: 800Hz burst 0.05s
- Fade: 0.2s gain ramp
- Share ding: 1200Hz decay 0.8s
