const BASE = 'https://api.prod.whoop.com/developer/v1';

async function get(path, token) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  const text = await res.text();
  try { return { ok: res.ok, status: res.status, data: JSON.parse(text) }; }
  catch { return { ok: res.ok, status: res.status, data: text }; }
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

  let newTokens = null;
  if (refresh) {
    const refreshed = await refreshToken(refresh);
    if (refreshed?.access_token) {
      token = refreshed.access_token;
      newTokens = refreshed;
    }
  }

  // Only fetch what actually works for this account
  const [profile, cycles, body] = await Promise.allSettled([
    get('/user/profile/basic', token),
    get('/cycle?limit=25', token),
    get('/user/measurement/body', token),
  ]);

  const safe = (p) => {
    if (p.status === 'fulfilled') {
      if (p.value.ok) return p.value.data;
      return { _error: p.value.status, _detail: p.value.data };
    }
    return { _error: 'rejected', _detail: p.reason?.message };
  };

  return res.status(200).json({
    _new_tokens: newTokens,
    profile:  safe(profile),
    cycles:   safe(cycles),
    body:     safe(body),
  });
}
