// level_data.js — 6 nivoa

export const LEVELS = [
  {
    id: 0, name: "Livada", subtitle: "Tutorial",
    min_spl: 88, spl_range: 20, dance_boost: 0.15,
    has_wind: false,
    bass_asphalt_effect: false,
    neighbours: [
      { id: 'A', x: 0.75, y: 0.3, distance: 80, direction_from_stage: 40,
        terrain_path: ['open'], label: "Komšija" }
    ],
    stage_pos: { x: 0.25, y: 0.55 },
    terrain_tiles: [{ type: 'open', rect: [0,0,1,1] }],
    sweet_spot: { spl: 100, bass: 0.5, angle: 0 },
    grace_ms: 30000,
    hint_key: 'level1'
  },
  {
    id: 1, name: "Borova Šuma", subtitle: "Šuma apsorbuje zvuk",
    min_spl: 93, spl_range: 18, dance_boost: 0.05,
    has_wind: false, bass_asphalt_effect: false,
    neighbours: [
      { id: 'A', x: 0.78, y: 0.5, distance: 120, direction_from_stage: 0,
        terrain_path: ['forest'], label: "Komšija" }
    ],
    stage_pos: { x: 0.2, y: 0.5 },
    terrain_tiles: [
      { type: 'open', rect: [0,0,0.5,1] },
      { type: 'forest', rect: [0.5,0,0.5,1] }
    ],
    sweet_spot: { spl: 110, bass: 0.6, angle: 0 },
    grace_ms: 0,
    hint_key: 'level2'
  },
  {
    id: 2, name: "Avala Dolina", subtitle: "Dolina fokusira zvuk",
    min_spl: 88, spl_range: 15, dance_boost: 0,
    has_wind: false, bass_asphalt_effect: false,
    neighbours: [
      { id: 'A', x: 0.7, y: 0.2, distance: 60, direction_from_stage: -30,
        terrain_path: ['valley'], label: "Kuća levo" },
      { id: 'B', x: 0.7, y: 0.8, distance: 65, direction_from_stage: 35,
        terrain_path: ['valley'], label: "Kuća desno" }
    ],
    stage_pos: { x: 0.2, y: 0.5 },
    terrain_tiles: [
      { type: 'open', rect: [0,0.35,1,0.3] },
      { type: 'valley', rect: [0.35,0,0.65,0.35] },
      { type: 'valley', rect: [0.35,0.65,0.65,0.35] }
    ],
    sweet_spot: { spl: 92, bass: 0.55, angle: 0 },
    grace_ms: 0,
    hint_key: 'level3'
  },
  {
    id: 3, name: "Zidovi Sela", subtitle: "Beton reflektuje",
    min_spl: 88, spl_range: 16, dance_boost: 0,
    has_wind: false, bass_asphalt_effect: true,
    neighbours: [
      { id: 'A', x: 0.72, y: 0.22, distance: 50, direction_from_stage: -45,
        terrain_path: ['asphalt'], label: "Komšija A" },
      { id: 'B', x: 0.72, y: 0.78, distance: 70, direction_from_stage: 50,
        terrain_path: ['asphalt'], label: "Komšija B" }
    ],
    stage_pos: { x: 0.2, y: 0.5 },
    terrain_tiles: [{ type: 'asphalt', rect: [0,0,1,1] }],
    sweet_spot: { spl: 93, bass: 0.45, angle: 10 },
    grace_ms: 0,
    hint_key: 'level4'
  },
  {
    id: 4, name: "Vetrovita Noć", subtitle: "Vetar menja sve",
    min_spl: 90, spl_range: 16, dance_boost: 0,
    has_wind: true, bass_asphalt_effect: false,
    neighbours: [
      { id: 'A', x: 0.7, y: 0.28, distance: 70, direction_from_stage: -20,
        terrain_path: ['forest', 'open'], label: "Komšija A" },
      { id: 'B', x: 0.72, y: 0.72, distance: 80, direction_from_stage: 25,
        terrain_path: ['asphalt'], label: "Komšija B" }
    ],
    stage_pos: { x: 0.2, y: 0.5 },
    terrain_tiles: [
      { type: 'forest', rect: [0.4,0,0.3,0.45] },
      { type: 'asphalt', rect: [0.4,0.55,0.3,0.45] },
      { type: 'open', rect: [0,0,0.4,1] },
      { type: 'open', rect: [0.7,0,0.3,1] }
    ],
    sweet_spot: { spl: 96, bass: 0.5, angle: 0 },
    grace_ms: 0,
    hint_key: 'level5'
  },
  {
    id: 5, name: "Generalna Proba", subtitle: "Boss nivo — sve kombinovano",
    min_spl: 88, spl_range: 16, dance_boost: 0,
    has_wind: false, bass_asphalt_effect: false,
    dual_speakers: true,
    neighbours: [
      { id: 'A', x: 0.65, y: 0.1, distance: 60, direction_from_stage: -50,
        terrain_path: ['forest'], label: "Kuća levo" },
      { id: 'B', x: 0.68, y: 0.9, distance: 55, direction_from_stage: 45,
        terrain_path: ['valley'], label: "Kuća desno" },
      { id: 'C', x: 0.85, y: 0.5, distance: 100, direction_from_stage: 0,
        terrain_path: ['hill_shadow'], label: "Kuća iza" }
    ],
    stage_pos: { x: 0.2, y: 0.5 },
    terrain_tiles: [
      { type: 'forest', rect: [0,0,0.5,0.45] },
      { type: 'valley', rect: [0,0.55,0.5,0.45] },
      { type: 'open', rect: [0.5,0.3,0.5,0.4] },
      { type: 'hill_shadow', rect: [0.75,0,0.25,0.3] },
      { type: 'hill_shadow', rect: [0.75,0.7,0.25,0.3] }
    ],
    sweet_spot: { spl_l: 95, spl_r: 95, angle_l: -25, angle_r: 25 },
    grace_ms: 0,
    hint_key: 'level6'
  }
];
