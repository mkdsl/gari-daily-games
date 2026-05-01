# GDD: Poslednja Smena

**Dizajner:** Mile Mehanika
**Datum:** 2026-05-01
**Žanr:** Text/Narrative — Interactive Fiction

---

## 1. Statistike

Četiri stata, nevidljiva tokom igre. Prikazuju se samo na epitaf kartici na kraju.

| Stat | Start | Min | Max | Semantika |
|------|-------|-----|-----|-----------|
| Ponos | 50 | 0 | 100 | Koliko čovek veruje da je vredelo |
| Umor | 50 | 0 | 100 | Akumulirana težina godina |
| Solidarnost | 50 | 0 | 100 | Veza sa kolegama, zajednicom |
| Gorčina | 50 | 0 | 100 | Bes, nepravda, ogorčenost |

---

## 2. Scene Mapa

Redosled je linearan. Svaka scena ima 2-3 opcije. Nema grananja u redosledu scena — sve scene se uvek prikazuju, ali opcije menjaju statove.

### Scena 1 — "Jutro i pismo"
**Ton:** Tih šok. Radnik sam čita pismo.
**Senzorni detalj:** Hladna kafa u šolji, beli papir sa firminom pečatom.

| Opcija | Tekst | Efekat |
|--------|-------|--------|
| A | Sklopiti pismo i staviti u džep. Niko ne mora da zna. | Ponos +8, Gorčina +5 |
| B | Pročitati dva puta, polako. Sve do tačke na kraju. | Umor +10 |
| C | Zgužvati. Baciti. Pokupiti nazad. | Gorčina +12, Ponos -5 |

### Scena 2 — "Vesna"
**Ton:** Topla, bolna. Kolegica koja saoseća.
**Senzorni detalj:** Njena pregača s flekama od masline, ruke koje mirišu na sapun.

| Opcija | Tekst | Efekat |
|--------|-------|--------|
| A | "Čula sam. Žao mi je." — Pustiti je da govori. | Solidarnost +12 |
| B | "Nemoj da mi govoriš šta treba da radim." | Gorčina +8, Solidarnost -5 |
| C | Promeniti temu. Pitati je za vikend. | Umor +8 |

### Scena 3 — "Gazda Branko"
**Ton:** Formalan, kratak. Šef koji čita papir, ne lice.
**Senzorni detalj:** Uredska stolica koja škripi. Parfem koji je preskup za ovaj prostor.

| Opcija | Tekst | Efekat |
|--------|-------|--------|
| A | "Hvala na svemu." — Ruka za rukovanje. | Ponos +10, Gorčina -5 |
| B | Ćutati. Gledati ga dok on ne spusti pogled. | Ponos +5, Umor +8 |
| C | "Za trideset godina — ovo?" Glasno, pred drugima. | Gorčina +15, Solidarnost +5, Ponos -8 |

### Scena 4 — "Mašina Br. 7"
**Ton:** Kontemplativna, lična. Jedino neživo koje ga zna.
**Senzorni detalj:** Broj 7 izgrebem šrafcigerom 1994. godine. Ulje na metalu.

| Opcija | Tekst | Efekat |
|--------|-------|--------|
| A | Položiti ruku na metal. Osam sekundi. | Ponos +8, Umor -5 |
| B | Napraviti poslednji pregled. Sve čisto, sve u redu. | Ponos +12 |
| C | Proći pored bez zaustavljanja. | Gorčina +8, Umor +5 |

### Scena 5 — "Mladi radnik"
**Ton:** Susret generacija. Neko ko tek počinje.
**Senzorni detalj:** Nove cipele. Neizgrebeni kacigar.

| Opcija | Tekst | Efekat |
|--------|-------|--------|
| A | Reći mu nešto što bi voleo da si čuo na početku. | Solidarnost +15, Ponos +5 |
| B | "Gledaj šta radiš, ne ko te gleda." Kratko. Ići. | Solidarnost +8 |
| C | Ništa. On ima ceo život da uči. | Umor +8, Gorčina +5 |

### Scena 6 — "Hodnik i ogledalo"
**Ton:** Introspektivna. Sam sa sobom.
**Senzorni detalj:** Ogledalo iznad lavaboa, pukotina u donjem desnom uglu od 2019.

| Opcija | Tekst | Efekat |
|--------|-------|--------|
| A | Gledati sebe. Koga vidiš? | Ponos +10, Umor +5 |
| B | Oprati lice. Voda je hladna. | Umor -8, Gorčina -5 |
| C | Okrenuti se i izaći. | Gorčina +8 |

### Scena 7 — "Kraj smene — zvono"
**Ton:** Finalan. Kapija se otvara.
**Senzorni detalj:** Zvono u 22:00 — isti ton trideset godina. Miris hladan vazduha.

| Opcija | Tekst | Efekat |
|--------|-------|--------|
| A | Izaći poslednji, kao uvek. | Ponos +8, Solidarnost +5 |
| B | Izaći prvi, danas ima pravo. | Gorčina -8, Umor -5 |
| C | Stati na pragu. Jedan dubok udah. Onda izaći. | Ponos +5, Umor +5 |

---

## 3. Krajevi i Prioriteti

Kraj se određuje posle Scene 7. Prioritet pri evaluaciji: **E > A > B > C > D**

