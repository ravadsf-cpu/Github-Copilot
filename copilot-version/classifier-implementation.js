/**
 * 4. ARTICLE CLASSIFIER IMPLEMENTATION
 * 
 * Political Lean Detection System
 * Hybrid approach: AI-powered + keyword fallback
 */

// ============================================================
// JavaScript/Node.js Version (Current Implementation)
// ============================================================

const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini AI
const genAI = process.env.GEMINI_API_KEY 
  ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  : null;

/**
 * AI-Powered Classification (Primary Method)
 * Uses Google Gemini for nuanced political lean detection
 */
async function detectPoliticalLeanAI(title, description, content = '') {
  if (!genAI) {
    console.warn('[classifier] Gemini AI not configured, using fallback');
    return scoreLean(`${title} ${description} ${content}`);
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    
    const prompt = `Analyze the political leaning of this news article.

Title: ${title}
Description: ${description}
Content: ${content.slice(0, 1000)}

Instructions:
1. Classify as: LEFT, LEAN_LEFT, CENTER, LEAN_RIGHT, or RIGHT
2. Provide confidence score (0.0 to 1.0)
3. List 2-3 specific reasons for your classification
4. Consider:
   - Language tone and framing
   - Sources cited
   - Topics emphasized or omitted
   - Sentiment toward political figures/parties
   - Editorial stance indicators

Respond in JSON format:
{
  "label": "CENTER",
  "confidence": 0.85,
  "reasons": ["Neutral language", "Balanced sourcing", "Factual reporting"]
}`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    
    // Parse JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Invalid JSON response from AI');
    }
    
    const parsed = JSON.parse(jsonMatch[0]);
    
    // Normalize label
    const label = parsed.label.toUpperCase().replace(/_/g, '-');
    
    // Map to score (-1 to 1)
    const scoreMap = {
      'LEFT': -1.0,
      'LEAN-LEFT': -0.5,
      'CENTER': 0.0,
      'LEAN-RIGHT': 0.5,
      'RIGHT': 1.0
    };
    
    return {
      label,
      score: scoreMap[label] || 0.0,
      confidence: parsed.confidence || 0.7,
      reasons: parsed.reasons || ['AI classification']
    };
    
  } catch (error) {
    console.warn('[classifier] AI classification failed:', error.message);
    // Fallback to keyword-based
    return scoreLean(`${title} ${description} ${content}`);
  }
}

/**
 * Keyword-Based Classification (Fallback Method)
 * Fast heuristic approach using indicator words
 */
function scoreLean(text, sourceName = '', url = '') {
  const lower = text.toLowerCase();
  
  // Source bias metadata (known publication leanings)
  const sourceMap = {
    'cnn': -0.3,
    'msnbc': -0.6,
    'huffpost': -0.7,
    'vox': -0.5,
    'nyt': -0.2,
    'washington post': -0.2,
    'fox news': 0.7,
    'breitbart': 0.9,
    'daily wire': 0.8,
    'national review': 0.6,
    'wall street journal': 0.3,
    'bbc': 0.0,
    'reuters': 0.0,
    'associated press': 0.0,
    'bloomberg': 0.1
  };
  
  let score = 0.0;
  const reasons = [];
  
  // Check source bias
  const sourceKey = Object.keys(sourceMap).find(s => 
    sourceName.toLowerCase().includes(s) || url.toLowerCase().includes(s)
  );
  if (sourceKey) {
    score += sourceMap[sourceKey];
    reasons.push(`Source: ${sourceKey}`);
  }
  
  // Left-leaning keywords
  const leftKeywords = [
    'progressive', 'climate crisis', 'systemic racism', 'wealth inequality',
    'universal healthcare', 'living wage', 'gun control', 'reproductive rights',
    'social justice', 'lgbtq rights', 'immigration reform', 'green new deal',
    'unions', 'medicare for all', 'student debt relief', 'defund police'
  ];
  
  // Right-leaning keywords
  const rightKeywords = [
    'conservative', 'traditional values', 'free market', 'small government',
    'second amendment', 'pro-life', 'border security', 'law and order',
    'religious freedom', 'school choice', 'tax cuts', 'deregulation',
    'national security', 'patriot', 'individual liberty', 'fiscal responsibility'
  ];
  
  // Center/neutral keywords
  const centerKeywords = [
    'bipartisan', 'compromise', 'moderate', 'centrist', 'pragmatic',
    'balanced approach', 'both sides', 'nonpartisan'
  ];
  
  // Count keyword occurrences
  const leftCount = leftKeywords.filter(k => lower.includes(k)).length;
  const rightCount = rightKeywords.filter(k => lower.includes(k)).length;
  const centerCount = centerKeywords.filter(k => lower.includes(k)).length;
  
  // Adjust score based on keyword balance
  score += (leftCount * -0.1) + (rightCount * 0.1);
  
  if (leftCount > rightCount + 2) {
    reasons.push(`Left keywords: ${leftCount}`);
  } else if (rightCount > leftCount + 2) {
    reasons.push(`Right keywords: ${rightCount}`);
  }
  
  if (centerCount > 0) {
    score *= 0.7; // Dampen score if center keywords present
    reasons.push(`Centrist language: ${centerCount}`);
  }
  
  // Sentiment analysis (simplified)
  const demPhrases = ['biden', 'democrats', 'democratic party'];
  const repPhrases = ['trump', 'republicans', 'gop', 'republican party'];
  
  const positiveSentiment = ['praised', 'supports', 'champions', 'advocates', 'successful'];
  const negativeSentiment = ['criticized', 'slammed', 'attacked', 'failed', 'controversial'];
  
  // Check sentiment toward political parties
  demPhrases.forEach(phrase => {
    if (lower.includes(phrase)) {
      if (positiveSentiment.some(s => lower.includes(s + ' ' + phrase) || lower.includes(phrase + ' ' + s))) {
        score -= 0.15;
        reasons.push('Positive Dem sentiment');
      }
      if (negativeSentiment.some(s => lower.includes(s + ' ' + phrase) || lower.includes(phrase + ' ' + s))) {
        score += 0.15;
        reasons.push('Negative Dem sentiment');
      }
    }
  });
  
  repPhrases.forEach(phrase => {
    if (lower.includes(phrase)) {
      if (positiveSentiment.some(s => lower.includes(s + ' ' + phrase) || lower.includes(phrase + ' ' + s))) {
        score += 0.15;
        reasons.push('Positive GOP sentiment');
      }
      if (negativeSentiment.some(s => lower.includes(s + ' ' + phrase) || lower.includes(phrase + ' ' + s))) {
        score -= 0.15;
        reasons.push('Negative GOP sentiment');
      }
    }
  });
  
  // Clamp score to [-1, 1]
  score = Math.max(-1, Math.min(1, score));
  
  // Map to label
  let label;
  if (score < -0.4) label = 'left';
  else if (score < -0.15) label = 'lean-left';
  else if (score > 0.4) label = 'right';
  else if (score > 0.15) label = 'lean-right';
  else label = 'center';
  
  // Confidence based on keyword count and source match
  const totalIndicators = leftCount + rightCount + centerCount + (sourceKey ? 1 : 0);
  const confidence = Math.min(0.9, 0.3 + totalIndicators * 0.1);
  
  return {
    label,
    score,
    confidence,
    reasons: reasons.length ? reasons : ['Keyword analysis']
  };
}

