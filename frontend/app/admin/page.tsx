// admin page with tabbed interface for Users, Equipment, Rentals
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

// Simple Tab component
function Tabs({ tabs, active, setActive }: { tabs: string[]; active: string; setActive: (tab: string) => void }) {
  return (
    <div className="flex border-b border-gray-200 mb-4">
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => setActive(tab)}
          className={`px-4 py-2 -mb-px text-sm font-medium transition-colors
            ${active === tab ? "border-b-2 border-brand-700 text-brand-700" : "text-gray-600 hover:text-brand-500"}`}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}

// Helpers for API calls
async function fetchJson(url: string, options?: RequestInit) {
  const res = await fetch(url, { credentials: "include", ...options });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || "API error");
  }
  return await res.json();
}

// Users tab
function UsersTab() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const data = await fetchJson("/api/admin/users");
      setUsers(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const deleteUser = async (id: string) => {
    if (!confirm("Delete this user?")) return;
    await fetchJson(`/api/admin/users/${id}`, { method: "DELETE" });
    load();
  };

  // placeholder for create / edit forms – omitted for brevity but can be added as modal
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-slate-900">Users</h2>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <table className="min-w-full bg-white shadow rounded-lg overflow-hidden">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">ID</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Name</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Email</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Role</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-t">
                <td className="px-4 py-2 text-sm text-gray-700">{u.id}</td>
                <td className="px-4 py-2 text-sm text-gray-700">{u.name}</td>
                <td className="px-4 py-2 text-sm text-gray-700">{u.email}</td>
                <td className="px-4 py-2 text-sm text-gray-700">{u.role}</td>
                <td className="px-4 py-2 space-x-2">
                  {/* Edit button can open a modal – not implemented here */}
                  <button
                    onClick={() => deleteUser(u.id)}
                    className="text-red-600 hover:underline text-sm"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

// Equipment tab – similar to Users but with equipment fields
function EquipmentTab() {
  const [equipment, setEquipment] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const data = await fetchJson("/api/admin/equipment");
      setEquipment(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const deleteEquip = async (id: string) => {
    if (!confirm("Delete this equipment?") ) return;
    await fetchJson(`/api/admin/equipment/${id}`, { method: "DELETE" });
    load();
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-slate-900">Equipment</h2>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <table className="min-w-full bg-white shadow rounded-lg overflow-hidden">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">ID</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Title</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Category</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Location</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Price</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody>
            {equipment.map((e) => (
              <tr key={e.id} className="border-t">
                <td className="px-4 py-2 text-sm text-gray-700">{e.id}</td>
                <td className="px-4 py-2 text-sm text-gray-700">{e.title}</td>
                <td className="px-4 py-2 text-sm text-gray-700">{e.category}</td>
                <td className="px-4 py-2 text-sm text-gray-700">{e.location}</td>
                <td className="px-4 py-2 text-sm text-gray-700">{e.price}</td>
                <td className="px-4 py-2 space-x-2">
                  <button
                    onClick={() => deleteEquip(e.id)}
                    className="text-red-600 hover:underline text-sm"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

// Rentals (bookings) tab – view transaction history
function RentalsTab() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const data = await fetchJson("/api/admin/bookings");
      setBookings(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const deleteBooking = async (id: string) => {
    if (!confirm("Delete this booking?")) return;
    await fetchJson(`/api/admin/bookings/${id}`, { method: "DELETE" });
    load();
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-slate-900">Rental Transactions</h2>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <table className="min-w-full bg-white shadow rounded-lg overflow-hidden">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">ID</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">User</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Equipment</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-5 0">Status</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((b) => (
              <tr key={b.id} className="border-t">
                <td className="px-4 py-2 text-sm text-gray-700">{b.id}</td>
                <td className="px-4 py-2 text-sm text-gray-700">{b.userId}</td>
                <td className="px-4 py-2 text-sm text-gray-700">{b.equipmentId}</td>
                <td className="px-4 py-2 text-sm text-gray-700">{b.status}</td>
                <td className="px-4 py-2 space-x-2">
                  <button
                    onClick={() => deleteBooking(b.id)}
                    className="text-red-600 hover:underline text-sm"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default function AdminPage() {
  const tabs = ["Users", "Equipment", "Rentals"];
  const [active, setActive] = useState(tabs[0]);

  return (
    <main className="p-6 min-h-screen bg-gradient-to-br from-slate-100 via-white to-gray-50">
      <h1 className="text-3xl font-bold text-slate-800 mb-6">Admin Dashboard</h1>
      <Tabs tabs={tabs} active={active} setActive={setActive} />
      <section className="mt-4">
        {active === "Users" && <UsersTab />}
        {active === "Equipment" && <EquipmentTab />}
        {active === "Rentals" && <RentalsTab />}
      </section>
    </main>
  );
}
