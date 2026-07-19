/** Proceduralni slot-filling chat generator (~936 kombinacija/platformi) */

// ======= NAME POOLS =======
export const NAMES = {
  ig: [
    'marko_bg94', 'mila.sunshine', 'guncati_fan', 'jelena_loves_dj', 'stefan_rs',
    'nina_vibes', 'relja.off', 'sonja_style', 'djole_official', 'ana_craft',
    'milan.photo', 'nevena_bg', 'vlada_groove', 'aleksandra_rs', 'bojan.beats',
    'maja_nature', 'ivan_studio', 'tamara_guncati',
  ],
  tiktok: [
    'dj.djole.rs', 'seoska_tiktokerka', 'guncati_vibe', 'novosadjanin_on_beat',
    'malo_vise_volim', 'selo_forever', 'partizan_muzik', 'bg_zumba',
    'svadba_djing', 'rustik_vibes', 'balkani_forever', 'zeleno_oko_bg',
    'ritam_srca', 'lipa_devojka', 'nas_dj', 'bas_volim_to',
    'guncati_life', 'tractor_music',
  ],
  youtube: [
    'Marko Arsenović', 'Jelena B.', 'Guncati Lover 2026', 'DJ Fan Official',
    'Milan Novaković', 'Rural Serbia Fan', 'Kulturni Centar Guncati',
    'Ana iz Sela', 'Stefan Petrović', 'NovosaĐanin', 'Mila Perić',
    'Srpski Seljak', 'Elektronska Muzika RS', 'Guncati Live Official',
    'Pogledaj Ovo', 'Bravo za Ekipu', 'Prelepo Amigo', 'Svaki Vikend',
  ],
};

