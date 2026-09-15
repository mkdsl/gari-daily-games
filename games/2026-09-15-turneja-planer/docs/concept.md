# Concept: Turneja Planer

**Naziv:** Turneja Planer
**Žanr:** Strategy / Route Optimizer
**Datum:** 2026-09-15
**brand_serves:** kluboslavija, mkdslend

## Premisa

Organizuješ DJ turneju kroz 5 gradova. Budžet je tačan, raspored je pun, i svaki dan nešto pukne.

Svaki grad ima svoju publiku, svoju logistiku, i svoju dinamiku. Tvoj posao: izaberi redosled, izaberi ko ide, izaberi koliko trošiš — i vidi da li možeš da zatvoriš sezonu na plusu a ne minus.

Ovo nije simulacija u vakuumu. Ovo je ono što šef zapravo radi.

## Core Gameplay Loop

**Macro layer (Turneja, 5 gradova):**
Svaki grad je "Stage Card" sa parametrima:
- Venue type: klub (sigurno, manja publika) / open-air (rizičnije, veća publika) / imanje (ekskluzivno, partner-gated)
- Expected crowd: 100–2000 (ne garantovano)
- Travel cost: 15–180 EUR (autobus vs kombi vs rental)
- Crew slot: 1–3 mesta (koji od tima ide — DJ, fotograf, merch)
- Weather risk: 0–3 (0 = zatvoreni prostor, 3 = outdoor bez plana B)

**Player decisions po gradu (pre polaska):**
1. Redosled gradova (routing optimizacija — travel cost vs. crowd buildup)
2. Ko iz tima ide (svaki član ima Daily Rate + Skill tag: DJing / Visual / Promo)
3. Budget alokacija: transport vs. lokalni promo vs. stage tech

**Micro layer (Event Evening, za svaki grad):**
4 mini-odluke u toku večeri (random draw iz decision pool-a):
- Tonček (stage tech) kaže da sub ne vuče pravo. Zoveš backup (trošak +80 EUR) / izlazimo ovako (Quality−2) / pitaš lokalnog tehničara (Quality−1, Crew Mood+1)
- Organizator hoće da pomeri sat za 30 min. Pristaješ (Crowd Mood+1) / ostajete na planu (Quality+0, Tensions+1) / pregovaraš (50% šansa na Crowd Mood+2)
- Neko iz publike hitar video za Stories. Zaustaviš snimanje i poziranješ (Reach+3, Quality−1) / nastaviš (Quality+0) / šalješ fotografa (Reach+2, Quality+0)
- Lokalni DJ želi da zasvira 15 min warming up. Da (Local Rep+2, Crowd better mood) / Ne (−Local Rep, Crowd neutralno)

**Resursi koje pratiš:**
| Resurs | Raspon | Opis |
|--------|--------|------|
| Budžet | 0–5000 EUR | Počinješ sa 3500 EUR |
| Crowd Quality | 0–10 | Prosek po eventu, utiče na booking rating |
| Crew Mood | 0–10 | Iscrpljenost tima kroz 5 gradova |
| Reach | 0–50 | Ukupni socijalni signal (Stories, Reels, taggeri) |
| Reputation | 0–10 | Raste sa dobrim eventima, pada sa katastrofama |

**Carry-over (obavezan između gradova):**
- Budžet ostaje (troškovi se oduzimaju, prihodi se dodaju)
- Crew Mood pada za 1 između svakog grada (putovanje umara)
- Reputation raste sporije ali ne resetuje

## Gradovi & Karakteristike

| Grad | Venue tip | Base Crowd | Travel (od preth.) | Risk |
|------|-----------|-----------|-------------------|------|
| Beograd | Klub/Open-air | 800–1200 | 0 (start) | 1 |
| Novi Sad | Open-air (Štrand) | 600–900 | 80 km | 2 |
| Niš | Klub | 300–600 | 280 km | 1 |
| Sarajevo | Klub/Outdoor | 400–700 | 300 km (border +) | 3 |
| Guncati | Imanje (partner-gated) | 200–400 | 120 km | 2 |

