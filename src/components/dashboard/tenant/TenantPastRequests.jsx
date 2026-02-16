import React, { useEffect, useState } from "react";
import { fetchRequests } from "../../../api/appointment";

export default function TenantPastRequests() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetchRequests();
        const now = new Date();

        const past = Array.isArray(res)
          ? res.filter((a) => a.dateTime && new Date(a.dateTime) < now)
          : [];

        setItems(past);
      } catch (e) {
        alert(
          e?.response?.data?.message ||
            e?.message ||
            "Past requests load failed",
        );
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const badge = (s) => {
    if (s === "ACCEPTED") return "bg-green-100 text-green-700";
    if (s === "REJECTED") return "bg-red-100 text-red-700";
    return "bg-gray-100 text-gray-700";
  };

  if (loading)
    return (
      <div className="p-6 text-center text-gray-500">
        Loading past requests…
      </div>
    );

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-semibold mb-6 text-gray-800">
        Past Visit Requests
      </h2>

      {items.length === 0 && (
        <div className="bg-gray-50 border rounded-xl p-10 text-center text-gray-500">
          No past requests found.
        </div>
      )}

      <div className="space-y-4">
        {items.map((a) => (
          <div
            key={a.id || a._id}
            className="bg-white border rounded-xl p-4 shadow-sm hover:shadow transition"
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-lg font-medium text-gray-800">
                  {a.propertyName || "Property Visit"}
                </p>

                <p className="text-sm text-gray-500 mt-1">
                  📅 {new Date(a.dateTime).toLocaleDateString()} ⏰{" "}
                  {new Date(a.dateTime).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>

                {a.location && (
                  <p className="text-sm text-gray-500 mt-1">📍 {a.location}</p>
                )}
              </div>

              <span
                className={`px-3 py-1 text-xs rounded-full font-medium ${badge(
                  a.status,
                )}`}
              >
                {a.status || "DONE"}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
