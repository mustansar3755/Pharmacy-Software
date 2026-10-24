/**
 * Formatting helpers: tables, forms aur receipt me ek jaisa format dikhane ke liye.
 * Yahan sirf DISPLAY ka kaam hai. Stock/expiry ka status backend se aata hai,
 * wo yahan calculate nahi hota.
 */

/**
 * Paisa dikhane ke liye: formatCurrency(1250.5, "Rs.") -> "Rs. 1,250.50"
 * currency store.currency se aati hai (default "Rs.").
 */
export const formatCurrency = (amount, currency = "Rs.") => {
  const value = Number(amount);
  if (Number.isNaN(value)) return `${currency} 0.00`;
  return `${currency} ${value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

/** Quantity jaise whole numbers: 1500 -> "1,500" */
export const formatNumber = (value) => {
  const n = Number(value);
  return Number.isNaN(n) ? "0" : n.toLocaleString("en-US");
};

/**
 * ISO date -> "05 Mar 2026". Khali ya ghalat date par "-" dikhata hai.
 */
export const formatDate = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC", // expiry date ko local timezone se aage-peeche hone se bachata hai
  });
};

/**
 * ISO date -> "2026-03-05", <input type="date"> ki value ke liye
 * (batch edit modal me purani expiry date pehle se bharne ke kaam aayega).
 */
export const toInputDate = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
};

/**
 * Category ko ek standard shakal deta hai: " tABLET " -> "Tablet".
 * Backend category par exact match karta hai ("tablet" != "Tablet"),
 * is liye save karne se pehle aur filter bhejne se pehle yahi function lagayenge.
 */
export const normalizeCategory = (value = "") =>
  value
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());