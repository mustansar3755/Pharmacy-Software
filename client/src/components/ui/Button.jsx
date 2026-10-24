import { forwardRef } from "react";
import Spinner from "./Spinner";

/**
 * Button: reusable button used across the whole app.
 *
 * Variants (colors follow the design system):
 *  - primary   : teal, main action (Save, Add Product)
 *  - success   : emerald, positive action (Complete Bill)
 *  - danger    : rose, destructive action (Deactivate, Delete)
 *  - secondary : white with border, neutral action (Cancel)
 *  - ghost     : no background, low-emphasis action (icon buttons, links)
 *
 * Sizes: sm | md | lg
 *
 * Usage:
 *   <Button>Save</Button>
 *   <Button variant="danger" loading={deleting}>Deactivate</Button>
 *   <Button variant="secondary" size="sm" leftIcon={<Plus size={16} />}>Add</Button>
 *
 * forwardRef lets parents focus the button (useful for keyboard flows in POS).
 * Any other prop (onClick, type, title, ...) is passed straight to <button>.
 */
const VARIANTS = {
  primary: "bg-teal-600 text-white hover:bg-teal-700 focus-visible:outline-teal-600",
  success:
    "bg-emerald-600 text-white hover:bg-emerald-700 focus-visible:outline-emerald-600",
  danger: "bg-rose-600 text-white hover:bg-rose-700 focus-visible:outline-rose-600",
  secondary:
    "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 focus-visible:outline-teal-600",
  ghost: "text-slate-600 hover:bg-slate-100 focus-visible:outline-teal-600",
};

const SIZES = {
  sm: "px-3 py-1.5 text-xs gap-1.5",
  md: "px-4 py-2.5 text-sm gap-2",
  lg: "px-5 py-3 text-base gap-2",
};

// Spinner color: white on solid buttons, teal on light ones
const SPINNER_COLOR = {
  primary: "text-white",
  success: "text-white",
  danger: "text-white",
  secondary: "text-teal-600",
  ghost: "text-teal-600",
};

const Button = forwardRef(function Button(
  {
    children,
    variant = "primary",
    size = "md",
    loading = false,
    disabled = false,
    leftIcon = null,
    fullWidth = false,
    type = "button", // default "button" so it never submits a form by accident
    className = "",
    ...rest
  },
  ref
) {
  return (
    <button
      ref={ref}
      type={type}
      // Disabled while loading, so double-clicks can't send duplicate requests
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center rounded-lg font-semibold transition-colors
        disabled:cursor-not-allowed disabled:opacity-60
        ${VARIANTS[variant] ?? VARIANTS.primary}
        ${SIZES[size] ?? SIZES.md}
        ${fullWidth ? "w-full" : ""}
        ${className}`}
      {...rest}
    >
      {loading ? (
        <Spinner size="sm" className={SPINNER_COLOR[variant]} />
      ) : (
        leftIcon
      )}
      {children}
    </button>
  );
});

export default Button;