import api from "./api";

export const getEvents = async (societyId, roles = []) =>
  (await api.get("/events", {
    params: { societyId, roles },
    paramsSerializer: params => {
      const usp = new URLSearchParams();
      usp.set("societyId", params.societyId);
      roles.forEach(r => usp.append("roles", r));
      return usp.toString();
    }
  })).data;

export const createEvent = async data =>
  (await api.post("/events", data)).data;

export const updateEvent = async (id, data) =>
  (await api.put(`/events/${id}`, data)).data;

export const deleteEvent = async id =>
  (await api.delete(`/events/${id}`)).data;
