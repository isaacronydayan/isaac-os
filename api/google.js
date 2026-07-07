// Google OAuth (login + callback) + Calendar/Tasks — camada de auth e dados do Isaac OS
// (mesclado para caber no limite de Functions do Hobby)
const TASKS = 'https://tasks.googleapis.com/tasks/v1';

function handleLogin(req, res) {
  const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
  const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || `https://${req.headers.host}/google/callback`;

  if (!CLIENT_ID) {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(500).send('<h3 style="font-family:sans-serif">GOOGLE_CLIENT_ID não configurado no Vercel. Adicione em Settings → Environment Variables.</h3>');
  }

  const SCOPES = [
    'https://www.googleapis.com/auth/calendar.readonly',
    'https://www.googleapis.com/auth/tasks',
  ].join(' ');

  const params = new URLSearchParams({
    response_type: 'code',
    client_id:     CLIENT_ID,
    redirect_uri:  REDIRECT_URI,
    scope:         SCOPES,
    access_type:   'offline',
    prompt:        'consent',
    state:         'isaac_os_' + Math.random().toString(36).slice(2),
  });

  res.redirect(302, `https://accounts.google.com/o/oauth2/v2/auth?${params}`);
}

async function handleCallback(req, res) {
  const { code, error } = req.query;
  res.setHeader('Content-Type', 'text/html; charset=utf-8');

  if (error) return res.send(errorPage(error, 'Autorização negada ou cancelada.'));
  if (!code) return res.send(errorPage('missing_code', 'Nenhum código de autorização recebido.'));

  const CLIENT_ID     = process.env.GOOGLE_CLIENT_ID;
  const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
  const REDIRECT_URI  = process.env.GOOGLE_REDIRECT_URI || `https://${req.headers.host}/google/callback`;

  try {
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type:    'authorization_code',
        code,
        redirect_uri:  REDIRECT_URI,
        client_id:     CLIENT_ID,
        client_secret: CLIENT_SECRET,
      }),
    });

    const tokenData = await tokenRes.json();
    if (!tokenRes.ok || !tokenData.access_token) {
      return res.send(errorPage('token_error', JSON.stringify(tokenData)));
    }

    const { access_token, refresh_token, expires_in, scope } = tokenData;
    return res.send(successPage({ access_token, refresh_token, expires_in, scope }));
  } catch (err) {
    return res.send(errorPage('fetch_error', err.message));
  }
}

function successPage({ access_token, refresh_token, expires_in, scope }) {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<title>Conectando Google…</title>
<style>
  body{font-family:-apple-system,sans-serif;background:#0a0a0a;color:#e0e0e0;display:flex;align-items:center;justify-content:center;height:100vh;margin:0}
  .box{text-align:center;max-width:360px}
  .icon{font-size:48px;margin-bottom:16px}
  h2{font-size:20px;font-weight:700;color:#22c55e;margin-bottom:8px}
  p{font-size:13px;color:#888}
  .spin{width:20px;height:20px;border:2px solid rgba(255,255,255,.1);border-top-color:#6366f1;border-radius:50%;animation:spin .8s linear infinite;margin:16px auto}
  @keyframes spin{to{transform:rotate(360deg)}}
</style>
</head>
<body>
<div class="box">
  <div class="icon">✅</div>
  <h2>Google conectado!</h2>
  <p>Calendar + Tasks ativados. Redirecionando…</p>
  <div class="spin"></div>
</div>
<script>
(function() {
  var tokens = {
    access_token:  ${JSON.stringify(access_token)},
    refresh_token: ${JSON.stringify(refresh_token || null)},
    expires_in:    ${JSON.stringify(expires_in)},
    scope:         ${JSON.stringify(scope)},
    saved_at:      Date.now()
  };
  try { localStorage.setItem('google_tokens', JSON.stringify(tokens)); } catch(e) {}
  if (window.opener && !window.opener.closed) {
    try { window.opener.postMessage({ type: 'GOOGLE_AUTH_SUCCESS', tokens: tokens }, '*'); } catch(e) {}
    setTimeout(function() { window.close(); }, 900);
  } else {
    setTimeout(function() { window.location.href = '/'; }, 900);
  }
})();
</script>
</body>
</html>`;
}

function errorPage(code, description) {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"><title>Erro — Google Auth</title>
<style>
  body{font-family:-apple-system,sans-serif;background:#0a0a0a;color:#e0e0e0;display:flex;align-items:center;justify-content:center;height:100vh;margin:0}
  .box{text-align:center;max-width:400px}
  h2{font-size:20px;font-weight:700;color:#ef4444;margin-bottom:8px}
  p{font-size:13px;color:#888;word-break:break-all}
  code{font-size:11px;color:#555;background:#111;padding:2px 6px;border-radius:4px}
  a{color:#6366f1;font-size:13px;text-decoration:none;display:inline-block;margin-top:16px}
</style></head>
<body><div class="box">
  <div style="font-size:48px;margin-bottom:16px">❌</div>
  <h2>Erro na autenticação Google</h2>
  <p><code>${code}</code></p>
  <p>${description || ''}</p>
  <a href="/">← Voltar ao dashboard</a>
</div></body></html>`;
}

async function gfetch(url, token, opts = {}) {
  const res = await fetch(url, {
    ...opts,
    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json', ...(opts.headers || {}) },
  });
  const text = await res.text();
  let data; try { data = text ? JSON.parse(text) : {}; } catch { data = text; }
  return { ok: res.ok, status: res.status, data };
}

async function refreshToken(refresh_token) {
  try {
    const res = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
      }),
    });
    if (!res.ok) return null;
    return res.json();
  } catch { return null; }
}

