import api from "./api";

export const fetchRequests = async () =>
  (await api.get("/appointments")).data;

// ✅ send as query params (matches @RequestParam in controller)
export const approveRequest = async (id, payload = { accepted: true }) => {
  const { accepted = true, dateTime, location } = payload || {};

  return (
    await api.put(`/appointments/${id}/respond`, null, {
      params: {
        accepted,
        ...(dateTime ? { dateTime } : {}),
        ...(location ? { location } : {}),
      },
    })
  ).data;
};

export const rejectRequest = async (id) =>
  (await api.delete(`/appointments/${id}`)).data;

export const deleteAppointment = rejectRequest;

export const requestAppointment = async (payload) =>
  (await api.post("/appointments", payload)).data;

/**
 * New: score an appointment using your backend:
 * POST /api/no-show/score/{id}
 * returns the updated Appointment document (with noShowScore, noShowFlag, lastScoredAt)
 */
export const scoreAppointment = async (id) =>
  (await api.post(`/no-show/score/${id}`)).data;
