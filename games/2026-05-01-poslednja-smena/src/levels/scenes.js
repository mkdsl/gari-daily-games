// scenes.js — sav narativni sadržaj igre "Poslednja Smena"
// Nema importa — čiste data.

export const SCENES = [
  {
    id: 'jutro',
    title: 'Jutro i pismo',
    illustrationKey: 'LETTER',
    text: 'Kafa je hladna. Bila je vruća kad si seo, ali si sedeo predugo pre nego što si otvorio kovertu. Beli papir, firmin pečat u gornjem levom uglu — crni, mali, definitivan. Prozor je zamrznuo kondenzat u tanke bele pruge, a svetlo lampe pada pravo na poslednji red: "poslednji radni dan, 1. maja 2026." Nisi mislio da će pismo biti ovako kratko.',
    options: [
      {
        text: 'Sklopiti. Staviti u džep.',
        effects: { ponos: +8, gorčina: +5 }
      },
      {
        text: 'Pročitati dva puta, polako.',
        effects: { umor: +10 }
      },
      {
        text: 'Zgužvati. Baciti. Pokupiti.',
        effects: { gorčina: +12, ponos: -5 }
      }
    ]
  },

  {
    id: 'vesna',
    title: 'Vesna',
    illustrationKey: 'COWORKER',
    text: 'Vesna te čeka ispred svlačionice. Pregača joj je zamazana bojom za metal — uvek zaboravi da je skine pre odmora. Ruke joj mirišu na industrijski sapun, onaj sa zelenim zrncima, koji niko nije naručivao već deceniju ali se nekako uvek pojavi. "Čula sam", kaže. Ne nastavlja. Čeka te da odabereš koliko hoćeš da čuješ.',
    options: [
      {
        text: 'Pustiti je da govori.',
        effects: { solidarnost: +12 }
      },
      {
        text: '"Nemoj da mi govoriš."',
        effects: { gorčina: +8, solidarnost: -5 }
      },
      {
        text: 'Promeniti temu. Pitati za vikend.',
        effects: { umor: +8 }
      }
    ]
  },

  {
    id: 'branko',
    title: 'Branko',
    illustrationKey: 'BOSS',
    text: 'Brankova kancelarija miriši na parfem koji košta više od tvoje nedeljne plate — uvek je tako, trideset godina. Stolica iza stola škripi kad se pomeri, kao da i ona zna da ovaj razgovor ne treba da traje dugo. "Uredjeno je, kao što znaš." Kratak. Formalan. Jednom rukom drži hemijsku, drugom gleda sat. Na zidu iza njega visi godišnji plan iz 2018. Nije skinuo.',
    options: [
      {
        text: '"Hvala na svemu." Ruka za rukovanje.',
        effects: { ponos: +10, gorčina: -5 }
      },
      {
        text: 'Ćutati. Gledati ga.',
        effects: { ponos: +5, umor: +8 }
      },
      {
        text: '"Za trideset godina — ovo?" Glasno.',
        effects: { gorčina: +15, solidarnost: +5, ponos: -8 }
      }
    ]
  },

  {
    id: 'masina',
    title: 'Mašina broj 7',
    illustrationKey: 'MACHINE',
    text: 'Mašina broj 7 stoji u uglu hale, kao i uvek. Broj je izgrebán šrafcigerom u metalni okvir — 1994. — ti si ga izgrebao, prve nedelje kad su je postavili. Miris ulja na zagrejanom metalu punio je tada celu halu; sada je samo tanak trag. Duž bočne ploče, negde na sredini, postoji ogrebotina od 2003. koju ti jedino znaš kako je nastala.',
    options: [
      {
        text: 'Položiti ruku na metal. Osam sekundi.',
        effects: { ponos: +8, umor: -5 }
      },
      {
        text: 'Poslednji pregled. Sve čisto.',
        effects: { ponos: +12 }
      },
      {
        text: 'Proći pored bez zaustavljanja.',
        effects: { gorčina: +8, umor: +5 }
      }
    ]
  },

  {
    id: 'mladi',
    title: 'Mladi radnik',
    illustrationKey: 'YOUNG_WORKER',
    text: 'Dečko — ne znaš mu ime, ne radi tu duže od mesec dana — stoji kraj automatske prese s novim kacigom u ruci. Kacigar još nije izgrebán, ni zamazan, ni savijen u uglu gde svi savijaju. Cipele sjaje. Gleda te kako prolaziš i jedva primetno klimne. Ima toliko ispred sebe da još ne zna šta ima.',
    options: [
      {
        text: 'Reći mu nešto što bi voleo da čuješ na početku.',
        effects: { solidarnost: +15, ponos: +5 }
      },
      {
        text: '"Gledaj šta radiš." Kratko. Ići.',
        effects: { solidarnost: +8 }
      },
      {
        text: 'Ništa. On ima ceo život.',
        effects: { umor: +8, gorčina: +5 }
      }
    ]
  },

  {
    id: 'ogledalo',
    title: 'Hodnik',
    illustrationKey: 'MIRROR',
    text: 'U hodniku prema izlazu visi ogledalo koje je tu otkako pamtiš. U donjem desnom uglu, pukotina — tanka, ravna, kao da je neko povukao noktom — od 2019. godine, kad su menjali cev i majstor udario volan u zid. Uvek si prolazio pored. Danas se zaustavljaš. Lice ti je isto, i drugačije, i isto.',
    options: [
      {
        text: 'Gledati sebe.',
        effects: { ponos: +10, umor: +5 }
      },
      {
        text: 'Oprati lice. Voda hladna.',
        effects: { umor: -8, gorčina: -5 }
      },
      {
        text: 'Okrenuti se i izaći.',
        effects: { gorčina: +8 }
      }
    ]
  },

  {
    id: 'zvono',
    title: 'Zvono u 22:00',
    illustrationKey: 'EXIT_GATE',
    text: 'Zvono je uvek zvučalo isto — dugo, ravno, bez iznenađenja — trideset godina, svaki dan u 22:00. Kapija je otvorena. Hladan vazduh ulazi u postrojenje i miriši na mokri beton i nešto nalik slobodi ili samo na noć. Iza tebe, hala se puni glasovima smene koja dolazi. Niko te ne gleda. Svaki korak koji napravio je na mestu gde si ga napravio — i to se ne menja.',
    options: [
      {
        text: 'Izaći poslednji, kao uvek.',
        effects: { ponos: +8, solidarnost: +5 }
      },
      {
        text: 'Izaći prvi. Danas imaš pravo.',
        effects: { gorčina: -8, umor: -5 }
      },
      {
        text: 'Stati na pragu. Jedan udah. Onda izaći.',
        effects: { ponos: +5, umor: +5 }
      }
    ]
  }
];

