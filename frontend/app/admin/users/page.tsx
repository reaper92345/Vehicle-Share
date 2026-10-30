"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  MagneticButton,
  SmoothModal,
  useNotification,
} from "../../../components/smoothui";

interface User {
  id: string | number;
  full_name?: string;
  name?: string;
  email: string;
  phone_number?: string;
  user_type?: string;
  role?: string;
  created_at?: string;
  is_disabled?: boolean;
}

export default function DetailedAdminUsersPage() {
  const { success, error: notifyError, info: notifyInfo } = useNotification();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

  const fetchUsers = async () => {
    setLoading(true);
    const token = localStorage.getItem("equipshare_token");
    try {
      const res = await fetch(`${apiUrl}/api/admin/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setUsers(Array.isArray(data) ? data : data.users || []);
      } else {
        notifyError("Failed to Load Users", data.error || "Unable to reach user database.");
      }
    } catch (_) {
      notifyError("Network Error", "Could not synchronize contractor directory.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    const q = search.trim().toLowerCase();
    return users.filter((u) => {
      const name = u.full_name || u.name || "";
      const matchesSearch =
        !q ||
        name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.phone_number && u.phone_number.toLowerCase().includes(q));

      const userRole = (u.role || u.user_type || "renter").toLowerCase();
      const matchesRole = roleFilter === "all" || userRole === roleFilter;

      return matchesSearch && matchesRole;
    });
  }, [users, search, roleFilter]);

  const toggleDisabled = async (u: User) => {
    const token = localStorage.getItem("equipshare_token");
    try {
      const res = await fetch(`${apiUrl}/api/admin/users/${u.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ is_disabled: !u.is_disabled }),
      });

      if (res.ok) {
        setUsers((prev) =>
          prev.map((usr) => (usr.id === u.id ? { ...usr, is_disabled: !u.is_disabled } : usr))
        );
        success(
          "Account Status Updated",
          `${u.full_name || u.name || u.email} is now ${!u.is_disabled ? "Suspended" : "Active"}.`
        );
      } else {
        notifyError("Update Failed", "Could not toggle user authorization status.");
      }
    } catch (_) {
      notifyError("Network Error", "Failed to update user status.");
    }
  };

  const deleteUser = async (id: string | number) => {
    if (!confirm("Are you sure you want to permanently remove this user account?")) return;
    const token = localStorage.getItem("equipshare_token");
    try {
      const res = await fetch(`${apiUrl}/api/admin/users/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setUsers((prev) => prev.filter((u) => u.id !== id));
        success("Account Removed", "Contractor account has been deleted.");
        setSelectedUser(null);
      } else {
        notifyError("Delete Failed", "Could not remove user record.");
      }
    } catch (_) {
      notifyError("Network Error", "Failed to delete user account.");
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
            <span className="text-xs font-black uppercase tracking-wider text-emerald-700">
              Contractor & Machine Owner KYC Registry
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
            User Directory & Access Control
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit contractor identities, machinery owner licenses, and account permissions across Nepal.
          </p>
        </div>

        <MagneticButton
          onClick={fetchUsers}
          className="btn-secondary text-xs py-2 px-3.5 rounded-xl border border-slate-200 flex items-center gap-1.5 shadow-xs"
        >
          🔄 Refresh Directory
        </MagneticButton>
      </div>

      {/* Filter and Search Bar */}
      <div className="card p-5 bg-white border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Role Filter Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: "all", label: "All Users" },
            { id: "renter", label: "Hirers / Renters" },
            { id: "owner", label: "Machinery Owners" },
            { id: "admin", label: "Administrators" },
          ].map((pill) => (
            <button
              key={pill.id}
              onClick={() => setRoleFilter(pill.id)}
              className={`text-xs font-bold px-3 py-1.5 rounded-xl transition ${
                roleFilter === pill.id
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {pill.label}
            </button>
          ))}
        </div>

        <input
          type="text"
          placeholder="Search by name, email, phone number..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input text-xs max-w-sm"
        />
      </div>

      {/* Users Table */}
      <div className="card overflow-hidden bg-white border border-slate-200 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-slate-50 text-slate-500 text-left border-b border-slate-200">
              <tr>
                <th className="p-3.5">Contractor / Name</th>
                <th className="p-3.5">Contact Email</th>
                <th className="p-3.5">Phone Number</th>
                <th className="p-3.5">Portal Role</th>
                <th className="p-3.5">KYC & Access Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.map((u) => {
                const role = (u.role || u.user_type || "renter").toLowerCase();
                return (
                  <tr key={u.id} className="hover:bg-slate-50/70 transition">
                    <td className="p-3.5">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center shrink-0">
                          {(u.full_name || u.name || "U")[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">
                            {u.full_name || u.name || "Anonymous Contractor"}
                          </p>
                          <span className="text-[10px] text-slate-400 font-mono">UID: #{u.id}</span>
                        </div>
                      </div>
                    </td>

                    <td className="p-3.5 font-mono text-slate-700">{u.email}</td>
                    <td className="p-3.5 text-slate-600 font-medium">
                      {u.phone_number || "+977-XXXXXXXXXX"}
                    </td>

                    <td className="p-3.5">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                          role === "admin"
                            ? "bg-purple-100 text-purple-800"
                            : role === "owner"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {role}
                      </span>
                    </td>

                    <td className="p-3.5">
                      {u.is_disabled ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-0.5 text-[10px] font-bold text-rose-700 border border-rose-200">
                          <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                          Suspended
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                          KYC Active
                        </span>
                      )}
                    </td>

                    <td className="p-3.5 text-right space-x-2">
                      <button
                        onClick={() => setSelectedUser(u)}
                        className="text-[11px] font-bold text-brand-700 hover:text-brand-900 underline px-1.5"
                      >
                        Inspect
                      </button>
                      <button
                        onClick={() => toggleDisabled(u)}
                        className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border transition ${
                          u.is_disabled
                            ? "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                            : "border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100"
                        }`}
                      >
                        {u.is_disabled ? "Reactivate" : "Suspend"}
                      </button>
                    </td>
                  </tr>
                );
              })}

              {filteredUsers.length === 0 && !loading && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">
                    No users matching criteria found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Inspect Modal */}
      <SmoothModal
        isOpen={!!selectedUser}
        onClose={() => setSelectedUser(null)}
        title="Contractor & Account File"
      >
        {selectedUser && (
          <div className="space-y-4 text-xs">
            <div className="rounded-xl bg-slate-50 p-4 border border-slate-200 space-y-2">
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500">Full Legal Name:</span>
                <span className="font-bold text-slate-900">{selectedUser.full_name || selectedUser.name}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500">Email Address:</span>
                <span className="font-mono font-semibold text-slate-800">{selectedUser.email}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500">Phone Contact:</span>
                <span className="font-semibold text-slate-800">{selectedUser.phone_number || "Not provided"}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500">Assigned Role:</span>
                <span className="font-bold text-brand-700 uppercase">{selectedUser.role || selectedUser.user_type}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Account Access:</span>
                <span className={selectedUser.is_disabled ? "text-rose-600 font-bold" : "text-emerald-600 font-bold"}>
                  {selectedUser.is_disabled ? "Suspended" : "Active & Verified"}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => deleteUser(selectedUser.id)}
                className="text-rose-600 hover:text-rose-800 font-bold text-xs"
              >
                🗑️ Permanently Delete Account
              </button>
              <MagneticButton
                onClick={() => setSelectedUser(null)}
                className="btn-primary text-xs py-2 px-4 rounded-xl"
              >
                Close
              </MagneticButton>
            </div>
          </div>
        )}
      </SmoothModal>
    </div>
  );
}
