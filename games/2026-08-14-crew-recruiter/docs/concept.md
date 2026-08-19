# Concept — Crew Recruiter: Izgradi Ekipu

> Pre-produced od Iskre 2026-08-11. KORAK 1 kopira direktno u `docs/concept.md`. Ne spawna Iskra agenta.

---

## Naziv

**Crew Recruiter: Izgradi Ekipu**

## Žanr

Mini deck-builder / crew manager — žanr postoji u katalogu (Ekipa Noći, Avala Crew), ovaj koncept mora da se diferencira (vidi sekciju ispod)

## Diferencijacija naspram Ekipa Noći / Avala Crew

1. **Jedan nastup, ne karijera.** Ekipa Noći i Avala Crew grade karijeru/sezonski arc kroz više eventova; Crew Recruiter je zatvoren u JEDAN nastup, jednu noć — nema progresije kroz kalendar.
2. **6 faza jednog eventa u realnom vremenu jedne sesije.** Setup → Soundcheck → Opening → Climax → Breakdown → Recap se odigravaju unutar iste sesije, ne kao multi-event progression kroz dane/nedelje.
3. **Vibe Score je real-time metar unutar sesije, ne kumulativni agregat.** Score raste i pada po fazi, u toku jedne partije — ne Tour/Event Score koji se akumulira kroz više igranja kao u druga dva naslova.

## Premisa

Ti si event organizer sa jednim nastupom koji dolazi. Imaš 5 uloga koje treba popuniti: Tonac, Host, Content Creator, Logistika, Obezbeđenje. Tegleš karte iz špila — svaka karta je čovek sa profilom i snagom. 6 rundi = 6 faza nastupa. Na kraju: Vibe Score (0–100). Igra se završi kad se svih 6 faza odigra ili kad Vibe Score padne na nulu.

## Core Gameplay Loop

1. **Draw** — izvuci 3 karte iz špila (random, 30+ unikatnih karaktera)
2. **Assign** — postavi svaku kartu na jedan od 5 slotova (ili odbaci)
3. **Resolve** — svaki slot generiše ishod zavisno od snage karte + synergy bonusa
4. **Score** — Vibe Score raste ili pada; runda se zaključuje
5. **Repeat × 6** — faze: Setup → Soundcheck → Opening → Climax → Breakdown → Recap
6. **Ending** — Vibe Score + share karta + brand CTA

**Synergy sistem:** komplementarne uloge na susednim slotovima daju bonus (+10–25 Vibe). Npr. Tonac + Logistika = Sound Ready bonus. Host + Content Creator = Buzz bonus. Igrač uči synergy matrice kroz ponavljanje.

## Hook — zašto 15+ minuta

- **First run:** učenje mehanika, otkrivanje karte karaktera (curiosity loop)
- **Second run:** testiranje synergy kombinacija — "šta ako stavim drugačijeg Tonca?"
- **Third run:** unlock — novi set karte za novi event tip (Klub / Outdoor / Intimate)
- **Meta hook:** 3 unlockable crew archetypes (Rookie Crew / Pro Crew / Legendary Crew), svaki sa drugačijim bonus setom
- **Share hook:** Ending screen sa shareable "Moj Crew Score" karticom — "podeli sa pravim organizatorima"

Prosečan igrač odgovori na bar 2 od 3 hooks-a: curiosity + synergy exploration = 12–18 min po sesiji.

## Vizuelna Estetika

**Paleta:** Tamni event underground — `#0d1117` pozadina, `#1a1a2e` card background, `#e8d5b7` tekst (aged paper). Akcentne boje po ulozi: Tonac `#2563eb` (deep blue), Host `#d97706` (golden), Content Creator `#db2777` (magenta), Logistika `#16a34a` (forest green), Obezbeđenje `#dc2626` (brick red).

**Karte:** vintage concert flyer estetika via CSS — torn paper border efekt, serif font za ime karaktera, condensed sans-serif za statistike. Ne treba canvas slikanje — čisti CSS cards sa box-shadow i border-radius.

**UI:** minimalisan — 5 slotova u redu pri dnu, hand od 3 karte pri vrhu, Vibe Score meter centriran. Faza indicator levo. Sve vidljivo na jednom ekranu, mobile i desktop.

**Animacije:** karta draw = slide-in + shake, karta assign = smooth drag/drop ili klik-to-slot, synergy trigger = pulse glow na oba slota + Vibe meter bump. Pera aforizam = fade-in overlay.

## Audio Mood

**Ambijent:** Pre-show underground club — low-fi crowd murmur (Web Audio noise synthesis), sub-bass hum. Pojačava se sa svakom fazom (Setup = tiho, Climax = pun ambijent).

**UI zvukovi (sve generirano, bez .wav):**
- Karta draw: kratki vinyl scratch (high-freq noise burst ~80ms)
- Karta assign: muffled thud (low sine burst)
- Synergy trigger: short bass drop (sub sine 80Hz, ~300ms)
- Vibe drop: feedback squeal (filtered noise)
- Ending screen: applause burst → lake ambijent (za Guncati ending variant)

**Muzika:** nema — ambijent pokriven crowd synthesom. Audio loop drži energiju bez copy-right rizika.

## Win Condition

