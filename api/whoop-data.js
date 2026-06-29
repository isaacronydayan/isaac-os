const BASE = 'https://api.prod.whoop.com/developer/v1';

async function get(path, token) {
  const res = await fetch(`${BASE}${path}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  const text = await res.text();
  try {
    return { ok: res.ok, status: res.status, data: JSON.parse(text) };
  } catch {
    return { ok: res.ok, status: res.status, data: text };
  }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const auth = req.headers['authorization'];
  if (!auth?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing token' });
  }
  const token = auth.slice(7);

  const [profile, recovery, sleep, cycles, workouts, body] = await Promise.allSettled([
    get('/user/profile/basic', token),
    get('/recovery?limit=25&order=descending', token),
    get('/activity/sleep?limit=25&order=descending', token),
    get('/cycle?limit=25&order=descending', token),
    get('/activity/workout?limit=10&order=descending', token),
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
    profile:  safe(profile),
    recovery: safe(recovery),
    sleep:    safe(sleep),
    cycles:   safe(cycles),
    workouts: safe(workouts),
    body:     safe(body),
  });
}
