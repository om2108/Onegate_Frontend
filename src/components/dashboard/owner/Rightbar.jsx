import React, { memo, useEffect, useState, useContext } from "react";
import { AuthContext } from "../../../context/AuthContext";
import {
  fetchRequests,
  deleteAppointment,
  scoreAppointment,
} from "../../../api/appointment";
import { getAllProperties } from "../../../api/property";

function NoShowBadge({ score }) {
  if (score == null) return <span className="text-xs text-gray-500">—</span>;

  const pct = Math.round(score * 100);
  const highRisk = score >= 0.7;

  return (
    <span
      className={`px-2 py-0.5 rounded-full text-xs ${
        highRisk ? "text-red-700 bg-red-100" : "text-green-700 bg-green-100"
      }`}
    >
      {pct}%
    </span>
  );
}

function Rightbar() {
  const { user } = useContext(AuthContext);

  const [appointments, setAppointments] = useState([]);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scoring, setScoring] = useState({});

  useEffect(() => {
    fetchAppointments();
    // eslint-disable-next-line
  }, []);

  const fetchAppointments = async () => {
    try {
      const [apptRes, propRes] = await Promise.all([
        fetchRequests(),
        getAllProperties(),
      ]);

      // Case-insensitive ACCEPTED filter
      const accepted = Array.isArray(apptRes)
        ? apptRes.filter((a) => a.status?.toUpperCase() === "ACCEPTED")
        : [];

      setAppointments(accepted);
      setProperties(Array.isArray(propRes) ? propRes : []);
    } catch (err) {
      alert(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to fetch appointments.",
      );
    } finally {
      setLoading(false);
    }
  };

  const getPropertyName = (propertyId) => {
    const p = properties.find(
      (x) => x.id === propertyId || x._id === propertyId,
    );
    return p?.name || "Unknown Property";
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this appointment?")) return;

    try {
      await deleteAppointment(id);
      setAppointments((prev) => prev.filter((a) => (a.id || a._id) !== id));
    } catch (err) {
      alert(err?.response?.data?.message || err?.message || "Delete failed.");
    }
  };

  const handleScore = async (id) => {
    setScoring((s) => ({ ...s, [id]: true }));

    try {
      const updated = await scoreAppointment(id);

      setAppointments((prev) =>
        prev.map((a) =>
          (a.id || a._id) === (updated.id || updated._id) ? updated : a,
        ),
      );
    } catch (err) {
      alert(err?.response?.data?.message || err?.message || "Scoring failed.");
    } finally {
      setScoring((s) => ({ ...s, [id]: false }));
    }
  };

  const formatDate = (iso) => (iso ? new Date(iso).toLocaleDateString() : "—");

  const formatTime = (iso) =>
    iso
      ? new Date(iso).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })
      : "—";

  // Sort by datetime (old → new)
  const sortedAppointments = [...appointments].sort((a, b) => {
    const da = a.dateTime ? new Date(a.dateTime) : new Date(0);
    const db = b.dateTime ? new Date(b.dateTime) : new Date(0);
    return da - db;
  });

  return (
    <aside className="bg-white shadow-md rounded-lg p-4 w-full sm:w-80">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">
        Approved Appointments
      </h3>

      {loading ? (
        <p className="text-gray-500 text-center">Loading...</p>
      ) : sortedAppointments.length ? (
        <ul className="space-y-3">
          {sortedAppointments.map((appt) => {
            const id = appt.id || appt._id;

            return (
              <li
                key={id}
                className="flex justify-between bg-gray-50 px-3 py-2 rounded hover:bg-gray-100"
              >
                <div>
                  <p className="font-semibold">
                    {getPropertyName(appt.propertyId)}
                  </p>

                  <p className="text-sm text-gray-600">
                    📅 {formatDate(appt.dateTime)} ⏰{" "}
                    {formatTime(appt.dateTime)}
                  </p>

                  <p className="text-sm text-gray-500">
                    📍 {appt.location || "No location"}
                  </p>

                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs">No-show</span>
                    <NoShowBadge score={appt.noShowScore} />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => handleScore(id)}
                    disabled={scoring[id]}
                    className="bg-indigo-600 text-white text-sm px-3 py-1 rounded disabled:opacity-50"
                  >
                    {scoring[id] ? "Scoring…" : "Score"}
                  </button>

                  <button
                    onClick={() => handleDelete(id)}
                    className="text-red-500 text-lg"
                  >
                    ✕
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="text-center text-gray-500">No approved appointments</p>
      )}
    </aside>
  );
}

export default memo(Rightbar);
