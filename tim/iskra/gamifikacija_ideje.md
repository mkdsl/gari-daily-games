# GDG Gamifikacija Ideje — Iskra (cross-repo bridge)

> Ovaj fajl je most između `ajajaj/tim/iskra/` (Iskrin primarni repo) i GDG pipeline-a.
> GDG CLAUDE.md KORAK 1 referencuje ovaj fajl kao input — postojao je samo u ajajaj, ne ovde.
> Fix: 2026-08-03 Iskra autorun. Kompletan katalog: `ajajaj/tim/iskra/gamifikacija_ideje.md`.
> Ovde su SAMO prioritetne stavke za sledeći slot.

---

## PRIORITET #1 — Berba Trka (timing/rhythm, Guncati × Kluboslavija)

**Status:** CONCEPT READY — detalji u `ajajaj/tim/iskra/2026-08-02.md`, sekcija "Berba Trka"
**Urgentnost:** ⚡ Berba počinje 04.08 — izlaz igre za 04–06.08 ima prirodni marketing window koji se ne ponavlja do sledeće sezone
**Žanr:** Timing/Rhythm Puzzle (Precision Harvesting) — žanr koji GDG nije radio
**Session target:** 10–15 min
**Brand serves:** guncati (primary), kluboslavija (secondary)

### Core loop (za Mile/GDD)

- 4–6 biljaka istovremeno, svaka sa RIPENESS METER-om koji raste sopstvenim tempom
- Meter: 🟢 Zeleno (nezrelo, minus) → 🟡 Žuto (prime zone, max poena) → 🔴 Crveno (overripe, minus)
- Igrač klika voćku kad proceni "prime" — TIMING SCORE u ms od ulaska u prime zone
- Paralelno: oblaci i kiša skraćuju krug (urgencija bez panic-a)
- Prestige hook: "Drugi krug" → reset, zadrži Berba Rekord permanentno, +1 nova biljka/prestige

### Biljke i prime zone (različite krive)

| Biljka | Prime zona | Napomena |
|--------|-----------|----------|
| jagoda | 2.5s | brza, osnovna |
| trešnja | 3s | nestabilna ±15% šuma |
| paradajz | 7s | spor ali siguran |
| lubenica | 8s | najveća nagrada |
| dinja | 5s | srednja, predvidljiva |
| kupina | 1.5s | HIGH risk/high reward |

### Audio (Ceca Čujka)

- Jutarnje ptice → poslepodnevni cvrčci → distant thunder → kiša crescendo
- Click SFX: "crunch" koji se menja po kvalitetu (dobar = satisfying thud, loš = soft plop)
- Prime zone entry: kratki folk riff (jedna nota)

### Vizuelni identitet (Pera Piksel)

- Top-down garden, pixel art, 3×2 grid biljaka
- Paleta: #1a1208 bg / #2d5016 biljke / #FFD700 sunce / #8B8B8B oblak
- Ripeness indikator: RING oko biljke (zelena→žuta→crvena outline pulsira)

### Share card

"Moj Berba Score: X. Prava berba počinje 04.08 na Guncatiju. [play_url]"

### Easter egg (Kluboslavija secondary)

Ako nađeš "Avala Trešnju" (poseban beli pixel) → Krediti screen sa Avala event posterom

### Scope procena

~18–22 modula, 5000–7000 JS linija, single-layer arkada, 2-3 dana pipeline

---

## Backlog (iz ajajaj)

→ Za kompletan katalog sa statusom (✅ isporučeno / kandidat): `ajajaj/tim/iskra/gamifikacija_ideje.md`

**Sledeći kandidati posle Berba Trka:**
- Crew Recruiter (deck-builder, pred Sarajevo restart)
- Park Mapa (retry — 2× pokušan, 0 JS do sad)
- Sound Check Simulator (pred Niš žurku kad datum padne)
