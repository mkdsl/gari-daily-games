/** @module content/cards — sve 40 decision kartica */

/**
 * @typedef {Object} CardOption
 * @property {string} label
 * @property {Object} effects
 */

/**
 * @typedef {Object} Card
 * @property {string} id
 * @property {string} category - 'L'|'CR'|'CE'|'F'|'R'
 * @property {string} title
 * @property {string} [city_lock] - city_id if exclusive
 * @property {CardOption[]} options
 */

/** @type {Card[]} */
export const CARDS = [
  // LOGISTIKA
  { id:'L01', category:'L', title:'Kamion kasni', options:[
    {label:'A: Čekaj na putu', effects:{crew_mood:-0.5, cq_bonus:-0.5}},
    {label:'B: Ekspres dostava', effects:{budget:-200}},
    {label:'C: Lokalna oprema', effects:{budget:-100, cq_bonus:-1.5}},
  ]},
  { id:'L02', category:'L', title:'Višak mesta u vanu', options:[
    {label:'A: Uzmi crew lokalno', effects:{budget:-50, crew_mood:1}},
    {label:'B: Party bus za fanove', effects:{budget:200, reach:0.5}},
    {label:'C: Ostavi prazno', effects:{}},
  ]},
  { id:'L03', category:'L', title:'Venue setup problem', options:[
    {label:'A: Venue tech tim', effects:{budget:-300, cq_bonus:1.0}},
    {label:'B: Sam setup', effects:{crew_mood:-1.5, cq_bonus:0.5}},
    {label:'C: Suboptimalno', effects:{cq_bonus:-1.0}},
  ]},
  { id:'L04', category:'L', title:'Hotel upgrade popust', options:[
    {label:'A: Uzmi upgrade', effects:{budget:-150, crew_mood:1.5}},
    {label:'B: Ostani u standardnom', effects:{}},
    {label:'C: Deli sobe da štediš', effects:{budget:-100, crew_mood:-0.5}},
  ]},
  { id:'L05', category:'L', title:'GPS greška, zalutali ste', options:[
    {label:'A: Taksi za crew', effects:{budget:-120, crew_mood:-0.3}},
    {label:'B: Kasne svi zajedno', effects:{crew_mood:-0.8, cq_bonus:-0.5}},
    {label:'C: Lokalni vodič', effects:{reach:0.5, crew_mood:-0.2}},
  ]},
  { id:'L06', category:'L', title:'Venue double-booking', options:[
    {label:'A: Pregovori s venuem', effects:{budget:-500, reputation:-0.5}},
    {label:'B: Emergency venue', effects:{cq_bonus:-1.5, budget:-200}},
    {label:'C: Kanceli ceo nastup', effects:{reputation:-2.0, budget:-400}},
  ]},
  { id:'L07', category:'L', title:'Skupo gorivo, pumpa prazna', options:[
    {label:'A: Plati premium cenu', effects:{budget:-80}},
    {label:'B: Čekaj jeftiniju pumpu', effects:{crew_mood:-0.5}},
    {label:'C: Deli troškove s fanovima', effects:{reach:1.0, budget:-40}},
  ]},
  { id:'L08', category:'L', title:'Oprema zaboravljena u hotelu', options:[
    {label:'A: Kupi zamenu hitno', effects:{budget:-250}},
    {label:'B: Pozajmi od lokalnog DJ-a', effects:{reputation:0.3}},
    {label:'C: Improvizuj bez nje', effects:{cq_bonus:-2.0}},
  ]},
  { id:'L09', category:'L', title:'Granični prelaz — čekanje', city_lock:'sarajevo', options:[
    {label:'A: Spavaju u vanu', effects:{crew_mood:-0.3}},
    {label:'B: Lokalni fixer ubrzava', effects:{budget:-100}},
    {label:'C: Šarmom kroz carinu', effects:{random:true, outcomes:[{},{crew_mood:-1.0, budget:-100}]}},
  ]},
  { id:'L10', category:'L', title:'Parking kazna pred venuem', options:[
    {label:'A: Plati odmah', effects:{budget:-50}},
    {label:'B: Žali se na licu mesta', effects:{crew_mood:-0.3, reputation:-0.2}},
    {label:'C: Potkupi inspektora', effects:{budget:-30, random:true, outcomes:[{},{reputation:-1.0}]}},
  ]},

  // CREW RELATIONS
  { id:'CR01', category:'CR', title:'DJ traži raise — sada', options:[
    {label:'A: Daj raise', effects:{budget:-150, crew_mood:1.0}},
    {label:'B: Odbij', effects:{crew_mood:-2.0}},
    {label:'C: Obećaj posle turneje', effects:{crew_mood:-0.5}},
  ]},
  { id:'CR02', category:'CR', title:'Visual burnout — Ana ne može', options:[
    {label:'A: Odmor za nju', effects:{cq_bonus:-1.0}},
    {label:'B: Power-through', effects:{crew_mood:-1.5}},
    {label:'C: Lokalni vizualac', effects:{budget:-200, cq_bonus:0.5}},
  ]},
  { id:'CR03', category:'CR', title:'Svađa u crew-u pred nastup', options:[
    {label:'A: Medijacija — ti si sudija', effects:{crew_mood:1.0, cq_bonus:-0.5}},
    {label:'B: Ignoriši, sami neka reše', effects:{crew_mood:-0.5}},
    {label:'C: Pusti jednog kući', effects:{crew_mood:1.5}},
  ]},
  { id:'CR04', category:'CR', title:'Fan hoće backstage pass', options:[
    {label:'A: Pusti ga', effects:{reach:1.5, crew_mood:-0.3}},
    {label:'B: Odbij ljubazno', effects:{reputation:-0.2}},
    {label:'C: Proda mu merch', effects:{budget:150}},
  ]},
  { id:'CR05', category:'CR', title:'Promo manager bolestan', options:[
    {label:'A: Sam radiš promo', effects:{crew_mood:-0.5, reach:-1.0}},
    {label:'B: Outsource agenciji', effects:{budget:-200, reach:0.5}},
    {label:'C: Bez promoa ovog grada', effects:{reach:-2.0}},
  ]},
  { id:'CR06', category:'CR', title:'Crew slavi noć pre nastupa', options:[
    {label:'A: Pusti ih, zaslužili su', effects:{crew_mood:1.5, next_city_crew_mood:-2.0}},
    {label:'B: Curfew u 23:00', effects:{crew_mood:-1.0}},
    {label:'C: Spoj s fanovima', effects:{reach:1.0, crew_mood:0.5}},
  ]},
  { id:'CR07', category:'CR', title:'DJ zaboravio slušalice', options:[
    {label:'A: Kupi hitno', effects:{budget:-80}},
    {label:'B: Pozajmi od venue', effects:{cq_bonus:-0.5}},
    {label:'C: Radi bez slušalica', effects:{cq_bonus:-1.5}},
  ]},
  { id:'CR08', category:'CR', title:'Team bonding predlog', options:[
    {label:'A: Večera zajedno', effects:{budget:-200, crew_mood:2.0}},
    {label:'B: Quick paintball', effects:{budget:-50, crew_mood:1.0}},
    {label:'C: Skip — fokus na posao', effects:{crew_mood:-0.3}},
  ]},

  // CROWD EVENTS
  { id:'CE01', category:'CE', title:'Publika traži određenu pesmu', options:[
    {label:'A: Pusti request', effects:{cq_bonus:1.0, reputation:0.2}},
    {label:'B: Stick to set listu', effects:{cq_bonus:-0.3}},
    {label:'C: Hybrid — malo od svega', effects:{cq_bonus:0.5}},
  ]},
  { id:'CE02', category:'CE', title:'Front row VIP problemi', options:[
    {label:'A: Premesti VIPs', effects:{cq_bonus:0.5, reputation:-0.2}},
    {label:'B: Ignoriši situaciju', effects:{cq_bonus:-0.8}},
    {label:'C: Napravi VIP zonu', effects:{budget:-150, cq_bonus:1.0}},
  ]},
  { id:'CE03', category:'CE', title:'Kapacitet premašen za 30%', options:[
    {label:'A: Zatvori vrata', effects:{cq_bonus:1.5, reach:-1.0}},
    {label:'B: Pusti još 20%', effects:{cq_bonus:-1.0, budget:200}},
    {label:'C: Overflow livestream', effects:{reach:3.0, budget:-100}},
  ]},
  { id:'CE04', category:'CE', title:'Kiša tokom open-air nastupa', options:[
    {label:'A: Kišobrani i promo', effects:{reach:1.0, budget:-100, cq_bonus:-0.3}},
    {label:'B: Prekini 30 min', effects:{cq_bonus:-1.5, crew_mood:-0.5}},
    {label:'C: Nastavi kroz kišu', effects:{cq_bonus:0.5}},
  ]},
  { id:'CE05', category:'CE', title:'Viral moment na sceni', options:[
    {label:'A: Repost Kluboslavija kanali', effects:{reach:4.0}},
    {label:'B: Pusti fan-organic rast', effects:{reach:2.0}},
    {label:'C: Ignoriši, fokus na set', effects:{}},
  ]},
  { id:'CE06', category:'CE', title:'Tuča u publici', options:[
    {label:'A: Security interveniše', effects:{cq_bonus:-1.0, reputation:-0.5}},
    {label:'B: DJ pauzira da smiri', effects:{cq_bonus:-1.5, reputation:0.3}},
    {label:'C: Nastavi, ignoriši', effects:{cq_bonus:-2.0, reputation:-1.0}},
  ]},
  { id:'CE07', category:'CE', title:'Struja nestala 20 minuta', options:[
    {label:'A: Acoustic set improvizacija', effects:{cq_bonus:1.0, crew_mood:-0.5}},
    {label:'B: Refund dela karata', effects:{budget:-300, reputation:-0.3}},
    {label:'C: U mraku, atmosphere', effects:{cq_bonus:-1.5}},
  ]},
  { id:'CE08', category:'CE', title:'Media ekipa traži intervju', options:[
    {label:'A: Intervju posle seta', effects:{reputation:1.0, reach:2.0, crew_mood:-0.3}},
    {label:'B: Odbij', effects:{}},
    {label:'C: Quick snippet 60 sec', effects:{reach:1.5}},
  ]},

  // FINANCE
  { id:'F01', category:'F', title:'Merch prodaja bolja od plana', options:[
    {label:'A: Reinvestiraj u promo', effects:{reach:2.0, budget:200}},
    {label:'B: Uzmi čisti profit', effects:{budget:500}},
    {label:'C: Nagradi crew bonusom', effects:{crew_mood:1.5, budget:100}},
  ]},
  { id:'F02', category:'F', title:'Spontani sponzor nudi deal', options:[
    {label:'A: Prihvati deal odmah', effects:{budget:800, reputation:-0.5}},
    {label:'B: Premium pregovori', effects:{budget:400, reputation:0.2}},
    {label:'C: Odbij — zadržaj integritet', effects:{reputation:0.5}},
  ]},
  { id:'F03', category:'F', title:'Venue traži veći cut', options:[
    {label:'A: Plati bez pitanja', effects:{budget:-300}},
    {label:'B: Pregovori (50/50 šansa)', effects:{random:true, outcomes:[{budget:-150},{budget:-500}]}},
    {label:'C: Raskini i traži novi venue', effects:{budget:-200}},
  ]},
  { id:'F04', category:'F', title:'Bar prihod split dogovor', options:[
    {label:'A: 20% cut (siguran)', effects:{budget:300}},
    {label:'B: 30% pregovori (rizik)', effects:{random:true, outcomes:[{budget:450},{reputation:-0.3}]}},
    {label:'C: Ignoriši ponudu', effects:{}},
  ]},
  { id:'F05', category:'F', title:'Krađa kase na ulazu', options:[
    {label:'A: Policija — formalno', effects:{budget:-500, reputation:0.3}},
    {label:'B: Interno — bez buke', effects:{budget:-500}},
    {label:'C: Osiguranje pokrije', effects:{budget:-200}},
  ]},
  { id:'F06', category:'F', title:'Neočekivani tech bill', options:[
    {label:'A: Plati u celosti', effects:{budget:-400}},
    {label:'B: Deli troškove s venuem', effects:{budget:-200}},
    {label:'C: DIY fix', effects:{cq_bonus:-0.5}},
  ]},
  { id:'F07', category:'F', title:'Muzički grant — otvoren poziv', options:[
    {label:'A: Apliciraj (40% šansa)', effects:{random:true, outcomes:[{budget:600, reputation:0.5},{reputation:0.5}]}},
    {label:'B: Preporuči drugog DJ-a', effects:{reputation:0.8}},
    {label:'C: Ignoriši rok prijave', effects:{}},
  ]},

  // REPUTATION
  { id:'R01', category:'R', title:'Blog negativna recenzija', options:[
    {label:'A: Javni odgovor (50/50)', effects:{random:true, outcomes:[{reputation:0.5},{reputation:-0.5}]}},
    {label:'B: Ignoriši', effects:{reputation:-0.3}},
    {label:'C: Kafa s urednikom', effects:{random:true, outcomes:[{reputation:0.8},{}]}},
  ]},
  { id:'R02', category:'R', title:'Skandal na bini — vidi se svuda', options:[
    {label:'A: Ispričaj se odmah javno', effects:{reputation:-1.0}},
    {label:'B: Ćuti i čekaj', effects:{reputation:-2.0}},
    {label:'C: Art spin (50/50)', effects:{random:true, outcomes:[{reputation:-0.5},{reputation:-1.5}]}},
  ]},
  { id:'R03', category:'R', title:'Bivši saradnik loše priča', options:[
    {label:'A: Odgovori faktima javno', effects:{reputation:-0.3}},
    {label:'B: Pravni leter', effects:{reputation:-0.5, budget:-200}},
    {label:'C: Ignoriši potpuno', effects:{reputation:0.3}},
  ]},
  { id:'R04', category:'R', title:'Pozitivna novinska recenzija', options:[
    {label:'A: Share svuda', effects:{reach:2.0, reputation:0.5}},
    {label:'B: Hvala i dalje', effects:{reputation:0.3}},
    {label:'C: Ništa — skromno', effects:{}},
  ]},
  { id:'R05', category:'R', title:'Influencer hoće collab', options:[
    {label:'A: Backstage access', effects:{reach:3.0, reputation:0.5, crew_mood:-0.3}},
    {label:'B: Plaćeni sponsored deal', effects:{budget:300, reach:1.5}},
    {label:'C: Odbij', effects:{}},
  ]},
  { id:'R06', category:'R', title:'Alumni DJ brani tebe javno', options:[
    {label:'A: Javno hvala', effects:{reputation:0.8, reach:1.0}},
    {label:'B: Private hvala poruka', effects:{reputation:0.3}},
    {label:'C: Ignoriši', effects:{reputation:-0.2}},
  ]},
  { id:'R07', category:'R', title:'Seoska zajednica nudi saradnju', city_lock:'guncati', options:[
    {label:'A: Pokloni besplatni koncert', effects:{reputation:1.5}},
    {label:'B: Donacija u kasi', effects:{budget:-200, reputation:1.0}},
    {label:'C: Standardna cena', effects:{}},
  ]},
];

/** @type {Map<string, Card>} */
export const CARD_MAP = new Map(CARDS.map(c => [c.id, c]));

/** Category labels */
export const CATEGORY_LABELS = {
  L: '🚗 Logistika',
  CR: '👥 Crew',
  CE: '🎤 Publika',
  F: '💰 Finansije',
  R: '⭐ Reputacija',
};
