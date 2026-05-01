# Premortem: Poslednja Smena

**Analitičar:** Nemanja "Nega" Negovanović
**Datum:** 2026-05-01
**Input:** concept.md (v1)

---

## 1. RAZUMEM — Steelman

Sine zna šta radi. Ovo nije igra koja greškom postala kratka priča — to je svesna odluka da se koristi interaktivni format kao emotivni pojačivač, ne kao gameplay sistem. Kontekst (1. maj, otkaz dan pre penzije) nije dekoracija — to je tematski temelj koji daje svakom izboru specifičnu težinu. Statistike (Ponos / Umor / Solidarnost / Gorčina) nisu RPG stat-ovi — one su ogledalo igrača. Taj framing je pametan.

Najjači deo ideje: **igrač ne gubi**. Uklanjanjem game over-a, igra pomiče pitanje sa "kako da pobedim" na "ko sam ja". To je legitimna interaktivna fikcija u tradiciji Depression Quest i 80 Days — manji, ali provereni prostor.

Tehnička procena (1200-1800 linija, DOM rendering, bez assets) je realna i konzervativna. Ovo je izvedivo u jednom danu.

Dakle — razumem šta Sine pokušava, i znam zašto bi moglo da radi.

---

## 2. RASTAVIM — Ključne Pretpostavke

Concept počiva na sledećim pretpostavkama koje treba testirati:

1. **"Igrač će se emotivno povezati za 8-12 minuta"** — kvalitet narativa je odlučujući, a narativ pišu agenti, ne profesionalni pisac.
2. **"Stat-tracking dodaje vrednost"** — 4 trake u uglu moraju da osećaju kao kauzalitet, ne kao dekoracija.
3. **"Replayability dolazi iz emocionalne znatiželje"** — igrač mora imati razlog da se vrati, a ne samo curiosity.
4. **"Skriveni 5. kraj je reward, ne kazna"** — "uvek biraš prvu opciju" je mehanička ideja koju igrač mora da otkrije ili da mu se nagovesti.
5. **"Mobile je prirodno podržan"** — text-heavy igre na mobilnom imaju specifičnih problema (tipografija, dugmad, scroll).

---

## 3. NAPADAM — Šta Može da Pukne

### 3.1 Narativni kvalitet — SHOWSTOPPER RIZIK

**Problem:** Ovo je priča o teškim emocijama — gubitku dostojanstva, kraju radnog veka, tihoj nepravdi. Da bi igrač plakao (ili makar zastao), tekst mora biti dobar. Zaista dobar. Prose kvalitet tipičnog agent-generated narativa je "funkcionalan" — ne "rezonuje u stomaku".

Pet scena sa kolegama, šef koji daje otkaz, stara mašina — svaka od ovih scena mora imati pravi ton da ne ispadne generički melodrama. Ako tekst zvuči kao ChatGPT-verzija tuge, cela emocionalnost se urušava. Igrač to odmah prepozna.

**Ovo je jedini rizik koji može ubiti igru bez greške u kodu.**

**Alternativa:** Jova treba da dobije eksplicitan brief: scene su kratke (2-5 rečenica), ali svaka mora imati jedan konkretan, senzorni detalj — "miris grafita na rukavicama", "broj mašine izgreban petnaest godina ranije". Specificitet > generičnost. Ne "bio je tužan" već "gledao je u praznu kutiju za alat".

---

### 3.2 Stat-tracking kao dekoracija — OZBILJAN RIZIK

**Problem:** 4 stat-trake su vidljive. Igrač će ih gledati. I onda će početi da optimizuje umesto da čita. "Treba mi više Solidarnosti za taj kraj" — i izlazi iz emotivnog stanja. Statistike koje su "tiho prisutne" u teoriji, u praksi su jako glasne čim igrač shvati da upravljaju završetkom.

Drugi problem: sa 5-7 scena i 2-3 opcije po sceni, stat-razlike između krajeva moraju biti pažljivo dizajnirane. Ako je routing previše grub (Gorčina > 60 → loš kraj), igrač to shvati brzo i počne da igra meta-igru, ne priču.

**Alternativa:** Dva rešenja, bira Sine/Mile:
- **Opcija A — Sakrij trake potpuno.** Stats postoje u pozadini, ali igrač nikad ne vidi brojeve. Samo vidi kraj. Ovo radikalizuje emotivnost — ne možeš da "igračiš" sistem koji ne vidiš. Mana: gubi se "aha" momenat drugog prolaska.
- **Opcija B — Prikaži ih tek na kraju.** "Epitaf kartica" sadrži i stat-summary. Tokom igre — nevidljivo. Posle — sve jasno. Ovo je i replayability, i emotivna čistota.

Trenutno rešenje (vidljive trake, non-intrusive) je kompromis koji ne zadovoljava ni jedno ni drugo dovoljno.

---

### 3.3 Skriveni 5. kraj — OZBILJAN RIZIK

**Problem:** "Biraš uvek prvu opciju" je mehanika koja deluje kao nagrada za insajdere, ali u praksi funkcioniše kao kazna za sve ostale. Problem je trojak:

1. Igrač ne zna da postoji dok ne pročita na netu — što znači da je reward za meta-znanje, ne za gameplay.
2. "Uvek prva opcija" nije emotivno motivisan izbor — to je mehanički pattern koji se kosi sa tematskim porukom igre (svaki izbor je tvoj, nema pogrešnog).
3. Ako igrač slučajno otkrije ovo i napravi "first-option run" bez da razume zašto — završetak neće rezonovati.

