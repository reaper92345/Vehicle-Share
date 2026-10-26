"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import "./renter.css"; // shared styling

export default function RenterDashboard() {
  const router = useRouter();

  // Auth & role check (same as page)
  useEffect(() => {
    const stored = localStorage.getItem("equipshare_user");
    if (!stored) {
      router.push("/login");
      return;
    }
    try {
      const user = JSON.parse(stored);
      const role = user.role?.toLowerCase();
      if (role !== "renter" && role !== "admin") {
        router.push("/");
      }
    } catch (e) {
      router.push("/login");
    }
  }, [router]);

  return (
    <>
      <header className="header">
        <h1>Renter Dashboard</h1>
      </header>
      <main className="container">
        {/* Earnings Summary */}
        <section className="card summary-card">
          <h2>Total Earnings</h2>
          <p className="value">${"$"}<span id="total-earnings">0.00</span></p>
        </section>
        {/* Users Table */}
        <section className="card">
          <h2>All Users</h2>
          <table className="data-table" id="users-table"><thead><tr><th>Name</th><th>Email</th><th>Phone</th></tr></thead><tbody></tbody></table>
        </section>
        {/* Equipment Table */}
        <section className="card">
          <h2>Listed Equipment</h2>
          <table className="data-table" id="equipment-table"><thead><tr><th>Asset ID</th><th>Name</th><th>Status</th></tr></thead><tbody></tbody></table>
        </section>
        {/* Rentals Overview */}
        <section className="card">
          <h2>Current Rentals</h2>
          <table className="data-table" id="rentals-table"><thead><tr><th>Renter</th><th>Equipment</th><th>From</th><th>Deployed At</th><th>Due Return</th></tr></thead><tbody></tbody></table>
        </section>
        {/* Payment History */}
        <section className="card">
          <h2>Payment History</h2>
          <table className="data-table" id="payments-table"><thead><tr><th>Date</th><th>Amount</th><th>Reference</th></tr></thead><tbody></tbody></table>
        </section>
      </main>
      <script src="../renter/renter.js"></script>
    </>
  );
}
