// =============================================================================
// data/aforizmi.js — PLACEHOLDER Pera Period bank
// =============================================================================
// PLACEHOLDER: Pera ce zameniti punim setom ~80-120 aforizam za S1.
// Dule pravilnik: observation, ne dijagnoza; pitanje, ne osuda;
//                 specificnost, ne moralni apstrakt.
// Tonalitet po fazi: nedelja 1-3 supportive, 4-12 neutral observation.
// =============================================================================

export const AFORIZMI_PLACEHOLDER = {

  // Po fazi sezona (week range)
  supportive_phase: [
    'Prva nedelja. Niko jos ne ocekuje nista. Ti ne ocekuj od sebe vise od toga.',
    'Nema zurke koja je definisala kakvog te ljudi pamte. Ima dvanaest nedelja.',
    'Sve sto si pustio do sada bilo je vezba. Sad pocinje set koji ce neko da ti pomene.'
  ],

  observation_neutral: [
    'Pustio si tri seta ove nedelje. Niko se ne secka kako je krenuo prvi.',
    'Reputation ti je tier 2. Ne znas to. Zna te broj ljudi koji ti je ovaj mesec stigao do telefona.',
    'Pio si sa publikom. Pitanje je kad si poceo da pijes za publiku.'
  ],

  // Health drain thresholds
  health_50_50: [
    'Tri noci. Ogledalo ti i sutra govori isto.',
    'Spavanje je deo karijere. Onaj koji to ne shvata pamti kako je bio dobar — i niko drugi.',
    'Telo ti pise ono sto kalendar ne moze.'
  ],

  health_30_30: [
    'Doso si do publike ali ne i do sutra.',
    'Health tier ti je u zoni u kojoj se ljudi mire sa tim da nece sutra ustati u 10.'
  ],

  // Odnosi drain
  odnosi_low: [
    'Majka ti je zvala pre devet dana.',
    'Tri prijatelja ti nisu vise na ovonedeljnoj listi izlazaka. Ne zato sto su prestali — zato sto ti nisi pozvao.'
  ],

  // Normalnost drain
  normalnost_low: [
    'Citao si knjigu pre dva meseca. Ne secas se cije.',
    'Hobby slot ti je prazan sest nedelja. Pera zna da je to ok ponekad. Ne sad.'
  ],

  // Macro week end (generic)
  week_end_generic: [
    'Nedelja je gotova. Ono sto ti pamtis razlicit je od onog sto kalendar pamti.',
    'Ova nedelja te nije promenila. Pitanje je da li je trebalo.',
    'Stavio si vise vremena u music nego u izlazak. To ti se trenutno isplati.',
    'Stavio si vise vremena u izlazak nego u music. To ti se trenutno isplati.'
  ],

  // Set quality high
  set_high: [
    'Pustio si set kakav nisi ocekivao da hoces.',
    'Sala te je odrzala ovaj put. Sledeci put salu drzi ti.'
  ],

  // Set quality low
  set_low: [
    'Publika oseti. Nisi morao da im kazes da je los set.',
    'Ovo nije bio tvoj set. Pitanje je sta ga je odveo od tebe.'
  ],

  // Reputation event triggered
  rep_event_positive: [
    'Stari rezident te je primetio. Pamti i one koji nisu primeceni.',
    'Festival booker je gledao tvoj set. Ne mora se javiti da ti znaci.'
  ],

  // Apstinent reflection
  apstinent_reflection: [
    'Bio si jedini trezni u sobi. Sta si video sto ostali nisu.',
    'Nisi pio sedam godina. Niko te ne pamti zbog toga. Pitanje koje ne moras odgovoriti: da li je trebalo.'
  ],

  // DJ navike (alkohol problem zone)
  alcohol_problem: [
    'Pijani DJ pamti dobre noci. Trezna publika pamti lose setove.',
    'Pivo nije izdaja. Drugo pivo te ne lagao. Petnaesto te je vec deceniju uvuklo.'
  ],

  // Origin teaser (post-creator)
  origin_teaser: [
    'Tvoj origin nije presuda. Pitanje je sta od nje ces nositi.',
    'Sve klase imaju puteve do finala. Razliciti tempovi, ne razliciti ishodi.'
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
