# Concept: Na Vezi
*GDG 2026-07-18 — Iskra Ivanović*

---

## 1. Naziv

**Na Vezi** (radni naslov — dvostruko značenje: "na vezi" = na liniji/uživo u etru, ALI i "na vezi" = povezan sa ljudima. Oba čitanja rade za Guncati Televiziju.)

Alt: *Eter* / *Signal sa Imanja*

---

## 2. Žanr

**Multi-layer Broadcast Management Sim** (studio manager + kontrolna soba uživo)

Tri sloja koji se hrane jedan iz drugog:
- **Macro layer** (nedelja pred emitovanje): planiranje programa, alokacija platformi, investicije u opremu, rezervacija gostiju, upravljanje off-grid resursima (struja, internet)
- **Micro layer** (sama emisija uživo): kontrolna soba u realnom vremenu — signal, chat, gosti, tehnički alarmi
- **Meta progresija**: rast studija od "bare bones" (laptop + telefon na tronošcu) do stabilne multi-platform produkcije, sezonski prestige

Ovaj žanr namerno nije viđen u dosadašnjih 10 GDG igara — nema idle/tycoon, nema crew-builder karte, nema point-and-click, nema tile-planning puzzle. Ovo je "operativni kontrolni panel + planer", bliže Game Dev Tycoon/Football Manager senzibilitetu nego prethodnim GDG naslovima.

---

## 3. Premisa

Guncati Televizija je trenutno u "bare bones" fazi — jedan laptop, jedan telefon, solarni panel koji ne garantuje uvek dovoljno snage, i internet koji zna da zada probleme kad ga najviše treba. Igrač je operater kontrolne sobe: svake nedelje planira šta ide u etar (DJ lajv, podkast razgovor, obilazak imanja), na koje platforme (Instagram prioritet, TikTok sekundarno, YouTube kad ima viška kapaciteta — realan redosled iz Guncati streaming prakse), i koliko od ograničenog off-grid budžeta (struja + bandwidth) ide u kvalitet slike/zvuka.

Onda dolazi emisija — i sve što je planirano se testira uživo. Padne konekcija, gost kasni, panel je slabo napunjen posle oblačnog dana — igrač reaguje u realnom vremenu, ne unapred.

Ovo nije igra o dramatičnom studiju sa neograničenim resursima. Ovo je igra o **pravljenju medija sa onim što stvarno imaš** — što je tačno Guncati Televizija priča danas.

---

## 4. Core Gameplay Loop

### Macro Layer (Nedelja = 1 planning session, 8-12 min)

Pre svake emisije, igrač donosi odluke koje se "zaključavaju" za tu nedelju:

| Odluka | Opcije | Trošak | Output |
|--------|--------|--------|--------|
| **Format emisije** | DJ lajv set, podkast/razgovor, obilazak imanja ("vlog uživo") | Vreme pripreme | Različit tip publike, različita dužina |
| **Platform alokacija** | IG (primarni fokus), TikTok (sekundarni), YouTube (kad ima viška kapaciteta) | Bandwidth budžet po platformi | Doseg × zadržavanje po platformi |
| **Oprema / infrastruktura** | Rezervni encoder, bolji mikrofon, drugi internet link (backup), rasveta | Kapital (zarađen kroz gledanost) | Smanjuje šansu za tehnički alarm u Mikro sloju |
| **Gost** | Član Guncati ekipe, gostujući DJ, "niko — solo emisija" | Vreme rezervacije + eventualni no-show rizik | Content kvalitet + chat engagement bonus |
| **Off-grid resurs menadžment** | Koliko solar/baterijskog kapaciteta ide u emisiju vs. ostatak imanja | Realan limit — ne beskonačan resurs | Direktno određuje "kvalitet slots" dostupne u Mikro sloju te nedelje |

Off-grid resurs je jedinstven twist: ako je nedelja bila oblačna (random weather event, blago, ne punish-heavy), igrač ima manje snage na raspolaganju — mora birati niži bitrate ili kraću emisiju, realna cena off-grid života.

### Micro Layer (Emisija uživo = real-time kontrolna soba, 6-10 min po sesiji)

Igrač gleda dashboard sa nekoliko traka (signal jačina, chat aktivnost po platformi, baterija/napon panela, publika po platformi) i reaguje na događaje koji iskaču u realnom vremenu:

