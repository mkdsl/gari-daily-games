# Premortem: Bespuće

## Verdict
DRŽI UZ KOREKCIJE

## Šta može da puca (rizici)

**1. Ghost sistem — troškovi koji se ne isplate**
"Best ghost" koji se pojavljuje u sledećem runu zvuči sjajno na papiru. U praksi: treba snimati pozicije po frameu, čuvati u memoriji (ili localStorage), deserijalizovati na novom runu, renderovati providno paralelno sa igračem — sve to dok se već gaze performanse brzih čestica i proceduralnog generisanja. Za jedan dan, jedan developer: ovo je trap. Ako se ghost izostavi ili uradi mrzovoljno ("bude samo tačka koja kasni"), premortem se ispunio.

**2. Proceduralno generisanje hodnika — definicija "hodnika" nedostaje**
Concept kaže "hodnik mutira" ali ne kaže kako. Scrolling? Sekvencijalni segmenti? Chunk sistem? Bez jasne GDD odluke, Jova improvizuje. Improvizovani proceduralni gen na Canvas-u za 8 sati = ili prejednostavan (lista prepreka koje padaju odozgo) ili preambiciozan (pravi hodnik sa razgranavanjem koji se nikad ne završi). Ni jedno ni drugo nije ono što concept slika.

**3. Collision detection na poligonima bez fill-a**
"Prozirni poligoni sa outline-om" — lepo izgleda, ali znači da collision radi sa neregularnim oblicima. AABB je nedovoljan za trougaoni brod i rotovane poligone. SAT (Separating Axis Theorem) se može implementirati ali jede vreme. Ako se krene sa grubim aproksimacijama, igra postaje ili prelagana (previše prostora) ili nefer (zidovi koji ubijaju a vizuelno nisi udario).

**4. Meta napredak — tri valute, tri sisteme, jedan dan**
Kristali + tri trajne nadogradnje (brzina, shield pulse, magnet) = mini-ekonomija između runova. To je još jedan UI ekran, još jedan state sloj (localStorage schema), balance tweaking. Za 60-120 sekundi runova ovo ne sme biti kompleksno — ali samo pisanje tog UI-a crpi vreme od core mehanike.

**5. Audio proceduralnost + Web Audio timing**
Drum machine koji se sinhronizuje sa gameplay brzinom je legitimno ambiciozan. Web Audio API je moćan ali neintuitivan — AudioContext scheduling, buffer, gain chains. Ceca Čujka možda nema dovoljno vremena. Rizik: audio se isključi "da se završi igra na vreme" i sesija propada bez zvuka koji je inače definisan kao deo doживљaja.

**6. Mobile touch controls na arkadnoj igri**
Brod koji se kreće levo/desno/gore/dole sa gravitacijom — to su 4 smera kontrole. Na mobilnom: touch? Swipe? Virtual joystick? Tilt? Ništa od toga nije trivijalno za float/dodge dinamiku. Concept to ne adresira. Ako Jova lepi dva dugmeta levo/desno i to je to, igra se na mobilnom oseća kao port koji niko ne želi.

## Showstopper rizici

**SHOWSTOPPER 1 — Ghost sistem ukida performanse ili ostaje nedovršen**
Ako se ghost implementira i sruši frame rate ispod 30fps na prosečnom telefonu, igra je unigrivost. Ako se ghost izostavi a bio je eksplicitno naveden kao core feature (i utiče na "replay value"), igra gubi srce. Preporuka: ghost mora biti eksplicitno u/van scope sa jasnom zamenom ako van.

**SHOWSTOPPER 2 — Nedefinisana collision logika za proceduralnim oblicima**
Bez jasne odluke u GDD-u (AABB sa padding? circle approx? SAT?), collision je onaj modul koji "neko vidi" u beta testu jer ubija nefer ili ne ubija kad treba. Ovo direktno ruši arkadni feel.

## Šta drži

Core loop je elegantan i vremenski odgovoran — 90 sekundi run, "još jedan" je automatski. To je klasika žanra ali ovde nije kopija; atmosfera "dark sci-fi neon brutalist" daje identitet koji se razlikuje od svakog Geometry Dash klona.

Vizuelni stil je canvas-friendly: crtanje poligon outlinea i čestica kvadratića je jeftino u kodu i izgleda dobro. Nema tekstura, nema spritova, sve je proceduralno — to zapravo radi u korist tehničkih ograničenja.

Gravitacija kao konstanta + inercija je prava fizička metafora za ime "Bespuće" — nije dekorativna, ona je mehanika. To je koherentno.

Meta napredak sa 3 nadogradnje je dovoljno mali da ne postane "idle game u arkadnoj kosi" — ako ostane na 3 opcije i tu stane, balance je upravljiv.

## Preporuke

1. **Ghost sistem — eksplicitno scopeati u GDD-u.** Ako ide: samo 2D pozicija + rotacija, max 300 tačaka, bez fizike, bez interakcije — čisto vizuelna sena. Ako ne ide: zameni sa "prethodni rekord linijom" na HUD-u (trivijalna implementacija, isti psihološki efekat).

2. **Hodnik = scroll + chunk sistem, ne slobodan gen.** GDD treba da kaže: vertikalni scroll, segmenti se generišu odozgo u queue od 3-5 chunk-ova, svaki chunk je lista prepreka po obrascu. Slobodan gen za jedan dan = haos.

3. **Collision = circle approximation za brod, AABB za prepreke.** Nije savršeno ali je fer i brzo. Poligon outline kolizija može izgledati kao circle brod u debug modu — igrač ne vidi razliku ako je radius dobro podešen.

4. **Mobile controls = swipe left/right menja horizontalnu silu, tap = kratki burst gore.** Jedan touch, dve akcije — dovoljno za dodge dinamiku. Virtual joystick je over-engineered za ovaj scope.

5. **Audio = nije obavezan za MVP.** Ako Ceca nema vremena da uradi drum machine koji ne ruši loop timing, bolje tišina nego loš zvuk koji distrakcuje. Nek bude jasno u GDD-u: audio je bonus, ne blokira release.
