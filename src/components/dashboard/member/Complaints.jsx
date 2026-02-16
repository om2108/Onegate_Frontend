import React, { useState, useEffect } from "react";
import { useAuth } from "../../../context/AuthContext";
import {
  getComplaintsByMember,
  addComplaint,
  updateComplaintStatus,
  deleteComplaint,
  getComplaintById,
} from "../../../api/complaint";

function Row({ c, onView, onEdit }) {
  return (
    <tr className="hover:bg-slate-50">
      <td className="px-3 py-3 text-sm text-slate-700">{c.title}</td>
      <td className="px-3 py-3 text-sm text-slate-600">{c.category}</td>
      <td className="px-3 py-3 text-sm text-slate-600">
        {c.date?.split("T")[0] ?? c.date}
      </td>
      <td className="px-3 py-3">
        <span
          className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold
          ${c.status === "Pending" ? "bg-amber-100 text-amber-900" : c.status === "In Progress" ? "bg-sky-100 text-sky-800" : "bg-emerald-100 text-emerald-800"}`}
        >
          {c.status}
        </span>
      </td>
      <td className="px-3 py-3">
        <div className="flex gap-2">
          <button
            onClick={() => onView(c)}
            className="px-3 py-1 rounded-md bg-indigo-600 text-white text-sm hover:bg-indigo-700"
          >
            View
          </button>
          <button
            onClick={() => onEdit(c)}
            className="px-3 py-1 rounded-md bg-amber-400 text-slate-900 text-sm hover:bg-amber-500"
          >
            Edit
          </button>
        </div>
      </td>
    </tr>
  );
}

function Modal({ open, onClose, complaint, onSave, onDelete }) {
  const [desc, setDesc] = useState(complaint?.description ?? "");
  useEffect(() => setDesc(complaint?.description ?? ""), [complaint]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold text-indigo-600">
              {complaint.title}
            </h3>
            <p className="text-sm text-slate-500 mt-1">
              {complaint.category} · {complaint.date?.split("T")[0]}
            </p>
            <p className="text-sm text-slate-600 mt-3">
              <span className="font-medium">Status:</span> {complaint.status}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600"
          >
            ✕
          </button>
        </div>
        <div className="mt-4">
          <label className="text-sm text-slate-700">Description</label>
          <textarea
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            className="w-full mt-2 p-3 rounded-lg border border-slate-200 text-sm"
            rows="5"
          ></textarea>
        </div>
        <div className="mt-4 flex justify-between items-center">
          <div>
            <button
              onClick={() => onDelete(complaint.id)}
              className="px-4 py-2 rounded-lg bg-rose-600 text-white mr-2"
            >
              Delete
            </button>
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700"
            >
              Close
            </button>
            <button
              onClick={() => onSave({ ...complaint, description: desc })}
              className="px-4 py-2 rounded-lg bg-emerald-600 text-white"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Complaints({ initial }) {
  const { user } = useAuth() ?? {};
  const userId = user?.id;

  const today = new Date().toISOString().split("T")[0];
  const [list, setList] = useState(initial ?? []);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [fileName, setFileName] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [active, setActive] = useState(null);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!userId) return;
    let mounted = true;
    async function load() {
      setLoading(true);
      try {
        const data = await getComplaintsByMember(userId);
        if (mounted) setList(Array.isArray(data) ? data : []);
      } catch (err) {
        alert(
          err?.response?.data?.message ||
            err?.message ||
            "Failed to load complaints.",
        );
      } finally {
        setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, [userId]);

  const submit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !category || !description.trim()) return;
    const payload = {
      title: title.trim(),
      category,
      description: description.trim(),
      attachment: fileName || null,
      userId,
    };
    try {
      const created = await addComplaint(payload);
      setList((s) => [created, ...s]);
      setTitle("");
      setCategory("");
      setDescription("");
      setFileName("");
    } catch (err) {
      alert(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to submit complaint.",
      );
    }
  };

  const handleView = async (c) => {
    // best-effort: fetch latest from server
    try {
      const fresh = await getComplaintById(c.id);
      setActive(fresh ?? c);
    } catch {
      setActive(c);
    }
    setModalOpen(true);
  };

  const handleEdit = (c) => {
    setActive(c);
    setModalOpen(true);
  };

  const handleSave = async (updated) => {
    // If only description changed and no edit endpoint exists, update locally.
    // If you have a full update endpoint, call it here.
    // Example using updateComplaintStatus for status changes:
    try {
      // If only status changed and you have update endpoint, call it:
      // await updateComplaintStatus(updated.id, updated.status, updated.priority);
      setList((s) => s.map((it) => (it.id === updated.id ? updated : it)));
      setModalOpen(false);
    } catch (err) {
      alert(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to save complaint.",
      );
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete complaint?")) return;
    try {
      await deleteComplaint(id);
      setList((s) => s.filter((x) => x.id !== id));
      setModalOpen(false);
    } catch (err) {
      alert(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to delete complaint.",
      );
    }
  };

  const handleFile = (e) => {
    const f = e.target.files?.[0];
    if (f) setFileName(f.name);
  };

  const filtered = list.filter((it) => {
    if (!q) return true;
    const s = q.toLowerCase();
    return (
      it.title.toLowerCase().includes(s) ||
      it.category.toLowerCase().includes(s) ||
      (it.description || "").toLowerCase().includes(s)
    );
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-900">Complaints</h1>
        <p className="text-sm text-slate-500 mt-1">
          Raise and track complaints
        </p>
      </div>

      <form
        onSubmit={submit}
        className="bg-white rounded-2xl shadow-sm p-4 sm:p-6 mb-6 grid gap-3"
      >
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Complaint Title"
            className="px-3 py-2 rounded-md border border-slate-200 text-sm col-span-2"
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="px-3 py-2 rounded-md border border-slate-200 text-sm"
          >
            <option value="">Select Category</option>
            <option>Plumbing</option>
            <option>Electricity</option>
            <option>Lift Issue</option>
            <option>Security</option>
            <option>Cleanliness</option>
          </select>
        </div>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows="4"
          placeholder="Describe your issue..."
          className="px-3 py-2 rounded-md border border-slate-200 text-sm"
        ></textarea>
        <div className="flex items-center gap-3">
          <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-2 rounded-md bg-slate-100 text-sm">
            Upload Photo
            <input
              type="file"
              onChange={handleFile}
              className="hidden"
              accept="image/*"
            />
          </label>
          <div className="text-sm text-slate-500">
            {fileName || "No file selected"}
          </div>
          <button
            type="submit"
            className="ml-auto px-4 py-2 bg-indigo-600 text-white rounded-lg"
          >
            Submit Complaint
          </button>
        </div>
      </form>

      <div className="flex items-center justify-between mb-3 gap-3">
        <h2 className="text-lg font-medium text-slate-900">Your Complaints</h2>
        <div className="flex gap-3 items-center">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search"
            className="px-3 py-2 rounded-md border border-slate-200 text-sm"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-indigo-600">
            <tr>
              <th className="px-3 py-3 text-left text-sm font-medium text-white">
                Title
              </th>
              <th className="px-3 py-3 text-left text-sm font-medium text-white">
                Category
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
            {filtered.length === 0 && (
              <tr>
                <td
                  colSpan="5"
                  className="px-4 py-6 text-center text-sm text-slate-500"
                >
                  {loading ? "Loading..." : "No complaints found."}
                </td>
              </tr>
            )}
            {filtered.map((c) => (
              <Row key={c.id} c={c} onView={handleView} onEdit={handleEdit} />
            ))}
          </tbody>
        </table>
      </div>

      <Modal
        open={modalOpen}
        complaint={active}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        onDelete={handleDelete}
      />
    </div>
  );
}
