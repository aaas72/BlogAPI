-- Blog API Relational Schema (MySQL-compatible)
-- This schema mirrors MongoDB collections into MySQL tables and relations.

/* ============================
   Users
   ============================ */
CREATE TABLE IF NOT EXISTS users (
  id CHAR(36) PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('user','admin') NOT NULL,
  avatar VARCHAR(255) DEFAULT 'default-avatar.png',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

/* ============================
   Posts
   ============================ */
CREATE TABLE IF NOT EXISTS posts (
  id CHAR(36) PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  excerpt VARCHAR(300),
  author_id CHAR(36) NOT NULL,
  status ENUM('draft','published','archived') NOT NULL DEFAULT 'draft',
  featured_image VARCHAR(255) DEFAULT 'default-post.jpg',
  views INT NOT NULL DEFAULT 0,
  read_time INT NOT NULL DEFAULT 1,
  is_public BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_posts_author FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS idx_posts_author_created_at ON posts (author_id, created_at);
CREATE INDEX IF NOT EXISTS idx_posts_status_created_at ON posts (status, created_at);

/* ============================
   Post Tags (to model Post.tags[])
   ============================ */
CREATE TABLE IF NOT EXISTS post_tags (
  post_id CHAR(36) NOT NULL,
  tag VARCHAR(100) NOT NULL,
  PRIMARY KEY (post_id, tag),
  CONSTRAINT fk_post_tags_post FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
);

/* ============================
   Post Likes (to model Post.likes[])
   ============================ */
CREATE TABLE IF NOT EXISTS post_likes (
  post_id CHAR(36) NOT NULL,
  user_id CHAR(36) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (post_id, user_id),
  CONSTRAINT fk_post_likes_post FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
  CONSTRAINT fk_post_likes_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

/* ============================
   Comments
   ============================ */
CREATE TABLE IF NOT EXISTS comments (
  id CHAR(36) PRIMARY KEY,
  content TEXT NOT NULL,
  author_id CHAR(36) NOT NULL,
  post_id CHAR(36) NOT NULL,
  parent_comment_id CHAR(36) NULL,
  is_edited BOOLEAN NOT NULL DEFAULT FALSE,
  edited_at TIMESTAMP NULL,
  status ENUM('approved','pending','rejected') NOT NULL DEFAULT 'approved',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_comments_author FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE RESTRICT,
  CONSTRAINT fk_comments_post FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
  CONSTRAINT fk_comments_parent FOREIGN KEY (parent_comment_id) REFERENCES comments(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_comments_post_created_at ON comments (post_id, created_at);
CREATE INDEX IF NOT EXISTS idx_comments_author_created_at ON comments (author_id, created_at);
CREATE INDEX IF NOT EXISTS idx_comments_parent_created_at ON comments (parent_comment_id, created_at);

/* ============================
   Comment Likes (to model Comment.likes[])
   ============================ */
CREATE TABLE IF NOT EXISTS comment_likes (
  comment_id CHAR(36) NOT NULL,
  user_id CHAR(36) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (comment_id, user_id),
  CONSTRAINT fk_comment_likes_comment FOREIGN KEY (comment_id) REFERENCES comments(id) ON DELETE CASCADE,
  CONSTRAINT fk_comment_likes_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

/* ============================
   Analytics Events (polymorphic resource reference)
   ============================ */
CREATE TABLE IF NOT EXISTS analytics_events (
  id CHAR(36) PRIMARY KEY,
  event_type VARCHAR(50) NOT NULL,
  resource_type ENUM('Post','Comment','User') NOT NULL,
  resource_id CHAR(36) NOT NULL,
  user_id CHAR(36) NULL,
  session_id VARCHAR(64) NOT NULL,
  device_type ENUM('desktop','mobile','tablet','unknown') NULL,
  browser VARCHAR(100) NULL,
  os VARCHAR(100) NULL,
  ip VARCHAR(64) NULL,
  metadata TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_analytics_events_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_analytics_events_type_created ON analytics_events (event_type, created_at);
CREATE INDEX IF NOT EXISTS idx_analytics_events_resource ON analytics_events (resource_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_session ON analytics_events (session_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_user ON analytics_events (user_id);

/* ============================
   Daily Stats (aggregated metrics per day)
   ============================ */
CREATE TABLE IF NOT EXISTS daily_stats (
  stat_date DATE NOT NULL,
  event_type VARCHAR(50) NOT NULL,
  resource_type ENUM('Post','Comment','User') NOT NULL,
  resource_id CHAR(36) NULL,
  count INT NOT NULL DEFAULT 0,
  PRIMARY KEY (stat_date, event_type, resource_type, resource_id)
);

CREATE INDEX IF NOT EXISTS idx_daily_stats_date_type ON daily_stats (stat_date, event_type);