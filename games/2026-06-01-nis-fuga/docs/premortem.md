# Niš Fuga — Premortem
### Nega Negovanović | GDG Devil's Advocate

*Scenario: Igra je propala. Ovo su razlozi.*

---

## 1. Verdict

**DRŽI UZ KOREKCIJE**

Concept je solidan i brand-utility je genuina (retko za GDG igre). Ali ima tri strukturna rizika koja mogu sve srušiti pre nego što igrač stigne do Scene 3. Iskra je napravila lepu priču — Mile mora da je pretvori u sistem koji se može implementirati.

---

## 2. Showstopper Rizici (CRITICAL)

---

### CRITICAL-1: Dialog tree scope creep ubija implementation

**Problem:** 5 scena × 3 NPC × 3 opcije × 2-3 resource varijante = potencijalno 90-135 unikatnih dijalog čvorova. Jedan implementator koji piše i kod i sadržaj ne može oboje u punoj dubini.

**Mitigacija:** Hard cap 60 dijalog čvorova ukupno, ~12 po sceni. Resource varijante samo za NPC uvodni dijalog (1 linija), ne za sve grane. Flavor hotspotovi: 2 po sceni.

---

### CRITICAL-2: Resource balansiranje bez playtesting-a je guessing

**Problem:** Vreme od 300 min sa prosečnim odbitcima: all-bad scenario ostavlja 240 minuta viška. Vreme kao resurs je dekorativan, ne funkcionalan.

**Analiza:**
- Scenario A (sve loše): 300 - 15 - 10 - 12 - 18 - 5 = 240 min. Igrač NIKAD ne dobija hard fail.
- Scenario B (sve dobro): 300 - 5 - 10 - 8 - 10 - 2 = 265 min. Razlika 25 min — premala.

**Mitigacija:** Reskalirati prozor na 60 minuta pre deadlinea (igra počinje u 13:00 h). Loši izbori koštaju 8-20 min. Svaki loš izbor mora biti osetljiv.

---

### CRITICAL-3: CSS art za 5 scena + 5 NPC-ova je ogroman vizualni zadatak

**Problem:** Prepoznatljive Niš lokacije zahtevaju detaljan CSS art. Bez plana, neke scene izgledaju generički, neke dobro — nedoslednost ubija brand-utility.

**Mitigacija:** Mile definiše CSS art component library pre scene implementacije: 5 background templates, 5 NPC sprite formule, 1 UI sistem. Ako ne stigne sve — prioritet: Scena 1 (Bulevar), Scena 3 (Kafana), Scena 5 (Kapija).

---

## 3. Srednji Rizici (MEDIUM)

---

### MEDIUM-1: Reputacija kao skriveni resurs je antipattern za casual igrače

**Problem:** Casual igrač ne razume zašto mu se u Sceni 5 otvorila opcija. Replayability pada jer igrač misli da su endings random.

**Mitigacija:** Reputacija mora biti vidljiva (ikona srca koja se menja). Igrač treba da zna da nešto radi dobro ili loše.

---

### MEDIUM-2: Scena 4 (turistički vodič) je najslabija scena

**Problem:** Slobodan i blokada prolaza nema direktnu vezu sa Kluboslavija brandom. Nema muzički element. Najgenerički geg od svih pet.

**Mitigacija:** Zameni turističkog vodiča kao primary NPC. Predlog: ekipa sreće lokalnog muzičara koji ide na isti event — direktnija muzička i brand veza.

---

### MEDIUM-3: Mobile UX za point-and-click je neistražen u GDG-u

**Problem:** Hotspotovi na mobilnom moraju biti minimum 44×44px. 5-6 hotspotova na maloj sceni može biti frustrirajuće.

**Mitigacija:** Mile definiše minimum hotspot veličinu od dana prvog. Na mobilnom: action bar sa dugmadima koji odgovaraju hotspotovima.

---

### MEDIUM-4: Endings granularnost može biti premala

**Problem:** Ako su endings samo zbir poena, igrač koji napravio mešane odluke uvek dobija isti srednji ending.

**Mitigacija:** Minimum 2 endings triggeruju specifičnu kombinaciju resursa, ne samo ukupni score. Narativni sistem, ne samo scoring.

---

## 4. Mali Rizici (LOW)

### LOW-1: Niš sleng može biti previše insider
Svaki lokalni geg treba imati "universal sloj" — parking inspektor koji se nije razbudio je universalno smešan bez poznavanja Niša.

### LOW-2: Audio na mobilnom
Web Audio bez kompresora može biti neugodan. Implementirati master volume limiter.

### LOW-3: Dijalog font čitljivost
Speech bubble na kompleksnoj CSS pozadini — bela pozadina za bubble, minimum font-size 16px.

### LOW-4: Slot timing rizik
Ako datum Niš eventa nije fiksiran 14+ dana unapred, igra može biti lansirana prekasno. Organizacioni, ne tehnički rizik.

---

## 5. Brand-Utility Kritika

**Funkcionalno radi:** event link, Niš community identifikacija, hype timing.

**Dekorativno je:** Jovanka kao karakter nema eksplicitnu Kluboslavija vezu — ime benda se ne pominje u gameplay.

**Preporuka:** U Sceni 1, dijalog sa Dragoljevom eksplicitno pominje "Kluboslavija" po imenu. U Sceni 5, endings screen je branded "Kluboslavija Niš 2026". 10 minuta implementacije koja udvostručuje brand recall.

---

## 6. Token/Scope Kritika

**Uz korekcije: DA. Bez korekcija: NE.**

- Dialog tree: implementabilno uz hard cap 60 čvorova
- CSS art: implementabilno uz component library pristup
- Audio: GDG standard, 3-4h rada total
- Resource sistem: implementabilno, ali vrednosti moraju biti simulirane pre kodiranja
- 5 endings: implementabilno ako su tekstualni (ne nove scene)

Ovo je na gornjoj granici jednog impl stage-a. Mile definiše MVP i polish sloj.

---

## 7. Preporuka za Mile-a

1. **Resource balansiranje je #1 prioritet pre pisanja koda.** Spreadsheet simulacija sva 3 scenarija pre implementacije.
2. **Dialog tree arhitektura data-driven.** Svi čvorovi kao JSON, ne hardcoded if/else.
3. **Scena 4 treba redizajn.** Zameni turističkog vodiča sa muzičarem koji ide na event.
4. **Endings moraju biti kombinatorni.** Minimum jedna iznenađujuća kombinacija.
5. **Mobile hotspot veličina od prvog dana.** 44px minimum, nije afterthought.
6. **Eksplicitno Kluboslavija brandiranje u Sceni 1 i Sceni 5.**

---

*Nega Negovanović | GDG Premortem | 2026-06-01*
