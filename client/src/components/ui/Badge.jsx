/**
 * Badge: small colored pill for statuses.
 *
 * Two layers in one file:
 *  1. <Badge color="..."> : generic pill (any label, any color)
 *  2. <StockBadge /> and <ExpiryBadge /> : thin wrappers that map the
 *     backend's status strings to the right label and color.
 *
 * IMPORTANT: the status values come from the backend
 * (stockStatus, expiryStatus on every product/batch). The frontend does NOT
 * calculate them, it only displays them.
 *
 * Usage:
 *   <StockBadge status={product.stockStatus} />
 *   <ExpiryBadge status={batch.expiryStatus} />
 *   <Badge color="slate">Inactive</Badge>
 */

// Color styles follow the design system
const COLORS = {
  emerald: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  amber: "bg-amber-50 text-amber-700 ring-amber-500/30",
  rose: "bg-rose-50 text-rose-700 ring-rose-600/20",
  teal: "bg-teal-50 text-teal-700 ring-teal-600/20",
  slate: "bg-slate-100 text-slate-600 ring-slate-500/20",
};

// Small colored dot before the label (helps when colors are hard to tell apart)
const DOT_COLORS = {
  emerald: "bg-emerald-500",
  amber: "bg-amber-500",
  rose: "bg-rose-500",
  teal: "bg-teal-500",
  slate: "bg-slate-400",
};

/* ---------- 1. Generic badge ---------- */
export function Badge({ children, color = "slate", dot = true, className = "" }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset
        ${COLORS[color] ?? COLORS.slate} ${className}`}
    >
      {dot && (
        <span
          className={`h-1.5 w-1.5 rounded-full ${DOT_COLORS[color] ?? DOT_COLORS.slate}`}
        />
      )}
      {children}
    </span>
  );
}

/* ---------- 2. Status maps (backend value -> label + color) ---------- */
const STOCK_STATUS = {
  in_stock: { label: "In Stock", color: "emerald" },
  low_stock: { label: "Low Stock", color: "amber" },
  out_of_stock: { label: "Out of Stock", color: "rose" },
};

const EXPIRY_STATUS = {
  valid: { label: "Valid", color: "emerald" },
  expiring_soon: { label: "Expiring Soon", color: "amber" },
  expired: { label: "Expired", color: "rose" },
};

/** Stock level badge: in_stock | low_stock | out_of_stock */
export function StockBadge({ status }) {
  const config = STOCK_STATUS[status];
  // Unknown or missing status: show a neutral badge instead of crashing
  if (!config) return <Badge color="slate">Unknown</Badge>;
  return <Badge color={config.color}>{config.label}</Badge>;
}

/** Expiry badge: valid | expiring_soon | expired */
export function ExpiryBadge({ status }) {
  const config = EXPIRY_STATUS[status];
  if (!config) return <Badge color="slate">Unknown</Badge>;
  return <Badge color={config.color}>{config.label}</Badge>;
}

export default Badge;