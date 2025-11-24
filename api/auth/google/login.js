const { google } = require('googleapis');
const jwt = require('jsonwebtoken');

// Issue a simple JWT (7 days) for session cookie
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
  // Prefer explicit env override
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
    return res.status(503).json({
      error: 'oauth_not_configured',
      message: 'Google Sign-In is not yet configured. To enable it:\n1. Go to Google Cloud Console → APIs & Services → Credentials\n2. Create OAuth 2.0 Client ID (Web)\n3. Add redirect URI: https://<your-vercel-domain>/api/auth/google/callback\n4. Set GOOGLE_OAUTH_CLIENT_ID & GOOGLE_OAUTH_CLIENT_SECRET in Vercel env settings\n5. Redeploy project.\n\n(You can still browse in guest mode.)',
      docs: 'GOOGLE_OAUTH_SETUP.md'
    });
  }

  const state = 'login-' + Date.now();
  const url = client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: ['openid','profile','email'],
    state
  });
  return res.status(200).json({ url, state });
};