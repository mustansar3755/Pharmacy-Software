import { AlertTriangle } from "lucide-react";
import Modal from "./Modal";
import Button from "./Button";

/**
 * ConfirmDialog: "Are you sure?" popup built on top of Modal.
 * Used before risky actions such as deactivating a product or supplier.
 *
 * Usage:
 *   <ConfirmDialog
 *     open={!!target}
 *     onClose={() => setTarget(null)}
 *     onConfirm={handleDeactivate}   // can be async
 *     loading={deleting}
 *     title="Deactivate product?"
 *     message="Panadol will be hidden from the product list and POS."
 *     confirmText="Deactivate"
 *   />
 *
 * The parent owns the "loading" state. While loading is true the dialog
 * can't be closed and both buttons are disabled, so the action can't be
 * sent twice. The parent closes the dialog after onConfirm finishes.
 */
const TONES = {
  danger: {
    iconWrap: "bg-rose-50 text-rose-600",
    button: "danger",
  },
  warning: {
    iconWrap: "bg-amber-50 text-amber-600",
    button: "primary",
  },
};

export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title = "Are you sure?",
  message = "This action cannot be undone.",
  confirmText = "Confirm",
  cancelText = "Cancel",
  tone = "danger", // "danger" (rose) | "warning" (amber)
  loading = false,
}) {
  const style = TONES[tone] ?? TONES.danger;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      size="sm"
      // Block closing (Escape, overlay, X) while the request is running
      closable={!loading}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            {cancelText}
          </Button>
          <Button variant={style.button} onClick={onConfirm} loading={loading}>
            {confirmText}
          </Button>
        </>
      }
    >
      <div className="flex items-start gap-4">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${style.iconWrap}`}
        >
          <AlertTriangle size={20} />
        </div>
        <p className="pt-1.5 text-sm text-slate-600">{message}</p>
      </div>
    </Modal>
  );
}