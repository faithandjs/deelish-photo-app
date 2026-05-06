# AI Tagging — Implementation Notes

> Status: **deferred**. The schema, API, and UI all support tags
> today (creators can edit them manually). This doc captures the full
> plan so the AI step can be added without changing contracts.

## Goal

Automatically generate descriptive tags for every uploaded photo so
consumers can search with natural words ("sunset", "dog", "mountain")
without creators having to type them.

## Provider: Azure AI Vision (Computer Vision v4)

- Endpoint: `POST {endpoint}/computervision/imageanalysis:analyze`
- API version: `2024-02-01`
- Features requested: `tags,objects,read,caption`
- Pricing tier: S1 (10 TPS, ~$1 per 1000 transactions).

Why Azure Vision:
- Fits the rest of the Azure stack (single subscription, AAD identity).
- `tags` come pre-scored with confidence (0..1).
- Optional `caption` can populate a fallback caption when creator leaves it blank.
- `read` (OCR) is useful for posters / documents.

## Trigger: Blob Created event → Azure Function

```text
[Blob: originals/{yyyy}/{mm}/{uuid}.jpg]
        │
        ▼  Microsoft.Storage.BlobCreated
[Azure Function: tag-image]
        │  1. Generate read-SAS for the new blob
        │  2. POST to Vision /analyze with imageUrl
        │  3. Filter tags: confidence ≥ 0.65, max 15
        │  4. UPSERT into `tags`, INSERT into `photo_tags` (source='ai')
        │  5. Update Elasticsearch document
        │  6. Set photos.status = 'ready'
        ▼
[DB + Elasticsearch updated]
```

## Function (TypeScript) — sketch

```ts
import type { AzureFunction, Context } from "@azure/functions";
import { BlobServiceClient } from "@azure/storage-blob";

const VISION_ENDPOINT = process.env.VISION_ENDPOINT!;
const VISION_KEY = process.env.VISION_KEY!;
const MIN_CONFIDENCE = 0.65;
const MAX_TAGS = 15;

export const handler: AzureFunction = async (ctx: Context, blob: Buffer) => {
  const blobUrl = ctx.bindingData.uri as string;

  const res = await fetch(
    `${VISION_ENDPOINT}/computervision/imageanalysis:analyze` +
      `?api-version=2024-02-01&features=tags,caption`,
    {
      method: "POST",
      headers: {
        "Ocp-Apim-Subscription-Key": VISION_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ url: blobUrl }),
    },
  );
  if (!res.ok) throw new Error(`Vision ${res.status}: ${await res.text()}`);

  const data = await res.json();
  const tags: string[] = (data.tagsResult?.values ?? [])
    .filter((t: any) => t.confidence >= MIN_CONFIDENCE)
    .slice(0, MAX_TAGS)
    .map((t: any) => t.name.toLowerCase());

  await persistTags(ctx.bindingData.name, tags);
};
```

## Manual override

Creators can add/remove tags in the edit screen at any time. The
`photo_tags.source` column distinguishes `ai` vs `manual` — useful for
analytics ("how often do creators correct AI tags?") and for re-running
inference without losing user edits.

## Re-tagging

If we change models or thresholds, run a backfill:
- Queue all photos with `source='ai'` into Service Bus.
- Worker function calls Vision again, replaces only `source='ai'` rows.
- Manual tags are preserved.

## Observability

- Application Insights custom event `ai.tagging.completed`
  with `{ photoId, tagCount, latencyMs }`.
- Alert if `failure_rate > 5%` over 15 min.

## Cost guardrails

- Hard limit: don't process blobs > 20 MB (Vision limit is 20 MB anyway).
- Daily budget alarm at $X via Cost Management.
- Reject obvious abuse on the upload endpoint (rate limit per user).
