import {
  useMutation,
  useQuery,
  useQueryClient,
  queryOptions,
  infiniteQueryOptions,
} from "@tanstack/react-query";
import { apiFetch } from "../api";
import { authStore } from "../auth-store";

type Photo = {
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
};

type SinglePhoto = Photo & {
  comments: {
    id: string;
    photo_id: string;
    user_id: string;
    username: string;
    body: string;
    created_at: string;
  }[];
  avgRating: number;
  ratingCount: number;
  userRating: number;
};

type FeedResponse = {
  photos: Photo[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

// --- Query options ---
export const feedQueryOptions = (page = 1) =>
  queryOptions({
    queryKey: ["social", "feed", page],
    queryFn: () =>
      apiFetch<FeedResponse>(`/social/photos?page=${page}&limit=20`, {}, authStore.getToken()),
  });

export const singlePhotoQueryOptions = (id: string) =>
  queryOptions({
    queryKey: ["social", "photo", id],
    queryFn: () => apiFetch<SinglePhoto>(`/social/photos/${id}`, {}, authStore.getToken()),
  });

export const searchPhotosQueryOptions = (q: string, page = 1) =>
  queryOptions({
    queryKey: ["social", "search", q, page],
    queryFn: () =>
      apiFetch<FeedResponse>(
        `/social/photos/search?q=${encodeURIComponent(q)}&page=${page}&limit=20`,
        {},
        authStore.getToken(),
      ),
    enabled: q.length > 0,
  });

// --- Hooks ---
export const useFeed = (page?: number) => useQuery(feedQueryOptions(page));
export const useSinglePhoto = (id: string) => useQuery(singlePhotoQueryOptions(id));
export const useSearchPhotos = (q: string, page?: number) =>
  useQuery(searchPhotosQueryOptions(q, page));

// --- Create post ---
export function useCreatePost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: {
      mediaId: string;
      url: string;
      title: string;
      caption?: string;
      tags?: string[];
      location?: string;
      people?: string[];
    }) =>
      apiFetch<Photo>(
        "/social/photos",
        {
          method: "POST",
          body: JSON.stringify(body),
        },
        authStore.getToken(),
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["social", "feed"] });
    },
  });
}

// --- Add comment ---
export function useAddComment(photoId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: string) =>
      apiFetch(
        `/social/photos/${photoId}/comment`,
        {
          method: "POST",
          body: JSON.stringify({ body }),
        },
        authStore.getToken(),
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["social", "photo", photoId] });
    },
  });
}

// --- Rate photo ---
export function useRatePhoto(photoId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (value: 1 | 2 | 3 | 4 | 5) =>
      apiFetch(
        `/social/photos/${photoId}/rate`,
        {
          method: "POST",
          body: JSON.stringify({ value }),
        },
        authStore.getToken(),
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["social", "photo", photoId] });
      queryClient.invalidateQueries({ queryKey: ["social", "feed"] });
    },
  });
}

// --- Delete post ---
export function useDeletePost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiFetch(`/social/photos/${id}`, { method: "DELETE" }, authStore.getToken()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["social", "feed"] });
    },
  });
}
