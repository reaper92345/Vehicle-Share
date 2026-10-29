"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";

type Booking = {
  id: number;
  equipment_id: number;
  equipment_title?: string;
  renter_name?: string;
  owner_name?: string;
  start_date: string;
  end_date: string;
  status: string;
  payment_status?: string;
  total_price?: number;
  created_at: string;
};

export default function AdminBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [status, setStatus] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [payment, setPayment] = useState("");

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

  const fetchBookings = async () => {
    setLoading(true);
    const token = localStorage.getItem("equipshare_token");
    const params = new URLSearchParams();
    if (status) params.set("status", status);
    if (payment) params.set("payment_status", payment);
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    try {
      const res = await fetch(`${apiUrl}/api/admin/bookings?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setBookings(data.bookings || []);
        setError("");
      } else {
        setError(data.error || "Failed to load bookings");
      }
    } catch (e) {
      setError("Network error while fetching bookings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const updateBooking = async (id: number, body: Record<string, string>) => {
    const token = localStorage.getItem("equipshare_token");
    await fetch(`${apiUrl}/api/admin/bookings/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(body),
    });
    fetchBookings();
  };

  return (
    <section className="p-6">
      <h1 className="text-3xl font-bold mb-4">Rental transaction history</h1>
      <div className="mb-4 flex flex-wrap gap-3">
        <select className="input max-w-xs" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All booking states</option>
          {["Pending", "Approved", "Active", "Completed", "Cancelled", "Paid", "Unpaid"].map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <select className="input max-w-xs" value={payment} onChange={(e) => setPayment(e.target.value)}>
          <option value="">All payments</option>
          <option value="paid">Paid</option>
          <option value="unpaid">Unpaid</option>
        </select>
        <input type="date" className="input max-w-xs" value={from} onChange={(e) => setFrom(e.target.value)} />
        <input type="date" className="input max-w-xs" value={to} onChange={(e) => setTo(e.target.value)} />
        <button className="btn-primary text-sm" onClick={fetchBookings}>Filter</button>
      </div>
      {loading && <p>Loading bookings...</p>}
      {error && <p className="text-red-600">{error}</p>}
      {!loading && (
        <table className="user-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Equipment</th>
              <th>Renter</th>
              <th>Owner</th>
              <th>Dates</th>
              <th>Status</th>
              <th>Payment</th>
              <th>Total</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((b) => (
              <tr key={b.id}>
                <td>{b.id}</td>
                <td>{b.equipment_title || b.equipment_id}</td>
                <td>{b.renter_name || "—"}</td>
                <td>{b.owner_name || "—"}</td>
                <td>{new Date(b.start_date).toLocaleDateString()} → {new Date(b.end_date).toLocaleDateString()}</td>
                <td>{b.status}</td>
                <td>{b.payment_status}</td>
                <td>रु{Number(b.total_price || 0).toLocaleString()}</td>
                <td className="space-x-1">
                  <select
                    className="border text-xs p-1"
                    defaultValue=""
                    onChange={(e) => {
                      if (e.target.value) updateBooking(b.id, { status: e.target.value });
                    }}
                  >
                    <option value="">Set status</option>
                    {["Pending", "Approved", "Active", "Completed", "Cancelled"].map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <div className="mt-4">
        <Link href="/admin/dashboard" className="text-blue-600 hover:underline">← Back to Dashboard</Link>
      </div>
    </section>
  );
}
