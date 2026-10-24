import { Toaster } from "sonner";
import { AuthProvider } from "./context/AuthContext";
import { SidebarProvider } from "./context/SidebarContext";
import AppRoutes from "./routes/AppRoutes";

/**
 * App: wires the global providers around the routes.
 *
 * Order matters:
 *  - BrowserRouter is in main.jsx (outside), because AuthProvider and
 *    SidebarProvider both use router hooks (useNavigate, useLocation).
 *  - AuthProvider wraps everything so any page can call useAuth().
 *  - SidebarProvider is inside it; the sidebar state is only needed for
 *    logged-in pages, but keeping it here is simple and harmless.
 *  - <Toaster /> is mounted once; any file can call toast.success/error.
 */
export default function App() {
  return (
    <AuthProvider>
      <SidebarProvider>
        <AppRoutes />
        <Toaster position="top-right" richColors closeButton />
      </SidebarProvider>
    </AuthProvider>
  );
}