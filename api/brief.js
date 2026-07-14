// Resumo do dia: cotações — sem API keys, sem manchetes (removidas a pedido).
//
// ESTRATÉGIA EM CAMADAS (fontes gratuitas bloqueiam IPs de datacenter sem aviso):
//   1. Yahoo Finance (query1 → query2)
//   2. Fallback específico do ativo (Stooq / AwesomeAPI / CoinGecko)
//   3. Google Finance (página pública, raspagem do data-last-price) — cobre TODOS
//   4. Cache no Redis com o último valor bom (até 3 dias, marcado stale)
const QUOTES = [
  { s: '^BVSP',     label: 'Ibovespa', fmt: 'pts', stooq: '^bvp' },
  { s: 'IVVB11.SA', label: 'IVVB11',   fmt: 'brl' },
  { s: '^GSPC',     label: 'S&P 500',  fmt: 'pts', stooq: '^spx' },
  { s: '^IXIC',     label: 'Nasdaq',   fmt: 'pts', stooq: '^ndq' },
  { s: 'USDBRL=X',  label: 'Dólar',    fmt: 'brl', alt: 'awesome' },
  { s: 'BTC-USD',   label: 'Bitcoin',  fmt: 'usd', alt: 'coingecko' },
];
// Símbolos equivalentes no Google Finance
const GFIN = {
  '^BVSP': 'IBOV:INDEXBVMF',
  'IVVB11.SA': 'IVVB11:BVMF',
  '^GSPC': '.INX:INDEXSP',
  '^IXIC': '.IXIC:INDEXNASDAQ',
  'USDBRL=X': 'USD-BRL',
  'BTC-USD': 'BTC-USD',
};
const UA = { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36', 'Accept-Language': 'en-US,en;q=0.9' };

const KV_URL = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const KV_TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
const CACHE_KEY = 'isaacos:brief_quotes';

// fetch com timeout — feed/fonte lenta não pode travar a função inteira
function tfetch(url, opts, ms) {
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), ms || 6000);
  return fetch(url, Object.assign({}, opts || {}, { signal: ctl.signal })).finally(() => clearTimeout(t));
}

async function kvCmd(cmd) {
  if (!KV_URL || !KV_TOKEN) return null;
  try {
    const r = await tfetch(KV_URL, {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + KV_TOKEN, 'Content-Type': 'application/json' },
      body: JSON.stringify(cmd),
    }, 4000);
    if (!r.ok) return null;
    return (await r.json()).result;
  } catch { return null; }
}

