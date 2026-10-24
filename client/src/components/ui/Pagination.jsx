import { ChevronLeft, ChevronRight } from "lucide-react";

/**
 * Pagination: footer control for paginated lists.
 * Takes the backend's pagination object directly:
 *   { page, limit, total, pages }
 *
 * Usage:
 *   <Pagination pagination={pagination} onPageChange={(p) => setPage(p)} />
 *
 * It renders nothing when there are no records, so empty lists stay clean.
 * With a single page it still shows the "Showing X to Y of Z" text, but
 * hides the page buttons.
 */

/**
 * Builds the list of page buttons, with "..." gaps for long ranges.
 * Example (current = 5, total = 10): [1, "...", 4, 5, 6, "...", 10]
 */
function getPageItems(current, totalPages) {
  // Few pages: show them all
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const items = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(totalPages - 1, current + 1);

  if (start > 2) items.push("...");
  for (let p = start; p <= end; p++) items.push(p);
  if (end < totalPages - 1) items.push("...");

  items.push(totalPages);
  return items;
}

export default function Pagination({ pagination, onPageChange }) {
  if (!pagination || !pagination.total) return null;

  const { page, limit, total, pages } = pagination;

  // "Showing 11 to 20 of 45"
  const from = (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  const baseBtn =
    "flex h-9 min-w-9 items-center justify-center rounded-lg px-2 text-sm font-medium transition-colors";

  return (
    <div className="flex flex-col items-center justify-between gap-3 py-4 sm:flex-row print:hidden">
      <p className="text-sm text-slate-500">
        Showing <span className="font-medium text-slate-700">{from}</span> to{" "}
        <span className="font-medium text-slate-700">{to}</span> of{" "}
        <span className="font-medium text-slate-700">{total}</span> results
      </p>

      {pages > 1 && (
        <nav className="flex items-center gap-1" aria-label="Pagination">
          {/* Previous */}
          <button
            type="button"
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            className={`${baseBtn} border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50`}
            aria-label="Previous page"
          >
            <ChevronLeft size={18} />
          </button>

          {/* Page numbers */}
          {getPageItems(page, pages).map((item, index) =>
            item === "..." ? (
              <span
                key={`gap-${index}`}
                className="flex h-9 w-6 items-center justify-center text-slate-400"
              >
                ...
              </span>
            ) : (
              <button
                key={item}
                type="button"
                onClick={() => onPageChange(item)}
                aria-current={item === page ? "page" : undefined}
                className={`${baseBtn} ${
                  item === page
                    ? "bg-teal-600 text-white"
                    : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                {item}
              </button>
            )
          )}

          {/* Next */}
          <button
            type="button"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= pages}
            className={`${baseBtn} border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50`}
            aria-label="Next page"
          >
            <ChevronRight size={18} />
          </button>
        </nav>
      )}
    </div>
  );
}