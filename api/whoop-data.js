// WHOOP Developer API — v2 (v1 foi desligada em Out/2025)
const BASE = 'https://api.prod.whoop.com/developer';

async function get(path, token) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  const text = await res.text();
  try { return { ok: res.ok, status: res.status, data: JSON.parse(text) }; }
  catch { return { ok: res.ok, status: res.status, data: text }; }
}

// Tenta v2 primeiro; se falhar (4xx/5xx), tenta o path v1 equivalente
async function getV(pathV2, pathV1, token) {
  const r2 = await get(pathV2, token);
  if (r2.ok) return r2;
  if (pathV1) {
    const r1 = await get(pathV1, token);
    if (r1.ok) return r1;
  }
  return r2; // devolve o erro do v2 para debug
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

  // Renova o token primeiro para garantir dados frescos
  let newTokens = null;
  if (refresh) {
    const refreshed = await refreshToken(refresh);
    if (refreshed?.access_token) {
      token = refreshed.access_token;
      newTokens = refreshed;
    }
  }

  const [profileRes, cyclesRes, recoveryRes, sleepRes, workoutRes, bodyRes] = await Promise.allSettled([
    getV('/v2/user/profile/basic',    '/v1/user/profile/basic',    token),
    getV('/v2/cycle?limit=25',        '/v1/cycle?limit=25',        token),
    getV('/v2/recovery?limit=25',     '/v1/recovery?limit=25',     token),
    getV('/v2/activity/sleep?limit=25',   '/v1/sleep?limit=25',    token),
    getV('/v2/activity/workout?limit=25', '/v1/workout?limit=10',  token),
    getV('/v2/user/measurement/body', '/v1/user/measurement/body', token),
  ]);

  const safe = (p) => {
    if (p.status === 'fulfilled') {
      if (p.value.ok) return p.value.data;
      return { _error: p.value.status, _detail: p.value.data };
    }
    return { _error: 'rejected', _detail: p.reason?.message };
  };

  const cycles = safe(cyclesRes);

  // Recovery do ciclo mais recente (recovery de HOJE)
  let cycleRecovery = null;
  if (cycles?.records?.length > 0) {
    const latestCycleId = cycles.records[0].id;
    const crRes = await getV(`/v2/cycle/${latestCycleId}/recovery`, `/v1/cycle/${latestCycleId}/recovery`, token);
    if (crRes.ok) cycleRecovery = crRes.data;
  }

  // Fallback: se o recovery por ciclo falhar, usa o registro mais recente da coleção
  const recovery = safe(recoveryRes);
  if (!cycleRecovery?.score && recovery?.records?.length > 0) {
    const scored = recovery.records.find(r => r.score);
    if (scored) cycleRecovery = scored;
  }

  return res.status(200).json({
    _new_tokens: newTokens,
    _fetched_at: new Date().toISOString(),
    profile:        safe(profileRes),
    cycles,
    recovery,
    cycle_recovery: cycleRecovery,
    sleep:          safe(sleepRes),
    workouts:       safe(workoutRes),
    body:           safe(bodyRes),
  });
}
