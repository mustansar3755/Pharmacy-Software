import { useState } from "react";
import { Menu, LogOut, Store as StoreIcon, ShieldCheck } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useSidebar } from "../context/SidebarContext";

/**
 * Topbar: sticky header at the top of every dashboard page.
 *  - Left  : hamburger (mobile only) + store name (or "Platform Admin")
 *  - Right : user info + logout button
 */
export default function Topbar() {
  const { user, store, isSuperAdmin, logout } = useAuth();
  const { openMobile } = useSidebar();

  // Stops double-clicks on logout while the request is running
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    // logout() clears state and redirects to /login, even if the request fails
    await logout();
    // No need to reset loggingOut: this component unmounts after the redirect
  };

  // Fallbacks: if the backend user object has no "name", show the email
  const displayName = user?.name || user?.email || "User";
  const initial = displayName.charAt(0).toUpperCase();
  const roleLabel = isSuperAdmin ? "Super Admin" : "Store Admin";

  return (
    <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6">
      {/* ---------- Left side ---------- */}
      <div className="flex min-w-0 items-center gap-3">
        {/* Hamburger: opens the mobile drawer, hidden on desktop (lg+) */}
        <button
          type="button"
          onClick={openMobile}
          className="rounded-md p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
          aria-label="Open menu"
        >
          <Menu size={22} />
        </button>

        <div className="flex min-w-0 items-center gap-2">
          {isSuperAdmin ? (
            <ShieldCheck size={20} className="shrink-0 text-teal-600" />
          ) : (
            <StoreIcon size={20} className="shrink-0 text-teal-600" />
          )}
          <h1 className="truncate text-base font-semibold text-slate-800 sm:text-lg">
            {isSuperAdmin ? "Platform Admin" : store?.name || "My Pharmacy"}
          </h1>
        </div>
      </div>

      {/* ---------- Right side ---------- */}
      <div className="flex items-center gap-3">
        {/* User info: name/role text is hidden on very small screens */}
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-teal-600 text-sm font-semibold text-white">
            {initial}
          </div>
          <div className="hidden text-left sm:block">
            <p className="max-w-40 truncate text-sm font-medium leading-tight text-slate-800">
              {displayName}
            </p>
            <p className="text-xs leading-tight text-slate-500">{roleLabel}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          disabled={loggingOut}
          className="flex items-center cursor-pointer gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 disabled:cursor-not-allowed disabled:opacity-60"
          aria-label="Log out"
        >
          <LogOut size={18} />
          <span className="hidden sm:inline">
            {loggingOut ? "Logging out..." : "Logout"}
          </span>
        </button>
      </div>
    </header>
  );
}