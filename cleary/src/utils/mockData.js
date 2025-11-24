// Mock news data with mood tags
export const mockArticles = [
  {
    id: 1,
    title: "Federal Reserve Maintains Interest Rates Through Q1 2026",
    summary: "The Federal Reserve announces decision to hold interest rates steady as inflation shows signs of stabilization, providing relief to borrowers and investors.",
    mood: "optimistic",
    category: "business",
    image: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800",
    readTime: 5,
    source: "Financial Times",
    timestamp: Date.now() - 3600000
  },
  {
    id: 2,
    title: "Major Tech Companies Face New EU AI Regulations",
    summary: "European Union finalizes comprehensive AI regulation framework, setting global standards for artificial intelligence development and deployment.",
    mood: "mixed",
    category: "technology",
    image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800",
    readTime: 6,
    source: "Bloomberg",
    timestamp: Date.now() - 7200000
  },
  {
    id: 3,
    title: "S&P 500 Reaches New All-Time High Amid Tech Sector Growth",
    summary: "Stock market continues strong performance as technology sector leads gains, with AI and semiconductor companies showing robust earnings.",
    mood: "hopeful",
    category: "business",
    image: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=800",
    readTime: 4,
    source: "Wall Street Journal",
    timestamp: Date.now() - 10800000
  },
  {
    id: 4,
    title: "FDA Approves Breakthrough Alzheimer's Treatment",
    summary: "New medication shows promising results in clinical trials, offering hope for millions affected by Alzheimer's disease and their families.",
    mood: "inspiring",
    category: "health",
    image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800",
    readTime: 7,
    source: "Nature Medicine",
    timestamp: Date.now() - 14400000
  },
  {
    id: 5,
    title: "Renewable Energy Costs Drop 40% Over Five Years",
    summary: "Solar and wind energy become increasingly cost-competitive with fossil fuels as technology advances and manufacturing scales up globally.",
    mood: "hopeful",
    category: "science",
    image: "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=800",
    readTime: 5,
    source: "BBC Science",
    timestamp: Date.now() - 18000000
  },
  {
    id: 6,
    title: "Global Climate Summit Reaches Historic Carbon Reduction Agreement",
    summary: "150 nations commit to ambitious carbon reduction targets, with binding agreements on emissions and renewable energy transition timelines.",
    mood: "optimistic",
    category: "world",
    image: "https://images.unsplash.com/photo-1569163139394-de4798aa62b4?w=800",
    readTime: 8,
    source: "Reuters",
    timestamp: Date.now() - 21600000
  }
];

export const moodColors = {
  hopeful: {
    bg: 'from-emerald-900/40 to-teal-900/40',
    border: 'border-emerald-500/30',
    glow: 'shadow-emerald-500/20',
    accent: 'text-emerald-400',
    bgPrimary: '#064e3b'
  },
  concerning: {
    bg: 'from-orange-900/40 to-red-900/40',
    border: 'border-orange-500/30',
    glow: 'shadow-orange-500/20',
    accent: 'text-orange-400',
    bgPrimary: '#7c2d12'
  },
  inspiring: {
    bg: 'from-blue-900/40 to-purple-900/40',
    border: 'border-blue-500/30',
    glow: 'shadow-blue-500/20',
    accent: 'text-blue-400',
    bgPrimary: '#1e3a8a'
  },
  mixed: {
    bg: 'from-slate-900/40 to-gray-900/40',
    border: 'border-slate-500/30',
    glow: 'shadow-slate-500/20',
    accent: 'text-slate-400',
    bgPrimary: '#1e293b'
  },
  optimistic: {
    bg: 'from-cyan-900/40 to-sky-900/40',
    border: 'border-cyan-500/30',
    glow: 'shadow-cyan-500/20',
    accent: 'text-cyan-400',
    bgPrimary: '#164e63'
  },
  exciting: {
    bg: 'from-pink-900/40 to-fuchsia-900/40',
    border: 'border-pink-500/30',
    glow: 'shadow-pink-500/20',
    accent: 'text-pink-400',
    bgPrimary: '#831843'
  },
  neutral: {
    bg: 'from-gray-900/40 to-slate-900/40',
    border: 'border-gray-500/30',
    glow: 'shadow-gray-500/20',
    accent: 'text-gray-400',
    bgPrimary: '#111827'
  }
};

export const moods = [
  { id: 'recommended', label: 'Recommended', color: '#9ca3af' },
  { id: 'breaking', label: 'Breaking', color: '#9ca3af' },
  { id: 'economy', label: 'Economy', color: '#9ca3af' },
  { id: 'war', label: 'War', color: '#9ca3af' },
  { id: 'politics', label: 'Politics', color: '#9ca3af' },
  { id: 'health', label: 'Health', color: '#9ca3af' },
  { id: 'science', label: 'Science', color: '#9ca3af' },
];
