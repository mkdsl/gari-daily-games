# Game Design Document — Kluboslavija Pasoš

> **Projekt:** Kluboslavija Pasoš  
> **Tip:** Meta-collection experience / Inter-game progression layer  
> **Sezona:** GDG 2026  
> **Autor sekcije:** Mile Mehanika (Game Designer)  
> **Datum:** 2026-05-10  
> **Status:** v1.0 — ready for implementation

---

## Sinopsis

Kluboslavija Pasoš nije igra — to je sistem koji prati igrača kroz GDG sezonu 2026. Vizuelna metafora fizičkog pasoša: bordo korice, zlatni tisak, krem stranice. Svaka igra ostavlja pečat. Dovoljno pečata — nagrada.

Komunikacioni princip: uvek **"Otvori Pasoš"**, nikad "Igraj Pasoš".

Targetirana sesija:
- **Prva poseta:** 3–5 minuta
- **Povratna poseta:** 30–60 sekundi

---

## 1. State Machine UI

### Stanja

| State ID | Opis | Entry trigger |
|---|---|---|
| `COVER_CLOSED` | Korice zatvorene, početno stanje | App load (nije first visit) |
| `OPENING` | Animacija otvaranja booklet-a | Klik na korice / auto pri first visit |
| `PASSPORT_MAIN` | Pregled stranica, grid pečata | Po završetku `OPENING` animacije |
| `STAMP_DETAIL` | Tooltip/modal detalja pečata | Klik na pečat u `PASSPORT_MAIN` |
| `REWARD_UNLOCK` | Animacija otključavanja nagrade | Threshold dostignut (3/5/7 pečata) |
| `ONBOARDING` | 3-frame sekvenca pri prvoj poseti | First visit (nema `pasos_visited` u localStorage) |
| `EXPORT_MODAL` | JSON export/import dijalog | Klik na "Izvezi/Uvezi" dugme |

### Tranzicije

```
[ONBOARDING] ──(frame 3 done)──► [OPENING]

[COVER_CLOSED] ──(user click)──► [OPENING]

[OPENING] ──(animation end, ~800ms)──► [PASSPORT_MAIN]

[PASSPORT_MAIN] ──(stamp click)──► [STAMP_DETAIL]
[PASSPORT_MAIN] ──(reward threshold met)──► [REWARD_UNLOCK]
[PASSPORT_MAIN] ──(export click)──► [EXPORT_MODAL]

[STAMP_DETAIL] ──(close/ESC/backdrop)──► [PASSPORT_MAIN]

[REWARD_UNLOCK] ──(animation end, ~2000ms)──► [PASSPORT_MAIN]

[EXPORT_MODAL] ──(close/ESC/backdrop)──► [PASSPORT_MAIN]
[EXPORT_MODAL] ──(import success)──► [PASSPORT_MAIN] + reload stamps
```

### Napomene

- `ONBOARDING` se prikazuje samo jednom — nakon prolaska, `pasos_visited: true` se zapisuje u localStorage
- `REWARD_UNLOCK` se trigeruje samo jednom po threshold nivou — zapisuje se koji su rewards već prikazani
- Ako igrač dođe sa novim pečatom (via SDK redirect), app se otvara direktno u `OPENING` → `PASSPORT_MAIN` → auto-focus na novi pečat

---

## 2. Stamp Registry

### Format pečata

```json
{
  "slug": "string (kanonski identifikator, bez datuma, kebab-case)",
  "display_name": "string (ime za prikaz korisniku)",
  "color": "#RRGGBB",
  "claim_type": "manual | auto",
  "game_url": "string (URL igre)",
  "event_date": "YYYY-MM-DD",
  "description": "string (kratki tooltip, max 80 chars)"
}
```

### Retroaktivni pečati (claim_type: manual)

#### avala-run

```json
{
  "slug": "avala-run",
  "display_name": "Avala Run",
  "color": "#2D6A4F",
  "claim_type": "manual",
  "game_url": "https://mkdsl.github.io/gari-daily-games/games/2026-05-06-avala-run/",
  "event_date": "2026-05-06",
  "description": "Pretrčao Avalu. Endless runner, nema kraja — samo rekord."
}
```

#### aforizam-generator

