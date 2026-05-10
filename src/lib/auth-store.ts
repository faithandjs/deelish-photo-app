// src/lib/auth-store.ts
// Simple token store — swap for zustand/context if you already have one
let _token: string | null = null;

export const authStore = {
  getToken: () => _token,
  setToken: (t: string | null) => {
    _token = t;
  },
};
