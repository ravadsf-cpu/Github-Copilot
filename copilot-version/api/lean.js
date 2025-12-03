const { inferLean } = require('./_lib/shared');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const source = req.method === 'POST' ? req.body?.source : req.query?.source;
    const lean = inferLean(source || '');
    res.status(200).json({ lean });
  } catch (error) {
    console.error('Lean API error:', error);
    res.status(500).json({ lean: 'center' });
  }
};
