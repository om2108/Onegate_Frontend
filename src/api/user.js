// src/api/user.js
import api from "./api";

// GET all users
export const getAllUsers = async () => (await api.get("/users")).data;

// GET one user
export const getUserById = async (id) =>
  (await api.get(`/users/${id}`)).data;

// Public users (id, email, societyId)
export const getPublicUsers = async () =>
  (await api.get("/users/public")).data;

// OWNER → Invite user
export const inviteUser = async ({ email, role, societyId }) => {
  return (
    await api.post("/users/invite", { email, role, societyId })
  ).data;
};

// OWNER → Update user role
export const updateUserRole = async (id, role) => {
  return (await api.put(`/users/${id}/role`, { role })).data;
};

// OWNER → Delete user
export const deleteUser = async (id) => {
  return (await api.delete(`/users/${id}`)).data;
};
