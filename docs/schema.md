# Deelish — Database Schema (Azure SQL)

```sql
-- =====================================================
-- USERS
-- B2C is the source of truth for identity. We mirror
-- minimal profile data here for joins and display.
-- =====================================================
CREATE TABLE users (
  id            UNIQUEIDENTIFIER PRIMARY KEY,        -- == B2C `oid`
  email         NVARCHAR(320) NOT NULL UNIQUE,
  display_name  NVARCHAR(120) NOT NULL,
  avatar_url    NVARCHAR(2048) NULL,
  role          NVARCHAR(20)  NOT NULL CHECK (role IN ('creator', 'consumer')),
  created_at    DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);
CREATE INDEX ix_users_role ON users(role);

-- =====================================================
-- PHOTOS
-- =====================================================
CREATE TABLE photos (
  id            UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
  owner_id      UNIQUEIDENTIFIER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  blob_path     NVARCHAR(512) NOT NULL,              -- container/path.jpg
  thumb_path    NVARCHAR(512) NOT NULL,
  title         NVARCHAR(120) NOT NULL,
  caption       NVARCHAR(500) NULL,
  location      NVARCHAR(120) NULL,
  status        NVARCHAR(20)  NOT NULL DEFAULT 'processing'
                   CHECK (status IN ('processing','ready','failed')),
  rating_avg    DECIMAL(3,2)  NOT NULL DEFAULT 0,    -- denormalised
  rating_count  INT           NOT NULL DEFAULT 0,
  comment_count INT           NOT NULL DEFAULT 0,
  created_at    DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
  updated_at    DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);
CREATE INDEX ix_photos_owner_created ON photos(owner_id, created_at DESC);
CREATE INDEX ix_photos_created ON photos(created_at DESC);

-- =====================================================
-- TAGS (many-to-many) — both AI and manual
-- =====================================================
CREATE TABLE tags (
  id    INT IDENTITY PRIMARY KEY,
  name  NVARCHAR(48) NOT NULL UNIQUE
);

CREATE TABLE photo_tags (
  photo_id   UNIQUEIDENTIFIER NOT NULL REFERENCES photos(id) ON DELETE CASCADE,
  tag_id     INT NOT NULL REFERENCES tags(id),
  source     NVARCHAR(10) NOT NULL CHECK (source IN ('ai','manual')),
  confidence DECIMAL(4,3) NULL,                       -- AI only
  PRIMARY KEY (photo_id, tag_id)
);

-- =====================================================
-- PEOPLE (free-form text per photo, manual only)
-- Kept separate from tags for clean filtering.
-- =====================================================
CREATE TABLE photo_people (
  photo_id  UNIQUEIDENTIFIER NOT NULL REFERENCES photos(id) ON DELETE CASCADE,
  name      NVARCHAR(120) NOT NULL,
  PRIMARY KEY (photo_id, name)
);

-- =====================================================
-- COMMENTS
-- =====================================================
CREATE TABLE comments (
  id         UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
  photo_id   UNIQUEIDENTIFIER NOT NULL REFERENCES photos(id) ON DELETE CASCADE,
  author_id  UNIQUEIDENTIFIER NOT NULL REFERENCES users(id),
  body       NVARCHAR(1000) NOT NULL,
  created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);
CREATE INDEX ix_comments_photo_created ON comments(photo_id, created_at);

-- =====================================================
-- RATINGS (one per user per photo)
-- =====================================================
CREATE TABLE ratings (
  photo_id  UNIQUEIDENTIFIER NOT NULL REFERENCES photos(id) ON DELETE CASCADE,
  user_id   UNIQUEIDENTIFIER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  value     TINYINT NOT NULL CHECK (value BETWEEN 1 AND 5),
  created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
  PRIMARY KEY (photo_id, user_id)
);

-- =====================================================
-- ACTIVITY LOG (nice-to-have)
-- =====================================================
CREATE TABLE activity_log (
  id         BIGINT IDENTITY PRIMARY KEY,
  actor_id   UNIQUEIDENTIFIER NULL,
  action     NVARCHAR(40) NOT NULL,                  -- photo.create, photo.delete, ...
  target_id  UNIQUEIDENTIFIER NULL,
  metadata   NVARCHAR(MAX) NULL,                     -- JSON
  created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);
CREATE INDEX ix_activity_created ON activity_log(created_at DESC);
```

## Aggregate maintenance

`photos.rating_avg`, `photos.rating_count`, `photos.comment_count` are
denormalised for fast feed queries. Maintained via:

- **Triggers** on `ratings` and `comments`, OR
- **Application code** after each write (preferred, simpler to test).

## Elasticsearch index

```jsonc
// PUT /photos
{
  "mappings": {
    "properties": {
      "id": { "type": "keyword" },
      "owner_id": { "type": "keyword" },
      "title": { "type": "text", "boost": 3 },
      "caption": { "type": "text" },
      "location": { "type": "text", "boost": 2, "fields": { "kw": { "type": "keyword" } } },
      "people": { "type": "text", "boost": 2 },
      "tags": { "type": "keyword" },
      "rating_avg": { "type": "half_float" },
      "created_at": { "type": "date" },
    },
  },
}
```
