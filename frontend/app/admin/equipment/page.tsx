import React, { useEffect, useState } from 'react';
import Link from 'next/link';

type Equipment = {
  id: number;
  title: string;
  category: string;
  location: string;
  price: string;
  image: string;
};

export default function AdminEquipment() {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [editEquipment, setEditEquipment] = useState<Equipment | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const fetchEquipment = async () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
    const token = localStorage.getItem('equipshare_token');
    try {
      const res = await fetch(`${apiUrl}/api/admin/equipment`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (res.ok) {
        setEquipment(data.equipment || []);
      } else {
        setError(data.error || 'Failed to load equipment');
      }
    } catch (e) {
      setError('Network error while fetching equipment');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEquipment();
  }, []);

  if (loading) return <p className="p-6">Loading equipment...</p>;
  if (error) return <p className="p-6 text-red-600">{error}</p>;

  return (
    <section className="p-6">
      <h1 className="text-3xl font-bold mb-4">Equipment Management</h1>
      <table className="user-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Title</th>
            <th>Category</th>
            <th>Location</th>
            <th>Price</th>
          </tr>
        </thead>
        <tbody>
          {equipment.map((eq) => (
            <tr key={eq.id}>
              <td>{eq.id}</td>
              <td>{eq.title}</td>
              <td>{eq.category}</td>
              <td>{eq.location}</td>
              <td>{eq.price}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex justify-between items-center mt-4">
        <button onClick={() => { setEditEquipment(null); setShowAddModal(true); }} className="bg-blue-600 text-white px-3 py-1 rounded">Add Equipment</button>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded shadow-lg w-96">
            <h2 className="text-xl font-bold mb-4">Add Equipment</h2>
            <form onSubmit={async (e) => {
              e.preventDefault();
              const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
              const token = localStorage.getItem('equipshare_token');
              const res = await fetch(`${apiUrl}/api/admin/equipment`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                  title: (e.target as any).title.value,
                  category: (e.target as any).category.value,
                  sub_category: (e.target as any).sub_category.value,
                  description: (e.target as any).description.value,
                  price_per_day: parseFloat((e.target as any).price_per_day.value),
                  location: (e.target as any).location.value,
                  image_url: (e.target as any).image_url.value,
                  is_available: (e.target as any).is_available.checked,
                  condition: (e.target as any).condition.value,
                  manufacturer: (e.target as any).manufacturer.value,
                  year_of_manufacture: parseInt((e.target as any).year_of_manufacture.value, 10),
                }),
              });
              if (res.ok) {
                fetchEquipment();
                setShowAddModal(false);
              } else {
                const data = await res.json();
                alert(data.error || 'Failed to add');
              }
            }}>
              <div className="mb-2"><label className="block">Title</label><input name="title" className="border w-full p-1" required /></div>
              <div className="mb-2"><label className="block">Category</label><input name="category" className="border w-full p-1" required /></div>
              <div className="mb-2"><label className="block">Sub Category</label><input name="sub_category" className="border w-full p-1" required /></div>
              <div className="mb-2"><label className="block">Description</label><textarea name="description" className="border w-full p-1" /></div>
              <div className="mb-2"><label className="block">Price per day</label><input name="price_per_day" type="number" step="0.01" className="border w-full p-1" required /></div>
              <div className="mb-2"><label className="block">Location</label><input name="location" className="border w-full p-1" required /></div>
              <div className="mb-2"><label className="block">Image URL</label><input name="image_url" className="border w-full p-1" /></div>
              <div className="mb-2"><label className="block"><input type="checkbox" name="is_available" defaultChecked /> Available</label></div>
              <div className="mb-2"><label className="block">Condition</label><input name="condition" className="border w-full p-1" /></div>
              <div className="mb-2"><label className="block">Manufacturer</label><input name="manufacturer" className="border w-full p-1" /></div>
              <div className="mb-2"><label className="block">Year of Manufacture</label><input name="year_of_manufacture" type="number" className="border w-full p-1" /></div>
              <div className="flex justify-end"><button type="button" onClick={() => setShowAddModal(false)} className="mr-2">Cancel</button><button type="submit" className="bg-blue-600 text-white px-3 py-1 rounded">Save</button></div>
            </form>
          </div>
        </div>
      )}

      {showEditModal && editEquipment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded shadow-lg w-96">
            <h2 className="text-xl font-bold mb-4">Edit Equipment</h2>
            <form onSubmit={async (e) => {
              e.preventDefault();
              const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
              const token = localStorage.getItem('equipshare_token');
              const res = await fetch(`${apiUrl}/api/admin/equipment/${editEquipment.id}`, {
                method: 'PUT',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                  title: (e.target as any).title.value,
                  category: (e.target as any).category.value,
                  sub_category: (e.target as any).sub_category.value,
                  description: (e.target as any).description.value,
                  price_per_day: parseFloat((e.target as any).price_per_day.value),
                  location: (e.target as any).location.value,
                  image_url: (e.target as any).image_url.value,
                  is_available: (e.target as any).is_available.checked,
                  condition: (e.target as any).condition.value,
                  manufacturer: (e.target as any).manufacturer.value,
                  year_of_manufacture: parseInt((e.target as any).year_of_manufacture.value, 10),
                }),
              });
              if (res.ok) {
                fetchEquipment();
                setShowEditModal(false);
              } else {
                const data = await res.json();
                alert(data.error || 'Failed to update');
              }
            }}>
              <div className="mb-2"><label className="block">Title</label><input name="title" defaultValue={editEquipment.title} className="border w-full p-1" required /></div>
              <div className="mb-2"><label className="block">Category</label><input name="category" defaultValue={editEquipment.category} className="border w-full p-1" required /></div>
              <div className="mb-2"><label className="block">Sub Category</label><input name="sub_category" defaultValue={editEquipment.sub_category} className="border w-full p-1" required /></div>
              <div className="mb-2"><label className="block">Description</label><textarea name="description" defaultValue={editEquipment.description} className="border w-full p-1" /></div>
              <div className="mb-2"><label className="block">Price per day</label><input name="price_per_day" type="number" step="0.01" defaultValue={editEquipment.price} className="border w-full p-1" required /></div>
              <div className="mb-2"><label className="block">Location</label><input name="location" defaultValue={editEquipment.location} className="border w-full p-1" required /></div>
              <div className="mb-2"><label className="block">Image URL</label><input name="image_url" defaultValue={editEquipment.image} className="border w-full p-1" /></div>
              <div className="mb-2"><label className="block"><input type="checkbox" name="is_available" defaultChecked={editEquipment.is_available} /> Available</label></div>
              <div className="mb-2"><label className="block">Condition</label><input name="condition" defaultValue={editEquipment.condition} className="border w-full p-1" /></div>
              <div className="mb-2"><label className="block">Manufacturer</label><input name="manufacturer" defaultValue={editEquipment.manufacturer} className="border w-full p-1" /></div>
              <div className="mb-2"><label className="block">Year of Manufacture</label><input name="year_of_manufacture" type="number" defaultValue={editEquipment.year_of_manufacture} className="border w-full p-1" /></div>
              <div className="flex justify-end"><button type="button" onClick={() => setShowEditModal(false)} className="mr-2">Cancel</button><button type="submit" className="bg-blue-600 text-white px-3 py-1 rounded">Save</button></div>
            </form>
          </div>
        </div>
      )}
      <div className="mt-4">
        <Link href="/admin/dashboard" className="text-blue-600 hover:underline">← Back to Dashboard</Link>
      </div>
    </section>
  );}
