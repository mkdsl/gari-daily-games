# Premortem — Sound vs Tišina

> Autor: Nega Negovanović
> Datum: 2026-05-22
> Odgovor na: concept.md (Iskra Ivanović)

---

## Verdict

**DRŽI UZ KOREKCIJE**

Koncept ima suštinsku vrednost i genuinui brand spregu — ali nosi četiri realna rizika koja mogu ubiti igru pre nego što igrač stigne do Avale. Korekcije su izvodljive u implementation stageu, ali moraju biti eksplicitno ugrađene u GDD, ne ostavljene za balancing iteraciju.

---

## Showstopper rizici

### Rizik 1 — Multi-layer scope je previše za jednu GDG igru

Koncept opisuje tri potpuno razvijena sistema: Macro (Season Manager), Micro (SPL puzzle), Meta (karijera sa ekonomijom i reputacijom). Svaki od ova tri sistema je sam po sebi vredan zasebnog GDG entry-a. Zajedno, ovo nije Gari Daily Game — ovo je Early Access Steam title. Ako implementation agent krene da implementira sve tri slojeve paralelno, rizikujemo nedovršen proizvod koji ni jedan sloj ne radi dobro.

**Korekcija**: Implementacija mora ići layer po layer. Micro (SPL puzzle) je core — mora biti poliran i fun sam po sebi bez Macro i Meta. Macro i Meta su nadogradnja, ne osnova. Ako vremenska linija pritiska, shipi samo Micro za 20. jun.

### Rizik 2 — SPL fizika: edukativno vs playable

Inverse square law, reflection bonusi, wind factor — sve to zvuči precizno u GDD-u. Problem: da li igrač koji nikad nije čuo za SPL razume šta znači "6 dB pad na dvostrukoj udaljenosti"? Postoje dva suprotna ishoda: (a) fizika je toliko simplifikovana da edukuje pogrešno, ili (b) fizika je toliko tačna da guši casual igrača koji samo želi da namesti slider i vidi heatmap. Oba su loša.

**Korekcija**: Igra mora imati jednu jasnu poziciju — **gamified akustika**, ne edukativni simulator. To znači: formula postoji u pozadini, ali igrač nikad ne vidi decibele direktno. Vidi boje (zeleno/crveno), vidi reakcije publike, vidi komšijin lik koji zatvara prozor. Brojevi su za debug mode i za GDG nerds koji čitaju docs.

### Rizik 3 — "Educational demo" trap

Najveći strah: igra je zanimljiva zbog koncepta (SPL fizika je cool), ali mehanika sama po sebi nije fun. Ako izvučeš brand kontekst (Kluboslavija, Avala, Sava), šta ostaje? Ostaje: podešavanje slidera dok heatmap ne pozeleni. To je konfiguracija, ne igra.

**Korekcija**: Mora postojati **pritisak**. Ne statički puzzle — dinamički eventi koji narušavaju tvoj savršeni setup. Vjetar koji zarotira heatmap u 23:47. Publika koja najednom udvostruči zahtev. Inspekcija u 02:30. Bez dinamičkog pritiska, ovo je screen saver, ne igra. Mile mora ovo numerički definisati.

### Rizik 4 — Happiness threshold kao jedini metric nije dovoljan

Ako win condition je samo "happiness > X% i sused < 70 dB", igrač brzo shvati optimalni setup za svaki teren i replika ga bez razmišljanja. Nema napetosti. Nema tradeoff-a.

**Korekcija**: Treba eksplicitni tradeoff po eventu. Primer: svaki dB koji dodaš na dance floor = direktan SPL rast prema susedu (nema slobodnih ručkova). Igrač mora birati između maksimalne zabave (visok SPL) i sigurnog margina ka susedu (niži SPL). Ovo je prava mehanika, ne samo balance check.

---

## Brand-utility kritika

### Da li "Avala goodwill" je stvarna vrednost ili excuse za branded asset?