- **80+ Vibe Score:** "Crew je legenda. August u Guncatiju." → shareable ending karta sa linkom
- **50–79:** "Dobro, može bolje. Sutra novi lineup."
- **< 50:** "Raspao se crew. Pokušaj ponovo." → quick restart CTA

**Bonus ending (unlock posle 3 igara):** Hall of Fame screen sa sve 3 Crew Score-a, shareable kao PNG via html2canvas.

## Brand Serves

- **mkdslend (primary):** event organizer igra = direktan MKDSLend "Zabavni Radni Park" brand fit
- **guncati (tie-in):** ending screen CTA "Pravi tim se gradi na Guncatiju." + link ka opštoj Guncati stranici/kontaktu (ne izmišljen volonterski formular, ne konkretan nepotvrđen event). *Interna napomena za Mici (nije igrivi tekst): mogući launch prozor W34 (17–23.08) — proveriti nedeljni raspored pre posta, taj vikend trenutno ima potvrđenu samo "Restauraciju metalnih sprava" (15–16.08).*
- **kluboslavija (secondary):** karte karaktera su stereotipi DJ turneja scene (Tonac, Host, Security) — prepoznatljivi publici

## Targetirana Dužina Sesije

10–18 minuta po sesiji. 3 sesije za sve unlock-e (oko 45 min ukupno). Potencijal za "još jedan run" = high (kratki run + curiosity loop).

## Prestige / Replay Hook

**Soft prestige (bez reset-a):**
- 3 event tipa unlockable: Klub (default) → Outdoor (unlock posle 5 igara) → Intimate (unlock posle 10)
- Svaki event tip ima drugačiju synergy matricu i card set
- 30+ karte karaktera, draw je random — svaki run drugačiji lineup
- Hall of Fame posle 3 igara (slika shareability)

**Replayability driver:** synergy matrica nije prikazana direktno — igrač je otkriva kroz pokušaj i grešku. "Koji Tonac ide uz ovog Hosta?" = meta-puzzle koji drži pažnju.

## Sadržaj koji treba

- **Pera Period:** 8 mikro-aforizma za synergy unlock momente (npr. "Kad svako zna šta mu je posao, zvuk se sam sredje.")
- **Mile Mehanika:** synergy matrica (5 uloga × 5 event slotova = 25 ćelija) + Vibe Score formula balance pass
- **Dule Dubina:** ending screen CTA review — "pravi tim" poziv ka Guncati volontiranju; etički framing bez manipulacije
- **Ceca Čujka:** Web Audio generisani SFX + crowd ambijent synthesis

## Kompleksnost

3/5 — text-based card UI, CSS cards bez canvas, event-driven JS logika. Jova može brzo. Target: 20–28 modula.

## Napomena za KORAK 4 (impl)

Card drag-and-drop: koristiti pointer events API (touch + mouse unified), ne jQuery. Karte su DOM elementi, ne canvas sprites — lakše za accessibility i CSS animacije. State: `game_state.hand[]`, `game_state.slots[5]`, `game_state.vibe_score`, `game_state.phase_index`. Save u localStorage posle svake runde (ne posle svakog dropa — prečesto za storage quota).

---

## Ending Screen UI Spec (Iskra, 2026-08-13 — za Jovu impl sesiju)

Mici koristi screenshot ending screena kao POST 1 visual na launch dan (~21.08). Jova gradi ovo po spec-u — ne improvizuje.

### Layout

Format: square (1:1 ratio, 1080×1080 logički, CSS `aspect-ratio: 1`). Full-bleed pozadina u Guncati earthy paleti (iz `styles/theme.css` — ne dodavati nove boje).

```
┌─────────────────────────┐
│  [mali label] Vibe Score │
│                          │
│         [SCORE]          │  ← font-size: min(72px, 15vw). Bold.
│         80/100           │
│                          │
│  "Crew je spreman."      │  ← score-gated tagline (ispod)
│                          │
│  Pravi tim se gradi      │
│  na Guncatiju.           │
│                          │
│  [SHARE dugme]           │
│  Probaj: [play_url]      │  ← mali, jedan red
└─────────────────────────┘
```

### Score-gated tagline (3 varijante)

- Score ≥ 80: `"Crew je spreman. Svi znaju šta im je posao."`
- Score 50–79: `"Solidno. Malo još rada na sinergiji."`
- Score < 50: `"Sutra probaj ponovo. Crew se gradi vremenom."`

### Web Share API payload (`src/share.js`)

```js
const PLAY_URL = 'https://mkdsl.github.io/gari-daily-games/games/YYYY-MM-DD-crew-recruiter/';

navigator.share({
  title: `Crew Recruiter — Vibe ${vibeScore}/100`,
  text: `Izgradi svoju ekipu za nastup. Moj score: ${vibeScore}/100.\nProbaj: ${PLAY_URL}`,
  url: PLAY_URL
});
```

Fallback (bez Web Share API): ceo `text + '\n' + PLAY_URL` string ide u `navigator.clipboard.writeText()` → toast "Link kopiran, podeli ga!"

### Pristupačnost

- Share dugme: `aria-label="Podeli svoj Crew Recruiter score"`
- Score element: `aria-live="polite"` kad se finalni score renderuje

### Napomena za Mici

Screenshot ending screena (score ≥ 80 varijanta) = POST 1 visual. Nema edit-a. Mici snima sa desktop-a ili šef šalje print-screen posle prvog igranja.
