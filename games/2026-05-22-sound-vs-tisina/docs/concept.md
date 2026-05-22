# Sound vs Tišina — Concept

> Autor koncepta: Iskra Ivanović
> Datum: 2026-05-22
> Stage: Concept

---

## Naziv i žanr

**Sound vs Tišina**
Žanr: Balance Puzzle / Acoustic Simulator / Career Manager
Podžanr: Multi-layer sim, edukativna mehanika, promoter karijera

---

## Premisa (2-3 rečenice)

Ti si promoter koji uči zanat od nule. Svaki događaj je isti zadatak drugačijim rečnikom: podesi zvuk tako da dance floor živi — a susedi spavaju. SPL fizika, 8 terena, jedna karijera od lokalnog šumskog sata do Avala open-air finale 20. juna.

---

## Core gameplay loop (korak po korak)

1. **Izaberi venue** (Macro) — iz kataloga dostupnih lokacija za tu sezonu. Svaka lokacija ima parametre: veličina, tip terena, susedna zona, vremenski uslovi, slot (noć/dan).
2. **Planiranje opreme** (Macro) — rasporedi budžet na audio opremu. Kupuješ zvučnike, barijere, monitoring, dozvole. Budžet određuje broj i snagu zvučnih zona.
3. **Heatmap raspored** (Micro) — na tlorisu terena vidiš dance floor (zelena), buffer zone i sused (crvena). Postavljaš zvučne izvore po zonama.
4. **SPL kalibracija** (Micro) — per-zona slideri (50–115 dB). Vidis real-time heatmap propagacije. Susedova kuća mora ostati ispod 70 dB. Dance floor mora biti iznad happiness praga.
5. **Noć počinje** — dolaze eventi: iznenadni vjetar, publika raste, neko se žali. Ti reaguješ korekcijama slajdera u realnom vremenu.
6. **Kraj evenita** — rezultat. Reputation score sa dve poluge: publika (happiness) + susedi (buka complaints). Zaradiš XP i cash.
7. **Karijera napreduje** — otključavaš sledeći venue, bolju opremu, nove izazove.

---

## Multi-layer dizajn

### Macro layer — Event Season Manager

- Biraj venue iz liste (8 otključavajućih lokacija kroz karijeru)
- Uslovi venue-a: tip terena (šuma, reka, urbano, planina), noćni/dnevni slot, vetar (da/ne), kisaobrana (da/ne)
- Budžet za audio opremu: početni 500W sistem → nadogradnje (subwoofer, line array, distributed speakers, barrier panels)
- Raspored setova kroz noć: 22:00 warm-up (niži SPL dozvoljeno) → 01:00 peak (max SPL na dance flooru) → 04:00 closing (pad SPL zbog buke zakonska restrikcija)
- Dozvole: bez dozvole = -10 reputation ako te kontrola zatekne; sa dozvolom = +5 hard cap na 85 dB umjesto 70 dB

### Micro layer — Per-zona SPL Puzzle

- 3–4 zvučne zone na tlorisu: Main Stage, Fill Zone, Buffer Zone, Neighbor Zone
- Svaka zona ima slider (50–115 dB izlazni SPL izvora)
- Real-time heatmap prikazuje propagaciju: zeleno (happy dance floor > threshold), žuto (borderline), crveno (susedova kuća, > 70 dB = fail)
- Fizika: Inverse square law — SPL pada 6 dB kad se udaljenost dupla. Refleksije (zidovi, šuma) +3–8 dB. Vjetar (bura) pomera zvuk 10–15% u smeru pirale.
- Dinamički eventi tokom noći: publika raste (happiness threshold raste), oblak oblaci (manje refleksije), vjetar zakreće, iznenadna inspekcija
- Vizuelni feedback: svaka zona pulse-uje bojom u ritmu simuliranog BPM-a (estetska veza sa muzičkim eventom)

### Meta progresija — Promoter Karijera

- **Junior Promoter** (nivo 1–2): Šumski Sat, Rečna Obala — mali event, mala publika, opraštajuće susedstvo
- **Lokalni Heroj** (nivo 3–4): Industrijska Zona, Urbani Blok — kompleksniji teren, više pritužbi, media coverage
- **Regionalni Promoter** (nivo 5–6): Prigradska Arena, Rečni Brod — novi format, mobilni venue, striktniji zakoni
- **Avala Legenda** (nivo 7–8): Avala Predgorje, Avala Open-Air Finale — Kluboslavija brend, 20. jun, TV novinari, live stream
- Reputation score se akumulira kroz karijeru: utiče na to koliko brzo otključavaš opremu i ko te bookuje
- Dve poluge reputacije: **Publika Rep** (happiness scores) + **Komšijska Rep** (buka complaints)
- Prestiž: dovršetak svih 8 nivoa otključava **Hard Mode** — isti tereni, stroži zakoni (65 dB limit), bez dozvola

