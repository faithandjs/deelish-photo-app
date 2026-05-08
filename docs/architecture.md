# Deelish — System Architecture

> Frontend (this repo) is wired against a typed API contract.
> The Azure backend described here lives in a separate repo.

```text
                ┌──────────────────────────────────────────┐
                │              Browser (SPA)               │
                │   React + TS + Tailwind + TanStack       │
                │   - Route guards (RBAC)                  │
                │   - React Query cache                    │
                │   - Direct-to-Blob uploads (SAS)         │
                └─────────────┬────────────────────────────┘
                              │ HTTPS
                              ▼
        ┌─────────────────────────────────────────────────┐
        │            Azure AD B2C (auth)                  │
        │  - User flows / custom policies                 │
        │  - JWT ID + access tokens                       │
        │  - `extension_role` claim → creator | consumer  │
        └─────────────┬───────────────────────────────────┘
                      │ Bearer JWT
                      ▼
   ┌──────────────────────────────────────────────────────┐
   │     API Gateway / Azure App Service (Node or .NET)   │
   │  - JWT validation middleware                         │
   │  - RBAC guards on every route                        │
   │  - Ownership checks (PATCH/DELETE photo)             │
   │  - Zod / FluentValidation input validation           │
   │  - Rate limiting (Redis token bucket)                │
   └──┬───────────┬────────────┬──────────────┬───────────┘
      │           │            │              │
      ▼           ▼            ▼              ▼
 ┌─────────┐ ┌─────────┐ ┌──────────┐ ┌────────────────┐
 │ Azure   │ │ Azure   │ │ Elastic- │ │ Azure          │
 │ SQL /   │ │ Blob    │ │ search   │ │ Cognitive      │
 │ Cosmos  │ │ Storage │ │ (search  │ │ Services       │
 │ (meta)  │ │ + CDN   │ │  index)  │ │ (Vision tags)  │
 └─────────┘ └─────────┘ └──────────┘ └────────────────┘
                  ▲              ▲
                  │              │
                  │   ┌──────────┴────────────┐
                  └───┤  Azure Function       │
                      │  (Blob Created event) │
                      │  1. Get image SAS     │
                      │  2. Call Vision API   │
                      │  3. Persist tags      │
                      │  4. Index in ES       │
                      └───────────────────────┘
```

## Components

| Concern            | Service                                    |
| ------------------ | ------------------------------------------ |
| Authentication     | Azure AD B2C                               |
| Authorization      | JWT claims + server middleware             |
| API                | Node.js (Express/Fastify) or .NET          |
| Image storage      | Azure Blob Storage + Azure CDN             |
| Image AI           | Azure Cognitive Services — Computer Vision |
| Metadata DB        | Azure SQL (relational) or Cosmos DB        |
| Search             | Elasticsearch (or Azure AI Search)         |
| Cache / rate limit | Azure Redis Cache                          |
| Realtime comments  | Azure Web PubSub or SignalR                |
| Background jobs    | Azure Functions                            |
| Observability      | Application Insights                       |

## Upload pipeline (creator)

1. Client requests `POST /api/photos/sas` → API returns time-limited
   write-only SAS URL.
2. Client `PUT`s file directly to Blob Storage (browser → blob, never
   through API).
3. Blob `Microsoft.Storage.BlobCreated` event fires Azure Function.
4. Function:
   - Generates thumbnail (Azure Function with `image-resizer`).
   - Calls Cognitive Services Vision `analyze` for tags + objects.
   - Inserts row into `photos` table.
   - Indexes document in `photos` Elasticsearch index.
5. Client polls `GET /api/photos/:id` until `status = "ready"`.

## Search pipeline (consumer)

1. Client `GET /api/search?q=...&page=...`.
2. API issues Elasticsearch `multi_match` across:
   `title^3, caption, location^2, people^2, tags^2`.
3. Results paginated; cached in Redis for 60s for hot queries.

## Security

- **Auth**: JWT validated against B2C JWKS on every request.
- **RBAC**: middleware reads `role` claim; route registers required role.
- **Ownership**: PATCH/DELETE handlers verify `photo.owner_id == sub`.
- **Uploads**: SAS URLs scoped to single blob, expire in 5 min,
  size + content-type checked server-side after upload.
- **Inputs**: Zod schemas on every endpoint; max lengths everywhere.
- **CORS**: locked to known SPA origins.
- **Rate limiting**: per-IP and per-user buckets in Redis.
- **CSP + HSTS**: enforced via App Service headers.
