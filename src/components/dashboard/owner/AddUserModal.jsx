// src/components/users/AddUserModal.jsx
import React, { useState } from "react";
import { inviteUser } from "../../../api/user";
import { motion } from "framer-motion";

export default function AddUserModal({ onClose, onSuccess }) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("USER");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!email.trim()) return alert("Enter email");

    try {
      setLoading(true);
      await inviteUser({ email, role });
      onSuccess?.();
      onClose();
    } catch (err) {
      alert("Error: " + (err?.response?.data?.error || "Failed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 grid place-items-center z-50">
      <motion.div
        className="bg-white p-6 rounded-xl w-[400px]"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
      >
        <h2 className="text-xl font-semibold mb-4">Invite User</h2>

        <label>Email</label>
        <input
          type="email"
          className="w-full border px-3 py-2 rounded mb-4"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter user's email"
        />

        <label>Role</label>
        <select
          className="w-full border px-3 py-2 rounded mb-4"
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >
          <option value="USER">User</option>
          <option value="MEMBER">Member</option>
          <option value="SECRETARY">Secretary</option>
          <option value="WATCHMAN">Watchman</option>
        </select>

        <div className="flex justify-end gap-3">
          <button className="px-4 py-2 bg-gray-300 rounded" onClick={onClose}>
            Cancel
          </button>
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded"
            onClick={submit}
            disabled={loading}
          >
            {loading ? "Sending..." : "Invite"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
