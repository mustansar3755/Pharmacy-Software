import { Routes, Route, Navigate } from "react-router-dom";

import ProtectedRoute from "./ProtectedRoute";
import RoleRoute, { getHomePath } from "./RoleRoute";
import { useAuth } from "../context/AuthContext";

import DashboardLayout from "../layouts/DashboardLayout";

import Login from "../pages/Login"; // built in step 13
import Dashboard from "../pages/Dashboard";
import Placeholder from "../pages/Placeholder";
import NotFound from "../pages/NotFound";

/**
 * HomeRedirect: handles the "/" URL.
 * It sits inside ProtectedRoute, so a user always exists here.
 * super_admin -> /admin/stores, admin -> /dashboard
 */
function HomeRedirect() {
  const { user } = useAuth();
  return <Navigate to={getHomePath(user.role)} replace />;
}

/**
 * Route tree (outer to inner):
 *
 *  /login                      public
 *  ProtectedRoute              must be logged in
 *    /                         redirect by role
 *    DashboardLayout           sidebar + topbar shell
 *      RoleRoute [admin]       pharmacy pages
 *      RoleRoute [super_admin] platform pages
 *  *                           404
 */
export default function AppRoutes() {
  return (
    <Routes>
      {/* ---------- Public ---------- */}
      <Route path="/login" element={<Login />} />

      {/* ---------- Private (login required) ---------- */}
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<HomeRedirect />} />

        <Route element={<DashboardLayout />}>
          {/* Pharmacy owner (admin) pages */}
          <Route element={<RoleRoute allowedRoles={["admin"]} />}>
            <Route path="/dashboard" element={<Dashboard />} />

            {/* Backend ready: real pages will replace these Placeholders
                (Products in step 15, Suppliers in step 16) */}
            <Route
              path="/products"
              element={<Placeholder title="Products" />}
            />
            <Route
              path="/suppliers"
              element={<Placeholder title="Suppliers" />}
            />

            {/* Backend NOT ready: Phase 2 */}
            <Route path="/pos" element={<Placeholder title="POS / Billing" />} />
            <Route
              path="/purchases"
              element={<Placeholder title="Purchases" />}
            />
            <Route
              path="/sales"
              element={<Placeholder title="Sales History" />}
            />
          </Route>

          {/* Platform owner (super_admin) pages */}
          <Route element={<RoleRoute allowedRoles={["super_admin"]} />}>
            <Route
              path="/admin/stores"
              element={<Placeholder title="Stores Management" />}
            />
          </Route>
        </Route>
      </Route>

      {/* ---------- 404 (no sidebar, full screen) ---------- */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}