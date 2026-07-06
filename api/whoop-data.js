// WHOOP Developer API v2 — camada de dados do Isaac OS
// Retorna coleções paginadas (~50 registros) para médias semanais/mensais e recordes.
const BASE = 'https://api.prod.whoop.com/developer';

async function get(path, token) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  const text = await res.text();
  try { return { ok: res.ok, status: res.status, data: JSON.parse(text) }; }
  catch { return { ok: res.ok, status: res.status, data: text }; }
}

// Tenta v2 primeiro; se falhar, tenta o path v1 equivalente (defensivo)
async function getV(pathV2, pathV1, token) {
  const r2 = await get(pathV2, token);
  if (r2.ok) return r2;
  if (pathV1) {
    const r1 = await get(pathV1, token);
    if (r1.ok) return r1;
  }
  return r2;
}

// Busca uma coleção com paginação (até `pages` páginas de 25)
async function getCollection(pathV2, pathV1, token, pages = 2) {
  let records = [];
  let next = null;
  let firstError = null;
  for (let i = 0; i < pages; i++) {
    const sep = pathV2.includes('?') ? '&' : '?';
    const url2 = pathV2 + (next ? `${sep}nextToken=${encodeURIComponent(next)}` : '');
    const r = await getV(url2, i === 0 ? pathV1 : null, token);
    if (!r.ok) { if (i === 0) firstError = r; break; }
    records = records.concat(r.data.records || []);
    next = r.data.next_token || null;
    if (!next) break;
  }
  if (firstError && records.length === 0) {
    return { _error: firstError.status, _detail: firstError.data };
  }
  return { records };
}

async function refreshToken(refresh_token) {
  try {
    const res = await fetch('https://api.prod.whoop.com/oauth/oauth2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token,
        client_id: process.env.WHOOP_CLIENT_ID,
        client_secret: process.env.WHOOP_CLIENT_SECRET,
      }),
    });
    if (!res.ok) return null;
    return res.json();
  } catch { return null; }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, X-Refresh-Token, Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  let token = req.headers['authorization']?.replace('Bearer ', '');
  const refresh = req.headers['x-refresh-token'];
  if (!token) return res.status(401).json({ error: 'Missing token' });

  // Renova o token primeiro — garante que a sessão nunca "morre" silenciosamente
  let newTokens = null;
  if (refresh) {
    const refreshed = await refreshToken(refresh);
    if (refreshed?.access_token) {
      token = refreshed.access_token;
      newTokens = refreshed;
    }
  }

  const [profileRes, bodyRes, cycles, recovery, sleep, workouts] = await Promise.all([
    getV('/v2/user/profile/basic', '/v1/user/profile/basic', token),
    getV('/v2/user/measurement/body', '/v1/user/measurement/body', token),
    getCollection('/v2/cycle?limit=25', '/v1/cycle?limit=25', token, 2),
    getCollection('/v2/recovery?limit=25', '/v1/recovery?limit=25', token, 2),
    getCollection('/v2/activity/sleep?limit=25', '/v1/sleep?limit=25', token, 2),
    getCollection('/v2/activity/workout?limit=25', '/v1/workout?limit=10', token, 2),
  ]);

  const safeOne = (r) => r.ok ? r.data : { _error: r.status, _detail: r.data };

  // Recovery do ciclo mais recente (= recovery de HOJE)
  let cycleRecovery = null;
  if (cycles?.records?.length > 0) {
    const latestCycleId = cycles.records[0].id;
    const crRes = await getV(`/v2/cycle/${latestCycleId}/recovery`, `/v1/cycle/${latestCycleId}/recovery`, token);
    if (crRes.ok) cycleRecovery = crRes.data;
  }
  if (!cycleRecovery?.score && recovery?.records?.length > 0) {
    const scored = recovery.records.find(r => r.score);
    if (scored) cycleRecovery = scored;
  }

  return res.status(200).json({
    _new_tokens: newTokens,
    _fetched_at: new Date().toISOString(),
    profile: safeOne(profileRes),
    body: safeOne(bodyRes),
    cycles,
    recovery,
    cycle_recovery: cycleRecovery,
    sleep,
    workouts,
  });
}
