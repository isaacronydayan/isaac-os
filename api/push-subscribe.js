// Registra/remove inscrições de push deste aparelho (protegido pelo PIN de sync)
const KV_URL = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const KV_TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
const STATE_KEY = 'isaacos:state';

async function kvGet() {
  const r = await fetch(`${KV_URL}/get/${STATE_KEY}`, { headers: { Authorization: `Bearer ${KV_TOKEN}` } });
  const j = await r.json();
  if (!j || j.result == null) return {};
  try { return JSON.parse(j.result); } catch { return {}; }
}
async function kvSet(o) {
  const r = await fetch(`${KV_URL}/set/${STATE_KEY}`, { method: 'POST', headers: { Authorization: `Bearer ${KV_TOKEN}` }, body: JSON.stringify(o) });
  return r.ok;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'X-Sync-Key, Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (!KV_URL || !KV_TOKEN) return res.status(503).json({ error: 'kv_not_configured' });
  if (!process.env.SYNC_SECRET) return res.status(503).json({ error: 'secret_not_configured' });
  if (req.headers['x-sync-key'] !== process.env.SYNC_SECRET) return res.status(401).json({ error: 'invalid_key' });
  if (req.method !== 'POST') return res.status(405).json({ error: 'method' });

  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
  const state = await kvGet();
  state.push_subs = state.push_subs || [];

  if (body.action === 'unsubscribe' && body.endpoint) {
    state.push_subs = state.push_subs.filter(s => s.endpoint !== body.endpoint);
  } else if (body.subscription && body.subscription.endpoint) {
    state.push_subs = state.push_subs.filter(s => s.endpoint !== body.subscription.endpoint);
    state.push_subs.push(body.subscription);
    if (state.push_subs.length > 6) state.push_subs = state.push_subs.slice(-6);
  } else {
    return res.status(400).json({ error: 'subscription obrigatória' });
  }

  state._at = Date.now();
  const ok = await kvSet(state);
  return res.status(ok ? 200 : 500).json({ ok, devices: state.push_subs.length });
}
