export default async function handler(req, res) {
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
