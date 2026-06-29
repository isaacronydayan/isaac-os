const BASE = 'https://api.prod.whoop.com/developer/v1';

async function get(path, token) {
  try {
    const res = await fetch(`${BASE}${path}`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    const text = await res.text();
    let data;
    try { data = JSON.parse(text); } catch { data = text; }
    return { status: res.status, ok: res.ok, data };
  } catch(e) {
    return { status: 0, ok: false, data: e.message };
  }
}

export default async function handler(req, res) {
  const token = req.query.token;
  if (!token) return res.status(400).json({ error: 'Pass ?token=YOUR_ACCESS_TOKEN' });

  const endpoints = [
    '/recovery?limit=1',
    '/activity/sleep?limit=1',
    '/cycle?limit=1',
    '/activity/workout?limit=1',
    '/user/profile/basic',
    '/user/measurement/body',
  ];

  const results = {};
  for (const path of endpoints) {
    results[path] = await get(path, token);
  }

  res.setHeader('Content-Type', 'application/json');
  res.status(200).json(results);
}
