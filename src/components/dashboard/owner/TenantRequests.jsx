// src/components/dashboard/owner/TenantRequests.jsx
import React, { useState, useEffect, useContext, memo } from "react";
import { AuthContext } from "../../../context/AuthContext";
import {
  fetchRequests,
  approveRequest,
  deleteAppointment as rejectRequest,
  scoreAppointment,
} from "../../../api/appointment";
import { getAllProperties } from "../../../api/property";
import { getAllUsers } from "../../../api/user";

function NoShowBadge({ score }) {
  // score is expected in 0.0 .. 1.0 or null/undefined
  if (score == null) return <span className="text-xs text-gray-500">—</span>;
  const pct = Math.round(Number(score) * 100);
  const high = score >= 0.7;
  const med = score >= 0.4 && score < 0.7;
  const cls = high
    ? "inline-flex items-center gap-2 px-2 py-0.5 rounded-full text-xs font-semibold text-red-800 bg-red-100"
    : med
      ? "inline-flex items-center gap-2 px-2 py-0.5 rounded-full text-xs font-semibold text-amber-800 bg-amber-100"
      : "inline-flex items-center gap-2 px-2 py-0.5 rounded-full text-xs font-semibold text-green-800 bg-green-100";
  const emoji = high ? "🔴" : med ? "🟠" : "🟢";
  return (
    <span className={cls} title={`No-show risk: ${pct}%`}>
      <span className="text-[10px]">{emoji}</span>
      <span>{pct}%</span>
    </span>
  );
}

