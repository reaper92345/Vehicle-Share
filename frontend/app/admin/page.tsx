"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  AnimatedTabs,
  StatWidget,
  TiltCard,
  MagneticButton,
  SmoothModal,
  useNotification,
} from "../../components/smoothui";
import { EquipmentTrackingMap } from "../../components/EquipmentTrackingMap";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { Bar, Doughnut } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

interface AdminStats {
  totalUsers: number;
  totalEquipment: number;
  activeBookings: number;
  totalRevenue: number;
}

interface UserItem {
  id: string | number;
  name?: string;
  full_name?: string;
  email: string;
  phone_number?: string;
  role?: string;
  user_type?: string;
  created_at?: string;
}

interface EquipmentItem {
  id: number | string;
  title: string;
  category: string;
  location: string;
  price_per_day: number;
  is_available: boolean;
  owner_name?: string;
  owner_email?: string;
  image_url?: string;
}

interface BookingItem {
  id: number;
  equipment_title: string;
  renter_name?: string;
  owner_name?: string;
  start_date: string;
  end_date: string;
  total_price: number;
  status: string;
  payment_status: string;
  deployment_location?: string;
}

export default function ModernAdminCommandCenter() {
  const { success, error: notifyError, taxInvoice, info } = useNotification();
  const [tab, setTab] = useState<"overview" | "users" | "equipment" | "bookings" | "tracking">("overview");

  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalEquipment: 0,
    activeBookings: 0,
    totalRevenue: 0,
  });

  const [users, setUsers] = useState<UserItem[]>([]);
  const [equipmentList, setEquipmentList] = useState<EquipmentItem[]>([]);
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [userSearch, setUserSearch] = useState("");
  const [equipmentSearch, setEquipmentSearch] = useState("");

  // Inspect modal
  const [inspectModal, setInspectModal] = useState<{
    type: "user" | "equipment" | "booking";
    data: any;
  } | null>(null);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

  const fetchAllAdminData = async () => {
    setLoading(true);
    const token = localStorage.getItem("equipshare_token");
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const headers = { Authorization: `Bearer ${token}` };

      // 1. Fetch Stats
      const resStats = await fetch(`${apiUrl}/api/admin/analytics`, { headers });
      if (resStats.ok) {
        const data = await resStats.json();
        if (data.stats) setStats(data.stats);
      }

      // 2. Fetch Users
      const resUsers = await fetch(`${apiUrl}/api/admin/users`, { headers });
      if (resUsers.ok) {
        const uData = await resUsers.json();
        setUsers(Array.isArray(uData) ? uData : uData.users || []);
      }

      // 3. Fetch Equipment
      const resEquip = await fetch(`${apiUrl}/api/admin/equipment`, { headers });
      if (resEquip.ok) {
        const eData = await resEquip.json();
        setEquipmentList(Array.isArray(eData) ? eData : eData.equipment || []);
      }

      // 4. Fetch Bookings
      const resBookings = await fetch(`${apiUrl}/api/admin/bookings`, { headers });
      if (resBookings.ok) {
        const bData = await resBookings.json();
        setBookings(Array.isArray(bData) ? bData : bData.bookings || []);
      }
    } catch (err) {
      console.error("Admin fetch error", err);
      notifyError("Sync Error", "Failed to load real-time admin records from server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllAdminData();
  }, []);

  // Compute VAT breakdown
  const vatBreakdown = useMemo(() => {
    const gross = stats.totalRevenue || 0;
    const taxable = Math.round(gross / 1.13);
    const vat = gross - taxable;
    return { gross, taxable, vat };
  }, [stats.totalRevenue]);

  // Filtered lists
  const filteredUsers = useMemo(() => {
    const q = userSearch.toLowerCase().trim();
    if (!q) return users;
    return users.filter((u) => {
      const name = u.name || u.full_name || "";
      return name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
    });
  }, [users, userSearch]);

  const filteredEquipment = useMemo(() => {
    const q = equipmentSearch.toLowerCase().trim();
    if (!q) return equipmentList;
    return equipmentList.filter((e) => {
      return (
        e.title.toLowerCase().includes(q) ||
        e.category.toLowerCase().includes(q) ||
        e.location.toLowerCase().includes(q)
      );
    });
  }, [equipmentList, equipmentSearch]);

  // Charts configuration
  const categoryChartData = useMemo(() => {
    let construction = 0;
    let agriculture = 0;
    equipmentList.forEach((eq) => {
      if ((eq.category || "").toLowerCase().includes("agri")) agriculture++;
      else construction++;
    });

    return {
      labels: ["Heavy Construction", "Commercial Agriculture"],
      datasets: [
        {
          data: [construction || 2, agriculture || 1],
          backgroundColor: ["#0f766e", "#10b981"],
          borderWidth: 0,
        },
      ],
    };
  }, [equipmentList]);

  // Handle Equipment Availability Toggle
  const toggleEquipmentAvailability = async (id: number | string, current: boolean) => {
    const token = localStorage.getItem("equipshare_token");
    try {
      const res = await fetch(`${apiUrl}/api/admin/equipment/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ is_available: !current }),
      });

      if (res.ok) {
        setEquipmentList((prev) =>
          prev.map((e) => (String(e.id) === String(id) ? { ...e, is_available: !current } : e))
        );
        success("Catalog Updated", `Equipment status switched to ${!current ? "Available" : "Unavailable"}.`);
      } else {
        notifyError("Update Failed", "Could not modify equipment listing.");
      }
    } catch (_) {
      notifyError("Network Error", "Failed to update equipment.");
    }
  };

  // Open official VAT receipt
  const viewReceipt = (bookingId: number) => {
    const token = localStorage.getItem("equipshare_token");
    window.open(`${apiUrl}/api/payments/${bookingId}/receipt?token=${token}`, "_blank");
    taxInvoice(`INV-${String(bookingId).padStart(6, "0")}`, "IRD Record Verified", `${apiUrl}/api/payments/${bookingId}/receipt`);
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Top Welcome & IRD Statutory Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-xs font-black uppercase tracking-wider text-emerald-700">
              National Equipment Registry · IRD Tax Compliant
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
            Admin Command Center
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Fleet telematics, tax audit, contractor approvals, and machinery controls across Nepal.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 shadow-xs">
            <span className="block text-[10px] text-slate-400 font-bold uppercase">Tax / PAN</span>
            <span className="font-mono text-xs font-black text-slate-900">610394821</span>
          </div>
          <MagneticButton
            onClick={fetchAllAdminData}
            className="btn-secondary text-xs py-2 px-3.5 rounded-xl border border-slate-200 flex items-center gap-1.5 shadow-xs"
          >
            🔄 Sync Live Data
          </MagneticButton>
        </div>
      </div>

      {/* KPI Stat Widgets Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatWidget
          label="Gross Platform Turnover"
          value={`रु ${stats.totalRevenue.toLocaleString()}`}
          trend={`13% VAT: रु ${vatBreakdown.vat.toLocaleString()}`}
          icon="💰"
          accentColor="emerald"
        />
        <StatWidget
          label="Registered Machinery"
          value={stats.totalEquipment}
          trend="Construction & Agri Fleet"
          icon="🚜"
          accentColor="brand"
        />
        <StatWidget
          label="Active Field Deployments"
          value={stats.activeBookings}
          trend="Machines on Project Sites"
          icon="⚡"
          accentColor="amber"
        />
        <StatWidget
          label="Verified Users & Contractors"
          value={stats.totalUsers}
          trend="Listers, Renters & Admins"
          icon="👥"
          accentColor="blue"
        />
      </div>

      {/* Animated Tabs Navigation */}
      <div>
        <AnimatedTabs
          activeTab={tab}
          onChange={(t) => setTab(t)}
          tabs={[
            { id: "overview" as const, label: "Overview & Analytics", icon: "📊" },
            { id: "users" as const, label: "Contractors & Users", badge: users.length, icon: "👥" },
            { id: "equipment" as const, label: "Machinery Fleet", badge: equipmentList.length, icon: "🚜" },
            { id: "bookings" as const, label: "Tax Invoices & Rentals", badge: bookings.length, icon: "📑" },
            { id: "tracking" as const, label: "National GPS Telematics", icon: "🗺️" },
          ]}
        />
      </div>

      {/* ===================== TAB 1: OVERVIEW & ANALYTICS ===================== */}
      {tab === "overview" && (
        <div className="grid gap-6 lg:grid-cols-12 items-start">
          {/* Revenue & IRD Tax Breakdown Card */}
          <div className="lg:col-span-8 card p-6 bg-white border border-slate-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6 pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Fiscal Revenue & IRD VAT Compliance Audit
                </h3>
                <p className="text-xs text-slate-500">
                  Calculated under Nepal Inland Revenue Department (IRD) Value Added Tax Act 2052
                </p>
              </div>
              <span className="rounded-full bg-emerald-50 text-emerald-700 px-3 py-1 text-xs font-bold border border-emerald-100">
                13% Standard VAT
              </span>
            </div>

            <div className="grid gap-4 sm:grid-cols-3 mb-6">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Taxable Sales</span>
                <p className="text-xl font-black text-slate-900 mt-1">
                  रु {vatBreakdown.taxable.toLocaleString()}
                </p>
              </div>
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4">
                <span className="text-[10px] text-emerald-600 font-bold uppercase">13% VAT Collected</span>
                <p className="text-xl font-black text-emerald-800 mt-1">
                  रु {vatBreakdown.vat.toLocaleString()}
                </p>
              </div>
              <div className="rounded-2xl border border-brand-200 bg-brand-50/50 p-4">
                <span className="text-[10px] text-brand-700 font-bold uppercase">Gross Commercial Total</span>
                <p className="text-xl font-black text-brand-900 mt-1">
                  रु {vatBreakdown.gross.toLocaleString()}
                </p>
              </div>
            </div>

            {/* Quick Audit Info */}
            <div className="rounded-2xl border border-slate-200 bg-slate-900 text-white p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1">
                <p className="text-xs font-bold text-white">Audited Company Identity</p>
                <p className="text-[11px] text-slate-400">
                  EquipShare Marketplace Nepal Pvt. Ltd. · Central Depot: Jagati-7, Bhaktapur
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Link href="/hire/dashboard">
                  <MagneticButton className="btn-secondary text-xs py-2 px-3 rounded-xl bg-slate-800 text-slate-200 hover:bg-slate-700">
                    Hire Portal Preview
                  </MagneticButton>
                </Link>
                <Link href="/owner/dashboard">
                  <MagneticButton className="btn-secondary text-xs py-2 px-3 rounded-xl bg-slate-800 text-slate-200 hover:bg-slate-700">
                    Lister Portal Preview
                  </MagneticButton>
                </Link>
              </div>
            </div>
          </div>

          {/* Machinery Distribution Donut */}
          <div className="lg:col-span-4 card p-6 bg-white border border-slate-200 flex flex-col justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Fleet Composition</h3>
              <p className="text-xs text-slate-500 mb-4">Machinery asset share by sector</p>
              <div className="h-52 w-full flex items-center justify-center">
                <Doughnut
                  data={categoryChartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { position: "bottom", labels: { font: { size: 11 } } },
                    },
                  }}
                />
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Total Fleet: {equipmentList.length} Units</span>
              <span className="font-semibold text-emerald-700">All registered</span>
            </div>
          </div>
        </div>
      )}

      {/* ===================== TAB 2: USER DIRECTORY & MODERATION ===================== */}
      {tab === "users" && (
        <div className="card p-6 bg-white border border-slate-200 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Registered Users & Contractors</h3>
              <p className="text-xs text-slate-500">Manage user authorization roles and access privileges.</p>
            </div>
            <input
              type="text"
              placeholder="Search by name or email..."
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              className="input max-w-xs text-xs"
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-slate-50 text-slate-500 text-left border-y border-slate-100">
                <tr>
                  <th className="p-3">User</th>
                  <th className="p-3">Email Address</th>
                  <th className="p-3">Role / Portal</th>
                  <th className="p-3">Contact</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((u) => {
                  const role = (u.role || u.user_type || "renter").toLowerCase();
                  return (
                    <tr key={u.id} className="hover:bg-slate-50/60 transition">
                      <td className="p-3 font-bold text-slate-900">
                        {u.full_name || u.name || "Anonymous User"}
                      </td>
                      <td className="p-3 text-slate-600 font-mono">{u.email}</td>
                      <td className="p-3">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${
                            role === "admin"
                              ? "bg-purple-100 text-purple-800"
                              : role === "owner"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {role}
                        </span>
                      </td>
                      <td className="p-3 text-slate-600">{u.phone_number || "+977-XXXXXXXXXX"}</td>
                      <td className="p-3">
                        <span className="inline-flex items-center gap-1 text-emerald-700 font-medium">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                          Verified
                        </span>
                      </td>
                      <td className="p-3">
                        <MagneticButton
                          onClick={() => setInspectModal({ type: "user", data: u })}
                          className="text-brand-700 hover:text-brand-900 font-bold hover:underline"
                        >
                          Inspect
                        </MagneticButton>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ===================== TAB 3: MACHINERY FLEET CONTROL ===================== */}
      {tab === "equipment" && (
        <div className="card p-6 bg-white border border-slate-200 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Machinery Fleet & Rates</h3>
              <p className="text-xs text-slate-500">Enable/disable equipment availability and oversee rental listings.</p>
            </div>
            <input
              type="text"
              placeholder="Search machinery by title, category, city..."
              value={equipmentSearch}
              onChange={(e) => setEquipmentSearch(e.target.value)}
              className="input max-w-xs text-xs"
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-slate-50 text-slate-500 text-left border-y border-slate-100">
                <tr>
                  <th className="p-3">Machinery Title</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Depot / Location</th>
                  <th className="p-3">Daily Rate</th>
                  <th className="p-3">Availability</th>
                  <th className="p-3">Controls</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredEquipment.map((eq) => (
                  <tr key={eq.id} className="hover:bg-slate-50/60 transition">
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        {eq.image_url && (
                          <img
                            src={eq.image_url}
                            alt={eq.title}
                            className="h-10 w-12 rounded-lg object-cover bg-slate-100 shrink-0"
                          />
                        )}
                        <div>
                          <p className="font-bold text-slate-900">{eq.title}</p>
                          <span className="text-[10px] text-slate-400 font-mono">ID: #{eq.id}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-3 text-slate-600 font-medium">{eq.category}</td>
                    <td className="p-3 text-slate-600">📍 {eq.location}</td>
                    <td className="p-3 font-bold text-brand-700">
                      रु {Number(eq.price_per_day).toLocaleString()}/day
                    </td>
                    <td className="p-3">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                          eq.is_available ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
                        }`}
                      >
                        {eq.is_available ? "Available" : "Maintenance / Reserved"}
                      </span>
                    </td>
                    <td className="p-3 space-x-2">
                      <button
                        onClick={() => toggleEquipmentAvailability(eq.id, eq.is_available)}
                        className={`text-[11px] font-bold px-2 py-1 rounded-lg border transition ${
                          eq.is_available
                            ? "border-amber-200 text-amber-700 hover:bg-amber-50"
                            : "border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                        }`}
                      >
                        {eq.is_available ? "Mark Inactive" : "Mark Active"}
                      </button>
                      <MagneticButton
                        onClick={() => setInspectModal({ type: "equipment", data: eq })}
                        className="text-slate-600 hover:text-slate-900 font-bold px-2 py-1 text-[11px]"
                      >
                        View
                      </MagneticButton>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ===================== TAB 4: TAX INVOICES & BOOKINGS LEDGER ===================== */}
      {tab === "bookings" && (
        <div className="card p-6 bg-white border border-slate-200 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Commercial Tax Invoices & Rentals Ledger</h3>
              <p className="text-xs text-slate-500">
                Official Nepal VAT invoices with 13% tax audit and mobile QR settlement records.
              </p>
            </div>
            <div className="rounded-xl bg-slate-900 text-white px-3.5 py-1.5 text-xs font-semibold flex items-center gap-2">
              <span>🧾 Total Invoices: {bookings.length}</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-slate-50 text-slate-500 text-left border-y border-slate-100">
                <tr>
                  <th className="p-3">Invoice #</th>
                  <th className="p-3">Equipment</th>
                  <th className="p-3">Contractor / Renter</th>
                  <th className="p-3">Rental Dates</th>
                  <th className="p-3">Total Amount</th>
                  <th className="p-3">13% VAT</th>
                  <th className="p-3">Payment</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {bookings.map((b) => {
                  const gross = Number(b.total_price) || 0;
                  const vat = Math.round(gross - gross / 1.13);
                  return (
                    <tr key={b.id} className="hover:bg-slate-50/60 transition">
                      <td className="p-3 font-mono font-bold text-slate-800">
                        INV-{String(b.id).padStart(6, "0")}
                      </td>
                      <td className="p-3 font-semibold text-slate-900">{b.equipment_title}</td>
                      <td className="p-3 text-slate-600">{b.renter_name || "Contractor"}</td>
                      <td className="p-3 text-slate-500">
                        {String(b.start_date).slice(0, 10)} → {String(b.end_date).slice(0, 10)}
                      </td>
                      <td className="p-3 font-black text-brand-700">रु {gross.toLocaleString()}</td>
                      <td className="p-3 text-emerald-700 font-semibold font-mono">रु {vat.toLocaleString()}</td>
                      <td className="p-3">
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                            b.payment_status === "paid"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {b.payment_status === "paid" ? "Paid" : "Pending"}
                        </span>
                      </td>
                      <td className="p-3">
                        <MagneticButton
                          onClick={() => viewReceipt(b.id)}
                          className="btn-primary text-[10px] py-1.5 px-3 rounded-lg flex items-center gap-1"
                        >
                          <span>🧾</span>
                          <span>VAT Invoice</span>
                        </MagneticButton>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ===================== TAB 5: NATIONAL GPS TELEMATICS ===================== */}
      {tab === "tracking" && (
        <div className="space-y-4">
          <EquipmentTrackingMap
            equipmentTitle="Volvo EC950F Crawler Heavy Excavator"
            equipmentCategory="Construction"
            selectedDestinationName="Kathmandu Ring Road Project Site"
          />
        </div>
      )}

      {/* SmoothModal for Details Inspection */}
      <SmoothModal
        isOpen={!!inspectModal}
        onClose={() => setInspectModal(null)}
        title={
          inspectModal?.type === "user"
            ? "Contractor & KYC Record"
            : inspectModal?.type === "equipment"
            ? "Equipment Asset Specifications"
            : "Booking Details"
        }
      >
        {inspectModal && (
          <div className="space-y-4 text-xs">
            <pre className="p-4 bg-slate-900 text-emerald-400 rounded-xl overflow-x-auto text-[11px] font-mono leading-relaxed">
              {JSON.stringify(inspectModal.data, null, 2)}
            </pre>
            <div className="flex justify-end pt-2">
              <MagneticButton
                onClick={() => setInspectModal(null)}
                className="btn-primary text-xs py-2 px-4 rounded-xl"
              >
                Close
              </MagneticButton>
            </div>
          </div>
        )}
      </SmoothModal>
    </div>
  );
}
