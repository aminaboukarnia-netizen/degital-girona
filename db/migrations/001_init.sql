-- NashrClip AI phase 2 - schema only. Not yet deployed to Turso.
-- No secrets, provider calls, credits, or automatic publishing.
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS ideas (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  concept TEXT NOT NULL DEFAULT '',
  script TEXT,
  language TEXT NOT NULL DEFAULT 'es',
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft','shortlisted','in_production','in_review','approved','rejected','published','archived')),
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

CREATE TABLE IF NOT EXISTS generation_jobs (
  id TEXT PRIMARY KEY,
  idea_id TEXT NOT NULL REFERENCES ideas(id) ON DELETE RESTRICT,
  kind TEXT NOT NULL CHECK (kind IN ('image','video','audio','merge')),
  provider TEXT NOT NULL,
  provider_task_id TEXT,
  status TEXT NOT NULL DEFAULT 'queued'
    CHECK (status IN ('queued','running','succeeded','failed','cancelled')),
  credits_used REAL NOT NULL DEFAULT 0 CHECK (credits_used >= 0),
  error_message TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

CREATE TABLE IF NOT EXISTS media_assets (
  id TEXT PRIMARY KEY,
  idea_id TEXT NOT NULL REFERENCES ideas(id) ON DELETE RESTRICT,
  job_id TEXT REFERENCES generation_jobs(id) ON DELETE SET NULL,
  media_type TEXT NOT NULL CHECK (media_type IN ('image','video','audio')),
  version INTEGER NOT NULL DEFAULT 1 CHECK (version > 0),
  permanent_url TEXT NOT NULL,
  sha256 TEXT NOT NULL CHECK (length(sha256) = 64),
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  UNIQUE(idea_id, media_type, version)
);

CREATE TABLE IF NOT EXISTS approvals (
  id TEXT PRIMARY KEY,
  idea_id TEXT NOT NULL REFERENCES ideas(id) ON DELETE RESTRICT,
  asset_id TEXT NOT NULL REFERENCES media_assets(id) ON DELETE RESTRICT,
  platform TEXT NOT NULL CHECK (platform IN ('instagram','youtube','tiktok','facebook')),
  caption_sha256 TEXT NOT NULL CHECK (length(caption_sha256) = 64),
  decision TEXT NOT NULL DEFAULT 'pending'
    CHECK (decision IN ('pending','approved','rejected','revoked')),
  decided_by TEXT,
  decided_at TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  CHECK (decision != 'approved' OR (decided_by IS NOT NULL AND decided_at IS NOT NULL))
);

CREATE TABLE IF NOT EXISTS publishing_jobs (
  id TEXT PRIMARY KEY,
  idea_id TEXT NOT NULL REFERENCES ideas(id) ON DELETE RESTRICT,
  asset_id TEXT NOT NULL REFERENCES media_assets(id) ON DELETE RESTRICT,
  approval_id TEXT NOT NULL REFERENCES approvals(id) ON DELETE RESTRICT,
  platform TEXT NOT NULL CHECK (platform IN ('instagram','youtube','tiktok','facebook')),
  caption TEXT NOT NULL,
  caption_sha256 TEXT NOT NULL CHECK (length(caption_sha256) = 64),
  status TEXT NOT NULL DEFAULT 'queued'
    CHECK (status IN ('queued','publishing','published','failed','cancelled')),
  external_post_id TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

CREATE TRIGGER IF NOT EXISTS publishing_requires_approval_insert
BEFORE INSERT ON publishing_jobs BEGIN
  SELECT CASE WHEN NOT EXISTS (
    SELECT 1 FROM approvals a JOIN media_assets m ON m.id = a.asset_id
    WHERE a.id = NEW.approval_id AND a.idea_id = NEW.idea_id
      AND a.asset_id = NEW.asset_id AND m.idea_id = NEW.idea_id
      AND a.platform = NEW.platform
      AND a.caption_sha256 = NEW.caption_sha256
      AND a.decision = 'approved'
      AND a.decided_by IS NOT NULL AND a.decided_at IS NOT NULL
  ) THEN RAISE(ABORT, 'Explicit matching approval required') END;
END;

CREATE TRIGGER IF NOT EXISTS publishing_requires_approval_update
BEFORE UPDATE OF approval_id,idea_id,asset_id,platform,caption_sha256,status ON publishing_jobs BEGIN
  SELECT CASE WHEN NOT EXISTS (
    SELECT 1 FROM approvals a JOIN media_assets m ON m.id = a.asset_id
    WHERE a.id = NEW.approval_id AND a.idea_id = NEW.idea_id
      AND a.asset_id = NEW.asset_id AND m.idea_id = NEW.idea_id
      AND a.platform = NEW.platform
      AND a.caption_sha256 = NEW.caption_sha256
      AND a.decision = 'approved'
      AND a.decided_by IS NOT NULL AND a.decided_at IS NOT NULL
  ) THEN RAISE(ABORT, 'Explicit matching approval required') END;
END;

CREATE TRIGGER IF NOT EXISTS protect_approved_asset
BEFORE UPDATE OF permanent_url,sha256,idea_id ON media_assets
WHEN EXISTS (SELECT 1 FROM approvals WHERE asset_id = OLD.id AND decision = 'approved')
BEGIN SELECT RAISE(ABORT, 'Approved media is immutable; create a new version'); END;

CREATE TABLE IF NOT EXISTS audit_events (
  id TEXT PRIMARY KEY,
  actor TEXT NOT NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  details_json TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

CREATE INDEX IF NOT EXISTS idx_ideas_status ON ideas(status,created_at);
CREATE INDEX IF NOT EXISTS idx_generation_jobs_idea ON generation_jobs(idea_id,created_at);
CREATE INDEX IF NOT EXISTS idx_media_assets_idea ON media_assets(idea_id,created_at);
CREATE INDEX IF NOT EXISTS idx_approvals_idea ON approvals(idea_id,created_at);
CREATE INDEX IF NOT EXISTS idx_publishing_jobs_status ON publishing_jobs(platform,status,created_at);
CREATE INDEX IF NOT EXISTS idx_audit_events_entity ON audit_events(entity_type,entity_id,created_at);

-- IMPORTANT: The application must independently authenticate approvers
-- and recheck the current approval just before any external publish API call.
-- This migration is a draft and must be reviewed and run on Turso separately.
