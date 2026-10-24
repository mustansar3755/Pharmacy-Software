import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * Home page for each role. Used for redirects after login
 * and when a user opens a section they are not allowed to see.
 *  - super_admin -> stores management panel
 *  - admin       -> pharmacy dashboard
 */
// eslint-disable-next-line react-refresh/only-export-components
export const getHomePath = (role) =>
  role === "super_admin" ? "/admin/stores" : "/dashboard";

/**
 * RoleRoute: restricts a group of routes to specific roles.
 * It must be used INSIDE <ProtectedRoute />, so a user always exists here.
 *
 * Usage in AppRoutes.jsx:
 *   <Route element={<ProtectedRoute />}>
 *     <Route element={<RoleRoute allowedRoles={["admin"]} />}>
 *       <Route path="/products" element={<ProductList />} />
 *     </Route>
 *     <Route element={<RoleRoute allowedRoles={["super_admin"]} />}>
 *       <Route path="/admin/stores" element={<Stores />} />
 *     </Route>
 *   </Route>
 *
 * Why this matters: the backend returns 403 for a super_admin on pharmacy
 * routes, so we stop the user in the frontend before any request is made.
 * (Backend checks stay the real security; this is for good UX.)
 *
 * @param {{ allowedRoles: string[] }} props
 */
export default function RoleRoute({ allowedRoles = [] }) {
  const { user } = useAuth();

  // Role not allowed: send the user to THEIR OWN home page
  // (not /login, since they are already logged in).
  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to={getHomePath(user?.role)} replace />;
  }

  return <Outlet />;
}