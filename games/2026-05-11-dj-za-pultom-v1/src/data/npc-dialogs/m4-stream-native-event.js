// =============================================================================
// data/npc-dialogs/m4-stream-native-event.js
// M4 Stream-Native: Scene Initiation Event (Sine Scenario, S1)
// =============================================================================
// Iskra v8 / GDD v2 sekcija 6.8:
//   Hidden challenge — "Online publika ne dolazi u klub" (Conversion shock).
//   Igrač očekuje ~10% od 4000 = 400 ljudi, realnost 8-12.
//   V1 tier 4 NE konvertuje u Reputation kao kod drugih origin-a.
//
// Trigger: M4 origin × wk 4-5 × prvi gig sa Insta promo flag-om.
// Format: solo scene (DJ + telefon), bez fizičkog NPC-a — interjekcije od
//         "online publike" (chat overlay) deluju kao kolektivni NPC.
//
// Emocionalni arc (Sine signature):
//   Setup (hype + ego) → Crash (brojke uđu) → Realization (telo registruje)
//   → Choice (4 reakcije) → Consequence (path predispozicija push)
// =============================================================================

export const M4_STREAM_NATIVE_EVENT = {
  id: 'm4_stream_native_initiation_wk4_5',

  trigger: {
    week_min: 4,
    week_max: 5,
    requires: {
      origin_preset: 'm4_stream_native',
      first_gig_with_insta_promo: true,
      not_yet_seen: 'm4_initiation_seen'
    },
    spawn_chance: 1.0,  // mora da pukne kad uslovi stoje — to je core failure GDD-a
    forced_one_shot: true
  },

  scene: {
    location: 'mali klub, garderoba 10 min pre sluzbe',
    visual_hint:
      'mala soba, ogledalo, kontrolnik na stolu. Telefon vibrira tri puta zaredom. ' +
      'Pojavljuje se Insta Live notifikacija "8 ljudi gleda". RSVP brojac u DM-u: 11.',
    audio_hint:
      'iz sale se cuje "soundcheck" druge ekipe. Bas dolazi prigusen. ' +
      'Telefon zvoni — vibracija na drvenoj povrsini, sitan zvuk koji puni sobu.',
    music_cue: 'Ceca audio task — "stream_native_garderoba_ambient.opus" (8s loop)'
  },

  // ===== EMOTIONAL ARC =====
  // Sine signature — 4 stepena, ne 6. Realizacija mora biti telesna, ne brojevna.

  start: 'beat_setup',

  nodes: {

    // ---------------------------------------------------------------------
    // BEAT 1 — SETUP. Igrač ulazi sa hype-om. Brojke iz onlajn-a su jos visoke.
    // ---------------------------------------------------------------------
    beat_setup: {
      narrator_line:
        'Pre dva dana si pustio TikTok najavu. 47 hiljada pregleda, 4 hiljade lajkova. ' +
        'Komentari: "BACAM SVE", "doći ću ČAK iz Novog Sada", "konačno UŽIVO".',
      diegetic_visual: '[Telefon] Insta DM inboks: 23 nova. RSVP "Da" event check-in: 89.',
      auto_advance: true,
      next: 'beat_crash'
    },

    // ---------------------------------------------------------------------
    // BEAT 2 — CRASH. Brojke realnosti udju. Sine 1: pokazati brojku, ne pricati o njoj.
    // ---------------------------------------------------------------------
    beat_crash: {
      narrator_line:
        'Hostesa otvara vrata. "Ej, koliko si očekivao? Imamo 14 unutra, još 3 napolju čekaju druga."',
      diegetic_visual:
        '[Stream chat overlay, paralelno] "kad ćeš uživo??" / "iz koje fele svira?" / ' +
        '"opet TikTok DJ koji ne zna da pusti uživo lol"',
      pera_observation:
        'Telefon ti je topao jer ti je predugo u ruci. Ne vidiš vreme jer ti je lista obaveštenja ' +
        'popunila ceo ekran. Četrnaest ljudi u sali. Sedamdeset i pet posto njih je ' +
        'tu zbog tuđe žurke.',
      auto_advance: true,
      next: 'beat_realization'
    },

    // ---------------------------------------------------------------------
    // BEAT 3 — REALIZATION. Telesna, ne intelektualna. Sine 2: vrat, znoj, ne misao.
    // ---------------------------------------------------------------------
    beat_realization: {
      narrator_line:
        'Vrat ti se zategao. Ne razmišljaš — telu je već rekao neko da nešto nije ' +
        'kako treba. Pogledaš telefon: stream chat ima 312 ljudi. Soba ima 14.',
      pera_observation:
        '*"Hiljade su te lajkovale dok si bio crtež. Sad si meso, i krug se sužava."*',
      pause_ms: 2200,
      auto_advance: true,
      next: 'beat_choice'
    },

    // ---------------------------------------------------------------------
    // BEAT 4 — CHOICE. 4 reakcije, kako brif specifikuje. Sine 3: niti jedna nije
    // sigurno tacna; svaka donosi razlicit consequence.
    // ---------------------------------------------------------------------
    beat_choice: {
      narrator_line:
        'Hostesa još uvek stoji u vratima. Soundcheck druge ekipe se završava. ' +
        'Dvanaest minuta do pulta.',
      choices: [
        {
          id: 'choice_platform',
          label: '(a) Kriva platforma',
          text:
            'TikTok publika nije klupska publika. Trebalo je da gradim Boiler ' +
            'snimke od početka, ne Reels.',
          path_push: 'sound_purist',
          stat_mods: {
            knowledge: 0.20,
            promo: -0.10,
            reckless: 0.05,
            brand_coherence: 0.15
          },
          flag_set: 'm4_platform_revisited',
          next: 'consequence_platform'
        },
        {
          id: 'choice_audience',
          label: '(b) Kriva publika',
          text:
            'Lajk je besplatan, karta nije. To je problem onih koji su lajkovali, ne moj.',
          path_push: 'hustler',
          stat_mods: {
            promo: 0.10,
            scene: -0.15,
            brand_coherence: -0.10,
            reckless: 0.05
          },
          flag_set: 'm4_audience_blamed',
          next: 'consequence_audience'
        },
        {
          id: 'choice_self',
          label: '(c) Kriv sam ja',
          text:
            'Nešto fundamentalno ne radim. Možda mi ni miks uživo nije spreman.',
          path_push: 'scene_mentor',
          stat_mods: {
            knowledge: 0.15,
            scene: 0.10,
            mixing: 0.10,
            brand_coherence: 0.10
          },
          flag_set: 'm4_self_owned',
          next: 'consequence_self'
        },
        {
          id: 'choice_again',
          label: '(d) Moramo opet',
          text:
            'Četrnaest u sali. Puštam set za četrnaest kao da je četiri hiljade. ' +
            'I sledeće nedelje opet.',
          path_push: 'networker',
          stat_mods: {
            scene: 0.20,
            reckless: 0.10,
            brand_coherence: 0.20,
            promo: -0.05
          },
          flag_set: 'm4_grit_chosen',
          next: 'consequence_again'
        }
      ]
    },

    // ---------------------------------------------------------------------
    // CONSEQUENCE STAGES — Sine 4: ono što sledi nije pohvala ni kritika, vec stvarni
    // mehanicki shift. Svaki ending je 2-3 recenice koje pokazuju gde igrac sad stoji.
    // ---------------------------------------------------------------------
    consequence_platform: {
      narrator_line:
        'Puštaš set. Četrnaest ljudi. Tri ostaju do kraja. Posle, ne otvaraš ' +
        'TikTok dva dana. Otvoriš SoundCloud, praviš svoj prvi 30-minutni miks bez rezova.',
      pera_observation:
        'Onlajn si izgubio osamdeset pratilaca. Negde su se zatvorila vrata koja ti nisu ni bila tvoja.',
      stat_summary_text: 'Sound-purist put se otvorio. Promo tier privremeno pao.',
      ending: 'platform'
    },

    consequence_audience: {
      narrator_line:
        'Puštaš set. Četrnaest ljudi. Petoro ode posle trećeg parčeta. Posle, snimaš priču ' +
        'gde kažeš "samo prava publika dolazi". 1200 lajkova, 14 komentara "ali nisi imao ni 20 ljudi bro".',
      pera_observation:
        'Priča ti je viralna, brend ti je krhkiji. Sledeći klub te zove pa otkaže.',
      stat_summary_text: 'Hustler put se otvorio. Scene tier ti je sad osetljivo nizak.',
      ending: 'audience'
    },

    consequence_self: {
      narrator_line:
        'Puštaš set. Četrnaest ljudi. Osmoro ostaje do kraja. Posle, sediš sa hostesom ' +
        'sat vremena dok ne ugase svetla. Pita kako si počeo. Slušaš pre nego što odgovoriš.',
      pera_observation:
        'Niko te ne pita za broj pratilaca te noći. Niko se ne hvali u tuđi telefon.',
      stat_summary_text: 'Scene Mentor put se otvorio. Mixing tier raste jer si priznao gde si.',
      ending: 'self'
    },

    consequence_again: {
      narrator_line:
        'Puštaš set. Četrnaest ljudi. Trinaest ostaje do kraja. Hostesa te zove sledeće ' +
        'nedelje opet. I treće. Četvrte nedelje imaš 28. Sedme imaš 47.',
      pera_observation:
        'Stream brojke ti više ne rastu. Brojke u sali rastu sporo, ali su tvoje.',
      stat_summary_text: 'Networker put se otvorio. Brand coherence tier značajno gore.',
      ending: 'again'
    }
  },

  // ===== POST-EVENT HOOKS =====
  post_event: {
    set_flags: ['m4_initiation_seen'],
    // GDD 6.8 cure path: "gubi nesto online" (follower drop) ali dobija "scene insider tier 1"
    apply_global_effects: [
      { type: 'follower_drop', percent_range: [3, 12] },  // varira po izboru
      { type: 'scene_insider_unlock', tier: 1, conditional_on_flag: [
          'm4_platform_revisited',
          'm4_self_owned',
          'm4_grit_chosen'
        ]
      }
    ],
    // Audience-blamed grana NE dobija scene insider — to je deo consequence-a.
    unlocks_aforizmi_tag: 'm4_post_initiation'
  }
};

export default M4_STREAM_NATIVE_EVENT;
