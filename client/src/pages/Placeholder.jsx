import { Construction } from "lucide-react";

/**
 * Placeholder: temporary screen for features whose backend is not ready yet
 * (Purchases, POS, Sales History, Stores panel).
 *
 * Usage in AppRoutes.jsx:
 *   <Route path="/pos" element={<Placeholder title="POS / Billing" />} />
 *
 * When the backend is ready, we replace the route's element with the real page.
 */
export default function Placeholder({ title = "Coming Soon" }) {
  return (
    <div className="flex h-full min-h-[60vh] items-center justify-center">
      <div className="max-w-md rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-amber-50 text-amber-500">
          <Construction size={28} />
        </div>
        <h2 className="text-xl font-semibold text-slate-800">{title}</h2>
        <p className="mt-2 text-sm text-slate-500">
          This section is under development and will be available once the
          backend is ready.
        </p>
      </div>
    </div>
  );
}