Guncati je FINALNI city — ne možeš ga preskočiti, ali možeš ga ostaviti za kraj ili drugu-poslednju poziciju. Ako Reputation < 6 kad stigneš, Guncati venue vas ne prima (Reputation gate).

## Završeci

**"Turneja Legenda"** (Budžet>2000, Reputation≥9, Reach≥40):
> Pet gradova. Pet publi. Jedan momentum. Vidimo se sledeće sezone.
> (Unlockuje Prestige mod: nova turneja sa Reputation buff-om ali manjim budžetom)

**"Završeno i Plaćeno"** (Budžet>500, Reputation 6–8):
> Nisu svi eventi bili savršeni. Ali svi su se desili.
> (Standard ending — možeš odmah da počneš novu turneju)

**"Porez i Dug"** (Budžet<0):
> Muzika je bila dobra. Račun nije.
> (Fail state — učiš routing i cost optimization za sledeći run)

**"Guncati Zatvoren"** (Reputation<6 na finalnoj destinaciji):
> Dolazite do kapije. Brana kaže ne može.
> (Reputation gate fail — Guncati venue locked. Najteži fail da se izbegne.)

## Prestige Loop

Posle "Turneja Legenda" ending:
- Reset: budžet na 2500 EUR (manji start)
- Trajni bonus: Reputation počinje na 2 (ne 0)
- Nova mehanika: "Fan Database" — određen broj publike iz prethodnih gradova automatski dolazi u sledeće (raste sa prestige nivoima)
- Difficulty: nova run dodaje 1 random "event crisis" po gradu (proboj vodovoda u klubu, kasni pa nema zvuka, krizni intervju za medije)

## Vizuelna Estetika

**Paleta:** Putna mapa na tamnoj podlozi. Gradovi kao ikonice. Svaki grad — svoja boja akcentuacije.
- Beograd: #E63946 (crveno)
- Novi Sad: #2EC4B6 (teal)
- Niš: #F77F00 (narandžasto)
- Sarajevo: #A8DADC (svetloplavo)
- Guncati: #52B788 (zeleno)

CSS DOM layout (ne Canvas). Mapa kao flex grid. Micro-odluke kao card UI sa fade-in animacijom.

**Font:** Bold grotesque (system-ui). Veliku slova za grad, manje za resurse.
**Audio:** Road-trip mood → pre-event tenzija → post-event resolve. Web Audio generisano.

## Brand Connection

- **Kluboslavija:** Direktno prikazuje iskustvo organizatora Turneja 2026 — 5 gradova, realni izazovi. Content hook: "Odigraj turneju pre nego što je organizujemo." Promo asset za jesensku kampanju.
- **MKDSLend:** "Zabavni Radni Park" brand — ovo je radni park u formi igre. Gameplay = stvarni posao organizatora.
- **Guncati:** Finalni grad = Guncati imanje. Reputation gate naglašava da Guncati nije za svakoga — selektivan, specijalan.

## Targetirana Dužina Sesije

12–18 minuta (jedan run). Prestige: 8–12 min (brži jer znaš routing).

## Procena Modula

| Kategorija | Moduli | Primeri |
|------------|--------|---------|
| Entities | 6 | city.js, crew_member.js, venue.js, event.js, crisis.js, fan.js |
| Systems | 9 | routing.js, budget.js, reputation.js, crew_mood.js, decision_engine.js, progression.js, prestige.js, reach.js, random_events.js |
| Render | 4 | render.js, map_renderer.js, card_ui.js, hud.js |
| Content | 5 | cities_data.js, decisions_data.js, endings_data.js, aforizmi.js, brand_hooks.js |
| Core | 3 | main.js, config.js, state.js |
| Audio | 1 | audio.js |
| Share | 1 | share.js |
| Input | 1 | input.js |
| Styles | 4 | base.css, ui.css, map.css, theme.css |
| **Ukupno** | **34** | ≥25 ✅ |