/**
 * Batch Classification (for efficiency)
 */
async function classifyArticlesBatch(articles) {
  const results = await Promise.all(
    articles.map(async (article) => {
      try {
        const result = await detectPoliticalLeanAI(
          article.title,
          article.description,
          article.content
        );
        return {
          articleId: article.id || article.url,
          ...result
        };
      } catch (error) {
        console.error('[classifier] Failed for article:', article.title, error);
        return {
          articleId: article.id || article.url,
          label: 'center',
          score: 0.0,
          confidence: 0.3,
          reasons: ['Classification failed']
        };
      }
    })
  );
  
  return results;
}

// ============================================================
// Python Version (Alternative Implementation)
// ============================================================

const pythonClassifierCode = `
"""
Article Classifier - Python Implementation
Uses spaCy for NLP and scikit-learn for ML
"""

import re
from typing import Dict, List, Tuple
from dataclasses import dataclass

@dataclass
class Classification:
    label: str  # LEFT, LEAN_LEFT, CENTER, LEAN_RIGHT, RIGHT
    score: float  # -1.0 to 1.0
    confidence: float  # 0.0 to 1.0
    reasons: List[str]

class ArticleClassifier:
    def __init__(self):
        # Source bias metadata
        self.source_map = {
            'cnn': -0.3,
            'msnbc': -0.6,
            'huffpost': -0.7,
            'vox': -0.5,
            'nyt': -0.2,
            'washington post': -0.2,
            'fox news': 0.7,
            'breitbart': 0.9,
            'daily wire': 0.8,
            'national review': 0.6,
            'wall street journal': 0.3,
            'bbc': 0.0,
            'reuters': 0.0,
            'associated press': 0.0,
            'bloomberg': 0.1
        }
        
        # Left-leaning keywords
        self.left_keywords = [
            'progressive', 'climate crisis', 'systemic racism', 
            'wealth inequality', 'universal healthcare', 'living wage',
            'gun control', 'reproductive rights', 'social justice',
            'lgbtq rights', 'immigration reform', 'green new deal',
            'unions', 'medicare for all', 'student debt relief'
        ]
        
        # Right-leaning keywords
        self.right_keywords = [
            'conservative', 'traditional values', 'free market',
            'small government', 'second amendment', 'pro-life',
            'border security', 'law and order', 'religious freedom',
            'school choice', 'tax cuts', 'deregulation',
            'national security', 'patriot', 'individual liberty'
        ]
        
        # Center keywords
        self.center_keywords = [
            'bipartisan', 'compromise', 'moderate', 'centrist',
            'pragmatic', 'balanced approach', 'both sides'
        ]
    
    def classify(self, title: str, description: str, 
                 content: str = '', source: str = '', 
                 url: str = '') -> Classification:
        """
        Classify article political leaning
        """
        text = f"{title} {description} {content}".lower()
        score = 0.0
        reasons = []
        
        # Check source bias
        for source_key, bias in self.source_map.items():
            if source_key in source.lower() or source_key in url.lower():
                score += bias
                reasons.append(f"Source: {source_key}")
                break
        
        # Count keywords
        left_count = sum(1 for kw in self.left_keywords if kw in text)
        right_count = sum(1 for kw in self.right_keywords if kw in text)
        center_count = sum(1 for kw in self.center_keywords if kw in text)
        
        # Adjust score
        score += (left_count * -0.1) + (right_count * 0.1)
        
        if left_count > right_count + 2:
            reasons.append(f"Left keywords: {left_count}")
        elif right_count > left_count + 2:
            reasons.append(f"Right keywords: {right_count}")
        
        if center_count > 0:
            score *= 0.7
            reasons.append(f"Centrist language: {center_count}")
        
        # Sentiment analysis
        score += self._analyze_sentiment(text)
        
        # Clamp score
        score = max(-1.0, min(1.0, score))
        
        # Map to label
        if score < -0.4:
            label = 'LEFT'
        elif score < -0.15:
            label = 'LEAN_LEFT'
        elif score > 0.4:
            label = 'RIGHT'
        elif score > 0.15:
            label = 'LEAN_RIGHT'
        else:
            label = 'CENTER'
        
        # Calculate confidence
        total_indicators = left_count + right_count + center_count
        if any(s in source.lower() for s in self.source_map):
            total_indicators += 1
        confidence = min(0.9, 0.3 + total_indicators * 0.1)
        
        return Classification(
            label=label,
            score=score,
            confidence=confidence,
            reasons=reasons if reasons else ['Keyword analysis']
        )
    
    def _analyze_sentiment(self, text: str) -> float:
        """
        Analyze sentiment toward political parties
        """
        score_delta = 0.0
        
        dem_phrases = ['biden', 'democrats', 'democratic party']
        rep_phrases = ['trump', 'republicans', 'gop']
        
        positive = ['praised', 'supports', 'champions', 'successful']
        negative = ['criticized', 'slammed', 'attacked', 'failed']
        
        for phrase in dem_phrases:
            if phrase in text:
                if any(f"{pos} {phrase}" in text or f"{phrase} {pos}" in text 
                       for pos in positive):
                    score_delta -= 0.15
                if any(f"{neg} {phrase}" in text or f"{phrase} {neg}" in text 
                       for neg in negative):
                    score_delta += 0.15
        
        for phrase in rep_phrases:
            if phrase in text:
                if any(f"{pos} {phrase}" in text or f"{phrase} {pos}" in text 
                       for pos in positive):
                    score_delta += 0.15
                if any(f"{neg} {phrase}" in text or f"{phrase} {neg}" in text 
                       for neg in negative):
                    score_delta -= 0.15
        
        return score_delta

# Usage example
if __name__ == "__main__":
    classifier = ArticleClassifier()
    
    result = classifier.classify(
        title="Biden Signs Climate Bill",
        description="President announces new environmental regulations",
        source="CNN"
    )
    
    print(f"Label: {result.label}")
    print(f"Score: {result.score:.2f}")
    print(f"Confidence: {result.confidence:.2f}")
    print(f"Reasons: {', '.join(result.reasons)}")
`;