function enc(x) { return encodeURIComponent(x); }

async function handleData(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, X-Refresh-Token, Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

  let token = req.headers['authorization']?.replace('Bearer ', '');
  const refresh = req.headers['x-refresh-token'];
  if (!token) return res.status(401).json({ error: 'Missing token' });

  let newTokens = null;
  if (refresh) {
    const refreshed = await refreshToken(refresh);
    if (refreshed?.access_token) {
      token = refreshed.access_token;
      newTokens = { access_token: refreshed.access_token, expires_in: refreshed.expires_in };
    }
  }

  // ============ POST = ações de escrita no Google Tasks ============
  if (req.method === 'POST') {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const { action } = body;
    let r;

    try {
      switch (action) {
        case 'toggle':
          r = await gfetch(`${TASKS}/lists/${enc(body.listId)}/tasks/${enc(body.taskId)}`, token, {
            method: 'PATCH',
            body: JSON.stringify(body.done ? { status: 'completed' } : { status: 'needsAction', completed: null }),
          });
          break;

        case 'create': {
          const payload = { title: body.title };
          if (body.notes) payload.notes = body.notes;
          if (body.due) payload.due = body.due;
          const q = body.parent ? `?parent=${enc(body.parent)}` : '';
          r = await gfetch(`${TASKS}/lists/${enc(body.listId)}/tasks${q}`, token, {
            method: 'POST', body: JSON.stringify(payload),
          });
          break;
        }

        case 'update': {
          const payload = {};
          if (body.title !== undefined) payload.title = body.title;
          if (body.notes !== undefined) payload.notes = body.notes;
          if (body.due !== undefined) payload.due = body.due; // null limpa a data
          r = await gfetch(`${TASKS}/lists/${enc(body.listId)}/tasks/${enc(body.taskId)}`, token, {
            method: 'PATCH', body: JSON.stringify(payload),
          });
          break;
        }

        case 'delete':
          r = await gfetch(`${TASKS}/lists/${enc(body.listId)}/tasks/${enc(body.taskId)}`, token, { method: 'DELETE' });
          break;

        case 'move': {
          // A API não move entre listas: cria na nova + apaga da antiga
          const orig = await gfetch(`${TASKS}/lists/${enc(body.listId)}/tasks/${enc(body.taskId)}`, token);
          if (!orig.ok) { r = orig; break; }
          const t = orig.data;
          const payload = { title: t.title };
          if (t.notes) payload.notes = t.notes;
          if (t.due) payload.due = t.due;
          if (t.status === 'completed') payload.status = 'completed';
          const created = await gfetch(`${TASKS}/lists/${enc(body.toListId)}/tasks`, token, {
            method: 'POST', body: JSON.stringify(payload),
          });
          if (!created.ok) { r = created; break; }
          await gfetch(`${TASKS}/lists/${enc(body.listId)}/tasks/${enc(body.taskId)}`, token, { method: 'DELETE' });
          r = created;
          break;
        }

        case 'createList':
          r = await gfetch(`${TASKS}/users/@me/lists`, token, {
            method: 'POST', body: JSON.stringify({ title: body.title }),
          });
          break;

        case 'renameList':
          r = await gfetch(`${TASKS}/users/@me/lists/${enc(body.listId)}`, token, {
            method: 'PATCH', body: JSON.stringify({ title: body.title }),
          });
          break;

        case 'deleteList':
          r = await gfetch(`${TASKS}/users/@me/lists/${enc(body.listId)}`, token, { method: 'DELETE' });
          break;

        default:
          return res.status(400).json({ error: 'Ação desconhecida: ' + action });
      }
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }

    return res.status(r.ok ? 200 : (r.status || 500)).json({ _new_tokens: newTokens, ok: r.ok, result: r.data });
  }

  // ============ GET = calendário + todas as listas e tarefas ============
  const now = new Date();
  const timeMin = new Date(now.getTime() - 35 * 24 * 3600 * 1000).toISOString();
  const timeMax = new Date(now.getTime() + 120 * 24 * 3600 * 1000).toISOString();

  const calUrl = 'https://www.googleapis.com/calendar/v3/calendars/primary/events?' + new URLSearchParams({
    timeMin, timeMax,
    singleEvents: 'true',
    orderBy: 'startTime',
    maxResults: '250',
  });

  const [calRes, listsRes] = await Promise.allSettled([
    gfetch(calUrl, token),
    gfetch(`${TASKS}/users/@me/lists?maxResults=50`, token),
  ]);

  const safe = (p) => {
    if (p.status === 'fulfilled') {
      if (p.value.ok) return p.value.data;
      return { _error: p.value.status, _detail: p.value.data };
    }
    return { _error: 'rejected', _detail: p.reason?.message };
  };

  const calendar = safe(calRes);
  const taskListsRaw = safe(listsRes);
  const lists = taskListsRaw?.items || [];

  // Tarefas de todas as listas, em paralelo, com tudo que a API oferece
  let tasks = [];
  if (lists.length > 0) {
    const results = await Promise.allSettled(lists.map(l =>
      gfetch(`${TASKS}/lists/${enc(l.id)}/tasks?` + new URLSearchParams({
        showCompleted: 'true',
        showHidden: 'true',
        maxResults: '100',
      }), token)
    ));
    results.forEach((r, i) => {
      if (r.status === 'fulfilled' && r.value.ok) {
        (r.value.data.items || []).forEach(t => {
          if (!t.title || !t.title.trim()) return;
          tasks.push({
            id: t.id,
            listId: lists[i].id,
            listName: lists[i].title,
            title: t.title,
            notes: t.notes || null,
            due: t.due || null,
            done: t.status === 'completed',
            completed: t.completed || null,
            parent: t.parent || null,   // subtarefa
            position: t.position || '',
            updated: t.updated,
            links: t.links || [],
          });
        });
      }
    });
  }

  const events = (calendar?.items || []).map(e => ({
    id: e.id,
    summary: e.summary || '(sem título)',
    description: e.description || null,
    start: e.start?.dateTime || e.start?.date,
    end: e.end?.dateTime || e.end?.date,
    allDay: !e.start?.dateTime,
    colorId: e.colorId || '',
    location: e.location || null,
    status: e.status || 'confirmed',
  })).filter(e => e.start && e.status !== 'cancelled');

  return res.status(200).json({
    _new_tokens: newTokens,
    _fetched_at: new Date().toISOString(),
    events,
    tasks,
    task_lists: lists.map(l => ({ id: l.id, title: l.title, updated: l.updated })),
    _calendar_error: calendar?._error || null,
    _tasks_error: taskListsRaw?._error || null,
  });
}

export default async function handler(req, res) {
  const mode = req.query?.mode;
  if (mode === 'login') return handleLogin(req, res);
  if (mode === 'callback') return handleCallback(req, res);
  return handleData(req, res);
}
