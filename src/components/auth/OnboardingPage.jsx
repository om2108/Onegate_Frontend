import React, { useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../../api/api";
import { motion } from "framer-motion";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

export default function Onboarding() {
  const [params] = useSearchParams();
  const email = params.get("email");

  const [form, setForm] = useState({
    name: "",
    phone: "",
    password: "",
  });

  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async () => {
    if (!form.name || !form.password) {
      alert("Please fill all required fields");
      return;
    }

    try {
      setLoading(true);
      await api.post("/users/onboarding", { email, ...form });
      alert("Onboarding completed! Please login.");
      window.location.href = "/login";
    } catch (err) {
      alert(err?.response?.data?.error || "Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100 flex items-center justify-center px-4">
      <motion.div
        className="bg-white/90 backdrop-blur-lg shadow-xl rounded-2xl w-full max-w-md p-8 border border-white"
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-2xl font-bold text-gray-900 text-center">
          Complete Your Account
        </h1>
        <p className="text-gray-600 mt-1 text-center">
          Set up your profile to start using the system.
        </p>

        <div className="mt-6">
          {/* Email (readonly) */}
          <label className="text-sm text-gray-700 font-medium">Email</label>
          <input
            disabled
            value={email}
            className="w-full bg-gray-100 border border-gray-300 rounded-lg px-3 py-2 text-gray-700 mt-1 cursor-not-allowed"
          />

          {/* Full Name */}
          <label className="text-sm text-gray-700 font-medium mt-4 block">
            Full Name *
          </label>
          <input
            name="name"
            placeholder="Enter your full name"
            onChange={handle}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 mt-1 focus:ring-2 focus:ring-blue-500 outline-none"
          />

          {/* Phone */}
          <label className="text-sm text-gray-700 font-medium mt-4 block">
            Phone
          </label>
          <input
            name="phone"
            placeholder="Enter phone number"
            onChange={handle}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 mt-1 focus:ring-2 focus:ring-blue-500 outline-none"
          />

          {/* Password */}
          <label className="text-sm text-gray-700 font-medium mt-4 block">
            Create Password *
          </label>
          <div className="relative mt-1">
            <input
              name="password"
              type={showPass ? "text" : "password"}
              placeholder="Create a strong password"
              onChange={handle}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-10 focus:ring-2 focus:ring-blue-500 outline-none"
            />
            <button
              type="button"
              onClick={() => setShowPass(!showPass)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
            >
              {showPass ? (
                <EyeSlashIcon className="w-5 h-5" />
              ) : (
                <EyeIcon className="w-5 h-5" />
              )}
            </button>
          </div>

          {/* Submit button */}
          <button
            onClick={submit}
            disabled={loading}
            className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg text-sm font-semibold shadow transition disabled:bg-blue-300"
          >
            {loading ? "Completing..." : "Finish Setup"}
          </button>
        </div>

        <p className="text-center mt-4 text-gray-500 text-sm">
          Already have an account?{" "}
          <a href="/login" className="text-blue-600 hover:underline">
            Login
          </a>
        </p>
      </motion.div>
    </div>
  );
}
