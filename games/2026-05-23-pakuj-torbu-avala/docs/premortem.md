# Premortem — Pakuj Torbu
_Perspektiva: Nega — maksimalno kritičan_

---

## Šta može da puca

### 1. Touch UX na mobilnom — KRITIK
Click-to-select + click-to-place mehanska je zahtevnija od drag-and-drop — ali drag-and-drop na malim ekranima (grid ćelija = ~52px) je još gore. Ako igraju na 360px wide telefonu, 6×8 grid je ceo ekran, panel je premali, predmeti su nestabilni za tap. Risk: **player ne može fizički da smesti predmet tamo gde hoće.**

**Preporuka:** Površina grid ćelija mora biti minimum 44×44px. Ghost preview mora biti uvek vidljiv na mobilnom. Rotacija mora biti 1-tap — ne da se skalira s dva prsta.

### 2. Timer balans — SREDNJI
Level 5 daje 60 sekundi za 7 required + 5 bonus predmeta na 6×8 gridu. Ako igraju prvi put, 60s je premalo da shvate rotaciju, koliziju i raspored. Frustracija pre nego što nauče pravila.

**Preporuka:** Level 1 početi sa 90s, ne 60s (već je implementovano). Možda pokažati tutorial na prvom pokretu (5s overlay „Klikni predmet → klikni grid“).

### 3. Grid premali za Jaknu — SREDNJI
Jakna (3×2 = 6 ćelija) na 6×6 gridu (Level 1) zajedno s ostalim obaveznim stavkama ne mora stati. Ako igrač pokuša da uključi sve bonus predmete na ranim nivoima, grid može biti premali — i player će dobiti seriju bunih/error zvukova.

**Preporuka:** Jakna je bonus samo od Level 3+ (već je tako), ali treba proveriti da su required predmeti uvek smetljivi u najgorem rasporedu (worst-case fitting test).

### 4. Nema vizuelnog feedback-a za „šta sam zaboravio“ — NIZAK
Kad vreme istekne, nije odmah jasno šta je promaklo. Player vidi penalize u breakdown-u ali ne vidi vizuelno u gridu „ova mesta ostala prazna“.

**Preporuka:** Game over ekran treba eksplicitno istaknuti missed required items u crvenom (već implementovano — proveriti da boje rade na svim browserima).

---

## Evaluacija

**Drži uz korekcije.**

1. **Skaliranje na mali ekran:** Implementirati `min(CELL_SIZE, floor(availableHeight / gridH))` da grid nikad ne izlazi van viewport-a.
2. **First-run hint overlay:** 3-sekundni intro koji pokaže click-to-select interakciju, narogato na mobilnom.
3. **Worst-case fit test:** Runo proveriti da Level 1-2 required items uvek stanu u grid (dodati test u generator.js ili napraviti spreadsheet proveru).

---

## Brand-utility kritika

Karta kao REQUIRED predmet je briljantan. Bilet URL je vidljiv ali ne agresivan. CTA je integrisan, ne interrupts. **Ovo je dobra brand integracija** — ne reklama, već gameplay mehanika.

Jedina opasnost: ako igrač više puta fail-uje, može asocirati negativne emocije (frustracija od packinga) sa Avalom. Zato mora biti **pristupačno na Level 1** — da prvi win bude moguć za 80% igrajućih.
