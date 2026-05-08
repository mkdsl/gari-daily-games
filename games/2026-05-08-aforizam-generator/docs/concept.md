# Aforizam Generator
**Pera Period × Kluboslavija** — generativna estetska alatka

---

## Žanr
Generative text toy / ambient web experience

---

## Premisa
Korisnik je neko ko razmišlja previše — ili premalo. Otvori stranicu, klikne dugme, dobije rečenicu koja ga zaustavi na tri sekunde. Ne mora da razume odmah. Možda je podeli. Možda se vrati posle pića. Pera Period ne objašnjava — sugeriše.

---

## Core Loop
1. **Klik** → ekran se resetuje, pojavi se aforizam (fade in, jedna rečenica, centrirano)
2. **Čitanje** → tišina. Korisnik sedi s rečenicom. Nema ništa drugo na ekranu.
3. **Podeli ili ponovi** → copy dugme + share s Kluboslavija watermarkom. Ili novi klik — novi aforizam.

---

## Hook
> "Jedna rečenica koja zvuči kao da je napisana o tebi — a nisi siguran ko je Pera Period."

IG story format: aforizam belo na tamno, watermark dole desno, ništa više.

---

## Vizuelna Estetika
- **Paleta:** skoro crna pozadina (`#0d0d0d`), tekst off-white (`#f0ece4`), akcent prljavo zlatna (`#b8960c`)
- **Tipografija:** serif za aforizam (Playfair Display ili Lora), sans-serif za UI kontrole — kontrasni par
- **Osećaj:** kasna noć, jedan reflektor, pozornica bez glumca
- **Layout:** aforizam vertikalno centriran, bold, velik. Dugmad diskretna, dole. Ništa ne takmiči pažnju s rečenicom.
- **Animacija:** samo fade — tekst ulazi polako, kao da se priseti

---

## Audio Mood
Nema obaveznog zvuka. Opciono: jedan ambient drone koji se ne ponavlja očigledno — kao da je uvek bio tu. Ako Ceca Čujka ima nešto u fioci, može ući kao easter egg na 10. aforizam u sesiji.

---

## Win Condition
Korisnik podeli aforizam. To je sve. Share = pobeda. Watermark radi distribuciju.

---

## Targetirana Dužina Sesije
**3–5 minuta** — dovoljno za 5–8 aforizama, jedan share, odlazak.

---

## Aforizam Bank Plan
- **Ukupno:** 50–60 aforizama pri launchu
- **Kategorije:**
  | Tema | Broj | Status |
  |---|---|---|
  | Telesno-filozofski | 15 | postoje |
  | Eko-poetski | 12 | postoje |
  | Ironično-mistično | 10 | postoje |
  | Nightlife / DJ / klub | 12 | **pisati novo** |
  | Ples / kretanje / ritam | 10 | **pisati novo** |
- **Selekcija:** potpuno random, bez filtera po mood-u — Pera ne sortira
- **Duplikati:** ne ponavljati u istoj sesiji (runtime tracking, bez localStorage)
- **Format:** jedna rečenica, max 12 reči. Nikad glagol "trebati" ili "morati".

---

## Šta Nema
Nema canvasa. Nema scoreova. Nema player entiteta. Nema localStorage. Čist DOM, čist tekst, čista distribucija.

---

*Sine, 2026-05-08*
