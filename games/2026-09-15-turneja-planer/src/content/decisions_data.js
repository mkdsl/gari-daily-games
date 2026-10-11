/** @module content/decisions_data — city-specific card flavor + crew voice pre-event */

/**
 * City flavor per card: max 1 sentence, changes tone without changing mechanics.
 * @type {Record<string, Record<string, string>>}
 */
export const CITY_FLAVOR_MAP = {
  // LOGISTIKA
  L01: { beograd: 'Beograd bez kamiona — standard.', novi_sad: 'Vojvodina čeka, ne požuruje.', nis: 'Niš kaže: "Idi pješke."', sarajevo: 'Bosna — sve dolazi, samo kad treba.', guncati: 'U šumi nema kamiona, ni potrebe.' },
  L02: { beograd: 'Splav ima mesta — uvek.', novi_sad: 'Vojvođani vole van u kombiju.', nis: 'Niš-fanovi su uvek tu, čekali ili ne.', sarajevo: 'Sarajlije ne putuju s neznancima, ali piju s njima.', guncati: 'Guncati van je ionako parkovani u livadi.' },
  L03: { beograd: 'Savamala venue tech: tri konflikta, jedno rešenje.', novi_sad: 'Petrovaradin tehnika: starija od muzike.', nis: 'Niš tehničar kaže da im sub ionako uvek boji.', sarajevo: 'Sarajevo venue: svaki setup je novi problem.', guncati: 'Ovo nije klub, neka ide organski.' },
  L04: { beograd: 'Beograd hotel je ili luksuz ili parkinglot.', novi_sad: 'Vojvodina sobe: čiste i mirisne na lavandu.', nis: 'Niš B&B — domaćica pita za zdravlje svakoga.', sarajevo: 'Sarajevo čaršija: pansion iznad ćevabdžinice.', guncati: 'Spavaš u senu. Upgrade ne postoji, ni treba.' },
  L05: { beograd: 'Beograd GPS: uvek u krugu.', novi_sad: 'Vojvodina: ravan put, GPS ne greši — ti greši.', nis: 'Niš nije velik — ali labirint je labirint.', sarajevo: 'Sarajevo strmo, GPS kaže: "Desno na klisuru."', guncati: 'Nema signala. Pitaš kozu.' },
  L06: { beograd: 'Double-booking je Beograd sport.', novi_sad: 'Vojvodina: dogovor je dogovor, nema duple rezervacije.', nis: 'Niš venue greška — "Nismo znali ni mi."', sarajevo: 'Sarajevo venue: kafa i pregovori, bez žurbe.', guncati: 'U Guncatima postoji samo jedno mesto. Ili si ti, ili nisi.' },
  L07: { beograd: 'Autoputa pumpa: euro cena, dinar novac.', novi_sad: 'Vojvodina pumpa jeftinija za 20% — kao uvek.', nis: 'Niš gorivo: local price, ne turista cena.', sarajevo: 'Bosna: pumpa na granici, dve valute, tri cene.', guncati: 'Guncati kombi treba malo. I malo je tamo malo manje.' },
  L08: { beograd: 'Beograd Equipment Store: otvoren 24/7 ako znaš koga.', novi_sad: 'Novi Sad: poznaješ DJ-a koji pozna DJ-a.', nis: 'Niš: muzička oprema u Centar, ali ne čeka te.', sarajevo: 'Sarajevo Baščaršija: kupuješ staro, radi kao novo.', guncati: 'Nema prodavnice. Ali ima žice i kreativnosti.' },
  L09: { sarajevo: 'Granična čekanja su sarajevski ritual.' },
  L10: { beograd: 'Parking inspektori: Beograd profesija.', novi_sad: 'Novi Sad parking: "Pa znaš gde možeš i gde ne možeš."', nis: 'Niš inspektori: strogi, ali razumni.', sarajevo: 'Sarajevo: parkiraš, moliš se, plaćaš.', guncati: 'Parkiraš na livadi. Inspektor nema livadu.' },
  // CREW RELATIONS
  CR01: { beograd: '"Raise ili idem u Berliner Techno." — Beograd DJ klasika.', novi_sad: 'Vojvođanski raise: tiho postavi, čvrsto drži.', nis: 'Niš DJ: "Platiš il ne platiš, sviramo."', sarajevo: 'Sarajevo: piješ kafu, pa razgovaraš.', guncati: 'Guncati raise: priroda, nije novac.' },
  CR02: { beograd: 'Burnout u Beogradu — svi su uvek na ivici.', novi_sad: 'Vojvodina Ana odmara na Dunavu.', nis: 'Niš kaže: "Ana odmori, svi odmori."', sarajevo: 'Sarajevo pita: "Jesi li dobro? Stvarno?"', guncati: 'Šuma leči sve. Ana zna.' },
  CR03: { beograd: 'Svađa u Savamali: normalna pojava, abnormalna buka.', novi_sad: 'Vojvodina crew: ceraju se, pa nastave mirno.', nis: 'Niš: "'Ko ste vi da se svađate? Hajde na scenu."', sarajevo: 'Sarajevo: kafa i krug, pa se raspriča.', guncati: 'Svađa u Guncatima: šuma čuje. Nije fer.' },
  CR04: { beograd: 'Backstage Beograd = networking meeting.', novi_sad: 'Novi Sad fan: "Mogu l malo da pitam?"', nis: 'Niš fan: dolazi direktno, bez pitanja.', sarajevo: 'Sarajevo fan: sačekaće celo veče.', guncati: 'Guncati: svi su backstage.' },
  CR05: { beograd: 'Beograd promo bez managera — borba.', novi_sad: 'Vojvodina word-of-mouth: tri poruke, pun klub.', nis: 'Niš promo: flajeri na stanici.', sarajevo: 'Sarajevo: jedna objava na instagramu, širi se brže od epidemije.', guncati: 'Guncati promo: ko hoće, nađe put.' },
  CR06: { beograd: 'Beograd noć: prestaje kad prestaješ ti.', novi_sad: 'Vojvodina: "Curfew? Ozbiljno?"', nis: 'Niš slavi — jutro je dalek pojam.', sarajevo: 'Sarajevo: "Dok pada noć, zabava traje."', guncati: 'Guncati noć: vatru, zvijezde, nema curfew.' },
  CR07: { beograd: 'Beograd DJ bez slušalica: artistička izjava.', novi_sad: 'Novi Sad: pozajamiš, vratiš, zahvališ se.', nis: 'Niš venue ima par rezervnih. Prljavi su, ali rade.', sarajevo: 'Sarajevo muzičari: solidarnost je default.', guncati: 'Guncati bez slušalica: osetiti, ne slušati.' },
  CR08: { beograd: 'Team bonding Beograd: svi na Skadarskoj.', novi_sad: 'Vojvodina: palačinke u Ribarskom ostrvu.', nis: 'Niš dinner: roštilj, ne opcija.', sarajevo: 'Sarajevo: ćevapi i razgovor — bonding je zagarantovan.', guncati: 'Guncati: livada, logorska vatra, dvanaest priča.' },
  // CROWD EVENTS
  CE01: { beograd: 'Beograd publika traži underground hit.', novi_sad: 'Vojvođani traže seta koji su čuli na Exit-u.', nis: 'Niš: "Pusti onu sa YT-a, znaš koja."', sarajevo: 'Sarajevo traži dobre vibracije, ne konkretnu pesmu.', guncati: 'Guncati: "Pusti nešto iz šume."' },
  CE02: { beograd: 'VIP u Beogradu: svi misle da su VIP.', novi_sad: 'Vojvodina VIP: uredni, ne napadni.', nis: 'Niš VIP: ima ih, ali ne prave scenu.', sarajevo: 'Sarajevo VIP: kafanski protokol.', guncati: 'Guncati VIP: postoji samo "ispred svih."' },
  CE03: { beograd: 'Beograd: fire hazard je trend, ne problem.', novi_sad: 'Vojvodina kapacitet: precizno je precizno.', nis: 'Niš: "Stane još — vidite kako stoji."', sarajevo: 'Sarajevo: "Ko dolazi kasno, stane ovde."', guncati: 'Guncati: livada je beskonačna. Ili skoro.' },
  CE04: { beograd: 'Beograd kiša: odeva se bolje.', novi_sad: 'Vojvodina: "Malo kiše nije kiša."', nis: 'Niš open-air kiša: tek počinje zabava.', sarajevo: 'Sarajevo kiša: svi znaju da će pasti, niko ne ide kući.', guncati: 'Guncati kiša: "Zemlja je žedna. Ostajemo."' },
  CE05: { beograd: 'Beograd viral: stiglo do Berlina za sat.', novi_sad: 'Vojvodina viral: mirno, ali daleko.', nis: 'Niš: "Snimao sam, ali nisam znao da je viral."', sarajevo: 'Sarajevo: dijeli se bez pitanja — compliment.', guncati: 'Guncati viral: "Nije internet. Priča se nosi."' },
  CE06: { beograd: 'Beograd tuča: promoter je psiholog i sudija.', novi_sad: 'Vojvodina: "To se ne dešava ovde."', nis: 'Niš: brzo, tiho, rešeno.', sarajevo: 'Sarajevo: kafa, krug, pomirenje za pet minuta.', guncati: 'Guncati: tuča? Šuma kaže ne.' },
  CE07: { beograd: 'Struja nestaje u Savamali: standard.', novi_sad: 'Vojvodina: retko, ali dramatično.', nis: 'Niš struja: "Čekamo — kao i obično."', sarajevo: 'Sarajevo: "Sveca! Hajde!' Sveće imamo."', guncati: 'Guncati: struja? Nikad je ni imali.' },
  CE08: { beograd: 'Beograd mediji: uvek u potrazi za pričom.', novi_sad: 'Vojvodina radio: lokalci prate sve.', nis: 'Niš: "Novinar dolazi sa namerom da pohvali."', sarajevo: 'Sarajevo: medijski prostor je džungla — ali dobroćudna.', guncati: 'Guncati: novinar? Dobrodošao. Ovde nema Wi-Fi.' },
  // FINANCE
  F01: { beograd: 'Merch u Beogradu: logoe kupuju, majice ostavljaju.', novi_sad: 'Vojvodina merch: kvalitet ili ništa.', nis: 'Niš: "Uzmi dve, jedna je za brata."', sarajevo: 'Sarajevo merch: "Ima li razglednica?"', guncati: 'Guncati merch: ekološki ili ne ide.' },
  F02: { beograd: 'Beograd sponzor: nudi brzo, traži dosta.', novi_sad: 'Vojvodina brend deal: pregovaraš tiho.', nis: 'Niš sponsor: lokalna firma, čist novac.', sarajevo: 'Sarajevo: "Vidi on šta hoće zapravo."', guncati: 'Guncati: sponzor mora imati dušu.' },
  F03: { beograd: 'Venue Beograd: uvek hoće više cut.', novi_sad: 'Vojvodina venue: dogovor je dogovor.', nis: 'Niš: "Dogovorili smo. Šta bre."', sarajevo: 'Sarajevo: pregovori bez žurbe — kafa je obavezna.', guncati: 'Guncati nema venue "cut." Nema ni venue.' },
  F04: { beograd: 'Beograd bar prihod: cash economy.', novi_sad: 'Vojvodina bar: čisto, transparentno.', nis: 'Niš bar: "Računamo na kraju večeri."', sarajevo: 'Sarajevo: "Piješ s nama, pa pričamo o novcu."', guncati: 'Guncati bar: doneseni iz Beograda, prodati na čast.' },
  F05: { beograd: 'Krađa Beograd: organizovana, ne impulsivna.', novi_sad: 'Vojvodina: "Pa to se ne dešava."', nis: 'Niš: "Sad je poznato ko je. Brzo se reši."', sarajevo: 'Sarajevo: zajednica zna. Vratiće.', guncati: 'Guncati: krade se? Gde bi otišao?' },
  F06: { beograd: 'Tech bill Beograd: cena prestiža.', novi_sad: 'Vojvodina: "To nisi znao?" Platiš.', nis: 'Niš tech bill: dobar popust ako znaš majstora.', sarajevo: 'Sarajevo: majstor daje cenu, drži je.', guncati: 'Guncati tech: popraviš sam ili ne radiš.' },
  F07: { beograd: 'Beograd grant: politika i muzika, zajedno.', novi_sad: 'Vojvodina: "Fondovi postoje, apliciraj."', nis: 'Niš: "Grant? Ozbiljno?"', sarajevo: 'Sarajevo kulturni fondovi: ima ih, probaj.', guncati: 'Guncati ne traži grant. Guncati je grant.' },
  // REPUTATION
  R01: { beograd: 'Beograd blog: mali uticaj, velika ego.', novi_sad: 'Vojvodina: lokalni medij, čita sve što treba.', nis: 'Niš: "Ko piše to?" Niko ne zna.', sarajevo: 'Sarajevo: recenzija ide do Beograda za dan.', guncati: 'Guncati: blog? Priča se šalje usmeno.' },
  R02: { beograd: 'Beograd skandal: viđeno, zaboravljeno za 48h.', novi_sad: 'Vojvodina: "Nismo to očekivali od tebe."', nis: 'Niš: direktno, bez filtera, iskreno.', sarajevo: 'Sarajevo: "Šta je to bilo? Priča se svuda."', guncati: 'Guncati skandal: šuma pamti.' },
  R03: { beograd: 'Bivši Beograd partner: svima je ispričao.', novi_sad: 'Vojvodina: tiho loše pričanje je gore od glasnog.', nis: 'Niš: "Ko priča, zna se."', sarajevo: 'Sarajevo: "Ne brinemo. Svi znaju ko si."', guncati: 'Guncati: nema bivših saradnika. Svi su jedno.' },
  R04: { beograd: 'Beograd press: velika vest, mala pažnja.', novi_sad: 'Vojvodina novine: čita se jutarnja kafa.', nis: 'Niš: "Izašlo u novinama? Brate!"', sarajevo: 'Sarajevo: novinska recenzija je poklonjena.', guncati: 'Guncati: "Novine? Čitamo drvo."' },
  R05: { beograd: 'Beograd influencer: 200K, real rate nula.', novi_sad: 'Vojvodina: "Micro-influenseri su bolji."', nis: 'Niš influencer: "Imam 3K pratilaca ali svi su moji."', sarajevo: 'Sarajevo: influenser mora biti lokalan.', guncati: 'Guncati influencer: ko živi ovde, preporučuje.' },
  R06: { beograd: 'Beograd alumni: veteran kaže, mladi slušaju.', novi_sad: 'Vojvodina: "Ko je on da govori?" Svi.', nis: 'Niš alumni: "Znam ga od malena."', sarajevo: 'Sarajevo: endorsement od pravog čoveka menja sve.', guncati: 'Guncati: alumni se zove "čovek koji je orao ovu zemlju."' },
  R07: { guncati: 'Zajednica je zvanično prihvatila tebe. To je Guncati pečat.' },
};

/**
 * Get city-specific flavor for a card.
 * @param {string} card_id
 * @param {string} city_id
 * @returns {string|null}
 */
export function getCardCityFlavor(card_id, city_id) {
  return CITY_FLAVOR_MAP[card_id]?.[city_id] || null;
}

/**
 * Crew voice lines per member, city, and mood tier.
 * Shown before micro-decision, one random active member selected.
 * @type {Record<string, Record<string, { high: string, low: string }>>}
 */
export const CREW_VOICE = {
  marko: {
    beograd: { high: '"Ovo je moj grad. Idemo."', low: '"Matični grad, a umoran ko pas."' },
    novi_sad: { high: '"Vojvodina publika je poštena. Radiš — vide."', low: '"Novi Sad mi daje nostalgiju, ne energiju."' },
    nis:     { high: '"Niš zna šta hoće. Kao ja."', low: '"Ovo mi je treći Niš ove sezone. Ne pitaj me za entuzijazam."' },
    sarajevo: { high: '"Sarajevo uvek isporuči. I mi ćemo."', low: '"Sarajevo deserves better from us tonight."' },
    guncati: { high: '"Svirali smo u čardaku bez struje. Preživeli smo. Ovo je lako."', low: '"Guncati je finale. Malo umoran za finale."' },
  },
  ana: {
    beograd: { high: '"Savamala zid je moj canvas. Daj mi 3h."', low: '"Projector kasni. Setup nije moguć kako sam planirala."' },
    novi_sad: { high: '"Tvrđava vizuali biće epic. Imam ideju."', low: '"Nisam spavala 36 sati. Ali videla si finale?"' },
    nis:     { high: '"Niš publika ceni spektakl. Dajem im."', low: '"Struja slaba — vizuali idu na minimum."' },
    sarajevo: { high: '"Sarajevo noć i LED — ne može bolje."', low: '"Daj mi 10 minuta. Samo 10."' },
    guncati: { high: '"Zvezde su moj lighting rig ovde."', low: '"Nema struje za vizuale. Sveće onda."' },
  },
  bojan: {
    beograd: { high: '"Flajeri u Savamali su mrtvi. Ali ja ih i dalje štampam."', low: '"Plan je pao na pola. Promovišem ruševine."' },
    novi_sad: { high: '"Vojvodina promo — tri poruke, pun klub. Sistem radi."', low: '"Kasno sam poslao najave. Grešimo."' },
    nis:     { high: '"Za 150 EUR mogu da napunim Niš. Rado."', low: '"Niš bez promoa = poluprazan klub."' },
    sarajevo: { high: '"Imam kontakte ovde. Publika dolazi."', low: '"Sarajevo mreža ne reaguje brzo. Rizikujemo."' },
    guncati: { high: '"Za 50 EUR napunim Guncati. Šuma je besplatan flajers."', low: '"Guncati promo: usta do usta, i usta su umorena."' },
  },
  ivana: {
    beograd: { high: '"Instagram story iz vana — već 2000 views. Nastavljamo."', low: '"Molim te, ne traj me još jednim prelaskom."' },
    novi_sad: { high: '"Vojvodina TikTok scene je underrated. Radiću."', low: '"Signal loš. Reel ne ide."' },
    nis:     { high: '"Niš je authentic content. Publika to voli."', low: '"Premalo spavala. Telefon me gleda isto."' },
    sarajevo: { high: '"Sarajevo Reels su uvek viral. Snimam."', low: '"Telefon me ne prepoznaje. Odlazim spavati."' },
    guncati: { high: '"Guncati aesthetic je savršen. Do zadnje baterije."', low: '"Nema signal-a. Guncati pobedi."' },
  },
  nikola: {
    beograd: { high: '"Sound check done. Sve je u redu."', low: '"Bas je iz faze. Daće mi 10 minuta."' },
    novi_sad: { high: '"Akustika Tvrđave je izazov. Rešiv."', low: '"Ovaj mixer je iz 2009. Ali znam šta radim."' },
    nis:     { high: '"Tech je spreman. Možemo."', low: '"Equipment failure? Rešio sam za dva sata na Exit-u. Ovo je lako."' },
    sarajevo: { high: '"Sarajevo sistem dobro stoji. Spreman."', low: '"PA nikad nisam koristio ovde. Malo strah."' },
    guncati: { high: '"Outdoor setup urađen. Prirodna akustika radi posao."', low: '"Struja nestabilna. Čuvam baterie."' },
  },
  milena: {
    beograd: { high: '"Hoću i ja solo set. Dvadeset minuta."', low: '"Umorna sam od Markovog ega. I mnog drugog."' },
    novi_sad: { high: '"Vojvođani me poznaju. Mogu da otvorim show."', low: '"Publika peva moje pesme, a ne Markove. Zašto on greje?"' },
    nis:     { high: '"Niš publika će mi dati šansu. Jednog dana."', low: '"Sledeći put — solo set ili ne idem. Ozbiljno."' },
    sarajevo: { high: '"Sarajevo zna moje ime. Osećam."', low: '"Marko opet na glavnom setu. Siguran."' },
    guncati: { high: '"Guncati je moje. Nema ega ovde."', low: '"Guncati finale a ja zagrevam. Poslednji put."' },
  },
  dragan: {
    beograd: { high: '"Znam prečicu. Veruj mi ovaj put."', low: '"Beograd saobraćaj je bezuman. Kao uvek."' },
    novi_sad: { high: '"Autoput čist. Stigli smo na vreme."', low: '"GPS greška? Nema veze — znam ovaj put naizust."' },
    nis:     { high: '"Niš ruta: poznam je napamet. Brz sam."', low: '"Dugo se vozi. Ćutim."' },
    sarajevo: { high: '"Granicu u Sarajevu sam prošao stotinu puta."', low: '"Balkan ruta je duga. Ne govorim na putu."' },
    guncati: { high: '"Seoske staze su moja specijalnost."', low: '"Guncati put — makadamski. Ali ide."' },
  },
  sara: {
    beograd: { high: '"Majice su se rasprodaje za sat vremena. Donesemo više?"', low: '"Zaboravili smo majice u Nišu. I majice i mene."' },
    novi_sad: { high: '"Vojvođani kupuju premium. Dala sam im premium."', low: '"Ostalo je malo na stoku. Iduće — bolje planiramo."' },
    nis:     { high: '"Fanova ima — treba im samo ponuditi šta žele."', low: '"Niš merch nije prodao dobro prošli put. Žurbo."' },
    sarajevo: { high: '"Sarajevo merch: imamo lokalni touch. Ide."', low: '"Donela sam pogrešan model. Klasična Sarajevo greška."' },
    guncati: { high: '"Ekološka merch linija — zelenoj publici."', low: '"Guncati publika neće nositi logoe. Čisti su."' },
  },
  petar: {
    beograd: { high: '"Twitch ili YouTube? Pitaj me posle nastupa."', low: '"Signal je padao. Ali ostalo je snimljeno."' },
    novi_sad: { high: '"Vojvodina stream publika je manja ali lojalnija."', low: '"Novi Sad internet — nestabilno kao uvek."' },
    nis:     { high: '"8000 gledalaca live. Stream je legenda."', low: '"Umoran sam. Baterija i ja — oba na nuli."' },
    sarajevo: { high: '"Overflow crowd? Stream za sve koji nisu ušli."', low: '"Signal je loš, ali idem na 720p."' },
    guncati: { high: '"Guncati live stream — priroda u pozadini, bass u prednjem."', low: '"Nema signal-a u Guncatima. Stream ne ide."' },
  },
  jovana: {
    beograd: { high: '"Negativna recenzija? Imam odgovor na gotovs."', low: '"Reputacija se gradi godinama. Rušiti — sekunda."' },
    novi_sad: { high: '"Vojvodina press su pošteni. Idem im u susret."', low: '"Daj mi dan tišine. Samo jedan."' },
    nis:     { high: '"Niš mediji ne prave komplikovano. Odlično."', low: '"Daj mi 15 minuta s novinarom. Promeniću narativ."' },
    sarajevo: { high: '"Sarajevo PR zahteva poseban ton. Imam ga."', low: '"Moglo je gore. PR sam spasio što se dalo."' },
    guncati: { high: '"Guncati PR: priroda govori za nas."', low: '"Izvan mreže, van PR dometa. Vadimo se sami."' },
  },
};

/**
 * Get a crew voice line for the cards screen.
 * Returns one line from a random active crew member based on city and mood.
 * @param {Array<{id: string, name: string}>} active_crew
 * @param {string} city_id
 * @param {number} crew_mood
 * @returns {{name: string, line: string}|null}
 */
export function getCrewVoiceLine(active_crew, city_id, crew_mood) {
  const eligible = active_crew.filter(m => CREW_VOICE[m.id]?.[city_id]);
  if (!eligible.length) return null;
  const member = eligible[Math.floor(Math.random() * eligible.length)];
  const tier = crew_mood >= 6 ? 'high' : 'low';
  const line = CREW_VOICE[member.id]?.[city_id]?.[tier];
  if (!line) return null;
  return { name: member.name, line };
}
