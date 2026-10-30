"use client";

import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { jwtDecode } from "jwt-decode";
import { MagneticButton } from "../../components/smoothui";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [authorized, setAuthorized] = useState(false);
  const [adminUser, setAdminUser] = useState<any>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("equipshare_user");
    const storedToken = localStorage.getItem("equipshare_token");

    if (!storedToken || !storedUser) {
      router.replace("/login?redirect=/admin");
      return;
    }

    try {
      const parsed = JSON.parse(storedUser);
      let userRole = (parsed.role || parsed.user_type || "").toLowerCase();

      if (!userRole && storedToken) {
        const decoded: any = jwtDecode(storedToken);
        userRole = (decoded.role || decoded.userType || "").toLowerCase();
      }

      // Check admin authorization
      if (userRole === "admin") {
        setAdminUser(parsed);
        setAuthorized(true);
      } else {
        // If not admin, gracefully route to owner or hire dashboard
        if (["owner", "both"].includes(userRole)) {
          router.replace("/owner/dashboard");
        } else {
          router.replace("/hire/dashboard");
        }
      }
    } catch (e) {
      router.replace("/login");
    }
  }, [router]);

  if (!authorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-400 border-t-transparent" />
          <p className="text-xs font-semibold text-slate-400 tracking-wider uppercase">
            Verifying Admin Security Clearance...
          </p>
        </div>
      </div>
    );
  }

  const navLinks = [
    { label: "Command Center", href: "/admin", icon: "⚡" },
    { label: "Analytics & VAT", href: "/admin/analytics", icon: "📊" },
    { label: "User Directory", href: "/admin/users", icon: "👥" },
    { label: "Machinery Fleet", href: "/admin/equipment", icon: "🚜" },
    { label: "Rentals & Tax Invoices", href: "/admin/bookings", icon: "📑" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col md:flex-row">
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex w-64 flex-col justify-between bg-slate-900 text-white p-5 border-r border-slate-800 shadow-xl shrink-0 min-h-screen sticky top-0 h-screen">
        <div>
          {/* Logo & Platform Info */}
          <Link href="/admin" className="flex items-center gap-3 group pb-6 border-b border-slate-800">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white font-black text-lg shadow-md group-hover:scale-105 transition-transform">
              E
            </div>
            <div>
              <p className="font-black text-sm text-white tracking-wide">EquipShare Admin</p>
              <p className="text-[10px] text-emerald-400 font-semibold tracking-wider">PAN: 610394821</p>
            </div>
          </Link>

          {/* Navigation Items */}
          <nav className="mt-6 space-y-1.5">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? "bg-emerald-600/90 text-white shadow-md shadow-emerald-900/30"
                      : "text-slate-400 hover:bg-slate-800 hover:text-white"
                  }`}
                >
                  <span className="text-base">{link.icon}</span>
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Profile & Return to Site */}
        <div className="pt-4 border-t border-slate-800 space-y-3">
          <div className="flex items-center gap-3 px-2">
            <div className="h-8 w-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-xs text-emerald-400">
              {adminUser?.full_name?.[0] || adminUser?.name?.[0] || "A"}
            </div>
            <div className="truncate">
              <p className="text-xs font-bold text-white truncate">
                {adminUser?.full_name || adminUser?.name || "System Admin"}
              </p>
              <span className="text-[10px] text-slate-400 font-mono">Superuser Access</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/" className="w-full">
              <button className="w-full text-center py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-[11px] font-bold text-slate-300 transition">
                🌐 Public Website
              </button>
            </Link>
          </div>
        </div>
      </aside>

      {/* Mobile Top Navbar */}
      <div className="md:hidden flex items-center justify-between bg-slate-900 text-white px-5 py-3.5 border-b border-slate-800 sticky top-0 z-40">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 font-black text-white text-sm">
            E
          </div>
          <div>
            <p className="font-bold text-xs">EquipShare Admin</p>
            <p className="text-[9px] text-emerald-400">PAN: 610394821</p>
          </div>
        </div>

        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-lg bg-slate-800 text-slate-200 text-sm"
          aria-label="Toggle navigation menu"
        >
          {sidebarOpen ? "✕" : "☰"}
        </button>
      </div>

      {/* Mobile Drawer Menu */}
      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex">
          <div className="w-64 bg-slate-900 h-full p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <span className="font-bold text-white text-sm">Admin Navigation</span>
                <button onClick={() => setSidebarOpen(false)} className="text-slate-400">✕</button>
              </div>
              <nav className="mt-4 space-y-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setSidebarOpen(false)}
                    className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold text-slate-300 hover:bg-slate-800"
                  >
                    <span>{link.icon}</span>
                    <span>{link.label}</span>
                  </Link>
                ))}
              </nav>
            </div>
            <Link href="/" className="btn-secondary text-xs text-center py-2 rounded-xl">
              Back to Site
            </Link>
          </div>
          <div className="flex-1" onClick={() => setSidebarOpen(false)} />
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 p-6 sm:p-8 max-w-7xl mx-auto w-full overflow-x-hidden">
        {children}
      </main>
    </div>
  );
}