async function yahoo(sym) {
  let last = null;
  for (const host of ['query1', 'query2']) {
    try {
      const r = await tfetch('https://' + host + '.finance.yahoo.com/v8/finance/chart/' + encodeURIComponent(sym) + '?interval=1d&range=5d', { headers: UA });
      if (!r.ok) { last = new Error('yahoo_' + r.status); continue; }
      const meta = (await r.json())?.chart?.result?.[0]?.meta;
      const price = meta?.regularMarketPrice, prev = meta?.chartPreviousClose || meta?.previousClose;
      if (price === undefined || !prev) { last = new Error('yahoo_sem_dados'); continue; }
      return { price, chg: (price - prev) / prev * 100 };
    } catch (e) { last = e; }
  }
  throw last || new Error('yahoo_falhou');
}
async function stooq(sym) {
  const d = new Date(), d2 = d.toISOString().slice(0, 10).replace(/-/g, '');
  const d1 = new Date(d.getTime() - 12 * 864e5).toISOString().slice(0, 10).replace(/-/g, '');
  const r = await tfetch('https://stooq.com/q/d/l/?s=' + encodeURIComponent(sym) + '&d1=' + d1 + '&d2=' + d2 + '&i=d', { headers: UA });
  if (!r.ok) throw new Error('stooq_' + r.status);
  const rows = (await r.text()).trim().split('\n').slice(1).map(l => l.split(','));
  if (rows.length < 2) throw new Error('stooq_sem_dados');
  const close = parseFloat(rows[rows.length - 1][4]), prev = parseFloat(rows[rows.length - 2][4]);
  if (!close || !prev) throw new Error('stooq_parse');
  return { price: close, chg: (close - prev) / prev * 100 };
}
async function awesome() {
  const r = await tfetch('https://economia.awesomeapi.com.br/json/last/USD-BRL', { headers: UA });
  if (!r.ok) throw new Error('awesome_' + r.status);
  const j = (await r.json()).USDBRL;
  return { price: parseFloat(j.bid), chg: parseFloat(j.pctChange) };
}
async function coingecko() {
  const r = await tfetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true', { headers: UA });
  if (!r.ok) throw new Error('gecko_' + r.status);
  const j = (await r.json()).bitcoin;
  return { price: j.usd, chg: j.usd_24h_change };
}
async function gfin(sym) {
  const gs = GFIN[sym];
  if (!gs) throw new Error('gfin_sem_simbolo');
  const r = await tfetch('https://www.google.com/finance/quote/' + gs + '?hl=en', { headers: UA }, 7000);
  if (!r.ok) throw new Error('gfin_' + r.status);
  const h = await r.text();
  const mp = h.match(/data-last-price="([\d.]+)"/);
  if (!mp) throw new Error('gfin_sem_preco');
  const price = parseFloat(mp[1]);
  // "Previous close" na tabela de stats → variação do dia
  const pc = h.match(/Previous close[\s\S]{0,400}?class="P6K39c">([^<]+)</);
  let chg = 0;
  if (pc) {
    const prev = parseFloat(pc[1].replace(/[^\d.]/g, ''));
    if (prev) chg = (price - prev) / prev * 100;
  }
  return { price, chg };
}
async function getQuote(q, errs) {
  try { return await yahoo(q.s); }
  catch (e) {
    errs.push(q.label + ':' + e.message);
    try {
      if (q.alt === 'awesome') return await awesome();
      if (q.alt === 'coingecko') return await coingecko();
      if (q.stooq) return await stooq(q.stooq);
      throw new Error('sem_fallback_direto');
    } catch (e2) {
      errs.push(q.label + ':fb:' + e2.message);
      try { return await gfin(q.s); }
      catch (e3) { errs.push(q.label + ':gfin:' + e3.message); return null; }
    }
  }
}


export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 's-maxage=900, stale-while-revalidate=1800');
  const errs = [];
  try {
    const [qs, cacheRaw] = await Promise.all([
      Promise.all(QUOTES.map(q => getQuote(q, errs))),
      kvCmd(['GET', CACHE_KEY]),
    ]);

    // Cache: último valor bom de cada ativo (Redis) — vale por até 3 dias
    let cache = {};
    if (cacheRaw) { try { cache = JSON.parse(cacheRaw) || {}; } catch {} }
    const now = Date.now();
    let dirty = false;
    const quotes = [];
    QUOTES.forEach((q, i) => {
      if (qs[i]) {
        const item = { label: q.label, fmt: q.fmt, price: qs[i].price, chg: Math.round(qs[i].chg * 100) / 100 };
        quotes.push(item);
        cache[q.label] = { price: item.price, chg: item.chg, at: now };
        dirty = true;
      } else if (cache[q.label] && now - (cache[q.label].at || 0) < 3 * 864e5) {
        quotes.push({ label: q.label, fmt: q.fmt, price: cache[q.label].price, chg: cache[q.label].chg, stale: true });
        errs.push(q.label + ':usando_cache');
      }
    });
    if (dirty) await kvCmd(['SET', CACHE_KEY, JSON.stringify(cache), 'EX', String(7 * 86400)]);

    const body = { _at: new Date().toISOString(), quotes, news: [] }; // news mantido vazio por compat
    if ((req.query || {}).debug) body._errors = errs;
    return res.status(200).json(body);
  } catch (e) {
    return res.status(200).json({ _at: new Date().toISOString(), quotes: [], news: [], _fatal: e.message, _errors: errs });
  }
}
