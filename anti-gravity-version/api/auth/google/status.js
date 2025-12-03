module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'method_not_allowed' });

  const haveId = !!process.env.GOOGLE_OAUTH_CLIENT_ID;
  const haveSecret = !!process.env.GOOGLE_OAUTH_CLIENT_SECRET;
  const redirect = process.env.GOOGLE_OAUTH_REDIRECT || null;
  const configured = haveId && haveSecret;

  return res.status(200).json({
    configured,
    missing: configured ? [] : [!haveId && 'GOOGLE_OAUTH_CLIENT_ID', !haveSecret && 'GOOGLE_OAUTH_CLIENT_SECRET'].filter(Boolean),
    redirect,
    hint: configured ? 'Google OAuth is ready.' : 'Add missing env vars in Vercel project settings.'
  });
};