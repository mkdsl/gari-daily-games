// =============================================================================
// data/aforizmi.js — Pera Period bank (S1 starter set)
// =============================================================================
// Tonalitet: telo, opservacija, pitanje. Ne dijagnoza, ne savet.
// Po fazi: nedelja 1-3 supportive, 4-12 neutral observation.
// =============================================================================

export const AFORIZMI_PLACEHOLDER = {

  // Po fazi sezona (week range)
  supportive_phase: [
    'Prva nedelja. Niko jos ne ocekuje. Ni ti ne moras.',
    'Niko se ne pamti po prvoj nedelji. Pamti se po dvanaestoj.',
    'Sve do sad bila je vezba. Sad je tu set koji ce neko da pomene.'
  ],

  observation_neutral: [
    'Tri seta ove nedelje. Niko se ne seca kako je krenuo prvi.',
    'Reputaciju nosis u tudjim telefonima. Tvoj ti je ostao tih.',
    'Pio si sa publikom. Pitanje je kad ces poceti da pijes za nju.'
  ],

  // Health drain thresholds
  health_50_50: [
    'Tri noci. Ogledalo ti i sutra govori isto.',
    'San je deo karijere. Onaj koji to ne primeti — pamti se kao dobar, ali ne dugo.',
    'Telo ti pise ono sto kalendar nece.'
  ],

  health_30_30: [
    'Doso si do publike. Do sutra jos nisi.',
    'Telo ti je u zoni gde se ljudi mire da nece ustati u deset.'
  ],

  // Odnosi drain
  odnosi_low: [
    'Majka ti je zvala pre devet dana.',
    'Tri prijatelja vise nije na listi. Nisi ih izbrisao — nisi ih pozvao.'
  ],

  // Normalnost drain
  normalnost_low: [
    'Citao si knjigu pre dva meseca. Ne secas se cije.',
    'Hobby slot ti je prazan sest nedelja. Ponekad je to ok. Ne sad.'
  ],

  // Macro week end (generic)
  week_end_generic: [
    'Nedelja je gotova. Ono sto pamtis razlikuje se od onog sto kalendar pamti.',
    'Ova nedelja te nije promenila. Pitanje je da li je trebalo.',
    'Vise muzike nego izlaska. Sad ti se isplati.',
    'Vise izlaska nego muzike. Sad ti se isplati.'
  ],

  // Set quality high
  set_high: [
    'Pustio si set kakav nisi ocekivao da hoces.',
    'Sala te je drzala ovaj put. Sledeci put ti drzi nju.'
  ],

  // Set quality low
  set_low: [
    'Publika oseti. Nisi morao da im kazes.',
    'Ovo nije bio tvoj set. Pitanje je sta ga je odvelo od tebe.'
  ],

  // Reputation event triggered
  rep_event_positive: [
    'Stari rezident te je primetio. Pamti i one koji nisu primeceni.',
    'Booker je gledao set. Ne mora se javiti da znaci.'
  ],

  // Apstinent reflection
  apstinent_reflection: [
    'Bio si jedini trezni u sobi. Sta si video sto ostali nisu.',
    'Ne pijes godinama. Niko te zbog toga ne pamti. Pitanje koje ne mora odgovor.'
  ],

  // DJ navike (alkohol problem zone)
  alcohol_problem: [
    'Pijan DJ pamti dobre noci. Trezna publika pamti lose setove.',
    'Pivo nije izdaja. Drugo te nije lagalo. Petnaesto te je vec deceniju uvuklo.'
  ],

  // Origin teaser (post-creator)
  origin_teaser: [
    'Tvoj pocetak nije presuda. Pitanje je sta ces nositi od njega.',
    'Sve klase imaju puteve do kraja. Razliciti tempovi, ne razliciti ishodi.'
  ]

};

// Tone selector (Mile sekcija 12.3)
export function selectAforizam(state, context) {
  const week = state.week;
  const bank = AFORIZMI_PLACEHOLDER;

  if (context === 'origin_complete') {
    return pick(bank.origin_teaser);
  }
  if (context === 'set_high') return pick(bank.set_high);
  if (context === 'set_low')  return pick(bank.set_low);
  if (context === 'rep_event') return pick(bank.rep_event_positive);

  // Cascade-specific (drain)
  if (context === 'health_low' && state.sacrifice.health < 30) return pick(bank.health_30_30);
  if (context === 'health_low') return pick(bank.health_50_50);
  if (context === 'odnosi_low') return pick(bank.odnosi_low);
  if (context === 'normalnost_low') return pick(bank.normalnost_low);

  // Drinking habits
  if (context === 'alcohol_problem') return pick(bank.alcohol_problem);
  if (state.apstinent && context === 'reflection') return pick(bank.apstinent_reflection);

  // Phase-based default (Mile sekcija 12.3)
  if (week <= 3) return pick(bank.supportive_phase);
  if (week <= 12) return pick(bank.observation_neutral);

  return pick(bank.week_end_generic);
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Stats — placeholder count (Pera ce zameniti)
export const PLACEHOLDER_COUNT = Object.values(AFORIZMI_PLACEHOLDER).reduce((sum, arr) => sum + arr.length, 0);
