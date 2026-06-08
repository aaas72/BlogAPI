-- Blog API Relational Schema (ANSI SQL, PostgreSQL-compatible)
-- This schema models the MongoDB collections (User, Post, Comment, AnalyticsEvent, DailyStats)
-- into SQL tables with explicit relationships, constraints, and indexes.

-- NOTE:
-- - Uses UUID for primary/foreign keys; generate UUIDs in application layer.
-- - Polymorphic relation for analytics_events (resource_type + resource_id) cannot be
--   enforced with FK across multiple tables; validated at application level.

/* ============================
   Users
   ============================ */
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(10) NOT NULL CHECK (role IN ('user','admin')),
  avatar VARCHAR(255) DEFAULT 'default-avatar.png',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

/* ============================
   Posts
   ============================ */
CREATE TABLE IF NOT EXISTS posts (
  id UUID PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  excerpt VARCHAR(300),
  author_id UUID NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published','archived')),
  featured_image VARCHAR(255) DEFAULT 'default-post.jpg',
  views INTEGER NOT NULL DEFAULT 0,
  read_time INTEGER NOT NULL DEFAULT 1,
  is_public BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_posts_author FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE RESTRICT
);

-- Length constraints similar to Mongoose validation
ALTER TABLE posts
  ADD CONSTRAINT chk_posts_title_len CHECK (char_length(title) >= 3),
  ADD CONSTRAINT chk_posts_content_len CHECK (char_length(content) >= 10);

-- Indexes analogous to Mongoose indexes
CREATE INDEX IF NOT EXISTS idx_posts_author_created_at ON posts (author_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_status_created_at ON posts (status, created_at DESC);

/* ============================
   Post Tags (to model Post.tags[])
   ============================ */
CREATE TABLE IF NOT EXISTS post_tags (
  post_id UUID NOT NULL,
  tag VARCHAR(100) NOT NULL,
  PRIMARY KEY (post_id, tag),
  CONSTRAINT fk_post_tags_post FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
);

/* ============================
   Post Likes (to model Post.likes[])
   ============================ */
CREATE TABLE IF NOT EXISTS post_likes (
  post_id UUID NOT NULL,
  user_id UUID NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (post_id, user_id),
  CONSTRAINT fk_post_likes_post FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
  CONSTRAINT fk_post_likes_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

/* ============================
   Comments
   ============================ */
CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY,
  content TEXT NOT NULL,
  author_id UUID NOT NULL,
  post_id UUID NOT NULL,
  parent_comment_id UUID NULL,
  is_edited BOOLEAN NOT NULL DEFAULT FALSE,
  edited_at TIMESTAMP NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'approved' CHECK (status IN ('approved','pending','rejected')),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_comments_author FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE RESTRICT,
  CONSTRAINT fk_comments_post FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
  CONSTRAINT fk_comments_parent FOREIGN KEY (parent_comment_id) REFERENCES comments(id) ON DELETE SET NULL
);

ALTER TABLE comments
  ADD CONSTRAINT chk_comments_content_len CHECK (char_length(content) >= 1 AND char_length(content) <= 1000);

CREATE INDEX IF NOT EXISTS idx_comments_post_created_at ON comments (post_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comments_author_created_at ON comments (author_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comments_parent_created_at ON comments (parent_comment_id, created_at);

/* ============================
   Comment Likes (to model Comment.likes[])
   ============================ */
CREATE TABLE IF NOT EXISTS comment_likes (
  comment_id UUID NOT NULL,
  user_id UUID NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (comment_id, user_id),
  CONSTRAINT fk_comment_likes_comment FOREIGN KEY (comment_id) REFERENCES comments(id) ON DELETE CASCADE,
  CONSTRAINT fk_comment_likes_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

/* ============================
   Analytics Events (polymorphic resource reference)
   ============================ */
CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID PRIMARY KEY,
  event_type VARCHAR(50) NOT NULL,
  resource_type VARCHAR(20) NOT NULL CHECK (resource_type IN ('Post','Comment','User')),
  resource_id UUID NOT NULL,
  user_id UUID NULL,
  session_id VARCHAR(64) NOT NULL,
  device_type VARCHAR(20) NULL CHECK (device_type IN ('desktop','mobile','tablet','unknown')),
  browser VARCHAR(100) NULL,
  os VARCHAR(100) NULL,
  ip VARCHAR(64) NULL,
  metadata TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_analytics_events_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_analytics_events_type_created ON analytics_events (event_type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_events_resource ON analytics_events (resource_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_session ON analytics_events (session_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_user ON analytics_events (user_id);

/* ============================
   Daily Stats (aggregated metrics per day)
   ============================ */
CREATE TABLE IF NOT EXISTS daily_stats (
  stat_date DATE NOT NULL,
  event_type VARCHAR(50) NOT NULL,
  resource_type VARCHAR(20) NOT NULL,
  resource_id UUID NULL,
  count INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (stat_date, event_type, resource_type, resource_id)
);

CREATE INDEX IF NOT EXISTS idx_daily_stats_date_type ON daily_stats (stat_date, event_type);

/* ============================
   Suggested Views (optional)
   ============================ */
-- CREATE VIEW post_summary AS
-- SELECT p.id,
--        p.title,
--        p.status,
--        p.views,
--        p.created_at,
--        u.name AS author_name,
--        (SELECT COUNT(*) FROM comments c WHERE c.post_id = p.id) AS comments_count,
--        (SELECT COUNT(*) FROM post_likes pl WHERE pl.post_id = p.id) AS likes_count
-- FROM posts p
-- JOIN users u ON u.id = p.author_id;