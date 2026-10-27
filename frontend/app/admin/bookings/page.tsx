import React, { useEffect, useState } from 'react';
import Link from 'next/link';

type Booking = {
  id: number;
  equipment_id: number;
  user_id: number;
  start_date: string;
  end_date: string;
  status: string;
  created_at: string;
};

export default function AdminBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchBookings = async () => {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      const token = localStorage.getItem('equipshare_token');
      try {
        const res = await fetch(`${apiUrl}/api/admin/bookings`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        if (res.ok) {
          setBookings(data.bookings || []);
        } else {
          setError(data.error || 'Failed to load bookings');
        }
      } catch (e) {
        setError('Network error while fetching bookings');
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  if (loading) return <p className="p-6">Loading bookings...</p>;
  if (error) return <p className="p-6 text-red-600">{error}</p>;

  return (
    <section className="p-6">
      <h1 className="text-3xl font-bold mb-4">Bookings Overview</h1>
      <table className="user-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Equipment ID</th>
            <th>User ID</th>
            <th>Start</th>
            <th>End</th>
            <th>Status</th>
            <th>Created At</th>
          </tr>
        </thead>
        <tbody>
          {bookings.map((b) => (
            <tr key={b.id}>
              <td>{b.id}</td>
              <td>{b.equipment_id}</td>
              <td>{b.user_id}</td>
              <td>{new Date(b.start_date).toLocaleDateString()}</td>
              <td>{new Date(b.end_date).toLocaleDateString()}</td>
              <td>{b.status}</td>
              <td>{new Date(b.created_at).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mt-4">
        <Link href="/admin/dashboard" className="text-blue-600 hover:underline">
          ← Back to Dashboard
        </Link>
      </div>
    </section>
  );
}
