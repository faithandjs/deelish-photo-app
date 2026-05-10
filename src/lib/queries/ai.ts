import { useMutation } from "@tanstack/react-query";
import { apiFetch } from "../api";

type AIResult = { caption: string; tags: string[] };

export function useAnalyseImage() {
  return useMutation({
    mutationFn: (file: File) => {
      const fd = new FormData();
      fd.append("image", file);
      // No auth required per your API docs
      return apiFetch<AIResult>("/ai/analyse", { method: "POST", body: fd });
    },
  });
}
