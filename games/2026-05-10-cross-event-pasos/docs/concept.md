# Cross-Event Pasoš — Concept Document

**Autor:** Sine Scenario  
**Datum:** 2026-05-10  
**Pipeline faza:** KORAK 1 — Concept

---

## Naziv

**Kluboslavija Pasoš**

*("Cross-Event Pasoš" ostaje kao interni kod naziv. Publičko ime je "Kluboslavija Pasoš" — zvuči kao da si član nečeg stvarnog.)*

---

## Žanr

Meta-collection / Progression — interaktivno iskustvo sećanja. Nije igra u klasičnom smislu. Ali jeste iskustvo sa emocijom: otvaranje dokumenta koji potvrđuje da si postojao u tim trenucima.

---

## Premisa

Ti si GDG Beograd insider. Ne samo neko ko dođe na event — neko ko igra igre koje prethode eventu, ko ostaje, ko razume šalu sa aforizmima i ko zna zašto DJ kasni. Kluboslavija Pasoš je tvoj lični dokument tog insiderstva. Svaki pečat je dokaz prisustva. Sakupiti ih sve znači — bio/la si tu kroz celu sezonu.

---

## Core Gameplay Loop

Igrač otvara stranicu. Pred njim/njom se animirano otvara pixel art pasoš — kao fizička knjižica, stranica po stranica.

Svaka stranica je jedna GDG igra:
- Vidi pečat (u boji teme te igre)
- Čita kratki flavor text — jednu rečenicu koja opisuje igru kao uspomenu (*"Trčao/la si uz Avalu. Smeće nije dotaklo pult."*)
- Ako je igrao/la tu igru: pečat je popunjen, svetao, ima datum
- Ako nije: pečat je outlinovan, siv, sa dugmetom **"Odigrao/la sam ovo"**

Klikom na dugme → kratka animacija utiskivanja pečata (mast na papiru, zvuk) → localStorage claim se upiše → reward provera se pokreće automatski.

Nakon svake stranice: igrač lista dalje. Na zadnjoj stranici je **Reward zona** — prikazuje šta je otključano, šta sledi.

---

## Hook

Pasoš te hvata jer nije igra — on je ogledalo. Vidiš šta si sve prošao/la i osećaš da to nije slučajno. A onda vidiš prazan pečat i pomisliš: *"Pa da odem na sledeći event."* To je hook. Ne mehanika — nostalgija za stvarima koje tek treba da se dogode.

Dodatno: share moment. Avatar frame koji se otključa vizuelno je lep i odmah se može screenshot-ovati. Socialna valuta za IG story.

---

## Vizuelna Estetika

**Stil:** Pixel art + papirna tekstura. Pasoš izgleda kao stvarni dokument — tvrd korice, boja kojom dominira **tamno zelena** (klasični pasoš) sa zlatnim detaljem GDG logoa.

**Unutrašnje stranice:** Krem/žućkasta boja papira. Svaki pečat ima svoju boju:
- Avala Run — **narandžasta** (sunce, trka, energija)
- Aforizam Generator — **plavo-siva** (misao, mediteranski ink)
- DJ za Pultom — **ljubičasta** (noć, UV svetlo, pult)
- Buduće igre — **zlatna kontura**, čeka se utiskivanje

**Tipografija:** Serif font za flavor text (osećaj dokumenta), monospace za datume i tehničke detalje.

**Animacija otvaranja:** Pasoš se ne pojavljuje odjednom — leva korica se otvara ka desno, stranice se listaju s laganim inercijskim efektom. Svaki pečat koji se utiskuje ima micro-animaciju: krug koji se širi od centra, kao suha mast koja se upija u papir.

**UI filozofija:** Manje je više. Nema scoreboard-a, nema timera. Samo ti i dokument.

---

## Audio Mood

Ambient, suptilno, nikad nametljivo.

- **Pozadina:** Lo-fi papirni šum — kao da si u tihoj sobi i listas staru knjigu
- **Listanje stranica:** Mechanički šuštaj papira, kratko, organski
- **Utiskivanje pečata:** Dup! — gumeni pečat na papiru. Satisfying, bez ikakve muzike oko njega. Samo taj zvuk.
- **Reward otključavanje:** Kratka 3-nota melodija u durу — kao kad otvoriš poklon
- **Nema loop muzike** — tišina je deo estetike. Audio prati akciju, ne ambijent.

---

## Win Condition / Reward Mapa

