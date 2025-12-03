-- Database Schema for Cleary News Platform
-- PostgreSQL / Supabase

-- ============================================================
-- 2. DATABASE SCHEMAS
-- ============================================================

-- Users Table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  oauth_provider VARCHAR(50) NOT NULL, -- 'google', 'github', etc.
  oauth_id VARCHAR(255) NOT NULL UNIQUE, -- Provider's user ID
  email VARCHAR(255),
  name VARCHAR(255),
  avatar_url TEXT,
  
  -- Personalization profile (JSON)
  personalization_profile JSONB DEFAULT '{
    "interests": [],
    "dominant_lean": "center",
    "lean_distribution": {"left": 0, "center": 0, "right": 0},
    "preferred_sources": [],
    "video_preference": 0.5
  }'::jsonb,
  
  -- Initial clicks for bootstrapping
  initial_clicks JSONB DEFAULT '[]'::jsonb, -- Array of {articleId, timestamp, lean}
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Indexes
  CONSTRAINT unique_oauth_user UNIQUE (oauth_provider, oauth_id)
);

CREATE INDEX idx_users_oauth ON users(oauth_provider, oauth_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_created_at ON users(created_at DESC);

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================

-- Articles Table
CREATE TABLE articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Core metadata
  title TEXT NOT NULL,
  url TEXT NOT NULL UNIQUE,
  source VARCHAR(255) NOT NULL, -- 'CNN', 'BBC', etc.
  author VARCHAR(255),
  published_at TIMESTAMP WITH TIME ZONE NOT NULL,
  
  -- Content
  description TEXT,
  content TEXT, -- Full article text
  content_html TEXT, -- Scraped HTML
  
  -- Media
  thumbnail_url TEXT,
  media_urls JSONB DEFAULT '{"images": [], "videos": []}'::jsonb,
  
  -- Classification
  political_lean VARCHAR(20) NOT NULL, -- 'LEFT', 'LEAN_LEFT', 'CENTER', 'LEAN_RIGHT', 'RIGHT'
  lean_score DECIMAL(5, 3) DEFAULT 0.0, -- -1.0 to 1.0
  lean_confidence DECIMAL(4, 3) DEFAULT 0.5, -- 0.0 to 1.0
  lean_reasons JSONB DEFAULT '[]'::jsonb, -- Array of reason strings
  
  -- Categorization
  category VARCHAR(50), -- 'politics', 'technology', 'sports', etc.
  tags JSONB DEFAULT '[]'::jsonb, -- Array of tag strings
  
  -- Engagement (denormalized for performance)
  view_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  share_count INTEGER DEFAULT 0,
  
  -- ML embeddings (optional, for future semantic search)
  embeddings VECTOR(768), -- Requires pgvector extension
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Soft delete
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- Indexes for performance
CREATE INDEX idx_articles_url ON articles(url);
CREATE INDEX idx_articles_source ON articles(source);
CREATE INDEX idx_articles_published_at ON articles(published_at DESC);
CREATE INDEX idx_articles_political_lean ON articles(political_lean);
CREATE INDEX idx_articles_category ON articles(category);
CREATE INDEX idx_articles_created_at ON articles(created_at DESC);
CREATE INDEX idx_articles_tags ON articles USING GIN (tags);

-- Full-text search index
CREATE INDEX idx_articles_search ON articles USING GIN (
  to_tsvector('english', COALESCE(title, '') || ' ' || COALESCE(description, '') || ' ' || COALESCE(content, ''))
);

CREATE TRIGGER update_articles_updated_at BEFORE UPDATE ON articles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================

-- Shorts Table (Video-first content)
CREATE TABLE shorts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Reference to parent article (if applicable)
  article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
  
  -- Video metadata
  video_url TEXT NOT NULL,
  video_embed_src TEXT, -- Embeddable iframe source
  video_kind VARCHAR(50), -- 'youtube', 'vimeo', 'brightcove', 'iframe'
  duration INTEGER NOT NULL, -- Seconds (max 150 for 2:30)
  thumbnail_url TEXT,
  
  -- Content
  title TEXT NOT NULL,
  description TEXT,
  
  -- Classification
  tags JSONB DEFAULT '[]'::jsonb,
  category VARCHAR(50),
  
  -- Engagement
  view_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  dislike_count INTEGER DEFAULT 0,
  share_count INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  
  -- Publishing
  published_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT duration_limit CHECK (duration > 0 AND duration <= 150)
);

CREATE INDEX idx_shorts_article_id ON shorts(article_id);
CREATE INDEX idx_shorts_duration ON shorts(duration);
CREATE INDEX idx_shorts_published_at ON shorts(published_at DESC);
CREATE INDEX idx_shorts_engagement ON shorts(like_count DESC, view_count DESC);
CREATE INDEX idx_shorts_tags ON shorts USING GIN (tags);

CREATE TRIGGER update_shorts_updated_at BEFORE UPDATE ON shorts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================

-- Classifications Table (Historical tracking)
CREATE TABLE classifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  article_id UUID NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  
  -- Classification result
  leaning VARCHAR(20) NOT NULL, -- 'LEFT', 'LEAN_LEFT', 'CENTER', 'LEAN_RIGHT', 'RIGHT'
  confidence_score DECIMAL(4, 3) NOT NULL, -- 0.0 to 1.0
  
  -- Method used
  classification_method VARCHAR(50) NOT NULL, -- 'ai_gemini', 'keyword_fallback', 'manual'
  
  -- Reasoning (for explainability)
  reasons JSONB DEFAULT '[]'::jsonb,
  
  -- Metadata
  classified_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  classifier_version VARCHAR(20) DEFAULT 'v1.0',
  
  -- Allow multiple classifications per article (for A/B testing)
  UNIQUE (article_id, classifier_version)
);

