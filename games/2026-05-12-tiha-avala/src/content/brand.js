// brand.js — Kluboslavija strings i countdown

const AVALA_DATE = new Date('2026-06-20');

export function getDaysUntilAvala() {
  const today = new Date();
  const diff = Math.ceil((AVALA_DATE - today) / (1000 * 60 * 60 * 24));
  return Math.max(0, diff);
}

export const BRAND = {
  title: "TIHA AVALA",
  tagline: "Audio inženjer Kluboslavija turneje",
  countdown: () => `Avala Festival — 20. jun 2026 — ${getDaysUntilAvala()} dana`,
  footer: "Kluboslavija",
  footer_url: "https://app.bilet.rs/show/261",
  share_text: (level, score) => `Rešio/la nivo "${level}" — score ${score} | Tiha Avala 🎵`
};