| Pečata | Reward | Opis |
|--------|--------|------|
| 1 | Pasoš postoji | Prva stranica je popunjena, osećaj da nešto krećeš |
| 3 | **Avatar Frame** | CSS pixel art frame koji se prikazuje u reward zoni pasoša — screenshot-ready, deljivo na IG |
| 5 | **"Ekipni Čovek" badge** | Persona se pojavljuje u pasošu: pixel art silhueta GDG crew-a sa tvojim inicijalima |
| 7 | **"Crew Member" badge** + skin unlock | Zlatna oznaka u pasošu + `localStorage.setItem('gdg_crew_member', 'true')` — buduće igre čitaju ovo i otključavaju poseban skin automatski |

**Progresija je vidljiva sve vreme** — na naslovnoj strani pasoša je brojanik pečata (npr. `3 / 7`), kao broj posećenih zemalja.

---

## Interaktivni Elementi

**Klik na popunjen pečat:**  
Mali popup — flavor card. Prikazuje naziv igre, datum claimа, i jednu rečenicu flavor teksta. Zatvaranje klikom bilo gde.

**Klik na prazan pečat:**  
Otvarase stranica sa opisom igre i CTA: `→ Igraj` (link na igru) i `✓ Odigrao/la sam ovo` (claim dugme).

**Claim dugme flow:**  
1. Klik → confirm modal (*"Potvrđuješ da si odigrao/la [naziv igre]?"*)
2. Potvrda → animacija utiskivanja pečata
3. Pečat prelazi iz sivog u boju igre
4. Provera reward praga — ako je dostignut, reward animacija

**Klik na Avatar Frame (reward zona):**  
Frame se prikazuje fullscreen na tamnoj pozadini sa uputstvom: *"Screenshot ovo i objavi na IG story. Tag: @gdgbeograd"*

**Animacija otvaranja pasoša (autoplay pri prvom učitavanju):**  
Traje 1.5 sekundi. Korice se otvaraju, naslovna stranica se fade-uje in. Skip dostupan klikom.

---

## Targetirana Dužina Sesije

**3–5 minuta** za prvu posetu (listanje, čitanje, claimovanje prošlih igara).  
**30–60 sekundi** za povratne posete (provjera novih pečata, otključavanje).  

Pasoš ne zadržava — on poziva da se vrati.

---

## Tehničke Napomene za Jovu

### localStorage Ključevi

**Format za prošle igre (hybrid claim — ručni unos):**
```json
{
  "claimed": true,
  "claimDate": "2026-05-10",
  "source": "manual"
}
```
Ključevi:
- `gdg_pasos_avala-run`
- `gdg_pasos_aforizam-generator`
- `gdg_pasos_dj-za-pultom`

**Format za buduće igre (automatski write iz igre):**
```json
{
  "score": 4200,
  "date": "2026-05-15",
  "source": "auto"
}
```
Ključ pattern: `gdg_pasos_[SLUG]` — slug je ime foldera igre bez datuma.

**Reward flags:**
```
gdg_crew_member: "true"          // string, ne boolean — localStorage nema tipove
gdg_pasos_avatar_unlocked: "3"   // broj pečata kad je unlock dostignut
gdg_pasos_badge_unlocked: "5"
```

**Pasoš čita sve `gdg_pasos_*` ključeve pri učitavanju** — automatski broji koliko ih ima i prikazuje odgovarajuće reward stanje.

**Nema server-side persistence** — integritet nije kritičan. Pasoš je lično zadovoljstvo, nije nagradna igra.

### Config fajl (predlog)

`games/2026-05-10-cross-event-pasos/data/games.json` — lista svih igara sa:
```json
[
  {
    "slug": "avala-run",
    "title": "Avala Run",
    "date": "2026-05-06",
    "color": "#FF6B35",
    "flavorText": "Trčao/la si uz Avalu. Smeće nije dotaklo pult.",
    "url": "/games/2026-05-06-avala-run/",
    "claimType": "manual"
  }
]
```
Ovo odvaja podatke od logike — buduće igre se dodaju samo u JSON, bez editovanja JS-a.

### URL Pasoša

`https://mkdsl.github.io/gari-daily-games/games/2026-05-10-cross-event-pasos/`

---

## Narativna Nota (za pipeline)

Kluboslavija Pasoš nije igra o bodovima. To je igra o **prisustvu**. Svaki pečat kaže: *bio/la sam tu kad se nešto dešavalo.* Na kraju sezone, otvoriti pasoš sa 7 pečata i zlatnim Crew Member badge-om — to je trenutak. I to je dovoljno.
