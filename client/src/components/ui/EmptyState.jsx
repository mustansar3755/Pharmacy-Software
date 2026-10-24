import { Inbox } from "lucide-react";

/**
 * EmptyState: friendly message shown when a list has no records.
 *
 * Usage:
 *   <EmptyState
 *     icon={Pill}
 *     title="No products found"
 *     description="Try a different search, or add your first product."
 *     action={<Button leftIcon={<Plus size={16} />}>Add Product</Button>}
 *   />
 *
 * Typical place: the "emptyContent" prop of <TBody>.
 *
 * Note: "icon" takes the icon COMPONENT itself (Pill), not an element
 * (<Pill />), so this file controls its size and color.
 */
export default function EmptyState({
  icon: Icon = Inbox,
  title = "No records found",
  description,
  action = null, // optional button or link
}) {
  return (
    <div className="flex flex-col items-center justify-center px-4 py-6 text-center">
      <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400">
        <Icon size={28} />
      </div>
      <h3 className="text-base font-semibold text-slate-800">{title}</h3>
      {description && (
        <p className="mt-1 max-w-sm text-sm text-slate-500">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}