function TenantRequests() {
  const { user } = useContext(AuthContext);
  const [requests, setRequests] = useState([]);
  const [properties, setProperties] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingReq, setEditingReq] = useState(null);
  const [editDate, setEditDate] = useState("");
  const [editTime, setEditTime] = useState("");
  const [editLocation, setEditLocation] = useState("");
  const [scoring, setScoring] = useState({}); // { [id]: boolean }

  useEffect(() => {
    const load = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const [reqData, propData, usersData] = await Promise.all([
          fetchRequests(),
          getAllProperties(),
          getAllUsers(),
        ]);
        setRequests(Array.isArray(reqData) ? reqData : []);
        setProperties(Array.isArray(propData) ? propData : []);
        setUsers(Array.isArray(usersData) ? usersData : []);
      } catch (err) {
        alert(
          err?.response?.data?.message ||
            err?.message ||
            "Failed to fetch requests.",
        );
      } finally {
        setLoading(false);
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const getPropertyName = (id) => {
    const property = properties.find((p) => p.id === id || p._id === id);
    return property?.name || property?.title || "Unnamed Property";
  };

  const getUserProfileById = (id) => {
    if (!id) return null;
    const profile = users.find(
      (p) => p.id === id || p._id === id || p.userId === id || p._userId === id,
    );
    return profile || null;
  };

  const getTenantDisplay = (req) => {
    const obj =
      req.tenant && typeof req.tenant === "object"
        ? req.tenant
        : req.user && typeof req.user === "object"
          ? req.user
          : null;

    if (obj) {
      const name =
        obj.name ||
        obj.fullName ||
        obj.username ||
        (obj.firstName || obj.lastName
          ? `${obj.firstName || ""} ${obj.lastName || ""}`.trim()
          : "");
      return {
        name: name || "Unnamed",
        email: obj.email || obj.emailAddress || "No Email",
      };
    }

    const possibleId = req.userId || req.tenantId || req.requestedBy;
    const profile = getUserProfileById(possibleId);
    if (!profile) return { name: "Unknown User", email: "N/A" };

    return {
      name:
        profile.name ||
        profile.fullName ||
        profile.username ||
        (profile.firstName || profile.lastName
          ? `${profile.firstName || ""} ${profile.lastName || ""}`.trim()
          : "Unnamed"),
      email: profile.email || profile.emailAddress || "No Email",
    };
  };

  const openApproveModal = (req) => {
    setEditingReq(req);

    if (req.dateTime) {
      const dt = new Date(req.dateTime);
      const iso = dt.toISOString();
      setEditDate(iso.slice(0, 10));
      setEditTime(iso.slice(11, 16));
    } else {
      setEditDate("");
      setEditTime("");
    }

    setEditLocation(req.location || "");
  };

  const closeApproveModal = () => {
    setEditingReq(null);
    setEditDate("");
    setEditTime("");
    setEditLocation("");
  };

  const handleConfirmApprove = async (e) => {
    e.preventDefault();
    if (!editingReq) return;

    let dateTime = null;
    if (editDate && editTime) dateTime = `${editDate}T${editTime}:00`;
    else if (editDate) dateTime = `${editDate}T09:00:00`;

    const payload = {
      accepted: true,
      dateTime,
      location: editLocation || editingReq.location || "",
    };

    try {
      await approveRequest(editingReq.id || editingReq._id, payload);

      setRequests((prev) =>
        prev.map((r) => {
          const rid = r.id || r._id;
          const eid = editingReq.id || editingReq._id;
          if (rid !== eid) return r;
          return {
            ...r,
            status: "ACCEPTED",
            dateTime: dateTime || r.dateTime,
            location: payload.location,
          };
        }),
      );
      closeApproveModal();
    } catch (err) {
      alert(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to approve request.",
      );
    }
  };

  const handleReject = async (id) => {
    if (!window.confirm("Delete this appointment?")) return;
    try {
      await rejectRequest(id);
      setRequests((prev) => prev.filter((r) => (r.id || r._id) !== id));
    } catch (err) {
      alert(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to reject request.",
      );
    }
  };

  const handleScore = async (req) => {
    const id = req.id || req._id;
    if (!id) return;
    setScoring((s) => ({ ...s, [id]: true }));
    try {
      const updated = await scoreAppointment(id);

      // replace/merge updated appointment into state
      setRequests((prev) =>
        prev.map((r) => {
          const rid = r.id || r._id;
          if (rid === (updated.id || updated._id)) {
            // ensure minimal fallback so UI doesn't break if backend returned partial doc
            return {
              ...r,
              ...updated,
            };
          }
          return r;
        }),
      );
    } catch (err) {
      alert(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to score appointment.",
      );
    } finally {
      setScoring((s) => ({ ...s, [id]: false }));
    }
  };

  if (loading)
    return <div className="p-6 text-gray-600">Loading requests...</div>;
  if (!requests.length)
    return <div className="p-6 text-gray-600">No requests found.</div>;

  return (
    <div className="p-4 sm:p-6">
      <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-gray-800">
        Tenant Appointment Requests
      </h2>

      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
        <table className="min-w-full bg-white">
          <thead className="bg-gray-100 text-gray-700 text-sm font-semibold">
            <tr>
              {[
                "Property Name",
                "Tenant Name",
                "Tenant Email",
                "Status",
                "Requested For",
                "Meet Location",
                "Requested At",
                "Risk",
                "Actions",
              ].map((h) => (
                <th key={h} className="py-3 px-4 text-left border-b">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {requests.map((req) => {
              const tenant = getTenantDisplay(req);
              const id = req.id || req._id;
              const score =
                typeof req.noShowScore === "number"
                  ? req.noShowScore
                  : (req.noShowScore ?? null);
              return (
                <tr key={id} className="hover:bg-gray-50 transition">
                  <td className="py-3 px-4">
                    {getPropertyName(req.propertyId)}
                  </td>
                  <td className="py-3 px-4">{tenant.name}</td>
                  <td className="py-3 px-4">{tenant.email}</td>
                  <td className="py-3 px-4">{req.status}</td>
                  <td className="py-3 px-4">
                    {req.dateTime
                      ? new Date(req.dateTime).toLocaleString()
                      : "N/A"}
                  </td>
                  <td className="py-3 px-4">{req.location || "N/A"}</td>
                  <td className="py-3 px-4">
                    {req.createdAt
                      ? new Date(req.createdAt).toLocaleString()
                      : "N/A"}
                  </td>
                  <td className="py-3 px-4">
                    <NoShowBadge score={score} />
                  </td>
                  <td className="py-3 px-4 space-x-2">
                    {req.status === "REQUESTED" ? (
                      <>
                        <button
                          onClick={() => openApproveModal(req)}
                          className="bg-green-500 hover:bg-green-600 text-white text-sm px-3 py-1.5 rounded-md"
                        >
                          Approve
                        </button>

                        <button
                          onClick={() => handleReject(id)}
                          className="bg-red-500 hover:bg-red-600 text-white text-sm px-3 py-1.5 rounded-md"
                        >
                          Reject
                        </button>

                        <button
                          onClick={() => handleScore(req)}
                          disabled={!!scoring[id]}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm px-3 py-1.5 rounded-md"
                        >
                          {scoring[id] ? "Scoring…" : "Score"}
                        </button>
                      </>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-medium ${req.status === "ACCEPTED" ? "text-green-700" : req.status === "DECLINED" ? "text-red-700" : "text-gray-600"}`}
                        >
                          {req.status}
                        </span>

                        <button
                          onClick={() => handleScore(req)}
                          disabled={!!scoring[id]}
                          className="text-sm px-2 py-1 rounded bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
                        >
                          {scoring[id] ? "Scoring…" : "Re-score"}
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="space-y-4 md:hidden">
        {requests.map((req) => {
          const tenant = getTenantDisplay(req);
          const id = req.id || req._id;
          return (
            <div
              key={id}
              className="bg-white shadow-md rounded-lg border border-gray-200 p-4"
            >
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                {getPropertyName(req.propertyId)}
              </h3>
              <p className="text-sm text-gray-600">
                <strong>Tenant:</strong> {tenant.name}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Email:</strong> {tenant.email}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Requested For:</strong>{" "}
                {req.dateTime ? new Date(req.dateTime).toLocaleString() : "N/A"}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Meet Location:</strong> {req.location || "N/A"}
              </p>
              <p className="text-sm text-gray-600 mb-2">
                <strong>Status:</strong>{" "}
                <span
                  className={`font-medium ${req.status === "ACCEPTED" ? "text-green-700" : req.status === "DECLINED" ? "text-red-700" : "text-gray-700"}`}
                >
                  {req.status}
                </span>
              </p>

              <div className="flex items-center justify-between gap-3">
                <NoShowBadge score={req.noShowScore} />
                {req.status === "REQUESTED" ? (
                  <div className="flex gap-2 w-full">
                    <button
                      onClick={() => openApproveModal(req)}
                      className="flex-1 bg-green-500 hover:bg-green-600 text-white text-sm py-2 rounded-md"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(id)}
                      className="flex-1 bg-red-500 hover:bg-red-600 text-white text-sm py-2 rounded-md"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => handleScore(req)}
                      disabled={!!scoring[id]}
                      className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white text-sm py-2 rounded-md"
                    >
                      {scoring[id] ? "Scoring…" : "Score"}
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => handleScore(req)}
                    disabled={!!scoring[id]}
                    className="px-3 py-2 bg-indigo-600 text-white rounded-md text-sm"
                  >
                    {scoring[id] ? "Scoring…" : "Re-score"}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Approve modal */}
      {editingReq && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-3">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <h3 className="font-semibold text-gray-900">
                Approve Appointment
              </h3>
              <button
                onClick={closeApproveModal}
                className="px-2 py-1 rounded-md text-gray-600 hover:bg-gray-100"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleConfirmApprove} className="p-4 space-y-4">
              <div className="text-sm text-gray-700">
                <p>
                  <strong>Property:</strong>{" "}
                  {getPropertyName(editingReq.propertyId)}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    Visit Date
                  </label>
                  <input
                    type="date"
                    value={editDate}
                    onChange={(e) => setEditDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    Visit Time
                  </label>
                  <input
                    type="time"
                    value={editTime}
                    onChange={(e) => setEditTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    Meet Location
                  </label>
                  <input
                    type="text"
                    value={editLocation}
                    onChange={(e) => setEditLocation(e.target.value)}
                    placeholder="Society gate / Lobby / etc."
                    className="w-full px-3 py-2 rounded-lg border border-gray-300"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={closeApproveModal}
                  className="px-3 py-2 rounded-lg border border-gray-300 text-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-2 rounded-lg border border-green-600 bg-green-600 text-white"
                >
                  Confirm & Approve
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default memo(TenantRequests);
