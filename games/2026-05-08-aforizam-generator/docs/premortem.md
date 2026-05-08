# Premortem — Aforizam Generator
**Analizator:** Nemanja "Nega" Negovanović | GDG Premortem Specijalista
**Datum:** 2026-05-08

---

## 1. Steelmanning

Koncept je čist i disciplinovan: jedna rečenica, jedan klik, nula šuma. Format je prirodno prilagođen IG story-ju — vertikalan, minimalan, shareovable bez da korisnik mora ništa da uradi osim da screenshot-uje ili kopira. Watermark distribuira brend pasivno. 50+ aforizama je dovoljno za nekoliko sesija pre ponavljanja. Bez baze, bez logina, bez trenja — proboj do share-a je u sekundi. Ako sadržaj drži, mehanika radi.

---

## 2. Ključne pretpostavke

1. Aforizam koji korisnik dobije zvuči kao "Pera Period" — prepoznatljiv stil, ne random mudrolija.
2. Share mehanizam funkcioniše vizuelno (watermark se vidi u onom što se deli).
3. 22 nova aforizama (nightlife + ples) biće pisana u istom kvalitetu kao i postojeći korpus.
4. 50–60 aforizama je dovoljno da sesija ostane svježa bez zamorne repeticije.
5. Korisnik razume da nema ništa "više" — tišina je feature, ne bug.

---

## 3. Napadi — Rizici

### SHOWSTOPPER — Share bez vizualnog watermark-a
Čist DOM + "copy" dugme kopira tekst u clipboard. Tekst nema watermark. Korisnik paste-uje aforizam u story — watermark nestaje. Distribucija se gubi. Canvas je eksplicitno isključen iz dizajna.

**Korekcija:** Umesto copy-to-clipboard s watermarkom, omogući download PNG-a generisanog server-side ili client-side putem `html2canvas` ili `dom-to-image` biblioteke — bez canvas API-ja ručno. Alternativa: copy kopira tekst + attribution suffix (`— Pera Period / Kluboslavija`) koji korisnik vidi i retko briše.

### SHOWSTOPPER — Stil 22 novih aforizama
Nightlife i ples kategorije se pišu novo. Ako autor nije Pera Period ili neko tko ga razume duboko, aforizam zvuči kao kafanski fejk-duboki tekst. Watermark Kluboslavije tada legitimizuje nešto ispod standarda i oštećuje oba brenda.

**Korekcija:** Definisati stil guide pre pisanja (3–5 primera po kategoriji kao referenca). Svaki novi aforizam prolazi kroz review — minimum Pera Period čita i odobrava. Ne lansirati dok 22 nema zeleno svetlo.

### VISOK — Ponavljanje u sesiji
50 aforizama, runtime tracking bez localStorage. Refresh resetuje tracking. Korisnik koji klikne 20 puta u jednoj sesiji ima 40% šanse da vidi duplikat unutar iste posete.

**Korekcija:** Prikazati sve aforizame pre prvog ponavljanja (Fisher-Yates shuffle po sesiji). Čak i bez localStorage, ovo funkcioniše u memoriji dok je tab otvoren.

### VISOK — Tišina kao feature shvaćena kao praznina
Korisnik koji dolazi bez konteksta može protumačiti prazan ekran i jednu rečenicu kao neispravnu stranicu. Nema onboarding-a.

**Korekcija:** Jedan subtilan hint pri prvom učitavanju — npr. aforizam se pojavljuje automatski (bez klika) i fade-uje dugme ispod njega. Korisnik uči loop bez instrukcija.

### NIZAK — Audio easter egg na 10. aforizam
Rizik: korisnik čuje zvuk u neočekivanom momentu bez kontrole jačine. Potencijalno frustrirajuće.

**Korekcija:** Easter egg OK, ali dodati vizualni signal (ikonica) umesto automatske reprodukcije, ili pitati pre prvog zvuka.

---

## 4. Zaključak

**Drži uz korekcije.**

### Obavezne korekcije pre launcha:
1. Rešiti share/watermark problem — `dom-to-image` download PNG ili text suffix. Canvas zabrana nije arhitekturalna — `dom-to-image` ne koristi canvas API direktno.
2. 22 nova aforizama prolaze Pera Period review. Nema launch bez odobrenja.
3. Fisher-Yates shuffle po sesiji — nema duplikata dok sve ne prođe.

### Preporučene korekcije:
4. Auto-show prvog aforizama bez klika — onboarding bez teksta.
5. Audio easter egg — vizualni opt-in, ne auto-play.
