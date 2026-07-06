export default function handler(req, res) {
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
