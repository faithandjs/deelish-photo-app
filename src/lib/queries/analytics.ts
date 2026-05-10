import { useQuery, queryOptions } from "@tanstack/react-query";
import { apiFetch } from "../api";
import { authStore } from "../auth-store";

type CreatorStats = {
  user_id: string;
  photo_count: number;
  total_ratings: number;
  comment_count: number;
  updated_at: string;
};

export const creatorStatsQueryOptions = (userId: string) =>
  queryOptions({
    queryKey: ["analytics", userId],
    queryFn: () => apiFetch<CreatorStats>(`/analytics/stats/${userId}`, {}, authStore.getToken()),
    staleTime: 60_000, // stats don't need to be real-time
  });

export const useCreatorStats = (userId: string) => useQuery(creatorStatsQueryOptions(userId));
