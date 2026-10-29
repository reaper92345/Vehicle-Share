"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import PortalNav from "../../../components/PortalNav";
import {
  AnimatedTabs,
  TiltCard,
  StatWidget,
  MagneticButton,
  SmoothModal,
} from "../../../components/smoothui";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from "chart.js";
import { Doughnut, Bar } from "react-chartjs-2";

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
}

interface BookingSummary {
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
  image_url?: string;
}

interface DirectoryUser {
  id: string;
  full_name: string;
  email: string;
  phone_number: string;
  user_type: string;
}

function daysUntil(dateValue: string) {
  const end = new Date(`${String(dateValue).slice(0, 10)}T00:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

function deploymentStatus(booking: BookingSummary | undefined, available: boolean) {
  if (!booking) return available ? "Idle" : "Maintenance";
  const start = String(booking.start_date).slice(0, 10);
  const today = new Date().toISOString().slice(0, 10);
  if (["Approved", "Active"].includes(booking.status) && start > today) return "In-transit";
  if (["Approved", "Active"].includes(booking.status)) return "Deployed";
  return "Idle";
}

export default function ModernOwnerDashboard() {
  const router = useRouter();
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [bookings, setBookings] = useState<BookingSummary[]>([]);
  const [users, setUsers] = useState<DirectoryUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"overview" | "deployments" | "payments" | "directory">("overview");
  const [user, setUser] = useState<{ full_name?: string; name?: string; role?: string; user_type?: string } | null>(null);
  const [userSearch, setUserSearch] = useState("");

  // Detailed Modal state
  const [selectedMachine, setSelectedMachine] = useState<Equipment | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("equipshare_user");
    const storedToken = localStorage.getItem("equipshare_token");

    if (!storedToken || !storedUser) {
      router.push("/login?redirect=/owner/dashboard");
      return;
    }

    let parsedUser: typeof user = null;
    try {
      parsedUser = JSON.parse(storedUser);
    } catch (_) {
      router.push("/login");
      return;
    }

    const role = (parsedUser?.role || parsedUser?.user_type || "").toLowerCase();
    if (role !== "owner" && role !== "both" && role !== "admin") {
      router.push("/hire/dashboard");
      return;
    }

    setUser(parsedUser);
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
    const headers = { Authorization: `Bearer ${storedToken}` };

    async function loadData() {
      try {
        const [resEquip, resBookings, resUsers] = await Promise.all([
          fetch(`${apiUrl}/api/equipment/mine`, { headers }),
          fetch(`${apiUrl}/api/bookings/owner/dashboard`, { headers }),
          fetch(`${apiUrl}/api/users`, { headers }),
        ]);

        if (resEquip.ok) {
          const data = await resEquip.json();
          setEquipment(data.equipment || []);
        }

        if (resBookings.ok) {
          const data = await resBookings.json();
          setBookings(data.bookings || []);
        } else if (resBookings.status === 401) {
          localStorage.removeItem("equipshare_token");
          localStorage.removeItem("equipshare_user");
          router.push("/login");
          return;
        }

        if (resUsers.ok) {
          const data = await resUsers.json();
          setUsers(data.users || []);
        }
      } catch (e) {
        console.error("Failed to load owner dashboard data:", e);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [router]);

  // Calculations for KPI widgets
  const pendingCount = bookings.filter((b) => b.status === "Pending").length;
  const activeDeployments = bookings.filter((b) => ["Approved", "Active"].includes(b.status));
  const totalEarnings = bookings
    .filter((b) => b.payment_status === "paid")
    .reduce((sum, b) => sum + Number(b.total_price), 0);
  const paidBookings = bookings.filter((b) => b.payment_status === "paid");

  // Fleet utilization percentage
  const utilizationRate = useMemo(() => {
    if (equipment.length === 0) return 0;
    return Math.round((activeDeployments.length / equipment.length) * 100);
  }, [activeDeployments.length, equipment.length]);

  // 1. Donut Chart Data: Fleet Deployment Status Breakdown
  const donutChartData = useMemo(() => {
    let deployed = 0;
    let inTransit = 0;
    let idle = 0;

    equipment.forEach((eq) => {
      const live = bookings.find((b) => b.equipment_id === eq.id && ["Approved", "Active"].includes(b.status));
      const status = deploymentStatus(live, eq.is_available);
      if (status === "Deployed") deployed++;
      else if (status === "In-transit") inTransit++;
      else idle++;
    });

    return {
      labels: ["Deployed (Active)", "In-Transit", "Idle / Available"],
      datasets: [
        {
          data: [deployed, inTransit, idle],
          backgroundColor: ["#2563eb", "#f59e0b", "#10b981"],
          borderColor: ["#ffffff", "#ffffff", "#ffffff"],
          borderWidth: 2,
        },
      ],
    };
  }, [equipment, bookings]);

  // 2. Bar Chart Data: Revenue Per Machine
  const revenueByEquipmentData = useMemo(() => {
    const labels = equipment.map((e) => e.title);
    const revenueData = equipment.map((eq) => {
      return bookings
        .filter((b) => b.equipment_id === eq.id && (b.payment_status === "paid" || ["Approved", "Active"].includes(b.status)))
        .reduce((sum, b) => sum + Number(b.total_price), 0);
    });

    return {
      labels: labels.length > 0 ? labels : ["No Equipment"],
      datasets: [
        {
          label: "Revenue Generated (रु)",
          data: revenueData.length > 0 ? revenueData : [0],
          backgroundColor: "rgba(15, 118, 110, 0.85)",
          borderRadius: 8,
        },
      ],
    };
  }, [equipment, bookings]);

  const filteredUsers = useMemo(() => {
    const q = userSearch.trim().toLowerCase();
    if (!q) return users;
    return users.filter((u) =>
      [u.full_name, u.email, u.phone_number, u.user_type].some((v) => String(v).toLowerCase().includes(q))
    );
  }, [users, userSearch]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Approved": return "bg-emerald-100 text-emerald-800";
      case "Active": return "bg-blue-100 text-blue-800";
      case "Completed": return "bg-slate-100 text-slate-700";
      case "Cancelled": return "bg-red-100 text-red-700";
      default: return "bg-amber-100 text-amber-800";
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 pb-20">
      <PortalNav subtitle="Lister Command & Analytics Center" />

      <div className="mx-auto max-w-7xl px-6">
        {/* Welcome Banner */}
        <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Lister Analytics Dashboard
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Welcome back, <span className="font-semibold text-slate-800">{user?.full_name || user?.name || "Owner"}</span>. Real-time fleet performance, revenue analytics, and deployment monitor.
            </p>
          </div>
          <Link href="/equipment/create">
            <MagneticButton className="btn-primary text-xs py-2.5 px-4 rounded-xl flex items-center gap-2">
              <span>+ List New Machinery</span>
            </MagneticButton>
          </Link>
        </div>

        {/* Top KPI Widgets with SmoothUI */}
        {!loading && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            <StatWidget
              label="Total Earnings"
              value={`रु${totalEarnings.toLocaleString()}`}
              icon="💰"
              accentColor="emerald"
              trend="Verified paid income"
            />
            <StatWidget
              label="Active Deployments"
              value={activeDeployments.length}
              icon="🚜"
              accentColor="brand"
              trend="Working at project sites"
            />
            <StatWidget
              label="Fleet Utilization"
              value={`${utilizationRate}%`}
              icon="📈"
              accentColor="blue"
              trend={`${equipment.length} machine(s) in fleet`}
            />
            <StatWidget
              label="Pending Requests"
              value={pendingCount}
              icon="⏳"
              accentColor="amber"
              trend="Awaiting your approval"
            />
          </div>
        )}

        {/* Analytics Charts Section */}
        {!loading && equipment.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Doughnut Chart: Fleet Deployment Status */}
            <div className="card p-6 bg-white flex flex-col items-center justify-between">
              <div className="w-full mb-3 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Fleet Deployment Status</h3>
                  <p className="text-xs text-slate-500">Live machinery availability</p>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 rounded-lg text-slate-600">
                  {equipment.length} Total
                </span>
              </div>
              <div className="relative h-56 w-56 flex items-center justify-center my-2">
                <Doughnut
                  data={donutChartData}
                  options={{
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { position: "bottom", labels: { boxWidth: 12, font: { size: 11 } } },
                    },
                    cutout: "70%",
                  }}
                />
              </div>
              <div className="w-full text-center text-xs text-slate-500 pt-2 border-t border-slate-100">
                {activeDeployments.length} deployed on sites across Nepal
              </div>
            </div>

            {/* Bar Chart: Revenue by Machine */}
            <div className="card p-6 bg-white lg:col-span-2 flex flex-col justify-between">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Earnings by Machinery</h3>
                  <p className="text-xs text-slate-500">Gross revenue generated per equipment asset</p>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-100">
                  रु{totalEarnings.toLocaleString()} Paid
                </span>
              </div>
              <div className="h-56 w-full">
                <Bar
                  data={revenueByEquipmentData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      y: {
                        beginAtZero: true,
                        ticks: {
                          callback: (val) => `रु${Number(val) / 1000}k`,
                          font: { size: 11 },
                        },
                      },
                      x: {
                        ticks: { font: { size: 11 } },
                      },
                    },
                    plugins: {
                      legend: { display: false },
                      tooltip: {
                        callbacks: {
                          label: (ctx) => ` Revenue: रु${Number(ctx.raw).toLocaleString()}`,
                        },
                      },
                    },
                  }}
                />
              </div>
              <div className="text-xs text-slate-500 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span>Top earner: {equipment[0]?.title || "N/A"}</span>
                <Link href="/bookings" className="text-brand-700 font-semibold hover:underline">
                  Manage incoming requests →
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Animated Tabs Navigation */}
        <div className="mb-6">
          <AnimatedTabs
            activeTab={tab}
            onChange={(newTab) => setTab(newTab)}
            tabs={[
              { id: "overview" as const, label: "Fleet Overview", icon: "🚜", badge: equipment.length },
              { id: "deployments" as const, label: "Deployment & Return Monitor", badge: activeDeployments.length, icon: "📍" },
              { id: "payments" as const, label: "Payment Ledger", badge: paidBookings.length, icon: "💳" },
              { id: "directory" as const, label: "User Directory", icon: "👥" },
            ]}
          />
        </div>

        {/* Loading Skeleton */}
        {loading && (
          <div className="space-y-4">
            {[1, 2, 3].map((n) => (
              <div key={n} className="card p-6 animate-pulse space-y-3">
                <div className="bg-gray-200 h-5 w-1/3 rounded" />
                <div className="bg-gray-200 h-4 w-1/2 rounded" />
              </div>
            ))}
          </div>
        )}

        {/* TAB 1: FLEET OVERVIEW */}
        {!loading && tab === "overview" && (
          <section className="mb-10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-slate-900">My Listed Equipment</h2>
              <span className="text-xs text-slate-500 font-medium">Click any machinery for full specs & rental log</span>
            </div>
            {equipment.length === 0 ? (
              <div className="card p-10 text-center">
                <p className="text-slate-600">You have no equipment listed yet.</p>
                <Link href="/equipment/create" className="btn-primary mt-4 inline-block">List your first machinery</Link>
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {equipment.map((eq) => {
                  const live = bookings.find((b) => b.equipment_id === eq.id && ["Approved", "Active"].includes(b.status));
                  const status = deploymentStatus(live, eq.is_available);
                  const machineBookings = bookings.filter((b) => b.equipment_id === eq.id);
                  const machineRevenue = machineBookings
                    .filter((b) => b.payment_status === "paid")
                    .reduce((sum, b) => sum + Number(b.total_price), 0);

                  return (
                    <TiltCard key={eq.id} className="card flex flex-col justify-between overflow-hidden group">
                      <div>
                        {eq.image_url ? (
                          <img src={eq.image_url} alt={eq.title} className="h-44 w-full object-cover rounded-t-xl" />
                        ) : (
                          <div className="h-44 w-full bg-slate-100 flex items-center justify-center text-4xl">🚜</div>
                        )}
                        <div className="p-5">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{eq.category}</span>
                            <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                              status === "Deployed" ? "bg-blue-100 text-blue-800" :
                              status === "In-transit" ? "bg-amber-100 text-amber-800" :
                              "bg-emerald-100 text-emerald-800"
                            }`}>
                              {status}
                            </span>
                          </div>
                          <h3 className="font-bold text-lg text-slate-900">{eq.title}</h3>
                          <p className="text-xs text-slate-500 mt-0.5">📍 {eq.location}</p>

                          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                            <span className="font-semibold text-brand-700 text-sm">रु{Number(eq.price_per_day).toLocaleString()}/day</span>
                            <span className="text-slate-500">{machineBookings.length} booking(s)</span>
                          </div>
                        </div>
                      </div>

                      <div className="p-5 pt-0">
                        <MagneticButton
                          onClick={() => setSelectedMachine(eq)}
                          className="w-full btn-secondary text-xs py-2 rounded-xl border border-slate-200 hover:bg-slate-50 flex items-center justify-center gap-1.5"
                        >
                          🔍 Inspect Details & Logs
                        </MagneticButton>
                      </div>
                    </TiltCard>
                  );
                })}
              </div>
            )}
          </section>
        )}

        {/* TAB 2: DEPLOYMENTS & RETURN MONITOR */}
        {!loading && tab === "deployments" && (
          <section className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl font-bold text-slate-900">Equipment Deployment & Return Monitor</h2>
              <span className="text-xs text-slate-500">Live project site tracker</span>
            </div>

            {equipment.map((eq) => {
              const live = bookings.find((b) => b.equipment_id === eq.id && ["Approved", "Active"].includes(b.status));
              const status = deploymentStatus(live, eq.is_available);
              const remain = live ? daysUntil(live.end_date) : null;

              return (
                <div key={eq.id} className="card p-5 bg-white border border-slate-200">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-lg text-slate-900">{eq.title}</p>
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${getStatusBadge(live?.status || "Idle")}`}>
                          {status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">
                        Project Site: <span className="font-medium text-slate-700">{live?.deployment_location || live?.location || eq.location}</span>
                      </p>
                      {live ? (
                        <div className="text-xs text-slate-600 pt-1">
                          Renter: <span className="font-semibold text-slate-800">{live.renter_name}</span>
                          {live.renter_phone && ` · 📞 ${live.renter_phone}`}
                          {live.renter_email && ` · ✉️ ${live.renter_email}`}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-400 italic">No active deployment currently assigned</p>
                      )}
                    </div>

                    <div className="text-left sm:text-right border-t sm:border-t-0 pt-2 sm:pt-0">
                      {remain !== null ? (
                        <div>
                          <p className={`text-base font-bold ${remain < 0 ? "text-red-600" : remain <= 3 ? "text-amber-600" : "text-emerald-700"}`}>
                            {remain < 0 ? `⚠️ Overdue by ${Math.abs(remain)} day(s)` : `Return due in ${remain} day(s)`}
                          </p>
                          <p className="text-xs text-slate-500 mt-0.5">
                            Rental period: {String(live?.start_date).slice(0, 10)} to {String(live?.end_date).slice(0, 10)}
                          </p>
                        </div>
                      ) : (
                        <span className="text-xs font-semibold px-3 py-1 bg-slate-100 text-slate-600 rounded-lg">
                          Available in Garage
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </section>
        )}

        {/* TAB 3: PAYMENT LEDGER */}
        {!loading && tab === "payments" && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-slate-900">Payment & Payout History</h2>
              <span className="text-xs text-emerald-700 font-semibold bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-100">
                Total Payout: रु{totalEarnings.toLocaleString()}
              </span>
            </div>
            <div className="card overflow-x-auto bg-white">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-left text-slate-500 border-b border-slate-100">
                  <tr>
                    <th className="p-3">Invoice #</th>
                    <th className="p-3">Equipment</th>
                    <th className="p-3">Renter</th>
                    <th className="p-3">Amount</th>
                    <th className="p-3">Payment Status</th>
                    <th className="p-3">Booking Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {bookings.map((b) => (
                    <tr key={b.id} className="hover:bg-slate-50/50 transition">
                      <td className="p-3 font-mono text-xs font-semibold text-slate-600">
                        INV-{String(b.id).padStart(6, "0")}
                      </td>
                      <td className="p-3 font-medium text-slate-900">{b.equipment_title}</td>
                      <td className="p-3 text-slate-700">{b.renter_name}</td>
                      <td className="p-3 font-bold text-brand-700">रु{Number(b.total_price).toLocaleString()}</td>
                      <td className="p-3">
                        <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                          b.payment_status === "paid" ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-600"
                        }`}>
                          {b.payment_status === "paid" ? "Paid ✓" : "Unpaid"}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${getStatusBadge(b.status)}`}>
                          {b.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {bookings.length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-6 text-center text-slate-500">No payment records yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* TAB 4: USER DIRECTORY */}
        {!loading && tab === "directory" && (
          <section>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
              <h2 className="text-xl font-bold text-slate-900">User & Partner Directory</h2>
              <input
                type="text"
                placeholder="Search user by name, email, role..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="input max-w-xs text-sm"
              />
            </div>
            <div className="card overflow-x-auto bg-white">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-left text-slate-500 border-b border-slate-100">
                  <tr>
                    <th className="p-3">Name</th>
                    <th className="p-3">Email</th>
                    <th className="p-3">Phone</th>
                    <th className="p-3">Role</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50/50 transition">
                      <td className="p-3 font-semibold text-slate-900">{u.full_name}</td>
                      <td className="p-3 text-slate-600">{u.email}</td>
                      <td className="p-3 text-slate-600">{u.phone_number || "—"}</td>
                      <td className="p-3">
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium uppercase tracking-wide text-slate-700">
                          {u.user_type}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </div>

      {/* DETAILED INSPECTION MODAL (SmoothModal) */}
      <SmoothModal
        isOpen={!!selectedMachine}
        onClose={() => setSelectedMachine(null)}
        title={selectedMachine?.title || "Machine Inspector"}
        className="max-w-2xl"
      >
        {selectedMachine && (
          <div className="space-y-5">
            {selectedMachine.image_url && (
              <img
                src={selectedMachine.image_url}
                alt={selectedMachine.title}
                className="h-48 w-full object-cover rounded-xl border border-slate-100"
              />
            )}

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
              <div>
                <p className="text-xs text-slate-500 uppercase">Category</p>
                <p className="font-semibold text-slate-800 text-sm mt-0.5">{selectedMachine.category}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase">Base Location</p>
                <p className="font-semibold text-slate-800 text-sm mt-0.5">{selectedMachine.location}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase">Daily Rate</p>
                <p className="font-bold text-brand-700 text-sm mt-0.5">रु{Number(selectedMachine.price_per_day).toLocaleString()}</p>
              </div>
            </div>

            {selectedMachine.description && (
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Specifications & Description</h4>
                <p className="text-xs text-slate-600 leading-relaxed bg-white p-3 rounded-lg border border-slate-100">
                  {selectedMachine.description}
                </p>
              </div>
            )}

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Rental Logs for this Asset</h4>
              {(() => {
                const logs = bookings.filter((b) => b.equipment_id === selectedMachine.id);
                if (logs.length === 0) {
                  return <p className="text-xs text-slate-400 italic">No bookings recorded for this asset yet.</p>;
                }
                return (
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {logs.map((log) => (
                      <div key={log.id} className="p-3 rounded-xl border border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs">
                        <div>
                          <p className="font-semibold text-slate-800">{log.renter_name}</p>
                          <p className="text-slate-500 mt-0.5">
                            {String(log.start_date).slice(0, 10)} to {String(log.end_date).slice(0, 10)}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${getStatusBadge(log.status)}`}>
                            {log.status}
                          </span>
                          <p className="font-bold text-slate-700 mt-1">रु{Number(log.total_price).toLocaleString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>

            <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
              <Link href={`/bookings`}>
                <MagneticButton className="btn-primary text-xs py-2 px-4 rounded-xl">
                  Manage Requests
                </MagneticButton>
              </Link>
            </div>
          </div>
        )}
      </SmoothModal>
    </main>
  );
}
