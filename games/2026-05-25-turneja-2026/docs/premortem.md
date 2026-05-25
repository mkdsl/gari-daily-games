# Premortem — Kluboslavija: Turneja 2026

**Kritičar:** Nega Negovanović  
**Datum:** 2026-05-25  

---

## 1. Verdict

**DRŽI UZ KOREKCIJE**

Core hook postoji. Problem je u složenosti koja nije potkrepljena dovoljnim brojem sati implementacije.

---

## 2. Showstopper rizici (CRITICAL)

**Deck-builder + manager = dvostruka kognitivna cena.** Igrač uči dva sistema istovremeno. Ako onboarding nije rešen u prvim 3 minuta, nema 5. minute. Concept nigde ne pominje tutorial ni uvodnu rutu — to je rupa, ne sitnica.

**Random eventi bez recovery opcije ubijaju session.** "Struja pala" i "kišna iznenada" su hard check-ovi. Ako igrač u Bloku 1 nema tonac kartu, event je gotov — a sistem ne garantuje da je ta karta uopšte bila u šanku. Nasumičnost bez mitigacije = frustracija, ne tenzija.

**Carry-over bez auto-save je bankrot rizik.** Reputacija, budžet i morale idu 1:1 između eventova — jedno loše veče kaskadno ruši ostatak turneje. Bez checkpoint mehanizme, jedan bag u progression sistemu znači izgubljena sesija.

---

## 3. Dizajn upozorenja (MEDIUM)

**Pet gradova = pet isti patterni.** Avala, Niš, Štrand, Sarajevo, Guncati — da li svaki grad ima distinktivne modifier-e, ili je to isti šank sa drugačijim backgroundom? Ako je drugo, replayability pada posle drugog eventa.

**Sinergije matrica od 3 para nije dovoljno duboka.** DJ+MC, tonac+video, security+host — igrač ih memorise u prvoj partiji i od tada ne bira, nego optimizuje mehanički. Nema disonance, nema tradeoff-a. Matricu treba proširiti ili dodati kontrasinergije.

**"Karte iz šanka" mehanizam za booking ne korespondira vizuelno sa deck-builder noću.** Dva sistema koriste metaforu karte a rade različite stvari — konfuzija termina pre nego što igrač razume razliku.

---

## 4. Brand-utility kritika

Sprega je funkcionalna, ali tanka. Avala CTA je organski vezan za gameplay bonus — to je dobro. Problem: igrač koji ne zna šta je Avala ili Kluboslavija nema kontekst zašto da klikne. Igra ne gradi brand lojalnost, samo pretpostavlja da je igrač već lojalista.

Preporuka: jedan ekran između turneja (mapa ili novinski isečak) koji daje kratki flavor text o lokaciji. 2-3 rečenice. Gradi world, uklanja alienaciju.

---

## 5. Scope procena

Za 6h implementacije, sledeće je realno:

- Macro layer + micro layer: **da, ako se reciklira postojeći deck UI**
- Random event sistem sa 3 tipa: **da**
- Sinergije matrica: **da**
- Turneja map renderer: **ne** — trim

Turneja map renderer je vizuelni bonus, nije gameplay. Zameni ga statičnim city card-om. Uštedi 1.5-2h koje idu u onboarding flow i recovery mehanizmu za random evente.

---

## 6. Zaključak

**Drži uz korekcije.**

Akcije za Mile Mehaniku:

1. Napiši explicit onboarding za prva 2 bloka — bez njega igra ne preživljava prvih 5 minuta
2. Dodaj mitigaciju za random evente: svaki event ima "fallback karticu" ili barem upozorenje pre nego što počne blok
3. Trim turneja map renderer — statični city card umesto rendera
4. Razdvoji terminologiju: "ponuda" za booking, "karta" samo za deck
5. Dodaj po jedan distinktivni modifier po gradu (npr. Štrand = +beach crowd bonus, Sarajevo = +balkanski media multiplier)