export const EPILOGS = {
  E: {
    title: 'Nepromenjeni',
    epitaph: 'Mirko je otišao onako kako je došao — tih, siguran, sa čistom savešću. Fabrika će raditi sutra bez njega, kao što je radila pre njega. To ga nije smetalo.',
    statsLabel: 'Ravnoteža'
  },
  A: {
    title: 'Dostojanstvo',
    epitaph: 'Ono što su uzeli — radno mesto, godine, rutinu — to nije njega. Sebe je izneo netaknutog kroz kapiju, u džepu sklopljeno pismo i mir koji je teško objasniti onome ko ga nije zaradio.',
    statsLabel: 'Dostojanstvo'
  },
  B: {
    title: 'Solidarnost',
    epitaph: 'Setio se svakog lica na hodniku. Vesninih ruku, dečakovog neizgrebanog kacigara, Brankove stolice što škripi. Taj posao — biti prisutan za ljude — niko mu ne može oduzeti.',
    statsLabel: 'Solidarnost'
  },
  C: {
    title: 'Iscrpljenost',
    epitaph: 'Bio je umoran. Konačno, potpuno, pošteno umoran — ne od smene, nego od svega što je smena nosila. I u toj iscrpljenosti, nešto nalik miru: nema više šta da se troši.',
    statsLabel: 'Umor'
  },
  D: {
    title: 'Gorčina',
    epitaph: 'Otišao je sa ukusom metala u ustima — onaj tanak, stalan, koji se ne pere. Nije pogrešan, taj ukus. Bio je istinit, kao i sve trideset godina pre njega.',
    statsLabel: 'Gorčina'
  }
};
