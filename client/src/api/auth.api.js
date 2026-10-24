import api from "./axios";

/**
 * Auth API wrappers.
 * The axios response interceptor already returns response.data,
 * so every function here resolves to the backend body directly.
 */

/**
 * POST /auth/login
 * @param {{ email: string, password: string }} credentials
 * @returns {Promise<{ success: boolean, message: string, token: string, user: object, store: object|null }>}
 * The httpOnly cookie is set by the server; we never store the token ourselves.
 */
export const loginApi = (credentials) => api.post("/auth/login", credentials);

/**
 * POST /auth/logout
 * Server clears the cookie.
 */
export const logoutApi = () => api.post("/auth/logout");

/**
 * GET /auth/me
 * Used on page refresh to restore login state from the cookie.
 * A 401 here simply means "not logged in", so we skip the error toast.
 * @returns {Promise<{ success: boolean, user: object, store: object|null }>}
 */
export const getMeApi = () => api.get("/auth/me", { skipErrorToast: true });