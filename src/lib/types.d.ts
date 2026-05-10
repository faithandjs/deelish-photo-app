// interface User {
//   id: string;
//   email: string;
//   displayName: string;
//   avatarUrl?: string;
//   role: UserRole;
// }

// interface Photo {
//   id: string;
//   ownerId: string;
//   ownerName: string;
//   ownerAvatarUrl?: string;
//   /** Azure Blob Storage URL (CDN-fronted in production). */
//   imageUrl: string;
//   thumbnailUrl: string;
//   title: string;
//   caption: string;
//   location: string;
//   /** People manually tagged by the creator. */
//   people: string[];
//   /** Tags from Azure Cognitive Services + manual additions. */
//   tags: string[];
//   createdAt: string;
//   /** Aggregate stats (denormalised for feed performance). */
//   ratingAvg: number;
//   ratingCount: number;
//   commentCount: number;
// }

// interface Comment {
//   id: string;
//   photoId: string;
//   authorId: string;
//   authorName: string;
//   authorAvatarUrl?: string;
//   body: string;
//   createdAt: string;
// }

// interface Rating {
//   photoId: string;
//   userId: string;
//   /** 1–5 stars. */
//   value: number;
// }

// interface UploadPhotoInput {
//   file: File;
//   title: string;
//   caption: string;
//   location: string;
//   people: string[];
// }

// interface UpdatePhotoInput {
//   title?: string;
//   caption?: string;
//   location?: string;
//   people?: string[];
//   tags?: string[];
// }

// interface PaginatedResult<T> {
//   items: T[];
//   page: number;
//   pageSize: number;
//   total: number;
// }

/**
 * Shared domain types.
 * Aligned to the real API contract in /docs/api.md
 */

type UserRole = "creator" | "consumer";

// ---------- Auth ----------
interface User {
  id: string;
  username: string; // API returns username, not email or displayName
  role: UserRole;
  createdAt: string;
}

// ---------- Media ----------
interface MediaItem {
  id: string;
  user_id: string;
  filename: string;
  original_name: string;
  mimetype: string;
  size: number;
  url: string;
  uploaded_at: string;
}

// ---------- Photo (Social service) ----------
interface Photo {
  id: string;
  media_id: string;
  user_id: string;
  username: string;
  url: string;
  title: string;
  caption: string | null;
  tags: string[];
  location: string | null;
  people: string[];
  created_at: string;
  avg_rating: number;
  rating_count: number;
  comment_count: number;
}

// ---------- Single photo (includes comments + user rating) ----------
interface SinglePhoto extends Photo {
  comments: Comment[];
  avgRating: number;
  ratingCount: number;
  userRating: number | null;
}

// ---------- Comment ----------
interface Comment {
  id: string;
  photo_id: string;
  user_id: string;
  username: string;
  body: string;
  created_at: string;
}

// ---------- Rating ----------
interface Rating {
  id: string;
  photo_id: string;
  user_id: string;
  value: 1 | 2 | 3 | 4 | 5;
  created_at: string;
}

// ---------- Analytics ----------
interface CreatorStats {
  user_id: string;
  photo_count: number;
  total_ratings: number;
  comment_count: number;
  updated_at: string;
}

// ---------- AI ----------
interface AIAnalysis {
  caption: string;
  tags: string[];
}

// ---------- Inputs ----------
interface UploadPhotoInput {
  file: File;
  title: string;
  caption?: string;
  location?: string;
  people?: string[];
  tags?: string[];
}

interface CreatePostInput {
  mediaId: string;
  url: string;
  title: string;
  caption?: string;
  tags?: string[];
  location?: string;
  people?: string[];
}

interface UpdatePhotoInput {
  title?: string;
  caption?: string;
  location?: string;
  people?: string[];
  tags?: string[];
}

// ---------- Pagination ----------
interface PaginatedResult<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

interface FeedResponse {
  photos: Photo[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface SearchResponse {
  results: SearchResult[];
  query: string;
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface SearchResult {
  photo_id: string;
  title: string;
  caption: string;
  tags: string[];
  location: string;
  people: string[];
  username: string;
  url: string;
  created_at: string;
  rank: number;
}
