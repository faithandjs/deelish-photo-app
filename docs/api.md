# Deelish — REST API

Base URL: `https://api.deelish.app`
Auth: `Authorization: Bearer <B2C JWT>` on every endpoint except where noted.
All responses JSON. All `4xx` carry `{ "error": "<code>", "message": "<text>" }`.

## Conventions

- `200` on success, `201` on create, `204` on delete.
- Pagination: `?page=1&pageSize=12` → `{ items, page, pageSize, total }`.
- All inputs validated with Zod; over-length strings rejected with `422`.
- Ownership checks: PATCH/DELETE return `403` if `photo.owner_id != sub`.

## Photos

| Method | Path              | Role            | Notes                                                                                                     |
| ------ | ----------------- | --------------- | --------------------------------------------------------------------------------------------------------- |
| GET    | `/api/photos`     | any             | Paginated feed. `?q=` for quick search (full search uses `/api/search`).                                  |
| GET    | `/api/photos/:id` | any             | Single photo with metadata + denormalised counts.                                                         |
| POST   | `/api/photos/sas` | creator         | Returns `{ uploadUrl, blobPath }` (5-min SAS).                                                            |
| POST   | `/api/photos`     | creator         | Body `{ blobPath, title, caption, location, people[] }`. Server validates blob exists, queues AI tagging. |
| PATCH  | `/api/photos/:id` | creator (owner) | Body any subset of `{ title, caption, location, people, tags }`.                                          |
| DELETE | `/api/photos/:id` | creator (owner) | Cascades comments/ratings. Removes blob.                                                                  |

### `POST /api/photos` — request

```json
{
  "blobPath": "originals/2025/05/abc123.jpg",
  "title": "Alpine Solitude",
  "caption": "First light over the Dolomites.",
  "location": "Dolomites, Italy",
  "people": []
}
```

### Photo response

```json
{
  "id": "p_a1b2c3",
  "ownerId": "u_xyz",
  "ownerName": "Maya Chen",
  "imageUrl": "https://cdn.deelish.app/originals/2025/05/abc123.jpg",
  "thumbnailUrl": "https://cdn.deelish.app/thumbs/2025/05/abc123.jpg",
  "title": "Alpine Solitude",
  "caption": "First light over the Dolomites.",
  "location": "Dolomites, Italy",
  "people": [],
  "tags": ["mountain", "sunrise", "landscape"],
  "createdAt": "2025-04-12T07:14:00Z",
  "ratingAvg": 4.7,
  "ratingCount": 23,
  "commentCount": 4
}
```

## Search

| Method | Path          | Role | Notes                                                                                                                           |
| ------ | ------------- | ---- | ------------------------------------------------------------------------------------------------------------------------------- |
| GET    | `/api/search` | any  | Query params: `q`, `page`, `pageSize`, optional `tags=a,b`, `location=`, `from=`, `to=`. Backed by Elasticsearch `multi_match`. |

Cached in Redis for 60s per `(q, page, filters)` key.

## Comments

| Method | Path                       | Role            |
| ------ | -------------------------- | --------------- |
| GET    | `/api/photos/:id/comments` | any             |
| POST   | `/api/photos/:id/comments` | authenticated   |
| DELETE | `/api/comments/:id`        | author or admin |

`POST` body: `{ "body": "string ≤1000 chars" }`.

Realtime: comment events broadcast to `photo:<id>` channel via Web PubSub
so open photo pages update without polling.

## Ratings

| Method | Path                         | Role          |
| ------ | ---------------------------- | ------------- |
| GET    | `/api/photos/:id/ratings/me` | authenticated |
| PUT    | `/api/photos/:id/ratings`    | authenticated |

`PUT` body: `{ "value": 1..5 }`. Upsert by `(photo_id, user_id)`.
Response includes the recomputed `ratingAvg` / `ratingCount`.

## Errors

| Code | Meaning                                            |
| ---- | -------------------------------------------------- |
| 400  | Malformed request                                  |
| 401  | Missing / invalid JWT                              |
| 403  | Role or ownership check failed                     |
| 404  | Resource not found                                 |
| 409  | Conflict (e.g. duplicate rating handled as update) |
| 422  | Validation failed                                  |
| 429  | Rate limit exceeded                                |