Iskra tvrdi da igra gradi goodwill kod lokalne javnosti time što pokazuje da Kluboslavija razmišlja o akustici. Ovo je poluistinita tvrdnja. Lokalna javnost ne igra GDG igrice. Goodwill se gradi direktnom komunikacijom sa komšijskim asocijacijama, ne gamifikacijom.

Ali: ovo nije argument da igra ne vredi. Vrednost je u drugom pravcu — **igrač koji dođe na Avalu je spreman**. Razume kontekst. Razume zašto su zvučnici okrenuti od sela. To je realna edukativna vrednost za Kluboslavija zajednicu, ne za susede koji nikad neće otvoriti igru.

**Zaključak**: Avala goodwill framing iz kataloga je marketing spin. Realna vrednost igre je community engagement, ne PR prema susedima. Komunikaciju prema javnosti treba razdvojiti od GDG strategije.

### Da li Sava i Tonketa pozicioniranje funkcioniše?

Koncept uvodi Savu i Tonketu kao mentore u igri. Ovo je jedina mehanizam brand sprege koji nije direktna reklama — to je storytelling. Ako je implementirano dobro (jedan hint od Save po eventu, u glasovitom tonu, ne kao tutorial popup), ovo zaista radi. Ako je implementirano loše ("Sava kaže: podesi slider na 78 dB"), to je product placement koji odbija igrača.

**Korekcija**: Sava/Tonketa dialog mora biti karakter, ne vodič. Impl agent mora imati bar 5 glasovitih Sava linija per venue, ne generičke instrukcije.

### Da li je brand sprega jednosmerna?

Igra koristi Kluboslavija brand da bi bila relevantna. Ali: da li Kluboslavija dobija nešto konkretno? Da — jedino ako postoji conversion: igrač vidi Avala 20. jun u igri i klikne na link. Bez tog linka, sve je brand awareness koji se ne meri. Impl agent mora ugraditi CTA u finale screen ("Bila je igra. Ovo je stvarnost: Avala 20. jun — [link]").

---

## Šta jedino čini ovu igru vrednom

Jedna stvar: **dinamički tradeoff u realnom vremenu**.

Ako igrač u 01:00 mora da pojača zvuk jer publika traži više — i tačno u tom momentu vjetar okreće prema susedu — i mora da odluči za sekunde: pojačam i rizikujem complaint, ili ostajem na sigurnom i publika se žali... to je fun. To je tenzija. To je ono zbog čega neko igra 15 minuta.

Sve ostalo (karijera, oprema, reputacija) je kontekst koji taj momenat čini značajnim. Ali taj momenat mora biti implementiran savršeno. Ostatak može biti skroman.

---

## Preporuke pre implementacije

1. **Prioritizacija**: Micro layer (SPL puzzle + dynamic events) = must-have za launch. Macro (Season Manager) = nice-to-have. Meta (Career ladder) = post-launch ili simplified.

2. **Gamified, ne edukativni**: Igrač ne čita decibele. Vidi boje, čuje reakcije, vidi lik komšije. SPL formula je pod haupom.

3. **Dynamic event tablica**: Mile mora definisati minimum 5 tipova dinamičkih evento po venueu (vjetar, publika spike, inspekcija, kvar opreme, media arrival). Bez ovoga igra je statički puzzle.

4. **Conversion CTA**: Finale screen mora imati klikabilan link ka Avala 20. jun eventu. Ovo je jedina merljiva brand mehanika.

5. **Sava/Tonketa karakter, ne vodič**: Minimum 5 glasovitih linija per venue, kontekstualne, ne instruktivne.

6. **Hard cap na scope**: Impl agent mora imati eksplicitnu instrukciju da ne počinje Meta layer dok Micro layer ne prođe beta test. Scope creep u impl stageu ubija GDG projekte.

7. **Fallback plan**: Ako multi-layer nije gotov za 20. jun, shipi samo SPL puzzle (jedan venue, Avala) kao standalone promo igru. Bolje završeno nego sveobuhvatno nedovršeno.
