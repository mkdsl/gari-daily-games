# Premortem — Kartaški Front

## Razumevanje koncepta

Pravi se solo PvE deckbuilder sa permadeathom. Igrač prolazi kroz 4 čvora (3 obična neprijatelja + 1 boss), svake runde vuče 5 karata, troši energiju (3 po rundi), igra Napad/Odbrana/Efekat karte. Pobeda donosi novu kartu, smrt resetuje sve. Vizuelno: tamna paleta, Canvas-crtani likovi i karte, monospace font. Bez assets fajlova — sve generisano u kodu. Cilj je 3–7 minuta po runu, targetirana sesija je kratka i napeta.

Ovo je iterativni card-combat sistem sa state machinom koji ima bar 5–6 diskretnih stanja (player_turn → animating → enemy_turn → reward → map → game_over). Nije trivijalno, ali nije ni složenost koja nadilazi dan implementacije — ako se drži scope.

---

## Analiza rizika

### Showstopper rizici (blokiraju release)

**1. State machine kompleksnost — sinhronizacija faza borbe**

Šta puca: Card game zahteva striktnu sekvencijalnost — karta se odigra, efekti se primene, animacija se završi, tek onda neprijatelj reaguje. Bez frameworka, ovo se ručno piše kao niz callbackova ili async/await lanaca. Jova lako napravi race condition: igrač klikne "Kraj runde" dok animacija nije gotova, ili neprijatelj napadne pre nego što se Shield primeni.

Zašto puca: Vanilla JS bez state machine biblioteke znači da se svako stanje (PLAYER_TURN, RESOLVING, ENEMY_TURN, REWARD, MAP) mora eksplicitno čuvati i provjeravati na svakom click/event handleru. Propustiti jedan check = dupli damage, mrtva karta koja se i dalje može kliknuti, ili enemy koji napada u player turn.

Alternativa: Mile mora u GDD eksplicitno definisati enum stanja i transition tablicu. Jova implementira jedinstven `gameState.phase` flag koji se proverava NA POČETKU svakog event handlera. Svi klikovi van `PLAYER_TURN` faze se ignorišu. Bez animacija koje blokiraju — kratke CSS tranzicije koje ne zahtevaju callback.

---

**2. Karta kao Canvas element — hit detection i drag & drop su trap**

Šta puca: Karte nacrtane na Canvasu nemaju DOM event handlere. Klik na kartu znači ručni hit test: `if (mouseX > cardX && mouseX < cardX + cardW && mouseY > cardY...)`. Ovo je ok za 5 statičnih karata, ali ako Jova doda hover state, "selected" highlight, i drag-to-play — to je 200+ linija samo za input handling karata.

Zašto puca: Drag & drop na Canvas = kompletan custom implementation. Hover = invalidacija celog canvas frejma na svaki mousemove. Sa 5 karata u ruci + 2 lika na sceni, to je potencijalno 60fps full-redraw na svaki tick miša što može lagovati na slabijim uređajima.

Alternativa: Karte su DOM elementi (`<div>` sa CSS stilizacijom), ne Canvas. Canvas se koristi SAMO za battlefield (likovi, HP trake, intent ikone). Karte kao DOM = gratis click handleri, gratis hover, gratis accessibility. Ovo je ključna arhitekturalna odluka koja mora biti u GDD-u pre implementacije.

---

**3. Efekti stanja (Burn/Poison/Weak/Regen) — stack i timing**

Šta puca: 4 efekta × N slogova × tick na kraj runde = state koji je lako buggy. Burn koji ticki na kraju čije runde? Weak koji smanjuje damage — koji attack, za koliko, traje li jedan hit ili do kraja borbe? Ako Mile ne specificira ovo do detalja, Jova pravi vlastitu interpretaciju koja se razlikuje od player expectation.

Zašto puca: Deckbuilderi pucaju na edge casovima: Poison + Weak na istom neprijatelju, Regen koji te drži živim tačno jedan tick pre Boss-ovog finalnog udarca. Svaki od ovih edge casova koji ne radi konzistentno = osećaj "igra je buggana" čak i ako je samo nejasan dizajn.

Alternativa: GDD mora definisati timing pravila kao tablicu: "svi DoT efekti tiku na KRAJU vlasnikove runde, pre nego što protivnik odigra". Maksimalni stack = 1 po efektu (ne stackuju se). Jova implementira `applyEndOfTurnEffects()` kao jednu funkciju sa jasnim redosledom.

---

### Ozbiljni rizici (degradiraju iskustvo)

**4. Karta "Kraj runde" kao UX problem**

