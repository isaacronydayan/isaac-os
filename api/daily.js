// Rotina diária do Isaac OS (Vercel Cron, 2x/dia):
//  · Madrugada (~03:30 SP): grava o snapshot de ONTEM na memória permanente + push de bom dia
//  · Noite (~21:30 SP): push de fechamento se ainda faltam hábitos
// Auth: Authorization: Bearer CRON_SECRET (Vercel envia sozinho) ou ?k=SYNC_SECRET (teste manual)
const KV_URL = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const KV_TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
const STATE_KEY = 'isaacos:state';
const WHOOP = 'https://api.prod.whoop.com/developer';

const spDayKey = (off = 0) => new Date(Date.now() - 3 * 3600e3 + off * 864e5).toISOString().slice(0, 10);
const spHour = () => new Date(Date.now() - 3 * 3600e3).getUTCHours();
const dayOf = (iso) => new Date(new Date(iso).getTime() - 3 * 3600e3).toISOString().slice(0, 10);

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
async function jget(url, token) {
  const r = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  if (!r.ok) return null;
  return r.json().catch(() => null);
}

async function whoopSnapshot(state, target) {
  const wt = state.whoop_tokens;
  if (!wt) return {};
  let token = wt.access_token;
  if (wt.refresh_token) {
    try {
      const r = await fetch('https://api.prod.whoop.com/oauth/oauth2/token', {
        method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ grant_type: 'refresh_token', refresh_token: wt.refresh_token, client_id: process.env.WHOOP_CLIENT_ID, client_secret: process.env.WHOOP_CLIENT_SECRET }),
      });
      if (r.ok) { const t = await r.json(); token = t.access_token; state.whoop_tokens = { ...wt, ...t, saved_at: Date.now() }; }
    } catch {}
  }
  const [rec, slp, cyc, wo] = await Promise.all([
    jget(`${WHOOP}/v2/recovery?limit=10`, token),
    jget(`${WHOOP}/v2/activity/sleep?limit=10`, token),
    jget(`${WHOOP}/v2/cycle?limit=10`, token),
    jget(`${WHOOP}/v2/activity/workout?limit=25`, token),
  ]);
  const s = {};
  const r0 = (rec?.records || []).find(r => r.score && dayOf(r.created_at || r.updated_at) === target);
  if (r0) { s.rec = Math.round(r0.score.recovery_score); s.hrv = Math.round(r0.score.hrv_rmssd_milli); s.rhr = Math.round(r0.score.resting_heart_rate); if (r0.score.spo2_percentage) s.spo2 = Math.round(r0.score.spo2_percentage); }
  const s0 = (slp?.records || []).find(r => r.score && !r.nap && dayOf(r.end || r.start) === target);
  if (s0) {
    s.slp = Math.round(s0.score.sleep_performance_percentage);
    if (s0.score.sleep_consistency_percentage !== undefined) s.cons = Math.round(s0.score.sleep_consistency_percentage);
    const st = s0.score.stage_summary || {};
    s.slh = Math.round(((st.total_light_sleep_time_milli || 0) + (st.total_slow_wave_sleep_time_milli || 0) + (st.total_rem_sleep_time_milli || 0)) / 3600e3 * 10) / 10;
  }
  const c0 = (cyc?.records || []).find(r => r.score && dayOf(r.start) === target);
  if (c0) { s.strain = Math.round(c0.score.strain * 10) / 10; s.kcal = Math.round((c0.score.kilojoule || 0) / 4.184); }
  const ws = (wo?.records || []).filter(r => r.score && dayOf(r.start) === target);
  if (ws.length) { s.wo = ws.length; s.wkcal = Math.round(ws.reduce((a, w) => a + (w.score.kilojoule || 0), 0) / 4.184); }
  return s;
}

