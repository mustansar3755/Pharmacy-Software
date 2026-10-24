import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { useLocation } from "react-router-dom";

/**
 * SidebarContext: shared UI state for the sidebar.
 *
 * Why Context? The toggle button lives in the Topbar, but the sidebar itself
 * is a different component. Both need the same state without passing props
 * through DashboardLayout.
 *
 * Two separate states because desktop and mobile behave differently:
 *  - collapsed  (desktop, lg+): sidebar stays visible, shrinks to icons only
 *  - mobileOpen (below lg)    : sidebar is a hidden drawer that slides over the page
 *
 * IMPORTANT: uses useLocation(), so it must be rendered inside <BrowserRouter>.
 */
const SidebarContext = createContext(null);

export function SidebarProvider({ children }) {
  const location = useLocation();

  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Remember the last pathname we saw (used to detect navigation, see below)
  const [prevPath, setPrevPath] = useState(location.pathname);

  /**
   * Close the mobile drawer automatically after navigating to another page.
   *
   * We do this DURING render, not in useEffect. Calling setState while
   * rendering the SAME component is an official React pattern: React
   * discards the current render and re-runs it immediately with the new
   * state, so the user never sees a frame with the drawer still open and
   * there is no cascading effect render.
   * (https://react.dev/learn/you-might-not-need-an-effect)
   */
  if (prevPath !== location.pathname) {
    setPrevPath(location.pathname);
    setMobileOpen(false);
  }

  const toggleCollapsed = useCallback(() => setCollapsed((prev) => !prev), []);
  const openMobile = useCallback(() => setMobileOpen(true), []);
  const closeMobile = useCallback(() => setMobileOpen(false), []);

  const value = useMemo(
    () => ({
      collapsed,
      mobileOpen,
      toggleCollapsed,
      openMobile,
      closeMobile,
    }),
    [collapsed, mobileOpen, toggleCollapsed, openMobile, closeMobile]
  );

  return (
    <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>
  );
}

/**
 * Custom hook: const { collapsed, toggleCollapsed } = useSidebar();
 */
// eslint-disable-next-line react-refresh/only-export-components
export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used inside <SidebarProvider>");
  }
  return context;
};