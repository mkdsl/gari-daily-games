# Kluboslavija Pasoš

**Tvoja putna isprava kroz GDG 2026.**

Svaki event ostavlja pečat. Tri pečata čekaju te odmah — ostale zarađuješ jednu po jednu, jednu igru za drugom.

## Kako se koristi

1. **Tapni korice** da otvoriš Pasoš
2. **Vidi stranice** — svaka strana je jedan GDG event
3. **Klikni "Odigrao/la sam ovo"** za Avala Run, Aforizam Generator i DJ za Pultom
4. **Skupi 3 pečata** → otključaj specijalni avatar frame
5. **Skupi 5** → Badge "Ekipni Čovek"
6. **Skupi 7** → Crew Member status (aktivira bonuse u budućim igrama)

## Igre sa pečatima

| Igra | Pečat boja | Link |
|------|-----------|------|
| Avala Run | Zelena šuma (`#2D6A4F`) | [Igraj](https://mkdsl.github.io/gari-daily-games/games/2026-05-06-avala-run/) |
| Aforizam Generator | Tamno plava (`#1B3A6B`) | [Igraj](https://mkdsl.github.io/gari-daily-games/games/2026-05-08-aforizam-generator/) |
| DJ za Pultom | Ljubičasta noć (`#6B2FA0`) | [Igraj](https://mkdsl.github.io/gari-daily-games/games/2026-05-09-dj-za-pultom/) |

## Tim

- **Sine Scenario** — Koncept i narativ
- **Nega Negovanović** — Premortem analiza
- **Mile Mehanika** — Game Design, `pasos-sdk.js` interfejs
- **Jova jQuery** — Implementacija
- **Beta Trio** (Zora + Raša + Lela) — QA

## Tehničko

- Vanilla JS ES6 moduli, bez build-a
- `pasos-sdk.js` — inter-game API za buduće GDG igre
- localStorage za sve state (export/import JSON dostupan)
- Mobile-first, 320px+
- Web Audio API (5 zvukova, lazy init)
- ~520 JS linija, ~280 CSS linija
