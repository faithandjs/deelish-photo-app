# Pixly

A modern photo-sharing platform with two distinct roles.

- **Creator** — upload, tag, manage a photo library.
- **Consumer** — browse, search, rate, comment.

## This repo

Production-ready React + TypeScript + Tailwind frontend, wired against
a typed API layer (`src/lib/api.ts`). The current implementation uses
an in-browser mock store so you can preview both roles immediately.

To plug into the real backend, replace each function in `src/lib/api.ts`
with `fetch()` calls to the endpoints documented in [`docs/api.md`](docs/api.md).
The component layer doesn't need to change.

## Demo

The login page lets you sign in as a Creator or a Consumer with one
click. State persists in localStorage. In production this single button
becomes Azure AD B2C `loginRedirect`.

## Docs

- [`docs/architecture.md`](docs/architecture.md) — system diagram & components
- [`docs/schema.md`](docs/schema.md) — Azure SQL DDL + Elasticsearch index
- [`docs/api.md`](docs/api.md) — REST contract
- [`docs/notes/ai-tagging.md`](docs/notes/ai-tagging.md) — AI tagging plan (deferred)

## Routes

| Path                       | Role        | Purpose                                   |
| -------------------------- | ----------- | ----------------------------------------- |
| `/`                        | public      | Landing page                              |
| `/login`                   | public      | Role-pick (B2C in prod)                   |
| `/feed`                    | public      | Paginated browse                          |
| `/search`                  | public      | Full-text search                          |
| `/photo/:id`               | public      | Photo detail + comments + ratings         |
| `/dashboard`               | **creator** | Library management + stats                |
| `/upload`                  | **creator** | Upload form                               |
| `/photo/:id/edit`          | **creator** | Edit metadata + tags (owner only)         |
| `/unauthorized`            | public      | Shown when role check fails               |

## Security model

RBAC enforced at three layers:

1. **Route guards** — `<RequireRole role="creator">` in `src/lib/auth.tsx`.
2. **UI conditionals** — header hides creator nav for consumers.
3. **API handlers** — every PATCH/DELETE re-checks `photo.owner_id == sub`
   server-side (see `src/lib/api.ts` for the contract).
