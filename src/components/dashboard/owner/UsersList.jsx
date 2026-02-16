// src/components/users/UsersList.jsx
import React, { useEffect, useState } from "react";
import { getAllUsers, deleteUser } from "../../../api/user";
import AddUserModal from "./AddUserModal";
import EditUserRoleModal from "./EditUserRoleModal";

export default function UsersList() {
  const [users, setUsers] = useState([]);
  const [openAdd, setOpenAdd] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      setLoading(true);
      const data = await getAllUsers();
      setUsers(Array.isArray(data) ? data : []);
    } catch {
      alert("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const onDelete = async (id) => {
    if (!window.confirm("Delete this user?")) return;
    try {
      await deleteUser(id);
      load();
    } catch {
      alert("Error deleting user");
    }
  };

  useEffect(() => {
    load();
  }, []);

  const badgeForRole = (role = "") => {
    const r = role.toLowerCase();
    const base =
      "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium";
    if (r === "owner")
      return `${base} bg-purple-50 text-purple-700 border border-purple-200`;
    if (r === "tenant")
      return `${base} bg-emerald-50 text-emerald-700 border border-emerald-200`;
    if (r === "admin")
      return `${base} bg-sky-50 text-sky-700 border border-sky-200`;
    return `${base} bg-gray-100 text-gray-700 border border-gray-200`;
  };

  const badgeForStatus = (verified) =>
    verified
      ? "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200"
      : "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200";

  return (
    <>
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-4">
        <div>
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
            Users
          </h2>
          <p className="text-sm text-gray-500">
            Manage members, roles, and onboarding status.
          </p>
        </div>
        <button
          className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
          onClick={() => setOpenAdd(true)}
        >
          <span className="mr-1 text-base">＋</span>
          Invite User
        </button>
      </div>

      {/* Card container */}
      <div className="bg-white shadow-sm border border-gray-100 rounded-2xl">
        {loading ? (
          <div className="p-6 text-sm text-gray-500">Loading users…</div>
        ) : users.length === 0 ? (
          <div className="p-6 text-sm text-gray-500">
            No users found. Invite your first user using the button above.
          </div>
        ) : (
          <>
            {/* 📱 Mobile view – card layout */}
            <div className="md:hidden divide-y divide-gray-100">
              {users.map((u) => (
                <div
                  key={u.id}
                  className="px-4 py-3 flex flex-col gap-2 bg-white"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-gray-900 break-all">
                        {u.email}
                      </p>
                      <div className="mt-1 flex flex-wrap gap-2">
                        <span className={badgeForRole(u.role)}>
                          {u.role?.toLowerCase()}
                        </span>
                        <span className={badgeForStatus(u.verified)}>
                          {u.verified ? "Verified" : "Pending"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      className="px-3 py-1.5 rounded-lg text-xs font-medium bg-amber-500 text-white hover:bg-amber-600 focus:outline-none focus:ring-1 focus:ring-amber-500"
                      onClick={() => setEditTarget(u)}
                    >
                      Edit Role
                    </button>
                    <button
                      className="px-3 py-1.5 rounded-lg text-xs font-medium bg-red-600 text-white hover:bg-red-700 focus:outline-none focus:ring-1 focus:ring-red-500"
                      onClick={() => onDelete(u.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* 💻 Desktop / tablet – table layout */}
            <div className="hidden md:block overflow-x-auto rounded-2xl">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-4 py-3 font-medium text-gray-500">
                      Email
                    </th>
                    <th className="px-4 py-3 font-medium text-gray-500">
                      Role
                    </th>
                    <th className="px-4 py-3 font-medium text-gray-500">
                      Status
                    </th>
                    <th className="px-4 py-3 font-medium text-gray-500 text-center">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u, idx) => (
                    <tr
                      key={u.id}
                      className={
                        idx % 2 === 0
                          ? "bg-white border-b border-gray-50"
                          : "bg-gray-50 border-b border-gray-100"
                      }
                    >
                      <td className="px-4 py-3 text-gray-900 break-all">
                        {u.email}
                      </td>
                      <td className="px-4 py-3">
                        <span className={badgeForRole(u.role)}>
                          {u.role?.toLowerCase()}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={badgeForStatus(u.verified)}>
                          {u.verified ? "Verified" : "Pending"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-center gap-2">
                          <button
                            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-amber-500 text-white hover:bg-amber-600 focus:outline-none focus:ring-1 focus:ring-amber-500"
                            onClick={() => setEditTarget(u)}
                          >
                            Edit Role
                          </button>
                          <button
                            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-red-600 text-white hover:bg-red-700 focus:outline-none focus:ring-1 focus:ring-red-500"
                            onClick={() => onDelete(u.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Modals */}
      {openAdd && (
        <AddUserModal onClose={() => setOpenAdd(false)} onSuccess={load} />
      )}
      {editTarget && (
        <EditUserRoleModal
          user={editTarget}
          onClose={() => setEditTarget(null)}
          onSuccess={load}
        />
      )}
    </>
  );
}
