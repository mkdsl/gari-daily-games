# Cross-Event Pasoš — Concept

> *"Svaki pečat je dokaz da si bio tu."*

---

## Naziv

**Kluboslavija Pasoš**

*(Cross-Event Pasoš je interni naziv pipeline-a. Za igrača — ovo je Kluboslavija Pasoš: zvanični dokument tvog prisustva u GDG ekosistemu.)*

---

## Žanr

Meta-collection / Progression Experience

Nije igra u klasičnom smislu — ali je interaktivno iskustvo sa emocijom. Misli na to kao digitalni pasulj koji se sam puni: svaki put kad odigrano nešto, ostaje trag. Pasoš je taj trag.

---

## Premisa

Ti si Kluboslavac — neko ko prati GDG događaje, igra igrice između predavanja, šali se u Slack kanalima. Svaki GDG event ima svoju igru. Svaka igra ostavlja pečat. A pečati grade priču — tvoju priču u ovoj sezoni GDG-a.

Kluboslavija Pasoš je tvoja putna isprava kroz GDG 2026. Ne možeš da ga lažiraš. Možeš samo da ga zaradiš.

---

## Core Gameplay Loop

1. **Otvoriš Pasoš** — animacija otvaranja booklet-a (flip efekt, stranice se razdvajaju)
2. **Vidiš stranice** — svaka strana = jedan GDG event. Strane za prošle igre prikazuju ili *prazan kružić* (nije odigrano) ili *pečat u boji* (odigrano)
3. **Za prošle igre (Avala Run, Aforizam, DJ za Pultom):** ispod svakog pečat-slota stoji dugme — *"Odigrao/la sam ovo"* — klikneš, pečat se utisne uz kratku animaciju tinte koja se širi
4. **Za buduće igre:** pečat dolazi automatski — igra ga upisuje u localStorage pri prvom završetku
5. **Gledaš svoju napredak traku** — 3 / 5 / 7 pečata otključavaju nagrade koje se otkrivaju jedna po jedna
6. **Deliš** — screenshot gumba koji generiše sliku pasoša za IG story

---

## Hook

Trenutak kad se pečat utisne — animacija, zvuk, boja — traje svega 2 sekunde. Ali u tih 2 sekunde osećaš: *bio sam tamo.* To je hook. Ne mehanika, nego potvrda. Pasoš ti kaže: "Pamtim te."

Zašto bi neko proveo 3–5 minuta ovde? Jer je to prva stvar u GDG game pipeline-u koja pamti šta si radio pre. Sve prethodne igre su bile jednokratne. Ovo je kontinuitet.

---

## Vizuelna Estetika

**Referenca:** Fizički pasoš koji se otvara — bordo korice, unutra kremaste stranice, pečati u tinti.

**Paleta:**
- Korice: tamno bordo (`#4A0E1A`) sa zlatnim tiskom (`#C9A84C`)
- Stranice: krem (`#F5ECD7`) sa suptilnim grid-linijama
- Pečati — svaki event ima svoju boju:
  - Avala Run → zelena šuma (`#3A7D44`)
  - Aforizam Generator → tamno plava tinta (`#1B3A6B`)
  - DJ za Pultom → ljubičasta noć (`#5C2D91`)
  - Buduće igre → gray placeholder sve do otključavanja

**Stil:** Pixel art ali u "premium dokumenta" ključu — pikselizovani detalji koji izgledaju kao gravirani. Ne retro gaming, nego retro državna štamparija.

**Animacije:**
- Otvaranje Pasoša: flip knjige, 0.6s, ease-in-out
- Utiskivanje pečata: tinta se širi iz centra, 0.4s, sa blagim blur-om koji nestaje
- Unlock nagrade: stranica se otvara kao pismo iz koverte

---

## Audio Mood

Ambient, suptilno, bez loop-a koji smara.

- **Pozadina:** tihi šum kafića / čekaonica — glasovi iz daljine, kašike, koraci
- **Pečat zvuk:** gumeni pečat na papiru — *thunk* + blag echo
- **Unlock zvuk:** papir koji se prevrće + kratki fanfar u lo-fi stilu (2–3 note, ne više)
- **Hover na pečat:** suptilni šum tinte, kao pero na papiru

*Sve zvuke treba da mogu da se ugase jednim klikom — pasoš se često listá u tišini kancelarije.*

---

## Win Condition / Reward Mapa