// ============================================================
// Enhanced Classifier with ML (Future)
// ============================================================

const mlClassifierPseudocode = `
/**
 * ML-Based Classifier (Future Enhancement)
 * Uses pre-trained transformer model for better accuracy
 */

// 1. Use a fine-tuned BERT model on political bias dataset
// 2. Embedding-based similarity to known left/right articles
// 3. Ensemble approach: combine ML + keyword + source bias

async function classifyWithML(article) {
  // Load pre-trained model (e.g., from HuggingFace)
  const model = await loadModel('political-bias-classifier-v1');
  
  // Tokenize text
  const tokens = tokenize(article.title + ' ' + article.description);
  
  // Get model prediction
  const prediction = await model.predict(tokens);
  // Returns: { label: 'LEFT', confidence: 0.92 }
  
  // Combine with heuristics
  const heuristicResult = scoreLean(article.title, article.source);
  
  // Weighted ensemble
  const finalScore = 
    prediction.score * 0.7 + 
    heuristicResult.score * 0.2 + 
    getSourceBias(article.source) * 0.1;
  
  return {
    label: scoreToLabel(finalScore),
    score: finalScore,
    confidence: prediction.confidence,
    reasons: [
      \`ML model: \${prediction.label}\`,
      \`Keywords: \${heuristicResult.label}\`,
      \`Source: \${article.source}\`
    ]
  };
}
`;

// ============================================================
// Export
// ============================================================

module.exports = {
  detectPoliticalLeanAI,
  scoreLean,
  classifyArticlesBatch
};
