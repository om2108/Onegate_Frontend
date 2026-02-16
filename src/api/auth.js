// src/api/auth.js
import api from "./api";

export const registerUser = async (data) => {
  const payload = {
    ...data,
    role: data.role?.toUpperCase() || "USER",
  };
  const res = await api.post("/auth/register", payload);
  return res.data;
};

export const loginUser = async (data) => {
  const res = await api.post("/auth/login", data);
  return res.data;
};

// verifyEmail: now accepts purpose ("verify" | "reset")
export const verifyEmail = async (email, code, purpose = "verify") => {
  const res = await api.post("/auth/verify-otp", { email, code, purpose });
  return res.data;
};

// resend OTP (both register and reset flows)
export const resendOTP = async (email) => {
  const res = await api.post("/auth/resend", { email });
  return res.data;
};

export const forgotPassword = async (email) => {
  const res = await api.post("/auth/forgot-password", { email });
  return res.data;
};

// resetPassword expects { email, password, resetToken } or { email, code, password } depending on backend
export const resetPassword = async ({ email, code, password, resetToken }) => {
  const res = await api.post("/auth/reset-password", { email, code, password, resetToken });
  return res.data;
};