Šta puca: Igrač mora aktivno da klikne "Kraj runde" čak i kad nema karata ili energije. Ovo uvodi friction koja u kriznim situacijama (0 energije, 5 beskorisnih karata) oseća kao kazna.

Zašto degradira: Deckbuilderi poput StS automatski prelaze u enemy turn ako igrač nema energije (ili nude "End Turn" prominentno). Ovde, igrač sa praznom rukom mora da klikne dugme da bi nastavio — to je jedan klik previše kada je u panici od boss napada.

Alternativa: "Kraj runde" dugme uvek vidljivo i prominentno (ne sitnija opcija). Razmotriti auto-end ako energija = 0 i nema playable karata — ali ovo je Nice-to-have, ne blocker.

---

**5. Permadeath bez mid-run feedback = frustracija**

Šta puca: Run traje 3–7 minuta. Ako igrač padne na bos-u (4. čvor) bez jasnog razloga "zašto sam izgubio", osećaj je negativan i ne pokreće "još jedan run".

Zašto degradira: Bez post-run statistika (šteta primljena, karte odigrane, čime je boss ubio), igrač ne uči. Roguelike retention loop zavisi od osećaja "naučio sam nešto". Bez toga, poraz = frustracija, ne motivacija.

Alternativa: Game over ekran mora da prikaže: boss-ov finalni napad, igrač HP na kraju svake borbe, koje karte su bile u špilu. Ovo je relativno jeftino — samo display state koji već postoji.

---

**6. Canvas rendering — minimalistički likovi kao wild card**

Šta puca: "Minimalistički ASCII art / Canvas-drawn pixel silhuete" je neodređeno. Ako Pera Piksel i Jova ne usaglase šta to konkretno znači pre implementacije, dobijamo ili bele kvadrate (previše minimal) ili sat vremena crtanja koje se ne uklapa u budget.

Zašto degradira: Vizuelni identitet igre zavisi od likova. Ako neprijatelj izgleda kao "pravougaonik sa štapićima" bez jasnog threat reading, scena nema čitljivost — igrač ne oseća "napadam nekog".

Alternativa: GDD/art brief definiše: svaki lik = 3–5 Canvas.arc/lineTo poziva, maksimalna visina 80px, sa bojom kao primarnim identifikatorom (boss = crvena, regularni = siva, igrač = zlatna). Ovo je trivijalno implementirati i daje vizuelni identitet bez sati crtanja.

---

### Kozmetički rizici (nice-to-fix)

**7. Monospace font + dark theme + sitni tekst na kartama = čitljivost**

Karte imaju naziv + trošak + opis u malom prostoru. Na mobilnom (375px ekran), 5 karata u redu je nečitljivo. Rešenje: karte se prikazuju kao fan ili scrollable red, ne svih 5 najednom u redu. Jednolinijski opis (max 20 karaktera). Ovo nije blocker, ali ako prođe bez testa na 375px — beta će ga uhvatiti.

**8. Audio — 2 sinusna oscilatora za ambijent**

Web Audio API loopovi su stabilni, ali autoplay policy blokiraju audio pre prvog korisničkog klika. Ako Ceca ne postavi audio context resume na prvi click event, igra će biti tiha. Ovo je jednolinijski fix, ali mora biti na radar.

**9. Karta sa cost 3 energije u decku od 10 karata**

Ako igrač dobija karte kroz run i skuplja one sa cost 3, može dobiti ruku koja je neplayable (5 × cost 3 = 15 potrebnih energija, a ima 3). Ovo je matematički edge case koji Jova mora da testira: uvek imati bar 2 karte cost 1 u početnom deck-u.

---

## Verdikt

**Drži uz korekcije**

Kartaški Front je izvodljiv u jednom danu implementacije, ali samo ako se donesu dve arhitekturalne odluke PRE nego što Jova piše liniju koda:

**Korekcija 1 (obavezna):** Karte su DOM elementi, ne Canvas. Canvas = samo battlefield. Ovo eliminiše custom hit detection za input i spašava 100+ linija koda koji bi bio buggy.

**Korekcija 2 (obavezna):** GDD definiše state machine eksplicitno — enum faza, transition pravila, timing DoT efekata kao tablicu. Jova ne improvizuje state logic.

Sve ostalo (permadeath statistike, čitljivost mobilnog, audio autoplay) su ozbiljni ali rešivi u implementaciji bez promena na konceptu. Koncept sam po sebi je čist, scope je realan, hook je validan — nema potrebe za Sinetovom revizijom.

Jedno upozorenje za Mileta: GDD mora biti konkretniji nego inače. Card game balans bez konkretnih tabela (starter deck lista, enemy HP vrednosti, boss damage formule) garantuje poslednji sat implementacije koji je guessing game, a ne coding.