| ID | Naziv | Uslov | Opis epitaf kartice |
|----|-------|-------|---------------------|
| E | Nepromenjeni | Svi stati između 35-65 na kraju | "Mirko je otišao onako kako je došao — tih, siguran, sa čistom savešću i praznim džepovima." |
| A | Dostojanstvo | Ponos ≥65 AND Gorčina ≤35 | "Ono što su uzeli — radno mesto, godine, jutarnje kafe — to nije njega. To nije moglo da bude njega." |
| B | Solidarnost | Solidarnost ≥65 | "Setio se svakog lica na hodniku. Znao je ko ima bolesnu decu, ko duguje stanaru, kome fali osmijeh. Taj posao niko mu ne može oduzeti." |
| C | Umor | Umor ≥65 | "Bio je umoran. Konačno, potpuno, pošteno umoran. I u toj iscrpljenosti — nešto nalik miru." |
| D | Gorčina | Gorčina ≥65 | "Otišao je sa ukusom metala u ustima. Nije pogrešan — taj ukus. Bio je istinit." |

---

## 4. Routing Algoritam

```js
function determineEnding(stats) {
  const { ponos, umor, solidarnost, gorčina } = stats;

  // Kraj E — Nepromenjeni (priority 1)
  const unchanged = [ponos, umor, solidarnost, gorčina]
    .every(v => v >= 35 && v <= 65);
  if (unchanged) return 'E';

  // Kraj A — Dostojanstvo (priority 2)
  if (ponos >= 65 && gorčina <= 35) return 'A';

  // Kraj B — Solidarnost (priority 3)
  if (solidarnost >= 65) return 'B';

  // Kraj C — Umor (priority 4)
  if (umor >= 65) return 'C';

  // Kraj D — Gorčina (fallback)
  return 'D';
}
```

---

## 5. Tehnička Specifikacija

### src/config.js
```js
export const CONFIG = {
  STAT_START: 50,
  STAT_MIN: 0,
  STAT_MAX: 100,
  HIDDEN_THRESHOLD: 15,   // za kraj E
  ENDING_PRIORITY: ['E', 'A', 'B', 'C', 'D'],
  TOTAL_SCENES: 7,
};
```

### src/state.js — State Shape
```js
{
  currentSceneIndex: 0,         // 0-6 za scene, 7 za finale
  stats: {
    ponos: 50,
    umor: 50,
    solidarnost: 50,
    gorčina: 50
  },
  history: [],                  // [{sceneId: 'jutro', choiceIndex: 0}, ...]
  ending: null,                 // 'A'|'B'|'C'|'D'|'E' posle scene 7
  gamePhase: 'playing'          // 'playing' | 'epilog'
}
```

### src/levels/scenes.js — Format Objekta
```js
export const SCENES = [
  {
    id: 'jutro',
    title: 'Jutro i pismo',
    illustration: 'LETTER',    // tip za Canvas renderer
    text: 'Pismo leži na stolu...',  // 2-5 rečenica prose
    options: [
      {
        text: 'Sklopiti pismo i staviti u džep.',
        effects: { ponos: +8, gorčina: +5 }
      },
      // ...
    ]
  }
];
```

### src/systems/narrative.js
- `getScene(index)` — vraća scenu po indeksu
- `applyChoice(state, choiceIndex)` — ažurira state, vrača novi state
- `determineEnding(stats)` — vraća ID kraja
- `getEpilog(endingId)` — vraća tekst epitaf kartice

---

## 6. Narativni Brief za Jovu

**Pravilo:** Svaka scena = 2-5 rečenica. Minimum JEDAN konkretan senzorni detalj.

**DOBRO:**
> "Mašina br.7 miriše na sveže ulje. Broj je uglabljen šrafcigerom 1994, u vreme kada je pogon radio noćne smene. Na metalu postoji ogrebotina u obliku slova V — niko ne zna od kuda."

**LOŠE:**
> "Bio je tužan dok je gledao mašinu. Mnogo uspomena."

**Kategorije senzornih detalja za ovu igru:**
- Zvuk: hum mašina, koračanje po betonu, zvono, kašalj u hodniku
- Miris: ulje, kafa, dezinficijens, hladan vazduh, cigarete
- Broj/ime: br.7, trideset godina, 22:00, "Mirko", bela čaša
- Tekstura: hladni metal, papir za pismo, sapun, radna odela
- Vizuelno: pukotina u ogledalu, fleka na pregači, novi kacigar

**Ton:** Distancirano, tačno, bez komentara naratora. Lik ne tumači — prikazuje. Čitalac tumači.

**Nikad:** "osećao se tužno/srećno/ljutito", apstraktni opisi emocija bez konkretnog okidača, eksplozivna proza.

---

## 7. Scope i Procena

| Fajl | Procena linija |
|------|----------------|
| src/levels/scenes.js | ~250 (sav narativ + opcije) |
| src/systems/narrative.js | ~80 |
| src/state.js | ~60 |
| src/config.js | ~30 |
| src/main.js | ~100 |
| src/render.js | ~200 (DOM rendering + Canvas illustrations) |
| src/ui.js | ~150 (scene prikaz, opcije, epilog) |
| src/input.js | ~50 |
| styles/*.css | ~200 |
| **Ukupno** | **~1120-1400 linija** |

Konzervativno ispod 1800 — idealan scope za 1 dan.
