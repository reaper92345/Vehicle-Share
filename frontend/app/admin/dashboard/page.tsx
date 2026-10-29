"use client";
import React from "react";
import Link from "next/link";

export default function AdminDashboard() {
  return (
    <section className="p-6">
      <h1 className="text-3xl font-bold mb-4">Admin Dashboard</h1>
      <p className="text-gray-700 mb-6">
        Global control panel for users, listings, and rental transactions.
      </p>
      <div className="grid gap-4 sm:grid-cols-3">
        <Link href="/admin/users" className="card p-5 hover:shadow-md">
          <p className="font-bold">Users</p>
          <p className="text-sm text-slate-500 mt-1">Roles, disable/enable, directory details</p>
        </Link>
        <Link href="/admin/equipment" className="card p-5 hover:shadow-md">
          <p className="font-bold">Equipment</p>
          <p className="text-sm text-slate-500 mt-1">Moderate listings, pricing, availability</p>
        </Link>
        <Link href="/admin/bookings" className="card p-5 hover:shadow-md">
          <p className="font-bold">Rentals</p>
          <p className="text-sm text-slate-500 mt-1">Filterable booking and payment history</p>
        </Link>
      </div>
    </section>
  );
}
