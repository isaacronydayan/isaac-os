export default function handler(req, res) {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(`<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Privacy Policy — Isaac OS</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#0a0a0a;color:#e0e0e0;line-height:1.7}
  .wrap{max-width:720px;margin:0 auto;padding:60px 24px}
  h1{font-size:28px;font-weight:700;margin-bottom:6px;color:#fff}
  .sub{color:#888;font-size:14px;margin-bottom:40px}
  h2{font-size:16px;font-weight:600;color:#fff;margin:32px 0 10px}
  p,li{font-size:14px;color:#aaa;margin-bottom:8px}
  ul{padding-left:20px}
  a{color:#6366f1;text-decoration:none}
  .badge{display:inline-block;background:rgba(99,102,241,.15);color:#818cf8;font-size:11px;font-weight:600;padding:3px 10px;border-radius:4px;margin-bottom:32px}
  hr{border:none;border-top:1px solid rgba(255,255,255,.07);margin:40px 0}
  footer{font-size:12px;color:#555;margin-top:40px}
</style>
</head>
<body>
<div class="wrap">
  <div class="badge">Uso Pessoal</div>
  <h1>Privacy Policy</h1>
  <p class="sub">Isaac OS — Personal Life Dashboard &nbsp;·&nbsp; Last updated: June 2026</p>

  <h2>1. Overview</h2>
  <p>Isaac OS is a personal dashboard application built exclusively for personal use by its owner (Isaac). This application is not a commercial product and is not intended for use by third parties.</p>

  <h2>2. Data We Access</h2>
  <p>When you connect WHOOP, this application requests access to the following data through WHOOP's official OAuth API:</p>
  <ul>
    <li>Recovery scores and readiness metrics</li>
    <li>Sleep performance and duration data</li>
    <li>Daily strain and cardiovascular load</li>
    <li>Heart rate variability (HRV) and resting heart rate</li>
    <li>Workout history and activity data</li>
    <li>Body measurements (weight, height)</li>
    <li>Basic profile information</li>
  </ul>

  <h2>3. How Data Is Used</h2>
  <p>All data accessed from WHOOP is used solely to display personal health and fitness metrics on your private dashboard. No data is sold, shared, transferred, or disclosed to any third party under any circumstances.</p>

  <h2>4. Data Storage</h2>
  <p>OAuth tokens are stored temporarily in browser <code>localStorage</code> on your personal device only. No health data is persisted in any external database or server-side storage. All API calls are made client-side, directly from your browser to WHOOP's servers.</p>

  <h2>5. Third-Party Services</h2>
  <p>This application integrates with:</p>
  <ul>
    <li><strong>WHOOP API</strong> — for health and fitness data (<a href="https://www.whoop.com/privacy/" target="_blank">WHOOP Privacy Policy</a>)</li>
    <li><strong>Google Calendar API</strong> — for calendar events (<a href="https://policies.google.com/privacy" target="_blank">Google Privacy Policy</a>)</li>
  </ul>

  <h2>6. Data Retention</h2>
  <p>No personal data is retained server-side. Tokens stored in <code>localStorage</code> can be cleared at any time by the user. Revoking access in the WHOOP app immediately invalidates all tokens.</p>

  <h2>7. Security</h2>
  <p>This application is deployed on Vercel's infrastructure. All communications use HTTPS. OAuth tokens are never logged or exposed in URLs.</p>

  <h2>8. Your Rights</h2>
  <p>As this is a personal application, you have full control over your data. You may revoke WHOOP access at any time via Settings → Connected Apps in the WHOOP mobile app.</p>

  <h2>9. Contact</h2>
  <p>This is a private personal project. For any concerns, contact the application owner directly at <a href="mailto:isaacronydayan@gmail.com">isaacronydayan@gmail.com</a>.</p>

  <hr>
  <footer>Isaac OS &copy; 2026 &nbsp;·&nbsp; Personal use only &nbsp;·&nbsp; Not a commercial product</footer>
</div>
</body>
</html>`);
}