// ======= TEMPLATES (13 po tagu po platformi) =======
export const TEMPLATES = {
  ig: {
    hype: [
      '{} ❤️ JESTE VIDELI OVE BOJE!!',
      '🔥 {} kaže: ovo je THE BEST dosad!!',
      '{} LAJKUJE ZA SUTRA 🎉',
      '{} 💥 NE MOGU DA VERUJEM',
      '{} ❤❤❤ DAJTE MI JOS',
      '😍 {} svaki put boljeeee',
      '{} STVARNO ŽIVIM ZA OVO',
      '{} 🙏 hvala što ste tu!!!',
      '🎧 {} i ekipa u fazonu',
      '{} 🔥🔥 koji vibe',
      '{} NEMA PAUZEEEE',
      '{} 💯 top emisija',
      '🌟 {} bravoooo ekipa',
    ],
    pitanje: [
      '{} pita: koji je ovaj track??',
      '{} hoće da zna: kad je sledeća emisija?',
      '{} upita: koliko traje?',
      '{} pita: možete li repetirati?',
      '{} zanima: imate li Spotify?',
      '{} pita: odakle DJ?',
      '{} upita: kako se mejkap?',
      '{} pitaaaaa: koji softver koristite?',
      '{} želi da zna: gost ko je?',
      '{} upita: snimate li?',
      '{} pita: za kad liveee?',
      '{} pita: da li idete u grad?',
      '{} upita: imate li merch?',
    ],
    kritika: [
      '{} kaže: audio malo tiho?',
      '{} napominje: video laguje malo',
      '{} traži: malo više basa',
      '{} pita zašto ovako tiho?',
      '{} predlaže: promenite ugao kamere?',
      '{} kaže: nema subtitles?',
      '{} napominje: lighting malo tmurno',
      '{} traži malo više energije',
      '{} kaže: audio i video ne sinhron',
      '{} napominje: šum u pozadini?',
      '{} pita: buffer kod mene?',
      '{} traži: HD verzija?',
      '{} kaže: čujem eho?',
    ],
    podrska: [
      '{} ♥ podrška za ceo tim!',
      '{} 🙌 super radite momci',
      '{} kaže: Guncati je grad',
      '{} 💚 nastavite ovako',
      '🌿 {} hvala na lepom sadržaju',
      '{} kaže: pratim od početka',
      '{} šalje ljubav timu',
      '{} 👏👏👏',
      '{} potvrĐuje: autentično i lepo',
      '{} kaže: ovakav sadržaj treba',
      '❤ {} fan od prvog dana',
      '{} svaka čast na trudu',
      '{} 🎯 tačno to treba',
    ],
  },

  tiktok: {
    hype: [
      '{} NE MOGU DA DIŠEM 🔥',
      '{} POV: ovo je savršenost',
      '{} 😭 zašto ovo nisam video ranije',
      '{} taj track > sve',
      '🤌 {} ovaj vibe je ZAKON',
      '{} share-uje svima',
      '{} 💀 ovaj drop me ubio',
      '{} stitch me please!!',
      '{} 🎵 24/7 ovo slušam',
      '{} foryoupage material!!',
      '{} CELA SRBIJA TREBA OVO',
      '{} ali ovo je fyp fr',
      '{} 🔁 repeeeat',
    ],
    pitanje: [
      '{} pita: track name???',
      '{} comment: DJ info please',
      '{} duet request? 🎧',
      '{} pita: kad ste na TT live?',
      '{} želi: link za Spotify?',
      '{} pita ime songa',
      '{} collab?? 😍',
      '{} pita: koja lokacija?',
      '{} sound link please!!',
      '{} pita ko je gost',
      '{} upita: kako se javiti?',
      '{} za DJ booking?',
      '{} pita: od kad ste tu?',
    ],
    kritika: [
      '{} kaže: audio malo slabije',
      '{} predlaže: vertical video?',
      '{} kaže: duži clip please',
      '{} napominje: lighting',
      '{} želi subtitle',
      '{} predlaže: outro muzika?',
      '{} kaže: rez malo nagao',
      '{} pita: zašto kraj tako brz',
      '{} kaže: pokaži više sobe',
      '{} napominje: thumbnail mi nije jasno',
      '{} pita: pre-save gde',
      '{} predlaže: challenge version?',
      '{} kaže: više takvih kratkih',
    ],
    podrska: [
      '{} 🤝 real support',
      '{} i ekipa kaže: VATRAAAAA',
      '{} 💛 Guncati gang',
      '{} ovo je to što treba',
      '🌍 {} iz Novog Sada pozdravlja',
      '{} ♥ keep going!!!',
      '{} kaže: srpski content konačno',
      '{} 🙏 hvala što radite ovo',
      '✅ {} fully supports',
      '{} kaže: pratim sve emisije',
      '{} 💪 srbija jaka',
      '{} kaže: originalno i lepo',
      '{} proud fan 🎉',
    ],
  },

  youtube: {
    hype: [
      '{}: Kakva emisija, bravo!',
      '{}: Ovo je nivo koji nisam očekivao!',
      '{}: Odlično, gledao sam od početka',
      '{}: 10/10 content, nastavite!',
      '{}: Svaka čast na produkciji!',
      '{}: Ovaj segment je bio savršen',
      '{}: Volim ovakve live emisije',
      '{}: Bolje nego TV, nije šala',
      '{}: Zahvalan sam što ste tu',
      '{}: Top notch kao uvek',
      '{}: Bravo za ceo tim!',
      '{}: Ovo je budućnost medija',
      '{}: Preporučio sam svima',
    ],
    pitanje: [
      '{}: Da li snimate ovo za reprise?',
      '{}: Koji softver koristite za streaming?',
      '{}: Kad je naredna emisija?',
      '{}: Možete li podeliti set listu?',
      '{}: Koji mikrofon koristite?',
      '{}: Da li planirate podcast odeljak?',
      '{}: Gde mogu videti prethodne emisije?',
      '{}: Ima li opcija za podršku kanala?',
      '{}: Da li imate newsletter?',
      '{}: Koliko zaposlenih radi?',
      '{}: Koja kamera se koristi?',
      '{}: Planirate li gostovanje?',
      '{}: Preporučujete li opremu za početnike?',
    ],
    kritika: [
      '{}: Audio bi mogao biti čistiji',
      '{}: Timestamp za sekcije bio bi koristan',
      '{}: Chapters u opisu molim',
      '{}: Thumbnail nije baš jasno',
      '{}: Closed captions?',
      '{}: Malo preglasan intro',
      '{}: Osvětljenje bih poboljšao',
      '{}: Duži intervali između blokova',
      '{}: Ovaj segment je malo usporen',
      '{}: Teška reč ili dve bez prevoda',
      '{}: Moguće bolji mikrofon?',
      '{}: Transkripcija bila bi odlična',
      '{}: Nema subtitles za strane gledaoce',
    ],
    podrska: [
      '{}: Podržavam od prvog dana!',
      '{}: Ovakav sadržaj je neophodan',
      '{}: Pretplatio sam se i ne kajem se',
      '{}: Hvala za autentičan sadržaj',
      '{}: Jedinstven format, bravo',
      '{}: Sve bolje i bolje!',
      '{}: Pratim Guncati godinama',
      '{}: Originalno srpsko, da!',
      '{}: Ponosni na ovakav rad',
      '{}: Nisam propustio ni jednu',
      '{}: Deli ovo, zaslužuje pažnju',
      '{}: Sve pohvale ekipi!',
      '{}: Ovo je ono što volim videti',
    ],
  },
};

/**
 * Generiše chat poruku za platformu
 * @param {string} platform - 'ig'|'tiktok'|'youtube'
 * @param {string} tag - 'hype'|'pitanje'|'kritika'|'podrska'
 * @returns {{ name: string, text: string, tag: string }}
 */
export function generateChatMessage(platform, tag) {
  const names = NAMES[platform] || NAMES.ig;
  const templates = TEMPLATES[platform]?.[tag] || TEMPLATES.ig.hype;
  const name = names[Math.floor(Math.random() * names.length)];
  const template = templates[Math.floor(Math.random() * templates.length)];
  const text = template.replace('{}', name);
  return { name, text, tag, platform };
}

/**
 * Bira tag na osnovu momentum-a
 * @param {number} momentum 0-1
 * @returns {string}
 */
export function pickTag(momentum) {
  const r = Math.random();
  if (momentum > 0.7) {
    // Visok momentum — više hype i podrška
    if (r < 0.50) return 'hype';
    if (r < 0.75) return 'podrska';
    if (r < 0.90) return 'pitanje';
    return 'kritika';
  } else if (momentum > 0.4) {
    if (r < 0.30) return 'hype';
    if (r < 0.55) return 'podrska';
    if (r < 0.80) return 'pitanje';
    return 'kritika';
  } else {
    // Nizak momentum — više kritike
    if (r < 0.15) return 'hype';
    if (r < 0.35) return 'podrska';
    if (r < 0.60) return 'pitanje';
    return 'kritika';
  }
}