```json
{
  "slug": "aforizam-generator",
  "display_name": "Aforizam Generator",
  "color": "#1B3A6B",
  "claim_type": "manual",
  "game_url": "https://mkdsl.github.io/gari-daily-games/games/2026-05-08-aforizam-generator/",
  "event_date": "2026-05-08",
  "description": "Generisao mudrost. Ili besmislicu. Svejedno — pečat je zaslužen."
}
```

#### dj-za-pultom

```json
{
  "slug": "dj-za-pultom",
  "display_name": "DJ za Pultom",
  "color": "#6B2FA0",
  "claim_type": "manual",
  "game_url": "https://mkdsl.github.io/gari-daily-games/games/2026-05-09-dj-za-pultom/",
  "event_date": "2026-05-09",
  "description": "Pustio muziku. Stekao fanova. Idle majstor."
}
```

### Format za buduće pečate (claim_type: auto)

```json
{
  "slug": "naziv-igre",
  "display_name": "Naziv Igre",
  "color": "#RRGGBB",
  "claim_type": "auto",
  "game_url": "https://mkdsl.github.io/gari-daily-games/games/YYYY-MM-DD-naziv-igre/",
  "event_date": "YYYY-MM-DD",
  "description": "Kratki opis, max 80 karaktera."
}
```

### Prazni slotovi — coming soon

Svaki pečat koji ima `event_date` u budućnosti prikazuje se kao:
- Krug u boji pečata, 30% opacity
- **Naziv igre** (display_name) vidljiv
- **Okvirni datum** ispod naziva
- "COMING SOON" ribbon (dijagonalno, zlatna boja)
- **Ne** prazan krug bez informacija

---

## 3. Reward System

### Pragovi i nagrade

| Pečata | Nagrada | localStorage ključ |
|---|---|---|
| 3 | Avatar Frame | `pasos_reward_frame: true` |
| 5 | Badge | `pasos_reward_badge: true` |
| 7 | Crew Member | `gdg_crew_member: true` |

### Reward 1 — Avatar Frame (3 pečata)

**Animacija:**
- Trajanje: 1500ms ukupno
- Faze:
  1. `0–300ms` — zlatni prsten se pojavljuje oko pasoša (scale 0→1, ease-out-back)
  2. `300–900ms` — zlatni prsten pulzira (scale 1.05→1.0, 2 puta, ease-in-out)
  3. `900–1200ms` — avatar frame se materijalizuje u gornjem desnom uglu
  4. `1200–1500ms` — tekst "Avatar Frame otključan!" fade-in
- Easing: `cubic-bezier(0.34, 1.56, 0.64, 1)` za pojavu, `ease-in-out` za pulziranje

**localStorage zapis:**
```json
{ "pasos_reward_frame": true, "pasos_reward_frame_date": "YYYY-MM-DD" }
```

**UI posle unlock-a:**
- Zlatni prsten ostaje vidljiv oko avatar placeholder-a (persistent)
- Tooltip na hover: "Avatar frame dostupan za preuzimanje"

### Reward 2 — Badge (5 pečata)

**Animacija:**
- Trajanje: 2000ms ukupno
- Faze:
  1. `0–400ms` — ekran blago tamni (overlay 0→40% opacity)
  2. `400–800ms` — badge pada odozgo, bounce easing
  3. `800–1400ms` — badge rotira 360°, zlatna aura se širi
  4. `1400–2000ms` — badge se smešta u kolekciju, tekst "Clubs Badge zaslužen!"
- Easing: `cubic-bezier(0.175, 0.885, 0.32, 1.275)` za bounce

**localStorage zapis:**
```json
{ "pasos_reward_badge": true, "pasos_reward_badge_date": "YYYY-MM-DD" }
```

**UI posle unlock-a:**
- Nova stranica u pasošu: "Dostignuća" — badge se prikazuje tu (persistent nova stranica)
- Badge ikona u navigaciji pasoša

### Reward 3 — Crew Member (7 pečata)

**Animacija:**
- Trajanje: 3000ms ukupno
- Faze:
  1. `0–500ms` — pasoš se zatvara (reverse OPENING animacija)
  2. `500–1000ms` — korice se transformišu, zlatni tisak postaje intenzivniji
  3. `1000–1800ms` — nova stranica se pojavljuje sa sertifikatom: "Član Posade"
  4. `1800–2500ms` — tekstualni podaci popunjavaju sertifikat (typing easing)
  5. `2500–3000ms` — pečat "ODOBREN" udara na sertifikat (sfx_stamp)
