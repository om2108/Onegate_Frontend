import api from "./api";

export const getNotifications = async () => {
  const res = await api.get("/notifications");   // ✅ removed /api
  return res.data;
};

export const getNotificationCount = async () => {
  const res = await api.get("/notifications/count"); // ✅ correct endpoint
  return res.data;
};

export const markNotificationRead = async (id) => {
  await api.put(`/notifications/${id}/read`);
};

export const markAllNotificationsRead = async () => {
  await api.put("/notifications/read-all");
};
