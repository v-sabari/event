import axios from "axios";

// Single source of truth for the API base URL - replaces the 4x hardcoded
// "http://localhost:8080" strings that were duplicated across CreateEvent.jsx,
// Events.jsx, StudentDashboard.jsx, and FacultyDashboard.jsx.
export const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

const api = axios.create({
  baseURL: API_BASE_URL,
  // Without this, a slow or cold-starting backend (e.g. a free-tier host
  // spinning up from idle) just hangs indefinitely with zero feedback to
  // the user - it looks exactly like a broken/unresponsive button.
  timeout: 20000,
  headers: {
    "Content-Type": "application/json",
  },
});

// ---- token storage helpers (kept in one place instead of raw localStorage
// reads scattered across every page) ----
export const auth = {
  getAccessToken: () => localStorage.getItem("accessToken"),
  getRefreshToken: () => localStorage.getItem("refreshToken"),
  getUser: () => {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  },
  setSession: ({ accessToken, refreshToken, ...user }) => {
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);
    localStorage.setItem("user", JSON.stringify(user));
    // Kept for backward compatibility with any existing code still reading
    // localStorage.role / localStorage.name directly (Dashboard.jsx does).
    localStorage.setItem("role", user.role);
    localStorage.setItem("name", user.name);
    localStorage.setItem("token", accessToken);
  },
  clearSession: () => {
    ["accessToken", "refreshToken", "user", "role", "name", "token"].forEach((k) =>
      localStorage.removeItem(k)
    );
  },
  isLoggedIn: () => !!localStorage.getItem("accessToken"),
};

// Attach the access token to every request automatically.
api.interceptors.request.use((config) => {
  const token = auth.getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// On a 401, try exactly one silent refresh before giving up and logging out.
// Prevents every page from having to hand-roll its own refresh logic.
let refreshPromise = null;

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      auth.getRefreshToken() &&
      !originalRequest.url?.includes("/api/auth/")
    ) {
      originalRequest._retry = true;
      try {
        if (!refreshPromise) {
          refreshPromise = axios
            .post(`${API_BASE_URL}/api/auth/refresh`, {
              refreshToken: auth.getRefreshToken(),
            })
            .finally(() => {
              refreshPromise = null;
            });
        }
        const { data } = await refreshPromise;
        const session = data.data;
        auth.setSession(session);
        originalRequest.headers.Authorization = `Bearer ${session.accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        auth.clearSession();
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Small helper so pages can write `const msg = apiErrorMessage(err)` instead
// of each re-implementing the same `err.response?.data?.message` chain.
export function apiErrorMessage(error, fallback = "Something went wrong. Please try again.") {
  if (error?.code === "ECONNABORTED") {
    return "The server is taking too long to respond (it may be waking up from idle). Please try again in a moment.";
  }
  if (!error?.response) {
    return "Could not reach the server. Check your connection and try again.";
  }
  return error?.response?.data?.message || fallback;
}

export default api;
