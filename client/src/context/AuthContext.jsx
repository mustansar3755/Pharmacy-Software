import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";
import { loginApi, logoutApi, getMeApi } from "../api/auth.api";
import { setUnauthorizedHandler } from "../api/axios";

/**
 * AuthContext: single source of truth for "who is logged in".
 *
 * State:
 *  - user    : { _id, name, email, role: "super_admin" | "admin", ... } or null
 *  - store   : pharmacy store object (null for super_admin)
 *  - loading : true until the first /auth/me check finishes
 *
 * IMPORTANT: AuthProvider uses useNavigate(), so it must be rendered
 * INSIDE <BrowserRouter> (we'll do this in main.jsx).
 */
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [store, setStore] = useState(null);
  // Starts as true so ProtectedRoute waits for /auth/me before deciding
  const [loading, setLoading] = useState(true);

  /* ---------- Session restore on page load/refresh ---------- */
  useEffect(() => {
    // "ignore" flag: React StrictMode runs effects twice in dev, and this
    // stops a stale first call from overwriting state
    let ignore = false;

    const restoreSession = async () => {
      try {
        const data = await getMeApi();
        if (ignore) return;
        setUser(data.user);
        setStore(data.store ?? null);
      } catch {
        // 401 (not logged in) or server down: treat as logged out.
        // No toast here, the interceptor already stays silent for /auth/me.
        if (ignore) return;
        setUser(null);
        setStore(null);
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    restoreSession();
    return () => {
      ignore = true;
    };
  }, []);

  /* ---------- 401 handler for the axios interceptor ---------- */
  useEffect(() => {
    // Called by axios.js when ANY protected request returns 401
    // (token expired). We clear state and send the user to /login.
    setUnauthorizedHandler(() => {
      setUser(null);
      setStore(null);
      navigate("/login", { replace: true });
    });

    // Cleanup: if the provider unmounts, axios falls back to window.location
    return () => setUnauthorizedHandler(null);
  }, [navigate]);

  /* ---------- Actions ---------- */

  /**
   * Login: on success, saves user + store in state.
   * Errors are NOT caught here: the axios interceptor already toasts the
   * backend message, and the Login page can use try/catch to stop its
   * loading spinner.
   * Returns the logged-in user so the caller can redirect based on role.
   */
  const login = useCallback(async (credentials) => {
    const data = await loginApi(credentials);
    setUser(data.user);
    setStore(data.store ?? null);
    return data.user;
  }, []);

  /**
   * Logout: ask the server to clear the httpOnly cookie, then clear state.
   * "finally" ensures the UI logs out even if the request fails
   * (e.g. the cookie already expired).
   */
  const logout = useCallback(async () => {
    try {
      await logoutApi();
    } catch {
      // ignore: we log out locally regardless
    } finally {
      setUser(null);
      setStore(null);
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  /* ---------- Context value ---------- */
  const value = useMemo(
    () => ({
      user,
      store,
      loading,
      isAuthenticated: !!user,
      isSuperAdmin: user?.role === "super_admin",
      isAdmin: user?.role === "admin",
      login,
      logout,
      setStore, // later: update receipt header/footer after editing store settings
    }),
    [user, store, loading, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Custom hook: const { user, store, login, logout } = useAuth();
 * The error below catches the mistake of using it outside <AuthProvider>.
 */
// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside <AuthProvider>");
  }
  return context;
};