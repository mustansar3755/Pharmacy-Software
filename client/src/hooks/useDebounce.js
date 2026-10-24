import { useEffect, useState } from "react";

/**
 * useDebounce: value ko thori der (delay ms) tak rok kar return karta hai.
 *
 * Usage:
 *   const [search, setSearch] = useState("");
 *   const debouncedSearch = useDebounce(search, 400);
 *   // API call debouncedSearch par chalegi, har keystroke par nahi.
 */
export default function useDebounce(value, delay = 400) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    // setState timeout ke andar hai (synchronous nahi), is liye lint rule theek rehta hai
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer); // naya keystroke aaye to purana timer cancel
  }, [value, delay]);

  return debounced;
}