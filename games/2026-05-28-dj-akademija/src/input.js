export function setupInput(onChoice) {
  const keys = { a: 0, b: 1, c: 2, d: 3 };
  document.addEventListener('keydown', (e) => {
    const idx = keys[e.key.toLowerCase()];
    if (idx !== undefined) onChoice(idx);
  });
}
