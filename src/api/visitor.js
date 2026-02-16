import api from "./api";

export const getVisitors = async (societyId, userIds = []) =>
  (await api.get("/visitors", {
    params: { societyId, userIds }
  })).data;

export const addVisitor = async (data) =>
  (await api.post("/visitors", data)).data;

export const updateVisitorStatus = async (id, status) =>
  (await api.put(`/visitors/${id}/status`, null, {
    params: { status }
  })).data;

  export const deleteVisitor = async (id) =>
  (await api.delete(`/visitors/${id}`)).data;