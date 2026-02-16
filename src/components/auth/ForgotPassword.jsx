// src/components/auth/ForgotPassword.jsx
import { useState } from "react";
import { forgotPassword } from "../../api/auth";
import { useNavigate } from "react-router-dom";
const bgImage =
  "https://res.cloudinary.com/dopjyimaq/image/upload/f_auto,q_auto/v1771076809/t_dogf8x.jpg";
export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [type, setType] = useState("info"); // info | success | error
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setMsg("");
    setType("info");

    if (!/\S+@\S+\.\S+/.test(email)) {
      setMsg("Please enter a valid email address.");
      setType("error");
      return;
    }

    try {
      setLoading(true);
      await forgotPassword(email);

      // navigate to verify for reset flow
      navigate(`/verify?email=${encodeURIComponent(email)}&purpose=reset`);

      setMsg("If the email exists, a reset code has been sent. Check your inbox (or spam).");
      setType("success");
    } catch (err) {
      setMsg(err?.response?.data?.error || "Failed to send code. Try again later.");
      setType("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* background */}
      <div
        className="absolute inset-0 bg-cover bg-center -z-10"
        style={{ backgroundImage: `url(${bgImage})` }}
        aria-hidden="true"
      />
      <div className="absolute inset-0 bg-gradient-to-tr from-black/40 via-black/15 to-transparent -z-0" />

      <div className="w-full max-w-md mx-4">
        <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl border border-white/30 p-6 sm:p-8">
          <h1 className="text-2xl font-semibold text-gray-900">Forgot password</h1>
          <p className="mt-2 text-sm text-gray-600">
            Enter the email associated with your account. We'll send a 6-digit reset code.
          </p>

          {msg && (
            <div
              role="status"
              className={`mt-4 flex items-start gap-3 rounded-lg p-3 text-sm ${
                type === "success"
                  ? "bg-emerald-50 text-emerald-800 border border-emerald-100"
                  : type === "error"
                  ? "bg-red-50 text-red-700 border border-red-100"
                  : "bg-blue-50 text-blue-700 border border-blue-100"
              }`}
            >
              <div className="leading-tight">{msg}</div>
            </div>
          )}

          <form onSubmit={submit} className="mt-6 space-y-4">
            <label className="block">
              <span className="text-sm font-medium text-gray-700">Email</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="mt-2 w-full rounded-lg border border-gray-200 px-4 py-2 text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </label>

            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 py-2.5 text-sm font-semibold text-white shadow hover:brightness-105 disabled:opacity-60"
            >
              {loading ? "Sending..." : "Send reset code"}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-600">
            <a href="/login" className="font-medium text-blue-600 hover:underline">Back to Login</a>
          </div>
        </div>
      </div>
    </div>
  );
}
