import { Link } from "react-router-dom";
import { SearchX } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { getHomePath } from "../routes/RoleRoute";

/**
 * NotFound: shown for any URL that matches no route (404).
 * The button takes the user to THEIR home page (by role), or to /login
 * if they are not logged in.
 */
export default function NotFound() {
  const { user } = useAuth();
  const homePath = user ? getHomePath(user.role) : "/login";

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <div className="max-w-md text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-500">
          <SearchX size={32} />
        </div>
        <h1 className="text-4xl font-bold text-slate-800">404</h1>
        <p className="mt-2 text-slate-500">
          The page you are looking for does not exist.
        </p>
        <Link
          to={homePath}
          className="mt-6 inline-block rounded-lg bg-teal-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-teal-700"
        >
          {user ? "Go to Dashboard" : "Go to Login"}
        </Link>
      </div>
    </div>
  );
}