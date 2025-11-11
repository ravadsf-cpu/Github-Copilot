module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const activeElections = [
      { type: 'mayoral', name: 'San Francisco Mayoral Election', date: '2025-11-10' }
    ];

    res.status(200).json({ activeElections });
  } catch (error) {
    console.error('Active elections error:', error);
    res.status(500).json({ activeElections: [] });
  }
};