| Pečata | Nagrada | Šta se dešava |
|--------|---------|---------------|
| 3 | **Specijalni Avatar Frame** | CSS pixel art okvir se pojavljuje u pasošu oko tvoje inicijale-avatar ikone. Možeš da ga screenshot-uješ. |
| 5 | **Badge: "Ekipni Čovek"** | Stranica pasoša se otvara kao sertifikat — tvoje ime (koje si uneo/la pri prvom posetu) ispisano u pixel-font kaligrafiji. Kopiraš kao sliku. |
| 7 | **Crew Member** | Posebna stranica pasoša sa holografskim efektom (CSS shimmer). LocalStorage dobija `gdg_crew_member: true` — buduće igre čitaju ovo i otključavaju skin. |

*Nagrade su kumulativne — 7 pečata znači da imaš sve tri.*

---

## Interaktivni Elementi

**Klik na pečat (već utisnut):**
Pečat se lagano zumira, pojavljuje se tooltip sa nazivom igre, datumom, i jednom rečenicom opisa eventa. Osećaj: "Prelistavam uspomene."

**Klik na prazan slot (buduća igra):**
Slot se lagano trese (ne, nisi tu bio), pojavljuje se poruka: *"Ova stranica čeka tvoj dolazak."* + link na igru kad bude dostupna.

**Klik na avatar / nagradu:**
Otvara se modal sa instrukcijama za download/screenshot nagrade.

**Dugme "Odigrao/la sam ovo" (retro claim):**
Jednom kliknut, dugme nestaje zauvek za taj pečat. Pečat se utiskuje. Nema undo-a. To je poenta — izjava, ne potvrdni okvir.

**Animacija otvaranja:**
Prvi put kad dođeš na stranicu — korice pasoša su zatvorene. Klikneš (ili tapneš). Booklet se otvori. Tek tada vidiš šta te čeka unutra.

---

## Targetirana Dužina Sesije

**3–5 minuta** pri prvoj poseti (otkrivaš, utiskuješ prošle pečate, gledaš nagrade).

**30–60 sekundi** pri svakom povratku (proveruješ novi pečat posle nove igre).

Pasoš nije igra u kojoj se zadržavaš — on te šalje nazad na igre. To je njegova uloga u ekosistemu.

---

## Tehničke Napomene za Jovu

### LocalStorage Ključevi

```json
// Pečat za svaku igru — upisuje igra ili ručni claim
"gdg_pasos_avala-run"       → { "claimed": true, "date": "2026-05-06", "method": "manual" }
"gdg_pasos_aforizam"        → { "claimed": true, "date": "2026-05-08", "method": "manual" }
"gdg_pasos_dj-za-pultom"   → { "claimed": true, "date": "2026-05-09", "method": "manual" }
// Buduće igre — automatski po završetku:
"gdg_pasos_[slug]"          → { "claimed": true, "date": "YYYY-MM-DD", "method": "auto", "score": 1234 }

// Korisnički profil (kreiran pri prvom otvaranju pasoša)
"gdg_pasos_profile"         → { "name": "Marko", "created": "2026-05-10" }

// Nagrada unlock status
"gdg_pasos_rewards"         → { "avatar_frame": true, "ekipni_covek": false, "crew_member": false }

// Crew member flag — čitaju buduće igre
"gdg_crew_member"           → true
```

### Logika claim-a

- Pasoš pri učitavanju skenira sve `gdg_pasos_*` ključeve i broji `claimed: true`
- Retro claim (manual) je jednosmerna operacija — bez validacije, bez servera
- Integritet nije kritičan (nije nagradna igra) — ali UI treba da komunicira ozbiljnost: dugme se ne poništava, nema "Otkaži"
- **Za buduće igre:** igra poziva `window.localStorage.setItem('gdg_pasos_[slug]', JSON.stringify({ claimed: true, date, method: 'auto', score }))` pri `gameOver` ili `levelComplete` eventu

### Slug konvencija

Slug = direktorijum igre bez datumskog prefiksa:
- `games/2026-05-06-avala-run/` → slug `avala-run`
- `games/2026-05-08-aforizam-generator/` → slug `aforizam-generator` (ili `aforizam`)
- `games/2026-05-09-dj-za-pultom/` → slug `dj-za-pultom`

*Preporuka: definiši kanonski slug list u config JSON-u unutar Pasosa repo foldera da buduće igre imaju referencu.*

### Screenshot / Share

Koristiti `html2canvas` ili `dom-to-image` na `.pasos-share-card` elementu — generisati PNG koji se nudi za download ili direktno za Web Share API na mobilnom.

---

*Concept: Sine Scenario — 2026-05-10*
*Pipeline korak: KORAK1 — sledeće: Premortem (Nega)*
