import React, { useState, useEffect, useMemo } from "react";
import { useAuth } from "../../../context/AuthContext";
import {
  getVisitors,
  addVisitor,
  updateVisitorStatus,
  deleteVisitor,
} from "../../../api/visitor";

function VisitorRow({ v, onApprove, onReject, onView }) {
  return (
    <tr className="hover:bg-slate-50">
      <td className="px-3 py-2">
        <img
          src={v.photo}
          alt={v.name}
          className="w-12 h-12 rounded-md object-cover cursor-pointer"
          onClick={() => onView(v)}
        />
      </td>
      <td className="px-3 py-2 text-sm text-slate-700">{v.name}</td>
      <td className="px-3 py-2 text-sm text-slate-600">{v.purpose}</td>
      <td className="px-3 py-2 text-sm text-slate-600">
        {v.date?.split("T")[0] ?? v.date}
      </td>
      <td className="px-3 py-2">
        <span
          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold
          ${v.status === "Pending" ? "bg-amber-100 text-amber-900" : v.status === "Approved" ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"}`}
        >
          {v.status}
        </span>
      </td>
      <td className="px-3 py-2">
        {v.status === "Pending" ? (
          <div className="flex gap-2">
            <button
              onClick={() => onApprove(v.id)}
              className="px-3 py-1 rounded-md bg-emerald-600 text-white text-sm hover:bg-emerald-700"
            >
              Approve
            </button>
            <button
              onClick={() => onReject(v.id)}
              className="px-3 py-1 rounded-md bg-rose-600 text-white text-sm hover:bg-rose-700"
            >
              Reject
            </button>
          </div>
        ) : (
          <button
            onClick={() => onView(v)}
            className="px-3 py-1 rounded-md bg-slate-100 text-slate-700 text-sm hover:bg-slate-200"
          >
            Details
          </button>
        )}
      </td>
    </tr>
  );
}

function VisitorModal({ open, visitor, onClose }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6">
        <div className="flex items-start gap-4">
          <img
            src={visitor.photo}
            alt={visitor.name}
            className="w-28 h-28 rounded-md object-cover"
          />
          <div>
            <h3 className="text-lg font-semibold text-slate-900">
              {visitor.name}
            </h3>
            <p className="text-sm text-slate-600 mt-1">{visitor.purpose}</p>
            <p className="text-sm text-slate-600 mt-1">
              Date:{" "}
              <span className="font-medium text-slate-800">
                {visitor.date?.split("T")[0]}
              </span>
            </p>
            <p className="text-sm text-slate-600 mt-1">
              Status: <span className="font-medium">{visitor.status}</span>
            </p>
          </div>
        </div>
        <div className="mt-5 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Visitors({ initialVisitors }) {
  const { user } = useAuth() ?? {};
  const societyId = user?.societyId;

  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [visitors, setVisitors] = useState(initialVisitors ?? []);
  const [active, setActive] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!societyId) return;
    let mounted = true;
    async function load() {
      setLoading(true);
      try {
        const v = await getVisitors(societyId, []);
        if (mounted) setVisitors(Array.isArray(v) ? v : []);
      } catch (err) {
        alert(
          err?.response?.data?.message ||
            err?.message ||
            "Failed to load visitors.",
        );
      } finally {
        setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, [societyId]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return visitors.filter((v) => {
      if (filter !== "all" && v.status !== filter) return false;
      if (!q) return true;
      return (
        v.name.toLowerCase().includes(q) ||
        (v.purpose || "").toLowerCase().includes(q)
      );
    });
  }, [visitors, query, filter]);

  const changeStatus = async (id, status) => {
    try {
      await updateVisitorStatus(id, status);
      setVisitors((prev) =>
        prev.map((v) => (v.id === id ? { ...v, status } : v)),
      );
    } catch (err) {
      alert(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to update visitor status.",
      );
    }
  };

  const handleApprove = (id) => changeStatus(id, "Approved");
  const handleReject = (id) => changeStatus(id, "Rejected");

  const openDetails = (v) => {
    setActive(v);
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete visitor?")) return;
    try {
      await deleteVisitor(id);
      setVisitors((prev) => prev.filter((v) => v.id !== id));
    } catch (err) {
      alert(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to delete visitor.",
      );
    }
  };

  const addNewVisitor = async (payload) => {
    try {
      const created = await addVisitor(payload);
      setVisitors((prev) => [created, ...prev]);
    } catch (err) {
      alert(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to add visitor.",
      );
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">
            Visitor Management
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Approve, reject or view visitor details.
          </p>
        </div>
        <div className="flex gap-3 items-center">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name or purpose"
            className="px-3 py-2 rounded-lg border border-slate-200 text-sm w-56 focus:outline-none focus:ring-2 focus:ring-indigo-200"
          />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none"
          >
            <option value="all">All</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-indigo-600">
            <tr>
              <th className="px-3 py-3 text-left text-sm font-medium text-white">
                Photo
              </th>
              <th className="px-3 py-3 text-left text-sm font-medium text-white">
                Name
              </th>
              <th className="px-3 py-3 text-left text-sm font-medium text-white">
                Purpose
              </th>
              <th className="px-3 py-3 text-left text-sm font-medium text-white">
                Date
              </th>
              <th className="px-3 py-3 text-left text-sm font-medium text-white">
                Status
              </th>
              <th className="px-3 py-3 text-left text-sm font-medium text-white">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y">
            {filtered.map((v) => (
              <VisitorRow
                key={v.id}
                v={v}
                onApprove={() => handleApprove(v.id)}
                onReject={() => handleReject(v.id)}
                onView={openDetails}
              />
            ))}
            {filtered.length === 0 && (
              <tr>
                <td
                  colSpan="6"
                  className="px-4 py-6 text-center text-sm text-slate-500"
                >
                  {loading ? "Loading..." : "No visitors found."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <VisitorModal
        open={modalOpen}
        visitor={active}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
}
