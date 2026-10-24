import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  ShoppingCart,
  Pill,
  Truck,
  PackagePlus,
  Receipt,
  Store,
  ChevronsLeft,
  ChevronsRight,
  X,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useSidebar } from "../context/SidebarContext";

/**
 * Menu definitions, one array per role.
 * To add a new page later, add one line here and the sidebar updates itself.
 * Paths match the routes we will define in AppRoutes.jsx.
 */
const ADMIN_MENU = [
  { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { label: "POS / Billing", path: "/pos", icon: ShoppingCart },
  { label: "Products", path: "/products", icon: Pill },
  { label: "Purchases", path: "/purchases", icon: PackagePlus },
  { label: "Suppliers", path: "/suppliers", icon: Truck },
  { label: "Sales History", path: "/sales", icon: Receipt },
];

const SUPER_ADMIN_MENU = [
  { label: "Stores", path: "/admin/stores", icon: Store },
];

export default function Sidebar() {
  const { isSuperAdmin } = useAuth();
  const { collapsed, mobileOpen, toggleCollapsed, closeMobile } = useSidebar();

  // Pick the menu based on role (super_admin never sees pharmacy links)
  const menu = isSuperAdmin ? SUPER_ADMIN_MENU : ADMIN_MENU;

  /**
   * "collapsed" only applies on desktop (lg+). On mobile the drawer always
   * shows full labels, so every collapsed-related class uses the lg: prefix.
   */
  const hideWhenCollapsed = collapsed ? "lg:hidden" : "";

  return (
    <>
      {/* Dark overlay behind the mobile drawer; tapping it closes the drawer */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-slate-900/50 lg:hidden"
          onClick={closeMobile}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-slate-200 bg-white
          transition-all duration-200
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
          lg:static lg:translate-x-0
          ${collapsed ? "lg:w-20" : "lg:w-64"}`}
      >
        {/* ---------- Brand / logo ---------- */}
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 px-4">
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-teal-600 text-white">
              <Pill size={20} />
            </div>
            <span
              className={`truncate text-lg font-bold text-slate-800 ${hideWhenCollapsed}`}
            >
              PharmaPOS
            </span>
          </div>

          {/* Close button: mobile drawer only */}
          <button
            type="button"
            onClick={closeMobile}
            className="rounded-md p-1 text-slate-500 hover:bg-slate-100 lg:hidden"
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        {/* ---------- Navigation links ---------- */}
        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {menu.map(({ label, path, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              // Tooltip is useful when only icons are visible
              title={collapsed ? label : undefined}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors
                ${collapsed ? "lg:justify-center" : ""}
                ${
                  isActive
                    ? "bg-teal-600 text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-800"
                }`
              }
            >
              <Icon size={20} className="shrink-0" />
              <span className={`truncate ${hideWhenCollapsed}`}>{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* ---------- Collapse toggle: desktop only ---------- */}
        <div className="hidden border-t border-slate-200 p-3 lg:block">
          <button
            type="button"
            onClick={toggleCollapsed}
            className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800
              ${collapsed ? "justify-center" : ""}`}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            title={collapsed ? "Expand sidebar" : undefined}
          >
            {collapsed ? (
              <ChevronsRight size={20} />
            ) : (
              <>
                <ChevronsLeft size={20} />
                <span>Collapse</span>
              </>
            )}
          </button>
        </div>
      </aside>
    </>
  );
}