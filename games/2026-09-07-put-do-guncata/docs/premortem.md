# Premortem — Put do Guncata

**Autor:** Nega Negovanović
**Input:** `docs/concept.md`
**Datum:** 2026-09-07

---

## Steelman pre napada

Ovo je najbolje smišljen "žanr diverzitet" potez u poslednje vreme. Posle dva multi-layer manager-sim projekta zaredom (Crew Recruiter, Jesenji Tok), text/narrative adventure je pravo osveženje, a premisa je pametna: pet etapa = pet različitih input tipova, ne jedna mehanika recikliran 5x. Brand serves nije nalepljen naknadno — Guncati se pojavljuje kao **mesto** (etapa 5 jezero/ribe/glina) i kao **lik u priči** (Brana), ne kao meta-referenca ili loading-screen logo. Prestige hook menja dve etape suštinski (dan/noć), ne samo boju. 32 modula, jasno raspoređeno po kategorijama, zbir potvrđen. Ovo drži.

Sada na stvar — četiri stvari koje je Iskra sama flagovala, plus par koje su mi upale u oči dok sam čitao.

---

## RIZICI (rangirano: showstopper → rizik → kozmetika)

Nema showstoppera. Sve dole je rešivo u GDD fazi (KORAK 3, Mile) bez vraćanja koncepta na reviziju.

### RIZIK 1 — Etapa 3 izbor je "slep stat-check", ne "slepa radoznalost" (Iskrina tačka #2)

Postoji razlika između "ne znam šta me čeka narativno" (fino, to je feature — vidi HOOK tačka 2) i "ne znam da li me ova labela boduje gore" (nije fino). Concept kaže da etapa 3 izbor **direktno ulazi u Pripremljenost formulu** ("koju rutu bira igrač na etapi 3" je jedan od inputa u WIN CONDITION sekciji). Ako "brže/slikovitije/sigurnije" nose različit skriveni bonus/penal na score bez ikakvog signala, a igrač u JEDNOM run-u vidi samo jednu rutu (nema learning-within-run), onda ishod (zelena/žuta/humor scena) delom zavisi od pogotka na nazivu table — to se čita kao nepravedno, posebno jer je ostatak igre eksplicitno anti-punitivan (nema fail state, humor kao safety net). Kontradiktorno je imati meku, oproštajnu filozofiju svuda OSIM na jednoj tački gde je kazna nevidljiva.

**Korekcija:** Mile u GDD-u eksplicitno definiše da izbor rute SAM PO SEBI nosi ~0 neto razlike u Pripremljenosti (routes su balansirane po dizajnu) — varijacija dolazi isključivo iz IZVEDBE na etapi 4 (koliko prepreka pogodi), ne iz same table koju bira. Time "slep izbor" ostaje radoznalost (šta ću videti), a ne kockanje (koliko ću izgubiti).

### RIZIK 2 — Etapa 5 varijante: dve konkurentske ose grananja nisu pomirene (LOC/scalability tačka #1)

Concept sadrži dva različita objašnjenja za "3-4 varijante" etape 5:
- WIN CONDITION sekcija: 3 varijante, ključ = **score bucket** (≥70 / 40-69 / <40)
- PREMISA + CORE LOOP: varijante zavise i od **rute** ("koju rutu je izabrao")
- `branching-tree.js` opis: "tekst varijante **po ruti**"

Ako se ovo ne razreši pre impl-a, Jova ima dva puta: (a) pomeša ose i piše 3 rute × 3 bucket-a × 2 dan/noć = do 18 jedinstvenih epilog tekstova — to je content eksplozija koja realno gura JS/tekst LOC iznad 12000-15000 opsega za JEDNU sesiju (09:00 impl je već pun: 5 mehanika + unified input.js + router.js + audio + share); ili (b) improvizuje pojednostavljenje usred impl-a bez GDD odobrenja, što je tačno scenario koji KORAK 0a/0e retrospektive love — drift između koncepta i stvarno napisanog koda.

**Korekcija:** Mile u GDD-u bira JEDNU osu kao primarnu za TEKST (preporuka: score bucket, jer je to već formalizovano u WIN CONDITION brojevima), a rutu koristi samo za pozadinu/prop detalje (koje je drvo, koja životinja u kadru) koji se recikliraju preko bucket-a. Day/night menja ambijent/paletu, ne dupla tekst. Ovo drži broj jedinstvenih epilog tekstova na 3 (možda 4), ne 9-18.

### RIZIK 3 — Procena LOC (6000-8000) je ISPOD GDG target poda (8000-12000), ne iznad njega

