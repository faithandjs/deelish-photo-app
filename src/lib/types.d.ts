/**
 * Shared domain types.
 * These mirror the API contract documented in /docs/api.md
 * and the database schema in /docs/schema.md.
 */

type UserRole = "creator" | "consumer";

interface User {
  id: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  role: UserRole;
}

interface Photo {
  id: string;
  ownerId: string;
  ownerName: string;
  ownerAvatarUrl?: string;
  /** Azure Blob Storage URL (CDN-fronted in production). */
  imageUrl: string;
  thumbnailUrl: string;
  title: string;
  caption: string;
  location: string;
  /** People manually tagged by the creator. */
  people: string[];
  /** Tags from Azure Cognitive Services + manual additions. */
  tags: string[];
  createdAt: string;
  /** Aggregate stats (denormalised for feed performance). */
  ratingAvg: number;
  ratingCount: number;
  commentCount: number;
}

interface Comment {
  id: string;
  photoId: string;
  authorId: string;
  authorName: string;
  authorAvatarUrl?: string;
  body: string;
  createdAt: string;
}

interface Rating {
  photoId: string;
  userId: string;
  /** 1–5 stars. */
  value: number;
}

interface UploadPhotoInput {
  file: File;
  title: string;
  caption: string;
  location: string;
  people: string[];
}

interface UpdatePhotoInput {
  title?: string;
  caption?: string;
  location?: string;
  people?: string[];
  tags?: string[];
}

interface PaginatedResult<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
}
