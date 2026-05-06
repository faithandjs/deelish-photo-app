/**
 * Shared domain types.
 * These mirror the API contract documented in /docs/api.md
 * and the database schema in /docs/schema.md.
 */

export type UserRole = "creator" | "consumer";

export interface User {
  id: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  role: UserRole;
}

export interface Photo {
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

export interface Comment {
  id: string;
  photoId: string;
  authorId: string;
  authorName: string;
  authorAvatarUrl?: string;
  body: string;
  createdAt: string;
}

export interface Rating {
  photoId: string;
  userId: string;
  /** 1–5 stars. */
  value: number;
}

export interface UploadPhotoInput {
  file: File;
  title: string;
  caption: string;
  location: string;
  people: string[];
}

export interface UpdatePhotoInput {
  title?: string;
  caption?: string;
  location?: string;
  people?: string[];
  tags?: string[];
}

export interface PaginatedResult<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
}
