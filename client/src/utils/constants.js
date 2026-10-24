/**
 * App-wide constants: dropdown options aur defaults ek hi jagah par.
 * Product list filters aur product form dono yahin se options lenge,
 * taake dono me ek jaisi values rahein.
 */

/**
 * Category suggestions.
 * Backend category par EXACT match karta hai ("Tablet" != "tablet"), is liye
 * form aur filter dono me yahi standard shakal use hogi (Title Case).
 * Form me user nayi category type bhi kar sakta hai, wo normalizeCategory()
 * se guzar kar save hogi.
 */
export const CATEGORY_SUGGESTIONS = [
  "Tablet",
  "Capsule",
  "Syrup",
  "Injection",
  "Drops",
  "Ointment",
  "Cream",
  "Inhaler",
  "Suppository",
  "Sachet",
  "Surgical",
  "Other",
];

/**
 * Filter dropdown options.
 * value "" ka matlab "koi filter nahi" (cleanParams isay query se hata deta hai).
 * Values backend ke strings se match karti hain.
 */
export const STOCK_FILTER_OPTIONS = [
  { value: "", label: "All Stock" },
  { value: "in_stock", label: "In Stock" },
  { value: "low_stock", label: "Low Stock" },
  { value: "out_of_stock", label: "Out of Stock" },
];

export const EXPIRY_FILTER_OPTIONS = [
  { value: "", label: "All Expiry" },
  { value: "valid", label: "Valid" },
  { value: "expiring_soon", label: "Expiring Soon" },
  { value: "expired", label: "Expired" },
];

/** Lists ka default page size (backend ka max 100 hai) */
export const DEFAULT_PAGE_SIZE = 10;

/** Search box ka debounce delay (ms) */
export const SEARCH_DEBOUNCE_MS = 400;