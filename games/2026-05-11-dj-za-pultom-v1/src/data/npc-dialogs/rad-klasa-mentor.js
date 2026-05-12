// =============================================================================
// data/npc-dialogs/rad-klasa-mentor.js
// Scene Mentor NPC za rad-klasa origin (Sine Scenario, S1)
// =============================================================================
// Trigger: klasa === 'radnicka' (ili Custom sa keyword), wk 2-3,
//          Macro activity moment (scene slot — bar/kafana/lokalna žurka).
// Spawn chance: ~0.45 per applicable scene slot, jednom po sezoni (flag).
// Tonalitet: Pera Period observation (telo, ne sud), NPC ima sopstveni glas
//            — stariji čovek, ne mentor-tip, ne podiže prst.
// Stat impact: emergent — utiče na knowledge, scene, reckless, brand_coherence
//              kroz izbor tona u dijaloškim granama (NE hardcoded path).
// =============================================================================

export const RAD_KLASA_MENTOR = {
  id: 'rad_klasa_mentor_wk2_3',
  npc: {
    name: 'Bata Lemur',
    full_label: 'Bata Lemur — bivši rezident "Kluba 19", sad bez pulta',
    description:
      'Sedi za šankom svake srede. 30+ godina puštao, prestao pre tri godine ' +
      'bez objašnjenja. Niko ne pita zašto, on ne otvara. Ima običaj — ' +
      'gleda nekog za pultom dva minuta, pa kaže jednu rečenicu i okrene glavu.',
    voice_signature: 'kratke rečenice, nikad ne pita šta da uradiš, samo opaža; ' +
                     'govori o telu i o ruci, ne o karijeri; ime ti ne zna i ne pita',
    visual_hint: 'sedi levo od šanka, pivo do pola, ne gleda pult dok ne progovori'
  },

  trigger: {
    week_min: 2,
    week_max: 3,
    requires: {
      class_match: ['radnicka', 'custom_radnicka_keyword'],
      scene_slot_present: true,
      not_yet_seen: 'rad_klasa_mentor_seen'  // flag set after dialogue completes
    },
    spawn_chance: 0.45,
    cooldown_weeks: 0  // jednom po sezoni
  },

  // ===== DIALOG TREE =====
  // 6 izmena (NPC linija → 2-3 igračeva odgovora) sa konvergencijom u dva finala.
  // Stat impact se akumulira po izboru; emergent — nije telegrafski.

  start: 'open_1',

  nodes: {

    // ---------------------------------------------------------------------
    // EXCHANGE 1 — Otvaranje. NPC primećuje, ne hvali.
    // ---------------------------------------------------------------------
    open_1: {
      npc_line: 'Gledam te otkad si stao za pult. Ruka ti je u džepu kad ' +
                'ne mora da bude. To je iz kuće, ne iz škole.',
      choices: [
        {
          id: 'open_1a',
          text: 'Tata mi je radio u smene. Ruka u džepu znači "nema šta da radi sad".',
          stat_mods: { brand_coherence: 0.15 },
          next: 'beat_2_honest'
        },
        {
          id: 'open_1b',
          text: 'Ne znam. Nisam primetio.',
          stat_mods: {},
          next: 'beat_2_neutral'
        },
        {
          id: 'open_1c',
          text: 'Nervoza. Prvi put mi je da neko ovako gleda.',
          stat_mods: { scene: -0.05 },
          next: 'beat_2_defensive'
        }
      ]
    },

    // ---------------------------------------------------------------------
    // EXCHANGE 2 — NPC test. Razlikuje glas po onome šta je igrač rekao.
    // ---------------------------------------------------------------------
    beat_2_honest: {
      npc_line: 'Onda znaš i da ovde nije fabrička traka. Ovde se ne sklanjaš ' +
                'kad neko ode. Šta ćeš da uradiš kad ti polovina sale ode posle ' +
                'tvog drugog trekа?',
      choices: [
        {
          id: 'beat_2a',
          text: 'Idem dalje. Onaj koji ostane vredi više od onog koji ode.',
          stat_mods: { reckless: 0.20, brand_coherence: 0.10 },
          next: 'beat_3_stayer'
        },
        {
          id: 'beat_2b',
          text: 'Promenim tempo. Pokušam da ih vratim.',
          stat_mods: { knowledge: 0.10, scene: 0.10 },
          next: 'beat_3_reader'
        },
        {
          id: 'beat_2c',
          text: 'Pomislim da sam ja kriv. Pa pustim sigurno parče.',
          stat_mods: { scene: -0.10, brand_coherence: -0.10 },
          next: 'beat_3_breaker'
        }
      ]
    },

    beat_2_neutral: {
      npc_line: 'Nije sramota ne znati. Sramota je kad počneš da praviš šalu od ' +
                'sebe pre nego što te neko pita. Čuvaj se toga.',
      choices: [
        {
          id: 'beat_2d',
          text: 'Ne pravim šalu. Samo nisam još primetio puno.',
          stat_mods: { knowledge: 0.10 },
          next: 'beat_3_reader'
        },
        {
          id: 'beat_2e',
          text: 'Hvala. Razumeo sam.',
          stat_mods: {},
          next: 'beat_3_reader'
        }
      ]
    },

    beat_2_defensive: {
      npc_line: 'Nervoza je pristojna stvar. Znači da znaš da ti je nešto važno. ' +
                'Pitanje je samo da li ćeš je pustiti da te vodi ili da ti smeta.',
      choices: [
        {
          id: 'beat_2f',
          text: 'Pustim je da me vodi. Ako mi se ruka trese, ruka se trese.',
          stat_mods: { reckless: 0.15, brand_coherence: 0.10 },
          next: 'beat_3_stayer'
        },
        {
          id: 'beat_2g',
          text: 'Pokušam da je sakrijem. Niko to ne mora da vidi.',
          stat_mods: { scene: -0.05, brand_coherence: -0.05 },
          next: 'beat_3_breaker'
        }
      ]
    },

    // ---------------------------------------------------------------------
    // EXCHANGE 3 — NPC odgovara na put koji se nazire. 3 grane.
    // ---------------------------------------------------------------------
    beat_3_stayer: {
      npc_line: 'Dobro. To se ne uči, to se nasleđuje. Samo zapamti — onaj koji ostane ' +
                'ne ostaje zauvek. Drugi vikend nije isti kao prvi. Nemoj da računaš na vernost.',
      choices: [
        {
          id: 'beat_3a',
          text: 'Pa na šta računaš onda?',
          stat_mods: { knowledge: 0.15 },
          next: 'beat_4_advice'
        },
        {
          id: 'beat_3b',
          text: 'Računam na sebe. Ništa drugo i ne može.',
          stat_mods: { reckless: 0.10 },
          next: 'beat_4_solo'
        }
      ]
    },

    beat_3_reader: {
      npc_line: 'Čitanje sale je zanat. Niko te to neće naučiti na faksu. Ali nemoj ' +
                'da ti čitanje postane jedino što radiš — onda samo služiš tuđoj želji. ' +
                'Negde mora da ti je tvoje.',
      choices: [
        {
          id: 'beat_3c',
          text: 'A kako znaš šta je tvoje?',
          stat_mods: { knowledge: 0.20, brand_coherence: 0.10 },
          next: 'beat_4_advice'
        },
        {
          id: 'beat_3d',
          text: 'Možda mi to još nije ni važno.',
          stat_mods: { scene: 0.05 },
          next: 'beat_4_soft'
        }
      ]
    },

    beat_3_breaker: {
      npc_line: 'Onda ću ti reći jednu stvar i moraš da je upamtiš. Sigurno parče ' +
                'na pogrešnom mestu te košta više nego pogrešno parče na pravom mestu. ' +
                'Kad pristaneš da budeš prosečan zato što te je strah — to ostaje.',
      choices: [
        {
          id: 'beat_3e',
          text: 'Razumem. Pokušaću drugačije.',
          stat_mods: { reckless: 0.15, brand_coherence: 0.15 },
          next: 'beat_4_advice'
        },
        {
          id: 'beat_3f',
          text: 'Ne znam da li mogu. Tek počinjem.',
          stat_mods: { scene: 0.05 },
          next: 'beat_4_soft'
        }
      ]
    },

    // ---------------------------------------------------------------------
    // EXCHANGE 4 — Pricni vrh. Bata daje pravu stvar, ne savet — opservaciju.
    // ---------------------------------------------------------------------
    beat_4_advice: {
      npc_line: 'Tvoj otac je radio u smene. Moj isto. Ti i ja imamo istu stvar — ' +
                'na svaki sat moramo da opravdamo zašto smo tu. Ne moraš da je nosiš ' +
                'celog života, ali nemoj je ni odbaciti. Ima ljudi koji su je odbacili ' +
                'pa su ostali bez tla.',
      choices: [
        {
          id: 'beat_4a',
          text: 'Pa kako se to nosi a da ne smeta?',
          stat_mods: { knowledge: 0.20, brand_coherence: 0.20 },
          next: 'beat_5_landing_grounded'
        },
        {
          id: 'beat_4b',
          text: 'Ja neću da budem kao otac. Zato i puštam muziku.',
          stat_mods: { reckless: 0.10, brand_coherence: -0.05 },
          next: 'beat_5_landing_break'
        }
      ]
    },

    beat_4_solo: {
      npc_line: 'Solo je dobar dok ne pukne nešto. A pući će — svima puca. Onda ti ' +
                'treba neko ko će reći "Bato, sutra je novi vikend". Nemoj da nađeš ' +
                'tog čoveka tek kad ti pukne.',
      choices: [
        {
          id: 'beat_4c',
          text: 'A ko je tebi to bio?',
          stat_mods: { scene: 0.15 },
          next: 'beat_5_landing_grounded'
        },
        {
          id: 'beat_4d',
          text: 'Razumem. Tražiću pre.',
          stat_mods: { scene: 0.10, brand_coherence: 0.05 },
          next: 'beat_5_landing_grounded'
        }
      ]
    },

    beat_4_soft: {
      npc_line: 'Tek počinješ. Zato ti i govorim sad — kasnije nema ko da kaže. ' +
                'Ako naučiš jednu stvar od mene, neka bude ova: tvoje uvce zna pre ' +
                'nego što ti glava prizna. Slušaj prvo uvce.',
      choices: [
        {
          id: 'beat_4e',
          text: 'Hvala. Pokušaću.',
          stat_mods: { knowledge: 0.10, scene: 0.05 },
          next: 'beat_5_landing_soft'
        },
        {
          id: 'beat_4f',
          text: 'A šta ako mi uvce nije sigurno?',
          stat_mods: { knowledge: 0.15 },
          next: 'beat_5_landing_soft'
        }
      ]
    },

    // ---------------------------------------------------------------------
    // EXCHANGE 5 — Landing. Bata se okrece, ne gleda vise.
    // ---------------------------------------------------------------------
    beat_5_landing_grounded: {
      npc_line: 'Idi. Imaš posao. Ja sam već rekao više nego što sam smerao.',
      pera_observation:
        'Bata Lemur ti više ne gleda u pult. Pivo mu je do pola, ostaće tako još sat. ' +
        'Nečega si se danas držao što nije tvoja zasluga, ali se to broji.',
      stat_mods_final: {
        knowledge: 0.15,
        scene: 0.10,
        brand_coherence: 0.15,
        // emergent flag — povecava sansu za scene-mentor encounter wk 6-8
        flag: 'rad_klasa_grounded_unlocked'
      },
      ending: 'grounded'
    },

    beat_5_landing_break: {
      npc_line: 'Onda budi pažljiv da ne pobegneš toliko daleko da se ni sebi ne ' +
                'vratiš. Vidi se kad neko beži. Čuje se i u setu.',
      pera_observation:
        'Bata Lemur se okreće ka šanku. Nije se naljutio. Niti ti pohvale niti opomene — ' +
        'samo je rekao ono što je primetio.',
      stat_mods_final: {
        reckless: 0.15,
        brand_coherence: -0.10,
        scene: 0.05,
        // emergent flag — open ka Reckless Selector / Underground Craftsman path
        flag: 'rad_klasa_break_unlocked'
      },
      ending: 'break'
    },

    beat_5_landing_soft: {
      npc_line: 'Uvce se hrani vremenom. Daj mu nedelje, ne dane. Hajde, neko te ' +
                'gleda iz ćoška, idi da pustiš nešto.',
      pera_observation:
        'Bata Lemur okreće glavu. Niko od one trojice u ćošku te zapravo ne gleda — ' +
        'samo ti je dao razlog da se vratiš za pult.',
      stat_mods_final: {
        knowledge: 0.10,
        scene: 0.10,
        // emergent flag — soft-prep za Mentor sub-aktivnost wk 5+
        flag: 'rad_klasa_soft_unlocked'
      },
      ending: 'soft'
    }
  },

  // ===== POST-EVENT HOOKS =====
  // Koristi se u state.js / systems/ — emergent path push, ne hardcoded.
  post_event: {
    set_flags: ['rad_klasa_mentor_seen'],
    // Event re-trigger chance wk 6-8 (kalibracija — Mile će rešiti u v3)
    followup_event_chance_bonus: 0.05,
    // Aforizmi koji se otkljucavaju za Pera bank (Pera + Dule će ovo izložiti)
    unlocks_aforizmi_tag: 'rad_klasa_mentor_post'
  }
};

export default RAD_KLASA_MENTOR;