Ovo je suptilnije od "hoće li 32 modula stati ispod hard cap-a 15000" — stane lako. Problem je suprotan: originalna procena je ispod donje granice targeta. Pravilo u CLAUDE.md je eksplicitno: *"Ako je impl stage 'tanji' od ovog cap-a: vraća se u Mile za scope-up, ne ide u polish."* Ako se to desi TEK na kraju 09:00 impl sesije (posle Jova već napisao kod), to je skuplji bounce nego da se reši sada, u GDD fazi, pre nego što se ijedan token impl budžeta potroši.

**Korekcija:** Mile u KORAK 3 (GDD) eksplicitno adresira LOC gap dodavanjem DUBINE, ne novih modula — granularnije formule za resource-balance (etapa 2), više obstacle-pattern varijanti za etapu 4 po ruti, konkretnije Pripremljenost formule sa više inputa. Cilj: GDD izlazi sa realističnom LOC procenom u 8000-12000 opsegu PRE nego što impl počne, ne posle.

### RIZIK 4 — Etapa 3 je preopterećena I nema sopstveni time budget (Iskrina tačka #3)

Etape 1, 2, 4 imaju eksplicitan vremenski budžet (~60s, ~3min, ~90s). Etapa 3 — koja mora da nosi (a) izbor rute kao UI, (b) Branin brand hook u 3 rečenice, (c) tihо postavljanje grananja za etape 4 i 5 — nema naveden budžet uopšte. To je rupa u pacing specifikaciji za baš onu etapu koja radi najviše posla. Dodatni problem: Branin hook se dešava na SAMO JEDNOJ od tri rute, što znači da 2/3 playthrough-ova (statistički, po run-u) NE VIDE primarni Guncati edukativni brand moment uopšte — vidi i brand-utility kritiku ispod.

**Korekcija:** Mile dodaje eksplicitan target (~45-60s) za etapu 3 u GDD. Iskra/Sine razmatraju da skrate Branin hook na ambijentalni tračak (jedna linija, vidljiva na SVE tri rute — npr. udaljen glas/znak koji se pomene bez obzira na izbor) + puna 3-rečenična verzija samo na jednoj ruti kao bonus, tako da svaki run bar dodirne Guncati sadržaj, a ne samo 1 od 3.

### RIZIK 5 (kozmetika/proces) — Branded igra, single-layer: eksplicitno dokumentuj izuzetak

CLAUDE.md multi-layer princip kaže da branded/utility igre default treba da budu multi-layer manager/sim. Ovo je namerno single-layer (žanr diverzitet posle dva multi-layer projekta zaredom) — validna odluka, ali nigde u concept.md nije eksplicitno napisano ZAŠTO odstupa od default pravila. Retrospektive (vidi istoriju KORAK 0a-0e nalaza u ovom repo-u) redovno hvataju baš ovakva neobjašnjena odstupanja kao "drift".

**Korekcija:** Jedna rečenica u concept.md ili gdd.md: "Single-layer je namerna žanr-diverzitet odluka (izuzetak od multi-layer default pravila) posle Crew Recruiter i Jesenji Tok — vidi CLAUDE.md Žanr Paleta sekciju." Petominutni fix, sprečava lažni alarm kasnije.

### RIZIK 6 (rizik, ne showstopper) — Prvi text-adventure za GDG = nema template za ponovnu upotrebu, a impl je gust

32 modula, 5 suštinski različitih mikro-mehanika (timing/resource/choice/dodge/narativ) + nov unified `input.js` (Pointer Events preko sve četiri) + nov `router.js` (linearno + grananje) — sve u JEDNOJ 09:00 sesiji, i ovo je PRVI put da GDG pravi ovaj žanr, znači Jova nema prethodni modul da kopira/adaptira kao kod arkada/idle igara. Realan rizik neravnomernog kvaliteta — jedna etapa (verovatno etapa 4, obstacle-dodge, najviše "generic") ispadne tanja ako budžet stegne pred kraj sesije.

**Korekcija:** GDD definiše eksplicitan prioritet gradnje: etapa 3 (brand hook) i etapa 5 (Guncati payoff + crosslink) su "protected" — ne smeju biti stanjene ako budžet zategne; etapa 1/4 su prve kandidati za pojednostavljenje ako 700K-1.2M granica pritisne pred kraj impl sesije. Ovo nije novo pravilo — samo eksplicitan redosled unutar postojećeg "partial commit, nastavi sledeći put" mehanizma.

### RIZIK 7 — Win condition bez fail state slabi etapu 2 (Iskrina tačka #4)

