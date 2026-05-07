export const CONFIG = {
  // Canvas
  LOGICAL_WIDTH: 480,
  LOGICAL_HEIGHT: 854,

  // Ground
  GROUND_RATIO: 0.82,  // groundY = canvas.height * 0.82

  // Player
  PLAYER_X: 80,
  PLAYER_MOVE_SPEED: 180,
  PLAYER_MIN_X: 20,
  PLAYER_W: 40,
  PLAYER_H_RUN: 72,
  PLAYER_H_DUCK: 40,
  PLAYER_JUMP_VY: -620,
  GRAVITY: 1400,
  DUCK_DURATION: 0.6,  // sekunde
  FAST_FALL_BOOST: 2000,

  // Speed
  SPEED_BASE: 200,
  SPEED_GROWTH: 0.025,  // per pixel distance
  SPEED_MAX: 600,

  // Scoring
  TRASH_SCORE: 10,           // bodovi po komadu smeća
  DIST_SCORE_PER_100PX: 1,   // bodovi po 100px distance

  // Spawning
  SPAWN_MIN_GAP: 280,
  SPAWN_MAX_GAP: 520,
  TRASH_CHANCE: 0.55,    // šansa da spawn bude smeće
  // ostatak (0.45) je prepreka

  // Anti-abuse: svakih 30s random delay spawn
  ANTI_ABUSE_INTERVAL: 30,

  // Combo
  COMBO_THRESHOLD: 3,
  COMBO_MULTIPLIER: 2,

  // Near-miss
  NEAR_MISS_DISTANCE: 15,
  NEAR_MISS_BONUS: 5,

  // Drop moment
  DROP_INTERVAL_BASE: 45,
  DROP_INTERVAL_VARIANCE: 5,
  DROP_DURATION: 2,
  DROP_SPEED_MULT: 1.5,

  // Milestones
  MILESTONES: [500, 1000, 2000, 3000, 5000],

  // Objects — format: { w, h, groundOffset } (groundOffset = koliko je od groundY gore, 0 = stoji na tlu)
  OBSTACLES: {
    bor:    { w: 28, h: 64, groundOffset: 64, hitW: 20, hitH: 36, reqJump: false, moveSpeed: 0 },
    kamen:  { w: 56, h: 36, groundOffset: 36, hitW: 48, hitH: 28, reqJump: true,  moveSpeed: 0 },
    kamion: { w: 110, h: 58, groundOffset: 58, hitW: 104, hitH: 54, reqJump: true,  moveSpeed: -80 },
    dron:   { w: 36, h: 16, groundOffset: 84, hitW: 34, hitH: 14, reqJump: false, moveSpeed: -100 },
    grana:  { w: 90, h: 12, groundOffset: 62, hitW: 85, hitH: 10, reqJump: false, moveSpeed: 0 },
    roj:    { w: 32, h: 24, groundOffset: 185, hitW: 28, hitH: 20, reqJump: false, moveSpeed: -60 }
  },
  COLLECTIBLES: {
    flasa: { w: 16, h: 24, groundOffset: 24, scoreType: 'trash', trashVal: 1, requireAction: 'grab_down' },
    kesa:  { w: 20, h: 18, groundOffset: 190, scoreType: 'trash', trashVal: 1, requireAction: 'grab_up' },
    logo:  { w: 28, h: 28, groundOffset: 50, scoreType: 'logo',  trashVal: 0, requireAction: null }
  },

  // Logo power-up
  LOGO_SCORE: 50,
  LOGO_CHANCE: 0.03,

  // Colors
  COLORS: {
    BG_TOP:      '#7a1a2e',
    BG_MID:      '#2d1244',
    BG_BOTTOM:   '#0a0d1a',
    GROUND:      '#1a0d06',
    GROUND_LINE: '#2d1b0e',
    PLAYER:      '#1a1a2e',
    PLAYER_HL:   '#4466AA',
    OBSTACLE:    '#1a0d06',
    LIMENKA:     '#8899AA',
    FLASA:       '#7A5C3A',
    PAPIR:       '#D0D0C0',
    PINE_FAR:    '#0a1a0a',
    PINE_MID:    '#071407',
    BRANDING:    '#cc2244',
    HUD_TEXT:    '#FFFFFF',
    HUD_SCORE:   '#FFD700'
  },

  // Audio
  BEAT_INTERVAL: 0.5,   // sekunde između bass beat-ova

  // Daily highscore
  SAVE_KEY: 'avala-run-daily-v2',

  // Aforizmi
  AFORIZMI: [
    "Avala ne pita da li si spreman. Avala pita da li si tu.",
    "Smeće na putu ne priča o putu — priča o onom ko prolazi i ne zastane.",
    "Šuma u 3 ujutru nije prepreka. Prepreka je misliti da ne možeš proći.",
    "Na Avalu se ne ide. Na Avalu se stiže.",
    "Ko trči kroz šumu u 3 ujutru, taj ne beži — taj juri.",
    "Bas ne pita za dozvolu. Bas uđe.",
    "Smeće koje pokupim na Avali teže je od izgovora koje nosim celu nedelju.",
    "Šuma noću nema zidove. Ti ih donosiš.",
    "Trčiš brže kad znaš da te čeka drop.",
    "Avala ne oprašta spor korak, ali pamti svaki.",
    "Onaj ko skuplja smeće dok trči — taj čisti i sebe.",
    "Noć na planini je jedini klub bez ulaza i bez izlaza.",
    "Sub-bas je jedini zemljotres koji tražiš.",
    "Svaki komad smeća na stazi je nečiji 'nije moj problem.' Sad je tvoj.",
    "Trči dok ne prestaneš da misliš. Tek onda počinješ.",
    "Na Avali nema reflektora. Ili svetliš ili se gubiš.",
    "Šuma se ne pomera. Ti se pomeraš ili stojiš.",
    "Ko je čuo bas kako odjekuje među drvetima, taj više ne traži klub.",
    "Smeće ne smeta šumi. Šuma smeta smeću — zato si ti tu.",
    "Jedna kesa na stazi teži više nego ceo set.",
    "Avala te ne meri po brzini. Meri te po tome šta si podigao usput.",
    "Noćna šuma je najiskrenije ogledalo — ne vidiš se, ali se osećaš.",
    "Noge znaju put pre glave. Pusti ih.",
    "Svaki DJ zna: tišina pre dropa je teža od dropa.",
    "Trčanje noću kroz šumu nije hrabrost. Hrabrost je stati i slušati.",
    "Avala od smeća ne pravi dramu. Pravi test.",
    "Smeće ne biraš. Smeće te bira — i gleda šta ćeš.",
    "Šuma ti ne duguje ništa. Ti šumi duguješ sve.",
    "Jedan korak u mraku vredi deset na suncu.",
    "Nije problem što je mračno. Problem je što si navikao na svetlo.",
    "Bas te tera da trčiš. Tišina te tera da razmisliš. Oboje boli.",
    "Na Avali se ne trenira telo. Na Avali se trenira prisustvo.",
    "Ko pokupi tuđe smeće, taj nosi teret koji čisti.",
    "Šuma ne spava. Ti si samo mislio da je mirna.",
    "Zvuk koji ti prolazi kroz grudni koš — to nije muzika. To je poziv.",
    "Niko nikad nije rekao 'previše sam trčao kroz šumu noćas.'",
    "Avala je jedina planina gde se penje dok se silazi u bas.",
    "Smeće na putu je biografija nekog ko nije bio tu.",
    "Ne trčiš od nečega. Trčiš kroz nešto. Razlika je sve.",
    "Šuma noću: jedino mesto gde je spoticanje napredak.",
    "Pokupi flašu. Pusti ego. Isti pokret.",
    "Kick drum i korak imaju isti ritam kad prestaneš da brojiš.",
    "Avala ne zna za 'sutra ću.' Avala zna za 'sad.'",
    "Što dublje u šumu, manje smeća. Što dublje u sebe — isto.",
    "Noć ne skriva. Noć pokazuje ono što svetlo previše lako oprašta.",
    "Trčiš sam, ali bas čuje cela šuma.",
    "Svaki komad smeća koji podigneš je glas koji šuma nije imala.",
    "Ne postoji pogrešan tempo u šumi u 3 ujutru. Postoji samo tvoj.",
    "Avala nije beg od grada. Avala je sudar sa svim što grad preglasava.",
    "Staza ne traži da budeš brz. Traži da budeš iskren.",
    "Smeće leži. Ti trčiš. Već si pobedio.",
    "Bas u šumi ne odjekuje od drveća. Odjekuje od tebe.",
    "Kad sve pokupiš i stigneš do vrha — nisi očistio Avalu. Avala je očistila tebe."
  ],

  // Links
  TICKET_URL: 'https://app.bilet.rs/show/261'
};
