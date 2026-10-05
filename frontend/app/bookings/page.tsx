"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Booking {
  id: string;
  equipment_title: string;
  start_date: string;
  end_date: string;
  total_price: string;
  status: string;
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBookings() {
      const token = localStorage.getItem("equipshare_token");
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
        const res = await fetch(`${apiUrl}/api/bookings`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setBookings(data);
        }
      } catch (err) {
        console.error("Error fetching bookings:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchBookings();
  }, []);

  return (
    <main className="min-h-screen bg-slate-50 pb-20">
      <header className="mx-auto max-w-7xl px-6 py-6">
        <nav className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-700 text-lg font-bold text-white">E</div>
            <div>
              <p className="text-lg font-semibold text-slate-900">EquipShare</p>
              <p className="text-xs text-slate-500">Rent heavy equipment smarter</p>
            </div>
          </Link>
          <Link href="/equipment" className="text-sm font-semibold text-slate-700 hover:text-slate-900">
            Browse Equipment
          </Link>
        </nav>
      </header>

      <div className="mx-auto max-w-4xl px-6 py-8">
        <h1 className="text-3xl font-bold text-slate-900">My Bookings</h1>
        <p className="mt-1 text-slate-600">Track and manage your rental requests.</p>

        {loading ? (
          <p className="mt-8 text-slate-500">Loading bookings...</p>
        ) : bookings.length === 0 ? (
          <div className="card mt-6 p-8 text-center">
            <p className="text-slate-600">No bookings found.</p>
            <Link href="/equipment" className="btn-primary mt-4 inline-block">
              Find Equipment to Rent
            </Link>
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            {bookings.map((b) => (
              <div key={b.id} className="card flex items-center justify-between p-6">
                <div>
                  <h3 className="font-bold text-slate-900">{b.equipment_title}</h3>
                  <p className="mt-1 text-sm text-slate-600">
                    {b.start_date} to {b.end_date}
                  </p>
                  <p className="mt-1 font-semibold text-slate-900">Total: ₹{b.total_price}</p>
                </div>
                <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-800">
                  {b.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}