CREATE INDEX idx_classifications_article_id ON classifications(article_id);
CREATE INDEX idx_classifications_leaning ON classifications(leaning);
CREATE INDEX idx_classifications_confidence ON classifications(confidence_score DESC);
CREATE INDEX idx_classifications_method ON classifications(classification_method);

-- ============================================================

-- User Interactions Table (Click tracking, likes, shares)
CREATE TABLE interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
  
  -- Interaction type
  action VARCHAR(50) NOT NULL, -- 'view', 'click', 'like', 'dislike', 'share', 'comment'
  
  -- Context
  metadata JSONB DEFAULT '{}'::jsonb, -- { duration_seconds, scroll_depth, etc. }
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_interactions_user_id ON interactions(user_id, created_at DESC);
CREATE INDEX idx_interactions_article_id ON interactions(article_id);
CREATE INDEX idx_interactions_action ON interactions(action);
CREATE INDEX idx_interactions_created_at ON interactions(created_at DESC);

-- ============================================================

-- Comments Table (for shorts and articles)
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
  short_id UUID REFERENCES shorts(id) ON DELETE CASCADE,
  
  -- Comment content
  text TEXT NOT NULL,
  
  -- Nested comments (optional)
  parent_comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  
  -- Moderation
  is_flagged BOOLEAN DEFAULT FALSE,
  is_deleted BOOLEAN DEFAULT FALSE,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure comment belongs to either article OR short
  CONSTRAINT comment_target_check CHECK (
    (article_id IS NOT NULL AND short_id IS NULL) OR
    (article_id IS NULL AND short_id IS NOT NULL)
  )
);

CREATE INDEX idx_comments_user_id ON comments(user_id);
CREATE INDEX idx_comments_article_id ON comments(article_id, created_at DESC);
CREATE INDEX idx_comments_short_id ON comments(short_id, created_at DESC);
CREATE INDEX idx_comments_parent ON comments(parent_comment_id);

CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================

-- Views for Common Queries

-- User profile summary
CREATE VIEW user_profiles AS
SELECT 
  u.id,
  u.name,
  u.email,
  u.personalization_profile,
  COUNT(DISTINCT i.id) FILTER (WHERE i.action = 'click') as total_clicks,
  COUNT(DISTINCT i.id) FILTER (WHERE i.action = 'like') as total_likes,
  COUNT(DISTINCT i.id) FILTER (WHERE i.action = 'share') as total_shares,
  u.created_at,
  u.last_login
FROM users u
LEFT JOIN interactions i ON u.id = i.user_id
GROUP BY u.id;

-- Trending articles (last 24 hours)
CREATE VIEW trending_articles AS
SELECT 
  a.id,
  a.title,
  a.url,
  a.source,
  a.political_lean,
  COUNT(DISTINCT i.user_id) as unique_viewers,
  SUM(CASE WHEN i.action = 'like' THEN 1 ELSE 0 END) as likes,
  SUM(CASE WHEN i.action = 'share' THEN 1 ELSE 0 END) as shares,
  a.published_at
FROM articles a
LEFT JOIN interactions i ON a.id = i.article_id
WHERE a.published_at > NOW() - INTERVAL '24 hours'
  AND a.deleted_at IS NULL
GROUP BY a.id
ORDER BY (unique_viewers + likes * 2 + shares * 3) DESC
LIMIT 50;

-- Top shorts by engagement
CREATE VIEW top_shorts AS
SELECT 
  s.id,
  s.title,
  s.video_url,
  s.thumbnail_url,
  s.like_count,
  s.share_count,
  s.view_count,
  (s.like_count * 2 + s.share_count * 3 + s.view_count) as engagement_score,
  s.published_at
FROM shorts s
WHERE s.published_at > NOW() - INTERVAL '7 days'
ORDER BY engagement_score DESC
LIMIT 100;

-- ============================================================

-- Sample Queries

-- 1. Get personalized articles for user
/*
SELECT a.*
FROM articles a
JOIN classifications c ON a.id = c.article_id
WHERE a.deleted_at IS NULL
  AND a.published_at > NOW() - INTERVAL '24 hours'
  AND (
    -- Match user interests (using JSONB operators)
    a.tags ?| ARRAY['ai', 'economy'] -- Tags overlap with user interests
    OR a.political_lean = 'CENTER' -- User's preferred lean
  )
ORDER BY a.published_at DESC
LIMIT 50;
*/

-- 2. Track user interaction
/*
INSERT INTO interactions (user_id, article_id, action, metadata)
VALUES (
  'user-uuid',
  'article-uuid',
  'click',
  '{"source": "feed", "position": 3}'::jsonb
);
*/

-- 3. Get user's dominant lean preference
/*
SELECT 
  (personalization_profile->>'dominant_lean') as dominant_lean,
  (personalization_profile->'lean_distribution') as distribution
FROM users
WHERE id = 'user-uuid';
*/

-- 4. Update article engagement
/*
UPDATE articles
SET like_count = like_count + 1
WHERE id = 'article-uuid';
*/

-- ============================================================

-- Seed Data (for development)

INSERT INTO users (oauth_provider, oauth_id, email, name) VALUES
('google', '123456789', 'demo@example.com', 'Demo User');

INSERT INTO articles (title, url, source, published_at, political_lean, category) VALUES
('Breaking: AI Breakthrough', 'https://example.com/ai-news', 'TechCrunch', NOW(), 'CENTER', 'technology'),
('Election Results Coming In', 'https://example.com/election', 'CNN', NOW() - INTERVAL '1 hour', 'LEAN_LEFT', 'politics'),
('Market Rally Continues', 'https://example.com/market', 'Bloomberg', NOW() - INTERVAL '2 hours', 'LEAN_RIGHT', 'business');

