# Premortem: Frekventni Grad

## Rizici implementacije (šta može pući u kodu)

**1. Timing preciznost u browseru — fundamentalni problem ritam igara**
`requestAnimationFrame` na 60fps daje ~16ms granulesnost. Za ritam igru na 140 BPM, jedan beat traje ~429ms — što zvuči dovoljno, ali "PERFECT" window mora biti strogo definisan (npr. ±30ms). Problem: browser event loop i JavaScript heap GC pauze mogu da naprave spike od 20-50ms, što će igrač doživeti kao lažni MISS na beatu koji je pogodio. Bez kompenzacionog algoritma (audio clock offset umesto frame counter), igra će se osećati nepouzdano.

**2. Web Audio sintetisanje bas linije i arpeggio-a — nije trivijalno**
"Sintetički 8-bit house bas sa melodičnim arpeggio-ima" generisan u kodu je ambiciozan za 3-4h. Web Audio može to da uradi, ali sinhronizacija AudioContext vremena sa vizuelnim beat krugovima zahteva pažljivo offseting — ako audio i vizual nisu locked, igra izgubi smisao. Ceca Čujka može to da rešiti ali to je neophodan deo, ne opcioni.

**3. Beat pattern sistem — generisanje, ne čitanje fajlova**
Bez .mp3 fajlova, beat patterns moraju biti hardkodirani nizovi ili proceduralno generisani. Za 4 kluba × više pesama po klubu, to je dosta pattern podataka. Ako se loše dizajnira data struktura, dodavanje novih pesama u fazi bugfix-a postaje noćna mora.

**4. Setlist kartica mehanika + "boo" mehanika — scope creep**
Tri setlist kartice koje menjaju vizuelni stil, tempo i patterns su zapravo 3 "skina" igre u jednom. Svaki ima sopstveni CSS mod, drugačiji timing, drugačiju boju. Uz "boo" mehaniku (razbacani beatovi), ovo je četiri zasebne gameplay varijante. Sve u jednom danu je napeto.

**5. Canvas glow efekti i sonar ring animacije — GPU/CPU teret**
CSS box-shadow na mnogo elemenata + canvas particle efekti pri svakom pogotku može da dovede do frame drop-a na slabijim mobilnim uređajima. Igra treba da se oseća responsivno — ako animacije padnu ispod 30fps, timing igra postaje neigriva.

## Rizici dizajna (šta može pući u gameplay-u)

**1. "Lock efekat" je subjektivan i teško ga je implementirati**
Hook celog koncepta je "čuješ, vidiš i osećaš svaki beat koji pogodis". Taj osećaj zavisi od subpixel preciznosti, audio feedback latencije, i vizuelnog juice-a koji mora biti besprekorno implementiran. U hitnoj implementaciji ovo je lako žrtvovati, a bez njega igra je prazna.

**2. Difficulty kriva — 4 kluba nisu dovoljno diferencirani**
"Teži ritmovi" na višim lokacijama bez konkretnih mehanika razlike je vaga problem. Ako je jedina razlika brzina kruoga, igra se plafonira i igrač nema osećaj da uči nešto novo — samo pati brže.

**3. Publika kao mehanika je nepovezana sa tapovanjem**
Energy bar, setlist kartice, "boo" mehanika — sve to je meta-sloj koji se oseća odvojen od core loop-a (tapuj u ritam). U igri bez jasnog vizuelnog feedback-a uzrok-posledica (miss → boo → haotični beatovi), igrač neće razumeti sistem i frustriraće se naizgled random otežavanjem.

**4. Dužina sesije vs. prestige mehanika — mismatch**
Prestige mehanika podrazumeva dugoročno ulaganje (sati, dani). "10-20 min sesija" sa prestige-om od 5 noći po klubu × 4 kluba znači da igrač mora odigrati 20+ noći (100+ minuta) da vidi prestige. To je ili previše ili premalo, zavisno od implementacije tempa — bez playtestinga broj neće biti dobro kalibrisan.

**5. Mobile tajming bez haptičkog feedback-a**
Na mobilnom, bez vibracije (Vibration API postoji ali nije pouzdano na svim browserima), igrač nema haptički potvrdu. Čisto vizuelni i audio feedback na touchscreen-u se oseća manje zadovoljavajuće nego na fizičkoj tastaturi — žanr pati na mobilnom ako to nije kompenzovano.

## Showstopperi

**Showstopper 1: Audio-vizuelna sinhronizacija**
Ako beat krugovi i zvuk nisu locked na isti clock (AudioContext.currentTime, ne Date.now() ili frame counter), igra je fundamentalno neigriva. Ovo se mora rešiti u core implementaciji — nema patch-a za to posle. Ako Ceca Čujka nije na projektu ili se audio proglasi "opcionim", ovo pada.

**Showstopper 2: Timing window tolerancija i false MISS**
Ako igrač oseća da ga igra "vara" — da je pritisnuo u ritam a dobio MISS — prestaje da igra. Bez kompenzacije za browser jitter i jasno vizuelno prikazanog timing window-a, feedback loop se raspada. Ovo je bug koji se ne vidi u kodu ali se odmah oseća u igranju.

## Šta drži (prednosti koncepta)

**1. Vizuelni identitet je jak i jasan**
Neon paleta, sonar ring estetika i geometrijski minimalism su implementabilni u Canvas + CSS bez ijednog eksternal asset-a. Pera Piksel ima čist brief, nema prostora za misinterpretaciju.

**2. Core loop je jednostavan i merljiv**
Tapuj u ritam → feedback → combo. To je jedan sistem koji se može implementirati za 2h i iterirati. Sve ostalo (setlist, publika, boo) su ekstenzije koje se mogu odseći ako vreme pritisne.

**3. Sesija ima prirodan kraj**
3-4 pesme po noći = ~5 min je dobar atomic unit. Igrač zna kada je runda gotova, nema "još samo malo" paradoksa koji ubija vreme ali ne zadovoljava.

## Verdict

**DRŽI UZ KOREKCIJE**

Koncept je solidan, vizija je jasna, ali scope je prenatrpan za jedan dan implementacije. Potrebne korekcije u concept.md pre nego što Mile krene na GDD:

1. **Audio je obavezan, ne opcioni** — Ceca Čujka mora biti na projektu; bez audio feedbacka ritam igra ne postoji. Concept.md treba eksplicitno da kaže "audio je core feature".

2. **Setlist kartice: smanji sa 3 na 2, ili ih učini kozmetičkim** — Ako kartice menjaju tempo, pattern I vizual, to su 3 implementacije u jednoj. Predlog: kartice menjaju SAMO vizuelni stil (boja teme), a tempo raste linerano. Gameplay ostaje jedan.

3. **"Boo" mehanika je nice-to-have, ne core** — Izvuci je iz core opisa i stavi je kao "stretch goal ako ostane vremena". Bez nje igra i dalje funkcioniše.

4. **Prestige loop: specifikuj tačan broj noći za realnu sesiju od 20 min** — Ako je cilj 10-20 min sesija, igrač ne bi trebalo da vidi prestige u prvoj sesiji. Odredi: prestige dolazi posle 4. kluba, total ~20 noći, ali to je long-term goal, ne dnevni target.
