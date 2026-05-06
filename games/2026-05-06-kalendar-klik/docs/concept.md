# Park Ranger — Daily Quest RPG

## Žanr
Daily Quest RPG / Habit Gamification — HTML5, mobile-first, DOM-based

---

## Premisa
Ti si **Radnik Parka** — pixel-art lik koji živi u Parku (MKDSLend svemir) i svaki dan dobija novi nalog od Čuvara Parka. Nalozi nisu fantasy misije — to su stvarni mikro-izazovi iz tvog dana: popij vodu, izađi napolje, javi se prijatelju. Svaki completed quest gradi tvoj streak, streak gradi XP, XP levela tvog Radnika. Nema lootboxa, nema kupovine — jedina nagrada je da postaneš bolji čovek i bolji Radnik Parka.

---

## Core gameplay loop

1. **Otvoriš igru** (jednom dnevno, ujutro ili kad seti) — UI prikazuje trenutni Level i XP bar tvog Radnika.
2. **NEW QUEST animacija** — retro RPG dialog box klizi odozdo uz chiptune zvučić: kategorija questa (Telo / Fokus / Veze / Priroda), opis u jednoj rečenici, težina (lako / srednje).
3. **Quest ostaje aktivan ceo dan** — igra pamti da li je danas completed (`localStorage: questDate`).
4. **Uradiš quest u realnom životu** (ne u igri — u stvarnosti).
5. **Vratiš se i pritisneš [DONE]** — reward screen: XP gained, streak counter, poruka od Čuvara Parka.
6. **Lik se vizuelno menja** ako je streak dostigao novi level prag — nova pixel-art varijanta lika se unlocka.
7. **Sutra: novi quest.** Loop se ponavlja.

**Quest lista (primer pool-a):**

| Kategorija | Primeri |
|------------|---------|
| Telo       | "Popij 2 čaše vode pre 10h", "Uradi 20 skokova", "Prošetaj 10 minuta bez telefona" |
| Fokus      | "Ne diraj telefon prvih 10 min po buđenju", "Napiši 3 stvari za koje si zahvalan/a", "Sedi u tišini 5 min — bez muzike, bez ekrana" |
| Veze       | "Pošalji poruku starom prijatelju", "Reci nekome nešto lepo u lice danas" |
| Priroda    | "Pojedi nešto zeleno danas", "Otvori prozor na 10 min i udahni spolja" |

Quest se bira pseudo-random iz pool-a, sa logikom da ista kategorija ne padne dva dana zaredom.

---

## Hook

Svaki dan imaš jedan task koji traje manje od minut da označiš — ali koji te tera da nešto uradiš u stvarnom životu pre toga. Nije guilt-trip notifikacija, nije gamified grind. Jeste pixel-art lik koji izgleda tužno (siv, pogrbljen) kad mu streak pukne — i koji postaje sve coolniji, živahniji i bolje opremljen kako streakuješ. Vizuelni napredak lika je lični napredak korisnika. Šef koji spava 5h vidi Level 3 i zna: "Prošle 2 nedelje sam bio konzistentan." To je hook.

---

## Vizuelna estetika

### Paleta boja
| Uloga | Boja | HEX |
|-------|------|-----|
| Pozadina | Tamno zelena (MKDSLend park noć) | `#0D1F0F` |
| UI panel / dialog box | Duboka šuma | `#1A3320` |
| Neon akcenat (XP bar, streak broj, CTA dugme) | Neon zelena | `#39FF14` |
| Sekundarni akcenat (kategorija tag, border) | Amber / retro žuta | `#F5A623` |
| Tekst | Off-white | `#E8F0E9` |

### Stil
Pixel art (16×16 ili 32×32 grid za lika), flat vector za UI panele, retro RPG dialog box estetika (ugaoni border sa malim pixel ornamentima u uglovima).

### Ključni vizualni elementi
- **Radnik Parka** — centralni sprite, 7 vizuelnih varijanti (Level 0 do Level 7): počinje siv i pogrbljen, završava u zelenom kaputu sa "Park Champion" bedžom
- **Quest dialog box** — retro RPG stil, klizi odozdo, ima ikonu kategorije (💧 🧠 💬 🌿), quest tekst i datum
- **XP bar** — horizontalna traka, neon zelena popunjavanje, animovano pri XP gainu
- **Streak counter** — veliki broj u centru gornje trake, amber boja, sa "🔥" pixel ikonom
- **Reward screen** — full-screen overlay, XP animacija `+10 XP`, poruka od Čuvara, streak broj, dugme [NOVI DAN]
- **Level-up screen** — posebna sekvenca samo pri level-up: lik sprite swap + kratka CSS shake/glow animacija + poruka naziva levela

---

## Audio mood

Chiptune / lo-fi 8-bit ambijent koji se vrti u petlji — ton je miran, ne hiperaktivan, kao jutarnji park pre nego što stigne gužva. Zvučni efekti su retro RPG: "bleep" pri otvaranju quest box-a, ascending arpeggio pri [DONE] kliku, posebna melodijska fanfara (3 note) pri level-up. Korisnik može da mutuje sve jednim dugmetom u gornjem uglu.

---

## Win condition / Game over definicija

**Win:** Nije klasičan win-state — igra je perpetualna. Meko "win" momenti su: Level-up ekran (streak pragovi), "Park Champion" status na Level 7 (streak 60+ dana), posebna animacija na okruglim brojevima (7, 14, 30, 60 dana).

**Game over:** Nema game over ekrana. Ako preskočiš dan, streak pada na 0, lik se resetuje vizuelno na Level 0 (sivi, pogrbljeni sprite), i pojavljuje se poruka od Čuvara Parka: *"Park te čekao, Radniče. Nema veze. Novi dan, novi nalog."* — bez kazne, bez šame.

**Motivacioni dizajn:** Streak je jedina valuta. Level istorija ostaje vidljiva u stats panelu ("Tvoj rekord: 14 dana").

---

## Targetirana dužina sesije

**Max 2 minute dnevno.** Struktura:
- Otvaranje igre → quest read → 15 sekundi
- Kvest u stvarnom životu (van igre) → 5 min do ceo dan
- Povratak, [DONE] klik → reward screen → 30 sekundi

Igra se ne sme takmičiti sa korisnicikovim danom — mora biti brža od instagram storya.

---

## Platforma i kontrole

**Platforma:** Mobile-first HTML5 (DOM-based, ne Canvas). Radi kao PWA — korisnik može da "Add to Home Screen". Desktop podrška kao bonus (centered card layout, max-width 420px).

**Kontrole:** Tap/klik jedino. Jedan CTA dugme dominira ekranom u svakom state-u: [OTVORI NALOG] → [DONE] → [ZATVORI]

`localStorage` čuva: `currentStreak`, `lastQuestDate`, `completedToday`, `playerLevel`, `recordStreak`, `questHistory[]`

---

## Branding nota (MKDSLend connection)

"Radnik Parka" direktno komunicira MKDSLend identitet — Park kao metafora za MKDSLend ekosistem gde su korisnici aktivni, zdravi, prisutni učesnici, ne pasivni investitori. Igra se može embedovati na MKDSLend landing page kao "Try the Park life" widget.

Slogan predlog za landing integraciju: **"Svaki dan jedan nalog. Svaki nalog — korak dalje."
