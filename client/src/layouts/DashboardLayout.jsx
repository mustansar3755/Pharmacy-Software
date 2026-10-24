import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

/**
 * DashboardLayout: the shell shared by every logged-in page.
 *
 *  ┌──────────┬──────────────────────┐
 *  │          │ Topbar               │
 *  │ Sidebar  ├──────────────────────┤
 *  │          │ <Outlet /> (page)    │
 *  └──────────┴──────────────────────┘
 *
 * Used as a layout route in AppRoutes.jsx:
 *   <Route element={<DashboardLayout />}>
 *     <Route path="/products" element={<ProductList />} />
 *   </Route>
 *
 * The "print:" classes hide the shell when printing, so the 80mm receipt
 * (Phase 2) will show only the invoice and no sidebar or topbar.
 */
export default function DashboardLayout() {
  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* Sidebar: fixed drawer on mobile, static column on desktop */}
      <div className="print:hidden">
        <Sidebar />
      </div>

      {/* Right side: topbar on top, scrollable page content below */}
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="print:hidden">
          <Topbar />
        </div>

        {/* Only this area scrolls, so the topbar and sidebar stay in place */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 print:overflow-visible print:p-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}