- **Signal drop** — igrač bira: reroute na backup link (troši rezervni kapacitet) ili "guraj kroz smetnje" (rizik potpunog pada)
- **Feedback/audio glitch** — brzi mini-fix (klik na pravi EQ dugme u vremenskom prozoru, slično Zvučnoj Probi ali bez ponavljanja te mehanike 1:1 — ovde je jedan od pet mogućih alarma, ne ceo gameplay)
- **Gost kasni / no-show** — igrač popunjava sa "banter" segmentom ili pre-pripremljenim klipom (bira se u Makro fazi kao osiguranje)
- **Chat momentum** — različiti chatovi (IG/TikTok/YouTube) traže različitu pažnju; igrač raspoređuje ograničeno vreme odgovora, prioritet po platform-strategiji iz Makroa
- **Platform-specifično ponašanje** — TikTok algoritam nagrađuje rani engagement spike (prvih 2 min kritične), YouTube nagrađuje retenciju (duži segmenti), IG je najstabilniji ali sporiji rast — igrač uči razlike kroz igru, ne kroz tutorial tekst

### Carry-Over (Macro → Micro → Macro)

- Investicije u opremu iz Makroa direktno smanjuju frekvenciju/težinu alarma u Mikro sloju
- Kako emisija prođe (uptime, engagement po platformi) određuje kapital za sledeći Makro krug
- Loše upravljan off-grid resurs jedne nedelje (npr. potrošio si svu bateriju na YouTube kad je IG prioritet) uči igrača da sledeći put drugačije alocira

---

## 5. Hook — Zašto 15+ minuta, ne 5

**Realna neizvesnost, ne scriptovan ishod:** Igrač ne zna unapred da li će signal pući — svaka emisija je drugačija kombinacija weather eventa, opreme i odluka iz Makroa. Isto planiranje ne garantuje isti ishod dva puta zaredom, što drži pažnju kroz obe faze.

**Off-grid resurs kao stvaran ograničavajući faktor:** Igrač mora da bira — ovo nije beskonačan budžet igra. Bira se ŠTA je najbitnije da radi dobro ove nedelje, jer sve ne može odjednom. Ovo je tenzija koja traje kroz čitav playthrough, ne samo prvih par minuta.

**Tri platforme, tri različita rezona:** Igrač mora da nauči da IG/TikTok/YouTube nisu isto ponašanje — otkriva to kroz gameplay (chat momentum razlike, retention vs. spike dinamika), ne kroz predavanje. Ovo produžava "aha" krivu učenja.

**Makro→Mikro→Makro petlja stvara pripremu-pa-izvedbu ritam:** Igrač planira nedelju, izvodi je uživo, vidi rezultat, planira sledeću — svaki krug je kraći od jedne cele Imanje Tycoon sezone (namerno — ovo je brži, "emisijski" ritam, ne farm-sim ritam), što daje osećaj napretka svakih 15-20 minuta umesto svakih 40.

---

## 6. Vizuelna Estetika

**Stil:** CSS/Canvas "kontrolna soba" flat-UI — dashboard sa trakama, dugmićima i alarm ikonicama, kao mešavina OBS interfejsa i analognog VU-metra. Čitljivo pre nego lepo — ovo je operativni ekran, ne dekorativna scena.

**Paleta boja:** namerno RAZLIČITA od Guncati "dnevne, permakulturne" zelene palete korišćene u Akva-Sklopu i Imanje Tycoonu (topla zemlja/trava/voda) — ovo je noćni emisijski kontekst, ne dnevna bašta.

| Element | Boja | HEX |
|---------|------|-----|
| Pozadina (kontrolna soba, noć) | Duboko indigo | `#1A1F3B` |
| Signal traka (stabilno) | Toplo ćilibar (string lights vibe) | `#E0A64C` |
| Signal traka (upozorenje) | Prigušena narandžasta | `#D9713C` |
| Signal traka (kritično) | Prigušena crvena (ne agresivna) | `#B33D3D` |
| CRT/scanline akcent | Prigušena fosfor-zelena | `#5FBF8F` |
| UI okvir / dashboard | Off-white tekst na tamnoj podlozi | `#EDEAE0` |
| Baterija/off-grid indikator | Hladna plava-siva | `#7A8FA6` |

**Ambient:** Blagi scanline/CRT flicker efekat na dashboardu (nostalgičan "kućni studio" osećaj, ne glitch-horror). String lights ikonica u pozadini kao referenca na to da je ovo imanje noću, ne korporativni studio. Baterijski indikator vizuelno "diše" — puni se/prazni tokom emisije.

