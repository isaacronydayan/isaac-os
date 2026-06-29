const WHOOP_BASE = 'https://api.prod.whoop.com/developer/v1';

async function whoopGet(path, token) {
  const res = await fetch(`${WHOOP_BASE}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`WHOOP ${path} → ${res.status}`);
  return res.json();
}

export default async function handler(req, res) {
  // Allow CORS for same-origin fetch from the SPA
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const auth = req.headers['authorization'];
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing token' });
  }
  const token = auth.slice(7);

  try {
    const [profile, recovery, sleep, cycles, workouts, body] = await Promise.allSettled([
      whoopGet('/user/profile/basic', token),
      whoopGet('/recovery?limit=30', token),
      whoopGet('/activity/sleep?limit=30', token),
      whoopGet('/cycle?limit=30', token),
      whoopGet('/activity/workout?limit=10', token),
      whoopGet('/user/measurement/body', token),
    ]);

    const safe = (p) => (p.status === 'fulfilled' ? p.value : null);

    return res.status(200).json({
      profile:   safe(profile),
      recovery:  safe(recovery),
      sleep:     safe(sleep),
      cycles:    safe(cycles),
      workouts:  safe(workouts),
      body:      safe(body),
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
