// src/components/auth/VerifyEmail.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { verifyEmail, resendOTP } from "../../api/auth"; // use your api helper
const bgImage =
  "https://res.cloudinary.com/dopjyimaq/image/upload/f_auto,q_auto/v1771076809/t_dogf8x.jpg";
export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const queryEmail = searchParams.get("email") || null;
  const purpose = (searchParams.get("purpose") || "verify").toLowerCase(); // "verify" | "reset"

  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [cooldown, setCooldown] = useState(30);
  const inputsRef = useRef([]);
  const navigate = useNavigate();

  const email = useMemo(
    () => queryEmail || localStorage.getItem("email") || "",
    [queryEmail],
  );

  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setInterval(() => setCooldown((s) => s - 1), 1000);
    return () => clearInterval(id);
  }, [cooldown]);

  useEffect(() => {
    inputsRef.current[0]?.focus();
  }, []);

  const maskedEmail = useMemo(() => {
    if (!email) return "";
    const [user, domain] = (email || "").split("@");
    const visible = user ? user.slice(0, 2) : "";
    return `${visible}${"*".repeat(Math.max((user?.length || 0) - 2, 0))}@${domain || ""}`;
  }, [email]);

  const code = digits.join("");
  const isComplete = code.length === 6 && digits.every((d) => d !== "");

  const handleChange = (idx, val) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...digits];
    next[idx] = val;
    setDigits(next);
    if (val && idx < 5) inputsRef.current[idx + 1]?.focus();
  };

  const handleKeyDown = (idx, e) => {
    if (e.key === "Backspace" && !digits[idx] && idx > 0) {
      const prev = idx - 1;
      const next = [...digits];
      next[prev] = "";
      setDigits(next);
      inputsRef.current[prev]?.focus();
      e.preventDefault();
    }
    if (e.key === "ArrowLeft" && idx > 0) inputsRef.current[idx - 1]?.focus();
    if (e.key === "ArrowRight" && idx < 5) inputsRef.current[idx + 1]?.focus();
  };

  const handlePaste = (e) => {
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!text) return;
    const next = Array.from({ length: 6 }, (_, i) => text[i] || "");
    setDigits(next);
    const focusIdx = Math.min(text.length, 5);
    inputsRef.current[focusIdx]?.focus();
    e.preventDefault();
  };

  const handleVerify = async (e) => {
    e?.preventDefault();
    setMessage("");

    if (!email) {
      setMessage("Email not found. Please start again.");
      return;
    }
    if (!isComplete) {
      setMessage("Please enter the 6-digit code.");
      return;
    }

    // --- DIFFERENT BEHAVIOR FOR PURPOSES ---
    if (purpose === "reset") {
      // don't call verify-otp (backend deletes OTP). navigate to reset page and pass code in query
      // ResetPassword page will call POST /auth/reset-password with { email, code, password }
      navigate(
        `/reset-password?email=${encodeURIComponent(email)}&code=${encodeURIComponent(code)}`,
      );
      return;
    }

    // registration verification flow: call backend verify-otp (will mark verified)
    try {
      setSubmitting(true);

      const res = await verifyEmail(email, code, purpose); // uses your api helper

      setMessage(res?.message || "Verified successfully.");
      try {
        localStorage.removeItem("email");
      } catch {}
      setTimeout(() => navigate("/login"), 700);
    } catch (err) {
      const serverMsg =
        err?.response?.data?.error || err?.message || "Verification failed";

      alert(serverMsg);
      setMessage(serverMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0) return;
    if (!email) return setMessage("Email not found. Please start again.");
    try {
      setCooldown(30);
      await resendOTP(email);
      setMessage("A new code has been sent to your email.");
    } catch (err) {
      const serverMsg =
        err?.response?.data?.error ||
        err?.message ||
        "Could not resend code. Please try again.";

      alert(serverMsg);
      setMessage(serverMsg);
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
        <div className="bg-white/85 backdrop-blur-md rounded-2xl shadow-2xl ring-1 ring-black/5 p-6 sm:p-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900">
            {purpose === "reset" ? "Enter reset code" : "Email verification"}
          </h1>
          <p className="mt-2 text-sm text-gray-700">
            We sent a 6-digit code to{" "}
            <span className="font-semibold">{maskedEmail}</span>
          </p>

          {message && (
            <div className="mt-4 rounded-lg border p-3 text-sm bg-gray-50 text-gray-800 border-gray-200">
              {message}
            </div>
          )}

          <form onSubmit={handleVerify} className="mt-6 space-y-5">
            <div className="flex justify-center gap-2" onPaste={handlePaste}>
              {digits.map((d, i) => (
                <input
                  key={i}
                  ref={(el) => (inputsRef.current[i] = el)}
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={1}
                  value={d}
                  onChange={(e) => handleChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  className="w-12 h-12 rounded-lg border border-gray-300 bg-white/90 text-center text-lg shadow-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-400"
                />
              ))}
            </div>

            <button
              type="submit"
              disabled={!isComplete || submitting}
              className="w-full rounded-lg bg-gradient-to-r from-blue-500 to-indigo-500 py-2.5 font-semibold text-white shadow-md hover:brightness-110 disabled:opacity-60"
            >
              {submitting
                ? "Verifying..."
                : purpose === "reset"
                  ? "Proceed to reset"
                  : "Verify"}
            </button>
          </form>

          <div className="mt-5 text-sm text-gray-700">
            Didn't get the code?{" "}
            <button
              onClick={handleResend}
              disabled={cooldown > 0}
              className="font-semibold text-blue-600 hover:underline disabled:text-gray-400"
            >
              Resend {cooldown > 0 ? `in ${cooldown}s` : "code"}
            </button>
          </div>

          <p className="mt-3 text-xs text-gray-600">
            Tip: check your Spam/Promotions folder.
          </p>
        </div>
      </div>
    </div>
  );
}
