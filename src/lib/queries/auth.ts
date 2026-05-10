import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "../api";
import { authStore } from "../auth-store";

type AuthResponse = {
  accessToken: string;
  user: {
    id: string;
    username: string;
    role: "creator" | "consumer";
    createdAt: string;
  };
};

// --- Register ---
export function useRegister() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: { username: string; password: string; role: "creator" | "consumer" }) =>
      apiFetch<AuthResponse>("/auth/register", {
        method: "POST",
        body: JSON.stringify(body),
      }),

    onSuccess: (data) => {
      authStore.setToken(data.accessToken);
      queryClient.setQueryData(["user"], data.user);
    },
  });
}

// --- Login ---
export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: { username: string; password: string }) =>
      apiFetch<AuthResponse>("/auth/login", {
        method: "POST",
        body: JSON.stringify(body),
      }),

    onSuccess: (data) => {
      authStore.setToken(data.accessToken);
      queryClient.setQueryData(["user"], data.user);
    },
  });
}

// --- Logout ---
export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => apiFetch("/auth/logout", { method: "POST" }, authStore.getToken()),

    onSuccess: () => {
      authStore.setToken(null);
      queryClient.clear(); // wipe all cached data on logout
    },
  });
}
