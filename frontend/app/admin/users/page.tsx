"use client";
import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type User = {
  id: string;
  full_name: string;
  email: string;
  phone_number: string;
  user_type: string;
  created_at: string;
  is_disabled?: boolean;
};

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [search, setSearch] = useState("");
  const [editUser, setEditUser] = useState<User | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
  const token = () => localStorage.getItem("equipshare_token");

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${apiUrl}/api/admin/users`, {
        headers: { Authorization: `Bearer ${token()}` },
      });
      const data = await res.json();
      if (res.ok) {
        setUsers(data.users);
      } else {
        setError(data.error || "Failed to load users");
      }
    } catch (e) {
      setError("Network error while fetching users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return users;
    return users.filter((u) =>
      [u.full_name, u.email, u.phone_number, u.user_type].some((v) => String(v).toLowerCase().includes(q))
    );
  }, [users, search]);

  const deleteUser = async (id: string) => {
    if (!confirm("Delete this user?")) return;
    const res = await fetch(`${apiUrl}/api/admin/users/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token()}` },
    });
    if (res.ok) {
      setUsers(users.filter((u) => u.id !== id));
    } else {
      const data = await res.json();
      alert(data.error || "Failed to delete");
    }
  };

  const toggleDisabled = async (u: User) => {
    const res = await fetch(`${apiUrl}/api/admin/users/${u.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}` },
      body: JSON.stringify({ is_disabled: !u.is_disabled }),
    });
    if (res.ok) fetchUsers();
  };

  if (loading) return <p className="p-6">Loading users...</p>;
  if (error) return <p className="p-6 text-red-600">{error}</p>;

  return (
    <section className="p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-bold">User Management</h1>
        <input className="input max-w-xs" placeholder="Search name, email, phone, role" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>
      <table className="user-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Role</th>
            <th>Status</th>
            <th>Created</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((u) => (
            <tr key={u.id}>
              <td>{u.full_name}</td>
              <td>{u.email}</td>
              <td>{u.phone_number}</td>
              <td className="capitalize">{u.user_type}</td>
              <td>{u.is_disabled ? "Disabled" : "Active"}</td>
              <td>{new Date(u.created_at).toLocaleString()}</td>
              <td className="space-x-2">
                <button onClick={() => { setEditUser(u); setShowEditModal(true); }} className="text-sm text-blue-600 hover:underline">Edit</button>
                <button onClick={() => toggleDisabled(u)} className="text-sm text-amber-700 hover:underline">
                  {u.is_disabled ? "Enable" : "Disable"}
                </button>
                <button onClick={() => deleteUser(u.id)} className="text-sm text-red-600 hover:underline">Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {showEditModal && editUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-96">
            <h2 className="text-xl font-bold mb-4">Edit User</h2>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const form = e.target as HTMLFormElement;
                const res = await fetch(`${apiUrl}/api/admin/users/${editUser.id}`, {
                  method: "PUT",
                  headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}` },
                  body: JSON.stringify({
                    full_name: (form.elements.namedItem("full_name") as HTMLInputElement).value,
                    email: (form.elements.namedItem("email") as HTMLInputElement).value,
                    phone_number: (form.elements.namedItem("phone_number") as HTMLInputElement).value,
                    user_type: (form.elements.namedItem("user_type") as HTMLSelectElement).value,
                  }),
                });
                if (res.ok) {
                  fetchUsers();
                  setShowEditModal(false);
                } else {
                  const data = await res.json();
                  alert(data.error || "Failed to update");
                }
              }}
            >
              <div className="mb-2"><label className="block">Full Name</label><input name="full_name" defaultValue={editUser.full_name} className="border w-full p-1" required /></div>
              <div className="mb-2"><label className="block">Email</label><input name="email" type="email" defaultValue={editUser.email} className="border w-full p-1" required /></div>
              <div className="mb-2"><label className="block">Phone</label><input name="phone_number" defaultValue={editUser.phone_number} className="border w-full p-1" required /></div>
              <div className="mb-2">
                <label className="block">Role</label>
                <select name="user_type" defaultValue={editUser.user_type} className="border w-full p-1" required>
                  <option value="owner">Owner</option>
                  <option value="renter">Renter</option>
                  <option value="both">Both</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="flex justify-end">
                <button type="button" onClick={() => setShowEditModal(false)} className="mr-2">Cancel</button>
                <button type="submit" className="bg-blue-600 text-white px-3 py-1 rounded">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
      <div className="mt-4">
        <Link href="/admin/dashboard" className="text-blue-600 hover:underline">← Back to Dashboard</Link>
      </div>
    </section>
  );
}