- Easing: `ease-in-out` za globalne tranzicije, `steps(1)` za typing efekat

**localStorage zapis:**
```json
{ "gdg_crew_member": true, "pasos_reward_crew_date": "YYYY-MM-DD" }
```

**UI posle unlock-a:**
- Sertifikat stranica postaje permanentna poslednja stranica pasoša
- Korice dobijaju zlatnu borduru (dodatna CSS klasa `passport--crew`)
- Tooltip na koricama: "Član GDG Posade 2026"

---

## 4. `pasos-sdk.js` — Interfejs specifikacija

### Exports

```js
/**
 * Utisni pečat u pasoš korisnika.
 * @param {string} slug - Kanonski slug iz whitelist-a
 * @param {Object} [options]
 * @param {number} [options.score] - Score postignut u igri
 * @param {number} [options.level] - Level dostignut
 * @param {string} [options.date] - ISO datum (default: today)
 * @returns {{ success: boolean, error?: string }}
 */
export function utisniPecat(slug, options = {}) {}

/**
 * Provjeri da li korisnik ima određeni pečat.
 * @param {string} slug
 * @returns {boolean}
 */
export function imaPecat(slug) {}

/**
 * Provjeri da li je korisnik GDG Crew Member (7 pečata).
 * @returns {boolean}
 */
export function getCrew() {}
```

### Slug whitelist

```js
export const SLUG_WHITELIST = [
  "avala-run",           // 2026-05-06, Avala Run
  "aforizam-generator",  // 2026-05-08, Aforizam Generator
  "dj-za-pultom",        // 2026-05-09, DJ za Pultom
  // Dodaj novi slug ovde pri svakoj novoj igri u pipeline-u
];
```

### localStorage format (po slug-u)

```js
// Ključ: `pasos_stamp_${slug}`
// Vrednost: JSON string
{
  "slug": "avala-run",
  "claimed": true,
  "method": "manual" | "auto",
  "date": "2026-05-10",          // ISO datum claiminga
  "score": 4200,                  // opciono
  "level": 3,                     // opciono
  "sdk_version": "1.0"
}
```

### Error handling

```js
// Ako slug nije u whitelist:
utisniPecat("nepostojeca-igra");
// returns: { success: false, error: "UNKNOWN_SLUG: nepostojeca-igra" }
// NE baca exception — uvek vraća objekat
// Console.warn sa porukom za debugging

// Ako je pečat već utisnut:
utisniPecat("avala-run");
// returns: { success: false, error: "ALREADY_CLAIMED: avala-run" }
// Idempotentno — ne briše prethodni zapis

// Ako localStorage nije dostupan (private mode, storage full):
// returns: { success: false, error: "STORAGE_UNAVAILABLE" }
// Silent fail — korisnik ne vidi grešku, samo nema pečata
```

### Primer implementacije (pseudokod)

```js
import { SLUG_WHITELIST } from './pasos-sdk.js';

// U igri, po završetku:
const result = utisniPecat('avala-run', { score: 4200 });
if (result.success) {
  // Prikaži banner: "Pečat dodat u Pasoš!"
  // Dugme: "Otvori Pasoš" → link na pasoš
}
```

---

## 5. Export/Import JSON format

### Export struktura

```json
{
  "version": "1.0",
  "exported": "2026-05-10T14:30:00.000Z",
  "profile": {
    "name": "Korisničko ime",
    "created": "2026-05-10T10:00:00.000Z"
  },
  "stamps": {
    "avala-run": {
      "claimed": true,
      "date": "2026-05-10",
      "method": "manual",
      "score": 4200,
      "level": null
    },
    "aforizam-generator": {
      "claimed": true,
      "date": "2026-05-10",
      "method": "manual",
      "score": null,
      "level": null
    },
    "dj-za-pultom": {
      "claimed": false
    }
  },
  "rewards": {
    "frame": {
      "unlocked": true,
      "date": "2026-05-10"
    },
    "badge": {
      "unlocked": false,
      "date": null
    },
    "crew": {
      "unlocked": false,
      "date": null
    }
  }
}
```

