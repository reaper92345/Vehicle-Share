"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";


export default function RenterDashboard() {
  const router = useRouter();

  // Simple auth check – show a message if not logged in or unauthorized
  const stored = typeof window !== 'undefined' ? localStorage.getItem("equipshare_user") : null;
  if (!stored) {
    return (
      <div className="p-6 text-center">
        <p className="text-lg">Please log in to view the renter dashboard.</p>
      </div>
    );
  }
  let user;
  try {
    user = JSON.parse(stored);
  } catch {
    user = null;
  }
  const role = user?.role?.toLowerCase();
  if (role !== "renter" && role !== "admin") {
    return (
      <div className="p-6 text-center">
        <p className="text-lg">You do not have permission to view this dashboard.</p>
      </div>
    );
  }


  return (
    <div className="container mx-auto p-6">
<h1 className="text-2xl font-bold mb-4">Renter Dashboard</h1>
{/* Earnings Summary */}
      <div className="p-4 bg-white rounded-lg shadow mb-4">
        <h2 className="text-lg font-semibold mb-2">Total Earnings</h2>
        <p className="text-xl font-bold text-indigo-600">$<span id="total-earnings">0.00</span></p>
      </div>

      {/* Users Table */}
      <div className="p-4 bg-white rounded-lg shadow mb-4 overflow-x-auto">
        <h2 className="text-lg font-semibold mb-2">All Users</h2>
        <table className="min-w-full text-sm" id="users-table">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-2 py-1 text-left">Name</th>
              <th className="px-2 py-1 text-left">Email</th>
              <th className="px-2 py-1 text-left">Phone</th>
            </tr>
          </thead>
          <tbody></tbody>
        </table>
      </div>

      {/* Equipment Table */}
      <div className="p-4 bg-white rounded-lg shadow mb-4 overflow-x-auto">
        <h2 className="text-lg font-semibold mb-2">Listed Equipment</h2>
        <table className="min-w-full text-sm" id="equipment-table">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-2 py-1 text-left">Asset ID</th>
              <th className="px-2 py-1 text-left">Name</th>
              <th className="px-2 py-1 text-left">Status</th>
            </tr>
          </thead>
          <tbody></tbody>
        </table>
      </div>

      {/* Rentals Overview */}
      <div className="p-4 bg-white rounded-lg shadow mb-4 overflow-x-auto">
        <h2 className="text-lg font-semibold mb-2">Current Rentals</h2>
        <table className="min-w-full text-sm" id="rentals-table">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-2 py-1 text-left">Renter</th>
              <th className="px-2 py-1 text-left">Equipment</th>
              <th className="px-2 py-1 text-left">From</th>
              <th className="px-2 py-1 text-left">Deployed At</th>
              <th className="px-2 py-1 text-left">Due Return</th>
            </tr>
          </thead>
          <tbody></tbody>
        </table>
      </div>

      {/* Payment History */}
      <div className="p-4 bg-white rounded-lg shadow mb-4 overflow-x-auto">
        <h2 className="text-lg font-semibold mb-2">Payment History</h2>
        <table className="min-w-full text-sm" id="payments-table">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-2 py-1 text-left">Date</th>
              <th className="px-2 py-1 text-left">Amount</th>
              <th className="px-2 py-1 text-left">Reference</th>
            </tr>
          </thead>
          <tbody></tbody>
        </table>
      </div>
    </div>
  );

}
