# Concept: Dan Posle

**Naziv:** Dan Posle
**Žanr:** Narrative choice / community builder
**Datum:** 2026-09-11
**brand_serves:** guncati, kluboslavija

## Premisa

Jutro je 07:00. Festival na Guncati imanju je završen. Niste spavali. Polje izgleda kao da je bila oluja. Nekolicina gostiju još uvek spava na tendi. Komšija je već jednom pozvao.

Ti si organizator. Imaš 12 sati da zatvoriš ovaj dan — i odlučiš šta od juče gradi nešto, a šta samo nestaje.

## Core Gameplay Loop

**Temporalni grid:** 07:00–19:00, 12 jednočasovnih slotova.
Svaki slot nudi 1-2 micro-odluke iz nasumičnog seta odluka vezanih za sat dana.
Svaka odluka menja **4 resursa:**

| Resurs | Raspon | Opis |
|--------|--------|------|
| Energija | 0–10 | Organizatorova fizička/mentalna rezerva |
| Veze | 0–10 | Kvalitet odnosa sa zajednicom (volonteri, komšije, gosti, mediji) |
| Sećanja | 0–10 | Koliko trenutaka je dokumentovano/podeljeno (ne materijalno) |
| Nered | 10–0 | Fizičko stanje imanja (10 = pun haos, 0 = počišćeno) |

**Win condition:** Do 19:00 dostići "Community Score" = Veze + Sećanja − (Nered/2).

## Micro-Odluke (primer po satu)

- **07:00** — Volonter propustio autobus. Voziš do stanice (Energija−2, Veze+3) / nočevaće još noć (Nered ostaje, Veze+2) / predlažeš taksi (neutralno).
- **08:00** — Komšija Slavko poziva: jutros je buka bila do 2:00. Izvinjavaš se odmah (Veze+2, Energija−1) / kazeš "dođi na kafu sutra" (Veze+3, Energija−2) / kažeš "proveravam i javljam" (Energija saved, Veze−1 pending).
- **09:00** — Novinarka lokalnog portala hoće kratku priču. Daješ 20 min (Sećanja+2, Energija−3) / odbijaš (neutralno) / šalješ je ka Brani kao licu imanja (Sećanja+1, Veze+1, Energija−1).
- **11:00** — Pronalazaš fotoaparat bez vlasnika na polju. Čuvaš u kancelariji (Sećanja+1) / objaviš FB story odmah (Veze+2, Energija−1) / ostaviš na vidnom mestu sa papirićem (Veze+1).
- **13:00** — Poslednji kamp-gost traži da ostane još 2 dana. Da (Veze+3, Nered ostaje 2h duže) / Ne (Nered−2, neutralno Veze) / "u redu, ali pomogneš s čišćenjem" (Nered−1, Veze+2).
- **15:00** — Jova/Mici šalju poruku: "Radimo Instagram recapp, hoćeš quote za stories?" Da — 3 rečenice (Sećanja+2, Energija−2) / Da — šalješ aforizam koji si sačuvao (Sećanja+1, Energija−0) / Ne, to čeka (neutralno, Sećanja lost forever).
- **17:00** — Retrospektiva: član tima hoće da sednu i prođete kroz šta je radilo, šta nije. Sada (Sećanja+3, Energija−4) / za nedelju (Sećanja+1 later) / pitaš svakog zasebno u DM-u (Veze+2, Sećanja+1, Energija−3).

Ukupno: ~30 odlučnih nodova, ~60 decision choices, 12 sati, 3 završetka.

## Završeci

**"Zajednica nastaje"** (Veze≥8, Sećanja≥5):
> Nije kraj. Ovo je osnova. Neko će zvati za sledeće leto — i ovog puta nije fraza.

**"Dobar posao"** (Community Score 6–10):
> Sve je čisto. Sve je zatvoreno. Sve si uradio sam. Malo je tužno, ali to je tvoja metoda.

**"Sledeće leto"** (Community Score <6, ali Energija>3):
> Napravio si obećanja koja valja čuvati. Otvaraš notepad. Pišeš ime.
> (Prestige unlock — novi run, pamti "obećanja" iz prošlog.)

## Vizuelna Estetika

**Paleta:** Jutarnje svetlo → podnevna toplina → sumrak. CSS background-color transition po satu (07:00 = #2a1a0e, 13:00 = #5c3d1e, 19:00 = #1a0a05). Tekst beli. Bez Canvas — čist DOM text layout.
**Font:** Serif (Georgia fallback). Odluke u card-stilizovanim div-ovima, resursi u fiksnom HUD-u gore.
**Audio mood:** Jutarnja tišina → ptice → popodnevno ljetovanje → veče. Web Audio generisano.

## Brand Connection

- **Guncati:** Zatvara narativni luk (Festival Mreža → Avala Crew → Guncati Grand → Dan Posle). Repozicionira Guncati od "event-place" ka "zajednica koja ostaje."
- **Kluboslavija:** Organizator-perspektiva je šefova perspektiva — "ovo je ono što se dešava iza scene." Content hook za afterparty story serijal.

## Targetirana Dužina Sesije

10–15 minuta (jedan prolaz). Prestige replay: 5–8 min (brži jer pamti okvirno koji sati su teži).

## Procena Modula

| Kategorija | Moduli | Primeri |
|------------|--------|---------|
| Entities | 5 | characters.js, organizer.js, event_aftermath.js, location.js, item.js |
| Systems | 8 | decision_engine.js, timer.js, resource_manager.js, narrative_state.js, endings.js, achievements.js, prestige.js, event_selector.js |
| Render | 4 | render.js, ui.js, atmosphere.js, transitions.js |
| Content | 5 | decisions.js, dialogue.js, characters_data.js, endings_data.js, aforizmi.js |
| Core | 3 | main.js, config.js, state.js |
| Audio | 1 | audio.js |
| Share | 1 | share.js |
| Styles | 4 | base.css, ui.css, atmosphere.css, theme.css |
| **Ukupno** | **31** | ≥25 ✅ |
