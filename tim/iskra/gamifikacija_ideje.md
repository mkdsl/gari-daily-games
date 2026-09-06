# GDG Gamifikacija Ideje — Iskra (cross-repo bridge)

> Ovaj fajl je most između `ajajaj/tim/iskra/` (Iskrin primarni repo) i GDG pipeline-a.
> GDG CLAUDE.md KORAK 1 referencuje ovaj fajl kao input — postojao je samo u ajajaj, ne ovde.
> Fix: 2026-08-03 Iskra autorun. Kompletan katalog: `ajajaj/tim/iskra/gamifikacija_ideje.md`.
> Ovde su SAMO prioritetne stavke za sledeći slot.

---

## ~~CREW RECRUITER~~ — released 2026-08-14, nije prioritet

> Crew Recruiter je released. Ne pipeline-uj ponovo.

---

## ~~JESENJI TOK~~ — released 2026-09-06, nije prioritet

> Jesenji Tok je released (post_fix_score: 9.0, beta_score_iter2: 8.5). Ne pipeline-uj ponovo.

---

## PRIORITET #1 — Dan Posle (narrative choice / community builder)

> Ažurirao: Iskra autorun 2026-09-06 — Jesenji Tok released, Dan Posle je sledeći slot (22:00 CET danas, gdg-concept-trigger). Brief je kompletan u `ajajaj/tim/iskra/2026-09-04.md`.

**Status:** CONCEPT READY — kompletna concept.md u `ajajaj/tim/iskra/2026-09-04.md` (ajajaj repo), direktno kopirati kao `docs/concept.md`. Ne spawna Iskru agenta.
**Sezonski prozor:** Evergreen — posle Guncati Grand (released 07-26), pre Dan Posle. Radi u jesen.
**Žanr:** Narrative Choice / Community Builder — NOVO za GDG (micro-odluke, state machine, 4 endings)
**Session target:** 10–15 min (3 playthroughs za sve završetke)
**Brand serves:** guncati (primary — zatvara narativni luk Guncati serije), kluboslavija (secondary)
**Modul count:** 30 modula (core 3 + entities 4 + systems 6 + ui 6 + content 7 + styles 4)

**Kopiranje iz ajajaj repo:** Uzmi sekciju od `### NAZIV: Dan Posle` do kraja `### PRESTIGE HOOK` iz `ajajaj/tim/iskra/2026-09-04.md` i paste direktno kao `docs/concept.md`. Dodaj YAML header: `# Dan Posle — Concept`. Ne spawna Iskra agenta.

---

## PRIORITET #2 — Put do Guncata (point-and-click narativna avantura, road trip)

> Originalno PRIORITET #1 (Iskra 2026-08-08), premešten 2026-08-10 — Crew Recruiter ima konkretniji W34 tie-in. Put do Guncata ostaje evergreen — funkcioniše u septembru ili nakon Crew Recruitera.

**Status:** CONCEPT READY — skeleton u nastavku, direktno za KORAK 1 → docs/concept.md
**Urgentnost:** Evergreen Guncati companion. Pre-event narativ bez sezonskog expiry-a.
**Žanr:** Text/narrative adventure (point-and-click lite) — nije rađeno od Niš Fuge (01.06, 2 meseca).
**Session target:** 15–20 min
**Brand serves:** guncati (primary), kluboslavija (secondary)

### Premisa

Igrač putuje od Beograda do Guncatija u 5 etapa. Svaka etapa ima kratku narativnu scenu + mini-mehaniku. Na kraju: dolazak na jezero + shareable "Na sam putu" karta. Svaki run otkriva drugu stranu Guncatija (jezero, ribe, glineni zidovi, muzika).

### Core loop (5 etapa, linearno)

1. **Beograd Parkijalište** — timing puzzle: nađi parking pre meter istekne (60s). Pera Period aforizam u "radio" overlay-u dok čekaš.
2. **Autoput E75** — resource balance: gorivo (tank decay), vreme (clock), muzika (radio stanica menja mood). 3 minuta "vožnje" sa random event-om (gužva, pojačanje, izlaz-greška).
3. **Skretanje u selu** — navigation choice: 3 tabla, 3 puta (brže / slikovitije / sigurnije). Svaki vodi drugačijoj etapi 5 sceni. Igrač ne zna unapred.
4. **Šumski put** — obstacle dodge: šarafi, blato, grane u 90-sekundnoj mikro-sekciji. Mobile-friendly tap/swipe.
5. **Guncati Jezero — dolazak** — narativni epilog baziran na kumulativnim izborima (šta si poneo, koliko si gorivo potrošio, koji put si izabrao). 3-4 varijante scene. Aforizam za završnicu.

### Win condition i Pripremljenost sistem

- Svaka etapa dodaje/oduzima "Pripremljenost" bod (0–100)
- Dolazak sa ≥ 70 → zelena scena "Stigao si spreman. Guncati te čeka."
- 40–69 → žuta scena "Stigao si. Odmori se malo."
- < 40 → humorna scena "Sledećeg puta, možda mapa?"
- Sve tri varijante otključavaju shareable kartu

### Share card (svaki ishod)

"Na sam putu ka Guncatiju. Pripremljenost: [score]%. [play_url]"  
Web Share API sa pozivom na akciju + link. Screenshot spreman za IG Story.

### Brand hooks

- Etapa 3 (skretanje): jedna ruta prolazi pored Brane koji kratko objašnjava akvakulturni sistem (3 linije, ne tutorial)
- Etapa 5 (dolazak): finalni aforizam od Pere Perioda, specijalan po putu koji si izabrao
- Guncati Grand crosslink: zeleni ishod prikazuje "Odigraj Guncati Grand" prompt (→ play_url Guncati Grand)

### Audio (Ceca Čujka)

- Etapa 1-2: city ambience → highway hum → radio (Pera Period citat kao "pesma")
- Etapa 3-4: šuma zvukovi, živinstvo, zemlja
- Etapa 5: jezero ambience, ptice, tiha muzika kao Guncati Grand theme

### Vizuelni identitet (Pera Piksel)

- Letnji, topao, ilustrativan CSS. Ne fotorealistično.
- Paleta: #1e2d1a (tamna šuma) / #f5d87a (sunce/žito) / #3a8c5c (jezero/polja) / #e8dcc8 (zemlja/put)
- Svaka etapa ima drugačiji background color-scheme (grad → drumski / šuma → polje → jezero)
- Karakteri: 2-3 CSS sprite-a (Brana, random putnik, Pera aforizmator)

### Prestige hook

Drugi run otključava "Noćna vožnja" varijantu etape 2 (autoput noću) i drugačiju verziju etape 5 (večernji dolazak na jezero). Svaki run vredi.

### Scope procena

~22–28 modula, 6000–8000 JS linija, single-layer narativna avantura, 2-3 dana pipeline

---

## ARHIVA — Berba Trka (timing/rhythm, Guncati × Kluboslavija)

> **Status: HOLD DO 2027** — berba window 2026 istekao 06.08. Koncept validan, vrati u PRIORITET u julu 2027 (berba sezona → 04–06.08 svake godine). Brief fajl: `tim/iskra/berba_trka_gdg_brief.md`.

---

## Backlog (iz ajajaj)

→ Za kompletan katalog sa statusom (✅ isporučeno / kandidat): `ajajaj/tim/iskra/gamifikacija_ideje.md`

**Sledeći kandidati posle Put do Guncata:**
- Sound Check Simulator (pred Niš žurku kad datum padne)
- Park Mapa (retry — 2× pokušan, 0 JS do sad; tek kad ima jači brand hook)
