const mayoralResults = require('../server/data/mayoralResults.json');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { type = 'presidential' } = req.query;

    if (type === 'mayoral') {
      return res.status(200).json(mayoralResults);
    }

    // Mock presidential/gubernatorial data
    const mockPresidential = {
      totals: {
        democrat: { ev: 226, votes: 68500000, candidate: 'Kamala Harris' },
        republican: { ev: 312, votes: 72100000, candidate: 'Donald Trump' }
      },
      states: {},
      lastUpdated: new Date().toISOString()
    };

    res.status(200).json(mockPresidential);
  } catch (error) {
    console.error('Election results error:', error);
    res.status(500).json({ error: 'Failed to fetch election results' });
  }
};