### Import logika

**Prihvata se:**
- `version` == `"1.0"` (ili kompatibilna buduća verzija)
- Slugovi koji postoje u trenutnom `SLUG_WHITELIST`
- `claimed: true` zapisi — importuju se direktno u localStorage
- `rewards` koji su logički konzistentni (ne može biti badge bez frame)

**Odbacuje se (silent ignore, ne greška):**
- Slugovi koji nisu u `SLUG_WHITELIST` — preskakaju se
- `version` koji je noviji od trenutnog — prikazuje se warning: "Fajl je iz novije verzije Pasoša"
- `version` koji nedostaje — odbacuje se ceo import
- Rewards koji nisu konzistentni sa brojem pečata — recalculate

**Import UX flow:**
1. Korisnik uploaduje JSON
2. Validacija (version, struktura)
3. Preview: "Naći smo X pečata i Y nagrada. Uvesti?"
4. Potvrda → merge sa trenutnim stanjem (nikad briše postojeće)
5. Toast: "Uvoz završen. X novih pečata dodato."

**Merge strategija:** Import nikad ne briše postojeće pečate — samo dodaje nove.

---

## 6. Pacing i Sesija

### Prva poseta (3–5 minuta)

| Vreme | Šta se dešava | State |
|---|---|---|
| `0:00–0:30` | Onboarding animacija (3 frame-a: prazan pasoš → pečat pada → pasoš popunjen) | `ONBOARDING` |
| `0:30–1:30` | Igrač gleda stranice, otkriva pečate, čita opise | `PASSPORT_MAIN` |
| `1:30–3:00` | Retro claim za prošle igre — svaki klik otvara modal sa micro-copy | `STAMP_DETAIL` → back |
| `3:00–5:00` | Reward animacija (ako threshold), screenshot, share | `REWARD_UNLOCK` → `PASSPORT_MAIN` |

**Onboarding — 3 frame-a:**
1. **Frame 1:** Prazan pasoš, korice se otvaraju — "Dobrodošao u Kluboslaviju"
2. **Frame 2:** Jedan pečat pada na stranicu — "Svaka igra ostavlja trag"
3. **Frame 3:** Pasoš sa više pečata — "Skupi ih sve. Postani Posada."

### Povratna poseta (30–60 sekundi)

| Vreme | Šta se dešava | State |
|---|---|---|
| `0:00–0:30` | Direktno na novi pečat (highlight, pulsira) — nema onboardinga | `PASSPORT_MAIN` |
| `0:30–1:00` | Unlock animacija ako je threshold dostignut | `REWARD_UNLOCK` |
| `1:00+` | Screenshot, odlazi | `PASSPORT_MAIN` |

### Retro claim micro-copy

Kada igrač klikne "Uzmi pečat" za retroaktivnu igru, prikazuje se:

> *"Ovo je na tvoju savest — pečat se ne može poništiti."*

Dugmad: **[Da, bio/la sam tamo]** | [Odustani]

Nema verifikacije. Sistem veruje igraču.

---

## 7. Audio Spec

> Sekcija za: **Ceca (Audio Designer)**

Svi zvukovi su opcioni. Implementacija via Web Audio API. Ukupno: maksimalno 5 zvukova, svaki < 3 sekunde.

| Event ID | Opis | Karakteristike | Trajanje |
|---|---|---|---|
| `sfx_open` | Otvaranje pasoša | Flip knjige, papir na papiru, ambijentalno | ~600ms |
| `sfx_stamp` | Pečat na papir | Gumeni thunk + kratki echo, "thwump" | ~400ms |
| `sfx_unlock` | Nagrada otključana | 2–3 note fanfar, lo-fi, vintage feel | ~1200ms |
| `sfx_hover` | Hover nad pečatom | Pero na papiru, jedva čujno, subliminalno | ~150ms |
| `sfx_export` | Export/download | Zvuk štampača, kratko, mehanički | ~800ms |

**Tehničke napomene:**
- Sve zvuci mogu biti `null` — silent fail
- Ne blokiraj UI na audio load
- Preload: samo `sfx_open` i `sfx_stamp`; ostali lazy-load
- Korisnik može mute-ovati sve zvukove (toggle u UI, zapisuje se u localStorage: `pasos_audio_muted: true`)
- Format: `.mp3` sa `.ogg` fallback

