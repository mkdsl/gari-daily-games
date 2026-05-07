// Avala Run — Leaderboard klijent
const API = 'https://avala-run-leaderboard.mkdsl.workers.dev';

let _serverToken = null;
let _serverDate = null;
let _secretNum = 0;

function getDailyXorKey(dateStr) {
  let h = 0;
  for (let i = 0; i < dateStr.length; i++) {
    h = ((h << 5) - h + dateStr.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

function deobfuscateToken(token, dateStr) {
  const dailyKey = getDailyXorKey(dateStr);
  const raw = atob(token);
  let secret = '';
  for (let i = 0; i < raw.length; i++) {
    secret += String.fromCharCode(raw.charCodeAt(i) ^ ((dailyKey >> (i % 4) * 8) & 0xFF));
  }
  return secret;
}

function secretToNum(secret) {
  let num = 0;
  for (let i = 0; i < secret.length; i++) {
    num = ((num << 5) - num + secret.charCodeAt(i)) | 0;
  }
  return Math.abs(num);
}

function computeHashWithSecret(score, trashCount, distance) {
  return ((score * 7 + trashCount * 13 + Math.floor(distance) * 3) ^ 0xA5B7) ^ _secretNum;
}

export async function fetchToken() {
  try {
    const res = await fetch(`${API}/token`);
    if (!res.ok) return false;
    const data = await res.json();
    _serverToken = data.t;
    _serverDate = data.d;
    const secret = deobfuscateToken(_serverToken, _serverDate);
    _secretNum = secretToNum(secret);
    return true;
  } catch {
    return false;
  }
}

export async function submitScore(name, score, trashCount, distance) {
  if (!_secretNum) {
    await fetchToken();
  }
  const hash = computeHashWithSecret(score, trashCount, distance);
  try {
    const res = await fetch(`${API}/score`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        score,
        trashCount,
        distance,
        hash,
        timestamp: Date.now()
      })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return { error: err.error || 'Greška', rank: null, total: null };
    }
    return await res.json();
  } catch {
    return { error: 'Nema konekcije', rank: null, total: null };
  }
}

export async function fetchLeaderboard(date) {
  try {
    const params = date ? `?date=${date}` : '';
    const res = await fetch(`${API}/leaderboard${params}`);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export function hasToken() {
  return _secretNum !== 0;
}
