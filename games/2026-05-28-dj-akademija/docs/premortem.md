# Premortem — DJ Akademija
**Agent:** Nega Negovanović | **Datum:** 2026-05-28

---

## Showstopper rizici

**[SHOWSTOPPER] Pitanja ne postoje.**  
Concept nema ni jedno konkretno pitanje. 10 MC pitanja o "DJ kulturi i Balkans noćnom životu" može biti fantastično ili katastrofalno — zavisi 100% od kvaliteta sadržaja. Ako pitanja nisu testirana sa stvarnom publikom pre 13. juna, igra je roulette.

*[Orkestratorska napomena: Pitanja SU napisana u concept.md, 10 kompletnih MC pitanja sa fact-ovima. Nega ih nije videla u briefu. Ovaj SHOWSTOPPER je adresiran.]*

**[SHOWSTOPPER] Timer 15 sek je neosetljiv prema čitanju.**  
Na mobilnom, korisnik čita pitanje + 4 opcije + dekodira smisao = 5–7 sekundi samo za razumevanje. Ostaje 8–10 sek za odluku. Ako su pitanja duga ili nebična terminologija, 15 sek eliminiše legitimne igrače, ne samo neznalice. Preporuka: produžiti na 20 sek ili dodati tap-to-start fazu.

---

## Brand-utility kritika

**[MEDIUM] Štrand hook je dekoracija, ne mehanika.**  
"Spreman/a za Štrand 13. jun?" na final screenu i logo u footeru su labeling, ne value proposition. Igra ne daje igraču ništa konkretno vezano za Štrand — nema lineup hint, nema ekskluzivnog sadržaja. Share dugme propagira hashtag, ali bez razloga zašto bi neko to podelio sem ega. Preporuka: titula "Head of Sound" treba da nosi opipljiv hook ("Pošalji screenshot na DM za guest listu" ili slično) — inače je share vanity, ne virality.

**[LOW] Titula "Obezbedi bio" može da otuđi.**  
Humor funkcijoniše samo ako brand ima kredibilitet sa publikom. Ako Kluboslavija nije dovoljno poznata, poenta se gubi.

---

## Tehnički rizici

**[MEDIUM] Web Share API fallback.**  
Na desktop browserima i nekim Android WebView kontekstima Share API ne radi. Bez fallback (copy-to-clipboard ili direktni link), share dugme je mrtvo dugme za deo publike — najgori momenat da igra zakaže.

**[LOW] localStorage best score — beznaznačjno bez konteksta.**  
Nema leaderboard, nema poređenja. Best score je log, ne gameplay. Može da ostane, ne treba da bude feature focus.

**[LOW] Keyboard A/B/C/D navigacija.**  
Na mobilnom je mrtav feature. Nije problem, ali ne treba QA vreme.

---

## Presuda

**Drži uz korekcije.**

Mehanika je solidna i proporcionalna scope-u. Korekcije pre deploy-a:
1. Timer na **20 sek** (ili tap-to-start per pitanje)
2. Web Share API mora imati **clipboard fallback**
3. "Head of Sound" final screen — razmotriti konkretan DM hook za virality
