const { genAI, fetchFromRSS } = require('./_lib/shared');
let OpenAIClient = null;
try {
  // Lazy require to avoid bundling if not used
  OpenAIClient = require('openai');
} catch {}

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
    // Prefer OpenAI if available
    if (process.env.OPENAI_API_KEY && OpenAIClient) {
      try {
        const openai = new OpenAIClient({ apiKey: process.env.OPENAI_API_KEY });
        const system = "You are a concise, trustworthy news assistant. Be direct. Use bullet points when listing headlines.";
        const user = context ? `${context}\n\nUser: ${message}` : message;
        const completion = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: system },
            { role: 'user', content: user }
          ],
          temperature: 0.3,
          max_tokens: 300
        });
        const response = completion.choices?.[0]?.message?.content?.trim() || "";
        if (response) return res.status(200).json({ response });
      } catch (e) {
        console.error('OpenAI chat error:', e.message);
        // fall through to Gemini or heuristic fallback
      }
    }

    // Next try Gemini if configured
    if (process.env.GEMINI_API_KEY && genAI) {
      try {
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const prompt = context 
          ? `You are a helpful news assistant. Context: ${context}\n\nUser: ${message}\n\nAssistant:`
          : `You are a helpful news assistant. User: ${message}\n\nAssistant:`;
        const result = await model.generateContent(prompt);
        const response = result.response.text();
        if (response) return res.status(200).json({ response });
      } catch (e) {
        console.error('Gemini chat error:', e.message);
      }
    }

    // Heuristic fallback: return live headlines based on intent
    const msg = (message || '').toLowerCase();
    // Expand intents: india/pakistan/world/business/tech/health/politics
    let category = 'breaking';
    if (/(india|pakistan|south asia|asia)/i.test(msg)) category = 'world';
    else if (/business|econom(y|ic)|market|stocks|finance/.test(msg)) category = 'business';
    else if (/politic|election|policy|government/.test(msg)) category = 'politics';
    else if (/health|covid|vaccine|disease/.test(msg)) category = 'health';
    else if (/tech|technology|ai|software|hardware/.test(msg)) category = 'science';

    const articles = await fetchFromRSS(category);
    const top = articles.slice(0, 5);
    if (top.length) {
      const bullets = top.map((a, i) => `${i+1}. ${a.title} — ${a.source?.name || ''}\n${a.url}`).join('\n\n');
      const header = category === 'breaking'
        ? 'Top breaking stories:'
        : category === 'world' && /(india|pakistan)/.test(msg)
          ? 'Top South Asia stories:'
          : `Top ${category} stories:`;
      return res.status(200).json({ response: `${header}\n\n${bullets}` });
    }

    // Last resort generic
    return res.status(200).json({ 
      response: "I'm here to help! Try asking for 'breaking news' or a category like technology, politics, or health."
    });
  } catch (error) {
    console.error('Chat API error:', error.message, error.stack);
    res.status(200).json({ 
      response: "Hello! I'm your news assistant. How can I help you today?"
    });
  }
};
