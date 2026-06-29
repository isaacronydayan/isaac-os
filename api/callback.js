export default async function handler(req, res) {
  const { code, error, error_description } = req.query;

  if (error) {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.send(errorPage(error, error_description));
  }

  if (!code) {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.send(errorPage('missing_code', 'No authorization code received.'));
  }

  const CLIENT_ID     = process.env.WHOOP_CLIENT_ID;
  const CLIENT_SECRET = process.env.WHOOP_CLIENT_SECRET;
  const REDIRECT_URI  = process.env.WHOOP_REDIRECT_URI;

  try {
    const tokenRes = await fetch('https://api.prod.whoop.com/oauth/oauth2/token', {
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
      return res.send(errorPage('token_error', tokenData.error_description || 'Failed to exchange code for token.'));
    }

    // Pass tokens to the frontend via postMessage / URL fragment
    const { access_token, refresh_token, expires_in, scope } = tokenData;

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.send(successPage({ access_token, refresh_token, expires_in, scope }));

  } catch (err) {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.send(errorPage('fetch_error', err.message));
  }
}

function successPage({ access_token, refresh_token, expires_in, scope }) {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<title>Conectando WHOOP…</title>
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
  <h2>WHOOP conectado!</h2>
  <p>Salvando credenciais e redirecionando para o dashboard…</p>
  <div class="spin"></div>
</div>
<script>
  // Save tokens to localStorage and redirect to dashboard
  const tokens = {
    access_token:  ${JSON.stringify(access_token)},
    refresh_token: ${JSON.stringify(refresh_token)},
    expires_in:    ${JSON.stringify(expires_in)},
    scope:         ${JSON.stringify(scope)},
    saved_at:      Date.now()
  };
  try {
    localStorage.setItem('whoop_tokens', JSON.stringify(tokens));
  } catch(e) {}
  // If opened in popup, send to opener and close
  if (window.opener) {
    window.opener.postMessage({ type: 'WHOOP_AUTH_SUCCESS', tokens }, '*');
    setTimeout(() => window.close(), 800);
  } else {
    // Redirect to main page
    setTimeout(() => { window.location.href = '/'; }, 800);
  }
</script>
</body>
</html>`;
}

function errorPage(code, description) {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<title>Erro — WHOOP Auth</title>
<style>
  body{font-family:-apple-system,sans-serif;background:#0a0a0a;color:#e0e0e0;display:flex;align-items:center;justify-content:center;height:100vh;margin:0}
  .box{text-align:center;max-width:400px}
  .icon{font-size:48px;margin-bottom:16px}
  h2{font-size:20px;font-weight:700;color:#ef4444;margin-bottom:8px}
  p{font-size:13px;color:#888;margin-bottom:4px}
  code{font-size:11px;color:#555;background:#111;padding:2px 6px;border-radius:4px}
  a{color:#6366f1;font-size:13px;text-decoration:none;display:inline-block;margin-top:16px}
</style>
</head>
<body>
<div class="box">
  <div class="icon">❌</div>
  <h2>Erro na autenticação</h2>
  <p><code>${code}</code></p>
  <p>${description || ''}</p>
  <a href="/">← Voltar ao dashboard</a>
</div>
</body>
</html>`;
}
