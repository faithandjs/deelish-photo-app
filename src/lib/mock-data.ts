/**
 * Mock data store — replace with real Azure-backed API client.
 * Persists to localStorage so the demo survives reloads.
 *
 * Production swap-out: see src/lib/api.ts — every function here has
 * a 1:1 counterpart in the documented REST contract (/docs/api.md).
 */

import type { Comment, Photo, Rating, User } from "./types";

const SEED_PHOTOS: Photo[] = [
  {
    id: "p_1",
    ownerId: "u_creator",
    ownerName: "Maya Chen",
    imageUrl:
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1600&q=80",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=70",
    title: "Alpine Solitude",
    caption: "First light over the Dolomites — three hours of switchbacks well spent.",
    location: "Dolomites, Italy",
    people: [],
    tags: ["mountain", "sunrise", "landscape", "snow", "outdoor"],
    createdAt: "2025-04-12T07:14:00Z",
    ratingAvg: 4.7,
    ratingCount: 23,
    commentCount: 4,
  },
  {
    id: "p_2",
    ownerId: "u_creator",
    ownerName: "Maya Chen",
    imageUrl:
      "https://images.unsplash.com/photo-1493514789931-586cb221d7a7?w=1600&q=80",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1493514789931-586cb221d7a7?w=600&q=70",
    title: "Tokyo After Rain",
    caption: "Neon reflections in Shinjuku puddles.",
    location: "Shinjuku, Tokyo",
    people: ["Kenji Watanabe"],
    tags: ["city", "neon", "night", "street", "japan"],
    createdAt: "2025-03-28T22:01:00Z",
    ratingAvg: 4.9,
    ratingCount: 41,
    commentCount: 7,
  },
  {
    id: "p_3",
    ownerId: "u_creator2",
    ownerName: "Ava Romero",
    imageUrl:
      "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1600&q=80",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=600&q=70",
    title: "Golden Hour",
    caption: "The forest got quiet right at 18:42.",
    location: "Olympic National Park, WA",
    people: [],
    tags: ["forest", "golden hour", "nature", "trees", "light"],
    createdAt: "2025-04-30T18:42:00Z",
    ratingAvg: 4.4,
    ratingCount: 12,
    commentCount: 2,
  },
  {
    id: "p_4",
    ownerId: "u_creator2",
    ownerName: "Ava Romero",
    imageUrl:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1600&q=80",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=600&q=70",
    title: "Coastal Drift",
    caption: "Long exposure on the Oregon coast.",
    location: "Cannon Beach, Oregon",
    people: [],
    tags: ["ocean", "long exposure", "coast", "rocks", "blue hour"],
    createdAt: "2025-05-02T20:15:00Z",
    ratingAvg: 4.6,
    ratingCount: 18,
    commentCount: 3,
  },
  {
    id: "p_5",
    ownerId: "u_creator",
    ownerName: "Maya Chen",
    imageUrl:
      "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1600&q=80",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=600&q=70",
    title: "Glacier Lake",
    caption: "Glassy water, no wind, no people.",
    location: "Banff, Canada",
    people: [],
    tags: ["lake", "mountain", "reflection", "wilderness", "calm"],
    createdAt: "2025-02-18T11:00:00Z",
    ratingAvg: 4.8,
    ratingCount: 33,
    commentCount: 5,
  },
  {
    id: "p_6",
    ownerId: "u_creator2",
    ownerName: "Ava Romero",
    imageUrl:
      "https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=1600&q=80",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=600&q=70",
    title: "Late Night Diner",
    caption: "Hopper would have liked this booth.",
    location: "Brooklyn, NY",
    people: ["Sam Park", "Lia Brooks"],
    tags: ["diner", "people", "night", "warm", "documentary"],
    createdAt: "2025-04-08T01:30:00Z",
    ratingAvg: 4.3,
    ratingCount: 9,
    commentCount: 2,
  },
];

const SEED_COMMENTS: Comment[] = [
  {
    id: "c_1",
    photoId: "p_2",
    authorId: "u_consumer",
    authorName: "Jordan Lee",
    body: "The reflection is unreal. What lens?",
    createdAt: "2025-03-29T09:00:00Z",
  },
  {
    id: "c_2",
    photoId: "p_2",
    authorId: "u_creator2",
    authorName: "Ava Romero",
    body: "Saving this for inspiration.",
    createdAt: "2025-03-29T11:22:00Z",
  },
];

const KEY_PHOTOS = "pixly:photos";
const KEY_COMMENTS = "pixly:comments";
const KEY_RATINGS = "pixly:ratings";
const KEY_USER = "pixly:user";

function isBrowser() {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

function load<T>(key: string, fallback: T): T {
  if (!isBrowser()) return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function save<T>(key: string, value: T) {
  if (!isBrowser()) return;
  localStorage.setItem(key, JSON.stringify(value));
}

export const store = {
  getPhotos(): Photo[] {
    return load<Photo[]>(KEY_PHOTOS, SEED_PHOTOS);
  },
  setPhotos(photos: Photo[]) {
    save(KEY_PHOTOS, photos);
  },
  getComments(): Comment[] {
    return load<Comment[]>(KEY_COMMENTS, SEED_COMMENTS);
  },
  setComments(comments: Comment[]) {
    save(KEY_COMMENTS, comments);
  },
  getRatings(): Rating[] {
    return load<Rating[]>(KEY_RATINGS, []);
  },
  setRatings(ratings: Rating[]) {
    save(KEY_RATINGS, ratings);
  },
  getUser(): User | null {
    return load<User | null>(KEY_USER, null);
  },
  setUser(user: User | null) {
    save(KEY_USER, user);
  },
};

export const DEMO_USERS: Record<string, User> = {
  creator: {
    id: "u_creator",
    email: "maya@pixly.app",
    displayName: "Maya Chen",
    role: "creator",
  },
  consumer: {
    id: "u_consumer",
    email: "jordan@pixly.app",
    displayName: "Jordan Lee",
    role: "consumer",
  },
};
