// src/api/property.js
import api from "./api";

/**
 * Utility: build headers object, optionally override Authorization
 * If token provided, we add Authorization header. Otherwise rely on api instance.
 */
function buildHeaders(token) {
  const headers = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return headers;
}

// 🏘 Get all properties
export const getAllProperties = async (opts = {}) => {
  try {
    const res = await api.get("/properties", { headers: buildHeaders(opts.token) });
    return res.data;
  } catch (err) {
    const msg = err.response?.data?.error || err.message || "Failed to load properties";
    throw new Error(msg);
  }
};

// 🔎 Get recommendations (hybrid algorithm on backend)
// body: { k, location, minPrice, maxPrice, alpha, userVector? }
export const getRecommendations = async (body = { k: 6 }, token) => {
  try {
    const res = await api.post("/properties/recommend", body, { headers: buildHeaders(token) });
    return res.data;
  } catch (err) {
    const msg = err.response?.data?.error || err.message || "Failed to fetch recommendations";
    throw new Error(msg);
  }
};

// 📈 Record property click (so backend can update views & user vector)
export const recordPropertyClick = async (propertyId, token) => {
  try {
    const res = await api.post("/properties/events/property-click", { propertyId }, { headers: buildHeaders(token) });
    return res.data;
  } catch (err) {
    const msg = err.response?.data?.error || err.message || "Failed to record property click";
    throw new Error(msg);
  }
};

// 🏠 Add property
export const addProperty = async (data) => {
  try {
    const res = await api.post("/properties", data);
    return res.data;
  } catch (err) {
    const msg = err.response?.data?.error || err.message || "Failed to add property";
    throw new Error(msg);
  }
};

// ✏️ Update property
export const updateProperty = async (id, data) => {
  try {
    const res = await api.put(`/properties/${id}`, data);
    return res.data;
  } catch (err) {
    const msg = err.response?.data?.error || err.message || "Failed to update property";
    throw new Error(msg);
  }
};

// ❌ Delete property
export const deleteProperty = async (id) => {
  try {
    const res = await api.delete(`/properties/${id}`);
    return res.data;
  } catch (err) {
    const msg = err.response?.data?.error || err.message || "Failed to delete property";
    throw new Error(msg);
  }
};

// 🔍 Get property by ID
export const getPropertyById = async (id) => {
  try {
    const res = await api.get(`/properties/${id}`);
    return res.data;
  } catch (err) {
    const msg = err.response?.data?.error || err.message || "Failed to fetch property";
    throw new Error(msg);
  }
};
