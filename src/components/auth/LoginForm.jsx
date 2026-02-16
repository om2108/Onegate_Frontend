// src/components/auth/LoginForm.jsx (replace your existing LoginForm)
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loginUser } from "../../api/auth";
import { useAuth } from "../../context/AuthContext";
import { setAuthToken } from "../../api/api";
const bgImage =
  "https://res.cloudinary.com/dopjyimaq/image/upload/f_auto,q_auto/v1771076809/t_dogf8x.jpg";

export default function LoginForm() {
  const { setUser } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: "", password: "" });
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const res = await loginUser({ ...form, rememberMe });
      localStorage.setItem("token", res.token);
      setAuthToken(res.token);

      const [, payloadB64] = res.token.split(".");
      const payload = payloadB64 ? JSON.parse(atob(payloadB64)) : {};
      setUser({ email: payload.sub, role: payload.role, token: res.token });

      switch (payload.role) {
        case "OWNER":
          navigate("/dashboard/owner");
          break;
        case "SECRETARY":
          navigate("/dashboard/secretary");
          break;
        case "MEMBER":
          navigate("/dashboard/member");
          break;
        case "WATCHMAN":
          navigate("/dashboard/watchman");
          break;
        default:
          navigate("/dashboard/user");
      }
    } catch (err) {
      setError(err?.response?.data?.error || "Login failed");
    } finally {
      setSubmitting(false);
    }
  };

  const isDisabled = submitting || !form.email || !form.password;

  return (
    <div className="relative min-h-screen grid place-items-center">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${bgImage})` }}
        aria-hidden="true"
      />
      <div className="absolute inset-0 bg-gradient-to-tr from-black/40 via-black/20 to-transparent" />

      <div className="relative w-full max-w-md">
        <div className="bg-white/85 backdrop-blur-md rounded-2xl shadow-2xl ring-1 ring-black/5 p-6 sm:p-8">
          <h1 className="text-3xl font-bold text-center text-gray-900">Login</h1>
          <p className="mt-1 text-center text-gray-600 text-sm">
            Welcome back to <span className="font-semibold text-blue-600">OneGate</span>
          </p>

          {error && (
            <div className="mt-4 rounded-lg bg-red-50 text-red-600 text-sm p-3 border border-red-100">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                onChange={handleChange}
                required
                className="mt-1 w-full rounded-lg border border-gray-300 bg-white/90 px-4 py-2.5 text-gray-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-400"
                autoFocus
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1 relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-gray-300 bg-white/90 px-4 py-2.5 pr-12 text-gray-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute inset-y-0 right-2 my-auto h-8 px-2 text-sm text-gray-600 hover:text-gray-900 rounded-md"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="inline-flex items-center gap-2 text-gray-700">
                <input
                  type="checkbox"
                  className="rounded border-gray-300"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                Remember me
              </label>
              <Link to="/forgot-password" className="text-blue-600 hover:underline">
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={isDisabled}
              className="w-full rounded-lg bg-gradient-to-r from-blue-500 to-indigo-500 py-2.5 font-semibold text-white shadow-md transition hover:brightness-110 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? "Signing in..." : "Login"}
            </button>
          </form>

          <div className="mt-6 flex items-center gap-3">
            <div className="h-px w-full bg-gray-200" />
            <span className="text-xs text-gray-500">or</span>
            <div className="h-px w-full bg-gray-200" />
          </div>

          <p className="mt-4 text-center text-gray-700">
            Don&apos;t have an account?{" "}
            <Link to="/register" className="font-semibold text-blue-600 hover:underline">
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
