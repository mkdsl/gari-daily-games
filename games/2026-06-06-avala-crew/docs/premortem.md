# Premortem: Avala Crew

**Datum:** 2026-06-06  
**Agent:** Nega Negovanović  
**Input:** concept.md — Avala Crew, multi-layer card/crew builder  
**Stage:** premortem

---

## Verdict

**DRŽI UZ KOREKCIJE**

Srž koncepta je solidan i brand utility je autentičan, ne dekorativni. Card crew builder kroz perspektivu gosta (ne promotera) je tematski prava — svako ko ide na Avalu može da se identifikuje direktno. Problemi su tehničke i dizajnerske prirode, ne konceptualne — rešivi pre impl-a.

---

## Rizici (po severitetu)

### CRITICAL — R1: Scenario sistem je nedovoljno specifikovan za impl

**Šta može da puca:** Concept kaže "15 scenarija, stats se testiraju, threshold-i" — ali ne definiše konkretno: da li je resolution binary (pass/fail) ili gradijentni (0–100%)? Koji je tačan mapping između uloga i stat bonusa? Šta je Aftermath "chain" konkretno — je li to modifier stack ili kartica u ruku?

**Zašto je CRITICAL:** Jova ne može da implementira sistem bez ovih odgovora. Nedefinisan core mechanic = impl sesija gubi 2+ sate na re-dizajnu umesto na kodiranju. Mile mora da ovo specificira u GDD pre impl trigger-a.

**Preporuka:** Mile Mehanika mora dati kompletnu matricu — scenario resolution formula, stat-to-outcome tabelu, Aftermath stack pravila — u GDD. Concept ne mora da je definiše, ali mora jasno da flaguje da GDD mora.

---

### CRITICAL — R2: 15 scenarija × 15 minuta = pretrpano za jednu sesiju

**Šta može da puca:** Concept definiše 12–15 scenarija po noći + roster selekcija + outro screen = 12–18 minuta ciljano. Ovo je ambiciozno za card game gde svaki scenario ima tekst, stat check, choice opcije, i aftermath animacije. Realnije: 15 scenarija sa animacijama = 25–35 minuta za sporije igrače.

**Zašto je CRITICAL:** Predugo za casual share-hook igru. Igrač koji napusti u sredini noći ne dobija share kartu. Retention pada. Brand utility pati.

**Preporuka:** Opcija A — Smanji na 10 scenarija po noći (3 faze × 3–4 scenarija). Opcija B — Drži 15 ali napravi "Kratka noć" / "Puna noć" mod switch u pre-noć ekranu. Preporučujem Opcija A — konzistentnost je važnija od dubine u branded igri.

---

### MEDIUM — R3: Sinergija sistem može biti nevidljiv prvim igračima

**Šta može da puca:** Concept pominje da su sinergije "delimično skrivene" kao discovery hook. Ovo je lepo za hardcore igrače koji igraju 3+ puta, ali za prvog prolaza (koji je jedini prolaz za većinu branded igara) igrač ne zna šta radi. Ako prvih 5 minuta nisu "wow", igrač odlazi — i ne sharuuje.

**Zašto je MEDIUM (ne CRITICAL):** Postoji fix koji ne menja core: prikaži bar jednu aktivnu sinergiju u roster screenu unapred (na primer, ako imaš Maja + Ana, pokaži "Magnetar × Webs = +Social chain bonos"). Discovery loop ostaje za napredne kombinacije.

**Preporuka:** UI mora imati "Active Synergies" preview panel u roster screenu koji pokazuje sve detektovane sinergije za trenutnu selekciju. Skrivene sinergije postoje ali su bonus, ne default.

---

### MEDIUM — R4: Bond sistem je predugoročan za 15-minutan engagement

**Šta može da puca:** Bond Level 1 zahteva 3 zajedničke noći. To je 45+ minuta igranja pre nego što se Bond 1 aktivira. Za casual/branded igru, ovo je retention cliff — većina igrača neće stići do Bond-a. Sistem postoji ali ga većina neće videti.