async function googleTasksDone(state, target) {
  const gt = state.google_tokens;
  if (!gt || !gt.refresh_token) return null;
  try {
    const tr = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ grant_type: 'refresh_token', refresh_token: gt.refresh_token, client_id: process.env.GOOGLE_CLIENT_ID, client_secret: process.env.GOOGLE_CLIENT_SECRET }),
    });
    if (!tr.ok) return null;
    const token = (await tr.json()).access_token;
    const lists = await jget('https://tasks.googleapis.com/tasks/v1/users/@me/lists?maxResults=50', token);
    if (!lists?.items) return null;
    const updatedMin = new Date(new Date(target + 'T00:00:00-03:00').getTime() - 864e5).toISOString();
    let n = 0;
    const results = await Promise.all(lists.items.map(l =>
      jget('https://tasks.googleapis.com/tasks/v1/lists/' + encodeURIComponent(l.id) + '/tasks?' + new URLSearchParams({ showCompleted: 'true', showHidden: 'true', maxResults: '100', updatedMin }), token)
    ));
    results.forEach(r => (r?.items || []).forEach(t => { if (t.status === 'completed' && t.completed && dayOf(t.completed) === target) n++; }));
    return n;
  } catch { return null; }
}

async function vapidJWT(aud) {
  const jwk = JSON.parse(process.env.VAPID_JWK);
  const key = await crypto.subtle.importKey('jwk', jwk, { name: 'ECDSA', namedCurve: 'P-256' }, false, ['sign']);
  const b64 = (o) => Buffer.from(JSON.stringify(o)).toString('base64url');
  const head = b64({ typ: 'JWT', alg: 'ES256' });
  const body = b64({ aud, exp: Math.floor(Date.now() / 1000) + 12 * 3600, sub: 'mailto:isaacronydayan@gmail.com' });
  const sig = await crypto.subtle.sign({ name: 'ECDSA', hash: 'SHA-256' }, key, Buffer.from(head + '.' + body));
  return head + '.' + body + '.' + Buffer.from(sig).toString('base64url');
}

async function sendPushes(state) {
  const subs = state.push_subs || [];
  if (!subs.length || !process.env.VAPID_JWK) return { sent: 0, removed: 0 };
  let sent = 0; const keep = [];
  for (const sub of subs) {
    try {
      const jwt = await vapidJWT(new URL(sub.endpoint).origin);
      const r = await fetch(sub.endpoint, {
        method: 'POST',
        headers: { TTL: '86400', Urgency: 'normal', Authorization: 'vapid t=' + jwt + ', k=' + process.env.VAPID_PUBLIC_KEY },
      });
      if (r.status === 404 || r.status === 410) continue; // inscrição morta: descarta
      keep.push(sub); if (r.ok) sent++;
    } catch { keep.push(sub); }
  }
  const removed = subs.length - keep.length;
  state.push_subs = keep;
  return { sent, removed };
}

export default async function handler(req, res) {
  if (!KV_URL || !KV_TOKEN) return res.status(503).json({ error: 'kv_not_configured' });
  const auth = req.headers['authorization'];
  const okCron = process.env.CRON_SECRET && auth === 'Bearer ' + process.env.CRON_SECRET;
  const okKey = process.env.SYNC_SECRET && (req.query || {}).k === process.env.SYNC_SECRET;
  if (!okCron && !okKey) return res.status(401).json({ error: 'unauthorized' });

  const mode = (req.query || {}).mode || (spHour() >= 3 && spHour() < 15 ? 'morning' : 'evening');
  const state = await kvGet();
  const out = { mode };

  const prefs = state.push_prefs || { morning: true, evening: true };
  if (mode === 'morning') {
    state.history = state.history || {};
    // snapshot de ontem + backfill de até 3 dias perdidos
    for (let off = -3; off <= -1; off++) {
      const target = spDayKey(off);
      if (state.history[target]) continue;
      const snap = await whoopSnapshot(state, target);
      const td = await googleTasksDone(state, target);
      if (td !== null) snap.tasks = td;
      const defs = state.habit_defs || [];
      snap.hab = state.habit_log && state.habit_log[target] ? Object.keys(state.habit_log[target]).length : 0;
      snap.habT = defs.length || 13;
      state.history[target] = snap;
      out['snap_' + target] = true;
    }
    if (prefs.morning) Object.assign(out, await sendPushes(state)); else out.sent = 0;
  } else {
    // noite: só empurra se ainda faltam hábitos hoje
    const today = spDayKey(0);
    const defs = state.habit_defs || [];
    const total = defs.length || 13;
    const done = state.habit_log && state.habit_log[today] ? Object.keys(state.habit_log[today]).length : 0;
    out.pending = total - done;
    if (prefs.evening && out.pending > 0) Object.assign(out, await sendPushes(state));
    else out.sent = 0;
  }

  state._at = Date.now();
  await kvSet(state);
  return res.status(200).json(out);
}