---

## 7. Audio Mood

**Muzika:** Tih ambient sintisajzerski pad ispod dashboarda — analogan "on air" tišini kontrolne sobe, ne nametljiva pozadinska muzika (jer igrač "sluša" DJ lajv/podkast koji se simulira kao apstraktni audio-meter, ne stvarna pesma). Web Audio API generisano, minimalistički.

**SFX:**
- Alarm (signal drop): kratak, jasan "blip" — hitno ali ne panik-inducing
- Chat notifikacija: mek "tap" po platformi (IG/TT/YT imaju blago različit ton)
- Uspešna emisija (kraj sesije, sve stabilno): topao "on air → off air" prelaz, kao gašenje starog radija
- Baterija nisko: suptilan pulsirajući ton, raste u intenzitetu ali ostaje diskretan

**Opšta atmosfera:** Fokusirana budnost — "radiš noćnu smenu u malom kućnom studiju", ne stres-simulator. Slično tonu DJ za Pultom (retro-radni realizam), ali za broadcast, ne DJ pult.

---

## 8. Win Condition / Meta Goal

**Primary goal:** Dostići status **"Signal Stabilan"** — 4 uzastopne emisije bez kritičnog pada signala, prosečan engagement iznad praga na sve tri platforme, i bar jedna emisija sa gostom bez no-show-a.

**Prestige moment:** Na kraju sezone (definisan kao ciklus od N emisija — tačan broj balansira Mile), igrač bira **sezonski reset** — studio "ostaje" opremljen (trajna oprema se ne gubi), ali broj pratilaca/engagement kreće ispočetka sa multiplierom iz prethodnog ciklusa. Svaki reset:
- Otključava novi format emisije (npr. "simulcast" — istovremeno emitovanje sa Kluboslavija eventom, kad takav postoji)
- Otključava viši tier opreme (manji rizik od alarma)
- Dodaje kozmetički "studio milestone" (string lights upgrade, novi dashboard skin)

**Branching ishodi:**
- Igrač koji sav budžet gura u IG raste brže ali ostaje ranjiv na TikTok/YouTube diverzifikaciju
- Igrač koji balansira sve tri platforme sporije raste ali je otporniji na platform-specifične padove (algoritam promene, itd.)
- Igrač koji prioritizuje opremu nad gostima ima stabilnije ali "tiše" emisije; igrač koji prioritizuje goste ima volatilniji ali veći engagement potencijal

---

## 9. brand_serves

### Guncati (primary)
- **Guncati Televizija dobija edukativni "prevod":** Igra objašnjava, kroz gameplay a ne predavanje, zašto je multi-platform broadcast sa off-grid infrastrukturom stvarno težak zanat — ne "samo upali kameru". Gledaocima daje poštovanje za trenutnu "bare bones" fazu umesto da je vide kao amatersku.
- **Off-grid stvarnost kao gameplay, ne apstrakcija:** Solar/baterijski limit u igri direktno odražava realnost off-grid energetike na imanju — igrač razume zašto Guncati TV ponekad ima kraće emisije ili nižu rezoluciju, umesto da to čita kao slabost.
- **Content hook za samu Guncati Televiziju:** Igra prirodno najavljuje format ("odigraj kontrolnu sobu, pa gledaj pravu emisiju uživo") — CTA na kraju sesije može voditi ka pravom Guncati TV kanalu/linku [PROVERI SA ŠEFOM — tačan link/platforma gde Guncati TV trenutno emituje].

### MKDSLend (secondary)
- **"Zabavni radni park" kao medijski proizvod:** Igra pokazuje da MKDSLend ekosistem ima sopstveni medijski kanal (Guncati TV), ne samo fizičke evente. Jača umbrella narativ — park proizvodi i sadržaj, ne samo iskustva uživo.
- **Anti-pyramid kompatibilno:** Nema referral/novčane mehanike — napredak je isključivo kroz veštinu upravljanja emisijom i investiciju u opremu, u skladu sa principom da je nagrada pristup/artefakt, ne novac.

### Kluboslavija (tertiary, cross-promo potencijal)
- **"Simulcast" unlock kao budući most:** Meta-progresija sadrži otključavanje formata gde se Guncati TV emisija poklapa sa Kluboslavija DJ sadržajem — postavlja narativni temelj za buduću cross-brand emisiju BEZ da igra tvrdi da takva emisija već postoji danas [PROVERI SA ŠEFOM pre javnog lansiranja ako se ovaj hook ističe u marketing copy-ju — trenutno je samo unutar-igre meta cilj].