---

## Hook — zašto 15+ minuta

Pet minuta ti treba samo da razumeš SPL fiziku. Prvih par nivoa su tutorial u disguise-u — misliš da igraš, zapravo učiš. Kad prvi put vjetar pomeri heatmap u crveno i moraš brzo da reaguješ, to je adrenalinski momenat. A onda dolazi karijera: jedan loš event znači lošiji budžet sledeći put, a lošiji budžet znači manje opcija. Igraš još jedan nivo da "popraveš" reputaciju. Klasičan loop.

Dodatni faktor: svaki teren je vizuelno i mehanički drugačiji. Šuma nije Avala. Industrijska zona ima betonske odjeke koji te iznenade. Rečna obala ima vjetar koji menja smer. Svaki teren zahteva novo razmišljanje — to je replay loop.

---

## Vizuelna estetika (paleta, stil)

- **Baze**: tamni (#0a0a1a) + electric purple (#7b2fff) + neon cyan (#00f0ff)
- **Heatmap**: zelena (#00ff88) za safe zone, amber (#ffaa00) za warning, crvena (#ff2244) za violation
- **UI stil**: Brutalistički techno — debele linije, terminal font (JetBrains Mono), ikone bez ilustracija
- **Teren tloris**: top-down 2D, zona-po-zona kolor blokovi, bez fotorealizma
- **Zvučni vizir**: pulsirajući krugovi od izvora zvuka, radius = SPL zona
- **Career screen**: vertikalni timeline sa silhuetama venua (šuma → grad → planina)

---

## Audio mood

- UI zvuci: kratki techno click-ovi, bez melodija
- Gameplay ambient: niska sub-frekvencija hum (200–400 Hz) koja se pojačava kad SPL raste
- Feedback zvuci: pozitivni = duboki kick hit, negativni = distorted clip (klipovanje = fail zvuk)
- Finale (Avala): kratkа sekunda stvarnog Kluboslavija audio fragmenta kao easter egg reward

---

## Win / lose condition

**Win po eventu:**
- Susedova zona: ≤ 70 dB tokom celok eventa
- Dance floor happiness: iznad praga (po nivou, 60% → 80%)
- Nema više od 3 buka-complaint incidenta po noći

**Lose:**
- Sused > 70 dB = instant warning. Tri warnings = event shutdown (fail)
- Happiness < threshold na kraju = publika se rasula, nema profita
- Budžet = 0 bez minimalnih rezultata = bankrot, restart karijere

**Win po karijeri:**
- Svih 8 nivoa završeno sa net-pozitivnom reputacijom (obe poluge ≥ 50 bodova)

---

## Brand_serves (konkretan benefit za svaki projekat)

### Kluboslavija
- **Direktni bridge**: finale igre je Avala 20. jun. Igrač koji završi karijeru vidi brand, datum, vizual. Conversion: link ka stvarnoj karti / event stranici.
- **Edukacija publike**: igrač razume zašto je "glasno" komplikovano. Kad dođe na Avalu, razume zašto su zvučnici postavljeni tamo gde jesu. Dublja veza sa eventom.
- **Tonketa i Sava pozicioniranje**: karijera uvodi likove kao mentore u igri ("Sava ti kaže: bura sutra, prilagodi fill zone"). Ime se pojavljuje u kontekstu ekspertize.

### MKDSLend
- **Softverski showcase**: igra demonstrira da MKDSLend tim razume tehničku kompleksnost event managementa. Trust builder za B2B razgovore.
- **Lokalna zajednica (Avala region)**: igra eksplicitno prikazuje da organizator vodi računa o akustičkom zagađenju i susedima. Goodwill materijal pre 20. jun.
- **GDG engine showcase**: multi-layer sim je najkompleksniji GDG format dosad — dokaz da Gari Daily Games nije "random igrice" nego ozbiljan kreativni produkt.

---

## Targetirana dužina sesije

- **Kratka sesija**: 1 event = 8–12 minuta
- **Srednja sesija**: 2–3 eventa = 20–35 minuta (career flow)
- **Duga sesija**: kompletan playthrough do Avale = 60–90 minuta
- GDG target: 15–25 minuta po sesiji, više sesija tokom nedelje pre 20. jun

---

## Replay hook

- Hard Mode otključan tek kad sve 8 nivoa završiš sa ≥ 3 zvezdice
- Nasumični vremenski uslovi pri svakom replay-u (seeded per datum)
- Global leaderboard: Highest Avala Score — za kompeticiju između Kluboslavija community
- "Šta bi Sava uradio drugačije?" — post-event hint sistem sa različitim putanjama
