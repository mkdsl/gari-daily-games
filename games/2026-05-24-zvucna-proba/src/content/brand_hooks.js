// brand_hooks.js — Avala countdown, CTA URLs
import { BRAND } from '../config.js';

export function getAvalaCountdown() {
  const now = new Date();
  const diff = BRAND.TARGET_DATE - now;
  if (diff <= 0) return 'Večeras!';
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  return `Do Avale: ${days} dana`;
}

export function getTicketUrl() {
  return BRAND.TICKET_URL;
}

export function getShareUrl() {
  return BRAND.SHARE_URL;
}

export function getShareText(score, streak, rank) {
  return `🎚️ Zvučna Proba | Kluboslavija 2026\nScore: ${score}/3000 | Streak: ${streak} | Rang: ${rank}\nMožeš li i ti uhvatiti problem? ${BRAND.SHARE_URL}`;
}
