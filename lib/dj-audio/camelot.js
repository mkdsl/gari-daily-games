// camelot.js — Camelot wheel kompatibilnost
//
// Camelot wheel: 1A..12A (minor) + 1B..12B (major)
// Susedi: +1, -1 (numericki, ista letter)
// Relativni: ista cifra, druga letter (8A <-> 8B)
//
// Kompatibilan = isti + susedi + relativni

export class CamelotWheel {
  /**
   * Parsira "8A" -> {num:8, letter:"A"}; null ako nije validan.
   */
  static parse(key) {
    if (typeof key !== 'string') return null;
    const m = /^(1[0-2]|[1-9])([AB])$/.exec(key);
    if (!m) return null;
    return { num: parseInt(m[1], 10), letter: m[2] };
  }

  /**
   * Vraca listu kompatibilnih klucheva za zadati key.
   * Ukljucuje sami key + 2 susedna numericka + relativni (druga letter).
   */
  static getCompatibleKeys(key) {
    const p = this.parse(key);
    if (!p) return [];
    const wrap = (n) => ((n - 1 + 12) % 12) + 1; // 1..12 wrap
    const prev = wrap(p.num - 1);
    const next = wrap(p.num + 1);
    const otherLetter = p.letter === 'A' ? 'B' : 'A';
    return [
      `${p.num}${p.letter}`,
      `${prev}${p.letter}`,
      `${next}${p.letter}`,
      `${p.num}${otherLetter}`,
    ];
  }

  /**
   * Provera kompatibilnosti — true ako su key2 unutar getCompatibleKeys(key1).
   */
  static isCompatible(key1, key2) {
    return this.getCompatibleKeys(key1).includes(key2);
  }

  /**
   * Distanca na wheel-u (numericka + letter penalty).
   * 0 = isti, 1 = ±1 sused ili relativni, 2 = ±2 ili dijagonalni, itd.
   */
  static distance(key1, key2) {
    const a = this.parse(key1);
    const b = this.parse(key2);
    if (!a || !b) return Infinity;
    let numDist = Math.abs(a.num - b.num);
    numDist = Math.min(numDist, 12 - numDist);
    const letterDist = a.letter === b.letter ? 0 : 1;
    return numDist + letterDist;
  }
}
