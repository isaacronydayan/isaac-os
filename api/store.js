// Armazenamento sincronizado do Isaac OS (Upstash Redis via REST)
// Guarda tokens + hábitos para sincronizar celular/computador — e serve de base
// para os NFC stickers no futuro. Protegido por SYNC_SECRET (env var).
const KV_URL = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const KV_TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
const STATE_KEY = 'isaacos:state';

async function kvGet() {
  const r = await fetch(`${KV_URL}/get/${STATE_KEY}`, {
    headers: { Authorization: `Bearer ${KV_TOKEN}` },
  });
  const j = await r.json();
  if (!j || j.result === null || j.result === undefined) return {};
  try { return JSON.parse(j.result); } catch { return {}; }
}

async function kvSet(obj) {
  const r = await fetch(`${KV_URL}/set/${STATE_KEY}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${KV_TOKEN}` },
    body: JSON.stringify(obj),
  });
  return r.ok;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'X-Sync-Key, Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (!KV_URL || !KV_TOKEN) return res.status(503).json({ error: 'kv_not_configured' });
  if (!process.env.SYNC_SECRET) return res.status(503).json({ error: 'secret_not_configured' });

  const key = req.headers['x-sync-key'];
  if (!key || key !== process.env.SYNC_SECRET) return res.status(401).json({ error: 'invalid_key' });

  try {
    if (req.method === 'GET') {
      const state = await kvGet();
      return res.status(200).json(state);
    }

    if (req.method === 'POST') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
      const merge = body.merge || {};
      const state = await kvGet();
      // merge raso: cada chave enviada substitui a existente (null remove)
      for (const k of Object.keys(merge)) {
        if (merge[k] === null) delete state[k];
        else state[k] = merge[k];
      }
      state._at = Date.now();
      const ok = await kvSet(state);
      return res.status(ok ? 200 : 500).json({ ok, _at: state._at });
    }

    return res.status(405).json({ error: 'method_not_allowed' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
