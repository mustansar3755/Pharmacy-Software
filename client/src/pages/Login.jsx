import { useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { Pill, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { getHomePath } from "../routes/RoleRoute";
import Spinner from "../components/ui/Spinner";

/**
 * Login page (public).
 *
 * Flow:
 *  1. User submits email + password -> login() from AuthContext.
 *  2. On success, AuthContext sets the user, this component re-renders,
 *     and the <Navigate> below sends the user to the right page.
 *  3. On failure, the axios interceptor already shows the backend's error
 *     toast (e.g. "Invalid credentials"), so we only stop the spinner.
 */
export default function Login() {
  const { login, isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // ProtectedRoute stores the page the user originally wanted in state.from
  const from = location.state?.from?.pathname;

  // Session check still running (page refresh): avoid flashing the form
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <Spinner size="lg" />
      </div>
    );
  }

  // Already logged in (or just logged in): leave the login page.
  // Done during render with <Navigate>, no effect needed.
  // If the wanted page is not allowed for this role, RoleRoute redirects
  // to the role's home page, so this is safe.
  if (isAuthenticated) {
    return <Navigate to={from || getHomePath(user.role)} replace />;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    setSubmitting(true);
    try {
      const loggedInUser = await login({
        email: form.email.trim(),
        password: form.password,
      });
      toast.success(
        `Welcome${loggedInUser?.name ? `, ${loggedInUser.name}` : ""}!`,
      );
      // No navigate() here: the render-time <Navigate> above handles it.
    } catch {
      // Error toast is already shown by the axios interceptor.
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md">
        {/* Brand */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-xl bg-teal-600 text-white shadow-sm">
            <Pill size={28} />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">PharmaPOS</h1>
          <p className="mt-1 text-sm text-slate-500">
            Sign in to manage your pharmacy
          </p>
        </div>

        {/* Form card */}
        <form
          onSubmit={handleSubmit}
          className="space-y-5 rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
        >
          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              Email
            </label>
            <div className="relative">
              <Mail
                size={18}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                autoFocus
                required
                value={form.email}
                onChange={handleChange}
                placeholder="you@pharmacy.com"
                className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm text-slate-800 placeholder:text-slate-400 focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-600/20"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="password"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              Password
            </label>
            <div className="relative">
              <Lock
                size={18}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                value={form.password}
                onChange={handleChange}
                placeholder="Enter your password"
                className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-11 text-sm text-slate-800 placeholder:text-slate-400 focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-600/20"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-slate-400 hover:text-slate-600"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting}
            className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {submitting ? (
              <>
                <Spinner size="sm" className="text-white" />
                Signing in...
              </>
            ) : (
              "Sign In"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
