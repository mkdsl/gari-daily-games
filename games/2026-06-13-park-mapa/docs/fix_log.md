# Fix Log — Park Mapa
**Datum:** 2026-06-16
**Iteracija:** 1

## Fiksovano (iz beta_report.md iter 1)

### CRITICAL
- [C1] daily-light.js: CONFIG.ZONE_CHECKIN_DAILY_LIGHT → CONFIG.PT_REWARDS.ZONE_CHECKIN_DAILY_LIGHT (sinhronizacija sa economy sistemom)
- [C2] config.js: dodat EGG_HIT_RADIUS: 24 (za mobile touch targets, umesto ?? 12 fallback-a)
- [C3] systems/index.js: zamenjen stub sa praznim export {} (uklonjena konfuzija)
- [C4] config.js: dodati STORIES_PER_ZONE: 5 i ZONE_MAX_LEVEL: 5

### MEDIUM
- [M1] splash.js: splash se zatvara na klik na #hud element (ne blokira HUD interakciju pre 2.5s)
- [M4] ui.js: HUD inline boje zamenjene CSS varijablama iz theme.css
- [M5/M6] bina-setlist-loader.js: dodat SETLIST_FALLBACK sa Avala 20.jun datumom

## Ostalo za sledeću iteraciju (LOW)
- M2: Cooldown vizuelni indikator direktno na tile-u (nije urađeno — scope za iter 2)
- M3: Dynamic import race condition (nije kritičan u praksi — za iter 2)
