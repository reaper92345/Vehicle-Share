"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  TiltCard,
  MagneticButton,
  SmoothModal,
} from "../../../components/smoothui";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Doughnut, Bar, Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface Equipment {
  id: number;
  title: string;
  category: string;
  location: string;
  price_per_day: number;
  is_available: boolean;
  image_url?: string;
  description?: string;
  condition?: string;
  manufacturer?: string;
  year_of_manufacture?: number | string;
}

interface Booking {
  id: number;
  equipment_id: number;
  equipment_title: string;
  renter_name: string;
  renter_email?: string;
  renter_phone?: string;
  start_date: string;
  end_date: string;
  total_price: number;
  status: string;
  payment_status: string;
  location?: string;
  deployment_location?: string;
  created_at?: string;
}

interface UserSummary {
  id: string;
  full_name: string;
  email: string;
  phone_number: string;
  user_type: string;
  created_at?: string;
}

function daysDiff(end: string, start?: string) {
  const e = new Date(`${String(end).slice(0, 10)}T00:00:00`).getTime();
  const s = start ? new Date(`${String(start).slice(0, 10)}T00:00:00`).getTime() : new Date().setHours(0,0,0,0);
  return Math.ceil((e - s) / (1000 * 60 * 60 * 24));
}

export default function GlassRenterDashboard() {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [users, setUsers] = useState<UserSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterQuery, setFilterQuery] = useState("");
  const [selectedMachine, setSelectedMachine] = useState<Equipment | null>(null);

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("equipshare_token") : null;
    if (!token) {
      setLoading(false);
      return;
    }
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
    const headers = { Authorization: `Bearer ${token}` };

    async function fetchData() {
      try {
        const [resEquip, resBookings, resUsers] = await Promise.all([
          fetch(`${apiUrl}/api/equipment/mine`, { headers }),
          fetch(`${apiUrl}/api/bookings/owner/dashboard`, { headers }),
          fetch(`${apiUrl}/api/users`, { headers }),
        ]);

        if (resEquip.ok) {
          const d = await resEquip.json();
          setEquipment(d.equipment || []);
        }
        if (resBookings.ok) {
          const d = await resBookings.json();
          setBookings(d.bookings || []);
        }
        if (resUsers.ok) {
          const d = await resUsers.json();
          setUsers(d.users || []);
        }
      } catch (err) {
        console.error("Glass Dashboard load failed:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Aggregations
  const totalGrossEarnings = useMemo(() => {
    return bookings
      .filter((b) => b.payment_status === "paid")
      .reduce((sum, b) => sum + Number(b.total_price), 0);
  }, [bookings]);

  const pendingApproval = bookings.filter((b) => b.status === "Pending");
  const activeDeployments = bookings.filter((b) => ["Approved", "Active"].includes(b.status));
  const completedRentals = bookings.filter((b) => b.status === "Completed");

  const totalDaysRented = useMemo(() => {
    return bookings
      .filter((b) => ["Approved", "Active", "Completed"].includes(b.status))
      .reduce((acc, b) => acc + Math.max(1, daysDiff(b.end_date, b.start_date) + 1), 0);
  }, [bookings]);

  // Donut Chart: Fleet Availability & Health
  const donutData = useMemo(() => {
    const deployed = activeDeployments.length;
    const pending = pendingApproval.length;
    const available = Math.max(0, equipment.length - deployed);

    return {
      labels: ["Active on Sites", "Pending Review", "Available in Yard"],
      datasets: [
        {
          data: [deployed, pending, available],
          backgroundColor: ["#38bdf8", "#fbbf24", "#34d399"],
          borderColor: ["rgba(255,255,255,0.4)"],
          borderWidth: 2,
        },
      ],
    };
  }, [activeDeployments, pendingApproval, equipment]);

  // Bar Chart: Asset Performance Comparison
  const barData = useMemo(() => {
    const labels = equipment.map((e) => e.title);
    const revenue = equipment.map((eq) => {
      return bookings
        .filter((b) => b.equipment_id === eq.id && b.payment_status === "paid")
        .reduce((sum, b) => sum + Number(b.total_price), 0);
    });

    return {
      labels: labels.length > 0 ? labels : ["Empty Fleet"],
      datasets: [
        {
          label: "Cash Revenue (रु)",
          data: revenue.length > 0 ? revenue : [0],
          backgroundColor: "rgba(56, 189, 248, 0.75)",
          borderRadius: 10,
        },
      ],
    };
  }, [equipment, bookings]);

  // Line Chart: Booking Activity Velocity
  const lineData = useMemo(() => {
    const dates = bookings.map((b) => String(b.start_date).slice(5, 10)).reverse();
    const prices = bookings.map((b) => Number(b.total_price)).reverse();
    return {
      labels: dates.length > 0 ? dates : ["Day 1", "Day 2", "Day 3"],
      datasets: [
        {
          label: "Order Value (रु)",
          data: prices.length > 0 ? prices : [0, 0, 0],
          borderColor: "#818cf8",
          backgroundColor: "rgba(129, 140, 248, 0.2)",
          fill: true,
          tension: 0.4,
        },
      ],
    };
  }, [bookings]);

  if (loading) {
    return (
      <div className="relative overflow-hidden rounded-3xl bg-slate-900/60 p-12 text-center backdrop-blur-xl border border-white/10 text-white animate-pulse">
        <p className="text-sm font-semibold tracking-wider uppercase text-cyan-400">Loading Glass Dashboard</p>
        <p className="text-xs text-slate-400 mt-1">Aggregating real-time telematics, contracts, and revenue...</p>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 p-6 sm:p-8 text-white shadow-2xl border border-white/10 backdrop-blur-2xl">
      {/* Background Glow Blobs */}
      <div className="pointer-events-none absolute -top-40 -left-40 h-96 w-96 rounded-full bg-cyan-500/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-indigo-500/15 blur-3xl" />

      {/* Header Bar */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-[11px] font-bold uppercase tracking-widest text-cyan-400">
              Live Fleet Telematics & Financial Dashboard
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white mt-1">
            Lister Command Hub
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Maximum granular telemetry, counterparty profiles, deployment dispatch, and ledger analytics.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/equipment/create">
            <MagneticButton className="rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-cyan-500/25 hover:opacity-90">
              + Deploy Machine
            </MagneticButton>
          </Link>
          <Link href="/bookings">
            <MagneticButton className="rounded-2xl bg-white/10 px-4 py-2.5 text-xs font-bold text-white hover:bg-white/20 border border-white/15">
              Review Requests ({pendingApproval.length})
            </MagneticButton>
          </Link>
        </div>
      </div>

      {/* KPI Tiles (Glass Styled) */}
      <div className="relative z-10 grid grid-cols-2 lg:grid-cols-5 gap-3.5 my-6">
        <div className="rounded-2xl bg-white/5 p-4 border border-white/10 backdrop-blur-md">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Revenue</p>
          <p className="text-xl sm:text-2xl font-black text-emerald-400 mt-1">रु{totalGrossEarnings.toLocaleString()}</p>
          <p className="text-[10px] text-slate-400 mt-1">Verified cash paid</p>
        </div>

        <div className="rounded-2xl bg-white/5 p-4 border border-white/10 backdrop-blur-md">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Active Deployed</p>
          <p className="text-xl sm:text-2xl font-black text-cyan-400 mt-1">{activeDeployments.length}</p>
          <p className="text-[10px] text-slate-400 mt-1">At project sites</p>
        </div>

        <div className="rounded-2xl bg-white/5 p-4 border border-white/10 backdrop-blur-md">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Fleet Units</p>
          <p className="text-xl sm:text-2xl font-black text-white mt-1">{equipment.length}</p>
          <p className="text-[10px] text-slate-400 mt-1">Total registered machinery</p>
        </div>

        <div className="rounded-2xl bg-white/5 p-4 border border-white/10 backdrop-blur-md">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Days Rented</p>
          <p className="text-xl sm:text-2xl font-black text-indigo-400 mt-1">{totalDaysRented}d</p>
          <p className="text-[10px] text-slate-400 mt-1">Lifetime hours on clock</p>
        </div>

        <div className="col-span-2 lg:col-span-1 rounded-2xl bg-white/5 p-4 border border-white/10 backdrop-blur-md">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Pending Review</p>
          <p className="text-xl sm:text-2xl font-black text-amber-400 mt-1">{pendingApproval.length}</p>
          <p className="text-[10px] text-slate-400 mt-1">Awaiting your approval</p>
        </div>
      </div>

      {/* Charts Trio in Glass Bento Grid */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-5 mb-8">
        {/* Chart 1: Donut Allocation */}
        <div className="lg:col-span-4 rounded-3xl bg-white/5 p-5 border border-white/10 backdrop-blur-md flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-sm font-bold text-white">Fleet Distribution</h3>
              <p className="text-[11px] text-slate-400">Live operational status</p>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              Live
            </span>
          </div>
          <div className="h-48 w-full flex items-center justify-center my-1">
            <Doughnut
              data={donutData}
              options={{
                maintainAspectRatio: false,
                plugins: {
                  legend: { position: "bottom", labels: { boxWidth: 10, color: "#cbd5e1", font: { size: 10 } } },
                },
                cutout: "72%",
              }}
            />
          </div>
          <p className="text-[11px] text-center text-slate-400 border-t border-white/10 pt-2">
            {activeDeployments.length} currently working on job locations
          </p>
        </div>

        {/* Chart 2: Earnings per Machine */}
        <div className="lg:col-span-4 rounded-3xl bg-white/5 p-5 border border-white/10 backdrop-blur-md flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-sm font-bold text-white">Revenue by Machinery</h3>
              <p className="text-[11px] text-slate-400">Asset monetization ranking</p>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              NPR (रु)
            </span>
          </div>
          <div className="h-48 w-full">
            <Bar
              data={barData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  y: { ticks: { color: "#94a3b8", font: { size: 9 }, callback: (v) => `${Number(v)/1000}k` }, grid: { color: "rgba(255,255,255,0.05)" } },
                  x: { ticks: { color: "#cbd5e1", font: { size: 9 } }, grid: { display: false } },
                },
                plugins: { legend: { display: false } },
              }}
            />
          </div>
          <p className="text-[11px] text-slate-400 border-t border-white/10 pt-2 flex justify-between">
            <span>Leading earner:</span>
            <span className="text-cyan-400 font-semibold">{equipment[0]?.title || "—"}</span>
          </p>
        </div>

        {/* Chart 3: Order Velocity Line */}
        <div className="lg:col-span-4 rounded-3xl bg-white/5 p-5 border border-white/10 backdrop-blur-md flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-sm font-bold text-white">Booking Velocity</h3>
              <p className="text-[11px] text-slate-400">Transaction volume curve</p>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              Activity
            </span>
          </div>
          <div className="h-48 w-full">
            <Line
              data={lineData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  y: { ticks: { color: "#94a3b8", font: { size: 9 }, callback: (v) => `${Number(v)/1000}k` }, grid: { color: "rgba(255,255,255,0.05)" } },
                  x: { ticks: { color: "#cbd5e1", font: { size: 9 } }, grid: { display: false } },
                },
                plugins: { legend: { display: false } },
              }}
            />
          </div>
          <p className="text-[11px] text-slate-400 border-t border-white/10 pt-2 flex justify-between">
            <span>Total orders:</span>
            <span className="text-indigo-300 font-semibold">{bookings.length} reservations</span>
          </p>
        </div>
      </div>

      {/* Granular Section 1: Fleet Cards with Inspector */}
      <div className="relative z-10 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-white">Registered Fleet Inventory ({equipment.length})</h3>
          <span className="text-xs text-slate-400">Hover for 3D depth & click for specs</span>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {equipment.map((eq) => {
            const activeBooking = bookings.find((b) => b.equipment_id === eq.id && ["Approved", "Active"].includes(b.status));
            const totalEqBookings = bookings.filter((b) => b.equipment_id === eq.id);

            return (
              <TiltCard
                key={eq.id}
                className="rounded-2xl bg-white/5 border border-white/10 p-4 backdrop-blur-md hover:border-cyan-500/40 hover:bg-white/10 transition"
              >
                <div className="relative h-36 w-full rounded-xl overflow-hidden bg-slate-800">
                  {eq.image_url ? (
                    <img src={eq.image_url} alt={eq.title} className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-3xl">🚜</div>
                  )}
                  <span className={`absolute top-2 right-2 text-[10px] font-bold px-2 py-0.5 rounded-full backdrop-blur-md ${
                    activeBooking ? "bg-cyan-500/80 text-white" : "bg-emerald-500/80 text-white"
                  }`}>
                    {activeBooking ? "Deployed" : "Available"}
                  </span>
                </div>

                <div className="mt-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-white text-base">{eq.title}</h4>
                    <span className="text-xs font-black text-cyan-400">रु{Number(eq.price_per_day).toLocaleString()}/d</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">📍 {eq.location} · {eq.category}</p>

                  {activeBooking && (
                    <div className="mt-2 rounded-xl bg-cyan-950/40 border border-cyan-500/20 p-2 text-[11px]">
                      <span className="text-cyan-300 font-semibold">Rented by:</span> {activeBooking.renter_name}
                      <span className="block text-slate-400 text-[10px] mt-0.5">
                        Due: {String(activeBooking.end_date).slice(0, 10)}
                      </span>
                    </div>
                  )}

                  <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">{totalEqBookings.length} order(s)</span>
                    <button
                      onClick={() => setSelectedMachine(eq)}
                      className="text-xs font-bold text-cyan-400 hover:text-cyan-300 underline"
                    >
                      Inspect Logs →
                    </button>
                  </div>
                </div>
              </TiltCard>
            );
          })}
        </div>
      </div>

      {/* Granular Section 2: Detailed Deployment Dispatch Table */}
      <div className="relative z-10 mb-8 rounded-3xl bg-white/5 border border-white/10 p-5 backdrop-blur-md">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-white">Deployment Dispatch & Return Telemetry</h3>
            <p className="text-xs text-slate-400">Real-time status of equipment on projects</p>
          </div>
          <span className="text-xs font-bold text-cyan-400 bg-cyan-950/60 px-3 py-1 rounded-full border border-cyan-500/30">
            {activeDeployments.length} Deployed
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="text-[11px] uppercase tracking-wider text-slate-400 border-b border-white/10 bg-white/5">
              <tr>
                <th className="p-3">Asset</th>
                <th className="p-3">Project Site</th>
                <th className="p-3">Renter Counterparty</th>
                <th className="p-3">Contract Period</th>
                <th className="p-3">Return Countdown</th>
                <th className="p-3">Contract Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {equipment.map((eq) => {
                const live = bookings.find((b) => b.equipment_id === eq.id && ["Approved", "Active"].includes(b.status));
                const remain = live ? daysDiff(live.end_date) : null;

                return (
                  <tr key={eq.id} className="hover:bg-white/5 transition">
                    <td className="p-3 font-semibold text-white">{eq.title}</td>
                    <td className="p-3 text-slate-300">{live?.deployment_location || live?.location || eq.location}</td>
                    <td className="p-3">
                      {live ? (
                        <div>
                          <p className="font-semibold text-cyan-300">{live.renter_name}</p>
                          <p className="text-[10px] text-slate-400">{live.renter_phone || live.renter_email || "Verified"}</p>
                        </div>
                      ) : (
                        <span className="text-slate-500 italic">—</span>
                      )}
                    </td>
                    <td className="p-3 text-slate-300">
                      {live ? `${String(live.start_date).slice(0, 10)} to ${String(live.end_date).slice(0, 10)}` : "—"}
                    </td>
                    <td className="p-3">
                      {remain !== null ? (
                        <span className={`font-bold ${remain < 0 ? "text-red-400" : remain <= 3 ? "text-amber-300" : "text-emerald-400"}`}>
                          {remain < 0 ? `⚠️ Overdue by ${Math.abs(remain)}d` : `Due in ${remain} day(s)`}
                        </span>
                      ) : (
                        <span className="text-slate-500">In Depot</span>
                      )}
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        live ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30" : "bg-white/10 text-slate-300"
                      }`}>
                        {live ? live.status : "Idle"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Granular Section 3: Financial Transaction Ledger */}
      <div className="relative z-10 rounded-3xl bg-white/5 border border-white/10 p-5 backdrop-blur-md">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <div>
            <h3 className="text-base font-bold text-white">Granular Financial Ledger ({bookings.length})</h3>
            <p className="text-xs text-slate-400">All booking invoices, payment states, and fee breakdowns</p>
          </div>
          <input
            type="text"
            placeholder="Filter by machine or renter..."
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            className="rounded-xl bg-white/10 px-3 py-1.5 text-xs text-white placeholder-slate-400 border border-white/15 focus:outline-none focus:ring-1 focus:ring-cyan-400 max-w-xs"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="text-[11px] uppercase tracking-wider text-slate-400 border-b border-white/10 bg-white/5">
              <tr>
                <th className="p-3">Invoice #</th>
                <th className="p-3">Machine</th>
                <th className="p-3">Client</th>
                <th className="p-3">Gross Total</th>
                <th className="p-3">Payment</th>
                <th className="p-3">State</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {bookings
                .filter((b) => {
                  const q = filterQuery.toLowerCase();
                  return !q || b.equipment_title.toLowerCase().includes(q) || b.renter_name.toLowerCase().includes(q);
                })
                .map((b) => (
                  <tr key={b.id} className="hover:bg-white/5 transition">
                    <td className="p-3 font-mono text-cyan-300">INV-{String(b.id).padStart(6, "0")}</td>
                    <td className="p-3 font-medium text-white">{b.equipment_title}</td>
                    <td className="p-3 text-slate-300">{b.renter_name}</td>
                    <td className="p-3 font-bold text-emerald-400">रु{Number(b.total_price).toLocaleString()}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        b.payment_status === "paid"
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                          : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                      }`}>
                        {b.payment_status === "paid" ? "Paid (Verified)" : "Unpaid"}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className="text-slate-300">{b.status}</span>
                    </td>
                  </tr>
                ))}
              {bookings.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-4 text-center text-slate-500">No ledger transactions found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Inspector Modal */}
      <SmoothModal
        isOpen={!!selectedMachine}
        onClose={() => setSelectedMachine(null)}
        title={selectedMachine?.title || "Asset Specs"}
        className="max-w-xl bg-slate-900 text-white border-white/20"
      >
        {selectedMachine && (
          <div className="space-y-4 text-xs">
            {selectedMachine.image_url && (
              <img src={selectedMachine.image_url} alt={selectedMachine.title} className="h-44 w-full object-cover rounded-xl" />
            )}
            <div className="grid grid-cols-2 gap-2 bg-white/5 p-3 rounded-xl border border-white/10">
              <div>
                <span className="text-slate-400">Category:</span> <span className="font-bold text-white">{selectedMachine.category}</span>
              </div>
              <div>
                <span className="text-slate-400">Daily Rate:</span> <span className="font-bold text-cyan-400">रु{Number(selectedMachine.price_per_day).toLocaleString()}</span>
              </div>
              <div>
                <span className="text-slate-400">Location:</span> <span className="font-bold text-white">{selectedMachine.location}</span>
              </div>
              <div>
                <span className="text-slate-400">Status:</span> <span className="font-bold text-emerald-400">{selectedMachine.is_available ? "Available" : "Maintenance"}</span>
              </div>
            </div>

            <p className="text-slate-300 leading-relaxed bg-white/5 p-3 rounded-xl">
              {selectedMachine.description || "Heavy agricultural/construction machinery ready for immediate project site dispatch."}
            </p>

            <div className="flex justify-end pt-2">
              <Link href="/bookings">
                <MagneticButton className="rounded-xl bg-cyan-500 px-4 py-2 font-bold text-white hover:bg-cyan-400 text-xs">
                  Review Pending Bookings
                </MagneticButton>
              </Link>
            </div>
          </div>
        )}
      </SmoothModal>
    </div>
  );
}
