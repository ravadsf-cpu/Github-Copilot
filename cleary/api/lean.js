const { inferLean } = require('./_lib/shared');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { source } = req.body;
    const lean = inferLean(source || '');
    res.status(200).json({ lean });
  } catch (error) {
    console.error('Lean API error:', error);
    res.status(500).json({ lean: 'center' });
  }
};
