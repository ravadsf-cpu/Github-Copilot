const { google } = require('googleapis');
const jwt = require('jsonwebtoken');

function issueJwt(profile) {
  const secret = process.env.APP_SESSION_SECRET || 'demo-insecure-secret';
  return jwt.sign({
    sub: profile.id || profile.email,
    email: profile.email,
    name: profile.name,
    picture: profile.picture || null
  }, secret, { expiresIn: '7d' });
}

function buildRedirectBase(req) {
  if (process.env.GOOGLE_OAUTH_REDIRECT) return process.env.GOOGLE_OAUTH_REDIRECT;
  const proto = (req.headers['x-forwarded-proto'] || 'https');
  const host = req.headers.host;
  return `${proto}://${host}/api/auth/google/callback`;
}

function createOAuthClient(req) {
  const { GOOGLE_OAUTH_CLIENT_ID, GOOGLE_OAUTH_CLIENT_SECRET } = process.env;
  const redirect = buildRedirectBase(req);
  if (!GOOGLE_OAUTH_CLIENT_ID || !GOOGLE_OAUTH_CLIENT_SECRET) return null;
  return new google.auth.OAuth2(GOOGLE_OAUTH_CLIENT_ID, GOOGLE_OAUTH_CLIENT_SECRET, redirect);
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'method_not_allowed' });

  const client = createOAuthClient(req);
  if (!client) {
    return res.status(503).json({ error: 'oauth_not_configured', message: 'Missing Google OAuth env vars.' });
  }

  const code = req.query.code;
  const state = req.query.state || '';
  if (!code) return res.status(400).send('Missing code');
  try {
    const { tokens } = await client.getToken(code);
    client.setCredentials(tokens);
    const oauth2 = google.oauth2({ version: 'v2', auth: client });
    const { data: profile } = await oauth2.userinfo.get();
    if (!profile || !profile.email) throw new Error('No profile email');

    const jwtToken = issueJwt({
      id: profile.id,
      email: profile.email,
      name: profile.name,
      picture: profile.picture
    });
    const cookie = `cleary_session=${jwtToken}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=604800`;
    res.setHeader('Set-Cookie', cookie);

    // PostMessage helper page (popup) -> communicates back to opener
    res.setHeader('Content-Type', 'text/html');
    return res.end(`<!DOCTYPE html><html><body><script>
      (function(){
        try {
          const data = { id: ${JSON.stringify(profile.id)}, email: ${JSON.stringify(profile.email)}, name: ${JSON.stringify(profile.name)}, picture: ${JSON.stringify(profile.picture || '')} };
          window.opener && window.opener.postMessage({ type: 'cleary-google-login', data: { profile: data, state: ${JSON.stringify(state)} } }, '*');
        } catch(e) {
          window.opener && window.opener.postMessage({ type: 'cleary-google-login-error', error: e.message }, '*');
        }
        setTimeout(() => window.close(), 150);
      })();
    </script></body></html>`);
  } catch (e) {
    console.error('[oauth/callback] error', e.message);
    return res.status(500).send('OAuth callback failed');
  }
};