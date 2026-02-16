// src/components/dashboard/secretary/Visitors.jsx
import React, { useState, useMemo, useEffect } from "react";
import { Doughnut, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
} from "chart.js";

import { getVisitors, updateVisitorStatus } from "../../../api/visitor";
import { getMembers } from "../../../api/member";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
);

export default function Visitors() {
  const [visitors, setVisitors] = useState([]);
  const [selectedVisitor, setSelectedVisitor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // simple filters
  const [dateFilter, setDateFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [flatFilter, setFlatFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  // helper for “today”
  const toDateKey = (d) => {
    if (!d) return "";
    try {
      return new Date(d).toISOString().slice(0, 10);
    } catch {
      return "";
    }
  };
  const todayKey = toDateKey(new Date());

  // 🔹 Load visitors for current secretary society
  useEffect(() => {
    const loadVisitors = async () => {
      try {
        setLoading(true);
        setErr("");

        const societyId = localStorage.getItem("secretarySocietyId");
        if (!societyId) {
          setErr("No society selected. Please select a society first.");
          setVisitors([]);
          return;
        }

        // like SecretaryHome: get members -> userIds -> visitors
        const membersRes = await getMembers(societyId);
        const members = Array.isArray(membersRes) ? membersRes : [];
        const userIds = members.map((m) => m.userId).filter(Boolean);

        const data = await getVisitors(societyId, userIds);
        const list = Array.isArray(data) ? data : [];

        const mapped = list.map((v) => {
          const status = (v.status || "").toUpperCase();
          const createdAt = v.time || v.createdAt;

          return {
            id: v.id || v._id,
            name: v.name || v.visitorName || "Visitor",
            flat:
              v.flat ||
              v.flatNo ||
              (v.unit && v.wing
                ? `${v.unit}, ${v.wing}`
                : v.unit || v.toFlat || "—"),
            type: v.type || v.visitorType || "Guest",
            status: status || "PENDING",
            purpose: v.purpose || v.reason || "—",
            time: createdAt ? new Date(createdAt).toLocaleString() : "—",
            contact: v.phone || v.contact || "",
            email: v.email || "",
            rawCreatedAt: createdAt,
          };
        });

        setVisitors(mapped);
      } catch (e) {
        alert(
          e?.response?.data?.message || e?.message || "Failed to load visitors",
        );
        setErr("Failed to load visitors.");
        setVisitors([]);
      } finally {
        setLoading(false);
      }
    };

    loadVisitors();
  }, []);

  // 🔹 Filtering
  const filteredVisitors = useMemo(() => {
    return visitors.filter((v) => {
      const dateMatch =
        !dateFilter ||
        (v.rawCreatedAt && toDateKey(v.rawCreatedAt) === dateFilter);

      const typeMatch =
        typeFilter === "All" ||
        v.type.toLowerCase() === typeFilter.toLowerCase();

      const flatMatch =
        flatFilter === "All" ||
        v.flat.toLowerCase().includes(flatFilter.toLowerCase());

      const statusMatch =
        statusFilter === "All" ||
        v.status.toLowerCase() === statusFilter.toLowerCase();

      return dateMatch && typeMatch && flatMatch && statusMatch;
    });
  }, [visitors, dateFilter, typeFilter, flatFilter, statusFilter]);

  // 🔹 Stats
  const visitorsToday = useMemo(
    () => visitors.filter((v) => toDateKey(v.rawCreatedAt) === todayKey).length,
    [visitors, todayKey],
  );

  const pendingCount = useMemo(
    () => visitors.filter((v) => v.status.toLowerCase() === "pending").length,
    [visitors],
  );

  const approvedCount = useMemo(
    () =>
      visitors.filter(
        (v) =>
          v.status.toLowerCase() === "approved" ||
          v.status.toLowerCase() === "in",
      ).length,
    [visitors],
  );

  // static for now, or tie to complaints later
  const visitorComplaints = 0;

  // 🔹 Chart data
  const visitorTypeData = useMemo(() => {
    const counts = { Delivery: 0, Guest: 0, Service: 0, Other: 0 };

    visitors.forEach((v) => {
      const t = (v.type || "").toLowerCase();
      if (t.includes("delivery")) counts.Delivery += 1;
      else if (t.includes("guest")) counts.Guest += 1;
      else if (t.includes("service") || t.includes("maintenance"))
        counts.Service += 1;
      else counts.Other += 1;
    });

    return {
      labels: ["Delivery", "Guest", "Service", "Other"],
      datasets: [
        {
          data: [counts.Delivery, counts.Guest, counts.Service, counts.Other],
          backgroundColor: ["#10b981", "#3b82f6", "#f97316", "#9ca3af"],
          borderWidth: 1,
        },
      ],
    };
  }, [visitors]);

  const visitorTrendData = useMemo(() => {
    // Very simple static trend for now
    return {
      labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      datasets: [
        {
          label: "Visitors",
          data: [5, 7, 6, 8, 10, 4, 5],
          backgroundColor: "#6366f1",
          borderRadius: 6,
        },
      ],
    };
  }, []);

  // 🔹 Approve / Reject
  const handleStatusChange = async (visitor, newStatus) => {
    if (!visitor.id) return;
    try {
      await updateVisitorStatus(visitor.id, newStatus);
      setVisitors((prev) =>
        prev.map((v) =>
          v.id === visitor.id ? { ...v, status: newStatus } : v,
        ),
      );
    } catch (e) {
      alert(
        e?.response?.data?.message ||
          e?.message ||
          "Failed to update visitor status",
      );
    }
  };

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">
        Visitors
      </h1>

      {err && (
        <div className="rounded border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800 mb-2">
          {err}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <input
          type="date"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="border rounded-md p-2 text-sm"
        />
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="border rounded-md p-2 text-sm"
        >
          <option value="All">Visitor Type</option>
          <option>Delivery</option>
          <option>Guest</option>
          <option>Service</option>
        </select>
        <input
          type="text"
          placeholder="Flat number"
          value={flatFilter === "All" ? "" : flatFilter}
          onChange={(e) => setFlatFilter(e.target.value || "All")}
          className="border rounded-md p-2 text-sm"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border rounded-md p-2 text-sm"
        >
          <option value="All">Status</option>
          <option>Approved</option>
          <option>Pending</option>
          <option>Rejected</option>
        </select>
      </div>

      {/* Stats Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Visitors Today", value: visitorsToday },
          { label: "Pending Visitors", value: pendingCount },
          { label: "Approved Visitors", value: approvedCount },
          { label: "Visitor Complaints", value: visitorComplaints },
        ].map((card, i) => (
          <div
            key={i}
            className="bg-white shadow rounded-lg p-4 hover:shadow-md transition"
          >
            <p className="text-sm text-gray-500">{card.label}</p>
            <p className="text-2xl font-semibold mt-2">{card.value}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="font-semibold mb-2 text-gray-700">Visitor Types</h3>
          <Doughnut
            data={visitorTypeData}
            options={{
              plugins: { legend: { position: "bottom" } },
            }}
          />
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="font-semibold mb-2 text-gray-700">
            Weekly Visitor Trend
          </h3>
          <Bar
            data={visitorTrendData}
            options={{
              plugins: { legend: { display: false } },
              responsive: true,
            }}
          />
        </div>
      </div>

      {/* Visitor List */}
      <section>
        <h2 className="text-lg font-semibold mb-3 text-gray-700">
          Visitor Directory
        </h2>

        {loading ? (
          <p className="text-gray-500 text-center py-6 italic">
            Loading visitors…
          </p>
        ) : filteredVisitors.length === 0 ? (
          <p className="text-gray-500 text-center py-6">
            No visitors found for selected filters.
          </p>
        ) : (
          filteredVisitors.map((v) => (
            <div
              key={v.id}
              className="bg-white shadow rounded-lg p-4 mb-3 flex justify-between items-center hover:shadow-md transition"
            >
              <div>
                <h4 className="font-semibold">{v.name}</h4>
                <p className="text-sm text-gray-500">{v.flat}</p>
                <p className="text-xs text-gray-400">
                  {v.type} | {v.status}
                </p>
              </div>
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => setSelectedVisitor(v)}
                  className="bg-indigo-500 text-white px-3 py-1 rounded text-sm hover:bg-indigo-600"
                >
                  View
                </button>
                {v.contact && (
                  <button className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600">
                    Call
                  </button>
                )}
                {v.email && (
                  <button className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600">
                    Email
                  </button>
                )}
                <button
                  onClick={() => handleStatusChange(v, "APPROVED")}
                  className="bg-orange-500 text-white px-3 py-1 rounded text-sm hover:bg-orange-600"
                >
                  Approve
                </button>
                <button
                  onClick={() => handleStatusChange(v, "REJECTED")}
                  className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                >
                  Reject
                </button>
              </div>
            </div>
          ))
        )}
      </section>

      {/* Modal */}
      {selectedVisitor && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black/40 z-50"
          onClick={(e) =>
            e.target === e.currentTarget && setSelectedVisitor(null)
          }
        >
          <div className="bg-white rounded-lg shadow-lg p-6 w-[90%] max-w-md relative">
            <button
              onClick={() => setSelectedVisitor(null)}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-xl"
            >
              &times;
            </button>
            <h2 className="text-xl font-semibold mb-2">
              {selectedVisitor.name}
            </h2>
            <p>
              <strong>Flat:</strong> {selectedVisitor.flat}
            </p>
            <p>
              <strong>Visitor Type:</strong> {selectedVisitor.type}
            </p>
            <p>
              <strong>Status:</strong> {selectedVisitor.status}
            </p>
            <p>
              <strong>Contact:</strong> {selectedVisitor.contact || "—"}
            </p>
            <p>
              <strong>Email:</strong> {selectedVisitor.email || "—"}
            </p>
            <p>
              <strong>Visit Purpose:</strong> {selectedVisitor.purpose || "—"}
            </p>
            <p>
              <strong>Visit Time:</strong> {selectedVisitor.time || "—"}
            </p>
            <p>
              <strong>Remarks:</strong> No issues
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
