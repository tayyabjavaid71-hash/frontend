import axios from "axios";

export const API = axios.create({
  baseURL: "/api",
});

/**
 * Module-level token store.
 * AuthContext calls setApiToken() whenever the Supabase session changes.
 * This guarantees adminService always uses the exact token that belongs to
 * the currently logged-in user — never a stale or wrong session token.
 */
let _token: string | null = null;
export const setApiToken = (token: string | null) => { _token = token; };
export const getApiToken = () => _token;

// Attach the stored token to every outgoing request.
// Skip if a `user:` header is already present (demo / offline mode).
API.interceptors.request.use((config) => {
  if (config.headers?.["user"]) return config;   // demo fallback — leave as-is
  if (_token) {
    config.headers = config.headers ?? {};
    if (!config.headers["Authorization"]) {
      config.headers["Authorization"] = `Bearer ${_token}`;
    }
  }
  return config;
});
