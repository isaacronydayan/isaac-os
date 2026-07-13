// IA do Isaac OS — Google Gemini (camada gratuita: aistudio.google.com)
// O cliente envia o contexto completo (WHOOP + tarefas + agenda + hábitos +
// memória permanente + padrões); aqui só protegemos a chave e chamamos o modelo.
//
// IMPORTANTE: o Google aposenta modelos com frequência (gemini-2.0-flash morreu
// em 01/06/2026; gemini-2.5-flash começou a dar 404 em 09/07/2026). Por isso
// usamos uma CADEIA DE FALLBACK: se um modelo retornar 404/"no longer available",
// tentamos o próximo automaticamente. Dá pra forçar um modelo específico com a
// env var GEMINI_MODEL (opcional), que entra no topo da fila.
var MODELS = [
  'gemini-3.5-flash',
  'gemini-3.1-flash-lite',
  'gemini-2.5-flash',
  'gemini-2.5-flash-lite',
];

function isModelGone(status, j) {
  if (status === 404) return true;
  var msg = (j && j.error && j.error.message) ? String(j.error.message).toLowerCase() : '';
  return msg.indexOf('no longer available') >= 0 || msg.indexOf('not found') >= 0 || msg.indexOf('is not supported') >= 0;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'X-Sync-Key, Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'method' });

  if (!process.env.SYNC_SECRET) return res.status(503).json({ error: 'secret_not_configured' });
  if (req.headers['x-sync-key'] !== process.env.SYNC_SECRET) return res.status(401).json({ error: 'invalid_key' });
  if (!process.env.GEMINI_API_KEY) return res.status(400).json({ error: 'missing_key' });

  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
  const { question, context, history } = body;
  if (!question || !question.trim()) return res.status(400).json({ error: 'pergunta vazia' });

  const spNow = new Date(Date.now() - 3 * 3600e3);
  const dias = ['domingo','segunda','terça','quarta','quinta','sexta','sábado'];
  const hoje = dias[spNow.getUTCDay()] + ', ' + spNow.toISOString().slice(0, 10).split('-').reverse().join('/') +
    ' às ' + String(spNow.getUTCHours()).padStart(2, '0') + ':' + String(spNow.getUTCMinutes()).padStart(2, '0');

  const system = [
    'Você é a IA do Isaac OS, o sistema operacional pessoal do Isaac (São Paulo, judeu praticante, usa WHOOP, Google Tasks e Google Calendar).',
    'Hoje é ' + hoje + ' (horário de São Paulo).',
    'Responda SEMPRE em português do Brasil, direto e conciso (até ~10 linhas, a não ser que peçam análise profunda).',
    'Baseie TODA resposta nos DADOS abaixo — cite os números reais. Se o dado não existir, diga que não tem, nunca invente.',
    'Datas em dd/mm. Seja um coach honesto: elogie o que os números justificam, aponte o que precisa melhorar.',
    'Contexto religioso: respeite Shabat e as práticas do Isaac naturalmente, sem explicações desnecessárias.',
    '',
    'DADOS ATUAIS DO ISAAC (JSON):',
    JSON.stringify(context || {}),
  ].join('\n');

  const contents = [];
  (Array.isArray(history) ? history.slice(-6) : []).forEach(m => {
    if (m && m.t) contents.push({ role: m.r === 'u' ? 'user' : 'model', parts: [{ text: String(m.t).slice(0, 2000) }] });
  });
  contents.push({ role: 'user', parts: [{ text: question.trim().slice(0, 2000) }] });

  const payload = JSON.stringify({
    system_instruction: { parts: [{ text: system }] },
    contents,
    generationConfig: { temperature: 0.4, maxOutputTokens: 900 },
  });

  // Monta a fila de modelos: env var opcional primeiro, depois a lista padrão.
  var queue = MODELS.slice();
  if (process.env.GEMINI_MODEL && queue.indexOf(process.env.GEMINI_MODEL) !== 0) {
    queue = [process.env.GEMINI_MODEL].concat(queue.filter(function (m) { return m !== process.env.GEMINI_MODEL; }));
  }

  var lastErr = null;
  for (var i = 0; i < queue.length; i++) {
    var model = queue[i];
    try {
      const r = await fetch('https://generativelanguage.googleapis.com/v1beta/models/' + model + ':generateContent?key=' + process.env.GEMINI_API_KEY, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payload,
      });
      if (r.status === 429) return res.status(200).json({ error: 'rate_limit' });
      const j = await r.json();
      if (!r.ok) {
        // Modelo aposentado pelo Google → tenta o próximo da fila.
        if (isModelGone(r.status, j)) { lastErr = { error: 'gemini_' + r.status, detail: (j && j.error && j.error.message) || model, model: model }; continue; }
        return res.status(200).json({ error: 'gemini_' + r.status, detail: j?.error?.message, model: model });
      }
      const answer = (j?.candidates?.[0]?.content?.parts || []).map(p => p.text || '').join('').trim();
      if (!answer) { lastErr = { error: 'resposta_vazia', model: model }; continue; }
      return res.status(200).json({ answer, model: model });
    } catch (e) {
      lastErr = { error: 'network', detail: e.message, model: model };
    }
  }
  return res.status(200).json(lastErr || { error: 'sem_modelo_disponivel' });
}
