import api from "./api";

export const getNotices = async () => (await api.get("/notices")).data;

export const createNotice = async (data) =>
  (await api.post("/notices", data)).data;

export const updateNotice = async (id, data) =>
  (await api.put(`/notices/${id}`, data)).data;

export const deleteNotice = async (id) =>
  (await api.delete(`/notices/${id}`)).data;
