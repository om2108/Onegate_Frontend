// src/api/society.js
import api from "./api";

/**
 * Generic wrapper for GET requests that treats 403 as permissionDenied
 */
async function safeGet(url, params) {
  try {
    const resp = await api.get(url, { params });
    return { data: resp.data, permissionDenied: false };
  } catch (err) {
    const status = err?.response?.status;
    if (status === 403) {
      return { data: null, permissionDenied: true };
    }
    throw err;
  }
}

/* ============================================================
   REQUIRED EXPORTS
   ============================================================ */

/**
 * Book a facility
 */
export async function bookFacility(facilityId, payload) {
  if (!facilityId) throw new Error("facilityId is required");
  const resp = await api.post(`/facilities/${facilityId}/bookings`, payload);
  return resp.data;
}

/**
 * Get facilities of a society
 * returns { facilities: Array, permissionDenied: boolean }
 */
export async function getFacilitiesBySociety(societyId) {
  if (!societyId) return { facilities: [], permissionDenied: false };

  const { data, permissionDenied } = await safeGet(
    `/societies/${societyId}/facilities`
  );

  return {
    facilities: Array.isArray(data) ? data : [],
    permissionDenied,
  };
}

/**
 * Get all societies (friendly return type: ARRAY)
 *
 * NOTE: many components expect an array (e.g. societies.map(...)).
 * This function returns the plain array so callers can do:
 *   const list = await getAllSocieties();
 *   setSocieties(list);
 *
 * If you need the permissionDenied flag, use getAllSocietiesWithMeta().
 */
export async function getAllSocieties(params = {}) {
  const { data } = await safeGet(`/societies`, params);
  return Array.isArray(data) ? data : [];
}

/**
 * Get all societies with meta (permissionDenied)
 * returns { societies: Array, permissionDenied: boolean }
 */
export async function getAllSocietiesWithMeta(params = {}) {
  const { data, permissionDenied } = await safeGet(`/societies`, params);
  return {
    societies: Array.isArray(data) ? data : [],
    permissionDenied,
  };
}

/**
 * Create a new society
 */
export async function createSociety(payload) {
  const resp = await api.post(`/societies`, payload);
  return resp.data;
}

/**
 * Get facility bookings
 * returns { bookings: Array, permissionDenied: boolean }
 */
export async function getFacilityBookings(facilityId, params = {}) {
  if (!facilityId) return { bookings: [], permissionDenied: false };

  const { data, permissionDenied } = await safeGet(
    `/facilities/${facilityId}/bookings`,
    params
  );

  return {
    bookings: Array.isArray(data) ? data : [],
    permissionDenied,
  };
}

/**
 * Get maintenance summary (friendly name)
 * returns { summary: Object|null, permissionDenied: boolean }
 */
export async function getMaintenanceForUser(societyId) {
  if (!societyId) return { summary: null, permissionDenied: false };

  const { data, permissionDenied } = await safeGet(
    `/societies/${societyId}/maintenance/summary`
  );

  return {
    summary: data ?? null,
    permissionDenied,
  };
}

/* ============================================================
   DEFAULT EXPORT (optional)
   ============================================================ */
export default {
  bookFacility,
  getFacilitiesBySociety,
  getAllSocieties,
  getAllSocietiesWithMeta,
  getFacilityBookings,
  getMaintenanceForUser,
  createSociety,
};