**Alternativa:** Promeni trigger. Umesto "uvek prva opcija", taj kraj se aktivira ako igrač **ostane konstantan** — tj. donosi izbore koji ne menjaju nijedan stat za više od 10 poena u bilo kom smeru. "Čovek koji nije dao sebi da se promeni." To je i narrativno konsistentno i mehanički nenapadljivo — igrač koji igra autentično može da ga otkrije organički.

---

### 3.4 Žanrovski identitet — KOZMETIČKI (ali vredi pomenuti)

**Problem:** "Je li ovo igra ili priča?" pitanje je koje će se pojaviti u svakom revivu i beta feedbacku. Concept izričito kaže "nema pogrešnih odgovora" — ali zašto onda biraš? Ako izbori ne mogu biti greška, šta onda biraju?

Ovo nije showstopper — interaktivna fikcija je legitimna. Ali tim mora biti svestan: ovo nije "igra" u arkadnom smislu, i treba je opisati kao što jeste. Ako je Miles GDD previše "igrivost-orijentisan", može ući u konflikt sa konceptom.

**Alternativa:** Nema potrebe menjati ništa — samo biti svestan. GDD ne treba da izmišlja balance krive i progression sisteme kojih nema.

---

### 3.5 Mobile UX za text-heavy igru — KOZMETIČKI

**Problem:** Monospace font na mobilnom je čitljiv samo do određene dužine linije. Retro terminal estetika koja izgleda čisto na desktopu može biti mučna na 375px wide screenu. ASCII ilustracije generisane Canvas-om moraju biti responsive — ovo je tehnički trivijalno ali lako zaboravljivo.

Dugmad za izbore moraju biti dovoljno velika (min 44px touch target) — ovo je standard ali ga treba eksplicitno staviti u brief za Jovu.

**Alternativa:** Jova treba CSS breakpoint za mobile: max 65ch širina teksta, 18px min font-size za prose, 44px min height za opcije.

---

### 3.6 Implementacija — NEMA RIZIKA

1200-1800 linija za DOM-based text adventure je realna i konzervativna procena. scenes.js kao data-file je pametan potez — razdvaja narativ od logike. State engine sa 4 varijable je trivijalan. Routing u narrative.js može biti jednostavna lookup tabela. Ovo je tehnički najsigurnija igra u dosadašnjem pipelinu.

---

## 4. RANGIRAM — Severity Lista

| # | Problem | Severity | Uticaj |
|---|---------|----------|--------|
| 1 | Narativni kvalitet — prose mora biti konkretan i senzoran | **SHOWSTOPPER** | Ako tekst nije dobar, igra je mrtva |
| 2 | Stat-trake vidljive tokom igre — teraju na optimizaciju | **OZBILJAN** | Ruši emotivni imerziju |
| 3 | Skriveni 5. kraj — trigger "uvek prva opcija" je meta-znanje | **OZBILJAN** | Anti-fun, tematski inkonzistentan |
| 4 | Žanrovski identitet — GDD ne sme izmišljati gameplay koji ne postoji | **KOZMETIČKI** | Konfuzija u implementaciji |
| 5 | Mobile tipografija i touch targets | **KOZMETIČKI** | Rešivo u CSS-u, ne menja dizajn |

---

## 5. PREDLOŽIM — Konkretne Korekcije

### Korekcija 1 (za concept.md): Brifinzi za narativ
Dodati u tehničke napomene: *"Svaka scena mora imati minimum jedan konkretan senzorni detalj. Generički opis emocija nije dovoljan. Jova dobija listu detalja kao primer: zvuk, miris, broj/ime, tekstura."*

### Korekcija 2 (za concept.md): Stat-trake vidljive samo na kraju
Promeniti: *"Statistike su prikazane kao 4 horizontalne trake u gornjem desnom uglu — tiho, non-intrusive"* u: *"Statistike se akumuliraju u pozadini. Igrač ih ne vidi tokom igre. Na 'epitaf kartici' — posle završetka — prikazuju se finalne vrednosti sa kratkim opisom."*

### Korekcija 3 (za concept.md): Redizajn skrivenog kraja
Promeniti trigger skrivenog 5. kraja iz "biraš uvek prvu opciju" u: *"Aktivira se ako nijedan stat tokom celog prolaska ne premaši ±15 od startne vrednosti — čovek koji je ostao isti."*

---

## 6. ZAKLJUČUJEM

Ideja je emotivno validna i tehnički izvediva. Kontekst (1. maj) je idealan. Scope je realističan.

Ali postoje dva dizajn problema koji nisu kozmetički: vidljive stat-trake tokom igre i mehanički trigerovani skriveni kraj. Oba mogu biti ispravljena sa jednom rečenicom promene u concept.md.

Narativni kvalitet je jedini pravi showstopper — i on se ne može rešiti u concept.md. Može se ublažiti dobrim briefom za Jovu: konkretnost > poetičnost, senzorni detalji > apstraktne emocije.

---

## Verdict

**DRŽI UZ KOREKCIJE**

Tri intervencije u concept.md pre nego što Miles piše GDD:
1. Stat-trake idu u pozadinu — vidljive tek na epitaf kartici.
2. Skriveni kraj triguje "nepromenjeni čovek", ne "uvek prva opcija".
3. Narativni brief Jovi: minimum jedan konkretan senzorni detalj po sceni.

Bez ove tri izmene — igra ima šansu da bude prosečna. Sa njima — može biti nešto retko u ovom pipelinu.
