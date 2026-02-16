// src/components/tenant/MemberProperties.jsx
import React, {
  useEffect,
  useMemo,
  useState,
  useCallback,
  useContext,
} from "react";
import PropertyCard from "../tenant/PropertyCard";
import PropertyFilters from "../owner/PropertyCompo/PropertyFilters";
import {
  getAllProperties,
  getRecommendations,
  recordPropertyClick,
} from "../../../api/property";
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

export default function MemberProperties() {
  const { user } = useContext(AuthContext);

  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState({
    location: "",
    type: "",
    minPrice: "",
    maxPrice: "",
  });

  // modal + request state
  const [selected, setSelected] = useState(null);
  const [mode, setMode] = useState(""); // "view" | "request"
  const [reqDate, setReqDate] = useState("");
  const [reqTime, setReqTime] = useState("");
  const [reqLocation, setReqLocation] = useState("");
  const [msg, setMsg] = useState("");
  const [msgColor, setMsgColor] = useState("text-emerald-900");

  // recommendations
  const [recs, setRecs] = useState([]);
  const [recLoading, setRecLoading] = useState(false);
  const [recError, setRecError] = useState("");

  // simple session dedupe for clicks
  const clickedThisSession = React.useRef(new Set());

  const safeRecordClick = useCallback(
    async (propertyId) => {
      if (!propertyId) return;
      if (!user?.token) return;
      if (clickedThisSession.current.has(propertyId)) return;
      clickedThisSession.current.add(propertyId);

      try {
        await recordPropertyClick(propertyId, user.token);
        alert(`Recorded property click: ${propertyId}`);
      } catch (err) {
        const status = err?.response?.status;
        if (status === 401 || status === 403) {
          alert(
            `recordPropertyClick blocked (${status}) for property ${propertyId}`,
          );
          return;
        }
        alert(
          err?.response?.data?.message ||
            err?.message ||
            "Failed to record property click.",
        );
      }
    },
    [user?.token],
  );

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await getAllProperties();
        if (!mounted) return;
        setProperties(Array.isArray(res) ? res : []);
      } catch (e) {
        alert(
          e?.response?.data?.message ||
            e?.message ||
            "Failed to load properties.",
        );
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => (mounted = false);
  }, []);

  const filterOptions = useMemo(() => {
    const locations = new Set();
    const types = new Set();
    properties.forEach((p) => {
      if (p.location) locations.add(p.location);
      if (p.type) types.add(p.type);
    });
    return {
      locations: Array.from(locations).sort(),
      types: Array.from(types).sort(),
    };
  }, [properties]);

  const filtered = useMemo(() => {
    const minP = filters.minPrice === "" ? -Infinity : Number(filters.minPrice);
    const maxP = filters.maxPrice === "" ? Infinity : Number(filters.maxPrice);
    return properties.filter((p) => {
      if (filters.location && p.location !== filters.location) return false;
      if (filters.type && p.type !== filters.type) return false;
      const price = Number(p.price || 0);
      if (price < minP || price > maxP) return false;
      return true;
    });
  }, [properties, filters]);

  // fetch recommendations (top 4)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setRecLoading(true);
      setRecError("");
      try {
        const body = { k: 4 };
        if (filters.location) body.location = filters.location;
        if (filters.minPrice) body.minPrice = Number(filters.minPrice);
        if (filters.maxPrice) body.maxPrice = Number(filters.maxPrice);
        const data = await getRecommendations(body, user?.token);
        if (!cancelled) setRecs(Array.isArray(data) ? data : []);
      } catch (err) {
        alert(
          err?.response?.data?.message ||
            err?.message ||
            "Recommendation fetch failed.",
        );
        if (!cancelled) {
          setRecs([]);
          setRecError(err.message || String(err));
        }
      } finally {
        if (!cancelled) setRecLoading(false);
      }
    })();
    return () => (cancelled = true);
  }, [filters.location, filters.minPrice, filters.maxPrice, user?.token]);

  const openView = useCallback(
    async (p) => {
      setSelected(p);
      setMode("view");
      // safe record
      await safeRecordClick(p.id || p._id);
    },
    [safeRecordClick],
  );

  const openRequest = useCallback((p) => {
    setSelected(p);
    setMode("request");
  }, []);

  const closeModal = () => {
    setSelected(null);
    setMode("");
    setReqDate("");
    setReqTime("");
    setReqLocation("");
    setMsg("");
    setMsgColor("text-emerald-900");
  };

  const submitRequest = async (e) => {
    e.preventDefault();
    if (!selected) return;
    setMsg("");
    setMsgColor("text-emerald-900");

    try {
      let dateTime = null;
      if (reqDate && reqTime) dateTime = `${reqDate}T${reqTime}:00`;
      else if (reqDate) dateTime = `${reqDate}T09:00:00`;
      const payload = {
        propertyId: String(selected.id || selected._id),
        dateTime,
        location: reqLocation || selected.location || "",
      };

      // 1) create appointment
      const created = await requestAppointment(payload);

      // 2) try scoring
      try {
        const createdId = created?.id || created?._id;
        if (createdId) {
          const scored = await scoreAppointment(createdId);
          const risk = formatRisk(scored?.noShowScore);
          if (risk) {
            setMsg(`✅ Request sent — ${risk.tone} ${risk.label}`);
            setMsgColor(
              risk.label.includes("High")
                ? "text-red-700"
                : risk.label.includes("Medium")
                  ? "text-amber-700"
                  : "text-emerald-900",
            );
          } else {
            setMsg(`✅ Request sent. Score unavailable.`);
          }
        } else {
          setMsg(`✅ Request sent. (no id returned for scoring)`);
        }
      } catch (scoreErr) {
        alert(
          scoreErr?.response?.data?.message ||
            scoreErr?.message ||
            "Scoring failed after request.",
        );
        setMsg(`✅ Request sent. (scoring failed)`);
      }

      setTimeout(() => closeModal(), 900);
    } catch (err) {
      alert(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to send appointment request.",
      );
      setMsg("⚠️ Failed to send request. Try again later.");
      setMsgColor("text-red-700");
    }
  };

  return (
    <section className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Explore Properties</h2>
          <div className="text-sm text-gray-600">Member / Resident</div>
        </div>

        <PropertyFilters
          filters={filters}
          setFilters={setFilters}
          filterOptions={filterOptions}
        />

        {/* Recommendations */}
        <div className="rounded-2xl border p-4">
          <h3 className="font-medium mb-3">Recommended for you</h3>
          {recLoading ? (
            <div className="text-sm text-gray-500">
              Loading recommendations…
            </div>
          ) : recError ? (
            <div className="text-sm text-red-600">
              Recommendation error: {recError}
            </div>
          ) : recs.length === 0 ? (
            <div className="text-sm text-gray-500">
              No recommendations right now.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {recs.map((p) => (
                <PropertyCard
                  key={p.id || p._id}
                  property={p}
                  onAction={(action) =>
                    action === "view" ? openView(p) : openRequest(p)
                  }
                />
              ))}
            </div>
          )}
        </div>

        {/* Filtered / All */}
        <div>
          <h3 className="font-medium mb-3">All matching properties</h3>
          {loading ? (
            <div className="text-sm text-gray-500">Loading properties…</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((p) => (
                <PropertyCard
                  key={p.id || p._id}
                  property={p}
                  onAction={(action) =>
                    action === "view" ? openView(p) : openRequest(p)
                  }
                />
              ))}
            </div>
          )}
        </div>

        {/* modal */}
        {mode && selected && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-3">
            <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b">
                <h3 className="font-semibold">
                  {mode === "view"
                    ? selected.name
                    : `Request: ${selected.name}`}
                </h3>
                <button
                  onClick={closeModal}
                  className="px-2 py-1 rounded-md text-gray-600 hover:bg-gray-100"
                >
                  ✕
                </button>
              </div>

              <div className="p-4 sm:p-6">
                {mode === "view" ? (
                  <>
                    {selected.image && (
                      <img
                        src={selected.image}
                        alt={selected.name}
                        className="w-full rounded-xl mb-3"
                      />
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                      <p>
                        <span className="font-medium">Price:</span>{" "}
                        {inr.format(Number(selected.price || 0))}
                      </p>
                      <p>
                        <span className="font-medium">Location:</span>{" "}
                        {selected.location || "-"}
                      </p>
                      {selected.description && (
                        <p className="sm:col-span-2">{selected.description}</p>
                      )}
                    </div>
                    <div className="mt-4 flex justify-end gap-2">
                      <button
                        onClick={() => setMode("request")}
                        className="px-3 py-2 bg-blue-600 text-white rounded"
                      >
                        Request Visit
                      </button>
                      <button
                        onClick={closeModal}
                        className="px-3 py-2 border rounded"
                      >
                        Close
                      </button>
                    </div>
                  </>
                ) : (
                  <form onSubmit={submitRequest} className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">
                          Preferred date
                        </label>
                        <input
                          type="date"
                          value={reqDate}
                          onChange={(e) => setReqDate(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-gray-300"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">
                          Preferred time
                        </label>
                        <input
                          type="time"
                          value={reqTime}
                          onChange={(e) => setReqTime(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-gray-300"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">
                          Meet location
                        </label>
                        <input
                          type="text"
                          value={reqLocation}
                          onChange={(e) => setReqLocation(e.target.value)}
                          placeholder="On-site / Society gate"
                          className="w-full px-3 py-2 rounded-lg border border-gray-300"
                        />
                      </div>
                    </div>

                    {msg && <div className={`text-sm ${msgColor}`}>{msg}</div>}

                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={closeModal}
                        className="px-3 py-2 border rounded"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-3 py-2 bg-blue-600 text-white rounded"
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
      </div>
    </section>
  );
}
