import { useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

/**
 * Modal: reusable overlay dialog.
 *
 * Usage:
 *   <Modal
 *     open={open}
 *     onClose={() => setOpen(false)}
 *     title="Add Batch"
 *     size="md"
 *     footer={
 *       <>
 *         <Button variant="secondary" onClick={close}>Cancel</Button>
 *         <Button type="submit" form="batch-form">Save</Button>
 *       </>
 *     }
 *   >
 *     <form id="batch-form">...</form>
 *   </Modal>
 *
 * Tip: the footer sits OUTSIDE the <form>, so a submit button there must use
 * the "form" attribute (form="batch-form") to submit the form by its id.
 *
 * Features:
 *  - Rendered in a portal (document.body), so parent overflow/z-index
 *    can never clip it
 *  - Escape key and overlay click close it (can be disabled while saving)
 *  - Page scroll is locked while open
 *  - Body scrolls inside the modal; header and footer stay visible
 */
const SIZES = {
  sm: "max-w-sm",
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
};

export default function Modal({
  open,
  onClose,
  title,
  children,
  footer = null,
  size = "md",
  // Set to false while a request is running, so the user can't close
  // the modal halfway through saving
  closable = true,
}) {
  /* ---------- Escape key ---------- */
  useEffect(() => {
    if (!open || !closable) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, closable, onClose]);

  /* ---------- Scroll lock ---------- */
  useEffect(() => {
    if (!open) return;

    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 print:hidden"
      // Click on the dark area closes; clicks inside the dialog are stopped below
      onClick={closable ? onClose : undefined}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`flex max-h-[90vh] w-full flex-col rounded-xl bg-white shadow-xl ${
          SIZES[size] ?? SIZES.md
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-slate-200 px-5 py-4">
          <h2 className="text-lg font-semibold text-slate-800">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            disabled={!closable}
            className="rounded-md p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body: only this part scrolls */}
        <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>

        {/* Footer: action buttons */}
        {footer && (
          <div className="flex shrink-0 items-center justify-end gap-3 border-t border-slate-200 px-5 py-4">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}