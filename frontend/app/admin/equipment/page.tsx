"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";

type Equipment = {
  id: number;
  title: string;
  category: string;
  location: string;
  price_per_day?: string | number;
  image_url?: string;
  sub_category?: string;
  description?: string;
  is_available?: boolean;
  owner_name?: string;
};

export default function AdminEquipment() {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [editEquipment, setEditEquipment] = useState<Equipment | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
  const token = () => localStorage.getItem("equipshare_token");

  const fetchEquipment = async () => {
    try {
      const res = await fetch(`${apiUrl}/api/admin/equipment`, {
        headers: { Authorization: `Bearer ${token()}` },
      });
      const data = await res.json();
      if (res.ok) {
        setEquipment(data.equipment || []);
      } else {
        setError(data.error || "Failed to load equipment");
      }
    } catch (e) {
      setError("Network error while fetching equipment");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEquipment();
  }, []);

  const toggleAvailable = async (eq: Equipment) => {
    await fetch(`${apiUrl}/api/admin/equipment/${eq.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}` },
      body: JSON.stringify({ is_available: !eq.is_available }),
    });
    fetchEquipment();
  };

  const deleteEquipment = async (id: number) => {
    if (!confirm("Delete this listing?")) return;
    await fetch(`${apiUrl}/api/admin/equipment/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token()}` },
    });
    fetchEquipment();
  };

  if (loading) return <p className="p-6">Loading equipment...</p>;
  if (error) return <p className="p-6 text-red-600">{error}</p>;

  return (
    <section className="p-6">
      <h1 className="text-3xl font-bold mb-4">Equipment moderation</h1>
      <table className="user-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Title</th>
            <th>Owner</th>
            <th>Category</th>
            <th>Location</th>
            <th>Price / day</th>
            <th>Available</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {equipment.map((eq) => (
            <tr key={eq.id}>
              <td>{eq.id}</td>
              <td>{eq.title}</td>
              <td>{eq.owner_name || "—"}</td>
              <td>{eq.category}</td>
              <td>{eq.location}</td>
              <td>रु{Number(eq.price_per_day || 0).toLocaleString()}</td>
              <td>{eq.is_available ? "Yes" : "No"}</td>
              <td className="space-x-2">
                <button className="text-sm text-blue-600 hover:underline" onClick={() => { setEditEquipment(eq); setShowEditModal(true); }}>Edit</button>
                <button className="text-sm text-amber-700 hover:underline" onClick={() => toggleAvailable(eq)}>
                  {eq.is_available ? "Mark unavailable" : "Approve / available"}
                </button>
                <button className="text-sm text-red-600 hover:underline" onClick={() => deleteEquipment(eq.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showEditModal && editEquipment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-96 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Edit Equipment</h2>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const form = e.target as HTMLFormElement;
                const res = await fetch(`${apiUrl}/api/admin/equipment/${editEquipment.id}`, {
                  method: "PUT",
                  headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}` },
                  body: JSON.stringify({
                    title: (form.elements.namedItem("title") as HTMLInputElement).value,
                    category: (form.elements.namedItem("category") as HTMLInputElement).value,
                    sub_category: (form.elements.namedItem("sub_category") as HTMLInputElement).value,
                    description: (form.elements.namedItem("description") as HTMLTextAreaElement).value,
                    price_per_day: parseFloat((form.elements.namedItem("price_per_day") as HTMLInputElement).value),
                    location: (form.elements.namedItem("location") as HTMLInputElement).value,
                    image_url: (form.elements.namedItem("image_url") as HTMLInputElement).value || null,
                    is_available: (form.elements.namedItem("is_available") as HTMLInputElement).checked,
                  }),
                });
                if (res.ok) {
                  fetchEquipment();
                  setShowEditModal(false);
                } else {
                  const data = await res.json();
                  alert(data.error || "Failed to update");
                }
              }}
            >
              <div className="mb-2"><label className="block">Title</label><input name="title" defaultValue={editEquipment.title} className="border w-full p-1" required /></div>
              <div className="mb-2"><label className="block">Category</label><input name="category" defaultValue={editEquipment.category} className="border w-full p-1" required /></div>
              <div className="mb-2"><label className="block">Sub Category</label><input name="sub_category" defaultValue={editEquipment.sub_category} className="border w-full p-1" required /></div>
              <div className="mb-2"><label className="block">Description</label><textarea name="description" defaultValue={editEquipment.description} className="border w-full p-1" /></div>
              <div className="mb-2"><label className="block">Price per day</label><input name="price_per_day" type="number" step="0.01" defaultValue={Number(editEquipment.price_per_day || 0)} className="border w-full p-1" required /></div>
              <div className="mb-2"><label className="block">Location</label><input name="location" defaultValue={editEquipment.location} className="border w-full p-1" required /></div>
              <div className="mb-2"><label className="block">Image URL</label><input name="image_url" defaultValue={editEquipment.image_url} className="border w-full p-1" /></div>
              <div className="mb-2"><label className="block"><input type="checkbox" name="is_available" defaultChecked={editEquipment.is_available} /> Available</label></div>
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