Ovo JE realan rizik, ali nižeg intenziteta nego što zvuči, jer GDG ima konzistentnu anti-punitivnu politiku (i to je ispravno za ovaj brand — Guncati/Kluboslavija ton nije "kazni igrača"). Suština problema: ako igrač NIKAD ne dobije terminal loš ishod (samo humor scena, i dalje deljiva), resource-balance na etapi 2 gubi opipljiv "stakes" osećaj u trenutku igranja — feedback stiže tek na kraju (score %), ne tokom same etape.

**Korekcija:** Ne menjaj win condition (anti-punitivni ton ostaje, to je brand-tačno) — dodaj VIDLJIV, trenutan feedback tokom etape 2 (mali +/- Pripremljenost popup posle random event-a, gorivo/vreme trenutni impact indikator). Stakes ostaju odsutne na kraju, ali su prisutne u trenutku odluke — to je jeftina izmena (UI/systems, ne redizajn mehanike) koja rešava suštinu bez uvođenja fail state-a.

---

## BRAND-UTILITY KRITIKA

**Guncati (primary) — funkcioniše, uz jednu rupu.** Jezero/ribe/glineni zidovi u etapi 5 su prisutni u SVAKOM run-u bez obzira na rutu ili score (potvrđeno u VIZUELNA ESTETIKA i SHARE CARD sekcijama) — to je stvaran, ne-dekorativan touchpoint, svaki igrač vidi Guncati pejzaž pre nego što fizički dođe. Crosslink ka Guncati Grand na zelenom ishodu je konkretan funnel, ne samo tematska veza. **Rupa:** Branin akvakulturni hook — jedini trenutak gde brend GOVORI, ne samo IZGLEDA — vezan je za 1 od 3 ruta. Statistički, većina pojedinačnih run-ova ne čuje Branu uopšte. Ovo nije fatalno (rešeno u RIZIK 4 korekciji), ali bez ispravke primarni brend ima jak vizuelni present, a slab edukativni present u većini playthrough-ova.

**Kluboslavija (secondary) — iskreno deklarisan kao lagan, i jeste lagan.** Concept ne preterano prodaje ovu vezu — Pera Period glasovna kontinuiranost + posredni crosslink kroz Guncati Grand (koji sam nosi K kao sekundarni brend). To je tanka veza, granica dekoracije, ali koncept to ne krije iza "primary"-nivo jezika — pošteno je označen kao secondary. Prihvatljivo kao je, uz jednu jeftinu nadogradnju: tagovati `aforizmi.js` pool tako da 1-2 linije mogu da nose datum/lokaciju kad je aktivna Kluboslavija kampanja — pretvara pasivnu glasovnu vezu u stvarno reusable promo asset bez dodavanja modula.

**Ukupna ocena sprege:** Funkcioniše, nije dekoracija — ali "primary" oznaka za Guncati zaslužuje da bude tačna u praksi (edukativni sadržaj vidljiv u većini run-ova, ne u 33%), pa je RIZIK 4 korekcija direktno vezana za brand-utility ocenu, ne samo za pacing.

---

## ZAKLJUČAK: **Drži uz korekcije**

Koncept je čvrst — žanr diverzitet je opravdan, brand serves nije nalepnica, hook logika (5 mehanika + grananje + prestige) realno drži 15-20 min. Nijedan nalaz ovde ne zahteva povratak Iskri/Sine na reviziju koncepta; svih 7 korekcija su GDD-nivo (Mile, KORAK 3) ili sitni doc dodaci, ne redizajn premise.

**Konkretne korekcije za KORAK 3 (Mile, GDD):**
1. Balansiraj etapa-3 rute na ~0 neto Pripremljenost razlike pri IZBORU — varijacija ide kroz izvedbu na etapi 4, ne kroz pogodak na labeli (rešava "slep stat-check" problem).
2. Razreši etapa-5 granajnu osu: tekst varijacije prati SCORE BUCKET (3), ruta utiče samo na pozadinske detalje — sprečava 9-18 epilog-tekst eksploziju.
3. Dodaj dubinu (ne module) da LOC procena stigne u 8000-12000 pre impl-a, ne posle.
4. Dodeli etapi 3 eksplicitan time budget (~45-60s) i razmisli o ambijentalnom Braninom tragu na SVE tri rute (puna verzija na jednoj, tračak na ostalim dve).
5. Jedna rečenica u concept.md/gdd.md o namernom single-layer izuzetku (žanr diverzitet posle 2 multi-layer projekta).
6. Definiši prioritet gradnje za impl sesiju: etapa 3 i 5 protected, etapa 1/4 prve za stanjivanje ako budžet pritisne.
7. Dodaj vidljiv trenutan +/- Pripremljenost feedback tokom etape 2 (jeftin UI dodatak, ne redizajn win condition-a).

Nijedna od ovih ne zahteva dodatnu premortem iteraciju — mogu ići direktno u GDD.
