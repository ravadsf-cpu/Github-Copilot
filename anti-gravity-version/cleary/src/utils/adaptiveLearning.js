// Adaptive learning utilities for personalized lean inference

export const getClickHistory = () => {
  try {
    const raw = localStorage.getItem('leanClicks') || '[]';
    return JSON.parse(raw);
  } catch {
    return [];
  }
};

export const inferUserLean = () => {
  const clicks = getClickHistory();
  if (clicks.length < 5) return 'center'; // not enough data
  
  // Calculate weighted average (recent clicks weigh more)
  const now = Date.now();
  const oneDay = 86400000;
  let totalWeight = 0;
  let weightedScore = 0;
  
  clicks.forEach((c) => {
    const age = now - (c.time || 0);
    const recencyWeight = Math.max(0, 1 - age / (7 * oneDay)); // decay over 7 days
    const w = recencyWeight * recencyWeight; // square for stronger recent bias
    totalWeight += w;
    weightedScore += (c.score || 0) * w;
  });
  
  if (totalWeight === 0) return 'center';
  
  const avgScore = weightedScore / totalWeight;
  
  // Map to label
  if (avgScore <= -0.4) return 'left';
  if (avgScore < -0.1) return 'lean-left';
  if (avgScore < 0.1) return 'center';
  if (avgScore < 0.4) return 'lean-right';
  return 'right';
};

export const getAdaptiveRecommendation = () => {
  const userLean = inferUserLean();
  const clicks = getClickHistory();
  
  // Compute diversity of clicks (how spread out)
  const leanCounts = { left: 0, 'lean-left': 0, center: 0, 'lean-right': 0, right: 0 };
  clicks.forEach(c => {
    const lean = c.lean || 'center';
    leanCounts[lean] = (leanCounts[lean] || 0) + 1;
  });
  
  const dist = Object.values(leanCounts).map(v => v / clicks.length).filter(p => p > 0);
  const diversity = dist.length > 0 
    ? -dist.reduce((sum, p) => sum + p * Math.log2(p), 0) / Math.log2(5)
    : 0;
  
  let suggestion = '';
  if (diversity < 0.3) {
    suggestion = "You're in an echo chamber. Try 'Challenge' mode for fresh perspectives.";
  } else if (diversity > 0.7) {
    suggestion = "Great job exploring diverse viewpoints! Keep it balanced.";
  } else {
    suggestion = "You're reading a healthy mix. Consider 'Reinforce' to dive deeper into your interests.";
  }
  
  return {
    userLean,
    diversity: diversity * 100,
    suggestion,
    clickCount: clicks.length
  };
};
