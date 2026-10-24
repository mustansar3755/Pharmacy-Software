import axios from "axios";
import { toast } from "sonner";

/**
 * Single configured axios instance for the whole app.
 * Every API file (auth.api.js, products.api.js, ...) imports THIS instance.
 *
 * - baseURL comes from .env (VITE_API_URL)
 * - withCredentials: true so the browser sends/receives the httpOnly "token" cookie
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  withCredentials: true,
  timeout: 15000,
});

/* ------------------------------------------------------------------ */
/* 401 handling                                                        */
/* ------------------------------------------------------------------ */

/**
 * This file lives outside React, so it can't use useNavigate().
 * AuthContext registers a callback here (clear user state + go to /login).
 * If nothing is registered we fall back to a hard redirect.
 */
let unauthorizedHandler = null;

export const setUnauthorizedHandler = (handler) => {
  unauthorizedHandler = handler;
};

/**
 * Endpoints where a 401 is EXPECTED and must not trigger a redirect/toast:
 *  - /auth/me    : the initial "am I logged in?" check on page load.
 *                  A 401 here just means "logged out", not "session expired".
 *  - /auth/login : a 401 means wrong credentials; the Login page handles it.
 */
const isAuthCheckUrl = (url = "") =>
  url.includes("/auth/me") || url.includes("/auth/login");

/* ------------------------------------------------------------------ */
/* Response interceptor                                                */
/* ------------------------------------------------------------------ */

api.interceptors.response.use(
  // Success: backend sends { success: true, ...data }, so we hand back
  // response.data directly. Callers get { products, pagination } etc.
  (response) => response.data,

  (error) => {
    const { response, config } = error;
    const url = config?.url || "";

    // Any request can opt out of the automatic toast:
    //   api.get("/x", { skipErrorToast: true })
    const skipToast = config?.skipErrorToast === true;

    // 1) No response at all: server down, CORS, timeout, offline
    if (!response) {
      if (!skipToast) {
        toast.error("Cannot reach the server. Check your connection.", {
          id: "network-error", // same id = no duplicate toasts stacking up
        });
      }
      return Promise.reject(error);
    }

    const { status, data } = response;
    // Backend error shape: { success: false, message }
    const message = data?.message || "Something went wrong. Please try again.";

    // 2) 401: not logged in / token expired
    if (status === 401 && !isAuthCheckUrl(url)) {
      toast.error("Session expired. Please log in again.", {
        id: "session-expired",
      });
      if (unauthorizedHandler) unauthorizedHandler();
      else window.location.href = "/login";
      return Promise.reject(error);
    }

    // 3) /auth/me 401 = just "logged out": stay silent, AuthContext handles it
    if (status === 401 && url.includes("/auth/me")) {
      return Promise.reject(error);
    }

    // 4) Everything else (400, 401 on login, 403, 404, 409, 5xx): show the
    //    backend's message. 403 also covers a deactivated store.
    if (!skipToast) {
      toast.error(message, { id: `${status}-${message}` });
    }

    return Promise.reject(error);
  },
);

export default api;
