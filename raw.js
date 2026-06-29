export default async function handler(req, res) {
  const token = req.query.t;
  if (!token) return res.status(400).send('Pass ?t=ACCESS_TOKEN');

  const BASE = 'https://api.prod.whoop.com/developer/v1';
  const results = {};

  const paths = [
    '/recovery?limit=1',
    '/activity/sleep?limit=1', 
    '/cycle?limit=1',
    '/activity/workout?limit=1',
    '/user/profile/basic',
    '/user/measurement/body',
  ];

  for (const p of paths) {
    try {
      const r = await fetch(BASE + p, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const text = await r.text();
      try { results[p] = { status: r.status, body: JSON.parse(text) }; }
      catch { results[p] = { status: r.status, body: text }; }
    } catch(e) {
      results[p] = { error: e.message };
    }
  }

  res.setHeader('Content-Type', 'application/json');
  res.send(JSON.stringify(results, null, 2));
}
