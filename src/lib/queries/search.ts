import { useQuery, queryOptions } from "@tanstack/react-query";
import { apiFetch } from "../api";
import { authStore } from "../auth-store";

type SearchResult = {
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
};

type SearchResponse = {
  results: SearchResult[];
  query: string;
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export const searchQueryOptions = (q: string, page = 1) =>
  queryOptions({
    queryKey: ["search", q, page],
    queryFn: () =>
      apiFetch<SearchResponse>(
        `/search?q=${encodeURIComponent(q)}&page=${page}&limit=20`,
        {},
        authStore.getToken(),
      ),
    enabled: q.length > 1,
    staleTime: 30_000,
  });

export const useSearch = (q: string, page?: number) => useQuery(searchQueryOptions(q, page));
