// src/components/tenant/TenantHome.jsx (updated handleAction part)
import React, {
  useEffect,
  useMemo,
  useState,
  useCallback,
  useContext,
} from "react";
import { getProfile } from "../../../api/profile";

import PropertyCard from "../tenant/PropertyCard";
import PropertyFilters from "../owner/PropertyCompo/PropertyFilters";
import {
  getAllProperties,
  getRecommendations,
  recordPropertyClick,
} from "../../../api/property";
import { getAllSocieties } from "../../../api/society";
import { requestAppointment, scoreAppointment } from "../../../api/appointment";
import { AuthContext } from "../../../context/AuthContext";

const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

function formatRisk(score) {
  if (score == null) return null;
  const pct = Math.round(score * 100);
  if (pct >= 70) return { label: `${pct}% — High risk`, tone: "🔴" };
  if (pct >= 40) return { label: `${pct}% — Medium risk`, tone: "🟠" };
  return { label: `${pct}% — Low risk`, tone: "🟢" };
}

export default function TenantHome() {
  const { user } = useContext(AuthContext);

  const [properties, setProperties] = useState([]);
  const [societies, setSocieties] = useState([]);
  const [loading, setLoading] = useState(true);

  // popup state
  const [popupMode, setPopupMode] = useState(""); // "view" | "request" | ""
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [msgColor, setMsgColor] = useState("text-emerald-900");

  // request form fields
  const [reqDate, setReqDate] = useState("");
  const [reqTime, setReqTime] = useState("");
  const [reqLocation, setReqLocation] = useState("");

  // filters
  const [filters, setFilters] = useState({
    location: "",
    type: "",
    status: "",
    minPrice: "",
    maxPrice: "",
  });
  const [profile, setProfile] = useState(null);

  // AI suggestion state
  const [aiPick, setAiPick] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");

  // load properties + societies
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [pRes, sRes, profileRes] = await Promise.allSettled([
          getAllProperties(),
          getAllSocieties(),
          getProfile(),
        ]);

        if (profileRes.status === "fulfilled") {
          setProfile(profileRes.value);
        }

        if (!mounted) return;

        setProperties(
          pRes.status === "fulfilled" && Array.isArray(pRes.value)
            ? pRes.value
            : [],
        );
        setSocieties(
          sRes.status === "fulfilled" && Array.isArray(sRes.value)
            ? sRes.value
            : [],
        );
      } catch (e) {
        alert(
          e?.response?.data?.message ||
            e?.message ||
            "Failed to load tenant data",
        );
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const filterOptions = useMemo(() => {
    const locations = new Set();
    const types = new Set();
    const statuses = new Set();

    properties.forEach((p) => {
      if (p.location) locations.add(p.location);
      if (p.type) types.add(p.type);
      if (p.status) statuses.add(p.status);
    });

    return {
      locations: Array.from(locations).sort(),
      types: Array.from(types).sort(),
      statuses: Array.from(statuses).sort(),
    };
  }, [properties]);

  const societyById = useMemo(() => {
    const map = new Map();
    societies.forEach((s) => map.set(s.id || s._id, s));
    return map;
  }, [societies]);

  const filtered = useMemo(() => {
    const minP = filters.minPrice === "" ? -Infinity : Number(filters.minPrice);
    const maxP = filters.maxPrice === "" ? Infinity : Number(filters.maxPrice);

    return properties.filter((p) => {
      if (filters.location && p.location !== filters.location) return false;
      if (filters.type && p.type !== filters.type) return false;
      if (filters.status && p.status !== filters.status) return false;

      const price = Number(p.price || 0);
      if (price < minP || price > maxP) return false;

      return true;
    });
  }, [properties, filters]);

  // fetch recommendation on filter changes (debounced + cancel)
  useEffect(() => {
    let cancelled = false;
    let timer = null;

    const fetchRecommendation = async () => {
      setAiLoading(true);
      setAiError("");
      try {
        const body = { k: 1 };
        if (filters.location) body.location = filters.location;
        if (filters.minPrice) body.minPrice = Number(filters.minPrice);
        if (filters.maxPrice) body.maxPrice = Number(filters.maxPrice);

        const token = user?.token;
        const data = await getRecommendations(body, token);
        if (!cancelled) {
          setAiPick(Array.isArray(data) && data.length > 0 ? data[0] : null);
        }
      } catch (err) {
        alert(
          err?.response?.data?.message ||
            err?.message ||
            "AI recommendation failed",
        );
        if (!cancelled) {
          setAiPick(null);
          const errMsg = err.message || String(err);
          setAiError(errMsg);
        }
      } finally {
        if (!cancelled) setAiLoading(false);
      }
    };

    timer = setTimeout(fetchRecommendation, 400);
    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [filters.location, filters.minPrice, filters.maxPrice, user?.token]);
  const loadProfile = async () => {
    try {
      const data = await getProfile();
      setProfile(data);
      return data;
    } catch (err) {
      alert(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to load profile",
      );
      return null;
    }
  };

  // handleAction: record property click but ignore 403/401 (not allowed)
  const handleAction = useCallback(
    async (action, property) => {
      const latestProfile = profile || (await loadProfile());

      if (action === "request" && latestProfile?.profileComplete !== true) {
        alert("Complete your profile before requesting property");
        return;
      }

      setSelectedProperty(property);
      setPopupMode(action);
      setSuccessMessage("");
      setMsgColor("text-emerald-900");

      if (!user?.token) return;

      try {
        await recordPropertyClick(property.id || property._id, user.token);
      } catch (err) {
        const status = err?.response?.status;
        if (status !== 401 && status !== 403) {
          alert("Tracking failed. Please retry.");
        }
      }
    },
    [user?.token, profile],
  );

  const closePopup = () => {
    setPopupMode("");
  };

  const handleSubmitRequest = async (e) => {
    e.preventDefault();
    if (profile?.profileComplete !== true) {
      alert("Complete your profile before sending request");
      return;
    }

    if (!selectedProperty) return;

    setSuccessMessage("");
    setMsgColor("text-emerald-900");

    try {
      let dateTime = null;
      if (reqDate && reqTime) dateTime = `${reqDate}T${reqTime}:00`;
      else if (reqDate) dateTime = `${reqDate}T09:00:00`;

      const payload = {
        propertyId: String(selectedProperty.id || selectedProperty._id),
        dateTime,
        location:
          reqLocation ||
          selectedProperty.area ||
          selectedProperty.location ||
          "",
      };

      const created = await requestAppointment(payload);

      // 2) try scoring; scoring failure should NOT block success message
      try {
        const createdId = created?.id || created?._id;
        if (createdId) {
          const scored = await scoreAppointment(createdId);
          const risk = formatRisk(scored?.noShowScore);
          if (risk) {
            setSuccessMessage(
              `✅ Request sent for "${selectedProperty.name}". ${risk.tone} ${risk.label}`,
            );
            setMsgColor(
              risk.label.includes("High")
                ? "text-red-700"
                : risk.label.includes("Medium")
                  ? "text-amber-700"
                  : "text-emerald-900",
            );
          } else {
            setSuccessMessage(
              `✅ Request sent for "${selectedProperty.name}". Score unavailable.`,
            );
          }
        } else {
          setSuccessMessage(
            `✅ Request sent for "${selectedProperty.name}". (no id returned for scoring)`,
          );
        }
      } catch (scoreErr) {
        alert(
          scoreErr?.response?.data?.message ||
            scoreErr?.message ||
            "Risk scoring failed",
        );
        setSuccessMessage(
          `✅ Request sent for "${selectedProperty.name}". (scoring failed)`,
        );
      }

      // reset modal and form
      setPopupMode("");
      setReqDate("");
      setReqTime("");
      setReqLocation("");
    } catch (err) {
      alert(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to send request",
      );

      setSuccessMessage("⚠️ Failed to send request. Please try again.");

      setMsgColor("text-red-700");
      setPopupMode("");
    }
  };

  if (loading) {
    return (
      <section className="p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="h-6 w-48 bg-gray-200 rounded mb-4 animate-pulse" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-2xl border border-gray-200">
                <div className="aspect-[16/10] bg-gray-200 animate-pulse" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-2/3" />
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2" />
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-1/3" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  const currentSociety = selectedProperty?.societyId
    ? societyById.get(selectedProperty.societyId)
    : null;

  return (
    <section className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Filters */}
        <PropertyFilters
          filters={filters}
          setFilters={setFilters}
          filterOptions={filterOptions}
        />

        {/* AI suggestion */}
        <div className="rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3">
          <h4 className="font-semibold text-blue-800">🤖 AI Recommendation</h4>
          <p className="text-blue-900/90 text-sm">
            Based on your current filters, we recommend:
          </p>

          {aiLoading ? (
            <p className="mt-1 text-sm text-blue-900">
              Calculating recommendation…
            </p>
          ) : aiError ? (
            <p className="mt-1 text-sm text-red-700">
              Recommendation error: {aiError}
            </p>
          ) : aiPick ? (
            <p className="mt-1 text-sm text-blue-900">
              🏠 <span className="font-medium">{aiPick.name}</span> — Best value
              in {aiPick.location}! ({inr.format(aiPick.price)})
            </p>
          ) : (
            <p className="mt-1 text-sm text-blue-900">No properties found.</p>
          )}
        </div>

        {/* Success message */}
        {successMessage && (
          <div
            className={`rounded-xl border px-4 py-3 text-sm ${msgColor} ${msgColor === "text-emerald-900" ? "border-emerald-200 bg-emerald-50" : msgColor === "text-red-700" ? "border-red-200 bg-red-50" : "border-amber-200 bg-amber-50"}`}
          >
            {successMessage}
          </div>
        )}

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
          {filtered.map((p) => (
            <PropertyCard
              key={p.id || p._id}
              property={p}
              onAction={handleAction}
              profileComplete={profile?.profileComplete}
            />
          ))}
        </div>
      </div>

      {/* Modal (view / request) */}
      {popupMode && selectedProperty && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-3"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b">
              <h3 className="font-semibold text-gray-900">
                {popupMode === "view"
                  ? selectedProperty.name
                  : `Send Secure Request for ${selectedProperty.name}`}
              </h3>
              <button
                onClick={closePopup}
                className="px-2 py-1 rounded-md text-gray-600 hover:bg-gray-100"
              >
                ✕
              </button>
            </div>

            <div className="p-4 sm:p-6">
              {popupMode === "view" ? (
                <div className="space-y-3">
                  {selectedProperty.image && (
                    <img
                      src={selectedProperty.image}
                      alt={`${selectedProperty.name} in ${selectedProperty.area || ""}`}
                      className="w-full h-auto rounded-xl"
                    />
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    <p>
                      <span className="font-medium">Area:</span>{" "}
                      {selectedProperty.area || "—"}
                    </p>
                    <p>
                      <span className="font-medium">Society:</span>{" "}
                      {currentSociety?.name || selectedProperty.society || "—"}
                    </p>
                    {selectedProperty.surroundings && (
                      <p className="sm:col-span-2">
                        <span className="font-medium">Surroundings:</span>{" "}
                        {selectedProperty.surroundings}
                      </p>
                    )}
                    {selectedProperty.description && (
                      <p className="sm:col-span-2">
                        <span className="font-medium">Description:</span>{" "}
                        {selectedProperty.description}
                      </p>
                    )}
                    <p>
                      <span className="font-medium">Price:</span>{" "}
                      {inr.format(Number(selectedProperty.price || 0))}
                    </p>
                    {"verified" in selectedProperty && (
                      <p>
                        <span className="font-medium">Verified:</span>{" "}
                        {selectedProperty.verified
                          ? "✅ Verified Owner"
                          : "❌ Not Verified"}
                      </p>
                    )}
                    {"rating" in selectedProperty && (
                      <p>
                        <span className="font-medium">Rating:</span> ⭐{" "}
                        {selectedProperty.rating} / 5
                      </p>
                    )}
                  </div>

                  {currentSociety && (
                    <div className="pt-2 border-t">
                      <h4 className="font-semibold mb-1">🏢 Society Details</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                        <p>
                          <span className="font-medium">Name:</span>{" "}
                          {currentSociety.name || "—"}
                        </p>
                        <p className="sm:col-span-2">
                          <span className="font-medium">Address:</span>{" "}
                          {currentSociety.address || "—"}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      onClick={() => {
                        setPopupMode("request");
                      }}
                      className="px-3 py-2 bg-blue-600 text-white rounded"
                    >
                      Request Visit
                    </button>
                    <button
                      onClick={closePopup}
                      className="px-3 py-2 border rounded"
                    >
                      Close
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmitRequest} className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">
                        Preferred Date
                      </label>
                      <input
                        type="date"
                        value={reqDate}
                        onChange={(e) => setReqDate(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">
                        Preferred Time
                      </label>
                      <input
                        type="time"
                        value={reqTime}
                        onChange={(e) => setReqTime(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">
                        Meet Location
                      </label>
                      <input
                        type="text"
                        placeholder="On-site / Society gate / etc."
                        value={reqLocation}
                        onChange={(e) => setReqLocation(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={closePopup}
                      className="px-3 py-2 rounded-lg border border-gray-300 text-gray-800 hover:bg-gray-50 transition text-sm"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-3 py-2 rounded-lg border border-blue-600 bg-blue-600 text-white hover:bg-blue-700 transition text-sm"
                    >
                      Send Request
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
