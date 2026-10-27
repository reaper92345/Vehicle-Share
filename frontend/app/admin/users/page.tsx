import React, { useEffect, useState } from 'react';
import Link from 'next/link';

type User = {
  id: number;
  full_name: string;
  email: string;
  phone_number: string;
  user_type: string;
  created_at: string;
};

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  const fetchUsers = async () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
    const token = localStorage.getItem('equipshare_token');
    try {
      const res = await fetch(`${apiUrl}/api/admin/users`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (res.ok) {
        setUsers(data.users);
      } else {
        setError(data.error || 'Failed to load users');
      }
    } catch (e) {
      setError('Network error while fetching users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const deleteUser = async (id: number) => {
    if (!confirm('Delete this user?')) return;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
    const token = localStorage.getItem('equipshare_token');
    try {
      const res = await fetch(`${apiUrl}/api/admin/users/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        setUsers(users.filter((u) => u.id !== id));
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to delete');
      }
    } catch (e) {
      alert('Network error while deleting');
    }
  };

  const [editUser, setEditUser] = useState<User | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);


  if (loading) return <p className="p-6">Loading users...</p>;
  if (error) return <p className="p-6 text-red-600">{error}</p>;

  return (
    <section className="p-6">
      <h1 className="text-3xl font-bold mb-4">User Management</h1>
      <table className="user-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Role</th>
            <th>Created At</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id}>
              <td>{u.id}</td>
              <td>{u.full_name}</td>
              <td>{u.email}</td>
              <td>{u.phone_number}</td>
              <td>{u.user_type}</td>
              <td>{new Date(u.created_at).toLocaleString()}</td>
              <td>
                <button onClick={() => { setEditUser(u); setShowEditModal(true); }} className="text-sm text-blue-600 hover:underline">Edit</button>
                <span className="mx-2">|</span>
                <button onClick={() => deleteUser(u.id)} className="text-sm text-red-600 hover:underline">Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
</table>
{showEditModal && editUser && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
    <div className="bg-white p-6 rounded shadow-lg w-96">
      <h2 className="text-xl font-bold mb-4">Edit User</h2>
      <form onSubmit={async (e) => {
        e.preventDefault();
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
        const token = localStorage.getItem('equipshare_token');
        const res = await fetch(`${apiUrl}/api/admin/users/${editUser.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            full_name: (e.target as any).full_name.value,
            email: (e.target as any).email.value,
            phone_number: (e.target as any).phone_number.value,
            user_type: (e.target as any).user_type.value,
          }),
        });
        if (res.ok) {
          fetchUsers();
          setShowEditModal(false);
        } else {
          const data = await res.json();
          alert(data.error || 'Failed to update');
        }
      }}>
        <div className="mb-2">
          <label className="block">Full Name</label>
          <input name="full_name" defaultValue={editUser.full_name} className="border w-full p-1" required />
        </div>
        <div className="mb-2">
          <label className="block">Email</label>
          <input name="email" type="email" defaultValue={editUser.email} className="border w-full p-1" required />
        </div>
        <div className="mb-2">
          <label className="block">Phone</label>
          <input name="phone_number" defaultValue={editUser.phone_number} className="border w-full p-1" required />
        </div>
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
        <Link href="/admin/dashboard" className="text-blue-600 hover:underline">
          ← Back to Dashboard
        </Link>
      </div>
    </section>
  );
}
