/** @fileoverview Personalized epilog combining score tier and volunteer outcomes */

import { BURNOUT_FRAGMENTS } from './volunteers_data.js';

/**
 * @typedef {{ tier: 'legend'|'decent'|'fail', score: number }} WinCond
 */

const EPILOG_INTROS = {
  legend: [
    'Ova sezona ostaje. Ne u statistici — u priči koja se prepričava.',
    'Guncati teren je nagrađen. Svaki volonter je to osetio — ti si to omogućio.',
    'Legenda se ne proglašava. Gradi se nedeljom po nedeljom, odlukom po odlukom.'
  ],
  decent: [
    'Festival je bio realan. Nije legenda — ali je tvoj, i to vredi.',
    'Sredina sezone bila je teška. Izašao si iz nje bolje nego si ušao.',
    'Guncati teren vidi svake sezone drugačijeg organizatora. Ove — video je tebe.'
  ],
  fail: [
    'Nije uspelo — ali si bio tu. Teren pamti i one koji su pokušali.',
    'Svaka neuspešna sezona nosi lekciju. Ovo je tvoja.',
    'Guncati teren je stariji od tvojih grešaka. Vratiće se — i ti možeš.'
  ]
};

const VOLUNTEER_EPILOG_LINES = {
  ana: {
    high: 'Ana je izašla iz sezone s osmehom i novim idejama. Pitaće za sledeću godinu.',
    low: 'Ana je bila pretiha poslednje nedelje. Tražila je više podrške nego što je dobila.'
  },
  mika: {
    high: 'Mika je nosio sve do kraja. Pravi fizikalac — i pravi drug.',
    low: 'Mika je seo pre finala. Kad Mika seda — nešto je pošlo naopako.'
  },
  jovana: {
    high: 'Jovana je pevala i poslednji dan. Kuhinja je bila toplo mesto sezone.',
    low: 'Jovana je kuvala bez pesme do kraja. Hrana je bila tu — vibe nije.'
  },
  dragan: {
    high: 'Dragan je uhvatio kadar koji će se dugo koristiti. Guncati ima vizuelni trag.',
    low: 'Dragan je odložio kameru. Finale nije dokumentovano — to je gubitak koji se oseća.'
  },
  djule: {
    high: 'Đule je izgradio pola terena. Bez njega, ovaj festival ne stoji.',
    low: 'Đule je stajao na terenu, ali mišići su mirovali. Premalo hrane, previše posla.'
  },
  maja: {
    high: 'Maja je dala sve u finalu. DJ set koji se pamti — energija koja nije jenjavala.',
    low: 'Maja je stišala volume sat pre kraja. Publika je to čula, ali nije razumela zašto.'
  },
  biljana: {
    high: 'Biljana je imala sve pod kontrolom do poslednjeg minuta. Festival ima kičmu.',
    low: 'Biljana je ostavila listu polu-praznu. Kad ona odustane — haos puni prazninu.'
  },
  majstor_gradnje: {
    high: 'Niko je doveo gradnju do kraja. Svaki šraf na svom mestu.',
    low: 'Niko je ostavio alat usred posla. Nedovršena gradnja govori sama.'
  },
  content_creator: {
    high: 'Lena je dokumentovala sezonu od prvog do poslednjeg dana. Guncati ima arhivu.',
    low: 'Lena je ugasila kameru ranije. Priča nije ispričana do kraja.'
  },
  farmer: {
    high: 'Zoran je hranio imanje i imanje je hranilo festival. Krug je zatvoren.',
    low: 'Zoran je otišao do njive i nije se vratio na vreme. Zemlja je pozvala jače.'
  }
};

const EPILOG_CLOSINGS = {
  legend: 'Do sledeće sezone — Guncati te čeka sa otvorenim terenima.',
  decent: 'Sezona je završena. Ono što si naučio, ostaje na terenu.',
  fail: 'Teren ne sudi. Vrati se kad budeš spreman — biće tu.'
};

/**
 * Build personalized epilog combining score tier + volunteer WB states.
 * @param {Object} state - game state with volunteers array
 * @param {WinCond} winCond
 * @returns {{ intro: string, volunteerLines: string[], closing: string }}
 */
export function getPersonalizedEpilog(state, winCond) {
  const tier = winCond?.tier || 'fail';
  const intros = EPILOG_INTROS[tier] || EPILOG_INTROS.fail;
  const intro = intros[Math.floor(Math.random() * intros.length)];

  const volunteers = state.volunteers || [];
  const volunteerLines = [];

  for (const vol of volunteers) {
    const wb = ((vol.energija ?? 0) + (vol.vibe ?? 0)) / 2;
    const lines = VOLUNTEER_EPILOG_LINES[vol.typeId];
    if (!lines) continue;

    if (wb < 30 && BURNOUT_FRAGMENTS[vol.typeId]) {
      volunteerLines.push(BURNOUT_FRAGMENTS[vol.typeId]);
    } else if (wb >= 60) {
      volunteerLines.push(lines.high);
    } else if (wb < 40) {
      volunteerLines.push(lines.low);
    }
    // 40–60: neutral, no line — volunteer neither shines nor pulls the story down
  }

  return {
    intro,
    volunteerLines,
    closing: EPILOG_CLOSINGS[tier] || EPILOG_CLOSINGS.fail
  };
}

/**
 * Render personalized epilog as a single text block (for share cards or simple display)
 * @param {Object} state
 * @param {WinCond} winCond
 * @returns {string}
 */
export function buildEpilogText(state, winCond) {
  const { intro, volunteerLines, closing } = getPersonalizedEpilog(state, winCond);
  return [intro, ...volunteerLines, closing].join(' ');
}
