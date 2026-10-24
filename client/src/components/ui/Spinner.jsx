import { Loader2 } from "lucide-react";

/**
 * Spinner: reusable loading indicator.
 *
 * Usage:
 *   <Spinner />                  default (md)
 *   <Spinner size="lg" />        full-page loading
 *   <Spinner size="sm" className="text-white" />   inside a button
 *
 * The default color is teal (primary). Pass a text-* class to override it.
 */
const SIZES = {
  sm: 16,
  md: 24,
  lg: 40,
};

export default function Spinner({ size = "md", className = "text-teal-600" }) {
  return (
    <Loader2
      size={SIZES[size] ?? SIZES.md}
      className={`animate-spin ${className}`}
      aria-label="Loading"
      role="status"
    />
  );
}