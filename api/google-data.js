// Google Calendar (leitura) + Google Tasks (CRUD completo) — camada de dados do Isaac OS
const TASKS = 'https://tasks.googleapis.com/tasks/v1';

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

export default async function handler(req, res) {
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

function enc(x) { return encodeURIComponent(x); }
