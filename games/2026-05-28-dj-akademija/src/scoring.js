const _answers = [];

export function resetScoring() {
  _answers.length = 0;
}

export function addAnswer(isCorrect) {
  _answers.push(isCorrect);
}

export function getScore() {
  return _answers.filter(Boolean).length;
}

export function getTitle(score) {
  if (score === 10) return '🎛️ Head of Sound';
  if (score >= 8)  return '🎧 Sound Engineer';
  if (score >= 6)  return '🔊 Regular na Štrandu';
  if (score >= 4)  return '🎵 Slušalac u Razvoju';
  return '🚪 Obezbedi bio';
}
