// Resumo do dia: mercado + manchetes personalizadas — sem API keys.
//
// COTAÇÕES: Yahoo (query1 → query2) como fonte primária; fallbacks por ativo
// (Stooq / AwesomeAPI / CoinGecko); e por último o CACHE no Redis com o último
// valor bom (até 3 dias) — assim IVVB11/Ibovespa/Dólar sempre aparecem, mesmo
// quando as fontes bloqueiam os IPs da Vercel.
//
// MANCHETES: feeds por interesse do Isaac — ⚽/🎾 esporte (ge), 🇮🇱 Israel
// (Times of Israel), 📈 mercado (InfoMoney), 💻 tech (Tecnoblog).
const QUOTES = [
  { s: '^BVSP',     label: 'Ibovespa', fmt: 'pts', stooq: '^bvp' },
  { s: 'IVVB11.SA', label: 'IVVB11',   fmt: 'brl' },
  { s: '^GSPC',     label: 'S&P 500',  fmt: 'pts', stooq: '^spx' },
  { s: '^IXIC',     label: 'Nasdaq',   fmt: 'pts', stooq: '^ndq' },
  { s: 'USDBRL=X',  label: 'Dólar',    fmt: 'brl', alt: 'awesome' },
  { s: 'BTC-USD',   label: 'Bitcoin',  fmt: 'usd', alt: 'coingecko' },
];
const FEEDS = [
  { url: 'https://ge.globo.com/rss/ge/',            tag: '⚽', n: 2, tenis: true },
  { url: 'https://www.timesofisrael.com/feed/',     tag: '🇮🇱', n: 2 },
  { url: 'https://www.infomoney.com.br/feed/',      tag: '📈', n: 2 },
  { url: 'https://tecnoblog.net/feed/',             tag: '💻', n: 2 },
];
const TENIS_RE = /t[êe]nis|\bATP\b|\bWTA\b|Roland Garros|Wimbledon|US Open|Australian Open|Djokovic|Alcaraz|Sinner|Bia Haddad|João Fonseca/i;
const UA = { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36' };

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
async function getQuote(q, errs) {
  try { return await yahoo(q.s); }
  catch (e) {
    errs.push(q.label + ':' + e.message);
    try {
      if (q.alt === 'awesome') return await awesome();
      if (q.alt === 'coingecko') return await coingecko();
      if (q.stooq) return await stooq(q.stooq);
    } catch (e2) { errs.push(q.label + ':fallback:' + e2.message); }
    return null;
  }
}

function decodeEnt(s) {
  return s
    .replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#0?39;/g, "'").replace(/&apos;/g, "'")
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&#(\d+);/g, (m, c) => { try { return String.fromCodePoint(parseInt(c, 10)); } catch { return ''; } })
    .replace(/&#x([0-9a-fA-F]+);/g, (m, c) => { try { return String.fromCodePoint(parseInt(c, 16)); } catch { return ''; } })
    .trim();
}
function parseRss(xml, max) {
  const items = [];
  const re = /<item>[\s\S]*?<title>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>[\s\S]*?<link>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/link>[\s\S]*?<\/item>/g;
  let m;
  while ((m = re.exec(xml)) && items.length < (max || 15)) {
    const t = decodeEnt(m[1]);
    const link = m[2].trim();
    if (t && link) items.push({ t, link });
  }
  return items;
}
async function feedNews(feed, errs) {
  try {
    const r = await tfetch(feed.url, { headers: UA });
    if (!r.ok) { errs.push('rss_' + feed.tag + '_' + r.status); return []; }
    const items = parseRss(await r.text(), 15);
    if (!items.length) return [];
    let picks;
    if (feed.tenis) {
      // Esporte: 1 manchete geral (futebol domina o feed) + 1 de tênis, se houver
      const tenis = items.find(i => TENIS_RE.test(i.t));
      const resto = items.filter(i => i !== tenis);
      picks = [resto[0], tenis || resto[1]].filter(Boolean);
      return picks.map(i => ({ t: (TENIS_RE.test(i.t) ? '🎾' : feed.tag) + ' ' + i.t, link: i.link }));
    }
    picks = items.slice(0, feed.n);
    return picks.map(i => ({ t: feed.tag + ' ' + i.t, link: i.link }));
  } catch (e) { errs.push('rss_' + feed.tag + ':' + e.message); return []; }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 's-maxage=900, stale-while-revalidate=1800');
  const errs = [];
  try {
    const [qs, newsGroups, cacheRaw] = await Promise.all([
      Promise.all(QUOTES.map(q => getQuote(q, errs))),
      Promise.all(FEEDS.map(f => feedNews(f, errs))),
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

    const news = [].concat(...newsGroups);
    const body = { _at: new Date().toISOString(), quotes, news };
    if ((req.query || {}).debug) body._errors = errs;
    return res.status(200).json(body);
  } catch (e) {
    return res.status(200).json({ _at: new Date().toISOString(), quotes: [], news: [], _fatal: e.message, _errors: errs });
  }
}
