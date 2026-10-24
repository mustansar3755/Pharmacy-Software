import { forwardRef, useId } from "react";
import { ChevronDown } from "lucide-react";

/**
 * Select: reusable dropdown (label + select + hint/error).
 * Input.jsx ke saath same look, taake forms aur filters ek jaise dikhein.
 *
 * Usage (options array ke saath):
 *   <Select
 *     label="Stock"
 *     value={stock}
 *     onChange={(e) => setStock(e.target.value)}
 *     options={STOCK_FILTER_OPTIONS}   // [{ value, label }]
 *   />
 *
 * Usage (apne <option> children ke saath):
 *   <Select label="Payment">
 *     <option value="cash">Cash</option>
 *   </Select>
 *
 * forwardRef + ...rest: ref, value, onChange, name, disabled, etc.
 * seedha asli <select> tak pohanchte hain.
 */
const Select = forwardRef(function Select(
  {
    label,
    error,
    hint,
    options = null, // [{ value, label }]; null ho to children use honge
    required = false,
    id,
    className = "", // wrapper div ke liye
    selectClassName = "", // <select> ke liye
    children,
    ...rest
  },
  ref
) {
  // useId: label aur select ko khud-ba-khud link karta hai
  const autoId = useId();
  const selectId = id || autoId;

  return (
    <div className={className}>
      {label && (
        <label
          htmlFor={selectId}
          className="mb-1.5 block text-sm font-medium text-slate-700"
        >
          {label}
          {required && <span className="ml-0.5 text-rose-600">*</span>}
        </label>
      )}

      <div className="relative">
        <select
          ref={ref}
          id={selectId}
          required={required}
          aria-invalid={error ? "true" : undefined}
          aria-describedby={error || hint ? `${selectId}-msg` : undefined}
          className={`w-full appearance-none rounded-lg border bg-white py-2.5 pl-3 pr-10 text-sm text-slate-800
            focus:outline-none focus:ring-2
            disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500
            ${
              error
                ? "border-rose-600 focus:border-rose-600 focus:ring-rose-600/20"
                : "border-slate-200 focus:border-teal-600 focus:ring-teal-600/20"
            }
            ${selectClassName}`}
          {...rest}
        >
          {options
            ? options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))
            : children}
        </select>

        {/* appearance-none se browser ka arrow hat gaya, apna arrow lagaya */}
        <ChevronDown
          size={18}
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
        />
      </div>

      {error ? (
        <p id={`${selectId}-msg`} className="mt-1 text-xs text-rose-600">
          {error}
        </p>
      ) : hint ? (
        <p id={`${selectId}-msg`} className="mt-1 text-xs text-slate-500">
          {hint}
        </p>
      ) : null}
    </div>
  );
});

export default Select;