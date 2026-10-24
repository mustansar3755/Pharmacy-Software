import { forwardRef, useId } from "react";

/**
 * Input: reusable form field (label + input + hint/error message).
 *
 * Works for any <input> type: text, number, date, email, password, ...
 *
 * Usage:
 *   <Input label="Title" name="title" required value={v} onChange={fn} />
 *   <Input label="Sale Price" type="number" min="0" step="0.01"
 *          leftIcon={<Banknote size={18} />} error={errors.salePrice} />
 *   <Input label="Barcode" hint="Scan or type the barcode" />
 *
 * forwardRef lets a parent focus the field (e.g. barcode box in POS,
 * or the first field when a modal opens).
 * Any other prop (name, value, onChange, min, max, placeholder, autoFocus,
 * onKeyDown, ...) is passed straight to the <input>.
 */
const Input = forwardRef(function Input(
  {
    label,
    error, // error message string; also turns the border rose
    hint, // small helper text under the field (hidden when there is an error)
    leftIcon = null,
    required = false,
    id,
    className = "", // extra classes for the wrapper div
    inputClassName = "", // extra classes for the <input> itself
    ...rest
  },
  ref
) {
  // useId gives a unique id so label and input are linked even if the
  // parent forgets to pass one (click label = focus input)
  const autoId = useId();
  const inputId = id || autoId;

  return (
    <div className={className}>
      {label && (
        <label
          htmlFor={inputId}
          className="mb-1.5 block text-sm font-medium text-slate-700"
        >
          {label}
          {required && <span className="ml-0.5 text-rose-600">*</span>}
        </label>
      )}

      <div className="relative">
        {leftIcon && (
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            {leftIcon}
          </span>
        )}

        <input
          ref={ref}
          id={inputId}
          required={required}
          aria-invalid={error ? "true" : undefined}
          aria-describedby={error || hint ? `${inputId}-msg` : undefined}
          className={`w-full rounded-lg border bg-white py-2.5 pr-3 text-sm text-slate-800 placeholder:text-slate-400
            focus:outline-none focus:ring-2
            disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500
            ${leftIcon ? "pl-10" : "pl-3"}
            ${
              error
                ? "border-rose-600 focus:border-rose-600 focus:ring-rose-600/20"
                : "border-slate-200 focus:border-teal-600 focus:ring-teal-600/20"
            }
            ${inputClassName}`}
          {...rest}
        />
      </div>

      {/* Error replaces the hint, so only one message shows at a time */}
      {error ? (
        <p id={`${inputId}-msg`} className="mt-1 text-xs text-rose-600">
          {error}
        </p>
      ) : hint ? (
        <p id={`${inputId}-msg`} className="mt-1 text-xs text-slate-500">
          {hint}
        </p>
      ) : null}
    </div>
  );
});

export default Input;