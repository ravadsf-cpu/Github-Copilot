const { genAI } = require('./_lib/shared');

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
    const { message, context } = req.body;

    if (!genAI) {
      return res.status(200).json({ 
        response: "AI chat is currently unavailable. Please set GEMINI_API_KEY in environment variables." 
      });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    
    const prompt = context 
      ? `You are a helpful news assistant. Context: ${context}\n\nUser: ${message}\n\nAssistant:`
      : `You are a helpful news assistant. User: ${message}\n\nAssistant:`;

    const result = await model.generateContent(prompt);
    const response = result.response.text();

    res.status(200).json({ response });
  } catch (error) {
    console.error('Chat API error:', error);
    res.status(500).json({ 
      response: "I'm having trouble responding right now. Please try again later." 
    });
  }
};