---

## 8. Analytics (Out of scope za MVP — definiši event-e)

> Ovi event-i se NE implementuju u v1.0, ali su definisani za buduće verzije.

### Event definicije

```js
// Pasoš otvoren
{ event: "pasos_opened", timestamp: "ISO_DATE", stamp_count: 3 }

// Pečat uzet
{ event: "stamp_claimed", slug: "avala-run", method: "manual"|"auto", timestamp: "ISO_DATE" }

// Nagrada otključana
{ event: "reward_unlocked", level: "frame"|"badge"|"crew", stamp_count: 3, timestamp: "ISO_DATE" }

// Screenshot napravljen
{ event: "screenshot_taken", timestamp: "ISO_DATE" }

// Import/Export
{ event: "pasos_exported", timestamp: "ISO_DATE" }
{ event: "pasos_imported", stamps_added: 2, timestamp: "ISO_DATE" }
```

### MVP tracking (localStorage only)

Za v1.0, zapisivati u localStorage:
```json
{
  "pasos_first_open": "ISO_DATE",
  "pasos_open_count": 7,
  "pasos_last_open": "ISO_DATE"
}
```

---

## 9. Vizuelni sistem

### Boje

| Token | Hex | Upotreba |
|---|---|---|
| `color-cover` | `#4A0E1A` | Korice pasoša |
| `color-gold` | `#C9A84C` | Zlatni tisak, okviri, detalji |
| `color-page` | `#F5ECD7` | Stranice pasoša |
| `color-stamp-avala` | `#2D6A4F` | Avala Run pečat |
| `color-stamp-aforizam` | `#1B3A6B` | Aforizam Generator pečat |
| `color-stamp-dj` | `#6B2FA0` | DJ za Pultom pečat |

### html2canvas — screenshot napomene

**KRITIČNO:** Pre renderovanja screenshota:

```js
await document.fonts.ready;  // obavezno čekanje
// Tek onda pozovi html2canvas
try {
  const canvas = await html2canvas(element);
  // ...
} catch (err) {
  // Silent fail — ne prikazuj error korisniku
  console.warn('Screenshot nije dostupan:', err);
}
```

### Animacija otvaranja

- CSS 3D transform: `rotateY(0deg)` → `rotateY(-180deg)` za levu stranicu
- `perspective: 1000px` na parent elementu
- Trajanje: `800ms`, `ease-in-out`
- `transform-origin: left center`

---

## 10. Tehničke napomene

### Dependencies

- Nula runtime dependencies (vanilla JS)
- `html2canvas` — samo za screenshot feature
- `pasos-sdk.js` — lokalni modul, isporučen uz ovaj GDD

### Browser support

- Chrome/Firefox/Safari (latest 2 versions)
- Mobile: iOS Safari 15+, Android Chrome 100+
- localStorage required — bez njega, silent fail (ne prikazuje se greška, pasoš je prazan)

### File struktura

```
games/2026-05-10-cross-event-pasos/
├── index.html
├── style.css
├── main.js
├── pasos-sdk.js         ← obavezan isporuk
├── stamp-registry.json  ← kanonski podaci pečata
└── docs/
    └── gdd.md           ← ovaj dokument
```

---

## Appendix — Checklist za implementaciju

- [ ] `COVER_CLOSED` state — statična slika korica, klik aktivira `OPENING`
- [ ] `ONBOARDING` — prikazuje se samo jednom, localStorage guard
- [ ] Sva 3 retroaktivna pečata u stamp-registry.json
- [ ] Manual claim flow sa micro-copy "Ovo je na tvoju savest"
- [ ] Prazni slotovi sa coming soon ribbon (ne prazan krug)
- [ ] `pasos-sdk.js` implementiran i exportovan
- [ ] Export/Import JSON feature
- [ ] `document.fonts.ready` pre html2canvas
- [ ] Audio event hookovi (silent fail ako nema fajlova)
- [ ] `gdg_crew_member: true` u localStorage pri 7 pečata
- [ ] Svi reward localStorage zapisi dokumentovani
- [ ] Analytics event-i definisani (ne implementovani u MVP)
