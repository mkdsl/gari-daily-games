// Aforizam bank — 52 aforizama u Pera Period stilu
// Kategorije: Noć/Klub (12), Ples/Ritam (10), Ljubav/Odnosi (12), Grad/Ulica (10), Filozofija/Apsurd (8)

export const APHORISMS = [
  // --- Noć / Klub ---
  "DJ je jedini čovek koji zna šta nam treba pre nego što to znamo mi.",
  "Klub se puni do tri. Posle tri, ostaju samo oni koji nemaju kuda.",
  "Subwoofer ne laže. Sve ostalo — možda.",
  "Noć koja počne u deset završi se ujutru bez dogovora.",
  "Svaki drop je obećanje koje beat drži bolje od ljudi.",
  "Svetla u klubu su zatamnjena iz pristojnosti prema svima nama.",
  "Cigareta napolju traje duže od razgovora unutra.",
  "Garderober zna više o tebi nego što misliš — kaput govori sve.",
  "Posle četiri ujutru, iskrenost je jedini preostali filter.",
  "Alkohol ne menja ljude. On samo uklanja napor koji ulažemo da ih sakrijemo.",
  "Red ispred kluba je jedini red u kome niko ne zna zašto čeka.",
  "Jutro posle nije kazna. Ono je samo nastavak sa manje buke.",

  // --- Ples / Ritam ---
  "Noge znaju puteve koje glava još nije ucrtala.",
  "Ritam nije metronomski. On čeka tvoj loš korak i prihvata ga.",
  "Pleše se ili ne pleše. Treće je samo čekanje uz zid.",
  "Telo pamti muziku duže nego što mozak pamti reči.",
  "Svaki ples je kratak. Zato ga niko ne žali.",
  "Na plesnom podijumu nema hierarhije — samo koordinacija ili njena odsutnost.",
  "Bas linija se ne sluša. Ona se prima u grudima i pregovara sa kičmom.",
  "Dobar DJ ne pita publiku šta želi. On zna šta joj treba pre nje same.",
  "Ritam koji te uhvati ne pušta dok ne završi šta je počeo.",
  "Ples je jedini argument koji ne zahteva reči i uvek dobija.",

  // --- Ljubav / Odnosi ---
  "Voli se negde između prvog pogleda i petog razočaranja.",
  "Tišina između dvoje ljudi govori više nego dogovorena rečenica.",
  "Svaka veza ima tačku posle koje je sve što sledi — pregovaranje.",
  "Nekoga voliš sve dok ne počneš da ga poznaješ previše dobro.",
  "Telo ne zaboravlja dodir koji se nije ponovio.",
  "Ljubomora je dokaz da nešto znači. Ravnodušnost je dokaz da je prošlo.",
  "Odlaze uvek u pogrešnom trenutku. Dolaze isto tako.",
  "Dve osobe u istoj postelji mogu biti kilometrima razdvojene.",
  "Kompromis u ljubavi nije mudrost — on je samo organizovano razočaranje.",
  "Svako ko kaže da se promenio, nije se promenio dovoljno da to ne kaže.",
  "Privlači nas ono što ne razumemo. Ostajemo zbog onog što ne možemo da pustimo.",
  "Kraj veze nije tužan. Tužno je vreme koje se provede pre kraja.",

  // --- Grad / Ulica ---
  "Tramvaj kasni jednako pouzdano svako jutro. Bar to možeš da računaš.",
  "Kafana u podne ima svoju filozofiju. Ona ne sudi, samo sluša i naplati.",
  "Grad se ne menja. Menjaju se samo lica na istim uglovima.",
  "Blok pamti sve — ko je otišao, ko se vratio i ko se pravio da nije bio.",
  "Svaki ćevabdžija zna da se o politici ne priča pre ponoći.",
  "Fontana u centru postoji samo da bi se neko slikao pored nje jednom.",
  "Parkiranje u ovom gradu je jedini sport gde svi igraju bez pravila.",
  "Pijacu u osam ujutru niko ne bira — ona se dešava sama od sebe.",
  "Sokak ima svoju logiku koja ne funkcioniše ni u jednom drugom sokaku.",
  "Komšija koji ne pozdravlja zna o tebi sve što mu treba.",

  // --- Filozofija / Apsurd ---
  "Smisao nije skriven. On je samo previše blizu da bismo ga videli.",
  "Sloboda je najlakša dok je nema niko drugi da je primeti.",
  "Sve ima objašnjenje. Neka od njih su čak i tačna.",
  "Pitanje bez odgovora nije problem. Problem je pitanje bez pitača.",
  "Vreme prolazi jednako brzo kada si srećan i kada čekaš da bude bolje.",
  "Apsurd nije to što se dešava. Apsurd je to što smo iznenađeni kad se desi.",
  "Čovek koji sve razume, ne razume ništa dovoljno.",
  "Kraj nije tamo gde misliš. On je tamo gde prestaneš da gledaš napred."
];

function shuffle(arr) {
  const a = [...arr];
  let i = a.length;
  while (i > 0) {
    const j = Math.floor(Math.random() * i--);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

class Generator {
  constructor() {
    this._queue = [];
    this._pointer = 0;
    this._current = "";
  }

  init() {
    this._queue = shuffle(APHORISMS);
    this._pointer = 0;
    this._current = this._queue[this._pointer];
    this._pointer = 1;
    return this._current;
  }

  next() {
    if (this._pointer >= this._queue.length) {
      this._queue = shuffle(APHORISMS);
      this._pointer = 0;
    }
    this._current = this._queue[this._pointer];
    this._pointer++;
    return this._current;
  }

  get current() {
    return this._current;
  }
}

export const generator = new Generator();
