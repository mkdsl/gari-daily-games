# Premortem — Zvučna Proba

**Autor kritike:** Nega Negovanović | **Datum:** 2026-05-24

---

## 1. Šta može da puca

**[CRITICAL] Audio razlika nije čujna na prosečnom mobilnom uređaju.**
Web Audio API oscilatori su sintetički i tanki. EQ korekcija od ±3–6 dB na mid frekvencijama kroz telefon zvučnik ili jeftine slušalice — igrač to neće čuti. Igra čiji centralni mehanizam nije perceptibilno validan je mrtva igra.

**[CRITICAL] Slideri na mobilnom touchscreen-u su motorički problem.**
Iskra je sama označila ovo. Max 2 slidera je tvrdo ograničenje ali ne rešava temeljni problem preciznosti. Rešenje: trostepeni odabir (◀ / ● / ▶) eliminisao slidere u potpunosti — implementovati bez izuzetka.

**[CRITICAL] Kriva učenja je nevidljiva igraču bez audio konteksta.**
"Mid je ugušen" — prosečan igrač Kluboslavija publike ne zna šta to znači. Tri opcije koje zvuče jednako strano su nagađanje, ne dijagnoza. Igra kažnjava neznanje umesto da ga gradi.

**[MEDIUM] Boss proba u rundi 4, 7, 10 je arbitrarna eskalacija.**
Ako osnovni loop ne drži, boss proba je samo brži put do Game Over-a. Nema mehanike koja priprema igrača za kompleksniji snippet.

**[MEDIUM] Lokalni leaderboard bez multiplayer-a je slaba retencija.**
"Još jednom" loop funkcioniše samo ako igrač ima koga da pobedi. Solo score tablica se hladi posle treće partije.

**[LOW] "Sava je zaustavio probu" Game Over poruka je kolorična ali ne informativna.**
Igrač ne zna šta je pogrešio dijagnostički. Odlazi bez učenja.

---

## 2. Showstopper rizici

Tri CRITICAL-a gore su kumulativna katastrofa. Posebno: ako igrač ne čuje razliku pre i posle korekcije, verifikacijski korak postaje teatro. Cela igra kolapsira u vizuelnu igru sa zvučnom dekoracijom — suprotno od namere.

---

## 3. Brand-utility kritika

Sprega postoji na papiru. Ali ako audio mehanizam ne funkcioniše, Tonket postaje ime na ekranu koji kaže "bravo" kad igrač nagađa. To nije pozicioniranje ekspertize, to je logo placement. Brand serve je dekorativan dok core loop ne bude igrativan.

---

## 4. Audio validacija

Web Audio API oscilatoru nedostaje harmonska kompleksnost pravog instrumenta. Design mora da radi i vizuelno: VU meter prikazuje EQ problem grafički — vizuelni teret nosi prikaz, ne samo uho. Testirati na najgorem slučaju — jeftine Bluetooth slušalice, 50% glasnoće — pre zaključavanja dizajna.

---

## 5. Verdict

**Drži uz korekcije.**

Premisa je relevantna, brand fit je smislen, gameplay loop je strukturno koherentan. Ali tri kritična rizika moraju biti adresirana pre implementacije.

---

## 6. Korekcije (IMPLEMENTIRANE u GDD)

**Korekcija 1 — Audio perceptibilnost.**
VU meter sa troznonskim spektrom u realnom vremenu nosi vizuelni teret — design radi i kad uho ne čuje jasno razliku.

**Korekcija 2 — Zamena slidera trostepenim odabirom.**
Tri dugmeta (◀ Smanjiti / ● OK / ▶ Pojačati) eliminišu motorički problem. Implementirano u GDD kao jedina mehanika korekcije.

**Korekcija 3 — Kontekstualni glosar inline.**
Prva pojava svakog termina (Mid, Bass, Sub-bas, Presence, Air) prati tooltip bubble — max 12 reči, jednom po sesiji. Implementirano u GDD UI modul 5.3.
