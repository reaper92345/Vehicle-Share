"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  MagneticButton,
  SmoothModal,
  useNotification,
} from "../../../components/smoothui";

interface Booking {
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
  deployment_location?: string;
}

export default function DetailedAdminBookingsPage() {
  const { success, error: notifyError, taxInvoice } = useNotification();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [payment, setPayment] = useState("");
  const [search, setSearch] = useState("");

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

  const fetchBookings = async () => {
    setLoading(true);
    const token = localStorage.getItem("equipshare_token");
    const params = new URLSearchParams();
    if (status) params.set("status", status);
    if (payment) params.set("payment_status", payment);

    try {
      const res = await fetch(`${apiUrl}/api/admin/bookings?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setBookings(Array.isArray(data) ? data : data.bookings || []);
      } else {
        notifyError("Failed to Load Rentals", data.error || "Unable to retrieve records.");
      }
    } catch (_) {
      notifyError("Network Error", "Could not synchronize rental transactions.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [status, payment]);

  const filteredBookings = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return bookings;
    return bookings.filter((b) => {
      const title = b.equipment_title || "";
      const renter = b.renter_name || "";
      const owner = b.owner_name || "";
      return (
        title.toLowerCase().includes(q) ||
        renter.toLowerCase().includes(q) ||
        owner.toLowerCase().includes(q) ||
        String(b.id).includes(q)
      );
    });
  }, [bookings, search]);

  // Total VAT Collected in current view
  const currentTotal = useMemo(() => {
    return filteredBookings.reduce((sum, b) => sum + (Number(b.total_price) || 0), 0);
  }, [filteredBookings]);

  const currentVat = useMemo(() => {
    return Math.round(currentTotal - currentTotal / 1.13);
  }, [currentTotal]);

  const viewReceipt = (bookingId: number) => {
    const token = localStorage.getItem("equipshare_token");
    window.open(`${apiUrl}/api/payments/${bookingId}/receipt?token=${token}`, "_blank");
    taxInvoice(
      `INV-${String(bookingId).padStart(6, "0")}`,
      "Official 13% IRD VAT Tax Invoice",
      `${apiUrl}/api/payments/${bookingId}/receipt`
    );
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
            <span className="text-xs font-black uppercase tracking-wider text-emerald-700">
              Nepal Inland Revenue Commercial Invoice Registry
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
            Rentals & Tax Invoices Ledger
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit rental contracts, Fonepay/QR settlements, and verifiable 13% VAT tax receipts (#INV).
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 shadow-xs">
            <span className="block text-[10px] text-slate-400 font-bold uppercase">Tax Exemption / VAT</span>
            <span className="font-mono text-xs font-black text-emerald-700">13% IRD Standard</span>
          </div>
          <MagneticButton
            onClick={fetchBookings}
            className="btn-secondary text-xs py-2 px-3.5 rounded-xl border border-slate-200 flex items-center gap-1.5 shadow-xs"
          >
            🔄 Refresh
          </MagneticButton>
        </div>
      </div>

      {/* Financial Summary Strip */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <span className="text-[10px] text-slate-400 font-bold uppercase">Filtered Rental Billings</span>
          <p className="text-xl font-black text-slate-900 mt-0.5">रु {currentTotal.toLocaleString()}</p>
        </div>
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4 shadow-xs">
          <span className="text-[10px] text-emerald-700 font-bold uppercase">13% VAT Remittance Pool</span>
          <p className="text-xl font-black text-emerald-800 font-mono mt-0.5">रु {currentVat.toLocaleString()}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <span className="text-[10px] text-slate-400 font-bold uppercase">Invoices in Scope</span>
          <p className="text-xl font-black text-brand-700 mt-0.5">{filteredBookings.length} Transaction(s)</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="card p-5 bg-white border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <select
            className="input text-xs max-w-xs font-medium bg-slate-50"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="">All Booking States</option>
            {["Pending", "Approved", "Active", "Completed", "Cancelled"].map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          <select
            className="input text-xs max-w-xs font-medium bg-slate-50"
            value={payment}
            onChange={(e) => setPayment(e.target.value)}
          >
            <option value="">All Payment States</option>
            <option value="paid">Settled / Paid</option>
            <option value="pending">Pending Payment</option>
          </select>
        </div>

        <input
          type="text"
          placeholder="Search by equipment, contractor, invoice #..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input text-xs max-w-sm"
        />
      </div>

      {/* Commercial Invoices Table */}
      <div className="card overflow-hidden bg-white border border-slate-200 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-slate-50 text-slate-500 text-left border-b border-slate-200">
              <tr>
                <th className="p-3.5">Invoice #</th>
                <th className="p-3.5">Heavy Equipment</th>
                <th className="p-3.5">Hirer / Contractor</th>
                <th className="p-3.5">Owner / Lister</th>
                <th className="p-3.5">Rental Duration</th>
                <th className="p-3.5">Gross Total</th>
                <th className="p-3.5">13% VAT</th>
                <th className="p-3.5">Payment</th>
                <th className="p-3.5 text-right">Official Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredBookings.map((b) => {
                const gross = Number(b.total_price) || 0;
                const vat = Math.round(gross - gross / 1.13);
                return (
                  <tr key={b.id} className="hover:bg-slate-50/70 transition">
                    <td className="p-3.5 font-mono font-bold text-slate-800">
                      INV-{String(b.id).padStart(6, "0")}
                    </td>

                    <td className="p-3.5 font-bold text-slate-900">
                      {b.equipment_title || `Equipment #${b.equipment_id}`}
                      {b.deployment_location && (
                        <span className="block text-[10px] text-slate-400 font-normal">
                          📍 {b.deployment_location}
                        </span>
                      )}
                    </td>

                    <td className="p-3.5 text-slate-700">{b.renter_name || "Contractor"}</td>
                    <td className="p-3.5 text-slate-600">{b.owner_name || "Owner"}</td>

                    <td className="p-3.5 text-slate-500">
                      {String(b.start_date).slice(0, 10)} → {String(b.end_date).slice(0, 10)}
                    </td>

                    <td className="p-3.5 font-black text-brand-700">
                      रु {gross.toLocaleString()}
                    </td>

                    <td className="p-3.5 font-mono font-bold text-emerald-700">
                      रु {vat.toLocaleString()}
                    </td>

                    <td className="p-3.5">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                          b.payment_status === "paid"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {b.payment_status === "paid" ? "Settled" : "Pending"}
                      </span>
                    </td>

                    <td className="p-3.5 text-right">
                      <MagneticButton
                        onClick={() => viewReceipt(b.id)}
                        className="btn-primary text-[10px] py-1.5 px-3 rounded-lg font-bold inline-flex items-center gap-1 shadow-xs"
                      >
                        <span>🧾</span>
                        <span>View VAT Invoice</span>
                      </MagneticButton>
                    </td>
                  </tr>
                );
              })}

              {filteredBookings.length === 0 && !loading && (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-slate-500">
                    No transactions matching selected filters found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
