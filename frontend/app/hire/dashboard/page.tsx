"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import PortalNav from "../../../components/PortalNav";
import { AnimatedTabs, StatWidget, MagneticButton, useNotification } from "../../../components/smoothui";
import { EquipmentTrackingMap } from "../../../components/EquipmentTrackingMap";

interface Booking {
  id: number;
  equipment_title: string;
  location?: string;
  deployment_location?: string;
  image_url?: string;
  owner_name?: string;
  owner_email?: string;
  owner_phone?: string;
  start_date: string;
  end_date: string;
  total_price: number;
  status: string;
  payment_status: string;
  created_at?: string;
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

export default function HireDashboard() {
  const router = useRouter();
  const { success, error: notifyError, taxInvoice } = useNotification();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [users, setUsers] = useState<DirectoryUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"overview" | "active" | "tracking" | "payments" | "directory">("overview");
  const [user, setUser] = useState<{ full_name?: string; name?: string } | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

  useEffect(() => {
    const storedUser = localStorage.getItem("equipshare_user");
    const storedToken = localStorage.getItem("equipshare_token");
    if (!storedToken || !storedUser) {
      router.push("/login?redirect=/hire/dashboard");
      return;
    }
    try {
      setUser(JSON.parse(storedUser));
    } catch (_) {
      router.push("/login");
      return;
    }

    const role = (() => {
      try {
        const parsed = JSON.parse(storedUser);
        return (parsed.role || parsed.user_type || "").toLowerCase();
      } catch {
        return "";
      }
    })();
    if (!["renter", "both", "admin"].includes(role)) {
      router.push("/owner/dashboard");
      return;
    }

    const headers = { Authorization: `Bearer ${storedToken}` };
    async function load() {
      try {
        const [resBookings, resUsers] = await Promise.all([
          fetch(`${apiUrl}/api/bookings/me`, { headers }),
          fetch(`${apiUrl}/api/users`, { headers }),
        ]);
        if (resBookings.status === 401) {
          localStorage.removeItem("equipshare_token");
          localStorage.removeItem("equipshare_user");
          router.push("/login");
          return;
        }
        if (resBookings.ok) {
          const data = await resBookings.json();
          setBookings(data.bookings || []);
        }
        if (resUsers.ok) {
          const data = await resUsers.json();
          setUsers(data.users || []);
        }
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [apiUrl, router]);

  const active = bookings.filter((b) => ["Approved", "Active"].includes(b.status));
  const completed = bookings.filter((b) => b.status === "Completed");
  const outstanding = bookings
    .filter((b) => ["Approved", "Active"].includes(b.status) && b.payment_status !== "paid")
    .reduce((sum, b) => sum + Number(b.total_price), 0);
  const paid = bookings.filter((b) => b.payment_status === "paid");

  const providers = useMemo(
    () => users.filter((u) => ["owner", "both"].includes(u.user_type)),
    [users]
  );

  const token = typeof window !== "undefined" ? localStorage.getItem("equipshare_token") : null;

  const resendReceipt = async (id: number) => {
    setMessage(null);
    const res = await fetch(`${apiUrl}/api/payments/${id}/resend-receipt`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok) {
      taxInvoice(`INV-${String(id).padStart(6, "0")}`, user?.full_name || "your account email", `${apiUrl}/api/payments/${id}/receipt`);
    } else {
      notifyError("Receipt Dispatch Error", data.error || "Could not resend tax receipt.");
    }
  };

  const downloadReceipt = async (id: number) => {
    const res = await fetch(`${apiUrl}/api/payments/${id}/receipt`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      notifyError("Invoice Load Failed", data.error || "Could not download receipt.");
      return;
    }
    success("Tax Invoice Opened", "Opening official IRD VAT tax invoice in a new tab.");
    const html = await res.text();
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
  };

  return (
    <main className="min-h-screen bg-slate-50 pb-20">
      <PortalNav subtitle="Hire / rentee portal" />
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900">Hire dashboard</h1>
          <p className="mt-1 text-slate-600">
            Welcome{user?.full_name || user?.name ? `, ${user.full_name || user.name}` : ""}. Track rentals, payments, and owners.
          </p>
        </div>

        {message && <div className="mb-4 rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-700">{message}</div>}

        {!loading && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            <StatWidget
              label="Active rentals"
              value={active.length}
              icon="🚜"
              accentColor="brand"
            />
            <StatWidget
              label="Completed"
              value={completed.length}
              icon="✅"
              accentColor="blue"
            />
            <StatWidget
              label="Outstanding"
              value={`रु${outstanding.toLocaleString()}`}
              icon="⏳"
              accentColor="amber"
            />
            <StatWidget
              label="Paid invoices"
              value={paid.length}
              icon="💳"
              accentColor="emerald"
            />
          </div>
        )}

        <div className="mb-6">
          <AnimatedTabs
            activeTab={tab}
            onChange={(newTab) => setTab(newTab)}
            tabs={[
              { id: "overview" as const, label: "Overview", icon: "📊" },
              { id: "active" as const, label: "Active machinery", badge: active.length, icon: "🚜" },
              { id: "tracking" as const, label: "Live Telematics & GPS", icon: "🗺️" },
              { id: "payments" as const, label: "Payments", badge: paid.length, icon: "💳" },
              { id: "directory" as const, label: "Providers", icon: "👥" },
            ]}
          />
        </div>

        {loading && <p className="text-slate-500">Loading hire activity…</p>}

        {!loading && tab === "overview" && (
          <div className="space-y-3">
            {bookings.slice(0, 8).map((b) => (
              <div key={b.id} className="card p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <p className="font-bold text-slate-900">{b.equipment_title}</p>
                  <p className="text-xs text-slate-500 mt-1">
                    {String(b.start_date).slice(0, 10)} → {String(b.end_date).slice(0, 10)} · {b.status} · {b.payment_status}
                  </p>
                </div>
                <p className="font-bold text-brand-700">रु{Number(b.total_price).toLocaleString()}</p>
              </div>
            ))}
            {bookings.length === 0 && (
              <div className="card p-10 text-center">
                <p className="text-slate-600">No hire activity yet.</p>
                <Link href="/equipment" className="btn-primary mt-4 inline-block">Browse equipment</Link>
              </div>
            )}
          </div>
        )}

        {!loading && tab === "active" && (
          <div className="space-y-3">
            {active.map((b) => {
              const remain = daysUntil(b.end_date);
              return (
                <div key={b.id} className="card p-5">
                  <div className="flex flex-col sm:flex-row sm:justify-between gap-3">
                    <div>
                      <p className="font-bold text-slate-900">{b.equipment_title}</p>
                      <p className="text-xs text-slate-500 mt-1">
                        Site: {b.deployment_location || b.location || "—"}
                      </p>
                      <p className="text-xs text-slate-600 mt-2">
                        Owner: {b.owner_name || "—"} {b.owner_phone ? `· ${b.owner_phone}` : ""}{" "}
                        <span className="ml-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">Verified</span>
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        {String(b.start_date).slice(0, 10)} to {String(b.end_date).slice(0, 10)}
                      </p>
                    </div>
                    <p className={`text-sm font-semibold ${remain < 0 ? "text-red-600" : "text-slate-700"}`}>
                      {remain < 0 ? `Return overdue by ${Math.abs(remain)} day(s)` : `Return due in ${remain} day(s)`}
                    </p>
                  </div>
                </div>
              );
            })}
            {active.length === 0 && <p className="text-slate-500">No active machinery right now.</p>}
          </div>
        )}

        {!loading && tab === "tracking" && (
          <div className="space-y-4">
            <EquipmentTrackingMap
              equipmentTitle={active.length > 0 ? active[0].equipment_title : "Volvo EC950F Crawler Heavy Excavator"}
              selectedDestinationName={active.length > 0 ? active[0].deployment_location : "Kathmandu Ring Road Project Site"}
            />
          </div>
        )}

        {!loading && tab === "payments" && (
          <div className="card overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-slate-500">
                <tr>
                  <th className="p-3">Invoice</th>
                  <th className="p-3">Machine</th>
                  <th className="p-3">Amount</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => (
                  <tr key={b.id} className="border-t border-slate-100">
                    <td className="p-3">INV-{String(b.id).padStart(6, "0")}</td>
                    <td className="p-3">{b.equipment_title}</td>
                    <td className="p-3">रु{Number(b.total_price).toLocaleString()}</td>
                    <td className="p-3 capitalize">{b.payment_status}</td>
                    <td className="p-3 space-x-2">
                      {b.payment_status === "paid" ? (
                        <>
                          <MagneticButton className="text-brand-700 font-semibold px-2 py-1 text-xs" onClick={() => downloadReceipt(b.id)}>Download</MagneticButton>
                          <MagneticButton className="text-slate-600 px-2 py-1 text-xs" onClick={() => resendReceipt(b.id)}>Resend</MagneticButton>
                        </>
                      ) : ["Approved", "Active"].includes(b.status) ? (
                        <Link href="/bookings" className="text-indigo-700 font-semibold">Pay with QR</Link>
                      ) : (
                        "—"
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && tab === "directory" && (
          <div>
            <div className="mb-4 flex justify-between">
              <h2 className="text-xl font-bold">Available providers</h2>
              <Link href="/equipment" className="btn-primary text-xs">Browse catalog</Link>
            </div>
            <div className="card overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-left text-slate-500">
                  <tr>
                    <th className="p-3">Name</th>
                    <th className="p-3">Email</th>
                    <th className="p-3">Phone</th>
                  </tr>
                </thead>
                <tbody>
                  {providers.map((u) => (
                    <tr key={u.id} className="border-t border-slate-100">
                      <td className="p-3 font-medium">{u.full_name}</td>
                      <td className="p-3">{u.email}</td>
                      <td className="p-3">{u.phone_number}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
