// src/api/complaint.js
import api from "./api";

// For secretary dashboard: all complaints in a society
export const getComplaintsBySociety = async (societyId) =>
  (await api.get("/complaints/society", { params: { societyId } })).data;

// For member dashboard: complaints by a single user
export const getComplaintsByMember = async (userId) =>
  (await api.get("/complaints/member", { params: { userId } })).data;

export const getComplaintById = async (id) =>
  (await api.get(`/complaints/${id}`)).data;

export const addComplaint = async (data) =>
  (await api.post("/complaints", data)).data;

export const updateComplaintStatus = async (id, status, priority) =>
  (await api.put(`/complaints/${id}/status`, null, {
    params: { status, ...(priority ? { priority } : {}) },
  })).data;

export const deleteComplaint = async (id) =>
  (await api.delete(`/complaints/${id}`)).data;