**Zašto je MEDIUM:** Bond nije core gameplay — ali je jedan od glavnih replay hook-ova naveden u concept-u. Ako hook ne funkcioniše u praksi, replay je slabiji.

**Preporuka:** Bond Level 1 na 2 zajedničke noći (ne 3). "Zapali" animacija za Bond odmah posle druge noći daje instant gratifikaciju. Bond 3 ostaje na 5 noći — za hardcore.

---

### LOW — R5: Tonović DJ karta je previše kasna za brand utility

**Šta može da puca:** Tonović DJ (Kluboslavija tier karta) se unlockuje tek posle "Legendarna noć" achievement-a. Ovo je potencijalno 60+ minuta igranja. Korisnici koji igraju 1–2 noći za brand exposure nikad ne vide eksplicitnu Kluboslavija referencu u gameplaju.

**Zašto je LOW:** Ostale karte nose brand narativ i share hook postoji od prve noći. Tonović je bonus, ne core. Ali idealno bi se Kluboslavija karta pojavljala ranije.

**Preporuka:** Napravi Tonović DJ dostupnim od druge noći kao "featured guest" (ne unlocked za play, ali vidljiv u rosterу kao "coming soon" sa Kluboslavija logom). Vizuelna prisutnost = brand impression čak i bez unlock.

---

## Brand-utility kritika

**Da li Avala hype angle zaista radi, ili je decoration?**

**Zaključak: Radi, ali samo ako share hook zaista funkcioniše tehnički.**

Pozitivno:
- "Perspektiva gosta" umesto promotera je prava taktika — svako od 5000 Avala posetilaca može da se identifikuje. Festival Mreža je bila za "insajdere"; Avala Crew je za svakoga.
- Arhetipovi su dovoljno prepoznatljivi da generišu "to je moj drug" momenat → organičan share.
- "14 dana do Avale" vremenska urgentnost je autentična i radi kao motivator za igru odmah.

Briga:
- Share hook sa generisanom karticom mora raditi flawlessly na mobilnom. Ako html2canvas puca ili slika izgleda loše na telefonu, ceo social amplifikacioni chain pada. Ovo nije design problem, ovo je impl prioritet #1.
- Ticketing CTA u outro screenu mora biti sa stvarnim linkom. Jova mora da zna koji je URL pre impl-a. Placeholder URL koji ne vodi nikud je gori od ne-postojećeg CTA-a.

**Brand utility nije decoration ako:**
1. Share karta se generiše u ≤2 sekunde na mobilnom
2. Ticketing link je stvaran i prati ko dolazi iz igre (UTM parametar)
3. Barem jedna karta u starter roster-u ima Kluboslavija referentni detalj u opisu

---

## Preporuke za korekcije (sažeto)

1. **Mile mora specificirati** scenario resolution formulu pre impl-a (GDD prioritet #1)
2. **Redukovati scenarije** na 10 po noći (3 faze × 3–3–4) ili dodati "Kratka noć" mod
3. **Aktivne sinergije** moraju biti vidljive u roster screenu (ne skrivene za prvog igrača)
4. **Bond 1 na 2 noći** (umesto 3)
5. **Tonović DJ** vidljiv ranije kao "coming soon" sa Kluboslavija logom
6. **Jova dobija stvaran ticketing URL** pre impl-a, sa UTM parametrom

---

## Red line — koji uslov bi značio "ne ide u impl"

**Igra ne ide u impl ako Mile Mehanika ne isporuči kompletnu scenario resolution matricu u GDD.**

Bez definisane formule (koji stats → koji outcome, koji stat thresholds → koji Aftermath), Jova ne može da kodira srž igre. Sve ostalo je asset i UI — to se može improvizovati. Core resolution system ne može.

Ako GDD nema kompletnu matricu (minimum: stat scoring formula, 15+ scenarija sa thresholdima, Aftermath stack definition) — concept sesija mora imati jedan krug revizije: Mile piše dopunu, Gari revidira, tek onda 09:00 trigger aktivira impl.

**Sve ostale preporuke su nice-to-have, ne blockers.** Igra je deployment-ready čak i bez Bond sistema i bez Tonović DJ karte — core je roster selekcija + scenario resolution + share hook.
