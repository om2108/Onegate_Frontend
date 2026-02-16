// src/components/auth/ResetPassword.jsx
import { useEffect, useState } from "react";
import { resetPassword } from "../../api/auth";
import { useNavigate, useSearchParams } from "react-router-dom";
const bgImage =
  "https://res.cloudinary.com/dopjyimaq/image/upload/f_auto,q_auto/v1771076809/t_dogf8x.jpg";
export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const preEmail = searchParams.get("email") || "";
  const resetToken = searchParams.get("rt") || "";
  const codeQuery = searchParams.get("code") || "";
  const [form, setForm] = useState({
    email: preEmail,
    password: "",
    confirm: "",
  });
  const [msg, setMsg] = useState("");
  const [type, setType] = useState("info");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const el = document.querySelector('input[name="password"]');
    if (el) el.focus();
  }, []);

  const validate = () => {
    if (!/\S+@\S+\.\S+/.test(form.email)) return "Please enter a valid email.";
    if (form.password.length < 6)
      return "Password must be at least 6 characters.";
    if (form.password !== form.confirm) return "Passwords do not match.";
    if (!resetToken && !codeQuery)
      return "Reset token or code missing. Use the link from your email or re-send the code.";
    return null;
  };

  const submit = async (e) => {
    e.preventDefault();
    setMsg("");
    setType("info");

    const error = validate();
    if (error) {
      setMsg(error);
      setType("error");
      return;
    }

    const payload = resetToken
      ? { email: form.email, password: form.password, resetToken }
      : { email: form.email, code: codeQuery, password: form.password };

    try {
      setLoading(true);
      const res = await resetPassword(payload);
      setMsg("Password reset successfully — redirecting to login...");
      setType("success");
      setTimeout(() => navigate("/login"), 1000);
    } catch (err) {
      const serverMsg =
        err?.response?.data?.error ||
        err?.message ||
        "Reset failed. Try again.";

      alert(serverMsg);
      setMsg(serverMsg);
      setType("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center -z-10"
        style={{ backgroundImage: `url(${bgImage})` }}
        aria-hidden="true"
      />
      <div className="absolute inset-0 bg-gradient-to-tr from-black/40 via-black/15 to-transparent -z-0" />

      <div className="w-full max-w-md mx-4">
        <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-white/30 p-6 sm:p-8">
          <h1 className="text-2xl font-semibold text-gray-900">
            Reset password
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Enter your email and a new password.{" "}
            {resetToken
              ? "Using secure reset link."
              : codeQuery
                ? "Using the code you entered."
                : ""}
          </p>

          {msg && (
            <div
              role="status"
              className={`mt-4 flex items-start gap-3 rounded-lg p-3 text-sm ${type === "success" ? "bg-emerald-50 text-emerald-800 border border-emerald-100" : type === "error" ? "bg-red-50 text-red-700 border border-red-100" : "bg-blue-50 text-blue-700 border border-blue-100"}`}
            >
              <div className="leading-tight">{msg}</div>
            </div>
          )}

          <form onSubmit={submit} className="mt-6 space-y-4">
            <label className="block">
              <span className="text-sm font-medium text-gray-700">Email</span>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="you@example.com"
                required
                className="mt-2 w-full rounded-lg border border-gray-200 px-4 py-2 text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </label>

            {codeQuery && (
              <div className="text-sm text-gray-600">
                Using code: <span className="font-mono">{codeQuery}</span>
              </div>
            )}

            <label className="block">
              <span className="text-sm font-medium text-gray-700">
                New password
              </span>
              <input
                name="password"
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="Create a strong password"
                required
                className="mt-2 w-full rounded-lg border border-gray-200 px-4 py-2 text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-gray-700">
                Confirm password
              </span>
              <input
                name="confirm"
                type="password"
                value={form.confirm}
                onChange={(e) => setForm({ ...form, confirm: e.target.value })}
                placeholder="Repeat new password"
                required
                className="mt-2 w-full rounded-lg border border-gray-200 px-4 py-2 text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </label>

            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 py-2.5 text-sm font-semibold text-white shadow hover:brightness-105 disabled:opacity-60"
            >
              {loading ? "Resetting..." : "Reset password"}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-600 flex items-center justify-center gap-4">
            <a
              href="/login"
              className="font-medium text-blue-600 hover:underline"
            >
              Back to Login
            </a>
            <span className="hidden sm:inline">•</span>
            <a
              href="/forgot-password"
              className="text-gray-600 hover:underline"
            >
              Resend code
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
