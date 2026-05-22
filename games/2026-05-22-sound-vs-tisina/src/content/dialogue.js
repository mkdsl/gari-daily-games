// dialogue.js — Sava + Tonketa mentor lines
export const MENTOR_LINES = {
  venue_start: [
    "Tonketa: 'Šuma upija 4 dB prirodno. Iskoristi je.'",
    "Sava: 'Proveri smer vetra pre nego što pališ sistem.'",
    "Tonketa: 'Pravi promoter zna svaki metar terena napamet.'",
    "Sava: 'Prva žurka ovde. Budi tiši nego što misliš da treba.'",
    "Tonketa: 'Komšija nije neprijatelj. Još ne.'",
    "Sava: 'Refleksija od betonskog zida može da ti sruši evening. Pazi.'",
    "Tonketa: 'Delay toranj nije luksuz na velikom placi. Neophodnost.'",
    "Sava: 'Avala. Jednog dana. Ali danas — ovde, na ovom terenu.'"
  ],
  complaint: [
    "Sava: 'Pazi. Jednom kad pozoveš inspekciju, ne možeš da depoziruješ reputaciju.'",
    "Tonketa: 'Smanjuj polako. Publika ne oseća 3 dB razliku. Komšija hoće.'",
    "Sava: 'Jedna pritužba — upozorenje. Dve — beleška. Tri — kraj večeri.'",
    "Tonketa: 'Zvuk koji ide van terena je izgubljeni budzžet.'",
    "Sava: 'Komšija se ne žali na muziku. Žali se na decibele. Razlika je bitna.'",
    "Tonketa: 'Spusti fill zonu, ne main. Publika neće ni primetiti.'"
  ],
  high_happiness: [
    "Tonketa: 'To je to! Kad osećaš da publika diše zajedno s beatom.'",
    "Sava: 'Ovo je zašto radimo ovaj posao.'",
    "Tonketa: '🔥 Placi je na vatri. Drži taj nivo.'",
    "Sava: 'Savršen balans. Beleži ove parametre.'",
    "Tonketa: 'Avala-level energija na ovom terenu. Respect.'"
  ],
  game_over: [
    "Tonketa: 'Pravi promoter zna kad treba biti tiši.'",
    "Sava: 'Svaki shutdown je lekcija. Šta si naučio večeras?'",
    "Tonketa: 'Nisu te izbacili. Samo ti kažu da se vratiš spremniji.'",
    "Sava: 'Reputacija se gradi godinama, gubi se za jednu noć. Podrami.'",
    "Tonketa: 'I ja sam imao noći poput ove. Ključ je — daš ponovo.'"
  ],
  win: [
    "Sava: 'Odlično veče. Publika zadovoljna, komšija spava.'",
    "Tonketa: 'Ovo je recept: dobar zvuk + poštovana granica.'",
    "Sava: 'Još jedan teren pod kapu. Avala čeka.'",
    "Tonketa: 'Vidim da učiš. Sledeći teren će biti teži. Bićeš spreman.'",
    "Sava: 'Svaki uspeh otvara sledeća vrata. Idi dalje.'"
  ],
  event_wind: [
    "Tonketa: 'Vjetar zakrece! Spusti vanjske zone odmah.'",
    "Sava: 'Meteorologija je deo posla. Adaptiraj se.'"
  ],
  event_inspection: [
    "Sava: 'Inspektor je ovde. Deset minuta na -5 dB. Uradi.'",
    "Tonketa: 'Smejak i spusti klik. Oni znaju da mi znamo igru.'"
  ]
};

export function getRandomLine(category) {
  const lines = MENTOR_LINES[category];
  if (!lines || lines.length === 0) return '';
  return lines[Math.floor(Math.random() * lines.length)];
}
