// src/components/auth/RegisterForm.jsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registerUser } from "../../api/auth";
const bgImage =
  "https://res.cloudinary.com/dopjyimaq/image/upload/f_auto,q_auto/v1771076809/t_dogf8x.jpg";
export default function RegisterForm() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setSubmitting(true);
    try {
      await registerUser(form);

      // Save email so VerifyEmail can read it when query param is absent
      localStorage.setItem("email", form.email);

      // Navigate to verification with purpose=verify
      navigate(
        `/verify?email=${encodeURIComponent(form.email)}&purpose=verify`,
      );
    } catch (err) {
      setMessage(err.response?.data?.error || "Registration failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen grid place-items-center">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${bgImage})` }}
        aria-hidden="true"
      />
      <div className="absolute inset-0 bg-gradient-to-tr from-black/40 via-black/25 to-transparent" />

      <div className="relative w-full max-w-md">
        <div className="bg-white/85 backdrop-blur-md rounded-2xl shadow-2xl ring-1 ring-black/5 p-6 sm:p-8">
          <h1 className="text-3xl font-bold text-center text-gray-900">
            Create Account
          </h1>
          <p className="mt-1 text-center text-gray-600 text-sm">
            Join <span className="font-semibold text-blue-600">OneGate</span> —
            your Society & Real Estate Portal
          </p>

          {message && (
            <div
              className={`mt-4 p-3 rounded-lg text-sm ${
                message.toLowerCase().includes("failed")
                  ? "bg-red-50 text-red-600 border border-red-100"
                  : "bg-green-50 text-green-700 border border-green-100"
              }`}
            >
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Full Name
              </label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="John Doe"
                required
                className="mt-1 w-full rounded-lg border border-gray-300 bg-white/90 px-4 py-2.5 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                required
                className="mt-1 w-full rounded-lg border border-gray-300 bg-white/90 px-4 py-2.5 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1 relative">
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                  className="w-full rounded-lg border border-gray-300 bg-white/90 px-4 py-2.5 pr-12 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-400"
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
              <p className="mt-1 text-xs text-gray-500">
                Use at least 6 characters.
              </p>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-lg bg-gradient-to-r from-blue-500 to-indigo-500 py-2.5 font-semibold text-white shadow hover:brightness-110 disabled:opacity-60"
            >
              {submitting ? "Registering..." : "Register"}
            </button>
          </form>

          <div className="mt-6 flex items-center gap-3">
            <div className="h-px w-full bg-gray-200" />
            <span className="text-xs text-gray-500">or</span>
            <div className="h-px w-full bg-gray-200" />
          </div>

          <p className="mt-4 text-center text-gray-700">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-semibold text-blue-600 hover:underline"
            >
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
