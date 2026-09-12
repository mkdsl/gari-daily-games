# Premortem — Dan Posle

**Autor:** Nega Negovanović
**Datum:** 2026-09-11
**Igra:** Dan Posle (narrative choice / community builder)

---

## Šta Može da Puca

### SHOWSTOPPER — Invertovana Nered metrika konfunduje igrača
Nered ide 10→0 (pad = pozitivno), dok Veze i Sećanja idu 0→10 (rast = pozitivno). Tri resursa se ponašaju različito. Bez eksplicitnog UI koji jasno prikazuje "nered = loše, pad je dobro" — i bez boje, ikone ili teksta koji to komunicira u realnom vremenu — igrač će pogrešno čitati stanje. Na mobilnom, gde nema hover tooltipa, ovo je garantovana konfuzija u prvom play-through. Mora biti rešeno pre implementacije, ne posle beta testa.

### HIGH — 12-15 minuta ukupnog sadržaja, premalo za "community builder"
12 slotova × prosečno 1.5 odluke = ~18 klikova. Čak i sa sporim čitanjem to je 15 minuta. Igra se pozicionira kao community builder koji treba da izgradi emotivnu vezu — ali ta veza zahteva vreme i posledice koje se osete. Sa ovakvim tempom, treći završetak (prestige unlock) čovek dobija pre nego što mu je stalo do zajednice. Retention hook nije tu.

### HIGH — Prestige reset je mehanički mismatch za narrative choice žanr
U idleru, prestige daje permanentne multipliere koji menjaju ekonomiju. Ovde — šta se drži? Ako narrativni tekst ostaje isti u drugom playthroughu, prestige je etiketa bez supstance. Igrač koji dobije "Sledeće leto" završetak nema razlog da veruje da će drugi prolaz biti drugačiji, ne bolji. Ili prestige menja dostupne odluke (zahteva content koji sad ne postoji u specifikaciji), ili ga treba izbaciti.

### HIGH — Dva narativna text-igre za redom (09-09 i 09-11)
Put do Guncata izašao je pre dva dana, isti estetički register (DOM text, serif, atmospheric). Igrač koji oba igra isti dan ili isti vikend doživljava žanrovski umor. "Dan Posle" mora imati jasniji mehanički kontrast — resource grid vs. travel branching postoji, ali vizuelno i tonski su igre previše slične da bi se odmakle jedna od druge u percepciji.

### MEDIUM — Anonimni protagonist slabi brand differentiation
"Ti si organizator" — ko si ti? Igra u Guncati narativnom nizu koja ne imenuje Tomu (Tom Sawyer model je core brand direktiv) propušta najprostiji brand hook. Svaki generic festival sim ima "anonimnog organizatora". Konkretna Guncati ličnost u protagonisti ili kao centralni NPC pravi razliku između branded asset i žanrovski generičnog tekst-simera.

### MEDIUM — CSS satni prelazi nisu testirani na iOS Safari
12 background-color tranzicija kroz 12 sati, serif fonti, i DOM layout koji se oslanja na timing — iOS Safari ima poznate quirks sa CSS transitions na scroll i visibility. Bez Canvas fallback-a, ovo je jedina vizuelna estetika igre. Ako se tranzicije "pojede" na iPhoneu, ceo ambijentalni sloj pada.

---

## Brand-Utility Kritika

**Guncati:** Sprega je nominalna, ne funkcionalna. Igra se dešava na Guncati lokaciji po imenu, ali Guncati kao brand (Tom Sawyer model, masterclass, "povratak na selo" narativ, konkretno imanje) nije prisutan u mehanici ni u sadržaju koji je specificiran. "Kamp-gost hoće da ostane" i "komšija Slavko" su autentični detalji koji mirišu na pravo Guncati iskustvo — ali su zakopani u 12 slotova bez hijerarhije. Ovi momenti treba da budu istaknuti, ne ravnopravni sa "Instagram recap request".

**Kluboslavija:** Dekoracija. Instagram recap request nije Kluboslavija hook — to je generic social media hook. Novinarka koja traži priču ima potencijal (ako je priča eksplicitno o Kluboslavija turneji 2026), ali nije iskorišćen u specifikaciji. Igra ne zatvara narativni luk Guncati serije na nivou koji bi opravdao poziciju "4. i finalne igre niza" — to zahteva emotivni peak i tematsko zatvaranje, ne jedan od 12 slotova.

---

## Verdict: **drži uz korekcije**

Osnovna mehanika (temporal grid + 4 resursa + community score) je čvrsta i razlikuje se od Put do Guncata dovoljno da opravda postojanje. Problem nije koncept nego tri tačke implementacije koje, ako se preskoče, daju igru koja liči na skicu a ne na branded asset. Guncati narativni niz zaslužuje finale koje se oseća kao finale.

---

## Obavezne Korekcije Pre Impl (max 5)

1. **Nered UI:** Preimenuj prikaz resursa eksplicitno u "Nered (manje = bolje)" ili koristi vizuelni jezik koji je intuitivan (npr. ikonice smeća koje se smanjuju). Nikad goli inverted broj bez konteksta.
2. **Toma kao NPC:** Uvedi Tomin glas u bar 2-3 slota (ne protagonist — NPC) koji daje Guncati autentičnost i zatvara narativni luk serije.
3. **Prestige redef ili drop:** Ili specifikuj šta se menja u drugom playthroughu (1-2 nova odluka, promenjen Tomin dijalog) ili ukloni prestige i zameni ga nečim što narrativni žanr može da nosi (npr. permanentno otključan "Epilog" ekran).
4. **Novinarka slot = Kluboslavija hook:** Taj jedan slot eksplicitno neka bude o turneji 2026 — novinarka pita o sledećem Guncati occupancy plan-u. Jedan konkretan link pravi razliku između branded i generic.
5. **iOS Safari CSS tranzicije:** Jova testira background-color transition na mobilnom pre beta — ako puca, fallback je klasa toggle (instant swap), ne smooth. Bolje bez tranzicije nego broken estetika.