---

## 10. Targetirana Dužina Sesije

| Sesija | Trajanje | Šta igrač radi |
|--------|----------|----------------|
| Prva sesija (onboarding) | 12-15 minuta | Tutorial nedelja: jedan format, jedna platforma fokus, uči dashboard kroz jednu emisiju sa blagim alarm-om |
| Redovna sesija (Makro + Mikro krug) | 15-22 minuta | Planiranje nedelje (8-12 min) + emisija uživo (6-10 min) |
| Prestige sesija (kraj sezone) | 20-25 minuta | Finalna emisija sezone + prestige odluka + setup novog ciklusa |
| **Ukupno do prvog prestige-a** | **~3-4 sata** (spread kroz više sesija) | Kraći ciklus od Imanje Tycoona — namerno, jer je "emisijski" ritam brži od farm-sim ritma |

---

## 11. Prestige / Replay Hook

**Sezonski prestige (soft reset):** Studio oprema ostaje, publika/engagement kreće ispočetka sa permanentnim multiplierom. Svaki ciklus je brži jer oprema smanjuje rizik od alarma.

**Formati koji se otključavaju redosledom:**
1. **Solo emisija** (default) — jedan operater, osnovna oprema
2. **Gost format** — otključava se posle prve stabilne sezone, dodaje rezervacioni rizik/nagradu sloj
3. **Simulcast** (kasni unlock) — istovremeno sa Kluboslavija sadržajem, najviši rizik/nagrada tier

**Achievement sistem:** manji set (10-15) fokusiran na specifične stilove upravljanja (npr. "Nikad nisi izgubio signal 5 emisija zaredom", "Sve tri platforme balansirane u istoj nedelji", "Emisija bez ijedne baterije u rezervi — na ivici").

**Replay hook bez agresivnog grinda:** Zato što je ciklus kratak (~3-4h do prvog prestige-a), igrač može da odigra kompletan "sezon" arc u jednoj ili par sesija, što je dobro za deljivost ("evo mog studio setup-a posle X sezona") bez zahteva za dugoročnim dnevnim navraćanjem kao kod Imanje Tycoona.

---

## Napomene za Mile (GDD ulaz)

- **Off-grid resurs formula:** treba definisati "kapacitet po nedelji" kao random raspon (npr. loš/prosečan/dobar dan sunca) sa blagim RNG-om — ne sme biti punishing, treba da bude realan ali igriv. Nemam tačne brojeve realnog Guncati solar sistema (kW, baterijski kapacitet) — GDD treba da koristi apstraktnu skalu (0-100 "kapacitet") umesto da izmišlja realne watt brojeve dok se ne potvrde sa Lemom/šefom.
- **Alarm frekvencija po opremi:** oprema treba da smanjuje % šanse za alarm eksponencijalno (prva investicija najveći efekat, dalje diminishing returns), slično prestige multiplier logici iz Imanje Tycoona.
- **Platform-specifične krive:** TikTok = brz rani spike pa brz pad ako se ne održava; YouTube = spor rast ali duže "repovi" (retencija); IG = najstabilniji, srednji rast. Ovo treba pretvoriti u konkretne brojčane krive — koristi redosled prioriteta IG > TikTok > YouTube kao osnovu (poznat prioritet iz Guncati streaming prakse), ne izmišljaj tačne engagement % dok GDD ne prođe kroz balansiranje.
- **Nema tačnih datuma/brojeva o Guncati Televiziji u ovom konceptu** — trenutna faza je opisana kao "bare bones" (poznato), sve dalje (broj gledalaca, tačna oprema, tačan raspored emitovanja) MORA biti [PROVERI SA ŠEFOM] pre nego što uđe u GDD kao tvrd broj.
- **Signal-alarm mini-igra (Micro sloju):** dizajnirati kao JEDAN od 4-5 mogućih alarm tipova sa rotacijom — ne ponavljati Zvučnu Probu 1:1 (ta igra je već DSP/EQ fokus); ovde alarm treba da bude brži i plići (2-4 sekunde reakcije), deo šireg dashboard-a, ne centralna mehanika cele igre.

---

*Iskra Ivanović, 2026-07-18*
*"Ne pravimo studio sa neograničenim resursima. Pravimo studio kakav stvarno imamo."*
