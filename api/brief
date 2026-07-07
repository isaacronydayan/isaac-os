// Resumo do dia: mercado + manchetes (RSS G1) — sem API keys.
// Yahoo como fonte primária; se bloquear IPs da Vercel, cai para:
//   índices → Stooq · dólar → AwesomeAPI · bitcoin → CoinGecko
const QUOTES = [
  { s: '^BVSP',     label: 'Ibovespa', fmt: 'pts', stooq: '^bvp' },
  { s: 'IVVB11.SA', label: 'IVVB11',   fmt: 'brl' },
  { s: '^GSPC',     label: 'S&P 500',  fmt: 'pts', stooq: '^spx' },
  { s: '^IXIC',     label: 'Nasdaq',   fmt: 'pts', stooq: '^ndq' },
  { s: 'USDBRL=X',  label: 'Dólar',    fmt: 'brl', alt: 'awesome' },
  { s: 'BTC-USD',   label: 'Bitcoin',  fmt: 'usd', alt: 'coingecko' },
];
const UA = { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36' };

async function yahoo(sym) {
  const r = await fetch('https://query1.finance.yahoo.com/v8/finance/chart/' + encodeURIComponent(sym) + '?interval=1d&range=5d', { headers: UA });
  if (!r.ok) throw new Error('yahoo_' + r.status);
  const meta = (await r.json())?.chart?.result?.[0]?.meta;
  const price = meta?.regularMarketPrice, prev = meta?.chartPreviousClose || meta?.previousClose;
  if (price === undefined || !prev) throw new Error('yahoo_sem_dados');
  return { price, chg: (price - prev) / prev * 100 };
}
async function stooq(sym) {
  const d = new Date(), d2 = d.toISOString().slice(0, 10).replace(/-/g, '');
  const d1 = new Date(d.getTime() - 12 * 864e5).toISOString().slice(0, 10).replace(/-/g, '');
  const r = await fetch('https://stooq.com/q/d/l/?s=' + encodeURIComponent(sym) + '&d1=' + d1 + '&d2=' + d2 + '&i=d', { headers: UA });
  if (!r.ok) throw new Error('stooq_' + r.status);
  const rows = (await r.text()).trim().split('\n').slice(1).map(l => l.split(','));
  if (rows.length < 2) throw new Error('stooq_sem_dados');
  const close = parseFloat(rows[rows.length - 1][4]), prev = parseFloat(rows[rows.length - 2][4]);
  if (!close || !prev) throw new Error('stooq_parse');
  return { price: close, chg: (close - prev) / prev * 100 };
}
async function awesome() {
  const r = await fetch('https://economia.awesomeapi.com.br/json/last/USD-BRL', { headers: UA });
  if (!r.ok) throw new Error('awesome_' + r.status);
  const j = (await r.json()).USDBRL;
  return { price: parseFloat(j.bid), chg: parseFloat(j.pctChange) };
}
async function coingecko() {
  const r = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true', { headers: UA });
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
async function news(errs) {
  try {
    const r = await fetch('https://g1.globo.com/rss/g1/', { headers: UA });
    if (!r.ok) { errs.push('rss_' + r.status); return []; }
    const xml = await r.text();
    const items = [];
    const re = /<item>[\s\S]*?<title>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>[\s\S]*?<link>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/link>[\s\S]*?<\/item>/g;
    let m;
    while ((m = re.exec(xml)) && items.length < 5) {
      const t = m[1].replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").trim();
      if (t) items.push({ t, link: m[2].trim() });
    }
    return items;
  } catch (e) { errs.push('rss:' + e.message); return []; }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 's-maxage=900, stale-while-revalidate=1800');
  const errs = [];
  try {
    const [qs, ns] = await Promise.all([
      Promise.all(QUOTES.map(q => getQuote(q, errs))),
      news(errs),
    ]);
    const quotes = QUOTES.map((q, i) => qs[i] ? { label: q.label, fmt: q.fmt, price: qs[i].price, chg: Math.round(qs[i].chg * 100) / 100 } : null).filter(Boolean);
    const body = { _at: new Date().toISOString(), quotes, news: ns };
    if ((req.query || {}).debug) body._errors = errs;
    return res.status(200).json(body);
  } catch (e) {
    return res.status(200).json({ _at: new Date().toISOString(), quotes: [], news: [], _fatal: e.message, _errors: errs });
  }
}
