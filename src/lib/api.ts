/**
 * API layer — currently backed by an in-browser mock store.
 *
 * REPLACE WITH AZURE BACKEND:
 * Each function below maps 1:1 to a REST endpoint documented in
 * /docs/api.md. To switch to a real backend, replace function
 * bodies with `fetch()` calls to your API. Component code does
 * not need to change.
 */

import { store } from "./mock-data";
function delay<T>(value: T, ms = 250): Promise<T> {
  return new Promise((r) => setTimeout(() => r(value), ms));
}

function uid(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

/* -------------------- Photos -------------------- */

export const api = {
  /** GET /api/photos?page=&pageSize=&q= */
  async listPhotos(
    opts: {
      page?: number;
      pageSize?: number;
      q?: string;
      ownerId?: string;
    } = {},
  ): Promise<PaginatedResult<Photo>> {
    const { page = 1, pageSize = 12, q, ownerId } = opts;
    let items = store.getPhotos();
    if (ownerId) items = items.filter((p) => p.ownerId === ownerId);
    if (q) {
      const needle = q.toLowerCase();
      // In production this hits Elasticsearch. Here: simple in-memory
      // search across title, caption, location, people, tags.
      items = items.filter((p) =>
        [p.title, p.caption, p.location, ...p.people, ...p.tags]
          .join(" ")
          .toLowerCase()
          .includes(needle),
      );
    }
    items = items.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
    const total = items.length;
    const start = (page - 1) * pageSize;
    return delay({
      items: items.slice(start, start + pageSize),
      page,
      pageSize,
      total,
    });
  },

  /** GET /api/photos/:id */
  async getPhoto(id: string): Promise<Photo | null> {
    return delay(store.getPhotos().find((p) => p.id === id) ?? null);
  },

  /**
   * POST /api/photos (multipart)
   * Production flow:
   *   1. Client requests SAS URL from API
   *   2. Client uploads directly to Azure Blob Storage
   *   3. Backend triggers Azure Cognitive Services for tags
   *   4. Backend persists metadata + tags to DB and indexes in Elasticsearch
   */
  async uploadPhoto(input: UploadPhotoInput, owner: User): Promise<Photo> {
    // For the demo we read the file as a data URL.
    const imageUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(input.file);
    });
    const photo: Photo = {
      id: uid("p"),
      ownerId: owner.id,
      ownerName: owner.displayName,
      ownerAvatarUrl: owner.avatarUrl,
      imageUrl,
      thumbnailUrl: imageUrl,
      title: input.title,
      caption: input.caption,
      location: input.location,
      people: input.people,
      // In production: tags would come from Azure Cognitive Services.
      // See /docs/notes/ai-tagging.md for the integration plan.
      tags: [],
      createdAt: new Date().toISOString(),
      ratingAvg: 0,
      ratingCount: 0,
      commentCount: 0,
    };
    store.setPhotos([photo, ...store.getPhotos()]);
    return delay(photo);
  },

  /** PATCH /api/photos/:id — owner only */
  async updatePhoto(id: string, patch: UpdatePhotoInput, actor: User): Promise<Photo> {
    const photos = store.getPhotos();
    const idx = photos.findIndex((p) => p.id === id);
    if (idx === -1) throw new Error("Photo not found");
    if (photos[idx].ownerId !== actor.id) {
      // Defence in depth — server enforces this too.
      throw new Error("Forbidden: you can only edit your own photos");
    }
    photos[idx] = { ...photos[idx], ...patch };
    store.setPhotos(photos);
    return delay(photos[idx]);
  },

  /** DELETE /api/photos/:id — owner only */
  async deletePhoto(id: string, actor: User): Promise<void> {
    const photos = store.getPhotos();
    const target = photos.find((p) => p.id === id);
    if (!target) throw new Error("Photo not found");
    if (target.ownerId !== actor.id) {
      throw new Error("Forbidden: you can only delete your own photos");
    }
    store.setPhotos(photos.filter((p) => p.id !== id));
    return delay(undefined);
  },

  /* -------------------- Comments -------------------- */

  /** GET /api/photos/:id/comments */
  async listComments(photoId: string): Promise<Comment[]> {
    return delay(
      store
        .getComments()
        .filter((c) => c.photoId === photoId)
        .sort((a, b) => +new Date(a.createdAt) - +new Date(b.createdAt)),
    );
  },

  /** POST /api/photos/:id/comments — auth required */
  async addComment(photoId: string, body: string, author: User): Promise<Comment> {
    const trimmed = body.trim();
    if (!trimmed) throw new Error("Comment cannot be empty");
    if (trimmed.length > 1000) throw new Error("Comment too long (max 1000)");
    const comment = {
      id: uid("c"),
      photoId,
      authorId: author.id,
      authorName: author.displayName,
      authorAvatarUrl: author.avatarUrl,
      body: trimmed,
      createdAt: new Date().toISOString(),
    } as Comment;
    store.setComments([...store.getComments(), comment]);

    // Bump comment counter on the photo for feed display.
    const photos = store.getPhotos();
    const idx = photos.findIndex((p) => p.id === photoId);
    if (idx >= 0) {
      photos[idx] = { ...photos[idx], commentCount: photos[idx].commentCount + 1 };
      store.setPhotos(photos);
    }
    return delay(comment);
  },

  /* -------------------- Ratings -------------------- */

  /** GET /api/photos/:id/ratings/me */
  async getMyRating(photoId: string, userId: string): Promise<number | null> {
    const r = store.getRatings().find((x) => x.photoId === photoId && x.userId === userId);
    return delay(r ? r.value : null);
  },

  /** PUT /api/photos/:id/ratings — auth required */
  async ratePhoto(photoId: string, value: number, user: User): Promise<Photo> {
    if (value < 1 || value > 5) throw new Error("Rating must be 1–5");
    const ratings = store.getRatings();
    const existingIdx = ratings.findIndex((r) => r.photoId === photoId && r.userId === user.id);
    if (existingIdx >= 0) ratings[existingIdx].value = value;
    else ratings.push({ photoId, userId: user.id, value });
    store.setRatings(ratings);

    // Recalc aggregate.
    const photos = store.getPhotos();
    const idx = photos.findIndex((p) => p.id === photoId);
    if (idx === -1) throw new Error("Photo not found");
    const photoRatings = ratings.filter((r) => r.photoId === photoId);
    const avg = photoRatings.reduce((s, r) => s + r.value, 0) / photoRatings.length;
    photos[idx] = {
      ...photos[idx],
      ratingAvg: Math.round(avg * 10) / 10,
      ratingCount: photoRatings.length,
    };
    store.setPhotos(photos);
    return delay(photos[idx]);
  },
};
