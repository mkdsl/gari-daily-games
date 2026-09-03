// content/cards_klub.js — 30 Klub set cards (6 per role, power 1-4)

/** @type {Array<{defId: string, name: string, role: string, power: number, rarity: string, flavor: string, eventSet: string}>} */
export const KLUB_CARDS = [
  // ── TONAC (6 cards) ─────────────────────────────────────────────────────────
  {
    defId: 'tk-t1', name: 'Đole Džejbl', role: 'tonac', power: 1, rarity: 'common', eventSet: 'klub',
    flavor: 'Zna gde je utičnica. Nekad.'
  },
  {
    defId: 'tk-t2', name: 'Nole Niskofrekventni', role: 'tonac', power: 1, rarity: 'common', eventSet: 'klub',
    flavor: 'Basevi su mu život, visoki tonovi su mit.'
  },
  {
    defId: 'tk-t3', name: 'Mika Mikser', role: 'tonac', power: 2, rarity: 'common', eventSet: 'klub',
    flavor: 'EQ po uhu, publika ne zna razliku.'
  },
  {
    defId: 'tk-t4', name: 'Bata Balans', role: 'tonac', power: 2, rarity: 'common', eventSet: 'klub',
    flavor: 'L i R kanali uvek savršeno izbalansirani.'
  },
  {
    defId: 'tk-t5', name: 'Vujo Volumen', role: 'tonac', power: 3, rarity: 'rare', eventSet: 'klub',
    flavor: 'Kada diže fader, soba ga oseća.',
    react_line: 'Kada dignem fader, soba to oseti — bez pitanja.'
  },
  {
    defId: 'tk-t6', name: 'Slavko Saund', role: 'tonac', power: 4, rarity: 'rare', eventSet: 'klub',
    flavor: 'Legenda klupske scene. Zna svaki akustični problem pre nego nastane.',
    react_line: 'Dvadeset godina radim ovo. Svaki akustični problem čujem pre nego nastane.'
  },

  // ── HOST (6 cards) ───────────────────────────────────────────────────────────
  {
    defId: 'tk-h1', name: 'Maja Mikrofon', role: 'host', power: 1, rarity: 'common', eventSet: 'klub',
    flavor: 'Entuzijazam je tu, iskustvo dolazi.'
  },
  {
    defId: 'tk-h2', name: 'Rada Reči', role: 'host', power: 1, rarity: 'common', eventSet: 'klub',
    flavor: 'Uvek ima šta da kaže, nekad i kada treba.'
  },
  {
    defId: 'tk-h3', name: 'Zorana Zvučna', role: 'host', power: 2, rarity: 'common', eventSet: 'klub',
    flavor: 'Njen glas drži energiju prostorije.'
  },
  {
    defId: 'tk-h4', name: 'Aca Aplauz', role: 'host', power: 2, rarity: 'common', eventSet: 'klub',
    flavor: 'Zna kada treba da pozove pljesak.'
  },
  {
    defId: 'tk-h5', name: 'Lena Lajv', role: 'host', power: 3, rarity: 'rare', eventSet: 'klub',
    flavor: 'Sa njom svaka pauza postaje momenat.',
    react_line: 'Svaka pauza je moj momenat. Publika ne zna koliko sekundi imam.'
  },
  {
    defId: 'tk-h6', name: 'Braca Bina', role: 'host', power: 4, rarity: 'rare', eventSet: 'klub',
    flavor: 'Veteran scene. Jedna rečenica i sala je u šaci.',
    react_line: 'Jedna rečenica. Sala je moja. Uvek je bila.'
  },

  // ── CONTENT CREATOR (6 cards) ────────────────────────────────────────────────
  {
    defId: 'tk-c1', name: 'Pera Priča', role: 'content', power: 1, rarity: 'common', eventSet: 'klub',
    flavor: 'Story priče, stabilizacija opciono.'
  },
  {
    defId: 'tk-c2', name: 'Tina Thumbnail', role: 'content', power: 1, rarity: 'common', eventSet: 'klub',
    flavor: 'Svaki kadar izgleda kao thumbnail.'
  },
  {
    defId: 'tk-c3', name: 'Kiki Kamera', role: 'content', power: 2, rarity: 'common', eventSet: 'klub',
    flavor: 'Zna gde je svetlo i ide ka njemu.'
  },
  {
    defId: 'tk-c4', name: 'Voja Viral', role: 'content', power: 2, rarity: 'common', eventSet: 'klub',
    flavor: 'Svaki nastup, tri Reelsa gotova pre ponoći.'
  },
  {
    defId: 'tk-c5', name: 'Nina Narativ', role: 'content', power: 3, rarity: 'rare', eventSet: 'klub',
    flavor: 'Ne snima nastup — snima priču o nastupu.',
    react_line: 'Ne snimam nastup. Snimam zašto je ovaj nastup važan.'
  },
  {
    defId: 'tk-c6', name: 'Ivo Isnta', role: 'content', power: 4, rarity: 'rare', eventSet: 'klub',
    flavor: 'Dvadeset hiljada pratilaca pita ga gde je sledeći event.',
    react_line: 'Dvadeset hiljada pratilaca čeka moj story. Daću im razlog.'
  },

  // ── LOGISTIKA (6 cards) ──────────────────────────────────────────────────────
  {
    defId: 'tk-l1', name: 'Goca Gajtan', role: 'logistika', power: 1, rarity: 'common', eventSet: 'klub',
    flavor: 'Kablov ima, adapter nema. Sledeći put.'
  },
  {
    defId: 'tk-l2', name: 'Đura Džemperkabel', role: 'logistika', power: 1, rarity: 'common', eventSet: 'klub',
    flavor: 'Sve donosi, ne sve i na vreme.'
  },
  {
    defId: 'tk-l3', name: 'Steva Stagebox', role: 'logistika', power: 2, rarity: 'common', eventSet: 'klub',
    flavor: 'Stage je spreman pre dolaska izvođača.'
  },
  {
    defId: 'tk-l4', name: 'Mila Materjal', role: 'logistika', power: 2, rarity: 'common', eventSet: 'klub',
    flavor: 'Checklist u glavi, ništa ne zaboravlja.'
  },
  {
    defId: 'tk-l5', name: 'Bora Backstage', role: 'logistika', power: 3, rarity: 'rare', eventSet: 'klub',
    flavor: 'Zna gde je sve, kada treba, bez pitanja.',
    react_line: 'Ne pitaju me gde je šta. Znaju da je tu gde treba.'
  },
  {
    defId: 'tk-l6', name: 'Žika Žica', role: 'logistika', power: 4, rarity: 'rare', eventSet: 'klub',
    flavor: 'Veteran tehničar. U 20 godina nije pao ni jedan kabal.',
    react_line: 'Dvadeset godina, ni jedan kabal nije pao. Danas neće biti prvi put.'
  },

  // ── OBEZBEDJENJE (6 cards) ───────────────────────────────────────────────────
  {
    defId: 'tk-o1', name: 'Srba Široki', role: 'obezbedjenje', power: 1, rarity: 'common', eventSet: 'klub',
    flavor: 'Veliki, miran. Ponekad previše miran.'
  },
  {
    defId: 'tk-o2', name: 'Rile Ruke', role: 'obezbedjenje', power: 1, rarity: 'common', eventSet: 'klub',
    flavor: 'Ulaz kontroliše, unutra haos.'
  },
  {
    defId: 'tk-o3', name: 'Cane Čuvar', role: 'obezbedjenje', power: 2, rarity: 'common', eventSet: 'klub',
    flavor: 'Niko ne prođe bez karte. Niko.'
  },
  {
    defId: 'tk-o4', name: 'Vule Vrata', role: 'obezbedjenje', power: 2, rarity: 'common', eventSet: 'klub',
    flavor: 'Pros lista pamti, buku ne.'
  },
  {
    defId: 'tk-o5', name: 'Nesa Nerv', role: 'obezbedjenje', power: 3, rarity: 'rare', eventSet: 'klub',
    flavor: 'Situaciju proceni pre nego nastane.',
    react_line: 'Situacija još nije nastala, a ja je već rešavam.'
  },
  {
    defId: 'tk-o6', name: 'Gruja Gvozdeni', role: 'obezbedjenje', power: 4, rarity: 'rare', eventSet: 'klub',
    flavor: 'Dvadeset godina na klupskoj sceni. Svaki incident, nula eskalacija.',
    react_line: 'Nula eskalacija u dvadeset godina. Znam šta radim.'
  }
];
