// hints.js — tutorial tekst po nivou

export const HINTS = {
  level1: {
    intro: "Ti si audio inžinjer. Podesi 3 klizača da publika bude srećna, ali komšija ne zove inspekciju.",
    win_condition: "Drži oba merača u zelenoj zoni 10 sekundi zaredom da pređeš nivo.",
    spl_tip: "Master SPL: jačina zvuka sa bine. Više = sretnija publika, ali i glasnije za komšiju.",
    bass_tip: "Bass Ratio: više basa = sretnija publika, ali previše distortuješ zvuk.",
    angle_tip: "Speaker Angle: usmer zvuk prema plesu, daleko od kuća."
  },
  level2: {
    intro: "Šuma apsorbuje zvuk — komšija je zaštićen, ali publika čuje manje. Mora jače!",
    spl_tip: "Povećaj SPL — šuma uzima 10 dB od signala.",
    bass_tip: "Više basa poboljšava atmosferu.",
    angle_tip: "Angle nije toliko bitan ovde, šuma radi posao."
  },
  level3: {
    intro: "Dolina fokusira zvuk. Mali ugao zvučnika je ključan — obe kuće moraju da ostanu pod 70dB.",
    spl_tip: "Drži SPL umereno — dolina ga pojačava za +7 dB.",
    bass_tip: "Bass nije ključan faktor ovde.",
    angle_tip: "Usmer zvuk tačno između kuća — uzan raspon!"
  },
  level4: {
    intro: "Beton reflektuje! Visok bas na asfaltu = više dB kod komšije. Smanjite bas!",
    spl_tip: "SPL mora biti balansiran — asfalt dodaje 4 dB.",
    bass_tip: "PAZI: bass_ratio > 0.5 dodatno povećava Kdb kod komšije!",
    angle_tip: "Ugao pomaže da se zvuk usmeri dalje od komšija."
  },
  level5: {
    intro: "Vetar menja SPL za ±4 dB u ritmu od 8 sekundi. Postavi buffer — ne idi do ivice!",
    spl_tip: "Ostavi marginu od barem 5 dB ispod limita — vetar može da te gurne preko!",
    bass_tip: "Bass drži umereno.",
    angle_tip: "Angle ostavi prema centru plese zone."
  },
  level6: {
    intro: "Generalna proba. Dva zvučnika, tri komšije. Levi i desni moraju raditi zajedno.",
    spl_tip: "Balansuj L i R zvučnike — svaki utiče na bliže kuće.",
    bass_tip: "Bass je zajednički (50% fiksiran).",
    angle_tip: "L locked: -60 do 0, R locked: 0 do +60. Usmeri pažljivo!"
  }
};
