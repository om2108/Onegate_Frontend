// src/api/member.js
import api from "./api";

// All members for a society
export const getMembers = async (societyId) =>
  (await api.get("/members", { params: { societyId } })).data;

export const getMemberById = async (id) =>
  (await api.get(`/members/${id}`)).data;

export const addMember = async (data) =>
  (await api.post("/members", data)).data;

export const updateMemberRole = async (id, role) =>
  (await api.put(`/members/${id}/role`, null, { params: { role } })).data;

export const deleteMember = async (id) =>
  (await api.delete(`/members/${id}`)).data;
