export default function handler(req, res) {
  const CLIENT_ID    = process.env.WHOOP_CLIENT_ID;
  const REDIRECT_URI = process.env.WHOOP_REDIRECT_URI;

  const SCOPES = [
    'read:recovery',
    'read:cycles',
    'read:sleep',
    'read:workout',
    'read:profile',
    'read:body_measurement',
    'offline',
  ].join(' ');

  const params = new URLSearchParams({
    response_type: 'code',
    client_id:     CLIENT_ID,
    redirect_uri:  REDIRECT_URI,
    scope:         SCOPES,
    state:         'isaac_os_' + Math.random().toString(36).slice(2),
  });

  const authUrl = `https://api.prod.whoop.com/oauth/oauth2/auth?${params}`;
  res.redirect(302, authUrl);
}
