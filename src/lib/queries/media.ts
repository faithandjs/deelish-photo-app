import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryOptions } from "@tanstack/react-query";
import { apiFetch } from "../api";
import { authStore } from "../auth-store";

type MediaItem = {
  id: string;
  user_id: string;
  filename: string;
  original_name: string;
  mimetype: string;
  size: number;
  url: string;
  uploaded_at: string;
};

// --- Query options (reusable, works with loaders too) ---
export const myUploadsQueryOptions = () =>
  queryOptions({
    queryKey: ["media", "my-uploads"],
    queryFn: () => apiFetch<MediaItem[]>("/media/my/uploads", {}, authStore.getToken()),
  });

export const photoMetaQueryOptions = (id: string) =>
  queryOptions({
    queryKey: ["media", id],
    queryFn: () => apiFetch<MediaItem>(`/media/${id}`, {}, authStore.getToken()),
  });

// --- Upload photo ---
export function useUploadPhoto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => {
      const fd = new FormData();
      fd.append("image", file);
      return apiFetch<MediaItem>(
        "/media/upload",
        { method: "POST", body: fd },
        authStore.getToken(),
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["media", "my-uploads"] });
    },
  });
}

// --- Update photo name ---
export function useUpdatePhotoName(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (originalName: string) =>
      apiFetch<{ id: string; original_name: string }>(
        `/media/${id}`,
        { method: "PATCH", body: JSON.stringify({ originalName }) },
        authStore.getToken(),
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["media", id] });
      queryClient.invalidateQueries({ queryKey: ["media", "my-uploads"] });
    },
  });
}

// --- Delete photo ---
export function useDeletePhoto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      apiFetch(`/media/${id}`, { method: "DELETE" }, authStore.getToken()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["media", "my-uploads"] });
    },
  });
}

// --- Hooks ---
export const useMyUploads = () => useQuery(myUploadsQueryOptions());
export const usePhotoMeta = (id: string) => useQuery(photoMetaQueryOptions(id));
