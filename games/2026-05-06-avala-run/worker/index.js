// Avala Run Leaderboard — Cloudflare Worker
// KV namespace: LEADERBOARD

const CORS_ORIGINS = [
  'https://mkdsl.github.io'
];

function isAllowedOrigin(origin) {
  if (!origin) return false;
  if (CORS_ORIGINS.includes(origin)) return true;
  // Allow localhost for dev
  if (/^http:\/\/localhost(:\d+)?$/.test(origin)) return true;
  return false;
}

function corsHeaders(request) {
  const origin = request.headers.get('Origin') || '';
  const allowed = isAllowedOrigin(origin) ? origin : CORS_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin': allowed,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400'
  };
}

function jsonResponse(data, status, request) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders(request)
    }
  });
}

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function getDailyXorKey(dateStr) {
  // Simple daily rotation: hash the date string
  let h = 0;
  for (let i = 0; i < dateStr.length; i++) {
    h = ((h << 5) - h + dateStr.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

function obfuscateSecret(secret, dateStr) {
  const dailyKey = getDailyXorKey(dateStr);
  // Convert secret to array of char codes, XOR with rotating daily key
  const codes = [];
  for (let i = 0; i < secret.length; i++) {
    codes.push(secret.charCodeAt(i) ^ ((dailyKey >> (i % 4) * 8) & 0xFF));
  }
  // Return as base64-ish string
  return btoa(String.fromCharCode(...codes));
}

function computeServerHash(score, trashCount, distance, secret) {
  // Must match client: (score * 7 + trashCount * 13 + floor(distance) * 3) ^ 0xA5B7 ^ numericSecret
  // Convert secret string to a numeric value
  let secretNum = 0;
  for (let i = 0; i < secret.length; i++) {
    secretNum = ((secretNum << 5) - secretNum + secret.charCodeAt(i)) | 0;
  }
  secretNum = Math.abs(secretNum);
  return ((score * 7 + trashCount * 13 + Math.floor(distance) * 3) ^ 0xA5B7) ^ secretNum;
}

export default {
  async fetch(request, env) {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: corsHeaders(request)
      });
    }

    const url = new URL(request.url);
    const path = url.pathname;

    try {
      if (path === '/token' && request.method === 'GET') {
        return handleGetToken(request, env);
      }
      if (path === '/score' && request.method === 'POST') {
        return await handlePostScore(request, env);
      }
      if (path === '/leaderboard' && request.method === 'GET') {
        return await handleGetLeaderboard(request, env, url);
      }
      return jsonResponse({ error: 'Not found' }, 404, request);
    } catch (err) {
      return jsonResponse({ error: 'Internal error', detail: err.message }, 500, request);
    }
  }
};

function handleGetToken(request, env) {
  const secret = env.SERVER_SECRET || 'default-secret';
  const date = todayKey();
  const token = obfuscateSecret(secret, date);
  return jsonResponse({ t: token, d: date }, 200, request);
}

async function handlePostScore(request, env) {
  const secret = env.SERVER_SECRET || 'default-secret';

  let body;
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ error: 'Invalid JSON' }, 400, request);
  }

  const { name, score, trashCount, distance, hash, timestamp } = body;

  // --- Validate name ---
  if (typeof name !== 'string') {
    return jsonResponse({ error: 'Invalid name' }, 400, request);
  }
  const trimName = name.trim();
  if (trimName.length < 2 || trimName.length > 20) {
    return jsonResponse({ error: 'Ime mora imati 2-20 karaktera' }, 400, request);
  }

  // --- Validate types ---
  if (typeof score !== 'number' || typeof trashCount !== 'number' ||
      typeof distance !== 'number' || typeof hash !== 'number') {
    return jsonResponse({ error: 'Invalid data types' }, 400, request);
  }

  // --- Distance > 0 ---
  if (distance <= 0) {
    return jsonResponse({ error: 'Invalid distance' }, 400, request);
  }

  // --- Timestamp in last 2 hours ---
  if (typeof timestamp !== 'number') {
    return jsonResponse({ error: 'Invalid timestamp' }, 400, request);
  }
  const now = Date.now();
  const twoHours = 2 * 60 * 60 * 1000;
  if (Math.abs(now - timestamp) > twoHours) {
    return jsonResponse({ error: 'Timestamp expired' }, 400, request);
  }

  // --- Hash validation ---
  const expectedHash = computeServerHash(score, trashCount, distance, secret);
  if (hash !== expectedHash) {
    return jsonResponse({ error: 'Invalid hash' }, 403, request);
  }

  // --- Sanity: score cap ---
  const maxScore = trashCount * 10 * 2 + Math.floor(distance / 100) + 5000 + distance / 10;
  if (score > maxScore) {
    return jsonResponse({ error: 'Score too high' }, 403, request);
  }

  // --- Sanity: trash vs distance ---
  if (trashCount > distance / 200) {
    return jsonResponse({ error: 'Too much trash' }, 403, request);
  }

  // --- Rate limit: 1 per name per 30s ---
  const rateLimitKey = `ratelimit:${trimName.toLowerCase()}`;
  const existing = await env.LEADERBOARD.get(rateLimitKey);
  if (existing) {
    return jsonResponse({ error: 'Sačekaj 30 sekundi' }, 429, request);
  }
  await env.LEADERBOARD.put(rateLimitKey, '1', { expirationTtl: 60 });

  // --- Store score ---
  const date = todayKey();
  const scoresKey = `scores:${date}`;
  let scores = [];
  try {
    const raw = await env.LEADERBOARD.get(scoresKey);
    if (raw) scores = JSON.parse(raw);
  } catch {}

  const entry = { name: trimName, score, rank: 0 };
  scores.push(entry);
  scores.sort((a, b) => b.score - a.score);

  // Assign ranks
  scores.forEach((s, i) => { s.rank = i + 1; });

  // Store all scores, no expiration
  await env.LEADERBOARD.put(scoresKey, JSON.stringify(scores));

  // Find this player's rank
  const playerRank = scores.findIndex(s => s.name === trimName && s.score === score);
  const rank = playerRank >= 0 ? playerRank + 1 : scores.length;

  return jsonResponse({ rank, total: scores.length }, 200, request);
}

async function handleGetLeaderboard(request, env, url) {
  const date = url.searchParams.get('date') || todayKey();

  // Validate date format
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return jsonResponse({ error: 'Invalid date format' }, 400, request);
  }

  const scoresKey = `scores:${date}`;
  let scores = [];
  try {
    const raw = await env.LEADERBOARD.get(scoresKey);
    if (raw) scores = JSON.parse(raw);
  } catch {}

  return jsonResponse({ date, scores }, 200, request);
}
