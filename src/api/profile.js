// src/api/profile.js
import api from "./api";

export const getProfile = async () => (await api.get("/profile")).data;

// src/api/profile.js
export const updateProfile = async (data) =>
  (await api.put("/profile", data)).data;

export const changePassword = async (data) =>
  (await api.put("/profile/change-password", data)).data;
