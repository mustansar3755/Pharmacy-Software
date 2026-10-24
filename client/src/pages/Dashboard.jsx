import { Link } from "react-router-dom";
import { AlertTriangle, PackageX, Pill, Truck } from "lucide-react";
import { useAuth } from "../context/AuthContext";

/**
 * Dashboard: landing page for the pharmacy admin.
 *
 * For now it shows a welcome message, quick links to the finished modules,
 * and placeholder cards for the alerts. The dashboard summary API
 * (expiring soon, low stock counts) does not exist yet, so we do NOT
 * invent numbers. The cards show "--" until the backend is ready.
 */

// Alert cards: values will come from the dashboard summary API later
const ALERT_CARDS = [
  {
    label: "Expiring Soon",
    hint: "Batches expiring within 60 days",
    icon: AlertTriangle,
    color: "bg-amber-50 text-amber-600",
  },
  {
    label: "Low Stock",
    hint: "Products at or below reorder level",
    icon: PackageX,
    color: "bg-rose-50 text-rose-600",
  },
];

// Shortcuts to the modules that are already working
const QUICK_LINKS = [
  { label: "Manage Products", path: "/products", icon: Pill },
  { label: "Manage Suppliers", path: "/suppliers", icon: Truck },
];

export default function Dashboard() {
  const { user, store } = useAuth();

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div>
        <h2 className="text-2xl font-bold text-slate-800">
          Welcome back{user?.name ? `, ${user.name}` : ""}
        </h2>
        <p className="text-sm text-slate-500">
          {store?.name
            ? `Here is an overview of ${store.name}.`
            : "Here is an overview of your pharmacy."}
        </p>
      </div>

      {/* Alert cards (values pending the dashboard API) */}
      <div className="grid gap-4 sm:grid-cols-2">
        {ALERT_CARDS.map(({ label, hint, icon: Icon, color }) => (
          <div
            key={label}
            className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg ${color}`}
            >
              <Icon size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">{label}</p>
              <p className="text-2xl font-bold text-slate-800">--</p>
              <p className="text-xs text-slate-400">{hint}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Quick links */}
      <div>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
          Quick Links
        </h3>
        <div className="grid gap-4 sm:grid-cols-2">
          {QUICK_LINKS.map(({ label, path, icon: Icon }) => (
            <Link
              key={path}
              to={path}
              className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 text-slate-700 shadow-sm transition-colors hover:border-teal-600 hover:text-teal-600"
            >
              <Icon size={20} />
              <span className="font-medium">{label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}