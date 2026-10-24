import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Spinner from "../components/ui/Spinner";

/**
 * ProtectedRoute: guards every page that needs a logged-in user.
 *
 * Used as a layout route in AppRoutes.jsx:
 *   <Route element={<ProtectedRoute />}>
 *     ...private pages here...
 *   </Route>
 *
 * Flow:
 *  1. loading  -> /auth/me is still running, so show a spinner (do NOT redirect yet)
 *  2. no user  -> redirect to /login and remember where the user wanted to go
 *  3. user ok  -> render the child routes via <Outlet />
 */
export default function ProtectedRoute() {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  // Page refresh: wait for the session check to finish
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    // "state.from" lets the Login page send the user back after login.
    // "replace" stops the login page from piling up in browser history.
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}