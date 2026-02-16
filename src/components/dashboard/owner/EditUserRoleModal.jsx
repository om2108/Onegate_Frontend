// src/components/users/EditUserRoleModal.jsx
import React, { useState } from "react";
import { updateUserRole } from "../../../api/user";
import { motion } from "framer-motion";

export default function EditUserRoleModal({ user, onClose, onSuccess }) {
  const [role, setRole] = useState(user.role);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    try {
      setLoading(true);
      await updateUserRole(user.id, role);
      onSuccess?.();
      onClose();
    } catch (err) {
      alert("Failed to update role");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 grid place-items-center z-50">
      <motion.div
        className="bg-white p-6 rounded-xl w-[400px]"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <h2 className="text-lg font-semibold mb-4">Update Role</h2>

        <p className="text-sm mb-2 text-gray-700">{user.email}</p>

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

        <div className="flex justify-end gap-3 mt-4">
          <button className="px-4 py-2 bg-gray-200 rounded" onClick={onClose}>
            Cancel
          </button>
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded"
            onClick={submit}
            disabled={loading}
          >
            {loading ? "Updating..." : "Update"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
