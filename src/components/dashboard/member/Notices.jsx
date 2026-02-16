import React, { useEffect, useState } from "react";
import {
  getNotices,
  createNotice,
  updateNotice,
  deleteNotice,
} from "../../../api/notice";

export default function Notices() {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      try {
        const data = await getNotices();
        if (mounted) setNotices(Array.isArray(data) ? data : []);
      } catch (err) {
        alert(
          err?.response?.data?.message ||
            err?.message ||
            "Failed to load notices.",
        );
      } finally {
        setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, []);

  const handleCreate = async (payload) => {
    try {
      const created = await createNotice(payload);
      setNotices((prev) => [created, ...prev]);
    } catch (err) {
      alert(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to create notice.",
      );
    }
  };

  const handleUpdate = async (id, data) => {
    try {
      const updated = await updateNotice(id, data);
      setNotices((prev) => prev.map((n) => (n.id === id ? updated : n)));
    } catch (err) {
      alert(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to update notice.",
      );
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete notice?")) return;
    try {
      await deleteNotice(id);
      setNotices((prev) => prev.filter((n) => n.id !== id));
    } catch (err) {
      alert(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to delete notice.",
      );
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <h2 className="text-2xl font-semibold text-slate-900">Notices</h2>
      <div className="mt-6 bg-white rounded-2xl p-4 shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-slate-500">
              <th className="pb-2">Date</th>
              <th className="pb-2">Notice</th>
              <th className="pb-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="3" className="py-6 text-center">
                  Loading...
                </td>
              </tr>
            ) : notices.length === 0 ? (
              <tr>
                <td colSpan="3" className="py-6 text-center">
                  No notices yet.
                </td>
              </tr>
            ) : (
              notices.map((n) => (
                <tr key={n.id} className="border-t">
                  <td className="py-3 text-slate-600">
                    {n.date?.split("T")[0] ?? n.date}
                  </td>
                  <td className="py-3 text-slate-700">{n.text || n.title}</td>
                  <td className="py-3">
                    <button
                      onClick={() => handleDelete(n.id)}
                      className="px-3 py-1 rounded-md bg-rose-600 text-white text-sm hover:bg-rose-700"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
