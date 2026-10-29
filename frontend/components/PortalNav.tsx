"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type StoredUser = {
  full_name?: string;
  name?: string;
  email?: string;
  role?: string;
  user_type?: string;
};

export default function PortalNav({ subtitle }: { subtitle?: string }) {
  const router = useRouter();
  const [user, setUser] = useState<StoredUser | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("equipshare_user");
    if (!stored) return;
    try {
      setUser(JSON.parse(stored));
    } catch (_) {}
  }, []);

  const role = (user?.role || user?.user_type || "").toLowerCase();
  const isOwner = ["owner", "both", "admin"].includes(role);
  const isHire = ["renter", "both", "admin"].includes(role);
  const isAdmin = role === "admin";

  const logout = () => {
    localStorage.removeItem("equipshare_token");
    localStorage.removeItem("equipshare_user");
    router.push("/");
  };

  return (
    <header className="mx-auto max-w-7xl px-6 py-6">
      <nav className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-700 text-lg font-bold text-white">E</div>
          <div>
            <p className="text-lg font-semibold text-slate-900">EquipShare</p>
            <p className="text-xs text-slate-500">{subtitle || "Rent heavy equipment smarter"}</p>
          </div>
        </Link>
        <div className="flex flex-wrap items-center gap-3 text-sm font-semibold text-slate-700">
          <Link href="/equipment" className="hover:text-slate-900">Catalog</Link>
          {isHire && <Link href="/hire/dashboard" className="hover:text-slate-900">Hire dashboard</Link>}
          {isOwner && <Link href="/owner/dashboard" className="hover:text-slate-900">Lister dashboard</Link>}
          <Link href="/bookings" className="hover:text-slate-900">Bookings</Link>
          {isAdmin && <Link href="/admin/users" className="hover:text-slate-900">Admin</Link>}
          {user ? (
            <button onClick={logout} className="text-red-600 hover:underline">Logout</button>
          ) : (
            <Link href="/login" className="hover:text-slate-900">Login</Link>
          )}
        </div>
      </nav>
    </header>
  );
}
