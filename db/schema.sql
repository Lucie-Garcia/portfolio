PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS skills (
  id INTEGER PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL CHECK (category IN ('langage', 'framework', 'outil', 'design', 'autre')),
  logo_path TEXT,
  description TEXT,
  level INTEGER NOT NULL CHECK (level BETWEEN 1 AND 5),
  opinion TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_visible INTEGER NOT NULL DEFAULT 1 CHECK (is_visible IN (0, 1))
) STRICT;

CREATE TABLE IF NOT EXISTS projects (
  id INTEGER PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  context TEXT,
  objective TEXT,
  result TEXT,
  learnings TEXT,
  role TEXT,
  cover_path TEXT,
  cover_alt TEXT,
  started_on TEXT,
  ended_on TEXT,
  is_featured INTEGER NOT NULL DEFAULT 0 CHECK (is_featured IN (0, 1)),
  is_published INTEGER NOT NULL DEFAULT 0 CHECK (is_published IN (0, 1)),
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
) STRICT;

CREATE TABLE IF NOT EXISTS project_images (
  id INTEGER PRIMARY KEY,
  project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  path TEXT NOT NULL,
  alt TEXT NOT NULL,
  caption TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0
) STRICT;

CREATE TABLE IF NOT EXISTS project_links (
  id INTEGER PRIMARY KEY,
  project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  kind TEXT NOT NULL CHECK (kind IN ('demo', 'code', 'design', 'article', 'autre')),
  label TEXT NOT NULL,
  url TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0
) STRICT;

CREATE TABLE IF NOT EXISTS tags (
  id INTEGER PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL UNIQUE
) STRICT;

CREATE TABLE IF NOT EXISTS project_tags (
  project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  tag_id INTEGER NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (project_id, tag_id)
) STRICT, WITHOUT ROWID;

CREATE TABLE IF NOT EXISTS project_skills (
  project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  skill_id INTEGER NOT NULL REFERENCES skills(id) ON DELETE RESTRICT,
  usage_note TEXT,
  PRIMARY KEY (project_id, skill_id)
) STRICT, WITHOUT ROWID;

CREATE INDEX IF NOT EXISTS idx_project_images_order
  ON project_images (project_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_project_links_project
  ON project_links (project_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_project_tags_tag
  ON project_tags (tag_id);
CREATE INDEX IF NOT EXISTS idx_project_skills_skill
  ON project_skills (skill_id);
CREATE INDEX IF NOT EXISTS idx_projects_published
  ON projects (is_published, started_on DESC);
