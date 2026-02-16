import React, { useEffect, useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import { getComplaintsByMember } from "../../../api/complaint";
import { getVisitors } from "../../../api/visitor";
import { getEvents } from "../../../api/event";
import { getNotices } from "../../../api/notice";

export default function MemberHome() {
  const { user } = useAuth();
  const userId = user?.id;
  const societyId = user?.societyId;

  const [complaints, setComplaints] = useState([]);
  const [visitors, setVisitors] = useState([]);
  const [events, setEvents] = useState([]);
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // stop infinite loading if auth not ready
    if (!userId || !societyId) {
      setLoading(false);
      return;
    }

    (async () => {
      try {
        setLoading(true);

        const c = await getComplaintsByMember(userId);
        const v = await getVisitors(societyId, [userId]);
        const e = await getEvents(societyId, [user?.role]);
        const n = await getNotices();

        setComplaints(c || []);
        setVisitors(v || []);
        setEvents(e || []);
        setNotices(n || []);
      } catch (err) {
        alert(
          err?.response?.data?.message ||
            err?.message ||
            "Failed to load maintenance data.",
        );
      } finally {
        setLoading(false);
      }
    })();
  }, [userId, societyId]);

  const activeComplaints = complaints.filter(
    (c) => !["RESOLVED", "Closed"].includes(c.status),
  ).length;

  if (loading) {
    return (
      <div className="p-6 text-center text-gray-500">Loading dashboard...</div>
    );
  }

  return (
    <div className="p-6 space-y-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-semibold">Member Dashboard</h2>
        <p className="text-gray-500 text-sm">Welcome back 👋</p>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-4">
        <Stat title="Active Complaints" value={activeComplaints} />
        <Stat title="Visitors" value={visitors.length} />
        <Stat title="Events" value={events.length} />
        <Stat title="Notices" value={notices.length} />
      </div>

      {/* Main Content */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Complaints */}
        <div className="md:col-span-2 bg-white rounded-xl shadow p-5">
          <h3 className="font-semibold mb-4">My Complaints</h3>

          {complaints.length === 0 ? (
            <p className="text-gray-400">No complaints raised.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="py-2">Title</th>
                  <th>Status</th>
                  <th>Priority</th>
                </tr>
              </thead>

              <tbody>
                {complaints.map((c) => (
                  <tr key={c.id} className="border-b last:border-none">
                    <td className="py-2">{c.title}</td>

                    <td>
                      <span
                        className={`px-2 py-1 rounded text-xs
                        ${
                          c.status === "RESOLVED"
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {c.status}
                      </span>
                    </td>

                    <td>{c.priority || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Notices */}
        <div className="bg-white rounded-xl shadow p-5">
          <h3 className="font-semibold mb-4">Latest Notices</h3>

          {notices.length === 0 ? (
            <p className="text-gray-400">No notices</p>
          ) : (
            notices.slice(0, 5).map((n) => (
              <div key={n.id} className="border-b py-2 last:border-none">
                <p className="font-medium text-sm">{n.title}</p>
                <p className="text-xs text-gray-500">{n.description}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

/* Small Components */

const Stat = ({ title, value }) => (
  <div className="bg-white p-4 rounded-xl shadow">
    <p className="text-xs text-gray-500">{title}</p>
    <p className="text-2xl font-bold">{value}</p>
  </div>
);
