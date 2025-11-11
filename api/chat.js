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

    // Debug logging
    console.log('Chat request received:', { message, hasApiKey: !!process.env.GEMINI_API_KEY });

    if (!process.env.GEMINI_API_KEY) {
      return res.status(200).json({ 
        response: "AI chat is currently unavailable. API key not configured." 
      });
    }

    if (!genAI) {
      return res.status(200).json({ 
        response: "AI chat initialization failed. Please contact support." 
      });
    }

    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      
      const prompt = context 
        ? `You are a helpful news assistant. Context: ${context}\n\nUser: ${message}\n\nAssistant:`
        : `You are a helpful news assistant. User: ${message}\n\nAssistant:`;

      console.log('Calling Gemini API...');
      const result = await model.generateContent(prompt);
      const response = result.response.text();
      console.log('Gemini response received');

      return res.status(200).json({ response });
    } catch (aiError) {
      // Fallback to basic responses if AI fails
      console.error('AI error:', aiError.message);
      
      const msg = message.toLowerCase();
      let fallbackResponse = '';
      
      if (msg.includes('hello') || msg.includes('hi')) {
        fallbackResponse = "Hello! I'm your news assistant. I can help you understand the latest news. What would you like to know?";
      } else if (msg.includes('news') || msg.includes('article')) {
        fallbackResponse = "I can see the latest news articles on your feed. Try browsing through them by category or use the personalization features to get content tailored to your interests.";
      } else if (msg.includes('help')) {
        fallbackResponse = "I can help you navigate the news feed, explain articles, and find specific topics. You can also use the personalization settings to customize your news experience.";
      } else {
        fallbackResponse = "I'm here to help! Try asking me about the news articles, specific topics, or how to use the personalization features. (Note: Full AI chat requires API key update)";
      }
      
      return res.status(200).json({ response: fallbackResponse });
    }
  } catch (error) {
    console.error('Chat API error:', error.message, error.stack);
    res.status(200).json({ 
      response: "Hello! I'm your news assistant. How can I help you today?"
    });
  }
};
