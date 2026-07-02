// Proxy para Google Calendar (leitura) + Google Tasks (leitura/escrita)
async function gget(url, token) {
  const res = await fetch(url, { headers: { 'Authorization': `Bearer ${token}` } });
  const text = await res.text();
  try { return { ok: res.ok, status: res.status, data: JSON.parse(text) }; }
  catch { return { ok: res.ok, status: res.status, data: text }; }
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

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, X-Refresh-Token, Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

  let token = req.headers['authorization']?.replace('Bearer ', '');
  const refresh = req.headers['x-refresh-token'];
  if (!token) return res.status(401).json({ error: 'Missing token' });

  // Renova o access token (expira em 1h) — refresh_token do Google não muda
  let newTokens = null;
  if (refresh) {
    const refreshed = await refreshToken(refresh);
    if (refreshed?.access_token) {
      token = refreshed.access_token;
      newTokens = { access_token: refreshed.access_token, expires_in: refreshed.expires_in };
    }
  }

  // POST = marcar/desmarcar uma tarefa no Google Tasks
  if (req.method === 'POST') {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const { listId, taskId, done } = body;
    if (!listId || !taskId) return res.status(400).json({ error: 'listId e taskId obrigatórios' });
    const r = await fetch(`https://tasks.googleapis.com/tasks/v1/lists/${encodeURIComponent(listId)}/tasks/${encodeURIComponent(taskId)}`, {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(done ? { status: 'completed' } : { status: 'needsAction', completed: null }),
    });
    const data = await r.json().catch(() => ({}));
    return res.status(r.ok ? 200 : r.status).json({ _new_tokens: newTokens, ok: r.ok, task: data });
  }

  // GET = eventos do calendário + tarefas
  const now = new Date();
  const timeMin = new Date(now.getTime() - 35 * 24 * 3600 * 1000).toISOString();
  const timeMax = new Date(now.getTime() + 90 * 24 * 3600 * 1000).toISOString();

  const calUrl = 'https://www.googleapis.com/calendar/v3/calendars/primary/events?' + new URLSearchParams({
    timeMin, timeMax,
    singleEvents: 'true',
    orderBy: 'startTime',
    maxResults: '250',
  });

  const [calRes, listsRes] = await Promise.allSettled([
    gget(calUrl, token),
    gget('https://tasks.googleapis.com/tasks/v1/users/@me/lists?maxResults=20', token),
  ]);

  const safe = (p) => {
    if (p.status === 'fulfilled') {
      if (p.value.ok) return p.value.data;
      return { _error: p.value.status, _detail: p.value.data };
    }
    return { _error: 'rejected', _detail: p.reason?.message };
  };

  const calendar = safe(calRes);
  const taskLists = safe(listsRes);

  // Busca tarefas de todas as listas (em paralelo)
  let tasks = [];
  const lists = taskLists?.items || [];
  if (lists.length > 0) {
    const results = await Promise.allSettled(lists.map(l =>
      gget(`https://tasks.googleapis.com/tasks/v1/lists/${encodeURIComponent(l.id)}/tasks?` + new URLSearchParams({
        showCompleted: 'true',
        showHidden: 'true',
        maxResults: '100',
      }), token)
    ));
    results.forEach((r, i) => {
      if (r.status === 'fulfilled' && r.value.ok) {
        (r.value.data.items || []).forEach(t => {
          if (t.title && t.title.trim()) {
            tasks.push({
              id: t.id,
              listId: lists[i].id,
              listName: lists[i].title,
              title: t.title,
              notes: t.notes || null,
              due: t.due || null,
              done: t.status === 'completed',
              updated: t.updated,
            });
          }
        });
      }
    });
  }

  // Normaliza eventos para o formato do frontend
  const events = (calendar?.items || []).map(e => ({
    id: e.id,
    summary: e.summary || '(sem título)',
    start: e.start?.dateTime || e.start?.date,
    end: e.end?.dateTime || e.end?.date,
    allDay: !e.start?.dateTime,
    colorId: e.colorId || '',
    location: e.location || null,
  })).filter(e => e.start);

  return res.status(200).json({
    _new_tokens: newTokens,
    _fetched_at: new Date().toISOString(),
    events,
    tasks,
    task_lists: lists.map(l => ({ id: l.id, title: l.title })),
    _calendar_error: calendar?._error || null,
    _tasks_error: taskLists?._error || null,
  });
}
